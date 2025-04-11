import express, { Request, Response } from 'express';

const router = express.Router();
//import { getUser } from'../controllers/userController';
import { authenticate } from '../middleware/auth';

// Route lấy thông tin người dùng
//router.get('/profile', getUser);

// Route kiểm tra trạng thái xác thực
router.get('/me', authenticate, (req: Request, res: Response) => {
  res.status(200).json({ user: (req as any).user }); // hoặc định nghĩa `user` trong interface Request nếu muốn rõ ràng hơn
});

export default router;