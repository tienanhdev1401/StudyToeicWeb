import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Tùy chỉnh lại interface Request để thêm trường user
interface AuthenticatedRequest extends Request {
  user?: any;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Lấy token từ header Authorization
  const authHeader = req.headers.authorization;

  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // Gán thông tin user vào req
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

export default authMiddleware;
