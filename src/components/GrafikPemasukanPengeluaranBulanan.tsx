import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Filter,
  DollarSign,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { MutasiItem, PengeluaranItem } from '../types';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { JournalEntry } from '../accountingData';
import {
  parseFinancialDateToIso,
  formatDateRangeLabel,
} from '../utils/financialDateFilter';

interface GrafikPemasukanPengeluaranBulananProps {
  mutasiItems: MutasiItem[];
  pengeluaranList: PengeluaranItem[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  journalEntries?: JournalEntry[];
  isPrivacyMasked?: boolean;
  startDate?: string;
  endDate?: string;
  onClearDateRange?: () => void;
}

export interface MonthlyBarChartPoint {
  key: string;
  year: number;
  monthIndex: number;
  monthName: string;
  shortLabel: string;
  pemasukan: number;
  pengeluaran: number;
  netCashflow: number;
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
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
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
  const iso = parseFinancialDateToIso(dateStr);
  if (iso) {
    const [yrStr, moStr] = iso.split('-');
    const year = parseInt(yrStr, 10);
    const month = parseInt(moStr, 10) - 1;
    if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
      return { year, month };
    }
  }

  if (!dateStr) return null;
  const s = dateStr.trim().toLowerCase().replace(/([a-z])(\d)/g, '$1 $2');

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
      let yr = 2021;
      const yrMatch = s.match(/(?:^|\D)(20\d\d)(?:\D|$)/);
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

export const GrafikPemasukanPengeluaranBulanan: React.FC<GrafikPemasukanPengeluaranBulananProps> = ({
  mutasiItems,
  pengeluaranList,
  salurOrders = [],
  donasiOrders = [],
  transaksiAjarList = [],
  journalEntries = [],
  isPrivacyMasked = false,
  startDate = '',
  endDate = '',
  onClearDateRange,
}) => {
  // Filters & display modes
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [barMode, setBarMode] = useState<'grouped' | 'stacked' | 'net'>('grouped');
  const [showAverageLine, setShowAverageLine] = useState(true);

  const hasCustomDateRange = Boolean(startDate || endDate);
  const customRangeLabel = formatDateRangeLabel(startDate, endDate);

  // Format currency helpers
  const formatRupiah = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
    if (isPrivacyMasked) return 'Rp ••••••••';
    if (val < 0) {
      return `(Rp ${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatShortRupiah = (val: number): string => {
    if (isPrivacyMasked) return '••••';
    if (val === 0) return '0';
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)} M`;
    }
    if (abs >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(0)} Jt`;
    }
    if (abs >= 1_000) {
      return `${(val / 1_000).toFixed(0)} Rb`;
    }
    return val.toString();
  };

  // Compile monthly data across all authoritative transaction sources
  const { monthlyData, availableYears } = useMemo(() => {
    const yearsSet = new Set<number>();
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

    // 1. Process Mutasi Items (Authoritative Cash Flow)
    mutasiItems.forEach((item) => {
      const parsed = parseMonthYear(item.date);
      const yr = parsed?.year || 2021;
      const m = parsed?.month !== undefined ? parsed.month : 10;
      const b = getOrCreateBucket(yr, m);
      const amt = item.amount || 0;

      if (item.type === 'CR') {
        b.pemasukan += amt;
        b.countInflow += 1;
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

    // 2. Process Pengeluaran List (Direct operational expenses not in mutasi)
    const coveredMutasiIds = new Set(
      mutasiItems.filter((m) => m.type === 'DB').map((m) => m.id)
    );
    pengeluaranList.forEach((peng) => {
      if (!peng.mutasiId || !coveredMutasiIds.has(peng.mutasiId)) {
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

    // 3. Process Salur Orders (Sales transactions)
    salurOrders.forEach((so) => {
      const parsed = parseMonthYear(so.date);
      const yr = parsed?.year || 2021;
      const m = parsed?.month !== undefined ? parsed.month : 10;
      const b = getOrCreateBucket(yr, m);

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

    // 4. Process Donasi Orders
    donasiOrders.forEach((d) => {
      const parsed = parseMonthYear(d.date);
      const yr = parsed?.year || 2021;
      const m = parsed?.month !== undefined ? parsed.month : 10;
      const b = getOrCreateBucket(yr, m);

      const dAmt =
        typeof d.totalDana === 'number'
          ? d.totalDana
          : parseInt(String(d.totalDana || '0').replace(/\D/g, ''), 10) || 0;

      if (b.donasiPemasukan === 0 && dAmt > 0) {
        b.pemasukan += dAmt;
        b.donasiPemasukan += dAmt;
        b.countInflow += 1;
      }
    });

    // 5. Process Transaksi Ajar
    transaksiAjarList.forEach((aj) => {
      const parsed = parseMonthYear(aj.date);
      const yr = parsed?.year || 2021;
      const m = parsed?.month !== undefined ? parsed.month : 10;
      const b = getOrCreateBucket(yr, m);

      const ajAmt =
        typeof aj.totalDana === 'number'
          ? aj.totalDana
          : parseInt(String(aj.totalDana || '100000').replace(/\D/g, ''), 10) || 0;

      if (b.ajarPemasukan === 0 && ajAmt > 0) {
        b.pemasukan += ajAmt;
        b.ajarPemasukan += ajAmt;
        b.countInflow += 1;
      }
    });

    // Convert map to sorted list
    const sortedKeys = Object.keys(map).sort();
    const result: MonthlyBarChartPoint[] = sortedKeys.map((k) => {
      const b = map[k];
      return {
        key: k,
        year: b.year,
        monthIndex: b.monthIndex,
        monthName: `${MONTH_NAMES_ID[b.monthIndex]} ${b.year}`,
        shortLabel: `${MONTH_SHORT_ID[b.monthIndex]} '${String(b.year).slice(2)}`,
        pemasukan: b.pemasukan,
        pengeluaran: b.pengeluaran,
        netCashflow: b.pemasukan - b.pengeluaran,
        salurPemasukan: b.salurPemasukan,
        donasiPemasukan: b.donasiPemasukan,
        ajarPemasukan: b.ajarPemasukan,
        lainPemasukan: b.lainPemasukan,
        programBeban: b.programBeban,
        operasionalBeban: b.operasionalBeban,
        countInflow: b.countInflow,
        countOutflow: b.countOutflow,
      };
    });

    const years = Array.from(yearsSet).sort((a, b) => b - a);

    return {
      monthlyData: result,
      availableYears: years,
    };
  }, [mutasiItems, pengeluaranList, salurOrders, donasiOrders, transaksiAjarList]);

  useEffect(() => {
    if (selectedYear !== 'ALL' && !availableYears.includes(Number(selectedYear))) {
      setSelectedYear('ALL');
    }
  }, [availableYears, selectedYear]);

  // Filter by selected year
  const filteredData = useMemo(() => {
    if (selectedYear === 'ALL') return monthlyData;
    const yrNum = parseInt(selectedYear, 10);
    return monthlyData.filter((d) => d.year === yrNum);
  }, [monthlyData, selectedYear]);

  // Summary statistics for executive cards
  const stats = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let maxInflowMonth = { name: '-', val: 0 };
    let maxOutflowMonth = { name: '-', val: 0 };

    filteredData.forEach((d) => {
      totalInflow += d.pemasukan;
      totalOutflow += d.pengeluaran;

      if (d.pemasukan > maxInflowMonth.val) {
        maxInflowMonth = { name: d.monthName, val: d.pemasukan };
      }
      if (d.pengeluaran > maxOutflowMonth.val) {
        maxOutflowMonth = { name: d.monthName, val: d.pengeluaran };
      }
    });

    const net = totalInflow - totalOutflow;
    const count = filteredData.length || 1;
    const avgInflow = totalInflow / count;
    const avgOutflow = totalOutflow / count;
    const expenseRatio = totalInflow > 0 ? (totalOutflow / totalInflow) * 100 : 0;

    return {
      totalInflow,
      totalOutflow,
      net,
      avgInflow,
      avgOutflow,
      expenseRatio,
      maxInflowMonth,
      maxOutflowMonth,
    };
  }, [filteredData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload as MonthlyBarChartPoint;
    if (!data) return null;

    const net = data.pemasukan - data.pengeluaran;
    const isSurplus = net >= 0;
    const ratio = data.pemasukan > 0 ? (data.pengeluaran / data.pemasukan) * 100 : 0;

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs min-w-[240px] backdrop-blur-xs animate-in fade-in duration-100">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>{data.monthName}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
              isSurplus ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {isSurplus ? 'Surplus' : 'Defisit'}
          </span>
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              Total Pemasukan:
            </span>
            <span className="font-bold text-emerald-400">{formatRupiah(data.pemasukan)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
              Total Pengeluaran:
            </span>
            <span className="font-bold text-rose-400">{formatRupiah(data.pengeluaran)}</span>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-sans font-semibold">Selisih Bersih (Net):</span>
            <span className={`font-bold ${isSurplus ? 'text-emerald-300' : 'text-rose-300'}`}>
              {formatRupiah(net)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pt-1">
            <span>Rasio Beban:</span>
            <span>{ratio.toFixed(1)}% dari pemasukan</span>
          </div>
        </div>
      </div>
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    csvRows.push('YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA');
    csvRows.push(
      `Laporan Perbandingan Pemasukan vs Pengeluaran Bulanan (Periode: ${
        hasCustomDateRange
          ? customRangeLabel
          : selectedYear === 'ALL'
          ? 'Semua Periode'
          : selectedYear
      })`
    );
    csvRows.push(`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`);
    csvRows.push('');
    csvRows.push('Bulan,Tahun,Total Pemasukan,Total Pengeluaran,Selisih Bersih (Net),Status,Rasio Beban (%)');

    filteredData.forEach((d) => {
      const net = d.pemasukan - d.pengeluaran;
      const status = net >= 0 ? 'Surplus' : 'Defisit';
      const ratio = d.pemasukan > 0 ? ((d.pengeluaran / d.pemasukan) * 100).toFixed(1) : '0';
      csvRows.push(
        `"${d.monthName}",${d.year},${d.pemasukan},${d.pengeluaran},${net},"${status}",${ratio}%`
      );
    });

    csvRows.push('');
    csvRows.push(
      `TOTAL KESELURUHAN,,${stats.totalInflow},${stats.totalOutflow},${stats.net},${
        stats.net >= 0 ? 'Surplus' : 'Defisit'
      },${stats.expenseRatio.toFixed(1)}%`
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURI(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `Grafik_Pemasukan_Pengeluaran_Bulanan_${selectedYear}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. HEADER BANNER */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-teal-50 via-white to-emerald-50/70 border border-teal-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#05828e] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Grafik Batang Perbandingan Pemasukan & Pengeluaran Bulanan
                </h3>
                <span className="text-[11.5px] font-semibold text-[#05828e]">
                  Visualisasi Recharts · {hasCustomDateRange ? `Periode ${customRangeLabel}` : 'Semua Periode'}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                Membandingkan total <strong>Pemasukan</strong> (donasi, penjualan buku S-SALUR,
                pelatihan A-AJAR) dengan total <strong>Pengeluaran</strong> (biaya operasional, cetak
                buku dharma, logistik) per bulan secara visual untuk evaluasi kinerja kas yayasan.
              </p>
            </div>
          </div>

          {/* Quick Actions & CSV Export */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
              title="Unduh rekapitulasi data bulanan ke format CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. STATISTIC SUMMARY CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Pemasukan */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Total Pemasukan
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-600 font-mono mt-1">
            {formatRupiah(stats.totalInflow)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Rata-rata: {formatShortRupiah(stats.avgInflow)}/bln</span>
            <span className="text-emerald-700 font-medium">Inflow Kas</span>
          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Total Pengeluaran
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-rose-600 font-mono mt-1">
            {formatRupiah(stats.totalOutflow)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Rata-rata: {formatShortRupiah(stats.avgOutflow)}/bln</span>
            <span className="text-rose-700 font-medium">Outflow Kas</span>
          </div>
        </div>

        {/* Card 3: Surplus / Defisit Bersih */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Surplus / (Defisit) Bersih
            </span>
            <span
              className={`p-1.5 rounded-lg ${
                stats.net >= 0 ? 'bg-teal-50 text-[#05828e]' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold font-mono mt-1 ${
              stats.net >= 0 ? 'text-[#05828e]' : 'text-rose-600'
            }`}
          >
            {formatRupiah(stats.net)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Rasio Beban: {stats.expenseRatio.toFixed(1)}%</span>
            <span className={`font-semibold ${stats.net >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
              {stats.net >= 0 ? 'Net Positif' : 'Net Negatif'}
            </span>
          </div>
        </div>

        {/* Card 4: Bulan Pemasukan Tertinggi */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              Bulan Tertinggi
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 truncate">
            {stats.maxInflowMonth.name}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Pemasukan: {formatShortRupiah(stats.maxInflowMonth.val)}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CHART CONTROLS TOOLBAR & RECHARTS BAR CHART */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
        {/* Toolbar: Filter Tahun, Mode Batang, & Rata-rata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tahun */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 border border-teal-300 text-teal-900 focus:outline-none focus:ring-1 focus:ring-[#05828e] cursor-pointer"
              >
                <option value="ALL">Semua Periode ({monthlyData.length} Bulan)</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr.toString()}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Batang Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBarMode('grouped')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  barMode === 'grouped'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Batang Pemasukan dan Pengeluaran Berdampingan"
              >
                Berdampingan
              </button>
              <button
                type="button"
                onClick={() => setBarMode('stacked')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  barMode === 'stacked'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Batang Bertumpuk (Komposisi Salur, Donasi & Beban)"
              >
                Komposisi
              </button>
              <button
                type="button"
                onClick={() => setBarMode('net')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  barMode === 'net'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Batang Selisih Arus Kas Bersih (Surplus / Defisit)"
              >
                Selisih Bersih
              </button>
            </div>
          </div>

          {/* Toggle Average Line & Legend indicators */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAverageLine}
                onChange={(e) => setShowAverageLine(e.target.checked)}
                className="w-3.5 h-3.5 text-[#05828e] rounded border-slate-300 focus:ring-[#05828e] cursor-pointer"
              />
              <span>Garis Rata-rata</span>
            </label>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                Pemasukan
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                Pengeluaran
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="w-full h-80 sm:h-96">
          {filteredData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <BarChart3 className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">
                Tidak ada transaksi pada rentang tanggal yang dipilih
              </p>
              {hasCustomDateRange && (
                <p className="text-xs text-slate-500">Periode aktif: {customRangeLabel}</p>
              )}
              {hasCustomDateRange && onClearDateRange && (
                <button
                  type="button"
                  onClick={onClearDateRange}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Rentang Tanggal</span>
                </button>
              )}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 15, right: 15, left: 10, bottom: 25 }}
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
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                />
                <ReferenceLine y={0} stroke="#cbd5e1" />

                {/* Average line if enabled */}
                {showAverageLine && (
                  <ReferenceLine
                    y={stats.avgInflow}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: `Rata Pemasukan: ${formatShortRupiah(stats.avgInflow)}`,
                      position: 'insideTopLeft',
                      fill: '#059669',
                      fontSize: 10,
                    }}
                  />
                )}
                {showAverageLine && (
                  <ReferenceLine
                    y={stats.avgOutflow}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{
                      value: `Rata Pengeluaran: ${formatShortRupiah(stats.avgOutflow)}`,
                      position: 'insideBottomLeft',
                      fill: '#e11d48',
                      fontSize: 10,
                    }}
                  />
                )}

                {/* Bars Rendering based on selected mode */}
                {barMode === 'grouped' ? (
                  <>
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
                  </>
                ) : barMode === 'stacked' ? (
                  <>
                    {/* Stacked Pemasukan */}
                    <Bar
                      dataKey="salurPemasukan"
                      name="Penjualan S-SALUR"
                      stackId="inflow"
                      fill="#059669"
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="donasiPemasukan"
                      name="Donasi D-DONASI"
                      stackId="inflow"
                      fill="#34d399"
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="ajarPemasukan"
                      name="Pelatihan A-AJAR"
                      stackId="inflow"
                      fill="#6ee7b7"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />

                    {/* Stacked Pengeluaran */}
                    <Bar
                      dataKey="programBeban"
                      name="Beban Program (Cetak/Event)"
                      stackId="outflow"
                      fill="#e11d48"
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="operasionalBeban"
                      name="Beban Operasional & SDM"
                      stackId="outflow"
                      fill="#fb7185"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    />
                  </>
                ) : (
                  // Net cashflow mode: individual bar colored green if positive, red if negative
                  <Bar
                    dataKey="netCashflow"
                    name="Arus Kas Bersih (Surplus/Defisit)"
                    maxBarSize={40}
                    radius={[4, 4, 0, 0]}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.netCashflow >= 0 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. DATA TABLE BREAKDOWN (TABEL RINCIAN BULANAN) */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#05828e]" />
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
              Tabel Rekapitulasi Pemasukan vs Pengeluaran Bulanan
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredData.length} Bulan Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Periode Bulan</th>
                <th className="py-2.5 px-3 text-right">Total Pemasukan</th>
                <th className="py-2.5 px-3 text-right">Total Pengeluaran</th>
                <th className="py-2.5 px-3 text-right">Selisih Bersih (Net)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Rasio Beban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredData.map((d) => {
                const net = d.pemasukan - d.pengeluaran;
                const isSurplus = net >= 0;
                const ratio = d.pemasukan > 0 ? (d.pengeluaran / d.pemasukan) * 100 : 0;
                return (
                  <tr key={d.key} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{d.monthName}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                      {formatRupiah(d.pemasukan)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700 font-medium">
                      {formatRupiah(d.pengeluaran)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        isSurplus ? 'text-[#05828e]' : 'text-rose-600'
                      }`}
                    >
                      {formatRupiah(net)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSurplus
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {isSurplus ? (
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{isSurplus ? 'Surplus' : 'Defisit'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {ratio.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-3 uppercase tracking-wider text-[11px]">
                  TOTAL KESELURUHAN:
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">
                  {formatRupiah(stats.totalInflow)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-rose-800 text-sm">
                  {formatRupiah(stats.totalOutflow)}
                </td>
                <td
                  className={`py-3 px-3 text-right font-mono text-sm ${
                    stats.net >= 0 ? 'text-[#05828e]' : 'text-rose-600'
                  }`}
                >
                  {formatRupiah(stats.net)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                      stats.net >= 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {stats.net >= 0 ? 'Surplus' : 'Defisit'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">
                  {stats.expenseRatio.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
