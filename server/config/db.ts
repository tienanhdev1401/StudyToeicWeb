import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

class Database {
  private static instance: Database | null = null;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      waitForConnections: true,
      connectionLimit: 50,           // Tăng giới hạn kết nối
      queueLimit: 0,
      connectTimeout: 60000,         // Timeout 60 giây
      typeCast: true,                // Bật type casting
      multipleStatements: true,      // Cho phép nhiều câu lệnh SQL
      namedPlaceholders: true        // Sử dụng placeholders có tên
    });
    console.log('Khởi tạo pool kết nối database');
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async query(sql: string, values?: any): Promise<any> {
    try {
      const [results] = await this.pool.query({
        sql,
        values,
        // Tăng timeout cho các truy vấn phức tạp
        timeout: 30000
      });
      return results;
    } catch (error) {
      throw error;
    }
  }

  async end(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('Đã đóng kết nối database pool');
    }
  }
}

// Export instance thay vì class
const db = Database.getInstance();
export default db;