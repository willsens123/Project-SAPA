export interface SubJenisReportConfig {
  id: string;
  nama: string;
  kode: string;
  iconType: 'cart' | 'globe' | 'book' | 'device' | 'shirt' | 'file' | 'package';
  color?: string;
}

export interface SalurItemReportConfig {
  id: string;
  nama: string;
  subJenis: string;
  kode: string;
  unit: string;
  hargaSatuan: number;
  iconType: 'book' | 'cart' | 'globe' | 'device' | 'shirt' | 'file' | 'package';
}

export interface CustomerItemYearlyDetail {
  qty: number;
  totalHarga: number;
  unit: string;
}

export interface CustomerItemBreakdown {
  namaItem: string;
  subJenis: string;
  qty: number;
  unit: string;
  totalHarga: number;
  yearly?: Record<number, CustomerItemYearlyDetail>;
}

export interface CustomerSalurYearlyStat {
  nominal: number;
  itemQty: number;
  unit: string;
  bySubJenis?: Record<string, { nominal: number; itemQty: number }>;
}

export interface CustomerSalurReportItem {
  id: string;
  customerCode: string;
  namaLengkap: string;
  panggilan: string;
  avatarInitial: string;
  avatarBg: string; // hex or tailwind class
  allTime: {
    nominal: number;
    itemQty: number;
    unit: string;
  };
  yearlyData: Record<number, CustomerSalurYearlyStat>;
  itemBreakdown?: CustomerItemBreakdown[];
}

export const INITIAL_SUB_JENIS_REPORT_OPTIONS: SubJenisReportConfig[] = [
  { id: 'sj-1', nama: 'Buku Berbayar', kode: 'BB', iconType: 'cart' },
  { id: 'sj-2', nama: 'Buku Tidak Berbayar', kode: 'BTB', iconType: 'globe' },
  { id: 'sj-3', nama: 'Buku Non-YPPLN', kode: 'BNY', iconType: 'book' },
  { id: 'sj-4', nama: 'Google Books', kode: 'GBO', iconType: 'device' },
  { id: 'sj-5', nama: 'T-Shirt', kode: 'TSH', iconType: 'shirt' },
  { id: 'sj-6', nama: 'Note Book', kode: 'NOB', iconType: 'file' },
  { id: 'sj-7', nama: 'Alat Sembahyang', kode: 'ASY', iconType: 'package' },
];

export const INITIAL_SALUR_ITEMS_OPTIONS: SalurItemReportConfig[] = [
  { id: 'itm-1', nama: 'Jalan Menuju Kemahatahuan', subJenis: 'Buku Berbayar', kode: 'JMK', unit: 'buku', hargaSatuan: 100000, iconType: 'book' },
  { id: 'itm-2', nama: 'Dhammapada Bergambar Edisi Koleksi', subJenis: 'Buku Berbayar', kode: 'DBE', unit: 'buku', hargaSatuan: 100000, iconType: 'cart' },
  { id: 'itm-3', nama: 'Dhammapada Bahasa Indonesia', subJenis: 'Buku Tidak Berbayar', kode: 'DBI', unit: 'buku', hargaSatuan: 100000, iconType: 'globe' },
  { id: 'itm-4', nama: 'Kompilasi Sutta Terpilih', subJenis: 'Buku Berbayar', kode: 'KST', unit: 'buku', hargaSatuan: 100000, iconType: 'book' },
  { id: 'itm-5', nama: 'Kisah Jataka Anak Pilihan', subJenis: 'Buku Berbayar', kode: 'KJA', unit: 'buku', hargaSatuan: 100000, iconType: 'book' },
  { id: 'itm-6', nama: 'Buku Paritta Suci YPPLN', subJenis: 'Buku Tidak Berbayar', kode: 'BPS', unit: 'buku', hargaSatuan: 100000, iconType: 'globe' },
  { id: 'itm-7', nama: 'Seri Meditasi Vipassana Praktis', subJenis: 'Buku Berbayar', kode: 'SMV', unit: 'buku', hargaSatuan: 100000, iconType: 'book' },
  { id: 'itm-8', nama: 'Riwayat Hidup Sang Buddha Gotama', subJenis: 'Buku Berbayar', kode: 'RHS', unit: 'buku', hargaSatuan: 100000, iconType: 'book' },
  { id: 'itm-9', nama: 'Buku Nyanyian Pujian Buddhis', subJenis: 'Buku Tidak Berbayar', kode: 'BNP', unit: 'buku', hargaSatuan: 100000, iconType: 'globe' },
  { id: 'itm-10', nama: 'Kumpulan Ceramah Guru Agung', subJenis: 'Buku Berbayar', kode: 'KCG', unit: 'buku', hargaSatuan: 100000, iconType: 'book' },
  { id: 'itm-11', nama: 'Ajaran Dasar Abhidhamma', subJenis: 'Buku Berbayar', kode: 'ADA', unit: 'buku', hargaSatuan: 100000, iconType: 'book' },
  { id: 'itm-12', nama: 'Sutta Nipata Terjemahan', subJenis: 'Buku Tidak Berbayar', kode: 'SNT', unit: 'buku', hargaSatuan: 100000, iconType: 'globe' },
  { id: 'itm-13', nama: 'T-Shirt Meditasi S-SALUR', subJenis: 'T-Shirt', kode: 'TSM', unit: 'pcs', hargaSatuan: 125000, iconType: 'shirt' },
  { id: 'itm-14', nama: 'Note Book Sadhana Harian', subJenis: 'Note Book', kode: 'NSH', unit: 'buku', hargaSatuan: 50000, iconType: 'file' },
];

export const INITIAL_CUSTOMER_SALUR_REPORT: CustomerSalurReportItem[] = [
  {
    id: 'csr-1',
    customerCode: '00031',
    namaLengkap: 'Agustino Ong',
    panggilan: 'Ko Agus',
    avatarInitial: 'A',
    avatarBg: '#14b8a6', // emerald/teal
    allTime: {
      nominal: 10000000,
      itemQty: 100,
      unit: 'buku',
    },
    yearlyData: {
      2020: {
        nominal: 7500000,
        itemQty: 75,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 5500000, itemQty: 55 },
          'Buku Tidak Berbayar': { nominal: 2000000, itemQty: 20 },
        },
      },
      2021: {
        nominal: 10000000,
        itemQty: 100,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 7000000, itemQty: 70 },
          'Buku Tidak Berbayar': { nominal: 3000000, itemQty: 30 },
        },
      },
      2022: {
        nominal: 14000000,
        itemQty: 140,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 10000000, itemQty: 100 },
          'Buku Tidak Berbayar': { nominal: 4000000, itemQty: 40 },
        },
      },
      2023: {
        nominal: 12500000,
        itemQty: 125,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 8500000, itemQty: 85 },
          'Buku Tidak Berbayar': { nominal: 4000000, itemQty: 40 },
        },
      },
    },
    itemBreakdown: [
      {
        namaItem: 'Jalan Menuju Kemahatahuan',
        subJenis: 'Buku Berbayar',
        qty: 60,
        unit: 'buku',
        totalHarga: 6000000,
        yearly: {
          2020: { qty: 45, totalHarga: 4500000, unit: 'buku' },
          2021: { qty: 60, totalHarga: 6000000, unit: 'buku' },
          2022: { qty: 85, totalHarga: 8500000, unit: 'buku' },
          2023: { qty: 75, totalHarga: 7500000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Dhammapada Bahasa Indonesia',
        subJenis: 'Buku Tidak Berbayar',
        qty: 30,
        unit: 'buku',
        totalHarga: 3000000,
        yearly: {
          2020: { qty: 20, totalHarga: 2000000, unit: 'buku' },
          2021: { qty: 30, totalHarga: 3000000, unit: 'buku' },
          2022: { qty: 35, totalHarga: 3500000, unit: 'buku' },
          2023: { qty: 35, totalHarga: 3500000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Kompilasi Sutta Terpilih',
        subJenis: 'Buku Berbayar',
        qty: 10,
        unit: 'buku',
        totalHarga: 1000000,
        yearly: {
          2020: { qty: 10, totalHarga: 1000000, unit: 'buku' },
          2021: { qty: 10, totalHarga: 1000000, unit: 'buku' },
          2022: { qty: 20, totalHarga: 2000000, unit: 'buku' },
          2023: { qty: 15, totalHarga: 1500000, unit: 'buku' },
        },
      },
    ],
  },
  {
    id: 'csr-2',
    customerCode: '00019',
    namaLengkap: 'Cindy Budiman',
    panggilan: 'Ci Pao',
    avatarInitial: 'C',
    avatarBg: '#eab308', // yellow
    allTime: {
      nominal: 30000000,
      itemQty: 300,
      unit: 'buku',
    },
    yearlyData: {
      2020: {
        nominal: 22000000,
        itemQty: 220,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 15000000, itemQty: 150 },
          'Buku Tidak Berbayar': { nominal: 7000000, itemQty: 70 },
        },
      },
      2021: {
        nominal: 30000000,
        itemQty: 300,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 21000000, itemQty: 210 },
          'Buku Tidak Berbayar': { nominal: 9000000, itemQty: 90 },
        },
      },
      2022: {
        nominal: 36000000,
        itemQty: 360,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 25000000, itemQty: 250 },
          'Buku Tidak Berbayar': { nominal: 11000000, itemQty: 110 },
        },
      },
      2023: {
        nominal: 38000000,
        itemQty: 380,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 27000000, itemQty: 270 },
          'Buku Tidak Berbayar': { nominal: 11000000, itemQty: 110 },
        },
      },
    },
    itemBreakdown: [
      {
        namaItem: 'Dhammapada Bergambar Edisi Koleksi',
        subJenis: 'Buku Berbayar',
        qty: 150,
        unit: 'buku',
        totalHarga: 15000000,
        yearly: {
          2020: { qty: 110, totalHarga: 11000000, unit: 'buku' },
          2021: { qty: 150, totalHarga: 15000000, unit: 'buku' },
          2022: { qty: 180, totalHarga: 18000000, unit: 'buku' },
          2023: { qty: 190, totalHarga: 19000000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Kisah Jataka Anak Pilihan',
        subJenis: 'Buku Berbayar',
        qty: 60,
        unit: 'buku',
        totalHarga: 6000000,
        yearly: {
          2020: { qty: 40, totalHarga: 4000000, unit: 'buku' },
          2021: { qty: 60, totalHarga: 6000000, unit: 'buku' },
          2022: { qty: 70, totalHarga: 7000000, unit: 'buku' },
          2023: { qty: 80, totalHarga: 8000000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Buku Paritta Suci YPPLN',
        subJenis: 'Buku Tidak Berbayar',
        qty: 90,
        unit: 'buku',
        totalHarga: 9000000,
        yearly: {
          2020: { qty: 70, totalHarga: 7000000, unit: 'buku' },
          2021: { qty: 90, totalHarga: 9000000, unit: 'buku' },
          2022: { qty: 110, totalHarga: 11000000, unit: 'buku' },
          2023: { qty: 110, totalHarga: 11000000, unit: 'buku' },
        },
      },
    ],
  },
  {
    id: 'csr-3',
    customerCode: '00018',
    namaLengkap: 'Silvia Fukada',
    panggilan: 'Ci Silvia',
    avatarInitial: 'S',
    avatarBg: '#64748b', // slate
    allTime: {
      nominal: 30000000,
      itemQty: 300,
      unit: 'buku',
    },
    yearlyData: {
      2020: {
        nominal: 25000000,
        itemQty: 250,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 18000000, itemQty: 180 },
          'Buku Tidak Berbayar': { nominal: 7000000, itemQty: 70 },
        },
      },
      2021: {
        nominal: 30000000,
        itemQty: 300,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 20000000, itemQty: 200 },
          'Buku Tidak Berbayar': { nominal: 10000000, itemQty: 100 },
        },
      },
      2022: {
        nominal: 32000000,
        itemQty: 320,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 22000000, itemQty: 220 },
          'Buku Tidak Berbayar': { nominal: 10000000, itemQty: 100 },
        },
      },
      2023: {
        nominal: 35000000,
        itemQty: 350,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 24000000, itemQty: 240 },
          'Buku Tidak Berbayar': { nominal: 11000000, itemQty: 110 },
        },
      },
    },
    itemBreakdown: [
      {
        namaItem: 'Seri Meditasi Vipassana Praktis',
        subJenis: 'Buku Berbayar',
        qty: 120,
        unit: 'buku',
        totalHarga: 12000000,
        yearly: {
          2020: { qty: 100, totalHarga: 10000000, unit: 'buku' },
          2021: { qty: 120, totalHarga: 12000000, unit: 'buku' },
          2022: { qty: 130, totalHarga: 13000000, unit: 'buku' },
          2023: { qty: 140, totalHarga: 14000000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Riwayat Hidup Sang Buddha Gotama',
        subJenis: 'Buku Berbayar',
        qty: 80,
        unit: 'buku',
        totalHarga: 8000000,
        yearly: {
          2020: { qty: 80, totalHarga: 8000000, unit: 'buku' },
          2021: { qty: 80, totalHarga: 8000000, unit: 'buku' },
          2022: { qty: 90, totalHarga: 9000000, unit: 'buku' },
          2023: { qty: 100, totalHarga: 10000000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Buku Nyanyian Pujian Buddhis',
        subJenis: 'Buku Tidak Berbayar',
        qty: 100,
        unit: 'buku',
        totalHarga: 10000000,
        yearly: {
          2020: { qty: 70, totalHarga: 7000000, unit: 'buku' },
          2021: { qty: 100, totalHarga: 10000000, unit: 'buku' },
          2022: { qty: 100, totalHarga: 10000000, unit: 'buku' },
          2023: { qty: 110, totalHarga: 11000000, unit: 'buku' },
        },
      },
    ],
  },
  {
    id: 'csr-4',
    customerCode: '00800',
    namaLengkap: 'Bhadra Ksanti',
    panggilan: 'Sucek Shi Xian Jen',
    avatarInitial: 'B',
    avatarBg: '#0f766e', // dark teal
    allTime: {
      nominal: 30000000,
      itemQty: 300,
      unit: 'buku',
    },
    yearlyData: {
      2020: {
        nominal: 18000000,
        itemQty: 180,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 13000000, itemQty: 130 },
          'Buku Tidak Berbayar': { nominal: 5000000, itemQty: 50 },
        },
      },
      2021: {
        nominal: 30000000,
        itemQty: 300,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 20000000, itemQty: 200 },
          'Buku Tidak Berbayar': { nominal: 10000000, itemQty: 100 },
        },
      },
      2022: {
        nominal: 28000000,
        itemQty: 280,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 19000000, itemQty: 190 },
          'Buku Tidak Berbayar': { nominal: 9000000, itemQty: 90 },
        },
      },
      2023: {
        nominal: 34000000,
        itemQty: 340,
        unit: 'buku',
        bySubJenis: {
          'Buku Berbayar': { nominal: 23000000, itemQty: 230 },
          'Buku Tidak Berbayar': { nominal: 11000000, itemQty: 110 },
        },
      },
    },
    itemBreakdown: [
      {
        namaItem: 'Kumpulan Ceramah Guru Agung',
        subJenis: 'Buku Berbayar',
        qty: 110,
        unit: 'buku',
        totalHarga: 11000000,
        yearly: {
          2020: { qty: 70, totalHarga: 7000000, unit: 'buku' },
          2021: { qty: 110, totalHarga: 11000000, unit: 'buku' },
          2022: { qty: 100, totalHarga: 10000000, unit: 'buku' },
          2023: { qty: 120, totalHarga: 12000000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Ajaran Dasar Abhidhamma',
        subJenis: 'Buku Berbayar',
        qty: 90,
        unit: 'buku',
        totalHarga: 9000000,
        yearly: {
          2020: { qty: 60, totalHarga: 6000000, unit: 'buku' },
          2021: { qty: 90, totalHarga: 9000000, unit: 'buku' },
          2022: { qty: 90, totalHarga: 9000000, unit: 'buku' },
          2023: { qty: 110, totalHarga: 11000000, unit: 'buku' },
        },
      },
      {
        namaItem: 'Sutta Nipata Terjemahan',
        subJenis: 'Buku Tidak Berbayar',
        qty: 100,
        unit: 'buku',
        totalHarga: 10000000,
        yearly: {
          2020: { qty: 50, totalHarga: 5000000, unit: 'buku' },
          2021: { qty: 100, totalHarga: 10000000, unit: 'buku' },
          2022: { qty: 90, totalHarga: 9000000, unit: 'buku' },
          2023: { qty: 110, totalHarga: 11000000, unit: 'buku' },
        },
      },
    ],
  },
];

export const formatRupiah = (val: number): string => {
  return 'Rp' + val.toLocaleString('id-ID');
};
