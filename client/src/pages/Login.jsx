// Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import '../styles/Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // Lấy hàm login từ AuthContext

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const userData = await loginUser(email, password);
      login(userData);
      navigate('/');
    } catch (err) {
      console.error("Lỗi không xác định:", err);
      
      // Lấy message từ error object
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      
      if (err.message) {
        // Nếu là Error object có message property
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        // Nếu là lỗi axios với data.message
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
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
            <h1>TOEIC ONLINE</h1>
            <p>Join our learning platform today and get access to thousands of lesson. Start your learning journey with us!</p>
            <div className="illustration-login-page">
              <img src="/assets/img/education-illustration.png" alt="Education" />
            </div>
          </div>

          <div className="deco-circle-login-page pink-login-page"></div>
          <div className="deco-circle-login-page yellow-login-page"></div>
          <div className="deco-circle-login-page blue-login-page"></div>
        </div>

        {/* Right form section */}
        <div className="form-section-login-page">
          <h2>USER LOGIN</h2>
          <p className="subtitle-login-page">Welcome to the website</p>

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

            {/* Remember me & Forgot password */}
            <div className="form-group-login-page flex-login-page justify-between-login-page items-center-login-page">
              <label className="terms-group-login-page">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="/forgetpassword" className="text-purple-600-login-page hover:underline text-sm-login-page">
                Forgot password?
              </a>
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
              Don't have an account? <a href="/register">Create Account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;