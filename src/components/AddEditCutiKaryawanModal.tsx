import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  User,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  CutiKaryawanItem,
  JenisCuti,
  CutiStatus,
  JENIS_CUTI_OPTIONS,
  CUTI_STATUS_OPTIONS,
  calculateCutiDuration,
} from '../cutiKaryawanData';
import { KaryawanItem } from '../types';
import { DateRangePickerPopover } from './DateRangePickerPopover';

interface AddEditCutiKaryawanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: CutiKaryawanItem) => void;
  editingItem?: CutiKaryawanItem | null;
  karyawanList: KaryawanItem[];
}

export const AddEditCutiKaryawanModal: React.FC<AddEditCutiKaryawanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  karyawanList,
}) => {
  const [selectedKaryawanId, setSelectedKaryawanId] = useState<string>('');
  const [jenisCuti, setJenisCuti] = useState<JenisCuti>('Ijin Cuti Full');
  const [tanggalMulai, setTanggalMulai] = useState<string>('');
  const [tanggalSelesai, setTanggalSelesai] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [status, setStatus] = useState<CutiStatus>('Menunggu Acc');
  const [error, setError] = useState<string>('');
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  // Selected employee object
  const selectedKaryawan = useMemo(() => {
    return karyawanList.find(
      (k) => k.id === selectedKaryawanId || k.kodeKaryawan === selectedKaryawanId
    );
  }, [karyawanList, selectedKaryawanId]);

  useEffect(() => {
    if (editingItem) {
      setSelectedKaryawanId(editingItem.karyawanId || editingItem.kodeKaryawan);
      setJenisCuti(editingItem.jenisCuti);
      setTanggalMulai(editingItem.tanggalMulai);
      setTanggalSelesai(editingItem.tanggalSelesai);
      setKeterangan(editingItem.keterangan || '');
      setStatus(editingItem.status || 'Disetujui');
    } else {
      const defaultKaryawan = karyawanList[0]?.id || '';
      setSelectedKaryawanId(defaultKaryawan);
      setJenisCuti('Ijin Cuti Full');
      const today = new Date().toISOString().split('T')[0];
      setTanggalMulai(today);
      setTanggalSelesai(today);
      setKeterangan('');
      setStatus('Menunggu Acc');
    }
    setError('');
  }, [editingItem, isOpen, karyawanList]);

  // Handle jenis cuti change
  const handleJenisCutiChange = (newJenis: JenisCuti) => {
    setJenisCuti(newJenis);
    if (newJenis === 'Ijin Cuti Setengah Hari') {
      setTanggalSelesai(tanggalMulai);
    }
  };

  // Handle tanggal mulai change
  const handleTanggalMulaiChange = (val: string) => {
    setTanggalMulai(val);
    if (jenisCuti === 'Ijin Cuti Setengah Hari') {
      setTanggalSelesai(val);
    } else if (tanggalSelesai && val > tanggalSelesai) {
      setTanggalSelesai(val);
    }
  };

  // Computed duration
  const durasiHari = useMemo(() => {
    return calculateCutiDuration(jenisCuti, tanggalMulai, tanggalSelesai);
  }, [jenisCuti, tanggalMulai, tanggalSelesai]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKaryawan) {
      setError('Karyawan wajib dipilih');
      return;
    }
    if (!tanggalMulai) {
      setError('Tanggal Mulai Cuti wajib diisi');
      return;
    }
    if (!tanggalSelesai) {
      setError('Tanggal Selesai Cuti wajib diisi');
      return;
    }
    if (tanggalSelesai < tanggalMulai) {
      setError('Tanggal Selesai tidak boleh lebih awal dari Tanggal Mulai');
      return;
    }

    const itemToSave: CutiKaryawanItem = {
      id: editingItem ? editingItem.id : `cuti-${Date.now()}`,
      nomorPengajuan: editingItem
        ? editingItem.nomorPengajuan
        : `CT-${String(Math.floor(Math.random() * 900) + 100)}`,
      karyawanId: selectedKaryawan.id,
      kodeKaryawan: selectedKaryawan.kodeKaryawan,
      namaKaryawan: selectedKaryawan.namaLengkap,
      namaPanggilan: selectedKaryawan.namaPanggilan,
      divisi: selectedKaryawan.divisi,
      avatarInitial:
        selectedKaryawan.avatarInitial ||
        selectedKaryawan.namaLengkap[0]?.toUpperCase() ||
        'K',
      avatarBg: selectedKaryawan.avatarBg || 'bg-[#14b8a6]',
      jenisCuti,
      tanggalMulai,
      tanggalSelesai:
        jenisCuti === 'Ijin Cuti Setengah Hari' ? tanggalMulai : tanggalSelesai,
      durasiHari,
      keterangan: keterangan.trim(),
      status,
      tanggalPengajuan:
        editingItem?.tanggalPengajuan || new Date().toISOString().split('T')[0],
      disetujuiOleh:
        status === 'Disetujui'
          ? editingItem?.disetujuiOleh || 'Ko Agus (UMM)'
          : undefined,
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#008d91] flex items-center justify-center border border-teal-100 shadow-xs">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {editingItem ? 'Edit Form Cuti Karyawan' : 'Form Pengajuan Cuti Karyawan'}
              </h3>
              <p className="text-xs text-slate-400">
                Pilih ID karyawan dan tentukan jenis serta rentang tanggal cuti
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-rose-600 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. ID Karyawan (Terkoneksi dengan "Karyawan") */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>
                ID Karyawan <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-[#008d91] lowercase">
                terkoneksi dengan master karyawan
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedKaryawanId}
                onChange={(e) => setSelectedKaryawanId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] transition-all cursor-pointer"
              >
                {karyawanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    [{k.kodeKaryawan}] {k.namaLengkap}{' '}
                    {k.namaPanggilan ? `(${k.namaPanggilan})` : ''} - Divisi {k.divisi}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Employee Preview Card */}
            {selectedKaryawan && (
              <div className="mt-2.5 p-3 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full ${
                      selectedKaryawan.avatarBg || 'bg-[#008d91]'
                    } text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                  >
                    {selectedKaryawan.avatarInitial ||
                      selectedKaryawan.namaLengkap[0]?.toUpperCase() ||
                      'K'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {selectedKaryawan.namaLengkap}
                      </span>
                      {selectedKaryawan.namaPanggilan && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          ({selectedKaryawan.namaPanggilan})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-slate-600 font-semibold">
                        ID: {selectedKaryawan.kodeKaryawan}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600">Email: {selectedKaryawan.emailLogin}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#008d91]/10 text-[#008d91] border border-[#008d91]/20">
                    Divisi {selectedKaryawan.divisi}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Jenis Cuti */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Jenis Cuti <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JENIS_CUTI_OPTIONS.map((opt) => {
                const isSelected = jenisCuti === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleJenisCutiChange(opt.value)}
                    className={`px-3 py-2.5 rounded-2xl text-left border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? `${opt.badgeBg} ${opt.badgeText} ${opt.badgeBorder} ring-2 ring-[#008d91]/20 shadow-xs`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`}
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {jenisCuti === 'Ijin Cuti Setengah Hari' && (
              <p className="mt-1.5 text-[11px] text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 font-medium">
                💡 Cuti setengah hari dihitung 0.5 hari kerja pada tanggal yang sama.
              </p>
            )}
          </div>

          {/* 3. Tanggal Cuti: Dari tanggal berapa sampai berapa cutinya */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tanggal Cuti <span className="text-rose-500">*</span>
              </label>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#008d91] text-white">
                <Clock className="w-3 h-3" />
                Durasi: {durasiHari} {durasiHari === 0.5 ? 'Hari (Setengah Hari)' : 'Hari'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              {/* Dari Tanggal */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Dari Tanggal:
                </span>
                <input
                  type="date"
                  value={tanggalMulai}
                  onClick={() => setIsDateRangePickerOpen(true)}
                  onChange={(e) => handleTanggalMulaiChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] transition-all cursor-pointer"
                  required
                />
              </div>

              {/* Sampai Tanggal */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Sampai Tanggal:
                </span>
                <input
                  type="date"
                  value={
                    jenisCuti === 'Ijin Cuti Setengah Hari'
                      ? tanggalMulai
                      : tanggalSelesai
                  }
                  disabled={jenisCuti === 'Ijin Cuti Setengah Hari'}
                  min={tanggalMulai}
                  onClick={() => {
                    if (jenisCuti !== 'Ijin Cuti Setengah Hari') {
                      setIsDateRangePickerOpen(true);
                    }
                  }}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] transition-all cursor-pointer ${
                    jenisCuti === 'Ijin Cuti Setengah Hari'
                      ? 'opacity-60 cursor-not-allowed bg-slate-100'
                      : ''
                  }`}
                  required
                />
              </div>

              {/* Date Range Popover */}
              <DateRangePickerPopover
                isOpen={isDateRangePickerOpen}
                onClose={() => setIsDateRangePickerOpen(false)}
                startDate={tanggalMulai}
                endDate={tanggalSelesai}
                format="YYYY-MM-DD"
                onSelectRange={(start, end) => {
                  setTanggalMulai(start);
                  if (jenisCuti === 'Ijin Cuti Setengah Hari') {
                    setTanggalSelesai(start);
                  } else {
                    setTanggalSelesai(end || start);
                  }
                }}
              />
            </div>
          </div>

          {/* 4. Keterangan / Alasan Cuti */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Keterangan / Keperluan Cuti
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Keperluan keluarga di luar kota, istirahat dokter, retret spiritual..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] transition-all resize-none"
            />
          </div>

          {/* 5. Status Pengajuan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Pengajuan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CUTI_STATUS_OPTIONS.map((st) => {
                const isSelected = status === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setStatus(st.value)}
                    className={`px-3 py-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? `${st.badgeBg} ${st.badgeText} ${st.badgeBorder} ring-2 ring-slate-200 shadow-xs`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#008d91] hover:bg-[#007a7e] shadow-xs shadow-[#008d91]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{editingItem ? 'Simpan Perubahan' : 'Ajukan Cuti'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
