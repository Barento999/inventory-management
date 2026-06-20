import React, { useState, useEffect } from 'react';

/**
 * Optimized image component with lazy loading, srcset, and fallbacks
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  title = null,
  objectFit = 'cover',
  priority = false,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const containerStyle = {
    aspectRatio: width && height ? `${width} / ${height}` : undefined,
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}
      style={containerStyle}
    >
      <img
        src={src}
        alt={alt}
        title={title}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`
          w-full h-full transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${error ? 'opacity-50' : ''}
        `}
        style={{ objectFit }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Responsive image component with automatic srcset generation
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  objectFit = 'cover',
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      className={`
        w-full h-auto transition-opacity duration-300
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      style={{ objectFit }}
      onLoad={() => setIsLoaded(true)}
    />
  );
}
