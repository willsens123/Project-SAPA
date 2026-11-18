import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Eye,
  Clock,
  User,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Columns2,
  AlignJustify,
  FileJson,
  ExternalLink,
  History,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  CentralAuditLogEntry,
  AuditModule,
  SuspiciousAuditFlag,
} from '../types';

interface CentralAuditDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: CentralAuditLogEntry | null;
  allLogs: CentralAuditLogEntry[];
  filteredLogs: CentralAuditLogEntry[];
  onSelectLog: (log: CentralAuditLogEntry) => void;
  flaggedLogIdMap?: Map<string, SuspiciousAuditFlag>;
  onShowToast?: (msg: string) => void;
  onNavigateToIdentitas?: (codeId: string) => void;
  onNavigateToModule?: (module: AuditModule) => void;
}

interface DiffSegment {
  text: string;
  changed: boolean;
}

function computeHighlightDiff(oldText: string, newText: string): {
  oldSegments: DiffSegment[];
  newSegments: DiffSegment[];
} {
  const a = oldText || '';
  const b = newText || '';
  if (a === b) {
    return {
      oldSegments: [{ text: a, changed: false }],
      newSegments: [{ text: b, changed: false }],
    };
  }

  let prefixLen = 0;
  const minLen = Math.min(a.length, b.length);
  while (prefixLen < minLen && a[prefixLen] === b[prefixLen]) {
    prefixLen++;
  }

  let suffixLen = 0;
  while (
    suffixLen < minLen - prefixLen &&
    a[a.length - 1 - suffixLen] === b[b.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const oldPrefix = a.slice(0, prefixLen);
  const oldMid = a.slice(prefixLen, a.length - suffixLen);
  const oldSuffix = suffixLen > 0 ? a.slice(a.length - suffixLen) : '';

  const newPrefix = b.slice(0, prefixLen);
  const newMid = b.slice(prefixLen, b.length - suffixLen);
  const newSuffix = suffixLen > 0 ? b.slice(b.length - suffixLen) : '';

  const oldSegments: DiffSegment[] = [];
  if (oldPrefix) oldSegments.push({ text: oldPrefix, changed: false });
  if (oldMid) oldSegments.push({ text: oldMid, changed: true });
  if (oldSuffix) oldSegments.push({ text: oldSuffix, changed: false });

  const newSegments: DiffSegment[] = [];
  if (newPrefix) newSegments.push({ text: newPrefix, changed: false });
  if (newMid) newSegments.push({ text: newMid, changed: true });
  if (newSuffix) newSegments.push({ text: newSuffix, changed: false });

  return { oldSegments, newSegments };
}

function tryParseNumericValue(raw: string): { value: number; isCurrency: boolean } | null {
  const trimmed = (raw || '').trim();
  if (!trimmed || trimmed === '-') return null;
  const isCurrency = /rp|idr/i.test(trimmed);
  // Only treat strings that look purely like formatted numbers or Rp amounts as numeric
  if (!/^(rp\.?\s*)?[-+]?[\d.,]+$/i.test(trimmed)) return null;
  const normalized = trimmed
    .replace(/rp\.?\s*/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return { value: num, isCurrency };
}

function tryParseJsonRecord(raw: string): Record<string, unknown> | null {
  const trimmed = (raw || '').trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

const MODULE_LABELS: Record<AuditModule, { label: string; textClass: string }> = {
  IDENTITAS: { label: 'IDENTITAS', textClass: 'text-[#05828e] dark:text-[#2dd4bf]' },
  'S-SALUR': { label: 'S-SALUR', textClass: 'text-emerald-700 dark:text-emerald-400' },
  DONASI: { label: 'D-DONASI', textClass: 'text-amber-700 dark:text-amber-400' },
  AJAR: { label: 'A-AJAR', textClass: 'text-indigo-700 dark:text-indigo-400' },
  MUTASI: { label: 'MUTASI', textClass: 'text-sky-700 dark:text-sky-400' },
  PROYEK: { label: 'PROYEK', textClass: 'text-violet-700 dark:text-violet-400' },
  PENGELUARAN: { label: 'PENGELUARAN', textClass: 'text-rose-700 dark:text-rose-400' },
};

export const CentralAuditDiffModal: React.FC<CentralAuditDiffModalProps> = ({
  isOpen,
  onClose,
  log,
  allLogs,
  filteredLogs,
  onSelectLog,
  flaggedLogIdMap,
  onShowToast,
  onNavigateToIdentitas,
  onNavigateToModule,
}) => {
  const [diffMode, setDiffMode] = useState<'split' | 'unified'>('split');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentIndex = useMemo(() => {
    if (!log) return -1;
    return filteredLogs.findIndex((item) => item.id === log.id);
  }, [filteredLogs, log]);

  const relatedLogs = useMemo(() => {
    if (!log) return [];
    return allLogs.filter(
      (item) => item.recordId === log.recordId && item.module === log.module
    );
  }, [allLogs, log]);

  const diffResult = useMemo(() => {
    if (!log) return { oldSegments: [], newSegments: [] };
    return computeHighlightDiff(log.oldValue || '-', log.newValue || '-');
  }, [log]);

  const numericDelta = useMemo(() => {
    if (!log) return null;
    const prev = tryParseNumericValue(log.oldValue);
    const next = tryParseNumericValue(log.newValue);
    if (!prev || !next) return null;
    const delta = next.value - prev.value;
    const pct =
      prev.value !== 0 ? Math.round((delta / Math.abs(prev.value)) * 1000) / 10 : null;
    return {
      delta,
      pct,
      isCurrency: prev.isCurrency || next.isCurrency,
    };
  }, [log]);

  const structuredPropertyDiff = useMemo(() => {
    if (!log) return null;
    const oldObj = tryParseJsonRecord(log.oldValue);
    const newObj = tryParseJsonRecord(log.newValue);
    if (!oldObj && !newObj) return null;
    const keys = Array.from(
      new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])
    );
    return keys.map((k) => {
      const oldV = oldObj && k in oldObj ? String(oldObj[k] ?? '-') : '-';
      const newV = newObj && k in newObj ? String(newObj[k] ?? '-') : '-';
      return {
        key: k,
        oldValue: oldV,
        newValue: newV,
        changed: oldV !== newV,
      };
    });
  }, [log]);

  if (!isOpen || !log) return null;

  const flagItem = flaggedLogIdMap?.get(log.id);
  const modMeta = MODULE_LABELS[log.module] || {
    label: log.module,
    textClass: 'text-[#05828e] dark:text-[#2dd4bf]',
  };

  const handleCopy = (label: string, text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1600);
    onShowToast?.(`${label} berhasil disalin`);
  };

  const summaryText = [
    `[AUDIT DIFF] ${modMeta.label} · #${log.recordId} (${log.recordTitle})`,
    `Waktu: ${log.timestamp}${log.isoTimestamp ? ` (${log.isoTimestamp})` : ''}`,
    `Aksi: ${log.actionType} · Field: ${log.field}`,
    `Nilai Lama: ${log.oldValue || '-'}`,
    `Nilai Baru: ${log.newValue || '-'}`,
    `Alasan: ${log.alasan || '-'}`,
    `Operator: ${log.author || 'Sistem'}`,
  ].join('\n');

  const jsonPayload = JSON.stringify(log, null, 2);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filteredLogs.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 dark:bg-black/75 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="central-audit-diff-title"
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#05828e] text-white flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="central-audit-diff-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate"
              >
                Detail Perbedaan Data (Visual Diff)
              </h2>
              {/* Unboxed quiet metadata */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className={`font-semibold ${modMeta.textClass}`}>{modMeta.label}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                  {log.recordTitle || '-'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  #{log.recordId}
                </span>
                <span aria-hidden="true">·</span>
                <span>{log.actionType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentIndex >= 0 && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => hasPrev && onSelectLog(filteredLogs[currentIndex - 1])}
                  title="Log Sebelumnya"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 px-1.5">
                  {currentIndex + 1}/{filteredLogs.length}
                </span>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => hasNext && onSelectLog(filteredLogs[currentIndex + 1])}
                  title="Log Berikutnya"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal detail diff"
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Anomaly Banner if flagged */}
          {flagItem && (
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/70 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-rose-700 dark:text-rose-300">
                  Terindikasi Anomali ({flagItem.changeCount}x perubahan dalam {flagItem.windowDays} hari)
                </div>
                <p>{flagItem.reason}</p>
              </div>
            </div>
          )}

          {/* Primary Context Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Field yang Diperbarui
              </div>
              <div className="text-sm font-bold text-[#05828e] dark:text-[#2dd4bf] mt-0.5">
                {log.field || '-'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tipe Aksi: {log.actionType}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Operator / Pengubah
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{log.author || 'Sistem'}</span>
              </div>
              <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                ID Log: {log.id}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Waktu Pencatatan
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{log.timestamp}</span>
              </div>
              {log.isoTimestamp && (
                <div className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  ISO: {log.isoTimestamp}
                </div>
              )}
            </div>
          </div>

          {/* Numeric / Financial Delta Banner (if numeric/currency values detected) */}
          {numericDelta && (
            <div className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Selisih Nominal / Nilai Terhitung
              </span>
              <div className="flex items-center gap-2 font-mono tabular-nums font-bold">
                {numericDelta.delta >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span
                  className={
                    numericDelta.delta >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }
                >
                  {numericDelta.delta > 0 ? '+' : ''}
                  {numericDelta.isCurrency
                    ? `Rp ${numericDelta.delta.toLocaleString('id-ID')}`
                    : numericDelta.delta.toLocaleString('id-ID')}
                </span>
                {numericDelta.pct !== null && (
                  <span className="text-slate-500 dark:text-slate-400 font-normal">
                    ({numericDelta.pct > 0 ? `+${numericDelta.pct}%` : `${numericDelta.pct}%`})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Visual Diff Inspector Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Perbandingan Nilai Sebelum & Sesudah
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bagian teks yang berubah disorot secara langsung agar perbedaan cepat terlihat.
                </p>
              </div>

              {/* Diff Mode Segmented Switch */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDiffMode('split')}
                  className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    diffMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>Bersebelahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiffMode('unified')}
                  className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    diffMode === 'unified'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                  <span>Terpadu</span>
                </button>
              </div>
            </div>

            {diffMode === 'split' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Old Value Pane */}
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/45 dark:bg-rose-950/25 p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    <span>- Nilai Sebelumnya (Lama)</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy('Nilai lama', log.oldValue || '-', 'copy-old')
                      }
                      className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 normal-case font-medium cursor-pointer"
                    >
                      {copiedKey === 'copy-old' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Salin</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-white/85 dark:bg-slate-950/60 border border-rose-100 dark:border-rose-900/50 font-mono text-xs sm:text-sm leading-relaxed break-words text-slate-800 dark:text-slate-200">
                    {diffResult.oldSegments.map((seg, i) => (
                      <span
                        key={i}
                        className={
                          seg.changed
                            ? 'bg-rose-200/80 dark:bg-rose-800/70 text-rose-950 dark:text-rose-100 px-1 rounded line-through decoration-rose-600'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {seg.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* New Value Pane */}
                <div className="rounded-xl border border-teal-200 dark:border-teal-800/70 bg-teal-50/50 dark:bg-teal-950/25 p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#05828e] dark:text-[#2dd4bf]">
                    <span>+ Nilai Baru (Sesudah)</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy('Nilai baru', log.newValue || '-', 'copy-new')
                      }
                      className="text-[#05828e] dark:text-[#2dd4bf] hover:underline flex items-center gap-1 normal-case font-medium cursor-pointer"
                    >
                      {copiedKey === 'copy-new' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Salin</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-white/85 dark:bg-slate-950/60 border border-teal-100 dark:border-teal-900/50 font-mono text-xs sm:text-sm leading-relaxed break-words text-slate-900 dark:text-slate-100">
                    {diffResult.newSegments.map((seg, i) => (
                      <span
                        key={i}
                        className={
                          seg.changed
                            ? 'bg-emerald-200/80 dark:bg-emerald-800/65 text-emerald-950 dark:text-emerald-100 px-1 rounded font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      >
                        {seg.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Unified Stacked Diff */
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden font-mono text-xs sm:text-sm">
                <div className="px-4 py-3 bg-rose-50/70 dark:bg-rose-950/35 border-b border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <span className="font-bold text-rose-600 dark:text-rose-400 select-none w-4 shrink-0">
                    -
                  </span>
                  <div className="break-words text-rose-950 dark:text-rose-200">
                    {diffResult.oldSegments.map((seg, i) => (
                      <span
                        key={i}
                        className={
                          seg.changed
                            ? 'bg-rose-200/85 dark:bg-rose-800/70 px-1 rounded line-through'
                            : ''
                        }
                      >
                        {seg.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-start gap-3">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 select-none w-4 shrink-0">
                    +
                  </span>
                  <div className="break-words text-emerald-950 dark:text-emerald-100 font-semibold">
                    {diffResult.newSegments.map((seg, i) => (
                      <span
                        key={i}
                        className={
                          seg.changed
                            ? 'bg-emerald-200/85 dark:bg-emerald-800/65 px-1 rounded'
                            : ''
                        }
                      >
                        {seg.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Structured JSON Property Diff Table (when JSON object detected) */}
            {structuredPropertyDiff && structuredPropertyDiff.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Rincian Properti Data Terstruktur
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Properti</th>
                        <th className="py-2 px-3">Nilai Lama</th>
                        <th className="py-2 px-3">Nilai Baru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {structuredPropertyDiff.map((row) => (
                        <tr
                          key={row.key}
                          className={
                            row.changed ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                          }
                        >
                          <td className="py-2 px-3 font-mono font-semibold text-slate-700 dark:text-slate-200">
                            {row.key}
                          </td>
                          <td className="py-2 px-3 font-mono text-rose-700 dark:text-rose-400">
                            {row.oldValue}
                          </td>
                          <td className="py-2 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            {row.newValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Alasan & Additional Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Alasan / Catatan Perubahan
              </div>
              <div className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
                {log.alasan ? `"${log.alasan}"` : 'Tidak ada keterangan alasan tambahan.'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Metadata Tambahan
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(log.metadata).map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-3">
                      <span className="font-mono text-slate-500 dark:text-slate-400">{k}:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 text-right break-all">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 dark:text-slate-400">
                  Tidak ada metadata sistem tambahan.
                </div>
              )}
            </div>
          </div>

          {/* Related History for the Same Record */}
          {relatedLogs.length > 1 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
                  <span>
                    Riwayat Lainnya untuk #{log.recordId} ({relatedLogs.length} catatan)
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Klik baris untuk membandingkan
                </span>
              </div>

              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                {relatedLogs.map((rel) => {
                  const isCurrent = rel.id === log.id;
                  return (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => onSelectLog(rel)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-50/70 dark:bg-teal-950/40'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-[#05828e] dark:text-[#2dd4bf] shrink-0">
                          {rel.field}
                        </span>
                        <span className="font-mono text-slate-400 truncate max-w-[120px] line-through">
                          {rel.oldValue || '-'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                          {rel.newValue || '-'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                        {rel.timestamp}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy('Ringkasan diff', summaryText, 'summary')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedKey === 'summary' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Salin Ringkasan</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy('Data JSON', jsonPayload, 'json')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedKey === 'json' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <FileJson className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Salin JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {log.module === 'IDENTITAS' && onNavigateToIdentitas && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToIdentitas(log.recordId);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/50 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 text-xs font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Profil Identitas</span>
              </button>
            )}

            {log.module !== 'IDENTITAS' && onNavigateToModule && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToModule(log.module);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/50 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 text-xs font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Modul {modMeta.label}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
