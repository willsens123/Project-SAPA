import { MutasiItem } from './types';
import { PATRON_CONFIGS, MONTH_DATES_2021 } from './donasiData';

export const BANK_ACCOUNTS = [
  { id: 'BCA 888', label: 'Mutasi BCA 888' },
  { id: 'BCA 388', label: 'Mutasi BCA 388' },
  { id: 'Mandiri', label: 'Mutasi Mandiri' },
];

const BASE_MUTASI_ITEMS: MutasiItem[] = [
  // Mutasi A (S-SALUR Jalan Menuju Kemahatahuan: Buku 125.000 + Ongkir 10.000 + Donasi 10.000)
  {
    id: 'mutasi-a',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 0111/FTSCY/WS95011 145000.00 Mutasi A - Jalan Menuju Kemahatahuan',
    branch: '0',
    amount: 145000.0,
    type: 'CR',
    balance: 331786624.28,
    linkedTransactions: [
      {
        id: 'link-mutasi-a-1',
        sourceType: 'salur',
        kode: 'order-mutasi-a',
        orderId: 'order-mutasi-a',
        dbCr: 'CR',
        nominalAkhir: 145000.0,
        keterangan: 'Mutasi A - Transaksi Salur Jalan Menuju Kemahatahuan',
      },
    ],
  },
  // Mutasi A (D-DONASI Donasi Dharma Patron Rutin 10.000)
  {
    id: 'mutasi-patron-a',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 0111/FTSCY/WS95011 10000.00 Mutasi A - Donasi Dharma Patron Rutin',
    branch: '0',
    amount: 10000.0,
    type: 'CR',
    balance: 331796624.28,
    linkedTransactions: [
      {
        id: 'link-mutasi-patron-a-1',
        sourceType: 'donasi',
        kode: 'order-patron-10k',
        orderId: 'order-patron-10k',
        dbCr: 'CR',
        nominalAkhir: 10000.0,
        keterangan: 'Mutasi A - Donasi Dharma Patron Rutin 10.000',
      },
    ],
  },
  // BCA 888 (from screenshot)
  {
    id: 'mutasi-bca888-1',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 3010/FTSCY/WS95011 95000.00 Invite Buku DKSM AMRI -THI 2D/17 AMRI ZEIN',
    branch: '0',
    amount: 95000.0,
    type: 'CR',
    balance: 331641624.28,
    linkedTransactions: [
      {
        id: 'link-bca888-1-1',
        sourceType: 'salur',
        kode: '2021 CC 4449002643',
        dbCr: 'CR',
        nominalAkhir: 95000.0,
        keterangan: 'Invite Buku DKSM AMRI -THI 2D/17 AMRI ZEIN',
      },
    ],
  },
  {
    id: 'mutasi-bca888-2',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 10/31 95031 ATTHA SHINTA OKTAVIANI',
    branch: '0',
    amount: 62300.0,
    type: 'CR',
    balance: 331703924.28,
    linkedTransactions: [
      {
        id: 'link-bca888-2-1',
        sourceType: 'salur',
        kode: '2021 CC 4449602722',
        dbCr: 'CR',
        nominalAkhir: 80139.0,
        keterangan: 'Pesanan Buku S-SALUR Tokopedia Attha Shinta Oktaviani',
      },
      {
        id: 'link-bca888-2-2',
        sourceType: 'fee',
        kode: "Tokopedia's Power Merchant Service Fee",
        dbCr: 'DB',
        nominalAkhir: -16352.0,
        keterangan: 'Biaya Layanan Tokopedia Power Merchant',
      },
      {
        id: 'link-bca888-2-3',
        sourceType: 'fee',
        kode: "Tokopedia's Bebas Ongkir Fee",
        dbCr: 'DB',
        nominalAkhir: -1487.0,
        keterangan: 'Biaya Bebas Ongkir Tokopedia',
      },
    ],
  },
  {
    id: 'mutasi-bca888-3',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 11/01 95031 191,192,193 AGUSTINO',
    branch: '0',
    amount: 212900.0,
    type: 'CR',
    balance: 331916824.28,
    linkedTransactions: [
      {
        id: 'link-bca888-3-1',
        sourceType: 'pengeluaran',
        kode: 'No. 191 - Apresiasi Buku Harta Tahta Wanita (Pak Agus Hartono)',
        dbCr: 'DB',
        nominalAkhir: 74300.0,
        keterangan: 'Apresiasi Buku Harta Tahta Wanita untuk Pak Agus Hartono',
      },
      {
        id: 'link-bca888-3-2',
        sourceType: 'pengeluaran',
        kode: 'No. 192 - Apresiasi Buku Harta Tahta Wanita (Pak Stanley Khu)',
        dbCr: 'DB',
        nominalAkhir: 69300.0,
        keterangan: 'Apresiasi Buku Harta Tahta Wanita untuk Pak Stanley Khu',
      },
      {
        id: 'link-bca888-3-3',
        sourceType: 'pengeluaran',
        kode: 'No. 193 - Apresiasi Buku Harta Tahta Wanita (Ci Karina)',
        dbCr: 'DB',
        nominalAkhir: 69300.0,
        keterangan: 'Apresiasi Buku Harta Tahta Wanita untuk Ci Karina',
      },
    ],
  },
  {
    id: 'mutasi-bca888-4',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 0111/FTSCY/WS95011 178000.00 SILVIA',
    branch: '0',
    amount: 178000.0,
    type: 'CR',
    balance: 332094824.28,
    linkedTransactions: [
      {
        id: 'link-bca888-4-1',
        sourceType: 'donasi',
        kode: 'DNS-2021-001 - Silvia (Donasi Operasional Dharma)',
        dbCr: 'CR',
        nominalAkhir: 178000.0,
        keterangan: 'Donasi Program Operasional Dharma Yayasan',
      },
    ],
  },
  {
    id: 'mutasi-bca888-5',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 11/01 95031 BUKU DKSM LISA FEBRIANTI',
    branch: '0',
    amount: 120000.0,
    type: 'CR',
    balance: 332214824.28,
    linkedTransactions: [
      {
        id: 'link-bca888-5-1',
        sourceType: 'ajar',
        kode: 'AJR-2021-002 - Lisa Febrianti (Pendaftaran Kelas Meditasi)',
        dbCr: 'CR',
        nominalAkhir: 120000.0,
        keterangan: 'Pendaftaran Kursus & Pelatihan Dharma A-AJAR',
      },
    ],
  },
  {
    id: 'mutasi-bca888-6',
    bankAccount: 'BCA 888',
    date: '2/Nov',
    keteranganBank: 'TRSF E-BANKING CR 0211/FTSCY/WS95051 1072261.00 WD181458767 Yayasan Pelestari TOKOPEDIA PT',
    branch: '0',
    amount: 1072261.0,
    type: 'CR',
    balance: 333287085.28,
    linkedTransactions: [
      {
        id: 'link-tokopedia-1',
        kode: 'CC 23456789456',
        dbCr: 'CR',
        nominalAkhir: 99100.0,
      },
      {
        id: 'link-tokopedia-2',
        kode: 'TOKOPEDIA 4449502668',
        dbCr: 'CR',
        nominalAkhir: 1000.0,
      },
      {
        id: 'link-tokopedia-3',
        kode: 'TOKOPEDIA 4449002667',
        dbCr: 'CR',
        nominalAkhir: 990000.0,
      },
      {
        id: 'link-tokopedia-4',
        kode: "Tokopedia's Power Merchant Service Fee",
        dbCr: 'DB',
        nominalAkhir: -16352.0,
      },
      {
        id: 'link-tokopedia-5',
        kode: "Tokopedia's Bebas Ongkir Fee",
        dbCr: 'DB',
        nominalAkhir: -1487.0,
      },
    ],
  },
  {
    id: 'mutasi-bca888-7',
    bankAccount: 'BCA 888',
    date: '2/Nov',
    keteranganBank: 'TRSF E-BANKING CR 11/02 95031 KAOS FOLLOW THE DH ARMA ANGEL S',
    branch: '0',
    amount: 128000.0,
    type: 'CR',
    balance: 333415085.28,
    linkedTransactions: [],
  },
  {
    id: 'mutasi-bca888-8',
    bankAccount: 'BCA 888',
    date: '2/Nov',
    keteranganBank: 'TRSF E-BANKING CR 0211/FTSCY/WS95051 765422.00 WD181485505 YAY PELESTARIAN d TOKOPEDIA PT',
    branch: '0',
    amount: 765422.0,
    type: 'CR',
    balance: 334180507.28,
  },

  // BCA 388 sample records
  {
    id: 'mutasi-bca388-18',
    bankAccount: 'BCA 388',
    date: '15/Jan/20',
    keteranganBank: 'TRSF E-BANKING DB.BA.BCA388.01.20.00018 Pembayaran Royalti Demi Kepentingan Semua Makhluk 2020',
    branch: '0',
    amount: 5340.0,
    type: 'DB',
    balance: 85240500.0,
  },
  {
    id: 'mutasi-bca388-11',
    bankAccount: 'BCA 388',
    date: '15/Jan/21',
    keteranganBank: 'TRSF E-BANKING DB.BA.BCA388.01.20.00011 Pembayaran Royalti Demi Kepentingan Semua Makhluk 2021',
    branch: '0',
    amount: 1068000.0,
    type: 'DB',
    balance: 84172500.0,
  },
  {
    id: 'mutasi-bca388-7',
    bankAccount: 'BCA 388',
    date: '15/Jan/20',
    keteranganBank: 'TRSF E-BANKING DB.BA.BCA388.01.20.00007 Pembayaran Royalti Jalan Menuju Kemahatahuan 2020',
    branch: '0',
    amount: 5340.0,
    type: 'DB',
    balance: 84167160.0,
  },
  {
    id: 'mutasi-bca388-8',
    bankAccount: 'BCA 388',
    date: '15/Jan/21',
    keteranganBank: 'TRSF E-BANKING DB.BA.BCA388.01.20.00008 Pembayaran Royalti Jalan Menuju Kemahatahuan 2021',
    branch: '0',
    amount: 1068000.0,
    type: 'DB',
    balance: 83099160.0,
  },
  {
    id: 'mutasi-bca388-1',
    bankAccount: 'BCA 388',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING CR 0111/FTSCY/WS92010 DONASI OPERASIONAL DHAMMA YAYASAN',
    branch: '0',
    amount: 500000.0,
    type: 'CR',
    balance: 83599160.0,
  },
  {
    id: 'mutasi-bca388-2',
    bankAccount: 'BCA 388',
    date: '2/Nov',
    keteranganBank: 'TRSF E-BANKING CR 0211/FTSCY/WS92144 INFAK PENERBITAN KITAB SUCI',
    branch: '0',
    amount: 350000.0,
    type: 'CR',
    balance: 85590500.0,
  },
  {
    id: 'mutasi-bca388-3',
    bankAccount: 'BCA 388',
    date: '3/Nov',
    keteranganBank: 'BIAYA ADM BULANAN BCA',
    branch: '0',
    amount: 15000.0,
    type: 'DB',
    balance: 85575500.0,
  },

  // Mandiri sample records
  {
    id: 'mutasi-mandiri-1',
    bankAccount: 'Mandiri',
    date: '1/Nov',
    keteranganBank: 'TRSF LIVIN MANDIRI CR DANA SOSIAL BENCANA YPPLN HENDRA KURNIAWAN',
    branch: '0',
    amount: 1500000.0,
    type: 'CR',
    balance: 142850000.5,
  },
  {
    id: 'mutasi-mandiri-2',
    bankAccount: 'Mandiri',
    date: '2/Nov',
    keteranganBank: 'TRSF LIVIN MANDIRI CR PEMESANAN BUKU DHAMMAPADA RATNA DEWI',
    branch: '0',
    amount: 250000.0,
    type: 'CR',
    balance: 143100000.5,
  },
  {
    id: 'mutasi-mandiri-3',
    bankAccount: 'Mandiri',
    date: '4/Nov',
    keteranganBank: 'PENARIKAN DANA DISTRIBUSI LOGISTIK MEDAN',
    branch: '0',
    amount: 2000000.0,
    type: 'DB',
    balance: 141100000.5,
  },
  {
    id: 'mutasi-bca888-db-188',
    bankAccount: 'BCA 888',
    date: '21/Okt',
    keteranganBank: 'DEBET OTOMATIS PEMBELIAN ATK LOGISTIK TOKO BINTANG',
    branch: '0',
    amount: 151700.0,
    type: 'DB',
    balance: 331489924.28,
  },
  {
    id: 'mutasi-bca888-db-189',
    bankAccount: 'BCA 888',
    date: '28/Okt',
    keteranganBank: 'TRSF KELUAR PEMBELIAN PERLENGKAPAN BUKU BERBAYAR',
    branch: '0',
    amount: 78400.0,
    type: 'DB',
    balance: 331411524.28,
  },
  {
    id: 'mutasi-bca888-db-pdam',
    bankAccount: 'BCA 888',
    date: '1/Nov',
    keteranganBank: 'TRSF E-BANKING DB PEMBAYARAN AIR PDAM TIRTA RAHARJA',
    branch: '0',
    amount: 48800.0,
    type: 'DB',
    balance: 331362724.28,
  },
  {
    id: 'mutasi-bca888-db-wifi',
    bankAccount: 'BCA 888',
    date: '30/Okt',
    keteranganBank: 'TRSF E-BANKING DB BIAYA INTERNET MEGAVISION OKTOBER',
    branch: '0',
    amount: 253400.0,
    type: 'DB',
    balance: 331109324.28,
  },
  {
    id: 'mutasi-bca888-db-ads',
    bankAccount: 'BCA 888',
    date: '29/Okt',
    keteranganBank: 'TRSF E-BANKING DB BOOST IKLAN FB PROMO 11.11',
    branch: '0',
    amount: 463000.0,
    type: 'DB',
    balance: 330646324.28,
  },
];

export function buildPatronMutasiItems(): MutasiItem[] {
  const mutasiList: MutasiItem[] = [
    // 1. Mutasi BCA 888 untuk transaksi Agustino Ong (donasi-agustino: Kathina + Patron Nov)
    {
      id: 'mutasi-bca888-agustino-nov',
      bankAccount: 'BCA 888',
      date: '14/Nov',
      keteranganBank: 'TRSF E-BANKING CR 1411/FTSCY/WS95011 301554.00 AGUSTINO ONG KATHINA & PATRON',
      branch: '0',
      amount: 301554.0,
      type: 'CR',
      balance: 334482061.28,
      linkedTransactions: [
        {
          id: 'link-agustino-nov',
          sourceType: 'donasi',
          orderId: 'donasi-agustino',
          kode: 'D-Call Center 21111400001',
          dbCr: 'CR',
          nominalAkhir: 301554.0,
          keterangan: 'Donasi Patron Rutin November & Kathina Dana Ashoka Agustino Ong',
        },
      ],
    },
    // 2. Mutasi BCA 888 untuk transaksi Lilo (donasi-1: Dharma Patron Rutin Oktober)
    {
      id: 'mutasi-bca888-lilo-okt',
      bankAccount: 'BCA 888',
      date: '14/Nov',
      keteranganBank: 'TRSF E-BANKING CR 1411/FTSCY/WS95011 450000.00 LILO DONASI PATRON OKTOBER',
      branch: '0',
      amount: 450000.0,
      type: 'CR',
      balance: 334932061.28,
      linkedTransactions: [
        {
          id: 'link-lilo-okt',
          sourceType: 'donasi',
          orderId: 'donasi-1',
          kode: 'D-Call Center 21111400005',
          dbCr: 'CR',
          nominalAkhir: 450000.0,
          keterangan: 'Dharma Patron Rutin Oktober & Dana Makan Sangha Lilo',
        },
      ],
    },
  ];

  let globalSeq = 10;
  PATRON_CONFIGS.forEach((cfg) => {
    cfg.paidMonthIndices.forEach((mIdx) => {
      globalSeq++;
      const mInfo = MONTH_DATES_2021[mIdx];
      const seqStr = globalSeq.toString().padStart(5, '0');
      const orderId = `donasi-patron-${cfg.noDonatur}-${mIdx}`;
      const orderNumber = `D-Call Center ${mInfo.shortDate}${seqStr}`;

      mutasiList.push({
        id: `mutasi-patron-${cfg.noDonatur}-${mIdx}`,
        bankAccount: cfg.bank || 'BCA 888',
        date: mInfo.mutasiDate || '15/Nov',
        keteranganBank: `TRSF E-BANKING CR ${mInfo.shortDate} ${cfg.noDonatur} ${cfg.namaDonatur.toUpperCase()} DONASI RUTIN`,
        branch: '0',
        amount: cfg.nominal,
        type: 'CR',
        balance: 335000000.0,
        linkedTransactions: [
          {
            id: `link-mutasi-${cfg.noDonatur}-${mIdx}`,
            sourceType: 'donasi',
            orderId,
            kode: orderNumber,
            dbCr: 'CR',
            nominalAkhir: cfg.nominal,
            keterangan: `Donasi Patron Rutin ${mInfo.month} - ${cfg.namaDonatur}`,
          },
        ],
      });
    });
  });

  return mutasiList;
}

export const INITIAL_MUTASI_ITEMS: MutasiItem[] = [
  ...BASE_MUTASI_ITEMS,
  ...buildPatronMutasiItems(),
];
