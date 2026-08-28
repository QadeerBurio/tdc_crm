export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(',')).join('\n');
  const csvContent = "data:text/csv;charset=utf-8," + headers + '\n' + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename || "export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data, filename) => {
  console.log('PDF export not fully implemented', data);
  alert('PDF export requires additional libraries like jspdf. For now, try CSV export.');
};

export default {
  exportToCSV,
  exportToPDF,
};
