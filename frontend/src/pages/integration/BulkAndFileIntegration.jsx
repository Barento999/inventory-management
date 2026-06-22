import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useToast } from '../../context/ToastContext';
import FileUploadZone from '../../components/uploads/FileUploadZone';
import BulkCheckbox from '../../components/bulk/BulkCheckbox';

export default function BulkAndFileIntegration() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bulk');

  const {
    selectedIds,
    selectedCount,
    isLoading: bulkLoading,
    error: bulkError,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    bulkUpdate,
    bulkDelete,
    bulkExport,
  } = useBulkOperations();

  const { uploads, uploadFile, uploadMultiple, clearUpload, clearAll } = useFileUpload();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/products?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load products',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleBulkUpdate = async () => {
    const updates = selectedIds.map(id => ({
      id: parseInt(id),
      updates: { status: 'Active' },
    }));
    
    const results = await bulkUpdate('products', updates);
    if (results) {
      addToast({
        title: 'Success',
        description: `${results.updated_count} items updated`,
        type: 'success',
      });
      clearSelection();
      await fetchProducts();
    }
  };

  const handleBulkDelete = async () => {
    const results = await bulkDelete('products');
    if (results) {
      addToast({
        title: 'Success',
        description: `${results.deleted_count} items deleted`,
        type: 'success',
      });
      clearSelection();
      await fetchProducts();
    }
  };

  const handleBulkExport = async () => {
    const results = await bulkExport('products', 'csv');
    if (results) {
      addToast({
        title: 'Success',
        description: 'Data exported successfully',
        type: 'success',
      });
    }
  };

  const handleFileUpload = (uploadResults) => {
    if (uploadResults && uploadResults.length > 0) {
      addToast({
        title: 'Success',
        description: `${uploadResults.length} file(s) uploaded successfully`,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bulk & File Integration</h1>
        <button
          onClick={fetchProducts}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          Bulk Operations
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'upload'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          File Upload
        </button>
      </div>

      {/* Bulk Operations Tab */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleBulkUpdate}
              disabled={selectedCount === 0 || bulkLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update ({selectedCount})
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedCount === 0 || bulkLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete ({selectedCount})
            </button>
            <button
              onClick={handleBulkExport}
              disabled={selectedCount === 0 || bulkLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV ({selectedCount})
            </button>
            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error Message */}
          {bulkError && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{bulkError}</p>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <BulkCheckbox
                        checked={selectedIds.length === products.length && products.length > 0}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < products.length}
                        onChange={() => toggleSelectAll(products.map(p => p.id))}
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">SKU</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Name</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedIds.includes(product.id) ? 'bg-blue-50 dark:bg-blue-900' : ''
                      }`}
                    >
                      <td className="w-12 px-4 py-3">
                        <BulkCheckbox
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        ${product.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        {product.stock || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <FileUploadZone
            endpoint="/uploads"
            multiple={true}
            maxSize={50 * 1024 * 1024}
            onUploadComplete={handleFileUpload}
            additionalData={{ related_entity: 'products' }}
          />

          {/* Upload Progress */}
          {Object.keys(uploads).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-bold mb-4">Upload Progress</h3>
              <div className="space-y-3">
                {Object.entries(uploads).map(([fileId, upload]) => (
                  <div key={fileId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {upload.status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {upload.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        {upload.status === 'uploading' && (
                          <Upload className="w-4 h-4 text-blue-600 animate-pulse" />
                        )}
                        <span className="font-medium text-sm">{upload.name}</span>
                      </div>
                      {upload.status === 'uploading' && (
                        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => clearUpload(fileId)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={clearAll}
                className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
