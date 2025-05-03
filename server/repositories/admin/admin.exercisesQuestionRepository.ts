import database from '../../config/db';
import { Question } from '../../models/Question';
import { Resource } from '../../models/Resource';

export class exercisesQuestionRepository {
    /**
     * Lấy tất cả questions trong một exercise theo exerciseId
     */
    static async getAllQuestionsByExerciseId(exerciseId: number): Promise<Question[]> {
        const results = await database.query(
            `SELECT q.* FROM questions q
             JOIN questioninexercise qe ON q.id = qe.questionId
             WHERE qe.exerciseId = ?`,
            [exerciseId]
        );
        console.log('results',results);

        if (results.length === 0) {
            return [];
        }

        // Chuyển đổi kết quả thành mảng Question objects
        return await Promise.all(results.map(async (row: any) => {
            // Nếu có ResourceId, lấy thông tin Resource
            let resource = null;
            if (row.ResourceId) {
                const resourceResults = await database.query(
                    'SELECT * FROM resources WHERE id = ?',
                    [row.ResourceId]
                );
                
                if (resourceResults.length > 0) {
                    const resourceData = resourceResults[0];
                    resource = new Resource(
                        resourceData.id,
                        resourceData.explain_resource,
                        resourceData.urlAudio,
                        resourceData.urlImage
                    );
                }
            }

            return new Question(
            row.id,
            row.content,
                row.correct_answer,
                row.explain_detail,
                row.option_a,
                row.option_b,
                row.option_c,
                row.option_d,
                resource
            );
        }));
    }

    /**
     * Thêm một question vào exercise
     */
    static async addExercisesQuestion(exerciseId: number, questionId: number): Promise<boolean> {
        try {
            const currentDateTime = new Date();
            
            // Kiểm tra xem questionId và exerciseId có tồn tại không
            const questionExists = await database.query(
                'SELECT id FROM questions WHERE id = ? LIMIT 1',
                [questionId]
            );

            const exerciseExists = await database.query(
                'SELECT id FROM exercises WHERE id = ? LIMIT 1',
                [exerciseId]
            );

            if (questionExists.length === 0 || exerciseExists.length === 0) {
                return false;
            }

            // Kiểm tra xem đã tồn tại liên kết này chưa
            const linkExists = await database.query(
                'SELECT * FROM questioninexercise WHERE exerciseId = ? AND questionId = ? LIMIT 1',
                [exerciseId, questionId]
            );

            if (linkExists.length > 0) {
                return true; // Đã tồn tại liên kết
            }

            // Thêm liên kết giữa exercise và question
            const result = await database.query(
                'INSERT INTO questioninexercise (exerciseId, questionId, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
                [exerciseId, questionId, currentDateTime, currentDateTime]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error adding question to exercise:', error);
            throw error;
        }
    }

    /**
     * Xóa một question khỏi exercise
     */
    static async deleteExercisesQuestion(exerciseId: number, questionId: number): Promise<boolean> {
        try {
            const result = await database.query(
                'DELETE FROM questioninexercise WHERE exerciseId = ? AND questionId = ?',
                [exerciseId, questionId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error removing question from exercise:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách tất cả questions từ bảng questions
     * (Hữu ích khi muốn chọn question để thêm vào exercise)
     */
    static async getAllQuestions(): Promise<Question[]> {
        const results = await database.query('SELECT * FROM questions');
        
        if (results.length === 0) {
            return [];
        }

        // Chuyển đổi kết quả thành mảng Question objects
        return await Promise.all(results.map(async (row: any) => {
            // Nếu có ResourceId, lấy thông tin Resource
            let resource = null;
            if (row.ResourceId) {
                const resourceResults = await database.query(
                    'SELECT * FROM resources WHERE id = ?',
                    [row.ResourceId]
                );
                
                if (resourceResults.length > 0) {
                    const resourceData = resourceResults[0];
                    resource = new Resource(
                        resourceData.id,
                        resourceData.explain_resource,
                        resourceData.urlAudio,
                        resourceData.urlImage
                    );
                }
            }

            return new Question(
                row.id,
                row.content,
                row.correct_answer,
                row.explain_detail,
                row.option_a,
                row.option_b,
                row.option_c,
                row.option_d,
                resource
            );
        }));
    }

    /**
     * Lấy danh sách questions chưa được thêm vào exercise cụ thể
     * (Hữu ích khi muốn hiển thị danh sách các questions có thể thêm vào exercise)
     */
    static async getQuestionsNotInExercise(exerciseId: number): Promise<Question[]> {
        const query = `
            SELECT q.*
            FROM questions q
            WHERE q.id NOT IN (
                SELECT qi.questionId
                FROM questioninexercise qi
                WHERE qi.exerciseId = ? )`;

        const [results] = await database.query(query, [exerciseId]);

        
        if (results.length === 0) {
            return [];
        }

        // Chuyển đổi kết quả thành mảng Question objects
        return await Promise.all(results.map(async (row: any) => {
            // Nếu có ResourceId, lấy thông tin Resource
            let resource = null;
            if (row.ResourceId) {
                const resourceResults = await database.query(
                    'SELECT * FROM resources WHERE id = ?',
                    [row.ResourceId]
                );
                
                if (resourceResults.length > 0) {
                    const resourceData = resourceResults[0];
                    resource = new Resource(
                        resourceData.id,
                        resourceData.explain_resource,
                        resourceData.urlAudio,
                        resourceData.urlImage
                    );
                }
            }

            return new Question(
                row.id,
                row.content,
                row.correct_answer,
                row.explain_detail,
                row.option_a,
                row.option_b,
                row.option_c,
                row.option_d,
                resource
            );
        }));
    }

    static async isQuestionUsedInExercises(questionId: number): Promise<boolean> {
        try {
            const result = await database.query(
                'SELECT COUNT(*) as count FROM questioninexercise WHERE QuestionId = ?',
                [questionId]
            );
            return result[0].count > 0;
        } catch (error) {
            console.error('exercisesQuestionRepository.isQuestionUsedInExercises error:', error);
            throw error;
        }
    }
}