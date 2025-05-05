import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import config from './config';

class SubmissionService {
  /**
   * Lưu bài làm của người dùng
   * @param {Object} submissionData - Dữ liệu bài làm
   * @returns {Promise<Object>} - Kết quả lưu bài làm
   */
  static async saveSubmission(submissionData) {
    try {
      const token = getAuthToken();
      
      const response = await axios.post(
        `${config.API_BASE_URL}/submissions`, 
        submissionData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lưu bài làm:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bài làm của người dùng
   * @param {number} learnerId - ID của học viên
   * @returns {Promise<Array>} - Danh sách bài làm
   */
  static async getSubmissionsByLearnerId(learnerId) {
    try {
      const token = getAuthToken();
      
      const response = await axios.get(
        `${config.API_BASE_URL}/submissions/learner/${learnerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài làm:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết bài làm theo ID
   * @param {number} submissionId - ID của bài làm
   * @returns {Promise<Object>} - Chi tiết bài làm
   */
  static async getSubmissionById(submissionId) {
    try {
      const token = getAuthToken();
      
      const response = await axios.get(
        `${config.API_BASE_URL}/submissions/${submissionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài làm:', error);
      throw error;
    }
  }
}

export default SubmissionService; 