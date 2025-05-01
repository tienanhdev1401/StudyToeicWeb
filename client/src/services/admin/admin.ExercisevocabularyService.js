import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const ExercisevocabularyService = {
    getAllVocabularyTopicsExerciseVocabulary: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/exercisesss/vocabularies`);
          
          if (response.data.success) {
            return response.data.data; // Returns the array of vocabulary topics
          } else {
            throw new Error(response.data.message || 'Failed to fetch vocabulary topics');
          }
        } catch (error) {
          console.error('Error fetching vocabulary topics:', error);
          throw error; // Re-throw the error for the component to handle
        }
    },

    getVocabularyTopicByIdExerciseVocabulary: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/exercisesss/vocabularies/${id}`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch vocabulary topic');
        }
      } catch (error) {
        console.error('Error fetching vocabulary topic by ID:', error);
        throw error;
      }
    },  

    getExercisesByVocabularyTopicIdExerciseVocabulary: async (vocabularyTopicId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/exercisesss/vocabularies/${vocabularyTopicId}/exercises`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch exercises for vocabulary topic');
        }
      } catch (error) {
        console.error('Error fetching exercises for vocabulary topic:', error);
        throw error;
      }
    },

    getAllExercisesExerciseVocabulary: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/exercisesss/vocabularies`);
        
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

    getExercisesNotInVocabularyTopicExerciseVocabulary: async (vocabularyTopicId) => {
        try {
            console.log(`Fetching available exercises for vocabulary topic ID ${vocabularyTopicId}...`);
            const url = `${API_BASE_URL}/admin/exercisesss/vocabularies/${vocabularyTopicId}/available-exercises`;
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
    
    addExerciseToVocabularyTopicExerciseVocabulary: async (vocabularyTopicId, exerciseId) => {
        try {
            console.log(`Adding exercise ${exerciseId} to vocabulary topic ${vocabularyTopicId}...`);
            const url = `${API_BASE_URL}/admin/exercisesss/vocabularies/${vocabularyTopicId}/exercises`;
            console.log('API URL:', url);
            console.log('Request body:', { exerciseId });
            
            const response = await axios.post(url, { exerciseId });
            console.log('API Response:', response);
            
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to add exercise to vocabulary topic');
            }
        } catch (error) {
            console.error('Error adding exercise to vocabulary topic:', error);
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
    
    removeExerciseFromVocabularyTopicExerciseVocabulary: async (vocabularyTopicId, exerciseId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/admin/exercisesss/vocabularies/${vocabularyTopicId}/exercises/${exerciseId}`);
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to remove exercise from vocabulary topic');
            }
        } catch (error) {
            console.error('Error deleting vocabulary topic:', error);
            throw error;
        }
    }
}

export default ExercisevocabularyService;