/**
 * Reusable UTF-8 BOM CSV export utility for offline audit log reporting & documentation.
 */

export function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  return `"${str.replace(/"/g, '""')}"`;
}

export function formatCsvDateTag(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}_${hh}-${mm}`;
}

export interface DownloadCsvOptions {
  filename: string;
  headers: string[];
  rows: unknown[][];
}

export function downloadAuditCsv({ filename, headers, rows }: DownloadCsvOptions): void {
  const safeName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const csvHeaderLine = headers.map(escapeCsvCell).join(',');
  const csvDataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  // Prepend UTF-8 BOM so Excel / spreadsheet apps render Indonesian text cleanly offline
  const csvContent = '\uFEFF' + [csvHeaderLine, ...csvDataLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', safeName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
