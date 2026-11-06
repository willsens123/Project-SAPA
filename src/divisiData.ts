import { DivisiItem } from './types';

export type { DivisiItem };

export const DIVISI_STORAGE_KEY = 'sapa_master_divisi_v1';

export const INITIAL_DIVISI: DivisiItem[] = [
  { id: 'div-1', namaDivisi: 'UMM', keterangan: '-' },
  { id: 'div-2', namaDivisi: 'PNB', keterangan: '-' },
  { id: 'div-3', namaDivisi: 'MAD', keterangan: '-' },
  { id: 'div-4', namaDivisi: 'FUN', keterangan: '-' },
  { id: 'div-5', namaDivisi: 'EVE', keterangan: '-' },
  { id: 'div-6', namaDivisi: 'CPR', keterangan: '-' },
  { id: 'div-7', namaDivisi: 'MRK', keterangan: '-' },
  { id: 'div-8', namaDivisi: 'CAM', keterangan: '-' },
  { id: 'div-9', namaDivisi: 'OPS', keterangan: '-' },
  { id: 'div-10', namaDivisi: 'PRO', keterangan: '-' },
  { id: 'div-11', namaDivisi: 'MED', keterangan: '-' },
  { id: 'div-12', namaDivisi: 'IT', keterangan: '-' },
  { id: 'div-13', namaDivisi: 'KEU', keterangan: 'Keuangan' },
];

export function getDivisiFromStorage(): DivisiItem[] {
  try {
    const raw = localStorage.getItem(DIVISI_STORAGE_KEY);
    if (!raw) {
      saveDivisiToStorage(INITIAL_DIVISI);
      return INITIAL_DIVISI;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (!parsed.some((d: DivisiItem) => d.namaDivisi === 'KEU')) {
        parsed.push({ id: 'div-13', namaDivisi: 'KEU', keterangan: 'Keuangan' });
        saveDivisiToStorage(parsed);
      }
      return parsed;
    }
    return INITIAL_DIVISI;
  } catch (e) {
    console.error('Failed to load divisi from localStorage', e);
    return INITIAL_DIVISI;
  }
}

export function saveDivisiToStorage(items: DivisiItem[]): void {
  try {
    localStorage.setItem(DIVISI_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save divisi to localStorage', e);
  }
}
