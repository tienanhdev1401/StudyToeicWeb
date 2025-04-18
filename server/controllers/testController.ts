import { Request, Response } from 'express';
import { TestRepository } from '../repositories/testRepository';
import { PartRepository } from '../repositories/partRepository';
import { QuestionInAPartRepository } from '../repositories/questionInAPartRepository';
import { QuestionController } from './questionController';

export class TestController {
  private testRepository: TestRepository;
  private partRepository: PartRepository;
  private questionInAPartRepository: QuestionInAPartRepository;
  private questionController: QuestionController;

  constructor() {
    this.testRepository = new TestRepository();
    this.partRepository = new PartRepository();
    this.questionInAPartRepository = new QuestionInAPartRepository();
    this.questionController = new QuestionController();
  }

  async getTestById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      const test = await this.testRepository.findById(id);
      if (!test) {
        return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
      }
      const parts = await this.partRepository.findByTestId(test.id);
      test.parts = parts;

      for (const part of parts) {
        const questionInAParts = await this.questionInAPartRepository.findByPartId(part.id);
        part.questions = questionInAParts;

        const questionIds = questionInAParts.map(qp => qp.QuestionId);
        const questions = await this.questionController.getQuestionsByIds(questionIds);

        for (const questionInAPart of questionInAParts) {
          questionInAPart.question = questions.find(q => q.id === questionInAPart.QuestionId);
        }
      }

      return res.status(200).json(test);
    } catch (error) {
      console.error('TestController.getTestById error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }
}