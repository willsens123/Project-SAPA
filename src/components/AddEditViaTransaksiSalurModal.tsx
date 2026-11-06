import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { ViaTransaksiSalurItem, JenisViaSalurItem } from '../types';

interface AddEditViaTransaksiSalurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ViaTransaksiSalurItem) => void;
  editingItem?: ViaTransaksiSalurItem | null;
  jenisViaList: JenisViaSalurItem[];
}

export const AddEditViaTransaksiSalurModal: React.FC<AddEditViaTransaksiSalurModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  jenisViaList,
}) => {
  const [namaVia, setNamaVia] = useState('');
  const [jenisVia, setJenisVia] = useState('');
  const [tipe, setTipe] = useState<'Online' | 'Offline'>('Online');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaVia(editingItem.namaVia);
      setJenisVia(editingItem.jenisVia);
      setTipe(editingItem.tipe);
    } else {
      setNamaVia('');
      setJenisVia(jenisViaList[0]?.namaJenisVia || 'Market Place');
      setTipe('Online');
    }
    setError('');
  }, [editingItem, isOpen, jenisViaList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaVia.trim()) {
      setError('Nama Via wajib diisi');
      return;
    }
    if (!jenisVia.trim()) {
      setError('Jenis Via wajib dipilih');
      return;
    }

    const itemToSave: ViaTransaksiSalurItem = {
      id: editingItem ? editingItem.id : `vts-${Date.now()}`,
      namaVia: namaVia.trim(),
      jenisVia: jenisVia.trim(),
      tipe,
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
            {editingItem ? 'Edit Via Transaksi S-SALUR' : 'Tambah Via Transaksi S-SALUR'}
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

          {/* Nama Via */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Nama Via <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaVia}
              onChange={(e) => setNamaVia(e.target.value)}
              placeholder="Contoh: Tokopedia, Shopee, Kezya"
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>

          {/* Jenis Via */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Jenis Via <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={jenisVia}
                onChange={(e) => setJenisVia(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
              >
                {jenisViaList.map((j) => (
                  <option key={j.id} value={j.namaJenisVia}>
                    {j.namaJenisVia}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Online / Offline */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Online / Offline <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipe('Online')}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-colors cursor-pointer text-center ${
                  tipe === 'Online'
                    ? 'border-[#008d91] bg-teal-50/70 text-[#008d91]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setTipe('Offline')}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-colors cursor-pointer text-center ${
                  tipe === 'Offline'
                    ? 'border-[#008d91] bg-teal-50/70 text-[#008d91]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Offline
              </button>
            </div>
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
