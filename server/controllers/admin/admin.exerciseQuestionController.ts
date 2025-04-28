import { Request, Response } from 'express';
import { exercisesQuestionRepository } from '../../repositories/admin/admin.exercisesQuestionRepository';
import { ExerciseTopic } from '../../models/ExerciseTopic';
import { Exercise } from '../../models/Exercise';

export class exerciseQuestionController {
  /**
   * Lấy tất cả questions trong một exercise
   */
  static async getAllQuestionsByExerciseId(req: Request, res: Response) {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      
      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài tập không hợp lệ'
        });
      }
      
      const questions = await exercisesQuestionRepository.getAllQuestionsByExerciseId(exerciseId);
      
      res.status(200).json({
        success: true,
        data: questions,
        message: 'Lấy danh sách câu hỏi thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách câu hỏi:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách câu hỏi'
      });
    }
  }

  /**
   * Thêm một question vào exercise
   */
  static async addExercisesQuestion(req: Request, res: Response) {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      const { questionId } = req.body;
      
      if (isNaN(exerciseId) || isNaN(questionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài tập hoặc ID câu hỏi không hợp lệ'
        });
      }
      
      const result = await exercisesQuestionRepository.addExercisesQuestion(exerciseId, questionId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài tập hoặc câu hỏi'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Thêm câu hỏi vào bài tập thành công'
      });
    } catch (error) {
      console.error('Lỗi khi thêm câu hỏi vào bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi thêm câu hỏi vào bài tập',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Xóa một question khỏi exercise
   */
  static async deleteExercisesQuestion(req: Request, res: Response) {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      const questionId = parseInt(req.params.questionId);
      
      if (isNaN(exerciseId) || isNaN(questionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài tập hoặc ID câu hỏi không hợp lệ'
        });
      }
      
      const result = await exercisesQuestionRepository.deleteExercisesQuestion(exerciseId, questionId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy liên kết giữa bài tập và câu hỏi'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Xóa câu hỏi khỏi bài tập thành công'
      });
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi khỏi bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa câu hỏi khỏi bài tập'
      });
    }
  }

  /**
   * Lấy tất cả questions từ bảng questions
   */
  static async getAllQuestions(req: Request, res: Response) {
    try {
      const questions = await exercisesQuestionRepository.getAllQuestions();
      
      res.status(200).json({
        success: true,
        data: questions,
        message: 'Lấy danh sách tất cả câu hỏi thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tất cả câu hỏi:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách tất cả câu hỏi'
      });
    }
  }

  /**
   * Lấy danh sách questions chưa được thêm vào exercise
   */
  static async getQuestionsNotInExercise(req: Request, res: Response) {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      
      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài tập không hợp lệ'
        });
      }
      
      const questions = await exercisesQuestionRepository.getQuestionsNotInExercise(exerciseId);
      
      res.status(200).json({
        success: true,
        data: questions,
        message: 'Lấy danh sách câu hỏi chưa thêm vào bài tập thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách câu hỏi chưa thêm vào bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách câu hỏi chưa thêm vào bài tập'
      });
    }
  }
}

export default new exerciseQuestionController();