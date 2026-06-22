import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Package, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export default function AdvancedAnalytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kpis');
  const [kpis, setKpis] = useState([]);
  const [funnel, setFunnel] = useState({});
  const [segmentation, setSegmentation] = useState({});
  const [inventory, setInventory] = useState({});
  const [profitability, setProfitability] = useState({});
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  async function fetchAllAnalytics() {
    try {
      setLoading(true);

      // Fetch KPIs
      const kpisRes = await apiClient.get('/analytics/kpis').catch(() => null);
      if (kpisRes) setKpis(kpisRes.data.kpis || []);

      // Fetch funnel
      const funnelRes = await apiClient.get('/analytics/sales-funnel').catch(() => null);
      if (funnelRes) setFunnel(funnelRes.data);

      // Fetch segmentation
      const segRes = await apiClient.get('/analytics/customer-segmentation').catch(() => null);
      if (segRes) setSegmentation(segRes.data);

      // Fetch inventory
      const invRes = await apiClient.get('/analytics/inventory-health').catch(() => null);
      if (invRes) setInventory(invRes.data);

      // Fetch profitability
      const profRes = await apiClient.get('/analytics/profitability').catch(() => null);
      if (profRes) setProfitability(profRes.data);

      // Fetch trends
      const trendsRes = await apiClient.get('/analytics/trends?metric=revenue&period_days=30').catch(() => null);
      if (trendsRes) setTrends(trendsRes.data.data || []);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load analytics',
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['kpis', 'funnel', 'customers', 'inventory', 'profitability'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors capitalize whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPIs Tab */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{kpi.name}</p>
                <p className="text-3xl font-bold mb-2">
                  {typeof kpi.value === 'number' ? kpi.value.toFixed(2) : kpi.value}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">{kpi.unit}</span>
                  {kpi.trend !== null && (
                    <span className={`text-xs font-bold ${kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.trend >= 0 ? '+' : ''}{kpi.trend.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel Tab */}
      {activeTab === 'funnel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Sales Funnel</h2>
            <div className="space-y-3">
              {(funnel.funnel || []).map((stage, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-sm font-bold">{stage.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${((stage.count / (funnel.funnel?.[0]?.count || 1)) * 100).toFixed(0)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Conversion Rates</h2>
            <div className="space-y-3">
              {Object.entries(funnel.conversion_rates || {}).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {value.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Segmentation Tab */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['vip', 'regular', 'at_risk'].map((segment) => (
            <div key={segment} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold capitalize mb-4">{segment.replace('_', ' ')} Customers</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Count</p>
                  <p className="text-2xl font-bold">{segmentation[segment]?.count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(segmentation[segment]?.total_value || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Inventory Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">Fast-Moving Items</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {inventory.fast_moving?.count || 0}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  ${(inventory.fast_moving?.total_value || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Slow-Moving Items</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {inventory.slow_moving?.count || 0}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ${(inventory.slow_moving?.total_value || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">Dead Stock</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {inventory.dead_stock?.count || 0}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  ${(inventory.dead_stock?.total_value || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Inventory Value</p>
              <p className="text-3xl font-bold text-blue-600">
                ${(inventory.total_inventory_value || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profitability Tab */}
      {activeTab === 'profitability' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Financial Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium">Revenue</span>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  ${(profitability.revenue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium">COGS</span>
                <span className="text-red-600 dark:text-red-400 font-bold">
                  ${(profitability.cogs || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium">Shipping</span>
                <span className="text-red-600 dark:text-red-400 font-bold">
                  ${(profitability.shipping || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900 rounded">
                <span className="font-bold">Net Profit</span>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  ${(profitability.net_profit || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Margins</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Gross Margin</span>
                  <span className="text-sm font-bold">{(profitability.gross_margin_percent || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(profitability.gross_margin_percent || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Net Margin</span>
                  <span className="text-sm font-bold">{(profitability.net_margin_percent || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min(profitability.net_margin_percent || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
