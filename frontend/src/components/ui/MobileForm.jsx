import React, { useState, useEffect } from 'react';

/**
 * Mobile-optimized form component
 * Handles touch interactions and mobile-specific UX patterns
 */
export default function MobileForm({ children, onSubmit, loading = false }) {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll for sticky submit button
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 pb-20 md:pb-4"
      noValidate
    >
      <div className="space-y-4">
        {children}
      </div>

      {/* Sticky submit button for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-3 rounded-lg font-medium transition-colors
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Desktop submit button */}
      <div className="hidden md:block">
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-2 rounded-lg font-medium transition-colors
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

/**
 * Mobile-optimized input with larger touch targets
 */
export function MobileInput({ label, ...props }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          px-4 py-3 rounded-lg border
          focus:outline-none focus:ring-2 focus:ring-blue-500
          min-h-12 text-base md:text-sm md:py-2
          ${props.className || ''}
        `}
      />
    </div>
  );
}

/**
 * Mobile-optimized select with larger touch targets
 */
export function MobileSelect({ label, options = [], ...props }) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`
          px-4 py-3 rounded-lg border appearance-none
          focus:outline-none focus:ring-2 focus:ring-blue-500
          min-h-12 text-base md:text-sm md:py-2
          ${props.className || ''}
        `}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
