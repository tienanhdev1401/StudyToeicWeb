import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối đến cơ sở dữ liệu
import './config/db';
import './routes/index'

// Sử dụng bodyParser để phân tích dữ liệu JSON
app.use(bodyParser.json());

// Cấu hình session và flash
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

// Middleware để truyền thông điệp flash vào các template
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.messages = req.flash();
  next();
});

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware xử lý JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import router (cần dùng ES6 import trong các file TS kia luôn)


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
