import { Request, Response } from 'express';
import { VocabularyTopicRepository } from '../../repositories/admin/admin.vocabularyTopicRepository';
import { VocabularyRepository } from '../../repositories/admin/admin.vocabularyRepository';
import { VocabularyTopic } from '../../models/VocabularyTopic';
import { Vocabulary } from '../../models/Vocabulary';

export class VocabularyController {
 
    static async countVocabulariesByTopicId(req: Request, res: Response) {
    
        try {
            const topicId = parseInt(req.params.topicId);
            const count = await VocabularyRepository.countVocabulariesByTopicId(topicId);
            
            res.status(200).json({
                success: true,
                data: count,
                message: 'Lấy số lượng từ vựng theo chủ đề thành công'
            });
        } catch (error) {
            console.error('Lỗi khi lấy số lượng từ vựng theo chủ đề:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy số lượng từ vựng theo chủ đề'
            });
        }
    }

  
}

export default new VocabularyController();