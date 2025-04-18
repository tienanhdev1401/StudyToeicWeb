import { Request, Response } from 'express';
import { VocabularyTopicRepository } from '../repositories/vocabularyTopicRepostitory';
import { VocabularyTopic } from '../models/VocabularyTopic';
import { Vocabulary } from '../models/Vocabulary';

export class VocabularyTopicController {
  /**
   * Lấy tất cả chủ đề từ vựng kèm danh sách từ vựng
   */
  static async getAllVocabularyTopics(req: Request, res: Response) {
    try {
      const topics = await VocabularyTopicRepository.getAllVocabularyTopics();
      
      res.status(200).json({
        success: true,
        data: topics,
        message: 'Lấy danh sách chủ đề thành công'
      });

    } catch (error) {
      console.error('Lỗi khi lấy danh sách chủ đề:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách chủ đề'
      });
    }
  }


  static async findVocabularyTopicById(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);
      
      // Gọi repository
      const topic = await VocabularyTopicRepository.findById(topicId);
      
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chủ đề'
        });
      }
  
      // Trả về response thành công
      res.status(200).json({
        success: true,
        data: topic,
        message: 'Lấy thông tin chủ đề thành công'
      });
  
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chủ đề:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin chủ đề'
      });
    }
  }

  static async addVocabularyTopic(req: Request, res: Response) {
    try {
        // Lấy dữ liệu từ request body
        const { topicName,imageUrl, vocabularies } = req.body;

        // Tạo một đối tượng VocabularyTopic mới
        const newTopic = new VocabularyTopic(0, topicName,imageUrl);

        // Thêm danh sách từ vựng vào topic (nếu có)
        if (vocabularies && Array.isArray(vocabularies)) {
            const vocabularyList = vocabularies.map((v: any) => 
                new Vocabulary(
                    0,
                    v.content,
                    v.meaning,
                    v.synonym || null,
                    v.transcribe || '',
                    v.urlAudio || '',
                    v.urlImage || '',
                    null
                )
            );
            newTopic.addVocabularyList(vocabularyList);
        }

        // Gọi repository để thêm vào database
        const createdTopic = await VocabularyTopicRepository.addVocabularyTopic(newTopic);

        // Trả về kết quả
        res.status(201).json({
            success: true,
            message: 'Vocabulary topic created successfully',
            data: createdTopic
        });
    } catch (error) {
        console.error('Error creating vocabulary topic:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create vocabulary topic',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}


  
}

export default new VocabularyTopicController();