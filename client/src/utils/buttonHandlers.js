/**
 * Utility functions for common button actions
 * Centralized handlers for consistent behavior across the app
 */

/**
 * Export data as CSV file
 */
export const exportAsCSV = (filename, headers, data) => {
  const csv = [
    headers,
    ...data
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Export data as JSON file
 */
export const exportAsJSON = (filename, data) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Generate QR Code and download
 */
export const generateAndDownloadQR = async (data, filename) => {
  // Using QR code API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;

  const link = document.createElement('a');
  link.href = qrApiUrl;
  link.download = `${filename}_qr.png`;
  link.click();
};

/**
 * Generate Barcode and download
 */
export const generateAndDownloadBarcode = async (data, filename) => {
  // Using barcode API
  const barcodeApiUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(data)}&code=Code128&dpi=96&print=true`;

  const link = document.createElement('a');
  link.href = barcodeApiUrl;
  link.download = `${filename}_barcode.png`;
  link.click();
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Print document
 */
export const printDocument = (elementId = null) => {
  if (elementId) {
    const printContents = document.getElementById(elementId)?.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  } else {
    window.print();
  }
};

/**
 * Download file from URL
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};

/**
 * Share data (using Web Share API if available)
 */
export const shareData = async (title, text, url) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (err) {
      console.error('Share failed:', err);
      return false;
    }
  }
  return false;
};
