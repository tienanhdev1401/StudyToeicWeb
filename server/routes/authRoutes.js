const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// Route đăng xuất (yêu cầu xác thực)
router.post('/logout', authMiddleware, logout);

// Route kiểm tra trạng thái xác thực
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;