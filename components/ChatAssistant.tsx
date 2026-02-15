import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Loader2, Minus, Maximize2 } from 'lucide-react';
import { streamChatResponse } from '../services/geminiService';
import { ServiceItem, Category } from '../types';

interface ChatAssistantProps {
  services: ServiceItem[];
  categories: Category[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ services, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Welcome to ATLASVAULT. I am Atlas, your personal concierge. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Format history for the API
      const apiHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = await streamChatResponse(apiHistory, userMsg, { services, categories });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1].text = fullResponse;
            return newArr;
          });
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having trouble connecting to the Nexus right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Minimized State
  if (isOpen && isMinimized) {
      return (
        <button
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all hover:scale-110 animate-in fade-in zoom-in"
        >
            <Bot className="h-7 w-7 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></div>
        </button>
      );
  }

  // Closed State (FAB)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all hover:scale-110 animate-in fade-in zoom-in"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </button>
    );
  }

  // Open Chat Window
  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-indigo-100" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Atlas Assistant</h3>
            <p className="text-[10px] text-indigo-100 opacity-80 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(true)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors">
                <Minus className="h-4 w-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 hover:bg-white/20 transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 h-[400px] custom-scrollbar space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
              {msg.role === 'user' ? <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />
             </div>
             <div className="rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about our services..."
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2.5 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 rounded-full bg-indigo-600 p-1.5 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-600">
            Powered by Gemini • ATLASVAULT AI
        </div>
      </div>
    </div>
  );
};