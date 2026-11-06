export interface SubJenisItemDonasiItem {
  id: string;
  namaSubJenis: string;
  kode: string;
  pos?: string;
  iconLetter?: string;
  iconBg?: string;
  iconType?: string;
  logoUrl?: string;
  keterangan?: string;
}

export const INITIAL_SUB_JENIS_DONASI: SubJenisItemDonasiItem[] = [
  {
    id: 'sjd-1',
    namaSubJenis: 'Dharma Patron Rutin',
    kode: 'DPR',
    pos: '-',
    iconLetter: 'D',
    iconType: 'book-open',
    iconBg: '#008d91',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sjd-2',
    namaSubJenis: 'Dharma Patron Non-Rutin',
    kode: 'DPN',
    pos: '-',
    iconLetter: 'D',
    iconType: 'sparkles',
    iconBg: '#008d91',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sjd-3',
    namaSubJenis: 'Donasi Buku Berbayar',
    kode: 'DBB',
    pos: '-',
    iconLetter: 'B',
    iconType: 'book',
    iconBg: '#008d91',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sjd-4',
    namaSubJenis: 'Donasi Operasional',
    kode: 'DOP',
    pos: '-',
    iconLetter: 'O',
    iconType: 'boxes',
    iconBg: '#f39c12',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sjd-5',
    namaSubJenis: 'Donasi Penerbitan Buku',
    kode: 'DPB',
    pos: '-',
    iconLetter: 'P',
    iconType: 'book-open',
    iconBg: '#5e35b1',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sjd-6',
    namaSubJenis: 'Kathina Dana',
    kode: 'KD',
    pos: '-',
    iconLetter: 'K',
    iconType: 'gift',
    iconBg: '#e05d44',
    keterangan: 'Sub-Jenis Item',
  },
  {
    id: 'sjd-7',
    namaSubJenis: 'Event Donasi',
    kode: 'EVE',
    pos: '-',
    iconLetter: 'E',
    iconType: 'calendar',
    iconBg: '#10b981',
    keterangan: 'Sub-Jenis Item',
  },
];

export const getSubJenisDonasiFromStorage = (): SubJenisItemDonasiItem[] => {
  try {
    const saved = localStorage.getItem('yppln_sub_jenis_donasi');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse sub_jenis_donasi from localStorage:', e);
  }
  return INITIAL_SUB_JENIS_DONASI;
};

export const saveSubJenisDonasiToStorage = (items: SubJenisItemDonasiItem[]): void => {
  try {
    localStorage.setItem('yppln_sub_jenis_donasi', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save sub_jenis_donasi to localStorage:', e);
  }
};
