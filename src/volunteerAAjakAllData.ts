export interface VolunteerAAjakAllItem {
  id: string;
  kode: string;
  nama: string;
  panggilan: string;
  avatarLetter: string;
  avatarBg: string;
  terakhirAktif: string;
  peringkat: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | string;
  karya: string[];
  kategori?: 'Penerjemah' | 'Gambar' | 'Acara' | 'Lainnya' | string;
  isAktif?: boolean;
  cvUrl?: string;
}

export const INITIAL_VOLUNTEER_AAJAK_ALL: VolunteerAAjakAllItem[] = [
  {
    id: 'aajak-all-1',
    kode: '00031',
    nama: 'Agustino Ong',
    panggilan: 'Ko Agus',
    avatarLetter: 'A',
    avatarBg: '#14b8a6', // teal
    terakhirAktif: '2021',
    peringkat: 'Platinum',
    karya: [
      'Layout - Menjadi Buddha,',
      'Design Cover - Mengembalikan Budaya Belajar.',
    ],
    kategori: 'Gambar',
    isAktif: true,
    cvUrl: 'https://drive.google.com/file/d/1agustino-ong-cv/view',
  },
  {
    id: 'aajak-all-2',
    kode: '00019',
    nama: 'Cindy Budiman',
    panggilan: 'Ci Pao',
    avatarLetter: 'C',
    avatarBg: '#eab308', // amber
    terakhirAktif: '2019',
    peringkat: 'Silver',
    karya: [
      'Ketua Panitia - ILR 2021',
    ],
    kategori: 'Acara',
    isAktif: false,
  },
  {
    id: 'aajak-all-3',
    kode: '00018',
    nama: 'Silvia Fukada',
    panggilan: 'Ci Silvia',
    avatarLetter: 'S',
    avatarBg: '#64748b', // slate
    terakhirAktif: '2021',
    peringkat: 'Gold',
    karya: [
      'Penyunting - Menjadi Buddha',
    ],
    kategori: 'Penerjemah',
    isAktif: true,
  },
  {
    id: 'aajak-all-4',
    kode: '00800',
    nama: 'Bhadra Ksanti',
    panggilan: 'Sucek Shi Xian Jen',
    avatarLetter: 'B',
    avatarBg: '#0d9488', // teal-dark
    terakhirAktif: '2015',
    peringkat: 'Bronze',
    karya: [
      'Staff Konsumsi ILR 2021',
    ],
    kategori: 'Acara',
    isAktif: false,
  },
  {
    id: 'aajak-all-5',
    kode: '00102',
    nama: 'Hendra Wijaya',
    panggilan: 'Bro Hendra',
    avatarLetter: 'H',
    avatarBg: '#3b82f6', // blue
    terakhirAktif: '2021',
    peringkat: 'Gold',
    karya: [
      'Penerjemah Bahasa Jawa - Amerta Kebijaksanaan',
    ],
    kategori: 'Penerjemah',
    isAktif: true,
  },
  {
    id: 'aajak-all-6',
    kode: '00215',
    nama: 'Dewi Lestari',
    panggilan: 'Ci Dewi',
    avatarLetter: 'D',
    avatarBg: '#ec4899', // pink
    terakhirAktif: '2020',
    peringkat: 'Silver',
    karya: [
      'Penulis Naskah Artikel - Cerita Dhamma Seri 3',
    ],
    kategori: 'Penerjemah',
    isAktif: true,
  },
];

const STORAGE_KEY = 'sapa_volunteer_aajak_all_v1';

export const loadVolunteerAAjakAll = (): VolunteerAAjakAllItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load A-AJAK All volunteers from storage', e);
  }
  return INITIAL_VOLUNTEER_AAJAK_ALL;
};

export const saveVolunteerAAjakAll = (items: VolunteerAAjakAllItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save A-AJAK All volunteers to storage', e);
  }
};
