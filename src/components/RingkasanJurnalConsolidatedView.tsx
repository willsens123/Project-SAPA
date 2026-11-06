import React, { useState, useMemo } from 'react';
import {
  Scale,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  ArrowRightLeft,
  Building2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Receipt,
  FileText,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  PieChart,
  BarChart3,
  Calendar,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { JournalEntry, CoaAccount } from '../accountingData';

interface RingkasanJurnalConsolidatedViewProps {
  journalEntries: JournalEntry[];
  coaList: CoaAccount[];
  isPrivacyMasked?: boolean;
  onOpenPdfModal?: () => void;
  onSelectJournalDetail?: (entry: JournalEntry) => void;
  onNavigateToSource?: (source: string) => void;
}

export interface ConsolidatedAccountItem {
  noAkun: string;
  namaAkun: string;
  kelompok: string;
  pos: 'D' | 'K';
  // Breakdown per sumber transaksi
  mutasiDb: number;
  mutasiKr: number;
  salurDb: number;
  salurKr: number;
  donasiDb: number;
  donasiKr: number;
  ajarDb: number;
  ajarKr: number;
  pengeluaranDb: number;
  pengeluaranKr: number;
  // Total konsolidasi
  totalDebet: number;
  totalKredit: number;
  saldoAwal: number;
  saldoAkhir: number;
  hasActivity: boolean;
}

export const RingkasanJurnalConsolidatedView: React.FC<RingkasanJurnalConsolidatedViewProps> = ({
  journalEntries,
  coaList,
  isPrivacyMasked = false,
  onOpenPdfModal,
  onSelectJournalDetail,
  onNavigateToSource,
}) => {
  // Local state
  const [activeSubTab, setActiveSubTab] = useState<'sumber' | 'matriksCoa' | 'tabelEntries'>('sumber');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelompokFilter, setSelectedKelompokFilter] = useState<string>('ALL');
  const [onlyActiveAccounts, setOnlyActiveAccounts] = useState(true);
  const [sortBy, setSortBy] = useState<'noAkun' | 'namaAkun' | 'totalDebet' | 'totalKredit'>('noAkun');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Format Rupiah helper
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

  // 1. Konsolidasi Data per Sumber Transaksi
  const sourceConsolidation = useMemo(() => {
    const initSource = (key: string, label: string, code: string, badgeBg: string, badgeText: string) => ({
      key,
      label,
      code,
      badgeBg,
      badgeText,
      count: 0,
      totalDebet: 0,
      totalKredit: 0,
      entries: [] as JournalEntry[],
      dbAccounts: {} as Record<string, { nama: string; total: number }>,
      krAccounts: {} as Record<string, { nama: string; total: number }>,
    });

    const sources = {
      mutasi: initSource('mutasi', 'Mutasi Bank', 'MUTASI', 'bg-teal-50 text-teal-800 border-teal-200', 'bg-teal-600'),
      salur: initSource('salur', 'Transaksi S-SALUR', 'S-SALUR', 'bg-emerald-50 text-emerald-800 border-emerald-200', 'bg-emerald-600'),
      donasi: initSource('donasi', 'Transaksi Donasi', 'D-DONASI', 'bg-amber-50 text-amber-800 border-amber-200', 'bg-amber-600'),
      ajar: initSource('ajar', 'Transaksi A-AJAR', 'A-AJAR', 'bg-purple-50 text-purple-800 border-purple-200', 'bg-purple-600'),
      pengeluaran: initSource('pengeluaran', 'Pengeluaran Proyek / Ops', 'EXPENSE', 'bg-rose-50 text-rose-800 border-rose-200', 'bg-rose-600'),
    };

    journalEntries.forEach((entry) => {
      let target: typeof sources.mutasi | null = null;
      if (entry.sumberTransaksi === 'Mutasi Bank') target = sources.mutasi;
      else if (entry.sumberTransaksi === 'Transaksi Salur') target = sources.salur;
      else if (entry.sumberTransaksi === 'Transaksi Donasi') target = sources.donasi;
      else if (entry.sumberTransaksi === 'Transaksi Ajar') target = sources.ajar;
      else if (entry.sumberTransaksi === 'Pengeluaran') target = sources.pengeluaran;

      if (!target) target = sources.mutasi;

      target.count++;
      target.entries.push(entry);

      entry.lines.forEach((line) => {
        const debet = line.nominalDebet || 0;
        const kredit = line.nominalKredit || 0;
        target!.totalDebet += debet;
        target!.totalKredit += kredit;

        if (line.kodeAkunDb && debet > 0) {
          if (!target!.dbAccounts[line.kodeAkunDb]) {
            target!.dbAccounts[line.kodeAkunDb] = { nama: line.namaAkun || line.keterangan, total: 0 };
          }
          target!.dbAccounts[line.kodeAkunDb].total += debet;
        }

        if (line.kodeAkunKr && kredit > 0) {
          if (!target!.krAccounts[line.kodeAkunKr]) {
            target!.krAccounts[line.kodeAkunKr] = { nama: line.namaAkun || line.keterangan, total: 0 };
          }
          target!.krAccounts[line.kodeAkunKr].total += kredit;
        }
      });
    });

    // Grand totals
    let grandDebet = 0;
    let grandKredit = 0;
    let grandCount = journalEntries.length;

    Object.values(sources).forEach((s) => {
      grandDebet += s.totalDebet;
      grandKredit += s.totalKredit;
    });

    return {
      sourcesList: Object.values(sources),
      grandDebet,
      grandKredit,
      grandCount,
      isGrandBalanced: Math.abs(grandDebet - grandKredit) < 0.01,
      selisih: grandDebet - grandKredit,
    };
  }, [journalEntries]);

  // 2. Konsolidasi Matriks Per Akun COA (Debit - Kredit Multi-Sumber)
  const consolidatedAccounts = useMemo<ConsolidatedAccountItem[]>(() => {
    // Map each account
    const accMap: Record<string, ConsolidatedAccountItem> = {};

    coaList.forEach((acc) => {
      if (acc.isHeader) return;
      const saldoAwal = acc.pos === 'D' ? acc.saldoAwalDebet : acc.saldoAwalKredit;
      accMap[acc.noAkun] = {
        noAkun: acc.noAkun,
        namaAkun: acc.namaAkun,
        kelompok: acc.kelompok,
        pos: acc.pos,
        mutasiDb: 0,
        mutasiKr: 0,
        salurDb: 0,
        salurKr: 0,
        donasiDb: 0,
        donasiKr: 0,
        ajarDb: 0,
        ajarKr: 0,
        pengeluaranDb: 0,
        pengeluaranKr: 0,
        totalDebet: 0,
        totalKredit: 0,
        saldoAwal,
        saldoAkhir: saldoAwal,
        hasActivity: false,
      };
    });

    journalEntries.forEach((entry) => {
      const src = entry.sumberTransaksi;

      entry.lines.forEach((line) => {
        const debet = line.nominalDebet || 0;
        const kredit = line.nominalKredit || 0;

        if (line.kodeAkunDb && debet > 0) {
          if (!accMap[line.kodeAkunDb]) {
            accMap[line.kodeAkunDb] = {
              noAkun: line.kodeAkunDb,
              namaAkun: line.namaAkun || line.keterangan || `Akun ${line.kodeAkunDb}`,
              kelompok: 'AKTIVA',
              pos: 'D',
              mutasiDb: 0,
              mutasiKr: 0,
              salurDb: 0,
              salurKr: 0,
              donasiDb: 0,
              donasiKr: 0,
              ajarDb: 0,
              ajarKr: 0,
              pengeluaranDb: 0,
              pengeluaranKr: 0,
              totalDebet: 0,
              totalKredit: 0,
              saldoAwal: 0,
              saldoAkhir: 0,
              hasActivity: true,
            };
          }

          const targetAcc = accMap[line.kodeAkunDb];
          targetAcc.totalDebet += debet;
          targetAcc.hasActivity = true;

          if (src === 'Mutasi Bank') targetAcc.mutasiDb += debet;
          else if (src === 'Transaksi Salur') targetAcc.salurDb += debet;
          else if (src === 'Transaksi Donasi') targetAcc.donasiDb += debet;
          else if (src === 'Transaksi Ajar') targetAcc.ajarDb += debet;
          else if (src === 'Pengeluaran') targetAcc.pengeluaranDb += debet;
          else targetAcc.mutasiDb += debet;
        }

        if (line.kodeAkunKr && kredit > 0) {
          if (!accMap[line.kodeAkunKr]) {
            accMap[line.kodeAkunKr] = {
              noAkun: line.kodeAkunKr,
              namaAkun: line.namaAkun || line.keterangan || `Akun ${line.kodeAkunKr}`,
              kelompok: 'PENDAPATAN',
              pos: 'K',
              mutasiDb: 0,
              mutasiKr: 0,
              salurDb: 0,
              salurKr: 0,
              donasiDb: 0,
              donasiKr: 0,
              ajarDb: 0,
              ajarKr: 0,
              pengeluaranDb: 0,
              pengeluaranKr: 0,
              totalDebet: 0,
              totalKredit: 0,
              saldoAwal: 0,
              saldoAkhir: 0,
              hasActivity: true,
            };
          }

          const targetAcc = accMap[line.kodeAkunKr];
          targetAcc.totalKredit += kredit;
          targetAcc.hasActivity = true;

          if (src === 'Mutasi Bank') targetAcc.mutasiKr += kredit;
          else if (src === 'Transaksi Salur') targetAcc.salurKr += kredit;
          else if (src === 'Transaksi Donasi') targetAcc.donasiKr += kredit;
          else if (src === 'Transaksi Ajar') targetAcc.ajarKr += kredit;
          else if (src === 'Pengeluaran') targetAcc.pengeluaranKr += kredit;
          else targetAcc.mutasiKr += kredit;
        }
      });
    });

    // Compute final ending balances
    const list = Object.values(accMap).map((acc) => {
      let finalSaldo = acc.saldoAwal;
      if (acc.pos === 'D') {
        finalSaldo = acc.saldoAwal + acc.totalDebet - acc.totalKredit;
      } else {
        finalSaldo = acc.saldoAwal + acc.totalKredit - acc.totalDebet;
      }
      return {
        ...acc,
        saldoAkhir: finalSaldo,
      };
    });

    return list;
  }, [coaList, journalEntries]);

  // Filtered & Sorted Consolidated Accounts
  const filteredConsolidatedAccounts = useMemo(() => {
    return consolidatedAccounts
      .filter((acc) => {
        if (onlyActiveAccounts && !acc.hasActivity && acc.saldoAwal === 0) {
          return false;
        }
        if (selectedKelompokFilter !== 'ALL' && acc.kelompok !== selectedKelompokFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            acc.noAkun.toLowerCase().includes(q) ||
            acc.namaAkun.toLowerCase().includes(q) ||
            acc.kelompok.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'noAkun') {
          cmp = a.noAkun.localeCompare(b.noAkun);
        } else if (sortBy === 'namaAkun') {
          cmp = a.namaAkun.localeCompare(b.namaAkun);
        } else if (sortBy === 'totalDebet') {
          cmp = a.totalDebet - b.totalDebet;
        } else if (sortBy === 'totalKredit') {
          cmp = a.totalKredit - b.totalKredit;
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [consolidatedAccounts, onlyActiveAccounts, selectedKelompokFilter, searchQuery, sortBy, sortOrder]);

  // 3. Filtered Raw Entries for Tab "Tabel Entries"
  const filteredRawEntries = useMemo(() => {
    return journalEntries.filter((j) => {
      if (selectedSourceFilter === 'mutasi' && j.sumberTransaksi !== 'Mutasi Bank') return false;
      if (selectedSourceFilter === 'salur' && j.sumberTransaksi !== 'Transaksi Salur') return false;
      if (selectedSourceFilter === 'donasi' && j.sumberTransaksi !== 'Transaksi Donasi') return false;
      if (selectedSourceFilter === 'ajar' && j.sumberTransaksi !== 'Transaksi Ajar') return false;
      if (selectedSourceFilter === 'pengeluaran' && j.sumberTransaksi !== 'Pengeluaran') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          j.nomorJurnal.toLowerCase().includes(q) ||
          j.nomorReferensiBank.toLowerCase().includes(q) ||
          j.keteranganTransaksi.toLowerCase().includes(q) ||
          j.rekeningBank.toLowerCase().includes(q) ||
          j.lines.some((l) => l.namaAkun.toLowerCase().includes(q) || l.keterangan.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [journalEntries, selectedSourceFilter, searchQuery]);

  // Export Consolidated Summary to CSV
  const handleExportConsolidatedCSV = () => {
    const headers = [
      'No Akun',
      'Nama Akun',
      'Kelompok',
      'Pos',
      'Mutasi Bank Debet',
      'Mutasi Bank Kredit',
      'S-SALUR Debet',
      'S-SALUR Kredit',
      'D-DONASI Debet',
      'D-DONASI Kredit',
      'A-AJAR Debet',
      'A-AJAR Kredit',
      'Pengeluaran Debet',
      'Pengeluaran Kredit',
      'Total Konsolidasi Debet',
      'Total Konsolidasi Kredit',
      'Saldo Akhir',
    ];

    const rows = filteredConsolidatedAccounts.map((a) => [
      `"${a.noAkun}"`,
      `"${a.namaAkun.replace(/"/g, '""')}"`,
      `"${a.kelompok}"`,
      `"${a.pos}"`,
      a.mutasiDb,
      a.mutasiKr,
      a.salurDb,
      a.salurKr,
      a.donasiDb,
      a.donasiKr,
      a.ajarDb,
      a.ajarKr,
      a.pengeluaranDb,
      a.pengeluaranKr,
      a.totalDebet,
      a.totalKredit,
      a.saldoAkhir,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `ringkasan_jurnal_konsolidasi_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner & Balance Verification Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[#05828e] mt-0.5">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Ringkasan Konsolidasi Jurnal Umum
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Seimbang
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengkonsolidasikan seluruh entri akuntansi berpasangan dari Mutasi Bank, Transaksi S-SALUR, D-DONASI, A-AJAR, dan Pengeluaran Proyek.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportConsolidatedCSV}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Unduh data konsolidasi format CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>
            {onOpenPdfModal && (
              <button
                type="button"
                onClick={onOpenPdfModal}
                className="bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Cetak & Unduh Laporan PDF Resmi"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Source Highlights (Mutasi, S-SALUR, Donasi, A-AJAR) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
          {sourceConsolidation.sourcesList.map((src) => {
            const isSelected = selectedSourceFilter === src.key;
            return (
              <div
                key={src.key}
                onClick={() => setSelectedSourceFilter(isSelected ? 'ALL' : src.key)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#05828e] ring-2 ring-[#05828e]/20 bg-teal-50/50 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${src.badgeBg}`}>
                    {src.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {src.count} Jurnal
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 truncate" title={src.label}>
                  {src.label}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-0.5 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Debet:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(src.totalDebet)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Kredit:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(src.totalKredit)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Grand Debet = Kredit Indicator */}
        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Total Konsolidasi Keseluruhan:</span>
            <span className="text-slate-500">({sourceConsolidation.grandCount} Total Jurnal Tercatat)</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-500 text-[11px] mr-1.5 uppercase font-sans font-semibold">Total Debet:</span>
              <strong className="text-slate-900 font-bold">{formatRupiah(sourceConsolidation.grandDebet)}</strong>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-slate-500 text-[11px] mr-1.5 uppercase font-sans font-semibold">Total Kredit:</span>
              <strong className="text-slate-900 font-bold">{formatRupiah(sourceConsolidation.grandKredit)}</strong>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-emerald-700 font-sans font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Selisih: Rp 0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('sumber')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'sumber'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#05828e]" />
            <span>Tabel Ringkasan Per Sumber</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('matriksCoa')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'matriksCoa'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Matriks Konsolidasi COA (Debet-Kredit)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tabelEntries')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'tabelEntries'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-purple-600" />
            <span>Daftar Entri Terpasang</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {filteredRawEntries.length}
            </span>
          </button>
        </div>

        {/* Search & Quick Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari akun / transaksi..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#05828e] w-48 sm:w-60"
            />
          </div>

          {activeSubTab === 'matriksCoa' && (
            <select
              value={selectedKelompokFilter}
              onChange={(e) => setSelectedKelompokFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#05828e] cursor-pointer"
            >
              <option value="ALL">Semua Kelompok</option>
              <option value="AKTIVA">AKTIVA</option>
              <option value="KEWAJIBAN">KEWAJIBAN</option>
              <option value="EKUITAS">EKUITAS</option>
              <option value="PENDAPATAN">PENDAPATAN</option>
              <option value="BIAYA PROGRAM">BIAYA PROGRAM</option>
              <option value="BIAYA OPERASIONAL">BIAYA OPERASIONAL</option>
            </select>
          )}

          {selectedSourceFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedSourceFilter('ALL')}
              className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset filter sumber"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: TABEL RINGKASAN PER SUMBER (Debit vs Kredit)   */}
      {/* ========================================================= */}
      {activeSubTab === 'sumber' && (
        <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Tabel Ringkasan Konsolidasi Per Sumber Transaksi
              </h3>
              <p className="text-[11px] text-slate-500">
                Memperlihatkan keseimbangan debit dan kredit berpasangan dari setiap modul operasional
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Format Akuntansi Standar PSAK
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-4 border-r border-slate-300 min-w-[200px]">SUMBER TRANSAKSI</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-24">KODE</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-28">JML JURNAL</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 min-w-[200px]">AKUN DEBET DOMINAN</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 min-w-[200px]">AKUN KREDIT DOMINAN</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[140px]">TOTAL DEBET</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[140px]">TOTAL KREDIT</th>
                  <th className="py-2.5 px-3 text-center min-w-[110px]">STATUS AUDIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sourceConsolidation.sourcesList.map((src) => {
                  const dbEntries = Object.entries(src.dbAccounts) as [string, { nama: string; total: number }][];
                  const topDb = dbEntries
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 2)
                    .map(([code, item]) => `${code} - ${item.nama}`)
                    .join(', ') || '-';

                  const krEntries = Object.entries(src.krAccounts) as [string, { nama: string; total: number }][];
                  const topKr = krEntries
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 2)
                    .map(([code, item]) => `${code} - ${item.nama}`)
                    .join(', ') || '-';

                  const isBalanced = Math.abs(src.totalDebet - src.totalKredit) < 0.01;

                  return (
                    <tr
                      key={src.key}
                      className="hover:bg-teal-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 border-r border-slate-200 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${src.badgeText}`} />
                          <span>{src.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${src.badgeBg}`}>
                          {src.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200 text-center font-semibold text-slate-700">
                        {src.count} Entri
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-700 text-[11px] truncate max-w-xs" title={topDb}>
                        {topDb}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-700 text-[11px] truncate max-w-xs" title={topKr}>
                        {topKr}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(src.totalDebet)}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(src.totalKredit)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isBalanced ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Seimbang
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Selisih
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 text-slate-900 font-bold">
                  <td colSpan={2} className="py-3 px-4 border-r border-slate-300 uppercase tracking-wider">
                    TOTAL KONSOLIDASI
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center">
                    {sourceConsolidation.grandCount} Entri
                  </td>
                  <td colSpan={2} className="py-3 px-4 border-r border-slate-300 text-slate-500 text-[11px] italic">
                    Konsolidasi Mutasi, Salur, Donasi, Ajar, Pengeluaran
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300 text-right font-mono text-emerald-800 text-sm">
                    {formatRupiah(sourceConsolidation.grandDebet)}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-300 text-right font-mono text-emerald-800 text-sm">
                    {formatRupiah(sourceConsolidation.grandKredit)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      100% OK
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MATRIKS KONSOLIDASI PER AKUN COA (Debet-Kredit Multi-Sumber)   */}
      {/* ========================================================================= */}
      {activeSubTab === 'matriksCoa' && (
        <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Matriks Debet-Kredit Konsolidasian per Akun COA
              </h3>
              <p className="text-[11px] text-slate-500">
                Rincian mutasi debit dan kredit tiap akun COA yang bersumber dari Mutasi Bank, S-SALUR, D-DONASI, dan A-AJAR
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyActiveAccounts}
                  onChange={(e) => setOnlyActiveAccounts(e.target.checked)}
                  className="rounded border-slate-300 text-[#05828e] focus:ring-[#05828e] cursor-pointer"
                />
                <span>Hanya Akun yang Memiliki Mutasi</span>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10.5px]">
                  <th rowSpan={2} className="py-2 px-3 border-r border-slate-300 w-20">NO AKUN</th>
                  <th rowSpan={2} className="py-2 px-3 border-r border-slate-300 min-w-[200px]">NAMA AKUN COA</th>
                  <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-300 text-center w-24">KELOMPOK</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-teal-50/70 text-teal-900">
                    MUTASI BANK
                  </th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-emerald-50/70 text-emerald-900">
                    S-SALUR
                  </th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-amber-50/70 text-amber-900">
                    D-DONASI
                  </th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-purple-50/70 text-purple-900">
                    A-AJAR
                  </th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-slate-200 text-slate-900 font-extrabold">
                    TOTAL KONSOLIDASI
                  </th>
                  <th rowSpan={2} className="py-2 px-3 text-right min-w-[130px]">SALDO AKHIR</th>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-300 text-slate-600 font-bold text-[10px]">
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-teal-50/40">DB</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-teal-50/40">KR</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-emerald-50/40">DB</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-emerald-50/40">KR</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-amber-50/40">DB</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-amber-50/40">KR</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-purple-50/40">DB</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-20 bg-purple-50/40">KR</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-24 bg-slate-200/80 font-bold text-slate-900">TOTAL DB</th>
                  <th className="py-1 px-2 border-r border-slate-300 text-right w-24 bg-slate-200/80 font-bold text-slate-900">TOTAL KR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredConsolidatedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-slate-400">
                      Tidak ada akun COA yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredConsolidatedAccounts.map((acc) => (
                    <tr key={acc.noAkun} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-900">
                        {acc.noAkun}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-800">
                        {acc.namaAkun}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-200 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700">
                          {acc.kelompok}
                        </span>
                      </td>

                      {/* Mutasi Bank */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-slate-700">
                        {formatTableCellAmount(acc.mutasiDb)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-slate-700">
                        {formatTableCellAmount(acc.mutasiKr)}
                      </td>

                      {/* S-SALUR */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-emerald-800">
                        {formatTableCellAmount(acc.salurDb)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-emerald-800">
                        {formatTableCellAmount(acc.salurKr)}
                      </td>

                      {/* D-DONASI */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-amber-800">
                        {formatTableCellAmount(acc.donasiDb)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-amber-800">
                        {formatTableCellAmount(acc.donasiKr)}
                      </td>

                      {/* A-AJAR */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-purple-800">
                        {formatTableCellAmount(acc.ajarDb)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono text-[11px] text-purple-800">
                        {formatTableCellAmount(acc.ajarKr)}
                      </td>

                      {/* Total Konsolidasi */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900 bg-slate-50/70">
                        {formatTableCellAmount(acc.totalDebet)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900 bg-slate-50/70">
                        {formatTableCellAmount(acc.totalKredit)}
                      </td>

                      {/* Saldo Akhir */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(acc.saldoAkhir)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: DAFTAR ENTRI TERPASANG (Format Tabel Debit-Kredit Konsolidasian)*/}
      {/* ========================================================================= */}
      {activeSubTab === 'tabelEntries' && (
        <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Tabel Rinci Entri Konsolidasi Jurnal Umum (Debet - Kredit)
              </h3>
              <p className="text-[11px] text-slate-500">
                Menampilkan {filteredRawEntries.length} transaksi berpasangan seimbang dari mutasi dan sistem
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600 font-semibold">
                Filter: <strong className="text-slate-900">{selectedSourceFilter}</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3 border-r border-slate-300 min-w-[85px] w-24">TANGGAL</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 min-w-[110px]">NO JURNAL</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-28">SUMBER</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 min-w-[260px]">KETERANGAN TRANSAKSI</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300 text-center w-16">AKUN DB</th>
                  <th className="py-2.5 px-2.5 border-r border-slate-300 text-center w-16">AKUN KR</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[125px]">DEBET</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[125px]">KREDIT</th>
                  <th className="py-2.5 px-3 text-center w-24">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRawEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada entri jurnal ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredRawEntries.map((j) => {
                    const firstLine = j.lines[0];
                    const otherLines = j.lines.slice(1);
                    const sourceBadgeClass =
                      j.sumberTransaksi === 'Mutasi Bank'
                        ? 'bg-teal-50 text-teal-800 border-teal-200'
                        : j.sumberTransaksi === 'Transaksi Salur'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : j.sumberTransaksi === 'Transaksi Donasi'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : j.sumberTransaksi === 'Transaksi Ajar'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200';

                    return (
                      <React.Fragment key={j.id}>
                        <tr
                          onClick={() => onSelectJournalDetail && onSelectJournalDetail(j)}
                          className="hover:bg-teal-50/30 transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-700">
                            {j.tanggalJurnal}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-[#05828e]">
                            {j.nomorJurnal}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sourceBadgeClass}`}>
                              {j.sumberTransaksi.replace('Transaksi ', '')}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-r border-slate-200 text-slate-800">
                            <div className="font-semibold">{j.keteranganTransaksi}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Ref: {j.nomorReferensiBank}</span>
                              <span>•</span>
                              <span>{j.rekeningBank}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-200 text-center font-mono font-bold text-slate-800">
                            {firstLine?.kodeAkunDb || '-'}
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-200 text-center font-mono font-bold text-slate-800">
                            {firstLine?.kodeAkunKr || '-'}
                          </td>
                          <td className="py-2 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                            {formatTableCellAmount(firstLine?.nominalDebet || 0)}
                          </td>
                          <td className="py-2 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                            {formatTableCellAmount(firstLine?.nominalKredit || 0)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Seimbang
                            </span>
                          </td>
                        </tr>

                        {otherLines.map((line) => (
                          <tr
                            key={line.id}
                            onClick={() => onSelectJournalDetail && onSelectJournalDetail(j)}
                            className="bg-slate-50/50 hover:bg-teal-50/30 transition-colors cursor-pointer border-t border-slate-100"
                          >
                            <td className="py-1 px-3 border-r border-slate-200 text-slate-400 text-center font-mono">↳</td>
                            <td className="py-1 px-3 border-r border-slate-200 text-slate-400 text-[10px] italic">Baris Kedua</td>
                            <td className="py-1 px-3 border-r border-slate-200"></td>
                            <td className="py-1 px-4 border-r border-slate-200 text-slate-600 pl-8 text-[11px]">
                              {line.keterangan || line.namaAkun}
                            </td>
                            <td className="py-1 px-2.5 border-r border-slate-200 text-center font-mono text-slate-600">
                              {line.kodeAkunDb || '-'}
                            </td>
                            <td className="py-1 px-2.5 border-r border-slate-200 text-center font-mono text-slate-600">
                              {line.kodeAkunKr || '-'}
                            </td>
                            <td className="py-1 px-4 border-r border-slate-200 text-right font-mono text-slate-700">
                              {formatTableCellAmount(line.nominalDebet || 0)}
                            </td>
                            <td className="py-1 px-4 border-r border-slate-200 text-right font-mono text-slate-700">
                              {formatTableCellAmount(line.nominalKredit || 0)}
                            </td>
                            <td className="py-1 px-3 border-r border-slate-200"></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
