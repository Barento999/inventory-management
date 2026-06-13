import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { categoriesApi } from '../../services/api';
import { formatCurrency } from '../../utils/format';

export default function CategoryDetails() {
  const { id } = useParams();
  const { data: category, loading } = useApi(() => categoriesApi.get(id), [id]);

  if (loading) return <Loader className="py-12" />;
  if (!category) return <p>Category not found.</p>;

  const columns = [
    { key: 'name', title: 'Product', render: (row) => (
      <Link to={`/products/${row.id}`} className="text-primary hover:underline">{row.name}</Link>
    ) },
    { key: 'sku', title: 'SKU' },
    { key: 'price', title: 'Price', render: (row) => formatCurrency(row.price) },
    { key: 'stock', title: 'Stock' },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : 'default'}>{row.status}</Badge>
    ) },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link to="/categories" className="text-sm text-primary hover:underline">← Categories</Link>
      </div>
      <Card title={category.name}>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{category.description || 'No description'}</p>
        <p className="text-sm text-gray-500 mb-4">{category.productCount} product(s) in this category</p>
        <Table columns={columns} data={category.products} />
      </Card>
    </div>
  );
}
