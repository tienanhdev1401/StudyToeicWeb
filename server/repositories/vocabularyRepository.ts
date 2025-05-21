import database from '../config/db';
import { Vocabulary } from '../models/Vocabulary';
import { VocabularyBuilder } from '../builder/VocabularyBuilder';

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
      return new VocabularyBuilder()
        .setId(vocabData.id)
        .setContent(vocabData.content)
        .setMeaning(vocabData.meaning)
        .setSynonym(vocabData.synonym ? JSON.parse(vocabData.synonym) : null)
        .setTranscribe(vocabData.transcribe)
        .setUrlAudio(vocabData.urlAudio)
        .setUrlImage(vocabData.urlImage)
        .setVocabularyTopicId(vocabData.VocabularyTopicId)
        .build();
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

      return results.map((v: any) => new VocabularyBuilder()
        .setId(v.id)
        .setContent(v.content)
        .setMeaning(v.meaning)
        .setSynonym(v.synonym ? JSON.parse(v.synonym) : null)
        .setTranscribe(v.transcribe)
        .setUrlAudio(v.urlAudio)
        .setUrlImage(v.urlImage)
        .setVocabularyTopicId(v.VocabularyTopicId)
        .build());
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

      return results.map((v: any) => new VocabularyBuilder()
        .setId(v.id)
        .setContent(v.content)
        .setMeaning(v.meaning)
        .setSynonym(v.synonym ? JSON.parse(v.synonym) : null)
        .setTranscribe(v.transcribe)
        .setUrlAudio(v.urlAudio)
        .setUrlImage(v.urlImage)
        .setVocabularyTopicId(topicId)
        .build());
    } catch (error) {
      console.error('Error getting vocabularies by topic ID:', error);
      throw error;
    }
  }
  static async countVocabulariesByTopicId(topicId: number): Promise<number> {
    const results = await database.query(
        'SELECT COUNT(*) as count FROM vocabularies WHERE VocabularyTopicId = ?',
        [topicId]
    );
    return results[0].count;
  }
}