import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing file uploads with progress tracking
 */
export const useFileUpload = () => {
  const [uploads, setUploads] = useState({});
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (
    file,
    endpoint = '/uploads',
    onProgress = null,
    additionalData = {}
  ) => {
    if (!file) {
      setError('No file selected');
      return null;
    }

    const fileId = `${file.name}-${Date.now()}`;
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });

    try {
      setError(null);
      setUploads(prev => ({
        ...prev,
        [fileId]: { name: file.name, progress: 0, status: 'uploading' },
      }));

      const response = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          
          setUploads(prev => ({
            ...prev,
            [fileId]: { ...prev[fileId], progress },
          }));

          onProgress?.(progress);
        },
      });

      setUploads(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'success' },
      }));

      return { fileId, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
      setError(errorMessage);

      setUploads(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'error', error: errorMessage },
      }));

      return null;
    }
  }, []);

  const uploadMultiple = useCallback(async (
    files,
    endpoint = '/uploads',
    onProgress = null,
    additionalData = {}
  ) => {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(
        files[i],
        endpoint,
        (progress) => {
          onProgress?.({
            current: i + 1,
            total: files.length,
            fileProgress: progress,
          });
        },
        additionalData
      );

      if (result) {
        results.push(result);
      }
    }

    return results;
  }, [uploadFile]);

  const clearUpload = useCallback((fileId) => {
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[fileId];
      return newUploads;
    });
  }, []);

  const clearAll = useCallback(() => {
    setUploads({});
    setError(null);
  }, []);

  return {
    uploads,
    error,
    uploadFile,
    uploadMultiple,
    clearUpload,
    clearAll,
  };
};
