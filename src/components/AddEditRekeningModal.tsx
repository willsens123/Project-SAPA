import React, { useState, useEffect } from 'react';
import { X, Check, Building2, CreditCard } from 'lucide-react';
import { RekeningItem } from '../types';

interface AddEditRekeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: RekeningItem | null;
  onSave: (item: RekeningItem) => void;
}

const PRESET_COLORS = [
  { label: 'Teal (BCA)', color: '#0f827e' },
  { label: 'Purple (Mandiri)', color: '#8c52ad' },
  { label: 'Blue (BCA/BRI)', color: '#1d4ed8' },
  { label: 'Orange (BNI)', color: '#ea580c' },
  { label: 'Emerald (Syariah)', color: '#059669' },
  { label: 'Slate', color: '#475569' },
];

export const AddEditRekeningModal: React.FC<AddEditRekeningModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [nama, setNama] = useState('');
  const [tipe, setTipe] = useState('Rekening');
  const [nomorRekening, setNomorRekening] = useState('');
  const [atasNama, setAtasNama] = useState('');
  const [keteranganLengkap, setKeteranganLengkap] = useState('');
  const [avatarLetter, setAvatarLetter] = useState('B');
  const [bgColor, setBgColor] = useState('#0f827e');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama);
      setTipe(initialData.tipe || 'Rekening');
      setNomorRekening(initialData.nomorRekening || '');
      setAtasNama(initialData.atasNama || '');
      setKeteranganLengkap(initialData.keteranganLengkap);
      setAvatarLetter(initialData.avatarLetter || initialData.nama.charAt(0).toUpperCase());
      setBgColor(initialData.bgColor || '#0f827e');
    } else {
      setNama('');
      setTipe('Rekening');
      setNomorRekening('0077119888');
      setAtasNama('Yayasan Pelestarian dan Pengembangan Lamrim Nusantara');
      setKeteranganLengkap('');
      setAvatarLetter('B');
      setBgColor('#0f827e');
    }
    setError('');
  }, [initialData, isOpen]);

  // Auto-generate avatar letter when bank name changes if empty or matching first letter
  const handleNamaChange = (val: string) => {
    setNama(val);
    if (!initialData && val.trim().length > 0) {
      setAvatarLetter(val.trim().charAt(0).toUpperCase());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama rekening wajib diisi (misal: BCA 888)');
      return;
    }

    const finalKeterangan =
      keteranganLengkap.trim() ||
      `${nama.split(' ')[0]} ${nomorRekening ? nomorRekening + ' ' : ''}an ${atasNama || 'Yayasan Pelestarian dan Pengembangan Lamrim Nusantara'}`;

    const saved: RekeningItem = {
      id: initialData ? initialData.id : `rek-${Date.now()}`,
      nama: nama.trim(),
      tipe: tipe.trim() || 'Rekening',
      nomorRekening: nomorRekening.trim(),
      atasNama: atasNama.trim(),
      keteranganLengkap: finalKeterangan,
      avatarLetter: (avatarLetter.trim() || nama.charAt(0) || 'B').toUpperCase(),
      bgColor: bgColor || '#0f827e',
    };

    onSave(saved);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#008d91]/10 text-[#008d91] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {initialData ? 'Edit Rekening' : 'Tambah Rekening'}
              </h3>
              <p className="text-xs text-slate-500">
                {initialData
                  ? 'Perbarui data rekening bank'
                  : 'Tambahkan akun rekening bank baru'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600">
              {error}
            </div>
          )}

          {/* Preview Badge */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: bgColor }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-2xs"
              >
                {avatarLetter || 'B'}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">
                  {nama || 'Nama Rekening'}
                </div>
                <div className="text-xs text-slate-400 font-normal">
                  {tipe || 'Rekening'}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Preview Tampilan</span>
          </div>

          {/* Nama Rekening */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Rekening <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => handleNamaChange(e.target.value)}
              placeholder="Contoh: BCA 888, BCA 388, Mandiri"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
              required
            />
          </div>

          {/* Nomor Rekening & Atas Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={nomorRekening}
                onChange={(e) => setNomorRekening(e.target.value)}
                placeholder="Contoh: 0077119888"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Atas Nama
              </label>
              <input
                type="text"
                value={atasNama}
                onChange={(e) => setAtasNama(e.target.value)}
                placeholder="Contoh: Yayasan..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Keterangan Lengkap (Teks Baris Kanan) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Lengkap (Teks Rekening)
            </label>
            <input
              type="text"
              value={keteranganLengkap}
              onChange={(e) => setKeteranganLengkap(e.target.value)}
              placeholder="BCA 0077119888 an Yayasan Pelestarian dan Pengembangan Lamrim Nusantara"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Biarkan kosong jika ingin otomatis menggabungkan Bank, No Rek, dan Atas Nama.
            </p>
          </div>

          {/* Avatar Letter & Warna */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Huruf Avatar (1 Karakter)
              </label>
              <input
                type="text"
                maxLength={2}
                value={avatarLetter}
                onChange={(e) => setAvatarLetter(e.target.value.toUpperCase())}
                placeholder="B"
                className="w-full px-3.5 py-2 text-center text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warna Avatar
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setBgColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                      bgColor === c.color ? 'border-slate-800 scale-110 shadow-xs' : 'border-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#00787c] rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah Rekening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
