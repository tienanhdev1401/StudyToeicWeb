import database from '../../config/db';
import { GrammarTopic } from '../../models/GrammarTopic';
import { ExerciseTopic } from '../../models/ExerciseTopic';

export class grammarTopicRepository {
  /**
   * Lấy tất cả Grammar Topics
   */
  static async getAllGrammarTopics(): Promise<{grammarTopic: GrammarTopic, exerciseCount: number}[]> {
    // 1. Lấy tất cả grammar topics
    const grammarTopics = await database.query(
      'SELECT * FROM grammartopics'
    );

    // 2. Với mỗi grammar topic, đếm số lượng exercise và lấy thông tin grammar topic
    const grammarTopicsWithCount = await Promise.all(
      grammarTopics.map(async (topic: any) => {
        // Đếm số lượng exercise trong grammar topic
        const countResult = await database.query(
          'SELECT COUNT(*) as count FROM `grammartopic-exercise` WHERE grammartopicId = ?',
          [topic.id]
        );
        
        const exerciseCount = countResult[0].count;
        
        // Lấy thông tin grammar topic
        const grammarTopicObj = new GrammarTopic(
          topic.id,
          topic.title,
          topic.content,
          topic.imageUrl
        );

        return { grammarTopic: grammarTopicObj, exerciseCount };
      })
    );

    return grammarTopicsWithCount;
  }

  /**
   * Thêm mới Grammar Topic
   */
  static async addGrammarTopic(title: string, content: string, imageUrl: string): Promise<GrammarTopic> {
    const currentDateTime = new Date();
    
    const result = await database.query(
      'INSERT INTO grammartopics (title, content, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [title, content, imageUrl, currentDateTime, currentDateTime]
    );

    const id = result.insertId;
    return new GrammarTopic(id, title, content, imageUrl);
  }

  /**
   * Cập nhật Grammar Topic
   */
  static async updateGrammarTopic(id: number, title: string, content: string, imageUrl: string): Promise<GrammarTopic> {
    const currentDateTime = new Date();
    
    await database.query(
      'UPDATE grammartopics SET title = ?, content = ?, imageUrl = ?, updatedAt = ? WHERE id = ?',
      [title, content, imageUrl, currentDateTime, id]
    );

    // Lấy số lượng exercise
    const countResult = await database.query(
      'SELECT COUNT(*) as count FROM `grammartopic-exercise` WHERE grammartopicId = ?',
      [id]
    );

    return new GrammarTopic(
      id,
      title,
      content,
      imageUrl,
      countResult[0].count
    );
  }

  /**
   * Xóa Grammar Topic và các liên kết với Exercise
   */
  static async deleteGrammarTopic(id: number): Promise<boolean> {
    try {
      await database.query('START TRANSACTION');
      
      // Xóa các liên kết với exercises
      await database.query(
        'DELETE FROM `grammartopic-exercise` WHERE grammartopicId = ?',
        [id]
      );
      
      // Xóa grammar topic
      await database.query(
        'DELETE FROM grammartopics WHERE id = ?',
        [id]
      );
      
      await database.query('COMMIT');
      return true;
    } catch (error) {
      await database.query('ROLLBACK');
      console.error('Error deleting grammar topic:', error);
      throw error;
    }
  }

  /**
   * Lấy Grammar Topic theo ID
   */
  static async findById(id: number): Promise<GrammarTopic | null> {
    const results = await database.query(
      'SELECT gt.*, COUNT(ge.exerciseId) as NumberofExercise ' +
      'FROM grammartopics gt ' +
      'LEFT JOIN `grammartopic-exercise` ge ON gt.id = ge.grammartopicId ' +
      'WHERE gt.id = ? ' +
      'GROUP BY gt.id',
      [id]
    );

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return new GrammarTopic(
      row.id,
      row.title,
      row.content,
      row.imageUrl,
      row.NumberofExercise
    );
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

}