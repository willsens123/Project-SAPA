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
import { MonthlyAuditTrendChart, extractLogDate } from './MonthlyAuditTrendChart';

interface CentralAuditLogViewProps {
  logs: CentralAuditLogEntry[];
  anomalyReport?: AuditAnomalyJobReport;
  onTriggerJobScan?: () => void;
  onUpdateAnomalyStatus?: (flagId: string, status: SuspiciousStatus, notes?: string) => void;
  onSimulateAnomaly?: (codeId?: string, name?: string, field?: string) => void;
  onBack?: () => void;
  onClearLogs?: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToIdentitas?: (codeId: string) => void;
  onNavigateToSalur?: () => void;
  onNavigateToDonasi?: () => void;
  onNavigateToAjar?: () => void;
}

export const CentralAuditLogView: React.FC<CentralAuditLogViewProps> = ({
  logs,
  anomalyReport: externalAnomalyReport,
  onTriggerJobScan,
  onUpdateAnomalyStatus,
  onSimulateAnomaly,
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

  // Sort chronological order: 'desc' vs 'asc'
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Test event modal
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [isScanningLive, setIsScanningLive] = useState<boolean>(false);

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

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (selectedModule === 'ANOMALI') {
          return flaggedLogIdMap.has(log.id) || log.module === 'IDENTITAS';
        }
        if (selectedModule !== 'ALL' && log.module !== selectedModule) {
          return false;
        }
        if (selectedAction !== 'ALL' && log.actionType !== selectedAction) {
          return false;
        }
        if (selectedMonthFilter) {
          const d = extractLogDate(log);
          if (d) {
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (mKey !== selectedMonthFilter) return false;
          } else {
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
          (log.alasan || '').toLowerCase().includes(q) ||
          (log.author || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const timeA = a.isoTimestamp ? new Date(a.isoTimestamp).getTime() : 0;
        const timeB = b.isoTimestamp ? new Date(b.isoTimestamp).getTime() : 0;
        if (timeA && timeB) {
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
        return sortOrder === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
      });
  }, [logs, selectedModule, selectedAction, selectedMonthFilter, searchQuery, sortOrder, flaggedLogIdMap]);

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

  // Export filtered logs to CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      onShowToast('Tidak ada data audit log untuk diekspor');
      return;
    }

    const headers = [
      'ID Log',
      'Waktu Perubahan',
      'Modul',
      'ID Record',
      'Subjek Record',
      'Tipe Aksi',
      'Field',
      'Nilai Sebelumnya',
      'Nilai Baru',
      'Alasan',
      'Operator',
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.module}"`,
      `"${l.recordId}"`,
      `"${(l.recordTitle || '').replace(/"/g, '""')}"`,
      `"${l.actionType}"`,
      `"${l.field}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      `"${(l.alasan || '').replace(/"/g, '""')}"`,
      `"${l.author || 'Sistem'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_Log_Pusat_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Audit Log CSV berhasil diunduh');
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sistem Pengawasan Terintegrasi
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Audit Log Pusat</span>
              {anomalyReport.activeFlagsCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {anomalyReport.activeFlagsCount} Anomali
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Pencatatan kronologis seluruh perubahan data krusial di tabel S-SALUR, D-DONASI, A-AJAR, dan IDENTITAS.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Segmented View Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ubah urutan waktu"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTestModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Uji Coba</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metric Bar: Quiet & Refined (Replaces Heavy Cluttered Boxes) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="pt-2 md:pt-0 md:px-3 first:px-0">
          <div className="text-[11px] font-medium text-slate-400">Total Riwayat</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 tabular-nums font-mono">
            {logs.length} <span className="text-xs font-normal text-slate-400">entri</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Seluruh mutasi tercatat</div>
        </div>

        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400">Background Worker</div>
          <div className="text-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Aktif (Tiap 30 dtk)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Pemeriksaan ke-{anomalyReport.runCount}
          </div>
        </div>

        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400">Deteksi Anomali Identitas</div>
          <div className="text-xl sm:text-2xl font-bold mt-0.5 tabular-nums font-mono">
            {anomalyReport.activeFlagsCount > 0 ? (
              <span className="text-rose-600">{anomalyReport.activeFlagsCount}</span>
            ) : (
              <span className="text-slate-800">0</span>
            )}
            <span className="text-xs font-normal text-slate-400"> kasus (&gt;3x/bln)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {anomalyReport.scannedIdentitasCount} profil dipantau
          </div>
        </div>

        <div className="pt-2 md:pt-0 md:px-3">
          <div className="text-[11px] font-medium text-slate-400">Waktu Terakhir Aktif</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 truncate">
            {logs[0]?.timestamp || '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Otomatis sinkron via event bus
          </div>
        </div>
      </div>

      {/* 3. Sleek Anomaly Callout Card (Clean, Non-Garish, Helpful) */}
      {anomalyReport.flags.length > 0 && (
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Peringatan Deteksi Anomali Identitas
                </h2>
                <p className="text-xs text-slate-600">
                  Ditemukan modifikasi berulang lebih dari 3 kali pada field yang sama dalam 1 bulan terakhir.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleManualScan}
                disabled={isScanningLive}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isScanningLive ? 'animate-spin' : ''}`} />
                <span>{isScanningLive ? 'Memindai...' : 'Pindai Ulang'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulate()}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100/60 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                title="Kirim 4 modifikasi pengujian"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Uji Coba 4x</span>
              </button>
            </div>
          </div>

          {/* List of Flags */}
          <div className="space-y-2.5 pt-1">
            {anomalyReport.flags.map((flag) => {
              const isExpanded = !!expandedFlagIds[flag.id];
              const isActive = flag.status === 'ACTIVE';

              return (
                <div
                  key={flag.id}
                  className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 text-xs space-y-2.5 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {flag.recordTitle}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        #{flag.recordId}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-[#05828e]">
                        Field: {flag.field}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {flag.changeCount}x Perubahan
                      </span>
                      <span className="text-slate-400">({flag.windowDays} hari)</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                      {onNavigateToIdentitas && (
                        <button
                          type="button"
                          onClick={() => onNavigateToIdentitas(flag.recordId)}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Buka Profil
                        </button>
                      )}

                      {isActive ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleFlagStatus(flag, 'INVESTIGATED')}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Tandai Diinvestigasi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFlagStatus(flag, 'DISMISSED')}
                            className="px-2.5 py-1 rounded hover:bg-slate-100 text-slate-500 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Abaikan
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleFlagStatus(flag, 'ACTIVE')}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Buka Ulang
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFlagIds((prev) => ({
                            ...prev,
                            [flag.id]: !prev[flag.id],
                          }))
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={isExpanded ? 'Tutup rincian' : 'Lihat rincian riwayat'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {flag.reason}
                  </p>

                  {/* Expanded Sub-Timeline */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Kronologi {flag.changeCount} Perubahan Field:
                      </div>
                      <div className="space-y-1.5 pl-2 border-l border-slate-200">
                        {flag.matchingLogs.map((mLog, idx) => (
                          <div
                            key={mLog.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 bg-slate-50 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-400 text-[11px] w-4">
                                #{idx + 1}
                              </span>
                              <span className="text-slate-500">{mLog.timestamp}</span>
                              <span className="font-mono text-rose-600 line-through">
                                {mLog.oldValue}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-mono font-semibold text-emerald-700">
                                {mLog.newValue}
                              </span>
                            </div>
                            {mLog.alasan && (
                              <div className="text-[11px] text-slate-500 italic">
                                "{mLog.alasan}"
                              </div>
                            )}
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

      {/* 4. Visualisasi Grafik Tren Perubahan Data Bulanan (Area & Batang dengan Deteksi Lonjakan Aktivitas) */}
      <MonthlyAuditTrendChart
        logs={logs}
        selectedMonth={selectedMonthFilter}
        onSelectMonth={(m) => {
          setSelectedMonthFilter(m);
          if (m) {
            onShowToast(`Filter aktif: Log bulan ${m}`);
          } else {
            onShowToast('Filter bulan direset: Menampilkan semua log');
          }
        }}
        selectedModuleFilter={selectedModule}
        onFilterModule={(mod) => setSelectedModule(mod)}
        flaggedLogIdMap={flaggedLogIdMap}
      />

      {/* 5. Filter Bar: Clean Segmented Controls & Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Active Month Filter Chip Banner */}
        {selectedMonthFilter && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#05828e] shrink-0" />
              <span>
                Menampilkan log khusus periode <strong className="font-semibold text-slate-900">{selectedMonthFilter}</strong>{' '}
                <span className="font-mono text-slate-500">({filteredLogs.length} dari {logs.length} riwayat)</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMonthFilter(null)}
              className="text-[#05828e] hover:text-[#046c76] font-semibold text-xs hover:underline cursor-pointer"
            >
              Hapus Filter Bulan
            </button>
          </div>
        )}

        {/* Module Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedModule('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedModule === 'ALL'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Modul <span className="text-[11px] opacity-70 ml-1">({moduleCounts.ALL})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('S-SALUR')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedModule === 'S-SALUR'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            S-SALUR <span className="text-[11px] opacity-70 ml-1">({moduleCounts['S-SALUR']})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('DONASI')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedModule === 'DONASI'
                ? 'bg-amber-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            D-DONASI <span className="text-[11px] opacity-70 ml-1">({moduleCounts['DONASI']})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('AJAR')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedModule === 'AJAR'
                ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            A-AJAR <span className="text-[11px] opacity-70 ml-1">({moduleCounts['AJAR']})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('IDENTITAS')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedModule === 'IDENTITAS'
                ? 'bg-[#05828e] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            IDENTITAS <span className="text-[11px] opacity-70 ml-1">({moduleCounts['IDENTITAS']})</span>
          </button>

          {anomalyReport.activeFlagsCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedModule('ANOMALI')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                selectedModule === 'ANOMALI'
                  ? 'bg-rose-700 text-white font-semibold shadow-xs'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              Anomali ({anomalyReport.activeFlagsCount})
            </button>
          )}
        </div>

        {/* Search & Action Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, nama donatur, field, nilai, atau alasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-[#05828e] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Tipe Aksi:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-[#05828e]"
            >
              <option value="ALL">Semua Aksi</option>
              <option value="Tambah">Tambah</option>
              <option value="Ubah">Ubah Field</option>
              <option value="Status Bayar">Status Bayar</option>
              <option value="Pengiriman">Pengiriman / Resi</option>
              <option value="Hapus">Hapus</option>
            </select>

            {onClearLogs && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kosongkan semua riwayat audit log?')) {
                    onClearLogs();
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 transition-colors cursor-pointer"
              >
                Bersihkan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. VIEW 1: Visual Timeline Mode (Restyled, Zero-Pill Sandwich, Crisp & Calm) */}
      {viewMode === 'timeline' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-slate-600">Tidak ada riwayat yang sesuai filter</div>
              <p className="text-slate-400 mt-0.5">
                Silakan ganti kata kunci pencarian atau pilih tab modul lain.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-7 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              {filteredLogs.map((log) => {
                const theme = getModuleTheme(log.module);
                const isSuspicious = flaggedLogIdMap.has(log.id);
                const flagItem = flaggedLogIdMap.get(log.id);

                return (
                  <div key={log.id} className="relative group transition-all">
                    {/* Node Dot: Minimal, Uncluttered */}
                    <div
                      className={`absolute -left-6 sm:-left-7 top-1.5 w-3 h-3 rounded-full ring-4 ring-white transition-transform group-hover:scale-125 ${
                        isSuspicious
                          ? 'bg-rose-600 ring-rose-50'
                          : log.module === 'S-SALUR'
                          ? 'bg-emerald-600'
                          : log.module === 'DONASI'
                          ? 'bg-amber-600'
                          : log.module === 'AJAR'
                          ? 'bg-indigo-600'
                          : 'bg-[#05828e]'
                      }`}
                    />

                    {/* Timeline Card: Hairline Border, Generous Whitespace, No Pill Clutter */}
                    <div
                      className={`border rounded-2xl p-4 sm:p-5 transition-all ${
                        isSuspicious
                          ? 'bg-rose-50/20 hover:bg-rose-50/40 border-rose-200'
                          : 'bg-white hover:bg-slate-50/60 border-slate-200/80 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Top Meta Line: Clean Unboxed Text with Separators */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold ${theme.text}`}>
                            {log.module}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {log.recordTitle}
                          </span>
                          <span className="font-mono text-slate-400">
                            #{log.recordId}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-medium text-slate-600">
                            {log.actionType}
                          </span>
                          {isSuspicious && (
                            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/80">
                              ⚠️ Anomali: {flagItem?.changeCount}x Perubahan/{flagItem?.windowDays}d
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{log.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyLog(log)}
                            className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Salin Rincian"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Main Comparison Block: Clean Strikethrough to New Value */}
                      <div className="pt-2.5 space-y-2">
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span>Field:</span>
                          <strong className="font-semibold text-slate-900">{log.field}</strong>
                        </div>

                        {/* High-legibility before/after row */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-slate-400 uppercase w-14 shrink-0">
                              Sebelum:
                            </span>
                            <span className="font-mono text-slate-500 line-through decoration-rose-300 truncate">
                              {log.oldValue || '-'}
                            </span>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:block" />

                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-slate-400 uppercase w-14 shrink-0">
                              Sesudah:
                            </span>
                            <span className="font-mono font-semibold text-slate-900 truncate">
                              {log.newValue || '-'}
                            </span>
                          </div>
                        </div>

                        {/* Footer: Reason & Author */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1 text-xs">
                          {log.alasan ? (
                            <div className="text-slate-600 text-xs italic">
                              "{log.alasan}"
                            </div>
                          ) : (
                            <div />
                          )}

                          <div className="text-[11px] text-slate-400 flex items-center gap-2 self-start sm:self-center">
                            <span>Oleh: <strong className="font-medium text-slate-700">{log.author || 'Sistem'}</strong></span>
                            {log.module === 'IDENTITAS' && onNavigateToIdentitas && (
                              <button
                                type="button"
                                onClick={() => onNavigateToIdentitas(log.recordId)}
                                className="text-[#05828e] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
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
          )}
        </div>
      )}

      {/* 6. VIEW 2: Structured Table Mode (Polished, Crisp, Tabular Numerals) */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
                  <th className="py-3 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-10 text-center text-slate-400">
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
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSuspicious ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 text-center font-mono text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className={`font-semibold ${theme.text}`}>
                            {log.module}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                          #{log.recordId}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                          <div className="flex items-center gap-1.5">
                            <span>{log.recordTitle}</span>
                            {isSuspicious && (
                              <span className="text-rose-600 text-[10px] font-bold" title="Kasus Anomali">
                                ⚠️
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {log.actionType}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#05828e] whitespace-nowrap">
                          {log.field}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-400 max-w-xs truncate">
                          {log.oldValue || '-'}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900 max-w-xs truncate">
                          {log.newValue || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate italic">
                          {log.alasan || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                          {log.author || 'Sistem'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleCopyLog(log)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Salin"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
