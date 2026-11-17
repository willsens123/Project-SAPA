import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  History,
  Search,
  Clock,
  User,
  Copy,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  GitCommit,
  Layers,
  AlertTriangle,
  Check,
  FileJson,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { IdentitasItem } from '../identitasData';
import {
  IdentitasChangeLog,
  CentralAuditLogEntry,
  SuspiciousAuditFlag,
} from '../types';
import { downloadAuditCsv, formatCsvDateTag } from '../utils/auditCsvExport';

export interface UnifiedAuditLogItem {
  id: string;
  identitasId: string;
  codeId: string;
  namaLengkap: string;
  timestamp: string;
  isoTimestamp?: string;
  epoch: number;
  field: string;
  oldValue: string;
  newValue: string;
  alasan: string;
  author: string;
  actionType: string;
  source: 'Profil Log' | 'Audit Pusat';
  metadata?: Record<string, any>;
  isFlagged?: boolean;
}

export interface IdentitasAuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: IdentitasItem;
  changeLogs: IdentitasChangeLog[];
  centralAuditLogs?: CentralAuditLogEntry[];
  suspiciousFlags?: SuspiciousAuditFlag[];
  initialSelectedLogId?: string | null;
  onShowToast?: (msg: string) => void;
  onRestoreFieldValue?: (
    fieldLabel: string,
    fieldKey: string | null,
    restoreValue: string,
    sourceLog: UnifiedAuditLogItem
  ) => void;
}

const FIELD_LABEL_TO_KEY: Record<string, string> = {
  'nama lengkap': 'namaLengkap',
  'nama panggilan': 'namaPanggilan',
  'jenis panggilan': 'jenisPanggilan',
  'nomor handphone': 'nomorHandPhone',
  'nomor hp': 'nomorHandPhone',
  email: 'email',
  organisasi: 'organisasi',
  'status (vip/blacklist/-)': 'status',
  status: 'status',
  'cust duration': 'custDuration',
  'bhante / lay?': 'bhanteLay',
  'bhante / lay': 'bhanteLay',
  'tempat tinggal / kota': 'kota',
  kota: 'kota',
  pekerjaan: 'pekerjaan',
  triyana: 'triyana',
  agama: 'agama',
  pic: 'pic',
  'keterangan tambahan': 'keterangan',
  keterangan: 'keterangan',
};

function parseAnyTimestamp(ts?: string, iso?: string): number {
  if (iso) {
    const isoMs = Date.parse(iso);
    if (!isNaN(isoMs)) return isoMs;
  }
  if (!ts) return 0;
  const direct = Date.parse(ts);
  if (!isNaN(direct)) return direct;

  const monthMap: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    mei: 4,
    may: 4,
    jun: 5,
    jul: 6,
    agu: 7,
    aug: 7,
    sep: 8,
    okt: 9,
    oct: 9,
    nov: 10,
    des: 11,
    dec: 11,
  };

  const parts = ts
    .toLowerCase()
    .match(/(\d{1,2})\s+([a-z]{3,4})\s+(\d{4})(?:[\s,]+(\d{1,2})[:.](\d{2}))?/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const mStr = parts[2].slice(0, 3);
    const month = monthMap[mStr] ?? 0;
    const year = parseInt(parts[3], 10);
    const hour = parts[4] ? parseInt(parts[4], 10) : 0;
    const min = parts[5] ? parseInt(parts[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }

  return 0;
}

function getCurrentFieldValue(identity: IdentitasItem, fieldLabel: string): { key: string | null; value: string } {
  const normalized = fieldLabel.toLowerCase().trim();
  const mappedKey = FIELD_LABEL_TO_KEY[normalized] || null;
  if (!mappedKey) {
    return { key: null, value: '-' };
  }
  const rawVal = (identity as unknown as Record<string, unknown>)[mappedKey];
  if (rawVal === undefined || rawVal === null || rawVal === '') {
    return { key: mappedKey, value: '-' };
  }
  return { key: mappedKey, value: String(rawVal) };
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

  // Find longest common prefix and suffix at character level for crisp inline highlighting
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

export const IdentitasAuditDetailModal: React.FC<IdentitasAuditDetailModalProps> = ({
  isOpen,
  onClose,
  identity,
  changeLogs,
  centralAuditLogs = [],
  suspiciousFlags = [],
  initialSelectedLogId = null,
  onShowToast,
  onRestoreFieldValue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [fieldFilter, setFieldFilter] = useState<string>('ALL');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(initialSelectedLogId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Relevant suspicious flags for this identity
  const activeAnomalies = useMemo(() => {
    return (suspiciousFlags || []).filter((f) => {
      if (f.status !== 'ACTIVE') return false;
      const matchesId =
        (identity.codeId && f.recordId === identity.codeId) ||
        f.recordId === identity.id ||
        (identity.namaLengkap &&
          f.recordTitle.toLowerCase().includes(identity.namaLengkap.toLowerCase()));
      return matchesId;
    });
  }, [suspiciousFlags, identity]);

  const flaggedEntryIds = useMemo(() => {
    const set = new Set<string>();
    activeAnomalies.forEach((f) => {
      f.matchingLogs.forEach((ml) => set.add(ml.id));
    });
    return set;
  }, [activeAnomalies]);

  // Merge local IdentitasChangeLog entries + CentralAuditLogEntry records for this identity
  const mergedLogs = useMemo<UnifiedAuditLogItem[]>(() => {
    const list: UnifiedAuditLogItem[] = [];
    const signatureSet = new Set<string>();

    const localMatching = changeLogs.filter(
      (l) =>
        l.identitasId === identity.id ||
        (identity.codeId && l.codeId && l.codeId === identity.codeId)
    );

    localMatching.forEach((l) => {
      const epoch = parseAnyTimestamp(l.timestamp, l.isoTimestamp);
      const sig = `${l.field.toLowerCase()}|${l.oldValue}|${l.newValue}|${l.actionType}`;
      signatureSet.add(sig);
      list.push({
        id: l.id,
        identitasId: l.identitasId,
        codeId: l.codeId || identity.codeId || '-',
        namaLengkap: l.namaLengkap || identity.namaLengkap,
        timestamp: l.timestamp,
        isoTimestamp: l.isoTimestamp,
        epoch,
        field: l.field,
        oldValue: l.oldValue || '-',
        newValue: l.newValue || '-',
        alasan: l.alasan || '-',
        author: l.author || 'Admin Identitas',
        actionType: l.actionType || 'Ubah',
        source: 'Profil Log',
        metadata: l.metadata,
        isFlagged: flaggedEntryIds.has(l.id),
      });
    });

    const centralMatching = centralAuditLogs.filter((cl) => {
      if (cl.module !== 'IDENTITAS') return false;
      const matchCode =
        (identity.codeId &&
          (cl.recordId === identity.codeId || cl.metadata?.codeId === identity.codeId)) ||
        cl.recordId === identity.id ||
        cl.metadata?.identitasId === identity.id;
      const matchName =
        identity.namaLengkap &&
        cl.recordTitle.toLowerCase().trim() === identity.namaLengkap.toLowerCase().trim();
      return Boolean(matchCode || matchName);
    });

    centralMatching.forEach((cl) => {
      const sig = `${cl.field.toLowerCase()}|${cl.oldValue}|${cl.newValue}|${cl.actionType}`;
      const existingIdx = list.findIndex(
        (existing) =>
          `${existing.field.toLowerCase()}|${existing.oldValue}|${existing.newValue}|${existing.actionType}` ===
            sig && Math.abs((existing.epoch || 0) - parseAnyTimestamp(cl.timestamp, cl.isoTimestamp)) < 120000
      );

      if (existingIdx >= 0) {
        // Enrich local entry with central metadata/author if missing
        list[existingIdx] = {
          ...list[existingIdx],
          author:
            list[existingIdx].author === 'Admin Identitas' && cl.author
              ? cl.author
              : list[existingIdx].author,
          isoTimestamp: list[existingIdx].isoTimestamp || cl.isoTimestamp,
          metadata: { ...cl.metadata, ...list[existingIdx].metadata },
          isFlagged: list[existingIdx].isFlagged || flaggedEntryIds.has(cl.id),
        };
        return;
      }

      const epoch = parseAnyTimestamp(cl.timestamp, cl.isoTimestamp);
      list.push({
          id: cl.id,
          identitasId: identity.id,
          codeId: cl.metadata?.codeId || cl.recordId || identity.codeId || '-',
          namaLengkap: cl.recordTitle || identity.namaLengkap,
          timestamp: cl.timestamp,
          isoTimestamp: cl.isoTimestamp,
          epoch,
          field: cl.field,
          oldValue: cl.oldValue || '-',
          newValue: cl.newValue || '-',
          alasan: cl.alasan || '-',
          author: cl.author || 'Admin / Sistem',
          actionType: cl.actionType || 'Ubah',
        source: 'Audit Pusat',
        metadata: cl.metadata,
        isFlagged: flaggedEntryIds.has(cl.id),
      });
    });

    return list.sort((a, b) => {
      if (b.epoch !== a.epoch) return b.epoch - a.epoch;
      return b.id.localeCompare(a.id);
    });
  }, [changeLogs, centralAuditLogs, identity, flaggedEntryIds]);

  const availableFields = useMemo(() => {
    const s = new Set<string>();
    mergedLogs.forEach((l) => {
      if (l.field) s.add(l.field);
    });
    return Array.from(s);
  }, [mergedLogs]);

  const filteredLogs = useMemo(() => {
    return mergedLogs.filter((l) => {
      if (actionFilter !== 'ALL' && l.actionType !== actionFilter) return false;
      if (fieldFilter !== 'ALL' && l.field !== fieldFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.field.toLowerCase().includes(q) ||
        l.oldValue.toLowerCase().includes(q) ||
        l.newValue.toLowerCase().includes(q) ||
        l.alasan.toLowerCase().includes(q) ||
        l.author.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    });
  }, [mergedLogs, actionFilter, fieldFilter, searchQuery]);

  // Sync selectedLogId when modal opens or initialSelectedLogId changes
  useEffect(() => {
    if (!isOpen) return;
    if (initialSelectedLogId && mergedLogs.some((l) => l.id === initialSelectedLogId)) {
      setSelectedLogId(initialSelectedLogId);
    } else if (filteredLogs.length > 0) {
      setSelectedLogId(filteredLogs[0].id);
    } else {
      setSelectedLogId(null);
    }
  }, [isOpen, initialSelectedLogId, identity.id]);

  // Keep selectedLogId valid when filters change
  useEffect(() => {
    if (!isOpen) return;
    if (filteredLogs.length === 0) {
      setSelectedLogId(null);
    } else if (!selectedLogId || !filteredLogs.some((l) => l.id === selectedLogId)) {
      setSelectedLogId(filteredLogs[0].id);
    }
  }, [isOpen, filteredLogs, selectedLogId]);

  // Esc key handler
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

  if (!isOpen) return null;

  const selectedIndex = filteredLogs.findIndex((l) => l.id === selectedLogId);
  const selectedLog = selectedIndex >= 0 ? filteredLogs[selectedIndex] : filteredLogs[0] || null;

  const currentFieldInfo = selectedLog
    ? getCurrentFieldValue(identity, selectedLog.field)
    : { key: null, value: '-' };

  const diffResult = selectedLog
    ? computeHighlightDiff(selectedLog.oldValue, selectedLog.newValue)
    : { oldSegments: [], newSegments: [] };

  // Same-field history chain (chronological oldest -> newest or newest -> oldest)
  const sameFieldHistory = selectedLog
    ? mergedLogs.filter((l) => l.field.toLowerCase() === selectedLog.field.toLowerCase())
    : [];

  const canRestore = Boolean(
    onRestoreFieldValue &&
      selectedLog &&
      currentFieldInfo.key &&
      selectedLog.oldValue &&
      selectedLog.oldValue !== '-' &&
      selectedLog.oldValue !== '(Dikosongkan)' &&
      selectedLog.oldValue !== currentFieldInfo.value
  );

  const isSelectedValueStillCurrent = Boolean(
    selectedLog &&
      currentFieldInfo.key &&
      selectedLog.newValue === currentFieldInfo.value
  );

  const handleCopy = (label: string, text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId((prev) => (prev === key ? null : prev)), 1600);
    onShowToast?.(`${label} disalin ke clipboard`);
  };

  const logsToExport = filteredLogs;

  const handleExportIdentityAuditCsv = () => {
    if (logsToExport.length === 0) {
      onShowToast?.('Tidak ada riwayat perubahan pada tampilan saat ini untuk diekspor');
      return;
    }
    const headers = [
      'No',
      'ID Log',
      'Waktu Perubahan',
      'ISO Timestamp',
      'Kode Identitas',
      'Nama Lengkap',
      'Sumber Log',
      'Aksi',
      'Field',
      'Nilai Sebelumnya',
      'Nilai Baru',
      'Diubah Oleh',
      'Alasan Perubahan',
      'Status Anomali',
    ];
    const rows = logsToExport.map((l, idx) => [
      idx + 1,
      l.id,
      l.timestamp,
      l.isoTimestamp || '',
      l.codeId,
      l.namaLengkap,
      l.source,
      l.actionType,
      l.field,
      l.oldValue,
      l.newValue,
      l.author,
      l.alasan,
      l.isFlagged ? 'Terindikasi Anomali' : 'Normal',
    ]);
    downloadAuditCsv({
      filename: `Audit_Detail_${identity.codeId || identity.id}_${formatCsvDateTag()}.csv`,
      headers,
      rows,
    });
    onShowToast?.(`${logsToExport.length} riwayat audit saat ini berhasil diunduh (CSV)`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/55 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-detail-panel-title"
    >
      {/* Slide-Over Inspection Panel */}
      <div
        className="relative w-full max-w-5xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#05828e] text-white flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="audit-detail-panel-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate"
              >
                Detail Riwayat Perubahan (Audit Log)
              </h2>
              {/* Unboxed clean metadata with middot separators */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {identity.namaLengkap}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#05828e] dark:text-[#2dd4bf]">
                  #{identity.codeId || identity.id}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{mergedLogs.length} Catatan Audit</span>
                {identity.nomorHandPhone && identity.nomorHandPhone !== '-' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{identity.nomorHandPhone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportIdentityAuditCsv}
              title="Unduh riwayat audit yang sedang ditampilkan ke format CSV"
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
              <span>Unduh CSV ({logsToExport.length})</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup panel audit log"
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Anomaly Context Banner (only when active anomalies exist on this record) */}
        {activeAnomalies.length > 0 && (
          <div className="px-5 sm:px-6 py-3 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/70 flex items-start gap-3 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-amber-800 dark:text-amber-300">
                Peringatan Integritas Aktif:
              </span>{' '}
              Field <span className="font-semibold">{activeAnomalies[0].field}</span> mengalami{' '}
              <span className="font-mono tabular-nums font-semibold">
                {activeAnomalies[0].changeCount}x
              </span>{' '}
              perubahan dalam 30 hari — {activeAnomalies[0].reason}
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari field, nilai lama/baru, admin, alasan..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#05828e] dark:focus:border-[#2dd4bf]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action Segmented Control */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              {['ALL', 'Ubah', 'Merge', 'Hapus'].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setActionFilter(act)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    actionFilter === act
                      ? 'bg-white dark:bg-slate-900 text-[#05828e] dark:text-[#2dd4bf] shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {act === 'ALL' ? 'Semua Aksi' : act}
                </button>
              ))}
            </div>

            {availableFields.length > 1 && (
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                aria-label="Filter berdasarkan field"
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-[#05828e] cursor-pointer"
              >
                <option value="ALL">Semua Field ({availableFields.length})</option>
                {availableFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Main Split Inspection Workspace */}
        {filteredLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Belum Ada Catatan Audit Log untuk Filter Ini
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
              Setiap perubahan field profil, penggabungan duplikat, atau pembaruan data pada{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {identity.namaLengkap}
              </span>{' '}
              akan tercatat kronologis lengkap dengan alasan dan jejak nilai sebelum & sesudah.
            </p>
            {(searchQuery || actionFilter !== 'ALL' || fieldFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActionFilter('ALL');
                  setFieldFilter('ALL');
                }}
                className="mt-4 px-4 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Filter Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left List: Chronological Change Entries */}
            <div className="w-full lg:w-[340px] xl:w-[360px] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[240px] lg:max-h-none divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/40 dark:bg-slate-950/30 shrink-0">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const isMerge = log.actionType === 'Merge';
                const isHapus = log.actionType === 'Hapus';

                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setSelectedLogId(log.id)}
                    className={`w-full text-left p-4 transition-colors cursor-pointer block ${
                      isSelected
                        ? 'bg-teal-50/70 dark:bg-teal-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span
                        className={`font-semibold ${
                          isMerge
                            ? 'text-amber-700 dark:text-amber-400'
                            : isHapus
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-[#05828e] dark:text-[#2dd4bf]'
                        }`}
                      >
                        {log.actionType}
                      </span>
                      <span className="font-mono tabular-nums truncate">
                        {log.timestamp}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {log.field}
                      </span>
                      {log.isFlagged && (
                        <span title="Tercatat dalam deteksi anomali" className="shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      <span className="truncate max-w-[115px] text-rose-600 dark:text-rose-400 line-through">
                        {log.oldValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate flex-1 font-semibold text-[#05828e] dark:text-[#2dd4bf]">
                        {log.newValue}
                      </span>
                    </div>

                    <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Oleh: <span className="font-medium text-slate-700 dark:text-slate-300">{log.author}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Inspector: Selected Log Full Details */}
            {selectedLog && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-white dark:bg-slate-900">
                {/* Top Navigation & Entry Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{selectedLog.actionType} Data</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedLog.source}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{selectedLog.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                      Perubahan Field: {selectedLog.field}
                    </h3>
                  </div>

                  {/* Prev / Next Record Navigation */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mr-1">
                      {selectedIndex + 1} / {filteredLogs.length}
                    </span>
                    <button
                      type="button"
                      disabled={selectedIndex <= 0}
                      onClick={() => {
                        if (selectedIndex > 0) {
                          setSelectedLogId(filteredLogs[selectedIndex - 1].id);
                        }
                      }}
                      title="Catatan lebih baru"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={selectedIndex >= filteredLogs.length - 1}
                      onClick={() => {
                        if (selectedIndex < filteredLogs.length - 1) {
                          setSelectedLogId(filteredLogs[selectedIndex + 1].id);
                        }
                      }}
                      title="Catatan lebih lama"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-5 border-b border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <div className="text-slate-400 dark:text-slate-500 font-medium">
                      Waktu Modifikasi
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5 font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedLog.timestamp}</span>
                    </div>
                    {selectedLog.isoTimestamp && (
                      <div className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500 mt-0.5">
                        ISO: {selectedLog.isoTimestamp}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-slate-400 dark:text-slate-500 font-medium">
                      Diubah Oleh (Aktor)
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf] shrink-0" />
                      <span>{selectedLog.author}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 dark:text-slate-500 font-medium">
                      Status Nilai di Profil Saat Ini
                    </div>
                    {currentFieldInfo.key ? (
                      <div className="mt-1">
                        <div className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200 break-all">
                          {currentFieldInfo.value}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 flex items-center gap-1 ${
                            isSelectedValueStillCurrent
                              ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {isSelectedValueStillCurrent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Nilai hasil perubahan ini masih aktif</span>
                            </>
                          ) : (
                            <span>Sudah diperbarui kembali pada entri lebih baru</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Perubahan gabungan / sistem
                      </div>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Value Comparison with Inline Diff Highlight */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Komparasi Nilai Sebelum & Sesudah
                    </h4>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                      {selectedLog.oldValue.length} kar → {selectedLog.newValue.length} kar
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Old Value Panel */}
                    <div className="rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/50 dark:bg-rose-950/25 p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-2">
                          <span>Nilai Sebelumnya (Lama)</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy('Nilai lama', selectedLog.oldValue, 'old-val')
                            }
                            className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                          >
                            {copiedId === 'old-val' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Salin</span>
                          </button>
                        </div>
                        <div className="text-sm font-mono tabular-nums text-rose-950 dark:text-rose-200 break-words leading-relaxed">
                          {diffResult.oldSegments.map((seg, i) => (
                            <span
                              key={i}
                              className={
                                seg.changed
                                  ? 'bg-rose-200/80 dark:bg-rose-800/70 px-0.5 rounded line-through decoration-rose-500'
                                  : 'opacity-80'
                              }
                            >
                              {seg.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* New Value Panel */}
                    <div className="rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/60 dark:bg-teal-950/30 p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#05828e] dark:text-[#2dd4bf] mb-2">
                          <span>Nilai Sesudah (Baru)</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy('Nilai baru', selectedLog.newValue, 'new-val')
                            }
                            className="inline-flex items-center gap-1 text-[#05828e] dark:text-[#2dd4bf] hover:underline cursor-pointer"
                          >
                            {copiedId === 'new-val' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Salin</span>
                          </button>
                        </div>
                        <div className="text-sm font-mono tabular-nums font-semibold text-teal-950 dark:text-teal-100 break-words leading-relaxed">
                          {diffResult.newSegments.map((seg, i) => (
                            <span
                              key={i}
                              className={
                                seg.changed
                                  ? 'bg-teal-200/85 dark:bg-teal-700/70 px-0.5 rounded'
                                  : ''
                              }
                            >
                              {seg.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alasan & Metadata Konteks */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Alasan & Justifikasi Perubahan
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedLog.alasan && selectedLog.alasan !== '-'
                      ? `"${selectedLog.alasan}"`
                      : 'Tidak ada catatan alasan tambahan yang dimasukkan admin.'}
                  </p>
                  {selectedLog.metadata?.details && (
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400">
                      Catatan Sistem: {String(selectedLog.metadata.details)}
                    </div>
                  )}
                </div>

                {/* Field Evolution Chain for Same Field */}
                {sameFieldHistory.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Jejak Perubahan Field &quot;{selectedLog.field}&quot; ({sameFieldHistory.length}x)
                      </h4>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {sameFieldHistory.map((item) => {
                        const isCurrentFocus = item.id === selectedLog.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedLogId(item.id)}
                            className={`w-full text-left px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isCurrentFocus
                                ? 'bg-teal-50/70 dark:bg-teal-950/40'
                                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 font-mono tabular-nums">
                              {item.actionType === 'Merge' ? (
                                <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              ) : (
                                <GitCommit className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf] shrink-0" />
                              )}
                              <span className="text-rose-600 dark:text-rose-400 line-through truncate max-w-[140px]">
                                {item.oldValue}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-semibold text-[#05828e] dark:text-[#2dd4bf] truncate max-w-[160px]">
                                {item.newValue}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                              <span>{item.author}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">{item.timestamp}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inspector Actions Bar */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          'Ringkasan log',
                          `[AUDIT IDENTITAS] ${selectedLog.namaLengkap} (#${selectedLog.codeId})\nWaktu: ${selectedLog.timestamp}\nAktor: ${selectedLog.author}\nAksi: ${selectedLog.actionType} - ${selectedLog.field}\nNilai Lama: ${selectedLog.oldValue}\nNilai Baru: ${selectedLog.newValue}\nAlasan: ${selectedLog.alasan}`,
                          'summary'
                        )
                      }
                      className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === 'summary' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Salin Ringkasan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy('Data JSON', JSON.stringify(selectedLog, null, 2), 'json')
                      }
                      className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === 'json' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <FileJson className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Salin JSON</span>
                    </button>
                  </div>

                  {canRestore && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onRestoreFieldValue && selectedLog) {
                          onRestoreFieldValue(
                            selectedLog.field,
                            currentFieldInfo.key,
                            selectedLog.oldValue,
                            selectedLog
                          );
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pulihkan Nilai Lama ke Form</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
