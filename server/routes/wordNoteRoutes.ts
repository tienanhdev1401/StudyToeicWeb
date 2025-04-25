import express from 'express';
import { WordNoteController } from '../controllers/wordNoteController';

const router = express.Router();

// === WordNote Routes ===

// Lấy danh sách WordNote theo LearnerId
router.get('/learner/:learnerId', WordNoteController.getWordNotesByLearnerId);

// Lấy chi tiết một WordNote theo ID
router.get('/:wordNoteId', WordNoteController.getWordNoteById);

// Tạo WordNote mới
router.post('/', WordNoteController.createWordNote);

// Cập nhật WordNote
router.put('/:wordNoteId', WordNoteController.updateWordNote);

// Xóa WordNote
router.delete('/:wordNoteId', WordNoteController.deleteWordNote);

// === WordNote-Vocabulary Link Routes ===

// Thêm Vocabulary vào WordNote
router.post('/:wordNoteId/vocabularies', WordNoteController.addVocabularyToWordNote);

// Xóa Vocabulary khỏi WordNote
router.delete('/:wordNoteId/vocabularies/:vocabularyId', WordNoteController.removeVocabularyFromWordNote);

export default router; 