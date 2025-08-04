import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, onSendImagePrompt, currentState, currentConversation }) => {
  const [message, setMessage] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);
  const textareaRef = useRef(null);

  // Calculate remaining messages
  const userMessageCount = currentConversation?.messages.filter(msg => msg.role === 'user').length || 0;
  const remainingMessages = Math.max(0, 15 - userMessageCount);
  const isLimitReached = remainingMessages === 0;
  const isDisabled = currentState !== 'idle' || isLimitReached;

  // Auto-focus when input becomes enabled
  useEffect(() => {
    if (!isDisabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isDisabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      if (isImageMode) {
        onSendImagePrompt(message.trim());
      } else {
        onSendMessage(message.trim());
      }
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className={`chat-input-wrapper ${isLimitReached ? 'limit-reached' : ''}`}>
        <div className="input-controls">
          <button
            type="button"
            className={`mode-toggle-button ${isImageMode ? 'active' : ''}`}
            onClick={() => setIsImageMode(!isImageMode)}
            disabled={isDisabled}
            aria-label={isImageMode ? 'Switch to text mode' : 'Switch to image generation mode'}
            title={isImageMode ? 'Switch to text mode' : 'Generate images with AI'}
          >
            {isImageMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            )}
          </button>
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`chat-input ${isLimitReached ? 'limit-reached' : ''} ${isImageMode ? 'image-mode' : ''}`}
            placeholder={
              isLimitReached 
                ? "Message limit reached - Start a new chat to continue"
                : isImageMode 
                  ? "Describe the image you want to generate..."
                  : "Type your message here..."
            }
            rows="1"
            maxLength="4000"
            disabled={isDisabled}
          />
        </div>
        
        <button
          type="submit"
          className={`send-button ${isImageMode ? 'image-mode' : ''}`}
          disabled={isDisabled || !message.trim()}
          aria-label={isImageMode ? 'Generate image' : 'Send message'}
        >
          {isImageMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
            </svg>
          )}
        </button>
      </form>
      <div className="input-hint">
        {isLimitReached ? (
          <span className="message-limit-warning">
            💕 Message limit reached! Start a new chat to continue talking with me! 
          </span>
        ) : (
          <>
            {isImageMode ? (
              <span className="image-mode-hint">
                🎨 Image generation mode • Describe your image and I'll create it for you!
              </span>
            ) : (
              <>
                Press Enter to send, Shift+Enter for new line • Click anywhere during typing to skip animation
                <br />
                <span className={remainingMessages <= 3 ? 'message-limit-low' : ''} style={{ fontSize: '12px' }}>
                  {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining in this chat
                </span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInput;