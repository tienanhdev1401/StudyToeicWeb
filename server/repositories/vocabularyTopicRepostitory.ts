import database from '../config/db';
import { VocabularyTopic } from '../models/VocabularyTopic';
import { Vocabulary } from '../models/Vocabulary';

export class VocabularyTopicRepository {
  /**
   * Tìm VocabularyTopic theo ID
   */
  static async findById(id: number): Promise<VocabularyTopic | null> {
    const results = await database.query(
      'SELECT id, topicName FROM vocabularytopics WHERE id = ? LIMIT 1',
      [id]
    );

    if (Array.isArray(results) && results.length === 0) {
      return null;
    }

    const topicData = results[0] as any;
    const topic = new VocabularyTopic(topicData.id, topicData.topicName, topicData.slug, topicData.imgUrl, topicData.createAt, topicData.updateAt);

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


  /**
   * Lấy tất cả VocabularyTopics
   */
  static async getAllVocabularyTopics(): Promise<VocabularyTopic[]> {
    // 1. Lấy tất cả topics
    const topics = await database.query(
      'SELECT id, topicName, imageUrl, createAt FROM vocabularytopics'
    );

    // 2. Với mỗi topic, lấy danh sách từ vựng tương ứng
    const topicsWithVocabularies = await Promise.all(
      topics.map(async (topic: any) => {
        const vocabularies = await database.query(
          'SELECT * FROM vocabularies WHERE VocabularyTopicId = ?',
          [topic.id]
        );

        const vocabularyList = vocabularies.map((v: any) => 
          new Vocabulary(
            v.id,
            v.content,
            v.meaning,
            v.synonym ? JSON.parse(v.synonym) : null,
            v.transcribe,
            v.urlAudio,
            v.urlImage,
            v.VocabularyTopicId
          )
        );

        const vocabularyTopic = new VocabularyTopic(topic.id, topic.topicName, topic.slug , topic.imgUrl, topic.createAt, topic.updateAt);
        vocabularyTopic.addVocabularyList(vocabularyList);
        
        return vocabularyTopic;
      })
    );

    return topicsWithVocabularies;
  }

  static async addVocabularyTopic(topic: VocabularyTopic): Promise<VocabularyTopic> {
    // 1. Thêm topic vào bảng vocabularytopics
    const topicResult = await database.query(
        'INSERT INTO vocabularytopics (topicName) VALUES (?)',
        [topic.topicName]
    );

    // Lấy ID của topic vừa được thêm
    const topicId = topicResult.insertId;

    // 2. Thêm từng vocabulary vào bảng vocabularies
    if (topic.vocabularies && topic.vocabularies.length > 0) {
        for (const vocab of topic.vocabularies) {
            await database.query(
                `INSERT INTO vocabularies 
                (content, meaning, synonym, transcribe, urlAudio, urlImage, VocabularyTopicId) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    vocab.content,
                    vocab.meaning,
                    vocab.synonym ? JSON.stringify(vocab.synonym) : null,
                    vocab.transcribe,
                    vocab.urlAudio,
                    vocab.urlImage,
                    topicId
                ]
            );
        }
    }


    // Trả về topic đã được thêm cùng với ID mới
    const createdTopic = await this.findById(topicId);
    if (!createdTopic) {
        throw new Error('Failed to create vocabulary topic');
    }
    return createdTopic;
  }


}