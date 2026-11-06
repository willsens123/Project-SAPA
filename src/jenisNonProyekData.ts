import { JenisNonProyekItem } from './types';

export const JENIS_NON_PROYEK_STORAGE_KEY = 'sapa_jenis_non_proyek_todo_list_v1';

export const INITIAL_JENIS_NON_PROYEK: JenisNonProyekItem[] = [
  {
    id: 'jnp-1',
    nama: 'Pekerjaan Harian',
    warnaKartu: '#9fa8da', // Soft periwinkle/lavender matching image.png exactly
    keterangan: 'Pekerjaan operasional dan tugas rutin harian',
  },
  {
    id: 'jnp-2',
    nama: 'Kegiatan Operasional',
    warnaKartu: '#2dd4bf', // Teal
    keterangan: 'Kegiatan umum operasional non-proyek',
  },
  {
    id: 'jnp-3',
    nama: 'Rapat & Evaluasi Mingguan',
    warnaKartu: '#60a5fa', // Sky Blue
    keterangan: 'Rapat koordinasi dan evaluasi mingguan divisi',
  },
  {
    id: 'jnp-4',
    nama: 'Pelatihan & Workshop Internal',
    warnaKartu: '#fbbf24', // Amber
    keterangan: 'Program pelatihan staf dan pengembangan skill',
  },
  {
    id: 'jnp-5',
    nama: 'Administrasi & Arsip Kantor',
    warnaKartu: '#f87171', // Coral Rose
    keterangan: 'Administrasi pembukuan, persuratan, dan arsip',
  },
];

export const COLOR_PALETTE_JENIS_NON_PROYEK: { label: string; color: string }[] = [
  { label: 'Periwinkle (Default)', color: '#9fa8da' },
  { label: 'Indigo', color: '#818cf8' },
  { label: 'Sky Blue', color: '#60a5fa' },
  { label: 'Teal', color: '#2dd4bf' },
  { label: 'Emerald Mint', color: '#34d399' },
  { label: 'Amber Yellow', color: '#fbbf24' },
  { label: 'Orange', color: '#fb923c' },
  { label: 'Coral Rose', color: '#f87171' },
  { label: 'Purple Lavender', color: '#c084fc' },
  { label: 'Pink', color: '#f472b6' },
  { label: 'Slate Grey', color: '#94a3b8' },
  { label: 'Cyan Aqua', color: '#38bdf8' },
];

export const getJenisNonProyekFromStorage = (): JenisNonProyekItem[] => {
  try {
    const raw = localStorage.getItem(JENIS_NON_PROYEK_STORAGE_KEY);
    if (!raw) return INITIAL_JENIS_NON_PROYEK;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load jenis non-proyek from storage', e);
  }
  return INITIAL_JENIS_NON_PROYEK;
};

export const saveJenisNonProyekToStorage = (items: JenisNonProyekItem[]): void => {
  try {
    localStorage.setItem(JENIS_NON_PROYEK_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save jenis non-proyek to storage', e);
  }
};
