import { VolunteerSSebarItem, VolunteerSkillRole } from './types';

export const VOLUNTEER_SKILL_ROLES: VolunteerSkillRole[] = [
  { key: 'layout', label: 'Lay-Out' },
  { key: 'coverDesign', label: 'Cover Design' },
  { key: 'illustrator', label: 'Illustrator' },
  { key: 'penulisArtikel', label: 'Penulis Artikel' },
  { key: 'penerjemah', label: 'Penerjemah' },
  { key: 'penyuntingJunior', label: 'Penyunting Junior' },
  { key: 'penyuntingAkhir', label: 'Penyunting Akhir (Penyelaras)' },
  { key: 'pemeriksaIndInd', label: 'Pemeriksa (Ind-Ind)' },
  { key: 'penerjemahIndJawa', label: 'Penerjemah (Ind-Jawa)' },
  { key: 'penyuntingIndJawa', label: 'Penyunting (Ind-Jawa)' },
  { key: 'penerjemahIndHokian', label: 'Penerjemah (Ind-Hokian)' },
  { key: 'penyalarasIndHokian', label: 'Penyalaras (Ind-Hokian)' },
  { key: 'penerjemahMandInd', label: 'Penerjemah (Mand-Ind)' },
  { key: 'penerjemahIndBali', label: 'Penerjemah (Ind-bali)' },
  { key: 'penerjemahIndSunda', label: 'Penerjemah (Ind-Sunda)' },
];

export const STATUS_JOB_ADVANCE_OPTIONS = ['-', 'Beginner', 'Intermediate', 'Advanced'];

export const SKILL_LEVEL_OPTIONS = ['-', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const INITIAL_VOLUNTEER_SSEBAR: VolunteerSSebarItem[] = [
  {
    id: 'vol-1',
    kode: '00031',
    nama: 'Agustino Ong',
    panggilan: 'Ko Agus',
    avatarLetter: 'A',
    avatarBg: '#0d9488', // teal
    status: 'Volunteer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081234567890',
    email: 'agustino.ong@example.com',
    skills: {
      layout: 'Beginner',
      coverDesign: 'Advanced',
      illustrator: 'Intermediate',
      penulisArtikel: '-',
      penerjemah: '-',
    },
    cvUrl: 'https://drive.google.com/file/d/1agustino-ong-cv/view',
  },
  {
    id: 'vol-2',
    kode: '00019',
    nama: 'Cindy Budiman',
    panggilan: 'Ci Pao',
    avatarLetter: 'C',
    avatarBg: '#eab308', // yellow
    status: 'Freelancer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081987654321',
    email: 'cindy.pao@example.com',
    skills: {
      layout: 'Intermediate',
      coverDesign: '-',
      illustrator: 'Advanced',
      penulisArtikel: 'Beginner',
    },
    cvUrl: 'https://drive.google.com/file/d/1cindy-budiman-cv/view',
  },
  {
    id: 'vol-3',
    kode: '00018',
    nama: 'Silvia Fukada',
    panggilan: 'Ci Silvia',
    avatarLetter: 'S',
    avatarBg: '#64748b', // slate
    status: 'Freelancer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081345678912',
    email: 'silvia.fukada@example.com',
    skills: {
      layout: '-',
      coverDesign: 'Intermediate',
      penerjemah: 'Advanced',
      penerjemahMandInd: 'Advanced',
    },
    cvUrl: 'https://drive.google.com/file/d/1silvia-fukada-cv/view',
  },
  {
    id: 'vol-4',
    kode: '00800',
    nama: 'Bhadra Ksanti',
    panggilan: 'Sucek Shi Xian Jen',
    avatarLetter: 'B',
    avatarBg: '#0f766e', // deep teal
    status: 'Volunteer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081123456789',
    email: 'bhadra.ksanti@example.com',
    skills: {
      layout: '-',
      coverDesign: 'Beginner',
      penyuntingAkhir: 'Advanced',
      penerjemahMandInd: 'Advanced',
      pemeriksaIndInd: 'Intermediate',
    },
    cvUrl: '',
  },
  {
    id: 'vol-5',
    kode: '00102',
    nama: 'Hendra Wijaya',
    panggilan: 'Bro Hendra',
    avatarLetter: 'H',
    avatarBg: '#3b82f6', // blue
    status: 'Volunteer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081298765432',
    skills: {
      layout: 'Advanced',
      coverDesign: 'Intermediate',
      penerjemahIndJawa: 'Advanced',
      penyuntingIndJawa: 'Intermediate',
    },
  },
  {
    id: 'vol-6',
    kode: '00215',
    nama: 'Dewi Lestari',
    panggilan: 'Ci Dewi',
    avatarLetter: 'D',
    avatarBg: '#ec4899', // pink
    status: 'Volunteer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081399887766',
    skills: {
      layout: '-',
      coverDesign: '-',
      penulisArtikel: 'Advanced',
      pemeriksaIndInd: 'Advanced',
      penyuntingJunior: 'Advanced',
    },
  },
  {
    id: 'vol-7',
    kode: '00320',
    nama: 'Tan Hok Seng',
    panggilan: 'Om Seng',
    avatarLetter: 'T',
    avatarBg: '#8b5cf6', // purple
    status: 'Volunteer',
    isAktif: false,
    periodeAktif: '1 Jan 2020 - 31 Des 2020',
    noHp: '081512345678',
    skills: {
      penerjemahIndHokian: 'Advanced',
      penyalarasIndHokian: 'Advanced',
      penerjemahMandInd: 'Intermediate',
    },
  },
  {
    id: 'vol-8',
    kode: '00405',
    nama: 'I Made Sudharma',
    panggilan: 'Bli Made',
    avatarLetter: 'M',
    avatarBg: '#f97316', // orange
    status: 'Volunteer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081876543210',
    skills: {
      penerjemahIndBali: 'Advanced',
      illustrator: 'Intermediate',
    },
  },
  {
    id: 'vol-9',
    kode: '00511',
    nama: 'Asep Sunandar',
    panggilan: 'Kang Asep',
    avatarLetter: 'A',
    avatarBg: '#10b981', // emerald
    status: 'Volunteer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081654321987',
    skills: {
      penerjemahIndSunda: 'Advanced',
      penulisArtikel: 'Intermediate',
    },
  },
];

const STORAGE_KEY = 'sapa_volunteers_aajak_ssebar_v1';

export const loadVolunteerSSebar = (): VolunteerSSebarItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load volunteers from storage', e);
  }
  return INITIAL_VOLUNTEER_SSEBAR;
};

export const saveVolunteerSSebar = (items: VolunteerSSebarItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save volunteers to storage', e);
  }
};
