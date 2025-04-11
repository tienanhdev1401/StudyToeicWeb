// dictionaryController.ts
import { Request, Response } from 'express';
import { DictionaryRepositories } from '../repositories/dictionaryRepositories';

const dictionaryService = new DictionaryRepositories();

export const lookupWord = async (req: Request, res: Response): Promise<void> => {
  const { word } = req.params;
  
  if (!word) {
    res.status(400).json({ error: 'Word parameter is required' });
    return;
  }
  
  try {
    const result = await dictionaryService.lookup(word);
    
    if (!result) {
      res.status(404).json({ error: 'No definitions found' });
      return;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Dictionary lookup error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};