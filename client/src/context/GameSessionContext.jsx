'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import axiosClient from '@/api/axios';

const GameSessionContext = createContext(null);

const RATE_PER_HOUR = 36000; // 36,000đ per hour
const RATE_PER_SECOND = RATE_PER_HOUR / 3600; // 10đ per second

export const GameSessionProvider = ({ children }) => {
  const { user, isAuthenticated, updateUserBalance, updateUserStatus, clearSession } = useAuth();
  
  const [sessionInfo, setSessionInfo] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0); // milliseconds
  const [effectiveBalance, setEffectiveBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref để ngăn fetch liên tục
  const lastBalanceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  // Fetch session từ server
  const fetchSession = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const res = await axiosClient.get('/computers/my-session');
      const data = res.data;
      
      // Chỉ update balance nếu thực sự thay đổi để tránh infinite loop
      if (data.balance !== undefined && data.balance !== lastBalanceRef.current) {
        lastBalanceRef.current = data.balance;
        updateUserBalance(data.balance);
      }
      
      if (data.isPlaying) {
        setSessionInfo({
          computer: data.computer,
          sessionStartTime: new Date(data.sessionStartTime),
          ratePerHour: data.ratePerHour,
        });
        setRemainingTime(data.remainingTimeMs);
        setEffectiveBalance(data.effectiveBalance);
      } else {
        setSessionInfo(null);
        setRemainingTime(0);
        setEffectiveBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Lỗi fetch session:', error);
    }
  }, [isAuthenticated, updateUserBalance]);

  // Fetch session khi mount - CHỈ 1 LẦN
  useEffect(() => {
    if (isAuthenticated && user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchSession();
    }
    
    // Reset khi logout
    if (!isAuthenticated) {
      hasFetchedRef.current = false;
      lastBalanceRef.current = null;
    }
  }, [isAuthenticated, user, fetchSession]);

  // Countdown timer - cập nhật mỗi giây
  useEffect(() => {
    if (!sessionInfo) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = Math.max(0, prev - 1000);
        return newTime;
      });
      
      setEffectiveBalance(prev => {
        const newBalance = prev - RATE_PER_SECOND;
        return Math.max(0, newBalance);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionInfo]);

  // Auto-refresh từ server mỗi 60 giây để sync
  useEffect(() => {
    if (!sessionInfo) return;

    const interval = setInterval(fetchSession, 60000);
    return () => clearInterval(interval);
  }, [sessionInfo, fetchSession]);

  // End session
  const endSession = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.post('/computers/end-session');
      
      // Update user state
      if (res.data.newBalance !== undefined) {
        updateUserBalance(res.data.newBalance);
      }
      updateUserStatus('online');
      clearSession();
      
      // Clear session state
      setSessionInfo(null);
      setRemainingTime(0);
      
      return {
        success: true,
        message: res.data.message,
        totalCost: res.data.totalCost,
        elapsedMinutes: res.data.elapsedMinutes,
        newBalance: res.data.newBalance,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi kết thúc phiên',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Format remaining time thành HH:MM:SS
  const formatRemainingTime = () => {
    const totalSeconds = Math.floor(remainingTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const contextValue = {
    sessionInfo,
    remainingTime,
    effectiveBalance,
    isPlaying: !!sessionInfo,
    isLoading,
    ratePerHour: RATE_PER_HOUR,
    formatRemainingTime,
    fetchSession,
    endSession,
  };

  return (
    <GameSessionContext.Provider value={contextValue}>
      {children}
    </GameSessionContext.Provider>
  );
};

export const useGameSession = () => {
  const context = useContext(GameSessionContext);
  if (!context) {
    // Return a safe default when used outside GameSessionProvider
    return {
      sessionInfo: null,
      remainingTime: 0,
      effectiveBalance: 0,
      isPlaying: false,
      isLoading: false,
      ratePerHour: 36000,
      formatRemainingTime: () => '00:00:00',
      fetchSession: async () => {},
      endSession: async () => ({ success: false, message: 'No session provider' }),
    };
  }
  return context;
};
