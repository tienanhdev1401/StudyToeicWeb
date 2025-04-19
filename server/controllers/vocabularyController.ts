import { Request, Response } from 'express';
import { VocabularyRepository } from '../repositories/vocabularyRepository';

export class VocabularyController {
  /**
   * Lấy tất cả từ vựng
   */
  static async getAllVocabularies(req: Request, res: Response) {
    try {
      const vocabularies = await VocabularyRepository.getAllVocabularies();
      res.status(200).json({
        success: true,
        data: vocabularies,
        message: 'Lấy danh sách từ vựng thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách từ vựng:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách từ vựng'
      });
    }
  }

  /**
   * Lấy từ vựng theo ID
   */
  static async getVocabularyById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const vocabulary = await VocabularyRepository.getVocabularyById(id);

      if (!vocabulary) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy từ vựng'
        });
      }

      res.status(200).json({
        success: true,
        data: vocabulary,
        message: 'Lấy thông tin từ vựng thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy từ vựng theo ID:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy từ vựng'
      });
    }
  }

  /**
   * Lấy danh sách từ vựng theo ID của chủ đề
   */
  static async getVocabulariesByTopicId(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);
      const vocabularies = await VocabularyRepository.getVocabulariesByTopicId(topicId);
      res.status(200).json({
        success: true,
        data: vocabularies,
        message: 'Lấy danh sách từ vựng theo chủ đề thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy từ vựng theo chủ đề:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách từ vựng theo chủ đề'
      });
    }
  }
}

export default new VocabularyController();
