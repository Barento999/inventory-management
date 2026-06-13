import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { useApi } from '../../hooks/useApi';

export default function ProductDetails() {
  const { id } = useParams();
  const { data: product, loading } = useApi(`/products/${id}`);

  if (loading) return <Loader />;
  if (!product) return <p>Product not found.</p>;

  return (
    <Card title={product.name}
      className="max-w-3xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <img src={product.image} alt={product.name} className="w-full h-auto rounded" />
        <div>
          <p><strong>SKU:</strong> {product.sku}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
          <p><strong>Status:</strong> {product.status}</p>
        </div>
      </div>
    </Card>
  );
}
