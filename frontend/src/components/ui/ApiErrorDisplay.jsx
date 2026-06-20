import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import Button from './Button';

export default function ApiErrorDisplay({ error, onDismiss, onRetry }) {
  if (!error) return null;

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.message) return error.message;
    return 'An error occurred. Please try again.';
  };

  const getErrorDetails = () => {
    if (error.response?.status === 404) return 'Resource not found';
    if (error.response?.status === 401) return 'Your session has expired. Please log in again.';
    if (error.response?.status === 403) return 'You do not have permission to perform this action.';
    if (error.response?.status === 500) return 'Server error. Please try again later.';
    if (error.response?.status >= 400) return `HTTP Error ${error.response.status}`;
    if (!navigator.onLine) return 'No internet connection';
    return 'Unknown error';
  };

  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-medium text-red-900 dark:text-red-100">
            {getErrorDetails()}
          </h3>
          <p className="text-sm text-red-800 dark:text-red-200 mt-1">
            {getErrorMessage()}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {onRetry && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
