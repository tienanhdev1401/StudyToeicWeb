// const bcrypt = require('bcrypt');
// const util = require('util');
// const mysql = require('mysql2'); 
// const jwt = require('jsonwebtoken');
// const db = require('../config/db');

// const query = util.promisify(db.query).bind(db);

// exports.register = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
//         }

//         // Kiểm tra email đã tồn tại chưa
//         const existingUsers = await query('SELECT id FROM users WHERE emailAddress = ? LIMIT 1', [email]);

//         if (existingUsers.length > 0) {
//             return res.status(400).json({ message: 'Email đã được đăng ký' });
//         }

//         // Mã hóa mật khẩu
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Thêm người dùng mới
//         await query('INSERT INTO users (emailAddress, password) VALUES (?, ?)', [email, hashedPassword]);

//         res.status(201).json({ message: 'Đăng ký thành công' });
//     } catch (error) {
//         console.error('Lỗi đăng ký:', error);
//         res.status(500).json({ message: 'Lỗi máy chủ' });
//     }
// };

// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         // Kiểm tra email và password
//         if (!email || !password) {
//             return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
//         }
//         const results = await query('SELECT id, emailAddress, password, role FROM Users WHERE emailAddress = ? LIMIT 1', [email]);
//         if (results.length === 0) {
//             return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
//         }
//         const user = results[0];
//         // Kiểm tra mật khẩu
//         // const passwordValid = await bcrypt.compare(password, user.password);
//         // if (!passwordValid) {
//         //     return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
//         // }
//          if (password!=user.password) {
//             return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
//         }

//         // Tạo JWT token
//         const token = jwt.sign(
//             { 
//                 id: user.id, 
//                 email: user.emailAddress, 
//                 role: user.role 
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '5h' } 
//         );

//         // Trả về token và thông tin người dùng
//         res.status(200).json({ 
//             token, 
//             user: { 
//                 id: user.id, 
//                 email: user.email, 
//                 role: user.role 
//             } 
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ message: 'Lỗi máy chủ' });
//     }
// };

// // Đăng xuất (phía máy khách)
// exports.logout = (req, res) => {
//     res.status(200).json({ message: 'Đăng xuất thành công' });
//   };