export interface AlokasiSalurItemRow {
  productId: string;
  title: string;
  code?: string;
  coverKey?: string;
  price: number;
  quantity: number;
  needDiscount: boolean;
  discountType: 'percentage' | 'nominal';
  discountValue: number;
  discountReason?: string;
  subtotal: number;
}

export interface AlokasiDonasiSalurRecord {
  id: string;
  alokasiNumber: string;
  itemDonasiId: string;
  itemDonasiName: string;
  itemDonasiSubtitle?: string;
  proyekSapa?: string;
  penerima: {
    identitasId?: string;
    nama: string;
    telepon: string;
    alamat: string;
    kota: string;
    provinsi: string;
    kodepos: string;
    catatan?: string;
  };
  items: AlokasiSalurItemRow[];
  ongkir: {
    ekspedisi: string;
    biaya: number;
    keterangan?: string;
  };
  totalBukuNormal: number;
  totalPotongan: number;
  totalBukuNet: number;
  totalOngkir: number;
  grandTotal: number;
  tanggal: string;
  status: 'Ditandai & Masuk Transaksi' | 'Draft';
  salurOrderId?: string;
  salurOrderNumber?: string;
  createdAt: string;
}

export const INITIAL_ALOKASI_HISTORY: AlokasiDonasiSalurRecord[] = [
  {
    id: 'alk-1',
    alokasiNumber: 'ALK-211110-001',
    itemDonasiId: 'item-donasi-1',
    itemDonasiName: 'Kathina 2021',
    itemDonasiSubtitle: 'Kathina Dana - MAD',
    penerima: {
      identitasId: '10001',
      nama: 'Wihara Ekayana Arama (Sangha Perpustakaan)',
      telepon: '0812-3456-7890',
      alamat: 'Jl. Mangga II No. 8, Duri Kepa, Kebon Jeruk',
      kota: 'Jakarta Barat',
      provinsi: 'DKI Jakarta',
      kodepos: '11510',
      catatan: 'Paket Kathina Ashoka untuk 25 Bhikkhu Sangha',
    },
    items: [
      {
        productId: 'book-1',
        title: 'Jalan Menuju Kemahatahuan',
        code: 'JMK - 2021',
        coverKey: 'jalan-menuju',
        price: 125000,
        quantity: 25,
        needDiscount: true,
        discountType: 'percentage',
        discountValue: 20,
        discountReason: 'Subsidi Donasi Kathina 20%',
        subtotal: 2500000,
      },
      {
        productId: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        code: 'BSM - 2021',
        coverKey: 'demi-kepentingan',
        price: 89000,
        quantity: 25,
        needDiscount: true,
        discountType: 'percentage',
        discountValue: 20,
        discountReason: 'Subsidi Donasi Kathina 20%',
        subtotal: 1780000,
      },
    ],
    ongkir: {
      ekspedisi: 'TIKI ECO',
      biaya: 75000,
      keterangan: 'Kardus Besar 15kg',
    },
    totalBukuNormal: 5350000,
    totalPotongan: 1070000,
    totalBukuNet: 4280000,
    totalOngkir: 75000,
    grandTotal: 4355000,
    tanggal: '10 Nov 2021',
    status: 'Ditandai & Masuk Transaksi',
    salurOrderId: 'order-1',
    salurOrderNumber: 'CC 211110001',
    createdAt: '2021-11-10T10:00:00Z',
  },
  {
    id: 'alk-2',
    alokasiNumber: 'ALK-211112-002',
    itemDonasiId: 'item-donasi-1',
    itemDonasiName: 'Kathina 2021',
    itemDonasiSubtitle: 'Kathina Dana - MAD',
    penerima: {
      identitasId: '10002',
      nama: 'Padepokan Dhammadipa Arama',
      telepon: '0813-8889-0012',
      alamat: 'Jl. Raya Mojorejo No. 34, Junrejo',
      kota: 'Batu',
      provinsi: 'Jawa Timur',
      kodepos: '65322',
      catatan: 'Penyaluran Kathina 2021 - Bimbisara',
    },
    items: [
      {
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        code: 'BMB - 2021',
        coverKey: 'menjadi-buddha',
        price: 125000,
        quantity: 30,
        needDiscount: true,
        discountType: 'nominal',
        discountValue: 25000,
        discountReason: 'Potongan Khusus Penyaluran Wihara',
        subtotal: 3000000,
      },
    ],
    ongkir: {
      ekspedisi: 'JNE REG',
      biaya: 120000,
      keterangan: 'Paket 12kg',
    },
    totalBukuNormal: 3750000,
    totalPotongan: 750000,
    totalBukuNet: 3000000,
    totalOngkir: 120000,
    grandTotal: 3120000,
    tanggal: '12 Nov 2021',
    status: 'Ditandai & Masuk Transaksi',
    salurOrderId: 'order-2',
    salurOrderNumber: 'CC 211112002',
    createdAt: '2021-11-12T14:30:00Z',
  },
];

const ALOKASI_STORAGE_KEY = 'yppln_alokasi_donasi_salur_history_v1';

export function loadAlokasiDonasiSalurHistory(): AlokasiDonasiSalurRecord[] {
  try {
    const saved = localStorage.getItem(ALOKASI_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load alokasi donasi history', e);
  }
  return INITIAL_ALOKASI_HISTORY;
}

export function saveAlokasiDonasiSalurHistory(items: AlokasiDonasiSalurRecord[]): void {
  try {
    localStorage.setItem(ALOKASI_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save alokasi donasi history', e);
  }
}
