import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export class AdminRoadmapConfigController {
  private static configPath = path.resolve(__dirname, '../../config/roadmapConfig.json');

  // Lấy toàn bộ cấu hình roadmap
  static async getRoadmapConfig(req: Request, res: Response) {
    try {
      const configData = fs.readFileSync(AdminRoadmapConfigController.configPath, 'utf8');
      const config = JSON.parse(configData);

      return res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error reading roadmap config:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể đọc cấu hình roadmap'
      });
    }
  }

  // Cập nhật cấu hình ngưỡng level
  static async updateLevelThresholds(req: Request, res: Response) {
    try {
      const { levelThresholds } = req.body;

      if (!levelThresholds) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu cập nhật không hợp lệ'
        });
      }

      // Đọc cấu hình hiện tại
      const configData = fs.readFileSync(AdminRoadmapConfigController.configPath, 'utf8');
      const config = JSON.parse(configData);

      // Cập nhật ngưỡng level
      config.levelThresholds = levelThresholds;

      // Lưu lại cấu hình
      fs.writeFileSync(AdminRoadmapConfigController.configPath, JSON.stringify(config, null, 2), 'utf8');

      return res.json({
        success: true,
        message: 'Cập nhật ngưỡng level thành công',
        data: config.levelThresholds
      });
    } catch (error) {
      console.error('Error updating level thresholds:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật ngưỡng level'
      });
    }
  }

  // Cập nhật phương pháp học
  static async updateLearningMethods(req: Request, res: Response) {
    try {
      const { level, methods } = req.body;

      if (!level || !methods || !Array.isArray(methods)) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu cập nhật không hợp lệ'
        });
      }

      // Đọc cấu hình hiện tại
      const configData = fs.readFileSync(AdminRoadmapConfigController.configPath, 'utf8');
      const config = JSON.parse(configData);

      // Cập nhật phương pháp học cho level tương ứng
      config.learningMethodTemplates[level] = methods;

      // Lưu lại cấu hình
      fs.writeFileSync(AdminRoadmapConfigController.configPath, JSON.stringify(config, null, 2), 'utf8');

      return res.json({
        success: true,
        message: 'Cập nhật phương pháp học thành công',
        data: config.learningMethodTemplates[level]
      });
    } catch (error) {
      console.error('Error updating learning methods:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật phương pháp học'
      });
    }
  }

  // Cập nhật nội dung giai đoạn
  static async updatePhaseContent(req: Request, res: Response) {
    try {
      const { phase, level, content } = req.body;

      if (!phase || !level || !content) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu cập nhật không hợp lệ'
        });
      }

      // Đọc cấu hình hiện tại
      const configData = fs.readFileSync(AdminRoadmapConfigController.configPath, 'utf8');
      const config = JSON.parse(configData);

      // Cập nhật nội dung cho giai đoạn và level tương ứng
      config.phaseTemplates[phase][level] = content;

      // Lưu lại cấu hình
      fs.writeFileSync(AdminRoadmapConfigController.configPath, JSON.stringify(config, null, 2), 'utf8');

      return res.json({
        success: true,
        message: 'Cập nhật nội dung giai đoạn thành công',
        data: config.phaseTemplates[phase][level]
      });
    } catch (error) {
      console.error('Error updating phase content:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật nội dung giai đoạn'
      });
    }
  }

  // Cập nhật tài nguyên học tập
  static async updateResources(req: Request, res: Response) {
    try {
      const { level, resources } = req.body;

      if (!level || !resources) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu cập nhật không hợp lệ'
        });
      }

      // Đọc cấu hình hiện tại
      const configData = fs.readFileSync(AdminRoadmapConfigController.configPath, 'utf8');
      const config = JSON.parse(configData);

      // Cập nhật tài nguyên cho level tương ứng
      config.resources[level] = resources;

      // Lưu lại cấu hình
      fs.writeFileSync(AdminRoadmapConfigController.configPath, JSON.stringify(config, null, 2), 'utf8');

      return res.json({
        success: true,
        message: 'Cập nhật tài nguyên học tập thành công',
        data: config.resources[level]
      });
    } catch (error) {
      console.error('Error updating resources:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật tài nguyên học tập'
      });
    }
  }

  // Khôi phục cấu hình mặc định
  static async resetConfig(req: Request, res: Response) {
    try {
      // Đọc file cấu hình mặc định
      const defaultConfigPath = path.resolve(__dirname, '../../config/defaultRoadmapConfig.json');
      
      if (fs.existsSync(defaultConfigPath)) {
        const defaultConfigData = fs.readFileSync(defaultConfigPath, 'utf8');
        
        // Ghi đè cấu hình hiện tại bằng cấu hình mặc định
        fs.writeFileSync(AdminRoadmapConfigController.configPath, defaultConfigData, 'utf8');
        
        return res.json({
          success: true,
          message: 'Đã khôi phục cấu hình mặc định',
          data: JSON.parse(defaultConfigData)
        });
      } else {
        // Nếu không có file cấu hình mặc định, sao chép cấu hình hiện tại làm mặc định
        const currentConfig = fs.readFileSync(AdminRoadmapConfigController.configPath, 'utf8');
        fs.writeFileSync(defaultConfigPath, currentConfig, 'utf8');
        
        return res.json({
          success: true,
          message: 'Đã tạo cấu hình mặc định từ cấu hình hiện tại',
          data: JSON.parse(currentConfig)
        });
      }
    } catch (error) {
      console.error('Error resetting config:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể khôi phục cấu hình mặc định'
      });
    }
  }
} 