import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update if your backend URL is different

const ExerciseService = {

  getAllExercises: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/exercise`);
      
      if (response.data.success) {
        return response.data; // Returns the array of exercises
      } else {
        throw new Error(response.data.message || 'Failed to fetch exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },


  getExerciseById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/exercise/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch exercise with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching exercise with ID ${id}:`, error);
      throw error;
    }
  },


  getExercisesForGrammarTopic: async (grammarTopicId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grammar-topic/${grammarTopicId}/exercise`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch exercises for grammar topic ${grammarTopicId}`);
      }
    } catch (error) {
      console.error(`Error fetching exercises for grammar topic ${grammarTopicId}:`, error);
      throw error;
    }
  },
};

export default ExerciseService;