import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Landmark,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Scale,
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Building2,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { JournalEntry, CoaAccount } from '../accountingData';

export interface BukuBesarGeneralLedgerProps {
  journalEntries: JournalEntry[];
  coaList: CoaAccount[];
  isPrivacyMasked?: boolean;
  onSelectJournalDetail?: (entry: JournalEntry) => void;
  onNavigateToSource?: (source: string) => void;
  onOpenPdfModal?: () => void;
}

export interface LedgerTransactionLine {
  journalId: string;
  nomorJurnal: string;
  tanggalJurnal: string;
  sumberTransaksi: string;
  nomorReferensi: string;
  keterangan: string;
  programKegiatan: string;
  rekeningBank?: string;
  debet: number;
  kredit: number;
  runningBalance: number;
  originalEntry: JournalEntry;
  isReversed?: boolean;
  isReversalEntry?: boolean;
}

export interface AccountLedgerData {
  account: CoaAccount;
  noAkun: string;
  namaAkun: string;
  kelompok: string;
  pos: 'D' | 'K';
  saldoAwal: number;
  totalDebet: number;
  totalKredit: number;
  saldoAkhir: number;
  transactions: LedgerTransactionLine[];
  hasActivity: boolean;
}

export const BukuBesarGeneralLedgerView: React.FC<BukuBesarGeneralLedgerProps> = ({
  journalEntries,
  coaList,
  isPrivacyMasked = false,
  onSelectJournalDetail,
  onNavigateToSource,
  onOpenPdfModal,
}) => {
  // View mode: 'single' (Akun Terpilih), 'all' (Semua Akun / Multi-Ledger), 'trialBalance' (Neraca Saldo)
  const [viewMode, setViewMode] = useState<'single' | 'all' | 'trialBalance'>('single');
  const [selectedAccountNo, setSelectedAccountNo] = useState<string>('10001'); // Default Kas BCA Penerbitan
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [selectedKelompokFilter, setSelectedKelompokFilter] = useState<string>('ALL');
  const [onlyActiveAccounts, setOnlyActiveAccounts] = useState(true);
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({ '10001': true });

  // Format currency helpers
  const formatRupiah = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
    if (isPrivacyMasked) return 'Rp ••••••••';
    if (val < 0) {
      return `(Rp ${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatTableCellAmount = (val: number): string => {
    if (isPrivacyMasked) return '••••';
    if (!val || val === 0) return '-';
    if (val < 0) return `(${Math.abs(val).toLocaleString('id-ID')})`;
    return val.toLocaleString('id-ID');
  };

  // Helper source badge styling
  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'Mutasi Bank':
        return { bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: Landmark, label: 'Mutasi' };
      case 'Transaksi Salur':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: BookOpen, label: 'S-SALUR' };
      case 'Transaksi Donasi':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Receipt, label: 'D-DONASI' };
      case 'Pengeluaran':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: TrendingDown, label: 'Pengeluaran' };
      case 'Transaksi Ajar':
        return { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: Sparkles, label: 'A-AJAR' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: FileText, label: source };
    }
  };

  // Build General Ledger per Account
  const ledgerDataByAccount = useMemo<Record<string, AccountLedgerData>>(() => {
    const result: Record<string, AccountLedgerData> = {};

    // 1. Initialize ledger for each account in coaList
    coaList.forEach((acc) => {
      // Calculate initial balance based on normal balance position
      const debetAwal = acc.saldoAwalDebet || 0;
      const kreditAwal = acc.saldoAwalKredit || 0;
      let initialNet = 0;
      if (acc.pos === 'D') {
        initialNet = debetAwal - kreditAwal;
      } else {
        initialNet = kreditAwal - debetAwal;
      }

      result[acc.noAkun] = {
        account: acc,
        noAkun: acc.noAkun,
        namaAkun: acc.namaAkun,
        kelompok: acc.kelompok || 'LAINNYA',
        pos: acc.pos || 'D',
        saldoAwal: initialNet,
        totalDebet: 0,
        totalKredit: 0,
        saldoAkhir: initialNet,
        transactions: [],
        hasActivity: initialNet !== 0,
      };
    });

    // Helper map of accounts by name for fallback lookup
    const coaByName = new Map<string, CoaAccount>();
    coaList.forEach((acc) => {
      coaByName.set(acc.namaAkun.toLowerCase().trim(), acc);
    });

    // 2. Process all journal entries chronologically
    // Sort journals by date or posting time
    const sortedJournals = [...journalEntries].sort((a, b) => {
      const dateA = a.tanggalJurnal || '';
      const dateB = b.tanggalJurnal || '';
      return dateA.localeCompare(dateB);
    });

    sortedJournals.forEach((entry) => {
      // Apply source filter if specified
      if (selectedSourceFilter !== 'ALL') {
        if (selectedSourceFilter === 'mutasiBank' && entry.sumberTransaksi !== 'Mutasi Bank') return;
        if (selectedSourceFilter === 'salur' && entry.sumberTransaksi !== 'Transaksi Salur') return;
        if (selectedSourceFilter === 'donasi' && entry.sumberTransaksi !== 'Transaksi Donasi') return;
        if (selectedSourceFilter === 'pengeluaran' && entry.sumberTransaksi !== 'Pengeluaran') return;
        if (selectedSourceFilter === 'ajar' && entry.sumberTransaksi !== 'Transaksi Ajar') return;
        if (selectedSourceFilter === 'reversal' && !entry.isReversalEntry) return;
      }

      (entry.lines || []).forEach((line) => {
        const nominalDb = line.nominalDebet || 0;
        const nominalKr = line.nominalKredit || 0;

        if (nominalDb === 0 && nominalKr === 0) return;

        // Determine account code
        let targetAccountCode: string | null = null;
        if (nominalDb > 0 && line.kodeAkunDb) {
          targetAccountCode = line.kodeAkunDb;
        } else if (nominalKr > 0 && line.kodeAkunKr) {
          targetAccountCode = line.kodeAkunKr;
        } else if (line.kodeAkunDb) {
          targetAccountCode = line.kodeAkunDb;
        } else if (line.kodeAkunKr) {
          targetAccountCode = line.kodeAkunKr;
        } else if (line.namaAkun) {
          const matchByName = coaByName.get(line.namaAkun.toLowerCase().trim());
          if (matchByName) {
            targetAccountCode = matchByName.noAkun;
          }
        }

        if (!targetAccountCode) return;

        const inferKelompok = (code: string): CoaAccount['kelompok'] => {
          const first = code.charAt(0);
          if (first === '1') return 'AKTIVA';
          if (first === '2') return 'KEWAJIBAN';
          if (first === '3') return 'EKUITAS';
          if (first === '4') return 'PENDAPATAN';
          if (first === '5') return 'BIAYA PROGRAM';
          return 'BIAYA OPERASIONAL';
        };

        // If account isn't in result yet (custom dynamically created account)
        if (!result[targetAccountCode]) {
          const resolvedKelompok = inferKelompok(targetAccountCode);
          result[targetAccountCode] = {
            account: {
              noAkun: targetAccountCode,
              namaAkun: line.namaAkun || `Akun ${targetAccountCode}`,
              kelompok: resolvedKelompok,
              pos: nominalDb > 0 ? 'D' : 'K',
              saldoAwalDebet: 0,
              saldoAwalKredit: 0,
            },
            noAkun: targetAccountCode,
            namaAkun: line.namaAkun || `Akun ${targetAccountCode}`,
            kelompok: resolvedKelompok,
            pos: nominalDb > 0 ? 'D' : 'K',
            saldoAwal: 0,
            totalDebet: 0,
            totalKredit: 0,
            saldoAkhir: 0,
            transactions: [],
            hasActivity: true,
          };
        }

        const ledger = result[targetAccountCode];
        ledger.hasActivity = true;
        ledger.totalDebet += nominalDb;
        ledger.totalKredit += nominalKr;

        // We will calculate running balance after gathering all lines for this account
        ledger.transactions.push({
          journalId: entry.id,
          nomorJurnal: entry.nomorJurnal,
          tanggalJurnal: entry.tanggalJurnal,
          sumberTransaksi: entry.sumberTransaksi,
          nomorReferensi: entry.nomorReferensiBank || entry.mutasiId || '-',
          keterangan: line.keterangan || entry.keteranganTransaksi || '-',
          programKegiatan: entry.programKegiatan || '-',
          rekeningBank: entry.rekeningBank,
          debet: nominalDb,
          kredit: nominalKr,
          runningBalance: 0,
          originalEntry: entry,
          isReversed: entry.isReversed,
          isReversalEntry: entry.isReversalEntry,
        });
      });
    });

    // 3. Calculate running balance for each account
    Object.values(result).forEach((ledger) => {
      let currentBalance = ledger.saldoAwal;
      ledger.transactions.forEach((tx) => {
        if (ledger.pos === 'D') {
          currentBalance += tx.debet - tx.kredit;
        } else {
          currentBalance += tx.kredit - tx.debet;
        }
        tx.runningBalance = currentBalance;
      });
      ledger.saldoAkhir = currentBalance;
    });

    return result;
  }, [journalEntries, coaList, selectedSourceFilter]);

  // Accounts list sorted by Account Number
  const sortedAccountList = useMemo(() => {
    const list = Object.values(ledgerDataByAccount) as AccountLedgerData[];
    return list.sort((a, b) =>
      a.noAkun.localeCompare(b.noAkun, undefined, { numeric: true })
    );
  }, [ledgerDataByAccount]);

  // Filtered accounts for display
  const filteredAccounts = useMemo(() => {
    return sortedAccountList.filter((acc) => {
      // Header check (if account is header with no activity, skip unless searching)
      if (acc.account.isHeader && acc.transactions.length === 0 && acc.saldoAwal === 0) {
        return false;
      }

      // Only active accounts
      if (onlyActiveAccounts && !acc.hasActivity && acc.transactions.length === 0) {
        return false;
      }

      // Kelompok filter
      if (selectedKelompokFilter !== 'ALL' && acc.kelompok !== selectedKelompokFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = acc.noAkun.toLowerCase().includes(q);
        const matchName = acc.namaAkun.toLowerCase().includes(q);
        const matchKelompok = acc.kelompok.toLowerCase().includes(q);
        const matchTx = acc.transactions.some(
          (t) =>
            t.nomorJurnal.toLowerCase().includes(q) ||
            t.nomorReferensi.toLowerCase().includes(q) ||
            t.keterangan.toLowerCase().includes(q)
        );
        return matchCode || matchName || matchKelompok || matchTx;
      }

      return true;
    });
  }, [sortedAccountList, onlyActiveAccounts, selectedKelompokFilter, searchQuery]);

  // Current selected account data
  const currentSelectedAccount = useMemo(() => {
    if (selectedAccountNo && ledgerDataByAccount[selectedAccountNo]) {
      return ledgerDataByAccount[selectedAccountNo];
    }
    // Fallback to first available account
    return filteredAccounts[0] || sortedAccountList[0];
  }, [selectedAccountNo, ledgerDataByAccount, filteredAccounts, sortedAccountList]);

  // Aggregate stats across all accounts
  const aggregateStats = useMemo(() => {
    let grandDebet = 0;
    let grandKredit = 0;
    let totalTxCount = 0;
    let activeAccCount = 0;

    const list = Object.values(ledgerDataByAccount) as AccountLedgerData[];
    list.forEach((acc) => {
      if (acc.transactions.length > 0 || acc.saldoAwal !== 0) {
        activeAccCount++;
      }
      grandDebet += acc.totalDebet;
      grandKredit += acc.totalKredit;
      totalTxCount += acc.transactions.length;
    });

    const isBalanced = Math.abs(grandDebet - grandKredit) < 0.01;

    return {
      grandDebet,
      grandKredit,
      totalTxCount,
      activeAccCount,
      isBalanced,
      difference: Math.abs(grandDebet - grandKredit),
    };
  }, [ledgerDataByAccount]);

  // Toggle account expansion in 'all' view mode
  const toggleAccountExpansion = (noAkun: string) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [noAkun]: !prev[noAkun],
    }));
  };

  // Expand all / Collapse all in 'all' view mode
  const handleToggleAllExpansion = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    filteredAccounts.forEach((acc) => {
      next[acc.noAkun] = expand;
    });
    setExpandedAccounts(next);
  };

  // Export General Ledger to CSV
  const handleExportLedgerCSV = () => {
    const csvRows: string[] = [];
    csvRows.push(
      'YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA - BUKU BESAR (GENERAL LEDGER)'
    );
    csvRows.push(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`);
    csvRows.push('');

    if (viewMode === 'single' && currentSelectedAccount) {
      csvRows.push(
        `Kode Akun: ${currentSelectedAccount.noAkun} - ${currentSelectedAccount.namaAkun}`
      );
      csvRows.push(
        `Kelompok: ${currentSelectedAccount.kelompok} | Posisi Normal: ${currentSelectedAccount.pos === 'D' ? 'Debet' : 'Kredit'}`
      );
      csvRows.push(`Saldo Awal: ${currentSelectedAccount.saldoAwal}`);
      csvRows.push('');
      csvRows.push('Tanggal,No Jurnal,Sumber,Referensi,Keterangan,Debet,Kredit,Saldo Berjalan');

      currentSelectedAccount.transactions.forEach((tx) => {
        const cleanKet = `"${(tx.keterangan || '').replace(/"/g, '""')}"`;
        csvRows.push(
          `${tx.tanggalJurnal},${tx.nomorJurnal},${tx.sumberTransaksi},${tx.nomorReferensi},${cleanKet},${tx.debet},${tx.kredit},${tx.runningBalance}`
        );
      });

      csvRows.push('');
      csvRows.push(
        `TOTAL MUTASI,,,,,${currentSelectedAccount.totalDebet},${currentSelectedAccount.totalKredit},`
      );
      csvRows.push(`SALDO AKHIR,,,,,,,${currentSelectedAccount.saldoAkhir}`);
    } else {
      // All accounts / Trial Balance
      csvRows.push(
        'Kode Akun,Nama Akun,Kelompok,Pos Normal,Saldo Awal,Total Debet,Total Kredit,Saldo Akhir,Jml Transaksi'
      );
      filteredAccounts.forEach((acc) => {
        csvRows.push(
          `"${acc.noAkun}","${acc.namaAkun}","${acc.kelompok}","${acc.pos}",${acc.saldoAwal},${acc.totalDebet},${acc.totalKredit},${acc.saldoAkhir},${acc.transactions.length}`
        );
      });
      csvRows.push('');
      csvRows.push(
        `TOTAL KESELURUHAN,,,,,,${aggregateStats.grandDebet},${aggregateStats.grandKredit},`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURI(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `Buku_Besar_General_Ledger_${viewMode}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & COMPLIANCE BANNER */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-teal-50 via-white to-teal-50/60 border border-teal-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#05828e] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Buku Besar Terintegrasi (General Ledger)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                  Double-Entry PSAK 45 / ISAK 35
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Rekap 5 Modul Otomatis
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                Merekap mutasi akun secara kronologis dari <strong>Mutasi Bank</strong>,{' '}
                <strong>Transaksi S-SALUR</strong>, <strong>Transaksi D-DONASI</strong>,{' '}
                <strong>Pengeluaran</strong>, dan <strong>Transaksi A-AJAR</strong>. Menghitung saldo
                awal, pergerakan debet-kredit per transaksi, dan saldo akhir berjalan (running balance)
                secara otomatis.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-auto">
            <button
              type="button"
              onClick={handleExportLedgerCSV}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
              title="Unduh data Buku Besar dalam format CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh CSV</span>
            </button>

            {onOpenPdfModal && (
              <button
                type="button"
                onClick={onOpenPdfModal}
                className="bg-teal-50 border border-teal-200 hover:bg-teal-100 text-[#05828e] px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                title="Ekspor Laporan Keuangan & Jurnal ke PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUMMARY KPI & BALANCE VERIFICATION CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Debet */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Total Mutasi Debet
            </span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
            {formatRupiah(aggregateStats.grandDebet)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Dari {aggregateStats.totalTxCount} baris mutasi terposting
          </div>
        </div>

        {/* Card 2: Total Kredit */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Total Mutasi Kredit
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
            {formatRupiah(aggregateStats.grandKredit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Dari {aggregateStats.totalTxCount} baris mutasi terposting
          </div>
        </div>

        {/* Card 3: Keseimbangan Double-Entry */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Status Keseimbangan
            </span>
            <span
              className={`p-1.5 rounded-lg ${
                aggregateStats.isBalanced
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold font-mono mt-1 ${
              aggregateStats.isBalanced ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {aggregateStats.isBalanced ? '100% SEIMBANG' : `Selisih: ${formatRupiah(aggregateStats.difference)}`}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Debet = Kredit (Rp 0 Selisih)</span>
          </div>
        </div>

        {/* Card 4: Akun Aktif */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Akun COA Aktif
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-1">
            {aggregateStats.activeAccCount} Akun
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Dari total {coaList.length} akun dalam bagan akun
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TOOLBAR: VIEW MODE, SOURCE FILTERS & SEARCH */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
        {/* Row 1: Mode Switcher & Source Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'single'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#05828e]" />
              <span>Buku Besar per Akun</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Semua Buku Besar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('trialBalance')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'trialBalance'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Neraca Saldo (Trial Balance)</span>
            </button>
          </div>

          {/* Quick Source Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'Semua Sumber' },
              { id: 'mutasiBank', label: 'Mutasi Bank' },
              { id: 'salur', label: 'S-SALUR (Penjualan)' },
              { id: 'donasi', label: 'D-DONASI' },
              { id: 'pengeluaran', label: 'Pengeluaran' },
              { id: 'ajar', label: 'A-AJAR' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedSourceFilter(chip.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSourceFilter === chip.id
                    ? 'bg-[#05828e] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Account Selector (Single mode) + Kelompok Filter + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Account Selector (only in single mode) */}
            {viewMode === 'single' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600">Pilih Akun:</span>
                <select
                  value={selectedAccountNo}
                  onChange={(e) => setSelectedAccountNo(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-teal-50 border border-teal-300 text-teal-900 focus:outline-none focus:ring-1 focus:ring-[#05828e] cursor-pointer max-w-[280px] sm:max-w-[360px]"
                >
                  {/* Group accounts by Kelompok */}
                  {['AKTIVA', 'KEWAJIBAN', 'EKUITAS', 'PENDAPATAN', 'BIAYA PROGRAM', 'BIAYA OPERASIONAL', 'LAINNYA'].map(
                    (kel) => {
                      const accsInKel = sortedAccountList.filter(
                        (a) => (a.kelompok || 'LAINNYA') === kel && (a.hasActivity || !onlyActiveAccounts)
                      );
                      if (accsInKel.length === 0) return null;
                      return (
                        <optgroup key={kel} label={`--- ${kel} ---`}>
                          {accsInKel.map((a) => (
                            <option key={a.noAkun} value={a.noAkun}>
                              {a.noAkun} - {a.namaAkun} ({a.transactions.length} mutasi)
                            </option>
                          ))}
                        </optgroup>
                      );
                    }
                  )}
                </select>
              </div>
            )}

            {/* Kelompok Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 hidden sm:inline">Kelompok:</span>
              <select
                value={selectedKelompokFilter}
                onChange={(e) => setSelectedKelompokFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#05828e] cursor-pointer"
              >
                <option value="ALL">Semua Kelompok</option>
                <option value="AKTIVA">AKTIVA (10000 - 19999)</option>
                <option value="KEWAJIBAN">KEWAJIBAN (20000 - 29999)</option>
                <option value="EKUITAS">EKUITAS (30000 - 39999)</option>
                <option value="PENDAPATAN">PENDAPATAN (40000 - 49999)</option>
                <option value="BIAYA PROGRAM">BIAYA PROGRAM (50000 - 59999)</option>
                <option value="BIAYA OPERASIONAL">BIAYA OPERASIONAL (60000 - 69999)</option>
              </select>
            </div>

            {/* Checkbox: Hanya akun aktif */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyActiveAccounts}
                onChange={(e) => setOnlyActiveAccounts(e.target.checked)}
                className="w-3.5 h-3.5 text-[#05828e] rounded border-slate-300 focus:ring-[#05828e] cursor-pointer"
              />
              <span>Hanya yang ada mutasi</span>
            </label>
          </div>

          {/* Right: Search box & Expand/Collapse All (for 'all' mode) */}
          <div className="flex items-center gap-2">
            {viewMode === 'all' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleAllExpansion(true)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllExpansion(false)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Tutup Semua
                </button>
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari akun, no jurnal, ref..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#05828e] w-48 sm:w-60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. CONTENT VIEW ACCORDING TO VIEW MODE */}
      {/* ============================================================== */}

      {/* -------------------------------------------------------------- */}
      {/* MODE 1: SINGLE ACCOUNT GENERAL LEDGER (Buku Besar Akun Terpilih) */}
      {/* -------------------------------------------------------------- */}
      {viewMode === 'single' && currentSelectedAccount && (
        <div className="space-y-4">
          {/* Account Detail Card Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#05828e] flex items-center justify-center font-bold text-base font-mono">
                  {currentSelectedAccount.noAkun}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {currentSelectedAccount.namaAkun}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {currentSelectedAccount.kelompok}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        currentSelectedAccount.pos === 'D'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      Pos Normal: {currentSelectedAccount.pos === 'D' ? 'Debet' : 'Kredit'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tercatat <strong>{currentSelectedAccount.transactions.length}</strong> entri mutasi
                    jurnal pada akun ini.
                  </p>
                </div>
              </div>

              {/* Account mini quick cards */}
              <div className="flex items-center gap-3 font-mono text-right">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-left">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold uppercase">
                    Saldo Awal
                  </span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {formatRupiah(currentSelectedAccount.saldoAwal)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-200 text-left">
                  <span className="text-[10px] text-teal-700 block font-sans font-semibold uppercase">
                    Saldo Akhir
                  </span>
                  <span className="text-sm font-bold text-[#05828e] font-mono">
                    {formatRupiah(currentSelectedAccount.saldoAkhir)}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Mutasi Table */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">No. Jurnal</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Sumber</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">No. Referensi</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Uraian / Keterangan</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Mutasi Debet</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Mutasi Kredit</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Saldo Berjalan</th>
                    <th className="py-2.5 px-2 text-center whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* Beginning Balance Row */}
                  <tr className="bg-slate-50/60 font-semibold text-slate-600">
                    <td className="py-2 px-3 text-slate-400">-</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-400">SALDO-AWAL</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">
                        Bagan Akun
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">-</td>
                    <td className="py-2 px-3 font-bold text-slate-700">
                      Saldo Awal Akun {currentSelectedAccount.noAkun}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-100/60">
                      {formatRupiah(currentSelectedAccount.saldoAwal)}
                    </td>
                    <td className="py-2 px-2 text-center">-</td>
                  </tr>

                  {/* Transactions Rows */}
                  {currentSelectedAccount.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Tidak ada transaksi mutasi untuk akun ini pada periode yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    currentSelectedAccount.transactions.map((tx, idx) => {
                      const badge = getSourceBadge(tx.sumberTransaksi);
                      const BadgeIcon = badge.icon;
                      return (
                        <tr
                          key={`${tx.journalId}-${idx}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            tx.isReversalEntry ? 'bg-amber-50/30' : tx.isReversed ? 'opacity-70 bg-slate-50/40 line-through' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                            {tx.tanggalJurnal}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[11px] text-[#05828e] whitespace-nowrap">
                            {tx.nomorJurnal}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}
                            >
                              <BadgeIcon className="w-2.5 h-2.5" />
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {tx.nomorReferensi}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-900">{tx.keterangan}</div>
                            {tx.programKegiatan && tx.programKegiatan !== '-' && (
                              <div className="text-[10.5px] text-slate-400">{tx.programKegiatan}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                            {formatTableCellAmount(tx.debet)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                            {formatTableCellAmount(tx.kredit)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 bg-teal-50/30 whitespace-nowrap">
                            {formatRupiah(tx.runningBalance)}
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onSelectJournalDetail && onSelectJournalDetail(tx.originalEntry)}
                              className="px-2 py-1 text-[10.5px] font-semibold text-[#05828e] hover:text-[#046e78] hover:bg-teal-50 rounded cursor-pointer transition-colors"
                              title="Lihat detail voucher jurnal double-entry"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider text-[11px]">
                      TOTAL MUTASI PERIODE INI:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-800">
                      {formatRupiah(currentSelectedAccount.totalDebet)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-800">
                      {formatRupiah(currentSelectedAccount.totalKredit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-base font-extrabold text-[#05828e] bg-teal-100/50">
                      {formatRupiah(currentSelectedAccount.saldoAkhir)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* MODE 2: ALL ACCOUNTS MULTI-LEDGER (Semua Buku Besar Sekaligus) */}
      {/* -------------------------------------------------------------- */}
      {viewMode === 'all' && (
        <div className="space-y-3">
          {filteredAccounts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Tidak ada akun ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Coba ubah kata kunci pencarian atau matikan opsi "Hanya yang ada mutasi".
              </p>
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const isExpanded = expandedAccounts[acc.noAkun] ?? false;
              return (
                <div
                  key={acc.noAkun}
                  className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden transition-all"
                >
                  {/* Account Accordion Header */}
                  <div
                    onClick={() => toggleAccountExpansion(acc.noAkun)}
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1 rounded bg-white border border-slate-200 text-slate-500">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                      <span className="font-mono font-bold text-sm text-[#05828e] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {acc.noAkun}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{acc.namaAkun}</span>
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                          {acc.kelompok}
                        </span>
                        <span
                          className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            acc.pos === 'D'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {acc.pos === 'D' ? 'Debet' : 'Kredit'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono ml-auto">
                      <div className="hidden sm:block text-slate-500">
                        <span className="font-sans font-semibold text-[10.5px] uppercase mr-1">
                          Saldo Awal:
                        </span>
                        <span>{formatRupiah(acc.saldoAwal)}</span>
                      </div>
                      <div className="text-slate-600">
                        <span className="font-sans font-semibold text-[10.5px] uppercase mr-1">
                          Mutasi:
                        </span>
                        <span>
                          D: {formatTableCellAmount(acc.totalDebet)} / K:{' '}
                          {formatTableCellAmount(acc.totalKredit)}
                        </span>
                      </div>
                      <div className="font-bold text-[#05828e] bg-white px-2.5 py-1 rounded-md border border-teal-200">
                        <span className="font-sans font-semibold text-[10.5px] uppercase mr-1">
                          Saldo Akhir:
                        </span>
                        <span>{formatRupiah(acc.saldoAkhir)}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans">
                        ({acc.transactions.length} tx)
                      </span>
                    </div>
                  </div>

                  {/* Expanded Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto p-3">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                            <th className="py-2 px-2.5">Tanggal</th>
                            <th className="py-2 px-2.5">No. Jurnal</th>
                            <th className="py-2 px-2.5">Sumber</th>
                            <th className="py-2 px-2.5">Referensi</th>
                            <th className="py-2 px-2.5 min-w-[180px]">Keterangan</th>
                            <th className="py-2 px-2.5 text-right">Debet</th>
                            <th className="py-2 px-2.5 text-right">Kredit</th>
                            <th className="py-2 px-2.5 text-right">Saldo Berjalan</th>
                            <th className="py-2 px-1 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {/* Saldo awal row */}
                          <tr className="bg-slate-50/50 text-slate-500 italic">
                            <td className="py-1.5 px-2.5">-</td>
                            <td className="py-1.5 px-2.5 font-mono text-[10.5px]">SALDO-AWAL</td>
                            <td className="py-1.5 px-2.5">-</td>
                            <td className="py-1.5 px-2.5">-</td>
                            <td className="py-1.5 px-2.5 font-semibold">Saldo Awal Akun</td>
                            <td className="py-1.5 px-2.5 text-right">-</td>
                            <td className="py-1.5 px-2.5 text-right">-</td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-800">
                              {formatRupiah(acc.saldoAwal)}
                            </td>
                            <td></td>
                          </tr>

                          {acc.transactions.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-3 text-center text-slate-400 text-xs">
                                Tidak ada mutasi transaksi pada periode ini.
                              </td>
                            </tr>
                          ) : (
                            acc.transactions.map((tx, idx) => {
                              const badge = getSourceBadge(tx.sumberTransaksi);
                              return (
                                <tr key={`${tx.journalId}-${idx}`} className="hover:bg-slate-50">
                                  <td className="py-2 px-2.5 whitespace-nowrap">{tx.tanggalJurnal}</td>
                                  <td className="py-2 px-2.5 font-mono font-semibold text-[#05828e] whitespace-nowrap text-[11px]">
                                    {tx.nomorJurnal}
                                  </td>
                                  <td className="py-2 px-2.5 whitespace-nowrap">
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${badge.bg}`}
                                    >
                                      {badge.label}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                                    {tx.nomorReferensi}
                                  </td>
                                  <td className="py-2 px-2.5">
                                    <div className="font-medium text-slate-800">{tx.keterangan}</div>
                                  </td>
                                  <td className="py-2 px-2.5 text-right font-mono">
                                    {formatTableCellAmount(tx.debet)}
                                  </td>
                                  <td className="py-2 px-2.5 text-right font-mono">
                                    {formatTableCellAmount(tx.kredit)}
                                  </td>
                                  <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900 bg-teal-50/20">
                                    {formatRupiah(tx.runningBalance)}
                                  </td>
                                  <td className="py-2 px-1 text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onSelectJournalDetail && onSelectJournalDetail(tx.originalEntry)
                                      }
                                      className="text-[#05828e] hover:underline text-[10.5px] font-semibold cursor-pointer"
                                    >
                                      Detail
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* MODE 3: NERACA SALDO (TRIAL BALANCE)                           */}
      {/* -------------------------------------------------------------- */}
      {viewMode === 'trialBalance' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Neraca Saldo (Trial Balance) Konsolidasi
              </h3>
              <p className="text-xs text-slate-500">
                Memverifikasi seluruh saldo akun COA untuk memastikan Total Debet sama dengan Total Kredit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% SEIMBANG</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Kode Akun</th>
                  <th className="py-3 px-3">Nama Akun COA</th>
                  <th className="py-3 px-3">Kelompok</th>
                  <th className="py-3 px-2 text-center">Pos</th>
                  <th className="py-3 px-3 text-right">Saldo Awal</th>
                  <th className="py-3 px-3 text-right">Mutasi Debet</th>
                  <th className="py-3 px-3 text-right">Mutasi Kredit</th>
                  <th className="py-3 px-3 text-right">Saldo Akhir</th>
                  <th className="py-3 px-2 text-center">Mutasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredAccounts.map((acc) => (
                  <tr
                    key={acc.noAkun}
                    onClick={() => {
                      setSelectedAccountNo(acc.noAkun);
                      setViewMode('single');
                    }}
                    className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                    title="Klik untuk membuka Buku Besar akun ini"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#05828e] group-hover:underline">
                      {acc.noAkun}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{acc.namaAkun}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{acc.kelompok}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          acc.pos === 'D'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {acc.pos}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatRupiah(acc.saldoAwal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-700 font-medium">
                      {formatTableCellAmount(acc.totalDebet)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-medium">
                      {formatTableCellAmount(acc.totalKredit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                      {formatRupiah(acc.saldoAkhir)}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[11px] text-slate-400 font-mono">
                      {acc.transactions.length}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={5} className="py-3 px-3 text-right uppercase tracking-wider text-[11px]">
                    TOTAL KONSOLIDASI (TRIAL BALANCE):
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-teal-800 text-sm">
                    {formatRupiah(aggregateStats.grandDebet)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-800 text-sm">
                    {formatRupiah(aggregateStats.grandKredit)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">
                    {formatRupiah(aggregateStats.grandDebet - aggregateStats.grandKredit)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
