import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { quotesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function QuoteList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [convertId, setConvertId] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => quotesApi.list({ status, page, pageSize: 10 }),
    [version, status, page]
  );

  const handleDelete = async () => {
    try {
      await quotesApi.delete(deleteId);
      addToast({ title: 'Quote deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleConvert = async () => {
    try {
      await quotesApi.convertToSale(convertId);
      addToast({ title: 'Quote converted to sale', type: 'success' });
      refresh();
      reload();
      setConvertId(null);
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'id', title: 'Quote #', render: (row) => `#${row.id}` },
    { key: 'customerName', title: 'Customer' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'validUntil', title: 'Valid Until' },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'sent' ? 'primary' : row.status === 'accepted' ? 'success' : row.status === 'converted' ? 'success' : 'default'}>
        {row.status}
      </Badge>
    ) },
    { key: 'createdAt', title: 'Created', render: (row) => formatDateTime(row.createdAt) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        {row.status === 'draft' && (
          <button type="button" onClick={() => setConvertId(row.id)} className="text-green-600 hover:underline text-sm">Convert</button>
        )}
        <Link to={`/quotes/${row.id}`} className="text-primary hover:underline text-sm">View</Link>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quotes"
        subtitle="Manage customer quotes and estimates"
        action={
          <Link to="/quotes/create">
            <Button>Create Quote</Button>
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
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'converted', label: 'Converted' },
          ]}
        />
      </FilterBar>

      <Card>
        {loading ? <Loader /> : (
          <>
            {result?.data?.length === 0 ? (
              <EmptyState type="documents" action={
                <Link to="/quotes/create">
                  <Button>Create Quote</Button>
                </Link>
              } />
            ) : (
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
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Quote"
        message="Are you sure you want to delete this quote? This cannot be undone."
      />

      <ConfirmDialog
        isOpen={!!convertId}
        onClose={() => setConvertId(null)}
        onConfirm={handleConvert}
        title="Convert to Sale"
        message="Are you sure you want to convert this quote to a sale order?"
      />
    </div>
  );
}
