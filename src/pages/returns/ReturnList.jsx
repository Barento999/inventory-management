import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { returnsApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function ReturnList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => returnsApi.list({ status, page, pageSize: 10 }),
    [version, status, page]
  );

  const handleDelete = async () => {
    try {
      await returnsApi.delete(deleteId);
      addToast({ title: 'Return deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'id', title: 'Return #', render: (row) => `#${row.id}` },
    { key: 'customerName', title: 'Customer' },
    { key: 'saleId', title: 'Sale #', render: (row) => `#${row.saleId}` },
    { key: 'refundAmount', title: 'Refund', render: (row) => formatCurrency(row.refundAmount) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'}>
        {row.status}
      </Badge>
    ) },
    { key: 'createdAt', title: 'Created', render: (row) => formatDateTime(row.createdAt) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Link to={`/returns/${row.id}`} className="text-primary hover:underline text-sm">View</Link>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Returns"
        subtitle="Manage product returns and refunds"
        action={
          <Link to="/returns/create">
            <Button>Create Return</Button>
          </Link>
        }
      />

      <FilterBar>
        <Select
          id="status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
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

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Return"
        message="Are you sure you want to delete this return? This cannot be undone."
      />
    </div>
  );
}
