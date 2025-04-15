import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

class Database {
  private connection: any;

  constructor() {
    this.connection = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      insecureAuth: true
    });

    this.connection.connect((err: any) => {
      if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', err.stack);
        return;
      }
      console.log('Kết nối đến cơ sở dữ liệu thành công!');
    });
  }

  query(sql: string, values?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, values, (error: any, results: any) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  }
}

export default new Database();