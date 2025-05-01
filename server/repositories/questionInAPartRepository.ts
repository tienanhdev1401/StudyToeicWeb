import { QuestionInAPart } from '../models/QuestionInAPart';
import { Question } from '../models/Question';
import { Resource } from '../models/Resource';
import db from '../config/db';

export class QuestionInAPartRepository {
  async findByPartId(partId: number): Promise<QuestionInAPart[]> {
    try {
      const rows = await db.query(
        `SELECT qp.*, q.*, r.id as resource_id, r.explain_resource, r.urlAudio, r.urlImage 
         FROM questioninaparts qp
         LEFT JOIN questions q ON qp.QuestionId = q.id
         LEFT JOIN resources r ON q.ResourceId = r.id
         WHERE qp.PartId = ? 
         ORDER BY qp.questionNumber`,
        [partId]
      );
   
      // Nếu không có kết quả, trả về mảng rỗng
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return [];
      }
      
      const questionInAParts = rows.map(row => {
        // Tạo resource object nếu có resource_id
        const resource = row.resource_id ? 
          new Resource(
            Number(row.resource_id),
            row.explain_resource,
            row.urlAudio,
            row.urlImage
          ) : null;
          
        // Tạo question object
        const question = new Question(
          Number(row.id),
          row.content,
          row.correct_answer,
          row.explain_detail,
          row.option_a,
          row.option_b,
          row.option_c,
          row.option_d,
          resource
        );
        
        // Tạo và trả về QuestionInAPart object
        const questionInAPart = new QuestionInAPart(
          Number(row.PartId),
          Number(row.QuestionId),
          Number(row.questionNumber),
          question
        );
        
        return questionInAPart;
      });
      
      return questionInAParts;
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
}