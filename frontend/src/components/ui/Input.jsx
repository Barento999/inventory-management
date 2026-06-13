import React from 'react';

export default function Input({ id, label, type = 'text', error, ...rest }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
      )}
      <input
        id={id}
        type={type}
        className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
