import { Request, Response } from 'express';
import { ExerciseRepository } from '../repositories/exerciseRepository';

export class ExerciseController {
  static async getAllExercises(req: Request, res: Response) {
    try {
      const exercises = await ExerciseRepository.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching exercises' });
    }
  }

  static async getExerciseById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const exercise = await ExerciseRepository.findById(id);
      
      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching exercise' });
    }
  }

  static async createExercise(req: Request, res: Response) {
    try {
      const { exerciseName } = req.body;
      const newExercise = await ExerciseRepository.createExercise(exerciseName);
      res.status(201).json(newExercise);
    } catch (error) {
      res.status(500).json({ message: 'Error creating exercise' });
    }
  }

  static async updateExercise(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { exerciseName } = req.body;
      
      const success = await ExerciseRepository.updateExercise(id, exerciseName);
      if (!success) {
        return res.status(404).json({ message: 'Exercise not found' });
      }
      
      res.json({ message: 'Exercise updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating exercise' });
    }
  }

  static async deleteExercise(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const success = await ExerciseRepository.deleteExercise(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Exercise not found' });
      }
      
      res.json({ message: 'Exercise deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting exercise' });
    }
  }

  static async addQuestionToExercise(req: Request, res: Response) {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      const { questionId } = req.body;
      
      const success = await ExerciseRepository.addQuestionToExercise(exerciseId, questionId);
      if (!success) {
        return res.status(400).json({ message: 'Failed to add question to exercise' });
      }
      
      res.json({ message: 'Question added to exercise successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding question to exercise' });
    }
  }

  static async removeQuestionFromExercise(req: Request, res: Response) {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      const questionId = parseInt(req.params.questionId);
      
      const success = await ExerciseRepository.removeQuestionFromExercise(exerciseId, questionId);
      if (!success) {
        return res.status(400).json({ message: 'Failed to remove question from exercise' });
      }
      
      res.json({ message: 'Question removed from exercise successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing question from exercise' });
    }
  }

  static async getExerciseQuestions(req: Request, res: Response) {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      const questionIds = await ExerciseRepository.getQuestionsForExercise(exerciseId);
      res.json(questionIds);
    } catch (error) {
      res.status(500).json({ message: 'Error getting exercise questions' });
    }
  }
}