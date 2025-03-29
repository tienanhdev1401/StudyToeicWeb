const bcrypt = require('bcrypt');
const util = require('util');
const mysql = require('mysql2'); 
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const query = util.promisify(db.query).bind(db);

exports.getUser = async (req, res) => {
    try {
        // Lấy token từ header
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
        }

        // Giải mã token
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: 'Token không hợp lệ' });
        }

        // Truy vấn thông tin người dùng
        const results = await query('SELECT * FROM Users WHERE id = ? LIMIT 1', [decoded.id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // Trả về thông tin người dùng
        const user = results[0];
        res.status(200).json({ 
            id: user.id, 
            fullName: user.fullname,
            email: user.email, 
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            avatar: user.avatar,
            joinAt: user.joinAt,
            status: user.status,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};