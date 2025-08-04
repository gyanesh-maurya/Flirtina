# 💖 Flirtina - AI Companion with Image Generation

<div align="center">

![Flirtina Banner](public/main-logo.png)

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://javascript.info/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com)

**✨ Your AI Companion for Conversations & Visual Creativity ✨**

*Experience the future of AI companionship with intelligent conversations and stunning image generation*

[🚀 **Live Demo**](https://flirtina.netlify.app) • [📖 **Documentation**](#-quick-start) • [🤝 **Contribute**](#-contributing)

</div>

---

**Flirtina** is a flirty, emotionally engaging virtual girlfriend AI chatbot created by **Gyanesh Maurya**. It uses the Gemini API to generate intelligent, playful, and affectionate responses, plus AI-powered image generation to bring your imagination to life. Experience the charm of AI companionship with a modern, secure, and responsive web interface.

## 🚀 Key Features

### 💭 **Intelligent Conversations**
- 🧠 **Context-Aware Responses** - Remembers conversation history
- 💕 **Emotional Intelligence** - Adapts tone to match your mood
- ⚡ **Real-Time Typing** - Realistic typing animations
- 📝 **Rich Text Support** - Markdown formatting for better readability
- 🎭 **Personality-Driven** - Flirty, engaging, and emotionally responsive

### 🎨 **AI Image Generation**
- 🖼️ **FLUX.1-dev Integration** - State-of-the-art image generation
- 💾 **Download Options** - Save generated images locally
- 🎯 **Smart Prompting** - Optimized for best results

### 🛡️ **Security & Performance**
- 🔐 **Zero API Exposure** - All keys secured server-side
- ⚡ **Lightning Fast** - Optimized with Vite and modern architecture
- 📱 **Fully Responsive** - Perfect experience on any device
- 🌙 **Theme Support** - Beautiful dark/light themes
- 💾 **Persistent Storage** - Your conversations are saved locally

## 🛠️ Technology Stack

<div align="center">

| **Frontend** | **Backend** | **AI Services** |
|--------------|-------------|-----------------|
| React 18 | Netlify Functions | Google Gemini AI |
| Vite 5 | Node.js | Hugging Face FLUX | GitHub Pages |
| Modern CSS3 | Serverless | Image Generation |
| ES6+ JavaScript | RESTful APIs | Context Memory |

</div>

## 🔒 Security Architecture

Our security-first approach ensures your API keys are never exposed:

```
🌐 Browser → � Netlify Function → 🤖 Gemini AI
    ↑              ↑                    ↑
 No API Key    Secure Proxy        AI Processing
```

- **Zero Client Exposure**: API keys never reach the browser
- **Serverless Security**: All API calls proxied through Netlify functions
- **Environment Protection**: Keys stored in secure Netlify environment
- **CORS Compliance**: Proper cross-origin request handling

## 🚀 Quick Start

### 🌐 Deploy to Netlify (1-Click Deploy)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gyanesh-maurya/Flirtina)

1. **Click the deploy button** above
2. **Connect your GitHub** account
3. **Configure environment variables**:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
   ```
4. **Get API Keys**:
   - **Gemini AI**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Hugging Face**: Get your API key from [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - 🔑 [Google AI Studio](https://makersuite.google.com/app/apikey) for Gemini
5. **Deploy** - Your site will be live in minutes!

### 🌐 Deploy to Netlify (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your forked repository

3. **Configure build settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   Functions directory: netlify/functions
   ```

4. **Set environment variables**:
   - Go to Site settings → Environment variables
   - Add: `VITE_GEMINI_API_KEY` = `your_gemini_api_key_here`
   - Add: `HUGGING_FACE_API_KEY` = `your_hugging_face_api_key_here`
   - Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Get Hugging Face API key from [Hugging Face Settings](https://huggingface.co/settings/tokens)

5. **Deploy**: Your site will be live in minutes!

### 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/gyanesh-maurya/Flirtina.git
cd Flirtina

# Install dependencies
npm install

# Create environment file
# 🔑 Create environment file
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local
echo "HUGGING_FACE_API_KEY=your_hf_api_key_here" >> .env.local

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔧 Environment Setup

For local development, create a `.env.local` file:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
HUGGING_FACE_API_KEY=your_actual_hf_api_key_here
```


## 📁 Project Structure

<div align="center">

*Clean, organized, and scalable architecture*

</div>

```
🎀 Flirtina/
├── 📁 src/
│   ├── 📁 components/          # 🧩 React UI components
│   │   ├── ChatInput.jsx       # ✍️  Message input component with image mode
│   │   ├── ChatMessages.jsx    # 💬 Chat message display container
│   │   ├── ConfirmationModal.jsx # ✅ Confirmation dialogs
│   │   ├── GeneratedImage.jsx  # 🖼️  AI-generated image display component
│   │   ├── Header.jsx          # 🎯 App header with theme toggle
│   │   ├── Message.jsx         # 💌 Individual message component
│   │   ├── Preloader.css       # 🎨 Loading animation styles
│   │   ├── Preloader.jsx       # ⏳ Loading animations
│   │   ├── Sidebar.jsx         # 📋 Chat sidebar navigation
│   │   └── ThinkingIndicator.jsx # 🤔 AI typing animation
│   ├── 📁 hooks/               # 🪝 Custom React hooks
│   │   ├── useChatApp.js       # 💭 Main chat logic and state management
│   │   ├── usePreloader.js     # ⚡ Loading state management
│   │   └── useTheme.js         # 🎨 Theme management (dark/light)
│   ├── 📁 services/            # 🔌 API communication layer
│   │   ├── geminiAPI.js        # 🤖 Chat API calls to Gemini
│   │   └── imageGenerationAPI.js # 🖼️  Image generation API service
│   ├── 📁 utils/               # 🛠️  Helper functions
│   │   └── messageUtils.js     # 📝 Message processing utilities
│   ├── App.jsx                 # 🎪 Main application component
│   ├── App.css                 # 💅 Application styles
│   ├── main.jsx                # 🚀 React application entry point
│   └── index.css               # 🌍 Global styles and CSS variables
├── 📁 netlify/
│   └── 📁 functions/           # ⚡ Serverless functions
│       ├── chat.js             # 💬 Chat serverless API function
│       └── image-generation.js # 🖼️  Image generation serverless function
├── 📁 public/                  # 📂 Static assets
│   ├── favicon.svg             # 🎭 App favicon
│   ├── logo.png                # 🏷️  Application logo
│   └── main-logo.png           # 🌟 Main branding logo
├── index.html                  # 📄 HTML template
├── package.json                # 📦 Dependencies and scripts
├── vite.config.js              # ⚙️  Vite build configuration
├── netlify.toml                # 🌐 Netlify deployment configuration
└── README.md                   # 📖 Project documentation
```

## 🎨 AI Image Generation

Flirtina includes powerful AI image generation capabilities! Simply toggle the image mode in the chat input and describe what you want to create.

### ✨ Features
- **Natural Language Prompts**: Describe your image in plain English
- **High Quality**: Generates High Quality pixel images
- **Download Support**: Click any generated image to view full-size or download
- **Smart Fallbacks**: Graceful handling when services are temporarily unavailable

### 🖼️ How to Generate Images

1. **Toggle Image Mode**: Click the image icon (🎨) in the chat input
2. **Describe Your Vision**: Type what you want to see (e.g., "a beautiful sunset over mountains")
3. **Wait for Magic**: Flirtina will generate your image using AI
4. **View & Download**: Click the generated image to view full-size or download

### 💡 Example Prompts

```
🌅 A romantic sunset scene with roses
🎨 Abstract art with pink and purple colors
🐱 A cute kitten playing with yarn
🏔️ Majestic mountain landscape at dawn
✨ Fantasy magical forest with glowing lights
```

## 💡 How Flirtina Works

1. **💬 User Interaction**: You type a message to Flirtina or request image generation
2. **🚀 Secure Transmission**: Message sent to Netlify serverless function
3. **🧠 AI Processing**: Gemini AI generates a flirty, contextual response
4. **🎨 Image Creation**: AI-powered image generation from natural language prompts
5. **✨ Response Delivery**: AI response streams back with typing animation
6. **💾 Memory**: Conversation history maintained for context

## 📡 API Architecture

### Serverless Function Endpoint
```typescript
POST /.netlify/functions/chat

Request Body:
{
  "message": "Your message to Flirtina",
  "messageHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}

Response:
{
  "response": "Flirtina's flirty AI response"
}
```

## 🤝 Contributing

We welcome contributions to make Flirtina even more charming! Here's how you can help:

### � Bug Reports
- Found a bug? [Open an issue](https://github.com/gyanesh-maurya/Flirtina/issues)
- Include steps to reproduce and your environment details

### ✨ Feature Requests
- Have ideas for new features? [Start a discussion](https://github.com/gyanesh-maurya/Flirtina/issues)
- Suggest personality improvements or new conversation topics

### 🔧 Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Flirtina.git
   cd Flirtina
   ```

2. **Setup Development Environment**
   ```bash
   npm install
   echo "VITE_GEMINI_API_KEY=your_api_key" > .env.local
   echo "HUGGING_FACE_API_KEY=your_hf_api_key" >> .env.local
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```

4. **Develop & Test**
   ```bash
   npm run dev    # Start development server
   npm run lint   # Check code style
   npm run build  # Test production build
   ```

5. **Submit Pull Request**
   - Write clear commit messages
   - Include tests if applicable
   - Update documentation if needed

### 📋 Contribution Guidelines

- **Code Style**: Follow existing patterns and ESLint rules
- **Commits**: Use conventional commit messages
- **Testing**: Test your changes thoroughly
- **Documentation**: Update README if you add features

## 👨‍💻 Creator

**Gyanesh Maurya**
- 🐙 GitHub: [@gyanesh-maurya](https://github.com/gyanesh-maurya)
- 🌐 Portfolio: [Portfolio](https://gyaneshmaurya.tech)

<div align="center">

**Made with 💖 by Gyanesh Maurya**

*Experience the future of AI companionship with Flirtina* ✨

[⭐ Star this repo](https://github.com/gyanesh-maurya/Flirtina) • [🐛 Report Bug](https://github.com/gyanesh-maurya/Flirtina/issues) • [💡 Request Feature](https://github.com/gyanesh-maurya/Flirtina/issues)

</div>
