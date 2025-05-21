import database from '../config/db';
import { LearningGoal } from '../models/LearningGoal';
import { LearningGoalBuilder } from '../builder/LearningGoalBuilder';

export class LearningGoalRepository {

  static async getLearningGoalByLearnerId(learnerId: number): Promise<LearningGoal | null> {
    try {
      const results = await database.query(
        'SELECT id, duration, scoreTarget,createdAt, learnerId FROM learninggoals WHERE learnerId = ? LIMIT 1',
        [learnerId]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new LearningGoalBuilder()
        .setId(row.id)
        .setDuration(row.duration)
        .setScoreTarget(row.scoreTarget)
        .setCreatedAt(row.createdAt)
        .setLearnerId(row.learnerId)
        .build();
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
      
      return new LearningGoalBuilder()
        .setId(result.insertId)
        .setDuration(learningGoal.duration)
        .setScoreTarget(learningGoal.scoreTarget)
        .setCreatedAt(learningGoal.createdAt)
        .setLearnerId(learningGoal.learnerId)
        .build();
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