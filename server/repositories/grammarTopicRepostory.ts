import database from '../config/db';
import { GrammarTopic } from '../models/GrammarTopic';

export class GrammarTopicRepository {

  static async getAllGranmmarTopic(): Promise<GrammarTopic[]> {
    try {
      const results = await database.query(
        'SELECT id, title, content FROM grammartopics'
      );
      
      return results.map((row: any) => 
        new GrammarTopic(row.id, row.title, row.content)
      );
    } catch (error) {
      console.error('Error getting all grammar topics:', error);
      throw error;
    }
  }


  static async findById(id: number): Promise<GrammarTopic | null> {
    try {
      const results = await database.query(
        'SELECT id, title, content FROM grammartopics WHERE id = ? LIMIT 1',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const row = results[0];
      return new GrammarTopic(row.id, row.title, row.content);
    } catch (error) {
      console.error(`Error finding grammar topic with ID ${id}:`, error);
      throw error;
    }
  }


  static async createGrammarTopic(title: string, content: string): Promise<GrammarTopic> {
    try {
      const result = await database.query(
        'INSERT INTO grammartopics (title, content) VALUES (?, ?)',
        [title, content]
      );
      
      return new GrammarTopic(result.insertId, title, content);
    } catch (error) {
      console.error('Error creating grammar topic:', error);
      throw error;
    }
  }


  static async updateGrammarTopic(id: number, title: string, content: string): Promise<boolean> {
    try {
      const result = await database.query(
        'UPDATE grammartopics SET title = ?, content = ? WHERE id = ?',
        [title, content, id]
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
}