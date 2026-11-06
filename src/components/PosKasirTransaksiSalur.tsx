import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  Sparkles,
  User,
  Users,
  Boxes,
  Truck,
  Tag,
  Hash,
  CreditCard,
  Printer,
  ArrowRight,
  RotateCcw,
  BadgePercent,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  Phone,
  MapPin,
  ExternalLink,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import {
  SalurOrder,
  SalurProduct,
  INITIAL_BOOKS,
  generateSalurOrderNumber,
  formatCurrentDate,
} from '../salurData';
import { BookCover } from './BookCover';
import { ProjectItem } from '../types';
import { IdentitasItem } from '../identitasData';
import { OrganisasiItem, ViaTransaksiSalurItem } from '../types';
import { PromoSalurItem } from '../promoSalurData';
import {
  getAllSalurContainerOptions,
  SalurContainerOption,
  getRealtimeStockForSalurProduct,
  getRealtimeStockForSalurProductInContainer,
  syncStockInOutFromSalurOrder,
  getStoredStokSalurItems,
} from '../stokSalurData';
import {
  TransaksiAjarItem,
  INITIAL_TRANSAKSI_AJAR_LIST,
  getAjarParticipantsByProject,
  AjarParticipant,
} from '../transaksiAjarData';

export interface PosKasirPresetConfig {
  proyekSapa: string;
  stockOutContainer: string;
  stockOutLokasi: string;
  promoId: string;
  promoName: string;
  promoDiscountPercent: number;
  ekspedisiName: string;
  ongkir: number;
  kodeUnikMode: 'auto_inc' | 'random' | 'none';
  currentKodeUnik: number;
  viaName: string;
}

const STORAGE_KEY_POS_PRESET = 'yppln_pos_kasir_preset_v2';

interface CartItem {
  product: SalurProduct;
  quantity: number;
}

interface PosKasirTransaksiSalurProps {
  projects: ProjectItem[];
  salurOrders: SalurOrder[];
  salurProducts?: SalurProduct[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  promoList?: PromoSalurItem[];
  viaList?: ViaTransaksiSalurItem[];
  transaksiAjarList?: TransaksiAjarItem[];
  onSaveOrder: (newOrder: SalurOrder, sendResiNow?: boolean) => void;
  onShowToast: (msg: string) => void;
  onNavigateToDashboard: () => void;
  onNavigateToView?: (view: any) => void;
}

export const PosKasirTransaksiSalur: React.FC<PosKasirTransaksiSalurProps> = ({
  projects = [],
  salurOrders = [],
  salurProducts = INITIAL_BOOKS,
  identitasList = [],
  organisasiList = [],
  promoList = [],
  viaList = [],
  transaksiAjarList = INITIAL_TRANSAKSI_AJAR_LIST,
  onSaveOrder,
  onShowToast,
  onNavigateToDashboard,
  onNavigateToView,
}) => {
  // Available containers
  const containerOptions = useMemo<SalurContainerOption[]>(() => {
    return getAllSalurContainerOptions();
  }, []);

  // Default project selection (prefer active or first project)
  const defaultProjectName = useMemo(() => {
    if (projects.length > 0) {
      const active = projects.find(
        (p) =>
          p.namaKegiatan.toLowerCase().includes('lamrim') ||
          p.status === 'Ongoing'
      );
      return active ? active.namaKegiatan : projects[0].namaKegiatan;
    }
    return 'Indonesia Lamrim Retreat 2021';
  }, [projects]);

  // Load Sticky Settings (Set Sekali, Lalu Sisanya Auto)
  const [preset, setPreset] = useState<PosKasirPresetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POS_PRESET);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          proyekSapa: parsed.proyekSapa || defaultProjectName,
          stockOutContainer: parsed.stockOutContainer || 'Rak',
          stockOutLokasi: parsed.stockOutLokasi || 'Kantor Bandung',
          promoId: parsed.promoId || 'none',
          promoName: parsed.promoName || 'Tanpa Promo',
          promoDiscountPercent: parsed.promoDiscountPercent || 0,
          ekspedisiName: parsed.ekspedisiName || 'Ambil di Tempat / Stand',
          ongkir: typeof parsed.ongkir === 'number' ? parsed.ongkir : 0,
          kodeUnikMode: parsed.kodeUnikMode || 'auto_inc',
          currentKodeUnik: parsed.currentKodeUnik || 1,
          viaName: parsed.viaName || 'POS Kasir Stand',
        };
      }
    } catch (e) {
      console.error('Failed reading POS preset:', e);
    }
    return {
      proyekSapa: defaultProjectName,
      stockOutContainer: 'Rak',
      stockOutLokasi: 'Kantor Bandung',
      promoId: 'none',
      promoName: 'Tanpa Promo',
      promoDiscountPercent: 0,
      ekspedisiName: 'Ambil di Tempat / Stand',
      ongkir: 0,
      kodeUnikMode: 'auto_inc',
      currentKodeUnik: 1,
      viaName: 'POS Kasir Stand',
    };
  });

  // Save preset to storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POS_PRESET, JSON.stringify(preset));
    } catch (e) {
      console.error('Failed saving POS preset:', e);
    }
  }, [preset]);

  // Setting drawer open state
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  // -------------------------------------------------------------
  // FITUR: CARI ID PEMBELI DARI TRANSAKSI A-AJAR / UMUM / NO NAME
  // -------------------------------------------------------------
  const [buyerMode, setBuyerMode] = useState<'ajar' | 'general' | 'noname'>('ajar');
  const [searchAjarQuery, setSearchAjarQuery] = useState('');
  const [rangeIdStart, setRangeIdStart] = useState<string>('10001');
  const [rangeIdEnd, setRangeIdEnd] = useState<string>('10020');
  const [useRangeFilter, setUseRangeFilter] = useState(true);

  // Quick Select No Name Handler
  const handleSelectNoName = () => {
    setBuyerMode('noname');
    setSelectedBuyer({
      idPembeli: 'No Name',
      namaPembeli: 'No Name',
      phone: '-',
      alamatText: 'Ambil di Tempat / Stand',
      role: 'Pembeli Langsung',
      origin: 'manual',
    });
    onShowToast('ID Pembeli diatur ke "No Name"');
  };

  // Extract all participants from Transaksi A-AJAR for the configured Proyek SAPA
  const allAjarParticipants = useMemo<AjarParticipant[]>(() => {
    return getAjarParticipantsByProject(preset.proyekSapa, transaksiAjarList);
  }, [preset.proyekSapa, transaksiAjarList]);

  // Filter A-AJAR participants based on Range ID and text query
  const filteredAjarParticipants = useMemo<AjarParticipant[]>(() => {
    let list = allAjarParticipants;

    if (useRangeFilter) {
      const sNum = parseInt(rangeIdStart.trim(), 10);
      const eNum = parseInt(rangeIdEnd.trim(), 10);
      if (!isNaN(sNum) && !isNaN(eNum)) {
        const minVal = Math.min(sNum, eNum);
        const maxVal = Math.max(sNum, eNum);
        list = list.filter((p) => p.idNumber >= minVal && p.idNumber <= maxVal);
      }
    }

    if (searchAjarQuery.trim()) {
      const q = searchAjarQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.codeId.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.packageItem || '').toLowerCase().includes(q) ||
          p.orderNumber.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allAjarParticipants, useRangeFilter, rangeIdStart, rangeIdEnd, searchAjarQuery]);

  // Currently selected buyer / customer
  const [selectedBuyer, setSelectedBuyer] = useState<{
    idPembeli: string;
    namaPembeli: string;
    phone: string;
    alamatText: string;
    role?: string;
    packageAjar?: string;
    origin: 'ajar' | 'identitas' | 'organisasi' | 'manual';
  } | null>(null);

  // Auto-select first participant if available and none selected yet
  useEffect(() => {
    if (!selectedBuyer && filteredAjarParticipants.length > 0) {
      const first = filteredAjarParticipants[0];
      handleSelectAjarParticipant(first);
    }
  }, [filteredAjarParticipants]);

  // Handler to select participant from A-AJAR
  const handleSelectAjarParticipant = (p: AjarParticipant) => {
    // Find matching Identitas if available for full phone and address
    const matchedId = identitasList.find(
      (it) =>
        (it.codeId && it.codeId === p.codeId) ||
        (it.namaLengkap && it.namaLengkap.toLowerCase() === p.name.toLowerCase())
    );

    const phone = matchedId?.nomorHandPhone || '0812-3456-7890';
    let addr = 'Ambil di Tempat / Stand Proyek SAPA';
    if (matchedId?.alamat) {
      addr = `${matchedId.alamat}${matchedId.kota ? `, ${matchedId.kota}` : ''}`;
    }

    setSelectedBuyer({
      idPembeli: p.codeId,
      namaPembeli: p.name,
      phone,
      alamatText: addr,
      role: p.role,
      packageAjar: p.packageItem,
      origin: 'ajar',
    });
  };

  // Helper: Next / Prev participant in filtered range (Sequential Cashier Mode)
  const currentParticipantIndex = useMemo(() => {
    if (!selectedBuyer) return -1;
    return filteredAjarParticipants.findIndex(
      (p) => p.codeId === selectedBuyer.idPembeli
    );
  }, [selectedBuyer, filteredAjarParticipants]);

  const handleNextParticipant = () => {
    if (
      currentParticipantIndex >= 0 &&
      currentParticipantIndex < filteredAjarParticipants.length - 1
    ) {
      handleSelectAjarParticipant(
        filteredAjarParticipants[currentParticipantIndex + 1]
      );
    }
  };

  const handlePrevParticipant = () => {
    if (currentParticipantIndex > 0) {
      handleSelectAjarParticipant(
        filteredAjarParticipants[currentParticipantIndex - 1]
      );
    }
  };

  // General search mode state
  const [generalSearch, setGeneralSearch] = useState('');
  const filteredGeneralEntities = useMemo(() => {
    if (!generalSearch.trim()) return [];
    const q = generalSearch.toLowerCase();
    const idMatches = identitasList.filter(
      (it) =>
        (it.codeId || '').toLowerCase().includes(q) ||
        it.namaLengkap.toLowerCase().includes(q) ||
        (it.nomorHandPhone || '').toLowerCase().includes(q)
    );
    const orgMatches = organisasiList.filter(
      (org) =>
        (org.kodeOrganisasi || '').toLowerCase().includes(q) ||
        org.namaOrganisasi.toLowerCase().includes(q) ||
        (org.telepon || '').toLowerCase().includes(q)
    );
    return [
      ...idMatches.map((it) => ({
        type: 'identitas' as const,
        id: it.codeId || it.id,
        name: it.namaLengkap,
        phone: it.nomorHandPhone,
        address: it.alamat || 'Alamat tidak terisi',
      })),
      ...orgMatches.map((org) => ({
        type: 'organisasi' as const,
        id: org.kodeOrganisasi || org.id,
        name: org.namaOrganisasi,
        phone: org.telepon,
        address: org.alamat || 'Alamat tidak terisi',
      })),
    ].slice(0, 8);
  }, [generalSearch, identitasList, organisasiList]);

  // -------------------------------------------------------------
  // PRODUCT CATALOG & CART STATE
  // -------------------------------------------------------------
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('Tunai');
  const [noResiDirect, setNoResiDirect] = useState<string>('');
  const [catatanOrder, setCatatanOrder] = useState<string>('');

  // Real-time stock items
  const masterStokItems = useMemo(() => getStoredStokSalurItems(), [cart]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    salurProducts.forEach((p) => {
      (p.categories || []).forEach((c) => set.add(c));
      if (p.subJenis) set.add(p.subJenis);
    });
    return ['all', ...Array.from(set)];
  }, [salurProducts]);

  // Active container for stock out
  const activeStockOutContainer = (preset.stockOutContainer || 'Rak').trim();

  // Filtered products: HANYA yang ada di stock out container yang di-setting!
  const filteredProducts = useMemo(() => {
    return salurProducts.filter((p) => {
      // 1. Cek stok di container yang di-setting
      const stockInContainer = getRealtimeStockForSalurProductInContainer(
        p,
        activeStockOutContainer,
        masterStokItems
      );
      if (stockInContainer <= 0) {
        return false;
      }

      // 2. Kategori filter
      const matchCat =
        selectedCategory === 'all' ||
        (p.categories || []).includes(selectedCategory) ||
        p.subJenis === selectedCategory;

      // 3. Pencarian
      const matchSearch =
        !productSearch.trim() ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.code || '').toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.author || '').toLowerCase().includes(productSearch.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [salurProducts, activeStockOutContainer, masterStokItems, selectedCategory, productSearch]);

  // Cart operations
  const addToCart = (product: SalurProduct) => {
    const available = getRealtimeStockForSalurProductInContainer(
      product,
      activeStockOutContainer,
      masterStokItems
    );
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= available) {
          onShowToast(`Stok "${product.title}" di container ${activeStockOutContainer} maksimal ${available}`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (delta > 0) {
              const available = getRealtimeStockForSalurProductInContainer(
                item.product,
                activeStockOutContainer,
                masterStokItems
              );
              if (nextQty > available) {
                onShowToast(`Stok "${item.product.title}" di container ${activeStockOutContainer} maksimal ${available}`);
                return item;
              }
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // -------------------------------------------------------------
  // CALCULATIONS (Auto with Sticky Settings)
  // -------------------------------------------------------------
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const diskonAmount = useMemo(() => {
    if (preset.promoDiscountPercent > 0) {
      return Math.round((subtotal * preset.promoDiscountPercent) / 100);
    }
    return 0;
  }, [subtotal, preset.promoDiscountPercent]);

  const activeKodeUnik = useMemo(() => {
    if (preset.kodeUnikMode === 'none') return 0;
    if (preset.kodeUnikMode === 'random') {
      return Math.floor(Math.random() * 89) + 11;
    }
    return preset.currentKodeUnik || 1;
  }, [preset.kodeUnikMode, preset.currentKodeUnik]);

  const grandTotal = useMemo(() => {
    const tot = subtotal - diskonAmount + (preset.ongkir || 0) + activeKodeUnik;
    return Math.max(0, tot);
  }, [subtotal, diskonAmount, preset.ongkir, activeKodeUnik]);

  // -------------------------------------------------------------
  // SAVE TRANSACTION HANDLER
  // -------------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPosOrders, setRecentPosOrders] = useState<SalurOrder[]>([]);

  const handleSaveTransaction = (sendResiNow: boolean = false) => {
    if (!selectedBuyer) {
      onShowToast('Silakan pilih ID Pembeli terlebih dahulu!');
      return;
    }
    if (cart.length === 0) {
      onShowToast('Keranjang belanja masih kosong! Tambahkan item S-SALUR.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const todayFormatted = formatCurrentDate(now);
    const orderSeq = salurOrders.length + recentPosOrders.length + 1;
    const { orderNumber } = generateSalurOrderNumber('POS', todayFormatted, orderSeq);

    const resiValue = (noResiDirect || '').trim();
    const hasResi = resiValue !== '' && resiValue !== '-';

    const newOrder: SalurOrder = {
      id: `order-pos-${Date.now()}`,
      orderNumber,
      date: todayFormatted,
      printDate: todayFormatted,
      statusBadges: ['Paid', 'Paid'],
      proyekSapa: preset.proyekSapa,
      stockOutContainer: preset.stockOutContainer,
      stockOutLokasi: preset.stockOutLokasi,
      customerId: `${selectedBuyer.idPembeli} ${selectedBuyer.namaPembeli}`,
      customerCode: `${selectedBuyer.idPembeli} ${selectedBuyer.namaPembeli}`,
      idPembeli: selectedBuyer.idPembeli,
      idPenerima: selectedBuyer.idPembeli,
      alamat: {
        recipientName: selectedBuyer.namaPembeli,
        phone: selectedBuyer.phone,
        street: selectedBuyer.alamatText,
        cityProvince: 'Bandung, Jawa Barat',
        postalCode: '40132',
        badgeDate: todayFormatted,
      },
      items: cart.map((c, idx) => ({
        id: `pos-item-${idx}-${c.product.id}`,
        productId: c.product.id,
        title: c.product.title,
        price: c.product.price,
        quantity: c.quantity,
        coverKey: c.product.coverKey,
      })),
      ekspedisi: {
        name: preset.ekspedisiName,
        noResi: hasResi ? resiValue : undefined,
        isShipped: hasResi,
      },
      paymentStatus: 'Paid',
      shippingStatus: hasResi ? 'Sudah Dikirim' : 'Belum dikirim',
      costBreakdown: {
        ongkir: preset.ongkir > 0 ? `Rp${preset.ongkir.toLocaleString('id-ID')}` : undefined,
        kodeUnik: activeKodeUnik > 0 ? `Rp${activeKodeUnik}` : undefined,
        donasi: diskonAmount > 0 ? `-Rp${diskonAmount.toLocaleString('id-ID')}` : undefined,
      },
      totalDana: `Rp${grandTotal.toLocaleString('id-ID')}`,
      keterangan: catatanOrder
        ? `${catatanOrder} (POS Kasir: ${preset.viaName})`
        : `POS Kasir: ${preset.viaName} • Met. Bayar: ${paymentMethod}`,
      printStatusBadge: {
        text: todayFormatted,
        type: 'teal',
      },
    };

    // Save order into parent state & localStorage
    onSaveOrder(newOrder, hasResi);

    // If resi is filled, trigger instant stock out in real time from the selected container
    if (hasResi) {
      syncStockInOutFromSalurOrder(newOrder, resiValue, todayFormatted);
    }

    // Add to recent POS orders list for this session
    setRecentPosOrders((prev) => [newOrder, ...prev]);

    // Increment Kode Unik if mode is auto_inc
    if (preset.kodeUnikMode === 'auto_inc') {
      setPreset((prev) => ({
        ...prev,
        currentKodeUnik: (prev.currentKodeUnik || 1) + 1,
      }));
    }

    onShowToast(
      `✓ Transaksi POS ${orderNumber} untuk ${selectedBuyer.namaPembeli} berhasil disimpan! (Total: Rp${grandTotal.toLocaleString('id-ID')})`
    );

    // Reset cart and input fields
    clearCart();
    setNoResiDirect('');
    setCatatanOrder('');
    setIsSubmitting(false);

    // Auto-advance to the next participant in range if available!
    if (
      currentParticipantIndex >= 0 &&
      currentParticipantIndex < filteredAjarParticipants.length - 1
    ) {
      const nextP = filteredAjarParticipants[currentParticipantIndex + 1];
      handleSelectAjarParticipant(nextP);
      onShowToast(`Otomatis beralih ke peserta berikutnya: [${nextP.codeId}] ${nextP.name}`);
    }
  };

  return (
    <div id="pos-kasir-container" className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* ========================================================= */}
      {/* TOP HEADER & ACTION BAR */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#008d91] to-[#006e71] flex items-center justify-center text-white shadow-md shadow-[#008d91]/20 shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                POS Kasir Form Transaksi S-SALUR
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#008d91] border border-emerald-200">
                Kasir Cepat Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Isi transaksi S-SALUR counter/stand secara instan terintegrasi Stok Gudang & Transaksi A-AJAR.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsSettingOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer shadow-2xs ${
              isSettingOpen
                ? 'bg-[#008d91] text-white border-[#008d91]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Kasir (Set Sekali)</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSettingOpen ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <span>Daftar Transaksi S-SALUR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STICKY CONFIGURATION PANEL (SET SEKALI, LALU SISANYA AUTO) */}
      {/* ========================================================= */}
      <div
        className={`bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs transition-all ${
          isSettingOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#008d91]" />
            <h2 className="text-sm font-bold text-slate-800">
              Pengaturan Default Kasir (Set Sekali, Lalu Sisanya Auto)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Tersimpan otomatis di browser
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* 1. PROYEK SAPA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <span>Proyek SAPA</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              value={preset.proyekSapa}
              onChange={(e) =>
                setPreset((prev) => ({ ...prev, proyekSapa: e.target.value }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:border-[#008d91]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.namaKegiatan}>
                  {p.namaKegiatan}
                </option>
              ))}
              <option value="Indonesia Lamrim Retreat 2021">
                Indonesia Lamrim Retreat 2021
              </option>
              <option value="Indonesia Lamrim Retreat 2018">
                Indonesia Lamrim Retreat 2018
              </option>
              <option value="Pameran Buku Dharma 2021">
                Pameran Buku Dharma 2021
              </option>
            </select>
            <span className="text-[10px] text-slate-400">
              Sinkron dengan peserta A-AJAR
            </span>
          </div>

          {/* 2. STOCK OUT CONTAINER */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Boxes className="w-3 h-3 text-[#008d91]" />
              <span>Stock Out dari:</span>
            </label>
            <select
              value={preset.stockOutContainer}
              onChange={(e) => {
                const opt = containerOptions.find((c) => c.container === e.target.value);
                setPreset((prev) => ({
                  ...prev,
                  stockOutContainer: e.target.value,
                  stockOutLokasi: opt ? opt.lokasi : 'Kantor Bandung',
                }));
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:border-[#008d91]"
            >
              {containerOptions.map((opt) => (
                <option key={opt.container} value={opt.container}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400">
              Lokasi: {preset.stockOutLokasi}
            </span>
          </div>

          {/* 3. PROMO */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <BadgePercent className="w-3 h-3 text-[#008d91]" />
              <span>Promo S-SALUR</span>
            </label>
            <select
              value={preset.promoId}
              onChange={(e) => {
                const id = e.target.value;
                if (id === 'none') {
                  setPreset((prev) => ({
                    ...prev,
                    promoId: 'none',
                    promoName: 'Tanpa Promo',
                    promoDiscountPercent: 0,
                  }));
                } else if (id === 'disc-10') {
                  setPreset((prev) => ({
                    ...prev,
                    promoId: 'disc-10',
                    promoName: 'Diskon 10%',
                    promoDiscountPercent: 10,
                  }));
                } else if (id === 'disc-20') {
                  setPreset((prev) => ({
                    ...prev,
                    promoId: 'disc-20',
                    promoName: 'Diskon 20%',
                    promoDiscountPercent: 20,
                  }));
                } else {
                  const match = promoList.find((p) => p.id === id);
                  const disc = match?.discounts?.[0]?.nominal ? parseInt(match.discounts[0].nominal, 10) : 10;
                  setPreset((prev) => ({
                    ...prev,
                    promoId: id,
                    promoName: match?.namaPromo || 'Promo Khusus',
                    promoDiscountPercent: isNaN(disc) ? 0 : disc,
                  }));
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:border-[#008d91]"
            >
              <option value="none">Tanpa Promo (0%)</option>
              <option value="disc-10">Diskon Reguler 10%</option>
              <option value="disc-20">Diskon Spesial Event 20%</option>
              {promoList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaPromo}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400">
              Diskon: {preset.promoDiscountPercent}%
            </span>
          </div>

          {/* 4. EKSPEDISI */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#008d91]" />
              <span>Ekspedisi</span>
            </label>
            <select
              value={preset.ekspedisiName}
              onChange={(e) =>
                setPreset((prev) => ({ ...prev, ekspedisiName: e.target.value }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:border-[#008d91]"
            >
              <option value="Ambil di Tempat / Stand">Ambil di Stand / Event</option>
              <option value="TIKI ONS">TIKI ONS</option>
              <option value="TIKI REG">TIKI REG</option>
              <option value="JNE REG">JNE REG</option>
              <option value="SiCepat">SiCepat</option>
              <option value="J&T Express">J&T Express</option>
              <option value="Pos Indonesia">Pos Indonesia</option>
            </select>
            <span className="text-[10px] text-slate-400">Default kurir</span>
          </div>

          {/* 5. ONGKIR */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-600">
              Ongkir (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={preset.ongkir}
              onChange={(e) =>
                setPreset((prev) => ({
                  ...prev,
                  ongkir: Math.max(0, parseInt(e.target.value, 10) || 0),
                }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:border-[#008d91]"
              placeholder="0"
            />
            <span className="text-[10px] text-slate-400">
              Rp{preset.ongkir.toLocaleString('id-ID')}
            </span>
          </div>

          {/* 6. KODE UNIK */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Hash className="w-3 h-3 text-[#008d91]" />
              <span>Kode Unik</span>
            </label>
            <div className="flex items-center gap-1">
              <select
                value={preset.kodeUnikMode}
                onChange={(e: any) =>
                  setPreset((prev) => ({ ...prev, kodeUnikMode: e.target.value }))
                }
                className="w-1/2 text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-700 focus:outline-none focus:border-[#008d91]"
              >
                <option value="auto_inc">Auto (+1)</option>
                <option value="random">Acak</option>
                <option value="none">Nonaktif</option>
              </select>
              <input
                type="number"
                min="0"
                value={preset.currentKodeUnik}
                onChange={(e) =>
                  setPreset((prev) => ({
                    ...prev,
                    currentKodeUnik: parseInt(e.target.value, 10) || 1,
                  }))
                }
                disabled={preset.kodeUnikMode === 'none'}
                className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-700 focus:outline-none focus:border-[#008d91]"
                placeholder="1"
              />
            </div>
            <span className="text-[10px] text-slate-400">
              Aktif: +Rp{activeKodeUnik}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Pengaturan kasir aktif dan otomatis diterapkan ke setiap transaksi baru.
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSettingOpen(false);
              onShowToast('Pengaturan kasir berhasil disimpan!');
            }}
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#008d91] hover:bg-[#00787c] text-white shadow-xs transition-colors cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>

      {/* QUICK STATUS BAR SUMMARY (When setting drawer is closed) */}
      {!isSettingOpen && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-700">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <span className="text-slate-400 font-normal">Proyek:</span>
              <span>{preset.proyekSapa}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Stock Out:</span>
              <span className="font-semibold text-[#008d91]">{preset.stockOutContainer}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Promo:</span>
              <span className="font-semibold">{preset.promoName}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Ekspedisi:</span>
              <span>{preset.ekspedisiName}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Ongkir:</span>
              <span>Rp{preset.ongkir.toLocaleString('id-ID')}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Kode Unik:</span>
              <span>Rp{activeKodeUnik}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingOpen(true)}
            className="text-[11px] text-[#008d91] hover:underline font-semibold cursor-pointer"
          >
            Ubah Pengaturan
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: PEMILIHAN ID PEMBELI & INTEGRASI A-AJAR */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#008d91]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Pilih ID Pembeli / Peserta Transaksi S-SALUR
              </h2>
              <p className="text-[11px] text-slate-500">
                Cari ID pembeli langsung atau berdasarkan peserta Transaksi A-AJAR pada Proyek SAPA yang sama
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setBuyerMode('ajar')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                buyerMode === 'ajar'
                  ? 'bg-white text-[#008d91] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Peserta A-AJAR ({filteredAjarParticipants.length})
            </button>
            <button
              type="button"
              onClick={() => setBuyerMode('general')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                buyerMode === 'general'
                  ? 'bg-white text-[#008d91] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Cari Identitas Umum
            </button>
            <button
              type="button"
              onClick={handleSelectNoName}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                buyerMode === 'noname' || selectedBuyer?.idPembeli === 'No Name'
                  ? 'bg-[#008d91] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
            >
              Opsi No Name
            </button>
          </div>
        </div>

        {/* MODE A-AJAR: RANGE ID SEARCH & PARTICIPANT PICKER */}
        {buyerMode === 'ajar' && (
          <div className="flex flex-col gap-3">
            {/* Range ID Inputs and Controls */}
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                  Filter Range ID A-AJAR:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Dari:</span>
                  <input
                    type="number"
                    value={rangeIdStart}
                    onChange={(e) => setRangeIdStart(e.target.value)}
                    className="w-24 text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[#008d91]"
                    placeholder="10001"
                  />
                  <span className="text-xs text-slate-500">s/d</span>
                  <input
                    type="number"
                    value={rangeIdEnd}
                    onChange={(e) => setRangeIdEnd(e.target.value)}
                    className="w-24 text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[#008d91]"
                    placeholder="10020"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setRangeIdStart('10001');
                      setRangeIdEnd('10005');
                      setUseRangeFilter(true);
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                  >
                    10001 - 10005
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRangeIdStart('10006');
                      setRangeIdEnd('10012');
                      setUseRangeFilter(true);
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                  >
                    10006 - 10012
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseRangeFilter(false);
                      setRangeIdStart('10001');
                      setRangeIdEnd('10099');
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                  >
                    Semua ({allAjarParticipants.length})
                  </button>
                </div>
              </div>

              {/* Text Search inside range */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAjarQuery}
                  onChange={(e) => setSearchAjarQuery(e.target.value)}
                  placeholder="Cari nama / ID peserta..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
                />
              </div>
            </div>

            {/* Participants Horizontal Scroll / Grid of matching people */}
            {filteredAjarParticipants.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl text-xs text-slate-400">
                Tidak ada peserta Transaksi A-AJAR pada range ID tersebut untuk Proyek "{preset.proyekSapa}".
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {filteredAjarParticipants.map((p, idx) => {
                  const isSelected = selectedBuyer?.idPembeli === p.codeId;
                  return (
                    <button
                      key={`${p.codeId}-${p.orderNumber}-${idx}`}
                      type="button"
                      onClick={() => handleSelectAjarParticipant(p)}
                      className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all text-left cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-[#008d91] text-white border-[#008d91] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-white text-[#008d91]' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.codeId.slice(-2)}
                      </div>
                      <div className="flex flex-col min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{p.codeId}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {p.role}
                          </span>
                        </div>
                        <span className="text-xs truncate max-w-[120px] font-medium leading-tight">
                          {p.name}
                        </span>
                        {p.packageItem && (
                          <span
                            className={`text-[10px] truncate max-w-[120px] ${
                              isSelected ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            {p.packageItem}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODE GENERAL: SEARCH IDENTITAS / ORGANISASI */}
        {buyerMode === 'general' && (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={generalSearch}
                onChange={(e) => setGeneralSearch(e.target.value)}
                placeholder="Ketik nama, ID code (misal: 10001), atau nomor HP pembeli..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
              />
            </div>

            {filteredGeneralEntities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                {filteredGeneralEntities.map((ent, idx) => (
                  <button
                    key={`${ent.type}-${ent.id}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedBuyer({
                        idPembeli: ent.id,
                        namaPembeli: ent.name,
                        phone: ent.phone || '0812-3456-7890',
                        alamatText: ent.address,
                        origin: ent.type,
                      });
                      setGeneralSearch('');
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#008d91] hover:bg-emerald-50/30 text-left transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#008d91]">{ent.id}</span>
                        <span className="text-[10px] text-slate-400">({ent.type})</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 truncate">{ent.name}</span>
                      <span className="text-[11px] text-slate-500">{ent.phone}</span>
                    </div>
                    <Plus className="w-4 h-4 text-[#008d91]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE NO NAME: DIRECT COUNTER / ANONYMOUS BUYER */}
        {buyerMode === 'noname' && (
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                NN
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">Mode Pembeli: No Name</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    Anonim / Pembeli Langsung
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ID Pembeli otomatis terisi "No Name" untuk transaksi kasir/counter tanpa data member atau peserta.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setBuyerMode('ajar')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer shadow-2xs"
              >
                Ganti ke Peserta A-AJAR
              </button>
            </div>
          </div>
        )}

        {/* SELECTED BUYER CARD WITH QUICK SEQUENTIAL CONTROLS */}
        {selectedBuyer ? (
          <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-200/80 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#008d91] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {selectedBuyer.idPembeli.slice(-2) || 'ID'}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#008d91] bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    ID: {selectedBuyer.idPembeli}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedBuyer.namaPembeli}
                  </span>
                  {selectedBuyer.role && (
                    <span className="text-[11px] text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">
                      Peserta A-AJAR ({selectedBuyer.role})
                    </span>
                  )}
                  {selectedBuyer.packageAjar && (
                    <span className="text-[11px] text-slate-600 font-medium">
                      • {selectedBuyer.packageAjar}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {selectedBuyer.phone}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 truncate max-w-sm">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {selectedBuyer.alamatText}
                  </span>
                </div>
              </div>
            </div>

            {/* Sequential Navigation Buttons (Next / Prev) */}
            {buyerMode === 'ajar' && filteredAjarParticipants.length > 1 && (
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handlePrevParticipant}
                  disabled={currentParticipantIndex <= 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  title="Pindah ke ID Peserta Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>ID Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextParticipant}
                  disabled={currentParticipantIndex >= filteredAjarParticipants.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  title="Pindah ke ID Peserta Berikutnya"
                >
                  <span>ID Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Belum ada pembeli terpilih. Klik salah satu peserta A-AJAR di atas untuk memulai transaksi.</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MAIN TWO-COLUMN CONTENT: PRODUCT CATALOG & CART */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: PRODUCT CATALOG TILES (Span 7 or 8) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
            {/* Catalog search and category filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari buku / item S-SALUR..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#008d91] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Out Container Filter Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-teal-50/70 border border-teal-200/70 rounded-2xl px-3.5 py-2">
              <div className="flex items-center gap-2 text-teal-900">
                <Boxes className="w-4 h-4 text-[#008d91] shrink-0" />
                <span>
                  Menampilkan Item dari Container:{' '}
                  <strong className="font-bold text-[#008d91]">{activeStockOutContainer}</strong>{' '}
                  <span className="text-slate-500">({filteredProducts.length} item dengan stok)</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingOpen(true)}
                className="text-[11px] font-semibold text-[#008d91] hover:underline cursor-pointer"
              >
                Ganti Container
              </button>
            </div>

            {/* Product Cards Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="py-12 px-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                <Boxes className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">
                  Tidak ada item S-SALUR dengan stok di container "{activeStockOutContainer}"
                </p>
                <p className="text-xs text-slate-500 max-w-md">
                  Sesuai pengaturan, hanya item yang dialokasikan di container "{activeStockOutContainer}" yang dimunculkan di kasir. Silakan pilih container lain atau tambah stok di menu Stok S-SALUR.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSettingOpen(true)}
                  className="mt-2 px-3.5 py-1.5 text-xs font-semibold bg-[#008d91] text-white rounded-xl hover:bg-[#00787c] cursor-pointer shadow-2xs"
                >
                  Ubah Container Stock Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((p) => {
                  const containerStock = getRealtimeStockForSalurProductInContainer(
                    p,
                    activeStockOutContainer,
                    masterStokItems
                  );
                  const cartQty = cart.find((it) => it.product.id === p.id)?.quantity || 0;

                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-2xl border transition-all p-3 flex flex-col justify-between gap-2.5 shadow-2xs hover:shadow-xs ${
                        cartQty > 0 ? 'border-[#008d91] ring-1 ring-[#008d91]/20' : 'border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <BookCover
                          coverKey={p.coverKey}
                          size="md"
                          className="rounded-xl shadow-xs shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                            {p.title}
                          </h3>
                          <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {p.subtitle || p.code}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-xs font-bold text-[#008d91]">
                              Rp{p.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Boxes className="w-3 h-3 text-[#008d91]" />
                          <span>Stok:</span>
                          <span className="font-semibold text-slate-800">{containerStock}</span>
                        </span>

                      {cartQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
                          <button
                            type="button"
                            onClick={() => updateCartQty(p.id, -1)}
                            className="w-5 h-5 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs px-1 text-slate-800">{cartQty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(p.id, 1)}
                            className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#00787c] flex items-center justify-center text-white cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(p)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#008d91] hover:bg-[#00787c] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pilih</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

        {/* RIGHT COLUMN: POS CASHIER CART & CHECKOUT (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col gap-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#008d91]" />
                <h2 className="text-sm font-bold text-slate-800">
                  Keranjang Kasir ({cart.reduce((a, b) => a + b.quantity, 0)} item)
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2">
                <ShoppingCart className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-400">
                  Belum ada item S-SALUR dipilih.<br />
                  Klik tombol "+ Pilih" pada katalog di samping.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookCover
                        coverKey={item.product.coverKey}
                        size="sm"
                        className="rounded-lg shadow-2xs shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {item.product.title}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Rp{item.product.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-slate-800 w-20 text-right">
                        Rp{(item.product.price * item.quantity).toLocaleString('id-ID')}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeCartItem(item.product.id)}
                        className="text-slate-300 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal Item</span>
                <span className="font-semibold text-slate-800">
                  Rp{subtotal.toLocaleString('id-ID')}
                </span>
              </div>

              {preset.promoDiscountPercent > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Diskon Promo ({preset.promoDiscountPercent}%)</span>
                  </span>
                  <span className="font-semibold">
                    -Rp{diskonAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-400" />
                  <span>Ongkir ({preset.ekspedisiName})</span>
                </span>
                <span className="font-semibold text-slate-800">
                  Rp{preset.ongkir.toLocaleString('id-ID')}
                </span>
              </div>

              {activeKodeUnik > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>Kode Unik Transaksi</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    +Rp{activeKodeUnik}
                  </span>
                </div>
              )}

              <div className="border-t border-dashed border-slate-200 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-800">Total Pembayaran</span>
                <span className="font-extrabold text-[#008d91] text-base">
                  Rp{grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method & Quick Options */}
            <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Metode Bayar:</span>
                <div className="flex items-center gap-1">
                  {['Tunai', 'QRIS', 'BCA', 'Mandiri'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Direct Resi Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={noResiDirect}
                  onChange={(e) => setNoResiDirect(e.target.value)}
                  placeholder="No. Resi (Opsional, jika langsung kirim ekspedisi)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
                />
              </div>
            </div>

            {/* Execute Save Button */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                id="btn-save-pos-transaction"
                onClick={() => handleSaveTransaction(false)}
                disabled={isSubmitting || cart.length === 0 || !selectedBuyer}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#008d91] hover:bg-[#00787c] text-white font-bold text-sm shadow-md shadow-[#008d91]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Simpan Transaksi S-SALUR</span>
              </button>

              <p className="text-[10px] text-center text-slate-400">
                Stok keluar otomatis dicatat dari container "{preset.stockOutContainer}".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION: RIWAYAT TRANSAKSI POS SESI INI */}
      {/* ========================================================= */}
      {recentPosOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-800">
              Riwayat Transaksi POS Sesi Ini ({recentPosOrders.length})
            </h3>
            <span className="text-xs text-slate-400">
              Tersimpan pada Transaksi S-SALUR
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-2 px-3">No. Pesanan</th>
                  <th className="py-2 px-3">ID & Nama Pembeli</th>
                  <th className="py-2 px-3">Buku / Item</th>
                  <th className="py-2 px-3">Stock Out Container</th>
                  <th className="py-2 px-3">Total Dana</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPosOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-[#008d91]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{ord.alamat.recipientName}</span>
                        <span className="text-[11px] text-slate-400">ID: {ord.idPembeli}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {ord.items.map((it) => `${it.quantity}x ${it.title}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {ord.stockOutContainer || 'Rak'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {ord.totalDana}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Lunas
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
