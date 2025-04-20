import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { QuestionRepository } from '../repositories/questionRepository';
export class QuestionController {
  private questionRepository: QuestionRepository;
  constructor() {
    this.questionRepository = new QuestionRepository();
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      const question = await this.questionRepository.findById(id);
      if (!question) {
        return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
      }
      return res.status(200).json({ ...question});
    } catch (error) {
      console.error('QuestionController.getById error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }

  async getQuestionsByIds(ids: number[]): Promise<Question[]> {
    return this.questionRepository.findByIds(ids);
  }
}