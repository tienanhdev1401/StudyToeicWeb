import axios from "axios";
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

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

  createResource: async (resourceData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/resource`, resourceData);
      return response.data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  getAllQuestions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/question`);
      console.log("response.data: ", response.data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createQuestion: async (questionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/question`, questionData);
      console.log("response.data: ", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateQuestion: async (id, questionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/question/${id}`, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteQuestion: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/question/${id}`);
      console.log("response.data: ", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting question ${id}:`, error.response?.data || error);
      // Return error response so we can handle it in the component
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.error || error.response.data.message || 'Failed to delete question',
          error: error.response.data
        };
      }
      throw error;
    }
  },

  deleteQuestions: async (ids) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/question/delete-many`, { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  importQuestionsFromExcel: async (questions) => {
    try {
      console.log('Importing questions:', questions);
      const response = await axios.post(`${API_BASE_URL}/admin/question/import`, questions);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to import questions');
      }
    } catch (error) {
      console.error('Error in importQuestionsFromExcel:', error);
      throw error;
    }
  },

};

export default questionService;
