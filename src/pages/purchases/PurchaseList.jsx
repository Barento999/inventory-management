import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { purchasesApi, suppliersApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { purchaseStatusVariant } from '../../utils/status';
import { Plus, Trash2 } from 'lucide-react';

export default function PurchaseList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => purchasesApi.list({ search, status, page, pageSize: 8 }),
    [version, search, status, page]
  );
  const { data: suppliers } = useApi(() => suppliersApi.options(), [version]);
  const { data: products } = useApi(() => productOptions(), [version]);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { items: [{ productId: '', quantity: 1, unitCost: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onCreate = async (data) => {
    try {
      await purchasesApi.create(data);
      addToast({ title: 'Purchase order created', type: 'success' });
      setCreateOpen(false);
      reset({ items: [{ productId: '', quantity: 1, unitCost: 0 }] });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await purchasesApi.updateStatus(id, newStatus);
      addToast({ title: `Status updated to ${newStatus}`, type: 'success' });
      refresh();
      reload();
      if (detailItem?.id === id) {
        const updated = await purchasesApi.get(id);
        setDetailItem(updated);
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await purchasesApi.delete(deleteId);
      addToast({ title: 'Purchase deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'id', title: 'PO #', render: (row) => `#${row.id}` },
    { key: 'supplierName', title: 'Supplier' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={purchaseStatusVariant[row.status]}>{row.status}</Badge>
    ) },
    { key: 'expectedDate', title: 'Expected', render: (row) => formatDate(row.expectedDate) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => setDetailItem(row)} className="text-primary hover:underline text-sm">View</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  const statusActions = {
    draft: [{ label: 'Mark Ordered', status: 'ordered' }],
    ordered: [{ label: 'Mark Received', status: 'received' }],
    received: [],
    cancelled: [],
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Purchase Orders" subtitle="Manage inbound stock from suppliers"
        action={<Button onClick={() => setCreateOpen(true)}>New Purchase</Button>} />

      <FilterBar>
        <Input id="search" placeholder="Search..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Select id="status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'ordered', label: 'Ordered' },
            { value: 'received', label: 'Received' },
            { value: 'cancelled', label: 'Cancelled' },
          ]} />
      </FilterBar>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={result?.data || []} />
            {result?.pagination?.totalPages > 1 && (
              <Pagination current={result.pagination.page} total={result.pagination.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </Card>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Purchase Order">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Select id="supplierId" label="Supplier" error={errors.supplierId?.message}
            options={[{ value: '', label: 'Select supplier' }, ...(suppliers || [])]}
            {...register('supplierId', { required: 'Supplier is required' })} />
          <Input id="expectedDate" label="Expected Date" type="date" {...register('expectedDate')} />
          <Input id="notes" label="Notes" {...register('notes')} />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Line Items</span>
              <Button type="button" size="sm" variant="secondary" onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })}>
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Select id={`items.${index}.productId`} label={index === 0 ? 'Product' : ''}
                    options={[{ value: '', label: 'Product' }, ...(products || [])]}
                    {...register(`items.${index}.productId`, { required: true })} />
                </div>
                <div className="col-span-3">
                  <Input id={`items.${index}.quantity`} label={index === 0 ? 'Qty' : ''} type="number"
                    {...register(`items.${index}.quantity`, { required: true, min: 1 })} />
                </div>
                <div className="col-span-3">
                  <Input id={`items.${index}.unitCost`} label={index === 0 ? 'Cost' : ''} type="number" step="0.01"
                    {...register(`items.${index}.unitCost`, { required: true, min: 0 })} />
                </div>
                <div className="col-span-1">
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Create PO</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title={`Purchase #${detailItem?.id}`}>
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Supplier:</strong> {detailItem.supplierName}</p>
              <p><strong>Status:</strong> <Badge variant={purchaseStatusVariant[detailItem.status]}>{detailItem.status}</Badge></p>
              <p><strong>Total:</strong> {formatCurrency(detailItem.total)}</p>
              <p><strong>Expected:</strong> {formatDate(detailItem.expectedDate)}</p>
            </div>
            <Table columns={[
              { key: 'productName', title: 'Product' },
              { key: 'quantity', title: 'Qty' },
              { key: 'unitCost', title: 'Cost', render: (r) => formatCurrency(r.unitCost) },
              { key: 'lineTotal', title: 'Total', render: (r) => formatCurrency(r.lineTotal) },
            ]} data={detailItem.items} />
            <div className="flex gap-2 flex-wrap">
              {(statusActions[detailItem.status] || []).map((a) => (
                <Button key={a.status} size="sm" onClick={() => updateStatus(detailItem.id, a.status)}>{a.label}</Button>
              ))}
              {detailItem.status !== 'cancelled' && detailItem.status !== 'received' && (
                <Button size="sm" variant="danger" onClick={() => updateStatus(detailItem.id, 'cancelled')}>Cancel</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Purchase" message="Delete this purchase order?" />
    </div>
  );
}
