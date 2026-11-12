import React, { useState, useEffect } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X,
  MessageSquare,
  Share2,
  Edit3,
  Send,
  FileText,
  Printer,
  CheckCircle2,
  Trash2,
  Link2,
  Award,
  GraduationCap,
} from 'lucide-react';
import { TransaksiAjarItem, TransaksiAjarSubProduct } from '../transaksiAjarData';
import { ModalSayPaid } from './ModalSayPaid';
import { ModalTambahkanKodeMutasi } from './ModalTambahkanKodeMutasi';
import { ModalInvoiceAjar } from './ModalInvoiceAjar';
import { ModalSertifikatAjar } from './ModalSertifikatAjar';
import { SayPaidRecord, RekeningItem, MutasiItem } from '../types';
import { calculateOrderBadges } from '../utils/orderBadgeHelper';
import {
  formatDisplayKodeTransaksi,
  generateKodeTransaksi,
  getUrutanTransaksiPerTahun,
} from '../utils/kodeTransaksiHelper';

interface TransaksiAjarDashboardProps {
  items: TransaksiAjarItem[];
  onUpdateItems: (updated: TransaksiAjarItem[]) => void;
  onShowToast: (msg: string) => void;
  onAddNew?: () => void;
  onEditOrder?: (item: TransaksiAjarItem) => void;
  rekeningList?: RekeningItem[];
  mutasiItems?: MutasiItem[];
  onUpdateMutasiItems?: (updated: MutasiItem[]) => void;
}

export const TransaksiAjarDashboard: React.FC<TransaksiAjarDashboardProps> = ({
  items,
  onUpdateItems,
  onShowToast,
  onAddNew,
  onEditOrder,
  rekeningList = [],
  mutasiItems = [],
  onUpdateMutasiItems,
}) => {
  const [activeTab, setActiveTab] = useState<'Semua' | 'Belum Bayar' | 'Belum Konek Mutasi'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [expandedRecipients, setExpandedRecipients] = useState<Record<string, boolean>>({});
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal Say Paid state
  const [isSayPaidModalOpen, setIsSayPaidModalOpen] = useState(false);
  const [selectedOrderForSayPaid, setSelectedOrderForSayPaid] = useState<TransaksiAjarItem | null>(null);

  const handleOpenSayPaidModal = (order: TransaksiAjarItem) => {
    setSelectedOrderForSayPaid(order);
    setIsSayPaidModalOpen(true);
  };

  // Modal Tambahkan Kode Mutasi state
  const [isConnectMutasiModalOpen, setIsConnectMutasiModalOpen] = useState(false);
  const [selectedOrderForMutasi, setSelectedOrderForMutasi] = useState<TransaksiAjarItem | null>(null);

  const handleOpenConnectMutasiModal = (order: TransaksiAjarItem) => {
    setSelectedOrderForMutasi(order);
    setIsConnectMutasiModalOpen(true);
  };

  // Modal Lihat Invoice state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<TransaksiAjarItem | null>(null);

  const handleOpenInvoiceModal = (order: TransaksiAjarItem) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  // Modal E-Sertifikat Ajar state
  const [isSertifikatModalOpen, setIsSertifikatModalOpen] = useState(false);
  const [selectedOrderForSertifikat, setSelectedOrderForSertifikat] = useState<TransaksiAjarItem | null>(null);

  const handleOpenSertifikatModal = (order: TransaksiAjarItem) => {
    setSelectedOrderForSertifikat(order);
    setIsSertifikatModalOpen(true);
  };

  const handleSaveSayPaid = (orderId: string, records: SayPaidRecord[]) => {
    const updated = items.map((it) => {
      if (it.id === orderId) {
        const badges = it.statusBadges.includes('Paid')
          ? it.statusBadges
          : ['Paid', ...it.statusBadges];
        return {
          ...it,
          statusBadges: badges,
          sayPaidData: records,
        };
      }
      return it;
    });

    onUpdateItems(updated);
    onShowToast(`Pesanan berhasil ditandai Paid (Say Paid tersimpan)`);
  };

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-ajar-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransaksiAjarItem | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');

  // Form states for Add / Edit Modal
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formEventName, setFormEventName] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formItemName, setFormItemName] = useState('');
  const [formQtyPrice, setFormQtyPrice] = useState('');
  const [formDonasiExtra, setFormDonasiExtra] = useState('');
  const [formRecipientDate, setFormRecipientDate] = useState('');
  const [formRecipientsText, setFormRecipientsText] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formTotalDana, setFormTotalDana] = useState('');

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((it) => it.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle expand product
  const handleToggleExpandProduct = (id: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle expand recipient
  const handleToggleExpandRecipient = (id: string) => {
    setExpandedRecipients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open Add Modal or Form Page
  const handleOpenAdd = () => {
    if (onAddNew) {
      onAddNew();
      return;
    }
    setEditingItem(null);
    const targetDate = '14 Nov 2021';
    const nextSeq = getUrutanTransaksiPerTahun(items, targetDate);
    setFormOrderNumber(generateKodeTransaksi('A', 'Call Center', targetDate, nextSeq));
    setFormEventName('Indonesia Lamrim Retreat 2021');
    setFormCustomerId('10001 Lilo');
    setFormDate('14 Nov 2021');
    setFormItemName('Paket Mahasiswa');
    setFormQtyPrice('1 x Rp1.200.000');
    setFormDonasiExtra('');
    setFormRecipientDate('14 Nov 2021');
    setFormRecipientsText('10001 Lilo Lucu');
    setFormKeterangan('Indonesia Lamrim Retreat 2018');
    setFormTotalDana('Rp1.950.000');
    setIsModalOpen(true);
  };

  // Open Edit Modal or Form Page
  const handleOpenEdit = (item: TransaksiAjarItem) => {
    if (onEditOrder) {
      onEditOrder(item);
      return;
    }
    setEditingItem(item);
    setFormOrderNumber(item.orderNumber);
    setFormEventName(item.eventName);
    setFormCustomerId(item.customerId);
    setFormDate(item.date);
    setFormItemName(item.itemName);
    setFormQtyPrice(item.qtyPrice);
    setFormDonasiExtra(item.donasiExtra || '');
    setFormRecipientDate(item.recipientDateBadge);
    setFormRecipientsText(item.recipients.join('\n'));
    setFormKeterangan(item.keterangan);
    setFormTotalDana(item.totalDana);
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientsList = formRecipientsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    if (editingItem) {
      const updated = items.map((it) => {
        if (it.id === editingItem.id) {
          return {
            ...it,
            orderNumber: formOrderNumber,
            eventName: formEventName,
            customerId: formCustomerId,
            date: formDate,
            itemName: formItemName,
            qtyPrice: formQtyPrice,
            donasiExtra: formDonasiExtra.trim() ? formDonasiExtra : undefined,
            recipientDateBadge: formRecipientDate,
            recipients: recipientsList.length > 0 ? recipientsList : ['10001 Lilo Lucu'],
            keterangan: formKeterangan,
            totalDana: formTotalDana,
          };
        }
        return it;
      });
      onUpdateItems(updated);
      onShowToast(`Pesanan ${formOrderNumber} berhasil diperbarui`);
    } else {
      const newItem: TransaksiAjarItem = {
        id: `ajar-tx-${Date.now()}`,
        orderNumber: formOrderNumber,
        eventName: formEventName,
        customerId: formCustomerId,
        date: formDate,
        statusBadges: ['Paid', 'Paid'],
        badgeLetter: 'P',
        itemName: formItemName,
        qtyPrice: formQtyPrice,
        donasiExtra: formDonasiExtra.trim() ? formDonasiExtra : undefined,
        recipientDateBadge: formRecipientDate,
        recipients: recipientsList.length > 0 ? recipientsList : ['10001 Lilo Lucu'],
        keterangan: formKeterangan,
        totalDana: formTotalDana,
        notes: '',
      };
      onUpdateItems([newItem, ...items]);
      onShowToast(`Pesanan A-AJAR baru berhasil ditambahkan`);
    }
    setIsModalOpen(false);
  };

  // Delete Item
  const handleDelete = (id: string) => {
    onUpdateItems(items.filter((it) => it.id !== id));
    onShowToast('Transaksi A-AJAR telah dihapus');
    setActiveMenuId(null);
  };

  // Save Note on Blur or Enter
  const handleSaveNote = (id: string) => {
    const val = notesState[id];
    if (val !== undefined) {
      const updated = items.map((it) => (it.id === id ? { ...it, notes: val } : it));
      onUpdateItems(updated);
      onShowToast('Keterangan pesanan berhasil disimpan');
    }
  };

  // Filter items based on activeTab and search query
  const filteredItems = items.filter((it) => {
    // Helper to evaluate item payment and mutasi connection status
    const targetAmount = parseFloat((it.totalDana || '').replace(/[^\d]/g, '')) || 0;
    let connectedAmount = 0;
    let connectedCount = 0;

    mutasiItems.forEach((m) => {
      m.linkedTransactions?.forEach((l) => {
        const isMatch = l.orderId
          ? l.orderId === it.id
          : Boolean(it.orderNumber && l.kode === it.orderNumber);

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
        it.sayPaidData &&
        it.sayPaidData.length > 0 &&
        it.sayPaidData.some(
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

    const q = searchQuery.toLowerCase();
    const displayKode = formatDisplayKodeTransaksi('A', it);
    const matchesSearch =
      it.orderNumber.toLowerCase().includes(q) ||
      displayKode.toLowerCase().includes(q) ||
      it.eventName.toLowerCase().includes(q) ||
      it.customerId.toLowerCase().includes(q) ||
      it.itemName.toLowerCase().includes(q) ||
      it.keterangan.toLowerCase().includes(q) ||
      it.recipients.some((r) => r.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter === 'Paid') {
      return targetAmount === 0 || it.statusBadges.some((b) => b.toLowerCase().includes('paid'));
    }
    if (statusFilter === 'Unpaid') {
      if (targetAmount === 0) return false;
      return !it.statusBadges.some((b) => b.toLowerCase().includes('paid'));
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Action Toolbar with Tabs on Left and Toolbar Icons on Right */}
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
                id={`tab-ajar-${tab.toLowerCase().replace(/\s+/g, '-')}`}
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
        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
          {/* Eye Off Icon */}
          <button
            id="btn-toolbar-eyeoff-ajar"
            type="button"
            title="Sembunyikan Kolom"
            onClick={() => onShowToast('Mode privasi tampilan diaktifkan')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Search Toggle Icon */}
          <button
            id="btn-toolbar-search-ajar"
            type="button"
            title="Cari"
            onClick={() => {
              const el = document.getElementById('search-ajar-input');
              el?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Sliders / Filter Icon */}
          <button
            id="btn-toolbar-sliders-ajar"
            type="button"
            title="Filter & Pengaturan"
            onClick={() => setFilterModalOpen(true)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button */}
          <button
            id="btn-add-transaksi-ajar"
            type="button"
            onClick={handleOpenAdd}
            title="Tambah Transaksi A-AJAR"
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
              id="search-ajar-input"
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
              id="btn-filter-urutkan-ajar"
              type="button"
              onClick={() => setFilterModalOpen(true)}
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
              checked={items.length > 0 && selectedIds.length === items.length}
              onChange={handleToggleSelectAll}
              className="rounded border-slate-300 text-[#008d91] focus:ring-[#008d91] w-4 h-4 cursor-pointer"
            />
            <span className="ml-1">Nama Item</span>
          </div>
          <div className="w-1/2 text-left pl-8 sm:pl-16">
            <span>Kode</span>
          </div>
        </div>

        {/* List of Orders */}
        <div className="flex flex-col gap-5 pt-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada transaksi pesanan A-AJAR ditemukan
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              const isProductExpanded = !!expandedProducts[item.id];
              const isRecipientExpanded = !!expandedRecipients[item.id];

              return (
                <div
                  key={item.id}
                  id={`order-card-${item.id}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col relative"
                >
                  {/* Top Metadata Header Row */}
                  <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/40 rounded-t-2xl">
                    <div className="flex items-center gap-2.5 text-xs text-slate-700 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(item.id)}
                        className="w-4 h-4 rounded text-[#008d91] focus:ring-[#008d91] border-slate-300 cursor-pointer accent-[#008d91]"
                      />
                      <span className="font-normal text-slate-600">Status Pesanan</span>
                      <span className="text-slate-300 font-light">/</span>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="text-[#008d91] hover:underline font-medium cursor-pointer"
                      >
                        {formatDisplayKodeTransaksi('A', item, index + 1)}
                      </button>
                      <span className="text-slate-300 font-light">/</span>
                      <button
                        type="button"
                        onClick={() => onShowToast(`Melihat event ${item.eventName}`)}
                        className="text-[#008d91] hover:underline font-medium cursor-pointer"
                      >
                        {item.eventName}
                      </button>
                      <span className="text-slate-300 font-light">/</span>
                      <span className="font-normal text-slate-700">{item.customerId}</span>
                      <span className="text-slate-300 font-light">/</span>
                      <span className="font-normal text-slate-700">{item.date}</span>
                    </div>

                    {/* Paid Badges (Kiri: Say Paid, Kanan: Koneksi Kode Mutasi) */}
                    {(() => {
                      const { badge1, badge2 } = calculateOrderBadges(item, mutasiItems);
                      return (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Paid Kiri: Say Paid */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSayPaidModal(item);
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
                              handleOpenConnectMutasiModal(item);
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

                  {/* Order Body: 3 Columns matching user's image */}
                  <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Column 1: Product Item (Left Column, ~5 cols) */}
                    <div className="md:col-span-5 flex flex-col gap-2">
                      <div className="flex items-start gap-3.5">
                        {/* Big Square 'P' Icon */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#263544] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs">
                          {item.badgeLetter || 'P'}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight leading-tight">
                            {item.itemName}
                          </h3>
                          <p className="text-sm font-medium text-slate-700 mt-0.5">
                            {item.qtyPrice}
                          </p>

                          {/* Extra Donasi text if present */}
                          {item.donasiExtra && (
                            <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm font-medium text-slate-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#008d91] inline-block shrink-0" />
                              <span>{item.donasiExtra}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expand Other Products link */}
                      {item.otherProducts && item.otherProducts.length > 0 && (
                        <div className="flex flex-col pl-1 mt-0.5">
                          <button
                            type="button"
                            onClick={() => handleToggleExpandProduct(item.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#008d91] hover:underline font-normal cursor-pointer w-fit"
                          >
                            <span>Lihat Produk Lainnya</span>
                            <span className="w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center text-[10px]">
                              {isProductExpanded ? (
                                <ChevronUp className="w-2.5 h-2.5 stroke-[3]" />
                              ) : (
                                <ChevronDown className="w-2.5 h-2.5 stroke-[3]" />
                              )}
                            </span>
                          </button>

                          {isProductExpanded && (
                            <div className="mt-2 pl-2 border-l-2 border-[#008d91]/30 flex flex-col gap-1.5 animate-in fade-in duration-150">
                              {item.otherProducts.map((p) => (
                                <div
                                  key={p.id}
                                  className="text-xs text-slate-700 flex items-center justify-between gap-2 py-0.5"
                                >
                                  <span className="font-medium">• {p.name}</span>
                                  <span className="text-slate-500 font-normal">{p.qtyPrice}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Column 2: Penerima (Middle Column, ~4 cols) */}
                    <div className="md:col-span-4 flex flex-col text-xs sm:text-sm border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-slate-600 font-normal">Penerima:</span>
                        <span className="bg-[#008d91] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                          {item.recipientDateBadge}
                        </span>
                      </div>
                      <div className="flex flex-col text-slate-800 font-normal space-y-0.5">
                        {item.recipients.map((rec, i) => (
                          <div key={i}>{rec}</div>
                        ))}
                      </div>

                      {/* Expand Other Recipients link */}
                      {item.otherRecipients && item.otherRecipients.length > 0 && (
                        <div className="flex flex-col mt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleExpandRecipient(item.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#008d91] hover:underline font-normal cursor-pointer w-fit mt-0.5"
                          >
                            <span>Lihat Penerima Lainnya</span>
                            <span className="w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center text-[10px]">
                              {isRecipientExpanded ? (
                                <ChevronUp className="w-2.5 h-2.5 stroke-[3]" />
                              ) : (
                                <ChevronDown className="w-2.5 h-2.5 stroke-[3]" />
                              )}
                            </span>
                          </button>

                          {isRecipientExpanded && (
                            <div className="mt-1.5 pl-2 border-l-2 border-[#008d91]/30 flex flex-col gap-0.5 animate-in fade-in duration-150 text-slate-700">
                              {item.otherRecipients.map((rec, i) => (
                                <div key={i}>• {rec}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Column 3: Variable Item A-AJAR (Right Column, ~3 cols) */}
                    <div className="md:col-span-3 flex flex-col border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                      <span className="text-xs text-slate-500 font-normal mb-0.5">
                        Variable Item A-AJAR
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {item.keterangan}
                      </span>
                    </div>
                  </div>

                  {/* Gray Bar: Total Dana */}
                  <div className="bg-[#e9ecef] py-2.5 px-4 sm:px-6 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-normal text-slate-700">Total Dana</span>
                    <span className="text-sm sm:text-base font-bold text-slate-800 tabular-nums">
                      {item.totalDana}
                    </span>
                  </div>

                  {/* Footer Actions Row matching exact layout */}
                  <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-b-2xl">
                    {/* Left Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
                      <button
                        type="button"
                        onClick={() => onShowToast(`Membuka chat pembeli ${item.customerId}`)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Chat Pembeli
                      </button>
                      <button
                        type="button"
                        onClick={() => onShowToast(`Cross selling untuk ${item.customerId}`)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Cross Selling
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Edit Pesanan
                      </button>
                      <button
                        type="button"
                        id={`btn-lihat-invoice-${item.id}`}
                        onClick={() => handleOpenInvoiceModal(item)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[#008d91]"
                      >
                        <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Lihat Invoice</span>
                      </button>
                      <button
                        type="button"
                        id={`btn-sertifikat-${item.id}`}
                        onClick={() => handleOpenSertifikatModal(item)}
                        className="hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 font-semibold text-indigo-600"
                        title="Buka & Cetak E-Sertifikat Kelulusan"
                      >
                        <Award className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>E-Sertifikat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenInvoiceModal(item)}
                        className="hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        Kirim Invoice
                      </button>
                    </div>

                    {/* Right side: Input Tulis Keterangan + Three Dots */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="relative flex-1 sm:w-64">
                        <input
                          type="text"
                          placeholder="Tulis Keterangan"
                          value={notesState[item.id] ?? (item.notes || '')}
                          onChange={(e) =>
                            setNotesState((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          onBlur={() => handleSaveNote(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveNote(item.id);
                            }
                          }}
                          className="w-full bg-[#e9ecef] rounded-full border border-slate-300/60 pl-4 pr-9 py-1.5 text-xs text-slate-700 placeholder-slate-500 focus:outline-none focus:border-[#008d91]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(item.id)}
                          title="Simpan Catatan"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300/80 hover:bg-[#008d91] hover:text-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="text-[10px] leading-none mb-1">...</span>
                        </button>
                      </div>

                      {/* Three Dots Menu with Dropdown */}
                      <div className="relative" data-ajar-menu>
                        <button
                          type="button"
                          id={`dropdown-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeMenuId === item.id
                              ? 'bg-slate-100 text-slate-800'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div
                            id={`dropdown-ajar-${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              id={`menu-say-paid-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleOpenSayPaidModal(item);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                              <span>Say Paid</span>
                            </button>
                            <button
                              type="button"
                              id={`menu-tambahkan-kode-mutasi-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleOpenConnectMutasiModal(item);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Link2 className="w-4 h-4 text-[#008d91]" />
                              <span>Tambahkan Kode Mutasi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEdit(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Transaksi</span>
                            </button>
                            <button
                              type="button"
                              id={`menu-lihat-invoice-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleOpenInvoiceModal(item);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#008d91] hover:bg-[#008d91]/10 text-left transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-[#008d91]" />
                              <span>Lihat Invoice</span>
                            </button>
                            <button
                              type="button"
                              id={`menu-sertifikat-${item.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleOpenSertifikatModal(item);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 text-left transition-colors cursor-pointer"
                            >
                              <Award className="w-4 h-4 text-indigo-600" />
                              <span>E-Sertifikat Resmi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onShowToast(`Cetak invoice pesanan ${item.orderNumber}`);
                              }}
                              className="w-full px-3.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-400" />
                              <span>Cetak Bukti</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDelete(item.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Hapus Pesanan</span>
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

      {/* Modal Add / Edit Transaksi A-AJAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">
                {editingItem ? 'Edit Transaksi A-AJAR' : 'Tambah Transaksi A-AJAR'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. Pesanan
                  </label>
                  <input
                    type="text"
                    required
                    value={formOrderNumber}
                    onChange={(e) => setFormOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      Customer ID / Nama
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormCustomerId('No Name')}
                      className="text-[10px] text-[#008d91] hover:underline font-semibold cursor-pointer"
                      title="Isi dengan No Name"
                    >
                      + No Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Event / Kegiatan
                </label>
                <input
                  type="text"
                  required
                  value={formEventName}
                  onChange={(e) => setFormEventName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Dana
                  </label>
                  <input
                    type="text"
                    required
                    value={formTotalDana}
                    onChange={(e) => setFormTotalDana(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Item Produk A-AJAR</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Paket / Item
                    </label>
                    <input
                      type="text"
                      required
                      value={formItemName}
                      onChange={(e) => setFormItemName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Jumlah x Harga
                    </label>
                    <input
                      type="text"
                      required
                      value={formQtyPrice}
                      onChange={(e) => setFormQtyPrice(e.target.value)}
                      placeholder="e.g. 1 x Rp1.200.000"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Donasi Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formDonasiExtra}
                    onChange={(e) => setFormDonasiExtra(e.target.value)}
                    placeholder="e.g. Donasi: Rp100.000"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Daftar Penerima</h4>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Badge Tanggal Penerima
                  </label>
                  <input
                    type="text"
                    value={formRecipientDate}
                    onChange={(e) => setFormRecipientDate(e.target.value)}
                    placeholder="e.g. 14 Nov 2021"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Daftar Penerima (1 baris 1 nama)
                  </label>
                  <textarea
                    rows={3}
                    value={formRecipientsText}
                    onChange={(e) => setFormRecipientsText(e.target.value)}
                    placeholder="10001 Lilo Lucu&#10;10002 Lilo Lucu"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Variable Item A-AJAR
                </label>
                <input
                  type="text"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="e.g. Indonesia Lamrim Retreat 2018"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Filter & Urutkan</h3>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs text-slate-700">
              <div>
                <label className="font-medium text-slate-600 block mb-1.5">Status Pembayaran</label>
                <div className="flex gap-2">
                  {(['All', 'Paid', 'Unpaid'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-colors ${
                        statusFilter === s
                          ? 'bg-[#008d91] text-white border-[#008d91]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s === 'All' ? 'Semua' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setFilterModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="px-4 py-1.5 text-xs bg-[#008d91] text-white rounded-lg hover:bg-[#05828e]"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Say Paid */}
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

      {/* Modal Lihat Invoice */}
      <ModalInvoiceAjar
        isOpen={isInvoiceModalOpen}
        item={selectedOrderForInvoice}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedOrderForInvoice(null);
        }}
        onShowToast={onShowToast}
      />

      {/* Modal E-Sertifikat Kelulusan A-AJAR */}
      <ModalSertifikatAjar
        isOpen={isSertifikatModalOpen}
        item={selectedOrderForSertifikat}
        onClose={() => {
          setIsSertifikatModalOpen(false);
          setSelectedOrderForSertifikat(null);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
