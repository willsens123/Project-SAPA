import React, { useState, useMemo, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Building2,
  Landmark,
  Check,
  CheckCircle2,
  AlertCircle,
  Link2,
  ExternalLink,
  ChevronDown,
  Download,
  Upload,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { MutasiItem, MutasiLinkedTransaction, RekeningItem, PengeluaranItem } from '../types';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';
import { BANK_ACCOUNTS } from '../mutasiData';
import { ImportMutasiModal } from './ImportMutasiModal';
import { ModalHubungkanMutasi } from './ModalHubungkanMutasi';

interface MutasiTableProps {
  items: MutasiItem[];
  rekeningList?: RekeningItem[];
  initialBank?: string;
  salurOrders?: SalurOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  donasiOrders?: DonasiOrder[];
  pengeluaranList?: PengeluaranItem[];
  onUpdateMutasiItems?: (updated: MutasiItem[]) => void;
  onNavigateToRincianMutasi?: (bank?: string) => void;
  onAddClick: (selectedBank: string) => void;
  onEditItem: (item: MutasiItem) => void;
  onDeleteItem: (id: string) => void;
  onImportItems?: (items: MutasiItem[], mode: 'append' | 'replace', targetBank?: string) => void;
  onShowToast?: (message: string) => void;
}

export const MutasiTable: React.FC<MutasiTableProps> = ({
  items,
  rekeningList = [],
  initialBank = 'BCA 888',
  salurOrders = [],
  transaksiAjarList = [],
  donasiOrders = [],
  pengeluaranList = [],
  onUpdateMutasiItems,
  onNavigateToRincianMutasi,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onImportItems,
  onShowToast,
}) => {
  // Selected bank filter: 'ALL' | 'GROUP_BCA' | 'GROUP_MANDIRI' | specific account id (e.g. 'BCA 888')
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>(initialBank || 'BCA 888');
  const [reconciliationFilter, setReconciliationFilter] = useState<'ALL' | 'CONNECTED' | 'UNCONNECTED'>('ALL');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState<boolean>(false);
  const [isHideBalance, setIsHideBalance] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CR' | 'DB'>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);

  // Direct modal connect state for streamlined reconciliation
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [selectedMutasiForConnect, setSelectedMutasiForConnect] = useState<MutasiItem | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
      setIsFilterOpen(false);
      setIsExportMenuOpen(false);
      setIsBankDropdownOpen(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Update selection if initialBank prop changes
  useEffect(() => {
    if (initialBank) {
      setSelectedBankFilter(initialBank);
    }
  }, [initialBank]);

  // Dynamically compile available bank accounts from configured data, rekeningList, and actual items
  const dynamicBankOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string; bankCode: string; nomorRekening?: string; bgColor?: string }>();

    // 1. Configured BANK_ACCOUNTS
    BANK_ACCOUNTS.forEach((b) => {
      const code = b.id.toUpperCase().includes('MANDIRI') ? 'Mandiri' : 'BCA';
      map.set(b.id, {
        id: b.id,
        label: b.label || `Mutasi ${b.id}`,
        bankCode: code,
        nomorRekening: '0077119888',
        bgColor: code === 'Mandiri' ? '#8c52ad' : '#00899B',
      });
    });

    // 2. Rekening List from props
    rekeningList.forEach((rek) => {
      if (!map.has(rek.nama)) {
        const code = rek.bankCode || (rek.nama.toUpperCase().includes('MANDIRI') ? 'Mandiri' : 'BCA');
        map.set(rek.nama, {
          id: rek.nama,
          label: `Mutasi ${rek.nama}`,
          bankCode: code,
          nomorRekening: rek.nomorRekening,
          bgColor: rek.bgColor || (code === 'Mandiri' ? '#8c52ad' : '#00899B'),
        });
      }
    });

    // 3. Any additional bank found in items
    items.forEach((item) => {
      if (item.bankAccount && !map.has(item.bankAccount)) {
        const code = item.bankAccount.toUpperCase().includes('MANDIRI') ? 'Mandiri' : 'BCA';
        map.set(item.bankAccount, {
          id: item.bankAccount,
          label: `Mutasi ${item.bankAccount}`,
          bankCode: code,
          bgColor: code === 'Mandiri' ? '#8c52ad' : '#00899B',
        });
      }
    });

    return Array.from(map.values());
  }, [items, rekeningList]);

  // Helper to test if a mutation matches a bank filter
  const isMatchBank = (item: MutasiItem, filter: string) => {
    if (filter === 'ALL') return true;
    if (filter === 'GROUP_BCA') return (item.bankAccount || '').toUpperCase().includes('BCA');
    if (filter === 'GROUP_MANDIRI') return (item.bankAccount || '').toUpperCase().includes('MANDIRI');
    return (item.bankAccount || '').toLowerCase() === filter.toLowerCase();
  };

  // Stats calculation for each bank option (total & reconciliation progress)
  const getBankOptionStats = (filterId: string) => {
    const matching = items.filter((m) => isMatchBank(m, filterId));
    const connected = matching.filter(
      (m) => m.linkedTransactions && m.linkedTransactions.length > 0
    ).length;
    return {
      total: matching.length,
      connected,
      unconnected: matching.length - connected,
      rate: matching.length > 0 ? Math.round((connected / matching.length) * 100) : 0,
    };
  };

  // Export to CSV function (All or Selected Bank)
  const handleExportCSV = (exportAll = false) => {
    const exportTargetItems = exportAll
      ? items
      : items.filter((i) => isMatchBank(i, selectedBankFilter));

    if (exportTargetItems.length === 0) {
      if (onShowToast) onShowToast('Tidak ada data mutasi untuk diexport');
      return;
    }

    const headers = [
      'Date',
      'Bank Account',
      'Keterangan Bank',
      'Branch',
      'Amount',
      'Type',
      'Balance',
      'Status Rekonsiliasi',
      'Transaksi Terhubung',
      'Catatan',
    ];

    const rows = exportTargetItems.map((item) => {
      const isConnected = Boolean(item.linkedTransactions && item.linkedTransactions.length > 0);
      const linkedCodes = (item.linkedTransactions || []).map((l) => l.kode).join('; ');

      return [
        `"${item.date}"`,
        `"${item.bankAccount}"`,
        `"${(item.keteranganBank || '').replace(/"/g, '""')}"`,
        `"${item.branch}"`,
        item.amount,
        item.type,
        item.balance,
        `"${isConnected ? 'Terhubung' : 'Belum Terhubung'}"`,
        `"${linkedCodes.replace(/"/g, '""')}"`,
        `"${(item.catatan || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanLabel = selectedBankFilter.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = exportAll
      ? `mutasi_semua_rekening_${dateStr}.csv`
      : `mutasi_${cleanLabel}_${dateStr}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(
        `Export berhasil: ${exportTargetItems.length} data mutasi diunduh (${exportAll ? 'Semua Rekening' : selectedBankFilter})`
      );
    }
  };

  // Dedicated Export to CSV function for only reconciled transactions of the selected bank account / current view
  const handleExportReconciledCSV = () => {
    const reconciledItems = items.filter((item) => {
      // 1. Bank account filter
      if (!isMatchBank(item, selectedBankFilter)) return false;

      // 2. Must be reconciled (terhubung)
      const isConnected = Boolean(item.linkedTransactions && item.linkedTransactions.length > 0);
      if (!isConnected) return false;

      // 3. Respect active type filter if user selected CR or DB
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      // 4. Respect active search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = (item.keteranganBank || '').toLowerCase().includes(q);
        const matchAmount = item.amount.toString().toLowerCase().includes(q);
        const matchBranch = (item.branch || '').toLowerCase().includes(q);
        const matchNote = (item.catatan || '').toLowerCase().includes(q);
        const matchCode = (item.linkedTransactions || []).some(
          (t) => t.kode.toLowerCase().includes(q) || t.deskripsi.toLowerCase().includes(q)
        );
        if (!matchDesc && !matchAmount && !matchBranch && !matchNote && !matchCode) return false;
      }

      return true;
    });

    if (reconciledItems.length === 0) {
      if (onShowToast) {
        onShowToast(
          `Tidak ada transaksi terhubung (rekonsiliasi) untuk rekening ${selectedBankDisplay.label} pada filter saat ini`
        );
      }
      return;
    }

    const headers = [
      'Date',
      'Bank Account',
      'Keterangan Bank',
      'Branch',
      'Amount',
      'Type',
      'Balance',
      'Status Rekonsiliasi',
      'Jumlah Transaksi Terhubung',
      'Kode Transaksi Terhubung',
      'Rincian Transaksi Terhubung',
      'Catatan',
    ];

    const rows = reconciledItems.map((item) => {
      const linkedList = item.linkedTransactions || [];
      const linkedCodes = linkedList.map((l) => l.kode).join('; ');
      const linkedDetails = linkedList
        .map((l) => `${l.kode} - ${l.deskripsi} (${l.nominal}) [${l.kategori}]`)
        .join(' | ');

      return [
        `"${item.date}"`,
        `"${item.bankAccount}"`,
        `"${(item.keteranganBank || '').replace(/"/g, '""')}"`,
        `"${item.branch}"`,
        item.amount,
        item.type,
        item.balance,
        `"Terhubung (Reconciled)"`,
        linkedList.length,
        `"${linkedCodes.replace(/"/g, '""')}"`,
        `"${linkedDetails.replace(/"/g, '""')}"`,
        `"${(item.catatan || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanLabel = selectedBankFilter.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = `mutasi_reconciled_${cleanLabel}_${dateStr}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(
        `Export CSV berhasil: ${reconciledItems.length} transaksi rekonsiliasi ${selectedBankDisplay.label} diunduh`
      );
    }
  };

  // Filter items by bank, reconciliation status, search query, and type
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Bank filter
      if (!isMatchBank(item, selectedBankFilter)) {
        return false;
      }

      // 2. Reconciliation filter
      const isConnected = Boolean(item.linkedTransactions && item.linkedTransactions.length > 0);
      if (reconciliationFilter === 'CONNECTED' && !isConnected) {
        return false;
      }
      if (reconciliationFilter === 'UNCONNECTED' && isConnected) {
        return false;
      }

      // 3. Type filter (CR / DB)
      if (typeFilter !== 'ALL' && item.type !== typeFilter) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesKet = (item.keteranganBank || '').toLowerCase().includes(query);
        const matchesDate = (item.date || '').toLowerCase().includes(query);
        const matchesAmount = item.amount.toString().includes(query);
        const matchesBranch = String(item.branch).toLowerCase().includes(query);
        const matchesBankName = (item.bankAccount || '').toLowerCase().includes(query);
        const matchesLinked = (item.linkedTransactions || []).some(
          (l) => l.kode.toLowerCase().includes(query) || (l.keterangan || '').toLowerCase().includes(query)
        );
        return matchesKet || matchesDate || matchesAmount || matchesBranch || matchesBankName || matchesLinked;
      }

      return true;
    });
  }, [items, selectedBankFilter, reconciliationFilter, typeFilter, searchQuery]);

  // Overall statistics for current bank filter
  const currentFilterStats = useMemo(() => {
    const bankMatched = items.filter((m) => isMatchBank(m, selectedBankFilter));
    const totalCount = bankMatched.length;
    const connectedCount = bankMatched.filter(
      (m) => m.linkedTransactions && m.linkedTransactions.length > 0
    ).length;
    const unconnectedCount = totalCount - connectedCount;
    const totalCR = bankMatched.filter((m) => m.type === 'CR').reduce((sum, m) => sum + m.amount, 0);
    const totalDB = bankMatched.filter((m) => m.type === 'DB').reduce((sum, m) => sum + m.amount, 0);
    const reconcileRate = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      connectedCount,
      unconnectedCount,
      totalCR,
      totalDB,
      reconcileRate,
    };
  }, [items, selectedBankFilter]);

  // Format currency numbers
  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper label for the selected bank
  const selectedBankDisplay = useMemo(() => {
    if (selectedBankFilter === 'ALL') {
      return {
        label: 'Semua Rekening Bank',
        code: 'ALL',
        color: 'bg-slate-700 text-white',
        badgeColor: 'bg-slate-100 text-slate-700',
      };
    }
    if (selectedBankFilter === 'GROUP_BCA') {
      return {
        label: 'Semua Rekening BCA',
        code: 'BCA',
        color: 'bg-[#00899B] text-white',
        badgeColor: 'bg-teal-50 text-teal-700 border border-teal-200',
      };
    }
    if (selectedBankFilter === 'GROUP_MANDIRI') {
      return {
        label: 'Semua Rekening Mandiri',
        code: 'MANDIRI',
        color: 'bg-[#8c52ad] text-white',
        badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
      };
    }
    const found = dynamicBankOptions.find((b) => b.id.toLowerCase() === selectedBankFilter.toLowerCase());
    return {
      label: found ? found.label : selectedBankFilter,
      code: found?.bankCode || 'BANK',
      color: found?.bankCode === 'Mandiri' ? 'bg-[#8c52ad] text-white' : 'bg-[#00899B] text-white',
      badgeColor: found?.bankCode === 'Mandiri' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-teal-50 text-teal-700 border border-teal-200',
    };
  }, [selectedBankFilter, dynamicBankOptions]);

  // Handle direct saving of linked transaction from modal
  const handleSaveLink = (mutasiId: string, link: MutasiLinkedTransaction) => {
    if (!onUpdateMutasiItems) {
      if (onShowToast) onShowToast('Pembaruan data mutasi belum terhubung ke storage');
      return;
    }
    const updated = items.map((m) => {
      if (m.id === mutasiId) {
        return {
          ...m,
          linkedTransactions: [...(m.linkedTransactions || []), link],
        };
      }
      return m;
    });
    onUpdateMutasiItems(updated);
    setIsConnectModalOpen(false);
    setSelectedMutasiForConnect(null);
    if (onShowToast) {
      onShowToast(`Mutasi berhasil direkonsiliasi dengan transaksi "${link.kode}"`);
    }
  };

  // Safe Add button handler
  const handleAddMutasi = () => {
    const targetBank =
      selectedBankFilter === 'ALL' || selectedBankFilter.startsWith('GROUP_')
        ? 'BCA 888'
        : selectedBankFilter;
    onAddClick(targetBank);
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-100 min-h-[600px] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ================= TOP SECTION: BANK FILTER DROPDOWN & ACTIONS ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Left: Filter Dropdown & Quick Bank Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Bank Account Filter Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white hover:from-white hover:to-slate-50 border-2 border-[#00899B]/30 hover:border-[#00899B] rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#00899B]/10 flex items-center justify-center text-[#00899B] group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">
                  Filter Rekening Bank
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <span>{selectedBankDisplay.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-[#00899B]/10 text-[#00899B]">
                    {currentFilterStats.totalCount} mutasi
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 group-hover:text-[#00899B] transition-transform duration-200 ml-1 ${
                  isBankDropdownOpen ? 'rotate-180 text-[#00899B]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isBankDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Dropdown Header */}
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pilih Rekening Bank
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Filter transaksi untuk kemudahan rekonsiliasi
                    </p>
                  </div>
                  <Landmark className="w-4 h-4 text-slate-400" />
                </div>

                <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                  {/* Option: Semua Rekening */}
                  {(() => {
                    const stats = getBankOptionStats('ALL');
                    const isSelected = selectedBankFilter === 'ALL';
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBankFilter('ALL');
                          setIsBankDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#00899B]/10 border border-[#00899B]/30'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Semua Rekening Bank</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                Global
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {stats.total} total mutasi • {stats.connected} terhubung ({stats.rate}%)
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#00899B] shrink-0" />}
                      </button>
                    );
                  })()}

                  {/* Section Divider: Bank Group Filter */}
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                    Filter Grup Bank
                  </div>

                  {/* Option: Grup BCA */}
                  {(() => {
                    const stats = getBankOptionStats('GROUP_BCA');
                    const isSelected = selectedBankFilter === 'GROUP_BCA';
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBankFilter('GROUP_BCA');
                          setIsBankDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#00899B]/10 border border-[#00899B]/30'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#00899B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            BCA
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Semua Rekening BCA</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 font-mono">
                                BCA 888 & 388
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {stats.total} mutasi • {stats.connected} terhubung ({stats.rate}%)
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#00899B] shrink-0" />}
                      </button>
                    );
                  })()}

                  {/* Option: Grup Mandiri */}
                  {(() => {
                    const stats = getBankOptionStats('GROUP_MANDIRI');
                    const isSelected = selectedBankFilter === 'GROUP_MANDIRI';
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBankFilter('GROUP_MANDIRI');
                          setIsBankDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border border-purple-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#8c52ad] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            MDR
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Semua Rekening Mandiri</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {stats.total} mutasi • {stats.connected} terhubung ({stats.rate}%)
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    );
                  })()}

                  {/* Section Divider: Specific Bank Accounts */}
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                    Rekening Bank Spesifik
                  </div>

                  {dynamicBankOptions.map((bank) => {
                    const stats = getBankOptionStats(bank.id);
                    const isSelected = selectedBankFilter === bank.id;
                    const isMandiri = bank.bankCode === 'Mandiri';

                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setSelectedBankFilter(bank.id);
                          setIsBankDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? isMandiri
                              ? 'bg-purple-50 border border-purple-200'
                              : 'bg-[#00899B]/10 border border-[#00899B]/30'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                              isMandiri ? 'bg-[#8c52ad]' : 'bg-[#00899B]'
                            }`}
                          >
                            {bank.bankCode === 'Mandiri' ? 'M' : 'B'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{bank.id}</span>
                              {bank.nomorRekening && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({bank.nomorRekening})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{stats.total} mutasi</span>
                              <span>•</span>
                              <span
                                className={`font-semibold ${
                                  stats.unconnected === 0
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {stats.connected}/{stats.total} terhubung ({stats.rate}%)
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check
                            className={`w-4 h-4 shrink-0 ${
                              isMandiri ? 'text-purple-600' : 'text-[#00899B]'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Footer */}
                <div className="px-4 pt-2 pb-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Total Data: {items.length} mutasi</span>
                  {onNavigateToRincianMutasi && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsBankDropdownOpen(false);
                        onNavigateToRincianMutasi(selectedBankFilter);
                      }}
                      className="text-[#00899B] hover:text-[#007b8c] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka Rekonsiliasi</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Bank Pills Navigation */}
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'BCA 888', label: 'BCA 888' },
              { id: 'BCA 388', label: 'BCA 388' },
              { id: 'Mandiri', label: 'Mandiri' },
            ].map((pill) => {
              const isActive = selectedBankFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setSelectedBankFilter(pill.id);
                    setActiveMenuId(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#00899B] text-white shadow-xs ring-2 ring-[#00899B]/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Action Icons & Add Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-end lg:self-auto">
          {/* Search Toggle / Input */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari keterangan, kode..."
                autoFocus
                className="text-xs sm:text-sm bg-transparent border-none outline-hidden w-36 sm:w-52 text-slate-700"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari Mutasi"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Hide/Show Balance Toggle */}
          <button
            type="button"
            onClick={() => setIsHideBalance(!isHideBalance)}
            title={isHideBalance ? 'Tampilkan Saldo & Nominal' : 'Sembunyikan Saldo & Nominal'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isHideBalance ? (
              <EyeOff className="w-5 h-5 text-slate-600" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>

          {/* Filter Type Toggle (CR/DB) */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Tipe Masuk/Keluar"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                typeFilter !== 'ALL'
                  ? 'bg-[#00899B]/10 text-[#00899B]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Filter Tipe
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('ALL');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                    typeFilter === 'ALL'
                      ? 'bg-[#00899B]/10 text-[#00899B] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Semua Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('CR');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                    typeFilter === 'CR'
                      ? 'bg-[#00899B]/10 text-[#00899B] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  CR (Kredit / Masuk)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('DB');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-lg font-medium cursor-pointer ${
                    typeFilter === 'DB'
                      ? 'bg-[#00899B]/10 text-[#00899B] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  DB (Debet / Keluar)
                </button>
              </div>
            )}
          </div>

          {/* Export Menu Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              title="Export Data Mutasi (CSV)"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                isExportMenuOpen
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Opsi Export Data Mutasi
                </div>
                {/* 1. Only Reconciled transactions for the selected bank account */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleExportReconciledCSV();
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 rounded-lg flex items-center justify-between cursor-pointer font-medium transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Export Terhubung / Reconciled Saja</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-200/70 px-1.5 py-0.5 rounded-full font-mono font-bold">
                    ({currentFilterStats.connectedCount})
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* 2. All transactions for current bank filter */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleExportCSV(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span>Export Semua ({selectedBankDisplay.label})</span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">
                    ({filteredItems.length})
                  </span>
                </button>

                {/* 3. All bank accounts */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    handleExportCSV(true);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span>Export Semua Rekening</span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">
                    ({items.length})
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            title="Import Data Mutasi (CSV / TXT)"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAddMutasi}
            className="flex items-center gap-1 px-4 py-2 bg-[#00899B] hover:bg-[#007b8c] text-white rounded-xl font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ================= RECONCILIATION SUMMARY & STREAMLINING BAR ================= */}
      <div className="my-3 p-3.5 bg-gradient-to-r from-slate-50 via-teal-50/20 to-slate-50 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Quick Reconciliation Status Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status Rekonsiliasi:
          </span>
          <button
            type="button"
            onClick={() => setReconciliationFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              reconciliationFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua ({currentFilterStats.totalCount})
          </button>
          <button
            type="button"
            onClick={() => setReconciliationFilter('CONNECTED')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              reconciliationFilter === 'CONNECTED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terhubung ({currentFilterStats.connectedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setReconciliationFilter('UNCONNECTED')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              reconciliationFilter === 'UNCONNECTED'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Perlu Rekonsiliasi ({currentFilterStats.unconnectedCount})</span>
          </button>
        </div>

        {/* Right: Progress Meter, Dedicated Export Reconciled Button & Workspace Link */}
        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-500 font-medium">
              Progress Rekonsiliasi: <strong className="text-slate-800">{currentFilterStats.connectedCount}/{currentFilterStats.totalCount}</strong> ({currentFilterStats.reconcileRate}%)
            </div>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${currentFilterStats.reconcileRate}%` }}
              />
            </div>
          </div>

          {/* Dedicated 'Export to CSV' button specifically for reconciled transactions of the current bank account view */}
          <button
            type="button"
            onClick={handleExportReconciledCSV}
            title={`Export to CSV: Download hanya transaksi yang sudah direkonsiliasi (${currentFilterStats.connectedCount}) untuk ${selectedBankDisplay.label}`}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV (Reconciled)</span>
            <span className="bg-emerald-800/60 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
              {currentFilterStats.connectedCount}
            </span>
          </button>

          {onNavigateToRincianMutasi && (
            <button
              type="button"
              onClick={() => onNavigateToRincianMutasi(selectedBankFilter)}
              title="Buka Halaman Rincian Mutasi untuk rekonsiliasi detail"
              className="px-3 py-1.5 bg-[#00899B]/10 hover:bg-[#00899B]/20 text-[#00899B] font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ================= MAIN MUTASI TABLE ================= */}
      <div className="overflow-x-auto w-full flex-1">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-3 px-3 text-sm font-semibold text-slate-700 w-24">
                Date
              </th>
              {/* Show Rekening Bank column if filtering across multiple accounts */}
              {(selectedBankFilter === 'ALL' || selectedBankFilter.startsWith('GROUP_')) && (
                <th className="py-3 px-3 text-sm font-semibold text-slate-700 w-28">
                  Rekening
                </th>
              )}
              <th className="py-3 px-3 text-sm font-semibold text-slate-700">
                Keterangan Bank
              </th>
              <th className="py-3 px-3 text-sm font-semibold text-slate-700 text-center w-36">
                Status Rekonsiliasi
              </th>
              <th className="py-3 px-3 text-sm font-semibold text-slate-700 text-center w-20">
                Branch
              </th>
              <th className="py-3 px-3 text-sm font-semibold text-slate-700 text-right w-36">
                Amount
              </th>
              <th className="py-3 px-3 text-sm font-semibold text-slate-700 text-center w-20">
                CB/CR
              </th>
              <th className="py-3 px-3 text-sm font-semibold text-slate-700 text-right w-44">
                Balance
              </th>
              <th className="py-3 px-2 text-sm font-semibold text-slate-700 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[13.5px]">
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    (selectedBankFilter === 'ALL' || selectedBankFilter.startsWith('GROUP_')) ? 9 : 8
                  }
                  className="py-14 text-center text-slate-400"
                >
                  <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">
                    Tidak ada data mutasi yang sesuai filter
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ditemukan mutasi dengan kata kunci "${searchQuery}"`
                      : reconciliationFilter !== 'ALL'
                      ? `Tidak ada transaksi dengan status ${
                          reconciliationFilter === 'CONNECTED' ? 'Terhubung' : 'Perlu Rekonsiliasi'
                        } pada filter rekening ini.`
                      : 'Coba ubah filter rekening bank di atas untuk melihat data mutasi lainnya.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isConnected = Boolean(item.linkedTransactions && item.linkedTransactions.length > 0);
                const isMandiri = (item.bankAccount || '').toUpperCase().includes('MANDIRI');

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap align-top">
                      {item.date}
                    </td>

                    {/* Bank Account (Conditional when multi-bank filter active) */}
                    {(selectedBankFilter === 'ALL' || selectedBankFilter.startsWith('GROUP_')) && (
                      <td className="py-3 px-3 whitespace-nowrap align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isMandiri
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          {item.bankAccount}
                        </span>
                      </td>
                    )}

                    {/* Keterangan Bank */}
                    <td className="py-3 px-3 text-slate-700 font-normal leading-relaxed break-words max-w-md align-top">
                      <div>{item.keteranganBank}</div>
                      {/* Sub-line showing connected transactions if any */}
                      {isConnected && item.linkedTransactions && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {item.linkedTransactions.map((l) => (
                            <span
                              key={l.id}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono"
                              title={`${l.keterangan || ''} (Rp ${formatAmount(l.nominalAkhir)})`}
                            >
                              <Link2 className="w-3 h-3 text-emerald-600" />
                              <span>{l.kode}</span>
                              <span className="text-[10px] text-emerald-600">
                                (Rp {formatAmount(l.nominalAkhir)})
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status Rekonsiliasi Column */}
                    <td className="py-3 px-3 text-center whitespace-nowrap align-top">
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Terhubung ({item.linkedTransactions?.length})</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMutasiForConnect(item);
                            setIsConnectModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer group/btn"
                          title="Klik untuk merekonsiliasi mutasi ini"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span className="group-hover/btn:underline">+ Hubungkan</span>
                        </button>
                      )}
                    </td>

                    {/* Branch */}
                    <td className="py-3 px-3 text-slate-600 text-center whitespace-nowrap align-top font-mono text-xs">
                      {item.branch}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-slate-800 text-right whitespace-nowrap font-medium align-top">
                      {isHideBalance ? (
                        <span className="text-slate-400 select-none tracking-wider">••••••••</span>
                      ) : (
                        formatAmount(item.amount)
                      )}
                    </td>

                    {/* CB/CR */}
                    <td className="py-3 px-3 text-center whitespace-nowrap align-top">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-xs ${
                          item.type === 'CR'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-3 text-slate-700 text-right whitespace-nowrap font-normal align-top">
                      {isHideBalance ? (
                        <span className="text-slate-400 select-none tracking-wider">••••••••</span>
                      ) : (
                        formatAmount(item.balance)
                      )}
                    </td>

                    {/* Action Menu */}
                    <td className="py-3 px-2 text-center relative whitespace-nowrap align-top">
                      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setSelectedMutasiForConnect(item);
                                setIsConnectModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Link2 className="w-3.5 h-3.5 text-[#00899B]" />
                              <span>{isConnected ? 'Kelola Hubungan' : 'Hubungkan Transaksi'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditItem(item);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Mutasi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteItem(item.id);
                                onShowToast?.(`Mutasi tanggal ${item.date} berhasil dihapus`);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= FOOTER INFO & SUMMARY ================= */}
      <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Menampilkan <span className="font-semibold text-slate-800">{filteredItems.length}</span> dari{' '}
          <span className="font-semibold text-slate-800">{items.length}</span> data mutasi (
          <strong className="text-slate-800">{selectedBankDisplay.label}</strong>)
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {reconciliationFilter !== 'ALL' && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
              Status: {reconciliationFilter === 'CONNECTED' ? 'Terhubung' : 'Perlu Rekonsiliasi'}
            </span>
          )}
          {typeFilter !== 'ALL' && (
            <span className="bg-[#00899B]/10 text-[#00899B] px-2 py-0.5 rounded-md font-medium text-[11px]">
              Tipe: {typeFilter}
            </span>
          )}
          {searchQuery && (
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium text-[11px]">
              Pencarian: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* ================= IMPORT MUTASI MODAL ================= */}
      <ImportMutasiModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultBank={
          selectedBankFilter === 'ALL' || selectedBankFilter.startsWith('GROUP_')
            ? 'BCA 888'
            : selectedBankFilter
        }
        onImportSuccess={(newItems, mode, targetBank) => {
          if (onImportItems) {
            onImportItems(newItems, mode, targetBank);
          }
        }}
      />

      {/* ================= MODAL HUBUNGKAN / REKONSILIASI MUTASI ================= */}
      <ModalHubungkanMutasi
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setSelectedMutasiForConnect(null);
        }}
        mutasi={selectedMutasiForConnect}
        salurOrders={salurOrders}
        transaksiAjarList={transaksiAjarList}
        donasiOrders={donasiOrders}
        pengeluaranList={pengeluaranList}
        onSaveLink={handleSaveLink}
        onShowToast={onShowToast}
      />
    </div>
  );
};
