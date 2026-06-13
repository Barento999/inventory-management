import React from 'react';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { dashboardApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { movementTypeLabel, movementTypeVariant } from '../../utils/status';
import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const { version } = useDataRefresh();
  const { data: stats, loading } = useApi(() => dashboardApi.summary(), [version]);

  if (loading || !stats) return <Loader className="py-12" />;

  const movementColumns = [
    { key: 'type', title: 'Type', render: (row) => (
      <Badge variant={movementTypeVariant[row.type]}>{movementTypeLabel[row.type]}</Badge>
    ) },
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Qty', render: (row) => (
      <span className={row.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
        {row.quantity >= 0 ? '+' : ''}{row.quantity}
      </span>
    ) },
    { key: 'createdAt', title: 'Date', render: (row) => formatDateTime(row.createdAt) },
  ];

  const saleColumns = [
    { key: 'id', title: 'Order', render: (row) => `#${row.id}` },
    { key: 'customerName', title: 'Customer' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', title: 'Status', render: (row) => <Badge variant="primary">{row.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card title="Products"><span className="text-2xl font-bold">{stats.totalProducts}</span></Card>
        <Card title="Sales"><span className="text-2xl font-bold">{stats.totalSales}</span></Card>
        <Card title="Revenue"><span className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</span></Card>
        <Card title="Low Stock"><span className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</span></Card>
        <Card title="Customers"><span className="text-2xl font-bold">{stats.totalCustomers}</span></Card>
        <Card title="Suppliers"><span className="text-2xl font-bold">{stats.totalSuppliers}</span></Card>
        <Card title="Inventory Value" className="col-span-2">
          <span className="text-2xl font-bold text-primary">{formatCurrency(stats.inventoryValue)}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Monthly Sales" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Revenue Trend" className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Recent Stock Movements">
          <Table columns={movementColumns} data={stats.recentMovements} />
        </Card>
        <Card title="Recent Sales">
          <Table columns={saleColumns} data={stats.recentSales} />
        </Card>
      </div>
    </div>
  );
}
