import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useApi } from '../../hooks/useApi';
import { dashboardApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { movementTypeLabel, movementTypeVariant } from '../../utils/status';
import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, Settings, TrendingUp, Package, DollarSign, AlertTriangle, Users, Building2, Layout } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const defaultWidgets = [
  { id: 'products', title: 'Products', icon: Package, size: 'small', visible: true },
  { id: 'sales', title: 'Sales', icon: TrendingUp, size: 'small', visible: true },
  { id: 'revenue', title: 'Revenue', icon: DollarSign, size: 'small', visible: true },
  { id: 'lowStock', title: 'Low Stock', icon: AlertTriangle, size: 'small', visible: true },
  { id: 'customers', title: 'Customers', icon: Users, size: 'small', visible: true },
  { id: 'suppliers', title: 'Suppliers', icon: Building2, size: 'small', visible: true },
  { id: 'inventoryValue', title: 'Inventory Value', icon: DollarSign, size: 'medium', visible: true },
  { id: 'monthlySales', title: 'Monthly Sales', icon: BarChart, size: 'large', visible: true },
  { id: 'revenueTrend', title: 'Revenue Trend', icon: LineChart, size: 'large', visible: true },
  { id: 'stockMovements', title: 'Recent Stock Movements', icon: Layout, size: 'large', visible: true },
  { id: 'recentSales', title: 'Recent Sales', icon: TrendingUp, size: 'large', visible: true },
  { id: 'categoryDistribution', title: 'Category Distribution', icon: PieChart, size: 'medium', visible: true },
];

export default function Dashboard() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const { data: stats, loading, reload } = useApi(() => dashboardApi.summary(), [version]);

  const handleRefresh = () => {
    refresh();
    reload();
    addToast({ title: 'Dashboard refreshed', type: 'success' });
  };

  const toggleWidget = (widgetId) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w));
  };

  const handleSaveLayout = () => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    setIsCustomizing(false);
    addToast({ title: 'Dashboard layout saved', type: 'success' });
  };

  const handleResetLayout = () => {
    setWidgets(defaultWidgets);
    localStorage.removeItem('dashboardWidgets');
    addToast({ title: 'Dashboard layout reset', type: 'success' });
  };

  if (loading || !stats) return <LoadingSkeleton type="stats" />;

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

  const visibleWidgets = widgets.filter(w => w.visible);
  const smallWidgets = visibleWidgets.filter(w => w.size === 'small');
  const mediumWidgets = visibleWidgets.filter(w => w.size === 'medium');
  const largeWidgets = visibleWidgets.filter(w => w.size === 'large');

  const categoryData = [
    { name: 'Electronics', value: 45 },
    { name: 'Office Supplies', value: 30 },
    { name: 'Furniture', value: 15 },
    { name: 'Packaging', value: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <div className="flex gap-2">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: '365', label: 'Last year' },
            ]}
            className="w-40"
          />
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsCustomizing(!isCustomizing)}>
            <Settings className="w-4 h-4 mr-1" /> {isCustomizing ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {isCustomizing && (
        <Card title="Customize Dashboard">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {widgets.map(widget => (
              <div key={widget.id} className="flex items-center gap-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={widget.visible}
                  onChange={() => toggleWidget(widget.id)}
                  className="rounded"
                />
                <span className="text-sm font-medium">{widget.title}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveLayout}>Save Layout</Button>
            <Button variant="secondary" onClick={handleResetLayout}>Reset</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {smallWidgets.map(widget => {
          const Icon = widget.icon;
          const value = {
            products: stats.totalProducts,
            sales: stats.totalSales,
            revenue: formatCurrency(stats.totalRevenue),
            lowStock: stats.lowStockItems,
            customers: stats.totalCustomers,
            suppliers: stats.totalSuppliers,
          }[widget.id] || 0;
          return (
            <Card key={widget.id} title={widget.title} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-2xl font-bold">{value}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mediumWidgets.map(widget => {
          if (widget.id === 'inventoryValue') {
            return (
              <Card key={widget.id} title={widget.title}>
                <span className="text-3xl font-bold text-primary">{formatCurrency(stats.inventoryValue)}</span>
              </Card>
            );
          }
          if (widget.id === 'categoryDistribution') {
            return (
              <Card key={widget.id} title={widget.title} className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            );
          }
          return null;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {largeWidgets.map(widget => {
          if (widget.id === 'monthlySales') {
            return (
              <Card key={widget.id} title={widget.title} className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            );
          }
          if (widget.id === 'revenueTrend') {
            return (
              <Card key={widget.id} title={widget.title} className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            );
          }
          if (widget.id === 'stockMovements') {
            return (
              <Card key={widget.id} title={widget.title}>
                <Table columns={movementColumns} data={stats.recentMovements} />
              </Card>
            );
          }
          if (widget.id === 'recentSales') {
            return (
              <Card key={widget.id} title={widget.title}>
                <Table columns={saleColumns} data={stats.recentSales} />
              </Card>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
