import database from '../config/db';
import { VocabularyTopic } from '../models/VocabularyTopic';
import { Vocabulary } from '../models/Vocabulary';

export class VocabularyTopicRepository {
  /**
   * Tìm VocabularyTopic theo ID
   */
  static async findById(id: number): Promise<VocabularyTopic | null> {
    const results = await database.query(
      'SELECT id, topicName,imageUrl FROM vocabularytopics WHERE id = ? LIMIT 1',
      [id]
    );

    if (Array.isArray(results) && results.length === 0) {
      return null;
    }

    const topicData = results[0] as any;
    const topic = new VocabularyTopic(topicData.id, topicData.topicName,topicData.imageUrl);

    // Lấy danh sách vocabularies thuộc topic này
    const vocabResults = await database.query(
      'SELECT * FROM vocabularies WHERE VocabularyTopicId = ?',
      [id]
    );

    topic.addVocabularyList(
      vocabResults.map((v: any) => new Vocabulary(
        v.id,
        v.content,
        v.meaning,
        v.synonym ? JSON.parse(v.synonym) : null,
        v.transcribe,
        v.urlAudio,
        v.urlImage,
        v.VocabularyTopicId
      ))
    );

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

  static async addVocabularyTopic(topic: VocabularyTopic): Promise<VocabularyTopic> {
    try {
        // 1. Thêm topic vào bảng vocabularytopics
        const topicResult = await database.query(
            'INSERT INTO vocabularytopics (topicName, imageUrl) VALUES (?, ?)',
            [topic.topicName, topic.imageUrl]
        );

        // 2. Lấy ID của topic vừa được thêm
        const topicId = topicResult.insertId;

        // 3. Tạo và trả về đối tượng VocabularyTopic mới
        return new VocabularyTopic(
            topicId,
            topic.topicName,
            topic.imageUrl
            // Danh sách từ vựng rỗng (không thêm từ vựng)
        );

    } catch (error) {
        // Xử lý lỗi và ném ra ngoài
        console.error('Error adding vocabulary topic:', error);
        throw new Error('Failed to add vocabulary topic');
    }
  }

}