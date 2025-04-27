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
}