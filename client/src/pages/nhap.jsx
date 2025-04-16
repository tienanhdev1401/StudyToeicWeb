import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import '../styles/Register.css';

const RegisterForm = () => {
  const { sendVerificationCode, register } = useUser();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    otp: '',
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendCode = async () => {
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
      alert('Đã có lỗi xảy ra khi gửi mã xác thực');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isCodeSent) {
      alert('Vui lòng gửi mã xác thực trước');
      return;
    }

    try {
      const response = await register(formData);
      alert('Đăng ký thành công!');
      console.log('Registered user:', response);
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Đã có lỗi xảy ra khi đăng ký');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          value={formData.fullname}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            name="otp"
            placeholder="Mã xác thực"
            value={formData.otp}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi mã'}
          </button>
        </div>
        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
};

export default RegisterForm;