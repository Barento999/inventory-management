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
import { invoicesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Download } from 'lucide-react';

export default function InvoiceList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [payId, setPayId] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => invoicesApi.list({ status, page, pageSize: 10 }),
    [version, status, page]
  );

  const handleDelete = async () => {
    try {
      await invoicesApi.delete(deleteId);
      addToast({ title: 'Invoice deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleMarkPaid = async () => {
    try {
      await invoicesApi.markAsPaid(payId);
      addToast({ title: 'Invoice marked as paid', type: 'success' });
      refresh();
      reload();
      setPayId(null);
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleDownloadPDF = (invoice) => {
    addToast({ title: 'PDF download started', type: 'success' });
    // PDF generation would be implemented here
  };

  const columns = [
    { key: 'id', title: 'Invoice #', render: (row) => `#${row.id}` },
    { key: 'customerName', title: 'Customer' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'dueDate', title: 'Due Date' },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'paid' ? 'success' : row.status === 'overdue' ? 'danger' : 'warning'}>
        {row.status}
      </Badge>
    ) },
    { key: 'createdAt', title: 'Created', render: (row) => formatDateTime(row.createdAt) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        {row.status !== 'paid' && (
          <button type="button" onClick={() => setPayId(row.id)} className="text-green-600 hover:underline text-sm">Mark Paid</button>
        )}
        <button type="button" onClick={() => handleDownloadPDF(row)} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
          <Download className="w-3 h-3" /> PDF
        </button>
        <Link to={`/invoices/${row.id}`} className="text-primary hover:underline text-sm">View</Link>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        subtitle="Manage customer invoices and payments"
        action={
          <Link to="/invoices/create">
            <Button>Create Invoice</Button>
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
            { value: 'paid', label: 'Paid' },
            { value: 'overdue', label: 'Overdue' },
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
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This cannot be undone."
      />

      <ConfirmDialog
        isOpen={!!payId}
        onClose={() => setPayId(null)}
        onConfirm={handleMarkPaid}
        title="Mark as Paid"
        message="Are you sure you want to mark this invoice as paid?"
      />
    </div>
  );
}
