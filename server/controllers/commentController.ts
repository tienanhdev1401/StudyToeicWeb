import { Request, Response } from 'express';
import { CommentRepository } from '../repositories/commentRepository';
import { Comment } from '../models/Comment'; // Import model Comment

export class CommentController {

    static async getCommentsByGrammarTopicId(req: Request, res: Response): Promise<Response> {
        const grammarTopicId = parseInt(req.params.grammarTopicId);

        try {
            const comments = await CommentRepository.getAllCommentByGrammarTopicId(grammarTopicId);
            return res.json({ 
                success: true, 
                data: comments,
                message: 'Lấy danh sách comment thành công' 
            });
        } catch (error) {
            console.error('Error getting comments by grammar topic ID:', error);
            return res.status(500).json({ success: false, message: 'Failed to get comments' });
        }
    }


    static async getCommentsByVocabularyTopicId(req: Request, res: Response): Promise<Response> {
        const vocabularyTopicId = parseInt(req.params.vocabularyTopicId);

        try {
            const comments = await CommentRepository.getAllCommentByVocabularyTopicId(vocabularyTopicId);
            return res.json({ 
                success: true, 
                data: comments,
                message: 'Lấy danh sách comment thành công' 
            });
        } catch (error) {
            console.error('Error getting comments by vocabulary topic ID:', error);
            return res.status(500).json({ success: false, message: 'Failed to get comments' });
        }
    }


}
