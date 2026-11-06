export interface PosPengeluaranAllocation {
  id: string;
  posKeuanganId: string;
  namaPosKeuangan: string;
  subTitle?: string;
  persentase: number; // e.g. 50, 100
  keterangan?: string;
  iconLetter?: string;
  iconBg?: string;
}

export interface PosPengeluaranGroup {
  id: string;
  namaPosPengeluaran: string;
  subTitle?: string;
  iconLetter: string;
  iconBg: string;
  logoUrl?: string;
  allocations: PosPengeluaranAllocation[];
}

export const initialPosPengeluaranList: PosPengeluaranGroup[] = [
  {
    id: 'pengeluaran-1',
    namaPosPengeluaran: 'Pengeluaran YPPLN',
    subTitle: 'Pos Pengeluaran',
    iconLetter: 'P',
    iconBg: '#2D3748',
    allocations: [
      {
        id: 'alloc-out-1-1',
        posKeuanganId: 'pos-3',
        namaPosKeuangan: 'Operasional Dharma',
        subTitle: 'Pos YPPLN',
        persentase: 50,
        keterangan: '-',
        iconLetter: 'O',
        iconBg: '#B0B5B9',
      },
      {
        id: 'alloc-out-1-2',
        posKeuanganId: 'pos-4',
        namaPosKeuangan: 'Operasional Non-Dharma',
        subTitle: 'Pos YPPLN',
        persentase: 50,
        keterangan: '-',
        iconLetter: 'O',
        iconBg: '#B0B5B9',
      },
    ],
  },
  {
    id: 'pengeluaran-2',
    namaPosPengeluaran: 'Pengeluaran Khusus Operasional',
    subTitle: 'Pos Pengeluaran',
    iconLetter: 'P',
    iconBg: '#2D3748',
    allocations: [
      {
        id: 'alloc-out-2-1',
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
    id: 'pengeluaran-3',
    namaPosPengeluaran: 'Pengeluaran Khusus Penerbitan',
    subTitle: 'Pos Pengeluaran',
    iconLetter: 'P',
    iconBg: '#2D3748',
    allocations: [
      {
        id: 'alloc-out-3-1',
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

const STORAGE_KEY = 'yppln_pos_pengeluaran_items_v1';

export function getPosPengeluaranFromStorage(): PosPengeluaranGroup[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialPosPengeluaranList;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialPosPengeluaranList;
  } catch (err) {
    console.error('Failed to load pos pengeluaran from storage:', err);
    return initialPosPengeluaranList;
  }
}

export function savePosPengeluaranToStorage(items: PosPengeluaranGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pos pengeluaran to storage:', err);
  }
}

export interface PosPengeluaranCardLogoConfig {
  mode: 'posPengeluaran' | 'icon' | 'customImage';
  posPengeluaranId?: string;
  iconType?: string;
  logoUrl?: string;
  bgColor?: string;
}

export const POS_PENGELUARAN_CARD_LOGO_STORAGE_KEY = 'yppln_pos_pengeluaran_card_logo_v1';

export const DEFAULT_POS_PENGELUARAN_CARD_LOGO: PosPengeluaranCardLogoConfig = {
  mode: 'posPengeluaran',
  posPengeluaranId: 'pengeluaran-1',
  iconType: 'receipt',
  logoUrl: '',
  bgColor: '#2D3748',
};

export function getPosPengeluaranCardLogoFromStorage(): PosPengeluaranCardLogoConfig {
  try {
    const data = localStorage.getItem(POS_PENGELUARAN_CARD_LOGO_STORAGE_KEY);
    if (!data) return DEFAULT_POS_PENGELUARAN_CARD_LOGO;
    const parsed = JSON.parse(data);
    return { ...DEFAULT_POS_PENGELUARAN_CARD_LOGO, ...parsed };
  } catch (err) {
    console.error('Failed to load pos pengeluaran card logo:', err);
    return DEFAULT_POS_PENGELUARAN_CARD_LOGO;
  }
}

export function savePosPengeluaranCardLogoToStorage(config: PosPengeluaranCardLogoConfig): void {
  try {
    localStorage.setItem(POS_PENGELUARAN_CARD_LOGO_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save pos pengeluaran card logo:', err);
  }
}
