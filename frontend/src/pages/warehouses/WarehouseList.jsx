import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { warehousesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function WarehouseList() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);

  const { data: warehouses, loading, reload } = useApi(
    () => warehousesApi.list(),
    [version]
  );

  const handleDelete = async () => {
    try {
      await warehousesApi.delete(deleteId);
      addToast({ title: 'Warehouse deleted', type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'location', title: 'Location' },
    { key: 'isDefault', title: 'Default', render: (row) => (
      row.isDefault ? <Badge variant="success">Yes</Badge> : <Badge variant="default">No</Badge>
    ) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => navigate(`/warehouses/${row.id}`)} className="text-primary hover:underline text-sm">Edit</button>
        <button type="button" onClick={() => setDeleteId(row.id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Warehouses"
        subtitle="Manage your warehouse locations"
        action={
          <Button onClick={() => navigate('/warehouses/create')}>Add Warehouse</Button>
        }
      />

      <Card>
        {loading ? <Loader /> : (
          <Table columns={columns} data={warehouses || []} />
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Warehouse"
        message="Are you sure you want to delete this warehouse? This cannot be undone."
      />
    </div>
  );
}
