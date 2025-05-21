import { Test } from '../models/Test';
import { Part } from '../models/Part';
import { QuestionInAPart } from '../models/QuestionInAPart';
import { Question } from '../models/Question';
import { Resource } from '../models/Resource';
import db from '../config/db';
import { TestBuilder } from '../builder/TestBuilder';

export class TestRepository {
  async findById(id: number): Promise<Test | null> {
    try {
      const [rows] = await db.query(
        'SELECT id, title, testCollection, duration FROM tests WHERE id = ?',
        [id]
      );
      
      const tests = Array.isArray(rows) ? rows : [rows];
      if (!tests.length) return null;

      const test = new TestBuilder()
        .setId(Number(tests[0].id))
        .setTitle(tests[0].title)
        .setTestCollection(tests[0].testCollection)
        .setDuration(Number(tests[0].duration))
        .build();
      return test;
    } catch (error) {
      console.error('TestRepository.findById error:', error);
      throw error;
    }
  }

  async getTestWithDetails(id: number): Promise<Test | null> {
    try {
      // Lấy thông tin cơ bản về test
      const testResult = await db.query(
        'SELECT id, title, testCollection, duration FROM tests WHERE id = ?',
        [id]
      );

      const tests = Array.isArray(testResult) ? testResult : [testResult];
      if (!tests.length) return null;
      
      // Tạo đối tượng test
      const test = new TestBuilder()
        .setId(Number(tests[0].id))
        .setTitle(tests[0].title)
        .setTestCollection(tests[0].testCollection)
        .setDuration(Number(tests[0].duration))
        .build();
      
      // Lấy parts
      const partsResult = await db.query(
        'SELECT id, partNumber, TestId FROM parts WHERE TestId = ? ORDER BY partNumber',
        [id]
      );
      
      // Nếu không có parts, trả về test không có parts
      if (!partsResult || !Array.isArray(partsResult) || !partsResult.length) {
        test.parts = [];
        return test;
      }

      // Tạo danh sách parts
      const parts: Part[] = partsResult.map((part: any) => new Part(
        Number(part.id),
        Number(part.partNumber),
        Number(part.TestId)
      ));
      
      // Nếu không có parts, trả về test
      if (!parts.length) {
        test.parts = [];
        return test;
      }
      
      // Lấy tất cả ID của parts để truy vấn trong một câu SQL
      const partIds = parts.map(part => part.id);
      
      // Xây dựng câu truy vấn đầy đủ với resources và explanations
      const questionQuery = `
        SELECT 
          qp.PartId, 
          qp.QuestionId, 
          qp.questionNumber,
          q.id as q_id, 
          q.content, 
          q.correct_answer, 
          q.explain_detail,
          q.option_a, 
          q.option_b, 
          q.option_c, 
          q.option_d,
          q.ResourceId,
          r.id as resource_id, 
          r.explain_resource, 
          r.urlAudio, 
          r.urlImage
        FROM 
          questioninaparts qp
        LEFT JOIN 
          questions q ON qp.QuestionId = q.id
        LEFT JOIN 
          resources r ON q.ResourceId = r.id
        WHERE 
          qp.PartId IN (${partIds.map(() => '?').join(',')})
        ORDER BY 
          qp.PartId, qp.questionNumber
      `;
      
      const questionsResult = await db.query(questionQuery, partIds);
      
      // Tạo một map để lưu questions cho từng part
      const partQuestionsMap: { [key: number]: QuestionInAPart[] } = {};
      
      // Khởi tạo map với mảng rỗng cho mỗi part
      partIds.forEach(partId => {
        partQuestionsMap[partId] = [];
      });
      
      // Phân loại câu hỏi theo partId
      if (questionsResult && Array.isArray(questionsResult) && questionsResult.length) {
        questionsResult.forEach((row: any) => {
          // Tạo resource nếu có
          const resource = row.resource_id ? 
            new Resource(
              Number(row.resource_id),
              row.explain_resource,
              row.urlAudio,
              row.urlImage
            ) : null;
          
          // Tạo question
          const question = new Question(
            Number(row.q_id),
            row.content,
            row.correct_answer,
            row.explain_detail,
            row.option_a,
            row.option_b,
            row.option_c,
            row.option_d,
            resource
          );
          
          // Tạo questionInAPart
          const questionInAPart = new QuestionInAPart(
            Number(row.PartId),
            Number(row.QuestionId),
            Number(row.questionNumber),
            question
          );
          
          // Thêm vào mảng của part tương ứng
          partQuestionsMap[row.PartId].push(questionInAPart);
        });
      }
      
      // Gán questions cho từng part
      parts.forEach(part => {
        part.questions = partQuestionsMap[part.id] || [];
      });
      
      // Gán parts cho test
      test.parts = parts;
      
      return test;
    } catch (error) {
      console.error('TestRepository.getTestWithDetails error:', error);
      throw error;
    }
  }

  async findAll(): Promise<Test[]> {
    try {
      const rows = await db.query('SELECT id, title, testCollection, duration FROM tests');
      if (!rows || !Array.isArray(rows) || !rows.length) return [];

      // Map các hàng thành đối tượng Test
      const testList = rows.map(row => 
        new TestBuilder()
          .setId(Number(row.id))
          .setTitle(row.title)
          .setTestCollection(row.testCollection)
          .setDuration(Number(row.duration))
          .build()
      );
      return testList;
    } catch (error) {
      console.error('TestRepository.findAll error:', error);
      throw error;
    }
  } 
}