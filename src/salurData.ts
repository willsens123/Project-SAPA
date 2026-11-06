import { SayPaidRecord } from './types';
import {
  generateKodeTransaksi,
  normalizeVia,
  parseDateToComponents,
} from './utils/kodeTransaksiHelper';

export interface SalurProduct {
  id: string;
  title: string;
  subtitle?: string;
  code?: string;
  price: number;
  stock: number;
  category?: string;
  categories?: string[];
  subJenis?: string;
  subJenisItem?: string;
  coverKey?: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  imageUrl?: string;
  printedCount?: number;
  author?: string;
  publisher?: string;
  pageCount?: string;
  coverType?: string;
  berat?: number | string;
  proyekSapa?: string;
  pemasukanDivisi?: string;
  coaNoAkun?: string;
  coaNamaAkun?: string;
  detailedInfo?: {
    fullTitle?: string;
    author?: string;
    publisher?: string;
    dimensions?: string;
    pages?: string;
    cover?: string;
    isbn?: string;
    year?: string;
    priceFormatted?: string;
    quote?: string;
    description?: string;
  };
}

export interface SalurOrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  originalPrice?: number;
  promoDiscountText?: string;
  promo?: string;
  quantity: number;
  coverKey: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  berat?: number | string;
  subJenis?: string;
  coaNoAkun?: string;
  coaNamaAkun?: string;
}

export interface SalurAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  dateBadge?: string;
}

export interface SalurOrder {
  id: string;
  orderNumber: string; // e.g. "CC 123456789" (via + unique code: YYMMDD + urutan)
  via?: string; // Via dari Form Transaksi S-SALUR (e.g. "CC")
  customerId: string; // Identitas ID Pembeli e.g. "10001 Lilo"
  customerCode: string; // Identitas ID Penerima e.g. "10001 Lilo"
  idPembeli?: string; // Identitas ID Pembeli e.g. "10001 Lilo"
  idPenerima?: string; // Identitas ID Penerima e.g. "10001 Lilo"
  date: string; // Tanggal transaksi dibuat e.g. "14 Nov 2021"
  paymentStatus: 'Paid' | 'Belum Bayar';
  shippingStatus: 'Belum dikirim' | 'Sudah Dikirim';
  statusBadges: string[]; // ['Paid', 'Paid']
  printStatusBadge?: {
    text: string;
    type?: 'teal' | 'red';
  };
  promo?: string;
  promoName?: string;
  items: SalurOrderItem[];
  alamat: {
    badgeDate?: string;
    recipientName: string;
    phone: string;
    street: string;
    cityProvince: string;
    postalCode: string;
  };
  ekspedisi: {
    name: string; // e.g. "TIKI ECO", "TIKI ONS"
    noResi?: string;
    isShipped: boolean;
  };
  costBreakdown?: {
    ongkir?: string;
    donasi?: string;
    kodeUnik?: string;
  };
  totalDana: string;
  hasMoreProducts?: boolean;
  keterangan?: string;
  proyekSapa?: string;
  jenisPengeluaranHadiah?: string;
  isHadiah?: boolean;
  sayPaidData?: SayPaidRecord[];
  stockOutContainer?: string;
  stockOutLokasi?: string;
  printDate?: string;
}

/**
 * Parses a date string (such as "14 Nov 2021", "2021-11-14", or current date)
 * into 2-digit { yy, mm, dd } strings.
 */
export function parseDateToYYMMDD(dateStr?: string): { yy: string; mm: string; dd: string } {
  const monthMap: Record<string, string> = {
    jan: '01', januari: '01', january: '01',
    feb: '02', februari: '02', february: '02',
    mar: '03', maret: '03', march: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06', june: '06',
    jul: '07', juli: '07', july: '07',
    agu: '08', agt: '08', agustus: '08', aug: '08', august: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10', october: '10',
    nov: '11', november: '11',
    des: '12', desember: '12', dec: '12', december: '12',
  };

  if (dateStr && dateStr.trim()) {
    const trimmed = dateStr.trim();
    const parts = trimmed.split(/[\s,/-]+/);

    if (parts.length >= 3) {
      // Format: DD Month YYYY (e.g. "14 Nov 2021")
      const dayNum = parseInt(parts[0], 10);
      const monthPart = parts[1].toLowerCase();
      const yearNum = parseInt(parts[2], 10);

      if (!isNaN(dayNum) && monthMap[monthPart] && !isNaN(yearNum)) {
        const dd = String(dayNum).padStart(2, '0');
        const mm = monthMap[monthPart];
        const yy = String(yearNum).slice(-2);
        return { yy, mm, dd };
      }

      // Format: YYYY-MM-DD
      if (parts[0].length === 4) {
        const yy = parts[0].slice(-2);
        const mm = parts[1].padStart(2, '0');
        const dd = parts[2].padStart(2, '0');
        return { yy, mm, dd };
      }

      // Format: DD-MM-YYYY
      if (parts[2].length === 4) {
        const yy = parts[2].slice(-2);
        const mm = (monthMap[parts[1].toLowerCase()] || parts[1]).padStart(2, '0');
        const dd = parts[0].padStart(2, '0');
        return { yy, mm, dd };
      }
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const yy = String(parsed.getFullYear()).slice(-2);
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return { yy, mm, dd };
    }
  }

  // Fallback to today's date
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return { yy, mm, dd };
}

/**
 * Generates the Salur Order Number based on user specification:
 * - S/A/D: S-SALUR, A-AJAR, D-DONASI
 * - Call Center: via Transaksi
 * - 26: Tahun
 * - 10: Bulan
 * - 12: Tanggal
 * - 00001: Urutan transaksi per tahunnya
 * Contoh: S-Call Center 26101200001
 */
export function generateSalurOrderNumber(
  via: string = 'Call Center',
  dateStr: string = '14 Nov 2021',
  orderSequence: number = 1
): { orderNumber: string; viaCode: string; uniqueCode: string } {
  const cleanVia = normalizeVia(via);
  const { yy, mm, dd } = parseDateToComponents(dateStr);
  const urutan = String(orderSequence).padStart(5, '0');
  const uniqueCode = `${yy}${mm}${dd}${urutan}`;
  const orderNumber = generateKodeTransaksi('S', cleanVia, dateStr, orderSequence);
  return { orderNumber, viaCode: cleanVia, uniqueCode };
}

/**
 * Returns formatted current date (e.g. "23 Sep 2026")
 */
export function formatCurrentDate(d: Date = new Date()): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export const INITIAL_BOOKS: SalurProduct[] = [
  {
    id: 'book-1',
    title: 'Jalan Menuju Kemahatahuan',
    subtitle: 'Buku Berbayar, BJM - 2021',
    code: 'BJM - 2021',
    price: 125000,
    stock: 100,
    printedCount: 700,
    author: 'Panchen Losang Chokyi Gyaltshen & Panchen Losang Yeshe',
    publisher: 'Penerbit Kadam Choeling',
    categories: ['TJMP', 'Welas Asih'],
    pageCount: 'X+200 hlm',
    coverType: 'Soft Cover',
    coverKey: 'jalan-menuju',
    berat: 0.5,
    pemasukanDivisi: 'MAD',
    coaNoAkun: '40002',
    coaNamaAkun: 'Pendapatan Salur - Jalan Menuju Kemahatahuan',
    detailedInfo: {
      fullTitle: 'Jalan Menuju Kemahatahuan: Risalah Mengenai Tingkatan Jalan Menuju Pencerahan (Lamrim)',
      author: 'Panchen Losang Chokyi Gyaltshen & Panchen Losang Yeshe',
      publisher: 'Penerbit Yayasan Pengembangan dan Pelestarian Lamrim Nusantara',
      dimensions: '21 x 14.8 x 1.5 mm',
      pages: 'xxiv+246',
      cover: 'Soft Cover',
      isbn: '978-623-6632-04-8',
      year: '2021',
      priceFormatted: 'Rp125.000',
      quote: '”Sebuah risalah terlengkap dan paling berharga yang merangkum keseluruhan ajaran Sang Buddha ke dalam tahapan-tahapan latihan batin yang teratur dan dapat dipraktikkan oleh siapa pun dalam kehidupan sehari-hari.” - Risalah Dharma Nusantara',
      description: 'Buku Jalan Menuju Kemahatahuan menyajikan bimbingan terperinci mengenai tahapan jalan menuju pencerahan (Lamrim) yang disusun secara sistematis oleh para guru silsilah agung. Melalui penjelasan teks klasik yang mendalam dan mudah dipahami, pembaca dibimbing untuk menumbuhkan batin pelepasan, bodhicitta, dan pandangan benar sunyata secara berkesinambungan.',
    },
  },
  {
    id: 'book-2',
    title: 'Demi Kepentingan Semua Makhluk',
    subtitle: 'Buku Berbayar, BSM - 2021',
    code: 'BSM - 2021',
    price: 89000,
    stock: 100,
    printedCount: 700,
    author: 'Dalai Lama XIV',
    publisher: 'Penerbit Kadam Choeling',
    categories: ['Welas Asih'],
    pageCount: 'X+200 hlm',
    coverType: 'Soft Cover',
    coverKey: 'demi-kepentingan',
    berat: 0.3,
    pemasukanDivisi: 'MAD',
    coaNoAkun: '40003',
    coaNamaAkun: 'Pendapatan Salur - Demi Kepentingan Semua Makhluk',
    detailedInfo: {
      fullTitle: 'Demi Kepentingan Semua Makhluk: Sebuah Ulasan Atas Lakon Hidup Sang Penerang',
      author: 'Y.M.S. Dalai Lama XIV',
      publisher: 'Penerbit Yayasan Pengembangan dan Pelestarian Lamrim Nusantara',
      dimensions: '21 x 14.8 x 1.2 mm',
      pages: 'xvii+137',
      cover: 'Soft Cover',
      isbn: '978-623-6632-06-2',
      year: '2021',
      priceFormatted: 'Rp89.000',
      quote: '”Tak perlu menjadi seorang Buddhis untuk menyadari keindahan ajaran dan kesederhanaan hidup yang diperkenalkan di sini. Sebenarnya, non-Buddhis mungkin menemukan pendekatan baru yang menyegarkan terhadap doktrin \'love your neighbor\', dan \'do unto others as you would have others do unto you\'.” - Booklist',
      description: 'Y.M.S. Dalai Lama XIV perwujudan hidup seorang Bodhisatwa, secara terperinci menyajikan panduan praktis berdasarkan teks Buddhisme Mahayana yang terkenal yaitu Lakon Hidup Sang Penerang oleh Shantidewa. Melalui penjelasan karya klasik dan bermakna ini, beliau menunjukan bagaimana setiap orang dapat mengembangkan sebuah kebaikan hati yang sesungguhnya dan aspirasi untuk pencerahan semua makhluk. Dalam buku ini, pengetahuan mendalam beliau yang merupakan hasil dari latihan ekstensif sangat terlihat, yaitu mengenai wawasan luar biasa beliau tentang manusia dan makna menjadi orang yang bertanggung jawab dan peduli. Manusia dengan karakter demikian, akan bisa mengatasi racun mentalnya dan melewati kesukaran sekecil apa pun.',
    },
  },
  {
    id: 'book-3',
    title: 'Menjadi Buddha di Tempat Kerja',
    subtitle: 'Buku Berbayar, BMB - 2021',
    code: 'BMB - 2021',
    price: 125000,
    stock: 100,
    printedCount: 700,
    author: 'Franz Metcalf & BJ Gallagher',
    publisher: 'Penerbit Kadam Choeling',
    categories: ['Umum', 'Leadership'],
    pageCount: 'X+200 hlm',
    coverType: 'Soft Cover',
    coverKey: 'menjadi-buddha',
    berat: 0.4,
    pemasukanDivisi: 'MAD',
    coaNoAkun: '40004',
    coaNamaAkun: 'Pendapatan Salur - Menjadi Buddha di Tempat Kerja',
    detailedInfo: {
      fullTitle: 'Menjadi Buddha di Tempat Kerja: 8 Langkah Praktis Menghadapi Tekanan Hidup dan Karier',
      author: 'Franz Metcalf & BJ Gallagher',
      publisher: 'Penerbit Yayasan Pengembangan dan Pelestarian Lamrim Nusantara',
      dimensions: '21 x 14.8 x 1.2 mm',
      pages: 'xvi+192',
      cover: 'Soft Cover',
      isbn: '978-623-6632-05-5',
      year: '2021',
      priceFormatted: 'Rp125.000',
      quote: '”Sebuah karya yang sangat relevan dan menyegarkan bagi para pekerja kantoran modern yang mencari kedamaian batin tanpa harus meninggalkan karier profesionalnya.” - Work & Peace Journal',
      description: 'Menghadirkan kebijaksanaan timur dalam dinamika kantor modern. Buku ini menyajikan solusi aplikatif dan reflektif untuk menghadapi bos yang sulit, rekan kerja yang kompetitif, beban kerja yang berlebih, serta kecemasan akan masa depan karier. Melalui latihan kewaspadaan penuh (mindfulness) dan etika bajik, setiap orang dapat mengubah tempat kerjanya menjadi ladang praktik spiritual yang membahagiakan.',
    },
  },
];

export const CROSS_SELLING_BOOKS: SalurProduct[] = [
  {
    id: 'cs-1',
    title: 'Lakon Hidup Sang Penerang',
    price: 89000,
    stock: 100,
    category: 'Welas Asih',
    coverKey: 'lakon-hidup',
    berat: 0.3,
    coaNoAkun: '40006',
    coaNamaAkun: 'Pendapatan Salur - Lakon Hidup Sang Penerang',
  },
  {
    id: 'cs-2',
    title: 'Intisari Amerta',
    price: 100000,
    stock: 100,
    category: 'TJMP',
    coverKey: 'intisari-amerta',
    berat: 0.4,
    coaNoAkun: '40007',
    coaNamaAkun: 'Pendapatan Salur - Intisari Amerta',
  },
  {
    id: 'cs-3',
    title: 'The Leader’s Way',
    price: 125000,
    stock: 100,
    category: 'Umum',
    coverKey: 'leaders-way',
    berat: 0.5,
    coaNoAkun: '40005',
    coaNamaAkun: "Pendapatan Salur - The Leader's Way",
  },
];

export const ALL_DEFAULT_SALUR_ITEMS: SalurProduct[] = [
  ...INITIAL_BOOKS,
  ...CROSS_SELLING_BOOKS,
  {
    id: 'book-4',
    title: "The Leader's Way",
    subtitle: 'Buku Berbayar, BLW - 2021',
    subJenis: 'Buku Berbayar',
    price: 135000,
    stock: 85,
    printedCount: 700,
    author: 'Dalai Lama XIV & Laurens van den Muyzenberg',
    publisher: 'Penerbit Kadam Choeling',
    categories: ['Kepemimpinan', 'Umum'],
    pageCount: 'X+200 hlm',
    coverType: 'Soft Cover',
    coverKey: 'leaders-way',
    coaNoAkun: '40005',
    coaNamaAkun: "Pendapatan Salur - The Leader's Way",
  },
  {
    id: 'book-5',
    title: 'Dhammapada Bahasa Indonesia',
    subtitle: 'Buku Tidak Berbayar, DBI - 2021',
    subJenis: 'Buku Tidak Berbayar',
    price: 0,
    stock: 150,
    printedCount: 1000,
    author: 'Tim Penerjemah YPPLN',
    publisher: 'Penerbit Kadam Choeling',
    categories: ['Welas Asih', 'TJMP'],
    pageCount: 'XII+180 hlm',
    coverType: 'Soft Cover',
    coverKey: 'jalan-menuju',
  },
  {
    id: 'book-6',
    title: 'Buku Paritta Suci YPPLN',
    subtitle: 'Buku Tidak Berbayar, BPS - 2021',
    subJenis: 'Buku Tidak Berbayar',
    price: 0,
    stock: 200,
    printedCount: 1500,
    author: 'YPPLN Liturgi Team',
    publisher: 'Penerbit Kadam Choeling',
    categories: ['Umum', 'Welas Asih'],
    pageCount: 'VIII+120 hlm',
    coverType: 'Soft Cover',
    coverKey: 'demi-kepentingan',
  },
  {
    id: 'book-7',
    title: 'Buku Panduan Meditasi Praktis',
    subtitle: 'Buku Non-YPPLN, BMP - 2021',
    subJenis: 'Buku Non-YPPLN',
    price: 95000,
    stock: 45,
    printedCount: 500,
    author: 'Bhante Gunaratana',
    publisher: 'Penerbit Karaniya',
    categories: ['Umum', 'Meditasi'],
    pageCount: 'XIV+210 hlm',
    coverType: 'Soft Cover',
    coverKey: 'menjadi-buddha',
    coaNoAkun: '49999',
    coaNamaAkun: 'Pendapatan Lain-Lain',
  },
  {
    id: 'item-8',
    title: 'T-Shirt Meditasi S-SALUR',
    subtitle: 'Merchandise T-Shirt, TSM - 2021',
    subJenis: 'T-Shirt',
    price: 125000,
    stock: 50,
    printedCount: 300,
    author: 'Tim Kreatif YPPLN',
    publisher: 'YPPLN Merchandise',
    categories: ['Merchandise', 'Kaos'],
    pageCount: '-',
    coverType: 'Katun Combed 30s',
    coaNoAkun: '49999',
    coaNamaAkun: 'Pendapatan Lain-Lain',
  },
  {
    id: 'item-9',
    title: 'Note Book Sadhana Harian',
    subtitle: 'Merchandise Note Book, NSH - 2021',
    subJenis: 'Note Book',
    price: 50000,
    stock: 120,
    printedCount: 500,
    author: 'Tim Desain S-SALUR',
    publisher: 'YPPLN Merchandise',
    categories: ['Merchandise', 'Alat Tulis'],
    pageCount: '160 hlm bergaris',
    coverType: 'Hard Cover Spiral',
    coaNoAkun: '49999',
    coaNamaAkun: 'Pendapatan Lain-Lain',
  },
  {
    id: 'item-10',
    title: 'Dupa Aromaterapi Cendana',
    subtitle: 'Lain-lain Non-YPPLN, DAC - 2021',
    subJenis: 'Lain-lain Non-YPPLN',
    price: 35000,
    stock: 30,
    printedCount: 200,
    author: 'Pengrajin Bali Dharma',
    publisher: 'Mitra S-SALUR',
    categories: ['Lain-lain', 'Perlengkapan'],
    pageCount: '50 batang',
    coverType: 'Tabung Segel',
    coaNoAkun: '49999',
    coaNamaAkun: 'Pendapatan Lain-Lain',
  },

  {
    id: 'item-11',
    title: 'E-Book Lamrim Chenmo',
    subtitle: 'Google Play Books Digital, GBO - 2021',
    subJenis: 'Google Books',
    price: 75000,
    stock: 0,
    printedCount: 0,
    author: 'Je Tsongkhapa',
    publisher: 'YPPLN E-Books',
    categories: ['Digital', 'TJMP'],
    pageCount: '800 hlm PDF/EPUB',
    coverType: 'E-Book',
  },
];

export const SALUR_ITEMS_STORAGE_KEY = 'salur_items_data_v1';

export function getStoredSalurProducts(): SalurProduct[] {
  try {
    const saved = localStorage.getItem(SALUR_ITEMS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: SalurProduct) => p.id));
        const existingTitles = new Set(
          parsed.map((p: SalurProduct) => (p.title || '').toLowerCase().replace(/[\u2018\u2019`']/g, "'").trim())
        );
        const merged = [...parsed];
        for (const def of ALL_DEFAULT_SALUR_ITEMS) {
          const normDef = (def.title || '').toLowerCase().replace(/[\u2018\u2019`']/g, "'").trim();
          if (!existingIds.has(def.id) && !existingTitles.has(normDef)) {
            merged.push(def);
          }
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to load salur items from storage:', e);
  }
  return ALL_DEFAULT_SALUR_ITEMS;
}

export const SAMPLE_ADDRESSES: SalurAddress[] = [
  {
    id: 'addr-1',
    title: 'Nama 1',
    recipientName: 'Nama 1',
    phone: '0812-234-569',
    fullAddress: 'Jl. Ahmad Batahar Carry No. 123, kel. ABC, kec. ABC, Kota, Provinsi',
  },
  {
    id: 'addr-2',
    title: 'Nama 2',
    recipientName: 'Nama 2',
    phone: '0812-234-567',
    fullAddress: 'Jl. Ahmad Batahar Carry No. 123, kel. ABC, kec. ABC, Kota, Provinsi',
  },
];

export const INITIAL_SALUR_ORDERS: SalurOrder[] = [
  {
    id: 'order-mutasi-a',
    orderNumber: 'S-Call Center 21110100001',
    via: 'Call Center',
    idPembeli: '10001 Lilo',
    idPenerima: '10001 Lilo',
    customerId: '10001 Lilo',
    customerCode: '10001 Lilo',
    date: '1/Nov',
    paymentStatus: 'Paid',
    shippingStatus: 'Sudah Dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '1/Nov', type: 'teal' },
    items: [
      {
        id: 'item-mutasi-a-1',
        productId: 'book-1',
        title: 'Jalan Menuju Kemahatahuan',
        price: 125000,
        quantity: 1,
        coverKey: 'jalan-menuju',
      },
    ],
    alamat: {
      recipientName: 'Lilo',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ONS',
      noResi: 'RESI-2111-001',
      isShipped: true,
    },
    costBreakdown: {
      ongkir: 'Ongkos Kirim (1 kg): Rp10.000',
      donasi: 'Donasi: Rp10.000',
    },
    totalDana: 'Rp145.000',
    keterangan: 'Mutasi A - Transaksi Jalan Menuju Kemahatahuan',
    hasMoreProducts: false,
  },
  {
    id: 'order-hist-2017-1',
    orderNumber: 'S-Call Center 17011500001',
    via: 'Call Center',
    idPembeli: '10001 Lilo',
    idPenerima: '10001 Lilo',
    customerId: '10001 Lilo',
    customerCode: '10001 Lilo',
    date: '15 Jan 2017',
    paymentStatus: 'Paid',
    shippingStatus: 'Sudah Dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '15 Jan 2017', type: 'teal' },
    items: [
      {
        id: 'item-h17-1',
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        price: 125000,
        quantity: 360,
        coverKey: 'menjadi-buddha',
      },
    ],
    alamat: {
      recipientName: 'Lilo',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ONS',
      noResi: 'RESI-1701-001',
      isShipped: true,
    },
    totalDana: 'Rp45.000.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-hist-2018-1',
    orderNumber: 'S-Call Center 18011500001',
    via: 'Call Center',
    idPembeli: '10001 Lilo',
    idPenerima: '10001 Lilo',
    customerId: '10001 Lilo',
    customerCode: '10001 Lilo',
    date: '15 Jan 2018',
    paymentStatus: 'Paid',
    shippingStatus: 'Sudah Dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '15 Jan 2018', type: 'teal' },
    items: [
      {
        id: 'item-h18-1',
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        price: 125000,
        quantity: 420,
        coverKey: 'menjadi-buddha',
      },
    ],
    alamat: {
      recipientName: 'Lilo',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ONS',
      noResi: 'RESI-1801-001',
      isShipped: true,
    },
    totalDana: 'Rp52.500.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-hist-2019-1',
    orderNumber: 'S-Call Center 19011500001',
    via: 'Call Center',
    idPembeli: '10001 Lilo',
    idPenerima: '10001 Lilo',
    customerId: '10001 Lilo',
    customerCode: '10001 Lilo',
    date: '15 Jan 2019',
    paymentStatus: 'Paid',
    shippingStatus: 'Sudah Dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '15 Jan 2019', type: 'teal' },
    items: [
      {
        id: 'item-h19-1',
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        price: 125000,
        quantity: 500,
        coverKey: 'menjadi-buddha',
      },
    ],
    alamat: {
      recipientName: 'Lilo',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ONS',
      noResi: 'RESI-1901-001',
      isShipped: true,
    },
    totalDana: 'Rp62.500.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-hist-2020-1',
    orderNumber: 'S-Call Center 20011500001',
    via: 'Call Center',
    idPembeli: '10002 Aang',
    idPenerima: '10002 Aang',
    customerId: '10002 Aang',
    customerCode: '10002 Aang',
    date: '15 Jan 2020',
    paymentStatus: 'Paid',
    shippingStatus: 'Sudah Dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '15 Jan 2020', type: 'teal' },
    items: [
      {
        id: 'item-h20-1',
        productId: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        price: 89000,
        quantity: 1,
        coverKey: 'demi-kepentingan',
      },
      {
        id: 'item-h20-2',
        productId: 'book-1',
        title: 'Jalan Menuju Kemahatahuan',
        price: 125000,
        quantity: 1,
        coverKey: 'jalan-menuju',
      },
      {
        id: 'item-h20-3',
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        price: 125000,
        quantity: 500,
        coverKey: 'menjadi-buddha',
      },
    ],
    alamat: {
      recipientName: 'Aang',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ONS',
      noResi: 'RESI-2001-001',
      isShipped: true,
    },
    totalDana: 'Rp62.714.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-hist-2021-1',
    orderNumber: 'S-Call Center 21011500001',
    via: 'Call Center',
    idPembeli: '10001 Snowy',
    idPenerima: '10001 Snowy',
    customerId: '10001 Snowy',
    customerCode: '10001 Snowy',
    date: '15 Jan 2021',
    paymentStatus: 'Paid',
    shippingStatus: 'Sudah Dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '15 Jan 2021', type: 'teal' },
    items: [
      {
        id: 'item-h21-1',
        productId: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        price: 89000,
        quantity: 197,
        coverKey: 'demi-kepentingan',
      },
      {
        id: 'item-h21-2',
        productId: 'book-1',
        title: 'Jalan Menuju Kemahatahuan',
        price: 125000,
        quantity: 198,
        coverKey: 'jalan-menuju',
      },
      {
        id: 'item-h21-3',
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        price: 125000,
        quantity: 998,
        coverKey: 'menjadi-buddha',
      },
    ],
    alamat: {
      recipientName: 'Snowy',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ECO',
      noResi: 'RESI-2101-001',
      isShipped: true,
    },
    totalDana: 'Rp167.033.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-hist-2021-2',
    orderNumber: 'S-Call Center 21011500002',
    via: 'Call Center',
    idPembeli: '00031 Agustino Ong',
    idPenerima: '00031 Agustino Ong',
    customerId: '00031 Agustino Ong',
    customerCode: '00031 Agustino Ong',
    date: '15 Jan 2021',
    paymentStatus: 'Paid',
    shippingStatus: 'Sudah Dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '15 Jan 2021', type: 'teal' },
    items: [
      {
        id: 'item-h21-promo-1',
        productId: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        originalPrice: 89000,
        price: 80100,
        promoDiscountText: '10%',
        promo: '10%',
        quantity: 200,
        coverKey: 'demi-kepentingan',
      },
      {
        id: 'item-h21-promo-2',
        productId: 'book-1',
        title: 'Jalan Menuju Kemahatahuan',
        originalPrice: 125000,
        price: 112500,
        promoDiscountText: '10%',
        promo: '10%',
        quantity: 200,
        coverKey: 'jalan-menuju',
      },
    ],
    alamat: {
      recipientName: 'Agustino Ong',
      phone: '081234567898',
      street: 'Jl. Surya Kencana No. 31, Kel. Babakan Pasar, Bogor',
      cityProvince: 'Jawa Barat',
      postalCode: '16126',
    },
    ekspedisi: {
      name: 'TIKI REG',
      noResi: 'RESI-2101-002',
      isShipped: true,
    },
    totalDana: 'Rp38.520.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-1',
    orderNumber: 'S-Call Center 21111400003',
    via: 'Call Center',
    idPembeli: '10001 Lilo',
    idPenerima: '10001 Lilo',
    customerId: '10001 Lilo',
    customerCode: '10001 Lilo',
    date: '14 Nov 2021',
    paymentStatus: 'Paid',
    shippingStatus: 'Belum dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: 'Belum diprint', type: 'teal' },
    items: [
      {
        id: 'item-1-1',
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        price: 125000,
        quantity: 1,
        coverKey: 'menjadi-buddha',
      },
      {
        id: 'item-1-2',
        productId: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        price: 89000,
        quantity: 1,
        coverKey: 'demi-kepentingan',
      },
    ],
    alamat: {
      recipientName: 'Lilo',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ONS',
      noResi: '-',
      isShipped: false,
    },
    totalDana: 'Rp214.000',
    costBreakdown: {
      ongkir: 'Ongkos Kirim (1 kg): Rp10.000',
      donasi: 'Donasi: Rp100.000',
      kodeUnik: 'Kode Unik: Rp43',
    },
    hasMoreProducts: false,
  },
  {
    id: 'order-2',
    orderNumber: 'S-Call Center 21111400004',
    via: 'Call Center',
    idPembeli: '10002 Aang',
    idPenerima: '10002 Aang',
    customerId: '10002 Aang',
    customerCode: '10002 Aang',
    date: '14 Nov 2021',
    paymentStatus: 'Paid',
    shippingStatus: 'Belum dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: 'Belum diprint', type: 'teal' },
    items: [
      {
        id: 'item-2-1',
        productId: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        price: 89000,
        quantity: 1,
        coverKey: 'demi-kepentingan',
      },
    ],
    costBreakdown: {
      ongkir: 'Ongkos Kirim (1 kg): Rp10.000',
      donasi: 'Donasi: Rp100.000',
      kodeUnik: 'Kode Unik: Rp43',
    },
    alamat: {
      recipientName: 'Aang',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ONS',
      noResi: '-',
      isShipped: false,
    },
    totalDana: 'Rp89.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-3',
    orderNumber: 'S-Call Center 21111400005',
    via: 'Call Center',
    idPembeli: '10001 Snowy',
    idPenerima: '10005 Snowy',
    customerId: '10001 Snowy',
    customerCode: '10005 Snowy',
    date: '14 Nov 2021',
    paymentStatus: 'Paid',
    shippingStatus: 'Belum dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: '12 Nov 2021', type: 'red' },
    items: [
      {
        id: 'item-3-1',
        productId: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        price: 125000,
        quantity: 1,
        coverKey: 'menjadi-buddha',
      },
      {
        id: 'item-3-2',
        productId: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        price: 89000,
        quantity: 1,
        coverKey: 'demi-kepentingan',
      },
      {
        id: 'item-3-3',
        productId: 'book-1',
        title: 'Jalan Menuju Kemahatahuan',
        price: 125000,
        quantity: 1,
        coverKey: 'jalan-menuju',
      },
      {
        id: 'item-3-4',
        productId: 'cs-1',
        title: 'Lakon Hidup Sang Penerang',
        price: 89000,
        quantity: 1,
        coverKey: 'lakon-hidup',
      },
    ],
    costBreakdown: {
      ongkir: 'Ongkos Kirim (2 kg): Rp20.000',
      donasi: 'Donasi: Rp50.000',
      kodeUnik: 'Kode Unik: Rp88',
    },
    alamat: {
      badgeDate: '12 Nov 2021',
      recipientName: 'Snowy',
      phone: '0812-258-1235',
      street: 'Jl. ABC No. 123 RT001 RW002, kel. ABC, kec. ABC, kab. ABC, Jawa Barat 40161',
      cityProvince: 'Jawa Barat',
      postalCode: '40161',
    },
    ekspedisi: {
      name: 'TIKI ECO',
      noResi: '-',
      isShipped: false,
    },
    totalDana: 'Rp125.000',
    hasMoreProducts: false,
  },
  {
    id: 'order-4',
    orderNumber: 'S-Call Center 21111600006',
    via: 'Call Center',
    idPembeli: '00031 Agustino Ong',
    idPenerima: '00031 Agustino Ong',
    customerId: '00031 Agustino Ong',
    customerCode: '00031 Agustino Ong',
    date: '16 Nov 2021',
    paymentStatus: 'Paid',
    shippingStatus: 'Belum dikirim',
    statusBadges: ['Paid', 'Paid'],
    printStatusBadge: { text: 'Belum diprint', type: 'teal' },
    items: [
      {
        id: 'item-4-1',
        productId: 'book-1',
        title: 'Jalan Menuju Kemahatahuan',
        price: 125000,
        quantity: 1,
        coverKey: 'jalan-menuju',
      },
    ],
    costBreakdown: {
      ongkir: 'Ongkos Kirim (1 kg): Rp10.000',
      kodeUnik: 'Kode Unik: Rp31',
    },
    alamat: {
      recipientName: 'Agustino Ong',
      phone: '081234567898',
      street: 'Jl. Surya Kencana No. 31, Kel. Babakan Pasar, Bogor',
      cityProvince: 'Jawa Barat',
      postalCode: '16126',
    },
    ekspedisi: {
      name: 'TIKI REG',
      noResi: '-',
      isShipped: false,
    },
    totalDana: 'Rp135.000',
    hasMoreProducts: false,
  },
];
