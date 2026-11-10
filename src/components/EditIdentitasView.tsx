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
} from 'lucide-react';
import { IdentitasItem } from '../identitasData';
import { IdentitasChangeLog } from '../types';

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
  onBack,
  onSave,
  onShowToast,
  onOpenAddModal,
  onNavigateToCentralAudit,
}) => {
  // Current selected identity (can switch between identities if needed)
  const [selectedIdentity, setSelectedIdentity] = useState<IdentitasItem>(item);

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

    fieldRows.forEach((row) => {
      const oldVal = String((selectedIdentity as Record<string, unknown>)[row.fieldKey] || '-');
      const newVal = row.newValue.trim();

      if (oldVal !== newVal) {
        // Update item property
        (updatedItem as Record<string, unknown>)[row.fieldKey] = newVal;

        // Create audit log
        newLogs.push({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          identitasId: selectedIdentity.id,
          codeId: selectedIdentity.codeId || '',
          namaLengkap: selectedIdentity.namaLengkap,
          timestamp: timestampFormatted,
          field: row.fieldLabel,
          oldValue: oldVal,
          newValue: newVal || '(Dikosongkan)',
          alasan: alasan.trim(),
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

  // Export audit logs of current view as CSV
  const handleExportCsv = () => {
    if (relevantLogs.length === 0) {
      onShowToast('Tidak ada data log untuk diekspor');
      return;
    }

    const headers = [
      'ID Log',
      'Timestamp',
      'Kode Identitas',
      'Nama Lengkap',
      'Aksi',
      'Field Diubah',
      'Nilai Sebelumnya',
      'Nilai Baru',
      'Alasan Perubahan',
    ];

    const rows = relevantLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.codeId || ''}"`,
      `"${(l.namaLengkap || '').replace(/"/g, '""')}"`,
      `"${l.actionType}"`,
      `"${l.field}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      `"${(l.alasan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Audit_Log_${selectedIdentity.codeId || 'Profile'}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Audit Log CSV berhasil diunduh');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Kembali ke Tabel Identitas"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-slate-400 font-medium">Mengedit Identitas & Audit Trail</div>
            <div className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="font-mono text-[#05828e] bg-teal-50 px-2 py-0.5 rounded text-xs font-semibold border border-teal-200">
                {selectedIdentity.codeId || 'ID'}
              </span>
              <span>{selectedIdentity.namaLengkap}</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {selectedIdentity.bhanteLay || 'Lay'}
              </span>
              {selectedIdentity.status && selectedIdentity.status !== '-' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {selectedIdentity.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Tools Group */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onShowToast('Audit trail aktif')}
            title="Audit trail aktif"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('search-history-input');
              if (el) el.focus();
            }}
            title="Cari Riwayat"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 cursor-pointer"
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
                ? 'text-[#05828e]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {onNavigateToCentralAudit && (
            <button
              type="button"
              onClick={onNavigateToCentralAudit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Buka Audit Log Pusat (S-SALUR, Donasi, Ajar, Identitas)"
            >
              <History className="w-3.5 h-3.5 text-[#05828e]" />
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

      {/* Main Edit Form Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 sm:p-8">
        <div className="space-y-6 max-w-4xl">
          {/* Row 1: Field yang ingin diubah */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
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
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-[#05828e] focus:outline-none focus:ring-2 focus:ring-[#05828e]/20 transition-all text-left"
                    >
                      <span className="truncate font-medium text-slate-700">
                        {row.fieldLabel || 'Search...'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#05828e] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in duration-100">
                        <div className="px-2 py-1 mb-1 border-b border-slate-100">
                          <input
                            type="text"
                            placeholder="Cari field..."
                            value={fieldSearchQuery}
                            onChange={(e) => setFieldSearchQuery(e.target.value)}
                            className="w-full text-xs px-2 py-1 bg-slate-50 rounded border border-slate-200 focus:outline-none focus:border-[#05828e]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                          {AVAILABLE_FIELDS.filter((f) =>
                            f.label.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                          ).map((field) => (
                            <button
                              key={field.key}
                              type="button"
                              onClick={() => handleSelectField(row.id, field)}
                              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                                row.fieldKey === field.key
                                  ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{field.label}</span>
                              {row.fieldKey === field.key && (
                                <Check className="w-3.5 h-3.5 text-[#05828e]" />
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
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-2 focus:ring-[#05828e]/20 transition-all"
                    />
                  </div>

                  {/* Clear / Delete row button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFieldRow(row.id)}
                    title="Hapus baris ini"
                    className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
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
            <label className="block text-sm font-semibold text-slate-700">
              Alasan Hapus/Ubah
            </label>
            <input
              type="text"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Perubahan nomor WhatsApp aktif donatur / update alamat domisili..."
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-2 focus:ring-[#05828e]/20 transition-all"
            />
          </div>

          {/* Row 3: Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
        {/* Header Audit Log */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#05828e] to-teal-700 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Visualisasi Riwayat Perubahan (Audit Log)
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#05828e] border border-teal-200">
                  {relevantLogs.length} Entri
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail kronologis mencatat riwayat perubahan data profil, nilai sebelum & sesudah, serta alasan perubahan admin.
              </p>
            </div>
          </div>

          {/* View Mode & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setAuditViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  auditViewMode === 'timeline'
                    ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
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
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === 'desc' ? 'Terbaru Dulu' : 'Terlama Dulu'}</span>
            </button>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              title="Unduh Audit Log dalam format CSV"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:text-[#05828e] text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#05828e]" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Audit Metrics / KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Perubahan Profil Ini
              </div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">
                {auditStats.totalChanges} kali
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#05828e] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Field Paling Sering Diubah
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5 truncate max-w-[180px]">
                {auditStats.topField}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Terakhir Dimodifikasi
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate max-w-[190px]">
                {auditStats.lastChange}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search & Quick Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-history-input"
              type="text"
              placeholder="Cari field, nilai lama/baru, alasan perubahan..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-[#05828e] transition-all"
            />
            {tableSearchQuery && (
              <button
                type="button"
                onClick={() => setTableSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope & Action Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setHistoryFilter('current')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'current'
                    ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profil Ini ({changeLogs.filter((l) => l.identitasId === selectedIdentity.id).length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'all'
                    ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Profil ({changeLogs.length})
              </button>
            </div>

            {/* Action Type Dropdown */}
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-700 outline-none focus:border-[#05828e] cursor-pointer"
            >
              <option value="ALL">Semua Aksi</option>
              <option value="Ubah">Aksi: Ubah</option>
              <option value="Merge">Aksi: Merge</option>
              <option value="Hapus">Aksi: Hapus</option>
            </select>
          </div>
        </div>

        {/* Quick Field Filter Pills */}
        {availableLogFields.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1 whitespace-nowrap">
              Filter Field:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFieldFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedFieldFilter === 'ALL'
                  ? 'bg-[#05828e] text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              <div className="py-12 text-center text-slate-400 text-xs sm:text-sm bg-slate-50/60 rounded-xl border border-dashed border-slate-200 p-8">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="font-semibold text-slate-600">Belum ada riwayat perubahan yang sesuai</div>
                <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                  Setiap kali admin mengubah data profil donatur atau relawan melalui formulir di atas dan menekan tombol Simpan, detail perubahan akan tampil di sini secara kronologis.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-linear-to-b before:from-teal-300 before:via-slate-200 before:to-slate-100">
                {relevantLogs.map((log, idx) => {
                  const isMerge = log.actionType === 'Merge';
                  const isHapus = log.actionType === 'Hapus';

                  return (
                    <div
                      key={log.id}
                      className="relative group transition-all"
                    >
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs transition-transform group-hover:scale-110 ${
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
                      <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-teal-300">
                        {/* Top Bar of the Entry */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Action badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isMerge
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : isHapus
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-teal-50 text-[#05828e] border border-teal-200'
                              }`}
                            >
                              {log.actionType} Data
                            </span>

                            {/* Field Name badge */}
                            <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                              {log.field}
                            </span>

                            {/* Profil tag (if viewing all) */}
                            {historyFilter === 'all' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                                <User className="w-3 h-3 text-slate-400" />
                                {log.codeId} • {log.namaLengkap}
                              </span>
                            )}
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

                        {/* Diff Box: Nilai Lama vs Nilai Baru */}
                        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {/* Old Value */}
                          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-rose-700 uppercase tracking-wider mb-1">
                              <span>Sebelumnya</span>
                              <span className="text-[10px] text-rose-500 font-normal">Nilai Lama</span>
                            </div>
                            <div className="text-xs sm:text-sm text-rose-900 font-mono break-all line-through decoration-rose-400/80">
                              {log.oldValue || '-'}
                            </div>
                          </div>

                          {/* New Value */}
                          <div className="bg-teal-50/70 border border-teal-200/90 rounded-xl p-3">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#05828e] uppercase tracking-wider mb-1">
                              <span>Menjadi</span>
                              <span className="text-[10px] text-teal-600 font-normal">Nilai Baru</span>
                            </div>
                            <div className="text-xs sm:text-sm text-teal-950 font-mono font-semibold break-all">
                              {log.newValue}
                            </div>
                          </div>
                        </div>

                        {/* Alasan Perubahan Callout */}
                        {log.alasan && (
                          <div className="mt-3 flex items-start gap-2 bg-white border border-slate-200/80 rounded-xl p-3 text-xs">
                            <span className="font-semibold text-slate-600 shrink-0">
                              Alasan Admin:
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

        {/* VIEW 2: Structured Table Mode */}
        {auditViewMode === 'table' && (
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 text-[12px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 w-[190px]">Waktu Perubahan</th>
                  <th className="py-3 px-4">Identitas</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Field</th>
                  <th className="py-3 px-4">Nilai Sebelumnya</th>
                  <th className="py-3 px-4">Nilai Baru</th>
                  <th className="py-3 px-4">Alasan Modifikasi</th>
                  <th className="py-3 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
                {relevantLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#05828e] font-mono bg-teal-50 px-1.5 py-0.5 rounded">
                          {log.codeId || '-'}
                        </span>
                        <span>{log.namaLengkap}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          log.actionType === 'Merge'
                            ? 'bg-amber-100 text-amber-800'
                            : log.actionType === 'Hapus'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-[#05828e]/10 text-[#05828e]'
                        }`}
                      >
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {log.field}
                    </td>
                    <td
                      className="py-3 px-4 text-rose-600 font-mono text-xs line-through max-w-[180px] truncate"
                      title={log.oldValue}
                    >
                      {log.oldValue || '-'}
                    </td>
                    <td
                      className="py-3 px-4 text-[#05828e] font-mono text-xs font-semibold max-w-[180px] truncate"
                      title={log.newValue}
                    >
                      {log.newValue}
                    </td>
                    <td
                      className="py-3 px-4 text-slate-600 max-w-[220px] truncate"
                      title={log.alasan}
                    >
                      {log.alasan || '-'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleCopyLog(log)}
                        title="Salin detail log"
                        className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {relevantLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 text-sm">
                      Belum ada riwayat perubahan yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
