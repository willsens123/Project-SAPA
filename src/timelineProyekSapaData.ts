export interface SapaTimelineTask {
  id: string;
  projectId: string;
  projectName: string;
  divisi: string;
  taskTitle: string;
  year: number; // e.g. 2021
  startMonth: number; // 0 for Jan, 11 for Des (Timeline SAPA)
  startWeek: number; // 1 to 4
  durationWeeks: number; // 1 to 48 (Timeline SAPA)
  deadlineDate?: string; // e.g. "20 Mei 2022"
  isScheduled: boolean; // true if scheduled on timeline, false if in "belum di atur"
  catatan?: string;
  completed?: boolean;
  // Orang yang mengerjakan
  idKaryawanAssignJob?: string;
  picName?: string;
  // Real Timeline Pengerjaan (Tosca)
  realStartMonth?: number;
  realStartWeek?: number;
  realDurationWeeks?: number;
}

const STORAGE_KEY = 'sapa_timeline_tasks_v1';

export const INITIAL_TIMELINE_TASKS: SapaTimelineTask[] = [
  // Scheduled Tasks for 2021 - PNB
  {
    id: 'timeline-task-1',
    projectId: 'proj-1',
    projectName: 'Promo 11.11',
    divisi: 'PNB',
    taskTitle: 'Briefing Tim & Materi Promo',
    year: 2021,
    startMonth: 0, // Jan
    startWeek: 1,
    durationWeeks: 6, // Jan W1 - Feb W2 (SAPA)
    realStartMonth: 0,
    realStartWeek: 1,
    realDurationWeeks: 5, // Jan W1 - Feb W1 (Real)
    idKaryawanAssignJob: 'karyawan-3',
    picName: 'Silvia Fukada',
    isScheduled: true,
    completed: true,
  },
  {
    id: 'timeline-task-2',
    projectId: 'proj-1',
    projectName: 'Promo 11.11',
    divisi: 'PNB',
    taskTitle: 'Setup Voucher & Monitoring CS',
    year: 2021,
    startMonth: 1, // Feb
    startWeek: 1,
    durationWeeks: 7, // Feb W1 - Mar W3 (SAPA)
    realStartMonth: 1,
    realStartWeek: 2,
    realDurationWeeks: 8, // Feb W2 - Mar W4 (Real)
    idKaryawanAssignJob: 'karyawan-2',
    picName: 'Cindy Budiman',
    isScheduled: true,
    completed: false,
  },
  {
    id: 'timeline-task-3',
    projectId: 'proj-2',
    projectName: 'BGTS Sekolah Budhi',
    divisi: 'PNB',
    taskTitle: 'Koordinasi Lokasi & Logistik',
    year: 2021,
    startMonth: 0, // Jan
    startWeek: 1,
    durationWeeks: 6, // Jan W1 - Feb W2 (SAPA)
    realStartMonth: 0,
    realStartWeek: 2,
    realDurationWeeks: 5, // Jan W2 - Feb W2 (Real)
    idKaryawanAssignJob: 'karyawan-1',
    picName: 'Agustino Ong',
    isScheduled: true,
    completed: false,
  },
  {
    id: 'timeline-task-4',
    projectId: 'proj-2',
    projectName: 'BGTS Sekolah Budhi',
    divisi: 'PNB',
    taskTitle: 'Liputan Dokumentasi & Publikasi',
    year: 2021,
    startMonth: 1, // Feb
    startWeek: 1,
    durationWeeks: 7, // Feb W1 - Mar W3 (SAPA)
    realStartMonth: 1,
    realStartWeek: 1,
    realDurationWeeks: 6, // Feb W1 - Mar W2 (Real)
    idKaryawanAssignJob: 'karyawan-4',
    picName: 'Ariel',
    isScheduled: true,
    completed: false,
  },
  {
    id: 'timeline-task-5',
    projectId: 'proj-4',
    projectName: 'Donasi Buku Empat Segel',
    divisi: 'PNB',
    taskTitle: 'Penyusunan Proposal Donasi',
    year: 2021,
    startMonth: 0, // Jan
    startWeek: 1,
    durationWeeks: 6, // Jan W1 - Feb W2 (SAPA)
    realStartMonth: 0,
    realStartWeek: 1,
    realDurationWeeks: 7, // Jan W1 - Feb W3 (Real)
    idKaryawanAssignJob: 'karyawan-3',
    picName: 'Silvia Fukada',
    isScheduled: true,
    completed: false,
  },
  {
    id: 'timeline-task-6',
    projectId: 'proj-4',
    projectName: 'Donasi Buku Empat Segel',
    divisi: 'PNB',
    taskTitle: 'Distribusi Paket Buku & Pelaporan',
    year: 2021,
    startMonth: 2, // Mar
    startWeek: 1,
    durationWeeks: 7, // Mar W1 - Apr W3 (SAPA)
    realStartMonth: 2,
    realStartWeek: 2,
    realDurationWeeks: 6, // Mar W2 - Apr W3 (Real)
    idKaryawanAssignJob: 'karyawan-1',
    picName: 'Agustino Ong',
    isScheduled: true,
    completed: false,
  },
  {
    id: 'timeline-task-7',
    projectId: 'proj-1',
    projectName: 'Promo 11.11',
    divisi: 'PNB',
    taskTitle: 'Eksekusi Promo 11.11 & Monitoring CS',
    year: 2021,
    startMonth: 10, // Nov
    startWeek: 1,
    durationWeeks: 3, // Nov W1 - Nov W3 (SAPA)
    realStartMonth: 10,
    realStartWeek: 1,
    realDurationWeeks: 4, // Nov W1 - Nov W4 (Real)
    idKaryawanAssignJob: 'karyawan-2',
    picName: 'Cindy Budiman',
    deadlineDate: '20 November 2021',
    isScheduled: true,
    completed: true,
  },
  {
    id: 'timeline-task-8',
    projectId: 'proj-2',
    projectName: 'BGTS Sekolah Budhi',
    divisi: 'PNB',
    taskTitle: 'Koordinasi Lokasi & Logistik Kegiatan',
    year: 2021,
    startMonth: 10, // Nov
    startWeek: 2,
    durationWeeks: 2, // Nov W2 - Nov W3 (SAPA)
    realStartMonth: 10,
    realStartWeek: 2,
    realDurationWeeks: 3, // Nov W2 - Nov W4 (Real)
    idKaryawanAssignJob: 'karyawan-1',
    picName: 'Agustino Ong',
    deadlineDate: '15 November 2021',
    isScheduled: true,
    completed: false,
  },
  {
    id: 'timeline-task-9',
    projectId: 'proj-4',
    projectName: 'Donasi Buku Empat Segel',
    divisi: 'PNB',
    taskTitle: 'Penyortiran dan Pengiriman Buku',
    year: 2021,
    startMonth: 10, // Nov
    startWeek: 3,
    durationWeeks: 2, // Nov W3 - Nov W4 (SAPA)
    realStartMonth: 10,
    realStartWeek: 2,
    realDurationWeeks: 3, // Nov W2 - Nov W4 (Real)
    idKaryawanAssignJob: 'karyawan-3',
    picName: 'Silvia Fukada',
    deadlineDate: '28 November 2021',
    isScheduled: true,
    completed: false,
  },
  // Unscheduled tasks matching the exact cards shown in the user's reference image!
  {
    id: 'unscheduled-task-1',
    projectId: 'proj-5',
    projectName: 'Promo Buku 88',
    divisi: 'PNB',
    taskTitle: 'Design Promosi IG',
    year: 2022,
    startMonth: 4, // Mei
    startWeek: 3,
    durationWeeks: 3,
    deadlineDate: '20 Mei 2022',
    isScheduled: false,
    completed: false,
  },
  {
    id: 'unscheduled-task-2',
    projectId: 'proj-5',
    projectName: 'Promo Buku 88',
    divisi: 'PNB',
    taskTitle: 'Buat JB',
    year: 2022,
    startMonth: 11, // Des
    startWeek: 3,
    durationWeeks: 2,
    deadlineDate: '20 Desember 2022',
    isScheduled: false,
    completed: false,
  },
  {
    id: 'unscheduled-task-3',
    projectId: 'proj-3',
    projectName: 'Stand Vihara Buddhayana',
    divisi: 'PNB',
    taskTitle: 'Briefing Panitia Stand',
    year: 2021,
    startMonth: 10,
    startWeek: 2,
    durationWeeks: 2,
    deadlineDate: '15 November 2021',
    isScheduled: false,
    completed: false,
  },
  {
    id: 'unscheduled-task-4',
    projectId: 'proj-1',
    projectName: 'Promo 11.11',
    divisi: 'PNB',
    taskTitle: 'Review Laporan Finansial',
    year: 2021,
    startMonth: 11,
    startWeek: 1,
    durationWeeks: 3,
    deadlineDate: '01 Desember 2021',
    isScheduled: false,
    completed: false,
  },
  // Scheduled Tasks for 2021 - MAD
  {
    id: 'timeline-task-mad-1',
    projectId: 'proj-mad-1',
    projectName: 'Penerbitan Buku & Majalah Meditasi',
    divisi: 'MAD',
    taskTitle: 'Penyusunan Konten Redaksi & Proofreading',
    year: 2021,
    startMonth: 10, // Nov
    startWeek: 1,
    durationWeeks: 4,
    deadlineDate: '25 November 2021',
    isScheduled: true,
    completed: false,
  },
  // Scheduled Tasks for 2021 - FUN
  {
    id: 'timeline-task-fun-1',
    projectId: 'proj-fun-1',
    projectName: 'Funneling & Donasi Akhir Tahun',
    divisi: 'FUN',
    taskTitle: 'Kampanye Donasi Rutin & Broadcast CS',
    year: 2021,
    startMonth: 10, // Nov
    startWeek: 2,
    durationWeeks: 3,
    deadlineDate: '30 November 2021',
    isScheduled: true,
    completed: false,
  },
  // Scheduled Tasks for 2021 - EVE
  {
    id: 'timeline-task-eve-1',
    projectId: 'proj-eve-1',
    projectName: 'Webinar Dharma Nusantara',
    divisi: 'EVE',
    taskTitle: 'Persiapan Pembicara & Room Zoom',
    year: 2021,
    startMonth: 10, // Nov
    startWeek: 1,
    durationWeeks: 2,
    deadlineDate: '14 November 2021',
    isScheduled: true,
    completed: true,
  },
];

export function loadTimelineTasks(): SapaTimelineTask[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const initialMap = new Map(INITIAL_TIMELINE_TASKS.map((t) => [t.id, t]));
        return parsed.map((item: SapaTimelineTask) => {
          const init = initialMap.get(item.id);
          return {
            ...item,
            idKaryawanAssignJob: item.idKaryawanAssignJob || init?.idKaryawanAssignJob || 'karyawan-1',
            picName: item.picName || init?.picName || 'Agustino Ong',
            realStartMonth:
              item.realStartMonth !== undefined
                ? item.realStartMonth
                : init?.realStartMonth !== undefined
                ? init.realStartMonth
                : item.startMonth,
            realStartWeek:
              item.realStartWeek !== undefined
                ? item.realStartWeek
                : init?.realStartWeek !== undefined
                ? init.realStartWeek
                : item.startWeek,
            realDurationWeeks:
              item.realDurationWeeks !== undefined
                ? item.realDurationWeeks
                : init?.realDurationWeeks !== undefined
                ? init.realDurationWeeks
                : item.durationWeeks,
          };
        });
      }
    }
  } catch (e) {
    console.error('Failed to load timeline tasks from localStorage', e);
  }
  return INITIAL_TIMELINE_TASKS;
}

export function saveTimelineTasks(tasks: SapaTimelineTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save timeline tasks to localStorage', e);
  }
}
