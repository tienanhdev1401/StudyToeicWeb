import { Request, Response } from 'express';
import { grammarTopicRepository } from '../../repositories/admin/admin.grammarTopicRepository';
import { GrammarTopic } from '../../models/GrammarTopic';

export class GrammarTopicController {
  /**
   * Lấy tất cả chủ đề grammar
   */
  static async getAllGrammarTopics(req: Request, res: Response) {
    try {
      const topics = await grammarTopicRepository.getAllGrammarTopics();
  
      res.status(200).json({
        success: true,
        data: topics,
        message: 'Lấy danh sách chủ đề grammar thành công'
      });

    } catch (error) {
      console.error('Lỗi khi lấy danh sách chủ đề grammar:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách chủ đề grammar'
      });
    }
  }

  /**
   * Lấy thông tin chủ đề grammar theo ID
   */
  static async findGrammarTopicById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      // Gọi repository
      const topic = await grammarTopicRepository.findById(id);
      
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chủ đề grammar' 
        });
      }
  
      // Trả về response thành công
      res.status(200).json({
        success: true,
        data: topic,
        message: 'Lấy thông tin chủ đề grammar thành công'
      });
  
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chủ đề grammar:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin chủ đề grammar'
      });
    }
  }

  /**
   * Thêm mới chủ đề grammar
   */
  static async addGrammarTopic(req: Request, res: Response) {
    try {
      // Lấy dữ liệu từ request body
      const { title, content, imageUrl } = req.body;
      
      // Validate title
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề chủ đề không được để trống'
        });
      }
      
      // Gọi repository để thêm vào database
      const createdTopic = await grammarTopicRepository.addGrammarTopic(title, content, imageUrl);

      // Trả về kết quả
      res.status(201).json({
        success: true,
        message: 'Tạo chủ đề grammar thành công',
        data: createdTopic
      });
    } catch (error) {
      console.error('Lỗi khi tạo chủ đề grammar:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi tạo chủ đề grammar',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cập nhật chủ đề grammar
   */
  static async updateGrammarTopic(req: Request, res: Response) {
    try {
      // Lấy ID từ tham số route
      const topicId = parseInt(req.params.id);
      if (isNaN(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chủ đề không hợp lệ',
        });
      }

      // Lấy thông tin chủ đề hiện tại
      const existingTopic = await grammarTopicRepository.findById(topicId);
      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chủ đề grammar',
        });
      }

      // Lấy dữ liệu từ request body
      const { title, content, imageUrl } = req.body;
      
      // Validate title
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề chủ đề không được để trống'
        });
      }
      
      // Gọi repository để cập nhật vào database
      const result = await grammarTopicRepository.updateGrammarTopic(topicId, title, content, imageUrl);

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: 'Cập nhật chủ đề grammar thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật chủ đề grammar:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật chủ đề grammar',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Xóa chủ đề grammar
   */
  static async deleteGrammarTopic(req: Request, res: Response) {
    try {
      // Lấy ID từ tham số route
      const topicId = parseInt(req.params.id);
      if (isNaN(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chủ đề không hợp lệ',
        });
      }

      // Kiểm tra xem chủ đề có tồn tại không
      const existingTopic = await grammarTopicRepository.findById(topicId);
      if (!existingTopic) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chủ đề grammar',
        });
      }

      // Gọi repository để xóa chủ đề
      await grammarTopicRepository.deleteGrammarTopic(topicId);

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: 'Xóa chủ đề grammar thành công',
      });
    } catch (error) {
      console.error('Lỗi khi xóa chủ đề grammar:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa chủ đề grammar',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new GrammarTopicController();