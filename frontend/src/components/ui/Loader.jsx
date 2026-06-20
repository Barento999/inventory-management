import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Loader({ 
  className = '', 
  message = '', 
  size = 'md',
  variant = 'default',
  fullHeight = false 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const containerClasses = `flex flex-col items-center justify-center ${
    fullHeight ? 'min-h-screen' : 'py-8'
  } ${className}`;

  if (variant === 'error') {
    return (
      <div className={containerClasses}>
        <AlertCircle className={`${sizeClasses.lg} text-red-500 mb-3`} />
        <p className="text-sm text-red-600 dark:text-red-400">{message || 'Error loading data'}</p>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <Loader2 className={`${sizeClasses[size]} text-primary animate-spin mb-2`} />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}
