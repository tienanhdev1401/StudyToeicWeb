import React, { useState } from 'react';
import '../styles/TestResultPopup.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SubmissionService from '../services/SubmissionService';

// Thêm hàm formatCompletionTime
const formatCompletionTime = (timeInSeconds) => {
  if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00:00';
  
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  // Định dạng HH:MM:SS với padding 0 ở trước nếu cần
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

const TestResultPopup = ({ 
  isOpen, 
  onClose,
  result, 
  testTitle,
  onSaveResult,
  submissionData 
}) => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleViewDetails = () => {
    onClose();
  };

  const handleClose = () => {
    // Stop and clean up all audio elements before navigating
    document.querySelectorAll('audio').forEach(audio => {
      try {
        audio.pause();
        audio.src = '';
        
        // If there's a parent container, try to remove the audio element
        if (audio.parentNode) {
          audio.parentNode.innerHTML = '';
        }
      } catch (error) {
        console.error('Error stopping audio in result popup:', error);
      }
    });
    
    // Clean up all audio containers
    document.querySelectorAll('.audio-container').forEach(container => {
      try {
        container.innerHTML = '';
      } catch (error) {
        console.error('Error cleaning audio container:', error);
      }
    });
    
    // Navigate to Test_online_new.jsx when close button is clicked
    navigate('/test-online-new');
  };

  const handleSaveResult = async () => {
    if (!isLoggedIn || !user) {
      alert('Bạn cần đăng nhập để lưu kết quả');
      return;
    }

    // Nếu đã lưu thành công rồi thì không làm gì nữa
    if (saveSuccess) {
      return;
    }

    try {
      setIsSaving(true);
      setSavingError(null);
      
      // Tạo dữ liệu submission
      const submission = {
        LearnerId: user.id,
        TestId: result.testId,
        tittle: testTitle,
        totalscore: result.totalScore,
        listeningScore: result.listeningScore,
        readingScore: result.readingScore,
        completionTime: submissionData?.completionTime || 0,
        userAnswer: JSON.stringify(submissionData?.userAnswer || [])
      };

      // Gọi API lưu kết quả
      const response = await SubmissionService.saveSubmission(submission);
      console.log('Đã lưu kết quả thành công:', response);
      
      setSaveSuccess(true);
      
      // Gọi callback nếu có - nhưng không trực tiếp chuyển trang
      if (onSaveResult && typeof onSaveResult === 'function') {
        onSaveResult(response);
      }
    } catch (error) {
      console.error('Lỗi khi lưu kết quả:', error);
      setSavingError('Đã xảy ra lỗi khi lưu kết quả. Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="test-result-popup-overlay">
      <div className="test-result-popup">
        <div className="test-result-popup-header">
          <div className="test-result-popup-title">{testTitle}</div>
          <button className="test-result-popup-close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="test-result-popup-content">
          <div className="test-result-popup-notice">
            <p>Bài kiểm tra của bạn đã được xử lý. Chi tiết và giải thích đã được hiển thị trực tiếp trên trang. Kết quả:</p>
          </div>

          <div className="test-result-popup-summary">
            <p className="test-result-popup-total">Số câu đúng: {result.listeningCorrect + result.readingCorrect}/{result.listeningTotal + result.readingTotal}</p>
            
            <div className="test-result-popup-section">
              <p>Listening: {result.listeningCorrect}/{result.listeningTotal} - {result.listeningScore} điểm</p>
              <p>Reading: {result.readingCorrect}/{result.readingTotal} - {result.readingScore} điểm</p>
              <p className="test-result-popup-total-score">Tổng điểm: {result.totalScore} điểm</p>
              <p className="test-result-popup-completion-time">
                Thời gian hoàn thành: {formatCompletionTime(submissionData?.completionTime)}
              </p>
            </div>
            
            <div className="test-result-popup-part-details">
              <p>Part 1: {result.partDetails?.part1?.correct || 0}/{result.partDetails?.part1?.total || 0}</p>
              <p>Part 2: {result.partDetails?.part2?.correct || 0}/{result.partDetails?.part2?.total || 0}</p>
              <p>Part 3: {result.partDetails?.part3?.correct || 0}/{result.partDetails?.part3?.total || 0}</p>
              <p>Part 4: {result.partDetails?.part4?.correct || 0}/{result.partDetails?.part4?.total || 0}</p>
              <p>Part 5: {result.partDetails?.part5?.correct || 0}/{result.partDetails?.part5?.total || 0}</p>
              <p>Part 6: {result.partDetails?.part6?.correct || 0}/{result.partDetails?.part6?.total || 0}</p>
              <p>Part 7: {result.partDetails?.part7?.correct || 0}/{result.partDetails?.part7?.total || 0}</p>
            </div>
            
            {savingError && (
              <div className="test-result-popup-error">
                {savingError}
              </div>
            )}
            
            {saveSuccess && (
              <div className="test-result-popup-success">
                Đã lưu kết quả thành công!
              </div>
            )}
          </div>
        </div>
        
        <div className="test-result-popup-footer">
          <button className="test-result-popup-details-button" onClick={handleViewDetails}>Xem chi tiết</button>
          {isLoggedIn && (
            <button 
              className="test-result-popup-save-button" 
              onClick={handleSaveResult}
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? 'Đang lưu...' : saveSuccess ? 'Đã lưu' : 'Lưu kết quả'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultPopup;