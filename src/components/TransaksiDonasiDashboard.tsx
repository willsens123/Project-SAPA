import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  EyeOff,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X,
  MessageSquare,
  Share2,
  Edit3,
  FileText,
  CheckCircle2,
  Link2,
} from 'lucide-react';
import { DonasiOrder, DonasiItem } from '../donasiData';
import { ModalSayPaid } from './ModalSayPaid';
import { ModalTambahkanKodeMutasi } from './ModalTambahkanKodeMutasi';
import { SayPaidRecord, RekeningItem, MutasiItem } from '../types';
import { calculateOrderBadges } from '../utils/orderBadgeHelper';
import {
  formatDisplayKodeTransaksi,
  generateKodeTransaksi,
  getUrutanTransaksiPerTahun,
} from '../utils/kodeTransaksiHelper';

interface TransaksiDonasiDashboardProps {
  orders: DonasiOrder[];
  onUpdateOrders: (updated: DonasiOrder[]) => void;
  onShowToast: (msg: string) => void;
  onAddNew?: () => void;
  onNavigateToReportPelimpahanJasa?: () => void;
  rekeningList?: RekeningItem[];
  mutasiItems?: MutasiItem[];
  onUpdateMutasiItems?: (updated: MutasiItem[]) => void;
}

export const TransaksiDonasiDashboard: React.FC<TransaksiDonasiDashboardProps> = ({
  orders,
  onUpdateOrders,
  onShowToast,
  onAddNew,
  onNavigateToReportPelimpahanJasa,
  rekeningList = [],
  mutasiItems = [],
  onUpdateMutasiItems,
}) => {
  const [activeTab, setActiveTab] = useState<'Semua' | 'Belum Bayar' | 'Belum Konek Mutasi'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const [notesState, setNotesState] = useState<{ [key: string]: string }>({});
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);

  // Modal Say Paid state
  const [isSayPaidModalOpen, setIsSayPaidModalOpen] = useState(false);
  const [selectedOrderForSayPaid, setSelectedOrderForSayPaid] = useState<DonasiOrder | null>(null);

  const handleOpenSayPaidModal = (order: DonasiOrder) => {
    setSelectedOrderForSayPaid(order);
    setIsSayPaidModalOpen(true);
  };

  // Modal Tambahkan Kode Mutasi state
  const [isConnectMutasiModalOpen, setIsConnectMutasiModalOpen] = useState(false);
  const [selectedOrderForMutasi, setSelectedOrderForMutasi] = useState<DonasiOrder | null>(null);

  const handleOpenConnectMutasiModal = (order: DonasiOrder) => {
    setSelectedOrderForMutasi(order);
    setIsConnectMutasiModalOpen(true);
  };

  const handleSaveSayPaid = (orderId: string, records: SayPaidRecord[]) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const badges = o.statusBadges.includes('Paid')
          ? o.statusBadges
          : ['Paid', ...o.statusBadges];
        return {
          ...o,
          statusBadges: badges,
          sayPaidData: records,
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    onShowToast(`Pesanan berhasil ditandai Paid (Say Paid tersimpan)`);
  };

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-donasi-menu]')) {
        setActiveMenuOrderId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modal Add / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<DonasiOrder | null>(null);

  // Form fields for Add/Edit
  const [formOrderNumber, setFormOrderNumber] = useState('CC 123456789');
  const [formCustomerId, setFormCustomerId] = useState('10001 Lilo');
  const [formDate, setFormDate] = useState('14 Nov 2021');
  const [formItemName, setFormItemName] = useState('Donasi Patron Rutin');
  const [formItemCode, setFormItemCode] = useState('D');
  const [formItemQtyPrice, setFormItemQtyPrice] = useState('1 x Rp300.000');
  const [formItemCategory, setFormItemCategory] = useState('Dharma Patron');
  const [formDonaturName, setFormDonaturName] = useState('Lilo');
  const [formKetTitle, setFormKetTitle] = useState('Dharma Patron Rutin');
  const [formKetSubtitle, setFormKetSubtitle] = useState('Oktober');
  const [formPelimpahanName, setFormPelimpahanName] = useState('Suhu Bhadra Ruci');
  const [formTotalDana, setFormTotalDana] = useState('Rp100.080');

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleExpand = (id: string) => {
    setExpandedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setEditingOrder(null);
    const targetDate = '14 Nov 2021';
    const nextSeq = getUrutanTransaksiPerTahun(orders, targetDate);
    setFormOrderNumber(generateKodeTransaksi('D', 'Call Center', targetDate, nextSeq));
    setFormCustomerId('10001 Lilo');
    setFormDate('14 Nov 2021');
    setFormItemName('Donasi Patron Rutin');
    setFormItemCode('D');
    setFormItemQtyPrice('1 x Rp300.000');
    setFormItemCategory('Dharma Patron');
    setFormDonaturName('Lilo');
    setFormKetTitle('Dharma Patron Rutin');
    setFormKetSubtitle('Desember');
    setFormPelimpahanName('Suhu Bhadra Ruci');
    setFormTotalDana('Rp100.080');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order: DonasiOrder) => {
    setEditingOrder(order);
    setFormOrderNumber(order.orderNumber);
    setFormCustomerId(order.customerId);
    setFormDate(order.date);
    const firstItem = order.items[0];
    if (firstItem) {
      setFormItemName(firstItem.name);
      setFormItemCode(firstItem.codeBadge);
      setFormItemQtyPrice(firstItem.qtyPrice);
      setFormItemCategory(firstItem.category);
    }
    setFormDonaturName(order.namaDonatur.name);
    setFormKetTitle(order.keterangan.title);
    setFormKetSubtitle(order.keterangan.subtitle);
    setFormPelimpahanName(order.pelimpahanJasa.name);
    setFormTotalDana(order.totalDana);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      const updatedList = orders.map((o) => {
        if (o.id === editingOrder.id) {
          const updatedItems: DonasiItem[] = [
            {
              id: o.items[0]?.id || `item-${Date.now()}`,
              codeBadge: formItemCode.toUpperCase(),
              codeBadgeColor: formItemCode.toUpperCase() === 'D' ? 'bg-amber-500' : 'bg-[#008d91]',
              name: formItemName,
              qtyPrice: formItemQtyPrice,
              category: formItemCategory,
            },
            ...o.items.slice(1),
          ];
          return {
            ...o,
            orderNumber: formOrderNumber,
            customerId: formCustomerId,
            date: formDate,
            items: updatedItems,
            namaDonatur: {
              ...o.namaDonatur,
              name: formDonaturName,
            },
            keterangan: {
              title: formKetTitle,
              subtitle: formKetSubtitle,
            },
            pelimpahanJasa: {
              ...o.pelimpahanJasa,
              name: formPelimpahanName,
            },
            totalDana: formTotalDana,
          };
        }
        return o;
      });
      onUpdateOrders(updatedList);
      onShowToast('Transaksi donasi berhasil diperbarui');
    } else {
      const newOrder: DonasiOrder = {
        id: `donasi-${Date.now()}`,
        orderNumber: formOrderNumber,
        customerId: formCustomerId,
        date: formDate,
        statusBadges: ['Paid', 'Paid'],
        items: [
          {
            id: `item-${Date.now()}`,
            codeBadge: formItemCode.toUpperCase(),
            codeBadgeColor: formItemCode.toUpperCase() === 'D' ? 'bg-amber-500' : 'bg-[#008d91]',
            name: formItemName,
            qtyPrice: formItemQtyPrice,
            category: formItemCategory,
          },
        ],
        namaDonatur: {
          badgeDate: formDate,
          name: formDonaturName,
        },
        keterangan: {
          title: formKetTitle,
          subtitle: formKetSubtitle,
        },
        pelimpahanJasa: {
          badges: ['Sudah Dikirim', '+ 5 Nama'],
          name: formPelimpahanName,
        },
        totalDana: formTotalDana,
        notesText: '',
      };
      onUpdateOrders([newOrder, ...orders]);
      onShowToast('Transaksi donasi baru berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const filteredOrders = orders.filter((order) => {
    // Helper to evaluate order payment and connection status
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

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const displayKode = formatDisplayKodeTransaksi('D', order);
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      displayKode.toLowerCase().includes(query) ||
      order.customerId.toLowerCase().includes(query) ||
      order.namaDonatur.name.toLowerCase().includes(query) ||
      order.keterangan.title.toLowerCase().includes(query) ||
      order.keterangan.subtitle.toLowerCase().includes(query) ||
      order.items.some((item) => item.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Action Toolbar matching Image */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
        {/* Left Filter Tabs matching image: Semua, Belum Bayar, Belum Konek Mutasi */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {(['Semua', 'Belum Bayar', 'Belum Konek Mutasi'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                id={`tab-donasi-${tab.toLowerCase().replace(/\s+/g, '-')}`}
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

        {/* Right Toolbar Icons & Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
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
              const el = document.getElementById('search-donasi-input');
              el?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {onNavigateToReportPelimpahanJasa && (
            <button
              type="button"
              onClick={onNavigateToReportPelimpahanJasa}
              className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-[#008d91] font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              title="Buka Report Nama Pelimpahan Jasa D-DONASI"
            >
              <FileText className="w-4 h-4" />
              <span>Report Pelimpahan Jasa</span>
            </button>
          )}

          {/* Sliders / Filter Icon */}
          <button
            type="button"
            title="Filter & Pengaturan"
            onClick={() => onShowToast('Menampilkan filter donasi')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button */}
          <button
            type="button"
            id="btn-add-transaksi-donasi"
            onClick={onAddNew || handleOpenAddModal}
            title="Tambah Transaksi D-DONASI"
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Card: Daftar Pesanan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col p-4 sm:p-6">
        {/* Card Title */}
        <h2 className="text-sm sm:text-[15px] font-semibold text-slate-700 mb-3">
          Daftar Pesanan
        </h2>

        {/* Sub-header row: Search Input & Filter & Urutkan */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4">
          {/* Search Here Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-donasi-input"
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>

          {/* Action button: Filter & Urutkan */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onShowToast('Urutkan berdasarkan donasi terbaru')}
              className="flex items-center gap-1.5 text-xs font-normal text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-full px-3.5 py-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span>Filter & Urutkan</span>
            </button>
          </div>
        </div>

        {/* Table column headers */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-[11px] font-medium text-slate-400 px-1">
          <div className="w-1/2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={orders.length > 0 && selectedOrderIds.length === orders.length}
              onChange={handleToggleSelectAll}
              className="rounded border-slate-300 text-[#008d91] focus:ring-[#008d91]"
              title="Pilih Semua"
            />
            <span>Nama Item</span>
          </div>
          <div className="w-1/2 pl-6">Kode</div>
        </div>

        {/* Order Cards List */}
        <div className="flex flex-col gap-5 mt-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada data transaksi donasi ditemukan.
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              const isSelected = selectedOrderIds.includes(order.id);
              const isExpanded = expandedOrderIds.includes(order.id);
              const hasExtra = (order.extraItems && order.extraItems.length > 0) || order.items.length > 2;

              // Items to display: if expanded show both items and extraItems; otherwise first item or up to 2
              const displayItems = isExpanded
                ? [...order.items, ...(order.extraItems || [])]
                : order.items.slice(0, 2);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200/90 shadow-xs bg-white overflow-hidden transition-all hover:border-slate-300 flex flex-col"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-slate-600 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOrder(order.id)}
                        className="rounded border-slate-300 text-[#008d91] focus:ring-[#008d91] cursor-pointer"
                      />
                      <span className="font-semibold text-slate-800">Status Pesanan</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-medium text-[#008d91]">{formatDisplayKodeTransaksi('D', order, idx + 1)}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-medium text-slate-800">{order.customerId}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-600">{order.date}</span>
                    </div>

                    {/* Paid Badges (Kiri: Say Paid, Kanan: Koneksi Kode Mutasi) */}
                    {(() => {
                      const { badge1, badge2 } = calculateOrderBadges(order, mutasiItems);
                      return (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Paid Kiri: Say Paid */}
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

                          {/* Paid Kanan: Koneksi Kode Mutasi */}
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

                  {/* Card Body: 3 Columns matching exact uploaded design */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 sm:p-5">
                    {/* Column 1: Items (Span 5) */}
                    <div className="md:col-span-5 flex flex-col gap-3.5">
                      {displayItems.map((item) => {
                        const badgeBg =
                          item.codeBadgeColor ||
                          (item.codeBadge === 'D' ? 'bg-amber-500' : 'bg-[#008d91]');
                        return (
                          <div key={item.id} className="flex items-start gap-3">
                            {/* Square Letter Badge */}
                            <div
                              className={`w-12 h-12 rounded-xl ${badgeBg} text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs`}
                            >
                              {item.codeBadge}
                            </div>

                            {/* Item Details */}
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-800 leading-tight">
                                {item.name}
                              </span>
                              <span className="text-xs text-slate-500 font-normal mt-0.5">
                                {item.qtyPrice}
                              </span>
                              <span className="text-[11px] text-slate-400 mt-0.5">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Expand / Collapse Button if extra items exist */}
                      {hasExtra && (
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(order.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#008d91] hover:text-[#05828e] cursor-pointer mt-1 self-start transition-colors"
                        >
                          <span>
                            {isExpanded ? 'Sembunyikan Produk Lainnya' : 'Lihat Produk Lainnya'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Column 2: Nama Donatur (Span 3) */}
                    <div className="md:col-span-3 flex flex-col text-xs leading-relaxed border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-slate-500 font-medium">Nama Donatur</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#008d91] text-white">
                          {order.namaDonatur.badgeDate}
                        </span>
                      </div>
                      <span className="font-normal text-slate-700 text-sm mt-0.5">
                        {order.namaDonatur.name}
                      </span>
                    </div>

                    {/* Column 3: Keterangan & Pelimpahan Jasa (Span 4) */}
                    <div className="md:col-span-4 flex flex-col text-xs leading-relaxed border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      {/* Keterangan */}
                      <span className="text-[11px] text-slate-500 font-medium">Keterangan</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 leading-snug">
                        {order.keterangan.title}
                      </span>
                      <span className="font-bold text-slate-800 text-sm leading-snug mb-3">
                        {order.keterangan.subtitle}
                      </span>

                      {/* Nama Pelimpahan Jasa */}
                      <div
                        onClick={onNavigateToReportPelimpahanJasa}
                        className={onNavigateToReportPelimpahanJasa ? 'cursor-pointer group' : ''}
                        title={
                          onNavigateToReportPelimpahanJasa
                            ? 'Buka di Report Nama Pelimpahan Jasa D-DONASI'
                            : ''
                        }
                      >
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-medium group-hover:text-[#008d91] transition-colors">
                            Nama Pelimpahan Jasa
                          </span>
                          {order.pelimpahanJasa.badges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#008d91] text-white"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <span className="font-bold text-slate-800 group-hover:text-[#008d91] text-sm mt-0.5 transition-colors block">
                          {order.pelimpahanJasa.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Dana Banner */}
                  <div className="mx-4 sm:mx-5 bg-[#e9ecef] rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Total Dana</span>
                    <span className="font-bold text-slate-800 tracking-tight">
                      {order.totalDana}
                    </span>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-100 mt-3 text-xs text-slate-600">
                    {/* Left Action Buttons */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => onShowToast(`Membuka chat dengan donatur ${order.namaDonatur.name}`)}
                        className="hover:text-[#008d91] font-medium transition-colors cursor-pointer"
                      >
                        Chat Pembeli
                      </button>

                      <button
                        type="button"
                        onClick={() => onShowToast(`Membuka opsi Cross Selling untuk ${order.orderNumber}`)}
                        className="hover:text-[#008d91] font-medium transition-colors cursor-pointer"
                      >
                        Cross Selling
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(order)}
                        className="hover:text-[#008d91] font-medium transition-colors cursor-pointer"
                      >
                        Edit Pesanan
                      </button>

                      <button
                        type="button"
                        onClick={() => onShowToast(`Invoice donasi ${order.orderNumber} telah dikirim`)}
                        className="hover:text-[#008d91] font-medium transition-colors cursor-pointer"
                      >
                        Kirim Invoice
                      </button>
                    </div>

                    {/* Right: Tulis Keterangan Pill & More button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Tulis Keterangan..."
                          value={notesState[order.id] !== undefined ? notesState[order.id] : (order.notesText || '')}
                          onChange={(e) =>
                            setNotesState((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onShowToast('Keterangan berhasil disimpan');
                            }
                          }}
                          className="w-full bg-[#e9ecef] border-none rounded-full px-4 py-1.5 text-xs text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#008d91]"
                        />
                      </div>

                      {/* Three Dots Menu with Dropdown */}
                      <div className="relative" data-donasi-menu>
                        <button
                          type="button"
                          id={`dropdown-btn-${order.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuOrderId(
                              activeMenuOrderId === order.id ? null : order.id
                            );
                          }}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            activeMenuOrderId === order.id
                              ? 'bg-slate-100 text-slate-800'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Opsi Lainnya"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuOrderId === order.id && (
                          <div
                            id={`dropdown-donasi-${order.id}`}
                            className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              id={`menu-say-paid-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuOrderId(null);
                                handleOpenSayPaidModal(order);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                              <span>Say Paid</span>
                            </button>
                            <button
                              type="button"
                              id={`menu-tambahkan-kode-mutasi-${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuOrderId(null);
                                handleOpenConnectMutasiModal(order);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Link2 className="w-4 h-4 text-[#008d91]" />
                              <span>Tambahkan Kode Mutasi</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuOrderId(null);
                                handleOpenEditModal(order);
                              }}
                              className="w-full px-3.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Transaksi</span>
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

      {/* Modal Add / Edit Donasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800">
                {editingOrder ? 'Edit Transaksi D-DONASI' : 'Tambah Transaksi D-DONASI'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Transaksi</label>
                  <input
                    type="text"
                    required
                    value={formOrderNumber}
                    onChange={(e) => setFormOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">ID Donatur</label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormCustomerId('No Name');
                        setFormDonaturName('No Name');
                      }}
                      className="text-xs text-[#008d91] hover:underline font-semibold cursor-pointer"
                      title="Isi ID dan Nama Donatur dengan No Name"
                    >
                      + No Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Donatur</label>
                  <input
                    type="text"
                    required
                    value={formDonaturName}
                    onChange={(e) => setFormDonaturName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-800 block mb-2">Informasi Donasi</span>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Nama Item</label>
                    <input
                      type="text"
                      required
                      value={formItemName}
                      onChange={(e) => setFormItemName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kode Badge</label>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      value={formItemCode}
                      onChange={(e) => setFormItemCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Qty & Nominal</label>
                    <input
                      type="text"
                      required
                      value={formItemQtyPrice}
                      onChange={(e) => setFormItemQtyPrice(e.target.value)}
                      placeholder="1 x Rp300.000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                    <input
                      type="text"
                      required
                      value={formItemCategory}
                      onChange={(e) => setFormItemCategory(e.target.value)}
                      placeholder="Dharma Patron"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-800 block mb-2">Keterangan & Pelimpahan Jasa</span>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Judul Keterangan</label>
                    <input
                      type="text"
                      value={formKetTitle}
                      onChange={(e) => setFormKetTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sub Judul</label>
                    <input
                      type="text"
                      value={formKetSubtitle}
                      onChange={(e) => setFormKetSubtitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Pelimpahan Jasa</label>
                    <input
                      type="text"
                      value={formPelimpahanName}
                      onChange={(e) => setFormPelimpahanName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Dana</label>
                    <input
                      type="text"
                      required
                      value={formTotalDana}
                      onChange={(e) => setFormTotalDana(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Say Paid Pop Up */}
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
    </div>
  );
};
