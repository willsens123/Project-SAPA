import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { PosPemasukanSubJenisMapping } from '../posPemasukanSubJenisData';
import { SubJenisItemSalurItem } from '../types';
import { SubJenisItemDonasiItem } from '../subJenisDonasiData';
import { SubJenisItemAjarItem } from '../subJenisAjarData';
import { PosPemasukanGroup } from '../posPemasukanData';

interface AddEditPosPemasukanSubJenisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mapping: PosPemasukanSubJenisMapping) => void;
  editingItem?: PosPemasukanSubJenisMapping | null;
  subJenisSalurList: SubJenisItemSalurItem[];
  subJenisDonasiList: SubJenisItemDonasiItem[];
  subJenisAjarList: SubJenisItemAjarItem[];
  posPemasukanList: PosPemasukanGroup[];
}

const COLOR_PALETTE = [
  '#008d91', // Teal (Salur)
  '#f59e0b', // Amber/Orange (Donasi)
  '#0ea5e9', // Blue/Cyan (Ajar)
  '#dc2626', // Red
  '#ec4899', // Pink
  '#7c3aed', // Purple
  '#2D3748', // Dark slate (Pos Pemasukan)
  '#CF5340', // Coral
];

export const AddEditPosPemasukanSubJenisModal: React.FC<AddEditPosPemasukanSubJenisModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  subJenisSalurList,
  subJenisDonasiList,
  subJenisAjarList,
  posPemasukanList,
}) => {
  const [sourceModule, setSourceModule] = useState<'S-SALUR' | 'A-AJAR' | 'D-DONASI'>('S-SALUR');
  const [selectedSubJenisId, setSelectedSubJenisId] = useState('');
  const [namaSubJenis, setNamaSubJenis] = useState('');
  const [subTitleSubJenis, setSubTitleSubJenis] = useState('Sub-Jenis Item');
  const [iconLetterSubJenis, setIconLetterSubJenis] = useState('B');
  const [iconBgSubJenis, setIconBgSubJenis] = useState('#008d91');

  const [selectedPosPemasukanId, setSelectedPosPemasukanId] = useState('');
  const [namaPosPemasukan, setNamaPosPemasukan] = useState('');
  const [subTitlePosPemasukan, setSubTitlePosPemasukan] = useState('Pos Pemasukan');
  const [iconLetterPosPemasukan, setIconLetterPosPemasukan] = useState('P');
  const [iconBgPosPemasukan, setIconBgPosPemasukan] = useState('#2D3748');

  const [keterangan, setKeterangan] = useState('-');

  // Reset or populate on open
  useEffect(() => {
    if (editingItem) {
      setSourceModule(
        editingItem.sourceModule === 'OTHER' ? 'S-SALUR' : editingItem.sourceModule
      );
      setSelectedSubJenisId(editingItem.subJenisId);
      setNamaSubJenis(editingItem.namaSubJenis);
      setSubTitleSubJenis(editingItem.subTitleSubJenis || 'Sub-Jenis Item');
      setIconLetterSubJenis(editingItem.iconLetterSubJenis);
      setIconBgSubJenis(editingItem.iconBgSubJenis);

      setSelectedPosPemasukanId(editingItem.posPemasukanId || '');
      setNamaPosPemasukan(editingItem.namaPosPemasukan);
      setSubTitlePosPemasukan(editingItem.subTitlePosPemasukan || 'Pos Pemasukan');
      setIconLetterPosPemasukan(editingItem.iconLetterPosPemasukan);
      setIconBgPosPemasukan(editingItem.iconBgPosPemasukan);
      setKeterangan(editingItem.keterangan || '-');
    } else {
      // Default to first Salur item
      setSourceModule('S-SALUR');
      if (subJenisSalurList.length > 0) {
        const first = subJenisSalurList[0];
        setSelectedSubJenisId(first.id);
        setNamaSubJenis(first.namaSubJenis);
        setSubTitleSubJenis('Sub-Jenis Item');
        setIconLetterSubJenis(first.iconLetter || first.namaSubJenis[0] || 'S');
        setIconBgSubJenis(first.iconBg || '#008d91');
      } else {
        setSelectedSubJenisId('');
        setNamaSubJenis('');
        setSubTitleSubJenis('Sub-Jenis Item');
        setIconLetterSubJenis('S');
        setIconBgSubJenis('#008d91');
      }

      // Default target Pos Pemasukan
      if (posPemasukanList.length > 0) {
        const firstPos = posPemasukanList[0];
        setSelectedPosPemasukanId(firstPos.id);
        setNamaPosPemasukan(firstPos.namaPosPemasukan);
        setSubTitlePosPemasukan('Pos Pemasukan');
        setIconLetterPosPemasukan(firstPos.iconLetter || 'P');
        setIconBgPosPemasukan(firstPos.iconBg || '#2D3748');
      } else {
        setSelectedPosPemasukanId('');
        setNamaPosPemasukan('Pemasukan YPPLN');
        setSubTitlePosPemasukan('Pos Pemasukan');
        setIconLetterPosPemasukan('P');
        setIconBgPosPemasukan('#2D3748');
      }

      setKeterangan('-');
    }
  }, [
    isOpen,
    editingItem,
    subJenisSalurList,
    subJenisDonasiList,
    subJenisAjarList,
    posPemasukanList,
  ]);

  if (!isOpen) return null;

  // Handle switching source module
  const handleModuleChange = (mod: 'S-SALUR' | 'A-AJAR' | 'D-DONASI') => {
    setSourceModule(mod);
    if (mod === 'S-SALUR' && subJenisSalurList.length > 0) {
      const item = subJenisSalurList[0];
      setSelectedSubJenisId(item.id);
      setNamaSubJenis(item.namaSubJenis);
      setIconLetterSubJenis(item.iconLetter || item.namaSubJenis[0] || 'S');
      setIconBgSubJenis(item.iconBg || '#008d91');
    } else if (mod === 'D-DONASI' && subJenisDonasiList.length > 0) {
      const item = subJenisDonasiList[0];
      setSelectedSubJenisId(item.id);
      setNamaSubJenis(item.namaSubJenis);
      setIconLetterSubJenis(item.iconLetter || 'D');
      setIconBgSubJenis(item.iconBg || '#f59e0b');
    } else if (mod === 'A-AJAR' && subJenisAjarList.length > 0) {
      const item = subJenisAjarList[0];
      setSelectedSubJenisId(item.id);
      setNamaSubJenis(item.namaSubJenis);
      setIconLetterSubJenis(item.iconLetter || item.namaSubJenis[0] || 'A');
      setIconBgSubJenis(item.iconBg || '#0ea5e9');
    }
  };

  // Handle selecting sub-jenis item from dropdown
  const handleSelectSubJenis = (id: string) => {
    setSelectedSubJenisId(id);
    if (sourceModule === 'S-SALUR') {
      const found = subJenisSalurList.find((s) => s.id === id);
      if (found) {
        setNamaSubJenis(found.namaSubJenis);
        setIconLetterSubJenis(found.iconLetter || found.namaSubJenis[0] || 'S');
        setIconBgSubJenis(found.iconBg || '#008d91');
      }
    } else if (sourceModule === 'D-DONASI') {
      const found = subJenisDonasiList.find((s) => s.id === id);
      if (found) {
        setNamaSubJenis(found.namaSubJenis);
        setIconLetterSubJenis(found.iconLetter || 'D');
        setIconBgSubJenis(found.iconBg || '#f59e0b');
      }
    } else if (sourceModule === 'A-AJAR') {
      const found = subJenisAjarList.find((s) => s.id === id);
      if (found) {
        setNamaSubJenis(found.namaSubJenis);
        setIconLetterSubJenis(found.iconLetter || found.namaSubJenis[0] || 'A');
        setIconBgSubJenis(found.iconBg || '#0ea5e9');
      }
    }
  };

  // Handle selecting Pos Pemasukan
  const handleSelectPosPemasukan = (val: string) => {
    if (val === '__custom__') {
      setSelectedPosPemasukanId('');
      setNamaPosPemasukan('');
      setSubTitlePosPemasukan('Sub-Jenis Item');
      setIconLetterPosPemasukan('P');
      setIconBgPosPemasukan('#2D3748');
      return;
    }
    const found = posPemasukanList.find((p) => p.id === val);
    if (found) {
      setSelectedPosPemasukanId(found.id);
      setNamaPosPemasukan(found.namaPosPemasukan);
      setSubTitlePosPemasukan(found.subTitle || 'Pos Pemasukan');
      setIconLetterPosPemasukan(found.iconLetter || 'P');
      setIconBgPosPemasukan(found.iconBg || '#2D3748');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSubJenis.trim() || !namaPosPemasukan.trim()) {
      return;
    }

    const mapping: PosPemasukanSubJenisMapping = {
      id: editingItem ? editingItem.id : `psj-${Date.now()}`,
      sourceModule,
      subJenisId: selectedSubJenisId || `sub-${Date.now()}`,
      namaSubJenis: namaSubJenis.trim(),
      subTitleSubJenis: subTitleSubJenis.trim() || 'Sub-Jenis Item',
      iconLetterSubJenis: (iconLetterSubJenis || 'S').trim().toUpperCase(),
      iconBgSubJenis,
      posPemasukanId: selectedPosPemasukanId || undefined,
      namaPosPemasukan: namaPosPemasukan.trim(),
      subTitlePosPemasukan: subTitlePosPemasukan.trim() || 'Pos Pemasukan',
      iconLetterPosPemasukan: (iconLetterPosPemasukan || 'P').trim().toUpperCase(),
      iconBgPosPemasukan,
      keterangan: keterangan.trim() || '-',
    };

    onSave(mapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {editingItem ? 'Ubah Pemetaan Sub-Jenis' : 'Tambah Pemetaan Sub-Jenis Item'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Navigasi pengelompokan pemasukan dari Sub-Jenis Item ke Pos Pemasukan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live Visual Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              Pratinjau Navigasi
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
              {/* Sub-Jenis Preview */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-xs shrink-0"
                  style={{ backgroundColor: iconBgSubJenis }}
                >
                  {iconLetterSubJenis || 'S'}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {namaSubJenis || 'Nama Sub-Jenis Item'}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {subTitleSubJenis || 'Sub-Jenis Item'}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex items-center justify-center text-slate-300">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Pos Pemasukan Preview */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-xs shrink-0"
                  style={{ backgroundColor: iconBgPosPemasukan }}
                >
                  {iconLetterPosPemasukan || 'P'}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {namaPosPemasukan || 'Nama Pos Pemasukan'}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {subTitlePosPemasukan || 'Pos Pemasukan'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Source Module Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Modul Sumber Sub-Jenis Item
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['S-SALUR', 'D-DONASI', 'A-AJAR'] as const).map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => handleModuleChange(mod)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                    sourceModule === mod
                      ? 'bg-[#008d91] text-white border-[#008d91] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Choose Sub-Jenis Item */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              2. Pilih Sub-Jenis Item ({sourceModule})
            </label>

            <select
              value={selectedSubJenisId}
              onChange={(e) => handleSelectSubJenis(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-2 focus:ring-[#008d91]/20 cursor-pointer"
            >
              {sourceModule === 'S-SALUR' &&
                subJenisSalurList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.namaSubJenis} {item.kode ? `(${item.kode})` : ''}
                  </option>
                ))}

              {sourceModule === 'D-DONASI' &&
                subJenisDonasiList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.namaSubJenis} {item.kode ? `(${item.kode})` : ''}
                  </option>
                ))}

              {sourceModule === 'A-AJAR' &&
                subJenisAjarList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.namaSubJenis} {item.kode ? `(${item.kode})` : ''}
                  </option>
                ))}
            </select>

            {/* Custom name adjustment if needed */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Nama Tampilan Sub-Jenis
                </label>
                <input
                  type="text"
                  value={namaSubJenis}
                  onChange={(e) => setNamaSubJenis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Huruf Logo</label>
                <input
                  type="text"
                  maxLength={2}
                  value={iconLetterSubJenis}
                  onChange={(e) => setIconLetterSubJenis(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 text-center font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Choose Target Pos Pemasukan */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              3. Kelompokkan ke Pos Pemasukan Tujuan
            </label>

            <select
              value={selectedPosPemasukanId || '__custom__'}
              onChange={(e) => handleSelectPosPemasukan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:ring-2 focus:ring-[#008d91]/20 cursor-pointer"
            >
              {posPemasukanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.namaPosPemasukan}
                </option>
              ))}
              <option value="__custom__">+ Pos Pemasukan Khusus / Sub-Jenis Mandiri</option>
            </select>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">
                  Nama Pos Pemasukan Tujuan
                </label>
                <input
                  type="text"
                  value={namaPosPemasukan}
                  onChange={(e) => setNamaPosPemasukan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  placeholder="Contoh: Pemasukan YPPLN"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Huruf Logo</label>
                <input
                  type="text"
                  maxLength={2}
                  value={iconLetterPosPemasukan}
                  onChange={(e) => setIconLetterPosPemasukan(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 text-center font-bold"
                  required
                />
              </div>
            </div>

            {/* Subtitle Pos Pemasukan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Sub-label Tujuan</label>
                <select
                  value={subTitlePosPemasukan}
                  onChange={(e) => setSubTitlePosPemasukan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                >
                  <option value="Pos Pemasukan">Pos Pemasukan</option>
                  <option value="Sub-Jenis Item">Sub-Jenis Item</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Warna Badge Pos</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setIconBgPosPemasukan(color)}
                      style={{ backgroundColor: color }}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer shrink-0 ${
                        iconBgPosPemasukan === color ? 'ring-2 ring-offset-1 ring-slate-800 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#008d91] hover:bg-[#00787c] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingItem ? 'Perbarui' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
