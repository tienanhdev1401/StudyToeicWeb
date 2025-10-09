import { Router } from 'express';
import { LessonController } from '../controllers/lessonController';

const router = Router();

router.get('/', LessonController.list);
router.get('/:id', LessonController.getById);

export default router;
