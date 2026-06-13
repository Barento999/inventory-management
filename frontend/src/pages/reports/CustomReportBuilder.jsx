import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import { useApi } from '../../hooks/useApi';
import { productsApi, salesApi, purchasesApi, customersApi, suppliersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, FileSpreadsheet, Plus, Trash2 } from 'lucide-react';

export default function CustomReportBuilder() {
  const { version } = useDataRefresh();
  const { addToast } = useToast();
  const [dataSource, setDataSource] = useState('products');
  const [filters, setFilters] = useState([]);
  const [columns, setColumns] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportName, setReportName] = useState('');

  const { data: products } = useApi(() => productsApi.list(), [version]);
  const { data: sales } = useApi(() => salesApi.list(), [version]);
  const { data: purchases } = useApi(() => purchasesApi.list(), [version]);
  const { data: customers } = useApi(() => customersApi.list(), [version]);
  const { data: suppliers } = useApi(() => suppliersApi.list(), [version]);

  const dataSourceOptions = [
    { value: 'products', label: 'Products' },
    { value: 'sales', label: 'Sales' },
    { value: 'purchases', label: 'Purchases' },
    { value: 'customers', label: 'Customers' },
    { value: 'suppliers', label: 'Suppliers' },
  ];

  const columnOptions = {
    products: [
      { value: 'id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'sku', label: 'SKU' },
      { value: 'category', label: 'Category' },
      { value: 'price', label: 'Price' },
      { value: 'cost', label: 'Cost' },
      { value: 'stock', label: 'Stock' },
      { value: 'status', label: 'Status' },
    ],
    sales: [
      { value: 'id', label: 'Sale #' },
      { value: 'customerName', label: 'Customer' },
      { value: 'total', label: 'Total' },
      { value: 'status', label: 'Status' },
      { value: 'createdAt', label: 'Created' },
    ],
    purchases: [
      { value: 'id', label: 'PO #' },
      { value: 'supplierName', label: 'Supplier' },
      { value: 'total', label: 'Total' },
      { value: 'status', label: 'Status' },
      { value: 'createdAt', label: 'Created' },
    ],
    customers: [
      { value: 'id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'address', label: 'Address' },
    ],
    suppliers: [
      { value: 'id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'address', label: 'Address' },
    ],
  };

  const getData = () => {
    switch (dataSource) {
      case 'products': return products?.data || [];
      case 'sales': return sales?.data || [];
      case 'purchases': return purchases?.data || [];
      case 'customers': return customers?.data || [];
      case 'suppliers': return suppliers?.data || [];
      default: return [];
    }
  };

  const applyFilters = (data) => {
    return filters.reduce((filtered, filter) => {
      if (!filter.value) return filtered;
      return filtered.filter(item => {
        const itemValue = String(item[filter.field]).toLowerCase();
        return itemValue.includes(String(filter.value).toLowerCase());
      });
    }, data);
  };

  const applyColumns = (data) => {
    if (columns.length === 0) return data;
    return data.map(item => {
      const result = {};
      columns.forEach(col => {
        result[col] = item[col];
      });
      return result;
    });
  };

  const generateReport = () => {
    let data = getData();
    data = applyFilters(data);
    data = applyColumns(data);
    setReportData(data);
    addToast({ title: 'Report generated', type: 'success' });
  };

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      addToast({ title: 'No data to export', type: 'error' });
      return;
    }
    const headers = columns.length > 0 ? columns : Object.keys(reportData[0]);
    const rows = reportData.map(row => headers.map(h => row[h]).join(','));
    const csv = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'custom-report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'CSV exported successfully', type: 'success' });
  };

  const exportToPDF = () => {
    if (!reportData || reportData.length === 0) {
      addToast({ title: 'No data to export', type: 'error' });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(reportName || 'Custom Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    const headers = columns.length > 0 ? columns : Object.keys(reportData[0]);
    const rows = reportData.map(row => headers.map(h => row[h]));

    doc.autoTable({
      startY: 40,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`${reportName || 'custom-report'}.pdf`);
    addToast({ title: 'PDF exported successfully', type: 'success' });
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', value: '' }]);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const addColumn = () => {
    setColumns([...columns, '']);
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const tableColumns = columns.length > 0 
    ? columns.map(col => ({ key: col, title: col.charAt(0).toUpperCase() + col.slice(1) }))
    : Object.keys(reportData?.[0] || {}).map(key => ({ key, title: key.charAt(0).toUpperCase() + key.slice(1) }));

  return (
    <div className="space-y-4">
      <Card title="Custom Report Builder">
        <div className="space-y-4">
          <Input
            id="reportName"
            label="Report Name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="My Custom Report"
          />

          <Select
            id="dataSource"
            label="Data Source"
            value={dataSource}
            onChange={(e) => { setDataSource(e.target.value); setColumns([]); setFilters([]); }}
            options={dataSourceOptions}
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Filters</label>
              <Button size="sm" variant="secondary" onClick={addFilter}>
                <Plus className="w-4 h-4 mr-1" /> Add Filter
              </Button>
            </div>
            {filters.map((filter, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Select
                  value={filter.field}
                  onChange={(e) => {
                    const newFilters = [...filters];
                    newFilters[index].field = e.target.value;
                    setFilters(newFilters);
                  }}
                  options={[{ value: '', label: 'Select field' }, ...(columnOptions[dataSource] || [])]}
                  className="flex-1"
                />
                <Input
                  value={filter.value}
                  onChange={(e) => {
                    const newFilters = [...filters];
                    newFilters[index].value = e.target.value;
                    setFilters(newFilters);
                  }}
                  placeholder="Filter value"
                  className="flex-1"
                />
                <Button size="sm" variant="danger" onClick={() => removeFilter(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Columns to Include</label>
              <Button size="sm" variant="secondary" onClick={addColumn}>
                <Plus className="w-4 h-4 mr-1" /> Add Column
              </Button>
            </div>
            {columns.map((column, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Select
                  value={column}
                  onChange={(e) => {
                    const newColumns = [...columns];
                    newColumns[index] = e.target.value;
                    setColumns(newColumns);
                  }}
                  options={[{ value: '', label: 'Select column' }, ...(columnOptions[dataSource] || [])]}
                  className="flex-1"
                />
                <Button size="sm" variant="danger" onClick={() => removeColumn(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={generateReport}>Generate Report</Button>
            {reportData && (
              <>
                <Button variant="secondary" onClick={exportToCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" /> Export CSV
                </Button>
                <Button variant="secondary" onClick={exportToPDF}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {reportData && (
        <Card title="Report Results">
          <Table columns={tableColumns} data={reportData} />
        </Card>
      )}
    </div>
  );
}
