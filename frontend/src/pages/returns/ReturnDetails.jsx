import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { returnsApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';

export default function ReturnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [loading2, setLoading2] = useState(false);

  const { data: returnItem, loading } = useApi(
    () => returnsApi.get(id),
    [id]
  );

  const handleAction = async (type) => {
    try {
      setLoading2(true);
      if (type === 'approve') {
        await returnsApi.approveReturn(id);
        addToast({ title: 'Return approved', type: 'success' });
      } else if (type === 'reject') {
        await returnsApi.rejectReturn(id);
        addToast({ title: 'Return rejected', type: 'success' });
      } else if (type === 'process') {
        await returnsApi.processReturn(id);
        addToast({ title: 'Return processed', type: 'success' });
      }
      refresh();
      setActionId(null);
      setActionType(null);
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    } finally {
      setLoading2(false);
    }
  };

  if (loading) return <Loader className="py-12" />;
  if (!returnItem) return <p>Return not found.</p>;

  const columns = [
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Qty' },
    { key: 'reason', title: 'Reason' },
    { key: 'condition', title: 'Condition' },
  ];

  const statusVariant = returnItem.status === 'approved' ? 'success' : returnItem.status === 'rejected' ? 'danger' : 'warning';

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Return #{returnItem.id}</h2>
        <Link to="/returns" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant={statusVariant}>{returnItem.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Return Date</p>
            <p className="font-medium">{formatDate(returnItem.returnDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Original Sale</p>
            <p className="font-medium">#{returnItem.saleId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Refund Amount</p>
            <p className="font-medium">{formatCurrency(returnItem.refundAmount)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-semibold mb-2">Customer</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">{returnItem.customerName}</p>
              <p>{returnItem.customerEmail}</p>
              <p>{returnItem.customerPhone}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Return Type</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">{returnItem.returnType}</p>
              <p className="text-gray-600">{returnItem.warehouse}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Returned Items</h3>
          <Table columns={columns} data={returnItem.items || []} />
        </div>

        {returnItem.reason && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold mb-2">Reason</p>
            <p className="text-sm text-gray-600">{returnItem.reason}</p>
          </div>
        )}

        {returnItem.notes && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Notes</p>
            <p className="text-sm text-gray-600">{returnItem.notes}</p>
          </div>
        )}
      </Card>

      {returnItem.status === 'pending' && (
        <Card>
          <div className="flex gap-2">
            <Button onClick={() => { setActionType('approve'); setActionId(true); }} variant="primary">
              Approve Return
            </Button>
            <Button onClick={() => { setActionType('process'); setActionId(true); }} variant="secondary">
              Process Return
            </Button>
            <Button onClick={() => { setActionType('reject'); setActionId(true); }} variant="danger">
              Reject Return
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!actionId}
        onClose={() => { setActionId(null); setActionType(null); }}
        onConfirm={() => handleAction(actionType)}
        title={actionType === 'approve' ? 'Approve Return' : actionType === 'process' ? 'Process Return' : 'Reject Return'}
        message={
          actionType === 'approve' ? 'Approve this return request?' : 
          actionType === 'process' ? 'Mark return as processed?' : 
          'Reject this return request?'
        }
        isLoading={loading2}
      />
    </div>
  );
}
