import React, { createContext, useEffect, useState } from 'react';
import { getStoredToken, setAuthToken, saveToken, removeToken } from '../api/authService';
import API from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          setAuthToken(token);
          const res = await API.get('/auth/me')
          setUser(res.data.user);
        }
      } catch (err) {
        console.log('Auto-login failed:', err?.response?.data || err.message);
        await removeToken();
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const login = async (credentials) => {
    const res = await API.post('/auth/login', credentials);
    const { token, user: userData } = res.data;
    await saveToken(token);
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await API.post('/auth/register', payload);
    const { token, user: userData } = res.data;
    await saveToken(token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
