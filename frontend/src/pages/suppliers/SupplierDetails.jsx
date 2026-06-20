import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { suppliersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: supplier, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : suppliersApi.get(id)),
    [id]
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        zip: supplier.zip || '',
        country: supplier.country || '',
        website: supplier.website || '',
        paymentTerms: supplier.paymentTerms || '',
        notes: supplier.notes || '',
      });
    } else if (isCreate) {
      reset({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        website: '',
        paymentTerms: '',
        notes: '',
      });
    }
  }, [supplier, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        const created = await suppliersApi.create(data);
        addToast({ title: 'Supplier created', type: 'success' });
        refresh();
        navigate(`/suppliers/${created.id}`);
      } else {
        await suppliersApi.update(id, data);
        addToast({ title: 'Supplier updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !supplier) return <p>Supplier not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add Supplier' : 'Edit Supplier'}</h2>
        <Link to="/suppliers" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="name" label="Company Name" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <Input id="contactPerson" label="Contact Person"
              {...register('contactPerson')} />
            <Input id="email" label="Email" type="email" error={errors.email?.message}
              {...register('email', { required: 'Email is required' })} />
            <Input id="phone" label="Phone Number"
              {...register('phone')} />
            <Input id="website" label="Website"
              {...register('website')} />
            <Input id="paymentTerms" label="Payment Terms"
              {...register('paymentTerms')} />
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
                placeholder="Additional supplier information"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create Supplier' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/suppliers')}>Cancel</Button>
          </div>
        </form>
      </Card>

      {!isCreate && supplier && (
        <Card title="Supplier Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Contact Person</p>
              <p className="font-medium">{supplier.contactPerson || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{supplier.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{supplier.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Website</p>
              <p className="font-medium">{supplier.website || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Terms</p>
              <p className="font-medium">{supplier.paymentTerms || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Orders</p>
              <p className="font-medium">{supplier.purchaseCount || 0}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600">Address</p>
              <p className="font-medium">
                {supplier.address}, {supplier.city}, {supplier.state} {supplier.zip}
              </p>
            </div>
            {supplier.notes && (
              <div className="md:col-span-2">
                <p className="text-gray-600">Notes</p>
                <p className="font-medium">{supplier.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
