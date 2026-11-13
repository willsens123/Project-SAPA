import { ProjectItem, TodoTaskItem } from '../types';
import {
  parseFinancialDateToIso,
  formatIsoDateIndo,
} from './financialDateFilter';

const MONTH_NAME_REGEX =
  '(?:jan(?:uari|uary)?|feb(?:ruari|ruary)?|mar(?:et|ch)?|apr(?:il)?|mei|may|jun(?:i|e)?|jul(?:i|y)?|agu(?:stus)?|agt|aug(?:ust)?|sep(?:tember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|des(?:ember)?|dec(?:ember)?)';

const YEAR_REGEX = /(?:19|20)\d{2}/;

function extractEndDateFromRangeString(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '-') return null;

  // 1. Direct single ISO date or simple date string (no range hyphen between dates)
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    return parseFinancialDateToIso(trimmed);
  }

  // Split range by " - " or " s/d " or " – "
  const rangeParts = trimmed
    .split(/\s+[-–—]\s+|\s+s\/d\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (rangeParts.length >= 2) {
    const endPart = rangeParts[rangeParts.length - 1];
    // Try parsing endPart directly (e.g. "20 Nov 2021" or "1 Jan 2022")
    const endIsoDirect = parseFinancialDateToIso(endPart);
    if (endIsoDirect && (endPart.match(new RegExp(MONTH_NAME_REGEX, 'i')) || /\d{4}/.test(endPart))) {
      return endIsoDirect;
    }

    // Handle "12 - 13 Nov 2021" where startPart has only day and endPart has "13 Nov 2021"
    return parseFinancialDateToIso(endPart);
  }

  // Handle compact hyphen range without spaces around hyphen like "12-13 Nov 2021"
  const compactMatch = trimmed.match(
    new RegExp(`^\\d{1,2}\\s*[-–]\\s*(\\d{1,2}\\s+${MONTH_NAME_REGEX}(?:\\s+${YEAR_REGEX.source})?)$`, 'i')
  );
  if (compactMatch) {
    return parseFinancialDateToIso(compactMatch[1]);
  }

  return parseFinancialDateToIso(trimmed);
}

/**
 * Mengambil tanggal deadline efektif proyek dalam format ISO YYYY-MM-DD.
 * Urutan prioritas: project.deadline -> project.tanggalEnd -> akhir rentang project.tanggal -> project.persiapanEnd -> akhir rentang project.dateRangePersiapan.
 */
export function resolveProjectDeadlineIso(project: ProjectItem): string | null {
  if (project.deadline && project.deadline.trim() && project.deadline.trim() !== '-') {
    const parsed = extractEndDateFromRangeString(project.deadline);
    if (parsed) return parsed;
  }

  if (project.tanggalEnd && project.tanggalEnd.trim()) {
    const parsed = parseFinancialDateToIso(project.tanggalEnd);
    if (parsed) return parsed;
  }

  if (project.tanggal && project.tanggal.trim()) {
    const parsed = extractEndDateFromRangeString(project.tanggal);
    if (parsed) return parsed;
  }

  if (project.persiapanEnd && project.persiapanEnd.trim()) {
    const parsed = parseFinancialDateToIso(project.persiapanEnd);
    if (parsed) return parsed;
  }

  if (project.dateRangePersiapan && project.dateRangePersiapan.trim()) {
    const parsed = extractEndDateFromRangeString(project.dateRangePersiapan);
    if (parsed) return parsed;
  }

  return null;
}

export function toLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function diffDaysBetweenIso(targetIso: string, baseIso: string): number {
  const [ty, tm, td] = targetIso.split('-').map(Number);
  const [by, bm, bd] = baseIso.split('-').map(Number);
  const targetUtc = Date.UTC(ty, tm - 1, td);
  const baseUtc = Date.UTC(by, bm - 1, bd);
  return Math.round((targetUtc - baseUtc) / (1000 * 60 * 60 * 24));
}

export interface ProjectDeadlineNotificationItem {
  project: ProjectItem;
  deadlineIso: string;
  deadlineDisplay: string;
  daysRemaining: number;
  urgencyLevel: 'critical' | 'warning';
  todoTotal: number;
  todoCompleted: number;
}

export const SEED_REFERENCE_DATE_ISO = '2021-11-15';

/**
 * Menghasilkan daftar proyek berstatus 'Ongoing' yang deadline-nya jatuh dalam 0..maxDays hari ke depan
 * terhadap tanggal acuan (referenceDateIso).
 */
export function getOngoingProjectsWithinDays(
  projects: ProjectItem[],
  todoTasks: Record<string, TodoTaskItem[]> = {},
  referenceDateIso: string,
  maxDays = 7
): ProjectDeadlineNotificationItem[] {
  const results: ProjectDeadlineNotificationItem[] = [];

  projects.forEach((project) => {
    const statusLower = (project.status || '').trim().toLowerCase();
    if (!statusLower.includes('ongoing')) return;

    const deadlineIso = resolveProjectDeadlineIso(project);
    if (!deadlineIso) return;

    const daysRemaining = diffDaysBetweenIso(deadlineIso, referenceDateIso);
    if (daysRemaining < 0 || daysRemaining > maxDays) return;

    const tasks = Array.isArray(todoTasks[project.id]) ? todoTasks[project.id] : [];
    const todoTotal = tasks.length;
    const todoCompleted = tasks.filter(
      (t) => t.completed || t.status === 'completed' || t.statusPengerjaan === 'selesai'
    ).length;

    results.push({
      project,
      deadlineIso,
      deadlineDisplay: formatIsoDateIndo(deadlineIso),
      daysRemaining,
      urgencyLevel: daysRemaining <= 2 ? 'critical' : 'warning',
      todoTotal,
      todoCompleted,
    });
  });

  results.sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    return a.project.namaKegiatan.localeCompare(b.project.namaKegiatan);
  });

  return results;
}
