import { Request, Response } from 'express';
import { VocabularyTopicRepository } from '../../repositories/admin/admin.vocabularyTopicRepository';
import { VocabularyTopic } from '../../models/VocabularyTopic';
import { Vocabulary } from '../../models/Vocabulary';
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
      const id = parseInt(req.params.id);
      // Gọi repository
      const topic = await VocabularyTopicRepository.findById(id);
      
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
        const { topicName, imageUrl, vocabularies } = req.body;
        
        // Validate topicName
        if (!topicName || topicName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Topic name is required'
            });
        }
        
        // Check if topic name already exists
        const existingTopics = await VocabularyTopicRepository.getAllVocabularyTopics();
        const topicExists = existingTopics.some(
            item => item.vocabularyTopic.topicName.toLowerCase() === topicName.toLowerCase()
        );
        
        if (topicExists) {
            return res.status(400).json({
                success: false,
                message: 'Topic name already exists'
            });
        }
        
        // Kiểm tra dữ liệu đầu vào
        console.log('req.body',req.body);
        // Tạo một đối tượng VocabularyTopic mới
        const newTopic = new VocabularyTopic(0, topicName, imageUrl, [], [], new Date(), new Date()); 

        // Thêm danh sách từ vựng vào topic (nếu có)
        if (vocabularies && Array.isArray(vocabularies)) {
            const vocabularyList = vocabularies.map((v: any) => {
                // Xử lý synonym - đảm bảo nó là JSON hợp lệ dạng mảng hoặc null
                let processedSynonym = null;
                try {
                    if (v.synonym) {
                        if (typeof v.synonym === 'string') {
                            // Nếu là string, kiểm tra xem có phải JSON array không
                            if (v.synonym.trim().startsWith('[') && v.synonym.trim().endsWith(']')) {
                                // Đã là JSON array string, kiểm tra hợp lệ
                                const parsedArray = JSON.parse(v.synonym);
                                if (Array.isArray(parsedArray)) {
                                    processedSynonym = JSON.stringify(parsedArray);
                                } else {
                                    // Nếu parse được nhưng không phải mảng thì chuyển thành mảng
                                    processedSynonym = JSON.stringify([parsedArray.toString().trim()]);
                                }
                            } else {
                                // Xử lý chuỗi có dấu phẩy thành mảng JSON
                                if (v.synonym.includes(',')) {
                                    const synonymArray = v.synonym.split(',').map((s: string) => s.trim()).filter(Boolean);
                                    processedSynonym = JSON.stringify(synonymArray);
                                } else {
                                    // Chỉ là một từ đơn, chuyển thành mảng có một phần tử
                                    processedSynonym = JSON.stringify([v.synonym.trim()]);
                                }
                            }
                        } else if (Array.isArray(v.synonym)) {
                            // Nếu đã là mảng
                            processedSynonym = JSON.stringify(v.synonym);
                        } else if (typeof v.synonym === 'object') {
                            // Nếu là object, chuyển thành mảng chứa string
                            processedSynonym = JSON.stringify([v.synonym.toString()]);
                        }
                    }
                } catch (error) {
                    console.error('Error processing synonym:', error);
                    processedSynonym = null;
                }

                console.log('processedSynonym', processedSynonym);
                return new Vocabulary(
                    0,
                    v.content,
                    v.meaning,
                    processedSynonym,
                    v.transcribe || '',
                    v.urlAudio || '',
                    v.urlImage || '',
                    null
                );
            });
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

  /**
   * Cập nhật thông tin chủ đề từ vựng
   */
  static async updateVocabularyTopic(req: Request, res: Response) {
    try {
      // Lấy ID từ tham số route
      const topicId = parseInt(req.params.topicId);
      if (isNaN(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic ID',
        });
      }

      // Lấy thông tin chủ đề hiện tại
      const existingTopic = await VocabularyTopicRepository.findById(topicId);
      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          message: 'Vocabulary topic not found',
        });
      }

      // Lấy dữ liệu từ request body
      const { topicName, imageUrl, vocabularies } = req.body;
      
      // Validate topicName
      if (!topicName || topicName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Topic name is required'
        });
      }
      
      // Check if topic name already exists (exclude current topic)
      if (topicName.toLowerCase() !== existingTopic.topicName.toLowerCase()) {
        const existingTopics = await VocabularyTopicRepository.getAllVocabularyTopics();
        const topicExists = existingTopics.some(
          item => item.vocabularyTopic.topicName.toLowerCase() === topicName.toLowerCase() && 
                 item.vocabularyTopic.id !== topicId
        );
        
        if (topicExists) {
          return res.status(400).json({
            success: false,
            message: 'Topic name already exists'
          });
        }
      }
      
    
      // Cập nhật thông tin chủ đề
      const updatedTopic = new VocabularyTopic(
        topicId,
        topicName || existingTopic.topicName,
        imageUrl || existingTopic.imageUrl,
        existingTopic.vocabularies,
        existingTopic.exercises,
        existingTopic.createdAt,
        new Date() // updateAt  
      );

      // Cập nhật danh sách từ vựng nếu được cung cấp
      if (vocabularies && Array.isArray(vocabularies)) {
        const vocabularyList = vocabularies.map((v: any) => {
          // Xử lý synonym - đảm bảo nó là JSON hợp lệ dạng mảng hoặc null
          let processedSynonym = null;
          try {
            if (v.synonym) {
              if (typeof v.synonym === 'string') {
                // Nếu là string, kiểm tra xem có phải JSON array không
                if (v.synonym.trim().startsWith('[') && v.synonym.trim().endsWith(']')) {
                  // Đã là JSON array string, kiểm tra hợp lệ
                  const parsedArray = JSON.parse(v.synonym);
                  if (Array.isArray(parsedArray)) {
                    processedSynonym = JSON.stringify(parsedArray);
                  } else {
                    // Nếu parse được nhưng không phải mảng thì chuyển thành mảng
                    processedSynonym = JSON.stringify([parsedArray.toString().trim()]);
                  }
                } else {
                  // Xử lý chuỗi có dấu phẩy thành mảng JSON
                  if (v.synonym.includes(',')) {
                    const synonymArray = v.synonym.split(',').map((s: string) => s.trim()).filter(Boolean);
                    processedSynonym = JSON.stringify(synonymArray);
                  } else {
                    // Chỉ là một từ đơn, chuyển thành mảng có một phần tử
                    processedSynonym = JSON.stringify([v.synonym.trim()]);
                  }
                }
              } else if (Array.isArray(v.synonym)) {
                // Nếu đã là mảng
                processedSynonym = JSON.stringify(v.synonym);
              } else if (typeof v.synonym === 'object') {
                // Nếu là object, chuyển thành mảng chứa string
                processedSynonym = JSON.stringify([v.synonym.toString()]);
              }
            }
          } catch (error) {
            console.error('Error processing synonym:', error);
            processedSynonym = null;
          }

          return new Vocabulary(
            v.id || 0,
            v.content,
            v.meaning,
            processedSynonym,
            v.transcribe || '',
            v.urlAudio || '',
            v.urlImage || '',
            topicId
          );
        });
        updatedTopic.vocabularies = vocabularyList;
      }

      // Gọi repository để cập nhật vào database
      const result = await VocabularyTopicRepository.updateVocabularyTopic(updatedTopic);

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: 'Vocabulary topic updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error updating vocabulary topic:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update vocabulary topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Xóa chủ đề từ vựng
   */
  static async deleteVocabularyTopic(req: Request, res: Response) {
    try {
      // Lấy ID từ tham số route
      const topicId = parseInt(req.params.topicId);
      console.log('topicId',topicId);
      if (isNaN(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic ID',
        });
      }

      // Kiểm tra xem chủ đề có tồn tại không
      const existingTopic = await VocabularyTopicRepository.findById(topicId);
      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          message: 'Vocabulary topic not found',
        });
      }

      // Gọi repository để xóa chủ đề
      await VocabularyTopicRepository.deleteVocabularyTopic(topicId);

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: 'Vocabulary topic deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting vocabulary topic:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete vocabulary topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new VocabularyTopicController();