import React, { useState, useEffect } from 'react';
import { Truck, TrendingUp, Package, AlertCircle, MapPin, DollarSign } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import MetricCard from '../../components/charts/MetricCard';

export default function LogisticsHub() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState({});
  const [costAnalysis, setCostAnalysis] = useState({});
  const [rates, setRates] = useState([]);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      
      // Fetch analytics
      const analyticsRes = await apiClient.get('/logistics/analytics').catch(() => null);
      if (analyticsRes) setAnalytics(analyticsRes.data);
      
      // Fetch cost analysis
      const costRes = await apiClient.get('/logistics/cost-analysis').catch(() => null);
      if (costRes) setCostAnalysis(costRes.data);
      
      // Fetch returns
      const returnsRes = await apiClient.get('/logistics/returns/pending').catch(() => null);
      if (returnsRes) setReturns(returnsRes.data.returns || []);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load logistics data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleGetRates = async () => {
    try {
      const response = await apiClient.get('/logistics/rates/quote', {
        params: {
          weight_kg: 5,
          origin_zip: '10001',
          destination_zip: '90001',
        },
      });
      setRates(response.data.quotes || []);
      addToast({
        title: 'Success',
        description: 'Shipping rates retrieved',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to get shipping rates',
        type: 'error',
      });
    }
  };

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
        <Truck className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Logistics Hub</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Shipments"
          value={analytics.total_shipments || 0}
          color="blue"
          icon={<Package className="w-5 h-5" />}
        />
        <MetricCard
          title="On-Time Rate"
          value={`${analytics.on_time_delivery_rate || 0}%`}
          color="green"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Cost"
          value={`$${analytics.average_shipping_cost || 0}`}
          color="purple"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Volume"
          value={`${analytics.total_shipping_volume_kg || 0} kg`}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'rates', 'costs', 'returns'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carrier Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Carrier Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(analytics.carrier_breakdown || {}).map(([carrier, data]) => (
                <div key={carrier} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{carrier}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {data.count} shipments
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    ${data.cost?.toFixed(2) || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Status Distribution</h2>
            <div className="space-y-3">
              {['pending', 'processing', 'shipped', 'in_transit', 'delivered'].map((status) => (
                <div key={status} className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === 'delivered'
                        ? 'bg-green-500'
                        : status === 'shipped'
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <span className="capitalize text-sm flex-1">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-medium">0</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rates Tab */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <button
            onClick={handleGetRates}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Shipping Quotes
          </button>

          {rates.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Carrier</th>
                      <th className="px-4 py-3 text-left font-medium">Service</th>
                      <th className="px-4 py-3 text-right font-medium">Cost</th>
                      <th className="px-4 py-3 text-right font-medium">Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {rates.map((rate, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 font-medium">{rate.carrier}</td>
                        <td className="px-4 py-3">{rate.service_type}</td>
                        <td className="px-4 py-3 text-right font-bold">
                          ${rate.estimated_cost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">{rate.estimated_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === 'costs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Cost by Carrier</h2>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              ${costAnalysis.total_spent?.toFixed(2) || 0}
            </div>
            <div className="space-y-3">
              {Object.entries(costAnalysis.by_carrier || {}).map(([carrier, data]) => (
                <div key={carrier} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{carrier}</span>
                    <span className="text-green-600 dark:text-green-400">
                      ${data.total_cost?.toFixed(2) || 0}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg: ${data.avg_cost?.toFixed(2) || 0} per shipment
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {(costAnalysis.recommendations || []).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {returns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No pending returns</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Tracking</th>
                    <th className="px-4 py-3 text-left font-medium">Carrier</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {returns.map((ret) => (
                    <tr key={ret.shipment_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-mono text-sm">{ret.tracking_number}</td>
                      <td className="px-4 py-3">{ret.carrier}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs font-medium">
                          {ret.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {ret.from_address?.substring(0, 30)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
