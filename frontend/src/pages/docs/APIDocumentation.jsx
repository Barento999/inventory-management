import React, { useState } from 'react';
import { BookOpen, Code2, Copy, CheckCircle } from 'lucide-react';

export default function APIDocumentation() {
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState('auth');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = {
    auth: {
      title: 'Authentication',
      endpoints: [
        {
          method: 'POST',
          path: '/auth/login',
          description: 'User login',
          body: { email: 'user@example.com', password: 'password' },
          response: { access_token: 'token', user: {} },
        },
        {
          method: 'POST',
          path: '/auth/register',
          description: 'User registration',
          body: { email: 'user@example.com', password: 'password', name: 'John' },
          response: { id: 1, email: 'user@example.com', name: 'John' },
        },
      ],
    },
    products: {
      title: 'Products',
      endpoints: [
        {
          method: 'GET',
          path: '/products',
          description: 'List all products',
          query: { limit: 10, page: 1, search: 'optional' },
          response: [{ id: 1, name: 'Product', price: 99.99, sku: 'SKU001' }],
        },
        {
          method: 'POST',
          path: '/products',
          description: 'Create product',
          body: { name: 'Product', price: 99.99, sku: 'SKU001', category_id: 1 },
          response: { id: 1, name: 'Product', price: 99.99, sku: 'SKU001' },
        },
        {
          method: 'PUT',
          path: '/products/{id}',
          description: 'Update product',
          body: { name: 'Updated Product', price: 109.99 },
          response: { id: 1, name: 'Updated Product', price: 109.99 },
        },
        {
          method: 'DELETE',
          path: '/products/{id}',
          description: 'Delete product',
          response: { message: 'Product deleted successfully' },
        },
      ],
    },
    bulk: {
      title: 'Bulk Operations',
      endpoints: [
        {
          method: 'POST',
          path: '/bulk/update',
          description: 'Bulk update entities',
          query: { entity_type: 'products' },
          body: [
            { id: 1, updates: { status: 'Active' } },
            { id: 2, updates: { status: 'Inactive' } },
          ],
          response: { updated_count: 2, total_count: 2, errors: [] },
        },
        {
          method: 'POST',
          path: '/bulk/delete',
          description: 'Bulk delete entities',
          body: { ids: [1, 2, 3], entity_type: 'products' },
          response: { deleted_count: 3, total_count: 3, errors: [] },
        },
        {
          method: 'POST',
          path: '/bulk/export',
          description: 'Bulk export entities',
          body: { ids: [1, 2, 3], entity_type: 'products', format: 'csv' },
          response: { data: [], format: 'csv', count: 3 },
        },
        {
          method: 'GET',
          path: '/bulk/stats',
          description: 'Get bulk operation statistics',
          query: { entity_type: 'products' },
          response: { products: { total_count: 100, last_updated: '2024-06-23' } },
        },
      ],
    },
    uploads: {
      title: 'File Uploads',
      endpoints: [
        {
          method: 'POST',
          path: '/uploads',
          description: 'Upload a file',
          body: 'multipart/form-data',
          response: { id: 1, filename: 'file.pdf', file_size: 1024, url: '/api/uploads/download/1' },
        },
        {
          method: 'GET',
          path: '/uploads',
          description: 'List uploaded files',
          query: { skip: 0, limit: 50 },
          response: [{ id: 1, filename: 'file.pdf', file_size: 1024 }],
        },
        {
          method: 'GET',
          path: '/uploads/download/{id}',
          description: 'Download file',
          response: 'File binary data',
        },
        {
          method: 'DELETE',
          path: '/uploads/{id}',
          description: 'Delete file',
          response: { status: 'success', message: 'File deleted' },
        },
      ],
    },
    reports: {
      title: 'Reports & Analytics',
      endpoints: [
        {
          method: 'POST',
          path: '/reports/custom',
          description: 'Create custom report',
          body: { filters: {}, date_range: { start: '2024-01-01', end: '2024-12-31' } },
          response: { data: [], total: 0, metadata: {} },
        },
        {
          method: 'GET',
          path: '/reports/sales-trend',
          description: 'Get sales trend',
          query: { start_date: '2024-01-01', end_date: '2024-12-31' },
          response: [{ date: '2024-01-01', sales: 1000, revenue: 5000 }],
        },
        {
          method: 'GET',
          path: '/reports/product-performance',
          description: 'Get product performance',
          response: [{ product_id: 1, name: 'Product', sales: 10, revenue: 1000 }],
        },
      ],
    },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">API Documentation</h1>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          Base URL: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">http://localhost:8000/api</code>
        </p>
        <p className="text-sm text-blue-900 dark:text-blue-200 mt-2">
          All requests require an <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Authorization</code> header with Bearer token.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(endpoints).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setExpandedSection(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              expandedSection === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Endpoint Details */}
      <div className="space-y-6">
        {Object.entries(endpoints).map(([key, section]) => (
          expandedSection === key && (
            <div key={key} className="space-y-4">
              <h2 className="text-2xl font-bold">{section.title}</h2>
              
              {section.endpoints.map((endpoint, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded font-bold text-white text-sm ${
                        endpoint.method === 'GET'
                          ? 'bg-blue-600'
                          : endpoint.method === 'POST'
                          ? 'bg-green-600'
                          : endpoint.method === 'PUT'
                          ? 'bg-orange-600'
                          : 'bg-red-600'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="flex-1 text-gray-900 dark:text-white font-mono">
                      {endpoint.path}
                    </code>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {endpoint.description}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                    {endpoint.query && (
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Query Parameters:</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded relative">
                          <code className="text-xs text-gray-700 dark:text-gray-300 block whitespace-pre-wrap break-words">
                            {JSON.stringify(endpoint.query, null, 2)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.query, null, 2))}
                            className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
                          >
                            {copied ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {endpoint.body && endpoint.body !== 'multipart/form-data' && (
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Request Body:</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded relative">
                          <code className="text-xs text-gray-700 dark:text-gray-300 block whitespace-pre-wrap break-words">
                            {typeof endpoint.body === 'string'
                              ? endpoint.body
                              : JSON.stringify(endpoint.body, null, 2)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.body, null, 2))}
                            className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
                          >
                            {copied ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {endpoint.body === 'multipart/form-data' && (
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Request Type:</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                          <code className="text-xs text-gray-700 dark:text-gray-300">
                            Content-Type: multipart/form-data
                          </code>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">Response:</h4>
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded relative">
                        <code className="text-xs text-gray-700 dark:text-gray-300 block whitespace-pre-wrap break-words">
                          {typeof endpoint.response === 'string'
                            ? endpoint.response
                            : JSON.stringify(endpoint.response, null, 2)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(endpoint.response, null, 2))}
                          className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      {/* Error Codes */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Error Codes</h2>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-mono font-bold">400</span>
            <span>Bad Request - Invalid parameters</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-mono font-bold">401</span>
            <span>Unauthorized - Missing or invalid token</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-mono font-bold">403</span>
            <span>Forbidden - Insufficient permissions</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-mono font-bold">404</span>
            <span>Not Found - Resource not found</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-mono font-bold">500</span>
            <span>Internal Server Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}
