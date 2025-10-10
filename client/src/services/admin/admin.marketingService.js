import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

export const marketingService = {
  // Advertisements
  createAdvertisement: async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/admin/advertisements`, payload);
    return res.data;
  },
  listAdvertisements: async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/advertisements`);
    return res.data;
  },
  updateAdvertisement: async (id, payload) => {
    const res = await axios.put(`${API_BASE_URL}/admin/advertisements/${id}`, payload);
    return res.data;
  },
  deleteAdvertisement: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/admin/advertisements/${id}`);
    return res.data;
  },

  // Campaigns
  createCampaign: async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/admin/ad-campaigns`, payload);
    return res.data;
  },
  listCampaigns: async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/ad-campaigns`);
    return res.data;
  },
  cancelCampaign: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/admin/ad-campaigns/${id}`);
    return res.data;
  },
  updateCampaign: async (id, payload) => {
    const res = await axios.put(`${API_BASE_URL}/admin/ad-campaigns/${id}`, payload);
    return res.data;
  },
  pauseCampaign: async (id) => {
    const res = await axios.post(`${API_BASE_URL}/admin/ad-campaigns/${id}/pause`);
    return res.data;
  },
  resumeCampaign: async (id) => {
    const res = await axios.post(`${API_BASE_URL}/admin/ad-campaigns/${id}/resume`);
    return res.data;
  },

};


