import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { quotesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [loading2, setLoading2] = useState(false);

  const { data: quote, loading } = useApi(
    () => quotesApi.get(id),
    [id]
  );

  const handleAction = async (type) => {
    try {
      setLoading2(true);
      if (type === 'accept') {
        await quotesApi.acceptQuote(id);
        addToast({ title: 'Quote accepted', type: 'success' });
      } else if (type === 'reject') {
        await quotesApi.rejectQuote(id);
        addToast({ title: 'Quote rejected', type: 'success' });
      } else if (type === 'convert') {
        await quotesApi.convertToOrder(id);
        addToast({ title: 'Quote converted to order', type: 'success' });
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
  if (!quote) return <p>Quote not found.</p>;

  const columns = [
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Qty' },
    { key: 'unitPrice', title: 'Unit Price', render: (row) => formatCurrency(row.unitPrice) },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total || row.quantity * row.unitPrice) },
  ];

  const statusVariant = quote.status === 'accepted' ? 'success' : quote.status === 'rejected' ? 'danger' : 'warning';

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Quote #{quote.id}</h2>
        <Link to="/quotes" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant={statusVariant}>{quote.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quote Date</p>
            <p className="font-medium">{formatDate(quote.quoteDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valid Until</p>
            <p className="font-medium">{formatDate(quote.expiryDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-semibold mb-2">Customer</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">{quote.customerName}</p>
              <p>{quote.customerEmail}</p>
              <p>{quote.customerPhone}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Salesperson</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">{quote.salesPersonName}</p>
              <p>{quote.salesPersonEmail}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <Table columns={columns} data={quote.items || []} />
        </div>

        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({quote.taxRate}%):</span>
              <span>{formatCurrency(quote.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold mb-2">Notes</p>
            <p className="text-sm text-gray-600">{quote.notes}</p>
          </div>
        )}
      </Card>

      {quote.status === 'pending' && (
        <Card>
          <div className="flex gap-2">
            <Button onClick={() => { setActionType('convert'); setActionId(true); }} variant="primary">
              Convert to Order
            </Button>
            <Button onClick={() => { setActionType('accept'); setActionId(true); }} variant="secondary">
              Mark Accepted
            </Button>
            <Button onClick={() => { setActionType('reject'); setActionId(true); }} variant="danger">
              Reject Quote
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={!!actionId}
        onClose={() => { setActionId(null); setActionType(null); }}
        onConfirm={() => handleAction(actionType)}
        title={actionType === 'convert' ? 'Convert to Order' : actionType === 'accept' ? 'Accept Quote' : 'Reject Quote'}
        message={
          actionType === 'convert' ? 'Convert this quote to a sales order?' : 
          actionType === 'accept' ? 'Mark this quote as accepted?' : 
          'Reject this quote?'
        }
        isLoading={loading2}
      />
    </div>
  );
}
