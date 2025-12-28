'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Edit3, X } from 'lucide-react';

const PromptContext = createContext(null);

export const PromptProvider = ({ children }) => {
  const [promptState, setPromptState] = useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
    onSubmit: null,
    onCancel: null,
  });

  const prompt = useCallback((options) => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        title: options.title || 'Nhập thông tin',
        message: options.message || '',
        placeholder: options.placeholder || '',
        defaultValue: options.defaultValue || '',
        onSubmit: (value) => {
          setPromptState(prev => ({ ...prev, isOpen: false }));
          resolve(value);
        },
        onCancel: () => {
          setPromptState(prev => ({ ...prev, isOpen: false }));
          resolve(null);
        },
      });
    });
  }, []);

  return (
    <PromptContext.Provider value={{ prompt }}>
      {children}
      {promptState.isOpen && (
        <PromptModal {...promptState} />
      )}
    </PromptContext.Provider>
  );
};

const PromptModal = ({ title, message, placeholder, defaultValue, onSubmit, onCancel }) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input khi modal mở
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <div className="flex justify-center mb-4">
          <Edit3 className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        {message && <p className="text-slate-400 text-center mb-4">{message}</p>}
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-6"
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) {
    console.warn('[PromptContext] usePrompt must be used within PromptProvider');
    return { prompt: async () => null };
  }
  return context;
};

export default PromptContext;
