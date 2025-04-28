import { Router } from 'express';
import { ResourceController } from '../../controllers/admin/admin.resourceController';

const router = Router();

// Lấy tất cả câu hỏi của một part
router.post('/', ResourceController.create);



export default router;