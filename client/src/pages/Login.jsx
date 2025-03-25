import React, { useState } from 'react';
import '../styles/Register.css'; // Sử dụng cùng file CSS

const Login = () => {
    
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    
        

    <div className="register-container">
        <div id="preloader-active">
        <div class="preloader d-flex align-items-center justify-content-center">
            <div class="preloader-inner position-relative">
                <div class="preloader-circle"></div>
                <div class="preloader-img pere-text">
                    <img src="assets/img/logo/loder.png" alt=""/>
                </div>
            </div>
        </div>
        </div>
      <div className="bg-overlay"></div>
      
      <div className="floating-card">
        {/* Left content section - Giữ nguyên như Register */}
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
        
        {/* Right form section - Điều chỉnh cho Login */}
        <div className="form-section">
          <h2>USER LOGIN</h2>
          <p className="subtitle">Welcome to the website</p>
          
          <form>
            {/* Email/Username field */}
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input 
                  type="email" 
                  className="custom-input" 
                  placeholder="Email Address" 
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
                />
                <span className="input-toggle" onClick={togglePassword}>
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
            </div>
            
           {/* Remember me & Forgot password */}
          
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


            <button type="submit" className="submit-btn">LOGIN</button>
            
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