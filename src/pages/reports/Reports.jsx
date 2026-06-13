import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { reportsApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';
import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';
import { Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const { version } = useDataRefresh();
  const { addToast } = useToast();
  const [tab, setTab] = useState('sales');

  const { data: chartData, loading: chartLoading } = useApi(() => reportsApi.salesByMonth(), [version]);
  const { data: topProducts, loading: topLoading } = useApi(() => reportsApi.topProducts(), [version]);
  const { data: valuation, loading: valLoading } = useApi(() => reportsApi.inventoryValuation(), [version]);
  const { data: lowStock, loading: lowLoading } = useApi(() => reportsApi.lowStock(), [version]);

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      addToast({ title: 'No data to export', type: 'error' });
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = headers + '\n' + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'CSV exported successfully', type: 'success' });
  };

  const exportToPDF = (data, filename, title) => {
    if (!data || data.length === 0) {
      addToast({ title: 'No data to export', type: 'error' });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    const headers = Object.keys(data[0]);
    const rows = data.map(row => Object.values(row));

    doc.autoTable({
      startY: 40,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`${filename}.pdf`);
    addToast({ title: 'PDF exported successfully', type: 'success' });
  };

  const topColumns = [
    { key: 'name', title: 'Product' },
    { key: 'quantity', title: 'Units Sold' },
    { key: 'revenue', title: 'Revenue', render: (r) => formatCurrency(r.revenue) },
  ];

  const valColumns = [
    { key: 'name', title: 'Product' },
    { key: 'sku', title: 'SKU' },
    { key: 'category', title: 'Category' },
    { key: 'stock', title: 'Stock' },
    { key: 'cost', title: 'Unit Cost', render: (r) => formatCurrency(r.cost) },
    { key: 'value', title: 'Total Value', render: (r) => formatCurrency(r.value) },
  ];

  const lowColumns = [
    { key: 'name', title: 'Product' },
    { key: 'sku', title: 'SKU' },
    { key: 'stock', title: 'Stock', render: (r) => <span className="text-red-600 font-medium">{r.stock}</span> },
    { key: 'reorderLevel', title: 'Reorder Level' },
    { key: 'status', title: 'Status', render: () => <Badge variant="warning">Low</Badge> },
  ];

  const tabs = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'top', label: 'Top Products' },
    { id: 'valuation', label: 'Inventory Valuation' },
    { id: 'lowstock', label: 'Low Stock' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Reports & Analytics</h2>
        <Link to="/reports/custom">
          <Button variant="secondary">Custom Report Builder</Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium ${tab === t.id ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <Card title="Monthly Sales" className="h-80">
          {chartLoading ? <Loader /> : (
            <>
              <div className="flex gap-2 mb-4">
                <Button variant="secondary" size="sm" onClick={() => exportToCSV(chartData, 'monthly-sales')}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> Export CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={() => exportToPDF(chartData, 'monthly-sales', 'Monthly Sales Report')}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </div>
              <ResponsiveContainer width="100%" height="calc(100% - 40px)">
                <BarChart data={chartData || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
      )}

      {tab === 'top' && (
        <Card title="Top Selling Products">
          {topLoading ? <Loader /> : (
            <>
              <div className="flex gap-2 mb-4">
                <Button variant="secondary" size="sm" onClick={() => exportToCSV(topProducts, 'top-products')}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> Export CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={() => exportToPDF(topProducts, 'top-products', 'Top Selling Products Report')}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </div>
              <Table columns={topColumns} data={topProducts || []} />
            </>
          )}
        </Card>
      )}

      {tab === 'valuation' && (
        <Card title="Inventory Valuation">
          {valLoading ? <Loader /> : (
            <>
              <div className="flex gap-2 mb-4">
                <Button variant="secondary" size="sm" onClick={() => exportToCSV(valuation, 'inventory-valuation')}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> Export CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={() => exportToPDF(valuation, 'inventory-valuation', 'Inventory Valuation Report')}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Total value: {formatCurrency((valuation || []).reduce((s, r) => s + r.value, 0))}
              </p>
              <Table columns={valColumns} data={valuation || []} />
            </>
          )}
        </Card>
      )}

      {tab === 'lowstock' && (
        <Card title="Low Stock Report">
          {lowLoading ? <Loader /> : (
            <>
              <div className="flex gap-2 mb-4">
                <Button variant="secondary" size="sm" onClick={() => exportToCSV(lowStock, 'low-stock')}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> Export CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={() => exportToPDF(lowStock, 'low-stock', 'Low Stock Report')}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </div>
              <Table columns={lowColumns} data={lowStock || []} />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
