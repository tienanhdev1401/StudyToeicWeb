import database from '../../config/db';
import { ExerciseTopic } from '../../models/ExerciseTopic';
import { Question } from '../../models/Question';

export class exercisesRepository {
  /**
   * Tìm Exercise theo ID
   */
  static async findById(exerciseId: number): Promise<ExerciseTopic | null> {
    const results = await database.query(
      'SELECT * FROM exercises WHERE id = ? LIMIT 1',
      [exerciseId]
    );

    if (Array.isArray(results) && results.length === 0) {
      return null;
    }

    const exerciseData = results[0] as any;
    
    // Lấy danh sách questions thuộc exercise này
    const questions = await this.getQuestionsForExercise(exerciseId);
    
    const exercisetopic = new ExerciseTopic(
      exerciseData.id, 
      exerciseData.exerciseName,
      exerciseData.createdAt,
      exerciseData.updatedAt
    );

    return exercisetopic;
  }

  /**
   * Lấy tất cả Exercises
   */
  static async getAllExercises(): Promise<{exercise: ExerciseTopic, questionCount: number}[]> {
    // 1. Lấy tất cả exercises
    const exercises = await database.query(
      'SELECT * FROM exercises'
    );

    // 2. Với mỗi exercise, đếm số lượng câu hỏi và lấy thông tin exercise
    const exercisesWithCount = await Promise.all(
      exercises.map(async (exercise: any) => {
        // Đếm số lượng câu hỏi trong exercise
        const countResult = await database.query(
          'SELECT COUNT(*) as count FROM questioninexercise WHERE exerciseId = ?',
          [exercise.id]
        );
        
        const questionCount = countResult[0].count;
        
        // Lấy thông tin exercise
        const exerciseObj = new ExerciseTopic(
          exercise.id,
          exercise.exerciseName,
          exercise.createdAt,
          exercise.updatedAt
        );

        return { exercise: exerciseObj, questionCount };
      })
    );

    return exercisesWithCount;
  }

  /**
   * Thêm mới Exercise
   */
  static async addExercise(exerciseName: string): Promise<ExerciseTopic> {
    // Tạo đối tượng datetime hợp lệ
    const currentDateTime = new Date();
    
    // Thêm exercise vào bảng exercises
    const result = await database.query(
      'INSERT INTO exercises (exerciseName, createdAt, updatedAt) VALUES (?, ?, ?)',
      [exerciseName, currentDateTime, currentDateTime]
    );

    // Lấy ID của exercise vừa được thêm
    const exerciseId = result.insertId;

    // Trả về exercise đã được thêm
    return new ExerciseTopic(exerciseId, exerciseName, currentDateTime, currentDateTime );
  }

  /**
   * Cập nhật Exercise
   */
  static async updateExercise(id: number, exerciseName: string): Promise<ExerciseTopic> {
    // Tạo đối tượng datetime hợp lệ
    const currentDateTime = new Date();
    
    // Cập nhật exercise trong bảng exercises
    await database.query(
      'UPDATE exercises SET exerciseName = ?, updatedAt = ? WHERE id = ?',
      [exerciseName, currentDateTime, id]
    );

    // Trả về exercise đã được cập nhật
    return new ExerciseTopic(id, exerciseName, currentDateTime, currentDateTime );
  }

  /**
   * Xóa Exercise và tất cả các liên kết với Question
   */
  static async deleteExercise(id: number): Promise<boolean> {
    try {
      // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
      await database.query('START TRANSACTION');
      
      // 1. Xóa tất cả liên kết với questions trong bảng questioninexercise
      await database.query(
        'DELETE FROM questioninexercise WHERE exerciseId = ?',
        [id]
      );
      
      // 2. Xóa exercise
      await database.query(
        'DELETE FROM exercises WHERE id = ?',
        [id]
      );
      
      // Commit transaction nếu mọi thứ thành công
      await database.query('COMMIT');
      
      return true;
    } catch (error) {
      // Rollback nếu có lỗi
      await database.query('ROLLBACK');
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }

  /**
   * Hàm hỗ trợ để lấy tất cả questions của một exercise
   */
  private static async getQuestionsForExercise(exerciseId: number): Promise<Question[]> {
    const results = await database.query(
      `SELECT q.* FROM questions q
       JOIN questioninexercise qe ON q.id = qe.questionId
       WHERE qe.exerciseId = ?`,
      [exerciseId]
    );
    
    if (results.length === 0) {
      return [];
    }

    // Chuyển đổi kết quả thành mảng Question objects
    return results.map((row: any) => new Question(
      row.id,
      row.content,
      row.correct_answer,
      row.explain_detail,
      row.option_a,
      row.option_b,
      row.option_c,
      row.option_d,
      row.ResourceId ? { id: row.ResourceId, explain_resource: null, urlAudio: null, urlImage: null } : null
    ));
  }
}