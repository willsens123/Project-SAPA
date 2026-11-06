export interface PapanTrelloCard {
  id: string;
  stage: 'not_started_non_proyek' | 'not_started_proyek_sapa' | 'ongoing' | 'selesai_pending';
  deadline: string; // e.g. "15/10" or "2021-10-15"
  taskName: string;
  subTaskName: string;
  idKaryawan: string;
  karyawanInitial?: string;
  karyawanNama?: string;
  isNonProyek: boolean;
  proyekSapaOrJenisName: string;
  divisi: string;
  statusPengerjaan?: 'belum_mulai' | 'ongoing' | 'selesai' | 'pending';
  tanggalMulai?: string; // e.g. "22/10"
  tanggalSelesai?: string; // e.g. "23/10"
  riwayatTanggalPengerjaan?: string; // e.g. "22/10-23/10, 25/10-27/10"
  hasKendala: boolean; // lingkaran merah tanda seru putih jika ada kendala
  kendalaKeterangan?: string;
  projectId?: string;
  taskId?: string;
  subTaskId?: string;
}

export const PAPAN_TRELLO_STORAGE_KEY = 'sapa_papan_trello_cards_v4';

export const INITIAL_PAPAN_TRELLO_CARDS: PapanTrelloCard[] = [
  // 1. Not Started Non Proyek
  {
    id: 'pt-card-1',
    projectId: 'non-proj-jnp-1',
    taskId: 'task-np-demo',
    subTaskId: 'sub-np-demo-1',
    stage: 'not_started_non_proyek',
    deadline: '15/10',
    taskName: 'Task',
    subTaskName: 'Sub-Task',
    idKaryawan: '00015',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia Fukada',
    isNonProyek: true,
    proyekSapaOrJenisName: 'Jenis Non Rutin',
    divisi: 'PNB',
    statusPengerjaan: 'belum_mulai',
    hasKendala: false,
  },
  {
    id: 'pt-card-2',
    projectId: 'non-proj-jnp-1',
    taskId: 'task-np-1',
    subTaskId: 'sub-np-1-1',
    stage: 'not_started_non_proyek',
    deadline: '20/10',
    taskName: 'Pembersihan & Pengarsipan Dokumen Harian',
    subTaskName: 'Sortir berkas masuk dan surat keluar',
    idKaryawan: '00015',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia Fukada',
    isNonProyek: true,
    proyekSapaOrJenisName: 'Jenis Non Rutin',
    divisi: 'PNB',
    statusPengerjaan: 'belum_mulai',
    hasKendala: false,
  },

  // 2. Not Started Proyek SAPA
  {
    id: 'pt-card-3',
    projectId: 'proj-1',
    taskId: 'task-1-demo',
    subTaskId: 'sub-1-demo-1',
    stage: 'not_started_proyek_sapa',
    deadline: '11/11',
    taskName: 'Task',
    subTaskName: 'Sub-Task',
    idKaryawan: '00018',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia',
    isNonProyek: false,
    proyekSapaOrJenisName: 'Proyek SAPA',
    divisi: 'PNB',
    statusPengerjaan: 'belum_mulai',
    hasKendala: false,
  },
  {
    id: 'pt-card-4',
    projectId: 'proj-1',
    taskId: 'task-1-2',
    subTaskId: 'sub-1-2-1',
    stage: 'not_started_proyek_sapa',
    deadline: '14/11',
    taskName: 'Monitoring Performa Penjualan & Layanan CS',
    subTaskName: 'Rekap transaksi harian jam 12:00 dan 18:00',
    idKaryawan: '00018',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia',
    isNonProyek: false,
    proyekSapaOrJenisName: 'Proyek SAPA',
    divisi: 'PNB',
    statusPengerjaan: 'belum_mulai',
    hasKendala: false,
  },

  // 3. Ongoing
  {
    id: 'pt-card-5',
    projectId: 'non-proj-jnp-1',
    taskId: 'task-np-demo',
    subTaskId: 'sub-np-demo-2',
    stage: 'ongoing',
    deadline: '05/11',
    taskName: 'Task',
    subTaskName: 'Sub-Task',
    idKaryawan: '00015',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia Fukada',
    isNonProyek: true,
    proyekSapaOrJenisName: 'Jenis Non Rutin',
    divisi: 'PNB',
    statusPengerjaan: 'ongoing',
    tanggalMulai: '22/10',
    hasKendala: true,
    kendalaKeterangan: 'Menunggu konfirmasi naskah bab 3',
  },
  {
    id: 'pt-card-6',
    projectId: 'non-proj-jnp-1',
    taskId: 'task-np-2',
    subTaskId: 'sub-np-2-1',
    stage: 'ongoing',
    deadline: '28/10',
    taskName: 'Pemeriksaan Fasilitas & Inventaris Kantor',
    subTaskName: 'Inventarisasi ATK & perlengkapan rapat',
    idKaryawan: '00015',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia Fukada',
    isNonProyek: true,
    proyekSapaOrJenisName: 'Jenis Non Rutin',
    divisi: 'PNB',
    statusPengerjaan: 'ongoing',
    tanggalMulai: '24/10',
    hasKendala: false,
  },

  // 4. Selesai / Status Pending
  {
    id: 'pt-card-7',
    projectId: 'non-proj-jnp-1',
    taskId: 'task-np-demo',
    subTaskId: 'sub-np-demo-3',
    stage: 'selesai_pending',
    deadline: '03/11',
    taskName: 'Task',
    subTaskName: 'Sub-Task',
    idKaryawan: '00019',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia',
    isNonProyek: true,
    proyekSapaOrJenisName: 'Jenis Non Rutin',
    divisi: 'PNB',
    statusPengerjaan: 'selesai',
    tanggalMulai: '20/10',
    tanggalSelesai: '24/10',
    hasKendala: true,
    kendalaKeterangan: 'Revisi minor format sampul',
  },
  {
    id: 'pt-card-8',
    projectId: 'proj-1',
    taskId: 'task-1-1',
    subTaskId: 'sub-1-1-1',
    stage: 'selesai_pending',
    deadline: '30/10',
    taskName: 'Briefing Tim & Materi Promo 11.11',
    subTaskName: 'Finalisasi copy banner & visual feed Instagram',
    idKaryawan: '00015',
    karyawanInitial: 'S',
    karyawanNama: 'Silvia Fukada',
    isNonProyek: false,
    proyekSapaOrJenisName: 'Proyek SAPA',
    divisi: 'PNB',
    statusPengerjaan: 'pending',
    riwayatTanggalPengerjaan: '22/10-23/10, 25/10-27/10',
    hasKendala: true,
    kendalaKeterangan: 'Menunggu sistem verifikasi Perpusnas dibuka kembali',
  },
];

export function formatCardDeadline(dateStr?: string): string {
  if (!dateStr) return 'DD/MM';
  if (dateStr.includes('/')) return dateStr;

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
  } catch {
    // fallback
  }

  // Attempt regex match for YYYY-MM-DD
  const m = dateStr.match(/\d{4}-(\d{2})-(\d{2})/);
  if (m) {
    return `${m[2]}/${m[1]}`;
  }

  return dateStr;
}

export function getPapanTrelloCardsFromStorage(): PapanTrelloCard[] {
  try {
    const raw = localStorage.getItem(PAPAN_TRELLO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read papan trello cards from storage', e);
  }
  return INITIAL_PAPAN_TRELLO_CARDS;
}

export function savePapanTrelloCardsToStorage(cards: PapanTrelloCard[]): void {
  try {
    localStorage.setItem(PAPAN_TRELLO_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save papan trello cards to storage', e);
  }
}
