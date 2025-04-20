
import database from '../config/db';
import { LearningGoal } from '../models/LearningGoal';

export class LearningGoalRepository {

  static async getLearningGoalByLearnerId(learnerId: number): Promise<LearningGoal | null> {
    try {
      const results = await database.query(
        'SELECT id, duration, scoreTarget, learnerId FROM learninggoals WHERE learnerId = ? LIMIT 1',
        [learnerId]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new LearningGoal(row.id, row.duration, row.scoreTarget, row.learnerId);
    } catch (error) {
      console.error(`Error getting learning goal for learner ${learnerId}:`, error);
      throw error;
    }
  }

  // Cập nhật lại phương thức createLearningGoal để sử dụng phương thức mới
  static async createLearningGoal(learningGoal: LearningGoal): Promise<LearningGoal> {
    try {

      const result = await database.query(
        'INSERT INTO learninggoals (duration, scoreTarget, learnerId) VALUES (?, ?, ?)',
        [learningGoal.duration, learningGoal.scoreTarget, learningGoal.learnerId]
      );
      
      return new LearningGoal(
        result.insertId,
        learningGoal.duration,
        learningGoal.scoreTarget,
        learningGoal.learnerId
      );
    } catch (error) {
      console.error('Error creating learning goal:', error);
      throw error;
    }
  }

  static async updateLearningGoal(learningGoal: LearningGoal): Promise<boolean> {
    try {
      const result = await database.query(
        'UPDATE learninggoals SET duration = ?, scoreTarget = ? WHERE id = ? AND learnerId = ?',
        [
          learningGoal.duration,
          learningGoal.scoreTarget,
          learningGoal.id,
          learningGoal.learnerId
        ]
      );

      // Trả về true nếu cập nhật thành công (affectedRows > 0)
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating learning goal with ID ${learningGoal?.id}:`, error);
      throw error;
    }
  }


}