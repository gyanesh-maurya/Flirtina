import { useState, useEffect, useCallback, useRef } from 'react';
import { geminiAPI } from '../services/geminiAPI';
import { imageGenerationAPI } from '../services/imageGenerationAPI';

export const useChatApp = () => {
  const [conversations, setConversations] = useState(new Map());
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentState, setCurrentState] = useState('idle'); // idle, thinking, typing
  const [lastMessageTime, setLastMessageTime] = useState(0);
  
  const currentTypingAnimation = useRef(null);
  const currentThinkingTimeout = useRef(null);
  const skipTypingCallback = useRef(null);

  // Rate limiting: minimum 2 seconds between messages
  const MESSAGE_COOLDOWN = 2000;

  // Utility functions
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const generateTitle = (message) => {
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
  };

  // Clean up empty "New Chat" conversations
  const cleanupEmptyChats = (conversationsMap) => {
    const cleanedMap = new Map();
    
    conversationsMap.forEach((conversation) => {
      // Keep conversations that have messages or don't have the default "New Chat" title
      if (conversation.messages.length > 0 || conversation.title !== 'New Chat') {
        cleanedMap.set(conversation.id, conversation);
      }
    });
    
    return cleanedMap;
  };

  // Remove empty "New Chat" conversations except the most recent one
  const removeExtraEmptyChats = (conversationsMap) => {
    const emptyNewChats = [];
    const otherConversations = new Map();
    
    conversationsMap.forEach((conversation) => {
      if (conversation.messages.length === 0 && conversation.title === 'New Chat') {
        emptyNewChats.push(conversation);
      } else {
        otherConversations.set(conversation.id, conversation);
      }
    });
    
    // Keep only the most recent empty "New Chat"
    if (emptyNewChats.length > 1) {
      const mostRecentEmpty = emptyNewChats.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];
      otherConversations.set(mostRecentEmpty.id, mostRecentEmpty);
    } else if (emptyNewChats.length === 1) {
      otherConversations.set(emptyNewChats[0].id, emptyNewChats[0]);
    }
    
    return otherConversations;
  };

  // Load from localStorage on mount
  useEffect(() => {
    const initializeApp = () => {
      try {
        const savedConversations = localStorage.getItem('flirtina_conversations');
        const savedCurrentId = localStorage.getItem('flirtina_current_conversation_id');

        if (savedConversations) {
          const parsedConversations = JSON.parse(savedConversations);
          let conversationsMap = new Map(Object.entries(parsedConversations));
          
          // Clean up multiple empty "New Chat" conversations on refresh
          conversationsMap = removeExtraEmptyChats(conversationsMap);
          
          // Only load if there are actual conversations after cleanup
          if (conversationsMap.size > 0) {
            setConversations(conversationsMap);
            
            // If there's a saved current conversation and it exists, use it
            if (savedCurrentId && conversationsMap.has(savedCurrentId)) {
              setCurrentConversationId(savedCurrentId);
            } else {
              // Use the most recent conversation
              const mostRecentConversation = Array.from(conversationsMap.values())
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
              setCurrentConversationId(mostRecentConversation.id);
            }
            return; // Don't create new conversation if we have existing ones
          }
        }
        
        // Create a new conversation only if no conversations exist
        const conversationId = generateId();
        const conversation = {
          id: conversationId,
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setConversations(new Map([[conversationId, conversation]]));
        setCurrentConversationId(conversationId);
      } catch (error) {
        console.error('Error loading from storage:', error);
        // Create a new conversation on error
        const conversationId = generateId();
        const conversation = {
          id: conversationId,
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setConversations(new Map([[conversationId, conversation]]));
        setCurrentConversationId(conversationId);
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once on mount

  // Save to localStorage whenever conversations change
  const saveToStorage = useCallback(() => {
    try {
      // Clean up before saving
      const cleanedConversations = removeExtraEmptyChats(conversations);
      const conversationsObj = Object.fromEntries(cleanedConversations);
      localStorage.setItem('flirtina_conversations', JSON.stringify(conversationsObj));
      
      if (currentConversationId && cleanedConversations.has(currentConversationId)) {
        localStorage.setItem('flirtina_current_conversation_id', currentConversationId);
      } else {
        localStorage.removeItem('flirtina_current_conversation_id');
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    saveToStorage();
  }, [conversations, currentConversationId, saveToStorage]);

  const startNewConversation = useCallback(() => {
    stopCurrentAnimations();
    
    // Generate the new conversation ID first
    const newConversationId = generateId();
    
    setConversations(prev => {
      // Remove any existing empty "New Chat" conversations
      const cleanedConversations = new Map();
      
      prev.forEach((conversation) => {
        // Keep conversations that have messages or don't have the default "New Chat" title
        if (conversation.messages.length > 0 || conversation.title !== 'New Chat') {
          cleanedConversations.set(conversation.id, conversation);
        }
      });
      
      // Create new conversation
      const conversation = {
        id: newConversationId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      cleanedConversations.set(newConversationId, conversation);
      return cleanedConversations;
    });
    
    // Set the new conversation as current
    setCurrentConversationId(newConversationId);
    setCurrentState('idle');
  }, []);

  const loadConversation = useCallback((conversationId) => {
    if (conversations.has(conversationId)) {
      stopCurrentAnimations();
      setCurrentConversationId(conversationId);
      setCurrentState('idle');
    }
  }, [conversations]);

  const stopCurrentAnimations = useCallback(() => {
    if (currentTypingAnimation.current) {
      clearTimeout(currentTypingAnimation.current);
      currentTypingAnimation.current = null;
    }
    
    if (currentThinkingTimeout.current) {
      clearTimeout(currentThinkingTimeout.current);
      currentThinkingTimeout.current = null;
    }

    if (skipTypingCallback.current) {
      skipTypingCallback.current();
      skipTypingCallback.current = null;
    }

    setCurrentState('idle');
  }, []);

  const addMessage = useCallback((message) => {
    setConversations(prev => {
      const newConversations = new Map(prev);
      const conversation = newConversations.get(currentConversationId);
      
      if (conversation) {
        const updatedConversation = {
          ...conversation,
          messages: [...conversation.messages, message],
          updatedAt: new Date().toISOString()
        };

        // Update title based on first user message
        if (conversation.messages.length === 0 && message.role === 'user') {
          updatedConversation.title = generateTitle(message.content);
        }

        newConversations.set(currentConversationId, updatedConversation);
      }
      
      return newConversations;
    });
  }, [currentConversationId]);

  // Check for API abuse patterns
  const checkForAbuse = (messageText) => {
    const lowerMessage = messageText.toLowerCase().trim();
    
    // Check for empty or very short messages
    if (lowerMessage.length < 2) return true;
    
    // Store recent messages for pattern detection
    const recentMessages = JSON.parse(sessionStorage.getItem('recentMessages') || '[]');
    const now = Date.now();
    
    // Remove messages older than 1 minute
    const filteredMessages = recentMessages.filter(msg => now - msg.timestamp < 60000);
    
    // Check for spam (same message repeated)
    const duplicateCount = filteredMessages.filter(msg => msg.text === lowerMessage).length;
    if (duplicateCount >= 3) {
      return true;
    }
    
    // Check for rapid identical patterns
    if (filteredMessages.length >= 5) {
      const lastFive = filteredMessages.slice(-5);
      if (lastFive.every(msg => msg.text === lowerMessage)) {
        return true;
      }
    }
    
    // Add current message to recent messages
    filteredMessages.push({ text: lowerMessage, timestamp: now });
    sessionStorage.setItem('recentMessages', JSON.stringify(filteredMessages.slice(-10))); // Keep last 10
    
    const abusePatterns = [
      /spam/g,
      /test\s*(message|msg|text)\s*\d*/g,
      /(.)\1{10,}/g, // Repeated characters (10+ times)
      /^(.{1,20})\1{3,}$/g, // Repeated short phrases
      /fuck|shit|bitch|asshole|damn/gi, // Basic profanity filter
      /[!@#$%^&*()]{5,}/g, // Excessive special characters
      /^\s*[a-z]\s*$/gi, // Single characters with optional spaces
      /^(hi|hello|hey|yo|sup){3,}$/gi, // Repeated greetings
    ];

    return abusePatterns.some(pattern => pattern.test(messageText));
  };

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || currentState !== 'idle') return;

    // Rate limiting check
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_COOLDOWN) {
      const cooldownMessage = {
        role: 'assistant',
        content: "Hold on there, eager beaver! 😘 Give me just a moment to catch up with you. Let's keep our chat at a nice, sweet pace! 💕",
        timestamp: new Date().toISOString(),
        isError: false
      };
      addMessage(cooldownMessage);
      return;
    }

    // Check for API abuse
    if (checkForAbuse(messageText)) {
      const abuseMessage = {
        role: 'assistant',
        content: "Hey cutie! 😅 That message seems a bit unusual. Let's keep our conversation sweet and respectful, okay? I'm here to chat and have fun with you! 💕",
        timestamp: new Date().toISOString(),
        isError: false
      };
      addMessage(abuseMessage);
      return;
    }

    // Create a conversation if none exists (lazy initialization)
    let activeConversationId = currentConversationId;
    if (!activeConversationId || !conversations.has(activeConversationId)) {
      const conversationId = generateId();
      const conversation = {
        id: conversationId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setConversations(prev => new Map(prev.set(conversationId, conversation)));
      setCurrentConversationId(conversationId);
      activeConversationId = conversationId;
    }

    // Check message limit (15 user messages per conversation)
    const currentConversation = conversations.get(activeConversationId);
    const userMessageCount = currentConversation?.messages.filter(msg => msg.role === 'user').length || 0;
    
    if (userMessageCount >= 15) {
      const limitMessage = {
        role: 'assistant',
        content: "Aww baby! 😘 We've had such a lovely chat together, but I need to keep things balanced. You've reached the 15-message limit for this conversation. 💕\n\nHow about we start a fresh new chat? Just click 'New Chat' and we can continue our sweet conversation there! I'll be waiting for you, cutie! 😉✨",
        timestamp: new Date().toISOString(),
        isError: false
      };
      addMessage(limitMessage);
      return;
    }

    // Update last message time for rate limiting
    setLastMessageTime(now);

    // Add user message
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    addMessage(userMessage);

    // Show thinking state
    setCurrentState('thinking');

    try {
      const conversation = conversations.get(currentConversationId);
      const response = await geminiAPI.sendMessage(messageText, conversation?.messages || []);
      
      // Add assistant message with typing animation
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setCurrentState('typing');
      addMessage(assistantMessage);

      // Simulate typing delay
      await new Promise(resolve => {
        skipTypingCallback.current = resolve;
        currentTypingAnimation.current = setTimeout(resolve, 2000);
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      addMessage(errorMessage);
    } finally {
      setCurrentState('idle');
      skipTypingCallback.current = null;
    }
  }, [currentState, currentConversationId, conversations, addMessage]);

  const skipTypingAnimation = useCallback(() => {
    if (currentState === 'typing' && skipTypingCallback.current) {
      skipTypingCallback.current();
    }
  }, [currentState]);

  const sendImagePrompt = useCallback(async (prompt) => {
    if (!prompt.trim() || currentState !== 'idle') return;

    // Rate limiting check
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_COOLDOWN) {
      const cooldownMessage = {
        role: 'assistant',
        content: "Hold on there, eager beaver! 😘 Give me just a moment to catch up with you. Let's keep our chat at a nice, sweet pace! 💕",
        timestamp: new Date().toISOString(),
        isError: false
      };
      addMessage(cooldownMessage);
      return;
    }

    // Check for API abuse
    if (checkForAbuse(prompt)) {
      const abuseMessage = {
        role: 'assistant',
        content: "Hey cutie! 😅 That image prompt seems a bit unusual. Let's keep our creations sweet and appropriate, okay? I'm here to help you make beautiful art! 💕",
        timestamp: new Date().toISOString(),
        isError: false
      };
      addMessage(abuseMessage);
      return;
    }

    // Create a conversation if none exists
    let activeConversationId = currentConversationId;
    if (!activeConversationId || !conversations.has(activeConversationId)) {
      const conversationId = generateId();
      const conversation = {
        id: conversationId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setConversations(prev => new Map(prev.set(conversationId, conversation)));
      setCurrentConversationId(conversationId);
      activeConversationId = conversationId;
    }

    // Check message limit
    const currentConversation = conversations.get(activeConversationId);
    const userMessageCount = currentConversation?.messages.filter(msg => msg.role === 'user').length || 0;
    
    if (userMessageCount >= 15) {
      const limitMessage = {
        role: 'assistant',
        content: "Aww baby! 😘 We've had such a lovely chat together, but I need to keep things balanced. You've reached the 15-message limit for this conversation. 💕\n\nHow about we start a fresh new chat? Just click 'New Chat' and we can continue creating beautiful images there! I'll be waiting for you, cutie! 😉✨",
        timestamp: new Date().toISOString(),
        isError: false
      };
      addMessage(limitMessage);
      return;
    }

    // Update last message time for rate limiting
    setLastMessageTime(now);

    // Add user message with image prompt
    const userMessage = {
      role: 'user',
      content: `${prompt}`,
      timestamp: new Date().toISOString()
    };
    addMessage(userMessage);

    // Add generating image message
    const generatingMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      type: 'image',
      isGenerating: true,
      prompt: prompt
    };
    addMessage(generatingMessage);

    try {
      const result = await imageGenerationAPI.generateImage(prompt);
      
      // Remove the generating message
      setConversations(prev => {
        const newConversations = new Map(prev);
        const conversation = newConversations.get(activeConversationId);
        
        if (conversation) {
          const updatedMessages = conversation.messages.slice(0, -1); // Remove last message (generating)
          const updatedConversation = {
            ...conversation,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          };
          newConversations.set(activeConversationId, updatedConversation);
        }
        
        return newConversations;
      });

      if (result.success) {
        // Add successful image message
        const imageMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          type: 'image',
          imageData: result.imageData,
          prompt: prompt,
          isGenerating: false,
          model: result.model // Include which model was used
        };
        addMessage(imageMessage);
        
        // If using fallback, add an explanation message
        if (result.model === 'test-fallback') {
          const fallbackExplanation = {
            role: 'assistant',
            content: "💝 Sweetie, the image generation service is taking a little break right now, so I've created a test image for you! The real magic will be back soon! ✨💕",
            timestamp: new Date().toISOString(),
            isError: false
          };
          addMessage(fallbackExplanation);
        }
      } else {
        // Add error message
        const errorMessage = {
          role: 'assistant',
          content: `Sorry sweetie! 😔 I had trouble creating your image. ${result.error || 'Please try again with a different prompt!'} 💕`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        addMessage(errorMessage);
      }

    } catch (error) {
      console.error('Error generating image:', error);
      
      // Remove the generating message
      setConversations(prev => {
        const newConversations = new Map(prev);
        const conversation = newConversations.get(activeConversationId);
        
        if (conversation) {
          const updatedMessages = conversation.messages.slice(0, -1);
          const updatedConversation = {
            ...conversation,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          };
          newConversations.set(activeConversationId, updatedConversation);
        }
        
        return newConversations;
      });

      const errorMessage = {
        role: 'assistant',
        content: 'Sorry sweetie! 😔 I had trouble creating your image. Please try again later! 💕',
        timestamp: new Date().toISOString(),
        isError: true
      };
      addMessage(errorMessage);
    } finally {
      setCurrentState('idle');
    }
  }, [currentState, currentConversationId, conversations, addMessage, lastMessageTime]);

  const deleteConversation = useCallback((conversationId) => {
    setConversations(prev => {
      const newConversations = new Map(prev);
      newConversations.delete(conversationId);
      
      // If we deleted the current conversation
      if (conversationId === currentConversationId) {
        // Switch to another conversation if available
        const remainingConversations = Array.from(newConversations.values())
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        if (remainingConversations.length > 0) {
          setCurrentConversationId(remainingConversations[0].id);
        } else {
          // If no conversations left, create a new one
          const newConversationId = generateId();
          const conversation = {
            id: newConversationId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newConversations.set(newConversationId, conversation);
          setCurrentConversationId(newConversationId);
        }
      }
      
      return newConversations;
    });
  }, [currentConversationId]);

  const clearAllHistory = useCallback(() => {
    // Clear all conversations and create a fresh new one
    const newConversationId = generateId();
    const conversation = {
      id: newConversationId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setConversations(new Map([[newConversationId, conversation]]));
    setCurrentConversationId(newConversationId);
    setCurrentState('idle');
  }, []);

  // Auto-create new conversation if none exists
  useEffect(() => {
    if (!currentConversationId && conversations.size === 0) {
      startNewConversation();
    }
  }, [currentConversationId, conversations.size, startNewConversation]);

  return {
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
  };
};
