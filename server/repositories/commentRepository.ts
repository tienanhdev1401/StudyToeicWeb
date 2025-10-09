import database from '../config/db';
import { Comment } from '../models/Comment';
import { CommentBuilder } from '../builder/CommentBuilder';

export class CommentRepository {
    static async getAllCommentByVocabularyTopicIdWithUser(vocabularyTopicId: number): Promise<any[]> {
        const query = `
            SELECT c.*, u.fullname, u.avatar 
            FROM comments c
            LEFT JOIN users u ON c.userId = u.id
            WHERE c.VocabularyTopicId = ?
            ORDER BY c.createdAt DESC
        `;
        try {
            const results = await database.query(query, [vocabularyTopicId]);
            return results.map((row: any) => ({
                id: row.id,
                content: row.content,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                user: {
                    id: row.userId,
                    fullname: row.fullname,
                    avatar: row.avatar
                },
                VocabularyTopicId: row.VocabularyTopicId,
                GrammarTopicId: row.GrammarTopicId
            }));
        } catch (error) {
            console.error(`Error getting comments with user info for vocabulary topic ${vocabularyTopicId}:`, error);
            throw error;
        }
    }

    static async getAllCommentByGrammarTopicIdWithUser(grammarTopicId: number): Promise<any[]> {
        const query = `
            SELECT c.*, u.fullname, u.avatar 
            FROM comments c
            LEFT JOIN users u ON c.userId = u.id
            WHERE c.GrammarTopicId = ?
            ORDER BY c.createdAt DESC
        `;
        try {
            const results = await database.query(query, [grammarTopicId]);
            return results.map((row: any) => ({
                id: row.id,
                content: row.content,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                user: {
                    id: row.userId,
                    fullname: row.fullname,
                    avatar: row.avatar
                },
                VocabularyTopicId: row.VocabularyTopicId,
                GrammarTopicId: row.GrammarTopicId
            }));
        } catch (error) {
            console.error(`Error getting comments with user info for grammar topic ${grammarTopicId}:`, error);
            throw error;
        }
    }

    static async findById(id: number): Promise<Comment | null> {
        const query = 'SELECT * FROM comments WHERE id = ? LIMIT 1';
        try {
            const results = await database.query(query, [id]);
            if (results.length === 0) {
                return null;
            }
            const row = results[0];
            return new CommentBuilder()
                .setId(row.id)
                .setContent(row.content)
                .setCreatedAt(row.createdAt)
                .setUpdatedAt(row.updatedAt)
                .setUserId(row.userId)
                .setVocabularyTopicId(row.VocabularyTopicId)
                .setGrammarTopicId(row.GrammarTopicId)
                .build();
        } catch (error) {
            console.error(`Error finding comment with ID ${id}:`, error);
            throw error;
        }
    }

    static async addComment(comment: Comment): Promise<any> {
        const insertQuery = `
            INSERT INTO comments (content, userId, VocabularyTopicId, GrammarTopicId, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        try {
            const result = await database.query(insertQuery, [
                comment.content,
                comment.userId,
                comment.VocabularyTopicId || null,
                comment.GrammarTopicId || null
            ]);
            
            

            // Lấy comment vừa tạo kèm thông tin user
            const selectQuery = `
                SELECT c.*, u.fullname, u.avatar 
                FROM comments c
                LEFT JOIN users u ON c.userId = u.id
                WHERE c.id = ?
            `;
            const comments = await database.query(selectQuery, [result.insertId]);
            
            if (comments.length === 0) {
                throw new Error('Lỗi khi thêm commment');
            }

            const newComment = comments[0];
            return {
                id: newComment.id,
                content: newComment.content,
                createdAt: newComment.createdAt,
                updatedAt: newComment.updatedAt,
                user: {
                    id: newComment.userId,
                    fullname: newComment.fullname,
                    avatar: newComment.avatar
                },
                VocabularyTopicId: newComment.VocabularyTopicId,
                GrammarTopicId: newComment.GrammarTopicId
            };
        } catch (error) {
            console.error('Lỗi khi thêm comment', error);
            throw error;
        }
    }

    static async updateComment(comment: Comment): Promise<any> {
        const updateQuery = `
            UPDATE comments 
            SET content = ?, updatedAt = NOW()
            WHERE id = ?
        `;

        try {
            await database.query(updateQuery, [comment.content, comment.id]);

            // Lấy comment đã cập nhật kèm thông tin user
            const selectQuery = `
                SELECT c.*, u.fullname, u.avatar 
                FROM comments c
                LEFT JOIN users u ON c.userId = u.id
                WHERE c.id = ?
            `;
            const comments = await database.query(selectQuery, [comment.id]);
            
            if (comments.length === 0) {
                throw new Error('Lỗi khi cập nhật bình luận');
            }

            const updatedComment = comments[0];
            return {
                id: updatedComment.id,
                content: updatedComment.content,
                createdAt: updatedComment.createdAt,
                updatedAt: updatedComment.updatedAt,
                user: {
                    id: updatedComment.userId,
                    fullname: updatedComment.fullname,
                    avatar: updatedComment.avatar
                },
                VocabularyTopicId: updatedComment.VocabularyTopicId,
                GrammarTopicId: updatedComment.GrammarTopicId
            };
        } catch (error) {
            console.error('Lỗi khi cập nhật comment:', error);
            throw error;
        }
    }

    static async deleteComment(id: number): Promise<boolean> {
        const deleteQuery = 'DELETE FROM comments WHERE id = ?';
        
        try {
            const result = await database.query(deleteQuery, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Lỗi khi xóa comment:', error);
            throw error;
        }
    }
}
