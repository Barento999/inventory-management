import React from 'react';

const BulkCheckbox = ({ checked, indeterminate = false, onChange }) => {
  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  );
};

export default BulkCheckbox;
