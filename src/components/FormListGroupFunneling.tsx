import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { IdentitasItem } from '../identitasData';
import {
  loadFunnelingGroups,
  saveFunnelingGroups,
  loadFunnelingMembers,
  saveFunnelingMembers,
  loadJenisGroupFunneling,
  FunnelingGroupCard,
  FunnelingMemberItem,
  JenisGroupFunnelingItem,
} from '../funnelingData';

interface FormListGroupFunnelingProps {
  onCancel: () => void;
  onSaveSuccess: () => void;
  identitasList?: IdentitasItem[];
  jenisGroupList?: JenisGroupFunnelingItem[];
  onShowToast?: (msg: string) => void;
  onNavigateToJenisGroupFunneling?: () => void;
  initialIdentitasIds?: string[];
}

export const FormListGroupFunneling: React.FC<FormListGroupFunnelingProps> = ({
  onCancel,
  onSaveSuccess,
  identitasList = [],
  jenisGroupList,
  onShowToast = (_msg: string) => {},
  onNavigateToJenisGroupFunneling,
  initialIdentitasIds,
}) => {
  // Form State
  const [namaGroup, setNamaGroup] = useState('');
  const [jenisGroup, setJenisGroup] = useState('');
  // Multiple Identitas ID entries - initialized with initialIdentitasIds if provided
  const [identitasRows, setIdentitasRows] = useState<string[]>(() => {
    if (initialIdentitasIds && initialIdentitasIds.length > 0) {
      return initialIdentitasIds;
    }
    return [''];
  });

  useEffect(() => {
    if (initialIdentitasIds && initialIdentitasIds.length > 0) {
      setIdentitasRows(initialIdentitasIds);
    }
  }, [initialIdentitasIds]);

  // Master jenis groups
  const masterJenisList = useMemo(() => {
    return jenisGroupList && jenisGroupList.length > 0
      ? jenisGroupList
      : loadJenisGroupFunneling();
  }, [jenisGroupList]);

  // Active jenis groups (Aktif = true)
  const activeJenisGroups = useMemo(() => {
    return masterJenisList.filter((j) => j.aktif !== false);
  }, [masterJenisList]);

  // Find selected jenis group object
  const selectedJenisObj = useMemo(() => {
    if (!jenisGroup) return null;
    return masterJenisList.find(
      (j) => j.namaJenisGroup.toLowerCase() === jenisGroup.toLowerCase()
    );
  }, [masterJenisList, jenisGroup]);

  // Unique ID flag for selected jenis group
  const isUniqueIdActive = selectedJenisObj ? selectedJenisObj.uniqueId : false;

  // Existing groups & members for Unique ID check
  const [currentGroups] = useState<FunnelingGroupCard[]>(() => loadFunnelingGroups());
  const [currentMembers] = useState<FunnelingMemberItem[]>(() => loadFunnelingMembers());

  // Map of identitasId -> groupName already used in this same jenis group
  const usedIdentitasMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!isUniqueIdActive || !jenisGroup) return map;

    const targetJenisLower = jenisGroup.toLowerCase();

    // 1. Check existing group cards
    currentGroups.forEach((grp) => {
      const grpJenis = grp.jenisGroup || (grp.name.includes('Donasi') || grp.name.startsWith('Group ') ? 'Funneling Donasi' : '');
      if (grpJenis.toLowerCase() === targetJenisLower) {
        if (grp.identitasIds && Array.isArray(grp.identitasIds)) {
          grp.identitasIds.forEach((id) => {
            if (id && !map.has(id)) {
              map.set(id, grp.name);
            }
          });
        }
      }
    });

    // 2. Check existing members
    currentMembers.forEach((mem) => {
      const memJenis = mem.jenisGroup || (mem.category === 'Funneling Donasi' ? 'Funneling Donasi' : mem.category);
      if (memJenis && memJenis.toLowerCase() === targetJenisLower) {
        let matchedId = mem.identitasId;
        if (!matchedId) {
          const foundIdentitas = identitasList.find((i) => i.codeId === mem.codeId);
          if (foundIdentitas) matchedId = foundIdentitas.id;
        }

        if (matchedId && !map.has(matchedId)) {
          let grpName = 'Group Terdaftar';
          if (mem.groupA) grpName = 'Group A';
          else if (mem.groupB) grpName = 'Group B';
          else if (mem.groupNames && mem.groupNames.length > 0) grpName = mem.groupNames[0];
          map.set(matchedId, grpName);
        }
      }
    });

    return map;
  }, [isUniqueIdActive, jenisGroup, currentGroups, currentMembers, identitasList]);

  // UI / Toolbar State
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown states
  const [isJenisDropdownOpen, setIsJenisDropdownOpen] = useState(false);
  const [jenisSearchText, setJenisSearchText] = useState('');
  const [activeIdentitasDropdownIndex, setActiveIdentitasDropdownIndex] = useState<number | null>(null);
  const [identitasSearchText, setIdentitasSearchText] = useState('');

  const jenisDropdownRef = useRef<HTMLDivElement>(null);
  const identitasDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (jenisDropdownRef.current && !jenisDropdownRef.current.contains(e.target as Node)) {
        setIsJenisDropdownOpen(false);
      }
      if (identitasDropdownRef.current && !identitasDropdownRef.current.contains(e.target as Node)) {
        setActiveIdentitasDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Jenis Options (Only active ones)
  const filteredJenisOptions = useMemo(() => {
    return activeJenisGroups.filter((opt) =>
      opt.namaJenisGroup.toLowerCase().includes(jenisSearchText.toLowerCase())
    );
  }, [activeJenisGroups, jenisSearchText]);

  // Filtered Identitas List
  const filteredIdentitas = useMemo(() => {
    return identitasList.filter((item) => {
      // Search text filter
      const q = identitasSearchText.toLowerCase();
      const matchSearch =
        !q ||
        (item.codeId && item.codeId.toLowerCase().includes(q)) ||
        item.namaLengkap.toLowerCase().includes(q) ||
        (item.namaPanggilan && item.namaPanggilan.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Unique ID rule: if Unique ID is 'yes', cannot appear in another group within same jenis group
      if (isUniqueIdActive && usedIdentitasMap.has(item.id)) {
        return false;
      }

      // Prevent duplicate selection within the same form in other rows
      const isSelectedInOtherRow = identitasRows.some(
        (r, i) => i !== activeIdentitasDropdownIndex && r === item.id
      );
      if (isSelectedInOtherRow) {
        return false;
      }

      return true;
    });
  }, [
    identitasList,
    identitasSearchText,
    isUniqueIdActive,
    usedIdentitasMap,
    identitasRows,
    activeIdentitasDropdownIndex,
  ]);

  // Handler for adding Identitas ID row
  const handleAddIdentitasRow = () => {
    setIdentitasRows((prev) => [...prev, '']);
  };

  // Handler for removing/clearing Identitas ID row
  const handleRemoveIdentitasRow = (index: number) => {
    if (identitasRows.length === 1) {
      setIdentitasRows(['']);
    } else {
      setIdentitasRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handler for selecting Identitas ID for a specific row
  const handleSelectIdentitas = (index: number, idVal: string) => {
    // Unique ID check safety
    if (isUniqueIdActive && usedIdentitasMap.has(idVal)) {
      const grp = usedIdentitasMap.get(idVal);
      onShowToast(
        `Identitas ini sudah terdaftar di ${grp}. Unique ID aktif pada jenis group "${jenisGroup}".`
      );
      return;
    }

    setIdentitasRows((prev) => {
      const updated = [...prev];
      updated[index] = idVal;
      return updated;
    });
    setActiveIdentitasDropdownIndex(null);
    setIdentitasSearchText('');
  };

  // Get display text for an Identitas ID
  const getIdentitasDisplayText = (idVal: string) => {
    if (!idVal) return '';
    const found = identitasList.find((item) => item.id === idVal);
    if (!found) return idVal;
    return `${found.codeId ? `${found.codeId} - ` : ''}${found.namaLengkap}${
      found.namaPanggilan ? ` (${found.namaPanggilan})` : ''
    }`;
  };

  // Save handler
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!namaGroup.trim()) {
      onShowToast('Nama Group Funneling wajib diisi');
      return;
    }

    if (!jenisGroup.trim()) {
      onShowToast('Jenis Group Funneling wajib dipilih');
      return;
    }

    // Filter valid selected IDs
    const validIdentitasIds = identitasRows.filter((id) => Boolean(id.trim()));

    // Check duplicate IDs in the same form
    const uniqueIds = new Set(validIdentitasIds);
    if (uniqueIds.size !== validIdentitasIds.length) {
      onShowToast('Identitas ID tidak boleh duplikat dalam satu form');
      return;
    }

    // Enforce Unique ID constraint
    if (isUniqueIdActive) {
      for (const idVal of validIdentitasIds) {
        if (usedIdentitasMap.has(idVal)) {
          const grpName = usedIdentitasMap.get(idVal);
          const found = identitasList.find((i) => i.id === idVal);
          const label = found
            ? `${found.codeId ? `${found.codeId} - ` : ''}${found.namaLengkap}`
            : idVal;
          onShowToast(
            `ID "${label}" sudah terdaftar di "${grpName}". Unique ID aktif sehingga tidak boleh digunakan kembali pada jenis group "${jenisGroup}".`
          );
          return;
        }
      }
    }

    try {
      const latestGroups = loadFunnelingGroups();
      const latestMembers = loadFunnelingMembers();

      const memberCount = Math.max(validIdentitasIds.length, 1);

      // Create new Group Card
      const newGroup: FunnelingGroupCard = {
        id: `grp-${Date.now()}`,
        name: namaGroup.trim(),
        count: memberCount,
        countLabel: `${memberCount} orang`,
        icon: 'cart',
        jenisGroup: jenisGroup.trim(),
        identitasIds: validIdentitasIds,
      };

      const updatedGroups = [...latestGroups, newGroup];
      saveFunnelingGroups(updatedGroups);

      // If user selected Identitas IDs, add/update them in Funneling members
      let updatedMembers = [...latestMembers];
      validIdentitasIds.forEach((idVal) => {
        const found = identitasList.find((i) => i.id === idVal);
        if (found) {
          const existingIdx = updatedMembers.findIndex(
            (m) => m.identitasId === found.id || m.codeId === found.codeId
          );

          if (existingIdx >= 0) {
            const prevGroupNames = updatedMembers[existingIdx].groupNames || [];
            updatedMembers[existingIdx] = {
              ...updatedMembers[existingIdx],
              groupA: true,
              category: jenisGroup.trim(),
              jenisGroup: jenisGroup.trim(),
              groupNames: Array.from(new Set([...prevGroupNames, namaGroup.trim()])),
            };
          } else {
            const newMember: FunnelingMemberItem = {
              id: `fn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              identitasId: found.id,
              codeId: found.codeId || '00001',
              nama: found.namaLengkap,
              namaPanggilan: found.namaPanggilan || '',
              avatarInitial: found.avatarInitial || found.namaLengkap.charAt(0).toUpperCase(),
              avatarBg: found.avatarBg || 'bg-[#14b8a6]',
              groupA: true,
              groupB: false,
              category: jenisGroup.trim(),
              jenisGroup: jenisGroup.trim(),
              groupNames: [namaGroup.trim()],
            };
            updatedMembers.unshift(newMember);
          }
        }
      });

      saveFunnelingMembers(updatedMembers);
      onShowToast(`Berhasil menyimpan Form List Group Funneling: ${namaGroup.trim()}`);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      onShowToast('Gagal menyimpan data');
    }
  };

  return (
    <div id="form-list-group-funneling-page" className="w-full max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Toolbar matching screenshot: EyeOff, Search, SlidersHorizontal, + Add */}
      <div className="flex items-center justify-end gap-3 mt-1 mb-6 px-1">
        {/* Eye / EyeOff */}
        <button
          id="btn-form-funneling-eye"
          type="button"
          onClick={() => {
            setIsPrivacyMasked(!isPrivacyMasked);
            onShowToast(isPrivacyMasked ? 'Data ditampilkan' : 'Data disamarkan');
          }}
          title={isPrivacyMasked ? 'Tampilkan Data' : 'Samarkan Data'}
          aria-label={isPrivacyMasked ? 'Tampilkan Data' : 'Samarkan Data'}
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          {isPrivacyMasked ? (
            <Eye className="w-5 h-5 stroke-[1.8]" />
          ) : (
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          )}
        </button>

        {/* Search */}
        <div className="relative flex items-center">
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="input-form-funneling-search"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="text-xs outline-none w-36 sm:w-44 text-slate-700 bg-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-form-funneling-search"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              aria-label="Cari"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}
        </div>

        {/* SlidersHorizontal */}
        <button
          id="btn-form-funneling-sliders"
          type="button"
          onClick={() => onShowToast('Filter form aktif')}
          title="Filter"
          aria-label="Filter"
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          id="btn-form-funneling-add"
          type="button"
          onClick={() => {
            setNamaGroup('');
            setJenisGroup('');
            setIdentitasRows(['']);
            onShowToast('Form di-reset untuk penambahan baru');
          }}
          className="cursor-pointer bg-[#008d91] hover:bg-[#05828e] text-white font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Form Card / Section matching exact layout of image */}
      <form onSubmit={handleSave} className="mt-6 space-y-6">
        {/* Row 1: Nama Group Funneling */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
          <label className="sm:col-span-3 text-slate-600 font-normal text-sm sm:text-[15px]">
            Nama Group Funneling
          </label>
          <div className="sm:col-span-9 max-w-lg w-full">
            <input
              id="input-nama-group-funneling"
              type="text"
              placeholder="Input Text..."
              value={namaGroup}
              onChange={(e) => setNamaGroup(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-5 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Jenis Group Funneling */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
          <label className="sm:col-span-3 text-slate-600 font-normal text-sm sm:text-[15px]">
            Jenis Group Funneling
          </label>
          <div className="sm:col-span-9 max-w-lg w-full relative" ref={jenisDropdownRef}>
            <div
              id="select-jenis-group-funneling"
              onClick={() => setIsJenisDropdownOpen(!isJenisDropdownOpen)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-5 py-3 text-sm text-slate-700 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
            >
              <span className={jenisGroup ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                {jenisGroup || 'Search...'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Jenis Dropdown Menu */}
            {isJenisDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 mb-1">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari jenis group..."
                    value={jenisSearchText}
                    onChange={(e) => setJenisSearchText(e.target.value)}
                    autoFocus
                    className="w-full text-xs text-slate-700 outline-none bg-transparent"
                  />
                  {jenisSearchText && (
                    <button
                      type="button"
                      onClick={() => setJenisSearchText('')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                  {filteredJenisOptions.length === 0 ? (
                    <div
                      onClick={() => {
                        if (jenisSearchText.trim()) {
                          setJenisGroup(jenisSearchText.trim());
                          setIsJenisDropdownOpen(false);
                        }
                      }}
                      className="px-3 py-2 text-xs text-[#008d91] hover:bg-teal-50 rounded-xl cursor-pointer"
                    >
                      {jenisSearchText ? `Gunakan: "${jenisSearchText}"` : 'Tidak ada jenis group yang cocok'}
                    </div>
                  ) : (
                    filteredJenisOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setJenisGroup(opt.namaJenisGroup);
                          setIsJenisDropdownOpen(false);
                        }}
                        className={`px-3 py-2.5 text-xs rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                          jenisGroup === opt.namaJenisGroup
                            ? 'bg-teal-50 text-[#008d91] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opt.namaJenisGroup}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              opt.uniqueId
                                ? 'bg-teal-100/70 text-[#008d91]'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            Unique ID: {opt.uniqueId ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {jenisGroup === opt.namaJenisGroup && <Check className="w-3.5 h-3.5" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Identitas ID (with dynamic rows, 'x' delete and '+' add buttons) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start pt-1">
          <label className="sm:col-span-3 text-slate-600 font-normal text-sm sm:text-[15px] pt-3">
            Identitas ID
          </label>
          <div className="sm:col-span-9 max-w-lg w-full space-y-3" ref={identitasDropdownRef}>
            {identitasRows.map((idVal, idx) => (
              <div key={idx} className="flex items-center gap-2.5 w-full">
                {/* Search / Dropdown input */}
                <div className="relative flex-1">
                  <div
                    id={`select-identitas-row-${idx}`}
                    onClick={() => {
                      if (activeIdentitasDropdownIndex === idx) {
                        setActiveIdentitasDropdownIndex(null);
                      } else {
                        setActiveIdentitasDropdownIndex(idx);
                        setIdentitasSearchText('');
                      }
                    }}
                    className="w-full bg-white border border-slate-200/90 rounded-2xl px-5 py-3 text-sm text-slate-700 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <span
                      className={`truncate pr-2 ${
                        idVal ? 'text-slate-800 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {getIdentitasDisplayText(idVal) || 'Search...'}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Dropdown list for Identitas */}
                  {activeIdentitasDropdownIndex === idx && (
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 mb-1">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Cari Code ID atau Nama..."
                          value={identitasSearchText}
                          onChange={(e) => setIdentitasSearchText(e.target.value)}
                          autoFocus
                          className="w-full text-xs text-slate-700 outline-none bg-transparent"
                        />
                        {identitasSearchText && (
                          <button
                            type="button"
                            onClick={() => setIdentitasSearchText('')}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                        {filteredIdentitas.length === 0 ? (
                          <div className="px-3 py-4 text-xs text-center text-slate-400">
                            {isUniqueIdActive &&
                            identitasSearchText &&
                            identitasList.some(
                              (i) =>
                                usedIdentitasMap.has(i.id) &&
                                (i.namaLengkap.toLowerCase().includes(identitasSearchText.toLowerCase()) ||
                                  (i.codeId && i.codeId.includes(identitasSearchText)))
                            )
                              ? 'Identitas sudah terdaftar di group lain pada jenis group ini (Unique ID aktif).'
                              : 'Tidak ditemukan identitas yang sesuai'}
                          </div>
                        ) : (
                          filteredIdentitas.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectIdentitas(idx, item.id)}
                              className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                                idVal === item.id
                                  ? 'bg-teal-50 text-[#008d91] font-semibold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  {item.codeId || '00000'} - {item.namaLengkap}
                                </span>
                                {item.namaPanggilan && (
                                  <span className="text-[11px] text-slate-400">
                                    {item.namaPanggilan}
                                  </span>
                                )}
                              </div>
                              {idVal === item.id && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* '✕' button matching image */}
                <button
                  id={`btn-clear-identitas-${idx}`}
                  type="button"
                  onClick={() => handleRemoveIdentitasRow(idx)}
                  title="Hapus / Reset Identitas"
                  aria-label="Hapus / Reset Identitas"
                  className="text-[#008d91] hover:text-[#05828e] p-1.5 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* '+' button matching image */}
                <button
                  id="btn-add-identitas-row"
                  type="button"
                  onClick={handleAddIdentitasRow}
                  title="Tambah Identitas ID"
                  aria-label="Tambah Identitas ID"
                  className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Cancel & Save matching image */}
        <div className="pt-12 sm:pt-16 flex items-center justify-end gap-4">
          <button
            id="btn-form-funneling-cancel"
            type="button"
            onClick={onCancel}
            className="px-10 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 transition-colors shadow-2xs text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-form-funneling-save"
            type="submit"
            className="px-10 py-3 rounded-2xl bg-[#008d91] hover:bg-[#05828e] text-white font-semibold transition-colors shadow-2xs text-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
