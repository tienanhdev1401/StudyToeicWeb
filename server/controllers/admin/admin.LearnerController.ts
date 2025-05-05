import { Request, Response } from 'express';
import { LearnerRepository } from '../../repositories/admin/admin.LearnerRepository';
import { User } from '../../models/User';
import { authRepository } from '../../repositories/authRepository';


export class LearnerController {
  /**
   * Lấy tất cả người học
   */
  static async getAllLearners(req: Request, res: Response) {
    try {
      const learners = await LearnerRepository.getAllLearners();

      res.status(200).json({
        success: true,
        data: learners,
        message: 'Lấy danh sách người học thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người học:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách người học'
      });
    }
  }

  /**
   * Tìm người học theo ID
   */
  static async findLearnerById(req: Request, res: Response) {
    try {
      const learnerId = parseInt(req.params.id);
      const learner = await LearnerRepository.findById(learnerId);

      if (!learner) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người học'
        });
      }

      res.status(200).json({
        success: true,
        data: learner,
        message: 'Lấy thông tin người học thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người học:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin người học'
      });
    }
  }

  /**
   * Thêm người học mới
   */
  static async addLearner(req: Request, res: Response): Promise<void> {
      try {
        const { emailAddress, fullname, password, role, gender, phoneNumber, dateOfBirth, avatar, status  } = req.body;
  
        // Validate input
        if (!emailAddress || !password || !fullname) {
          res.status(400).json({ 
            success: false,
            message: 'Vui lòng nhập đầy đủ thông tin bắt buộc (email, mật khẩu và họ tên)' 
          });
          return;
        }
        // Kiểm tra email tồn tại
        const existingUser = await authRepository.findByEmail(emailAddress);
        if (existingUser) {
          res.status(400).json({ 
            success: false,
            message: 'Email đã được sử dụng' 
          });
          return;
        }
  
        // Mã hóa mật khẩu
        const hashedPassword = await authRepository.hashPassword(password);
        
        const now = new Date();
  
        // Tạo staff mới
        const newLearner = new User({
          email : emailAddress,
          fullName : fullname,
          password: hashedPassword,
          gender : gender,
          phoneNumber : phoneNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          avatar: avatar,
          status: status,
          joinAt:now,
          role: role ,
          updatedAt :now
        });
  
        const createdLearner = await LearnerRepository.addLearner(newLearner);
  
        res.status(201).json({
          success: true,
          message: 'Thêm nhân viên thành công',
          data: createdLearner.toJSON()
        });
        console.log(newLearner);
        
      } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
      }
    }

  /**
   * Cập nhật người học
   */
  static async updateLearner(req: Request, res: Response) {
      try {
        const learnerId = parseInt(req.params.id);
        const updateData = req.body as Partial<User>;
  
        const updated = await LearnerRepository.updateLearner(learnerId, updateData);
  
        if (!updated) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy nhân viên để cập nhật'
          });
        }
  
        res.status(200).json({
          success: true,
          data: updated,
          message: 'Cập nhật nhân viên thành công'
        });
      } catch (error) {
        console.error('Lỗi khi cập nhật nhân viên:', error);
        res.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi cập nhật nhân viên'
        });
      }
    }

  //block người học
  static async blockLearner(req: Request, res: Response) {
    try {
      const learnerId = parseInt(req.params.id);
      const success = await LearnerRepository.blockLearner(learnerId);
  
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người học để chặn'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Chặn người học thành công'
      });
    } catch (error) {
      console.error('Lỗi khi chặn người học:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi chặn người học'
      });
    }
  }
  
    //unblock người học
    static async unblockLearner(req: Request, res: Response) {
      try {
        const learnerId = parseInt(req.params.id);
        const success = await LearnerRepository.unblockLearner(learnerId);
    
        if (!success) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy người học để mở chặn'
          });
        }
    
        res.status(200).json({
          success: true,
          message: 'Mở chặn người học thành công'
        });
      } catch (error) {
        console.error('Lỗi khi mở chặn người học:', error);
        res.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi mở chặn người học'
        });
      }
    }
    //reset mật khẩu người học
    static async resetLearnerPassword(req: Request, res: Response) {
      try {
        const learnerId = parseInt(req.params.id);
        const success = await LearnerRepository.resetLearnerPassword(learnerId);
    
        if (!success) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy người học để đặt lại mật khẩu'
          });
        }
    
        res.status(200).json({
          success: true,
          message: 'Đặt lại mật khẩu người học thành công'
        });
      } catch (error) {
        console.error('Lỗi khi mở chặn người học:', error);
        res.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi mở chặn người học'
        });
      }
    }
}

export default new LearnerController();
