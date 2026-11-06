import { VolunteerAJarItem, VolunteerSkillRole } from './types';
import { VOLUNTEER_SKILL_ROLES, SKILL_LEVEL_OPTIONS, STATUS_JOB_ADVANCE_OPTIONS } from './volunteerSSebarData';

export { VOLUNTEER_SKILL_ROLES, SKILL_LEVEL_OPTIONS, STATUS_JOB_ADVANCE_OPTIONS };
export const VOLUNTEER_AJAR_SKILL_ROLES = VOLUNTEER_SKILL_ROLES;

export const VOLUNTEER_AJAR_STORAGE_KEY = 'volunteer_ajar_data_v1';

export const INITIAL_VOLUNTEER_AJAR: VolunteerAJarItem[] = [
  {
    id: 'vol-ajar-1',
    kode: '00031',
    nama: 'Agustino Ong',
    panggilan: 'Ko Agus',
    avatarLetter: 'A',
    avatarBg: '#0d9488',
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
    id: 'vol-ajar-2',
    kode: '00019',
    nama: 'Cindy Budiman',
    panggilan: 'Ci Pao',
    avatarLetter: 'C',
    avatarBg: '#eab308',
    status: 'Freelancer',
    isAktif: true,
    periodeAktif: '1 Jan 2021 - 15 Nov 2021',
    noHp: '081987654321',
    email: 'cindy.pao@example.com',
    skills: {
      layout: 'Intermediate',
      coverDesign: 'Beginner',
      illustrator: 'Expert',
      penulisArtikel: '-',
      penerjemah: '-',
    },
    cvUrl: '',
  },
];

export function loadVolunteerAJar(): VolunteerAJarItem[] {
  try {
    const raw = localStorage.getItem(VOLUNTEER_AJAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return INITIAL_VOLUNTEER_AJAR;
}

export function saveVolunteerAJar(items: VolunteerAJarItem[]): void {
  try {
    localStorage.setItem(VOLUNTEER_AJAR_STORAGE_KEY, JSON.stringify(items));
  } catch (_) {}
}
