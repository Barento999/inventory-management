import React from 'react';

export default function Select({ id, label, options = [], error, ...rest }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
      )}
      <select
        id={id}
        className={`border rounded px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} `}
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
