import { Resource } from './../models/Resource';
import { Question } from '../models/Question';
import { ResourceRepository } from './resourceRepository';
import db from '../config/db';

export class QuestionRepository {
  async findById(id: number): Promise<Question | null> {
    try {
      const [rows] = await db.query(
        'SELECT q.*, r.explain_resource, r.urlAudio, r.urlImage FROM questions q LEFT JOIN resources r ON q.ResourceId = r.id WHERE q.id = ?',
        [id]
      );
      
      const questions = rows as any[];
      if (!questions.length) return null;

      const question = questions[0];
      const resource = question.ResourceId ? 
        new Resource(
          question.ResourceId,
          question.explain_resource,
          question.urlAudio,
          question.urlImage
        ) : null;

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
      const placeholders = ids.map(() => '?').join(',');
      const rows = await db.query(
        `SELECT q.*, r.explain_resource, r.urlAudio, r.urlImage 
         FROM questions q 
         LEFT JOIN resources r ON q.ResourceId = r.id 
         WHERE q.id IN (${placeholders})`,
        ids
      );
      
      // Ensure rows is an array
      const results = Array.isArray(rows) ? rows : [rows];
      
      // Map rows to Question objects
      const questions = results.map(row => {
        // Create resource object if ResourceId exists
        const resource = row.ResourceId ? 
          new Resource(
            Number(row.ResourceId),
            row.explain_resource,
            row.urlAudio,
            row.urlImage
          ) : null;
          
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
      });
  
      return questions;
    } catch (error) {
      console.error('QuestionRepository.findByIds error:', error);
      throw error;
    }
  }
}