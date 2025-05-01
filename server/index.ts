import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import dotenv from 'dotenv';
import compression from 'compression';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware nén dữ liệu phản hồi để giảm kích thước
app.use(compression({
  level: 6, // Mức độ nén 0-9, 6 là mức tốt nhất về tốc độ/hiệu quả
  threshold: 1024 // Chỉ nén dữ liệu lớn hơn 1KB
}));

// Kết nối đến cơ sở dữ liệu
import './config/db';
// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware cache cho các API tĩnh
app.use((req: Request, res: Response, next: NextFunction) => {
  // Cache cho API test
  if (req.method === 'GET' && req.path.startsWith('/api/test/')) {
    // Cache trong 5 phút (300 giây)
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  next();
});

// Sử dụng bodyParser để phân tích dữ liệu JSON
app.use(bodyParser.json());
app.use(express.json());    
app.use(express.urlencoded({ extended: true }));

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

// Phục vụ static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: 86400000 // 1 ngày
}));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: 86400000 // 1 ngày
}));

// Import và đăng ký routes
import route from './routes/index';
route(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
