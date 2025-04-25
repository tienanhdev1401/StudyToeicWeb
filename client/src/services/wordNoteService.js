import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update if your backend URL is different

const WordNoteService = {
  // Lấy danh sách WordNote theo LearnerId
  getWordNotesByLearnerId: async (learnerId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wordnote/learner/${learnerId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Không thể lấy danh sách ghi chú cho người học ${learnerId}`);
      }
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách ghi chú cho người học ${learnerId}:`, error);
      throw error;
    }
  },

  // Lấy chi tiết một WordNote theo ID
  getWordNoteById: async (wordNoteId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wordnote/${wordNoteId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Không thể lấy thông tin ghi chú ${wordNoteId}`);
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin ghi chú ${wordNoteId}:`, error);
      throw error;
    }
  },

  // Tạo WordNote mới
  createWordNote: async (wordNoteData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wordnote`, wordNoteData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi tạo ghi chú');
      }
    } catch (error) {
      console.error('Lỗi khi tạo ghi chú:', error);
      throw error;
    }
  },

  // Cập nhật WordNote
  updateWordNote: async (wordNoteId, wordNoteData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/wordnote/${wordNoteId}`, wordNoteData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi cập nhật ghi chú');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật ghi chú:', error);
      throw error;
    }
  },

  // Xóa WordNote
  deleteWordNote: async (wordNoteId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/wordnote/${wordNoteId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi xóa ghi chú');
      }
    } catch (error) {
      console.error('Lỗi khi xóa ghi chú:', error);
      throw error;
    }
  },

  // Thêm từ vựng vào WordNote
  addVocabularyToWordNote: async (wordNoteId, vocabularyId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wordnote/${wordNoteId}/vocabularies`, {
        VocabularyId: vocabularyId
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi thêm từ vựng vào ghi chú');
      }
    } catch (error) {
      console.error('Lỗi khi thêm từ vựng vào ghi chú:', error);
      throw error;
    }
  },

  // Xóa từ vựng khỏi WordNote
  removeVocabularyFromWordNote: async (wordNoteId, vocabularyId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/wordnote/${wordNoteId}/vocabularies/${vocabularyId}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi xóa từ vựng khỏi ghi chú');
      }
    } catch (error) {
      console.error('Lỗi khi xóa từ vựng khỏi ghi chú:', error);
      throw error;
    }
  }
};

export default WordNoteService;
