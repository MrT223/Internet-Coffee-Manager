'use client'; // Bắt buộc đối với Context trong Next.js App Router

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Khuyên dùng cookie để đồng bộ tốt hơn

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user từ LocalStorage khi component mount (chỉ chạy ở client)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = Cookies.get("token") || localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    
    // Lưu vào storage
    Cookies.set("token", newToken, { expires: 1 }); // Cookie hết hạn sau 1 ngày
    localStorage.setItem("token", newToken); // Backup
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      if (token) {
        // Gọi API logout nếu cần (dùng biến môi trường)
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3636/api'}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Lỗi logout server", error);
    } finally {
      // Xóa state và storage
      setToken(null);
      setUser(null);
      Cookies.remove("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Điều hướng về login
      window.location.href = '/login';
    }
  };

  const updateUserBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Giá trị context
  const contextValue = {
    user,
    token,
    login,
    logout,
    updateUserBalance,
    isAuthenticated: !!token,
    isAdmin: user?.role_id === 1,
    isStaff: user?.role_id === 2,
    isUser: user?.role_id === 3,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Export Hook useAuth (Đây là cái mà Navbar đang thiếu)
export const useAuth = () => {
  return useContext(AuthContext);
};