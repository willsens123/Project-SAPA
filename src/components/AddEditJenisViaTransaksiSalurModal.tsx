import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { JenisViaSalurItem } from '../types';

interface AddEditJenisViaTransaksiSalurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisViaSalurItem) => void;
  editingItem?: JenisViaSalurItem | null;
}

export const AddEditJenisViaTransaksiSalurModal: React.FC<AddEditJenisViaTransaksiSalurModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaJenisVia, setNamaJenisVia] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaJenisVia(editingItem.namaJenisVia);
    } else {
      setNamaJenisVia('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenisVia.trim()) {
      setError('Jenis Via wajib diisi');
      return;
    }

    const itemToSave: JenisViaSalurItem = {
      id: editingItem ? editingItem.id : `jvs-${Date.now()}`,
      namaJenisVia: namaJenisVia.trim(),
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
            {editingItem ? 'Edit Jenis Via Transaksi S-SALUR' : 'Tambah Jenis Via Transaksi S-SALUR'}
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

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Jenis Via <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaJenisVia}
              onChange={(e) => setNamaJenisVia(e.target.value)}
              placeholder="Contoh: Market Place, Call Center, Stand"
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
