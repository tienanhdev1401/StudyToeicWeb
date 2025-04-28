import { QuestionInAPart } from '../models/QuestionInAPart';
import db from '../config/db';

export class QuestionInAPartRepository {
  async findByPartId(partId: number): Promise<QuestionInAPart[]> {
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

  async findByPartIdAndQuestionId(partId: number, questionId: number): Promise<QuestionInAPart | null> {
    try {
      const [rows] = await db.query(
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

  async create(questionInPart: QuestionInAPart): Promise<void> {
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

  async updateQuestionNumber(partId: number, questionId: number, questionNumber: number): Promise<void> {
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

  async delete(partId: number, questionId: number): Promise<void> {
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

  async isQuestionUsedInOtherParts(questionId: number, excludePartId: number): Promise<boolean> {
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
}