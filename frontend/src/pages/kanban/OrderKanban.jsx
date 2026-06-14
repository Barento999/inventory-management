import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useApi } from '../../hooks/useApi';
import { salesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Plus, MoreVertical, Clock, CheckCircle, Truck, Package } from 'lucide-react';

const columns = [
  { id: 'draft', title: 'Draft', icon: Clock, color: 'bg-gray-500' },
  { id: 'confirmed', title: 'Confirmed', icon: CheckCircle, color: 'bg-blue-500' },
  { id: 'shipped', title: 'Shipped', icon: Truck, color: 'bg-orange-500' },
  { id: 'delivered', title: 'Delivered', icon: Package, color: 'bg-green-500' },
];

export default function OrderKanban() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: sales, loading, reload } = useApi(() => salesApi.list(), [version]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await salesApi.updateStatus(orderId, newStatus);
      addToast({ title: `Order status changed to ${newStatus}`, type: 'success' });
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const getOrdersByStatus = (status) => {
    return (sales?.data || []).filter(s => s.status === status);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Order Board</h1>
        <Button onClick={() => window.location.href = '/sales'}>
          <Plus className="w-4 h-4 mr-1" /> New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const orders = getOrdersByStatus(column.id);
          return (
            <div key={column.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${column.color} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold">{column.title}</h3>
                </div>
                <span className="text-sm text-gray-500">{orders.length}</span>
              </div>
              <div className="space-y-3 min-h-[400px]">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{order.id}</span>
                        <span className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <div className="flex gap-1">
                        {column.id !== 'draft' && column.id !== 'delivered' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus = columns.find(c => c.id === column.id)?.nextStatus || 'delivered';
                              handleStatusChange(order.id, nextStatus);
                            }}
                          >
                            Move to {columns.find(c => c.id === column.id)?.nextStatus || 'Delivered'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No orders</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Order #${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold">{formatCurrency(selectedOrder.total)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={selectedOrder.status === 'delivered' ? 'success' : 'primary'}>{selectedOrder.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>{item.productName}</span>
                    <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.location.href = `/sales/${selectedOrder.id}`}>
                View Details
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
