import React from 'react';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { useApi } from '../../hooks/useApi';
import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';

// Mock summary data (fallback if API not ready)
const mockSummary = {
  totalProducts: 128,
  totalSales: 542,
  totalRevenue: 12450,
  lowStockItems: 12,
  totalCustomers: 85,
  totalSuppliers: 7,
};

export default function Dashboard() {
  const { data: summary, loading } = useApi('/summary');
  const stats = summary || mockSummary;

  const chartData = [
    { name: 'Jan', sales: 400 },
    { name: 'Feb', sales: 300 },
    { name: 'Mar', sales: 500 },
    { name: 'Apr', sales: 200 },
    { name: 'May', sales: 600 },
    { name: 'Jun', sales: 700 },
  ];

  const renderChart = (title, dataKey, fill = '#6366F1') => (
    <Card title={title} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="sales" fill={fill} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card title="Total Products">{stats.totalProducts}</Card>
        <Card title="Total Sales">{stats.totalSales}</Card>
        <Card title="Total Revenue">${stats.totalRevenue}</Card>
        <Card title="Low Stock Items">{stats.lowStockItems}</Card>
        <Card title="Customers">{stats.totalCustomers}</Card>
        <Card title="Suppliers">{stats.totalSuppliers}</Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? <Loader /> : renderChart('Monthly Sales', 'sales')}
        {renderChart('Revenue', 'sales', '#10B981')}
        {renderChart('Inventory Trend', 'sales', '#F59E0B')}
      </div>
    </div>
  );
}
