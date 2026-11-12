import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  EyeOff,
  Eye,
  Globe,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Package,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  UserPlus,
  Users,
  CreditCard,
  Boxes,
  Book,
  BookOpen,
  Shirt,
  Notebook,
  Tablet,
  Gift,
  Sparkles,
  Tag,
  Upload,
  Check,
  ShoppingCart,
  Kanban,
} from 'lucide-react';
import { INITIAL_BOOKS, CROSS_SELLING_BOOKS, SalurProduct } from '../salurData';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { SubJenisItemSalurItem } from '../types';
import { SUB_JENIS_ITEM_SALUR_STORAGE_KEY, INITIAL_SUB_JENIS_ITEM_SALUR } from '../salurMasterData';
import { BookCover } from './BookCover';
import { ModalTambahAAjakItemSalur } from './ModalTambahAAjakItemSalur';
import { ModalLihatListAAjakItemSalur } from './ModalLihatListAAjakItemSalur';
import { ModalKatalogItemSalur } from './ModalKatalogItemSalur';
import {
  getStoredStokSalurItems,
  StokSalurItem,
  getRealtimeStockForSalurProduct,
} from '../stokSalurData';

interface ItemSalurViewProps {
  items?: SalurProduct[];
  identitasList?: IdentitasItem[];
  subJenisList?: SubJenisItemSalurItem[];
  onUpdateSubJenisList?: (items: SubJenisItemSalurItem[]) => void;
  onAddNewItem?: () => void;
  onDeleteItem?: (id: string) => void;
  onShowToast?: (msg: string) => void;
  onSelectProductForOrder?: (productId: string) => void;
  onNavigateToModalItemSalur?: (productId?: string) => void;
  onNavigateToStokItemSalur?: (productId?: string) => void;
  onNavigateToOngoingCreateItemSalur?: () => void;
  onKirimPM?: (targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
}

export const ItemSalurView: React.FC<ItemSalurViewProps> = ({
  items: propsItems,
  identitasList = INITIAL_IDENTITAS,
  subJenisList: propsSubJenisList,
  onUpdateSubJenisList,
  onAddNewItem,
  onDeleteItem,
  onShowToast = (_msg: string) => {},
  onNavigateToModalItemSalur,
  onNavigateToStokItemSalur,
  onNavigateToOngoingCreateItemSalur,
  onKirimPM,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
}) => {
  // Master items list
  const [localItems, setLocalItems] = useState<SalurProduct[]>([
    ...INITIAL_BOOKS,
    ...CROSS_SELLING_BOOKS,
  ]);

  const items = propsItems && propsItems.length > 0 ? propsItems : localItems;

  // Master sub-jenis list
  const [localSubJenisItems, setLocalSubJenisItems] = useState<SubJenisItemSalurItem[]>(() => {
    try {
      const saved = localStorage.getItem(SUB_JENIS_ITEM_SALUR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load sub-jenis item salur from localStorage', e);
    }
    return INITIAL_SUB_JENIS_ITEM_SALUR;
  });

  const subJenisItems = propsSubJenisList && propsSubJenisList.length > 0 ? propsSubJenisList : localSubJenisItems;

  // Realtime Stok Item S-SALUR data
  const [stokSalurItems, setStokSalurItems] = useState<StokSalurItem[]>(() => getStoredStokSalurItems());

  React.useEffect(() => {
    const handleSyncStok = () => {
      setStokSalurItems(getStoredStokSalurItems());
    };
    handleSyncStok();
    window.addEventListener('storage', handleSyncStok);
    window.addEventListener('stok_salur_updated', handleSyncStok);
    window.addEventListener('focus', handleSyncStok);
    return () => {
      window.removeEventListener('storage', handleSyncStok);
      window.removeEventListener('stok_salur_updated', handleSyncStok);
      window.removeEventListener('focus', handleSyncStok);
    };
  }, []);

  const getRealtimeStock = (item: SalurProduct): number => {
    return getRealtimeStockForSalurProduct(item, stokSalurItems);
  };

  // Filter Sub-Jenis from stat cards
  const [selectedSubJenisFilter, setSelectedSubJenisFilter] = useState<string | null>(null);

  // Carousel ref for horizontal scrolling
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Modal Ubah Logo Sub-Jenis state
  const [isChangeLogoModalOpen, setIsChangeLogoModalOpen] = useState(false);
  const [editingLogoSubJenis, setEditingLogoSubJenis] = useState<SubJenisItemSalurItem | null>(null);
  const [tempIconType, setTempIconType] = useState('book');
  const [tempLogoUrl, setTempLogoUrl] = useState('');
  const [tempIconBg, setTempIconBg] = useState('#008d91');

  // Track which rows are expanded (unhidden)
  // By default, book-2 ("Demi Kepentingan Semua Makhluk") is expanded, matching the screenshot
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(
    new Set(['book-2'])
  );

  // Modal Tambah A-AJAK Item S-SALUR state
  const [selectedItemForAAjak, setSelectedItemForAAjak] = useState<SalurProduct | null>(null);
  const [isModalAAjakOpen, setIsModalAAjakOpen] = useState(false);

  // Modal Lihat List A-AJAK Item S-SALUR state
  const [selectedItemForListAAjak, setSelectedItemForListAAjak] = useState<SalurProduct | null>(null);
  const [isModalListAAjakOpen, setIsModalListAAjakOpen] = useState(false);

  // Selection & Buatkan Katalog State
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState<SalurProduct[]>([]);

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((it) => it.id));
    }
  };

  const handleOpenCatalogForSelected = () => {
    const selectedList = items.filter((it) => selectedItemIds.includes(it.id));
    if (selectedList.length === 0) {
      onShowToast('Pilih minimal satu Item S-SALUR untuk membuat katalog');
      return;
    }
    setCatalogItems(selectedList);
    setIsCatalogModalOpen(true);
  };

  const handleOpenCatalogForSingleItem = (item: SalurProduct) => {
    setCatalogItems([item]);
    setIsCatalogModalOpen(true);
  };

  // Search & Filter state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
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

  // Helper: check if a product belongs to a sub-jenis
  const itemBelongsToSubJenis = (item: SalurProduct, subJenis: SubJenisItemSalurItem) => {
    const sjName = (subJenis.namaSubJenis || '').toLowerCase().trim();
    if (!sjName) return false;

    if (item.subJenis && item.subJenis.toLowerCase().trim() === sjName) return true;
    if (item.subJenisItem && item.subJenisItem.toLowerCase().trim() === sjName) return true;
    if (item.subtitle && item.subtitle.toLowerCase().includes(sjName)) return true;
    if (subJenis.kode && item.code && item.code.toLowerCase().includes(subJenis.kode.toLowerCase())) return true;
    if (item.category && item.category.toLowerCase().trim() === sjName) return true;
    if (item.categories && item.categories.some((c) => c.toLowerCase().trim() === sjName)) return true;

    // Fallback for default books
    if (sjName === 'buku berbayar') {
      const isNotBerbayar = item.subtitle?.toLowerCase().includes('tidak berbayar');
      const isNonYppln = item.subtitle?.toLowerCase().includes('non-yppln');
      const isGoogle = item.subtitle?.toLowerCase().includes('google');
      const isMerch = item.category?.toLowerCase() === 'merchandise';
      if (!isNotBerbayar && !isNonYppln && !isGoogle && !isMerch) {
        return true;
      }
    }
    return false;
  };

  // Real-time stock counts for all sub-jenis
  const subJenisWithCounts = useMemo(() => {
    return subJenisItems.map((sj) => {
      const matchingItemsWithStock = items.filter((item) => {
        const belongs = itemBelongsToSubJenis(item, sj);
        const currentStock = getRealtimeStock(item);
        const hasStock = currentStock > 0;
        return belongs && hasStock;
      });
      return {
        ...sj,
        itemCountWithStock: matchingItemsWithStock.length,
      };
    });
  }, [subJenisItems, items, stokSalurItems]);

  const handleOpenChangeLogoModal = (sj: SubJenisItemSalurItem) => {
    setEditingLogoSubJenis(sj);
    setTempIconType(sj.iconType || 'book');
    setTempLogoUrl(sj.logoUrl || '');
    setTempIconBg(sj.iconBg || '#008d91');
    setIsChangeLogoModalOpen(true);
  };

  const handleSaveSubJenisLogo = (
    subJenisId: string,
    updates: { iconType?: string; logoUrl?: string; iconBg?: string }
  ) => {
    const updated = subJenisItems.map((s) => (s.id === subJenisId ? { ...s, ...updates } : s));
    setLocalSubJenisItems(updated);
    try {
      localStorage.setItem(SUB_JENIS_ITEM_SALUR_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save sub-jenis item salur to localStorage', e);
    }
    if (onUpdateSubJenisList) {
      onUpdateSubJenisList(updated);
    }
  };

  const renderIconByName = (iconName: string, className = 'w-4 h-4 stroke-[1.8]') => {
    switch (iconName) {
      case 'book':
        return <Book className={className} />;
      case 'globe':
        return <Globe className={className} />;
      case 'book-open':
        return <BookOpen className={className} />;
      case 'shirt':
        return <Shirt className={className} />;
      case 'notebook':
        return <Notebook className={className} />;
      case 'boxes':
        return <Boxes className={className} />;
      case 'package':
        return <Package className={className} />;
      case 'tablet':
        return <Tablet className={className} />;
      case 'gift':
        return <Gift className={className} />;
      case 'tag':
        return <Tag className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'shopping-cart':
        return <ShoppingCart className={className} />;
      default:
        return <Globe className={className} />;
    }
  };

  const renderSubJenisIcon = (sj: SubJenisItemSalurItem) => {
    if (sj.logoUrl) {
      return (
        <img
          src={sj.logoUrl}
          alt={sj.namaSubJenis}
          className="w-full h-full object-cover"
        />
      );
    }

    const iconType = (sj.iconType || '').toLowerCase();
    const name = sj.namaSubJenis.toLowerCase();

    if (iconType) {
      return renderIconByName(iconType);
    }

    if (name.includes('tidak berbayar')) {
      return <Globe className="w-4 h-4 stroke-[1.8]" />;
    }
    if (name.includes('berbayar')) {
      return <Book className="w-4 h-4 stroke-[1.8]" />;
    }
    if (name.includes('non-yppln')) {
      return <BookOpen className="w-4 h-4 stroke-[1.8]" />;
    }
    if (name.includes('google')) {
      return <Tablet className="w-4 h-4 stroke-[1.8]" />;
    }
    if (name.includes('t-shirt') || name.includes('kaos')) {
      return <Shirt className="w-4 h-4 stroke-[1.8]" />;
    }
    if (name.includes('note')) {
      return <Notebook className="w-4 h-4 stroke-[1.8]" />;
    }
    if (name.includes('lain')) {
      return <Boxes className="w-4 h-4 stroke-[1.8]" />;
    }

    if (sj.iconLetter) {
      return <span className="text-xs font-bold leading-none">{sj.iconLetter}</span>;
    }

    return <Globe className="w-4 h-4 stroke-[1.8]" />;
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.publisher && item.publisher.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.categories && item.categories.some((c) => c.toLowerCase().includes(q)));

      const matchCat =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        (item.categories && item.categories.includes(selectedCategory));

      const matchSubJenis =
        !selectedSubJenisFilter ||
        itemBelongsToSubJenis(item, {
          id: '',
          namaSubJenis: selectedSubJenisFilter,
          namaJenis: '',
          kode: '',
          iconLetter: '',
          iconBg: '',
        });

      return matchSearch && matchCat && matchSubJenis;
    });
  }, [items, searchQuery, selectedCategory, selectedSubJenisFilter]);

  const handleDeleteItem = (id: string, title: string) => {
    if (onDeleteItem) {
      onDeleteItem(id);
    } else {
      setLocalItems((prev) => prev.filter((i) => i.id !== id));
      onShowToast(`Item "${title}" dihapus`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Right Toolbar: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3 px-1">
        {/* Search input when open */}
        {isSearchOpen && (
          <div className="relative w-48 sm:w-64 animate-in fade-in slide-in-from-right-2 duration-150">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Cari item, penulis..."
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
            onShowToast(isEyeActive ? 'Tampilan disederhanakan' : 'Tampilan lengkap');
          }}
          title={isEyeActive ? 'Sembunyikan kolom tambahan' : 'Tampilkan semua'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isEyeActive
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-[#008d91] bg-teal-50'
          }`}
        >
          {isEyeActive ? <EyeOff className="w-4 h-4 stroke-[1.8]" /> : <Eye className="w-4 h-4 stroke-[1.8]" />}
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
          title="Filter Kategori"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* Ongoing Create Item S-SALUR Button */}
        {onNavigateToOngoingCreateItemSalur && (
          <button
            type="button"
            onClick={onNavigateToOngoingCreateItemSalur}
            title="Buka Papan Kerja Ongoing Create Item S-SALUR"
            className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-[#008d91] border border-teal-200 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <Kanban className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden sm:inline">Ongoing Create</span>
          </button>
        )}

        {/* + Add Button */}
        <button
          type="button"
          onClick={() => {
            if (onAddNewItem) {
              onAddNewItem();
            }
          }}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Filter Modal / Popover */}
      {isFilterModalOpen && (
        <div className="flex items-center justify-end px-1 -mt-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 mr-1">Kategori:</span>
            {['all', 'TJMP', 'Welas Asih', 'Umum', 'Leadership'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsFilterModalOpen(false);
                }}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#008d91] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Horizontal Stats Cards with Carousel Nav */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => {
            if (carouselContainerRef.current) {
              carouselContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
            }
            onShowToast('Navigasi kartu sebelumnya');
          }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Carousel Scroll Container displaying ALL sub-jenis */}
        <div
          ref={carouselContainerRef}
          className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar flex-1 scroll-smooth"
        >
          {subJenisWithCounts.map((sj) => {
            const isSelected = selectedSubJenisFilter === sj.namaSubJenis;
            return (
              <div
                key={sj.id}
                onClick={() => {
                  if (selectedSubJenisFilter === sj.namaSubJenis) {
                    setSelectedSubJenisFilter(null);
                    onShowToast('Menampilkan semua sub-jenis');
                  } else {
                    setSelectedSubJenisFilter(sj.namaSubJenis);
                    onShowToast(`Filter: ${sj.namaSubJenis}`);
                  }
                }}
                className={`bg-white rounded-2xl border ${
                  isSelected
                    ? 'border-[#008d91] ring-2 ring-[#008d91]/25'
                    : 'border-slate-100/90 hover:border-slate-200'
                } shadow-2xs px-4 py-3 flex items-center justify-between min-w-[190px] sm:w-60 shrink-0 cursor-pointer transition-all select-none`}
                title={`Klik untuk filter: ${sj.namaSubJenis}`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span
                    className="text-[11px] text-slate-400 font-normal truncate max-w-[135px]"
                    title={sj.namaSubJenis}
                  >
                    {sj.namaSubJenis}
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5">
                    {sj.itemCountWithStock} Item
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChangeLogoModal(sj);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs hover:scale-105 active:scale-95 transition-transform cursor-pointer overflow-hidden"
                  style={{ backgroundColor: sj.iconBg || '#008d91' }}
                  title={`Ubah logo: ${sj.namaSubJenis}`}
                >
                  {renderSubJenisIcon(sj)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => {
            if (carouselContainerRef.current) {
              carouselContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
            }
            onShowToast('Navigasi kartu berikutnya');
          }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
          title="Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Selection Action Banner (Buatkan Katalog) */}
      {selectedItemIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-teal-50 via-white to-teal-50/70 border border-teal-200 rounded-2xl p-3 sm:p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#008d91] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {selectedItemIds.length}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {selectedItemIds.length} Item S-SALUR Dipilih
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Pilih item untuk membuat brosur katalog publikasi</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#008d91] hover:underline font-semibold cursor-pointer"
                >
                  {selectedItemIds.length === filteredItems.length ? 'Batal Pilih Semua' : 'Pilih Semua Item'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedItemIds([])}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleOpenCatalogForSelected}
              className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-sm"
            >
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
              <span>Buatkan Katalog ({selectedItemIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-100/90 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[980px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-100 text-slate-600 text-[13px] sm:text-sm font-medium">
                {/* Checkbox column */}
                <th className="py-3 px-2 w-10 text-center font-normal">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedItemIds.length === filteredItems.length}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectedItemIds.length > 0 && selectedItemIds.length < filteredItems.length;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#008d91] rounded border-slate-300 focus:ring-[#008d91] cursor-pointer"
                    title={selectedItemIds.length === filteredItems.length ? 'Batal pilih semua' : 'Pilih semua'}
                  />
                </th>
                {/* Expander column */}
                <th className="py-3 px-2 w-8 text-center font-normal"></th>
                <th className="py-3 px-3 text-left font-medium">Nama Item</th>
                <th className="py-3 px-3 text-left font-medium">Cetak</th>
                <th className="py-3 px-3 text-left font-medium">Stok</th>
                <th className="py-3 px-3 text-left font-medium">Penulis</th>
                <th className="py-3 px-3 text-left font-medium">Penerbit</th>
                <th className="py-3 px-3 text-center font-medium">Kategori</th>
                <th className="py-3 px-3 text-center font-medium leading-tight">
                  <div>Jumlah</div>
                  <div>Halaman</div>
                </th>
                <th className="py-3 px-3 text-center font-medium">Link</th>
                <th className="py-3 px-3 text-left font-medium">Cover</th>
                <th className="py-3 px-3 text-center font-medium">Pemasukan Divisi</th>
                {/* 3-dots actions column */}
                <th className="py-3 px-2 w-8 text-center font-normal"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredItems.map((item) => {
                const isExpanded = expandedItemIds.has(item.id);
                const categoriesList =
                  item.categories && item.categories.length > 0
                    ? item.categories
                    : [item.category || 'TJMP'];

                return (
                  <React.Fragment key={item.id}>
                    {/* Main Row */}
                    <tr
                      className={`border-b ${
                        isExpanded ? 'border-transparent' : 'border-slate-100'
                      } ${
                        selectedItemIds.includes(item.id) ? 'bg-teal-50/40' : 'hover:bg-slate-50/50'
                      } transition-colors`}
                    >
                      {/* Checkbox column */}
                      <td className="py-4 px-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => handleToggleSelectItem(item.id)}
                          className="w-4 h-4 text-[#008d91] rounded border-slate-300 focus:ring-[#008d91] cursor-pointer"
                          title={selectedItemIds.includes(item.id) ? 'Batal pilih item ini' : 'Pilih item ini'}
                        />
                      </td>

                      {/* Triangle Expander */}
                      <td className="py-4 px-2 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="p-1 text-[#008d91] hover:text-[#05828e] transition-transform cursor-pointer"
                          title={isExpanded ? 'Sembunyikan info' : 'Tampilkan info lebih lanjut'}
                        >
                          <svg
                            className={`w-3.5 h-3.5 fill-current transition-transform duration-150 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </td>

                      {/* Nama Item (Cover, Title, Subtitle, Stok) */}
                      <td className="py-4 px-3 align-middle">
                        <div className="flex items-center gap-3">
                          {/* Book Thumbnail */}
                          <div className="w-13 h-17 sm:w-14 sm:h-18 rounded-lg overflow-hidden shrink-0 shadow-2xs">
                            <BookCover
                              coverKey={item.coverKey}
                              imageUrl={item.imageUrl}
                              title={item.title}
                              size="md"
                            />
                          </div>

                          {/* Title & Subtitles */}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] sm:text-[14px] font-bold text-slate-800 leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5">
                              {item.subtitle || `Buku Berbayar, ${item.code || 'BJM - 2021'}`}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-400">
                                Stok: {getRealtimeStock(item)}
                              </span>
                              {item.coaNoAkun && (
                                <span
                                  title={`Akun COA Pendapatan: ${item.coaNamaAkun || 'Pendapatan Salur'}`}
                                  className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
                                >
                                  COA {item.coaNoAkun}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cetak */}
                      <td className="py-4 px-3 text-[13px] text-slate-700 align-middle">
                        {item.printedCount || 700}
                      </td>

                      {/* Stok */}
                      <td className="py-4 px-3 text-[13px] text-slate-700 align-middle">
                        {getRealtimeStock(item)}
                      </td>

                      {/* Penulis */}
                      <td className="py-4 px-3 text-[12px] sm:text-[13px] text-slate-700 align-middle max-w-[200px] leading-relaxed">
                        {item.author || item.detailedInfo?.author || 'Panchen Losang Chokyi Gyaltshen & Panchen Losang Yeshe'}
                      </td>

                      {/* Penerbit */}
                      <td className="py-4 px-3 text-[12px] sm:text-[13px] text-slate-700 align-middle whitespace-nowrap">
                        {item.publisher || item.detailedInfo?.publisher || 'Penerbit Kadam Choeling'}
                      </td>

                      {/* Kategori (Pill Badges) */}
                      <td className="py-4 px-3 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {categoriesList.map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-3.5 py-1 rounded-full bg-[#008d91] text-white text-[11px] font-medium whitespace-nowrap shadow-2xs"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Jumlah Halaman */}
                      <td className="py-4 px-3 text-[12px] sm:text-[13px] text-slate-700 text-center align-middle whitespace-nowrap">
                        {item.pageCount || 'X+200 hlm'}
                      </td>

                      {/* Link (6 Pills in 2 columns) */}
                      <td className="py-4 px-3 text-center align-middle">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 w-[210px] mx-auto">
                          <button
                            type="button"
                            onClick={() => onShowToast(`Membuka Depan - Raw untuk ${item.title}`)}
                            className="px-2.5 py-0.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white text-[11px] font-normal text-center whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                          >
                            Depan - Raw
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCatalogForSingleItem(item)}
                            title="Buatkan & Unduh Katalog"
                            className="px-2.5 py-0.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white text-[11px] font-semibold text-center whitespace-nowrap transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                          >
                            <BookOpen className="w-3 h-3 stroke-[2.2]" />
                            <span>Katalog</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onShowToast(`Membuka Tengha - Raw untuk ${item.title}`)}
                            className="px-2.5 py-0.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white text-[11px] font-normal text-center whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                          >
                            Tengha - Raw
                          </button>
                          <button
                            type="button"
                            onClick={() => onShowToast(`Membuka PDF untuk ${item.title}`)}
                            className="px-2.5 py-0.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white text-[11px] font-normal text-center whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                          >
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => onShowToast(`Membuka Belakang - Raw untuk ${item.title}`)}
                            className="px-2.5 py-0.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white text-[11px] font-normal text-center whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                          >
                            Belakang - Raw
                          </button>
                          <button
                            type="button"
                            onClick={() => onShowToast(`Membuka Link Marketplace untuk ${item.title}`)}
                            className="px-2.5 py-0.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white text-[11px] font-normal text-center whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                          >
                            Link Marketplace
                          </button>
                        </div>
                      </td>

                      {/* Cover */}
                      <td className="py-4 px-3 text-[12px] sm:text-[13px] text-slate-600 align-middle whitespace-nowrap">
                        {item.coverType || 'Soft Cover'}
                      </td>

                      {/* Pemasukan Divisi */}
                      <td className="py-4 px-3 text-center align-middle whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#008d91] border border-teal-200">
                          {item.pemasukanDivisi || 'MAD'}
                        </span>
                      </td>

                      {/* Actions 3 dots */}
                      <td className="py-4 px-2 text-center align-middle relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div className="absolute right-2 top-10 z-20 w-60 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-xs text-left animate-in fade-in duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenCatalogForSingleItem(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-[#008d91] hover:bg-teal-50 flex items-center gap-2 font-semibold transition-colors cursor-pointer border-b border-slate-100"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Buatkan Katalog</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemForListAAjak(item);
                                setIsModalListAAjakOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Lihat List A-AJAK Item S-SALUR</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemForAAjak(item);
                                setIsModalAAjakOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Tambah A-AJAK Item S-SALUR</span>
                            </button>

                            {onNavigateToModalItemSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToModalItemSalur(item.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-[#008d91]" />
                                <span>Modal Item S-SALUR</span>
                              </button>
                            )}

                            {onNavigateToStokItemSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToStokItemSalur(item.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                              >
                                <Boxes className="w-3.5 h-3.5 text-[#008d91]" />
                                <span>Stok Item S-SALUR</span>
                              </button>
                            )}

                            {onNavigateToOngoingCreateItemSalur && (
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToOngoingCreateItemSalur();
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                              >
                                <Kanban className="w-3.5 h-3.5 text-[#008d91]" />
                                <span>Ongoing Create Item S-SALUR</span>
                              </button>
                            )}
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                toggleExpand(item.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>{isExpanded ? 'Sembunyikan Info' : 'Lihat Detail'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onShowToast(`Salin link katalog ${item.title}`);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Salin Link</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onShowToast(`Buka Marketplace`);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                              <span>Marketplace</span>
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteItem(item.id, item.title);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Item</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* EXPANDED UNHIDDEN DETAIL ROW */}
                    {isExpanded && (
                      <tr className="border-b border-slate-100">
                        <td colSpan={13} className="py-4 px-4 sm:px-6 bg-white">
                          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pl-6 sm:pl-8 text-[13px] text-slate-600">
                            {/* Left Column: Metadata Details */}
                            <div className="flex flex-col gap-1 w-full lg:w-[42%] shrink-0 leading-relaxed">
                              <p>
                                <span className="font-normal text-slate-700">Judul: </span>
                                {item.detailedInfo?.fullTitle || item.title}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">Penulis: </span>
                                {item.detailedInfo?.author || item.author || 'Dalai Lama XIV'}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">Penerbit: </span>
                                {item.detailedInfo?.publisher || item.publisher || 'Penerbit Yayasan Pelestarian dan Pengembangan Lamrim Nusantara'}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">Ukuran: </span>
                                {item.detailedInfo?.dimensions || '21 x 14.8 x 1.2 mm'}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">Jumlah Halaman: </span>
                                {item.detailedInfo?.pages || 'xvii+137'}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">Cover: </span>
                                {item.detailedInfo?.cover || item.coverType || 'Soft Cover'}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">ISBN: </span>
                                {item.detailedInfo?.isbn || '978-623-6632-06-2'}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">Terbit: </span>
                                {item.detailedInfo?.year || '2021'}
                              </p>
                              <p>
                                <span className="font-normal text-slate-700">Harga: </span>
                                {item.detailedInfo?.priceFormatted || `Rp${item.price.toLocaleString('id-ID')}`}
                              </p>
                              {item.coaNoAkun ? (
                                <p className="flex items-center gap-1.5 pt-1">
                                  <span className="font-normal text-slate-700">Akun COA: </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200">
                                    {item.coaNoAkun}
                                  </span>
                                  <span className="text-slate-600 text-[11px] font-medium truncate max-w-[170px]" title={item.coaNamaAkun}>
                                    {item.coaNamaAkun}
                                  </span>
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic pt-1">
                                  {item.price > 0 ? 'COA otomatis dihubungkan' : 'Non-berbayar (Tanpa Akun Pendapatan)'}
                                </p>
                              )}
                            </div>

                            {/* Right Column: Quote & Description */}
                            <div className="flex-1 flex flex-col gap-3.5 text-slate-600 leading-relaxed">
                              {item.detailedInfo?.quote && (
                                <p className="text-slate-600 text-[13px] leading-relaxed">
                                  {item.detailedInfo.quote}
                                </p>
                              )}
                              {item.detailedInfo?.description && (
                                <p className="text-slate-600 text-[13px] leading-relaxed">
                                  {item.detailedInfo.description}
                                </p>
                              )}
                            </div>

                            {/* Far Right 3 dots */}
                            <div className="shrink-0 flex items-start pt-1 relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(
                                    activeMenuId === `expanded-${item.id}` ? null : `expanded-${item.id}`
                                  )
                                }
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {activeMenuId === `expanded-${item.id}` && (
                                <div className="absolute right-0 top-8 z-20 w-60 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-xs text-left animate-in fade-in duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenCatalogForSingleItem(item);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-[#008d91] hover:bg-teal-50 flex items-center gap-2 font-semibold transition-colors cursor-pointer border-b border-slate-100"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-[#008d91]" />
                                    <span>Buatkan Katalog</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedItemForListAAjak(item);
                                      setIsModalListAAjakOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5 text-[#008d91]" />
                                    <span>Lihat List A-AJAK Item S-SALUR</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedItemForAAjak(item);
                                      setIsModalAAjakOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 text-[#008d91]" />
                                    <span>Tambah A-AJAK Item S-SALUR</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onShowToast(`Salin link katalog ${item.title}`);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Salin Link</span>
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteItem(item.id, item.title);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Item</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Package className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700">Tidak ada item ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Coba kata kunci pencarian lain atau pilih kategori lain.
            </p>
          </div>
        )}
      </div>

      {/* Modal Tambah A-AJAK Item S-SALUR */}
      <ModalTambahAAjakItemSalur
        isOpen={isModalAAjakOpen}
        onClose={() => {
          setIsModalAAjakOpen(false);
          setSelectedItemForAAjak(null);
        }}
        item={selectedItemForAAjak}
        identitasList={identitasList}
        onShowToast={onShowToast}
      />

      {/* Modal Lihat List A-AJAK Item S-SALUR matching image.png */}
      <ModalLihatListAAjakItemSalur
        isOpen={isModalListAAjakOpen}
        onClose={() => {
          setIsModalListAAjakOpen(false);
          setSelectedItemForListAAjak(null);
        }}
        item={selectedItemForListAAjak}
        identitasList={identitasList}
        onShowToast={onShowToast}
        onKirimPM={onKirimPM}
        onCreateGroupFunneling={onCreateGroupFunneling}
        onTambahKeGroupFunnelingExisting={onTambahKeGroupFunnelingExisting}
      />

      {/* Modal Buatkan Katalog Item S-SALUR (Pop-up & Downloadable) */}
      <ModalKatalogItemSalur
        isOpen={isCatalogModalOpen}
        onClose={() => {
          setIsCatalogModalOpen(false);
          setCatalogItems([]);
        }}
        items={catalogItems}
        onShowToast={onShowToast}
      />

      {/* Modal Ubah Logo Sub-Jenis */}
      {isChangeLogoModalOpen && editingLogoSubJenis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 w-full max-w-md animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Ubah Logo Sub-Jenis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingLogoSubJenis.namaSubJenis}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangeLogoModalOpen(false);
                  setEditingLogoSubJenis(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center py-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-transform overflow-hidden"
                style={{ backgroundColor: tempIconBg }}
              >
                {tempLogoUrl ? (
                  <img
                    src={tempLogoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  renderIconByName(tempIconType, 'w-8 h-8')
                )}
              </div>
            </div>

            {/* Pilih Ikon */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Pilih Ikon Sesuai Sub-Jenis:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { id: 'book', label: 'Buku', icon: Book },
                  { id: 'globe', label: 'Globe', icon: Globe },
                  { id: 'book-open', label: 'Buku Terbuka', icon: BookOpen },
                  { id: 'shirt', label: 'Kaos', icon: Shirt },
                  { id: 'notebook', label: 'Notebook', icon: Notebook },
                  { id: 'boxes', label: 'Boxes', icon: Boxes },
                  { id: 'package', label: 'Paket', icon: Package },
                  { id: 'tablet', label: 'Tablet', icon: Tablet },
                  { id: 'gift', label: 'Hadiah', icon: Gift },
                  { id: 'tag', label: 'Tag', icon: Tag },
                  { id: 'sparkles', label: 'Spesial', icon: Sparkles },
                  { id: 'shopping-cart', label: 'Cart', icon: ShoppingCart },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isAct = !tempLogoUrl && tempIconType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTempIconType(item.id);
                        setTempLogoUrl('');
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isAct
                          ? 'border-[#008d91] bg-teal-50 text-[#008d91] ring-2 ring-[#008d91]/20 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Logo Image URL or Upload */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Atau Unggah / URL Logo Gambar:
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

            {/* Warna Latar Logo */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Warna Latar Belakang:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  '#008d91',
                  '#ec4899',
                  '#5e35b1',
                  '#c0392b',
                  '#f39c12',
                  '#0284c7',
                  '#10b981',
                  '#1e293b',
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTempIconBg(color)}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      tempIconBg === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {tempIconBg === color && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsChangeLogoModalOpen(false);
                  setEditingLogoSubJenis(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveSubJenisLogo(editingLogoSubJenis.id, {
                    iconType: tempIconType,
                    logoUrl: tempLogoUrl || undefined,
                    iconBg: tempIconBg,
                  });
                  setIsChangeLogoModalOpen(false);
                  setEditingLogoSubJenis(null);
                  onShowToast(`Logo sub-jenis "${editingLogoSubJenis.namaSubJenis}" berhasil diperbarui`);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] shadow-xs shadow-[#008d91]/25 transition-all cursor-pointer"
              >
                Simpan Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
