import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { KategoriItemSalurItem, JenisKategoriItemSalurItem } from '../types';

interface AddEditKategoriItemSalurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: KategoriItemSalurItem) => void;
  jenisKategoriList: JenisKategoriItemSalurItem[];
  editingItem?: KategoriItemSalurItem | null;
}

export const AddEditKategoriItemSalurModal: React.FC<AddEditKategoriItemSalurModalProps> = ({
  isOpen,
  onClose,
  onSave,
  jenisKategoriList,
  editingItem,
}) => {
  const [namaKategori, setNamaKategori] = useState('');
  const [namaJenisKategori, setNamaJenisKategori] = useState('');
  const [kode, setKode] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaKategori(editingItem.namaKategori);
      setNamaJenisKategori(editingItem.namaJenisKategori);
      setKode(editingItem.kode || '');
      setIsPrimary(!!editingItem.isPrimary);
      setKeterangan(editingItem.keterangan || '');
    } else {
      setNamaKategori('');
      setNamaJenisKategori(jenisKategoriList.length > 0 ? jenisKategoriList[0].namaJenisKategori : 'Umur');
      setKode('');
      setIsPrimary(false);
      setKeterangan('');
    }
    setError('');
  }, [editingItem, isOpen, jenisKategoriList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKategori.trim()) {
      setError('Nama Kategori Item wajib diisi');
      return;
    }
    if (!namaJenisKategori.trim()) {
      setError('Pilih Jenis Kategori');
      return;
    }

    const itemToSave: KategoriItemSalurItem = {
      id: editingItem ? editingItem.id : `kis-${Date.now()}`,
      namaKategori: namaKategori.trim(),
      namaJenisKategori: namaJenisKategori.trim(),
      kode: kode.trim() || undefined,
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
            {editingItem ? 'Edit Kategori Item S-SALUR' : 'Tambah Kategori Item S-SALUR'}
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
              Nama Kategori Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              placeholder="Contoh: Dewasa, TJMP, Welas Asih, Lamrim..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={namaJenisKategori}
              onChange={(e) => setNamaJenisKategori(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] bg-white cursor-pointer"
            >
              {jenisKategoriList.map((jk) => (
                <option key={jk.id} value={jk.namaJenisKategori}>
                  {jk.namaJenisKategori} {jk.isPrimary ? '(Primary)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kode (Opsional)
            </label>
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="Contoh: DWS, TJMP, WA..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91]"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input
              id="checkbox-primary-kategori"
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 text-[#008d91] rounded-sm focus:ring-[#008d91] accent-[#008d91] cursor-pointer"
            />
            <label htmlFor="checkbox-primary-kategori" className="text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer">
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
              placeholder="Keterangan singkat..."
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
