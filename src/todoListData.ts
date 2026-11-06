import { TodoTaskItem } from './types';

const STORAGE_KEY = 'sapa_project_todos_v3';

export const INITIAL_PROJECT_TODOS: Record<string, TodoTaskItem[]> = {
  'proj-1': [
    {
      id: 'task-1-demo',
      task: 'Task',
      idKaryawanAssignJob: '00018',
      deadline: '2021-11-11',
      deskripsi: 'Task Proyek SAPA untuk Papan Trello',
      completed: false,
      status: 'not_started',
      statusPengerjaan: 'belum_mulai',
      divisi: 'PNB',
      subTasks: [
        {
          id: 'sub-1-demo-1',
          title: 'Sub-Task',
          idKaryawanAssignJob: '00018',
          deadline: '2021-11-11',
          deskripsi: 'Sub-task Proyek SAPA terintegrasi',
          completed: false,
          status: 'not_started',
          statusPengerjaan: 'belum_mulai',
          divisi: 'PNB',
        },
      ],
    },
    {
      id: 'task-1-1',
      task: 'Briefing Tim & Materi Promo 11.11',
      idKaryawanAssignJob: '00031',
      deadline: '2021-11-05',
      deskripsi: 'Koordinasi materi promosi 11.11 dengan tim desain grafis dan copywriter media sosial.',
      completed: true,
      status: 'completed',
      statusPengerjaan: 'selesai',
      divisi: 'PNB',
      subTasks: [
        {
          id: 'sub-1-1-1',
          title: 'Finalisasi copy banner & visual feed Instagram',
          idKaryawanAssignJob: '00015',
          deadline: '2021-10-30',
          deskripsi: 'Memastikan ukuran feed dan story sesuai standar branding.',
          completed: true,
          status: 'completed',
          statusPengerjaan: 'pending',
          divisi: 'PNB',
        },
        {
          id: 'sub-1-1-2',
          title: 'Setup voucher diskon di platform marketplace',
          idKaryawanAssignJob: '00015',
          deadline: '2021-11-04',
          deskripsi: 'Input kode promo 11.11 dengan kuota terbatas.',
          completed: true,
          status: 'completed',
          statusPengerjaan: 'selesai',
          divisi: 'PNB',
        },
      ],
    },
    {
      id: 'task-1-2',
      task: 'Monitoring Performa Penjualan & Layanan CS',
      idKaryawanAssignJob: '00018',
      deadline: '2021-11-14',
      deskripsi: 'Pantau pesanan masuk secara real-time dan pastikan respon chat di bawah 5 menit.',
      completed: false,
      status: 'not_started',
      statusPengerjaan: 'belum_mulai',
      divisi: 'PNB',
      subTasks: [
        {
          id: 'sub-1-2-1',
          title: 'Rekap transaksi harian jam 12:00 dan 18:00',
          idKaryawanAssignJob: '00018',
          deadline: '2021-11-14',
          deskripsi: 'Kirim rekap ke grup koordinasi WhatsApp.',
          completed: false,
          status: 'not_started',
          statusPengerjaan: 'belum_mulai',
          divisi: 'PNB',
        },
      ],
    },
    {
      id: 'task-1-3',
      task: 'Post Feed Campaign 11.11 Diskon Spesial',
      isPost: true,
      idKaryawanAssignJob: '00019',
      deadline: '',
      deskripsi: 'Konten feed kampanye diskon 11.11 untuk buku-buku Dharma.',
      completed: false,
      subTasks: [
        {
          id: 'sub-1-3-1',
          title: 'Copywriting Caption & Hashtag',
          idKaryawanAssignJob: '00019',
          deadline: '',
          completed: true,
        },
        {
          id: 'sub-1-3-2',
          title: 'Desain Carousel 3 Slide',
          idKaryawanAssignJob: '00017',
          deadline: '',
          completed: false,
        },
      ],
    },
  ],
  'proj-2': [
    {
      id: 'task-2-1',
      task: 'Koordinasi Lokasi & Logistik Sekolah Budhi',
      idKaryawanAssignJob: '00019',
      deadline: '2021-11-08',
      deskripsi: 'Survei ruang aula dan konfirmasi ketersediaan sound system dan proyektor.',
      completed: false,
      subTasks: [
        {
          id: 'sub-2-1-1',
          title: 'Surat izin kegiatan dan permohonan fasilitas',
          idKaryawanAssignJob: '00019',
          deadline: '2021-11-06',
          deskripsi: 'Kirim surat resmi yang telah ditandatangani pengurus.',
          completed: true,
        },
        {
          id: 'sub-2-1-2',
          title: 'Konfirmasi konsumsi pembicara & panitia',
          idKaryawanAssignJob: '00016',
          deadline: '2021-11-07',
          deskripsi: 'Pesan makanan vegetarian untuk 25 orang.',
          completed: false,
        },
      ],
    },
    {
      id: 'task-2-2',
      task: 'Post Reels Story Liputan Sekolah Budhi',
      isPost: true,
      idKaryawanAssignJob: '00016',
      deadline: '',
      deskripsi: 'Video dokumentasi singkat kegiatan di Sekolah Budhi.',
      completed: false,
      subTasks: [
        {
          id: 'sub-2-2-1',
          title: 'Shoot cuplikan tanya jawab',
          idKaryawanAssignJob: '00016',
          completed: false,
        },
        {
          id: 'sub-2-2-2',
          title: 'Editing Reels 30 detik',
          idKaryawanAssignJob: '00017',
          completed: false,
        },
      ],
    },
  ],
  'proj-3': [
    {
      id: 'task-3-1',
      task: 'Persiapan Buku dan Display Stand Vihara Buddhayana',
      idKaryawanAssignJob: '00018',
      deadline: '2021-11-14',
      deskripsi: 'Pengecekan stok buku Dharma yang akan dibawa dan perlengkapan display stand.',
      completed: false,
      subTasks: [
        {
          id: 'sub-3-1-1',
          title: 'Packing buku dan brosur penjelas',
          idKaryawanAssignJob: '00018',
          deadline: '2021-11-13',
          deskripsi: 'Pastikan kardus diberi label jenis buku.',
          completed: false,
        },
      ],
    },
  ],
  'proj-4': [
    {
      id: 'task-4-1',
      task: 'Penyusunan Proposal Donasi Buku Empat Segel',
      idKaryawanAssignJob: '00031',
      deadline: '2021-11-10',
      deskripsi: 'Susun target donatur dan rincian alokasi penyaluran buku.',
      completed: false,
      subTasks: [],
    },
  ],
  'proj-5': [
    {
      id: 'task-5-1',
      task: 'Promosi IG',
      isPost: true,
      idKaryawanAssignJob: '00017',
      deadline: '2021-11-20',
      deskripsi: 'Kampanye promosi buku di Instagram feed dan story.',
      completed: false,
      subTasks: [
        {
          id: 'sub-5-1-1',
          title: 'Create JB Poster IG',
          idKaryawanAssignJob: '00017',
          deadline: '2021-11-20',
          deskripsi: 'Membuat konsep poster join broadcast Instagram.',
          completed: true,
        },
        {
          id: 'sub-5-1-2',
          title: 'Design Poster IG',
          idKaryawanAssignJob: '00017',
          deadline: '2021-11-20',
          deskripsi: 'Desain grafis poster resolusi tinggi.',
          completed: false,
        },
        {
          id: 'sub-5-1-3',
          title: 'Publish Poster IG',
          idKaryawanAssignJob: '00017',
          deadline: '2021-11-20',
          deskripsi: 'Posting dan jadwalkan ke akun resmi.',
          completed: false,
        },
      ],
    },
    {
      id: 'task-5-2',
      task: 'Post Promosi IG',
      isPost: true,
      idKaryawanAssignJob: '00031',
      deadline: '2022-05-20',
      deskripsi: 'Desain materi promosi feed dan story Instagram.',
      completed: false,
      subTasks: [],
    },
    {
      id: 'task-5-3',
      task: 'Promosi A',
      isPost: true,
      idKaryawanAssignJob: '00019',
      deadline: '2022-12-20',
      deskripsi: 'Materi promosi paket A.',
      completed: false,
      subTasks: [],
    },
    {
      id: 'task-5-4',
      task: 'Promosi B',
      isPost: true,
      idKaryawanAssignJob: '00017',
      deadline: '2022-12-20',
      deskripsi: 'Materi promosi paket B.',
      completed: false,
      subTasks: [],
    },
  ],
  'non-proj-jnp-1': [
    {
      id: 'task-np-demo',
      task: 'Task',
      idKaryawanAssignJob: '00015',
      deadline: '2026-10-15',
      deskripsi: 'Task Non-Proyek untuk Papan Trello',
      completed: false,
      isNonProyek: true,
      jenisNonProyekId: 'jnp-1',
      jenisNonProyekNama: 'Jenis Non Rutin',
      warnaKartu: '#9fa8da',
      divisi: 'PNB',
      isRutin: false,
      subTasks: [
        {
          id: 'sub-np-demo-1',
          title: 'Sub-Task',
          idKaryawanAssignJob: '00015',
          deadline: '2026-10-15',
          deskripsi: 'Sub-task Not Started Non Proyek',
          completed: false,
          status: 'not_started',
          statusPengerjaan: 'belum_mulai',
          isNonProyek: true,
          jenisNonProyekId: 'jnp-1',
          jenisNonProyekNama: 'Jenis Non Rutin',
          warnaKartu: '#9fa8da',
          isRutin: false,
          divisi: 'PNB',
        },
        {
          id: 'sub-np-demo-2',
          title: 'Sub-Task',
          idKaryawanAssignJob: '00015',
          deadline: '2026-11-05',
          deskripsi: 'Sub-task Ongoing Non Proyek',
          completed: false,
          status: 'ongoing',
          statusPengerjaan: 'ongoing',
          isNonProyek: true,
          jenisNonProyekId: 'jnp-1',
          jenisNonProyekNama: 'Jenis Non Rutin',
          warnaKartu: '#9fa8da',
          isRutin: false,
          divisi: 'PNB',
        },
        {
          id: 'sub-np-demo-3',
          title: 'Sub-Task',
          idKaryawanAssignJob: '00019',
          deadline: '2026-11-03',
          deskripsi: 'Sub-task Selesai Non Proyek',
          completed: true,
          status: 'completed',
          statusPengerjaan: 'selesai',
          isNonProyek: true,
          jenisNonProyekId: 'jnp-1',
          jenisNonProyekNama: 'Jenis Non Rutin',
          warnaKartu: '#9fa8da',
          isRutin: false,
          divisi: 'PNB',
        },
      ],
    },
    {
      id: 'task-np-1',
      task: 'Pembersihan & Pengarsipan Dokumen Harian',
      idKaryawanAssignJob: '00015',
      deadline: '2026-10-20',
      deskripsi: 'Pengecekan arsip dokumen dan pengelompokan berkas harian.',
      completed: false,
      status: 'not_started',
      statusPengerjaan: 'belum_mulai',
      isNonProyek: true,
      jenisNonProyekId: 'jnp-1',
      jenisNonProyekNama: 'Jenis Non Rutin',
      warnaKartu: '#9fa8da',
      divisi: 'PNB',
      isRutin: true,
      rutinConfig: {
        isRutin: true,
        berkalaMode: 'setiap_hari',
        setiapHariPilihan: 'Senin',
        tanggalBerakhir: '2026-12-31',
        siklusKe: 1,
      },
      subTasks: [
        {
          id: 'sub-np-1-1',
          title: 'Sortir berkas masuk dan surat keluar',
          idKaryawanAssignJob: '00015',
          deadline: '2026-10-20',
          deskripsi: 'Pengelompokan berdasarkan tanggal penerimaan berkas.',
          completed: false,
          status: 'not_started',
          statusPengerjaan: 'belum_mulai',
          isNonProyek: true,
          jenisNonProyekId: 'jnp-1',
          jenisNonProyekNama: 'Jenis Non Rutin',
          warnaKartu: '#9fa8da',
          isRutin: true,
          divisi: 'PNB',
        },
        {
          id: 'sub-np-1-2',
          title: 'Backup log pembukuan harian',
          idKaryawanAssignJob: '00019',
          deadline: '2026-10-15',
          deskripsi: 'Simpan salinan digital ke cloud storage.',
          completed: true,
          status: 'completed',
          statusPengerjaan: 'selesai',
          isNonProyek: true,
          jenisNonProyekId: 'jnp-1',
          jenisNonProyekNama: 'Jenis Non Rutin',
          warnaKartu: '#9fa8da',
          isRutin: true,
          divisi: 'PNB',
        },
      ],
    },
    {
      id: 'task-np-2',
      task: 'Pemeriksaan Fasilitas & Inventaris Kantor',
      idKaryawanAssignJob: '00015',
      deadline: '2026-10-28',
      deskripsi: 'Pengecekan stok perlengkapan operasional kantor (ad-hoc / tidak rutin).',
      completed: false,
      status: 'ongoing',
      statusPengerjaan: 'ongoing',
      isNonProyek: true,
      jenisNonProyekId: 'jnp-1',
      jenisNonProyekNama: 'Jenis Non Rutin',
      warnaKartu: '#9fa8da',
      divisi: 'PNB',
      isRutin: false,
      subTasks: [
        {
          id: 'sub-np-2-1',
          title: 'Inventarisasi ATK & perlengkapan rapat',
          idKaryawanAssignJob: '00015',
          deadline: '2026-10-28',
          deskripsi: 'Rekap kebutuhan alat tulis kantor yang menipis.',
          completed: false,
          status: 'ongoing',
          statusPengerjaan: 'ongoing',
          isNonProyek: true,
          jenisNonProyekId: 'jnp-1',
          jenisNonProyekNama: 'Jenis Non Rutin',
          warnaKartu: '#9fa8da',
          isRutin: false,
          divisi: 'PNB',
        },
      ],
    },
  ],
};

export function getAllProjectTodos(): Record<string, TodoTaskItem[]> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if (!Object.keys(parsed).some((k) => k.startsWith('non-proj') || k === 'proj-non-proyek')) {
          parsed['non-proj-jnp-1'] = INITIAL_PROJECT_TODOS['non-proj-jnp-1'];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load project todos from localStorage', e);
  }
  return INITIAL_PROJECT_TODOS;
}

export function getTodosForProject(projectId: string): TodoTaskItem[] {
  const allTodos = getAllProjectTodos();
  if (allTodos[projectId] && allTodos[projectId].length > 0) {
    return allTodos[projectId];
  }
  return [
    {
      id: `task-${Date.now()}-1`,
      task: '',
      idKaryawanAssignJob: '',
      deadline: '',
      deskripsi: '',
      completed: false,
      subTasks: [],
    },
  ];
}

export function saveTodosForProject(projectId: string, tasks: TodoTaskItem[]): void {
  try {
    const allTodos = getAllProjectTodos();
    allTodos[projectId] = tasks;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTodos));
  } catch (e) {
    console.error('Failed to save project todos to localStorage', e);
  }
}
