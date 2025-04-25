import { Router } from 'express';
import { Request, Response } from 'express';
import { AdminTestController } from '../../controllers/admin/admin.testController';
import { checkAuthenticated } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/roleMiddleware';

const router = Router();
const adminTestController = new AdminTestController();

// Middleware để kiểm tra xác thực và quyền admin
const adminAuthMiddleware = [checkAuthenticated, isAdmin];

// Lấy tất cả bài test
router.get('/', adminAuthMiddleware, (req: Request, res: Response) => adminTestController.getAllTests(req, res));

// Lấy bài test theo ID
router.get('/:id', adminAuthMiddleware, (req: Request, res: Response) => adminTestController.getTestById(req, res));

// Tạo mới bài test
router.post('/', adminAuthMiddleware, (req: Request, res: Response) => adminTestController.createTest(req, res));

// Cập nhật bài test
router.put('/:id', adminAuthMiddleware, (req: Request, res: Response) => adminTestController.updateTest(req, res));

// Xóa bài test
router.delete('/:id', adminAuthMiddleware, (req: Request, res: Response) => adminTestController.deleteTest(req, res));

// Thêm part vào bài test
router.post('/:id/parts', adminAuthMiddleware, (req: Request, res: Response) => adminTestController.addPartToTest(req, res));

// Lấy danh sách test collections
router.get('/collections/all', adminAuthMiddleware, (req: Request, res: Response) => adminTestController.getTestCollections(req, res));

export default router;
