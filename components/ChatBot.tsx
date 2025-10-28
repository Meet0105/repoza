import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Minimize2, HelpCircle, Search, BookOpen, Zap } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hi! 👋 I'm your Repoza AI Assistant. I can help you with:

🔍 **Searching** repositories
🎨 **Generating** boilerplates
📚 **Learning** new technologies
💾 **Managing** collections
🚀 **Deploying** projects

What would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowQuickActions(false);

    try {
      const res = await axios.post('/api/chat', {
        message: text,
        context: {
          currentPage: router.pathname,
          previousMessages: messages.slice(-4), // Last 4 messages for context
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Search, label: 'How to search?', message: 'How do I search for repositories?' },
    { icon: BookOpen, label: 'Features guide', message: 'What features does Repoza have?' },
    { icon: Zap, label: 'Quick start', message: 'How do I get started with Repoza?' },
    { icon: HelpCircle, label: 'Troubleshoot', message: 'I need help troubleshooting an issue' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full gradient-primary shadow-lg hover:shadow-glow-cyan flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 animate-bounce"
        title="Chat with AI Assistant"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 transition-all duration-300 ${
        isMinimized ? 'w-14 h-14' : 'w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-8rem)] md:h-[600px]'
      }`}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full gradient-primary shadow-lg hover:shadow-glow-cyan flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      ) : (
        <div className="glass-strong rounded-2xl border border-white/10 shadow-2xl flex flex-col h-full animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Repoza Assistant</h3>
                <p className="text-xs text-gray-400">Always here to help</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'glass-light border border-white/10 text-gray-200'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({ node, ...props }) => (
                            <strong className="text-cyan-400 font-semibold" {...props} />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              className="bg-black/40 text-cyan-400 px-1.5 py-0.5 rounded text-xs"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside space-y-1 my-2" {...props} />
                          ),
                          li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="glass-light border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && messages.length <= 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-400 mb-2">Quick actions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(action.message)}
                    className="flex items-center gap-2 p-2 glass-light hover:glass rounded-lg transition-all text-left border border-white/10 hover:border-cyan-500/50"
                  >
                    <action.icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs text-gray-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="p-2 gradient-primary rounded-lg hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
