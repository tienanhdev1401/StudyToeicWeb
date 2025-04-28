import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const ExercisesQuestionService = {
    getAllQuestionsByExerciseId: async (exerciseId) => {
       
      try {
          const response = await axios.get(`${API_BASE_URL}/admin/exercises/${exerciseId}/questions`);
          
          if (response.data.success) {
            console.log(response.data.data)

            return response.data.data; // Returns the array of questions in the exercise
          } else {
            throw new Error(response.data.message || 'Failed to fetch questions');
          }
        } catch (error) {
          console.error('Error fetching questions:', error);
          throw error; // Re-throw the error for the component to handle
        }
    },

    getAllQuestions: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/exercises/questions/all`);
          if (response.data.success) {
            return response.data.data;
          } else {
            throw new Error(response.data.message || 'Failed to fetch all questions');
          }
        } catch (error) {
          console.error('Error fetching all questions:', error);
          throw error;
        }
    },
    
    getQuestionsNotInExercise: async (exerciseId) => {
        try {
            console.log(`Fetching available questions for exercise ID ${exerciseId}...`);
            const url = `${API_BASE_URL}/admin/exercises/${exerciseId}/available-questions`;
            console.log('API URL:', url);
            
            const response = await axios.get(url);
            console.log('API Response:', response);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch available questions');
            }
        } catch (error) {
            console.error('Error fetching available questions:', error);
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
    
    addQuestionToExercise: async (exerciseId, questionId) => {
        try {
            console.log(`Adding question ${questionId} to exercise ${exerciseId}...`);
            const url = `${API_BASE_URL}/admin/exercises/${exerciseId}/questions`;
            console.log('API URL:', url);
            console.log('Request body:', { questionId });
            
            const response = await axios.post(url, { questionId });
            console.log('API Response:', response);
            
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to add question to exercise');
            }
        } catch (error) {
            console.error('Error adding question to exercise:', error);
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
    
    removeQuestionFromExercise: async (exerciseId, questionId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/admin/exercises/${exerciseId}/questions/${questionId}`);
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to remove question from exercise');
            }
        } catch (error) {
            console.error('Error removing question from exercise:', error);
            throw error;
        }
    }
};

export default ExercisesQuestionService;