import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import SalesChart from '../../components/charts/SalesChart';
import InventoryChart from '../../components/charts/InventoryChart';
import CategoryChart from '../../components/charts/CategoryChart';
import MetricCard from '../../components/charts/MetricCard';

export default function EnhancedDashboard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    conversionRate: 0,
  });

  const [chartData, setChartData] = useState({
    salesTrend: [],
    inventoryStatus: [],
    categoryBreakdown: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Fetch metrics
      const metricsResponse = await apiClient.get('/dashboard/metrics', {
        params: { days: dateRange },
      });
      setMetrics(metricsResponse.data || {});

      // Fetch sales trend
      const salesResponse = await apiClient.get('/dashboard/sales-trend', {
        params: { days: dateRange },
      });
      setChartData((prev) => ({
        ...prev,
        salesTrend: salesResponse.data || [],
      }));

      // Fetch inventory status
      const inventoryResponse = await apiClient.get('/dashboard/inventory-status');
      setChartData((prev) => ({
        ...prev,
        inventoryStatus: inventoryResponse.data || [],
      }));

      // Fetch category breakdown
      const categoryResponse = await apiClient.get('/dashboard/category-breakdown');
      setChartData((prev) => ({
        ...prev,
        categoryBreakdown: categoryResponse.data || [],
      }));
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Row 1 */}
      <div>
        <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Orders"
            value={`${metrics.totalSales}`}
            change={12}
            changeType="positive"
            color="blue"
            unit="orders"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue?.toFixed(2) || '0.00'}`}
            change={8}
            changeType="positive"
            color="green"
          />
          <MetricCard
            title="Avg Order Value"
            value={`$${metrics.avgOrderValue?.toFixed(2) || '0.00'}`}
            color="yellow"
          />
          <MetricCard
            title="Total Customers"
            value={`${metrics.totalCustomers}`}
            change={5}
            changeType="positive"
            color="purple"
          />
        </div>
      </div>

      {/* Key Metrics Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Products"
          value={`${metrics.totalProducts}`}
          subtext="Active SKUs"
          color="blue"
        />
        <MetricCard
          title="Low Stock Items"
          value={`${metrics.lowStockItems}`}
          changeType="negative"
          color="red"
          subtext="Need reordering"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate?.toFixed(1) || '0'}%`}
          color="green"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Sales Trend</h3>
          </div>
          <SalesChart data={chartData.salesTrend} type="area" height={300} />
        </div>

        {/* Inventory Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Inventory Status</h3>
          </div>
          <InventoryChart data={chartData.inventoryStatus} height={300} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Revenue by Category</h3>
          </div>
          <CategoryChart data={chartData.categoryBreakdown} height={300} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm font-medium">Database</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm font-medium">API Server</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm font-medium">Storage</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                85% Used
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/products" className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition text-center">
            <div className="font-medium text-blue-900 dark:text-blue-200">Manage Products</div>
          </a>
          <a href="/inventory" className="p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition text-center">
            <div className="font-medium text-green-900 dark:text-green-200">Inventory</div>
          </a>
          <a href="/sales" className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition text-center">
            <div className="font-medium text-purple-900 dark:text-purple-200">View Sales</div>
          </a>
          <a href="/reports/advanced" className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition text-center">
            <div className="font-medium text-orange-900 dark:text-orange-200">Reports</div>
          </a>
        </div>
      </div>
    </div>
  );
}
