import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Route đăng ký
router.post('/register', (req, res) => authController.register(req, res));

// Route đăng nhập
router.post('/login', (req, res) => authController.login(req, res));

// Route đăng xuất (yêu cầu xác thực)
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

// Route kiểm tra trạng thái xác thực
router.get('/me', authenticate, (req: any, res) => {
  res.status(200).json({ user: req.user });
});

 export default router;