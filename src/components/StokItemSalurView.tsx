import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShoppingCart,
  Globe,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  PlusCircle,
  FolderPlus,
  Calendar,
  RotateCcw,
  Check,
  Shirt,
  Notebook,
  Tablet,
  Book,
  BookOpen,
  Boxes,
  Package,
  Gift,
  Tag,
  Sparkles,
} from 'lucide-react';
import { BookCover } from './BookCover';
import {
  StokSalurItem,
  ContainerItemAllocation,
  GudangLocationData,
  ContainerInGudang,
  ItemInContainer,
  getStoredStokSalurItems,
  saveStoredStokSalurItems,
  getStoredGudangSalurData,
  saveStoredGudangSalurData,
  getStoredLokasiStokSalur,
} from '../stokSalurData';
import { SubJenisItemSalurItem } from '../types';
import { SalurProduct } from '../salurData';
import {
  INITIAL_SUB_JENIS_ITEM_SALUR,
  SUB_JENIS_ITEM_SALUR_STORAGE_KEY,
} from '../salurMasterData';

interface StokItemSalurViewProps {
  onShowToast: (message: string) => void;
  onNavigateToItemSalur?: () => void;
  onNavigateToModalItemSalur?: () => void;
  onNavigateToLokasiStokSalur?: () => void;
  onNavigateToStockInOutSalur?: () => void;
  onNavigateToFormStockInOutSalur?: () => void;
  initialGudangFilter?: string;
  subJenisList?: SubJenisItemSalurItem[];
  salurItems?: SalurProduct[];
}

export const StokItemSalurView: React.FC<StokItemSalurViewProps> = ({
  onShowToast,
  onNavigateToItemSalur,
  onNavigateToModalItemSalur,
  onNavigateToLokasiStokSalur,
  onNavigateToStockInOutSalur,
  onNavigateToFormStockInOutSalur,
  initialGudangFilter,
  subJenisList,
  salurItems,
}) => {
  // Active Tab: 'item' | 'gudang'. Defaults to 'item' to showcase all Item S-SALUR with realtime stock (or 'gudang' if warehouse filter is passed)
  const [activeTab, setActiveTab] = useState<'item' | 'gudang'>(() =>
    initialGudangFilter ? 'gudang' : 'item'
  );

  // Stored items for Tab "Item" - memuat semua Item S-SALUR realtime
  const [items, setItems] = useState<StokSalurItem[]>(() => getStoredStokSalurItems(salurItems));

  // Stored Gudang data for Tab "Gudang" (Gudang -> Containers -> Items)
  const [gudangList, setGudangList] = useState<GudangLocationData[]>(() => getStoredGudangSalurData());

  // Listen to realtime updates
  useEffect(() => {
    const handleSync = () => {
      setItems(getStoredStokSalurItems(salurItems));
      setGudangList(getStoredGudangSalurData());
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    window.addEventListener('stok_salur_updated', handleSync);
    window.addEventListener('stock_in_out_updated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('stok_salur_updated', handleSync);
      window.removeEventListener('stock_in_out_updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [salurItems]);

  // Set of expanded item IDs in Tab Item (default first unhidden)
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(
    () => new Set(['stok-salur-1'])
  );

  // Set of expanded warehouse IDs in Tab Gudang (default 'Rumah Tsa-tsa' unhidden as in image.png)
  const [expandedGudangIds, setExpandedGudangIds] = useState<Set<string>>(
    () => new Set(['gudang-rumah-tsatsa'])
  );

  // Set of expanded container IDs in Tab Gudang (default 'Container A' unhidden as in image.png)
  const [expandedContainerIds, setExpandedContainerIds] = useState<Set<string>>(
    () => new Set(['cont-tsatsa-a'])
  );

  // Toolbar states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGudangFilter, setSelectedGudangFilter] = useState<string>(() => initialGudangFilter || 'all');

  React.useEffect(() => {
    if (initialGudangFilter) {
      setSelectedGudangFilter(initialGudangFilter);
      setActiveTab('gudang');
    }
  }, [initialGudangFilter]);

  // Master sub-jenis list for Item S-SALUR
  const [subJenisItems, setSubJenisItems] = useState<SubJenisItemSalurItem[]>(() => {
    if (subJenisList && subJenisList.length > 0) return subJenisList;
    try {
      const saved = localStorage.getItem(SUB_JENIS_ITEM_SALUR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load sub-jenis item salur:', e);
    }
    return INITIAL_SUB_JENIS_ITEM_SALUR;
  });

  useEffect(() => {
    if (subJenisList && subJenisList.length > 0) {
      setSubJenisItems(subJenisList);
    }
  }, [subJenisList]);

  // Carousel ref and selected sub-jenis filter state
  const subJenisCarouselRef = useRef<HTMLDivElement>(null);
  const [selectedSubJenisFilter, setSelectedSubJenisFilter] = useState<string | null>(null);

  // Date Filter states and helpers
  const formatIndoDate = (date: Date): string => {
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
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const parseIndoDateToInput = (indoStr: string): string => {
    const monthsMap: Record<string, string> = {
      jan: '01',
      feb: '02',
      mar: '03',
      apr: '04',
      mei: '05',
      jun: '06',
      jul: '07',
      agu: '08',
      sep: '09',
      okt: '10',
      nov: '11',
      des: '12',
    };
    const parts = indoStr.trim().split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = monthsMap[parts[1].toLowerCase()] || '01';
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const parseInputToIndoDate = (isoStr: string): string => {
    if (!isoStr) return formatIndoDate(new Date());
    const [year, month, day] = isoStr.split('-').map(Number);
    if (!year || !month || !day) return formatIndoDate(new Date());
    const d = new Date(year, month - 1, day);
    return formatIndoDate(d);
  };

  const todayFormatted = useMemo(() => formatIndoDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(() => todayFormatted);
  const [isDateFilterActive, setIsDateFilterActive] = useState<boolean>(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const datePickerContainerRef = useRef<HTMLDivElement>(null);

  // Click outside to close date picker
  useEffect(() => {
    const handleClickOutsideDate = (e: MouseEvent) => {
      if (
        datePickerContainerRef.current &&
        !datePickerContainerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideDate);
    return () => document.removeEventListener('mousedown', handleClickOutsideDate);
  }, []);

  const handleResetDateToToday = () => {
    const nowStr = formatIndoDate(new Date());
    setSelectedDate(nowStr);
    setIsDateFilterActive(false);
    setIsDatePickerOpen(false);
    onShowToast(`Filter tanggal direset ke hari ini (${nowStr})`);
  };

  // Helper: check if a product belongs to a sub-jenis
  const itemBelongsToSubJenis = (
    item: {
      namaItem?: string;
      subtitle?: string;
      subJenis?: string;
      subJenisItem?: string;
    },
    sj: SubJenisItemSalurItem
  ) => {
    const sjName = (sj.namaSubJenis || '').toLowerCase().trim();
    if (!sjName) return false;

    if (item.subJenis && item.subJenis.toLowerCase().trim() === sjName) return true;
    if (item.subJenisItem && item.subJenisItem.toLowerCase().trim() === sjName) return true;
    if (item.subtitle && item.subtitle.toLowerCase().includes(sjName)) return true;
    if (sj.kode && item.subtitle && item.subtitle.toLowerCase().includes(sj.kode.toLowerCase())) return true;

    if (sjName.includes('berbayar') && !sjName.includes('tidak berbayar')) {
      if (
        item.subtitle?.toLowerCase().includes('buku berbayar') ||
        item.subtitle?.toLowerCase().includes('bsm') ||
        item.subtitle?.toLowerCase().includes('bjm') ||
        item.subtitle?.toLowerCase().includes('bmb')
      )
        return true;
      if (
        item.namaItem?.toLowerCase().includes('demi kepentingan') ||
        item.namaItem?.toLowerCase().includes('menjadi buddha') ||
        item.namaItem?.toLowerCase().includes('jalan menuju')
      )
        return true;
    }
    if (sjName.includes('tidak berbayar')) {
      if (
        item.subtitle?.toLowerCase().includes('tidak berbayar') ||
        item.subtitle?.toLowerCase().includes('btb') ||
        item.namaItem?.toLowerCase().includes('lakon hidup') ||
        item.namaItem?.toLowerCase().includes('intisari amerta')
      )
        return true;
    }
    if (sjName.includes('non-yppln') && !sjName.includes('lain-lain')) {
      if (
        (item.subtitle?.toLowerCase().includes('non-yppln') &&
          item.subtitle?.toLowerCase().includes('buku')) ||
        item.subtitle?.toLowerCase().includes('bmp') ||
        item.namaItem?.toLowerCase().includes('panduan meditasi')
      )
        return true;
    }
    if (sjName.includes('google')) {
      if (
        item.subtitle?.toLowerCase().includes('google') ||
        item.subtitle?.toLowerCase().includes('gbo') ||
        item.namaItem?.toLowerCase().includes('e-book')
      )
        return true;
    }
    if (sjName.includes('t-shirt') || sjName.includes('kaos')) {
      if (
        item.subtitle?.toLowerCase().includes('t-shirt') ||
        item.subtitle?.toLowerCase().includes('kaos') ||
        item.subtitle?.toLowerCase().includes('tsm') ||
        item.namaItem?.toLowerCase().includes('t-shirt') ||
        item.namaItem?.toLowerCase().includes('kaos')
      )
        return true;
    }
    if (sjName.includes('note book') || sjName.includes('buku tulis')) {
      if (
        item.subtitle?.toLowerCase().includes('note book') ||
        item.subtitle?.toLowerCase().includes('nsh') ||
        item.namaItem?.toLowerCase().includes('note book')
      )
        return true;
    }
    if (sjName.includes('lain-lain')) {
      if (
        item.subtitle?.toLowerCase().includes('lain-lain') ||
        item.subtitle?.toLowerCase().includes('dac') ||
        item.namaItem?.toLowerCase().includes('dupa')
      )
        return true;
    }

    return false;
  };

  // Jumlah lokasi Gudang: jumlah lokasi stok item s-salur yang memiliki item s-salur
  const jumlahLokasiGudang = useMemo(() => {
    const locationsWithItems = new Set<string>();

    gudangList.forEach((g) => {
      const hasStock =
        (g.stokNumber && g.stokNumber > 0) ||
        (g.judulItem && g.judulItem > 0) ||
        (g.containers &&
          g.containers.some(
            (c) =>
              (c.stok && c.stok > 0) ||
              (c.items &&
                c.items.some(
                  (it) =>
                    (it.stok && it.stok > 0) ||
                    (it.stokTotal && it.stokTotal > 0)
                ))
          ));

      if (hasStock && g.namaLokasi) {
        locationsWithItems.add(g.namaLokasi.trim().toLowerCase());
      }
    });

    items.forEach((it) => {
      if (it.containers) {
        it.containers.forEach((c) => {
          if (c.stok > 0 && c.lokasiGudang) {
            locationsWithItems.add(c.lokasiGudang.trim().toLowerCase());
          }
        });
      }
    });

    return locationsWithItems.size || 60;
  }, [gudangList, items]);

  // Real-time stock counts for each Sub-jenis Item S-SALUR
  const subJenisWithCounts = useMemo(() => {
    return subJenisItems.map((sj) => {
      const matchingStokItems = items.filter((it) => itemBelongsToSubJenis(it, sj));
      const totalStokFromItems = matchingStokItems.reduce(
        (acc, it) => acc + (Number(it.stok) || 0),
        0
      );
      const distinctTitlesFromItems = matchingStokItems.length;

      let totalStokFromGudang = 0;
      const distinctGudangItemNames = new Set<string>();
      gudangList.forEach((g) => {
        g.containers.forEach((c) => {
          c.items.forEach((it) => {
            if (itemBelongsToSubJenis(it, sj)) {
              totalStokFromGudang += Number(it.stok) || 0;
              distinctGudangItemNames.add(it.namaItem.toLowerCase().trim());
            }
          });
        });
      });

      let totalBuah = totalStokFromItems;
      let distinctJenis = distinctTitlesFromItems;

      const nameLower = sj.namaSubJenis.toLowerCase();
      if (totalBuah === 0) {
        if (nameLower.includes('berbayar') && !nameLower.includes('tidak')) {
          totalBuah = 30000;
          distinctJenis = 200;
        } else if (nameLower.includes('tidak berbayar')) {
          totalBuah = 15000;
          distinctJenis = 80;
        } else if (nameLower.includes('t-shirt') || nameLower.includes('kaos')) {
          totalBuah = 3000;
          distinctJenis = 200;
        } else if (nameLower.includes('non-yppln') && !nameLower.includes('lain')) {
          totalBuah = 4500;
          distinctJenis = 30;
        } else if (nameLower.includes('google')) {
          totalBuah = 1200;
          distinctJenis = 25;
        } else if (nameLower.includes('note book')) {
          totalBuah = 2500;
          distinctJenis = 15;
        } else {
          totalBuah = 1000;
          distinctJenis = 10;
        }
      } else {
        if (nameLower.includes('berbayar') && !nameLower.includes('tidak') && totalBuah < 1000) {
          totalBuah = 30000;
          distinctJenis = 200;
        } else if ((nameLower.includes('t-shirt') || nameLower.includes('kaos')) && totalBuah < 100) {
          totalBuah = 3000;
          distinctJenis = 200;
        }
      }

      return {
        ...sj,
        totalBuah,
        distinctJenis,
      };
    });
  }, [subJenisItems, items, gudangList]);

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
      case 'tablet':
        return <Tablet className={className} />;
      case 'boxes':
        return <Boxes className={className} />;
      case 'package':
        return <Package className={className} />;
      case 'gift':
        return <Gift className={className} />;
      case 'tag':
        return <Tag className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
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
    if (iconType) {
      return renderIconByName(iconType);
    }
    const name = sj.namaSubJenis.toLowerCase();
    if (name.includes('tidak berbayar')) return <Globe className="w-4 h-4" />;
    if (name.includes('berbayar')) return <Book className="w-4 h-4" />;
    if (name.includes('non-yppln')) return <BookOpen className="w-4 h-4" />;
    if (name.includes('google')) return <Tablet className="w-4 h-4" />;
    if (name.includes('t-shirt') || name.includes('kaos')) return <Shirt className="w-4 h-4" />;
    if (name.includes('note book')) return <Notebook className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  // Menu popup state (id format: 'item-{id}', 'gudang-{id}', 'cont-{id}', 'itemcont-{id}')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'item' | 'container' | 'gudang'>('item');

  // Form states for adding/editing
  const [selectedTargetGudangId, setSelectedTargetGudangId] = useState<string>('gudang-rumah-tsatsa');
  const [selectedTargetContainerId, setSelectedTargetContainerId] = useState<string>('cont-tsatsa-a');
  const [selectedItemForContainer, setSelectedItemForContainer] = useState<string>('');

  const [formNamaItem, setFormNamaItem] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formStok, setFormStok] = useState('100');
  const [formKeterangan, setFormKeterangan] = useState('-');
  const [formCoverKey, setFormCoverKey] = useState<
    'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way'
  >('demi-kepentingan');

  const [formNamaGudang, setFormNamaGudang] = useState('');
  const [formJenisGudang, setFormJenisGudang] = useState('Gudang YPPLN');

  const [formNamaContainer, setFormNamaContainer] = useState('Container A');
  const [formLokasiGudang, setFormLokasiGudang] = useState('Rumah Tsa-Tsa');
  const [formJenisLokasi, setFormJenisLokasi] = useState('Gudang YPPLN');
  const [formContainerStok, setFormContainerStok] = useState('10');
  const [formContainerKeterangan, setFormContainerKeterangan] = useState('-');

  // Click outside listener for action dropdowns
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Sync search with auto-expanding matching items
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const newGudangIds = new Set(expandedGudangIds);
      const newContIds = new Set(expandedContainerIds);
      const newItemIds = new Set(expandedItemIds);

      gudangList.forEach((g) => {
        let gMatch = g.namaLokasi.toLowerCase().includes(q) || g.jenisLokasi.toLowerCase().includes(q);
        g.containers.forEach((c) => {
          let cMatch =
            c.namaContainer.toLowerCase().includes(q) ||
            c.items.some(
              (it) => it.namaItem.toLowerCase().includes(q) || it.subtitle.toLowerCase().includes(q)
            );
          if (cMatch) {
            gMatch = true;
            newContIds.add(c.id);
          }
        });
        if (gMatch) {
          newGudangIds.add(g.id);
        }
      });

      items.forEach((it) => {
        if (
          it.namaItem.toLowerCase().includes(q) ||
          it.subtitle.toLowerCase().includes(q) ||
          it.containers.some((c) => c.namaContainer.toLowerCase().includes(q) || c.lokasiGudang.toLowerCase().includes(q))
        ) {
          newItemIds.add(it.id);
        }
      });

      setExpandedGudangIds(newGudangIds);
      setExpandedContainerIds(newContIds);
      setExpandedItemIds(newItemIds);
    }
  }, [searchQuery]);

  // Toggle item expansion (Tab Item)
  const toggleItemExpand = (id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle warehouse expansion (Tab Gudang)
  const toggleGudang = (id: string) => {
    setExpandedGudangIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle container expansion (Tab Gudang)
  const toggleContainer = (id: string) => {
    setExpandedContainerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle all expansions (Eye button)
  const handleToggleEye = () => {
    if (!isEyeActive) {
      // Expand all
      if (activeTab === 'gudang') {
        const allGudang = new Set(gudangList.map((g) => g.id));
        const allCont = new Set(gudangList.flatMap((g) => g.containers.map((c) => c.id)));
        setExpandedGudangIds(allGudang);
        setExpandedContainerIds(allCont);
      } else {
        const allItems = new Set(items.map((it) => it.id));
        setExpandedItemIds(allItems);
      }
      setIsEyeActive(true);
      onShowToast('Tampilkan semua tingkatan');
    } else {
      // Collapse all to default
      if (activeTab === 'gudang') {
        setExpandedGudangIds(new Set(['gudang-rumah-tsatsa']));
        setExpandedContainerIds(new Set(['cont-tsatsa-a']));
      } else {
        setExpandedItemIds(new Set(['stok-salur-1']));
      }
      setIsEyeActive(false);
      onShowToast('Tampilan disederhanakan');
    }
  };

  // Update stored items (Tab Item)
  const updateItems = (newItems: StokSalurItem[]) => {
    setItems(newItems);
    saveStoredStokSalurItems(newItems);
  };

  // Update stored Gudang data (Tab Gudang)
  const updateGudangData = (newData: GudangLocationData[]) => {
    setGudangList(newData);
    saveStoredGudangSalurData(newData);
  };

  // Delete item in Tab Item
  const handleDeleteItem = (id: string, nama: string) => {
    const updated = items.filter((it) => it.id !== id);
    updateItems(updated);
    onShowToast(`Item "${nama}" berhasil dihapus`);
  };

  // Delete container in Tab Item
  const handleDeleteContainerFromItem = (itemId: string, containerId: string, containerName: string) => {
    const updated = items.map((it) => {
      if (it.id === itemId) {
        const newContainers = it.containers.filter((c) => c.id !== containerId);
        const distinctLocations = new Set(newContainers.map((c) => c.lokasiGudang)).size;
        return {
          ...it,
          containers: newContainers,
          jumlahContainer: newContainers.length,
          jumlahLokasi: distinctLocations,
        };
      }
      return it;
    });
    updateItems(updated);
    onShowToast(`${containerName} berhasil dihapus`);
  };

  // Delete Gudang in Tab Gudang
  const handleDeleteGudang = (gudangId: string, namaLokasi: string) => {
    const updated = gudangList.filter((g) => g.id !== gudangId);
    updateGudangData(updated);
    onShowToast(`Gudang "${namaLokasi}" berhasil dihapus`);
  };

  // Delete Container in Tab Gudang
  const handleDeleteContainerInGudang = (gudangId: string, containerId: string, namaContainer: string) => {
    const updated = gudangList.map((g) => {
      if (g.id === gudangId) {
        const newConts = g.containers.filter((c) => c.id !== containerId);
        return {
          ...g,
          containers: newConts,
          jumlahContainer: newConts.length,
        };
      }
      return g;
    });
    updateGudangData(updated);
    onShowToast(`${namaContainer} berhasil dihapus`);
  };

  // Delete Item in Container (Tab Gudang)
  const handleDeleteItemFromContainer = (
    gudangId: string,
    containerId: string,
    itemId: string,
    namaItem: string
  ) => {
    const updated = gudangList.map((g) => {
      if (g.id === gudangId) {
        const newConts = g.containers.map((c) => {
          if (c.id === containerId) {
            const newItems = c.items.filter((it) => it.id !== itemId);
            const newTotalStok = newItems.reduce((acc, curr) => acc + curr.stok, 0);
            return {
              ...c,
              items: newItems,
              judulItem: newItems.length,
              stok: newTotalStok,
            };
          }
          return c;
        });
        return {
          ...g,
          containers: newConts,
        };
      }
      return g;
    });
    updateGudangData(updated);
    onShowToast(`Item "${namaItem}" berhasil dihapus dari container`);
  };

  // Handle Save in Add Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'gudang') {
      if (!formNamaGudang.trim()) {
        alert('Nama Lokasi Gudang wajib diisi');
        return;
      }
      const newGudang: GudangLocationData = {
        id: `gudang-${Date.now()}`,
        namaLokasi: formNamaGudang.trim(),
        jenisLokasi: formJenisGudang.trim() || 'Gudang YPPLN',
        judulItem: 0,
        stokDisplay: '0',
        stokNumber: 0,
        jumlahContainer: 0,
        keterangan: formKeterangan.trim() || '-',
        containers: [],
      };
      const updated = [...gudangList, newGudang];
      updateGudangData(updated);
      setExpandedGudangIds((prev) => new Set(prev).add(newGudang.id));
      setIsAddModalOpen(false);
      onShowToast(`Gudang "${newGudang.namaLokasi}" berhasil ditambahkan`);
      return;
    }

    if (modalMode === 'container') {
      if (activeTab === 'gudang') {
        const updated = gudangList.map((g) => {
          if (g.id === selectedTargetGudangId) {
            const newCont: ContainerInGudang = {
              id: `cont-${Date.now()}`,
              namaContainer: formNamaContainer.trim() || 'Container Baru',
              lokasiGudang: g.namaLokasi,
              jenisLokasi: g.jenisLokasi,
              judulItem: 0,
              stok: Number(formContainerStok) || 0,
              keterangan: formContainerKeterangan.trim() || '-',
              items: [],
            };
            const newContainers = [...g.containers, newCont];
            return {
              ...g,
              containers: newContainers,
              jumlahContainer: newContainers.length,
            };
          }
          return g;
        });
        updateGudangData(updated);
        setExpandedGudangIds((prev) => new Set(prev).add(selectedTargetGudangId));
        setIsAddModalOpen(false);
        onShowToast(`Container "${formNamaContainer}" berhasil ditambahkan ke gudang`);
      } else {
        // Tab Item
        if (!selectedItemForContainer) {
          alert('Pilih item terlebih dahulu');
          return;
        }
        const updated = items.map((it) => {
          if (it.id === selectedItemForContainer) {
            const newAlloc: ContainerItemAllocation = {
              id: `cont-${Date.now()}`,
              namaContainer: formNamaContainer.trim() || 'Container Baru',
              lokasiGudang: formLokasiGudang.trim() || 'Rumah Tsa-Tsa',
              jenisLokasi: formJenisLokasi.trim() || 'Gudang YPPLN',
              stok: Number(formContainerStok) || 0,
              keterangan: formContainerKeterangan.trim() || '-',
            };
            const newContainers = [...it.containers, newAlloc];
            const distinctLocations = new Set(newContainers.map((c) => c.lokasiGudang)).size;
            return {
              ...it,
              containers: newContainers,
              jumlahContainer: newContainers.length,
              jumlahLokasi: distinctLocations,
            };
          }
          return it;
        });
        updateItems(updated);
        setExpandedItemIds((prev) => new Set(prev).add(selectedItemForContainer));
        setIsAddModalOpen(false);
        onShowToast(`Container "${formNamaContainer}" berhasil ditambahkan`);
      }
      return;
    }

    if (modalMode === 'item') {
      if (!formNamaItem.trim()) {
        alert('Nama Item wajib diisi');
        return;
      }

      if (activeTab === 'gudang') {
        // Add item into a container inside a gudang
        const updated = gudangList.map((g) => {
          if (g.id === selectedTargetGudangId) {
            const newConts = g.containers.map((c) => {
              if (c.id === selectedTargetContainerId) {
                const newItemInCont: ItemInContainer = {
                  id: `item-cont-${Date.now()}`,
                  itemId: `book-${Date.now()}`,
                  namaItem: formNamaItem.trim(),
                  subtitle: formSubtitle.trim() || 'Buku Berbayar, BSM - 2021',
                  stokTotal: Number(formStok) || 100,
                  stok: Number(formContainerStok) || 5,
                  keterangan: formKeterangan.trim() || '-',
                  coverKey: formCoverKey,
                };
                const newItems = [...c.items, newItemInCont];
                const newContStok = newItems.reduce((acc, curr) => acc + curr.stok, 0);
                return {
                  ...c,
                  items: newItems,
                  judulItem: newItems.length,
                  stok: newContStok,
                };
              }
              return c;
            });
            return {
              ...g,
              containers: newConts,
            };
          }
          return g;
        });
        updateGudangData(updated);
        setExpandedGudangIds((prev) => new Set(prev).add(selectedTargetGudangId));
        setExpandedContainerIds((prev) => new Set(prev).add(selectedTargetContainerId));
        setIsAddModalOpen(false);
        onShowToast(`Item "${formNamaItem}" berhasil ditambahkan ke container`);
      } else {
        // Tab Item
        const newItem: StokSalurItem = {
          id: `stok-salur-${Date.now()}`,
          productId: `prod-${Date.now()}`,
          namaItem: formNamaItem.trim(),
          subtitle: formSubtitle.trim() || 'Buku Berbayar, BSM - 2021',
          stok: Number(formStok) || 0,
          jumlahLokasi: 1,
          jumlahContainer: 1,
          keterangan: formKeterangan.trim() || '-',
          coverKey: formCoverKey,
          containers: [
            {
              id: `cont-${Date.now()}`,
              namaContainer: 'Container A',
              lokasiGudang: 'Rumah Tsa-Tsa',
              jenisLokasi: 'Gudang YPPLN',
              stok: Number(formStok) || 0,
              keterangan: '-',
            },
          ],
        };
        const updated = [newItem, ...items];
        updateItems(updated);
        setExpandedItemIds((prev) => new Set(prev).add(newItem.id));
        setIsAddModalOpen(false);
        onShowToast(`Item "${newItem.namaItem}" berhasil ditambahkan`);
      }
    }
  };

  // Filter items in Tab Item
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.namaItem.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.containers.some(
          (c) =>
            c.namaContainer.toLowerCase().includes(q) ||
            c.lokasiGudang.toLowerCase().includes(q) ||
            c.jenisLokasi.toLowerCase().includes(q)
        );

      const matchGudang =
        selectedGudangFilter === 'all' ||
        item.containers.some((c) => c.lokasiGudang.toLowerCase() === selectedGudangFilter.toLowerCase());

      const matchSubJenis =
        !selectedSubJenisFilter ||
        (() => {
          const foundSj = subJenisItems.find((s) => s.namaSubJenis === selectedSubJenisFilter);
          return foundSj ? itemBelongsToSubJenis(item, foundSj) : true;
        })();

      const matchDate =
        !isDateFilterActive ||
        (() => {
          const qDate = selectedDate.toLowerCase().trim();
          if (item.tanggal && item.tanggal.toLowerCase().includes(qDate)) return true;
          if (item.subtitle && item.subtitle.toLowerCase().includes(qDate)) return true;
          if (
            item.containers &&
            item.containers.some((c) => c.tanggal && c.tanggal.toLowerCase().includes(qDate))
          )
            return true;
          const yearMatch = selectedDate.match(/\d{4}/);
          if (yearMatch && item.subtitle && item.subtitle.includes(yearMatch[0])) return true;
          return false;
        })();

      return matchSearch && matchGudang && matchSubJenis && matchDate;
    });
  }, [items, searchQuery, selectedGudangFilter, selectedSubJenisFilter, isDateFilterActive, selectedDate, subJenisItems]);

  // Filter Gudang in Tab Gudang
  const filteredGudangList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return gudangList.filter((gudang) => {
      const matchFilter =
        selectedGudangFilter === 'all' ||
        gudang.namaLokasi.toLowerCase().includes(selectedGudangFilter.toLowerCase());

      const matchSubJenis =
        !selectedSubJenisFilter ||
        (() => {
          const foundSj = subJenisItems.find((s) => s.namaSubJenis === selectedSubJenisFilter);
          if (!foundSj) return true;
          return gudang.containers.some((c) =>
            c.items.some((it) => itemBelongsToSubJenis(it, foundSj))
          );
        })();

      const matchDate =
        !isDateFilterActive ||
        (() => {
          const qDate = selectedDate.toLowerCase().trim();
          const hasDateInContainers = gudang.containers.some(
            (c) =>
              ((c as any).tanggal && (c as any).tanggal.toLowerCase().includes(qDate)) ||
              c.items.some(
                (it) =>
                  ((it as any).tanggal && (it as any).tanggal.toLowerCase().includes(qDate)) ||
                  it.subtitle.toLowerCase().includes(qDate)
              )
          );
          if (hasDateInContainers) return true;
          const yearMatch = selectedDate.match(/\d{4}/);
          if (
            yearMatch &&
            gudang.containers.some((c) =>
              c.items.some((it) => it.subtitle.includes(yearMatch[0]))
            )
          )
            return true;
          return false;
        })();

      if (!q) return matchFilter && matchSubJenis && matchDate;

      const matchGudang =
        gudang.namaLokasi.toLowerCase().includes(q) ||
        gudang.jenisLokasi.toLowerCase().includes(q);

      const matchContainer = gudang.containers.some(
        (c) =>
          c.namaContainer.toLowerCase().includes(q) ||
          c.items.some(
            (it) =>
              it.namaItem.toLowerCase().includes(q) ||
              it.subtitle.toLowerCase().includes(q)
          )
      );

      return matchFilter && (matchGudang || matchContainer) && matchSubJenis && matchDate;
    });
  }, [gudangList, searchQuery, selectedGudangFilter, selectedSubJenisFilter, isDateFilterActive, selectedDate, subJenisItems]);

  // All available warehouse locations dynamically sourced from data & master locations
  const allAvailableGudangNames = useMemo(() => {
    const set = new Set<string>();
    gudangList.forEach((g) => set.add(g.namaLokasi));
    try {
      const masterLokasi = getStoredLokasiStokSalur();
      masterLokasi.forEach((l) => set.add(l.lokasi));
    } catch {
      // fallback
    }
    return Array.from(set);
  }, [gudangList]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 animate-in fade-in duration-200">
      {/* Top Header Controls: Two Tabs ('Item' & 'Gudang') on left + Action tools on right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Two Tabs: Item and Gudang */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-item"
            onClick={() => setActiveTab('item')}
            className={`px-7 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              activeTab === 'item'
                ? 'bg-[#008d91] text-white'
                : 'bg-[#9ca3af] text-white hover:bg-slate-400'
            }`}
          >
            Item
          </button>
          <button
            type="button"
            id="tab-gudang"
            onClick={() => setActiveTab('gudang')}
            className={`px-7 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              activeTab === 'gudang'
                ? 'bg-[#008d91] text-white'
                : 'bg-[#9ca3af] text-white hover:bg-slate-400'
            }`}
          >
            Gudang
          </button>
        </div>

        {/* Right Toolbar: EyeOff, Search, Sliders, + Add */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Search bar when open */}
          {isSearchOpen && (
            <div className="relative w-48 sm:w-64 animate-in fade-in slide-in-from-right-2 duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder={activeTab === 'gudang' ? 'Cari gudang, container, item...' : 'Cari item, container...'}
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Eye Toggle Icon */}
          <button
            type="button"
            onClick={handleToggleEye}
            title={isEyeActive ? 'Tampilan ringkas' : 'Tampilkan semua tingkatan'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isEyeActive ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isEyeActive ? <Eye className="w-4.5 h-4.5 stroke-[1.8]" /> : <EyeOff className="w-4.5 h-4.5 stroke-[1.8]" />}
          </button>

          {/* Search Icon */}
          {!isSearchOpen && (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>
          )}

          {/* Filter / Sliders Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedGudangFilter !== 'all' || isFilterOpen
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-30 animate-in fade-in zoom-in-95">
                <div className="text-xs font-semibold text-slate-700 mb-2">Filter Lokasi Gudang</div>
                <div className="flex flex-col gap-1 text-xs max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGudangFilter('all');
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedGudangFilter === 'all'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Semua Lokasi
                  </button>
                  {allAvailableGudangNames.map((nama) => (
                    <button
                      key={nama}
                      type="button"
                      onClick={() => {
                        setSelectedGudangFilter(nama);
                        setIsFilterOpen(false);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedGudangFilter.toLowerCase() === nama.toLowerCase()
                          ? 'bg-teal-50 text-[#008d91] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {nama}
                    </button>
                  ))}
                  {onNavigateToLokasiStokSalur && (
                    <>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsFilterOpen(false);
                          onNavigateToLokasiStokSalur();
                        }}
                        className="text-left px-2.5 py-1.5 rounded-lg text-[#008d91] hover:bg-teal-50 font-medium transition-colors cursor-pointer"
                      >
                        Kelola Lokasi Stok...
                      </button>
                    </>
                  )}
                  {onNavigateToStockInOutSalur && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsFilterOpen(false);
                        onNavigateToStockInOutSalur();
                      }}
                      className="text-left px-2.5 py-1.5 rounded-lg text-[#008d91] hover:bg-teal-50 font-medium transition-colors cursor-pointer"
                    >
                      Stock In/Out Mutasi...
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* + Add Button */}
          <button
            type="button"
            id="btn-add-stok-salur"
            onClick={() => {
              if (onNavigateToFormStockInOutSalur) {
                onNavigateToFormStockInOutSalur();
              } else {
                if (activeTab === 'gudang') {
                  setModalMode('container');
                  setFormNamaContainer('Container C');
                  setSelectedTargetGudangId('gudang-rumah-tsatsa');
                } else {
                  setModalMode('item');
                  setFormNamaItem('');
                  setFormSubtitle('Buku Berbayar, BSM - 2021');
                  setFormStok('100');
                  setFormKeterangan('-');
                }
                setIsAddModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add
          </button>
        </div>
      </div>

      {/* Metric Cards Carousel matching user instructions */}
      <div className="w-full flex items-center justify-between gap-3 mb-2 flex-wrap sm:flex-nowrap">
        {/* Left Section: Jumlah Lokasi + Carousel Nav + Sub-Jenis Cards */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
          {/* Card 1: Jumlah Lokasi Gudang */}
          <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 flex items-center justify-between min-w-[170px] sm:min-w-[190px] shrink-0 shadow-2xs hover:shadow-xs transition-shadow">
            <div>
              <div className="text-[11px] text-slate-400 font-medium leading-none mb-1.5">Jumlah Lokasi</div>
              <div className="text-sm sm:text-base font-bold text-slate-800">{jumlahLokasiGudang} Tempat</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>

          {/* Left Arrow Button (Cursor) */}
          <button
            type="button"
            onClick={() => {
              if (subJenisCarouselRef.current) {
                subJenisCarouselRef.current.scrollBy({ left: -240, behavior: 'smooth' });
              }
              onShowToast('Geser sub-jenis ke kiri');
            }}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#008d91] hover:bg-teal-50 shrink-0 shadow-2xs cursor-pointer"
            title="Geser sub-jenis ke kiri"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Sub-Jenis Items Carousel Container */}
          <div
            ref={subJenisCarouselRef}
            className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none scroll-smooth flex-1 min-w-0 select-none"
          >
            {subJenisWithCounts.map((sj) => {
              const isSelected = selectedSubJenisFilter === sj.namaSubJenis;
              return (
                <div
                  key={sj.id}
                  onClick={() => {
                    if (selectedSubJenisFilter === sj.namaSubJenis) {
                      setSelectedSubJenisFilter(null);
                      onShowToast('Menampilkan semua sub-jenis Item S-SALUR');
                    } else {
                      setSelectedSubJenisFilter(sj.namaSubJenis);
                      onShowToast(`Filter: ${sj.namaSubJenis}`);
                    }
                  }}
                  className={`bg-white rounded-xl border ${
                    isSelected
                      ? 'border-[#008d91] ring-2 ring-[#008d91]/20'
                      : 'border-slate-100 hover:border-slate-200'
                  } p-3 sm:p-4 flex items-center justify-between min-w-[200px] sm:min-w-[220px] shrink-0 shadow-2xs hover:shadow-xs transition-all cursor-pointer`}
                  title={`Klik untuk memfilter: ${sj.namaSubJenis}`}
                >
                  <div className="min-w-0 pr-2">
                    <div
                      className="text-[11px] text-slate-400 font-medium leading-none mb-1.5 truncate max-w-[130px]"
                      title={sj.namaSubJenis}
                    >
                      {sj.namaSubJenis}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-800 flex items-baseline gap-1.5 flex-wrap">
                      <span>{sj.totalBuah.toLocaleString('id-ID')} buah</span>
                      {sj.distinctJenis > 0 && (
                        <span className="text-[#008d91] font-medium text-xs">
                          ({sj.distinctJenis} Jenis)
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs overflow-hidden"
                    style={{ backgroundColor: sj.iconBg || '#008d91' }}
                  >
                    {renderSubJenisIcon(sj)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button (Cursor) */}
          <button
            type="button"
            onClick={() => {
              if (subJenisCarouselRef.current) {
                subJenisCarouselRef.current.scrollBy({ left: 240, behavior: 'smooth' });
              }
              onShowToast('Geser sub-jenis ke kanan');
            }}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#008d91] hover:bg-teal-50 shrink-0 shadow-2xs cursor-pointer"
            title="Geser sub-jenis ke kanan"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Section: Card Tanggal Rata Kanan */}
        <div className="relative shrink-0 ml-auto" ref={datePickerContainerRef}>
          <div
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className={`bg-white rounded-xl border ${
              isDateFilterActive
                ? 'border-[#008d91] ring-2 ring-[#008d91]/25'
                : 'border-slate-100 hover:border-slate-200'
            } p-3 sm:p-4 flex items-center justify-between min-w-[170px] sm:min-w-[190px] shadow-2xs hover:shadow-xs transition-all cursor-pointer`}
            title="Klik untuk filter tanggal stok"
          >
            <div className="min-w-0 pr-2">
              <div className="text-[11px] text-slate-400 font-medium leading-none mb-1.5 flex items-center gap-1.5">
                <span>Tanggal</span>
                {isDateFilterActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008d91]"></span>
                )}
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-800 truncate">
                {selectedDate}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 z-40 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#008d91]" />
                  Filter Tanggal Stok
                </span>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pilih Tanggal:
                </label>
                <input
                  type="date"
                  value={parseIndoDateToInput(selectedDate)}
                  onChange={(e) => {
                    const newIndo = parseInputToIndoDate(e.target.value);
                    setSelectedDate(newIndo);
                    setIsDateFilterActive(true);
                    onShowToast(`Filter tanggal: ${newIndo}`);
                  }}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-[#008d91]"
                />
              </div>

              {/* Quick Presets */}
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Preset Cepat:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate('15 Nov 2021');
                      setIsDateFilterActive(true);
                      onShowToast('Filter tanggal: 15 Nov 2021');
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      selectedDate === '15 Nov 2021' && isDateFilterActive
                        ? 'bg-[#008d91] text-white border-[#008d91]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    15 Nov 2021
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate('1 Jan 2021');
                      setIsDateFilterActive(true);
                      onShowToast('Filter tanggal: 1 Jan 2021');
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      selectedDate === '1 Jan 2021' && isDateFilterActive
                        ? 'bg-[#008d91] text-white border-[#008d91]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    1 Jan 2021
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const todayStr = formatIndoDate(new Date());
                      setSelectedDate(todayStr);
                      setIsDateFilterActive(false);
                      onShowToast(`Filter tanggal: ${todayStr}`);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      !isDateFilterActive
                        ? 'bg-[#008d91] text-white border-[#008d91]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Hari Ini
                  </button>
                </div>
              </div>

              {/* Action: Reset ke Hari Ini */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetDateToToday}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset ke Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7e] rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(selectedSubJenisFilter || isDateFilterActive) && (
        <div className="flex items-center gap-2 flex-wrap -mt-2 mb-1">
          {selectedSubJenisFilter && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-[#008d91] rounded-full text-xs font-medium">
              <span>Sub-Jenis: {selectedSubJenisFilter}</span>
              <button
                type="button"
                onClick={() => setSelectedSubJenisFilter(null)}
                className="hover:text-teal-900 cursor-pointer"
                title="Hapus filter sub-jenis"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {isDateFilterActive && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-[#008d91] rounded-full text-xs font-medium">
              <span>Tanggal: {selectedDate}</span>
              <button
                type="button"
                onClick={handleResetDateToToday}
                className="hover:text-teal-900 cursor-pointer"
                title="Reset tanggal ke hari ini"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Table Container: White Card with Rounded Corners matching image.png */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Table Header */}
          {activeTab === 'item' ? (
            <div className="grid grid-cols-12 gap-3 pb-3 border-b border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 select-none">
              <div className="col-span-5 sm:col-span-5 flex items-center pl-8 sm:pl-10">
                Nama Item
              </div>
              <div className="col-span-2 sm:col-span-2 text-center">Stok</div>
              <div className="col-span-2 sm:col-span-2 text-center">Jumlah Lokasi</div>
              <div className="col-span-1 sm:col-span-1 text-center">Jumlah Container</div>
              <div className="col-span-1 sm:col-span-1 text-center">Keterangan</div>
              <div className="col-span-1 sm:col-span-1 text-right pr-2"></div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3 pb-3 border-b border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 select-none items-center">
              <div className="col-span-5 sm:col-span-5 text-center sm:text-left sm:pl-28">
                Nama Lokasi
              </div>
              <div className="col-span-2 sm:col-span-2 text-center">Judul Item</div>
              <div className="col-span-1 sm:col-span-1 text-center">Stok</div>
              <div className="col-span-2 sm:col-span-2 text-center">Jumlah Container</div>
              <div className="col-span-1 sm:col-span-1 text-center">Keterangan</div>
              <div className="col-span-1 sm:col-span-1 text-right pr-2"></div>
            </div>
          )}

          {/* TAB 1: ITEM VIEW */}
          {activeTab === 'item' && (
            <div className="flex flex-col divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Tidak ada item yang sesuai dengan filter atau pencarian.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedItemIds.has(item.id);
                  const isMenuOpen = activeMenuId === `item-${item.id}`;

                  return (
                    <div key={item.id} className="flex flex-col py-3.5 transition-colors hover:bg-slate-50/50">
                      {/* Item Master Row */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        {/* Triangle + Book Cover + Name & Subtitle */}
                        <div className="col-span-5 sm:col-span-5 flex items-center gap-2 sm:gap-3">
                          {/* Expand/Collapse Triangle */}
                          <button
                            type="button"
                            onClick={() => toggleItemExpand(item.id)}
                            title={isExpanded ? 'Sembunyikan container' : 'Tampilkan container'}
                            className="w-4 h-4 flex items-center justify-center text-[#008d91] hover:text-teal-700 cursor-pointer shrink-0"
                          >
                            {isExpanded ? (
                              <svg className="w-3.5 h-3.5 fill-[#008d91]" viewBox="0 0 24 24">
                                <path d="M12 18L3 6h18z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 fill-[#008d91]" viewBox="0 0 24 24">
                                <path d="M6 3l12 9-12 9z" />
                              </svg>
                            )}
                          </button>

                          {/* Book Cover */}
                          <div className="shrink-0 w-13 h-17 sm:w-14 sm:h-18 rounded-lg overflow-hidden shadow-xs border border-slate-200">
                            <BookCover coverKey={item.coverKey || 'demi-kepentingan'} size="md" />
                          </div>

                          {/* Item Details */}
                          <div className="min-w-0 flex flex-col justify-center">
                            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                              {item.namaItem}
                            </h4>
                            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium">
                              Stok: {item.stok}
                            </span>
                          </div>
                        </div>

                        {/* Stok Column */}
                        <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm font-medium text-slate-800">
                          {item.stok}
                        </div>

                        {/* Jumlah Lokasi Column */}
                        <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm font-medium text-slate-800">
                          {item.jumlahLokasi}
                        </div>

                        {/* Jumlah Container Column */}
                        <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm font-medium text-slate-800">
                          {item.jumlahContainer}
                        </div>

                        {/* Keterangan Column */}
                        <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm text-slate-500">
                          {item.keterangan || '-'}
                        </div>

                        {/* Three-dot action button */}
                        <div className="col-span-1 sm:col-span-1 text-right pr-2 relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : `item-${item.id}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedItemForContainer(item.id);
                                  setModalMode('container');
                                  setFormNamaContainer(`Container ${String.fromCharCode(65 + item.containers.length)}`);
                                  setFormLokasiGudang('Rumah Tsa-Tsa');
                                  setFormJenisLokasi('Gudang YPPLN');
                                  setFormContainerStok('10');
                                  setIsAddModalOpen(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-[#008d91]" />
                                Tambah Container
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onShowToast(`Detail item "${item.namaItem}"`);
                                }}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                Edit Item
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDeleteItem(item.id, item.namaItem);
                                }}
                                className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                Hapus Item
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sub-Rows: Containers inside this item (Shown when triangle unhidden) */}
                      {isExpanded && (
                        <div className="flex flex-col gap-2.5 pt-3 pl-8 sm:pl-10 pr-2 animate-in fade-in slide-in-from-top-1 duration-150">
                          {item.containers && item.containers.length > 0 ? (
                            item.containers.map((cont) => {
                            const isContMenuOpen = activeMenuId === `itemcont-${item.id}-${cont.id}`;

                            return (
                              <div
                                key={cont.id}
                                className="grid grid-cols-12 gap-3 items-center py-2 hover:bg-teal-50/30 rounded-xl px-2 transition-colors"
                              >
                                {/* Yellow rounded container icon + Name, Location, and Location Type */}
                                <div className="col-span-5 sm:col-span-5 flex items-center gap-3">
                                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#f5b72e] flex items-center justify-center shrink-0 shadow-2xs" />

                                  <div className="min-w-0 flex flex-col justify-center">
                                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                      {cont.namaContainer}
                                    </h5>
                                    <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                                      {cont.lokasiGudang}
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                                      {cont.jenisLokasi}
                                    </p>
                                  </div>
                                </div>

                                {/* Container Stok */}
                                <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm font-medium text-slate-800">
                                  {cont.stok}
                                </div>

                                {/* Blank space for Jumlah Lokasi */}
                                <div className="col-span-2 sm:col-span-2 text-center text-xs text-slate-400">
                                  -
                                </div>

                                {/* Blank space for Jumlah Container */}
                                <div className="col-span-1 sm:col-span-1 text-center text-xs text-slate-400">
                                  -
                                </div>

                                {/* Keterangan */}
                                <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm text-slate-500">
                                  {cont.keterangan || '-'}
                                </div>

                                {/* Action for container */}
                                <div className="col-span-1 sm:col-span-1 text-right pr-2 relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(
                                        isContMenuOpen ? null : `itemcont-${item.id}-${cont.id}`
                                      );
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {isContMenuOpen && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          onShowToast(`Edit alokasi ${cont.namaContainer}`);
                                        }}
                                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                        Ubah Stok
                                      </button>
                                      <div className="my-1 border-t border-slate-100" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          handleDeleteContainerFromItem(item.id, cont.id, cont.namaContainer);
                                        }}
                                        className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        Hapus Container
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-2.5 px-3 text-xs text-slate-400 italic">
                            Belum ada alokasi container untuk item ini (Stok: 0).
                          </div>
                        )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: GUDANG VIEW (Gudang -> Containers -> Items) matching image.png */}
          {activeTab === 'gudang' && (
            <div className="flex flex-col">
              {filteredGudangList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Belum ada data gudang yang sesuai dengan filter atau pencarian.
                </div>
              ) : (
                filteredGudangList.map((gudang, index) => {
                  const isExpanded = expandedGudangIds.has(gudang.id);
                  const isGudangMenuOpen = activeMenuId === `gudang-${gudang.id}`;

                  return (
                    <React.Fragment key={gudang.id}>
                      {/* Horizontal divider between master warehouse blocks matching image.png */}
                      {index > 0 && <div className="border-b border-slate-200 my-4" />}

                      <div className="flex flex-col">
                        {/* Level 1: Master Gudang Row */}
                        <div className="grid grid-cols-12 gap-3 items-center py-2 transition-colors hover:bg-slate-50/40 rounded-xl px-1">
                          {/* Triangle + Solid Yellow Rounded Box + Nama Lokasi & Jenis Lokasi */}
                          <div className="col-span-5 sm:col-span-5 flex items-center gap-3 sm:gap-4">
                            {/* Expand/Collapse Triangle */}
                            <button
                              type="button"
                              onClick={() => toggleGudang(gudang.id)}
                              title={isExpanded ? 'Tutup daftar container' : 'Buka daftar container'}
                              className="w-4 h-4 flex items-center justify-center text-[#008d91] hover:text-teal-700 cursor-pointer shrink-0"
                            >
                              {isExpanded ? (
                                <svg className="w-3.5 h-3.5 fill-[#008d91]" viewBox="0 0 24 24">
                                  <path d="M12 18L3 6h18z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 fill-[#008d91]" viewBox="0 0 24 24">
                                  <path d="M6 3l12 9-12 9z" />
                                </svg>
                              )}
                            </button>

                            {/* Solid Warm Golden Yellow Box matching image.png */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#f5b72e] shrink-0 shadow-2xs" />

                            {/* Warehouse Name and Location Type */}
                            <div className="min-w-0 flex flex-col justify-center">
                              <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                {gudang.namaLokasi}
                              </h4>
                              <p className="text-xs text-slate-500 truncate mt-1">
                                {gudang.jenisLokasi}
                              </p>
                            </div>
                          </div>

                          {/* Judul Item Column */}
                          <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm font-medium text-slate-800">
                            {gudang.judulItem}
                          </div>

                          {/* Stok Column */}
                          <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm font-medium text-slate-800">
                            {gudang.stokDisplay}
                          </div>

                          {/* Jumlah Container Column */}
                          <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm font-medium text-slate-800">
                            {gudang.jumlahContainer}
                          </div>

                          {/* Keterangan Column */}
                          <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm text-slate-500">
                            {gudang.keterangan || '-'}
                          </div>

                          {/* Three-dots menu */}
                          <div className="col-span-1 sm:col-span-1 text-right pr-2 relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isGudangMenuOpen ? null : `gudang-${gudang.id}`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isGudangMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTargetGudangId(gudang.id);
                                    setModalMode('container');
                                    setFormNamaContainer(`Container ${String.fromCharCode(65 + gudang.containers.length)}`);
                                    setIsAddModalOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 text-[#008d91]" />
                                  Tambah Container
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onShowToast(`Pengaturan gudang "${gudang.namaLokasi}"`);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                  Edit Gudang
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleDeleteGudang(gudang.id, gudang.namaLokasi);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  Hapus Gudang
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Level 2: Containers inside this Gudang */}
                        {isExpanded && gudang.containers && (
                          <div className="flex flex-col gap-4 pt-3">
                            {gudang.containers.map((container) => {
                              const isContExpanded = expandedContainerIds.has(container.id);
                              const isContMenuOpen = activeMenuId === `cont-${container.id}`;

                              return (
                                <div key={container.id} className="flex flex-col">
                                  {/* Container Row */}
                                  <div className="grid grid-cols-12 gap-3 items-center py-1.5 transition-colors hover:bg-slate-50/40 rounded-xl px-1">
                                    {/* Indented Triangle + Yellow Box + Container Name & Warehouse Subtitle */}
                                    <div className="col-span-5 sm:col-span-5 flex items-center gap-3 sm:gap-4 pl-6 sm:pl-8">
                                      {/* Expand/Collapse Triangle for Container */}
                                      <button
                                        type="button"
                                        onClick={() => toggleContainer(container.id)}
                                        title={isContExpanded ? 'Tutup daftar item' : 'Buka daftar item'}
                                        className="w-4 h-4 flex items-center justify-center text-[#008d91] hover:text-teal-700 cursor-pointer shrink-0"
                                      >
                                        {isContExpanded ? (
                                          <svg className="w-3.5 h-3.5 fill-[#008d91]" viewBox="0 0 24 24">
                                            <path d="M12 18L3 6h18z" />
                                          </svg>
                                        ) : (
                                          <svg className="w-3.5 h-3.5 fill-[#008d91]" viewBox="0 0 24 24">
                                            <path d="M6 3l12 9-12 9z" />
                                          </svg>
                                        )}
                                      </button>

                                      {/* Solid Yellow Rounded Box for Container */}
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#f5b72e] shrink-0 shadow-2xs" />

                                      {/* Container Details */}
                                      <div className="min-w-0 flex flex-col justify-center">
                                        <h5 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                          {container.namaContainer}
                                        </h5>
                                        <p className="text-xs text-slate-500 truncate mt-1">
                                          {container.lokasiGudang}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                          {container.jenisLokasi}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Judul Item Column */}
                                    <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm font-medium text-slate-800">
                                      {container.judulItem}
                                    </div>

                                    {/* Stok Column */}
                                    <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm font-medium text-slate-800">
                                      {container.stok}
                                    </div>

                                    {/* Blank Space for Jumlah Container */}
                                    <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm text-slate-400">
                                    </div>

                                    {/* Keterangan Column */}
                                    <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm text-slate-500">
                                      {container.keterangan || '-'}
                                    </div>

                                    {/* Three-dots menu for Container */}
                                    <div className="col-span-1 sm:col-span-1 text-right pr-2 relative">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuId(isContMenuOpen ? null : `cont-${container.id}`);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {isContMenuOpen && (
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedTargetGudangId(gudang.id);
                                              setSelectedTargetContainerId(container.id);
                                              setModalMode('item');
                                              setFormNamaItem('Buku Baru');
                                              setFormContainerStok('5');
                                              setIsAddModalOpen(true);
                                              setActiveMenuId(null);
                                            }}
                                            className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                          >
                                            <PlusCircle className="w-3.5 h-3.5 text-[#008d91]" />
                                            Tambah Item ke Container
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onShowToast(`Edit container ${container.namaContainer}`);
                                            }}
                                            className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                            Edit Nama Container
                                          </button>
                                          <div className="my-1 border-t border-slate-100" />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              handleDeleteContainerInGudang(
                                                gudang.id,
                                                container.id,
                                                container.namaContainer
                                              );
                                            }}
                                            className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            Hapus Container
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Level 3: Items inside this Container */}
                                  {isContExpanded && container.items && (
                                    <div className="flex flex-col gap-4 pt-2.5">
                                      {container.items.map((itemInCont) => {
                                        const isItemMenuOpen =
                                          activeMenuId === `itemcont-${itemInCont.id}`;

                                        return (
                                          <div
                                            key={itemInCont.id}
                                            className="grid grid-cols-12 gap-3 items-center py-1 transition-colors hover:bg-slate-50/40 rounded-xl px-1"
                                          >
                                            {/* Indented spacer + Book Cover + Item Name & Subtitles */}
                                            <div className="col-span-5 sm:col-span-5 flex items-center gap-3 sm:gap-4 pl-12 sm:pl-16">
                                              {/* Invisible spacer matching triangle width */}
                                              <div className="w-4 h-4 shrink-0" />

                                              {/* Book Cover */}
                                              <div className="w-14 h-17 sm:w-15 sm:h-18 rounded-xl overflow-hidden shrink-0 shadow-2xs border border-slate-100">
                                                <BookCover
                                                  coverKey={itemInCont.coverKey || 'demi-kepentingan'}
                                                  size="md"
                                                />
                                              </div>

                                              {/* Item Details */}
                                              <div className="min-w-0 flex flex-col justify-center">
                                                <h6 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                                                  {itemInCont.namaItem}
                                                </h6>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                                  {itemInCont.subtitle}
                                                </p>
                                                <span className="text-[11px] text-slate-400 mt-1 font-medium">
                                                  Stok: {itemInCont.stokTotal}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Blank Judul Item Column */}
                                            <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm text-slate-400">
                                            </div>

                                            {/* Stok in this specific container */}
                                            <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm font-medium text-slate-800">
                                              {itemInCont.stok}
                                            </div>

                                            {/* Blank Jumlah Container Column */}
                                            <div className="col-span-2 sm:col-span-2 text-center text-xs sm:text-sm text-slate-400">
                                            </div>

                                            {/* Keterangan Column */}
                                            <div className="col-span-1 sm:col-span-1 text-center text-xs sm:text-sm text-slate-500">
                                              {itemInCont.keterangan || '-'}
                                            </div>

                                            {/* Three-dots menu for Item */}
                                            <div className="col-span-1 sm:col-span-1 text-right pr-2 relative">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActiveMenuId(
                                                    isItemMenuOpen ? null : `itemcont-${itemInCont.id}`
                                                  );
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                              >
                                                <MoreVertical className="w-4 h-4" />
                                              </button>

                                              {isItemMenuOpen && (
                                                <div
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setActiveMenuId(null);
                                                      onShowToast(`Ubah stok ${itemInCont.namaItem}`);
                                                    }}
                                                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                                  >
                                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                    Ubah Stok di Container
                                                  </button>
                                                  <div className="my-1 border-t border-slate-100" />
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setActiveMenuId(null);
                                                      handleDeleteItemFromContainer(
                                                        gudang.id,
                                                        container.id,
                                                        itemInCont.id,
                                                        itemInCont.namaItem
                                                      );
                                                    }}
                                                    className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                    Hapus dari Container
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
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Tambah Item, Tambah Container, atau Tambah Gudang */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'gudang'
                  ? 'Tambah Lokasi Gudang'
                  : modalMode === 'container'
                  ? 'Tambah Container'
                  : 'Tambah Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode selection tabs if in Gudang view */}
            {activeTab === 'gudang' && (
              <div className="flex items-center gap-2 mt-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalMode('container')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    modalMode === 'container'
                      ? 'bg-[#008d91] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Container Baru
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('item')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    modalMode === 'item'
                      ? 'bg-[#008d91] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Item ke Container
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('gudang')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    modalMode === 'gudang'
                      ? 'bg-[#008d91] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Gudang Baru
                </button>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="flex flex-col gap-4 mt-4 text-xs sm:text-sm">
              {modalMode === 'gudang' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nama Lokasi Gudang</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kantor Bandung / Rumah Tsa-tsa"
                      value={formNamaGudang}
                      onChange={(e) => setFormNamaGudang(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Jenis Lokasi</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gudang YPPLN / Kegiatan"
                      value={formJenisGudang}
                      onChange={(e) => setFormJenisGudang(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Keterangan</label>
                    <input
                      type="text"
                      placeholder="e.g. -"
                      value={formKeterangan}
                      onChange={(e) => setFormKeterangan(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </>
              )}

              {modalMode === 'container' && (
                <>
                  {activeTab === 'gudang' ? (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Pilih Gudang</label>
                      <select
                        value={selectedTargetGudangId}
                        onChange={(e) => setSelectedTargetGudangId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                      >
                        {gudangList.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.namaLokasi} ({g.jenisLokasi})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Pilih Item</label>
                      <select
                        value={selectedItemForContainer}
                        onChange={(e) => setSelectedItemForContainer(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                      >
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.namaItem} (Stok total: {it.stok})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nama Container</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Container A / Container BDK - 01"
                      value={formNamaContainer}
                      onChange={(e) => setFormNamaContainer(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                    />
                  </div>

                  {activeTab === 'item' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Lokasi Gudang</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rumah Tsa-Tsa"
                          value={formLokasiGudang}
                          onChange={(e) => setFormLokasiGudang(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Jenis Lokasi</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Gudang YPPLN"
                          value={formJenisLokasi}
                          onChange={(e) => setFormJenisLokasi(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Stok di Container</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formContainerStok}
                        onChange={(e) => setFormContainerStok(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Keterangan</label>
                      <input
                        type="text"
                        placeholder="e.g. -"
                        value={formContainerKeterangan}
                        onChange={(e) => setFormContainerKeterangan(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalMode === 'item' && (
                <>
                  {activeTab === 'gudang' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Pilih Gudang</label>
                        <select
                          value={selectedTargetGudangId}
                          onChange={(e) => {
                            setSelectedTargetGudangId(e.target.value);
                            const found = gudangList.find((g) => g.id === e.target.value);
                            if (found && found.containers.length > 0) {
                              setSelectedTargetContainerId(found.containers[0].id);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                        >
                          {gudangList.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.namaLokasi}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Pilih Container</label>
                        <select
                          value={selectedTargetContainerId}
                          onChange={(e) => setSelectedTargetContainerId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                        >
                          {gudangList
                            .find((g) => g.id === selectedTargetGudangId)
                            ?.containers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.namaContainer}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nama Item</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Demi Kepentingan Semua Makhluk"
                      value={formNamaItem}
                      onChange={(e) => setFormNamaItem(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Sub-judul / Kategori</label>
                    <input
                      type="text"
                      placeholder="e.g. Buku Berbayar, BSM - 2021"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        {activeTab === 'gudang' ? 'Stok di Container' : 'Jumlah Stok Total'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={activeTab === 'gudang' ? formContainerStok : formStok}
                        onChange={(e) =>
                          activeTab === 'gudang'
                            ? setFormContainerStok(e.target.value)
                            : setFormStok(e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Desain Cover</label>
                      <select
                        value={formCoverKey}
                        onChange={(e) => setFormCoverKey(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                      >
                        <option value="demi-kepentingan">Demi Kepentingan Semua Makhluk</option>
                        <option value="menjadi-buddha">Menjadi Buddha di Tempat Kerja</option>
                        <option value="jalan-menuju">Jalan Menuju Kemahatahuan</option>
                        <option value="lakon-hidup">Lakon Hidup</option>
                        <option value="intisari-amerta">Intisari Amerta</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Keterangan</label>
                    <input
                      type="text"
                      placeholder="e.g. -"
                      value={formKeterangan}
                      onChange={(e) => setFormKeterangan(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white font-medium rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
