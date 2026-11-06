import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { JenisNonProyekItem } from '../types';
import { COLOR_PALETTE_JENIS_NON_PROYEK } from '../jenisNonProyekData';

interface AddEditJenisNonProyekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisNonProyekItem) => void;
  editingItem?: JenisNonProyekItem | null;
}

export const AddEditJenisNonProyekModal: React.FC<AddEditJenisNonProyekModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [nama, setNama] = useState('');
  const [warnaKartu, setWarnaKartu] = useState('#9fa8da');
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setNama(editingItem.nama || '');
      setWarnaKartu(editingItem.warnaKartu || '#9fa8da');
      setKeterangan(editingItem.keterangan || '');
    } else {
      setNama('');
      setWarnaKartu('#9fa8da');
      setKeterangan('');
    }
    setError(null);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama Jenis Non-Proyek wajib diisi');
      return;
    }

    const itemToSave: JenisNonProyekItem = {
      id: editingItem ? editingItem.id : `jnp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nama: nama.trim(),
      warnaKartu: warnaKartu || '#9fa8da',
      keterangan: keterangan.trim() || undefined,
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {editingItem ? 'Edit Jenis Non-Proyek' : 'Tambah Jenis Non-Proyek'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur jenis kegiatan to-do list non-proyek dan warna kartu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {error}
            </div>
          )}

          {/* Input: Jenis Non-Proyek */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Jenis Non-Proyek <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Contoh: Pekerjaan Harian"
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Color Preview & Palette: Warna Kartu */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Warna Kartu
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">{warnaKartu}</span>
                <span
                  className="w-6 h-6 rounded-full border-2 border-white shadow-xs inline-block"
                  style={{ backgroundColor: warnaKartu }}
                />
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-2 pt-1 pb-2">
              {COLOR_PALETTE_JENIS_NON_PROYEK.map((p) => {
                const isSelected = p.color.toLowerCase() === warnaKartu.toLowerCase();
                return (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setWarnaKartu(p.color)}
                    title={p.label}
                    className="w-9 h-9 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-2xs relative"
                    style={{ backgroundColor: p.color }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-xs" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs text-slate-500 font-medium">Pilih Warna Kustom:</label>
              <input
                type="color"
                value={warnaKartu}
                onChange={(e) => setWarnaKartu(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 bg-transparent"
              />
            </div>
          </div>

          {/* Input: Keterangan (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Keterangan (Opsional)
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Deskripsi atau catatan untuk jenis non-proyek ini..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white font-medium text-sm transition-colors cursor-pointer shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
