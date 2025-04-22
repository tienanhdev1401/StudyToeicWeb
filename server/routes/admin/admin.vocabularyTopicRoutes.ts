import express, { Request, Response } from 'express';
import { VocabularyTopicController } from '../../controllers/admin/admin.vocabularyTopicController';
import { VocabularyController } from '../../controllers/admin/admin.vocabularyController';

const router = express.Router();


// GET /api/admin/vocabulary-topic/:id/count
router.get('/:id/count', VocabularyController.countVocabulariesByTopicId);
// GET /api/admin/vocabulary-topic/:id
router.get('/:id', VocabularyTopicController.findVocabularyTopicById);
// GET /api/admin/vocabulary-topic
router.get('/', VocabularyTopicController.getAllVocabularyTopics);
// PUT /api/admin/vocabulary-topic/:topicId
router.put('/:topicId', VocabularyTopicController.updateVocabularyTopic);
// POST /api/admin/vocabulary-topic
router.post('/', VocabularyTopicController.addVocabularyTopic);
// DELETE /api/admin/vocabulary-topic/:topicId
router.delete('/:topicId', VocabularyTopicController.deleteVocabularyTopic);
// GET /api/admin/vocabulary-topic/:slug
router.get('/:slug', VocabularyTopicController.findVocabularyTopicBySlug);

//api vocabulary
// GET /api/admin/vocabulary-topic/:id/vocabularies
router.get('/:id/vocabularies', VocabularyController.getVocabulariesByTopicId);


export default router;