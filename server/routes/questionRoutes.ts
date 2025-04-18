import { Router } from 'express';
import { QuestionController } from '../controllers/questionController';

const router = Router();
const questionController = new QuestionController();

// Lấy câu hỏi theo ID
router.get('/:id', (req, res) => questionController.getById(req, res));

export default router;