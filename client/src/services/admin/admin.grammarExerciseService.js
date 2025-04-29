import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const grammarExerciseService = {
    getAllExercises: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/grammars/exercises/all`);
          
          if (response.data.success) {
            return response.data.data; // Returns the array of exercises
          } else {
            throw new Error(response.data.message || 'Failed to fetch exercises');
          }
        } catch (error) {
          console.error('Error fetching exercises:', error);
          throw error; // Re-throw the error for the component to handle
        }
    },

    getExercisesByGrammarTopicId: async (grammarTopicId) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/grammars/${grammarTopicId}/exercises`);
          
          if (response.data.success) {
            return response.data.data; // Returns the array of exercises for the grammar topic
          } else {
            throw new Error(response.data.message || 'Failed to fetch exercises for grammar topic');
          }
        } catch (error) {
          console.error('Error fetching exercises for grammar topic:', error);
          throw error;
        }
    },
    
    getExercisesNotInGrammarTopic: async (grammarTopicId) => {
        try {
            console.log(`Fetching available exercises for grammar topic ID ${grammarTopicId}...`);
            const url = `${API_BASE_URL}/admin/grammars/${grammarTopicId}/available-exercises`;
            console.log('API URL:', url);
            
            const response = await axios.get(url);
            console.log('API Response:', response);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch available exercises');
            }
        } catch (error) {
            console.error('Error fetching available exercises:', error);
            // Enhanced error logging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
            }
            throw error;
        }
    },
    
    addExerciseToGrammarTopic: async (grammarTopicId, exerciseId) => {
        try {
            console.log(`Adding exercise ${exerciseId} to grammar topic ${grammarTopicId}...`);
            const url = `${API_BASE_URL}/admin/grammars/${grammarTopicId}/exercises`;
            console.log('API URL:', url);
            console.log('Request body:', { exerciseId });
            
            const response = await axios.post(url, { exerciseId });
            console.log('API Response:', response);
            
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to add exercise to grammar topic');
            }
        } catch (error) {
            console.error('Error adding exercise to grammar topic:', error);
            // Enhanced error logging
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            throw error;
        }
    },
    
    removeExerciseFromGrammarTopic: async (grammarTopicId, exerciseId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/admin/grammars/${grammarTopicId}/exercises/${exerciseId}`);
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to remove exercise from grammar topic');
            }
        } catch (error) {
            console.error('Error removing exercise from grammar topic:', error);
            throw error;
        }
    }
};

export default grammarExerciseService;