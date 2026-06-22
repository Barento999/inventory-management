import { useCallback, useState } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for exporting documents to PDF
 */
export function usePDFExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Export invoice to PDF
   */
  const exportInvoicePDF = useCallback(async (invoiceId, fileName = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/export/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        fileName || `Invoice-${invoiceId}-${new Date().toISOString().split('T')[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to export invoice';
      setError(message);
      console.error('Error exporting invoice:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export quote to PDF
   */
  const exportQuotePDF = useCallback(async (quoteId, fileName = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/export/quotes/${quoteId}/pdf`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        fileName || `Quote-${quoteId}-${new Date().toISOString().split('T')[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to export quote';
      setError(message);
      console.error('Error exporting quote:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export report to PDF
   */
  const exportReportPDF = useCallback(
    async (reportType = 'sales', fileName = null) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/export/reports/pdf`, {
          params: { report_type: reportType },
          responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          fileName ||
            `Report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
      } catch (err) {
        const message = err.response?.data?.detail || 'Failed to export report';
        setError(message);
        console.error('Error exporting report:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Open PDF in new tab instead of downloading
   */
  const openPDFInTab = useCallback(async (url) => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Error opening PDF:', err);
      setError('Failed to open PDF');
    }
  }, []);

  return {
    loading,
    error,
    exportInvoicePDF,
    exportQuotePDF,
    exportReportPDF,
    openPDFInTab,
  };
}
