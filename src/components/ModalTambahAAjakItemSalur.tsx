import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  EyeOff,
  Eye,
  SlidersHorizontal,
  Check,
  User,
  Briefcase,
  FileText,
} from 'lucide-react';
import { SalurProduct } from '../salurData';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { INITIAL_JOB_ADVANCE_MASTER } from '../jobAdvanceMasterData';
import {
  AAjakHelperRow,
  loadAAjakItemSalurRecord,
  saveAAjakItemSalurRecord,
} from '../aajakItemSalurData';

interface ModalTambahAAjakItemSalurProps {
  isOpen: boolean;
  onClose: () => void;
  item: SalurProduct | null;
  identitasList?: IdentitasItem[];
  onShowToast?: (msg: string) => void;
}

export const ModalTambahAAjakItemSalur: React.FC<ModalTambahAAjakItemSalurProps> = ({
  isOpen,
  onClose,
  item,
  identitasList = INITIAL_IDENTITAS,
  onShowToast = (_msg: string) => {},
}) => {
  // Tanggal Mulai Bekerja
  const [tanggalMulaiBekerja, setTanggalMulaiBekerja] = useState<string>('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Dynamic rows of helper (Identitas ID + Job Advance)
  const [helperRows, setHelperRows] = useState<AAjakHelperRow[]>([
    {
      id: `row-${Date.now()}-1`,
      identitasId: '',
      jobAdvance: '',
    },
  ]);

  // Top bar toolbar states matching image.png
  const [isEyeActive, setIsEyeActive] = useState<boolean>(true);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Dropdown states per row
  const [openIdentitasDropdownIdx, setOpenIdentitasDropdownIdx] = useState<number | null>(null);
  const [openJobDropdownIdx, setOpenJobDropdownIdx] = useState<number | null>(null);

  // Search input values per row
  const [identitasSearchMap, setIdentitasSearchMap] = useState<Record<number, string>>({});
  const [jobSearchMap, setJobSearchMap] = useState<Record<number, string>>({});

  // Load saved record whenever modal opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      const record = loadAAjakItemSalurRecord(item.id, item.title);
      setTanggalMulaiBekerja(record.tanggalMulaiBekerja || '');
      if (record.helpers && record.helpers.length > 0) {
        setHelperRows(record.helpers);
      } else {
        setHelperRows([
          {
            id: `row-${Date.now()}-1`,
            identitasId: '',
            jobAdvance: '',
          },
        ]);
      }
      setOpenIdentitasDropdownIdx(null);
      setOpenJobDropdownIdx(null);
      setIdentitasSearchMap({});
      setJobSearchMap({});
    }
  }, [isOpen, item?.id, item?.title]);

  // Master identitas map
  const identitasMap = useMemo(() => {
    const map = new Map<string, IdentitasItem>();
    identitasList.forEach((it) => map.set(it.id, it));
    return map;
  }, [identitasList]);

  // Add new helper row
  const handleAddRow = () => {
    const newRow: AAjakHelperRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      identitasId: '',
      jobAdvance: '',
    };
    setHelperRows((prev) => [...prev, newRow]);
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    if (helperRows.length <= 1) {
      // If only 1 row left, reset it instead of removing completely
      setHelperRows([
        {
          id: `row-${Date.now()}-1`,
          identitasId: '',
          jobAdvance: '',
        },
      ]);
      setIdentitasSearchMap({});
      setJobSearchMap({});
      return;
    }
    setHelperRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Select identitas
  const handleSelectIdentitas = (index: number, personId: string) => {
    const person = identitasMap.get(personId);
    setHelperRows((prev) =>
      prev.map((r, idx) =>
        idx === index
          ? {
              ...r,
              identitasId: personId,
              cvUrl: r.cvUrl || person?.cvUrl || '',
            }
          : r
      )
    );
    setOpenIdentitasDropdownIdx(null);
  };

  // Select job advance
  const handleSelectJob = (index: number, jobName: string) => {
    setHelperRows((prev) =>
      prev.map((r, idx) => (idx === index ? { ...r, jobAdvance: jobName } : r))
    );
    setOpenJobDropdownIdx(null);
  };

  // Update CV url
  const handleUpdateCv = (index: number, url: string) => {
    setHelperRows((prev) =>
      prev.map((r, idx) => (idx === index ? { ...r, cvUrl: url } : r))
    );
  };

  // Save handler
  const handleSave = () => {
    if (!item) return;

    // Filter out rows that have both empty identitas and job
    const validHelpers = helperRows.filter(
      (r) => r.identitasId.trim() || r.jobAdvance.trim()
    );

    saveAAjakItemSalurRecord({
      itemId: item.id,
      itemTitle: item.title,
      tanggalMulaiBekerja: tanggalMulaiBekerja.trim(),
      helpers: (validHelpers.length > 0 ? validHelpers : helperRows).map((r) => ({
        ...r,
        tanggalMulai: r.tanggalMulai || tanggalMulaiBekerja.trim() || '18 Jan 2021',
        tanggalSelesai: r.tanggalSelesai || '',
      })),
    });

    onShowToast(`Data A-AJAK untuk "${item.title}" berhasil disimpan!`);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl border border-slate-100 p-6 sm:p-12 relative flex flex-col gap-8 animate-in zoom-in-95 duration-150"
      >
        {/* Top Control Bar matching image.png */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              A-AJAK Item S-SALUR
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-[#008d91] font-semibold border border-teal-100 truncate max-w-[320px]">
              {item.title}
            </span>
          </div>

          {/* Right Toolbar: EyeOff, Search, Sliders, + Add button */}
          <div className="flex items-center gap-3">
            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => setIsEyeActive(!isEyeActive)}
              title={isEyeActive ? 'Sembunyikan info' : 'Tampilkan info'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isEyeActive ? 'text-slate-400 hover:text-slate-600' : 'text-[#008d91] bg-teal-50'
              }`}
            >
              {isEyeActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchActive(!isSearchActive)}
              title="Cari"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSearchActive ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Sliders / Filter Icon */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Pengaturan"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isFilterOpen ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* + Add Button matching image.png */}
            <button
              type="button"
              onClick={handleAddRow}
              className="bg-[#008d91] hover:bg-[#007b7e] text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Search Bar if toggled */}
        {isSearchActive && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 flex items-center gap-3 -mt-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama personil atau jenis tugas yang membantu pembuatan item ini..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-700"
              autoFocus
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Form Body matching image.png */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* ROW 1: Tanggal Mulai Bekerja */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12">
            <label className="text-slate-700 text-sm sm:text-base font-normal w-56 shrink-0 select-none">
              Tanggal Mulai Bekerja
            </label>

            <div className="relative w-full max-w-sm">
              <div
                onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                className="bg-white border border-slate-200 hover:border-[#008d91]/60 focus-within:border-[#008d91] rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xs cursor-pointer transition-all"
              >
                <input
                  type="text"
                  placeholder="Input Date..."
                  value={tanggalMulaiBekerja}
                  onChange={(e) => setTanggalMulaiBekerja(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none cursor-pointer"
                />
                <div className="relative shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus();
                    }}
                    className="p-1 text-[#008d91] hover:text-[#007b7e] transition-colors cursor-pointer"
                    title="Pilih Tanggal"
                  >
                    <Calendar className="w-5 h-5 stroke-[1.8]" />
                  </button>
                  <input
                    type="date"
                    aria-label="Pilih Tanggal Mulai Bekerja"
                    title="Pilih Tanggal"
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-');
                        const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                        const formatted = dateObj.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                        setTanggalMulaiBekerja(formatted);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>

              {/* Hidden native date input for date picker */}
              <input
                ref={dateInputRef}
                type="date"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-');
                    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                    const formatted = dateObj.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    setTanggalMulaiBekerja(formatted);
                  }
                }}
              />
            </div>
          </div>

          {/* ROW 2: Identitas ID + Job Advance */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-12">
            <label className="text-slate-700 text-sm sm:text-base font-normal w-56 shrink-0 pt-3 select-none">
              Identitas ID + Job Advance
            </label>

            {/* List of Helper Rows */}
            <div className="flex-1 flex flex-col gap-4">
              {helperRows.map((row, index) => {
                const selectedPerson = row.identitasId
                  ? identitasMap.get(row.identitasId)
                  : null;

                const isIdentitasOpen = openIdentitasDropdownIdx === index;
                const isJobOpen = openJobDropdownIdx === index;

                const identitasSearch = identitasSearchMap[index] ?? '';
                const jobSearch = jobSearchMap[index] ?? '';

                // Filtered identitas for this row
                const filteredIdentitas = identitasList.filter((it) => {
                  if (!identitasSearch.trim()) return true;
                  const q = identitasSearch.toLowerCase();
                  return (
                    it.namaLengkap.toLowerCase().includes(q) ||
                    (it.namaPanggilan || '').toLowerCase().includes(q) ||
                    (it.codeId || '').toLowerCase().includes(q)
                  );
                });

                // Filtered job advance for this row
                const filteredJobs = INITIAL_JOB_ADVANCE_MASTER.filter((j) => {
                  if (!jobSearch.trim()) return true;
                  return j.nama.toLowerCase().includes(jobSearch.toLowerCase());
                });

                return (
                  <div
                    key={row.id || index}
                    className="flex flex-wrap items-center gap-3 relative"
                  >
                    {/* Dropdown 1: Identitas ID */}
                    <div className="relative w-52 sm:w-60">
                      <div
                        onClick={() => {
                          setOpenIdentitasDropdownIdx(isIdentitasOpen ? null : index);
                          setOpenJobDropdownIdx(null);
                        }}
                        className="bg-white border border-slate-200 hover:border-[#008d91]/60 focus-within:border-[#008d91] rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs cursor-pointer transition-all"
                      >
                        <input
                          type="text"
                          value={
                            isIdentitasOpen
                              ? identitasSearch
                              : selectedPerson
                              ? `${selectedPerson.codeId ? selectedPerson.codeId + ' ' : ''}${
                                  selectedPerson.namaLengkap
                                }`
                              : ''
                          }
                          onChange={(e) => {
                            setIdentitasSearchMap((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }));
                            if (!isIdentitasOpen) setOpenIdentitasDropdownIdx(index);
                          }}
                          onFocus={() => setOpenIdentitasDropdownIdx(index)}
                          placeholder="Search..."
                          className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none cursor-pointer truncate"
                        />
                        <div className="w-5.5 h-5.5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 shadow-2xs">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Dropdown Menu for Identitas ID */}
                      {isIdentitasOpen && (
                        <div className="absolute left-0 right-0 top-12 z-40 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100">
                          {filteredIdentitas.map((person) => {
                            const isSelected = row.identitasId === person.id;
                            return (
                              <button
                                key={person.id}
                                type="button"
                                onClick={() => handleSelectIdentitas(index, person.id)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="w-6 h-6 rounded-full bg-[#14b8a6] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {person.avatarInitial || person.namaLengkap.charAt(0)}
                                  </span>
                                  <span className="truncate">
                                    {person.codeId ? `${person.codeId} ` : ''}
                                    {person.namaLengkap}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                                )}
                              </button>
                            );
                          })}

                          {filteredIdentitas.length === 0 && (
                            <div className="px-3 py-2 text-xs text-slate-400 text-center">
                              Tidak ditemukan identitas
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dropdown 2: Job Advance */}
                    <div className="relative w-52 sm:w-60">
                      <div
                        onClick={() => {
                          setOpenJobDropdownIdx(isJobOpen ? null : index);
                          setOpenIdentitasDropdownIdx(null);
                        }}
                        className="bg-white border border-slate-200 hover:border-[#008d91]/60 focus-within:border-[#008d91] rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs cursor-pointer transition-all"
                      >
                        <input
                          type="text"
                          value={isJobOpen ? jobSearch : row.jobAdvance}
                          onChange={(e) => {
                            setJobSearchMap((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }));
                            if (!isJobOpen) setOpenJobDropdownIdx(index);
                          }}
                          onFocus={() => setOpenJobDropdownIdx(index)}
                          placeholder="Search..."
                          className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none cursor-pointer truncate"
                        />
                        <div className="w-5.5 h-5.5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 shadow-2xs">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Dropdown Menu for Job Advance */}
                      {isJobOpen && (
                        <div className="absolute left-0 right-0 top-12 z-40 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-100">
                          {filteredJobs.map((job) => {
                            const isSelected = row.jobAdvance === job.nama;
                            return (
                              <button
                                key={job.id}
                                type="button"
                                onClick={() => handleSelectJob(index, job.nama)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="truncate">{job.nama}</span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                                )}
                              </button>
                            );
                          })}

                          {filteredJobs.length === 0 && (
                            <button
                              type="button"
                              onClick={() => handleSelectJob(index, jobSearch)}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#008d91] hover:bg-teal-50 font-medium"
                            >
                              Gunakan "{jobSearch}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Input: Link CV */}
                    <div className="relative w-48 sm:w-56">
                      <div className="bg-white border border-slate-200 hover:border-[#008d91]/60 focus-within:border-[#008d91] rounded-2xl px-3 py-2.5 flex items-center gap-1.5 shadow-2xs transition-all">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="url"
                          value={row.cvUrl || ''}
                          onChange={(e) => handleUpdateCv(index, e.target.value)}
                          placeholder="Link CV (opsional)..."
                          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none truncate"
                        />
                      </div>
                    </div>

                    {/* Delete Icon '✕' matching image.png */}
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      title="Hapus baris"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>

                    {/* Plus Icon '+' in teal circle matching image.png */}
                    <button
                      type="button"
                      onClick={handleAddRow}
                      title="Tambah baris"
                      className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center shadow-2xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Cancel & Save matching image.png */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-10 py-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-10 py-3 rounded-2xl bg-[#008d91] hover:bg-[#007b7e] text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
