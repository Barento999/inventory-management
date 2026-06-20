import React from 'react';

export default function Card({
  title,
  titleLevel = 'h3',
  children,
  className = '',
  role = 'region',
  ariaLabel = null,
  footer = null,
  variant = 'default',
}) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outline: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
  };

  const TitleComponent = titleLevel;

  return (
    <article
      role={role}
      aria-label={ariaLabel || title}
      className={`${variantClasses[variant]} shadow rounded-lg p-4 sm:p-5 md:p-6 transition-shadow hover:shadow-md dark:hover:shadow-gray-700 ${className}`}
    >
      {title && (
        <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <TitleComponent className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 m-0">
            {title}
          </TitleComponent>
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </article>
  );
}
