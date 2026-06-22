import React, { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import SalesChart from '../../components/charts/SalesChart';
import InventoryChart from '../../components/charts/InventoryChart';
import CategoryChart from '../../components/charts/CategoryChart';
import MetricCard from '../../components/charts/MetricCard';
import ExportButton from '../../components/ui/ExportButton';

export default function AdvancedReports() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

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
    topProducts: [],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  async function fetchReportData() {
    try {
      setLoading(true);

      // Fetch metrics
      const metricsResponse = await apiClient.get('/dashboard/metrics', {
        params: { ...dateRange },
      });
      setMetrics(metricsResponse.data || {});

      // Fetch sales trend
      const salesResponse = await apiClient.get('/dashboard/sales-trend', {
        params: { ...dateRange },
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

      // Fetch top products
      const topResponse = await apiClient.get('/dashboard/top-products', {
        params: { limit: 10, ...dateRange },
      });
      setChartData((prev) => ({
        ...prev,
        topProducts: topResponse.data || [],
      }));
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load report data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const reportData = {
    metrics: Object.entries(metrics).map(([key, value]) => ({ key, value })),
    salesTrend: chartData.salesTrend,
    inventory: chartData.inventoryStatus,
    categories: chartData.categoryBreakdown,
    products: chartData.topProducts,
  };

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
        <h1 className="text-3xl font-bold">Advanced Reports</h1>
        {Object.keys(reportData).length > 0 && (
          <ExportButton
            data={reportData}
            filename="advanced-report"
            title="Advanced Business Report"
          />
        )}
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Apply
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sales"
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
            change={-3}
            changeType="negative"
            color="yellow"
          />
          <MetricCard
            title="Total Customers"
            value={`${metrics.totalCustomers}`}
            change={5}
            changeType="positive"
            color="purple"
          />
          <MetricCard
            title="Total Products"
            value={`${metrics.totalProducts}`}
            subtext="Active products"
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
            change={2}
            changeType="positive"
            color="green"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Sales Trend</h3>
          <SalesChart data={chartData.salesTrend} type="area" height={250} />
        </div>

        {/* Inventory Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Inventory Status</h3>
          <InventoryChart data={chartData.inventoryStatus} height={250} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Revenue by Category</h3>
          <CategoryChart data={chartData.categoryBreakdown} height={300} />
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Top 10 Products</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {chartData.topProducts.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">{idx + 1}. {product.name}</span>
                <span className="text-sm font-bold text-blue-600">${product.revenue?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Data Tables */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4">Sales Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Sales</th>
                <th className="px-4 py-2 text-right">Revenue</th>
                <th className="px-4 py-2 text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {chartData.salesTrend.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2 text-right">{row.sales}</td>
                  <td className="px-4 py-2 text-right">${row.revenue?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    {row.revenue && row.sales ? `${((row.revenue / row.sales) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
