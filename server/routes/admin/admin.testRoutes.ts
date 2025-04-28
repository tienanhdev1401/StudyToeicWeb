import { Router } from 'express';
import { Request, Response } from 'express';
import { AdminTestController } from '../../controllers/admin/admin.testController';
import { checkAuthenticated } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/roleMiddleware';

const router = Router();


// Middleware để kiểm tra xác thực và quyền admin
const adminAuthMiddleware = [checkAuthenticated, isAdmin];


// Lấy bài test theo ID
router.get('/:id',  AdminTestController.getTestById);

// Tạo mới bài test
router.post('/', AdminTestController.createTest);

// Cập nhật bài test
router.put('/:id',  AdminTestController.updateTest);

// Xóa bài test
router.delete('/:id',  AdminTestController.deleteTest);

// Thêm part vào bài test
router.post('/:id/parts', AdminTestController.addPartToTest);

// Lấy danh sách test collections
router.get('/collections/all',  AdminTestController.getTestCollections);


// Lấy tất cả bài test
router.get('/',  AdminTestController.getAllTests);

export default router;
