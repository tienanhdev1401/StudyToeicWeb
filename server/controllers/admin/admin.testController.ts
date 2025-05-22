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
        message: 'Test list retrieved successfully'
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
          message: 'Invalid ID'
        });
      }

      const test = await TestRepository.findById(id);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
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
        message: 'Test retrieved successfully'
      });
    } catch (error) {
      console.error('AdminTestController.getTestById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  static async createTest(req: Request, res: Response) {
    try {
      const { title, testCollection } = req.body;
      
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }
      
      const newTest = new Test(0, title, testCollection, 120);
      const savedTest = await TestRepository.create(newTest);
      
      // Tạo 7 parts cho test
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
        message: 'Test created successfully with 7 parts'
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
          message: 'Invalid ID'
        });
      }

      const { title, testCollection, duration } = req.body;
      
      const existingTest = await TestRepository.findById(id);
      if (!existingTest) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
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
        message: 'Test updated successfully'
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
          message: 'Test ID is invalid'
        });
      }

      const existingTest = await TestRepository.findById(id);
      console.log("existingTest: ",existingTest);
      if (!existingTest) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
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
        message: 'Test deleted successfully'
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
          message: 'Test ID is invalid'
        });
      }

      const { partNumber } = req.body;
      if (!partNumber) {
        return res.status(400).json({
          success: false,
          message: 'Part number is required'
        });
      }

      const test = await TestRepository.findById(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Test not found'
        });
      }

      const newPart = new Part(0, partNumber, testId);
      const savedPart = await PartRepository.create(newPart);

      return res.status(201).json({
        success: true,
        data: savedPart,
        message: 'New part added successfully'
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
        message: 'Test collections retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getTestCollections:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }


  static async importAllQuestionsFromFile(req: Request, res: Response) {
    try {
      const testId = parseInt(req.params.testId);
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      console.log(`Starting import for test ID: ${testId}`);
      
      // Đọc file Excel
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

      // Validate Excel file structure
      if (data.length === 0) {
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'The Excel file is empty. Please use a valid template with question data.'
        });
      }

      // Check for required columns
      const requiredColumns = ['partNumber', 'content', 'correct_answer', 'option_a', 'option_b', 'option_c', 'option_d'];
      const firstRow = data[0] as any;
      const missingColumns = requiredColumns.filter(col => 
        firstRow[col] === undefined && 
        // Check alternative column names
        !(col === 'correct_answer' && (firstRow['correctAnswer'] !== undefined || firstRow['Correct Answer'] !== undefined)) &&
        !(col === 'option_a' && (firstRow['optionA'] !== undefined || firstRow['Option A'] !== undefined)) &&
        !(col === 'option_b' && (firstRow['optionB'] !== undefined || firstRow['Option B'] !== undefined)) &&
        !(col === 'option_c' && (firstRow['optionC'] !== undefined || firstRow['Option C'] !== undefined)) &&
        !(col === 'option_d' && (firstRow['optionD'] !== undefined || firstRow['Option D'] !== undefined))
      );

      if (missingColumns.length > 0) {
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Invalid Excel format. Missing required columns: ${missingColumns.join(', ')}`
        });
      }

      // Validate partNumber is a valid number in each row
      const invalidRows = data.filter((row: any) => {
        const partNum = parseInt(row.partNumber);
        return isNaN(partNum) || partNum < 1 || partNum > 7;
      });

      if (invalidRows.length > 0) {
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Invalid data in Excel file. The 'partNumber' column must contain valid numbers (1-7) for all rows.`
        });
      }

      // Gom nhóm câu hỏi theo partNumber
      const partMap: { [key: string]: any[] } = {};
      for (const q of data as any[]) {
        if (!partMap[q.partNumber]) partMap[q.partNumber] = [];
        partMap[q.partNumber].push(q);
      }

      // Log the partMap to see what questions are being found in the Excel file
      console.log("Questions found in Excel file by part:");
      for (const partNum in partMap) {
        console.log(`Part ${partNum}: ${partMap[partNum].length} questions`);
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

      // Kiểm tra số lượng câu hỏi của mỗi part trước khi import
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
        
        // Lấy danh sách các số câu hỏi đã tồn tại
        const existingQuestionNumbers = existingQuestions.map(q => q.questionNumber || 0);
        
        // Tìm các vị trí trống trong khoảng từ partStart đến partEnd
        const partStart = TOEIC_PART_LIMITS[partNumber]?.start || 1;
        const partEnd = TOEIC_PART_LIMITS[partNumber]?.end || (partStart + (TOEIC_PART_LIMITS[partNumber]?.maxQuestions || 0) - 1);
        
        // Lấy danh sách các số câu hỏi đã tồn tại
        const existingQuestionNumbersInRange = existingQuestionNumbers.filter(n => n >= partStart && n <= partEnd);
        
        // Tìm các vị trí trống trong khoảng từ partStart đến partEnd
        const emptyPositions = [];
        for (let i = partStart; i <= partEnd; i++) {
          if (!existingQuestionNumbersInRange.includes(i)) {
            emptyPositions.push(i);
          }
        }
        
        // Sắp xếp vị trí trống theo thứ tự tăng dần
        emptyPositions.sort((a, b) => a - b);
        
        // Debug: Double-check empty positions again
        let verifiedEmptyPositions = [...emptyPositions];
        if (partNumber === "1") {
          console.log("DOUBLE-CHECKING PART 1 EMPTY POSITIONS:");
          verifiedEmptyPositions = [];
          for (let i = partStart; i <= partEnd; i++) {
            if (!existingQuestionNumbersInRange.includes(i)) {
              verifiedEmptyPositions.push(i);
            }
          }
          console.log(`Double-check result: ${verifiedEmptyPositions.join(', ')}`);
        }
        
        console.log(`Part ${partNumber} - Range: ${partStart}-${partEnd}, Current questions: ${existingQuestionNumbers.join(', ')}`);
        console.log(`Part ${partNumber} - Found ${verifiedEmptyPositions.length} empty positions: ${verifiedEmptyPositions.join(', ')}`);
        
        // If this is Part 1, log more detailed information
        if (partNumber === "1") {
          console.log("DETAILED PART 1 DEBUG:");
          console.log("Part 1 Questions in Excel:", partMap[partNumber].map(q => ({ 
            content: q.content.substring(0, 30) + "...",
            answers: [q.option_a, q.option_b, q.option_c, q.option_d].map(a => a?.substring(0, 10) + "..."),
            correct: q.correct_answer
          })));
        }
        
        // Gom nhóm các câu hỏi có cùng resource
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
        
        // Đếm tổng số câu hỏi cần import
        const totalQuestions = partMap[partNumber].length;
        console.log(`Part ${partNumber} - Importing ${totalQuestions} questions`);
        
        // Tạo một mảng để theo dõi các vị trí đã được sử dụng
        const usedPositions = [...existingQuestionNumbers];
        
        // Đếm số câu hỏi đã import thành công
        let importedCount = 0;
        
        // Xử lý từng nhóm resource
        for (const resourceKey in resourceGroups) {
          const group = resourceGroups[resourceKey];
          let resourceId = null;
          
          // Tạo resource nếu cần
          const firstQ = group[0];
          if (firstQ.audio_url || firstQ.image_url || firstQ.explain_resource) {
            resourceId = await ResourceRepository.createResource(
              firstQ.explain_resource || null,
              firstQ.audio_url || null,
              firstQ.image_url || null
            );
          }
          
          // Xử lý từng câu hỏi trong nhóm
          for (const q of group) {
            let questionNumber;
            
            // Ưu tiên sử dụng vị trí trống nếu có
            if (verifiedEmptyPositions.length > 0) {
              // For Part 1, ensure we prioritize filling positions 1 and 2 if they are empty
              if (partNumber === "1" && verifiedEmptyPositions.includes(1) && verifiedEmptyPositions.includes(2)) {
                // Sort empty positions to ensure lower numbers come first (1, 2, etc.)
                verifiedEmptyPositions.sort((a, b) => a - b);
                console.log(`Part 1 - Special handling: Prioritizing filling positions in order: ${verifiedEmptyPositions.join(', ')}`);
              }
              
              questionNumber = verifiedEmptyPositions.shift() as number;
              console.log(`Part ${partNumber} - Assigning question to empty position: ${questionNumber}`);
            } else {
              // Nếu không còn vị trí trống, tìm vị trí tiếp theo sau vị trí lớn nhất hiện có
              const maxPosition = usedPositions.length > 0 ? Math.max(...usedPositions) : (partStart - 1);
              questionNumber = maxPosition + 1;
              
              // Kiểm tra xem vị trí mới có nằm trong phạm vi cho phép không
              if (questionNumber > partEnd) {
                console.log(`Part ${partNumber} - Position ${questionNumber} exceeds limit (${partEnd}), skipping question`);
                continue; // Bỏ qua nếu vượt quá giới hạn
              }
              
              console.log(`Part ${partNumber} - Assigning question to next position: ${questionNumber}`);
            }
            
            // Thêm vị trí vào danh sách đã sử dụng
            usedPositions.push(questionNumber);
            
            // Tạo câu hỏi
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
            
            // Lưu câu hỏi vào cơ sở dữ liệu
            const savedQuestion = await QuestionRepository.create(question, resourceId);
            await QuestionInAPartRepository.create(new QuestionInAPart(part.id, savedQuestion.id, questionNumber));
            
            importedCount++;
            console.log(`Part ${partNumber} - Created question at position ${questionNumber}`);
          }
        }
        
        console.log(`Part ${partNumber} - Successfully imported ${importedCount}/${totalQuestions} questions`);
      }
      
      // Xóa file tạm
      fs.unlinkSync(req.file.path);
      
      console.log('Import completed successfully');
      return res.status(200).json({ 
        success: true, 
        message: 'Import successful!',
        details: Object.keys(partErrors).length > 0 ? 
          { skippedParts: Object.keys(partErrors), reasons: partErrors } : 
          null
      });
    } catch (error: any) {
      console.error('Error in importAllQuestionsFromFile:', error);
      // Xóa file tạm nếu tồn tại
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }
      return res.status(500).json({ 
        success: false,
        error: 'Error importing Excel file',
        message: error.message || 'Unknown error occurred during import' 
      });
    }
  }
}