import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const staffService = {
  getAllStaffs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/staff`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch staffs');
      }
    } catch (error) {
      console.error('Error fetching staffs:', error);
      throw error;
    }
  },

  getStaffById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/staff/${id}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to fetch staff with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching staff with ID ${id}:`, error);
      throw error;
    }
  },

  addStaff: async (staffData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/staff`, staffData);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add staff');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      throw error;
    }
  },

  updateStaff: async (id, staffData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/staff/${id}`, staffData);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || `Failed to update staff with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error updating staff with ID ${id}:`, error);
      throw error;
    }
  },

  // Block staff (set status to 'BANNED')
  blockStaff: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/staff/block/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to block staff with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error blocking staff with ID ${id}:`, error);
      throw error;
    }
  },

  // Unblock staff (set status to 'ACTIVE')
  unblockStaff: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/staff/unblock/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to unblock staff with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error unblocking staff with ID ${id}:`, error);
      throw error;
    }
  }, 

  deleteStaff: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/staff/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to delete staff with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting staff with ID ${id}:`, error);
      throw error;
    }
  },

  deleteMultipleStaffs: async (ids) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/staff/delete-multiple`, { ids });
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to delete multiple staffs`);
      }
    } catch (error) {
      console.error(`Error deleting multiple staffs:`, error);
      throw error;
    }
  }, 

  resetStaffPassword: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/staff/resetpassword/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to reset staff password with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error resetting staff password with ID ${id}:`, error);
      throw error;
    }
  }
};

export default staffService;
