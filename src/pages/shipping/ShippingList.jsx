import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PageHeader, { FilterBar } from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { salesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { ExternalLink } from 'lucide-react';

export default function ShippingList() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const { data: result, loading, reload } = useApi(
    () => salesApi.list({ search, status, page, pageSize: 10 }),
    [version, search, status, page]
  );

  const handleUpdateShipping = async (shippingData) => {
    try {
      await salesApi.updateShipping(selectedSale.id, shippingData);
      addToast({ title: 'Shipping info updated', type: 'success' });
      refresh();
      reload();
      setIsModalOpen(false);
      setSelectedSale(null);
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'id', title: 'Sale #', render: (row) => `#${row.id}` },
    { key: 'customerName', title: 'Customer' },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'shipping.carrier', title: 'Carrier', render: (row) => row.shipping?.carrier || '-' },
    { key: 'shipping.trackingNumber', title: 'Tracking #', render: (row) => (
      row.shipping?.trackingNumber ? (
        <a
          href={`https://www.google.com/search?q=${row.shipping.carrier}+tracking+${row.shipping.trackingNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1"
        >
          {row.shipping.trackingNumber} <ExternalLink className="w-3 h-3" />
        </a>
      ) : '-'
    ) },
    { key: 'shipping.estimatedDelivery', title: 'Est. Delivery', render: (row) => row.shipping?.estimatedDelivery || '-' },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'delivered' ? 'success' : row.status === 'shipped' ? 'primary' : 'default'}>
        {row.status}
      </Badge>
    ) },
    { key: 'actions', title: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setSelectedSale(row); setIsModalOpen(true); }}
          className="text-primary hover:underline text-sm"
        >
          Update Shipping
        </button>
        <Link to={`/sales/${row.id}`} className="text-primary hover:underline text-sm">View</Link>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Shipping"
        subtitle="Track and manage shipments"
      />

      <FilterBar>
        <Input
          id="search"
          placeholder="Search by customer or tracking #..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Select
          id="status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
          ]}
        />
      </FilterBar>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={(result?.data || []).filter(s => s.shipping)} />
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Shipping Info">
        {selectedSale && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleUpdateShipping({
              carrier: formData.get('carrier') || selectedSale.shipping?.carrier,
              trackingNumber: formData.get('trackingNumber') || selectedSale.shipping?.trackingNumber,
              shippingAddress: formData.get('shippingAddress') || selectedSale.shipping?.shippingAddress,
              shippingCost: Number(formData.get('shippingCost') || selectedSale.shipping?.shippingCost),
              estimatedDelivery: formData.get('estimatedDelivery') || selectedSale.shipping?.estimatedDelivery,
              actualDelivery: formData.get('actualDelivery') || selectedSale.shipping?.actualDelivery,
            });
          }} className="space-y-4">
            <Input
              id="carrier"
              label="Carrier"
              defaultValue={selectedSale.shipping?.carrier}
              name="carrier"
            />
            <Input
              id="trackingNumber"
              label="Tracking Number"
              defaultValue={selectedSale.shipping?.trackingNumber}
              name="trackingNumber"
            />
            <Input
              id="shippingAddress"
              label="Shipping Address"
              defaultValue={selectedSale.shipping?.shippingAddress}
              name="shippingAddress"
            />
            <Input
              id="shippingCost"
              label="Shipping Cost"
              type="number"
              step="0.01"
              defaultValue={selectedSale.shipping?.shippingCost}
              name="shippingCost"
            />
            <Input
              id="estimatedDelivery"
              label="Estimated Delivery"
              type="date"
              defaultValue={selectedSale.shipping?.estimatedDelivery}
              name="estimatedDelivery"
            />
            <Input
              id="actualDelivery"
              label="Actual Delivery"
              type="date"
              defaultValue={selectedSale.shipping?.actualDelivery}
              name="actualDelivery"
            />
            <div className="flex gap-2">
              <Button type="submit">Update Shipping</Button>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
