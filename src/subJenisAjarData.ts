export interface SubJenisItemAjarItem {
  id: string;
  namaSubJenis: string;
  kode: string;
  pos?: string;
  iconLetter: string;
  iconBg?: string;
  iconType?: string;
  logoUrl?: string;
  keterangan?: string;
}

export const initialSubJenisAjarData: SubJenisItemAjarItem[] = [
  {
    id: 'sja-1',
    namaSubJenis: 'South East Asia Lamrim Festival',
    kode: 'SEALF',
    pos: '-',
    iconLetter: 'S',
    iconType: 'globe',
    iconBg: '#008d91',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sja-2',
    namaSubJenis: 'Indonesia Lamrim Retreat',
    kode: 'ILR',
    pos: '-',
    iconLetter: 'I',
    iconType: 'users',
    iconBg: '#0ea5e9',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sja-3',
    namaSubJenis: 'Nusantara Dharma Book Festival',
    kode: 'NDBF',
    pos: '-',
    iconLetter: 'N',
    iconType: 'book-open',
    iconBg: '#7c3aed',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sja-4',
    namaSubJenis: 'Lam-Talk',
    kode: 'LAMTALK',
    pos: '-',
    iconLetter: 'L',
    iconType: 'sparkles',
    iconBg: '#dc2626',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sja-5',
    namaSubJenis: 'Nonton Bareng Bedah Buku',
    kode: 'NOBARBEKU',
    pos: '-',
    iconLetter: 'N',
    iconType: 'video',
    iconBg: '#f39c12',
    keterangan: 'Sub-Jenis Item',
  },
];

const STORAGE_KEY = 'yppln_sub_jenis_ajar_items';

export function getSubJenisAjarFromStorage(): SubJenisItemAjarItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load sub jenis ajar items from storage:', err);
  }
  return initialSubJenisAjarData;
}

export function saveSubJenisAjarToStorage(items: SubJenisItemAjarItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save sub jenis ajar items to storage:', err);
  }
}
