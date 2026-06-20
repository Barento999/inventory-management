import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { customersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: customer, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : customersApi.get(id)),
    [id]
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
        country: customer.country || '',
        company: customer.company || '',
        notes: customer.notes || '',
      });
    } else if (isCreate) {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        company: '',
        notes: '',
      });
    }
  }, [customer, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        const created = await customersApi.create(data);
        addToast({ title: 'Customer created', type: 'success' });
        refresh();
        navigate(`/customers/${created.id}`);
      } else {
        await customersApi.update(id, data);
        addToast({ title: 'Customer updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !customer) return <p>Customer not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add Customer' : 'Edit Customer'}</h2>
        <Link to="/customers" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="name" label="Customer Name" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <Input id="email" label="Email" type="email" error={errors.email?.message}
              {...register('email', { required: 'Email is required' })} />
            <Input id="phone" label="Phone Number"
              {...register('phone')} />
            <Input id="company" label="Company Name"
              {...register('company')} />
            <Input id="address" label="Address"
              {...register('address')} />
            <Input id="city" label="City"
              {...register('city')} />
            <Input id="state" label="State/Province"
              {...register('state')} />
            <Input id="zip" label="ZIP/Postal Code"
              {...register('zip')} />
            <Input id="country" label="Country"
              {...register('country')} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                {...register('notes')}
                rows="4"
                placeholder="Additional customer information"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create Customer' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>Cancel</Button>
          </div>
        </form>
      </Card>

      {!isCreate && customer && (
        <Card title="Customer Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{customer.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Company</p>
              <p className="font-medium">{customer.company || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Orders</p>
              <p className="font-medium">{customer.orderCount || 0}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600">Address</p>
              <p className="font-medium">
                {customer.address}, {customer.city}, {customer.state} {customer.zip}
              </p>
            </div>
            {customer.notes && (
              <div className="md:col-span-2">
                <p className="text-gray-600">Notes</p>
                <p className="font-medium">{customer.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
