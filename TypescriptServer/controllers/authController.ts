import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import util from 'util';
import jwt from 'jsonwebtoken';
import db from '../config/db';

// Tạo hàm query async từ db.query
const query = util.promisify(db.query).bind(db) as (sql: string, values?: any[]) => Promise<any>;

// Giao diện người dùng (có thể mở rộng sau)
interface User {
  id: number;
  emailAddress: string;
  password: string;
  role: string;
}

// Đăng ký
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
      return;
    }

    const existingUsers: User[] = await query('SELECT id FROM users WHERE emailAddress = ? LIMIT 1', [email]);

    if (existingUsers.length > 0) {
      res.status(400).json({ message: 'Email đã được đăng ký' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query('INSERT INTO users (emailAddress, password) VALUES (?, ?)', [email, hashedPassword]);

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
      return;
    }

    const results: User[] = await query('SELECT id, emailAddress, password, role FROM Users WHERE emailAddress = ? LIMIT 1', [email]);

    if (results.length === 0) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const user = results[0];

    // Nếu bạn chưa mã hóa mật khẩu trong DB, dùng điều kiện trực tiếp
    // Nhưng nếu đã hash, dùng đoạn này:
    // const passwordValid = await bcrypt.compare(password, user.password);
    // if (!passwordValid) {
    //   return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    // }

    if (password !== user.password) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.emailAddress,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '5h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.emailAddress,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Đăng xuất
export const logout = (_req: Request, res: Response): void => {
  res.status(200).json({ message: 'Đăng xuất thành công' });
};
