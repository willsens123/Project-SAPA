const MONTH_MAP: Record<string, number> = {
  jan: 0,
  januari: 0,
  january: 0,
  feb: 1,
  februari: 1,
  february: 1,
  mar: 2,
  maret: 2,
  march: 2,
  apr: 3,
  april: 3,
  mei: 4,
  may: 4,
  jun: 5,
  juni: 5,
  june: 5,
  jul: 6,
  juli: 6,
  july: 6,
  agu: 7,
  agustus: 7,
  aug: 7,
  august: 7,
  sep: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  des: 11,
  desember: 11,
  dec: 11,
  december: 11,
};

const MONTH_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function buildIso(year: number, monthIndex: number, day: number): string | null {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(monthIndex) ||
    !Number.isFinite(day) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/**
 * Mengonversi berbagai format tanggal yang dipakai di modul ERP YPPLN menjadi format ISO YYYY-MM-DD.
 * Mendukung:
 * - "2026-11-12" atau "2026-11-12T08:30:00Z"
 * - "1/Nov", "15/Jan/20", "15/Jan/2021"
 * - "14 Nov 2021", "24 Nov2021", "10 Des 2020", "12 November 2026"
 * - "12/11/2026", "14/11/21"
 */
export function parseFinancialDateToIso(dateStr?: string): string | null {
  if (!dateStr) return null;
  const raw = dateStr.trim();
  if (!raw) return null;

  // 1. ISO format: YYYY-MM-DD (optionally with timestamp)
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const monthIndex = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return buildIso(year, monthIndex, day);
  }

  // 2. Slash formats: "1/Nov", "15/Jan/20", "12/11/2026", "14/11/21"
  if (raw.includes('/')) {
    const parts = raw.split('/').map((p) => p.trim());
    if (parts.length >= 2) {
      const day = parseInt(parts[0].replace(/[^0-9]/g, ''), 10);
      const middleAlpha = parts[1].toLowerCase().replace(/[^a-z]/g, '');
      if (middleAlpha.length >= 3) {
        const monthIndex = MONTH_MAP[middleAlpha] ?? MONTH_MAP[middleAlpha.slice(0, 3)];
        if (monthIndex !== undefined && !isNaN(day)) {
          let year = 2021;
          if (parts[2]) {
            const yrNum = parseInt(parts[2].replace(/[^0-9]/g, ''), 10);
            if (!isNaN(yrNum)) {
              year = yrNum < 100 ? 2000 + yrNum : yrNum;
            }
          }
          return buildIso(year, monthIndex, day);
        }
      } else {
        // Numeric DD/MM/YYYY or DD/MM/YY
        const monthNum = parseInt(parts[1].replace(/[^0-9]/g, ''), 10);
        if (!isNaN(day) && !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
          let year = 2021;
          if (parts[2]) {
            const yrNum = parseInt(parts[2].replace(/[^0-9]/g, ''), 10);
            if (!isNaN(yrNum)) {
              year = yrNum < 100 ? 2000 + yrNum : yrNum;
            }
          }
          return buildIso(year, monthNum - 1, day);
        }
      }
    }
  }

  // 3. Space/dash word formats, including attached year like "24 Nov2021"
  const normalized = raw
    .toLowerCase()
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2');
  const tokens = normalized.split(/[\s,-]+/).filter(Boolean);

  let foundMonth: number | undefined;
  const numericTokens: number[] = [];

  for (const token of tokens) {
    const alpha = token.replace(/[^a-z]/g, '');
    if (alpha.length >= 3 && foundMonth === undefined) {
      const m = MONTH_MAP[alpha] ?? MONTH_MAP[alpha.slice(0, 3)];
      if (m !== undefined) {
        foundMonth = m;
        continue;
      }
    }
    if (/^\d+$/.test(token)) {
      numericTokens.push(parseInt(token, 10));
    }
  }

  if (foundMonth !== undefined) {
    let day = 1;
    let year = 2021;

    if (numericTokens.length >= 2) {
      if (numericTokens[0] > 1900) {
        year = numericTokens[0];
        day = numericTokens[1];
      } else {
        day = numericTokens[0];
        const yVal = numericTokens[numericTokens.length - 1];
        year = yVal < 100 ? 2000 + yVal : yVal;
      }
    } else if (numericTokens.length === 1) {
      if (numericTokens[0] > 1900) {
        year = numericTokens[0];
      } else {
        day = numericTokens[0];
      }
    }

    return buildIso(year, foundMonth, day);
  }

  return null;
}

/**
 * Mengembalikan pasangan [effectiveStart, effectiveEnd] yang terurut meski pengguna memilih end < start.
 */
export function normalizeDateRange(
  startDate: string,
  endDate: string
): { start: string; end: string } {
  const s = startDate.trim();
  const e = endDate.trim();
  if (s && e && s > e) {
    return { start: e, end: s };
  }
  return { start: s, end: e };
}

/**
 * Mengecek apakah tanggal transaksi berada dalam rentang [startDate, endDate] inklusif.
 */
export function isDateInRange(
  dateStr: string | undefined,
  startDate: string,
  endDate: string
): boolean {
  const { start, end } = normalizeDateRange(startDate, endDate);
  if (!start && !end) return true;

  const iso = parseFinancialDateToIso(dateStr);
  if (!iso) return false;

  if (start && iso < start) return false;
  if (end && iso > end) return false;
  return true;
}

export function formatIsoDateIndo(isoDate?: string): string {
  if (!isoDate) return '-';
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const year = match[1];
  const monthIndex = parseInt(match[2], 10) - 1;
  const day = match[3];
  const monthLabel = MONTH_SHORT_ID[monthIndex] || match[2];
  return `${day} ${monthLabel} ${year}`;
}

export function formatDateRangeLabel(startDate: string, endDate: string): string {
  const { start, end } = normalizeDateRange(startDate, endDate);
  if (start && end) {
    return `${formatIsoDateIndo(start)} – ${formatIsoDateIndo(end)}`;
  }
  if (start) {
    return `Mulai ${formatIsoDateIndo(start)}`;
  }
  if (end) {
    return `Hingga ${formatIsoDateIndo(end)}`;
  }
  return 'Semua Periode';
}
