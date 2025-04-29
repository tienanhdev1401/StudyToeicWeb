import express from 'express';
import { RoadmapController } from '../controllers/roadmapController';
import { checkAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();

// Lấy roadmap của user theo ID
router.get('/learner/:learnerId', checkAuthenticated, RoadmapController.getRoadmapByLearnerId);

// Tạo hoặc cập nhật roadmap dựa trên learning goal
router.post('/generate/:learnerId', checkAuthenticated, RoadmapController.generateRoadmap);

// Cập nhật roadmap (thủ công)
router.put('/:id', checkAuthenticated, RoadmapController.updateRoadmap);

// Xóa roadmap
router.delete('/:id', checkAuthenticated, RoadmapController.deleteRoadmap);

export default router; 