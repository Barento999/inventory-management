import React from 'react';

export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-200">{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-gray-200 dark:border-gray-600">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">No data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
