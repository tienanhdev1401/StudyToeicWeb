import axios from "axios";
import config from './config';

const API_BASE_URL = config.API_BASE_URL;
const UPLOAD_URL = config.UPLOAD_URL;

const testService = {
    getAllTests: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/test`);
          
          if (response.data.success) {
            console.log(response.data.data)
            return response.data.data; 
          
          } else {
            throw new Error(response.data.message || 'Failed to fetch test');
          }
        } catch (error) {
          console.error('Error fetching tests:', error);
          throw error; 
        }
      },

    getTestById: async (id) => {
      try {
        console.log(`Fetching test with ID: ${id}`);
        const response = await axios.get(`${API_BASE_URL}/admin/test/${id}`);
        
        if (response.data && response.data.success !== false) {
          // If the response has a 'data' property (the standard format from our API), return that
          if (response.data.data) {
            console.log(`Successfully retrieved test data for ID ${id}`);
            return response.data;
          }
          // Otherwise, return the full response data
          console.log(`Retrieved test data for ID ${id} (alternate format)`);
          return response.data;
        } else {
          console.error(`API error when fetching test ${id}:`, response.data);
          throw new Error(response.data?.message || 'Failed to fetch test');
        }
      } catch (error) {
        console.error(`Error fetching test ${id}:`, error);
        throw error;
      }
    },  

    createTest: async (testData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/test`, testData);
        console.log(response);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to create test');
        }
      } catch (error) {
        console.error('Error creating test:', error);
        throw error;
      }
    },

    updateTest: async (id, testData) => {
      try {
        const response = await axios.put(`${API_BASE_URL}/admin/test/${id}`, testData);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to update test');
        }
      } catch (error) {
        console.error(`Error updating test ${id}:`, error);
        throw error;
      }
    },

    deleteTest: async (id) => {
      try {
        console.log(id);
        const response = await axios.delete(`${API_BASE_URL}/admin/test/${id}`);
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to delete test');
        }
      } catch (error) {
        console.error(`Error deleting test ${id}:`, error);
        throw error;
      }
    },

    deleteMultipleTests: async (ids) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/test/delete-multiple`, { ids });
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || 'Failed to delete tests');
        }
      } catch (error) {
        console.error('Error deleting multiple tests:', error);
        throw error;
      }
    },

    getTestCollections: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/test/collections/all`);
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch test collections');
        }
      } catch (error) {
        console.error('Error fetching test collections:', error);
        throw error;
      }
    },
    
    // uploadExcelFile: async (testId, fileType, file) => {
    //   try {
    //     const formData = new FormData();
    //     formData.append('file', file);
    //     formData.append('fileType', fileType);
        
    //     const config = {
    //       headers: {
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     };
        
    //     const response = await axios.post(
    //       `${API_BASE_URL}/admin/test/${testId}/upload-excel`, 
    //       formData,
    //       config
    //     );
        
    //     if (response.data.success) {
    //       return response.data.data;
    //     } else {
    //       throw new Error(response.data.message || `Failed to upload ${fileType} file`);
    //     }
    //   } catch (error) {
    //     console.error(`Error uploading ${fileType} file:`, error);
    //     throw error;
    //   }
    // }

    getQuestionsByPart: async (parts, partNumber) => {
      const part = parts.find(p => p.partNumber === partNumber);
      return part ? part.questions : [];
    },

    getTestParts: async (testId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/test/${testId}/parts`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    getQuestionsByPartId: async (testId, partId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/test/${testId}/parts/${partId}/questions`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching questions for part ${partId}:`, error);
        throw error;
      }
    },

    createPart: async (testId, partData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/test/${testId}/parts`, partData);
        return response.data;
      } catch (error) {
        console.error(`Error creating part for test ${testId}:`, error);
        throw error;
      }
    },

    updatePart: async (testId, partId, partData) => {
      try {
        const response = await axios.put(`${API_BASE_URL}/admin/test/${testId}/parts/${partId}`, partData);
        return response.data;
      } catch (error) {
        console.error(`Error updating part ${partId}:`, error);
        throw error;
      }
    },

    deletePart: async (testId, partId) => {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admin/test/${testId}/parts/${partId}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting part ${partId}:`, error);
        throw error;
      }
    },

    importAllQuestions: async (testId, questions) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/test/import-questions/${testId}`, { questions });
        return response.data;
      } catch (error) {
        console.error('Error importing all questions:', error);
        throw error;
      }
    },

    importAllQuestionsFile: async (testId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(
        `${API_BASE_URL}/admin/test/import-questions-file/${testId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    },
}

export default testService;