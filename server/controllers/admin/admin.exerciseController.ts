import { Request, Response } from 'express';
import { exercisesRepository } from '../../repositories/admin/admin.exercisesRepository';

export class exerciseController {
  /**
   * Lấy tất cả exercises
   */
  static async getAllExercises(req: Request, res: Response) {
    try {
      const exercises = await exercisesRepository.getAllExercises();
  
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
   * Tìm exercise theo ID
   */
  static async findExerciseById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      // Gọi repository
      const exercise = await exercisesRepository.findById(id);
      
      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài tập' 
        });
      }
  
      // Trả về response thành công
      res.status(200).json({
        success: true,
        data: exercise,
        message: 'Lấy thông tin bài tập thành công'
      });
  
    } catch (error) {
      console.error('Lỗi khi lấy thông tin bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin bài tập'
      });
    }
  }

  /**
   * Thêm mới exercise
   */
  static async addExercise(req: Request, res: Response) {
    try {
      // Lấy dữ liệu từ request body
      const { exerciseName } = req.body;
      
      // Validate exerciseName
      if (!exerciseName || exerciseName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Tên bài tập không được để trống'
        });
      }
      
      // Gọi repository để thêm vào database
      const createdExercise = await exercisesRepository.addExercise(exerciseName);

      // Trả về kết quả
      res.status(201).json({
        success: true,
        message: 'Tạo bài tập thành công',
        data: createdExercise
      });
    } catch (error) {
      console.error('Lỗi khi tạo bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi tạo bài tập',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cập nhật exercise
   */
  static async updateExercise(req: Request, res: Response) {
    try {
      // Lấy ID từ tham số route
      const exerciseId = parseInt(req.params.id);
      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài tập không hợp lệ',
        });
      }

      // Lấy thông tin exercise hiện tại
      const existingExercise = await exercisesRepository.findById(exerciseId);
      if (!existingExercise) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài tập',
        });
      }

      // Lấy dữ liệu từ request body
      const { exerciseName } = req.body;
      
      // Validate exerciseName
      if (!exerciseName || exerciseName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Tên bài tập không được để trống'
        });
      }
      
      // Gọi repository để cập nhật vào database
      const result = await exercisesRepository.updateExercise(exerciseId, exerciseName);

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: 'Cập nhật bài tập thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật bài tập',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Xóa exercise
   */
  static async deleteExercise(req: Request, res: Response) {
    try {
      // Lấy ID từ tham số route
      const exerciseId = parseInt(req.params.id);
      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài tập không hợp lệ',
        });
      }

      // Kiểm tra xem exercise có tồn tại không
      const existingExercise = await exercisesRepository.findById(exerciseId);
      if (!existingExercise) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài tập',
        });
      }

      // Gọi repository để xóa exercise
      await exercisesRepository.deleteExercise(exerciseId);

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: 'Xóa bài tập thành công',
      });
    } catch (error) {
      console.error('Lỗi khi xóa bài tập:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa bài tập',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new exerciseController();