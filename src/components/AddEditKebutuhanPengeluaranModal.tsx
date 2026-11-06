import React, { useState, useEffect } from 'react';
import { X, ListChecks, Hash, Sparkles, BookOpen } from 'lucide-react';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';
import { PosPengeluaranGroup } from '../posPengeluaranData';
import { KelompokBiayaCoaItem } from '../kelompokBiayaCoaData';
import { CoaAccount } from '../accountingData';
import { getNextAvailableKebutuhanCoaNumber, parseCoaRange } from '../kebutuhanPengeluaranCoaHelper';

interface AddEditKebutuhanPengeluaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: KebutuhanPengeluaranItem) => void;
  editingItem?: KebutuhanPengeluaranItem | null;
  posPengeluaranList: PosPengeluaranGroup[];
  kelompokBiayaList: KelompokBiayaCoaItem[];
  existingKebutuhanList?: KebutuhanPengeluaranItem[];
  coaList?: CoaAccount[];
}

export const AddEditKebutuhanPengeluaranModal: React.FC<AddEditKebutuhanPengeluaranModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  posPengeluaranList,
  kelompokBiayaList,
  existingKebutuhanList = [],
  coaList = [],
}) => {
  const [kebutuhan, setKebutuhan] = useState('');
  const [posPengeluaran, setPosPengeluaran] = useState('');
  const [posPengeluaranId, setPosPengeluaranId] = useState('');
  const [kelompokBiaya, setKelompokBiaya] = useState('');
  const [rangeCoa, setRangeCoa] = useState('');
  const [noAkunCoa, setNoAkunCoa] = useState('');
  const [namaAkunCoa, setNamaAkunCoa] = useState('');
  const [isCustomNamaAkun, setIsCustomNamaAkun] = useState(false);
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (editingItem) {
      setKebutuhan(editingItem.kebutuhan);
      setPosPengeluaran(editingItem.posPengeluaran);
      setPosPengeluaranId(editingItem.posPengeluaranId || '');
      setKelompokBiaya(editingItem.kelompokBiaya);
      const targetRange = editingItem.rangeCoa || '60100-60199';
      setRangeCoa(targetRange);
      setNoAkunCoa(editingItem.noAkunCoa || '');
      setNamaAkunCoa(editingItem.namaAkunCoa || editingItem.kebutuhan);
      setIsCustomNamaAkun(
        !!editingItem.namaAkunCoa && editingItem.namaAkunCoa !== editingItem.kebutuhan
      );
      setKeterangan(editingItem.keterangan || '');
    } else {
      setKebutuhan('');
      const defaultPos = posPengeluaranList[0];
      setPosPengeluaran(defaultPos ? defaultPos.namaPosPengeluaran : 'Pengeluaran YPPLN');
      setPosPengeluaranId(defaultPos ? defaultPos.id : '');
      const defaultKel = kelompokBiayaList[0];
      const initialKelompokName = defaultKel ? defaultKel.kelompokBiaya : 'Biaya Operasional';
      const initialRange = defaultKel ? defaultKel.rangeCoa : '60100-60199';
      setKelompokBiaya(initialKelompokName);
      setRangeCoa(initialRange);

      const generatedNo = getNextAvailableKebutuhanCoaNumber(
        initialRange,
        coaList,
        existingKebutuhanList
      );
      setNoAkunCoa(generatedNo);
      setNamaAkunCoa('');
      setIsCustomNamaAkun(false);
      setKeterangan('');
    }
  }, [editingItem, isOpen, posPengeluaranList, kelompokBiayaList, coaList, existingKebutuhanList]);

  if (!isOpen) return null;

  const handlePosChange = (val: string) => {
    const matched = posPengeluaranList.find((p) => p.namaPosPengeluaran === val || p.id === val);
    if (matched) {
      setPosPengeluaran(matched.namaPosPengeluaran);
      setPosPengeluaranId(matched.id);
    } else {
      setPosPengeluaran(val);
      setPosPengeluaranId('');
    }
  };

  const handleKelompokBiayaChange = (val: string) => {
    const matched = kelompokBiayaList.find((k) => k.kelompokBiaya === val || k.id === val);
    const newKelompok = matched ? matched.kelompokBiaya : val;
    const newRange = matched ? matched.rangeCoa : '60100-60199';

    setKelompokBiaya(newKelompok);
    setRangeCoa(newRange);

    // Auto calculate new COA number based on new kelompok range
    const parsed = parseCoaRange(newRange);
    const currentNum = parseInt(noAkunCoa, 10);
    const isStillValid = parsed && !isNaN(currentNum) && currentNum >= parsed.start && currentNum <= parsed.end;

    if (!isStillValid) {
      const nextNo = getNextAvailableKebutuhanCoaNumber(
        newRange,
        coaList,
        existingKebutuhanList,
        editingItem?.id
      );
      setNoAkunCoa(nextNo);
    }
  };

  const handleKebutuhanChange = (val: string) => {
    setKebutuhan(val);
    if (!isCustomNamaAkun) {
      setNamaAkunCoa(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kebutuhan.trim() || !posPengeluaran.trim() || !kelompokBiaya.trim()) return;

    // Finalize COA number within range
    const parsedRange = parseCoaRange(rangeCoa);
    let finalNoAkun = noAkunCoa.trim();
    const num = parseInt(finalNoAkun, 10);
    if (!finalNoAkun || !parsedRange || isNaN(num) || num < parsedRange.start || num > parsedRange.end) {
      finalNoAkun = getNextAvailableKebutuhanCoaNumber(
        rangeCoa,
        coaList,
        existingKebutuhanList,
        editingItem?.id
      );
    }

    const finalNamaAkun = namaAkunCoa.trim() || kebutuhan.trim();

    const item: KebutuhanPengeluaranItem = {
      id: editingItem?.id || `keb-${Date.now()}`,
      kebutuhan: kebutuhan.trim(),
      posPengeluaran: posPengeluaran.trim(),
      posPengeluaranId: posPengeluaranId || undefined,
      kelompokBiaya: kelompokBiaya.trim(),
      rangeCoa: rangeCoa.trim() || undefined,
      noAkunCoa: finalNoAkun,
      namaAkunCoa: finalNamaAkun,
      keterangan: keterangan.trim() || undefined,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#008d91] flex items-center justify-center">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Kebutuhan Pengeluaran' : 'Tambah Kebutuhan Pengeluaran'}
              </h2>
              <p className="text-xs text-slate-500">
                Terkoneksi otomatis dengan Akun COA & Kelompok Biaya
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm overflow-y-auto">
          {/* Kebutuhan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kebutuhan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={kebutuhan}
              onChange={(e) => handleKebutuhanChange(e.target.value)}
              placeholder="Contoh: Gaji, Air PDAM & Internet..."
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Pos Pengeluaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Pos Pengeluaran <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">Dari Master Pos Pengeluaran</span>
            </label>
            <select
              required
              value={posPengeluaran}
              onChange={(e) => handlePosChange(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] cursor-pointer"
            >
              {posPengeluaranList.map((p) => (
                <option key={p.id} value={p.namaPosPengeluaran}>
                  {p.namaPosPengeluaran} ({p.allocations.length} Alokasi)
                </option>
              ))}
            </select>
          </div>

          {/* Kelompok Biaya COA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Kelompok Biaya COA <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-teal-700 font-medium">Menentukan nomor COA</span>
            </label>
            <select
              required
              value={kelompokBiaya}
              onChange={(e) => handleKelompokBiayaChange(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] cursor-pointer font-medium"
            >
              {kelompokBiayaList.map((k) => (
                <option key={k.id} value={k.kelompokBiaya}>
                  {k.kelompokBiaya} [Range COA: {k.rangeCoa}]
                </option>
              ))}
            </select>
          </div>

          {/* COA Auto-Allocation Card */}
          <div className="bg-gradient-to-br from-teal-50/90 to-cyan-50/60 border border-teal-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Akun COA Terhubung (Auto Input)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100/90 text-teal-800 font-bold border border-teal-200">
                Range: {rangeCoa || '-'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-teal-600" />
                  No Akun COA:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={noAkunCoa}
                    onChange={(e) => setNoAkunCoa(e.target.value)}
                    placeholder="Nomor COA..."
                    className="w-full text-xs font-mono font-bold border border-teal-300 rounded-xl px-3 py-2 bg-white text-teal-900 focus:outline-none focus:ring-2 focus:ring-[#008d91]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Otomatis terisi dalam range {rangeCoa}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-teal-600" />
                  Nama Akun COA:
                </label>
                <input
                  type="text"
                  value={namaAkunCoa}
                  onChange={(e) => {
                    setNamaAkunCoa(e.target.value);
                    setIsCustomNamaAkun(true);
                  }}
                  placeholder="Nama Akun COA..."
                  className="w-full text-xs font-medium border border-teal-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008d91]"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Default otomatis mengikuti nama kebutuhan
                </p>
              </div>
            </div>

            <div className="text-[11px] text-teal-800/80 leading-relaxed bg-white/70 rounded-xl p-2 border border-teal-100">
              💡 <strong>Sinkronisasi Otomatis:</strong> Setiap kebutuhan dibuat, akun COA{' '}
              <span className="font-mono font-bold text-teal-900">{noAkunCoa || '...'}</span> akan dibuat
              di Master COA. Jika kebutuhan dihapus, akun COA ikut terhapus. Jika Kelompok Biaya diganti, nomor COA berganti otomatis.
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan tambahan mengenai kebutuhan pengeluaran ini..."
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] resize-none"
            />
          </div>

          {/* Buttons */}
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
