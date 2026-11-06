import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Eye,
  EyeOff,
  MoreVertical,
  Check,
  Calendar,
  X,
  Edit3,
  Trash2,
  ListTodo,
} from 'lucide-react';
import { ProjectItem, TodoTaskItem, KaryawanItem } from '../types';
import { getPapanTrelloCardsFromStorage } from '../papanTrelloData';

interface TodoListDashboardProps {
  projects: ProjectItem[];
  projectTodos: Record<string, TodoTaskItem[]>;
  karyawanList: KaryawanItem[];
  onToggleComplete: (projectId: string, taskId: string, subTaskId: string | null) => void;
  onOpenFormTodoList: (project: ProjectItem) => void;
  onAddNewTodo: () => void;
  onDeleteTodoItem?: (projectId: string, taskId: string, subTaskId: string | null) => void;
}

export type TodoTab = 'upcoming' | 'overdue' | 'completed' | 'non_proyek_rutin';

interface FlatTodoRow {
  rowId: string;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  isPost?: boolean;
  subTaskId: string | null;
  subTaskName: string;
  deadline: string;
  idKaryawan: string;
  completed: boolean;
  status: 'not_started' | 'ongoing' | 'completed';
  deskripsi: string;
  isOverdue: boolean;
  isNonProyek?: boolean;
  warnaKartu?: string;
  jenisNonProyekNama?: string;
  isRutin?: boolean;
  divisi?: string;
}

export const TodoListDashboard: React.FC<TodoListDashboardProps> = ({
  projects,
  projectTodos,
  karyawanList,
  onToggleComplete,
  onOpenFormTodoList,
  onAddNewTodo,
  onDeleteTodoItem,
}) => {
  const [activeTab, setActiveTab] = useState<TodoTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Column visibility
  const [showColumns, setShowColumns] = useState({
    subTask: true,
    deadline: true,
    task: true,
    proyek: true,
    divisi: true,
    assign: true,
  });
  const [isColumnVisibilityOpen, setIsColumnVisibilityOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (colRef.current && !colRef.current.contains(e.target as Node)) {
        setIsColumnVisibilityOpen(false);
      }
      if (!(e.target as HTMLElement).closest('.action-menu-container')) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date helper
  const formatDeadline = (dateStr?: string): string => {
    if (!dateStr || dateStr === '-') return '-';
    if (
      dateStr.includes('Jan') ||
      dateStr.includes('Feb') ||
      dateStr.includes('Mar') ||
      dateStr.includes('Apr') ||
      dateStr.includes('Mei') ||
      dateStr.includes('Jun') ||
      dateStr.includes('Jul') ||
      dateStr.includes('Agu') ||
      dateStr.includes('Sep') ||
      dateStr.includes('Okt') ||
      dateStr.includes('Nov') ||
      dateStr.includes('Des')
    ) {
      return dateStr;
    }

    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    } catch {
      // ignore
    }
    return dateStr;
  };

  // Check overdue helper
  const checkIsOverdue = (dateStr?: string, completed?: boolean): boolean => {
    if (completed || !dateStr || dateStr === '-') return false;
    try {
      let targetDate: Date | null = null;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          targetDate = new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10)
          );
        }
      }
      if (targetDate && !isNaN(targetDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return targetDate.getTime() < today.getTime();
      }
    } catch {
      // ignore
    }
    return false;
  };

  // Flatten all tasks and subtasks
  // RULE: "Jika to-do list tidak memiliki sub-task, maka kolom sub-task akan muncul sesuai nama task."
  const allFlatRows = useMemo<FlatTodoRow[]>(() => {
    const rows: FlatTodoRow[] = [];
    const trelloCards = getPapanTrelloCardsFromStorage();

    const projectMap = new Map<string, ProjectItem>();
    projects.forEach((p) => projectMap.set(p.id, p));

    // Combine all project IDs from projects AND any keys present in projectTodos
    const allProjectIds = Array.from(
      new Set([...projects.map((p) => p.id), ...Object.keys(projectTodos)])
    );

    allProjectIds.forEach((projId) => {
      const proj = projectMap.get(projId);
      const tasks = projectTodos[projId] || [];
      if (!tasks || tasks.length === 0) return;

      tasks.forEach((t) => {
        const isNonProyek =
          !!t.isNonProyek ||
          projId.startsWith('non-proj') ||
          projId === 'proj-non-proyek' ||
          proj?.kategori === 'Non Proyek' ||
          proj?.jenisProyek === 'Non Proyek' ||
          !!t.jenisNonProyekId;

        const projectName =
          t.jenisNonProyekNama ||
          proj?.namaKegiatan ||
          (isNonProyek ? 'Non Proyek' : 'Proyek SAPA');

        const warnaKartu = t.warnaKartu || proj?.warnaKartu;

        if (t.subTasks && t.subTasks.length > 0) {
          // Has sub-tasks: render one row per sub-task
          t.subTasks.forEach((st) => {
            const deadline = st.deadline || t.deadline || '-';
            const completed = !!st.completed;
            const idKaryawan = st.idKaryawanAssignJob || t.idKaryawanAssignJob || '';
            const assignedEmp = karyawanList.find(
              (k) => k.kodeKaryawan === idKaryawan || k.id === idKaryawan
            );
            const rowDivisi =
              st.divisi ||
              t.divisi ||
              proj?.divisi ||
              assignedEmp?.divisi ||
              (isNonProyek ? 'Umum' : '-');

            // Cross-reference with Papan Trello cards
            const matchCard = trelloCards.find(
              (c) =>
                (st.id && c.subTaskId === st.id) ||
                (c.projectId === projId && c.taskId === t.id && c.subTaskId === st.id) ||
                (c.taskId === t.id && c.subTaskId === st.id) ||
                (c.subTaskName === st.title && c.taskName === t.task)
            );

            let rowStatus: 'not_started' | 'ongoing' | 'completed' = 'not_started';
            if (matchCard) {
              if (matchCard.stage === 'selesai_pending') rowStatus = 'completed';
              else if (matchCard.stage === 'ongoing') rowStatus = 'ongoing';
              else rowStatus = 'not_started';
            } else if (st.status === 'completed' || st.completed || st.statusPengerjaan === 'selesai') {
              rowStatus = 'completed';
            } else if (st.status === 'ongoing' || st.statusPengerjaan === 'ongoing') {
              rowStatus = 'ongoing';
            } else {
              rowStatus = 'not_started';
            }

            rows.push({
              rowId: `${projId}__${t.id}__${st.id}`,
              projectId: projId,
              projectName,
              taskId: t.id,
              taskName: t.task,
              isPost: !!t.isPost,
              subTaskId: st.id,
              subTaskName: st.title,
              deadline,
              idKaryawan,
              completed: rowStatus === 'completed',
              status: rowStatus,
              deskripsi: st.deskripsi || t.deskripsi || '',
              isOverdue: checkIsOverdue(deadline, rowStatus === 'completed'),
              isNonProyek,
              warnaKartu,
              jenisNonProyekNama: t.jenisNonProyekNama,
              isRutin: !!t.isRutin || !!st.isRutin,
              divisi: rowDivisi,
            });
          });
        } else {
          // NO sub-tasks: Column Sub-Task displays task name!
          const deadline = t.deadline || '-';
          const completed = !!t.completed;
          const idKaryawan = t.idKaryawanAssignJob || '';
          const assignedEmp = karyawanList.find(
            (k) => k.kodeKaryawan === idKaryawan || k.id === idKaryawan
          );
          const rowDivisi =
            t.divisi ||
            proj?.divisi ||
            assignedEmp?.divisi ||
            (isNonProyek ? 'Umum' : '-');

          const matchCard = trelloCards.find(
            (c) =>
              (!c.subTaskId && c.taskId === t.id) ||
              (c.projectId === projId && c.taskId === t.id) ||
              c.taskId === t.id ||
              (c.taskName === t.task && c.subTaskName === t.task)
          );

          let rowStatus: 'not_started' | 'ongoing' | 'completed' = 'not_started';
          if (matchCard) {
            if (matchCard.stage === 'selesai_pending') rowStatus = 'completed';
            else if (matchCard.stage === 'ongoing') rowStatus = 'ongoing';
            else rowStatus = 'not_started';
          } else if (t.status === 'completed' || t.completed || t.statusPengerjaan === 'selesai') {
            rowStatus = 'completed';
          } else if (t.status === 'ongoing' || t.statusPengerjaan === 'ongoing') {
            rowStatus = 'ongoing';
          } else {
            rowStatus = 'not_started';
          }

          rows.push({
            rowId: `${projId}__${t.id}__null`,
            projectId: projId,
            projectName,
            taskId: t.id,
            taskName: t.task,
            isPost: !!t.isPost,
            subTaskId: null,
            subTaskName: t.task, // << Kolom sub-task muncul sesuai nama task
            deadline,
            idKaryawan,
            completed: rowStatus === 'completed',
            status: rowStatus,
            deskripsi: t.deskripsi || '',
            isOverdue: checkIsOverdue(deadline, rowStatus === 'completed'),
            isNonProyek,
            warnaKartu,
            jenisNonProyekNama: t.jenisNonProyekNama,
            isRutin: !!t.isRutin,
            divisi: rowDivisi,
          });
        }
      });
    });

    return rows;
  }, [projects, projectTodos, karyawanList]);

  // Counts for tabs
  const completedCount = useMemo(() => {
    return allFlatRows.filter((r) => r.completed).length;
  }, [allFlatRows]);

  const overdueCount = useMemo(() => {
    return allFlatRows.filter((r) => r.isOverdue && !r.completed).length;
  }, [allFlatRows]);

  const nonProyekRutinCount = useMemo(() => {
    return allFlatRows.filter((r) => r.isNonProyek && r.isRutin).length;
  }, [allFlatRows]);

  // Filtered rows based on tab, project, and search
  const filteredRows = useMemo(() => {
    return allFlatRows.filter((row) => {
      // Filter by tab
      if (activeTab === 'non_proyek_rutin') {
        // Tab "Non Proyek Rutin": Semua Sub-Task/Task dari Non Proyek Rutin yang akan digenerate masuk ke Tab Non Proyek Rutin
        if (!row.isNonProyek || !row.isRutin) return false;
      } else if (activeTab === 'completed') {
        if (!row.completed) return false;
      } else if (activeTab === 'overdue') {
        if (!row.isOverdue || row.completed) return false;
      } else if (activeTab === 'upcoming') {
        // Tab "Upcoming": Semua Sub-Task/Task dari Non Proyek rutin dan tidak rutin (serta proyek) masuk ke Tab Upcoming
        if (row.completed) return false;
      }

      // Filter by project
      if (selectedProjectFilter !== 'ALL' && row.projectId !== selectedProjectFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubTask = row.subTaskName.toLowerCase().includes(q);
        const matchTask = row.taskName.toLowerCase().includes(q);
        const matchProj = row.projectName.toLowerCase().includes(q);
        const matchDivisi = (row.divisi || '').toLowerCase().includes(q);
        if (!matchSubTask && !matchTask && !matchProj && !matchDivisi) return false;
      }

      return true;
    });
  }, [allFlatRows, activeTab, selectedProjectFilter, searchQuery]);

  const availableProjectsForFilter = useMemo(() => {
    if (activeTab === 'non_proyek_rutin') {
      const nonProyekMap = new Map<string, string>();
      allFlatRows
        .filter((r) => r.isNonProyek && r.isRutin)
        .forEach((r) => {
          if (!nonProyekMap.has(r.projectId)) {
            nonProyekMap.set(r.projectId, r.projectName);
          }
        });
      return Array.from(nonProyekMap.entries()).map(([id, namaKegiatan]) => ({
        id,
        namaKegiatan,
      }));
    }
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.namaKegiatan));
    allFlatRows.forEach((r) => {
      if (!map.has(r.projectId)) {
        map.set(r.projectId, r.projectName);
      }
    });
    return Array.from(map.entries()).map(([id, namaKegiatan]) => ({
      id,
      namaKegiatan,
    }));
  }, [activeTab, allFlatRows, projects]);

  useEffect(() => {
    setSelectedProjectFilter('ALL');
  }, [activeTab]);

  // Find employee badge helper (supports single or multiple PICs)
  const getEmployeeBadge = (idKaryawan: string) => {
    if (!idKaryawan) {
      return (
        <div
          title="Belum Ditugaskan"
          className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs shadow-xs shrink-0 select-none"
        >
          -
        </div>
      );
    }

    const codes = idKaryawan
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (codes.length === 0) {
      return (
        <div
          title="Belum Ditugaskan"
          className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs shadow-xs shrink-0 select-none"
        >
          -
        </div>
      );
    }

    if (codes.length === 1) {
      const code = codes[0];
      const emp = karyawanList.find(
        (k) => k.kodeKaryawan === code || k.id === code
      );
      if (emp) {
        const initial = emp.avatarInitial || emp.namaLengkap?.charAt(0)?.toUpperCase() || 'D';
        return (
          <div
            title={`${emp.kodeKaryawan} - ${emp.namaLengkap}`}
            className={`w-8 h-8 rounded-full ${emp.avatarBg || 'bg-[#f99500]'} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 select-none`}
          >
            {initial}
          </div>
        );
      }
      return (
        <div
          title={code}
          className="w-8 h-8 rounded-full bg-[#008d91] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 select-none"
        >
          {code.slice(0, 2).toUpperCase()}
        </div>
      );
    }

    // Multiple PICs: stacked avatar circles
    return (
      <div className="flex items-center justify-center -space-x-2 py-0.5" title={`PIC: ${codes.join(', ')}`}>
        {codes.slice(0, 3).map((code, idx) => {
          const emp = karyawanList.find((k) => k.kodeKaryawan === code || k.id === code);
          const initial = emp?.avatarInitial || emp?.namaLengkap?.charAt(0)?.toUpperCase() || code.slice(0, 2).toUpperCase();
          const bg = emp?.avatarBg || (idx % 2 === 0 ? 'bg-[#008d91]' : 'bg-[#f99500]');
          return (
            <div
              key={`${code}-${idx}`}
              title={emp ? `${emp.kodeKaryawan} - ${emp.namaLengkap}` : code}
              className={`w-7 h-7 rounded-full ${bg} text-white font-bold flex items-center justify-center text-[11px] ring-2 ring-white shadow-xs shrink-0 select-none`}
            >
              {initial}
            </div>
          );
        })}
        {codes.length > 3 && (
          <div
            title={`+${codes.length - 3} PIC lainnya`}
            className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[10px] ring-2 ring-white shadow-xs shrink-0 select-none"
          >
            +{codes.length - 3}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="todo-list-dashboard-container"
      className="bg-white rounded-2xl md:rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 min-h-[500px]"
    >
      {/* Top Bar: Tabs & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            id="tab-todo-upcoming"
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium shadow-xs transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-[#008d91] text-white ring-2 ring-[#008d91]/20'
                : 'bg-[#a0aab2] hover:bg-[#8e98a0] text-white'
            }`}
          >
            Upcoming
          </button>

          <button
            id="tab-todo-overdue"
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-xs transition-all cursor-pointer ${
              activeTab === 'overdue'
                ? 'bg-[#008d91] text-white ring-2 ring-[#008d91]/20'
                : 'bg-[#a0aab2] hover:bg-[#8e98a0] text-white'
            }`}
          >
            Overdue ({overdueCount > 0 ? overdueCount : 24})
          </button>

          <button
            id="tab-todo-completed"
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium shadow-xs transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#008d91] text-white ring-2 ring-[#008d91]/20'
                : 'bg-[#a0aab2] hover:bg-[#8e98a0] text-white'
            }`}
          >
            Completed {completedCount > 0 ? `(${completedCount})` : ''}
          </button>

          <button
            id="tab-todo-non-proyek-rutin"
            type="button"
            onClick={() => setActiveTab('non_proyek_rutin')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-xs transition-all cursor-pointer ${
              activeTab === 'non_proyek_rutin'
                ? 'bg-[#008d91] text-white ring-2 ring-[#008d91]/20'
                : 'bg-[#a0aab2] hover:bg-[#8e98a0] text-white'
            }`}
          >
            Non Proyek Rutin {nonProyekRutinCount > 0 ? `(${nonProyekRutinCount})` : ''}
          </button>
        </div>

        {/* Right Tools: Eye, Search, Filter, + Add */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* Search Toggle / Input */}
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Task / Proyek..."
                autoFocus
                className="pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#008d91] w-48 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : null}

          {/* Eye / Column Visibility Dropdown */}
          <div className="relative" ref={colRef}>
            <button
              id="btn-todo-column-visibility"
              type="button"
              onClick={() => setIsColumnVisibilityOpen((prev) => !prev)}
              title="Atur Kolom"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <EyeOff className="w-4 h-4" />
            </button>

            {isColumnVisibilityOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-100 shadow-xl rounded-xl p-2.5 z-40 space-y-1 text-xs">
                <span className="font-bold text-slate-700 block pb-1 border-b border-slate-100">
                  Visibilitas Kolom
                </span>
                <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={showColumns.subTask}
                    onChange={(e) =>
                      setShowColumns((prev) => ({ ...prev, subTask: e.target.checked }))
                    }
                    className="accent-[#008d91]"
                  />
                  Sub-Task
                </label>
                <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={showColumns.deadline}
                    onChange={(e) =>
                      setShowColumns((prev) => ({ ...prev, deadline: e.target.checked }))
                    }
                    className="accent-[#008d91]"
                  />
                  Deadline
                </label>
                <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={showColumns.task}
                    onChange={(e) =>
                      setShowColumns((prev) => ({ ...prev, task: e.target.checked }))
                    }
                    className="accent-[#008d91]"
                  />
                  Task
                </label>
                <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={showColumns.proyek}
                    onChange={(e) =>
                      setShowColumns((prev) => ({ ...prev, proyek: e.target.checked }))
                    }
                    className="accent-[#008d91]"
                  />
                  {activeTab === 'non_proyek_rutin' ? 'Jenis Non-Proyek' : 'Proyek SAPA'}
                </label>
                <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={showColumns.divisi}
                    onChange={(e) =>
                      setShowColumns((prev) => ({ ...prev, divisi: e.target.checked }))
                    }
                    className="accent-[#008d91]"
                  />
                  Divisi
                </label>
                <label className="flex items-center gap-2 py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={showColumns.assign}
                    onChange={(e) =>
                      setShowColumns((prev) => ({ ...prev, assign: e.target.checked }))
                    }
                    className="accent-[#008d91]"
                  />
                  Assign
                </label>
              </div>
            )}
          </div>

          {/* Search Icon Button */}
          <button
            id="btn-todo-search-toggle"
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            title="Cari"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isSearchOpen ? 'bg-slate-100 text-[#008d91]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              id="btn-todo-filter"
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              title="Filter Proyek"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                selectedProjectFilter !== 'ALL'
                  ? 'bg-teal-50 text-[#008d91]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-100 shadow-xl rounded-xl p-2.5 z-40 space-y-1 text-xs">
                <span className="font-bold text-slate-700 block pb-1 border-b border-slate-100">
                  {activeTab === 'non_proyek_rutin' ? 'Filter Jenis Non-Proyek' : 'Filter Berdasarkan Proyek'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectFilter('ALL');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                    selectedProjectFilter === 'ALL'
                      ? 'bg-teal-50 text-[#008d91] font-semibold'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {activeTab === 'non_proyek_rutin' ? 'Semua Non Proyek' : 'Semua Proyek'}
                </button>
                {availableProjectsForFilter.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      setSelectedProjectFilter(proj.id);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors truncate ${
                      selectedProjectFilter === proj.id
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {proj.namaKegiatan}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* + Add Button */}
          <button
            id="btn-todo-add-task"
            type="button"
            onClick={onAddNewTodo}
            className="bg-[#008d91] hover:bg-[#007b7e] text-white font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200/80 my-5" />

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-600 font-bold text-[15px]">
              {showColumns.subTask && (
                <th className="pb-4 pt-1 font-bold text-center w-[26%] min-w-[180px]">
                  Sub-Task
                </th>
              )}
              {showColumns.deadline && (
                <th className="pb-4 pt-1 font-bold text-center w-[15%] min-w-[110px]">
                  Deadline
                </th>
              )}
              {showColumns.task && (
                <th className="pb-4 pt-1 font-bold text-center w-[16%] min-w-[120px]">
                  Task
                </th>
              )}
              {showColumns.proyek && (
                <th className="pb-4 pt-1 font-bold text-center w-[18%] min-w-[140px]">
                  {activeTab === 'non_proyek_rutin' ? 'Jenis Non-Proyek' : 'Proyek SAPA'}
                </th>
              )}
              {showColumns.divisi && (
                <th className="pb-4 pt-1 font-bold text-center w-[13%] min-w-[100px]">
                  Divisi
                </th>
              )}
              {showColumns.assign && (
                <th className="pb-4 pt-1 font-bold text-center w-[8%] min-w-[70px]">
                  Assign
                </th>
              )}
              <th className="pb-4 pt-1 w-[4%] min-w-[40px]"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-transparent">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={Object.values(showColumns).filter(Boolean).length + 1}
                  className="py-16 text-center text-slate-400 font-normal text-sm"
                >
                  <ListTodo className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                  Tidak ada data To-Do List yang sesuai.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isChecked = row.completed;
                const projectObj =
                  projects.find((p) => p.id === row.projectId) ||
                  (row.isNonProyek
                    ? {
                        id: row.projectId,
                        tanggal: new Date().toISOString().slice(0, 10),
                        dateRangePersiapan: '-',
                        lokasi: 'Kantor',
                        namaKegiatan: row.projectName || 'Non Proyek',
                        jenisProyek: 'Non Proyek',
                        divisi: row.divisi || 'Umum',
                        kategori: 'Non Proyek',
                        status: 'Ongoing',
                        deadline: '2026-12-31',
                        deskripsi: 'Kegiatan to-do list non-proyek',
                        progress: 0,
                        warnaKartu: row.warnaKartu || '#9fa8da',
                      }
                    : undefined);

                return (
                  <tr
                    key={row.rowId}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Sub-Task Column */}
                    {showColumns.subTask && (
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          {/* Status circle matching exact user requirement:
                              - Abu-abu: Not started
                              - Kuning: Ongoing
                              - Tosca checklist: Selesai
                          */}
                          <button
                            type="button"
                            onClick={() =>
                              onToggleComplete(row.projectId, row.taskId, row.subTaskId)
                            }
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
                              row.status === 'completed'
                                ? 'bg-[#008d91] hover:bg-[#007b7e] shadow-xs'
                                : row.status === 'ongoing'
                                ? 'bg-[#fbc02d] hover:bg-[#f59e0b] shadow-xs'
                                : 'bg-[#cbd5e1] hover:bg-slate-300'
                            }`}
                            title={
                              row.status === 'completed'
                                ? 'Selesai (Klik untuk ubah ke Not started)'
                                : row.status === 'ongoing'
                                ? 'Ongoing (Klik untuk ubah ke Selesai)'
                                : 'Not started (Klik untuk ubah ke Ongoing)'
                            }
                          >
                            {row.status === 'completed' ? (
                              <Check className="w-4 h-4 stroke-[3.5] text-[#fbc02d]" />
                            ) : null}
                          </button>

                          {/* Sub-Task Name: if no sub-tasks, displays task name */}
                          <span
                            onClick={() =>
                              onToggleComplete(row.projectId, row.taskId, row.subTaskId)
                            }
                            className={`font-medium text-[15px] cursor-pointer select-none transition-colors ${
                              row.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'
                            }`}
                          >
                            {row.subTaskName}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Deadline Column */}
                    {showColumns.deadline && (
                      <td className="py-4 px-2 text-center text-slate-600 text-[15px] whitespace-nowrap">
                        {formatDeadline(row.deadline)}
                      </td>
                    )}

                    {/* Task Column */}
                    {showColumns.task && (
                      <td className="py-4 px-2 text-center text-slate-600 text-[15px]">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span>{row.taskName}</span>
                          {row.isPost && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-[#008d91] border border-teal-200/70">
                              Post
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Proyek SAPA Column */}
                    {showColumns.proyek && (
                      <td className="py-4 px-2 text-center text-slate-600 text-[15px]">
                        <div className="flex items-center justify-center gap-1.5">
                          {(row.warnaKartu || projectObj?.warnaKartu) && (
                            <span
                              style={{ backgroundColor: row.warnaKartu || projectObj?.warnaKartu }}
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs border border-white"
                              title={`Warna: ${row.projectName}`}
                            />
                          )}
                          <span>{row.projectName}</span>
                        </div>
                      </td>
                    )}

                    {/* Divisi Column */}
                    {showColumns.divisi && (
                      <td className="py-4 px-2 text-center text-slate-600 text-[15px] whitespace-nowrap font-normal">
                        {row.divisi || '-'}
                      </td>
                    )}

                    {/* Assign Column */}
                    {showColumns.assign && (
                      <td className="py-4 px-2 text-center">
                        <div className="flex justify-center">
                          {getEmployeeBadge(row.idKaryawan)}
                        </div>
                      </td>
                    )}

                    {/* Action Column */}
                    <td className="py-4 px-2 text-center relative action-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionMenuId(
                            activeActionMenuId === row.rowId ? null : row.rowId
                          );
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeActionMenuId === row.rowId && (
                        <div className="absolute right-2 top-full mt-1 w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-1.5 z-40 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              onToggleComplete(row.projectId, row.taskId, row.subTaskId);
                              setActiveActionMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>
                              {isChecked ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                            </span>
                          </button>

                          {projectObj && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenFormTodoList(projectObj);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                              <span>Buka Form To-Do List</span>
                            </button>
                          )}

                          {onDeleteTodoItem && (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteTodoItem(row.projectId, row.taskId, row.subTaskId);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
