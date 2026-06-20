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
import { serialNumbersApi, productOptions } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';

export default function SerialNumberList() {
  const navigate = useNavigate();
  const { version } = useDataRefresh();
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, loading } = useApi(
    () => serialNumbersApi.list({ search, productId, status, page, pageSize: 10 }),
    [version, search, productId, status, page]
  );
  const { data: products } = useApi(() => productOptions(), [version]);

  const columns = [
    { key: 'serialNumber', title: 'Serial Number' },
    { key: 'productName', title: 'Product' },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'in_stock' ? 'success' : row.status === 'sold' ? 'primary' : 'warning'}>
        {row.status.replace('_', ' ')}
      </Badge>
    ) },
    { key: 'purchaseDate', title: 'Purchase Date' },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => navigate(`/serial-numbers/${row.id}`)} className="text-primary hover:underline text-sm">Edit</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Serial Numbers"
        subtitle="Track individual items by serial number"
        action={
          <Button onClick={() => navigate('/serial-numbers/create')}>Add Serial Number</Button>
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
    </div>
  );
}
