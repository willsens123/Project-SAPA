import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { KelompokBiayaCoaItem } from '../kelompokBiayaCoaData';

interface AddEditKelompokBiayaCoaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: KelompokBiayaCoaItem) => void;
  editingItem?: KelompokBiayaCoaItem | null;
}

export const AddEditKelompokBiayaCoaModal: React.FC<AddEditKelompokBiayaCoaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [rangeCoa, setRangeCoa] = useState('');
  const [kelompokBiaya, setKelompokBiaya] = useState('');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (editingItem) {
      setRangeCoa(editingItem.rangeCoa);
      setKelompokBiaya(editingItem.kelompokBiaya);
      setKeterangan(editingItem.keterangan || '');
    } else {
      setRangeCoa('');
      setKelompokBiaya('');
      setKeterangan('');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rangeCoa.trim() || !kelompokBiaya.trim()) return;

    const item: KelompokBiayaCoaItem = {
      id: editingItem?.id || `kbc-${Date.now()}`,
      rangeCoa: rangeCoa.trim(),
      kelompokBiaya: kelompokBiaya.trim(),
      keterangan: keterangan.trim() || undefined,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#008d91] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Kelompok Biaya COA' : 'Tambah Kelompok Biaya COA'}
              </h2>
              <p className="text-xs text-slate-500">
                Hubungkan rentang nomor akun COA dengan klasifikasi biaya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Range COA <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={rangeCoa}
              onChange={(e) => setRangeCoa(e.target.value)}
              placeholder="Contoh: 60100-60199"
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Format rentang akun, misal: <code>60100-60199</code> atau <code>50100-50199</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kelompok Biaya <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={kelompokBiaya}
              onChange={(e) => setKelompokBiaya(e.target.value)}
              placeholder="Contoh: Biaya Operasional"
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan tambahan mengenai jenis biaya ini..."
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
