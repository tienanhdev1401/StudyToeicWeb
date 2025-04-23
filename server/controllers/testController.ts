import { TestCollectionRepository } from './../repositories/testCollectionRepository';
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
  private testCollectionRepository: TestCollectionRepository;

  constructor() {
    this.testRepository = new TestRepository();
    this.partRepository = new PartRepository();
    this.questionInAPartRepository = new QuestionInAPartRepository();
    this.questionController = new QuestionController();
    this.testCollectionRepository = new TestCollectionRepository();
  }
  getRandomCompletions(): string {
    // Random từ 5000 đến 50000
    const num = Math.floor(Math.random() * (50000 - 5000) + 5000);
    // Format số với dấu chấm phân cách hàng nghìn
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  async getAllTests(req: Request, res: Response) {
    try {
      // Lấy tất cả các bài test
      const tests = await this.testRepository.findAll();
  
      // Nhóm các bài test theo testCollection
      const grouped: Record<string, any[]> = {};
      tests.forEach(test => {
        const collectionKey = test.testCollection || 'Khác';
        if (!grouped[collectionKey]) {
          grouped[collectionKey] = [];
        }
        grouped[collectionKey].push({
          id: test.id,
          name: test.title,
          completions: this.getRandomCompletions()
        });
      });
  
      // Format lại thành mảng
      const result = Object.entries(grouped).map(([title, tests], index) => ({
        id: index + 1, // Tạo id tạm (auto-increment)
        title,
        tests
      }));
  
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllTests:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
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