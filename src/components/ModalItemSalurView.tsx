import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  EyeOff,
  Eye,
  Globe,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  CreditCard,
  ArrowLeftRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
} from 'lucide-react';
import { SalurProduct, SalurOrder } from '../salurData';
import { BookCover } from './BookCover';
import {
  ModalSalurItem,
  ModalSalurYearGroup,
  ModalSalurVariant,
  ModalSalurConnectedMutasi,
  INITIAL_MODAL_SALUR_ITEMS,
  MODAL_SALUR_STORAGE_KEY,
  syncModalSalurWithOrders,
  recalculateModalSalurItem,
} from '../modalSalurData';
import { MutasiItem } from '../types';
import { ModalTambahkanMutasiModalSalur } from './ModalTambahkanMutasiModalSalur';

interface MutasiBadgeWithTooltipProps {
  codes: string[];
  badgeColor: 'teal' | 'red';
  badgeText: string;
  itemTitle: string;
  year?: string;
  yangKitaBayar: number;
  subtext?: string;
  connectedList?: ModalSalurConnectedMutasi[];
  onClick: () => void;
}

const MutasiBadgeWithTooltip: React.FC<MutasiBadgeWithTooltipProps> = ({
  codes,
  badgeColor,
  badgeText,
  itemTitle,
  year,
  yangKitaBayar,
  subtext,
  connectedList = [],
  onClick,
}) => {
  const isRed = badgeColor === 'red';

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-xs transition-transform hover:scale-105 cursor-pointer ${
          isRed
            ? 'bg-[#f05252] hover:bg-[#e02424]'
            : 'bg-[#008d91] hover:bg-[#05828e]'
        }`}
      >
        {badgeText}
      </button>

      {/* Floating Hover Tooltip (appears on hover) */}
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 z-50 pointer-events-none min-w-[270px] max-w-[340px] bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="font-bold text-slate-100 text-xs">
              {codes.length > 0 ? `${codes.length} Kode Mutasi Terkoneksi` : 'Belum Ada Mutasi'}
            </span>
          </div>
          {year && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-teal-300 font-mono">
              Tahun {year}
            </span>
          )}
        </div>

        {/* List of Connected Mutasi */}
        {codes.length === 0 ? (
          <p className="text-[11px] text-slate-400 py-1">
            Belum ada transaksi mutasi yang terhubung.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto custom-scrollbar my-1">
            {codes.map((code, idx) => {
              const matchedConn = connectedList.find((c) => c.mutasiCode === code);
              return (
                <div
                  key={idx}
                  className="bg-slate-800/90 rounded-xl p-2 border border-slate-700/60 flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-bold text-teal-300 text-[11px] truncate">
                      {code}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {matchedConn?.bankAccount || 'BCA 388'} {matchedConn?.date ? `• ${matchedConn.date}` : ''}
                    </span>
                  </div>
                  {matchedConn && (
                    <span className="font-semibold text-slate-200 text-xs shrink-0">
                      Rp{matchedConn.nominal.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Summary */}
        <div className="pt-2 border-t border-slate-700/80 mt-2 flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span>Kewajiban Royalti:</span>
            <span className="font-semibold text-slate-100">
              Rp{yangKitaBayar.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status Pembayaran:</span>
            {isRed ? (
              <span className="font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800/60 text-[10px]">
                Kurang Bayar {subtext || ''}
              </span>
            ) : (
              <span className="font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-800/60 text-[10px]">
                ✓ Lunas
              </span>
            )}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center mt-2 pt-1 border-t border-slate-800">
          Klik badge untuk kelola / detail mutasi
        </div>

        {/* Triangle Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
};

interface ModalItemSalurViewProps {
  items?: SalurProduct[];
  mutasiItems?: MutasiItem[];
  salurOrders?: SalurOrder[];
  onUpdateMutasiItems?: (updated: MutasiItem[]) => void;
  onNavigateToMutasi?: (bankAccount: string, query?: string) => void;
  onNavigateToItemSalur?: (productId?: string) => void;
  onNavigateToReportBepSalur?: () => void;
  onShowToast?: (msg: string) => void;
}

export const ModalItemSalurView: React.FC<ModalItemSalurViewProps> = ({
  items: propsSalurItems,
  mutasiItems = [],
  salurOrders = [],
  onUpdateMutasiItems,
  onNavigateToMutasi,
  onNavigateToItemSalur,
  onNavigateToReportBepSalur,
  onShowToast = (_msg: string) => {},
}) => {
  // Master modal items list backed by localStorage
  const [modalItems, setModalItems] = useState<ModalSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(MODAL_SALUR_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load modal salur items from storage', e);
    }
    return INITIAL_MODAL_SALUR_ITEMS;
  });

  // Real-time synchronization with Transaksi S-SALUR
  // Rule:
  // - Tahun: kapan saja Item S-SALUR tersebar (hanya jumlahkan yang sudah lunas dan terkoneksi mutasi)
  // - Jml: jumlah Item S-SALUR yang sudah tersebar (hanya jumlahkan yang sudah lunas dan terkoneksi mutasi)
  // - Promo: promo apa saja yang tersebar (hanya jumlahkan yang sudah lunas dan terkoneksi mutasi)
  // - Harga Jual: harga jual yang tersebar (hanya jumlahkan yang sudah lunas dan terkoneksi mutasi)
  const syncedModalItems = useMemo(() => {
    return syncModalSalurWithOrders(modalItems, salurOrders, mutasiItems);
  }, [modalItems, salurOrders, mutasiItems]);

  // Modal Tambahkan Kode Mutasi State
  const [isTambahkanMutasiModalOpen, setIsTambahkanMutasiModalOpen] = useState(false);
  const [selectedItemForMutasi, setSelectedItemForMutasi] = useState<ModalSalurItem | null>(null);
  const [selectedYearForMutasi, setSelectedYearForMutasi] = useState<string | undefined>(undefined);

  const handleOpenTambahkanMutasi = (item: ModalSalurItem, year?: string) => {
    setSelectedItemForMutasi(item);
    setSelectedYearForMutasi(year);
    setIsTambahkanMutasiModalOpen(true);
  };

  const handleSaveMutasiConnection = (
    updatedItem: ModalSalurItem,
    updatedMutasiItems: MutasiItem[]
  ) => {
    const updatedList = modalItems.map((m) =>
      m.id === updatedItem.id ? updatedItem : m
    );
    setModalItems(updatedList);
    try {
      localStorage.setItem(MODAL_SALUR_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    if (onUpdateMutasiItems) {
      onUpdateMutasiItems(updatedMutasiItems);
    }
  };

  // Track expanded rows (Item level and Year level)
  // By default, 'modal-salur-1' and its year groups ('dksm-yg-2020', 'dksm-yg-2021') are expanded matching the user screenshot
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(
    new Set(['modal-salur-1'])
  );
  const [expandedYearGroupIds, setExpandedYearGroupIds] = useState<Set<string>>(
    new Set(['dksm-yg-2020', 'dksm-yg-2021'])
  );

  // Search & Filter
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [selectedFilterYear, setSelectedFilterYear] = useState<string>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Mutasi Detail Modal State
  const [selectedMutasiInfo, setSelectedMutasiInfo] = useState<{
    title: string;
    itemTitle: string;
    year: string;
    mutasiCode: string;
    mutasiList: {
      code: string;
      bank: string;
      date: string;
      nominal: number;
      type: string;
      keterangan: string;
    }[];
  } | null>(null);

  // Form Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBookForAdd, setSelectedBookForAdd] = useState<string>(
    propsSalurItems && propsSalurItems.length > 0 ? propsSalurItems[0].id : 'book-2'
  );
  const [formTahun, setFormTahun] = useState('2021');
  const [formRoyalti, setFormRoyalti] = useState('6%');
  const [formJml, setFormJml] = useState('100');
  const [formPromo, setFormPromo] = useState('-');
  const [formHargaJual, setFormHargaJual] = useState('89000');
  const [formYangKitaBayar, setFormYangKitaBayar] = useState('5340');
  const [formMutasiCode, setFormMutasiCode] = useState('DB.BA.BCA388.01.21.00015');

  // Toggle Item level expand
  const toggleItemExpand = (id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle YearGroup level expand
  const toggleYearGroupExpand = (id: string) => {
    setExpandedYearGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered items from live-synced modal items
  const filteredModalItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return syncedModalItems.filter((item) => {
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.tahun.toLowerCase().includes(q) ||
        item.yearGroups.some(
          (yg) =>
            yg.tahun.includes(q) ||
            (yg.mutasiCode && yg.mutasiCode.toLowerCase().includes(q)) ||
            (yg.mutasiCodes && yg.mutasiCodes.some((c) => c.toLowerCase().includes(q)))
        );

      const matchYear =
        selectedFilterYear === 'all' || item.tahun.includes(selectedFilterYear);

      return matchSearch && matchYear;
    });
  }, [syncedModalItems, searchQuery, selectedFilterYear]);

  // Open Mutasi integration details
  const handleOpenMutasiModal = (
    item: ModalSalurItem,
    yearGroup?: ModalSalurYearGroup,
    specificCode?: string
  ) => {
    const code = specificCode || yearGroup?.mutasiCode || item.mutasiSummaryText;
    let list: {
      code: string;
      bank: string;
      date: string;
      nominal: number;
      type: string;
      keterangan: string;
    }[] = [];

    if (yearGroup && yearGroup.mutasiCode) {
      // Find matching item in mutasiItems or construct record
      const match = mutasiItems.find(
        (m) =>
          m.keteranganBank.includes(yearGroup.mutasiCode!) ||
          m.id.includes(yearGroup.mutasiCode!.slice(-2))
      );
      list.push({
        code: yearGroup.mutasiCode,
        bank: match ? match.bankAccount : 'BCA 388',
        date: match ? match.date : `15/Jan/${yearGroup.tahun.slice(-2)}`,
        nominal: yearGroup.yangKitaBayar,
        type: 'DB',
        keterangan:
          match?.keteranganBank ||
          `TRSF E-BANKING ${yearGroup.mutasiCode} Pembayaran Royalti ${item.title} ${yearGroup.tahun}`,
      });
    } else {
      // Parent summary item (e.g. "2 Mutasi" or "3 Mutasi")
      item.yearGroups.forEach((yg) => {
        if (yg.mutasiCode) {
          const match = mutasiItems.find((m) =>
            m.keteranganBank.includes(yg.mutasiCode!)
          );
          list.push({
            code: yg.mutasiCode,
            bank: match ? match.bankAccount : 'BCA 388',
            date: match ? match.date : `15/Jan/${yg.tahun.slice(-2)}`,
            nominal: yg.yangKitaBayar,
            type: 'DB',
            keterangan:
              match?.keteranganBank ||
              `TRSF E-BANKING ${yg.mutasiCode} Pembayaran Royalti ${item.title} ${yg.tahun}`,
          });
        }
      });
    }

    setSelectedMutasiInfo({
      title: code,
      itemTitle: item.title,
      year: yearGroup ? yearGroup.tahun : item.tahun,
      mutasiCode: code,
      mutasiList: list,
    });
  };

  // Add new modal / royalty record
  const handleSaveNewModalRecord = () => {
    const matchedBook =
      propsSalurItems?.find((b) => b.id === selectedBookForAdd) ||
      propsSalurItems?.[0];

    const title = matchedBook ? matchedBook.title : 'Demi Kepentingan Semua Makhluk';
    const subtitle = matchedBook ? matchedBook.subtitle || 'Buku Berbayar' : 'Buku Berbayar, BSM - 2021';
    const coverKey = matchedBook ? matchedBook.coverKey : 'demi-kepentingan';
    const stok = matchedBook ? matchedBook.stock : 100;

    const hargaNum = parseInt(formHargaJual.replace(/\D/g, ''), 10) || 89000;
    const jmlNum = parseInt(formJml.replace(/\D/g, ''), 10) || 100;
    const bayarNum = parseInt(formYangKitaBayar.replace(/\D/g, ''), 10) || 5340;

    const newVariant: ModalSalurVariant = {
      id: `var-${Date.now()}`,
      tahun: formTahun,
      royalti: formRoyalti,
      jml: jmlNum,
      promo: formPromo,
      hargaJual: hargaNum,
      yangKitaBayar: bayarNum,
    };

    const newYearGroup: ModalSalurYearGroup = {
      id: `yg-${Date.now()}`,
      tahun: formTahun,
      royalti: formRoyalti,
      jml: jmlNum,
      yangKitaBayar: bayarNum,
      mutasiCode: formMutasiCode,
      mutasiBadgeColor: 'teal',
      variants: [newVariant],
    };

    const newRecord: ModalSalurItem = {
      id: `modal-salur-${Date.now()}`,
      productId: selectedBookForAdd,
      title,
      subtitle,
      stok,
      coverKey,
      tahun: formTahun,
      royalti: formRoyalti,
      jml: jmlNum,
      yangKitaBayar: bayarNum,
      mutasiSummaryText: '1 Mutasi',
      mutasiSummaryBadgeColor: 'teal',
      yearGroups: [newYearGroup],
    };

    const updated = [newRecord, ...modalItems];
    setModalItems(updated);
    try {
      localStorage.setItem(MODAL_SALUR_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    onShowToast(`Modal Item S-SALUR untuk "${title}" berhasil ditambahkan`);
    setIsAddModalOpen(false);
  };

  const formatRupiah = (num: number) => {
    return `Rp${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Bar: Carousel Stats Cards on Left & Toolbar on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        {/* Horizontal Stats Cards with Carousel Nav */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => onShowToast('Navigasi kartu sebelumnya')}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
            title="Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Card 1: BEP */}
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs px-4 py-2.5 flex items-center justify-between min-w-[170px] sm:w-56 shrink-0">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-normal">BEP</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5">200 buku</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <ShoppingCart className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>

          {/* Card 2: Belum BEP */}
          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs px-4 py-2.5 flex items-center justify-between min-w-[170px] sm:w-56 shrink-0">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-normal">Belum BEP</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5">20 buku</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Globe className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => onShowToast('Navigasi kartu berikutnya')}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
            title="Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Top Right Toolbar: EyeOff, Search, Sliders, + Add */}
        <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
          {/* Search input when open */}
          {isSearchOpen && (
            <div className="relative w-48 sm:w-64 animate-in fade-in slide-in-from-right-2 duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari item, tahun, mutasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Eye Toggle Icon */}
          <button
            type="button"
            onClick={() => {
              setIsEyeActive(!isEyeActive);
              onShowToast(isEyeActive ? 'Tampilan ringkas' : 'Tampilan lengkap');
            }}
            title={isEyeActive ? 'Sembunyikan kolom' : 'Tampilkan semua'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isEyeActive
                ? 'text-slate-400 hover:text-slate-600'
                : 'text-[#008d91] bg-teal-50'
            }`}
          >
            {isEyeActive ? (
              <EyeOff className="w-4 h-4 stroke-[1.8]" />
            ) : (
              <Eye className="w-4 h-4 stroke-[1.8]" />
            )}
          </button>

          {/* Search Icon */}
          {!isSearchOpen && (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[1.8]" />
            </button>
          )}

          {/* Filter Sliders Icon */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            title="Filter Tahun"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
          </button>

          {/* + Add Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Filter Modal / Popover */}
      {isFilterModalOpen && (
        <div className="flex items-center justify-end px-1 -mt-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 mr-1">Filter Tahun:</span>
            {['all', '2019', '2020', '2021'].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  setSelectedFilterYear(yr);
                  setIsFilterModalOpen(false);
                }}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  selectedFilterYear === yr
                    ? 'bg-[#008d91] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {yr === 'all' ? 'Semua Tahun' : yr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card matching image.png */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-100/90 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[1050px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-100 text-slate-600 text-[13px] sm:text-sm font-medium">
                {/* Expander column */}
                <th className="py-3 px-2 w-8 text-center font-normal"></th>
                <th className="py-3 px-3 text-left font-medium">Nama Acara</th>
                <th className="py-3 px-3 text-left font-medium">Tahun</th>
                <th className="py-3 px-3 text-left font-medium">Royalti</th>
                <th className="py-3 px-3 text-left font-medium">Jml</th>
                <th className="py-3 px-3 text-left font-medium">Promo</th>
                <th className="py-3 px-3 text-left font-medium">Harga Jual</th>
                <th className="py-3 px-3 text-left font-medium">Yang kita bayar</th>
                <th className="py-3 px-3 text-left font-medium">Mutasi</th>
                <th className="py-3 px-3 text-left font-medium">Jadwal Pembayaran Royalti</th>
                <th className="py-3 px-2 w-8 text-center font-normal"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredModalItems.map((item) => {
                const isParentExpanded = expandedItemIds.has(item.id);

                return (
                  <React.Fragment key={item.id}>
                    {/* LEVEL 0: Main Parent Item Row */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-[13px] text-slate-700">
                      {/* Expander Triangle */}
                      <td className="py-3.5 px-2 text-center align-top pt-4">
                        <button
                          type="button"
                          onClick={() => toggleItemExpand(item.id)}
                          className="w-5 h-5 flex items-center justify-center text-[#008d91] hover:text-[#05828e] transition-transform cursor-pointer"
                          title={isParentExpanded ? 'Tutup rincian' : 'Buka rincian'}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={`w-3.5 h-3.5 fill-current transition-transform duration-150 ${
                              isParentExpanded ? 'rotate-90' : ''
                            }`}
                          >
                            <polygon points="6,4 18,12 6,20" />
                          </svg>
                        </button>
                      </td>

                      {/* Nama Acara (Cover Thumbnail + Title + Subtitle + Stok) */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-14 rounded overflow-hidden shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center">
                            <BookCover coverKey={item.coverKey} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-800 text-[13px] leading-tight">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5">
                              {item.subtitle}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5">
                              Stok: {item.stok}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tahun */}
                      <td className="py-3.5 px-3 align-top font-normal text-slate-700">
                        {item.tahun}
                      </td>

                      {/* Royalti */}
                      <td className="py-3.5 px-3 align-top font-normal text-slate-700">
                        {item.royalti}
                      </td>

                      {/* Jml */}
                      <td className="py-3.5 px-3 align-top font-normal text-slate-700">
                        {item.jml.toLocaleString('id-ID')}
                      </td>

                      {/* Promo */}
                      <td className="py-3.5 px-3 align-top text-slate-700 font-normal">
                        {(() => {
                          const allPromos = Array.from(
                            new Set(item.yearGroups.flatMap((yg) => yg.variants.map((v) => v.promo || '-')))
                          ).filter(Boolean);
                          const realPromos = allPromos.filter((p) => p !== '-');
                          if (realPromos.length > 0) {
                            return (
                              <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
                                {realPromos.join(', ')}
                              </span>
                            );
                          }
                          return <span className="text-slate-400">-</span>;
                        })()}
                      </td>

                      {/* Harga Jual */}
                      <td className="py-3.5 px-3 align-top text-slate-700 font-normal">
                        {(() => {
                          const allPrices = Array.from(
                            new Set(item.yearGroups.flatMap((yg) => yg.variants.map((v) => v.hargaJual).filter(Boolean)))
                          ) as number[];
                          if (allPrices.length === 1) {
                            return formatRupiah(allPrices[0]);
                          }
                          if (allPrices.length > 1) {
                            return `${formatRupiah(Math.min(...allPrices))} - ${formatRupiah(Math.max(...allPrices))}`;
                          }
                          return <span className="text-slate-400">-</span>;
                        })()}
                      </td>

                      {/* Yang kita bayar */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {formatRupiah(item.yangKitaBayar)}
                          </span>
                          {item.yangKitaBayarSubtext && (
                            <span className="text-red-500 text-xs mt-0.5 font-normal">
                              {item.yangKitaBayarSubtext}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Mutasi Pill Badge with Cursor Hover Tooltip */}
                      <td className="py-3.5 px-3 align-top">
                        {(() => {
                          const allParentCodes = Array.from(
                            new Set(
                              item.yearGroups.flatMap((yg) =>
                                yg.mutasiCodes && yg.mutasiCodes.length > 0
                                  ? yg.mutasiCodes
                                  : yg.mutasiCode
                                  ? [yg.mutasiCode]
                                  : []
                              )
                            )
                          );
                          const allConns = item.yearGroups.flatMap((yg) => yg.connectedMutasiList || []);

                          return (
                            <MutasiBadgeWithTooltip
                              codes={allParentCodes}
                              badgeColor={item.mutasiSummaryBadgeColor}
                              badgeText={item.mutasiSummaryText}
                              itemTitle={item.title}
                              yangKitaBayar={item.yangKitaBayar}
                              subtext={item.yangKitaBayarSubtext}
                              connectedList={allConns}
                              onClick={() => handleOpenMutasiModal(item)}
                            />
                          );
                        })()}
                      </td>

                      {/* Jadwal Pembayaran Royalti */}
                      <td className="py-3.5 px-3 align-top text-slate-400 text-xs">
                        {item.jadwalPembayaranRoyalti || '-'}
                      </td>

                      {/* Action Menu (3-dots) */}
                      <td className="py-3.5 px-2 text-center align-top relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === item.id ? null : item.id)
                          }
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div className="absolute right-2 top-10 z-30 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs text-left animate-in fade-in duration-100">
                            {/* Tambahkan Kode Mutasi (User Requested) */}
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenTambahkanMutasi(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-800 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-semibold transition-colors cursor-pointer border-b border-slate-100"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Tambahkan Kode Mutasi</span>
                            </button>

                            {onNavigateToItemSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToItemSalur(item.productId);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-[#008d91]" />
                                <span>Buka di Item S-SALUR</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                handleOpenMutasiModal(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Lihat Detail Mutasi</span>
                            </button>

                            {onNavigateToReportBepSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToReportBepSalur();
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                              >
                                <TrendingUp className="w-3.5 h-3.5 text-[#008d91]" />
                                <span>Lihat Report BEP Item</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => {
                                toggleItemExpand(item.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>{isParentExpanded ? 'Tutup Rincian' : 'Buka Rincian'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* LEVEL 1 & 2: Sub-rows when parent is expanded */}
                    {isParentExpanded &&
                      item.yearGroups.map((yg) => {
                        const isYearExpanded = expandedYearGroupIds.has(yg.id);

                        return (
                          <React.Fragment key={yg.id}>
                            {/* LEVEL 1: Year Group Row */}
                            <tr className="border-b border-slate-100/80 bg-slate-50/20 hover:bg-slate-50/60 transition-colors text-[13px] text-slate-700">
                              {/* Expander Triangle for Year Group */}
                              <td className="py-3 px-2 text-center align-top pt-3.5 pl-4">
                                <button
                                  type="button"
                                  onClick={() => toggleYearGroupExpand(yg.id)}
                                  className="w-5 h-5 flex items-center justify-center text-[#008d91] hover:text-[#05828e] transition-transform cursor-pointer"
                                  title={isYearExpanded ? 'Tutup rincian tahun' : 'Buka rincian tahun'}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className={`w-3.5 h-3.5 fill-current transition-transform duration-150 ${
                                      isYearExpanded ? 'rotate-90' : ''
                                    }`}
                                  >
                                    <polygon points="6,4 18,12 6,20" />
                                  </svg>
                                </button>
                              </td>

                              {/* Indented Item Title & Metadata */}
                              <td className="py-3 px-3 align-top pl-8">
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-12 rounded overflow-hidden shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center">
                                    <BookCover coverKey={item.coverKey} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-slate-800 text-[13px] leading-tight">
                                      {item.title}
                                    </span>
                                    <span className="text-[11px] text-slate-500 mt-0.5">
                                      {item.subtitle}
                                    </span>
                                    <span className="text-[11px] text-slate-400 mt-0.5">
                                      Stok: {item.stok}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Tahun */}
                              <td className="py-3 px-3 align-top font-normal text-slate-700">
                                {yg.tahun}
                              </td>

                              {/* Royalti */}
                              <td className="py-3 px-3 align-top font-normal text-slate-700">
                                {yg.royalti}
                              </td>

                              {/* Jml */}
                              <td className="py-3 px-3 align-top font-normal text-slate-700">
                                {yg.jml.toLocaleString('id-ID')}
                              </td>

                              {/* Promo */}
                              <td className="py-3 px-3 align-top text-slate-700 font-normal">
                                {(() => {
                                  const uniquePromos = Array.from(new Set(yg.variants.map((v) => v.promo || '-'))).filter(Boolean);
                                  if (uniquePromos.length === 1) {
                                    return uniquePromos[0] === '-' ? (
                                      <span className="text-slate-400">-</span>
                                    ) : (
                                      <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">{uniquePromos[0]}</span>
                                    );
                                  }
                                  return (
                                    <span className="text-slate-600 text-xs">
                                      {uniquePromos.join(', ')}
                                    </span>
                                  );
                                })()}
                              </td>

                              {/* Harga Jual */}
                              <td className="py-3 px-3 align-top text-slate-700 font-normal">
                                {(() => {
                                  const uniquePrices = Array.from(new Set(yg.variants.map((v) => v.hargaJual).filter(Boolean))) as number[];
                                  if (uniquePrices.length === 1) {
                                    return formatRupiah(uniquePrices[0]);
                                  }
                                  if (uniquePrices.length > 1) {
                                    return `${formatRupiah(Math.min(...uniquePrices))} - ${formatRupiah(Math.max(...uniquePrices))}`;
                                  }
                                  return <span className="text-slate-400">-</span>;
                                })()}
                              </td>

                              {/* Yang kita bayar */}
                              <td className="py-3 px-3 align-top">
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-800">
                                    {formatRupiah(yg.yangKitaBayar)}
                                  </span>
                                  {yg.yangKitaBayarSubtext && (
                                    <span className="text-red-500 text-xs mt-0.5 font-normal">
                                      {yg.yangKitaBayarSubtext}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Mutasi Badge with Cursor Hover Tooltip */}
                              <td className="py-3 px-3 align-top">
                                {(() => {
                                  const codes =
                                    yg.mutasiCodes && yg.mutasiCodes.length > 0
                                      ? yg.mutasiCodes
                                      : yg.mutasiCode
                                      ? [yg.mutasiCode]
                                      : [];
                                  const badgeText =
                                    codes.length > 1
                                      ? `${codes.length} Mutasi`
                                      : codes.length === 1
                                      ? codes[0]
                                      : 'Belum Ada Mutasi';
                                  return (
                                    <MutasiBadgeWithTooltip
                                      codes={codes}
                                      badgeColor={yg.mutasiBadgeColor || 'teal'}
                                      badgeText={badgeText}
                                      itemTitle={item.title}
                                      year={yg.tahun}
                                      yangKitaBayar={yg.yangKitaBayar}
                                      subtext={yg.yangKitaBayarSubtext}
                                      connectedList={yg.connectedMutasiList || []}
                                      onClick={() => handleOpenMutasiModal(item, yg, yg.mutasiCode)}
                                    />
                                  );
                                })()}
                              </td>

                              {/* Jadwal Pembayaran */}
                              <td className="py-3 px-3 align-top text-slate-400 text-xs">
                                {yg.jadwalPembayaranRoyalti || '-'}
                              </td>

                              {/* Action Menu (3-dots) for Year Group */}
                              <td className="py-3 px-2 text-center align-top relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(activeMenuId === yg.id ? null : yg.id)}
                                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                                {activeMenuId === yg.id && (
                                  <div className="absolute right-2 top-8 z-30 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-xs text-left animate-in fade-in duration-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleOpenTambahkanMutasi(item, yg.tahun);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3 py-2 text-slate-800 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                                    >
                                      <CreditCard className="w-3.5 h-3.5 text-[#008d91]" />
                                      <span>Tambahkan Kode Mutasi ({yg.tahun})</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleOpenMutasiModal(item, yg, yg.mutasiCode);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                                    >
                                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#008d91]" />
                                      <span>Lihat Mutasi ({yg.tahun})</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>

                            {/* LEVEL 2: Variant / Transaction Breakdown rows under Year Group */}
                            {isYearExpanded &&
                              yg.variants.map((v) => (
                                <tr
                                  key={v.id}
                                  className="border-b border-slate-100/60 bg-slate-50/40 hover:bg-slate-100/50 transition-colors text-[13px] text-slate-600"
                                >
                                  {/* Spacer */}
                                  <td className="py-2.5 px-2"></td>

                                  {/* Indented Item Title & Metadata further */}
                                  <td className="py-2.5 px-3 align-top pl-14">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-11 rounded overflow-hidden shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center">
                                        <BookCover coverKey={item.coverKey} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-slate-700 text-[13px] leading-tight">
                                          {item.title}
                                        </span>
                                        <span className="text-[11px] text-slate-400 mt-0.5">
                                          {item.subtitle}
                                        </span>
                                        <span className="text-[11px] text-slate-400 mt-0.5">
                                          Stok: {item.stok}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Tahun */}
                                  <td className="py-2.5 px-3 align-top text-slate-600">
                                    {v.tahun}
                                  </td>

                                  {/* Royalti */}
                                  <td className="py-2.5 px-3 align-top text-slate-600">
                                    {v.royalti}
                                  </td>

                                  {/* Jml */}
                                  <td className="py-2.5 px-3 align-top text-slate-600">
                                    {v.jml.toLocaleString('id-ID')}
                                  </td>

                                  {/* Promo */}
                                  <td className="py-2.5 px-3 align-top text-slate-600">
                                    {v.promo || '-'}
                                  </td>

                                  {/* Harga Jual */}
                                  <td className="py-2.5 px-3 align-top text-slate-700">
                                    {v.hargaJual ? formatRupiah(v.hargaJual) : '-'}
                                  </td>

                                  {/* Yang kita bayar */}
                                  <td className="py-2.5 px-3 align-top font-medium text-slate-800">
                                    {formatRupiah(v.yangKitaBayar)}
                                  </td>

                                  {/* Mutasi */}
                                  <td className="py-2.5 px-3 align-top text-slate-400">
                                    -
                                  </td>

                                  {/* Jadwal Pembayaran */}
                                  <td className="py-2.5 px-3 align-top text-slate-400 text-xs">
                                    {v.jadwalPembayaranRoyalti || '-'}
                                  </td>

                                  <td></td>
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL MUTASI TERKAIT */}
      {selectedMutasiInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#008d91]/10 text-[#008d91] flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Detail Mutasi Terintegrasi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedMutasiInfo.itemTitle} ({selectedMutasiInfo.year})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMutasiInfo(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 text-xs">
              <div className="bg-teal-50/60 border border-teal-100/80 rounded-xl p-3 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#008d91] shrink-0 mt-0.5" />
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Transaksi ini terintegrasi langsung dengan mutasi rekening bank dan katalog Item S-SALUR.
                </p>
              </div>

              {/* Transactions List */}
              <div className="flex flex-col gap-2.5">
                <span className="font-semibold text-slate-700 text-xs">
                  Daftar Transaksi Mutasi:
                </span>
                {selectedMutasiInfo.mutasiList.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#008d91] text-xs">
                        {m.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                        {m.type} (Debit)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                      <div>
                        <span className="text-slate-400">Rekening: </span>
                        <span className="font-medium text-slate-700">{m.bank}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Tanggal: </span>
                        <span className="font-medium text-slate-700">{m.date}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <span className="text-slate-400">Keterangan: </span>
                      <span className="text-slate-700">{m.keterangan}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Nominal Royalti:</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {formatRupiah(m.nominal)}
                      </span>
                    </div>

                    {onNavigateToMutasi && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMutasiInfo(null);
                          onNavigateToMutasi(m.bank, m.code);
                        }}
                        className="mt-1 w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-[#008d91] hover:text-white text-slate-700 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Buka di Menu Mutasi ({m.bank})</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              {onNavigateToItemSalur && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMutasiInfo(null);
                    onNavigateToItemSalur();
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-[#008d91] font-medium transition-colors cursor-pointer"
                >
                  Buka Katalog Item S-SALUR
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedMutasiInfo(null)}
                className="ml-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MODAL ITEM S-SALUR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#008d91]/10 text-[#008d91] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Tambah Modal Item S-SALUR
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Input royalti, modal, dan integrasikan dengan Mutasi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Item S-SALUR:
                </label>
                <select
                  value={selectedBookForAdd}
                  onChange={(e) => setSelectedBookForAdd(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                >
                  {(propsSalurItems || []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.code || b.subtitle})
                    </option>
                  ))}
                  {(!propsSalurItems || propsSalurItems.length === 0) && (
                    <>
                      <option value="book-2">Demi Kepentingan Semua Makhluk (BSM - 2021)</option>
                      <option value="book-1">Jalan Menuju Kemahatahuan (BJM - 2021)</option>
                      <option value="book-3">Menjadi Buddha di Tempat Kerja (BMB - 2021)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun:</label>
                  <input
                    type="text"
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    placeholder="Contoh: 2021"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Royalti (%):</label>
                  <input
                    type="text"
                    value={formRoyalti}
                    onChange={(e) => setFormRoyalti(e.target.value)}
                    placeholder="6%"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah (buku):</label>
                  <input
                    type="number"
                    value={formJml}
                    onChange={(e) => setFormJml(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Promo:</label>
                  <input
                    type="text"
                    value={formPromo}
                    onChange={(e) => setFormPromo(e.target.value)}
                    placeholder="-, 10%, dll"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    value={formHargaJual}
                    onChange={(e) => setFormHargaJual(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Yang Kita Bayar (Rp):</label>
                  <input
                    type="number"
                    value={formYangKitaBayar}
                    onChange={(e) => setFormYangKitaBayar(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode Mutasi Terkait (BCA 388 / Bank Lain):
                </label>
                <input
                  type="text"
                  value={formMutasiCode}
                  onChange={(e) => setFormMutasiCode(e.target.value)}
                  placeholder="Contoh: DB.BA.BCA388.01.21.00015"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#008d91]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewModalRecord}
                className="px-5 py-2 bg-[#008d91] hover:bg-[#05828e] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAHKAN KODE MUTASI Pop Up (User Requested) */}
      <ModalTambahkanMutasiModalSalur
        isOpen={isTambahkanMutasiModalOpen}
        onClose={() => {
          setIsTambahkanMutasiModalOpen(false);
          setSelectedItemForMutasi(null);
          setSelectedYearForMutasi(undefined);
        }}
        item={selectedItemForMutasi}
        initialYear={selectedYearForMutasi}
        mutasiItems={mutasiItems}
        onSave={handleSaveMutasiConnection}
        onShowToast={onShowToast}
      />
    </div>
  );
};
