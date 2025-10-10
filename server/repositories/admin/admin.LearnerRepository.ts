import database from "../../config/db";
import { User } from "../../models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class LearnerRepository {
  /**
   * Tìm người học theo ID
   */

  static async findAllActiveUsers(): Promise<User[]> {
    try {
      const results = await database.query(
        "SELECT id, emailAddress as email, fullName, role FROM users WHERE status = 'ACTIVE' AND role = 'user'"
      );

      if (!Array.isArray(results) || results.length === 0) {
        return [];
      }

      return results.map(
        (userData: any) =>
          new User({
            id: userData.id,
            email: userData.email,
            password: "", // Không cần mật khẩu cho thông báo
            fullName: userData.fullName,
            role: userData.role,
          })
      );
    } catch (error) {
      console.error("Lỗi khi tìm người dùng hoạt động:", error);
      throw error;
    }
  }

  static async findById(id: number): Promise<User | null> {
    const results = await database.query(
      `SELECT id, dateOfBirth, emailAddress, fullname, gender,
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
  static async getAllLearners(): Promise<User[]> {
    const results = await database.query(
      `SELECT * FROM users
       WHERE role = 'user'`
    );

    return results as User[];
  }

  /**
   * Thêm người học mới
   */
  static async addLearner(learner: User): Promise<User> {
    try {
      const now = new Date();
      const result = await database.query(
        `INSERT INTO users (emailAddress, fullname, password, role, gender, phoneNumber, dateOfBirth, avatar, joinAt, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          learner.email,
          learner.fullName,
          learner.password,
          "user",
          learner.gender,
          learner.phoneNumber,
          learner.dateOfBirth,
          null,
          now,
          "ACTIVE",
          now,
        ]
      );

      if (!result) {
        throw new Error("Không thể thêm nhân viên");
      }

      learner.id = result.insertId;
      return learner;
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên:", error);
      throw learner;
    }
  }

  /**
   * Cập nhật thông tin người học
   */
  static async updateLearner(
    id: number,
    learner: Partial<User>
  ): Promise<User | null> {
    try {
      const fields = [];
      const values = [];

      for (const key in learner) {
        let value = learner[key as keyof User];

        if (value !== undefined) {
          // Format thời gian nếu là joinAt hoặc updatedAt
          if (key === "joinAt" || key === "updatedAt") {
            value = new Date(value as string)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
          }

          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return await this.findById(id);

      values.push(id); // Thêm ID vào cuối

      const result = await database.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      if (!result) {
        throw new Error("Không thể cập nhật nhân viên");
      }

      return await this.findById(id);
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error);
      throw error;
    }
  }

  /**
   * block và unblock người học theo ID
   */
  static async blockLearner(id: number): Promise<boolean> {
    const result = await database.query(
      `UPDATE users SET status = 'BANNED', updatedAt = NOW() WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  static async unblockLearner(id: number): Promise<boolean> {
    const result = await database.query(
      `UPDATE users SET status = 'ACTIVE', updatedAt = NOW() WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  static async resetLearnerPassword(id: number): Promise<boolean> {
    console.log(id);
    const hashedPassword = await bcrypt.hash("123456789", 10);
    const result = await database.query(
      `UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?`,
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }
}
