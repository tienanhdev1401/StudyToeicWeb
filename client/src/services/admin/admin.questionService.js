import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const questionService = {
  getQuestionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/question/${id}`);
      if (response.data && response.data.success !== false) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch question');
      }
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error);
      throw error;
    }
  },

  getQuestionsByPartId: async (partId) => {
    try {
      console.log(`Fetching questions for part ID: ${partId}`);
      const response = await axios.get(`${API_BASE_URL}/admin/question/part/${partId}`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Retrieved ${response.data.length} questions for part ${partId}`);
        return response.data;
      } else if (response.data && response.data.success !== false) {
        console.log(`Retrieved data for part ${partId}:`, response.data);
        return response.data;
      } else {
        console.error(`Invalid response format for part ${partId}:`, response.data);
        throw new Error(response.data?.message || 'Failed to fetch questions for part');
      }
    } catch (error) {
      console.error(`Error fetching questions for part ${partId}:`, error);
      throw error;
    }
  },


  createQuestionByPartId: async (testId, partId, questionData) => {
    try {
      console.log(partId, questionData);
      const response = await axios.post(`${API_BASE_URL}/admin/question/parts/${partId}`, questionData);
      return response.data;
    } catch (error) {
      console.error(`Error creating question for part ${partId}:`, error);
      throw error;
    }
  },

  updateQuestionByPartId: async (partId, questionId, questionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/question/parts/${partId}/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating question ${questionId}:`, error);
      throw error;
    }
  },

  deleteQuestionByPartId: async (partId, questionId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/question/parts/${partId}/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting question ${questionId}:`, error);
      throw error;
    }
  },
};

export default questionService;
