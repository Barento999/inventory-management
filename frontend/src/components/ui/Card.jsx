import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl shadow-soft hover:shadow-medium transition-shadow duration-300 border border-gray-100 dark:border-dark-border p-4 md:p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-3">{title}</h3>}
      {children}
    </div>
  );
}
