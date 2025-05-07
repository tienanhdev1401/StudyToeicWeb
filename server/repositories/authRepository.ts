import db from '../config/db';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

export class authRepository {
  // Tìm người dùng theo email
  static async findByEmail(email: string): Promise<User | null> {
    const results = await db.query(
      'SELECT id, emailAddress as email, password, role , status FROM users WHERE emailAddress = ? LIMIT 1', 
      [email]
    );

    if (Array.isArray(results) && results.length === 0) {
      return null;
    }
    const userData = results[0] as any;
    return new User(userData);
  }
 

  // Lưu người dùng mới hoặc cập nhật người dùng hiện có
  static async save(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('Không thể cập nhật user không có ID');
    }
    
    await db.query(
      'UPDATE users SET emailAddress = ?, password = ?, role = ? WHERE id = ?',
      [user.email, user.password, user.role, user.id]
    );

    return user;
  }

  // Mã hóa mật khẩu
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}