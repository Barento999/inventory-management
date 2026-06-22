import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing bulk operations with progress tracking
 */
export const useBulkOperations = () => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [bulkProgress, setBulkProgress] = useState({ completed: 0, total: 0 });

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback((ids) => {
    if (selectedIds.size === ids.length && selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  }, [selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Perform bulk update on selected items
   * @param {string} endpoint - API endpoint for bulk operation
   * @param {object} payload - Data to send in request
   * @param {function} onProgress - Callback with progress updates
   */
  const bulkUpdate = useCallback(
    async (endpoint, payload = {}, onProgress = null) => {
      if (selectedIds.size === 0) {
        setBulkError('No items selected');
        return false;
      }

      try {
        setBulkLoading(true);
        setBulkError(null);
        setBulkProgress({ completed: 0, total: selectedIds.size });

        const ids = Array.from(selectedIds);
        const results = [];

        for (let i = 0; i < ids.length; i++) {
          try {
            const response = await apiClient.put(
              `${endpoint}/${ids[i]}`,
              payload
            );
            results.push({ id: ids[i], success: true, data: response.data });
            setBulkProgress({ completed: i + 1, total: ids.length });
            onProgress?.({ completed: i + 1, total: ids.length });
          } catch (error) {
            results.push({
              id: ids[i],
              success: false,
              error: error.response?.data?.detail || error.message,
            });
            setBulkProgress({ completed: i + 1, total: ids.length });
            onProgress?.({ completed: i + 1, total: ids.length });
          }
        }

        setSelectedIds(new Set());
        return results;
      } catch (error) {
        const message = error.response?.data?.detail || error.message || 'Bulk operation failed';
        setBulkError(message);
        return false;
      } finally {
        setBulkLoading(false);
      }
    },
    [selectedIds]
  );

  /**
   * Perform bulk delete on selected items
   */
  const bulkDelete = useCallback(
    async (endpoint, onProgress = null) => {
      if (selectedIds.size === 0) {
        setBulkError('No items selected');
        return false;
      }

      if (!window.confirm(`Delete ${selectedIds.size} selected item(s)? This cannot be undone.`)) {
        return false;
      }

      try {
        setBulkLoading(true);
        setBulkError(null);
        setBulkProgress({ completed: 0, total: selectedIds.size });

        const ids = Array.from(selectedIds);
        const results = [];

        for (let i = 0; i < ids.length; i++) {
          try {
            await apiClient.delete(`${endpoint}/${ids[i]}`);
            results.push({ id: ids[i], success: true });
            setBulkProgress({ completed: i + 1, total: ids.length });
            onProgress?.({ completed: i + 1, total: ids.length });
          } catch (error) {
            results.push({
              id: ids[i],
              success: false,
              error: error.response?.data?.detail || error.message,
            });
            setBulkProgress({ completed: i + 1, total: ids.length });
            onProgress?.({ completed: i + 1, total: ids.length });
          }
        }

        setSelectedIds(new Set());
        return results;
      } catch (error) {
        const message = error.response?.data?.detail || error.message || 'Bulk delete failed';
        setBulkError(message);
        return false;
      } finally {
        setBulkLoading(false);
      }
    },
    [selectedIds]
  );

  /**
   * Perform bulk export
   */
  const bulkExport = useCallback(
    async (endpoint, format = 'json') => {
      if (selectedIds.size === 0) {
        setBulkError('No items selected');
        return false;
      }

      try {
        setBulkLoading(true);
        setBulkError(null);

        const ids = Array.from(selectedIds);
        const response = await apiClient.post(`${endpoint}/bulk-export`, {
          ids,
          format,
        });

        return response.data;
      } catch (error) {
        const message = error.response?.data?.detail || error.message || 'Bulk export failed';
        setBulkError(message);
        return false;
      } finally {
        setBulkLoading(false);
      }
    },
    [selectedIds]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isLoading: bulkLoading,
    error: bulkError,
    progress: bulkProgress,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    bulkUpdate,
    bulkDelete,
    bulkExport,
  };
};
