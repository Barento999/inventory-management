import React from 'react';

/**
 * Responsive container component for consistent spacing and sizing
 * Handles mobile-first responsive design patterns
 */
export default function ResponsiveContainer({
  children,
  maxWidth = 'max-w-7xl',
  padding = true,
  className = '',
}) {
  const paddingClass = padding ? 'px-3 sm:px-4 md:px-6 lg:px-8' : '';

  return (
    <div className={`mx-auto ${maxWidth} ${paddingClass} w-full ${className}`}>
      {children}
    </div>
  );
}

/**
 * Responsive grid component
 */
export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-4',
  className = '',
}) {
  const gridClass = `
    grid
    grid-cols-${columns.xs}
    sm:grid-cols-${columns.sm}
    md:grid-cols-${columns.md}
    lg:grid-cols-${columns.lg}
    xl:grid-cols-${columns.xl}
    ${gap}
  `.replace(/\s+/g, ' ');

  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Responsive flex component
 */
export function ResponsiveFlex({
  children,
  direction = 'col',
  directionMd = 'row',
  gap = 'gap-4',
  justify = 'justify-start',
  align = 'items-start',
  className = '',
}) {
  return (
    <div
      className={`
        flex
        flex-${direction}
        md:flex-${directionMd}
        ${gap}
        ${justify}
        ${align}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Responsive spacer component
 */
export function ResponsiveSpacer({ height = 4, heightMd = 6, className = '' }) {
  return <div className={`h-${height} md:h-${heightMd} ${className}`} />;
}
