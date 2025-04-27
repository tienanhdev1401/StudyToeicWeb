import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import '../styles/Stm_quizzes.css';
import React, { useState } from 'react';

const LoginPopup = ({ onClose }) => {
   const [showPassword] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState(false);
   const { login } = useAuth();
   const [activeTab, setActiveTab] = useState('login');


   const handleSubmit = async (e) => {
     e.preventDefault();
     setIsLoading(true);
     setError("");
   
     try {
       const userData = await loginUser(email, password);
       login(userData);
       onClose(); 
     } catch (err) {
       if (err.response && err.response.status === 401) {
         setError("Email hoặc mật khẩu không chính xác");
       } else {
         console.error("Lỗi không xác định:", err);
         setError("Email hoặc mật khẩu không chính xác.");
       }
     } finally {
       setIsLoading(false);
     }
   };

   return (
    <div className="login-popup">
      <div className="popup-content">
        <div className="popup-sections">
          <div className="login-section">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Đăng nhập
              </button>
              <button 
                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => navigate('/register')}
              >
                Đăng ký
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {activeTab === 'login' && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                    />
                  
                  </div>
                </div>

                <div className="remember-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      className="remember-checkbox"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                </div>

                <div className="action-buttons">
                  <button 
                    type="submit" 
                    className="login-button"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                  <a href="#" className="forgot-password">Quên mật khẩu?</a>
                </div>
              </form>
            )}

            {activeTab === 'register' && (
              <div className="register-message">
                Chức năng đăng ký sẽ sớm được cập nhật
              </div>
            )}
          </div>

          <div className="guest-section">
            <button className="guest-button" onClick={onClose}>
              Tiếp tục với tư cách khách
            </button>
          </div>
        </div>
      </div>
    </div>
   );
};

export default LoginPopup;