#!/bin/bash

echo "🔧 Setting up Git repository for Adziga AI..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Check if user is configured
if [ -z "$(git config user.name)" ]; then
    echo "⚠️  Git user not configured. Please run:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    echo ""
    read -p "Enter your name: " username
    read -p "Enter your email: " useremail
    git config --global user.name "$username"
    git config --global user.email "$useremail"
    echo "✅ Git user configured"
fi

# Add all files
echo "📁 Adding all files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit"
else
    # Create initial commit
    echo "💾 Creating initial commit..."
    git commit -m "🚀 Initial commit: Adziga AI - Complete AI-powered advertising platform

✨ Features:
- AI strategy generation with LangChain + Meta LLaMA
- Firebase authentication & Firestore database  
- Beautiful responsive dashboard with strategy display
- User onboarding flow with business profile setup
- Vercel deployment ready with comprehensive documentation

🛠️ Tech Stack:
- Next.js 14 + TypeScript
- Firebase Auth & Firestore
- LangChain + Groq API
- Tailwind CSS
- Vercel deployment

🎯 Ready for production deployment!"

    echo "✅ Initial commit created successfully!"
fi

echo ""
echo "🎉 Git setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a GitHub repository at: https://github.com/new"
echo "2. Name it: adziga-ai"
echo "3. Run these commands to push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/adziga-ai.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🚀 Then deploy to Vercel: https://vercel.com/new" 