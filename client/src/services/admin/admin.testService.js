import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';
const UPLOAD_URL = 'http://localhost:5000/api/upload';

const testService = {
    getAllTests: async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/test`);
          
          if (response.data.success) {
            console.log(response.data.data)
            return response.data.data; // Returns the array of grammar topics
          
          } else {
            throw new Error(response.data.message || 'Failed to fetch test');
          }
        } catch (error) {
          console.error('Error fetching vocabulary topics:', error);
          throw error; // Re-throw the error for the component to handle
        }
      },

    getTestById: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/test/${id}`);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching vocabulary topic by ID:', error);
        throw error;
      }
    },  

    

}

export default testService;