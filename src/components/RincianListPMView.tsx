import React, { useState, useMemo } from 'react';
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
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { ListPMItem, ListPMDetailRow } from '../types';
import { IdentitasItem } from '../identitasData';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';
import { rowHasContactItem } from '../utils/pmTransactionChecker';

interface RincianListPMViewProps {
  items: ListPMItem[];
  identitasList: IdentitasItem[];
  salurOrders?: SalurOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  donasiOrders?: DonasiOrder[];
  onSaveItem: (updatedItem: ListPMItem) => void;
  onBulkSaveItems?: (updatedItems: ListPMItem[]) => void;
  onNavigateToListPM: () => void;
  onShowToast?: (message: string) => void;
  onNavigateToFormPMWithProject?: (project: ListPMItem) => void;
}

// Book Cover Thumbnail Component matching image_9f4ade77.png
function BookCoverThumbnail({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="w-[52px] h-[52px] rounded-xl overflow-hidden shadow-xs border border-teal-200/60 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0f766e] relative p-1 shrink-0 flex flex-col justify-between select-none">
      {/* Pagoda and Golden Rays illustration */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 60 60" fill="none">
        <defs>
          <radialGradient id="pagodaSunRincian" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="60" height="60" fill="url(#pagodaSunRincian)" />
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
          {title || 'Empat Segel Agung'}
        </p>
      </div>

      {/* Year */}
      <div className="relative z-10 text-right">
        <span className="text-[5.5px] text-amber-200/90 font-mono font-bold">2021</span>
      </div>
    </div>
  );
}

export const RincianListPMView: React.FC<RincianListPMViewProps> = ({
  items,
  identitasList,
  onSaveItem,
  onBulkSaveItems,
  onNavigateToListPM,
  onShowToast,
  onNavigateToFormPMWithProject,
}) => {
  // Filters & toggles
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done_teal' | 'menolak' | 'done_gray' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hidePhone, setHidePhone] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Modals & Active Menus
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [templateModalRow, setTemplateModalRow] = useState<{ row: ListPMDetailRow; parentItem: ListPMItem } | null>(null);
  const [chatModalRow, setChatModalRow] = useState<{ row: ListPMDetailRow; parentItem: ListPMItem } | null>(null);
  const [rowModalOpen, setRowModalOpen] = useState(false);
  const [editingRowInfo, setEditingRowInfo] = useState<{ row: ListPMDetailRow; parentItem: ListPMItem } | null>(null);

  // Form State for Add / Edit Row Modal
  const [rowFormData, setRowFormData] = useState({
    parentItemId: items[0]?.id || '',
    identitasId: identitasList[0]?.id || '',
    proyekSapa: '',
    proyekKode: '',
    deadline: '16 Nov 2021',
    templateName: 'Template A',
    templateContent: '',
    itemTitle: 'Empat Segel Agung',
    itemSubtitle: 'Tanda Terima Dharma Patron, MAD - 2021',
    itemStock: 'Stok: 100',
    status: 'pending' as 'pending' | 'done_teal' | 'menolak' | 'done_gray',
  });

  // Flatten rows with parent item reference
  const allRowsWithParent = useMemo(() => {
    const list: Array<{ row: ListPMDetailRow; parentItem: ListPMItem }> = [];
    items.forEach((item) => {
      (item.detailRows || []).forEach((row) => {
        list.push({
          row: {
            ...row,
            proyekSapa: row.proyekSapa || item.proyekSapa || 'Proyek SAPA',
            proyekKode: row.proyekKode || item.proyekKode || 'MAD',
          },
          parentItem: item,
        });
      });
    });
    return list;
  }, [items]);

  // Unique Proyek SAPA options
  const proyekSapaOptions = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((it) => {
      if (it.id && it.proyekSapa) {
        map.set(it.id, `${it.proyekSapa} (${it.proyekKode || 'MAD'})`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [items]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return allRowsWithParent.filter(({ row, parentItem }) => {
      // Project filter
      if (selectedProjectId !== 'all' && parentItem.id !== selectedProjectId) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && row.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = (row.nama || '').toLowerCase().includes(q);
        const matchCode = (row.codeId || '').toLowerCase().includes(q);
        const matchHp = (row.nomorHp || '').toLowerCase().includes(q);
        const matchTemplate = (row.templateName || '').toLowerCase().includes(q);
        const matchItem = (row.itemTitle || '').toLowerCase().includes(q);
        const matchProyek = (row.proyekSapa || parentItem.proyekSapa || '').toLowerCase().includes(q);
        if (!matchNama && !matchCode && !matchHp && !matchTemplate && !matchItem && !matchProyek) {
          return false;
        }
      }
      return true;
    });
  }, [allRowsWithParent, selectedProjectId, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = allRowsWithParent.length;
    const doneTeal = allRowsWithParent.filter((r) => r.row.status === 'done_teal').length;
    const doneGray = allRowsWithParent.filter((r) => r.row.status === 'done_gray').length;
    const pending = allRowsWithParent.filter((r) => r.row.status === 'pending').length;
    const menolak = allRowsWithParent.filter((r) => r.row.status === 'menolak').length;
    return { total, doneTeal, doneGray, pending, menolak };
  }, [allRowsWithParent]);

  // Phone masking
  const formatPhone = (phone: string) => {
    if (!hidePhone) return phone;
    if (phone.length <= 6) return '••••••';
    return phone.slice(0, 4) + '••••' + phone.slice(-2);
  };

  // Update a single row within its parent item
  const handleUpdateRow = (
    parentItem: ListPMItem,
    updatedRow: ListPMDetailRow,
    toastMsg?: string
  ) => {
    const updatedDetailRows = (parentItem.detailRows || []).map((r) =>
      r.id === updatedRow.id ? updatedRow : r
    );

    // Sync recipients isSent status if matching
    const updatedRecipients = (parentItem.recipients || []).map((rec) => {
      if (
        (rec.identitasId && rec.identitasId === updatedRow.identitasId) ||
        (rec.nomorHp && rec.nomorHp === updatedRow.nomorHp) ||
        (rec.nama && rec.nama === updatedRow.nama)
      ) {
        const isSent = updatedRow.status === 'done_teal' || updatedRow.status === 'done_gray';
        return {
          ...rec,
          isSent,
          sentAt: isSent ? updatedRow.sentAt || '15 Nov 2021 10:00' : undefined,
        };
      }
      return rec;
    });

    // Recompute progress percent
    const sentCount = updatedDetailRows.filter(
      (r) => r.status === 'done_teal' || r.status === 'done_gray'
    ).length;
    const progressPercent =
      updatedDetailRows.length > 0
        ? Math.round((sentCount / updatedDetailRows.length) * 100)
        : parentItem.progressPercent;

    const updatedParent: ListPMItem = {
      ...parentItem,
      detailRows: updatedDetailRows,
      recipients: updatedRecipients,
      progressPercent,
    };

    onSaveItem(updatedParent);
    if (toastMsg && onShowToast) {
      onShowToast(toastMsg);
    }
  };

  // Delete a row
  const handleDeleteRow = (parentItem: ListPMItem, rowId: string, nama: string) => {
    if (!confirm(`Hapus baris penerima "${nama}" dari Rincian List PM?`)) return;

    const updatedDetailRows = (parentItem.detailRows || []).filter((r) => r.id !== rowId);
    const sentCount = updatedDetailRows.filter(
      (r) => r.status === 'done_teal' || r.status === 'done_gray'
    ).length;
    const progressPercent =
      updatedDetailRows.length > 0
        ? Math.round((sentCount / updatedDetailRows.length) * 100)
        : 0;

    const updatedParent: ListPMItem = {
      ...parentItem,
      detailRows: updatedDetailRows,
      targetCount: Math.max(0, (parentItem.targetCount || 1) - 1),
      progressPercent,
    };

    onSaveItem(updatedParent);
    setActiveMenuId(null);
    if (onShowToast) {
      onShowToast(`Baris penerima "${nama}" berhasil dihapus`);
    }
  };

  // Open Template Modal
  const openTemplateModal = (row: ListPMDetailRow, parentItem: ListPMItem) => {
    setTemplateModalRow({ row, parentItem });
  };

  // Send WhatsApp action
  const handleSendWhatsApp = (row: ListPMDetailRow, parentItem: ListPMItem) => {
    let cleanPhone = row.nomorHp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const template =
      row.templateContent ||
      parentItem.templatePesan ||
      'Namo Buddhaya {Nama},\n\nTerima kasih atas partisipasinya dalam Proyek SAPA ({ProyekKode}).';

    const message = template
      .replace(/{Nama}/g, row.nama)
      .replace(/\[Nama Lengkap\]/g, row.nama)
      .replace(/{CodeID}/g, row.codeId || '')
      .replace(/{NomorHP}/g, row.nomorHp)
      .replace(/{ItemTitle}/g, row.itemTitle)
      .replace(/{ProyekKode}/g, row.proyekKode || parentItem.proyekKode || 'MAD')
      .replace(/{NoResi}/g, 'SAPA-MAD-98214');

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Automatically mark as done_gray (Terkirim) if pending
    if (row.status === 'pending') {
      const nowStr = '15 Nov 2021 10:00';
      const updatedRow: ListPMDetailRow = {
        ...row,
        status: 'done_gray',
        sentAt: nowStr,
      };
      handleUpdateRow(
        parentItem,
        updatedRow,
        `Chat WhatsApp dikirim ke ${row.nama}. Status diperbarui menjadi Done (Abu-abu)`
      );
    } else if (onShowToast) {
      onShowToast(`Membuka WhatsApp untuk ${row.nama}...`);
    }
  };

  // Open Add / Edit Row Modal
  const openRowModal = (target?: { row: ListPMDetailRow; parentItem: ListPMItem }) => {
    if (target) {
      setEditingRowInfo(target);
      setRowFormData({
        parentItemId: target.parentItem.id,
        identitasId: target.row.identitasId || identitasList[0]?.id || '',
        proyekSapa: target.row.proyekSapa || target.parentItem.proyekSapa,
        proyekKode: target.row.proyekKode || target.parentItem.proyekKode || 'MAD',
        deadline: target.row.deadline || '16 Nov 2021',
        templateName: target.row.templateName || 'Template A',
        templateContent: target.row.templateContent || '',
        itemTitle: target.row.itemTitle || 'Empat Segel Agung',
        itemSubtitle: target.row.itemSubtitle || 'Tanda Terima Dharma Patron, MAD - 2021',
        itemStock: target.row.itemStock || 'Stok: 100',
        status: target.row.status,
      });
    } else {
      setEditingRowInfo(null);
      const defaultItem = items[0];
      setRowFormData({
        parentItemId: defaultItem?.id || '',
        identitasId: identitasList[0]?.id || '',
        proyekSapa: defaultItem?.proyekSapa || 'Tanda Terima Dharma Patron',
        proyekKode: defaultItem?.proyekKode || 'MAD',
        deadline: '16 Nov 2021',
        templateName: 'Template MAD',
        templateContent: '',
        itemTitle: 'Empat Segel Agung',
        itemSubtitle: 'Tanda Terima Dharma Patron, MAD - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      });
    }
    setActiveMenuId(null);
    setRowModalOpen(true);
  };

  // Submit Row Modal
  const handleSubmitRow = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedId =
      identitasList.find((id) => id.id === rowFormData.identitasId) || identitasList[0];

    const nama = selectedId?.namaLengkap || 'Cindy Budiman';
    const codeId = selectedId?.codeId || '00019';
    const nomorHp = selectedId?.nomorHandPhone || '08123456789';
    const avatarInitial = (nama[0] || 'C').toUpperCase();

    if (editingRowInfo) {
      const updatedRow: ListPMDetailRow = {
        ...editingRowInfo.row,
        identitasId: rowFormData.identitasId,
        codeId,
        nama,
        nomorHp,
        avatarInitial,
        proyekSapa: rowFormData.proyekSapa || editingRowInfo.parentItem.proyekSapa,
        proyekKode: rowFormData.proyekKode || editingRowInfo.parentItem.proyekKode || 'MAD',
        deadline: rowFormData.deadline,
        templateName: rowFormData.templateName,
        templateContent: rowFormData.templateContent,
        itemTitle: rowFormData.itemTitle,
        itemSubtitle: rowFormData.itemSubtitle,
        itemStock: rowFormData.itemStock,
        status: rowFormData.status,
        isManualStatus: true,
        sentAt: rowFormData.status === 'pending' ? undefined : editingRowInfo.row.sentAt || '15 Nov 2021',
      };
      handleUpdateRow(editingRowInfo.parentItem, updatedRow, `Baris "${nama}" berhasil diperbarui`);
    } else {
      const parentItem = items.find((it) => it.id === rowFormData.parentItemId) || items[0];
      if (!parentItem) return;

      const newRow: ListPMDetailRow = {
        id: `dr-${Date.now()}`,
        identitasId: rowFormData.identitasId,
        codeId,
        nama,
        nomorHp,
        avatarInitial,
        avatarBg: 'bg-[#008d91]',
        proyekSapa: rowFormData.proyekSapa || parentItem.proyekSapa,
        proyekKode: rowFormData.proyekKode || parentItem.proyekKode || 'MAD',
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

      const updatedDetailRows = [...(parentItem.detailRows || []), newRow];
      const sentCount = updatedDetailRows.filter(
        (r) => r.status === 'done_teal' || r.status === 'done_gray'
      ).length;
      const progressPercent = Math.round((sentCount / updatedDetailRows.length) * 100);

      const updatedParent: ListPMItem = {
        ...parentItem,
        detailRows: updatedDetailRows,
        targetCount: (parentItem.targetCount || 0) + 1,
        progressPercent,
      };

      onSaveItem(updatedParent);
      if (onShowToast) {
        onShowToast(`Baris baru "${nama}" berhasil ditambahkan ke Rincian List PM`);
      }
    }
    setRowModalOpen(false);
  };

  return (
    <div className="w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToListPM}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
            title="Kembali ke List PM"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Rincian List PM
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar Rincian Broadcast Chat & Proyek SAPA
            </p>
          </div>
        </div>
      </div>

      {/* Main White Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 min-h-[580px]">
        {/* Top Controls: Filter by Proyek SAPA on Left, Tools on Right */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          {/* Proyek SAPA Filter Tabs / Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedProjectId('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedProjectId === 'all'
                    ? 'bg-[#008d91] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Proyek SAPA ({allRowsWithParent.length})
              </button>
              {proyekSapaOptions.slice(0, 3).map((opt) => {
                const count = allRowsWithParent.filter((r) => r.parentItem.id === opt.id).length;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedProjectId(opt.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedProjectId === opt.id
                        ? 'bg-[#008d91] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label} ({count})
                  </button>
                );
              })}
            </div>

            {proyekSapaOptions.length > 3 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">Pilih Proyek Lainnya...</option>
                {proyekSapaOptions.slice(3).map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Top-Right Tools */}
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
                <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
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
              onClick={() => openRowModal()}
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
              placeholder="Cari Nama, No HP, Proyek SAPA, Template, atau Item..."
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

        {/* Table matching image_9f4ade77.png with Proyek SAPA column */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
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
                      : 'Belum ada data penerima chat untuk Rincian List PM ini. Klik "+ Add" untuk menambahkan.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ row, parentItem }) => (
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
                          {row.avatarInitial || 'C'}
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
                          {row.proyekSapa || parentItem.proyekSapa || 'Tanda Terima Dharma Patron'}
                        </span>
                        {(row.proyekKode || parentItem.proyekKode) && (
                          <span className="text-xs text-slate-500 font-medium">
                            {row.proyekKode || parentItem.proyekKode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Template */}
                    <td className="py-5 px-3 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => openTemplateModal(row, parentItem)}
                        className="bg-[#008d91] hover:bg-[#05828e] text-white px-6 py-1.5 rounded-full text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center justify-center min-w-[140px] transition-all hover:scale-[1.02]"
                        title="Klik untuk melihat / menyesuaikan template pesan"
                      >
                        {row.templateName || 'Template MAD'}
                      </button>
                    </td>

                    {/* 5. Item */}
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

                    {/* 6. Status & Actions matching image_9f4ade77.png */}
                    <td className="py-5 px-3 align-middle text-right pr-4">
                      <div className="inline-flex items-center justify-end gap-2 relative">
                        {/* Status Pill matching image_9f4ade77.png */}
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
                            className="bg-[#b4bac2] text-white px-6 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center min-w-[90px] shadow-2xs"
                            title="Done (Abu-abu) - Terkirim"
                          >
                            Done
                          </span>
                        )}
                        {row.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(row, parentItem)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center min-w-[90px] transition-colors cursor-pointer"
                            title="Klik untuk kirim pesan via WhatsApp"
                          >
                            Kirim
                          </button>
                        )}

                        {/* Three Dots Button matching image_9f4ade77.png */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                            title="Opsi baris"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === row.id && (
                            <div className="absolute right-0 top-8 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleSendWhatsApp(row, parentItem);
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <MessageCircle className="w-4 h-4 text-emerald-600" />
                                <span>Kirim via WhatsApp</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openTemplateModal(row, parentItem);
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-4 h-4 text-slate-400" />
                                <span>Sesuaikan Template</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openRowModal({ row, parentItem });
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                <span>Edit Baris Penerima</span>
                              </button>
                              <div className="h-px bg-slate-100 my-1" />
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(parentItem, row.id, row.nama)}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                <span>Hapus Baris</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template Preview & Customizer Modal */}
      {templateModalRow && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setTemplateModalRow(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Template: {templateModalRow.row.templateName || 'Template MAD'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Penerima: {templateModalRow.row.nama} ({templateModalRow.row.nomorHp})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTemplateModalRow(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Isi Template Pesan (Dapat Disesuaikan):
              </label>
              <textarea
                rows={7}
                value={
                  templateModalRow.row.templateContent ||
                  templateModalRow.parentItem.templatePesan ||
                  `Namo Buddhaya ${templateModalRow.row.nama},\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (${templateModalRow.row.proyekKode || 'MAD'}). Buku "${templateModalRow.row.itemTitle}" telah kami siapkan sebagai ${templateModalRow.row.itemSubtitle}.\n\nSemoga kebajikan ini membawa kebahagiaan bagi Anda dan keluarga. 🙏`
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setTemplateModalRow({
                    ...templateModalRow,
                    row: {
                      ...templateModalRow.row,
                      templateContent: val,
                    },
                  });
                }}
                className="w-full text-xs font-mono p-3 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const content =
                    templateModalRow.row.templateContent ||
                    templateModalRow.parentItem.templatePesan ||
                    '';
                  navigator.clipboard.writeText(content);
                  if (onShowToast) onShowToast('Template pesan berhasil disalin!');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Pesan</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateRow(
                      templateModalRow.parentItem,
                      templateModalRow.row,
                      'Template pesan berhasil disimpan'
                    );
                    setTemplateModalRow(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Simpan Saja
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateRow(templateModalRow.parentItem, templateModalRow.row);
                    handleSendWhatsApp(templateModalRow.row, templateModalRow.parentItem);
                    setTemplateModalRow(null);
                  }}
                  className="bg-[#008d91] hover:bg-[#05828e] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Row Modal */}
      {rowModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setRowModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingRowInfo ? 'Edit Baris Penerima' : 'Tambah Baris Penerima Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setRowModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRow} className="flex flex-col gap-3.5">
              {!editingRowInfo && (
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Pilih Proyek SAPA:
                  </label>
                  <select
                    value={rowFormData.parentItemId}
                    onChange={(e) => {
                      const selected = items.find((it) => it.id === e.target.value);
                      setRowFormData({
                        ...rowFormData,
                        parentItemId: e.target.value,
                        proyekSapa: selected?.proyekSapa || '',
                        proyekKode: selected?.proyekKode || 'MAD',
                      });
                    }}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.proyekSapa} ({it.proyekKode || 'MAD'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Identitas Penerima:
                </label>
                <select
                  value={rowFormData.identitasId}
                  onChange={(e) => setRowFormData({ ...rowFormData, identitasId: e.target.value })}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {identitasList.map((id) => (
                    <option key={id.id} value={id.id}>
                      {id.codeId ? `${id.codeId} - ` : ''}
                      {id.namaLengkap} ({id.nomorHandPhone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Proyek SAPA:
                  </label>
                  <input
                    type="text"
                    value={rowFormData.proyekSapa}
                    onChange={(e) => setRowFormData({ ...rowFormData, proyekSapa: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    placeholder="Contoh: Tanda Terima Dharma Patron"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Deadline:
                  </label>
                  <input
                    type="text"
                    value={rowFormData.deadline}
                    onChange={(e) => setRowFormData({ ...rowFormData, deadline: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    placeholder="16 Nov 2021"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Template:
                  </label>
                  <input
                    type="text"
                    value={rowFormData.templateName}
                    onChange={(e) => setRowFormData({ ...rowFormData, templateName: e.target.value })}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    placeholder="Template MAD"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Status:
                  </label>
                  <select
                    value={rowFormData.status}
                    onChange={(e) =>
                      setRowFormData({
                        ...rowFormData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="pending">Belum Dikirim (Pending)</option>
                    <option value="done_gray">Done (Abu-abu / Terkirim)</option>
                    <option value="done_teal">Done (Tosca / Berhasil Transaksi)</option>
                    <option value="menolak">Menolak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Judul Item:
                </label>
                <input
                  type="text"
                  value={rowFormData.itemTitle}
                  onChange={(e) => setRowFormData({ ...rowFormData, itemTitle: e.target.value })}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  placeholder="Empat Segel Agung"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRowModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#008d91] hover:bg-[#05828e] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                >
                  {editingRowInfo ? 'Simpan Perubahan' : 'Tambahkan Baris'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
