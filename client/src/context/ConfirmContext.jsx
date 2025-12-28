'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, HelpCircle, Trash2, LogOut, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'default',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Xác nhận',
        message: options.message || 'Bạn có chắc chắn?',
        type: options.type || 'default',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.isOpen && (
        <ConfirmModal {...confirmState} />
      )}
    </ConfirmContext.Provider>
  );
};

const ConfirmModal = ({ title, message, type, onConfirm, onCancel, confirmText, cancelText }) => {
  const icons = {
    danger: <Trash2 className="w-12 h-12 text-red-400" />,
    warning: <AlertTriangle className="w-12 h-12 text-yellow-400" />,
    logout: <LogOut className="w-12 h-12 text-orange-400" />,
    default: <HelpCircle className="w-12 h-12 text-blue-400" />,
  };

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-500',
    logout: 'bg-orange-600 hover:bg-orange-500',
    default: 'bg-blue-600 hover:bg-blue-500',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <div className="flex justify-center mb-4">
          {icons[type]}
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-slate-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 ${buttonColors[type]} text-white rounded-xl font-medium transition-all shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Fallback when used outside provider - log warning and return false
    console.warn('[ConfirmContext] useConfirm must be used within ConfirmProvider');
    return {
      confirm: async () => false
    };
  }
  return context;
};

export default ConfirmContext;
