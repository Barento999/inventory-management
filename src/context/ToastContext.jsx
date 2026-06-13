import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, description = '', type = 'info', duration = 5000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
