import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BulkActions from '../../components/ui/BulkActions';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useApi } from '../../hooks/useApi';
import { salesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';

export default function SaleList() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: result, loading, reload } = useApi(
    () => salesApi.list({ search, status, page, pageSize: 10 }),
    [version, search, status, page]
  );

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
    const headers = ['id', 'customerName', 'total', 'status', 'expectedDeliveryDate'];
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

  const columns = [
    { key: 'id', title: 'Order #', render: (row) => `#${row.id}` },
    { key: 'customerName', title: 'Customer' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'delivered' ? 'success' : row.status === 'cancelled' ? 'danger' : 'warning'}>
        {row.status}
      </Badge>
    ) },
    { key: 'expectedDeliveryDate', title: 'Expected Delivery', render: (row) => formatDate(row.expectedDeliveryDate) },
    { key: 'createdAt', title: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => navigate(`/sales/${row.id}`)} className="text-primary hover:underline text-sm">View</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sales Orders"
        subtitle="Manage customer sales"
        action={<Button onClick={() => navigate('/sales/create')}>Create Order</Button>}
      />

      <FilterBar>
        <Input
          id="search"
          placeholder="Search order..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Select
          id="status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </FilterBar>

      <BulkActions
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        entityType="sales"
      />

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table
              columns={columns}
              data={result?.data || []}
              selectable
              onSelectChange={setSelectedIds}
            />
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

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Sales Order"
        message="Are you sure you want to delete this sales order?"
      />
    </div>
  );
}
