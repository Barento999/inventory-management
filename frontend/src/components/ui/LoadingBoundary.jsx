import React from 'react';
import Loader from './Loader';
import EmptyState from './EmptyState';

/**
 * Loading boundary component that handles different loading states
 * Useful for data fetching scenarios with loading, error, and empty states
 */
export default function LoadingBoundary({
  loading,
  error,
  data,
  children,
  emptyMessage = 'No data available',
  errorMessage = 'Failed to load data',
  onRetry,
  loadingMessage = 'Loading...',
}) {
  // Loading state
  if (loading) {
    return <Loader message={loadingMessage} fullHeight={false} />;
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <svg className="mx-auto h-12 w-12 opacity-25" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">Error</h3>
        <p className="text-sm text-red-800 dark:text-red-200 mb-4">
          {error.message || errorMessage}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <EmptyState message={emptyMessage} />;
  }

  // Render children
  return <>{children}</>;
}
