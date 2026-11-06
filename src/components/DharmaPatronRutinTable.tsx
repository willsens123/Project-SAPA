import React, { useState, useRef, useMemo } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Check,
  MessageSquare,
  FolderPlus,
  FolderInput,
  FileText,
} from 'lucide-react';
import { FunnelingActionBar } from './FunnelingActionBar';
import { DharmaPatronRutinItem, OrganisasiItem, MutasiItem } from '../types';
import { IdentitasItem } from '../identitasData';
import { DHARMA_PATRON_YEAR_STATS, YearPatronStat } from '../dharmaPatronRutinData';
import { EditDonasiBulanModal } from './EditDonasiBulanModal';
import { PeriodeKeaktifanModal, isDharmaPatronAktif, isPatronAktifInYear } from './PeriodeKeaktifanModal';
import { PersonWithGlassesIcon } from './PersonWithGlassesIcon';
import { DonasiOrder, INITIAL_DONASI_ORDERS } from '../donasiData';
import {
  getDharmaPatronWithRealtimePiutang,
  getPatronProportionsMap,
} from '../utils/dharmaPatronPiutangHelper';
import { ModalSummaryPembayaranPatron } from './ModalSummaryPembayaranPatron';
import {
  DharmaPatronProportionChart,
  PatronTableRowProgressBar,
} from './DharmaPatronProportionChart';

interface DharmaPatronRutinTableProps {
  items: DharmaPatronRutinItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  donasiOrders?: DonasiOrder[];
  mutasiItems?: MutasiItem[];
  onAddClick: () => void;
  onEditItem: (item: DharmaPatronRutinItem) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem?: (item: DharmaPatronRutinItem) => void;
  onSaveDonasi?: (updatedItem: DharmaPatronRutinItem) => void;
  jenisOptions?: string[];
  onNavigateToJenisTable?: () => void;
  onShowToast?: (message: string) => void;
  onKirimPM?: (targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
}

export const DharmaPatronRutinTable: React.FC<DharmaPatronRutinTableProps> = ({
  items,
  identitasList = [],
  organisasiList = [],
  donasiOrders,
  mutasiItems = [],
  onAddClick,
  onEditItem,
  onDeleteItem,
  onDuplicateItem,
  onSaveDonasi,
  jenisOptions,
  onNavigateToJenisTable,
  onShowToast,
  onKirimPM,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGroupJarkom, setSelectedGroupJarkom] = useState('ALL');
  const [selectedAfiliasi, setSelectedAfiliasi] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [proportionFilter, setProportionFilter] = useState<'ALL' | 'LUNAS' | 'PIUTANG' | 'DIPUTIHKAN'>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedPatronIds, setSelectedPatronIds] = useState<string[]>([]);

  // Edit Donasi/bulan Modal state
  const [editDonasiItem, setEditDonasiItem] = useState<DharmaPatronRutinItem | null>(null);
  const [isEditDonasiOpen, setIsEditDonasiOpen] = useState(false);

  // Periode Keaktifan Modal state
  const [selectedPeriodeItem, setSelectedPeriodeItem] = useState<DharmaPatronRutinItem | null>(null);
  const [isPeriodeModalOpen, setIsPeriodeModalOpen] = useState(false);

  // Summary Pembayaran Modal state
  const [selectedSummaryPatron, setSelectedSummaryPatron] = useState<DharmaPatronRutinItem | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
      setIsFilterOpen(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Effective donasi orders from prop or localStorage
  const effectiveDonasiOrders = useMemo<DonasiOrder[]>(() => {
    let list: DonasiOrder[] = [];
    if (donasiOrders && donasiOrders.length > 0) {
      list = donasiOrders;
    } else {
      try {
        const saved = localStorage.getItem('transaksi_donasi_orders_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Merge with INITIAL_DONASI_ORDERS so patron transactions are guaranteed present
    const map = new Map<string, DonasiOrder>();
    INITIAL_DONASI_ORDERS.forEach((o) => map.set(o.id, o));
    list.forEach((o) => map.set(o.id, o));
    return Array.from(map.values());
  }, [donasiOrders]);

  // Real-time items with live Piutang & Bulan Piutang calculated from Transaksi D-DONASI Lunas
  const realtimeItems = useMemo(() => {
    return getDharmaPatronWithRealtimePiutang(items, effectiveDonasiOrders, mutasiItems);
  }, [items, effectiveDonasiOrders, mutasiItems]);

  // Precomputed financial proportions for all patrons (O(1) row rendering)
  const { aggregate: proportionAggregate, map: proportionMap } = useMemo(() => {
    return getPatronProportionsMap(realtimeItems, effectiveDonasiOrders, mutasiItems);
  }, [realtimeItems, effectiveDonasiOrders, mutasiItems]);

  const uniqueJarkom = ['ALL', ...Array.from(new Set(realtimeItems.map((it) => it.groupJarkom).filter(Boolean)))];
  const uniqueAfiliasi = ['ALL', ...Array.from(new Set(realtimeItems.map((it) => it.afiliasiKci).filter(Boolean)))];

  const hasFilterActive =
    selectedGroupJarkom !== 'ALL' ||
    selectedAfiliasi !== 'ALL' ||
    selectedYear !== null ||
    proportionFilter !== 'ALL';

  // Helper to get connected Identitas or Organisasi live in real time
  const getConnectedEntity = (item: DharmaPatronRutinItem) => {
    if (identitasList && identitasList.length > 0) {
      if (item.identitasId) {
        const found = identitasList.find((id) => id.codeId === item.identitasId || id.id === item.identitasId);
        if (found) return { type: 'identitas' as const, identitas: found };
      }
      const foundByName = identitasList.find((id) => id.namaLengkap.toLowerCase().trim() === item.namaDonatur.toLowerCase().trim());
      if (foundByName) return { type: 'identitas' as const, identitas: foundByName };
    }
    if (organisasiList && organisasiList.length > 0) {
      if (item.identitasId) {
        const foundOrg = organisasiList.find((org) => org.id === item.identitasId || org.namaOrg.toLowerCase().trim() === item.identitasId.toLowerCase().trim());
        if (foundOrg) return { type: 'organisasi' as const, organisasi: foundOrg };
      }
      const foundOrgByName = organisasiList.find((org) => org.namaOrg.toLowerCase().trim() === item.namaDonatur.toLowerCase().trim());
      if (foundOrgByName) return { type: 'organisasi' as const, organisasi: foundOrgByName };
    }
    return null;
  };

  // Calculate real-time active patron statistics per year
  const yearStats = useMemo(() => {
    const allItemYears = realtimeItems.flatMap((it) => {
      const years: number[] = [];
      const startMatch = it.tanggalBergabung?.match(/\b(19\d\d|20\d\d)\b/);
      if (startMatch) years.push(parseInt(startMatch[1], 10));
      const stopMatch = it.tanggalBerhenti?.match(/\b(19\d\d|20\d\d)\b/);
      if (stopMatch) years.push(parseInt(stopMatch[1], 10));
      return years;
    });

    const currentYear = new Date().getFullYear();
    const minYear = allItemYears.length > 0 ? Math.min(2017, ...allItemYears) : 2017;
    const maxYear = allItemYears.length > 0 ? Math.max(currentYear, ...allItemYears) : currentYear;

    const stats: { year: string; count: number }[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      const yearStr = String(y);
      const activeCount = realtimeItems.filter((it) => isPatronAktifInYear(it, y)).length;
      stats.push({
        year: yearStr,
        count: activeCount,
      });
    }
    return stats;
  }, [realtimeItems]);

  const filteredItems = realtimeItems.filter((item) => {
    if (selectedGroupJarkom !== 'ALL' && item.groupJarkom !== selectedGroupJarkom) return false;
    if (selectedAfiliasi !== 'ALL' && item.afiliasiKci !== selectedAfiliasi) return false;
    if (selectedYear && !isPatronAktifInYear(item, selectedYear)) return false;

    // Filter by financial proportion status
    if (proportionFilter === 'LUNAS') {
      const prop = proportionMap.get(item.id);
      if (!prop || !prop.isFullyPaid) return false;
    } else if (proportionFilter === 'PIUTANG') {
      const prop = proportionMap.get(item.id);
      if (!prop || prop.totalUnpaidMonths === 0) return false;
    } else if (proportionFilter === 'DIPUTIHKAN') {
      const prop = proportionMap.get(item.id);
      if (!prop || prop.totalDiputihkanMonths === 0) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.namaDonatur.toLowerCase().includes(q) ||
      item.noDonatur.toLowerCase().includes(q) ||
      item.panggilan.toLowerCase().includes(q) ||
      item.sumber.toLowerCase().includes(q) ||
      item.groupJarkom.toLowerCase().includes(q) ||
      item.namaRekening.toLowerCase().includes(q) ||
      item.afiliasiKci.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q)
    );
  });

  const formatRupiah = (val: number) => {
    if (val === 0) return 'Rp0';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('id-ID').format(absVal);
    return isNeg ? `-Rp${formatted}` : `Rp${formatted}`;
  };

  const isAllSelected =
    filteredItems.length > 0 &&
    selectedPatronIds.length === filteredItems.length;

  const handleToggleSelect = (id: string) => {
    setSelectedPatronIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPatronIds([]);
    } else {
      setSelectedPatronIds(filteredItems.map((item) => item.id));
    }
  };

  const getSelectedTargetItems = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedPatronIds;
    const targetItems = realtimeItems.filter((it) => idsToUse.includes(it.id));
    return targetItems.map((it) => ({
      id: it.identitasId || it.id,
      identitasId: it.identitasId,
      nama: it.namaDonatur,
      nomorHp: it.nomorHp || '-',
      codeId: it.noDonatur,
    }));
  };

  const handleBulkCreateGroupFunneling = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    const ids = targets.map((t) => t.identitasId).filter(Boolean) as string[];
    if (onCreateGroupFunneling) {
      onCreateGroupFunneling(ids);
    }
  };

  const handleBulkTambahKeGroupExisting = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    if (onTambahKeGroupFunnelingExisting) {
      onTambahKeGroupFunnelingExisting(targets);
    }
  };

  const handleKirimPM = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedPatronIds;
    if (idsToUse.length === 0) return;
    const targets = getSelectedTargetItems(idsToUse);
    if (onKirimPM) {
      onKirimPM(targets);
    }
  };

  return (
    <div className="w-full">
      {/* Top Action Toolbar matching Image: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3 mb-4 relative">
        {/* Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="input-search-dpr"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari donatur, nomor, group jarkom..."
              autoFocus
              className="text-xs sm:text-sm text-slate-700 outline-none w-48 sm:w-72"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 ml-1"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            {/* Privacy Mask Toggle */}
            <button
              id="btn-dpr-privacy"
              type="button"
              onClick={() => {
                setIsPrivacyMasked(!isPrivacyMasked);
                if (onShowToast) {
                  onShowToast(isPrivacyMasked ? 'Nominal ditampilkan' : 'Nominal disembunyikan');
                }
              }}
              title={isPrivacyMasked ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
              aria-label={isPrivacyMasked ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
              className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              {isPrivacyMasked ? (
                <Eye className="w-5 h-5 stroke-[1.8] text-[#008d91]" />
              ) : (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            {/* Search Icon */}
            <button
              id="btn-dpr-open-search"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari Patron"
              aria-label="Cari Patron"
              className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        )}

        {/* Filter Sliders */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            id="btn-dpr-filter"
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Filter Donatur"
            aria-label="Filter Donatur"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              hasFilterActive ? 'text-[#008d91]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            {hasFilterActive && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#008d91]" />
            )}
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-40 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#008d91]" />
                  Filter Data
                </span>
                {hasFilterActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroupJarkom('ALL');
                      setSelectedAfiliasi('ALL');
                      setSelectedYear(null);
                      setProportionFilter('ALL');
                    }}
                    className="text-xs text-[#008d91] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 text-xs mb-1 font-medium">Group Jarkom</label>
                  <select
                    value={selectedGroupJarkom}
                    onChange={(e) => setSelectedGroupJarkom(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 outline-none focus:border-[#008d91] text-xs"
                  >
                    {uniqueJarkom.map((g) => (
                      <option key={g} value={g}>
                        {g === 'ALL' ? 'Semua Group' : g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 text-xs mb-1 font-medium">Afiliasi KCI</label>
                  <select
                    value={selectedAfiliasi}
                    onChange={(e) => setSelectedAfiliasi(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 outline-none focus:border-[#008d91] text-xs"
                  >
                    {uniqueAfiliasi.map((a) => (
                      <option key={a} value={a}>
                        {a === 'ALL' ? 'Semua Afiliasi' : a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Action buttons when selected */}
        {selectedPatronIds.length > 0 && (
          <div className="flex items-center gap-1.5 animate-in fade-in">
            <button
              type="button"
              onClick={() => handleBulkCreateGroupFunneling()}
              className="bg-[#008d91] hover:bg-[#007679] text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Create Group Funneling"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Group Funneling ({selectedPatronIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkTambahKeGroupExisting()}
              className="bg-white border border-[#008d91] text-[#008d91] hover:bg-teal-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Tambah ke Existing"
            >
              <FolderInput className="w-3.5 h-3.5" />
              <span>Tambah ke Existing</span>
            </button>
            <button
              type="button"
              onClick={() => handleKirimPM()}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Kirim PM"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
              <span>Kirim PM</span>
            </button>
          </div>
        )}

        {/* Add Button matching Image: teal pill with + Add */}
        <button
          id="btn-add-dpr"
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Carousel Stats for Years matching Image 1 exactly */}
      <div className="flex items-center gap-2.5 mb-6">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScrollCarousel('left')}
          className="w-7 h-7 rounded-full bg-[#008d91] hover:bg-[#04777b] text-white flex items-center justify-center shrink-0 shadow-2xs cursor-pointer transition-transform active:scale-95"
          title="Tahun Sebelumnya"
          aria-label="Tahun Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Scrollable Year Cards */}
        <div
          ref={carouselRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {yearStats.map((stat) => {
            const isSelected = selectedYear === stat.year;
            return (
              <button
                key={stat.year}
                type="button"
                onClick={() => setSelectedYear(isSelected ? null : stat.year)}
                className={`flex items-center justify-between gap-4 bg-white border rounded-2xl px-4 py-2.5 min-w-[150px] sm:min-w-[170px] shadow-xs hover:border-[#008d91]/50 transition-all text-left cursor-pointer ${
                  isSelected ? 'border-[#008d91] ring-2 ring-[#008d91]/20' : 'border-slate-100'
                }`}
              >
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium">
                    {stat.year}
                  </span>
                  <span className="block text-sm sm:text-base font-bold text-slate-800">
                    {stat.count} orang
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <PersonWithGlassesIcon className="w-5 h-5 text-white" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScrollCarousel('right')}
          className="w-7 h-7 rounded-full bg-[#008d91] hover:bg-[#04777b] text-white flex items-center justify-center shrink-0 shadow-2xs cursor-pointer transition-transform active:scale-95"
          title="Tahun Selanjutnya"
          aria-label="Tahun Selanjutnya"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Dashboard Proporsi Piutang vs Total Donasi Lunas (Chart & Visual Progress Bar) */}
      <DharmaPatronProportionChart
        aggregate={proportionAggregate}
        isPrivacyMasked={isPrivacyMasked}
        selectedFilter={proportionFilter}
        onFilterChange={setProportionFilter}
      />

      {/* Main Table matching exact UI from image.png */}
      <div className="bg-transparent w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1150px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold">
                <th className="py-4 pl-4 pr-1 text-center w-12">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isAllSelected
                        ? 'bg-[#008d91] border-[#008d91] text-white'
                        : selectedPatronIds.length > 0
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                        : 'border-slate-300 bg-white hover:border-[#008d91]'
                    }`}
                    title="Pilih Semua"
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {!isAllSelected && selectedPatronIds.length > 0 && (
                      <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Nama Donatur</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Sumber</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Group Jarkom</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Nama Rekening</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Donasi Perbulan</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Tanggal Bergabung</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Nama Donatur</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Keterangan</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 text-center">Afiliasi KCI</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Piutang</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Bulan Piutang</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Proporsi Lunas vs Piutang</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 text-center">Reminder?</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 text-center">Aktif/Tidak</th>
                <th className="py-4 px-2 text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-16 text-center text-slate-400 text-sm">
                    Tidak ada data Dharma Patron Rutin. Klik "+ Add" untuk menambahkan donatur baru.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const connected = getConnectedEntity(item);
                  const displayName =
                    connected?.type === 'identitas'
                      ? connected.identitas.namaLengkap
                      : connected?.type === 'organisasi'
                      ? connected.organisasi.namaOrg
                      : item.namaDonatur;
                  const displayPanggilan =
                    connected?.type === 'identitas'
                      ? (connected.identitas.namaPanggilan || item.panggilan)
                      : connected?.type === 'organisasi'
                      ? (connected.organisasi.jenisOrg || item.panggilan)
                      : item.panggilan;
                  const displayAvatarLetter =
                    connected?.type === 'identitas'
                      ? (connected.identitas.avatarInitial || displayName.charAt(0).toUpperCase())
                      : connected?.type === 'organisasi'
                      ? (connected.organisasi.avatarInitial || displayName.charAt(0).toUpperCase())
                      : (item.avatarLetter || displayName.charAt(0).toUpperCase());
                  const displayAvatarBg =
                    connected?.type === 'identitas' && connected.identitas.avatarBg?.startsWith('bg-[')
                      ? connected.identitas.avatarBg.replace('bg-[', '').replace(']', '')
                      : connected?.type === 'organisasi' && connected.organisasi.avatarBg?.startsWith('bg-[')
                      ? connected.organisasi.avatarBg.replace('bg-[', '').replace(']', '')
                      : item.avatarBg || '#00a896';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors group ${
                        selectedPatronIds.includes(item.id) ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {/* Select Checkbox Column */}
                      <td className="py-4 pl-4 pr-1 text-center align-middle w-12">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id);
                          }}
                          className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            selectedPatronIds.includes(item.id)
                              ? 'bg-[#008d91] border-[#008d91] text-white'
                              : 'border-slate-300 bg-white hover:border-[#008d91]'
                          }`}
                          title={selectedPatronIds.includes(item.id) ? 'Batal pilih' : 'Pilih donatur ini'}
                        >
                          {selectedPatronIds.includes(item.id) && (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                        </button>
                      </td>

                      {/* 1. Nama Donatur with Avatar */}
                      <td className="py-4 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-2xs"
                            style={{ backgroundColor: displayAvatarBg }}
                          >
                            {displayAvatarLetter}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                              {item.noDonatur ? `${item.noDonatur} ` : ''}
                              {displayName}
                            </div>
                            {displayPanggilan && (
                              <div className="text-[11px] sm:text-xs text-slate-400">
                                {displayPanggilan}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Sumber */}
                      <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                        {item.sumber}
                      </td>

                      {/* 3. Group Jarkom */}
                      <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                        {item.groupJarkom}
                      </td>

                      {/* 4. Nama Rekening */}
                      <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                        {item.namaRekening}
                      </td>

                      {/* 5. Donasi Perbulan */}
                      <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                        {isPrivacyMasked ? (
                          <span className="font-mono text-slate-400 select-none">••••••••</span>
                        ) : (
                          formatRupiah(item.donasiPerbulan)
                        )}
                      </td>

                      {/* 6. Tanggal Bergabung */}
                      <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                        {item.tanggalBergabung}
                      </td>

                      {/* 7. Nama Donatur (Pendek / Panggilan) */}
                      <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                        {connected?.type === 'identitas'
                          ? (connected.identitas.namaPanggilan || connected.identitas.namaLengkap)
                          : connected?.type === 'organisasi'
                          ? connected.organisasi.namaOrg
                          : (item.namaPendek || item.panggilan || item.namaDonatur)}
                      </td>

                    {/* 8. Keterangan */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal">
                      {item.keterangan || '-'}
                    </td>

                    {/* 9. Afiliasi KCI (Teal pill) */}
                    <td className="py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center bg-[#008d91] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-2xs min-w-[50px]">
                        {item.afiliasiKci}
                      </span>
                    </td>

                    {/* 10. Piutang */}
                    <td
                      className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap"
                      title={
                        item.piutang < 0
                          ? `Validasi Otomatis: Piutang terhitung sejak tanggal bergabung (${item.tanggalBergabung}) s/d bulan berjalan`
                          : 'Validasi Otomatis: Lunas (Tidak ada tunggakan sejak tanggal bergabung s/d bulan berjalan)'
                      }
                    >
                      {isPrivacyMasked ? (
                        <span className="font-mono text-slate-400 select-none">••••••••</span>
                      ) : (
                        <span className={item.piutang < 0 ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
                          {formatRupiah(item.piutang)}
                        </span>
                      )}
                    </td>

                    {/* 11. Bulan Piutang */}
                    <td
                      className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap"
                      title={
                        item.bulanPiutang && item.bulanPiutang !== '-'
                          ? `Bulan menunggak: ${item.bulanPiutang}`
                          : 'Semua komitmen bulanan lunas atau diputihkan'
                      }
                    >
                      <span className={item.bulanPiutang && item.bulanPiutang !== '-' ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                        {item.bulanPiutang || '-'}
                      </span>
                    </td>

                    {/* 12. Proporsi Lunas vs Piutang per Donatur (Progress Bar visual & persentase) */}
                    <td className="py-4 px-3 sm:px-4 whitespace-nowrap align-middle">
                      {proportionMap.get(item.id) ? (
                        <PatronTableRowProgressBar
                          proportion={proportionMap.get(item.id)!}
                          isPrivacyMasked={isPrivacyMasked}
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* 13. Reminder? (Teal pill) */}
                    <td className="py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center bg-[#008d91] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-2xs min-w-[44px]">
                        {item.reminder}
                      </span>
                    </td>

                    {/* 13. Aktif/Tidak (Highlight Tosca jika Aktif, Highlight Merah jika Tidak Aktif) */}
                    <td className="py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPeriodeItem(item);
                          setIsPeriodeModalOpen(true);
                        }}
                        title="Klik untuk melihat periode aktif donatur ini"
                        className={`inline-flex items-center justify-center text-xs font-semibold px-3.5 py-1 rounded-full shadow-2xs min-w-[76px] cursor-pointer hover:opacity-90 active:scale-95 transition-all select-none ${
                          isDharmaPatronAktif(item)
                            ? 'bg-[#008d91] text-white hover:bg-[#007b7f]'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                      >
                        {isDharmaPatronAktif(item) ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>

                    {/* 14. 3-dots action menu */}
                    <td className="py-4 px-2 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Menu Aksi"
                        aria-label="Menu Aksi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-11 z-30 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleBulkCreateGroupFunneling([item.id]);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <FolderPlus className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Create Group Funneling</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleBulkTambahKeGroupExisting([item.id]);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <FolderInput className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Tambah ke Existing</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleKirimPM([item.id]);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-[#008d91] hover:bg-teal-50 flex items-center gap-2 font-semibold cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Kirim PM ke Donatur Ini</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setSelectedSummaryPatron(item);
                              setIsSummaryModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Summary Pembayaran</span>
                          </button>

                          <button
                            id={`btn-edit-donasi-${item.id}`}
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setEditDonasiItem(item);
                              setIsEditDonasiOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Edit Donasi/Rutin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditItem(item);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit</span>
                          </button>

                          {onDuplicateItem && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDuplicateItem(item);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Duplikat</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteItem(item.id);
                              onShowToast?.(`Donatur ${item.namaDonatur} berhasil dihapus`);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Funneling Floating Action Bar */}
        <FunnelingActionBar
          selectedCount={selectedPatronIds.length}
          itemLabel="donatur"
          onClearSelection={() => setSelectedPatronIds([])}
          onCreateGroupFunneling={() => handleBulkCreateGroupFunneling()}
          onTambahKeGroupExisting={() => handleBulkTambahKeGroupExisting()}
          onKirimPM={onKirimPM ? () => handleKirimPM() : undefined}
        />
      </div>

      {/* Pop Up Edit Donasi/bulan matching image.png */}
      <EditDonasiBulanModal
        isOpen={isEditDonasiOpen}
        item={editDonasiItem}
        jenisOptions={jenisOptions}
        onNavigateToJenisTable={onNavigateToJenisTable}
        onClose={() => {
          setIsEditDonasiOpen(false);
          setEditDonasiItem(null);
        }}
        onSave={(updated) => {
          if (onSaveDonasi) {
            onSaveDonasi(updated);
          }
          if (onShowToast) {
            onShowToast(`Donasi/bulan untuk ${updated.namaDonatur} berhasil diperbarui`);
          }
        }}
      />

      {/* Pop Up Periode Keaktifan Modal */}
      <PeriodeKeaktifanModal
        isOpen={isPeriodeModalOpen}
        item={selectedPeriodeItem}
        onClose={() => {
          setIsPeriodeModalOpen(false);
          setSelectedPeriodeItem(null);
        }}
        onEditDonasi={(it) => {
          setEditDonasiItem(it);
          setIsEditDonasiOpen(true);
        }}
      />

      {/* Pop Up Summary Pembayaran Modal */}
      <ModalSummaryPembayaranPatron
        isOpen={isSummaryModalOpen}
        onClose={() => {
          setIsSummaryModalOpen(false);
          setSelectedSummaryPatron(null);
        }}
        patron={selectedSummaryPatron}
        donasiOrders={effectiveDonasiOrders}
        mutasiItems={mutasiItems}
        onShowToast={onShowToast}
      />
    </div>
  );
};
