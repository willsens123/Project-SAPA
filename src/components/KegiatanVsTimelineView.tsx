import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Check,
  Search,
  X,
  SlidersHorizontal,
  Clock,
  User,
  Users,
  Calendar,
  CalendarDays,
  MoreVertical,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ProjectItem, KaryawanItem, TodoTaskItem, TodoSubTaskItem } from '../types';
import { SapaTimelineTask } from '../timelineProyekSapaData';
import { PapanTrelloCard, getPapanTrelloCardsFromStorage } from '../papanTrelloData';
import { getTodosForProject } from '../todoListData';

interface KegiatanVsTimelineViewProps {
  currentYear: number;
  selectedDivisi: string;
  timelineTasks: SapaTimelineTask[];
  projects: ProjectItem[];
  karyawanList: KaryawanItem[];
  projectTodos?: Record<string, TodoTaskItem[]>;
  onOpenFormTodoList?: (project?: ProjectItem) => void;
  onUpdateTasks?: (projectId: string, tasks: TodoTaskItem[]) => void;
  onNavigateToPapanTrello?: () => void;
  onUpdateTimelineTasks: (tasks: SapaTimelineTask[]) => void;
  onShowToast?: (msg: string) => void;
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

// Helper to parse date from string (e.g. "22/10", "2021-10-22")
function parseDateMonthWeek(dateStr?: string): { month: number; week: number } | null {
  if (!dateStr) return null;
  const dm = dateStr.match(/^(\d{1,2})\/(\d{1,2})/);
  if (dm) {
    const d = parseInt(dm[1], 10);
    const m = parseInt(dm[2], 10);
    if (m >= 1 && m <= 12) {
      return {
        month: m - 1,
        week: Math.min(4, Math.max(1, Math.ceil(d / 7))),
      };
    }
  }
  const iso = dateStr.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (iso) {
    const m = parseInt(iso[1], 10);
    const d = parseInt(iso[2], 10);
    if (m >= 1 && m <= 12) {
      return {
        month: m - 1,
        week: Math.min(4, Math.max(1, Math.ceil(d / 7))),
      };
    }
  }
  return null;
}

export const KegiatanVsTimelineView: React.FC<KegiatanVsTimelineViewProps> = ({
  currentYear: initialYear,
  selectedDivisi: initialDivisi,
  timelineTasks,
  projects,
  karyawanList,
  projectTodos = {},
  onOpenFormTodoList,
  onUpdateTasks,
  onNavigateToPapanTrello,
  onUpdateTimelineTasks,
  onShowToast = (_msg: string) => {},
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || 2021);
  const [selectedDivisi, setSelectedDivisi] = useState<string>(initialDivisi || 'PNB');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showDivisiDropdown, setShowDivisiDropdown] = useState<boolean>(false);
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});

  // Right panel pagination for unarranged tasks
  const [unarrangedPage, setUnarrangedPage] = useState<number>(0);

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<SapaTimelineTask | null>(null);

  // Form Fields - Specifically for Timeline Proyek SAPA (Kuning)
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formProjectName, setFormProjectName] = useState<string>('');
  const [formTaskTitle, setFormTaskTitle] = useState<string>('');
  const [formDivisi, setFormDivisi] = useState<string>('PNB');
  const [formYear, setFormYear] = useState<number>(2021);
  const [formPicId, setFormPicId] = useState<string>('');
  const [formIsScheduled, setFormIsScheduled] = useState<boolean>(true);
  const [formDeadlineDate, setFormDeadlineDate] = useState<string>('');

  // Timeline SAPA (Kuning) settings configured here
  const [formSapaMonth, setFormSapaMonth] = useState<number>(0);
  const [formSapaWeek, setFormSapaWeek] = useState<number>(1);
  const [formSapaDuration, setFormSapaDuration] = useState<number>(6);

  // Quick schedule modal from unarranged card
  const [quickScheduleTask, setQuickScheduleTask] = useState<SapaTimelineTask | null>(null);
  const [quickPicId, setQuickPicId] = useState<string>('');
  const [quickSapaMonth, setQuickSapaMonth] = useState<number>(0);
  const [quickSapaWeek, setQuickSapaWeek] = useState<number>(1);
  const [quickSapaDuration, setQuickSapaDuration] = useState<number>(4);

  // Live Papan Trello Cards
  const [trelloCards, setTrelloCards] = useState<PapanTrelloCard[]>(() => {
    return getPapanTrelloCardsFromStorage();
  });

  // Periodically refresh Papan Trello cards to ensure real-time "Ongoing" detection
  useEffect(() => {
    const refreshCards = () => {
      setTrelloCards(getPapanTrelloCardsFromStorage());
    };
    refreshCards();
    const interval = setInterval(refreshCards, 1500);
    return () => clearInterval(interval);
  }, []);

  const divisiDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (divisiDropdownRef.current && !divisiDropdownRef.current.contains(e.target as Node)) {
        setShowDivisiDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combined list of projects
  const availableProjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; divisi: string }>();
    projects.forEach((p) => {
      map.set(p.id, { id: p.id, name: p.namaKegiatan, divisi: p.divisi || 'PNB' });
    });
    timelineTasks.forEach((t) => {
      if (!map.has(t.projectId)) {
        map.set(t.projectId, { id: t.projectId, name: t.projectName, divisi: t.divisi });
      }
    });
    return Array.from(map.values());
  }, [projects, timelineTasks]);

  // Match a task with Papan Trello to get real "Ongoing" status
  const getTrelloOngoingInfo = (task: {
    projectId: string;
    taskTitle: string;
    id?: string;
  }) => {
    const targetTitle = (task.taskTitle || '').trim().toLowerCase();

    const matchedCard = trelloCards.find((c) => {
      if (c.projectId && task.projectId && c.projectId !== task.projectId) return false;
      const cSub = (c.subTaskName || '').trim().toLowerCase();
      const cTask = (c.taskName || '').trim().toLowerCase();
      if (cSub === targetTitle || cTask === targetTitle) return true;
      if (c.id === task.id || c.taskId === task.id || c.subTaskId === task.id) return true;
      return false;
    });

    if (!matchedCard) {
      return {
        matchedCard: null,
        isOngoing: false,
        isCompleted: false,
        isNotStarted: true,
        realStartMonth: 0,
        realStartWeek: 1,
        realDurationWeeks: 4,
        statusLabel: 'Belum di Papan Trello',
      };
    }

    const isOngoing =
      matchedCard.stage === 'ongoing' || matchedCard.statusPengerjaan === 'ongoing';
    const isCompleted =
      matchedCard.stage === 'selesai_pending' &&
      (matchedCard.statusPengerjaan === 'selesai' || matchedCard.statusPengerjaan !== 'pending');
    const isNotStarted = !isOngoing && !isCompleted;

    let realStartMonth = 0;
    let realStartWeek = 1;
    let realDurationWeeks = 4;

    const parsedStart = parseDateMonthWeek(matchedCard.tanggalMulai || matchedCard.deadline);
    if (parsedStart) {
      realStartMonth = parsedStart.month;
      realStartWeek = parsedStart.week;
    }

    if (matchedCard.tanggalSelesai) {
      const parsedEnd = parseDateMonthWeek(matchedCard.tanggalSelesai);
      if (parsedEnd) {
        const startTotal = realStartMonth * 4 + realStartWeek;
        const endTotal = parsedEnd.month * 4 + parsedEnd.week;
        realDurationWeeks = Math.max(1, endTotal - startTotal + 1);
      }
    }

    const statusLabel = isOngoing
      ? 'Ongoing di Papan Trello'
      : isCompleted
      ? 'Selesai di Papan Trello'
      : 'Not Started di Papan Trello';

    return {
      matchedCard,
      isOngoing,
      isCompleted,
      isNotStarted,
      realStartMonth,
      realStartWeek,
      realDurationWeeks,
      statusLabel,
    };
  };

  // Synchronize all To-Do items from menu "To-Do List" (projectTodos) automatically into Kegiatan vs Timeline
  const synchronizedTimelineTasks = useMemo(() => {
    const list: SapaTimelineTask[] = [...timelineTasks];
    const existingKeySet = new Set(
      timelineTasks.map((t) => `${t.projectId}_${t.taskTitle.trim().toLowerCase()}`)
    );

    // Scan through projectTodos (menu To-Do List)
    Object.entries(projectTodos).forEach(([pId, rawTasks]) => {
      if (!Array.isArray(rawTasks)) return;
      const tasks = rawTasks as TodoTaskItem[];
      const proj = projects.find((p) => p.id === pId);
      const projName = proj?.namaKegiatan || 'Nama Proyek SAPA';
      const projDivisi = proj?.divisi || 'PNB';

      tasks.forEach((t) => {
        // If task has subtasks, each subtask is an actionable To-Do item
        if (t.subTasks && t.subTasks.length > 0) {
          t.subTasks.forEach((st, sIdx) => {
            const itemTitle = (st.title || (st as any).subTask || '').trim();
            if (!itemTitle) return;
            const key = `${pId}_${itemTitle.toLowerCase()}`;
            if (!existingKeySet.has(key)) {
              existingKeySet.add(key);

              // Derive deadline month if available
              const parsedDate = parseDateMonthWeek(st.deadline || t.deadline);
              const defMonth = parsedDate ? parsedDate.month : Math.min(11, (sIdx % 4) * 2);
              const defWeek = parsedDate ? parsedDate.week : (sIdx % 4) + 1;

              list.push({
                id: `todo-sync-${st.id}`,
                projectId: pId,
                projectName: projName,
                divisi: projDivisi,
                taskTitle: itemTitle,
                year: selectedYear,
                startMonth: defMonth,
                startWeek: defWeek,
                durationWeeks: 4,
                deadlineDate: st.deadline || t.deadline || '',
                isScheduled: true,
                completed: !!(st.completed || t.completed),
                idKaryawanAssignJob: st.idKaryawanAssignJob || t.idKaryawanAssignJob,
              });
            }
          });
        } else {
          // Task without subtasks
          const itemTitle = (t.task || '').trim();
          if (!itemTitle) return;
          const key = `${pId}_${itemTitle.toLowerCase()}`;
          if (!existingKeySet.has(key)) {
            existingKeySet.add(key);
            const parsedDate = parseDateMonthWeek(t.deadline);
            const defMonth = parsedDate ? parsedDate.month : 0;
            const defWeek = parsedDate ? parsedDate.week : 1;

            list.push({
              id: `todo-sync-${t.id}`,
              projectId: pId,
              projectName: projName,
              divisi: projDivisi,
              taskTitle: itemTitle,
              year: selectedYear,
              startMonth: defMonth,
              startWeek: defWeek,
              durationWeeks: 4,
              deadlineDate: t.deadline || '',
              isScheduled: true,
              completed: !!t.completed,
              idKaryawanAssignJob: t.idKaryawanAssignJob,
            });
          }
        }
      });
    });

    return list;
  }, [timelineTasks, projectTodos, projects, selectedYear]);

  // Group scheduled tasks for selected year
  const projectGroups = useMemo(() => {
    const yearTasks = synchronizedTimelineTasks.filter((t) => {
      if (!t.isScheduled || t.year !== selectedYear) return false;
      if (selectedDivisi !== 'ALL' && t.divisi) {
        if (t.divisi.toUpperCase() !== selectedDivisi.toUpperCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.taskTitle.toLowerCase().includes(q);
        const matchProj = t.projectName.toLowerCase().includes(q);
        const matchPic = (t.picName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchProj && !matchPic) return false;
      }
      return true;
    });

    const map = new Map<
      string,
      {
        projectId: string;
        projectName: string;
        divisi: string;
        tasks: SapaTimelineTask[];
      }
    >();

    yearTasks.forEach((t) => {
      if (!map.has(t.projectId)) {
        map.set(t.projectId, {
          projectId: t.projectId,
          projectName: t.projectName,
          divisi: t.divisi || 'PNB',
          tasks: [],
        });
      }
      map.get(t.projectId)!.tasks.push(t);
    });

    return Array.from(map.values());
  }, [synchronizedTimelineTasks, selectedYear, selectedDivisi, searchQuery]);

  // Unscheduled tasks for right panel
  const unscheduledTasks = useMemo(() => {
    return synchronizedTimelineTasks.filter((t) => {
      if (t.isScheduled && t.year === selectedYear) return false;
      if (selectedDivisi !== 'ALL' && t.divisi) {
        if (t.divisi.toUpperCase() !== selectedDivisi.toUpperCase()) return false;
      }
      return true;
    });
  }, [synchronizedTimelineTasks, selectedYear, selectedDivisi]);

  const unarrangedPageSize = 4;
  const maxUnarrangedPages = Math.ceil(unscheduledTasks.length / unarrangedPageSize);
  const paginatedUnscheduled = useMemo(() => {
    const start = unarrangedPage * unarrangedPageSize;
    return unscheduledTasks.slice(start, start + unarrangedPageSize);
  }, [unscheduledTasks, unarrangedPage]);

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const getKaryawanInfo = (task: SapaTimelineTask) => {
    if (task.idKaryawanAssignJob) {
      const codes = task.idKaryawanAssignJob.split(',').map((s) => s.trim()).filter(Boolean);
      if (codes.length > 0) {
        const matches = codes.map((c) => karyawanList.find((k) => k.id === c || k.kodeKaryawan === c)).filter(Boolean);
        if (matches.length > 0) {
          const names = matches.map((m) => m!.namaLengkap).join(', ');
          const first = matches[0]!;
          return {
            name: names,
            initial: matches.length > 1 ? `${matches.length}` : (first.avatarInitial || first.namaLengkap.charAt(0)),
            bg: first.avatarBg || 'bg-[#009688]',
            code: matches.map((m) => m!.kodeKaryawan).join(', '),
          };
        }
      }
    }
    if (task.picName) {
      return {
        name: task.picName,
        initial: task.picName.charAt(0).toUpperCase(),
        bg: 'bg-[#009688]',
        code: '',
      };
    }
    return {
      name: 'Belum Ditugaskan',
      initial: '?',
      bg: 'bg-slate-300',
      code: '',
    };
  };

  // Open Add modal (Setting Timeline Proyek SAPA - Kuning)
  const handleOpenAddModal = (presetProjectId?: string) => {
    setEditingTask(null);
    const defaultProj =
      availableProjects.find((p) => p.id === presetProjectId) ||
      availableProjects[0] || {
        id: 'proj-new',
        name: 'Proyek Baru',
        divisi: selectedDivisi === 'ALL' ? 'PNB' : selectedDivisi,
      };

    setFormProjectId(defaultProj.id);
    setFormProjectName(defaultProj.name);
    setFormDivisi(defaultProj.divisi);
    setFormTaskTitle('');
    setFormYear(selectedYear);
    setFormPicId(karyawanList[0]?.id || '');
    setFormIsScheduled(true);
    setFormDeadlineDate('');

    // Default dates for Timeline SAPA (Kuning)
    setFormSapaMonth(0);
    setFormSapaWeek(1);
    setFormSapaDuration(6);

    setIsModalOpen(true);
  };

  // Open Edit modal (Setting Timeline Proyek SAPA - Kuning)
  const handleOpenEditModal = (task: SapaTimelineTask) => {
    setEditingTask(task);
    setFormProjectId(task.projectId);
    setFormProjectName(task.projectName);
    setFormDivisi(task.divisi);
    setFormTaskTitle(task.taskTitle);
    setFormYear(task.year);
    setFormPicId(task.idKaryawanAssignJob || '');
    setFormIsScheduled(task.isScheduled);
    setFormDeadlineDate(task.deadlineDate || '');

    // Set SAPA Timeline fields (Kuning)
    setFormSapaMonth(task.startMonth);
    setFormSapaWeek(task.startWeek);
    setFormSapaDuration(task.durationWeeks);

    setIsModalOpen(true);
  };

  // Save Add/Edit: Setting Timeline Proyek SAPA (Kuning)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTaskTitle.trim()) {
      onShowToast('Judul to-do tidak boleh kosong');
      return;
    }

    const matchedPic = karyawanList.find(
      (k) => k.id === formPicId || k.kodeKaryawan === formPicId
    );
    const picName = matchedPic ? matchedPic.namaLengkap : '';

    if (editingTask) {
      const updated = timelineTasks.map((t) => {
        if (t.id === editingTask.id || (t.projectId === formProjectId && t.taskTitle === editingTask.taskTitle)) {
          return {
            ...t,
            projectId: formProjectId,
            projectName: formProjectName,
            divisi: formDivisi,
            taskTitle: formTaskTitle.trim(),
            year: formYear,
            idKaryawanAssignJob: formPicId,
            picName: picName || t.picName,
            isScheduled: formIsScheduled,
            startMonth: formSapaMonth,
            startWeek: formSapaWeek,
            durationWeeks: formSapaDuration,
            deadlineDate: formDeadlineDate,
          };
        }
        return t;
      });
      onUpdateTimelineTasks(updated);
      onShowToast(`Timeline Proyek SAPA (Kuning) untuk "${formTaskTitle}" berhasil diperbarui`);
    } else {
      const newTask: SapaTimelineTask = {
        id: `task-${Date.now()}`,
        projectId: formProjectId,
        projectName: formProjectName,
        divisi: formDivisi,
        taskTitle: formTaskTitle.trim(),
        year: formYear,
        idKaryawanAssignJob: formPicId,
        picName: picName || undefined,
        isScheduled: formIsScheduled,
        startMonth: formSapaMonth,
        startWeek: formSapaWeek,
        durationWeeks: formSapaDuration,
        deadlineDate: formDeadlineDate,
        completed: false,
      };
      onUpdateTimelineTasks([newTask, ...timelineTasks]);
      onShowToast(`To-Do "${formTaskTitle}" dijadwalkan ke Timeline Proyek SAPA (Kuning)`);
    }

    setIsModalOpen(false);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    const updated = timelineTasks.filter((t) => t.id !== taskId);
    onUpdateTimelineTasks(updated);
    onShowToast('To-Do List berhasil dihapus dari timeline');
  };

  // Open Quick Schedule Modal (Setting Timeline Proyek SAPA - Kuning)
  const handleOpenQuickSchedule = (task: SapaTimelineTask) => {
    setQuickScheduleTask(task);
    setQuickPicId(task.idKaryawanAssignJob || karyawanList[0]?.id || '');
    setQuickSapaMonth(0);
    setQuickSapaWeek(1);
    setQuickSapaDuration(4);
  };

  // Save Quick Schedule
  const handleSaveQuickSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScheduleTask) return;

    const matchedPic = karyawanList.find(
      (k) => k.id === quickPicId || k.kodeKaryawan === quickPicId
    );
    const picName = matchedPic ? matchedPic.namaLengkap : quickScheduleTask.picName;

    const updated = timelineTasks.map((t) => {
      if (t.id === quickScheduleTask.id) {
        return {
          ...t,
          year: selectedYear,
          isScheduled: true,
          idKaryawanAssignJob: quickPicId,
          picName: picName || t.picName,
          startMonth: quickSapaMonth,
          startWeek: quickSapaWeek,
          durationWeeks: quickSapaDuration,
        };
      }
      return t;
    });

    onUpdateTimelineTasks(updated);
    setQuickScheduleTask(null);
    onShowToast(`"${quickScheduleTask.taskTitle}" dijadwalkan ke Timeline Proyek SAPA (Kuning)`);
  };

  return (
    <div className="w-full flex flex-col gap-5 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: View Title & Subtitle + Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#009688]" />
              <span>Kegiatan vs Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              To-Do List terkoneksi otomatis dari menu <strong>To-Do List</strong> • Real Timeline (Tosca) dicek otomatis dari <strong>Papan Trello (Ongoing)</strong>
            </p>
          </div>

          {/* Interactive Legend Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold shadow-2xs cursor-pointer hover:bg-teal-100/80 transition-all"
              onClick={onNavigateToPapanTrello}
              title="Real Timeline (Tosca) aktif secara otomatis jika to-do berstatus 'Ongoing' pada Papan Trello. Klik untuk buka Papan Trello."
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#009688] shadow-2xs" />
              <span>Real Timeline: Ongoing di Papan Trello (Tosca)</span>
              {onNavigateToPapanTrello && (
                <ExternalLink className="w-3 h-3 text-[#009688] ml-0.5" />
              )}
            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-300 text-amber-950 text-xs font-bold shadow-2xs"
              title="Semua yang diatur pada tab ini adalah target/rencana Timeline Proyek SAPA (Kuning)."
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#facc15] border border-amber-400 shadow-2xs" />
              <span>Diatur di sini: Timeline Proyek SAPA (Kuning)</span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Filters, Year Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-end lg:self-auto">
          {/* Search Button / Input */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-full px-3 py-1 shadow-xs">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari to-do atau proyek..."
                  className="text-xs bg-transparent border-none outline-none text-slate-700 w-36 sm:w-48 placeholder-slate-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 rounded-full bg-[#009688] hover:bg-[#00897b] text-white flex items-center justify-center transition-colors shadow-xs"
                title="Cari To-Do"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Divisi Dropdown */}
          <div className="relative" ref={divisiDropdownRef}>
            <button
              type="button"
              onClick={() => setShowDivisiDropdown((prev) => !prev)}
              className="px-4 py-1.5 rounded-full bg-[#009688] hover:bg-[#00897b] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>{selectedDivisi === 'ALL' ? 'Semua Divisi' : selectedDivisi}</span>
              <span className="text-[10px] opacity-80">▼</span>
            </button>

            {showDivisiDropdown && (
              <div className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-lg p-1.5 min-w-[140px] animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                  Pilih Divisi
                </div>
                {DIVISI_OPTIONS.map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setSelectedDivisi(div);
                      setShowDivisiDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center justify-between ${
                      selectedDivisi === div
                        ? 'bg-teal-50 text-[#009688] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{div === 'ALL' ? 'Semua Divisi' : div}</span>
                    {selectedDivisi === div && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#009688]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => Math.max(2016, y - 1))}
              className="w-6 h-6 rounded-full bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs shadow-2xs"
              title="Tahun Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 min-w-[42px] text-center">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear((y) => Math.min(2026, y + 1))}
              className="w-6 h-6 rounded-full bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs shadow-2xs"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add To-Do / Schedule SAPA Button */}
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-3.5 py-1.5 rounded-full bg-[#facc15] hover:bg-[#eab308] text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer border border-amber-300"
            title="Tambah atau jadwalkan to-do ke Timeline Proyek SAPA (Kuning)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Timeline SAPA (Kuning)</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 9 Cols: Matrix Timeline Table */}
        <div className="xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <div className="min-w-[980px] w-full">
              {/* Header Row 1: Kolom 1 Kegiatan/To-Do + Kolom 2 Orang yang Mengerjakan + 12 Bulan */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-slate-700 select-none">
                {/* Kolom 1: Kegiatan / To-Do List */}
                <div className="w-64 min-w-[256px] shrink-0 p-3 border-r border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#009688]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Kegiatan & To-Do List
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#009688] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    Menu To-Do
                  </span>
                </div>

                {/* Kolom 2: Orang yang Mengerjakan */}
                <div className="w-48 min-w-[192px] shrink-0 p-3 border-r border-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#009688]" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Orang yang Mengerjakan
                  </span>
                </div>

                {/* Kolom 3: 12 Month Pills (Jan - Des) */}
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

              {/* Header Row 2: Sub-labels & 48 Weeks (1 2 3 4 per month) */}
              <div className="flex border-b border-slate-200/80 bg-slate-100/50 text-[11px] text-slate-500 font-semibold select-none">
                <div className="w-64 min-w-[256px] shrink-0 px-3 py-1.5 flex items-center border-r border-slate-200 text-slate-600">
                  <span>To-Do List (Sub-Task)</span>
                </div>
                <div className="w-48 min-w-[192px] shrink-0 px-3 py-1.5 flex items-center border-r border-slate-200 text-slate-600">
                  <span>PIC / Penanggung Jawab</span>
                </div>
                <div className="flex-1 grid grid-cols-48">
                  {Array.from({ length: 48 }).map((_, idx) => {
                    const weekNum = (idx % 4) + 1;
                    const isMonthStart = idx % 4 === 0;
                    return (
                      <div
                        key={idx}
                        className={`text-center py-1 font-semibold ${
                          isMonthStart
                            ? 'border-l border-slate-200/90 font-bold text-slate-700'
                            : 'text-slate-400'
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
                    Tidak ada to-do list berjadwal untuk tahun {selectedYear} dan divisi {selectedDivisi}.
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#009688] text-white text-xs font-semibold hover:bg-[#00796b] shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Atur To-Do ke Timeline SAPA</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  projectGroups.map((group) => {
                    const isCollapsed = !!collapsedProjects[group.projectId];

                    return (
                      <div key={group.projectId} className="group/project">
                        {/* Group Header Row (Proyek SAPA) */}
                        <div className="flex items-center bg-[#f1f8f8]/70 hover:bg-[#e6f4f6] transition-colors border-t border-slate-200/70 py-2.5 px-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
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

                            <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight truncate">
                              {group.projectName}
                            </span>

                            <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full shrink-0">
                              {group.divisi}
                            </span>

                            <span className="text-[11px] text-slate-400 ml-1 shrink-0">
                              ({group.tasks.length} to-do)
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onOpenFormTodoList && (
                              <button
                                type="button"
                                onClick={() => {
                                  const prj = projects.find((p) => p.id === group.projectId);
                                  onOpenFormTodoList(prj);
                                }}
                                title="Buka form menu To-Do List"
                                className="text-slate-500 hover:text-slate-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>Menu To-Do</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(group.projectId)}
                              title="Tambah To-Do untuk proyek ini"
                              className="text-[#008d91] hover:bg-[#008d91]/10 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#008d91]/30"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah To-Do</span>
                            </button>
                          </div>
                        </div>

                        {/* If not collapsed: Render To-Do items */}
                        {!isCollapsed && (
                          <div className="divide-y divide-slate-100">
                            {group.tasks.map((task) => {
                              const pic = getKaryawanInfo(task);

                              // Timeline SAPA (Kuning) calculations - What is configured here!
                              const sapaStartCol = Math.max(
                                0,
                                Math.min(47, task.startMonth * 4 + (task.startWeek - 1))
                              );
                              const sapaSpanCols = Math.max(
                                1,
                                Math.min(48 - sapaStartCol, task.durationWeeks)
                              );

                              // Real Timeline (Tosca) - Checked automatically from Papan Trello "Ongoing"!
                              const trelloInfo = getTrelloOngoingInfo(task);
                              const realStartCol = Math.max(
                                0,
                                Math.min(47, trelloInfo.realStartMonth * 4 + (trelloInfo.realStartWeek - 1))
                              );
                              const realSpanCols = Math.max(
                                1,
                                Math.min(48 - realStartCol, trelloInfo.realDurationWeeks)
                              );

                              return (
                                <div
                                  key={task.id}
                                  className="flex items-center hover:bg-slate-50/70 transition-colors group/task py-1.5"
                                >
                                  {/* Kolom 1: To-Do Title & Papan Trello Status Badge */}
                                  <div className="w-64 min-w-[256px] shrink-0 px-3 pl-8 flex items-center justify-between border-r border-slate-200">
                                    <div className="flex flex-col min-w-0 pr-2">
                                      <div className="flex items-center gap-2 truncate">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = timelineTasks.map((t) =>
                                              t.id === task.id
                                                ? { ...t, completed: !t.completed }
                                                : t
                                            );
                                            onUpdateTimelineTasks(updated);
                                          }}
                                          title={task.completed ? 'Selesai' : 'Tandai selesai'}
                                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                                            task.completed
                                              ? 'bg-[#009688] border-[#009688] text-white'
                                              : 'border-slate-300 hover:border-[#009688]'
                                          }`}
                                        >
                                          {task.completed && (
                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                          )}
                                        </button>

                                        <span
                                          onClick={() => handleOpenEditModal(task)}
                                          className={`text-xs font-semibold truncate cursor-pointer hover:text-[#009688] ${
                                            task.completed
                                              ? 'line-through text-slate-400'
                                              : 'text-slate-800'
                                          }`}
                                          title={`${task.taskTitle} (Klik untuk atur Timeline SAPA Kuning)`}
                                        >
                                          {task.taskTitle}
                                        </span>
                                      </div>

                                      {/* Trello Ongoing / Status Indicator */}
                                      <div className="mt-1 flex items-center gap-1 pl-5.5">
                                        {trelloInfo.isOngoing ? (
                                          <span
                                            onClick={onNavigateToPapanTrello}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-300 shadow-2xs cursor-pointer hover:bg-teal-200"
                                            title="Sedang Dikerjakan di Papan Trello (Klik untuk buka Papan Trello)"
                                          >
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#008d91] animate-pulse" />
                                            <span>Ongoing Trello</span>
                                          </span>
                                        ) : trelloInfo.isCompleted ? (
                                          <span
                                            onClick={onNavigateToPapanTrello}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                                            title="Selesai di Papan Trello"
                                          >
                                            <Check className="w-2.5 h-2.5" />
                                            <span>Selesai Trello</span>
                                          </span>
                                        ) : (
                                          <span
                                            onClick={onNavigateToPapanTrello}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer hover:bg-slate-200"
                                            title="Belum Ongoing di Papan Trello"
                                          >
                                            <span>Not Started Trello</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(task)}
                                      className="opacity-0 group-hover/task:opacity-100 text-slate-400 hover:text-slate-700 p-1 rounded transition-opacity cursor-pointer shrink-0"
                                      title="Atur Timeline Proyek SAPA (Kuning)"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Kolom 2: Orang yang Mengerjakan */}
                                  <div
                                    onClick={() => handleOpenEditModal(task)}
                                    className="w-48 min-w-[192px] shrink-0 px-3 py-1 flex items-center gap-2.5 border-r border-slate-200 cursor-pointer group-hover/task:bg-slate-50/50"
                                    title={`PIC: ${pic.name}`}
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-full ${pic.bg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                                    >
                                      {pic.initial}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-800 truncate">
                                        {pic.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-medium truncate">
                                        {pic.code ? `ID: ${pic.code}` : task.divisi || 'PNB'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Kolom 3: The 48-Week Gantt Chart Grid with DUA TIMELINE */}
                                  <div className="flex-1 grid grid-cols-48 grid-rows-2 gap-y-1 relative h-16 py-1 px-0.5 items-center">
                                    {/* Background vertical guidelines for 12 months */}
                                    {Array.from({ length: 12 }).map((_, mIdx) => (
                                      <div
                                        key={mIdx}
                                        className="absolute top-0 bottom-0 border-l border-slate-100 pointer-events-none"
                                        style={{ left: `${(mIdx / 12) * 100}%` }}
                                      />
                                    ))}

                                    {/* 1. TIMELINE ATAS: REAL TIMELINE PENGERJAAN (TOSCA) — Checked Automatically from Papan Trello */}
                                    {trelloInfo.isOngoing ? (
                                      /* Active Ongoing Tosca Bar */
                                      <div
                                        onClick={onNavigateToPapanTrello}
                                        title={`Real Timeline Pengerjaan (Tosca): ONGOING di Papan Trello • Mulai ${MONTH_FULL_NAMES[trelloInfo.realStartMonth]} M${trelloInfo.realStartWeek} (Durasi: ${trelloInfo.realDurationWeeks}w) — PIC: ${pic.name}`}
                                        style={{
                                          gridRowStart: 1,
                                          gridColumnStart: realStartCol + 1,
                                          gridColumnEnd: `span ${realSpanCols}`,
                                        }}
                                        className="h-6 rounded-full bg-[#009688] hover:bg-[#00796b] shadow-2xs text-white text-[10px] font-bold flex items-center justify-between px-2.5 cursor-pointer transition-all z-20 hover:ring-2 hover:ring-teal-400/60 truncate border border-teal-700/20"
                                      >
                                        <span className="truncate flex items-center gap-1.5 leading-none">
                                          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                                          <span>Real: {task.taskTitle} (Ongoing)</span>
                                        </span>
                                        <span className="text-[9px] opacity-95 ml-1.5 shrink-0 font-medium bg-black/15 px-1.5 py-0.2 rounded-full">
                                          {trelloInfo.realDurationWeeks}w
                                        </span>
                                      </div>
                                    ) : trelloInfo.isCompleted ? (
                                      /* Completed Tosca/Emerald Bar */
                                      <div
                                        onClick={onNavigateToPapanTrello}
                                        title={`Real Timeline: SELESAI di Papan Trello`}
                                        style={{
                                          gridRowStart: 1,
                                          gridColumnStart: realStartCol + 1,
                                          gridColumnEnd: `span ${realSpanCols}`,
                                        }}
                                        className="h-6 rounded-full bg-[#009688]/80 hover:bg-[#00796b] text-white text-[10px] font-semibold flex items-center justify-between px-2.5 cursor-pointer transition-all z-20 truncate border border-teal-600/30 shadow-2xs"
                                      >
                                        <span className="truncate flex items-center gap-1 leading-none">
                                          <Check className="w-2.5 h-2.5 shrink-0" />
                                          <span>Real: Selesai</span>
                                        </span>
                                        <span className="text-[9px] opacity-90 ml-1.5 shrink-0">
                                          {trelloInfo.realDurationWeeks}w
                                        </span>
                                      </div>
                                    ) : (
                                      /* Not Started on Trello - Subtle Dashed Bar */
                                      <div
                                        onClick={onNavigateToPapanTrello}
                                        title={`Real Timeline Pengerjaan (Tosca): Belum Ongoing di Papan Trello. Pindahkan kartu ke kolom Ongoing pada Papan Trello untuk mengaktifkan real timeline.`}
                                        style={{
                                          gridRowStart: 1,
                                          gridColumnStart: sapaStartCol + 1,
                                          gridColumnEnd: `span ${Math.min(sapaSpanCols, 6)}`,
                                        }}
                                        className="h-6 rounded-full border border-dashed border-teal-300 bg-teal-50/40 text-teal-800 text-[9.5px] font-medium flex items-center justify-center px-2 cursor-pointer hover:bg-teal-100/60 transition-all z-10 truncate"
                                      >
                                        <span className="truncate">
                                          ⏳ Menunggu Ongoing di Papan Trello
                                        </span>
                                      </div>
                                    )}

                                    {/* 2. TIMELINE BAWAH: TIMELINE PROYEK SAPA (KUNING) — Configured Directly on this tab! */}
                                    <div
                                      onClick={() => handleOpenEditModal(task)}
                                      title={`Timeline Proyek SAPA (Kuning): Mulai ${MONTH_FULL_NAMES[task.startMonth]} Minggu ${task.startWeek} (Durasi: ${task.durationWeeks} Minggu) — Klik untuk ubah jadwal SAPA`}
                                      style={{
                                        gridRowStart: 2,
                                        gridColumnStart: sapaStartCol + 1,
                                        gridColumnEnd: `span ${sapaSpanCols}`,
                                      }}
                                      className="h-6 rounded-full bg-[#facc15] hover:bg-[#eab308] border border-amber-400/80 shadow-2xs text-slate-900 text-[10px] font-bold flex items-center justify-between px-2.5 cursor-pointer transition-all z-10 hover:ring-2 hover:ring-yellow-400/60 truncate"
                                    >
                                      <span className="truncate leading-none">
                                        SAPA: {task.taskTitle}
                                      </span>
                                      <span className="text-[9px] text-slate-800 ml-1.5 shrink-0 font-semibold opacity-90 bg-white/40 px-1.5 py-0.2 rounded-full">
                                        {task.durationWeeks}w
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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

        {/* Right 3 Cols: "To-do List yang belum di atur" */}
        <div className="xl:col-span-3">
          <div className="bg-[#f1f3f5] rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
            {/* Header: Title + Sliders + Arrows */}
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

                <button
                  type="button"
                  onClick={() => setUnarrangedPage((p) => Math.max(0, p - 1))}
                  disabled={unarrangedPage === 0}
                  className="w-5 h-5 rounded-full bg-white text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

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
                paginatedUnscheduled.map((task) => {
                  const picEmp = karyawanList.find(
                    (k) => k.id === task.idKaryawanAssignJob || k.kodeKaryawan === task.idKaryawanAssignJob
                  );
                  const picName = task.picName || picEmp?.namaLengkap || 'SAPA Team';
                  const picInitial = picName.trim() ? picName.trim().charAt(0).toUpperCase() : 'S';

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-[22px] p-4 border border-slate-300 shadow-2xs hover:shadow-md transition-all cursor-pointer group hover:border-slate-400 flex flex-col justify-between gap-3 min-h-[120px]"
                    >
                      {/* Top Text & Heading */}
                      <div>
                        {/* Row 1: Tanggal - Nama Proyek SAPA */}
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs sm:text-[13px] font-normal text-slate-500 tracking-tight truncate flex-1 min-w-0 pt-0.5">
                            {task.deadlineDate || `${task.year}`} - {task.projectName || 'Nama Proyek SAPA'}
                          </p>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(task)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit To-Do"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus To-Do"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Row 2: To-Do List Proyek SAPA / Nama Item */}
                        <h3 className="mt-1 font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#008d91] transition-colors">
                          {task.taskTitle || 'To-Do List Proyek SAPA'}
                        </h3>

                        {/* Division Tag */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-[#008d91] border border-teal-100 font-semibold">
                            {task.divisi}
                          </span>
                        </div>
                      </div>

                      {/* Row 3: Circular Avatar S & Action Button */}
                      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100/70">
                        <div className="flex items-center gap-2">
                          <div
                            title={`PIC: ${picName}`}
                            className="w-8 h-8 rounded-full bg-[#657677] text-white font-medium text-sm flex items-center justify-center shrink-0 shadow-2xs select-none"
                          >
                            {picInitial}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[110px]" title={picName}>
                            {picName}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenQuickSchedule(task)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition-colors cursor-pointer border border-amber-300"
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>Atur SAPA (Kuning)</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Button at bottom of right card */}
            <div className="mt-4">
              <button
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

      {/* 3. Modal Add / Edit Task — Configures Timeline Proyek SAPA (Kuning) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                  Atur Timeline Proyek SAPA (Kuning)
                </span>
                <h3 className="font-bold text-base text-slate-800 mt-1">
                  {editingTask ? editingTask.taskTitle : 'Tambah To-Do ke Timeline'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              {/* Proyek SAPA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proyek SAPA <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => {
                    const sel = availableProjects.find((p) => p.id === e.target.value);
                    if (sel) {
                      setFormProjectId(sel.id);
                      setFormProjectName(sel.name);
                      setFormDivisi(sel.divisi);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                >
                  {availableProjects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.divisi})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul To-Do List <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTaskTitle}
                  onChange={(e) => setFormTaskTitle(e.target.value)}
                  placeholder="Contoh: Briefing Tim & Materi Promo"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Divisi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Divisi
                  </label>
                  <select
                    value={formDivisi}
                    onChange={(e) => setFormDivisi(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                  >
                    {DIVISI_OPTIONS.filter((d) => d !== 'ALL').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun
                  </label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Orang yang Mengerjakan (PIC) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Orang yang Mengerjakan (PIC)
                </label>
                <select
                  value={formPicId}
                  onChange={(e) => setFormPicId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#008d91]/30 focus:border-[#008d91]"
                >
                  <option value="">-- Pilih Orang yang Mengerjakan --</option>
                  {karyawanList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaLengkap} ({k.kodeKaryawan}) — Divisi {k.divisi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status: Jadwalkan ke Timeline vs Simpan di Belum Diatur */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="chk-scheduled-form"
                  checked={formIsScheduled}
                  onChange={(e) => setFormIsScheduled(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label
                  htmlFor="chk-scheduled-form"
                  className="text-xs font-bold text-slate-700 cursor-pointer select-none"
                >
                  Jadwalkan langsung ke Matrix Timeline
                </label>
              </div>

              {formIsScheduled && (
                <>
                  {/* SECTION: Timeline Proyek SAPA (Kuning) - DIATUR DI SINI */}
                  <div className="p-4 rounded-2xl bg-yellow-50/90 border border-amber-300 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#facc15] border border-amber-400" />
                        <span className="font-bold text-amber-950 text-xs">
                          Timeline Proyek SAPA (Kuning)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-900 bg-white border border-amber-200 px-2 py-0.5 rounded-md">
                        Durasi Target: {formSapaDuration} Minggu
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1 text-xs">
                          Mulai Bulan
                        </label>
                        <select
                          value={formSapaMonth}
                          onChange={(e) => setFormSapaMonth(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 bg-white text-xs outline-none focus:border-amber-500"
                        >
                          {MONTH_FULL_NAMES.map((m, idx) => (
                            <option key={m} value={idx}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1 text-xs">
                          Minggu ke-
                        </label>
                        <select
                          value={formSapaWeek}
                          onChange={(e) => setFormSapaWeek(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 bg-white text-xs outline-none focus:border-amber-500"
                        >
                          <option value={1}>Minggu 1</option>
                          <option value={2}>Minggu 2</option>
                          <option value={3}>Minggu 3</option>
                          <option value={4}>Minggu 4</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-xs">
                        Durasi Rencana SAPA (Minggu)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="24"
                          value={formSapaDuration}
                          onChange={(e) => setFormSapaDuration(Number(e.target.value))}
                          className="flex-1 accent-amber-500"
                        />
                        <span className="font-bold text-amber-950 bg-white border border-amber-300 px-3 py-1 rounded-xl text-xs w-24 text-center">
                          {formSapaDuration} Minggu
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INFO SECTION: Real Timeline Pengerjaan (Tosca) Dicek Otomatis dari Papan Trello */}
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5 shadow-2xs">
                    <span className="w-4 h-4 rounded-full bg-[#009688] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-[#008d91]">
                        Real Timeline Pengerjaan (Tosca): Otomatis dari Papan Trello
                      </p>
                      <p className="text-[11px] text-teal-800 leading-relaxed">
                        Anda tidak perlu mengisi Real Timeline di sini. Sistem akan mengecek secara otomatis kartu to-do yang berstatus <strong>"Ongoing"</strong> pada tab <strong>Papan Trello</strong> dan menampilkan bar tosca secara *real-time*.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Tombol Simpan / Batal */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-colors shadow-2xs cursor-pointer border border-amber-500"
                >
                  {editingTask ? 'Simpan Timeline SAPA' : 'Tambahkan ke Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Quick Schedule Modal from Right Unarranged Card */}
      {quickScheduleTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-yellow-50/70">
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Jadwalkan ke Timeline Proyek SAPA (Kuning)
                </span>
                <h3 className="font-bold text-sm text-slate-800 truncate max-w-[280px]">
                  {quickScheduleTask.taskTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickScheduleTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSchedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIC / Orang yang Mengerjakan
                </label>
                <select
                  value={quickPicId}
                  onChange={(e) => setQuickPicId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-white"
                >
                  {karyawanList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaLengkap} ({k.kodeKaryawan})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rencana Timeline SAPA (Kuning) */}
              <div className="p-3.5 rounded-2xl bg-yellow-50 border border-amber-300 space-y-2.5">
                <span className="font-bold text-amber-950 text-xs block">
                  Rencana Timeline Proyek SAPA (Kuning)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Bulan</label>
                    <select
                      value={quickSapaMonth}
                      onChange={(e) => setQuickSapaMonth(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 bg-white"
                    >
                      {MONTH_FULL_NAMES.map((m, idx) => (
                        <option key={m} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Minggu</label>
                    <select
                      value={quickSapaWeek}
                      onChange={(e) => setQuickSapaWeek(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 bg-white"
                    >
                      <option value={1}>Minggu 1</option>
                      <option value={2}>Minggu 2</option>
                      <option value={3}>Minggu 3</option>
                      <option value={4}>Minggu 4</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Durasi: {quickSapaDuration} Minggu
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={quickSapaDuration}
                    onChange={(e) => setQuickSapaDuration(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900">
                💡 Real Timeline (Tosca) akan dicek secara otomatis saat kartu to-do ini berstatus <strong>Ongoing</strong> pada Papan Trello.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickScheduleTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-2xs border border-amber-500"
                >
                  Jadwalkan ke SAPA (Kuning)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
