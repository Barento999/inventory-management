import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Hook for handling API errors with proper feedback
 * Provides standardized error handling across the application
 */
export function useApiError() {
  const { addToast } = useToast();
  const [error, setError] = useState(null);

  const handleError = useCallback((err, context = '') => {
    let message = 'An error occurred';
    let type = 'error';

    // Handle different error types
    if (err.response) {
      // API error response
      const status = err.response.status;
      const data = err.response.data;

      switch (status) {
        case 400:
          message = data?.message || 'Invalid request';
          break;
        case 401:
          message = 'Your session has expired. Please log in again.';
          type = 'warning';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          type = 'warning';
          break;
        case 404:
          message = data?.message || 'Resource not found';
          break;
        case 409:
          message = data?.message || 'This resource already exists';
          break;
        case 422:
          message = data?.message || 'Validation error';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          message = data?.message || `HTTP Error ${status}`;
      }
    } else if (err.message === 'Network Error') {
      message = 'Network error. Please check your connection.';
      type = 'warning';
    } else if (err.message) {
      message = err.message;
    }

    const fullMessage = context ? `${context}: ${message}` : message;
    setError(fullMessage);
    addToast({ title: fullMessage, type });

    return { message: fullMessage, type, error: err };
  }, [addToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}

/**
 * Custom hook for async operations with error handling
 */
export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState(immediate ? 'pending' : 'idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { handleError } = useApiError();

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);
      setStatus('success');
      return result;
    } catch (err) {
      const errorInfo = handleError(err);
      setError(errorInfo);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction, handleError]);

  return {
    execute,
    status,
    data,
    error,
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
