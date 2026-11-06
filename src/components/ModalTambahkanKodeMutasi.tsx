import React, { useState, useMemo } from 'react';
import {
  X,
  Link2,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  CreditCard,
  Layers,
  MoreVertical,
  Edit3,
  ChevronDown,
} from 'lucide-react';
import { MutasiItem, MutasiLinkedTransaction } from '../types';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';
import { INITIAL_MUTASI_ITEMS } from '../mutasiData';

export interface GenericOrderForMutasi {
  id: string;
  orderNumber: string;
  customerId?: string;
  idPembeli?: string;
  date: string;
  totalDana: string;
  [key: string]: any;
}

export type MutasiTargetOrder = SalurOrder | TransaksiAjarItem | DonasiOrder | GenericOrderForMutasi;

export interface ModalTambahkanKodeMutasiProps {
  isOpen: boolean;
  onClose: () => void;
  order: MutasiTargetOrder | null;
  mutasiItems?: MutasiItem[];
  onUpdateMutasiItems?: (updatedItems: MutasiItem[]) => void;
  onShowToast: (msg: string) => void;
  mode?: 'transaksi' | 'pengeluaran';
  onLinkPengeluaran?: (pengeluaranId: string, mutasi: MutasiItem, nominal: number) => void;
}

export const ModalTambahkanKodeMutasi: React.FC<ModalTambahkanKodeMutasiProps> = ({
  isOpen,
  onClose,
  order,
  mutasiItems = [],
  onUpdateMutasiItems,
  onShowToast,
  mode = 'transaksi',
  onLinkPengeluaran,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'CONNECTED' | 'AVAILABLE'>('ALL');

  // Input states for adding a new transaction to a mutasi
  const [connectingMutasiId, setConnectingMutasiId] = useState<string | null>(null);
  const [customKode, setCustomKode] = useState('');
  const [nominalInput, setNominalInput] = useState('');
  const [dbCrInput, setDbCrInput] = useState<'CR' | 'DB'>(mode === 'pengeluaran' ? 'DB' : 'CR');

  // Input states for editing an existing transaction
  const [editingMutasiId, setEditingMutasiId] = useState<string | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editKode, setEditKode] = useState('');
  const [editNominal, setEditNominal] = useState('');
  const [editDbCr, setEditDbCr] = useState<'CR' | 'DB'>('CR');

  // Menu dropdown state (opened for specific transaction link)
  const [activeMenuLinkId, setActiveMenuLinkId] = useState<string | null>(null);

  // Effective mutasi items with fallback
  const effectiveMutasiItems = useMemo(() => {
    if (mutasiItems && mutasiItems.length > 0) return mutasiItems;
    try {
      const saved = localStorage.getItem('mutasi_items_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MUTASI_ITEMS;
  }, [mutasiItems]);

  // Extract order total dana number
  const orderTargetAmount = useMemo(() => {
    if (!order) return 0;
    const cleanStr = (order.totalDana || '').replace(/[^\d]/g, '');
    return cleanStr ? parseFloat(cleanStr) : 0;
  }, [order]);

  // Helper to calculate total allocated amount on a mutasi
  const calculateAllocated = (mutasi: MutasiItem): number => {
    if (!mutasi.linkedTransactions || mutasi.linkedTransactions.length === 0) return 0;
    return mutasi.linkedTransactions.reduce((acc, item) => {
      if (item.dbCr === 'CR') return acc + Math.abs(item.nominalAkhir);
      if (item.dbCr === 'DB') return acc - Math.abs(item.nominalAkhir);
      return acc + item.nominalAkhir;
    }, 0);
  };

  // Helper to get remaining balance of a mutasi (amount kiri - total nominal kanan)
  const getMutasiRemaining = (mutasi: MutasiItem): number => {
    const allocated = calculateAllocated(mutasi);
    return Math.max(0, mutasi.amount - allocated);
  };

  // Check if amount in left column matches total in right column (fully allocated)
  const isMutasiFullyAllocated = (mutasi: MutasiItem): boolean => {
    const remaining = getMutasiRemaining(mutasi);
    return remaining <= 0.01;
  };

  // Find all links currently attached to this order
  const linksForCurrentOrder = useMemo(() => {
    if (!order) return [];
    const results: {
      mutasi: MutasiItem;
      link: MutasiLinkedTransaction;
    }[] = [];

    const orderNo = order.orderNumber || (order as any).no;
    const orderKet = (order as any).keterangan;

    effectiveMutasiItems.forEach((m) => {
      if (m.linkedTransactions) {
        m.linkedTransactions.forEach((l) => {
          if (
            l.orderId === order.id ||
            l.kode === order.orderNumber ||
            (orderNo && l.kode === orderNo) ||
            (orderKet && l.kode === orderKet)
          ) {
            results.push({ mutasi: m, link: l });
          }
        });
      }
    });

    return results;
  }, [order, effectiveMutasiItems]);

  // Total amount connected to this order
  const totalAmountConnectedToOrder = useMemo(() => {
    return linksForCurrentOrder.reduce((acc, curr) => {
      if (curr.link.dbCr === 'CR') return acc + Math.abs(curr.link.nominalAkhir);
      if (curr.link.dbCr === 'DB') return acc - Math.abs(curr.link.nominalAkhir);
      return acc + curr.link.nominalAkhir;
    }, 0);
  }, [linksForCurrentOrder]);

  // Filter mutasi according to rule & mode:
  // - Mode Transaksi: HANYA mutasi CR (uang masuk)
  // - Mode Pengeluaran: HANYA mutasi DB (uang keluar)
  const eligibleMutasiItems = useMemo(() => {
    return effectiveMutasiItems.filter((m) => {
      const isLinkedToThis = m.linkedTransactions?.some(
        (l) =>
          l.orderId === order?.id ||
          (order && (l.kode === order.orderNumber || l.kode === (order as any).keterangan))
      );

      // Strict Mode Separation (User requirement):
      // "Untuk Tambahkan Kode Mutasi pada Transaksi hanya bisa menambah CR (uang masuk), dan untuk Tambahkan Kode Mutasi pada Pengeluaran hanya bisa menambah DB (uang keluar)."
      if (mode === 'pengeluaran') {
        if (m.type !== 'DB' && !isLinkedToThis) return false;
      } else {
        if (m.type !== 'CR' && !isLinkedToThis) return false;
      }

      const hasConnected = !!(m.linkedTransactions && m.linkedTransactions.length > 0);
      const remaining = getMutasiRemaining(m);
      const canStillBeChosen = remaining > 0.01;

      return hasConnected || canStillBeChosen;
    });
  }, [effectiveMutasiItems, mode, order]);

  // Apply search and filter tabs
  const filteredMutasiItems = useMemo(() => {
    return eligibleMutasiItems.filter((m) => {
      // Bank filter
      if (selectedBankFilter !== 'ALL' && m.bankAccount !== selectedBankFilter) {
        return false;
      }

      // Filter type
      const hasConnected = !!(m.linkedTransactions && m.linkedTransactions.length > 0);
      const remaining = getMutasiRemaining(m);
      const canStillBeChosen = remaining > 0.01;

      if (filterType === 'CONNECTED' && !hasConnected) return false;
      if (filterType === 'AVAILABLE' && !canStillBeChosen) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBank = m.bankAccount.toLowerCase().includes(q);
        const matchKet = m.keteranganBank.toLowerCase().includes(q);
        const matchDate = m.date.toLowerCase().includes(q);
        const matchTrans = m.linkedTransactions?.some((t) =>
          t.kode.toLowerCase().includes(q)
        );
        return matchBank || matchKet || matchDate || matchTrans;
      }

      return true;
    });
  }, [eligibleMutasiItems, selectedBankFilter, filterType, searchQuery]);

  if (!isOpen || !order) return null;

  // Format currency with standard accounting comma and two decimals (e.g. 1,072,261.00)
  const formatAmount = (val: number): string => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Handler to open connect form for a specific mutasi
  const handleStartConnect = (mutasi: MutasiItem) => {
    const remainingMutasi = getMutasiRemaining(mutasi);
    if (remainingMutasi <= 0.01) {
      onShowToast('Amount mutasi di kiri sudah sama dengan nominal di kanan (alokasi penuh)');
      return;
    }
    setConnectingMutasiId(mutasi.id);
    setEditingLinkId(null);
    setCustomKode(order.orderNumber);
    setDbCrInput(mutasi.type === 'DB' ? 'DB' : 'CR');

    // Default nominal setara sisa amount kiri dan total kanan
    const remainingNeeded = Math.max(0, orderTargetAmount - totalAmountConnectedToOrder);
    const suggested =
      remainingNeeded > 0 && remainingNeeded <= remainingMutasi
        ? remainingNeeded
        : remainingMutasi;

    setNominalInput(suggested > 0 ? String(suggested) : String(remainingMutasi));
  };

  // Handler for nominal input with clamp to maximum allowed
  const handleNominalInputChange = (valStr: string, maxAllowed: number) => {
    if (valStr === '') {
      setNominalInput('');
      return;
    }
    const num = parseFloat(valStr);
    if (!isNaN(num)) {
      if (num > maxAllowed) {
        setNominalInput(String(maxAllowed));
        return;
      }
      if (num < 0) {
        setNominalInput('0');
        return;
      }
    }
    setNominalInput(valStr);
  };

  // Handler to save the connection to a mutasi
  const handleConfirmConnect = (mutasiId: string) => {
    const targetMutasi = effectiveMutasiItems.find((m) => m.id === mutasiId);
    if (!targetMutasi) return;

    const remainingMutasi = getMutasiRemaining(targetMutasi);
    const nominal = parseFloat(nominalInput);
    if (isNaN(nominal) || nominal <= 0) {
      onShowToast('Nominal alokasi harus lebih besar dari 0');
      return;
    }

    if (nominal > remainingMutasi + 0.01) {
      onShowToast(
        `Jumlah nominal akhir maksimal yang bisa dimasukkan adalah ${formatAmount(remainingMutasi)}`
      );
      return;
    }

    // Sesuai instruksi:
    // - Pengeluaran: hanya bisa DB, Keterangan Pengeluaran, dan nominal
    // - Transaksi: hanya bisa menambah CR (uang masuk)
    const isPengeluaran = mode === 'pengeluaran';
    const targetKode = isPengeluaran
      ? ((order as any).keterangan || order.orderNumber)
      : order.orderNumber;
    const targetDbCr: 'CR' | 'DB' = isPengeluaran ? 'DB' : 'CR';

    const newLink: MutasiLinkedTransaction = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderId: order.id,
      kode: targetKode,
      dbCr: targetDbCr,
      nominalAkhir: targetDbCr === 'DB' ? -Math.abs(nominal) : Math.abs(nominal),
      createdAt: new Date().toISOString(),
    };

    const updated = effectiveMutasiItems.map((m) => {
      if (m.id === mutasiId) {
        return {
          ...m,
          linkedTransactions: [...(m.linkedTransactions || []), newLink],
        };
      }
      return m;
    });

    if (onUpdateMutasiItems) {
      onUpdateMutasiItems(updated);
    }
    try {
      localStorage.setItem('mutasi_items_data_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (isPengeluaran && onLinkPengeluaran) {
      onLinkPengeluaran(order.id, targetMutasi, nominal);
    }

    setConnectingMutasiId(null);
    setNominalInput('');
    onShowToast(`Mutasi ${targetDbCr} "${targetKode}" (Rp ${formatAmount(nominal)}) berhasil ditambahkan`);
  };

  // Handler to start editing an existing link
  const handleStartEdit = (mutasiId: string, link: MutasiLinkedTransaction) => {
    setEditingMutasiId(mutasiId);
    setEditingLinkId(link.id);
    setConnectingMutasiId(null);
    setActiveMenuLinkId(null);
    setEditKode(link.kode);
    setEditDbCr(link.dbCr);
    setEditNominal(String(Math.abs(link.nominalAkhir)));
  };

  // Handler to save edited link
  const handleSaveEdit = (mutasiId: string, linkId: string) => {
    const targetMutasi = effectiveMutasiItems.find((m) => m.id === mutasiId);
    if (!targetMutasi) return;

    const existingLink = targetMutasi.linkedTransactions?.find((l) => l.id === linkId);
    const currentLinkNominal = existingLink ? Math.abs(existingLink.nominalAkhir) : 0;
    const remainingMutasi = getMutasiRemaining(targetMutasi);
    const maxAllowed = remainingMutasi + currentLinkNominal;

    const nominal = parseFloat(editNominal);
    if (isNaN(nominal) || nominal <= 0) {
      onShowToast('Nominal alokasi harus lebih besar dari 0');
      return;
    }

    if (nominal > maxAllowed + 0.01) {
      onShowToast(
        `Nominal maksimal yang bisa dimasukkan adalah ${formatAmount(maxAllowed)}`
      );
      return;
    }

    const updated = effectiveMutasiItems.map((m) => {
      if (m.id === mutasiId && m.linkedTransactions) {
        return {
          ...m,
          linkedTransactions: m.linkedTransactions.map((l) => {
            if (l.id === linkId) {
              return {
                ...l,
                nominalAkhir: l.dbCr === 'DB' ? -Math.abs(nominal) : Math.abs(nominal),
              };
            }
            return l;
          }),
        };
      }
      return m;
    });

    if (onUpdateMutasiItems) {
      onUpdateMutasiItems(updated);
    }
    try {
      localStorage.setItem('mutasi_items_data_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setEditingLinkId(null);
    setEditingMutasiId(null);
    onShowToast(`Perubahan nominal transaksi berhasil disimpan`);
  };

  // Helper to render the inline form matching image_ef36c517.png
  const renderAddTransactionInlineForm = (mutasi: MutasiItem) => {
    const maxAllowed = getMutasiRemaining(mutasi);
    return (
      <div className="p-3 bg-teal-50/40 rounded-2xl border border-[#008d91]/30 flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <span>{mode === 'pengeluaran' ? 'Tambah Mutasi Pengeluaran' : 'Tambah Transaksi Baru'}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-100/70 text-[#008d91]">
              Maks: {formatAmount(maxAllowed)}
            </span>
          </div>
          <span className="text-[11px] font-normal text-slate-500">
            Mutasi: {mutasi.bankAccount}
          </span>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* DB/CR: Transaksi hanya bisa CR, Pengeluaran hanya bisa DB */}
          <div className="w-20 shrink-0">
            <div
              className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between cursor-not-allowed select-none"
              title={mode === 'pengeluaran' ? 'Khusus Pengeluaran: Hanya bisa DB (uang keluar)' : 'Khusus Transaksi: Hanya bisa CR (uang masuk)'}
            >
              <span>{mode === 'pengeluaran' ? 'DB' : 'CR'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Keterangan Pengeluaran / Kode */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              readOnly
              disabled
              value={mode === 'pengeluaran' ? ((order as any).keterangan || order.orderNumber) : order.orderNumber}
              title={mode === 'pengeluaran' ? 'Keterangan Pengeluaran (otomatis dari pengeluaran)' : 'Kode otomatis diambil dari pesanan'}
              className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-not-allowed select-none"
            />
          </div>

          {/* Nominal akhir (Hanya bisa memasukan nominal, maksimal setara amount kiri dan total kanan) */}
          <div className="w-36 shrink-0">
            <input
              type="number"
              autoFocus
              min={1}
              max={maxAllowed}
              step="any"
              value={nominalInput}
              onChange={(e) => handleNominalInputChange(e.target.value, maxAllowed)}
              placeholder="Nominal"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 focus:border-[#008d91] rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#008d91]/20 focus:outline-hidden"
            />
          </div>

          {/* Tombol Simpan & Batal */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleConfirmConnect(mutasi.id)}
              className="px-4 py-1.5 bg-[#008d91] hover:bg-[#007b7f] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer text-center"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setConnectingMutasiId(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handler to remove a connection
  const handleRemoveLink = (mutasiId: string, linkId: string, kode: string) => {
    setActiveMenuLinkId(null);
    const updated = effectiveMutasiItems.map((m) => {
      if (m.id === mutasiId && m.linkedTransactions) {
        return {
          ...m,
          linkedTransactions: m.linkedTransactions.filter((l) => l.id !== linkId),
        };
      }
      return m;
    });

    if (onUpdateMutasiItems) {
      onUpdateMutasiItems(updated);
    }
    try {
      localStorage.setItem('mutasi_items_data_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    onShowToast(`Koneksi mutasi untuk "${kode}" telah dihapus`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setActiveMenuLinkId(null)}
    >
      <div
        id="modal-tambahkan-kode-mutasi"
        className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden animate-in zoom-in-95 duration-150 font-['Plus_Jakarta_Sans',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008d91]/10 flex items-center justify-center text-[#008d91] shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  {mode === 'pengeluaran' ? 'Tambahkan Kode Mutasi (Pengeluaran)' : 'Tambahkan Kode Mutasi'}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#008d91] text-white">
                  {order.orderNumber}
                </span>
                {mode === 'pengeluaran' && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                    DB (Uang Keluar)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'pengeluaran'
                  ? 'Koneksikan pengeluaran dengan mutasi bank DB (uang keluar) secara presisi'
                  : 'Koneksikan transaksi pesanan dengan mutasi bank CR (uang masuk) secara presisi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Banner */}
        <div className="px-4 sm:px-6 py-3 bg-teal-50/50 border-b border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap text-slate-700">
            {mode === 'pengeluaran' ? (
              <>
                <div>
                  <span className="text-slate-500">No. Pengeluaran:</span>{' '}
                  <span className="font-semibold text-slate-800">{order.orderNumber}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div>
                  <span className="text-slate-500">Keterangan:</span>{' '}
                  <span className="font-semibold text-slate-800">{(order as any).keterangan || '-'}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div>
                  <span className="text-slate-500">Tanggal:</span>{' '}
                  <span className="font-semibold text-slate-800">{order.date}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div>
                  <span className="text-slate-500">Nominal Pengeluaran:</span>{' '}
                  <span className="font-bold text-[#008d91] text-sm">{order.totalDana}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-slate-500">Pembeli:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {order.idPembeli || order.customerId || 'Umum'}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <div>
                  <span className="text-slate-500">Tanggal Transaksi:</span>{' '}
                  <span className="font-semibold text-slate-800">{order.date}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div>
                  <span className="text-slate-500">Total Transaksi:</span>{' '}
                  <span className="font-bold text-[#008d91] text-sm">{order.totalDana}</span>
                </div>
              </>
            )}
          </div>

          {/* Status coverage */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">{mode === 'pengeluaran' ? 'Terkoneksi Mutasi DB:' : 'Terkoneksi Mutasi:'}</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-lg text-xs ${
                totalAmountConnectedToOrder >= orderTargetAmount && orderTargetAmount > 0
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : totalAmountConnectedToOrder > 0
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {formatCurrency(totalAmountConnectedToOrder)}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari keterangan bank, kode, nominal, atau tanggal..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#008d91] focus:bg-white focus:outline-hidden text-slate-800"
            />
          </div>

          {/* Filter Bank & Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bank Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['ALL', 'BCA 888', 'BCA 388', 'Mandiri'].map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => setSelectedBankFilter(bank)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedBankFilter === bank
                      ? 'bg-white text-[#008d91] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {bank === 'ALL' ? 'Semua Bank' : bank}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-[#008d91] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({eligibleMutasiItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('CONNECTED')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === 'CONNECTED'
                    ? 'bg-[#008d91] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Terkoneksi
              </button>
              <button
                type="button"
                onClick={() => setFilterType('AVAILABLE')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === 'AVAILABLE'
                    ? 'bg-[#008d91] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ada Sisa
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 bg-white custom-scrollbar">
          <div className="min-w-[880px] w-full">
            <table className="w-full border-collapse font-['Plus_Jakarta_Sans',sans-serif]">
              {/* Table Header matching screenshot */}
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 text-sm font-bold select-none">
                  <th className="py-3 px-3 text-left w-20">Date</th>
                  <th className="py-3 px-3 text-left min-w-[280px]">Keterangan Bank</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap w-36">Amount</th>
                  <th className="py-3 px-3 text-center w-20">CB/CR</th>
                  <th className="py-3 px-3 text-center w-20">DB/CR</th>
                  <th className="py-3 px-3 text-left min-w-[240px]">
                    {mode === 'pengeluaran' ? 'Keterangan Pengeluaran' : 'Kode'}
                  </th>
                  <th className="py-3 px-3 text-right whitespace-nowrap w-36">Nominal akhir</th>
                  <th className="py-3 px-2 text-center w-10"></th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200">
                {filteredMutasiItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                      Tidak ada mutasi yang memenuhi kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMutasiItems.map((mutasi) => {
                    const links = mutasi.linkedTransactions || [];
                    const hasLinks = links.length > 0;
                    const isFullyAllocated = isMutasiFullyAllocated(mutasi);
                    const isConnectingThis = connectingMutasiId === mutasi.id;

                    // Rowspan for left columns
                    const leftRowSpan = hasLinks
                      ? links.length + (isFullyAllocated ? 0 : 1)
                      : 1;

                    return (
                      <React.Fragment key={mutasi.id}>
                        {/* If NO linked transactions yet */}
                        {!hasLinks && (
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            {/* 1. Date */}
                            <td className="py-4 px-3 text-sm font-normal text-slate-700 align-top whitespace-nowrap">
                              {mutasi.date}
                            </td>

                            {/* 2. Keterangan Bank */}
                            <td className="py-4 px-3 text-sm text-slate-700 align-top font-normal leading-relaxed pr-6">
                              {mutasi.keteranganBank}
                            </td>

                            {/* 3. Amount */}
                            <td className="py-4 px-3 text-sm text-slate-800 font-normal text-right align-top whitespace-nowrap">
                              {formatAmount(mutasi.amount)}
                            </td>

                            {/* 4. CB/CR */}
                            <td className="py-4 px-3 text-sm text-slate-700 font-normal text-center align-top whitespace-nowrap">
                              {mutasi.type}
                            </td>

                            {/* 5, 6, 7. DB/CR, Kode, Nominal akhir */}
                            <td colSpan={3} className="py-3 px-3 align-top">
                              {isConnectingThis ? (
                                renderAddTransactionInlineForm(mutasi)
                              ) : isFullyAllocated ? (
                                <div className="py-2 px-3 text-xs text-slate-400 italic">
                                  Amount kiri dan kanan sudah sesuai
                                </div>
                              ) : (
                                /* Button: + Add Transaksi matching screenshot */
                                <button
                                  type="button"
                                  onClick={() => handleStartConnect(mutasi)}
                                  className="px-4 py-2 rounded-xl bg-[#008d91] hover:bg-[#007b7f] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Add Transaksi</span>
                                </button>
                              )}
                            </td>

                            {/* 8. Action column */}
                            <td className="py-4 px-2 align-top text-center"></td>
                          </tr>
                        )}

                        {/* If HAS linked transactions */}
                        {hasLinks && (
                          <>
                            {links.map((tx, idx) => {
                              const isEditingThisLink =
                                editingMutasiId === mutasi.id && editingLinkId === tx.id;
                              const isMenuOpen = activeMenuLinkId === tx.id;

                              return (
                                <tr
                                  key={tx.id}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  {/* Left columns rendered only on first row of mutasi with rowSpan */}
                                  {idx === 0 && (
                                    <>
                                      {/* 1. Date */}
                                      <td
                                        rowSpan={leftRowSpan}
                                        className="py-4 px-3 text-sm font-normal text-slate-700 align-top whitespace-nowrap"
                                      >
                                        {mutasi.date}
                                      </td>

                                      {/* 2. Keterangan Bank */}
                                      <td
                                        rowSpan={leftRowSpan}
                                        className="py-4 px-3 text-sm text-slate-700 align-top font-normal leading-relaxed pr-6"
                                      >
                                        {mutasi.keteranganBank}
                                      </td>

                                      {/* 3. Amount */}
                                      <td
                                        rowSpan={leftRowSpan}
                                        className="py-4 px-3 text-sm text-slate-800 font-normal text-right align-top whitespace-nowrap"
                                      >
                                        {formatAmount(mutasi.amount)}
                                      </td>

                                      {/* 4. CB/CR */}
                                      <td
                                        rowSpan={leftRowSpan}
                                        className="py-4 px-3 text-sm text-slate-700 font-normal text-center align-top whitespace-nowrap"
                                      >
                                        {mutasi.type}
                                      </td>
                                    </>
                                  )}

                                  {/* 5, 6, 7. DB/CR, Kode, Nominal akhir for this transaction */}
                                  {isEditingThisLink ? (
                                    /* Inline Edit Row: CR & Kode terkunci, hanya nominal yang bisa diedit */
                                    <td colSpan={3} className="py-2 px-3 align-middle bg-amber-50/50">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 shrink-0">
                                          <input
                                            type="text"
                                            disabled
                                            readOnly
                                            value={tx.dbCr}
                                            className="w-full px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-not-allowed select-none text-center"
                                            title="CR/DB tidak dapat diedit"
                                          />
                                        </div>
                                        <input
                                          type="text"
                                          disabled
                                          readOnly
                                          value={tx.kode}
                                          className="flex-1 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 cursor-not-allowed select-none"
                                          title="Kode tidak dapat diedit"
                                        />
                                        <input
                                          type="number"
                                          min={1}
                                          max={getMutasiRemaining(mutasi) + Math.abs(tx.nominalAkhir)}
                                          value={editNominal}
                                          onChange={(e) => {
                                            const maxAllowed =
                                              getMutasiRemaining(mutasi) + Math.abs(tx.nominalAkhir);
                                            const val = e.target.value;
                                            if (val === '') {
                                              setEditNominal('');
                                              return;
                                            }
                                            const num = parseFloat(val);
                                            if (!isNaN(num) && num > maxAllowed) {
                                              setEditNominal(String(maxAllowed));
                                            } else {
                                              setEditNominal(val);
                                            }
                                          }}
                                          className="w-28 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-right font-semibold text-slate-800 focus:ring-2 focus:ring-[#008d91]/20 focus:outline-hidden"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEdit(mutasi.id, tx.id)}
                                          className="px-2.5 py-1 bg-[#008d91] hover:bg-[#007b7f] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                        >
                                          Simpan
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingLinkId(null)}
                                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer transition-colors"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    </td>
                                  ) : (
                                    <>
                                      {/* 5. DB/CR */}
                                      <td className="py-2.5 px-3 text-sm font-normal text-slate-700 text-center align-middle whitespace-nowrap">
                                        {tx.dbCr}
                                      </td>

                                      {/* 6. Kode */}
                                      <td className="py-2.5 px-3 text-sm text-slate-700 font-normal align-middle">
                                        {tx.kode}
                                      </td>

                                      {/* 7. Nominal akhir */}
                                      <td className="py-2.5 px-3 text-sm text-slate-700 font-normal text-right align-middle whitespace-nowrap">
                                        {formatAmount(tx.nominalAkhir)}
                                      </td>
                                    </>
                                  )}

                                  {/* 8. Action ⋮ Three Dots */}
                                  <td className="py-2.5 px-2 text-center align-middle relative">
                                    <div className="relative inline-block text-left">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuLinkId(isMenuOpen ? null : tx.id);
                                        }}
                                        className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Opsi Transaksi"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {/* Menu Popup */}
                                      {isMenuOpen && (
                                        <div
                                          className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => handleStartEdit(mutasi.id, tx)}
                                            className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
                                          >
                                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Edit Transaksi</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveLink(mutasi.id, tx.id, tx.kode)}
                                            className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus Transaksi</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Row at bottom of transactions: "+ Add Transaksi" button or inline form */}
                            {/* JIKA AMOUNT DI KIRI SUDAH SAMA DENGAN DI KANAN, MAKA "+Add Transaksi" AKAN HILANG */}
                            {!isFullyAllocated && (
                              <tr>
                                <td colSpan={3} className="py-3 px-3 align-top">
                                  {isConnectingThis ? (
                                    renderAddTransactionInlineForm(mutasi)
                                  ) : (
                                    /* Button: + Add Transaksi matching screenshot */
                                    <button
                                      type="button"
                                      onClick={() => handleStartConnect(mutasi)}
                                      className="px-4 py-2 rounded-xl bg-[#008d91] hover:bg-[#007b7f] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>Add Transaksi</span>
                                    </button>
                                  )}
                                </td>
                                <td className="py-3 px-2 align-top text-center"></td>
                              </tr>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Satu mutasi bank dapat dialokasikan ke banyak transaksi (split mutasi) dan sebaliknya.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#008d91] hover:bg-[#007b7f] rounded-xl transition-all cursor-pointer ml-auto shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
