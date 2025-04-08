import database from '../config/db';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

export class UserRepository {
  // Tìm người dùng theo email
  static async findByEmail(email: string): Promise<User | null> {
    const results = await database.query(
      'SELECT id, emailAddress as email, password, role FROM Users WHERE emailAddress = ? LIMIT 1', 
      [email]
    );

    if (Array.isArray(results) && results.length === 0) {
      return null;
    }

    const userData = results[0] as any;
    return new User(userData.email, userData.password, userData.role, userData.id);
  }

  // Lưu người dùng mới hoặc cập nhật người dùng hiện có
  static async save(user: User): Promise<User> {
    if (user.id) {
      // Cập nhật người dùng hiện có
      await database.query(
        'UPDATE Users SET emailAddress = ?, password = ?, role = ? WHERE id = ?',
        [user.email, user.password, user.role, user.id]
      );
    } else {
      // Thêm người dùng mới
      const result = await database.query(
        'INSERT INTO Users (emailAddress, password, role) VALUES (?, ?, ?)',
        [user.email, user.password, user.role]
      );
      
      if ('insertId' in result) {
        user.id = result.insertId as number;
      }
    }
    
    return user;
  }

  // Mã hóa mật khẩu
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}