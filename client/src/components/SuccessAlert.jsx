import React, { useState, useEffect } from 'react';
import '../styles/SuccessAlert.css';

/**
 * Component hiển thị thông báo thành công
 * @param {Object} props - Component props
 * @param {string} props.message - Nội dung thông báo
 * @param {boolean} props.show - Trạng thái hiển thị của alert
 * @param {Function} props.onClose - Hàm callback khi đóng alert
 * @param {number} props.autoCloseTime - Thời gian tự động đóng (ms), mặc định là 5000ms
 */
const SuccessAlert = ({ message, show, onClose, autoCloseTime = 5000 }) => {
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
    <div className="success-alert-container">
      <div className="success-alert">
        <div className="success-icon">
          <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="success-content">
          <span className="success-message">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessAlert; 