import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  ShoppingCart,
  Globe,
  BookOpen,
  Smartphone,
  Shirt,
  FileText,
  Package,
  Calendar,
  X,
  Check,
  ArrowUpDown,
  TrendingUp,
  Download,
  Filter,
  UserCheck,
  Users,
  Send,
  ExternalLink,
  ListFilter,
  MessageSquare,
  FolderPlus,
  FolderInput,
} from 'lucide-react';
import { FunnelingActionBar } from './FunnelingActionBar';
import {
  INITIAL_SUB_JENIS_REPORT_OPTIONS,
  INITIAL_SALUR_ITEMS_OPTIONS,
  INITIAL_CUSTOMER_SALUR_REPORT,
  CustomerSalurReportItem,
  SubJenisReportConfig,
  SalurItemReportConfig,
  formatRupiah,
} from '../reportCustomerSalurData';

interface ReportCustomerSalurDashboardProps {
  onShowToast: (msg: string) => void;
  onNavigateToTransaksiSalur?: () => void;
  onKirimPM?: (targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
}

export const ReportCustomerSalurDashboard: React.FC<ReportCustomerSalurDashboardProps> = ({
  onShowToast,
  onNavigateToTransaksiSalur,
  onKirimPM,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
}) => {
  // Main Tab State: 'subJenis' or 'item'
  const [activeTab, setActiveTab] = useState<'subJenis' | 'item'>('item');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Privacy / Sensory Mode (Eye / EyeOff)
  const [isMasked, setIsMasked] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ===================== TAB 1: SUB-JENIS STATE =====================
  const [activeSubJenisNames, setActiveSubJenisNames] = useState<string[]>([
    'Buku Berbayar',
    'Buku Tidak Berbayar',
  ]);
  const [allSubJenisOptions] = useState<SubJenisReportConfig[]>(
    INITIAL_SUB_JENIS_REPORT_OPTIONS
  );
  const [isSubJenisModalOpen, setIsSubJenisModalOpen] = useState(false);
  const [tempSubJenisSelection, setTempSubJenisSelection] = useState<string[]>([]);

  // ===================== TAB 2: ITEM S-SALUR STATE =====================
  // User can choose which items to display
  const [activeItemNames, setActiveItemNames] = useState<string[]>([
    'Jalan Menuju Kemahatahuan',
    'Dhammapada Bergambar Edisi Koleksi',
  ]);
  const [allItemOptions] = useState<SalurItemReportConfig[]>(INITIAL_SALUR_ITEMS_OPTIONS);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [tempItemSelection, setTempItemSelection] = useState<string[]>([]);
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('Semua');
  const [itemSearchText, setItemSearchText] = useState<string>('');

  // ===================== SIAPA SAJA YANG PUNYA (OWNER FILTER) =====================
  // User can filter which owners/customers are displayed
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([
    'csr-1',
    'csr-2',
    'csr-3',
    'csr-4',
  ]);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [tempOwnerSelection, setTempOwnerSelection] = useState<string[]>([]);
  const [onlyShowOwnersWithTransactions, setOnlyShowOwnersWithTransactions] = useState(false);

  // ===================== PERIODE STATE =====================
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState('1 Jan 2021 - 15 Nov 2021');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  // ===================== YEAR COMPARISON STATE ("Buat perbandingan per tahun") =====================
  const [comparedYears, setComparedYears] = useState<number[]>([2021]); // default matches screenshot 2021
  const availableYears = [2020, 2021, 2022, 2023];

  // Customers data list
  const [customersData, setCustomersData] = useState<CustomerSalurReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('sapa_customer_salur_report_data_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMER_SALUR_REPORT;
  });

  // Action Menu Dropdown State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Customer Detailed Item Breakdown Modal
  const [selectedCustomerDetail, setSelectedCustomerDetail] =
    useState<CustomerSalurReportItem | null>(null);

  // Add Customer / Transaction Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    code: '',
    nama: '',
    panggilan: '',
    subJenis: 'Buku Berbayar',
    nominal: 10000000,
    qty: 100,
    tahun: 2021,
  });

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Save to localStorage when changed
  React.useEffect(() => {
    try {
      localStorage.setItem('sapa_customer_salur_report_data_v2', JSON.stringify(customersData));
    } catch (e) {
      console.error(e);
    }
  }, [customersData]);

  // Helper to render icon for Sub-Jenis or Item
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'globe':
        return <Globe className="w-4 h-4 text-white" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-white" />;
      case 'device':
        return <Smartphone className="w-4 h-4 text-white" />;
      case 'shirt':
        return <Shirt className="w-4 h-4 text-white" />;
      case 'file':
        return <FileText className="w-4 h-4 text-white" />;
      case 'package':
        return <Package className="w-4 h-4 text-white" />;
      case 'cart':
      default:
        return <ShoppingCart className="w-4 h-4 text-white" />;
    }
  };

  // Get SubJenis config by name
  const getSubJenisConfig = (nama: string): SubJenisReportConfig => {
    const found = allSubJenisOptions.find((s) => s.nama.toLowerCase() === nama.toLowerCase());
    if (found) return found;
    return {
      id: 'custom-' + nama,
      nama,
      kode: nama.slice(0, 3).toUpperCase(),
      iconType: 'cart',
    };
  };

  // Get Item config by name
  const getItemConfig = (nama: string): SalurItemReportConfig => {
    const found = allItemOptions.find((i) => i.nama.toLowerCase() === nama.toLowerCase());
    if (found) return found;
    return {
      id: 'custom-item-' + nama,
      nama,
      subJenis: 'Buku Berbayar',
      kode: nama.slice(0, 3).toUpperCase(),
      unit: 'buku',
      hargaSatuan: 100000,
      iconType: 'book',
    };
  };

  // Open Sub-Jenis picker modal
  const handleOpenSubJenisModal = () => {
    setTempSubJenisSelection([...activeSubJenisNames]);
    setIsSubJenisModalOpen(true);
  };

  const handleApplySubJenisSelection = () => {
    if (tempSubJenisSelection.length === 0) {
      onShowToast('Pilih minimal satu Sub-Jenis');
      return;
    }
    setActiveSubJenisNames(tempSubJenisSelection);
    setIsSubJenisModalOpen(false);
    onShowToast(`Sub-Jenis diperbarui: ${tempSubJenisSelection.length} dipilih`);
  };

  const handleRemoveSubJenisChip = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeSubJenisNames.length <= 1) {
      onShowToast('Minimal satu Sub-Jenis harus tetap ditampilkan');
      return;
    }
    const updated = activeSubJenisNames.filter((n) => n !== name);
    setActiveSubJenisNames(updated);
    onShowToast(`Sub-Jenis "${name}" dihilangkan dari tampilan`);
  };

  // Open Item S-SALUR picker modal
  const handleOpenItemModal = () => {
    setTempItemSelection([...activeItemNames]);
    setItemCategoryFilter('Semua');
    setItemSearchText('');
    setIsItemModalOpen(true);
  };

  const handleApplyItemSelection = () => {
    if (tempItemSelection.length === 0) {
      onShowToast('Pilih minimal satu Item S-SALUR');
      return;
    }
    setActiveItemNames(tempItemSelection);
    setIsItemModalOpen(false);
    onShowToast(`Item S-SALUR diperbarui: ${tempItemSelection.length} item dipilih`);
  };

  const handleRemoveItemChip = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeItemNames.length <= 1) {
      onShowToast('Minimal satu Item harus tetap ditampilkan');
      return;
    }
    const updated = activeItemNames.filter((n) => n !== name);
    setActiveItemNames(updated);
    onShowToast(`Item "${name}" dihilangkan dari tampilan`);
  };

  // Open Owner (Siapa Saja yang Punya) modal
  const handleOpenOwnerModal = () => {
    setTempOwnerSelection([...selectedOwnerIds]);
    setIsOwnerModalOpen(true);
  };

  const handleApplyOwnerSelection = () => {
    if (tempOwnerSelection.length === 0) {
      onShowToast('Pilih minimal satu pemilik/customer');
      return;
    }
    setSelectedOwnerIds(tempOwnerSelection);
    setIsOwnerModalOpen(false);
    onShowToast(`Filter pemilik diperbarui: ${tempOwnerSelection.length} pemilik dipilih`);
  };

  // Toggle year in comparison
  const handleToggleCompareYear = (year: number) => {
    if (comparedYears.includes(year)) {
      if (comparedYears.length === 1) {
        onShowToast('Minimal harus ada 1 tahun yang aktif');
        return;
      }
      setComparedYears(comparedYears.filter((y) => y !== year));
    } else {
      const updated = [...comparedYears, year].sort();
      setComparedYears(updated);
      onShowToast(`Menambahkan tahun ${year} dalam perbandingan`);
    }
  };

  // Mask string for privacy
  const maskText = (text: string) => {
    if (!isMasked) return text;
    if (text.length <= 4) return '****';
    return text.slice(0, 2) + '****' + text.slice(-2);
  };

  const maskMoney = (val: number) => {
    if (!isMasked) return formatRupiah(val);
    return 'Rp***.***.***';
  };

  const maskItem = (val: number, unit: string) => {
    if (!isMasked) return `${val} ${unit}`;
    return `*** ${unit}`;
  };

  // Calculate customer metrics based on activeTab
  const getCustomerMetrics = (cust: CustomerSalurReportItem) => {
    if (activeTab === 'subJenis') {
      // Metric for subJenis tab
      return {
        allTimeNominal: cust.allTime.nominal,
        allTimeQty: cust.allTime.itemQty,
        unit: cust.allTime.unit,
        getYearlyNominal: (yr: number) => cust.yearlyData[yr]?.nominal || 0,
        getYearlyQty: (yr: number) => cust.yearlyData[yr]?.itemQty || 0,
        hasSelectedItems: true,
        matchingItems: cust.itemBreakdown || [],
      };
    }

    // Metric for Item S-SALUR tab
    // Filter matching items owned by this customer
    const matchingItems = (cust.itemBreakdown || []).filter((it) =>
      activeItemNames.includes(it.namaItem)
    );

    const hasSelectedItems = matchingItems.length > 0;

    // Sum all-time nominal and qty for selected items
    const allTimeNominal = matchingItems.reduce((acc, it) => acc + (it.totalHarga || 0), 0);
    const allTimeQty = matchingItems.reduce((acc, it) => acc + (it.qty || 0), 0);

    const getYearlyNominal = (yr: number) => {
      return matchingItems.reduce((acc, it) => {
        return acc + (it.yearly?.[yr]?.totalHarga || 0);
      }, 0);
    };

    const getYearlyQty = (yr: number) => {
      return matchingItems.reduce((acc, it) => {
        return acc + (it.yearly?.[yr]?.qty || 0);
      }, 0);
    };

    return {
      allTimeNominal,
      allTimeQty,
      unit: matchingItems[0]?.unit || 'buku',
      getYearlyNominal,
      getYearlyQty,
      hasSelectedItems,
      matchingItems,
    };
  };

  // Filtered customer items
  const filteredCustomers = useMemo(() => {
    return customersData.filter((cust) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          cust.customerCode.toLowerCase().includes(q) ||
          cust.namaLengkap.toLowerCase().includes(q) ||
          cust.panggilan.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      // Owner (Siapa Saja yang Punya) filter
      if (!selectedOwnerIds.includes(cust.id)) {
        return false;
      }

      // In Item tab, if onlyShowOwnersWithTransactions is true, only show owners with transactions > 0
      if (activeTab === 'item') {
        const metrics = getCustomerMetrics(cust);
        if (onlyShowOwnersWithTransactions && !metrics.hasSelectedItems) {
          return false;
        }
      }

      return true;
    });
  }, [
    customersData,
    searchQuery,
    selectedOwnerIds,
    activeTab,
    activeItemNames,
    onlyShowOwnersWithTransactions,
  ]);

  const isAllSelected =
    filteredCustomers.length > 0 &&
    selectedCustomerIds.length === filteredCustomers.length;

  const handleToggleSelect = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map((c) => c.id));
    }
  };

  const getSelectedTargetItems = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedCustomerIds;
    const targetCusts = customersData.filter((c) => idsToUse.includes(c.id));
    return targetCusts.map((c) => ({
      id: c.customerCode || c.id,
      identitasId: c.customerCode,
      nama: c.namaLengkap,
      nomorHp: '-',
      codeId: c.customerCode,
    }));
  };

  const handleBulkCreateGroupFunneling = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    const ids = targets.map((t) => t.identitasId).filter(Boolean);
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
    const idsToUse = overrideIds || selectedCustomerIds;
    if (idsToUse.length === 0) return;
    const targets = getSelectedTargetItems(idsToUse);
    if (onKirimPM) {
      onKirimPM(targets);
    }
  };

  // Handle Add Form submit
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.nama.trim()) {
      onShowToast('Nama customer wajib diisi');
      return;
    }

    const initials =
      newCustomerForm.nama
        .trim()
        .split(' ')
        .map((w) => w[0])
        .slice(0, 1)
        .join('')
        .toUpperCase() || 'C';

    const newCode = newCustomerForm.code.trim() || `00${Math.floor(100 + Math.random() * 900)}`;

    const newItem: CustomerSalurReportItem = {
      id: 'csr-' + Date.now(),
      customerCode: newCode,
      namaLengkap: newCustomerForm.nama.trim(),
      panggilan: newCustomerForm.panggilan.trim() || newCustomerForm.nama.trim(),
      avatarInitial: initials,
      avatarBg: '#0284c7',
      allTime: {
        nominal: Number(newCustomerForm.nominal) || 10000000,
        itemQty: Number(newCustomerForm.qty) || 100,
        unit: 'buku',
      },
      yearlyData: {
        2020: {
          nominal: Math.round((Number(newCustomerForm.nominal) || 10000000) * 0.8),
          itemQty: Math.round((Number(newCustomerForm.qty) || 100) * 0.8),
          unit: 'buku',
        },
        2021: {
          nominal: Number(newCustomerForm.nominal) || 10000000,
          itemQty: Number(newCustomerForm.qty) || 100,
          unit: 'buku',
        },
        2022: {
          nominal: Math.round((Number(newCustomerForm.nominal) || 10000000) * 1.2),
          itemQty: Math.round((Number(newCustomerForm.qty) || 100) * 1.2),
          unit: 'buku',
        },
        2023: {
          nominal: Math.round((Number(newCustomerForm.nominal) || 10000000) * 1.35),
          itemQty: Math.round((Number(newCustomerForm.qty) || 100) * 1.35),
          unit: 'buku',
        },
      },
      itemBreakdown: [
        {
          namaItem: activeItemNames[0] || 'Jalan Menuju Kemahatahuan',
          subJenis: 'Buku Berbayar',
          qty: Number(newCustomerForm.qty) || 100,
          unit: 'buku',
          totalHarga: Number(newCustomerForm.nominal) || 10000000,
          yearly: {
            2020: {
              qty: Math.round((Number(newCustomerForm.qty) || 100) * 0.8),
              totalHarga: Math.round((Number(newCustomerForm.nominal) || 10000000) * 0.8),
              unit: 'buku',
            },
            2021: {
              qty: Number(newCustomerForm.qty) || 100,
              totalHarga: Number(newCustomerForm.nominal) || 10000000,
              unit: 'buku',
            },
            2022: {
              qty: Math.round((Number(newCustomerForm.qty) || 100) * 1.2),
              totalHarga: Math.round((Number(newCustomerForm.nominal) || 10000000) * 1.2),
              unit: 'buku',
            },
            2023: {
              qty: Math.round((Number(newCustomerForm.qty) || 100) * 1.35),
              totalHarga: Math.round((Number(newCustomerForm.nominal) || 10000000) * 1.35),
              unit: 'buku',
            },
          },
        },
      ],
    };

    setCustomersData([newItem, ...customersData]);
    setSelectedOwnerIds([...selectedOwnerIds, newItem.id]);
    setIsAddModalOpen(false);
    onShowToast(`Customer "${newItem.namaLengkap}" berhasil ditambahkan`);
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    setCustomersData(customersData.filter((c) => c.id !== id));
    setSelectedOwnerIds(selectedOwnerIds.filter((i) => i !== id));
    onShowToast(`Data customer "${name}" dihapus dari report`);
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen p-2 sm:p-4 md:p-6 text-slate-800">
      {/* Outer Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Top Control Bar: Tabs on left, Actions on right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Pill Tabs: Report Sub-Jenis & Report Item S-SALUR */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('subJenis');
                onShowToast('Beralih ke tab Report Sub-Jenis');
              }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                activeTab === 'subJenis'
                  ? 'bg-[#008d91] text-white shadow-md'
                  : 'bg-[#9ca3af] text-white hover:bg-slate-500'
              }`}
            >
              Report Sub-Jenis
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('item');
                onShowToast('Beralih ke tab Report Item S-SALUR');
              }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                activeTab === 'item'
                  ? 'bg-[#008d91] text-white shadow-md'
                  : 'bg-[#9ca3af] text-white hover:bg-slate-500'
              }`}
            >
              Report Item S-SALUR
            </button>
          </div>

          {/* Action Icons: Eye, Search, Filter, + Add */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Eye / EyeOff Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsMasked(!isMasked);
                onShowToast(isMasked ? 'Data sensor dinonaktifkan' : 'Data disensor untuk privasi');
              }}
              title={isMasked ? 'Tampilkan data' : 'Sensor data'}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isMasked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Search Icon / Input */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 animate-in fade-in">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari customer / kode..."
                    className="bg-transparent text-xs sm:text-sm outline-hidden w-36 sm:w-48 text-slate-700"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  title="Cari customer"
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* SlidersHorizontal (Filter / Perbandingan tahun settings) */}
            <button
              type="button"
              onClick={() => setIsPeriodModalOpen(true)}
              title="Pengaturan Filter & Periode"
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Bulk Action buttons when selected */}
            {selectedCustomerIds.length > 0 && (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => handleBulkCreateGroupFunneling()}
                  className="bg-[#008d91] hover:bg-[#007679] text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Create Group Funneling"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Group Funneling ({selectedCustomerIds.length})</span>
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

            {/* + Add Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#008d91] hover:bg-[#05828e] text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Filter Row: Dynamic Carousel for Sub-Jenis or Item + Owner Filter + Periode Card */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-1">
          {/* Left: Carousel with Navigation Arrows + Filter Chips + Plus Button */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap overflow-x-auto pb-1">
            {/* Left arrow */}
            <button
              type="button"
              onClick={() => onShowToast('Geser filter ke kiri')}
              className="w-6 h-6 shrink-0 rounded-full bg-[#008d91] hover:bg-[#047276] text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* TAB 1: Sub-Jenis Chips */}
            {activeTab === 'subJenis' &&
              activeSubJenisNames.map((nama) => {
                const conf = getSubJenisConfig(nama);
                return (
                  <div
                    key={nama}
                    className="group relative bg-white border border-slate-200 hover:border-[#008d91]/50 rounded-2xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs transition-all shrink-0 cursor-default"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">
                        Sub-Jenis Item S-SALUR
                      </span>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                        {nama}
                      </span>
                    </div>

                    {/* Icon Square */}
                    <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center shadow-xs shrink-0">
                      {renderIcon(conf.iconType)}
                    </div>

                    {/* Remove hover button */}
                    {activeSubJenisNames.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSubJenisChip(nama, e)}
                        title={`Hapus ${nama}`}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

            {/* TAB 2: Item S-SALUR Chips ("Bisa memilih Item apa yang mau dimunculkan") */}
            {activeTab === 'item' &&
              activeItemNames.map((nama) => {
                const itemConf = getItemConfig(nama);
                return (
                  <div
                    key={nama}
                    className="group relative bg-white border border-slate-200 hover:border-[#008d91]/50 rounded-2xl px-4 py-2.5 flex items-center gap-3.5 shadow-xs transition-all shrink-0 cursor-default"
                  >
                    <div className="flex flex-col max-w-[180px] sm:max-w-[220px]">
                      <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">
                        Item S-SALUR
                      </span>
                      <span
                        className="text-xs sm:text-[13px] font-bold text-slate-800 truncate"
                        title={nama}
                      >
                        {nama}
                      </span>
                    </div>

                    {/* Icon Square */}
                    <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center shadow-xs shrink-0">
                      {renderIcon(itemConf.iconType)}
                    </div>

                    {/* Remove hover button */}
                    {activeItemNames.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveItemChip(nama, e)}
                        title={`Hapus ${nama}`}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

            {/* Plus (+) Button to choose/add Sub-Jenis or Item */}
            <button
              type="button"
              onClick={activeTab === 'subJenis' ? handleOpenSubJenisModal : handleOpenItemModal}
              title={
                activeTab === 'subJenis'
                  ? 'Pilih Sub-Jenis yang mau dimunculkan'
                  : 'Pilih Item S-SALUR yang mau dimunculkan'
              }
              className="w-7 h-7 shrink-0 rounded-full bg-[#008d91] hover:bg-[#047276] text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Right arrow */}
            <button
              type="button"
              onClick={() => onShowToast('Geser filter ke kanan')}
              className="w-6 h-6 shrink-0 rounded-full bg-[#008d91] hover:bg-[#047276] text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              title="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Right Section: Pemilik / Customer Card ("dan siapa saja yang punya") + Periode Card */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap self-start lg:self-auto">
            {/* Siapa Saja yang Punya (Customer / Pemilik Filter Card) */}
            <div
              onClick={handleOpenOwnerModal}
              className="bg-white border border-slate-200 hover:border-[#008d91]/60 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs shrink-0 cursor-pointer transition-all"
              title="Klik untuk memilih siapa saja yang punya (Customer)"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">
                  Pemilik / Customer
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                  {selectedOwnerIds.length === customersData.length
                    ? `Semua Pemilik (${customersData.length})`
                    : `${selectedOwnerIds.length} Pemilik Terpilih`}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center shadow-xs shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Periode Card */}
            <div
              onClick={() => setIsPeriodModalOpen(true)}
              className="bg-white border border-slate-200 hover:border-[#008d91]/60 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-xs shrink-0 cursor-pointer transition-all"
              title="Klik untuk ubah periode atau perbandingan tahun"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">
                  Periode
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                  {selectedPeriodLabel}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center shadow-xs shrink-0">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Year Comparison Bar: "Buat perbandingan per tahun" */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Perbandingan Tahun:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableYears.map((year) => {
                const isSelected = comparedYears.includes(year);
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleToggleCompareYear(year)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#008d91] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{year}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {activeTab === 'item' && (
              <button
                type="button"
                onClick={handleOpenItemModal}
                className="text-[#008d91] hover:underline font-semibold cursor-pointer"
              >
                {activeItemNames.length} item aktif • Kelola Item
              </button>
            )}
            {comparedYears.length > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                Mode Perbandingan ({comparedYears.join(' vs ')})
              </span>
            )}
          </div>
        </div>

        {/* Table Content: Matches UI in screenshot identically */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-700 text-sm font-semibold">
                <th className="py-4 pl-4 pr-1 text-center w-12">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isAllSelected
                        ? 'bg-[#008d91] border-[#008d91] text-white'
                        : selectedCustomerIds.length > 0
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                        : 'border-slate-300 bg-white hover:border-[#008d91]'
                    }`}
                    title="Pilih Semua"
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {!isAllSelected && selectedCustomerIds.length > 0 && (
                      <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4 pl-2 font-bold w-[300px]">Nama</th>
                <th className="py-4 px-4 text-center font-bold">Transaksi All Time</th>
                <th className="py-4 px-4 text-center font-bold">Item All Time</th>

                {/* Single Year (default 2021) matches screenshot headers: "Transaksi 2021" & "Transaksi 2021" */}
                {comparedYears.length === 1 && (
                  <>
                    <th className="py-4 px-4 text-center font-bold">
                      Transaksi {comparedYears[0]}
                    </th>
                    <th className="py-4 px-4 text-center font-bold">
                      Transaksi {comparedYears[0]}
                    </th>
                  </>
                )}

                {/* Multiple Years: Dynamic comparison columns per year */}
                {comparedYears.length > 1 &&
                  comparedYears.map((yr) => (
                    <React.Fragment key={yr}>
                      <th className="py-4 px-3 text-center font-bold bg-slate-50/50">
                        Transaksi {yr}
                      </th>
                      <th className="py-4 px-3 text-center font-bold bg-slate-50/50">
                        Item {yr}
                      </th>
                    </React.Fragment>
                  ))}

                <th className="py-4 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + comparedYears.length * 2}
                    className="py-12 text-center text-slate-400"
                  >
                    Tidak ada customer ditemukan untuk filter item atau pemilik yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const metrics = getCustomerMetrics(cust);
                  const isMenuOpen = activeMenuId === cust.id;
                  const isSelected = selectedCustomerIds.includes(cust.id);

                  return (
                    <tr
                      key={cust.id}
                      className={`hover:bg-slate-50/60 transition-colors group ${
                        isSelected ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {/* Select Checkbox Column */}
                      <td className="py-4 pl-4 pr-1 text-center align-middle w-12">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(cust.id);
                          }}
                          className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#008d91] border-[#008d91] text-white'
                              : 'border-slate-300 bg-white hover:border-[#008d91]'
                          }`}
                          title={isSelected ? 'Batal pilih' : 'Pilih customer ini'}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Column 1: Nama with Circle Avatar + Code/Name + Nickname + Active Item Badges */}
                      <td className="py-4 px-4 pl-2">
                        <div className="flex items-center gap-3.5">
                          {/* Avatar Circle */}
                          <div
                            style={{ backgroundColor: cust.avatarBg }}
                            className="w-12 h-12 rounded-full text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs"
                          >
                            {cust.avatarInitial}
                          </div>

                          {/* Names & Subtitle */}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                              {cust.customerCode} {maskText(cust.namaLengkap)}
                            </span>
                            <span className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5">
                              {maskText(cust.panggilan)}
                            </span>

                            {/* In Item Tab: show tags of items owned */}
                            {activeTab === 'item' && (
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {metrics.matchingItems.length > 0 ? (
                                  metrics.matchingItems.slice(0, 2).map((it) => (
                                    <span
                                      key={it.namaItem}
                                      className="text-[10px] bg-teal-50 text-[#008d91] px-1.5 py-0.5 rounded font-medium truncate max-w-[140px]"
                                      title={`${it.namaItem}: ${it.qty} ${it.unit}`}
                                    >
                                      {it.namaItem} ({it.qty})
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">
                                    Belum ada transaksi item terpilih
                                  </span>
                                )}
                                {metrics.matchingItems.length > 2 && (
                                  <span className="text-[10px] text-slate-400">
                                    +{metrics.matchingItems.length - 2} item
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Transaksi All Time */}
                      <td className="py-4 px-4 text-center font-normal text-slate-800 text-sm sm:text-[15px]">
                        {maskMoney(metrics.allTimeNominal)}
                      </td>

                      {/* Column 3: Item All Time */}
                      <td className="py-4 px-4 text-center font-normal text-slate-800 text-sm sm:text-[15px]">
                        {maskItem(metrics.allTimeQty, metrics.unit)}
                      </td>

                      {/* Single Year Mode (default 2021) */}
                      {comparedYears.length === 1 && (
                        <>
                          <td className="py-4 px-4 text-center font-normal text-slate-800 text-sm sm:text-[15px]">
                            {maskMoney(metrics.getYearlyNominal(comparedYears[0]))}
                          </td>
                          <td className="py-4 px-4 text-center font-normal text-slate-800 text-sm sm:text-[15px]">
                            {maskItem(metrics.getYearlyQty(comparedYears[0]), metrics.unit)}
                          </td>
                        </>
                      )}

                      {/* Comparison Mode: Multiple Years */}
                      {comparedYears.length > 1 &&
                        comparedYears.map((yr) => (
                          <React.Fragment key={yr}>
                            <td className="py-4 px-3 text-center font-normal text-slate-800 bg-slate-50/30 text-sm sm:text-[15px]">
                              {maskMoney(metrics.getYearlyNominal(yr))}
                            </td>
                            <td className="py-4 px-3 text-center font-normal text-slate-800 bg-slate-50/30 text-sm sm:text-[15px]">
                              {maskItem(metrics.getYearlyQty(yr), metrics.unit)}
                            </td>
                          </React.Fragment>
                        ))}

                      {/* 3-Dots Action Menu */}
                      <td className="py-4 px-2 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : cust.id);
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 top-12 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 w-56 z-30 text-xs text-slate-700 animate-in fade-in"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleBulkCreateGroupFunneling([cust.id]);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <FolderPlus className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Create Group Funneling</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleBulkTambahKeGroupExisting([cust.id]);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <FolderInput className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Tambah ke Existing</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleKirimPM([cust.id]);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-[#008d91] flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Kirim PM ke Customer Ini</span>
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setSelectedCustomerDetail(cust);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Detail Item Dimiliki</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onShowToast(`Melihat detail transaksi ${cust.namaLengkap}`);
                                if (onNavigateToTransaksiSalur) onNavigateToTransaksiSalur();
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Lihat Transaksi S-SALUR</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onShowToast(`Pesan broadcast disiapkan untuk ${cust.namaLengkap}`);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-500" />
                              <span>Kirim Pesan S-SAPA</span>
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDeleteCustomer(cust.id, cust.namaLengkap);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Hapus dari Report</span>
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
          selectedCount={selectedCustomerIds.length}
          itemLabel="customer"
          onClearSelection={() => setSelectedCustomerIds([])}
          onCreateGroupFunneling={() => handleBulkCreateGroupFunneling()}
          onTambahKeGroupExisting={() => handleBulkTambahKeGroupExisting()}
          onKirimPM={onKirimPM ? () => handleKirimPM() : undefined}
        />
      </div>

      {/* Modal 1: Pilih Sub-Jenis Yang Mau Dimunculkan */}
      {isSubJenisModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Pilih Sub-Jenis yang Dimunculkan
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih Sub-Jenis Item S-SALUR untuk ditampilkan di filter tab.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubJenisModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Jenis Checklist */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {allSubJenisOptions.map((opt) => {
                const isChecked = tempSubJenisSelection.includes(opt.nama);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-[#008d91] bg-teal-50/40 text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center shadow-xs">
                        {renderIcon(opt.iconType)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{opt.nama}</span>
                        <span className="text-[10px] text-slate-400">Kode: {opt.kode}</span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempSubJenisSelection([...tempSubJenisSelection, opt.nama]);
                        } else {
                          setTempSubJenisSelection(
                            tempSubJenisSelection.filter((n) => n !== opt.nama)
                          );
                        }
                      }}
                      className="w-4 h-4 text-[#008d91] rounded border-slate-300 focus:ring-[#008d91] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubJenisModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplySubJenisSelection}
                className="px-4 py-2 text-xs font-semibold bg-[#008d91] hover:bg-[#05828e] text-white rounded-lg shadow-xs cursor-pointer"
              >
                Terapkan Sub-Jenis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Pilih Item S-SALUR Yang Mau Dimunculkan ("Bisa memilih Item apa yang mau dimunculkan") */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Pilih Item S-SALUR yang Dimunculkan
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih item barang/buku untuk ditampilkan di filter tab dan dihitung dalam laporan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Category Filter inside modal */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={itemSearchText}
                  onChange={(e) => setItemSearchText(e.target.value)}
                  placeholder="Cari judul buku atau nama item..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-[#008d91]"
                />
              </div>

              {/* Sub-jenis filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Buku Berbayar', 'Buku Tidak Berbayar', 'T-Shirt', 'Note Book'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setItemCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                        itemCategoryFilter === cat
                          ? 'bg-[#008d91] text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Select all / Deselect all */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-500">
              <span>{tempItemSelection.length} item dipilih</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTempItemSelection(allItemOptions.map((i) => i.nama))}
                  className="text-[#008d91] hover:underline font-semibold cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setTempItemSelection([])}
                  className="text-slate-400 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* Items Checklist */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {allItemOptions
                .filter((item) => {
                  if (itemCategoryFilter !== 'Semua' && item.subJenis !== itemCategoryFilter) {
                    return false;
                  }
                  if (itemSearchText.trim()) {
                    return item.nama.toLowerCase().includes(itemSearchText.toLowerCase());
                  }
                  return true;
                })
                .map((item) => {
                  const isChecked = tempItemSelection.includes(item.nama);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#008d91] bg-teal-50/40 text-slate-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center shadow-xs shrink-0">
                          {renderIcon(item.iconType)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{item.nama}</span>
                          <span className="text-[11px] text-slate-500">
                            {item.subJenis} • Satuan: {item.unit}
                          </span>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempItemSelection([...tempItemSelection, item.nama]);
                          } else {
                            setTempItemSelection(
                              tempItemSelection.filter((n) => n !== item.nama)
                            );
                          }
                        }}
                        className="w-4 h-4 text-[#008d91] rounded border-slate-300 focus:ring-[#008d91] cursor-pointer"
                      />
                    </label>
                  );
                })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyItemSelection}
                className="px-4 py-2 text-xs font-semibold bg-[#008d91] hover:bg-[#05828e] text-white rounded-lg shadow-xs cursor-pointer"
              >
                Terapkan Item ({tempItemSelection.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Pilih Siapa Saja Yang Punya ("dan siapa saja yang punya") */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Pilih Siapa Saja yang Punya
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan customer atau pemilik yang ingin dimunculkan dalam tabel laporan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOwnerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-500">
              <span>{tempOwnerSelection.length} pemilik dipilih</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTempOwnerSelection(customersData.map((c) => c.id))}
                  className="text-[#008d91] hover:underline font-semibold cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setTempOwnerSelection([])}
                  className="text-slate-400 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* Toggle Only Show Owners with Transactions */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer">
              <span className="font-semibold text-slate-700">
                Hanya tampilkan pemilik dengan transaksi &gt; 0
              </span>
              <input
                type="checkbox"
                checked={onlyShowOwnersWithTransactions}
                onChange={(e) => setOnlyShowOwnersWithTransactions(e.target.checked)}
                className="w-4 h-4 text-[#008d91] rounded border-slate-300 focus:ring-[#008d91] cursor-pointer"
              />
            </label>

            {/* Owners Checklist */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {customersData.map((cust) => {
                const isChecked = tempOwnerSelection.includes(cust.id);
                return (
                  <label
                    key={cust.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-[#008d91] bg-teal-50/40 text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: cust.avatarBg }}
                        className="w-9 h-9 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
                      >
                        {cust.avatarInitial}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          {cust.customerCode} {cust.namaLengkap}
                        </span>
                        <span className="text-[11px] text-slate-500">{cust.panggilan}</span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempOwnerSelection([...tempOwnerSelection, cust.id]);
                        } else {
                          setTempOwnerSelection(tempOwnerSelection.filter((id) => id !== cust.id));
                        }
                      }}
                      className="w-4 h-4 text-[#008d91] rounded border-slate-300 focus:ring-[#008d91] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOwnerModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyOwnerSelection}
                className="px-4 py-2 text-xs font-semibold bg-[#008d91] hover:bg-[#05828e] text-white rounded-lg shadow-xs cursor-pointer"
              >
                Terapkan Pemilik ({tempOwnerSelection.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Pilih Periode & Perbandingan Tahun */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Pilih Periode & Perbandingan Tahun
                </h3>
                <p className="text-xs text-slate-500">
                  Atur rentang waktu laporan dan aktifkan perbandingan per tahun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preset Period Buttons */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">Preset Periode:</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: '1 Jan 2021 - 15 Nov 2021 (Default)', yr: 2021 },
                  { label: 'Tahun 2021 Penuh (1 Jan - 31 Des 2021)', yr: 2021 },
                  { label: 'Tahun 2022 Penuh (1 Jan - 31 Des 2022)', yr: 2022 },
                  { label: 'Tahun 2023 Penuh (1 Jan - 31 Des 2023)', yr: 2023 },
                  { label: 'Semua Waktu (All Time)', yr: 2021 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setSelectedPeriodLabel(item.label.split(' (')[0]);
                      setComparedYears([item.yr]);
                      onShowToast(`Periode diatur: ${item.label.split(' (')[0]}`);
                      setIsPeriodModalOpen(false);
                    }}
                    className={`text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedPeriodLabel.includes(item.label.split(' (')[0])
                        ? 'border-[#008d91] bg-teal-50/50 text-[#008d91] font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Yearly comparison selection */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">
                Pilih Tahun yang Mau Dibandingkan:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableYears.map((yr) => {
                  const isChecked = comparedYears.includes(yr);
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleToggleCompareYear(yr)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#008d91] border-[#008d91] text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#008d91] text-white rounded-lg cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Customer Detailed Item Breakdown */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: selectedCustomerDetail.avatarBg }}
                  className="w-10 h-10 rounded-full text-white font-bold text-base flex items-center justify-center shadow-xs"
                >
                  {selectedCustomerDetail.avatarInitial}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {selectedCustomerDetail.customerCode} {selectedCustomerDetail.namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCustomerDetail.panggilan} • Rincian Item S-SALUR & Perbandingan Tahun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table of items */}
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Nama Item</th>
                    <th className="py-2.5 px-3 font-semibold">Sub-Jenis</th>
                    <th className="py-2.5 px-2 text-center font-semibold">2020</th>
                    <th className="py-2.5 px-2 text-center font-semibold">2021</th>
                    <th className="py-2.5 px-2 text-center font-semibold">2022</th>
                    <th className="py-2.5 px-2 text-center font-semibold">2023</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Total Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedCustomerDetail.itemBreakdown || []).map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{it.namaItem}</td>
                      <td className="py-2.5 px-3 text-slate-500">{it.subJenis}</td>
                      <td className="py-2.5 px-2 text-center text-slate-700">
                        {it.yearly?.[2020]?.qty || 0} {it.unit}
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-[#008d91]">
                        {it.yearly?.[2021]?.qty || 0} {it.unit}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-700">
                        {it.yearly?.[2022]?.qty || 0} {it.unit}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-700">
                        {it.yearly?.[2023]?.qty || 0} {it.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                        {formatRupiah(it.totalHarga)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Total All Time:{' '}
                <strong className="text-slate-800">
                  {formatRupiah(selectedCustomerDetail.allTime.nominal)}
                </strong>{' '}
                ({selectedCustomerDetail.allTime.itemQty} {selectedCustomerDetail.allTime.unit})
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomerDetail(null)}
                className="px-4 py-2 bg-[#008d91] text-white rounded-lg font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Add Customer Report / Transaction */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Tambah Data Customer S-SALUR
                </h3>
                <p className="text-xs text-slate-500">
                  Masukkan data transaksi customer baru ke dalam report.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kode Customer (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 00045"
                  value={newCustomerForm.code}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, code: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-[#008d91]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Customer <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newCustomerForm.nama}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, nama: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-[#008d91]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Panggilan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Ko Budi"
                  value={newCustomerForm.panggilan}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, panggilan: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaksi (Rp):</label>
                  <input
                    type="number"
                    value={newCustomerForm.nominal}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        nominal: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-[#008d91]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah Item (Buku):
                  </label>
                  <input
                    type="number"
                    value={newCustomerForm.qty}
                    onChange={(e) =>
                      setNewCustomerForm({
                        ...newCustomerForm,
                        qty: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-[#008d91]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#008d91] hover:bg-[#05828e] text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
