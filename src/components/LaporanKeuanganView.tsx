import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  EyeOff,
  Eye,
  Plus,
  X,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ChevronRight,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  BarChart3,
  Landmark,
  ArrowRightLeft,
  Receipt,
  FileText,
  Clock,
  UserCheck,
  Check,
  HelpCircle,
  BookOpen,
  Download,
} from 'lucide-react';
import { ModalExportPdfLaporanKeuangan } from './ModalExportPdfLaporanKeuangan';
import { RingkasanJurnalConsolidatedView } from './RingkasanJurnalConsolidatedView';
import { DashboardArusKas } from './DashboardArusKas';
import { MutasiItem, PengeluaranItem, ProjectItem, JenisProyekItem } from '../types';
import { PosKeuanganItem } from '../posKeuanganData';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { PosPemasukanGroup } from '../posPemasukanData';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';
import { PosPengeluaranGroup } from '../posPengeluaranData';
import {
  CoaAccount,
  JournalEntry,
  JournalLine,
  loadCoaList,
  saveCoaList,
  loadReversalJournals,
  saveReversalJournals,
  generateJournalsFromMutasi,
  createReversalJournal,
  verifyAllJournalsBalanced,
} from '../accountingData';

interface LaporanKeuanganViewProps {
  mutasiItems: MutasiItem[];
  pengeluaranList: PengeluaranItem[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  posKeuanganList?: PosKeuanganItem[];
  posPemasukanList?: PosPemasukanGroup[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  projects?: ProjectItem[];
  jenisProyekList?: JenisProyekItem[];
  coaList?: CoaAccount[];
  initialTab?: 'coa' | 'jurnal' | 'ringkasanJurnal' | 'arusKas' | 'manajemen' | 'summary' | 'saldoAkhir' | 'saldoPerRekening';
  onUpdateCoaList?: (items: CoaAccount[]) => void;
  onNavigateToCoa?: () => void;
  onNavigateToMutasi?: (bankAccount: string) => void;
  onNavigateToPengeluaran?: () => void;
}

export const LaporanKeuanganView: React.FC<LaporanKeuanganViewProps> = ({
  mutasiItems,
  pengeluaranList,
  salurOrders = [],
  donasiOrders = [],
  transaksiAjarList = [],
  posKeuanganList = [],
  posPemasukanList = [],
  kebutuhanPengeluaranList = [],
  posPengeluaranList = [],
  projects = [],
  jenisProyekList = [],
  coaList: propCoaList,
  initialTab = 'coa',
  onUpdateCoaList,
  onNavigateToCoa,
  onNavigateToMutasi,
  onNavigateToPengeluaran,
}) => {
  // Navigation Tabs: COA, Jurnal, Ringkasan Jurnal, ARUS KAS, MANAJEMEN, SUMMARY, SALDO AKHIR, Saldo Per Rekening
  const [activeTab, setActiveTab] = useState<
    'coa' | 'jurnal' | 'ringkasanJurnal' | 'arusKas' | 'manajemen' | 'summary' | 'saldoAkhir' | 'saldoPerRekening'
  >(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Toolbar state matching Identitas UI
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);

  // Filters state
  const [selectedRekeningFilter, setSelectedRekeningFilter] = useState<string>('ALL');
  const [selectedKategoriDanaFilter, setSelectedKategoriDanaFilter] = useState<string>('ALL');
  const [selectedKelompokCoaFilter, setSelectedKelompokCoaFilter] = useState<string>('ALL');
  const [selectedStatusJurnalFilter, setSelectedStatusJurnalFilter] = useState<string>('ALL');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [selectedCoaRangeFilter, setSelectedCoaRangeFilter] = useState<string>('ALL');

  // Persistent accounting state connected directly to Menu COA
  const [internalCoaList, setInternalCoaList] = useState<CoaAccount[]>(() => loadCoaList());
  const coaList = propCoaList || internalCoaList;

  const handleUpdateCoa = (newList: CoaAccount[]) => {
    if (onUpdateCoaList) {
      onUpdateCoaList(newList);
    } else {
      setInternalCoaList(newList);
      saveCoaList(newList);
    }
  };

  const [reversals, setReversals] = useState<JournalEntry[]>(() => loadReversalJournals());

  // STRICT AUDIT INTEGRATION: Jurnal muncul secara otomatis 100% dari Mutasi!
  // Jurnal TIDAK BOLEH memunculkan data yang tidak ada di mutasi.
  // Terhubung langsung dengan konfigurasi akun COA, Kebutuhan Pengeluaran, dan semua Transaksi!
  const journalEntries = useMemo(() => {
    return generateJournalsFromMutasi(
      mutasiItems,
      pengeluaranList,
      reversals,
      coaList,
      salurOrders,
      donasiOrders,
      kebutuhanPengeluaranList,
      posPengeluaranList,
      projects,
      jenisProyekList,
      transaksiAjarList
    );
  }, [
    mutasiItems,
    pengeluaranList,
    reversals,
    coaList,
    salurOrders,
    donasiOrders,
    kebutuhanPengeluaranList,
    posPengeluaranList,
    projects,
    jenisProyekList,
    transaksiAjarList,
  ]);

  // Modal states
  const [isAddCoaModalOpen, setIsAddCoaModalOpen] = useState(false);
  const [isExportPdfModalOpen, setIsExportPdfModalOpen] = useState(false);
  const [selectedJournalForDetail, setSelectedJournalForDetail] = useState<JournalEntry | null>(null);
  const [selectedJournalForReversal, setSelectedJournalForReversal] = useState<JournalEntry | null>(null);
  const [reversalReasonInput, setReversalReasonInput] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Format rupiah helper
  const formatRupiah = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
    if (val < 0) {
      return `(Rp ${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Format table cell debet/kredit matching screenshot image_d574fecf.png
  const formatTableCellAmount = (val: number, isDebetPos: boolean): string => {
    if (val === 0) return '-';
    if (val < 0) {
      return `(${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return val.toLocaleString('id-ID');
  };

  // Calculate dynamic balances for COA based on initial balance + posted journals
  const computedCoaList = useMemo(() => {
    const debetMap: Record<string, number> = {};
    const kreditMap: Record<string, number> = {};

    journalEntries.forEach((entry) => {
      // Don't count reversed entries if marked as reversed or count both journal and reverse journal
      entry.lines.forEach((line) => {
        if (line.kodeAkunDb) {
          debetMap[line.kodeAkunDb] = (debetMap[line.kodeAkunDb] || 0) + (line.nominalDebet || 0);
        }
        if (line.kodeAkunKr) {
          kreditMap[line.kodeAkunKr] = (kreditMap[line.kodeAkunKr] || 0) + (line.nominalKredit || 0);
        }
      });
    });

    return coaList.map((acc) => {
      if (acc.isHeader) return acc;
      const additionalDebet = debetMap[acc.noAkun] || 0;
      const additionalKredit = kreditMap[acc.noAkun] || 0;

      let currentDebet = acc.saldoAwalDebet;
      let currentKredit = acc.saldoAwalKredit;

      if (acc.pos === 'D') {
        currentDebet = acc.saldoAwalDebet + additionalDebet - additionalKredit;
      } else {
        currentKredit = acc.saldoAwalKredit + additionalKredit - additionalDebet;
      }

      return {
        ...acc,
        saldoAwalDebet: currentDebet,
        saldoAwalKredit: currentKredit,
      };
    });
  }, [coaList, journalEntries]);

  // Total COA Aktiva, Kewajiban, Ekuitas, Pendapatan, Biaya
  const coaTotals = useMemo(() => {
    let totalAktiva = 0;
    let totalKewajiban = 0;
    let totalEkuitas = 0;
    let totalPendapatan = 0;
    let totalBiayaProgram = 0;
    let totalBiayaOperasional = 0;

    computedCoaList.forEach((acc) => {
      if (acc.isHeader) return;
      if (acc.kelompok === 'AKTIVA') totalAktiva += acc.saldoAwalDebet;
      if (acc.kelompok === 'KEWAJIBAN') totalKewajiban += acc.saldoAwalKredit;
      if (acc.kelompok === 'EKUITAS') totalEkuitas += acc.saldoAwalKredit;
      if (acc.kelompok === 'PENDAPATAN') totalPendapatan += acc.saldoAwalKredit;
      if (acc.kelompok === 'BIAYA PROGRAM') totalBiayaProgram += acc.saldoAwalDebet;
      if (acc.kelompok === 'BIAYA OPERASIONAL') totalBiayaOperasional += acc.saldoAwalDebet;
    });

    // Grand total debet and kredit across all accounts
    let grandDebet = 0;
    let grandKredit = 0;
    computedCoaList.forEach((acc) => {
      if (acc.isHeader) return;
      grandDebet += acc.saldoAwalDebet > 0 ? acc.saldoAwalDebet : 0;
      grandKredit += acc.saldoAwalKredit > 0 ? acc.saldoAwalKredit : 0;
    });

    return {
      totalAktiva,
      totalKewajiban,
      totalEkuitas,
      totalPendapatan,
      totalBiayaProgram,
      totalBiayaOperasional,
      totalBeban: totalBiayaProgram + totalBiayaOperasional,
      surplusDefisit: totalPendapatan - (totalBiayaProgram + totalBiayaOperasional),
      grandDebet,
      grandKredit,
    };
  }, [computedCoaList]);

  // Filtered COA items
  const filteredCoaList = useMemo(() => {
    return computedCoaList.filter((acc) => {
      if (selectedKelompokCoaFilter !== 'ALL' && acc.kelompok !== selectedKelompokCoaFilter) {
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
    });
  }, [computedCoaList, selectedKelompokCoaFilter, searchQuery]);

  // View grouping mode for Jurnal Umum Otomatis: 'bank' | 'sumber' | 'all'
  const [viewGroupBy, setViewGroupBy] = useState<'bank' | 'sumber' | 'all'>('bank');

  // Source Counts & Nominal Totals for Quick Filters and Jurnal Umum Otomatis Executive Recap
  const journalSourceStats = useMemo(() => {
    let mutasiBankCount = 0;
    let mutasiBankTotal = 0;
    let salurCount = 0;
    let salurTotal = 0;
    let donasiCount = 0;
    let donasiTotal = 0;
    let pengeluaranCount = 0;
    let pengeluaranTotal = 0;
    let ajarCount = 0;
    let ajarTotal = 0;
    let reversalCount = 0;
    let reversalTotal = 0;

    journalEntries.forEach((j) => {
      const entryNominal = j.totalDebet ?? j.lines.reduce((s, l) => s + (l.nominalDebet || 0), 0);
      if (j.isReversalEntry || j.isReversed) {
        reversalCount++;
        reversalTotal += entryNominal;
      }
      if (j.sumberTransaksi === 'Mutasi Bank') {
        mutasiBankCount++;
        mutasiBankTotal += entryNominal;
      } else if (j.sumberTransaksi === 'Transaksi Salur') {
        salurCount++;
        salurTotal += entryNominal;
      } else if (j.sumberTransaksi === 'Transaksi Donasi') {
        donasiCount++;
        donasiTotal += entryNominal;
      } else if (j.sumberTransaksi === 'Pengeluaran') {
        pengeluaranCount++;
        pengeluaranTotal += entryNominal;
      } else if (j.sumberTransaksi === 'Transaksi Ajar') {
        ajarCount++;
        ajarTotal += entryNominal;
      }
    });

    return {
      mutasiBank: { count: mutasiBankCount, total: mutasiBankTotal },
      salur: { count: salurCount, total: salurTotal },
      donasi: { count: donasiCount, total: donasiTotal },
      pengeluaran: { count: pengeluaranCount, total: pengeluaranTotal },
      ajar: { count: ajarCount, total: ajarTotal },
      reversal: { count: reversalCount, total: reversalTotal },
      total: journalEntries.length,
    };
  }, [journalEntries]);

  // Balance Verification Stats across all journals
  const balanceAuditStats = useMemo(() => {
    return verifyAllJournalsBalanced(journalEntries);
  }, [journalEntries]);

  // Filtered Journals
  const filteredJournals = useMemo(() => {
    return journalEntries.filter((entry) => {
      if (selectedRekeningFilter !== 'ALL' && entry.rekeningBank !== selectedRekeningFilter) {
        return false;
      }
      if (selectedKategoriDanaFilter !== 'ALL' && entry.kategoriDana !== selectedKategoriDanaFilter) {
        return false;
      }
      if (selectedStatusJurnalFilter !== 'ALL' && entry.statusPersetujuan !== selectedStatusJurnalFilter) {
        return false;
      }
      if (selectedSourceFilter === 'mutasiBank' && entry.sumberTransaksi !== 'Mutasi Bank') {
        return false;
      }
      if (selectedSourceFilter === 'salur' && entry.sumberTransaksi !== 'Transaksi Salur') {
        return false;
      }
      if (selectedSourceFilter === 'donasi' && entry.sumberTransaksi !== 'Transaksi Donasi') {
        return false;
      }
      if (selectedSourceFilter === 'pengeluaran' && entry.sumberTransaksi !== 'Pengeluaran') {
        return false;
      }
      if (selectedSourceFilter === 'ajar' && entry.sumberTransaksi !== 'Transaksi Ajar') {
        return false;
      }
      if (selectedSourceFilter === 'reversal' && !entry.isReversed && !entry.isReversalEntry) {
        return false;
      }
      if (selectedCoaRangeFilter !== 'ALL') {
        const hasRange = entry.lines.some((l) => {
          const code = l.kodeAkunDb || l.kodeAkunKr || '';
          if (selectedCoaRangeFilter === 'aktiva') return code.startsWith('1');
          if (selectedCoaRangeFilter === 'pendapatan') return code.startsWith('4');
          if (selectedCoaRangeFilter === 'biaya') return code.startsWith('5') || code.startsWith('6');
          return true;
        });
        if (!hasRange) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          entry.nomorJurnal.toLowerCase().includes(q) ||
          entry.keteranganTransaksi.toLowerCase().includes(q) ||
          entry.nomorReferensiBank.toLowerCase().includes(q) ||
          entry.programKegiatan.toLowerCase().includes(q) ||
          entry.rekeningBank.toLowerCase().includes(q) ||
          entry.lines.some((l) =>
            l.namaAkun.toLowerCase().includes(q) ||
            (l.kodeAkunDb && l.kodeAkunDb.toLowerCase().includes(q)) ||
            (l.kodeAkunKr && l.kodeAkunKr.toLowerCase().includes(q))
          );
        if (!match) return false;
      }
      return true;
    });
  }, [
    journalEntries,
    selectedRekeningFilter,
    selectedKategoriDanaFilter,
    selectedStatusJurnalFilter,
    selectedSourceFilter,
    selectedCoaRangeFilter,
    searchQuery,
  ]);

  // Export filtered journals to standard CSV format
  const handleExportJournalsCSV = () => {
    const headers = [
      'Tanggal',
      'Nomor Jurnal',
      'No Referensi Bank',
      'Rekening Bank',
      'Sumber',
      'Program Kegiatan',
      'Keterangan Transaksi',
      'Keterangan Baris',
      'Akun DB',
      'Akun KR',
      'Nama Akun',
      'Nominal Debet',
      'Nominal Kredit',
      'Status Balance',
      'Status Persetujuan',
    ];

    const rows: string[][] = [];
    filteredJournals.forEach((j) => {
      j.lines.forEach((l) => {
        rows.push([
          `"${j.tanggalJurnal}"`,
          `"${j.nomorJurnal}"`,
          `"${j.nomorReferensiBank}"`,
          `"${j.rekeningBank}"`,
          `"${j.sumberTransaksi}"`,
          `"${j.programKegiatan}"`,
          `"${j.keteranganTransaksi.replace(/"/g, '""')}"`,
          `"${l.keterangan.replace(/"/g, '""')}"`,
          `"${l.kodeAkunDb || ''}"`,
          `"${l.kodeAkunKr || ''}"`,
          `"${l.namaAkun.replace(/"/g, '""')}"`,
          String(l.nominalDebet || 0),
          String(l.nominalKredit || 0),
          `"Seimbang"`,
          `"${j.statusPersetujuan}"`,
        ]);
      });
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `jurnal_umum_mutasi_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    showToast('File CSV Jurnal Umum berhasil diunduh ke laptop/komputer');
  };

  // Group filtered journals by Bank Account for image_4937e455.png layout
  const journalsGroupedByBank = useMemo<Record<string, JournalEntry[]>>(() => {
    const groups: Record<string, JournalEntry[]> = {};
    filteredJournals.forEach((j) => {
      const bank = j.rekeningBank || 'Rek Lainnya';
      if (!groups[bank]) groups[bank] = [];
      groups[bank].push(j);
    });
    return groups;
  }, [filteredJournals]);

  // Group filtered journals dynamically based on viewGroupBy ('bank' | 'sumber' | 'all')
  const displayedJournalGroups = useMemo<Record<string, JournalEntry[]>>(() => {
    if (viewGroupBy === 'sumber') {
      const groups: Record<string, JournalEntry[]> = {
        'Mutasi Bank': [],
        'Transaksi Salur': [],
        'Transaksi Donasi': [],
        'Transaksi Ajar': [],
        'Pengeluaran': [],
      };
      filteredJournals.forEach((j) => {
        const src = j.sumberTransaksi || 'Lainnya';
        if (!groups[src]) groups[src] = [];
        groups[src].push(j);
      });
      const cleanGroups: Record<string, JournalEntry[]> = {};
      Object.entries(groups).forEach(([k, list]) => {
        if (list.length > 0) cleanGroups[k] = list;
      });
      return cleanGroups;
    } else if (viewGroupBy === 'all') {
      return { 'Semua Transaksi Jurnal Umum': filteredJournals };
    } else {
      return journalsGroupedByBank;
    }
  }, [viewGroupBy, filteredJournals, journalsGroupedByBank]);

  // Bank Balances Tab Calculation
  const bankBalances = useMemo(() => {
    const accounts = [
      { code: '10001', name: 'Kas BCA Penerbitan', initial: 641221612, category: 'Dana Terikat' },
      { code: '10003', name: 'Kas BCA Operasional Dharma', initial: -1739794709, category: 'Dana Tidak Terikat' },
      { code: '10002', name: 'Kas BCA Kegiatan Retret', initial: 2104168288, category: 'Dana Terikat' },
      { code: '10004', name: 'Kas BCA Operasional Non-Dharma', initial: -48552203, category: 'Dana Operasional' },
      { code: '10101', name: 'Kas Tunai Penerbitan', initial: 2000000, category: 'Dana Terikat' },
      { code: '10103', name: 'Kas Tunai Operasional', initial: 10000000, category: 'Dana Operasional' },
      { code: '10301', name: 'Deposito Teks Dharma', initial: 340000000, category: 'Dana Abadi / Cadangan' },
      { code: '10303', name: 'Deposito Operasional', initial: 35056599, category: 'Dana Cadangan' },
    ];

    return accounts.map((acc) => {
      let debet = 0;
      let kredit = 0;
      journalEntries.forEach((entry) => {
        entry.lines.forEach((line) => {
          if (line.kodeAkunDb === acc.code) debet += line.nominalDebet || 0;
          if (line.kodeAkunKr === acc.code) kredit += line.nominalKredit || 0;
        });
      });
      const ending = acc.initial + debet - kredit;
      return {
        ...acc,
        totalDebet: debet,
        totalKredit: kredit,
        endingBalance: ending,
      };
    });
  }, [journalEntries]);

  // Execute Reversal Journal
  const handleExecuteReversal = () => {
    if (!selectedJournalForReversal) return;
    if (!reversalReasonInput.trim()) {
      showToast('Wajib mengisi alasan pembuatan jurnal pembalik / penyesuaian');
      return;
    }

    const { reversal } = createReversalJournal(
      selectedJournalForReversal,
      reversalReasonInput.trim(),
      'Finance Admin (Audit)'
    );

    const updatedReversals = [reversal, ...reversals];
    setReversals(updatedReversals);
    saveReversalJournals(updatedReversals);

    setSelectedJournalForReversal(null);
    setReversalReasonInput('');
    showToast(`Jurnal pembalik ${reversal.nomorJurnal} berhasil diposting`);
  };



  // Form state for + Tambah Akun COA
  const [newCoaForm, setNewCoaForm] = useState<Partial<CoaAccount>>({
    noAkun: '',
    namaAkun: '',
    pos: 'D',
    kelompok: 'AKTIVA',
    saldoAwalDebet: 0,
    saldoAwalKredit: 0,
  });

  const handleSaveNewCoa = () => {
    if (!newCoaForm.noAkun?.trim() || !newCoaForm.namaAkun?.trim()) {
      showToast('Nomor dan Nama Akun wajib diisi');
      return;
    }
    if (coaList.some((c) => c.noAkun === newCoaForm.noAkun?.trim())) {
      showToast('Nomor Akun sudah ada!');
      return;
    }

    const item: CoaAccount = {
      noAkun: newCoaForm.noAkun.trim(),
      namaAkun: newCoaForm.namaAkun.trim(),
      pos: (newCoaForm.pos as 'D' | 'K') || 'D',
      kelompok: newCoaForm.kelompok as any,
      saldoAwalDebet: Number(newCoaForm.saldoAwalDebet) || 0,
      saldoAwalKredit: Number(newCoaForm.saldoAwalKredit) || 0,
    };

    const updated = [...coaList, item].sort((a, b) => a.noAkun.localeCompare(b.noAkun));
    handleUpdateCoa(updated);
    setIsAddCoaModalOpen(false);
    showToast(`Akun COA ${item.noAkun} - ${item.namaAkun} berhasil ditambahkan dan disinkronkan`);
  };

  return (
    <div className="w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Toolbar matching Identitas UI: Header, Search, EyeOff, Sliders, + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Laporan Keuangan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#05828e]/10 text-[#05828e]">
              Standar Akuntansi Yayasan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chart of Accounts (COA), Jurnal Umum Terintegrasi, Laporan Manajemen, & Saldo Kas Rekening
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Toggle Search Bar */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari akun, jurnal, referensi..."
                autoFocus
                className="text-xs text-slate-700 outline-none w-44 sm:w-60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari Data"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Privacy Mask Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPrivacyMasked(!isPrivacyMasked);
              showToast(isPrivacyMasked ? 'Nominal ditampilkan' : 'Nominal disamarkan (Mode Privasi)');
            }}
            title={isPrivacyMasked ? 'Tampilkan Nominal' : 'Samarkan Nominal'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
              isPrivacyMasked
                ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {isPrivacyMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Sliders / Filter Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Laporan"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                isFilterOpen || selectedRekeningFilter !== 'ALL' || selectedKelompokCoaFilter !== 'ALL'
                  ? 'bg-[#05828e] border-[#05828e] text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Filter Laporan</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRekeningFilter('ALL');
                      setSelectedKategoriDanaFilter('ALL');
                      setSelectedKelompokCoaFilter('ALL');
                      setSelectedStatusJurnalFilter('ALL');
                    }}
                    className="text-[11px] text-[#05828e] hover:underline font-medium cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>

                {/* Filter Kelompok COA */}
                <div className="mb-3">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Kelompok Akun (COA)
                  </label>
                  <select
                    value={selectedKelompokCoaFilter}
                    onChange={(e) => setSelectedKelompokCoaFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="ALL">Semua Kelompok</option>
                    <option value="AKTIVA">10000 AKTIVA</option>
                    <option value="KEWAJIBAN">20000 KEWAJIBAN</option>
                    <option value="EKUITAS">30000 EKUITAS</option>
                    <option value="PENDAPATAN">40000 PENDAPATAN</option>
                    <option value="BIAYA PROGRAM">50000 BIAYA PROGRAM</option>
                    <option value="BIAYA OPERASIONAL">60000 BIAYA OPERASIONAL</option>
                  </select>
                </div>

                {/* Filter Rekening Bank */}
                <div className="mb-3">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Rekening Bank
                  </label>
                  <select
                    value={selectedRekeningFilter}
                    onChange={(e) => setSelectedRekeningFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="ALL">Semua Rekening</option>
                    <option value="Rek Operasional BCA">Rek Operasional BCA</option>
                    <option value="Kas BCA Kegiatan Dharma">Kas BCA Kegiatan Dharma</option>
                    <option value="Kas BCA Penerbitan">Kas BCA Penerbitan</option>
                  </select>
                </div>

                {/* Filter Kategori Dana */}
                <div className="mb-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Kategori Dana
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'Dana Terikat', 'Dana Tidak Terikat', 'Dana Operasional'].map((kat) => (
                      <button
                        key={kat}
                        type="button"
                        onClick={() => setSelectedKategoriDanaFilter(kat)}
                        className={`text-[10px] px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          selectedKategoriDanaFilter === kat
                            ? 'bg-[#05828e] text-white font-medium'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {kat === 'ALL' ? 'Semua' : kat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons based on active tab */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('app-open-download-all-data'))}
              title="Unduh & Cadangkan Seluruh Data YPPLN (JSON / CSV Archive)"
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#05828e]" />
              <span className="hidden sm:inline">Backup Semua Data</span>
              <span className="sm:hidden">Backup</span>
            </button>

            {activeTab === 'ringkasanJurnal' ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Konsolidasi 100% Seimbang</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('jurnal')}
                  title="Kembali ke Daftar Jurnal Umum Rinci"
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  <span>Jurnal Rinci</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportPdfModalOpen(true)}
                  title="Ekspor Laporan Keuangan ke format PDF (Arus Kas, Pos Keuangan & Jurnal Umum)"
                  className="bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </>
            ) : activeTab === 'jurnal' ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-[#05828e] text-xs font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Otomatis Mutasi ({journalEntries.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('ringkasanJurnal')}
                  title="Tampilkan Ringkasan Konsolidasi Debet-Kredit Mutasi, S-SALUR, D-DONASI, & A-AJAR"
                  className="bg-white border border-[#05828e] text-[#05828e] hover:bg-teal-50 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ringkasan Konsolidasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportPdfModalOpen(true)}
                  title="Ekspor Laporan Keuangan ke format PDF (Arus Kas, Pos Keuangan & Jurnal Umum)"
                  className="bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                {onNavigateToMutasi && (
                  <button
                    type="button"
                    onClick={() => onNavigateToMutasi('BCA 888')}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mutasi Bank</span>
                  </button>
                )}
              </>
            ) : activeTab === 'arusKas' ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-[#05828e] text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Visualisasi Arus Kas Dinamis</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsExportPdfModalOpen(true)}
                  title="Ekspor Laporan Keuangan ke format PDF"
                  className="bg-white border border-[#05828e] text-[#05828e] hover:bg-teal-50 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </>
            ) : activeTab === 'coa' ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsExportPdfModalOpen(true)}
                  title="Ekspor Laporan Keuangan ke format PDF"
                  className="bg-white border border-[#05828e] text-[#05828e] hover:bg-teal-50 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCoaModalOpen(true)}
                  className="bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Akun</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsExportPdfModalOpen(true)}
                  title="Ekspor Laporan Keuangan ke format PDF (Arus Kas, Pos Keuangan & Jurnal Umum)"
                  className="bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cetak</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation matching Identitas UI */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-4 border-b border-slate-200 scrollbar-none">
        {[
          { key: 'coa', label: 'COA', desc: 'Daftar Akun', badge: coaList.length },
          { key: 'jurnal', label: 'Jurnal Umum Otomatis', desc: 'Rekap Transaksi & COA', badge: journalEntries.length },
          { key: 'ringkasanJurnal', label: 'Ringkasan Jurnal', desc: 'Konsolidasi Debet-Kredit Mutasi & Transaksi', badge: journalEntries.length },
          { key: 'arusKas', label: 'Arus Kas (Cash Flow)', desc: 'Dashboard Visualisasi Recharts', badge: 'Grafik' },
          { key: 'manajemen', label: 'MANAJEMEN', desc: 'Kinerja Keuangan' },
          { key: 'summary', label: 'SUMMARY', desc: 'Ringkasan Laporan' },
          { key: 'saldoAkhir', label: 'SALDO AKHIR', desc: 'Kategori Dana' },
          { key: 'saldoPerRekening', label: 'Saldo Per Rekening', desc: 'Kas & Bank', badge: bankBalances.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-[#05828e] text-[#05828e] bg-teal-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#05828e] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: COA (Chart of Accounts) matching image_d574fecf.png */}
      {/* ============================================================== */}
      {activeTab === 'coa' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Quick Info bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800">Chart of Accounts (COA)</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                Total Akun Terdaftar: <strong className="text-slate-900">{coaList.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                Neraca Aktiva Seimbang
              </span>
              {onNavigateToCoa && (
                <button
                  type="button"
                  onClick={onNavigateToCoa}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#05828e] hover:text-[#046e78] bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Buka Menu COA</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container matching screenshot image_d574fecf.png */}
          <div className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden">
            {/* Sheet Title matching exact image */}
            <div className="py-2.5 text-center font-bold text-sm tracking-wide text-slate-900 bg-slate-100/90 border-b border-slate-300 uppercase">
              DAFTAR AKUN
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                    <th className="py-2 px-3 border-r border-slate-300 w-24">NO AKUN</th>
                    <th className="py-2 px-4 border-r border-slate-300 min-w-[280px]">NAMA AKUN</th>
                    <th className="py-2 px-3 border-r border-slate-300 text-center w-14">POS</th>
                    <th className="py-2 px-4 border-r border-slate-300 text-right min-w-[130px]">DEBET</th>
                    <th className="py-2 px-4 text-right min-w-[130px]">KREDIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCoaList.map((acc) => {
                    if (acc.isHeader) {
                      // Category Header row (e.g. 10000 AKTIVA, 20000 KEWAJIBAN, etc.)
                      return (
                        <tr
                          key={acc.noAkun}
                          className="bg-slate-100 font-extrabold text-slate-900 hover:bg-slate-150 transition-colors"
                        >
                          <td className="py-2 px-3 border-r border-slate-300 tracking-wider">
                            {acc.noAkun}
                          </td>
                          <td className="py-2 px-4 border-r border-slate-300 font-black tracking-wide" colSpan={2}>
                            {acc.namaAkun}
                          </td>
                          <td className="py-2 px-4 border-r border-slate-300 text-right text-slate-400 font-normal">
                            -
                          </td>
                          <td className="py-2 px-4 text-right text-slate-400 font-normal">
                            -
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={acc.noAkun}
                        className="hover:bg-teal-50/40 transition-colors group"
                      >
                        <td className="py-1.5 px-3 border-r border-slate-200 font-mono text-slate-700">
                          {acc.noAkun}
                        </td>
                        <td className="py-1.5 px-4 border-r border-slate-200 text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{acc.namaAkun}</span>
                            {Number(acc.noAkun) >= 40002 && Number(acc.noAkun) <= 49990 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-semibold shrink-0">
                                Item S-SALUR
                              </span>
                            )}
                            {['10001', '10002', '10003', '10004'].includes(acc.noAkun) && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-semibold shrink-0">
                                Pos Keuangan
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-200 text-center font-bold text-slate-600">
                          {acc.pos}
                        </td>
                        <td className="py-1.5 px-4 border-r border-slate-200 text-right font-mono text-slate-800">
                          {isPrivacyMasked
                            ? '••••'
                            : formatTableCellAmount(acc.saldoAwalDebet, true)}
                        </td>
                        <td className="py-1.5 px-4 text-right font-mono text-slate-800">
                          {isPrivacyMasked
                            ? '••••'
                            : formatTableCellAmount(acc.saldoAwalKredit, false)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: Jurnal Umum Otomatis (Rekapitulasi 5 Modul & Sinkronisasi COA) */}
      {/* ============================================================== */}
      {activeTab === 'jurnal' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Rules and compliance banner: 100% auto generated & synchronized with COA */}
          <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-slate-800 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#05828e] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                      Jurnal Umum Otomatis (Terintegrasi COA 10000 - 69999)
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Sinkronisasi Aktif
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      5 Modul Transaksi
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                    Merekapitulasi seluruh transaksi keuangan secara otomatis dari <strong>Mutasi Bank</strong>, <strong>Transaksi S-SALUR</strong>, <strong>Transaksi D-DONASI</strong>, <strong>Transaksi A-AJAR</strong>, dan <strong>Pengeluaran</strong>. Seluruh entri berpedoman pada kode akun COA standar yayasan dan diaudit dengan prinsip <strong>Double-Entry (Total Debet = Total Kredit)</strong>.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-auto">
                <button
                  type="button"
                  onClick={handleExportJournalsCSV}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                  title="Unduh data Jurnal Umum Otomatis dalam format CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh CSV</span>
                </button>
                {onNavigateToCoa && (
                  <button
                    type="button"
                    onClick={onNavigateToCoa}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#05828e]" />
                    <span>Sinkronisasi COA</span>
                  </button>
                )}
                {onNavigateToMutasi && (
                  <button
                    type="button"
                    onClick={() => onNavigateToMutasi('BCA 888')}
                    className="bg-[#05828e] hover:bg-[#046e78] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mutasi Bank</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ================= 5 SOURCE RECAP INTERACTIVE CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 1: Mutasi Bank */}
            <div
              onClick={() => setSelectedSourceFilter(selectedSourceFilter === 'mutasiBank' ? 'ALL' : 'mutasiBank')}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                selectedSourceFilter === 'mutasiBank'
                  ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                  Mutasi Bank
                </span>
                <Landmark className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-1.5">
                {isPrivacyMasked ? '••••' : formatRupiah(journalSourceStats.mutasiBank.total)}
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-1">
                <span>{journalSourceStats.mutasiBank.count} Jurnal</span>
                <span className="font-mono text-teal-600 font-medium">10001 - 10205</span>
              </div>
            </div>

            {/* Card 2: S-SALUR */}
            <div
              onClick={() => setSelectedSourceFilter(selectedSourceFilter === 'salur' ? 'ALL' : 'salur')}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                selectedSourceFilter === 'salur'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  S-SALUR
                </span>
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-1.5">
                {isPrivacyMasked ? '••••' : formatRupiah(journalSourceStats.salur.total)}
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-1">
                <span>{journalSourceStats.salur.count} Jurnal</span>
                <span className="font-mono text-emerald-600 font-medium">40002 & 60600</span>
              </div>
            </div>

            {/* Card 3: D-DONASI */}
            <div
              onClick={() => setSelectedSourceFilter(selectedSourceFilter === 'donasi' ? 'ALL' : 'donasi')}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                selectedSourceFilter === 'donasi'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  D-DONASI
                </span>
                <Receipt className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-1.5">
                {isPrivacyMasked ? '••••' : formatRupiah(journalSourceStats.donasi.total)}
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-1">
                <span>{journalSourceStats.donasi.count} Jurnal</span>
                <span className="font-mono text-amber-600 font-medium">49997 (20:20:30:30)</span>
              </div>
            </div>

            {/* Card 4: A-AJAR */}
            <div
              onClick={() => setSelectedSourceFilter(selectedSourceFilter === 'ajar' ? 'ALL' : 'ajar')}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                selectedSourceFilter === 'ajar'
                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  A-AJAR
                </span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-1.5">
                {isPrivacyMasked ? '••••' : formatRupiah(journalSourceStats.ajar.total)}
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-1">
                <span>{journalSourceStats.ajar.count} Jurnal</span>
                <span className="font-mono text-purple-600 font-medium">40301 -&gt; 10002</span>
              </div>
            </div>

            {/* Card 5: Pengeluaran */}
            <div
              onClick={() => setSelectedSourceFilter(selectedSourceFilter === 'pengeluaran' ? 'ALL' : 'pengeluaran')}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                selectedSourceFilter === 'pengeluaran'
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                  Pengeluaran
                </span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-1.5">
                {isPrivacyMasked ? '••••' : formatRupiah(journalSourceStats.pengeluaran.total)}
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-1">
                <span>{journalSourceStats.pengeluaran.count} Jurnal</span>
                <span className="font-mono text-rose-600 font-medium">50000 - 69999</span>
              </div>
            </div>
          </div>

          {/* Audit Neraca Keseimbangan Jurnal (Double-Entry Balance Bar) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#05828e]" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Audit Keseimbangan Entri Jurnal (Double-Entry Balance)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Memverifikasi seluruh jurnal berpasangan seimbang matematis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% SEIMBANG (Debet = Kredit)</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {balanceAuditStats.balancedCount} dari {balanceAuditStats.totalCount} Entri Terverifikasi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10.5px] font-semibold text-slate-400 block uppercase tracking-wide">
                  Total Debet Terposting
                </span>
                <span className="text-base font-bold text-slate-800 font-mono mt-0.5 block">
                  {isPrivacyMasked ? '••••' : formatRupiah(balanceAuditStats.totalDebetAll)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10.5px] font-semibold text-slate-400 block uppercase tracking-wide">
                  Total Kredit Terposting
                </span>
                <span className="text-base font-bold text-slate-800 font-mono mt-0.5 block">
                  {isPrivacyMasked ? '••••' : formatRupiah(balanceAuditStats.totalKreditAll)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                <span className="text-[10.5px] font-semibold text-emerald-700 block uppercase tracking-wide">
                  Selisih Imbalance
                </span>
                <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                  Rp 0 (Seimbang Sempurna)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Source & Grouping View Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Source chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {[
                { id: 'ALL', label: 'Semua Sumber', count: journalSourceStats.total },
                { id: 'mutasiBank', label: 'Mutasi Bank', count: journalSourceStats.mutasiBank.count },
                { id: 'salur', label: 'S-SALUR', count: journalSourceStats.salur.count },
                { id: 'donasi', label: 'D-DONASI', count: journalSourceStats.donasi.count },
                { id: 'pengeluaran', label: 'Pengeluaran', count: journalSourceStats.pengeluaran.count },
                { id: 'ajar', label: 'A-AJAR', count: journalSourceStats.ajar.count },
                { id: 'reversal', label: 'Pembalik', count: journalSourceStats.reversal.count },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedSourceFilter(chip.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedSourceFilter === chip.id
                      ? 'bg-[#05828e] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedSourceFilter === chip.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right: COA Range Filter & Grouping Switcher */}
            <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto">
              {/* Range COA Dropdown Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">COA:</span>
                <select
                  value={selectedCoaRangeFilter}
                  onChange={(e) => setSelectedCoaRangeFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#05828e] cursor-pointer"
                >
                  <option value="ALL">Semua Range Akun (10000 - 69999)</option>
                  <option value="aktiva">10001 - 10299 (Kas Bank &amp; Aktiva Proyek)</option>
                  <option value="pendapatan">40002 - 49999 (Pendapatan Salur &amp; Donasi)</option>
                  <option value="biaya">50000 - 69999 (Biaya Program &amp; Pengeluaran)</option>
                </select>
              </div>

              {/* Grouping View Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewGroupBy('bank')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    viewGroupBy === 'bank'
                      ? 'bg-white text-slate-800 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Kelompokkan berdasarkan Rekening Bank"
                >
                  Per Bank
                </button>
                <button
                  type="button"
                  onClick={() => setViewGroupBy('sumber')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    viewGroupBy === 'sumber'
                      ? 'bg-white text-slate-800 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Kelompokkan berdasarkan Sumber Transaksi (Mutasi, Salur, Donasi, Ajar, Pengeluaran)"
                >
                  Per Sumber
                </button>
                <button
                  type="button"
                  onClick={() => setViewGroupBy('all')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    viewGroupBy === 'all'
                      ? 'bg-white text-slate-800 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Daftar semua jurnal tanpa pengelompokan"
                >
                  Semua
                </button>
              </div>

              {/* Action buttons: PDF & CSV */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={handleExportJournalsCSV}
                  title="Ekspor jurnal yang terfilter ke format CSV"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportPdfModalOpen(true)}
                  title="Ekspor Laporan PDF Lengkap (Arus Kas, Pos Keuangan & Jurnal Umum)"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 border border-teal-200 text-[#05828e] hover:bg-teal-100 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grouped journals per bank / per source / all */}
          {Object.keys(displayedJournalGroups).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Tidak ada jurnal ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter sumber transaksi.</p>
            </div>
          ) : (
            (Object.entries(displayedJournalGroups) as [string, JournalEntry[]][]).map(([groupName, entries]) => (
              <div
                key={groupName}
                className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden mb-6"
              >
                {/* Title JURNAL UMUM matching screenshot */}
                <div className="py-2 text-center font-bold text-sm tracking-wide text-slate-900 bg-white border-b border-slate-300 uppercase">
                  JURNAL UMUM OTOMATIS
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                        <th className="py-2 px-3 border-r border-slate-300 min-w-[85px] w-24">TANGGAL</th>
                        <th className="py-2 px-4 border-r border-slate-300 min-w-[280px]">KETERANGAN TRANSAKSI</th>
                        <th className="py-2 px-2.5 border-r border-slate-300 text-center w-16">AKUN DB</th>
                        <th className="py-2 px-2.5 border-r border-slate-300 text-center w-16">AKUN KR</th>
                        <th className="py-2 px-4 border-r border-slate-300 text-right min-w-[130px]">DEBET</th>
                        <th className="py-2 px-4 border-r border-slate-300 text-right min-w-[130px]">KREDIT</th>
                        <th className="py-2 px-2.5 text-center w-20">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Section Header Row: Styled based on grouping mode */}
                      <tr
                        className={`${
                          viewGroupBy === 'sumber'
                            ? groupName === 'Mutasi Bank'
                              ? 'bg-[#00899B] text-white'
                              : groupName === 'Transaksi Salur'
                              ? 'bg-emerald-700 text-white'
                              : groupName === 'Transaksi Donasi'
                              ? 'bg-amber-600 text-white'
                              : groupName === 'Transaksi Ajar'
                              ? 'bg-purple-700 text-white'
                              : 'bg-rose-700 text-white'
                            : viewGroupBy === 'all'
                            ? 'bg-[#00899B] text-white'
                            : 'bg-[#8ec31f] text-slate-900'
                        } font-bold border-b border-slate-300`}
                      >
                        <td colSpan={7} className="py-1.5 px-3 text-xs tracking-wide">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold">{groupName}</span>
                            <span className="text-[11px] font-mono opacity-90 font-semibold">
                              ({entries.length} entri jurnal)
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Entries within this bank */}
                      {entries.map((entry) => {
                        const isReversed = entry.isReversed;
                        const isReversalEntry = entry.isReversalEntry;

                        return (
                          <React.Fragment key={entry.id}>
                            {/* Main Entry header sub-bar (shows entry number and metadata tag) */}
                            <tr className={`border-t border-slate-300 ${isReversed ? 'bg-rose-50/50 opacity-75' : isReversalEntry ? 'bg-amber-50/50' : 'bg-slate-50/40'}`}>
                              <td colSpan={7} className="py-1 px-3 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <strong className="text-slate-800 font-bold">{entry.nomorJurnal}</strong>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    entry.sumberTransaksi === 'Mutasi Bank'
                                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                      : entry.sumberTransaksi === 'Transaksi Salur'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : entry.sumberTransaksi === 'Transaksi Donasi'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : entry.sumberTransaksi === 'Transaksi Ajar'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}>
                                    {entry.sumberTransaksi}
                                  </span>
                                  <span>• Rek: {entry.rekeningBank}</span>
                                  <span>• Ref: {entry.nomorReferensiBank}</span>
                                  <span>• Program: {entry.programKegiatan}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-sans">{entry.kategoriDana}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ✓ Seimbang: Rp {(entry.totalDebet ?? entry.lines.reduce((s, l) => s + l.nominalDebet, 0)).toLocaleString('id-ID')}
                                  </span>
                                  {isReversed && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                                      Dibalikkan oleh {entry.reversedByNomorJurnal}
                                    </span>
                                  )}
                                  {isReversalEntry && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                      Jurnal Pembalik dari {entry.reversalOfNomorJurnal}
                                    </span>
                                  )}
                                  <span className="text-slate-400 font-sans">Posting: {entry.waktuPosting}</span>
                                </div>
                              </td>
                            </tr>

                            {/* Lines of this entry */}
                            {entry.lines.map((line, idx) => {
                              const isFirstLine = idx === 0;
                              return (
                                <tr
                                  key={line.id}
                                  className="hover:bg-slate-50/80 transition-colors border-b border-slate-200 text-slate-800"
                                >
                                  {/* Date: only on first line */}
                                  <td className="py-1.5 px-3 border-r border-slate-200 align-top font-mono text-[11px]">
                                    {isFirstLine ? entry.tanggalJurnal : ''}
                                  </td>

                                  {/* Keterangan Transaksi: indent if it's credit line, matching screenshot */}
                                  <td className="py-1.5 px-4 border-r border-slate-200 align-top">
                                    <div className={`${line.kodeAkunKr ? 'pl-6 text-slate-700 font-medium' : 'text-slate-900 font-normal'}`}>
                                      {line.keterangan || line.namaAkun}
                                    </div>
                                  </td>

                                  {/* Akun DB */}
                                  <td className="py-1.5 px-2.5 border-r border-slate-200 text-center font-mono align-top text-slate-700">
                                    {line.kodeAkunDb || ''}
                                  </td>

                                  {/* Akun KR */}
                                  <td className="py-1.5 px-2.5 border-r border-slate-200 text-center font-mono align-top text-slate-700">
                                    {line.kodeAkunKr || ''}
                                  </td>

                                  {/* Debet */}
                                  <td className="py-1.5 px-4 border-r border-slate-200 text-right font-mono align-top">
                                    {line.nominalDebet > 0 ? (
                                      isPrivacyMasked ? '••••' : `Rp ${line.nominalDebet.toLocaleString('id-ID')}`
                                    ) : ''}
                                  </td>

                                  {/* Kredit */}
                                  <td className="py-1.5 px-4 border-r border-slate-200 text-right font-mono align-top">
                                    {line.nominalKredit > 0 ? (
                                      isPrivacyMasked ? '••••' : `Rp ${line.nominalKredit.toLocaleString('id-ID')}`
                                    ) : ''}
                                  </td>

                                  {/* Actions: on first line */}
                                  <td className="py-1.5 px-2 text-center align-top">
                                    {isFirstLine && (
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedJournalForDetail(entry)}
                                          title="Lihat Rincian Lengkap"
                                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                        </button>

                                        {!entry.isReversed && !entry.isReversalEntry && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedJournalForReversal(entry);
                                              setReversalReasonInput('');
                                            }}
                                            title="Buat Jurnal Pembalik (Reverse Journal)"
                                            className="p-1 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: RINGKASAN JURNAL (Konsolidasi Debet-Kredit Mutasi & Transaksi) */}
      {/* ============================================================== */}
      {activeTab === 'ringkasanJurnal' && (
        <RingkasanJurnalConsolidatedView
          journalEntries={journalEntries}
          coaList={computedCoaList}
          isPrivacyMasked={isPrivacyMasked}
          onOpenPdfModal={() => setIsExportPdfModalOpen(true)}
          onSelectJournalDetail={(entry) => setSelectedJournalForDetail(entry)}
          onNavigateToSource={(source) => {
            if (source === 'mutasi' && onNavigateToMutasi) onNavigateToMutasi('BCA 888');
          }}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 3: MANAJEMEN (Laporan Keuangan Manajemen) */}
      {/* ============================================================== */}
      {activeTab === 'manajemen' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Pendapatan Berjalan
              </span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {isPrivacyMasked ? '••••' : formatRupiah(coaTotals.totalPendapatan)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Donasi, Penjualan Buku, Jasa
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Biaya Program
              </span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {isPrivacyMasked ? '••••' : formatRupiah(coaTotals.totalBiayaProgram)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Penerbitan, Teks Dharma, Event
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Biaya Operasional
              </span>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {isPrivacyMasked ? '••••' : formatRupiah(coaTotals.totalBiayaOperasional)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Gaji, Logistik, Kantor & Utilitas
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Surplus / (Defisit) Bersih
              </span>
              <div
                className={`text-xl font-bold mt-1 ${
                  coaTotals.surplusDefisit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {isPrivacyMasked ? '••••' : formatRupiah(coaTotals.surplusDefisit)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Kinerja Finansial Manajemen
              </span>
            </div>
          </div>

          {/* Quick link banner to Dashboard Arus Kas Recharts */}
          <div className="bg-linear-to-r from-teal-50 via-white to-emerald-50 border border-teal-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#05828e] text-white flex items-center justify-center shrink-0 shadow-xs">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Dashboard Visualisasi Arus Kas (Recharts)
                </h4>
                <p className="text-xs text-slate-500">
                  Pantau tren perbandingan arus kas masuk (pemasukan) dan keluar (pengeluaran) per bulan secara dinamis.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('arusKas')}
              className="bg-[#05828e] hover:bg-[#046c76] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <span>Buka Grafik Arus Kas</span>
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Performance & Program Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Program Realization */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#05828e]" />
                Kinerja Realisasi Program & Kegiatan Yayasan
              </h3>
              <div className="space-y-3.5 text-xs">
                {[
                  { name: 'Penerbitan & Distribusi Buku Dharma', cost: 18500000, color: 'bg-emerald-500', pct: '42%' },
                  { name: 'Pelestarian & Penerjemahan Teks Dharma', cost: 12400000, color: 'bg-blue-500', pct: '28%' },
                  { name: 'Kegiatan Retret & Event Waisak', cost: 8650000, color: 'bg-indigo-500', pct: '19%' },
                  { name: 'Edukasi & Pelatihan Ajar', cost: 4800000, color: 'bg-amber-500', pct: '11%' },
                ].map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>{p.name}</span>
                      <span>{isPrivacyMasked ? '••••' : formatRupiah(p.cost)} ({p.pct})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full`} style={{ width: p.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Operational Expense Ratio */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#05828e]" />
                Rasio Efisiensi Pengeluaran Yayasan
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">Alokasi Biaya Program thd Total Beban</span>
                  <span className="text-sm font-bold text-emerald-700">76.4%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '76.4%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Sangat Efisien: Standar tata kelola yayasan mensyaratkan biaya program minimal &gt; 70% dari total pengeluaran yayasan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Biaya SDM & Honor</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">Rp 24.500.000</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Logistik & Distribusi</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">Rp 12.850.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SUMMARY (Ringkasan Laporan Keuangan) */}
      {/* ============================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Accounting Equation Banner: Aktiva = Kewajiban + Ekuitas */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest block">
                  Persamaan Dasar Akuntansi
                </span>
                <h2 className="text-lg font-bold mt-0.5">
                  AKTIVA = KEWAJIBAN + EKUITAS
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Neraca Keuangan Yayasan Pelestarian dan Pengembangan Lamrim Nusantara
                </p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold self-start md:self-auto">
                <Check className="w-4 h-4" />
                <span>Terverifikasi Seimbang</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-700/80">
              <div>
                <span className="text-[11px] text-slate-400 block">TOTAL AKTIVA (ASET)</span>
                <span className="text-xl font-extrabold text-white">
                  {isPrivacyMasked ? '••••' : formatRupiah(coaTotals.totalAktiva)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">TOTAL KEWAJIBAN (HUTANG)</span>
                <span className="text-xl font-extrabold text-rose-300">
                  {isPrivacyMasked ? '••••' : formatRupiah(coaTotals.totalKewajiban)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">TOTAL EKUITAS (SALDO DANA)</span>
                <span className="text-xl font-extrabold text-teal-300">
                  {isPrivacyMasked ? '••••' : formatRupiah(coaTotals.totalEkuitas)}
                </span>
              </div>
            </div>
          </div>

          {/* Ringkasan Jurnal Konsolidasian: Mutasi, S-SALUR, D-DONASI, A-AJAR */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#05828e]" />
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Ringkasan Konsolidasi Jurnal Umum (Format Tabel Debit - Kredit)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ringkasanJurnal')}
                className="text-xs font-semibold text-[#05828e] hover:text-[#046e78] flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
              >
                <span>Buka Matriks Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold text-[10.5px] uppercase">
                    <th className="py-2.5 px-4 border-r border-slate-200">SUMBER TRANSAKSI</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center">JML ENTRI</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 text-right">TOTAL DEBET</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 text-right">TOTAL KREDIT</th>
                    <th className="py-2.5 px-3 text-center">STATUS KESEIMBANGAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      Mutasi Bank (Rekening Koran)
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600 font-semibold">
                      {journalSourceStats.mutasiBank.count} Jurnal
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.mutasiBank.total)}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.mutasiBank.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <Check className="w-3 h-3" /> Seimbang
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      Transaksi S-SALUR (Penerbitan & Distribusi)
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600 font-semibold">
                      {journalSourceStats.salur.count} Jurnal
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.salur.total)}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.salur.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <Check className="w-3 h-3" /> Seimbang
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      Transaksi Donasi (D-DONASI)
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600 font-semibold">
                      {journalSourceStats.donasi.count} Jurnal
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.donasi.total)}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.donasi.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <Check className="w-3 h-3" /> Seimbang
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      Transaksi A-AJAR (Kelas & Retret)
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600 font-semibold">
                      {journalSourceStats.ajar.count} Jurnal
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.ajar.total)}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.ajar.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <Check className="w-3 h-3" /> Seimbang
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 border-r border-slate-200 font-semibold text-slate-800">
                      Pengeluaran Proyek & Operasional
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-600 font-semibold">
                      {journalSourceStats.pengeluaran.count} Jurnal
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.pengeluaran.total)}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(journalSourceStats.pengeluaran.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <Check className="w-3 h-3" /> Seimbang
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Summary Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aktiva Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wide">
                Rincian Posisi Aktiva (Aset)
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Kas & Setara Kas (Bank BCA & Mandiri)</span>
                  <span className="font-mono font-bold text-slate-800">Rp 957.043.198</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Deposito Berjangka</span>
                  <span className="font-mono font-bold text-slate-800">Rp 375.056.599</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Piutang Donatur / Salur</span>
                  <span className="font-mono font-bold text-slate-800">Rp 70.253.164</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Persediaan Buku & Kaos</span>
                  <span className="font-mono font-bold text-slate-800">Rp 321.717.363</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Aset Tetap & Perlengkapan (Net Akumulasi)</span>
                  <span className="font-mono font-bold text-slate-800">Rp 34.637.254</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-slate-900">
                  <span>Total Aktiva</span>
                  <span className="font-mono text-emerald-700">{formatRupiah(coaTotals.totalAktiva)}</span>
                </div>
              </div>
            </div>

            {/* Kewajiban & Ekuitas Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wide">
                Rincian Kewajiban & Saldo Dana (Ekuitas)
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Hutang Dagang Percetakan</span>
                  <span className="font-mono font-bold text-slate-800">Rp 83.153.500</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Hutang Lain-lain</span>
                  <span className="font-mono font-bold text-slate-800">Rp 284.928.170</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Pendapatan Diterima Dimuka</span>
                  <span className="font-mono font-bold text-slate-800">Rp 61.167.318</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Saldo Dana Terikat Program</span>
                  <span className="font-mono font-bold text-slate-800">Rp 1.850.000.000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Saldo Dana Tidak Terikat & Modal</span>
                  <span className="font-mono font-bold text-slate-800">Rp 1.183.495.236</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-slate-900">
                  <span>Total Kewajiban + Ekuitas</span>
                  <span className="font-mono text-teal-700">
                    {formatRupiah(coaTotals.totalKewajiban + coaTotals.totalEkuitas)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SALDO AKHIR (Berdasarkan Kategori Rekening & Dana) */}
      {/* ============================================================== */}
      {activeTab === 'saldoAkhir' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Rekapitulasi Saldo Akhir Berdasarkan Kategori Rekening & Dana
            </h3>
            <p className="text-xs text-slate-500">
              Klasifikasi saldo berdasarkan restriksi amanah donatur (Dana Terikat vs Dana Bebas / Operasional)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dana Terikat */}
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-100">
                <span className="text-xs font-bold text-blue-900 uppercase">Dana Terikat (Restricted)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Amanah</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Dana yang diperuntukkan khusus untuk program tertentu sesuai niat donatur.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kas BCA Penerbitan</span>
                  <span className="font-mono font-bold text-slate-800">Rp 641.221.612</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kas BCA Kegiatan Dharma</span>
                  <span className="font-mono font-bold text-slate-800">Rp 2.104.168.288</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kas Tunai Penerbitan</span>
                  <span className="font-mono font-bold text-slate-800">Rp 2.000.000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-blue-900">
                  <span>Total Dana Terikat</span>
                  <span className="font-mono">Rp 2.747.389.900</span>
                </div>
              </div>
            </div>

            {/* Dana Tidak Terikat */}
            <div className="bg-white border border-teal-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-100">
                <span className="text-xs font-bold text-teal-900 uppercase">Dana Tidak Terikat</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">Fleksibel</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Dana operasional bebas yang dapat digunakan untuk operasional yayasan secara fleksibel.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kas BCA Operasional (Non-Dharma)</span>
                  <span className="font-mono font-bold text-slate-800">(Rp 1.739.794.709)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kas Operasional Tunai</span>
                  <span className="font-mono font-bold text-slate-800">Rp 10.000.000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-teal-900">
                  <span>Total Dana Bebas</span>
                  <span className="font-mono">(Rp 1.729.794.709)</span>
                </div>
              </div>
            </div>

            {/* Dana Abadi & Deposito */}
            <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100">
                <span className="text-xs font-bold text-purple-900 uppercase">Cadangan & Deposito</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Cadangan</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Simpanan berjangka untuk ketahanan kas jangka menengah dan dana abadi program.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Deposito Teks Dharma</span>
                  <span className="font-mono font-bold text-slate-800">Rp 340.000.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Deposito Operasional</span>
                  <span className="font-mono font-bold text-slate-800">Rp 35.056.599</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-purple-900">
                  <span>Total Deposito</span>
                  <span className="font-mono">Rp 375.056.599</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: Saldo Per Rekening */}
      {/* ============================================================== */}
      {activeTab === 'saldoPerRekening' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Saldo Setiap Rekening Bank & Kas Tunai
              </h3>
              <p className="text-xs text-slate-500">
                Daftar posisi saldo terkini setiap akun kas, rekening bank, dan deposito
              </p>
            </div>
            {onNavigateToMutasi && (
              <button
                type="button"
                onClick={() => onNavigateToMutasi('BCA 888')}
                className="bg-teal-50 hover:bg-teal-100 text-[#05828e] border border-teal-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Mutasi Rekening BCA 888</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3 border-r border-slate-300 w-20">KODE</th>
                    <th className="py-2.5 px-4 border-r border-slate-300 min-w-[200px]">NAMA REKENING / KAS</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 min-w-[140px]">KATEGORI DANA</th>
                    <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[130px]">SALDO AWAL</th>
                    <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[110px]">DEBET</th>
                    <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[110px]">KREDIT</th>
                    <th className="py-2.5 px-4 text-right min-w-[130px]">SALDO AKHIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bankBalances.map((acc) => (
                    <tr key={acc.code} className="hover:bg-teal-50/30 transition-colors">
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-700">
                        {acc.code}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 font-medium text-slate-800">
                        {acc.name}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {acc.category}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-slate-700">
                        {isPrivacyMasked ? '••••' : formatRupiah(acc.initial)}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-emerald-600 font-semibold">
                        {isPrivacyMasked ? '••••' : acc.totalDebet > 0 ? formatRupiah(acc.totalDebet) : '-'}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-rose-600 font-semibold">
                        {isPrivacyMasked ? '••••' : acc.totalKredit > 0 ? formatRupiah(acc.totalKredit) : '-'}
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                        {isPrivacyMasked ? '••••' : formatRupiah(acc.endingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: DASHBOARD ARUS KAS (CASH FLOW) DENGAN RECHARTS */}
      {/* ============================================================== */}
      {activeTab === 'arusKas' && (
        <DashboardArusKas
          mutasiItems={mutasiItems}
          pengeluaranList={pengeluaranList}
          salurOrders={salurOrders}
          donasiOrders={donasiOrders}
          transaksiAjarList={transaksiAjarList}
          journalEntries={journalEntries}
          coaList={computedCoaList}
          isPrivacyMasked={isPrivacyMasked}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL: Tambah Akun COA Baru */}
      {/* ============================================================== */}
      {isAddCoaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-800">Tambah Akun COA Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddCoaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Akun (Kode)</label>
                <input
                  type="text"
                  value={newCoaForm.noAkun}
                  onChange={(e) => setNewCoaForm({ ...newCoaForm, noAkun: e.target.value })}
                  placeholder="Contoh: 10207 / 60800"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Akun</label>
                <input
                  type="text"
                  value={newCoaForm.namaAkun}
                  onChange={(e) => setNewCoaForm({ ...newCoaForm, namaAkun: e.target.value })}
                  placeholder="Contoh: Kas BCA Rekening Baru"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kelompok Akun</label>
                  <select
                    value={newCoaForm.kelompok}
                    onChange={(e) => setNewCoaForm({ ...newCoaForm, kelompok: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 outline-none"
                  >
                    <option value="AKTIVA">AKTIVA</option>
                    <option value="KEWAJIBAN">KEWAJIBAN</option>
                    <option value="EKUITAS">EKUITAS</option>
                    <option value="PENDAPATAN">PENDAPATAN</option>
                    <option value="BIAYA PROGRAM">BIAYA PROGRAM</option>
                    <option value="BIAYA OPERASIONAL">BIAYA OPERASIONAL</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pos Saldo Normal</label>
                  <select
                    value={newCoaForm.pos}
                    onChange={(e) => setNewCoaForm({ ...newCoaForm, pos: e.target.value as 'D' | 'K' })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 outline-none font-bold"
                  >
                    <option value="D">D (Debet)</option>
                    <option value="K">K (Kredit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Saldo Awal</label>
                <input
                  type="number"
                  value={newCoaForm.pos === 'D' ? newCoaForm.saldoAwalDebet || '' : newCoaForm.saldoAwalKredit || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (newCoaForm.pos === 'D') {
                      setNewCoaForm({ ...newCoaForm, saldoAwalDebet: val, saldoAwalKredit: 0 });
                    } else {
                      setNewCoaForm({ ...newCoaForm, saldoAwalKredit: val, saldoAwalDebet: 0 });
                    }
                  }}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-mono outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddCoaModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewCoa}
                className="px-4 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Simpan Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Buat Jurnal Pembalik (Reverse Journal) */}
      {/* ============================================================== */}
      {selectedJournalForReversal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/70">
              <div className="flex items-center gap-2 text-rose-800">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold">Buat Jurnal Pembalik (Audit Correction)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJournalForReversal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">Jurnal Yang Dikoreksi:</span>
                <p className="font-mono text-slate-700 mt-0.5">{selectedJournalForReversal.nomorJurnal}</p>
                <p className="text-slate-600 mt-1">{selectedJournalForReversal.keteranganTransaksi}</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alasan Koreksi / Pembalikan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reversalReasonInput}
                  onChange={(e) => setReversalReasonInput(e.target.value)}
                  placeholder="Contoh: Koreksi salah nomor akun atau salah penginputan nominal..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Sesuai kebijakan audit, jurnal asli tetap tersimpan dengan status 'Dibalikkan', dan entri pembalik otomatis diposting dengan posisi Debet & Kredit ditukar.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedJournalForReversal(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReversal}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Posting Pembalik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Detail Metadata Lengkap Jurnal (15 Field Minimal) */}
      {/* ============================================================== */}
      {selectedJournalForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#05828e]" />
                <h3 className="text-sm font-bold text-slate-800">
                  Rincian Metadata Jurnal Umum ({selectedJournalForDetail.nomorJurnal})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJournalForDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">1. Nomor Jurnal</span>
                  <span className="font-mono font-bold text-slate-800">{selectedJournalForDetail.nomorJurnal}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">2. Tanggal Jurnal</span>
                  <span className="font-semibold text-slate-800">{selectedJournalForDetail.tanggalJurnal}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">3. Referensi Bank</span>
                  <span className="font-mono font-semibold text-slate-700">{selectedJournalForDetail.nomorReferensiBank}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">4. Rekening Bank</span>
                  <span className="font-semibold text-slate-800">{selectedJournalForDetail.rekeningBank}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">5. Program / Kegiatan</span>
                  <span className="font-semibold text-slate-800">{selectedJournalForDetail.programKegiatan}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">6. Kategori Dana</span>
                  <span className="font-semibold text-slate-800">{selectedJournalForDetail.kategoriDana}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">7. Sumber Transaksi</span>
                  <span className="font-semibold text-slate-800">{selectedJournalForDetail.sumberTransaksi}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">8. Status Persetujuan</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedJournalForDetail.statusPersetujuan === 'Disetujui'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedJournalForDetail.statusPersetujuan === 'Dibalikkan'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedJournalForDetail.statusPersetujuan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">9. Pengguna Menyetujui</span>
                  <span className="font-semibold text-slate-800">{selectedJournalForDetail.penggunaMenyetujui}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">10. Waktu Posting</span>
                  <span className="font-semibold text-slate-800">{selectedJournalForDetail.waktuPosting}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">
                  11. Keterangan & Rincian Baris Debet / Kredit
                </span>
                <p className="font-semibold text-slate-800 mb-2">{selectedJournalForDetail.keteranganTransaksi}</p>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="py-1.5 px-3">Kode</th>
                        <th className="py-1.5 px-3">Akun</th>
                        <th className="py-1.5 px-3 text-right">Debet</th>
                        <th className="py-1.5 px-3 text-right">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedJournalForDetail.lines.map((l) => (
                        <tr key={l.id}>
                          <td className="py-1 px-3 font-mono text-slate-600">{l.kodeAkunDb || l.kodeAkunKr}</td>
                          <td className="py-1 px-3 text-slate-800">{l.namaAkun || l.keterangan}</td>
                          <td className="py-1 px-3 text-right font-mono">{l.nominalDebet > 0 ? formatRupiah(l.nominalDebet) : '-'}</td>
                          <td className="py-1 px-3 text-right font-mono">{l.nominalKredit > 0 ? formatRupiah(l.nominalKredit) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedJournalForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ekspor PDF Laporan Keuangan (Arus Kas, Pos Keuangan & Jurnal Umum) */}
      <ModalExportPdfLaporanKeuangan
        isOpen={isExportPdfModalOpen}
        onClose={() => setIsExportPdfModalOpen(false)}
        reportData={{
          coaTotals,
          journalEntries,
          journalSourceStats,
          bankBalances,
          posKeuanganList,
        }}
        initialPrivacyMasked={isPrivacyMasked}
        onShowToast={showToast}
      />
    </div>
  );
};
