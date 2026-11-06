export interface JenisAcaraItemAjarItem {
  id: string;
  namaJenisAcara: string;
  kode: string;
  pos?: string;
  iconLetter: string;
  iconBg?: string;
  keterangan?: string;
}

export const initialJenisAcaraAjarData: JenisAcaraItemAjarItem[] = [
  {
    id: 'jaa-1',
    namaJenisAcara: 'Talkshow',
    kode: '?',
    pos: '-',
    iconLetter: 'S',
    iconBg: '#5A6D7C',
    keterangan: 'Jenis Acara',
  },
  {
    id: 'jaa-2',
    namaJenisAcara: 'Bedah Buku',
    kode: '?',
    pos: '-',
    iconLetter: 'I',
    iconBg: '#0ea5e9',
    keterangan: 'Jenis Acara',
  },
];

const STORAGE_KEY = 'yppln_jenis_acara_ajar_items';

export function getJenisAcaraAjarFromStorage(): JenisAcaraItemAjarItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load jenis acara ajar items from storage:', err);
  }
  return initialJenisAcaraAjarData;
}

export function saveJenisAcaraAjarToStorage(items: JenisAcaraItemAjarItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save jenis acara ajar items to storage:', err);
  }
}
