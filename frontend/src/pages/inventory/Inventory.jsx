import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { inventoryApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { movementTypeLabel, movementTypeVariant } from '../../utils/status';

export default function Inventory() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [tab, setTab] = useState('levels');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: movements, loading: movLoading, reload: reloadMov } = useApi(
    () => inventoryApi.list({ search, type, page, pageSize: 10 }),
    [version, search, type, page]
  );
  const { data: levels, loading: lvlLoading, reload: reloadLvl } = useApi(
    () => inventoryApi.stockLevels({ search, lowStockOnly }),
    [version, search, lowStockOnly]
  );
  const { data: products } = useApi(() => productOptions(), [version]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: 'in', quantity: 1 },
  });

  const onAdjust = async (data) => {
    try {
      await inventoryApi.adjust({
        productId: data.productId,
        type: data.type,
        quantity: data.type === 'adjustment' ? Number(data.quantity) : Number(data.quantity),
        reason: data.reason,
        reference: data.reference,
      });
      addToast({ title: 'Stock updated', type: 'success' });
      setModalOpen(false);
      reset({ type: 'in', quantity: 1 });
      refresh();
      reloadMov();
      reloadLvl();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const levelColumns = [
    { key: 'name', title: 'Product' },
    { key: 'sku', title: 'SKU' },
    { key: 'category', title: 'Category' },
    { key: 'stock', title: 'Stock', render: (row) => (
      <span className={row.isLowStock ? 'text-red-600 font-semibold' : ''}>{row.stock}</span>
    ) },
    { key: 'reorderLevel', title: 'Reorder At' },
    { key: 'value', title: 'Value', render: (row) => formatCurrency(row.value) },
    { key: 'status', title: '', render: (row) => row.isLowStock ? <Badge variant="warning">Low</Badge> : null },
  ];

  const movementColumns = [
    { key: 'type', title: 'Type', render: (row) => (
      <Badge variant={movementTypeVariant[row.type]}>{movementTypeLabel[row.type]}</Badge>
    ) },
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Change', render: (row) => (
      <span className={row.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
        {row.quantity >= 0 ? '+' : ''}{row.quantity}
      </span>
    ) },
    { key: 'newStock', title: 'New Stock' },
    { key: 'reason', title: 'Reason' },
    { key: 'reference', title: 'Reference' },
    { key: 'createdAt', title: 'Date', render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventory"
        subtitle="Stock levels and movement history"
        action={<Button onClick={() => setModalOpen(true)}>Adjust Stock</Button>}
      />

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['levels', 'movements'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            {t === 'levels' ? 'Stock Levels' : 'Movement Log'}
          </button>
        ))}
      </div>

      <FilterBar>
        <Input id="search" placeholder="Search..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {tab === 'movements' && (
          <Select id="type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
            options={[
              { value: '', label: 'All types' },
              { value: 'in', label: 'Stock In' },
              { value: 'out', label: 'Stock Out' },
              { value: 'adjustment', label: 'Adjustment' },
            ]} />
        )}
        {tab === 'levels' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
            Low stock only
          </label>
        )}
      </FilterBar>

      <Card>
        {tab === 'levels' ? (
          lvlLoading ? <Loader /> : <Table columns={levelColumns} data={levels || []} />
        ) : movLoading ? <Loader /> : (
          <>
            <Table columns={movementColumns} data={movements?.data || []} />
            {movements?.pagination?.totalPages > 1 && (
              <Pagination current={movements.pagination.page} total={movements.pagination.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Adjust Stock">
        <form onSubmit={handleSubmit(onAdjust)} className="space-y-4">
          <Select id="productId" label="Product" error={errors.productId?.message}
            options={[{ value: '', label: 'Select product' }, ...(products || [])]}
            {...register('productId', { required: 'Product is required' })} />
          <Select id="type" label="Movement Type"
            options={[
              { value: 'in', label: 'Stock In' },
              { value: 'out', label: 'Stock Out' },
              { value: 'adjustment', label: 'Adjustment (+/-)' },
            ]}
            {...register('type')} />
          <Input id="quantity" label="Quantity" type="number" error={errors.quantity?.message}
            {...register('quantity', { required: 'Quantity is required' })} />
          <Input id="reason" label="Reason" error={errors.reason?.message}
            {...register('reason', { required: 'Reason is required' })} />
          <Input id="reference" label="Reference (optional)" {...register('reference')} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Apply</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
