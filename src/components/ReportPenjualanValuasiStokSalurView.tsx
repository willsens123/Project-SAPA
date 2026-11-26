import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
  ArrowUpDown,
  Eye,
  EyeOff,
  RotateCcw,
  Calendar,
  Boxes,
  Receipt,
  AlertTriangle,
  Warehouse,
  X,
  ShoppingCart,
} from 'lucide-react';
import { SalurOrder, SalurProduct } from '../salurData';
import { formatDateRangeLabel } from '../utils/financialDateFilter';
import {
  computeSalurSalesAndStockValuation,
  CostValuationMethod,
  exportSalurSalesValuationCsv,
  exportSalurSalesValuationPdf,
  formatSalurRupiah,
  getStoredModalSalurItemsSafe,
  SalurItemSalesValuationRow,
  StockHealthStatus,
} from '../utils/salurSalesValuationHelper';
import { ModalSalurItem } from '../modalSalurData';
import { getStoredStokSalurItems, StokSalurItem } from '../stokSalurData';
import { BookCover } from './BookCover';

interface ReportPenjualanValuasiStokSalurViewProps {
  salurItems: SalurProduct[];
  salurOrders: SalurOrder[];
  onNavigateToTransaksiSalur?: () => void;
  onNavigateToStokItemSalur?: () => void;
  onNavigateToModalItemSalur?: () => void;
  onShowToast?: (msg: string) => void;
}

type MainTab = 'items' | 'warehouses' | 'alerts';
type SortField =
  | 'title'
  | 'unitCostRp'
  | 'stokUnit'
  | 'valuasiStokModalRp'
  | 'omzetPaidRp'
  | 'labaKotorPaidRp'
  | 'piutangRp'
  | 'qtyHadiah';

export const ReportPenjualanValuasiStokSalurView: React.FC<
  ReportPenjualanValuasiStokSalurViewProps
> = ({
  salurItems,
  salurOrders,
  onNavigateToTransaksiSalur,
  onNavigateToStokItemSalur,
  onNavigateToModalItemSalur,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGudang, setSelectedGudang] = useState<string>('ALL');
  const [selectedStockHealth, setSelectedStockHealth] = useState<
    'ALL' | StockHealthStatus
  >('ALL');
  const [selectedCostMethod, setSelectedCostMethod] = useState<
    'ALL' | 'batch' | 'estimated'
  >('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(false);

  // Valuation tuning parameters
  const [fallbackCostRatioPct, setFallbackCostRatioPct] = useState<number>(40);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(35);

  const [sortField, setSortField] = useState<SortField>('omzetPaidRp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selected warehouse in Tab 2
  const [activeWarehouseName, setActiveWarehouseName] = useState<string>('');
  // Selected item for audit drawer/modal
  const [selectedItemRow, setSelectedItemRow] =
    useState<SalurItemSalesValuationRow | null>(null);

  // Live reload triggers from Stok & Modal localStorage updates
  const [modalItems, setModalItems] = useState<ModalSalurItem[]>(() =>
    getStoredModalSalurItemsSafe()
  );
  const [stokItems, setStokItems] = useState<StokSalurItem[]>(() =>
    getStoredStokSalurItems(salurItems)
  );

  useEffect(() => {
    setStokItems(getStoredStokSalurItems(salurItems));
  }, [salurItems]);

  useEffect(() => {
    const refreshExternal = () => {
      setModalItems(getStoredModalSalurItemsSafe());
      setStokItems(getStoredStokSalurItems(salurItems));
    };
    window.addEventListener('stok_salur_updated', refreshExternal);
    window.addEventListener('storage', refreshExternal);
    return () => {
      window.removeEventListener('stok_salur_updated', refreshExternal);
      window.removeEventListener('storage', refreshExternal);
    };
  }, [salurItems]);

  const report = useMemo(() => {
    return computeSalurSalesAndStockValuation({
      salurItems,
      salurOrders,
      modalItems,
      stokItems,
      startDate,
      endDate,
      fallbackCostRatioPct,
      lowStockThreshold,
    });
  }, [
    salurItems,
    salurOrders,
    modalItems,
    stokItems,
    startDate,
    endDate,
    fallbackCostRatioPct,
    lowStockThreshold,
  ]);

  const warehouseNames = useMemo(
    () => report.warehouses.map((w) => w.lokasiGudang),
    [report.warehouses]
  );

  useEffect(() => {
    if (!activeWarehouseName && report.warehouses.length > 0) {
      setActiveWarehouseName(report.warehouses[0].lokasiGudang);
    }
  }, [activeWarehouseName, report.warehouses]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = report.rows.filter((r) => {
      if (selectedGudang !== 'ALL') {
        const hasWarehouse = r.containerBreakdown.some(
          (c) => c.lokasiGudang === selectedGudang
        );
        if (!hasWarehouse) return false;
      }
      if (selectedStockHealth !== 'ALL' && r.stockHealth !== selectedStockHealth) {
        return false;
      }
      if (selectedCostMethod === 'batch' && r.costMethod !== 'weighted_batch') {
        return false;
      }
      if (selectedCostMethod === 'estimated' && r.costMethod === 'weighted_batch') {
        return false;
      }
      if (q) {
        const hay = `${r.title} ${r.subtitle} ${r.subJenis} ${r.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [
    report.rows,
    selectedGudang,
    selectedStockHealth,
    selectedCostMethod,
    searchQuery,
    sortField,
    sortDir,
  ]);

  const activeWarehouse = useMemo(() => {
    if (activeWarehouseName) {
      const found = report.warehouses.find(
        (w) => w.lokasiGudang === activeWarehouseName
      );
      if (found) return found;
    }
    return report.warehouses[0] || null;
  }, [report.warehouses, activeWarehouseName]);

  const topSalesChartData = useMemo(() => {
    return [...filteredRows]
      .filter((r) => r.omzetPaidRp > 0 || r.piutangRp > 0)
      .sort((a, b) => b.omzetPaidRp - a.omzetPaidRp)
      .slice(0, 7)
      .map((r) => ({
        name: r.title.length > 18 ? `${r.title.slice(0, 16)}..` : r.title,
        fullName: r.title,
        OmzetPaid: r.omzetPaidRp,
        HppPaid: r.hppPaidRp,
        LabaKotor: r.labaKotorPaidRp,
      }));
  }, [filteredRows]);

  const warehouseChartData = useMemo(() => {
    return report.warehouses.slice(0, 7).map((w) => ({
      name:
        w.lokasiGudang.length > 16
          ? `${w.lokasiGudang.slice(0, 14)}..`
          : w.lokasiGudang,
      fullName: w.lokasiGudang,
      ValuasiModal: w.valuasiModalRp,
      PotensiRitel: w.potensiRitelRp,
    }));
  }, [report.warehouses]);

  const displayRp = (val: number) => {
    if (isPrivacyMasked) return 'Rp ••••••';
    return formatSalurRupiah(val);
  };

  const formatAxisRp = (val: number) => {
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
    const filename = exportSalurSalesValuationCsv(
      filteredRows,
      report.warehouses,
      report.totals,
      periodLabel
    );
    onShowToast?.(`File CSV "${filename}" berhasil diunduh.`);
  };

  const handleExportPdf = () => {
    const filename = exportSalurSalesValuationPdf(
      filteredRows,
      report.warehouses,
      report.totals,
      periodLabel
    );
    onShowToast?.(`Laporan PDF "${filename}" berhasil diunduh.`);
  };

  const renderStockHealthTag = (health: StockHealthStatus) => {
    if (health === 'habis') {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          Habis
        </span>
      );
    }
    if (health === 'menipis') {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Menipis
        </span>
      );
    }
    if (health === 'digital') {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Digital
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        Aman
      </span>
    );
  };

  const renderCostMethodTag = (method: CostValuationMethod) => {
    if (method === 'weighted_batch') {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          Batch Modal
        </span>
      );
    }
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        Estimasi
      </span>
    );
  };

  return (
    <div className="w-full space-y-5 pb-12 text-slate-800 dark:text-slate-100">
      {/* Top Workspace Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Rekap Penjualan &amp; Valuasi Stok S-SALUR
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Valuasi gudang berdasar rata-rata tertimbang batch modal item serta pemisahan omzet Paid, piutang, dan hadiah · Periode {periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToModalItemSalur && (
            <button
              type="button"
              onClick={onNavigateToModalItemSalur}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-[#05828e]" />
              <span>Modal Item</span>
            </button>
          )}

          {onNavigateToStokItemSalur && (
            <button
              type="button"
              onClick={onNavigateToStokItemSalur}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5 text-[#05828e]" />
              <span>Stok Gudang</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPrivacyMasked((v) => !v)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
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
            id="btn-export-salur-valuation-csv"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            id="btn-export-salur-valuation-pdf"
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Filters, Tabs & Valuation Parameters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Mode Tabs */}
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              id="tab-salur-val-items"
              onClick={() => setActiveTab('items')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'items'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Rekap Penjualan &amp; Item ({filteredRows.length})
            </button>
            <button
              type="button"
              id="tab-salur-val-warehouses"
              onClick={() => setActiveTab('warehouses')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'warehouses'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Valuasi per Gudang ({report.warehouses.length})
            </button>
            <button
              type="button"
              id="tab-salur-val-alerts"
              onClick={() => setActiveTab('alerts')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                Peringatan Stok Menipis ({report.lowStockAlerts.length})
              </span>
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

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama item, kode, atau sub-jenis..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30"
            />
          </div>

          <select
            value={selectedGudang}
            onChange={(e) => setSelectedGudang(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30"
          >
            <option value="ALL">Semua Gudang</option>
            {warehouseNames.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <select
            value={selectedStockHealth}
            onChange={(e) =>
              setSelectedStockHealth(e.target.value as 'ALL' | StockHealthStatus)
            }
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30"
          >
            <option value="ALL">Semua Status Stok</option>
            <option value="aman">Stok Aman</option>
            <option value="menipis">Stok Menipis</option>
            <option value="habis">Stok Habis</option>
            <option value="digital">Produk Digital</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Tanggal Mulai Penjualan"
            className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
          />

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Tanggal Akhir Penjualan"
              className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
            />
            {(searchQuery ||
              selectedGudang !== 'ALL' ||
              selectedStockHealth !== 'ALL' ||
              selectedCostMethod !== 'ALL' ||
              startDate ||
              endDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGudang('ALL');
                  setSelectedStockHealth('ALL');
                  setSelectedCostMethod('ALL');
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

        {/* Valuation Parameters Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2">
              <span>Estimasi HPP item tanpa batch modal:</span>
              <input
                type="number"
                min={0}
                max={100}
                value={fallbackCostRatioPct}
                onChange={(e) =>
                  setFallbackCostRatioPct(
                    Math.max(0, Math.min(100, Number(e.target.value) || 0))
                  )
                }
                className="w-14 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-right text-slate-800 dark:text-slate-100"
              />
              <span>% harga jual</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <span>Batas peringatan stok menipis:</span>
              <input
                type="number"
                min={1}
                max={1000}
                value={lowStockThreshold}
                onChange={(e) =>
                  setLowStockThreshold(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-right text-slate-800 dark:text-slate-100"
              />
              <span>unit</span>
            </label>

            <select
              value={selectedCostMethod}
              onChange={(e) =>
                setSelectedCostMethod(
                  e.target.value as 'ALL' | 'batch' | 'estimated'
                )
              }
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Semua Sumber Modal</option>
              <option value="batch">
                Hanya Batch Modal ({report.totals.batchCostSkuCount})
              </option>
              <option value="estimated">
                Hanya Estimasi Fallback ({report.totals.estimatedCostSkuCount})
              </option>
            </select>
          </div>

          <span className="pt-1 tabular-nums">
            {report.totals.paidOrderCount} order Paid ·{' '}
            {report.totals.unpaidOrderCount} order Piutang ·{' '}
            {report.totals.hadiahOrderCount} order Hadiah
          </span>
        </div>
      </div>

      {/* 4-Card KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Omzet Penjualan (Paid)</span>
            <span className="font-mono tabular-nums text-[#05828e] dark:text-teal-400">
              {report.totals.qtyPaid.toLocaleString('id-ID')} unit
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {displayRp(report.totals.omzetPaidRp)}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 tabular-nums">
            Piutang Belum Bayar: {displayRp(report.totals.piutangRp)} (
            {report.totals.qtyBelumBayar} unit)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Laba Kotor Penjualan Paid</span>
            <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              Margin {report.totals.marginPaidPersen}%
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>{displayRp(report.totals.labaKotorPaidRp)}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            Beban Item Hadiah ({report.totals.qtyHadiah}u):{' '}
            {displayRp(report.totals.bebanModalHadiahRp)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Valuasi Aset Stok (Modal)</span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {report.totals.totalStokUnit.toLocaleString('id-ID')} unit
            </span>
          </div>
          <div className="text-xl font-bold text-[#05828e] dark:text-teal-400 font-mono tabular-nums">
            {displayRp(report.totals.totalValuasiModalRp)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {report.totals.batchCostSkuCount} SKU Batch Modal ·{' '}
            {report.totals.estimatedCostSkuCount} SKU Estimasi
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Potensi Nilai Ritel Gudang</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold tabular-nums">
              {report.totals.habisCount + report.totals.menipisCount} Alert
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {displayRp(report.totals.totalPotensiRitelRp)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {report.totals.habisCount} habis · {report.totals.menipisCount}{' '}
            menipis (≤ {lowStockThreshold}u)
          </div>
        </div>
      </div>

      {/* TAB 1: REKAP PENJUALAN & ITEM */}
      {activeTab === 'items' && (
        <div className="space-y-5">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Item: Omzet Paid vs HPP &amp; Laba Kotor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hanya transaksi penjualan lunas (tidak termasuk piutang &amp; hadiah)
                </p>
              </div>
              <div className="h-[260px]">
                {topSalesChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Belum ada transaksi penjualan pada filter periode ini.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSalesChartData}
                      margin={{ top: 8, right: 12, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        interval={0}
                        angle={-14}
                        textAnchor="end"
                        height={48}
                      />
                      <YAxis
                        tickFormatter={formatAxisRp}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        width={54}
                      />
                      <Tooltip
                        formatter={(val: unknown) =>
                          isPrivacyMasked
                            ? 'Rp ••••••'
                            : formatSalurRupiah(Number(val) || 0)
                        }
                        labelFormatter={(_l, payload) =>
                          payload?.[0]?.payload?.fullName || ''
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar
                        dataKey="OmzetPaid"
                        name="Omzet Paid"
                        fill="#05828e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="HppPaid"
                        name="HPP Modal"
                        fill="#94a3b8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="LabaKotor"
                        name="Laba Kotor"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Valuasi Modal Stok vs Potensi Nilai Ritel per Gudang
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nilai aset persediaan S-SALUR di setiap lokasi penyimpanan
                </p>
              </div>
              <div className="h-[260px]">
                {warehouseChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Belum ada data stok di lokasi gudang.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={warehouseChartData}
                      margin={{ top: 8, right: 12, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        interval={0}
                        angle={-12}
                        textAnchor="end"
                        height={44}
                      />
                      <YAxis
                        tickFormatter={formatAxisRp}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        width={54}
                      />
                      <Tooltip
                        formatter={(val: unknown) =>
                          isPrivacyMasked
                            ? 'Rp ••••••'
                            : formatSalurRupiah(Number(val) || 0)
                        }
                        labelFormatter={(_l, payload) =>
                          payload?.[0]?.payload?.fullName || ''
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar
                        dataKey="ValuasiModal"
                        name="Valuasi Modal"
                        fill="#05828e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="PotensiRitel"
                        name="Potensi Ritel"
                        fill="#0284c7"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Item Sales & Stock Valuation Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tabel Rekap Penjualan, Margin &amp; Valuasi Stok per Item
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Klik baris item untuk melihat rincian batch modal, sebaran container gudang, dan sampel order.
                </p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Ongkir Paid: {displayRp(report.totals.ongkirCollectedPaidRp)} · Donasi Tambahan:{' '}
                {displayRp(report.totals.donasiExtraPaidRp)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1120px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleSort('title')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Nama Item</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('unitCostRp')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Modal / Unit</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('stokUnit')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Stok Gudang</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('valuasiStokModalRp')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Valuasi Modal</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('omzetPaidRp')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Omzet Paid</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('labaKotorPaidRp')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Laba Kotor (Paid)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('piutangRp')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Piutang</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('qtyHadiah')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <span>Hadiah</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-slate-400 text-xs"
                      >
                        Tidak ada item S-SALUR yang sesuai dengan filter aktif.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.productId}
                        onClick={() => setSelectedItemRow(row)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-11 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                              <BookCover
                                coverKey={row.coverKey}
                                title={row.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white text-[13px] truncate max-w-[260px]">
                                {row.title}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{row.subJenis}</span>
                                <span>·</span>
                                <span className="font-mono tabular-nums">
                                  Jual {displayRp(row.hargaJual)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                            {displayRp(row.unitCostRp)}
                          </div>
                          <div className="mt-0.5">{renderCostMethodTag(row.costMethod)}</div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                            {row.isDigital ? '-' : `${row.stokUnit.toLocaleString('id-ID')} u`}
                          </div>
                          <div className="mt-0.5">{renderStockHealthTag(row.stockHealth)}</div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-semibold text-[#05828e] dark:text-teal-400 tabular-nums">
                            {displayRp(row.valuasiStokModalRp)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            Ritel: {displayRp(row.potensiNilaiRitelRp)}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                            {displayRp(row.omzetPaidRp)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            {row.qtyPaid.toLocaleString('id-ID')} unit Paid
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div
                            className={`font-mono font-semibold tabular-nums ${
                              row.labaKotorPaidRp >= 0
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {displayRp(row.labaKotorPaidRp)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            Margin {row.marginPaidPersen}%
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="font-mono font-medium text-amber-700 dark:text-amber-400 tabular-nums">
                            {displayRp(row.piutangRp)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            {row.qtyBelumBayar} unit
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                            {row.qtyHadiah} unit
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            Modal: {displayRp(row.bebanModalHadiahRp)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VALUASI PER GUDANG */}
      {activeTab === 'warehouses' && (
        <div className="space-y-5">
          {/* Warehouse Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {report.warehouses.map((w) => {
              const isSelected = activeWarehouse?.lokasiGudang === w.lokasiGudang;
              return (
                <button
                  key={w.lokasiGudang}
                  type="button"
                  onClick={() => setActiveWarehouseName(w.lokasiGudang)}
                  className={`text-left bg-white dark:bg-slate-900 rounded-xl p-4 border transition-colors cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-[#05828e] ring-1 ring-[#05828e]/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-[#05828e] shrink-0" />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {w.lokasiGudang}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {w.jenisLokasi} · {w.jumlahJudul} judul · {w.jumlahContainer} container
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                      {w.totalUnit.toLocaleString('id-ID')} u
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Valuasi Modal
                      </div>
                      <div className="font-mono font-bold text-[#05828e] dark:text-teal-400 tabular-nums">
                        {displayRp(w.valuasiModalRp)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Potensi Ritel
                      </div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                        {displayRp(w.potensiRitelRp)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Warehouse Container & Item Matrix */}
          {activeWarehouse && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Rincian Stok &amp; Valuasi Container: {activeWarehouse.lokasiGudang}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeWarehouse.totalUnit.toLocaleString('id-ID')} unit fisik · Nilai Modal{' '}
                    {displayRp(activeWarehouse.valuasiModalRp)} · Potensi Margin{' '}
                    {displayRp(activeWarehouse.potensiMarginRp)}
                  </p>
                </div>
                {onNavigateToStokItemSalur && (
                  <button
                    type="button"
                    onClick={onNavigateToStokItemSalur}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Kelola Stok Gudang
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[780px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-4">Nama Item</th>
                      <th className="py-3 px-3">Container</th>
                      <th className="py-3 px-3 text-right">Stok</th>
                      <th className="py-3 px-3 text-right">Modal / Unit</th>
                      <th className="py-3 px-3 text-right">Valuasi Modal</th>
                      <th className="py-3 px-3 text-right">Potensi Ritel</th>
                      <th className="py-3 px-4 text-center">Status Item</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {activeWarehouse.items.map((it, idx) => (
                      <tr
                        key={`${it.productId}-${it.namaContainer}-${idx}`}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {it.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {it.subJenis}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                          {it.namaContainer}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">
                          {it.stok.toLocaleString('id-ID')} u
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {displayRp(it.unitCostRp)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#05828e] dark:text-teal-400 tabular-nums">
                          {displayRp(it.valuasiModalRp)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          {displayRp(it.potensiRitelRp)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {renderStockHealthTag(it.stockHealth)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERINGATAN STOK MENIPIS */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>
                  Daftar Peringatan Stok Habis &amp; Menipis (≤ {lowStockThreshold} unit)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prioritaskan cetak ulang atau pemindahan container untuk item fisik dengan stok kritis.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateToStokItemSalur && (
                <button
                  type="button"
                  onClick={onNavigateToStokItemSalur}
                  className="px-3 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold cursor-pointer"
                >
                  Buka Manajemen Stok
                </button>
              )}
            </div>
          </div>

          {report.lowStockAlerts.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Seluruh item fisik S-SALUR berada di atas ambang batas stok aman ({lowStockThreshold} unit).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Item S-SALUR</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Sisa Stok</th>
                    <th className="py-3 px-3 text-right">Total Keluar (Periode)</th>
                    <th className="py-3 px-3 text-right">Modal / Unit</th>
                    <th className="py-3 px-3 text-right">Est. Modal Restok (+100u)</th>
                    <th className="py-3 px-4">Lokasi Container Saat Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {report.lowStockAlerts.map((item) => (
                    <tr
                      key={item.productId}
                      onClick={() => setSelectedItemRow(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.subJenis} · Harga Jual {displayRp(item.hargaJual)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderStockHealthTag(item.stockHealth)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                        {item.stokUnit.toLocaleString('id-ID')} u
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {item.totalQtyKeluar.toLocaleString('id-ID')} u
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {displayRp(item.unitCostRp)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#05828e] dark:text-teal-400 tabular-nums">
                        {displayRp(item.unitCostRp * 100)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {item.containerBreakdown.length === 0
                          ? 'Tidak ada container aktif'
                          : item.containerBreakdown
                              .map((c) => `${c.lokasiGudang} (${c.namaContainer}: ${c.stok}u)`)
                              .join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ITEM DETAIL DRAWER / MODAL */}
      {selectedItemRow && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setSelectedItemRow(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-xl"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-14 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  <BookCover
                    coverKey={selectedItemRow.coverKey}
                    title={selectedItemRow.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedItemRow.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedItemRow.subJenis} · Harga Jual{' '}
                    {displayRp(selectedItemRow.hargaJual)} ·{' '}
                    {selectedItemRow.costMethodLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemRow(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Item Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="text-slate-500 dark:text-slate-400">Modal / Unit</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {displayRp(selectedItemRow.unitCostRp)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="text-slate-500 dark:text-slate-400">Valuasi Gudang</div>
                  <div className="text-sm font-bold font-mono text-[#05828e] dark:text-teal-400 mt-0.5 tabular-nums">
                    {displayRp(selectedItemRow.valuasiStokModalRp)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="text-slate-500 dark:text-slate-400">Laba Kotor Paid</div>
                  <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 tabular-nums">
                    {displayRp(selectedItemRow.labaKotorPaidRp)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="text-slate-500 dark:text-slate-400">Kontribusi Bersih</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {displayRp(selectedItemRow.netKontribusiRp)}
                  </div>
                </div>
              </div>

              {/* Section 1: Batch Modal */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Riwayat Batch Modal Item (Dasar Rata-rata Tertimbang)
                </h4>
                {selectedItemRow.modalBatches.length === 0 ? (
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    Belum ada catatan batch pada Modal Item S-SALUR. Sistem memakai{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedItemRow.costMethodLabel}
                    </span>
                    .
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                          <th className="py-2 px-3">Tahun / Batch</th>
                          <th className="py-2 px-3">Mutasi</th>
                          <th className="py-2 px-3 text-right">Qty Batch</th>
                          <th className="py-2 px-3 text-right">Total Modal</th>
                          <th className="py-2 px-3 text-right">Modal / Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedItemRow.modalBatches.map((b) => (
                          <tr key={b.id}>
                            <td className="py-2 px-3 font-medium">{b.tahun}</td>
                            <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400">
                              {b.mutasiCode || '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {b.jml.toLocaleString('id-ID')} u
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {displayRp(b.totalModalRp)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums">
                              {displayRp(b.unitCostRp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 2: Sebaran Container Gudang */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Sebaran Stok &amp; Valuasi per Container Gudang
                </h4>
                {selectedItemRow.containerBreakdown.length === 0 ? (
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    Tidak ada stok fisik di container gudang saat ini.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                          <th className="py-2 px-3">Lokasi Gudang</th>
                          <th className="py-2 px-3">Container</th>
                          <th className="py-2 px-3 text-right">Stok</th>
                          <th className="py-2 px-3 text-right">Valuasi Modal</th>
                          <th className="py-2 px-3 text-right">Potensi Ritel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedItemRow.containerBreakdown.map((c, idx) => (
                          <tr key={`${c.lokasiGudang}-${c.namaContainer}-${idx}`}>
                            <td className="py-2 px-3 font-medium">{c.lokasiGudang}</td>
                            <td className="py-2 px-3">{c.namaContainer}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {c.stok.toLocaleString('id-ID')} u
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-[#05828e] dark:text-teal-400 tabular-nums">
                              {displayRp(c.valuasiModalRp)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {displayRp(c.potensiRitelRp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 3: Rincian Transaksi Periode Ini */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Transaksi Item Periode Terpilih ({selectedItemRow.orderSamples.length})
                </h4>
                {selectedItemRow.orderSamples.length === 0 ? (
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    Belum ada transaksi penjualan, piutang, atau hadiah pada rentang tanggal ini.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                          <th className="py-2 px-3">Kode Order</th>
                          <th className="py-2 px-3">Tanggal</th>
                          <th className="py-2 px-3">Kategori</th>
                          <th className="py-2 px-3 text-right">Qty</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedItemRow.orderSamples.map((s, idx) => (
                          <tr key={`${s.orderId}-${idx}`}>
                            <td className="py-2 px-3 font-mono">{s.orderNumber}</td>
                            <td className="py-2 px-3">{s.date}</td>
                            <td className="py-2 px-3">
                              {s.category === 'paid' && (
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  Paid
                                </span>
                              )}
                              {s.category === 'piutang' && (
                                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                                  Piutang
                                </span>
                              )}
                              {s.category === 'hadiah' && (
                                <span className="text-slate-600 dark:text-slate-300 font-semibold">
                                  Hadiah
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {s.qty} u
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {displayRp(s.lineTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {onNavigateToTransaksiSalur && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItemRow(null);
                      onNavigateToTransaksiSalur();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-[#05828e]" />
                    <span>Buka Transaksi S-SALUR</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemRow(null)}
                className="px-4 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
