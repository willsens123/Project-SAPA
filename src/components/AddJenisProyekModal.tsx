import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { JenisProyekItem } from '../types';
import { CoaAccount } from '../accountingData';
import { getNextAvailableJenisProyekCoaNumber } from '../jenisProyekCoaHelper';

interface AddJenisProyekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: {
    jenisKegiatan: string;
    keterangan: string;
    isCoa: boolean;
    coaCode?: string;
    coaName?: string;
  }) => void;
  editingItem?: JenisProyekItem | null;
  coaList?: CoaAccount[];
  existingJenisProyek?: JenisProyekItem[];
}

export const AddJenisProyekModal: React.FC<AddJenisProyekModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  coaList = [],
  existingJenisProyek = [],
}) => {
  const [jenisKegiatan, setJenisKegiatan] = useState('');
  const [keterangan, setKeterangan] = useState('-');
  const [isCoa, setIsCoa] = useState(false);
  const [coaCode, setCoaCode] = useState('');
  const [coaName, setCoaName] = useState('');
  const [isCustomCoaName, setIsCustomCoaName] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setJenisKegiatan(editingItem.jenisKegiatan);
      setKeterangan(editingItem.keterangan || '-');
      const hasCoa = !!editingItem.isCoa;
      setIsCoa(hasCoa);

      let initialCode = editingItem.coaCode;
      if (!initialCode || initialCode === '10100 - 10299') {
        initialCode = getNextAvailableJenisProyekCoaNumber(
          coaList,
          existingJenisProyek.filter((jp) => jp.id !== editingItem.id)
        );
      }
      setCoaCode(initialCode);
      setCoaName(editingItem.coaName || editingItem.jenisKegiatan);
      setIsCustomCoaName(
        !!editingItem.coaName && editingItem.coaName !== editingItem.jenisKegiatan
      );
    } else {
      setJenisKegiatan('');
      setKeterangan('-');
      setIsCoa(false);
      const nextCode = getNextAvailableJenisProyekCoaNumber(
        coaList,
        existingJenisProyek
      );
      setCoaCode(nextCode);
      setCoaName('');
      setIsCustomCoaName(false);
    }
  }, [editingItem, isOpen]);

  // When user types in Jenis Kegiatan, sync coaName if user hasn't customized it
  const handleJenisKegiatanChange = (val: string) => {
    setJenisKegiatan(val);
    if (!isCustomCoaName) {
      setCoaName(val);
    }
  };

  const handleToggleCoa = (checked: boolean) => {
    setIsCoa(checked);
    if (checked && (!coaCode || coaCode === '10100 - 10299')) {
      const next = getNextAvailableJenisProyekCoaNumber(
        coaList,
        existingJenisProyek.filter((jp) => jp.id !== editingItem?.id)
      );
      setCoaCode(next);
      if (!coaName) {
        setCoaName(jenisKegiatan);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisKegiatan.trim()) return;

    let finalCoaCode: string | undefined = undefined;
    let finalCoaName: string | undefined = undefined;

    if (isCoa) {
      finalCoaCode =
        coaCode.trim() ||
        getNextAvailableJenisProyekCoaNumber(
          coaList,
          existingJenisProyek.filter((jp) => jp.id !== editingItem?.id)
        );
      finalCoaName = (coaName.trim() || jenisKegiatan.trim());
    }

    onSave({
      jenisKegiatan: jenisKegiatan.trim(),
      keterangan: keterangan.trim() || '-',
      isCoa,
      coaCode: finalCoaCode,
      coaName: finalCoaName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingItem ? 'Edit Jenis Proyek' : 'Tambah Jenis Proyek'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data jenis proyek beserta integrasi otomatis Akun COA Aktiva
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Jenis Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-jenis-kegiatan"
              type="text"
              required
              autoFocus
              value={jenisKegiatan}
              onChange={(e) => handleJenisKegiatanChange(e.target.value)}
              placeholder="Contoh: Donasi Buku Berbayar, Patron Non-Rutin..."
              className="w-full h-10 px-3.5 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Keterangan
            </label>
            <input
              id="input-keterangan-jenis-proyek"
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Input keterangan atau '-'..."
              className="w-full h-10 px-3.5 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors"
            />
          </div>

          {/* Kolom COA */}
          <div className="pt-2">
            <div className="flex items-center justify-between pb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                COA (Chart of Accounts)
              </label>
              {isCoa ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#e6f4f5] text-[#05828e] border border-[#bce2e5]">
                  <ShieldCheck className="w-3 h-3" /> Aktiva 10101 - 10299
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Tanpa Akun COA
                </span>
              )}
            </div>

            <div className={`border rounded-xl p-4 transition-all ${
              isCoa
                ? 'bg-[#f7fcfc] border-[#bce2e5]'
                : 'bg-slate-50/80 border-slate-200'
            }`}>
              <label
                htmlFor="checkbox-coa-jenis-proyek"
                className="flex items-start gap-3 cursor-pointer select-none group"
              >
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    id="checkbox-coa-jenis-proyek"
                    type="checkbox"
                    checked={isCoa}
                    onChange={(e) => handleToggleCoa(e.target.checked)}
                    className="w-4 h-4 text-[#05828e] border-slate-300 rounded focus:ring-[#05828e] cursor-pointer"
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 group-hover:text-[#05828e] transition-colors flex items-center gap-1.5">
                    COA di Checklist (Memiliki Akun Aktiva COA Tersendiri)
                  </span>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">
                    Setiap Jenis Proyek yang memiliki COA akan otomatis di-inputkan nomor akun & nama akun Aktiva COA tersendiri (10101-10299) ke Master COA.
                  </p>
                </div>
              </label>

              {isCoa && (
                <div className="mt-3.5 pt-3.5 border-t border-[#d1edef] space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        No. Akun COA <span className="text-[#05828e]">(Auto)</span>
                      </label>
                      <input
                        id="input-coa-code"
                        type="text"
                        value={coaCode}
                        onChange={(e) => setCoaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="10101"
                        className="w-full h-9 px-3 bg-white border border-[#bce2e5] font-mono font-bold text-[#05828e] rounded-lg text-xs focus:outline-none focus:border-[#05828e] shadow-2xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Akun Aktiva COA
                      </label>
                      <input
                        id="input-coa-name"
                        type="text"
                        value={coaName}
                        onChange={(e) => {
                          setCoaName(e.target.value);
                          setIsCustomCoaName(true);
                        }}
                        placeholder="Nama Akun Aktiva COA..."
                        className="w-full h-9 px-3 bg-white border border-[#bce2e5] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#05828e] shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#05828e] bg-white/80 p-2.5 rounded-lg border border-[#bce2e5]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Otomatis di-input ke Master COA saat disimpan. Jika Jenis Proyek dihapus, akun COA <strong>{coaCode || '1010x'}</strong> juga ikut dihapus otomatis.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="btn-cancel-jenis-proyek"
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-jenis-proyek"
              type="submit"
              className="px-6 py-2 bg-[#05828e] hover:bg-[#046c76] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Simpan Jenis Proyek
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
