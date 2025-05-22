import { Observer } from './Observer';
import { Test } from '../models/Test';
import { LearnerRepository } from '../repositories/admin/admin.LearnerRepository';

/**
 * EmailNotificationObserver - Thông báo cho người dùng qua email khi có bài test mới
 */
export class EmailNotificationObserver implements Observer {
  private transporter: any;

  constructor(transporter: any) {
    this.transporter = transporter;
  }

  async update(test: Test): Promise<void> {
    try {
      // Lấy danh sách người dùng cần thông báo
      const users = await LearnerRepository.findAllActiveUsers();
      
      // Kiểm tra xem có người dùng nào không
      if (users.length === 0) {
        console.log('Không có người dùng nào để gửi thông báo');
        return;
      }

      // Gửi email thông báo đến mỗi người dùng
      for (const user of users) {
        await this.transporter.sendMail({
          from: process.env.EMAIL,
          to: user.email,
          subject: 'Bài kiểm tra TOEIC mới đã được thêm vào',
          text: `Xin chào ${user.fullName || 'bạn'},\n\nMột bài kiểm tra mới "${test.title}" đã được thêm vào hệ thống. Đăng nhập để làm thử ngay!\n\nTrân trọng,\nTOEIC Online Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0984e3;">Bài kiểm tra TOEIC mới</h2>
              <p>Xin chào ${user.fullName || 'bạn'},</p>
              <p>Một bài kiểm tra mới <strong>${test.title}</strong> đã được thêm vào hệ thống.</p>
              <p>Hãy đăng nhập và làm thử ngay!</p>
              <p>Trân trọng,<br>TOEIC Online Team</p>
            </div>
          `
        });
      }
      console.log(`Đã gửi email thông báo bài kiểm tra mới: ${test.title} cho ${users.length} người dùng`);
    } catch (error) {
      console.error('Lỗi khi gửi thông báo email:', error);
    }
  }

  
} 