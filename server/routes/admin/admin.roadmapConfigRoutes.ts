import { Router } from 'express';
import { AdminRoadmapConfigController } from '../../controllers/admin/adminRoadmapConfigController'
import { checkAuthenticated } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/roleMiddleware';

const router = Router();




// Lấy toàn bộ cấu hình roadmap
router.get('/',  AdminRoadmapConfigController.getRoadmapConfig);

// Cập nhật ngưỡng level
router.put('/level-thresholds', AdminRoadmapConfigController.updateLevelThresholds);

// Cập nhật phương pháp học
router.put('/learning-methods', AdminRoadmapConfigController.updateLearningMethods);

// Cập nhật nội dung giai đoạn
router.put('/phase-content',  AdminRoadmapConfigController.updatePhaseContent);

// Cập nhật tài nguyên học tập
router.put('/resources',  AdminRoadmapConfigController.updateResources);

// Khôi phục cấu hình mặc định
router.post('/reset',  AdminRoadmapConfigController.resetConfig);

export default router; 