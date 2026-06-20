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
import { serialNumbersApi, productOptions, warehousesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

export default function SerialNumberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: serialNumber, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : serialNumbersApi.get(id)),
    [id]
  );

  const { data: products } = useApi(() => productOptions(), []);
  const { data: warehouses } = useApi(() => warehousesApi.options(), []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (serialNumber) {
      reset({
        serialNumber: serialNumber.serialNumber || '',
        productId: serialNumber.productId || '',
        warehouseId: serialNumber.warehouseId || '',
        status: serialNumber.status || 'in_stock',
        purchaseDate: serialNumber.purchaseDate || '',
        notes: serialNumber.notes || '',
      });
    } else if (isCreate) {
      reset({
        serialNumber: '',
        productId: '',
        warehouseId: '',
        status: 'in_stock',
        purchaseDate: '',
        notes: '',
      });
    }
  }, [serialNumber, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        const created = await serialNumbersApi.create(data);
        addToast({ title: 'Serial number created', type: 'success' });
        refresh();
        navigate(`/serial-numbers/${created.id}`);
      } else {
        await serialNumbersApi.update(id, data);
        addToast({ title: 'Serial number updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !serialNumber) return <p>Serial number not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add Serial Number' : 'Edit Serial Number'}</h2>
        <Link to="/serial-numbers" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="serialNumber" label="Serial Number" error={errors.serialNumber?.message}
              {...register('serialNumber', { required: 'Serial number is required' })} />
            <Select id="productId" label="Product" error={errors.productId?.message}
              options={[{ value: '', label: 'Select product' }, ...(products || [])]}
              {...register('productId', { required: 'Product is required' })} />
            <Select id="warehouseId" label="Warehouse" 
              options={[{ value: '', label: 'Select warehouse' }, ...(warehouses || [])]}
              {...register('warehouseId')} />
            <Select id="status" label="Status"
              options={[
                { value: 'in_stock', label: 'In Stock' },
                { value: 'sold', label: 'Sold' },
                { value: 'damaged', label: 'Damaged' },
                { value: 'returned', label: 'Returned' },
              ]}
              {...register('status')} />
            <Input id="purchaseDate" label="Purchase Date" type="date"
              {...register('purchaseDate')} />
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                {...register('notes')}
                rows="3"
                placeholder="Serial number notes"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create Serial Number' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/serial-numbers')}>Cancel</Button>
          </div>
        </form>
      </Card>

      {!isCreate && serialNumber && (
        <Card title="Serial Number Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Serial Number</p>
              <p className="font-mono font-medium">{serialNumber.serialNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Product</p>
              <p className="font-medium">{serialNumber.productName}</p>
            </div>
            <div>
              <p className="text-gray-600">Warehouse</p>
              <p className="font-medium">{serialNumber.warehouseName || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <Badge variant={serialNumber.status === 'in_stock' ? 'success' : serialNumber.status === 'sold' ? 'primary' : 'warning'}>
                {serialNumber.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-gray-600">Purchase Date</p>
              <p className="font-medium">{serialNumber.purchaseDate ? formatDate(serialNumber.purchaseDate) : '-'}</p>
            </div>
            {serialNumber.notes && (
              <div className="md:col-span-2">
                <p className="text-gray-600">Notes</p>
                <p className="font-medium">{serialNumber.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
