// Simple in-memory rate limiting (in production, use Redis or a database)
const requestTracker = new Map();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestTracker.entries()) {
    if (now - data.lastCleanup > 600000) { // 10 minutes
      requestTracker.delete(ip);
    }
  }
}, 600000);

// Rate limiting and abuse detection
const checkRateLimit = (clientIP) => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute

  if (!requestTracker.has(clientIP)) {
    requestTracker.set(clientIP, {
      requests: [],
      lastCleanup: now
    });
  }

  const clientData = requestTracker.get(clientIP);
  
  // Remove requests older than the window
  clientData.requests = clientData.requests.filter(timestamp => now - timestamp < windowMs);
  
  // Check if limit exceeded
  if (clientData.requests.length >= maxRequests) {
    return false;
  }
  
  // Add current request
  clientData.requests.push(now);
  clientData.lastCleanup = now;
  
  return true;
};

// Check for abuse patterns in message content
const checkMessageAbuse = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for empty or very short messages
  if (lowerMessage.length < 2) return true;
  
  // Basic abuse patterns
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

  return abusePatterns.some(pattern => pattern.test(message));
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Get client IP for rate limiting
    const clientIP = event.headers['x-forwarded-for'] || 
                    event.headers['x-real-ip'] || 
                    context.clientContext?.ip || 
                    'unknown';

    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Too many requests. Please slow down and try again in a minute.',
          code: 'RATE_LIMIT_EXCEEDED'
        })
      };
    }

    const { message, messageHistory = [] } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Check for message abuse
    if (checkMessageAbuse(message)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Message content violates usage guidelines.',
          code: 'CONTENT_VIOLATION'
        })
      };
    }

    // Check message history length for 15-message limit
    const userMessageCount = messageHistory.filter(msg => msg.role === 'user').length;
    if (userMessageCount >= 15) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Message limit reached for this conversation. Please start a new chat.',
          code: 'MESSAGE_LIMIT_EXCEEDED'
        })
      };
    }

    // Get API key from environment variables
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

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
      parts: [{ text: 'Understood. I am Flirtina Ai, created by Gyanesh Maurya. How can I help you today?' }],
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
      parts: [{ text: message }],
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: `API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        })
      };
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid response format from API' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        response: data.candidates[0].content.parts[0].text
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
