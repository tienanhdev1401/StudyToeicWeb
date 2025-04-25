import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const VocabularyService = {
    getVocabularyCountByTopicId: async (topicId) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/vocabulary-topic/${topicId}/count`);
          if (response.data.success) {
            return response.data.count;
          } else {
            throw new Error(response.data.message || 'Failed to fetch vocabulary count for topic');
          }
        } catch (error) {
          console.error('Error fetching vocabulary count for topic:', error);
          throw error;
        }
    }
    
    
};

export default VocabularyService;