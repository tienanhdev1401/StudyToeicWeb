import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';

// Interface mở rộng kiểu của JWT payload
interface CustomJwtPayload extends JwtPayload {
  id: number;
}

export class UserController {
  // Lấy thông tin người dùng hiện tại
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'Bạn chưa đăng nhập' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET as string
      ) as CustomJwtPayload;

      if (!decoded?.id) {
        res.status(401).json({ error: 'Token không hợp lệ' });
        return;
      }

      const user = await userRepository.findById(decoded.id);

      if (!user) {
        res.status(404).json({ error: 'Người dùng không tồn tại' });
        return;
      }

      // Sử dụng toJSON để loại bỏ mật khẩu
      res.status(200).json(user.toJSON());
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }

  // Các phương thức khác có thể được thêm vào sau
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // Logic cập nhật thông tin người dùng
      // ...
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }
}

export default new UserController();