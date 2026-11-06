import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { ViaTransaksiDonasiItem, JenisViaDonasiItem } from '../types';

interface AddEditViaTransaksiDonasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ViaTransaksiDonasiItem) => void;
  editingItem?: ViaTransaksiDonasiItem | null;
  jenisViaList: JenisViaDonasiItem[];
}

export const AddEditViaTransaksiDonasiModal: React.FC<AddEditViaTransaksiDonasiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  jenisViaList,
}) => {
  const [namaVia, setNamaVia] = useState('');
  const [jenisVia, setJenisVia] = useState('');
  const [onlineOffline, setOnlineOffline] = useState<'Online' | 'Offline'>('Online');
  const [kirimResi, setKirimResi] = useState<boolean>(true);
  const [keterangan, setKeterangan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaVia(editingItem.namaVia);
      setJenisVia(editingItem.jenisVia);
      setOnlineOffline(editingItem.onlineOffline);
      setKirimResi(editingItem.kirimResi ?? true);
      setKeterangan(editingItem.keterangan || '');
    } else {
      setNamaVia('');
      setJenisVia(jenisViaList[0]?.namaJenisVia || 'Media Social');
      setOnlineOffline('Online');
      setKirimResi(true);
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

    const itemToSave: ViaTransaksiDonasiItem = {
      id: editingItem ? editingItem.id : `vtd-${Date.now()}`,
      namaVia: namaVia.trim(),
      jenisVia: jenisVia.trim(),
      onlineOffline,
      kirimResi,
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
            {editingItem ? 'Edit Via Transaksi D-DONASI' : 'Tambah Via Transaksi D-DONASI'}
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
              placeholder="Contoh: Instagram, Facebook, Call Center"
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
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] appearance-none cursor-pointer"
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

          {/* Online/Offline */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Online/Offline
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOnlineOffline('Online')}
                className={`py-2 px-3 text-xs sm:text-sm rounded-xl border font-medium transition-all ${
                  onlineOffline === 'Online'
                    ? 'border-[#008d91] bg-teal-50/50 text-[#008d91] ring-1 ring-[#008d91]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setOnlineOffline('Offline')}
                className={`py-2 px-3 text-xs sm:text-sm rounded-xl border font-medium transition-all ${
                  onlineOffline === 'Offline'
                    ? 'border-[#008d91] bg-teal-50/50 text-[#008d91] ring-1 ring-[#008d91]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Offline
              </button>
            </div>
          </div>

          {/* Kirim Resi */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Kirim Resi
            </label>
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={kirimResi}
                onChange={(e) => setKirimResi(e.target.checked)}
                className="w-4 h-4 text-[#008d91] rounded border-slate-300 focus:ring-[#008d91] cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium select-none">
                {kirimResi ? 'Checklist (Kirim resi ke donatur)' : 'Tidak kirim resi'}
              </span>
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
              placeholder="Catatan tambahan saluran transaksi (opsional)..."
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
