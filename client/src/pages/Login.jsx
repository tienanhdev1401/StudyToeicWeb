// Login.jsx
import React, { useState } from 'react';
import { mockUsers } from '../data/mockUser';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      // if (email === mockUsers.emailAddress && password === mockUsers.password) {
      //   navigate('/profile', { state: { user: mockUser } }); // Thêm dòng này
      // } else {
      //   setError("Invalid email or password");
      // }
      const user = mockUsers.find(u => u.emailAddress === email && u.password === password);
      if (user) {
        navigate('/profile', { state: { user } });
      } else {
        setError("Invalid email or password");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="register-container">
      <div id="preloader-active">
        <div className="preloader d-flex align-items-center justify-content-center">
          <div className="preloader-inner position-relative">
            <div className="preloader-circle"></div>
            <div className="preloader-img pere-text">
              <img src="assets/img/logo/loder.png" alt=""/>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-overlay"></div>
      
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
          
          <div className="deco-circle pink"></div>
          <div className="deco-circle yellow"></div>
          <div className="deco-circle blue"></div>
        </div>
        
        {/* Right form section */}
        <div className="form-section">
          <h2>USER LOGIN</h2>
          <p className="subtitle">Welcome to the website</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input 
                  type="email" 
                  className="custom-input" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Password field */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="custom-input" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="input-toggle" onClick={togglePassword}>
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
            </div>
            
            {/* Remember me & Forgot password */}
            <div className="form-group flex justify-between items-center">
              <label className="terms-group">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-purple-600 hover:underline text-sm">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
            
            <div className="login-link">
              Don't have an account? <a href="/register">Create Account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;