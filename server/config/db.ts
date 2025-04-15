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
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
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
      const [results] = await this.pool.query(sql, values);
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