import React, { useState, useEffect } from 'react';
import { X, Check, Upload, BookOpen } from 'lucide-react';
import { PosKeuanganItem } from '../posKeuanganData';
import { CoaAccount, INITIAL_COA_LIST } from '../accountingData';

interface AddEditPosKeuanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PosKeuanganItem) => void;
  editingItem?: PosKeuanganItem | null;
  coaList?: CoaAccount[];
}

const COLOR_PALETTE = [
  '#2D3748', // Dark slate (Image row 1 'P')
  '#CF5340', // Coral red (Image row 2 'K')
  '#B0B5B9', // Silver gray (Image row 3 & 4 'O')
  '#008d91', // Teal
  '#3182CE', // Blue
  '#805AD5', // Purple
  '#38A169', // Green
  '#DD6B20', // Orange
];

export const AddEditPosKeuanganModal: React.FC<AddEditPosKeuanganModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  coaList,
}) => {
  const [namaPos, setNamaPos] = useState('');
  const [subTitle, setSubTitle] = useState('Pos YPPLN');
  const [coaNoAkun, setCoaNoAkun] = useState('');
  const [coaNamaAkun, setCoaNamaAkun] = useState('');
  const [saldo, setSaldo] = useState<number>(0);
  const [saldoStr, setSaldoStr] = useState('0');
  const [keterangan, setKeterangan] = useState('-');
  const [iconLetter, setIconLetter] = useState('');
  const [iconBg, setIconBg] = useState('#2D3748');
  const [logoUrl, setLogoUrl] = useState('');

  const availableCoaOptions = React.useMemo(() => {
    const list = coaList && coaList.length > 0 ? coaList : INITIAL_COA_LIST;
    return list.filter((c) => !c.isHeader);
  }, [coaList]);

  useEffect(() => {
    if (editingItem) {
      setNamaPos(editingItem.namaPos || '');
      setSubTitle(editingItem.subTitle || 'Pos YPPLN');
      setCoaNoAkun(editingItem.coaNoAkun || '');
      setCoaNamaAkun(editingItem.coaNamaAkun || '');
      const baseAwal =
        editingItem.saldoAwal !== undefined
          ? editingItem.saldoAwal
          : editingItem.saldo === 3000000000
          ? 0
          : editingItem.saldo || 0;
      setSaldo(baseAwal);
      setSaldoStr(baseAwal ? baseAwal.toLocaleString('id-ID') : '0');
      setKeterangan(editingItem.keterangan || '-');
      setIconLetter(editingItem.iconLetter || '');
      setIconBg(editingItem.iconBg || '#2D3748');
      setLogoUrl(editingItem.logoUrl || '');
    } else {
      setNamaPos('');
      setSubTitle('Pos YPPLN');
      setCoaNoAkun('');
      setCoaNamaAkun('');
      setSaldo(0);
      setSaldoStr('0');
      setKeterangan('-');
      setIconLetter('');
      setIconBg('#2D3748');
      setLogoUrl('');
    }
  }, [editingItem, isOpen]);

  const handleNamaChange = (val: string) => {
    setNamaPos(val);
    if (!editingItem && (!iconLetter || iconLetter.length <= 1)) {
      setIconLetter(val.trim() ? val.trim().charAt(0).toUpperCase() : '');
    }
    // Auto suggest standard COA mapping if not explicitly chosen
    if (!editingItem && !coaNoAkun) {
      const lower = val.toLowerCase().trim();
      if (lower.includes('penerbitan')) {
        setCoaNoAkun('10001');
        setCoaNamaAkun('Kas BCA Penerbitan');
      } else if (lower.includes('retret') || lower.includes('kegiatan dharma') || lower.includes('kegiatan retret')) {
        setCoaNoAkun('10002');
        setCoaNamaAkun('Kas BCA Kegiatan Retret');
      } else if (lower === 'operasional dharma' || (lower.includes('operasional') && !lower.includes('non'))) {
        setCoaNoAkun('10003');
        setCoaNamaAkun('Kas BCA Operasional Dharma');
      } else if (lower.includes('non-dharma') || lower.includes('non dharma')) {
        setCoaNoAkun('10004');
        setCoaNamaAkun('Kas BCA Operasional Non-Dharma');
      }
    }
  };

  const handleSaldoChange = (val: string) => {
    // Keep only numbers
    const clean = val.replace(/\D/g, '');
    const num = parseInt(clean || '0', 10);
    setSaldo(num);
    setSaldoStr(clean ? num.toLocaleString('id-ID') : '');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPos.trim()) return;

    const saved: PosKeuanganItem = {
      id: editingItem?.id || `pos-${Date.now()}`,
      namaPos: namaPos.trim(),
      subTitle: subTitle.trim() || 'Pos YPPLN',
      saldo: saldo || 0,
      saldoAwal: saldo || 0,
      keterangan: keterangan.trim() || '-',
      iconLetter: (iconLetter.trim() || namaPos.trim().charAt(0) || 'P').toUpperCase(),
      iconBg,
      logoUrl: logoUrl.trim() || undefined,
      tipe: 'Pemasukan',
      coaNoAkun: coaNoAkun.trim() || undefined,
      coaNamaAkun: coaNamaAkun.trim() || undefined,
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {editingItem ? 'Edit Pos Keuangan' : 'Tambah Pos Keuangan'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Badge Preview */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xs shrink-0 select-none overflow-hidden"
              style={{ backgroundColor: iconBg }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                iconLetter || (namaPos ? namaPos.charAt(0).toUpperCase() : 'P')
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs text-slate-400 font-medium">Preview Pos Keuangan</span>
              <span className="font-bold text-slate-800 text-sm truncate">
                {namaPos || 'Nama Pos Keuangan'}
              </span>
              <span className="text-xs text-slate-500">{subTitle || 'Pos YPPLN'}</span>
            </div>
          </div>

          {/* Nama Pos */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Pos Keuangan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaPos}
              onChange={(e) => handleNamaChange(e.target.value)}
              placeholder="Contoh: Penerbitan Buku Dharma"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
            />
          </div>

          {/* Sub Title / Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Sub-Judul / Kategori
            </label>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="Contoh: Pos YPPLN"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
            />
          </div>

          {/* Akun COA Terkoneksi */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#008d91]" />
                <span>Akun COA Terkoneksi</span>
              </label>
              {coaNoAkun && (
                <span className="font-mono text-[11px] bg-teal-50 text-[#008d91] font-bold px-2 py-0.5 rounded-md border border-teal-200">
                  COA {coaNoAkun}
                </span>
              )}
            </div>
            <select
              value={coaNoAkun}
              onChange={(e) => {
                const selectedNo = e.target.value;
                setCoaNoAkun(selectedNo);
                const found = availableCoaOptions.find((c) => c.noAkun === selectedNo);
                setCoaNamaAkun(found?.namaAkun || '');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">-- Pilih Akun COA --</option>
              {availableCoaOptions.map((c) => (
                <option key={c.noAkun} value={c.noAkun}>
                  {c.noAkun} - {c.namaAkun} ({c.kelompok})
                </option>
              ))}
            </select>
            {coaNamaAkun && (
              <p className="text-[11px] text-slate-500 mt-1 pl-1">
                Terhubung ke akun: <strong className="text-slate-800">{coaNamaAkun}</strong>
              </p>
            )}
          </div>

          {/* Saldo */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Saldo Awal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={saldoStr}
                onChange={(e) => handleSaldoChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="-"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
            />
          </div>

          {/* Logo Gambar (Opsional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Logo Gambar (Opsional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://contoh.com/logo.png"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
              />
              <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Unggah</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) setLogoUrl(ev.target.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="p-2 text-slate-400 hover:text-red-500 text-xs transition-colors cursor-pointer"
                  title="Hapus Logo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Inisial Huruf Badge & Warna Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Inisial Badge
              </label>
              <input
                type="text"
                maxLength={2}
                value={iconLetter}
                onChange={(e) => setIconLetter(e.target.value.toUpperCase())}
                placeholder="P"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-center text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Warna Badge
              </label>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setIconBg(color)}
                    className="w-6 h-6 rounded-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: color }}
                  >
                    {iconBg === color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#008d91] hover:bg-[#00787c] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
