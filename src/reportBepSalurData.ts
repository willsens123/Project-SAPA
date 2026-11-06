import { SalurOrder } from './salurData';
import { ModalSalurItem } from './modalSalurData';

export interface BepMutasiInflow {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  qty: number;
  price: number;
  totalNominal: number;
  paymentStatus: string;
  source: 'Transaksi S-SALUR' | 'Alokasi D-DONASI' | 'Manual Transaksi';
}

export interface BepMutasiOutflow {
  id: string;
  code: string;
  bankAccount: string;
  keterangan: string;
  date: string;
  nominal: number;
  tahun: string;
}

export interface BepItemSalurRecord {
  id: string;
  productId: string;
  title: string;
  subtitle?: string;
  price: number;
  coverKey?: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  cetak: number;
  stok: number;
  tersalurUnit: number;
  tersalurRp: number;
  bepUnit: number;
  totalModalRp: number;
  selisihBepRp: number; // tersalurRp - totalModalRp
  isBep: boolean; // tersalurRp >= totalModalRp or tersalurUnit >= bepUnit
  selisihBepUnit: number; // remaining units needed if not BEP, 0 if BEP
  inflows: BepMutasiInflow[];
  outflows: BepMutasiOutflow[];
}

// Storage keys
export const BEP_STORAGE_KEY = 'yppln_report_bep_item_salur_data_v1';
export const BEP_DIAGRAM_STORAGE_KEY = 'yppln_report_bep_item_salur_diagram_data_v1';
export const BEP_CARD_LOGOS_STORAGE_KEY = 'yppln_report_bep_card_logos_v1';

export interface BepCardLogoConfig {
  iconType: string;
  logoUrl?: string;
  bgColor: string;
}

export const DEFAULT_BEP_CARD_LOGOS: Record<'bep' | 'belumBep', BepCardLogoConfig> = {
  bep: {
    iconType: 'shopping-cart',
    logoUrl: '',
    bgColor: '#008d91',
  },
  belumBep: {
    iconType: 'globe',
    logoUrl: '',
    bgColor: '#008d91',
  },
};

export interface BepDiagramRecord {
  id: string;
  title: string;
  year?: string;
  displayLines: string[];
  isBep: boolean;
  // Belum BEP fields:
  penjualanRp: number;
  penjualanUnit: number;
  selisihBepRp: number;
  selisihBepUnit: number;
  sisaStokSetelahBepRp: number;
  sisaStokSetelahBepUnit: number;
  // Sudah BEP fields:
  penjualanUntukBepRp?: number;
  penjualanUntukBepUnit?: number;
  penjualanSetelahBepRp?: number;
  penjualanSetelahBepUnit?: number;
  sisaStokRp?: number;
  sisaStokUnit?: number;
}

export const INITIAL_BEP_DIAGRAM_RECORDS: BepDiagramRecord[] = [
  // --- Belum BEP (6 Items matching user image.png) ---
  {
    id: 'diag-belum-1',
    title: "The Leader’s Way (2019)",
    displayLines: ["The Leader’s Way", "(2019)"],
    isBep: false,
    penjualanRp: 13236900,
    penjualanUnit: 157,
    selisihBepRp: 20444350,
    selisihBepUnit: 186,
    sisaStokSetelahBepRp: 17710000,
    sisaStokSetelahBepUnit: 161,
  },
  {
    id: 'diag-belum-2',
    title: "The Leader’s Way (2019)",
    displayLines: ["The Leader’s Way", "(2019)"],
    isBep: false,
    penjualanRp: 33814000,
    penjualanUnit: 320,
    selisihBepRp: 2519750,
    selisihBepUnit: 21,
    sisaStokSetelahBepRp: 74750000,
    sisaStokSetelahBepUnit: 598,
  },
  {
    id: 'diag-belum-3',
    title: "(New) Je Tsongkhapa (2019)",
    displayLines: ["(New) Je", "Tsongkhapa (2019)"],
    isBep: false,
    penjualanRp: 15533800,
    penjualanUnit: 89,
    selisihBepRp: 2358200,
    selisihBepUnit: 14,
    sisaStokSetelahBepRp: 63180000,
    sisaStokSetelahBepUnit: 351,
  },
  {
    id: 'diag-belum-4',
    title: "The Life of My Precious Master (2019)",
    displayLines: ["The Life of My", "Precious Master", "(2019)"],
    isBep: false,
    penjualanRp: 4326000,
    penjualanUnit: 22,
    selisihBepRp: 8544000,
    selisihBepUnit: 41,
    sisaStokSetelahBepRp: 74130000,
    sisaStokSetelahBepUnit: 353,
  },
  {
    id: 'diag-belum-5',
    title: "Hati Tanpa Gentar (2020)",
    displayLines: ["Hati Tanpa Gentar", "(2020)"],
    isBep: false,
    penjualanRp: 28233600,
    penjualanUnit: 240,
    selisihBepRp: 3590290,
    selisihBepUnit: 27,
    sisaStokSetelahBepRp: 21352000,
    sisaStokSetelahBepUnit: 157,
  },
  {
    id: 'diag-belum-6',
    title: "Mengembalikan Budaya Belajar (2020)",
    displayLines: ["Mengembalikan", "Budaya Belajar", "(2020)"],
    isBep: false,
    penjualanRp: 15545560,
    penjualanUnit: 149,
    selisihBepRp: 2859815,
    selisihBepUnit: 25,
    sisaStokSetelahBepRp: 4760000,
    sisaStokSetelahBepUnit: 40,
  },

  // --- Sudah BEP (2 Items matching user image.png) ---
  {
    id: 'diag-sudah-1',
    title: "Jalan Menuju Kemahatahuan (2021)",
    displayLines: ["Jalan Menuju", "Kemahatahuan", "(2021)"],
    isBep: true,
    penjualanRp: 35023040,
    penjualanUnit: 287,
    selisihBepRp: 0,
    selisihBepUnit: 0,
    sisaStokSetelahBepRp: 54825000,
    sisaStokSetelahBepUnit: 425,
    penjualanUntukBepRp: 24768000,
    penjualanUntukBepUnit: 192,
    penjualanSetelahBepRp: 10255040,
    penjualanSetelahBepUnit: 95,
    sisaStokRp: 54825000,
    sisaStokUnit: 425,
  },
  {
    id: 'diag-sudah-2',
    title: "Harta, Tahta, dan Wanita dalam Gandhawyuha (2021)",
    displayLines: ["Harta, Tahta, dan", "Wanita dalam", "Gandhawyuha (2021)"],
    isBep: true,
    penjualanRp: 21418470,
    penjualanUnit: 228,
    selisihBepRp: 0,
    selisihBepUnit: 0,
    sisaStokSetelahBepRp: 47718000,
    sisaStokSetelahBepUnit: 482,
    penjualanUntukBepRp: 17919000,
    penjualanUntukBepUnit: 181,
    penjualanSetelahBepRp: 3499470,
    penjualanSetelahBepUnit: 47,
    sisaStokRp: 47718000,
    sisaStokUnit: 482,
  },
];

// Initial dataset strictly matching user uploaded screenshots
export const INITIAL_BEP_SALUR_RECORDS: BepItemSalurRecord[] = [
  {
    id: 'bep-item-1',
    productId: 'book-2',
    title: 'Jalan Menuju Kemahatahuan',
    subtitle: 'Buku Berbayar, JMK - 2021',
    price: 125000,
    coverKey: 'jalan-menuju',
    cetak: 700,
    stok: 100,
    tersalurUnit: 600,
    tersalurRp: 60000000, // Rp60.000.000
    bepUnit: 300,
    totalModalRp: 10000000, // Capital/modal cost
    selisihBepRp: 50000000, // +Rp50.000.000
    isBep: true,
    selisihBepUnit: 0,
    inflows: [
      {
        id: 'inf-1-1',
        orderNumber: 'CC 123456789',
        customerName: 'Lilo',
        date: '14 Nov 2021',
        qty: 120,
        price: 125000,
        totalNominal: 15000000,
        paymentStatus: 'Paid',
        source: 'Transaksi S-SALUR',
      },
      {
        id: 'inf-1-2',
        orderNumber: 'TRX-SLR-9021',
        customerName: 'Komunitas Meditasi Bandung',
        date: '10 Nov 2021',
        qty: 240,
        price: 125000,
        totalNominal: 30000000,
        paymentStatus: 'Paid',
        source: 'Transaksi S-SALUR',
      },
      {
        id: 'inf-1-3',
        orderNumber: 'TRX-SLR-8994',
        customerName: 'Vihara Jakarta Pusat',
        date: '02 Nov 2021',
        qty: 240,
        price: 125000,
        totalNominal: 15000000,
        paymentStatus: 'Paid',
        source: 'Transaksi S-SALUR',
      },
    ],
    outflows: [
      {
        id: 'out-1-1',
        code: 'DB.BA.BCA388.01.20.00018',
        bankAccount: 'BCA 388',
        keterangan: 'Modal Cetak & Royalti Buku JMK',
        date: '15 Jan 2021',
        nominal: 10000000,
        tahun: '2021',
      },
    ],
  },
  {
    id: 'bep-item-2',
    productId: 'book-1',
    title: 'Demi Kepentingan Semua Makhluk',
    subtitle: 'Buku Berbayar, BSM - 2021',
    price: 89000,
    coverKey: 'demi-kepentingan',
    cetak: 700,
    stok: 300,
    tersalurUnit: 100,
    tersalurRp: 10000000, // Rp10.000.000
    bepUnit: 300,
    totalModalRp: 460000000, // modal calculated so difference is -450.000.000
    selisihBepRp: -450000000, // -450.000.000 in screenshot
    isBep: false,
    selisihBepUnit: 45, // 45 buku in screenshot
    inflows: [
      {
        id: 'inf-2-1',
        orderNumber: 'TRX-SLR-7712',
        customerName: 'Yayasan Dharma Nusantara',
        date: '05 Nov 2021',
        qty: 100,
        price: 89000,
        totalNominal: 10000000,
        paymentStatus: 'Paid',
        source: 'Transaksi S-SALUR',
      },
    ],
    outflows: [
      {
        id: 'out-2-1',
        code: 'DB.BA.BCA388.01.20.00011',
        bankAccount: 'BCA 388',
        keterangan: 'Pembayaran Cetak Batch 1 DSM',
        date: '12 Jan 2020',
        nominal: 250000000,
        tahun: '2020',
      },
      {
        id: 'out-2-2',
        code: 'DB.BA.MDR401.05.21.00088',
        bankAccount: 'Mandiri 401',
        keterangan: 'Royalti & Hak Cipta DSM',
        date: '18 Mar 2021',
        nominal: 210000000,
        tahun: '2021',
      },
    ],
  },
  {
    id: 'bep-item-3',
    productId: 'book-3',
    title: 'Menjadi Buddha di Tempat Kerja',
    subtitle: 'Buku Berbayar, MBTK - 2021',
    price: 125000,
    coverKey: 'menjadi-buddha',
    cetak: 700,
    stok: 100,
    tersalurUnit: 600,
    tersalurRp: 60000000, // Rp60.000.000
    bepUnit: 300,
    totalModalRp: 10000000,
    selisihBepRp: 50000000, // +Rp50.000.000
    isBep: true,
    selisihBepUnit: 0,
    inflows: [
      {
        id: 'inf-3-1',
        orderNumber: 'CC 123456789',
        customerName: 'Lilo',
        date: '14 Nov 2021',
        qty: 300,
        price: 125000,
        totalNominal: 30000000,
        paymentStatus: 'Paid',
        source: 'Transaksi S-SALUR',
      },
      {
        id: 'inf-3-2',
        orderNumber: 'TRX-SLR-8841',
        customerName: 'Komunitas Professional Jakarta',
        date: '08 Nov 2021',
        qty: 300,
        price: 125000,
        totalNominal: 30000000,
        paymentStatus: 'Paid',
        source: 'Transaksi S-SALUR',
      },
    ],
    outflows: [
      {
        id: 'out-3-1',
        code: 'DB.BA.BCA388.01.21.00034',
        bankAccount: 'BCA 388',
        keterangan: 'Biaya Cetak & Pra-produksi MBTK',
        date: '20 Feb 2021',
        nominal: 10000000,
        tahun: '2021',
      },
    ],
  },
];

// Helper to format currency in Indonesian Rupiah
export function formatBepRupiah(num: number, withSign = false): string {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absNum);

  if (withSign) {
    if (num > 0) return `+Rp${formatted}`;
    if (num < 0) return `-Rp${formatted}`;
    return `Rp${formatted}`;
  }

  if (isNegative) {
    return `-Rp${formatted}`;
  }
  return `Rp${formatted}`;
}

// Helper to parse diverse date formats into comparable timestamp
export function parseDateToComparable(dateStr: string): number | null {
  if (!dateStr || !dateStr.trim()) return null;
  const s = dateStr.trim();

  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(s + 'T23:59:59').getTime();
  }

  // If DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T23:59:59`).getTime();
  }

  // Indonesian / English month names, e.g. "14 Nov 2021", "15 Januari 2021", "02 Nov 2021"
  const monthMap: Record<string, string> = {
    jan: '01', januari: '01', january: '01',
    feb: '02', februari: '02', february: '02',
    mar: '03', maret: '03', march: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06', june: '06',
    jul: '07', juli: '07', july: '07',
    agu: '08', ags: '08', agustus: '08', aug: '08', august: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10', october: '10',
    nov: '11', november: '11',
    des: '12', desember: '12', dec: '12', december: '12',
  };

  const parts = s.split(/[\s-]+/);
  if (parts.length === 3) {
    const day = parts[0].replace(/\D/g, '').padStart(2, '0');
    const mStr = parts[1].toLowerCase();
    const year = parts[2].replace(/\D/g, '');
    const month = monthMap[mStr];
    if (month && year.length === 4) {
      return new Date(`${year}-${month}-${day}T23:59:59`).getTime();
    }
  }

  // If year only, e.g. "2021"
  if (/^\d{4}$/.test(s)) {
    return new Date(`${s}-12-31T23:59:59`).getTime();
  }

  const parsed = Date.parse(s);
  if (!isNaN(parsed)) {
    return parsed;
  }
  return null;
}

export function isDateOnOrBefore(dateStr: string, filterDateStr: string): boolean {
  if (!filterDateStr) return true;
  const filterTime = parseDateToComparable(filterDateStr);
  if (!filterTime) return true;
  const targetTime = parseDateToComparable(dateStr);
  if (!targetTime) return true;
  return targetTime <= filterTime;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

// Helper to compute or reconcile BEP records with live Transaksi S-SALUR orders & Modal items with Date Filtering
export function syncBepWithLiveTransactions(
  baseRecords: BepItemSalurRecord[],
  salurOrders: SalurOrder[],
  modalItems: ModalSalurItem[],
  filterDate?: string
): BepItemSalurRecord[] {
  // If no date is set, automatically default to today's date
  const effectiveFilterDate = filterDate || new Date().toISOString().split('T')[0];

  return baseRecords.map((rec) => {
    // 1. Gather all Transaksi S-SALUR items matching this product
    const matchingOrderItems: BepMutasiInflow[] = [];
    salurOrders.forEach((order) => {
      order.items.forEach((it) => {
        const matchesProduct =
          it.productId === rec.productId ||
          it.title.toLowerCase().includes(rec.title.toLowerCase()) ||
          rec.title.toLowerCase().includes(it.title.toLowerCase());

        if (matchesProduct) {
          const itemTotal = it.price * it.quantity;
          matchingOrderItems.push({
            id: `inf-${order.id}-${it.id}`,
            orderNumber: order.orderNumber,
            customerName: order.idPenerima || order.idPembeli || 'Customer S-SALUR',
            date: order.date,
            qty: it.quantity,
            price: it.price,
            totalNominal: itemTotal,
            paymentStatus: order.paymentStatus,
            source: order.isHadiah ? 'Manual Transaksi' : 'Transaksi S-SALUR',
          });
        }
      });
    });

    // 2. Gather modal items outflows
    const matchingOutflows: BepMutasiOutflow[] = [];
    modalItems.forEach((mItem) => {
      const matchesModal =
        mItem.productId === rec.productId ||
        mItem.title.toLowerCase().includes(rec.title.toLowerCase()) ||
        rec.title.toLowerCase().includes(mItem.title.toLowerCase());

      if (matchesModal) {
        mItem.yearGroups.forEach((yg) => {
          matchingOutflows.push({
            id: `out-${mItem.id}-${yg.id}`,
            code: yg.mutasiCode || 'MUTASI-MODAL',
            bankAccount: 'BCA 388',
            keterangan: `Pembayaran Modal & Royalti ${mItem.title} (${yg.tahun})`,
            date: `01 Jan ${yg.tahun}`,
            nominal: yg.yangKitaBayar,
            tahun: yg.tahun,
          });
        });
      }
    });

    // If live transactions exist, combine or use default dataset
    const combinedInflows =
      matchingOrderItems.length > 0
        ? [...rec.inflows, ...matchingOrderItems.filter((m) => !rec.inflows.some((r) => r.id === m.id))]
        : rec.inflows;

    const combinedOutflows =
      matchingOutflows.length > 0
        ? [...rec.outflows, ...matchingOutflows.filter((m) => !rec.outflows.some((r) => r.id === m.id))]
        : rec.outflows;

    // Filter inflows and outflows strictly up to the filtered date
    const dateFilteredInflows = combinedInflows.filter((inf) =>
      isDateOnOrBefore(inf.date, effectiveFilterDate)
    );
    const dateFilteredOutflows = combinedOutflows.filter((out) =>
      isDateOnOrBefore(out.date, effectiveFilterDate)
    );

    // Calculate real numbers according to filtered transactions
    const tersalurUnit = dateFilteredInflows.reduce((sum, inf) => sum + (Number(inf.qty) || 0), 0);
    const tersalurRp = dateFilteredInflows.reduce(
      (sum, inf) => sum + (Number(inf.totalNominal) || 0),
      0
    );
    const totalModalRp = dateFilteredOutflows.reduce(
      (sum, out) => sum + (Number(out.nominal) || 0),
      0
    );

    // Stock calculation
    const stok = Math.max(0, rec.cetak - tersalurUnit);

    // BEP calculation based on filtered date
    const selisihBepRp = tersalurRp - totalModalRp;
    const isBepAchieved =
      selisihBepRp >= 0 && (totalModalRp === 0 ? tersalurUnit > 0 : true);

    // Target BEP Unit: preserve standard benchmark or calculate from modal & price
    let bepUnit = rec.bepUnit;
    if (totalModalRp !== rec.totalModalRp && totalModalRp > 0 && rec.price > 0) {
      bepUnit = Math.ceil(totalModalRp / rec.price);
    } else if (totalModalRp === 0) {
      bepUnit = 0;
    }

    // Selisih BEP Unit
    let selisihBepUnit = 0;
    if (!isBepAchieved) {
      if (
        totalModalRp === rec.totalModalRp &&
        tersalurUnit === rec.tersalurUnit &&
        rec.selisihBepUnit !== undefined
      ) {
        selisihBepUnit = rec.selisihBepUnit;
      } else {
        selisihBepUnit = Math.max(0, Math.ceil(Math.abs(selisihBepRp) / (rec.price || 1)));
      }
    }

    return {
      ...rec,
      inflows: dateFilteredInflows,
      outflows: dateFilteredOutflows,
      stok,
      tersalurUnit,
      tersalurRp,
      totalModalRp,
      bepUnit,
      selisihBepRp,
      isBep: isBepAchieved,
      selisihBepUnit,
    };
  });
}
