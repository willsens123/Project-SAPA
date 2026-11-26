import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Search,
  EyeOff,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  X,
  Clock,
  History,
  Check,
  ChevronDown,
  Filter,
  Calendar,
  Tag,
  ArrowUpRight,
  Download,
  Copy,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  User,
  ArrowDownUp,
  FileSpreadsheet,
  AlertTriangle,
  ShieldAlert,
  Eye,
  PanelRightOpen,
  MessageCircle,
} from 'lucide-react';
import { DonasiOrder } from '../donasiData';
import { IdentitasItem } from '../identitasData';
import { SalurOrder } from '../salurData';
import {
  IdentitasChangeLog,
  SuspiciousAuditFlag,
  CentralAuditLogEntry,
  KaryawanItem,
  ListPMItem,
  DharmaPatronRutinItem,
  WhatsappDispatchLog,
} from '../types';
import { resolveLastContactedForIdentitas } from '../utils/lastContactedHelper';
import { IdentitasAuditDetailModal, UnifiedAuditLogItem } from './IdentitasAuditDetailModal';
import { ModalKirimWhatsappOtomatis } from './ModalKirimWhatsappOtomatis';
import { ModalRiwayatKontakCustomer } from './ModalRiwayatKontakCustomer';
import { downloadAuditCsv, formatCsvDateTag } from '../utils/auditCsvExport';

interface EditFieldRow {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  newValue: string;
}

interface EditIdentitasViewProps {
  item: IdentitasItem;
  allIdentitasList: IdentitasItem[];
  changeLogs: IdentitasChangeLog[];
  centralAuditLogs?: CentralAuditLogEntry[];
  currentUser?: KaryawanItem | null;
  suspiciousFlags?: SuspiciousAuditFlag[];
  listPMList?: ListPMItem[];
  donasiOrders?: DonasiOrder[];
  salurOrders?: SalurOrder[];
  dharmaPatronList?: DharmaPatronRutinItem[];
  currentActorName?: string;
  onContactDispatchCompleted?: (payload: {
    logEntry: WhatsappDispatchLog;
    listPMItem: ListPMItem | null;
    identitasId?: string;
    codeId?: string;
  }) => void;
  onBack: () => void;
  onSave: (updatedItem: IdentitasItem, newLogs: IdentitasChangeLog[]) => void;
  onShowToast: (msg: string) => void;
  onOpenAddModal?: () => void;
  onNavigateToCentralAudit?: () => void;
}

const AVAILABLE_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'namaLengkap', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap baru...' },
  { key: 'namaPanggilan', label: 'Nama Panggilan', placeholder: 'Masukkan nama panggilan baru...' },
  { key: 'jenisPanggilan', label: 'Jenis Panggilan', placeholder: 'Contoh: Ko, Ci, Bhante...' },
  { key: 'nomorHandPhone', label: 'Nomor HandPhone', placeholder: 'Contoh: +6281234567890' },
  { key: 'email', label: 'Email', placeholder: 'Contoh: nama@domain.com' },
  { key: 'organisasi', label: 'Organisasi', placeholder: 'Contoh: YPPLN, MAH...' },
  { key: 'status', label: 'Status (VIP/Blacklist/-)', placeholder: 'VIP, Blacklist, atau -' },
  { key: 'custDuration', label: 'Cust Duration', placeholder: 'Contoh: 3 Bulan, 1 Bulan, -' },
  { key: 'bhanteLay', label: 'Bhante / Lay?', placeholder: 'Bhante atau Lay' },
  { key: 'kota', label: 'Tempat Tinggal / Kota', placeholder: 'Contoh: Bandung, Jawa Barat' },
  { key: 'pekerjaan', label: 'Pekerjaan', placeholder: 'Contoh: Wiraswasta, Dokter...' },
  { key: 'triyana', label: 'Triyana', placeholder: 'Contoh: Theravada, Mahayana...' },
  { key: 'agama', label: 'Agama', placeholder: 'Contoh: Buddha, Hindu, Kristen...' },
  { key: 'pic', label: 'PIC', placeholder: 'Masukkan nama PIC...' },
  { key: 'keterangan', label: 'Keterangan Tambahan', placeholder: 'Catatan tambahan...' },
];

/**
 * Parses diverse timestamp strings (Indonesian locale or ISO) into millisecond timestamps for sorting
 */
function parseLogTimestamp(ts?: string): number {
  if (!ts) return 0;
  const parsed = Date.parse(ts);
  if (!isNaN(parsed)) return parsed;

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

  const parts = ts.toLowerCase().match(/(\d{1,2})\s+([a-z]{3,4})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
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

export const EditIdentitasView: React.FC<EditIdentitasViewProps> = ({
  item,
  allIdentitasList,
  changeLogs,
  centralAuditLogs = [],
  currentUser = null,
  listPMList = [],
  donasiOrders = [],
  salurOrders = [],
  dharmaPatronList = [],
  currentActorName = 'Admin Identitas',
  onContactDispatchCompleted,
  onBack,
  onSave,
  onShowToast,
  onOpenAddModal,
  onNavigateToCentralAudit,
  suspiciousFlags = [],
}) => {
  // Current selected identity (can switch between identities if needed)
  const [selectedIdentity, setSelectedIdentity] = useState<IdentitasItem>(item);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [isContactHistoryOpen, setIsContactHistoryOpen] = useState(false);

  // Sync if item prop updates externally
  React.useEffect(() => {
    setSelectedIdentity(item);
  }, [item]);

  const liveSelectedIdentity = useMemo(() => {
    return allIdentitasList.find((id) => id.id === selectedIdentity.id) || selectedIdentity;
  }, [allIdentitasList, selectedIdentity]);

  const liveContactSummary = useMemo(() => {
    return resolveLastContactedForIdentitas(liveSelectedIdentity, {
      listPMList,
      donasiOrders,
      salurOrders,
      dharmaPatronList,
    });
  }, [liveSelectedIdentity, listPMList, donasiOrders, salurOrders, dharmaPatronList]);

  // Detailed Audit Panel / Modal state
  const [auditModalState, setAuditModalState] = useState<{
    isOpen: boolean;
    selectedLogId: string | null;
  }>({
    isOpen: false,
    selectedLogId: null,
  });

  // Filter suspicious flags for this identity
  const relevantSuspiciousFlags = useMemo(() => {
    if (!suspiciousFlags || suspiciousFlags.length === 0) return [];
    return suspiciousFlags.filter((f) => {
      const matchId =
        f.recordId === selectedIdentity.codeId ||
        f.recordId === selectedIdentity.id ||
        (selectedIdentity.namaLengkap &&
          f.recordTitle.toLowerCase().includes(selectedIdentity.namaLengkap.toLowerCase()));
      return matchId && f.status === 'ACTIVE';
    });
  }, [suspiciousFlags, selectedIdentity]);

  // Field edit rows matching Image 1
  const [fieldRows, setFieldRows] = useState<EditFieldRow[]>([
    {
      id: 'row-1',
      fieldKey: 'nomorHandPhone',
      fieldLabel: 'Nomor HandPhone',
      newValue: item.nomorHandPhone || '',
    },
  ]);

  // Alasan Ubah/Hapus
  const [alasan, setAlasan] = useState('');

  // Dropdown open states for field search
  const [openDropdownRowId, setOpenDropdownRowId] = useState<string | null>(null);
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');

  // Audit Log UI View Mode: 'timeline' (visual chronological flow) vs 'table' (structured grid)
  const [auditViewMode, setAuditViewMode] = useState<'timeline' | 'table'>('timeline');

  // Chronological order: 'desc' (Newest first) vs 'asc' (Oldest first)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Table & Timeline filter options
  const [historyFilter, setHistoryFilter] = useState<'current' | 'all'>('current');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('ALL');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('ALL');

  // Add another field row
  const handleAddFieldRow = () => {
    const unusedField =
      AVAILABLE_FIELDS.find((f) => !fieldRows.some((r) => r.fieldKey === f.key)) ||
      AVAILABLE_FIELDS[0];

    const currentVal = (selectedIdentity as Record<string, unknown>)[unusedField.key];
    const initialVal = typeof currentVal === 'string' ? currentVal : '';

    setFieldRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random()}`,
        fieldKey: unusedField.key,
        fieldLabel: unusedField.label,
        newValue: initialVal,
      },
    ]);
  };

  // Remove a field row
  const handleRemoveFieldRow = (rowId: string) => {
    if (fieldRows.length === 1) {
      setFieldRows([{ ...fieldRows[0], newValue: '' }]);
      return;
    }
    setFieldRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  // Select field key for a row
  const handleSelectField = (rowId: string, field: { key: string; label: string }) => {
    const currentVal = (selectedIdentity as Record<string, unknown>)[field.key];
    const initialVal = typeof currentVal === 'string' ? currentVal : '';

    setFieldRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              fieldKey: field.key,
              fieldLabel: field.label,
              newValue: initialVal,
            }
          : r
      )
    );
    setOpenDropdownRowId(null);
    setFieldSearchQuery('');
  };

  // Handle Save changes
  const handleSave = () => {
    if (!alasan.trim()) {
      onShowToast('Mohon isi Alasan Hapus/Ubah sebelum menyimpan');
      return;
    }

    const updatedItem = { ...selectedIdentity };
    const newLogs: IdentitasChangeLog[] = [];
    const now = new Date();
    const timestampFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const actorName =
      currentUser?.namaLengkap || currentUser?.namaPanggilan || 'Admin Identitas';

    fieldRows.forEach((row) => {
      const oldVal = String((selectedIdentity as unknown as Record<string, unknown>)[row.fieldKey] || '-');
      const newVal = row.newValue.trim();

      if (oldVal !== newVal) {
        // Update item property
        (updatedItem as unknown as Record<string, unknown>)[row.fieldKey] = newVal;

        // Create audit log
        newLogs.push({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          identitasId: selectedIdentity.id,
          codeId: selectedIdentity.codeId || '',
          namaLengkap: selectedIdentity.namaLengkap,
          timestamp: timestampFormatted,
          isoTimestamp: now.toISOString(),
          field: row.fieldLabel,
          oldValue: oldVal,
          newValue: newVal || '(Dikosongkan)',
          alasan: alasan.trim(),
          author: actorName,
          actionType: 'Ubah',
        });
      }
    });

    if (newLogs.length === 0) {
      onShowToast('Tidak ada perubahan data yang terdeteksi');
      return;
    }

    onSave(updatedItem, newLogs);
    setSelectedIdentity(updatedItem);
    setAlasan('');
    onShowToast(`${newLogs.length} perubahan data berhasil disimpan dan dicatat ke riwayat audit`);
  };

  // Restore old value from Audit Detail Modal directly into the edit form
  const handleRestoreFieldValue = (
    fieldLabel: string,
    fieldKey: string | null,
    restoreValue: string,
    sourceLog: UnifiedAuditLogItem
  ) => {
    const matchedField =
      (fieldKey && AVAILABLE_FIELDS.find((f) => f.key === fieldKey)) ||
      AVAILABLE_FIELDS.find((f) => f.label.toLowerCase() === fieldLabel.toLowerCase());

    if (!matchedField) {
      onShowToast(`Field "${fieldLabel}" tidak tersedia di form cepat ini`);
      return;
    }

    setFieldRows((prev) => {
      const existing = prev.find((r) => r.fieldKey === matchedField.key);
      if (existing) {
        return prev.map((r) =>
          r.fieldKey === matchedField.key ? { ...r, newValue: restoreValue } : r
        );
      }
      return [
        ...prev,
        {
          id: `row-restore-${Date.now()}`,
          fieldKey: matchedField.key,
          fieldLabel: matchedField.label,
          newValue: restoreValue,
        },
      ];
    });

    setAlasan(
      `Pemulihan nilai "${matchedField.label}" dari riwayat audit (${sourceLog.timestamp})`
    );
    setAuditModalState({ isOpen: false, selectedLogId: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onShowToast(
      `Nilai lama "${restoreValue}" untuk ${matchedField.label} dimasukkan ke form. Klik Simpan Perubahan untuk menerapkan.`
    );
  };

  // Filter and sort change logs chronologically
  const relevantLogs = useMemo(() => {
    const filtered = changeLogs.filter((log) => {
      if (historyFilter === 'current' && log.identitasId !== selectedIdentity.id) {
        return false;
      }
      if (selectedActionFilter !== 'ALL' && log.actionType !== selectedActionFilter) {
        return false;
      }
      if (selectedFieldFilter !== 'ALL' && log.field !== selectedFieldFilter) {
        return false;
      }
      if (!tableSearchQuery.trim()) return true;
      const q = tableSearchQuery.toLowerCase();
      return (
        log.namaLengkap.toLowerCase().includes(q) ||
        log.codeId.toLowerCase().includes(q) ||
        log.field.toLowerCase().includes(q) ||
        log.oldValue.toLowerCase().includes(q) ||
        log.newValue.toLowerCase().includes(q) ||
        log.alasan.toLowerCase().includes(q)
      );
    });

    // Chronological sorting
    return filtered.sort((a, b) => {
      const timeA = parseLogTimestamp(a.timestamp);
      const timeB = parseLogTimestamp(b.timestamp);
      if (timeA !== 0 && timeB !== 0) {
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      // Fallback by ID string comparison
      return sortOrder === 'desc'
        ? b.id.localeCompare(a.id)
        : a.id.localeCompare(b.id);
    });
  }, [
    changeLogs,
    historyFilter,
    selectedIdentity.id,
    selectedActionFilter,
    selectedFieldFilter,
    tableSearchQuery,
    sortOrder,
  ]);

  // Unique list of fields present in current user's logs for quick chips
  const availableLogFields = useMemo(() => {
    const base = historyFilter === 'current'
      ? changeLogs.filter((l) => l.identitasId === selectedIdentity.id)
      : changeLogs;
    const set = new Set<string>();
    base.forEach((l) => {
      if (l.field) set.add(l.field);
    });
    return Array.from(set);
  }, [changeLogs, historyFilter, selectedIdentity.id]);

  // Summary statistics for audit KPI cards
  const auditStats = useMemo(() => {
    const userLogs = changeLogs.filter((l) => l.identitasId === selectedIdentity.id);
    const fieldCounts: Record<string, number> = {};
    userLogs.forEach((l) => {
      fieldCounts[l.field] = (fieldCounts[l.field] || 0) + 1;
    });

    let topField = '-';
    let topCount = 0;
    Object.entries(fieldCounts).forEach(([field, count]) => {
      if (count > topCount) {
        topCount = count;
        topField = field;
      }
    });

    const lastChange = userLogs[0]?.timestamp || '-';

    return {
      totalChanges: userLogs.length,
      topField: topCount > 0 ? `${topField} (${topCount}x)` : '-',
      lastChange,
    };
  }, [changeLogs, selectedIdentity.id]);

  // Copy log detail to clipboard
  const handleCopyLog = (log: IdentitasChangeLog) => {
    const text = `[AUDIT LOG] ${log.timestamp} | ${log.codeId} ${log.namaLengkap} | Field: ${log.field} | Lama: "${log.oldValue}" -> Baru: "${log.newValue}" | Alasan: ${log.alasan}`;
    navigator.clipboard.writeText(text);
    onShowToast('Detail log berhasil disalin ke clipboard');
  };

  // Export audit logs of current view as CSV (with UTF-8 BOM & full metadata for offline Excel reporting)
  const handleExportCsv = () => {
    if (relevantLogs.length === 0) {
      onShowToast('Tidak ada data log untuk diekspor');
      return;
    }

    const headers = [
      'No',
      'ID Log',
      'Waktu Perubahan',
      'ISO Timestamp',
      'Kode Identitas',
      'Nama Lengkap',
      'Aksi',
      'Field Diubah',
      'Nilai Sebelumnya',
      'Nilai Baru',
      'Diubah Oleh',
      'Alasan Perubahan',
    ];

    const rows = relevantLogs.map((l, idx) => [
      idx + 1,
      l.id,
      l.timestamp,
      l.isoTimestamp || '',
      l.codeId || '',
      l.namaLengkap || '',
      l.actionType,
      l.field,
      l.oldValue || '-',
      l.newValue || '-',
      l.author || 'Admin Identitas',
      l.alasan || '-',
    ]);

    const scopeSlug = historyFilter === 'all' ? 'Semua_Profil' : (selectedIdentity.codeId || 'Profil');
    downloadAuditCsv({
      filename: `Audit_Log_${scopeSlug}_${formatCsvDateTag()}.csv`,
      headers,
      rows,
    });
    onShowToast(`${relevantLogs.length} catatan audit log berhasil diunduh (CSV)`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Kembali ke Tabel Identitas"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Profil Identitas & Audit Trail
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
              <span>{selectedIdentity.namaLengkap}</span>
              <span className="font-mono tabular-nums text-xs font-semibold text-slate-400 dark:text-slate-500">
                #{selectedIdentity.codeId || 'ID'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {selectedIdentity.bhanteLay || 'Lay'}
              </span>
              {selectedIdentity.status && selectedIdentity.status !== '-' && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                    {selectedIdentity.status}
                  </span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={() => setIsContactHistoryOpen(true)}
                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#05828e] transition-colors cursor-pointer tabular-nums"
                title="Lihat timeline kontak lintas modul"
              >
                Last Contacted:{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-100">
                  {liveContactSummary.displayDate}
                </strong>
                {liveContactSummary.hasContactHistory && (
                  <span className="text-slate-500 dark:text-slate-400">
                    {' '}
                    ({liveContactSummary.relativeLabel || liveContactSummary.channelLabel})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Tools Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsWaModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Kirim WhatsApp langsung ke customer ini"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Kirim WA</span>
          </button>

          <button
            type="button"
            onClick={() => setAuditModalState({ isOpen: true, selectedLogId: null })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/50 hover:bg-teal-100/70 dark:hover:bg-teal-900/60 text-[#05828e] dark:text-[#2dd4bf] text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Buka Panel Inspeksi Riwayat Perubahan Detail"
          >
            <PanelRightOpen className="w-3.5 h-3.5" />
            <span>Panel Detail Audit ({auditStats.totalChanges})</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:text-[#05828e] dark:hover:text-[#2dd4bf] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Unduh log audit saat ini ke file CSV untuk dokumentasi offline"
          >
            <Download className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
            <span>Unduh CSV ({relevantLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('search-history-input');
              if (el) el.focus();
            }}
            title="Cari Riwayat"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={() =>
              setHistoryFilter((prev) => (prev === 'current' ? 'all' : 'current'))
            }
            title={
              historyFilter === 'current'
                ? 'Tampilkan semua riwayat orang lain juga'
                : 'Hanya riwayat orang ini'
            }
            className={`p-1.5 transition-colors cursor-pointer ${
              historyFilter === 'all'
                ? 'text-[#05828e] dark:text-[#2dd4bf]'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {onNavigateToCentralAudit && (
            <button
              type="button"
              onClick={onNavigateToCentralAudit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Buka Audit Log Pusat (S-SALUR, Donasi, Ajar, Identitas)"
            >
              <History className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
              <span className="hidden sm:inline">Audit Log Pusat</span>
            </button>
          )}

          <button
            id="btn-edit-identitas-add"
            type="button"
            onClick={onOpenAddModal || handleAddFieldRow}
            className="bg-[#05828e] text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#046c76] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Field</span>
          </button>
        </div>
      </div>

      {/* Suspicious Anomaly Alert Banner (Flags > 3 changes to same field in a month) */}
      {relevantSuspiciousFlags.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Peringatan Deteksi Anomali
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="font-semibold text-rose-700 dark:text-rose-400">
                  {relevantSuspiciousFlags[0].changeCount}x Perubahan dalam sebulan
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Field:{' '}
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {relevantSuspiciousFlags[0].field}
                  </strong>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {relevantSuspiciousFlags[0].reason}
              </p>
            </div>
          </div>
          {onNavigateToCentralAudit && (
            <button
              type="button"
              onClick={onNavigateToCentralAudit}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 self-start md:self-center"
            >
              <span>Buka di Audit Log Pusat</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      )}

      {/* Main Edit Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 sm:p-8">
        <div className="space-y-6 max-w-4xl">
          {/* Row 1: Field yang ingin diubah */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Field yang ingin diubah
            </label>

            {fieldRows.map((row, idx) => {
              const isDropdownOpen = openDropdownRowId === row.id;

              return (
                <div
                  key={row.id}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3"
                >
                  {/* Dropdown Selector */}
                  <div className="relative min-w-[220px] sm:w-[240px]">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdownRowId(isDropdownOpen ? null : row.id)
                      }
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 hover:border-[#05828e] focus:outline-none focus:ring-2 focus:ring-[#05828e]/20 transition-all text-left cursor-pointer"
                    >
                      <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {row.fieldLabel || 'Search...'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#05828e] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50 animate-in fade-in duration-100">
                        <div className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                          <input
                            type="text"
                            placeholder="Cari field..."
                            value={fieldSearchQuery}
                            onChange={(e) => setFieldSearchQuery(e.target.value)}
                            className="w-full text-xs px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#05828e]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/60">
                          {AVAILABLE_FIELDS.filter((f) =>
                            f.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                          ).map((field) => (
                            <button
                              key={field.key}
                              type="button"
                              onClick={() => handleSelectField(row.id, field)}
                              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                row.fieldKey === field.key
                                  ? 'bg-[#05828e]/10 dark:bg-teal-950/60 text-[#05828e] dark:text-[#2dd4bf] font-semibold'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              <span>{field.label}</span>
                              {row.fieldKey === field.key && (
                                <Check className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <div className="w-7 h-7 rounded-full bg-[#05828e] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>

                  {/* Input Text */}
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={row.newValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFieldRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, newValue: val } : r))
                        );
                      }}
                      placeholder="Input Text..."
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#05828e] focus:ring-2 focus:ring-[#05828e]/20 transition-all"
                    />
                  </div>

                  {/* Clear / Delete row button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFieldRow(row.id)}
                    title="Hapus baris ini"
                    className="w-7 h-7 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Plus button */}
                  {idx === fieldRows.length - 1 && (
                    <button
                      type="button"
                      onClick={handleAddFieldRow}
                      title="Tambah field yang ingin diubah"
                      className="w-7 h-7 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Row 2: Alasan Hapus/Ubah */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Alasan Hapus/Ubah
            </label>
            <input
              type="text"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Perubahan nomor WhatsApp aktif donatur / update alamat domisili..."
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#05828e] focus:ring-2 focus:ring-[#05828e]/20 transition-all"
            />
          </div>

          {/* Row 3: Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-8 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: Visualisasi Riwayat Perubahan (Audit Log) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 space-y-5">
        {/* Header Audit Log */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#05828e] to-teal-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                  Visualisasi Riwayat Perubahan (Audit Log)
                </h2>
                <span className="text-xs font-mono tabular-nums text-[#05828e] dark:text-[#2dd4bf] font-semibold">
                  · {relevantLogs.length} Entri
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Klik entri mana saja untuk membuka panel inspeksi detail nilai sebelum & sesudah, aktor perubahan, hingga pemulihan nilai.
              </p>
            </div>
          </div>

          {/* View Mode & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Open Detailed Inspector Modal */}
            <button
              type="button"
              onClick={() =>
                setAuditModalState({
                  isOpen: true,
                  selectedLogId: relevantLogs[0]?.id || null,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span>Buka Panel Detail</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setAuditViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  auditViewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-[#05828e] dark:text-[#2dd4bf] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Alur Visual (Timeline)</span>
              </button>
              <button
                type="button"
                onClick={() => setAuditViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  auditViewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-[#05828e] dark:text-[#2dd4bf] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tabel Rinci</span>
              </button>
            </div>

            {/* Sort Chronological Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              title={`Urutan: ${sortOrder === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === 'desc' ? 'Terbaru Dulu' : 'Terlama Dulu'}</span>
            </button>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              title="Unduh log audit yang sedang tampil dalam format CSV"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:text-[#05828e] dark:hover:text-[#2dd4bf] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
              <span>Unduh CSV ({relevantLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Audit Metrics / KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Perubahan Profil Ini
              </div>
              <div className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100 mt-0.5">
                {auditStats.totalChanges} kali
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-[#2dd4bf] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Field Paling Sering Diubah
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate max-w-[180px]">
                {auditStats.topField}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Terakhir Dimodifikasi
              </div>
              <div className="text-xs font-semibold font-mono tabular-nums text-slate-700 dark:text-slate-300 mt-0.5 truncate max-w-[190px]">
                {auditStats.lastChange}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search & Quick Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              id="search-history-input"
              type="text"
              placeholder="Cari field, nilai lama/baru, alasan perubahan..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#05828e] transition-all"
            />
            {tableSearchQuery && (
              <button
                type="button"
                onClick={() => setTableSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope & Action Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setHistoryFilter('current')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'current'
                    ? 'bg-white dark:bg-slate-900 text-[#05828e] dark:text-[#2dd4bf] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Profil Ini ({changeLogs.filter((l) => l.identitasId === selectedIdentity.id).length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-[#05828e] dark:text-[#2dd4bf] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Semua Profil ({changeLogs.length})
              </button>
            </div>

            {/* Action Type Dropdown */}
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-[#05828e] cursor-pointer"
            >
              <option value="ALL">Semua Aksi</option>
              <option value="Ubah">Aksi: Ubah</option>
              <option value="Merge">Aksi: Merge</option>
              <option value="Hapus">Aksi: Hapus</option>
            </select>
          </div>
        </div>

        {/* Quick Field Filter Buttons */}
        {availableLogFields.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase mr-1 whitespace-nowrap">
              Filter Field:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFieldFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedFieldFilter === 'ALL'
                  ? 'bg-[#05828e] text-white font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Semua Field
            </button>
            {availableLogFields.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFieldFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedFieldFilter === f
                    ? 'bg-[#05828e] text-white font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* VIEW 1: Visual Timeline Mode (Alur Waktu Kronologis) */}
        {auditViewMode === 'timeline' && (
          <div className="pt-2">
            {relevantLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-8">
                <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <div className="font-semibold text-slate-600 dark:text-slate-300">
                  Belum ada riwayat perubahan yang sesuai
                </div>
                <p className="text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                  Setiap kali admin mengubah data profil donatur atau relawan melalui formulir di atas dan menekan tombol Simpan, detail perubahan akan tampil di sini secara kronologis.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-linear-to-b before:from-teal-300 dark:before:from-teal-700 before:via-slate-200 dark:before:via-slate-700 before:to-slate-100 dark:before:to-slate-800">
                {relevantLogs.map((log) => {
                  const isMerge = log.actionType === 'Merge';
                  const isHapus = log.actionType === 'Hapus';

                  return (
                    <div
                      key={log.id}
                      className="relative group transition-all"
                    >
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-xs transition-transform group-hover:scale-110 ${
                          isMerge
                            ? 'bg-amber-500 text-white'
                            : isHapus
                            ? 'bg-rose-500 text-white'
                            : 'bg-[#05828e] text-white'
                        }`}
                      >
                        {isMerge ? (
                          <Layers className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        ) : isHapus ? (
                          <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        ) : (
                          <GitCommit className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        )}
                      </div>

                      {/* Timeline Card */}
                      <div className="bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-teal-300 dark:hover:border-teal-700">
                        {/* Top Bar of the Entry */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/70">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={`font-bold uppercase tracking-wider ${
                                isMerge
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : isHapus
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-[#05828e] dark:text-[#2dd4bf]'
                              }`}
                            >
                              {log.actionType} Data
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                              {log.field}
                            </span>
                            {log.author && (
                              <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span className="text-slate-500 dark:text-slate-400">
                                  Oleh: {log.author}
                                </span>
                              </>
                            )}
                            {historyFilter === 'all' && (
                              <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                                  {log.codeId} · {log.namaLengkap}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span>{log.timestamp}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setAuditModalState({ isOpen: true, selectedLogId: log.id })
                              }
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#05828e] dark:hover:border-[#2dd4bf] text-[11px] font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Detail</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyLog(log)}
                              title="Salin detail log"
                              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Diff Box: Nilai Lama vs Nilai Baru */}
                        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {/* Old Value */}
                          <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 rounded-xl p-3">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                              <span>Sebelumnya</span>
                              <span className="text-[10px] text-rose-500 dark:text-rose-400/80 font-normal">
                                Nilai Lama
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-mono tabular-nums break-all line-through decoration-rose-400/80">
                              {log.oldValue || '-'}
                            </div>
                          </div>

                          {/* New Value */}
                          <div className="bg-teal-50/70 dark:bg-teal-950/35 border border-teal-200/90 dark:border-teal-800/70 rounded-xl p-3">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#05828e] dark:text-[#2dd4bf] uppercase tracking-wider mb-1">
                              <span>Menjadi</span>
                              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal">
                                Nilai Baru
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-teal-950 dark:text-teal-100 font-mono tabular-nums font-semibold break-all">
                              {log.newValue}
                            </div>
                          </div>
                        </div>

                        {/* Alasan Perubahan Callout */}
                        {log.alasan && (
                          <div className="mt-3 flex items-start gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 text-xs">
                            <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                              Alasan Admin:
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 italic">
                              &quot;{log.alasan}&quot;
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

        {/* VIEW 2: Structured Table Mode */}
        {auditViewMode === 'table' && (
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/60">
                  <th className="py-3 px-4 w-[190px]">Waktu Perubahan</th>
                  <th className="py-3 px-4">Identitas</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Field</th>
                  <th className="py-3 px-4">Nilai Sebelumnya</th>
                  <th className="py-3 px-4">Nilai Baru</th>
                  <th className="py-3 px-4">Alasan Modifikasi</th>
                  <th className="py-3 px-2 w-24 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-[13px] text-slate-700 dark:text-slate-300">
                {relevantLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() =>
                      setAuditModalState({ isOpen: true, selectedLogId: log.id })
                    }
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#05828e] dark:text-[#2dd4bf] font-mono tabular-nums">
                          {log.codeId || '-'}
                        </span>
                        <span>{log.namaLengkap}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          log.actionType === 'Merge'
                            ? 'text-amber-700 dark:text-amber-400'
                            : log.actionType === 'Hapus'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-[#05828e] dark:text-[#2dd4bf]'
                        }`}
                      >
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {log.field}
                    </td>
                    <td
                      className="py-3 px-4 text-rose-600 dark:text-rose-400 font-mono tabular-nums text-xs line-through max-w-[180px] truncate"
                      title={log.oldValue}
                    >
                      {log.oldValue || '-'}
                    </td>
                    <td
                      className="py-3 px-4 text-[#05828e] dark:text-[#2dd4bf] font-mono tabular-nums text-xs font-semibold max-w-[180px] truncate"
                      title={log.newValue}
                    >
                      {log.newValue}
                    </td>
                    <td
                      className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[220px] truncate"
                      title={log.alasan}
                    >
                      {log.alasan || '-'}
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setAuditModalState({ isOpen: true, selectedLogId: log.id })
                          }
                          title="Buka panel detail audit"
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] dark:hover:border-[#2dd4bf] text-[11px] font-semibold text-[#05828e] dark:text-[#2dd4bf] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLog(log)}
                          title="Salin detail log"
                          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {relevantLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                      Belum ada riwayat perubahan yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Audit Log Drawer / Modal */}
      <IdentitasAuditDetailModal
        isOpen={auditModalState.isOpen}
        onClose={() => setAuditModalState({ isOpen: false, selectedLogId: null })}
        identity={selectedIdentity}
        changeLogs={changeLogs}
        centralAuditLogs={centralAuditLogs}
        suspiciousFlags={suspiciousFlags}
        initialSelectedLogId={auditModalState.selectedLogId}
        onShowToast={onShowToast}
        onRestoreFieldValue={handleRestoreFieldValue}
      />

      {/* Modal Riwayat Kontak Cross-Module */}
      <ModalRiwayatKontakCustomer
        isOpen={isContactHistoryOpen}
        onClose={() => setIsContactHistoryOpen(false)}
        customerName={liveSelectedIdentity.namaLengkap}
        customerPanggilan={liveSelectedIdentity.namaPanggilan}
        customerCode={liveSelectedIdentity.codeId}
        phone={liveSelectedIdentity.nomorHandPhone}
        avatarInitial={liveSelectedIdentity.avatarInitial}
        avatarBg={liveSelectedIdentity.avatarBg}
        summary={liveContactSummary}
        onSendWhatsappNow={() => setIsWaModalOpen(true)}
      />

      {/* Modal Kirim WhatsApp Customer */}
      <ModalKirimWhatsappOtomatis
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        kind="customer_direct"
        identitasItem={liveSelectedIdentity}
        identitasList={allIdentitasList}
        currentActorName={currentActorName}
        onDispatchCompleted={(payload) => {
          onContactDispatchCompleted?.({
            logEntry: payload.logEntry,
            listPMItem: payload.listPMItem,
            identitasId: payload.identitasId || liveSelectedIdentity.id,
            codeId: payload.codeId || liveSelectedIdentity.codeId,
          });
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
