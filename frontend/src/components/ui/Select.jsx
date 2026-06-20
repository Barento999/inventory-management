import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Select({
  id,
  label,
  options = [],
  error,
  success,
  required,
  helpText,
  disabled = false,
  ...rest
}) {
  const describedByIds = [];
  if (error) describedByIds.push(`${id}-error`);
  if (helpText) describedByIds.push(`${id}-help`);

  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          className={`
            w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 appearance-none
            focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900
            transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:ring-opacity-50'
                : success
                ? 'border-green-500 focus:ring-green-500 focus:ring-opacity-50'
                : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-opacity-50'
            }
            dark:text-gray-100
            text-sm sm:text-base
          `}
          aria-invalid={!!error}
          aria-describedby={describedByIds.length > 0 ? describedByIds.join(' ') : undefined}
          aria-required={required}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-2.5 pointer-events-none">
          {error && <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />}
          {success && !error && <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />}
        </div>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-3 h-3" aria-hidden="true" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p
          id={`${id}-help`}
          className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
    </div>
  );
}
