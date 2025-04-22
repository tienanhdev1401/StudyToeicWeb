import express from 'express';
import { CommentController } from '../controllers/commentController';

const router = express.Router();

// GET /api/comments/grammar/:grammarTopicId - Lấy comments theo chủ đề ngữ pháp
router.get('/grammar-topic/:grammarTopicId', CommentController.getCommentsByGrammarTopicId);

// GET /api/comments/vocabulary/:vocabularyTopicId - Lấy comments theo chủ đề từ vựng
router.get('/vocabulary-topic/:vocabularyTopicId', CommentController.getCommentsByVocabularyTopicId);




export default router;
