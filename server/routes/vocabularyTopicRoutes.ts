import express, { Request, Response } from 'express';
import { VocabularyTopicController } from '../controllers/vocabularyTopicController';
import {VocabularyController} from '../controllers/vocabularyController';

const router = express.Router();

// GET /api/vocabulary-topics
router.get('/', VocabularyTopicController.getAllVocabularyTopics);

router.get('/:id', VocabularyTopicController.findVocabularyTopicById);


// router.post('/', VocabularyTopicController.addVocabularyTopic);
router.get('/:id/vocabularies', VocabularyController.getVocabulariesByTopicId);

router.get('/:id/exercise', VocabularyTopicController.getExercisesForGrammarTopic);
export default router;