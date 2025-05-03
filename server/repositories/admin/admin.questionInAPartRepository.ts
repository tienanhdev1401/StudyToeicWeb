import { QuestionInAPart } from '../../models/QuestionInAPart';
import db from '../../config/db';
import { QuestionRepository } from './admin.questionRepository';

export class QuestionInAPartRepository {
  static async findByPartId(partId: number): Promise<QuestionInAPart[]> {
    try {
      // Thay vì [results], sử dụng [rows]
      const rows = await db.query(
        'SELECT * FROM questioninaparts WHERE PartId = ? ORDER BY questionNumber',
        [partId]
      );
   
      // Nếu không có kết quả, trả về mảng rỗng
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return [];
      }
      const questions = rows.map(row => {
        const question = new QuestionInAPart(
          Number(row.PartId),
          Number(row.QuestionId),
          Number(row.questionNumber)
        );
        return question;
      });
      return questions;
    } catch (error) {
      console.error('QuestionInAPartRepository.findByPartId error:', error);
      throw error;
    }
  }

  
  static async deleteByPartId(partId: number): Promise<boolean> {
    try {
      // 1. Lấy tất cả các questionId thuộc partId này trước khi xóa
      const rows = await db.query(
        'SELECT QuestionId FROM questioninaparts WHERE PartId = ?',
        [partId]
      );
      
      // Chuyển đổi kết quả thành mảng questionIds
      const questionInAParts = Array.isArray(rows) ? rows : [rows];
      const questionIds = questionInAParts.map(row => row.QuestionId);
      
      // 2. Xóa liên kết trong bảng questioninaparts
      const result = await db.query(
        'DELETE FROM questioninaparts WHERE PartId = ?',
        [partId]
      );
      
      // 3. Kiểm tra và xóa những question không còn được sử dụng ở part nào
      if (questionIds && questionIds.length > 0) {
        for (const questionId of questionIds) {
          // Kiểm tra xem question có còn ở part khác không
          const [countRows] = await db.query(
            'SELECT COUNT(*) as count FROM questioninaparts WHERE QuestionId = ?',
            [questionId]
          );
          
          const countResult = Array.isArray(countRows) ? countRows[0] : countRows;
          // Nếu không còn part nào dùng question này, xóa question
          if (countResult && Number(countResult.count) === 0) {
            await QuestionRepository.delete(questionId);
            console.log(`Deleted orphaned question: ${questionId}`);
          }
        }
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('QuestionInAPartRepository.deleteByPartId error:', error);
      throw error;
    }
  }

  static async create(questionInPart: QuestionInAPart): Promise<void> {
    try {
      // Nếu không có questionNumber, tìm số lớn nhất hiện có và tăng thêm 1
      if (!questionInPart.questionNumber) {
        const [rows] = await db.query(
          'SELECT MAX(questionNumber) as maxNumber FROM questioninaparts WHERE PartId = ?',
          [questionInPart.PartId]
        );
        
        const result = rows as any[];
        const maxNumber = result.length > 0 && result[0].maxNumber ? Number(result[0].maxNumber) : 0;
        questionInPart.questionNumber = maxNumber + 1;
      }

      await db.query(
        'INSERT INTO questioninaparts (PartId, QuestionId, questionNumber) VALUES (?, ?, ?)',
        [
          questionInPart.PartId,
          questionInPart.QuestionId,
          questionInPart.questionNumber
        ]
      );
    } catch (error) {
      console.error('QuestionInAPartRepository.create error:', error);
      throw error;
    }
  }

  static async updateQuestionNumber(partId: number, questionId: number, questionNumber: number): Promise<void> {
    try {
      await db.query(
        'UPDATE questioninaparts SET questionNumber = ? WHERE PartId = ? AND QuestionId = ?',
        [questionNumber, partId, questionId]
      );
    } catch (error) {
      console.error('QuestionInAPartRepository.updateQuestionNumber error:', error);
      throw error;
    }
  }

  static async delete(partId: number, questionId: number): Promise<void> {
    try {
      await db.query(
        'DELETE FROM questioninaparts WHERE PartId = ? AND QuestionId = ?',
        [partId, questionId]
      );
    } catch (error) {
      console.error('QuestionInAPartRepository.delete error:', error);
      throw error;
    }
  }

  static async isQuestionUsedInOtherParts(questionId: number, excludePartId: number): Promise<boolean> {
    try {
      const [rows] = await db.query(
        'SELECT COUNT(*) as count FROM questioninaparts WHERE QuestionId = ? AND PartId != ?',
        [questionId, excludePartId]
      );
      
      const result = rows as any[];
      return result.length > 0 && Number(result[0].count) > 0;
    } catch (error) {
      console.error('QuestionInAPartRepository.isQuestionUsedInOtherParts error:', error);
      throw error;
    }
  }

  static async findByPartIdAndQuestionId(partId: number, questionId: number): Promise<QuestionInAPart | null> {
    try {
      const rows = await db.query(
        'SELECT * FROM questioninaparts WHERE PartId = ? AND QuestionId = ?',
        [partId, questionId]
      );

      const questions = rows as any[];
      if (!questions.length) return null;

      const row = questions[0];
      return new QuestionInAPart(
        Number(row.PartId),
        Number(row.QuestionId),
        Number(row.questionNumber)
      );
    } catch (error) {
      console.error('QuestionInAPartRepository.findByPartIdAndQuestionId error:', error);
      throw error;
    }
  }

  static async isQuestionUsedInTests(questionId: number): Promise<boolean> {
    try {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM questioninaparts WHERE QuestionId = ?',
        [questionId]
      );
      return result[0].count > 0;
    } catch (error) {
      console.error('QuestionInAPartRepository.isQuestionUsedInTests error:', error);
      throw error;
    }
  }
}