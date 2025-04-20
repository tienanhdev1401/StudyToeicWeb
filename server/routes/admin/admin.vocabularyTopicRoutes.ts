import express, { Request, Response } from 'express';
import { VocabularyTopicController } from '../../controllers/admin/admin.vocabularyTopicController';
import { VocabularyController } from '../../controllers/admin/admin.vocabularyController';

const router = express.Router();


router.get('/:slug', VocabularyTopicController.findVocabularyTopicBySlug);
router.get('/:id', VocabularyTopicController.findVocabularyTopicById);
router.get('/:id/vocabularies', VocabularyController.getVocabulariesByTopicId);
// GET /api/admin/vocabulary-topic/:id/count
router.get('/:id/count', VocabularyController.countVocabulariesByTopicId);
// GET /api/admin/vocabulary-topic

router.get('/', VocabularyTopicController.getAllVocabularyTopics);
router.put('/:topicId', VocabularyTopicController.updateVocabularyTopic);
router.post('/', VocabularyTopicController.addVocabularyTopic);
router.delete('/:topicId', VocabularyTopicController.deleteVocabularyTopic);
export default router;