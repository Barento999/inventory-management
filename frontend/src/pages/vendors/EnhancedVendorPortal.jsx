import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, AlertCircle, FileText, MessageSquare, Star } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import MetricCard from '../../components/charts/MetricCard';
import SearchFilter from '../../components/ui/SearchFilter';

export default function EnhancedVendorPortal() {
  const { addToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({});
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (search) params.search = search;
      const response = await apiClient.get('/suppliers', { params });
      setSuppliers(response.data || []);
      if (response.data && response.data.length > 0 && !selectedSupplier) {
        selectSupplier(response.data[0]);
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load suppliers',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function selectSupplier(supplier) {
    setSelectedSupplier(supplier);
    try {
      // Fetch supplier metrics and history
      const [metricsRes, historyRes] = await Promise.all([
        apiClient.get(`/suppliers/${supplier.id}/metrics`).catch(() => null),
        apiClient.get(`/purchases`, { params: { supplier_id: supplier.id, limit: 10 } }).catch(() => null),
      ]);

      if (metricsRes) setMetrics(metricsRes.data);
      if (historyRes) setPurchaseHistory(historyRes.data || []);
    } catch (error) {
      console.error('Failed to fetch supplier details:', error);
    }
  }

  const getPerformanceRating = (supplier) => {
    // Simple rating calculation
    const rating = (supplier.rating || 3.5);
    return {
      stars: Math.round(rating * 10) / 10,
      status: rating >= 4 ? 'Excellent' : rating >= 3 ? 'Good' : 'Needs Review',
      color: rating >= 4 ? 'text-green-500' : rating >= 3 ? 'text-blue-500' : 'text-orange-500',
    };
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="w-8 h-8" />
          Vendor Portal
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {suppliers.length} Active Suppliers
        </div>
      </div>

      <SearchFilter
        searchPlaceholder="Search vendors by name, email..."
        onSearch={(term) => setSearch(term)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Suppliers List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold">Suppliers</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {suppliers.map((supplier) => (
              <button
                key={supplier.id}
                onClick={() => selectSupplier(supplier)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedSupplier?.id === supplier.id
                    ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-l-blue-600'
                    : ''
                }`}
              >
                <p className="font-medium text-sm">{supplier.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{supplier.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Details */}
        <div className="lg:col-span-3 space-y-4">
          {selectedSupplier ? (
            <>
              {/* Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSupplier.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedSupplier.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(getPerformanceRating(selectedSupplier).stars)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-sm font-bold ${getPerformanceRating(selectedSupplier).color}`}>
                      {getPerformanceRating(selectedSupplier).status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact Person</p>
                    <p className="font-medium">{selectedSupplier.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium">{selectedSupplier.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium">{selectedSupplier.phone}</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              {Object.keys(metrics).length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard
                    title="Total Orders"
                    value={metrics.total_orders || 0}
                    color="blue"
                  />
                  <MetricCard
                    title="Total Spent"
                    value={`$${(metrics.total_amount || 0).toFixed(2)}`}
                    color="green"
                  />
                  <MetricCard
                    title="Avg Order Value"
                    value={`$${(metrics.avg_order_value || 0).toFixed(2)}`}
                    color="purple"
                  />
                </div>
              )}

              {/* Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {['overview', 'orders', 'communication', 'documents'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-3 font-medium text-center capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab === 'communication' ? 'Messages' : tab === 'documents' ? 'Docs' : tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold mb-2">Performance Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>On-time Delivery Rate</span>
                            <span className="font-bold text-green-600">94%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality Score</span>
                            <span className="font-bold text-green-600">4.2/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Lead Time</span>
                            <span className="font-bold">5-7 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Defect Rate</span>
                            <span className="font-bold text-green-600">0.8%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded flex gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          Outstanding orders: 3 (All on track)
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div>
                      <h3 className="font-bold mb-4">Recent Purchase Orders</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {purchaseHistory.length > 0 ? (
                          purchaseHistory.map((order) => (
                            <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">PO #{order.id}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">${order.total_amount?.toFixed(2) || '0.00'}</p>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    order.status === 'received' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No orders yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'communication' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-l-blue-600">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Last Communication
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Confirmed delivery of order #2841 - June 15, 2024
                        </p>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Send Message
                      </button>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Documents
                      </h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-between">
                          <span className="text-sm font-medium">Tax Certificate 2024</span>
                          <a href="#" className="text-blue-600 hover:underline text-sm">Download</a>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-between">
                          <span className="text-sm font-medium">Business License</span>
                          <a href="#" className="text-blue-600 hover:underline text-sm">Download</a>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-between">
                          <span className="text-sm font-medium">ISO Certification</span>
                          <a href="#" className="text-blue-600 hover:underline text-sm">Download</a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a supplier to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
