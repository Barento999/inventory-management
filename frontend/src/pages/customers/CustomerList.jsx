import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BulkActions from '../../components/ui/BulkActions';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { customersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function CustomerList() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: result, loading, reload } = useApi(
    () => customersApi.list({ search, page, pageSize: 8 }),
    [version, search, page]
  );

  const openCreate = () => {
    navigate('/customers/create');
  };

  const openEdit = (item) => {
    navigate(`/customers/${item.id}`);
  };

  const handleDelete = async () => {
    try {
      await customersApi.delete(deleteId);
      addToast({ title: 'Customer deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      for (const id of ids) {
        await customersApi.delete(id);
      }
      addToast({ title: `${ids.length} customers deleted`, type: 'success' });
      setSelectedIds([]);
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleBulkExport = async (ids) => {
    const customers = (result?.data || []).filter(c => ids.includes(c.id));
    const headers = ['id', 'name', 'email', 'phone', 'address', 'orderCount'];
    const rows = customers.map(c => headers.map(h => c[h]));
    const csv = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Customers exported', type: 'success' });
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: 'Phone' },
    { key: 'address', title: 'Address' },
    { key: 'orderCount', title: 'Orders' },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => openEdit(row)} className="text-primary hover:underline text-sm">Edit</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Customers" subtitle="Manage customer accounts"
        action={<Button onClick={openCreate}>Add Customer</Button>} />

      <FilterBar>
        <Input id="search" placeholder="Search customers..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </FilterBar>

      <BulkActions
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        entityType="customers"
      />

      <Card>
        {loading ? <Loader /> : (
          <>
            {result?.data?.length === 0 ? (
              <EmptyState type="customers" action={<Button onClick={openCreate}>Add Customer</Button>} />
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

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Customer" message="Are you sure you want to delete this customer?" />
    </div>
  );
}
