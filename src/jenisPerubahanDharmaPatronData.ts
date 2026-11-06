import { JenisPerubahanDharmaPatronItem } from './types';

export const INITIAL_JENIS_PERUBAHAN_DPR: JenisPerubahanDharmaPatronItem[] = [
  { id: 'jp-1', nama: 'Mengubah nominal' },
  { id: 'jp-2', nama: 'Pemutihan' },
  { id: 'jp-3', nama: 'Berhenti' },
];

const STORAGE_KEY = 'sapa_jenis_perubahan_dpr_v1';

export const loadJenisPerubahanDPR = (): JenisPerubahanDharmaPatronItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load jenis perubahan DPR from storage', e);
  }
  return INITIAL_JENIS_PERUBAHAN_DPR;
};

export const saveJenisPerubahanDPR = (items: JenisPerubahanDharmaPatronItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save jenis perubahan DPR to storage', e);
  }
};
