import React from 'react';
import '../styles/TestResultPopup.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TestResultPopup = ({ 
  isOpen, 
  onClose,
  result, 
  testTitle,
  onSaveResult 
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  if (!isOpen) return null;

  const handleViewDetails = () => {
    // Instead of navigating, just close the popup
    // The details are already shown on the main page
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
          </div>
        </div>
        
        <div className="test-result-popup-footer">
          <button className="test-result-popup-details-button" onClick={handleViewDetails}>Xem chi tiết</button>
          {isLoggedIn && (
            <button className="test-result-popup-save-button" onClick={onSaveResult}>Lưu kết quả</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultPopup;