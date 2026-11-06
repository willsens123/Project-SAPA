import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar as CalendarIcon, X, Search } from 'lucide-react';
import { DharmaPatronRutinItem } from '../types';
import { formatMonthPickerValue, formatDatePickerValue } from '../utils/datePickerHelper';
import { extractMonthsFromText } from '../utils/dharmaPatronPiutangHelper';

interface EditDonasiBulanModalProps {
  isOpen: boolean;
  item: DharmaPatronRutinItem | null;
  onClose: () => void;
  onSave: (updatedItem: DharmaPatronRutinItem) => void;
  jenisOptions?: string[];
  onNavigateToJenisTable?: () => void;
}

const DEFAULT_JENIS_OPTIONS = [
  'Mengubah nominal',
  'Pemutihan',
  'Berhenti',
];

export const EditDonasiBulanModal: React.FC<EditDonasiBulanModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  jenisOptions,
  onNavigateToJenisTable,
}) => {
  const [jenisPerubahan, setJenisPerubahan] = useState('');
  const [isJenisDropdownOpen, setIsJenisDropdownOpen] = useState(false);
  const [jenisSearchQuery, setJenisSearchQuery] = useState('');

  const activeOptions = (jenisOptions && jenisOptions.length > 0) ? jenisOptions : DEFAULT_JENIS_OPTIONS;

  const [donasiNominal, setDonasiNominal] = useState('');
  const [bulanMulai, setBulanMulai] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const jenisDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item && isOpen) {
      setJenisPerubahan(item.jenisPerubahanDonasi || '');
      if (item.donasiPerbulan) {
        setDonasiNominal(new Intl.NumberFormat('id-ID').format(item.donasiPerbulan));
      } else {
        setDonasiNominal('');
      }
      setBulanMulai(item.bulanMulaiPerubahanDonasi || '');
      setErrorMsg('');
      setIsJenisDropdownOpen(false);
      setIsDatePickerOpen(false);
    }
  }, [item, isOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (jenisDropdownRef.current && !jenisDropdownRef.current.contains(e.target as Node)) {
        setIsJenisDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleDonasiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setDonasiNominal('');
      return;
    }
    const num = parseInt(raw, 10);
    setDonasiNominal(new Intl.NumberFormat('id-ID').format(num));
  };

  const filteredJenis = activeOptions.filter((opt) =>
    opt.toLowerCase().includes(jenisSearchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!donasiNominal.trim()) {
      setErrorMsg('Nominal donasi/bulan harus diisi');
      return;
    }

    const nominalValue = parseInt(donasiNominal.replace(/\D/g, ''), 10) || item.donasiPerbulan;
    const isBerhenti = jenisPerubahan.trim().toLowerCase() === 'berhenti';
    const isPemutihan = jenisPerubahan.trim().toLowerCase().includes('pemutihan');

    let updatedBulanDiputihkan: string[] = item.bulanDiputihkan ? [...item.bulanDiputihkan] : [];
    if (isPemutihan) {
      const monthInput = bulanMulai.trim() || (item.bulanPiutang !== '-' ? item.bulanPiutang : '');
      const extracted = extractMonthsFromText(monthInput);
      if (extracted.length > 0) {
        extracted.forEach((m) => {
          if (!updatedBulanDiputihkan.includes(m)) updatedBulanDiputihkan.push(m);
        });
      } else if (monthInput) {
        if (!updatedBulanDiputihkan.includes(monthInput)) updatedBulanDiputihkan.push(monthInput);
      }
    }

    const updatedItem: DharmaPatronRutinItem = {
      ...item,
      donasiPerbulan: nominalValue,
      jenisPerubahanDonasi: jenisPerubahan.trim() || undefined,
      bulanMulaiPerubahanDonasi: bulanMulai.trim() || undefined,
      bulanDiputihkan: isPemutihan ? updatedBulanDiputihkan : item.bulanDiputihkan,
      statusAktif: isBerhenti ? 'Tidak Aktif' : 'Aktif',
      tanggalBerhenti: isBerhenti ? (bulanMulai.trim() || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })) : undefined,
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl w-full max-w-3xl animate-in fade-in zoom-in-95 duration-150 relative border border-slate-100"
      >
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* 3 Form Rows Exactly Matching image.png */}
        <div className="space-y-6">
          {/* Row 1: Jenis Perubahan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
            <label className="sm:w-60 md:w-64 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
              Jenis Perubahan
            </label>
            <div ref={jenisDropdownRef} className="relative w-full max-w-[360px]">
              <div
                onClick={() => setIsJenisDropdownOpen(!isJenisDropdownOpen)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
              >
                <span className={`text-xs sm:text-sm truncate ${jenisPerubahan ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                  {jenisPerubahan || 'Search...'}
                </span>
                <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs ml-2">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Dropdown Options */}
              {isJenisDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-1 mb-2 border-b border-slate-100 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={jenisSearchQuery}
                      onChange={(e) => setJenisSearchQuery(e.target.value)}
                      placeholder="Cari jenis perubahan..."
                      autoFocus
                      className="w-full text-xs outline-none text-slate-700"
                    />
                    {jenisSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setJenisSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {filteredJenis.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setJenisPerubahan(opt);
                          setIsJenisDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors ${
                          jenisPerubahan === opt ? 'bg-[#008d91]/10 text-[#008d91] font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}

                    {onNavigateToJenisTable && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsJenisDropdownOpen(false);
                          onClose();
                          onNavigateToJenisTable();
                        }}
                        className="w-full text-left px-3 py-2 mt-1 border-t border-slate-100 rounded-xl text-xs text-[#008d91] hover:bg-[#008d91]/5 font-semibold transition-colors flex items-center justify-between"
                      >
                        <span>+ Kelola Jenis Perubahan...</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Donasi/bulan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
            <label className="sm:w-60 md:w-64 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
              Donasi/bulan
            </label>
            <div className="w-full max-w-[360px] bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center shadow-2xs focus-within:border-[#008d91] transition-colors">
              <span className="text-[#008d91] font-bold text-xs sm:text-sm mr-2 select-none">
                Rp
              </span>
              <input
                id="input-edit-donasi-nominal"
                type="text"
                value={donasiNominal}
                onChange={handleDonasiChange}
                placeholder="Input Nominal..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Row 3: Bulan Mulai Perubahan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
            <label className="sm:w-60 md:w-64 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
              Bulan Mulai Perubahan
            </label>
            <div ref={datePickerRef} className="relative w-full max-w-[360px]">
              <div className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs focus-within:border-[#008d91] transition-colors">
                <input
                  id="input-edit-donasi-bulan"
                  type="text"
                  value={bulanMulai}
                  onChange={(e) => setBulanMulai(e.target.value)}
                  placeholder="Input Date..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="text-[#008d91] hover:text-[#04777b] p-0.5 cursor-pointer ml-2"
                  title="Pilih Bulan"
                >
                  <CalendarIcon className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Quick Month Picker */}
              {isDatePickerOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 animate-in fade-in duration-150">
                  <span className="block text-[11px] font-semibold text-slate-400 mb-2">PILIH BULAN</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      'Jan 2021', 'Feb 2021', 'Mar 2021',
                      'Apr 2021', 'Mei 2021', 'Jun 2021',
                      'Jul 2021', 'Agu 2021', 'Sep 2021',
                      'Okt 2021', 'Nov 2021', 'Des 2021',
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setBulanMulai(m);
                          setIsDatePickerOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#008d91]/10 hover:text-[#008d91] text-slate-700 transition-colors text-center"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <span className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Tanggal / Bulan Lain:</span>
                    <input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) {
                          setBulanMulai(formatDatePickerValue(e.target.value));
                          setIsDatePickerOpen(false);
                        }
                      }}
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons Matching image.png: Cancel & Save rounded pill buttons on bottom right */}
        <div className="flex items-center justify-end gap-4 mt-10 sm:mt-12">
          <button
            id="btn-cancel-edit-donasi"
            type="button"
            onClick={onClose}
            className="rounded-full px-8 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            id="btn-save-edit-donasi"
            type="button"
            onClick={handleSave}
            className="rounded-full px-8 py-2 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white text-sm font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
