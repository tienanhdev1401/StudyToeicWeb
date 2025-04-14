import db from '../config/db';
import { User } from '../models/User';


export class userRepository {
  // Tìm người dùng theo ID
  static async findById(id: number): Promise<User | null> {
    const results = await db.query(
      `SELECT 
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
      FROM Users 
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
      console.log('Đang tạo người dùng mới:', user);
      
      // Thêm log để theo dõi quá trình
      console.log('Bắt đầu thực hiện query...');
      
      const result = await db.query(
        'INSERT INTO Users (emailAddress, fullname, password, role) VALUES (?, ?, ?, ?)',
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



  // Cập nhật thông tin người dùng
  static async updateUser(user: User): Promise<User> {
    try {
      const now = new Date();
      await db.query(
        'UPDATE Users SET fullname = ?, phoneNumber = ?, dateOfBirth = ?, gender = ?, avatar = ?, status = ?, updatedAt = ? WHERE id = ?',
        [user.fullName, user.phoneNumber, user.dateOfBirth, user.gender, user.avatar, user.status, now, user.id]
      );
      
      user.updatedAt = now;
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}
