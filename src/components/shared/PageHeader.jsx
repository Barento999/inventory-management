import React from 'react';
import Button from '../ui/Button';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function FilterBar({ children }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {children}
    </div>
  );
}

export function ActionButtons({ onEdit, onDelete, editLabel = 'Edit', deleteLabel = 'Delete' }) {
  return (
    <div className="flex gap-2">
      {onEdit && (
        <button type="button" onClick={onEdit} className="text-primary hover:underline text-sm">
          {editLabel}
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="text-red-600 hover:underline text-sm">
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
