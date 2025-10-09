import { Router } from 'express';
import { AdminLessonController } from '../../controllers/admin/admin.lessonController';
// import { checkAuthenticated } from '../../middleware/authMiddleware';

const router = Router();


router.get('/',  AdminLessonController.list);
router.get('/:id',  AdminLessonController.getById);
router.post('/',  AdminLessonController.create);
router.put('/:id', AdminLessonController.update);
router.patch('/:id/status', AdminLessonController.updateStatus);
router.delete('/:id', AdminLessonController.remove);

export default router;
