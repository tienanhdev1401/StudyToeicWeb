import axios from 'axios';
import config from './config';

// Tạo một instance axios riêng có cấu hình không ghi log lỗi HTTP vào console
const silentAxios = axios.create();
silentAxios.defaults.validateStatus = (status) => {
  return true; // Chấp nhận mọi status code là hợp lệ (không throw lỗi)
};

export const getLearningGoalByLearnerId = async (learnerId) => {
  try {
    // Sử dụng silentAxios để không hiển thị lỗi 404 trong console
    const response = await silentAxios.get(`${config.API_BASE_URL}/learning-goal/learner/${learnerId}`);
    
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 404) {
      return { success: false, data: null };
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error) {
    console.error("Lỗi khi lấy mục tiêu học tập:", error);
    return { success: false, data: null };
  }
};

export const createLearningGoal = async (learningGoalData) => {
  try {
    const response = await axios.post(`${config.API_BASE_URL}/learning-goal`, learningGoalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLearningGoal = async (id, learningGoalData) => {
  try {
    const response = await axios.put(`${config.API_BASE_URL}/learning-goal/${id}`, learningGoalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};