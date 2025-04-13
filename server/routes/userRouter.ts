import express, { Request, Response } from 'express';
import userControllers from '../controllers/userController';
const router = express.Router();
import { authenticate } from '../middleware/auth';

// Route gửi mã xác thực
router.post('/send-verification-code', (req, res) => userControllers.sendVerificationCode(req, res));

// Route đăng ký
router.post('/register', (req, res) => userControllers.register(req, res));

// Route lấy thông tin người dùng hiện tại
router.get('/me', authenticate, (req: Request, res: Response) => {
  res.status(200).json({ user: (req as any).user });
});

export default router;