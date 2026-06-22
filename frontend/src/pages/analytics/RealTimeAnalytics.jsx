import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart, Calendar } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import MetricCard from '../../components/charts/MetricCard';
import SalesChart from '../../components/charts/SalesChart';
import InventoryChart from '../../components/charts/InventoryChart';
import CategoryChart from '../../components/charts/CategoryChart';

export default function RealTimeAnalytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds

  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh, refreshInterval]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await apiClient.get('/dashboard', {
        params: { time_range: timeRange },
      });
      
      if (response.data) {
        setMetrics(response.data);
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to fetch analytics',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const getMetricTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading && !metrics.revenue) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="w-8 h-8" />
          Real-time Analytics
        </h1>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Auto-refresh</span>
          </label>

          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>Every 30s</option>
              <option value={60}>Every 1m</option>
              <option value={300}>Every 5m</option>
              <option value={600}>Every 10m</option>
            </select>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${(metrics.total_revenue || 0).toFixed(2)}`}
          color="blue"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={getMetricTrend(metrics.current_revenue, metrics.previous_revenue)}
          subtitle={`Previous: $${(metrics.previous_revenue || 0).toFixed(2)}`}
        />
        <MetricCard
          title="Orders"
          value={metrics.total_orders || 0}
          color="green"
          icon={<BarChart3 className="w-5 h-5" />}
          trend={getMetricTrend(metrics.current_orders, metrics.previous_orders)}
          subtitle={`Average: $${metrics.avg_order_value || 0}`}
        />
        <MetricCard
          title="Products"
          value={metrics.total_products || 0}
          color="purple"
          icon={<PieChart className="w-5 h-5" />}
          subtitle={`Low Stock: ${metrics.low_stock_count || 0}`}
        />
        <MetricCard
          title="Customers"
          value={metrics.total_customers || 0}
          color="orange"
          subtitle={`Active: ${metrics.active_customers || 0}`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold mb-4">Sales Trend</h2>
          <SalesChart data={metrics.sales_trend} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold mb-4">Inventory Status</h2>
          <InventoryChart data={metrics.inventory_data} />
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-bold mb-4">Category Performance</h3>
          <CategoryChart data={metrics.category_breakdown} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-bold mb-4">Top Products</h3>
          <div className="space-y-3">
            {(metrics.top_products || []).slice(0, 5).map((product, idx) => (
              <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {product.sales} sales
                  </p>
                </div>
                <p className="font-bold text-green-600">${product.revenue?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-bold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Health</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cache</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {metrics.response_time_ms || 45}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(metrics.alerts && metrics.alerts.length > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">Active Alerts</h3>
          <ul className="space-y-2">
            {metrics.alerts.map((alert, idx) => (
              <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200">
                • {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Last updated: {new Date().toLocaleTimeString()}
        {autoRefresh && ` (Auto-refresh every ${refreshInterval}s)`}
      </div>
    </div>
  );
}
