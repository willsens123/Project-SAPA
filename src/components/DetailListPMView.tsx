import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Rocket,
  CreditCard,
  ShoppingCart,
  Send,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Check,
  X,
  MessageCircle,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { ListPMItem, ListPMDetailRow } from '../types';
import { IdentitasItem } from '../identitasData';
import { SalurOrder, INITIAL_SALUR_ORDERS } from '../salurData';
import { TransaksiAjarItem, INITIAL_TRANSAKSI_AJAR_LIST } from '../transaksiAjarData';
import { DonasiOrder, INITIAL_DONASI_ORDERS } from '../donasiData';
import {
  findMatchingTransaction,
  rowHasContactItem,
} from '../utils/pmTransactionChecker';
import { ensureAllRecipientsInDetailRows } from '../listPMData';

interface DetailListPMViewProps {
  item: ListPMItem;
  identitasList: IdentitasItem[];
  salurOrders?: SalurOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  donasiOrders?: DonasiOrder[];
  onBack: () => void;
  onUpdateItem: (updatedItem: ListPMItem) => void;
  onShowToast?: (message: string) => void;
  isModal?: boolean;
  onNavigateToFormPM?: (project: ListPMItem) => void;
}

// Book Cover Thumbnail Component matching image.png
function BookCoverThumbnail({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="w-[52px] h-[52px] rounded-xl overflow-hidden shadow-xs border border-teal-200/60 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0f766e] relative p-1 shrink-0 flex flex-col justify-between select-none">
      {/* Pagoda and Golden Rays illustration */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 60 60" fill="none">
        <defs>
          <radialGradient id="pagodaSun" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="60" height="60" fill="url(#pagodaSun)" />
        {/* Golden Stupa / Pagoda */}
        <path
          d="M30 8 L31.5 15 L33.5 16 L33.5 20 L35.5 22 L35.5 26 L24.5 26 L24.5 22 L26.5 20 L26.5 16 L28.5 15 Z"
          fill="#fde047"
          opacity="0.95"
        />
        {/* Soft clouds */}
        <ellipse cx="16" cy="46" rx="14" ry="6" fill="white" opacity="0.35" />
        <ellipse cx="44" cy="44" rx="15" ry="7" fill="white" opacity="0.4" />
      </svg>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-xs" />
        <span className="text-[6px] tracking-wider text-teal-100 font-semibold uppercase drop-shadow-xs">BJM</span>
      </div>

      {/* Book Title */}
      <div className="relative z-10 text-center px-0.5 my-auto">
        <p className="text-[6.5px] font-extrabold text-white leading-[7.5px] line-clamp-2 uppercase tracking-tight drop-shadow-xs">
          {title || 'Jalan Menuju Kemahatahuan'}
        </p>
      </div>

      {/* Year */}
      <div className="relative z-10 text-right">
        <span className="text-[5.5px] text-amber-200/90 font-mono font-bold">2021</span>
      </div>
    </div>
  );
}

export function DetailListPMView({
  item,
  identitasList,
  salurOrders,
  transaksiAjarList,
  donasiOrders,
  onBack,
  onUpdateItem,
  onShowToast,
  isModal,
  onNavigateToFormPM,
}: DetailListPMViewProps) {
  // State
  const [hidePhone, setHidePhone] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'done_teal' | 'menolak' | 'done_gray' | 'pending'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal: View / Edit Template
  const [templateModalRow, setTemplateModalRow] = useState<ListPMDetailRow | null>(null);
  const [templateEditText, setTemplateEditText] = useState('');

  // Modal: Add / Edit Detail Row
  const [rowModalOpen, setRowModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ListPMDetailRow | null>(null);
  const [rowFormData, setRowFormData] = useState({
    identitasId: '',
    deadline: '16 Nov 2021',
    templateName: 'Template A',
    templateContent: '',
    itemTitle: 'Jalan Menuju Kemahatahuan',
    itemSubtitle: 'Buku Berbayar, BJM - 2021',
    itemStock: 'Stok: 100',
    status: 'pending' as 'done_teal' | 'menolak' | 'done_gray' | 'pending',
  });

  // Effective transactions data (from props or localStorage or initial data)
  const effectiveSalurOrders = useMemo(() => {
    if (salurOrders && salurOrders.length > 0) return salurOrders;
    try {
      const saved = localStorage.getItem('salur_orders_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SALUR_ORDERS;
  }, [salurOrders]);

  const effectiveTransaksiAjar = useMemo(() => {
    if (transaksiAjarList && transaksiAjarList.length > 0) return transaksiAjarList;
    try {
      const saved = localStorage.getItem('sapa_transaksi_ajar_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_TRANSAKSI_AJAR_LIST;
  }, [transaksiAjarList]);

  const effectiveDonasiOrders = useMemo(() => {
    if (donasiOrders && donasiOrders.length > 0) return donasiOrders;
    try {
      const saved = localStorage.getItem('donasi_orders_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_DONASI_ORDERS;
  }, [donasiOrders]);

  // Rows data: ensure all recipients/targets that need to be contacted are included
  const rows = useMemo(() => ensureAllRecipientsInDetailRows(item), [item]);

  // Recalculate and update parent ListPMItem
  const saveUpdatedRows = (newRows: ListPMDetailRow[], toastMsg?: string) => {
    // Recalculate progress: percentage of rows with status 'done_teal'
    const doneCount = newRows.filter((r) => r.status === 'done_teal').length;
    const progress = newRows.length > 0 ? Math.round((doneCount / newRows.length) * 100) : 0;

    const updatedItem: ListPMItem = {
      ...item,
      detailRows: newRows,
      progressPercent: progress,
      // also keep recipients in sync if applicable
      recipients: newRows.map((r, idx) => ({
        id: `rec-${item.id}-${idx}`,
        identitasId: r.identitasId,
        codeId: r.codeId,
        nama: r.nama,
        nomorHp: r.nomorHp,
        isSent: r.status === 'done_teal' || r.status === 'done_gray',
        sentAt: r.sentAt,
      })),
    };

    onUpdateItem(updatedItem);
    if (toastMsg && onShowToast) {
      onShowToast(toastMsg);
    }
  };

  // Evaluate matching transactions on mount / when transaction list updates
  useEffect(() => {
    let hasChanges = false;
    const evaluatedRows = rows.map((r) => {
      // Menolak is manual terminal status
      if (r.status === 'menolak') return r;
      // Pending and never sent stays pending
      if (r.status === 'pending' && !r.sentAt) return r;

      if (rowHasContactItem(r)) {
        const match = findMatchingTransaction(
          r,
          effectiveSalurOrders,
          effectiveTransaksiAjar,
          effectiveDonasiOrders
        );
        if (match) {
          if (r.status !== 'done_teal' || !r.matchedTransaction) {
            hasChanges = true;
            return {
              ...r,
              status: 'done_teal' as const,
              matchedTransaction: match,
            };
          }
        } else {
          // If no matching transaction found:
          // If manually marked tosca by user, respect manual override
          if (r.isManualStatus && r.status === 'done_teal') {
            return r;
          }
          if (r.status === 'done_teal') {
            hasChanges = true;
            return {
              ...r,
              status: 'done_gray' as const,
              matchedTransaction: undefined,
            };
          }
        }
      }
      return r;
    });

    if (hasChanges) {
      saveUpdatedRows(evaluatedRows);
    }
  }, [rows, effectiveSalurOrders, effectiveTransaksiAjar, effectiveDonasiOrders]);

  // Synchronize detailRows if item had missing recipient rows
  useEffect(() => {
    if (!item.detailRows || item.detailRows.length < rows.length) {
      saveUpdatedRows(rows);
    }
  }, [item.id, item.detailRows?.length, rows.length]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = r.nama.toLowerCase().includes(q);
        const matchCode = (r.codeId || '').toLowerCase().includes(q);
        const matchHp = r.nomorHp.toLowerCase().includes(q);
        const matchTemplate = r.templateName.toLowerCase().includes(q);
        const matchItem = r.itemTitle.toLowerCase().includes(q);
        const matchProyek = (r.proyekSapa || item.proyekSapa || '').toLowerCase().includes(q);
        if (!matchNama && !matchCode && !matchHp && !matchTemplate && !matchItem && !matchProyek) {
          return false;
        }
      }
      return true;
    });
  }, [rows, statusFilter, searchQuery]);

  // Send WhatsApp action matching requirement:
  // "Jika sudah dikirim, maka buat status "done" abu-abu pada pop up "Kirim Chat/Kelola PM".
  //  Jika dihubungi menggunakan Item, maka jika ada "ID Pembeli" dan "item" pada "Transaksi S-SALUR"
  //  atau "Transaksi A-AJAR" atau "Transaksi D-DONASI" dalam waktu 7 hari setelah dikirim PM:
  //  maka akan terhitung PM berhasil, dan buat jadi "done" warna tosca.
  //  Jika tidak ada item, maka bisa edit manual "done" warna tosca pada pop up "Kirim Chat/Kelola PM"."
  const handleSendWhatsApp = (row: ListPMDetailRow) => {
    let cleanPhone = row.nomorHp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const template =
      row.templateContent ||
      item.templatePesan ||
      'Namo Buddhaya {Nama},\n\nTerima kasih atas partisipasinya dalam Proyek SAPA ({ProyekKode}).';

    const message = template
      .replace(/{Nama}/g, row.nama)
      .replace(/{CodeID}/g, row.codeId || '')
      .replace(/{NomorHP}/g, row.nomorHp)
      .replace(/{ItemTitle}/g, row.itemTitle || '')
      .replace(/{ProyekKode}/g, item.proyekKode || 'MAD');

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const nowStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Initial status upon sending is "done" abu-abu ('done_gray')
    let finalStatus: 'done_teal' | 'done_gray' = 'done_gray';
    let matchedInfo = undefined;
    let toastMsg = `WhatsApp terkirim ke ${row.nama}. Status: Done (Abu-abu)`;

    // 2. Jika dihubungi menggunakan Item, periksa transaksi dalam 7 hari
    if (rowHasContactItem(row)) {
      const match = findMatchingTransaction(
        { ...row, sentAt: nowStr },
        effectiveSalurOrders,
        effectiveTransaksiAjar,
        effectiveDonasiOrders
      );
      if (match) {
        // Terhitung PM berhasil -> buat jadi "done" warna tosca
        finalStatus = 'done_teal';
        matchedInfo = match;
        toastMsg = `WhatsApp terkirim ke ${row.nama}. Transaksi ${match.source} (${match.matchedItem}) cocok: PM Berhasil (Done Tosca)!`;
      }
    } else {
      // Tidak ada item -> bisa edit manual "done" warna tosca
      toastMsg = `WhatsApp terkirim ke ${row.nama}. Status: Done (Abu-abu). Tanpa item, status dapat diedit manual ke Done (Tosca).`;
    }

    const newRows = rows.map((r) =>
      r.id === row.id
        ? {
            ...r,
            status: finalStatus,
            sentAt: nowStr,
            isManualStatus: false,
            matchedTransaction: matchedInfo,
          }
        : r
    );
    saveUpdatedRows(newRows, toastMsg);
  };

  // Change status of a row (Manual Edit)
  const handleChangeStatus = (
    rowId: string,
    newStatus: 'done_teal' | 'menolak' | 'done_gray' | 'pending'
  ) => {
    const newRows = rows.map((r) =>
      r.id === rowId
        ? {
            ...r,
            status: newStatus,
            isManualStatus: true,
            sentAt: newStatus === 'pending' ? undefined : (r.sentAt || '15 Nov 2021'),
            matchedTransaction: newStatus === 'done_teal' ? r.matchedTransaction : undefined,
          }
        : r
    );
    const statusLabels = {
      done_teal: 'Done (Tosca)',
      menolak: 'Menolak',
      done_gray: 'Done (Abu-abu)',
      pending: 'Belum Dikirim',
    };
    saveUpdatedRows(newRows, `Status diubah menjadi "${statusLabels[newStatus]}"`);
    setActiveMenuId(null);
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    const target = rows.find((r) => r.id === rowId);
    const newRows = rows.filter((r) => r.id !== rowId);
    saveUpdatedRows(newRows, `Data "${target?.nama || ''}" dihapus`);
    setActiveMenuId(null);
  };

  // Open Template Modal
  const openTemplateModal = (row: ListPMDetailRow) => {
    setTemplateModalRow(row);
    setTemplateEditText(
      row.templateContent ||
        item.templatePesan ||
        `Namo Buddhaya {Nama},\n\nTerima kasih atas partisipasinya dalam Proyek SAPA ({ProyekKode}). Paket Buku "{ItemTitle}" telah disiapkan.`
    );
  };

  // Save Template Modal
  const handleSaveTemplate = () => {
    if (!templateModalRow) return;
    const newRows = rows.map((r) =>
      r.id === templateModalRow.id ? { ...r, templateContent: templateEditText } : r
    );
    saveUpdatedRows(newRows, 'Template pesan berhasil disimpan');
    setTemplateModalRow(null);
  };

  // Open Add / Edit Row Modal
  const openRowModal = (rowToEdit?: ListPMDetailRow) => {
    if (rowToEdit) {
      setEditingRow(rowToEdit);
      setRowFormData({
        identitasId: rowToEdit.identitasId || '',
        deadline: rowToEdit.deadline || '16 Nov 2021',
        templateName: rowToEdit.templateName || 'Template A',
        templateContent: rowToEdit.templateContent || '',
        itemTitle: rowToEdit.itemTitle || 'Jalan Menuju Kemahatahuan',
        itemSubtitle: rowToEdit.itemSubtitle || 'Buku Berbayar, BJM - 2021',
        itemStock: rowToEdit.itemStock || 'Stok: 100',
        status: rowToEdit.status || 'pending',
      });
    } else {
      setEditingRow(null);
      setRowFormData({
        identitasId: identitasList[0]?.id || '',
        deadline: item.deadline !== '-' ? item.deadline : '16 Nov 2021',
        templateName: 'Template A',
        templateContent: item.templatePesan || '',
        itemTitle:
          item.iconType === 'rocket'
            ? 'Seminar Meditasi & Mindfulness'
            : item.iconType === 'creditCard'
            ? 'Dharma Patron Rutin Bulanan'
            : item.iconType === 'shoppingCart'
            ? 'Paket Sembako & Buku Dharma'
            : 'Jalan Menuju Kemahatahuan',
        itemSubtitle:
          item.iconType === 'rocket'
            ? 'Event Terbuka, EVE - 2021'
            : item.iconType === 'creditCard'
            ? 'Program Donasi, FUN - 2021'
            : item.iconType === 'shoppingCart'
            ? 'Bakti Sosial, MAD - 2021'
            : 'Buku Berbayar, BJM - 2021',
        itemStock:
          item.iconType === 'rocket'
            ? 'Kuota: 50'
            : item.iconType === 'creditCard'
            ? 'Target: Rp 500.000'
            : 'Stok: 100',
        status: 'pending',
      });
    }
    setActiveMenuId(null);
    setRowModalOpen(true);
  };

  // Submit Row Modal
  const handleSubmitRow = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedId = identitasList.find((id) => id.id === rowFormData.identitasId) || identitasList[0];

    const nama = selectedId?.namaLengkap || 'Agustino Ong';
    const codeId = selectedId?.codeId || '00031';
    const nomorHp = selectedId?.nomorHandPhone || '081234567898';
    const avatarInitial = (nama[0] || 'A').toUpperCase();

    if (editingRow) {
      const newRows = rows.map((r) =>
        r.id === editingRow.id
          ? {
              ...r,
              identitasId: rowFormData.identitasId,
              codeId,
              nama,
              nomorHp,
              avatarInitial,
              deadline: rowFormData.deadline,
              templateName: rowFormData.templateName,
              templateContent: rowFormData.templateContent,
              itemTitle: rowFormData.itemTitle,
              itemSubtitle: rowFormData.itemSubtitle,
              itemStock: rowFormData.itemStock,
              status: rowFormData.status,
              isManualStatus: true,
              sentAt: rowFormData.status === 'pending' ? undefined : (r.sentAt || '15 Nov 2021'),
            }
          : r
      );
      saveUpdatedRows(newRows, `Baris "${nama}" berhasil diperbarui`);
    } else {
      const newRow: ListPMDetailRow = {
        id: `dr-${Date.now()}`,
        identitasId: rowFormData.identitasId,
        codeId,
        nama,
        nomorHp,
        avatarInitial,
        avatarBg: 'bg-[#00a89d]',
        deadline: rowFormData.deadline,
        templateName: rowFormData.templateName,
        templateContent: rowFormData.templateContent,
        itemTitle: rowFormData.itemTitle,
        itemSubtitle: rowFormData.itemSubtitle,
        itemStock: rowFormData.itemStock,
        status: rowFormData.status,
        isManualStatus: rowFormData.status !== 'pending',
        sentAt: rowFormData.status === 'pending' ? undefined : '15 Nov 2021',
      };
      saveUpdatedRows([...rows, newRow], `Baris baru "${nama}" berhasil ditambahkan`);
    }
    setRowModalOpen(false);
  };

  // Mask phone helper
  const formatPhone = (phone: string) => {
    if (!hidePhone) return phone;
    if (phone.length <= 6) return '••••••';
    return phone.slice(0, 4) + '••••' + phone.slice(-2);
  };

  // Project icon helper
  const renderProjectIcon = () => {
    switch (item.iconType) {
      case 'rocket':
        return <Rocket className="w-4 h-4 text-white" />;
      case 'creditCard':
        return <CreditCard className="w-4 h-4 text-white" />;
      case 'shoppingCart':
        return <ShoppingCart className="w-4 h-4 text-white" />;
      case 'package':
      default:
        return <Package className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="w-full">
      {/* Top Bar matching image.png */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
            title="Kembali ke List PM"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            List PM: {item.proyekSapa}
          </h2>
        </div>
        {isModal && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main White Card matching image.png */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 min-h-[580px]">
        {/* Top Header Section inside card: Badge on Left & Tools on Right */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          {/* Top-Left Project Info Badge matching image.png */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs px-4 py-2 flex items-center justify-between gap-5 min-w-[170px]">
            <div>
              <div className="text-xs text-slate-400 font-normal">
                {item.detailBadge?.label || item.proyekSapa}
              </div>
              <div className="text-sm font-bold text-slate-800">
                {item.detailBadge?.countText || (rows.length ? `${rows.length} buah` : '10 buah')}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
              {renderProjectIcon()}
            </div>
          </div>

          {/* Top-Right Tools matching image.png */}
          <div className="flex items-center gap-2 relative">
            {/* Eye / Hide Phone Toggle */}
            <button
              type="button"
              onClick={() => setHidePhone(!hidePhone)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              title={hidePhone ? 'Tampilkan Nomor HP' : 'Sembunyikan Nomor HP'}
            >
              {hidePhone ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                searchOpen ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title="Cari Data"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Filter Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  filterOpen || statusFilter !== 'all'
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title="Filter Status"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {/* Filter Dropdown */}
              {filterOpen && (
                <div className="absolute right-0 top-11 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Filter Status
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'all' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Semua Status</span>
                    {statusFilter === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('done_teal');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'done_teal' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Done (Tosca)</span>
                    {statusFilter === 'done_teal' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('menolak');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'menolak' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Menolak</span>
                    {statusFilter === 'menolak' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('done_gray');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'done_gray' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Done (Abu-abu)</span>
                    {statusFilter === 'done_gray' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('pending');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'pending' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Belum Dikirim</span>
                    {statusFilter === 'pending' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* + Add Button */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateToFormPM) {
                  onNavigateToFormPM(item);
                } else {
                  openRowModal();
                }
              }}
              className="bg-[#008d91] hover:bg-[#05828e] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar (collapsible) */}
        {searchOpen && (
          <div className="mb-6 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari Nama, No HP, Template, atau Item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Table matching image.png */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-200/80">
                <th className="py-3.5 px-3 text-slate-600 font-semibold text-sm w-[13%]">
                  Deadline
                </th>
                <th className="py-3.5 px-3 text-slate-600 font-semibold text-sm w-[21%]">
                  Nama
                </th>
                <th className="py-3.5 px-3 text-slate-600 font-semibold text-sm w-[18%]">
                  Proyek SAPA
                </th>
                <th className="py-3.5 px-3 text-slate-600 font-semibold text-sm w-[16%] text-center">
                  Template
                </th>
                <th className="py-3.5 px-3 text-slate-600 font-semibold text-sm w-[20%]">
                  Item
                </th>
                <th className="py-3.5 px-3 text-slate-600 font-semibold text-sm w-[12%] text-right pr-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Tidak ada baris yang sesuai dengan pencarian / filter.'
                      : 'Belum ada data penerima chat untuk List PM ini. Klik "+ Add" untuk menambahkan.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* 1. Deadline */}
                    <td className="py-5 px-3 align-middle text-sm text-slate-700 font-medium whitespace-nowrap">
                      {row.deadline || '-'}
                    </td>

                    {/* 2. Nama */}
                    <td className="py-5 px-3 align-middle">
                      <div className="flex items-center gap-3.5">
                        {/* Circular Teal Avatar */}
                        <div
                          className={`w-12 h-12 rounded-full ${
                            row.avatarBg || 'bg-[#00a89d]'
                          } flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-xs`}
                        >
                          {row.avatarInitial || 'A'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-[15px] truncate">
                            {row.codeId ? `${row.codeId} ` : ''}
                            {row.nama}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-500 font-normal">
                            {formatPhone(row.nomorHp)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Proyek SAPA */}
                    <td className="py-5 px-3 align-middle">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {row.proyekSapa || item.proyekSapa || 'Proyek SAPA'}
                        </span>
                        {(row.proyekKode || item.proyekKode) && (
                          <span className="text-xs text-slate-500 font-medium">
                            {row.proyekKode || item.proyekKode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Template */}
                    <td className="py-5 px-3 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => openTemplateModal(row)}
                        className="bg-[#008d91] hover:bg-[#05828e] text-white px-6 py-1.5 rounded-full text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center justify-center min-w-[140px] transition-all hover:scale-[1.02]"
                        title="Klik untuk melihat / menyesuaikan template pesan"
                      >
                        {row.templateName || 'Template A'}
                      </button>
                    </td>

                    {/* 4. Item */}
                    <td className="py-5 px-3 align-middle">
                      {rowHasContactItem(row) ? (
                        <div className="flex items-center gap-3">
                          <BookCoverThumbnail title={row.itemTitle} subtitle={row.itemSubtitle} />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {row.itemTitle}
                            </span>
                            <span className="text-xs text-slate-500">
                              {row.itemSubtitle}
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5">
                              {row.itemStock}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-[52px] h-[52px] rounded-xl bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-5 h-5 text-slate-300" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-slate-600 text-xs">
                              Tanpa Item
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Status manual: Done Tosca
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 5. Status & Actions matching image.png */}
                    <td className="py-5 px-3 align-middle text-right pr-4">
                      <div className="inline-flex items-center justify-end gap-2 relative">
                        {/* Status Pill matching image.png */}
                        {row.status === 'done_teal' && (
                          <span
                            className="bg-[#008d91] text-white px-6 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center min-w-[90px] shadow-2xs"
                            title={
                              row.matchedTransaction
                                ? `PM Berhasil: Transaksi ${row.matchedTransaction.source} (${row.matchedTransaction.matchedItem}, ${row.matchedTransaction.daysAfterPM} hari)`
                                : 'Done (Tosca)'
                            }
                          >
                            Done
                          </span>
                        )}
                        {row.status === 'menolak' && (
                          <span className="bg-[#e75344] text-white px-6 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center min-w-[90px] shadow-2xs">
                            Menolak
                          </span>
                        )}
                        {row.status === 'done_gray' && (
                          <span
                            className="bg-[#c5c9ce] text-white px-6 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center min-w-[90px] shadow-2xs"
                            title={
                              rowHasContactItem(row)
                                ? 'Pesan Terkirim - Menunggu Transaksi (7 hari)'
                                : 'Done (Abu-abu)'
                            }
                          >
                            Done
                          </span>
                        )}
                        {row.status === 'pending' && (
                          <span className="inline-block min-w-[90px]" />
                        )}

                        {/* Three Dots Menu Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === row.id ? null : row.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Menu Aksi"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Menu Dropdown */}
                          {activeMenuId === row.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                              <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                                Ubah Status
                              </div>
                              <button
                                type="button"
                                onClick={() => handleChangeStatus(row.id, 'done_teal')}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Done (Tosca)</span>
                                {row.status === 'done_teal' && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleChangeStatus(row.id, 'menolak')}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Menolak</span>
                                {row.status === 'menolak' && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleChangeStatus(row.id, 'done_gray')}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                              >
                                <span>Done (Abu-abu)</span>
                                {row.status === 'done_gray' && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleChangeStatus(row.id, 'pending')}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Kosongkan / Reset</span>
                                {row.status === 'pending' && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <div className="my-1 border-t border-slate-100" />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleSendWhatsApp(row);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-[#008d91] hover:bg-teal-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Kirim WhatsApp</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openRowModal(row)}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Baris</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Send WhatsApp Paper Airplane Icon Button */}
                        {row.status !== 'done_gray' && row.status !== 'done_teal' && row.status !== 'menolak' && (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[#008d91] hover:text-[#007073] hover:bg-teal-50 rounded-lg transition-all cursor-pointer font-medium text-xs ml-1"
                            title="Kirim Pesan via WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View & Edit Template */}
      {templateModalRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Kelola {templateModalRow.templateName || 'Template'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Penerima: {templateModalRow.nama} ({templateModalRow.nomorHp})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTemplateModalRow(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Isi Pesan Template:
                </label>
                <textarea
                  rows={6}
                  value={templateEditText}
                  onChange={(e) => setTemplateEditText(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] focus:outline-hidden font-sans text-slate-800"
                  placeholder="Ketik isi template pesan..."
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px] text-slate-400">
                  <span>Variabel:</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                    {'{Nama}'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                    {'{CodeID}'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                    {'{ItemTitle}'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                    {'{ProyekKode}'}
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Live Preview WhatsApp:
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line bg-emerald-50/70 p-3 rounded-xl border border-emerald-100/80">
                  {templateEditText
                    .replace(/{Nama}/g, templateModalRow.nama)
                    .replace(/{CodeID}/g, templateModalRow.codeId || '')
                    .replace(/{NomorHP}/g, templateModalRow.nomorHp)
                    .replace(/{ItemTitle}/g, templateModalRow.itemTitle)
                    .replace(/{ProyekKode}/g, item.proyekKode || 'MAD')}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTemplateModalRow(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-5 py-2 bg-[#008d91] hover:bg-[#05828e] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Simpan Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Row */}
      {rowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  {editingRow ? 'Edit Baris List PM' : 'Tambah Penerima Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRowModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRow} className="space-y-4">
              {/* Identitas Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Pilih Identitas ID *
                </label>
                <select
                  value={rowFormData.identitasId}
                  onChange={(e) => setRowFormData({ ...rowFormData, identitasId: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] focus:outline-hidden text-slate-800 bg-white"
                  required
                >
                  {identitasList.map((id) => (
                    <option key={id.id} value={id.id}>
                      {id.codeId || '00000'} - {id.namaLengkap} ({id.nomorHandPhone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline & Template Name in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={rowFormData.deadline}
                    onChange={(e) => setRowFormData({ ...rowFormData, deadline: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-[#008d91] focus:outline-hidden text-slate-800"
                    placeholder="e.g. 16 Nov 2021"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Nama Template
                  </label>
                  <input
                    type="text"
                    value={rowFormData.templateName}
                    onChange={(e) => setRowFormData({ ...rowFormData, templateName: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-[#008d91] focus:outline-hidden text-slate-800"
                    placeholder="Template A"
                  />
                </div>
              </div>

              {/* Item Info */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Informasi Item
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Judul Item / Buku:
                  </label>
                  <input
                    type="text"
                    value={rowFormData.itemTitle}
                    onChange={(e) => setRowFormData({ ...rowFormData, itemTitle: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                    placeholder="e.g. Jalan Menuju Kemahatahuan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Keterangan / Subtitle:
                    </label>
                    <input
                      type="text"
                      value={rowFormData.itemSubtitle}
                      onChange={(e) => setRowFormData({ ...rowFormData, itemSubtitle: e.target.value })}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                      placeholder="Buku Berbayar, BJM - 2021"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Stok / Target:
                    </label>
                    <input
                      type="text"
                      value={rowFormData.itemStock}
                      onChange={(e) => setRowFormData({ ...rowFormData, itemStock: e.target.value })}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                      placeholder="Stok: 100"
                    />
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Status
                </label>
                <select
                  value={rowFormData.status}
                  onChange={(e) =>
                    setRowFormData({
                      ...rowFormData,
                      status: e.target.value as 'done_teal' | 'menolak' | 'done_gray' | 'pending',
                    })
                  }
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="pending">Belum Dikirim (Kosong)</option>
                  <option value="done_teal">Done (Tosca)</option>
                  <option value="menolak">Menolak (Merah)</option>
                  <option value="done_gray">Done (Abu-abu)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRowModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#05828e] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingRow ? 'Simpan Perubahan' : 'Tambah Baris'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
