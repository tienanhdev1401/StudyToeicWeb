import db from '../config/db';
import { User } from '../models/User';


export class userRepository {
  // Tìm người dùng theo ID
  static async findById(id: number): Promise<User | null> {
    const results = await db.query(
      `SELECT
        id, 
        avatar,
        dateOfBirth,
        emailAddress AS email,
        fullname AS fullName,
        gender,
        joinAt,
        phoneNumber,
        status,
        updatedAt,
        role
      FROM users 
      WHERE id = ? 
      LIMIT 1`, 
      [id]
    );
    if (Array.isArray(results) && results.length === 0) {
      return null;
    }
  
    const userData = results[0] as any;
    return new User(userData); 
  }
  // Tạo người dùng mới
  static async createUser(user: User): Promise<User> {
    try {
    
      const result = await db.query(
        'INSERT INTO users (emailAddress, fullname, password, role) VALUES (?, ?, ?, ?)',
        [user.email, user.fullName, user.password, "user"]
      );
      if (!result) {
        throw new Error('Kết quả query là null hoặc undefined');
      }
      user.id = result.insertId;
      return user;
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
      throw error;
    }
  }

  static async updatePassword(userId: number, newHashedPassword: string): Promise<boolean> {
    try {
      const now = new Date();
      await db.query(
        'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
        [newHashedPassword, now, userId]
      );
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật mật khẩu:', error);
      throw error;
    }
  }
  

  // Cập nhật thông tin người dùng
  static async updateUser(user: User): Promise<User> {
    try {
        const now = new Date();
        
        // Format dateOfBirth to MySQL date format (YYYY-MM-DD)
        const formattedDateOfBirth = user.dateOfBirth ? 
            new Date(user.dateOfBirth).toISOString().split('T')[0] : 
            null;

        await db.query(
            'UPDATE users SET avatar=?, fullname = ?, phoneNumber = ?, dateOfBirth = ?, gender = ?, updatedAt = ? WHERE id = ?',
            [
                user.avatar,
                user.fullName, 
                user.phoneNumber, 
                formattedDateOfBirth,
                user.gender, 
                now, 
                user.id
            ]
        );
        user.updatedAt = now;
        return user;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
  }
}
