export interface PosKeuanganItem {
  id: string;
  namaPos: string;
  subTitle?: string;
  saldo: number;
  saldoAwal?: number;
  totalMasuk?: number;
  totalKeluar?: number;
  keterangan?: string;
  iconLetter: string;
  iconBg: string;
  logoUrl?: string;
  tipe?: 'Pemasukan' | 'Pengeluaran';
  coaNoAkun?: string;
  coaNamaAkun?: string;
}

export const initialPosKeuanganList: PosKeuanganItem[] = [
  {
    id: 'pos-1',
    namaPos: 'Penerbitan Buku Dharma',
    subTitle: 'Pos YPPLN',
    saldo: 0,
    saldoAwal: 0,
    keterangan: '-',
    iconLetter: 'P',
    iconBg: '#2D3748',
    tipe: 'Pemasukan',
    coaNoAkun: '10001',
    coaNamaAkun: 'Kas BCA Penerbitan',
  },
  {
    id: 'pos-2',
    namaPos: 'Kegiatan Retret',
    subTitle: 'Pos YPPLN',
    saldo: 0,
    saldoAwal: 0,
    keterangan: '-',
    iconLetter: 'K',
    iconBg: '#CF5340',
    tipe: 'Pemasukan',
    coaNoAkun: '10002',
    coaNamaAkun: 'Kas BCA Kegiatan Retret',
  },
  {
    id: 'pos-3',
    namaPos: 'Operasional Dharma',
    subTitle: 'Pos YPPLN',
    saldo: 0,
    saldoAwal: 0,
    keterangan: '-',
    iconLetter: 'O',
    iconBg: '#B0B5B9',
    tipe: 'Pemasukan',
    coaNoAkun: '10003',
    coaNamaAkun: 'Kas BCA Operasional Dharma',
  },
  {
    id: 'pos-4',
    namaPos: 'Operasional Non-Dharma',
    subTitle: 'Pos YPPLN',
    saldo: 0,
    saldoAwal: 0,
    keterangan: '-',
    iconLetter: 'O',
    iconBg: '#B0B5B9',
    tipe: 'Pemasukan',
    coaNoAkun: '10004',
    coaNamaAkun: 'Kas BCA Operasional Non-Dharma',
  },
];

const STORAGE_KEY = 'yppln_pos_keuangan_items';

export function getPosKeuanganFromStorage(): PosKeuanganItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialPosKeuanganList;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialPosKeuanganList;

    const initialMap = new Map(initialPosKeuanganList.map((p) => [p.namaPos.toLowerCase().trim(), p]));
    const initialIdMap = new Map(initialPosKeuanganList.map((p) => [p.id, p]));

    const coaMigration: Record<string, { no: string; name: string }> = {
      '10201': { no: '10001', name: 'Kas BCA Penerbitan' },
      '10204': { no: '10002', name: 'Kas BCA Kegiatan Retret' },
      '10203': { no: '10003', name: 'Kas BCA Operasional Dharma' },
      '10206': { no: '10004', name: 'Kas BCA Operasional Non-Dharma' },
    };

    return parsed.map((it: PosKeuanganItem) => {
      const match = initialIdMap.get(it.id) || initialMap.get((it.namaPos || '').toLowerCase().trim());
      let coaNo = it.coaNoAkun || match?.coaNoAkun;
      let coaNama = it.coaNamaAkun || match?.coaNamaAkun;

      if (coaNo && coaMigration[coaNo]) {
        coaNama = coaMigration[coaNo].name;
        coaNo = coaMigration[coaNo].no;
      }

      return {
        ...it,
        coaNoAkun: coaNo,
        coaNamaAkun: coaNama,
        saldoAwal: it.saldoAwal !== undefined ? it.saldoAwal : (it.saldo === 3000000000 ? 0 : (it.saldo || 0)),
      };
    });
  } catch (err) {
    console.error('Failed to load pos keuangan from storage:', err);
    return initialPosKeuanganList;
  }
}

export function savePosKeuanganToStorage(items: PosKeuanganItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pos keuangan to storage:', err);
  }
}

export interface PosKeuanganCardLogoConfig {
  mode: 'posKeuangan' | 'icon' | 'customImage';
  posKeuanganId?: string; // id of Pos Keuangan to mirror
  iconType?: string; // e.g. 'wallet', 'coins', 'landmark', etc.
  logoUrl?: string; // custom image url
  bgColor?: string; // background color
}

export const POS_KEUANGAN_CARD_LOGO_STORAGE_KEY = 'yppln_pos_keuangan_card_logo_v1';

export const DEFAULT_POS_KEUANGAN_CARD_LOGO: PosKeuanganCardLogoConfig = {
  mode: 'posKeuangan',
  posKeuanganId: 'pos-1',
  iconType: 'wallet',
  logoUrl: '',
  bgColor: '#2D3748',
};

export function getPosKeuanganCardLogoFromStorage(): PosKeuanganCardLogoConfig {
  try {
    const data = localStorage.getItem(POS_KEUANGAN_CARD_LOGO_STORAGE_KEY);
    if (!data) return DEFAULT_POS_KEUANGAN_CARD_LOGO;
    const parsed = JSON.parse(data);
    return { ...DEFAULT_POS_KEUANGAN_CARD_LOGO, ...parsed };
  } catch (err) {
    console.error('Failed to load pos keuangan card logo:', err);
    return DEFAULT_POS_KEUANGAN_CARD_LOGO;
  }
}

export function savePosKeuanganCardLogoToStorage(config: PosKeuanganCardLogoConfig): void {
  try {
    localStorage.setItem(POS_KEUANGAN_CARD_LOGO_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save pos keuangan card logo:', err);
  }
}

