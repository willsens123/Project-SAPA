import { CentralAuditLogEntry } from '../types';

export type AuditAlertSeverity = 'critical' | 'important';

export interface LiveAuditNotification {
  id: string;
  entry: CentralAuditLogEntry;
  severity: AuditAlertSeverity;
  headline: string;
  summary: string;
  receivedAtIso: string;
}

const CRITICAL_ACTIONS = new Set(['hapus', 'merge']);

const SENSITIVE_FIELD_KEYWORDS = [
  'handphone',
  'hp',
  'email',
  'nama lengkap',
  'status',
  'bayar',
  'pembayaran',
  'blacklist',
  'vip',
  'anomali',
  'rekening',
  'nominal',
];

const IMPORTANT_MODULES = new Set([
  'IDENTITAS',
  'S-SALUR',
  'DONASI',
  'AJAR',
  'PROYEK',
  'PENGELUARAN',
  'MUTASI',
]);

function truncateValue(val: string | undefined, maxLen = 36): string {
  const clean = (val || '-').trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1)}…`;
}

/**
 * Evaluates a newly recorded CentralAuditLogEntry and classifies whether it warrants
 * a real-time important change notification on the main dashboard.
 */
export function evaluateAuditNotification(
  entry: CentralAuditLogEntry
): LiveAuditNotification | null {
  if (!entry || !entry.id) return null;

  const moduleUpper = (entry.module || 'IDENTITAS').toUpperCase();
  const actionLower = (entry.actionType || '').trim().toLowerCase();
  const fieldLower = (entry.field || '').trim().toLowerCase();
  const alasanLower = (entry.alasan || '').trim().toLowerCase();

  const isKnownImportantModule = IMPORTANT_MODULES.has(moduleUpper);
  const isCriticalAction = CRITICAL_ACTIONS.has(actionLower);
  const isAnomalyAlert =
    Boolean(entry.metadata?.isAnomaly) ||
    fieldLower.includes('anomali') ||
    alasanLower.includes('anomali') ||
    alasanLower.includes('mencurigakan');
  const isSensitiveField = SENSITIVE_FIELD_KEYWORDS.some((kw) =>
    fieldLower.includes(kw)
  );
  const isPaymentOrDelivery =
    actionLower === 'status bayar' ||
    actionLower === 'pengiriman' ||
    actionLower === 'resi';

  if (
    !isKnownImportantModule &&
    !isCriticalAction &&
    !isAnomalyAlert &&
    !isSensitiveField &&
    !isPaymentOrDelivery
  ) {
    return null;
  }

  const severity: AuditAlertSeverity =
    isCriticalAction || isAnomalyAlert || isSensitiveField || actionLower === 'status bayar'
      ? 'critical'
      : 'important';

  const actionLabel = entry.actionType || 'Perubahan';
  const subjectLabel = entry.recordTitle || entry.recordId || 'Data';
  const headline = isAnomalyAlert
    ? `Peringatan Anomali ${moduleUpper}: ${subjectLabel}`
    : `Perubahan ${actionLabel} · ${entry.field}`;

  const oldPart = truncateValue(entry.oldValue, 32);
  const newPart = truncateValue(entry.newValue, 32);
  const recordTag = entry.recordId && entry.recordId !== '-' ? `#${entry.recordId}` : '';
  const subjectPrefix = [subjectLabel, recordTag].filter(Boolean).join(' ');

  const summary =
    entry.oldValue && entry.oldValue !== '-' && entry.newValue && entry.newValue !== '-'
      ? `${subjectPrefix}: ${oldPart} → ${newPart}`
      : `${subjectPrefix}: ${newPart !== '-' ? newPart : entry.alasan || actionLabel}`;

  return {
    id: entry.id,
    entry,
    severity,
    headline,
    summary,
    receivedAtIso: entry.isoTimestamp || new Date().toISOString(),
  };
}
