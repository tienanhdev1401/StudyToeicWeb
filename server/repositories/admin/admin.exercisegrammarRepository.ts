import database from '../../config/db';
import { GrammarTopic } from '../../models/GrammarTopic';
import { ExerciseTopic } from '../../models/ExerciseTopic';

export class exercisegrammarRepository {
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
        console.log(exerciseObj);
        return { exercise: exerciseObj, questionCount };
      })
    );

    return exercisesWithCount;
  }

  /**
     * Lấy tất cả exercises theo grammarTopicId
     */
  static async getAllExerciseByGrammarTopicId(grammarTopicId: number): Promise<ExerciseTopic[]> {
    const results = await database.query(
        'SELECT e.* FROM exercises e JOIN `grammartopic-exercise` ge ON e.id = ge.exerciseId WHERE ge.grammartopicId = ?',
        [grammarTopicId]
    );

    if (results.length === 0) {
        return [];
    }
    console.log(results);
    return results.map((row: any) => new ExerciseTopic(
        row.id,
        row.exerciseName,
        row.createdAt,
        row.updatedAt
    ));
}

/**
 * Thêm một exercise vào grammar topic
 */
static async addGrammarExercise(grammarTopicId: number, exerciseId: number): Promise<boolean> {
    try {
        // Kiểm tra xem grammarTopicId và exerciseId có tồn tại không
        const grammarTopicExists = await database.query(
            'SELECT id FROM grammartopics WHERE id = ? LIMIT 1',
            [grammarTopicId]
        );

        const exerciseExists = await database.query(
            'SELECT id FROM exercises WHERE id = ? LIMIT 1',
            [exerciseId]
        );

        if (grammarTopicExists.length === 0 || exerciseExists.length === 0) {
            return false;
        }

        // Kiểm tra xem đã tồn tại liên kết này chưa
        const linkExists = await database.query(
            'SELECT * FROM `grammartopic-exercise` WHERE grammartopicId = ? AND exerciseId = ? LIMIT 1',
            [grammarTopicId, exerciseId]
        );

        if (linkExists.length > 0) {
            return true; // Đã tồn tại liên kết
        }

        // Thêm liên kết giữa grammar topic và exercise
        const result = await database.query(
            'INSERT INTO `grammartopic-exercise` (grammartopicId, exerciseId) VALUES (?, ?)',
            [grammarTopicId, exerciseId]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error adding exercise to grammar topic:', error);
        throw error;
    }
}

/**
 * Xóa một exercise khỏi grammar topic
 */
static async deleteGrammarExercise(grammarTopicId: number, exerciseId: number): Promise<boolean> {
    try {
        const result = await database.query(
            'DELETE FROM `grammartopic-exercise` WHERE grammartopicId = ? AND exerciseId = ?',
            [grammarTopicId, exerciseId]
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error removing exercise from grammar topic:', error);
        throw error;
    }
}

/**
 * Lấy danh sách exercises chưa được thêm vào grammar topic cụ thể
 */
static async getExercisesNotInGrammarTopic(grammarTopicId: number): Promise<ExerciseTopic[]> {
    const query ='SELECT e.* FROM exercises e WHERE e.id NOT IN ( SELECT ge.exerciseId FROM `grammartopic-exercise` ge WHERE ge.grammartopicId = ? )';

    const results = await database.query(query, [grammarTopicId]);

    if (results.length === 0) {
        return [];
    }
    console.log(results);
    return results.map((row: any) => new ExerciseTopic(
        row.id,
        row.exerciseName,
        row.createdAt,
        row.updatedAt
    ));
}
}