import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface AddMasterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  initialName?: string;
  initialKeterangan?: string;
  onSave: (name: string, keterangan: string) => void;
}

export const AddMasterItemModal: React.FC<AddMasterItemModalProps> = ({
  isOpen,
  onClose,
  title,
  nameLabel,
  namePlaceholder,
  initialName = '',
  initialKeterangan = '-',
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [keterangan, setKeterangan] = useState(initialKeterangan);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialName);
    setKeterangan(initialKeterangan || '-');
    setError('');
  }, [initialName, initialKeterangan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`${nameLabel} wajib diisi`);
      return;
    }
    onSave(name.trim(), keterangan.trim() || '-');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {nameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-1 focus:ring-[#05828e]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Keterangan (opsional, gunakan '-' jika tidak ada)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-1 focus:ring-[#05828e] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#05828e] text-white font-semibold text-xs hover:bg-[#046c76] shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
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
