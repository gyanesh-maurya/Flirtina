import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { useChatApp } from './hooks/useChatApp';
import { useTheme } from './hooks/useTheme';
import { usePreloader } from './hooks/usePreloader';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import ConfirmationModal from './components/ConfirmationModal';
import Preloader from './components/Preloader';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { isLoading } = usePreloader(2000); // 2 second minimum load time
  const {
    conversations,
    currentConversationId,
    currentState,
    sendMessage,
    sendImagePrompt,
    startNewConversation,
    loadConversation,
    deleteConversation,
    clearAllHistory,
    skipTypingAnimation
  } = useChatApp();

  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open
  const [isMobile, setIsMobile] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const messagesContainerRef = useRef(null);

  const toggleSidebar = useCallback(() => {
    // Only allow toggle on mobile
    if (isMobile) {
      setSidebarOpen(prev => !prev);
    }
  }, [isMobile]);

  const closeSidebar = useCallback(() => {
    // Only allow close on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Ensure sidebar is always open on desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showConfirmationModal = useCallback((title, message, onConfirm) => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  }, []);

  const hideConfirmationModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  const handleClearHistory = useCallback(() => {
    showConfirmationModal(
      'Clear All History',
      'Are you sure you want to delete all conversations? This action cannot be undone.',
      () => {
        clearAllHistory();
        hideConfirmationModal();
      }
    );
  }, [clearAllHistory, showConfirmationModal, hideConfirmationModal]);

  const handleDeleteConversation = useCallback((conversationId, conversationTitle) => {
    showConfirmationModal(
      'Delete Conversation',
      `Are you sure you want to delete "${conversationTitle}"? This action cannot be undone.`,
      () => {
        deleteConversation(conversationId);
        hideConfirmationModal();
      }
    );
  }, [deleteConversation, showConfirmationModal, hideConfirmationModal]);

  // Global click handler for skipping typing animation
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (currentState === 'typing' && 
          !e.target.closest('.message-action') && 
          !e.target.closest('.send-button') && 
          !e.target.closest('.chat-input')) {
        skipTypingAnimation();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [currentState, skipTypingAnimation]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && 
          sidebarOpen && 
          !e.target.closest('.sidebar') && 
          !e.target.closest('.sidebar-toggle')) {
        closeSidebar();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen, closeSidebar]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentConversation = conversations.get(currentConversationId);

  return (
    <>
      <Preloader isLoading={isLoading} />
      
      <div className={`app ${theme}`} data-color-scheme={theme} style={{ display: isLoading ? 'none' : 'flex' }}>
        <Header 
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleSidebar={toggleSidebar}
        />
      
      <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Overlay for mobile sidebar - click to close (only on mobile) */}
        {sidebarOpen && isMobile && (
          <div 
            className="sidebar-overlay"
            onClick={closeSidebar}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              cursor: 'pointer'
            }}
          />
        )}
        
        <Sidebar
          isOpen={sidebarOpen}
          conversations={Array.from(conversations.values())}
          currentConversationId={currentConversationId}
          onNewChat={startNewConversation}
          onLoadConversation={loadConversation}
          onDeleteConversation={handleDeleteConversation}
          onClearHistory={handleClearHistory}
          onClose={closeSidebar}
        />

        <main className="chat-container">
          <ChatMessages
            ref={messagesContainerRef}
            conversation={currentConversation}
            currentState={currentState}
            onSkipTyping={skipTypingAnimation}
          />
          
          <ChatInput
            onSendMessage={sendMessage}
            onSendImagePrompt={sendImagePrompt}
            currentState={currentState}
            currentConversation={conversations.get(currentConversationId)}
          />
        </main>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={hideConfirmationModal}
      />
      </div>
    </>
  );
}

export default App;
