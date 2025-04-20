import { Request, Response } from 'express';
import { ExerciseRepository } from '../repositories/exerciseRepository';

export class ExerciseController {
  static async getAllExercises(req: Request, res: Response) {
    try {
      const exercises = await ExerciseRepository.getAllExercises();
      res.status(200).json({
        success: true,
        data: exercises,
        message: 'Lấy danh sách exercise thành công'
    });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching exercises'
    });
    }
  }

  static async getExerciseById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const exercise = await ExerciseRepository.findById(id);
      
      if (!exercise) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found'
      });
      }
      
      res.status(200).json({
        success: true,
        data: exercise,
        message: 'Lấy thông tin exercise thành công'
    });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching exercise'
    });
    
    }
  }
}