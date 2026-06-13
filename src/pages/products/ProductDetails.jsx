import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { productsApi, categoryOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: product, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : productsApi.get(id)),
    [id]
  );
  const { data: categories } = useApi(() => categoryOptions(), []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        reorderLevel: product.reorderLevel,
        status: product.status,
        image: product.image,
        description: product.description,
      });
    } else if (isCreate) {
      reset({ status: 'Active', stock: 0, reorderLevel: 10, cost: 0, price: 0 });
    }
  }, [product, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        const created = await productsApi.create(data);
        addToast({ title: 'Product created', type: 'success' });
        refresh();
        navigate(`/products/${created.id}`);
      } else {
        await productsApi.update(id, data);
        addToast({ title: 'Product updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !product) return <p>Product not found.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add Product' : 'Edit Product'}</h2>
        <Link to="/products" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="name" label="Product Name" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <Input id="sku" label="SKU" error={errors.sku?.message}
              {...register('sku', { required: 'SKU is required' })} />
            <Select id="categoryId" label="Category" error={errors.categoryId?.message}
              options={[{ value: '', label: 'Select category' }, ...(categories || [])]}
              {...register('categoryId', { required: 'Category is required' })} />
            <Select id="status" label="Status"
              options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
              {...register('status')} />
            <Input id="price" label="Sell Price" type="number" step="0.01" error={errors.price?.message}
              {...register('price', { required: 'Price is required', min: 0 })} />
            <Input id="cost" label="Cost Price" type="number" step="0.01"
              {...register('cost', { min: 0 })} />
            {isCreate && (
              <Input id="stock" label="Initial Stock" type="number"
                {...register('stock', { min: 0 })} />
            )}
            <Input id="reorderLevel" label="Reorder Level" type="number"
              {...register('reorderLevel', { min: 0 })} />
            <Input id="image" label="Image URL" className="md:col-span-2"
              {...register('image')} />
          </div>
          <Input id="description" label="Description"
            {...register('description')} />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create Product' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/products')}>Cancel</Button>
          </div>
        </form>
      </Card>

      {!isCreate && product && (
        <Card title="Preview">
          <div className="flex gap-4">
            <img src={product.image} alt={product.name} className="w-24 h-24 rounded object-cover" />
            <div className="text-sm space-y-1">
              <p><strong>Current stock:</strong> {product.stock}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Value:</strong> ${(product.stock * product.cost).toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
