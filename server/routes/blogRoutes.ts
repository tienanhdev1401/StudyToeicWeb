import { Router } from 'express';
import { BlogController } from '../controllers/blogController';

const router = Router();

router.get('/', BlogController.list);
router.get('/:id', BlogController.getById);

export default router;
