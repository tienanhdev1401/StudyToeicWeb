import database from '../config/db';
import { Exercise } from '../models/Exercise';
import { Question } from '../models/Question';
import { Resource } from '../models/Resource';
import { QuestionBuilder } from '../builder/QuestionBuilder';
import { ResourceBuilder } from '../builder/ResourceBuilder';
import { ExerciseBuilder } from '../builder/ExerciseBuilder';

export class ExerciseRepository {
    static async getAllExercises(): Promise<Exercise[]> {
      try {
        const results = await database.query(
          'SELECT id, exerciseName FROM exercises'
        );
        
        // Chỉ tạo đối tượng Exercise với danh sách câu hỏi rỗng
        const exercises = results.map((row: any) => 
          new ExerciseBuilder()
            .setId(row.id)
            .setExerciseName(row.exerciseName)
            .setQuestions([]) // Khởi tạo rỗng
            .build()
        );
        
        return exercises;
      } catch (error) {
        console.error('Error getting all exercises:', error);
        throw error;
      }
  }

  static async findById(id: number): Promise<Exercise | null> {
    try {
      const exerciseResults = await database.query(
        'SELECT id, exerciseName FROM exercises WHERE id = ? LIMIT 1',
        [id]
      );

      if (exerciseResults.length === 0) {
        return null;
      }

      const questions = await this.getQuestionsForExercise(id);
      return new ExerciseBuilder()
        .setId(exerciseResults[0].id)
        .setExerciseName(exerciseResults[0].exerciseName)
        .setQuestions(questions)
        .build();
    } catch (error) {
      console.error(`Error finding exercise with ID ${id}:`, error);
      throw error;
    }
  }

  static async createExercise(exerciseName: string): Promise<Exercise> {
    try {
      const result = await database.query(
        'INSERT INTO exercises (exerciseName) VALUES (?)',
        [exerciseName]
      );
      
      return new ExerciseBuilder()
        .setId(result.insertId)
        .setExerciseName(exerciseName)
        .setQuestions([]) // Khởi tạo rỗng
        .build();
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  }

  static async addQuestionToExercise(exerciseId: number, questionId: number): Promise<boolean> {
    try {
      const result = await database.query(
        'INSERT INTO questioninexercise (exerciseId, questionId) VALUES (?, ?)',
        [exerciseId, questionId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error adding question to exercise:', error);
      throw error;
    }
  }

  private static async getQuestionsForExercise(exerciseId: number): Promise<Question[]> {
    try {
      const results = await database.query(
        `SELECT q.* FROM questions q
         JOIN questioninexercise qe ON q.id = qe.questionId
         WHERE qe.exerciseId = ?`,
        [exerciseId]
      );
      
      return await Promise.all(results.map(async (row: any) => {
        const resource = row.ResourceId ? await ResourceRepository.findById(row.ResourceId) : null;
        return new QuestionBuilder()
          .setId(row.id)
          .setContent(row.content)
          .setCorrectAnswer(row.correct_answer)
          .setExplainDetail(row.explain_detail)
          .setOptionA(row.option_a)
          .setOptionB(row.option_b)
          .setOptionC(row.option_c)
          .setOptionD(row.option_d)
          .setResource(resource)
          .build();
      }));
    } catch (error) {
      console.error(`Error getting questions for exercise ${exerciseId}:`, error);
      return [];
    }
  }
}

export class QuestionRepository {
  static async getAllQuestions(): Promise<Question[]> {
    try {
      const results = await database.query(
        'SELECT id, content, correct_answer, explain_detail, option_a, option_b, option_c, option_d, ResourceId FROM questions'
      );
      
      return await Promise.all(results.map(async (row: any) => {
        const resource = row.ResourceId ? await ResourceRepository.findById(row.ResourceId) : null;
        return new QuestionBuilder()
          .setId(row.id)
          .setContent(row.content)
          .setCorrectAnswer(row.correct_answer)
          .setExplainDetail(row.explain_detail)
          .setOptionA(row.option_a)
          .setOptionB(row.option_b)
          .setOptionC(row.option_c)
          .setOptionD(row.option_d)
          .setResource(resource)
          .build();
      }));
    } catch (error) {
      console.error('Error getting all questions:', error);
      throw error;
    }
  }

  static async findById(id: number): Promise<Question | null> {
    try {
      const results = await database.query(
        'SELECT id, content, correct_answer, explain_detail, option_a, option_b, option_c, option_d, ResourceId FROM questions WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      const resource = row.ResourceId ? await ResourceRepository.findById(row.ResourceId) : null;
      return new QuestionBuilder()
        .setId(row.id)
        .setContent(row.content)
        .setCorrectAnswer(row.correct_answer)
        .setExplainDetail(row.explain_detail)
        .setOptionA(row.option_a)
        .setOptionB(row.option_b)
        .setOptionC(row.option_c)
        .setOptionD(row.option_d)
        .setResource(resource)
        .build();
    } catch (error) {
      console.error(`Error finding question with ID ${id}:`, error);
      throw error;
    }
  }

  static async createQuestion(
    content: string,
    correctAnswer: string,
    explainDetail: string,
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    resourceId: number | null = null
  ): Promise<Question> {
    try {
      const result = await database.query(
        'INSERT INTO questions (content, correct_answer, explain_detail, option_a, option_b, option_c, option_d, ResourceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [content, correctAnswer, explainDetail, optionA, optionB, optionC, optionD, resourceId]
      );
      
      const resource = resourceId ? await ResourceRepository.findById(resourceId) : null;
      return new QuestionBuilder()
        .setId(result.insertId)
        .setContent(content)
        .setCorrectAnswer(correctAnswer)
        .setExplainDetail(explainDetail)
        .setOptionA(optionA)
        .setOptionB(optionB)
        .setOptionC(optionC)
        .setOptionD(optionD)
        .setResource(resource)
        .build();
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }
}

export class ResourceRepository {
  static async findById(id: number): Promise<Resource | null> {
    try {
      const results = await database.query(
        'SELECT id,explain_resource,urlAudio, urlImage FROM resources WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new ResourceBuilder()
        .setId(row.id)
        .setExplainResource(row.explain_resource)
        .setUrlAudio(row.urlAudio)
        .setUrlImage(row.urlImage)
        .build();
    } catch (error) {
      console.error(`Error finding resource with ID ${id}:`, error);
      throw error;
    }
  }
}