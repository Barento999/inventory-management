import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { serialNumbersApi, productOptions, warehousesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from 'react-hook-form';

export default function SerialNumberList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: result, loading, reload } = useApi(
    () => serialNumbersApi.list({ search, productId, status, page, pageSize: 10 }),
    [version, search, productId, status, page]
  );
  const { data: products } = useApi(() => productOptions(), [version]);
  const { data: warehouses } = useApi(() => warehousesApi.options(), [version]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await serialNumbersApi.create(data);
      addToast({ title: 'Serial number added', type: 'success' });
      refresh();
      reload();
      setIsModalOpen(false);
      reset();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'serialNumber', title: 'Serial Number' },
    { key: 'productName', title: 'Product' },
    { key: 'warehouseName', title: 'Warehouse' },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'in_stock' ? 'success' : row.status === 'sold' ? 'primary' : 'warning'}>
        {row.status.replace('_', ' ')}
      </Badge>
    ) },
    { key: 'purchaseDate', title: 'Purchase Date' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Serial Numbers"
        subtitle="Track individual items by serial number"
        action={
          <Button onClick={() => setIsModalOpen(true)}>Add Serial Number</Button>
        }
      />

      <FilterBar>
        <Input
          id="search"
          placeholder="Search serial number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Select
          id="product"
          value={productId}
          onChange={(e) => { setProductId(e.target.value); setPage(1); }}
          options={[{ value: '', label: 'All products' }, ...(products || [])]}
        />
        <Select
          id="status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'in_stock', label: 'In Stock' },
            { value: 'sold', label: 'Sold' },
            { value: 'reserved', label: 'Reserved' },
          ]}
        />
      </FilterBar>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={result?.data || []} />
            {result?.pagination?.totalPages > 1 && (
              <Pagination
                current={result.pagination.page}
                total={result.pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Serial Number">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select id="productId" label="Product" error={errors.productId?.message}
            options={[{ value: '', label: 'Select product' }, ...(products || [])]}
            {...register('productId', { required: 'Product is required' })} />
          <Input id="serialNumber" label="Serial Number" error={errors.serialNumber?.message}
            {...register('serialNumber', { required: 'Serial number is required' })} />
          <Select id="warehouseId" label="Warehouse"
            options={warehouses || []}
            {...register('warehouseId')} />
          <Select id="status" label="Status"
            options={[
              { value: 'in_stock', label: 'In Stock' },
              { value: 'reserved', label: 'Reserved' },
            ]}
            {...register('status')} />
          <Input id="purchaseDate" label="Purchase Date" type="date"
            {...register('purchaseDate')} />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Serial Number'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
