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
import { suppliersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function SupplierList() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: result, loading, reload } = useApi(
    () => suppliersApi.list({ search, page, pageSize: 8 }),
    [version, search, page]
  );

  const openCreate = () => {
    navigate('/suppliers/create');
  };

  const openEdit = (item) => {
    navigate(`/suppliers/${item.id}`);
  };

  const handleDelete = async () => {
    try {
      await suppliersApi.delete(deleteId);
      addToast({ title: 'Supplier deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      for (const id of ids) {
        await suppliersApi.delete(id);
      }
      addToast({ title: `${ids.length} suppliers deleted`, type: 'success' });
      setSelectedIds([]);
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleBulkExport = async (ids) => {
    const suppliers = (result?.data || []).filter(s => ids.includes(s.id));
    const headers = ['id', 'name', 'contactPerson', 'email', 'phone', 'address'];
    const rows = suppliers.map(s => headers.map(h => s[h]));
    const csv = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Suppliers exported', type: 'success' });
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'contactPerson', title: 'Contact' },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: 'Phone' },
    { key: 'purchaseCount', title: 'Orders' },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => openEdit(row)} className="text-primary hover:underline text-sm">Edit</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Suppliers" subtitle="Manage vendor relationships"
        action={<Button onClick={openCreate}>Add Supplier</Button>} />

      <FilterBar>
        <Input id="search" placeholder="Search suppliers..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </FilterBar>

      <BulkActions
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        entityType="suppliers"
      />

      <Card>
        {loading ? <Loader /> : (
          <>
            {result?.data?.length === 0 ? (
              <EmptyState type="default" action={<Button onClick={openCreate}>Add Supplier</Button>} />
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
        title="Delete Supplier" message="Are you sure you want to delete this supplier?" />
    </div>
  );
}
