import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PengisiAcaraItemAjarItem } from '../pengisiAcaraAjarData';

interface AddEditPengisiAcaraAjarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PengisiAcaraItemAjarItem) => void;
  editingItem?: PengisiAcaraItemAjarItem | null;
}

export const AddEditPengisiAcaraAjarModal: React.FC<AddEditPengisiAcaraAjarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaPengisiAcara, setNamaPengisiAcara] = useState('');
  const [keterangan, setKeterangan] = useState('-');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaPengisiAcara(editingItem.namaPengisiAcara);
      setKeterangan(editingItem.keterangan || '-');
    } else {
      setNamaPengisiAcara('');
      setKeterangan('-');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPengisiAcara.trim()) {
      setError('Nama Pengisi Acara wajib diisi');
      return;
    }

    const itemToSave: PengisiAcaraItemAjarItem = {
      id: editingItem ? editingItem.id : `paa-${Date.now()}`,
      namaPengisiAcara: namaPengisiAcara.trim(),
      keterangan: keterangan.trim() || '-',
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {editingItem ? 'Edit Pengisi Acara' : 'Tambah Pengisi Acara'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pengisi Acara *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pembicara, Moderator"
              value={namaPengisiAcara}
              onChange={(e) => setNamaPengisiAcara(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] focus:bg-white text-slate-800"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              placeholder="e.g. -"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91] focus:bg-white text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7e] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
