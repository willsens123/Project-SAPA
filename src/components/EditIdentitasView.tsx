import React, { useState } from 'react';
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

export const EditIdentitasView: React.FC<EditIdentitasViewProps> = ({
  item,
  allIdentitasList,
  changeLogs,
  onBack,
  onSave,
  onShowToast,
  onOpenAddModal,
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

  // Table filter options
  const [historyFilter, setHistoryFilter] = useState<'current' | 'all'>('current');
  const [tableSearchQuery, setTableSearchQuery] = useState('');

  // Add another field row
  const handleAddFieldRow = () => {
    const unusedField = AVAILABLE_FIELDS.find(
      (f) => !fieldRows.some((r) => r.fieldKey === f.key)
    ) || AVAILABLE_FIELDS[0];

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
      // Clear the row instead of removing last one
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
    onShowToast(`${newLogs.length} perubahan data berhasil disimpan dan dicatat ke riwayat`);
  };

  // Filter change logs
  const relevantLogs = changeLogs.filter((log) => {
    if (historyFilter === 'current' && log.identitasId !== selectedIdentity.id) {
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

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar matching Image 1: Right aligned icons + Add */}
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
            <div className="text-xs text-slate-400 font-medium">Mengedit Identitas</div>
            <div className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>{selectedIdentity.codeId}</span>
              <span>{selectedIdentity.namaLengkap}</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {selectedIdentity.bhanteLay}
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools Group matching Image 1: EyeOff, Search, Filter, + Add */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onShowToast('Fitur visibilitas kolom')}
            title="Sembunyikan / Tampilkan Kolom"
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

          <button
            id="btn-edit-identitas-add"
            type="button"
            onClick={onOpenAddModal || handleAddFieldRow}
            className="bg-[#05828e] text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#046c76] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Edit Form Container matching Image 1 */}
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
                  {/* Dropdown Selector matching Image 1: [Search... v] */}
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

                  {/* Arrow Indicator matching Image 1: [->] */}
                  <div className="w-7 h-7 rounded-full bg-[#05828e] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>

                  {/* Input Text matching Image 1: [Input Text...] */}
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

                  {/* Clear / Delete row button matching Image 1: [X] */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFieldRow(row.id)}
                    title="Hapus baris ini"
                    className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Plus button matching Image 1: [+] (shows on the last row or always) */}
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

          {/* Row 2: Alasan Hapus/Ubah matching Image 1 */}
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-semibold text-slate-700">
              Alasan Hapus/Ubah
            </label>
            <input
              type="text"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Input Text..."
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-2 focus:ring-[#05828e]/20 transition-all"
            />
          </div>

          {/* Row 3: Action Buttons matching Image 1: Cancel & Save */}
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
              className="px-8 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* New Table for storing all change history, reason, and timestamp */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#05828e]/10 text-[#05828e] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Riwayat Perubahan Data Identitas
              </h2>
              <p className="text-xs text-slate-500">
                Mencatat semua perubahan data, alasan modifikasi, dan timestamp secara otomatis
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-history-input"
                type="text"
                placeholder="Cari di riwayat perubahan..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-[#05828e]"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium shrink-0">
              <button
                type="button"
                onClick={() => setHistoryFilter('current')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'current'
                    ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orang Ini
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
                Semua ({changeLogs.length})
              </button>
            </div>
          </div>
        </div>

        {/* Change Logs Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-[180px]">Timestamp</th>
                <th className="py-3 px-4">Identitas</th>
                <th className="py-3 px-4">Field yang Diubah</th>
                <th className="py-3 px-4">Nilai Sebelumnya</th>
                <th className="py-3 px-4">Nilai Baru</th>
                <th className="py-3 px-4">Alasan Hapus/Ubah</th>
                <th className="py-3 px-4 text-center w-[90px]">Aksi</th>
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
                      <span className="text-xs text-slate-400 font-mono">
                        {log.codeId || '-'}
                      </span>
                      <span>{log.namaLengkap}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#05828e]">
                    {log.field}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={log.oldValue}>
                    {log.oldValue || '-'}
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-medium max-w-[200px] truncate" title={log.newValue}>
                    {log.newValue}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-[250px] truncate" title={log.alasan}>
                    {log.alasan}
                  </td>
                  <td className="py-3 px-4 text-center">
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
                </tr>
              ))}

              {relevantLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
                    Belum ada riwayat perubahan yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
