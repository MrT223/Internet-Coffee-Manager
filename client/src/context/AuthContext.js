import { createContext } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isStaff: false,
  isUser: false,
});
