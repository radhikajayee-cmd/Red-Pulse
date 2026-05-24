import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am LifeFlow AI, your blood bank assistant. How can I help you today? Ask me about: donation eligibility, compatibility charts, donation gaps, or recovery care.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await api.post('/chatbot', { message: userMessage });
      if (res.data.success) {
        // Simulated natural typing delay
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
          setIsTyping(false);
        }, 600);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I am having trouble connecting to my knowledge base right now. Please try again." }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-tr from-hospital-red to-hospital-red-dark hover:from-hospital-red-dark hover:to-hospital-red-deep text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            className="w-96 h-[480px] bg-white dark:bg-hospital-gray-deep border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-hospital-red to-hospital-red-dark text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">LifeFlow AI</h3>
                  <span className="text-[10px] text-red-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Online FAQ Assistant
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-hospital-gray-abyss/40">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      msg.sender === 'user' 
                        ? 'bg-hospital-red text-white' 
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-hospital-red text-white rounded-tr-none'
                        : 'bg-white dark:bg-hospital-gray-deep dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-tl-none text-gray-700 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center flex-shrink-0 text-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-hospital-gray-deep p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-hospital-gray-deep flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about eligibility, donor cycles..."
                className="flex-1 bg-gray-55 dark:bg-hospital-gray-abyss/60 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:border-hospital-red focus:ring-1 focus:ring-hospital-red/20 outline-none dark:text-white"
              />
              <button
                type="submit"
                className="w-9 h-9 bg-hospital-red hover:bg-hospital-red-dark text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
