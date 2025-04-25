import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update if your backend URL is different

const CommentService = {

  // Lấy tất cả comments theo GrammarTopicId
  getCommentsByGrammarTopicId: async (grammarTopicId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comment/grammar-topic/${grammarTopicId}`);
      
      if (response.data.success) {
        return response.data; // Trả về response.data chứa success, data và message
      } else {
        throw new Error(response.data.message || `Failed to fetch comments for grammar topic ${grammarTopicId}`);
      }
    } catch (error) {
      console.error(`Error fetching comments for grammar topic ${grammarTopicId}:`, error);
      throw error;
    }
  },

  // Lấy tất cả comments theo VocabularyTopicId
  getCommentsByVocabularyTopicId: async (vocabularyTopicId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comment/vocabulary-topic/${vocabularyTopicId}`);
      
      if (response.data.success) {
        return response.data; // Trả về response.data chứa success, data và message
      } else {
        throw new Error(response.data.message || `Failed to fetch comments for vocabulary topic ${vocabularyTopicId}`);
      }
    } catch (error) {
      console.error(`Error fetching comments for vocabulary topic ${vocabularyTopicId}:`, error);
      throw error;
    }
  },

  // Tạo comment mới
  createComment: async (commentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/comment`, commentData);
      console.log(commentData);
      
      if (response.data.success) {
        return response.data; // Trả về response.data chứa success, data và message
      } else {
        throw new Error(response.data.message || 'Lỗi khi tạo bình luận');
      }
    } catch (error) {
      console.error('Lỗi khi tạo bình luận:', error);
      throw error;
    }
  },

  // Cập nhật comment
  updateComment: async (comment) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/comment/${comment.id}`, comment);
      
      if (response.data.success) {
        return response.data; // Trả về response.data chứa success, data và message
      } else {
        throw new Error(response.data.message || 'Lỗi khi cập nhật bình luận');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật bình luận:', error);
      throw error;
    }
  },

  // Xóa comment
  deleteComment: async (commentId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/comment/${commentId}`);
      
      if (response.data.success) {
        return response.data; // Trả về response.data chứa success và message
      } else {
        throw new Error(response.data.message || 'Lỗi khi xóa bình luận');
      }
    } catch (error) {
      console.error('Lỗi khi xóa bình luận:', error);
      throw error;
    }
  }
};

export default CommentService;
