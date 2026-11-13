import React, { useMemo, useState } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  Calendar,
  MapPin,
  ArrowUpRight,
  Check,
  RotateCcw,
  ListTodo,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { ProjectItem, AppView } from '../types';
import { ProjectDeadlineNotificationItem } from '../utils/projectDeadlineUtils';
import { formatIsoDateIndo } from '../utils/financialDateFilter';

export type NotificationScopeMode = 'all' | 'division';
export type NotificationReferenceMode = 'real' | 'seed';

const MONTH_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

interface HomeProjectDeadlineNotificationsProps {
  notifications: ProjectDeadlineNotificationItem[];
  totalAvailableCount: number;
  activeDivisi: string;
  scopeMode: NotificationScopeMode;
  onChangeScopeMode: (mode: NotificationScopeMode) => void;
  referenceMode: NotificationReferenceMode;
  onChangeReferenceMode: (mode: NotificationReferenceMode) => void;
  activeReferenceIso: string;
  windowEndIso: string;
  realTimeCount: number;
  seedCount: number;
  dismissedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDismissNotification: (projectId: string) => void;
  onDismissAll: () => void;
  onRestoreDismissed: () => void;
  onOpenProjectDetail?: (project: ProjectItem) => void;
  onOpenProjectReport?: (project: ProjectItem) => void;
  onOpenProjectTodos?: (project: ProjectItem) => void;
  onNavigateView: (view: AppView) => void;
}

export const HomeProjectDeadlineNotifications: React.FC<
  HomeProjectDeadlineNotificationsProps
> = ({
  notifications,
  totalAvailableCount,
  activeDivisi,
  scopeMode,
  onChangeScopeMode,
  referenceMode,
  onChangeReferenceMode,
  activeReferenceIso,
  windowEndIso,
  realTimeCount,
  seedCount,
  dismissedCount,
  isCollapsed,
  onToggleCollapse,
  onDismissNotification,
  onDismissAll,
  onRestoreDismissed,
  onOpenProjectDetail,
  onOpenProjectReport,
  onOpenProjectTodos,
  onNavigateView,
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number | null>(null);

  const unreadCount = notifications.length;
  const criticalCount = notifications.filter((n) => n.urgencyLevel === 'critical').length;
  const warningCount = unreadCount - criticalCount;
  const dueTodayCount = notifications.filter((n) => n.daysRemaining === 0).length;
  const nearestProject = notifications[0] || null;

  // Distribusi harian H+0 sampai H+7 untuk visual timeline mini-chart
  const dailyBuckets = useMemo(() => {
    const [y, m, d] = activeReferenceIso.split('-').map(Number);
    const days = Array.from({ length: 8 }, (_, offset) => {
      const dt = new Date(y, m - 1, d + offset);
      const dayLabel =
        offset === 0 ? 'Hari Ini' : offset === 1 ? 'Besok' : `H+${offset}`;
      const shortDate = `${dt.getDate()} ${MONTH_SHORT_ID[dt.getMonth()] || ''}`;
      const items = notifications.filter((n) => n.daysRemaining === offset);
      return {
        offset,
        dayLabel,
        shortDate,
        count: items.length,
        items,
        isCritical: offset <= 2,
      };
    });

    const maxCount = Math.max(1, ...days.map((b) => b.count));
    return { days, maxCount };
  }, [activeReferenceIso, notifications]);

  // Daftar yang ditampilkan setelah filter interaktif pada ringkasan visual
  const displayedNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (selectedDayOffset !== null && item.daysRemaining !== selectedDayOffset) {
        return false;
      }
      if (urgencyFilter !== 'all' && item.urgencyLevel !== urgencyFilter) {
        return false;
      }
      return true;
    });
  }, [notifications, selectedDayOffset, urgencyFilter]);

  const criticalRatio = unreadCount > 0 ? Math.round((criticalCount / unreadCount) * 100) : 0;
  const warningRatio = unreadCount > 0 ? 100 - criticalRatio : 0;

  return (
    <section
      id="home-deadline-notifications"
      aria-label="Ringkasan dan Notifikasi Deadline Proyek Ongoing dalam 7 Hari Ke Depan"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              unreadCount === 0
                ? 'bg-emerald-50 text-emerald-600'
                : criticalCount > 0
                ? 'bg-rose-50 text-rose-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            <Bell className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Ringkasan & Notifikasi Jatuh Tempo Proyek (7 Hari)
              </h2>
              <span
                className={`text-xs font-bold tabular-nums ${
                  unreadCount === 0
                    ? 'text-emerald-700'
                    : criticalCount > 0
                    ? 'text-rose-600'
                    : 'text-amber-700'
                }`}
              >
                · {unreadCount} proyek jatuh tempo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
              <span>Status: Ongoing</span>
              <span aria-hidden="true">·</span>
              <span>
                Rentang: {formatIsoDateIndo(activeReferenceIso)} – {formatIsoDateIndo(windowEndIso)}
              </span>
              {criticalCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-rose-600">
                    {criticalCount} mendesak (≤ 2 hari)
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Scope Segmented Control */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => {
                onChangeScopeMode('all');
                setSelectedDayOffset(null);
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                scopeMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Divisi
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeScopeMode('division');
                setSelectedDayOffset(null);
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                scopeMode === 'division'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Divisi {activeDivisi === 'ALL' ? 'Semua' : activeDivisi}
            </button>
          </div>

          {/* Reference Date Segmented Control */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => {
                onChangeReferenceMode('real');
                setSelectedDayOffset(null);
              }}
              title="Hitung 7 hari ke depan dari tanggal hari ini (real-time)"
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                referenceMode === 'real'
                  ? 'bg-white text-[#05828e] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini ({realTimeCount})
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeReferenceMode('seed');
                setSelectedDayOffset(null);
              }}
              title="Hitung 7 hari ke depan dari tanggal data awal proyek (15 Nov 2021)"
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                referenceMode === 'seed'
                  ? 'bg-white text-[#05828e] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15 Nov 2021 ({seedCount})
            </button>
          </div>

          {dismissedCount > 0 && (
            <button
              type="button"
              onClick={onRestoreDismissed}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Pulihkan ({dismissedCount})</span>
            </button>
          )}

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onDismissAll}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tandai Dibaca</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Tampilkan daftar notifikasi' : 'Ciutkan daftar notifikasi'}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ELEMEN VISUAL RINGKASAN JUMLAH PROYEK JATUH TEMPO 7 HARI KE DEPAN */}
      {/* ================================================================= */}
      <div className="bg-slate-50/60 border-b border-slate-100 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/70">
        {/* Kiri: Angka Ringkasan, Proporsi Urgensi & Tombol Respons Cepat */}
        <div className="lg:col-span-5 p-4 sm:px-5 flex flex-col justify-between gap-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Jatuh Tempo dalam 7 Hari
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                    unreadCount === 0
                      ? 'text-emerald-600'
                      : criticalCount > 0
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {unreadCount}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  Proyek Ongoing
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                {unreadCount === 0
                  ? 'Semua target 7 hari ke depan dalam kondisi aman.'
                  : dueTodayCount > 0
                  ? `${dueTodayCount} proyek jatuh tempo hari ini · butuh tindak lanjut segera`
                  : `Terdekat dalam ${nearestProject?.daysRemaining ?? 0} hari (${nearestProject?.deadlineDisplay})`}
              </p>
            </div>

            {nearestProject && (onOpenProjectDetail || onOpenProjectReport) && (
              <button
                type="button"
                onClick={() =>
                  onOpenProjectDetail
                    ? onOpenProjectDetail(nearestProject.project)
                    : onOpenProjectReport?.(nearestProject.project)
                }
                className="px-3.5 py-2 rounded-xl bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs"
                title={`Respons segera proyek terdekat: ${nearestProject.project.namaKegiatan}`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Respons Terdekat</span>
              </button>
            )}
          </div>

          {/* Interactive Severity Filter + Visual Distribution Bar */}
          <div className="space-y-2">
            {/* Bar proporsi visual */}
            <div
              className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden flex"
              role="img"
              aria-label={`Proporsi urgensi: ${criticalCount} mendesak, ${warningCount} dalam minggu ini`}
            >
              {unreadCount === 0 ? (
                <div className="h-full bg-emerald-500 w-full transition-all duration-300" />
              ) : (
                <>
                  {criticalRatio > 0 && (
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${criticalRatio}%` }}
                    />
                  )}
                  {warningRatio > 0 && (
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${warningRatio}%` }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Filter Kategori Urgensi Interaktif */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setUrgencyFilter('all');
                  setSelectedDayOffset(null);
                  if (isCollapsed) onToggleCollapse();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer tabular-nums inline-flex items-center gap-1.5 whitespace-nowrap ${
                  urgencyFilter === 'all' && selectedDayOffset === null
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Semua ({unreadCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUrgencyFilter((prev) => (prev === 'critical' ? 'all' : 'critical'));
                  setSelectedDayOffset(null);
                  if (isCollapsed) onToggleCollapse();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer tabular-nums inline-flex items-center gap-1.5 whitespace-nowrap ${
                  urgencyFilter === 'critical'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Mendesak ≤ 2 Hari ({criticalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUrgencyFilter((prev) => (prev === 'warning' ? 'all' : 'warning'));
                  setSelectedDayOffset(null);
                  if (isCollapsed) onToggleCollapse();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer tabular-nums inline-flex items-center gap-1.5 whitespace-nowrap ${
                  urgencyFilter === 'warning'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>3–7 Hari ({warningCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kanan: Grafik Batang Sebaran Harian H+0 s/d H+7 */}
        <div className="lg:col-span-7 p-4 sm:px-5 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              Sebaran Jatuh Tempo Harian (Hari Ini s/d +7 Hari)
            </span>
            {selectedDayOffset !== null ? (
              <button
                type="button"
                onClick={() => setSelectedDayOffset(null)}
                className="text-xs font-semibold text-[#05828e] hover:underline cursor-pointer whitespace-nowrap"
              >
                Tampilkan semua hari
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">
                Klik batang hari untuk menyaring proyek
              </span>
            )}
          </div>

          <div className="grid grid-cols-8 gap-1.5 sm:gap-2 items-end pt-1">
            {dailyBuckets.days.map((bucket) => {
              const isSelected = selectedDayOffset === bucket.offset;
              const heightPct =
                bucket.count > 0
                  ? Math.max(28, Math.round((bucket.count / dailyBuckets.maxCount) * 100))
                  : 10;
              const barColor =
                bucket.count === 0
                  ? 'bg-slate-200'
                  : bucket.isCritical
                  ? 'bg-rose-500 group-hover:bg-rose-600'
                  : 'bg-amber-500 group-hover:bg-amber-600';

              const tooltipText =
                bucket.count > 0
                  ? `${bucket.shortDate}: ${bucket.items
                      .map((it) => it.project.namaKegiatan)
                      .join(', ')}`
                  : `${bucket.shortDate}: Tidak ada proyek jatuh tempo`;

              return (
                <button
                  key={bucket.offset}
                  type="button"
                  title={tooltipText}
                  onClick={() => {
                    if (bucket.count === 0) return;
                    setSelectedDayOffset((prev) =>
                      prev === bucket.offset ? null : bucket.offset
                    );
                    setUrgencyFilter('all');
                    if (isCollapsed) onToggleCollapse();
                  }}
                  className={`group flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors ${
                    bucket.count > 0 ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isSelected
                      ? 'bg-teal-50 ring-1 ring-[#05828e]'
                      : bucket.count > 0
                      ? 'hover:bg-white'
                      : ''
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold tabular-nums leading-none ${
                      bucket.count === 0
                        ? 'text-slate-400'
                        : bucket.isCritical
                        ? 'text-rose-600'
                        : 'text-amber-700'
                    }`}
                  >
                    {bucket.count}
                  </span>

                  <div className="w-full h-12 flex items-end justify-center px-1">
                    <div
                      className={`w-full max-w-[26px] rounded-t-md transition-all duration-200 ${barColor}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-bold leading-tight whitespace-nowrap ${
                      bucket.offset === 0
                        ? 'text-slate-900'
                        : isSelected
                        ? 'text-[#05828e]'
                        : 'text-slate-600'
                    }`}
                  >
                    {bucket.dayLabel}
                  </span>
                  <span className="text-[9.5px] text-slate-400 tabular-nums leading-none whitespace-nowrap">
                    {bucket.shortDate}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body Daftar Notifikasi */}
      {!isCollapsed && (
        <div>
          {displayedNotifications.length === 0 ? (
            <div className="px-5 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  {unreadCount === 0 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {dismissedCount > 0 && totalAvailableCount > 0
                      ? 'Semua notifikasi deadline proyek telah ditandai dibaca.'
                      : urgencyFilter !== 'all' || selectedDayOffset !== null
                      ? 'Tidak ada proyek pada kategori atau hari yang dipilih.'
                      : 'Tidak ada proyek Ongoing dengan deadline dalam 7 hari ke depan.'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    Periode pantau: {formatIsoDateIndo(activeReferenceIso)} – {formatIsoDateIndo(windowEndIso)}
                    {scopeMode === 'division' && activeDivisi !== 'ALL'
                      ? ` · Filter Divisi ${activeDivisi}`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {(urgencyFilter !== 'all' || selectedDayOffset !== null) && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrgencyFilter('all');
                      setSelectedDayOffset(null);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Tampilkan Semua ({unreadCount})
                  </button>
                )}
                {scopeMode === 'division' && activeDivisi !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => onChangeScopeMode('all')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Lihat Semua Divisi
                  </button>
                )}
                {referenceMode === 'real' && seedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onChangeReferenceMode('seed')}
                    className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs font-semibold text-[#05828e] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Lihat Data 15 Nov 2021 ({seedCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigateView('table')}
                  className="px-4 py-2 rounded-xl bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Kelola Proyek SAPA</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {displayedNotifications.map((item) => {
                const { project, deadlineDisplay, daysRemaining, urgencyLevel, todoTotal, todoCompleted } =
                  item;
                const isToday = daysRemaining === 0;
                const isTomorrow = daysRemaining === 1;
                const remainingLabel = isToday
                  ? 'Deadline Hari Ini'
                  : isTomorrow
                  ? 'Besok (1 hari lagi)'
                  : `${daysRemaining} hari lagi`;

                return (
                  <li
                    key={project.id}
                    className="px-5 py-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Urgency Icon Indicator */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          urgencyLevel === 'critical'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {urgencyLevel === 'critical' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <button
                            type="button"
                            onClick={() => onOpenProjectDetail && onOpenProjectDetail(project)}
                            className="text-sm font-bold text-slate-900 hover:text-[#05828e] transition-colors text-left cursor-pointer truncate max-w-full"
                          >
                            {project.namaKegiatan}
                          </button>

                          <span
                            className={`text-xs font-bold tabular-nums inline-flex items-center gap-1 ${
                              urgencyLevel === 'critical' ? 'text-rose-600' : 'text-amber-700'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {remainingLabel}
                          </span>
                        </div>

                        {/* Unboxed Metadata Line */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 tabular-nums">
                          <span className="font-semibold text-slate-700">
                            Deadline {deadlineDisplay}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Divisi {project.divisi}</span>
                          <span aria-hidden="true">·</span>
                          <span>{project.jenisProyek}</span>
                          {project.lokasi && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{project.lokasi}</span>
                              </span>
                            </>
                          )}
                          {todoTotal > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#05828e] font-medium">
                                {todoCompleted}/{todoTotal} To-Do selesai
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {onOpenProjectTodos && (
                        <button
                          type="button"
                          onClick={() => onOpenProjectTodos(project)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <ListTodo className="w-3.5 h-3.5 text-slate-500" />
                          <span>To-Do</span>
                        </button>
                      )}

                      {onOpenProjectDetail && (
                        <button
                          type="button"
                          onClick={() => onOpenProjectDetail(project)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Detail</span>
                        </button>
                      )}

                      {onOpenProjectReport && (
                        <button
                          type="button"
                          onClick={() => onOpenProjectReport(project)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <span>Buka Report</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDismissNotification(project.id)}
                        title="Tandai notifikasi ini sudah dibaca"
                        aria-label={`Tandai notifikasi ${project.namaKegiatan} sudah dibaca`}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
