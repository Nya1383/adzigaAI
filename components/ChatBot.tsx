import React, { useState, useRef, useEffect } from 'react';
import { Client } from '../types';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  clientData: Client;
  onStrategyGenerated: (strategy: any) => void;
}

export default function ChatBot({ isOpen, onClose, clientData, onStrategyGenerated }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hello ${clientData.businessInfo.businessName}! 👋 I'm your AI strategy assistant. I can help you create a customized marketing strategy based on your specific needs and preferences. 

What would you like me to focus on or avoid in your marketing strategy? For example:
• "Focus more on Meta ads and avoid Google Ads"
• "I want to target millennials specifically"
• "Keep the budget under ₹50,000 for testing"
• "Focus on brand awareness rather than direct sales"

Just tell me what you have in mind!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      // Add thinking message
      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '🤔 Let me analyze your requirements and create a customized strategy...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, thinkingMessage]);

      // Call the chat API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: input.trim(),
          businessName: clientData.businessInfo.businessName,
          businessType: clientData.businessInfo.businessType,
          industry: clientData.businessInfo.industry,
          city: clientData.businessInfo.city,
          budget: clientData.businessInfo.budget,
          platforms: clientData.businessInfo.preferredPlatforms,
          marketingGoal: clientData.businessInfo.marketingGoal,
          description: clientData.businessInfo.description,
          website: clientData.businessInfo.website,
          phone: clientData.businessInfo.phone,
          conversationHistory: messages.map(msg => ({
            type: msg.type,
            content: msg.content
          }))
        })
      });

      const data = await response.json();

      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      if (data.success) {
        const botResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `Perfect! I've created a customized strategy based on your requirements. Here it is:\n\n${data.strategy}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);

        // Notify parent component about the generated strategy
        onStrategyGenerated({
          content: data.strategy,
          timestamp: new Date().toISOString(),
          status: 'pending',
          metadata: data.metadata,
          customPrompt: input.trim()
        });

        // Add follow-up message
        const followUpMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'bot',
          content: "This strategy has been added to your dashboard! 🎉 Would you like me to modify anything or create another variation?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, followUpMessage]);

      } else {
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `I apologize, but I encountered an error while generating your strategy: ${data.error || 'Unknown error'}. Please try again with a different prompt.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered a technical error. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: `Hello ${clientData.businessInfo.businessName}! 👋 I'm your AI strategy assistant. I can help you create a customized marketing strategy based on your specific needs and preferences. 

What would you like me to focus on or avoid in your marketing strategy? For example:
• "Focus more on Meta ads and avoid Google Ads"
• "I want to target millennials specifically"
• "Keep the budget under ₹50,000 for testing"
• "Focus on brand awareness rather than direct sales"

Just tell me what you have in mind!`,
      timestamp: new Date()
    }]);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Strategy Assistant</h3>
              <p className="text-sm text-gray-500">Customize your marketing strategy</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetChat}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Reset Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex space-x-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your requirements here... (e.g., 'Focus on Meta ads, avoid Google, target young professionals')"
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px] max-h-[120px]"
              disabled={isGenerating}
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 self-end"
            >
              {isGenerating ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              <span>{isGenerating ? 'Generating...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
