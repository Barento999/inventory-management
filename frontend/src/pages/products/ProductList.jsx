import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { productsApi, categoriesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';

export default function ProductList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => productsApi.list({ search, categoryId, status, page, pageSize: 8 }),
    [version, search, categoryId, status, page]
  );
  const { data: categories } = useApi(() => categoriesApi.list({ pageSize: 100 }), [version]);

  const handleDelete = async () => {
    try {
      await productsApi.delete(deleteId);
      addToast({ title: 'Product deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'image', title: 'Image', render: (row) => (
      <img src={row.image} alt={row.name} className="w-10 h-10 object-cover rounded" />
    ) },
    { key: 'name', title: 'Product' },
    { key: 'sku', title: 'SKU' },
    { key: 'category', title: 'Category' },
    { key: 'price', title: 'Price', render: (row) => formatCurrency(row.price) },
    { key: 'stock', title: 'Stock', render: (row) => (
      <span className={row.stock <= row.reorderLevel ? 'text-red-600 font-medium' : ''}>{row.stock}</span>
    ) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : 'default'}>{row.status}</Badge>
    ) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Link to={`/products/${row.id}`} className="text-primary hover:underline text-sm">Edit</Link>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        action={
          <Link to="/products/create">
            <Button>Add Product</Button>
          </Link>
        }
      />

      <FilterBar>
        <Input
          id="search"
          placeholder="Search name or SKU..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Select
          id="category"
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          options={[{ value: '', label: 'All categories' }, ...(categories?.data?.map((c) => ({ value: c.id, label: c.name })) || [])]}
        />
        <Select
          id="status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
        />
      </FilterBar>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={result?.data || []} />
            {result?.pagination?.totalPages > 1 && (
              <Pagination
                current={result.pagination.page}
                total={result.pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
      />
    </div>
  );
}
