import axios from "axios";
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const ExercisesService = {
    getAllExercises: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/exercise/`);
          
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

    getExerciseById: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/exercise/${id}`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch exercise');
        }
      } catch (error) {
        console.error('Error fetching exercise by ID:', error);
        throw error;
      }
    },  

    addExercise: async (exerciseData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/exercise/`, exerciseData);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to add exercise');
        }
      } catch (error) {
        console.error('Error adding exercise:', error);
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || 'Failed to add exercise');
        }
        throw error;
      }
    },

    updateExercise: async (exerciseId, exerciseData) => {
      try { 
        const response = await axios.put(`${API_BASE_URL}/admin/exercise/${exerciseId}`, exerciseData);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to update exercise');
        }
      } catch (error) {
        console.error('Error updating exercise:', error);
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || 'Failed to update exercise');
        }
        throw error;
      }
    },    

    deleteExercise: async (exerciseId) => {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admin/exercise/${exerciseId}`);
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to delete exercise');
        }
      } catch (error) {
        console.error('Error deleting exercise:', error); 
        throw error;
      }
    },
}

export default ExercisesService;