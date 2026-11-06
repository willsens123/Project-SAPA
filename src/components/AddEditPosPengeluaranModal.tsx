import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Upload } from 'lucide-react';
import { PosPengeluaranGroup, PosPengeluaranAllocation } from '../posPengeluaranData';
import { PosKeuanganItem } from '../posKeuanganData';

interface AddEditPosPengeluaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: PosPengeluaranGroup) => void;
  editingGroup?: PosPengeluaranGroup | null;
  posKeuanganList: PosKeuanganItem[];
}

const COLOR_PALETTE = [
  '#2D3748',
  '#CF5340',
  '#B0B5B9',
  '#008d91',
  '#3182CE',
  '#805AD5',
  '#38A169',
  '#DD6B20',
];

export const AddEditPosPengeluaranModal: React.FC<AddEditPosPengeluaranModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGroup,
  posKeuanganList,
}) => {
  const [namaPosPengeluaran, setNamaPosPengeluaran] = useState('');
  const [subTitle, setSubTitle] = useState('Pos Pengeluaran');
  const [iconLetter, setIconLetter] = useState('P');
  const [iconBg, setIconBg] = useState('#2D3748');
  const [logoUrl, setLogoUrl] = useState('');
  const [allocations, setAllocations] = useState<PosPengeluaranAllocation[]>([]);

  useEffect(() => {
    if (editingGroup) {
      setNamaPosPengeluaran(editingGroup.namaPosPengeluaran);
      setSubTitle(editingGroup.subTitle || 'Pos Pengeluaran');
      setIconLetter(editingGroup.iconLetter || 'P');
      setIconBg(editingGroup.iconBg || '#2D3748');
      setLogoUrl(editingGroup.logoUrl || '');
      setAllocations(editingGroup.allocations.map((a) => ({ ...a })));
    } else {
      setNamaPosPengeluaran('');
      setSubTitle('Pos Pengeluaran');
      setIconLetter('P');
      setIconBg('#2D3748');
      setLogoUrl('');
      if (posKeuanganList.length > 0) {
        const first = posKeuanganList[0];
        setAllocations([
          {
            id: `alloc-out-${Date.now()}-1`,
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
        id: `alloc-out-${Date.now()}-${allocations.length + 1}`,
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

  const handleRemoveAllocation = (allocId: string) => {
    setAllocations(allocations.filter((a) => a.id !== allocId));
  };

  const handleAllocationPosChange = (allocId: string, newPosKeuanganId: string) => {
    const target = posKeuanganList.find((pk) => pk.id === newPosKeuanganId);
    if (!target) return;

    setAllocations(
      allocations.map((a) => {
        if (a.id === allocId) {
          return {
            ...a,
            posKeuanganId: target.id,
            namaPosKeuangan: target.namaPos,
            subTitle: target.subTitle || 'Pos YPPLN',
            iconLetter: target.iconLetter,
            iconBg: target.iconBg,
          };
        }
        return a;
      })
    );
  };

  const handleAllocationPercentChange = (allocId: string, value: string) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setAllocations(
      allocations.map((a) => (a.id === allocId ? { ...a, persentase: num } : a))
    );
  };

  const handleAllocationKeteranganChange = (allocId: string, val: string) => {
    setAllocations(
      allocations.map((a) => (a.id === allocId ? { ...a, keterangan: val } : a))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPosPengeluaran.trim()) return;

    if (allocations.length === 0) {
      alert('Tambahkan minimal 1 alokasi ke Pos Keuangan.');
      return;
    }

    if (totalPercentage !== 100) {
      const confirmSave = window.confirm(
        `Total persentase saat ini adalah ${totalPercentage}%. Disarankan 100%. Tetap simpan?`
      );
      if (!confirmSave) return;
    }

    const group: PosPengeluaranGroup = {
      id: editingGroup?.id || `pengeluaran-${Date.now()}`,
      namaPosPengeluaran: namaPosPengeluaran.trim(),
      subTitle: subTitle.trim() || 'Pos Pengeluaran',
      iconLetter: iconLetter.trim().charAt(0).toUpperCase() || 'P',
      iconBg: iconBg,
      logoUrl: logoUrl.trim() || undefined,
      allocations: allocations,
    };

    onSave(group);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingGroup ? 'Edit Pos Pengeluaran' : 'Tambah Pos Pengeluaran'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur nama Pos Pengeluaran dan pembagian alokasi persentase ke Pos Keuangan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm overflow-y-auto flex-1">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pos Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaPosPengeluaran}
                  onChange={(e) => {
                    setNamaPosPengeluaran(e.target.value);
                    if (!editingGroup && (!iconLetter || iconLetter.length <= 1)) {
                      setIconLetter(e.target.value.trim().charAt(0).toUpperCase() || 'P');
                    }
                  }}
                  placeholder="Contoh: Pengeluaran YPPLN"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-Judul
                </label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="Pos Pengeluaran"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
                />
              </div>
            </div>

            {/* Avatar / Icon Setup */}
            <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 mb-2">Preview Logo</span>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden mb-3"
                style={{ backgroundColor: iconBg }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  iconLetter || 'P'
                )}
              </div>

              <div className="w-full flex items-center gap-1.5 justify-center mb-2">
                <input
                  type="text"
                  maxLength={2}
                  value={iconLetter}
                  onChange={(e) => setIconLetter(e.target.value.toUpperCase())}
                  title="Inisial huruf ikon"
                  className="w-12 text-center text-xs font-bold border border-slate-200 rounded-lg py-1 bg-white outline-none focus:border-[#008d91]"
                />
                <label className="px-2 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Foto
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                {COLOR_PALETTE.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setIconBg(c)}
                    className={`w-5 h-5 rounded-md transition-transform cursor-pointer ${
                      iconBg === c ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Allocation Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Alokasi ke Pos Keuangan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tentukan pos keuangan mana saja yang menerima potongan dana pengeluaran ini
                </p>
              </div>
              <div
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  totalPercentage === 100
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                Total: {totalPercentage}% {totalPercentage === 100 ? '✓' : '(Ideal 100%)'}
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {allocations.map((alloc, idx) => (
                <div
                  key={alloc.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all"
                >
                  <span className="w-5 text-center text-xs font-bold text-slate-400">
                    {idx + 1}.
                  </span>

                  {/* Dropdown Pos Keuangan */}
                  <div className="flex-1">
                    <select
                      value={alloc.posKeuanganId}
                      onChange={(e) => handleAllocationPosChange(alloc.id, e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:border-[#008d91] outline-none font-semibold text-slate-800"
                    >
                      {posKeuanganList.map((pk) => (
                        <option key={pk.id} value={pk.id}>
                          {pk.namaPos} ({pk.subTitle || 'Pos YPPLN'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Persentase */}
                  <div className="w-24 flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={alloc.persentase}
                      onChange={(e) => handleAllocationPercentChange(alloc.id, e.target.value)}
                      className="w-full text-center text-xs border border-slate-200 rounded-lg py-1.5 bg-white focus:border-[#008d91] outline-none font-bold text-[#008d91]"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>

                  {/* Keterangan */}
                  <div className="w-32 hidden sm:block">
                    <input
                      type="text"
                      placeholder="Keterangan..."
                      value={alloc.keterangan || ''}
                      onChange={(e) => handleAllocationKeteranganChange(alloc.id, e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:border-[#008d91] outline-none text-slate-600"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveAllocation(alloc.id)}
                    disabled={allocations.length === 1}
                    className={`p-1.5 rounded-lg transition-colors ${
                      allocations.length === 1
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                    }`}
                    title="Hapus baris alokasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddAllocationRow}
              className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-[#008d91] rounded-xl text-xs font-semibold text-slate-600 hover:text-[#008d91] transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-slate-50/40 hover:bg-teal-50/20"
            >
              <Plus className="w-4 h-4" /> Tambah Alokasi Pos Keuangan
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100 shrink-0">
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
              Simpan Pos Pengeluaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
