import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file
 * @param {Array} columns - Column configuration (optional, auto-detect if not provided)
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns from data if not provided
  const cols = columns || Object.keys(data[0]);

  // Create CSV header
  const header = cols.map(col => {
    const headerText = typeof col === 'string' ? col : col.key || col;
    return `"${headerText}"`;
  }).join(',');

  // Create CSV rows
  const rows = data.map(item => {
    return cols.map(col => {
      const key = typeof col === 'string' ? col : col.key || col;
      let value = item[key];

      // Handle nested objects
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }

      // Escape quotes and wrap in quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
      }

      return `"${value ?? ''}"`;
    }).join(',');
  });

  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the PDF file
 * @param {Object} options - Configuration options
 */
export const exportToPDF = (data, filename = 'export.pdf', options = {}) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const {
    title = 'Data Export',
    columns = null,
    pageOrientation = 'portrait',
    fontSize = 10,
    headerFontSize = 12,
  } = options;

  // Determine columns from data if not provided
  const cols = columns || Object.keys(data[0]);

  // Prepare table data
  const headers = cols.map(col => (typeof col === 'string' ? col : col.label || col.key || col));

  const rows = data.map(item => {
    return cols.map(col => {
      const key = typeof col === 'string' ? col : col.key || col;
      let value = item[key];

      // Handle nested objects
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }

      // Format dates
      if (value instanceof Date) {
        value = value.toLocaleDateString();
      }

      return value ?? '';
    });
  });

  // Create PDF
  const doc = new jsPDF({
    orientation: pageOrientation,
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  if (title) {
    doc.setFontSize(headerFontSize);
    doc.text(title, 14, 15);
  }

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: title ? 25 : 14,
    styles: {
      fontSize,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    didDrawPage: (data) => {
      // Footer
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      const pageWidth = pageSize.getWidth();
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${doc.internal.pages.length - 1}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        14,
        pageHeight - 10
      );
    },
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Export data to JSON format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the JSON file
 */
export const exportToJSON = (data, filename = 'export.json') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy data to clipboard as JSON
 * @param {Array} data - Array of objects to copy
 */
export const copyToClipboard = async (data) => {
  try {
    const json = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(json);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};
