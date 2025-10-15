import express from 'express';
import adminDashboardController from '../../controllers/admin/admin.dashboardController';
import { checkAuthenticated } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/roleMiddleware';

const router = express.Router();

router.get('/', adminDashboardController.getDashboardStats);

export default router;
