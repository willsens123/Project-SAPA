import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { SubJenisItemDonasiItem } from '../subJenisDonasiData';

interface AddEditSubJenisItemDonasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: SubJenisItemDonasiItem) => void;
  editingItem?: SubJenisItemDonasiItem | null;
}

export const AddEditSubJenisItemDonasiModal: React.FC<AddEditSubJenisItemDonasiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaSubJenis, setNamaSubJenis] = useState('');
  const [kode, setKode] = useState('');
  const [keterangan, setKeterangan] = useState('Sub-Jenis Item');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaSubJenis(editingItem.namaSubJenis);
      setKode(editingItem.kode);
      setKeterangan(editingItem.keterangan || 'Sub-Jenis Item');
    } else {
      setNamaSubJenis('');
      setKode('');
      setKeterangan('Sub-Jenis Item');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSubJenis.trim()) {
      setError('Nama Sub-Jenis Item wajib diisi');
      return;
    }
    if (!kode.trim()) {
      setError('Kode wajib diisi (contoh: DPR, DPN)');
      return;
    }

    const newItem: SubJenisItemDonasiItem = {
      id: editingItem ? editingItem.id : `sjd-${Date.now()}`,
      namaSubJenis: namaSubJenis.trim(),
      kode: kode.trim().toUpperCase(),
      pos: '-',
      iconLetter: 'D',
      iconBg: '#f59e0b',
      keterangan: keterangan.trim() || 'Sub-Jenis Item',
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              D
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                {editingItem ? 'Edit Sub-Jenis Item D-DONASI' : 'Tambah Sub-Jenis Item D-DONASI'}
              </h2>
              <p className="text-xs text-slate-400">Master Data Sub-Jenis D-DONASI</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Nama Sub-Jenis */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Sub-Jenis Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaSubJenis}
              onChange={(e) => {
                setNamaSubJenis(e.target.value);
                // Auto generate kode preview if adding new
                if (!editingItem && (!kode || kode.length < 5)) {
                  const words = e.target.value.trim().split(/\s+/);
                  const generated = words
                    .map((w) => w.charAt(0))
                    .join('')
                    .toUpperCase();
                  if (generated) setKode(generated);
                }
              }}
              placeholder="Contoh: Dharma Patron Rutin"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] focus:bg-white transition-all"
            />
          </div>

          {/* Kode */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Kode Singkatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value.toUpperCase())}
              placeholder="Contoh: DPR"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] focus:bg-white transition-all"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Sub-Jenis Item"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] focus:bg-white transition-all"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#008d91] hover:bg-[#007b7e] text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
