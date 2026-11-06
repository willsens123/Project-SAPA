import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  X,
  Building2,
  User,
} from 'lucide-react';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { OrganisasiItem } from '../types';
import { INITIAL_ORGANISASI } from '../organisasiData';

export interface IdentitasIdSelectorItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  avatarInitial: string;
  avatarBg: string;
  type: 'identitas' | 'organisasi';
  rawIdentitas?: IdentitasItem;
  rawOrganisasi?: OrganisasiItem;
}

export const NO_NAME_SELECTOR_ITEM: IdentitasIdSelectorItem = {
  id: 'no-name',
  code: 'No Name',
  name: 'No Name',
  subtitle: 'Anonim / Tanpa Identitas',
  avatarInitial: 'NN',
  avatarBg: 'bg-slate-500',
  type: 'identitas',
};

interface IdentitasIdSelectorProps {
  value: string;
  onSelect: (item: IdentitasIdSelectorItem) => void;
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  onNavigateView?: (view: 'formIdentitas' | 'formOrganisasi') => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const IDENTITAS_STORAGE_KEY = 'identitas_data_v1';
const ORGANISASI_STORAGE_KEY = 'organisasi_data_v1';

export const IdentitasIdSelector: React.FC<IdentitasIdSelectorProps> = ({
  value,
  onSelect,
  identitasList: propIdentitasList,
  organisasiList: propOrganisasiList,
  onNavigateView,
  placeholder = 'Search...',
  className = '',
  id = 'identitas-id-selector',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'identitas' | 'organisasi'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Live storage sync
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

  // Keep synced with props
  useEffect(() => {
    if (propIdentitasList && propIdentitasList.length > 0) {
      setLocalIdentitas(propIdentitasList);
    }
  }, [propIdentitasList]);

  useEffect(() => {
    if (propOrganisasiList && propOrganisasiList.length > 0) {
      setLocalOrganisasi(propOrganisasiList);
    }
  }, [propOrganisasiList]);

  // Real-time synchronization with localStorage and custom window events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedId = localStorage.getItem(IDENTITAS_STORAGE_KEY);
        if (savedId) setLocalIdentitas(JSON.parse(savedId));
      } catch (_) {}
      try {
        const savedOrg = localStorage.getItem(ORGANISASI_STORAGE_KEY);
        if (savedOrg) setLocalOrganisasi(JSON.parse(savedOrg));
      } catch (_) {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('identitas-updated' as any, handleStorageChange);
    window.addEventListener('organisasi-updated' as any, handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('identitas-updated' as any, handleStorageChange);
      window.removeEventListener('organisasi-updated' as any, handleStorageChange);
    };
  }, []);

  // Format phone to 08...
  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    let p = phone.trim();
    if (p.startsWith('+62')) {
      p = '0' + p.substring(3);
    }
    return p;
  };

  // Convert identitas & organisasi into unified list
  const allItems = useMemo<IdentitasIdSelectorItem[]>(() => {
    const items: IdentitasIdSelectorItem[] = [];
    const seenIds = new Set<string>();

    // Identitas
    localIdentitas.forEach((idItem, idx) => {
      const uniqueId = idItem.id || `id-${idx}`;
      if (seenIds.has(uniqueId)) return;
      seenIds.add(uniqueId);

      const code = idItem.codeId || idItem.id || `000${idx + 1}`;
      // Subtitle: if Cindy Budiman or has alias Ci Pao, show alias, else phone
      let subtitle = formatPhone(idItem.nomorHandPhone);
      if (idItem.namaPanggilan === 'Ci Pao' || idItem.codeId === '00019') {
        subtitle = 'Ci Pao';
      } else if (!idItem.nomorHandPhone && idItem.namaPanggilan) {
        subtitle = idItem.namaPanggilan;
      }

      // Color mapping matching image
      let avatarBg = idItem.avatarBg || 'bg-[#10b981]';
      if (idItem.codeId === '00031' || idItem.namaLengkap.toLowerCase().includes('agustino')) {
        avatarBg = 'bg-[#10b981]'; // Emerald/Teal green from image
      } else if (idItem.codeId === '00019' || idItem.namaLengkap.toLowerCase().includes('cindy')) {
        avatarBg = 'bg-[#eab308]'; // Yellow from image
      }

      items.push({
        id: uniqueId,
        code: code,
        name: idItem.namaLengkap,
        subtitle: subtitle,
        avatarInitial: (idItem.avatarInitial || idItem.namaLengkap.charAt(0) || 'A').toUpperCase(),
        avatarBg: avatarBg,
        type: 'identitas',
        rawIdentitas: idItem,
      });
    });

    // Organisasi
    localOrganisasi.forEach((orgItem, idx) => {
      const code = orgItem.picOrgCode || `ORG-${idx + 1}`;
      const subtitle = orgItem.hp ? formatPhone(orgItem.hp) : orgItem.jenisOrg || 'Organisasi';

      items.push({
        id: orgItem.id,
        code: code,
        name: orgItem.namaOrg,
        subtitle: subtitle,
        avatarInitial: (orgItem.avatarInitial || orgItem.namaOrg.charAt(0) || 'O').toUpperCase(),
        avatarBg: orgItem.avatarBg || 'bg-[#0d9488]',
        type: 'organisasi',
        rawOrganisasi: orgItem,
      });
    });

    // Ensure NO_NAME_SELECTOR_ITEM is always first
    const hasNoName = items.some(
      (it) => it.id === 'no-name' || it.name.toLowerCase() === 'no name'
    );
    if (!hasNoName) {
      items.unshift(NO_NAME_SELECTOR_ITEM);
    }

    return items;
  }, [localIdentitas, localOrganisasi]);

  // Filter items based on activeTab and searchQuery
  const filteredItems = useMemo(() => {
    let list = allItems;
    if (activeTab === 'identitas') {
      list = list.filter((i) => i.type === 'identitas');
    } else if (activeTab === 'organisasi') {
      list = list.filter((i) => i.type === 'organisasi');
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [allItems, activeTab, searchQuery]);

  // Handle outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Navigation when no results
  const handleNavigate = (view: 'formIdentitas' | 'formOrganisasi') => {
    setIsOpen(false);
    if (onNavigateView) {
      onNavigateView(view);
    } else {
      window.dispatchEvent(new CustomEvent('app-navigate-view', { detail: view }));
    }
  };

  const handleSelectItem = (item: IdentitasIdSelectorItem) => {
    onSelect(item);
    setSearchQuery('');
    setIsOpen(false);
  };

  // Scroll helpers for custom scrollbar buttons
  const handleScrollUp = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: -80, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: 80, behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-md ${className}`}>
      {/* Search Input / Trigger matching image (2).png */}
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between transition-colors shadow-2xs cursor-pointer ${
          isOpen
            ? 'border-[#008d91] ring-1 ring-[#008d91]'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span
          className={`text-xs sm:text-sm truncate select-none ${
            value ? 'text-slate-800 font-medium' : 'text-slate-400'
          }`}
        >
          {value || placeholder}
        </span>
        <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs ml-2">
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
        </div>
      </div>

      {/* Popover Dropdown matching exact image (2).png */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200/90 rounded-3xl shadow-xl p-4 sm:p-5 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Top Pill Filter Tabs matching exact design */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'all'
                  ? 'bg-[#008d91] text-white shadow-xs'
                  : 'bg-[#a3a3a3] hover:bg-[#949494] text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('identitas')}
              className={`flex-1 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'identitas'
                  ? 'bg-[#008d91] text-white shadow-xs'
                  : 'bg-[#a3a3a3] hover:bg-[#949494] text-white'
              }`}
            >
              Identitas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organisasi')}
              className={`flex-1 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'organisasi'
                  ? 'bg-[#008d91] text-white shadow-xs'
                  : 'bg-[#a3a3a3] hover:bg-[#949494] text-white'
              }`}
            >
              Organisasi
            </button>
          </div>

          {/* Search query field inside dropdown for fast typing */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Cari ID, nama, atau no HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick No Name Shortcut Option */}
          <button
            type="button"
            onClick={() => handleSelectItem(NO_NAME_SELECTOR_ITEM)}
            className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-[#008d91]/50 text-left transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:bg-[#008d91] transition-colors">
                NN
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-800">No Name</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-semibold">
                    Anonim
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 truncate">
                  Pilih opsi pembeli / peserta / donatur tanpa nama
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#008d91] shrink-0 ml-2 group-hover:underline">
              Pilih
            </span>
          </button>

          {/* List Container with side scrollbar matching image (2).png */}
          <div className="relative flex items-stretch gap-1.5">
            {/* Main Item List */}
            <div
              ref={listRef}
              className="flex-1 max-h-72 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar"
            >
              {filteredItems.length === 0 ? (
                /* Empty state with buttons to Tambahkan Identitas / Organisasi */
                <div className="py-7 px-3 flex flex-col items-center justify-center text-center gap-2.5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {searchQuery
                      ? `"${searchQuery}" tidak ditemukan`
                      : 'Data tidak tersedia'}
                  </p>

                  {/* Dynamic actions based on user requirement */}
                  {activeTab === 'identitas' && (
                    <button
                      type="button"
                      onClick={() => handleNavigate('formIdentitas')}
                      className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#05828e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Tambahkan Identitas</span>
                    </button>
                  )}

                  {activeTab === 'organisasi' && (
                    <button
                      type="button"
                      onClick={() => handleNavigate('formOrganisasi')}
                      className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#05828e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Tambahkan Organisasi</span>
                    </button>
                  )}

                  {activeTab === 'all' && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleNavigate('formIdentitas')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#008d91] hover:bg-[#05828e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Tambahkan Identitas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('formOrganisasi')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Tambahkan Organisasi</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected =
                    value === `${item.code} ${item.name}` ||
                    value === item.name ||
                    value === item.id;
                  // First item or selected item has light cyan card matching image (2).png
                  const isHighlighted = isSelected || idx === 0;

                  return (
                    <div
                      key={`${item.type}-${item.id}-${idx}`}
                      onClick={() => handleSelectItem(item)}
                      className={`rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 cursor-pointer transition-all ${
                        isHighlighted
                          ? 'bg-[#f0f7f9] border border-[#d2ecf2]'
                          : 'bg-white hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {/* Avatar circle matching exact colors and size in image (2).png */}
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shrink-0 shadow-xs ${item.avatarBg}`}
                      >
                        {item.avatarInitial}
                      </div>

                      {/* Info lines */}
                      <div className="flex flex-col min-w-0 truncate">
                        <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                          {item.code ? `${item.code} ` : ''}
                          {item.name}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5 truncate">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Custom Vertical Scrollbar matching right edge in image (2).png */}
            {filteredItems.length > 2 && (
              <div className="w-3.5 flex flex-col items-center justify-between py-1 shrink-0 select-none">
                <button
                  type="button"
                  onClick={handleScrollUp}
                  className="w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                  title="Scroll Up"
                >
                  <ChevronUp className="w-2.5 h-2.5 stroke-[3]" />
                </button>
                <div className="w-1.5 flex-1 my-1 bg-slate-200 rounded-full relative overflow-hidden">
                  <div className="w-full h-1/2 bg-[#008d91] rounded-full" />
                </div>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  className="w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                  title="Scroll Down"
                >
                  <ChevronDown className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
