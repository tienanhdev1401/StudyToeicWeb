import { Request, Response } from 'express';
import { TestRepository } from '../../repositories/admin/admin.testRepository';
import { PartRepository } from '../../repositories/admin/admin.partRepositpry';
import { QuestionInAPartRepository } from '../../repositories/admin/admin.questionInAPartRepository';
import { TestCollectionRepository } from '../../repositories/admin/admin.testCollectionRepository';
import { Test } from '../../models/Test';
import { Part } from '../../models/Part';

export class AdminTestController {
  private testRepository: TestRepository;
  private partRepository: PartRepository;
  private questionInAPartRepository: QuestionInAPartRepository;
  private testCollectionRepository: TestCollectionRepository;

  constructor() {
    this.testRepository = new TestRepository();
    this.partRepository = new PartRepository();
    this.questionInAPartRepository = new QuestionInAPartRepository();
    this.testCollectionRepository = new TestCollectionRepository();
  }

  async getAllTests(req: Request, res: Response) {
    try {
      const tests = await this.testRepository.findAll();
      return res.status(200).json(tests);
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
      }

      return res.status(200).json(test);
    } catch (error) {
      console.error('AdminTestController.getTestById error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }

  async createTest(req: Request, res: Response) {
    try {
      const { title, testCollection, duration } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Tiêu đề bài test là bắt buộc' });
      }
      
      const newTest = new Test(0, title, testCollection, duration);
      const savedTest = await this.testRepository.create(newTest);
      
      return res.status(201).json(savedTest);
    } catch (error) {
      console.error('Error in createTest:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTest(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      const { title, testCollection, duration } = req.body;
      
      const existingTest = await this.testRepository.findById(id);
      if (!existingTest) {
        return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
      }
      
      existingTest.title = title || existingTest.title;
      existingTest.testCollection = testCollection || existingTest.testCollection;
      existingTest.duration = duration || existingTest.duration;
      existingTest.updatedAt = new Date();
      
      const updatedTest = await this.testRepository.update(existingTest);
      return res.status(200).json(updatedTest);
    } catch (error) {
      console.error('Error in updateTest:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteTest(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      const existingTest = await this.testRepository.findById(id);
      if (!existingTest) {
        return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
      }
      
      // Xóa tất cả các parts liên quan đến test này
      const parts = await this.partRepository.findByTestId(id);
      for (const part of parts) {
        // Xóa tất cả các questionInAPart liên quan đến part
        await this.questionInAPartRepository.deleteByPartId(part.id);
        // Xóa part
        await this.partRepository.delete(part.id);
      }
      
      // Xóa test
      await this.testRepository.delete(id);
      
      return res.status(200).json({ message: 'Xóa bài kiểm tra thành công' });
    } catch (error) {
      console.error('Error in deleteTest:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addPartToTest(req: Request, res: Response) {
    try {
      const testId = parseInt(req.params.id);
      if (isNaN(testId)) {
        return res.status(400).json({ error: 'ID bài kiểm tra không hợp lệ' });
      }

      const { partNumber } = req.body;
      if (!partNumber) {
        return res.status(400).json({ error: 'Số phần là bắt buộc' });
      }

      const test = await this.testRepository.findById(testId);
      if (!test) {
        return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
      }

      const newPart = new Part(0, partNumber, testId);
      const savedPart = await this.partRepository.create(newPart);

      return res.status(201).json(savedPart);
    } catch (error) {
      console.error('Error in addPartToTest:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTestCollections(req: Request, res: Response) {
    try {
      const collections = await this.testCollectionRepository.findAll();
      return res.status(200).json(collections);
    } catch (error) {
      console.error('Error in getTestCollections:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
