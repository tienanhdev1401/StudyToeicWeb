import { Request, Response, NextFunction } from 'express';

interface CustomRequest extends Request {
  user?: any;
}

// Middleware để kiểm tra người dùng có quyền Admin
export function isAdmin(req: CustomRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: 'Không có thông tin xác thực' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Không có quyền truy cập' });
    return;
  }

  next();
} 