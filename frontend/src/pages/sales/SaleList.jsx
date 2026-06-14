import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BulkActions from '../../components/ui/BulkActions';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { salesApi, customersApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { saleStatusVariant } from '../../utils/status';
import { Plus, Trash2 } from 'lucide-react';

const statusFlow = {
  draft: [{ label: 'Confirm', status: 'confirmed' }],
  confirmed: [{ label: 'Mark Shipped', status: 'shipped' }],
  shipped: [{ label: 'Mark Delivered', status: 'delivered' }],
  delivered: [],
  cancelled: [],
};

export default function SaleList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: result, loading, reload } = useApi(
    () => salesApi.list({ search, status, page, pageSize: 8 }),
    [version, search, status, page]
  );
  const { data: customers } = useApi(() => customersApi.options(), [version]);
  const { data: products } = useApi(() => productOptions(), [version]);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { items: [{ productId: '', quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onCreate = async (data) => {
    try {
      await salesApi.create(data);
      addToast({ title: 'Sale order created', type: 'success' });
      setCreateOpen(false);
      reset({ items: [{ productId: '', quantity: 1, unitPrice: 0 }] });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await salesApi.updateStatus(id, newStatus);
      addToast({ title: `Status updated to ${newStatus}`, type: 'success' });
      refresh();
      reload();
      if (detailItem?.id === id) {
        const updated = await salesApi.get(id);
        setDetailItem(updated);
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await salesApi.delete(deleteId);
      addToast({ title: 'Sale deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      for (const id of ids) {
        await salesApi.delete(id);
      }
      addToast({ title: `${ids.length} sales deleted`, type: 'success' });
      setSelectedIds([]);
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleBulkExport = async (ids) => {
    const sales = (result?.data || []).filter(s => ids.includes(s.id));
    const headers = ['id', 'customerName', 'total', 'status', 'createdAt'];
    const rows = sales.map(s => headers.map(h => s[h]));
    const csv = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Sales exported', type: 'success' });
  };

  const handleBulkEdit = async (ids, field, value) => {
    try {
      for (const id of ids) {
        await salesApi.updateStatus(id, value);
      }
      addToast({ title: `${ids.length} sales updated`, type: 'success' });
      setSelectedIds([]);
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'id', title: 'SO #', render: (row) => `#${row.id}` },
    { key: 'customerName', title: 'Customer' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={saleStatusVariant[row.status]}>{row.status}</Badge>
    ) },
    { key: 'createdAt', title: 'Date', render: (row) => formatDateTime(row.createdAt) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => setDetailItem(row)} className="text-primary hover:underline text-sm">View</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Sales Orders" subtitle="Manage outbound sales and fulfillment"
        action={<Button onClick={() => setCreateOpen(true)}>New Sale</Button>} />

      <FilterBar>
        <Input id="search" placeholder="Search..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Select id="status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]} />
      </FilterBar>

      <BulkActions
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onBulkEdit={handleBulkEdit}
        entityType="sales"
      />

      <Card>
        {loading ? <Loader /> : (
          <>
            {result?.data?.length === 0 ? (
              <EmptyState type="orders" action={<Button onClick={() => setCreateOpen(true)}>New Sale</Button>} />
            ) : (
              <>
                <Table
                  columns={columns}
                  data={result?.data || []}
                  selectable
                  onSelectChange={setSelectedIds}
                />
                {result?.pagination?.totalPages > 1 && (
                  <Pagination current={result.pagination.page} total={result.pagination.totalPages} onPageChange={setPage} />
                )}
              </>
            )}
          </>
        )}
      </Card>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Sales Order">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Select id="customerId" label="Customer" error={errors.customerId?.message}
            options={[{ value: '', label: 'Select customer' }, ...(customers || [])]}
            {...register('customerId', { required: 'Customer is required' })} />
          <Input id="notes" label="Notes" {...register('notes')} />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Line Items</span>
              <Button type="button" size="sm" variant="secondary" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}>
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
                  <Input id={`items.${index}.unitPrice`} label={index === 0 ? 'Price' : ''} type="number" step="0.01"
                    {...register(`items.${index}.unitPrice`, { required: true, min: 0 })} />
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
            <Button type="submit" disabled={isSubmitting}>Create Sale</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title={`Sale #${detailItem?.id}`}>
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Customer:</strong> {detailItem.customerName}</p>
              <p><strong>Status:</strong> <Badge variant={saleStatusVariant[detailItem.status]}>{detailItem.status}</Badge></p>
              <p><strong>Total:</strong> {formatCurrency(detailItem.total)}</p>
              <p><strong>Date:</strong> {formatDateTime(detailItem.createdAt)}</p>
            </div>
            <Table columns={[
              { key: 'productName', title: 'Product' },
              { key: 'quantity', title: 'Qty' },
              { key: 'unitPrice', title: 'Price', render: (r) => formatCurrency(r.unitPrice) },
              { key: 'lineTotal', title: 'Total', render: (r) => formatCurrency(r.lineTotal) },
            ]} data={detailItem.items} />
            <div className="flex gap-2 flex-wrap">
              {(statusFlow[detailItem.status] || []).map((a) => (
                <Button key={a.status} size="sm" onClick={() => updateStatus(detailItem.id, a.status)}>{a.label}</Button>
              ))}
              {detailItem.status !== 'cancelled' && detailItem.status !== 'delivered' && (
                <Button size="sm" variant="danger" onClick={() => updateStatus(detailItem.id, 'cancelled')}>Cancel</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Sale" message="Delete this sales order?" />
    </div>
  );
}
