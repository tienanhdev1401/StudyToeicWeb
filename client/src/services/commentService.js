import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update if your backend URL is different

const CommentService = {

  // Lấy tất cả comments theo GrammarTopicId
  getCommentsByGrammarTopicId: async (grammarTopicId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/grammar-topic/${grammarTopicId}`);
      
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
      const response = await axios.get(`${API_BASE_URL}/comments/vocabulary-topic/${vocabularyTopicId}`);
      
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

  // Tạo một comment mới
//   createComment: async (commentData) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/comments`, commentData);
      
//       if (response.data.success) {
//         return response.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to create comment');
//       }
//     } catch (error) {
//       console.error('Error creating comment:', error);
//       throw error;
//     }
//   },

  // Cập nhật một comment
  updateComment: async (commentId, content) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/comments/${commentId}`, { content });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || `Failed to update comment with ID ${commentId}`);
      }
    } catch (error) {
      console.error(`Error updating comment with ID ${commentId}:`, error);
      throw error;
    }
  },

//   // Xóa một comment
//   deleteComment: async (commentId) => {
//     try {
//       const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
      
//       if (response.data.success) {
//         return response.data;
//       } else {
//         throw new Error(response.data.message || `Failed to delete comment with ID ${commentId}`);
//       }
//     } catch (error) {
//       console.error(`Error deleting comment with ID ${commentId}:`, error);
//       throw error;
//     }
//   },

//   // Lấy comments theo UserId và GrammarTopicId - Cho phép lấy comments của một user cụ thể
//   getCommentsByUserAndGrammarId: async (userId, grammarTopicId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/comments/user/${userId}/grammar/${grammarTopicId}`);
      
//       if (response.data.success) {
//         return response.data;
//       } else {
//         throw new Error(response.data.message || `Failed to fetch comments for user ${userId} and grammar topic ${grammarTopicId}`);
//       }
//     } catch (error) {
//       console.error(`Error fetching comments for user ${userId} and grammar topic ${grammarTopicId}:`, error);
//       throw error;
//     }
//   },

//   // Lấy comments theo UserId và VocabularyTopicId - Cho phép lấy comments của một user cụ thể
//   getCommentsByUserAndVocabularyId: async (userId, vocabularyTopicId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/comments/user/${userId}/vocabulary/${vocabularyTopicId}`);
      
//       if (response.data.success) {
//         return response.data;
//       } else {
//         throw new Error(response.data.message || `Failed to fetch comments for user ${userId} and vocabulary topic ${vocabularyTopicId}`);
//       }
//     } catch (error) {
//       console.error(`Error fetching comments for user ${userId} and vocabulary topic ${vocabularyTopicId}:`, error);
//       throw error;
//     }
//   },
};

export default CommentService;
