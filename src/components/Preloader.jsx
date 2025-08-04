import React from 'react';
import './Preloader.css';

const Preloader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="preloader-overlay">
      <div className="preloader-container">
        <div className="preloader-logo">
          <img src="/logo.png" alt="Flirtina" className="preloader-logo-img" />
        </div>
        
        <div className="preloader-content">
          <h1 className="preloader-title">Flirtina</h1>
          <p className="preloader-subtitle">Your AI Companion</p>
        </div>
        
        <div className="preloader-spinner">
          <div className="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        
        <div className="preloader-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
