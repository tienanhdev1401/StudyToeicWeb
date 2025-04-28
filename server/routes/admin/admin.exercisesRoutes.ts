import express from 'express';
import { exerciseController } from '../../controllers/admin/admin.exerciseController';
import { exerciseQuestionController } from '../../controllers/admin/admin.exerciseQuestionController';

const router = express.Router();

// GET /api/admin/exercises/:exerciseId/questions - Lấy tất cả questions trong exercise
router.get('/:exerciseId/questions', exerciseQuestionController.getAllQuestionsByExerciseId);

// GET /api/admin/exercises - Lấy tất cả exercises
router.get('/', exerciseController.getAllExercises);

// GET /api/admin/exercises/:id - Lấy exercise theo ID
router.get('/:id', exerciseController.findExerciseById);

// POST /api/admin/exercises - Thêm mới exercise
router.post('/', exerciseController.addExercise);

// PUT /api/admin/exercises/:id - Cập nhật exercise
router.put('/:id', exerciseController.updateExercise);

// DELETE /api/admin/exercises/:id - Xóa exercise
router.delete('/:id', exerciseController.deleteExercise);

export default router;