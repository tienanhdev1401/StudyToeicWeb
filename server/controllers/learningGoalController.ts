import { Request, Response } from 'express';
import { LearningGoalRepository } from '../repositories/learningGoalRepostitory';
import { LearningGoal } from '../models/LearningGoal';

export class LearningGoalController {

    static async getLearningGoalByLearnerId(req: Request, res: Response) {
        try {
          const { learnerId } = req.params;
    
          // Kiểm tra learnerId có hợp lệ không
          if (!learnerId || isNaN(Number(learnerId))) {
            return res.status(400).json({
              success: false,
              message: 'Invalid learner ID'
            });
          }
    
          // Lấy learning goal từ repository
          const learningGoal = await LearningGoalRepository.getLearningGoalByLearnerId(Number(learnerId));
          
          if (!learningGoal) {
            return res.status(404).json({
              success: false,
              message: 'Learning goal not found for this learner'
            });
          }
    
          return res.json({
            success: true,
            data: learningGoal
          });
        } catch (error) {
          console.error('Error getting learning goal:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to get learning goal'
          });
        }
      }



  // Tạo mới learning goal
  static async createLearningGoal(req: Request, res: Response) {
    try {
      const { duration, scoreTarget, learnerId } = req.body;

      // Kiểm tra learner đã có learning goal chưa
      const existingGoal = await LearningGoalRepository.getLearningGoalByLearnerId(learnerId);
      
      if (existingGoal) {
        return res.status(400).json({
          success: false,
          message: 'Learner already has a learning goal'
        });
      }

      // Tạo mới learning goal
      const newGoal = new LearningGoal(0, duration, scoreTarget, learnerId);
      const createdGoal = await LearningGoalRepository.createLearningGoal(newGoal);
      
      return res.status(201).json({
        success: true,
        data: createdGoal
      });
    } catch (error) {
      console.error('Error creating learning goal:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create learning goal'
      });
    }
  }

  // Cập nhật learning goal
  static async updateLearningGoal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { duration, scoreTarget, learnerId } = req.body;

      // Kiểm tra learner có learning goal không
      const existingGoal = await LearningGoalRepository.getLearningGoalByLearnerId(learnerId);
      
      if (!existingGoal) {
        return res.status(404).json({
          success: false,
          message: 'Learner does not have a learning goal to update'
        });
      }

      // Kiểm tra ID có khớp với learning goal hiện tại không
      if (existingGoal.id !== Number(id)) {
        return res.status(400).json({
          success: false,
          message: 'Learning goal ID does not match'
        });
      }

      // Cập nhật learning goal
      const goalToUpdate = new LearningGoal(
        Number(id),
        duration,
        scoreTarget,
        learnerId
      );

      const isUpdated = await LearningGoalRepository.updateLearningGoal(goalToUpdate);
      
      if (!isUpdated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update learning goal'
        });
      }

      return res.json({
        success: true,
        data: goalToUpdate
      });
    } catch (error) {
      console.error('Error updating learning goal:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}