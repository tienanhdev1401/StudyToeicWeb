import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoggedIn } = useAuth();

  // Redirect if already logged in as admin or staff
  useEffect(() => {
    if (isLoggedIn && user && (user.role === 'admin' || user.role === 'staff')) {
      navigate('/admin/dashboard');
    } else if (isLoggedIn && user) {
      // If logged in but not admin/staff, show error
      setError("Bạn không có quyền truy cập trang quản trị");
    }
  }, [isLoggedIn, user, navigate]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const userData = await loginUser(email, password);
      
      // Kiểm tra role của user đăng nhập
      if (userData.user && (userData.user.role === 'admin' || userData.user.role === 'staff')) {
        // Đảm bảo gọi login với đúng dữ liệu
        login(userData);
        console.log("Đăng nhập thành công:", userData.user);
        
        // Redirect sau khi login
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setError("Bạn không có quyền truy cập khu vực quản trị");
      }
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
    <div className="register-container-login-page">
      <div className="bg-overlay-login-page"></div>

      <div className="floating-card-login-page">
        {/* Left content section */}
        <div className="content-section-login-page">
          <div className="content-inner-login-page">
            <h1>ADMIN PORTAL</h1>
            <p>Đăng nhập để quản lý nội dung hệ thống TOEIC ONLINE.</p>
            <div className="illustration-login-page">
              <img src="/assets/img/education-illustration.png" alt="Admin" />
            </div>
          </div>

          <div className="deco-circle-login-page pink-login-page"></div>
          <div className="deco-circle-login-page yellow-login-page"></div>
          <div className="deco-circle-login-page blue-login-page"></div>
        </div>

        {/* Right form section */}
        <div className="form-section-login-page">
          <h2>ADMIN LOGIN</h2>
          <p className="subtitle-login-page">Đăng nhập hệ thống quản trị</p>

          {error && <div className="error-message-login-page">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="form-group-login-page">
              <div className="input-wrapper-login-page">
                <span className="input-icon-login-page">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="custom-input-login-page"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group-login-page">
              <div className="input-wrapper-login-page">
                <span className="input-icon-login-page">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="custom-input-login-page"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="input-toggle-login-page" onClick={togglePassword}>
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn-login-page"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner-border-login-page text-light-login-page" role="status">
                  <span className="visually-hidden-login-page">Loading...</span>
                </div>
              ) : 'LOGIN'}
            </button>

            <div className="login-link-login-page">
              <a href="/">Quay lại trang chủ</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 