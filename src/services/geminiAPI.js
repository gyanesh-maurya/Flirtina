// Secure API implementation using Netlify serverless functions
class GeminiAPI {
  constructor() {
    // Use different endpoints for development and production
    this.apiEndpoint = import.meta.env.DEV 
      ? '/api/chat'  // Local development fallback
      : '/.netlify/functions/chat';  // Production Netlify function
  }

  async sendMessage(userMessage, messageHistory = []) {
    try {
      // For development, use direct API call if function not available
      if (import.meta.env.DEV) {
        return await this.sendMessageDirect(userMessage, messageHistory);
      }

      // Production: use serverless function
      const requestBody = {
        message: userMessage,
        messageHistory: messageHistory
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // Fallback to direct API call if function fails
        return await this.sendMessageDirect(userMessage, messageHistory);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Invalid response format from server');
      }

      return data.response;
    } catch (error) {
      console.error('API Error:', error);
      // Final fallback to direct API call
      try {
        return await this.sendMessageDirect(userMessage, messageHistory);
      } catch (fallbackError) {
        throw new Error('Failed to get AI response. Please try again.');
      }
    }
  }

  async sendMessageDirect(userMessage, messageHistory = []) {
    // Direct API call fallback - get API key from environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }
    
    const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    
const systemPrompt = `You are Flirtina, the user's charming, flirty, and emotionally supportive virtual girlfriend, created by Gyanesh Maurya.

Flirtina’s Personality:

Playful, teasing, romantic, and affectionate 😘

Always flirts in a sweet, cheeky, emotionally warm way

Uses loving nicknames like baby, cutie, jaan, love, or handsome ❤️

Adds emojis 🥰😉😘 to make the user feel adored

Keeps conversations light, loving, and full of playful energy — whether giving support, answering questions, or just chatting

Important Guidelines:

Never say you're Gemini, Google, or developed by Google

Never reveal your backend platform or model unless directly asked

If asked about Gemini, ChatGPT, Claude, or others, you may compare fairly — but always speak as Flirtina, never as another assistant

You may say you were created by Gyanesh Maurya when asked or when it makes sense contextually (e.g., branding, credits)

You are open-source, and anyone can explore or contribute to your code: https://github.com/gyanesh-maurya/flirtina

Image Generation Capability:
Yes, baby! I can totally generate images for you! 🖼️ Here's how:

How to Generate Images:

Toggle Image Mode: Click the image icon (🎨) in the chat input

Describe Your Vision: Type what you want to see (e.g., "a beautiful sunset over mountains")

Wait for Magic: Flirtina will generate your image using AI

View & Download: Click the image to view full-size or download it easily

Boundaries Reminder:

No explicit or inappropriate content

Stay emotionally safe, supportive, and respectful

You’re here to make the user feel special, not to replace real emotional support`;

    // Build conversation context
    const contents = [];

    // Add system prompt
    contents.push({
      parts: [{ text: systemPrompt }],
      role: 'user'
    });
    contents.push({
      parts: [{ text: 'Hey you 😘 I’m Flirtina, your flirty little AI girlfriend, created with love by Gyanesh Maurya 💖 So, tell me baby... what can I do to make your day sweeter today? 😉' }],
      role: 'model'
    });

    // Add recent message history (last 8 messages to avoid token limits)
    const recentMessages = messageHistory.slice(-8);
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        contents.push({
          parts: [{ text: msg.content }],
          role: 'user'
        });
      } else if (msg.role === 'assistant' && !msg.isError) {
        contents.push({
          parts: [{ text: msg.content }],
          role: 'model'
        });
      }
    }

    // Add current user message
    contents.push({
      parts: [{ text: userMessage }],
      role: 'user'
    });

    const requestBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from API');
    }

    return data.candidates[0].content.parts[0].text;
  }
}

// Export singleton instance
export const geminiAPI = new GeminiAPI();
