export interface PromoChannelEntry {
  id: string;
  viaName: string;
  kodePromo: string;
}

export interface PromoTargetEntry {
  id: string;
  targetType: 'all' | 'karyawan' | 'identitas' | 'organisasi' | 'funneling' | 'sub-organisasi';
  targetValue: string;
  label: string;
}

export interface PromoDiscountEntry {
  id: string;
  unit: '%' | 'Rp';
  nominal: string;
  itemSalur: string;
}

export interface PromoBundleEntry {
  id: string;
  namaBundle: string;
  itemSalur: string;
  nominal: string;
}

export interface PromoSalurItem {
  id: string;
  namaPromo: string;
  subtitle: string;
  status: 'Ongoing' | 'Coming Soon' | 'Berakhir';
  tanggalMulai: string;
  tanggalSelesai: string;
  jamMulai: string;
  jamSelesai: string;
  persentaseKuota: string;
  keterangan: string;
  channels: string[];
  kodePromo: string[];
  // Extended form fields
  channelEntries?: PromoChannelEntry[];
  targetEntries?: PromoTargetEntry[];
  limitPromo?: string;
  kuotaPemakaian?: string;
  discounts?: PromoDiscountEntry[];
  bundles?: PromoBundleEntry[];
}

export const INITIAL_PROMO_SALUR: PromoSalurItem[] = [
  {
    id: 'promo-1',
    namaPromo: 'Promo Event 100th LIOH',
    subtitle: 'Diskon 20%',
    status: 'Ongoing',
    tanggalMulai: '12 Nov 2021',
    tanggalSelesai: '21 Nov 2021',
    jamMulai: '00:00 WIB',
    jamSelesai: '23.59 WIB',
    persentaseKuota: '8/∞',
    keterangan: 'Promo spesial diskon 20% untuk semua buku',
    channels: ['WhatsApp', 'Tokopedia', 'Shopee', 'Website Store'],
    kodePromo: ['SHOPEE20'],
    channelEntries: [
      { id: 'ch-1', viaName: 'WhatsApp', kodePromo: '' },
      { id: 'ch-2', viaName: 'Tokopedia', kodePromo: '' },
      { id: 'ch-3', viaName: 'Shopee', kodePromo: 'SHOPEE20' },
      { id: 'ch-4', viaName: 'Website Store', kodePromo: '' },
    ],
    targetEntries: [
      { id: 'tg-1', targetType: 'all', targetValue: '', label: 'All (Semua Pengguna)' },
    ],
    limitPromo: 'Tidak ada limit',
    discounts: [
      { id: 'disc-1', unit: '%', nominal: '20', itemSalur: '' },
    ],
  },
  {
    id: 'promo-2',
    namaPromo: 'Promo Spesial Lilo',
    subtitle: 'Diskon Rp25.000',
    status: 'Ongoing',
    tanggalMulai: '10 Nov 2021',
    tanggalSelesai: '30 Nov 2021',
    jamMulai: '00:00 WIB',
    jamSelesai: '23.59 WIB',
    persentaseKuota: '1/10',
    keterangan: 'Promo eksklusif untuk Identitas ID 10001 Lilo',
    channels: ['Call Center', 'WhatsApp'],
    kodePromo: ['LILO25'],
    channelEntries: [
      { id: 'ch-1', viaName: 'Call Center', kodePromo: '' },
      { id: 'ch-2', viaName: 'WhatsApp', kodePromo: 'LILO25' },
    ],
    targetEntries: [
      { id: 'tg-1', targetType: 'identitas', targetValue: '10001', label: '10001 Lilo' },
    ],
    limitPromo: 'Satu ID Pembeli hanya bisa pesan satu buah per Nama Item',
    discounts: [
      { id: 'disc-1', unit: 'Rp', nominal: '25000', itemSalur: '' },
    ],
  },
  {
    id: 'promo-3',
    namaPromo: 'Promo Khusus WhatsApp',
    subtitle: 'Diskon 30%',
    status: 'Ongoing',
    tanggalMulai: '01 Nov 2021',
    tanggalSelesai: '30 Nov 2021',
    jamMulai: '00:00 WIB',
    jamSelesai: '23.59 WIB',
    persentaseKuota: '15/50',
    keterangan: 'Hanya berlaku untuk pemesanan via WhatsApp',
    channels: ['WhatsApp'],
    kodePromo: ['WA30'],
    channelEntries: [
      { id: 'ch-1', viaName: 'WhatsApp', kodePromo: 'WA30' },
    ],
    targetEntries: [
      { id: 'tg-1', targetType: 'all', targetValue: '', label: 'All (Semua Pengguna)' },
    ],
    limitPromo: 'Tidak ada limit',
    discounts: [
      { id: 'disc-1', unit: '%', nominal: '30', itemSalur: '' },
    ],
  },
  {
    id: 'promo-4',
    namaPromo: 'Promo Buku Demi Kepentingan',
    subtitle: 'Diskon 50%',
    status: 'Ongoing',
    tanggalMulai: '01 Nov 2021',
    tanggalSelesai: '30 Nov 2021',
    jamMulai: '00:00 WIB',
    jamSelesai: '23.59 WIB',
    persentaseKuota: '20/100',
    keterangan: 'Diskon 50% khusus buku Demi Kepentingan Semua Makhluk',
    channels: ['Call Center', 'Shopee'],
    kodePromo: ['DEMI50'],
    channelEntries: [
      { id: 'ch-1', viaName: 'Call Center', kodePromo: '' },
      { id: 'ch-2', viaName: 'Shopee', kodePromo: 'DEMI50' },
    ],
    targetEntries: [
      { id: 'tg-1', targetType: 'all', targetValue: '', label: 'All (Semua Pengguna)' },
    ],
    limitPromo: 'Satu ID Pembeli hanya bisa pesan satu buah per Nama Item',
    discounts: [
      { id: 'disc-1', unit: '%', nominal: '50', itemSalur: 'Demi Kepentingan Semua Makhluk' },
    ],
  },
];

const STORAGE_KEY = 'sapa_promo_salur_list';

export function loadPromoSalur(): PromoSalurItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROMO_SALUR));
      return INITIAL_PROMO_SALUR;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with initial defaults if attributes like channelEntries/discounts are missing
      return parsed.map((item: PromoSalurItem) => {
        const initial = INITIAL_PROMO_SALUR.find((p) => p.id === item.id);
        if (initial) {
          // If stored initial promo lacks full channelEntries, merge from initial
          const hasMatchingEntries = item.channelEntries && item.channelEntries.length > 0;
          return {
            ...initial,
            ...item,
            channelEntries: hasMatchingEntries ? item.channelEntries : initial.channelEntries,
            channels: item.channels && item.channels.length > 0 ? item.channels : initial.channels,
            kodePromo: item.kodePromo && item.kodePromo.length > 0 ? item.kodePromo : initial.kodePromo,
            targetEntries: item.targetEntries && item.targetEntries.length > 0 ? item.targetEntries : initial.targetEntries,
            discounts: item.discounts && item.discounts.length > 0 ? item.discounts : initial.discounts,
            limitPromo: item.limitPromo || initial.limitPromo,
          };
        }
        return item;
      });
    }
    return INITIAL_PROMO_SALUR;
  } catch {
    return INITIAL_PROMO_SALUR;
  }
}

export function savePromoSalur(items: PromoSalurItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save promo salur', e);
  }
}
