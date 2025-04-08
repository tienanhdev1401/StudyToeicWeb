import express, { Request, Response } from 'express';
import { register, login, logout } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// Route đăng xuất (yêu cầu xác thực)
router.post('/logout', authMiddleware, logout);

// Route kiểm tra trạng thái xác thực
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({ user: (req as any).user }); // hoặc định nghĩa `user` trong interface Request nếu muốn rõ ràng hơn
});

export default router;
