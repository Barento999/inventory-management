import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded p-4 ${className}`}>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      {children}
    </div>
  );
}
