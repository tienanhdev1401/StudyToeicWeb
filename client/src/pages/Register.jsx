import React, { useState } from 'react';
import '../styles/Register.css'; // Make sure to create this file with the CSS below
import { useUser } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { sendVerificationCode, register } = useUser();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

    try {
      await sendVerificationCode(formData.email);
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
      console.error('Error sending verification code:', error);
      alert(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isCodeSent) {
      alert('Vui lòng gửi mã xác thực trước');
      return;
    }


    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    const { fullname, email, password, verificationCode } = formData;

    try {
      const result = await register({ fullname, email, password, verificationCode });
      
      if (result && result.success) {
        alert('Đăng ký thành công!');
        navigate('/login', { replace: true });
      } else {
        alert(result.message || 'Đăng ký không thành công, vui lòng thử lại');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert(error.message || 'Đã có lỗi xảy ra khi đăng ký');
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-container">
      <div className="bg-overlay"></div>
      <div id="preloader-active">
        <div className="preloader d-flex align-items-center justify-content-center">
          <div className="preloader-inner position-relative">
            <div className="preloader-circle"></div>
            <div className="preloader-img pere-text">
              <img src="assets/img/logo/loder.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="floating-card">
        {/* Left content section */}
        <div className="content-section">
          <div className="content-inner">
            <h1>TOEIC ONLINE</h1>
            <p>Join our learning platform today and get access to thousands of lesson. Start your learning journey with us!</p>
            <div className="illustration">
              <img src="/assets/img/education-illustration.png" alt="Education" />
            </div>
          </div>

          {/* Decorative circles */}
          <div className="deco-circle pink"></div>
          <div className="deco-circle yellow"></div>
          <div className="deco-circle blue"></div>
        </div>

        {/* Right form section */}
        <div className="form-section">
          <h2>TẠO TÀI KHOẢN</h2>
          <p className="subtitle">Tham gia nền tảng học trực tuyến của chúng tôi</p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="custom-input"
                  placeholder="Họ và tên"
                  required
                />
                <span className="input-check">
                  <i className="fas fa-check"></i>
                </span>
              </div>
            </div>

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

            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="custom-input"
                  placeholder="Mật khẩu"
                  required
                />
                <span className="input-toggle" onClick={togglePassword}>
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="custom-input"
                  placeholder="Xác nhận mật khẩu"
                  required
                />
                <span className="input-toggle" onClick={toggleConfirmPassword}>
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
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
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Chỉ cho nhập số và không quá 6 ký tự
                    if (/^\d{0,6}$/.test(value)) {
                      setFormData({ ...formData, verificationCode: value });
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
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã'}
                </button>
              </div>
            </div>

            <div className="terms-group">
              <label>
                <input type="checkbox" required />
                Tôi đồng ý với <a href="#">Điều khoản & Điều kiện</a>
              </label>
            </div>

            <button type="submit" className="submit-btn">ĐĂNG KÝ</button>

            <div className="login-link">
              Đã có tài khoản? <a href="/Login">Đăng nhập ngay</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;