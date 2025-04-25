import { Request, Response } from 'express';
import { CommentRepository } from '../repositories/commentRepository';
import { Comment } from '../models/Comment'; // Import model Comment

export class CommentController {

    static async getCommentsByGrammarTopicId(req: Request, res: Response): Promise<Response> {
        const grammarTopicId = parseInt(req.params.grammarTopicId);

        try {
            const comments = await CommentRepository.getAllCommentByGrammarTopicIdWithUser(grammarTopicId);
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
            const comments = await CommentRepository.getAllCommentByVocabularyTopicIdWithUser(vocabularyTopicId);
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

    static async createComment(req: Request, res: Response): Promise<Response> {
        try {
            const { content, userId, VocabularyTopicId, GrammarTopicId } = req.body;
            
            // Validate dữ liệu đầu vào
            if (!content || !userId || (!VocabularyTopicId && !GrammarTopicId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin cần thiết để tạo bình luận'
                });
            }

            // Kiểm tra nội dung bình luận
            if (content.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Nội dung bình luận không được để trống'
                });
            }

            // Tạo đối tượng comment mới
            const newComment = new Comment(
                0, // ID sẽ được database tự động tạo
                content.trim(),
                new Date(),
                new Date(),
                userId,
                VocabularyTopicId || null,
                GrammarTopicId || null
            );

            // Lưu comment vào database
            const savedComment = await CommentRepository.addComment(newComment);

            return res.json({
                success: true,
                data: savedComment,
                message: 'Thêm bình luận thành công'
            });
        } catch (error) {
            console.error('Lỗi khi tạo bình luận:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo bình luận'
            });
        }
    }

    static async findById(req: Request, res: Response): Promise<Response> {
        const commentId = parseInt(req.params.commentId);

        try {
            const comment = await CommentRepository.findById(commentId);
            
            if (!comment) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Không tìm thấy bình luận' 
                });
            }

            return res.json({ 
                success: true, 
                data: comment,
                message: 'Lấy thông tin bình luận thành công' 
            });
        } catch (error) {
            console.error('Error getting comment by ID:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi khi lấy thông tin bình luận' 
            });
        }
    }

    static async updateComment(req: Request, res: Response): Promise<Response> {
        const commentId = parseInt(req.params.commentId);
        const { content } = req.body;

        try {
            // Kiểm tra comment có tồn tại không
            const existingComment = await CommentRepository.findById(commentId);
            if (!existingComment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bình luận'
                });
            }

            // Tạo đối tượng Comment với nội dung mới
            const commentToUpdate = new Comment(
                existingComment.id,
                content,
                existingComment.createdAt,
                new Date(),
                existingComment.userId,
                existingComment.VocabularyTopicId,
                existingComment.GrammarTopicId
            );

            // Cập nhật comment
            const updatedComment = await CommentRepository.updateComment(commentToUpdate);

            return res.json({
                success: true,
                data: updatedComment,
                message: 'Cập nhật bình luận thành công'
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật bình luận:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật bình luận'
            });
        }
    }

    static async deleteComment(req: Request, res: Response): Promise<Response> {
        const commentId = parseInt(req.params.commentId);

        try {
            // Kiểm tra comment có tồn tại không
            const existingComment = await CommentRepository.findById(commentId);
            if (!existingComment) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bình luận'
                });
            }

            // Xóa comment
            await CommentRepository.deleteComment(commentId);

            return res.json({
                success: true,
                message: 'Xóa bình luận thành công'
            });
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa bình luận'
            });
        }
    }
}
