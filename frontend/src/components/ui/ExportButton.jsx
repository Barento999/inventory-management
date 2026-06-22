import React, { useState } from 'react';
import { Download, ChevronDown, Copy } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToJSON, copyToClipboard } from '../../utils/exportData';

const ExportButton = ({ data, filename = 'export', title = 'Data Export', columns = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV(data, filename, columns);
    } else if (format === 'pdf') {
      exportToPDF(data, filename, { title, columns });
    } else if (format === 'json') {
      exportToJSON(data, filename);
    }
    setIsOpen(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(data);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">CSV</span>
            Export as CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">PDF</span>
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">JSON</span>
            Export as JSON
          </button>
          <hr className="my-1 dark:border-gray-700" />
          <button
            onClick={handleCopy}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
