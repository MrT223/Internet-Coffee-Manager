import React, { useState } from "react";
import { AuthContext } from "./AuthContext";

const ROLE_ADMIN = 1;
const ROLE_STAFF = 2;
const ROLE_USER = 3;

export const AuthProvider = ({ children }) => {
  const initialToken = localStorage.getItem("token");
  const initialUser = JSON.parse(localStorage.getItem("user"));

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);

  const isAuthenticated = !!token && !!user;

  const isAdmin = user?.role_id === ROLE_ADMIN;
  const isStaff = user?.role_id === ROLE_STAFF;
  const isUser = user?.role_id === ROLE_USER;

  // --- Hàm Login ---
  const login = (newToken, userInfo) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setToken(newToken);
    setUser(userInfo);
  };

  // --- Hàm Logout ---
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const contextValue = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    isAdmin,
    isStaff,
    isUser,
    ROLE_ADMIN,
    ROLE_STAFF,
    ROLE_USER,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
