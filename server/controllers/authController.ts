import { Request, Response } from 'express';
import { User } from '../models/User';
import { authRepository } from '../repositories/authRepository';
import jwt from 'jsonwebtoken';

export class AuthController {
 

  // Đăng nhập
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
        return;
      }
      
      // Tìm người dùng
      const user = await authRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        return;
      }
      
      // Kiểm tra mật khẩu
      if (!user.checkPassword(password)) {
        res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        return;
      }
      
      // Tạo JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '5h' } 
      );

      // Trả về token và thông tin người dùng
      res.status(200).json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  }

  // Đăng xuất
  logout(_req: Request, res: Response): void {
    res.status(200).json({ message: 'Đăng xuất thành công' });
  }
}

export default new AuthController();