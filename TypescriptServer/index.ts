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

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Import và đăng ký routes
import route from './routes/index';
route(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
