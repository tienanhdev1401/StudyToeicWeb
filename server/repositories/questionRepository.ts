import { Question } from '../models/Question';
import { ResourceRepository } from './resourceRepository';
import db from '../config/db';

export class QuestionRepository {
  private resourceRepository: ResourceRepository;

  constructor() {
    this.resourceRepository = new ResourceRepository();
  }

  async findById(id: number): Promise<Question | null> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM questions WHERE id = ?',
        [id]
      );
      
      const questions = rows as any[];
      if (!questions.length) return null;

      const question = questions[0];
      return new Question(
        question.id,
        question.content,
        question.correctAnswer,
        question.explainDetail,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        question.ResourceId
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

      const [results] = await db.query(
        'SELECT * FROM questions WHERE id IN (?)',
        [ids]
      );
      if (!results) {
        return [];
      }

      const rows = Array.isArray(results) ? results : [results];

      const questions = rows.map(row => {
        return new Question(
          Number(row.id),
          row.content,
          row.correctAnswer,
          row.explainDetail,
          row.optionA,
          row.optionB,
          row.optionC,
          row.optionD,
          row.ResourceId ? Number(row.ResourceId) : undefined
        );
      });

      console.log('All created questions:', questions);
      return questions;

    } catch (error) {
      console.error('QuestionRepository.findByIds error:', error);
      throw error;
    }
  }
}