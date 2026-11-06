import React, { useState, useEffect, useRef } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  X,
  User,
  Check,
  ExternalLink,
  FileText,
} from 'lucide-react';
import {
  VolunteerSSebarItem,
  JobAdvanceMasterItem,
  StatusJobAdvanceMasterItem,
} from '../types';
import { VOLUNTEER_SKILL_ROLES, STATUS_JOB_ADVANCE_OPTIONS } from '../volunteerSSebarData';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';

interface FormListDatabaseAAjakItemSSebarProps {
  onCancel: () => void;
  onSave: (item: VolunteerSSebarItem) => void;
  editingItem?: VolunteerSSebarItem | null;
  existingItems?: VolunteerSSebarItem[];
  identitasList?: IdentitasItem[];
  jobAdvanceList?: JobAdvanceMasterItem[];
  statusJobAdvanceList?: StatusJobAdvanceMasterItem[];
  onNavigateToJobAdvanceTable?: () => void;
  onNavigateToStatusJobAdvanceTable?: () => void;
  onShowToast?: (message: string) => void;
}

interface JobAdvanceRow {
  roleKey: string;
  roleLabel: string;
  status: string;
}

export const FormListDatabaseAAjakItemSSebar: React.FC<FormListDatabaseAAjakItemSSebarProps> = ({
  onCancel,
  onSave,
  editingItem,
  existingItems = [],
  identitasList,
  jobAdvanceList,
  statusJobAdvanceList,
  onNavigateToJobAdvanceTable,
  onNavigateToStatusJobAdvanceTable,
  onShowToast,
}) => {
  const allIdentitas = identitasList && identitasList.length > 0 ? identitasList : INITIAL_IDENTITAS;

  const availableRoles = React.useMemo(() => {
    if (jobAdvanceList && jobAdvanceList.length > 0) {
      return jobAdvanceList.map((item) => ({
        key: item.key || item.nama.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        label: item.nama,
      }));
    }
    return VOLUNTEER_SKILL_ROLES.map((r) => ({ key: r.key, label: r.label }));
  }, [jobAdvanceList]);

  const availableStatuses = React.useMemo(() => {
    if (statusJobAdvanceList && statusJobAdvanceList.length > 0) {
      return statusJobAdvanceList.map((s) => s.nama);
    }
    return STATUS_JOB_ADVANCE_OPTIONS;
  }, [statusJobAdvanceList]);

  // Selected Identitas state
  const [selectedIdentitasId, setSelectedIdentitasId] = useState<string>('');
  const [identitasSearchQuery, setIdentitasSearchQuery] = useState('');
  const [isIdentitasDropdownOpen, setIsIdentitasDropdownOpen] = useState(false);

  // Volunteer fields
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [panggilan, setPanggilan] = useState('');
  const [status, setStatus] = useState<'Volunteer' | 'Freelancer'>('Volunteer');
  const [isAktif, setIsAktif] = useState(true);
  const [periodeAktif, setPeriodeAktif] = useState('1 Jan 2021 - 15 Nov 2021');
  const [avatarBg, setAvatarBg] = useState('#0d9488');
  const [cvUrl, setCvUrl] = useState('');

  // Job Advance dynamic rows
  const [jobAdvanceRows, setJobAdvanceRows] = useState<JobAdvanceRow[]>([
    { roleKey: '', roleLabel: '', status: '' },
  ]);

  // Dropdown open states for each row
  const [openRoleDropdownIndex, setOpenRoleDropdownIndex] = useState<number | null>(null);
  const [openStatusDropdownIndex, setOpenStatusDropdownIndex] = useState<number | null>(null);
  const [roleSearchQueries, setRoleSearchQueries] = useState<Record<number, string>>({});
  const [statusSearchQueries, setStatusSearchQueries] = useState<Record<number, string>>({});

  // Top action bar states
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const identitasRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (identitasRef.current && !identitasRef.current.contains(e.target as Node)) {
        setIsIdentitasDropdownOpen(false);
      }
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpenRoleDropdownIndex(null);
        setOpenStatusDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize or populate data when editingItem is passed
  useEffect(() => {
    if (editingItem) {
      setSelectedIdentitasId(editingItem.identitasId || '');
      setKode(editingItem.kode || '');
      setNama(editingItem.nama || '');
      setPanggilan(editingItem.panggilan || '');
      setStatus((editingItem.status as 'Volunteer' | 'Freelancer') || 'Volunteer');
      setIsAktif(editingItem.isAktif !== false);
      setPeriodeAktif(editingItem.periodeAktif || '1 Jan 2021 - 15 Nov 2021');
      setAvatarBg(editingItem.avatarBg || '#0d9488');
      setCvUrl(editingItem.cvUrl || '');

      // Populate Job Advance rows from skills record
      if (editingItem.skills && Object.keys(editingItem.skills).length > 0) {
        const rows: JobAdvanceRow[] = [];
        Object.entries(editingItem.skills).forEach(([key, level]) => {
          const roleObj = availableRoles.find(
            (r) => r.key === key || r.label.toLowerCase() === key.toLowerCase()
          );
          if (roleObj) {
            rows.push({
              roleKey: roleObj.key,
              roleLabel: roleObj.label,
              status: String(level || '-'),
            });
          }
        });
        setJobAdvanceRows(rows.length > 0 ? rows : [{ roleKey: '', roleLabel: '', status: '' }]);
      } else {
        setJobAdvanceRows([{ roleKey: '', roleLabel: '', status: '' }]);
      }
    } else {
      // New volunteer default
      const nextNum = String(existingItems.length + 1).padStart(5, '0');
      setKode(nextNum);
      setNama('');
      setPanggilan('');
      setStatus('Volunteer');
      setIsAktif(true);
      setPeriodeAktif('1 Jan 2021 - 15 Nov 2021');
      setSelectedIdentitasId('');
      setCvUrl('');
      setJobAdvanceRows([{ roleKey: '', roleLabel: '', status: '' }]);
    }
  }, [editingItem, existingItems.length]);

  // Handle selecting an Identitas
  const handleSelectIdentitas = (id: IdentitasItem) => {
    setSelectedIdentitasId(id.id);
    setNama(id.namaLengkap);
    setPanggilan(id.namaPanggilan || '');
    if (id.nomorIdentitas) {
      setKode(id.nomorIdentitas);
    }
    if (id.cvUrl && !cvUrl) {
      setCvUrl(id.cvUrl);
    }
    setIsIdentitasDropdownOpen(false);
    setIdentitasSearchQuery('');
    setErrorMessage('');
  };

  // Job Advance row manipulations
  const handleAddJobAdvanceRow = () => {
    setJobAdvanceRows((prev) => [...prev, { roleKey: '', roleLabel: '', status: '' }]);
  };

  const handleRemoveJobAdvanceRow = (index: number) => {
    if (jobAdvanceRows.length === 1) {
      // Just clear the single row
      setJobAdvanceRows([{ roleKey: '', roleLabel: '', status: '' }]);
      return;
    }
    setJobAdvanceRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectRole = (index: number, role: { key: string; label: string }) => {
    setJobAdvanceRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        roleKey: role.key,
        roleLabel: role.label,
      };
      return copy;
    });
    setOpenRoleDropdownIndex(null);
  };

  const handleSelectStatus = (index: number, statusVal: string) => {
    setJobAdvanceRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        status: statusVal,
      };
      return copy;
    });
    setOpenStatusDropdownIndex(null);
  };

  // Submit and Save
  const handleSave = () => {
    if (!nama.trim() && !selectedIdentitasId) {
      setErrorMessage('Identitas ID atau nama volunteer harus diisi.');
      return;
    }

    // Build skills record
    const skillsRecord: Record<string, string> = {};
    jobAdvanceRows.forEach((row) => {
      if (row.roleKey) {
        skillsRecord[row.roleKey] = row.status || '-';
      }
    });

    // Ensure layout and coverDesign exist in record for table default columns
    if (!skillsRecord.layout) skillsRecord.layout = '-';
    if (!skillsRecord.coverDesign) skillsRecord.coverDesign = '-';

    const finalKode = kode.trim() || String(existingItems.length + 1).padStart(5, '0');
    const finalNama = nama.trim() || 'Volunteer Baru';
    const initial = finalNama.charAt(0).toUpperCase() || 'V';

    const savedVolunteer: VolunteerSSebarItem = {
      id: editingItem ? editingItem.id : `vol-${Date.now()}`,
      identitasId: selectedIdentitasId || undefined,
      kode: finalKode,
      nama: finalNama,
      panggilan: panggilan.trim(),
      avatarLetter: initial,
      avatarBg: avatarBg,
      status: status,
      isAktif: isAktif,
      periodeAktif: periodeAktif,
      cvUrl: cvUrl.trim(),
      skills: skillsRecord,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    onSave(savedVolunteer);
    if (onShowToast) {
      onShowToast(
        editingItem
          ? `Data volunteer "${finalNama}" berhasil diperbarui`
          : `Volunteer "${finalNama}" berhasil ditambahkan ke Database A-AJAK Item S-SEBAR`
      );
    }
  };

  // Filtered Identitas for dropdown search
  const filteredIdentitas = allIdentitas.filter((item) => {
    if (!identitasSearchQuery.trim()) return true;
    const q = identitasSearchQuery.toLowerCase();
    return (
      item.namaLengkap.toLowerCase().includes(q) ||
      (item.namaPanggilan && item.namaPanggilan.toLowerCase().includes(q)) ||
      (item.nomorIdentitas && item.nomorIdentitas.toLowerCase().includes(q)) ||
      (item.nomorHandphone && item.nomorHandphone.includes(q))
    );
  });

  const selectedIdentitasObj = allIdentitas.find((it) => it.id === selectedIdentitasId);

  return (
    <div
      ref={formRef}
      className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200"
    >
      {/* Outer Card Container matching image.png */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-100 min-h-[500px]">
        {/* Top Action Bar matching image.png (EyeOff, Search, Filter, + Add) */}
        <div className="flex items-center justify-end gap-3 mb-8">
          {/* Privacy Mask Toggle */}
          <button
            type="button"
            onClick={() => setIsPrivacyMasked(!isPrivacyMasked)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            title={isPrivacyMasked ? 'Tampilkan teks' : 'Sembunyikan'}
          >
            {isPrivacyMasked ? (
              <Eye className="w-5 h-5 stroke-[1.8] text-[#008d91]" />
            ) : (
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>

          {/* Search Icon / Input */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Cari dalam form..."
                  autoFocus
                  className="text-xs sm:text-sm text-slate-700 outline-none w-36 sm:w-48"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setGlobalSearch('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Pencarian"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}
          </div>

          {/* Filter / SlidersHorizontal */}
          <button
            type="button"
            onClick={() => setFilterActive(!filterActive)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              filterActive ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Filter Opsi"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button matching image.png */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl max-w-2xl">
            {errorMessage}
          </div>
        )}

        {/* Form Fields matching image.png exactly */}
        <div className="space-y-8 max-w-4xl">
          {/* Row 1: Identitas ID */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
            <label className="text-slate-600 font-medium text-sm sm:text-base sm:w-36 shrink-0">
              Identitas ID
            </label>

            <div ref={identitasRef} className="relative w-full max-w-md sm:max-w-lg">
              {/* Searchable input box with teal circle arrow on right */}
              <div
                onClick={() => setIsIdentitasDropdownOpen(!isIdentitasDropdownOpen)}
                className="w-full bg-white border border-slate-200/90 hover:border-[#008d91]/60 focus-within:border-[#008d91] rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
              >
                <input
                  type="text"
                  value={
                    isIdentitasDropdownOpen
                      ? identitasSearchQuery
                      : selectedIdentitasObj
                      ? `${selectedIdentitasObj.nomorIdentitas || ''} ${selectedIdentitasObj.namaLengkap} ${
                          selectedIdentitasObj.namaPanggilan ? `(${selectedIdentitasObj.namaPanggilan})` : ''
                        }`
                      : nama
                      ? `${kode} ${nama} ${panggilan ? `(${panggilan})` : ''}`
                      : ''
                  }
                  onChange={(e) => {
                    setIdentitasSearchQuery(e.target.value);
                    if (!isIdentitasDropdownOpen) setIsIdentitasDropdownOpen(true);
                  }}
                  onFocus={() => setIsIdentitasDropdownOpen(true)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none cursor-pointer"
                />

                {/* Right teal circular button with chevron matching image.png */}
                <div className="w-6 h-6 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 shadow-2xs">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Identitas Dropdown Options */}
              {isIdentitasDropdownOpen && (
                <div className="absolute left-0 right-0 top-12 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-64 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
                  {filteredIdentitas.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      Identitas tidak ditemukan.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setNama(identitasSearchQuery);
                          setIsIdentitasDropdownOpen(false);
                        }}
                        className="text-[#008d91] font-semibold underline ml-1"
                      >
                        Gunakan "{identitasSearchQuery}" sebagai nama
                      </button>
                    </div>
                  ) : (
                    filteredIdentitas.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectIdentitas(item)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs sm:text-sm group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-full bg-[#008d91]/10 text-[#008d91] font-bold text-xs flex items-center justify-center shrink-0">
                            {item.namaLengkap.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-slate-800">
                              {item.nomorIdentitas || '00000'} - {item.namaLengkap}
                            </span>
                            {item.namaPanggilan && (
                              <span className="text-slate-500 ml-1.5">({item.namaPanggilan})</span>
                            )}
                          </div>
                        </div>
                        {selectedIdentitasId === item.id && (
                          <Check className="w-4 h-4 text-[#008d91] shrink-0 ml-2" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Status (Volunteer / Freelancer) matching image.png */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
            <label className="text-slate-600 font-medium text-sm sm:text-base sm:w-36 shrink-0">
              Status
            </label>

            <div className="flex items-center gap-8 sm:gap-12">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm sm:text-base text-slate-800 font-medium">
                <input
                  type="radio"
                  name="volunteerStatus"
                  value="Volunteer"
                  checked={status === 'Volunteer'}
                  onChange={() => setStatus('Volunteer')}
                  className="w-4 h-4 text-[#008d91] focus:ring-[#008d91] accent-[#008d91] cursor-pointer"
                />
                <span>Volunteer</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm sm:text-base text-slate-800 font-medium">
                <input
                  type="radio"
                  name="volunteerStatus"
                  value="Freelancer"
                  checked={status === 'Freelancer'}
                  onChange={() => setStatus('Freelancer')}
                  className="w-4 h-4 text-[#008d91] focus:ring-[#008d91] accent-[#008d91] cursor-pointer"
                />
                <span>Freelancer</span>
              </label>
            </div>
          </div>

          {/* Row 3: Job Advance matching image.png */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8">
            <label className="text-slate-600 font-medium text-sm sm:text-base sm:w-36 shrink-0 sm:pt-2.5">
              Job Advance
            </label>

            {/* Dynamic Job Advance Rows */}
            <div className="space-y-3 w-full">
              {jobAdvanceRows.map((row, index) => {
                const isRoleOpen = openRoleDropdownIndex === index;
                const isStatusOpen = openStatusDropdownIndex === index;
                const currentRoleSearch = roleSearchQueries[index] || '';
                const currentStatusSearch = statusSearchQueries[index] || '';

                const filteredRoles = availableRoles.filter((r) => {
                  if (!currentRoleSearch.trim()) return true;
                  return r.label.toLowerCase().includes(currentRoleSearch.toLowerCase());
                });

                const filteredStatuses = availableStatuses.filter((s) => {
                  if (!currentStatusSearch.trim()) return true;
                  return s.toLowerCase().includes(currentStatusSearch.toLowerCase());
                });

                return (
                  <div key={index} className="flex flex-wrap items-center gap-3 relative">
                    {/* Dropdown 1: List Job Advance */}
                    <div className="relative w-64 sm:w-72">
                      <div
                        onClick={() => {
                          setOpenRoleDropdownIndex(isRoleOpen ? null : index);
                          setOpenStatusDropdownIndex(null);
                        }}
                        className="w-full bg-white border border-slate-200/90 hover:border-[#008d91]/60 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                      >
                        <input
                          type="text"
                          value={isRoleOpen ? currentRoleSearch : row.roleLabel}
                          onChange={(e) => {
                            setRoleSearchQueries((prev) => ({ ...prev, [index]: e.target.value }));
                            if (!isRoleOpen) setOpenRoleDropdownIndex(index);
                          }}
                          onFocus={() => setOpenRoleDropdownIndex(index)}
                          placeholder="Search..."
                          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none cursor-pointer truncate"
                        />
                        <div className="w-6 h-6 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 shadow-2xs">
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Role Options Dropdown */}
                      {isRoleOpen && (
                        <div className="absolute left-0 right-0 top-12 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
                          {filteredRoles.map((role) => (
                            <button
                              key={role.key}
                              type="button"
                              onClick={() => handleSelectRole(index, role)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-between ${
                                row.roleKey === role.key
                                  ? 'bg-[#008d91]/10 text-[#008d91] font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="truncate">{role.label}</span>
                              {row.roleKey === role.key && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                            </button>
                          ))}
                          {onNavigateToJobAdvanceTable && (
                            <div className="pt-1 mt-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToJobAdvanceTable();
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-[#008d91] hover:bg-teal-50/70 transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <span>Kelola Table Job Advance...</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#008d91]" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dropdown 2: Status Job Advance */}
                    <div className="relative w-56 sm:w-64">
                      <div
                        onClick={() => {
                          setOpenStatusDropdownIndex(isStatusOpen ? null : index);
                          setOpenRoleDropdownIndex(null);
                        }}
                        className="w-full bg-white border border-slate-200/90 hover:border-[#008d91]/60 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                      >
                        <input
                          type="text"
                          value={isStatusOpen ? currentStatusSearch : row.status}
                          onChange={(e) => {
                            setStatusSearchQueries((prev) => ({ ...prev, [index]: e.target.value }));
                            if (!isStatusOpen) setOpenStatusDropdownIndex(index);
                          }}
                          onFocus={() => setOpenStatusDropdownIndex(index)}
                          placeholder="Search..."
                          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none cursor-pointer truncate"
                        />
                        <div className="w-6 h-6 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 shadow-2xs">
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Status Options Dropdown */}
                      {isStatusOpen && (
                        <div className="absolute left-0 right-0 top-12 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
                          {filteredStatuses.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleSelectStatus(index, st)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-between ${
                                row.status === st
                                  ? 'bg-[#008d91]/10 text-[#008d91] font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span>{st}</span>
                              {row.status === st && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                            </button>
                          ))}
                          {onNavigateToStatusJobAdvanceTable && (
                            <div className="pt-1 mt-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToStatusJobAdvanceTable();
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-[#008d91] hover:bg-teal-50/70 transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <span>Kelola Table Status...</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#008d91]" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove Row Button (✕) matching image.png */}
                    <button
                      type="button"
                      onClick={() => handleRemoveJobAdvanceRow(index)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Hapus baris Job Advance"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>

                    {/* Add Row Button (+) matching image.png (shown on the last row or next to it) */}
                    {index === jobAdvanceRows.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddJobAdvanceRow}
                        className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors shadow-2xs"
                        title="Tambah baris Job Advance"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 4: Link CV */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
            <label className="text-slate-600 font-medium text-sm sm:text-base sm:w-36 shrink-0">
              Link CV
            </label>
            <div className="w-full max-w-md sm:max-w-lg">
              <div className="w-full bg-white border border-slate-200/90 hover:border-[#008d91]/60 focus-within:border-[#008d91] rounded-2xl px-4 py-2.5 flex items-center gap-2.5 transition-all shadow-2xs">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="url"
                  value={cvUrl}
                  onChange={(e) => setCvUrl(e.target.value)}
                  placeholder="https://drive.google.com/... (Link Google Drive, LinkedIn, PDF)"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
                {cvUrl && (cvUrl.startsWith('http://') || cvUrl.startsWith('https://')) && (
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#008d91] hover:bg-teal-50 rounded-lg transition-colors shrink-0"
                    title="Uji / Buka link CV"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                Tautan publik ke dokumen CV atau portofolio volunteer/personil.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="mt-14 pt-6 border-t border-slate-100 flex items-center justify-start gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-6 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full px-7 py-2 bg-[#008d91] hover:bg-[#05828e] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};
