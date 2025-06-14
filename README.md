# 🚀 Adziga AI - AI-Powered Advertising Agency Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/adziga-ai)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)](https://firebase.google.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3.28-green)](https://langchain.com/)

> **Transform your business with autonomous advertising campaigns. Our AI creates strategies and executes campaigns across Meta, Google, and WhatsApp automatically.**

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Demo Use Cases](#demo-use-cases)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Adziga AI is a production-ready MVP that allows businesses to describe their marketing needs, and the system will:

- **Understand** business type, budget, and goals
- **Generate** AI-powered strategies using LangChain + Gemini/LLaMA 3
- **Execute** campaigns via Meta Ads API / WhatsApp API
- **Monitor** performance with real-time analytics
- **Report** results through automated weekly summaries

### System Users

1. **Clients (Business Owners)**
   - No login required initially
   - Fill onboarding form with business details
   - On Save/Submit, login/signup via Firebase Auth
   - View campaign status, metrics, and reports

2. **Admins (Agency Team)**
   - Secured Firebase login with whitelisted emails
   - Approve/edit AI-suggested strategies
   - Trigger automation/campaign execution
   - Monitor all campaigns and client performance

## ✨ Features

### 🤖 **AI-Powered Strategy Generation**
- **LangChain + Meta LLaMA** integration via Groq API
- **Personalized strategies** based on business details
- **Multi-platform campaigns** (Meta, Google, WhatsApp)
- **Real-time strategy generation** with advanced prompting

### 🔐 **Authentication & User Management**
- **Firebase Authentication** with email/password and Google Sign-in
- **User onboarding flow** with business profile setup
- **Secure user data** with Firestore integration
- **Role-based access** (Client/Admin)

### 📊 **Dashboard & Analytics**
- **Business overview** with key metrics
- **Strategy management** with beautiful UI components
- **Campaign tracking** and performance monitoring
- **Profile management** with edit capabilities

### 🎨 **Modern UI/UX**
- **Responsive design** with Tailwind CSS
- **Beautiful strategy display** with sectioned layouts
- **Interactive components** with smooth animations
- **Mobile-optimized** interface

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | React framework with SSR |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Authentication** | Firebase Auth | User authentication & management |
| **Database** | Firestore | NoSQL database for user data |
| **AI/ML** | LangChain + Groq | AI orchestration & inference |
| **Deployment** | Vercel | Serverless deployment platform |
| **Language Model** | Meta LLaMA 4 Scout | Advanced language model via Groq |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Groq API key

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/adziga-ai.git
cd adziga-ai
npm install
```

### 2. Environment Setup
```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key
```

### 3. Firebase Setup
1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password + Google)
3. Create **Firestore database**
4. Add your domain to authorized domains

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

#### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/adziga-ai)

#### Option 2: Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production
Set these in your Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSyCno6EkDjMGV8r3nCeX3eHlIqmxWxacpeQ` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `adzigaai.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `adzigaai` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `adzigaai.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc123` |
| `GROQ_API_KEY` | Groq API key for LLaMA | `gsk_...` |

## 📁 Project Structure

```
adziga-ai/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   └── StrategyDisplay.tsx # Strategy visualization
├── lib/                 # Core utilities
│   ├── auth-context.tsx # Authentication context
│   ├── firebase.ts      # Firebase configuration
│   └── langchain/       # LangChain agents & config
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── dashboard.tsx   # Main dashboard
│   ├── login.tsx       # Authentication
│   └── onboarding.tsx  # User onboarding
├── services/           # External service integrations
│   └── firestore.ts   # Database operations
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## 🔧 Configuration

### Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /clients/{clientId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Strategies are linked to clients
    match /simple_strategies/{strategyId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/clients/$(resource.data.clientId)) &&
        get(/databases/$(database)/documents/clients/$(resource.data.clientId)).data.uid == request.auth.uid;
    }
  }
}
```

### Firestore Indexes
Create these composite indexes in Firebase Console:
- Collection: `simple_strategies`
- Fields: `clientId` (Ascending), `createdAt` (Descending)

## 🤖 AI Configuration

### LangChain Agents
The platform uses a sophisticated agent system:

```typescript
// Master Agent orchestrates the entire strategy generation
const masterAgent = new MasterAgent({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.7,
  maxTokens: 4000
});

// Strategy Agent specializes in marketing strategy creation
const strategyAgent = new StrategyAgent({
  role: "Senior Marketing Strategist",
  expertise: ["Digital Marketing", "Campaign Strategy", "ROI Optimization"]
});
```

### Supported Platforms
- **Meta (Facebook & Instagram)** - Social media advertising
- **Google Ads** - Search and display advertising  
- **WhatsApp Business** - Direct messaging campaigns

## 📊 Features Roadmap

### ✅ Completed
- [x] User authentication & onboarding
- [x] AI strategy generation with LangChain
- [x] Beautiful strategy display
- [x] Firestore data persistence
- [x] Responsive dashboard
- [x] Vercel deployment ready

### 🚧 In Progress
- [ ] Campaign execution automation
- [ ] Real-time analytics dashboard
- [ ] Multi-language support
- [ ] Advanced targeting options

### 📋 Planned
- [ ] A/B testing framework
- [ ] Custom model fine-tuning
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)

## 🐛 Troubleshooting

### Common Issues

#### 1. Firebase Network Errors
```bash
# Error: auth/network-request-failed
# Solution: Check Firebase configuration and internet connectivity
```

#### 2. Firestore Index Errors
```bash
# Error: The query requires an index
# Solution: Create composite index in Firebase Console
```

#### 3. Vercel Build Errors
```bash
# Error: Module not found
# Solution: Check all imports and dependencies
npm run build  # Test locally first
```

### Debug Mode
Access debug tools at `/debug-strategies` to:
- Test Firestore connections
- Verify user data
- Create test strategies
- Monitor real-time logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Meta** for the LLaMA language model
- **Groq** for ultra-fast inference API
- **LangChain** for AI orchestration framework
- **Firebase** for backend infrastructure
- **Vercel** for seamless deployment

## 📞 Support

- **Documentation**: [docs.adzigaai.com](https://docs.adzigaai.com)
- **Email**: support@adzigaai.com
- **Discord**: [Join our community](https://discord.gg/adzigaai)

---

<div align="center">
  <strong>Built with ❤️ using TypeScript, Next.js, and AI</strong>
  <br>
  <sub>© 2024 Adziga AI. All rights reserved.</sub>
</div> 