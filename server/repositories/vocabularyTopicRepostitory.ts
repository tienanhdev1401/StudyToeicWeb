import database from '../config/db';
import { VocabularyTopic } from '../models/VocabularyTopic';
import { Vocabulary } from '../models/Vocabulary';
import { VocabularyRepository } from './vocabularyRepository';

export class VocabularyTopicRepository {
  /**
   * Tìm VocabularyTopic theo ID
   */
  static async findById(id: number): Promise<VocabularyTopic | null> {
    const results = await database.query(
      'SELECT id, topicName, imageUrl FROM vocabularytopics WHERE id = ? LIMIT 1',
      [id]
    );
  
    if (Array.isArray(results) && results.length === 0) {
      return null;
    }
  
    const topicData = results[0] as any;
    const topic = new VocabularyTopic(topicData.id, topicData.topicName, topicData.imageUrl);
  
    // Lấy danh sách vocabularies từ VocabularyRepository
    const vocabularies = await VocabularyRepository.getVocabulariesByTopicId(id);
    topic.addVocabularyList(vocabularies);
  
    return topic;
  }


  static async getAllVocabularyTopics(): Promise<VocabularyTopic[]> {
    // Lấy tất cả topics
    const topics = await database.query(
      'SELECT id, topicName, imageUrl FROM vocabularytopics'
    );

    // Tạo danh sách VocabularyTopic với vocabularyList rỗng
    const topicList = topics.map((topic: any) => 
      new VocabularyTopic(topic.id, topic.topicName, topic.imageUrl)
    );

    return topicList;
}


}