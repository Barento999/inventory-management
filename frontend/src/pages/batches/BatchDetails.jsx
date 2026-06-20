import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { batchesApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: batch, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : batchesApi.get(id)),
    [id]
  );

  const { data: products } = useApi(() => productOptions(), []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (batch) {
      reset({
        batchNumber: batch.batchNumber || '',
        productId: batch.productId || '',
        quantity: batch.quantity || 0,
        manufactureDate: batch.manufactureDate || '',
        expiryDate: batch.expiryDate || '',
        location: batch.location || '',
        notes: batch.notes || '',
      });
    } else if (isCreate) {
      reset({
        batchNumber: '',
        productId: '',
        quantity: 0,
        manufactureDate: '',
        expiryDate: '',
        location: '',
        notes: '',
      });
    }
  }, [batch, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        const created = await batchesApi.create(data);
        addToast({ title: 'Batch created', type: 'success' });
        refresh();
        navigate(`/batches/${created.id}`);
      } else {
        await batchesApi.update(id, data);
        addToast({ title: 'Batch updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !batch) return <p>Batch not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add Batch' : 'Edit Batch'}</h2>
        <Link to="/batches" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="batchNumber" label="Batch Number" error={errors.batchNumber?.message}
              {...register('batchNumber', { required: 'Batch number is required' })} />
            <Select id="productId" label="Product" error={errors.productId?.message}
              options={[{ value: '', label: 'Select product' }, ...(products || [])]}
              {...register('productId', { required: 'Product is required' })} />
            <Input id="quantity" label="Quantity" type="number" error={errors.quantity?.message}
              {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Minimum 1' } })} />
            <Input id="location" label="Storage Location"
              {...register('location')} />
            <Input id="manufactureDate" label="Manufacture Date" type="date"
              {...register('manufactureDate')} />
            <Input id="expiryDate" label="Expiry Date" type="date"
              {...register('expiryDate')} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                {...register('notes')}
                rows="4"
                placeholder="Batch notes"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create Batch' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/batches')}>Cancel</Button>
          </div>
        </form>
      </Card>

      {!isCreate && batch && (
        <Card title="Batch Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Batch Number</p>
              <p className="font-medium">{batch.batchNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Product</p>
              <p className="font-medium">{batch.productName}</p>
            </div>
            <div>
              <p className="text-gray-600">Quantity</p>
              <p className="font-medium">{batch.quantity}</p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-medium">{batch.location || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Manufacture Date</p>
              <p className="font-medium">{batch.manufactureDate ? formatDate(batch.manufactureDate) : '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Expiry Date</p>
              <p className="font-medium">{batch.expiryDate ? formatDate(batch.expiryDate) : '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <Badge variant={batch.quantity > 0 ? 'success' : 'warning'}>
                {batch.quantity > 0 ? 'In Stock' : 'Empty'}
              </Badge>
            </div>
            {batch.notes && (
              <div className="md:col-span-2">
                <p className="text-gray-600">Notes</p>
                <p className="font-medium">{batch.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
