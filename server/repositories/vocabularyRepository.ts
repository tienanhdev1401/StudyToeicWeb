import database from '../config/db';
import { Vocabulary } from '../models/Vocabulary';

export class VocabularyRepository {
  /**
   * Get vocabulary by ID
   */
  static async getVocabularyById(id: number): Promise<Vocabulary | null> {
    try {
      const results = await database.query(
        `SELECT 
          id, 
          content, 
          meaning, 
          synonym, 
          transcribe, 
          urlAudio, 
          urlImage, 
          VocabularyTopicId
        FROM vocabularies 
        WHERE id = ? 
        LIMIT 1`,
        [id]
      );

      if (Array.isArray(results) && results.length === 0) {
        return null;
      }

      const vocabData = results[0] as any;
      return new Vocabulary(
        vocabData.id,
        vocabData.content,
        vocabData.meaning,
        vocabData.synonym ? JSON.parse(vocabData.synonym) : null,
        vocabData.transcribe,
        vocabData.urlAudio,
        vocabData.urlImage,
        vocabData.VocabularyTopicId
      );
    } catch (error) {
      console.error('Error getting vocabulary by ID:', error);
      throw error;
    }
  }

  /**
   * Get all vocabularies
   */
  static async getAllVocabularies(): Promise<Vocabulary[]> {
    try {
      const results = await database.query(
        `SELECT 
          id, 
          content, 
          meaning, 
          transcribe,
          urlAudio,
          urlImage,
          VocabularyTopicId
        FROM vocabularies`
      );

      return results.map((v: any) => new Vocabulary(
        v.id,
        v.content,
        v.meaning,
        v.synonym ? JSON.parse(v.synonym) : null,
        v.transcribe,
        v.urlAudio,
        v.urlImage,
        v.VocabularyTopicId
      ));
    } catch (error) {
      console.error('Error getting all vocabularies:', error);
      throw error;
    }
  }

  /**
   * Get vocabularies by VocabularyTopic ID
   */
  static async getVocabulariesByTopicId(topicId: number): Promise<Vocabulary[]> {
    try {
      const results = await database.query(
        `SELECT 
          id, 
          content, 
          meaning, 
          synonym, 
          transcribe, 
          urlAudio, 
          urlImage
        FROM vocabularies 
        WHERE VocabularyTopicId = ?`,
        [topicId]
      );

      return results.map((v: any) => new Vocabulary(
        v.id,
        v.content,
        v.meaning,
        v.synonym ? JSON.parse(v.synonym) : null,
        v.transcribe,
        v.urlAudio,
        v.urlImage,
        topicId
      ));
    } catch (error) {
      console.error('Error getting vocabularies by topic ID:', error);
      throw error;
    }
  }
}