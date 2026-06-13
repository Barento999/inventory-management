import React from 'react';
import ThemeProvider from './context/ThemeContext';
import ToastProvider from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}