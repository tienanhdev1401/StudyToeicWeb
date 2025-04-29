import database from '../../config/db';
import { GrammarTopic } from '../../models/GrammarTopic';
import { ExerciseTopic } from '../../models/ExerciseTopic';

export class grammarExerciseRepository {
    /**
     * Lấy tất cả exercises theo grammarTopicId
     */
    static async getAllExerciseByGrammarTopicId(grammarTopicId: number): Promise<ExerciseTopic[]> {
        const results = await database.query(
            `SELECT e.* FROM exercises e
             JOIN grammartopic_exercise ge ON e.id = ge.exerciseId
             WHERE ge.grammartopicId = ?`,
            [grammarTopicId]
        );

        if (results.length === 0) {
            return [];
        }

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
                'SELECT * FROM grammartopic_exercise WHERE grammartopicId = ? AND exerciseId = ? LIMIT 1',
                [grammarTopicId, exerciseId]
            );

            if (linkExists.length > 0) {
                return true; // Đã tồn tại liên kết
            }

            // Thêm liên kết giữa grammar topic và exercise
            const result = await database.query(
                'INSERT INTO grammartopic_exercise (grammartopicId, exerciseId) VALUES (?, ?)',
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
                'DELETE FROM grammartopic_exercise WHERE grammartopicId = ? AND exerciseId = ?',
                [grammarTopicId, exerciseId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error removing exercise from grammar topic:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách tất cả exercises
     */
    static async getAllExercise(): Promise<ExerciseTopic[]> {
        const results = await database.query('SELECT * FROM exercises');
        
        if (results.length === 0) {
            return [];
        }

        return results.map((row: any) => new ExerciseTopic(
            row.id,
            row.exerciseName,
            row.createdAt,
            row.updatedAt
        ));
    }

    /**
     * Lấy danh sách exercises chưa được thêm vào grammar topic cụ thể
     */
    static async getExercisesNotInGrammarTopic(grammarTopicId: number): Promise<ExerciseTopic[]> {
        const query = `
            SELECT e.*
            FROM exercises e
            WHERE e.id NOT IN (
                SELECT ge.exerciseId
                FROM grammartopic_exercise ge
                WHERE ge.grammartopicId = ? )`;

        const results = await database.query(query, [grammarTopicId]);

        if (results.length === 0) {
            return [];
        }

        return results.map((row: any) => new ExerciseTopic(
            row.id,
            row.exerciseName,
            row.createdAt,
            row.updatedAt
        ));
    }
}