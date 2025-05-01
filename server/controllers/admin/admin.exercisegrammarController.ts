import { Request, Response } from 'express';
import { exercisegrammarRepository } from '../../repositories/admin/admin.exercisegrammarRepository';
import { GrammarTopic } from '../../models/GrammarTopic';
import { ExerciseTopic } from '../../models/ExerciseTopic';

export class ExerciseGrammarController {
  
  /**
   * Lấy tất cả chủ đề grammar
   */
  static async getAllGrammarTopicsExercise(req: Request, res: Response) {
    try {
      const topics = await exercisegrammarRepository.getAllGrammarTopics();
  
      res.status(200).json({
        success: true,
        data: topics,
        message: 'Lấy danh sách chủ đề grammar thành công'
      });

    } catch (error) {
      console.error('Lỗi khi lấy danh sách chủ đề grammar:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách chủ đề grammar'
      });
    }
  }

  /**
   * Lấy thông tin chủ đề grammar theo ID
   */
  static async findGrammarTopicByIdExercise(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      // Gọi repository
      const topic = await exercisegrammarRepository.findById(id);
      
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chủ đề grammar' 
        });
      }
  
      // Trả về response thành công
      res.status(200).json({
        success: true,
        data: topic,
        message: 'Lấy thông tin chủ đề grammar thành công'
      });
  
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chủ đề grammar:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin chủ đề grammar'
      });
    }
  }

  /**
   * Lấy tất cả exercises
   */
  static async getAllExercisesExercise(req: Request, res: Response) {
    try {
      const exercises = await exercisegrammarRepository.getAllExercises();
  
      res.status(200).json({
        success: true,
        data: exercises,
        message: 'Lấy danh sách bài tập thành công'
      });

    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách bài tập'
      });
    }
  }

  /**
   * Lấy exercises theo grammar topic ID
   */
  static async getExercisesByGrammarTopicIdExercise(req: Request, res: Response) {
    try {
      const grammarTopicId = parseInt(req.params.grammarTopicId);
      if (isNaN(grammarTopicId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chủ đề grammar không hợp lệ',
        });
      }

      const exercises = await exercisegrammarRepository.getAllExerciseByGrammarTopicId(grammarTopicId);
      
      res.status(200).json({
        success: true,
        data: exercises,
        message: 'Lấy danh sách bài tập thành công'
      });

    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài tập theo chủ đề:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách bài tập theo chủ đề'
      });
    }
  }

  /**
   * Thêm exercise vào grammar topic
   */
  static async addExerciseToGrammarTopicExercise(req: Request, res: Response) {
    try {
      const grammarTopicId = parseInt(req.params.grammarTopicId);
      const { exerciseId } = req.body;
      
      if (isNaN(grammarTopicId) || isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }
      
      const success = await exercisegrammarRepository.addGrammarExercise(grammarTopicId, exerciseId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chủ đề hoặc bài tập',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Thêm bài tập vào chủ đề thành công'
      });
    } catch (error) {
      console.error('Lỗi khi thêm bài tập vào chủ đề:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi thêm bài tập vào chủ đề',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Xóa exercise khỏi grammar topic
   */
  static async removeExerciseFromGrammarTopicExercise(req: Request, res: Response) {
    try {
      const grammarTopicId = parseInt(req.params.grammarTopicId);
      const exerciseId = parseInt(req.params.exerciseId);
      
      if (isNaN(grammarTopicId) || isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ',
        });
      }

      const success = await exercisegrammarRepository.deleteGrammarExercise(grammarTopicId, exerciseId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy liên kết giữa chủ đề và bài tập',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Xóa bài tập khỏi chủ đề thành công',
      });
    } catch (error) {
      console.error('Lỗi khi xóa bài tập khỏi chủ đề:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa bài tập khỏi chủ đề',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Lấy exercises chưa được thêm vào grammar topic
   */
  static async getExercisesNotInGrammarTopicExercise(req: Request, res: Response) {
    try {
      const grammarTopicId = parseInt(req.params.grammarTopicId);
      
      if (isNaN(grammarTopicId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chủ đề grammar không hợp lệ',
        });
      }

      const exercises = await exercisegrammarRepository.getExercisesNotInGrammarTopic(grammarTopicId);
      
      res.status(200).json({
        success: true,
        data: exercises,
        message: 'Lấy danh sách bài tập thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài tập chưa thêm vào chủ đề:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách bài tập chưa thêm vào chủ đề'
      });
    }
  }
}

export default new ExerciseGrammarController();