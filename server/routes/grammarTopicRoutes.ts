import express, { Request, Response } from 'express';
import { GrammarTopicController } from '../controllers/grammarTopicController';

const router = express.Router();

// Main endpoints
router.get('/', GrammarTopicController.getAllGrammarTopic);
router.get('/:id', GrammarTopicController.findById);

// Bonus endpoints
// router.post('/', GrammarController.createGrammarTopic);
// router.put('/:id', GrammarController.updateGrammarTopic);
// router.delete('/:id', GrammarController.deleteGrammarTopic);

export default router;