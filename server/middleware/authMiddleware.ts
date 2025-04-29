import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: any;
}

// Middleware để kiểm tra người dùng đã đăng nhập
export function checkAuthenticated(req: CustomRequest, res: Response, next: NextFunction): void {
  // Lấy token từ header
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    return;
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
} 