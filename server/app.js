const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

// Sử dụng bodyParser để phân tích dữ liệu JSON
app.use(bodyParser.json());

// Kết nối đến cơ sở dữ liệu
require('./config/db');

// Cấu hình session và flash
app.use(session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// Middleware để truyền thông điệp flash vào các template
app.use((req, res, next) => {
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
app.use(express.json());
// Middleware xử lý JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', require('./routes/authRoutes'));
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});