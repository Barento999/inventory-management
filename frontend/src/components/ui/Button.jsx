import React from 'react';

export default function Button({ children, className = '', variant = 'primary', size = 'md', disabled, onClick, type = 'button' }) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium focus:outline-none transition-all duration-200';
  const variants = {
    primary: 'bg-gradient-primary text-white shadow-soft hover:shadow-medium hover:scale-105',
    secondary: 'bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text border border-gray-200 dark:border-dark-border shadow-soft hover:shadow-medium hover:scale-105',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-soft hover:shadow-medium hover:scale-105',
    ghost: 'bg-transparent text-primary hover:bg-primary/10',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const classes = `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;
  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
