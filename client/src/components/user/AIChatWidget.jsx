'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axios';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Xin chào! Tôi là trợ lý AI của tiệm Net. Bạn cần hỗ trợ gì?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axiosClient.post('/ai/chat', {
        message: userMessage
      });

      const data = res;
      const responseData = res.data || res;

      if (responseData.success) {
        setMessages(prev => [...prev, { role: 'ai', content: responseData.reply }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: responseData.error || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.'
        }]);
      }
    } catch (error) {
      console.error(error); // Log lỗi ra để xem
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-[9998] flex flex-col items-start pointer-events-none">

      {/* Chat Window */}
      <div
        className={`
          bg-slate-900 border border-emerald-500/50 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] 
          mb-4 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-left pointer-events-auto
          ${isOpen ? 'opacity-100 scale-100 w-[380px] h-[500px]' : 'opacity-0 scale-0 pointer-events-none h-0 w-0'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-3 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-sm tracking-wide">TRỢ LÝ AI</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-emerald-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`
                  max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-md break-words whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="text-sm text-slate-400">Đang suy nghĩ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            className="flex-1 bg-slate-900 text-white border border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi AI về giá, menu, khuyến mãi..."
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.4)] pointer-events-auto
          flex items-center justify-center text-white text-2xl transition-all duration-300 hover:-translate-y-1
          ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-[0_4px_25px_rgba(16,185,129,0.6)]'}
        `}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Bot className="w-7 h-7" />
        )}
      </button>
    </div>
  );
};

export default AIChatWidget;
