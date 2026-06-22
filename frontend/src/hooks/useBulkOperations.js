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
   * @param {string} entityType - Type of entity (products, customers, etc.)
   * @param {array} updates - Array of {id, updates} objects
   * @param {function} onProgress - Callback with progress updates
   */
  const bulkUpdate = useCallback(
    async (entityType, updates, onProgress = null) => {
      if (selectedIds.size === 0) {
        setBulkError('No items selected');
        return false;
      }

      try {
        setBulkLoading(true);
        setBulkError(null);
        setBulkProgress({ completed: 0, total: selectedIds.size });

        const response = await apiClient.post(
          '/bulk/update?entity_type=' + entityType,
          updates || Array.from(selectedIds).map((id) => ({ id, updates: {} }))
        );

        setBulkProgress({ completed: selectedIds.size, total: selectedIds.size });
        onProgress?.({ completed: selectedIds.size, total: selectedIds.size });
        
        setSelectedIds(new Set());
        return response.data;
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
    async (entityType, onProgress = null) => {
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

        const response = await apiClient.post('/bulk/delete', {
          ids: Array.from(selectedIds),
          entity_type: entityType,
        });

        setBulkProgress({ completed: selectedIds.size, total: selectedIds.size });
        onProgress?.({ completed: selectedIds.size, total: selectedIds.size });
        
        setSelectedIds(new Set());
        return response.data;
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
    async (entityType, format = 'json') => {
      if (selectedIds.size === 0) {
        setBulkError('No items selected');
        return false;
      }

      try {
        setBulkLoading(true);
        setBulkError(null);

        const response = await apiClient.post('/bulk/export', {
          ids: Array.from(selectedIds),
          entity_type: entityType,
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

  /**
   * Get bulk operation stats
   */
  const getStats = useCallback(async (entityType = null) => {
    try {
      const params = entityType ? `?entity_type=${entityType}` : '';
      const response = await apiClient.get(`/bulk/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bulk stats:', error);
      return null;
    }
  }, []);

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
    getStats,
  };
};
