import { Router } from 'express';
import { TestController } from '../controllers/testController';

const router = Router();
const testController = new TestController();

// Lấy bài kiểm tra theo ID kèm theo tất cả các thông tin chi tiết 
router.get('/:id', (req, res) => testController.getTestById(req, res));

// Lấy danh sách tất cả bài kiểm tra
router.get('/', (req, res) => testController.getAllTests(req, res));

export default router;