import { TestCollection } from '../../models/TestCollection';
import { Test } from '../../models/Test';
import db from '../../config/db';

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
        tests[0].testCollection,
        Number(tests[0].duration)
      );
      console.log('test:', test);
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
        row.testCollection,
        Number(row.duration)
      ));
      return testList;
    } catch (error) {
      console.error('TestRepository.findAll error:', error);
      throw error;
    }
  } 
async create(test: Test): Promise<Test> {
    try {
      const result = await db.query(
        'INSERT INTO tests (title, testCollection, duration) VALUES (?, ?, ?)',
        [test.title, test.testCollection, test.duration]
      );
      
      const newTest = new Test(
        Number(result.insertId),
        test.title,
        test.testCollection,
        test.duration
      );
      
      return newTest;
    } catch (error) {
      console.error('TestRepository.create error:', error);
      throw error;
    }
  }
  
  async update(test: Test): Promise<Test> {
    try {
      await db.query(
        'UPDATE tests SET title = ?, testCollection = ?, duration = ? WHERE id = ?',
        [test.title, test.testCollection, test.duration, test.id]
      );
      
      return test;
    } catch (error) {
      console.error('TestRepository.update error:', error);
      throw error;
    }
  }
  
  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query(
        'DELETE FROM tests WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('TestRepository.delete error:', error);
      throw error;
    }
  }
}