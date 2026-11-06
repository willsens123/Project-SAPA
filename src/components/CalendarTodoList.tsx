import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Search,
  Plus,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  X,
  Trash2,
  ArrowRight,
  RotateCcw,
  Calendar,
  Sparkles,
  GripVertical,
  Clock,
  User,
  ChevronDown,
  CalendarCheck,
  Home,
  FileEdit,
  AlertTriangle,
  AlertCircle,
  UserPlus,
  Flag,
  GitFork,
  PauseCircle,
  PlayCircle,
  History,
  CalendarRange,
  Copy,
  Tag,
  Share2,
  GraduationCap,
  Instagram,
  Video,
  Globe,
  Send,
  FolderKanban,
  MapPin,
} from 'lucide-react';
import { ProjectItem, TodoTaskItem, TodoSubTaskItem, KaryawanItem, PrerequisiteSubTaskCondition } from '../types';
import { SapaTimelineTask, loadTimelineTasks, saveTimelineTasks } from '../timelineProyekSapaData';
import { TimelineYangSudahDisetSection } from './TimelineYangSudahDisetSection';
import { KegiatanVsTimelineView } from './KegiatanVsTimelineView';
import { OngoingCreateItemSalurView } from './OngoingCreateItemSalurView';
import { PapanTrelloView } from './PapanTrelloView';
import { getOngoingItemSalurFromStorage, OngoingItemSalurCard } from '../ongoingItemSalurData';
import {
  HariKhususItem,
  loadHariKhususList,
  saveHariKhususList,
  isHariBesarNasional,
  KATEGORI_HARI_KHUSUS_OPTIONS,
} from '../hariKhususData';

interface CalendarTodoListProps {
  projects: ProjectItem[];
  projectTodos: Record<string, TodoTaskItem[]>;
  karyawanList: KaryawanItem[];
  onOpenFormTodoList?: (project?: ProjectItem) => void;
  onUpdateTasks?: (projectId: string, tasks: TodoTaskItem[]) => void;
  onShowToast?: (msg: string) => void;
  divisiOptions?: string[];
  hariKhususList?: HariKhususItem[];
  onUpdateHariKhususList?: (items: HariKhususItem[]) => void;
  onNavigateToHariKhusus?: () => void;
  onNavigateToJenisNonProyek?: () => void;
  onNavigateToHome?: () => void;
  initialDate?: string | null;
}

const HARI_KHUSUS_STORAGE_KEY = 'sapa_calendar_hari_khusus_v1';
const POST_ASSIGNMENTS_STORAGE_KEY = 'sapa_calendar_post_assignments_v1';

// Initial Hari Khusus for November 2021
const INITIAL_HARI_KHUSUS: Record<string, string> = {
  '2021-11-10': 'Hari Pahlawan',
  '2021-11-12': 'Hari Ayah Nasional',
  '2021-11-25': 'Hari Guru Nasional',
  '2021-11-28': 'Hari Menanam Pohon',
};

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

// Months shown in the carousel selector exactly as in the reference image
const VISIBLE_MONTHS = [
  { label: 'Jun', monthIdx: 5 },
  { label: 'Jul', monthIdx: 6 },
  { label: 'Agu', monthIdx: 7 },
  { label: 'Sep', monthIdx: 8 },
  { label: 'Okt', monthIdx: 9 },
  { label: 'Nov', monthIdx: 10 },
  { label: 'Des', monthIdx: 11 },
  { label: 'Jan', monthIdx: 0 },
  { label: 'Feb', monthIdx: 1 },
];

const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// Channels for Post tab exactly matching the reference image layout
export const POST_CHANNELS = [
  { id: 'lam', label: 'LAM' },
  { id: 'lms', label: 'LMS' },
  { id: 'instagram_story', label: 'Instagram Story' },
  { id: 'tiktok', label: 'Tiktok' },
  { id: 'jarkom', label: 'Jarkom' },
  { id: 'website', label: 'Website' },
];

export const CALENDAR_DIVISI_OPTIONS = [
  'ALL',
  'PNB',
  'MAD',
  'EVE',
  'FUN',
  'IT',
  'OPERASIONAL',
  'UMM',
  'PRO',
  'MED',
  'OPS',
];

// Default Featured Employees fallback
const DEFAULT_FEATURED_EMPLOYEES = [
  {
    id: 'karyawan-1',
    kodeKaryawan: '00031',
    namaLengkap: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    avatarInitial: 'A',
    avatarBgColor: '#009688', // Teal
    divisi: 'PNB',
  },
  {
    id: 'karyawan-2',
    kodeKaryawan: '00019',
    namaLengkap: 'Cindy Budiman',
    namaPanggilan: 'Ci Pao',
    avatarInitial: 'C',
    avatarBgColor: '#fbc02d', // Yellow / Amber
    divisi: 'PNB',
  },
  {
    id: 'karyawan-3',
    kodeKaryawan: '00018',
    namaLengkap: 'Silvia Fukada',
    namaPanggilan: 'Ci Silvia',
    avatarInitial: 'S',
    avatarBgColor: '#78909c', // Slate
    divisi: 'PNB',
  },
];

// Duration session record for permanent history logging ("Semua durasi dicatat")
export interface DurationSessionRecord {
  id: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  durationDays: number;
  status: 'active' | 'pending' | 'completed';
  catatan?: string;
  recordedAt: string;
}

// Assignment data stored for each task in calendar
export interface TaskAssignmentEntry {
  date: string; // Primary date or start date
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  channelId?: string;
  status?: 'active' | 'pending' | 'completed';
  isPending?: boolean;
  autoExtendIfOverdue?: boolean;
  durationSessions?: DurationSessionRecord[];
}

// Unified Calendar Item structure for both Sub-Tasks and standalone Tasks
export interface CalendarItemEntry {
  id: string; // sub-task id or task id
  title: string; // sub-task title or task name
  isSubTask: boolean;
  parentTaskId?: string;
  parentTaskTitle?: string;
  projectId: string;
  projectName?: string;
  project?: ProjectItem | null;
  deadline?: string;
  deskripsi?: string;
  idKaryawanAssignJob?: string;
  completed?: boolean;
  isPost?: boolean;
  rawTask: TodoTaskItem;
  rawSubTask?: TodoSubTaskItem;
  // Multi-day duration & status properties
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  status?: 'active' | 'pending' | 'completed';
  isPending?: boolean;
  durationSessions?: DurationSessionRecord[];
  prerequisiteFulfilled?: boolean;
  prerequisiteFulfilledText?: string;
}

export interface WaitingPrerequisiteItem {
  id: string;
  title: string;
  isSubTask: boolean;
  parentTaskTitle?: string;
  projectName?: string;
  requiredSubTaskTitle: string;
  requiredStatus: 'Sedang Dikerjakan' | 'Selesai';
  currentStatusOnTrello?: string;
  reason: string;
}

export const CalendarTodoList: React.FC<CalendarTodoListProps> = ({
  projects,
  projectTodos,
  karyawanList,
  onOpenFormTodoList,
  onUpdateTasks,
  onShowToast,
  divisiOptions,
  hariKhususList: propHariKhususList,
  onUpdateHariKhususList,
  onNavigateToHariKhusus,
  onNavigateToJenisNonProyek,
  onNavigateToHome,
  initialDate,
}) => {
  const availableCalendarDivisi =
    divisiOptions && divisiOptions.length > 0
      ? ['ALL', ...divisiOptions]
      : CALENDAR_DIVISI_OPTIONS;

  // Sync initialDate when navigating from Home Calendar
  useEffect(() => {
    if (initialDate && initialDate.includes('-')) {
      const parts = initialDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setCurrentYear(parts[0]);
        setCurrentMonth(parts[1] - 1);
      }
    }
  }, [initialDate]);

  // Load personal rapat & reminders from Home Calendar for cross-calendar link
  const [homeCalEvents, setHomeCalEvents] = useState<any[]>(() => {
    try {
      const all: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sapa_home_cal_events_')) {
          const v = localStorage.getItem(k);
          if (v) {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) all.push(...parsed);
          }
        }
      }
      return all;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const all: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sapa_home_cal_events_')) {
            const v = localStorage.getItem(k);
            if (v) {
              const parsed = JSON.parse(v);
              if (Array.isArray(parsed)) all.push(...parsed);
            }
          }
        }
        setHomeCalEvents(all);
      } catch {}
    };
    window.addEventListener('home_cal_events_updated', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('home_cal_events_updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Tab state: 'kegiatan' | 'post' | 'kegiatanVsTimeline' | 'papanTrello' | 'trackerProyekSapa' (default 'kegiatan')
  const [activeTab, setActiveTab] = useState<
    'kegiatan' | 'post' | 'kegiatanVsTimeline' | 'papanTrello' | 'trackerProyekSapa'
  >('kegiatan');

  // Divisi Filter state (default 'PNB' as shown in the screenshot)
  const [selectedDivisi, setSelectedDivisi] = useState<string>('PNB');
  const [showDivisiDropdown, setShowDivisiDropdown] = useState<boolean>(false);
  const divisiDropdownRef = useRef<HTMLDivElement>(null);

  // Year Selector state
  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        divisiDropdownRef.current &&
        !divisiDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDivisiDropdown(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setShowYearDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Timeline tasks for "Kegiatan vs Timeline"
  const [timelineTasks, setTimelineTasks] = useState<SapaTimelineTask[]>(() => loadTimelineTasks());

  useEffect(() => {
    if (activeTab === 'kegiatanVsTimeline') {
      setTimelineTasks(loadTimelineTasks());
    }
  }, [activeTab]);

  // Cards on tab "Papan Trello" for prerequisite checks
  const [trelloCards, setTrelloCards] = useState<OngoingItemSalurCard[]>(() => {
    try {
      return getOngoingItemSalurFromStorage();
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const syncTrello = () => {
      try {
        setTrelloCards(getOngoingItemSalurFromStorage());
      } catch (e) {
        console.error(e);
      }
    };
    syncTrello();
    window.addEventListener('storage', syncTrello);
    return () => window.removeEventListener('storage', syncTrello);
  }, [activeTab]);

  // Helper to evaluate prerequisite status on tab "Papan Trello"
  // "Fungsinya adalah jika sub-task yang dimaksud ada sedang dikerjakan atau selesai pada tab 'Papan Trello' di 'Calendar To-Do List' baru sub-task atau task itu dimunculkan."
  const checkPrerequisiteOnPapanTrello = (
    prereqItem?: {
      dependsOnSubTask?: boolean;
      prerequisites?: PrerequisiteSubTaskCondition[];
      prerequisiteSubTaskId?: string;
      prerequisiteSubTaskTitle?: string;
      prerequisiteStatus?: 'Sedang Dikerjakan' | 'Selesai';
    } | null
  ): {
    isSatisfied: boolean;
    fulfilledText?: string;
    unmetReason?: string;
    requiredSubTaskTitle?: string;
    requiredStatus?: 'Sedang Dikerjakan' | 'Selesai';
    currentPapanStatus?: string;
  } => {
    if (!prereqItem || !prereqItem.dependsOnSubTask) {
      return { isSatisfied: true };
    }

    const rules: PrerequisiteSubTaskCondition[] = [];
    if (prereqItem.prerequisites && prereqItem.prerequisites.length > 0) {
      prereqItem.prerequisites.forEach((r) => {
        if (r.subTaskTitle || r.subTaskId) rules.push(r);
      });
    } else if (prereqItem.prerequisiteSubTaskId || prereqItem.prerequisiteSubTaskTitle) {
      rules.push({
        subTaskId: prereqItem.prerequisiteSubTaskId || '',
        subTaskTitle: prereqItem.prerequisiteSubTaskTitle || '',
        requiredStatus: prereqItem.prerequisiteStatus || 'Sedang Dikerjakan',
      });
    }

    // If no specific sub-task was configured, do not block
    if (rules.length === 0) {
      return { isSatisfied: true };
    }

    // Check each rule against trelloCards
    for (const rule of rules) {
      const targetTitle = (rule.subTaskTitle || '').trim().toLowerCase();
      const targetId = (rule.subTaskId || '').trim();
      const reqStatus = rule.requiredStatus || 'Sedang Dikerjakan';

      if (!targetTitle && !targetId) continue;

      let foundStatus: 'Belum Mulai' | 'Sedang Dikerjakan' | 'Selesai' | null = null;
      let matchedLocation = '';

      // 1. Check in trelloCards
      for (const card of trelloCards) {
        const cardTitle = (card.namaItem || '').trim().toLowerCase();
        const cardSub = (card.subNamaItem || '').trim().toLowerCase();

        if (
          (targetId && card.id === targetId) ||
          (targetTitle && (cardTitle === targetTitle || cardTitle.includes(targetTitle) || targetTitle.includes(cardTitle))) ||
          (targetTitle && cardSub && (cardSub === targetTitle || cardSub.includes(targetTitle)))
        ) {
          if (card.stage === 'done') foundStatus = 'Selesai';
          else if (card.stage === 'in_progress') foundStatus = 'Sedang Dikerjakan';
          else foundStatus = 'Belum Mulai';
          matchedLocation = `Kartu "${card.namaItem}"`;
          break;
        }

        // Check pekerjaanAjak inside card
        for (const ajak of card.pekerjaanAjak || []) {
          const ajakName = (ajak.namaPekerjaan || '').trim().toLowerCase();
          if (
            (targetId && ajak.id === targetId) ||
            (targetTitle && (ajakName === targetTitle || ajakName.includes(targetTitle) || targetTitle.includes(ajakName)))
          ) {
            if (ajak.status === 'Selesai') {
              foundStatus = 'Selesai';
            } else if (ajak.status === 'Sedang Berjalan' || ajak.status === 'Menunggu Review') {
              foundStatus = 'Sedang Dikerjakan';
            } else {
              foundStatus = 'Belum Mulai';
            }
            matchedLocation = `Pekerjaan "${ajak.namaPekerjaan}"`;
            break;
          }
        }
        if (foundStatus) break;

        // Check checklists inside card
        for (const chk of card.checklists || []) {
          const chkTitle = (chk.title || '').trim().toLowerCase();
          if (
            (targetId && chk.id === targetId) ||
            (targetTitle && (chkTitle === targetTitle || chkTitle.includes(targetTitle) || targetTitle.includes(chkTitle)))
          ) {
            foundStatus = chk.completed ? 'Selesai' : card.stage === 'in_progress' ? 'Sedang Dikerjakan' : 'Belum Mulai';
            matchedLocation = `Checklist "${chk.title}"`;
            break;
          }
        }
        if (foundStatus) break;
      }

      // 2. Check in projectTodos
      if (!foundStatus) {
        for (const [projId, rawPTasks] of Object.entries(projectTodos)) {
          const pTasks = (rawPTasks as TodoTaskItem[]) || [];
          for (const pt of pTasks) {
            for (const pst of pt.subTasks || []) {
              const pstTitle = (pst.title || '').trim().toLowerCase();
              if (
                (targetId && pst.id === targetId) ||
                (targetTitle && (pstTitle === targetTitle || pstTitle.includes(targetTitle) || targetTitle.includes(pstTitle)))
              ) {
                const assigned = postAssignments[pst.id];
                const isAssignedActive = assigned && Boolean(assigned.date || assigned.startDate);
                if (pst.completed) {
                  foundStatus = 'Selesai';
                } else {
                  const projCard = trelloCards.find((c) => c.proyekSapaId === projId);
                  if (projCard && projCard.stage === 'done') foundStatus = 'Selesai';
                  else if (projCard && projCard.stage === 'in_progress') foundStatus = 'Sedang Dikerjakan';
                  else if (isAssignedActive) foundStatus = 'Sedang Dikerjakan';
                  else foundStatus = 'Belum Mulai';
                }
                matchedLocation = `Sub-Task "${pst.title}"`;
                break;
              }
            }
            if (foundStatus) break;
          }
          if (foundStatus) break;
        }
      }

      // Check condition
      let ruleMet = false;
      if (reqStatus === 'Sedang Dikerjakan') {
        ruleMet = foundStatus === 'Sedang Dikerjakan' || foundStatus === 'Selesai';
      } else if (reqStatus === 'Selesai') {
        ruleMet = foundStatus === 'Selesai';
      }

      if (!ruleMet) {
        return {
          isSatisfied: false,
          unmetReason: `Menunggu sub-task "${rule.subTaskTitle}" berstatus "${reqStatus}" di Papan Trello (saat ini: ${foundStatus || 'Belum Mulai'})`,
          requiredSubTaskTitle: rule.subTaskTitle,
          requiredStatus: reqStatus,
          currentPapanStatus: foundStatus || 'Belum Mulai',
        };
      }
    }

    const firstRule = rules[0];
    return {
      isSatisfied: true,
      fulfilledText: firstRule ? `Prasyarat Papan Trello Terpenuhi: "${firstRule.subTaskTitle}" (${firstRule.requiredStatus})` : undefined,
    };
  };

  // Duplicated items in Not Started (created when a card is marked Pending: original stays on calendar, copy goes to Not Started)
  const [extraDuplicatedItems, setExtraDuplicatedItems] = useState<CalendarItemEntry[]>(() => {
    try {
      const saved = localStorage.getItem('calendar_extra_duplicated_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'task-5-3-dup-init',
        title: 'Promosi A',
        isSubTask: false,
        parentTaskId: 'task-5-3',
        parentTaskTitle: 'Promosi A',
        projectId: 'proj-5',
        projectName: 'Promosi Buku Dharma',
        project: null,
        deadline: '',
        deskripsi: 'Materi promosi paket A (Duplikasi lanjutan dari pending).',
        completed: false,
        idKaryawanAssignJob: '00019',
        isPost: false,
        rawTask: {
          id: 'task-5-3-dup-init',
          task: 'Promosi A',
          isPost: false,
          deadline: '',
          deskripsi: 'Materi promosi paket A (Duplikasi lanjutan dari pending).',
          completed: false,
          subTasks: [],
          idKaryawanAssignJob: '00019',
          catatan: 'Duplikasi lanjutan dari status Pending (10 Nov s/d 13 Nov: 4 Hari)',
        },
      },
    ];
  });



  // Kendala State for Calendar Item Cards (matching Ongoing Create Item S-SALUR)
  interface CalendarItemKendala {
    id: string;
    judul: string;
    kategori?: string;
    status: 'Open' | 'Sedang Ditangani' | 'Selesai';
    pelapor?: string;
    deskripsi: string;
    solusi?: string;
    createdAt: string;
  }

  const [itemKendalaMap, setItemKendalaMap] = useState<Record<string, CalendarItemKendala[]>>(() => {
    try {
      const saved = localStorage.getItem('sapa_calendar_item_kendala_map_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveKendalaMap = (nextMap: Record<string, CalendarItemKendala[]>) => {
    setItemKendalaMap(nextMap);
    try {
      localStorage.setItem('sapa_calendar_item_kendala_map_v1', JSON.stringify(nextMap));
    } catch (err) {
      console.error('Failed to save kendala map', err);
    }
  };

  const [kendalaItem, setKendalaItem] = useState<CalendarItemEntry | null>(null);
  const [isKendalaModalOpen, setIsKendalaModalOpen] = useState(false);
  const [kendalaJudul, setKendalaJudul] = useState('');
  const [kendalaKategori, setKendalaKategori] = useState('Naskah');
  const [kendalaStatus, setKendalaStatus] = useState<'Open' | 'Sedang Ditangani' | 'Selesai'>('Open');
  const [kendalaPelapor, setKendalaPelapor] = useState('Silvia Fukada');
  const [kendalaDeskripsi, setKendalaDeskripsi] = useState('');
  const [kendalaSolusi, setKendalaSolusi] = useState('');

  const handleOpenKendalaModal = (item: CalendarItemEntry) => {
    setKendalaItem(item);
    setIsKendalaModalOpen(true);
    setKendalaJudul('');
    setKendalaDeskripsi('');
    setKendalaSolusi('');
    const assigned = karyawanList.find((e) => e.kodeKaryawan === item.idKaryawanAssignJob);
    setKendalaPelapor(assigned?.namaLengkap || 'Silvia Fukada');
  };

  const handleAddKendala = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kendalaItem || !kendalaJudul.trim() || !kendalaDeskripsi.trim()) return;

    const newKendala: CalendarItemKendala = {
      id: `kendala-${Date.now()}`,
      judul: kendalaJudul.trim(),
      kategori: kendalaKategori,
      status: kendalaStatus,
      pelapor: kendalaPelapor.trim(),
      deskripsi: kendalaDeskripsi.trim(),
      solusi: kendalaSolusi.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const currentList = itemKendalaMap[kendalaItem.id] || [];
    const nextMap = {
      ...itemKendalaMap,
      [kendalaItem.id]: [newKendala, ...currentList],
    };
    saveKendalaMap(nextMap);
    setKendalaJudul('');
    setKendalaDeskripsi('');
    setKendalaSolusi('');
    if (onShowToast) onShowToast('Kendala berhasil dicatat');
  };

  const handleToggleKendalaStatus = (
    kendalaId: string,
    nextStatus: 'Open' | 'Sedang Ditangani' | 'Selesai'
  ) => {
    if (!kendalaItem) return;
    const currentList = itemKendalaMap[kendalaItem.id] || [];
    const updatedList = currentList.map((k) =>
      k.id === kendalaId ? { ...k, status: nextStatus } : k
    );
    const nextMap = {
      ...itemKendalaMap,
      [kendalaItem.id]: updatedList,
    };
    saveKendalaMap(nextMap);
    if (onShowToast) onShowToast(`Status kendala diubah: ${nextStatus}`);
  };

  const handleDeleteKendala = (kendalaId: string) => {
    if (!kendalaItem) return;
    const currentList = itemKendalaMap[kendalaItem.id] || [];
    const updatedList = currentList.filter((k) => k.id !== kendalaId);
    const nextMap = {
      ...itemKendalaMap,
      [kendalaItem.id]: updatedList,
    };
    saveKendalaMap(nextMap);
    if (onShowToast) onShowToast('Kendala berhasil dihapus');
  };

  // Month & Year state (default to November 2021 matching canonical app date context)
  const [currentYear, setCurrentYear] = useState<number>(2021);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 = November (0-indexed)

  // Toggle for showing/hiding unassigned tasks panel
  const [showUnassignedPanel, setShowUnassignedPanel] = useState<boolean>(true);

  // Search query & filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedFilterAssignee, setSelectedFilterAssignee] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [openMenuCardId, setOpenMenuCardId] = useState<string | null>(null);

  // Hari Khusus master list state (terkoneksi dengan menu Hari Khusus Calendar To-Do List)
  const [internalHariKhususList, setInternalHariKhususList] = useState<HariKhususItem[]>(() => {
    return propHariKhususList && propHariKhususList.length > 0
      ? propHariKhususList
      : loadHariKhususList();
  });

  // Sync when prop changes
  useEffect(() => {
    if (propHariKhususList && propHariKhususList.length > 0) {
      setInternalHariKhususList(propHariKhususList);
    }
  }, [propHariKhususList]);

  // Listen to custom window event 'hari_khusus_updated'
  useEffect(() => {
    const handleUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<HariKhususItem[]>;
      if (customEvt.detail && Array.isArray(customEvt.detail)) {
        setInternalHariKhususList(customEvt.detail);
      }
    };
    window.addEventListener('hari_khusus_updated', handleUpdated);
    return () => window.removeEventListener('hari_khusus_updated', handleUpdated);
  }, []);

  // Compute hariKhususMap from internalHariKhususList
  const hariKhususMap = useMemo(() => {
    const map: Record<string, string> = {};
    internalHariKhususList.forEach((it) => {
      map[it.tanggal] = it.nama;
    });
    return map;
  }, [internalHariKhususList]);

  // Helper to check if a date is Hari Besar Nasional / Libur
  const checkHariKhususStatus = (dateStr: string) => {
    return isHariBesarNasional(dateStr, internalHariKhususList);
  };

  // Reference date for "Hari Ini" calculation (defaults to '2021-11-10' for November 2021 demo, or real today)
  const [referenceTodayDate, setReferenceTodayDate] = useState<string>('2021-11-10');

  // Helper to format today's real date 'YYYY-MM-DD'
  const getTodayDateStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const calculateInclusiveDays = (startStr?: string, endStr?: string): number => {
    if (!startStr) return 1;
    const effectiveEnd = endStr || startStr;
    try {
      const s = new Date(startStr + 'T00:00:00');
      const e = new Date(effectiveEnd + 'T00:00:00');
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
      const diffMs = e.getTime() - s.getTime();
      if (diffMs < 0) return 1;
      return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 1;
    }
  };

  const getDatesInRange = (startStr?: string, endStr?: string): string[] => {
    if (!startStr) return [];
    const effectiveEnd = endStr || startStr;
    try {
      const dates: string[] = [];
      const current = new Date(startStr + 'T00:00:00');
      const end = new Date(effectiveEnd + 'T00:00:00');
      if (isNaN(current.getTime()) || isNaN(end.getTime())) return [startStr];
      let count = 0;
      while (current <= end && count < 90) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        current.setDate(current.getDate() + 1);
        count++;
      }
      return dates.length > 0 ? dates : [startStr];
    } catch {
      return [startStr];
    }
  };

  const addDaysToDateStr = (dateStr: string, daysToAdd: number): string => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      d.setDate(d.getDate() + daysToAdd);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return dateStr;
    }
  };

  const effectiveTodayDateStr = useMemo(() => {
    if (currentYear === 2026) return getTodayDateStr();
    return referenceTodayDate;
  }, [currentYear, referenceTodayDate]);

  // Resolves effective task schedule, automatically expanding duration to today if not completed or pending:
  // "Jika kartu tidak di selesaikan atau di pending, maka durasi akan bertambah hingga sampai tanggal hari ini."
  const resolveEffectiveTaskSchedule = (
    assignment?: TaskAssignmentEntry,
    itemDeadline?: string,
    itemCompleted?: boolean,
    refDateStr: string = effectiveTodayDateStr
  ) => {
    const rawStart = assignment?.startDate || assignment?.date || itemDeadline || '';
    const rawEnd = assignment?.endDate || assignment?.date || rawStart;
    const isPending = assignment?.status === 'pending' || !!assignment?.isPending;
    const isCompleted = itemCompleted || assignment?.status === 'completed';

    if (!rawStart) {
      return {
        startDate: '',
        endDate: '',
        durationDays: 0,
        isPending,
        isCompleted,
        isAutoExtended: false,
      };
    }

    let finalStart = rawStart;
    let finalEnd = rawEnd;
    let isAutoExtended = false;

    if (isPending) {
      finalEnd = rawEnd;
    } else if (isCompleted) {
      finalEnd = rawEnd;
    } else {
      // Active item: duration increases until today if not completed or pending
      if (finalStart <= refDateStr) {
        if (refDateStr > finalEnd) {
          finalEnd = refDateStr;
          isAutoExtended = true;
        }
      }
    }

    const durationDays = calculateInclusiveDays(finalStart, finalEnd);

    return {
      startDate: finalStart,
      endDate: finalEnd,
      durationDays,
      isPending,
      isCompleted,
      isAutoExtended,
    };
  };

  // Initial demo assignments showcasing user's exact requirements:
  // 1) 3-7 multi-day spanning card
  // 2) Pending card in unassigned list with duration record
  const initialPostAssignments: Record<string, TaskAssignmentEntry> = {
    'task-5-1': {
      date: '2021-11-03',
      startDate: '2021-11-03',
      endDate: '2021-11-07',
      employeeId: '00019', // Cindy Budiman
      status: 'active',
      durationSessions: [
        {
          id: 'sess-init-1',
          startDate: '2021-11-03',
          endDate: '2021-11-07',
          durationDays: 5,
          status: 'active',
          catatan: 'Pengerjaan modul naskah materi utama (5 Hari)',
          recordedAt: '2021-11-03T08:00:00.000Z',
        },
      ],
    },
    'sub-5-1-1': {
      date: '2021-11-03',
      startDate: '2021-11-03',
      endDate: '2021-11-07',
      employeeId: '00019',
      status: 'active',
      durationSessions: [
        {
          id: 'sess-init-1b',
          startDate: '2021-11-03',
          endDate: '2021-11-07',
          durationDays: 5,
          status: 'active',
          catatan: 'Drafting materi bab 1-3 (5 Hari)',
          recordedAt: '2021-11-03T08:00:00.000Z',
        },
      ],
    },
    'task-5-3': {
      date: '2021-11-10',
      startDate: '2021-11-10',
      endDate: '2021-11-13',
      employeeId: '00019',
      status: 'pending',
      isPending: true,
      durationSessions: [
        {
          id: 'sess-pending-1',
          startDate: '2021-11-10',
          endDate: '2021-11-13',
          durationDays: 4,
          status: 'pending',
          catatan: 'Pengerjaan promosi A dipending menunggu review copywriting (4 Hari)',
          recordedAt: '2021-11-13T16:00:00.000Z',
        },
      ],
    },
    'task-5-4': {
      date: '2021-11-02',
      startDate: '2021-11-02',
      endDate: '2021-11-02',
      channelId: 'instagram_story',
      employeeId: '00017',
      status: 'completed',
    },
  };

  // Post date & assignee/channel assignments: itemId -> TaskAssignmentEntry
  const [postAssignments, setPostAssignments] = useState<
    Record<string, TaskAssignmentEntry>
  >(() => {
    try {
      const saved = localStorage.getItem(POST_ASSIGNMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated: Record<string, TaskAssignmentEntry> = {};
        Object.entries(parsed).forEach(([tid, val]) => {
          if (typeof val === 'string') {
            migrated[tid] = { date: val, startDate: val, endDate: val, status: 'active' };
          } else if (val && typeof val === 'object') {
            const v = val as any;
            migrated[tid] = {
              date: v.date || '',
              startDate: v.startDate || v.date || '',
              endDate: v.endDate || v.date || '',
              employeeId: v.employeeId,
              channelId: v.channelId,
              status: v.status || (v.completed ? 'completed' : v.isPending ? 'pending' : 'active'),
              isPending: !!v.isPending || v.status === 'pending',
              autoExtendIfOverdue: v.autoExtendIfOverdue ?? true,
              durationSessions: v.durationSessions || [],
            };
          }
        });
        if (!migrated['task-5-1'] || !migrated['task-5-1'].startDate) {
          migrated['task-5-1'] = initialPostAssignments['task-5-1'];
        }
        if (!migrated['sub-5-1-1'] || !migrated['sub-5-1-1'].startDate) {
          migrated['sub-5-1-1'] = initialPostAssignments['sub-5-1-1'];
        }
        if (!migrated['task-5-3']) {
          migrated['task-5-3'] = initialPostAssignments['task-5-3'];
        }
        if (!migrated['task-5-4']) {
          migrated['task-5-4'] = initialPostAssignments['task-5-4'];
        }
        return migrated;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPostAssignments;
  });

  // Modal for editing Hari Khusus
  const [editingDateForHariKhusus, setEditingDateForHariKhusus] = useState<string | null>(null);
  const [hariKhususInputText, setHariKhususInputText] = useState<string>('');
  const [editingKategoriForHariKhusus, setEditingKategoriForHariKhusus] = useState<string>('Hari Besar Nasional');
  const [editingIsLiburForHariKhusus, setEditingIsLiburForHariKhusus] = useState<boolean>(true);

  // Drag & drop state for items (sub-tasks or tasks)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [draggedIsSubTask, setDraggedIsSubTask] = useState<boolean>(false);
  const [draggedParentTaskId, setDraggedParentTaskId] = useState<string | null>(null);
  const [dragOverCellKey, setDragOverCellKey] = useState<string | null>(null); // "date_employeeId" or "date_channelId"
  const [isDragOverUnassignedArea, setIsDragOverUnassignedArea] = useState<boolean>(false);

  // Selected item detail modal
  const [selectedItemDetail, setSelectedItemDetail] = useState<{
    item: CalendarItemEntry;
    dateStr?: string;
  } | null>(null);

  // Quick schedule modal
  const [schedulingItem, setSchedulingItem] = useState<{
    item: CalendarItemEntry;
  } | null>(null);
  const [manualDateInput, setManualDateInput] = useState('2021-11-03');
  const [manualEndDateInput, setManualEndDateInput] = useState('2021-11-07');
  const [manualDurationDaysInput, setManualDurationDaysInput] = useState(5);
  const [manualStatusInput, setManualStatusInput] = useState<'active' | 'pending' | 'completed'>('active');
  const [manualAssigneeInput, setManualAssigneeInput] = useState('00019');
  const [manualChannelInput, setManualChannelInput] = useState('instagram_story');

  // Handler to toggle task or sub-task completed status with duration session recording
  const handleToggleItemComplete = (item: CalendarItemEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const willBeCompleted = !item.completed;
    const assignment = postAssignments[item.id];

    if (assignment) {
      const sched = resolveEffectiveTaskSchedule(
        assignment,
        item.deadline,
        item.completed,
        effectiveTodayDateStr
      );
      const start = sched.startDate || item.deadline || '2021-11-03';
      const end = sched.endDate || start;
      const durationDays = calculateInclusiveDays(start, end);

      if (willBeCompleted) {
        const newSession: DurationSessionRecord = {
          id: `sess-${Date.now()}`,
          startDate: start,
          endDate: end,
          durationDays: durationDays,
          status: 'completed',
          catatan: `Selesai dikerjakan (${durationDays} Hari)`,
          recordedAt: new Date().toISOString(),
        };
        setPostAssignments((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            status: 'completed',
            isPending: false,
            endDate: end,
            durationSessions: [...(prev[item.id]?.durationSessions || []), newSession],
          },
        }));
      } else {
        setPostAssignments((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            status: 'active',
            isPending: false,
          },
        }));
      }
    }

    if (item.projectId && onUpdateTasks && projectTodos[item.projectId]) {
      const currentTasks = projectTodos[item.projectId];
      const updatedTasks = currentTasks.map((t) => {
        if (item.isSubTask && t.subTasks) {
          const subIdx = t.subTasks.findIndex((st) => st.id === item.id);
          if (subIdx !== -1) {
            const updatedSubs = [...t.subTasks];
            updatedSubs[subIdx] = {
              ...updatedSubs[subIdx],
              completed: willBeCompleted,
            };
            return { ...t, subTasks: updatedSubs };
          }
        } else if (t.id === item.id) {
          return { ...t, completed: willBeCompleted };
        }
        return t;
      });
      onUpdateTasks(item.projectId, updatedTasks);
    }

    if (onShowToast) {
      onShowToast(
        willBeCompleted
          ? `"${item.title}" ditandai Selesai`
          : `"${item.title}" ditandai Belum Selesai (Aktif)`
      );
    }
  };

  // Handler to mark task as PENDING:
  // "kartu yang terpending tetap ada di calendar, lalu di duplikasi ke not started."
  const handleMarkItemPending = (item: CalendarItemEntry, pendingDateParam?: string) => {
    const assignment = postAssignments[item.id] || { date: '' };
    const sched = resolveEffectiveTaskSchedule(
      assignment,
      item.deadline,
      item.completed,
      effectiveTodayDateStr
    );

    const start = sched.startDate || item.deadline || '2021-11-03';
    const end = pendingDateParam || sched.endDate || start;
    const durationDays = calculateInclusiveDays(start, end);

    const newSession: DurationSessionRecord = {
      id: `sess-${Date.now()}`,
      startDate: start,
      endDate: end,
      durationDays: durationDays,
      status: 'pending',
      catatan: `Dipending pada ${formatShortDeadline(end)} (${durationDays} Hari tercatat)`,
      recordedAt: new Date().toISOString(),
    };

    // 1. KARTU YANG TERPENDING TETAP ADA DI CALENDAR
    setPostAssignments((prev) => {
      const existing = prev[item.id] || { date: '' };
      return {
        ...prev,
        [item.id]: {
          ...existing,
          date: start, // Tetap tercatat di kalender
          startDate: start,
          endDate: end,
          status: 'pending',
          isPending: true,
          durationSessions: [...(existing.durationSessions || []), newSession],
        },
      };
    });

    // 2. DI DUPLIKASI KE NOT STARTED
    const duplicateId = `${item.id}-dup-${Date.now()}`;
    const duplicateTitle = item.title;

    // Create duplicate item for Not Started
    const duplicateEntry: CalendarItemEntry = {
      ...item,
      id: duplicateId,
      title: duplicateTitle,
      deadline: '',
      completed: false,
      isPending: false,
      status: 'active',
      durationDays: undefined,
      startDate: undefined,
      endDate: undefined,
      durationSessions: [],
      rawTask: {
        ...(item.rawTask || { subTasks: [] }),
        id: duplicateId,
        task: duplicateTitle,
        deadline: '',
        scheduledDate: undefined,
        completed: false,
        subTasks: item.rawTask?.subTasks || [],
        catatan: `Duplikasi lanjutan dari status Pending (${formatShortDeadline(start)} s/d ${formatShortDeadline(end)}: ${durationDays} Hari)`,
      },
      rawSubTask: item.rawSubTask
        ? {
            ...item.rawSubTask,
            id: duplicateId,
            title: duplicateTitle,
            deadline: '',
            scheduledDate: undefined,
            completed: false,
            catatan: `Duplikasi lanjutan dari status Pending (${formatShortDeadline(start)} s/d ${formatShortDeadline(end)}: ${durationDays} Hari)`,
          }
        : undefined,
    };

    // Update projectTodos to persist duplicate task under project
    if (item.projectId && onUpdateTasks && projectTodos[item.projectId]) {
      const currentTasks = projectTodos[item.projectId];
      let updatedTasks = [...currentTasks];

      if (item.isSubTask) {
        let foundParent = false;
        updatedTasks = updatedTasks.map((t) => {
          if (t.id === item.parentTaskId && t.subTasks) {
            foundParent = true;
            const dupSub: TodoSubTaskItem = {
              ...(item.rawSubTask || {
                id: duplicateId,
                title: duplicateTitle,
                completed: false,
              }),
              id: duplicateId,
              title: duplicateTitle,
              deadline: '',
              scheduledDate: undefined,
              completed: false,
              catatan: `Duplikasi lanjutan (Pending ${formatShortDeadline(start)} s/d ${formatShortDeadline(end)})`,
            };
            return {
              ...t,
              subTasks: [...t.subTasks, dupSub],
            };
          }
          return t;
        });

        if (!foundParent) {
          const dupTask: TodoTaskItem = {
            id: duplicateId,
            task: duplicateTitle,
            deadline: '',
            scheduledDate: undefined,
            completed: false,
            isPost: item.isPost,
            idKaryawanAssignJob: item.idKaryawanAssignJob,
            subTasks: [],
            catatan: `Duplikasi lanjutan (Pending ${formatShortDeadline(start)} s/d ${formatShortDeadline(end)})`,
          };
          updatedTasks.push(dupTask);
        }
      } else {
        const dupTask: TodoTaskItem = {
          ...(item.rawTask || {
            id: duplicateId,
            task: duplicateTitle,
            deadline: '',
            completed: false,
            subTasks: [],
          }),
          id: duplicateId,
          task: duplicateTitle,
          deadline: '',
          scheduledDate: undefined,
          completed: false,
          subTasks: [],
          catatan: `Duplikasi lanjutan (Pending ${formatShortDeadline(start)} s/d ${formatShortDeadline(end)})`,
        };
        updatedTasks.push(dupTask);
      }

      onUpdateTasks(item.projectId, updatedTasks);
    }

    // Save into extraDuplicatedItems for instant display in Not Started
    setExtraDuplicatedItems((prev) => {
      const updated = [...prev.filter((x) => x.id !== duplicateId), duplicateEntry];
      try {
        localStorage.setItem('calendar_extra_duplicated_items', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Make sure duplicate starts unassigned (in Not Started)
    setPostAssignments((prev) => ({
      ...prev,
      [duplicateId]: {
        date: '',
        startDate: '',
        endDate: '',
        status: 'active',
        isPending: false,
        employeeId: item.idKaryawanAssignJob,
        channelId: item.isPost ? 'instagram_story' : undefined,
      },
    }));

    if (onShowToast) {
      onShowToast(
        `"${item.title}" ditandai PENDING (${formatShortDeadline(start)} s/d ${formatShortDeadline(end)}: ${durationDays} Hari). Kartu tetap ada di kalender & diduplikasi ke Not Started.`
      );
    }

    if (selectedItemDetail?.item.id === item.id) {
      setSelectedItemDetail(null);
    }
  };

  // Save Hari Khusus to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HARI_KHUSUS_STORAGE_KEY, JSON.stringify(hariKhususMap));
    } catch (e) {
      console.error(e);
    }
  }, [hariKhususMap]);

  // Save Post assignments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(POST_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(postAssignments));
    } catch (e) {
      console.error(e);
    }
  }, [postAssignments]);

  // Project map for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectItem>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  // Karyawan list to display: correspond to actual employees in karyawanList ("ID Karyawan sesuai Karyawan yang ada")
  const activeEmployees = useMemo(() => {
    if (karyawanList && karyawanList.length > 0) {
      return karyawanList
        .filter((k) => k.aktif !== false)
        .map((k) => {
          let bgColor = '#009688';
          if (k.avatarBg) {
            const hexMatch = k.avatarBg.match(/#([0-9a-fA-F]{6})/);
            if (hexMatch) bgColor = `#${hexMatch[1]}`;
          } else {
            const colorPalette: Record<string, string> = {
              '00031': '#009688',
              '00019': '#fbc02d',
              '00018': '#78909c',
              '00015': '#008d91',
              '00016': '#ea580c',
              '00017': '#f99500',
              '00020': '#9333ea',
            };
            if (k.kodeKaryawan && colorPalette[k.kodeKaryawan]) {
              bgColor = colorPalette[k.kodeKaryawan];
            }
          }

          return {
            id: k.id,
            kodeKaryawan: k.kodeKaryawan || '00000',
            namaLengkap: k.namaLengkap,
            namaPanggilan: k.namaPanggilan || k.namaLengkap,
            avatarInitial: k.avatarInitial || k.namaLengkap.slice(0, 1).toUpperCase(),
            avatarBgColor: bgColor,
            divisi: k.divisi || 'PNB',
          };
        });
    }
    return DEFAULT_FEATURED_EMPLOYEES;
  }, [karyawanList]);

  // Karyawan map for quick lookup
  const karyawanMap = useMemo(() => {
    const map = new Map<string, KaryawanItem>();
    karyawanList.forEach((k) => {
      map.set(k.id, k);
      if (k.kodeKaryawan) map.set(k.kodeKaryawan, k);
    });
    return map;
  }, [karyawanList]);

  // Extract all calendar items:
  // - On 'kegiatan' tab: Sub-tasks from Form To-Do List (or standalone tasks without sub-tasks)
  // - On 'post' tab: "Semua Task yang memiliki checklist post pada Form To-Do List, akan muncul di post yang belum di atur"
  const allCalendarItems = useMemo(() => {
    const list: CalendarItemEntry[] = [];

    Object.entries(projectTodos).forEach(([projectId, rawTasks]) => {
      const tasks = (rawTasks as TodoTaskItem[]) || [];
      const project = projectMap.get(projectId) || null;

      tasks.forEach((task) => {
        const isPost = !!task.isPost;

        if (activeTab === 'post') {
          // Tab Post: all tasks with isPost checkbox checked
          if (isPost) {
            list.push({
              id: task.id,
              title: task.task || 'Post',
              isSubTask: false,
              parentTaskId: task.id,
              parentTaskTitle: task.task,
              projectId,
              projectName: project?.namaKegiatan || '',
              project,
              deadline: task.deadline || '',
              deskripsi: task.deskripsi || '',
              idKaryawanAssignJob: task.idKaryawanAssignJob || '00031',
              completed: !!task.completed,
              isPost: true,
              rawTask: task,
            });
          }
        } else {
          // Tab Kegiatan: only non-post items
          if (!isPost) {
            // Evaluasi prasyarat task: "Fungsinya adalah jika sub-task yang dimaksud ada sedang dikerjakan atau selesai pada tab 'Papan Trello' di 'Calendar To-Do List' baru sub-task atau task itu dimunculkan."
            const taskPrereqCheck = checkPrerequisiteOnPapanTrello(task);
            if (!taskPrereqCheck.isSatisfied) {
              return;
            }

            // "Semua Sub-Task pada Form To-Do List, akan muncul di To-do List yang belum di atur"
            if (task.subTasks && task.subTasks.length > 0) {
              task.subTasks.forEach((subTask) => {
                const subPrereqCheck = checkPrerequisiteOnPapanTrello(subTask);
                if (!subPrereqCheck.isSatisfied) {
                  return;
                }

                list.push({
                  id: subTask.id,
                  title: subTask.title || 'Sub-Task',
                  isSubTask: true,
                  parentTaskId: task.id,
                  parentTaskTitle: task.task,
                  projectId,
                  projectName: project?.namaKegiatan || '',
                  project,
                  deadline: subTask.deadline || task.deadline || '',
                  deskripsi: subTask.deskripsi || task.deskripsi || '',
                  idKaryawanAssignJob: subTask.idKaryawanAssignJob || task.idKaryawanAssignJob || '00031',
                  completed: !!subTask.completed,
                  isPost: false,
                  rawTask: task,
                  rawSubTask: subTask,
                  prerequisiteFulfilled: Boolean(subPrereqCheck.fulfilledText),
                  prerequisiteFulfilledText: subPrereqCheck.fulfilledText,
                });
              });
            } else {
              // If task doesn't have any sub-tasks, show the task itself
              list.push({
                id: task.id,
                title: task.task || 'Task',
                isSubTask: false,
                parentTaskId: task.id,
                parentTaskTitle: task.task,
                projectId,
                projectName: project?.namaKegiatan || '',
                project,
                deadline: task.deadline || '',
                deskripsi: task.deskripsi || '',
                idKaryawanAssignJob: task.idKaryawanAssignJob || '00031',
                completed: !!task.completed,
                isPost: false,
                rawTask: task,
                prerequisiteFulfilled: Boolean(taskPrereqCheck.fulfilledText),
                prerequisiteFulfilledText: taskPrereqCheck.fulfilledText,
              });
            }
          }
        }
      });
    });

    // If on 'post' tab, ensure sample items from reference image exist
    if (activeTab === 'post') {
      const hasPostPromosiIG = list.some((item) =>
        item.title.toLowerCase().includes('promosi ig')
      );
      const hasPromosiA = list.some(
        (item) => item.title.toLowerCase() === 'promosi a'
      );
      const hasPromosiB = list.some(
        (item) => item.title.toLowerCase() === 'promosi b'
      );

      if (!hasPostPromosiIG) {
        list.push({
          id: 'task-5-2',
          title: 'Post Promosi IG',
          isSubTask: false,
          projectId: 'proj-5',
          projectName: 'Promosi Buku Dharma',
          project: null,
          deadline: '2022-05-20',
          deskripsi: 'Desain materi promosi feed dan story Instagram.',
          completed: false,
          idKaryawanAssignJob: '00031',
          isPost: true,
          rawTask: {
            id: 'task-5-2',
            task: 'Post Promosi IG',
            isPost: true,
            deadline: '2022-05-20',
            deskripsi: 'Desain materi promosi feed dan story Instagram.',
            completed: false,
            subTasks: [],
            idKaryawanAssignJob: '00031',
          },
        });
      }

      if (!hasPromosiA) {
        list.push({
          id: 'task-5-3',
          title: 'Promosi A',
          isSubTask: false,
          projectId: 'proj-5',
          projectName: 'Promosi Buku Dharma',
          project: null,
          deadline: '2022-12-20',
          deskripsi: 'Materi promosi paket A.',
          completed: false,
          idKaryawanAssignJob: '00019',
          isPost: true,
          rawTask: {
            id: 'task-5-3',
            task: 'Promosi A',
            isPost: true,
            deadline: '2022-12-20',
            deskripsi: 'Materi promosi paket A.',
            completed: false,
            subTasks: [],
            idKaryawanAssignJob: '00019',
          },
        });
      }

      if (!hasPromosiB) {
        list.push({
          id: 'task-5-4',
          title: 'Promosi B',
          isSubTask: false,
          projectId: 'proj-5',
          projectName: 'Promosi Buku Dharma',
          project: null,
          deadline: '2022-12-20',
          deskripsi: 'Materi promosi paket B.',
          completed: false,
          idKaryawanAssignJob: '00017',
          isPost: true,
          rawTask: {
            id: 'task-5-4',
            task: 'Promosi B',
            isPost: true,
            deadline: '2022-12-20',
            deskripsi: 'Materi promosi paket B.',
            completed: false,
            subTasks: [],
            idKaryawanAssignJob: '00017',
          },
        });
      }
    }

    // Merge any extra duplicated items created from pending actions (deduplicated by id)
    const existingIds = new Set(list.map((it) => it.id));
    extraDuplicatedItems.forEach((dup) => {
      if (!existingIds.has(dup.id)) {
        list.push(dup);
        existingIds.add(dup.id);
      }
    });

    return list;
  }, [projectTodos, projectMap, activeTab, extraDuplicatedItems, trelloCards]);

  // Sub-tasks or Tasks that are currently waiting for prerequisite in Papan Trello
  const waitingPrerequisiteTasks = useMemo(() => {
    const waiting: WaitingPrerequisiteItem[] = [];
    if (activeTab === 'post') return waiting;

    Object.entries(projectTodos).forEach(([projectId, rawTasks]) => {
      const tasks = (rawTasks as TodoTaskItem[]) || [];
      const project = projectMap.get(projectId) || null;

      tasks.forEach((task) => {
        if (task.isPost) return;

        const taskCheck = checkPrerequisiteOnPapanTrello(task);
        if (!taskCheck.isSatisfied) {
          waiting.push({
            id: task.id,
            title: task.task || 'Task',
            isSubTask: false,
            projectName: project?.namaKegiatan || '',
            requiredSubTaskTitle: taskCheck.requiredSubTaskTitle || 'Sub-Task Sebelumnya',
            requiredStatus: taskCheck.requiredStatus || 'Sedang Dikerjakan',
            currentStatusOnTrello: taskCheck.currentPapanStatus || 'Belum Mulai',
            reason: taskCheck.unmetReason || 'Menunggu status di Papan Trello',
          });
          return;
        }

        (task.subTasks || []).forEach((subTask) => {
          const subCheck = checkPrerequisiteOnPapanTrello(subTask);
          if (!subCheck.isSatisfied) {
            waiting.push({
              id: subTask.id,
              title: subTask.title || 'Sub-Task',
              isSubTask: true,
              parentTaskTitle: task.task,
              projectName: project?.namaKegiatan || '',
              requiredSubTaskTitle: subCheck.requiredSubTaskTitle || 'Sub-Task Sebelumnya',
              requiredStatus: subCheck.requiredStatus || 'Sedang Dikerjakan',
              currentStatusOnTrello: subCheck.currentPapanStatus || 'Belum Mulai',
              reason: subCheck.unmetReason || 'Menunggu status di Papan Trello',
            });
          }
        });
      });
    });

    return waiting;
  }, [projectTodos, trelloCards, projectMap, activeTab]);

  // Unassigned tasks (Not Started): items not assigned to a calendar date
  // Pending items remain scheduled on calendar, while their duplicates are in Not Started
  const unassignedTasks = useMemo(() => {
    return allCalendarItems.filter((item) => {
      const assignment = postAssignments[item.id];
      // If item has a scheduled calendar date, it remains on the calendar (not in Not Started!)
      const hasCalendarDate = Boolean(
        (assignment?.date && assignment.date.trim().length > 0) ||
        (assignment?.startDate && assignment.startDate.trim().length > 0)
      );
      if (hasCalendarDate) return false;

      // Filter by query if search active
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchParent = item.parentTaskTitle?.toLowerCase().includes(q);
        const matchProject = item.projectName?.toLowerCase().includes(q);
        return matchTitle || matchParent || matchProject;
      }
      return true;
    });
  }, [allCalendarItems, postAssignments, searchQuery]);

  // Items grouped by Date & Employee (kegiatan) or Channel (post)
  // Pending cards remain on calendar: "kartu yang terpending tetap ada di calendar"
  // Multi-day spanning: "Misalnya pengerjaan dari tanggal 3-7, maka kartu mencangkup durasi tanggal tersebut (tidak hanya satu hari)."
  // Auto-extend to today: "Jika kartu tidak di selesaikan atau di pending, maka durasi akan bertambah hingga sampai tanggal hari ini."
  const tasksByDateAndEmployee = useMemo(() => {
    const map: Record<string, CalendarItemEntry[]> = {};

    allCalendarItems.forEach((item) => {
      const assignment = postAssignments[item.id];
      // Skip if no assignment or no date scheduled
      if (!assignment) return;
      if (!assignment.date && !assignment.startDate) return;

      const sched = resolveEffectiveTaskSchedule(
        assignment,
        item.deadline,
        item.completed,
        effectiveTodayDateStr
      );

      if (!sched.startDate) return;

      // Spanning all dates from startDate to endDate
      const dateRangeList = getDatesInRange(sched.startDate, sched.endDate);

      dateRangeList.forEach((dateStr) => {
        if (activeTab === 'post') {
          const channel = assignment.channelId || 'instagram_story';
          const keyWithChannel = `${dateStr}_${channel}`;
          if (!map[keyWithChannel]) map[keyWithChannel] = [];
          if (!map[keyWithChannel].some((it) => it.id === item.id)) {
            map[keyWithChannel].push(item);
          }
        } else {
          const emp = assignment.employeeId || item.idKaryawanAssignJob || '00019';
          const keyWithEmp = `${dateStr}_${emp}`;
          if (!map[keyWithEmp]) map[keyWithEmp] = [];
          if (!map[keyWithEmp].some((it) => it.id === item.id)) {
            map[keyWithEmp].push(item);
          }
        }

        if (!map[dateStr]) map[dateStr] = [];
        if (!map[dateStr].some((it) => it.id === item.id)) {
          map[dateStr].push(item);
        }
      });
    });

    return map;
  }, [allCalendarItems, postAssignments, activeTab, effectiveTodayDateStr]);

  // Filtered employees according to selected division and selected assignee
  const displayedEmployees = useMemo(() => {
    return activeEmployees
      .filter((emp) =>
        selectedFilterAssignee === 'all'
          ? true
          : emp.kodeKaryawan === selectedFilterAssignee
      )
      .filter((emp) => {
        if (selectedDivisi === 'ALL') return true;
        const empDiv = emp.divisi || karyawanMap.get(emp.kodeKaryawan)?.divisi || '';
        if (empDiv.toUpperCase() === selectedDivisi.toUpperCase()) return true;
        // Also check if this employee has scheduled tasks on projects belonging to selectedDivisi
        return Object.entries(tasksByDateAndEmployee).some(([key, tasks]) => {
          if (!key.endsWith(`_${emp.kodeKaryawan}`)) return false;
          const items = tasks as CalendarItemEntry[];
          return items.some((t) => {
            const proj = t.projectId ? projectMap.get(t.projectId) : null;
            const pDiv = proj?.divisi || '';
            return pDiv.toUpperCase() === selectedDivisi.toUpperCase();
          });
        });
      });
  }, [
    activeEmployees,
    selectedFilterAssignee,
    selectedDivisi,
    karyawanMap,
    tasksByDateAndEmployee,
    projectMap,
  ]);

  // Build the weeks of the current month
  const monthWeeks = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Monday (0) to Sunday (6)
    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const weeks: Array<
      Array<{
        dayNumber: number | null;
        dateString: string | null;
        isToday: boolean;
        isCurrentMonth: boolean;
      }>
    > = [];

    let currentWeek: Array<{
      dayNumber: number | null;
      dateString: string | null;
      isToday: boolean;
      isCurrentMonth: boolean;
    }> = [];

    // Padding before 1st day
    for (let i = 0; i < startDayIndex; i++) {
      currentWeek.push({
        dayNumber: null,
        dateString: null,
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateString = `${currentYear}-${mStr}-${dStr}`;
      const isToday = dateString === effectiveTodayDateStr;

      currentWeek.push({
        dayNumber: day,
        dateString,
        isToday,
        isCurrentMonth: true,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Remaining days in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          dayNumber: null,
          dateString: null,
          isToday: false,
          isCurrentMonth: false,
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentYear, currentMonth, effectiveTodayDateStr]);

  // Navigate to Prev Month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  // Navigate to Next Month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Drag handlers
  const handleDragStart = (
    e: React.DragEvent,
    projectId: string,
    itemId: string,
    isSubTask: boolean = false,
    parentTaskId?: string
  ) => {
    setDraggedItemId(itemId);
    setDraggedProjectId(projectId);
    setDraggedIsSubTask(isSubTask);
    setDraggedParentTaskId(parentTaskId || null);
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        projectId,
        itemId,
        isSubTask,
        parentTaskId: parentTaskId || null,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDraggedProjectId(null);
    setDraggedIsSubTask(false);
    setDraggedParentTaskId(null);
    setDragOverCellKey(null);
    setIsDragOverUnassignedArea(false);
  };

  const handleCellDragOver = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCellKey !== cellKey) {
      setDragOverCellKey(cellKey);
    }
  };

  const handleCellDrop = (
    e: React.DragEvent,
    targetDate: string,
    targetIdentifier?: string
  ) => {
    e.preventDefault();
    setDragOverCellKey(null);

    let itemId = draggedItemId;
    let projectId = draggedProjectId;
    let isSubTask = draggedIsSubTask;
    let parentTaskId = draggedParentTaskId;

    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.itemId) itemId = parsed.itemId;
        if (parsed.taskId && !parsed.itemId) itemId = parsed.taskId;
        if (parsed.projectId) projectId = parsed.projectId;
        if (parsed.isSubTask !== undefined) isSubTask = parsed.isSubTask;
        if (parsed.parentTaskId) parentTaskId = parsed.parentTaskId;
      }
    } catch {
      // fallback to state
    }

    if (!itemId) return;

    if (activeTab === 'post') {
      const channelId = targetIdentifier || 'instagram_story';
      // Assign post item to targetDate and channel
      setPostAssignments((prev) => ({
        ...prev,
        [itemId]: {
          date: targetDate,
          channelId,
        },
      }));
    } else {
      const empId = targetIdentifier || '00031';
      // Assign item to targetDate and employee
      setPostAssignments((prev) => ({
        ...prev,
        [itemId]: {
          date: targetDate,
          employeeId: empId,
        },
      }));
    }

    // Update scheduledDate and assignee in projectTodos if callback provided
    if (projectId && onUpdateTasks && projectTodos[projectId]) {
      const currentTasks = projectTodos[projectId];
      let hasChanges = false;
      const updatedTasks = currentTasks.map((t) => {
        if (isSubTask && t.subTasks) {
          const subIdx = t.subTasks.findIndex((st) => st.id === itemId);
          if (subIdx !== -1) {
            hasChanges = true;
            const updatedSubTasks = [...t.subTasks];
            updatedSubTasks[subIdx] = {
              ...updatedSubTasks[subIdx],
              ...(activeTab === 'kegiatan' && targetIdentifier ? { idKaryawanAssignJob: targetIdentifier } : {}),
              deadline: targetDate,
            };
            return {
              ...t,
              subTasks: updatedSubTasks,
            };
          }
        } else if (t.id === itemId) {
          hasChanges = true;
          return {
            ...t,
            scheduledDate: targetDate,
            ...(activeTab === 'kegiatan' && targetIdentifier ? { idKaryawanAssignJob: targetIdentifier } : {}),
          };
        }
        return t;
      });

      if (hasChanges) {
        onUpdateTasks(projectId, updatedTasks);
      }
    }

    const itemObj = allCalendarItems.find((item) => item.id === itemId);
    const itemTitle = itemObj?.title || (activeTab === 'post' ? 'Post' : 'Sub-Task');

    let destSuffix = '';
    if (activeTab === 'post') {
      const chObj = POST_CHANNELS.find((c) => c.id === targetIdentifier);
      destSuffix = chObj ? ` [${chObj.label}]` : '';
    } else {
      const empObj = activeEmployees.find((e) => e.kodeKaryawan === targetIdentifier);
      destSuffix = empObj ? ` (${empObj.kodeKaryawan} - ${empObj.namaPanggilan})` : '';
    }

    if (onShowToast) {
      onShowToast(
        `"${itemTitle}" berhasil dijadwalkan ke ${formatIndonesianDate(targetDate)}${destSuffix}`
      );
    }

    setDraggedItemId(null);
    setDraggedProjectId(null);
    setDraggedIsSubTask(false);
    setDraggedParentTaskId(null);
  };

  // Drop back to unassigned area
  const handleDropToUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUnassignedArea(false);

    let itemId = draggedItemId;
    let projectId = draggedProjectId;
    let isSubTask = draggedIsSubTask;

    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.itemId) itemId = parsed.itemId;
        if (parsed.taskId && !parsed.itemId) itemId = parsed.taskId;
        if (parsed.projectId) projectId = parsed.projectId;
        if (parsed.isSubTask !== undefined) isSubTask = parsed.isSubTask;
      }
    } catch {
      // fallback
    }

    if (!itemId) return;

    // Unassign item
    setPostAssignments((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });

    if (projectId && onUpdateTasks && projectTodos[projectId]) {
      const currentTasks = projectTodos[projectId];
      let hasChanges = false;
      const updatedTasks = currentTasks.map((t) => {
        if (isSubTask && t.subTasks) {
          const subIdx = t.subTasks.findIndex((st) => st.id === itemId);
          if (subIdx !== -1) {
            hasChanges = true;
            const updatedSubTasks = [...t.subTasks];
            updatedSubTasks[subIdx] = {
              ...updatedSubTasks[subIdx],
              deadline: '',
            };
            return {
              ...t,
              subTasks: updatedSubTasks,
            };
          }
        } else if (t.id === itemId) {
          hasChanges = true;
          return {
            ...t,
            scheduledDate: undefined,
          };
        }
        return t;
      });

      if (hasChanges) {
        onUpdateTasks(projectId, updatedTasks);
      }
    }

    const itemObj = allCalendarItems.find((item) => item.id === itemId);
    const itemTitle = itemObj?.title || 'Sub-Task';
    if (onShowToast) {
      onShowToast(`"${itemTitle}" dikembalikan ke ${activeTab === 'post' ? 'daftar post belum di atur' : 'Not Started'}`);
    }

    setDraggedItemId(null);
    setDraggedProjectId(null);
    setDraggedIsSubTask(false);
    setDraggedParentTaskId(null);
  };

  // Unassign specific item via button
  const handleUnassignItem = (itemId: string, projectId: string, isSubTask: boolean = false) => {
    setPostAssignments((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });

    if (projectId && onUpdateTasks && projectTodos[projectId]) {
      const currentTasks = projectTodos[projectId];
      let hasChanges = false;
      const updatedTasks = currentTasks.map((t) => {
        if (isSubTask && t.subTasks) {
          const subIdx = t.subTasks.findIndex((st) => st.id === itemId);
          if (subIdx !== -1) {
            hasChanges = true;
            const updatedSubTasks = [...t.subTasks];
            updatedSubTasks[subIdx] = {
              ...updatedSubTasks[subIdx],
              deadline: '',
            };
            return {
              ...t,
              subTasks: updatedSubTasks,
            };
          }
        } else if (t.id === itemId) {
          hasChanges = true;
          return {
            ...t,
            scheduledDate: undefined,
          };
        }
        return t;
      });

      if (hasChanges) {
        onUpdateTasks(projectId, updatedTasks);
      }
    }

    if (onShowToast) {
      onShowToast(`Item dikembalikan ke ${activeTab === 'post' ? 'post belum di atur' : 'Not Started'}`);
    }
    if (selectedItemDetail?.item.id === itemId) {
      setSelectedItemDetail(null);
    }
  };

  // Confirm manual schedule with multi-day start, end, duration and status support
  const handleConfirmManualSchedule = () => {
    if (!schedulingItem || !manualDateInput) return;
    const { item } = schedulingItem;
    const finalStartDate = manualDateInput;
    const finalEndDate = manualEndDateInput || manualDateInput;
    const finalDays = calculateInclusiveDays(finalStartDate, finalEndDate);
    const existingSessions = postAssignments[item.id]?.durationSessions || [];

    if (manualStatusInput === 'pending') {
      // Marked pending: record session, keep active calendar date, and duplicate to Not Started
      const newSession: DurationSessionRecord = {
        id: `sess-${Date.now()}`,
        startDate: finalStartDate,
        endDate: finalEndDate,
        durationDays: finalDays,
        status: 'pending',
        catatan: `Dipending (${finalDays} Hari)`,
        recordedAt: new Date().toISOString(),
      };

      setPostAssignments((prev) => ({
        ...prev,
        [item.id]: {
          ...prev[item.id],
          date: finalStartDate, // Tetap di kalender
          startDate: finalStartDate,
          endDate: finalEndDate,
          status: 'pending',
          isPending: true,
          employeeId: activeTab === 'post' ? undefined : manualAssigneeInput,
          channelId: activeTab === 'post' ? manualChannelInput : undefined,
          durationSessions: [...existingSessions, newSession],
        },
      }));

      // Duplicate to Not Started
      const duplicateId = `${item.id}-dup-${Date.now()}`;
      const duplicateEntry: CalendarItemEntry = {
        ...item,
        id: duplicateId,
        title: item.title,
        deadline: '',
        completed: false,
        isPending: false,
        status: 'active',
        durationDays: undefined,
        startDate: undefined,
        endDate: undefined,
        durationSessions: [],
        rawTask: {
          ...(item.rawTask || { subTasks: [] }),
          id: duplicateId,
          task: item.title,
          deadline: '',
          scheduledDate: undefined,
          completed: false,
          subTasks: item.rawTask?.subTasks || [],
          catatan: `Duplikasi lanjutan dari status Pending (${formatShortDeadline(finalStartDate)} s/d ${formatShortDeadline(finalEndDate)}: ${finalDays} Hari)`,
        },
      };

      setExtraDuplicatedItems((prev) => {
        const updated = [...prev.filter((x) => x.id !== duplicateId), duplicateEntry];
        try {
          localStorage.setItem('calendar_extra_duplicated_items', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });

      setPostAssignments((prev) => ({
        ...prev,
        [duplicateId]: {
          date: '',
          startDate: '',
          endDate: '',
          status: 'active',
          isPending: false,
        },
      }));

      if (onShowToast) {
        onShowToast(
          `"${item.title}" ditandai PENDING (${finalDays} Hari). Kartu tetap ada di kalender & diduplikasi ke Not Started.`
        );
      }
    } else if (manualStatusInput === 'completed') {
      // Completed: lock end date, record session
      const newSession: DurationSessionRecord = {
        id: `sess-${Date.now()}`,
        startDate: finalStartDate,
        endDate: finalEndDate,
        durationDays: finalDays,
        status: 'completed',
        catatan: `Selesai (${finalDays} Hari)`,
        recordedAt: new Date().toISOString(),
      };

      setPostAssignments((prev) => ({
        ...prev,
        [item.id]: {
          ...prev[item.id],
          date: finalStartDate,
          startDate: finalStartDate,
          endDate: finalEndDate,
          status: 'completed',
          isPending: false,
          employeeId: activeTab === 'post' ? undefined : manualAssigneeInput,
          channelId: activeTab === 'post' ? manualChannelInput : undefined,
          durationSessions: [...existingSessions, newSession],
        },
      }));

      if (onShowToast) {
        onShowToast(`"${item.title}" dijadwalkan & ditandai Selesai (${finalDays} Hari)`);
      }
    } else {
      // Active / ongoing
      setPostAssignments((prev) => ({
        ...prev,
        [item.id]: {
          ...prev[item.id],
          date: finalStartDate,
          startDate: finalStartDate,
          endDate: finalEndDate,
          status: 'active',
          isPending: false,
          employeeId: activeTab === 'post' ? undefined : manualAssigneeInput,
          channelId: activeTab === 'post' ? manualChannelInput : undefined,
        },
      }));

      if (onShowToast) {
        onShowToast(
          `"${item.title}" dijadwalkan ${finalDays} Hari (${formatShortDeadline(finalStartDate)} s/d ${formatShortDeadline(finalEndDate)})`
        );
      }
    }

    if (item.projectId && onUpdateTasks && projectTodos[item.projectId]) {
      const currentTasks = projectTodos[item.projectId];
      let hasChanges = false;
      const updatedTasks = currentTasks.map((t) => {
        if (item.isSubTask && t.subTasks) {
          const subIdx = t.subTasks.findIndex((st) => st.id === item.id);
          if (subIdx !== -1) {
            hasChanges = true;
            const updatedSubTasks = [...t.subTasks];
            updatedSubTasks[subIdx] = {
              ...updatedSubTasks[subIdx],
              ...(activeTab === 'kegiatan' ? { idKaryawanAssignJob: manualAssigneeInput } : {}),
              deadline: finalEndDate,
              completed: manualStatusInput === 'completed',
            };
            return {
              ...t,
              subTasks: updatedSubTasks,
            };
          }
        } else if (t.id === item.id) {
          hasChanges = true;
          return {
            ...t,
            scheduledDate: manualStatusInput === 'pending' ? undefined : finalStartDate,
            deadline: finalEndDate,
            completed: manualStatusInput === 'completed',
            ...(activeTab === 'kegiatan' ? { idKaryawanAssignJob: manualAssigneeInput } : {}),
          };
        }
        return t;
      });

      if (hasChanges) {
        onUpdateTasks(item.projectId, updatedTasks);
      }
    }

    setSchedulingItem(null);
  };

  // Open Hari Khusus editor
  const handleOpenHariKhusus = (dateStr: string) => {
    setEditingDateForHariKhusus(dateStr);
    const existing = internalHariKhususList.find((it) => it.tanggal === dateStr);
    if (existing) {
      setHariKhususInputText(existing.nama);
      setEditingKategoriForHariKhusus(existing.kategori || 'Hari Besar Nasional');
      setEditingIsLiburForHariKhusus(existing.isLibur ?? true);
    } else {
      setHariKhususInputText(hariKhususMap[dateStr] || '');
      setEditingKategoriForHariKhusus('Hari Besar Nasional');
      setEditingIsLiburForHariKhusus(true);
    }
  };

  // Save Hari Khusus
  const handleSaveHariKhusus = () => {
    if (!editingDateForHariKhusus) return;

    let updatedList: HariKhususItem[];
    if (hariKhususInputText.trim()) {
      const existingIdx = internalHariKhususList.findIndex(
        (it) => it.tanggal === editingDateForHariKhusus
      );
      const newItem: HariKhususItem = {
        id:
          existingIdx >= 0
            ? internalHariKhususList[existingIdx].id
            : `hk-${editingDateForHariKhusus}`,
        tanggal: editingDateForHariKhusus,
        nama: hariKhususInputText.trim(),
        kategori: editingKategoriForHariKhusus,
        isLibur: editingIsLiburForHariKhusus,
        createdAt: '15 Nov 2021',
      };

      if (existingIdx >= 0) {
        updatedList = [...internalHariKhususList];
        updatedList[existingIdx] = newItem;
      } else {
        updatedList = [...internalHariKhususList, newItem];
      }

      if (onShowToast) {
        onShowToast(
          `${editingKategoriForHariKhusus} "${hariKhususInputText.trim()}" (${
            editingIsLiburForHariKhusus ? 'Merah & Libur' : 'Hari Kerja'
          }) berhasil disimpan`
        );
      }
    } else {
      updatedList = internalHariKhususList.filter(
        (it) => it.tanggal !== editingDateForHariKhusus
      );
      if (onShowToast) {
        onShowToast(`Hari Khusus ${formatIndonesianDate(editingDateForHariKhusus)} dihapus`);
      }
    }

    setInternalHariKhususList(updatedList);
    saveHariKhususList(updatedList);
    if (onUpdateHariKhususList) {
      onUpdateHariKhususList(updatedList);
    }

    setEditingDateForHariKhusus(null);
    setHariKhususInputText('');
  };

  // Delete Hari Khusus
  const handleDeleteHariKhusus = () => {
    if (!editingDateForHariKhusus) return;
    const updatedList = internalHariKhususList.filter(
      (it) => it.tanggal !== editingDateForHariKhusus
    );
    setInternalHariKhususList(updatedList);
    saveHariKhususList(updatedList);
    if (onUpdateHariKhususList) {
      onUpdateHariKhususList(updatedList);
    }
    if (onShowToast) {
      onShowToast(`Hari Khusus ${formatIndonesianDate(editingDateForHariKhusus)} dihapus`);
    }
    setEditingDateForHariKhusus(null);
    setHariKhususInputText('');
  };

  // Format Indonesian date helper
  function formatIndonesianDate(dateStr: string): string {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  // Format deadline to nice short string (e.g. "05 Des 2021")
  function formatShortDeadline(deadlineStr?: string): string {
    if (!deadlineStr) return '05 Des 2021';
    try {
      if (deadlineStr.includes('-')) {
        const [y, m, d] = deadlineStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
      return deadlineStr;
    } catch {
      return deadlineStr;
    }
  }

  // Helper for channel visual metadata in Post tab
  const getChannelMeta = (channelId?: string) => {
    switch (channelId) {
      case 'instagram_story':
        return {
          label: 'Instagram Story',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: Instagram,
          iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
        };
      case 'tiktok':
        return {
          label: 'Tiktok',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: Video,
          iconBg: 'bg-slate-900',
        };
      case 'website':
        return {
          label: 'Website',
          badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: Globe,
          iconBg: 'bg-sky-600',
        };
      case 'jarkom':
        return {
          label: 'Jarkom',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Send,
          iconBg: 'bg-emerald-600',
        };
      case 'lam':
        return {
          label: 'LAM',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Share2,
          iconBg: 'bg-amber-500',
        };
      case 'lms':
        return {
          label: 'LMS',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: GraduationCap,
          iconBg: 'bg-indigo-600',
        };
      default:
        return {
          label: channelId || 'Post Media',
          badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: Share2,
          iconBg: 'bg-[#008d91]',
        };
    }
  };

  // Render exact card matching Ongoing Create Item S-SALUR with full duration support
  const renderExactSalurCard = (
    item: CalendarItemEntry,
    options?: {
      dateStr?: string;
      isUnassigned?: boolean;
    }
  ) => {
    const isBeingDragged = draggedItemId === item.id;
    const assignment = postAssignments[item.id];
    const sched = resolveEffectiveTaskSchedule(
      assignment,
      item.deadline,
      item.completed,
      effectiveTodayDateStr
    );

    const isPending = assignment?.status === 'pending' || !!assignment?.isPending;
    const isCompleted = item.completed || assignment?.status === 'completed';
    const isAutoExtended = sched.isAutoExtended;

    const effectiveStart = sched.startDate || item.deadline || '2021-11-03';
    const effectiveEnd = sched.endDate || effectiveStart;
    const totalDurationDays = sched.durationDays || 1;

    // Multi-day indicator in calendar cell
    const isMultiDay = effectiveStart !== effectiveEnd;
    const isStartDay = options?.dateStr === effectiveStart;
    const isEndDay = options?.dateStr === effectiveEnd;
    const currentDayNumber = options?.dateStr
      ? calculateInclusiveDays(effectiveStart, options.dateStr)
      : 1;

    // Duration sessions / history ("Semua durasi dicatat")
    const sessions = assignment?.durationSessions || item.durationSessions || [];
    const totalRecordedSessionsDays = sessions.reduce(
      (acc, s) => acc + (s.durationDays || 0),
      0
    );
    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

    const formattedCellDate = options?.dateStr ? formatIndonesianDate(options.dateStr) : '';

    const projectName = item.projectName || item.project?.namaKegiatan || 'Nama Proyek SAPA';

    // Channel metadata for Post tab
    const assignedChannelId = assignment?.channelId || (item.isPost ? 'instagram_story' : undefined);
    const channelMeta = assignedChannelId ? getChannelMeta(assignedChannelId) : null;
    const ChannelIconComponent = channelMeta?.icon || Share2;

    // PIC details
    const assignedEmp = activeEmployees.find(
      (e) => e.kodeKaryawan === (assignment?.employeeId || item.idKaryawanAssignJob)
    );
    const picInitial = assignedEmp?.namaLengkap?.trim()
      ? assignedEmp.namaLengkap.trim().charAt(0).toUpperCase()
      : assignedEmp?.avatarInitial || 'S';
    const picName = assignedEmp?.namaLengkap || 'SAPA Team';

    const itemKendalaList = itemKendalaMap[item.id] || [];
    const activeKendalaList = itemKendalaList.filter((k) => k.status !== 'Selesai');

    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) =>
          handleDragStart(
            e,
            item.projectId,
            item.id,
            item.isSubTask,
            item.parentTaskId
          )
        }
        onDragEnd={handleDragEnd}
        onClick={() =>
          setSelectedItemDetail({
            item,
            dateStr: options?.dateStr || effectiveStart,
          })
        }
        className={`bg-white rounded-2xl p-3 sm:p-3.5 border shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-2.5 min-h-[128px] ${
          isBeingDragged
            ? 'opacity-40 ring-2 ring-[#008d91]'
            : isPending
            ? 'border-amber-400 bg-amber-50/30 hover:border-amber-500 ring-1 ring-amber-300'
            : isCompleted
            ? 'border-emerald-300 bg-emerald-50/15 hover:border-emerald-400'
            : isMultiDay && !options?.isUnassigned
            ? 'border-teal-300/90 hover:border-[#008d91] ring-1 ring-teal-100 bg-gradient-to-b from-teal-50/15 to-white'
            : 'border-slate-200/90 hover:border-[#008d91]/50'
        }`}
      >
        {/* Top Text & Heading */}
        <div className="flex flex-col gap-1.5">
          {/* 1. CRYSTAL-CLEAR DATE HEADER ON CARD */}
          {options?.isUnassigned ? (
            /* Unassigned Date Tag */
            <div className="flex items-center justify-between gap-1 pb-1 border-b border-amber-200/60">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Belum Dijadwalkan ke Kalender</span>
              </span>
              {item.deadline && (
                <span className="text-[10px] text-slate-500 font-medium">
                  Target: {formatShortDeadline(item.deadline)}
                </span>
              )}
            </div>
          ) : !isMultiDay ? (
            /* Single Day Task in Calendar Cell */
            <div className="flex items-center justify-between gap-1 pb-1 border-b border-teal-100">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-teal-50 text-[#008d91] border border-teal-200/80 text-[10px] font-bold shadow-2xs">
                <Calendar className="w-3 h-3 text-[#008d91] shrink-0" />
                <span>{formattedCellDate || formatIndonesianDate(effectiveStart)}</span>
              </span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                1 Hari
              </span>
            </div>
          ) : (
            /* Multi-Day Task in Calendar Cell */
            <div className="flex flex-col gap-1 pb-1 border-b border-teal-100">
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 text-[#008d91] border border-teal-200/80 font-bold shadow-2xs">
                  <CalendarRange className="w-3 h-3 text-[#008d91] shrink-0" />
                  <span>
                    {formatShortDeadline(effectiveStart)} – {formatShortDeadline(effectiveEnd)} ({totalDurationDays} Hari)
                  </span>
                </span>
                {isAutoExtended && (
                  <span
                    className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 flex items-center gap-0.5"
                    title="Durasi bertambah otomatis ke hari ini"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                    +Hari Ini
                  </span>
                )}
              </div>

              {/* Specific Day of the Multi-Day Span */}
              <div className="flex items-center justify-between text-[10px]">
                {isStartDay ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    🟢 Hari 1/{totalDurationDays} (Mulai: {formatShortDeadline(effectiveStart)})
                  </span>
                ) : isEndDay ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold border border-indigo-300">
                    🎯 Hari {totalDurationDays}/{totalDurationDays} (Selesai: {formatShortDeadline(effectiveEnd)})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    ⏳ Hari ke-{currentDayNumber} dari {totalDurationDays} ({formatShortDeadline(options?.dateStr || effectiveStart)})
                  </span>
                )}

                {/* Multi-day progress dots */}
                <div
                  className="flex items-center gap-0.5"
                  title={`Hari ${currentDayNumber} dari ${totalDurationDays} (${formatShortDeadline(options?.dateStr || effectiveStart)})`}
                >
                  {Array.from({ length: Math.min(totalDurationDays, 7) }).map((_, dIdx) => (
                    <span
                      key={dIdx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        dIdx + 1 === currentDayNumber
                          ? 'bg-[#008d91] ring-1 ring-teal-300'
                          : dIdx + 1 < currentDayNumber
                          ? 'bg-emerald-400'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                  {totalDurationDays > 7 && <span className="text-[8px] text-slate-400 font-mono">+</span>}
                </div>
              </div>
            </div>
          )}

          {/* Pending Banner if marked pending */}
          {isPending && !options?.isUnassigned && (
            <div className="flex items-center justify-between gap-1 px-2 py-0.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-300 text-[10px] font-bold">
              <span className="flex items-center gap-1">
                <PauseCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>PENDING • {lastSession?.durationDays || totalDurationDays} Hari Tercatat</span>
              </span>
              <span className="text-[9px] font-bold text-amber-800 bg-white px-1.5 py-0.2 rounded border border-amber-200">
                Tetap di Kalender
              </span>
            </div>
          )}

          {/* 2. Context Row: Project Name (or Channel for Post) & More Menu */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-1 pt-0.5">
              {activeTab === 'post' || item.isPost ? (
                /* Channel Badge for Post Tab */
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                    channelMeta?.badgeColor || 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}
                >
                  <ChannelIconComponent className="w-3 h-3" />
                  <span>{channelMeta?.label || 'Post'}</span>
                </span>
              ) : (
                /* Project Name with Color Dot for Kalendar Tab */
                <>
                  {(item.rawTask?.warnaKartu || item.project?.warnaKartu) && (
                    <span
                      style={{ backgroundColor: item.rawTask?.warnaKartu || item.project?.warnaKartu }}
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs border border-white"
                      title={`Warna: ${item.rawTask?.jenisNonProyekNama || item.project?.namaKegiatan || 'Non Proyek'}`}
                    />
                  )}
                  <p
                    className="text-xs font-semibold text-slate-600 tracking-tight truncate min-w-0 flex-1"
                    title={projectName}
                  >
                    {projectName}
                  </p>
                  {item.rawTask?.isRutin && (
                    <span
                      className="px-1.5 py-0.2 rounded-full bg-teal-50 text-[#008d91] border border-teal-200 text-[9px] font-bold shrink-0"
                      title="To-Do List Rutin"
                    >
                      Rutin
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Titik Tiga (More Options Menu) on the right */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  setOpenMenuCardId(openMenuCardId === item.id ? null : item.id)
                }
                className="w-7 h-7 -mr-1 -mt-0.5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Opsi Menu Kartu"
                aria-label="Opsi Menu Kartu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {openMenuCardId === item.id && (
                <>
                  <div
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuCardId(null);
                    }}
                  />
                  <div
                    className="absolute right-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      {/* Opsi 1: Edit Form To-Do List */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          if (onOpenFormTodoList) {
                            onOpenFormTodoList(item.project || undefined);
                          } else {
                            setSelectedItemDetail({
                              item,
                              dateStr: options?.dateStr || effectiveStart,
                            });
                          }
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-teal-50/70 hover:text-[#008d91] transition-colors cursor-pointer group/opt"
                      >
                        <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008d91] flex items-center justify-center shrink-0 group-hover/opt:bg-[#008d91] group-hover/opt:text-white transition-colors">
                          <FileEdit className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 group-hover/opt:text-[#008d91] block">
                            Edit Form To-Do List
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            Ubah formulir & rincian item
                          </span>
                        </div>
                      </button>

                      {/* Opsi 2: Tulis Kendala */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          handleOpenKendalaModal(item);
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-amber-50/70 hover:text-amber-800 transition-colors cursor-pointer group/opt"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover/opt:bg-amber-500 group-hover/opt:text-white transition-colors">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 group-hover/opt:text-amber-800 block">
                              Tulis Kendala
                            </span>
                            {activeKendalaList.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            {itemKendalaList.length > 0
                              ? `${itemKendalaList.length} kendala dicatat`
                              : 'Catat hambatan atau blocker'}
                          </span>
                        </div>
                      </button>

                      {/* Opsi 3: Atur Durasi & Jadwal Pengerjaan (Multi-Hari) */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          setSchedulingItem({ item });
                          setManualDateInput(effectiveStart);
                          setManualEndDateInput(effectiveEnd);
                          setManualDurationDaysInput(totalDurationDays);
                          setManualStatusInput(isPending ? 'pending' : isCompleted ? 'completed' : 'active');
                          setManualAssigneeInput(assignment?.employeeId || item.idKaryawanAssignJob || '00019');
                          if (activeTab === 'post') {
                            setManualChannelInput(assignment?.channelId || 'instagram_story');
                          }
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-teal-50/70 hover:text-[#008d91] transition-colors cursor-pointer group/opt"
                      >
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover/opt:bg-[#009688] group-hover/opt:text-white transition-colors">
                          <CalendarRange className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 group-hover/opt:text-[#008d91] block">
                            Atur Durasi & Jadwal
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            Rentang multi-hari & durasi kerja
                          </span>
                        </div>
                      </button>

                      {/* Opsi 4: Tandai Pending (Catat Durasi & Masuk Belum Diatur) */}
                      {!isPending && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuCardId(null);
                            handleMarkItemPending(item, options?.dateStr);
                          }}
                          className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-amber-50/70 hover:text-amber-800 transition-colors cursor-pointer group/opt"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover/opt:bg-amber-600 group-hover/opt:text-white transition-colors">
                            <PauseCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 group-hover/opt:text-amber-800 block">
                              Tandai Pending
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal block">
                              Catat durasi & simpan ke Not Started
                            </span>
                          </div>
                        </button>
                      )}

                      {/* Opsi 5: Lanjutkan Pengerjaan (jika sedang pending) */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuCardId(null);
                            setSchedulingItem({ item });
                            setManualDateInput(effectiveStart || '2021-11-03');
                            setManualEndDateInput(effectiveEnd || '2021-11-07');
                            setManualDurationDaysInput(totalDurationDays || 5);
                            setManualStatusInput('active');
                            setManualAssigneeInput(assignment?.employeeId || item.idKaryawanAssignJob || '00019');
                          }}
                          className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-emerald-50/70 hover:text-emerald-800 transition-colors cursor-pointer group/opt"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover/opt:bg-emerald-600 group-hover/opt:text-white transition-colors">
                            <PlayCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 group-hover/opt:text-emerald-800 block">
                              Lanjutkan Pengerjaan
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal block">
                              Aktifkan kembali & jadwalkan
                            </span>
                          </div>
                        </button>
                      )}

                      {/* Opsi 6: Tandai Selesai / Belum Selesai */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          handleToggleItemComplete(item);
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-emerald-50/70 hover:text-emerald-800 transition-colors cursor-pointer group/opt"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover/opt:bg-emerald-600 group-hover/opt:text-white transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 group-hover/opt:text-emerald-800 block">
                            {item.completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            Kunci durasi & status pengerjaan
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          setSelectedItemDetail({
                            item,
                            dateStr: options?.dateStr || effectiveStart,
                          });
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lihat Detail & Riwayat Semua Durasi</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2: To-Do List Proyek SAPA / Nama Item */}
          <h3 className="mt-1 font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#008d91] transition-colors">
            {item.title || 'To-Do List Proyek SAPA'}
          </h3>

          {/* Durasi & Status Badges */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            {/* Durasi Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold border transition-colors ${
                isPending
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : isAutoExtended
                  ? 'bg-sky-50 text-sky-900 border-sky-300'
                  : 'bg-teal-50 text-teal-900 border-teal-200'
              }`}
              title={`Durasi pengerjaan: ${totalDurationDays} Hari (${formatShortDeadline(effectiveStart)} s/d ${formatShortDeadline(effectiveEnd)})`}
            >
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Durasi: {totalDurationDays} Hari</span>
              {isMultiDay && (
                <span className="font-normal opacity-75">
                  ({formatShortDeadline(effectiveStart)} - {formatShortDeadline(effectiveEnd)})
                </span>
              )}
            </span>

            {/* Auto-extended indicator */}
            {isAutoExtended && !isPending && !isCompleted && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-semibold"
                title="Belum ditandai selesai/pending, durasi bertambah otomatis hingga hari ini"
              >
                <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                Berjalan s/d Hari Ini
              </span>
            )}

            {/* Sub-Task or Context badges */}
            {item.isSubTask && item.parentTaskTitle && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                Task: {item.parentTaskTitle}
              </span>
            )}

            {/* Riwayat Sesi Terdata badge ("Semua durasi dicatat") */}
            {sessions.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium"
                title={`${sessions.length} sesi durasi tersimpan. Total akumulasi: ${totalRecordedSessionsDays} Hari`}
              >
                <History className="w-2.5 h-2.5 text-purple-600" />
                {sessions.length} Sesi ({totalRecordedSessionsDays} Hari total)
              </span>
            )}

            {activeTab === 'post' && item.isPost && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                Channel: {item.deskripsi || 'Media'}
              </span>
            )}
          </div>

          {/* Selesai / Pending Record Indicator */}
          {isCompleted && (
            <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Selesai ({totalDurationDays} Hari tercatat)</span>
            </div>
          )}

          {isPending && !options?.isUnassigned && (
            <div className="mt-2 pt-1.5 border-t border-amber-200/60 flex items-center justify-between gap-1 text-[11px] font-bold text-amber-800">
              <span className="flex items-center gap-1">
                <PauseCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Pending ({totalDurationDays} Hari tercatat)</span>
              </span>
              <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                Duplikat di Not Started
              </span>
            </div>
          )}

          {item.prerequisiteFulfilled && (
            <div className="mt-1.5 pt-1 border-t border-teal-100 flex items-center justify-between text-[10px] text-teal-800 font-medium">
              <span className="flex items-center gap-1 truncate" title={item.prerequisiteFulfilledText}>
                <Check className="w-3 h-3 text-[#008d91] shrink-0" />
                <span className="truncate">{item.prerequisiteFulfilledText || 'Prasyarat Papan Trello Terpenuhi'}</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100/70 text-[#008d91] shrink-0 ml-1">
                Papan Trello OK
              </span>
            </div>
          )}

          {isPending && options?.isUnassigned && lastSession && (
            <div className="mt-2 pt-1.5 border-t border-amber-200/60 flex items-center gap-1 text-[11px] font-bold text-amber-800">
              <PauseCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Pending: {formatShortDeadline(lastSession.startDate)} - {formatShortDeadline(lastSession.endDate)} ({lastSession.durationDays} Hari)
              </span>
            </div>
          )}
        </div>

        {/* Row 3: Circular Avatar S / Channel Badge, Kendala Badge, & Action buttons */}
        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0">
            {activeTab === 'post' || item.isPost ? (
              /* Channel Info in Footer for Post Tab */
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <div
                  className={`w-6 h-6 rounded-lg ${
                    channelMeta?.iconBg || 'bg-[#008d91]'
                  } flex items-center justify-center text-white shrink-0 shadow-2xs`}
                >
                  <ChannelIconComponent className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[85px]">
                  {channelMeta?.label || 'Post'}
                </span>
              </div>
            ) : (
              /* Employee PIC in Footer for Kalendar Tab */
              <div className="flex items-center gap-1.5 text-xs">
                <div
                  title={picName ? `PIC: ${picName}` : 'SAPA'}
                  style={{ backgroundColor: assignedEmp?.avatarBgColor || '#657677' }}
                  className="w-6 h-6 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs select-none"
                >
                  {picInitial}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[85px]">
                  {picName}
                </span>
              </div>
            )}

            {activeKendalaList.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenKendalaModal(item);
                }}
                title="Terdapat kendala aktif. Klik untuk melihat atau mencatat kendala."
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
              >
                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{activeKendalaList.length} Kendala</span>
              </button>
            )}
          </div>

          {/* Right side controls: Pending button, Complete button, & quick Atur */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Quick Atur for unassigned */}
            {options?.isUnassigned && (
              <button
                type="button"
                onClick={() => {
                  setSchedulingItem({ item });
                  setManualDateInput(effectiveStart || '2021-11-03');
                  setManualEndDateInput(effectiveEnd || '2021-11-07');
                  setManualDurationDaysInput(totalDurationDays || 5);
                  setManualStatusInput(isPending ? 'active' : 'active');
                  if (activeTab === 'post') {
                    setManualChannelInput(assignment?.channelId || 'instagram_story');
                  } else {
                    setManualAssigneeInput(assignment?.employeeId || item.idKaryawanAssignJob || '00019');
                  }
                }}
                title="Atur jadwal & durasi pengerjaan"
                className="text-[11px] font-bold text-[#008d91] hover:underline cursor-pointer px-1 py-0.5"
              >
                {isPending ? '▶ Lanjut' : 'Atur >'}
              </button>
            )}

            {/* Quick Pending button (catat durasi & pindah ke Not Started) */}
            {!options?.isUnassigned && !isPending && (
              <button
                type="button"
                title="Tandai Pending (Catat durasi & pindahkan ke Not Started)"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkItemPending(item, options?.dateStr);
                }}
                className="p-1 rounded-full text-slate-300 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
              </button>
            )}

            {/* Toggle Selesai */}
            <button
              type="button"
              title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
              onClick={(e) => handleToggleItemComplete(item, e)}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isCompleted
                  ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-50'
                  : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${isCompleted ? 'fill-emerald-100' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
      {/* 2. Main White Card Container */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col gap-5">
        {/* Top Controls: Kalendar / Post Tabs on left, Actions on right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Tabs: Kalendar, Post, Kegiatan vs Timeline, Papan Trello, Tracker Proyek SAPA */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('kegiatan')}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-150 shadow-xs cursor-pointer ${
                activeTab === 'kegiatan'
                  ? 'bg-[#008d91] text-white'
                  : 'bg-[#9ca3af] hover:bg-[#858b94] text-white'
              }`}
            >
              Kalendar
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('post')}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-150 shadow-xs cursor-pointer ${
                activeTab === 'post'
                  ? 'bg-[#008d91] text-white'
                  : 'bg-[#9ca3af] hover:bg-[#858b94] text-white'
              }`}
            >
              Post
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kegiatanVsTimeline')}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-150 shadow-xs cursor-pointer ${
                activeTab === 'kegiatanVsTimeline'
                  ? 'bg-[#008d91] text-white'
                  : 'bg-[#9ca3af] hover:bg-[#858b94] text-white'
              }`}
            >
              Kegiatan vs Timeline
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('papanTrello')}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-150 shadow-xs cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'papanTrello'
                  ? 'bg-[#008d91] text-white'
                  : 'bg-[#9ca3af] hover:bg-[#858b94] text-white'
              }`}
            >
              <span>Papan Trello</span>
              {waitingPrerequisiteTasks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow-2xs">
                  {waitingPrerequisiteTasks.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('trackerProyekSapa')}
              className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-150 shadow-xs cursor-pointer ${
                activeTab === 'trackerProyekSapa'
                  ? 'bg-[#008d91] text-white'
                  : 'bg-[#9ca3af] hover:bg-[#858b94] text-white'
              }`}
            >
              Tracker Proyek SAPA
            </button>
          </div>

          {/* Action Icons & Divisi Filter (Only when activeTab !== 'papanTrello') */}
          {activeTab !== 'papanTrello' && (
          <div className="flex flex-col items-end gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Notification pill if any items are waiting on Papan Trello */}
              {activeTab === 'kegiatan' && waitingPrerequisiteTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('papanTrello')}
                  title="Lihat sub-task di Papan Trello"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold transition-all shadow-2xs cursor-pointer animate-in fade-in"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{waitingPrerequisiteTasks.length} Menunggu di Papan Trello</span>
                </button>
              )}

              {/* Toggle Unassigned / Not Started Sidebar (Only on Kegiatan & Post) */}
              {(activeTab === 'kegiatan' || activeTab === 'post') && (
                <button
                  type="button"
                  onClick={() => setShowUnassignedPanel((prev) => !prev)}
                  title={
                    showUnassignedPanel
                      ? activeTab === 'post'
                        ? 'Sembunyikan Post Belum Diatur'
                        : 'Sembunyikan Not Started'
                      : activeTab === 'post'
                      ? 'Tampilkan Post Belum Diatur'
                      : 'Tampilkan Not Started'
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    showUnassignedPanel
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-[#009688] bg-teal-50 hover:bg-teal-100'
                  }`}
                >
                  {showUnassignedPanel ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Search Button (Only on Kegiatan & Post) */}
              {(activeTab === 'kegiatan' || activeTab === 'post') && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                    title="Cari Task"
                    className={`p-2 rounded-lg transition-colors ${
                      isSearchOpen
                        ? 'bg-slate-100 text-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {isSearchOpen && (
                    <div className="absolute right-0 top-10 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-2 w-64 animate-in fade-in zoom-in-95">
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ketik nama task..."
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-[10px] text-rose-500 hover:underline mt-1 block text-right"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Filter Assignee Button (Only on Kegiatan & Post) */}
              {(activeTab === 'kegiatan' || activeTab === 'post') && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    title="Filter Karyawan"
                    className={`p-2 rounded-lg transition-colors ${
                      selectedFilterAssignee !== 'all'
                        ? 'text-[#009688] bg-teal-50'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 top-10 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-56 flex flex-col gap-2 animate-in fade-in zoom-in-95">
                      <span className="text-xs font-bold text-slate-700">Filter Karyawan:</span>
                      <select
                        value={selectedFilterAssignee}
                        onChange={(e) => {
                          setSelectedFilterAssignee(e.target.value);
                          setIsFilterOpen(false);
                        }}
                        className="text-xs border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-[#009688]"
                      >
                        <option value="all">Semua Karyawan</option>
                        {activeEmployees.map((emp) => (
                          <option key={emp.kodeKaryawan} value={emp.kodeKaryawan}>
                            {emp.kodeKaryawan} {emp.namaLengkap}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Add Task Button */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenFormTodoList) {
                    onOpenFormTodoList();
                  } else {
                    setSchedulingItem({
                      item: {
                        id: `new-task-${Date.now()}`,
                        title: 'Task Baru',
                        deadline: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
                        isSubTask: false,
                        projectId: projects[0]?.id || '',
                        projectName: projects[0]?.namaKegiatan || '',
                        idKaryawanAssignJob: '00031',
                        completed: false,
                      },
                    });
                  }
                }}
                className="bg-[#009688] hover:bg-[#00897b] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>

              {/* Hari Khusus Button */}
              {onNavigateToHariKhusus && (
                <button
                  type="button"
                  onClick={onNavigateToHariKhusus}
                  title="Kelola Hari Khusus Calendar To-Do List (Hari Besar Nasional & Libur)"
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#008d91] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-[#008d91]" />
                  <span className="hidden sm:inline">Hari Khusus</span>
                </button>
              )}

              {/* Jenis Non-Proyek Button */}
              {onNavigateToJenisNonProyek && (
                <button
                  type="button"
                  onClick={onNavigateToJenisNonProyek}
                  title="Kelola Jenis Non-Proyek To-do List & Warna Kartu"
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#008d91] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Tag className="w-4 h-4 text-[#008d91]" />
                  <span className="hidden sm:inline">Jenis Non-Proyek</span>
                </button>
              )}

              {/* Home Dashboard Button */}
              {onNavigateToHome && (
                <button
                  type="button"
                  onClick={onNavigateToHome}
                  title="Lihat Calendar di Home Dashboard"
                  className="bg-white hover:bg-teal-50 border border-teal-200 text-[#008d91] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#008d91]" />
                  <span className="hidden sm:inline">Home Dashboard</span>
                </button>
              )}
            </div>

            {/* Divisi Filter - Directly below action buttons, always accessible across all tabs */}
            <div className="relative" ref={divisiDropdownRef}>
              <div
                id="badge-calendar-divisi"
                onClick={() => setShowDivisiDropdown((prev) => !prev)}
                className="bg-[#008d91] hover:bg-[#007b7f] text-white px-4 py-2 sm:px-5 sm:py-2 rounded-2xl shadow-sm cursor-pointer flex items-center justify-between gap-5 transition-all min-w-[200px] select-none"
                title="Filter Divisi Timeline Proyek SAPA"
              >
                <div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-white/90 leading-tight">
                    Timeline Proyek SAPA Divisi
                  </div>
                  <div className="text-sm sm:text-base font-bold tracking-wide leading-none mt-0.5">
                    {selectedDivisi === 'ALL' ? 'Semua Divisi (ALL)' : selectedDivisi}
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Divisi Dropdown */}
              {showDivisiDropdown && (
                <div
                  id="dropdown-calendar-divisi-list"
                  className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
                    Pilih Divisi
                  </div>
                  <div className="space-y-0.5 max-h-60 overflow-y-auto">
                    {availableCalendarDivisi.map((div) => (
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
          </div>
        )}
        </div>

        {/* Month & Year Selector Row (Only on Kegiatan & Post tabs) */}
        {(activeTab === 'kegiatan' || activeTab === 'post') && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-2 border-y border-slate-100/90 select-none">
            {/* Left/Center: Month Carousel */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full py-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Bulan Sebelumnya"
                className="w-7 h-7 rounded-full bg-[#009688] hover:bg-[#00897b] text-white flex items-center justify-center transition-all shadow-xs flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {VISIBLE_MONTHS.map(({ label, monthIdx }) => {
                  const isSelected = currentMonth === monthIdx;
                  const yearForMonth =
                    monthIdx < 5 && currentMonth >= 5
                      ? currentYear + 1
                      : currentMonth < 5 && monthIdx >= 5
                      ? currentYear - 1
                      : currentYear;

                  return (
                    <div key={label} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(monthIdx)}
                        className={`transition-all duration-150 ${
                          isSelected
                            ? 'bg-[#009688] text-white font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-xs'
                            : 'text-slate-600 hover:text-[#009688] font-medium px-3 py-1.5 text-xs sm:text-sm'
                        }`}
                      >
                        <span>{label}</span>
                        <span className="ml-1 text-[11px] opacity-80">{yearForMonth}</span>
                      </button>

                      {/* Teal underline indicator under selected month */}
                      {isSelected ? (
                        <div className="w-8 sm:w-10 h-0.5 bg-[#009688] rounded-full mt-1"></div>
                      ) : (
                        <div className="w-8 sm:w-10 h-0.5 bg-transparent mt-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                title="Bulan Berikutnya"
                className="w-7 h-7 rounded-full bg-[#009688] hover:bg-[#00897b] text-white flex items-center justify-center transition-all shadow-xs flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Year Badge / Selector (Matching screenshot) */}
            <div className="relative flex-shrink-0 self-end sm:self-auto" ref={yearDropdownRef}>
              <button
                type="button"
                id="btn-calendar-year"
                onClick={() => setShowYearDropdown((prev) => !prev)}
                className="bg-[#008d91] hover:bg-[#007b7f] active:scale-95 text-white font-bold text-sm sm:text-base px-8 py-2 sm:px-9 sm:py-2.5 rounded-2xl shadow-xs transition-all flex items-center justify-center select-none tracking-wide cursor-pointer min-w-[110px]"
                title={`Tahun ${currentYear} (Klik untuk pilih tahun)`}
              >
                <span>{currentYear}</span>
              </button>

              {/* Year Dropdown Menu */}
              {showYearDropdown && (
                <div className="absolute right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 min-w-[130px] animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Pilih Tahun
                  </div>
                  {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setCurrentYear(yr);
                        setShowYearDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center justify-between ${
                        currentYear === yr
                          ? 'bg-teal-50 text-[#009688] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{yr}</span>
                      {currentYear === yr && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#009688]"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CONTENT: KEGIATAN VS TIMELINE, PAPAN TRELLO, TRACKER, ATAU CALENDAR MATRIX */}
        {/* ========================================================================= */}
        {activeTab === 'kegiatanVsTimeline' ? (
          <KegiatanVsTimelineView
            currentYear={currentYear}
            selectedDivisi={selectedDivisi}
            timelineTasks={timelineTasks}
            projects={projects}
            karyawanList={karyawanList}
            projectTodos={projectTodos}
            onOpenFormTodoList={onOpenFormTodoList}
            onUpdateTasks={onUpdateTasks}
            onNavigateToPapanTrello={() => setActiveTab('papanTrello')}
            onUpdateTimelineTasks={(updated) => {
              setTimelineTasks(updated);
              saveTimelineTasks(updated);
            }}
            onShowToast={onShowToast}
          />
        ) : activeTab === 'papanTrello' ? (
          <PapanTrelloView
            projectsList={projects}
            projectTodos={projectTodos}
            selectedDivisi={selectedDivisi}
            onSelectDivisi={(div) => setSelectedDivisi(div)}
            divisiOptions={availableCalendarDivisi}
            onOpenFormTodoList={onOpenFormTodoList}
            onShowToast={onShowToast}
            onUpdateTasks={onUpdateTasks}
            karyawanList={karyawanList}
          />
        ) : activeTab === 'trackerProyekSapa' ? (
          <OngoingCreateItemSalurView
            projectsList={projects}
            projectTodos={projectTodos}
            selectedDivisi={selectedDivisi}
            onSelectDivisi={(div) => setSelectedDivisi(div)}
            divisiOptions={availableCalendarDivisi}
            onOpenFormTodoList={onOpenFormTodoList}
            onNavigateToKegiatan={() => setActiveTab('kegiatan')}
            onNavigateToTimeline={() => setActiveTab('kegiatanVsTimeline')}
            timelineTasks={timelineTasks}
            onShowToast={onShowToast}
            forcedTab="tracker"
            onTabChange={(tab) => {
              if (tab === 'kanban') setActiveTab('papanTrello');
              else if (tab === 'tracker') setActiveTab('trackerProyekSapa');
            }}
            onUpdateTasks={onUpdateTasks}
            karyawanList={karyawanList}
          />
        ) : (
          /* Calendar Matrix & Unassigned Panel Container */
          <div className="flex flex-col gap-4 w-full">
            {activeTab === 'kegiatan' && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-r from-teal-50/70 to-amber-50/70 border border-teal-200/70 rounded-2xl p-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#009688] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Durasi Multi-Hari & Pelacakan Waktu Pengerjaan
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Kartu mencangkup rentang tanggal (3-7 dsb). Jika belum selesai/pending, durasi bertambah otomatis hingga hari ini. Jika dipending, durasi dicatat & masuk to-do belum diatur.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium text-[11px]">Acuan Hari Ini:</span>
                  <span className="font-bold text-teal-800 bg-white px-2.5 py-1 rounded-xl border border-teal-200 shadow-2xs flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#009688]" />
                    {formatIndonesianDate(effectiveTodayDateStr)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
          {/* Left / Center: The Calendar Weekly Matrix Table */}
          <div className="flex-1 w-full overflow-x-auto">
            <div className="min-w-[760px] w-full">
              {/* Table Column Headers: Blank left column + 7 Days of week */}
              <div className="grid grid-cols-[210px_repeat(7,1fr)] items-center gap-1 px-1 pb-2.5 border-b border-slate-200/90 text-center select-none">
                <div className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider pl-2.5">
                  {activeTab === 'post' ? 'Channel Media' : 'Divisi & Karyawan'}
                </div>
                {DAY_NAMES.map((dayName, dIdx) => (
                  <div
                    key={dayName}
                    className={`text-sm font-bold py-1 rounded-lg ${
                      dIdx === 5 || dIdx === 6 ? 'text-rose-600 bg-rose-50/50' : 'text-slate-700'
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Weekly Blocks */}
              <div className="flex flex-col divide-y divide-slate-200/80">
                {monthWeeks.map((week, weekIndex) => {
                  return (
                    <div key={`week-${weekIndex}`} className="py-4 flex flex-col gap-2">
                      {/* Row 1: Week Header & Prominent Date Badges */}
                      <div className="grid grid-cols-[210px_repeat(7,1fr)] items-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/70 select-none">
                        <div className="flex items-center gap-2 pl-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#008d91] shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800">
                              Minggu ke-{weekIndex + 1}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {VISIBLE_MONTHS.find((m) => m.monthIdx === currentMonth)?.label} {currentYear}
                            </span>
                          </div>
                        </div>
                        {week.map((day, dIdx) => {
                          if (day.dayNumber === null) {
                            return (
                              <div
                                key={dIdx}
                                className="h-10 rounded-xl bg-slate-50/40 border border-dashed border-slate-200/40"
                              />
                            );
                          }
                          const isWeekend = dIdx === 5 || dIdx === 6;
                          const isTargetDay = initialDate && day.dateString === initialDate;
                          const specialStatus = day.dateString
                            ? checkHariKhususStatus(day.dateString)
                            : { isBesar: false };
                          const isHariBesar = specialStatus.isBesar;
                          const isHoliday = isWeekend || isHariBesar;
                          const isToday = day.isToday;

                          return (
                            <div
                              key={dIdx}
                              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                                isToday
                                  ? 'bg-[#008d91] text-white shadow-xs ring-2 ring-teal-200'
                                  : isTargetDay
                                  ? 'bg-teal-100/90 text-teal-900 border border-teal-300 ring-2 ring-teal-300'
                                  : isHoliday
                                  ? 'bg-rose-50/80 text-rose-800 border border-rose-200/70'
                                  : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs'
                              }`}
                            >
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isToday
                                    ? 'text-teal-100'
                                    : isHoliday
                                    ? 'text-rose-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {DAY_NAMES[dIdx].slice(0, 3)}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-extrabold leading-tight">
                                  {day.dayNumber}
                                </span>
                                {isToday && (
                                  <span className="text-[8px] font-bold bg-white text-[#008d91] px-1 rounded-sm shadow-2xs">
                                    Hari Ini
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 2: Hari Khusus */}
                      <div className="grid grid-cols-[210px_repeat(7,1fr)] items-center text-center">
                        <div className="text-left text-sm font-medium text-slate-700 pl-1">
                          Hari Khusus
                        </div>
                        {week.map((day, dIdx) => {
                          if (!day.dateString) {
                            return <div key={dIdx}></div>;
                          }
                          const specialStatus = checkHariKhususStatus(day.dateString);
                          const specialText = specialStatus.item?.nama || hariKhususMap[day.dateString];
                          const isHariBesar = specialStatus.isBesar;

                          return (
                            <div
                              key={dIdx}
                              className="flex items-center justify-center gap-1 min-h-[26px] px-1"
                            >
                              {specialText ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenHariKhusus(day.dateString!)}
                                  title={
                                    isHariBesar
                                      ? `${specialText} (Hari Besar Nasional - Libur)`
                                      : `${specialText} (Hari Peringatan)`
                                  }
                                  className={`group/hk flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate max-w-[85px] transition-colors cursor-pointer ${
                                    isHariBesar
                                      ? 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700'
                                      : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900'
                                  }`}
                                >
                                  {isHariBesar && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                  )}
                                  <span className="truncate">{specialText}</span>
                                  <MoreVertical
                                    className={`w-3 h-3 flex-shrink-0 ${
                                      isHariBesar ? 'text-rose-600' : 'text-amber-700'
                                    }`}
                                  />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenHariKhusus(day.dateString!)}
                                  title="Tambah Hari Khusus"
                                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 2b: Timeline yang Sudah Diset (Minggu ini) - on Kegiatan vs Timeline tab */}
                      {activeTab === 'kegiatanVsTimeline' && (
                        <div className="grid grid-cols-[210px_repeat(7,1fr)] items-center text-center bg-amber-50/70 border border-amber-200/80 rounded-lg py-1.5 px-1 my-0.5 shadow-2xs">
                          <div className="text-left text-xs font-bold text-amber-800 pl-1.5 flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                            <span className="truncate">Timeline Diset M{weekIndex + 1}</span>
                          </div>
                          {week.map((day, dIdx) => {
                            if (!day.dateString) {
                              return <div key={dIdx}></div>;
                            }
                            // Find timeline tasks overlapping this week
                            const weekNum = weekIndex + 1;
                            const weekTimelineTasks = timelineTasks.filter((t) => {
                              if (!t.isScheduled || t.year !== currentYear) return false;
                              if (
                                selectedDivisi !== 'ALL' &&
                                t.divisi &&
                                t.divisi.toUpperCase() !== selectedDivisi.toUpperCase()
                              ) {
                                return false;
                              }
                              const taskStartOverall = t.startMonth * 4 + Math.max(0, t.startWeek - 1);
                              const taskEndOverall = taskStartOverall + Math.max(1, t.durationWeeks) - 1;
                              const currentWeekOverall = currentMonth * 4 + (weekNum - 1);
                              return (
                                currentWeekOverall >= taskStartOverall &&
                                currentWeekOverall <= taskEndOverall
                              );
                            });

                            if (dIdx === 0) {
                              return (
                                <div
                                  key={dIdx}
                                  className="col-span-7 px-2 flex items-center gap-1.5 overflow-x-auto py-0.5"
                                >
                                  {weekTimelineTasks.length > 0 ? (
                                    weekTimelineTasks.map((wt) => (
                                      <span
                                        key={wt.id}
                                        className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-300 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap"
                                        title={`${wt.projectName}: ${wt.taskTitle} (${wt.durationWeeks} Minggu)`}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span>
                                        <span className="font-bold text-slate-900">{wt.projectName}:</span>
                                        <span className="text-amber-900 font-medium">{wt.taskTitle}</span>
                                        <span className="text-slate-500 font-normal">({wt.durationWeeks} Mgg)</span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">
                                      Tidak ada to-do proyek khusus dijadwalkan pada minggu ke-{weekNum}
                                    </span>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}

                      {/* Row 2c: Rapat & Reminder Pribadi (Terkoneksi dengan Home Calendar) */}
                      {week.some((d) => d.dateString && homeCalEvents.some((e: any) => e.date === d.dateString)) && (
                        <div className="grid grid-cols-[210px_repeat(7,1fr)] items-center text-center bg-purple-50/60 border border-purple-200/70 rounded-lg py-1 px-1 my-0.5 shadow-2xs">
                          <div className="text-left text-xs font-bold text-purple-800 pl-1.5 flex items-center gap-1.5 truncate">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-purple-600" />
                            <span className="truncate">Jadwal Home</span>
                          </div>
                          {week.map((day, dIdx) => {
                            if (!day.dateString) {
                              return <div key={dIdx}></div>;
                            }
                            const dayEvents = homeCalEvents.filter((e: any) => e.date === day.dateString);
                            if (dayEvents.length === 0) {
                              return <div key={dIdx} className="min-h-[22px]"></div>;
                            }
                            return (
                              <div key={dIdx} className="flex flex-col items-center justify-center gap-1 min-h-[22px] px-0.5">
                                {dayEvents.map((evt: any) => (
                                  <button
                                    key={evt.id}
                                    type="button"
                                    onClick={() => {
                                      if (onNavigateToHome) onNavigateToHome();
                                    }}
                                    title={`${evt.type === 'rapat' ? 'Rapat' : 'Reminder'}: ${evt.title}${evt.time ? ` (${evt.time} WIB)` : ''} - Klik untuk buka di Home Calendar`}
                                    className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded truncate max-w-[85px] cursor-pointer transition-all ${
                                      evt.type === 'rapat'
                                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 shadow-2xs'
                                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 shadow-2xs'
                                    }`}
                                  >
                                    <span className="truncate">
                                      {evt.type === 'rapat' ? '🟣 ' : '🔔 '}
                                      {evt.title}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Rows for Post Channels (if activeTab === 'post') OR Employees (if activeTab === 'kegiatan') */}
                      {activeTab === 'post' ? (
                        <div className="flex flex-col gap-2 mt-1">
                          {POST_CHANNELS.map((channel) => {
                            const channelMeta = getChannelMeta(channel.id);
                            const ChannelIcon = channelMeta.icon;
                            const channelWeeklyTasksCount = week.reduce((acc, d) => {
                              if (!d.dateString) return acc;
                              const k = `${d.dateString}_${channel.id}`;
                              return acc + (tasksByDateAndEmployee[k]?.length || 0);
                            }, 0);

                            return (
                              <div
                                key={channel.id}
                                className="grid grid-cols-[210px_repeat(7,1fr)] items-start min-h-[52px] gap-1"
                              >
                                {/* Left Channel Label Cell */}
                                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/90 border border-slate-200/80 select-none h-full shadow-2xs">
                                  <div
                                    className={`w-7 h-7 rounded-lg ${
                                      channelMeta.iconBg
                                    } flex items-center justify-center text-white shrink-0 shadow-2xs`}
                                  >
                                    <ChannelIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                                      {channel.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {channelWeeklyTasksCount} Post minggu ini
                                    </span>
                                  </div>
                                </div>

                                {/* 7 Day Column Slots for This Channel */}
                                {week.map((day, dIdx) => {
                                  if (!day.dateString) {
                                    return (
                                      <div
                                        key={dIdx}
                                        className="h-12 border border-dashed border-slate-200/50 rounded-xl bg-slate-50/30"
                                      ></div>
                                    );
                                  }

                                  const cellKey = `${day.dateString}_${channel.id}`;
                                  const isDragOver = dragOverCellKey === cellKey;

                                  // Tasks scheduled on this day for this channel
                                  const cellTasks = tasksByDateAndEmployee[cellKey] || [];
                                  const isWeekend = dIdx === 5 || dIdx === 6;
                                  const isHariBesar = checkHariKhususStatus(day.dateString).isBesar;
                                  const isHoliday = isWeekend || isHariBesar;
                                  const monthLabel =
                                    VISIBLE_MONTHS.find((m) => m.monthIdx === currentMonth)?.label || 'Nov';

                                  return (
                                    <div
                                      key={dIdx}
                                      onDragOver={(e) => handleCellDragOver(e, cellKey)}
                                      onDragLeave={() => {
                                        if (dragOverCellKey === cellKey) {
                                          setDragOverCellKey(null);
                                        }
                                      }}
                                      onDrop={(e) =>
                                        handleCellDrop(
                                          e,
                                          day.dateString!,
                                          channel.id
                                        )
                                      }
                                      className={`min-h-[52px] p-1.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                                        isDragOver
                                          ? 'border-dashed border-2 border-[#008d91] bg-teal-50/60 ring-2 ring-teal-200'
                                          : cellTasks.length > 0
                                          ? 'border-slate-200/90 bg-slate-50/30'
                                          : isHoliday
                                          ? 'border-rose-100 bg-rose-50/15 hover:border-rose-200 hover:bg-rose-50/30'
                                          : 'border-slate-200/60 hover:border-[#008d91]/50 hover:bg-slate-50/50'
                                      }`}
                                    >
                                      {/* Cell Date Watermark / Header */}
                                      <div
                                        className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[11px] select-none shadow-2xs mb-1 transition-colors ${
                                          day.isToday
                                            ? 'bg-teal-50/95 border-teal-300 text-[#008d91] font-bold ring-1 ring-teal-200'
                                            : isHoliday
                                            ? 'bg-rose-50/80 border-rose-200 text-rose-700 font-semibold'
                                            : 'bg-slate-100/90 border-slate-200 text-slate-700 font-semibold'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1 truncate">
                                          <Calendar
                                            className={`w-3 h-3 shrink-0 ${
                                              day.isToday ? 'text-[#008d91]' : isHoliday ? 'text-rose-500' : 'text-slate-400'
                                            }`}
                                          />
                                          <span className="truncate">
                                            {day.dayNumber} {monthLabel}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          {day.isToday && (
                                            <span className="text-[8px] font-extrabold text-white bg-[#008d91] px-1.5 py-0.2 rounded-full shadow-2xs">
                                              Hari Ini
                                            </span>
                                          )}
                                          {cellTasks.length > 0 && (
                                            <span className="text-[9px] font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded-full border border-slate-200 shadow-2xs">
                                              {cellTasks.length} Post
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Task Cards in this Cell */}
                                      {cellTasks.map((item) =>
                                        renderExactSalurCard(item, {
                                          dateStr: day.dateString!,
                                        })
                                      )}

                                      {/* Drag indicator if hover empty */}
                                      {isDragOver && cellTasks.length === 0 && (
                                        <div className="h-10 flex items-center justify-center text-[10px] text-[#008d91] font-bold">
                                          Lepas di {day.dayNumber} {monthLabel}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 mt-1">
                          {displayedEmployees.length === 0 ? (
                            <div className="py-6 px-4 text-center text-xs text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 my-1">
                              Tidak ada penugasan karyawan pada Divisi {selectedDivisi} untuk minggu ini.
                            </div>
                          ) : (
                            displayedEmployees.map((emp) => {
                              const empWeeklyTasksCount = week.reduce((acc, d) => {
                                if (!d.dateString) return acc;
                                const k = `${d.dateString}_${emp.kodeKaryawan}`;
                                return acc + (tasksByDateAndEmployee[k]?.length || 0);
                              }, 0);

                              return (
                                <div
                                  key={emp.kodeKaryawan}
                                  className="grid grid-cols-[210px_repeat(7,1fr)] items-start min-h-[52px] gap-1"
                                >
                                  {/* Left Employee Profile Cell */}
                                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/90 border border-slate-200/80 select-none h-full shadow-2xs">
                                    <div
                                      style={{ backgroundColor: emp.avatarBgColor }}
                                      className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs"
                                    >
                                      {emp.avatarInitial}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-tight">
                                        {emp.kodeKaryawan} {emp.namaLengkap}
                                      </span>
                                      <span className="text-[10px] text-slate-400 truncate">
                                        {empWeeklyTasksCount} Task minggu ini
                                      </span>
                                    </div>
                                  </div>

                                  {/* 7 Day Column Slots for This Employee */}
                                  {week.map((day, dIdx) => {
                                    if (!day.dateString) {
                                      return (
                                        <div
                                          key={dIdx}
                                          className="h-12 border border-dashed border-slate-200/50 rounded-xl bg-slate-50/30"
                                        ></div>
                                      );
                                    }

                                    const cellKey = `${day.dateString}_${emp.kodeKaryawan}`;
                                    const isDragOver = dragOverCellKey === cellKey;

                                    // Tasks scheduled on this day for this employee
                                    const cellTasks =
                                      tasksByDateAndEmployee[cellKey] || [];
                                    const isWeekend = dIdx === 5 || dIdx === 6;
                                    const isHariBesar = checkHariKhususStatus(day.dateString).isBesar;
                                    const isHoliday = isWeekend || isHariBesar;
                                    const monthLabel =
                                      VISIBLE_MONTHS.find((m) => m.monthIdx === currentMonth)?.label || 'Nov';

                                    return (
                                      <div
                                        key={dIdx}
                                        onDragOver={(e) => handleCellDragOver(e, cellKey)}
                                        onDragLeave={() => {
                                          if (dragOverCellKey === cellKey) {
                                            setDragOverCellKey(null);
                                          }
                                        }}
                                        onDrop={(e) =>
                                          handleCellDrop(
                                            e,
                                            day.dateString!,
                                            emp.kodeKaryawan
                                          )
                                        }
                                        className={`min-h-[52px] p-1.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                                          isDragOver
                                            ? 'border-dashed border-2 border-[#008d91] bg-teal-50/60 ring-2 ring-teal-200'
                                            : cellTasks.length > 0
                                            ? 'border-slate-200/90 bg-slate-50/30'
                                            : isHoliday
                                            ? 'border-rose-100 bg-rose-50/15 hover:border-rose-200 hover:bg-rose-50/30'
                                            : 'border-slate-200/60 hover:border-[#008d91]/50 hover:bg-slate-50/50'
                                        }`}
                                      >
                                        {/* Cell Date Watermark / Header */}
                                        <div
                                          className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[11px] select-none shadow-2xs mb-1 transition-colors ${
                                            day.isToday
                                              ? 'bg-teal-50/95 border-teal-300 text-[#008d91] font-bold ring-1 ring-teal-200'
                                              : isHoliday
                                              ? 'bg-rose-50/80 border-rose-200 text-rose-700 font-semibold'
                                              : 'bg-slate-100/90 border-slate-200 text-slate-700 font-semibold'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1 truncate">
                                            <Calendar
                                              className={`w-3 h-3 shrink-0 ${
                                                day.isToday ? 'text-[#008d91]' : isHoliday ? 'text-rose-500' : 'text-slate-400'
                                              }`}
                                            />
                                            <span className="truncate">
                                              {day.dayNumber} {monthLabel}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {day.isToday && (
                                              <span className="text-[8px] font-extrabold text-white bg-[#008d91] px-1.5 py-0.2 rounded-full shadow-2xs">
                                                Hari Ini
                                              </span>
                                            )}
                                            {cellTasks.length > 0 && (
                                              <span className="text-[9px] font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded-full border border-slate-200 shadow-2xs">
                                                {cellTasks.length} Task
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Task / Sub-Task Cards in this Cell */}
                                        {cellTasks.map((item) =>
                                          renderExactSalurCard(item, {
                                            dateStr: day.dateString!,
                                          })
                                        )}

                                        {/* Drag indicator if hover empty */}
                                        {isDragOver && cellTasks.length === 0 && (
                                          <div className="h-10 flex items-center justify-center text-[10px] text-[#008d91] font-bold">
                                            Lepas di {day.dayNumber} {monthLabel}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })
                          )}

                          {/* ID Karyawan label at the bottom left */}
                          <div className="grid grid-cols-[210px_repeat(7,1fr)] items-center">
                            <div className="text-left text-xs text-slate-400 font-medium pl-1 py-1">
                              ID Karyawan
                            </div>
                            <div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Right Floating / Docked Panel ("To-do List yang belum di atur") */}
          {showUnassignedPanel && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverUnassignedArea(true);
              }}
              onDragLeave={() => setIsDragOverUnassignedArea(false)}
              onDrop={handleDropToUnassigned}
              className={`w-full lg:w-72 bg-[#eceff1] rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col gap-3 flex-shrink-0 transition-all ${
                isDragOverUnassignedArea
                  ? 'ring-2 ring-[#009688] bg-teal-50/50'
                  : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{activeTab === 'post' ? 'Post yang belum di atur' : 'Not Started'}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                    {unassignedTasks.length}
                  </span>
                </h3>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Filter Unassigned"
                    className="p-1 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Sebelumnya"
                    className="w-5 h-5 rounded-full bg-[#009688] text-white flex items-center justify-center hover:bg-[#00897b] transition-colors shadow-2xs"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    title="Berikutnya"
                    className="w-5 h-5 rounded-full bg-[#009688] text-white flex items-center justify-center hover:bg-[#00897b] transition-colors shadow-2xs"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Draggable Cards List */}
              <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-0.5">
                {unassignedTasks.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-300 rounded-xl bg-white/50 text-slate-400 flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-[#009688]" />
                    <span className="text-xs font-semibold text-slate-600">
                      {activeTab === 'post' ? 'Semua post sudah diatur!' : 'Tidak ada task di Not Started!'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Klik "+ Add" untuk menambahkan to-do baru.
                    </span>
                  </div>
                ) : (
                  unassignedTasks.map((item) =>
                    renderExactSalurCard(item, { isUnassigned: true })
                  )
                )}
              </div>

              {/* Waiting Prerequisite on Papan Trello Section */}
              {waitingPrerequisiteTasks.length > 0 && activeTab !== 'post' && (
                <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Menunggu di Papan Trello ({waitingPrerequisiteTasks.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('papanTrello')}
                      className="text-[11px] font-bold text-[#008d91] hover:underline cursor-pointer whitespace-nowrap"
                      title="Buka tab Papan Trello untuk mengubah status"
                    >
                      Buka Papan Trello &rarr;
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800 leading-snug">
                    Task / Sub-task berikut hanya akan dimunculkan setelah sub-task prasyaratnya berstatus <b>Sedang Dikerjakan</b> atau <b>Selesai</b> di tab Papan Trello:
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {waitingPrerequisiteTasks.map((w) => (
                      <div
                        key={w.id}
                        className="p-2 bg-white rounded-xl border border-amber-200 text-[11px] space-y-1 shadow-2xs"
                      >
                        <div className="font-bold text-slate-800 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          <span className="truncate">{w.title}</span>
                          {w.parentTaskTitle && (
                            <span className="text-[9px] text-slate-400 font-normal">
                              ({w.parentTaskTitle})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-amber-900 bg-amber-50/80 px-1.5 py-0.5 rounded">
                          <span className="truncate">Syarat: "{w.requiredSubTaskTitle}"</span>
                          <span className="font-bold text-[#008d91] shrink-0 ml-1">
                            Harus {w.requiredStatus}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400">
                          Status di Papan Trello: <span className="font-semibold text-slate-600">{w.currentStatusOnTrello || 'Belum Mulai'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer hint */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-[#009688] flex-shrink-0" />
                <span>
                  {activeTab === 'post'
                    ? 'Tarik (drag) kartu di atas ke baris channel & tanggal di kalender.'
                    : 'Tarik (drag) kartu di atas ke baris karyawan & tanggal di kalender.'}
                </span>
              </div>
            </div>
          )}
        </div>
        </div>
        )}
      </div>

      {/* Modal: Edit Hari Khusus */}
      {editingDateForHariKhusus && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {hariKhususMap[editingDateForHariKhusus]
                    ? 'Edit Hari Khusus'
                    : 'Tambah Hari Khusus'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {formatIndonesianDate(editingDateForHariKhusus)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDateForHariKhusus(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Keterangan Hari Khusus
              </label>
              <input
                id="input-hari-khusus"
                type="text"
                autoFocus
                value={hariKhususInputText}
                onChange={(e) => setHariKhususInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveHariKhusus();
                  if (e.key === 'Escape') setEditingDateForHariKhusus(null);
                }}
                placeholder="Contoh: Hari Pahlawan, Libur Nasional, Promo 11.11"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009688] text-slate-800"
              />
            </div>

            {/* Kategori Hari Khusus */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Kategori
              </label>
              <select
                value={editingKategoriForHariKhusus}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingKategoriForHariKhusus(val);
                  if (val === 'Hari Besar Nasional' || val === 'Cuti Bersama') {
                    setEditingIsLiburForHariKhusus(true);
                  } else if (val === 'Hari Peringatan') {
                    setEditingIsLiburForHariKhusus(false);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009688] text-slate-800 cursor-pointer"
              >
                {KATEGORI_HARI_KHUSUS_OPTIONS.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat} {kat === 'Hari Besar Nasional' ? '(Libur Nasional / Merah)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Checklist Libur */}
            <div>
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={editingIsLiburForHariKhusus}
                  onChange={(e) => setEditingIsLiburForHariKhusus(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 select-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    Libur (Dibuat Merah & Libur di Calendar)
                  </span>
                  <span className="text-[10px] text-slate-500 select-none">
                    Tanggal dibuat merah dan libur selain Sabtu & Minggu.
                  </span>
                </div>
              </label>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-400">
                Saran Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Hari Pahlawan', kat: 'Hari Besar Nasional', libur: true },
                  { name: 'Hari Guru Nasional', kat: 'Hari Besar Nasional', libur: true },
                  { name: 'Hari Ayah Nasional', kat: 'Hari Peringatan', libur: false },
                  { name: 'Hari Menanam Pohon', kat: 'Hari Peringatan', libur: false },
                  { name: 'Tahun Baru Masehi', kat: 'Hari Besar Nasional', libur: true },
                  { name: 'Hari Kemerdekaan RI', kat: 'Hari Besar Nasional', libur: true },
                ].map((sugg) => (
                  <button
                    key={sugg.name}
                    type="button"
                    onClick={() => {
                      setHariKhususInputText(sugg.name);
                      setEditingKategoriForHariKhusus(sugg.kat);
                      setEditingIsLiburForHariKhusus(sugg.libur);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {sugg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {hariKhususMap[editingDateForHariKhusus] ? (
                <button
                  type="button"
                  onClick={handleDeleteHariKhusus}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDateForHariKhusus(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveHariKhusus}
                  className="px-4 py-1.5 rounded-xl bg-[#009688] hover:bg-[#00897b] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Item Detail from Calendar */}
      {selectedItemDetail && (() => {
        const item = selectedItemDetail.item;
        const assignment = postAssignments[item.id];
        const sched = resolveEffectiveTaskSchedule(
          assignment,
          item.deadline,
          item.completed,
          effectiveTodayDateStr
        );
        const isPending = assignment?.status === 'pending' || !!assignment?.isPending;
        const isCompleted = item.completed || assignment?.status === 'completed';
        const start = sched.startDate || item.deadline || '2021-11-03';
        const end = sched.endDate || start;
        const duration = sched.durationDays || 1;
        const sessions = assignment?.durationSessions || item.durationSessions || [];
        const totalAccumulatedDays = sessions.reduce((acc, s) => acc + (s.durationDays || 0), 0);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-teal-50 text-[#009688] border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.isSubTask ? 'Sub-Task' : 'Task'} Calendar
                    </span>

                    {/* Status badge */}
                    {isPending ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <PauseCircle className="w-3 h-3 text-amber-600" />
                        PENDING
                      </span>
                    ) : isCompleted ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        SELESAI
                      </span>
                    ) : (
                      <span className="bg-sky-100 text-sky-800 border border-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <PlayCircle className="w-3 h-3 text-sky-600" />
                        AKTIF / BERJALAN
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-medium">
                      {formatIndonesianDate(start)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1 leading-snug">
                    {item.title}
                  </h3>

                  {item.isSubTask && item.parentTaskTitle && (
                    <p className="text-xs text-slate-500">
                      Task Utama: <span className="font-semibold text-slate-700">{item.parentTaskTitle}</span>
                    </p>
                  )}
                  {item.projectName && (
                    <p className="text-xs text-slate-500">
                      Proyek: <span className="font-semibold text-slate-700">{item.projectName}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItemDetail(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Box Durasi Pengerjaan */}
              <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-200/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">
                        Durasi Pengerjaan: {duration} Hari
                      </span>
                      <span className="text-[11px] text-amber-700">
                        {formatShortDeadline(start)} s/d {formatShortDeadline(end)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 shadow-2xs">
                    {duration} Hari
                  </span>
                </div>

                {sched.isAutoExtended && !isPending && !isCompleted && (
                  <div className="text-[11px] font-medium text-sky-800 bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>
                      Karena belum ditandai selesai atau pending, durasi bertambah otomatis hingga hari ini ({formatShortDeadline(end)}).
                    </span>
                  </div>
                )}
              </div>

              {/* Riwayat Semua Durasi yang Pernah Dicatat ("Semua durasi dicatat") */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <History className="w-4 h-4 text-purple-600" />
                    <span>Riwayat Durasi Tercatat ({sessions.length} Sesi)</span>
                  </div>
                  {totalAccumulatedDays > 0 && (
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      Total Akumulasi: {totalAccumulatedDays} Hari
                    </span>
                  )}
                </div>

                {sessions.length > 0 ? (
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200/80 rounded-2xl p-2 bg-slate-50/40">
                    {sessions.map((sess, idx) => (
                      <div key={sess.id || idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            sess.status === 'completed'
                              ? 'bg-emerald-500'
                              : sess.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                          }`} />
                          <div className="truncate">
                            <span className="font-semibold text-slate-800">
                              {formatShortDeadline(sess.startDate)} - {formatShortDeadline(sess.endDate)}
                            </span>
                            {sess.catatan && (
                              <span className="text-[10px] text-slate-400 block truncate">
                                {sess.catatan}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                            {sess.durationDays} Hari
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            sess.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : sess.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-sky-50 text-sky-700'
                          }`}>
                            {sess.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 text-xs">
                    Belum ada riwayat sesi pengerjaan sebelumnya. Durasi saat ini ({duration} Hari) sedang berjalan.
                  </div>
                )}
              </div>

              {item.deskripsi && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-700 block mb-0.5">Deskripsi:</span>
                  {item.deskripsi}
                </div>
              )}

              {/* Assigned Employee or Channel */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="text-slate-500 font-medium">
                  {activeTab === 'post' || item.isPost ? 'Channel / Platform:' : 'Karyawan Ditugaskan:'}
                </span>
                {activeTab === 'post' || item.isPost ? (
                  (() => {
                    const channelId = postAssignments[item.id]?.channelId || 'instagram_story';
                    const ch = POST_CHANNELS.find((c) => c.id === channelId);
                    return <span className="font-semibold text-[#009688]">{ch?.label || channelId}</span>;
                  })()
                ) : (
                  (() => {
                    const assignedCode =
                      postAssignments[item.id]?.employeeId || item.idKaryawanAssignJob || '00019';
                    const emp = activeEmployees.find((e) => e.kodeKaryawan === assignedCode);
                    return (
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {emp && (
                          <span
                            style={{ backgroundColor: emp.avatarBgColor }}
                            className="w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                          >
                            {emp.avatarInitial}
                          </span>
                        )}
                        {emp ? `${emp.kodeKaryawan} - ${emp.namaLengkap}` : assignedCode}
                      </span>
                    );
                  })()
                )}
              </div>

              {/* Action buttons inside detail modal */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Button Tandai Pending */}
                  {!isPending ? (
                    <button
                      type="button"
                      onClick={() => handleMarkItemPending(item)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 rounded-xl bg-amber-50 border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tandai Pending & Simpan Durasi</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItemDetail(null);
                        setSchedulingItem({ item });
                        setManualDateInput(start || '2021-11-03');
                        setManualEndDateInput(end || '2021-11-07');
                        setManualDurationDaysInput(duration || 5);
                        setManualStatusInput('active');
                        setManualAssigneeInput(assignment?.employeeId || item.idKaryawanAssignJob || '00019');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 rounded-xl bg-emerald-50 border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lanjutkan Pengerjaan</span>
                    </button>
                  )}

                  {/* Button Atur Durasi & Jadwal */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItemDetail(null);
                      setSchedulingItem({ item });
                      setManualDateInput(start);
                      setManualEndDateInput(end);
                      setManualDurationDaysInput(duration);
                      setManualStatusInput(isPending ? 'pending' : isCompleted ? 'completed' : 'active');
                      setManualAssigneeInput(assignment?.employeeId || item.idKaryawanAssignJob || '00019');
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-[#008d91] hover:bg-teal-50 rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CalendarRange className="w-3.5 h-3.5" />
                    <span>Ubah Durasi & Tanggal</span>
                  </button>

                  {/* Button Toggle Selesai */}
                  <button
                    type="button"
                    onClick={() => handleToggleItemComplete(item)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isCompleted
                        ? 'text-slate-600 hover:bg-slate-100 border-slate-300'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isCompleted ? 'Batal Selesai' : 'Tandai Selesai'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItemDetail(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Quick Schedule / Atur Durasi & Jadwal Pengerjaan */}
      {schedulingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {activeTab === 'post' ? 'Atur Jadwal Post ke Kalender' : 'Atur Durasi & Jadwal To-Do'}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[280px]">
                  {schedulingItem.item.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Status Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Status Pengerjaan:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualStatusInput('active')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      manualStatusInput === 'active'
                        ? 'bg-teal-500 text-white border-teal-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Aktif</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualStatusInput('pending')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      manualStatusInput === 'pending'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Pending</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualStatusInput('completed')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      manualStatusInput === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai</span>
                  </button>
                </div>
              </div>

              {/* Tanggal Mulai & Tanggal Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Mulai:</label>
                  <input
                    type="date"
                    value={manualDateInput}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setManualDateInput(newStart);
                      if (newStart) {
                        setManualEndDateInput(addDaysToDateStr(newStart, manualDurationDaysInput - 1));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009688] text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Selesai:</label>
                  <input
                    type="date"
                    value={manualEndDateInput}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      setManualEndDateInput(newEnd);
                      if (newEnd && manualDateInput) {
                        setManualDurationDaysInput(calculateInclusiveDays(manualDateInput, newEnd));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009688] text-slate-800"
                  />
                </div>
              </div>

              {/* Durasi Hari & Quick Presets */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Durasi Pengerjaan:
                  </label>
                  <span className="text-xs font-bold text-[#009688] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    {manualDurationDaysInput} Hari
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[1, 2, 3, 5, 7, 14].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setManualDurationDaysInput(days);
                        setManualEndDateInput(addDaysToDateStr(manualDateInput, days - 1));
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        manualDurationDaysInput === days
                          ? 'bg-[#009688] text-white border-[#009688]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {days} Hari
                    </button>
                  ))}
                </div>
              </div>

              {/* Karyawan / Channel */}
              {activeTab === 'post' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Pilih Channel / Platform:</label>
                  <select
                    value={manualChannelInput}
                    onChange={(e) => setManualChannelInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009688] text-slate-800 cursor-pointer"
                  >
                    {POST_CHANNELS.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Pilih Karyawan Ditugaskan:</label>
                  <select
                    value={manualAssigneeInput}
                    onChange={(e) => setManualAssigneeInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009688] text-slate-800 cursor-pointer"
                  >
                    {activeEmployees.map((emp) => (
                      <option key={emp.kodeKaryawan} value={emp.kodeKaryawan}>
                        {emp.kodeKaryawan} - {emp.namaLengkap} ({emp.namaPanggilan})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Summary note */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col gap-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#009688]" />
                  Ringkasan Jadwal: {manualDurationDaysInput} Hari
                </span>
                <span className="text-[11px] text-slate-500">
                  {formatShortDeadline(manualDateInput)} s/d {formatShortDeadline(manualEndDateInput)}
                  {manualStatusInput === 'pending'
                    ? ' (Akan dicatat durasinya dan dipindahkan ke To-Do List yang Belum Diatur)'
                    : manualStatusInput === 'completed'
                    ? ' (Akan dikunci durasinya dan ditandai selesai)'
                    : ' (Akan mencangkup tanggal tersebut di kalender)'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSchedulingItem(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmManualSchedule}
                className="px-4 py-1.5 rounded-xl bg-[#009688] hover:bg-[#00897b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Simpan & Jadwalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tulis & Catat Kendala (matching Ongoing Create Item S-SALUR) */}
      {isKendalaModalOpen && kendalaItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-amber-50/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {kendalaItem.projectName || 'Nama Proyek SAPA'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {(itemKendalaMap[kendalaItem.id] || []).length} Total Kendala
                    </span>
                    {(itemKendalaMap[kendalaItem.id] || []).filter((k) => k.status !== 'Selesai').length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {(itemKendalaMap[kendalaItem.id] || []).filter((k) => k.status !== 'Selesai').length} Aktif
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1">
                    Tulis & Catat Kendala
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Item: <span className="font-semibold text-slate-700">{kendalaItem.title}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsKendalaModalOpen(false);
                  setKendalaItem(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
              {/* Form Tulis Kendala Baru */}
              <div className="p-4 sm:p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Form Tulis Kendala Baru</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Catat hambatan pengerjaan
                  </span>
                </div>

                <form onSubmit={handleAddKendala} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Judul Kendala / Hambatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={kendalaJudul}
                      onChange={(e) => setKendalaJudul(e.target.value)}
                      placeholder="Contoh: Keterlambatan proofreading istilah bab..."
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                      <select
                        value={kendalaKategori}
                        onChange={(e) => setKendalaKategori(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                      >
                        <option value="Naskah">Naskah & Konten</option>
                        <option value="Desain & Layout">Desain & Layout</option>
                        <option value="Percetakan & ISBN">Percetakan & ISBN</option>
                        <option value="Anggaran / Administrasi">Anggaran / Administrasi</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status Awal</label>
                      <select
                        value={kendalaStatus}
                        onChange={(e) => setKendalaStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                      >
                        <option value="Open">Open (Belum Selesai)</option>
                        <option value="Sedang Ditangani">Sedang Ditangani</option>
                        <option value="Selesai">Selesai / Teratasi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        PIC / Pelapor
                      </label>
                      <input
                        type="text"
                        value={kendalaPelapor}
                        onChange={(e) => setKendalaPelapor(e.target.value)}
                        placeholder="Silvia Fukada"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Deskripsi Kendala <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={kendalaDeskripsi}
                      onChange={(e) => setKendalaDeskripsi(e.target.value)}
                      placeholder="Jelaskan detail kendala yang dialami secara rinci..."
                      rows={2}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500 font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Alternatif Solusi / Rencana Penanganan
                    </label>
                    <input
                      type="text"
                      value={kendalaSolusi}
                      onChange={(e) => setKendalaSolusi(e.target.value)}
                      placeholder="Langkah antisipasi atau koordinasi lanjutan..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan Kendala</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Daftar Kendala Tercatat */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                  <span>Daftar Kendala Yang Dicatat</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {(itemKendalaMap[kendalaItem.id] || []).length} kendala
                  </span>
                </h4>

                {(itemKendalaMap[kendalaItem.id] || []).length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                    Belum ada kendala yang dicatat untuk item ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(itemKendalaMap[kendalaItem.id] || []).map((k) => (
                      <div
                        key={k.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          k.status === 'Selesai'
                            ? 'bg-emerald-50/30 border-emerald-200/70'
                            : k.status === 'Sedang Ditangani'
                            ? 'bg-amber-50/30 border-amber-200/70'
                            : 'bg-rose-50/20 border-rose-200/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  k.status === 'Selesai'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : k.status === 'Sedang Ditangani'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {k.status}
                              </span>
                              {k.kategori && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {k.kategori}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {k.createdAt}
                              </span>
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                              {k.judul}
                            </h5>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteKendala(k.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                            title="Hapus Kendala"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {k.deskripsi}
                        </p>

                        {k.solusi && (
                          <div className="mt-2 p-2.5 bg-white/80 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-800">Rencana Solusi: </span>
                            {k.solusi}
                          </div>
                        )}

                        {/* Status Switcher Buttons */}
                        <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Ubah Status:</span>
                          <div className="flex items-center gap-1.5">
                            {(['Open', 'Sedang Ditangani', 'Selesai'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleToggleKendalaStatus(k.id, st)}
                                className={`px-2 py-0.5 rounded-lg font-semibold text-[10px] transition-colors cursor-pointer ${
                                  k.status === st
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsKendalaModalOpen(false);
                  setKendalaItem(null);
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
