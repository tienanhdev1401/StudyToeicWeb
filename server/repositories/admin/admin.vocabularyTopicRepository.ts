import database from '../../config/db';
import { VocabularyTopic } from '../../models/VocabularyTopic';
import { Vocabulary } from '../../models/Vocabulary';
import slugify from 'slugify';
export class VocabularyTopicRepository {
  /**
   * Tìm VocabularyTopic theo ID
   */
  static async findById(topicId: number): Promise<VocabularyTopic | null> {
    const results = await database.query(
      'SELECT * FROM vocabularytopics WHERE id = ? LIMIT 1',
      [topicId]
    );

    if (Array.isArray(results) && results.length === 0) {
      return null;
    }


    const topicData = results[0] as any;
    const topic = new VocabularyTopic(topicData.id, topicData.topicName ,topicData.imageUrl, [], [], topicData.createdAt, topicData.updatedAt);

    // Lấy danh sách vocabularies thuộc topic này
    const vocabResults = await database.query(
      'SELECT * FROM vocabularies WHERE VocabularyTopicId = ?',
      [topicData.id]
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



  // static async findBySlug(slug: string): Promise<VocabularyTopic | null> {
  //   const results = await database.query(
  //     'SELECT id, topicName,slug FROM vocabularytopics WHERE slug = ? LIMIT 1',
  //     [slug]
  //   );

  //   if (Array.isArray(results) && results.length === 0) {
  //     return null;
  //   }


  //   const topicData = results[0] as any;
  //   const topic = new VocabularyTopic(topicData.id, topicData.topicName, topicData.slug ,topicData.imgUrl, topicData.createAt, topicData.updateAt);

  //   // Lấy danh sách vocabularies thuộc topic này
  //   const vocabResults = await database.query(
  //     'SELECT * FROM vocabularies WHERE VocabularyTopicId = ?',
  //     [topicData.id]
  //   );

  //   topic.addVocabularyList(
  //     vocabResults.map((v: any) => new Vocabulary(
  //       v.id,
  //       v.content,
  //       v.meaning,
  //       v.synonym ? JSON.parse(v.synonym) : null,
  //       v.transcribe,
  //       v.urlAudio,
  //       v.urlImage,
  //       v.VocabularyTopicId
  //     ))
  //   );

  //   return topic;
  // }


  /**
   * Lấy tất cả VocabularyTopics
   */
  static async getAllVocabularyTopics(): Promise<{vocabularyTopic: VocabularyTopic, count: number}[]> {
    // 1. Lấy tất cả topics
    const topics = await database.query(
      'SELECT * FROM vocabularytopics'
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

        const count = vocabularyList.length;
        
        const vocabularyTopic = new VocabularyTopic(topic.id, topic.topicName ,topic.imageUrl, vocabularyList, [], topic.createdAt, topic.updatedAt);
        vocabularyTopic.addVocabularyList(vocabularyList);

        return {vocabularyTopic, count};
      })
    );

    return topicsWithVocabularies;
  }

  static async addVocabularyTopic(topic: VocabularyTopic): Promise<VocabularyTopic> {
    // Tạo đối tượng datetime hợp lệ (định dạng YYYY-MM-DD HH:MM:SS)
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // 1. Thêm topic vào bảng vocabularytopics
    const topicResult = await database.query(
        'INSERT INTO vocabularytopics (topicName, imageURL, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
        [topic.topicName, topic.imageUrl, currentDateTime, currentDateTime]
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

  static async updateVocabularyTopic(topic: VocabularyTopic): Promise<VocabularyTopic> {
    // Tạo đối tượng datetime hợp lệ (định dạng YYYY-MM-DD HH:MM:SS)
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // 1. Cập nhật topic trong bảng vocabularytopics
    const topicResult = await database.query(
      'UPDATE vocabularytopics SET topicName = ?,  imageURL = ?, updatedAt = ? WHERE id = ?',
      [topic.topicName,  topic.imageUrl, currentDateTime, topic.id]
    );  

    // 2. Cập nhật từng vocabulary trong bảng vocabularies
    if (topic.vocabularies && topic.vocabularies.length > 0) {
        for (const vocab of topic.vocabularies) {
            await database.query(
                `UPDATE vocabularies  
                SET content = ?, meaning = ?, synonym = ?, transcribe = ?, urlAudio = ?, urlImage = ? 
                WHERE id = ?`,
                [
                    vocab.content,
                    vocab.meaning,
                    vocab.synonym ? JSON.stringify(vocab.synonym) : null,
                    vocab.transcribe, 
                    vocab.urlAudio,
                    vocab.urlImage,
                    vocab.id
                ]
            );
        }
    }     

    // Trả về topic đã được cập nhật
    const updatedTopic = await this.findById(topic.id);
    if (!updatedTopic) {
        throw new Error('Failed to update vocabulary topic');
    }
    return updatedTopic;
  }

  /**
   * Xóa chủ đề từ vựng và tất cả từ vựng liên quan
   */
  static async deleteVocabularyTopic(topicId: number): Promise<boolean> {
    try {
      // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
      await database.query('START TRANSACTION');
      
      // 1. Xóa tất cả từ vựng thuộc chủ đề này
      await database.query(
        'DELETE FROM vocabularies WHERE VocabularyTopicId = ?',
        [topicId]
      );
      
      // 2. Xóa chủ đề
      await database.query(
        'DELETE FROM vocabularytopics WHERE id = ?',
        [topicId]
      );
      
      // Commit transaction nếu mọi thứ thành công
      await database.query('COMMIT');
      
      return true;
    } catch (error) {
      // Rollback nếu có lỗi
      await database.query('ROLLBACK');
      console.error('Error deleting vocabulary topic:', error);
      throw error;
    }
  }

}