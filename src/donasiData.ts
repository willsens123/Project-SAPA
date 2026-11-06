import { SayPaidRecord } from './types';

export interface DonasiItem {
  id: string;
  codeBadge: string; // 'D', 'A', etc.
  codeBadgeColor?: string; // 'bg-amber-500', 'bg-[#008d91]'
  name: string;
  qtyPrice: string;
  category: string;
  coaNoAkun?: string;
  coaNamaAkun?: string;
  posPemasukan?: string;
}

export interface DonasiPelimpahanJasa {
  badges: string[];
  name: string;
  allNames?: string[];
}

export interface DonasiOrder {
  id: string;
  orderNumber: string; // e.g. 'D-Call Center 26101200001'
  via?: string; // e.g. 'Call Center'
  customerId: string; // '10001 Lilo'
  date: string; // '14 Nov 2021'
  statusBadges: string[]; // ['Paid', 'Paid']
  sayPaidData?: SayPaidRecord[];
  items: DonasiItem[];
  extraItems?: DonasiItem[];
  namaDonatur: {
    badgeDate: string;
    name: string;
  };
  keterangan: {
    title: string;
    subtitle: string;
  };
  pelimpahanJasa: DonasiPelimpahanJasa;
  totalDana: string;
  notesText?: string;
}

const BASE_DONASI_ORDERS: DonasiOrder[] = [
  {
    id: 'donasi-agustino',
    orderNumber: 'D-Call Center 21111400001',
    via: 'Call Center',
    customerId: '00031 Agustino Ong',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    items: [
      {
        id: 'item-ag-1',
        codeBadge: 'K',
        codeBadgeColor: 'bg-[#E05D44]',
        name: 'Kathina 2021 - Ashoka',
        qtyPrice: '2 x Rp100.777',
        category: 'Kathina Dana - MAD',
      },
    ],
    extraItems: [
      {
        id: 'item-ag-2',
        codeBadge: 'D',
        codeBadgeColor: 'bg-amber-500',
        name: 'Donasi Patron Rutin',
        qtyPrice: '1 x Rp100.000',
        category: 'Dharma Patron Rutin - FUN',
        coaNoAkun: '49997',
        coaNamaAkun: 'Pendapatan Dana Dharma Patron',
        posPemasukan: 'Pemasukan YPPLN',
      },
    ],
    namaDonatur: {
      badgeDate: '14 Nov 2021',
      name: 'Agustino Ong',
    },
    keterangan: {
      title: 'Kathina Dana',
      subtitle: 'Kathina 2021',
    },
    pelimpahanJasa: {
      badges: ['Sudah Dikirim', '+ 1 Nama'],
      name: 'Suhu Bhadra Ruci',
      allNames: ['Suhu Bhadra Ruci', 'Semua Makhluk'],
    },
    totalDana: 'Rp301.554',
    notesText: '',
  },
  {
    id: 'donasi-cindy',
    orderNumber: 'D-Call Center 21111400002',
    via: 'Call Center',
    customerId: '00019 Cindy Budiman',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    items: [
      {
        id: 'item-cin-1',
        codeBadge: 'K',
        codeBadgeColor: 'bg-[#E05D44]',
        name: 'Kathina 2021 - Ananthapindika',
        qtyPrice: '1 x Rp5.000.777',
        category: 'Kathina Dana - MAD',
      },
    ],
    namaDonatur: {
      badgeDate: '14 Nov 2021',
      name: 'Cindy Budiman',
    },
    keterangan: {
      title: 'Kathina Dana',
      subtitle: 'Kathina 2021',
    },
    pelimpahanJasa: {
      badges: ['Sudah Dikirim', '+ 2 Nama'],
      name: 'Suhu Bhadra Ruci',
      allNames: ['Suhu Bhadra Ruci', 'Cindy Budiman', 'Semua Makhluk'],
    },
    totalDana: 'Rp5.000.777',
    notesText: '',
  },
  {
    id: 'donasi-silvia',
    orderNumber: 'D-Call Center 21111400003',
    via: 'Call Center',
    customerId: '00018 Silvia Fukada',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    items: [
      {
        id: 'item-sil-1',
        codeBadge: 'K',
        codeBadgeColor: 'bg-[#E05D44]',
        name: 'Kathina 2021 - Ashoka',
        qtyPrice: '3 x Rp100.777',
        category: 'Kathina Dana - MAD',
      },
    ],
    namaDonatur: {
      badgeDate: '14 Nov 2021',
      name: 'Silvia Fukada',
    },
    keterangan: {
      title: 'Kathina Dana',
      subtitle: 'Kathina 2021',
    },
    pelimpahanJasa: {
      badges: ['Sudah Dikirim', '+ 2 Nama'],
      name: 'Suhu Bhadra Ruci',
      allNames: ['Suhu Bhadra Ruci', 'Cindy Pao Budiman', 'Silvia Fukada'],
    },
    totalDana: 'Rp302.331',
    notesText: '',
  },
  {
    id: 'donasi-tan',
    orderNumber: 'D-Call Center 21111400004',
    via: 'Call Center',
    customerId: '00088 Tan Wijaya',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    items: [
      {
        id: 'item-tan-1',
        codeBadge: 'M',
        codeBadgeColor: 'bg-[#008d91]',
        name: 'Donasi Dana Makan Sangha',
        qtyPrice: '1 x Rp50.000',
        category: 'Dana Makan Sangha - FUN',
      },
    ],
    namaDonatur: {
      badgeDate: '14 Nov 2021',
      name: 'Tan Wijaya',
    },
    keterangan: {
      title: 'Dana Makan Sangha',
      subtitle: 'November 2021',
    },
    pelimpahanJasa: {
      badges: ['Sudah Dikirim'],
      name: 'Keluarga Besar Tan',
      allNames: ['Keluarga Besar Tan'],
    },
    totalDana: 'Rp50.000',
    notesText: '',
  },
  {
    id: 'donasi-1',
    orderNumber: 'D-Call Center 21111400005',
    via: 'Call Center',
    customerId: '10001 Lilo',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    items: [
      {
        id: 'item-d1',
        codeBadge: 'D',
        codeBadgeColor: 'bg-amber-500',
        name: 'Donasi Patron Rutin',
        qtyPrice: '1 x Rp300.000',
        category: 'Dharma Patron Rutin - FUN',
        coaNoAkun: '49997',
        coaNamaAkun: 'Pendapatan Dana Dharma Patron',
        posPemasukan: 'Pemasukan YPPLN',
      },
    ],
    extraItems: [
      {
        id: 'item-d1-extra1',
        codeBadge: 'M',
        codeBadgeColor: 'bg-[#008d91]',
        name: 'Donasi Dana Makan Sangha',
        qtyPrice: '1 x Rp100.000',
        category: 'Dana Makanan',
      },
      {
        id: 'item-d1-extra2',
        codeBadge: 'A',
        codeBadgeColor: 'bg-[#008d91]',
        name: 'Paket Pelita & Bunga Puja',
        qtyPrice: '1 x Rp50.000',
        category: 'Sarana Puja',
      },
    ],
    namaDonatur: {
      badgeDate: '14 Nov 2021',
      name: 'Lilo',
    },
    keterangan: {
      title: 'Dharma Patron Rutin',
      subtitle: 'Oktober',
    },
    pelimpahanJasa: {
      badges: ['Sudah Dikirim', '+ 5 Nama'],
      name: 'Suhu Bhadra Ruci',
      allNames: [
        'Suhu Bhadra Ruci',
        'Orang Tua & Leluhur',
        'Keluarga Besar Lilo',
        'Semua Makhluk',
        'Para Guru Spiritual',
        'Bhadra Foundation',
      ],
    },
    totalDana: 'Rp450.000',
    notesText: '',
  },
  {
    id: 'donasi-2',
    orderNumber: 'D-Call Center 21111400006',
    via: 'Call Center',
    customerId: '10001 Lilo',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    items: [
      {
        id: 'item-d2',
        codeBadge: 'D',
        codeBadgeColor: 'bg-amber-500',
        name: 'Donasi Patron Rutin',
        qtyPrice: '2 x Rp100.000',
        category: 'Dharma Patron Rutin - FUN',
        coaNoAkun: '49997',
        coaNamaAkun: 'Pendapatan Dana Dharma Patron',
        posPemasukan: 'Pemasukan YPPLN',
      },
      {
        id: 'item-d3',
        codeBadge: 'K',
        codeBadgeColor: 'bg-[#E05D44]',
        name: 'Kathina 2021 - Ashoka',
        qtyPrice: '2 x Rp100.777',
        category: 'Kathina Dana - MAD',
      },
    ],
    namaDonatur: {
      badgeDate: '14 Nov 2021',
      name: 'Lilo',
    },
    keterangan: {
      title: 'Dharma Patron Rutin',
      subtitle: 'November - Desember',
    },
    pelimpahanJasa: {
      badges: ['Sudah Dikirim', '+ 3 Nama'],
      name: 'Suhu Bhadra Ruci',
      allNames: [
        'Suhu Bhadra Ruci',
        'Keluarga Besar Dharma',
        'Para Leluhur',
        'Semua Makhluk Hidup',
      ],
    },
    totalDana: 'Rp401.554',
    notesText: '',
  },
  {
    id: 'order-patron-10k',
    orderNumber: 'D-Call Center 21111400007',
    via: 'Call Center',
    customerId: '00038 Mutasi A Patron',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    items: [
      {
        id: 'item-patron-10k',
        codeBadge: 'D',
        codeBadgeColor: 'bg-amber-500',
        name: 'Donasi Patron Rutin',
        qtyPrice: '1 x Rp10.000',
        category: 'Dharma Patron Rutin - FUN',
        coaNoAkun: '49997',
        coaNamaAkun: 'Pendapatan Dana Dharma Patron',
        posPemasukan: 'Pemasukan YPPLN',
      },
    ],
    namaDonatur: {
      badgeDate: '14 Nov 2021',
      name: 'Mutasi A - Donasi Dharma Patron Rutin',
    },
    keterangan: {
      title: 'Dharma Patron Rutin',
      subtitle: 'November',
    },
    pelimpahanJasa: {
      badges: ['Sudah Dikirim'],
      name: 'Semua Makhluk',
      allNames: ['Semua Makhluk'],
    },
    totalDana: 'Rp10.000',
    notesText: 'Mutasi A adalah donasi dharma patron rutin 10.000',
  },
];

export const MONTH_DATES_2021 = [
  { month: 'Januari', date: '15 Jan 2021', shortDate: '210115', mutasiDate: '15/Jan' },
  { month: 'Februari', date: '15 Feb 2021', shortDate: '210215', mutasiDate: '15/Feb' },
  { month: 'Maret', date: '15 Mar 2021', shortDate: '210315', mutasiDate: '15/Mar' },
  { month: 'April', date: '15 Apr 2021', shortDate: '210415', mutasiDate: '15/Apr' },
  { month: 'Mei', date: '15 Mei 2021', shortDate: '210515', mutasiDate: '15/Mei' },
  { month: 'Juni', date: '15 Jun 2021', shortDate: '210615', mutasiDate: '15/Jun' },
  { month: 'Juli', date: '15 Jul 2021', shortDate: '210715', mutasiDate: '15/Jul' },
  { month: 'Agustus', date: '15 Agu 2021', shortDate: '210815', mutasiDate: '15/Agu' },
  { month: 'September', date: '15 Sep 2021', shortDate: '210915', mutasiDate: '15/Sep' },
  { month: 'Oktober', date: '15 Okt 2021', shortDate: '211015', mutasiDate: '15/Okt' },
  { month: 'November', date: '15 Nov 2021', shortDate: '211115', mutasiDate: '15/Nov' },
];

export interface PatronConfig {
  noDonatur: string;
  namaDonatur: string;
  nominal: number;
  bank?: string;
  pelimpahan: string[];
  paidMonthIndices: number[];
}

export const PATRON_CONFIGS: PatronConfig[] = [
  {
    noDonatur: '00031',
    namaDonatur: 'Agustino Ong',
    nominal: 100000,
    bank: 'BCA 888',
    pelimpahan: ['Agustino Ong', 'Suhu Bhadra Ruci'],
    // Jan s/d Sep (Nov is already in donasi-agustino, Oktober is unpaid!)
    paidMonthIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    noDonatur: '00036',
    namaDonatur: 'Sherly Ong (Keluarga Agustino)',
    nominal: 200000,
    bank: 'BCA 888',
    pelimpahan: ['Sherly Ong', 'Ko Agus Ong'],
    // Jan s/d Nov (all 11 months paid)
    paidMonthIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    noDonatur: '00032',
    namaDonatur: 'Karunika Dewi',
    nominal: 250000,
    bank: 'BCA 888',
    pelimpahan: ['Karunika Dewi', 'Lianawati'],
    // Jan s/d Nov (all 11 months paid)
    paidMonthIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    noDonatur: '00033',
    namaDonatur: 'Vioni Hartono',
    nominal: 150000,
    bank: 'BCA 888',
    pelimpahan: ['Vioni Hartono'],
    // Jan s/d Okt (November is unpaid!)
    paidMonthIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    noDonatur: '00034',
    namaDonatur: 'Melyana Tan',
    nominal: 200000,
    bank: 'BCA 388',
    pelimpahan: ['Melyana Tan'],
    // Jan s/d Nov (all 11 months paid)
    paidMonthIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    noDonatur: '00035',
    namaDonatur: 'Stanley Khu',
    nominal: 500000,
    bank: 'BCA 888',
    pelimpahan: ['Stanley Khu', 'Keluarga Khu'],
    // Jan s/d Nov (all 11 months paid)
    paidMonthIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    noDonatur: '00037',
    namaDonatur: 'Kadam Choeling Indonesia',
    nominal: 1000000,
    bank: 'Mandiri',
    pelimpahan: ['Semua Makhluk', 'Guru Pembimbing'],
    // Jan s/d Nov (all 11 months paid)
    paidMonthIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
];

export function buildPatronMonthlyTransactions(): DonasiOrder[] {
  const patronConfigs = PATRON_CONFIGS;

  const orders: DonasiOrder[] = [];
  let globalSeq = 10;

  patronConfigs.forEach((cfg) => {
    cfg.paidMonthIndices.forEach((mIdx) => {
      globalSeq++;
      const mInfo = MONTH_DATES_2021[mIdx];
      const seqStr = globalSeq.toString().padStart(5, '0');
      const formattedNominal = `Rp${cfg.nominal.toLocaleString('id-ID')}`;
      const orderId = `donasi-patron-${cfg.noDonatur}-${mIdx}`;

      orders.push({
        id: orderId,
        orderNumber: `D-Call Center ${mInfo.shortDate}${seqStr}`,
        via: 'Call Center',
        customerId: `${cfg.noDonatur} ${cfg.namaDonatur}`,
        date: mInfo.date,
        statusBadges: ['Paid', 'Paid'],
        items: [
          {
            id: `item-${orderId}`,
            codeBadge: 'D',
            codeBadgeColor: 'bg-amber-500',
            name: 'Donasi Patron Rutin',
            qtyPrice: `1 x ${formattedNominal}`,
            category: 'Dharma Patron Rutin - FUN',
            coaNoAkun: '49997',
            coaNamaAkun: 'Pendapatan Dana Dharma Patron',
            posPemasukan: 'Pemasukan YPPLN',
          },
        ],
        namaDonatur: {
          badgeDate: mInfo.date,
          name: cfg.namaDonatur,
        },
        keterangan: {
          title: 'Dharma Patron Rutin',
          subtitle: mInfo.month,
        },
        pelimpahanJasa: {
          badges: ['Sudah Dikirim'],
          name: cfg.pelimpahan[0] || 'Suhu Bhadra Ruci',
          allNames: cfg.pelimpahan,
        },
        totalDana: formattedNominal,
        notesText: '',
      });
    });
  });

  return orders;
}

export const INITIAL_DONASI_ORDERS: DonasiOrder[] = [
  ...BASE_DONASI_ORDERS,
  ...buildPatronMonthlyTransactions(),
];

export interface MasterDonasiProduct {
  id: string;
  codeBadge: string;
  codeBadgeColor: string;
  name: string;
  price: number;
  formattedPrice: string;
  category: string;
  coaNoAkun?: string;
  coaNamaAkun?: string;
  posPemasukan?: string;
}

export const AVAILABLE_DONASI_PRODUCTS: MasterDonasiProduct[] = [
  {
    id: 'prod-ashoka',
    codeBadge: 'A',
    codeBadgeColor: 'bg-[#008d91]',
    name: 'Kathina 2021 - Ashoka',
    price: 100777,
    formattedPrice: 'Rp100.777',
    category: '1 buku Dharma',
  },
  {
    id: 'prod-patron',
    codeBadge: 'D',
    codeBadgeColor: 'bg-amber-500',
    name: 'Donasi Patron Rutin',
    price: 100000,
    formattedPrice: 'Rp100.000',
    category: 'Dharma Patron',
    coaNoAkun: '49997',
    coaNamaAkun: 'Pendapatan Dana Dharma Patron',
    posPemasukan: 'Pemasukan YPPLN',
  },
  {
    id: 'prod-ananthapindika',
    codeBadge: 'A',
    codeBadgeColor: 'bg-[#008d91]',
    name: 'Kathina 2021 - Ananthapindika',
    price: 5000777,
    formattedPrice: 'Rp5.000.777',
    category: '35 buku Dharma, 4 pak vi...',
  },
  {
    id: 'prod-makan-sangha',
    codeBadge: 'D',
    codeBadgeColor: 'bg-amber-500',
    name: 'Donasi Dana Makan Sangha',
    price: 100000,
    formattedPrice: 'Rp100.000',
    category: 'Dana Makanan',
  },
  {
    id: 'prod-pelita',
    codeBadge: 'A',
    codeBadgeColor: 'bg-[#008d91]',
    name: 'Paket Pelita & Bunga Puja',
    price: 50000,
    formattedPrice: 'Rp50.000',
    category: 'Sarana Puja',
  },
];

