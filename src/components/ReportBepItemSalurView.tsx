import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Globe,
  MoreVertical,
  ArrowUpDown,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Receipt,
  Boxes,
  Eye,
  FileSpreadsheet,
  Calendar,
  Upload,
  Check,
  BookOpen,
  Book,
  Award,
  DollarSign,
  Package,
  Tag,
  Sparkles,
  Layers,
  Clock,
  HelpCircle,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { BookCover } from './BookCover';
import {
  BepItemSalurRecord,
  INITIAL_BEP_SALUR_RECORDS,
  BEP_STORAGE_KEY,
  BepDiagramRecord,
  INITIAL_BEP_DIAGRAM_RECORDS,
  BEP_DIAGRAM_STORAGE_KEY,
  BEP_CARD_LOGOS_STORAGE_KEY,
  DEFAULT_BEP_CARD_LOGOS,
  BepCardLogoConfig,
  formatBepRupiah,
  formatDateIndo,
  syncBepWithLiveTransactions,
} from '../reportBepSalurData';
import { SalurOrder } from '../salurData';
import { ModalSalurItem } from '../modalSalurData';

interface ReportBepItemSalurViewProps {
  salurOrders?: SalurOrder[];
  modalItems?: ModalSalurItem[];
  onNavigateToTransaksiSalur?: () => void;
  onNavigateToModalItemSalur?: () => void;
  onNavigateToStokItemSalur?: () => void;
  onShowToast?: (msg: string) => void;
}

export const ReportBepItemSalurView: React.FC<ReportBepItemSalurViewProps> = ({
  salurOrders = [],
  modalItems = [],
  onNavigateToTransaksiSalur,
  onNavigateToModalItemSalur,
  onNavigateToStokItemSalur,
  onShowToast = (_msg?: string) => {},
}) => {
  // Main Tab: 'table' or 'diagram'
  const [activeTab, setActiveTab] = useState<'table' | 'diagram'>('table');

  // Filter date state: auto-defaults to today's date if not set
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [filterDate, setFilterDate] = useState<string>(todayDateStr);
  const effectiveFilterDate = filterDate || todayDateStr;

  // Master records
  const [records, setRecords] = useState<BepItemSalurRecord[]>(() => {
    try {
      const saved = localStorage.getItem(BEP_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BEP_SALUR_RECORDS;
  });

  // BEP Card Logo Configuration state with persistent localStorage
  const [cardLogos, setCardLogos] = useState<Record<'bep' | 'belumBep', BepCardLogoConfig>>(() => {
    try {
      const saved = localStorage.getItem(BEP_CARD_LOGOS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load BEP card logos from localStorage', e);
    }
    return DEFAULT_BEP_CARD_LOGOS;
  });

  // Modal for changing card logo
  const [editingCardLogoType, setEditingCardLogoType] = useState<'bep' | 'belumBep' | null>(null);
  const [tempIconType, setTempIconType] = useState<string>('shopping-cart');
  const [tempLogoUrl, setTempLogoUrl] = useState<string>('');
  const [tempBgColor, setTempBgColor] = useState<string>('#008d91');

  // Status Filter: click card to filter table ('sudah' | 'belum' | null)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'sudah' | 'belum' | null>(null);

  // Keep synced with live orders or modal mutations if present, filtered strictly by date
  const syncedRecords = useMemo(() => {
    return syncBepWithLiveTransactions(records, salurOrders, modalItems, effectiveFilterDate);
  }, [records, salurOrders, modalItems, effectiveFilterDate]);

  // Real-time counts of items that are BEP and Belum BEP
  const sudahBepCount = useMemo(
    () => syncedRecords.filter((it) => it.isBep).length,
    [syncedRecords]
  );
  const belumBepCount = useMemo(
    () => syncedRecords.filter((it) => !it.isBep).length,
    [syncedRecords]
  );

  // Table displayed records filtered by status if selected
  const displayedRecords = useMemo(() => {
    if (!selectedStatusFilter) return syncedRecords;
    if (selectedStatusFilter === 'sudah') return syncedRecords.filter((it) => it.isBep);
    return syncedRecords.filter((it) => !it.isBep);
  }, [syncedRecords, selectedStatusFilter]);

  // Action Menu open state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Detail Modal for an item
  const [selectedItemDetail, setSelectedItemDetail] = useState<BepItemSalurRecord | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'pemasukan' | 'pengeluaran' | 'kalkulasi'>('pemasukan');

  // Collapsible sections for Diagram tab (matching image.png)
  const [isBelumBepOpen, setIsBelumBepOpen] = useState(true);
  const [isSudahBepOpen, setIsSudahBepOpen] = useState(true);

  // Derive Diagram records directly from the real table data (syncedRecords)
  const diagramItems = useMemo(() => {
    return syncedRecords.map((rec) => {
      // Split title into balanced lines for left-hand label
      const trimmed = rec.title.trim();
      const yearMatch = trimmed.match(/^(.*?)(\s*\(\d{4}\))$/);
      let displayLines: string[] = [];
      if (yearMatch) {
        const mainTitle = yearMatch[1].trim();
        const yearPart = yearMatch[2].trim();
        const words = mainTitle.split(/\s+/);
        if (words.length <= 2) {
          displayLines = [mainTitle, yearPart];
        } else {
          const mid = Math.ceil(words.length / 2);
          displayLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ') + ' ' + yearPart];
        }
      } else {
        const words = trimmed.split(/\s+/);
        if (words.length <= 2) {
          displayLines = [trimmed];
        } else if (words.length <= 4) {
          displayLines = [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
        } else {
          const mid = Math.ceil(words.length / 2);
          displayLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
        }
      }

      const isBep = rec.isBep;
      const price = rec.price || 1;

      // Belum BEP computations
      const penjualanRp = rec.tersalurRp;
      const penjualanUnit = rec.tersalurUnit;
      const selisihBepRp = Math.max(0, rec.totalModalRp - rec.tersalurRp);
      const selisihBepUnit =
        rec.selisihBepUnit > 0
          ? rec.selisihBepUnit
          : Math.max(0, rec.bepUnit - rec.tersalurUnit) || Math.ceil(selisihBepRp / price);

      let sisaStokSetelahBepUnit = 0;
      if (rec.stok >= selisihBepUnit) {
        sisaStokSetelahBepUnit = rec.stok - selisihBepUnit;
      } else if (rec.cetak > rec.bepUnit) {
        sisaStokSetelahBepUnit = rec.cetak - rec.bepUnit;
      } else {
        sisaStokSetelahBepUnit = Math.max(0, rec.stok);
      }
      const sisaStokSetelahBepRp = sisaStokSetelahBepUnit * price;

      // Sudah BEP computations
      const penjualanUntukBepRp = Math.min(
        rec.tersalurRp,
        rec.totalModalRp > 0 ? rec.totalModalRp : rec.tersalurRp
      );
      const penjualanUntukBepUnit = Math.min(
        rec.tersalurUnit,
        rec.bepUnit > 0 ? rec.bepUnit : rec.tersalurUnit
      );
      const penjualanSetelahBepRp = Math.max(0, rec.tersalurRp - (rec.totalModalRp > 0 ? rec.totalModalRp : 0));
      const penjualanSetelahBepUnit = Math.max(0, rec.tersalurUnit - (rec.bepUnit > 0 ? rec.bepUnit : 0));
      const sisaStokUnit = rec.stok;
      const sisaStokRp = rec.stok * price;

      return {
        id: rec.id,
        title: rec.title,
        displayLines,
        isBep,
        rawRecord: rec,
        penjualanRp,
        penjualanUnit,
        selisihBepRp,
        selisihBepUnit,
        sisaStokSetelahBepRp,
        sisaStokSetelahBepUnit,
        penjualanUntukBepRp,
        penjualanUntukBepUnit,
        penjualanSetelahBepRp,
        penjualanSetelahBepUnit,
        sisaStokRp,
        sisaStokUnit,
      };
    });
  }, [syncedRecords]);

  const belumBepItems = useMemo(
    () => diagramItems.filter((it) => !it.isBep),
    [diagramItems]
  );

  const sudahBepItems = useMemo(
    () => diagramItems.filter((it) => it.isBep),
    [diagramItems]
  );

  // Dynamic Scale & Ticks so all bars fit cleanly without overflowing
  const scaleMax = useMemo(() => {
    const totals = diagramItems.map((it) => {
      if (!it.isBep) {
        return it.penjualanRp + it.selisihBepRp + it.sisaStokSetelahBepRp;
      }
      return (
        (it.penjualanUntukBepRp || 0) +
        (it.penjualanSetelahBepRp || 0) +
        (it.sisaStokRp || 0)
      );
    });
    const highest = Math.max(100_000_000, ...totals);
    if (highest <= 100_000_000) return 100_000_000;
    if (highest <= 200_000_000) return 200_000_000;
    if (highest <= 500_000_000) return 500_000_000;
    return Math.ceil(highest / 100_000_000) * 100_000_000;
  }, [diagramItems]);

  const ticks = useMemo(() => {
    const formatTick = (val: number) => {
      if (val === 0) return 'Rp0';
      return `Rp${Math.round(val).toLocaleString('id-ID')}`;
    };
    return [
      { val: 0, label: 'Rp0', pct: 0 },
      { val: scaleMax * 0.25, label: formatTick(scaleMax * 0.25), pct: 25 },
      { val: scaleMax * 0.50, label: formatTick(scaleMax * 0.50), pct: 50 },
      { val: scaleMax * 0.75, label: formatTick(scaleMax * 0.75), pct: 75 },
      { val: scaleMax, label: formatTick(scaleMax), pct: 100 },
    ];
  }, [scaleMax]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Helper to render icon for cards
  const renderCardIcon = (iconName: string, className = 'w-5 h-5 stroke-[2]') => {
    switch (iconName) {
      case 'shopping-cart':
        return <ShoppingCart className={className} />;
      case 'check-circle-2':
        return <CheckCircle2 className={className} />;
      case 'trending-up':
        return <TrendingUp className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'dollar-sign':
        return <DollarSign className={className} />;
      case 'check':
        return <Check className={className} />;
      case 'package':
        return <Package className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'book-open':
        return <BookOpen className={className} />;
      case 'book':
        return <Book className={className} />;
      case 'layers':
        return <Layers className={className} />;
      case 'globe':
        return <Globe className={className} />;
      case 'alert-circle':
        return <AlertCircle className={className} />;
      case 'trending-down':
        return <TrendingDown className={className} />;
      case 'clock':
        return <Clock className={className} />;
      case 'help-circle':
        return <HelpCircle className={className} />;
      case 'x-circle':
        return <XCircle className={className} />;
      case 'boxes':
        return <Boxes className={className} />;
      case 'tag':
        return <Tag className={className} />;
      case 'refresh-cw':
        return <RefreshCw className={className} />;
      default:
        return <ShoppingCart className={className} />;
    }
  };

  const handleOpenChangeCardLogo = (type: 'bep' | 'belumBep') => {
    setEditingCardLogoType(type);
    const curr = cardLogos[type] || DEFAULT_BEP_CARD_LOGOS[type];
    setTempIconType(curr.iconType || (type === 'bep' ? 'shopping-cart' : 'globe'));
    setTempLogoUrl(curr.logoUrl || '');
    setTempBgColor(curr.bgColor || '#008d91');
  };

  const handleSaveCardLogo = () => {
    if (!editingCardLogoType) return;
    const updated = {
      ...cardLogos,
      [editingCardLogoType]: {
        iconType: tempIconType,
        logoUrl: tempLogoUrl.trim(),
        bgColor: tempBgColor || '#008d91',
      },
    };
    setCardLogos(updated);
    try {
      localStorage.setItem(BEP_CARD_LOGOS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save card logo to localStorage', e);
    }
    const label = editingCardLogoType === 'bep' ? 'BEP' : 'Belum BEP';
    onShowToast(`Logo kartu ${label} berhasil diperbarui`);
    setEditingCardLogoType(null);
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-200">
      {/* Top Action Row: Tabs (Table & Diagram) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`px-8 py-2 rounded-xl text-sm font-medium transition-all shadow-2xs cursor-pointer ${
            activeTab === 'table'
              ? 'bg-[#008d91] text-white shadow-sm'
              : 'bg-[#9ea3ab] hover:bg-[#8f959e] text-white'
          }`}
        >
          Table
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagram')}
          className={`px-8 py-2 rounded-xl text-sm font-medium transition-all shadow-2xs cursor-pointer ${
            activeTab === 'diagram'
              ? 'bg-[#008d91] text-white shadow-sm'
              : 'bg-[#9ea3ab] hover:bg-[#8f959e] text-white'
          }`}
        >
          Diagram
        </button>
      </div>

      {/* Summary Cards Row (Real counts of items with BEP & Belum BEP, customizable logo) */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Card 1: BEP (Sudah BEP) */}
        <div
          onClick={() => {
            if (selectedStatusFilter === 'sudah') {
              setSelectedStatusFilter(null);
              onShowToast('Menampilkan semua item BEP');
            } else {
              setSelectedStatusFilter('sudah');
              onShowToast('Filter: Menampilkan item Sudah BEP');
            }
          }}
          className={`bg-white rounded-2xl border ${
            selectedStatusFilter === 'sudah'
              ? 'border-[#008d91] ring-2 ring-[#008d91]/25'
              : 'border-slate-100/90 hover:border-slate-200'
          } shadow-2xs p-3.5 px-4 flex items-center justify-between min-w-[210px] w-full sm:w-auto cursor-pointer transition-all select-none`}
          title="Klik untuk filter item Sudah BEP"
        >
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-slate-400">BEP</span>
            <span className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight mt-0.5">
              {sudahBepCount} Item
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenChangeCardLogo('bep');
            }}
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer overflow-hidden"
            style={{ backgroundColor: cardLogos.bep.bgColor || '#008d91' }}
            title="Klik untuk ubah logo BEP"
          >
            {cardLogos.bep.logoUrl ? (
              <img
                src={cardLogos.bep.logoUrl}
                alt="Logo BEP"
                className="w-full h-full object-cover"
              />
            ) : (
              renderCardIcon(cardLogos.bep.iconType || 'shopping-cart')
            )}
          </button>
        </div>

        {/* Card 2: Belum BEP */}
        <div
          onClick={() => {
            if (selectedStatusFilter === 'belum') {
              setSelectedStatusFilter(null);
              onShowToast('Menampilkan semua item BEP');
            } else {
              setSelectedStatusFilter('belum');
              onShowToast('Filter: Menampilkan item Belum BEP');
            }
          }}
          className={`bg-white rounded-2xl border ${
            selectedStatusFilter === 'belum'
              ? 'border-[#008d91] ring-2 ring-[#008d91]/25'
              : 'border-slate-100/90 hover:border-slate-200'
          } shadow-2xs p-3.5 px-4 flex items-center justify-between min-w-[210px] w-full sm:w-auto cursor-pointer transition-all select-none`}
          title="Klik untuk filter item Belum BEP"
        >
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-slate-400">Belum BEP</span>
            <span className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight mt-0.5">
              {belumBepCount} Item
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenChangeCardLogo('belumBep');
            }}
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer overflow-hidden"
            style={{ backgroundColor: cardLogos.belumBep.bgColor || '#008d91' }}
            title="Klik untuk ubah logo Belum BEP"
          >
            {cardLogos.belumBep.logoUrl ? (
              <img
                src={cardLogos.belumBep.logoUrl}
                alt="Logo Belum BEP"
                className="w-full h-full object-cover"
              />
            ) : (
              renderCardIcon(cardLogos.belumBep.iconType || 'globe')
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: TABLE VIEW (Strict 1:1 match to user screenshot with Date Filter on top right) */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100/90 overflow-hidden">
          {/* Top Bar above Table: Status Filter on Left, Date Filter on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              {selectedStatusFilter && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs text-[#008d91] font-medium animate-in fade-in">
                  <span>Status: {selectedStatusFilter === 'sudah' ? 'Sudah BEP' : 'Belum BEP'}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter(null)}
                    className="text-teal-600 hover:text-teal-800 cursor-pointer ml-0.5"
                    title="Hapus filter status"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Filter Tanggal di bagian atas kanan tabel */}
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="flex items-center bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-1.5 shadow-2xs transition-colors">
                <Calendar className="w-4 h-4 text-[#008d91] mr-2 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 mr-2 select-none">
                  Tanggal:
                </span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterDate(val || todayDateStr);
                    onShowToast(`Filter tanggal: ${val ? formatDateIndo(val) : 'Hari Ini'}`);
                  }}
                  className="text-xs font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  title="Pilih tanggal perhitungan BEP (Otomatis ke hari ini jika tidak diset)"
                />
                {filterDate && filterDate !== todayDateStr && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDate(todayDateStr);
                      onShowToast('Filter tanggal direset ke Hari Ini');
                    }}
                    className="ml-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Reset ke Hari Ini"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1050px]">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-slate-100 text-slate-700 text-[13px] sm:text-[14px] font-medium">
                  <th className="py-3 px-3 text-left font-medium min-w-[260px]">Nama Item</th>
                  <th className="py-3 px-3 text-left font-medium">Cetak</th>
                  <th className="py-3 px-3 text-left font-medium">Stok</th>
                  <th className="py-3 px-3 text-left font-medium">Tersalur</th>
                  <th className="py-3 px-3 text-left font-medium">Tersalur (Rp)</th>
                  <th className="py-3 px-3 text-left font-medium">BEP</th>
                  <th className="py-3 px-3 text-left font-medium">Selisih BEP (Rp)</th>
                  <th className="py-3 px-3 text-center font-medium">BEP?</th>
                  <th className="py-3 px-3 text-left font-medium">Selisih BEP</th>
                  <th className="py-3 px-2 text-center w-10"></th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedRecords.map((item) => {
                  const isPositive = item.selisihBepRp >= 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group text-slate-700"
                    >
                      {/* Nama Item with Book Cover & Metadata */}
                      <td className="py-4 px-3 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className="w-13 h-17 sm:w-14 sm:h-18 rounded-xl overflow-hidden shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center border border-slate-150">
                            <BookCover
                              coverKey={item.coverKey}
                              title={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 text-[14px] sm:text-[15px] leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[12px] text-slate-600 font-normal mt-0.5">
                              {formatBepRupiah(item.price)}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-1">
                              Stok: {item.stok}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cetak */}
                      <td className="py-4 px-3 align-middle font-medium text-slate-700 text-[14px]">
                        {item.cetak.toLocaleString('id-ID')}
                      </td>

                      {/* Stok */}
                      <td className="py-4 px-3 align-middle font-medium text-slate-700 text-[14px]">
                        {item.stok.toLocaleString('id-ID')}
                      </td>

                      {/* Tersalur */}
                      <td className="py-4 px-3 align-middle font-medium text-slate-700 text-[14px]">
                        {item.tersalurUnit.toLocaleString('id-ID')}
                      </td>

                      {/* Tersalur (Rp) */}
                      <td className="py-4 px-3 align-middle font-medium text-slate-800 text-[14px]">
                        {formatBepRupiah(item.tersalurRp)}
                      </td>

                      {/* BEP (Unit) */}
                      <td className="py-4 px-3 align-middle font-medium text-slate-700 text-[14px]">
                        {item.bepUnit.toLocaleString('id-ID')}
                      </td>

                      {/* Selisih BEP (Rp) */}
                      <td className="py-4 px-3 align-middle font-medium text-[14px]">
                        {isPositive ? (
                          <span className="text-[#008d91] font-semibold">
                            +{formatBepRupiah(item.selisihBepRp)}
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold">
                            -{Math.abs(item.selisihBepRp).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>

                      {/* BEP? Badge */}
                      <td className="py-4 px-3 align-middle text-center">
                        {item.isBep ? (
                          <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-medium bg-[#008d91] text-white shadow-2xs">
                            Sudah
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-medium bg-[#f05252] text-white shadow-2xs">
                            Belum
                          </span>
                        )}
                      </td>

                      {/* Selisih BEP */}
                      <td className="py-4 px-3 align-middle font-normal text-[13px]">
                        {item.isBep ? (
                          <span className="text-slate-400 font-medium">-</span>
                        ) : (
                          <span className="text-red-500 font-normal">
                            {item.selisihBepUnit} buku
                          </span>
                        )}
                      </td>

                      {/* Actions Column (Three dots menu) */}
                      <td className="py-4 px-2 align-middle text-center relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Menu Aksi"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 top-12 z-30 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs text-left animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemDetail(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-[#008d91]" />
                              <span>Lihat Rincian Mutasi BEP</span>
                            </button>

                            {onNavigateToTransaksiSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToTransaksiSalur();
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <ShoppingCart className="w-4 h-4 text-slate-400" />
                                <span>Buka Transaksi S-SALUR</span>
                              </button>
                            )}

                            {onNavigateToModalItemSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToModalItemSalur();
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Receipt className="w-4 h-4 text-slate-400" />
                                <span>Buka Modal Item S-SALUR</span>
                              </button>
                            )}

                            {onNavigateToStokItemSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToStokItemSalur();
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Boxes className="w-4 h-4 text-slate-400" />
                                <span>Buka Stok Item S-SALUR</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIAGRAM VIEW (Strictly matching user screenshot image.png) */}
      {activeTab === 'diagram' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* SECTION 1: BELUM BEP */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsBelumBepOpen(!isBelumBepOpen)}
              className="flex items-center gap-2 text-[#008d91] font-bold text-sm sm:text-base hover:opacity-85 transition-opacity text-left cursor-pointer w-fit select-none"
            >
              <span className="text-xs">{isBelumBepOpen ? '▼' : '▶'}</span>
              <span>Belum BEP</span>
            </button>

            {isBelumBepOpen && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Container with shared vertical grid lines */}
                  <div className="relative flex flex-col gap-5 sm:gap-6 pb-2">
                    {/* Vertical grid lines extending through all rows */}
                    <div
                      className="absolute top-0 bottom-8 pointer-events-none"
                      style={{ left: '190px', width: '560px' }}
                    >
                      {ticks.map((t) => (
                        <div
                          key={t.val}
                          className="absolute top-0 bottom-0 w-[1px] bg-slate-300"
                          style={{ left: `${t.pct}%` }}
                        />
                      ))}
                    </div>

                    {/* Book Rows */}
                    {belumBepItems.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                        Tidak ada item Belum BEP pada data tabel saat ini.
                      </div>
                    ) : (
                      belumBepItems.map((item) => {
                        const penjualanPct = (item.penjualanRp / scaleMax) * 100;
                        const selisihPct = (item.selisihBepRp / scaleMax) * 100;
                        const bepPointPct = Math.min(100, penjualanPct + selisihPct);
                        const sisaStokPct = (item.sisaStokSetelahBepRp / scaleMax) * 100;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedItemDetail(item.rawRecord);
                              setDetailActiveTab('kalkulasi');
                            }}
                            className="flex items-center z-1 min-h-[56px] hover:bg-slate-50/70 p-1.5 -mx-1.5 rounded-2xl cursor-pointer transition-colors group/diag"
                            title={`Klik untuk melihat detail kalkulasi BEP ${item.title}`}
                          >
                            {/* Left: Book Title */}
                            <div className="w-[190px] shrink-0 text-right pr-6 sm:pr-8 text-slate-700 text-xs sm:text-[13px] font-normal leading-snug group-hover/diag:text-[#008d91] transition-colors">
                              {item.displayLines.map((line, idx) => (
                                <div key={idx}>{line}</div>
                              ))}
                            </div>

                            {/* Center: Stacked Horizontal Bar */}
                            <div className="w-[560px] shrink-0 h-6 sm:h-[26px] relative flex items-center overflow-visible">
                              {/* Segment 1 (Teal): Penjualan */}
                              <div
                                style={{ width: `${penjualanPct}%` }}
                                className="h-full bg-[#008d91] shrink-0"
                                title={`Penjualan (Rp): ${formatBepRupiah(item.penjualanRp)} (${item.penjualanUnit} buku)`}
                              />

                              {/* Segment 2 (Red): Selisih BEP */}
                              <div
                                style={{ width: `${selisihPct}%` }}
                                className="h-full bg-[#f05252] shrink-0"
                                title={`Selisih BEP (Rp): ${formatBepRupiah(item.selisihBepRp)} (${item.selisihBepUnit} buku)`}
                              />

                              {/* Red vertical notch marker at BEP threshold */}
                              <div
                                style={{ left: `${bepPointPct}%` }}
                                className="absolute top-1/2 -translate-y-1/2 w-[3px] h-[34px] bg-[#ee4d4d] z-10 -ml-[1.5px] pointer-events-none rounded-xs shadow-xs"
                                title="Titik Impas (BEP)"
                              />

                              {/* Segment 3 (Grey): Sisa Stok Setelah BEP */}
                              <div
                                style={{ width: `${sisaStokPct}%` }}
                                className="h-full bg-[#a8adb5] shrink-0"
                                title={`Sisa Stok Setelah BEP (Rp): ${formatBepRupiah(item.sisaStokSetelahBepRp)} (${item.sisaStokSetelahBepUnit} buku)`}
                              />
                            </div>

                            {/* Right: Text details */}
                            <div className="pl-8 sm:pl-10 text-slate-700 text-xs sm:text-[13px] leading-tight space-y-0.5 sm:space-y-1 shrink-0">
                              <div>
                                Penjualan (Rp): {formatBepRupiah(item.penjualanRp)} ({item.penjualanUnit} buku)
                              </div>
                              <div>
                                Selisih BEP (Rp): {formatBepRupiah(item.selisihBepRp)} ({item.selisihBepUnit} buku)
                              </div>
                              <div>
                                Sisa Stok Setelah BEP (Rp): {formatBepRupiah(item.sisaStokSetelahBepRp)} ({item.sisaStokSetelahBepUnit} buku)
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Bottom X-axis scale with tick labels */}
                    <div className="flex items-center pt-2">
                      <div className="w-[190px] shrink-0" />
                      <div className="w-[560px] shrink-0 relative h-6 text-xs sm:text-[13px] text-slate-700 select-none">
                        {ticks.map((t) => (
                          <div
                            key={t.val}
                            className="absolute top-0 whitespace-nowrap"
                            style={{
                              left: `${t.pct}%`,
                              transform: t.pct === 0 ? 'translateX(-20%)' : 'translateX(-50%)',
                            }}
                          >
                            {t.label}
                          </div>
                        ))}
                      </div>
                      <div className="pl-8 sm:pl-10" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: SUDAH BEP */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsSudahBepOpen(!isSudahBepOpen)}
              className="flex items-center gap-2 text-[#008d91] font-bold text-sm sm:text-base hover:opacity-85 transition-opacity text-left cursor-pointer w-fit select-none"
            >
              <span className="text-xs">{isSudahBepOpen ? '▼' : '▶'}</span>
              <span>Sudah BEP</span>
            </button>

            {isSudahBepOpen && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Container with shared vertical grid lines */}
                  <div className="relative flex flex-col gap-5 sm:gap-6 pb-2">
                    {/* Vertical grid lines extending through all rows */}
                    <div
                      className="absolute top-0 bottom-8 pointer-events-none"
                      style={{ left: '190px', width: '560px' }}
                    >
                      {ticks.map((t) => (
                        <div
                          key={t.val}
                          className="absolute top-0 bottom-0 w-[1px] bg-slate-300"
                          style={{ left: `${t.pct}%` }}
                        />
                      ))}
                    </div>

                    {/* Book Rows */}
                    {sudahBepItems.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                        Tidak ada item Sudah BEP pada data tabel saat ini.
                      </div>
                    ) : (
                      sudahBepItems.map((item) => {
                        const penjualanUntukBepPct = ((item.penjualanUntukBepRp || 0) / scaleMax) * 100;
                        const bepPointPct = penjualanUntukBepPct;
                        const penjualanSetelahBepPct = ((item.penjualanSetelahBepRp || 0) / scaleMax) * 100;
                        const sisaStokPct = ((item.sisaStokRp || 0) / scaleMax) * 100;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedItemDetail(item.rawRecord);
                              setDetailActiveTab('kalkulasi');
                            }}
                            className="flex items-center z-1 min-h-[56px] hover:bg-slate-50/70 p-1.5 -mx-1.5 rounded-2xl cursor-pointer transition-colors group/diag"
                            title={`Klik untuk melihat detail kalkulasi BEP ${item.title}`}
                          >
                            {/* Left: Book Title */}
                            <div className="w-[190px] shrink-0 text-right pr-6 sm:pr-8 text-slate-700 text-xs sm:text-[13px] font-normal leading-snug group-hover/diag:text-[#008d91] transition-colors">
                              {item.displayLines.map((line, idx) => (
                                <div key={idx}>{line}</div>
                              ))}
                            </div>

                            {/* Center: Stacked Horizontal Bar */}
                            <div className="w-[560px] shrink-0 h-6 sm:h-[26px] relative flex items-center overflow-visible">
                              {/* Segment 1 (Teal): Penjualan untuk BEP */}
                              <div
                                style={{ width: `${penjualanUntukBepPct}%` }}
                                className="h-full bg-[#008d91] shrink-0"
                                title={`Penjualan untuk BEP(Rp): ${formatBepRupiah(item.penjualanUntukBepRp || 0)} (${item.penjualanUntukBepUnit} buku)`}
                              />

                              {/* Red vertical notch marker at BEP threshold */}
                              <div
                                style={{ left: `${bepPointPct}%` }}
                                className="absolute top-1/2 -translate-y-1/2 w-[3px] h-[34px] bg-[#ee4d4d] z-10 -ml-[1.5px] pointer-events-none rounded-xs shadow-xs"
                                title="Titik Impas (BEP)"
                              />

                              {/* Segment 2 (Yellow): Penjualan Setelah BEP */}
                              <div
                                style={{ width: `${penjualanSetelahBepPct}%` }}
                                className="h-full bg-[#f5be38] shrink-0"
                                title={`Penjualan Setelah BEP (Rp): ${formatBepRupiah(item.penjualanSetelahBepRp || 0)} (${item.penjualanSetelahBepUnit} buku)`}
                              />

                              {/* Segment 3 (Grey): Sisa Stok */}
                              <div
                                style={{ width: `${sisaStokPct}%` }}
                                className="h-full bg-[#a8adb5] shrink-0"
                                title={`Sisa Stok (Rp): ${formatBepRupiah(item.sisaStokRp || 0)} (${item.sisaStokUnit} buku)`}
                              />
                            </div>

                            {/* Right: Text details */}
                            <div className="pl-8 sm:pl-10 text-slate-700 text-xs sm:text-[13px] leading-tight space-y-0.5 sm:space-y-1 shrink-0">
                              <div>
                                Penjualan untuk BEP(Rp): {formatBepRupiah(item.penjualanUntukBepRp || 0)} ({item.penjualanUntukBepUnit} buku)
                              </div>
                              <div>
                                Penjualan Setelah BEP (Rp): {formatBepRupiah(item.penjualanSetelahBepRp || 0)} ({item.penjualanSetelahBepUnit} buku)
                              </div>
                              <div>
                                Sisa Stok (Rp): {formatBepRupiah(item.sisaStokRp || 0)} ({item.sisaStokUnit} buku)
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Bottom X-axis scale with tick labels */}
                    <div className="flex items-center pt-2">
                      <div className="w-[190px] shrink-0" />
                      <div className="w-[560px] shrink-0 relative h-6 text-xs sm:text-[13px] text-slate-700 select-none">
                        {ticks.map((t) => (
                          <div
                            key={t.val}
                            className="absolute top-0 whitespace-nowrap"
                            style={{
                              left: `${t.pct}%`,
                              transform: t.pct === 0 ? 'translateX(-20%)' : 'translateX(-50%)',
                            }}
                          >
                            {t.label}
                          </div>
                        ))}
                      </div>
                      <div className="pl-8 sm:pl-10" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL UBAH LOGO KARTU BEP / BELUM BEP */}
      {editingCardLogoType && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs overflow-hidden"
                  style={{ backgroundColor: tempBgColor || '#008d91' }}
                >
                  {tempLogoUrl ? (
                    <img src={tempLogoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    renderCardIcon(tempIconType, 'w-5 h-5')
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    {editingCardLogoType === 'bep' ? 'Ubah Logo BEP' : 'Ubah Logo Belum BEP'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesuaikan logo tampilan kartu {editingCardLogoType === 'bep' ? 'BEP' : 'Belum BEP'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCardLogoType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Preset Icons Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Ikon Logo:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: 'shopping-cart', label: 'Cart' },
                    { id: 'check-circle-2', label: 'Check' },
                    { id: 'trending-up', label: 'Trending Up' },
                    { id: 'award', label: 'Award' },
                    { id: 'dollar-sign', label: 'Dollar' },
                    { id: 'package', label: 'Package' },
                    { id: 'sparkles', label: 'Sparkles' },
                    { id: 'book-open', label: 'Buku' },
                    { id: 'globe', label: 'Globe' },
                    { id: 'alert-circle', label: 'Alert' },
                    { id: 'trending-down', label: 'Trending Down' },
                    { id: 'clock', label: 'Clock' },
                  ].map((ic) => {
                    const isSelected = !tempLogoUrl && tempIconType === ic.id;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => {
                          setTempIconType(ic.id);
                          setTempLogoUrl('');
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#008d91] bg-teal-50 text-[#008d91] ring-2 ring-[#008d91]/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                        }`}
                        title={ic.label}
                      >
                        {renderCardIcon(ic.id, 'w-4 h-4')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Logo Image URL or Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Atau Gunakan Gambar / Unggah Logo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://contoh.com/logo.png"
                    value={tempLogoUrl}
                    onChange={(e) => setTempLogoUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008d91]"
                  />
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setTempLogoUrl(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Background Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Warna Latar Belakang:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    '#008d91',
                    '#10b981',
                    '#f05252',
                    '#f59e0b',
                    '#6366f1',
                    '#8b5cf6',
                    '#ec4899',
                    '#1e293b',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTempBgColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        tempBgColor === color
                          ? 'scale-110 ring-2 ring-offset-2 ring-slate-400'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {tempBgColor === color && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingCardLogoType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCardLogo}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] shadow-xs transition-colors cursor-pointer"
              >
                Simpan Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MUTASI MODAL */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-16 rounded-xl overflow-hidden shadow-2xs shrink-0 border border-slate-200 bg-white">
                  <BookCover coverKey={selectedItemDetail.coverKey} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    {selectedItemDetail.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Harga Jual: {formatBepRupiah(selectedItemDetail.price)}</span>
                    <span>•</span>
                    <span>Target BEP: {selectedItemDetail.bepUnit} buku</span>
                    <span>•</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium text-white ${
                        selectedItemDetail.isBep ? 'bg-[#008d91]' : 'bg-[#f05252]'
                      }`}
                    >
                      {selectedItemDetail.isBep ? 'Sudah BEP' : 'Belum BEP'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex items-center border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDetailActiveTab('pemasukan')}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  detailActiveTab === 'pemasukan'
                    ? 'border-[#008d91] text-[#008d91]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Mutasi Pemasukan Transaksi ({selectedItemDetail.inflows.length})
              </button>

              <button
                type="button"
                onClick={() => setDetailActiveTab('pengeluaran')}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  detailActiveTab === 'pengeluaran'
                    ? 'border-[#008d91] text-[#008d91]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Mutasi Modal Pengeluaran ({selectedItemDetail.outflows.length})
              </button>

              <button
                type="button"
                onClick={() => setDetailActiveTab('kalkulasi')}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  detailActiveTab === 'kalkulasi'
                    ? 'border-[#008d91] text-[#008d91]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Formula & Analisis BEP
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4">
              {/* Tab 1: Mutasi Pemasukan Transaksi S-SALUR */}
              {detailActiveTab === 'pemasukan' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Daftar mutasi pemasukan dari Transaksi S-SALUR:</span>
                    <span className="font-semibold text-slate-800">
                      Total Pemasukan: {formatBepRupiah(selectedItemDetail.tersalurRp)}
                    </span>
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-150">
                        <tr>
                          <th className="py-2.5 px-3 text-left">No. Pesanan / Sumber</th>
                          <th className="py-2.5 px-3 text-left">Customer / Donatur</th>
                          <th className="py-2.5 px-3 text-center">Tanggal</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItemDetail.inflows.map((inf) => (
                          <tr key={inf.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              <div>{inf.orderNumber}</div>
                              <span className="text-[10px] text-teal-600">{inf.source}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{inf.customerName}</td>
                            <td className="py-2.5 px-3 text-center text-slate-500">{inf.date}</td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                              {inf.qty}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                              {formatBepRupiah(inf.totalNominal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Mutasi Modal Pengeluaran */}
              {detailActiveTab === 'pengeluaran' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Daftar mutasi pengeluaran dari Modal Item S-SALUR:</span>
                    <span className="font-semibold text-slate-800">
                      Total Modal: {formatBepRupiah(selectedItemDetail.totalModalRp)}
                    </span>
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-150">
                        <tr>
                          <th className="py-2.5 px-3 text-left">Kode Mutasi</th>
                          <th className="py-2.5 px-3 text-left">Rekening / Keterangan</th>
                          <th className="py-2.5 px-3 text-center">Tanggal</th>
                          <th className="py-2.5 px-3 text-right">Yang Kita Bayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItemDetail.outflows.map((out) => (
                          <tr key={out.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#008d91] text-white">
                                {out.code}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              <div className="font-medium">{out.keterangan}</div>
                              <span className="text-[10px] text-slate-400">{out.bankAccount}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-500">{out.date}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-red-600">
                              {formatBepRupiah(out.nominal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Formula & Analisis */}
              {detailActiveTab === 'kalkulasi' && (
                <div className="flex flex-col gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Kalkulasi Titik Impas (Break Even Point)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400">Total Modal Pengeluaran:</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {formatBepRupiah(selectedItemDetail.totalModalRp)}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400">Total Pemasukan Mutasi:</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {formatBepRupiah(selectedItemDetail.tersalurRp)}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400">Target BEP (Unit):</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedItemDetail.bepUnit} buku
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400">Realisasi Tersalur:</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedItemDetail.tersalurUnit} buku
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 font-medium">Selisih BEP (Rp):</span>
                      <p
                        className={`text-base font-bold mt-0.5 ${
                          selectedItemDetail.selisihBepRp >= 0
                            ? 'text-[#008d91]'
                            : 'text-red-500'
                        }`}
                      >
                        {selectedItemDetail.selisihBepRp >= 0 ? '+' : ''}
                        {formatBepRupiah(selectedItemDetail.selisihBepRp)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 font-medium">Status Titik Impas:</span>
                      <p
                        className={`text-sm font-bold mt-0.5 ${
                          selectedItemDetail.isBep ? 'text-[#008d91]' : 'text-red-500'
                        }`}
                      >
                        {selectedItemDetail.isBep
                          ? 'Sudah Terpenuhi (Profit)'
                          : `Belum Terpenuhi (Kurang ${selectedItemDetail.selisihBepUnit} buku)`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

