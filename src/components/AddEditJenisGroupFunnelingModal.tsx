import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { JenisGroupFunnelingItem } from '../funnelingData';

interface AddEditJenisGroupFunnelingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    namaJenisGroup: string;
    aktif: boolean;
    uniqueId: boolean;
    keterangan?: string;
  }) => void;
  editingItem?: JenisGroupFunnelingItem | null;
}

export const AddEditJenisGroupFunnelingModal: React.FC<AddEditJenisGroupFunnelingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaJenisGroup, setNamaJenisGroup] = useState('');
  const [aktif, setAktif] = useState(true);
  const [uniqueId, setUniqueId] = useState(true);
  const [keterangan, setKeterangan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaJenisGroup(editingItem.namaJenisGroup);
      setAktif(editingItem.aktif !== false);
      setUniqueId(editingItem.uniqueId !== false);
      setKeterangan(editingItem.keterangan || '');
      setErrorMsg('');
    } else {
      setNamaJenisGroup('');
      setAktif(true);
      setUniqueId(true);
      setKeterangan('');
      setErrorMsg('');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenisGroup.trim()) {
      setErrorMsg('Nama Jenis Group Funneling wajib diisi');
      return;
    }

    onSave({
      namaJenisGroup: namaJenisGroup.trim(),
      aktif,
      uniqueId,
      keterangan: keterangan.trim() || '-',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            {editingItem ? 'Edit Jenis Group Funneling' : 'Tambah Jenis Group Funneling'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Nama Jenis Group */}
          <div>
            <label className="block text-slate-700 font-semibold text-xs sm:text-sm mb-1.5">
              Nama Jenis Group Funneling <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Input Text..."
              value={namaJenisGroup}
              onChange={(e) => {
                setNamaJenisGroup(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] shadow-2xs"
            />
          </div>

          {/* Aktif / Tidak */}
          <div>
            <label className="block text-slate-700 font-semibold text-xs sm:text-sm mb-1.5">
              Aktif / Tidak?
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAktif(true)}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  aktif
                    ? 'bg-[#008d91] text-white border-[#008d91] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {aktif && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>Aktif (Yes)</span>
              </button>
              <button
                type="button"
                onClick={() => setAktif(false)}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !aktif
                    ? 'bg-slate-600 text-white border-slate-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {!aktif && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>Tidak Aktif (No)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Jika "No", data jenis group ini tidak akan muncul pada List Group Funneling.
            </p>
          </div>

          {/* Unique ID? */}
          <div>
            <label className="block text-slate-700 font-semibold text-xs sm:text-sm mb-1.5">
              Unique ID?
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUniqueId(true)}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uniqueId
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {uniqueId && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => setUniqueId(false)}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !uniqueId
                    ? 'bg-slate-600 text-white border-slate-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {!uniqueId && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>No</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Jika "Yes", Identitas ID tidak boleh digunakan lebih dari satu pada jenis group yang sama.
            </p>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-slate-700 font-semibold text-xs sm:text-sm mb-1.5">
              Keterangan
            </label>
            <input
              type="text"
              placeholder="Keterangan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] shadow-2xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#008d91] hover:bg-[#05828e] text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
