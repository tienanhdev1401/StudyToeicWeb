import { Test } from '../models/Test';
import db from '../config/db';

export class TestRepository {
  async findById(id: number): Promise<Test | null> {
    try {
      // Get raw data from database
      const [results] = await db.query(
        'SELECT * FROM tests WHERE id = ?',
        [id]
      );
      if (!results) {
        return null;
      }
      const test = new Test(
        Number(results.id),
        results.title,
        Number(results.duration)
      );
      return test;

    } catch (error) {
      console.error('TestRepository.findById error:', error);
      throw error;
    }
  }
}