import { QuestionInAPart } from '../models/QuestionInAPart';
import { Question } from '../models/Question';
import { Resource } from '../models/Resource';
import db from '../config/db';
import { QuestionInAPartBuilder } from '../builder/QuestionInAPartBuilder';
import { QuestionBuilder } from '../builder/QuestionBuilder';
import { ResourceBuilder } from '../builder/ResourceBuilder';

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
          new ResourceBuilder()
            .setId(Number(row.resource_id))
            .setExplainResource(row.explain_resource)
            .setUrlAudio(row.urlAudio)
            .setUrlImage(row.urlImage)
            .build()
          : null;
          
        // Tạo question object
        const question = new QuestionBuilder()
          .setId(Number(row.id))
          .setContent(row.content)
          .setCorrectAnswer(row.correct_answer)
          .setExplainDetail(row.explain_detail)
          .setOptionA(row.option_a)
          .setOptionB(row.option_b)
          .setOptionC(row.option_c)
          .setOptionD(row.option_d)
          .setResource(resource)
          .build();
        
        // Tạo và trả về QuestionInAPart object
        const questionInAPart = new QuestionInAPartBuilder()
          .setPartId(Number(row.PartId))
          .setQuestionId(Number(row.QuestionId))
          .setQuestionNumber(Number(row.questionNumber))
          .setQuestion(question)
          .build();
        
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
      return new QuestionInAPartBuilder()
        .setPartId(Number(row.PartId))
        .setQuestionId(Number(row.QuestionId))
        .setQuestionNumber(Number(row.questionNumber))
        .build();
    } catch (error) {
      console.error('QuestionInAPartRepository.findByPartIdAndQuestionId error:', error);
      throw error;
    }
  }
}