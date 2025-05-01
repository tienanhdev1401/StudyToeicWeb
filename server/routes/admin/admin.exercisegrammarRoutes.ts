import express from 'express';
import { ExerciseGrammarController } from '../../controllers/admin/admin.exercisegrammarController';

const router = express.Router();

// Lấy tất cả exercise trong grammar topic
router.get('/:grammarTopicId/exercises', ExerciseGrammarController.getExercisesByGrammarTopicIdExercise);

// GET /api/admin/exercises - Lấy tất cả exercises
router.get('/', ExerciseGrammarController.getAllGrammarTopicsExercise);

// GET /api/admin/exercises/:id - Lấy exercise theo ID
router.get('/:id', ExerciseGrammarController.findGrammarTopicByIdExercise);

// GET /api/admin/exercises/questions - Lấy tất cả questions
router.get('/exercises/all', ExerciseGrammarController.getAllExercisesExercise);

// GET /api/admin/exercises/:exerciseId/available-questions - Lấy danh sách questions chưa được thêm vào exercise
router.get('/:grammarTopicId/available-exercises', ExerciseGrammarController.getExercisesNotInGrammarTopicExercise);

// POST /api/admin/exercisegrammar/:grammarTopicId/exercises - Thêm exercise vào grammar topic
router.post('/:grammarTopicId/exercises', ExerciseGrammarController.addExerciseToGrammarTopicExercise);

// DELETE /api/admin/exercises/:exerciseId/questions/:questionId - Xóa question khỏi exercise
router.delete('/:grammarTopicId/exercises/:exerciseId', ExerciseGrammarController.removeExerciseFromGrammarTopicExercise);

export default router;