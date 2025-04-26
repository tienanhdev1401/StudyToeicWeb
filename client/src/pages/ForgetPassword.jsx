import React, { useState } from 'react';
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const ForgetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      alert('Vui lòng nhập email');
      return;
    }
    setIsLoading(true);
    try {
      await userService.sendVerificationCode(formData.email);
      setIsCodeSent(true);
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      alert('Mã xác thực đã được gửi đến email của bạn');
    } catch (error) {
      alert(error.message || 'Không gửi được mã xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCodeSent) {
      alert('Vui lòng gửi mã xác thực trước');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    setIsLoading(true);
    try {
      await userService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      alert('Đổi mật khẩu thành công!');
      navigate('/login', { replace: true });
    } catch (error) {
      alert(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="register-container">
      <div className="bg-overlay"></div>
      <div className="floating-card">
        {/* Left content section */}
        <div className="content-section">
          <div className="content-inner">
            <h1>TOEIC ONLINE</h1>
            <p>Quên mật khẩu? Đặt lại mật khẩu mới cho tài khoản của bạn.</p>
            <div className="illustration">
              <img src="/assets/img/education-illustration.png" alt="Education" />
            </div>
          </div>
          <div className="deco-circle pink"></div>
          <div className="deco-circle yellow"></div>
          <div className="deco-circle blue"></div>
        </div>
        {/* Right form section */}
        <div className="form-section">
          <h2>QUÊN MẬT KHẨU</h2>
          <p className="subtitle">Nhập email để nhận mã xác thực và đặt lại mật khẩu</p>
          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="custom-input"
                  placeholder="Địa chỉ email"
                  required
                />
                <span className="input-check">
                  <i className="fas fa-check"></i>
                </span>
              </div>
            </div>
            {/* OTP Section */}
            <div className="form-group otp-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-key"></i>
                </span>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,6}$/.test(value)) {
                      setFormData({ ...formData, otp: value });
                    }
                  }}
                  className="custom-input"
                  placeholder="Nhập mã OTP"
                  required
                  maxLength={6}
                />
                <button
                  type="button"
                  className="otp-btn"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isLoading}
                >
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã'}
                </button>
              </div>
            </div>
            {/* New password */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="custom-input"
                  placeholder="Mật khẩu mới"
                  required
                />
                <span className="input-toggle" onClick={togglePassword}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>
            {/* Confirm password */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="custom-input"
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
                <span className="input-toggle" onClick={toggleConfirmPassword}>
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : 'ĐỔI MẬT KHẨU'}
            </button>
            <div className="login-link">
              Đã nhớ mật khẩu? <a href="/login">Đăng nhập ngay</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword; 