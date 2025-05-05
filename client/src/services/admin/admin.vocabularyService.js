import axios from "axios";
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const vocabularyservice = {
    getAllVocabularyByTopicId: async (topicId) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/vocabulary-topic/${topicId}/vocabularies`);
          
          if (response.data.success) {
            console.log(response.data.data)
            return response.data.data; // Returns the array of vocabularies
          
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
          const response = await axios.get(`${API_BASE_URL}/admin/vocabulary-topic/${topicId}/count`);
          if (response.data.success) {
            return response.data.count;
          } else {
            throw new Error(response.data.message || 'Failed to fetch vocabulary count for topic');
          }
        } catch (error) {
          console.error('Error fetching vocabulary count for topic:', error);
          throw error;
        }
    },
    
    // Get vocabulary by ID
    getVocabularyById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/vocabulary/${id}`);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch vocabulary');
            }
        } catch (error) {
            console.error('Error fetching vocabulary:', error);
            throw error;
        }
    },
    
    // Add new vocabulary
    addVocabulary: async (vocabularyData) => {
        try {
            console.log("vocabularyData",vocabularyData);
            const response = await axios.post(`${API_BASE_URL}/admin/vocabulary/`, vocabularyData);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to add vocabulary');
            }
        } catch (error) {
            console.error('Error adding vocabulary:', error);
            throw error;
        }
    },
    
    // Update vocabulary
    updateVocabulary: async (id, vocabularyData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/admin/vocabulary/${id}`, vocabularyData);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update vocabulary');
            }
        } catch (error) {
            console.error('Error updating vocabulary:', error);
            throw error;
        }
    },
    
    // Delete vocabulary
    deleteVocabulary: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/admin/vocabulary/${id}`);
            if (response.data.success) {
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to delete vocabulary');
            }
        } catch (error) {
            console.error('Error deleting vocabulary:', error);
            throw error;
        }
    },
    
    // Import từ vựng từ file Excel
    importVocabulariesFromExcel: async (topicId, vocabularies) => {
        try {
            console.log(`Importing ${vocabularies.length} vocabularies to topic ${topicId}`);
            
            const response = await axios.post(`${API_BASE_URL}/admin/vocabulary/import/${topicId}`, { 
                vocabularies 
            });
            
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to import vocabularies from Excel');
            }
        } catch (error) {
            console.error('Error importing vocabularies from Excel:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }
};

export default vocabularyservice;