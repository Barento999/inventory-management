import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { batchesApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';

export default function BatchList() {
  const navigate = useNavigate();
  const { version } = useDataRefresh();
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, loading } = useApi(
    () => batchesApi.list({ search, productId, status, page, pageSize: 10 }),
    [version, search, productId, status, page]
  );
  const { data: products } = useApi(() => productOptions(), [version]);

  const columns = [
    { key: 'batchNumber', title: 'Batch Number' },
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Quantity' },
    { key: 'expirationDate', title: 'Expiration Date' },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'in_stock' ? 'success' : 'warning'}>
        {row.status.replace('_', ' ')}
      </Badge>
    ) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => navigate(`/batches/${row.id}`)} className="text-primary hover:underline text-sm">Edit</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Batches"
        subtitle="Track product batches with expiration dates"
        action={
          <Button onClick={() => navigate('/batches/create')}>Add Batch</Button>
        }
      />

      <FilterBar>
        <Input
          id="search"
          placeholder="Search batch number..."
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
            { value: 'expired', label: 'Expired' },
            { value: 'depleted', label: 'Depleted' },
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
    </div>
  );
}
