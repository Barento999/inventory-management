import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { inventoryApi, warehousesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';
import { Plus, Minus, Edit2 } from 'lucide-react';

export default function InventoryManagement() {
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');

  const { data: result, loading, reload } = useApi(
    () => inventoryApi.list({ search, warehouseId, status, page, pageSize: 10 }),
    [version, search, warehouseId, status, page]
  );

  const { data: warehouses } = useApi(() => warehousesApi.options(), [version]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { quantity: 1, reason: '' },
  });

  const onAdjustment = async (data) => {
    try {
      const adjustmentData = {
        ...data,
        quantity: adjustmentType === 'add' ? data.quantity : -data.quantity,
      };
      await inventoryApi.adjustStock(selectedItem.productId, adjustmentData);
      addToast({ title: 'Inventory adjusted', type: 'success' });
      setAdjustmentOpen(false);
      refresh();
      reload();
      reset();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const openAdjustment = (item, type) => {
    setSelectedItem(item);
    setAdjustmentType(type);
    setAdjustmentOpen(true);
  };

  const columns = [
    { key: 'productSku', title: 'SKU', render: (row) => (
      <code className="text-sm">{row.productSku}</code>
    ) },
    { key: 'productName', title: 'Product' },
    { key: 'quantity', title: 'Current Stock', render: (row) => (
      <span className="font-semibold">{row.quantity}</span>
    ) },
    { key: 'reorderLevel', title: 'Reorder Level' },
    { key: 'warehouseName', title: 'Warehouse' },
    { key: 'unitCost', title: 'Unit Cost', render: (row) => formatCurrency(row.unitCost) },
    { key: 'value', title: 'Total Value', render: (row) => formatCurrency(row.quantity * row.unitCost) },
    { key: 'status', title: 'Status', render: (row) => {
      let variant = 'success';
      if (row.quantity === 0) variant = 'danger';
      else if (row.quantity <= row.reorderLevel) variant = 'warning';
      return (
        <Badge variant={variant}>
          {row.quantity === 0 ? 'Out of Stock' : row.quantity <= row.reorderLevel ? 'Low Stock' : 'In Stock'}
        </Badge>
      );
    } },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button
          onClick={() => openAdjustment(row, 'add')}
          className="text-green-600 hover:underline text-sm flex items-center gap-1"
          title="Add Stock"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => openAdjustment(row, 'subtract')}
          className="text-orange-600 hover:underline text-sm flex items-center gap-1"
          title="Remove Stock"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(`/products/${row.productId}`)}
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
          title="Edit Product"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventory Management"
        subtitle="Track and adjust stock levels"
        action={<Button onClick={() => setAdjustmentOpen(true)}>Stock Transfer</Button>}
      />

      <FilterBar>
        <Input
          id="search"
          placeholder="Search product..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Select
          id="warehouse"
          value={warehouseId}
          onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
          options={[{ value: '', label: 'All warehouses' }, ...(warehouses || [])]}
        />
        <Select
          id="status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'in_stock', label: 'In Stock' },
            { value: 'low', label: 'Low Stock' },
            { value: 'out', label: 'Out of Stock' },
          ]}
        />
      </FilterBar>

      <Card title="Current Inventory">
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={result?.data || []} />
            {result?.pagination?.totalPages > 1 && (
              <Pagination
                current={result.pagination.page}
                total={result.pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-3xl font-bold">{result?.data?.length || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-3xl font-bold">
            {formatCurrency(result?.data?.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0) || 0)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Low Stock Items</p>
          <p className="text-3xl font-bold text-yellow-600">
            {result?.data?.filter(item => item.quantity <= item.reorderLevel).length || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600">
            {result?.data?.filter(item => item.quantity === 0).length || 0}
          </p>
        </Card>
      </div>

      <Modal
        isOpen={adjustmentOpen && !!selectedItem}
        onClose={() => { setAdjustmentOpen(false); reset(); setSelectedItem(null); }}
        title={`${adjustmentType === 'add' ? 'Add' : 'Remove'} Stock - ${selectedItem?.productName}`}
      >
        <form onSubmit={handleSubmit(onAdjustment)} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Stock: <strong>{selectedItem?.quantity}</strong></p>
          </div>
          <Input
            id="quantity"
            label="Quantity"
            type="number"
            min="1"
            error={errors.quantity?.message}
            {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Minimum 1' } })}
          />
          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows="3"
              placeholder="Reason for adjustment"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setAdjustmentOpen(false); reset(); setSelectedItem(null); }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `${adjustmentType === 'add' ? 'Add' : 'Remove'} Stock`}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
