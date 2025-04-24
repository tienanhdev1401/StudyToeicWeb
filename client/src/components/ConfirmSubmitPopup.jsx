import React from 'react';
import '../styles/ConfirmSubmitPopup.css';

const ConfirmSubmitPopup = ({ isOpen, onClose, onConfirm, answeredCount, totalQuestions }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-submit-overlay">
      <div className="confirm-submit-popup">
        <div className="confirm-submit-header">
          <div className="confirm-submit-title">Xác nhận nộp bài</div>
          <button className="confirm-submit-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="confirm-submit-content">
          <p className="confirm-submit-completion-status">
            Bạn đã hoàn thành <strong>{answeredCount}/{totalQuestions}</strong> câu hỏi.
          </p>
          
          {answeredCount < totalQuestions && (
            <p className="confirm-submit-warning-message">
              Bạn chưa hoàn thành tất cả các câu hỏi. Bạn có chắc chắn muốn nộp bài?
            </p>
          )}
          
          <p className="confirm-submit-message">Sau khi nộp bài, bạn sẽ không thể quay lại để sửa đổi các câu trả lời.</p>
        </div>
        
        <div className="confirm-submit-actions">
          <button className="confirm-submit-cancel-btn" onClick={onClose}>Hủy</button>
          <button className="confirm-submit-submit-btn" onClick={onConfirm}>Nộp bài</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSubmitPopup;