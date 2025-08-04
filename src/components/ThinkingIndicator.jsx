import React from 'react';

const ThinkingIndicator = () => {
  return (
    <div className="thinking-message">
      <div className="message-avatar">AI</div>
      <div className="thinking-content">
        <div className="thinking-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="thinking-text">Flirtina is thinking...</span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
