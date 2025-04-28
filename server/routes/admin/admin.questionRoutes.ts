import { Router } from 'express';
import { QuestionController } from '../../controllers/admin/admin.questionController';

const router = Router();

// Lấy tất cả câu hỏi của một part
router.get('/part/:partId', QuestionController.getQuestionsByPartId);

// Lấy câu hỏi theo ID
router.get('/:id', QuestionController.getById);

// Tạo câu hỏi mới cho part
router.post('/parts/:partId', QuestionController.createQuestion);

// Cập nhật câu hỏi
router.put('/parts/:partId/questions/:questionId', QuestionController.updateQuestion);

// Xóa câu hỏi
router.delete('/parts/:partId/questions/:questionId', QuestionController.deleteQuestion);

export default router;