import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import db from '../config/db';
import util from 'util';

// Tạo query promisified từ kết nối db
const query = util.promisify(db.query).bind(db);

// Interface mở rộng kiểu của JWT payload
interface CustomJwtPayload extends JwtPayload {
  id: number;
}

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Bạn chưa đăng nhập' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

    if (!decoded?.id) {
      res.status(401).json({ error: 'Token không hợp lệ' });
      return;
    }

    const results: any[] = await query('SELECT * FROM Users WHERE id = ? LIMIT 1', [decoded.id]);

    if (results.length === 0) {
      res.status(404).json({ error: 'Người dùng không tồn tại' });
      return;
    }

    const user = results[0];

    res.status(200).json({ 
      id: user.id, 
      fullName: user.fullname,
      email: user.emailAddress, 
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      avatar: user.avatar,
      joinAt: user.joinAt,
      status: user.status,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
