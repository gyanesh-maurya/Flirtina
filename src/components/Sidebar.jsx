import React from 'react';

const Sidebar = ({ 
  isOpen, 
  conversations, 
  currentConversationId, 
  onNewChat, 
  onLoadConversation, 
  onDeleteConversation, 
  onClearHistory,
  onClose 
}) => {
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedConversations = conversations
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleNewChat = () => {
    onNewChat();
    // Close sidebar on mobile after creating new chat
    if (window.innerWidth <= 768) {
      onClose?.();
    }
  };

  const handleLoadConversation = (conversationId) => {
    onLoadConversation(conversationId);
    // Close sidebar on mobile after loading conversation
    if (window.innerWidth <= 768) {
      onClose?.();
    }
  };

  const handleClearHistory = () => {
    onClearHistory();
    // Close sidebar on mobile after clearing history
    if (window.innerWidth <= 768) {
      onClose?.();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="btn btn--primary btn--full-width" 
          onClick={handleNewChat}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Chat
        </button>
      </div>

      <div className="sidebar-content">
        <div className="chat-history">
          {sortedConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`chat-history-item ${conversation.id === currentConversationId ? 'active' : ''}`}
              onClick={() => handleLoadConversation(conversation.id)}
            >
              <div className="chat-item-content">
                <div className="chat-item-title">{conversation.title}</div>
                <div className="chat-item-time">{formatTime(conversation.updatedAt)}</div>
              </div>
              <button
                className="chat-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id, conversation.title);
                }}
                aria-label={`Delete conversation: ${conversation.title}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button 
          className="btn btn--outline btn--full-width" 
          onClick={handleClearHistory}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
          </svg>
          Clear History
        </button>
        
        <div className="sidebar-legal-links">
          <button 
            className="legal-link"
            onClick={() => window.open('/terms.html', '_blank')}
          >
            Terms & Conditions
          </button>
        </div>
        
        <div className="sidebar-credits">
          <p>Made with 💖 by <a href="https://gyaneshmaurya.tech" target="_blank" rel="noopener noreferrer">Gyanesh Maurya</a></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
