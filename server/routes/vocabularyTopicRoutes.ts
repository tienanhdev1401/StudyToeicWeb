import express, { Request, Response } from 'express';
import { VocabularyTopicController } from '../controllers/vocabularyTopicController';

const router = express.Router();

// GET /api/vocabulary-topics
router.get('/', VocabularyTopicController.getAllVocabularyTopics);

router.get('/:id', VocabularyTopicController.findVocabularyTopicById);


router.post('/', VocabularyTopicController.addVocabularyTopic);
export default router;