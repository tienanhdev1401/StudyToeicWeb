import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';
const UPLOAD_URL = 'http://localhost:5000/api/upload';

const vocabularyTopicService = {
    getAllVocabularyTopics: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/vocabulary-topic/`);
          
          if (response.data.success) {
            console.log(response.data.data)
            return response.data.data; // Returns the array of grammar topics
          
          } else {
            throw new Error(response.data.message || 'Failed to fetch vocabulary topics');
          }
        } catch (error) {
          console.error('Error fetching vocabulary topics:', error);
          throw error; // Re-throw the error for the component to handle
        }
      },

    getVocabularyTopicById: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/vocabulary-topic/${id}`);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching vocabulary topic by ID:', error);
        throw error;
      }
    },  

    getVocabularyTopicBySlug: async (slug) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/vocabulary-topic/${slug}`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch vocabulary topic by slug');
        }
      } catch (error) {
        console.error('Error fetching vocabulary topic by slug:', error);
        throw error;
      }
    },

    uploadImage: async (file, folder = 'vocabularyTopic') => {
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
    
    

    addVocabularyTopic: async (topicData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/vocabulary-topic/`, topicData);
        return response.data;
      } catch (error) {
        console.error('Error adding vocabulary topic:', error);
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || 'Failed to add vocabulary topic');
        }
        throw error;
      }
    },

    updateVocabularyTopic: async (topicId, topicData) => {
      try { 
        const response = await axios.put(`${API_BASE_URL}/admin/vocabulary-topic/${topicId}`, topicData);
        console.log(response.data)
        return response.data;
       
      } catch (error) {
        console.error('Error updating vocabulary topic:', error);
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || 'Failed to update vocabulary topic');
        }
        throw error;
      }
    },    

    deleteVocabularyTopic: async (topicId) => {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admin/vocabulary-topic/${topicId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting vocabulary topic:', error); 
        throw error;
      }
    },

}

export default vocabularyTopicService;