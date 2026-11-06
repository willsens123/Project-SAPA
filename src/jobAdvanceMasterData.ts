import { JobAdvanceMasterItem, StatusJobAdvanceMasterItem } from './types';

export const INITIAL_JOB_ADVANCE_MASTER: JobAdvanceMasterItem[] = [
  {
    id: 'ja-1',
    key: 'layout',
    nama: 'Lay-Out',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Gambar',
  },
  {
    id: 'ja-2',
    key: 'coverDesign',
    nama: 'Cover Design',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Gambar',
  },
  {
    id: 'ja-3',
    key: 'illustrator',
    nama: 'Illustrator',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Gambar',
  },
  {
    id: 'ja-4',
    key: 'penulisArtikel',
    nama: 'Penulis Artikel',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-5',
    key: 'penerjemah',
    nama: 'Penerjemah',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-6',
    key: 'penyuntingJunior',
    nama: 'Penyunting Junior',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-7',
    key: 'penyuntingAkhir',
    nama: 'Penyunting Akhir (Penyelaras)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-8',
    key: 'pemeriksaIndInd',
    nama: 'Pemeriksa (Ind-Ind)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-9',
    key: 'penerjemahIndJawa',
    nama: 'Penerjemah (Ind-Jawa)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-10',
    key: 'penyuntingIndJawa',
    nama: 'Penyunting (Ind-Jawa)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-11',
    key: 'penerjemahIndHokian',
    nama: 'Penerjemah (Ind-Hokian)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-12',
    key: 'penyalarasIndHokian',
    nama: 'Penyalaras (Ind-Hokian)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-13',
    key: 'penerjemahMandInd',
    nama: 'Penerjemah (Mand-Ind)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-14',
    key: 'penerjemahIndBali',
    nama: 'Penerjemah (Ind-Bali)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
  {
    id: 'ja-15',
    key: 'penerjemahIndSunda',
    nama: 'Penerjemah (Ind-Sunda)',
    statusJobAdvance: '-. Beginner, Intermediate, Advanced',
    keterangan: 'Tulisan',
  },
];

export const INITIAL_STATUS_JOB_ADVANCE_MASTER: StatusJobAdvanceMasterItem[] = [
  { id: 'sja-1', nama: '-' },
  { id: 'sja-2', nama: 'Beginner' },
  { id: 'sja-3', nama: 'Intermediate' },
  { id: 'sja-4', nama: 'Advanced' },
];

const JOB_ADVANCE_STORAGE_KEY = 'sapa_job_advance_master_v1';
const STATUS_JOB_ADVANCE_STORAGE_KEY = 'sapa_status_job_advance_master_v1';

export function loadJobAdvanceMaster(): JobAdvanceMasterItem[] {
  try {
    const saved = localStorage.getItem(JOB_ADVANCE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading job advance master:', err);
  }
  return INITIAL_JOB_ADVANCE_MASTER;
}

export function saveJobAdvanceMaster(items: JobAdvanceMasterItem[]): void {
  try {
    localStorage.setItem(JOB_ADVANCE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving job advance master:', err);
  }
}

export function loadStatusJobAdvanceMaster(): StatusJobAdvanceMasterItem[] {
  try {
    const saved = localStorage.getItem(STATUS_JOB_ADVANCE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading status job advance master:', err);
  }
  return INITIAL_STATUS_JOB_ADVANCE_MASTER;
}

export function saveStatusJobAdvanceMaster(items: StatusJobAdvanceMasterItem[]): void {
  try {
    localStorage.setItem(STATUS_JOB_ADVANCE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving status job advance master:', err);
  }
}
