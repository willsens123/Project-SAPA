import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { ViaTransaksiAjarItem, JenisViaAjarItem } from '../viaAjarData';

interface AddEditViaTransaksiAjarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ViaTransaksiAjarItem) => void;
  editingItem?: ViaTransaksiAjarItem | null;
  jenisViaList: JenisViaAjarItem[];
}

export const AddEditViaTransaksiAjarModal: React.FC<AddEditViaTransaksiAjarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  jenisViaList,
}) => {
  const [namaVia, setNamaVia] = useState('');
  const [jenisVia, setJenisVia] = useState('');
  const [onlineOffline, setOnlineOffline] = useState<'Online' | 'Offline'>('Online');
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaVia(editingItem.namaVia);
      setJenisVia(editingItem.jenisVia);
      setOnlineOffline(editingItem.onlineOffline);
      setKeterangan(editingItem.keterangan || '');
    } else {
      setNamaVia('');
      setJenisVia(jenisViaList[0]?.namaJenisVia || 'Media Social');
      setOnlineOffline('Online');
      setKeterangan('');
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

    const itemToSave: ViaTransaksiAjarItem = {
      id: editingItem ? editingItem.id : `vta-${Date.now()}`,
      namaVia: namaVia.trim(),
      jenisVia: jenisVia.trim(),
      onlineOffline,
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
            {editingItem ? 'Edit Via Transaksi A-AJAR' : 'Tambah Via Transaksi A-AJAR'}
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
              placeholder="e.g. Call Center, Website Retret, Instagram, Stand Online"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-colors"
              autoFocus
            />
          </div>

          {/* Jenis Via Dropdown */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Jenis Via <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={jenisVia}
                onChange={(e) => setJenisVia(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-colors cursor-pointer"
              >
                {jenisViaList.map((j) => (
                  <option key={j.id} value={j.namaJenisVia}>
                    {j.namaJenisVia}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                onClick={() => setOnlineOffline('Online')}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                  onlineOffline === 'Online'
                    ? 'border-[#008d91] bg-[#008d91]/10 text-[#008d91] font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setOnlineOffline('Offline')}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                  onlineOffline === 'Offline'
                    ? 'border-[#008d91] bg-[#008d91]/10 text-[#008d91] font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Offline
              </button>
            </div>
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
              placeholder="Keterangan atau deskripsi kanal transaksi..."
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
