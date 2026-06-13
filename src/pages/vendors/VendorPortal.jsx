import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/shared/PageHeader';
import { useApi } from '../../hooks/useApi';
import { suppliersApi, purchasesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Building2, Mail, Phone, MapPin, User } from 'lucide-react';

export default function VendorPortal() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: suppliers, loading: suppliersLoading, reload: reloadSuppliers } = useApi(
    () => suppliersApi.list(),
    [version]
  );
  const { data: purchases, loading: purchasesLoading, reload: reloadPurchases } = useApi(
    () => purchasesApi.list(),
    [version]
  );

  const handleUpdate = async (data) => {
    try {
      await suppliersApi.update(selectedSupplier.id, data);
      addToast({ title: 'Supplier updated', type: 'success' });
      refresh();
      reloadSuppliers();
      setIsModalOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const columns = [
    { key: 'name', title: 'Company' },
    { key: 'contactPerson', title: 'Contact' },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: 'Phone' },
    { key: 'actions', title: 'Actions', render: (row) => (
      <Button size="sm" variant="secondary" onClick={() => { setSelectedSupplier(row); setIsModalOpen(true); }}>
        View Portal
      </Button>
    ) },
  ];

  const purchaseColumns = [
    { key: 'id', title: 'PO #', render: (row) => `#${row.id}` },
    { key: 'total', title: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', title: 'Status', render: (row) => (
      <Badge variant={row.status === 'received' ? 'success' : row.status === 'ordered' ? 'primary' : 'default'}>
        {row.status}
      </Badge>
    ) },
    { key: 'approvalStatus', title: 'Approval', render: (row) => (
      <Badge variant={row.approvalStatus === 'approved' ? 'success' : row.approvalStatus === 'rejected' ? 'danger' : 'warning'}>
        {row.approvalStatus || 'pending'}
      </Badge>
    ) },
    { key: 'expectedDate', title: 'Expected' },
    { key: 'createdAt', title: 'Created', render: (row) => formatDateTime(row.createdAt) },
  ];

  const supplierPurchases = selectedSupplier
    ? (purchases?.data || []).filter(p => p.supplierId === selectedSupplier.id)
    : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vendor Portal"
        subtitle="Manage supplier relationships and purchase orders"
      />

      <Card title="Suppliers">
        {suppliersLoading ? <Loader /> : <Table columns={columns} data={suppliers?.data || []} />}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Vendor Portal - ${selectedSupplier?.name}`}>
        {selectedSupplier && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{selectedSupplier.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{selectedSupplier.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedSupplier.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedSupplier.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedSupplier.address}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Purchase Orders</h3>
              {purchasesLoading ? <Loader /> : (
                <Table columns={purchaseColumns} data={supplierPurchases} />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Update Information</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdate({
                  name: formData.get('name'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  address: formData.get('address'),
                  contactPerson: formData.get('contactPerson'),
                });
              }} className="space-y-4">
                <Input id="name" label="Company Name" defaultValue={selectedSupplier.name} name="name" />
                <Input id="contactPerson" label="Contact Person" defaultValue={selectedSupplier.contactPerson} name="contactPerson" />
                <Input id="email" label="Email" type="email" defaultValue={selectedSupplier.email} name="email" />
                <Input id="phone" label="Phone" defaultValue={selectedSupplier.phone} name="phone" />
                <Input id="address" label="Address" defaultValue={selectedSupplier.address} name="address" />
                <div className="flex gap-2">
                  <Button type="submit">Update</Button>
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
