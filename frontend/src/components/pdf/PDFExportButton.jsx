import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { usePDFExport } from '../../hooks/usePDFExport';

const PDFExportButton = ({
  documentType = 'invoice', // 'invoice', 'quote', 'report'
  documentId,
  reportType = 'sales', // for reports
  fileName,
  showView = true,
  showDownload = true,
  className = '',
}) => {
  const { loading, error, exportInvoicePDF, exportQuotePDF, exportReportPDF } =
    usePDFExport();

  const handleExport = async () => {
    let success = false;

    if (documentType === 'invoice') {
      success = await exportInvoicePDF(documentId, fileName);
    } else if (documentType === 'quote') {
      success = await exportQuotePDF(documentId, fileName);
    } else if (documentType === 'report') {
      success = await exportReportPDF(reportType, fileName);
    }

    if (success && error) {
      // Clear error after successful export
    }
  };

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-sm">
        Error: {error}
      </div>
    );
  }

  if (!showDownload && !showView) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showDownload && (
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {loading ? 'Exporting...' : 'Download PDF'}
          </span>
        </button>
      )}

      {showView && (
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {loading ? 'Loading...' : 'View'}
          </span>
        </button>
      )}
    </div>
  );
};

export default PDFExportButton;
