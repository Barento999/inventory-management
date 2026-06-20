import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { purchasesApi, suppliersApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, Trash2 } from 'lucide-react';

export default function PurchaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [statusAction, setStatusAction] = useState(null);
  const [loading2, setLoading2] = useState(false);

  const { data: purchase, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : purchasesApi.get(id)),
    [id]
  );

  const { data: suppliers } = useApi(() => suppliersApi.options(), []);
  const { data: products } = useApi(() => productOptions(), []);

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      supplierId: '',
      poNumber: '',
      expectedDeliveryDate: '',
      notes: '',
      items: [{ productId: '', quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (purchase) {
      reset({
        supplierId: purchase.supplierId || '',
        poNumber: purchase.poNumber || '',
        expectedDeliveryDate: purchase.expectedDeliveryDate || '',
        notes: purchase.notes || '',
        items: purchase.items || [{ productId: '', quantity: 1, unitCost: 0 }],
      });
    }
  }, [purchase, reset]);

  const onSubmit = async (data) => {
    if (data.items.length === 0) {
      addToast({ title: 'Add at least one item', type: 'error' });
      return;
    }

    try {
      if (isCreate) {
        const created = await purchasesApi.create(data);
        addToast({ title: 'Purchase order created', type: 'success' });
        refresh();
        navigate(`/purchases/${created.id}`);
      } else {
        await purchasesApi.update(id, data);
        addToast({ title: 'Purchase order updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading2(true);
      await purchasesApi.updateStatus(id, newStatus);
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
  if (!isCreate && !loading && !purchase) return <p>Purchase order not found.</p>;

  const itemsColumns = [
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Qty' },
    { key: 'unitCost', title: 'Unit Cost', render: (row) => formatCurrency(row.unitCost) },
    { key: 'total', title: 'Total', render: (row) => formatCurrency((row.quantity || 0) * (row.unitCost || 0)) },
  ];

  const total = fields.reduce((sum, field, idx) => {
    const quantity = parseFloat(form.getValues(`items.${idx}.quantity`) || 0);
    const cost = parseFloat(form.getValues(`items.${idx}.unitCost`) || 0);
    return sum + (quantity * cost);
  }, 0);

  const form = useForm;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Purchase Order {!isCreate && `#${purchase?.id}`}</h2>
        <Link to="/purchases" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      {!isCreate && purchase && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant={purchase.status === 'received' ? 'success' : purchase.status === 'cancelled' ? 'danger' : 'warning'}>
              {purchase.status}
            </Badge>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold">{formatCurrency(purchase.total)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{formatDate(purchase.createdAt)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Expected Delivery</p>
            <p className="font-medium">{purchase.expectedDeliveryDate ? formatDate(purchase.expectedDeliveryDate) : '-'}</p>
          </Card>
        </div>
      )}

      <Card title="Purchase Order Details">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select id="supplierId" label="Supplier" error={errors.supplierId?.message}
              options={[{ value: '', label: 'Select supplier' }, ...(suppliers || [])]}
              disabled={!isCreate}
              {...register('supplierId', { required: 'Supplier is required' })} />
            <Input id="poNumber" label="PO Number" error={errors.poNumber?.message}
              disabled={!isCreate}
              {...register('poNumber', { required: 'PO number is required' })} />
            <Input id="expectedDeliveryDate" label="Expected Delivery" type="date"
              {...register('expectedDeliveryDate')} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Purchase order notes"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Card>

      <Card title="Line Items">
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-end border p-4 rounded-lg">
              <div className="flex-1">
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
              <div className="w-20">
                <label className="block text-sm font-medium mb-1">Qty</label>
                <Input
                  type="number"
                  min="1"
                  {...register(`items.${idx}.quantity`, { min: 1 })}
                />
              </div>
              <div className="w-28">
                <label className="block text-sm font-medium mb-1">Unit Cost</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`items.${idx}.unitCost`, { min: 0 })}
                />
              </div>
              <div className="w-32">
                <p className="text-sm font-medium mb-1">Total</p>
                <p className="py-2 font-semibold">
                  {formatCurrency(
                    (parseFloat(form.getValues(`items.${idx}.quantity`)) || 0) *
                    (parseFloat(form.getValues(`items.${idx}.unitCost`)) || 0)
                  )}
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
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isCreate ? 'Create Purchase Order' : 'Save Changes'}
        </Button>
        {!isCreate && purchase?.status === 'draft' && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStatusAction('submitted')}
          >
            Submit Order
          </Button>
        )}
        {!isCreate && purchase?.status === 'submitted' && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStatusAction('received')}
          >
            Mark Received
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={() => navigate('/purchases')}>
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
