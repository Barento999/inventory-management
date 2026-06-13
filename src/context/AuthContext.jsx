import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { authApi } from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = async ({ email, password }) => {
    try {
      const userData = await authApi.login(email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', userData.token);
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
      const userData = await authApi.register(data);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', userData.token);
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
    localStorage.removeItem('authToken');
    navigate('/login');
    addToast({ title: 'Logged out', type: 'info' });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
