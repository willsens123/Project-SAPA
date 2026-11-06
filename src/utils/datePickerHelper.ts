/**
 * Helper to format date input (YYYY-MM-DD) into Indonesian standard date formats.
 * Example: "2021-11-15" -> "15 Nov 2021"
 */
export function formatDatePickerValue(val: string): string {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return val;
}

/**
 * Example: "2021-11" -> "Nov 2021"
 */
export function formatMonthPickerValue(val: string): string {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const dateObj = new Date(year, month, 1);
    return dateObj.toLocaleDateString('id-ID', {
      month: 'short',
      year: 'numeric',
    });
  }
  return val;
}

/**
 * Robust parsing of date strings in various formats:
 * - "2021-11-15"
 * - "15 Nov 2021", "15 November 2021"
 * - "15/11/2021"
 */
export function parseDateString(str: string | undefined | null): Date | null {
  if (!str) return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const indonesianMonths: Record<string, number> = {
    jan: 0, januari: 0,
    feb: 1, februari: 1,
    mar: 2, maret: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    agu: 7, agustus: 7, aug: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11,
  };

  const parts = trimmed.split(/[\s\-\/]+/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[2], 10);
    const monthKey = parts[1].toLowerCase();

    if (!isNaN(p0) && monthKey in indonesianMonths && !isNaN(p2)) {
      return new Date(p2, indonesianMonths[monthKey], p0);
    }

    const p1 = parseInt(parts[1], 10);
    if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
      if (p2 > 1000) {
        return new Date(p2, p1 - 1, p0);
      }
    }
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

