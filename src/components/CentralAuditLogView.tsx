import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  SlidersHorizontal,
  Download,
  Clock,
  Check,
  X,
  Copy,
  ChevronLeft,
  ArrowRight,
  GitCommit,
  Layers,
  Sparkles,
  ShoppingBag,
  HeartHandshake,
  GraduationCap,
  User,
  ShieldCheck,
  FileSpreadsheet,
  ArrowDownUp,
  Activity,
  Plus,
  RefreshCw,
  Tag,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { CentralAuditLogEntry, AuditModule } from '../types';
import { dispatchAuditEvent, formatAuditTimestamp } from '../utils/auditEventBus';

interface CentralAuditLogViewProps {
  logs: CentralAuditLogEntry[];
  onBack?: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToView?: (view: string) => void;
}

export const CentralAuditLogView: React.FC<CentralAuditLogViewProps> = ({
  logs,
  onBack,
  onShowToast,
  onNavigateToView,
}) => {
  // View mode: 'timeline' (Visual chronological track) vs 'table' (Structured data grid)
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Filter Modul
  const [selectedModule, setSelectedModule] = useState<'ALL' | AuditModule>('ALL');

  // Filter Aksi
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  // Search keyword
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sort chronological order: 'desc' (Newest first) vs 'asc' (Oldest first)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Test event modal
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
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

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        // Module filter
        if (selectedModule !== 'ALL' && log.module !== selectedModule) {
          return false;
        }

        // Action filter
        if (selectedAction !== 'ALL' && log.actionType !== selectedAction) {
          return false;
        }

        // Search query
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
  }, [logs, selectedModule, selectedAction, searchQuery, sortOrder]);

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

  // Executive KPI summary statistics
  const kpiStats = useMemo(() => {
    const total = logs.length;
    const moduleTally: Record<string, number> = {};
    const actionTally: Record<string, number> = {};

    logs.forEach((l) => {
      moduleTally[l.module] = (moduleTally[l.module] || 0) + 1;
      actionTally[l.actionType] = (actionTally[l.actionType] || 0) + 1;
    });

    let topMod = 'S-SALUR';
    let maxModCount = 0;
    Object.entries(moduleTally).forEach(([m, count]) => {
      if (count > maxModCount) {
        maxModCount = count;
        topMod = m;
      }
    });

    let topAct = 'Status Bayar';
    let maxActCount = 0;
    Object.entries(actionTally).forEach(([act, count]) => {
      if (count > maxActCount) {
        maxActCount = count;
        topAct = act;
      }
    });

    return {
      total,
      topModule: `${topMod} (${maxModCount} log)`,
      topAction: `${topAct} (${maxActCount}x)`,
      lastActiveTime: logs[0]?.timestamp || '-',
    };
  }, [logs]);

  // Copy single log detail
  const handleCopyLog = (log: CentralAuditLogEntry) => {
    const text = `[AUDIT PUSAT] ${log.timestamp} | Modul: ${log.module} | ID: ${log.recordId} | Subjek: ${log.recordTitle} | Field: ${log.field} | Sebelum: "${log.oldValue}" -> Sesudah: "${log.newValue}" | Alasan: ${log.alasan || '-'} | Operator: ${log.author || 'Sistem'}`;
    navigator.clipboard.writeText(text);
    onShowToast('Detail log berhasil disalin ke clipboard');
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
      'Modul Sistem',
      'Nomor / ID Record',
      'Subjek / Nama Transaksi',
      'Tipe Aksi',
      'Field Krusial',
      'Nilai Sebelumnya',
      'Nilai Baru',
      'Alasan Perubahan',
      'Operator / Author',
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
    link.setAttribute('download', `Audit_Log_Pusat_${selectedModule}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Audit Log Pusat berhasil diekspor ke CSV');
  };

  // Dispatch simulated test event
  const handleTriggerTestEvent = () => {
    if (!testForm.recordId.trim() || !testForm.field.trim()) {
      onShowToast('Mohon lengkapi ID Record dan Nama Field');
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
    onShowToast(`Event audit ${testForm.module} berhasil ditangkap & dicatat!`);
  };

  // Helper for module badge
  const renderModuleBadge = (mod: AuditModule) => {
    switch (mod) {
      case 'S-SALUR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShoppingBag className="w-3 h-3" />
            <span>S-SALUR</span>
          </span>
        );
      case 'DONASI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <HeartHandshake className="w-3 h-3" />
            <span>D-DONASI</span>
          </span>
        );
      case 'AJAR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <GraduationCap className="w-3 h-3" />
            <span>A-AJAR</span>
          </span>
        );
      case 'IDENTITAS':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#05828e] border border-teal-200">
            <User className="w-3 h-3" />
            <span>IDENTITAS</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#05828e] to-teal-800 text-white flex items-center justify-center shadow-xs shrink-0">
            <History className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Modul Audit Log Pusat (Central Audit Trail)
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Event Listener Aktif</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mencatat otomatis setiap perubahan data krusial di seluruh tabel (S-SALUR, D-DONASI, A-AJAR & IDENTITAS).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Alur Visual (Timeline)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabel Rinci</span>
            </button>
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            title={`Urutan: ${sortOrder === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}`}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortOrder === 'desc' ? 'Terbaru Dulu' : 'Terlama Dulu'}</span>
          </button>

          {/* Test Event Button */}
          <button
            type="button"
            onClick={() => setIsTestModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100/80 text-xs font-semibold text-[#05828e] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Uji Coba Event</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            title="Ekspor seluruh log audit ke CSV"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:text-[#05828e] text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Riwayat Audit
            </span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#05828e]">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {kpiStats.total} entri
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tercatat di seluruh sistem terintegrasi
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Modul Paling Aktif
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
            {kpiStats.topModule}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Aktivitas transaksi terbanyak
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Aksi Dominan
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
            {kpiStats.topAction}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Verifikasi status pembayaran
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Waktu Terakhir Aktif
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 truncate">
            {kpiStats.lastActiveTime}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Sinkronisasi otomatis event bus
          </div>
        </div>
      </div>

      {/* Filter Modules Segmented Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Module Segmented Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedModule('ALL')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedModule === 'ALL'
                ? 'bg-[#05828e] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Modul</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {moduleCounts.ALL}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('S-SALUR')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedModule === 'S-SALUR'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>S-SALUR</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {moduleCounts['S-SALUR']}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('DONASI')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedModule === 'DONASI'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>D-DONASI</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {moduleCounts['DONASI']}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('AJAR')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedModule === 'AJAR'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>A-AJAR</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {moduleCounts['AJAR']}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModule('IDENTITAS')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedModule === 'IDENTITAS'
                ? 'bg-[#05828e] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>IDENTITAS</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {moduleCounts['IDENTITAS']}
            </span>
          </button>
        </div>

        {/* Search & Action Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID transaksi, nama donatur/peserta, field, nilai, atau alasan..."
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
            <span className="text-xs text-slate-500 font-medium">Filter Aksi:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-700 outline-none focus:border-[#05828e] cursor-pointer"
            >
              <option value="ALL">Semua Tipe Aksi</option>
              <option value="Tambah">Aksi: Tambah Data</option>
              <option value="Status Bayar">Aksi: Status Bayar</option>
              <option value="Pengiriman">Aksi: Pengiriman & Resi</option>
              <option value="Ubah">Aksi: Ubah Data</option>
              <option value="Hapus">Aksi: Hapus Data</option>
              <option value="Merge">Aksi: Merge Profil</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: Visual Timeline Mode (Serupa dengan EditIdentitasView) */}
      {viewMode === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs sm:text-sm bg-slate-50/60 rounded-xl border border-dashed border-slate-200 p-8">
              <History className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-slate-600">Belum ada riwayat audit log yang sesuai</div>
              <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                Setiap kali data krusial di tabel S-SALUR, Donasi, atau Ajar diubah, event listener pusat akan otomatis merekam riwayat perubahannya di sini.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-linear-to-b before:from-teal-400 before:via-slate-200 before:to-slate-100">
              {filteredLogs.map((log) => {
                const isSalur = log.module === 'S-SALUR';
                const isDonasi = log.module === 'DONASI';
                const isAjar = log.module === 'AJAR';

                return (
                  <div key={log.id} className="relative group transition-all">
                    {/* Node Dot / Bubble */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs transition-transform group-hover:scale-110 ${
                        isSalur
                          ? 'bg-emerald-600 text-white'
                          : isDonasi
                          ? 'bg-amber-600 text-white'
                          : isAjar
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#05828e] text-white'
                      }`}
                    >
                      {isSalur ? (
                        <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      ) : isDonasi ? (
                        <HeartHandshake className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      ) : isAjar ? (
                        <GraduationCap className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      ) : (
                        <GitCommit className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-teal-300">
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderModuleBadge(log.module)}

                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200/60 text-slate-700">
                            {log.actionType}
                          </span>

                          <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            #{log.recordId}
                          </span>

                          <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                            {log.recordTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.timestamp}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopyLog(log)}
                            title="Salin detail log"
                            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-white transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Field Name & Subtitle */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          Field yang Berubah:{' '}
                          <span className="text-[#05828e] font-bold">{log.field}</span>
                        </span>
                        {log.author && (
                          <span className="text-slate-400 text-[11px]">
                            Oleh: <strong className="text-slate-600">{log.author}</strong>
                          </span>
                        )}
                      </div>

                      {/* Diff Box: Nilai Sebelumnya vs Nilai Baru */}
                      <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-700 uppercase tracking-wider mb-1">
                            <span>Sebelumnya</span>
                            <span className="text-[10px] text-rose-500 font-normal">Nilai Lama</span>
                          </div>
                          <div className="text-xs sm:text-sm text-rose-900 font-mono break-all line-through decoration-rose-400/80">
                            {log.oldValue || '-'}
                          </div>
                        </div>

                        <div className="bg-teal-50/70 border border-teal-200/90 rounded-xl p-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#05828e] uppercase tracking-wider mb-1">
                            <span>Menjadi</span>
                            <span className="text-[10px] text-teal-600 font-normal">Nilai Baru</span>
                          </div>
                          <div className="text-xs sm:text-sm text-teal-950 font-mono font-semibold break-all">
                            {log.newValue || '-'}
                          </div>
                        </div>
                      </div>

                      {/* Alasan Perubahan Callout */}
                      {log.alasan && (
                        <div className="mt-3 flex items-start gap-2 bg-white border border-slate-200/80 rounded-xl p-3 text-xs">
                          <span className="font-semibold text-slate-600 shrink-0">
                            Catatan / Alasan:
                          </span>
                          <span className="text-slate-700 italic">
                            "{log.alasan}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Structured Grid Table Mode */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px] text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50/60">
                <th className="py-3 px-4 w-40">Waktu</th>
                <th className="py-3 px-3">Modul</th>
                <th className="py-3 px-3">ID / Ref</th>
                <th className="py-3 px-4">Subjek Transaksi</th>
                <th className="py-3 px-3">Aksi</th>
                <th className="py-3 px-3">Field</th>
                <th className="py-3 px-4">Nilai Lama</th>
                <th className="py-3 px-4">Nilai Baru</th>
                <th className="py-3 px-4">Alasan Modifikasi</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {renderModuleBadge(log.module)}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {log.recordId}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-[200px] truncate" title={log.recordTitle}>
                    {log.recordTitle}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {log.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-rose-600 line-through max-w-[150px] truncate" title={log.oldValue}>
                    {log.oldValue}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-emerald-700 font-semibold max-w-[150px] truncate" title={log.newValue}>
                    {log.newValue}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={log.alasan}>
                    {log.alasan || '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {log.author || 'Sistem'}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleCopyLog(log)}
                      title="Salin baris log"
                      className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400 text-sm">
                    Tidak ada data log yang memenuhi kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Uji Coba Event Listener / Manual Event Dispatch */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#05828e] text-white flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Simulasi & Uji Coba Event Listener
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kirim event audit secara manual untuk memvalidasi pencatatan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Modul</label>
                <select
                  value={testForm.module}
                  onChange={(e) => setTestForm({ ...testForm, module: e.target.value as AuditModule })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-[#05828e]"
                >
                  <option value="S-SALUR">S-SALUR (Order & Pengiriman)</option>
                  <option value="DONASI">D-DONASI (Donasi & Patron)</option>
                  <option value="AJAR">A-AJAR (Pendaftaran Kelas)</option>
                  <option value="IDENTITAS">IDENTITAS (Profil Donatur)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ID / Nomor Record</label>
                <input
                  type="text"
                  value={testForm.recordId}
                  onChange={(e) => setTestForm({ ...testForm, recordId: e.target.value })}
                  placeholder="Contoh: CC 211116001"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#05828e]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subjek / Pelanggan / Donatur</label>
                <input
                  type="text"
                  value={testForm.recordTitle}
                  onChange={(e) => setTestForm({ ...testForm, recordTitle: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#05828e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Aksi</label>
                  <select
                    value={testForm.actionType}
                    onChange={(e) => setTestForm({ ...testForm, actionType: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50 outline-none focus:border-[#05828e]"
                  >
                    <option value="Status Bayar">Status Bayar</option>
                    <option value="Pengiriman">Pengiriman / Resi</option>
                    <option value="Tambah">Tambah Data</option>
                    <option value="Ubah">Ubah Data</option>
                    <option value="Hapus">Hapus Data</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Field Krusial</label>
                  <input
                    type="text"
                    value={testForm.field}
                    onChange={(e) => setTestForm({ ...testForm, field: e.target.value })}
                    placeholder="Contoh: Status Pembayaran"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#05828e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nilai Lama</label>
                  <input
                    type="text"
                    value={testForm.oldValue}
                    onChange={(e) => setTestForm({ ...testForm, oldValue: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nilai Baru</label>
                  <input
                    type="text"
                    value={testForm.newValue}
                    onChange={(e) => setTestForm({ ...testForm, newValue: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold text-[#05828e]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan / Alasan Perubahan</label>
                <input
                  type="text"
                  value={testForm.alasan}
                  onChange={(e) => setTestForm({ ...testForm, alasan: e.target.value })}
                  placeholder="Contoh: Konfirmasi mutasi transfer BCA 888"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleTriggerTestEvent}
                className="bg-[#05828e] hover:bg-[#046c76] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Kirim Event Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
