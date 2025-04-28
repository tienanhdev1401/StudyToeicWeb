import { Part } from '../../models/Part';
import db from '../../config/db';

export class PartRepository {
  static async findAll(): Promise<Part[]> {
    try {
      console.log('Finding all parts');
      const [rows] = await db.query('SELECT * FROM parts ORDER BY id');
      
      // Xử lý trường hợp không có kết quả
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        console.log('No parts found');
        return [];
      }
      
      console.log(`Found ${rows.length} parts in total`);
      
      // Map các hàng thành đối tượng Part
      const parts = rows.map(row => {
        if (!row || row.id === undefined) {
          console.warn('Found invalid row in parts query result:', row);
          return null;
        }
        
        return new Part(
          Number(row.id),
          Number(row.partNumber),
          Number(row.TestId)
        );
      }).filter(part => part !== null) as Part[];
      
      return parts;
    } catch (error) {
      console.error('PartRepository.findAll error:', error);
      throw error;
    }
  }

  static async findByTestId(testId: number): Promise<Part[]> {
    try {
      console.log(`Finding parts for test ID: ${testId}`);
      // Lấy dữ liệu từ database
      const results = await db.query(
        'SELECT * FROM parts WHERE TestId = ? ORDER BY partNumber',
        [testId]
      );
      
      // Xử lý trường hợp không có kết quả
      if (!results || !Array.isArray(results) || results.length === 0) {
        console.log(`No parts found for test ID: ${testId}`);
        return [];
      }
      
      console.log(`Found ${Array.isArray(results) ? results.length : 0} parts for test ID: ${testId}`);
      
      // Map các hàng thành đối tượng Part
      const parts = results.map(row => {
        if (!row || row.id === undefined) {
          console.warn('Found invalid row in parts query result:', row);
          return null;
        }
        
        return new Part(
          Number(row.id),
          Number(row.partNumber),
          Number(row.TestId)
        );
      }).filter(part => part !== null) as Part[];
      
      console.log(`Returning ${parts.length} valid parts for test ID: ${testId}`);
      return parts;
    } catch (error) {
      console.error('PartRepository.findByTestId error:', error);
      throw error;
    }
  }

  
  static async create(part: Part): Promise<Part> {
    try {
      console.log(`Creating part for test ID: ${part.TestId}, partNumber: ${part.partNumber}`);
      const result = await db.query(
        'INSERT INTO parts (partNumber, TestId) VALUES (?, ?)',
        [part.partNumber, part.TestId]
      );
      
      console.log(`Part created with ID: ${result.insertId}`);
      
      const newPart = new Part(
        Number(result.insertId),
        part.partNumber,
        part.TestId
      );
      
      return newPart;
    } catch (error) {
      console.error('PartRepository.create error:', error);
      throw error;
    }
  }
  
  static async update(part: Part): Promise<Part> {
    try {
      console.log(`Updating part ID: ${part.id}, partNumber: ${part.partNumber}`);
      await db.query(
        'UPDATE parts SET partNumber = ? WHERE id = ?',
        [part.partNumber, part.id]
      );
      
      console.log(`Part updated successfully`);
      return part;
    } catch (error) {
      console.error('PartRepository.update error:', error);
      throw error;
    }
  }
  
  static async delete(id: number): Promise<boolean> {
    try {
      console.log(`Deleting part ID: ${id}`);
      const result = await db.query(
        'DELETE FROM parts WHERE id = ?',
        [id]
      );
      
      const success = result.affectedRows > 0;
      console.log(`Part deletion ${success ? 'successful' : 'failed'}, affectedRows: ${result.affectedRows}`);
      return success;
    } catch (error) {
      console.error(`PartRepository.delete error for part ID ${id}:`, error);
      throw error;
    }
  }
}