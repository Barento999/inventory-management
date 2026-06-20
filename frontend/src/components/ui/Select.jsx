import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Select({ id, label, options = [], error, success, required, helpText, ...rest }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 transition-colors appearance-none ${
            error 
              ? 'border-red-500 focus:ring-red-500 focus:ring-opacity-50' 
              : success 
              ? 'border-green-500 focus:ring-green-500 focus:ring-opacity-50' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-opacity-50'
          } dark:text-gray-100`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-2.5 pointer-events-none">
          {error && <AlertCircle className="w-5 h-5 text-red-500" />}
          {success && !error && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
