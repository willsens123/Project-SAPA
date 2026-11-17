import React, { useMemo, useState } from 'react';
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
  Cell,
} from 'recharts';
import {
  Calendar,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { CentralAuditLogEntry, AuditModule } from '../types';
import { extractLogDate } from './MonthlyAuditTrendChart';

export interface DailyAuditPoint {
  dateKey: string; // YYYY-MM-DD
  label: string; // e.g. "16 Nov"
  fullDate: string; // e.g. "Senin, 16 Nov 2026"
  total: number;
  salur: number;
  donasi: number;
  ajar: number;
  identitas: number;
}

export interface ModuleCategoryPoint {
  module: AuditModule;
  label: string;
  count: number;
  pct: number;
  color: string;
}

interface AuditActivityStatsChartProps {
  logs: CentralAuditLogEntry[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
  selectedModule: 'ALL' | AuditModule | 'ANOMALI';
  onSelectModule: (mod: 'ALL' | AuditModule | 'ANOMALI') => void;
}

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const MODULE_META: Record<AuditModule, { label: string; color: string }> = {
  IDENTITAS: { label: 'IDENTITAS', color: '#05828e' },
  'S-SALUR': { label: 'S-SALUR', color: '#10b981' },
  DONASI: { label: 'D-DONASI', color: '#f59e0b' },
  AJAR: { label: 'A-AJAR', color: '#6366f1' },
  MUTASI: { label: 'MUTASI', color: '#0ea5e9' },
  PROYEK: { label: 'PROYEK', color: '#8b5cf6' },
  PENGELUARAN: { label: 'PENGELUARAN', color: '#f43f5e' },
};

export function parseAuditLogDate(log: CentralAuditLogEntry): Date | null {
  const base = extractLogDate(log);
  if (base && !isNaN(base.getTime())) return base;

  if (log.timestamp) {
    // Handle DD/MM/YYYY formats if any
    const slashMatch = log.timestamp.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1], 10);
      const month = parseInt(slashMatch[2], 10) - 1;
      const year = parseInt(slashMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const AuditActivityStatsChart: React.FC<AuditActivityStatsChartProps> = ({
  logs,
  selectedDate,
  onSelectDate,
  selectedModule,
  onSelectModule,
}) => {
  const [viewTab, setViewTab] = useState<'both' | 'daily' | 'module'>('both');
  const [dayWindow, setDayWindow] = useState<7 | 14 | 30>(14);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const { dailyData, moduleData, peakDay, dailyAverage, dominantModule } = useMemo(() => {
    const filteredByModule =
      selectedModule !== 'ALL' && selectedModule !== 'ANOMALI'
        ? logs.filter((l) => l.module === selectedModule)
        : logs;

    // 1. Build continuous daily series over the chosen dayWindow ending at the latest log date (or today)
    const dayMap: Record<
      string,
      { total: number; salur: number; donasi: number; ajar: number; identitas: number }
    > = {};

    let latestMs = Date.now();
    const parsedEntries: { date: Date; log: CentralAuditLogEntry }[] = [];

    filteredByModule.forEach((log) => {
      const d = parseAuditLogDate(log);
      if (!d) return;
      parsedEntries.push({ date: d, log });
      if (d.getTime() > latestMs) {
        latestMs = d.getTime();
      }
    });

    parsedEntries.forEach(({ date, log }) => {
      const key = toLocalDateKey(date);
      if (!dayMap[key]) {
        dayMap[key] = { total: 0, salur: 0, donasi: 0, ajar: 0, identitas: 0 };
      }
      dayMap[key].total += 1;
      if (log.module === 'S-SALUR') dayMap[key].salur += 1;
      else if (log.module === 'DONASI') dayMap[key].donasi += 1;
      else if (log.module === 'AJAR') dayMap[key].ajar += 1;
      else if (log.module === 'IDENTITAS') dayMap[key].identitas += 1;
    });

    // Anchor end date to latest log date if all logs are older than today, otherwise today
    const now = new Date();
    const anchorDate = new Date(
      Math.max(now.getFullYear(), new Date(latestMs).getFullYear()),
      now.getMonth(),
      now.getDate()
    );
    if (parsedEntries.length > 0) {
      const maxLogTime = Math.max(...parsedEntries.map((p) => p.date.getTime()));
      const oldestWindowStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (dayWindow - 1)
      ).getTime();
      // If all logs are older than the window from today, center end on max log date
      if (maxLogTime < oldestWindowStart) {
        const md = new Date(maxLogTime);
        anchorDate.setFullYear(md.getFullYear(), md.getMonth(), md.getDate());
      }
    }

    const dailyPoints: DailyAuditPoint[] = [];
    for (let i = dayWindow - 1; i >= 0; i--) {
      const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate() - i);
      const key = toLocalDateKey(d);
      const bucket = dayMap[key] || { total: 0, salur: 0, donasi: 0, ajar: 0, identitas: 0 };
      dailyPoints.push({
        dateKey: key,
        label: `${d.getDate()} ${MONTH_SHORT_ID[d.getMonth()]}`,
        fullDate: d.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        total: bucket.total,
        salur: bucket.salur,
        donasi: bucket.donasi,
        ajar: bucket.ajar,
        identitas: bucket.identitas,
      });
    }

    // 2. Build module distribution across all logs
    const modCounts: Record<AuditModule, number> = {
      IDENTITAS: 0,
      'S-SALUR': 0,
      DONASI: 0,
      AJAR: 0,
      MUTASI: 0,
      PROYEK: 0,
      PENGELUARAN: 0,
    };
    logs.forEach((l) => {
      if (modCounts[l.module] !== undefined) {
        modCounts[l.module] += 1;
      }
    });

    const coreModules: AuditModule[] = ['IDENTITAS', 'S-SALUR', 'DONASI', 'AJAR'];
    const totalAll = logs.length || 1;
    const modPoints: ModuleCategoryPoint[] = (Object.keys(MODULE_META) as AuditModule[])
      .filter((mod) => coreModules.includes(mod) || modCounts[mod] > 0)
      .map((mod) => ({
        module: mod,
        label: MODULE_META[mod].label,
        count: modCounts[mod],
        pct: Math.round((modCounts[mod] / totalAll) * 100),
        color: MODULE_META[mod].color,
      }))
      .sort((a, b) => b.count - a.count);

    const peak =
      dailyPoints.reduce<DailyAuditPoint | null>(
        (best, cur) => (cur.total > (best?.total || 0) ? cur : best),
        null
      ) || null;

    const totalInWindow = dailyPoints.reduce((sum, p) => sum + p.total, 0);
    const avg = Math.round((totalInWindow / dayWindow) * 10) / 10;

    const dom = modPoints[0] && modPoints[0].count > 0 ? modPoints[0] : null;

    return {
      dailyData: dailyPoints,
      moduleData: modPoints,
      peakDay: peak,
      dailyAverage: avg,
      dominantModule: dom,
    };
  }, [logs, selectedModule, dayWindow]);

  const DailyTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0]?.payload as DailyAuditPoint;
    if (!pt) return null;

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[195px]">
        <div className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1">
          {pt.fullDate}
        </div>
        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
          <span>Total Aktivitas</span>
          <span className="font-mono tabular-nums text-[#05828e] dark:text-[#2dd4bf]">
            {pt.total} perubahan
          </span>
        </div>
        {pt.total > 0 && (
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>IDENTITAS</span>
              <span className="font-mono tabular-nums">{pt.identitas}</span>
            </div>
            <div className="flex justify-between">
              <span>S-SALUR</span>
              <span className="font-mono tabular-nums">{pt.salur}</span>
            </div>
            <div className="flex justify-between">
              <span>D-DONASI</span>
              <span className="font-mono tabular-nums">{pt.donasi}</span>
            </div>
            <div className="flex justify-between">
              <span>A-AJAR</span>
              <span className="font-mono tabular-nums">{pt.ajar}</span>
            </div>
          </div>
        )}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
          Klik titik tanggal untuk memfilter log
        </div>
      </div>
    );
  };

  const ModuleTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0]?.payload as ModuleCategoryPoint;
    if (!pt) return null;

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-[175px]">
        <div className="font-bold text-slate-900 dark:text-slate-100">{pt.label}</div>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Jumlah Perubahan</span>
          <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
            {pt.count} ({pt.pct}%)
          </span>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
          Klik batang untuk filter modul
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <BarChart3 className="w-4 h-4 text-[#05828e] dark:text-[#2dd4bf] shrink-0" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Statistik Pola Aktivitas Audit
            </h2>
          </div>
          {/* Quiet unboxed summary metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Rata-rata:{' '}
              <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {dailyAverage}/hari
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Hari Teraktif:{' '}
              <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {peakDay ? `${peakDay.label} (${peakDay.total})` : '-'}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Modul Dominan:{' '}
              <strong className="text-[#05828e] dark:text-[#2dd4bf]">
                {dominantModule ? `${dominantModule.label} (${dominantModule.pct}%)` : '-'}
              </strong>
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/80 dark:bg-teal-950/50 text-[#05828e] dark:text-[#2dd4bf] text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tanggal: {selectedDate}</span>
            </button>
          )}

          {/* Chart Mode Segmented Switch */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewTab('both')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                viewTab === 'both'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Ringkas
            </button>
            <button
              type="button"
              onClick={() => setViewTab('daily')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                viewTab === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Per Hari
            </button>
            <button
              type="button"
              onClick={() => setViewTab('module')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                viewTab === 'module'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Per Modul
            </button>
          </div>

          {/* Day Window Switch */}
          {viewTab !== 'module' && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              {([7, 14, 30] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDayWindow(days)}
                  className={`px-2 py-1 rounded-md font-mono tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                    dayWindow === days
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {days}H
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Sembunyikan Statistik' : 'Tampilkan Statistik'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Charts Content */}
      {isExpanded && (
        <div
          className={`grid grid-cols-1 gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 ${
            viewTab === 'both' ? 'lg:grid-cols-12' : ''
          }`}
        >
          {/* Daily Trend Chart */}
          {(viewTab === 'both' || viewTab === 'daily') && (
            <div className={viewTab === 'both' ? 'lg:col-span-7 space-y-2' : 'space-y-2'}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
                  <span>Tren Perubahan Harian ({dayWindow} Hari)</span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Klik titik grafik untuk filter per tanggal
                </span>
              </div>

              <div className="w-full h-56">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4">
                    <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1.5" />
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Belum ada aktivitas tercatat
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyData}
                      margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
                      onClick={(state: any) => {
                        const pt = state?.activePayload?.[0]?.payload as DailyAuditPoint | undefined;
                        if (pt?.dateKey) {
                          onSelectDate(selectedDate === pt.dateKey ? null : pt.dateKey);
                        }
                      }}
                    >
                      <defs>
                        <linearGradient id="auditDailyFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#05828e" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#05828e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#94a3b8"
                        strokeOpacity={0.2}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1', strokeOpacity: 0.4 }}
                        minTickGap={16}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<DailyTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Aktivitas Harian"
                        stroke="#05828e"
                        strokeWidth={2.25}
                        fill="url(#auditDailyFill)"
                        activeDot={{ r: 5, fill: '#05828e', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Module Category Breakdown Chart */}
          {(viewTab === 'both' || viewTab === 'module') && (
            <div
              className={
                viewTab === 'both'
                  ? 'lg:col-span-5 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6 space-y-2'
                  : 'space-y-2'
              }
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />
                  <span>Distribusi per Kategori Modul</span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Klik batang untuk filter
                </span>
              </div>

              <div className="w-full h-56">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4">
                    <Layers className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1.5" />
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Belum ada distribusi modul
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={moduleData}
                      margin={{ top: 8, right: 12, left: -22, bottom: 0 }}
                      onClick={(state: any) => {
                        const pt = state?.activePayload?.[0]?.payload as
                          | ModuleCategoryPoint
                          | undefined;
                        if (pt?.module) {
                          onSelectModule(selectedModule === pt.module ? 'ALL' : pt.module);
                        }
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#94a3b8"
                        strokeOpacity={0.2}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1', strokeOpacity: 0.4 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<ModuleTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                      <Bar dataKey="count" name="Perubahan" radius={[6, 6, 0, 0]} maxBarSize={52}>
                        {moduleData.map((entry) => {
                          const isDimmed =
                            selectedModule !== 'ALL' &&
                            selectedModule !== 'ANOMALI' &&
                            selectedModule !== entry.module;
                          return (
                            <Cell
                              key={entry.module}
                              fill={entry.color}
                              fillOpacity={isDimmed ? 0.3 : 1}
                              className="cursor-pointer"
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
