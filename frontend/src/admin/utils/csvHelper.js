/**
 * Utility helper to export data arrays to CSV format client-side.
 * @param {Array<Object>} data - The raw data array.
 * @param {Array<Object>} headers - Column configuration: [{ label: 'Name', key: 'name' }]
 * @param {string} filename - The output filename.
 */
export const exportToCSV = (data, headers, filename = 'export.csv') => {
  if (!data || !data.length) return;

  const headerRow = headers.map(h => `"${String(h.label).replace(/"/g, '""')}"`).join(',');
  
  const bodyRows = data.map(item => {
    return headers.map(h => {
      let val = item[h.key];
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'boolean') {
        val = val ? 'TRUE' : 'FALSE';
      } else {
        val = String(val).replace(/"/g, '""');
      }
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...bodyRows].join('\n');
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
