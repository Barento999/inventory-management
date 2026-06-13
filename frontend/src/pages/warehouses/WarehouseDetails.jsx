import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { warehousesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function WarehouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: warehouse, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : warehousesApi.get(id)),
    [id]
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (warehouse) {
      reset({
        name: warehouse.name,
        location: warehouse.location,
        isDefault: warehouse.isDefault,
      });
    } else if (isCreate) {
      reset({ isDefault: false });
    }
  }, [warehouse, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        const created = await warehousesApi.create(data);
        addToast({ title: 'Warehouse created', type: 'success' });
        refresh();
        navigate(`/warehouses/${created.id}`);
      } else {
        await warehousesApi.update(id, data);
        addToast({ title: 'Warehouse updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !warehouse) return <p>Warehouse not found.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add Warehouse' : 'Edit Warehouse'}</h2>
        <Link to="/warehouses" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label="Warehouse Name" error={errors.name?.message}
            {...register('name', { required: 'Name is required' })} />
          <Input id="location" label="Location" error={errors.location?.message}
            {...register('location', { required: 'Location is required' })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" {...register('isDefault')} className="rounded" />
            <label htmlFor="isDefault" className="text-sm">Set as default warehouse</label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create Warehouse' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/warehouses')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
