import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { authRepository } from '../repositories/authRepository';
import { User } from '../models/User';

// Interface mở rộng kiểu của JWT payload
interface CustomJwtPayload extends JwtPayload {
  id: number;
}

const otpStore = new Map<string, { otp: string; expires: Date; userData: Partial<User> }>();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
export class UserController {

  // Lấy thông tin người dùng hiện tại
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'Bạn chưa đăng nhập' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as CustomJwtPayload;

      if (!decoded?.id) {
        res.status(401).json({ error: 'Token không hợp lệ' });
        return;
      }

      const user = await userRepository.findById(decoded.id);

      if (!user) {
        res.status(404).json({ error: 'Người dùng không tồn tại' });
        return;
      }

      // Sử dụng toJSON để loại bỏ mật khẩu
      res.status(200).json(user.toJSON());
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }

  async sendVerificationCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Vui lòng nhập email' });
        return;
      }
      // Tạo mã OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu mã OTP vào store với thời gian hết hạn 10 phút
      otpStore.set(email, {
        otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
        userData: { email }
      });

      // Gửi email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Mã xác thực tạo tài khoản',
        text: `Mã xác thực của bạn là: ${otp}`
      });

      res.status(200).json({
        success: true,
        message: 'Mã xác thực đã được gửi đến email của bạn'
      });
    } catch (error) {
      console.error('Lỗi gửi mã xác thực:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }
  //Đăng ký
  // Đăng ký người dùng mới


  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullname, verificationCode } = req.body;

      // Validate input
      if (!email || !password || !fullname || !verificationCode) {
        res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        return;
      }

      // Kiểm tra mã OTP
      const otpData = otpStore.get(email);

      if (!otpData) {
        res.status(400).json({
          success: false,
          message: 'Bạn cần gửi mã xác thực trước'
        });
        return;
      }

      // Kiểm tra mã OTP có hết hạn không
      if (new Date() > otpData.expires) {
        // Xóa mã hết hạn
        otpStore.delete(email);
        res.status(400).json({
          success: false,
          message: 'Mã xác thực đã hết hạn, vui lòng yêu cầu mã mới'
        });
        return;
      }

      // Kiểm tra mã xác thực
      if (verificationCode !== otpData.otp || email !== otpData.userData.email) {
        res.status(401).json({
          success: false,
          message: 'Mã xác thực không đúng'
        });
        return;
      }

      // Kiểm tra email tồn tại
      const existingUser = await authRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'Email đã được đăng ký' });
        return;
      }

      // Mã hóa mật khẩu
      const hashedPassword = await authRepository.hashPassword(password);

      // Tạo user mới
      const newUser = new User({
        email: email,
        password: hashedPassword,
        fullName: fullname,
      });
      const createdUser = await userRepository.createUser(newUser);
      
       res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        user: createdUser.toJSON(),
      });
      // Xóa mã OTP sau khi đăng ký thành công
      otpStore.delete(email);
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, currentPassword, newPassword, verificationCode } = req.body;
  
      // Kiểm tra dữ liệu đầu vào
      if (!email || !currentPassword || !newPassword || !verificationCode) {
        res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        return;
      }
  
      // Kiểm tra mã OTP
      const otpData = otpStore.get(email);
      
      if (!otpData) {
        res.status(400).json({
          success: false,
          message: 'Bạn cần gửi mã xác thực trước'
        });
        return;
      }
  
      // Kiểm tra mã OTP có hết hạn không
      if (new Date() > otpData.expires) {
        // Xóa mã hết hạn
        otpStore.delete(email);
        res.status(400).json({
          success: false,
          message: 'Mã xác thực đã hết hạn, vui lòng yêu cầu mã mới'
        });
        return;
      }
      // Kiểm tra mã xác thực
      if (verificationCode !== otpData.otp) {
        res.status(401).json({
          success: false,
          message: 'Mã xác thực không đúng'
        });
        return;
      }
  
      // Tìm người dùng theo email
      const user = await authRepository.findByEmail(email);
      if (!user) {
        res.status(404).json({ error: 'Người dùng không tồn tại' });
        return;
      }
      // Kiểm tra mật khẩu hiện tại
      const isPasswordValid = await user.checkPassword(currentPassword);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
        return;
      }
  
      // Mã hóa mật khẩu mới
      const hashedNewPassword = await authRepository.hashPassword(newPassword);
  
      // Cập nhật mật khẩu
      if (!user.id) {
        throw new Error("User ID không hợp lệ");
    }
    
    await userRepository.updatePassword(user.id, hashedNewPassword);
    
      // Xóa mã OTP sau khi đổi mật khẩu thành công
      otpStore.delete(email);
  
      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // Lấy token từ header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'Unauthorized - No token provided' });
        return;
      }

      // Verify token và lấy user ID
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as CustomJwtPayload;

      if (!decoded?.id) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Lấy thông tin user hiện tại
      const currentUser = await userRepository.findById(decoded.id);
      if (!currentUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Lấy dữ liệu cập nhật từ request body
      const { fullName, phoneNumber, dateOfBirth, gender } = req.body;

      // Cập nhật thông tin mới
      currentUser.fullName = fullName || currentUser.fullName;
      currentUser.phoneNumber = phoneNumber || currentUser.phoneNumber;
      currentUser.dateOfBirth = dateOfBirth || currentUser.dateOfBirth;
      currentUser.gender = gender || currentUser.gender;

      // Lưu thông tin cập nhật vào database
      const updatedUser = await userRepository.updateUser(currentUser);

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Server error when updating profile' });
    }
  }
}

export default new UserController();