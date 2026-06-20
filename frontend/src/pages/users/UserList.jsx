import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { usersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function UserList() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);

  const { data: users, loading, reload } = useApi(() => usersApi.list(), [version]);

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
          <Button onClick={() => navigate('/users/create')}>Add User</Button>
        }
      />

      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={users || []} />}
      </Card>

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
