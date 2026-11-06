import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { JenisPerubahanDharmaPatronItem } from '../types';

interface AddEditJenisPerubahanDPRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisPerubahanDharmaPatronItem) => void;
  editingItem?: JenisPerubahanDharmaPatronItem | null;
}

export const AddEditJenisPerubahanDPRModal: React.FC<AddEditJenisPerubahanDPRModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNama(editingItem.nama);
    } else {
      setNama('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama jenis perubahan harus diisi');
      return;
    }

    const item: JenisPerubahanDharmaPatronItem = {
      id: editingItem ? editingItem.id : `jp-${Date.now()}`,
      nama: nama.trim(),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-150 relative border border-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {editingItem ? 'Edit Jenis Perubahan' : 'Tambah Jenis Perubahan'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 font-medium text-xs sm:text-sm mb-2">
              Jenis Perubahan <span className="text-red-500">*</span>
            </label>
            <input
              id="input-nama-jenis-perubahan"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Mengubah nominal, Pemutihan, Berhenti..."
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#008d91] shadow-2xs transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm font-medium transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              id="btn-save-jenis-perubahan"
              type="submit"
              className="rounded-full px-6 py-2 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white text-sm font-medium transition-colors shadow-2xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
