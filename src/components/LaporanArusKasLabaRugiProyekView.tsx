import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Search,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronRight,
  Landmark,
  Receipt,
  Calendar,
} from 'lucide-react';
import {
  MutasiItem,
  PengeluaranItem,
  ProjectItem,
} from '../types';
import { SalurOrder, SalurProduct } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { ItemDonasiEvent } from '../itemDonasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { ItemAjarEvent } from '../itemAjarData';
import {
  formatDateRangeLabel,
} from '../utils/financialDateFilter';
import {
  computeProjectFinancialReport,
  exportProjectFinancialCsv,
  exportProjectFinancialPdf,
  formatIdrRupiah,
  ProjectFinancialSource,
  ProjectFinancialSummary,
  UNASSIGNED_PROJECT_ID,
} from '../utils/projectFinancialReportHelper';

interface LaporanArusKasLabaRugiProyekViewProps {
  projects: ProjectItem[];
  salurOrders: SalurOrder[];
  salurItems: SalurProduct[];
  donasiOrders: DonasiOrder[];
  itemDonasiEvents: ItemDonasiEvent[];
  transaksiAjarList: TransaksiAjarItem[];
  itemAjarEvents: ItemAjarEvent[];
  mutasiItems: MutasiItem[];
  pengeluaranList: PengeluaranItem[];
  initialSelectedProjectId?: string;
  onShowToast?: (msg: string) => void;
  onNavigateToLaporanKeuangan?: () => void;
}

type ViewTab = 'overview' | 'detail';
type SortField =
  | 'nama'
  | 'pendapatan'
  | 'biaya'
  | 'labaRugi'
  | 'arusKas'
  | 'margin';

export const LaporanArusKasLabaRugiProyekView: React.FC<
  LaporanArusKasLabaRugiProyekViewProps
> = ({
  projects,
  salurOrders,
  salurItems,
  donasiOrders,
  itemDonasiEvents,
  transaksiAjarList,
  itemAjarEvents,
  mutasiItems,
  pengeluaranList,
  initialSelectedProjectId,
  onShowToast,
  onNavigateToLaporanKeuangan,
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>(
    initialSelectedProjectId ? 'detail' : 'overview'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeUnassigned, setIncludeUnassigned] = useState<boolean>(false);
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(false);

  const [sortField, setSortField] = useState<SortField>('pendapatan');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialSelectedProjectId || ''
  );
  const [ledgerSourceFilter, setLedgerSourceFilter] = useState<
    'ALL' | ProjectFinancialSource
  >('ALL');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');

  const report = useMemo(() => {
    return computeProjectFinancialReport({
      projects,
      salurOrders,
      salurItems,
      donasiOrders,
      itemDonasiEvents,
      transaksiAjarList,
      itemAjarEvents,
      mutasiItems,
      pengeluaranList,
      startDate,
      endDate,
      includeUnassignedInTotals: includeUnassigned,
    });
  }, [
    projects,
    salurOrders,
    salurItems,
    donasiOrders,
    itemDonasiEvents,
    transaksiAjarList,
    itemAjarEvents,
    mutasiItems,
    pengeluaranList,
    startDate,
    endDate,
    includeUnassigned,
  ]);

  const divisiOptions = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.divisi) set.add(p.divisi.toUpperCase());
    });
    return Array.from(set).sort();
  }, [projects]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.status) set.add(p.status);
    });
    return Array.from(set).sort();
  }, [projects]);

  const filteredSummaries = useMemo(() => {
    const baseList: ProjectFinancialSummary[] = includeUnassigned
      ? [...report.projectSummaries, report.unassignedSummary]
      : [...report.projectSummaries];

    const q = searchQuery.toLowerCase().trim();
    const filtered = baseList.filter((item) => {
      if (
        selectedDivisi !== 'ALL' &&
        (item.divisi || '').toUpperCase() !== selectedDivisi
      ) {
        return false;
      }
      if (
        selectedStatus !== 'ALL' &&
        !item.isUnassignedBucket &&
        (item.status || '').toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        const hay = `${item.projectName} ${item.divisi} ${item.jenisProyek} ${item.lokasi}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nama') {
        cmp = a.projectName.localeCompare(b.projectName);
      } else if (sortField === 'pendapatan') {
        cmp = a.totalPendapatan - b.totalPendapatan;
      } else if (sortField === 'biaya') {
        cmp = a.totalBiaya - b.totalBiaya;
      } else if (sortField === 'labaRugi') {
        cmp = a.labaRugiBersih - b.labaRugiBersih;
      } else if (sortField === 'arusKas') {
        cmp = a.arusKasBersih - b.arusKasBersih;
      } else if (sortField === 'margin') {
        cmp = a.marginPersen - b.marginPersen;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [
    report,
    includeUnassigned,
    selectedDivisi,
    selectedStatus,
    searchQuery,
    sortField,
    sortDir,
  ]);

  const filteredTotals = useMemo(() => {
    let totalPendapatan = 0;
    let totalBiaya = 0;
    let arusKasMasuk = 0;
    let arusKasKeluar = 0;
    let piutangBelumBayar = 0;
    let profitable = 0;
    let deficit = 0;

    filteredSummaries.forEach((s) => {
      totalPendapatan += s.totalPendapatan;
      totalBiaya += s.totalBiaya;
      arusKasMasuk += s.arusKasMasuk;
      arusKasKeluar += s.arusKasKeluar;
      piutangBelumBayar += s.piutangBelumBayar;
      if (s.totalPendapatan > 0 || s.totalBiaya > 0) {
        if (s.labaRugiBersih >= 0) profitable++;
        else deficit++;
      }
    });

    const labaRugiBersih = totalPendapatan - totalBiaya;
    const marginPersen =
      totalPendapatan > 0
        ? Number(((labaRugiBersih / totalPendapatan) * 100).toFixed(1))
        : 0;

    return {
      totalPendapatan,
      totalBiaya,
      labaRugiBersih,
      marginPersen,
      arusKasMasuk,
      arusKasKeluar,
      arusKasBersih: arusKasMasuk - arusKasKeluar,
      piutangBelumBayar,
      profitableProjectCount: profitable,
      deficitProjectCount: deficit,
    };
  }, [filteredSummaries]);

  const activeDetailProject: ProjectFinancialSummary | null = useMemo(() => {
    const allChoices = [...report.projectSummaries, report.unassignedSummary];
    if (selectedProjectId) {
      const found = allChoices.find((p) => p.projectId === selectedProjectId);
      if (found) return found;
    }
    return filteredSummaries[0] || report.projectSummaries[0] || null;
  }, [selectedProjectId, report, filteredSummaries]);

  const activeLedgerEntries = useMemo(() => {
    if (!activeDetailProject) return [];
    const q = ledgerSearchQuery.toLowerCase().trim();
    return activeDetailProject.entries.filter((e) => {
      if (ledgerSourceFilter !== 'ALL' && e.source !== ledgerSourceFilter) {
        return false;
      }
      if (q) {
        const hay = `${e.kode} ${e.keterangan} ${e.status} ${e.date}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeDetailProject, ledgerSourceFilter, ledgerSearchQuery]);

  const topProjectsChartData = useMemo(() => {
    return [...filteredSummaries]
      .filter((s) => s.totalPendapatan > 0 || s.totalBiaya > 0)
      .sort(
        (a, b) =>
          b.totalPendapatan + b.totalBiaya - (a.totalPendapatan + a.totalBiaya)
      )
      .slice(0, 8)
      .map((s) => ({
        name:
          s.projectName.length > 18
            ? `${s.projectName.slice(0, 16)}..`
            : s.projectName,
        fullName: s.projectName,
        Pendapatan: s.totalPendapatan,
        Biaya: s.totalBiaya,
        LabaRugi: s.labaRugiBersih,
      }));
  }, [filteredSummaries]);

  const activeCashflowSeries = useMemo(() => {
    if (activeTab === 'detail' && activeDetailProject) {
      return activeDetailProject.monthlySeries;
    }
    return report.aggregatedMonthlySeries;
  }, [activeTab, activeDetailProject, report.aggregatedMonthlySeries]);

  const displayRp = (val: number) => {
    if (isPrivacyMasked) return 'Rp ••••••';
    return formatIdrRupiah(val);
  };

  const formatShortAxisRp = (val: number) => {
    if (isPrivacyMasked) return '••';
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
    if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
    if (abs >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
    return String(val);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleOpenProjectDetail = (projectId: string) => {
    setSelectedProjectId(projectId);
    setLedgerSourceFilter('ALL');
    setLedgerSearchQuery('');
    setActiveTab('detail');
  };

  const handleApplyPresetPeriod = (
    preset: 'all' | '2021' | 'this_month' | 'this_year'
  ) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = String(
      new Date(yyyy, now.getMonth() + 1, 0).getDate()
    ).padStart(2, '0');

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === '2021') {
      setStartDate('2021-01-01');
      setEndDate('2021-12-31');
    } else if (preset === 'this_month') {
      setStartDate(`${yyyy}-${mm}-01`);
      setEndDate(`${yyyy}-${mm}-${lastDay}`);
    } else {
      setStartDate(`${yyyy}-01-01`);
      setEndDate(`${yyyy}-12-31`);
    }
  };

  const periodLabel = formatDateRangeLabel(startDate, endDate);

  const handleExportCsv = () => {
    const rows =
      activeTab === 'detail' && activeDetailProject
        ? [activeDetailProject]
        : filteredSummaries;
    const filename = exportProjectFinancialCsv(rows, periodLabel);
    onShowToast?.(`File CSV "${filename}" berhasil diunduh.`);
  };

  const handleExportPdf = () => {
    const filename = exportProjectFinancialPdf(
      filteredSummaries,
      filteredTotals,
      periodLabel,
      activeTab === 'detail' ? activeDetailProject : null
    );
    onShowToast?.(`Laporan PDF "${filename}" berhasil diunduh.`);
  };

  const sourceLabel = (src: ProjectFinancialSource) => {
    if (src === 'salur') return 'S-SALUR';
    if (src === 'donasi') return 'D-DONASI';
    if (src === 'ajar') return 'A-AJAR';
    if (src === 'mutasi') return 'Mutasi Bank';
    return 'Pengeluaran Kas';
  };

  return (
    <div className="w-full space-y-5 pb-12 text-slate-800 dark:text-slate-100">
      {/* Top Workspace Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Laporan Arus Kas &amp; Laba Rugi Proyek SAPA
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Konsolidasi pendapatan S-SALUR, D-DONASI, A-AJAR, mutasi bank, dan pengeluaran kas per Proyek SAPA · Periode {periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToLaporanKeuangan && (
            <button
              type="button"
              onClick={onNavigateToLaporanKeuangan}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-[#05828e]" />
              <span>Laporan COA Yayasan</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPrivacyMasked((v) => !v)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title={isPrivacyMasked ? 'Tampilkan Nominal' : 'Samarkan Nominal'}
          >
            {isPrivacyMasked ? (
              <Eye className="w-3.5 h-3.5 text-[#05828e]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{isPrivacyMasked ? 'Tampilkan' : 'Samarkan'}</span>
          </button>

          <button
            type="button"
            id="btn-export-proyek-csv"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            id="btn-export-proyek-pdf"
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Filters & Mode Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Mode Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              id="tab-proyek-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Rekap Semua Proyek ({filteredSummaries.length})
            </button>
            <button
              type="button"
              id="tab-proyek-detail"
              onClick={() => {
                if (!selectedProjectId && filteredSummaries[0]) {
                  setSelectedProjectId(filteredSummaries[0].projectId);
                }
                setActiveTab('detail');
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'detail'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Detail Laba Rugi &amp; Arus Kas per Proyek
            </button>
          </div>

          {/* Quick Period Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Periode:</span>
            </span>
            <button
              type="button"
              onClick={() => handleApplyPresetPeriod('all')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer ${
                !startDate && !endDate
                  ? 'border-[#05828e] bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetPeriod('2021')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer ${
                startDate === '2021-01-01' && endDate === '2021-12-31'
                  ? 'border-[#05828e] bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Tahun 2021
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetPeriod('this_month')}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetPeriod('this_year')}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              Tahun Ini
            </button>
          </div>
        </div>

        {/* Inputs Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama proyek, jenis, atau lokasi..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30"
            />
          </div>

          <select
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30"
          >
            <option value="ALL">Semua Divisi</option>
            {divisiOptions.map((d) => (
              <option key={d} value={d}>
                Divisi {d}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30"
          >
            <option value="ALL">Semua Status Proyek</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Tanggal Mulai"
            className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
          />

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Tanggal Akhir"
              className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
            />
            {(searchQuery ||
              selectedDivisi !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              startDate ||
              endDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDivisi('ALL');
                  setSelectedStatus('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
                title="Reset Filter"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeUnassigned}
              onChange={(e) => setIncludeUnassigned(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#05828e] rounded"
            />
            <span>
              Sertakan transaksi/mutasi non-proyek umum ({report.unassignedSummary.transactionCount} entri)
            </span>
          </label>
          <span className="tabular-nums">
            {filteredTotals.profitableProjectCount} proyek surplus ·{' '}
            {filteredTotals.deficitProjectCount} proyek defisit
          </span>
        </div>
      </div>

      {/* 4-Card KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Pendapatan Proyek
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {displayRp(filteredTotals.totalPendapatan)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            S-SALUR + D-DONASI + A-AJAR + Mutasi CR
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Biaya &amp; Kas Keluar
          </div>
          <div className="text-xl font-bold text-rose-700 dark:text-rose-400 font-mono tabular-nums">
            {displayRp(filteredTotals.totalBiaya)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            Pengeluaran Program, Operasional &amp; Mutasi DB
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Laba / Rugi Bersih (P&amp;L)</span>
            <span
              className={`font-semibold tabular-nums ${
                filteredTotals.labaRugiBersih >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              Margin {filteredTotals.marginPersen}%
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums flex items-center gap-1.5 ${
              filteredTotals.labaRugiBersih >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {filteredTotals.labaRugiBersih >= 0 ? (
              <TrendingUp className="w-4 h-4 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 shrink-0" />
            )}
            <span>{displayRp(filteredTotals.labaRugiBersih)}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {filteredTotals.labaRugiBersih >= 0
              ? 'Surplus bersih seluruh proyek terpilih'
              : 'Defisit bersih seluruh proyek terpilih'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Arus Kas Bersih (Realized Cash)
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums ${
              filteredTotals.arusKasBersih >= 0
                ? 'text-[#05828e] dark:text-teal-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {displayRp(filteredTotals.arusKasBersih)}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 tabular-nums">
            Piutang Belum Lunas: {displayRp(filteredTotals.piutangBelumBayar)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Chart: Perbandingan Laba Rugi per Proyek */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Perbandingan Pendapatan vs Biaya per Proyek
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maksimal 8 proyek dengan volume keuangan terbesar
              </p>
            </div>
          </div>

          {topProjectsChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Belum ada aktivitas keuangan proyek pada periode yang dipilih.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProjectsChartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={46}
                  />
                  <YAxis
                    tickFormatter={formatShortAxisRp}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    width={54}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      displayRp(Number(value) || 0),
                      String(name),
                    ]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName || ''
                    }
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey="Pendapatan"
                    fill="#05828e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="Biaya" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Chart: Tren Arus Kas Bulanan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeTab === 'detail' && activeDetailProject
                  ? `Tren Arus Kas Bulanan: ${activeDetailProject.projectName}`
                  : 'Tren Arus Kas Bulanan Seluruh Proyek'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kas masuk lunas, kas keluar, dan saldo kas kumulatif proyek
              </p>
            </div>
          </div>

          {activeCashflowSeries.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Belum ada pergerakan arus kas pada filter aktif.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={activeCashflowSeries}
                  margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tickFormatter={formatShortAxisRp}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    width={54}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      displayRp(Number(value) || 0),
                      String(name),
                    ]}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="saldoKumulatif"
                    name="Saldo Kumulatif"
                    fill="#05828e"
                    fillOpacity={0.14}
                    stroke="#05828e"
                    strokeWidth={2}
                  />
                  <Bar
                    dataKey="pemasukan"
                    name="Kas Masuk"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="pengeluaran"
                    name="Kas Keluar"
                    fill="#f43f5e"
                    radius={[3, 3, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="netCashflow"
                    name="Arus Kas Bersih"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: REKAP SEMUA PROYEK */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Matriks Laba Rugi &amp; Arus Kas per Proyek SAPA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik baris proyek untuk membuka Laporan Laba Rugi formal dan rincian transaksi
              </p>
            </div>
          </div>

          {filteredSummaries.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Tidak ada Proyek SAPA yang cocok dengan filter saat ini
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah kata kunci pencarian, divisi, atau rentang tanggal periode laporan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1060px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <th className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleSort('nama')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Proyek SAPA</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-2.5 px-3 text-right">S-SALUR</th>
                    <th className="py-2.5 px-3 text-right">D-DONASI</th>
                    <th className="py-2.5 px-3 text-right">A-AJAR</th>
                    <th className="py-2.5 px-3 text-right">Mutasi CR</th>
                    <th className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('pendapatan')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-auto"
                      >
                        <span>Total Pendapatan</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('biaya')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-auto"
                      >
                        <span>Total Biaya</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('labaRugi')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-auto"
                      >
                        <span>Laba / Rugi</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('arusKas')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer ml-auto"
                      >
                        <span>Arus Kas Bersih</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-2.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredSummaries.map((row) => (
                    <tr
                      key={row.projectId}
                      onClick={() => handleOpenProjectDetail(row.projectId)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 max-w-[260px]">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {row.projectName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          <span>{row.divisi}</span>
                          <span className="mx-1">·</span>
                          <span>{row.jenisProyek}</span>
                          <span className="mx-1">·</span>
                          <span>{row.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {displayRp(row.pendapatanSalur)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {displayRp(row.pendapatanDonasi)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {displayRp(row.pendapatanAjar)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {displayRp(row.pendapatanMutasi)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {displayRp(row.totalPendapatan)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-700 dark:text-rose-400">
                        {displayRp(row.totalBiaya)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <div
                          className={`font-bold ${
                            row.labaRugiBersih >= 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {displayRp(row.labaRugiBersih)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {row.marginPersen}% margin
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <div
                          className={`font-bold ${
                            row.arusKasBersih >= 0
                              ? 'text-[#05828e] dark:text-teal-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {displayRp(row.arusKasBersih)}
                        </div>
                        {row.piutangBelumBayar > 0 && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-400">
                            Piutang {displayRp(row.piutangBelumBayar)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProjectDetail(row.projectId);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:border-[#05828e] text-xs font-semibold text-[#05828e] dark:text-teal-300 cursor-pointer whitespace-nowrap"
                        >
                          <span>Detail P&amp;L</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      Total ({filteredSummaries.length} Proyek)
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {displayRp(
                        filteredSummaries.reduce((s, r) => s + r.pendapatanSalur, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {displayRp(
                        filteredSummaries.reduce((s, r) => s + r.pendapatanDonasi, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {displayRp(
                        filteredSummaries.reduce((s, r) => s + r.pendapatanAjar, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {displayRp(
                        filteredSummaries.reduce((s, r) => s + r.pendapatanMutasi, 0)
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                      {displayRp(filteredTotals.totalPendapatan)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-700 dark:text-rose-400">
                      {displayRp(filteredTotals.totalBiaya)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        filteredTotals.labaRugiBersih >= 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {displayRp(filteredTotals.labaRugiBersih)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono tabular-nums ${
                        filteredTotals.arusKasBersih >= 0
                          ? 'text-[#05828e] dark:text-teal-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {displayRp(filteredTotals.arusKasBersih)}
                    </td>
                    <td className="py-3 px-4" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DETAIL LABA RUGI & ARUS KAS PER PROYEK */}
      {activeTab === 'detail' && (
        <div className="space-y-4">
          {/* Selector Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pilih Proyek SAPA untuk Analisis Laporan Keuangan
              </label>
              <select
                id="select-detail-proyek-sapa"
                value={activeDetailProject?.projectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full sm:max-w-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#05828e]/30"
              >
                {report.projectSummaries.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.projectName} ({p.divisi} · {p.status})
                  </option>
                ))}
                <option value={UNASSIGNED_PROJECT_ID}>
                  {report.unassignedSummary.projectName} ({report.unassignedSummary.transactionCount} entri)
                </option>
              </select>
            </div>

            {activeDetailProject && (
              <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                <span>Divisi {activeDetailProject.divisi}</span>
                <span className="mx-1.5">·</span>
                <span>{activeDetailProject.jenisProyek}</span>
                <span className="mx-1.5">·</span>
                <span className="tabular-nums">
                  {activeDetailProject.transactionCount} transaksi terkait
                </span>
              </div>
            )}
          </div>

          {activeDetailProject && (
            <>
              {/* Formal Dual Statements: Laba Rugi & Arus Kas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* I. Laporan Laba Rugi (Profit & Loss Statement) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      I. Laporan Laba Rugi Proyek (Profit &amp; Loss)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeDetailProject.projectName} · {periodLabel}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">
                        Pendapatan Proyek
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Pendapatan Penjualan S-SALUR</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(activeDetailProject.pendapatanSalur)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Pendapatan Donasi D-DONASI</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(activeDetailProject.pendapatanDonasi)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Pendapatan Event &amp; Pelatihan A-AJAR</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(activeDetailProject.pendapatanAjar)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Mutasi Bank Kredit Langsung</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(activeDetailProject.pendapatanMutasi)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                        <span>Total Pendapatan Proyek</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(activeDetailProject.totalPendapatan)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">
                        Beban &amp; Pengeluaran Proyek
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Beban Program &amp; Produksi Langsung</span>
                        <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400">
                          {displayRp(-activeDetailProject.biayaProgram)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Beban Operasional &amp; Administrasi</span>
                        <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400">
                          {displayRp(-activeDetailProject.biayaOperasional)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Mutasi Bank Debet Langsung</span>
                        <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400">
                          {displayRp(-activeDetailProject.biayaMutasi)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-rose-700 dark:text-rose-400">
                        <span>Total Beban Proyek</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(-activeDetailProject.totalBiaya)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Laba / (Rugi) Bersih Proyek
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Net Margin: {activeDetailProject.marginPersen}%
                        </div>
                      </div>
                      <div
                        className={`text-base font-bold font-mono tabular-nums ${
                          activeDetailProject.labaRugiBersih >= 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {displayRp(activeDetailProject.labaRugiBersih)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* II. Laporan Arus Kas Langsung (Direct Cash Flow Statement) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      II. Laporan Arus Kas Proyek (Direct Cash Flow)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pergerakan kas masuk riil (Paid / Mutasi CR) dan kas keluar proyek
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">
                        Arus Kas Masuk (Cash Inflow)
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Penerimaan Kas S-SALUR, D-DONASI &amp; A-AJAR (Lunas)</span>
                        <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                          {displayRp(
                            activeDetailProject.arusKasMasuk -
                              activeDetailProject.pendapatanMutasi
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Penerimaan Mutasi Bank Kredit Langsung</span>
                        <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                          {displayRp(activeDetailProject.pendapatanMutasi)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-emerald-700 dark:text-emerald-400">
                        <span>Total Arus Kas Masuk</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(activeDetailProject.arusKasMasuk)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">
                        Arus Kas Keluar (Cash Outflow)
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Pengeluaran Kas Langsung Proyek</span>
                        <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400">
                          {displayRp(
                            -(
                              activeDetailProject.biayaProgram +
                              activeDetailProject.biayaOperasional
                            )
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Mutasi Bank Debet Terkait Proyek</span>
                        <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400">
                          {displayRp(-activeDetailProject.biayaMutasi)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-rose-700 dark:text-rose-400">
                        <span>Total Arus Kas Keluar</span>
                        <span className="font-mono tabular-nums">
                          {displayRp(-activeDetailProject.arusKasKeluar)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          Arus Kas Bersih Proyek (Net Cash Flow)
                        </span>
                        <span
                          className={`text-base font-bold font-mono tabular-nums ${
                            activeDetailProject.arusKasBersih >= 0
                              ? 'text-[#05828e] dark:text-teal-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {displayRp(activeDetailProject.arusKasBersih)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 pt-1">
                        <span>Piutang Transaksi Belum Dibayar (Non-Kas)</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {displayRp(activeDetailProject.piutangBelumBayar)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* III. Rincian Sumber Transaksi Proyek */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#05828e]" />
                      <span>III. Rincian Buku Transaksi &amp; Pengeluaran Proyek</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Menampilkan {activeLedgerEntries.length} dari{' '}
                      {activeDetailProject.entries.length} entri keuangan terkait proyek ini
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                      {(
                        [
                          ['ALL', 'Semua'],
                          ['salur', 'S-SALUR'],
                          ['donasi', 'D-DONASI'],
                          ['ajar', 'A-AJAR'],
                          ['mutasi', 'Mutasi'],
                          ['pengeluaran', 'Pengeluaran'],
                        ] as const
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setLedgerSourceFilter(val)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                            ledgerSourceFilter === val
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={ledgerSearchQuery}
                        onChange={(e) => setLedgerSearchQuery(e.target.value)}
                        placeholder="Cari kode/keterangan..."
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 w-48"
                      />
                    </div>
                  </div>
                </div>

                {activeLedgerEntries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    Belum ada transaksi atau pengeluaran yang tercatat untuk proyek dan filter sumber ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[780px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <th className="py-2.5 px-4">Tanggal</th>
                          <th className="py-2.5 px-3">Sumber</th>
                          <th className="py-2.5 px-3">Kode / Nomor</th>
                          <th className="py-2.5 px-3">Keterangan</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-4 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {activeLedgerEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                          >
                            <td className="py-2.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 tabular-nums">
                              {entry.date}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">
                              {sourceLabel(entry.source)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              {entry.kode}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200 max-w-md truncate">
                              {entry.keterangan}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                              {entry.status}
                            </td>
                            <td
                              className={`py-2.5 px-4 whitespace-nowrap text-right font-mono tabular-nums font-bold ${
                                entry.flow === 'IN'
                                  ? entry.isCashRealized
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-amber-700 dark:text-amber-400'
                                  : 'text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {entry.flow === 'IN' ? '+' : '-'}{' '}
                              {displayRp(entry.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
