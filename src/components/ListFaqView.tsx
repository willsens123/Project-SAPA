import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  EyeOff,
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  X,
  Check,
  User,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { FaqItem, TentangFaqItem } from '../faqData';
import { ProjectItem } from '../types';

export type FaqTabType = 'all' | 'ongoing' | 'selesai';

interface ListFaqViewProps {
  items: FaqItem[];
  tentangList: TentangFaqItem[];
  projects: ProjectItem[];
  onAddClick: () => void;
  onEditClick: (item: FaqItem) => void;
  onDeleteClick: (id: string) => void;
  onManageTentangClick?: () => void;
  onShowToast: (msg: string) => void;
}

export const ListFaqView: React.FC<ListFaqViewProps> = ({
  items,
  tentangList,
  projects,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onManageTentangClick,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<FaqTabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedTentang, setSelectedTentang] = useState<string>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showTentangBadgeDropdown, setShowTentangBadgeDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tentangBadgeRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (
        tentangBadgeRef.current &&
        !tentangBadgeRef.current.contains(e.target as Node)
      ) {
        setShowTentangBadgeDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to determine project status for a FAQ item
  const getFaqProjectStatus = (faq: FaqItem): 'Done' | 'Ongoing' | null => {
    if (!faq.isProyekSapa && !faq.proyekId) {
      // Check if tentang matches any project's namaKegiatan
      const matched = projects.find(
        (p) => p.namaKegiatan.toLowerCase() === faq.tentang.toLowerCase()
      );
      if (matched) {
        return matched.status === 'Done' ? 'Done' : 'Ongoing';
      }
      return null; // Not a project FAQ, general FAQ
    }

    const proj = projects.find((p) => p.id === faq.proyekId);
    if (proj) {
      return proj.status === 'Done' ? 'Done' : 'Ongoing';
    }
    return 'Ongoing';
  };

  // Filter items based on 3 tabs as requested:
  // Tab 1: All - Semua List FAQ kecuali Proyek SAPA yang sudah selesai
  // Tab 2: Proyek SAPA ongoing - hanya munculnya proyek SAPA yang masih berjalan
  // Tab 3: Proyek SAPA selesai - tampilkan FAQ dari proyek yang sudah selesai
  const tabFilteredItems = useMemo(() => {
    return items.filter((faq) => {
      const projStatus = getFaqProjectStatus(faq);

      if (activeTab === 'all') {
        // Exclude completed projects
        if (projStatus === 'Done') return false;
        return true;
      }

      if (activeTab === 'ongoing') {
        // Only ongoing projects
        return projStatus === 'Ongoing';
      }

      if (activeTab === 'selesai') {
        // Only completed projects
        return projStatus === 'Done';
      }

      return true;
    });
  }, [items, activeTab, projects]);

  // Secondary filter by search and selected Tentang
  const finalFilteredItems = useMemo(() => {
    return tabFilteredItems.filter((faq) => {
      const matchTentang =
        selectedTentang === 'All' || faq.tentang === selectedTentang;
      const matchSearch =
        !searchQuery.trim() ||
        faq.tentang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.jawaban.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTentang && matchSearch;
    });
  }, [tabFilteredItems, selectedTentang, searchQuery]);

  // Distinct list of Tentang for filtering
  const allTentangOptions = useMemo(() => {
    const set = new Set<string>();
    tentangList.forEach((t) => set.add(t.tentang));
    items.forEach((i) => set.add(i.tentang));
    return Array.from(set);
  }, [tentangList, items]);

  const handleCopyFaq = (item: FaqItem) => {
    const text = `Pertanyaan: ${item.pertanyaan}\nJawaban: ${item.jawaban}`;
    navigator.clipboard.writeText(text);
    onShowToast(`FAQ "${item.pertanyaan}" berhasil disalin`);
    setOpenMenuId(null);
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Section: Tabs on Left, Toolbar on Right matching Transaksi S-SALUR and Identitas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* 3 Tabs matching Transaksi S-SALUR tab buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all shadow-xs ${
              activeTab === 'all'
                ? 'bg-[#008d91] text-white'
                : 'bg-[#a8a8a8] hover:bg-[#999999] text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ongoing')}
            className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all shadow-xs ${
              activeTab === 'ongoing'
                ? 'bg-[#008d91] text-white'
                : 'bg-[#a8a8a8] hover:bg-[#999999] text-white'
            }`}
          >
            Proyek SAPA ongoing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('selesai')}
            className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-all shadow-xs ${
              activeTab === 'selesai'
                ? 'bg-[#008d91] text-white'
                : 'bg-[#a8a8a8] hover:bg-[#999999] text-white'
            }`}
          >
            Proyek SAPA selesai
          </button>
        </div>

        {/* Top Right Toolbar matching Transaksi S-SALUR and Identitas */}
        <div className="flex items-center gap-3 self-end sm:self-auto relative">
            {showSearchInput && (
              <div className="relative animate-in fade-in slide-in-from-right-3 duration-200">
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl px-3 py-1.5 w-44 sm:w-60 outline-none focus:border-[#008d91] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              title="Sensor / Visibility"
            >
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            </button>

            <button
              type="button"
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showSearchInput
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Cari"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  showFilterDropdown || selectedTentang !== 'All'
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Filter Tentang"
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Filter Kategori Tentang
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTentang('All');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between ${
                      selectedTentang === 'All'
                        ? 'text-[#008d91] bg-teal-50 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>All (Semua Tentang)</span>
                    {selectedTentang === 'All' && (
                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                    )}
                  </button>
                  {allTentangOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedTentang(opt);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between ${
                        selectedTentang === opt
                          ? 'text-[#008d91] bg-teal-50 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {selectedTentang === opt && (
                        <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* + Add Button */}
            <button
              type="button"
              onClick={onAddClick}
              className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Main Card Container matching Transaksi S-SALUR and Identitas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col p-4 sm:p-6 min-h-[520px] justify-between">
          <div>
            {/* Right Badge Widget matching Image 1: Teal Pill with Tentang: All & Logo Tentang List FAQ */}
            <div className="flex justify-end mb-3 relative" ref={tentangBadgeRef}>
          <button
            type="button"
            onClick={() => setShowTentangBadgeDropdown(!showTentangBadgeDropdown)}
            className="inline-flex items-center gap-3.5 bg-[#008d91] hover:bg-[#007a7e] text-white px-5 py-2 rounded-2xl cursor-pointer shadow-xs transition-all group select-none text-left"
            title="Filter Kolom Tentang"
          >
            <div>
              <div className="text-[11px] text-teal-100 font-medium leading-none">
                Tentang
              </div>
              <div className="text-xs sm:text-sm font-bold leading-tight mt-0.5">
                {selectedTentang}
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white text-[#008d91] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4 stroke-[2.4] text-[#008d91]" />
            </div>
          </button>

          {/* Filter Dropdown when Badge is clicked */}
          {showTentangBadgeDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 mb-1 flex items-center justify-between">
                <span>Filter Kolom Tentang</span>
                {selectedTentang !== 'All' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTentang('All');
                    }}
                    className="text-[10px] text-[#008d91] hover:underline normal-case font-semibold cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* All Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTentang('All');
                  setShowTentangBadgeDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold cursor-pointer rounded-xl flex items-center justify-between transition-colors ${
                  selectedTentang === 'All'
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>All (Semua Tentang)</span>
                {selectedTentang === 'All' && (
                  <Check className="w-3.5 h-3.5 text-[#008d91]" />
                )}
              </button>

              {/* Group A: Tentang List FAQ */}
              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tentang List FAQ
                </div>
                {tentangList.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTentang(t.tentang);
                      setShowTentangBadgeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer rounded-xl flex items-center justify-between transition-colors ${
                      selectedTentang === t.tentang
                        ? 'text-[#008d91] bg-teal-50 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{t.tentang}</span>
                    {selectedTentang === t.tentang && (
                      <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Group B: Proyek SAPA */}
              {allTentangOptions.filter(
                (opt) => !tentangList.some((t) => t.tentang === opt)
              ).length > 0 && (
                <div className="pt-2 border-t border-slate-100 mt-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Proyek SAPA
                  </div>
                  {allTentangOptions
                    .filter(
                      (opt) => !tentangList.some((t) => t.tentang === opt)
                    )
                    .map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedTentang(opt);
                          setShowTentangBadgeDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer rounded-xl flex items-center justify-between transition-colors ${
                          selectedTentang === opt
                            ? 'text-[#008d91] bg-teal-50 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {selectedTentang === opt && (
                          <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                        )}
                      </button>
                    ))}
                </div>
              )}

              {/* Manage Master Link */}
              {onManageTentangClick && (
                <div className="pt-2 border-t border-slate-100 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTentangBadgeDropdown(false);
                      onManageTentangClick();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#008d91] hover:bg-teal-50 rounded-xl flex items-center justify-between font-semibold transition-colors cursor-pointer"
                  >
                    <span>Kelola Master Tentang List FAQ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table Content matching Image 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-800 text-xs sm:text-sm font-semibold tracking-wide">
                <th className="py-4 pl-2 pr-6 w-36 sm:w-48 font-semibold text-slate-800">
                  Tentang
                </th>
                <th className="py-4 px-6 w-1/4 sm:w-72 font-semibold text-slate-800">
                  Pertanyaan
                </th>
                <th className="py-4 px-6 font-semibold text-slate-800">
                  Jawaban
                </th>
                <th className="py-4 pr-2 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finalFilteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada FAQ yang ditemukan pada tab ini.
                  </td>
                </tr>
              ) : (
                finalFilteredItems.map((faq) => {
                  const projStatus = getFaqProjectStatus(faq);

                  return (
                    <tr
                      key={faq.id}
                      className="hover:bg-slate-50/60 transition-colors group align-top"
                    >
                      {/* Column 1: Tentang */}
                      <td className="py-5 pl-2 pr-6">
                        <div className="text-xs sm:text-sm text-slate-800 font-medium tracking-wide">
                          {faq.tentang}
                        </div>
                        {projStatus && (
                          <div className="mt-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                projStatus === 'Done'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              Proyek {projStatus === 'Done' ? 'Selesai' : 'Ongoing'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 2: Pertanyaan */}
                      <td className="py-5 px-6">
                        <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                          {faq.pertanyaan}
                        </div>
                      </td>

                      {/* Column 3: Jawaban */}
                      <td className="py-5 px-6">
                        <div className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed whitespace-pre-wrap max-w-3xl">
                          {faq.jawaban}
                        </div>
                      </td>

                      {/* Column 4: 3-dots Menu */}
                      <td className="py-5 pr-2 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === faq.id ? null : faq.id
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === faq.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                type="button"
                                onClick={() => handleCopyFaq(faq)}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Salin FAQ</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onEditClick(faq);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onDeleteClick(faq.id);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};
