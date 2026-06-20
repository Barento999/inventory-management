import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { reportsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';

export default function ReportsPage() {
  const { addToast } = useToast();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: reportData, loading, refetch } = useApi(
    () => reportsApi.generate(reportType, { dateRange, startDate, endDate }),
    [reportType, dateRange, startDate, endDate]
  );

  const handleExport = async () => {
    try {
      const data = await reportsApi.exportReport(reportType, { dateRange, startDate, endDate });
      const element = document.createElement('a');
      const file = new Blob([data], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      addToast({ title: 'Report exported successfully', type: 'success' });
    } catch (err) {
      addToast({ title: 'Export failed', type: 'error' });
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business insights and performance metrics"
      />

      <Card title="Report Filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            id="reportType"
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'sales', label: 'Sales Report' },
              { value: 'purchases', label: 'Purchase Report' },
              { value: 'inventory', label: 'Inventory Report' },
              { value: 'revenue', label: 'Revenue Analysis' },
              { value: 'customers', label: 'Customer Analysis' },
              { value: 'suppliers', label: 'Supplier Performance' },
            ]}
          />
          <Select
            id="dateRange"
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'quarter', label: 'Last Quarter' },
              { value: 'year', label: 'Last Year' },
              { value: 'custom', label: 'Custom Range' },
            ]}
          />
          {dateRange === 'custom' && (
            <>
              <Input
                id="startDate"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                id="endDate"
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
          <div className="flex items-end gap-2">
            <Button onClick={() => refetch()} variant="secondary" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={handleExport} size="sm">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card><Loader /></Card>
      ) : reportData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.summary?.totalSales || 0)}</p>
              <p className="text-xs text-green-600 mt-2">↑ {reportData.summary?.salesGrowth || 0}% vs period</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold">{reportData.summary?.totalOrders || 0}</p>
              <p className="text-xs text-blue-600 mt-2">{reportData.summary?.avgOrderValue ? `Avg: ${formatCurrency(reportData.summary.avgOrderValue)}` : '-'}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.summary?.inventoryValue || 0)}</p>
              <p className="text-xs text-orange-600 mt-2">{reportData.summary?.totalItems || 0} items</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-3xl font-bold">{reportData.summary?.activeCustomers || 0}</p>
              <p className="text-xs text-purple-600 mt-2">{reportData.summary?.newCustomers || 0} new</p>
            </Card>
          </div>

          {/* Charts */}
          {reportData.chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reportData.chartData.sales && (
                <Card title="Sales Trend">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.chartData.sales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Sales" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {reportData.chartData.topProducts && (
                <Card title="Top Products">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.chartData.topProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#10b981" name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {reportData.chartData.categories && (
                <Card title="Sales by Category">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.chartData.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.chartData.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {reportData.chartData.inventory && (
                <Card title="Inventory Status">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.chartData.inventory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" name="Items" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}

          {/* Detailed Table */}
          {reportData.details && (
            <Card title="Detailed Data">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {reportData.details.columns?.map((col) => (
                        <th key={col} className="text-left py-2 px-4 font-semibold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.details.rows?.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="py-2 px-4">
                            {typeof val === 'number' && val > 100 ? formatCurrency(val) : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
