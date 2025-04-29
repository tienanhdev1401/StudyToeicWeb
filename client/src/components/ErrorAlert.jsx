import React, { useState, useEffect } from 'react';
import '../styles/ErrorAlert.css';

/**
 * Component hiển thị thông báo lỗi
 * @param {Object} props - Component props
 * @param {string} props.message - Nội dung thông báo
 * @param {boolean} props.show - Trạng thái hiển thị của alert
 * @param {Function} props.onClose - Hàm callback khi đóng alert
 * @param {number} props.autoCloseTime - Thời gian tự động đóng (ms), mặc định là 5000ms
 */
const ErrorAlert = ({ message, show, onClose, autoCloseTime = 5000 }) => {
  const [isVisible, setIsVisible] = useState(show);

  // Xử lý khi props show thay đổi
  useEffect(() => {
    setIsVisible(show);
    
    // Đặt timer để tự động đóng sau một khoảng thời gian
    let timer;
    if (show && autoCloseTime) {
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
    }
    
    // Cleanup timer khi component unmount hoặc show thay đổi
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, onClose, autoCloseTime]);

  // Nếu không hiển thị thì return null
  if (!isVisible) return null;

  return (
    <div className="error-alert-container">
      <div className="error-alert">
        <div className="error-icon">
          <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div className="error-content">
          <span className="error-message">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert; 