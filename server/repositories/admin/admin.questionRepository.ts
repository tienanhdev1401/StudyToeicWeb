import { TestCollection } from '../../models/TestCollection';
import { Resource } from '../../models/Resource';
import { Question } from '../../models/Question';
import { ResourceRepository } from '../resourceRepository';
import db from '../../config/db';

export class QuestionRepository {
    static async findById(id: number): Promise<Question | null> {
        try {
            const rows = await db.query(
                'SELECT * FROM questions WHERE id = ?',
                [id]
            );
            
            const questions = Array.isArray(rows) ? rows : [rows];
            if (!questions.length) return null;

            const row = questions[0];
            let resource = null;
            if (row.ResourceId) {
                try {
                    resource = await ResourceRepository.findById(Number(row.ResourceId));
                } catch (resourceError) {
                    console.error(`Error fetching resource ${row.ResourceId}:`, resourceError);
                    // Continue with null resource
                }
            }

            return new Question(
                Number(row.id),
                row.content,
                row.correct_answer,
                row.explain_detail || '',
                row.option_a || '',
                row.option_b || '',
                row.option_c || '',
                row.option_d || '',
                resource
            );
        } catch (error) {
            console.error('QuestionRepository.findById error:', error);
            throw error;
        }
    }

    static async findAll(): Promise<Question[]> {
        try {
            const rows = await db.query('SELECT * FROM questions');
            
            const distinctCollections = Array.isArray(rows) ? rows : [rows];
            if (!distinctCollections.length) return [];
    
        
            const results = Array.isArray(rows) ? rows : [rows];
            const questions = await Promise.all(results.map(async row => {
              let resource = null;
              if (row.ResourceId) {
                try {
                  resource = await ResourceRepository.findById(Number(row.ResourceId));
                } catch (resourceError) {
                  console.error(`Error fetching resource ${row.ResourceId}:`, resourceError);
                  // Continue with null resource
                }
              }
              return new Question(
                Number(row.id),
                row.content,
                row.correct_answer,
                row.explain_detail || '', 
                row.option_a || '',     
                row.option_b || '',      
                row.option_c || '',     
                row.option_d || '',    
                resource
              );
            }));
        
            return questions;
    
            return questions;
        } catch (error) {
            console.error('QuestionRepository.findAll error:', error);
            throw error;
        }
    }
    
    static async create(question: Question, resourceId: number | null = null): Promise<Question> {
        try {
          const result = await db.query(
            'INSERT INTO questions (content, correct_answer, explain_detail, option_a, option_b, option_c, option_d, ResourceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              question.content,
              question.correctAnswer,
              question.explainDetail || '',
              question.optionA,
              question.optionB,
              question.optionC,
              question.optionD,
              resourceId
            ]
          );
          
          let insertId = null;
          if (result && (result as any).insertId) {
            insertId = (result as any).insertId;
          }
          
          return {
            ...question,
            id: insertId
          };
        } catch (error) {
          console.error('QuestionRepository.create error:', error);
          throw error;
        }
      }
    
      static async update(question: Question, resourceId: number | null = null): Promise<void> {
        try {
          await db.query(
            'UPDATE questions SET content = ?, correct_answer = ?, explain_detail = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, ResourceId = ? WHERE id = ?',
            [
              question.content,
              question.correctAnswer,
              question.explainDetail || '',
              question.optionA,
              question.optionB,
              question.optionC,
              question.optionD,
              resourceId !== undefined ? resourceId : question.resource?.id || null,
              question.id
            ]
          );
        } catch (error) {
          console.error('QuestionRepository.update error:', error);
          throw error;
        }
      }

      static async delete(id: number): Promise<boolean> {
        try {
          await db.query('DELETE FROM questions WHERE id = ?', [id]);
          return true;
        } catch (error) {
          console.error('QuestionRepository.delete error:', error);
          throw error;
        }
      }

      static async findByIds(ids: number[]): Promise<Question[]> {
        try {
          if (!ids.length) {
            return [];
          }
          const placeholders = ids.map(() => '?').join(',');
          const rows = await db.query(
            `SELECT * FROM questions WHERE id IN (${placeholders})`,
            ids
          );
          
          // Handle empty result
          if (!rows || (Array.isArray(rows) && rows.length === 0)) {
            return [];
          }
          
          const results = Array.isArray(rows) ? rows : [rows];
          const questions = await Promise.all(results.map(async row => {
            let resource = null;
            if (row.ResourceId) {
              try {
                resource = await ResourceRepository.findById(Number(row.ResourceId));
              } catch (resourceError) {
                console.error(`Error fetching resource ${row.ResourceId}:`, resourceError);
                // Continue with null resource
              }
            }
            
            return new Question(
              Number(row.id),
              row.content,
              row.correct_answer,
              row.explain_detail || '', 
              row.option_a || '',     
              row.option_b || '',      
              row.option_c || '',     
              row.option_d || '',    
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