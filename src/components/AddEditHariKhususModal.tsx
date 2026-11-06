import React, { useState, useEffect } from 'react';
import { X, Calendar, Sparkles } from 'lucide-react';
import { HariKhususItem, KATEGORI_HARI_KHUSUS_OPTIONS } from '../hariKhususData';

interface AddEditHariKhususModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: HariKhususItem) => void;
  editingItem?: HariKhususItem | null;
  defaultDate?: string;
}

export const AddEditHariKhususModal: React.FC<AddEditHariKhususModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  defaultDate,
}) => {
  const [tanggal, setTanggal] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState<string>('Hari Besar Nasional');
  const [isLibur, setIsLibur] = useState<boolean>(true);
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTanggal(editingItem.tanggal);
      setNama(editingItem.nama);
      setKategori(editingItem.kategori || 'Hari Besar Nasional');
      setIsLibur(editingItem.isLibur ?? true);
      setKeterangan(editingItem.keterangan || '');
    } else {
      setTanggal(defaultDate || '2021-11-10');
      setNama('');
      setKategori('Hari Besar Nasional');
      setIsLibur(true);
      setKeterangan('');
    }
    setError('');
  }, [editingItem, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleKategoriChange = (newKat: string) => {
    setKategori(newKat);
    // If user picks Hari Besar Nasional or Cuti Bersama, auto-check isLibur
    if (newKat === 'Hari Besar Nasional' || newKat === 'Cuti Bersama') {
      setIsLibur(true);
    } else if (newKat === 'Hari Peringatan') {
      setIsLibur(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal.trim()) {
      setError('Tanggal hari khusus wajib diisi');
      return;
    }
    if (!nama.trim()) {
      setError('Nama hari khusus wajib diisi');
      return;
    }

    const itemToSave: HariKhususItem = {
      id: editingItem ? editingItem.id : `hk-${Date.now()}`,
      tanggal: tanggal.trim(),
      nama: nama.trim(),
      kategori,
      isLibur,
      keterangan: keterangan.trim() || undefined,
      createdAt: editingItem?.createdAt || '15 Nov 2021',
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008d91]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Hari Khusus' : 'Tambah Hari Khusus'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Terkoneksi langsung dengan Calendar To-Do List
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {/* Tanggal */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Tanggal Hari Khusus <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Format: YYYY-MM-DD (Contoh: 2021-11-10 untuk Hari Pahlawan)
            </span>
          </div>

          {/* Nama Hari Khusus */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Nama Hari Khusus <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Hari Pahlawan, Hari Guru Nasional, Idul Fitri"
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Kategori Hari Khusus <span className="text-rose-500">*</span>
            </label>
            <select
              value={kategori}
              onChange={(e) => handleKategoriChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              {KATEGORI_HARI_KHUSUS_OPTIONS.map((kat) => (
                <option key={kat} value={kat}>
                  {kat} {kat === 'Hari Besar Nasional' ? '(Libur Nasional / Merah)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Checklist Libur */}
          <div className="pt-1">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isLibur}
                onChange={(e) => setIsLibur(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-semibold text-slate-800 select-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                  Libur (Dibuat Merah & Libur di Calendar To-Do List)
                </span>
                <span className="text-[11px] text-slate-500 select-none mt-0.5">
                  Tanggal pada Calendar To-Do List akan ditandai dengan warna merah dan status libur.
                </span>
              </div>
            </label>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Keterangan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan tambahan mengenai hari besar / libur (opsional)..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-[#008d91] hover:bg-[#007b7f] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambah Hari Khusus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
