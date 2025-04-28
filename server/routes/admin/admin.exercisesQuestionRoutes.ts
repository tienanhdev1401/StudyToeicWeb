import express from 'express';
import { exerciseQuestionController } from '../../controllers/admin/admin.exerciseQuestionController';

const router = express.Router();

// GET /api/admin/exercises/:exerciseId/questions - Lấy tất cả questions trong exercise
router.get('/:exerciseId/questions', exerciseQuestionController.getAllQuestionsByExerciseId);

// POST /api/admin/exercises/:exerciseId/questions - Thêm question vào exercise
router.post('/:exerciseId/questions', exerciseQuestionController.addExercisesQuestion);

// DELETE /api/admin/exercises/:exerciseId/questions/:questionId - Xóa question khỏi exercise
router.delete('/:exerciseId/questions/:questionId', exerciseQuestionController.deleteExercisesQuestion);

// GET /api/admin/exercises/questions - Lấy tất cả questions
router.get('/questions/all', exerciseQuestionController.getAllQuestions);

// GET /api/admin/exercises/:exerciseId/available-questions - Lấy danh sách questions chưa được thêm vào exercise
router.get('/:exerciseId/available-questions', exerciseQuestionController.getQuestionsNotInExercise);

export default router;