import express, { Request, Response } from 'express';
import { LearnerController } from '../../controllers/admin/admin.LearnerController';

const router = express.Router();

router.get('/', LearnerController.getAllLearners);
router.get('/:id', LearnerController.findLearnerById);
router.post('/', LearnerController.addLearner);
router.put('/:id', LearnerController.updateLearner);
router.put('/block/:id', LearnerController.blockLearner);
router.put('/unblock/:id', LearnerController.unblockLearner);
export default router;