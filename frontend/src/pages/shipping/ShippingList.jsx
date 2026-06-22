import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import SearchFilter from '../../components/ui/SearchFilter';

export default function ShippingList() {
  const { addToast } = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchShipments();
  }, [page, search, statusFilter]);

  async function fetchShipments() {
    try {
      setLoading(true);
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
      };
      if (statusFilter) params.status = statusFilter;
      
      const response = await apiClient.get('/shipments', { params });
      setShipments(response.data || []);
      setTotal(response.total || shipments.length);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load shipments',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900',
      in_transit: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900',
      returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'returned', label: 'Returned' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="w-8 h-8" />
          Shipments & Logistics
        </h1>
        <Link
          to="/shipments/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Shipment
        </Link>
      </div>

      <SearchFilter
        searchPlaceholder="Search by tracking number, carrier..."
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        onFilter={(filters) => {
          if (filters.status) setStatusFilter(filters.status);
        }}
        filters={filters}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No shipments found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Tracking</th>
                  <th className="px-4 py-3 text-left font-medium">Carrier</th>
                  <th className="px-4 py-3 text-left font-medium">From</th>
                  <th className="px-4 py-3 text-left font-medium">To</th>
                  <th className="px-4 py-3 text-right font-medium">Weight</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Expected</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-mono text-sm font-medium">
                      {shipment.tracking_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3">{shipment.carrier}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {shipment.ship_from_address}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {shipment.ship_to_address}
                    </td>
                    <td className="px-4 py-3 text-right">{shipment.weight_kg} kg</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {shipment.expected_delivery
                        ? new Date(shipment.expected_delivery).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/shipments/${shipment.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing page {page} ({total} total)
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
