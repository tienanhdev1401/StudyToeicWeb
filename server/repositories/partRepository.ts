import { Part } from '../models/Part';
import db from '../config/db';
import { PartBuilder } from '../builder/PartBuilder';

export class PartRepository {
  async findByTestId(testId: number): Promise<Part[]> {
    try {
      // Lấy dữ liệu từ database
      const results = await db.query(
        'SELECT * FROM parts WHERE TestId = ? ORDER BY partNumber',
        [testId]
      );
      if (!results) {
        return [];
      }
      let rows;
      if (Array.isArray(results) && results.length > 0) {
        if (Array.isArray(results[0])) {
          rows = results[0];
        } else {
          rows = results;
        }
      }
      if (!Array.isArray(rows)) {
        rows = [rows];
      }
      
      // Map các hàng thành đối tượng Part
      const parts = rows.map(row => 
        new PartBuilder()
          .setId(Number(row.id))
          .setPartNumber(Number(row.partNumber))
          .setTestId(Number(row.TestId))
          .build()
      );
      return parts;
    } catch (error) {
      console.error('PartRepository.findByTestId error:', error);
      throw error;
    }
  }
}