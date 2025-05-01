import express from 'express';
import { ExerciseVocabularyController } from '../../controllers/admin/admin.exercisevocabularyController';

const router = express.Router();

// Lấy tất cả exercise trong grammar topic
router.get('/:vocabularyTopicId/exercises', ExerciseVocabularyController.getExercisesByVocabularyTopicIdExerciseVocabulary);

// GET /api/admin/exercises - Lấy tất cả exercises
router.get('/', ExerciseVocabularyController.getAllVocabularyTopicsExerciseVocabulary);

// GET /api/admin/exercises/:id - Lấy exercise theo ID
router.get('/:id', ExerciseVocabularyController.findVocabularyTopicByIdExerciseVocabulary);

// GET /api/admin/exercises/questions - Lấy tất cả questions
router.get('/exercises/all', ExerciseVocabularyController.getAllExercisesExerciseVocabulary);

// GET /api/admin/exercises/:exerciseId/available-questions - Lấy danh sách questions chưa được thêm vào exercise
router.get('/:vocabularyTopicId/available-exercises', ExerciseVocabularyController.getExercisesNotInVocabularyTopicExerciseVocabulary);

// POST /api/admin/exercisegrammar/:grammarTopicId/exercises - Thêm exercise vào grammar topic
router.post('/:vocabularyTopicId/exercises', ExerciseVocabularyController.addExerciseToVocabularyTopicExerciseVocabulary);

// DELETE /api/admin/exercises/:exerciseId/questions/:questionId - Xóa question khỏi exercise
router.delete('/:vocabularyTopicId/exercises/:exerciseId', ExerciseVocabularyController.removeExerciseFromVocabularyTopicExerciseVocabulary);

export default router;