import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  selectable = false,
  onSelectChange,
  caption = null,
  striped = true,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedMobileRows, setExpandedMobileRows] = useState({});

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

  const toggleMobileRow = (id) => {
    setExpandedMobileRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  // Desktop table
  const desktopTable = (
    <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table
        className="min-w-full text-sm text-left"
        role="grid"
        aria-label="Data table"
        aria-rowcount={data.length}
        aria-colcount={columns.length + (selectable ? 1 : 0)}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr role="row">
            {selectable && (
              <th
                className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-12"
                scope="col"
                role="columnheader"
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  className="rounded cursor-pointer w-4 h-4"
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                scope="col"
                role="columnheader"
                aria-sort="none"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr
                key={row.id ?? i}
                role="row"
                aria-rowindex={i + 2}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  striped && i % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800' : ''
                } ${selectedIds.includes(row.id) ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      aria-label={`Select row ${i + 1}`}
                      className="rounded cursor-pointer w-4 h-4"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap"
                    role="gridcell"
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Mobile card layout
  const mobileCards = (
    <div className="sm:hidden space-y-3">
      {data.length > 0 ? (
        data.map((row, i) => (
          <div
            key={row.id ?? i}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              {selectable && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                  aria-label={`Select row ${i + 1}`}
                  className="rounded w-4 h-4"
                />
              )}
              <button
                onClick={() => toggleMobileRow(row.id)}
                className="ml-auto flex items-center text-primary hover:text-primary-light text-sm"
                aria-expanded={expandedMobileRows[row.id] || false}
                aria-label={`Toggle details for row ${i + 1}`}
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileRows[row.id] ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {columns.slice(0, 2).map((col) => (
                <div key={col.key}>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{col.title}</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {col.render ? col.render(row) : row[col.key]}
                  </p>
                </div>
              ))}
            </div>

            {expandedMobileRows[row.id] && columns.length > 2 && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {columns.slice(2).map((col) => (
                  <div key={col.key}>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{col.title}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {col.render ? col.render(row) : row[col.key]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      )}
    </div>
  );

  return (
    <>
      {desktopTable}
      {mobileCards}
    </>
  );
}
