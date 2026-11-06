/**
 * Helper utility for generating and formatting transaction codes (Kode Transaksi)
 * across Transaksi S-SALUR, Transaksi A-AJAR, and Transaksi D-DONASI.
 *
 * Format:
 * [S/A/D]-[Via] [YY][MM][DD][Urutan 5 digit]
 * Contoh: S-Call Center 26101200001
 * - S/A/D: S-SALUR, A-AJAR, D-DONASI
 * - Call Center: via Transaksi
 * - 26: Tahun
 * - 10: Bulan
 * - 12: Tanggal
 * - 00001: Urutan transaksi per tahunnya (5 digit dengan leading zeros)
 */

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  januari: '01',
  january: '01',
  feb: '02',
  februari: '02',
  february: '02',
  mar: '03',
  maret: '03',
  march: '03',
  apr: '04',
  april: '04',
  mei: '05',
  may: '05',
  jun: '06',
  juni: '06',
  june: '06',
  jul: '07',
  juli: '07',
  july: '07',
  agu: '08',
  ags: '08',
  agust: '08',
  agustus: '08',
  aug: '08',
  august: '08',
  sep: '09',
  sept: '09',
  september: '09',
  okt: '10',
  oktober: '10',
  oct: '10',
  october: '10',
  nov: '11',
  nop: '11',
  november: '11',
  des: '12',
  desember: '12',
  dec: '12',
  december: '12',
};

/**
 * Normalizes a via string:
 * - If missing or empty -> 'Call Center'
 * - 'CC' -> 'Call Center'
 */
export function normalizeVia(via?: string): string {
  if (!via) return 'Call Center';
  const trimmed = via.trim();
  if (!trimmed) return 'Call Center';
  if (trimmed.toUpperCase() === 'CC') return 'Call Center';
  return trimmed;
}

/**
 * Parses date string (Indonesian or ISO) or Date object into { yy, mm, dd, year }
 */
export function parseDateToComponents(dateInput?: string | Date): {
  yy: string;
  mm: string;
  dd: string;
  year: number;
} {
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    const year = dateInput.getFullYear();
    const yy = String(year).slice(-2);
    const mm = String(dateInput.getMonth() + 1).padStart(2, '0');
    const dd = String(dateInput.getDate()).padStart(2, '0');
    return { yy, mm, dd, year };
  }

  if (typeof dateInput === 'string' && dateInput.trim()) {
    const trimmed = dateInput.trim();

    // Check for DD Mon YYYY format (e.g. "12 Okt 2026", "14 Nov 2021", "15 Jan 2017")
    const words = trimmed.split(/[\s,]+/);
    if (words.length >= 3) {
      let dayStr = '';
      let monStr = '';
      let yearStr = '';

      // Check if format is "DD Mon YYYY"
      if (/^\d{1,2}$/.test(words[0]) && /^\d{4}$/.test(words[2])) {
        dayStr = words[0];
        monStr = words[1].toLowerCase();
        yearStr = words[2];
      } else if (/^\d{4}$/.test(words[0]) && /^\d{1,2}$/.test(words[2])) {
        // YYYY Mon DD
        yearStr = words[0];
        monStr = words[1].toLowerCase();
        dayStr = words[2];
      }

      if (yearStr && dayStr && MONTH_MAP[monStr]) {
        const year = parseInt(yearStr, 10);
        const yy = yearStr.slice(-2);
        const mm = MONTH_MAP[monStr];
        const dd = dayStr.padStart(2, '0');
        return { yy, mm, dd, year };
      }
    }

    // Check ISO / standard formats like YYYY-MM-DD or DD-MM-YYYY or DD/MM/YYYY
    const parts = trimmed.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const year = parseInt(parts[0], 10);
        const yy = parts[0].slice(-2);
        const mm = (MONTH_MAP[parts[1].toLowerCase()] || parts[1]).padStart(2, '0');
        const dd = parts[2].padStart(2, '0');
        return { yy, mm, dd, year };
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        const year = parseInt(parts[2], 10);
        const yy = parts[2].slice(-2);
        const mm = (MONTH_MAP[parts[1].toLowerCase()] || parts[1]).padStart(2, '0');
        const dd = parts[0].padStart(2, '0');
        return { yy, mm, dd, year };
      }
    }

    // Standard Date parsing fallback
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const yy = String(year).slice(-2);
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return { yy, mm, dd, year };
    }
  }

  // Fallback to today
  const now = new Date();
  const year = now.getFullYear();
  const yy = String(year).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return { yy, mm, dd, year };
}

/**
 * Calculates the next sequence number for transactions within the specified year.
 * e.g. If there are 3 transactions in 2026, returns 4.
 */
export function getUrutanTransaksiPerTahun(
  existingItems: Array<{ date?: string; orderNumber?: string }>,
  targetDateInput?: string | Date
): number {
  const { year: targetYear } = parseDateToComponents(targetDateInput);
  let maxSeq = 0;
  let countInYear = 0;

  for (const it of existingItems) {
    const itYear = parseDateToComponents(it.date).year;
    if (itYear === targetYear) {
      countInYear++;
      const orderNum = it.orderNumber || '';
      // Match 5 digits at end of code
      const match5 = orderNum.match(/\d{6}(\d{5})$/);
      if (match5) {
        const num = parseInt(match5[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      } else {
        // Match 3 or more digits at end of code (legacy)
        const matchAny = orderNum.match(/(\d{3,5})$/);
        if (matchAny) {
          const num = parseInt(matchAny[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }
  }

  return Math.max(countInYear + 1, maxSeq + 1);
}

/**
 * Generates transaction code according to the formula:
 * [S/A/D]-[via] [YY][MM][DD][urutan 5 digit]
 * e.g. 'S-Call Center 26101200001'
 */
export function generateKodeTransaksi(
  type: 'S' | 'A' | 'D',
  via?: string,
  dateInput?: string | Date,
  sequenceOfYear: number = 1
): string {
  const cleanVia = normalizeVia(via);
  const { yy, mm, dd } = parseDateToComponents(dateInput);
  const urutan = String(Math.max(1, sequenceOfYear)).padStart(5, '0');
  return `${type}-${cleanVia} ${yy}${mm}${dd}${urutan}`;
}

/**
 * Formats a transaction code for display next to "Status Pesanan".
 * Ensures standard format: e.g. "S-Call Center 26101200001"
 */
export function formatDisplayKodeTransaksi(
  type: 'S' | 'A' | 'D',
  item?: { orderNumber?: string; via?: string; date?: string; id?: string },
  fallbackSequence: number = 1
): string {
  if (!item) {
    return generateKodeTransaksi(type, 'Call Center', new Date(), fallbackSequence);
  }

  const orderNum = (item.orderNumber || '').trim();

  // 1. Strict exact match: S-Call Center 26101200001
  const exactRegex = new RegExp(`^${type}-(.+) (\\d{2})(\\d{2})(\\d{2})(\\d{5})$`);
  if (exactRegex.test(orderNum)) {
    return orderNum;
  }

  // 2. Already starts with prefix S-, A-, or D- but maybe with 3 digits or different spacing
  const prefixRegex = new RegExp(`^([SAD])-([^0-9]+?)\\s*(\\d{2})(\\d{2})(\\d{2})(\\d+)$`);
  const prefixMatch = orderNum.match(prefixRegex);
  if (prefixMatch) {
    const [, , rawVia, yy, mm, dd, rawSeq] = prefixMatch;
    const cleanVia = normalizeVia(rawVia || item.via);
    const seqNum = parseInt(rawSeq, 10) || fallbackSequence;
    const urutan = String(seqNum).padStart(5, '0');
    return `${type}-${cleanVia} ${yy}${mm}${dd}${urutan}`;
  }

  // 3. Legacy format: "CC 211114001" or "CC 123456789"
  const legacyRegex = /^([A-Za-z]+)\s*(\d{2})(\d{2})(\d{2})(\d+)$/;
  const legacyMatch = orderNum.match(legacyRegex);
  if (legacyMatch) {
    const [, rawVia, yy, mm, dd, rawSeq] = legacyMatch;
    const cleanVia = normalizeVia(item.via || rawVia);
    const seqNum = parseInt(rawSeq, 10) || fallbackSequence;
    const urutan = String(seqNum).padStart(5, '0');
    return `${type}-${cleanVia} ${yy}${mm}${dd}${urutan}`;
  }

  // 4. Default: generate from via, date, and sequence
  const cleanVia = normalizeVia(item.via);
  return generateKodeTransaksi(type, cleanVia, item.date, fallbackSequence);
}
