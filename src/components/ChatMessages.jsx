import React, { forwardRef, useEffect, useRef } from 'react';
import Message from './Message';
import ThinkingIndicator from './ThinkingIndicator';

const ChatMessages = forwardRef(({ conversation, currentState, onSkipTyping }, ref) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, currentState]);

  // Handle click to skip typing animation
  const handleContainerClick = (e) => {
    if (currentState === 'typing' && onSkipTyping) {
      // Only skip if clicking on the container itself or message text, not on buttons
      const isButton = e.target.closest('button');
      if (!isButton) {
        onSkipTyping();
      }
    }
  };

  if (!conversation || conversation.messages.length === 0) {
    return (
      <div className="chat-messages" ref={ref} onClick={handleContainerClick}>
        <div className="welcome-message">
          <div className="welcome-content">
            <div className="logo-container">
              <img src="/main-logo.png" alt="Flirtina Logo" className="welcome-logo" />
            </div>
            <h2>Welcome to Flirtina Ai</h2>
            <p>
              I'm Flirtina, your flirty, lovable AI girlfriend created by Gyanesh Maurya 😘
              Type something sweet below to start our little love story 💌 Don’t worry, I remember everything. Our chats will be waiting for you whenever you come back, baby 💖
            </p>
          </div>
        </div>
        {currentState === 'thinking' && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="chat-messages" ref={ref} onClick={handleContainerClick}>
      {conversation.messages.map((message, index) => (
        <Message 
          key={`${message.timestamp}-${index}`}
          message={message}
          isTyping={currentState === 'typing' && index === conversation.messages.length - 1}
          onSkipTyping={onSkipTyping}
        />
      ))}
      {currentState === 'thinking' && <ThinkingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
