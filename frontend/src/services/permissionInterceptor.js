/**
 * Permission interceptor for API calls
 * Handles permission errors and logs permission denials
 */

import { logPermissionDenial } from '../utils/permissions';

/**
 * Interceptor function to handle permission errors
 * @param {Object} error - Error from API
 * @param {Object} context - Context with user information
 * @returns {void}
 */
export const handlePermissionError = (error, context = {}) => {
  if (error?.response?.status === 403) {
    const { userId, action, resource } = context;
    const denialMessage = error?.response?.data?.detail || error?.message || 'Permission denied';

    // Log permission denial
    logPermissionDenial({
      userId: userId || 'unknown',
      action: action || 'api_call',
      resource: resource || 'unknown_resource',
      permission: denialMessage,
      reason: denialMessage,
    });

    // You could also emit a custom event or trigger a toast here
    const event = new CustomEvent('permissionDenied', {
      detail: {
        message: denialMessage,
        action,
        resource,
      }
    });
    window.dispatchEvent(event);
  }
};

/**
 * Create an API wrapper that handles permission checks
 * @param {Function} apiCall - API call function
 * @param {Object} options - Options for permission checking
 * @returns {Function}
 */
export const withPermissionCheck = (apiCall, options = {}) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      handlePermissionError(error, options);
      throw error;
    }
  };
};

/**
 * Utility to check if an error is a permission error
 * @param {Error} error
 * @returns {boolean}
 */
export const isPermissionError = (error) => {
  return error?.response?.status === 403;
};

/**
 * Utility to check if an error is an authentication error
 * @param {Error} error
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401;
};

/**
 * Get user-friendly error message
 * @param {Error} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (isPermissionError(error)) {
    return 'You do not have permission to perform this action.';
  }
  if (isAuthError(error)) {
    return 'Your session has expired. Please log in again.';
  }
  return error?.response?.data?.detail || error?.message || 'An error occurred';
};
