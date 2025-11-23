import React, { createContext, useCallback, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout } from './api/auth';

export const AuthContext = createContext({
  token: null,
  member: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [member, setMember] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = window.localStorage.getItem('authToken');
    const storedMember = window.localStorage.getItem('authMember');

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedMember) {
      try {
        const parsed = JSON.parse(storedMember);
        setMember(parsed);
      } catch (error) {
        window.localStorage.removeItem('authMember');
      }
    }
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    const response = await apiLogin(credentials);
    const data = response.data;
    const newToken = data.token;
    const newMember = data.member;

    setToken(newToken);
    setMember(newMember);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('authToken', newToken);
      window.localStorage.setItem('authMember', JSON.stringify(newMember));
    }

    return data;
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Ignore logout errors
    }

    setToken(null);
    setMember(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('authMember');
    }
  }, []);

  const value = {
    token,
    member,
    isAuthenticated: Boolean(token),
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
