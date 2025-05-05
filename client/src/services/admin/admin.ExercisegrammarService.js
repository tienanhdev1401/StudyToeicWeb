import axios from "axios";
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const ExercisegrammarService = {
    getAllGrammarTopicsExercise: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/exercisess/grammars`);
          
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

    getGrammarTopicByIdExercise: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/exercisess/grammars/${id}`);
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

    getExercisesByGrammarTopicIdExercise: async (grammarTopicId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/exercisess/grammars/${grammarTopicId}/exercises`);
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

    getAllExercisesExercise: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/exercisess/grammars`);
        
        if (response.data.success) {
          return response.data.data.map(item => ({
            id: item.exercise.id,
            title: item.exercise.exerciseName
          })); 
        } else {
          throw new Error(response.data.message || 'Failed to fetch exercises');
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        throw error; // Re-throw the error for the component to handle
      }
    },

    getExercisesNotInGrammarTopicExercise: async (grammarTopicId) => {
        try {
            console.log(`Fetching available exercises for grammar topic ID ${grammarTopicId}...`);
            const url = `${API_BASE_URL}/admin/exercisess/grammars/${grammarTopicId}/available-exercises`;
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
            throw error;
        }
    },
    
    addExerciseToGrammarTopicExercise: async (grammarTopicId, exerciseId) => {
        try {
            console.log(`Adding exercise ${exerciseId} to grammar topic ${grammarTopicId}...`);
            const url = `${API_BASE_URL}/admin/exercisess/grammars/${grammarTopicId}/exercises`;
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
    
    removeExerciseFromGrammarTopicExercise: async (grammarTopicId, exerciseId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/admin/exercisess/grammars/${grammarTopicId}/exercises/${exerciseId}`);
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
}

export default ExercisegrammarService;