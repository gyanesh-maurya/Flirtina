import React from 'react';

const Header = ({ theme, onToggleTheme, onToggleSidebar }) => {
  return (
    <>
      {/* Theme Toggle */}
      <button 
        className="theme-toggle" 
        onClick={onToggleTheme}
        aria-label="Toggle theme"
      >
        <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      {/* Header */}
      <header className="chat-header">
        <button 
          className="sidebar-toggle" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="header-title-container">
          <img src="/logo.png" alt="Flirtina Logo" className="header-logo" />
          <h1 style={{ position: 'relative' }}>
            Flirtina Ai
            <span className="header-subtitle">by Gyanesh</span>
          </h1>
        </div>
      </header>
    </>
  );
};

export default Header;
