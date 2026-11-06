import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  CheckCircle2,
  Printer,
  X,
  RotateCcw,
  Tag,
  Percent,
  Calendar,
  Truck,
  Box,
  Coins,
  CreditCard,
  QrCode,
  User,
  Building2,
  History,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Store,
  DollarSign,
  Package,
  Layers,
  Phone,
  MapPin,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  INITIAL_BOOKS,
  CROSS_SELLING_BOOKS,
  SalurOrder,
  SalurOrderItem,
  SalurProduct,
  generateSalurOrderNumber,
} from '../salurData';
import { BookCover } from './BookCover';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { OrganisasiItem, Project, ViaTransaksiSalurItem } from '../types';
import { INITIAL_ORGANISASI } from '../organisasiData';
import { INITIAL_VIA_TRANSAKSI_SALUR } from '../viaSalurData';
import { PromoSalurItem, loadPromoSalur } from '../promoSalurData';
import {
  INITIAL_GUDANG_SALUR_DATA,
  INITIAL_STOK_SALUR_ITEMS,
  getStoredGudangSalurData,
  applyStockMovement,
  StockInOutSalurRecord,
} from '../stokSalurData';

export interface PosKasirSessionPreset {
  tanggal: string; // e.g. "14 Nov 2021"
  via: string; // e.g. "Stand", "Bazar", "Call Center"
  proyekSapa: string; // e.g. "Stand Vihara Buddhayana"
  promoId: string; // e.g. "promo-1" or "none"
  promoName: string; // e.g. "Promo Event 100th LIOH" or "Tanpa Promo"
  containerName: string; // e.g. "Container Stand - 01"
  gudangName: string; // e.g. "Stand Vihara Buddhayana"
  ekspedisi: string; // e.g. "Ambil di Tempat"
  ongkir: number; // default 0
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  coverKey?: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  code?: string;
  category?: string;
  discountPerItem: number;
}

interface PosKasirSalurViewProps {
  onBackToDashboard: () => void;
  onSaveOrder: (newOrder: SalurOrder) => void;
  salurOrders: SalurOrder[];
  projects?: Project[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  viaList?: ViaTransaksiSalurItem[];
  promoList?: PromoSalurItem[];
  onShowToast?: (msg: string) => void;
}

const PRESET_STORAGE_KEY = 'yppln_pos_kasir_salur_session_preset_v1';
const SESSION_HISTORY_STORAGE_KEY = 'yppln_pos_kasir_salur_session_history_v1';

const DEFAULT_PRESET: PosKasirSessionPreset = {
  tanggal: '14 Nov 2021',
  via: 'Stand',
  proyekSapa: 'Stand Vihara Buddhayana',
  promoId: 'none',
  promoName: 'Tanpa Promo',
  containerName: 'Container Stand - 01',
  gudangName: 'Stand Vihara Buddhayana',
  ekspedisi: 'Ambil di Tempat',
  ongkir: 0,
};

export const PosKasirSalurView: React.FC<PosKasirSalurViewProps> = ({
  onBackToDashboard,
  onSaveOrder,
  salurOrders = [],
  projects = [],
  identitasList = [],
  organisasiList = [],
  viaList = [],
  promoList = [],
  onShowToast = (_msg: string) => {},
}) => {
  // 1. Session Preset State (Set satu kali)
  const [sessionPreset, setSessionPreset] = useState<PosKasirSessionPreset>(() => {
    try {
      const saved = localStorage.getItem(PRESET_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load POS session preset', e);
    }
    return DEFAULT_PRESET;
  });

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Preset Form draft in modal
  const [draftTanggal, setDraftTanggal] = useState(sessionPreset.tanggal);
  const [draftVia, setDraftVia] = useState(sessionPreset.via);
  const [draftProyek, setDraftProyek] = useState(sessionPreset.proyekSapa);
  const [draftPromoId, setDraftPromoId] = useState(sessionPreset.promoId);
  const [draftContainerKey, setDraftContainerKey] = useState(
    `${sessionPreset.containerName}||${sessionPreset.gudangName}`
  );
  const [draftEkspedisi, setDraftEkspedisi] = useState(sessionPreset.ekspedisi);
  const [draftOngkir, setDraftOngkir] = useState(String(sessionPreset.ongkir));

  // 2. Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Customer state: 'walk-in' | 'registered'
  const [customerMode, setCustomerMode] = useState<'walk-in' | 'registered'>('walk-in');
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    code: string;
    name: string;
    phone: string;
    address: string;
  } | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'BCA 888' | 'BCA 388' | 'Mandiri' | 'QRIS'>('Tunai');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');

  // 3. Post Checkout Modal & Session History
  const [completedOrder, setCompletedOrder] = useState<SalurOrder | null>(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState<{
    method: string;
    tendered: number;
    change: number;
  } | null>(null);

  const [sessionOrders, setSessionOrders] = useState<SalurOrder[]>(() => {
    try {
      const saved = localStorage.getItem(SESSION_HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Available Master Data Lists
  const availableVias = useMemo(() => {
    return viaList.length > 0 ? viaList : INITIAL_VIA_TRANSAKSI_SALUR;
  }, [viaList]);

  const availablePromos = useMemo(() => {
    return promoList.length > 0 ? promoList : loadPromoSalur();
  }, [promoList]);

  // Available Containers across warehouses
  const availableContainers = useMemo(() => {
    const list: Array<{
      key: string;
      namaContainer: string;
      lokasiGudang: string;
      totalStok: number;
    }> = [];

    const gudangs = getStoredGudangSalurData();
    gudangs.forEach((g) => {
      g.containers.forEach((c) => {
        list.push({
          key: `${c.namaContainer}||${g.namaLokasi}`,
          namaContainer: c.namaContainer,
          lokasiGudang: g.namaLokasi,
          totalStok: c.stok || 0,
        });
      });
    });

    if (list.length === 0) {
      INITIAL_GUDANG_SALUR_DATA.forEach((g) => {
        g.containers.forEach((c) => {
          list.push({
            key: `${c.namaContainer}||${g.namaLokasi}`,
            namaContainer: c.namaContainer,
            lokasiGudang: g.namaLokasi,
            totalStok: c.stok || 0,
          });
        });
      });
    }

    return list;
  }, []);

  // Combine products for catalog
  const catalogProducts = useMemo(() => {
    const map = new Map<string, SalurProduct>();
    INITIAL_BOOKS.forEach((b) => map.set(b.id, b));
    CROSS_SELLING_BOOKS.forEach((b) => {
      if (!map.has(b.id)) map.set(b.id, b);
    });
    return Array.from(map.values());
  }, []);

  // Look up stock of each item in the ACTIVE session container
  const containerStockMap = useMemo(() => {
    const stockMap = new Map<string, number>();
    const gudangs = getStoredGudangSalurData();
    const targetGudang = gudangs.find(
      (g) => g.namaLokasi.toLowerCase().trim() === sessionPreset.gudangName.toLowerCase().trim()
    );
    if (targetGudang) {
      const targetCont = targetGudang.containers.find(
        (c) => c.namaContainer.toLowerCase().trim() === sessionPreset.containerName.toLowerCase().trim()
      );
      if (targetCont && targetCont.items) {
        targetCont.items.forEach((it) => {
          stockMap.set(it.namaItem.toLowerCase().trim(), it.stok);
        });
      }
    }
    return stockMap;
  }, [sessionPreset.containerName, sessionPreset.gudangName, sessionOrders]);

  // Search & Filtered catalog products
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((p) => {
      // Category filter
      if (activeCategory !== 'Semua') {
        const catStr = (p.categories || [p.category || '']).join(' ').toLowerCase();
        if (activeCategory === 'Buku Berbayar' && !p.title.toLowerCase().includes('buku') && !p.subtitle?.includes('Berbayar')) {
          if (!['book-1', 'book-2', 'book-3'].includes(p.id)) return false;
        } else if (activeCategory === 'Welas Asih' && !catStr.includes('welas asih')) {
          return false;
        } else if (activeCategory === 'Leadership' && !catStr.includes('leadership') && !catStr.includes('umum')) {
          return false;
        }
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCode = (p.code || '').toLowerCase().includes(q);
        const matchCat = (p.categories || [p.category || '']).some((c) => c.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchCat) return false;
      }

      return true;
    });
  }, [catalogProducts, activeCategory, searchQuery]);

  // Combined Identitas & Organisasi for search
  const searchableCustomers = useMemo(() => {
    const list: Array<{
      id: string;
      code: string;
      name: string;
      phone: string;
      address: string;
      type: 'identitas' | 'organisasi';
    }> = [];

    const idList = identitasList.length > 0 ? identitasList : INITIAL_IDENTITAS;
    idList.forEach((it, idx) => {
      const code = it.codeId || `1000${idx + 1}`;
      list.push({
        id: it.id,
        code,
        name: it.namaLengkap,
        phone: it.nomorHandPhone || '-',
        address: it.alamat || 'Bandung, Jawa Barat',
        type: 'identitas',
      });
    });

    const orgList = organisasiList.length > 0 ? organisasiList : INITIAL_ORGANISASI;
    orgList.forEach((org, idx) => {
      const code = org.picOrgCode || `ORG-${String(idx + 1).padStart(2, '0')}`;
      list.push({
        id: org.id,
        code,
        name: org.namaOrganisasi,
        phone: org.nomorTelepon || '-',
        address: org.alamat || 'Jakarta',
        type: 'organisasi',
      });
    });

    return list;
  }, [identitasList, organisasiList]);

  const filteredCustomerList = useMemo(() => {
    if (!customerSearchQuery.trim()) return searchableCustomers.slice(0, 8);
    const q = customerSearchQuery.toLowerCase().trim();
    return searchableCustomers
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 8);
  }, [searchableCustomers, customerSearchQuery]);

  // Active Promo object
  const activePromoObj = useMemo(() => {
    if (!sessionPreset.promoId || sessionPreset.promoId === 'none') return null;
    return availablePromos.find((p) => p.id === sessionPreset.promoId) || null;
  }, [availablePromos, sessionPreset.promoId]);

  // Helper to calculate promo discount for an item
  const getPromoDiscountForItem = (product: SalurProduct): number => {
    if (!activePromoObj) return 0;
    if (activePromoObj.discounts && activePromoObj.discounts.length > 0) {
      const matched = activePromoObj.discounts.find(
        (d) =>
          d.itemSalur === 'ALL' ||
          d.itemSalur.toLowerCase() === product.title.toLowerCase() ||
          product.title.toLowerCase().includes(d.itemSalur.toLowerCase())
      );
      if (matched) {
        const nominalNum = parseFloat(matched.nominal.replace(/[^0-9.]/g, '')) || 0;
        if (matched.unit === '%') {
          return Math.round((product.price * nominalNum) / 100);
        } else {
          return nominalNum;
        }
      }
    }
    // Fallback if promo has subtitle like "Diskon 20%"
    if (activePromoObj.subtitle?.includes('%')) {
      const match = activePromoObj.subtitle.match(/(\d+)%/);
      if (match) {
        const pct = parseInt(match[1], 10);
        return Math.round((product.price * pct) / 100);
      }
    }
    return 0;
  };

  // Add Item to Cart
  const handleAddToCart = (product: SalurProduct, incrementQty: number = 1) => {
    const discount = getPromoDiscountForItem(product);

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + incrementQty,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: incrementQty,
            coverKey: product.coverKey as any,
            code: product.code,
            category: product.category || (product.categories ? product.categories[0] : undefined),
            discountPerItem: discount,
          },
        ];
      }
    });
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleSetCartQty = (id: string, rawVal: string) => {
    const num = parseInt(rawVal.replace(/[^0-9]/g, ''), 10) || 1;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, num) } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setCashTendered('');
    setOrderNotes('');
  };

  // Calculations
  const subtotalGross = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [cart]);

  const totalDiscount = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.discountPerItem * it.quantity, 0);
  }, [cart]);

  const totalOngkir = sessionPreset.ongkir || 0;
  const grandTotal = Math.max(0, subtotalGross - totalDiscount + totalOngkir);

  // Cash tender calculations
  const tenderNum = parseFloat(cashTendered.replace(/[^0-9]/g, '')) || 0;
  const cashChange = paymentMethod === 'Tunai' ? Math.max(0, tenderNum - grandTotal) : 0;
  const isCashInsufficient = paymentMethod === 'Tunai' && tenderNum > 0 && tenderNum < grandTotal;

  // Save Session Preset from Modal
  const handleSavePresetModal = () => {
    const [cName, gName] = draftContainerKey.split('||');
    const chosenPromo = availablePromos.find((p) => p.id === draftPromoId);

    const updatedPreset: PosKasirSessionPreset = {
      tanggal: draftTanggal.trim() || '14 Nov 2021',
      via: draftVia.trim() || 'Stand',
      proyekSapa: draftProyek.trim() || 'Stand Vihara Buddhayana',
      promoId: draftPromoId,
      promoName: chosenPromo ? chosenPromo.namaPromo : 'Tanpa Promo',
      containerName: cName || 'Container Stand - 01',
      gudangName: gName || 'Stand Vihara Buddhayana',
      ekspedisi: draftEkspedisi.trim() || 'Ambil di Tempat',
      ongkir: parseInt(draftOngkir.replace(/[^0-9]/g, ''), 10) || 0,
    };

    setSessionPreset(updatedPreset);
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updatedPreset));
    } catch (e) {
      console.error(e);
    }

    setIsPresetModalOpen(false);
    onShowToast('Konfigurasi sesi kasir berhasil diperbarui!');
  };

  // Checkout & Submit Transaction
  const handleCheckout = () => {
    if (cart.length === 0) {
      onShowToast('Keranjang masih kosong! Silakan pilih produk terlebih dahulu.');
      return;
    }

    if (paymentMethod === 'Tunai' && tenderNum > 0 && tenderNum < grandTotal) {
      onShowToast('Uang tunai yang diterima kurang dari total pembayaran!');
      return;
    }

    // Determine customer info
    const customerId =
      customerMode === 'registered' && selectedEntity
        ? `${selectedEntity.code} ${selectedEntity.name}`
        : '10001 Umum';
    const customerCode =
      customerMode === 'registered' && selectedEntity
        ? `${selectedEntity.code} ${selectedEntity.name}`
        : '10001 Umum';
    const recipientName =
      customerMode === 'registered' && selectedEntity ? selectedEntity.name : 'Pembeli Umum / Tamu Stand';
    const phone =
      customerMode === 'registered' && selectedEntity ? selectedEntity.phone : '-';
    const street =
      customerMode === 'registered' && selectedEntity
        ? selectedEntity.address
        : `Pembelian Langsung ${sessionPreset.via} (${sessionPreset.proyekSapa})`;

    // Generate Order Number
    const nextSeq = salurOrders.length + sessionOrders.length + 1;
    const gen = generateSalurOrderNumber(sessionPreset.via, sessionPreset.tanggal, nextSeq);

    // Prepare SalurOrderItems
    const orderItems: SalurOrderItem[] = cart.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: it.id,
      title: it.title,
      price: it.price,
      quantity: it.quantity,
      coverKey: it.coverKey,
      discount: it.discountPerItem > 0 ? `Diskon: Rp${(it.discountPerItem * it.quantity).toLocaleString('id-ID')}` : undefined,
    }));

    const fullOrder: SalurOrder = {
      id: `order-pos-${Date.now()}`,
      orderNumber: gen.orderNumber,
      via: sessionPreset.via,
      customerId,
      customerCode,
      idPembeli: customerId,
      idPenerima: customerCode,
      date: sessionPreset.tanggal,
      paymentStatus: 'Paid',
      shippingStatus: 'Sudah Dikirim', // In-person POS checkout is handed to buyer directly
      statusBadges: ['Paid', 'Paid'],
      printStatusBadge: {
        text: sessionPreset.tanggal,
        type: 'teal',
      },
      promo: sessionPreset.promoId !== 'none' ? sessionPreset.promoId : undefined,
      promoName: sessionPreset.promoId !== 'none' ? sessionPreset.promoName : undefined,
      items: orderItems,
      alamat: {
        badgeDate: sessionPreset.tanggal,
        recipientName,
        phone,
        street,
        cityProvince: 'Di Tempat',
        postalCode: '00000',
      },
      ekspedisi: {
        name: sessionPreset.ekspedisi || 'Ambil di Tempat',
        noResi: `POS-${Date.now().toString().slice(-6)}`,
        isShipped: true,
      },
      costBreakdown: {
        ongkir: `Ongkos Kirim: Rp${totalOngkir.toLocaleString('id-ID')}`,
        donasi: 'Donasi: Rp0',
        kodeUnik: 'Kode Unik: Rp0',
      },
      totalDana: `Rp${grandTotal.toLocaleString('id-ID')}`,
      keterangan: `Kasir POS (${paymentMethod}) - Kontainer: ${sessionPreset.containerName}${
        orderNotes ? ` - Catatan: ${orderNotes}` : ''
      }`,
      proyekSapa: sessionPreset.proyekSapa,
    };

    // 1. Deduct Stock from the configured container
    cart.forEach((cItem, cIdx) => {
      const stockRecord: StockInOutSalurRecord = {
        id: `stock-io-pos-${Date.now()}-${cIdx}`,
        tanggal: sessionPreset.tanggal,
        sumberContainer: sessionPreset.containerName,
        sumberLokasi: sessionPreset.gudangName,
        namaItem: cItem.title,
        jumlah: cItem.quantity,
        tujuanContainer: '-',
        tujuanLokasi: '-',
        jenisPerubahan: 'Penjualan',
        keterangan: `Kasir POS No. ${fullOrder.orderNumber} - Proyek: ${sessionPreset.proyekSapa} (Kontainer: ${sessionPreset.containerName})`,
        orderId: fullOrder.id,
        orderNumber: fullOrder.orderNumber,
        noResi: fullOrder.ekspedisi.noResi,
      };
      applyStockMovement(stockRecord);
    });

    // 2. Save order to main App state
    onSaveOrder(fullOrder);

    // 3. Save to current POS session history
    const updatedSessionList = [fullOrder, ...sessionOrders];
    setSessionOrders(updatedSessionList);
    try {
      localStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(updatedSessionList));
    } catch (e) {
      console.error(e);
    }

    // 4. Save payment tendered info for receipt
    setLastPaymentInfo({
      method: paymentMethod,
      tendered: tenderNum > 0 ? tenderNum : grandTotal,
      change: cashChange,
    });
    setCompletedOrder(fullOrder);

    onShowToast(`Transaksi ${fullOrder.orderNumber} berhasil disimpan!`);
  };

  // Ready for Next Customer (Reset state while maintaining preset!)
  const handleNextCustomer = () => {
    setCart([]);
    setCashTendered('');
    setOrderNotes('');
    setCompletedOrder(null);
    setLastPaymentInfo(null);
    if (customerMode === 'registered') {
      setSelectedEntity(null);
      setCustomerMode('walk-in');
    }
  };

  // Keyboard shortcut: Enter to checkout if cart has items and modal is not open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completedOrder) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          handleNextCustomer();
        }
        return;
      }
      if (isPresetModalOpen || isHistoryDrawerOpen) return;
      if (e.key === 'Enter' && e.ctrlKey && cart.length > 0) {
        handleCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, completedOrder, isPresetModalOpen, isHistoryDrawerOpen, grandTotal, tenderNum]);

  // Session Statistics
  const sessionStats = useMemo(() => {
    const totalOmset = sessionOrders.reduce((sum, ord) => {
      const num = parseInt(ord.totalDana.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + num;
    }, 0);

    const totalItems = sessionOrders.reduce((sum, ord) => {
      return sum + ord.items.reduce((iSum, it) => iSum + (it.quantity || 1), 0);
    }, 0);

    return {
      omset: totalOmset,
      txCount: sessionOrders.length,
      itemsCount: totalItems,
    };
  }, [sessionOrders]);

  return (
    <div className="space-y-4 pb-16 animate-in fade-in duration-200">
      {/* ================= 1. TOP HEADER & NAVIGATION ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-[#008d91] text-white flex items-center justify-center shadow-xs shrink-0">
            <Store className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                POS Kasir Transaksi S-SALUR
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200/70">
                Mode Kasir Cepat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Input pesanan kasir instan — konfigurasi sesi terkunci otomatis untuk setiap pelanggan berikutnya.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sesi History Button */}
          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Lihat riwayat transaksi sesi ini"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Riwayat Sesi ({sessionOrders.length})</span>
          </button>

          {/* Edit Preset Button */}
          <button
            type="button"
            onClick={() => {
              setDraftTanggal(sessionPreset.tanggal);
              setDraftVia(sessionPreset.via);
              setDraftProyek(sessionPreset.proyekSapa);
              setDraftPromoId(sessionPreset.promoId);
              setDraftContainerKey(`${sessionPreset.containerName}||${sessionPreset.gudangName}`);
              setDraftEkspedisi(sessionPreset.ekspedisi);
              setDraftOngkir(String(sessionPreset.ongkir));
              setIsPresetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#008d91] bg-teal-50/80 hover:bg-teal-100/70 border border-teal-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Ubah Preset Sesi</span>
          </button>

          {/* Back to Transaksi S-SALUR Dashboard */}
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>

      {/* ================= 2. ACTIVE SESSION PRESET STICKY BAR ================= */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-800 to-slate-900 rounded-2xl p-3.5 text-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Preset Kasir Aktif:
            </span>

            {/* Tanggal */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-teal-300" />
              <span>{sessionPreset.tanggal}</span>
            </div>

            {/* Via */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
              <Store className="w-3.5 h-3.5 text-cyan-300" />
              <span>Via: <strong>{sessionPreset.via}</strong></span>
            </div>

            {/* Proyek SAPA */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
              <span className="text-amber-300">🌸</span>
              <span className="truncate max-w-[140px] sm:max-w-none">{sessionPreset.proyekSapa}</span>
            </div>

            {/* Promo */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
              <Tag className="w-3.5 h-3.5 text-pink-300" />
              <span className={sessionPreset.promoId !== 'none' ? 'text-pink-300 font-bold' : 'text-slate-300'}>
                {sessionPreset.promoName}
              </span>
            </div>

            {/* Container */}
            <div className="flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-400/30 text-emerald-200">
              <Box className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                Stok dari: <strong>{sessionPreset.containerName}</strong> ({sessionPreset.gudangName})
              </span>
            </div>

            {/* Ekspedisi & Ongkir */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {sessionPreset.ekspedisi} (Rp{sessionPreset.ongkir.toLocaleString('id-ID')})
              </span>
            </div>
          </div>

          {/* Quick Session Stats chips */}
          <div className="flex items-center gap-3 text-xs self-end sm:self-auto shrink-0 bg-white/5 px-3 py-1 rounded-xl">
            <span className="text-slate-300">
              Omset Sesi: <strong className="text-emerald-400 font-bold">Rp{sessionStats.omset.toLocaleString('id-ID')}</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">
              <strong>{sessionStats.txCount}</strong> tx ({sessionStats.itemsCount} item)
            </span>
          </div>
        </div>
      </div>

      {/* ================= 3. MAIN KASIR INTERFACE (2 COLUMNS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT COLUMN (Col span 7): PRODUCT CATALOG ================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          {/* Catalog Top bar: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari buku, merchandise, kode..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {['Semua', 'Buku Berbayar', 'Welas Asih', 'Leadership'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#008d91] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => {
              const discount = getPromoDiscountForItem(prod);
              const effectivePrice = Math.max(0, prod.price - discount);
              const contStock = containerStockMap.get(prod.title.toLowerCase().trim()) ?? prod.stock ?? 0;
              const cartItem = cart.find((it) => it.id === prod.id);

              return (
                <div
                  key={prod.id}
                  onClick={() => handleAddToCart(prod, 1)}
                  className="group relative bg-slate-50/50 hover:bg-white rounded-xl border border-slate-200/80 hover:border-teal-400 hover:shadow-md p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer text-left"
                >
                  {/* Active Cart Badge */}
                  {cartItem && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs z-10 animate-in zoom-in-50">
                      {cartItem.quantity}
                    </div>
                  )}

                  {/* Top: Cover & Basic Info */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-28 sm:w-24 sm:h-32 mb-2.5 drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <BookCover
                        coverKey={prod.coverKey}
                        title={prod.title}
                        className="w-full h-full rounded-md object-cover shadow-2xs"
                      />
                    </div>

                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                      {prod.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {prod.code || 'Buku S-SALUR'}
                    </span>
                  </div>

                  {/* Bottom: Price & Stock */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 w-full">
                    {/* Price with Promo tag if any */}
                    <div className="flex items-center justify-between">
                      <div>
                        {discount > 0 ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 line-through block">
                              Rp{prod.price.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs font-black text-rose-600">
                              Rp{effectivePrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-black text-[#008d91]">
                            Rp{prod.price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      {/* Stock in configured container */}
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            contStock > 10
                              ? 'bg-emerald-50 text-emerald-700'
                              : contStock > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                          title={`Stok pada ${sessionPreset.containerName}: ${contStock}`}
                        >
                          Stok: {contStock}
                        </span>
                      </div>
                    </div>

                    {/* Quick +1, +5 Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(prod, 1);
                        }}
                        className="py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-[11px] font-semibold text-slate-700 rounded-md transition-colors"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(prod, 5);
                        }}
                        className="py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-[11px] font-semibold text-slate-700 rounded-md transition-colors"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-3 py-12 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Tidak ada produk yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Col span 5): CART & CHECKOUT ================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 sticky top-4">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#008d91]" />
              <h2 className="text-sm font-bold text-slate-800">
                Keranjang Kasir ({cart.reduce((s, it) => s + it.quantity, 0)} item)
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>

          {/* Customer / Pembeli Quick Toggle */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Pembeli:</span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('walk-in');
                    setSelectedEntity(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    customerMode === 'walk-in'
                      ? 'bg-[#008d91] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tamu / Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('registered')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    customerMode === 'registered'
                      ? 'bg-[#008d91] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cari Identitas
                </button>
              </div>
            </div>

            {customerMode === 'walk-in' ? (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                <User className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-semibold text-slate-800">Pembeli Umum / Tamu Stand</span>
                <span className="text-[11px] text-slate-400 ml-auto">(Default POS)</span>
              </div>
            ) : (
              <div className="relative">
                {selectedEntity ? (
                  <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-teal-300">
                    <div>
                      <span className="font-bold text-slate-800">{selectedEntity.name}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">({selectedEntity.code})</span>
                      <div className="text-[10px] text-slate-400">{selectedEntity.phone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEntity(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Ketik nama atau kode identitas..."
                      value={customerSearchQuery}
                      onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#008d91]"
                    />
                    {isCustomerDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredCustomerList.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedEntity(c);
                              setIsCustomerDropdownOpen(false);
                            }}
                            className="p-2 hover:bg-teal-50 cursor-pointer text-xs"
                          >
                            <div className="font-bold text-slate-800">{c.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {c.code} • {c.phone} • {c.address}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Item Rows */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-100">
            {cart.map((item) => {
              const itemTotal = (item.price - item.discountPerItem) * item.quantity;
              return (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  {/* Title & Price */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-semibold text-slate-800 truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>Rp{item.price.toLocaleString('id-ID')}</span>
                      {item.discountPerItem > 0 && (
                        <span className="text-rose-600 font-medium">
                          (Disc -Rp{item.discountPerItem.toLocaleString('id-ID')})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg bg-slate-50 p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateCartQty(item.id, -1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleSetCartQty(item.id, e.target.value)}
                      className="w-7 text-center font-bold text-slate-800 bg-transparent text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateCartQty(item.id, 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0 w-20">
                    <span className="font-bold text-slate-800 block">
                      Rp{itemTotal.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-[10px] text-slate-400 hover:text-rose-600 mt-0.5 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}

            {cart.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <ShoppingCart className="w-8 h-8 mx-auto mb-1.5 opacity-30" />
                <p className="text-xs">Pilih buku di sebelah kiri untuk menambahkan ke keranjang.</p>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal Produk:</span>
              <span>Rp{subtotalGross.toLocaleString('id-ID')}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex items-center justify-between text-rose-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Potongan Promo ({sessionPreset.promoName}):</span>
                </span>
                <span>-Rp{totalDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Ongkir ({sessionPreset.ekspedisi}):</span>
              <span>Rp{totalOngkir.toLocaleString('id-ID')}</span>
            </div>

            {/* Total Display */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wide">
                Total Bayar:
              </span>
              <span className="text-lg font-black text-[#008d91]">
                Rp{grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Metode Pembayaran:</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { key: 'Tunai', label: '💵 Tunai' },
                { key: 'BCA 888', label: '💳 BCA 888' },
                { key: 'BCA 388', label: '💳 BCA 388' },
                { key: 'Mandiri', label: '🏦 Mandiri' },
                { key: 'QRIS', label: '📱 QRIS' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPaymentMethod(m.key as any)}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    paymentMethod === m.key
                      ? 'bg-teal-50 border-[#008d91] text-[#008d91] shadow-2xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* If Cash: Tender Calculator */}
            {paymentMethod === 'Tunai' && (
              <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/70 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">Uang Diterima (Rp):</span>
                  {/* Quick Money Chips */}
                  <div className="flex items-center gap-1">
                    {[
                      { label: 'Pas', val: grandTotal },
                      { label: '50rb', val: 50000 },
                      { label: '100rb', val: 100000 },
                      { label: '200rb', val: 200000 },
                      { label: '500rb', val: 500000 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setCashTendered(chip.val.toLocaleString('id-ID'))}
                        className="text-[10px] bg-white border border-emerald-300 text-emerald-800 px-1.5 py-0.5 rounded hover:bg-emerald-100 font-semibold cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder={`Contoh: ${grandTotal.toLocaleString('id-ID')}`}
                  value={cashTendered}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setCashTendered(clean ? parseInt(clean, 10).toLocaleString('id-ID') : '');
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                {/* Kembalian Display */}
                <div className="flex items-center justify-between text-xs font-bold pt-1">
                  <span className="text-emerald-900">Kembalian:</span>
                  <span className={`text-sm ${isCashInsufficient ? 'text-rose-600' : 'text-emerald-700 font-black'}`}>
                    {isCashInsufficient
                      ? 'Uang Kurang!'
                      : `Rp${cashChange.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action: Checkout Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={cart.length === 0 || isCashInsufficient}
              onClick={handleCheckout}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                cart.length === 0 || isCashInsufficient
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-[#008d91] hover:from-teal-700 hover:to-[#007b7e] text-white active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Bayar & Simpan (Rp{grandTotal.toLocaleString('id-ID')})
              </span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-1">
              Shortcut: <strong>Ctrl + Enter</strong> untuk checkout instan
            </p>
          </div>
        </div>
      </div>

      {/* ================= 4. MODAL: PRESET SESI KASIR (SET SATU KALI) ================= */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008d91] flex items-center justify-center font-bold">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Konfigurasi Preset Sesi POS Kasir
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Diset satu kali, lalu otomatis digunakan untuk setiap transaksi kasir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Tanggal */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Tanggal Transaksi:
                </label>
                <input
                  type="text"
                  value={draftTanggal}
                  onChange={(e) => setDraftTanggal(e.target.value)}
                  placeholder="e.g. 14 Nov 2021"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Via Transaksi S-SALUR */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Via Transaksi S-SALUR:
                </label>
                <select
                  value={draftVia}
                  onChange={(e) => setDraftVia(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                >
                  {availableVias.map((v) => (
                    <option key={v.id} value={v.namaVia}>
                      {v.namaVia} ({v.tipe})
                    </option>
                  ))}
                  <option value="Stand">Stand Offline</option>
                  <option value="Bazar">Bazar / Event</option>
                </select>
              </div>

              {/* Proyek SAPA */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Proyek SAPA:
                </label>
                <select
                  value={draftProyek}
                  onChange={(e) => setDraftProyek(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                >
                  <option value="Stand Vihara Buddhayana">Stand Vihara Buddhayana</option>
                  <option value="Promo 11.11">Promo 11.11</option>
                  <option value="Bazar Bandung">Bazar Bandung</option>
                  <option value="Umum">Umum / Tanpa Proyek</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.namaKegiatan}>
                      {p.namaKegiatan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Promo S-SALUR */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  4. Promo S-SALUR:
                </label>
                <select
                  value={draftPromoId}
                  onChange={(e) => setDraftPromoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                >
                  <option value="none">Tanpa Promo (Harga Normal)</option>
                  {availablePromos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.namaPromo} - {p.subtitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stok Penjualan dari Container mana */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  5. Stok Penjualan dari Container mana:
                </label>
                <select
                  value={draftContainerKey}
                  onChange={(e) => setDraftContainerKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                >
                  {availableContainers.map((c) => (
                    <option key={c.key} value={c.key}>
                      📦 {c.namaContainer} — {c.lokasiGudang} (Stok: {c.totalStok})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Stok barang yang terjual akan otomatis terpotong langsung dari kontainer yang Anda pilih.
                </p>
              </div>

              {/* Ekspedisi dan Ongkir */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    6. Ekspedisi:
                  </label>
                  <select
                    value={draftEkspedisi}
                    onChange={(e) => setDraftEkspedisi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                  >
                    <option value="Ambil di Tempat">Ambil di Tempat (Di Tempat)</option>
                    <option value="TIKI ECO">TIKI ECO</option>
                    <option value="TIKI ONS">TIKI ONS</option>
                    <option value="TIKI REG">TIKI REG</option>
                    <option value="JNE REG">JNE REG</option>
                    <option value="Kurir Toko">Kurir Toko</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tarif Ongkir (Rp):
                  </label>
                  <input
                    type="text"
                    value={draftOngkir}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setDraftOngkir(clean ? parseInt(clean, 10).toLocaleString('id-ID') : '0');
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePresetModal}
                className="px-5 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007477] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Kunci Preset & Mulai Kasir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. SUCCESS POST-CHECKOUT MODAL (STRUK / RECEIPT) ================= */}
      {completedOrder && lastPaymentInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
            {/* Green Check Icon */}
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800">
                Pembayaran Berhasil!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                No. Pesanan: <strong className="text-slate-800">{completedOrder.orderNumber}</strong>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-slate-500 text-[11px]">
                <span>{completedOrder.date}</span>
                <span>Via: {completedOrder.via}</span>
              </div>

              {/* Items */}
              <div className="space-y-1">
                {completedOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-slate-700">
                    <span className="truncate pr-2">
                      {it.quantity}x {it.title}
                    </span>
                    <span className="font-semibold shrink-0">
                      Rp{((it.price || 0) * (it.quantity || 1)).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Total Bayar:</span>
                  <span className="text-[#008d91]">{completedOrder.totalDana}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Metode:</span>
                  <span>{lastPaymentInfo.method}</span>
                </div>
                {lastPaymentInfo.method === 'Tunai' && (
                  <>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Uang Diterima:</span>
                      <span>Rp{lastPaymentInfo.tendered.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-emerald-700">
                      <span>Kembalian:</span>
                      <span>Rp{lastPaymentInfo.change.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleNextCustomer}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#007477] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Transaksi Baru (Pelanggan Berikutnya)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Nota / Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. SESSION HISTORY DRAWER ================= */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-end z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#008d91]" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Riwayat Transaksi Sesi Ini
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center mb-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Omset</span>
                  <strong className="text-emerald-700">Rp{sessionStats.omset.toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Transaksi</span>
                  <strong className="text-slate-800">{sessionStats.txCount} tx</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Item Terjual</span>
                  <strong className="text-slate-800">{sessionStats.itemsCount} pcs</strong>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 divide-y divide-slate-100">
                {sessionOrders.map((ord) => (
                  <div key={ord.id} className="pt-2 first:pt-0 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{ord.orderNumber}</span>
                      <span className="text-[#008d91]">{ord.totalDana}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{ord.alamat.recipientName}</span>
                      <span>{ord.items.reduce((s, it) => s + it.quantity, 0)} item</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                    </div>
                  </div>
                ))}

                {sessionOrders.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Belum ada transaksi pada sesi kasir saat ini.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup Riwayat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
