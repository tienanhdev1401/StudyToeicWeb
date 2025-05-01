import database from '../../config/db';
import { VocabularyTopic } from '../../models/VocabularyTopic';
import { ExerciseTopic } from '../../models/ExerciseTopic';

export class exercisevocabularyRepository {
  /**
   * Lấy tất cả vocabulary Topics
   */
  static async getAllVocabularyTopics(): Promise<{vocabularyTopic: VocabularyTopic, count: number}[]> {
    // 1. Lấy tất cả topics
    const vocabularyTopics = await database.query(
      'SELECT * FROM vocabularytopics'
    );

    // 2. Với mỗi topic, lấy danh sách từ vựng tương ứng
    const vocabularyTopicsWithCount = await Promise.all(
      vocabularyTopics.map(async (topic: any) => {
        // Đếm số lượng exercise trong vocabulary topic
        const countResult = await database.query(
          'SELECT COUNT(*) as count FROM `vocabularytopic-exercise` WHERE vocabularytopicId = ?',
          [topic.id]
        );
        
        const exerciseCount = countResult[0].count;
          // Lấy thông tin vocabulary topic
          const vocabularyTopicObj = new VocabularyTopic(
            topic.id,
            topic.topicName,
            topic.imageUrl,
            topic.vocabularies,
            topic.exercises,
            topic.createdAt,
            topic.updatedAt
          );
          
          return { vocabularyTopic: vocabularyTopicObj, exerciseCount };
      })
    );

    return vocabularyTopicsWithCount;
  }


  

  /**
   * Lấy vocabulary Topic theo ID
   */
  static async findById(id: number): Promise<VocabularyTopic | null> {
    const results = await database.query(
      'SELECT gt.*, COUNT(ge.exerciseId) as NumberofExercise ' +
      'FROM vocabularytopics gt ' +
      'LEFT JOIN `vocabularytopic-exercise` ge ON gt.id = ge.vocabularytopicId ' +
      'WHERE gt.id = ? ' +
      'GROUP BY gt.id',
      [id]
    );

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return new VocabularyTopic(
      row.id,
      row.topicName,
      row.imageUrl,
      row.vocabularies,
      row.exercises,
      row.createdAt,
      row.updatedAt
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
     * Lấy tất cả exercises theo vocabularyTopicId
     */
  static async getAllExerciseByVocabularyTopicId(vocabularyTopicId: number): Promise<ExerciseTopic[]> {
    const results = await database.query(
        'SELECT e.* FROM exercises e JOIN `vocabularytopic-exercise` ge ON e.id = ge.exerciseId WHERE ge.vocabularytopicId = ?',
        [vocabularyTopicId]
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
 * Thêm một exercise vào vocabulary topic
 */
static async addVocabularyExercise(vocabularyTopicId: number, exerciseId: number): Promise<boolean> {
    try {
        // Kiểm tra xem vocabularyTopicId và exerciseId có tồn tại không
        const vocabularyTopicExists = await database.query(
            'SELECT id FROM vocabularytopics WHERE id = ? LIMIT 1',
            [vocabularyTopicId]
        );

        const exerciseExists = await database.query(
            'SELECT id FROM exercises WHERE id = ? LIMIT 1',
            [exerciseId]
        );

        if (vocabularyTopicExists.length === 0 || exerciseExists.length === 0) {
            return false;
        }

        // Kiểm tra xem đã tồn tại liên kết này chưa
        const linkExists = await database.query(
            'SELECT * FROM `vocabularytopic-exercise` WHERE vocabularytopicId = ? AND exerciseId = ? LIMIT 1',
            [vocabularyTopicId, exerciseId]
        );

        if (linkExists.length > 0) {
            return true; // Đã tồn tại liên kết
        }

        // Thêm liên kết giữa vocabulary topic và exercise
        const result = await database.query(
            'INSERT INTO `vocabularytopic-exercise` (vocabularytopicId, exerciseId) VALUES (?, ?)',
            [vocabularyTopicId, exerciseId]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error adding exercise to vocabulary topic:', error);
        throw error;
    }
}

/**
 * Xóa một exercise khỏi vocabulary topic
 */
static async deleteVocabularyExercise(vocabularyTopicId: number, exerciseId: number): Promise<boolean> {
    try {
        const result = await database.query(
            'DELETE FROM `vocabularytopic-exercise` WHERE vocabularytopicId = ? AND exerciseId = ?',
            [vocabularyTopicId, exerciseId]
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error removing exercise from vocabulary topic:', error);
        throw error;
    }
}

/**
 * Lấy danh sách exercises chưa được thêm vào vocabulary topic cụ thể
 */
static async getExercisesNotInVocabularyTopic(vocabularyTopicId: number): Promise<ExerciseTopic[]> {
    const query ='SELECT e.* FROM exercises e WHERE e.id NOT IN ( SELECT ge.exerciseId FROM `vocabularytopic-exercise` ge WHERE ge.vocabularytopicId = ? )';

    const results = await database.query(query, [vocabularyTopicId]);

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