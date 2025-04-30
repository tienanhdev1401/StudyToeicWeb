import axios from 'axios';

const ROADMAP_CONFIG_API_URL = 'http://localhost:5000/api/admin/roadmap-config';

// Service lấy toàn bộ cấu hình roadmap
export const getRoadmapConfig = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.get(`${ROADMAP_CONFIG_API_URL}`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching roadmap config:', error);
    throw error;
  }
};

// Service cập nhật ngưỡng level
export const updateLevelThresholds = async (levelThresholds) => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.put(`${ROADMAP_CONFIG_API_URL}/level-thresholds`, { levelThresholds }, config);
    return response.data;
  } catch (error) {
    console.error('Error updating level thresholds:', error);
    throw error;
  }
};

// Service cập nhật phương pháp học
export const updateLearningMethods = async (level, methods) => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.put(`${ROADMAP_CONFIG_API_URL}/learning-methods`, { level, methods }, config);
    return response.data;
  } catch (error) {
    console.error('Error updating learning methods:', error);
    throw error;
  }
};

// Service cập nhật nội dung giai đoạn
export const updatePhaseContent = async (phase, level, content) => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.put(`${ROADMAP_CONFIG_API_URL}/phase-content`, { phase, level, content }, config);
    return response.data;
  } catch (error) {
    console.error('Error updating phase content:', error);
    throw error;
  }
};

// Service cập nhật tài nguyên học tập
export const updateResources = async (level, resources) => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.put(`${ROADMAP_CONFIG_API_URL}/resources`, { level, resources }, config);
    return response.data;
  } catch (error) {
    console.error('Error updating resources:', error);
    throw error;
  }
};

// Service khôi phục cấu hình mặc định
export const resetConfig = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.post(`${ROADMAP_CONFIG_API_URL}/reset`, {}, config);
    return response.data;
  } catch (error) {
    console.error('Error resetting config:', error);
    throw error;
  }
}; 