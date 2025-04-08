import { Request, Response } from 'express';
import { User } from '../models/User';
import { UserRepository } from '../repositories/userRepository';
import jwt from 'jsonwebtoken';

export class AuthController {
  // Đăng ký người dùng mới
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
        return;
      }

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'Email đã được đăng ký' });
        return;
      }

      // Tạo người dùng mới
      const hashedPassword = await UserRepository.hashPassword(password);
      const newUser = new User(email, hashedPassword);
      await UserRepository.save(newUser);

      res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  }

  // Đăng nhập
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
        return;
      }
      
      // Tìm người dùng
      const user = await UserRepository.findByEmail(email);
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