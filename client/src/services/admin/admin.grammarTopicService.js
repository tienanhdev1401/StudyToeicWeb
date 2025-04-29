import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const grammarTopicService = {
    getAllGrammarTopics: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/grammar/`);
          
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
        const response = await axios.get(`${API_BASE_URL}/admin/grammar/${id}`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch grammar topic');
        }
      } catch (error) {
        console.error('Error fetching grammar topic by ID:', error);
        throw error;
      }
    },  

    addGrammarTopic: async (topicData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/grammar/`, topicData);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to add grammar topic');
        }
      } catch (error) {
        console.error('Error adding grammar topic:', error);
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || 'Failed to add grammar topic');
        }
        throw error;
      }
    },

    updateGrammarTopic: async (topicId, topicData) => {
      try { 
        const response = await axios.put(`${API_BASE_URL}/admin/grammar/${topicId}`, topicData);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to update grammar topic');
        }
      } catch (error) {
        console.error('Error updating grammar topic:', error);
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || 'Failed to update grammar topic');
        }
        throw error;
      }
    },    

    deleteGrammarTopic: async (topicId) => {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admin/grammar/${topicId}`);
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to delete grammar topic');
        }
      } catch (error) {
        console.error('Error deleting grammar topic:', error); 
        throw error;
      }
    },

    getExercisesByGrammarTopicId: async (grammarTopicId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/grammar/${grammarTopicId}/exercises`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch exercises for grammar topic');
        }
      } catch (error) {
        console.error('Error fetching exercises for grammar topic:', error);
        throw error;
      }
    },
}

export default grammarTopicService;