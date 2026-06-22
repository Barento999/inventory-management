import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SearchFilter from '../../components/ui/SearchFilter';
import ExportButton from '../../components/ui/ExportButton';

export default function ProductList() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize,
        search: search || undefined,
      };
      const response = await apiClient.get('/products/', { params });
      setProducts(response.data || []);
      setTotal(response.total || 0);
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

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    
    try {
      setDeleting(id);
      await apiClient.delete(`/products/${id}`);
      addToast({
        title: 'Success',
        description: 'Product deleted',
        type: 'success',
      });
      await fetchProducts();
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to delete product',
        type: 'error',
      });
    } finally {
      setDeleting(null);
    }
  }

  const canCreate = user?.permissions?.includes('products_create');
  const canUpdate = user?.permissions?.includes('products_update');
  const canDelete = user?.permissions?.includes('products_delete');

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
  ];

  const exportColumns = ['sku', 'name', 'price', 'cost', 'stock', 'status'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-4">
          {products.length > 0 && (
            <ExportButton
              data={products}
              filename="products"
              title="Products Export"
              columns={exportColumns}
            />
          )}
          {canCreate && (
            <Link
              to="/products/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Product
            </Link>
          )}
        </div>
      </div>

      <SearchFilter
        searchPlaceholder="Search by SKU, name..."
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        filters={filters}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No products found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">SKU</th>
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-right">Price</th>
                <th className="border p-3 text-right">Cost</th>
                <th className="border p-3 text-right">Stock</th>
                <th className="border p-3 text-center">Status</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border p-3 font-mono text-sm">{product.sku}</td>
                  <td className="border p-3">
                    <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="border p-3 text-right">${product.price?.toFixed(2)}</td>
                  <td className="border p-3 text-right">${product.cost?.toFixed(2)}</td>
                  <td className="border p-3 text-right">{product.stock}</td>
                  <td className="border p-3 text-center">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      product.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="border p-3 text-center space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                    {canUpdate && (
                      <Link
                        to={`/products/${product.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="text-red-600 hover:underline text-sm disabled:opacity-50"
                      >
                        {deleting === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing page {page} of {Math.ceil(total / pageSize)} ({total} total)
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
