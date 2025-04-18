import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const vocabularyservice = {
    getAllVocabularyByTopicId: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/vocabulary-topic/${topicId}/vocabularies`);
          
          if (response.data.success) {
            console.log(response.data.data)
            return response.data.data; // Returns the array of grammar topics
          
          } else {
            throw new Error(response.data.message || 'Failed to fetch vocabularies ');
          }
        } catch (error) {
          console.error('Error fetching vocabularies:', error);
          throw error; // Re-throw the error for the component to handle
        }
      },

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

export default vocabularyservice;