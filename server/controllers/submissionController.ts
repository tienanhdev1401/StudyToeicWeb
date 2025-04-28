import { Request, Response } from 'express';
import { Submission } from '../models/Submission';
import { submissionRepository } from '../repositories/submissionRepository';

class SubmissionController {
  async createSubmission(req: Request, res: Response) {
    try {
      const submissionData = req.body;
      
      // Kiểm tra dữ liệu đầu vào cơ bản
      if (!submissionData.LearnerId || !submissionData.TestId) {
        return res.status(400).json({ message: 'Thiếu thông tin học viên hoặc bài kiểm tra' });
      }

      // Tạo đối tượng Submission từ dữ liệu gửi lên
      const submission = new Submission(submissionData);
      
      // Lưu vào cơ sở dữ liệu
      const submissionId = await submissionRepository.createSubmission(submission);
      
      // Trả về ID của bài làm vừa tạo
      res.status(201).json({ 
        message: 'Đã lưu bài làm thành công', 
        submissionId 
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lưu bài làm' });
    }
  }

  async getSubmissionById(req: Request, res: Response) {
    try {
      const submissionId = parseInt(req.params.id);
      
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: 'ID bài làm không hợp lệ' });
      }
      
      const submission = await submissionRepository.getSubmissionById(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: 'Không tìm thấy bài làm' });
      }
      
      res.status(200).json(submission);
    } catch (error) {
      console.error(`Error getting submission: ${error}`);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lấy thông tin bài làm' });
    }
  }

  async getSubmissionsByLearnerId(req: Request, res: Response) {
    try {
      const learnerId = parseInt(req.params.learnerId);
      
      if (isNaN(learnerId)) {
        return res.status(400).json({ message: 'ID học viên không hợp lệ' });
      }
      
      const submissions = await submissionRepository.getSubmissionsByLearnerId(learnerId);
      
      res.status(200).json(submissions);
    } catch (error) {
      console.error(`Error getting learner submissions: ${error}`);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách bài làm của học viên' });
    }
  }

  async getSubmissionsByTestId(req: Request, res: Response) {
    try {
      const testId = parseInt(req.params.testId);
      
      if (isNaN(testId)) {
        return res.status(400).json({ message: 'ID bài kiểm tra không hợp lệ' });
      }
      
      const submissions = await submissionRepository.getSubmissionsByTestId(testId);
      
      res.status(200).json(submissions);
    } catch (error) {
      console.error(`Error getting test submissions: ${error}`);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách bài làm của bài kiểm tra' });
    }
  }

  async updateSubmission(req: Request, res: Response) {
    try {
      const submissionId = parseInt(req.params.id);
      
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: 'ID bài làm không hợp lệ' });
      }
      
      const submissionData = req.body;
      
      // Kiểm tra xem bài làm có tồn tại không
      const existingSubmission = await submissionRepository.getSubmissionById(submissionId);
      
      if (!existingSubmission) {
        return res.status(404).json({ message: 'Không tìm thấy bài làm' });
      }
      
      // Cập nhật bài làm
      const success = await submissionRepository.updateSubmission(submissionId, submissionData);
      
      if (success) {
        res.status(200).json({ message: 'Cập nhật bài làm thành công' });
      } else {
        res.status(400).json({ message: 'Không có thay đổi nào được thực hiện' });
      }
    } catch (error) {
      console.error(`Error updating submission: ${error}`);
      res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật bài làm' });
    }
  }

  async deleteSubmission(req: Request, res: Response) {
    try {
      const submissionId = parseInt(req.params.id);
      
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: 'ID bài làm không hợp lệ' });
      }
      
      // Kiểm tra xem bài làm có tồn tại không
      const existingSubmission = await submissionRepository.getSubmissionById(submissionId);
      
      if (!existingSubmission) {
        return res.status(404).json({ message: 'Không tìm thấy bài làm' });
      }
      
      // Xóa bài làm
      const success = await submissionRepository.deleteSubmission(submissionId);
      
      if (success) {
        res.status(200).json({ message: 'Xóa bài làm thành công' });
      } else {
        res.status(400).json({ message: 'Không thể xóa bài làm' });
      }
    } catch (error) {
      console.error(`Error deleting submission: ${error}`);
      res.status(500).json({ message: 'Có lỗi xảy ra khi xóa bài làm' });
    }
  }
}

export default new SubmissionController(); 