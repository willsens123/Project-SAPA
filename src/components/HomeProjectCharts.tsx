import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderGit2,
  Target,
  SlidersHorizontal,
  DollarSign,
  Users,
  Check,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { ProjectItem } from '../types';

export interface DivisionKpiTarget {
  divisi: string;
  namaDivisiLengkap: string;
  targetProyek: number;
  targetBudget: number;
  targetPartisipan: number;
  targetSelesaiPercent: number;
  catatanKpi?: string;
}

const DEFAULT_DIVISION_KPIS: Record<string, DivisionKpiTarget> = {
  UMM: {
    divisi: 'UMM',
    namaDivisiLengkap: 'Umum & Personalia',
    targetProyek: 5,
    targetBudget: 35000000,
    targetPartisipan: 200,
    targetSelesaiPercent: 80,
    catatanKpi: 'Target operasional & kesejahteraan tim',
  },
  PNB: {
    divisi: 'PNB',
    namaDivisiLengkap: 'Penerbitan Buku Dharma',
    targetProyek: 4,
    targetBudget: 45000000,
    targetPartisipan: 300,
    targetSelesaiPercent: 75,
    catatanKpi: 'Target cetak dan distribusi modul Dharma',
  },
  MAD: {
    divisi: 'MAD',
    namaDivisiLengkap: 'Marketing & Distribusi',
    targetProyek: 6,
    targetBudget: 60000000,
    targetPartisipan: 500,
    targetSelesaiPercent: 85,
    catatanKpi: 'Target omset penjualan dan ekspansi relasi',
  },
  FUN: {
    divisi: 'FUN',
    namaDivisiLengkap: 'Fundraising & Donasi',
    targetProyek: 4,
    targetBudget: 30000000,
    targetPartisipan: 250,
    targetSelesaiPercent: 80,
    catatanKpi: 'Target donasi terikat dan patron rutin',
  },
  EVE: {
    divisi: 'EVE',
    namaDivisiLengkap: 'Event Organizer',
    targetProyek: 5,
    targetBudget: 50000000,
    targetPartisipan: 400,
    targetSelesaiPercent: 80,
    catatanKpi: 'Target retret dan seminar nasional',
  },
  CPR: {
    divisi: 'CPR',
    namaDivisiLengkap: 'Public Relation & Corporate',
    targetProyek: 3,
    targetBudget: 25000000,
    targetPartisipan: 150,
    targetSelesaiPercent: 75,
    catatanKpi: 'Target kemitraan institusi luar',
  },
  MRK: {
    divisi: 'MRK',
    namaDivisiLengkap: 'Marketing Komunikasi',
    targetProyek: 4,
    targetBudget: 30000000,
    targetPartisipan: 350,
    targetSelesaiPercent: 80,
    catatanKpi: 'Target promosi media digital',
  },
  CAM: {
    divisi: 'CAM',
    namaDivisiLengkap: 'Campaign & Sosial',
    targetProyek: 3,
    targetBudget: 20000000,
    targetPartisipan: 200,
    targetSelesaiPercent: 75,
    catatanKpi: 'Target aksi sosial dan bakti donasi',
  },
  OPS: {
    divisi: 'OPS',
    namaDivisiLengkap: 'Operasional Gudang & Logistik',
    targetProyek: 4,
    targetBudget: 25000000,
    targetPartisipan: 180,
    targetSelesaiPercent: 80,
    catatanKpi: 'Target kelancaran pengiriman ekspedisi',
  },
  PRO: {
    divisi: 'PRO',
    namaDivisiLengkap: 'Produksi & Percetakan',
    targetProyek: 5,
    targetBudget: 55000000,
    targetPartisipan: 250,
    targetSelesaiPercent: 80,
    catatanKpi: 'Target kuota produksi buku dan souvenir',
  },
  MED: {
    divisi: 'MED',
    namaDivisiLengkap: 'Media & Dokumentasi',
    targetProyek: 4,
    targetBudget: 20000000,
    targetPartisipan: 300,
    targetSelesaiPercent: 80,
    catatanKpi: 'Target peliputan video dan live streaming',
  },
  IT: {
    divisi: 'IT',
    namaDivisiLengkap: 'Information Technology',
    targetProyek: 5,
    targetBudget: 40000000,
    targetPartisipan: 200,
    targetSelesaiPercent: 85,
    catatanKpi: 'Target stabilitas sistem dan fitur ERP SAPA',
  },
  KEU: {
    divisi: 'KEU',
    namaDivisiLengkap: 'Keuangan & Perbendaharaan',
    targetProyek: 4,
    targetBudget: 35000000,
    targetPartisipan: 200,
    targetSelesaiPercent: 85,
    catatanKpi: 'Target rekonsiliasi mutasi & pos keuangan',
  },
};

interface HomeProjectChartsProps {
  projects: ProjectItem[];
  activeDivisi: string;
  onSelectDivisi?: (divisi: string) => void;
  onOpenProjectReport?: (project: ProjectItem) => void;
  onShowToast?: (msg: string) => void;
}

const PIE_COLORS = [
  '#008d91', // Teal
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316', // Orange
  '#10b981', // Emerald
  '#eab308', // Yellow
  '#64748b', // Slate
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomComparisonTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const actualEntry = payload.find((p) => p.dataKey === 'actual');
    const targetEntry = payload.find((p) => p.dataKey === 'target');
    const actualVal = Number(actualEntry?.value) || 0;
    const targetVal = Number(targetEntry?.value) || 0;
    const percent = targetVal > 0 ? Math.round((actualVal / targetVal) * 100) : 100;
    const diff = actualVal - targetVal;

    return (
      <div className="bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700 space-y-1.5 z-50 min-w-[200px]">
        <div className="font-bold border-b border-slate-700/80 pb-1 text-teal-300 flex items-center justify-between gap-3">
          <span>Divisi {label}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            percent >= 100 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300'
          }`}>
            {percent}% Capaian
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008d91]" />
            Aktual Riil:
          </span>
          <span className="font-bold text-white">{actualVal} Proyek</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
            Target KPI:
          </span>
          <span className="font-bold text-indigo-300">{targetVal} Proyek</span>
        </div>
        <div className="border-t border-slate-700/50 pt-1 text-[11px] flex items-center justify-between text-slate-400">
          <span>Selisih:</span>
          <span className={diff >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {diff > 0 ? `+${diff}` : diff} Proyek
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomStatusTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
    return (
      <div className="bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700 space-y-1.5 z-50">
        <div className="font-bold border-b border-slate-700/80 pb-1 text-teal-300 flex items-center justify-between gap-3">
          <span>Divisi {label}</span>
          <span className="text-[10px] text-slate-300 font-normal">Total: {total} Proyek</span>
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomAchievementTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700 space-y-1 z-50">
        <div className="font-bold text-teal-300 border-b border-slate-700/80 pb-1 flex items-center justify-between gap-3">
          <span>Divisi {label}</span>
          <span className="text-white font-bold">{data.achievementPercent}%</span>
        </div>
        <div className="text-slate-300">
          Aktual: <span className="font-bold text-white">{data.actual}</span> / Target:{' '}
          <span className="font-bold text-indigo-300">{data.target}</span> Proyek
        </div>
        <div className="text-[10px] text-slate-400">
          Benchmark Target: 100%
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-xl shadow-xl text-xs border border-slate-700 z-50">
        <div className="font-bold text-teal-300">{data.name}</div>
        <div className="text-slate-200 mt-0.5">
          {data.value} Proyek ({data.payload?.percent || (data.percent * 100).toFixed(0)}%)
        </div>
      </div>
    );
  }
  return null;
};

export const HomeProjectCharts: React.FC<HomeProjectChartsProps> = ({
  projects,
  activeDivisi,
  onSelectDivisi,
  onShowToast = () => {},
}) => {
  // Chart view tab mode: 'comparison' (Aktual vs Target) | 'achievement' (% Capaian) | 'status' (Status Proyek)
  const [chartMode, setChartMode] = useState<'comparison' | 'achievement' | 'status'>('comparison');

  // KPI Targets state
  const [kpiTargets] = useState<Record<string, DivisionKpiTarget>>(DEFAULT_DIVISION_KPIS);

  // 1. Calculate actual project statistics per division
  const divisionStats = useMemo(() => {
    const map: Record<
      string,
      {
        divisi: string;
        actual: number; // total projects
        ongoing: number;
        done: number;
        waiting: number;
        target: number;
        achievementPercent: number;
        budgetEstimate: number;
        targetBudget: number;
        participantEstimate: number;
        targetPartisipan: number;
        completionRate: number;
        targetSelesaiPercent: number;
      }
    > = {};

    // Seed all standard divisions from KPI targets
    Object.keys(kpiTargets).forEach((div) => {
      const tgt = kpiTargets[div];
      map[div] = {
        divisi: div,
        actual: 0,
        ongoing: 0,
        done: 0,
        waiting: 0,
        target: tgt.targetProyek || 3,
        achievementPercent: 0,
        budgetEstimate: 0,
        targetBudget: tgt.targetBudget || 20000000,
        participantEstimate: 0,
        targetPartisipan: tgt.targetPartisipan || 150,
        completionRate: 0,
        targetSelesaiPercent: tgt.targetSelesaiPercent || 80,
      };
    });

    // Populate actual project data
    projects.forEach((p) => {
      const div = p.divisi || 'UMM';
      if (!map[div]) {
        map[div] = {
          divisi: div,
          actual: 0,
          ongoing: 0,
          done: 0,
          waiting: 0,
          target: 3,
          achievementPercent: 0,
          budgetEstimate: 0,
          targetBudget: 20000000,
          participantEstimate: 0,
          targetPartisipan: 150,
          completionRate: 0,
          targetSelesaiPercent: 80,
        };
      }

      map[div].actual += 1;
      const status = (p.status || '').toLowerCase();
      if (status.includes('ongoing')) {
        map[div].ongoing += 1;
        map[div].budgetEstimate += 12500000;
        map[div].participantEstimate += 65;
      } else if (status.includes('done')) {
        map[div].done += 1;
        map[div].budgetEstimate += 15000000;
        map[div].participantEstimate += 80;
      } else if (status.includes('waiting')) {
        map[div].waiting += 1;
        map[div].budgetEstimate += 6800000;
        map[div].participantEstimate += 40;
      } else {
        map[div].ongoing += 1;
        map[div].budgetEstimate += 10000000;
        map[div].participantEstimate += 50;
      }
    });

    // Compute derived rates
    return Object.values(map).map((item) => {
      const achievement = item.target > 0 ? Math.round((item.actual / item.target) * 100) : 100;
      const completion = item.actual > 0 ? Math.round((item.done / item.actual) * 100) : 0;
      return {
        ...item,
        achievementPercent: achievement,
        completionRate: completion,
      };
    }).sort((a, b) => b.actual - a.actual || b.target - a.target);
  }, [projects, kpiTargets]);

  // 2. Ongoing projects distribution for Pie Chart
  const ongoingPieData = useMemo(() => {
    const list = divisionStats
      .filter((d) => d.ongoing > 0)
      .map((d) => ({
        name: `Divisi ${d.divisi}`,
        divisi: d.divisi,
        value: d.ongoing,
      }));

    const totalOngoing = list.reduce((sum, item) => sum + item.value, 0);

    return list.map((item) => ({
      ...item,
      percent: totalOngoing > 0 ? ((item.value / totalOngoing) * 100).toFixed(1) : '0',
    }));
  }, [divisionStats]);

  // Overall aggregates
  const totalActualProjects = useMemo(() => projects.length, [projects]);
  const totalTargetProjects = useMemo(
    () => (Object.values(kpiTargets) as DivisionKpiTarget[]).reduce<number>((sum, t) => sum + (t.targetProyek || 0), 0),
    [kpiTargets]
  );
  const totalOngoingProjects = useMemo(
    () => projects.filter((p) => (p.status || '').toLowerCase().includes('ongoing')).length,
    [projects]
  );
  const averageAchievementRate = useMemo(() => {
    if (divisionStats.length === 0) return 0;
    const sum = divisionStats.reduce((acc, d) => acc + d.achievementPercent, 0);
    return Math.round(sum / divisionStats.length);
  }, [divisionStats]);

  // Selected Division Stats for the comparison detail card
  const selectedDivStats = useMemo(() => {
    return (
      divisionStats.find((d) => d.divisi === activeDivisi) ||
      divisionStats[0] || {
        divisi: 'MAD',
        actual: 0,
        ongoing: 0,
        done: 0,
        waiting: 0,
        target: 4,
        achievementPercent: 0,
        budgetEstimate: 0,
        targetBudget: 35000000,
        participantEstimate: 0,
        targetPartisipan: 250,
        completionRate: 0,
        targetSelesaiPercent: 75,
      }
    );
  }, [divisionStats, activeDivisi]);

  const selectedDivKpi = kpiTargets[selectedDivStats.divisi] || {
    divisi: selectedDivStats.divisi,
    namaDivisiLengkap: `Divisi ${selectedDivStats.divisi}`,
    targetProyek: 4,
    targetBudget: 35000000,
    targetPartisipan: 250,
    targetSelesaiPercent: 75,
    catatanKpi: 'Target KPI bawaan',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#008d91] flex items-center justify-center font-bold shadow-2xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Visualisasi & Komparasi KPI Proyek per Divisi
              </h2>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Target KPI Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bandingkan performa proyek riil terhadap target spesifik masing-masing divisi secara otomatis
            </p>
          </div>
        </div>

        {/* Action Controls: View Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {/* Chart View Modes */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setChartMode('comparison')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
                chartMode === 'comparison'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Aktual vs Target
            </button>
            <button
              type="button"
              onClick={() => setChartMode('achievement')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
                chartMode === 'achievement'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Capaian KPI (%)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('status')}
              className={`px-3 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
                chartMode === 'status'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Status Proyek
            </button>
          </div>
        </div>
      </div>

      {/* KPI Comparison Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span>Total Proyek Riil</span>
            <FolderGit2 className="w-3.5 h-3.5 text-[#008d91]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {totalActualProjects} <span className="text-xs font-semibold text-[#008d91]">Aktual</span>
          </div>
          <span className="text-[10px] text-teal-700 font-medium block mt-0.5">
            {totalOngoingProjects} Ongoing • {totalActualProjects - totalOngoingProjects} Done/Waiting
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span>Total Target KPI Divisi</span>
            <Target className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950">
            {totalTargetProjects} <span className="text-xs font-semibold text-indigo-600">Target</span>
          </div>
          <span className="text-[10px] text-indigo-700 font-medium block mt-0.5">
            Gabungan target 12 divisi
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span>Rata-rata Capaian KPI</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900">
            {averageAchievementRate}%
          </div>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
            {averageAchievementRate >= 80 ? 'Performa sangat baik' : 'Perlu akselerasi'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-50/50 border border-cyan-100">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span>Divisi Terpilih (Fokus)</span>
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {activeDivisi}
          </div>
          <span className="text-[10px] text-cyan-700 font-medium block mt-0.5">
            {selectedDivStats.actual} riil / {selectedDivStats.target} target KPI
          </span>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Chart (8 Columns): Recharts Bar / Composed Chart */}
        <div className="lg:col-span-8 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                {chartMode === 'comparison' && 'Perbandingan Aktual Proyek Riil vs Target KPI per Divisi'}
                {chartMode === 'achievement' && 'Persentase Tingkat Capaian KPI per Divisi terhadap Benchmark 100%'}
                {chartMode === 'status' && 'Distribusi Status Proyek Riil per Divisi (Ongoing, Done, Waiting)'}
              </h3>
              <span className="text-[11px] text-slate-400">
                Klik batang pada grafik untuk memilih divisi aktif di dashboard
              </span>
            </div>

            {/* Chart Legend Indicators */}
            {chartMode === 'comparison' && (
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#008d91]" /> Aktual Riil
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]" /> Target KPI
                </span>
              </div>
            )}

            {chartMode === 'achievement' && (
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 shrink-0">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;= 100%
                </span>
                <span className="flex items-center gap-1 text-[#008d91]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008d91]" /> 75-99%
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> &lt; 75%
                </span>
              </div>
            )}

            {chartMode === 'status' && (
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 shrink-0">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#008d91]" /> Ongoing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" /> Done
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /> Waiting
                </span>
              </div>
            )}
          </div>

          {/* Recharts Container */}
          <div className="w-full h-[290px]">
            <ResponsiveContainer width="100%" height={290}>
              {chartMode === 'comparison' ? (
                <BarChart
                  data={divisionStats}
                  margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                  onClick={(e: any) => {
                    if (e && e.activeLabel && onSelectDivisi) {
                      onSelectDivisi(e.activeLabel);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="divisi"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <Bar
                    dataKey="actual"
                    name="Aktual Riil"
                    fill="#008d91"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="target"
                    name="Target KPI"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              ) : chartMode === 'achievement' ? (
                <BarChart
                  data={divisionStats}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                  onClick={(e: any) => {
                    if (e && e.activeLabel && onSelectDivisi) {
                      onSelectDivisi(e.activeLabel);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="divisi"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    unit="%"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomAchievementTooltip />} />
                  <ReferenceLine
                    y={100}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: '100% Target',
                      position: 'top',
                      fill: '#10b981',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <Bar
                    dataKey="achievementPercent"
                    name="Capaian KPI (%)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={36}
                  >
                    {divisionStats.map((entry, index) => {
                      const color =
                        entry.achievementPercent >= 100
                          ? '#10b981'
                          : entry.achievementPercent >= 75
                          ? '#008d91'
                          : entry.achievementPercent >= 50
                          ? '#f59e0b'
                          : '#f43f5e';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={divisionStats}
                  margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                  onClick={(e: any) => {
                    if (e && e.activeLabel && onSelectDivisi) {
                      onSelectDivisi(e.activeLabel);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="divisi"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomStatusTooltip />} />
                  <Bar
                    dataKey="ongoing"
                    name="Ongoing"
                    fill="#008d91"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="done"
                    name="Done"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="waiting"
                    name="Waiting Acc"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart (4 Columns): Recharts Donut Pie Chart */}
        <div className="lg:col-span-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                Pangsa Proyek Berjalan
              </h3>
              <span className="text-[11px] text-slate-400">
                Distribusi {totalOngoingProjects} proyek Ongoing
              </span>
            </div>
            <PieIcon className="w-4 h-4 text-[#008d91]" />
          </div>

          <div className="w-full h-[190px] flex items-center justify-center">
            {ongoingPieData.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-10">
                Belum ada proyek berstatus Ongoing
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={ongoingPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ongoingPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.divisi === activeDivisi
                            ? '#008d91'
                            : PIE_COLORS[index % PIE_COLORS.length]
                        }
                        stroke={entry.divisi === activeDivisi ? '#004d50' : '#ffffff'}
                        strokeWidth={entry.divisi === activeDivisi ? 2 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Division Legend List */}
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
            {ongoingPieData.map((item, idx) => (
              <div
                key={item.divisi}
                onClick={() => onSelectDivisi && onSelectDivisi(item.divisi)}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  item.divisi === activeDivisi
                    ? 'bg-teal-50 text-[#008d91] font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800 shrink-0">
                  {item.value} ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* KARTU KOMPARASI DETAIL KPI DIVISI TERPILIH                     */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-50 via-teal-50/20 to-indigo-50/20 p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-[#008d91] flex items-center justify-center font-bold shadow-2xs">
              {selectedDivStats.divisi}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800">
                  Rincian Komparasi KPI Divisi {selectedDivStats.divisi}
                </h4>
                <span className="text-[10px] bg-teal-100 text-[#008d91] font-bold px-2 py-0.5 rounded-full">
                  {selectedDivStats.achievementPercent}% Capaian Proyek
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDivKpi.catatanKpi || selectedDivKpi.namaDivisiLengkap}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Comparison Metric Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Metric 1: Jumlah Proyek */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5 text-[#008d91]" />
                Jumlah Proyek
              </span>
              <span className={`font-bold ${
                selectedDivStats.actual >= selectedDivStats.target ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {selectedDivStats.actual >= selectedDivStats.target ? 'Tercapai' : 'Kurang ' + (selectedDivStats.target - selectedDivStats.actual)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-slate-800">{selectedDivStats.actual} Proyek</span>
              <span className="text-xs font-semibold text-indigo-600">
                Target: {selectedDivStats.target}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  selectedDivStats.achievementPercent >= 100 ? 'bg-emerald-500' : 'bg-[#008d91]'
                }`}
                style={{ width: `${Math.min(100, selectedDivStats.achievementPercent)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              {selectedDivStats.ongoing} Ongoing • {selectedDivStats.done} Selesai
            </span>
          </div>

          {/* Metric 2: Realisasi Anggaran */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                Realisasi Anggaran
              </span>
              <span className="font-bold text-slate-700">
                {Math.round((selectedDivStats.budgetEstimate / selectedDivStats.targetBudget) * 100)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-black text-slate-800">
                Rp{(selectedDivStats.budgetEstimate / 1000000).toFixed(1)} Juta
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                Target: Rp{(selectedDivStats.targetBudget / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((selectedDivStats.budgetEstimate / selectedDivStats.targetBudget) * 100))}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Target Divisi: Rp{selectedDivStats.targetBudget.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Metric 3: Partisipan & Customer */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-600" />
                Jangkauan Partisipan
              </span>
              <span className="font-bold text-slate-700">
                {Math.round((selectedDivStats.participantEstimate / selectedDivStats.targetPartisipan) * 100)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-slate-800">
                {selectedDivStats.participantEstimate} Orang
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                Target: {selectedDivStats.targetPartisipan}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((selectedDivStats.participantEstimate / selectedDivStats.targetPartisipan) * 100))}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Donatur & Pelanggan S-SALUR
            </span>
          </div>

          {/* Metric 4: Tingkat Penyelesaian */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Tingkat Penyelesaian
              </span>
              <span className="font-bold text-slate-700">
                Target: {selectedDivStats.targetSelesaiPercent}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black text-slate-800">
                {selectedDivStats.completionRate}% Selesai
              </span>
              <span className={`text-xs font-bold ${
                selectedDivStats.completionRate >= selectedDivStats.targetSelesaiPercent
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}>
                {selectedDivStats.completionRate >= selectedDivStats.targetSelesaiPercent ? 'Memenuhi' : 'On Progress'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  selectedDivStats.completionRate >= selectedDivStats.targetSelesaiPercent
                    ? 'bg-emerald-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, selectedDivStats.completionRate)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Berdasarkan persentase proyek status Done
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
