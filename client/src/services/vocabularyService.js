import axios from "axios";
import config from './config';

const VocabularyService = {
    getVocabularyCountByTopicId: async (topicId) => {
        try {
          const response = await axios.get(`${config.API_BASE_URL}/vocabulary-topic/${topicId}/count`);
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