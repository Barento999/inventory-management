import React from 'react';
import { X } from 'lucide-react';

export default function Toast({ title, description = '', type = 'info', onClose }) {
  const bg = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-gray-600',
  }[type] || 'bg-gray-600';

  return (
    <div className={`max-w-xs w-full ${bg} text-white p-3 rounded shadow-lg flex items-start space-x-2`}>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
      <button onClick={onClose} className="p-1 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
