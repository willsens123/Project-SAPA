import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { JenisKategoriItemSalurItem } from '../types';

interface AddEditJenisKategoriItemSalurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisKategoriItemSalurItem) => void;
  editingItem?: JenisKategoriItemSalurItem | null;
}

export const AddEditJenisKategoriItemSalurModal: React.FC<AddEditJenisKategoriItemSalurModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaJenisKategori, setNamaJenisKategori] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaJenisKategori(editingItem.namaJenisKategori);
      setIsPrimary(!!editingItem.isPrimary);
      setKeterangan(editingItem.keterangan || '');
    } else {
      setNamaJenisKategori('');
      setIsPrimary(false);
      setKeterangan('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenisKategori.trim()) {
      setError('Nama Jenis Kategori wajib diisi');
      return;
    }

    const itemToSave: JenisKategoriItemSalurItem = {
      id: editingItem ? editingItem.id : `jkis-${Date.now()}`,
      namaJenisKategori: namaJenisKategori.trim(),
      isPrimary,
      keterangan: keterangan.trim() || undefined,
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">
            {editingItem ? 'Edit Jenis Kategori Item' : 'Tambah Jenis Kategori Item'}
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Jenis Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaJenisKategori}
              onChange={(e) => setNamaJenisKategori(e.target.value)}
              placeholder="Contoh: Umur, Isi?, Triyana, Format..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91]"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input
              id="checkbox-primary-jk"
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 text-[#008d91] rounded-sm focus:ring-[#008d91] accent-[#008d91] cursor-pointer"
            />
            <label htmlFor="checkbox-primary-jk" className="text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
              Tandai sebagai kategori <span className="text-[#008d91]">Primary</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Keterangan klasifikasi..."
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
