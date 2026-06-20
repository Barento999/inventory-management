import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function FormFieldGroup({
  label,
  error,
  success,
  required,
  helpText,
  children,
  touched = false,
}) {
  const showError = touched && error;
  const showSuccess = touched && success && !error;

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
        {showError && (
          <AlertCircle className="absolute right-3 top-2.5 w-5 h-5 text-red-500 pointer-events-none" />
        )}
        {showSuccess && (
          <CheckCircle className="absolute right-3 top-2.5 w-5 h-5 text-green-500 pointer-events-none" />
        )}
      </div>

      {showError && (
        <div className="mt-1.5 p-2 bg-red-50 dark:bg-red-950 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {showSuccess && (
        <div className="mt-1.5 p-2 bg-green-50 dark:bg-green-950 rounded flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-600 dark:text-green-400">Field looks good</p>
        </div>
      )}
      
      {helpText && !showError && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
