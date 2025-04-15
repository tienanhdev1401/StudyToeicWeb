// routes.ts
import express from 'express';
import { lookupWord } from '../controllers/dictionaryController';

const router = express.Router();

router.get('/:word', lookupWord);

export default router;