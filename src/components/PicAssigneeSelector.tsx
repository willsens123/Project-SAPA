import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  X,
  Building2,
  User,
  Users,
  Check,
  ChevronDown,
  Briefcase,
  IdCard,
} from 'lucide-react';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { OrganisasiItem, KaryawanItem } from '../types';
import { INITIAL_ORGANISASI } from '../organisasiData';

export interface PicAssigneeItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  category: 'karyawan' | 'identitas' | 'organisasi' | 'other';
  rawKaryawan?: KaryawanItem;
  rawIdentitas?: IdentitasItem;
  rawOrganisasi?: OrganisasiItem;
}

interface PicAssigneeSelectorProps {
  value?: string; // Single code e.g. "00018" or comma-separated e.g. "00018, 00031"
  onChange: (value: string) => void;
  karyawanList?: KaryawanItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  label?: string;
  placeholder?: string;
  onShowToast?: (msg: string) => void;
  className?: string;
}

const IDENTITAS_STORAGE_KEY = 'identitas_data_v1';
const ORGANISASI_STORAGE_KEY = 'organisasi_data_v1';
const KARYAWAN_STORAGE_KEY = 'sapa_karyawan_data_v2';

export const PicAssigneeSelector: React.FC<PicAssigneeSelectorProps> = ({
  value = '',
  onChange,
  karyawanList: propKaryawanList,
  identitasList: propIdentitasList,
  organisasiList: propOrganisasiList,
  label = 'PIC',
  placeholder = 'Pilih PIC (bisa lebih dari satu orang)...',
  onShowToast,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'karyawan' | 'identitas' | 'organisasi'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  // Quick Add Form State
  const [quickAddType, setQuickAddType] = useState<'karyawan' | 'identitas'>('karyawan');
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddNick, setQuickAddNick] = useState('');
  const [quickAddDivisi, setQuickAddDivisi] = useState('PNB');
  const [quickAddJabatan, setQuickAddJabatan] = useState('Staff');

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Parse currently selected codes from value string
  const selectedCodes = useMemo(() => {
    if (!value || typeof value !== 'string') return [];
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  // Fallback states synced with storage
  const [localKaryawan, setLocalKaryawan] = useState<KaryawanItem[]>(() => {
    if (propKaryawanList && propKaryawanList.length > 0) return propKaryawanList;
    try {
      const saved = localStorage.getItem(KARYAWAN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [localIdentitas, setLocalIdentitas] = useState<IdentitasItem[]>(() => {
    if (propIdentitasList && propIdentitasList.length > 0) return propIdentitasList;
    try {
      const saved = localStorage.getItem(IDENTITAS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_IDENTITAS;
  });

  const [localOrganisasi, setLocalOrganisasi] = useState<OrganisasiItem[]>(() => {
    if (propOrganisasiList && propOrganisasiList.length > 0) return propOrganisasiList;
    try {
      const saved = localStorage.getItem(ORGANISASI_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_ORGANISASI;
  });

  useEffect(() => {
    if (propKaryawanList && propKaryawanList.length > 0) setLocalKaryawan(propKaryawanList);
  }, [propKaryawanList]);

  useEffect(() => {
    if (propIdentitasList && propIdentitasList.length > 0) setLocalIdentitas(propIdentitasList);
  }, [propIdentitasList]);

  useEffect(() => {
    if (propOrganisasiList && propOrganisasiList.length > 0) setLocalOrganisasi(propOrganisasiList);
  }, [propOrganisasiList]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Build unified items list
  const allItems = useMemo<PicAssigneeItem[]>(() => {
    const items: PicAssigneeItem[] = [];

    // 1. Karyawan
    localKaryawan.forEach((k) => {
      const code = k.kodeKaryawan || k.id;
      const subtitle = k.divisi ? `Divisi ${k.divisi}` : 'Karyawan';
      items.push({
        id: k.id || code,
        code,
        name: k.namaLengkap || k.namaPanggilan || code,
        subtitle,
        category: 'karyawan',
        rawKaryawan: k,
      });
    });

    // 2. Identitas
    localIdentitas.forEach((idItem) => {
      const code = idItem.codeId || idItem.nomorIdentitas || idItem.id;
      const subtitle = [idItem.organisasi, idItem.nomorHandPhone].filter(Boolean).join(' • ') || 'Personil Identitas';
      items.push({
        id: idItem.id || code,
        code,
        name: idItem.namaLengkap || idItem.namaPanggilan || code,
        subtitle,
        category: 'identitas',
        rawIdentitas: idItem,
      });
    });

    // 3. Organisasi
    localOrganisasi.forEach((org) => {
      const code = org.kodeOrganisasi || org.id;
      const subtitle = [org.kategori, org.penanggungJawab].filter(Boolean).join(' • ') || 'Organisasi / Lembaga';
      items.push({
        id: org.id || code,
        code,
        name: org.namaOrganisasi || code,
        subtitle,
        category: 'organisasi',
        rawOrganisasi: org,
      });
    });

    return items;
  }, [localKaryawan, localIdentitas, localOrganisasi]);

  // Lookup map for fast badge rendering
  const itemsMap = useMemo(() => {
    const map = new Map<string, PicAssigneeItem>();
    allItems.forEach((item) => {
      map.set(item.code, item);
      map.set(item.id, item);
      map.set(item.code.toLowerCase(), item);
    });
    return map;
  }, [allItems]);

  // Filtered list based on active tab and search query
  const filteredItems = useMemo(() => {
    let result = allItems;
    if (activeTab !== 'all') {
      result = result.filter((item) => item.category === activeTab);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allItems, activeTab, searchQuery]);

  // Toggle selection of a single item
  const handleToggleItem = (code: string) => {
    const isSelected = selectedCodes.includes(code);
    let newCodes: string[];
    if (isSelected) {
      newCodes = selectedCodes.filter((c) => c !== code);
    } else {
      newCodes = [...selectedCodes, code];
    }
    onChange(newCodes.join(', '));
  };

  // Remove a single code from selected list
  const handleRemoveCode = (codeToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newCodes = selectedCodes.filter((c) => c !== codeToRemove);
    onChange(newCodes.join(', '));
  };

  // Select all currently filtered items
  const handleSelectAllVisible = () => {
    const combined = Array.from(new Set([...selectedCodes, ...filteredItems.map((item) => item.code)]));
    onChange(combined.join(', '));
  };

  // Deselect all
  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange('');
  };

  // Handle Quick Add New Personnel
  const handleSaveQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddName.trim()) {
      onShowToast?.('Nama personil harus diisi');
      return;
    }

    if (quickAddType === 'karyawan') {
      const newKode = `00${(localKaryawan.length + 10).toString().padStart(3, '0')}`;
      const newKaryawan: KaryawanItem = {
        id: `karyawan-${Date.now()}`,
        kodeKaryawan: newKode,
        namaLengkap: quickAddName.trim(),
        namaPanggilan: quickAddNick.trim() || quickAddName.trim(),
        divisi: quickAddDivisi,
        emailLogin: `${quickAddNick.toLowerCase().replace(/\s+/g, '') || 'staff'}@sapa.org`,
        password: 'password123',
        avatarInitial: (quickAddNick.trim() || quickAddName.trim()).slice(0, 1).toUpperCase(),
        avatarBg: '#008d91',
        aktif: true,
      };
      const updated = [newKaryawan, ...localKaryawan];
      setLocalKaryawan(updated);
      try {
        localStorage.setItem(KARYAWAN_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}

      // Automatically add new person to selection
      const newCodes = Array.from(new Set([...selectedCodes, newKode]));
      onChange(newCodes.join(', '));
      onShowToast?.(`Karyawan "${newKaryawan.namaLengkap}" berhasil ditambahkan sebagai PIC`);
    } else {
      const newKode = `ID-${(localIdentitas.length + 1).toString().padStart(3, '0')}`;
      const newIdentitas: IdentitasItem = {
        id: `identitas-${Date.now()}`,
        codeId: newKode,
        nomorIdentitas: newKode,
        namaLengkap: quickAddName.trim(),
        namaPanggilan: quickAddNick.trim() || quickAddName.trim(),
        jenisKelamin: 'L',
        tanggalLahir: '2000-01-01',
        nomorHandPhone: '',
        bhanteLay: 'Lay',
        organisasi: 'Individu',
        status: '-',
        custDuration: '-',
        lastContacted: new Date().toISOString().slice(0, 10),
        pic: 'Admin',
        avatarInitial: quickAddName.slice(0, 1).toUpperCase(),
        avatarBg: '#008d91',
      };
      const updated = [newIdentitas, ...localIdentitas];
      setLocalIdentitas(updated);
      try {
        localStorage.setItem(IDENTITAS_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}

      // Automatically add new person to selection
      const newCodes = Array.from(new Set([...selectedCodes, newKode]));
      onChange(newCodes.join(', '));
      onShowToast?.(`Personil "${newIdentitas.namaLengkap}" berhasil ditambahkan sebagai PIC`);
    }

    setQuickAddName('');
    setQuickAddNick('');
    setShowQuickAddModal(false);
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 ${className}`} ref={containerRef}>
      {/* Label */}
      <div className="w-full sm:w-72 lg:w-80 shrink-0 pt-2.5">
        <label className="text-slate-700 font-normal text-sm sm:text-base flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#008d91]" />
            {label}
          </span>
          {selectedCodes.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#008d91]/10 text-[#008d91]">
              {selectedCodes.length} PIC
            </span>
          )}
        </label>
        <p className="text-[11px] text-slate-400 mt-0.5">Bisa pilih lebih dari 1 personil</p>
      </div>

      {/* Selector Container */}
      <div className="w-full max-w-xl relative">
        {/* Trigger Button with Selected Pills */}
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className={`min-h-[46px] sm:min-h-[48px] w-full bg-white border rounded-xl p-2 sm:p-2.5 cursor-pointer transition-all flex items-center justify-between gap-2 shadow-xs ${
            isOpen
              ? 'border-[#008d91] ring-2 ring-[#008d91]/20 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Selected items badges / placeholder */}
          <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
            {selectedCodes.length === 0 ? (
              <span className="text-slate-400 text-sm px-1.5 py-0.5 select-none">{placeholder}</span>
            ) : (
              selectedCodes.map((code) => {
                const item = itemsMap.get(code) || itemsMap.get(code.toLowerCase());
                const displayName = item ? item.name : code;
                const categoryColor =
                  item?.category === 'identitas'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : item?.category === 'organisasi'
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-teal-50 text-teal-800 border-teal-200';

                return (
                  <span
                    key={code}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${categoryColor} shadow-2xs group`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-bold opacity-75">[{code}]</span>
                    <span className="truncate max-w-[140px] sm:max-w-[180px]">{displayName}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveCode(code, e)}
                      title={`Hapus ${displayName}`}
                      className="text-slate-400 hover:text-red-500 rounded p-0.5 hover:bg-white/60 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
            {selectedCodes.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                title="Hapus semua PIC yang dipilih"
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#008d91]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-full z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Search and Filter Tabs */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode, nama personil, divisi..."
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] text-slate-800 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                {[
                  { key: 'all', label: 'Semua', count: allItems.length },
                  { key: 'karyawan', label: 'Karyawan', count: localKaryawan.length },
                  { key: 'identitas', label: 'Identitas', count: localIdentitas.length },
                  { key: 'organisasi', label: 'Organisasi', count: localOrganisasi.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-[#008d91] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick Summary & Action Bar */}
              <div className="flex items-center justify-between text-xs pt-1 px-0.5 text-slate-500">
                <span className="font-medium">
                  {selectedCodes.length > 0 ? (
                    <span className="text-[#008d91] font-bold">
                      {selectedCodes.length} PIC terpilih
                    </span>
                  ) : (
                    'Belum ada PIC dipilih'
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="text-[#008d91] hover:underline font-medium hover:text-[#007b7e]"
                  >
                    Pilih Semua ({filteredItems.length})
                  </button>
                  {selectedCodes.length > 0 && (
                    <>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-red-500 hover:underline font-medium hover:text-red-600"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* List of Persons / Personnel (NO Avatar Images, Clean and Distinct) */}
            <div ref={listRef} className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Tidak ditemukan personil sesuai pencarian.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isChecked = selectedCodes.includes(item.code);
                  return (
                    <div
                      key={`${item.category}-${item.id}`}
                      onClick={() => handleToggleItem(item.code)}
                      className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-50/80 hover:bg-teal-100/70 border border-teal-200/60'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {/* Checkbox and Text Info (No Image!) */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Custom Teal Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                            isChecked
                              ? 'bg-[#008d91] border-[#008d91] text-white shadow-2xs'
                              : 'border-slate-300 bg-white hover:border-[#008d91]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Person Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.code}
                            </span>
                            <span className="font-semibold text-sm text-slate-900 truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span
                              className={`text-[10px] font-medium uppercase px-1.5 py-0.2 rounded ${
                                item.category === 'identitas'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.category === 'organisasi'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.category}
                            </span>
                            <span className="truncate">{item.subtitle}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right indicator if checked */}
                      {isChecked && (
                        <span className="shrink-0 text-xs font-semibold text-[#008d91] bg-teal-100/80 px-2 py-0.5 rounded-full">
                          Dipilih
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Quick Add Button & Done Button */}
            <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowQuickAddModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008d91] hover:text-[#007b7e] py-1.5 px-2.5 rounded-lg hover:bg-teal-50/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Tambah Personil Cepat</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-[#008d91] hover:bg-[#007b7e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Selesai ({selectedCodes.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Person Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#008d91]" />
                <h3 className="font-bold text-slate-800 text-base">Tambah Personil Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAdd} className="space-y-3.5">
              {/* Tipe Personil */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Personil</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAddType('karyawan')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      quickAddType === 'karyawan'
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Karyawan
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAddType('identitas')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      quickAddType === 'identitas'
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IdCard className="w-4 h-4" />
                    Identitas / Mitra
                  </button>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  placeholder="Contoh: Silvia Fukada"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                />
              </div>

              {/* Nama Panggilan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Panggilan</label>
                <input
                  type="text"
                  value={quickAddNick}
                  onChange={(e) => setQuickAddNick(e.target.value)}
                  placeholder="Contoh: Silvia"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                />
              </div>

              {quickAddType === 'karyawan' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Divisi</label>
                    <select
                      value={quickAddDivisi}
                      onChange={(e) => setQuickAddDivisi(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                    >
                      <option value="PNB">PNB</option>
                      <option value="MAD">MAD</option>
                      <option value="KEU">KEU</option>
                      <option value="FUN">FUN</option>
                      <option value="UMM">UMM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan</label>
                    <input
                      type="text"
                      value={quickAddJabatan}
                      onChange={(e) => setQuickAddJabatan(e.target.value)}
                      placeholder="Staff / Koordinator"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7e] rounded-xl shadow-xs"
                >
                  Simpan & Pilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
