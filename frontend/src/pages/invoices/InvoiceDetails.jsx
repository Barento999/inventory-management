import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { invoicesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/format';
import { Download, Printer } from 'lucide-react';

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [payId, setPayId] = useState(null);
  const [loading2, setLoading2] = useState(false);

  const { data: invoice, loading } = useApi(
    () => invoicesApi.get(id),
    [id]
  );

  const handleMarkPaid = async () => {
    try {
      setLoading2(true);
      await invoicesApi.markAsPaid(id);
      addToast({ title: 'Invoice marked as paid', type: 'success' });
      refresh();
      setPayId(null);
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    } finally {
      setLoading2(false);
    }
  };

  const handleDownloadPDF = () => {
    addToast({ title: 'PDF download started', type: 'success' });
    // PDF generation would be implemented here
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loader className="py-12" />;
  if (!invoice) return <p>Invoice not found.</p>;

  const columns = [
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Qty', render: (row) => row.quantity },
    { key: 'unitPrice', title: 'Unit Price', render: (row) => formatCurrency(row.unitPrice) },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total || row.quantity * row.unitPrice) },
  ];

  const statusVariant = invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning';

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Invoice #{invoice.id}</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="secondary" size="sm">
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1" /> Download PDF
          </Button>
          <Link to="/invoices" className="text-sm text-primary hover:underline">Back to list</Link>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant={statusVariant}>{invoice.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Issue Date</p>
            <p className="font-medium">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-medium">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-semibold mb-2">Bill To</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">{invoice.customerName}</p>
              <p>{invoice.customerEmail}</p>
              <p>{invoice.customerAddress}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">From</p>
            <div className="text-sm space-y-1">
              <p className="font-medium">Your Company</p>
              <p>{invoice.companyAddress || '-'}</p>
              <p>{invoice.companyPhone || '-'}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <Table columns={columns} data={invoice.items || []} />
        </div>

        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({invoice.taxRate}%):</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Balance:</span>
                  <span>{formatCurrency(invoice.total - invoice.paidAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold mb-2">Notes</p>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex gap-2">
          {invoice.status !== 'paid' && (
            <Button onClick={() => setPayId(true)} variant="primary">
              Mark as Paid
            </Button>
          )}
          <Button onClick={() => navigate('/invoices')} variant="secondary">
            Back to List
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!payId}
        onClose={() => setPayId(null)}
        onConfirm={handleMarkPaid}
        title="Mark Invoice as Paid"
        message={`Are you sure you want to mark invoice #${invoice.id} as paid?`}
        isLoading={loading2}
      />
    </div>
  );
}
