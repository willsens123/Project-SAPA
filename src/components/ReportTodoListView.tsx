import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  FolderKanban,
  User,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  FileSpreadsheet,
  Check,
  X,
  Plus,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import { ProjectItem, AppView, TodoTaskItem, KaryawanItem } from '../types';
import { getAllProjectTodos, saveTodosForProject } from '../todoListData';
import { loadKaryawan } from '../karyawanData';
import { loadTimelineTasks, SapaTimelineTask } from '../timelineProyekSapaData';

export interface ReportTodoListViewProps {
  projects?: ProjectItem[];
  divisiOptions?: string[];
  onNavigateView?: (view: AppView) => void;
  onShowToast?: (msg: string) => void;
  isEmbedded?: boolean;
}

type TabStatus = 'all' | 'ongoing' | 'completed' | 'overdue' | 'rutin';

interface FlatTodoItem {
  id: string;
  projectId: string;
  projectName: string;
  projectColor?: string;
  taskId: string;
  taskTitle: string;
  subTaskId?: string;
  subTaskTitle?: string;
  picId: string;
  picName: string;
  picAvatar?: string;
  divisi: string;
  deadline: string;
  completed: boolean;
  status: 'not_started' | 'ongoing' | 'completed';
  isOverdue: boolean;
  isRutin: boolean;
  rutinTipe?: string;
  deskripsi?: string;
}

export const ReportTodoListView: React.FC<ReportTodoListViewProps> = ({
  projects = [],
  divisiOptions = ['UMM', 'FUN', 'MAD', 'PNB', 'KEU', 'MDS'],
  onNavigateView,
  onShowToast,
  isEmbedded = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedPic, setSelectedPic] = useState<string>('ALL');
  const [karyawanList, setKaryawanList] = useState<KaryawanItem[]>([]);
  const [projectTodos, setProjectTodos] = useState<Record<string, TodoTaskItem[]>>({});
  const [timelineTasks, setTimelineTasks] = useState<SapaTimelineTask[]>([]);
  const [sortBy, setSortBy] = useState<'deadline' | 'project' | 'status'>('deadline');

  // Load initial data & listen to local storage updates
  const reloadData = () => {
    try {
      setKaryawanList(loadKaryawan());
      setProjectTodos(getAllProjectTodos());
      setTimelineTasks(loadTimelineTasks());
    } catch (e) {
      console.error('Failed to load todo report data', e);
    }
  };

  useEffect(() => {
    reloadData();
    const handleStorage = () => reloadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Helper mapping project names & colors
  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    projects.forEach((p) => {
      map.set(p.id, { name: p.name, color: p.color || '#008d91' });
    });
    return map;
  }, [projects]);

  // Helper mapping employee PIC names
  const karyawanMap = useMemo(() => {
    const map = new Map<string, KaryawanItem>();
    karyawanList.forEach((k) => {
      map.set(k.id, k);
      map.set(k.namaLengkap.toLowerCase(), k);
      map.set(k.namaPanggilan.toLowerCase(), k);
    });
    return map;
  }, [karyawanList]);

  const resolvePicName = (idOrName?: string): { name: string; initial: string; bg: string } => {
    if (!idOrName || idOrName === '-') return { name: 'Belum Ditugaskan', initial: '?', bg: 'bg-slate-200' };

    const codes = idOrName.split(',').map((s) => s.trim()).filter(Boolean);
    if (codes.length === 0) return { name: 'Belum Ditugaskan', initial: '?', bg: 'bg-slate-200' };

    if (codes.length === 1) {
      const code = codes[0];
      const direct = karyawanMap.get(code) || karyawanMap.get(code.toLowerCase());
      if (direct) {
        return {
          name: direct.namaPanggilan || direct.namaLengkap,
          initial: direct.avatarInitial || direct.namaLengkap.charAt(0).toUpperCase(),
          bg: direct.avatarBg || 'bg-teal-600',
        };
      }
      return {
        name: code,
        initial: code.charAt(0).toUpperCase(),
        bg: 'bg-slate-400',
      };
    }

    // Multiple PICs
    const names = codes.map((code) => {
      const direct = karyawanMap.get(code) || karyawanMap.get(code.toLowerCase());
      return direct ? (direct.namaPanggilan || direct.namaLengkap) : code;
    });

    return {
      name: names.join(', '),
      initial: `${codes.length}`,
      bg: 'bg-[#008d91]',
    };
  };

  // Helper check overdue
  const checkOverdue = (deadlineStr?: string, completed?: boolean): boolean => {
    if (completed || !deadlineStr || deadlineStr === '-') return false;
    try {
      const parts = deadlineStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setHours(23, 59, 59, 999);
        return d.getTime() < Date.now();
      }
    } catch {
      // ignore
    }
    return false;
  };

  // Flatten todos into searchable report rows
  const allFlatRows = useMemo(() => {
    const rows: FlatTodoItem[] = [];

    // 1. Dari projectTodos (TODO List Standar & Subtasks)
    Object.entries(projectTodos).forEach(([pId, rawTasks]) => {
      const tasks = (Array.isArray(rawTasks) ? rawTasks : []) as TodoTaskItem[];
      const projInfo = projectMap.get(pId) || {
        name: pId.startsWith('non-proj') ? 'Tugas Non-Proyek' : pId,
        color: '#64748b',
      };

      tasks.forEach((t) => {
        const isRutinTask = Boolean(t.rutinConfig?.isRutin);
        const pic = resolvePicName(t.idKaryawanAssignJob);
        const isTaskOverdue = checkOverdue(t.deadline, t.completed);

        // Jika memiliki sub-tasks, buat baris untuk setiap sub-task agar detail terlapor
        if (t.subTasks && t.subTasks.length > 0) {
          t.subTasks.forEach((st) => {
            const subPic = st.idKaryawanAssignJob ? resolvePicName(st.idKaryawanAssignJob) : pic;
            const subDeadline = st.deadline || t.deadline;
            const isSubOverdue = checkOverdue(subDeadline, st.completed);

            rows.push({
              id: `${t.id}-${st.id}`,
              projectId: pId,
              projectName: projInfo.name,
              projectColor: projInfo.color,
              taskId: t.id,
              taskTitle: t.task || 'Tugas Tanpa Judul',
              subTaskId: st.id,
              subTaskTitle: st.title,
              picId: st.idKaryawanAssignJob || t.idKaryawanAssignJob || '',
              picName: subPic.name,
              divisi: t.divisi || 'UMM',
              deadline: subDeadline || '-',
              completed: Boolean(st.completed),
              status: st.completed ? 'completed' : st.status || 'ongoing',
              isOverdue: isSubOverdue,
              isRutin: isRutinTask,
              rutinTipe: t.rutinConfig?.berkalaMode,
              deskripsi: st.deskripsi || t.deskripsi,
            });
          });
        } else {
          // Task utama tanpa subtasks
          rows.push({
            id: t.id,
            projectId: pId,
            projectName: projInfo.name,
            projectColor: projInfo.color,
            taskId: t.id,
            taskTitle: t.task || 'Tugas Tanpa Judul',
            picId: t.idKaryawanAssignJob || '',
            picName: pic.name,
            divisi: t.divisi || 'UMM',
            deadline: t.deadline || '-',
            completed: Boolean(t.completed),
            status: t.completed ? 'completed' : t.status || 'ongoing',
            isOverdue: isTaskOverdue,
            isRutin: isRutinTask,
            rutinTipe: t.rutinConfig?.berkalaMode,
            deskripsi: t.deskripsi,
          });
        }
      });
    });

    // 2. Dari timelineTasks (Milestone / Task Timeline Proyek SAPA)
    timelineTasks.forEach((tt) => {
      const projInfo = projectMap.get(tt.proyekSapaId) || {
        name: tt.proyekSapaNama || 'Proyek SAPA',
        color: '#008d91',
      };
      const pic = resolvePicName(tt.picKaryawanId || tt.picNama || '');
      const isTtOverdue = checkOverdue(tt.tanggalSelesai || tt.tanggalMulai, tt.status === 'completed');

      rows.push({
        id: `timeline-${tt.id}`,
        projectId: tt.proyekSapaId,
        projectName: projInfo.name,
        projectColor: projInfo.color,
        taskId: tt.id,
        taskTitle: tt.namaTask || 'Timeline Task',
        picId: tt.picKaryawanId || '',
        picName: pic.name,
        divisi: tt.divisi || 'UMM',
        deadline: tt.tanggalSelesai || tt.tanggalMulai || '-',
        completed: tt.status === 'completed',
        status: tt.status === 'completed' ? 'completed' : tt.status === 'ongoing' ? 'ongoing' : 'not_started',
        isOverdue: isTtOverdue,
        isRutin: false,
        deskripsi: tt.deskripsi,
      });
    });

    return rows;
  }, [projectTodos, timelineTasks, projectMap, karyawanMap]);

  // Aggregate KPI metrics
  const metrics = useMemo(() => {
    const total = allFlatRows.length;
    const completed = allFlatRows.filter((r) => r.completed).length;
    const overdue = allFlatRows.filter((r) => r.isOverdue).length;
    const ongoing = allFlatRows.filter((r) => !r.completed && !r.isOverdue).length;
    const rutin = allFlatRows.filter((r) => r.isRutin).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, ongoing, rutin, percent };
  }, [allFlatRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return allFlatRows.filter((row) => {
      // Tab filter
      if (activeTab === 'ongoing' && (row.completed || row.isOverdue)) return false;
      if (activeTab === 'completed' && !row.completed) return false;
      if (activeTab === 'overdue' && !row.isOverdue) return false;
      if (activeTab === 'rutin' && !row.isRutin) return false;

      // Project filter
      if (selectedProject !== 'ALL' && row.projectId !== selectedProject) return false;

      // Divisi filter
      if (selectedDivisi !== 'ALL' && row.divisi.toUpperCase() !== selectedDivisi.toUpperCase()) return false;

      // PIC filter
      if (selectedPic !== 'ALL' && row.picId !== selectedPic && row.picName !== selectedPic) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          row.taskTitle.toLowerCase().includes(q) ||
          (row.subTaskTitle && row.subTaskTitle.toLowerCase().includes(q)) ||
          row.projectName.toLowerCase().includes(q) ||
          row.picName.toLowerCase().includes(q) ||
          row.divisi.toLowerCase().includes(q) ||
          row.deadline.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        return (a.deadline || '9999').localeCompare(b.deadline || '9999');
      }
      if (sortBy === 'project') {
        return a.projectName.localeCompare(b.projectName);
      }
      if (sortBy === 'status') {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      }
      return 0;
    });
  }, [allFlatRows, activeTab, selectedProject, selectedDivisi, selectedPic, searchQuery, sortBy]);

  // Toggle complete directly in report
  const handleToggleRowComplete = (row: FlatTodoItem) => {
    if (row.id.startsWith('timeline-')) {
      // Toggle timeline task
      const updated = timelineTasks.map((t) => {
        if (`timeline-${t.id}` === row.id) {
          return {
            ...t,
            status: t.status === 'completed' ? ('ongoing' as const) : ('completed' as const),
          };
        }
        return t;
      });
      setTimelineTasks(updated);
      try {
        localStorage.setItem('sapa_timeline_tasks_v1', JSON.stringify(updated));
        if (onShowToast) onShowToast('Status To-Do Timeline berhasil diperbarui');
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Toggle in projectTodos
    const pId = row.projectId;
    const tasks = projectTodos[pId] || [];
    const updatedTasks = tasks.map((t) => {
      if (t.id === row.taskId) {
        if (row.subTaskId) {
          const updatedSub = t.subTasks.map((st) => {
            if (st.id === row.subTaskId) {
              return { ...st, completed: !st.completed };
            }
            return st;
          });
          const allSubDone = updatedSub.every((st) => st.completed);
          return { ...t, subTasks: updatedSub, completed: allSubDone };
        } else {
          return { ...t, completed: !t.completed };
        }
      }
      return t;
    });

    const newTodos = { ...projectTodos, [pId]: updatedTasks };
    setProjectTodos(newTodos);
    saveTodosForProject(pId, updatedTasks);
    if (onShowToast) {
      onShowToast(`Status "${row.subTaskTitle || row.taskTitle}" berhasil diperbarui`);
    }
  };

  const handlePrintReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={`w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200 ${isEmbedded ? 'mt-6' : 'my-4'}`}>
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#008d91] flex items-center justify-center shadow-xs">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Report To-Do List
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-[#008d91]">
                {metrics.total} Tugas
              </span>
              {metrics.overdue > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                  {metrics.overdue} Terlambat
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Laporan ringkasan & pemantauan progress seluruh To-Do List & Milestone Proyek SAPA
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('todoList')}
              className="px-3 py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Buka Menu To-Do</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintReport}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Cetak Laporan"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={reloadData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {isEmbedded && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title={isCollapsed ? 'Buka Laporan' : 'Ciutkan Laporan'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 space-y-5 animate-in fade-in duration-150">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* 1. Total Tugas */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Total Tugas
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-800">{metrics.total}</span>
                <span className="text-xs font-semibold text-slate-400">100%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-slate-400 w-full" />
              </div>
            </div>

            {/* 2. Selesai */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Selesai
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-emerald-700">{metrics.completed}</span>
                <span className="text-xs font-bold text-emerald-600">{metrics.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${metrics.percent}%` }}
                />
              </div>
            </div>

            {/* 3. Sedang Berjalan */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/70">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  Berjalan
                </span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-blue-700">{metrics.ongoing}</span>
                <span className="text-xs font-semibold text-blue-500">
                  {metrics.total > 0 ? Math.round((metrics.ongoing / metrics.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-blue-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? (metrics.ongoing / metrics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 4. Terlambat / Overdue */}
            <div className={`p-3.5 rounded-xl border ${metrics.overdue > 0 ? 'bg-rose-50/90 border-rose-200' : 'bg-slate-50/80 border-slate-200/70'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${metrics.overdue > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                  Terlambat
                </span>
                <AlertTriangle className={`w-3.5 h-3.5 ${metrics.overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-xl sm:text-2xl font-black ${metrics.overdue > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                  {metrics.overdue}
                </span>
                <span className={`text-xs font-semibold ${metrics.overdue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {metrics.total > 0 ? Math.round((metrics.overdue / metrics.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-rose-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? (metrics.overdue / metrics.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 5. Tugas Rutin */}
            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/70 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                  To-Do Rutin
                </span>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-purple-700">{metrics.rutin}</span>
                <span className="text-xs font-semibold text-purple-500">Berulang</span>
              </div>
              <div className="w-full h-1.5 bg-purple-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? (metrics.rutin / metrics.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter Bar & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ongoing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'ongoing'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Berjalan ({metrics.ongoing})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Selesai ({metrics.completed})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('overdue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'overdue'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Terlambat ({metrics.overdue})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rutin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'rutin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Rutin ({metrics.rutin})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari tugas, PIC, proyek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
            {/* Proyek Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Proyek:</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#008d91]"
              >
                <option value="ALL">Semua Proyek SAPA</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Divisi Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Divisi:</span>
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#008d91]"
              >
                <option value="ALL">Semua Divisi</option>
                {divisiOptions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>

            {/* PIC Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">PIC:</span>
              <select
                value={selectedPic}
                onChange={(e) => setSelectedPic(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#008d91]"
              >
                <option value="ALL">Semua PIC</option>
                {karyawanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaPanggilan || k.namaLengkap}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-semibold text-slate-500">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#008d91]"
              >
                <option value="deadline">Berdasarkan Deadline</option>
                <option value="project">Berdasarkan Proyek</option>
                <option value="status">Berdasarkan Status</option>
              </select>
            </div>
          </div>

          {/* Table / List View */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5 w-12 text-center">Status</th>
                    <th className="py-3 px-3.5 min-w-[200px]">Tugas & Sub-Task</th>
                    <th className="py-3 px-3.5 min-w-[140px]">Proyek SAPA</th>
                    <th className="py-3 px-3.5 w-24">Divisi</th>
                    <th className="py-3 px-3.5 min-w-[130px]">PIC / Karyawan</th>
                    <th className="py-3 px-3.5 min-w-[110px]">Deadline</th>
                    <th className="py-3 px-3.5 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <ListTodo className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">Tidak ada data To-Do List yang cocok</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Coba ubah filter atau kata kunci pencarian Anda
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const isComplete = row.completed;
                      const isLate = row.isOverdue;

                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isComplete ? 'bg-slate-50/40 text-slate-400' : ''
                          }`}
                        >
                          {/* 1. Checkbox / Complete Status */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRowComplete(row)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer mx-auto ${
                                isComplete
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : isLate
                                  ? 'border-rose-400 hover:border-rose-600 bg-rose-50/40'
                                  : 'border-slate-300 hover:border-teal-500 bg-white'
                              }`}
                              title={isComplete ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                            >
                              {isComplete && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </td>

                          {/* 2. Tugas & Sub-Task */}
                          <td className="py-3 px-3.5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`font-semibold ${
                                    isComplete
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {row.taskTitle}
                                </span>
                                {row.isRutin && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                    Rutin {row.rutinTipe ? `(${row.rutinTipe})` : ''}
                                  </span>
                                )}
                              </div>
                              {row.subTaskTitle && (
                                <div className="text-[11px] text-slate-500 flex items-center gap-1 pl-2 border-l-2 border-teal-400">
                                  <span>↳ Sub-task:</span>
                                  <span className="font-medium text-slate-700">{row.subTaskTitle}</span>
                                </div>
                              )}
                              {row.deskripsi && (
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {row.deskripsi}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* 3. Proyek SAPA */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: row.projectColor || '#008d91' }}
                              />
                              <span className="font-medium text-slate-700 truncate max-w-[160px]" title={row.projectName}>
                                {row.projectName}
                              </span>
                            </div>
                          </td>

                          {/* 4. Divisi */}
                          <td className="py-3 px-3.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {row.divisi}
                            </span>
                          </td>

                          {/* 5. PIC */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                {row.picName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                                {row.picName}
                              </span>
                            </div>
                          </td>

                          {/* 6. Deadline */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span
                                className={`text-xs font-semibold ${
                                  isLate && !isComplete
                                    ? 'text-rose-600 font-bold'
                                    : isComplete
                                    ? 'text-slate-400'
                                    : 'text-slate-700'
                                }`}
                              >
                                {row.deadline}
                              </span>
                              {isLate && !isComplete && (
                                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Terlambat
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Action */}
                          <td className="py-3 px-3.5 text-center">
                            {onNavigateView && (
                              <button
                                type="button"
                                onClick={() => onNavigateView('todoList')}
                                className="px-2 py-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors cursor-pointer"
                                title="Lihat di To-Do List"
                              >
                                Detail
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary in Table */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Menampilkan <span className="font-bold text-slate-700">{filteredRows.length}</span> dari{' '}
                <span className="font-bold text-slate-700">{metrics.total}</span> total To-Do List
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Selesai: {metrics.completed}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Berjalan: {metrics.ongoing}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Terlambat: {metrics.overdue}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
