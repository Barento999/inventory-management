import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm', message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p>{message}</p>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => {
          onConfirm();
          onClose();
        }}>Confirm</Button>
      </div>
    </Modal>
  );
}
