import express from 'express';
import { CommentController } from '../controllers/commentController';

const router = express.Router();

// GET /api/comments/grammar/:grammarTopicId - Lấy comments theo chủ đề ngữ pháp
router.get('/grammar-topic/:grammarTopicId', CommentController.getCommentsByGrammarTopicId);

// GET /api/comments/vocabulary/:vocabularyTopicId - Lấy comments theo chủ đề từ vựng
router.get('/vocabulary-topic/:vocabularyTopicId', CommentController.getCommentsByVocabularyTopicId);

// GET /api/comments/:commentId - Lấy comment theo ID
router.get('/:commentId', CommentController.findById);

// PUT /api/comments/:commentId - Cập nhật comment
router.put('/:commentId', CommentController.updateComment);

// DELETE /api/comments/:commentId - Xóa comment
router.delete('/:commentId', CommentController.deleteComment);

router.post('/', CommentController.createComment);

export default router;
