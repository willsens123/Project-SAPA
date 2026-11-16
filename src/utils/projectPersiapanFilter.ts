import { ProjectItem } from '../types';
import {
  parseFinancialDateToIso,
  normalizeDateRange,
} from './financialDateFilter';

const MONTH_NAME_PATTERN =
  '(?:jan(?:uari|uary)?|feb(?:ruari|ruary)?|mar(?:et|ch)?|apr(?:il)?|mei|may|jun(?:i|e)?|jul(?:i|y)?|agu(?:stus)?|agt|aug(?:ust)?|sep(?:tember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|des(?:ember)?|dec(?:ember)?)';

const YEAR_PATTERN = '(?:19|20)\\d{2}';

function extractMonthAndYearFromToken(text: string): {
  month: string | null;
  year: string | null;
} {
  const monthMatch = text.match(new RegExp(`(${MONTH_NAME_PATTERN})`, 'i'));
  const yearMatch = text.match(new RegExp(`(${YEAR_PATTERN})`));
  return {
    month: monthMatch ? monthMatch[1] : null,
    year: yearMatch ? yearMatch[1] : null,
  };
}

function parseStartTokenWithEndContext(startPart: string, endPart: string): string | null {
  const trimmedStart = startPart.trim();
  if (!trimmedStart) return null;

  // ISO format direct
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmedStart)) {
    return parseFinancialDateToIso(trimmedStart);
  }

  const startInfo = extractMonthAndYearFromToken(trimmedStart);
  const endInfo = extractMonthAndYearFromToken(endPart);

  // Case 1: Day-only start token like "1" in "1 - 14 Nov 2021"
  if (/^\d{1,2}$/.test(trimmedStart)) {
    const monthPart = endInfo.month ? ` ${endInfo.month}` : '';
    const yearPart = endInfo.year ? ` ${endInfo.year}` : '';
    return parseFinancialDateToIso(`${trimmedStart}${monthPart}${yearPart}`.trim());
  }

  // Case 2: Day + month without year like "21 Okt" in "21 Okt - 12 Nov 2021" or "1 Nov - 14 Des 2023"
  if (startInfo.month && !startInfo.year && endInfo.year) {
    return parseFinancialDateToIso(`${trimmedStart} ${endInfo.year}`);
  }

  return parseFinancialDateToIso(trimmedStart);
}

/**
 * Mengurai rentang tanggal 'Date Range Persiapan' milik proyek menjadi pasangan ISO YYYY-MM-DD.
 * Mendukung berbagai format di Proyek SAPA seperti:
 * - "21 Okt - 12 Nov 2021"
 * - "1 - 14 Nov 2021"
 * - "1 Des 2021 - 4 Jan 2022"
 * - "1 Nov - 14 Des 2023"
 * - "2026-11-01 - 2026-11-20"
 * - "12-13 Nov 2021"
 */
export function resolveProjectPersiapanRangeIso(project: ProjectItem): {
  startIso: string | null;
  endIso: string | null;
} {
  let startIso = project.persiapanStart
    ? parseFinancialDateToIso(project.persiapanStart)
    : null;
  let endIso = project.persiapanEnd
    ? parseFinancialDateToIso(project.persiapanEnd)
    : null;

  if ((!startIso || !endIso) && project.dateRangePersiapan) {
    const raw = project.dateRangePersiapan.trim();
    if (raw && raw !== '-') {
      // Split explicit range separators (" - ", " – ", " — ", " s/d ")
      const rangeParts = raw
        .split(/\s+[-–—]\s+|\s+s\/d\s+/i)
        .map((p) => p.trim())
        .filter(Boolean);

      if (rangeParts.length >= 2) {
        const firstPart = rangeParts[0];
        const lastPart = rangeParts[rangeParts.length - 1];
        const parsedEnd = parseFinancialDateToIso(lastPart);
        const parsedStart = parseStartTokenWithEndContext(firstPart, lastPart);

        if (!startIso && parsedStart) startIso = parsedStart;
        if (!endIso && parsedEnd) endIso = parsedEnd;
      } else {
        // Compact range without spaces around hyphen, e.g. "12-13 Nov 2021"
        const compactMatch = raw.match(
          new RegExp(
            `^(\\d{1,2})\\s*[-–]\\s*(\\d{1,2}\\s+${MONTH_NAME_PATTERN}(?:\\s+${YEAR_PATTERN})?)$`,
            'i'
          )
        );
        if (compactMatch) {
          const parsedEnd = parseFinancialDateToIso(compactMatch[2]);
          const parsedStart = parseStartTokenWithEndContext(compactMatch[1], compactMatch[2]);
          if (!startIso && parsedStart) startIso = parsedStart;
          if (!endIso && parsedEnd) endIso = parsedEnd;
        } else {
          const singleIso = parseFinancialDateToIso(raw);
          if (!startIso && singleIso) startIso = singleIso;
          if (!endIso && singleIso) endIso = singleIso;
        }
      }
    }
  }

  if (startIso && !endIso) endIso = startIso;
  if (!startIso && endIso) startIso = endIso;

  if (startIso && endIso && startIso > endIso) {
    return { startIso: endIso, endIso: startIso };
  }

  return { startIso, endIso };
}

/**
 * Mengecek apakah rentang 'Date Range Persiapan' proyek beririsan (overlap) dengan
 * rentang filter [filterStart, filterEnd] secara inklusif.
 */
export function isProjectPersiapanInRange(
  project: ProjectItem,
  filterStart: string,
  filterEnd: string
): boolean {
  const { start, end } = normalizeDateRange(filterStart, filterEnd);
  if (!start && !end) return true;

  const { startIso, endIso } = resolveProjectPersiapanRangeIso(project);
  if (!startIso && !endIso) return false;

  const effStart = startIso || endIso!;
  const effEnd = endIso || startIso!;

  if (start && effEnd < start) return false;
  if (end && effStart > end) return false;

  return true;
}

export function addDaysToIso(baseIso: string, deltaDays: number): string {
  const parts = baseIso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return baseIso;
  }
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + deltaDays));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
