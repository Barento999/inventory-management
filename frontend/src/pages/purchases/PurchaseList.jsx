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
import { purchasesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';

export default function PurchaseList() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: result, loading, reload } = useApi(
    () => purchasesApi.list({ search, status, page, pageSize: 10 }),
    [version, search, status, page]
  );

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

  const handleBulkDelete = async (ids) => {
    try {
      for (const id of ids) {
        await purchasesApi.delete(id);
      }
      addToast({ title: `${ids.length} purchases deleted`, type: 'success' });
      setSelectedIds([]);
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleBulkExport = async (ids) => {
    const purchases = (result?.data || []).filter(p => ids.includes(p.id));
    const headers = ['id', 'supplierName', 'total', 'status', 'expectedDeliveryDate'];
    const rows = purchases.map(p => headers.map(h => p[h]));
    const csv = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchases-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Purchases exported', type: 'success' });
  };

  const columns = [
    { key: 'id', title: 'PO #', render: (row) => `#${row.id}` },
    { key: 'supplierName', title: 'Supplier' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'received' ? 'success' : row.status === 'cancelled' ? 'danger' : 'warning'}>
        {row.status}
      </Badge>
    ) },
    { key: 'expectedDeliveryDate', title: 'Expected Delivery', render: (row) => formatDate(row.expectedDeliveryDate) },
    { key: 'createdAt', title: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => navigate(`/purchases/${row.id}`)} className="text-primary hover:underline text-sm">View</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage supplier purchases"
        action={<Button onClick={() => navigate('/purchases/create')}>Create PO</Button>}
      />

      <FilterBar>
        <Input
          id="search"
          placeholder="Search PO..."
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
            { value: 'submitted', label: 'Submitted' },
            { value: 'received', label: 'Received' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </FilterBar>

      <BulkActions
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        entityType="purchases"
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
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order?"
      />
    </div>
  );
}
