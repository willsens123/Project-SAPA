import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
  BarChart3,
  GitCommit,
  Layers,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CentralAuditLogEntry, AuditModule } from '../types';

export interface MonthlyAuditDataPoint {
  key: string; // "YYYY-MM"
  label: string; // "Mar 26"
  fullLabel: string; // "Maret 2026"
  year: number;
  monthIndex: number;
  total: number;
  salur: number;
  donasi: number;
  ajar: number;
  identitas: number;
  anomalies: number;
  isPeak: boolean;
  isSpike: boolean;
  pctChange?: number | null;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/**
 * Robust date parser supporting ISO strings and Indonesian textual timestamps
 */
export function extractLogDate(log: CentralAuditLogEntry): Date | null {
  if (log.isoTimestamp) {
    const d = new Date(log.isoTimestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (log.timestamp) {
    const direct = new Date(log.timestamp);
    if (!isNaN(direct.getTime())) return direct;

    const cleaned = log.timestamp.replace(/^[A-Za-z]+,\s*/, '').trim();
    const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const mStr = match[2].toLowerCase();
      const year = parseInt(match[3], 10);
      const monthMap: Record<string, number> = {
        jan: 0, januari: 0, january: 0,
        feb: 1, februari: 1, february: 1,
        mar: 2, maret: 2, march: 2,
        apr: 3, april: 3,
        mei: 4, may: 4,
        jun: 5, juni: 5, june: 5,
        jul: 6, juli: 6, july: 6,
        agu: 7, agt: 7, agustus: 7, aug: 7, august: 7,
        sep: 8, september: 8,
        okt: 9, oktober: 9, oct: 9, october: 9,
        nov: 10, november: 10,
        des: 11, desember: 11, dec: 11, december: 11,
      };
      const month = monthMap[mStr] !== undefined ? monthMap[mStr] : 0;
      return new Date(year, month, day);
    }
  }
  return null;
}

interface MonthlyAuditTrendChartProps {
  logs: CentralAuditLogEntry[];
  selectedMonth: string | null;
  onSelectMonth: (monthKey: string | null) => void;
  selectedModuleFilter?: 'ALL' | AuditModule | 'ANOMALI';
  onFilterModule?: (mod: 'ALL' | AuditModule | 'ANOMALI') => void;
  flaggedLogIdMap?: Map<string, any>;
}

export const MonthlyAuditTrendChart: React.FC<MonthlyAuditTrendChartProps> = ({
  logs,
  selectedMonth,
  onSelectMonth,
  selectedModuleFilter = 'ALL',
  onFilterModule,
  flaggedLogIdMap,
}) => {
  // Chart visual presentation mode
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Time scope range filter
  const [timeRange, setTimeRange] = useState<'all' | '12m' | '6m'>('all');

  // Modul view selection
  const [metricView, setMetricView] = useState<'ALL' | AuditModule>('ALL');

  // Collapse / expand section toggle
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Group logs into monthly data points
  const { monthlyData, peakPoint, averagePerMonth, latestMoM } = useMemo(() => {
    const buckets: Record<string, {
      year: number;
      monthIndex: number;
      total: number;
      salur: number;
      donasi: number;
      ajar: number;
      identitas: number;
      anomalies: number;
    }> = {};

    logs.forEach((log) => {
      const date = extractLogDate(log);
      if (!date) return;

      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      if (!buckets[key]) {
        buckets[key] = {
          year,
          monthIndex,
          total: 0,
          salur: 0,
          donasi: 0,
          ajar: 0,
          identitas: 0,
          anomalies: 0,
        };
      }

      buckets[key].total += 1;
      if (log.module === 'S-SALUR') buckets[key].salur += 1;
      else if (log.module === 'DONASI') buckets[key].donasi += 1;
      else if (log.module === 'AJAR') buckets[key].ajar += 1;
      else if (log.module === 'IDENTITAS') buckets[key].identitas += 1;

      if (flaggedLogIdMap && flaggedLogIdMap.has(log.id)) {
        buckets[key].anomalies += 1;
      }
    });

    // Sort chronologically ascending
    const sortedKeys = Object.keys(buckets).sort();
    if (sortedKeys.length === 0) {
      return {
        monthlyData: [] as MonthlyAuditDataPoint[],
        peakPoint: null as MonthlyAuditDataPoint | null,
        averagePerMonth: 0,
        latestMoM: null as number | null,
      };
    }

    const totalLogsInBuckets = sortedKeys.reduce((acc, k) => acc + buckets[k].total, 0);
    const avg = totalLogsInBuckets / sortedKeys.length;

    // Find highest total to determine peak & spike (> 1.4x of avg)
    let maxTotal = 0;
    sortedKeys.forEach((k) => {
      if (buckets[k].total > maxTotal) maxTotal = buckets[k].total;
    });

    const points: MonthlyAuditDataPoint[] = sortedKeys.map((key, idx) => {
      const b = buckets[key];
      const prevKey = idx > 0 ? sortedKeys[idx - 1] : null;
      let pctChange: number | null = null;
      if (prevKey && buckets[prevKey].total > 0) {
        pctChange = Math.round(((b.total - buckets[prevKey].total) / buckets[prevKey].total) * 100);
      }

      const isPeak = b.total === maxTotal && maxTotal > 0;
      const isSpike = b.total >= avg * 1.35 && b.total >= 10;

      return {
        key,
        label: `${MONTH_SHORT_ID[b.monthIndex]} '${String(b.year).slice(2)}`,
        fullLabel: `${MONTH_NAMES_ID[b.monthIndex]} ${b.year}`,
        year: b.year,
        monthIndex: b.monthIndex,
        total: b.total,
        salur: b.salur,
        donasi: b.donasi,
        ajar: b.ajar,
        identitas: b.identitas,
        anomalies: b.anomalies,
        isPeak,
        isSpike,
        pctChange,
      };
    });

    const peak = points.find((p) => p.isPeak) || null;
    const latest = points.length >= 2 ? points[points.length - 1].pctChange : null;

    return {
      monthlyData: points,
      peakPoint: peak,
      averagePerMonth: Math.round(avg * 10) / 10,
      latestMoM: latest,
    };
  }, [logs, flaggedLogIdMap]);

  // Filter points according to timeRange
  const displayedData = useMemo(() => {
    if (timeRange === '6m') {
      return monthlyData.slice(-6);
    }
    if (timeRange === '12m') {
      return monthlyData.slice(-12);
    }
    return monthlyData;
  }, [monthlyData, timeRange]);

  // Selected month detail if any
  const activeMonthPoint = useMemo(() => {
    if (!selectedMonth) return null;
    return monthlyData.find((p) => p.key === selectedMonth) || null;
  }, [monthlyData, selectedMonth]);

  // Custom Recharts Tooltip with anti-slop quiet typography
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const dataPoint = payload[0]?.payload as MonthlyAuditDataPoint;
    if (!dataPoint) return null;

    return (
      <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3 shadow-lg text-xs space-y-2 min-w-[210px] pointer-events-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 gap-2">
          <span className="font-bold text-slate-900">{dataPoint.fullLabel}</span>
          <span className="font-mono text-slate-400 text-[11px]">{dataPoint.key}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Total Perubahan Data</span>
            <span className="font-mono tabular-nums text-slate-900 text-sm">
              {dataPoint.total}
            </span>
          </div>

          {dataPoint.pctChange !== null && dataPoint.pctChange !== undefined && (
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Perubahan vs Bulan Lalu</span>
              <span
                className={`font-mono font-semibold ${
                  dataPoint.pctChange > 0
                    ? 'text-emerald-700'
                    : dataPoint.pctChange < 0
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {dataPoint.pctChange > 0 ? `+${dataPoint.pctChange}%` : `${dataPoint.pctChange}%`}
              </span>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-100 space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>S-SALUR</span>
              </span>
              <span className="font-mono tabular-nums font-medium text-slate-800">
                {dataPoint.salur}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>D-DONASI</span>
              </span>
              <span className="font-mono tabular-nums font-medium text-slate-800">
                {dataPoint.donasi}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>A-AJAR</span>
              </span>
              <span className="font-mono tabular-nums font-medium text-slate-800">
                {dataPoint.ajar}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#05828e]" />
                <span>IDENTITAS</span>
              </span>
              <span className="font-mono tabular-nums font-medium text-slate-800">
                {dataPoint.identitas}
              </span>
            </div>
          </div>

          {dataPoint.isSpike && (
            <div className="mt-1 pt-1.5 border-t border-amber-100 text-[11px] text-amber-800 flex items-center gap-1 font-medium">
              <Zap className="w-3 h-3 text-amber-600 shrink-0 fill-current" />
              <span>Lonjakan Aktivitas Terdeteksi</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-400 pt-0.5 text-center">
          Klik bar/area untuk memfilter log
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#05828e] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <BarChart3 className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Tren Perubahan Data Bulanan
              </h2>
              {peakPoint && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current text-amber-600" />
                  <span>Puncak: {peakPoint.fullLabel} ({peakPoint.total} mutasi)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi kronologis frekuensi perubahan data untuk mendeteksi lonjakan volume dan anomali mutasi data.
            </p>
          </div>
        </div>

        {/* View Controls & Collapse Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grafik Garis Area Tren"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Area</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grafik Batang Bertumpuk Per Modul"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Batang</span>
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('12m')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                timeRange === '12m'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              12 Bln
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('6m')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              6 Bln
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title={isExpanded ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 stroke-[2]" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[2]" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 2. Insight Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400">Lonjakan Tertinggi</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                {peakPoint ? peakPoint.fullLabel : '-'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                {peakPoint ? `${peakPoint.total} perubahan data` : 'Belum ada data'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400">Rata-Rata Bulanan</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                {averagePerMonth} <span className="text-xs font-normal text-slate-500">per bulan</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Basis {monthlyData.length} periode tercatat
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400">Tren Bulan Berjalan</div>
              <div className="text-sm font-bold mt-0.5 flex items-center gap-1 font-mono tabular-nums">
                {latestMoM !== null ? (
                  <>
                    {latestMoM >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span className={latestMoM >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {latestMoM > 0 ? `+${latestMoM}%` : `${latestMoM}%`}
                    </span>
                    <span className="text-[11px] font-normal text-slate-400 ml-0.5">MoM</span>
                  </>
                ) : (
                  <span className="text-slate-500 font-normal">Periode Baru</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Perbandingan vs bulan lalu
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400">Filter Bulan Aktif</div>
              <div className="text-sm font-bold text-[#05828e] mt-0.5 truncate">
                {activeMonthPoint ? activeMonthPoint.fullLabel : 'Semua Bulan'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                <span>
                  {activeMonthPoint ? `${activeMonthPoint.total} entri log` : 'Tidak difilter'}
                </span>
                {activeMonthPoint && (
                  <button
                    type="button"
                    onClick={() => onSelectMonth(null)}
                    className="text-[#05828e] hover:underline cursor-pointer font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Metric View Module Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Fokus Modul:</span>
              <button
                type="button"
                onClick={() => setMetricView('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  metricView === 'ALL'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Modul
              </button>
              <button
                type="button"
                onClick={() => setMetricView('S-SALUR')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  metricView === 'S-SALUR'
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>S-SALUR</span>
              </button>
              <button
                type="button"
                onClick={() => setMetricView('DONASI')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  metricView === 'DONASI'
                    ? 'bg-amber-700 text-white font-semibold'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>D-DONASI</span>
              </button>
              <button
                type="button"
                onClick={() => setMetricView('AJAR')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  metricView === 'AJAR'
                    ? 'bg-indigo-700 text-white font-semibold'
                    : 'text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>A-AJAR</span>
              </button>
              <button
                type="button"
                onClick={() => setMetricView('IDENTITAS')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  metricView === 'IDENTITAS'
                    ? 'bg-[#05828e] text-white font-semibold'
                    : 'text-[#05828e] hover:bg-teal-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#05828e]" />
                <span>IDENTITAS</span>
              </button>
            </div>

            {/* Quick helper tag */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Klik batang grafik untuk memfilter daftar log ke bulan tersebut</span>
            </div>
          </div>

          {/* 4. The Recharts Graph */}
          <div className="w-full h-64 sm:h-72 pt-2">
            {displayedData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                <div className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Tanggal</div>
                <div className="text-xs text-slate-400 mt-1 max-w-sm">
                  Pencatatan aktivitas audit log akan otomatis dikelompokkan ke dalam tren per bulan saat transaksi tercatat.
                </div>
              </div>
            ) : chartType === 'area' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={displayedData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const point = state.activePayload[0].payload as MonthlyAuditDataPoint;
                      if (point && point.key) {
                        onSelectMonth(selectedMonth === point.key ? null : point.key);
                      }
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#05828e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#05828e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradSalur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradDonasi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradAjar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Render based on metricView */}
                  {metricView === 'ALL' && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Perubahan"
                        stroke="#05828e"
                        strokeWidth={2.5}
                        fill="url(#gradTotal)"
                        activeDot={{ r: 6, fill: '#05828e', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="salur"
                        name="S-SALUR"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        fill="none"
                        strokeDasharray="4 2"
                      />
                      <Area
                        type="monotone"
                        dataKey="donasi"
                        name="D-DONASI"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        fill="none"
                        strokeDasharray="4 2"
                      />
                      <Area
                        type="monotone"
                        dataKey="ajar"
                        name="A-AJAR"
                        stroke="#6366f1"
                        strokeWidth={1.5}
                        fill="none"
                        strokeDasharray="4 2"
                      />
                      <Area
                        type="monotone"
                        dataKey="identitas"
                        name="IDENTITAS"
                        stroke="#0d9488"
                        strokeWidth={1.5}
                        fill="none"
                        strokeDasharray="4 2"
                      />
                    </>
                  )}

                  {metricView === 'S-SALUR' && (
                    <Area
                      type="monotone"
                      dataKey="salur"
                      name="S-SALUR"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#gradSalur)"
                      activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}

                  {metricView === 'DONASI' && (
                    <Area
                      type="monotone"
                      dataKey="donasi"
                      name="D-DONASI"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      fill="url(#gradDonasi)"
                      activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}

                  {metricView === 'AJAR' && (
                    <Area
                      type="monotone"
                      dataKey="ajar"
                      name="A-AJAR"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#gradAjar)"
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}

                  {metricView === 'IDENTITAS' && (
                    <Area
                      type="monotone"
                      dataKey="identitas"
                      name="IDENTITAS"
                      stroke="#046c76"
                      strokeWidth={2.5}
                      fill="url(#gradTotal)"
                      activeDot={{ r: 6, fill: '#046c76', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const point = state.activePayload[0].payload as MonthlyAuditDataPoint;
                      if (point && point.key) {
                        onSelectMonth(selectedMonth === point.key ? null : point.key);
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {metricView === 'ALL' ? (
                    <>
                      <Bar dataKey="salur" name="S-SALUR" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="donasi" name="D-DONASI" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="ajar" name="A-AJAR" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="identitas" name="IDENTITAS" stackId="a" fill="#05828e" radius={[4, 4, 0, 0]} />
                    </>
                  ) : metricView === 'S-SALUR' ? (
                    <Bar dataKey="salur" name="S-SALUR" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {displayedData.map((entry) => (
                        <Cell
                          key={`cell-${entry.key}`}
                          fill={selectedMonth === entry.key ? '#047857' : '#10b981'}
                        />
                      ))}
                    </Bar>
                  ) : metricView === 'DONASI' ? (
                    <Bar dataKey="donasi" name="D-DONASI" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      {displayedData.map((entry) => (
                        <Cell
                          key={`cell-${entry.key}`}
                          fill={selectedMonth === entry.key ? '#b45309' : '#f59e0b'}
                        />
                      ))}
                    </Bar>
                  ) : metricView === 'AJAR' ? (
                    <Bar dataKey="ajar" name="A-AJAR" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {displayedData.map((entry) => (
                        <Cell
                          key={`cell-${entry.key}`}
                          fill={selectedMonth === entry.key ? '#4338ca' : '#6366f1'}
                        />
                      ))}
                    </Bar>
                  ) : (
                    <Bar dataKey="identitas" name="IDENTITAS" fill="#05828e" radius={[4, 4, 0, 0]}>
                      {displayedData.map((entry) => (
                        <Cell
                          key={`cell-${entry.key}`}
                          fill={selectedMonth === entry.key ? '#046c76' : '#05828e'}
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 5. Active Month Filter Callout */}
          {activeMonthPoint && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#05828e] shrink-0" />
                <span className="text-slate-800">
                  Memfilter log ke periode: <strong className="text-slate-900">{activeMonthPoint.fullLabel}</strong> ({activeMonthPoint.total} entri mutasi: {activeMonthPoint.salur} Salur, {activeMonthPoint.donasi} Donasi, {activeMonthPoint.ajar} Ajar, {activeMonthPoint.identitas} Identitas)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectMonth(null)}
                className="self-start sm:self-center px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                Hapus Filter Bulan
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
