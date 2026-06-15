import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { authApi } from '../services/api';
import apiClient from '../services/apiClient';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    if (stored) {
      setUser(JSON.parse(stored));
      if (token) {
        apiClient.setToken(token);
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await authApi.login(email, password);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      apiClient.setToken(response.access_token);
      addToast({ title: 'Login successful', type: 'success' });
      navigate('/');
      return userData;
    } catch (err) {
      addToast({ title: err.message || 'Login failed', type: 'error' });
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const response = await authApi.register(data);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      apiClient.setToken(response.access_token);
      addToast({ title: 'Registration successful', type: 'success' });
      navigate('/');
      return userData;
    } catch (err) {
      addToast({ title: err.message || 'Register failed', type: 'error' });
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    apiClient.setToken(null);
    navigate('/login');
    addToast({ title: 'Logged out', type: 'info' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
