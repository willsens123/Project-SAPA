/**
 * Reusable UTF-8 BOM CSV export utility for offline audit log archiving & reporting.
 */

export function escapeCsvCell(value: unknown): string {
  let str = String(value ?? '').replace(/\r?\n/g, ' ');
  // Guard against spreadsheet formula execution (CSV injection) while preserving '-' placeholders and '+62...' phones
  if (/^[=@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function sanitizeCsvFilenameSlug(value: string, maxLength = 28): string {
  const cleaned = (value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned.slice(0, maxLength);
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
  delimiter?: ',' | ';';
}

export interface DownloadCsvResult {
  filename: string;
  rowCount: number;
  generatedAtIso: string;
}

export function downloadAuditCsv({
  filename,
  headers,
  rows,
  delimiter = ',',
}: DownloadCsvOptions): DownloadCsvResult {
  const safeName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const csvHeaderLine = headers.map(escapeCsvCell).join(delimiter);
  const csvDataLines = rows.map((row) => row.map(escapeCsvCell).join(delimiter));
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

  return {
    filename: safeName,
    rowCount: rows.length,
    generatedAtIso: new Date().toISOString(),
  };
}
