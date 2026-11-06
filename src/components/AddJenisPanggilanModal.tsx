import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { JenisPanggilanItem } from '../types';

interface AddJenisPanggilanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisPanggilanItem) => void;
  editingItem?: JenisPanggilanItem | null;
}

export const AddJenisPanggilanModal: React.FC<AddJenisPanggilanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [jenisPanggilan, setJenisPanggilan] = useState('');
  const [lengkap, setLengkap] = useState('');
  const [singkat, setSingkat] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setJenisPanggilan(editingItem.jenisPanggilan);
      setLengkap(editingItem.lengkap);
      setSingkat(editingItem.singkat);
      setIsPrimary(!!editingItem.isPrimary);
    } else {
      setJenisPanggilan('');
      setLengkap('');
      setSingkat('');
      setIsPrimary(false);
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisPanggilan.trim()) {
      setError('Jenis Panggilan wajib diisi');
      return;
    }

    onSave({
      id: editingItem?.id || `jp-${Date.now()}`,
      jenisPanggilan: jenisPanggilan.trim(),
      lengkap: lengkap.trim() || jenisPanggilan.trim().toLowerCase(),
      singkat: singkat.trim() || jenisPanggilan.trim().toLowerCase(),
      isPrimary,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">
            {editingItem ? 'Edit Jenis Panggilan' : 'Tambah Jenis Panggilan'}
          </h3>
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
              Jenis Panggilan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={jenisPanggilan}
              onChange={(e) => setJenisPanggilan(e.target.value)}
              placeholder="Contoh: Kakak, Cici, YL, Bude..."
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-1 focus:ring-[#05828e]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lengkap
            </label>
            <input
              type="text"
              value={lengkap}
              onChange={(e) => setLengkap(e.target.value)}
              placeholder="Contoh: kakak"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-1 focus:ring-[#05828e]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Singkat
            </label>
            <input
              type="text"
              value={singkat}
              onChange={(e) => setSingkat(e.target.value)}
              placeholder="Contoh: kak"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#05828e] focus:ring-1 focus:ring-[#05828e]"
            />
          </div>

          {/* Primary Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Jadikan Primary?</span>
              <span className="text-[11px] text-slate-400">Tampilkan tanda Primary badge di tabel</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPrimary(!isPrimary)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                isPrimary ? 'bg-[#05828e]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isPrimary ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
