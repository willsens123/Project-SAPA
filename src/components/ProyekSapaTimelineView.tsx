import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  EyeOff,
  User,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowLeftRight,
  CalendarDays,
} from 'lucide-react';
import { ProjectItem, AppView } from '../types';
import {
  SapaTimelineTask,
  loadTimelineTasks,
  saveTimelineTasks,
  INITIAL_TIMELINE_TASKS,
} from '../timelineProyekSapaData';
import { ReportTodoListView } from './ReportTodoListView';

interface ProyekSapaTimelineViewProps {
  projects: ProjectItem[];
  onNavigateView?: (view: AppView) => void;
  onAddProject?: () => void;
  onShowToast?: (msg: string) => void;
  divisiOptions?: string[];
}

const MONTHS = [
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

const MONTH_FULL_NAMES = [
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

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

const DIVISI_OPTIONS = ['ALL', 'PNB', 'MAD', 'EVE', 'FUN', 'IT', 'OPERASIONAL'];

export const ProyekSapaTimelineView: React.FC<ProyekSapaTimelineViewProps> = ({
  projects,
  onNavigateView,
  onAddProject,
  onShowToast = (_msg: string) => {},
  divisiOptions,
}) => {
  const availableDivisi =
    divisiOptions && divisiOptions.length > 0
      ? ['ALL', ...divisiOptions]
      : DIVISI_OPTIONS;

  // Tasks state
  const [tasks, setTasks] = useState<SapaTimelineTask[]>(() => loadTimelineTasks());

  // Filter & Navigation states
  const [selectedYear, setSelectedYear] = useState<number>(2021);
  const [selectedDivisi, setSelectedDivisi] = useState<string>('PNB');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showDivisiDropdown, setShowDivisiDropdown] = useState<boolean>(false);
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});

  // Right panel unarranged pagination
  const [unarrangedPage, setUnarrangedPage] = useState<number>(0);

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<SapaTimelineTask | null>(null);

  // Form Fields
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formProjectName, setFormProjectName] = useState<string>('');
  const [formTaskTitle, setFormTaskTitle] = useState<string>('');
  const [formDivisi, setFormDivisi] = useState<string>('PNB');
  const [formYear, setFormYear] = useState<number>(2021);
  const [formIsScheduled, setFormIsScheduled] = useState<boolean>(true);
  const [formStartMonth, setFormStartMonth] = useState<number>(0);
  const [formStartWeek, setFormStartWeek] = useState<number>(1);
  const [formDurationWeeks, setFormDurationWeeks] = useState<number>(6);
  const [formDeadlineDate, setFormDeadlineDate] = useState<string>('');

  // Quick schedule modal from unarranged card
  const [quickScheduleTask, setQuickScheduleTask] = useState<SapaTimelineTask | null>(null);
  const [quickMonth, setQuickMonth] = useState<number>(0);
  const [quickWeek, setQuickWeek] = useState<number>(1);
  const [quickDuration, setQuickDuration] = useState<number>(4);

  // Persist tasks
  const handleUpdateTasks = (newTasks: SapaTimelineTask[]) => {
    setTasks(newTasks);
    saveTimelineTasks(newTasks);
  };

  // Toggle collapse for a project
  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Combined list of projects (from props + default projects + tasks' custom projects)
  const availableProjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; divisi: string }>();

    // From main projects
    projects.forEach((p) => {
      map.set(p.id, { id: p.id, name: p.namaKegiatan, divisi: p.divisi || 'PNB' });
    });

    // From tasks
    tasks.forEach((t) => {
      if (!map.has(t.projectId)) {
        map.set(t.projectId, { id: t.projectId, name: t.projectName, divisi: t.divisi });
      }
    });

    return Array.from(map.values());
  }, [projects, tasks]);

  // Filtered scheduled tasks for current Year & Divisi & Search
  const scheduledTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.isScheduled) return false;
      if (t.year !== selectedYear) return false;
      if (selectedDivisi !== 'ALL' && t.divisi !== selectedDivisi) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.taskTitle.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q) ||
          t.divisi.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, selectedYear, selectedDivisi, searchQuery]);

  // Group scheduled tasks by project
  const projectGroups = useMemo(() => {
    const groups: {
      projectId: string;
      projectName: string;
      divisi: string;
      tasks: SapaTimelineTask[];
    }[] = [];

    // Group existing scheduled tasks
    scheduledTasks.forEach((t) => {
      let g = groups.find((grp) => grp.projectId === t.projectId);
      if (!g) {
        g = {
          projectId: t.projectId,
          projectName: t.projectName,
          divisi: t.divisi,
          tasks: [],
        };
        groups.push(g);
      }
      g.tasks.push(t);
    });

    // If Divisi is selected, also include available projects in that Divisi so user can add to-dos
    if (selectedDivisi !== 'ALL') {
      availableProjects
        .filter((p) => p.divisi === selectedDivisi)
        .forEach((p) => {
          if (!groups.find((g) => g.projectId === p.id)) {
            groups.push({
              projectId: p.id,
              projectName: p.name,
              divisi: p.divisi,
              tasks: [],
            });
          }
        });
    }

    return groups;
  }, [scheduledTasks, selectedDivisi, availableProjects]);

  // Unscheduled tasks (To-do List yang belum di atur)
  const unscheduledTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.isScheduled) return false;
      if (selectedDivisi !== 'ALL' && t.divisi !== selectedDivisi) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.taskTitle.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q) ||
          (t.deadlineDate && t.deadlineDate.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tasks, selectedDivisi, searchQuery]);

  // Unarranged pagination items
  const PAGE_SIZE = 5;
  const paginatedUnscheduled = useMemo(() => {
    const start = unarrangedPage * PAGE_SIZE;
    return unscheduledTasks.slice(start, start + PAGE_SIZE);
  }, [unscheduledTasks, unarrangedPage]);

  const maxUnarrangedPages = Math.ceil(unscheduledTasks.length / PAGE_SIZE);

  // Open modal to add new task
  const handleOpenAddModal = (presetProjectId?: string) => {
    const targetProj = availableProjects.find((p) => p.id === presetProjectId) || availableProjects[0];
    setEditingTask(null);
    setFormProjectId(targetProj ? targetProj.id : 'proj-1');
    setFormProjectName(targetProj ? targetProj.name : 'Promo 11.11');
    setFormDivisi(selectedDivisi !== 'ALL' ? selectedDivisi : 'PNB');
    setFormTaskTitle('');
    setFormYear(selectedYear);
    setFormIsScheduled(true);
    setFormStartMonth(0);
    setFormStartWeek(1);
    setFormDurationWeeks(6);
    setFormDeadlineDate('');
    setIsModalOpen(true);
  };

  // Open modal to edit existing task
  const handleOpenEditModal = (task: SapaTimelineTask) => {
    setEditingTask(task);
    setFormProjectId(task.projectId);
    setFormProjectName(task.projectName);
    setFormDivisi(task.divisi);
    setFormTaskTitle(task.taskTitle);
    setFormYear(task.year);
    setFormIsScheduled(task.isScheduled);
    setFormStartMonth(task.startMonth);
    setFormStartWeek(task.startWeek);
    setFormDurationWeeks(task.durationWeeks);
    setFormDeadlineDate(task.deadlineDate || '');
    setIsModalOpen(true);
  };

  // Save task from modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTaskTitle.trim()) {
      onShowToast('Mohon masukkan nama to-do task.');
      return;
    }

    const proj = availableProjects.find((p) => p.id === formProjectId);
    const resolvedProjectName = proj ? proj.name : formProjectName || 'Proyek SAPA';

    if (editingTask) {
      // Edit existing
      const updated = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              projectId: formProjectId,
              projectName: resolvedProjectName,
              divisi: formDivisi,
              taskTitle: formTaskTitle.trim(),
              year: Number(formYear),
              isScheduled: formIsScheduled,
              startMonth: Number(formStartMonth),
              startWeek: Number(formStartWeek),
              durationWeeks: Math.max(1, Number(formDurationWeeks)),
              deadlineDate: formDeadlineDate.trim(),
            }
          : t
      );
      handleUpdateTasks(updated);
      onShowToast('To-Do task berhasil diperbarui.');
    } else {
      // Create new
      const newTask: SapaTimelineTask = {
        id: `timeline-task-${Date.now()}`,
        projectId: formProjectId,
        projectName: resolvedProjectName,
        divisi: formDivisi,
        taskTitle: formTaskTitle.trim(),
        year: Number(formYear),
        isScheduled: formIsScheduled,
        startMonth: Number(formStartMonth),
        startWeek: Number(formStartWeek),
        durationWeeks: Math.max(1, Number(formDurationWeeks)),
        deadlineDate: formDeadlineDate.trim() || undefined,
        completed: false,
      };
      handleUpdateTasks([...tasks, newTask]);
      onShowToast('To-Do task baru berhasil ditambahkan.');
    }

    setIsModalOpen(false);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    handleUpdateTasks(updated);
    onShowToast('To-Do task berhasil dihapus.');
  };

  // Move scheduled task back to unscheduled
  const handleUnscheduleTask = (task: SapaTimelineTask) => {
    const updated = tasks.map((t) =>
      t.id === task.id
        ? {
            ...t,
            isScheduled: false,
            deadlineDate:
              task.deadlineDate ||
              `${task.startWeek * 7} ${MONTH_FULL_NAMES[task.startMonth]} ${task.year}`,
          }
        : t
    );
    handleUpdateTasks(updated);
    onShowToast(`"${task.taskTitle}" dipindahkan ke to-do list yang belum diatur.`);
  };

  // Quick schedule an unarranged task
  const handleOpenQuickSchedule = (task: SapaTimelineTask) => {
    setQuickScheduleTask(task);
    setQuickMonth(task.startMonth >= 0 ? task.startMonth : 0);
    setQuickWeek(task.startWeek || 1);
    setQuickDuration(task.durationWeeks || 4);
  };

  const handleApplyQuickSchedule = () => {
    if (!quickScheduleTask) return;
    const updated = tasks.map((t) =>
      t.id === quickScheduleTask.id
        ? {
            ...t,
            year: selectedYear,
            startMonth: quickMonth,
            startWeek: quickWeek,
            durationWeeks: Math.max(1, quickDuration),
            isScheduled: true,
          }
        : t
    );
    handleUpdateTasks(updated);
    setQuickScheduleTask(null);
    onShowToast(`"${quickScheduleTask.taskTitle}" berhasil dijadwalkan ke timeline.`);
  };

  // Calculate timeline start and width in 48-week grid
  // Grid has 12 months * 4 weeks = 48 total week slots (columns 0 to 47)
  const getTaskGridPosition = (task: SapaTimelineTask) => {
    const startCol = task.startMonth * 4 + (task.startWeek - 1);
    const spanCols = Math.min(48 - startCol, task.durationWeeks);
    return {
      startCol: Math.max(0, startCol),
      spanCols: Math.max(1, spanCols),
    };
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* 1. TOP TOOLBAR & CONTROLS (Right-aligned, matching reference image) */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
        {/* Left: Quick Switch to Proyek SAPA Table */}
        <div className="flex items-center gap-3">
          {onNavigateView && (
            <button
              id="btn-switch-to-table"
              type="button"
              onClick={() => onNavigateView('table')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#008d91]" />
              <span>Lihat Tabel Proyek SAPA</span>
            </button>
          )}
          <span className="text-xs text-slate-500 font-medium hidden md:inline">
            Timeline Mingguan (48 Minggu / Tahun)
          </span>
        </div>

        {/* Right Action Icons & Add Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger / Input */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs text-sm animate-in fade-in zoom-in-95 duration-150">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                id="input-timeline-search"
                type="text"
                placeholder="Cari to-do atau proyek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="outline-none text-slate-700 placeholder-slate-400 text-xs w-36 sm:w-48"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Tutup Pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-timeline-open-search"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              aria-label="Cari"
              className="text-[#9ca3af] hover:text-[#4b5563] p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}

          {/* Eye-Off icon (Tampilan) */}
          <button
            id="btn-timeline-eye-off"
            type="button"
            onClick={() => {
              // Quick collapse / expand all
              const allCollapsed = Object.values(collapsedProjects).every(Boolean);
              const next: Record<string, boolean> = {};
              projectGroups.forEach((g) => {
                next[g.projectId] = !allCollapsed;
              });
              setCollapsedProjects(next);
            }}
            title="Sembunyikan/Tampilkan Semua Baris"
            aria-label="Sembunyikan/Tampilkan Semua Baris"
            className="text-[#9ca3af] hover:text-[#4b5563] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Sliders / Filter icon */}
          <button
            id="btn-timeline-filter"
            type="button"
            onClick={() => setShowDivisiDropdown(!showDivisiDropdown)}
            title="Filter Divisi"
            aria-label="Filter Divisi"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showDivisiDropdown ? 'text-[#008d91]' : 'text-[#9ca3af] hover:text-[#4b5563]'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button (Teal Pill Button matching image - navigates to Form Proyek SAPA) */}
          <button
            id="btn-timeline-add-task"
            type="button"
            onClick={() => {
              if (onAddProject) {
                onAddProject();
              } else if (onNavigateView) {
                onNavigateView('form');
              }
            }}
            title="Tambah Proyek SAPA Baru (Form Proyek SAPA)"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#008d91] hover:bg-[#00767a] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. DIVISI BADGE & DROPDOWN (Directly below toolbar as shown in screenshot) */}
      <div className="flex justify-end relative">
        <div
          id="badge-timeline-divisi"
          onClick={() => setShowDivisiDropdown(!showDivisiDropdown)}
          className="bg-[#008d91] hover:bg-[#007b7f] text-white px-5 py-2.5 rounded-2xl shadow-sm cursor-pointer flex items-center justify-between gap-6 transition-all min-w-[200px]"
        >
          <div>
            <div className="text-[11px] font-medium text-white/90 leading-tight">
              Timeline Proyek SAPA Divisi
            </div>
            <div className="text-base sm:text-lg font-bold tracking-wide leading-none mt-0.5">
              {selectedDivisi}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Divisi Dropdown */}
        {showDivisiDropdown && (
          <div
            id="dropdown-divisi-list"
            className="absolute right-0 top-14 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
              Pilih Divisi
            </div>
            <div className="space-y-0.5">
              {availableDivisi.map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => {
                    setSelectedDivisi(div);
                    setShowDivisiDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                    selectedDivisi === div
                      ? 'bg-[#008d91] text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{div === 'ALL' ? 'Semua Divisi (ALL)' : div}</span>
                  {selectedDivisi === div && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. YEAR SELECTOR CAROUSEL (< 2016 2017 ... 2021 ... 2026 >) */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 py-1">
        {/* Previous Year Button */}
        <button
          id="btn-year-prev"
          type="button"
          onClick={() => {
            const idx = YEARS.indexOf(selectedYear);
            if (idx > 0) setSelectedYear(YEARS[idx - 1]);
          }}
          disabled={selectedYear === YEARS[0]}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Tahun Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Years List */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-2">
          {YEARS.map((yr) => {
            const isActive = yr === selectedYear;
            return (
              <button
                key={yr}
                id={`btn-year-${yr}`}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`transition-all cursor-pointer font-bold text-xs sm:text-sm px-2.5 py-1 rounded-full ${
                  isActive
                    ? 'bg-[#008d91] text-white shadow-xs scale-105'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>

        {/* Next Year Button */}
        <button
          id="btn-year-next"
          type="button"
          onClick={() => {
            const idx = YEARS.indexOf(selectedYear);
            if (idx < YEARS.length - 1) setSelectedYear(YEARS[idx + 1]);
          }}
          disabled={selectedYear === YEARS[YEARS.length - 1]}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Tahun Berikutnya"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. MAIN LAYOUT: TIMELINE MATRIX (LEFT/CENTER) + UNARRANGED CARDS (RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left / Center 9 Cols: The 1-Year Weekly Timeline Table */}
        <div className="xl:col-span-9 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px] w-full">
              {/* Header Row 1: Month Pills */}
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                {/* Fixed Label Corner Column */}
                <div className="w-64 min-w-[256px] shrink-0 p-3 flex items-center justify-between border-r border-slate-200">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Proyek & To-Do List
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {selectedYear}
                  </span>
                </div>

                {/* Duration Column Header */}
                <div className="w-24 min-w-[96px] shrink-0 p-3 text-center border-r border-slate-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Durasi
                  </span>
                </div>

                {/* 12 Months: Each 4 weeks wide */}
                <div className="flex-1 grid grid-cols-12 gap-1 p-2">
                  {MONTHS.map((m) => (
                    <div
                      key={m}
                      className="bg-[#e6f4f6] text-[#008d91] font-bold text-xs text-center py-1.5 rounded-xl shadow-2xs"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Header Row 2: "Minggu ke-" Label & Week Numbers (1, 2, 3, 4 per month) */}
              <div className="flex border-b border-slate-200/80 bg-slate-100/50 text-[11px] text-slate-500 font-semibold">
                <div className="w-64 min-w-[256px] shrink-0 px-3 py-1.5 flex items-center border-r border-slate-200">
                  <span>To-Do List</span>
                </div>
                <div className="w-24 min-w-[96px] shrink-0 px-2 py-1.5 text-center border-r border-slate-200">
                  <span>Minggu</span>
                </div>
                {/* 48 Week Columns: 1 2 3 4 repeated 12 times */}
                <div className="flex-1 grid grid-cols-48">
                  {Array.from({ length: 48 }).map((_, idx) => {
                    const weekNum = (idx % 4) + 1;
                    const isMonthStart = idx % 4 === 0;
                    return (
                      <div
                        key={idx}
                        className={`text-center py-1 font-semibold ${
                          isMonthStart ? 'border-l border-slate-200/90 font-bold text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {weekNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body: Projects and To-Do List rows */}
              <div className="divide-y divide-slate-100">
                {projectGroups.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">
                    Tidak ada proyek atau to-do list untuk tahun {selectedYear} dan divisi {selectedDivisi}.
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddProject) {
                            onAddProject();
                          } else if (onNavigateView) {
                            onNavigateView('form');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#008d91] text-white text-xs font-semibold hover:bg-[#00767a] shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Tambah Proyek SAPA</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#008d91]" />
                        <span>Tambah To-Do ke Timeline</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  projectGroups.map((group) => {
                    const isCollapsed = !!collapsedProjects[group.projectId];

                    return (
                      <div key={group.projectId} className="group/project">
                        {/* Group Header Row (Proyek SAPA) */}
                        <div className="flex items-center bg-[#f1f8f8]/60 hover:bg-[#e6f4f6]/80 transition-colors border-t border-slate-200/60 py-2.5 px-3">
                          <div className="flex items-center gap-2 flex-1">
                            {/* Collapse triangle */}
                            <button
                              type="button"
                              onClick={() => toggleProjectCollapse(group.projectId)}
                              className="text-[#008d91] hover:text-[#006e71] p-0.5 rounded cursor-pointer transition-transform"
                              title={isCollapsed ? 'Buka To-Do List' : 'Tutup To-Do List'}
                            >
                              <span
                                className={`inline-block text-[11px] transform transition-transform ${
                                  isCollapsed ? '-rotate-90' : 'rotate-0'
                                }`}
                              >
                                ▼
                              </span>
                            </button>

                            {/* Project Name */}
                            <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight">
                              {group.projectName}
                            </span>

                            {/* Divisi Badge */}
                            <span className="text-[10px] font-semibold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full">
                              {group.divisi}
                            </span>

                            <span className="text-[11px] text-slate-400 ml-1">
                              ({group.tasks.length} to-do)
                            </span>
                          </div>

                          {/* Action Button: + Add to-do to this project */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(group.projectId)}
                              title="Tambah To-Do untuk proyek ini"
                              className="text-[#008d91] hover:bg-[#008d91]/10 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah To-Do</span>
                            </button>
                          </div>
                        </div>

                        {/* If not collapsed: Render To-Do items */}
                        {!isCollapsed && (
                          <div className="divide-y divide-slate-100/70">
                            {group.tasks.length === 0 ? (
                              <div className="py-3 px-10 text-xs text-slate-400 italic">
                                Belum ada to-do list berjadwal pada tahun {selectedYear}. Klik "+ Tambah To-Do" untuk menambahkan.
                              </div>
                            ) : (
                              group.tasks.map((task) => {
                                const { startCol, spanCols } = getTaskGridPosition(task);

                                return (
                                  <div
                                    key={task.id}
                                    className="flex items-center hover:bg-slate-50/70 transition-colors group/task py-1.5"
                                  >
                                    {/* Column 1: Task Title & Actions */}
                                    <div className="w-64 min-w-[256px] shrink-0 px-3 pl-8 flex items-center justify-between border-r border-slate-200">
                                      <div className="flex items-center gap-2 truncate">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = tasks.map((t) =>
                                              t.id === task.id
                                                ? { ...t, completed: !t.completed }
                                                : t
                                            );
                                            handleUpdateTasks(updated);
                                          }}
                                          title={task.completed ? 'Selesai' : 'Belum selesai'}
                                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                                            task.completed
                                              ? 'bg-[#008d91] border-[#008d91] text-white'
                                              : 'border-slate-300 hover:border-[#008d91]'
                                          }`}
                                        >
                                          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                        </button>
                                        <span
                                          onClick={() => handleOpenEditModal(task)}
                                          className={`text-xs font-medium truncate cursor-pointer hover:text-[#008d91] ${
                                            task.completed
                                              ? 'line-through text-slate-400'
                                              : 'text-slate-700'
                                          }`}
                                          title={task.taskTitle}
                                        >
                                          {task.taskTitle}
                                        </span>
                                      </div>

                                      {/* Quick Edit icon */}
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(task)}
                                        className="opacity-0 group-hover/task:opacity-100 text-slate-400 hover:text-slate-600 p-1 rounded transition-opacity"
                                        title="Ubah Jadwal & Durasi"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {/* Column 2: Durasi */}
                                    <div className="w-24 min-w-[96px] shrink-0 px-2 text-center text-xs font-semibold text-slate-600 border-r border-slate-200">
                                      {task.durationWeeks} Minggu
                                    </div>

                                    {/* Column 3: The 48-Week Gantt Bar Grid */}
                                    <div className="flex-1 grid grid-cols-48 relative h-7 items-center px-0.5">
                                      {/* Background vertical grid guidelines for months */}
                                      {Array.from({ length: 12 }).map((_, mIdx) => (
                                        <div
                                          key={mIdx}
                                          className="absolute top-0 bottom-0 border-l border-slate-100 pointer-events-none"
                                          style={{ left: `${(mIdx / 12) * 100}%` }}
                                        />
                                      ))}

                                      {/* The Solid Rounded Yellow Timeline Bar */}
                                      <div
                                        onClick={() => handleOpenEditModal(task)}
                                        title={`${task.taskTitle} — Mulai: ${MONTH_FULL_NAMES[task.startMonth]} Minggu ke-${task.startWeek} (Durasi: ${task.durationWeeks} Minggu)`}
                                        style={{
                                          gridColumnStart: startCol + 1,
                                          gridColumnEnd: `span ${spanCols}`,
                                        }}
                                        className="h-5 rounded-full bg-[#facc15] hover:bg-[#eab308] border border-amber-400/60 shadow-xs text-slate-900 text-[10px] font-bold flex items-center justify-between px-2.5 cursor-pointer transition-all z-10 hover:ring-2 hover:ring-yellow-400/50 truncate"
                                      >
                                        <span className="truncate leading-none">
                                          {task.taskTitle}
                                        </span>
                                        <span className="text-[9px] text-slate-800 ml-1 shrink-0 font-semibold opacity-90">
                                          {task.durationWeeks}w
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: "To-do List yang belum di atur" (Matching exact screenshot!) */}
        <div className="xl:col-span-3">
          <div className="bg-[#f1f3f5] rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
            {/* Header: Title + Filter + Arrows */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug">
                To-do List yang belum di atur
              </h2>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onShowToast(`Menampilkan ${unscheduledTasks.length} to-do belum diatur`)
                  }
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  title="Filter to-do belum diatur"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* Prev page */}
                <button
                  type="button"
                  onClick={() => setUnarrangedPage((p) => Math.max(0, p - 1))}
                  disabled={unarrangedPage === 0}
                  className="w-5 h-5 rounded-full bg-white text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Next page */}
                <button
                  type="button"
                  onClick={() =>
                    setUnarrangedPage((p) => Math.min(maxUnarrangedPages - 1, p + 1))
                  }
                  disabled={
                    unarrangedPage >= maxUnarrangedPages - 1 || maxUnarrangedPages === 0
                  }
                  className="w-5 h-5 rounded-full bg-white text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                  title="Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* List of unarranged cards */}
            <div className="space-y-3">
              {paginatedUnscheduled.length === 0 ? (
                <div className="bg-white rounded-xl p-5 text-center text-xs text-slate-400 border border-slate-200/60 shadow-2xs">
                  Semua to-do list telah dijadwalkan ke timeline!
                </div>
              ) : (
                paginatedUnscheduled.map((task) => (
                  <div
                    key={task.id}
                    id={`unarranged-card-${task.id}`}
                    className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-2 group"
                  >
                    {/* Top: Date */}
                    <div className="text-[11px] font-semibold text-slate-400">
                      {task.deadlineDate || `${task.year}`}
                    </div>

                    {/* Task Title */}
                    <div className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                      {task.taskTitle}
                    </div>

                    {/* Project & Divisi Info */}
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span className="truncate">{task.projectName}</span>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {task.divisi}
                      </span>
                    </div>

                    {/* Action: Jadwalkan ke Timeline */}
                    <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenQuickSchedule(task)}
                        className="text-xs font-semibold text-[#008d91] hover:text-[#006e71] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Atur Timeline</span>
                      </button>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(task)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Button at bottom of right card */}
            <div className="mt-4">
              <button
                id="btn-add-unscheduled-todo"
                type="button"
                onClick={() => {
                  handleOpenAddModal();
                  setFormIsScheduled(false);
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#008d91] hover:bg-white text-slate-600 hover:text-[#008d91] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah To-Do Belum Diatur</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Bar: Report To-Do List di bawah timeline Proyek SAPA */}
      <ReportTodoListView
        projects={projects}
        divisiOptions={availableDivisi}
        onNavigateView={onNavigateView}
        onShowToast={onShowToast}
        isEmbedded={true}
      />

      {/* 5. MODAL: ADD / EDIT TO-DO & TIMELINE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-800">
                {editingTask ? 'Ubah To-Do & Timeline' : 'Tambah To-Do & Timeline Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Proyek SAPA Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proyek SAPA <span className="text-red-500">*</span>
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => {
                    setFormProjectId(e.target.value);
                    const p = availableProjects.find((x) => x.id === e.target.value);
                    if (p) {
                      setFormProjectName(p.name);
                      setFormDivisi(p.divisi);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                >
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.divisi})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama To-Do List (Tugas) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Design Promosi IG, Setup Voucher CS..."
                  value={formTaskTitle}
                  onChange={(e) => setFormTaskTitle(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                />
              </div>

              {/* Divisi & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Divisi</label>
                  <select
                    value={formDivisi}
                    onChange={(e) => setFormDivisi(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                  >
                    {availableDivisi.filter((d) => d !== 'ALL').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                  >
                    {YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scheduled Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsScheduled}
                    onChange={(e) => setFormIsScheduled(e.target.checked)}
                    className="rounded border-slate-300 text-[#008d91] focus:ring-[#008d91]"
                  />
                  <span className="font-semibold text-slate-700">
                    Jadwalkan langsung ke Timeline Mingguan
                  </span>
                </label>
                <span className="text-[11px] text-slate-400 block pl-6">
                  Jika tidak dicentang, to-do akan disimpan di daftar "To-do List yang belum di atur".
                </span>
              </div>

              {/* If Scheduled: Month, Week, Duration */}
              {formIsScheduled ? (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mulai Bulan
                      </label>
                      <select
                        value={formStartMonth}
                        onChange={(e) => setFormStartMonth(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30"
                      >
                        {MONTH_FULL_NAMES.map((m, idx) => (
                          <option key={m} value={idx}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Minggu ke-
                      </label>
                      <select
                        value={formStartWeek}
                        onChange={(e) => setFormStartWeek(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30"
                      >
                        <option value={1}>Minggu 1</option>
                        <option value={2}>Minggu 2</option>
                        <option value={3}>Minggu 3</option>
                        <option value={4}>Minggu 4</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Durasi (seberapa lama timelinenya)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={formDurationWeeks}
                        onChange={(e) => setFormDurationWeeks(Number(e.target.value))}
                        className="flex-1 accent-[#eab308]"
                      />
                      <span className="font-bold text-amber-900 bg-yellow-50 border border-yellow-400 px-3 py-1 rounded-lg text-xs w-24 text-center shadow-2xs">
                        {formDurationWeeks} Minggu
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Tanggal / Catatan (opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 20 Mei 2022"
                    value={formDeadlineDate}
                    onChange={(e) => setFormDeadlineDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                  />
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editingTask.isScheduled) {
                        handleUnscheduleTask(editingTask);
                        setIsModalOpen(false);
                      } else {
                        handleDeleteTask(editingTask.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold py-2 px-3 hover:bg-red-50 rounded-xl cursor-pointer"
                  >
                    {editingTask.isScheduled
                      ? 'Pindahkan ke Belum Diatur'
                      : 'Hapus To-Do'}
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#008d91] hover:bg-[#00767a] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: QUICK SCHEDULE FROM UNARRANGED CARD */}
      {quickScheduleTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="text-[11px] font-semibold text-[#008d91]">
                  Atur Jadwal ke Timeline
                </div>
                <h4 className="font-bold text-sm text-slate-800">
                  {quickScheduleTask.taskTitle}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setQuickScheduleTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="bg-[#f1f8f8] p-3 rounded-xl border border-[#008d91]/20 text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold text-slate-800">Proyek:</span>{' '}
                  {quickScheduleTask.projectName}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Divisi:</span>{' '}
                  {quickScheduleTask.divisi}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Tahun:</span> {selectedYear}
                </div>
              </div>

              {/* Start Month & Week */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mulai Bulan
                  </label>
                  <select
                    value={quickMonth}
                    onChange={(e) => setQuickMonth(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30"
                  >
                    {MONTH_FULL_NAMES.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minggu ke-
                  </label>
                  <select
                    value={quickWeek}
                    onChange={(e) => setQuickWeek(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30"
                  >
                    <option value={1}>Minggu 1</option>
                    <option value={2}>Minggu 2</option>
                    <option value={3}>Minggu 3</option>
                    <option value={4}>Minggu 4</option>
                  </select>
                </div>
              </div>

              {/* Duration in Weeks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Durasi (seberapa lama timelinenya)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="flex-1 accent-[#eab308]"
                  />
                  <span className="font-bold text-amber-900 bg-yellow-50 border border-yellow-400 px-3 py-1 rounded-lg text-xs w-24 text-center shadow-2xs">
                    {quickDuration} Minggu
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickScheduleTask(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyQuickSchedule}
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#00767a] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Terapkan ke Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
