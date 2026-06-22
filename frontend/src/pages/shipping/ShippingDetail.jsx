import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, Calendar, DollarSign } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export default function ShippingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    tracking_number: '',
    delivery_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchShipment();
  }, [id]);

  async function fetchShipment() {
    try {
      setLoading(true);
      const response = await apiClient.get(`/shipments/${id}`);
      setShipment(response.data);
      setFormData({
        status: response.data.status || '',
        tracking_number: response.data.tracking_number || '',
        delivery_date: response.data.delivery_date || '',
        notes: response.data.notes || '',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load shipment',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    try {
      setUpdating(true);
      await apiClient.put(`/shipments/${id}`, formData);
      addToast({
        title: 'Success',
        description: 'Shipment updated',
        type: 'success',
      });
      await fetchShipment();
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update shipment',
        type: 'error',
      });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shipment) {
    return <div>Shipment not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/shipments')}
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shipments
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6" />
              Shipment Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tracking Number</label>
                <p className="text-lg font-mono">{shipment.tracking_number || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Carrier</label>
                <p className="text-lg">{shipment.carrier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Weight</label>
                <p className="text-lg">{shipment.weight_kg} kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Dimensions</label>
                <p className="text-sm">
                  {shipment.length_cm && shipment.width_cm && shipment.height_cm
                    ? `${shipment.length_cm}×${shipment.width_cm}×${shipment.height_cm} cm`
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Addresses
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ship From</label>
                <p className="text-sm whitespace-pre-wrap mt-1">{shipment.ship_from_address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ship To</label>
                <p className="text-sm whitespace-pre-wrap mt-1">{shipment.ship_to_address}</p>
              </div>
            </div>
          </div>

          {/* Dates & Costs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Dates & Costs
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ship Date</label>
                <p className="text-sm mt-1">
                  {shipment.ship_date ? new Date(shipment.ship_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected Delivery</label>
                <p className="text-sm mt-1">
                  {shipment.expected_delivery ? new Date(shipment.expected_delivery).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Actual Delivery</label>
                <p className="text-sm mt-1">
                  {shipment.delivery_date ? new Date(shipment.delivery_date).toLocaleDateString() : 'Not delivered'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</label>
                  <p className="text-sm font-bold">${(shipment.shipping_cost + shipment.insurance_cost).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {shipment.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-2">Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{shipment.notes}</p>
            </div>
          )}
        </div>

        {/* Update Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">Update Shipment</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tracking Number</label>
              <input
                type="text"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                placeholder="Enter tracking number"
                className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Delivery Date</label>
              <input
                type="datetime-local"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Shipment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
