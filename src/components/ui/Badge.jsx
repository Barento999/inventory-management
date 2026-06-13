import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const colors = {
    default: 'bg-gray-200 text-gray-800',
    primary: 'bg-primary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    danger: 'bg-red-600 text-white',
  };
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors[variant] || colors.default} ${className}`}>{children}</span>
  );
}
