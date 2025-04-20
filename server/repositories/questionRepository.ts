import { Resource } from './../models/Resource';
import { Question } from '../models/Question';
import { ResourceRepository } from './resourceRepository';
import db from '../config/db';

export class QuestionRepository {
  async findById(id: number): Promise<Question | null> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM questions WHERE id = ?',
        [id]
      );
      
      const questions = rows as any[];
      if (!questions.length) return null;

      const question = questions[0];
      const resource = question.ResourceId ? await ResourceRepository.findById(question.resourceId) : null;
      return new Question(
        question.id,
        question.content,
        question.correctAnswer,
        question.explainDetail,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        resource
      );
    } catch (error) {
      console.error('QuestionRepository.findById error:', error);
      throw error;
    }
  }

  async findByIds(ids: number[]): Promise<Question[]> {
    try {
      if (!ids.length) {
        return [];
      }
      // Sửa phần này, sử dụng dấu ? cho từng phần tử trong mảng
      const placeholders = ids.map(() => '?').join(',');
      const [rows] = await db.query(
        `SELECT * FROM questions WHERE id IN (${placeholders})`,
        ids
      );
  
      // Đảm bảo rows là mảng
      const results = Array.isArray(rows) ? rows : [rows];
      
      // Xử lý từng câu hỏi với resource
      const questions = await Promise.all(results.map(async row => {
        const resource = row.ResourceId ? 
          await ResourceRepository.findById(Number(row.ResourceId)) : 
          null;
  
        return new Question(
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
      }));
  
      return questions;
    } catch (error) {
      console.error('QuestionRepository.findByIds error:', error);
      throw error;
    }
  }
}