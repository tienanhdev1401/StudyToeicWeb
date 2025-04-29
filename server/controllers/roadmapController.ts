import { Request, Response } from 'express';
import { RoadmapRepository } from '../repositories/roadmapRepository';
import { LearningGoalRepository } from '../repositories/learningGoalRepostitory';
import { Roadmap } from '../models/Roadmap';
import { generateToeicRoadmap } from '../service/roadmapService';

export class RoadmapController {
  // Lấy roadmap theo LearnerId
  static async getRoadmapByLearnerId(req: Request, res: Response) {
    try {
      const { learnerId } = req.params;

      // Kiểm tra learnerId có hợp lệ không
      if (!learnerId || isNaN(Number(learnerId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid learner ID'
        });
      }

      // Lấy roadmap từ repository
      const roadmap = await RoadmapRepository.getRoadmapByLearnerId(Number(learnerId));
      
      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: 'Roadmap not found for this learner'
        });
      }

      return res.json({
        success: true,
        data: roadmap
      });
    } catch (error) {
      console.error('Error getting roadmap:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get roadmap'
      });
    }
  }

  // Tạo hoặc cập nhật roadmap dựa trên mục tiêu học tập
  static async generateRoadmap(req: Request, res: Response) {
    try {
      const { learnerId } = req.params;
      
      // Kiểm tra learnerId có hợp lệ không
      if (!learnerId || isNaN(Number(learnerId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid learner ID'
        });
      }

      // Lấy learning goal của user
      const learningGoal = await LearningGoalRepository.getLearningGoalByLearnerId(Number(learnerId));
      
      if (!learningGoal) {
        return res.status(404).json({
          success: false,
          message: 'Learning goal not found. Please set learning goal first.'
        });
      }

      // Kiểm tra xem user đã có roadmap chưa
      const existingRoadmap = await RoadmapRepository.getRoadmapByLearnerId(Number(learnerId));
      
      // Tạo nội dung roadmap dựa trên mục tiêu học tập
      const roadmapContent = await generateToeicRoadmap(learningGoal);
      const title = `Lộ trình học TOEIC - Mục tiêu ${learningGoal.scoreTarget} điểm trong ${learningGoal.duration} ngày`;
      
      if (existingRoadmap) {
        // Cập nhật roadmap nếu đã tồn tại
        existingRoadmap.tittle = title;
        existingRoadmap.content = roadmapContent;
        existingRoadmap.updatedAt = new Date();
        
        const isUpdated = await RoadmapRepository.updateRoadmap(existingRoadmap);
        
        if (!isUpdated) {
          return res.status(500).json({
            success: false,
            message: 'Failed to update roadmap'
          });
        }

        return res.json({
          success: true,
          data: existingRoadmap,
          message: 'Roadmap has been updated successfully'
        });
      } else {
        // Tạo mới roadmap nếu chưa tồn tại
        const newRoadmap = new Roadmap(
          0,
          title,
          roadmapContent,
          new Date(),
          null,
          Number(learnerId)
        );
        
        const createdRoadmap = await RoadmapRepository.createRoadmap(newRoadmap);
        
        return res.status(201).json({
          success: true,
          data: createdRoadmap,
          message: 'Roadmap has been created successfully'
        });
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate roadmap'
      });
    }
  }

  // Cập nhật roadmap (thủ công)
  static async updateRoadmap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tittle, content, learnerId } = req.body;

      // Kiểm tra roadmap có tồn tại không
      const existingRoadmap = await RoadmapRepository.getRoadmapById(Number(id));
      
      if (!existingRoadmap) {
        return res.status(404).json({
          success: false,
          message: 'Roadmap not found'
        });
      }

      // Cập nhật roadmap
      const roadmapToUpdate = new Roadmap(
        Number(id),
        tittle,
        content,
        existingRoadmap.createdAt,
        new Date(),
        learnerId
      );

      const isUpdated = await RoadmapRepository.updateRoadmap(roadmapToUpdate);
      
      if (!isUpdated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update roadmap'
        });
      }

      return res.json({
        success: true,
        data: roadmapToUpdate,
        message: 'Roadmap has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating roadmap:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Xóa roadmap
  static async deleteRoadmap(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Kiểm tra roadmap có tồn tại không
      const existingRoadmap = await RoadmapRepository.getRoadmapById(Number(id));
      
      if (!existingRoadmap) {
        return res.status(404).json({
          success: false,
          message: 'Roadmap not found'
        });
      }

      // Xóa roadmap
      const isDeleted = await RoadmapRepository.deleteRoadmap(Number(id));
      
      if (!isDeleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete roadmap'
        });
      }

      return res.json({
        success: true,
        message: 'Roadmap has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
} 