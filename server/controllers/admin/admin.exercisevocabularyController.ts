import { Request, Response } from 'express';
import { exercisevocabularyRepository } from '../../repositories/admin/admin.exercisevocabularyRepository';
import { VocabularyTopic } from '../../models/VocabularyTopic';
import { ExerciseTopic } from '../../models/ExerciseTopic';

export class ExerciseVocabularyController {
  
  /**
   * Lấy tất cả chủ đề grammar
   */
  static async getAllVocabularyTopicsExerciseVocabulary(req: Request, res: Response) {
    try {
      const topics = await exercisevocabularyRepository.getAllVocabularyTopics();
  
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
  static async findVocabularyTopicByIdExerciseVocabulary(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      // Gọi repository
      const topic = await exercisevocabularyRepository.findById(id);
      
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
  static async getAllExercisesExerciseVocabulary(req: Request, res: Response) {
    try {
      const exercises = await exercisevocabularyRepository.getAllExercises();
  
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
  static async getExercisesByVocabularyTopicIdExerciseVocabulary(req: Request, res: Response) {
    try {
      const vocabularyTopicId = parseInt(req.params.vocabularyTopicId);
      if (isNaN(vocabularyTopicId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chủ đề grammar không hợp lệ',
        });
      }

      const exercises = await exercisevocabularyRepository.getAllExerciseByVocabularyTopicId(vocabularyTopicId);
      
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
  static async addExerciseToVocabularyTopicExerciseVocabulary(req: Request, res: Response) {
    try {
      const vocabularyTopicId = parseInt(req.params.vocabularyTopicId);
      const { exerciseId } = req.body;
      
      if (isNaN(vocabularyTopicId) || isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }
      
      const success = await exercisevocabularyRepository.addVocabularyExercise(vocabularyTopicId, exerciseId);

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
   * Xóa exercise khỏi vocabulary topic
   */
  static async removeExerciseFromVocabularyTopicExerciseVocabulary(req: Request, res: Response) {
    try {
      const vocabularyTopicId = parseInt(req.params.vocabularyTopicId);
      const exerciseId = parseInt(req.params.exerciseId);
      
      if (isNaN(vocabularyTopicId) || isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ',
        });
      }

      const success = await exercisevocabularyRepository.deleteVocabularyExercise(vocabularyTopicId, exerciseId);

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
  static async getExercisesNotInVocabularyTopicExerciseVocabulary(req: Request, res: Response) {
    try {
      const vocabularyTopicId = parseInt(req.params.vocabularyTopicId);
      
      if (isNaN(vocabularyTopicId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chủ đề grammar không hợp lệ',
        });
      }

      const exercises = await exercisevocabularyRepository.getExercisesNotInVocabularyTopic(vocabularyTopicId);
      
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

export default new ExerciseVocabularyController();