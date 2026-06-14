import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { suppliersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function SupplierList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => suppliersApi.list({ search, page, pageSize: 8 }),
    [version, search, page]
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const openCreate = () => {
    setEditItem(null);
    reset({ name: '', email: '', phone: '', address: '', contactPerson: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    reset(item);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editItem) {
        await suppliersApi.update(editItem.id, data);
        addToast({ title: 'Supplier updated', type: 'success' });
      } else {
        await suppliersApi.create(data);
        addToast({ title: 'Supplier created', type: 'success' });
      }
      setModalOpen(false);
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
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

      <Card>
        {loading ? <Loader /> : (
          <>
            {result?.data?.length === 0 ? (
              <EmptyState type="default" action={<Button onClick={openCreate}>Add Supplier</Button>} />
            ) : (
              <>
                <Table columns={columns} data={result?.data || []} />
                {result?.pagination?.totalPages > 1 && (
                  <Pagination current={result.pagination.page} total={result.pagination.totalPages} onPageChange={setPage} />
                )}
              </>
            )}
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label="Company Name" error={errors.name?.message}
            {...register('name', { required: 'Name is required' })} />
          <Input id="contactPerson" label="Contact Person" {...register('contactPerson')} />
          <Input id="email" label="Email" type="email" error={errors.email?.message}
            {...register('email', { required: 'Email is required' })} />
          <Input id="phone" label="Phone" {...register('phone')} />
          <Input id="address" label="Address" {...register('address')} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Supplier" message="Are you sure you want to delete this supplier?" />
    </div>
  );
}
