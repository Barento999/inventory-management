import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { mockLogin, mockRegister } from '../services/mockData';

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
      const userData = await mockLogin(email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      addToast({ title: 'Login successful', type: 'success' });
      navigate('/');
    } catch (err) {
      addToast({ title: err.message || 'Login failed', type: 'error' });
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const userData = await mockRegister(data);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      addToast({ title: 'Registration successful', type: 'success' });
      navigate('/');
    } catch (err) {
      addToast({ title: err.message || 'Register failed', type: 'error' });
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
    addToast({ title: 'Logged out', type: 'info' });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
