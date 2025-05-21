import { Resource } from './../models/Resource';
import { Question } from '../models/Question';
import { ResourceRepository } from './resourceRepository';
import db from '../config/db';
import { QuestionBuilder } from '../builder/QuestionBuilder';
import { ResourceBuilder } from '../builder/ResourceBuilder';

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
        new ResourceBuilder()
          .setId(question.ResourceId)
          .setExplainResource(question.explain_resource)
          .setUrlAudio(question.urlAudio)
          .setUrlImage(question.urlImage)
          .build() : null;

      return new QuestionBuilder()
        .setId(question.id)
        .setContent(question.content)
        .setCorrectAnswer(question.correctAnswer)
        .setExplainDetail(question.explainDetail)
        .setOptionA(question.optionA)
        .setOptionB(question.optionB)
        .setOptionC(question.optionC)
        .setOptionD(question.optionD)
        .setResource(resource)
        .build();
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
          new ResourceBuilder()
            .setId(Number(row.ResourceId))
            .setExplainResource(row.explain_resource)
            .setUrlAudio(row.urlAudio)
            .setUrlImage(row.urlImage)
            .build() : null;
          
        return new QuestionBuilder()
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
      });
  
      return questions;
    } catch (error) {
      console.error('QuestionRepository.findByIds error:', error);
      throw error;
    }
  }
}