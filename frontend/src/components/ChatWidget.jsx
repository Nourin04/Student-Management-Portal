import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
// import ReactMarkdown removed
import { sendChatMessage } from '../services/api';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  "Add student named Rahul. Age 20. Math 95",
  "Show STU001",
  "Delete student Adam",
  "How many students are there?"
];

const ChatWidget = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('nova_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
    return [
      { sender: 'ai', text: 'Hi, I\\'m Nova! I am your AI Assistant. You can ask me to add, find, or delete students!' }
    ];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nova_chat_history', JSON.stringify(messages));
  }, [messages]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      // Pass the previous messages as history to the API
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const response = await sendChatMessage(text, history);
      
      // Simulate slight delay for "realistic" thinking feel
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: response.reply }]);
        setIsTyping(false);
        
        // Trigger dashboard action if any
        if (response.action && onAction) {
          onAction(response.action);
        }
      }, 800);
      
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: '❌ Sorry, I encountered an error connecting to the AI.' }]);
        setIsTyping(false);
      }, 800);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-200" />
              <div>
                <h3 className="font-bold text-sm">Nova</h3>
                <p className="text-xs text-indigo-200">Your Intelligent Assistant</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button 
                onClick={() => setMessages([{ sender: 'ai', text: 'Hi, I\\'m Nova! I am your AI Assistant. You can ask me to add, find, or delete students!' }])} 
                className="text-[10px] uppercase tracking-wider bg-indigo-700/50 px-2 py-1 rounded hover:bg-indigo-700 transition-colors"
                title="Clear Chat"
              >
                Clear
              </button>
              <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 h-[450px] max-h-[60vh] flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-bl-sm p-3 shadow-sm text-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => setInput(s)}
                    className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full hover:bg-indigo-100 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
              <input
                type="text"
                placeholder="Ask Nova..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95 animate-in zoom-in"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
