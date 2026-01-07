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
  const [bookedComputer, setBookedComputer] = useState(null); // Máy đã đặt trước
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
        setBookedComputer(null);
        setSessionInfo({
          computer: data.computer,
          sessionStartTime: new Date(data.sessionStartTime),
          ratePerHour: data.ratePerHour,
        });
        setRemainingTime(data.remainingTimeMs);
        setEffectiveBalance(data.effectiveBalance);
      } else if (data.hasBooking && data.bookedComputer) {
        // User có máy đặt trước nhưng chưa vào chơi
        setSessionInfo(null);
        setBookedComputer(data.bookedComputer);
        setRemainingTime(0);
        setEffectiveBalance(data.balance || 0);
      } else {
        setSessionInfo(null);
        setBookedComputer(null);
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

  // Start session (vào chơi từ máy đã đặt trước)
  const startSession = async () => {
    if (!bookedComputer) return { success: false, message: 'Không có máy đặt trước' };
    // user.id từ AuthContext (server trả về id, không phải user_id)
    const userId = user?.id || user?.user_id;
    if (!user || !userId) return { success: false, message: 'Chưa đăng nhập' };
    
    console.log('[StartSession] computerId:', bookedComputer.id, 'userId:', userId);
    
    setIsLoading(true);
    try {
      const res = await axiosClient.post('/computers/start-session', {
        computerId: bookedComputer.id,
        userId: userId,
      });
      
      if (res.data.new_balance !== undefined) {
        updateUserBalance(res.data.new_balance);
      }
      if (res.data.new_status) {
        updateUserStatus(res.data.new_status);
      }
      
      // Refresh session
      setBookedComputer(null);
      await fetchSession();
      
      return {
        success: true,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi bắt đầu phiên',
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
    bookedComputer,
    remainingTime,
    effectiveBalance,
    isPlaying: !!sessionInfo,
    hasBooking: !!bookedComputer,
    isLoading,
    ratePerHour: RATE_PER_HOUR,
    formatRemainingTime,
    fetchSession,
    endSession,
    startSession,
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
