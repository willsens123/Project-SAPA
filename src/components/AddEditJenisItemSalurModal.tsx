import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { JenisItemSalurItem } from '../types';

interface AddEditJenisItemSalurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisItemSalurItem) => void;
  editingItem?: JenisItemSalurItem | null;
}

const COLOR_PRESETS = [
  { label: 'Teal', value: '#008d91' },
  { label: 'Ungu', value: '#8e44ad' },
  { label: 'Merah', value: '#c0392b' },
  { label: 'Amber', value: '#f39c12' },
  { label: 'Pink', value: '#e91e63' },
  { label: 'Indigo', value: '#5e35b1' },
  { label: 'Hijau', value: '#27ae60' },
  { label: 'Biru', value: '#2980b9' },
];

export const AddEditJenisItemSalurModal: React.FC<AddEditJenisItemSalurModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaJenis, setNamaJenis] = useState('');
  const [kode, setKode] = useState('');
  const [iconBg, setIconBg] = useState('#008d91');
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaJenis(editingItem.namaJenis);
      setKode(editingItem.kode);
      setIconBg(editingItem.iconBg || '#008d91');
      setKeterangan(editingItem.keterangan || '');
    } else {
      setNamaJenis('');
      setKode('');
      setIconBg('#008d91');
      setKeterangan('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenis.trim()) {
      setError('Nama Jenis Item wajib diisi');
      return;
    }
    const autoKode = kode.trim() || namaJenis.trim().substring(0, 5);
    const iconLetter = namaJenis.trim().charAt(0).toUpperCase();

    const itemToSave: JenisItemSalurItem = {
      id: editingItem ? editingItem.id : `jis-${Date.now()}`,
      namaJenis: namaJenis.trim(),
      kode: autoKode,
      iconLetter,
      iconBg,
      keterangan: keterangan.trim() || undefined,
    };

    onSave(itemToSave);
    onClose();
  };

  const previewLetter = namaJenis.trim().charAt(0).toUpperCase() || 'B';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">
            {editingItem ? 'Edit Jenis Item S-SALUR' : 'Tambah Jenis Item S-SALUR'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Live Preview badge */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0"
              style={{ backgroundColor: iconBg }}
            >
              {previewLetter}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Tampilan Icon</span>
              <span className="text-sm font-bold text-slate-800">
                {namaJenis.trim() || 'Contoh Jenis Item'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Jenis Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaJenis}
              onChange={(e) => {
                setNamaJenis(e.target.value);
                if (!kode) {
                  setKode(e.target.value);
                }
              }}
              placeholder="Contoh: Buku, Merchandise, E-Book..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kode Item
            </label>
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="Contoh: Buku, Merch, Lain..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Warna Icon Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Warna Icon
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setIconBg(col.value)}
                  className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center cursor-pointer ${
                    iconBg === col.value ? 'ring-2 ring-offset-2 ring-slate-700 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.value }}
                  title={col.label}
                >
                  {iconBg === col.value && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Deskripsi singkat jenis item..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
