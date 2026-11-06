import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { JenisViaAjarItem } from '../viaAjarData';

interface AddEditJenisViaTransaksiAjarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisViaAjarItem) => void;
  editingItem?: JenisViaAjarItem | null;
}

export const AddEditJenisViaTransaksiAjarModal: React.FC<AddEditJenisViaTransaksiAjarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaJenisVia, setNamaJenisVia] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaJenisVia(editingItem.namaJenisVia);
      setKeterangan(editingItem.keterangan || '');
    } else {
      setNamaJenisVia('');
      setKeterangan('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenisVia.trim()) {
      setError('Nama Jenis Via wajib diisi');
      return;
    }

    const itemToSave: JenisViaAjarItem = {
      id: editingItem ? editingItem.id : `jva-${Date.now()}`,
      namaJenisVia: namaJenisVia.trim(),
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            {editingItem ? 'Edit Jenis Via Transaksi A-AJAR' : 'Tambah Jenis Via Transaksi A-AJAR'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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

          {/* Nama Jenis Via */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Jenis Via <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaJenisVia}
              onChange={(e) => setNamaJenisVia(e.target.value)}
              placeholder="e.g. Call Center, Website, Form, Media Social, Stand"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-colors"
              autoFocus
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Keterangan
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Keterangan atau deskripsi jenis via transaksi..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
