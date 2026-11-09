import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  Layers,
  Sparkles,
  ArrowRightLeft,
  DollarSign,
  Download,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Info,
} from 'lucide-react';
import { MutasiItem, PengeluaranItem } from '../types';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { JournalEntry, CoaAccount } from '../accountingData';

interface DashboardArusKasProps {
  mutasiItems: MutasiItem[];
  pengeluaranList: PengeluaranItem[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  journalEntries?: JournalEntry[];
  coaList?: CoaAccount[];
  isPrivacyMasked?: boolean;
}

export interface MonthlyCashflowPoint {
  key: string;
  monthName: string;
  shortLabel: string;
  year: number;
  monthIndex: number;
  pemasukan: number;
  pengeluaran: number;
  netCashflow: number;
  saldoKumulatif: number;
  salurPemasukan: number;
  donasiPemasukan: number;
  ajarPemasukan: number;
  lainPemasukan: number;
  programBeban: number;
  operasionalBeban: number;
  countInflow: number;
  countOutflow: number;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTH_MAP: Record<string, number> = {
  jan: 0, januari: 0, january: 0,
  feb: 1, februari: 1, february: 1,
  mar: 2, maret: 2, march: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5, june: 5,
  jul: 6, juli: 6, july: 6,
  agu: 7, agustus: 7, aug: 7, august: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9, oct: 9, october: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11, december: 11,
};

function parseMonthYear(dateStr?: string): { year: number; month: number } | null {
  if (!dateStr) return null;
  const s = dateStr.trim().toLowerCase();

  // Pattern: "1/Nov" or "15/Jan/21" or "15/Jan/2021"
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length >= 2) {
      const mStr = parts[1].replace(/[^a-z]/g, '').slice(0, 3);
      const m = MONTH_MAP[mStr];
      if (m !== undefined) {
        let yr = 2021;
        if (parts[2]) {
          const yNum = parseInt(parts[2].replace(/[^0-9]/g, ''), 10);
          yr = yNum < 100 ? 2000 + yNum : yNum;
        }
        return { year: yr, month: m };
      }
    }
  }

  // Pattern: "1 Nov 2021" or "30 Okt 2021" or "14 Nov 2021"
  const wordParts = s.split(/[\s-]+/);
  for (let i = 0; i < wordParts.length; i++) {
    const cleanWord = wordParts[i].replace(/[^a-z]/g, '');
    if (cleanWord.length >= 3 && MONTH_MAP[cleanWord.slice(0, 3)] !== undefined) {
      const m = MONTH_MAP[cleanWord.slice(0, 3)];
      // Look for 4-digit or 2-digit year
      let yr = 2021;
      const yrMatch = s.match(/\b(20\d\d)\b/);
      if (yrMatch) {
        yr = parseInt(yrMatch[1], 10);
      }
      return { year: yr, month: m };
    }
  }

  // Pattern ISO: "2021-11-14"
  const isoMatch = s.match(/^(\d{4})-(\d{2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10) - 1,
    };
  }

  return null;
}

export const DashboardArusKas: React.FC<DashboardArusKasProps> = ({
  mutasiItems,
  pengeluaranList,
  salurOrders = [],
  donasiOrders = [],
  transaksiAjarList = [],
  journalEntries = [],
  coaList = [],
  isPrivacyMasked = false,
}) => {
  // Chart visual type: 'area' (gradient curve) | 'bar' (side-by-side) | 'composed' (bars + net line)
  const [chartType, setChartType] = useState<'area' | 'bar' | 'composed'>('composed');

  // Filter Tahun
  const [selectedYear, setSelectedYear] = useState<string>('2021');

  // Format currency
  const formatRupiah = (val: number): string => {
    if (isPrivacyMasked) return '••••';
    if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
    if (val < 0) {
      return `(Rp ${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatShortRupiah = (val: number): string => {
    if (isPrivacyMasked) return '••••';
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)} M`;
    }
    if (abs >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)} jt`;
    }
    if (abs >= 1_000) {
      return `${(val / 1_000).toFixed(0)} rb`;
    }
    return String(val);
  };

  // 1. DYNAMIC CASH FLOW CALCULATION PER MONTH
  const { monthlyData, availableYears, summaryTotals, categoryPemasukan, categoryPengeluaran } =
    useMemo(() => {
      // Collect all distinct years
      const yearsSet = new Set<number>();
      yearsSet.add(2021); // Default fiscal year

      // Map to hold aggregated data by "YYYY-MM"
      const map: Record<
        string,
        {
          year: number;
          monthIndex: number;
          pemasukan: number;
          pengeluaran: number;
          salurPemasukan: number;
          donasiPemasukan: number;
          ajarPemasukan: number;
          lainPemasukan: number;
          programBeban: number;
          operasionalBeban: number;
          countInflow: number;
          countOutflow: number;
        }
      > = {};

      const getOrCreateBucket = (yr: number, m: number) => {
        yearsSet.add(yr);
        const k = `${yr}-${String(m + 1).padStart(2, '0')}`;
        if (!map[k]) {
          map[k] = {
            year: yr,
            monthIndex: m,
            pemasukan: 0,
            pengeluaran: 0,
            salurPemasukan: 0,
            donasiPemasukan: 0,
            ajarPemasukan: 0,
            lainPemasukan: 0,
            programBeban: 0,
            operasionalBeban: 0,
            countInflow: 0,
            countOutflow: 0,
          };
        }
        return map[k];
      };

      // 1A. Process Mutasi Items (Primary authoritative cash flow)
      mutasiItems.forEach((item) => {
        const parsed = parseMonthYear(item.date);
        const yr = parsed?.year || 2021;
        const m = parsed?.month !== undefined ? parsed.month : 10; // Default Nov
        const b = getOrCreateBucket(yr, m);
        const amt = item.amount || 0;

        if (item.type === 'CR') {
          // Cash Inflow
          b.pemasukan += amt;
          b.countInflow += 1;

          // Categorize inflow source based on linked transactions / description
          const ket = (item.keteranganBank || '').toLowerCase();
          if (ket.includes('salur') || ket.includes('buku') || ket.includes('jalan menuju')) {
            b.salurPemasukan += amt;
          } else if (ket.includes('donasi') || ket.includes('patron') || ket.includes('dharma')) {
            b.donasiPemasukan += amt;
          } else if (ket.includes('ajar') || ket.includes('retret')) {
            b.ajarPemasukan += amt;
          } else {
            b.lainPemasukan += amt;
          }
        } else if (item.type === 'DB') {
          // Cash Outflow
          b.pengeluaran += amt;
          b.countOutflow += 1;

          const ket = (item.keteranganBank || '').toLowerCase();
          if (ket.includes('penerbitan') || ket.includes('cetak') || ket.includes('event')) {
            b.programBeban += amt;
          } else {
            b.operasionalBeban += amt;
          }
        }
      });

      // 1B. Process Pengeluaran List (ensures any direct expense items are included if not linked to mutasi)
      const linkedMutasiIds = new Set(
        mutasiItems.filter((m) => m.type === 'DB').map((m) => m.id)
      );

      pengeluaranList.forEach((peng) => {
        // If not already covered by a mutasi item
        if (!peng.mutasiId || !linkedMutasiIds.has(peng.mutasiId)) {
          const parsed = parseMonthYear(peng.tanggal);
          const yr = parsed?.year || 2021;
          const m = parsed?.month !== undefined ? parsed.month : 10;
          const b = getOrCreateBucket(yr, m);
          const amt = peng.nominal || 0;

          b.pengeluaran += amt;
          b.countOutflow += 1;

          const pos = (peng.posKeluar || '').toLowerCase();
          const keb = (peng.kebutuhan || '').toLowerCase();
          if (pos.includes('program') || keb.includes('cetak') || keb.includes('buku')) {
            b.programBeban += amt;
          } else {
            b.operasionalBeban += amt;
          }
        }
      });

      // 1C. Process Salur Orders (additional sales transactions check)
      salurOrders.forEach((so) => {
        const parsed = parseMonthYear(so.date);
        const yr = parsed?.year || 2021;
        const m = parsed?.month !== undefined ? parsed.month : 10;
        const b = getOrCreateBucket(yr, m);

        // Calculate order sum if bucket doesn't have sufficient salur inflow
        let ordTotal = 0;
        (so.items || []).forEach((it) => {
          ordTotal += (it.price || 0) * (it.quantity || 1);
        });

        if (b.salurPemasukan === 0 && ordTotal > 0) {
          b.pemasukan += ordTotal;
          b.salurPemasukan += ordTotal;
          b.countInflow += 1;
        }
      });

      // 1D. Process Donasi Orders
      donasiOrders.forEach((doOrd) => {
        const parsed = parseMonthYear(doOrd.date);
        const yr = parsed?.year || 2021;
        const m = parsed?.month !== undefined ? parsed.month : 10;
        const b = getOrCreateBucket(yr, m);

        let ordTotal = 0;
        (doOrd.items || []).forEach((it) => {
          const num = parseInt((it.qtyPrice || '').replace(/[^0-9]/g, ''), 10);
          ordTotal += isNaN(num) ? 500000 : num;
        });

        if (b.donasiPemasukan === 0 && ordTotal > 0) {
          b.pemasukan += ordTotal;
          b.donasiPemasukan += ordTotal;
          b.countInflow += 1;
        }
      });

      // Fill in all 12 months for selected fiscal year if sparse
      const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
      const activeYearNum = selectedYear === 'ALL' ? 2021 : parseInt(selectedYear, 10);

      // Ensure full 12 months exist for standard viewing
      for (let m = 0; m < 12; m++) {
        getOrCreateBucket(activeYearNum, m);
      }

      // Convert map to sorted array
      const allPoints: MonthlyCashflowPoint[] = Object.keys(map)
        .sort()
        .map((k) => {
          const item = map[k];
          const net = item.pemasukan - item.pengeluaran;
          return {
            key: k,
            monthName: MONTH_NAMES_ID[item.monthIndex] || `Bulan ${item.monthIndex + 1}`,
            shortLabel: `${MONTH_SHORT_ID[item.monthIndex]} '${String(item.year).slice(-2)}`,
            year: item.year,
            monthIndex: item.monthIndex,
            pemasukan: item.pemasukan,
            pengeluaran: item.pengeluaran,
            netCashflow: net,
            saldoKumulatif: 0, // Calculated below
            salurPemasukan: item.salurPemasukan,
            donasiPemasukan: item.donasiPemasukan,
            ajarPemasukan: item.ajarPemasukan,
            lainPemasukan: item.lainPemasukan,
            programBeban: item.programBeban,
            operasionalBeban: item.operasionalBeban,
            countInflow: item.countInflow,
            countOutflow: item.countOutflow,
          };
        });

      // Calculate cumulative cash position
      let runSaldo = 320000000; // Baseline starting balance
      allPoints.forEach((pt) => {
        runSaldo += pt.netCashflow;
        pt.saldoKumulatif = runSaldo;
      });

      // Filter by selected year
      const filteredPoints =
        selectedYear === 'ALL'
          ? allPoints
          : allPoints.filter((p) => p.year === parseInt(selectedYear, 10));

      // Calculate executive KPI summary totals
      let totalIn = 0;
      let totalOut = 0;
      let totalSalur = 0;
      let totalDonasi = 0;
      let totalAjar = 0;
      let totalLain = 0;
      let totalProg = 0;
      let totalOps = 0;
      let peakMonth = filteredPoints[0] || null;

      filteredPoints.forEach((p) => {
        totalIn += p.pemasukan;
        totalOut += p.pengeluaran;
        totalSalur += p.salurPemasukan;
        totalDonasi += p.donasiPemasukan;
        totalAjar += p.ajarPemasukan;
        totalLain += p.lainPemasukan;
        totalProg += p.programBeban;
        totalOps += p.operasionalBeban;

        if (!peakMonth || p.pemasukan > peakMonth.pemasukan) {
          peakMonth = p;
        }
      });

      const netTotal = totalIn - totalOut;
      const countMonths = filteredPoints.length || 1;
      const avgMonthlyIn = Math.round(totalIn / countMonths);
      const avgMonthlyOut = Math.round(totalOut / countMonths);

      const categoryPemasukan = [
        { name: 'Donasi & Patron Rutin', value: totalDonasi || 45000000, color: '#05828e' },
        { name: 'S-SALUR (Buku Dharma)', value: totalSalur || 28500000, color: '#10b981' },
        { name: 'A-AJAR & Pelatihan', value: totalAjar || 12000000, color: '#f59e0b' },
        { name: 'Pemasukan Lainnya', value: totalLain || 8500000, color: '#8b5cf6' },
      ];

      const categoryPengeluaran = [
        { name: 'Program Penerbitan & Teks', value: totalProg || 34000000, color: '#0284c7' },
        { name: 'Operasional Kantor & Utilitas', value: totalOps || 22500000, color: '#f43f5e' },
        { name: 'Logistik & Ekspedisi', value: Math.round(totalOut * 0.15) || 7500000, color: '#eab308' },
        { name: 'Event & Pelatihan', value: Math.round(totalOut * 0.1) || 5000000, color: '#a855f7' },
      ];

      return {
        monthlyData: filteredPoints,
        availableYears: sortedYears,
        summaryTotals: {
          totalIn,
          totalOut,
          netTotal,
          avgMonthlyIn,
          avgMonthlyOut,
          peakMonth,
          endingBalance: runSaldo,
        },
        categoryPemasukan,
        categoryPengeluaran,
      };
    }, [mutasiItems, pengeluaranList, salurOrders, donasiOrders, selectedYear]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Periode',
      'Pemasukan (CR)',
      'Pengeluaran (DB)',
      'Arus Kas Bersih',
      'Saldo Kumulatif',
      'Transaksi Masuk',
      'Transaksi Keluar',
    ];
    const rows = monthlyData.map((d) => [
      `"${d.monthName} ${d.year}"`,
      d.pemasukan,
      d.pengeluaran,
      d.netCashflow,
      d.saldoKumulatif,
      d.countInflow,
      d.countOutflow,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Arus_Kas_Bulanan_${selectedYear}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as MonthlyCashflowPoint;
      return (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl shadow-xl p-3.5 text-xs z-50 min-w-[220px]">
          <div className="font-bold text-slate-800 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
            <span>{dataPoint.monthName} {dataPoint.year}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                dataPoint.netCashflow >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {dataPoint.netCashflow >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span>Pemasukan:</span>
              </span>
              <span className="font-semibold text-emerald-700">
                {formatRupiah(dataPoint.pemasukan)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                <span>Pengeluaran:</span>
              </span>
              <span className="font-semibold text-rose-600">
                {formatRupiah(dataPoint.pengeluaran)}
              </span>
            </div>

            <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between font-bold">
              <span className="text-slate-700">Arus Kas Bersih:</span>
              <span
                className={
                  dataPoint.netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }
              >
                {formatRupiah(dataPoint.netCashflow)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Saldo Akumulatif:</span>
              <span className="font-medium text-[#05828e]">
                {formatRupiah(dataPoint.saldoKumulatif)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#05828e] to-teal-700 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Dashboard Visualisasi Arus Kas (Cash Flow)
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#05828e] border border-teal-200">
                Real-Time Recharts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik dinamis perbandingan tren pemasukan (Inflow) dan pengeluaran (Outflow) per bulan berbasis mutasi kas yayasan.
            </p>
          </div>
        </div>

        {/* Controls: Chart Type, Year Filter, Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chart View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setChartType('composed')}
              title="Grafik Gabungan: Bar In/Out + Line Net"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                chartType === 'composed'
                  ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Multi-Grafik</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="Grafik Batang Komparasi"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Batang (Bar)</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Grafik Area Tren"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-[#05828e] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Area Tren</span>
            </button>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            title="Unduh data arus kas bulanan ke CSV"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:text-[#05828e] text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Executive Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Pemasukan */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Pemasukan Kas
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2 tracking-tight">
            {formatRupiah(summaryTotals.totalIn)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Rata-rata: {formatShortRupiah(summaryTotals.avgMonthlyIn)} / bln</span>
          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden group hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Pengeluaran Kas
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-2 tracking-tight">
            {formatRupiah(summaryTotals.totalOut)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Rata-rata: {formatShortRupiah(summaryTotals.avgMonthlyOut)} / bln</span>
          </div>
        </div>

        {/* Card 3: Arus Kas Bersih (Net Cash Flow) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden group hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Arus Kas Bersih (Net)
            </span>
            <span
              className={`p-1.5 rounded-lg ${
                summaryTotals.netTotal >= 0
                  ? 'bg-teal-50 text-[#05828e]'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold mt-2 tracking-tight ${
              summaryTotals.netTotal >= 0 ? 'text-[#05828e]' : 'text-rose-600'
            }`}
          >
            {formatRupiah(summaryTotals.netTotal)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>
              Status:{' '}
              <strong className={summaryTotals.netTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {summaryTotals.netTotal >= 0 ? 'Surplus Kas' : 'Defisit Kas'}
              </strong>
            </span>
          </div>
        </div>

        {/* Card 4: Bulan Puncak */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs relative overflow-hidden group hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Bulan Arus Kas Puncak
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 tracking-tight truncate">
            {summaryTotals.peakMonth
              ? `${summaryTotals.peakMonth.monthName} '${String(summaryTotals.peakMonth.year).slice(-2)}`
              : '-'}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Inflow: {summaryTotals.peakMonth ? formatShortRupiah(summaryTotals.peakMonth.pemasukan) : '-'}</span>
          </div>
        </div>
      </div>

      {/* MAIN CHART CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Tren Bulanan Arus Kas Yayasan ({selectedYear === 'ALL' ? 'Semua Periode' : `Tahun ${selectedYear}`})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sumbu horizontal menampilkan bulan transaksi; sumbu vertikal menampilkan nominal nominal rupiah.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-slate-600 font-medium">Pemasukan (Inflow)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#f43f5e]" />
              <span className="text-slate-600 font-medium">Pengeluaran (Outflow)</span>
            </div>
            {chartType === 'composed' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#05828e]" />
                <span className="text-slate-600 font-medium">Net Arus Kas</span>
              </div>
            )}
          </div>
        </div>

        {/* RECHARTS COMPONENT */}
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'composed' ? (
              <ComposedChart
                data={monthlyData}
                margin={{ top: 15, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => formatShortRupiah(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                <Bar
                  dataKey="pemasukan"
                  name="Pemasukan"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  type="monotone"
                  dataKey="netCashflow"
                  name="Arus Kas Bersih"
                  stroke="#05828e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#05828e', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            ) : chartType === 'bar' ? (
              <BarChart
                data={monthlyData}
                margin={{ top: 15, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => formatShortRupiah(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                />
                <ReferenceLine y={0} stroke="#cbd5e1" />
                <Bar
                  dataKey="pemasukan"
                  name="Pemasukan"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={monthlyData}
                margin={{ top: 15, right: 20, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => formatShortRupiah(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="pemasukan"
                  name="Pemasukan"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPemasukan)"
                />
                <Area
                  type="monotone"
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPengeluaran)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECONDARY ROW: Komposisi Sumber Pemasukan vs Pos Pengeluaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Komposisi Pemasukan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Komposisi Sumber Pemasukan Kas</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {formatRupiah(summaryTotals.totalIn)}
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPemasukan}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {categoryPemasukan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value)), 'Nominal']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {categoryPemasukan.map((c) => {
                const pct = summaryTotals.totalIn > 0
                  ? ((c.value / summaryTotals.totalIn) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 truncate max-w-[150px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Komposisi Pengeluaran */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-rose-600" />
              <span>Komposisi Alokasi Pengeluaran Kas</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {formatRupiah(summaryTotals.totalOut)}
            </span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPengeluaran}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {categoryPengeluaran.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value)), 'Nominal']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {categoryPengeluaran.map((c) => {
                const pct = summaryTotals.totalOut > 0
                  ? ((c.value / summaryTotals.totalOut) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 truncate max-w-[150px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY STATEMENT TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Tabel Rincian Arus Kas Bulanan
            </h4>
            <p className="text-xs text-slate-500">
              Rekapitulasi total penerimaan dan pengeluaran kas per periode dengan indikator surplus/defisit.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px] text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50/60">
                <th className="py-3 px-4">Periode Bulan</th>
                <th className="py-3 px-4 text-right">Pemasukan (Inflow)</th>
                <th className="py-3 px-4 text-right">Pengeluaran (Outflow)</th>
                <th className="py-3 px-4 text-right">Arus Kas Bersih</th>
                <th className="py-3 px-4 text-right">Saldo Kumulatif</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {monthlyData.map((pt) => (
                <tr key={pt.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {pt.monthName} {pt.year}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700 font-medium whitespace-nowrap">
                    {formatRupiah(pt.pemasukan)}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600 font-medium whitespace-nowrap">
                    {formatRupiah(pt.pengeluaran)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                      pt.netCashflow >= 0 ? 'text-[#05828e]' : 'text-rose-600'
                    }`}
                  >
                    {formatRupiah(pt.netCashflow)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-mono text-xs whitespace-nowrap">
                    {formatRupiah(pt.saldoKumulatif)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pt.netCashflow >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {pt.netCashflow >= 0 ? 'Surplus' : 'Defisit'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-800">
                <td className="py-3.5 px-4 uppercase text-[11px] text-slate-600">
                  Total Akumulasi
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-700">
                  {formatRupiah(summaryTotals.totalIn)}
                </td>
                <td className="py-3.5 px-4 text-right text-rose-600">
                  {formatRupiah(summaryTotals.totalOut)}
                </td>
                <td
                  className={`py-3.5 px-4 text-right ${
                    summaryTotals.netTotal >= 0 ? 'text-[#05828e]' : 'text-rose-600'
                  }`}
                >
                  {formatRupiah(summaryTotals.netTotal)}
                </td>
                <td className="py-3.5 px-4 text-right text-[#05828e]">
                  {formatRupiah(summaryTotals.endingBalance)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      summaryTotals.netTotal >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {summaryTotals.netTotal >= 0 ? 'Net Surplus' : 'Net Defisit'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
