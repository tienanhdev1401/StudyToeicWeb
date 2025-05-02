import express from 'express';
import { LearningProcessController } from '../controllers/LearningProcessController';

const router = express.Router();

// GET /api/learning-process/user/:userId - Lấy tất cả quá trình học tập của user
router.get('/user/:userId', LearningProcessController.getAllLearningProcessByUserId);

// GET /api/learning-process/user/:userId/statistics - Lấy thống kê học tập của user
router.get('/user/:userId/statistics', LearningProcessController.getLearningStatistics);

// POST /api/learning-process/user/:userId/in-progress - Tạo hoặc cập nhật trạng thái "in_progress"
router.post('/user/:userId/in-progress', LearningProcessController.setLearningProcessInProgress);

// PUT /api/learning-process/:processId/completed - Cập nhật trạng thái thành "completed"
router.put('/:processId/completed', LearningProcessController.setLearningProcessCompleted);

export default router; 