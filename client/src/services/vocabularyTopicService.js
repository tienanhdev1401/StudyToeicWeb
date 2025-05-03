import axios from 'axios';
import config from './config';

const VocabularyTopicService = {
  /**
   * Get all vocabulary topics with their associated vocabularies
   */
  getAllVocabularyTopics: async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/vocabulary-topic`);
      
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
      const response = await axios.get(`${config.API_BASE_URL}/vocabulary-topic/${id}`);
      
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

  getExercisesForVocabularyTopic: async (vocabularyTopicId) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/vocabulary-topic/${vocabularyTopicId}/exercise`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch exercises for vocabulary topic ${vocabularyTopicId}`);
      }
    } catch (error) {
      console.error(`Error fetching exercises for vocabulary topic ${vocabularyTopicId}:`, error);
      throw error;
    }
  },
};

export default VocabularyTopicService;