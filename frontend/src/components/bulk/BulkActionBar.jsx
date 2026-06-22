import React from 'react';
import { Trash2, Edit3, Download, X, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

const BulkActionBar = ({
  selectedCount,
  isLoading,
  error,
  progress,
  onUpdate,
  onDelete,
  onExport,
  onClear,
  actions = ['update', 'delete', 'export'],
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-blue-500 shadow-lg p-4 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {selectedCount}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                item{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Progress */}
            {isLoading && progress.total > 0 && (
              <div className="flex items-center gap-2 ml-4">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {progress.completed} / {progress.total}
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 ml-4 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.includes('update') && (
              <Button
                size="sm"
                variant="outline"
                onClick={onUpdate}
                disabled={isLoading}
                icon={Edit3}
              >
                Update
              </Button>
            )}

            {actions.includes('export') && (
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
                disabled={isLoading}
                icon={Download}
              >
                Export
              </Button>
            )}

            {actions.includes('delete') && (
              <Button
                size="sm"
                variant="danger"
                onClick={onDelete}
                disabled={isLoading}
                icon={Trash2}
              >
                Delete
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={onClear}
              disabled={isLoading}
              icon={X}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
