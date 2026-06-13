import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { usersApi, rolesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function UserList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users, loading, reload } = useApi(() => usersApi.list(), [version]);
  const { data: roles } = useApi(() => rolesApi.list(), [version]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const handleDelete = async () => {
    try {
      await usersApi.delete(deleteId);
      addToast({ title: 'User deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const onSubmit = async (data) => {
    try {
      await usersApi.create(data);
      addToast({ title: 'User created', type: 'success' });
      refresh();
      reload();
      setIsModalOpen(false);
      reset();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role', render: (row) => (
      <Badge variant={row.role === 'admin' ? 'primary' : 'default'}>{row.role}</Badge>
    ) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'warning'}>{row.status}</Badge>
    ) },
    { key: 'company', title: 'Company' },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Link to={`/users/${row.id}`} className="text-primary hover:underline text-sm">Edit</Link>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        subtitle="Manage team members and permissions"
        action={
          <Button onClick={() => setIsModalOpen(true)}>Add User</Button>
        }
      />

      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={users || []} />}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add User">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label="Full Name" error={errors.name?.message}
            {...register('name', { required: 'Name is required' })} />
          <Input id="email" label="Email" type="email" error={errors.email?.message}
            {...register('email', { required: 'Email is required' })} />
          <Input id="password" label="Password" type="password" error={errors.password?.message}
            {...register('password', { required: 'Password is required', minLength: 6 })} />
          <Select id="role" label="Role" error={errors.role?.message}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'staff', label: 'Staff' },
              { value: 'viewer', label: 'Viewer' },
            ]}
            {...register('role', { required: 'Role is required' })} />
          <Select id="status" label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            {...register('status')} />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This cannot be undone."
      />
    </div>
  );
}
