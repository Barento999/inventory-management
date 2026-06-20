import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { categoriesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function CategoryList() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => categoriesApi.list({ search, page, pageSize: 8 }),
    [version, search, page]
  );

  const openCreate = () => {
    navigate('/categories/create');
  };

  const openEdit = (cat) => {
    navigate(`/categories/${cat.id}`);
  };

  const handleDelete = async () => {
    try {
      await categoriesApi.delete(deleteId);
      addToast({ title: 'Category deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'name', title: 'Name', render: (row) => (
      <Link to={`/categories/${row.id}`} className="text-primary hover:underline">{row.name}</Link>
    ) },
    { key: 'description', title: 'Description' },
    { key: 'productCount', title: 'Products' },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => openEdit(row)} className="text-primary hover:underline text-sm">Edit</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories"
        subtitle="Organize products into categories"
        action={<Button onClick={openCreate}>Add Category</Button>}
      />

      <FilterBar>
        <Input id="search" placeholder="Search categories..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </FilterBar>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={result?.data || []} />
            {result?.pagination?.totalPages > 1 && (
              <Pagination current={result.pagination.page} total={result.pagination.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure? Categories with products cannot be deleted."
      />
    </div>
  );
}
