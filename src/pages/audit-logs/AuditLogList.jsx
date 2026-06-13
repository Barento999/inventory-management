import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { auditLogsApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { formatDateTime } from '../../utils/format';

export default function AuditLogList() {
  const { version } = useDataRefresh();
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, loading } = useApi(
    () => auditLogsApi.list({ action, entity, page, pageSize: 20 }),
    [version, action, entity, page]
  );

  const columns = [
    { key: 'timestamp', title: 'Timestamp', render: (row) => formatDateTime(row.timestamp) },
    { key: 'userName', title: 'User' },
    { key: 'action', title: 'Action', render: (row) => (
      <Badge variant={row.action === 'delete' ? 'danger' : row.action === 'create' ? 'success' : 'primary'}>
        {row.action}
      </Badge>
    ) },
    { key: 'entity', title: 'Entity' },
    { key: 'entityId', title: 'Entity ID' },
    { key: 'details', title: 'Details' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all system activities"
      />

      <FilterBar>
        <Select
          id="action"
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All actions' },
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' },
          ]}
        />
        <Select
          id="entity"
          value={entity}
          onChange={(e) => { setEntity(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All entities' },
            { value: 'product', label: 'Product' },
            { value: 'category', label: 'Category' },
            { value: 'customer', label: 'Customer' },
            { value: 'supplier', label: 'Supplier' },
            { value: 'sale', label: 'Sale' },
            { value: 'purchase', label: 'Purchase' },
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
    </div>
  );
}
