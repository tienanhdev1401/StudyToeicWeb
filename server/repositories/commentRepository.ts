import database from '../config/db';
import { Comment } from '../models/Comment';

export class CommentRepository {


    static async getAllCommentByGrammarTopicId(grammarTopicId: number): Promise<Comment[]> {
        const query = 'SELECT * FROM comments WHERE GrammarTopicId = ? ORDER BY createdAt DESC';
        try {
            const results = await database.query(query, [grammarTopicId]);
            // Map rows directly to Comment objects
            return results.map((row: any) => new Comment(
                row.id,
                row.content,
                row.createdAt,
                row.updatedAt,
                row.userId,
                row.VocabularyTopicId, 
                row.GrammarTopicId
            ));
        } catch (error) {
            console.error(`Error getting comments for grammar topic ${grammarTopicId}:`, error);
            throw error;
        }
    }


    static async getAllCommentByVocabularyTopicId(vocabularyTopicId: number): Promise<Comment[]> {
        const query = 'SELECT * FROM comments WHERE VocabularyTopicId = ? ORDER BY createdAt DESC';
        try {
            const results = await database.query(query, [vocabularyTopicId]);
            // Map rows directly to Comment objects
            return results.map((row: any) => new Comment(
                row.id,
                row.content,
                row.createdAt,
                row.updatedAt,
                row.userId,
                row.VocabularyTopicId,
                row.GrammarTopicId
            ));
        } catch (error) {
            console.error(`Error getting comments for vocabulary topic ${vocabularyTopicId}:`, error);
            throw error;
        }
    }


    // static async addComment(comment: Comment): Promise<Comment> { 
    //     const { content, userId, VocabularyTopicId, GrammarTopicId } = comment;
    //     const vocabId = VocabularyTopicId !== undefined ? VocabularyTopicId : null;
    //     const grammarId = GrammarTopicId !== undefined ? GrammarTopicId : null;

    //     const query = 'INSERT INTO comments (content, userId, VocabularyTopicId, GrammarTopicId) VALUES (?, ?, ?, ?)';
    //     try {
    //         const result = await database.query(query, [content, userId, vocabId, grammarId]);
            
    //         if (!result || typeof result.insertId !== 'number') {
    //              throw new Error('Failed to insert comment or retrieve insertId.');
    //         }
    //         const newCommentId = result.insertId;

    //         const newComment = await this.findById(newCommentId);
    //          if (!newComment) {
    //             throw new Error('Failed to retrieve the newly added comment after insert.');
    //         }
    //         return newComment;

    //     } catch (error) {
    //         console.error('Error adding comment:', error);
    //         throw error;
    //     }
    // }

    /**
     * Finds a single comment by its ID.
     */
    static async findById(id: number): Promise<Comment | null> {
        const query = 'SELECT * FROM comments WHERE id = ? LIMIT 1';
        try {
            const results = await database.query(query, [id]);
            if (results.length === 0) {
                return null; // Not found
            }
            const row = results[0];
            // Create Comment object directly from the row
            return new Comment(
                row.id,
                row.content,
                row.createdAt,
                row.updatedAt,
                row.userId,
                row.VocabularyTopicId,
                row.GrammarTopicId
            );
        } catch (error) {
            console.error(`Error finding comment with ID ${id}:`, error);
            throw error;
        }
    }

   
    // static async updateCommentContent(commentId: number, content: string, userId: number): Promise<boolean> {
    //     // Optional: Add userId check to ensure only the owner can update?
    //     const query = 'UPDATE comments SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?';
    //     try {
    //         const result = await database.query(query, [content, commentId, userId]);
    //         return result.affectedRows > 0;
    //     } catch (error) {
    //         console.error(`Error updating comment with ID ${commentId}:`, error);
    //         throw error;
    //     }
    // }
    // static async deleteComment(commentId: number, userId: number): Promise<boolean> {
    //     // Optional: Add userId check to ensure only the owner can delete?
    //     const query = 'DELETE FROM comments WHERE id = ? AND userId = ?';
    //     try {
    //         const result = await database.query(query, [commentId, userId]);
    //         return result.affectedRows > 0;
    //     } catch (error) {
    //         console.error(`Error deleting comment with ID ${commentId}:`, error);
    //         throw error;
    //     }
    // }

    // /**
    //  * Finds all comments by a specific user on a specific VocabularyTopic.
    //  */
    // static async findCommentByUserIdAndVocabularyId(userId: number, vocabularyTopicId: number): Promise<Comment[]> {
    //     const query = 'SELECT * FROM comments WHERE userId = ? AND VocabularyTopicId = ? ORDER BY createdAt DESC';
    //     try {
    //         const results = await database.query(query, [userId, vocabularyTopicId]);
    //         // Map rows directly to Comment objects
    //         return results.map((row: any) => new Comment(
    //             row.id,
    //             row.content,
    //             row.createdAt,
    //             row.updatedAt,
    //             row.userId,
    //             row.VocabularyTopicId,
    //             row.GrammarTopicId
    //         ));
    //     } catch (error) {
    //         console.error(`Error finding comments for user ${userId} and vocabulary topic ${vocabularyTopicId}:`, error);
    //         throw error;
    //     }
    // }

    // /**
    //  * Finds all comments by a specific user on a specific GrammarTopic.
    //  */
    // static async findCommentByUserIdAndGrammarId(userId: number, grammarTopicId: number): Promise<Comment[]> {
    //     const query = 'SELECT * FROM comments WHERE userId = ? AND GrammarTopicId = ? ORDER BY createdAt DESC';
    //     try {
    //         const results = await database.query(query, [userId, grammarTopicId]);
    //         // Map rows directly to Comment objects
    //         return results.map((row: any) => new Comment(
    //             row.id,
    //             row.content,
    //             row.createdAt,
    //             row.updatedAt,
    //             row.userId,
    //             row.VocabularyTopicId,
    //             row.GrammarTopicId
    //         ));
    //     } catch (error) {
    //         console.error(`Error finding comments for user ${userId} and grammar topic ${grammarTopicId}:`, error);
    //         throw error;
    //     }
    // }

}
