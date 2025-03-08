import React, { useState } from 'react';
import '../styles/Register.css'; // Make sure to create this file with the CSS below

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
        <div class="preloader d-flex align-items-center justify-content-center">
            <div class="preloader-inner position-relative">
                <div class="preloader-circle"></div>
                <div class="preloader-img pere-text">
                    <img src="assets/img/logo/loder.png" alt=""/>
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
          <h2>CREATE ACCOUNT</h2>
          <p className="subtitle">Join our online learning platform</p>
          
          <form>
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fas fa-user"></i>
                </span>
                <input type="text" className="custom-input" placeholder="Full Name" />
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
                <input type="email" className="custom-input" placeholder="Email Address" />
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
                  className="custom-input" 
                  placeholder="Password" 
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
                  className="custom-input" 
                  placeholder="Confirm Password" 
                />
                <span className="input-toggle" onClick={toggleConfirmPassword}>
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
            </div>
            
            <div className="terms-group">
              <label>
                <input type="checkbox" />
                I agree to the <a href="#">Terms & Conditions</a>
              </label>
            </div>
            
            <button type="submit" className="submit-btn">SIGN UP</button>
            
            <div className="login-link">
              Already have an account? <a href="/Login">Login here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;