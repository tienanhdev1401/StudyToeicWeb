import express, { Request, Response } from 'express';
import { LearningGoalController } from '../controllers/learningGoalController';

const router = express.Router();

// Main endpoints
router.get('/learner/:learnerId', LearningGoalController.getLearningGoalByLearnerId);
router.post('/', LearningGoalController.createLearningGoal);
router.put('/:id', LearningGoalController.updateLearningGoal);

// Có thể thêm các endpoints khác khi cần
// router.delete('/:id', LearningGoalController.delete);

export default router;