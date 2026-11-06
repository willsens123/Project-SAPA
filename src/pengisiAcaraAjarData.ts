export interface PengisiAcaraItemAjarItem {
  id: string;
  namaPengisiAcara: string;
  keterangan?: string;
}

export const initialPengisiAcaraAjarData: PengisiAcaraItemAjarItem[] = [
  {
    id: 'paa-1',
    namaPengisiAcara: 'Pembicara',
    keterangan: '-',
  },
  {
    id: 'paa-2',
    namaPengisiAcara: 'Moderator',
    keterangan: '-',
  },
];

const STORAGE_KEY = 'yppln_pengisi_acara_ajar_items';

export function getPengisiAcaraAjarFromStorage(): PengisiAcaraItemAjarItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load pengisi acara ajar items from storage:', err);
  }
  return initialPengisiAcaraAjarData;
}

export function savePengisiAcaraAjarToStorage(items: PengisiAcaraItemAjarItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pengisi acara ajar items to storage:', err);
  }
}
