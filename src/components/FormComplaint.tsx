import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  Calendar as CalendarIcon,
  Check,
  X,
} from 'lucide-react';
import { ComplaintItem } from '../types';
import { JENIS_KOMPLAIN_OPTIONS } from '../complaintData';
import { IdentitasItem } from '../identitasData';
import { formatDatePickerValue } from '../utils/datePickerHelper';

interface FormComplaintProps {
  onCancel: () => void;
  onSave: (item: ComplaintItem) => void;
  editingItem?: ComplaintItem | null;
  identitasList?: IdentitasItem[];
  onShowToast?: (msg: string) => void;
}

export const FormComplaint: React.FC<FormComplaintProps> = ({
  onCancel,
  onSave,
  editingItem,
  identitasList = [],
  onShowToast = (_msg: string) => {},
}) => {
  // Form fields
  const [identitasSearch, setIdentitasSearch] = useState('');
  const [selectedIdentitasId, setSelectedIdentitasId] = useState<string | undefined>(undefined);
  const [selectedKodeDonatur, setSelectedKodeDonatur] = useState<string | undefined>(undefined);
  const [selectedNama, setSelectedNama] = useState('');
  const [selectedSubNama, setSelectedSubNama] = useState('');
  const [isIdentitasDropdownOpen, setIsIdentitasDropdownOpen] = useState(false);

  const [tanggal, setTanggal] = useState('15 Nov 2021');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [jenisKomplain, setJenisKomplain] = useState('');
  const [jenisKomplainSearch, setJenisKomplainSearch] = useState('');
  const [isJenisDropdownOpen, setIsJenisDropdownOpen] = useState(false);

  const [komplain, setKomplain] = useState('');
  const [status, setStatus] = useState<'Open' | 'Diproses' | 'Selesai'>('Open');
  const [error, setError] = useState('');

  // Top toolbar state
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);

  const identitasRef = useRef<HTMLDivElement | null>(null);
  const jenisRef = useRef<HTMLDivElement | null>(null);
  const dateRef = useRef<HTMLDivElement | null>(null);
  const dateInputNativeRef = useRef<HTMLInputElement | null>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (identitasRef.current && !identitasRef.current.contains(e.target as Node)) {
        setIsIdentitasDropdownOpen(false);
      }
      if (jenisRef.current && !jenisRef.current.contains(e.target as Node)) {
        setIsJenisDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Hydrate on edit or new
  useEffect(() => {
    if (editingItem) {
      const fullDisplay = editingItem.kodeDonatur
        ? `${editingItem.kodeDonatur} ${editingItem.nama}`
        : editingItem.nama;
      setIdentitasSearch(fullDisplay);
      setSelectedKodeDonatur(editingItem.kodeDonatur);
      setSelectedNama(editingItem.nama);
      setSelectedSubNama(editingItem.subNama || '');
      setSelectedIdentitasId(editingItem.identitasId);
      setTanggal(editingItem.tanggal || '15 Nov 2021');
      setJenisKomplain(editingItem.jenisKomplain || 'Medsos');
      setJenisKomplainSearch(editingItem.jenisKomplain || 'Medsos');
      setKomplain(editingItem.komplain || '');
      setStatus(editingItem.status || 'Open');
    } else {
      setIdentitasSearch('');
      setSelectedKodeDonatur(undefined);
      setSelectedNama('');
      setSelectedSubNama('');
      setSelectedIdentitasId(undefined);
      setTanggal('15 Nov 2021');
      setJenisKomplain('');
      setJenisKomplainSearch('');
      setKomplain('');
      setStatus('Open');
    }
    setError('');
  }, [editingItem]);

  // Filtered identitas options
  const filteredIdentitas = useMemo(() => {
    if (!identitasSearch.trim()) return identitasList;
    const q = identitasSearch.toLowerCase();
    return identitasList.filter(
      (it) =>
        it.namaLengkap.toLowerCase().includes(q) ||
        (it.namaPanggilan && it.namaPanggilan.toLowerCase().includes(q)) ||
        (it.codeId && it.codeId.toLowerCase().includes(q)) ||
        (it.nomorIdentitas && it.nomorIdentitas.toLowerCase().includes(q))
    );
  }, [identitasList, identitasSearch]);

  // Filtered jenis komplain options
  const filteredJenisKomplain = useMemo(() => {
    if (!jenisKomplainSearch.trim()) return JENIS_KOMPLAIN_OPTIONS;
    const q = jenisKomplainSearch.toLowerCase();
    return JENIS_KOMPLAIN_OPTIONS.filter((j) => j.toLowerCase().includes(q));
  }, [jenisKomplainSearch]);

  const handleSelectIdentitas = (it: IdentitasItem) => {
    const code = it.codeId || it.id;
    const fullName = `${code} ${it.namaLengkap}`;
    setIdentitasSearch(fullName);
    setSelectedIdentitasId(code);
    setSelectedKodeDonatur(code);
    setSelectedNama(it.namaLengkap);
    setSelectedSubNama(it.namaPanggilan || it.namaLengkap.split(' ')[0]);
    setIsIdentitasDropdownOpen(false);
    setError('');
  };

  const handleSelectJenis = (j: string) => {
    setJenisKomplain(j);
    setJenisKomplainSearch(j);
    setIsJenisDropdownOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nameToUse = selectedNama.trim() || identitasSearch.trim();
    if (!nameToUse) {
      setError('ID Identitas / Donatur wajib diisi');
      onShowToast('Mohon pilih atau isi ID Identitas');
      return;
    }

    if (!komplain.trim()) {
      setError('Komplain wajib diisi');
      onShowToast('Mohon isi catatan komplain');
      return;
    }

    const firstChar = (nameToUse.replace(/^[\d\s]+/, '') || nameToUse).charAt(0).toUpperCase();
    const palette = ['#008d91', '#05828e', '#0f766e', '#14b8a6', '#eab308', '#64748b', '#8b5cf6'];
    const chosenBg =
      editingItem?.avatarBg || palette[Math.floor(Math.random() * palette.length)];

    const chosenJenis = jenisKomplain.trim() || jenisKomplainSearch.trim() || 'Medsos';

    if (editingItem) {
      const updatedItem: ComplaintItem = {
        ...editingItem,
        tanggal: tanggal.trim() || '15 Nov 2021',
        nama: nameToUse,
        kodeDonatur: selectedKodeDonatur || undefined,
        subNama: selectedSubNama || undefined,
        avatarLetter: firstChar || 'A',
        avatarBg: chosenBg,
        jenisKomplain: chosenJenis,
        komplain: komplain.trim(),
        status,
        identitasId: selectedIdentitasId || undefined,
      };
      onSave(updatedItem);
      onShowToast(`Komplain untuk ${nameToUse} berhasil diperbarui`);
    } else {
      const newItem: ComplaintItem = {
        id: `complaint-${Date.now()}`,
        tanggal: tanggal.trim() || '15 Nov 2021',
        nama: nameToUse,
        kodeDonatur: selectedKodeDonatur || undefined,
        subNama: selectedSubNama || undefined,
        avatarLetter: firstChar || 'A',
        avatarBg: chosenBg,
        jenisKomplain: chosenJenis,
        komplain: komplain.trim(),
        status,
        identitasId: selectedIdentitasId || undefined,
      };
      onSave(newItem);
      onShowToast(`Komplain untuk ${nameToUse} berhasil ditambahkan`);
    }

    onCancel();
  };

  return (
    <div className="w-full flex flex-col gap-4 text-slate-800 animate-in fade-in duration-200">
      {/* Top Action Toolbar matching Form Transaksi S-SALUR and Form Identitas */}
      <div className="flex items-center justify-end gap-3 mb-2">
        {/* EyeOff Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsPrivacyMasked(!isPrivacyMasked);
            onShowToast(!isPrivacyMasked ? 'Mode privasi diaktifkan' : 'Mode privasi dinonaktifkan');
          }}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title={isPrivacyMasked ? 'Tampilkan Data' : 'Sembunyikan Data'}
        >
          {isPrivacyMasked ? (
            <Eye className="w-5 h-5 stroke-[1.8]" />
          ) : (
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          )}
        </button>

        {/* Search Icon */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('form-complaint-identitas-input');
            el?.focus();
          }}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Fokus ID Identitas"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* SlidersHorizontal Icon */}
        <button
          type="button"
          onClick={() => setIsJenisDropdownOpen(!isJenisDropdownOpen)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isJenisDropdownOpen
              ? 'text-[#008d91] bg-teal-50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title="Pilih Jenis Komplain"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button in Top Toolbar */}
        <button
          id="btn-form-add-complaint"
          type="button"
          onClick={() => handleSubmit()}
          title="Simpan Komplain"
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Form Container matching Transaksi S-SALUR and Identitas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 flex flex-col gap-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 animate-in fade-in max-w-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. ID Identitas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            <label className="md:col-span-3 text-sm text-slate-700 font-normal">
              ID Identitas
            </label>
            <div className="md:col-span-9 max-w-xl relative" ref={identitasRef}>
              <div
                onClick={() => setIsIdentitasDropdownOpen(true)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all focus-within:border-[#008d91] focus-within:ring-1 focus-within:ring-[#008d91]"
              >
                <input
                  id="form-complaint-identitas-input"
                  type="text"
                  value={isPrivacyMasked && identitasSearch ? '••••••••' : identitasSearch}
                  onChange={(e) => {
                    setIdentitasSearch(e.target.value);
                    setSelectedNama(e.target.value);
                  }}
                  onFocus={() => setIsIdentitasDropdownOpen(true)}
                  placeholder="Search..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent cursor-pointer"
                />
                <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs pointer-events-none">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Identitas Dropdown Popover */}
              {isIdentitasDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-40 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Daftar Identitas / Donatur
                  </div>
                  {filteredIdentitas.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400 italic">
                      Tidak ada data identitas yang cocok
                    </div>
                  ) : (
                    filteredIdentitas.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => handleSelectIdentitas(it)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                          selectedIdentitasId === (it.codeId || it.id)
                            ? 'text-[#008d91] bg-teal-50'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-800">
                            {it.codeId || it.id} {it.namaLengkap}
                          </div>
                          {it.namaPanggilan && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              Panggilan: {it.namaPanggilan}
                            </div>
                          )}
                        </div>
                        {selectedIdentitasId === (it.codeId || it.id) && (
                          <Check className="w-3.5 h-3.5 text-[#008d91]" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            <label className="md:col-span-3 text-sm text-slate-700 font-normal">
              Tanggal
            </label>
            <div className="md:col-span-9 max-w-xl relative" ref={dateRef}>
              <div
                onClick={() => {
                  if (dateInputNativeRef.current) {
                    try {
                      dateInputNativeRef.current.showPicker?.();
                    } catch {
                      setIsDatePickerOpen(!isDatePickerOpen);
                    }
                  } else {
                    setIsDatePickerOpen(!isDatePickerOpen);
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-slate-300 transition-all focus-within:border-[#008d91] focus-within:ring-1 focus-within:ring-[#008d91] cursor-pointer"
              >
                <input
                  id="form-complaint-tanggal-input"
                  type="text"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  placeholder="Input Date..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent cursor-pointer"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dateInputNativeRef.current) {
                      try {
                        dateInputNativeRef.current.showPicker?.();
                      } catch {
                        setIsDatePickerOpen(!isDatePickerOpen);
                      }
                    } else {
                      setIsDatePickerOpen(!isDatePickerOpen);
                    }
                  }}
                  className="text-[#008d91] hover:text-[#05828e] flex items-center justify-center shrink-0 ml-2 cursor-pointer"
                  title="Pilih Tanggal"
                >
                  <CalendarIcon className="w-4 h-4 text-[#008d91]" />
                </button>
              </div>

              {/* Hidden native date input for browser datepicker trigger */}
              <input
                ref={dateInputNativeRef}
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    setTanggal(formatDatePickerValue(e.target.value));
                  }
                }}
              />
            </div>
          </div>

          {/* 3. Jenis Komplain */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            <label className="md:col-span-3 text-sm text-slate-700 font-normal">
              Jenis Komplain
            </label>
            <div className="md:col-span-9 max-w-xl relative" ref={jenisRef}>
              <div
                onClick={() => setIsJenisDropdownOpen(true)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all focus-within:border-[#008d91] focus-within:ring-1 focus-within:ring-[#008d91]"
              >
                <input
                  id="form-complaint-jenis-input"
                  type="text"
                  value={isJenisDropdownOpen ? jenisKomplainSearch : jenisKomplain}
                  onChange={(e) => {
                    setJenisKomplainSearch(e.target.value);
                    setJenisKomplain(e.target.value);
                  }}
                  onFocus={() => setIsJenisDropdownOpen(true)}
                  placeholder="Search..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent cursor-pointer"
                />
                <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs pointer-events-none">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Jenis Komplain Dropdown Popover */}
              {isJenisDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-40 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Jenis Komplain
                  </div>
                  {filteredJenisKomplain.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectJenis(opt)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                        jenisKomplain === opt
                          ? 'text-[#008d91] bg-teal-50'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {jenisKomplain === opt && (
                        <Check className="w-3.5 h-3.5 text-[#008d91]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Status Komplain */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            <label className="md:col-span-3 text-sm text-slate-700 font-normal">
              Status Komplain
            </label>
            <div className="md:col-span-9 max-w-xl flex items-center gap-6">
              {(['Open', 'Diproses', 'Selesai'] as const).map((st) => (
                <label
                  key={st}
                  onClick={() => setStatus(st)}
                  className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
                >
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                    {status === st && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#008d91]" />
                    )}
                  </div>
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Komplain */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-start pt-1">
            <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
              Komplain
            </label>
            <div className="md:col-span-9 max-w-xl">
              <textarea
                id="form-complaint-textarea"
                rows={5}
                value={komplain}
                onChange={(e) => setKomplain(e.target.value)}
                placeholder="Input Text..."
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all resize-y min-h-[120px]"
              />
            </div>
          </div>

          {/* Bottom Action Buttons matching Form Transaksi S-SALUR and Form Identitas */}
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 max-w-xl">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Komplain</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
