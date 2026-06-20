import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { salesApi, customersApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, Trash2 } from 'lucide-react';

export default function SaleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [statusAction, setStatusAction] = useState(null);
  const [loading2, setLoading2] = useState(false);

  const { data: sale, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : salesApi.get(id)),
    [id]
  );

  const { data: customers } = useApi(() => customersApi.options(), []);
  const { data: products } = useApi(() => productOptions(), []);

  const { control, register, handleSubmit, reset, getValues, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      customerId: '',
      orderNumber: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      notes: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (sale) {
      reset({
        customerId: sale.customerId || '',
        orderNumber: sale.orderNumber || '',
        orderDate: sale.orderDate || '',
        expectedDeliveryDate: sale.expectedDeliveryDate || '',
        notes: sale.notes || '',
        items: sale.items || [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }],
      });
    }
  }, [sale, reset]);

  const onSubmit = async (data) => {
    if (data.items.length === 0) {
      addToast({ title: 'Add at least one item', type: 'error' });
      return;
    }

    try {
      if (isCreate) {
        const created = await salesApi.create(data);
        addToast({ title: 'Sales order created', type: 'success' });
        refresh();
        navigate(`/sales/${created.id}`);
      } else {
        await salesApi.update(id, data);
        addToast({ title: 'Sales order updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading2(true);
      await salesApi.updateStatus(id, newStatus);
      addToast({ title: `Status updated to ${newStatus}`, type: 'success' });
      refresh();
      setStatusAction(null);
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    } finally {
      setLoading2(false);
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !sale) return <p>Sales order not found.</p>;

  const items = watch('items');
  const calculateLineTotal = (idx) => {
    const qty = parseFloat(getValues(`items.${idx}.quantity`) || 0);
    const price = parseFloat(getValues(`items.${idx}.unitPrice`) || 0);
    const discount = parseFloat(getValues(`items.${idx}.discount`) || 0);
    const subtotal = qty * price;
    return subtotal - discount;
  };

  const subtotal = items.reduce((sum, _, idx) => sum + calculateLineTotal(idx), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Sales Order {!isCreate && `#${sale?.id}`}</h2>
        <Link to="/sales" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      {!isCreate && sale && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant={sale.status === 'delivered' ? 'success' : sale.status === 'cancelled' ? 'danger' : 'warning'}>
              {sale.status}
            </Badge>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold">{formatCurrency(sale.total)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{formatDate(sale.createdAt)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Expected Delivery</p>
            <p className="font-medium">{sale.expectedDeliveryDate ? formatDate(sale.expectedDeliveryDate) : '-'}</p>
          </Card>
        </div>
      )}

      <Card title="Sales Order Details">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select id="customerId" label="Customer" error={errors.customerId?.message}
              options={[{ value: '', label: 'Select customer' }, ...(customers || [])]}
              disabled={!isCreate}
              {...register('customerId', { required: 'Customer is required' })} />
            <Input id="orderNumber" label="Order Number" error={errors.orderNumber?.message}
              disabled={!isCreate}
              {...register('orderNumber', { required: 'Order number is required' })} />
            <Input id="orderDate" label="Order Date" type="date"
              {...register('orderDate')} />
          </div>

          <Input id="expectedDeliveryDate" label="Expected Delivery" type="date"
            {...register('expectedDeliveryDate')} />

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Sales order notes"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Card>

      <Card title="Line Items">
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="border p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-6 gap-2 items-end">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Product</label>
                  <Controller
                    control={control}
                    name={`items.${idx}.productId`}
                    rules={{ required: 'Product is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select product</option>
                        {products?.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Qty</label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${idx}.quantity`, { min: 1 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${idx}.unitPrice`, { min: 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${idx}.discount`, { min: 0 })}
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Total</p>
                    <p className="py-2 font-semibold">
                      {formatCurrency(calculateLineTotal(idx))}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, discount: 0 })}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isCreate ? 'Create Sales Order' : 'Save Changes'}
        </Button>
        {!isCreate && sale?.status === 'draft' && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStatusAction('confirmed')}
          >
            Confirm Order
          </Button>
        )}
        {!isCreate && sale?.status === 'confirmed' && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStatusAction('shipped')}
          >
            Mark Shipped
          </Button>
        )}
        {!isCreate && sale?.status === 'shipped' && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStatusAction('delivered')}
          >
            Mark Delivered
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={() => navigate('/sales')}>
          Cancel
        </Button>
      </div>

      <ConfirmDialog
        isOpen={!!statusAction}
        onClose={() => setStatusAction(null)}
        onConfirm={() => handleStatusChange(statusAction)}
        title="Update Status"
        message={`Update status to ${statusAction}?`}
        isLoading={loading2}
      />
    </div>
  );
}
