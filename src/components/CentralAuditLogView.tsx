import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Search,
  Download,
  Clock,
  Check,
  X,
  Copy,
  ChevronLeft,
  ArrowRight,
  GitCommit,
  Layers,
  ShoppingBag,
  HeartHandshake,
  GraduationCap,
  User,
  ShieldCheck,
  FileSpreadsheet,
  ArrowDownUp,
  Plus,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  GitMerge,
  Truck,
  CreditCard,
  FileText,
  Filter,
} from 'lucide-react';
import {
  CentralAuditLogEntry,
  AuditModule,
  SuspiciousAuditFlag,
  SuspiciousStatus,
  AuditAnomalyJobReport,
} from '../types';
import { dispatchAuditEvent, formatAuditTimestamp } from '../utils/auditEventBus';
import {
  auditAnomalyWorker,
  saveAnomalyStatusOverride,
  simulateSuspiciousIdentitasUpdates,
} from '../utils/auditAnomalyDetector';
import { MonthlyAuditTrendChart } from './MonthlyAuditTrendChart';
import {
  AuditActivityStatsChart,
  parseAuditLogDate,
  toLocalDateKey,
} from './AuditActivityStatsChart';
import { CentralAuditDiffModal } from './CentralAuditDiffModal';
import {
  downloadAuditCsv,
  formatCsvDateTag,
  sanitizeCsvFilenameSlug,
} from '../utils/auditCsvExport';

interface CentralAuditLogViewProps {
  logs: CentralAuditLogEntry[];
  anomalyReport?: AuditAnomalyJobReport;
  onTriggerJobScan?: () => void;
  onUpdateAnomalyStatus?: (flagId: string, status: SuspiciousStatus, notes?: string) => void;
  onSimulateAnomaly?: (codeId?: string, name?: string, field?: string) => void;
  canUndoMerge?: boolean;
  canClearLogs?: boolean;
  canManageAnomalies?: boolean;
  canExportCsv?: boolean;
  onUndoMerge?: (mergeRecordId: string) => void;
  onBack?: () => void;
  onClearLogs?: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToIdentitas?: (codeId: string) => void;
  onNavigateToSalur?: () => void;
  onNavigateToDonasi?: () => void;
  onNavigateToAjar?: () => void;
}

type DatePresetKey = 'all' | 'today' | '7d' | '30d' | 'month' | 'custom';

const CORE_ACTION_CATEGORIES = [
  'Tambah',
  'Ubah',
  'Merge',
  'Undo Merge',
  'Hapus',
  'Status Bayar',
  'Pengiriman',
  'Resi',
] as const;

function extractLogTimeString(log: CentralAuditLogEntry, parsedDate: Date | null): string {
  if (log.timestamp) {
    const timeMatch = log.timestamp.match(/\b(\d{1,2})[:.](\d{2})\b/);
    if (timeMatch) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }
  }
  if (log.isoTimestamp && parsedDate && !isNaN(parsedDate.getTime())) {
    const hh = String(parsedDate.getHours()).padStart(2, '0');
    const mm = String(parsedDate.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '--:--';
}

function getLogSortTimestamp(log: CentralAuditLogEntry): number {
  if (log.isoTimestamp) {
    const ms = new Date(log.isoTimestamp).getTime();
    if (!isNaN(ms)) return ms;
  }
  const parsed = parseAuditLogDate(log);
  if (parsed) {
    const timeMatch = log.timestamp?.match(/\b(\d{1,2})[:.](\d{2})\b/);
    if (timeMatch) {
      parsed.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
    }
    return parsed.getTime();
  }
  return 0;
}

function formatDayGroupLabel(dateKey: string, sampleTimestamp?: string): string {
  if (dateKey === 'unknown') {
    return sampleTimestamp || 'Tanggal Tidak Diketahui';
  }
  const [yStr, mStr, dStr] = dateKey.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const d = parseInt(dStr, 10);
  const dateObj = new Date(y, m, d);
  if (isNaN(dateObj.getTime())) return dateKey;

  const formatted = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const now = new Date();
  const todayKey = toLocalDateKey(now);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday);

  if (dateKey === todayKey) return `Hari Ini · ${formatted}`;
  if (dateKey === yesterdayKey) return `Kemarin · ${formatted}`;
  return formatted;
}

function getActionVisualMeta(actionType: string, isSuspicious: boolean) {
  if (isSuspicious) {
    return {
      icon: AlertTriangle,
      nodeClass:
        'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950/80',
      labelClass: 'text-rose-700 dark:text-rose-300',
    };
  }
  switch (actionType) {
    case 'Tambah':
      return {
        icon: Plus,
        nodeClass:
          'bg-emerald-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-emerald-700 dark:text-emerald-300',
      };
    case 'Ubah':
      return {
        icon: Pencil,
        nodeClass:
          'bg-[#05828e] text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-[#05828e] dark:text-[#2dd4bf]',
      };
    case 'Merge':
      return {
        icon: GitMerge,
        nodeClass:
          'bg-violet-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-violet-700 dark:text-violet-300',
      };
    case 'Undo Merge':
      return {
        icon: RotateCcw,
        nodeClass:
          'bg-amber-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-amber-700 dark:text-amber-300',
      };
    case 'Hapus':
      return {
        icon: Trash2,
        nodeClass:
          'bg-rose-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-rose-700 dark:text-rose-300',
      };
    case 'Status Bayar':
      return {
        icon: CreditCard,
        nodeClass:
          'bg-amber-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-amber-700 dark:text-amber-300',
      };
    case 'Pengiriman':
    case 'Resi':
      return {
        icon: Truck,
        nodeClass:
          'bg-indigo-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-indigo-700 dark:text-indigo-300',
      };
    case 'E-Kwitansi':
    case 'E-Sertifikat':
      return {
        icon: FileText,
        nodeClass:
          'bg-sky-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-sky-700 dark:text-sky-300',
      };
    default:
      return {
        icon: GitCommit,
        nodeClass:
          'bg-slate-600 text-white ring-4 ring-white dark:ring-slate-900',
        labelClass: 'text-slate-700 dark:text-slate-300',
      };
  }
}

export const CentralAuditLogView: React.FC<CentralAuditLogViewProps> = ({
  logs,
  anomalyReport: externalAnomalyReport,
  onTriggerJobScan,
  onUpdateAnomalyStatus,
  onSimulateAnomaly,
  canUndoMerge = false,
  canClearLogs = true,
  canManageAnomalies = true,
  canExportCsv = true,
  onUndoMerge,
  onBack,
  onClearLogs,
  onShowToast,
  onNavigateToIdentitas,
  onNavigateToSalur,
  onNavigateToDonasi,
  onNavigateToAjar,
}) => {
  // View mode: 'timeline' vs 'table'
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Filter Modul: 'ALL' | AuditModule | 'ANOMALI'
  const [selectedModule, setSelectedModule] = useState<'ALL' | AuditModule | 'ANOMALI'>('ALL');

  // Filter Aksi
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  // Search keyword
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter Bulan: 'YYYY-MM' or null
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string | null>(null);

  // Filter Tanggal tunggal (dari klik grafik): 'YYYY-MM-DD' or null
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Filter Rentang Tanggal (Date Range): 'YYYY-MM-DD' or ''
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [activeDatePreset, setActiveDatePreset] = useState<DatePresetKey>('all');

  // Sort chronological order: 'desc' vs 'asc'
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Test event modal, CSV archive modal & visual diff detail modal
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [isExportCsvModalOpen, setIsExportCsvModalOpen] = useState<boolean>(false);
  const [csvExportScope, setCsvExportScope] = useState<'current' | 'identitas'>('current');
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';'>(',');
  const [csvIncludeFilterMeta, setCsvIncludeFilterMeta] = useState<boolean>(true);
  const [isScanningLive, setIsScanningLive] = useState<boolean>(false);
  const [inspectedLog, setInspectedLog] = useState<CentralAuditLogEntry | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [pendingRollbackMergeId, setPendingRollbackMergeId] = useState<string | null>(null);

  // Expanded flag cards in Anomaly Panel
  const [expandedFlagIds, setExpandedFlagIds] = useState<Record<string, boolean>>({});

  // Internal anomaly report fallback
  const [internalReport, setInternalReport] = useState<AuditAnomalyJobReport>(() => {
    return auditAnomalyWorker.getReport(logs);
  });

  useEffect(() => {
    const unsub = auditAnomalyWorker.addListener((rep) => {
      setInternalReport(rep);
    });
    return unsub;
  }, []);

  const anomalyReport = externalAnomalyReport || internalReport;

  const flaggedLogIdMap = useMemo(() => {
    const map = new Map<string, SuspiciousAuditFlag>();
    anomalyReport.flags.forEach((flag) => {
      flag.matchingLogs.forEach((l) => {
        map.set(l.id, flag);
      });
    });
    return map;
  }, [anomalyReport.flags]);

  const [testForm, setTestForm] = useState<{
    module: AuditModule;
    recordId: string;
    recordTitle: string;
    actionType: string;
    field: string;
    oldValue: string;
    newValue: string;
    alasan: string;
  }>({
    module: 'S-SALUR',
    recordId: 'CC 211116001',
    recordTitle: 'Budi Santoso (Buku Intisari Lamrim)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran',
    oldValue: 'Belum Bayar',
    newValue: 'Paid (Lunas)',
    alasan: 'Konfirmasi bukti transfer BCA 888',
  });

  // Trigger manual background job scan
  const handleManualScan = () => {
    setIsScanningLive(true);
    if (onTriggerJobScan) {
      onTriggerJobScan();
    } else {
      const rep = auditAnomalyWorker.runScan();
      setInternalReport(rep);
    }
    setTimeout(() => {
      setIsScanningLive(false);
      onShowToast(`Pemeriksaan selesai: ${anomalyReport.scannedLogsCount} log dipindai.`);
    }, 350);
  };

  // Update status of anomaly flag
  const handleToggleFlagStatus = (flag: SuspiciousAuditFlag, newStatus: SuspiciousStatus) => {
    if (onUpdateAnomalyStatus) {
      onUpdateAnomalyStatus(flag.id, newStatus);
    } else {
      saveAnomalyStatusOverride(flag.id, newStatus);
      const rep = auditAnomalyWorker.runScan();
      setInternalReport(rep);
    }
    onShowToast(`Status kasus ${flag.recordTitle} diperbarui.`);
  };

  // Trigger simulation of 4 rapid updates to test the background job
  const handleSimulate = (codeId = '00031', name = 'Agustino Ong', field = 'Nomor HandPhone') => {
    if (onSimulateAnomaly) {
      onSimulateAnomaly(codeId, name, field);
    } else {
      simulateSuspiciousIdentitasUpdates(codeId, name, field);
    }
    onShowToast(`Simulasi 4x perubahan pada ${name} berhasil dikirim.`);
    setSelectedModule('ANOMALI');
  };

  // Helper to apply quick date range presets
  const applyDatePreset = (preset: Exclude<DatePresetKey, 'custom'>) => {
    setActiveDatePreset(preset);
    setSelectedDateFilter(null);
    setSelectedMonthFilter(null);

    if (preset === 'all') {
      setDateRangeStart('');
      setDateRangeEnd('');
      return;
    }

    const now = new Date();
    const todayKey = toLocalDateKey(now);

    if (preset === 'today') {
      setDateRangeStart(todayKey);
      setDateRangeEnd(todayKey);
      return;
    }

    if (preset === '7d') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      setDateRangeStart(toLocalDateKey(start));
      setDateRangeEnd(todayKey);
      return;
    }

    if (preset === '30d') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      setDateRangeStart(toLocalDateKey(start));
      setDateRangeEnd(todayKey);
      return;
    }

    if (preset === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setDateRangeStart(toLocalDateKey(start));
      setDateRangeEnd(todayKey);
    }
  };

  const handleChangeRangeStart = (value: string) => {
    setSelectedDateFilter(null);
    setSelectedMonthFilter(null);
    setDateRangeStart(value);
    if (value && dateRangeEnd && value > dateRangeEnd) {
      setDateRangeEnd(value);
    }
    setActiveDatePreset(value || dateRangeEnd ? 'custom' : 'all');
  };

  const handleChangeRangeEnd = (value: string) => {
    setSelectedDateFilter(null);
    setSelectedMonthFilter(null);
    setDateRangeEnd(value);
    if (value && dateRangeStart && value < dateRangeStart) {
      setDateRangeStart(value);
    }
    setActiveDatePreset(dateRangeStart || value ? 'custom' : 'all');
  };

  const handleResetAllFilters = () => {
    setSelectedModule('ALL');
    setSelectedAction('ALL');
    setSearchQuery('');
    setSelectedMonthFilter(null);
    setSelectedDateFilter(null);
    setDateRangeStart('');
    setDateRangeEnd('');
    setActiveDatePreset('all');
  };

  // Base logs filtered by everything EXCEPT actionType (used for dynamic action counts + filteredLogs)
  const logsBeforeActionFilter = useMemo(() => {
    return logs.filter((log) => {
      if (selectedModule === 'ANOMALI') {
        if (!(flaggedLogIdMap.has(log.id) || log.module === 'IDENTITAS')) {
          return false;
        }
      } else if (selectedModule !== 'ALL' && log.module !== selectedModule) {
        return false;
      }

      const parsedDate = parseAuditLogDate(log);
      const dateKey = parsedDate ? toLocalDateKey(parsedDate) : null;

      if (selectedMonthFilter) {
        if (parsedDate) {
          const mKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
          if (mKey !== selectedMonthFilter) return false;
        } else {
          return false;
        }
      }

      if (selectedDateFilter) {
        if (!dateKey || dateKey !== selectedDateFilter) {
          return false;
        }
      }

      if (dateRangeStart) {
        if (!dateKey || dateKey < dateRangeStart) {
          return false;
        }
      }

      if (dateRangeEnd) {
        if (!dateKey || dateKey > dateRangeEnd) {
          return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.recordId.toLowerCase().includes(q) ||
        log.recordTitle.toLowerCase().includes(q) ||
        log.field.toLowerCase().includes(q) ||
        log.oldValue.toLowerCase().includes(q) ||
        log.newValue.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        (log.alasan || '').toLowerCase().includes(q) ||
        (log.author || '').toLowerCase().includes(q) ||
        (log.metadata?.secondaryCodeId || '').toLowerCase().includes(q) ||
        (log.metadata?.secondaryName || '').toLowerCase().includes(q) ||
        (log.metadata?.mergeRecordId || '').toLowerCase().includes(q) ||
        (log.metadata?.details || '').toLowerCase().includes(q)
      );
    });
  }, [
    logs,
    selectedModule,
    selectedMonthFilter,
    selectedDateFilter,
    dateRangeStart,
    dateRangeEnd,
    searchQuery,
    flaggedLogIdMap,
  ]);

  // Dynamic action categories + counts within the current module/date/search scope
  const { actionCategories, actionCounts } = useMemo(() => {
    const counts: Record<string, number> = { ALL: logsBeforeActionFilter.length };
    const discovered = new Set<string>(CORE_ACTION_CATEGORIES);

    logs.forEach((l) => {
      if (l.actionType) discovered.add(l.actionType);
    });

    logsBeforeActionFilter.forEach((l) => {
      const act = l.actionType || 'Ubah';
      counts[act] = (counts[act] || 0) + 1;
      discovered.add(act);
    });

    const ordered = Array.from(discovered).filter((act) => {
      const isCoreIdentitas =
        act === 'Tambah' || act === 'Ubah' || act === 'Merge' || act === 'Hapus';
      return isCoreIdentitas || (counts[act] || 0) > 0 || selectedAction === act;
    });

    return { actionCategories: ordered, actionCounts: counts };
  }, [logs, logsBeforeActionFilter, selectedAction]);

  // Final filtered & sorted logs
  const filteredLogs = useMemo(() => {
    return logsBeforeActionFilter
      .filter((log) => {
        if (selectedAction !== 'ALL' && log.actionType !== selectedAction) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = getLogSortTimestamp(a);
        const timeB = getLogSortTimestamp(b);
        if (timeA !== timeB) {
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
        return sortOrder === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
      });
  }, [logsBeforeActionFilter, selectedAction, sortOrder]);

  // Filtered identity-only logs respecting active date/action/search filters (for dedicated offline identity archiving)
  const filteredIdentitasLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (log.module !== 'IDENTITAS') return false;
        if (selectedAction !== 'ALL' && log.actionType !== selectedAction) return false;

        const parsedDate = parseAuditLogDate(log);
        const dateKey = parsedDate ? toLocalDateKey(parsedDate) : null;

        if (selectedMonthFilter) {
          if (parsedDate) {
            const mKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
            if (mKey !== selectedMonthFilter) return false;
          } else {
            return false;
          }
        }

        if (selectedDateFilter && (!dateKey || dateKey !== selectedDateFilter)) {
          return false;
        }
        if (dateRangeStart && (!dateKey || dateKey < dateRangeStart)) {
          return false;
        }
        if (dateRangeEnd && (!dateKey || dateKey > dateRangeEnd)) {
          return false;
        }

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          log.recordId.toLowerCase().includes(q) ||
          log.recordTitle.toLowerCase().includes(q) ||
          log.field.toLowerCase().includes(q) ||
          log.oldValue.toLowerCase().includes(q) ||
          log.newValue.toLowerCase().includes(q) ||
          log.actionType.toLowerCase().includes(q) ||
          (log.alasan || '').toLowerCase().includes(q) ||
          (log.author || '').toLowerCase().includes(q) ||
          (log.metadata?.secondaryCodeId || '').toLowerCase().includes(q) ||
          (log.metadata?.secondaryName || '').toLowerCase().includes(q) ||
          (log.metadata?.mergeRecordId || '').toLowerCase().includes(q) ||
          (log.metadata?.details || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const timeA = getLogSortTimestamp(a);
        const timeB = getLogSortTimestamp(b);
        if (timeA !== timeB) {
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
        return sortOrder === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
      });
  }, [
    logs,
    selectedAction,
    selectedMonthFilter,
    selectedDateFilter,
    dateRangeStart,
    dateRangeEnd,
    searchQuery,
    sortOrder,
  ]);

  // Chronological day-grouped timeline buckets
  const timelineGroups = useMemo(() => {
    const groups: {
      dateKey: string;
      label: string;
      items: { log: CentralAuditLogEntry; timeLabel: string }[];
    }[] = [];
    const groupMap = new Map<string, (typeof groups)[number]>();

    filteredLogs.forEach((log) => {
      const parsedDate = parseAuditLogDate(log);
      const dateKey = parsedDate ? toLocalDateKey(parsedDate) : 'unknown';
      const timeLabel = extractLogTimeString(log, parsedDate);

      let group = groupMap.get(dateKey);
      if (!group) {
        group = {
          dateKey,
          label: formatDayGroupLabel(dateKey, log.timestamp),
          items: [],
        };
        groupMap.set(dateKey, group);
        groups.push(group);
      }
      group.items.push({ log, timeLabel });
    });

    return groups;
  }, [filteredLogs]);

  // Compact action breakdown for the timeline header
  const timelineActionSummary = useMemo(() => {
    const map = new Map<string, number>();
    filteredLogs.forEach((l) => {
      map.set(l.actionType, (map.get(l.actionType) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredLogs]);

  const hasActiveFilters =
    selectedModule !== 'ALL' ||
    selectedAction !== 'ALL' ||
    Boolean(searchQuery.trim()) ||
    Boolean(selectedMonthFilter) ||
    Boolean(selectedDateFilter) ||
    Boolean(dateRangeStart) ||
    Boolean(dateRangeEnd);

  // Today's total data changes per action category (for dashboard summary card)
  const todaySummary = useMemo(() => {
    const now = new Date();
    const todayKey = toLocalDateKey(now);
    const todayDisplay = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const counts: Record<string, number> = {};
    const orderedKeys: string[] = [...CORE_ACTION_CATEGORIES];
    let total = 0;

    logs.forEach((log) => {
      const parsedDate = parseAuditLogDate(log);
      if (!parsedDate || toLocalDateKey(parsedDate) !== todayKey) return;
      total += 1;
      const act = log.actionType || 'Ubah';
      counts[act] = (counts[act] || 0) + 1;
      if (!orderedKeys.includes(act)) {
        orderedKeys.push(act);
      }
    });

    const categories = orderedKeys.map((actionType) => {
      const count = counts[actionType] || 0;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        actionType,
        count,
        pct,
      };
    });

    return {
      todayKey,
      todayDisplay,
      total,
      categories,
    };
  }, [logs]);

  // Counts by module for tabs
  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: logs.length,
      'S-SALUR': 0,
      DONASI: 0,
      AJAR: 0,
      IDENTITAS: 0,
    };
    logs.forEach((l) => {
      if (counts[l.module] !== undefined) {
        counts[l.module] += 1;
      } else {
        counts[l.module] = (counts[l.module] || 0) + 1;
      }
    });
    return counts;
  }, [logs]);

  // Copy single log detail
  const handleCopyLog = (log: CentralAuditLogEntry) => {
    const text = `[AUDIT] ${log.timestamp} | ${log.module} | #${log.recordId} ${log.recordTitle} | Field: ${log.field} | "${log.oldValue}" -> "${log.newValue}" | Alasan: ${log.alasan || '-'} | Oleh: ${log.author || 'Sistem'}`;
    navigator.clipboard.writeText(text);
    onShowToast('Detail log berhasil disalin');
  };

  const activeFilterSummaryLabel = useMemo(() => {
    const parts: string[] = [];
    parts.push(
      `Modul: ${selectedModule === 'ALL' ? 'Semua' : selectedModule === 'ANOMALI' ? 'Anomali & Identitas' : selectedModule}`
    );
    parts.push(`Aksi: ${selectedAction === 'ALL' ? 'Semua' : selectedAction}`);
    if (selectedDateFilter) {
      parts.push(`Tanggal: ${selectedDateFilter}`);
    } else if (selectedMonthFilter) {
      parts.push(`Bulan: ${selectedMonthFilter}`);
    } else if (dateRangeStart || dateRangeEnd) {
      parts.push(`Periode: ${dateRangeStart || 'Awal'} s/d ${dateRangeEnd || 'Sekarang'}`);
    } else {
      parts.push('Periode: Semua Tanggal');
    }
    if (searchQuery.trim()) {
      parts.push(`Cari: "${searchQuery.trim()}"`);
    }
    return parts.join(' | ');
  }, [
    selectedModule,
    selectedAction,
    selectedDateFilter,
    selectedMonthFilter,
    dateRangeStart,
    dateRangeEnd,
    searchQuery,
  ]);

  // Export filtered logs to CSV (with UTF-8 BOM & ISO dates for offline archiving in Excel/Sheets)
  const handleExportCsv = (options?: {
    scope?: 'current' | 'identitas';
    delimiter?: ',' | ';';
    includeFilterMeta?: boolean;
  }) => {
    const scope = options?.scope ?? 'current';
    const delimiter = options?.delimiter ?? csvDelimiter;
    const includeMeta = options?.includeFilterMeta ?? csvIncludeFilterMeta;
    const targetLogs = scope === 'identitas' ? filteredIdentitasLogs : filteredLogs;

    if (targetLogs.length === 0) {
      onShowToast(
        scope === 'identitas'
          ? 'Tidak ada data audit perubahan identitas yang sesuai filter untuk diarsipkan'
          : 'Tidak ada data audit log terfilter untuk diekspor'
      );
      return;
    }

    const headers = [
      'No',
      'ID Log',
      'Tanggal (YYYY-MM-DD)',
      'Jam',
      'Waktu Perubahan',
      'ISO Timestamp',
      'Modul',
      'ID / Kode Record',
      'Subjek / Nama Lengkap',
      'Kategori Aksi',
      'Field Diubah',
      'Nilai Sebelumnya',
      'Nilai Baru',
      'Alasan Perubahan',
      'Operator / Admin',
      'Status Anomali',
      'ID Catatan Merge',
      'Rincian Transfer Merge',
      ...(includeMeta ? ['Lingkup Filter Arsip'] : []),
    ];

    const scopeLabel =
      scope === 'identitas'
        ? activeFilterSummaryLabel.replace(/^Modul: [^|]+/, 'Modul: IDENTITAS')
        : activeFilterSummaryLabel;

    const rows = targetLogs.map((l, idx) => {
      const parsedDate = parseAuditLogDate(l);
      const isoDate = parsedDate ? toLocalDateKey(parsedDate) : '-';
      const timeStr = extractLogTimeString(l, parsedDate);
      const isoFull =
        l.isoTimestamp || (parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : '');
      const flag = flaggedLogIdMap.get(l.id);
      const anomalyLabel = flag
        ? `Terindikasi Anomali (${flag.changeCount}x/${flag.windowDays}h)`
        : 'Normal';
      const mergeRec = l.metadata?.mergeSessionRecord;
      const mergeRecId = mergeRec?.id || l.metadata?.mergeRecordId || '-';
      const mergeTransferSummary = mergeRec
        ? `${mergeRec.similarityScore}% (${mergeRec.matchType}) | +${mergeRec.transferredData.totalDataPointsMoved} item (${mergeRec.transferredData.fieldsEnriched} field, ${mergeRec.transferredData.addressesMoved} alamat, ${mergeRec.transferredData.projectsUpdated} proyek, ${mergeRec.transferredData.salurOrdersUpdated} salur)`
        : '-';

      const baseRow = [
        idx + 1,
        l.id,
        isoDate,
        timeStr,
        l.timestamp,
        isoFull,
        l.module,
        l.recordId,
        l.recordTitle || '',
        l.actionType,
        l.field,
        l.oldValue || '-',
        l.newValue || '-',
        l.alasan || '-',
        l.author || 'Sistem',
        anomalyLabel,
        mergeRecId,
        mergeTransferSummary,
      ];

      return includeMeta ? [...baseRow, scopeLabel] : baseRow;
    });

    const modSlug =
      scope === 'identitas'
        ? 'IDENTITAS'
        : selectedModule === 'ALL'
        ? 'Semua'
        : sanitizeCsvFilenameSlug(selectedModule, 20) || 'Modul';
    const actionSlug =
      selectedAction !== 'ALL'
        ? `_Aksi-${sanitizeCsvFilenameSlug(selectedAction, 18)}`
        : '';
    const periodSlug =
      dateRangeStart || dateRangeEnd
        ? `_${dateRangeStart || 'awal'}_sd_${dateRangeEnd || 'akhir'}`
        : selectedDateFilter
        ? `_${selectedDateFilter}`
        : selectedMonthFilter
        ? `_${selectedMonthFilter}`
        : '';
    const querySlug = searchQuery.trim()
      ? `_Cari-${sanitizeCsvFilenameSlug(searchQuery, 18)}`
      : '';
    const prefix =
      scope === 'identitas' ? 'Arsip_Identitas_Audit_Log' : 'Audit_Log_Pusat';

    const result = downloadAuditCsv({
      filename: `${prefix}_${modSlug}${actionSlug}${periodSlug}${querySlug}_${formatCsvDateTag()}.csv`,
      headers,
      rows,
      delimiter,
    });

    onShowToast(
      `${result.rowCount} catatan audit berhasil diekspor ke ${result.filename}`
    );
  };

  // Submit test manual event
  const handleSubmitTestEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.recordId.trim()) {
      onShowToast('ID / Nomor transaksi wajib diisi');
      return;
    }

    dispatchAuditEvent({
      module: testForm.module,
      recordId: testForm.recordId.trim(),
      recordTitle: testForm.recordTitle.trim() || 'Record Uji Coba',
      actionType: testForm.actionType,
      field: testForm.field.trim(),
      oldValue: testForm.oldValue.trim() || '-',
      newValue: testForm.newValue.trim() || '-',
      alasan: testForm.alasan.trim() || 'Uji coba penulisan audit event listener',
      author: 'Admin Tester',
    });

    setIsTestModalOpen(false);
    onShowToast(`Event audit ${testForm.module} berhasil dicatat.`);
  };

  // Clean module color helper
  const getModuleTheme = (mod: AuditModule) => {
    switch (mod) {
      case 'S-SALUR':
        return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'DONASI':
        return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'AJAR':
        return { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' };
      case 'IDENTITAS':
      default:
        return { text: 'text-[#05828e]', bg: 'bg-teal-50', border: 'border-teal-200' };
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* 1. Header Area: Clean, Spacious, Uncluttered */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Sistem Pengawasan Terintegrasi
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <span>Audit Log Pusat</span>
              {anomalyReport.activeFlagsCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {anomalyReport.activeFlagsCount} Anomali
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Pencatatan kronologis seluruh perubahan data krusial di tabel S-SALUR, D-DONASI, A-AJAR, dan IDENTITAS.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Segmented View Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title="Ubah urutan waktu"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
          </button>

          {canExportCsv && (
            <button
              type="button"
              onClick={() => {
                setCsvExportScope(selectedModule === 'IDENTITAS' ? 'identitas' : 'current');
                setIsExportCsvModalOpen(true);
              }}
              title="Konfigurasi dan unduh arsip CSV audit log terfilter untuk penyimpanan offline"
              className="px-3.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100/80 dark:hover:bg-teal-900/50 text-xs font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
              <span className="font-mono tabular-nums px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/70 text-[11px]">
                {filteredLogs.length}
              </span>
            </button>
          )}

          {canManageAnomalies && (
            <button
              type="button"
              onClick={() => setIsTestModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Uji Coba</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive Metric Bar: Quiet & Refined (Replaces Heavy Cluttered Boxes) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        <div className="pt-2 md:pt-0 md:px-3 first:px-0">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Total Riwayat</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums font-mono">
            {logs.length} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">entri</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Seluruh mutasi tercatat</div>
        </div>

        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Background Worker</div>
          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Aktif (Tiap 30 dtk)</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Pemeriksaan ke-{anomalyReport.runCount}
          </div>
        </div>

        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Deteksi Anomali Identitas</div>
          <div className="text-xl sm:text-2xl font-bold mt-0.5 tabular-nums font-mono">
            {anomalyReport.activeFlagsCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400">{anomalyReport.activeFlagsCount}</span>
            ) : (
              <span className="text-slate-800 dark:text-slate-200">0</span>
            )}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500"> kasus (&gt;3x/bln)</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {anomalyReport.scannedIdentitasCount} profil dipantau
          </div>
        </div>

        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Waktu Terakhir Aktif</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {logs[0]?.timestamp || '-'}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Otomatis sinkron via event bus
          </div>
        </div>
      </div>

      {/* 2b. Today Summary Card: Total Data Changes per Action Category for Today */}
      <section
        aria-label="Ringkasan perubahan data hari ini per kategori aksi"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#05828e] dark:text-[#2dd4bf] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Ringkasan Perubahan Hari Ini per Kategori Aksi
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
              <span>{todaySummary.todayDisplay}</span>
              <span aria-hidden="true">·</span>
              <span>
                Total{' '}
                <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                  {todaySummary.total}
                </strong>{' '}
                perubahan tercatat
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const isAlreadyTodayAll =
                selectedModule === 'ALL' &&
                dateRangeStart === todaySummary.todayKey &&
                dateRangeEnd === todaySummary.todayKey &&
                selectedAction === 'ALL';
              if (isAlreadyTodayAll) {
                applyDatePreset('all');
              } else {
                setSelectedModule('ALL');
                applyDatePreset('today');
                setSelectedAction('ALL');
              }
            }}
            className={`self-start sm:self-center px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedModule === 'ALL' &&
              dateRangeStart === todaySummary.todayKey &&
              dateRangeEnd === todaySummary.todayKey &&
              selectedAction === 'ALL'
                ? 'border-[#05828e] bg-teal-50/80 dark:bg-teal-950/50 text-[#05828e] dark:text-[#2dd4bf]'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {selectedModule === 'ALL' &&
            dateRangeStart === todaySummary.todayKey &&
            dateRangeEnd === todaySummary.todayKey &&
            selectedAction === 'ALL'
              ? 'Tampilkan Semua Tanggal'
              : 'Filter Log Hari Ini'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(135px,1fr))] gap-px bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
          {todaySummary.categories.map((item) => {
            const visual = getActionVisualMeta(item.actionType, false);
            const IconComp = visual.icon;
            const isSelectedToday =
              selectedModule === 'ALL' &&
              dateRangeStart === todaySummary.todayKey &&
              dateRangeEnd === todaySummary.todayKey &&
              selectedAction === item.actionType;

            return (
              <button
                key={item.actionType}
                type="button"
                onClick={() => {
                  if (isSelectedToday) {
                    applyDatePreset('all');
                    setSelectedAction('ALL');
                  } else {
                    setSelectedModule('ALL');
                    applyDatePreset('today');
                    setSelectedAction(item.actionType);
                  }
                }}
                title={`Filter log hari ini untuk kategori ${item.actionType}`}
                className={`text-left p-3.5 transition-colors cursor-pointer flex flex-col justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#05828e] ${
                  isSelectedToday
                    ? 'bg-teal-50/80 dark:bg-teal-950/50'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-xs font-semibold truncate ${visual.labelClass}`}>
                    {item.actionType}
                  </span>
                  <IconComp className={`w-3.5 h-3.5 shrink-0 ${visual.labelClass} opacity-80`} />
                </div>

                <div className="space-y-1.5">
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums leading-none ${
                      item.count > 0
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  >
                    {item.count}
                  </div>

                  <div className="space-y-1">
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.count > 0 ? 'bg-[#05828e] dark:bg-[#2dd4bf]' : 'bg-transparent'
                        }`}
                        style={{ width: `${item.count > 0 ? Math.max(item.pct, 6) : 0}%` }}
                      />
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                      {item.count > 0 ? `${item.pct}% hari ini` : 'Belum ada'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Sleek Anomaly Callout Card (Clean, Non-Garish, Helpful) */}
      {anomalyReport.flags.length > 0 && (
        <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Peringatan Deteksi Anomali Identitas
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ditemukan modifikasi berulang lebih dari 3 kali pada field yang sama dalam 1 bulan terakhir.
                </p>
              </div>
            </div>

            {canManageAnomalies && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleManualScan}
                  disabled={isScanningLive}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanningLive ? 'animate-spin' : ''}`} />
                  <span>{isScanningLive ? 'Memindai...' : 'Pindai Ulang'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulate()}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Kirim 4 modifikasi pengujian"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Uji Coba 4x</span>
                </button>
              </div>
            )}
          </div>

          {/* List of Flags */}
          <div className="space-y-2.5 pt-1">
            {anomalyReport.flags.map((flag) => {
              const isExpanded = !!expandedFlagIds[flag.id];
              const isActive = flag.status === 'ACTIVE';

              return (
                <div
                  key={flag.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 text-xs space-y-2.5 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {flag.recordTitle}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        #{flag.recordId}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-semibold text-[#05828e] dark:text-[#2dd4bf]">
                        Field: {flag.field}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-semibold text-rose-700 dark:text-rose-300">
                        {flag.changeCount}x Perubahan
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">({flag.windowDays} hari)</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                      {onNavigateToIdentitas && (
                        <button
                          type="button"
                          onClick={() => onNavigateToIdentitas(flag.recordId)}
                          className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Buka Profil
                        </button>
                      )}

                      {canManageAnomalies && (
                        isActive ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleFlagStatus(flag, 'INVESTIGATED')}
                              className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Tandai Diinvestigasi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleFlagStatus(flag, 'DISMISSED')}
                              className="px-2.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Abaikan
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleFlagStatus(flag, 'ACTIVE')}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Buka Ulang
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFlagIds((prev) => ({
                            ...prev,
                            [flag.id]: !prev[flag.id],
                          }))
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        title={isExpanded ? 'Tutup rincian' : 'Lihat rincian riwayat'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {flag.reason}
                  </p>

                  {/* Expanded Sub-Timeline */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Kronologi {flag.changeCount} Perubahan Field:
                      </div>
                      <div className="space-y-1.5 pl-2">
                        {flag.matchingLogs.map((mLog, idx) => (
                          <div
                            key={mLog.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-slate-400 text-[11px] w-4">
                                #{idx + 1}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">{mLog.timestamp}</span>
                              <span className="font-mono text-rose-600 dark:text-rose-400 line-through">
                                {mLog.oldValue}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                {mLog.newValue}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {mLog.alasan && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-[200px]">
                                  "{mLog.alasan}"
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setInspectedLog(mLog)}
                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#05828e] text-[11px] font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Detail</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Statistik Harian & Kategori Modul (Recharts) */}
      <AuditActivityStatsChart
        logs={logs}
        selectedDate={selectedDateFilter}
        onSelectDate={(d) => {
          setSelectedDateFilter(d);
          if (d) {
            setDateRangeStart('');
            setDateRangeEnd('');
            setActiveDatePreset('all');
            onShowToast(`Filter aktif: Log tanggal ${d}`);
          } else {
            onShowToast('Filter tanggal direset');
          }
        }}
        selectedModule={selectedModule}
        onSelectModule={(mod) => setSelectedModule(mod)}
      />

      {/* 4b. Visualisasi Grafik Tren Perubahan Data Bulanan (Area & Batang dengan Deteksi Lonjakan Aktivitas) */}
      <MonthlyAuditTrendChart
        logs={logs}
        selectedMonth={selectedMonthFilter}
        onSelectMonth={(m) => {
          setSelectedMonthFilter(m);
          if (m) {
            setDateRangeStart('');
            setDateRangeEnd('');
            setActiveDatePreset('all');
            onShowToast(`Filter aktif: Log bulan ${m}`);
          } else {
            onShowToast('Filter bulan direset: Menampilkan semua log');
          }
        }}
        selectedModuleFilter={selectedModule}
        onFilterModule={(mod) => setSelectedModule(mod)}
        flaggedLogIdMap={flaggedLogIdMap}
      />

      {/* 5. Filter Bar: Module Tabs, Date Range Picker & Presets, Action Category Filter, Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Active Single-Date / Month / Date-Range Filter Banner */}
        {(selectedDateFilter || selectedMonthFilter || dateRangeStart || dateRangeEnd) && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/70 rounded-xl text-xs text-slate-800 dark:text-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#05828e] dark:text-[#2dd4bf] shrink-0" />
              <span>
                {selectedDateFilter ? (
                  <>
                    Menampilkan log tanggal{' '}
                    <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                      {selectedDateFilter}
                    </strong>
                  </>
                ) : selectedMonthFilter ? (
                  <>
                    Menampilkan log periode{' '}
                    <strong className="font-semibold text-slate-900 dark:text-white">
                      {selectedMonthFilter}
                    </strong>
                  </>
                ) : (
                  <>
                    Rentang tanggal{' '}
                    <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                      {dateRangeStart || 'Awal'}
                    </strong>{' '}
                    s/d{' '}
                    <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                      {dateRangeEnd || 'Sekarang'}
                    </strong>
                  </>
                )}{' '}
                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  ({filteredLogs.length} dari {logs.length} riwayat)
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDateFilter(null);
                setSelectedMonthFilter(null);
                setDateRangeStart('');
                setDateRangeEnd('');
                setActiveDatePreset('all');
              }}
              className="text-[#05828e] dark:text-[#2dd4bf] hover:text-[#046c76] font-semibold text-xs hover:underline cursor-pointer"
            >
              Reset Periode
            </button>
          </div>
        )}

        {/* Row 1: Module Segmented Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedModule('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedModule === 'ALL'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Semua Modul <span className="text-[11px] opacity-70 ml-1 font-mono tabular-nums">({moduleCounts.ALL})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModule('IDENTITAS')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedModule === 'IDENTITAS'
                  ? 'bg-[#05828e] text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              IDENTITAS <span className="text-[11px] opacity-70 ml-1 font-mono tabular-nums">({moduleCounts['IDENTITAS']})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModule('S-SALUR')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedModule === 'S-SALUR'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              S-SALUR <span className="text-[11px] opacity-70 ml-1 font-mono tabular-nums">({moduleCounts['S-SALUR']})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModule('DONASI')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedModule === 'DONASI'
                  ? 'bg-amber-700 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              D-DONASI <span className="text-[11px] opacity-70 ml-1 font-mono tabular-nums">({moduleCounts['DONASI']})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModule('AJAR')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedModule === 'AJAR'
                  ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              A-AJAR <span className="text-[11px] opacity-70 ml-1 font-mono tabular-nums">({moduleCounts['AJAR']})</span>
            </button>

            {anomalyReport.activeFlagsCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedModule('ANOMALI')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedModule === 'ANOMALI'
                    ? 'bg-rose-700 text-white font-semibold shadow-xs'
                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                }`}
              >
                Anomali ({anomalyReport.activeFlagsCount})
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#05828e] dark:hover:text-[#2dd4bf] flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        {/* Row 2: Rentang Tanggal (Date Range Filter + Quick Presets) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
              <span>Rentang Tanggal:</span>
            </span>
            {(
              [
                { key: 'all', label: 'Semua' },
                { key: 'today', label: 'Hari Ini' },
                { key: '7d', label: '7 Hari' },
                { key: '30d', label: '30 Hari' },
                { key: 'month', label: 'Bulan Ini' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyDatePreset(preset.key)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeDatePreset === preset.key && !selectedDateFilter && !selectedMonthFilter
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-[#2dd4bf] border border-teal-200 dark:border-teal-800 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="text-[11px]">Dari</span>
              <input
                type="date"
                aria-label="Tanggal Mulai"
                value={dateRangeStart}
                onChange={(e) => handleChangeRangeStart(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#05828e]"
              />
            </label>
            <span className="text-slate-400 dark:text-slate-600">—</span>
            <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="text-[11px]">Sampai</span>
              <input
                type="date"
                aria-label="Tanggal Akhir"
                value={dateRangeEnd}
                onChange={(e) => handleChangeRangeEnd(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#05828e]"
              />
            </label>
            {(dateRangeStart || dateRangeEnd) && (
              <button
                type="button"
                onClick={() => applyDatePreset('all')}
                title="Hapus rentang tanggal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Kategori Aksi (Interactive Segmented Action Category Filter) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
            <span>Kategori Aksi:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedAction('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedAction === 'ALL'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Semua Aksi{' '}
            <span className="font-mono tabular-nums text-[11px] opacity-75">
              ({actionCounts.ALL || 0})
            </span>
          </button>
          {actionCategories.map((act) => {
            const count = actionCounts[act] || 0;
            const isSelected = selectedAction === act;
            return (
              <button
                key={act}
                type="button"
                onClick={() => setSelectedAction(isSelected ? 'ALL' : act)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#05828e] text-white font-semibold shadow-2xs'
                    : count === 0
                    ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {act}{' '}
                <span className="font-mono tabular-nums text-[11px] opacity-75">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 4: Search & Export Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, nama donatur, field, nilai, atau alasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#05828e] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canExportCsv && (
              <>
                <button
                  type="button"
                  onClick={() => handleExportCsv({ scope: 'current' })}
                  title="Unduh langsung seluruh data audit log yang sesuai filter saat ini ke format CSV"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:text-[#05828e] dark:hover:text-[#2dd4bf] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
                  <span>Ekspor CSV Terfilter ({filteredLogs.length})</span>
                </button>

                {selectedModule !== 'IDENTITAS' && (
                  <button
                    type="button"
                    onClick={() => handleExportCsv({ scope: 'identitas' })}
                    title="Arsipkan khusus log perubahan Identitas yang sesuai filter tanggal, kategori aksi, dan pencarian saat ini"
                    className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100/80 dark:hover:bg-teal-900/50 text-xs font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Arsip Identitas CSV ({filteredIdentitasLogs.length})</span>
                  </button>
                )}
              </>
            )}

            {onClearLogs && canClearLogs && (
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(true)}
                className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
              >
                Bersihkan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. VIEW 1: Visual Timeline Mode (Chronological Day-Grouped Timeline, Zero-Pill Metadata) */}
      {viewMode === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* Timeline Summary & Identity Quick Focus */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Linimasa Audit
              </span>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums font-semibold text-[#05828e] dark:text-[#2dd4bf]">
                {filteredLogs.length} entri
              </span>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {timelineGroups.length} hari
              </span>
              {timelineActionSummary.length > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-md">
                    {timelineActionSummary
                      .slice(0, 4)
                      .map(([act, count]) => `${count} ${act}`)
                      .join(' · ')}
                  </span>
                </>
              )}
            </div>

            {selectedModule !== 'IDENTITAS' && (
              <button
                type="button"
                onClick={() => setSelectedModule('IDENTITAS')}
                className="self-start sm:self-center text-xs font-semibold text-[#05828e] dark:text-[#2dd4bf] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>Fokus Perubahan Identitas</span>
              </button>
            )}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2.5">
              <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                  Tidak ada riwayat yang sesuai filter
                </div>
                <p className="text-slate-400 dark:text-slate-500 mt-1 max-w-md mx-auto">
                  Coba perluas rentang tanggal, pilih kategori aksi lain, atau hapus kata kunci pencarian.
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {timelineGroups.map((group) => (
                <section key={group.dateKey} className="space-y-4">
                  {/* Chronological Day Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#05828e] dark:text-[#2dd4bf] flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      {group.label}
                    </h3>
                    <div className="flex-1 h-px bg-slate-200/80 dark:bg-slate-800" />
                    <span className="text-[11px] font-mono tabular-nums font-medium text-slate-400 dark:text-slate-500 shrink-0">
                      {group.items.length} aktivitas
                    </span>
                  </div>

                  {/* Vertical Timeline Spine within Day Group */}
                  <div className="relative pl-10 sm:pl-24 space-y-4 before:absolute before:left-[13px] sm:before:left-[75px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                    {group.items.map(({ log, timeLabel }) => {
                      const theme = getModuleTheme(log.module);
                      const isSuspicious = flaggedLogIdMap.has(log.id);
                      const flagItem = flaggedLogIdMap.get(log.id);
                      const actionVisual = getActionVisualMeta(log.actionType, isSuspicious);
                      const ActionIcon = actionVisual.icon;

                      return (
                        <div key={log.id} className="relative group">
                          {/* Desktop Time Rail */}
                          <div className="hidden sm:flex absolute -left-24 top-2.5 w-14 justify-end pr-2 font-mono tabular-nums text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            {timeLabel}
                          </div>

                          {/* Semantic Timeline Node Icon */}
                          <div
                            className={`absolute -left-10 sm:-left-[29px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${actionVisual.nodeClass}`}
                            title={isSuspicious ? 'Terindikasi Anomali' : log.actionType}
                          >
                            <ActionIcon className="w-3 h-3" />
                          </div>

                          {/* Timeline Card: Hairline Border, Zero-Pill Metadata */}
                          <div
                            className={`border rounded-2xl p-4 sm:p-5 transition-all ${
                              isSuspicious
                                ? 'bg-rose-50/20 dark:bg-rose-950/20 hover:bg-rose-50/40 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-800/70'
                                : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                            }`}
                          >
                            {/* Top Meta Line: Clean Unboxed Typography */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-semibold ${theme.text}`}>
                                  {log.module}
                                </span>
                                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                  {log.recordTitle}
                                </span>
                                <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500">
                                  #{log.recordId}
                                </span>
                                <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                                <span className={`font-semibold ${actionVisual.labelClass}`}>
                                  {log.actionType}
                                </span>
                                {isSuspicious && (
                                  <>
                                    <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
                                    <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 inline-flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>Anomali: {flagItem?.changeCount}x Perubahan/{flagItem?.windowDays}d</span>
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px]">
                                <Clock className="w-3 h-3 sm:hidden" />
                                <span className="font-mono tabular-nums">{log.timestamp}</span>
                                <button
                                  type="button"
                                  onClick={() => setInspectedLog(log)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] dark:hover:border-[#2dd4bf] text-[11px] font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat Detail</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLog(log)}
                                  className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                  title="Salin Rincian"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Main Comparison Block */}
                            <div className="pt-2.5 space-y-2">
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <span>Field:</span>
                                <strong className="font-semibold text-slate-900 dark:text-slate-100">{log.field}</strong>
                              </div>

                              <div
                                onClick={() => setInspectedLog(log)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setInspectedLog(log);
                                  }
                                }}
                                title="Klik untuk melihat perbandingan nilai (diff) secara detail"
                                className="bg-slate-50 dark:bg-slate-800/70 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800/70 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase w-14 shrink-0">
                                    Sebelum:
                                  </span>
                                  <span className="font-mono text-rose-700 dark:text-rose-300 line-through decoration-rose-400/70 truncate">
                                    {log.oldValue || '-'}
                                  </span>
                                </div>

                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 hidden sm:block" />

                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[11px] font-medium text-[#05828e] dark:text-[#2dd4bf] uppercase w-14 shrink-0">
                                    Sesudah:
                                  </span>
                                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {log.newValue || '-'}
                                  </span>
                                </div>
                              </div>

                              {/* Inline Forensic MergeSessionRecord Trace Line */}
                              {log.metadata?.mergeSessionRecord && (() => {
                                const mRec = log.metadata.mergeSessionRecord;
                                const td = mRec.transferredData;
                                const rolledBack = Boolean(
                                  log.metadata?.isRolledBack || mRec.isRolledBack
                                );
                                const extras =
                                  (td.donasiOrdersUpdated ?? 0) +
                                  (td.dharmaPatronUpdated ?? 0) +
                                  (td.ajarOrdersUpdated ?? 0);
                                return (
                                  <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                                    <span className="font-semibold text-[#05828e] dark:text-[#2dd4bf]">
                                      Jejak Merge
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                                      ID {mRec.id}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-mono tabular-nums">
                                      Skor {mRec.similarityScore}% ({mRec.matchType === 'fuzzy' ? 'Fuzzy' : 'Eksak'})
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-mono tabular-nums">
                                      {td.totalDataPointsMoved} data dipindahkan ({td.fieldsEnriched} field, {td.addressesMoved} alamat, {td.projectsUpdated} proyek, {td.salurOrdersUpdated} salur{extras > 0 ? `, ${extras} don/dpr/ajar` : ''})
                                    </span>
                                    {rolledBack ? (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="font-semibold text-amber-700 dark:text-amber-400 inline-flex items-center gap-1">
                                          <RotateCcw className="w-3 h-3" />
                                          <span>Sudah Di-rollback</span>
                                        </span>
                                      </>
                                    ) : (
                                      canUndoMerge &&
                                      onUndoMerge && (
                                        <>
                                          <span aria-hidden="true">·</span>
                                          <button
                                            type="button"
                                            onClick={() => setPendingRollbackMergeId(mRec.id)}
                                            className="font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                          >
                                            <RotateCcw className="w-3 h-3" />
                                            <span>Rollback Merge</span>
                                          </button>
                                        </>
                                      )
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Footer: Reason & Author */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1 text-xs">
                                {log.alasan ? (
                                  <div className="text-slate-600 dark:text-slate-300 text-xs italic">
                                    &quot;{log.alasan}&quot;
                                  </div>
                                ) : (
                                  <div />
                                )}

                                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2 self-start sm:self-center">
                                  <span>
                                    Oleh:{' '}
                                    <strong className="font-medium text-slate-700 dark:text-slate-200">
                                      {log.author || 'Sistem'}
                                    </strong>
                                  </span>
                                  {log.module === 'IDENTITAS' && onNavigateToIdentitas && (
                                    <button
                                      type="button"
                                      onClick={() => onNavigateToIdentitas(log.recordId)}
                                      className="text-[#05828e] dark:text-[#2dd4bf] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <span>Profil</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. VIEW 2: Structured Table Mode (Polished, Crisp, Tabular Numerals) */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">#</th>
                  <th className="py-3 px-4 w-36">Waktu</th>
                  <th className="py-3 px-4 w-24">Modul</th>
                  <th className="py-3 px-4 w-28">ID</th>
                  <th className="py-3 px-4">Subjek</th>
                  <th className="py-3 px-4 w-24">Aksi</th>
                  <th className="py-3 px-4">Field</th>
                  <th className="py-3 px-4">Sebelum</th>
                  <th className="py-3 px-4">Sesudah</th>
                  <th className="py-3 px-4">Alasan</th>
                  <th className="py-3 px-4 w-24">Operator</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Detail &amp; Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-10 text-center text-slate-400 dark:text-slate-500">
                      Tidak ada data log yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const theme = getModuleTheme(log.module);
                    const isSuspicious = flaggedLogIdMap.has(log.id);

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setInspectedLog(log)}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          isSuspicious ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 text-center font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono tabular-nums">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`font-semibold ${theme.text}`}>
                            {log.module}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          #{log.recordId}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate">{log.recordTitle}</span>
                            {isSuspicious && (
                              <span className="text-rose-600 dark:text-rose-400 shrink-0" title="Kasus Anomali">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {log.actionType}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#05828e] dark:text-[#2dd4bf] whitespace-nowrap">
                          {log.field}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-rose-600 dark:text-rose-400 line-through max-w-[160px] truncate">
                          {log.oldValue || '-'}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100 max-w-[160px] truncate">
                          {log.newValue || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 max-w-[180px] truncate italic">
                          {log.alasan || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {log.author || 'Sistem'}
                        </td>
                        <td
                          className="py-2.5 px-3 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectedLog(log)}
                              title="Lihat perbedaan nilai (diff) secara detail"
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] dark:hover:border-[#2dd4bf] text-[11px] font-semibold text-[#05828e] dark:text-[#2dd4bf] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyLog(log)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title="Salin"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. MODAL: Test Event & Simulation */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Pengujian Event & Anomali
                </h3>
                <p className="text-xs text-slate-500">
                  Kirim mutasi event langsung untuk menguji pencatatan dan pendeteksian.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Anomaly Simulator */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Uji Coba Anomali Identitas (&gt; 3x Ubah Field)</span>
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Instant Test
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kirim 4 modifikasi cepat berturut-turut pada field Nomor HandPhone milik profil <strong className="font-semibold text-slate-800">00031 Agustino Ong</strong> untuk menguji pendeteksian otomatis.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleSimulate('00031', 'Agustino Ong', 'Nomor HandPhone');
                  setIsTestModalOpen(false);
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Kirim 4x Perubahan Cepat</span>
              </button>
            </div>

            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              — atau Buat Event Tunggal Manual —
            </div>

            <form onSubmit={handleSubmitTestEvent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Modul Sistem
                  </label>
                  <select
                    value={testForm.module}
                    onChange={(e) =>
                      setTestForm({ ...testForm, module: e.target.value as AuditModule })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#05828e]"
                  >
                    <option value="S-SALUR">S-SALUR</option>
                    <option value="DONASI">D-DONASI</option>
                    <option value="AJAR">A-AJAR</option>
                    <option value="IDENTITAS">IDENTITAS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Tipe Aksi
                  </label>
                  <select
                    value={testForm.actionType}
                    onChange={(e) =>
                      setTestForm({ ...testForm, actionType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-[#05828e]"
                  >
                    <option value="Status Bayar">Status Bayar</option>
                    <option value="Pengiriman">Pengiriman / Resi</option>
                    <option value="Tambah">Tambah</option>
                    <option value="Ubah">Ubah Field</option>
                    <option value="Hapus">Hapus Data</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    ID / No. Record
                  </label>
                  <input
                    type="text"
                    required
                    value={testForm.recordId}
                    onChange={(e) =>
                      setTestForm({ ...testForm, recordId: e.target.value })
                    }
                    placeholder="Contoh: CC 211116001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#05828e]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Field Krusial
                  </label>
                  <input
                    type="text"
                    required
                    value={testForm.field}
                    onChange={(e) =>
                      setTestForm({ ...testForm, field: e.target.value })
                    }
                    placeholder="Contoh: Nomor Resi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#05828e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Subjek / Nama Record
                </label>
                <input
                  type="text"
                  value={testForm.recordTitle}
                  onChange={(e) =>
                    setTestForm({ ...testForm, recordTitle: e.target.value })
                  }
                  placeholder="Contoh: Agustino Ong"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#05828e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Nilai Sebelumnya
                  </label>
                  <input
                    type="text"
                    value={testForm.oldValue}
                    onChange={(e) =>
                      setTestForm({ ...testForm, oldValue: e.target.value })
                    }
                    placeholder="Contoh: Belum Bayar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#05828e]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Nilai Baru
                  </label>
                  <input
                    type="text"
                    value={testForm.newValue}
                    onChange={(e) =>
                      setTestForm({ ...testForm, newValue: e.target.value })
                    }
                    placeholder="Contoh: Paid (Lunas)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#05828e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Alasan Perubahan
                </label>
                <input
                  type="text"
                  value={testForm.alasan}
                  onChange={(e) =>
                    setTestForm({ ...testForm, alasan: e.target.value })
                  }
                  placeholder="Masukkan alasan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#05828e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#05828e] hover:bg-[#046c76] text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Kirim Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Diff Modal for Any Audit Log Entry (Identity & Transaction) */}
      <CentralAuditDiffModal
        isOpen={!!inspectedLog}
        onClose={() => setInspectedLog(null)}
        log={inspectedLog}
        allLogs={logs}
        filteredLogs={filteredLogs}
        onSelectLog={(nextLog) => setInspectedLog(nextLog)}
        flaggedLogIdMap={flaggedLogIdMap}
        canUndoMerge={canUndoMerge}
        onUndoMerge={(mergeRecordId) => {
          onUndoMerge?.(mergeRecordId);
        }}
        onShowToast={onShowToast}
        onNavigateToIdentitas={onNavigateToIdentitas}
        onNavigateToModule={(mod) => {
          if (mod === 'S-SALUR' && onNavigateToSalur) onNavigateToSalur();
          else if (mod === 'DONASI' && onNavigateToDonasi) onNavigateToDonasi();
          else if (mod === 'AJAR' && onNavigateToAjar) onNavigateToAjar();
        }}
      />

      {/* Safe In-App Confirmation Modal for Clear Audit Logs */}
      {isClearConfirmOpen && onClearLogs && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Kosongkan Riwayat Audit Log?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Semua catatan audit log pada tampilan ini akan dihapus permanen. Pastikan Anda sudah mengekspor arsip CSV jika masih dibutuhkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsClearConfirmOpen(false);
                  onClearLogs();
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe In-App Confirmation Modal for Inline Rollback Merge */}
      {pendingRollbackMergeId && onUndoMerge && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Rollback Penggabungan Profil?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Profil utama &amp; sekunder serta seluruh transaksi Proyek, S-Salur, Donasi, Patron, dan A-AJAR pada sesi{' '}
                  <span className="font-mono font-semibold">{pendingRollbackMergeId}</span> akan dipulihkan ke kondisi sebelum merge.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingRollbackMergeId(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingRollbackMergeId;
                  setPendingRollbackMergeId(null);
                  onUndoMerge(target);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Pulihkan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Archive CSV Export Modal */}
      {isExportCsvModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsExportCsvModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-csv-modal-title"
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#05828e] dark:text-[#2dd4bf] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    id="export-csv-modal-title"
                    className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base"
                  >
                    Ekspor &amp; Arsip Audit Log ke CSV
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Siapkan file CSV (UTF-8 BOM) untuk pengarsipan perubahan identitas secara offline.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label="Tutup modal ekspor CSV"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Filter Summary */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 p-3.5 text-xs space-y-1.5">
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                Ringkasan Filter Aktif
              </div>
              <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {csvExportScope === 'identitas'
                  ? activeFilterSummaryLabel.replace(/^Modul: [^|]+/, 'Modul: IDENTITAS (Arsip Offline)')
                  : activeFilterSummaryLabel}
              </div>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                Cakupan Data Ekspor
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCsvExportScope('current')}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    csvExportScope === 'current'
                      ? 'border-[#05828e] bg-teal-50/70 dark:bg-teal-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <span>Tampilan Terfilter</span>
                    <span className="font-mono tabular-nums text-[#05828e] dark:text-[#2dd4bf]">
                      {filteredLogs.length} baris
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Mengikuti semua filter modul, tanggal, aksi, &amp; pencarian aktif.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCsvExportScope('identitas')}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    csvExportScope === 'identitas'
                      ? 'border-[#05828e] bg-teal-50/70 dark:bg-teal-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <span>Arsip Identitas</span>
                    <span className="font-mono tabular-nums text-[#05828e] dark:text-[#2dd4bf]">
                      {filteredIdentitasLogs.length} baris
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Khusus perubahan data IDENTITAS sesuai filter tanggal &amp; aksi aktif.
                  </p>
                </button>
              </div>
            </div>

            {/* Delimiter & Filter Metadata Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-200">
                  Pemisah Kolom (Delimiter)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCsvDelimiter(',')}
                    className={`py-2 px-2.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                      csvDelimiter === ','
                        ? 'border-[#05828e] bg-teal-50/70 dark:bg-teal-950/40 text-[#05828e] dark:text-[#2dd4bf] font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Koma ( , )
                  </button>
                  <button
                    type="button"
                    onClick={() => setCsvDelimiter(';')}
                    className={`py-2 px-2.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                      csvDelimiter === ';'
                        ? 'border-[#05828e] bg-teal-50/70 dark:bg-teal-950/40 text-[#05828e] dark:text-[#2dd4bf] font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Titik Koma ( ; )
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block font-semibold text-slate-700 dark:text-slate-200">
                  Kolom Konteks Arsip
                </span>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={csvIncludeFilterMeta}
                    onChange={(e) => setCsvIncludeFilterMeta(e.target.checked)}
                    className="rounded border-slate-300 text-[#05828e] focus:ring-[#05828e]"
                  />
                  <span className="text-slate-600 dark:text-slate-300">
                    Sertakan kolom Lingkup Filter
                  </span>
                </label>
              </div>
            </div>

            {/* Preview First 3 Rows */}
            {(() => {
              const previewSource =
                csvExportScope === 'identitas' ? filteredIdentitasLogs : filteredLogs;
              return (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Pratinjau Data yang Akan Diekspor</span>
                    <span className="font-mono tabular-nums">
                      Menampilkan {Math.min(previewSource.length, 3)} dari {previewSource.length} baris
                    </span>
                  </div>
                  {previewSource.length === 0 ? (
                    <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500">
                      Tidak ada baris data yang cocok untuk cakupan ini.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      {previewSource.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="px-3 py-2 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-[11px]"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.recordTitle}{' '}
                              <span className="font-mono text-slate-400">#{item.recordId}</span>
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 truncate">
                              {item.actionType} · {item.field}: {item.oldValue || '-'} →{' '}
                              {item.newValue || '-'}
                            </div>
                          </div>
                          <span className="font-mono tabular-nums text-slate-400 shrink-0">
                            {item.module}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportCsvModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  (csvExportScope === 'identitas'
                    ? filteredIdentitasLogs.length
                    : filteredLogs.length) === 0
                }
                onClick={() => {
                  handleExportCsv({
                    scope: csvExportScope,
                    delimiter: csvDelimiter,
                    includeFilterMeta: csvIncludeFilterMeta,
                  });
                  setIsExportCsvModalOpen(false);
                }}
                className="px-4 py-2 bg-[#05828e] hover:bg-[#046c76] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  Unduh Arsip CSV (
                  {csvExportScope === 'identitas'
                    ? filteredIdentitasLogs.length
                    : filteredLogs.length}
                  )
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
