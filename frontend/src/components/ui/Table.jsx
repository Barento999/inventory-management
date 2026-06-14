import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function Table({ columns = [], data = [], selectable = false, onSelectChange }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const newSelected = checked ? data.map(row => row.id) : [];
    setSelectedIds(newSelected);
    onSelectChange?.(newSelected);
  };

  const handleSelectRow = (id) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelected);
    onSelectChange?.(newSelected);
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {selectable && (
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-200 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 font-medium text-gray-600 dark:text-gray-200 whitespace-nowrap">{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={row.id ?? i} className={`border-b border-gray-200 dark:border-gray-600 ${selectedIds.includes(row.id) ? 'bg-primary/10' : ''}`}>
                {selectable && (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="rounded"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 whitespace-nowrap">{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">No data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
