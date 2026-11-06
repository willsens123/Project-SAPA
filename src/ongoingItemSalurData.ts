export type OngoingStage = 'backlog' | 'not_started' | 'in_progress' | 'review' | 'pra_cetak' | 'done';

export interface OngoingChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

export interface OngoingKendala {
  id: string;
  tanggal: string;
  judul: string;
  deskripsi: string;
  kategori?: 'Naskah' | 'Desain & Layout' | 'Percetakan & ISBN' | 'Anggaran / Administrasi' | 'Lainnya';
  status: 'Open' | 'Sedang Ditangani' | 'Selesai';
  pelapor?: string;
  solusi?: string;
  createdAt: string;
}

export interface OngoingPekerjaanAjak {
  id: string;
  namaPekerjaan: string;
  kategori: 'Naskah' | 'Desain' | 'Legal/ISBN' | 'Produksi' | 'Distribusi';
  pic: string;
  status: 'Belum Mulai' | 'Sedang Berjalan' | 'Menunggu Review' | 'Selesai';
  targetSelesai?: string;
  keterangan?: string;
}

export interface OngoingItemSalurCard {
  id: string;
  kodeItem?: string;
  namaItem: string;
  subNamaItem?: string;
  jenisItem: string;
  proyekSapaId: string;
  proyekSapaName: string;
  divisi: string;
  stage: OngoingStage;
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
  picUtama: string;
  targetTerbit: string;
  estimasiHalaman?: number;
  targetEksemplar?: number;
  catatan?: string;
  linkNaskah?: string;
  pekerjaanAjak: OngoingPekerjaanAjak[];
  checklists: OngoingChecklistItem[];
  kendala?: OngoingKendala[];
  tanggalMulaiAjak?: string;
  selesaiAt?: string;
  dependsOnCardId?: string;
  dependsOnCardTitle?: string;
  proyekSapaStatus?: 'Selesai' | 'Batal' | 'Aktif';
  proyekSapaKeterangan?: string;
  proyekSapaResolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumnDef {
  id: OngoingStage;
  title: string;
  subtitle: string;
  colorClass: string;
  headerBg: string;
  badgeBg: string;
}

export const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: 'backlog',
    title: 'Backlog / Usulan',
    subtitle: 'Rencana Pekerjaan A-AJAK',
    colorClass: 'border-slate-200 bg-slate-50/60',
    headerBg: 'bg-slate-100 text-slate-700',
    badgeBg: 'bg-slate-200 text-slate-700',
  },
  {
    id: 'not_started',
    title: 'Not Started',
    subtitle: 'Siap & Menunggu Pengerjaan',
    colorClass: 'border-amber-200 bg-amber-50/30',
    headerBg: 'bg-amber-100 text-amber-800',
    badgeBg: 'bg-amber-200 text-amber-800',
  },
  {
    id: 'in_progress',
    title: 'Sedang Dikerjakan & Review',
    subtitle: 'Penulisan, Layout & Proofreading',
    colorClass: 'border-sky-200 bg-sky-50/30',
    headerBg: 'bg-sky-100 text-sky-800',
    badgeBg: 'bg-sky-200 text-sky-800',
  },
  {
    id: 'done',
    title: 'Selesai',
    subtitle: 'To-Do List & Item Selesai',
    colorClass: 'border-emerald-200 bg-emerald-50/30',
    headerBg: 'bg-emerald-100 text-emerald-800',
    badgeBg: 'bg-emerald-200 text-emerald-800',
  },
];

export const INITIAL_ONGOING_CARDS: OngoingItemSalurCard[] = [
  {
    id: 'ongoing-1',
    kodeItem: 'B-042',
    namaItem: 'Buku Panduan Meditasi Lamrim Jilid 2',
    subNamaItem: 'Langkah Praktis Meditasi Vipassana & Samatha',
    jenisItem: 'Buku',
    proyekSapaId: 'proj-pnb-1',
    proyekSapaName: 'Seri Meditasi Lamrim Pemula',
    divisi: 'PNB',
    stage: 'in_progress',
    prioritas: 'Tinggi',
    picUtama: 'Silvia Fukada',
    targetTerbit: '15 Des 2021',
    estimasiHalaman: 216,
    targetEksemplar: 1000,
    catatan: 'Naskah bab 1-3 sudah selesai diperiksa, saat ini menunggu pengerjaan bab 4-6 dan pembuatan diagram.',
    linkNaskah: 'https://docs.google.com/document/d/lamrim-v2-draft',
    pekerjaanAjak: [
      {
        id: 'ajak-1',
        namaPekerjaan: 'Penerjemahan Teks Asli Bab 1-6',
        kategori: 'Naskah',
        pic: 'Bhikshu Bhadra',
        status: 'Selesai',
        targetSelesai: '10 Okt 2021',
      },
      {
        id: 'ajak-2',
        namaPekerjaan: 'Editing Tata Bahasa & Glosarium Istilah Dharma',
        kategori: 'Naskah',
        pic: 'Silvia Fukada',
        status: 'Sedang Berjalan',
        targetSelesai: '25 Nov 2021',
      },
      {
        id: 'ajak-3',
        namaPekerjaan: 'Desain Ilustrasi & Diagram Postur Meditasi',
        kategori: 'Desain',
        pic: 'Rian Ilustrator',
        status: 'Sedang Berjalan',
        targetSelesai: '30 Nov 2021',
      },
      {
        id: 'ajak-4',
        namaPekerjaan: 'Proofreading Naskah Pra-Layout',
        kategori: 'Naskah',
        pic: 'Tim Telaah PNB',
        status: 'Belum Mulai',
        targetSelesai: '05 Des 2021',
      },
      {
        id: 'ajak-5',
        namaPekerjaan: 'Pendaftaran ISBN & Barcode Perpusnas',
        kategori: 'Legal/ISBN',
        pic: 'Admin PNB',
        status: 'Belum Mulai',
        targetSelesai: '10 Des 2021',
      },
    ],
    checklists: [
      { id: 'chk-1', title: 'Verifikasi kutipan teks sutra bab 1-3', completed: true },
      { id: 'chk-2', title: 'Review terjemahan istilah Sansekerta', completed: true },
      { id: 'chk-3', title: 'Layouting bab 1-3 ke InDesign', completed: false },
      { id: 'chk-4', title: 'Finalisasi mockup cover depan dan punggung', completed: false },
    ],
    kendala: [
      {
        id: 'kdl-1',
        tanggal: '08 Okt 2026',
        judul: 'Menunggu finalisasi transliterasi istilah Sanskrit Bab 4 & 7',
        deskripsi: 'Bab 4 dan Bab 7 memerlukan pengecekan ejaan transliterasi Sanskrit dari tim ahli sebelum masuk proses layouting.',
        kategori: 'Naskah',
        status: 'Sedang Ditangani',
        pelapor: 'Silvia Fukada',
        solusi: 'Sudah dikoordinasikan dengan tim telaah istilah, ditargetkan selesai minggu ini.',
        createdAt: '2026-10-08',
      },
    ],
    createdAt: '2021-10-01',
    updatedAt: '2021-11-12',
  },
  {
    id: 'ongoing-2',
    kodeItem: 'B-043',
    namaItem: 'Buku Doa & Gatha Puja Bakti Harian',
    subNamaItem: 'Kumpulan Doa Pagi, Malam, dan Pelimpahan Jasa',
    jenisItem: 'Buku',
    proyekSapaId: 'proj-pnb-2',
    proyekSapaName: 'Buku Doa & Puja Harian Buddhis',
    divisi: 'PNB',
    stage: 'in_progress',
    prioritas: 'Sedang',
    picUtama: 'Silvia Fukada',
    targetTerbit: '05 Des 2021',
    estimasiHalaman: 128,
    targetEksemplar: 2500,
    catatan: 'Naskah teks lengkap dan fonetik sudah siap, sedang direview oleh Bhante untuk akurasi pelafalan.',
    linkNaskah: 'https://docs.google.com/document/d/doa-harian-pnb',
    pekerjaanAjak: [
      {
        id: 'ajak-21',
        namaPekerjaan: 'Kompilasi Teks Pali & Terjemahan Resmi',
        kategori: 'Naskah',
        pic: 'Silvia Fukada',
        status: 'Selesai',
        targetSelesai: '15 Okt 2021',
      },
      {
        id: 'ajak-22',
        namaPekerjaan: 'Tata Letak Tipografi Ukuran Besar (Ramah Lansia)',
        kategori: 'Desain',
        pic: 'Hendra Layout',
        status: 'Selesai',
        targetSelesai: '30 Okt 2021',
      },
      {
        id: 'ajak-23',
        namaPekerjaan: 'Review Pelafalan Fonetik oleh Dewan Sangha',
        kategori: 'Naskah',
        pic: 'Ven. Thitaviro',
        status: 'Menunggu Review',
        targetSelesai: '20 Nov 2021',
      },
      {
        id: 'ajak-24',
        namaPekerjaan: 'Finishing Cover Foil Emas & Pita Pembatas',
        kategori: 'Desain',
        pic: 'Silvia Fukada',
        status: 'Menunggu Review',
        targetSelesai: '25 Nov 2021',
      },
    ],
    checklists: [
      { id: 'chk-21', title: 'Pengecekan ejaan diakritik Pali (ā, ī, ū, ṅ, ñ)', completed: true },
      { id: 'chk-22', title: 'Cetak dummy contoh 1 eksemplar', completed: true },
      { id: 'chk-23', title: 'ACC akhir dari Ketua Tim Penerbitan PNB', completed: false },
    ],
    createdAt: '2021-09-15',
    updatedAt: '2021-11-10',
  },
  {
    id: 'ongoing-3',
    kodeItem: 'B-044',
    namaItem: 'Komik Jataka: Kisah Kera Bijaksana Vol. 3',
    subNamaItem: 'Seri Cerita Bergambar Pendidikan Moral Anak',
    jenisItem: 'Buku',
    proyekSapaId: 'proj-pnb-3',
    proyekSapaName: 'Penerbitan Komik Jataka Bergambar Vol. 3',
    divisi: 'PNB',
    stage: 'in_progress',
    prioritas: 'Tinggi',
    picUtama: 'Budi Santoso',
    targetTerbit: '28 Nov 2021',
    estimasiHalaman: 48,
    targetEksemplar: 3000,
    catatan: 'Dummy digital disetujui, plat cetak offset sedang disiapkan di Percetakan Mahameru.',
    linkNaskah: 'https://drive.google.com/file/d/komik-jataka-vol3',
    pekerjaanAjak: [
      {
        id: 'ajak-31',
        namaPekerjaan: 'Skrip Cerita Moral & Dialog Sederhana',
        kategori: 'Naskah',
        pic: 'Penulis Naskah',
        status: 'Selesai',
        targetSelesai: '01 Sep 2021',
      },
      {
        id: 'ajak-32',
        namaPekerjaan: 'Ilustrasi Full Color 48 Halaman',
        kategori: 'Desain',
        pic: 'Studio Animasi Kawan',
        status: 'Selesai',
        targetSelesai: '20 Okt 2021',
      },
      {
        id: 'ajak-33',
        namaPekerjaan: 'Pendaftaran ISBN & Hak Cipta',
        kategori: 'Legal/ISBN',
        pic: 'Admin PNB',
        status: 'Selesai',
        targetSelesai: '05 Nov 2021',
      },
      {
        id: 'ajak-34',
        namaPekerjaan: 'Proof Print Percetakan (Color Matching)',
        kategori: 'Produksi',
        pic: 'Percetakan Mahameru',
        status: 'Sedang Berjalan',
        targetSelesai: '22 Nov 2021',
      },
    ],
    checklists: [
      { id: 'chk-31', title: 'Resolusi gambar minimal 300 DPI CMYK', completed: true },
      { id: 'chk-32', title: 'Bleed area 3mm aman untuk potong', completed: true },
      { id: 'chk-33', title: 'Persetujuan proof color dari desainer', completed: true },
      { id: 'chk-34', title: 'Mulai cetak offset kloter pertama', completed: false },
    ],
    createdAt: '2021-08-20',
    updatedAt: '2021-11-14',
  },
  {
    id: 'ongoing-4',
    kodeItem: 'B-045',
    namaItem: 'Buku Saku Ajaran Empat Kebenaran Mulia',
    subNamaItem: 'Transkrip Ceramah Dharma Master Dagpo Rinpoche',
    jenisItem: 'Buku',
    proyekSapaId: 'proj-pnb-4',
    proyekSapaName: 'Penerbitan Buku Dharma Master Dagpo 2021',
    divisi: 'PNB',
    stage: 'backlog',
    prioritas: 'Sedang',
    picUtama: 'Silvia Fukada',
    targetTerbit: '20 Jan 2022',
    estimasiHalaman: 96,
    targetEksemplar: 2000,
    catatan: 'Pengumpulan rekaman audio dan transkrip mentah dari tim audio visual sudah masuk.',
    linkNaskah: 'https://docs.google.com/document/d/transkrip-catur-arya-satya',
    pekerjaanAjak: [
      {
        id: 'ajak-41',
        namaPekerjaan: 'Kompilasi Transkrip Rekaman Ceramah',
        kategori: 'Naskah',
        pic: 'Tim Transkripsi',
        status: 'Selesai',
        targetSelesai: '30 Okt 2021',
      },
      {
        id: 'ajak-42',
        namaPekerjaan: 'Penyusunan Outline & Pembagian Bab',
        kategori: 'Naskah',
        pic: 'Silvia Fukada',
        status: 'Sedang Berjalan',
        targetSelesai: '30 Nov 2021',
      },
      {
        id: 'ajak-43',
        namaPekerjaan: 'Penugasan Editor Bahasa & Pemeriksa Istilah',
        kategori: 'Naskah',
        pic: 'Koordinator PNB',
        status: 'Belum Mulai',
        targetSelesai: '10 Des 2021',
      },
    ],
    checklists: [
      { id: 'chk-41', title: 'Konfirmasi izin terjemahan dari yayasan pusat', completed: true },
      { id: 'chk-42', title: 'Menentukan format buku (ukuran A6 buku saku)', completed: true },
      { id: 'chk-43', title: 'Briefing tim editor naskah', completed: false },
    ],
    createdAt: '2021-11-01',
    updatedAt: '2021-11-05',
  },
  {
    id: 'ongoing-5',
    kodeItem: 'B-040',
    namaItem: 'Lamrim Chenmo Ringkas Edisi Revisi',
    subNamaItem: 'Tahapan Menuju Pencerahan - Edisi Belajar Mandiri',
    jenisItem: 'Buku',
    proyekSapaId: 'proj-pnb-1',
    proyekSapaName: 'Seri Meditasi Lamrim Pemula',
    divisi: 'PNB',
    stage: 'done',
    prioritas: 'Tinggi',
    picUtama: 'Silvia Fukada',
    targetTerbit: '10 Nov 2021',
    estimasiHalaman: 340,
    targetEksemplar: 1500,
    catatan: 'Buku fisik telah selesai dicetak, tiba di gudang utama dan siap disalurkan ke pembaca.',
    linkNaskah: 'https://drive.google.com/file/d/lamrim-ringkas-final',
    selesaiAt: '10 Nov 2021, 15:00',
    proyekSapaStatus: 'Selesai',
    proyekSapaKeterangan: 'Pencetakan fisik 1.500 eksemplar telah diterima gudang PNB dan siap disalurkan.',
    pekerjaanAjak: [
      {
        id: 'ajak-51',
        namaPekerjaan: 'Koreksi Kesalahan Cetak Edisi Sebelumnya',
        kategori: 'Naskah',
        pic: 'Silvia Fukada',
        status: 'Selesai',
        targetSelesai: '15 Sep 2021',
      },
      {
        id: 'ajak-52',
        namaPekerjaan: 'Pembaruan Desain Cover Hardcover Emboss',
        kategori: 'Desain',
        pic: 'Desainer PNB',
        status: 'Selesai',
        targetSelesai: '01 Okt 2021',
      },
      {
        id: 'ajak-53',
        namaPekerjaan: 'Pencetakan 1.500 Eks Hardcover',
        kategori: 'Produksi',
        pic: 'Percetakan Gramasurya',
        status: 'Selesai',
        targetSelesai: '05 Nov 2021',
      },
      {
        id: 'ajak-54',
        namaPekerjaan: 'Quality Control & Serah Terima ke Gudang S-SALUR',
        kategori: 'Distribusi',
        pic: 'Logistik PNB',
        status: 'Selesai',
        targetSelesai: '10 Nov 2021',
      },
    ],
    checklists: [
      { id: 'chk-51', title: 'Pemeriksaan sampel 50 buku pertama dari percetakan', completed: true },
      { id: 'chk-52', title: 'Input data master ke Katalog Item S-SALUR', completed: true },
      { id: 'chk-53', title: 'Update stok gudang fisik', completed: true },
    ],
    createdAt: '2021-08-01',
    updatedAt: '2021-11-10',
  },
  {
    id: 'ongoing-6',
    kodeItem: 'B-046',
    namaItem: 'Buku Renungan Harian Dharma: 365 Mutiara',
    subNamaItem: 'Petikan Sutra & Komentar untuk Latihan Sehari-hari',
    jenisItem: 'Buku',
    proyekSapaId: 'proj-pnb-4',
    proyekSapaName: 'Penerbitan Buku Dharma Master Dagpo 2021',
    divisi: 'PNB',
    stage: 'not_started',
    prioritas: 'Sedang',
    picUtama: 'Silvia Fukada',
    targetTerbit: '15 Jan 2022',
    estimasiHalaman: 180,
    targetEksemplar: 2000,
    catatan: 'Naskah teks lengkap siap dikerjakan. Menunggu alokasi tim editor & desainer cover.',
    linkNaskah: 'https://docs.google.com/document/d/renungan-harian-dharma',
    tanggalMulaiAjak: '2021-11-15',
    dependsOnCardId: 'ongoing-5',
    dependsOnCardTitle: 'B-040 - Lamrim Chenmo Ringkas Edisi Revisi',
    pekerjaanAjak: [
      {
        id: 'ajak-61',
        namaPekerjaan: 'Editing Tata Bahasa & Istilah Dharma',
        kategori: 'Naskah',
        pic: 'Silvia Fukada',
        status: 'Belum Mulai',
        targetSelesai: '20 Des 2021',
      },
      {
        id: 'ajak-62',
        namaPekerjaan: 'Desain Layout & Tipografi Buku Renungan',
        kategori: 'Desain',
        pic: 'Desainer PNB',
        status: 'Belum Mulai',
        targetSelesai: '28 Des 2021',
      },
      {
        id: 'ajak-63',
        namaPekerjaan: 'Proofreading & Dummy Buku Saku',
        kategori: 'Produksi',
        pic: 'Tim Telaah PNB',
        status: 'Belum Mulai',
        targetSelesai: '05 Jan 2022',
      },
    ],
    checklists: [
      { id: 'chk-61', title: 'Pemeriksaan draft 365 petikan sutra', completed: true },
      { id: 'chk-62', title: 'Briefing tim desainer cover & layout', completed: false },
      { id: 'chk-63', title: 'Pendaftaran nomor ISBN Perpusnas', completed: false },
    ],
    createdAt: '2021-11-08',
    updatedAt: '2021-11-14',
  },
];

export const ONGOING_PNB_STORAGE_KEY = 'sapa_ongoing_create_item_salur_v1';

export function getOngoingItemSalurFromStorage(): OngoingItemSalurCard[] {
  try {
    const raw = localStorage.getItem(ONGOING_PNB_STORAGE_KEY);
    if (!raw) {
      saveOngoingItemSalurToStorage(INITIAL_ONGOING_CARDS);
      return INITIAL_ONGOING_CARDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-migrate any old 'pra_cetak' or 'review' stage to 'in_progress', ensure kendala array exists and migrate completion
      let migrated: OngoingItemSalurCard[] = parsed.map((item: OngoingItemSalurCard) => ({
        ...item,
        stage: (item.stage === ('review' as any) || item.stage === ('pra_cetak' as any)) ? 'in_progress' : item.stage,
        selesaiAt: item.stage === 'done' ? (item.selesaiAt || '10 Nov 2021, 15:00') : item.selesaiAt,
        kendala: Array.isArray(item.kendala)
          ? item.kendala
          : item.id === 'ongoing-1'
          ? (INITIAL_ONGOING_CARDS[0].kendala || [])
          : [],
      }));
      if (!migrated.some((c: OngoingItemSalurCard) => c.id === 'ongoing-6')) {
        const item6 = INITIAL_ONGOING_CARDS.find((c) => c.id === 'ongoing-6');
        if (item6) migrated.push(item6);
      }
      return migrated;
    }
    return INITIAL_ONGOING_CARDS;
  } catch (e) {
    console.error('Failed to load ongoing item salur from localStorage', e);
    return INITIAL_ONGOING_CARDS;
  }
}

export function saveOngoingItemSalurToStorage(items: OngoingItemSalurCard[]): void {
  try {
    localStorage.setItem(ONGOING_PNB_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save ongoing item salur to localStorage', e);
  }
}
