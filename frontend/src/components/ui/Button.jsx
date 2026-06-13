import React from 'react';

export default function Button({ children, className = '', variant = 'primary', size = 'md', disabled, onClick, type = 'button' }) {
  const base = 'inline-flex items-center justify-center rounded font-medium focus:outline-none transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-primary hover:bg-primary/10',
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const classes = `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;
  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
