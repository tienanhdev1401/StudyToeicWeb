import axios from "axios";
import config from './config';

const API_BASE_URL = config.API_BASE_URL;
const UPLOAD_URL = config.UPLOAD_URL;

const lessonService = {
    getAllLesson: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/lessons`);
          
          if (response.data.success) {
            console.log(response.data.data)
            return response.data.data; 
          
          } else {
            throw new Error(response.data.message || 'Failed to fetch lesson');
          }
        } catch (error) {
          console.error('Error fetching lessons:', error);
          throw error; 
        }
      },

    getlessonById: async (id) => {
      try {
        console.log(`Fetching lesson with ID: ${id}`);
        const response = await axios.get(`${API_BASE_URL}/admin/lessons/${id}`);
        
        if (response.data && response.data.success !== false) {
          if (response.data.data) {
            console.log(`Successfully retrieved lesson data for ID ${id}`);
            return response.data;
          }
          // Otherwise, return the full response data
          console.log(`Retrieved lesson data for ID ${id} (alternate format)`);
          return response.data;
        } else {
          console.error(`API error when fetching lesson ${id}:`, response.data);
          throw new Error(response.data?.message || 'Failed to fetch lesson');
        }
      } catch (error) {
        console.error(`Error fetching lesson ${id}:`, error);
        throw error;
      }
    },  

    createlesson: async (lessonData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/lessons`, lessonData);
        console.log(response);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to create lesson');
        }
      } catch (error) {
        console.error('Error creating lesson:', error);
        throw error;
      }
    },

    updatelesson: async (id, lessonData) => {
      try {
        const response = await axios.put(`${API_BASE_URL}/admin/lessons/${id}`, lessonData);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to update lesson');
        }
      } catch (error) {
        console.error(`Error updating lesson ${id}:`, error);
        throw error;
      }
    },

    deletelesson: async (id) => {
      try {
        console.log(id);
        const response = await axios.delete(`${API_BASE_URL}/admin/lessons/${id}`);
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to delete lesson');
        }
      } catch (error) {
        console.error(`Error deleting lesson ${id}:`, error);
        throw error;
      }
    },

    deleteMultiplelessons: async (ids) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/lesson/delete-multiple`, { ids });
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to delete lessons');
        }
      } catch (error) {
        console.error('Error deleting multiple lessons:', error);
        throw error;
      }
    },

    getlessonCollections: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/lesson/collections/all`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch lesson collections');
        }
      } catch (error) {
        console.error('Error fetching lesson collections:', error);
        throw error;
      }
    },

    uploadThumbnail: async (file, folder = 'lessons') => {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        const response = await axios.post(`${UPLOAD_URL}/image?folder=${folder}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response.data)
        if (response.data && response.data.url) {
          return response.data.url;
        }
        throw new Error('Upload failed: No URL returned');
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    
}

export default lessonService;