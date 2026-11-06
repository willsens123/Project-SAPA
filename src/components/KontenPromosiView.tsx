import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Globe,
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  Play,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  ShoppingBag,
  Trash2,
  Edit2,
  Info,
  Check,
} from 'lucide-react';
import { KontenPromosiItem, TargetPromotedItem } from '../types';
import { SalurOrder, INITIAL_BOOKS, CROSS_SELLING_BOOKS } from '../salurData';
import { BookCover } from './BookCover';
import { PosterThumbnail } from './PosterThumbnail';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import {
  checkTransaksiItem5Hari,
  checkTransaksiRealTime,
  MatchingTransactionResult,
  parseIndonesianDate,
} from '../kontenPromosiData';

const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

interface MonthOption {
  month: number; // 0-11
  year: number;
  name: string;
  key: string;
}

function getItemMonthYear(item: KontenPromosiItem): { month: number; year: number } | null {
  const dateStr = item.tanggalDisebar || item.ig?.tanggal || item.tiktok?.tanggal || item.jarkom?.tanggal;
  if (!dateStr) return null;
  const d = parseIndonesianDate(dateStr);
  if (!d) return null;
  return { month: d.getMonth(), year: d.getFullYear() };
}

interface KontenPromosiViewProps {
  items: KontenPromosiItem[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  onSaveItem: (item: KontenPromosiItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const KontenPromosiView: React.FC<KontenPromosiViewProps> = ({
  items,
  salurOrders = [],
  donasiOrders = [],
  transaksiAjarList = [],
  onSaveItem,
  onDeleteItem,
  onShowToast,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Month Calendar Filter State (matches image.png with Nov 2021 active by default)
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>({
    month: 10, // November
    year: 2021,
  });

  const monthScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected month on initial render
  useEffect(() => {
    if (monthScrollRef.current) {
      const activeEl = monthScrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  const handleScrollMonths = (direction: 'left' | 'right') => {
    if (monthScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      monthScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Generate month list spanning across relevant years (2021 - 2026)
  const allMonthsList = useMemo<MonthOption[]>(() => {
    const list: MonthOption[] = [];
    for (let y = 2021; y <= 2026; y++) {
      for (let m = 0; m < 12; m++) {
        list.push({
          month: m,
          year: y,
          name: MONTH_NAMES_ID[m],
          key: `${y}-${m}`,
        });
      }
    }
    return list;
  }, []);

  const activeYearDisplay = selectedMonth ? selectedMonth.year : 2021;

  // Top summary card carousel offset
  const [carouselOffset, setCarouselOffset] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KontenPromosiItem | null>(null);
  const [selectedTransaksiItem, setSelectedTransaksiItem] = useState<KontenPromosiItem | null>(null);

  // Quick inline update for Set Waktu (hari)
  const handleUpdateSetWaktu = (id: string, newDays: number) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;
    const updated: KontenPromosiItem = {
      ...target,
      durasiHariCekTransaksi: newDays,
      setWaktuHari: newDays,
    };
    onSaveItem(updated);
  };
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form state for adding/editing
  const [formJudul, setFormJudul] = useState('');
  const [formFormat, setFormFormat] = useState('Carousel');
  const [formTanggalDisebar, setFormTanggalDisebar] = useState('11 Nov 2021');
  const [formDurasiHari, setFormDurasiHari] = useState(5);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(['book-3', 'book-2']);

  // IG metrics form
  const [formIgTanggal, setFormIgTanggal] = useState('11 Nov 21');
  const [formIgJam, setFormIgJam] = useState('11:00');
  const [formIgLike, setFormIgLike] = useState('700');
  const [formIgComment, setFormIgComment] = useState('700');
  const [formIgShare, setFormIgShare] = useState('700');
  const [formIgSaved, setFormIgSaved] = useState('700');
  const [formIgReach, setFormIgReach] = useState('700');

  // Tiktok metrics form
  const [formTiktokTanggal, setFormTiktokTanggal] = useState('11 Nov 21');
  const [formTiktokJam, setFormTiktokJam] = useState('11:00');
  const [formTiktokLike, setFormTiktokLike] = useState('700');
  const [formTiktokComment, setFormTiktokComment] = useState('700');
  const [formTiktokShare, setFormTiktokShare] = useState('700');
  const [formTiktokSaved, setFormTiktokSaved] = useState('700');
  const [formTiktokReach, setFormTiktokReach] = useState('100');

  // Jarkom metrics form
  const [formJarkomTanggal, setFormJarkomTanggal] = useState('11 Nov 21');
  const [formJarkomJam, setFormJarkomJam] = useState('11:00');
  const [formJarkomReach, setFormJarkomReach] = useState('100');

  // List of all master books for item selection
  const allMasterBooks = useMemo(() => {
    return [...INITIAL_BOOKS, ...CROSS_SELLING_BOOKS];
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((it) => {
      // Month calendar filter
      if (selectedMonth) {
        const my = getItemMonthYear(it);
        if (my && (my.month !== selectedMonth.month || my.year !== selectedMonth.year)) {
          return false;
        }
      }

      const matchSearch =
        !q ||
        it.judul.toLowerCase().includes(q) ||
        it.format.toLowerCase().includes(q) ||
        it.itemSummary.toLowerCase().includes(q) ||
        it.targetItems.some((t) => t.title.toLowerCase().includes(q));

      const matchFormat =
        filterFormat === 'all' || it.format.toLowerCase() === filterFormat.toLowerCase();

      return matchSearch && matchFormat;
    });
  }, [items, searchQuery, filterFormat, selectedMonth]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormJudul('');
    setFormFormat('Carousel');
    setFormTanggalDisebar('11 Nov 2021');
    setFormDurasiHari(5);
    setSelectedItemIds(['book-3', 'book-2']);
    setFormIgTanggal('11 Nov 21');
    setFormIgJam('11:00');
    setFormIgLike('700');
    setFormIgComment('700');
    setFormIgShare('700');
    setFormIgSaved('700');
    setFormIgReach('700');
    setFormTiktokTanggal('11 Nov 21');
    setFormTiktokJam('11:00');
    setFormTiktokLike('700');
    setFormTiktokComment('700');
    setFormTiktokShare('700');
    setFormTiktokSaved('700');
    setFormTiktokReach('100');
    setFormJarkomTanggal('11 Nov 21');
    setFormJarkomJam('11:00');
    setFormJarkomReach('100');
    setIsAddModalOpen(true);
  };

  // Handle save from form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim()) {
      onShowToast('Silakan isi judul konten promosi');
      return;
    }

    const selectedTargetItems: TargetPromotedItem[] = allMasterBooks
      .filter((b) => selectedItemIds.includes(b.id))
      .map((b) => ({
        id: b.id,
        title: b.title,
        coverKey: b.coverKey,
        imageUrl: b.imageUrl,
      }));

    const itemSummaryStr =
      selectedTargetItems.length > 0
        ? `${selectedTargetItems[0].title}${
            selectedTargetItems.length > 1
              ? `, + ${selectedTargetItems.length - 1} more item`
              : ''
          }`
        : 'Item terpilih';

    const newItem: KontenPromosiItem = {
      id: editingItem ? editingItem.id : `konten-${Date.now()}`,
      judul: formJudul,
      format: formFormat,
      itemSummary: itemSummaryStr,
      targetItems: selectedTargetItems,
      tanggalDisebar: formTanggalDisebar,
      durasiHariCekTransaksi: Number(formDurasiHari) || 5,
      setWaktuHari: Number(formDurasiHari) || 5,
      ig: {
        tanggal: formIgTanggal,
        jam: formIgJam,
        like: parseInt(formIgLike, 10) || 0,
        comment: parseInt(formIgComment, 10) || 0,
        share: parseInt(formIgShare, 10) || 0,
        saved: parseInt(formIgSaved, 10) || 0,
        reach: parseInt(formIgReach, 10) || 0,
      },
      tiktok: {
        tanggal: formTiktokTanggal,
        jam: formTiktokJam,
        like: parseInt(formTiktokLike, 10) || 0,
        comment: parseInt(formTiktokComment, 10) || 0,
        share: parseInt(formTiktokShare, 10) || 0,
        saved: parseInt(formTiktokSaved, 10) || 0,
        reach: parseInt(formTiktokReach, 10) || 0,
      },
      jarkom: {
        tanggal: formJarkomTanggal,
        jam: formJarkomJam,
        reach: parseInt(formJarkomReach, 10) || 0,
      },
      transaksiCount: 100,
    };

    onSaveItem(newItem);
    setIsAddModalOpen(false);
    onShowToast(`Konten promosi "${newItem.judul}" berhasil disimpan`);
  };

  // Top cards data matching image
  const summaryCards = [
    {
      id: 'card-1',
      title: 'Judul Buku Berbayar',
      value: '200 buah',
    },
    {
      id: 'card-2',
      title: 'Judul Buku Tidak Berbayar',
      value: '200 Judul',
    },
    {
      id: 'card-3',
      title: 'Judul Kaos',
      value: '200 Judul',
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Main Container Card matching screenshot rounded-[32px] */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-4 sm:p-6 overflow-hidden">
        {/* Top Control Bar: Carousel Cards (Left) & Actions (Right) */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          {/* Left: Cards Carousel */}
          <div className="flex items-center gap-2.5 overflow-x-auto max-w-full py-1">
            {/* Carousel Left Button */}
            <button
              type="button"
              onClick={() => setCarouselOffset((prev) => Math.max(0, prev - 1))}
              className="w-6 h-6 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Summary Cards */}
            {summaryCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs px-4 py-2.5 flex items-center justify-between gap-6 min-w-[200px] shrink-0"
              >
                <div>
                  <div className="text-[11px] text-slate-400 font-medium leading-tight">
                    {card.title}
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {card.value}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#00897b] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}

            {/* Carousel Right Button */}
            <button
              type="button"
              onClick={() => setCarouselOffset((prev) => prev + 1)}
              className="w-6 h-6 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Action Buttons (Eye, Search, Filter, + Add) */}
          <div className="flex items-center gap-3 self-end xl:self-auto">
            {/* Eye button */}
            <button
              type="button"
              onClick={() => setIsEyeActive(!isEyeActive)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isEyeActive
                  ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  : 'border-teal-200 bg-teal-50 text-[#00897b]'
              }`}
              title="Sembunyikan/Tampilkan Kolom"
            >
              <EyeOff className="w-4 h-4" />
            </button>

            {/* Search button / input */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 animate-fadeIn">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari konten..."
                    autoFocus
                    className="text-xs bg-transparent border-none focus:outline-none w-32 sm:w-44 text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Cari"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  filterFormat !== 'all'
                    ? 'border-teal-200 bg-teal-50 text-[#00897b]'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title="Filter Format"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Filter Format
                  </div>
                  {['all', 'Carousel', 'Single Post', 'Reels', 'Video'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setFilterFormat(fmt);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                        filterFormat === fmt
                          ? 'bg-teal-50 text-[#00897b]'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{fmt === 'all' ? 'Semua Format' : fmt}</span>
                      {filterFormat === fmt && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* + Add Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="bg-[#00897b] hover:bg-[#00796b] text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Month Calendar Filter Bar matching image.png */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 border-b border-slate-100 my-1">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollMonths('left')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white flex items-center justify-center shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Bulan Sebelumnya"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Scrollable Month Items */}
          <div
            ref={monthScrollRef}
            className="flex items-center gap-5 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1 px-2"
          >
            {allMonthsList.map((m) => {
              const isSelected = selectedMonth?.month === m.month && selectedMonth?.year === m.year;
              return (
                <div
                  key={m.key}
                  data-active={isSelected ? 'true' : 'false'}
                  className="flex flex-col items-center shrink-0"
                >
                  {isSelected ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(null)}
                        className="bg-[#00897b] text-white px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-baseline gap-1 shadow-2xs transition-all cursor-pointer select-none"
                        title="Klik untuk membatalkan filter bulan ini"
                      >
                        <span>{m.name}</span>
                        <span className="text-[10px] sm:text-[11px] text-white/85 font-normal">
                          {m.year}
                        </span>
                      </button>
                      <div className="w-6 h-0.5 bg-[#00897b] rounded-full mt-1.5" />
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedMonth({ month: m.month, year: m.year })}
                      className="flex items-baseline gap-1 py-1 px-1 text-slate-700 hover:text-[#00897b] transition-colors cursor-pointer select-none"
                      title={`Filter ${m.name} ${m.year}`}
                    >
                      <span className="font-bold text-xs sm:text-sm">{m.name}</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">
                        {m.year}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollMonths('right')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white flex items-center justify-center shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Bulan Selanjutnya"
            aria-label="Bulan Selanjutnya"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Far Right Year Pill matching image.png */}
          <div className="shrink-0 pl-1 sm:pl-3">
            <button
              type="button"
              onClick={() => {
                if (selectedMonth) {
                  onShowToast(`Filter aktif: ${MONTH_NAMES_ID[selectedMonth.month]} ${selectedMonth.year}`);
                }
              }}
              className="bg-[#00897b] hover:bg-[#00796b] text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-2xl shadow-xs transition-colors cursor-pointer select-none"
              title={`Tahun ${activeYearDisplay}`}
            >
              {activeYearDisplay}
            </button>
          </div>
        </div>

        {/* Responsive Table matching image */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            {/* Table Header */}
            <thead>
              {/* Top Category Headers */}
              <tr className="border-b border-slate-100 text-slate-700 text-xs font-bold">
                <th className="py-3 px-3 w-64">Konten Promosi</th>
                <th className="py-3 px-3 w-40">Item</th>
                {/* IG Group */}
                <th colSpan={7} className="py-3 px-2 text-center text-slate-800 font-bold">
                  IG
                </th>
                {/* Tiktok Group */}
                <th colSpan={7} className="py-3 px-2 text-center text-slate-800 font-bold">
                  Tiktok
                </th>
                {/* Jarkom Group */}
                <th colSpan={3} className="py-3 px-2 text-center text-slate-800 font-bold">
                  Jarkom
                </th>
                {/* Set Waktu */}
                <th className="py-3 px-3 text-center w-28 text-slate-800 font-bold">
                  Set Waktu
                </th>
                {/* Transaksi */}
                <th className="py-3 px-3 text-center w-28">Transaksi</th>
                <th className="py-3 px-2 w-8"></th>
              </tr>

              {/* Sub-Column Headers */}
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                <th className="py-2 px-3"></th>
                <th className="py-2 px-3"></th>

                {/* IG sub-columns */}
                <th className="py-2 px-2 text-center">Tanggal</th>
                <th className="py-2 px-2 text-center">Jam</th>
                <th className="py-2 px-2 text-center">Like</th>
                <th className="py-2 px-2 text-center">
                  <div>Comm</div>
                  <div>ent</div>
                </th>
                <th className="py-2 px-2 text-center">Share</th>
                <th className="py-2 px-2 text-center">Saved</th>
                <th className="py-2 px-2 text-center">Reach</th>

                {/* Tiktok sub-columns */}
                <th className="py-2 px-2 text-center">Tanggal</th>
                <th className="py-2 px-2 text-center">Jam</th>
                <th className="py-2 px-2 text-center">Like</th>
                <th className="py-2 px-2 text-center">
                  <div>Comm</div>
                  <div>ent</div>
                </th>
                <th className="py-2 px-2 text-center">Share</th>
                <th className="py-2 px-2 text-center">Saved</th>
                <th className="py-2 px-2 text-center">Reach</th>

                {/* Jarkom sub-columns */}
                <th className="py-2 px-2 text-center">Tanggal</th>
                <th className="py-2 px-2 text-center">Jam</th>
                <th className="py-2 px-2 text-center">Reach</th>

                {/* Set Waktu */}
                <th className="py-2 px-3 text-center"></th>

                {/* Transaksi */}
                <th className="py-2 px-3 text-center"></th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={22} className="py-12 text-center text-slate-400">
                    <p>
                      Belum ada data Konten Promosi
                      {selectedMonth
                        ? ` pada bulan ${MONTH_NAMES_ID[selectedMonth.month]} ${selectedMonth.year}.`
                        : '.'}
                    </p>
                    {selectedMonth && (
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(null)}
                        className="mt-2 text-xs text-[#00897b] font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        Tampilkan Semua Bulan
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  // Check transactions in real time across S-SALUR, D-DONASI, A-AJAR
                  const checkResult = checkTransaksiRealTime(
                    item,
                    salurOrders,
                    donasiOrders,
                    transaksiAjarList
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Konten Promosi Column */}
                      <td className="py-4 px-3 align-middle">
                        <div className="flex items-center gap-3">
                          {/* Teal Play Triangle */}
                          <div className="text-[#00897b] shrink-0">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </div>

                          {/* Poster Thumbnail */}
                          <PosterThumbnail
                            title={item.judul}
                            imageUrl={item.thumbnailUrl}
                            className="shrink-0"
                          />

                          {/* Title and details */}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 text-sm">
                              {item.judul}
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5">
                              {item.format}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px] mt-1">
                              {item.itemSummary}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Item Covers Column */}
                      <td className="py-4 px-3 align-middle">
                        <div className="flex items-center gap-1.5">
                          {item.targetItems && item.targetItems.length > 0 ? (
                            item.targetItems.slice(0, 2).map((t, idx) => (
                              <BookCover
                                key={idx}
                                coverKey={t.coverKey || (idx === 0 ? 'menjadi-buddha' : 'demi-kepentingan')}
                                imageUrl={t.imageUrl}
                                title={t.title}
                                size="sm"
                                className="rounded-lg shadow-2xs border border-slate-200"
                              />
                            ))
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <BookCover coverKey="menjadi-buddha" size="sm" />
                              <BookCover coverKey="demi-kepentingan" size="sm" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* IG Metrics */}
                      <td className="py-4 px-2 text-center text-slate-600 align-middle">
                        {item.ig.tanggal}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-600 align-middle">
                        {item.ig.jam}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.ig.like}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.ig.comment}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.ig.share}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.ig.saved}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.ig.reach}
                      </td>

                      {/* Tiktok Metrics */}
                      <td className="py-4 px-2 text-center text-slate-600 align-middle">
                        {item.tiktok.tanggal}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-600 align-middle">
                        {item.tiktok.jam}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.tiktok.like}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.tiktok.comment}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.tiktok.share}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.tiktok.saved}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.tiktok.reach}
                      </td>

                      {/* Jarkom Metrics */}
                      <td className="py-4 px-2 text-center text-slate-600 align-middle">
                        {item.jarkom.tanggal}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-600 align-middle">
                        {item.jarkom.jam}
                      </td>
                      <td className="py-4 px-2 text-center text-slate-700 font-medium align-middle">
                        {item.jarkom.reach}
                      </td>

                      {/* Set Waktu Column */}
                      <td className="py-4 px-3 text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1 bg-slate-50 border border-slate-200 hover:border-[#00897b] focus-within:border-[#00897b] focus-within:ring-1 focus-within:ring-[#00897b]/30 rounded-xl px-2.5 py-1.5 transition-all shadow-2xs">
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={item.durasiHariCekTransaksi ?? item.setWaktuHari ?? 5}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                              handleUpdateSetWaktu(item.id, val);
                            }}
                            className="w-9 text-center font-bold text-xs text-slate-800 bg-transparent outline-none"
                            title="Set waktu pengecekan transaksi (dalam hari)"
                          />
                          <span className="text-[11px] text-slate-500 font-medium select-none">hari</span>
                        </div>
                      </td>

                      {/* Transaksi Column (Pill button with check logic) */}
                      <td className="py-4 px-3 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => setSelectedTransaksiItem(item)}
                          className="inline-flex items-center justify-center bg-[#00897b] hover:bg-[#00796b] text-white font-semibold text-xs px-6 py-1.5 rounded-full shadow-2xs transition-transform hover:scale-105 cursor-pointer"
                          title="Klik untuk melihat detail pengecekan transaksi pasca sebar konten"
                        >
                          {checkResult.totalCount}
                        </button>
                      </td>

                      {/* Action Menu (⋮) */}
                      <td className="py-4 px-2 text-right align-middle relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === item.id ? null : item.id)
                          }
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTransaksiItem(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#00897b] rounded-xl flex items-center gap-2 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Cek Transaksi 5 Hari</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteItem(item.id);
                                setActiveMenuId(null);
                                onShowToast(`Konten "${item.judul}" dihapus`);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Modal: Detail Pengecekan Transaksi Pasca Sebar Konten */}
      {selectedTransaksiItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#00897b] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Pengecekan Transaksi Pasca Konten Promosi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memantau transaksi item tertentu di Transaksi S-SALUR, D-DONASI, dan A-AJAR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransaksiItem(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Calculation & Overview Box */}
            {(() => {
              const check = checkTransaksiRealTime(
                selectedTransaksiItem,
                salurOrders,
                donasiOrders,
                transaksiAjarList
              );

              return (
                <div className="mt-5 space-y-5">
                  {/* Summary Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Judul Konten
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {selectedTransaksiItem.judul} ({selectedTransaksiItem.format})
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Tanggal Disebar
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                          {selectedTransaksiItem.tanggalDisebar}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Rentang {check.daysDuration} Hari (Set Waktu)
                        </div>
                        <div className="text-sm font-bold text-[#00897b]">
                          {check.startDateStr} — {check.endDateStr}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-500">Item yang Dipantau: </span>
                        <span className="font-semibold text-slate-800">
                          {check.targetItemTitles.join(', ')}
                        </span>
                      </div>
                      <div className="bg-[#00897b] text-white px-3 py-1 rounded-full font-bold text-xs">
                        Total Transaksi Terbeli: {check.totalCount}
                      </div>
                    </div>
                  </div>

                  {/* Explanation of Rule */}
                  <div className="flex items-start gap-2.5 bg-teal-50/70 border border-teal-200/60 rounded-2xl p-3 text-xs text-teal-900">
                    <Info className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Aturan Transaksi Konten Promosi:</span>{' '}
                      Sistem mengecek transaksi item dari <span className="font-semibold">Transaksi S-SALUR</span>, <span className="font-semibold">Transaksi D-DONASI</span>, dan <span className="font-semibold">Transaksi A-AJAR</span> secara real time dalam rentang mulai dari tanggal sebar ({check.startDateStr}) hingga batas waktu set waktu ({check.endDateStr} / {check.daysDuration} hari).
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Daftar Transaksi Terkait ({check.matchingList.length} Transaksi Terbeli)
                    </h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">No. Order</th>
                            <th className="py-2.5 px-2">Sumber</th>
                            <th className="py-2.5 px-2">Tanggal</th>
                            <th className="py-2.5 px-3">Item</th>
                            <th className="py-2.5 px-2 text-center">Qty</th>
                            <th className="py-2.5 px-3">Pelanggan / Donatur</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {check.matchingList.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400">
                                Tidak ada transaksi item terbeli dalam rentang waktu {check.daysDuration} hari ({check.startDateStr} — {check.endDateStr}).
                              </td>
                            </tr>
                          ) : (
                            check.matchingList.map((ord, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-semibold text-slate-800">
                                  {ord.orderNumber}
                                </td>
                                <td className="py-2.5 px-2">
                                  {ord.source === 'S-SALUR' && (
                                    <span className="inline-block bg-teal-50 text-[#00897b] border border-teal-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                      S-SALUR
                                    </span>
                                  )}
                                  {ord.source === 'D-DONASI' && (
                                    <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                      D-DONASI
                                    </span>
                                  )}
                                  {ord.source === 'A-AJAR' && (
                                    <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                      A-AJAR
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap">
                                  {ord.orderDate}
                                </td>
                                <td className="py-2.5 px-3 max-w-[180px] truncate">
                                  {ord.itemTitle}
                                </td>
                                <td className="py-2.5 px-2 text-center font-bold text-[#00897b]">
                                  {ord.quantity}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">
                                  {ord.customerName}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                    {ord.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onShowToast('Data transaksi berhasil diverifikasi!');
                        setSelectedTransaksiItem(null);
                      }}
                      className="bg-[#00897b] hover:bg-[#00796b] text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal: Tambah Konten Promosi */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#00897b] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Tambah Konten Promosi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buat postingan promosi baru dan pantau transaksi 5 hari pasca publikasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="mt-5 space-y-4 text-xs">
              {/* Row: Judul & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Judul Konten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formJudul}
                    onChange={(e) => setFormJudul(e.target.value)}
                    placeholder="Contoh: Poster A, Video Bedah Buku"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Format Konten
                  </label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Carousel">Carousel</option>
                    <option value="Single Post">Single Post</option>
                    <option value="Reels">Reels</option>
                    <option value="Video">Video</option>
                    <option value="Story">Story</option>
                  </select>
                </div>
              </div>

              {/* Row: Tanggal Disebar & Durasi Cek Transaksi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tanggal Disebar
                  </label>
                  <input
                    type="text"
                    value={formTanggalDisebar}
                    onChange={(e) => setFormTanggalDisebar(e.target.value)}
                    placeholder="Contoh: 11 Nov 2021"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Set Waktu Pengecekan Transaksi (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={formDurasiHari}
                    onChange={(e) => setFormDurasiHari(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Transaksi S-SALUR, D-DONASI, dan A-AJAR akan dicek otomatis secara real time dalam rentang mulai dari tanggal hingga waktu set waktu.
                  </span>
                </div>
              </div>

              {/* Item Terkait */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Item yang Dipromosikan (Pilih untuk Cek Transaksi)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                  {allMasterBooks.map((b) => {
                    const isSelected = selectedItemIds.includes(b.id);
                    return (
                      <label
                        key={b.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-50 text-teal-900 font-medium' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItemIds([...selectedItemIds, b.id]);
                            } else {
                              setSelectedItemIds(selectedItemIds.filter((id) => id !== b.id));
                            }
                          }}
                          className="rounded text-[#00897b] focus:ring-teal-500"
                        />
                        <span className="truncate text-xs">{b.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Channel Metrics (IG, Tiktok, Jarkom) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="font-bold text-slate-800 text-xs">
                  Statistik Awal Media Sosial & Jarkom
                </div>

                {/* IG metrics */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-700 mb-2">Instagram (IG)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Tanggal</span>
                      <input
                        type="text"
                        value={formIgTanggal}
                        onChange={(e) => setFormIgTanggal(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Jam</span>
                      <input
                        type="text"
                        value={formIgJam}
                        onChange={(e) => setFormIgJam(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Like</span>
                      <input
                        type="text"
                        value={formIgLike}
                        onChange={(e) => setFormIgLike(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Reach</span>
                      <input
                        type="text"
                        value={formIgReach}
                        onChange={(e) => setFormIgReach(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Tiktok metrics */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-700 mb-2">Tiktok</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Tanggal</span>
                      <input
                        type="text"
                        value={formTiktokTanggal}
                        onChange={(e) => setFormTiktokTanggal(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Jam</span>
                      <input
                        type="text"
                        value={formTiktokJam}
                        onChange={(e) => setFormTiktokJam(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Like</span>
                      <input
                        type="text"
                        value={formTiktokLike}
                        onChange={(e) => setFormTiktokLike(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Reach</span>
                      <input
                        type="text"
                        value={formTiktokReach}
                        onChange={(e) => setFormTiktokReach(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Jarkom metrics */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-700 mb-2">Jaringan Komunikasi (Jarkom)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Tanggal</span>
                      <input
                        type="text"
                        value={formJarkomTanggal}
                        onChange={(e) => setFormJarkomTanggal(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Jam</span>
                      <input
                        type="text"
                        value={formJarkomJam}
                        onChange={(e) => setFormJarkomJam(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Reach</span>
                      <input
                        type="text"
                        value={formJarkomReach}
                        onChange={(e) => setFormJarkomReach(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00897b] hover:bg-[#00796b] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Konten Promosi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
