import React, { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import { Trash2, Download, Edit } from 'lucide-react';

export default function BulkActions({ selectedIds, onBulkDelete, onBulkExport, onBulkEdit, entityType }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');

  if (selectedIds.length === 0) return null;

  const handleBulkDelete = async () => {
    await onBulkDelete(selectedIds);
    setIsDeleteModalOpen(false);
  };

  const handleBulkEdit = async () => {
    if (!editField || !editValue) return;
    await onBulkEdit(selectedIds, editField, editValue);
    setIsEditModalOpen(false);
    setEditField('');
    setEditValue('');
  };

  const getEditFields = () => {
    switch (entityType) {
      case 'products':
        return [
          { value: 'status', label: 'Status' },
          { value: 'reorderLevel', label: 'Reorder Level' },
          { value: 'warehouseId', label: 'Warehouse' },
        ];
      case 'customers':
        return [
          { value: 'status', label: 'Status' },
        ];
      case 'suppliers':
        return [
          { value: 'status', label: 'Status' },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 flex items-center justify-between">
        <span className="text-sm font-medium">{selectedIds.length} items selected</span>
        <div className="flex gap-2">
          {onBulkEdit && (
            <Button size="sm" variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-1" /> Bulk Edit
            </Button>
          )}
          {onBulkExport && (
            <Button size="sm" variant="secondary" onClick={() => onBulkExport(selectedIds)}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          )}
          {onBulkDelete && (
            <Button size="sm" variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Bulk Delete">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete {selectedIds.length} items? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleBulkDelete}>Delete</Button>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Bulk Edit">
        <div className="space-y-4">
          <Select
            id="editField"
            label="Field to Edit"
            value={editField}
            onChange={(e) => setEditField(e.target.value)}
            options={[{ value: '', label: 'Select field' }, ...getEditFields()]}
          />
          <Input
            id="editValue"
            label="New Value"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter new value"
          />
          <div className="flex gap-2">
            <Button onClick={handleBulkEdit} disabled={!editField || !editValue}>Update</Button>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
