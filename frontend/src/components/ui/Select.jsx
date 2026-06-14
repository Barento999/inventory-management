import React from 'react';

export default function Select({ id, label, options = [], error, ...rest }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="mb-1.5 text-sm font-medium text-gray-700 dark:text-dark-text">{label}</label>
      )}
      <select
        id={id}
        className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-dark-border'}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
