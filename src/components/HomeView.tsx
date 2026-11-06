import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Clock,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Circle,
  Pin,
  Star,
  User,
  Users,
  Building2,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  Truck,
  PhoneCall,
  DollarSign,
  ArrowUpRight,
  MessageSquare,
  ListTodo,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  BarChart3,
  Search,
  EyeOff,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ProjectItem,
  IdentitasItem,
  OrganisasiItem,
  TodoTaskItem,
  ListPMItem,
  KaryawanItem,
  AppView,
  MutasiItem,
  PengeluaranItem,
  VolunteerSSebarItem,
} from '../types';
import { PosKeuanganItem } from '../posKeuanganData';
import { PosPemasukanGroup } from '../posPemasukanData';
import { PosPemasukanSubJenisMapping } from '../posPemasukanSubJenisData';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';
import { SSalurIcon } from './SSalurIcon';
import { ChangeLoginUserModal } from './ChangeLoginUserModal';
import { AddCalendarEventModal, CalendarEventItem } from './AddCalendarEventModal';
import { HomeProjectCharts } from './HomeProjectCharts';
import { ReportDivisiKeu } from './ReportDivisiKeu';
import { ReportDivisiPnb } from './ReportDivisiPnb';
import { ReportDivisiFun } from './ReportDivisiFun';
import { ReportDivisiMad } from './ReportDivisiMad';
import { SalurProduct } from '../salurData';

interface PersonalNote {
  id: string;
  userId: string;
  text: string;
  date: string;
  isPinned?: boolean;
  isDone?: boolean;
}

interface HomeViewProps {
  currentUser: KaryawanItem;
  currentDivisi: string;
  onUpdateCurrentUser: (user: KaryawanItem, divisi: string) => void;
  projects: ProjectItem[];
  identitasList: IdentitasItem[];
  organisasiList: OrganisasiItem[];
  todoTasks: Record<string, TodoTaskItem[]>;
  listPMItems: ListPMItem[];
  posKeuanganList?: PosKeuanganItem[];
  mutasiItems?: MutasiItem[];
  posPemasukanList?: PosPemasukanGroup[];
  posPemasukanSubJenisList?: PosPemasukanSubJenisMapping[];
  salurOrders?: SalurOrder[];
  salurItems?: SalurProduct[];
  transaksiAjarList?: TransaksiAjarItem[];
  donasiOrders?: DonasiOrder[];
  pengeluaranList?: PengeluaranItem[];
  volunteerSSebarList?: VolunteerSSebarItem[];
  onNavigateView: (view: AppView) => void;
  onOpenProjectReport?: (project: ProjectItem) => void;
  onOpenProjectDetail?: (project: ProjectItem) => void;
  onOpenProjectTodos?: (project: ProjectItem) => void;
  onToggleTodoCompleted?: (projectId: string, taskId: string) => void;
  onShowToast: (msg: string) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDO_MONTH_MAP: Record<string, number> = {
  jan: 0, januari: 0,
  feb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  agu: 7, agt: 7, agustus: 7,
  sep: 8, september: 8,
  okt: 9, october: 9, oktober: 9,
  nov: 10, november: 10,
  des: 11, desember: 11,
};

// Helper: parse date like "02 Nov 1990", "15 Nov 2021", "2021-11-15"
function parseFlexibleDate(str: string): { day: number; month: number; year?: number } | null {
  if (!str) return null;
  const s = str.trim().toLowerCase();

  // YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10) - 1,
      day: parseInt(isoMatch[3], 10),
    };
  }

  // DD Mon YYYY or DD Mon
  const parts = s.split(/[\s-]+/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1].substring(0, 3);
    const month = INDO_MONTH_MAP[monthKey] ?? INDO_MONTH_MAP[parts[1]];
    if (!isNaN(day) && month !== undefined) {
      const year = parts[2] ? parseInt(parts[2], 10) : undefined;
      return { day, month, year };
    }
  }

  return null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  currentDivisi,
  onUpdateCurrentUser,
  projects,
  identitasList,
  organisasiList,
  todoTasks,
  listPMItems,
  posKeuanganList = [],
  mutasiItems = [],
  posPemasukanList = [],
  posPemasukanSubJenisList = [],
  salurOrders = [],
  salurItems = [],
  transaksiAjarList = [],
  donasiOrders = [],
  pengeluaranList = [],
  volunteerSSebarList,
  onNavigateView,
  onOpenProjectReport,
  onOpenProjectDetail,
  onOpenProjectTodos,
  onToggleTodoCompleted,
  onShowToast,
}) => {
  // Modal states
  const [isChangeUserOpen, setIsChangeUserOpen] = useState(false);
  const [isAddCalEventOpen, setIsAddCalEventOpen] = useState(false);

  // Active division filter in Home (defaults to currentDivisi or MAD)
  const [activeDivisi, setActiveDivisi] = useState(currentDivisi || 'MAD');

  useEffect(() => {
    if (currentDivisi) {
      setActiveDivisi(currentDivisi);
    }
  }, [currentDivisi]);

  // Starred caches from localStorage
  const starredIdentitasMap = useMemo(() => {
    try {
      const saved = localStorage.getItem('starred_identitas_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  const starredOrganisasiMap = useMemo(() => {
    try {
      const saved = localStorage.getItem('starred_organisasi_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // 1. Calendar State & Events
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selectedCalDate, setSelectedCalDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const [calEvents, setCalEvents] = useState<CalendarEventItem[]>(() => {
    try {
      const key = `sapa_home_cal_events_${currentUser.kodeKaryawan || currentUser.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default initial meetings & reminders
    return [
      {
        id: 'cal-default-1',
        userId: currentUser.kodeKaryawan || currentUser.id,
        type: 'rapat',
        title: 'Rapat Evaluasi Penjualan & Distribusi MAD',
        date: '2021-11-15',
        time: '10:00',
        locationOrNote: 'Ruang Rapat Utama & Google Meet',
      },
      {
        id: 'cal-default-2',
        userId: currentUser.kodeKaryawan || currentUser.id,
        type: 'reminder',
        title: 'Reminder Input Resi Transaksi S-SALUR Hari Ini',
        date: '2021-11-15',
        time: '14:30',
        locationOrNote: 'Pastikan resi JNE & J&T sudah lengkap',
      },
      {
        id: 'cal-default-3',
        userId: currentUser.kodeKaryawan || currentUser.id,
        type: 'reminder',
        title: 'Follow-up Donatur Dharma Patron Rutin',
        date: '2021-11-18',
        time: '11:00',
      },
    ];
  });

  const handleSaveCalEvent = (evt: CalendarEventItem) => {
    const updated = [evt, ...calEvents];
    setCalEvents(updated);
    try {
      const key = `sapa_home_cal_events_${currentUser.kodeKaryawan || currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
    onShowToast(`${evt.type === 'rapat' ? 'Tanggal Rapat' : 'Reminder Pribadi'} berhasil ditambahkan`);
  };

  const handleDeleteCalEvent = (id: string) => {
    const updated = calEvents.filter((e) => e.id !== id);
    setCalEvents(updated);
    try {
      const key = `sapa_home_cal_events_${currentUser.kodeKaryawan || currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
    onShowToast('Jadwal dihapus');
  };

  // 2. Personal Notes State
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(() => {
    try {
      const key = `sapa_home_notes_${currentUser.kodeKaryawan || currentUser.id}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'note-1',
        userId: currentUser.kodeKaryawan || currentUser.id,
        text: 'Follow-up kirim resi transaksi buku MAD untuk pemesan di Surabaya & Medan.',
        date: '15 Nov 2021, 09:30',
        isPinned: true,
        isDone: false,
      },
      {
        id: 'note-2',
        userId: currentUser.kodeKaryawan || currentUser.id,
        text: 'Koordinasi materi promo 11.11 dan stok buku "Jalan Menuju Kemahatahuan" dengan tim gudang.',
        date: '14 Nov 2021, 16:45',
        isPinned: false,
        isDone: true,
      },
      {
        id: 'note-3',
        userId: currentUser.kodeKaryawan || currentUser.id,
        text: 'Cek laporan pengeluaran stand Vihara Buddhayana Bogor bersama tim keuangan.',
        date: '13 Nov 2021, 11:20',
        isPinned: false,
        isDone: false,
      },
    ];
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const now = new Date();
    const dateStr = `${now.getDate()} ${MONTH_NAMES[now.getMonth()].substring(0, 3)} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNote: PersonalNote = {
      id: `note-${Date.now()}`,
      userId: currentUser.kodeKaryawan || currentUser.id,
      text: newNoteText.trim(),
      date: dateStr,
      isPinned: false,
      isDone: false,
    };
    const updated = [newNote, ...personalNotes];
    setPersonalNotes(updated);
    setNewNoteText('');
    setIsAddingNote(false);
    try {
      const key = `sapa_home_notes_${currentUser.kodeKaryawan || currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
    onShowToast('Catatan pribadi ditambahkan');
  };

  const handleToggleNoteDone = (id: string) => {
    const updated = personalNotes.map((n) => (n.id === id ? { ...n, isDone: !n.isDone } : n));
    setPersonalNotes(updated);
    try {
      const key = `sapa_home_notes_${currentUser.kodeKaryawan || currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const handleToggleNotePin = (id: string) => {
    const updated = personalNotes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    // Sort pinned to top
    updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    setPersonalNotes(updated);
    try {
      const key = `sapa_home_notes_${currentUser.kodeKaryawan || currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteNote = (id: string) => {
    const updated = personalNotes.filter((n) => n.id !== id);
    setPersonalNotes(updated);
    try {
      const key = `sapa_home_notes_${currentUser.kodeKaryawan || currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
    onShowToast('Catatan dihapus');
  };

  // 3. Tanggal Khusus:
  // "muncul semua tanggal ulang tahun Identitas dan tanggal khusus Organisasi
  // yang id login merupakan PIC atau yang mereka star.
  // Buat dalam rentang 2 minggu sebelum dan 2 minggu sesudah dari hari ini."
  const tanggalKhususList = useMemo(() => {
    const userCodes = [
      currentUser.kodeKaryawan,
      currentUser.namaLengkap?.toLowerCase(),
      currentUser.namaPanggilan?.toLowerCase(),
      'agustino',
      'ko agus',
      '00031',
    ].filter(Boolean) as string[];

    const isUserPic = (picVal?: string) => {
      if (!picVal) return false;
      const lower = picVal.toLowerCase();
      return userCodes.some((u) => lower.includes(u));
    };

    const isIdentitasStarred = (id: string, def?: boolean) => {
      if (starredIdentitasMap[id] !== undefined) return starredIdentitasMap[id];
      return !!def;
    };

    const isOrgStarred = (id: string, def?: boolean) => {
      if (starredOrganisasiMap[id] !== undefined) return starredOrganisasiMap[id];
      return !!def;
    };

    // Reference dates: check both today's real date and November 15, 2021 (the app's date in Header)
    // so user gets rich, relevant events in both current real-time window and 2021 mock window!
    const realToday = new Date();
    const appDate2021 = new Date(2021, 10, 15); // 15 Nov 2021

    interface TanggalKhususItem {
      id: string;
      name: string;
      type: 'identitas_ultah' | 'org_khusus';
      subText: string;
      dateStr: string;
      rawDate: { day: number; month: number; year?: number };
      diffDays: number;
      isStarred: boolean;
      pic: string;
      targetId: string;
    }

    const results: TanggalKhususItem[] = [];

    // Evaluate distance in days for day/month
    const getMinDiffDays = (day: number, month: number) => {
      // Check against realToday
      const targetThisYear = new Date(realToday.getFullYear(), month, day);
      const diffReal = Math.round((targetThisYear.getTime() - realToday.getTime()) / (1000 * 60 * 60 * 24));

      // Check against 2021 app date
      const target2021 = new Date(appDate2021.getFullYear(), month, day);
      const diff2021 = Math.round((target2021.getTime() - appDate2021.getTime()) / (1000 * 60 * 60 * 24));

      // If either falls within [-14, +14], return the one in range
      if (diffReal >= -14 && diffReal <= 14) return diffReal;
      if (diff2021 >= -14 && diff2021 <= 14) return diff2021;

      // Fallback: choose the closer one
      return Math.abs(diff2021) < Math.abs(diffReal) ? diff2021 : diffReal;
    };

    // A. Identitas birthdays
    identitasList.forEach((ident) => {
      const picMatch = isUserPic(ident.pic) || isUserPic(ident.picYppln);
      const starred = isIdentitasStarred(ident.id, ident.isStarred);
      if (!picMatch && !starred) return;

      const parsed = parseFlexibleDate(ident.tanggalLahir);
      if (!parsed) return;

      const diff = getMinDiffDays(parsed.day, parsed.month);
      if (diff >= -14 && diff <= 14) {
        results.push({
          id: `ultah-${ident.id}`,
          name: ident.namaLengkap,
          type: 'identitas_ultah',
          subText: `Ulang Tahun (${ident.namaPanggilan ? `"${ident.namaPanggilan}"` : ''} - ID ${ident.codeId || ident.id})`,
          dateStr: `${parsed.day} ${MONTH_NAMES[parsed.month]}`,
          rawDate: parsed,
          diffDays: diff,
          isStarred: starred,
          pic: ident.pic || 'Agustino',
          targetId: ident.id,
        });
      }
    });

    // B. Organisasi special dates
    organisasiList.forEach((org) => {
      const picMatch = isUserPic(org.pic) || isUserPic(org.picYppln);
      const starred = isOrgStarred(org.id, org.isStarred);
      if (!picMatch && !starred) return;

      // Check tanggalPentingList
      if (org.tanggalPentingList && org.tanggalPentingList.length > 0) {
        org.tanggalPentingList.forEach((tp) => {
          const parsed = parseFlexibleDate(tp.date);
          if (!parsed) return;
          const diff = getMinDiffDays(parsed.day, parsed.month);
          if (diff >= -14 && diff <= 14) {
            results.push({
              id: `org-tp-${org.id}-${tp.id}`,
              name: org.namaOrg,
              type: 'org_khusus',
              subText: tp.label || 'Hari Penting Organisasi',
              dateStr: `${parsed.day} ${MONTH_NAMES[parsed.month]}`,
              rawDate: parsed,
              diffDays: diff,
              isStarred: starred,
              pic: org.pic || 'Agustino',
              targetId: org.id,
            });
          }
        });
      } else {
        // Sample special date for Perusahaan A or organizations if empty
        const sampleDate = { day: 18, month: 10 }; // 18 Nov
        const diff = getMinDiffDays(sampleDate.day, sampleDate.month);
        if (diff >= -14 && diff <= 14) {
          results.push({
            id: `org-anniv-${org.id}`,
            name: org.namaOrg,
            type: 'org_khusus',
            subText: 'HUT / Ulang Tahun Mitra',
            dateStr: `${sampleDate.day} ${MONTH_NAMES[sampleDate.month]}`,
            rawDate: sampleDate,
            diffDays: diff,
            isStarred: starred,
            pic: org.pic || 'Agustino',
            targetId: org.id,
          });
        }
      }
    });

    // Sort by diffDays ascending (closest to today first)
    return results.sort((a, b) => Math.abs(a.diffDays) - Math.abs(b.diffDays));
  }, [identitasList, organisasiList, currentUser, starredIdentitasMap, starredOrganisasiMap]);

  // 4. Ongoing & Target Data
  const [ongoingTab, setOngoingTab] = useState<'pm' | 'todo' | 'proyek'>('pm');

  // Filter PMs for login ID or division
  const userPMList = useMemo(() => {
    return listPMItems.filter((pm) => {
      const matchDivisi = pm.proyekKode === activeDivisi || activeDivisi === 'ALL';
      const hasUser = pm.detailRows?.some(
        (dr) =>
          dr.nama?.toLowerCase().includes('agustino') ||
          dr.codeId === currentUser.kodeKaryawan
      );
      return matchDivisi || hasUser;
    });
  }, [listPMItems, activeDivisi, currentUser]);

  // Filter Todo Tasks for login ID or active division projects
  const userTodoList = useMemo(() => {
    const list: {
      projectId: string;
      projectName: string;
      task: TodoTaskItem;
    }[] = [];

    // Find project IDs belonging to active division
    const matchingProjIds = new Set(
      projects.filter((p) => p.divisi === activeDivisi || activeDivisi === 'ALL').map((p) => p.id)
    );

    Object.entries(todoTasks).forEach(([projId, tasks]) => {
      const proj = projects.find((p) => p.id === projId);
      const isDivisiMatch = matchingProjIds.has(projId);

      const taskList = Array.isArray(tasks) ? (tasks as TodoTaskItem[]) : [];
      taskList.forEach((t) => {
        const isUserAssigned =
          t.idKaryawanAssignJob === currentUser.kodeKaryawan ||
          t.subTasks?.some((st) => st.idKaryawanAssignJob === currentUser.kodeKaryawan);

        if (isUserAssigned || isDivisiMatch) {
          list.push({
            projectId: projId,
            projectName: proj?.namaKegiatan || 'Proyek SAPA',
            task: t,
          });
        }
      });
    });

    return list;
  }, [todoTasks, projects, activeDivisi, currentUser]);

  // Filter Ongoing Proyek SAPA for active division
  const ongoingProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        (p.status?.toLowerCase() === 'ongoing' || p.status?.toLowerCase().includes('ongoing')) &&
        (p.divisi === activeDivisi || activeDivisi === 'ALL')
    );
  }, [projects, activeDivisi]);

  // 5. Bagian Tengah: Report Proyek SAPA Divisi yang sedang berjalan (Per Proyek Container)
  // If ongoingProjects is empty for the division, fallback to active projects in that division
  const displayedOngoingProjects = useMemo(() => {
    if (ongoingProjects.length > 0) return ongoingProjects;
    return projects.filter((p) => p.divisi === activeDivisi || activeDivisi === 'ALL').slice(0, 2);
  }, [ongoingProjects, projects, activeDivisi]);

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ============================================================== */}
      {/* TOP ACTION BAR: Matching Transaksi S-SALUR and Identitas       */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Filter Tabs matching S-SALUR: Division Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {[
            { id: 'MAD', label: 'MAD' },
            { id: 'KEU', label: 'KEU' },
            { id: 'PNB', label: 'PNB' },
            { id: 'FUN', label: 'FUN' },
            { id: 'UMM', label: 'UMM' },
            { id: 'ALL', label: 'Semua Divisi' },
          ].map((tab) => {
            const isActive = activeDivisi === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDivisi(tab.id)}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm md:text-base font-semibold transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#008d91] text-white'
                    : 'bg-[#a8a8a8] hover:bg-[#999999] text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Icons & + Add Button matching Transaksi S-SALUR & Identitas */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Eye Off Icon */}
          <button
            type="button"
            title="Sembunyikan Kolom / Tampilan"
            onClick={() => onShowToast('Mode privasi tampilan diaktifkan')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Search Toggle Icon */}
          <button
            type="button"
            title="Cari"
            onClick={() => onShowToast('Pencarian cepat diaktifkan')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Sliders / Filter Icon */}
          <button
            type="button"
            title="Filter & Pengaturan"
            onClick={() => onShowToast('Menampilkan pengaturan filter')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button */}
          <button
            type="button"
            onClick={() => setIsAddCalEventOpen(true)}
            title="Tambah Agenda atau Reminder"
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TOP GREETING BANNER: "Halo Agustino" + Avatar Switcher         */}
      {/* ============================================================== */}
      <div className="w-full bg-gradient-to-r from-[#008d91] via-[#05828e] to-[#046c76] rounded-2xl p-5 sm:p-6 text-white shadow-xs relative overflow-hidden">
        {/* Decorative background vectors */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none overflow-hidden">
          <svg className="w-full h-full object-cover" viewBox="0 0 400 200" fill="none">
            <circle cx="350" cy="50" r="120" stroke="white" strokeWidth="30" />
            <circle cx="280" cy="180" r="90" stroke="white" strokeWidth="20" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left: User Photo / Avatar & Greeting */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Clickable Avatar Photo */}
            <div
              onClick={() => setIsChangeUserOpen(true)}
              title="Klik foto untuk mengubah ID Login & Divisi"
              className="relative group cursor-pointer"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md transition-transform transform group-hover:scale-105 ring-4 ring-white/30 ${
                  currentUser.avatarBg || 'bg-[#14b8a6]'
                }`}
              >
                {currentUser.avatarInitial || currentUser.namaLengkap?.charAt(0) || 'A'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white text-[#008d91] p-1 rounded-full shadow-md text-[10px] font-bold group-hover:bg-amber-300 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Halo {currentUser.namaPanggilan || currentUser.namaLengkap || 'Agustino'}.
                </h1>
                <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-semibold border border-white/20">
                  {currentUser.kodeKaryawan || '00031'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-teal-100 font-normal mt-1 flex items-center gap-2">
                <span>Login ID Aktif: {currentUser.namaLengkap}</span>
                <span>•</span>
                <span className="font-bold underline cursor-pointer hover:text-white" onClick={() => setIsChangeUserOpen(true)}>
                  Ubah ID Login
                </span>
              </p>
            </div>
          </div>

          {/* Right: Divisi Switcher Pills */}
          <div className="flex flex-col items-start md:items-end gap-1.5 w-full md:w-auto">
            <span className="text-[11px] font-bold text-teal-100 uppercase tracking-wider">
              Divisi Aktif:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 bg-white/15 p-1 rounded-xl backdrop-blur-xs max-w-full">
              {['MAD', 'KEU', 'UMM', 'FUN', 'PNB', 'EVE', 'CPR', 'MRK', 'CAM', 'OPS', 'PRO', 'MED', 'IT'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDivisi(d)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeDivisi === d
                      ? 'bg-white text-[#008d91] shadow-xs scale-105'
                      : 'text-white/90 hover:bg-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BAGIAN ATAS: 4 CARDS                                           */}
      {/* 1. Calendar (Hari ini, tanggal khusus, proyek SAPA, rapat)    */}
      {/* 2. Notes pribadi khusus id login                              */}
      {/* 3. Tanggal khusus (ultah & org khusus PIC/starred ±2 minggu)   */}
      {/* 4. Ongoing & Target (List PM, to-do list, proyek SAPA)         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* ------------------------------------------------------------ */}
        {/* CARD 1: CALENDAR                                             */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Calendar</h3>
                  <span className="text-[10px] text-slate-400">Jadwal & Pengingat</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCalEventOpen(true)}
                className="p-1.5 rounded-lg bg-teal-50 text-[#008d91] hover:bg-teal-100 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shadow-2xs"
                title="Tambah Tanggal Rapat atau Reminder Pribadi"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Tambah</span>
              </button>
            </div>

            {/* Month Header Nav */}
            <div className="flex items-center justify-between mt-3 px-1">
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear((y) => y - 1);
                  } else {
                    setCalMonth((m) => m - 1);
                  }
                }}
                className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-slate-700">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear((y) => y + 1);
                  } else {
                    setCalMonth((m) => m + 1);
                  }
                }}
                className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Mini Calendar Days */}
            <div className="mt-2.5">
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
                <span>Min</span>
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = ((i + 1) % 31) + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = selectedCalDate === dateStr;

                  // Check if today
                  const isToday = dayNum === 15 || (new Date().getDate() === dayNum && new Date().getMonth() === calMonth);

                  // Check events on this day
                  const hasMeeting = calEvents.some((e) => e.date.endsWith(`-${String(dayNum).padStart(2, '0')}`) && e.type === 'rapat');
                  const hasReminder = calEvents.some((e) => e.date.endsWith(`-${String(dayNum).padStart(2, '0')}`) && e.type === 'reminder');
                  const hasProject = projects.some((p) => p.tanggal?.includes(String(dayNum)));
                  const hasSpecial = tanggalKhususList.some((tk) => tk.rawDate.day === dayNum && tk.rawDate.month === calMonth);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedCalDate(dateStr)}
                      className={`relative py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[#008d91] text-white shadow-xs'
                          : isToday
                          ? 'bg-teal-50 text-[#008d91] font-bold ring-1 ring-[#008d91]'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{dayNum}</span>
                      <div className="flex items-center gap-0.5 mt-0.5 h-1">
                        {hasSpecial && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                        {hasProject && <span className="w-1 h-1 rounded-full bg-cyan-400" />}
                        {hasMeeting && <span className="w-1 h-1 rounded-full bg-purple-500" />}
                        {hasReminder && <span className="w-1 h-1 rounded-full bg-amber-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tgl Khusus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Proyek SAPA
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Rapat
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Reminder
              </span>
            </div>

            {/* List of Events */}
            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {calEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-2 rounded-xl text-xs border flex items-start justify-between gap-2 ${
                    evt.type === 'rapat'
                      ? 'bg-purple-50/60 border-purple-100 text-purple-900'
                      : 'bg-amber-50/60 border-amber-100 text-amber-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold">
                      {evt.type === 'rapat' ? (
                        <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">Rapat</span>
                      ) : (
                        <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">Reminder</span>
                      )}
                      <span className="truncate">{evt.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{evt.date}</span>
                      {evt.time && <span>• {evt.time} WIB</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCalEvent(evt.id)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 2: NOTES PRIBADI                                        */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Pin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Notes Pribadi</h3>
                  <span className="text-[10px] text-slate-400">Khusus ID: {currentUser.kodeKaryawan || '00031'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shadow-2xs"
                title="Tulis Catatan Baru"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Catatan</span>
              </button>
            </div>

            {/* Add Note Form */}
            {isAddingNote && (
              <div className="mt-3 p-2.5 bg-amber-50/50 rounded-2xl border border-amber-200 animate-in fade-in space-y-2">
                <textarea
                  rows={2}
                  placeholder="Tulis catatan pribadi di sini..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteText('');
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="px-3 py-1 text-[11px] font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-xs"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {personalNotes.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Belum ada catatan pribadi. Klik + Catatan untuk menambahkan.
                </div>
              ) : (
                personalNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                      note.isDone
                        ? 'bg-slate-50 border-slate-100 opacity-70'
                        : note.isPinned
                        ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleNoteDone(note.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                        >
                          {note.isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <p className={`text-xs text-slate-800 leading-snug ${note.isDone ? 'line-through text-slate-400' : ''}`}>
                          {note.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleNotePin(note.id)}
                          className={`p-1 rounded cursor-pointer ${
                            note.isPinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={note.isPinned ? 'Lepas pin' : 'Pin catatan'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded text-slate-300 hover:text-red-500 cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 self-end font-medium">
                      {note.date}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 3: TANGGAL KHUSUS                                       */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tanggal Khusus</h3>
                  <span className="text-[10px] text-slate-400">Rentang ±2 Minggu</span>
                </div>
              </div>

              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                {tanggalKhususList.length} Acara
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2.5 leading-tight">
              Ulang tahun Identitas & hari khusus Organisasi dimana Anda adalah PIC atau yang di-star:
            </p>

            {/* List Tanggal Khusus */}
            <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {tanggalKhususList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Tidak ada tanggal ulang tahun atau tanggal khusus dalam rentang 2 minggu ini.
                </div>
              ) : (
                tanggalKhususList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-gradient-to-r from-rose-50/30 to-transparent transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm shadow-2xs">
                        {item.type === 'identitas_ultah' ? '🎂' : '🏢'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800">{item.name}</span>
                          {item.isStarred && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.subText}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs font-bold text-[#008d91]">{item.dateStr}</span>
                      <span className={`text-[10px] font-semibold ${
                        item.diffDays === 0
                          ? 'text-rose-600 font-bold'
                          : item.diffDays > 0
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}>
                        {item.diffDays === 0
                          ? 'Hari ini!'
                          : item.diffDays > 0
                          ? `${item.diffDays} hari lagi`
                          : `${Math.abs(item.diffDays)} hari lalu`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CARD 4: ONGOING & TARGET                                     */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Ongoing & Target</h3>
                  <span className="text-[10px] text-slate-400">Divisi: {activeDivisi}</span>
                </div>
              </div>
            </div>

            {/* Segmented Pill Tabs matching S-SALUR style */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mt-3">
              <button
                type="button"
                onClick={() => setOngoingTab('pm')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  ongoingTab === 'pm'
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List PM ({userPMList.length})
              </button>
              <button
                type="button"
                onClick={() => setOngoingTab('todo')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  ongoingTab === 'todo'
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                To-Do ({userTodoList.length})
              </button>
              <button
                type="button"
                onClick={() => setOngoingTab('proyek')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  ongoingTab === 'proyek'
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Proyek ({ongoingProjects.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {ongoingTab === 'pm' && (
                <>
                  {userPMList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Tidak ada List PM yang aktif untuk divisi ini.
                    </div>
                  ) : (
                    userPMList.map((pm) => (
                      <div
                        key={pm.id}
                        onClick={() => onNavigateView('listPM')}
                        className="p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{pm.proyekSapa}</span>
                          <span className="text-[10px] bg-teal-100 text-[#008d91] font-bold px-2 py-0.5 rounded-full">
                            {pm.proyekKode}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Target: {pm.targetCount} target</span>
                          <span className="font-bold text-[#008d91]">{pm.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#008d91] h-1.5 rounded-full transition-all"
                            style={{ width: `${pm.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {ongoingTab === 'todo' && (
                <>
                  {userTodoList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Tidak ada tugas to-do aktif.
                    </div>
                  ) : (
                    userTodoList.map((item) => (
                      <div
                        key={item.task.id}
                        className="p-2.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white transition-all flex items-start gap-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => onToggleTodoCompleted && onToggleTodoCompleted(item.projectId, item.task.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-500 cursor-pointer"
                        >
                          {item.task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs text-slate-800 font-medium leading-snug ${item.task.completed ? 'line-through text-slate-400' : ''}`}>
                            {item.task.task}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span className="truncate">{item.projectName}</span>
                            {item.task.deadline && <span>• Deadline: {item.task.deadline}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {ongoingTab === 'proyek' && (
                <>
                  {ongoingProjects.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      Tidak ada proyek berstatus Ongoing untuk divisi {activeDivisi}.
                    </div>
                  ) : (
                    ongoingProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onOpenProjectReport && onOpenProjectReport(p)}
                        className="p-3 rounded-2xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{p.namaKegiatan}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                            Ongoing
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>{p.jenisProyek}</span>
                          <span className="text-[#008d91] font-semibold">{p.tanggal}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Lokasi: {p.lokasi}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VISUALISASI RECHARTS: RINGKASAN PROYEK PER DIVISI              */}
      {/* ============================================================== */}
      <HomeProjectCharts
        projects={projects}
        activeDivisi={activeDivisi}
        onSelectDivisi={(d) => setActiveDivisi(d)}
        onOpenProjectReport={onOpenProjectReport}
      />

      {/* ============================================================== */}
      {/* BAGIAN TENGAH: REPORT PROYEK SAPA DIVISI BERJALAN              */}
      {/* "Bagian tengah adalah report Proyek SAPA divisi tersebut yang  */}
      {/* sedang berjalan, buat dalam masing-masing proyek dalam bentuk  */}
      {/* container."                                                    */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center font-bold">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Report Proyek SAPA Divisi {activeDivisi} (Sedang Berjalan)
              </h2>
              <p className="text-xs text-slate-500">
                Laporan & metrik realisasi per proyek yang sedang berlangsung
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateView('table')}
            className="text-xs font-bold text-[#008d91] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Proyek SAPA
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project Containers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayedOngoingProjects.map((proj, idx) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow"
            >
              {/* Top Row: Title, Divisi, Ongoing Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#008d91] to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {proj.namaKegiatan.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800">{proj.namaKegiatan}</h3>
                      <span className="text-[11px] bg-teal-50 text-[#008d91] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                        {proj.divisi}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{proj.jenisProyek}</span>
                      <span>•</span>
                      <span>{proj.tanggal}</span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{proj.lokasi}</span>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ongoing
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Target Pemasukan</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {idx === 0 ? 'Rp15.000.000' : 'Rp25.000.000'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    {idx === 0 ? 'Rp12.500.000 (83%)' : 'Rp21.800.000 (87%)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Realisasi Pengeluaran</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {idx === 0 ? 'Rp3.200.000' : 'Rp5.400.000'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Operasional & Stand
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Item / Buku Terjual</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {idx === 0 ? '85 Buah' : '160 Buah'}
                  </span>
                  <span className="text-[10px] text-[#008d91] font-semibold block mt-0.5">
                    Target: {idx === 0 ? '100' : '180'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Customer / Partisipan</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {idx === 0 ? '42 Orang' : '88 Orang'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    +15 Relawan
                  </span>
                </div>
              </div>

              {/* Progress Bar & Sub-tasks */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Progres Aktivitas & To-Do Tim</span>
                  <span className="text-[#008d91] font-bold">{idx === 0 ? '75%' : '88%'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#008d91] to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: idx === 0 ? '75%' : '88%' }}
                  />
                </div>
              </div>

              {/* Container Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-400">
                  PIC Divisi: <span className="font-semibold text-slate-700">{currentUser.namaLengkap}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenProjectDetail && onOpenProjectDetail(proj)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Detail Proyek
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenProjectReport && onOpenProjectReport(proj)}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Buka Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* BAGIAN BAWAH: REPORT UNTUK MASING-MASING DIVISI               */}
      {/* "Bagian bawah adalah report untuk masing-masing divisi.        */}
      {/* Yang dicontohkan adalah report untuk divisi MAD."              */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
        {/* Header with Divisi Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008d91] flex items-center justify-center font-bold text-xl shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-800">
                  Report Divisi {activeDivisi}{' '}
                  {activeDivisi === 'MAD'
                    ? '(Marketing & Distribusi)'
                    : activeDivisi === 'PNB'
                    ? '(Penerbitan)'
                    : activeDivisi === 'KEU'
                    ? '(Keuangan)'
                    : activeDivisi === 'FUN'
                    ? '(Fundraising)'
                    : ''}
                </h2>
                <span className="text-xs bg-teal-50 text-[#008d91] font-bold px-3 py-1 rounded-full border border-teal-200">
                  {activeDivisi === 'MAD'
                    ? 'Divisi: MAD'
                    : activeDivisi === 'PNB'
                    ? 'Divisi: PNB'
                    : activeDivisi === 'FUN'
                    ? 'Divisi: FUN'
                    : activeDivisi === 'KEU'
                    ? 'Divisi: KEU'
                    : `Contoh Divisi: ${activeDivisi}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {activeDivisi === 'MAD'
                  ? 'Laporan real-time omzet penjualan, transaksi buku berbayar, sebaran nusantara, dan katalog S-SALUR'
                  : activeDivisi === 'PNB'
                  ? 'Laporan real-time item terbit, grafik buku S-SALUR, personil A-AJAK aktif, dan katalog stok buku'
                  : activeDivisi === 'FUN'
                  ? 'Laporan real-time omzet, donasi program, Dharma Patron, dan sebaran buku gratis nusantara'
                  : activeDivisi === 'KEU'
                  ? 'Laporan real-time arus kas, mutasi rekening bank, pos pemasukan & pengeluaran organisasi'
                  : 'Laporan komprehensif performa transaksi S-SALUR, pengiriman resi, kampanye promosi & keuangan'}
              </p>
            </div>
          </div>

          {/* Quick Division Switcher for Report */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
            {['MAD', 'KEU', 'UMM', 'FUN', 'PNB', 'EVE', 'CPR', 'MRK', 'CAM', 'OPS', 'PRO', 'MED', 'IT'].map((divCode) => (
              <button
                key={divCode}
                type="button"
                onClick={() => setActiveDivisi(divCode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeDivisi === divCode
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {divCode}
              </button>
            ))}
          </div>
        </div>

        {activeDivisi === 'KEU' ? (
          <ReportDivisiKeu
            posKeuanganList={posKeuanganList}
            mutasiItems={mutasiItems}
            posPemasukanList={posPemasukanList}
            posPemasukanSubJenisList={posPemasukanSubJenisList}
            salurOrders={salurOrders}
            transaksiAjarList={transaksiAjarList}
            donasiOrders={donasiOrders}
            pengeluaranList={pengeluaranList}
            onShowToast={onShowToast}
          />
        ) : activeDivisi === 'PNB' ? (
          <ReportDivisiPnb
            salurItems={salurItems}
            identitasList={identitasList}
            volunteerSSebarList={volunteerSSebarList}
            onShowToast={onShowToast}
            onNavigateView={onNavigateView}
          />
        ) : activeDivisi === 'FUN' ? (
          <ReportDivisiFun
            donasiOrders={donasiOrders}
            salurOrders={salurOrders}
            salurItems={salurItems}
            identitasList={identitasList}
            onShowToast={onShowToast}
            onNavigateView={onNavigateView}
          />
        ) : activeDivisi === 'MAD' ? (
          <ReportDivisiMad
            salurOrders={salurOrders}
            salurItems={salurItems}
            identitasList={identitasList}
            donasiOrders={donasiOrders}
            onShowToast={onShowToast}
            onNavigateView={onNavigateView}
          />
        ) : (
          <>
            {/* 4 KPI Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Omset Penjualan */}
          <div className="bg-gradient-to-br from-teal-50/50 to-white p-5 rounded-2xl border border-teal-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Total Omset Penjualan</span>
              <DollarSign className="w-4 h-4 text-[#008d91]" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp48.750.000
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% dari bulan lalu</span>
            </div>
          </div>

          {/* KPI 2: Buku Terdistribusi */}
          <div className="bg-gradient-to-br from-cyan-50/50 to-white p-5 rounded-2xl border border-cyan-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Buku / Item Terdistribusi</span>
              <Package className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              684 Eksemplar
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-2">
              Target: 750 eksemplar (91.2%)
            </div>
          </div>

          {/* KPI 3: Pengiriman Resi */}
          <div className="bg-gradient-to-br from-amber-50/50 to-white p-5 rounded-2xl border border-amber-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Paket Pengiriman Resi</span>
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              156 Paket
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-2">
              142 Terkirim • 14 Dalam Proses
            </div>
          </div>

          {/* KPI 4: CS & Call Center */}
          <div className="bg-gradient-to-br from-purple-50/50 to-white p-5 rounded-2xl border border-purple-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>CS Call Center & Kepuasan</span>
              <PhoneCall className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              98.7% Puas
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-2">
              Rata-rata respon: 2.4 menit
            </div>
          </div>
        </div>

        {/* 3 Detail Breakdown Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Card 1: Performa Channel Transaksi (Via Channel) */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Channel Transaksi (Via)</h4>
              <span className="text-[11px] text-slate-400">Total 156 Order</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Call Center</span>
                  <span className="font-bold text-slate-900">82 tx (Rp26.400.000)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-[#008d91] h-2 rounded-full" style={{ width: '54%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Instagram / Medsos</span>
                  <span className="font-bold text-slate-900">34 tx (Rp11.200.000)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '23%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Tokopedia / Marketplace</span>
                  <span className="font-bold text-slate-900">25 tx (Rp7.850.000)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '16%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Stand Offline Vihara</span>
                  <span className="font-bold text-slate-900">15 tx (Rp3.300.000)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '7%' }} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateView('transaksiSalur')}
              className="w-full py-2 text-center text-xs font-bold text-[#008d91] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
            >
              Buka Semua Transaksi S-SALUR →
            </button>
          </div>

          {/* Card 2: Top 5 Buku Terlaris S-SALUR MAD */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Top 5 Buku Terlaris</h4>
              <span className="text-[11px] text-slate-400">Distribusi MAD</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: 'Jalan Menuju Kemahatahuan', count: '245 pcs', rev: 'Rp20.825.000' },
                { title: 'Demi Kepentingan Semua Makhluk', count: '188 pcs', rev: 'Rp17.860.000' },
                { title: "The Leader's Way", count: '112 pcs', rev: 'Rp15.120.000' },
                { title: 'Intisari Amerta Sutra Hati', count: '78 pcs', rev: 'Rp7.410.000' },
                { title: 'Menjadi Buddha Tanpa Batas', count: '61 pcs', rev: 'Rp5.795.000' },
              ].map((book, bIdx) => (
                <div key={bIdx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                      {bIdx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{book.title}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#008d91] block">{book.count}</span>
                    <span className="text-[10px] text-slate-400">{book.rev}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateView('itemSalur')}
              className="w-full py-2 text-center text-xs font-bold text-[#008d91] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
            >
              Lihat Katalog Item S-SALUR →
            </button>
          </div>

          {/* Card 3: Distribusi Agen Resi Pengiriman */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Distribusi Agen Resi</h4>
              <span className="text-[11px] text-slate-400">Total Biaya Ongkir</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">JNE Express (Reguler/YES)</span>
                  <span className="text-[11px] text-slate-500">78 Resi terkirim</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">Rp780.000</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">100% On-time</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">J&T Express</span>
                  <span className="text-[11px] text-slate-500">45 Resi terkirim</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">Rp450.000</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">98% On-time</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">SiCepat</span>
                  <span className="text-[11px] text-slate-500">23 Resi terkirim</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">Rp230.000</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">100% On-time</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Lion Parcel</span>
                  <span className="text-[11px] text-slate-500">10 Resi terkirim</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">Rp100.000</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">95% On-time</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateView('resi')}
              className="w-full py-2 text-center text-xs font-bold text-[#008d91] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
            >
              Buka Dashboard Resi Pengiriman →
            </button>
          </div>
        </div>

        {/* Keuangan & Anggaran Divisi MAD */}
        <div className="bg-gradient-to-r from-slate-50 to-teal-50/20 p-5 sm:p-6 rounded-2xl border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Alokasi Anggaran & Realisasi Keuangan Divisi {activeDivisi}
              </h4>
              <p className="text-xs text-slate-500">
                Plafon anggaran operasional tim dan realisasi per bulan berjalan
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-700">Total Plafon: Rp20.000.000</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-emerald-600">Sisa Anggaran: Rp4.350.000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Subsidi Ongkos Kirim</span>
              <span className="font-bold text-slate-800 text-sm">Rp3.800.000</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">156 transaksi</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Kemasan & Packing Kardus</span>
              <span className="font-bold text-slate-800 text-sm">Rp4.200.000</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Plastik wrap, lakban, bubble</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Stand Offline & Banner</span>
              <span className="font-bold text-slate-800 text-sm">Rp3.650.000</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Vihara Buddhayana Bogor</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Iklan & Promosi Digital</span>
              <span className="font-bold text-slate-800 text-sm">Rp4.000.000</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Instagram & WhatsApp blast</span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

      {/* ============================================================== */}
      {/* MODALS: Change Login User & Add Calendar Event                */}
      {/* ============================================================== */}
      <ChangeLoginUserModal
        isOpen={isChangeUserOpen}
        onClose={() => setIsChangeUserOpen(false)}
        currentUser={currentUser}
        currentDivisi={activeDivisi}
        onSelectUser={(u, d) => {
          onUpdateCurrentUser(u, d);
          setActiveDivisi(d);
          onShowToast(`ID Login berhasil diubah ke ${u.namaLengkap} (Divisi: ${d})`);
        }}
      />

      <AddCalendarEventModal
        isOpen={isAddCalEventOpen}
        onClose={() => setIsAddCalEventOpen(false)}
        userId={currentUser.kodeKaryawan || currentUser.id}
        selectedDate={selectedCalDate}
        onSaveEvent={handleSaveCalEvent}
      />
    </div>
  );
};
