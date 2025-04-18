import express, { Request, Response } from 'express';
import { VocabularyTopicController } from '../../controllers/admin/admin.vocabularyTopicController';
import { VocabularyController } from '../../controllers/admin/admin.vocabularyController';

const router = express.Router();


router.get('/:id', VocabularyTopicController.findVocabularyTopicById);


// GET /api/admin/vocabulary-topic/:id/count
router.get('/:id/count', VocabularyController.countVocabulariesByTopicId);
// GET /api/admin/vocabulary-topic

router.get('/', VocabularyTopicController.getAllVocabularyTopics);

router.post('/', VocabularyTopicController.addVocabularyTopic);
export default router;