import { Request, Response } from 'express';
import { GrammarTopicRepository } from '../repositories/grammarTopicRepostory';
import { GrammarTopic } from '../models/GrammarTopic';
import { ExerciseRepository } from '../repositories/exerciseRepository';

export class GrammarTopicController {

    static async getAllGrammarTopic(req: Request, res: Response) {
        try {
            const grammarTopics = await GrammarTopicRepository.getAllGranmmarTopic();
            res.status(200).json({
                success: true,
                data: grammarTopics,
                message: 'Lấy danh sách chủ đề thành công'
            });
        } catch (error) {
            console.error('Error in getAllGrammar:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách chủ đề'
            });
        }
    }

    static async findById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ID format'
                });
            }

            const grammarTopic = await GrammarTopicRepository.findById(id);
            
            if (!grammarTopic) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy chủ đề'
                });
            }

            res.status(200).json({
                success: true,
                data: grammarTopic,
                message: 'Lấy thông tin chủ đề thành công'
            });
        } catch (error) {
            console.error('Lỗi khi lấy thông tin chủ đề', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy thông tin chủ đề'
            });
        }
    }

    static async getExercisesByGrammarTopicId(req: Request, res: Response) {
        try {
          const grammarTopicId = parseInt(req.params.grammarTopicId);
          const exercises = await ExerciseRepository.getExercisesByGrammarTopicId(grammarTopicId);
          res.json(exercises);
        } catch (error) {
          res.status(500).json({ message: 'Error fetching exercises for grammar topic' });
        }
      }
}
