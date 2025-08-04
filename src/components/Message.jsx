import React, { useState, useEffect } from 'react';
import { parseMarkdown, copyToClipboard } from '../utils/messageUtils';
import GeneratedImage from './GeneratedImage';

const Message = ({ message, isTyping = false, onSkipTyping }) => {
  const [displayContent, setDisplayContent] = useState('');
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Typing animation effect
  useEffect(() => {
    if (isTyping && message.role === 'assistant') {
      setShowSkipHint(true);
      setDisplayContent('');
      setIsAnimationComplete(false);
      
      const content = message.content;
      const typingSpeed = 40;
      let currentIndex = 0;
      let animationId;

      const typeNextChar = () => {
        if (currentIndex < content.length) {
          setDisplayContent(content.substring(0, currentIndex + 1));
          currentIndex++;
          animationId = setTimeout(typeNextChar, typingSpeed);
        } else {
          setShowSkipHint(false);
          setIsAnimationComplete(true);
        }
      };

      const timer = setTimeout(typeNextChar, typingSpeed);
      
      return () => {
        clearTimeout(timer);
        if (animationId) clearTimeout(animationId);
      };
    } else {
      setDisplayContent(message.content);
      setShowSkipHint(false);
      setIsAnimationComplete(true);
    }
  }, [isTyping, message.content, message.role]);

  // Handle click to skip typing animation
  const handleMessageClick = (e) => {
    if (isTyping && !isAnimationComplete && onSkipTyping) {
      // Only skip if clicking on the message content, not on buttons
      const isButton = e.target.closest('button');
      if (!isButton) {
        setDisplayContent(message.content);
        setShowSkipHint(false);
        setIsAnimationComplete(true);
        onSkipTyping();
      }
    }
  };

  const avatar = message.role === 'user' ? 'U' : 'AI';
  const time = formatTime(message.timestamp);

  // Handle different message types
  let content;
  if (message.type === 'image') {
    // For image messages, don't process content as markdown
    content = null;
  } else if (message.role === 'assistant') {
    // For assistant messages, parse markdown
    content = parseMarkdown(displayContent);
  } else {
    // For user messages, escape HTML
    content = displayContent.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const handleCopy = () => {
    copyToClipboard(message.content);
  };

  return (
    <div 
      className={`message ${message.role} ${message.isError ? 'error-message' : ''}`}
      onClick={handleMessageClick}
      style={{ cursor: isTyping && !isAnimationComplete ? 'pointer' : 'default' }}
    >
      <div className="message-avatar">{avatar}</div>
      <div className="message-content">
        {message.type === 'image' ? (
          <GeneratedImage 
            imageData={message.imageData}
            prompt={message.prompt}
            isGenerating={message.isGenerating}
          />
        ) : (
          <div 
            className="message-text"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {isTyping && !isAnimationComplete && message.type !== 'image' && (
          <span className="typing-cursor"></span>
        )}
        {showSkipHint && message.type !== 'image' && (
          <div className="skip-typing-hint">
            Click anywhere to skip
          </div>
        )}
        <div className="message-meta">
          <span className="message-time">{time}</span>
          <div className="message-actions">
            <button 
              className="message-action" 
              onClick={handleCopy}
              aria-label="Copy message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="m5,15H4a2,2 0 0,1-2-2V4a2,2 0 0,1,2-2H15a2,2 0 0,1,2,2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
