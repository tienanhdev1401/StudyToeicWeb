// import mysql from 'mysql2';
// import dotenv from 'dotenv';
// import { Connection } from 'mysql2';

// dotenv.config({ path: './.env' });

// class Database {
//   private connection: Connection;

//   constructor() {
//     this.connection = mysql.createConnection({
//       host: process.env.DATABASE_HOST,
//       user: process.env.DATABASE_USER,
//       password: process.env.DATABASE_PASSWORD,
//       database: process.env.DATABASE,
//       insecureAuth: true
//     });

//     this.connect();
//   }

//   private connect(): void {
//     this.connection.connect((err) => {
//       if (err) {
//         console.error('Lỗi kết nối đến cơ sở dữ liệu:', err.stack);
//         return;
//       }
//       console.log('Kết nối đến cơ sở dữ liệu thành công!');
//     });
//   }

//   public getConnection(): Connection {
//     return this.connection;
//   }

//   public query(sql: string, values?: any): Promise<any> {
//     return new Promise((resolve, reject) => {
//       this.connection.query(sql, values, (error, results) => {
//         if (error) {
//           return reject(error);
//         }
//         resolve(results);
//       });
//     });
//   }
// }

// const database = new Database();
// export default database;