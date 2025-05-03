import axios from 'axios';
import config from './config';

class TestService {
  /**
   * Lấy thông tin bài kiểm tra từ backend theo ID
   * @param {number} testId - ID của bài kiểm tra cần lấy
   * @returns {Promise<object>} - Dữ liệu bài kiểm tra
   */
  static async getTestById(testId) {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/test/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu bài kiểm tra:', error);
      throw error;
    }
  }

  /**
   * Chuyển đổi dữ liệu bài kiểm tra thô thành định dạng dễ sử dụng hơn
   * @param {object} rawTestData - Dữ liệu bài kiểm tra thô từ API
   * @returns {object} - Dữ liệu đã được xử lý
   */
  static processTestData(rawTestData) {
    if (!rawTestData) return null;

    // Xử lý và cấu trúc lại dữ liệu bài kiểm tra
    const { id, title, duration, updatedAt, parts } = rawTestData;

    // Tạo danh sách tất cả các câu hỏi từ tất cả các phần
    const allQuestions = [];
    const processedParts = parts.map(part => {
      const processedQuestions = part.questions.map(q => {
        const question = {
          id: q.QuestionId,
          questionNumber: q.questionNumber,
          partId: part.id,
          partNumber: part.partNumber,
          content: q.question.content,
          options: {
            A: q.question.optionA,
            B: q.question.optionB,
            C: q.question.optionC,
            D: q.question.optionD
          },
          correctAnswer: q.question.correctAnswer,
          explainDetail: q.question.explainDetail,
          resource: q.question.resource
        };
        
        allQuestions.push(question);
        return question;
      });

      return {
        id: part.id,
        partNumber: part.partNumber,
        questions: processedQuestions
      };
    });

    return {
      id,
      title,
      duration,
      updatedAt,
      parts: processedParts,
      allQuestions: allQuestions.sort((a, b) => a.questionNumber - b.questionNumber)
    };
  }

  /**
   * Lấy các câu hỏi theo phần
   * @param {Array} parts - Mảng các phần của bài kiểm tra
   * @param {number} partNumber - Số thứ tự của phần cần lấy
   * @returns {Array} - Danh sách câu hỏi của phần
   */
  static getQuestionsByPart(parts, partNumber) {
    const part = parts.find(p => p.partNumber === partNumber);
    return part ? part.questions : [];
  }

  /**
   * Nhóm các câu hỏi theo tài nguyên (resource)
   * @param {Array} questions - Danh sách câu hỏi cần nhóm
   * @returns {Object} - Câu hỏi được nhóm theo resourceId
   */
  static groupQuestionsByResource(questions) {
    const groupedQuestions = {};
    
    questions.forEach(question => {
      if (!question.resource) return;
      
      const resourceId = question.resource.id;
      if (!groupedQuestions[resourceId]) {
        groupedQuestions[resourceId] = {
          resource: question.resource,
          questions: []
        };
      }
      
      groupedQuestions[resourceId].questions.push(question);
    });
    
    return groupedQuestions;
  }
  static async getAllTests() {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/test/`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu bài kiểm tra:', error);
      throw error;
    }
  }
}

export default TestService;