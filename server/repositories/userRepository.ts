import database from '../config/db';
import { User } from '../models/User';
import util from 'util';

// Tạo query promisified từ kết nối db
const query = util.promisify(
    database.query as (
        sql: string,
        values: any[],
        callback: (err: Error | null, results: any) => void
    ) => void
).bind(database) as (sql: string, values?: any[]) => Promise<any>;

export class userRepository {
  // Tìm người dùng theo ID
  static async findById(id: number): Promise<User | null> {
    try {
      const results: any[] = await query('SELECT * FROM Users WHERE id = ? LIMIT 1', [id]) as any[];
      
      if (results.length === 0) {
        return null;
      }
      
      const userData = results[0];
      
      return new User(
        userData.emailAddress,
        userData.password,
        userData.role,
        userData.id,
        userData.fullname,
        userData.phoneNumber, 
        userData.dateOfBirth,
        userData.gender,
        userData.avatar,
        userData.joinAt,
        userData.status,
        userData.updatedAt
      );
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

//   // Các phương thức khác có thể được thêm vào khi cần
//   static async updateUser(user: User): Promise<User> {
//     try {
//       await query(
//         'UPDATE Users SET fullname = ?, phoneNumber = ?, dateOfBirth = ?, gender = ?, avatar = ?, status = ?, updatedAt = NOW() WHERE id = ?',
//         [user.fullName, user.phoneNumber, user.dateOfBirth, user.gender, user.avatar, user.status, user.id]
//       );
      
//       return user;
//     } catch (error) {
//       console.error('Error updating user:', error);
//       throw error;
//     }
//   }
}