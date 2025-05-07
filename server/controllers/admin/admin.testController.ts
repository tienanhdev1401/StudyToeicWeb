import { Request, Response } from 'express';
import { TestRepository } from '../../repositories/admin/admin.testRepository';
import { PartRepository } from '../../repositories/admin/admin.partRepositpry';
import { QuestionInAPartRepository } from '../../repositories/admin/admin.questionInAPartRepository';
import { TestCollectionRepository } from '../../repositories/admin/admin.testCollectionRepository';
import { Test } from '../../models/Test';
import { Part } from '../../models/Part';
import { ResourceRepository } from '../../repositories/admin/admin.resourceRepository';
import { QuestionRepository } from '../../repositories/admin/admin.questionRepository';
import { QuestionInAPart } from '../../models/QuestionInAPart';
import { Question } from '../../models/Question';
import * as XLSX from 'xlsx';
import fs from 'fs';

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

  static async importAllQuestions(req: Request, res: Response) {
    try {
      const testId = parseInt(req.params.testId);
      const { questions } = req.body;
      if (!Array.isArray(questions) || isNaN(testId)) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
      }

      // Gom nhóm câu hỏi theo partNumber
      const partMap: { [key: string]: any[] } = {};
      for (const q of questions) {
        if (!partMap[q.partNumber]) partMap[q.partNumber] = [];
        partMap[q.partNumber].push(q);
      }

      // Tạo part nếu chưa có, sau đó tạo câu hỏi cho từng part
      for (const partNumber in partMap) {
        // Tạo part mới (hoặc lấy part đã có nếu muốn)
        const part = await PartRepository.create(new Part(0, Number(partNumber), testId));
        const partId = part.id;

        // Gom nhóm các câu hỏi có cùng resource
        const resourceGroups: { [key: string]: any[] } = {};
        for (const q of partMap[partNumber]) {
          const resourceKey = [
            q.audioUrl || '',
            q.imageUrl || '',
            q.explainResource || ''
          ].join('|');
          if (!resourceGroups[resourceKey]) resourceGroups[resourceKey] = [];
          resourceGroups[resourceKey].push(q);
        }

        // Với mỗi nhóm resource, chỉ tạo 1 resource, gán cho tất cả câu hỏi trong nhóm
        let questionNumber = 1;
        for (const resourceKey in resourceGroups) {
          const group = resourceGroups[resourceKey];
          let resourceId = null;
          const firstQ = group[0];
          if (firstQ.audioUrl || firstQ.imageUrl || firstQ.explainResource) {
            resourceId = await ResourceRepository.createResource(
              firstQ.explainResource || null,
              firstQ.audioUrl || null,
              firstQ.imageUrl || null
            );
          }
          for (const q of group) {
            const question = new Question(
              0,
              q.content,
              q.correctAnswer,
              q.explainDetail || '',
              q.optionA,
              q.optionB,
              q.optionC,
              q.optionD,
              null
            );
            const savedQuestion = await QuestionRepository.create(question, resourceId);
            await QuestionInAPartRepository.create(new QuestionInAPart(partId, savedQuestion.id, questionNumber));
            questionNumber++;
          }
        }
      }

      return res.status(200).json({ success: true, message: 'Import thành công!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Lỗi khi import câu hỏi' });
    }
  }

  static async importAllQuestionsFromFile(req: Request, res: Response) {
    try {
      const testId = parseInt(req.params.testId);
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      // Đọc file Excel
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

      // Xử lý giống như logic importAllQuestions
      // Gom nhóm câu hỏi theo partNumber
      const partMap: { [key: string]: any[] } = {};
      for (const q of data as any[]) {
        if (!partMap[q.partNumber]) partMap[q.partNumber] = [];
        partMap[q.partNumber].push(q);
      }

      // Quy định số bắt đầu và số lượng tối đa cho từng part TOEIC
      const TOEIC_PART_LIMITS: { [key: string]: { start: number, end: number, maxQuestions: number } } = {
        1: { start: 1, end: 6, maxQuestions: 6 },
        2: { start: 7, end: 31, maxQuestions: 25 },
        3: { start: 32, end: 70, maxQuestions: 39 },
        4: { start: 71, end: 100, maxQuestions: 30 },
        5: { start: 101, end: 130, maxQuestions: 30 },
        6: { start: 131, end: 146, maxQuestions: 16 },
        7: { start: 147, end: 200, maxQuestions: 54 }
      };

      // Kiểm tra số lượng câu hỏi hiện có cho mỗi part
      const partErrors: { [key: string]: string } = {};
      
      // Kiểm tra số lượng câu hỏi của mỗi part trước khi import
      for (const partNumber in partMap) {
        const part = await PartRepository.findByTestIdAndPartNumber(testId, Number(partNumber));
        if (!part) continue;
        
        // Đếm số lượng câu hỏi hiện có trong part
        const existingQuestions = await QuestionInAPartRepository.findByPartId(part.id);
        const currentQuestionCount = existingQuestions.length;
        const maxAllowed = TOEIC_PART_LIMITS[partNumber]?.maxQuestions || 0;
        const newQuestionCount = partMap[partNumber].length;
        
        if (currentQuestionCount >= maxAllowed) {
          partErrors[partNumber] = `Part ${partNumber} đã đạt số lượng câu hỏi tối đa (${maxAllowed}). Không thể import thêm.`;
        } else if (currentQuestionCount + newQuestionCount > maxAllowed) {
          partErrors[partNumber] = `Part ${partNumber} chỉ còn trống ${maxAllowed - currentQuestionCount} câu, không thể import ${newQuestionCount} câu.`;
        }
      }
      
      // Nếu có lỗi, trả về thông báo lỗi cho người dùng
      if (Object.keys(partErrors).length > 0) {
        // Xóa file tạm
        fs.unlinkSync(req.file.path);

        // Kiểm tra nếu tất cả các phần đều đã đầy
        const allPartsFull = Object.values(partErrors).every(error => 
          error.includes('đã đạt số lượng câu hỏi tối đa'));
        
        let message = '';
        if (allPartsFull) {
          message = 'Bài test đã đạt đủ 200 câu hỏi theo tiêu chuẩn TOEIC. Không thể import thêm câu hỏi.';
        } else {
          message = 'Không thể import bài test do vượt quá số lượng câu hỏi cho phép ở một số phần.';
        }

        return res.status(400).json({ 
          success: false, 
          message: message,
          errors: partErrors,
          isFull: allPartsFull
        });
      }

      // Tiếp tục import nếu không có lỗi
      for (const partNumber in partMap) {
        const part = await PartRepository.findByTestIdAndPartNumber(testId, Number(partNumber));
        if (!part) continue;
        const partId = part.id;
        const resourceGroups: { [key: string]: any[] } = {};
        for (const q of partMap[partNumber]) {
          const resourceKey = [
            q.audio_url || '',
            q.image_url || '',
            q.explain_resource || ''
          ].join('|');
          if (!resourceGroups[resourceKey]) resourceGroups[resourceKey] = [];
          resourceGroups[resourceKey].push(q);
        }
        // Đánh số questionNumber đúng chuẩn TOEIC
        let questionNumber = TOEIC_PART_LIMITS[partNumber]?.start || 1;
        
        // Lấy số câu hỏi hiện tại để đánh số tiếp theo
        const existingQuestions = await QuestionInAPartRepository.findByPartId(partId);
        if (existingQuestions && existingQuestions.length > 0) {
          // Tìm số lớn nhất trong các câu hỏi hiện có
          const maxQuestionNumber = Math.max(...existingQuestions.map(q => q.questionNumber || 0));
          questionNumber = maxQuestionNumber + 1;
          
          // Đảm bảo số câu hỏi vẫn nằm trong khoảng cho phép của part
          if (questionNumber < TOEIC_PART_LIMITS[partNumber].start) {
            questionNumber = TOEIC_PART_LIMITS[partNumber].start;
          }
        }
        
        for (const resourceKey in resourceGroups) {
          const group = resourceGroups[resourceKey];
          let resourceId = null;
          const firstQ = group[0];
          if (firstQ.audio_url || firstQ.image_url || firstQ.explain_resource) {
            resourceId = await ResourceRepository.createResource(
              firstQ.explain_resource || null,
              firstQ.audio_url || null,
              firstQ.image_url || null
            );
          }
          for (const q of group) {
            // Kiểm tra xem số câu hỏi có vượt quá giới hạn end của part không
            if (questionNumber > TOEIC_PART_LIMITS[partNumber].end) {
              continue; // Bỏ qua nếu vượt quá
            }
            
            const question = new Question(
              0,
              q.content,
              q.correct_answer,
              q.explain_detail || '',
              q.option_a,
              q.option_b,
              q.option_c,
              q.option_d,
              null
            );
            const savedQuestion = await QuestionRepository.create(question, resourceId);
            await QuestionInAPartRepository.create(new QuestionInAPart(partId, savedQuestion.id, questionNumber));
            questionNumber++;
          }
        }
      }
      
      // Xóa file tạm
      fs.unlinkSync(req.file.path);
      return res.status(200).json({ success: true, message: 'Import thành công!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Lỗi khi import file Excel' });
    }
  }
}
