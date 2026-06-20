import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { categoriesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';

export default function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: category, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : categoriesApi.get(id)),
    [id]
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || '',
        description: category.description || '',
      });
    } else if (isCreate) {
      reset({
        name: '',
        description: '',
      });
    }
  }, [category, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        const created = await categoriesApi.create(data);
        addToast({ title: 'Category created', type: 'success' });
        refresh();
        navigate(`/categories/${created.id}`);
      } else {
        await categoriesApi.update(id, data);
        addToast({ title: 'Category updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !category) return <p>Category not found.</p>;

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

  if (isCreate) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Category</h2>
          <Link to="/categories" className="text-sm text-primary hover:underline">Back to list</Link>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input id="name" label="Category Name" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                {...register('description')}
                rows="4"
                placeholder="Category description"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/categories')}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{category?.name}</h2>
        <div className="flex gap-2">
          <Button onClick={() => {}} variant="secondary" size="sm">Edit</Button>
          <Link to="/categories" className="text-sm text-primary hover:underline">Back to list</Link>
        </div>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label="Category Name" error={errors.name?.message}
            {...register('name', { required: 'Name is required' })} />
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register('description')}
              rows="4"
              placeholder="Category description"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/categories')}>Cancel</Button>
          </div>
        </form>
      </Card>
      
      <Card title="Products">
        {category?.products && category.products.length > 0 ? (
          <Table columns={columns} data={category.products} />
        ) : (
          <p className="text-gray-500">No products in this category</p>
        )}
      </Card>
    </div>
  );
}
