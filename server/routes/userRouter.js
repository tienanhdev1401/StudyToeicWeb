const express = require('express');
const router = express.Router();
const { getUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Route lấy thông tin người dùng
router.get('/profile', getUser);

// Route kiểm tra trạng thái xác thực
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;