import axios from 'axios';

const LEARNING_GOAL_URL = 'http://localhost:5000/api';

// Tạo một instance axios riêng có cấu hình không ghi log lỗi HTTP vào console
const silentAxios = axios.create();
silentAxios.defaults.validateStatus = (status) => {
  return true; // Chấp nhận mọi status code là hợp lệ (không throw lỗi)
};

export const getLearningGoalByLearnerId = async (learnerId) => {
  try {
    // Sử dụng silentAxios để không hiển thị lỗi 404 trong console
    const response = await silentAxios.get(`${LEARNING_GOAL_URL}/learning-goal/learner/${learnerId}`);
    
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
    console.log(learningGoalData);
    const response = await axios.post(`${LEARNING_GOAL_URL}/learning-goal`, learningGoalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLearningGoal = async (id, learningGoalData) => {
  try {
    const response = await axios.put(`${LEARNING_GOAL_URL}/learning-goal/${id}`, learningGoalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};