import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Upload } from 'lucide-react';
import { PosPemasukanGroup, PosPemasukanAllocation } from '../posPemasukanData';
import { PosKeuanganItem } from '../posKeuanganData';

interface AddEditPosPemasukanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: PosPemasukanGroup) => void;
  editingGroup?: PosPemasukanGroup | null;
  posKeuanganList: PosKeuanganItem[];
}

const COLOR_PALETTE = [
  '#2D3748', // Slate dark
  '#CF5340', // Coral
  '#B0B5B9', // Silver gray
  '#008d91', // Teal
  '#3182CE', // Blue
  '#805AD5', // Purple
  '#38A169', // Green
  '#DD6B20', // Orange
];

export const AddEditPosPemasukanModal: React.FC<AddEditPosPemasukanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGroup,
  posKeuanganList,
}) => {
  const [namaPosPemasukan, setNamaPosPemasukan] = useState('');
  const [subTitle, setSubTitle] = useState('Pos Pemasukan');
  const [iconLetter, setIconLetter] = useState('P');
  const [iconBg, setIconBg] = useState('#2D3748');
  const [logoUrl, setLogoUrl] = useState('');
  const [allocations, setAllocations] = useState<PosPemasukanAllocation[]>([]);

  useEffect(() => {
    if (editingGroup) {
      setNamaPosPemasukan(editingGroup.namaPosPemasukan);
      setSubTitle(editingGroup.subTitle || 'Pos Pemasukan');
      setIconLetter(editingGroup.iconLetter || 'P');
      setIconBg(editingGroup.iconBg || '#2D3748');
      setLogoUrl(editingGroup.logoUrl || '');
      setAllocations(
        editingGroup.allocations.map((a) => ({ ...a }))
      );
    } else {
      setNamaPosPemasukan('');
      setSubTitle('Pos Pemasukan');
      setIconLetter('P');
      setIconBg('#2D3748');
      setLogoUrl('');
      // Default with first available pos keuangan if available
      if (posKeuanganList.length > 0) {
        const first = posKeuanganList[0];
        setAllocations([
          {
            id: `alloc-${Date.now()}-1`,
            posKeuanganId: first.id,
            namaPosKeuangan: first.namaPos,
            subTitle: first.subTitle || 'Pos YPPLN',
            persentase: 100,
            keterangan: '-',
            iconLetter: first.iconLetter,
            iconBg: first.iconBg,
          },
        ]);
      } else {
        setAllocations([]);
      }
    }
  }, [editingGroup, isOpen, posKeuanganList]);

  if (!isOpen) return null;

  const totalPercentage = allocations.reduce((sum, a) => sum + (Number(a.persentase) || 0), 0);

  const handleAddAllocationRow = () => {
    const available = posKeuanganList.find(
      (pk) => !allocations.some((a) => a.posKeuanganId === pk.id)
    ) || posKeuanganList[0];

    if (!available) return;

    const remaining = Math.max(0, 100 - totalPercentage);
    setAllocations([
      ...allocations,
      {
        id: `alloc-${Date.now()}-${allocations.length + 1}`,
        posKeuanganId: available.id,
        namaPosKeuangan: available.namaPos,
        subTitle: available.subTitle || 'Pos YPPLN',
        persentase: remaining > 0 ? remaining : 10,
        keterangan: '-',
        iconLetter: available.iconLetter,
        iconBg: available.iconBg,
      },
    ]);
  };

  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, idx) => idx !== index));
  };

  const handleSelectPosKeuangan = (index: number, posKeuanganId: string) => {
    const selectedPk = posKeuanganList.find((pk) => pk.id === posKeuanganId);
    if (!selectedPk) return;

    setAllocations(
      allocations.map((a, idx) => {
        if (idx === index) {
          return {
            ...a,
            posKeuanganId: selectedPk.id,
            namaPosKeuangan: selectedPk.namaPos,
            subTitle: selectedPk.subTitle || 'Pos YPPLN',
            iconLetter: selectedPk.iconLetter,
            iconBg: selectedPk.iconBg,
          };
        }
        return a;
      })
    );
  };

  const handlePercentageChange = (index: number, val: number) => {
    setAllocations(
      allocations.map((a, idx) => {
        if (idx === index) {
          return {
            ...a,
            persentase: val,
          };
        }
        return a;
      })
    );
  };

  const handleKeteranganChange = (index: number, val: string) => {
    setAllocations(
      allocations.map((a, idx) => {
        if (idx === index) {
          return {
            ...a,
            keterangan: val,
          };
        }
        return a;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPosPemasukan.trim()) return;

    const saved: PosPemasukanGroup = {
      id: editingGroup?.id || `pemasukan-${Date.now()}`,
      namaPosPemasukan: namaPosPemasukan.trim(),
      subTitle: subTitle.trim() || 'Pos Pemasukan',
      iconLetter: (iconLetter.trim() || namaPosPemasukan.trim().charAt(0) || 'P').toUpperCase(),
      iconBg,
      logoUrl: logoUrl.trim() || undefined,
      allocations: allocations.map((a) => ({
        ...a,
        persentase: Number(a.persentase) || 0,
        keterangan: a.keterangan?.trim() || '-',
      })),
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingGroup ? 'Edit Pos Pemasukan' : 'Tambah Pos Pemasukan'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur alokasi uang masuk ke masing-masing Pos Keuangan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Badge Preview */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xs shrink-0 select-none overflow-hidden"
              style={{ backgroundColor: iconBg }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                iconLetter || (namaPosPemasukan ? namaPosPemasukan.charAt(0).toUpperCase() : 'P')
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs text-slate-400 font-medium">Preview Pos Pemasukan</span>
              <span className="font-bold text-slate-800 text-sm truncate">
                {namaPosPemasukan || 'Nama Pos Pemasukan'}
              </span>
              <span className="text-xs text-slate-500">{subTitle || 'Pos Pemasukan'}</span>
            </div>
          </div>

          {/* Nama Pos Pemasukan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Pos Pemasukan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaPosPemasukan}
              onChange={(e) => {
                setNamaPosPemasukan(e.target.value);
                if (!editingGroup && (!iconLetter || iconLetter.length <= 1)) {
                  setIconLetter(e.target.value.trim() ? e.target.value.trim().charAt(0).toUpperCase() : 'P');
                }
              }}
              placeholder="Contoh: Pemasukan YPPLN"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
            />
          </div>

          {/* Logo Gambar (Opsional) */}
          <div className="space-y-2">
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

          {/* Allocations Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Alokasi Ke Pos Keuangan
                </label>
                <span className="text-[11px] text-slate-400">
                  Uang masuk akan dikelompokkan ke Pos Keuangan berikut
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddAllocationRow}
                className="flex items-center gap-1 text-xs font-bold text-[#008d91] hover:text-[#007376] bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tambah Pos</span>
              </button>
            </div>

            {/* Total Percentage Status Bar */}
            <div className="bg-slate-50 rounded-xl p-2.5 mb-3 border border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Total Alokasi:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-bold ${
                    totalPercentage === 100
                      ? 'text-emerald-600'
                      : totalPercentage > 100
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {totalPercentage}%
                </span>
                {totalPercentage === 100 ? (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Pas 100%
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Total disarankan 100%
                  </span>
                )}
              </div>
            </div>

            {/* Allocation Rows */}
            {allocations.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                Belum ada alokasi. Klik "+ Tambah Pos" untuk menghubungkan ke Pos Keuangan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {allocations.map((alloc, idx) => (
                  <div
                    key={alloc.id || idx}
                    className="flex items-center gap-2 p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl"
                  >
                    {/* Badge Preview */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 select-none"
                      style={{ backgroundColor: alloc.iconBg || '#2D3748' }}
                    >
                      {alloc.iconLetter || alloc.namaPosKeuangan.charAt(0).toUpperCase()}
                    </div>

                    {/* Pos Keuangan Selection Dropdown */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={alloc.posKeuanganId}
                        onChange={(e) => handleSelectPosKeuangan(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                      >
                        {posKeuanganList.map((pk) => (
                          <option key={pk.id} value={pk.id}>
                            {pk.namaPos}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Persentase Input */}
                    <div className="w-20 shrink-0 relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={alloc.persentase}
                        onChange={(e) => handlePercentageChange(idx, Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-2 pr-6 py-1.5 text-xs font-bold text-slate-800 text-right focus:outline-none focus:border-[#008d91]"
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold">
                        %
                      </span>
                    </div>

                    {/* Keterangan */}
                    <div className="w-16 shrink-0 hidden sm:block">
                      <input
                        type="text"
                        placeholder="Ket"
                        value={alloc.keterangan || '-'}
                        onChange={(e) => handleKeteranganChange(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 text-center focus:outline-none focus:border-[#008d91]"
                      />
                    </div>

                    {/* Delete row button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllocation(idx)}
                      className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Hapus baris alokasi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
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
