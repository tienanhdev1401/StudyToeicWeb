import express from 'express';
import { ExerciseController } from '../controllers/exerciseController';

const router = express.Router();

// GET /api/exercises - Get all exercises
router.get('/', ExerciseController.getAllExercises);

// GET /api/exercises/:id - Get a specific exercise by ID
router.get('/:id', ExerciseController.getExerciseById);

// POST /api/exercises - Create a new exercise
router.post('/', ExerciseController.createExercise);

// PUT /api/exercises/:id - Update an exercise
router.put('/:id', ExerciseController.updateExercise);

// DELETE /api/exercises/:id - Delete an exercise
router.delete('/:id', ExerciseController.deleteExercise);

// POST /api/exercises/:exerciseId/questions - Add question to exercise
router.post('/:exerciseId/questions', ExerciseController.addQuestionToExercise);

// DELETE /api/exercises/:exerciseId/questions/:questionId - Remove question from exercise
router.delete('/:exerciseId/questions/:questionId', ExerciseController.removeQuestionFromExercise);

// GET /api/exercises/:exerciseId/questions - Get all questions for an exercise
router.get('/:exerciseId/questions', ExerciseController.getExerciseQuestions);

export default router;