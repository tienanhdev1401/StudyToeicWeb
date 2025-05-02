import { LearningProcess } from '../models/LearningProcess';
import db from '../config/db';

export class LearningProcessRepository {
    static async getAllLearningProcessByUserId(userId: number): Promise<LearningProcess[]> {
        try {
            const result = await db.query(
                'SELECT * FROM toeic_web.learningprocesses WHERE LearnerId = ?',
                [userId]
            );
            
            return result as LearningProcess[];
        } catch (error) {
            console.error('Lỗi khi lấy tất cả learning process:', error);
            throw error;
        }
    }

    static async setLearningProcessInProgress(
        learnerId: number,
        params: {
            grammarTopicId?: number;
            testId?: number;
            vocabularyTopicId?: number;
        }
    ): Promise<LearningProcess> {
        try {
            // Tạo câu query với điều kiện chính xác cho từng loại topic
            let query = 'SELECT * FROM toeic_web.learningprocesses WHERE LearnerId = ?';
            const queryParams = [learnerId];

            if (params.grammarTopicId) {
                query += ' AND GrammarTopicId = ?';
                queryParams.push(params.grammarTopicId);
            } else if (params.testId) {
                query += ' AND TestId = ?';
                queryParams.push(params.testId);
            } else if (params.vocabularyTopicId) {
                query += ' AND VocabularyTopicId = ?';
                queryParams.push(params.vocabularyTopicId);
            }

            // Kiểm tra xem đã có learning process cho bài học này chưa
            const [rows] = await db.query(query, queryParams);
            const existing = Array.isArray(rows) ? rows[0] : rows;
            
            // Nếu đã tồn tại, trả về learning process đó
            if (existing) {
                return new LearningProcess(
                    Number(existing.id),
                    existing.LearnerId,
                    existing.GrammarTopicId,
                    existing.TestId,
                    existing.VocabularyTopicId,
                    existing.progressStatus,
                    existing.createdAt,
                    existing.updatedAt
                );
            }

            // Nếu chưa tồn tại, tạo mới learning process
            try {
                const insertResult: any = await db.query(
                    'INSERT INTO toeic_web.learningprocesses (LearnerId, GrammarTopicId, TestId, VocabularyTopicId, progressStatus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                    [learnerId, params.grammarTopicId || null, params.testId || null, params.vocabularyTopicId || null, 'in_progress']
                );

                const insertId = Array.isArray(insertResult) ? insertResult[0].insertId : insertResult.insertId;

                // Lấy thông tin learning process vừa tạo
                const newResult: any = await db.query(
                    'SELECT * FROM toeic_web.learningprocesses WHERE id = ?',
                    [insertId]
                );

                const newRows = Array.isArray(newResult) ? newResult[0] : [];
                const createdProcess = Array.isArray(newRows) ? newRows[0] : newRows;

                if (!createdProcess) {
                    throw new Error('Không thể tìm thấy learning process vừa tạo');
                }

                return new LearningProcess(
                    Number(createdProcess.id),
                    createdProcess.LearnerId,
                    createdProcess.GrammarTopicId,
                    createdProcess.TestId,
                    createdProcess.VocabularyTopicId,
                    createdProcess.progressStatus,
                    createdProcess.createdAt,
                    createdProcess.updatedAt
                );
            } catch (error: any) {
                // Nếu bị duplicate key thì select lại process cũ và trả về
                if (error && error.code === 'ER_DUP_ENTRY') {
                    const [rows2] = await db.query(query, queryParams);
                    const process = Array.isArray(rows2) ? rows2[0] : rows2;
                    if (process) {
                        return new LearningProcess(
                            Number(process.id),
                            process.LearnerId,
                            process.GrammarTopicId,
                            process.TestId,
                            process.VocabularyTopicId,
                            process.progressStatus,
                            process.createdAt,
                            process.updatedAt
                        );
                    }
                }
                throw error;
            }
        } catch (error) {
            console.error('Lỗi khi tạo learning process:', error);
            throw error;
        }
    }

    static async setLearningProcessCompleted(learningProcessId: number): Promise<boolean> {
        try {
            // Kiểm tra xem learning process có tồn tại và đang ở trạng thái in_progress không
            const [rows] = await db.query(
                'SELECT * FROM toeic_web.learningprocesses WHERE id = ? AND progressStatus = ?',
                [learningProcessId, 'in_progress']
            );

            const process = Array.isArray(rows) ? rows[0] : rows;
            
            // Nếu không tìm thấy hoặc không ở trạng thái in_progress
            if (!process) {
                console.error('Learning process not found or not in progress');
                return false;
            }

            // Cập nhật trạng thái thành completed và updatedAt
            const result = await db.query(
                'UPDATE toeic_web.learningprocesses SET progressStatus = ?, updatedAt = NOW() WHERE id = ?',
                ['completed', learningProcessId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái hoàn thành:', error);
            throw error;
        }
    }

    static async getCompletedGrammarTopicCount(learnerId: number): Promise<number> {
        try {
            const [result] = await db.query(
                'SELECT COUNT(DISTINCT GrammarTopicId) as count FROM toeic_web.learningprocesses WHERE LearnerId = ? AND GrammarTopicId IS NOT NULL AND progressStatus = ?',
                [learnerId, 'completed']
            );
            
            return result.count || 0;
        } catch (error) {
            console.error('Lỗi khi lấy số lượng grammar topic đã hoàn thành:', error);
            throw error;
        }
    }

    static async getCompletedTestCount(learnerId: number): Promise<number> {
        try {
            const [result] = await db.query(
                'SELECT COUNT(DISTINCT TestId) as count FROM toeic_web.learningprocesses ' +
                'WHERE LearnerId = ? AND TestId IS NOT NULL AND progressStatus = ?',
                [learnerId, 'completed']
            );
            
            return result.count || 0;
        } catch (error) {
            console.error('LearningProcessRepository.getCompletedTestCount error:', error);
            throw error;
        }
    }

    static async getCompletedVocabularies(learnerId: number): Promise<number> {
        try {
            // Query chính
            const [result] = await db.query(
                'SELECT COUNT(DISTINCT v.id) as count ' +
                'FROM toeic_web.learningprocesses lp ' +
                'INNER JOIN toeic_web.vocabularytopics vt ON lp.VocabularyTopicId = vt.id ' +
                'INNER JOIN toeic_web.vocabularies v ON v.VocabularyTopicId = vt.id ' +
                'WHERE lp.LearnerId = ? AND lp.progressStatus = ? AND lp.VocabularyTopicId IS NOT NULL',
                [learnerId, 'completed']
            );
            
            
            // Truy cập trực tiếp vào thuộc tính count của object
            return result.count || 0;
        } catch (error) {
            console.error('Lỗi khi lấy số lượng vocabularies đã hoàn thành:', error);
            throw error;
        }
    }

    static async getLearningStatistics(learnerId: number): Promise<{
        completedGrammarTopics: number;
        completedTests: number;
        completedVocabulary: number;
    }> {
        try {
            const [grammarCount, testCount, vocabularyCount] = await Promise.all([
                this.getCompletedGrammarTopicCount(learnerId),
                this.getCompletedTestCount(learnerId),
                this.getCompletedVocabularies(learnerId)
            ]);

            return {
                completedGrammarTopics: grammarCount,
                completedTests: testCount,
                completedVocabulary: vocabularyCount
            };
        } catch (error) {
            console.error('Lỗi khi lấy thống kê học tập:', error);
            throw error;
        }
    }
} 