import { Request, Response } from 'express';
import { StaffRepository } from '../../repositories/admin/admin.StaffRepository';
import { User } from '../../models/User';
import { authRepository } from '../../repositories/authRepository';


export class StaffController {
  /**
   * Lấy tất cả nhân viên
   */
  static async getAllStaffs(req: Request, res: Response) {
    try {
      const staffs = await StaffRepository.getAllStaff();

      res.status(200).json({
        success: true,
        data: staffs,
        message: 'Lấy danh sách nhân viên thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách nhân viên'
      });
    }
  }

  /**
   * Tìm nhân viên theo ID
   */
  static async findStaffById(req: Request, res: Response) {
    try {
      const staffId = parseInt(req.params.id);
      const staff = await StaffRepository.findById(staffId);

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhân viên'
        });
      }

      res.status(200).json({
        success: true,
        data: staff,
        message: 'Lấy thông tin nhân viên thành công'
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhân viên:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin nhân viên'
      });
    }
  }

  /**
   * Thêm nhân viên mới
   */
  static async addStaff(req: Request, res: Response): Promise<void> {
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
      const newStaff = new User({
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

      const createdStaff = await StaffRepository.addStaff(newStaff);

      res.status(201).json({
        success: true,
        message: 'Thêm nhân viên thành công',
        data: createdStaff.toJSON()
      });
      console.log(newStaff);
      
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }
  

  /**
   * Cập nhật nhân viên
   */
  static async updateStaff(req: Request, res: Response) {
    try {
      const staffId = parseInt(req.params.id);
      const updateData = req.body as Partial<User>;

      const updated = await StaffRepository.updateStaff(staffId, updateData);

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

  //block nhân viên
  static async blockStaff(req: Request, res: Response) {
    try {
      const staffId = parseInt(req.params.id);
      const success = await StaffRepository.blockStaff(staffId);
  
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhân viên để chặn'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Chặn nhân viên thành công'
      });
    } catch (error) {
      console.error('Lỗi khi chặn nhân viên:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi chặn nhân viên'
      });
    }
  }
  
    //unblock nhân viên
    static async unblockStaff(req: Request, res: Response) {
      try {
        const staffId = parseInt(req.params.id);
        const success = await StaffRepository.unblockStaff(staffId);
    
        if (!success) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy nhân viên để mở chặn'
          });
        }
    
        res.status(200).json({
          success: true,
          message: 'Mở chặn nhân viên thành công'
        });
      } catch (error) {
        console.error('Lỗi khi mở chặn nhân viên:', error);
        res.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi mở chặn nhân viên'
        });
      }
    }
    static async deleteStaff(req: Request, res: Response) {
      try {
        const staffId = parseInt(req.params.id);
        const deleted = await StaffRepository.deleteStaff(staffId);
  
        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy nhân viên để xoá'
          });
        }
  
        res.status(200).json({
          success: true,
          message: 'Xoá nhân viên thành công'
        });
      } catch (error) {
        console.error('Lỗi khi xoá nhân viên:', error);
        res.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi xoá nhân viên'
        });
      }
    }
}

export default new StaffController();
