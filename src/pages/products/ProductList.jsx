import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

export default function ProductList() {
  const { data: products = [], loading } = useApi('/products');

  const columns = [
    { key: 'image', title: 'Image', render: (row) => (
        <img src={row.image} alt={row.name} className="w-12 h-12 object-cover" />
      ) },
    { key: 'name', title: 'Product Name' },
    { key: 'sku', title: 'SKU' },
    { key: 'category', title: 'Category' },
    { key: 'price', title: 'Price', render: (row) => `$${row.price}` },
    { key: 'stock', title: 'Stock' },
    { key: 'status', title: 'Status' },
    { key: 'actions', title: 'Actions', render: (row) => (
        <Link to={`/products/${row.id}`} className="text-primary hover:underline">Details</Link>
      ) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        <a href="/products/create" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-light">Add Product</a>
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <Table columns={columns} data={products} />
        )}
      </Card>
    </div>
  );
}
