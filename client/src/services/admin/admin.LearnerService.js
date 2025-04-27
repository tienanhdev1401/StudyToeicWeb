import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const learnerService = {
  getAllLearners: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/learner`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch learners');
      }
    } catch (error) {
      console.error('Error fetching learners:', error);
      throw error;
    }
  },

  getLearnerById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/learner/${id}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch learner with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching learner with ID ${id}:`, error);
      throw error;
    }
  },

  addLearner: async (learnerData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/learner`, learnerData);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add learner');
      }
    } catch (error) {
      console.error('Error adding learner:', error);
      throw error;
    }
  },

  updateLearner: async (id, learnerData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/learner/${id}`, learnerData);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to update learner with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error updating learner with ID ${id}:`, error);
      throw error;
    }
  },

  // Block learner (set status to 'BANNED')
  blockLearner: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/learner/block/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to block learner with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error blocking learner with ID ${id}:`, error);
      throw error;
    }
  },

  // Unblock learner (set status to 'ACTIVE')
  unblockLearner: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/learner/unblock/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to unblock learner with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error unblocking learner with ID ${id}:`, error);
      throw error;
    }
  }
};

export default learnerService;
