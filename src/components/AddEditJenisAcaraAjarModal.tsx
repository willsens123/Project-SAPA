import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { JenisAcaraItemAjarItem } from '../jenisAcaraAjarData';

interface AddEditJenisAcaraAjarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JenisAcaraItemAjarItem) => void;
  editingItem?: JenisAcaraItemAjarItem | null;
}

const COLOR_OPTIONS = [
  { label: 'Slate Gray', value: '#5A6D7C' },
  { label: 'Sky Blue', value: '#0ea5e9' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Red / Coral', value: '#dc2626' },
  { label: 'Teal', value: '#008d91' },
  { label: 'Amber', value: '#f59e0b' },
];

export const AddEditJenisAcaraAjarModal: React.FC<AddEditJenisAcaraAjarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [namaJenisAcara, setNamaJenisAcara] = useState('');
  const [kode, setKode] = useState('');
  const [iconLetter, setIconLetter] = useState('');
  const [iconBg, setIconBg] = useState('#5A6D7C');
  const [keterangan, setKeterangan] = useState('Jenis Acara');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNamaJenisAcara(editingItem.namaJenisAcara);
      setKode(editingItem.kode);
      setIconLetter(editingItem.iconLetter || editingItem.namaJenisAcara.charAt(0).toUpperCase());
      setIconBg(editingItem.iconBg || '#5A6D7C');
      setKeterangan(editingItem.keterangan || 'Jenis Acara');
    } else {
      setNamaJenisAcara('');
      setKode('?');
      setIconLetter('');
      setIconBg('#5A6D7C');
      setKeterangan('Jenis Acara');
    }
    setError('');
  }, [editingItem, isOpen]);

  const handleNameChange = (val: string) => {
    setNamaJenisAcara(val);
    if (!editingItem && (!iconLetter || iconLetter === namaJenisAcara.charAt(0).toUpperCase())) {
      setIconLetter(val.charAt(0).toUpperCase());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenisAcara.trim()) {
      setError('Nama Jenis Acara wajib diisi');
      return;
    }

    const effectiveLetter = (iconLetter.trim() || namaJenisAcara.trim().charAt(0)).toUpperCase();

    const newItem: JenisAcaraItemAjarItem = {
      id: editingItem ? editingItem.id : `jaa-${Date.now()}`,
      namaJenisAcara: namaJenisAcara.trim(),
      kode: kode.trim() || '?',
      pos: '-',
      iconLetter: effectiveLetter,
      iconBg,
      keterangan: keterangan.trim() || 'Jenis Acara',
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-lg shadow-xs"
              style={{ backgroundColor: iconBg }}
            >
              {iconLetter || 'S'}
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                {editingItem ? 'Edit Jenis Acara Item A-AJAR' : 'Tambah Jenis Acara Item A-AJAR'}
              </h2>
              <p className="text-xs text-slate-400">Master Data Jenis Acara A-AJAR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Nama Jenis Acara */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Jenis Acara <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaJenisAcara}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Talkshow, Bedah Buku"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors"
              autoFocus
            />
          </div>

          {/* Kode */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Kode
            </label>
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="Contoh: ?"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors font-mono"
            />
          </div>

          {/* Badge Letter & Color selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Huruf Icon
              </label>
              <input
                type="text"
                maxLength={2}
                value={iconLetter}
                onChange={(e) => setIconLetter(e.target.value.toUpperCase())}
                placeholder="S"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 text-center font-bold outline-hidden focus:border-[#008d91]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Warna Icon
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setIconBg(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-6 h-6 rounded-lg transition-transform ${
                      iconBg === c.value
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Jenis Acara"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#008d91] hover:bg-[#007b7e] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
