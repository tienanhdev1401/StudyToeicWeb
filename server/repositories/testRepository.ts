import { TestCollection } from './../models/TestCollection';
import { Test } from '../models/Test';
import db from '../config/db';

export class TestRepository {
  async findById(id: number): Promise<Test | null> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM tests WHERE id = ?',
        [id]
      );
      
      // Chuyển đổi kết quả thành mảng
      const tests = Array.isArray(rows) ? rows : [rows];
      if (!tests.length) return null;

      const test = new Test(
        Number(tests[0].id),
        tests[0].title,
        Number(tests[0].duration)
      );
      return test;

    } catch (error) {
      console.error('TestRepository.findById error:', error);
      throw error;
    }
  }
  async findAll(): Promise<Test[]> {
    try {
      const rows = await db.query('SELECT * FROM tests');
      // Chuyển đổi kết quả thành mảng
      const tests = Array.isArray(rows) ? rows : [rows];
      if (!tests.length) return [];

      // Map các hàng thành đối tượng Test
      const testList = tests.map(row => new Test(
        Number(row.id),
        row.title,
        row.testCollectionID,
        Number(row.duration)
      ));
      return testList;
    } catch (error) {
      console.error('TestRepository.findAll error:', error);
      throw error;
    }
  } 
}