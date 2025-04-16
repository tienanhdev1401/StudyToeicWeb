import database from '../config/db';
import { Exercise } from '../models/Exercise';

export class ExerciseRepository {
  static async getAllExercises(): Promise<Exercise[]> {
    try {
      const results = await database.query(
        'SELECT id, exerciseName FROM exercises'
      );
      
      return results.map((row: any) => 
        new Exercise(
          row.id, 
          row.exerciseName,
        )
      );
    } catch (error) {
      console.error('Error getting all exercises:', error);
      throw error;
    }
  }

  static async findById(id: number): Promise<Exercise | null> {
    try {
      const results = await database.query(
        'SELECT id, exerciseName, createdAt, updatedAt FROM exercises WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new Exercise(
        row.id, 
        row.exerciseName
      );
    } catch (error) {
      console.error(`Error finding exercise with ID ${id}:`, error);
      throw error;
    }
  }

  static async createExercise(exerciseName: string): Promise<Exercise> {
    try {
      const result = await database.query(
        'INSERT INTO exercises (exerciseName) VALUES (?)',
        [exerciseName]
      );
      
      return new Exercise(result.insertId, exerciseName);
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  }

  static async updateExercise(id: number, exerciseName: string): Promise<boolean> {
    try {
      const result = await database.query(
        'UPDATE exercises SET exerciseName = ? WHERE id = ?',
        [exerciseName, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating exercise with ID ${id}:`, error);
      throw error;
    }
  }

  static async deleteExercise(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM exercises WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting exercise with ID ${id}:`, error);
      throw error;
    }
  }

  // Additional methods for questioninexercise relationship
  static async addQuestionToExercise(exerciseId: number, questionId: number): Promise<boolean> {
    try {
      const result = await database.query(
        'INSERT INTO questioninexercise (exerciseId, questionId) VALUES (?, ?)',
        [exerciseId, questionId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error adding question ${questionId} to exercise ${exerciseId}:`, error);
      throw error;
    }
  }

  static async removeQuestionFromExercise(exerciseId: number, questionId: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM questioninexercise WHERE exerciseId = ? AND questionId = ?',
        [exerciseId, questionId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error removing question ${questionId} from exercise ${exerciseId}:`, error);
      throw error;
    }
  }

  static async getQuestionsForExercise(exerciseId: number): Promise<number[]> {
    try {
      const results = await database.query(
        'SELECT questionId FROM questioninexercise WHERE exerciseId = ?',
        [exerciseId]
      );
      return results.map((row: any) => row.questionId);
    } catch (error) {
      console.error(`Error getting questions for exercise ${exerciseId}:`, error);
      throw error;
    }
  }


  static async getExercisesByGrammarTopicId(grammarTopicId: number): Promise<Exercise[]> {
    try {
      const results = await database.query(
        `SELECT e.* FROM exercises e
         JOIN \`grammartopic-exercise\` ge ON e.id = ge.exerciseId
         WHERE ge.grammartopicId = ?`,
        [grammarTopicId]
      );

      return results.map((row: any) => 
        new Exercise(
          row.id,
          row.exerciseName
        )
      );
    } catch (error) {
      console.error(`Error getting exercises for grammar topic ${grammarTopicId}:`, error);
      throw error;
    }
  }
}