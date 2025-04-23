import express, { Request, Response } from 'express';
import { VocabularyController } from '../../controllers/admin/admin.vocabularyController';

const router = express.Router();

// GET /api/admin/vocabulary-topics
// GET /api/admin/vocabulary-topic/:topicId/vocabularies/:id
router.get('/:id', VocabularyController.getVocabularyById);
// POST /api/admin/vocabulary-topic/:topicId/vocabularies
router.post('/', VocabularyController.addVocabulary);
// PUT /api/admin/vocabulary-topic/:topicId/vocabularies/:id
router.put('/:id', VocabularyController.updateVocabulary);
// DELETE /api/admin/vocabulary-topic/:topicId/vocabularies/:id
router.delete('/:id', VocabularyController.deleteVocabulary);
router.post('/import/:topicId', VocabularyController.importVocabulariesFromExcel);
export default router;