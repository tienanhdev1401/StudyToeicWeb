import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

const VocabularyTopicService = {
  /**
   * Get all vocabulary topics with their associated vocabularies
   */
  getAllVocabularyTopics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vocabulary-topic`);
      
      if (response.data.success) {
        return response.data.data; // Returns array of VocabularyTopic objects
      } else {
        throw new Error(response.data.message || 'Failed to fetch vocabulary topics');
      }
    } catch (error) {
      console.error('Error fetching vocabulary topics:', error);
      throw error;
    }
  },

  getVocabularyTopicById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vocabulary-topic/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch vocabulary topic with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching vocabulary topic with ID ${id}:`, error);
      throw error;
    }
  },

  
};

export default VocabularyTopicService;