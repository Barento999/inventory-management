/**
 * Advanced data export utilities supporting multiple formats
 */

/**
 * Convert data to CSV format
 */
export function convertToCSV(data, columns = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get column names
  const cols = columns || Object.keys(data[0]);
  
  // Create CSV header
  const header = cols.map(col => `"${col}"`).join(',');
  
  // Create CSV rows
  const rows = data.map(row =>
    cols.map(col => {
      const value = row[col];
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const strValue = String(value).replace(/"/g, '""');
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue}"`;
      }
      return strValue;
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
}

/**
 * Convert data to JSON format
 */
export function convertToJSON(data, pretty = true) {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Convert data to XML format
 */
export function convertToXML(data, rootElement = 'data', itemElement = 'item') {
  if (!data || data.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}/>`;
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<${rootElement}>\n`;

  data.forEach(row => {
    xml += `  <${itemElement}>\n`;
    Object.entries(row).forEach(([key, value]) => {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      const escapedValue = escapeXml(String(value || ''));
      xml += `    <${sanitizedKey}>${escapedValue}</${sanitizedKey}>\n`;
    });
    xml += `  </${itemElement}>\n`;
  });

  xml += `</${rootElement}>`;
  return xml;
}

/**
 * Convert data to TSV (Tab-Separated Values)
 */
export function convertToTSV(data, columns = null) {
  if (!data || data.length === 0) {
    return '';
  }

  const cols = columns || Object.keys(data[0]);
  const header = cols.join('\t');
  const rows = data.map(row =>
    cols.map(col => String(row[col] || '')).join('\t')
  );
  
  return [header, ...rows].join('\n');
}

/**
 * Convert data to HTML table format
 */
export function convertToHTML(data, columns = null, title = 'Data Export') {
  if (!data || data.length === 0) {
    return '<p>No data to export</p>';
  }

  const cols = columns || Object.keys(data[0]);
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    tr:hover { background-color: #ddd; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead>
      <tr>
        ${cols.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${cols.map(col => `<td>${escapeHtml(String(row[col] || ''))}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
  
  return html;
}

/**
 * Download file with specified content
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export data to file
 */
export function exportData(data, filename, format = 'csv', options = {}) {
  let content, mimeType;

  switch (format.toLowerCase()) {
    case 'csv':
      content = convertToCSV(data, options.columns);
      mimeType = 'text/csv;charset=utf-8;';
      break;
    case 'tsv':
      content = convertToTSV(data, options.columns);
      mimeType = 'text/tab-separated-values;charset=utf-8;';
      break;
    case 'json':
      content = convertToJSON(data, options.pretty !== false);
      mimeType = 'application/json;charset=utf-8;';
      break;
    case 'xml':
      content = convertToXML(data, options.root || 'data', options.item || 'item');
      mimeType = 'application/xml;charset=utf-8;';
      break;
    case 'html':
      content = convertToHTML(data, options.columns, options.title || 'Data Export');
      mimeType = 'text/html;charset=utf-8;';
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  downloadFile(content, `${filename}.${format}`, mimeType);
}

/**
 * Copy data to clipboard as CSV
 */
export async function copyToClipboard(data, format = 'csv', columns = null) {
  let content;

  switch (format.toLowerCase()) {
    case 'csv':
      content = convertToCSV(data, columns);
      break;
    case 'json':
      content = convertToJSON(data);
      break;
    case 'tsv':
      content = convertToTSV(data, columns);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Generate shareable link for data
 */
export function generateShareableLink(data, format = 'json') {
  const encoded = btoa(JSON.stringify(data));
  const url = `${window.location.origin}?data=${encoded}&format=${format}`;
  return url;
}

/**
 * Parse shareable link
 */
export function parseShareableLink(url) {
  const params = new URLSearchParams(new URL(url).search);
  const data = params.get('data');
  const format = params.get('format');

  if (!data) return null;

  try {
    return {
      data: JSON.parse(atob(data)),
      format: format || 'json',
    };
  } catch (err) {
    console.error('Failed to parse shareable link:', err);
    return null;
  }
}

/**
 * Helper function to escape XML special characters
 */
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
