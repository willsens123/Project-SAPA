import React, { useState, useEffect } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  MoreHorizontal,
  MessageSquare,
  Share2,
  Edit3,
  Send,
  FileText,
  PackageCheck,
  Filter,
  Printer,
  Link2,
  CheckCircle2,
  Truck,
  Trash2,
} from 'lucide-react';
import { SalurOrder, SalurOrderItem } from '../salurData';
import { MutasiItem, RekeningItem, SayPaidRecord } from '../types';
import { BookCover } from './BookCover';
import { ModalPrintAlamat } from './ModalPrintAlamat';
import { ModalTambahkanKodeMutasi } from './ModalTambahkanKodeMutasi';
import { ModalSayPaid } from './ModalSayPaid';
import { ModalInputNoResi } from './ModalInputNoResi';
import { ModalInvoiceSalur } from './ModalInvoiceSalur';
import {
  syncStockInOutFromSalurOrder,
  updateStockInOutPrintDate,
  removeStockInOutForOrder,
} from '../stokSalurData';
import { calculateOrderBadges } from '../utils/orderBadgeHelper';
import { formatDisplayKodeTransaksi } from '../utils/kodeTransaksiHelper';

interface TransaksiSalurDashboardProps {
  orders: SalurOrder[];
  mutasiItems?: MutasiItem[];
  rekeningList?: RekeningItem[];
  onUpdateOrders?: (updatedOrders: SalurOrder[]) => void;
  onUpdateMutasiItems?: (updatedItems: MutasiItem[]) => void;
  onAddNew: () => void;
  onEditOrder?: (order: SalurOrder) => void;
  onShowToast?: (msg: string) => void;
  onResiSaved?: (order: SalurOrder, resi: string) => void;
}

export const TransaksiSalurDashboard: React.FC<TransaksiSalurDashboardProps> = ({
  orders,
  mutasiItems = [],
  rekeningList = [],
  onUpdateOrders = (_updated: SalurOrder[]) => {},
  onUpdateMutasiItems = () => {},
  onAddNew,
  onEditOrder,
  onShowToast = (_msg: string) => {},
  onResiSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'Semua' | 'Belum Bayar' | 'Belum Konek Mutasi' | 'Belum Dikirim'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [ordersToPrint, setOrdersToPrint] = useState<SalurOrder[]>([]);
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState<string | null>(null);

  // Modal Tambahkan Kode Mutasi state
  const [isConnectMutasiModalOpen, setIsConnectMutasiModalOpen] = useState(false);
  const [selectedOrderForMutasi, setSelectedOrderForMutasi] = useState<SalurOrder | null>(null);

  const handleOpenConnectMutasiModal = (order: SalurOrder) => {
    setSelectedOrderForMutasi(order);
    setIsConnectMutasiModalOpen(true);
  };

  // Modal Say Paid state
  const [isSayPaidModalOpen, setIsSayPaidModalOpen] = useState(false);
  const [selectedOrderForSayPaid, setSelectedOrderForSayPaid] = useState<SalurOrder | null>(null);

  const handleOpenSayPaidModal = (order: SalurOrder) => {
    setSelectedOrderForSayPaid(order);
    setIsSayPaidModalOpen(true);
  };

  const handleSaveSayPaid = (orderId: string, records: SayPaidRecord[]) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const badges = o.statusBadges.includes('Paid')
          ? o.statusBadges
          : ['Paid', ...o.statusBadges];
        return {
          ...o,
          paymentStatus: 'Paid' as const,
          statusBadges: badges,
          sayPaidData: records,
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    onShowToast(`Pesanan berhasil ditandai Paid (Say Paid tersimpan)`);
  };

  // Modal Input No Resi state
  const [isInputResiModalOpen, setIsInputResiModalOpen] = useState(false);
  const [selectedOrderForResi, setSelectedOrderForResi] = useState<SalurOrder | null>(null);

  const handleOpenInputResiModal = (order: SalurOrder) => {
    setSelectedOrderForResi(order);
    setIsInputResiModalOpen(true);
  };

  const handleSaveNoResi = (orderId: string, resi: string) => {
    const trimmed = resi.trim();
    const hasResi = trimmed !== '' && trimmed !== '-';
    let targetOrderToSync: SalurOrder | undefined;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const todayFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const updatedOrder: SalurOrder = {
          ...o,
          stockOutContainer: o.stockOutContainer || 'Rak',
          stockOutLokasi: o.stockOutLokasi || 'Kantor Bandung',
          ekspedisi: {
            ...o.ekspedisi,
            name: hasResi ? (o.ekspedisi?.name || 'TIKI ONS') : '',
            noResi: hasResi ? trimmed : '',
            isShipped: hasResi,
          },
          shippingStatus: hasResi ? ('Sudah Dikirim' as const) : ('Belum dikirim' as const),
        };
        targetOrderToSync = updatedOrder;
        return updatedOrder;
      }
      return o;
    });

    onUpdateOrders(updated);

    if (hasResi && targetOrderToSync) {
      const effPrintDate = targetOrderToSync.printDate || targetOrderToSync.printStatusBadge?.text || todayFormatted;
      syncStockInOutFromSalurOrder(targetOrderToSync, trimmed, effPrintDate);
      if (onResiSaved) {
        onResiSaved(targetOrderToSync, trimmed);
      }
    } else if (!hasResi) {
      removeStockInOutForOrder(orderId);
    }

    onShowToast(
      hasResi
        ? `No Resi berhasil disimpan: ${trimmed} (Status: Sudah Dikirim, mutasi keluar tercatat di Stock In/Out)`
        : `No Resi dikosongkan (Status: Belum dikirim)`
    );
  };

  // Modal Lihat Invoice state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<SalurOrder | null>(null);

  const handleOpenInvoiceModal = (order: SalurOrder) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  // Helper to calculate Paid 1 (Say Paid) and Paid 2 (Koneksi Mutasi) badges
  const getOrderBadges = (order: SalurOrder) => {
    return calculateOrderBadges(order, mutasiItems);
  };

  // Close dropdown menu on outside click or scroll
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-order-menu]')) {
        setActiveDropdownOrderId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenPrintModal = (targetOrderIds?: string[]) => {
    const ids = targetOrderIds && targetOrderIds.length > 0 ? targetOrderIds : selectedOrders;
    const filtered = orders.filter((o) => ids.includes(o.id));
    setOrdersToPrint(filtered.length > 0 ? filtered : orders);
    setIsPrintModalOpen(true);
  };

  const handleConfirmPrint = (
    targetOrderIds: string[],
    printDate: string,
    stockOutContainer: string = 'Rak',
    stockOutLokasi: string = 'Kantor Bandung'
  ) => {
    targetOrderIds.forEach((id) => {
      updateStockInOutPrintDate(id, printDate);
    });

    const updated = orders.map((ord) => {
      if (targetOrderIds.includes(ord.id)) {
        const updatedOrd: SalurOrder = {
          ...ord,
          printDate,
          stockOutContainer: stockOutContainer || ord.stockOutContainer || 'Rak',
          stockOutLokasi: stockOutLokasi || ord.stockOutLokasi || 'Kantor Bandung',
          printStatusBadge: { text: printDate, type: 'red' as const },
          alamat: {
            ...ord.alamat,
            badgeDate: printDate,
          },
        };

        // Jika pesanan ini sudah memiliki resi, perbarui pengeluaran Item S-SALUR pada Stok In/Out sesuai container dan tanggal print
        if (updatedOrd.ekspedisi?.noResi && updatedOrd.ekspedisi.noResi !== '-') {
          syncStockInOutFromSalurOrder(updatedOrd, updatedOrd.ekspedisi.noResi, printDate);
        }

        return updatedOrd;
      }
      return ord;
    });
    onUpdateOrders(updated);
  };

  // Filter orders based on tab and search
  const filteredOrders = orders.filter((order) => {
    // Helper to evaluate order payment and shipping status
    const targetAmount = parseFloat((order.totalDana || '').replace(/[^\d]/g, '')) || 0;
    let connectedAmount = 0;
    let connectedCount = 0;

    mutasiItems.forEach((m) => {
      m.linkedTransactions?.forEach((l) => {
        const isMatch = l.orderId
          ? l.orderId === order.id
          : Boolean(order.orderNumber && l.kode === order.orderNumber);

        if (isMatch) {
          connectedCount++;
          if (l.dbCr === 'CR') {
            connectedAmount += Math.abs(l.nominalAkhir);
          } else if (l.dbCr === 'DB') {
            connectedAmount -= Math.abs(l.nominalAkhir);
          } else {
            connectedAmount += l.nominalAkhir;
          }
        }
      });
    });

    const isKonekMutasi = targetAmount === 0 || connectedCount > 0;
    const diff = targetAmount === 0 ? 0 : connectedAmount - targetAmount;
    // Lunas: sudah terkoneksi ke mutasi dan nominal pas atau lebih, atau jika Rp 0
    const isLunas = targetAmount === 0 || (isKonekMutasi && (Math.abs(diff) < 1 || diff >= 0));

    const hasSayPaid =
      targetAmount === 0 ||
      Boolean(
        order.sayPaidData &&
        order.sayPaidData.length > 0 &&
        order.sayPaidData.some(
          (r) =>
            (r.nominal !== '' && r.nominal !== 0 && r.nominal !== undefined && r.nominal !== null) ||
            Boolean(r.rekening && r.rekening.trim()) ||
            Boolean(r.tanggalPembayaran && r.tanggalPembayaran.trim()) ||
            Boolean(r.buktiFotoUrls && r.buktiFotoUrls.length > 0)
        )
      );

    const resi = (order.ekspedisi?.noResi || '').trim();
    const hasResi = resi !== '' && resi !== '-';

    // 1. Tab "Belum Bayar": filter semua transaksi yang belum say paid dan belum dikonek-kan ke mutasi dan filter semua transaksi yang sudah dikonekan ke mutasi tapi belum lunas atau membayar kelebihan
    if (activeTab === 'Belum Bayar') {
      const isBelumSayPaidDanBelumKonek = !hasSayPaid && !isKonekMutasi;
      const isKonekTapiBelumLunasAtauLebih = isKonekMutasi && Math.abs(diff) >= 1;
      if (!isBelumSayPaidDanBelumKonek && !isKonekTapiBelumLunasAtauLebih) {
        return false;
      }
    }

    // 2. Tab "Belum Konek Mutasi": filter semua transaksi yang sudah say paid, tapi belum dikonek-an ke mutasi
    if (activeTab === 'Belum Konek Mutasi') {
      if (!hasSayPaid || isKonekMutasi) {
        return false;
      }
    }

    // 3. Tab "Belum Dikirim": filter semua transaksi yang sudah dikonek ke mutasi dan sudah lunas tapi belum ada no. resi
    if (activeTab === 'Belum Dikirim') {
      if (!isKonekMutasi || !isLunas || hasResi) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const displayKode = formatDisplayKodeTransaksi('S', order);
      const matchNumber = order.orderNumber.toLowerCase().includes(q) || displayKode.toLowerCase().includes(q);
      const matchCustomer = (order.idPembeli || order.customerId || '').toLowerCase().includes(q);
      const matchPenerima = (order.idPenerima || order.customerCode || '').toLowerCase().includes(q);
      const matchVia = (order.via || '').toLowerCase().includes(q);
      const matchDate = (order.date || '').toLowerCase().includes(q);
      const matchBook = order.items.some((item) => item.title.toLowerCase().includes(q));
      const matchAddress = order.alamat.recipientName.toLowerCase().includes(q) ||
        order.alamat.street.toLowerCase().includes(q);
      if (!matchNumber && !matchCustomer && !matchPenerima && !matchVia && !matchDate && !matchBook && !matchAddress) {
        return false;
      }
    }
    return true;
  });

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Action Bar matching Image 1 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Filter Tabs matching image: Semua, Belum Bayar, Belum Konek Mutasi, Belum Dikirim */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {(['Semua', 'Belum Bayar', 'Belum Konek Mutasi', 'Belum Dikirim'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm md:text-base font-semibold transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#008d91] text-white'
                    : 'bg-[#a8a8a8] hover:bg-[#999999] text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Icons & + Add Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Eye Off Icon */}
          <button
            type="button"
            title="Sembunyikan Kolom"
            onClick={() => onShowToast('Mode privasi tampilan diaktifkan')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Search Toggle Icon */}
          <button
            type="button"
            title="Cari"
            onClick={() => {
              const el = document.getElementById('search-daftar-pesanan');
              el?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Sliders / Filter Icon */}
          <button
            type="button"
            title="Filter & Pengaturan"
            onClick={() => onShowToast('Menampilkan opsi filter pesanan')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button */}
          <button
            id="btn-add-transaksi-salur"
            type="button"
            onClick={onAddNew}
            title="Tambah Transaksi S-SALUR"
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Card: Daftar Pesanan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col p-4 sm:p-6">
        {/* Title */}
        <h2 className="text-sm sm:text-[15px] font-semibold text-slate-700 mb-3">
          Daftar Pesanan
        </h2>

        {/* Sub-header row: Search Input & Filter & Urutkan */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4">
          {/* Search Here Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-daftar-pesanan"
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>

          {/* Action buttons: Print Alamat (when checked) & Filter & Urutkan */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {selectedOrders.length > 0 && (
              <button
                type="button"
                id="btn-toolbar-print-alamat"
                onClick={() => handleOpenPrintModal(selectedOrders)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#00787c] rounded-full px-4 py-1.5 transition-all shadow-xs cursor-pointer animate-in fade-in"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Alamat ({selectedOrders.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onShowToast('Urutkan berdasarkan transaksi terbaru')}
              className="flex items-center gap-1.5 text-xs font-normal text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span>Filter & Urutkan</span>
            </button>
          </div>
        </div>

        {/* Table column headers */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-[11px] font-medium text-slate-400 px-1">
          <div className="w-1/2">Nama Item</div>
          <div className="w-1/2 pl-6">Kode</div>
        </div>

        {/* Orders list */}
        <div className="flex flex-col gap-5 pt-4">
          {filteredOrders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <PackageCheck className="w-12 h-12 stroke-[1.2] text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">Tidak ada pesanan ditemukan</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Coba sesuaikan tab filter atau klik tombol "+ Add" untuk membuat transaksi baru.
              </p>
            </div>
          ) : (
            filteredOrders.map((order, index) => {
              const isSelected = selectedOrders.includes(order.id);
              const isExpanded = !!expandedCards[order.id];

              return (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col relative"
                >
                  {/* Top Metadata Header Row */}
                  <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/40 rounded-t-2xl">
                    <div className="flex items-center gap-2.5 text-xs text-slate-700 flex-wrap">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="w-4 h-4 rounded text-[#008d91] focus:ring-[#008d91] border-slate-300 cursor-pointer accent-[#008d91]"
                      />

                      {/* Header details text */}
                      <span className="font-normal text-slate-600">Status Pesanan</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-medium text-[#008d91]">{formatDisplayKodeTransaksi('S', order, index + 1)}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-normal text-slate-700">{order.idPembeli || order.customerId}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-normal text-slate-700">{order.idPenerima || order.customerCode}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-normal text-slate-700">{order.date}</span>

                      {/* Pilihan Print Alamat saat checkbox di sebelah Status Pesanan dichecklist */}
                      {isSelected && (
                        <button
                          type="button"
                          id={`btn-card-print-alamat-${order.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPrintModal([order.id]);
                          }}
                          className="ml-1 sm:ml-2 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-[#008d91] hover:bg-[#00787c] text-white transition-all shadow-xs cursor-pointer animate-in fade-in zoom-in-95"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Alamat</span>
                        </button>
                      )}
                    </div>

                    {/* Paid Badges & Actions */}
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPrintModal([order.id]);
                          }}
                          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#008d91] text-[#008d91] hover:bg-[#008d91] hover:text-white transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Alamat</span>
                        </button>
                      )}
                      
                      {/* 2 Dynamic Badges: Paid 1 (Say Paid) & Paid 2 (Mutasi) */}
                      {(() => {
                        const { badge1, badge2 } = getOrderBadges(order);
                        return (
                          <div className="flex items-center gap-1.5">
                            {/* Paid Pertama: Say Paid */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSayPaidModal(order);
                              }}
                              className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md shadow-2xs cursor-pointer transition-all min-w-[28px] text-center ${badge1.bgClass}`}
                              title={badge1.title}
                            >
                              {badge1.text}
                            </button>

                            {/* Paid Kedua: Koneksi Kode Mutasi */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenConnectMutasiModal(order);
                              }}
                              className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md shadow-2xs cursor-pointer transition-all min-w-[28px] text-center ${badge2.bgClass}`}
                              title={badge2.title}
                            >
                              {badge2.text}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Body Content Columns */}
                  <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Column 1: Products (Span 5) */}
                    <div className="md:col-span-5 flex flex-col gap-3">
                      {/* Tampilkan maksimal 2 produk jika lebih dari 2 dan belum dibuka */}
                      {(() => {
                        const hasMoreItems = order.items.length > 2;
                        const displayedItems = hasMoreItems && !isExpanded ? order.items.slice(0, 2) : order.items;

                        return (
                          <>
                            {displayedItems.map((item, idx) => (
                              <div key={item.id || idx} className="flex items-start gap-3">
                                <BookCover coverKey={item.coverKey} size="md" />
                                <div className="flex flex-col">
                                  <h3 className="text-[13.5px] font-bold text-slate-800 leading-tight">
                                    {item.title}
                                  </h3>
                                  <span className="text-xs text-slate-500 mt-1">
                                    {item.quantity} x Rp{item.price.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            ))}

                            {/* Breakdown ongkos kirim, donasi, dan kode unik jika ada & diisi */}
                            {(() => {
                              const isValidCost = (costStr?: string) => {
                                if (!costStr || !costStr.trim()) return false;
                                const digits = costStr.replace(/\D/g, '');
                                return digits !== '' && Number(digits) > 0;
                              };
                              const hasOngkir = isValidCost(order.costBreakdown?.ongkir);
                              const hasDonasi = isValidCost(order.costBreakdown?.donasi);
                              const hasKodeUnik = isValidCost(order.costBreakdown?.kodeUnik);

                              if (!hasOngkir && !hasDonasi && !hasKodeUnik) return null;

                              return (
                                <div className="mt-1 flex flex-col gap-1.5 text-xs sm:text-[13px] text-[#006e73] font-medium pl-0.5">
                                  {hasOngkir && (
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#008d91] shrink-0" />
                                      <span>{order.costBreakdown!.ongkir}</span>
                                    </div>
                                  )}
                                  {hasDonasi && (
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#008d91] shrink-0" />
                                      <span>{order.costBreakdown!.donasi}</span>
                                    </div>
                                  )}
                                  {hasKodeUnik && (
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#008d91] shrink-0" />
                                      <span>{order.costBreakdown!.kodeUnik}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* "Lihat Produk Lainnya" hanya muncul jika item > 2, dan diletakkan di paling bawah */}
                            {hasMoreItems && (
                              <button
                                type="button"
                                onClick={() => toggleExpandCard(order.id)}
                                className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-[#008d91] hover:text-[#00757a] mt-1.5 cursor-pointer w-fit transition-colors"
                              >
                                <span>Lihat Produk Lainnya</span>
                                <span className="w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                                  )}
                                </span>
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Column 2: Alamat (Span 4) */}
                    <div className="md:col-span-4 flex flex-col text-xs text-slate-600 leading-relaxed border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-slate-700 text-xs">Alamat</span>
                        {(() => {
                          const isPrinted =
                            order.printStatusBadge &&
                            order.printStatusBadge.text &&
                            !order.printStatusBadge.text.toLowerCase().includes('belum');
                          const printDate = isPrinted
                            ? order.alamat?.badgeDate || order.printStatusBadge?.text
                            : null;
                          if (!printDate) return null;
                          return (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#008d91] text-white">
                              {printDate}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="font-medium text-slate-800 text-xs">{order.alamat.recipientName}</div>
                      <div className="text-slate-600">{order.alamat.phone}</div>
                      <div className="text-slate-600">{order.alamat.street}</div>
                      <div className="text-slate-600">{order.alamat.cityProvince}</div>
                      <div className="text-slate-600">{order.alamat.postalCode}</div>
                    </div>

                    {/* Column 3: Ekspedisi (Span 3) */}
                    <div className="md:col-span-3 flex flex-col text-xs leading-relaxed border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      <span className="text-[11px] text-slate-500 font-medium">Ekspedisi</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 mb-2 min-h-[20px]">
                        {order.ekspedisi?.isShipped && order.ekspedisi?.name ? order.ekspedisi.name : ''}
                      </span>

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-slate-500">No Resi</span>
                        <button
                          type="button"
                          onClick={() => handleOpenInputResiModal(order)}
                          title="Klik untuk input / ubah No Resi"
                          className="cursor-pointer group"
                        >
                          {order.ekspedisi.isShipped ? (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#008d91] text-white group-hover:bg-[#00757a] transition-colors">
                              Sudah Dikirim
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#ef4444] text-white group-hover:bg-[#dc2626] transition-colors">
                              Belum dikirim
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 tracking-tight font-mono">
                          {order.ekspedisi.noResi && order.ekspedisi.noResi !== '-' ? order.ekspedisi.noResi : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenInputResiModal(order)}
                          title="Input / Ubah No Resi"
                          className="text-slate-400 hover:text-[#008d91] p-0.5 rounded cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total Dana Banner Row matching Image 1 */}
                  <div className="bg-[#e9ecef] py-2.5 px-4 sm:px-6 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-normal text-slate-700">Total Dana</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 tabular-nums">
                      {order.totalDana}
                    </span>
                  </div>

                  {/* Action Footer Bar matching Image 1 */}
                  <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-b-2xl">
                    {/* Left Actions */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
                      <button
                        type="button"
                        onClick={() => onShowToast(`Membuka obrolan dengan ${order.alamat.recipientName}`)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Chat Pembeli
                      </button>
                      <button
                        type="button"
                        onClick={() => onShowToast('Membuka rekomendasi Cross Selling untuk pesanan ini')}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Cross Selling
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onEditOrder) {
                            onEditOrder(order);
                          } else {
                            onShowToast(`Mengedit pesanan ${order.orderNumber}`);
                          }
                        }}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Edit Pesanan
                      </button>
                      <button
                        type="button"
                        id={`btn-lihat-invoice-${order.id}`}
                        onClick={() => handleOpenInvoiceModal(order)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[#008d91]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Invoice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenInvoiceModal(order)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Kirim Invoice
                      </button>
                    </div>

                    {/* Right: Tulis Keterangan input pill and More Menu */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <input
                          type="text"
                          placeholder="Tulis Keterangan"
                          value={orderNotes[order.id] || ''}
                          onChange={(e) =>
                            setOrderNotes((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          className="w-full bg-[#e9ecef]/80 text-xs rounded-full pl-4 pr-9 py-1.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#008d91]"
                        />
                        <button
                          type="button"
                          title="Simpan Catatan"
                          onClick={() => {
                            if (orderNotes[order.id]) {
                              onShowToast('Keterangan pesanan disimpan');
                            }
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Vertical three dots icon with popup menu */}
                      <div className="relative" data-order-menu>
                        <button
                          type="button"
                          id={`btn-order-options-${order.id}`}
                          title="Opsi Lainnya"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownOrderId((prev) =>
                              prev === order.id ? null : order.id
                            );
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeDropdownOrderId === order.id
                              ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu when clicked */}
                        {activeDropdownOrderId === order.id && (
                          <div
                            id={`dropdown-order-${order.id}`}
                            className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 origin-bottom-right"
                          >
                            <button
                              type="button"
                              id={`menu-print-alamat-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                handleOpenPrintModal([order.id]);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#008d91] hover:bg-[#008d91]/10 text-left transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4 text-[#008d91]" />
                              <span>Print Alamat</span>
                            </button>

                            <button
                              type="button"
                              id={`menu-tambahkan-kode-mutasi-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                handleOpenConnectMutasiModal(order);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              <Link2 className="w-4 h-4 text-[#008d91]" />
                              <span>Tambahkan Kode Mutasi</span>
                            </button>

                            <button
                              type="button"
                              id={`menu-say-paid-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                handleOpenSayPaidModal(order);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                              <span>Say Paid</span>
                            </button>

                            <button
                              type="button"
                              id={`menu-input-resi-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                handleOpenInputResiModal(order);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              <Truck className="w-4 h-4 text-[#008d91]" />
                              <span>{order.ekspedisi?.noResi && order.ekspedisi.noResi !== '-' ? 'Ubah No Resi' : 'Input No Resi'}</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              id={`menu-lihat-invoice-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                handleOpenInvoiceModal(order);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#008d91] hover:bg-[#008d91]/10 text-left transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-[#008d91]" />
                              <span>Lihat Invoice</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                handleOpenInvoiceModal(order);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span>Kirim Invoice</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                if (onEditOrder) {
                                  onEditOrder(order);
                                } else {
                                  onShowToast(`Mengedit pesanan ${order.orderNumber}`);
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 text-slate-400" />
                              <span>Edit Pesanan</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                onShowToast(`Membuka obrolan dengan ${order.alamat.recipientName}`);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4 text-slate-400" />
                              <span>Chat Pembeli</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownOrderId(null);
                                onUpdateOrders(orders.filter((o) => o.id !== order.id));
                                onShowToast(`Pesanan ${order.orderNumber} berhasil dihapus`);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Print Alamat Pop Up */}
      {isPrintModalOpen && (
        <ModalPrintAlamat
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          orders={ordersToPrint}
          onConfirmPrint={handleConfirmPrint}
          onShowToast={onShowToast}
        />
      )}

      {/* Modal Tambahkan Kode Mutasi Pop Up */}
      <ModalTambahkanKodeMutasi
        isOpen={isConnectMutasiModalOpen}
        onClose={() => {
          setIsConnectMutasiModalOpen(false);
          setSelectedOrderForMutasi(null);
        }}
        order={selectedOrderForMutasi}
        mutasiItems={mutasiItems}
        onUpdateMutasiItems={onUpdateMutasiItems}
        onShowToast={onShowToast}
      />

      {/* Modal Say Paid Pop Up matching exact uploaded form */}
      <ModalSayPaid
        isOpen={isSayPaidModalOpen}
        onClose={() => {
          setIsSayPaidModalOpen(false);
          setSelectedOrderForSayPaid(null);
        }}
        order={selectedOrderForSayPaid}
        rekeningList={rekeningList}
        onSave={handleSaveSayPaid}
      />

      {/* Modal Input Nomor Resi */}
      <ModalInputNoResi
        isOpen={isInputResiModalOpen}
        onClose={() => {
          setIsInputResiModalOpen(false);
          setSelectedOrderForResi(null);
        }}
        order={selectedOrderForResi}
        onSave={handleSaveNoResi}
      />

      {/* Modal Lihat Invoice S-SALUR */}
      <ModalInvoiceSalur
        isOpen={isInvoiceModalOpen}
        order={selectedOrderForInvoice}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedOrderForInvoice(null);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
