import express from 'express';
import { grammarExerciseController } from '../../controllers/admin/admin.grammarExerciseController';

const router = express.Router();

// GET /api/admin/exercises/:exerciseId/questions - Lấy tất cả questions trong exercise
router.get('/:grammarTopicId/exercises', grammarExerciseController.getExercisesByGrammarTopicId);

// POST /api/admin/exercises/:exerciseId/questions - Thêm question vào exercise
router.post('/:grammarTopicId/exercises', grammarExerciseController.addExerciseToGrammarTopic);

// DELETE /api/admin/exercises/:exerciseId/questions/:questionId - Xóa question khỏi exercise
router.delete('/:grammarTopicId/exercises/:questionId', grammarExerciseController.removeExerciseFromGrammarTopic);

// GET /api/admin/exercises/questions - Lấy tất cả questions
router.get('/exercises/all', grammarExerciseController.getAllExercises);

// GET /api/admin/exercises/:exerciseId/available-questions - Lấy danh sách questions chưa được thêm vào exercise
router.get('/:grammarTopicId/available-exercises', grammarExerciseController.getExercisesNotInGrammarTopic);

export default router;