import database from '../../config/db';
import { User } from '../../models/User';

export class StaffRepository {
  /**
   * Tìm người học theo ID
   */
  static async findById(id: number): Promise<User | null> {
    const results = await database.query(
      `SELECT id, avatar, dateOfBirth, emailAddress, fullname, gender,
              joinAt, password, phoneNumber, status, updatedAt, role
       FROM users
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    return results[0] as User;
  }

  /**
   * Lấy tất cả người học
   */
  static async getAllStaff(): Promise<User[]> {
    const results = await database.query(
      `SELECT * FROM users
       WHERE role = 'staff'`
    );

    return results as User[];
  }

  /**
   * Thêm người học mới
   */

  static async addStaff(staff: User): Promise<User> {
    try {
      const now = new Date();
      const result = await database.query(
        `INSERT INTO users (emailAddress, fullname, password, role, gender, phoneNumber, dateOfBirth, avatar, joinAt, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          staff.email,
          staff.fullName,
          staff.password,
          "staff",
          staff.gender,
          staff.phoneNumber,
          staff.dateOfBirth,
          null,
          now,
          "ACTIVE",
          now,
        ]
      );
  
      if (!result) {
        throw new Error('Không thể thêm nhân viên');
      }
  
      staff.id = result.insertId;
      return staff;
    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
      throw staff;
    }
  }
  

  /**
   * Cập nhật thông tin người học
   */
  static async updateStaff(id: number, staff: Partial<User>): Promise<User | null> {
    try {
      const fields = [];
      const values = [];
  
      for (const key in staff) {
        let value = staff[key as keyof User];
        
        if (value !== undefined) {
          // Format thời gian nếu là joinAt hoặc updatedAt
          if (key === 'joinAt' || key === 'updatedAt') {
            value = new Date(value as string).toISOString().slice(0, 19).replace('T', ' ');
          }
  
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
  
      if (fields.length === 0) return await this.findById(id);
  
      values.push(id); // Thêm ID vào cuối
  
      const result = await database.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
  
      if (!result) {
        throw new Error('Không thể cập nhật nhân viên');
      }
  
      return await this.findById(id);
    } catch (error) {
      console.error('Lỗi khi cập nhật nhân viên:', error);
      throw error;
    }
  }
  

  /**
   * block và unblock người học theo ID
   */
  static async blockStaff(id: number): Promise<boolean> {
    const result = await database.query(
      `UPDATE users SET status = 'BANNED', updatedAt = NOW() WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
  
  static async unblockStaff(id: number): Promise<boolean> {
    const result = await database.query(
      `UPDATE users SET status = 'ACTIVE', updatedAt = NOW() WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteStaff(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
  
      if (!result || result.affectedRows === 0) {
        console.warn(`Không tìm thấy nhân viên với id = ${id} để xóa.`);
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa nhân viên:', error);
      throw error;
    }
  }
  
  
}
