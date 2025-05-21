import database from '../config/db';
import { GrammarTopic} from '../models/GrammarTopic';
import { GrammarTopicBuilder } from '../builder/GrammarTopicBuilder';
import { Exercise } from '../models/Exercise';
import { ExerciseRepository } from './exerciseRepository';

export class GrammarTopicRepository {

  static async getAllGrammarTopic(): Promise<GrammarTopic[]> { 
    try {
      const results = await database.query(
        'SELECT id, title, content, imageUrl FROM grammartopics'
      );
      
      return results.map((row: any) => 
        new GrammarTopicBuilder()
          .setId(row.id)
          .setTitle(row.title)
          .setContent(row.content)
          .setImageUrl(row.imageUrl)
          .build()
      );
    } catch (error) {
      console.error('Error getting all grammar topics:', error);
      throw error;
    }
  }

  static async findById(id: number): Promise<GrammarTopic | null> {
    try {
      const results = await database.query(
        'SELECT id, title, content, imageUrl FROM grammartopics WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new GrammarTopicBuilder()
        .setId(row.id)
        .setTitle(row.title)
        .setContent(row.content)
        .setImageUrl(row.imageUrl)
        .build();
    } catch (error) {
      console.error(`Error finding grammar topic with ID ${id}:`, error);
      throw error;
    }
  }

  static async createGrammarTopic(
    title: string, 
    content: string, 
    imageUrl: string | null = null  // Thêm kiểu string | null và giá trị mặc định
  ): Promise<GrammarTopic> {
    try {
      const result = await database.query(
        'INSERT INTO grammartopics (title, content, imageUrl) VALUES (?, ?, ?)',  // Thêm placeholder thứ 3
        [title, content, imageUrl]
      );
      
      return new GrammarTopicBuilder()
        .setId(result.insertId)
        .setTitle(title)
        .setContent(content)
        .setImageUrl(imageUrl)
        .build();
    } catch (error) {
      console.error('Error creating grammar topic:', error);
      throw error;
    }
  }

  static async updateGrammarTopic(
    id: number, 
    title: string, 
    content: string, 
    imageUrl: string | null  // Thêm kiểu string | null
  ): Promise<boolean> {
    try {
      const result = await database.query(
        'UPDATE grammartopics SET title = ?, content = ?, imageUrl = ? WHERE id = ?',
        [title, content, imageUrl, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating grammar topic with ID ${id}:`, error);
      throw error;
    }
  }

  static async deleteGrammarTopic(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM grammartopics WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting grammar topic with ID ${id}:`, error);
      throw error;
    }
  }



  static async getExercisesForGrammarTopic(grammarTopicId: number): Promise<Exercise[]> {
    try {
      // 1. First, check if the grammar topic exists
      const topicExists = await database.query(
        'SELECT id FROM grammartopics WHERE id = ? LIMIT 1',
        [grammarTopicId]
      );
      
      if (topicExists.length === 0) {
        throw new Error(`Grammar topic with ID ${grammarTopicId} not found`);
      }

      // 2. Get all exercise IDs associated with this grammar topic
      const exerciseLinks = await database.query(
        'SELECT exerciseId FROM `grammartopic-exercise` WHERE grammarTopicId = ?', // Thêm backticks
        [grammarTopicId]
      );

      if (exerciseLinks.length === 0) {
        return [];
      }

      // 3. Get full exercise details for each linked exercise
      const exercises = await Promise.all(
        exerciseLinks.map(async (link: any) => {
          const exercise = await ExerciseRepository.findById(link.exerciseId);
          return exercise;
        })
      );

      // 4. Filter out any null values and return
      return exercises.filter(ex => ex !== null) as Exercise[];
    } catch (error) {
      console.error(`Error getting exercises for grammar topic ${grammarTopicId}:`, error);
      throw error;
    }
  }
}