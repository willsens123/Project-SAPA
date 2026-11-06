import React, { useMemo } from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { ProjectItem } from '../types';
import { SapaTimelineTask } from '../timelineProyekSapaData';

interface TimelineYangSudahDisetSectionProps {
  currentYear: number;
  currentMonth: number; // 0-indexed (10 = November)
  timelineTasks: SapaTimelineTask[];
  projects: ProjectItem[];
  selectedDivisi?: string;
}

const MONTH_NAMES = [
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

export const TimelineYangSudahDisetSection: React.FC<TimelineYangSudahDisetSectionProps> = ({
  currentYear,
  currentMonth,
  timelineTasks,
  projects,
  selectedDivisi = 'ALL',
}) => {
  // Filter scheduled tasks for current year, division, and month overlap
  const { monthTasks, yearTasks } = useMemo(() => {
    const scheduledInYear = timelineTasks.filter((t) => {
      if (!t.isScheduled || t.year !== currentYear) return false;
      if (selectedDivisi && selectedDivisi !== 'ALL') {
        return t.divisi?.toUpperCase() === selectedDivisi.toUpperCase();
      }
      return true;
    });

    // Filter tasks that overlap with currentMonth
    // In our system: each month has 4 weeks base.
    const monthStartWeek = currentMonth * 4;
    const monthEndWeek = currentMonth * 4 + 4; // allow week 1 to 5

    const overlapping = scheduledInYear.filter((t) => {
      const taskStart = t.startMonth * 4 + Math.max(0, t.startWeek - 1);
      const taskEnd = taskStart + Math.max(1, t.durationWeeks) - 1;
      return taskStart <= monthEndWeek && taskEnd >= monthStartWeek;
    });

    return {
      monthTasks: overlapping,
      yearTasks: scheduledInYear,
    };
  }, [timelineTasks, currentYear, currentMonth, selectedDivisi]);

  // Tasks to display: prefer monthTasks, fallback to yearTasks if empty so user always sees the set timeline
  const displayTasks = monthTasks.length > 0 ? monthTasks : yearTasks;
  const isShowingAllYear = monthTasks.length === 0 && yearTasks.length > 0;

  return (
    <div className="w-full flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/50 via-white to-slate-50 border border-teal-200/80 shadow-2xs">
      {/* 1. Header Bar: Title + Badges + Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-teal-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#009688] text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Timeline yang Sudah Diset
              </h2>
              <span className="text-[11px] font-semibold bg-[#009688] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                Rencana Proyek SAPA
              </span>
              <span className="text-[11px] font-bold bg-[#008d91] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                Divisi: {selectedDivisi === 'ALL' ? 'Semua Divisi' : selectedDivisi}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              To-do list proyek SAPA dan durasi minggu yang telah direncanakan pada timeline
            </p>
          </div>
        </div>

        {/* Quick Summary Counts */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-200 rounded-lg text-xs font-semibold text-teal-800 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#009688]" />
            <span>{displayTasks.length} To-Do Terjadwal</span>
          </div>
          {isShowingAllYear && (
            <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-medium">
              Menampilkan jadwal tahun {currentYear}
            </span>
          )}
        </div>
      </div>

      {/* 2. Timeline Grid Table */}
      {displayTasks.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-2 text-slate-500 bg-white/70 rounded-xl border border-dashed border-slate-200">
          <Calendar className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">
            Belum ada timeline yang diset untuk {MONTH_NAMES[currentMonth]} {currentYear}
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Atur timeline proyek SAPA pada menu "Timeline Proyek SAPA" untuk menentukan jadwal to-do list dan durasi minggu.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[840px] w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[240px_80px_160px_repeat(5,1fr)_120px_100px] items-center bg-slate-50/90 border-b border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700">
              <div>Proyek & To-Do List</div>
              <div className="text-center">Divisi</div>
              <div>Jadwal & Durasi</div>
              <div className="text-center text-slate-600">Minggu 1</div>
              <div className="text-center text-slate-600">Minggu 2</div>
              <div className="text-center text-slate-600">Minggu 3</div>
              <div className="text-center text-slate-600">Minggu 4</div>
              <div className="text-center text-slate-600">Minggu 5</div>
              <div className="text-center">Deadline</div>
              <div className="text-center">Status</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
              {displayTasks.map((t) => {
                // Determine which weeks of currentMonth this task spans
                const taskStartOverall = t.startMonth * 4 + Math.max(0, t.startWeek - 1);
                const taskEndOverall = taskStartOverall + Math.max(1, t.durationWeeks) - 1;

                // Weeks 1 to 5 in currentMonth
                const weekActive = [1, 2, 3, 4, 5].map((w) => {
                  const currentWeekOverall = currentMonth * 4 + (w - 1);
                  return (
                    currentWeekOverall >= taskStartOverall &&
                    currentWeekOverall <= taskEndOverall
                  );
                });

                const isSameMonth = t.startMonth === currentMonth;

                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[240px_80px_160px_repeat(5,1fr)_120px_100px] items-center px-3 py-2.5 text-xs hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Proyek & To-Do Title */}
                    <div className="flex flex-col pr-2 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 truncate" title={t.projectName}>
                          {t.projectName}
                        </span>
                      </div>
                      <span className="text-slate-600 font-medium truncate text-[11px]" title={t.taskTitle}>
                        {t.taskTitle}
                      </span>
                    </div>

                    {/* Divisi */}
                    <div className="flex justify-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {t.divisi || 'PNB'}
                      </span>
                    </div>

                    {/* Jadwal & Durasi */}
                    <div className="flex flex-col text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">
                        {MONTH_NAMES[t.startMonth]?.slice(0, 3)} M{t.startWeek}
                      </span>
                      <span className="text-[10px] text-teal-700 font-medium">
                        Durasi: {t.durationWeeks} Minggu
                      </span>
                    </div>

                    {/* Weeks 1 - 5 Columns */}
                    {weekActive.map((active, wIdx) => (
                      <div key={wIdx} className="flex items-center justify-center p-1">
                        {active ? (
                          <div
                            title={`${t.projectName}: Minggu ${wIdx + 1}`}
                            className="w-full h-6 rounded-md bg-[#facc15] hover:bg-[#eab308] text-slate-900 border border-amber-400/50 flex items-center justify-center text-[10px] font-bold shadow-2xs animate-in fade-in"
                          >
                            <span>M{wIdx + 1}</span>
                          </div>
                        ) : (
                          <div className="w-full h-1.5 rounded-full bg-slate-100/80"></div>
                        )}
                      </div>
                    ))}

                    {/* Target Deadline */}
                    <div className="text-center font-medium text-slate-700 text-[11px]">
                      {t.deadlineDate || '-'}
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center">
                      {t.completed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#009688] border border-teal-200">
                          <span>Target</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
