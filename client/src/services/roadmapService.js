import axios from 'axios';

const ROADMAP_API_URL = 'http://localhost:5000/api/roadmap';

// Service để lấy roadmap theo learnerId
export const getRoadmapByLearnerId = async (learnerId) => {
  try {
    // Thêm token xác thực vào headers nếu có
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.get(`${ROADMAP_API_URL}/learner/${learnerId}`, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, data: null, message: 'Roadmap not found' };
    }
    console.error('Error fetching roadmap:', error);
    throw error;
  }
};

// Service để tạo/cập nhật roadmap dựa trên learning goal
export const generateRoadmap = async (learnerId) => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.post(`${ROADMAP_API_URL}/generate/${learnerId}`, {}, config);
    return response.data;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw error;
  }
};

// Service để cập nhật roadmap thủ công
export const updateRoadmap = async (id, roadmapData) => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.put(`${ROADMAP_API_URL}/${id}`, roadmapData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating roadmap:', error);
    throw error;
  }
};

// Service để xóa roadmap
export const deleteRoadmap = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const config = token 
      ? { headers: { Authorization: `Bearer ${token}` } } 
      : {};
    
    const response = await axios.delete(`${ROADMAP_API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    throw error;
  }
}; 