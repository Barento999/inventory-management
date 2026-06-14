import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const renderCardSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      ))}
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </div>
  );

  switch (type) {
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              {renderCardSkeleton()}
            </div>
          ))}
        </div>
      );
    case 'table':
      return renderTableSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'stats':
      return renderStatsSkeleton();
    case 'form':
      return renderFormSkeleton();
    default:
      return renderCardSkeleton();
  }
}
