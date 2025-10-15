import { Request, Response } from 'express';
import adminDashboardRepository from '../../repositories/admin/admin.dashboardRepository';

class AdminDashboardController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await adminDashboardRepository.getDashboardStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching dashboard statistics'
      });
    }
  }
}

export default new AdminDashboardController();
