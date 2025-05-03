import axios from 'axios';
import config from './config';

const roadmapService = {
  getAllRoadmaps: async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/roadmap`);
      return response.data;
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      throw error;
    }
  },
  
  // Service để lấy roadmap theo learnerId
  getRoadmapByLearnerId: async (learnerId) => {
    try {
      // Thêm token xác thực vào headers nếu có
      const token = localStorage.getItem('token');
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } } 
        : {};
      
      const response = await axios.get(`${config.API_BASE_URL}/roadmap/learner/${learnerId}`, config);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: false, data: null, message: 'Roadmap not found' };
      }
      console.error('Error fetching roadmap:', error);
      throw error;
    }
  },

  // Service để tạo/cập nhật roadmap dựa trên learning goal
  generateRoadmap: async (learnerId) => {
    try {
      const token = localStorage.getItem('token');
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } } 
        : {};
      
      const response = await axios.post(`${config.API_BASE_URL}/roadmap/generate/${learnerId}`, {}, config);
      return response.data;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  },

  // Service để cập nhật roadmap thủ công
  updateRoadmap: async (id, roadmapData) => {
    try {
      const token = localStorage.getItem('token');
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } } 
        : {};
      
      const response = await axios.put(`${config.API_BASE_URL}/roadmap/${id}`, roadmapData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating roadmap:', error);
      throw error;
    }
  },

  // Service để xóa roadmap
  deleteRoadmap: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } } 
        : {};
      
      const response = await axios.delete(`${config.API_BASE_URL}/roadmap/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      throw error;
    }
  }
};

export default roadmapService; 