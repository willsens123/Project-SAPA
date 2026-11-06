import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Globe,
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
  X,
} from 'lucide-react';
import {
  PelimpahanJasaItemSummary,
  getNameHighlightStatuses,
  NameHighlightStatus,
} from '../reportPelimpahanJasaData';
import { DonasiOrder } from '../donasiData';
import { AvatarMascot } from './AvatarMascot';

interface DownloadPelimpahanJasaReportViewProps {
  item: PelimpahanJasaItemSummary;
  onBack: () => void;
  onUpdateItem: (updated: PelimpahanJasaItemSummary) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToTransaksiDonasi?: () => void;
  allOrders?: DonasiOrder[];
}

export const DownloadPelimpahanJasaReportView: React.FC<
  DownloadPelimpahanJasaReportViewProps
> = ({
  item,
  onBack,
  onUpdateItem,
  onShowToast = (_msg: string) => {},
  onNavigateToTransaksiDonasi,
}) => {
  // Active Tab: 'All' | 'New' | specific date like '12 Nov 2021'
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hideDownloaded, setHideDownloaded] = useState(false);
  const [activeNameMenu, setActiveNameMenu] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterHighlight, setFilterHighlight] = useState<'ALL' | 'RED' | 'YELLOW' | 'UNIQUE'>('ALL');
  const [isAddNameModalOpen, setIsAddNameModalOpen] = useState(false);
  const [newInputName, setNewInputName] = useState('');

  // Extract all unique names in this item
  const allNamesList = useMemo(() => {
    const set = new Set<string>();

    // 1. From item.nameDownloadDates keys
    if (item.nameDownloadDates) {
      Object.keys(item.nameDownloadDates).forEach((n) => set.add(n));
    }

    // 2. From item.donaturs
    item.donaturs.forEach((d) => {
      d.names.forEach((n) => set.add(n));
    });

    // If still empty (e.g. new item), fallback
    if (set.size === 0) {
      return [
        'Suhu Bhadra Ruci',
        'Semua Makhluk',
        'Cindy Budiman',
        'Cindy Pao Budiman',
        'Silvia Fukada',
      ];
    }

    return Array.from(set);
  }, [item]);

  // Compute Highlight statuses (Duplicate = Red, Similar = Yellow, Unique = Normal)
  const highlightStatuses = useMemo(() => {
    // Gather all occurrences of names to determine duplicates vs similar
    const allOccurrences: string[] = [];
    item.donaturs.forEach((d) => {
      d.names.forEach((n) => allOccurrences.push(n));
    });

    // If item.donaturs is empty, use allNamesList with realistic duplicates for demonstration
    if (allOccurrences.length === 0) {
      return {
        'Suhu Bhadra Ruci': 'DUPLICATE' as NameHighlightStatus,
        'Semua Makhluk': 'DUPLICATE' as NameHighlightStatus,
        'Cindy Budiman': 'SIMILAR' as NameHighlightStatus,
        'Cindy Pao Budiman': 'SIMILAR' as NameHighlightStatus,
        'Silvia Fukada': 'NORMAL' as NameHighlightStatus,
      };
    }

    return getNameHighlightStatuses(allOccurrences);
  }, [item, allNamesList]);

  // Download dates map for this item
  // e.g. { 'Suhu Bhadra Ruci': '12 Nov 2021', 'Cindy Pao Budiman': null }
  const downloadDatesMap = useMemo(() => {
    const dates: Record<string, string | null> = { ...(item.nameDownloadDates || {}) };

    // Default dates if not explicitly set (matching screenshot)
    allNamesList.forEach((name) => {
      if (dates[name] === undefined) {
        if (name === 'Suhu Bhadra Ruci' || name === 'Semua Makhluk') {
          dates[name] = '12 Nov 2021';
        } else if (name === 'Cindy Budiman' || name === 'Silvia Fukada') {
          dates[name] = '14 Nov 2021';
        } else if (name === 'Cindy Pao Budiman') {
          dates[name] = null; // NEW!
        } else {
          dates[name] = null; // Any new name defaults to null (NEW)
        }
      }
    });

    return dates;
  }, [item.nameDownloadDates, allNamesList]);

  // Distinct dates for tabs
  const distinctDownloadDates = useMemo(() => {
    const datesSet = new Set<string>();
    Object.values(downloadDatesMap).forEach((d) => {
      if (typeof d === 'string' && d.trim()) {
        datesSet.add(d.trim());
      }
    });
    return Array.from(datesSet);
  }, [downloadDatesMap]);

  // Check if there are any un-downloaded (NEW) names
  const hasNewNames = useMemo(() => {
    return allNamesList.some((n) => !downloadDatesMap[n]);
  }, [allNamesList, downloadDatesMap]);

  // Filter names based on activeTab, search query, hideDownloaded, and filterHighlight
  const displayedNames = useMemo(() => {
    return allNamesList.filter((name) => {
      const dDate = downloadDatesMap[name];

      // Tab filter
      if (activeTab === 'New') {
        if (dDate) return false;
      } else if (activeTab !== 'All') {
        if (dDate !== activeTab) return false;
      }

      // Hide downloaded toggle
      if (hideDownloaded && dDate) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = name.toLowerCase().includes(q);
        const matchesDate = dDate ? dDate.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDate) return false;
      }

      // Highlight filter
      if (filterHighlight !== 'ALL') {
        const status = highlightStatuses[name] || 'NORMAL';
        if (filterHighlight === 'RED' && status !== 'DUPLICATE') return false;
        if (filterHighlight === 'YELLOW' && status !== 'SIMILAR') return false;
        if (filterHighlight === 'UNIQUE' && status !== 'NORMAL') return false;
      }

      return true;
    });
  }, [
    allNamesList,
    downloadDatesMap,
    activeTab,
    hideDownloaded,
    searchQuery,
    filterHighlight,
    highlightStatuses,
  ]);

  // Trigger file download helper
  const triggerDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format today's date like "15 Nov 2021"
  const getTodayFormatted = () => {
    // Return standard format e.g. "15 Nov 2021"
    const now = new Date();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  // Main Download Action
  const handleDownloadAll = () => {
    const todayDate = getTodayFormatted(); // e.g. "15 Nov 2021"
    const updatedDates = { ...downloadDatesMap };
    let newlyDownloadedCount = 0;

    // Names to download: if in 'New' tab, all new names; if in date tab, that date; if in 'All', un-downloaded names get today's date
    const namesToDownload = displayedNames.length > 0 ? displayedNames : allNamesList;

    // Generate CSV content
    const csvRows = [
      ['No', 'Nama Pelimpahan Jasa', 'Item Donasi', 'Status Download', 'Tanggal Download'],
    ];

    namesToDownload.forEach((name, idx) => {
      const existingDate = updatedDates[name];
      const finalDate = existingDate || todayDate;
      if (!existingDate) {
        updatedDates[name] = todayDate;
        newlyDownloadedCount++;
      }
      csvRows.push([
        (idx + 1).toString(),
        `"${name}"`,
        `"${item.name}"`,
        existingDate ? 'Sudah Di-download' : 'Baru Di-download',
        finalDate,
      ]);
    });

    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    const safeItemName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
    triggerDownloadFile(
      `Pelimpahan_Jasa_${safeItemName}_${todayDate.replace(/\s+/g, '_')}.csv`,
      csvContent
    );

    // Save updated dates
    const updatedItem: PelimpahanJasaItemSummary = {
      ...item,
      nameDownloadDates: updatedDates,
    };
    onUpdateItem(updatedItem);

    if (newlyDownloadedCount > 0) {
      onShowToast(
        `${newlyDownloadedCount} nama baru berhasil di-download! Tab "${todayDate}" ditambahkan.`
      );
      // Switch active tab to today's date
      setActiveTab(todayDate);
    } else {
      onShowToast(`Report ${namesToDownload.length} nama berhasil di-download!`);
    }
  };

  // Handle Download Single Name
  const handleDownloadSingle = (name: string) => {
    const todayDate = getTodayFormatted();
    const updatedDates = { ...downloadDatesMap, [name]: todayDate };

    const csvContent = [
      ['No', 'Nama Pelimpahan Jasa', 'Item Donasi', 'Tanggal Download'],
      ['1', `"${name}"`, `"${item.name}"`, todayDate],
    ]
      .map((e) => e.join(','))
      .join('\n');

    triggerDownloadFile(
      `Pelimpahan_Jasa_${name.replace(/\s+/g, '_')}_${todayDate.replace(/\s+/g, '_')}.csv`,
      csvContent
    );

    const updatedItem: PelimpahanJasaItemSummary = {
      ...item,
      nameDownloadDates: updatedDates,
    };
    onUpdateItem(updatedItem);
    onShowToast(`Nama "${name}" berhasil di-download!`);
    setActiveNameMenu(null);
  };

  // Mark single name as downloaded / reset to un-downloaded (NEW)
  const handleToggleDownloadStatus = (name: string, date: string | null) => {
    const updatedDates = { ...downloadDatesMap, [name]: date };
    const updatedItem: PelimpahanJasaItemSummary = {
      ...item,
      nameDownloadDates: updatedDates,
    };
    onUpdateItem(updatedItem);
    if (date) {
      onShowToast(`Nama "${name}" ditandai sudah di-download (${date})`);
    } else {
      onShowToast(`Nama "${name}" ditandai sebagai NEW (belum di-download)`);
      setActiveTab('New');
    }
    setActiveNameMenu(null);
  };

  // Add a new name to this item
  const handleAddNewName = () => {
    if (!newInputName.trim()) return;
    const nameToAdd = newInputName.trim();

    const updatedDates = { ...downloadDatesMap, [nameToAdd]: null }; // null = NEW
    // Also add to donaturs so it stays in list
    const updatedDonaturs = [...item.donaturs];
    if (updatedDonaturs.length > 0) {
      updatedDonaturs[0] = {
        ...updatedDonaturs[0],
        names: [...updatedDonaturs[0].names, nameToAdd],
      };
    }

    const updatedItem: PelimpahanJasaItemSummary = {
      ...item,
      totalNamaCount: item.totalNamaCount + 1,
      donaturs: updatedDonaturs,
      nameDownloadDates: updatedDates,
    };

    onUpdateItem(updatedItem);
    setNewInputName('');
    setIsAddNameModalOpen(false);
    onShowToast(`Nama "${nameToAdd}" berhasil ditambahkan sebagai nama baru (NEW)!`);
    setActiveTab('New');
  };

  // Remove a name
  const handleRemoveName = (nameToRemove: string) => {
    const updatedDates = { ...downloadDatesMap };
    delete updatedDates[nameToRemove];

    const updatedDonaturs = item.donaturs.map((d) => ({
      ...d,
      names: d.names.filter((n) => n !== nameToRemove),
    }));

    const updatedItem: PelimpahanJasaItemSummary = {
      ...item,
      donaturs: updatedDonaturs,
      nameDownloadDates: updatedDates,
      totalNamaCount: Math.max(0, item.totalNamaCount - 1),
    };

    onUpdateItem(updatedItem);
    onShowToast(`Nama "${nameToRemove}" dihapus`);
    setActiveNameMenu(null);
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Identical to uploaded image) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        {/* Left Side: Title + Back Chevron + Mascot + Teal Speech Bubble + Forward Chevron */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
              Report Nama
              <br className="hidden sm:inline" /> Pelimpahan Jasa D-DONASI
            </h1>
          </div>

          <div className="flex items-center gap-1.5 ml-1 sm:ml-4">
            {/* Left circular navigation button */}
            <button
              type="button"
              onClick={onBack}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Kembali ke Rekap Item"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Mascot */}
            <div className="cursor-pointer" onClick={onBack} title="Kembali">
              <AvatarMascot className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>

            {/* Teal Speech Bubble */}
            <div className="relative bg-[#008d91] text-white px-5 py-3 rounded-2xl flex items-center min-w-[180px] sm:min-w-[280px] md:min-w-[340px] shadow-xs">
              {/* Pointer Triangle */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#008d91] rotate-45"></div>
              <span className="text-xs sm:text-sm font-semibold tracking-wide truncate">
                {item.name}
              </span>
            </div>

            {/* Right circular navigation button */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateToTransaksiDonasi) {
                  onNavigateToTransaksiDonasi();
                } else {
                  onShowToast('Transaksi D-DONASI');
                }
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Ke Transaksi D-DONASI"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Digital Clock & Date + Three Horizontal Dots */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex flex-col text-right">
            <span className="text-[#008d91] font-bold text-xl sm:text-2xl leading-none">
              09:59
            </span>
            <span className="text-[#008d91] text-xs font-semibold mt-0.5">
              Senin, 15 November 2021
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddNameModalOpen(true)}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Tambah Nama Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WHITE CONTAINER CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {/* ROW 1: Tab Pills (Left) & Actions/Download Button (Right) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Tab Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
            {/* Tab: All */}
            <button
              type="button"
              onClick={() => setActiveTab('All')}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'All'
                  ? 'bg-[#008d91] text-white shadow-xs'
                  : 'bg-[#9ca3af] hover:bg-[#8b95a5] text-white'
              }`}
            >
              All
            </button>

            {/* Tab: New (Displayed if there are un-downloaded names, matching prompt requirement) */}
            {hasNewNames && (
              <button
                type="button"
                onClick={() => setActiveTab('New')}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'New'
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'bg-[#9ca3af] hover:bg-[#8b95a5] text-white'
                }`}
              >
                <span>New</span>
              </button>
            )}

            {/* Dynamic Date Tabs for each distinct download date */}
            {distinctDownloadDates.map((dDate) => (
              <button
                key={dDate}
                type="button"
                onClick={() => setActiveTab(dDate)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === dDate
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'bg-[#9ca3af] hover:bg-[#8b95a5] text-white'
                }`}
              >
                {dDate}
              </button>
            ))}
          </div>

          {/* Right: Actions (Eye slash, Search, Filter Sliders, Download Button) */}
          <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
            {/* Search Input (Expands when open) */}
            {isSearchOpen && (
              <div className="relative animate-in fade-in slide-in-from-right duration-150 w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Eye Slash Icon (Toggle Hide Downloaded) */}
            <button
              type="button"
              onClick={() => {
                setHideDownloaded(!hideDownloaded);
                onShowToast(
                  !hideDownloaded
                    ? 'Menyembunyikan nama yang sudah di-download'
                    : 'Menampilkan semua nama'
                );
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                hideDownloaded
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={hideDownloaded ? 'Tampilkan semua nama' : 'Sembunyikan yang sudah di-download'}
            >
              {hideDownloaded ? (
                <Eye className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isSearchOpen
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Cari Nama"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Filter Sliders Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterHighlight !== 'ALL' || isFilterOpen
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Filter & Urutan"
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-9 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs text-left animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    Filter Highlight Nama:
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterHighlight('ALL');
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      filterHighlight === 'ALL' ? 'text-[#008d91] font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>Semua Warna</span>
                    {filterHighlight === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterHighlight('RED');
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-red-50 text-[#f05252] flex items-center justify-between cursor-pointer ${
                      filterHighlight === 'RED' ? 'font-bold' : ''
                    }`}
                  >
                    <span>Nama Sama (Merah)</span>
                    {filterHighlight === 'RED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterHighlight('YELLOW');
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-amber-50 text-[#F59E0B] flex items-center justify-between cursor-pointer ${
                      filterHighlight === 'YELLOW' ? 'font-bold' : ''
                    }`}
                  >
                    <span>Nama Mirip (Kuning)</span>
                    {filterHighlight === 'YELLOW' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterHighlight('UNIQUE');
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer ${
                      filterHighlight === 'UNIQUE' ? 'text-[#008d91] font-bold' : ''
                    }`}
                  >
                    <span>Nama Unik (Normal)</span>
                    {filterHighlight === 'UNIQUE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* DOWNLOAD BUTTON (Teal button with text 'Download') */}
            <button
              type="button"
              onClick={handleDownloadAll}
              className="bg-[#008d91] hover:bg-[#05828e] text-white font-semibold text-sm px-6 py-2 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
              title="Download Data Pelimpahan Jasa"
            >
              <Download className="w-4 h-4 stroke-[2]" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Three Summary Cards (Identical to image) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Jumlah Dana */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs px-5 py-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-normal">Jumlah Dana</span>
              <span className="text-base font-bold text-slate-800 mt-0.5">
                {item.jumlahDanaText || 'Rp1.000.000'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <ShoppingCart className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Card 2: Jumlah Donatur */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs px-5 py-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-normal">Jumlah Donatur</span>
              <span className="text-base font-bold text-slate-800 mt-0.5">
                {item.jumlahDonaturText || '300 orang'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Globe className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Card 3: Periode */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs px-5 py-3.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-normal">Periode</span>
              <span className="text-base font-bold text-slate-800 mt-0.5">
                {item.periodeText || '1 Jan 2021 - 15 Nov 2021'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <ShoppingCart className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* ROW 3: Names List Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6">
          {/* Inner Header: Title + Sliders Icon */}
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              Nama Pelimpahan Jasa
            </h2>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="Opsi Filter"
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          {/* Horizontal Divider Line */}
          <hr className="border-slate-200 mb-5" />

          {/* Names Rows */}
          {displayedNames.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada nama pelimpahan jasa untuk kategori atau filter ini.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {displayedNames.map((name) => {
                const dDate = downloadDatesMap[name];
                const highlight = highlightStatuses[name] || 'NORMAL';

                // Determine name text color based on highlight status:
                // DUPLICATE -> #f05252 (Red)
                // SIMILAR -> #F59E0B (Amber/Yellow)
                // NORMAL -> text-slate-800 (Black/Dark Slate)
                let nameColorClass = 'text-slate-800';
                if (highlight === 'DUPLICATE') {
                  nameColorClass = 'text-[#f05252]';
                } else if (highlight === 'SIMILAR') {
                  nameColorClass = 'text-[#F59E0B]';
                }

                return (
                  <div
                    key={name}
                    className="flex items-center justify-between py-1.5 px-1 hover:bg-slate-50/50 rounded-xl transition-colors group relative"
                  >
                    {/* Left: Name text */}
                    <div className="w-1/3 sm:w-1/4">
                      <span className={`text-base font-normal tracking-wide ${nameColorClass}`}>
                        {name}
                      </span>
                    </div>

                    {/* Middle: Download Date Badge (Teal pill if downloaded, empty if NEW) */}
                    <div className="flex-1 flex items-center justify-start pl-4 sm:pl-8">
                      {dDate ? (
                        <span className="px-3 py-0.5 rounded-md text-xs font-semibold bg-[#008d91] text-white tracking-wide shadow-2xs">
                          {dDate}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic"></span>
                      )}
                    </div>

                    {/* Right: Red Vertical Three Dots Menu Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveNameMenu(activeNameMenu === name ? null : name)
                        }
                        className="p-1 text-[#f05252] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Opsi Nama"
                      >
                        <MoreVertical className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      {/* Dropdown Menu for this name */}
                      {activeNameMenu === name && (
                        <div className="absolute right-0 top-7 z-30 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs text-left animate-in fade-in duration-100">
                          {/* Option: Download This Name */}
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(name)}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Download Nama Ini</span>
                          </button>

                          {/* Option: Toggle status */}
                          {dDate ? (
                            <button
                              type="button"
                              onClick={() => handleToggleDownloadStatus(name, null)}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-amber-50 hover:text-[#F59E0B] flex items-center gap-2 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <span>Tandai Belum Download (NEW)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleDownloadStatus(name, getTodayFormatted())
                              }
                              className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Tandai Sudah Download</span>
                            </button>
                          )}

                          {/* Option: Copy Name */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(name);
                              onShowToast(`Nama "${name}" disalin ke clipboard!`);
                              setActiveNameMenu(null);
                            }}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Salin Nama</span>
                          </button>

                          <div className="border-t border-slate-100 my-1"></div>

                          {/* Option: Delete Name */}
                          <button
                            type="button"
                            onClick={() => handleRemoveName(name)}
                            className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Nama</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back Link to Item Rekap */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#008d91] hover:underline font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Rekap Item D-DONASI</span>
          </button>

          {onNavigateToTransaksiDonasi && (
            <button
              type="button"
              onClick={onNavigateToTransaksiDonasi}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#008d91] font-medium cursor-pointer"
            >
              <span>Buka Transaksi D-DONASI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: TAMBAH NAMA PELIMPAHAN JASA BARU */}
      {/* ========================================================================= */}
      {isAddNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                Tambah Nama Pelimpahan Jasa Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddNameModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Nama Pelimpahan Jasa
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Contoh: Suhu Bhadra Ruci, Cindy Pao..."
                value={newInputName}
                onChange={(e) => setNewInputName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewName();
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
              />
              <span className="text-[11px] text-slate-400">
                Nama baru akan otomatis dimasukkan ke dalam tab{' '}
                <strong className="text-[#008d91]">"NEW"</strong> sampai di-download.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddNameModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddNewName}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] cursor-pointer"
              >
                Simpan (NEW)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
