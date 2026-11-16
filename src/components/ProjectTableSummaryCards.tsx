import React, { useMemo } from 'react';
import { FolderKanban, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '../types';
import { SalurOrder, SalurProduct } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { calculateAllProjectsRevenue } from '../utils/projectRevenueHelper';
import {
  resolveProjectDeadlineIso,
  toLocalIsoDate,
  diffDaysBetweenIso,
  SEED_REFERENCE_DATE_ISO,
} from '../utils/projectDeadlineUtils';
import {
  parseFinancialDateToIso,
  formatIsoDateIndo,
} from '../utils/financialDateFilter';
import { resolveProjectPersiapanRangeIso } from '../utils/projectPersiapanFilter';

interface ProjectTableSummaryCardsProps {
  projects: ProjectItem[];
  salurOrders: SalurOrder[];
  salurProducts: SalurProduct[];
  donasiOrders: DonasiOrder[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onFilterCurrentMonthPersiapan?: (monthStartIso: string, monthEndIso: string) => void;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTH_NAME_REGEX =
  '(?:jan(?:uari|uary)?|feb(?:ruari|ruary)?|mar(?:et|ch)?|apr(?:il)?|mei|may|jun(?:i|e)?|jul(?:i|y)?|agu(?:stus)?|agt|aug(?:ust)?|sep(?:tember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|des(?:ember)?|dec(?:ember)?)';
const YEAR_REGEX = '(?:19|20)\\d{2}';

function resolveProjectExecutionRangeIso(project: ProjectItem): {
  startIso: string | null;
  endIso: string | null;
} {
  let startIso = project.tanggalStart
    ? parseFinancialDateToIso(project.tanggalStart)
    : null;
  let endIso = project.tanggalEnd
    ? parseFinancialDateToIso(project.tanggalEnd)
    : null;

  if ((!startIso || !endIso) && project.tanggal) {
    const raw = project.tanggal.trim();
    if (raw && raw !== '-') {
      const rangeParts = raw
        .split(/\s+[-–—]\s+|\s+s\/d\s+/i)
        .map((p) => p.trim())
        .filter(Boolean);

      if (rangeParts.length >= 2) {
        const first = rangeParts[0];
        const last = rangeParts[rangeParts.length - 1];
        const parsedEnd = parseFinancialDateToIso(last);
        const monthMatch = last.match(new RegExp(`(${MONTH_NAME_REGEX})`, 'i'));
        const yearMatch = last.match(new RegExp(`(${YEAR_REGEX})`));

        let parsedStart: string | null = null;
        if (/^\d{1,2}$/.test(first)) {
          parsedStart = parseFinancialDateToIso(
            `${first}${monthMatch ? ` ${monthMatch[1]}` : ''}${yearMatch ? ` ${yearMatch[1]}` : ''}`.trim()
          );
        } else if (
          new RegExp(MONTH_NAME_REGEX, 'i').test(first) &&
          !new RegExp(YEAR_REGEX).test(first) &&
          yearMatch
        ) {
          parsedStart = parseFinancialDateToIso(`${first} ${yearMatch[1]}`);
        } else {
          parsedStart = parseFinancialDateToIso(first);
        }

        if (!startIso && parsedStart) startIso = parsedStart;
        if (!endIso && parsedEnd) endIso = parsedEnd;
      } else {
        const compactMatch = raw.match(
          new RegExp(
            `^(\\d{1,2})\\s*[-–]\\s*(\\d{1,2}\\s+${MONTH_NAME_REGEX}(?:\\s+${YEAR_REGEX})?)$`,
            'i'
          )
        );
        if (compactMatch) {
          const parsedEnd = parseFinancialDateToIso(compactMatch[2]);
          const monthMatch = compactMatch[2].match(new RegExp(`(${MONTH_NAME_REGEX})`, 'i'));
          const yearMatch = compactMatch[2].match(new RegExp(`(${YEAR_REGEX})`));
          const parsedStart = parseFinancialDateToIso(
            `${compactMatch[1]}${monthMatch ? ` ${monthMatch[1]}` : ''}${yearMatch ? ` ${yearMatch[1]}` : ''}`.trim()
          );
          if (!startIso && parsedStart) startIso = parsedStart;
          if (!endIso && parsedEnd) endIso = parsedEnd;
        } else {
          const single = parseFinancialDateToIso(raw);
          if (!startIso && single) startIso = single;
          if (!endIso && single) endIso = single;
        }
      }
    }
  }

  if (startIso && !endIso) endIso = startIso;
  if (!startIso && endIso) startIso = endIso;
  if (startIso && endIso && startIso > endIso) {
    return { startIso: endIso, endIso: startIso };
  }
  return { startIso, endIso };
}

function isProjectInMonthWindow(
  project: ProjectItem,
  monthStartIso: string,
  monthEndIso: string
): boolean {
  const exec = resolveProjectExecutionRangeIso(project);
  if (exec.startIso && exec.endIso) {
    return exec.endIso >= monthStartIso && exec.startIso <= monthEndIso;
  }

  const deadlineIso = resolveProjectDeadlineIso(project);
  if (deadlineIso) {
    return deadlineIso >= monthStartIso && deadlineIso <= monthEndIso;
  }

  const prep = resolveProjectPersiapanRangeIso(project);
  if (prep.startIso && prep.endIso) {
    return prep.endIso >= monthStartIso && prep.startIso <= monthEndIso;
  }

  return false;
}

export const ProjectTableSummaryCards: React.FC<ProjectTableSummaryCardsProps> = ({
  projects,
  salurOrders,
  salurProducts,
  donasiOrders,
  activeStatusFilter,
  onSelectStatusFilter,
  onFilterCurrentMonthPersiapan,
}) => {
  const metrics = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const monthLabel = `${MONTH_NAMES_ID[monthIndex]} ${year}`;
    const mm = String(monthIndex + 1).padStart(2, '0');
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const monthStartIso = `${year}-${mm}-01`;
    const monthEndIso = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;
    const todayIso = toLocalIsoDate(now);

    let ongoingCount = 0;
    let waitingAccCount = 0;
    let doneCount = 0;

    let nearingDeadlineRealCount = 0;
    let urgentDeadlineRealCount = 0;
    let nearestDeadlineProject: { name: string; days: number; deadlineIso: string } | null = null;
    let nearingDeadlineSeedCount = 0;

    projects.forEach((project) => {
      const statusLower = (project.status || '').trim().toLowerCase();
      const isDone = statusLower === 'done' || statusLower.includes('done');
      const isWaiting = statusLower.includes('waiting');

      if (isDone) {
        doneCount += 1;
      } else if (isWaiting) {
        waitingAccCount += 1;
      } else {
        ongoingCount += 1;
      }

      if (!isDone) {
        const deadlineIso = resolveProjectDeadlineIso(project);
        if (deadlineIso) {
          const daysReal = diffDaysBetweenIso(deadlineIso, todayIso);
          if (daysReal >= 0 && daysReal <= 7) {
            nearingDeadlineRealCount += 1;
            if (daysReal <= 2) urgentDeadlineRealCount += 1;
            if (!nearestDeadlineProject || daysReal < nearestDeadlineProject.days) {
              nearestDeadlineProject = {
                name: project.namaKegiatan,
                days: daysReal,
                deadlineIso,
              };
            }
          }

          const daysSeed = diffDaysBetweenIso(deadlineIso, SEED_REFERENCE_DATE_ISO);
          if (daysSeed >= 0 && daysSeed <= 7) {
            nearingDeadlineSeedCount += 1;
          }
        }
      }
    });

    const activeCount = ongoingCount + waitingAccCount;

    const { projections } = calculateAllProjectsRevenue(
      projects,
      salurOrders,
      salurProducts,
      donasiOrders
    );

    const currentMonthProjects = projects.filter((p) =>
      isProjectInMonthWindow(p, monthStartIso, monthEndIso)
    );

    const currentMonthProjectedRevenue = currentMonthProjects.reduce((sum, proj) => {
      const rev = projections.get(proj.id)?.projectedRevenue ?? 0;
      return sum + rev;
    }, 0);

    return {
      totalCount: projects.length,
      activeCount,
      ongoingCount,
      waitingAccCount,
      doneCount,
      nearingDeadlineRealCount,
      urgentDeadlineRealCount,
      nearestDeadlineProject,
      nearingDeadlineSeedCount,
      monthLabel,
      monthStartIso,
      monthEndIso,
      currentMonthProjectCount: currentMonthProjects.length,
      currentMonthProjectedRevenue,
    };
  }, [projects, salurOrders, salurProducts, donasiOrders]);

  const isOngoingFiltered = activeStatusFilter === 'Ongoing';

  return (
    <section
      aria-label="Ringkasan Proyek SAPA"
      className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4"
    >
      {/* Card 1: Total Proyek Aktif */}
      <button
        id="summary-card-active-projects"
        type="button"
        onClick={() => onSelectStatusFilter(isOngoingFiltered ? 'ALL' : 'Ongoing')}
        className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05828e] ${
          isOngoingFiltered
            ? 'border-[#05828e] bg-teal-50/20 dark:bg-teal-950/30'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Proyek Aktif</p>
            <p className="mt-2 text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums leading-none">
              {metrics.activeCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-400 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          <span className="truncate">
            {metrics.ongoingCount} Ongoing · {metrics.waitingAccCount} Waiting Acc ·{' '}
            {metrics.doneCount} Done
          </span>
          <span className="text-[#05828e] dark:text-teal-400 font-semibold inline-flex items-center gap-0.5 whitespace-nowrap shrink-0">
            <span>{isOngoingFiltered ? 'Tampilkan Semua' : 'Filter Ongoing'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>

      {/* Card 2: Proyek Mendekati Deadline (<= 7 Hari) */}
      <button
        id="summary-card-nearing-deadlines"
        type="button"
        onClick={() => onSelectStatusFilter(isOngoingFiltered ? 'ALL' : 'Ongoing')}
        className="text-left bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05828e]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Proyek Mendekati Deadline
            </p>
            <p
              className={`mt-2 text-2xl sm:text-[28px] font-extrabold tracking-tight tabular-nums leading-none ${
                metrics.urgentDeadlineRealCount > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : metrics.nearingDeadlineRealCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {metrics.nearingDeadlineRealCount}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              metrics.urgentDeadlineRealCount > 0
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : metrics.nearingDeadlineRealCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {metrics.nearestDeadlineProject ? (
            <span className="truncate">
              Terdekat: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{metrics.nearestDeadlineProject.name}</strong>{' '}
              ({metrics.nearestDeadlineProject.days === 0
                ? 'Hari ini'
                : `H+${metrics.nearestDeadlineProject.days}`}{' '}
              · {formatIsoDateIndo(metrics.nearestDeadlineProject.deadlineIso)})
            </span>
          ) : metrics.nearingDeadlineSeedCount > 0 ? (
            <span className="truncate">
              0 dalam 7 hari ke depan · {metrics.nearingDeadlineSeedCount} di periode arsip
            </span>
          ) : (
            <span className="truncate">Tidak ada deadline dalam 7 hari ke depan</span>
          )}
          <span className="text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap shrink-0">
            Rentang 7 hari
          </span>
        </div>
      </button>

      {/* Card 3: Total Proyeksi Pendapatan Bulan Ini */}
      <button
        id="summary-card-monthly-projected-revenue"
        type="button"
        onClick={() =>
          onFilterCurrentMonthPersiapan?.(metrics.monthStartIso, metrics.monthEndIso)
        }
        className="text-left bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05828e]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Proyeksi Pendapatan Bulan Ini
            </p>
            <p className="mt-2 text-2xl sm:text-[26px] font-extrabold text-[#05828e] dark:text-teal-400 tracking-tight tabular-nums leading-none truncate">
              Rp {metrics.currentMonthProjectedRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          <span className="truncate">
            {metrics.monthLabel} · {metrics.currentMonthProjectCount} proyek terjadwal
          </span>
          <span className="text-[#05828e] dark:text-teal-400 font-semibold inline-flex items-center gap-0.5 whitespace-nowrap shrink-0">
            <span>Filter Bulan Ini</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>
    </section>
  );
};
