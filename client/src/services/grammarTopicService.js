import axios from 'axios';
import config from './config';

const API_BASE_URL = config.API_BASE_URL; // Update if your backend URL is different

const GrammarTopicService = {

  getAllGrammarTopics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grammar-topic/`);
      
      if (response.data.success) {
        return response.data.data; // Returns the array of grammar topics
      } else {
        throw new Error(response.data.message || 'Failed to fetch grammar topics');
      }
    } catch (error) {
      console.error('Error fetching grammar topics:', error);
      throw error; // Re-throw the error for the component to handle
    }
  },


  getGrammarTopicById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grammar-topic/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch grammar topic with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching grammar topic with ID ${id}:`, error);
      throw error;
    }
  },


  getExercisesForGrammarTopic: async (grammarTopicId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grammar-topic/${grammarTopicId}/exercise`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch exercises for grammar topic ${grammarTopicId}`);
      }
    } catch (error) {
      console.error(`Error fetching exercises for grammar topic ${grammarTopicId}:`, error);
      throw error;
    }
  },



};

export default GrammarTopicService;