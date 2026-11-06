export interface PosPemasukanAllocation {
  id: string;
  posKeuanganId: string;
  namaPosKeuangan: string;
  subTitle?: string;
  persentase: number; // e.g. 20, 30, 100
  keterangan?: string;
  iconLetter?: string;
  iconBg?: string;
}

export interface PosPemasukanGroup {
  id: string;
  namaPosPemasukan: string;
  subTitle?: string;
  iconLetter: string;
  iconBg: string;
  logoUrl?: string;
  allocations: PosPemasukanAllocation[];
}

export const initialPosPemasukanList: PosPemasukanGroup[] = [
  {
    id: 'pemasukan-1',
    namaPosPemasukan: 'Pemasukan YPPLN',
    subTitle: 'Pos Pemasukan',
    iconLetter: 'P',
    iconBg: '#2D3748',
    allocations: [
      {
        id: 'alloc-1-1',
        posKeuanganId: 'pos-1',
        namaPosKeuangan: 'Penerbitan Buku Dharma',
        subTitle: 'Pos YPPLN',
        persentase: 20,
        keterangan: '-',
        iconLetter: 'P',
        iconBg: '#2D3748',
      },
      {
        id: 'alloc-1-2',
        posKeuanganId: 'pos-2',
        namaPosKeuangan: 'Kegiatan Retret',
        subTitle: 'Pos YPPLN',
        persentase: 20,
        keterangan: '-',
        iconLetter: 'K',
        iconBg: '#CF5340',
      },
      {
        id: 'alloc-1-3',
        posKeuanganId: 'pos-3',
        namaPosKeuangan: 'Operasional Dharma',
        subTitle: 'Pos YPPLN',
        persentase: 30,
        keterangan: '-',
        iconLetter: 'O',
        iconBg: '#B0B5B9',
      },
      {
        id: 'alloc-1-4',
        posKeuanganId: 'pos-4',
        namaPosKeuangan: 'Operasional Non-Dharma',
        subTitle: 'Pos YPPLN',
        persentase: 30,
        keterangan: '-',
        iconLetter: 'O',
        iconBg: '#B0B5B9',
      },
    ],
  },
  {
    id: 'pemasukan-2',
    namaPosPemasukan: 'Pemasukan Khusus Operasional',
    subTitle: 'Pos Pemasukan',
    iconLetter: 'P',
    iconBg: '#2D3748',
    allocations: [
      {
        id: 'alloc-2-1',
        posKeuanganId: 'pos-4',
        namaPosKeuangan: 'Operasional Non-Dharma',
        subTitle: 'Pos YPPLN',
        persentase: 100,
        keterangan: '-',
        iconLetter: 'O',
        iconBg: '#B0B5B9',
      },
    ],
  },
  {
    id: 'pemasukan-3',
    namaPosPemasukan: 'Pemasukan Khusus Penerbitan',
    subTitle: 'Pos Pemasukan',
    iconLetter: 'P',
    iconBg: '#2D3748',
    allocations: [
      {
        id: 'alloc-3-1',
        posKeuanganId: 'pos-1',
        namaPosKeuangan: 'Penerbitan Buku Dharma',
        subTitle: 'Pos YPPLN',
        persentase: 100,
        keterangan: '-',
        iconLetter: 'P',
        iconBg: '#2D3748',
      },
    ],
  },
];

const STORAGE_KEY = 'yppln_pos_pemasukan_items';

export function getPosPemasukanFromStorage(): PosPemasukanGroup[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialPosPemasukanList;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialPosPemasukanList;
  } catch (err) {
    console.error('Failed to load pos pemasukan from storage:', err);
    return initialPosPemasukanList;
  }
}

export function savePosPemasukanToStorage(items: PosPemasukanGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pos pemasukan to storage:', err);
  }
}

export interface PosPemasukanCardLogoConfig {
  mode: 'posPemasukan' | 'icon' | 'customImage';
  posPemasukanId?: string; // ID of Pos Pemasukan to mirror
  iconType?: string; // e.g. 'coins', 'wallet', 'landmark', 'building', 'shopping-cart', etc.
  logoUrl?: string; // Custom image URL or data URI
  bgColor?: string; // Hex color for background
}

export const POS_PEMASUKAN_CARD_LOGO_STORAGE_KEY = 'yppln_pos_pemasukan_card_logo_v1';

export const DEFAULT_POS_PEMASUKAN_CARD_LOGO: PosPemasukanCardLogoConfig = {
  mode: 'posPemasukan',
  posPemasukanId: 'pemasukan-1',
  iconType: 'coins',
  logoUrl: '',
  bgColor: '#008d91',
};

export function getPosPemasukanCardLogoFromStorage(): PosPemasukanCardLogoConfig {
  try {
    const data = localStorage.getItem(POS_PEMASUKAN_CARD_LOGO_STORAGE_KEY);
    if (!data) return DEFAULT_POS_PEMASUKAN_CARD_LOGO;
    const parsed = JSON.parse(data);
    return { ...DEFAULT_POS_PEMASUKAN_CARD_LOGO, ...parsed };
  } catch (err) {
    console.error('Failed to load pos pemasukan card logo:', err);
    return DEFAULT_POS_PEMASUKAN_CARD_LOGO;
  }
}

export function savePosPemasukanCardLogoToStorage(config: PosPemasukanCardLogoConfig): void {
  try {
    localStorage.setItem(POS_PEMASUKAN_CARD_LOGO_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save pos pemasukan card logo:', err);
  }
}

