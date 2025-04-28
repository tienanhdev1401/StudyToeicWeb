import { Request, Response } from 'express';
import { TestRepository } from '../../repositories/admin/admin.testRepository';
import { PartRepository } from '../../repositories/admin/admin.partRepositpry';
import { QuestionInAPartRepository } from '../../repositories/admin/admin.questionInAPartRepository';
import { TestCollectionRepository } from '../../repositories/admin/admin.testCollectionRepository';
import { Test } from '../../models/Test';
import { Part } from '../../models/Part';

export class AdminTestController {
  

  static async getAllTests(req: Request, res: Response) {
    try {
      const tests = await TestRepository.findAll();
      console.log('tests:', tests);
      return res.status(200).json({
        success: true,
        data: tests,
        message: 'Lấy danh sách bài test thành công'
      });
    } catch (error) {
      console.error('Error in getAllTests:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getTestById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      console.log(id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }

      const test = await TestRepository.findById(id);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài kiểm tra'
        });
      }

      const parts = await PartRepository.findByTestId(test.id);
      test.parts = parts || [];

      // Lấy question cho từng part
      if (parts && parts.length > 0) {
        for (const part of parts) {
          if (part && part.id) {
            const questionInAParts = await QuestionInAPartRepository.findByPartId(part.id);
            part.questions = questionInAParts || [];
          } else {
            part.questions = [];
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: test,
        message: 'Lấy bài test thành công'
      });
    } catch (error) {
      console.error('AdminTestController.getTestById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ'
      });
    }
  }

  static async createTest(req: Request, res: Response) {
    try {
      const { title, testCollection } = req.body;
      
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề bài test là bắt buộc'
        });
      }
      
      const newTest = new Test(0, title, testCollection, 120);
      const savedTest = await TestRepository.create(newTest);
      
      // Define default part numbers
      const defaultParts = [
        { partNumber: 1 },
        { partNumber: 2 },
        { partNumber: 3 },
        { partNumber: 4 },
        { partNumber: 5 },
        { partNumber: 6 },
        { partNumber: 7 }
      ];
      
      // Tự động tạo 7 parts cho test
      const createdParts = [];
      for (const partInfo of defaultParts) {
        const newPart = new Part(
          0, 
          partInfo.partNumber, 
          savedTest.id
        );
        const savedPart = await PartRepository.create(newPart);
        createdParts.push(savedPart);
      }
      
      // Thêm parts vào test
      savedTest.parts = createdParts;
      
      return res.status(201).json({
        success: true,
        data: savedTest,
        message: 'Tạo bài test thành công với 7 parts'
      });
    } catch (error) {
      console.error('Error in createTest:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateTest(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }

      const { title, testCollection, duration } = req.body;
      
      const existingTest = await TestRepository.findById(id);
      if (!existingTest) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài kiểm tra'
        });
      }
      
      existingTest.title = title || existingTest.title;
      existingTest.testCollection = testCollection || existingTest.testCollection;
      existingTest.duration = duration || existingTest.duration;
      existingTest.updatedAt = new Date();
      
      const updatedTest = await TestRepository.update(existingTest);
      return res.status(200).json({
        success: true,
        data: updatedTest,
        message: 'Cập nhật bài test thành công'
      });
    } catch (error) {
      console.error('Error in updateTest:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async deleteTest(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      console.log("delete test id: ",id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID không hợp lệ'
        });
      }

      const existingTest = await TestRepository.findById(id);
      console.log("existingTest: ",existingTest);
      if (!existingTest) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài kiểm tra'
        });
      }
      
      // Xóa tất cả các parts liên quan đến test này
      const parts = await PartRepository.findByTestId(id);
      console.log('Parts to delete:', parts);
      
      // Xử lý từng part nếu có
      if (parts && parts.length > 0) {
        for (const part of parts) {

          if (part && part.id) {
            // Xóa tất cả các questionInAPart liên quan đến part
            await QuestionInAPartRepository.deleteByPartId(part.id);
            // Xóa part
            await PartRepository.delete(part.id);
          }
        }
      }
       
      // Xóa test
      await TestRepository.delete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Xóa bài kiểm tra thành công'
      });
    } catch (error) {
      console.error('Error in deleteTest:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async addPartToTest(req: Request, res: Response) {
    try {
      const testId = parseInt(req.params.id);
      if (isNaN(testId)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài kiểm tra không hợp lệ'
        });
      }

      const { partNumber } = req.body;
      if (!partNumber) {
        return res.status(400).json({
          success: false,
          message: 'Số phần là bắt buộc'
        });
      }

      const test = await TestRepository.findById(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài kiểm tra'
        });
      }

      const newPart = new Part(0, partNumber, testId);
      const savedPart = await PartRepository.create(newPart);

      return res.status(201).json({
        success: true,
        data: savedPart,
        message: 'Thêm phần mới thành công'
      });
    } catch (error) {
      console.error('Error in addPartToTest:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getTestCollections(req: Request, res: Response) {
    try {
      const collections = await TestCollectionRepository.findAll();
      return res.status(200).json({
        success: true,
        data: collections,
        message: 'Lấy danh sách bài test collections thành công'
      });
    } catch (error) {
      console.error('Error in getTestCollections:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
