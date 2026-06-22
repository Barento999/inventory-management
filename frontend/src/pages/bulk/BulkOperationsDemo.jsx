import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import BulkActionBar from '../../components/bulk/BulkActionBar';
import BulkCheckbox from '../../components/bulk/BulkCheckbox';
import UndoRedoBar from '../../components/ui/UndoRedoBar';

export default function BulkOperationsDemo() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    selectedIds,
    selectedCount,
    isLoading: bulkLoading,
    error: bulkError,
    progress: bulkProgress,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    bulkUpdate,
    bulkDelete,
    bulkExport,
  } = useBulkOperations();

  const {
    state: historyState,
    setState: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo(items);

  // Sync history with items state
  useEffect(() => {
    setHistoryState(items);
  }, [items, setHistoryState]);

  // Undo/redo triggers history state
  useEffect(() => {
    setItems(historyState);
  }, [historyState]);

  useKeyboardShortcuts({
    undo,
    redo,
    escape: clearSelection,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      const response = await apiClient.get('/products', { params: { limit: 100 } });
      const data = (response.data || []).slice(0, 20);
      setItems(data);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load items',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleBulkUpdate = async () => {
    // Create update payload with field changes
    const updates = selectedIds.map(id => ({
      id,
      updates: { status: 'Active' } // Example: update status to Active
    }));
    
    const results = await bulkUpdate('products', updates);
    if (results) {
      addToast({
        title: 'Bulk Update Complete',
        description: `${results.updated_count} updated, ${results.errors.length} errors`,
        type: results.updated_count > 0 ? 'success' : 'error',
      });
      if (results.errors.length > 0) {
        addToast({
          title: 'Errors',
          description: results.errors.join(', '),
          type: 'error',
        });
      }
      await fetchItems();
    }
  };

  const handleBulkDelete = async () => {
    const results = await bulkDelete('products');
    if (results) {
      addToast({
        title: 'Bulk Delete Complete',
        description: `${results.deleted_count} deleted, ${results.errors.length} errors`,
        type: results.deleted_count > 0 ? 'success' : 'error',
      });
      if (results.errors.length > 0) {
        addToast({
          title: 'Errors',
          description: results.errors.join(', '),
          type: 'error',
        });
      }
      await fetchItems();
    }
  };

  const handleBulkExport = async () => {
    const results = await bulkExport('products', 'csv');
    if (results) {
      addToast({
        title: 'Export Complete',
        description: `Exported ${results.count} items`,
        type: 'success',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bulk Operations Demo</h1>
        <UndoRedoBar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          ✨ Features: Select items with checkboxes, use bulk action bar at bottom, keyboard shortcuts (Ctrl+Z for undo, Ctrl+Shift+Z for redo, Esc to clear)
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-4 py-3">
                  <BulkCheckbox
                    checked={selectedIds.length === items.length && items.length > 0}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                    onChange={() => toggleSelectAll(items.map(i => i.id))}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Name</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Price</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Stock</th>
                <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedIds.includes(item.id)
                      ? 'bg-blue-50 dark:bg-blue-900'
                      : ''
                  }`}
                >
                  <td className="w-12 px-4 py-3">
                    <BulkCheckbox
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    ${item.price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    {item.stock || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {item.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        isLoading={bulkLoading}
        error={bulkError}
        progress={bulkProgress}
        onUpdate={handleBulkUpdate}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onClear={clearSelection}
        actions={['update', 'delete', 'export']}
      />
    </div>
  );
}
