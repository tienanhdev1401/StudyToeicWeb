import SubmissionService from './SubmissionService';
import TestService from './TestService';

class TestHistoryService {
  /**
   * Lấy lịch sử làm bài của học viên và gom nhóm theo bài test
   * @param {number} learnerId - ID của học viên
   * @returns {Promise<Array>} - Danh sách lịch sử làm bài đã được gom nhóm
   */
  static async getGroupedTestHistory(learnerId) {
    try {
      // Lấy tất cả bài làm của học viên
      const submissions = await SubmissionService.getSubmissionsByLearnerId(learnerId);
      
      // Gom nhóm theo TestId
      const groupedByTest = {};
      
      for (const submission of submissions) {
        if (!groupedByTest[submission.TestId]) {
          groupedByTest[submission.TestId] = {
            testId: submission.TestId,
            testTitle: submission.tittle,
            attempts: []
          };
        }
        
        // Thêm thông tin về lần thử
        groupedByTest[submission.TestId].attempts.push({
          id: submission.id,
          score: submission.totalscore,
          listeningScore: submission.listeningScore,
          readingScore: submission.readingScore,
          completionTime: submission.completionTime,
          date: new Date(submission.createdAt),
          userAnswer: submission.userAnswer
        });
      }
      
      // Sắp xếp các lần thử theo thời gian giảm dần (mới nhất lên đầu)
      Object.values(groupedByTest).forEach(group => {
        group.attempts.sort((a, b) => b.date - a.date);
        
        // Thêm thông tin về lần thử gần nhất và điểm cao nhất
        group.latestAttempt = group.attempts[0];
        group.highestScore = Math.max(...group.attempts.map(a => a.score));
      });
      
      // Chuyển đổi từ object sang array và sắp xếp theo lần thử mới nhất
      const result = Object.values(groupedByTest)
        .sort((a, b) => b.latestAttempt.date - a.latestAttempt.date);
      
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử làm bài:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết một lần làm bài
   * @param {number} submissionId - ID của bài làm
   * @returns {Promise<Object>} - Chi tiết bài làm
   */
  static async getSubmissionDetail(submissionId) {
    try {
      const submission = await SubmissionService.getSubmissionById(submissionId);
      
      if (!submission) {
        throw new Error('Không tìm thấy bài làm');
      }
      
      // Lấy thông tin bài test
      const testInfo = await TestService.getTestById(submission.TestId);
      
      return {
        submission,
        testInfo
      };
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài làm:', error);
      throw error;
    }
  }

  /**
   * Format thời gian hoàn thành theo định dạng HH:MM:SS
   * @param {number} timeInSeconds - Thời gian tính bằng giây
   * @returns {string} - Chuỗi thời gian đã định dạng
   */
  static formatCompletionTime(timeInSeconds) {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00:00';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  /**
   * Format ngày tháng theo định dạng cụ thể
   * @param {Date} date - Đối tượng Date
   * @returns {string} - Chuỗi ngày tháng đã định dạng
   */
  static formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default TestHistoryService; 