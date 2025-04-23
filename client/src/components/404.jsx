import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/404.css'; // Import your CSS file for styling

const NotFound = () => {
    const navigate = useNavigate();
    const [stars, setStars] = React.useState([]);

  useEffect(() => {
    const generateStars = () => {
      const starCount = 50;
      const stars = [];      
      for (let i = 0; i < starCount; i++) {
        const size = Math.random() * 3 + 1;
        const duration = (Math.random() * 3 + 2) + 's';
        const delay = (Math.random() * 2) + 's';
        
        stars.push(
          <div 
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: duration,
              animationDelay: delay,
            }}
          />
        );
      }
      return stars;
    };
  

    setStars(generateStars());
  }, []);
  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };
  return (
    <div className="not-found-container">
      <div className="starfield">{stars}</div>

      <div className="cosmic-border">
        <h1 className="glow-text">404</h1>
        <h2 className="glow-text subheading">OOPS! COSMIC DISCONNECTION</h2>
        <button className="btn-glow" onClick={handleGoBack}>
          <i className="fas fa-rocket"></i>
          BACK
        </button>
      </div>
    </div>
  );
};

export default NotFound;