import React from 'react';
import ThemeProvider from './context/ThemeContext';
import ToastProvider from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataRefreshProvider } from './context/DataRefreshContext';
import AppRoutes from './routes';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataRefreshProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </DataRefreshProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
