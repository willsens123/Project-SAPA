export interface ModalSalurVariant {
  id: string;
  tahun: string; // e.g. "2020", "2021"
  royalti: string; // e.g. "6%"
  jml: number; // e.g. 1, 200, 400
  promo?: string; // e.g. "-", "10%"
  hargaJual?: number; // e.g. 89000, 80100
  yangKitaBayar: number; // e.g. 5340, 961200
  mutasiCode?: string;
  mutasiBadgeColor?: 'teal' | 'red';
  jadwalPembayaranRoyalti?: string;
}

export interface ModalSalurConnectedMutasi {
  id: string;
  mutasiId: string;
  mutasiCode: string;
  bankAccount: string;
  date: string;
  nominal: number;
  keterangan?: string;
}

export interface ModalSalurYearGroup {
  id: string;
  tahun: string; // e.g. "2020", "2021"
  royalti: string; // e.g. "6%"
  jml: number; // e.g. 1, 400
  yangKitaBayar: number; // e.g. 5340, 1068000
  yangKitaBayarSubtext?: string; // e.g. "(+961.200)"
  mutasiCode?: string; // e.g. "DB.BA.BCA388.01.20.00018", "DB.BA.BCA388.01.20.00011"
  mutasiCodes?: string[];
  connectedMutasiList?: ModalSalurConnectedMutasi[];
  mutasiBadgeColor?: 'teal' | 'red';
  jadwalPembayaranRoyalti?: string;
  variants: ModalSalurVariant[];
}

export interface ModalSalurItem {
  id: string;
  productId: string; // links to SalurProduct.id e.g. "book-2"
  title: string;
  subtitle: string;
  stok: number;
  coverKey: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  tahun: string; // e.g. "2020-2021", "2019-2021"
  royalti: string; // e.g. "6%"
  jml: number; // e.g. 401, 2000
  yangKitaBayar: number; // e.g. 1073340, 15000000
  yangKitaBayarSubtext?: string; // e.g. "(+961.200)"
  mutasiSummaryText: string; // e.g. "2 Mutasi", "3 Mutasi"
  mutasiSummaryBadgeColor: 'teal' | 'red';
  jadwalPembayaranRoyalti?: string;
  yearGroups: ModalSalurYearGroup[];
}

export const MODAL_SALUR_STORAGE_KEY = 'yppln_modal_item_salur_data';

export const INITIAL_MODAL_SALUR_ITEMS: ModalSalurItem[] = [
  {
    id: 'modal-salur-1',
    productId: 'book-2',
    title: 'Demi Kepentingan Semua Makhluk',
    subtitle: 'Buku Berbayar, BSM - 2021',
    stok: 100,
    coverKey: 'demi-kepentingan',
    tahun: '2020-2021',
    royalti: '6%',
    jml: 401,
    yangKitaBayar: 1073340,
    yangKitaBayarSubtext: '(+961.200)',
    mutasiSummaryText: '2 Mutasi',
    mutasiSummaryBadgeColor: 'red',
    jadwalPembayaranRoyalti: '',
    yearGroups: [
      {
        id: 'dksm-yg-2020',
        tahun: '2020',
        royalti: '6%',
        jml: 1,
        yangKitaBayar: 5340,
        mutasiCode: 'DB.BA.BCA388.01.20.00018',
        mutasiCodes: ['DB.BA.BCA388.01.20.00018'],
        connectedMutasiList: [
          {
            id: 'conn-dksm-2020-1',
            mutasiId: 'mutasi-bca388-18',
            mutasiCode: 'DB.BA.BCA388.01.20.00018',
            bankAccount: 'BCA 388',
            date: '15/Jan/20',
            nominal: 5340,
            keterangan: 'TRSF E-BANKING DB.BA.BCA388.01.20.00018 Pembayaran Royalti Demi Kepentingan Semua Makhluk 2020',
          },
        ],
        mutasiBadgeColor: 'teal',
        jadwalPembayaranRoyalti: '',
        variants: [
          {
            id: 'dksm-var-2020-1',
            tahun: '2020',
            royalti: '6%',
            jml: 1,
            promo: '-',
            hargaJual: 89000,
            yangKitaBayar: 5340,
          },
        ],
      },
      {
        id: 'dksm-yg-2021',
        tahun: '2021',
        royalti: '6%',
        jml: 400,
        yangKitaBayar: 1068000,
        yangKitaBayarSubtext: '(+961.200)',
        mutasiCode: 'DB.BA.BCA388.01.20.00011',
        mutasiCodes: ['DB.BA.BCA388.01.20.00011'],
        connectedMutasiList: [
          {
            id: 'conn-dksm-2021-1',
            mutasiId: 'mutasi-bca388-11',
            mutasiCode: 'DB.BA.BCA388.01.20.00011',
            bankAccount: 'BCA 388',
            date: '15/Jan/21',
            nominal: 1068000,
            keterangan: 'TRSF E-BANKING DB.BA.BCA388.01.20.00011 Pembayaran Royalti Demi Kepentingan Semua Makhluk 2021',
          },
        ],
        mutasiBadgeColor: 'red',
        jadwalPembayaranRoyalti: '',
        variants: [
          {
            id: 'dksm-var-2021-1',
            tahun: '2021',
            royalti: '6%',
            jml: 200,
            promo: '-',
            hargaJual: 89000,
            yangKitaBayar: 1068000,
          },
          {
            id: 'dksm-var-2021-2',
            tahun: '2021',
            royalti: '6%',
            jml: 200,
            promo: '10%',
            hargaJual: 80100,
            yangKitaBayar: 961200,
          },
        ],
      },
    ],
  },
  {
    id: 'modal-salur-2',
    productId: 'book-1',
    title: 'Jalan Menuju Kemahatahuan',
    subtitle: 'Buku Berbayar, BJM - 2021',
    stok: 100,
    coverKey: 'jalan-menuju',
    tahun: '2020-2021',
    royalti: '6%',
    jml: 401,
    yangKitaBayar: 1073340,
    yangKitaBayarSubtext: '(+961.200)',
    mutasiSummaryText: '2 Mutasi',
    mutasiSummaryBadgeColor: 'red',
    jadwalPembayaranRoyalti: '',
    yearGroups: [
      {
        id: 'jmk-yg-2020',
        tahun: '2020',
        royalti: '6%',
        jml: 1,
        yangKitaBayar: 5340,
        mutasiCode: 'DB.BA.BCA388.01.20.00007',
        mutasiCodes: ['DB.BA.BCA388.01.20.00007'],
        connectedMutasiList: [
          {
            id: 'conn-jmk-2020-1',
            mutasiId: 'mutasi-bca388-7',
            mutasiCode: 'DB.BA.BCA388.01.20.00007',
            bankAccount: 'BCA 388',
            date: '15/Jan/20',
            nominal: 5340,
            keterangan: 'TRSF E-BANKING DB.BA.BCA388.01.20.00007 Pembayaran Royalti Jalan Menuju Kemahatahuan 2020',
          },
        ],
        mutasiBadgeColor: 'teal',
        jadwalPembayaranRoyalti: '',
        variants: [
          {
            id: 'jmk-var-2020-1',
            tahun: '2020',
            royalti: '6%',
            jml: 1,
            promo: '-',
            hargaJual: 125000,
            yangKitaBayar: 5340,
          },
        ],
      },
      {
        id: 'jmk-yg-2021',
        tahun: '2021',
        royalti: '6%',
        jml: 400,
        yangKitaBayar: 1068000,
        yangKitaBayarSubtext: '(+961.200)',
        mutasiCode: 'DB.BA.BCA388.01.20.00008',
        mutasiCodes: ['DB.BA.BCA388.01.20.00008'],
        connectedMutasiList: [
          {
            id: 'conn-jmk-2021-1',
            mutasiId: 'mutasi-bca388-8',
            mutasiCode: 'DB.BA.BCA388.01.20.00008',
            bankAccount: 'BCA 388',
            date: '15/Jan/21',
            nominal: 1068000,
            keterangan: 'TRSF E-BANKING DB.BA.BCA388.01.20.00008 Pembayaran Royalti Jalan Menuju Kemahatahuan 2021',
          },
        ],
        mutasiBadgeColor: 'red',
        jadwalPembayaranRoyalti: '',
        variants: [
          {
            id: 'jmk-var-2021-1',
            tahun: '2021',
            royalti: '6%',
            jml: 200,
            promo: '-',
            hargaJual: 125000,
            yangKitaBayar: 7500,
          },
          {
            id: 'jmk-var-2021-2',
            tahun: '2021',
            royalti: '6%',
            jml: 200,
            promo: '10%',
            hargaJual: 112500,
            yangKitaBayar: 961200,
          },
        ],
      },
    ],
  },
  {
    id: 'modal-salur-3',
    productId: 'book-3',
    title: 'Menjadi Buddha di Tempat Kerja',
    subtitle: 'Buku Berbayar, BMB - 2021',
    stok: 100,
    coverKey: 'menjadi-buddha',
    tahun: '2019-2021',
    royalti: '6%',
    jml: 2000,
    yangKitaBayar: 15000000,
    mutasiSummaryText: '3 Mutasi',
    mutasiSummaryBadgeColor: 'teal',
    jadwalPembayaranRoyalti: '',
    yearGroups: [
      {
        id: 'mbk-yg-2019',
        tahun: '2019',
        royalti: '6%',
        jml: 500,
        yangKitaBayar: 3750000,
        mutasiCode: 'DB.BA.BCA388.01.19.00005',
        mutasiCodes: ['DB.BA.BCA388.01.19.00005'],
        connectedMutasiList: [
          {
            id: 'conn-mbk-2019-1',
            mutasiId: 'mutasi-bca388-mbk-19',
            mutasiCode: 'DB.BA.BCA388.01.19.00005',
            bankAccount: 'BCA 388',
            date: '15/Jan/19',
            nominal: 3750000,
            keterangan: 'TRSF E-BANKING DB.BA.BCA388.01.19.00005 Pembayaran Royalti Menjadi Buddha di Tempat Kerja 2019',
          },
        ],
        mutasiBadgeColor: 'teal',
        jadwalPembayaranRoyalti: '',
        variants: [
          {
            id: 'mbk-var-2019-1',
            tahun: '2019',
            royalti: '6%',
            jml: 500,
            promo: '-',
            hargaJual: 125000,
            yangKitaBayar: 3750000,
          },
        ],
      },
      {
        id: 'mbk-yg-2020',
        tahun: '2020',
        royalti: '6%',
        jml: 500,
        yangKitaBayar: 3750000,
        mutasiCode: 'DB.BA.BCA388.01.20.00002',
        mutasiCodes: ['DB.BA.BCA388.01.20.00002'],
        connectedMutasiList: [
          {
            id: 'conn-mbk-2020-1',
            mutasiId: 'mutasi-bca388-mbk-20',
            mutasiCode: 'DB.BA.BCA388.01.20.00002',
            bankAccount: 'BCA 388',
            date: '15/Jan/20',
            nominal: 3750000,
            keterangan: 'TRSF E-BANKING DB.BA.BCA388.01.20.00002 Pembayaran Royalti Menjadi Buddha di Tempat Kerja 2020',
          },
        ],
        mutasiBadgeColor: 'teal',
        jadwalPembayaranRoyalti: '',
        variants: [
          {
            id: 'mbk-var-2020-1',
            tahun: '2020',
            royalti: '6%',
            jml: 500,
            promo: '-',
            hargaJual: 125000,
            yangKitaBayar: 3750000,
          },
        ],
      },
      {
        id: 'mbk-yg-2021',
        tahun: '2021',
        royalti: '6%',
        jml: 1000,
        yangKitaBayar: 7500000,
        mutasiCode: 'DB.BA.BCA388.01.21.00009',
        mutasiCodes: ['DB.BA.BCA388.01.21.00009'],
        connectedMutasiList: [
          {
            id: 'conn-mbk-2021-1',
            mutasiId: 'mutasi-bca388-mbk-21',
            mutasiCode: 'DB.BA.BCA388.01.21.00009',
            bankAccount: 'BCA 388',
            date: '15/Jan/21',
            nominal: 7500000,
            keterangan: 'TRSF E-BANKING DB.BA.BCA388.01.21.00009 Pembayaran Royalti Menjadi Buddha di Tempat Kerja 2021',
          },
        ],
        mutasiBadgeColor: 'teal',
        jadwalPembayaranRoyalti: '',
        variants: [
          {
            id: 'mbk-var-2021-1',
            tahun: '2021',
            royalti: '6%',
            jml: 1000,
            promo: '-',
            hargaJual: 125000,
            yangKitaBayar: 7500000,
          },
        ],
      },
    ],
  },
];

/**
 * Extracts 4-digit year from date string (e.g. "14 Nov 2021" -> "2021")
 */
export function extractYearFromDate(dateStr?: string): string {
  if (!dateStr) return '2021';
  const match = dateStr.match(/\b(19\d\d|20\d\d)\b/);
  if (match) return match[1];
  // Check 2-digit year at end of slash e.g. "15/Jan/21"
  const slashMatch = dateStr.match(/\/(\d{2})$/);
  if (slashMatch) return `20${slashMatch[1]}`;
  return '2021';
}

/**
 * Parses royalty percentage number e.g. "6%" -> 6
 */
export function parseRoyaltyPercentage(royaltiStr?: string): number {
  if (!royaltiStr) return 6;
  const clean = royaltiStr.replace(/[^\d.]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) || parsed <= 0 ? 6 : parsed;
}

/**
 * Recalculates badge status, amounts, and parent aggregates for a ModalSalurItem
 */
export function recalculateModalSalurItem(item: ModalSalurItem): ModalSalurItem {
  const yearGroups = item.yearGroups.map((yg) => {
    const totalJml = yg.variants.reduce((s, v) => s + v.jml, 0);
    const totalYangKitaBayar = yg.variants.reduce((s, v) => s + v.yangKitaBayar, 0);

    const paidFromList = (yg.connectedMutasiList || []).reduce((s, c) => s + c.nominal, 0);
    const hasList = yg.connectedMutasiList && yg.connectedMutasiList.length > 0;

    // Effective paid is paidFromList if present, or fallback to yg.yangKitaBayar if it was originally teal
    const effectivePaid = hasList
      ? paidFromList
      : (yg.mutasiBadgeColor === 'teal' ? totalYangKitaBayar : yg.yangKitaBayar);

    const isKurangBayar = effectivePaid < totalYangKitaBayar;
    const diff = totalYangKitaBayar - effectivePaid;

    const allCodes = new Set<string>();
    if (yg.mutasiCodes) yg.mutasiCodes.forEach((c) => allCodes.add(c));
    if (yg.mutasiCode) allCodes.add(yg.mutasiCode);
    if (yg.connectedMutasiList) yg.connectedMutasiList.forEach((c) => allCodes.add(c.mutasiCode));

    const codesArr = Array.from(allCodes).filter(Boolean);

    return {
      ...yg,
      jml: totalJml > 0 ? totalJml : yg.jml,
      yangKitaBayar: totalYangKitaBayar > 0 ? totalYangKitaBayar : yg.yangKitaBayar,
      mutasiBadgeColor: (isKurangBayar ? 'red' : 'teal') as 'red' | 'teal',
      yangKitaBayarSubtext: isKurangBayar && diff > 0 ? `(+${diff.toLocaleString('id-ID')})` : undefined,
      mutasiCodes: codesArr,
      mutasiCode: codesArr[0] || yg.mutasiCode,
    };
  });

  const totalJml = yearGroups.reduce((s, yg) => s + yg.jml, 0);
  const totalYangKitaBayar = yearGroups.reduce((s, yg) => s + yg.yangKitaBayar, 0);

  const years = yearGroups.map((yg) => yg.tahun).filter(Boolean);
  const sortedYears = Array.from(new Set(years)).sort();
  const yearRange =
    sortedYears.length > 1
      ? `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`
      : sortedYears[0] || item.tahun;

  const allCodes = new Set<string>();
  yearGroups.forEach((yg) => {
    (yg.mutasiCodes || []).forEach((c) => allCodes.add(c));
    if (yg.mutasiCode) allCodes.add(yg.mutasiCode);
  });

  const hasAnyKurangBayar = yearGroups.some((yg) => yg.mutasiBadgeColor === 'red');
  const codesCount = allCodes.size;

  let totalUnpaidDiff = 0;
  yearGroups.forEach((yg) => {
    if (yg.mutasiBadgeColor === 'red') {
      const paid = (yg.connectedMutasiList || []).reduce((s, c) => s + c.nominal, 0);
      const effectivePaid = yg.connectedMutasiList && yg.connectedMutasiList.length > 0 ? paid : 0;
      const diff = yg.yangKitaBayar - effectivePaid;
      if (diff > 0) totalUnpaidDiff += diff;
    }
  });

  return {
    ...item,
    tahun: yearRange,
    jml: totalJml,
    yangKitaBayar: totalYangKitaBayar,
    yangKitaBayarSubtext:
      hasAnyKurangBayar && totalUnpaidDiff > 0
        ? `(+${totalUnpaidDiff.toLocaleString('id-ID')})`
        : undefined,
    mutasiSummaryText:
      codesCount > 1 ? `${codesCount} Mutasi` : codesCount === 1 ? Array.from(allCodes)[0] : 'Belum Ada Mutasi',
    mutasiSummaryBadgeColor: hasAnyKurangBayar ? 'red' : 'teal',
    yearGroups,
  };
}

/**
 * Synchronizes Modal Item S-SALUR with Transaksi S-SALUR in real-time.
 * Rule:
 * - Tahun: tahun transaksi dari transaksi lunas di Transaksi S-SALUR
 * - Jml: total kuantitas item yang terjual pada transaksi lunas
 * - Promo: promo yang digunakan pada transaksi lunas (atau '-' jika harga normal)
 * - Harga Jual: harga jual item pada transaksi lunas
 * - Yang kita bayar: total royalti yang harus dibayar per tahunnya (Jml * Harga Jual * Royalti%)
 */
export function syncModalSalurWithOrders(
  modalItems: ModalSalurItem[],
  salurOrders: any[],
  _mutasiItems: any[]
): ModalSalurItem[] {
  const baseItems = modalItems && modalItems.length > 0 ? modalItems : INITIAL_MODAL_SALUR_ITEMS;
  if (!salurOrders || salurOrders.length === 0) {
    return baseItems.map(recalculateModalSalurItem);
  }

  // Filter orders: LUNAS (Paid) transactions
  const isPaidOrder = (ord: any) => {
    if (!ord) return false;
    const paymentStatus = (ord.paymentStatus || '').toLowerCase();
    if (paymentStatus === 'paid' || paymentStatus === 'lunas') return true;
    if (Array.isArray(ord.statusBadges)) {
      return ord.statusBadges.some(
        (b: string) => typeof b === 'string' && (b.toLowerCase() === 'paid' || b.toLowerCase() === 'lunas')
      );
    }
    return false;
  };

  const qualifiedOrders = (salurOrders || []).filter(isPaidOrder);

  interface LiveSoldItem {
    orderId: string;
    orderNumber: string;
    date: string;
    year: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    promo: string;
    productId?: string;
    title: string;
    coverKey?: any;
  }

  const allLiveSoldItems: LiveSoldItem[] = [];

  qualifiedOrders.forEach((ord: any) => {
    const year = extractYearFromDate(ord.date);
    (ord.items || []).forEach((it: any) => {
      // Determine promo label
      let promoLabel = it.promo || it.promoDiscountText || ord.promo || ord.promoName;
      if (!promoLabel || promoLabel === '-') {
        if (it.originalPrice && it.originalPrice !== it.price && it.originalPrice > 0) {
          const discountPct = Math.round(((it.originalPrice - it.price) / it.originalPrice) * 100);
          promoLabel = `${discountPct}%`;
        } else {
          promoLabel = '-';
        }
      }

      allLiveSoldItems.push({
        orderId: ord.id || ord.orderNumber,
        orderNumber: ord.orderNumber || '',
        date: ord.date || '',
        year,
        quantity: it.quantity || 1,
        price: it.price || 0,
        originalPrice: it.originalPrice,
        promo: promoLabel,
        productId: it.productId,
        title: it.title || '',
        coverKey: it.coverKey,
      });
    });
  });

  // Track titles already in modal items
  const processedModalItems = baseItems.map((mItem) => {
    // Find all live items matching this mItem
    const matchingLiveItems = allLiveSoldItems.filter((li) => {
      if (li.productId && mItem.productId && li.productId === mItem.productId) return true;
      const liTitle = li.title.toLowerCase().trim();
      const mTitle = mItem.title.toLowerCase().trim();
      return (
        liTitle === mTitle ||
        (liTitle && mTitle && (liTitle.includes(mTitle) || mTitle.includes(liTitle)))
      );
    });

    if (matchingLiveItems.length === 0) {
      return recalculateModalSalurItem({
        ...mItem,
        tahun: '-',
        jml: 0,
        yangKitaBayar: 0,
        yangKitaBayarSubtext: undefined,
        mutasiSummaryText: 'Belum Ada Mutasi',
        mutasiSummaryBadgeColor: 'red',
        yearGroups: [],
      });
    }

    // Group matching live items by year
    const liveItemsByYear: Record<string, LiveSoldItem[]> = {};
    matchingLiveItems.forEach((li) => {
      if (!liveItemsByYear[li.year]) liveItemsByYear[li.year] = [];
      liveItemsByYear[li.year].push(li);
    });

    // Generate Year Groups dynamically from live paid transactions
    const sortedYears = Object.keys(liveItemsByYear).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const updatedYearGroups: ModalSalurYearGroup[] = sortedYears.map((yr) => {
      const liveForThisYear = liveItemsByYear[yr] || [];
      const existingYg = mItem.yearGroups.find((yg) => yg.tahun === yr);
      const royaltyRate = parseRoyaltyPercentage(existingYg?.royalti || mItem.royalti) / 100;

      // Group live items of this year by (promo, price)
      const liveVariantsGrouped: Record<
        string,
        { promo: string; hargaJual: number; jml: number; yangKitaBayar: number }
      > = {};

      liveForThisYear.forEach((li) => {
        const key = `${li.promo}__${li.price}`;
        if (!liveVariantsGrouped[key]) {
          liveVariantsGrouped[key] = {
            promo: li.promo,
            hargaJual: li.price,
            jml: 0,
            yangKitaBayar: 0,
          };
        }
        liveVariantsGrouped[key].jml += li.quantity;
      });

      // Calculate yangKitaBayar for each live group
      Object.values(liveVariantsGrouped).forEach((grp) => {
        grp.yangKitaBayar = Math.round(grp.jml * grp.hargaJual * royaltyRate);
      });

      // Create variants directly from live items
      const variants: ModalSalurVariant[] = Object.entries(liveVariantsGrouped).map(
        ([_key, grp], idx) => {
          const existingVar = existingYg?.variants.find(
            (v) => (v.promo || '-') === grp.promo && v.hargaJual === grp.hargaJual
          );
          return {
            id: existingVar?.id || `${mItem.id}-var-${yr}-${idx + 1}`,
            tahun: yr,
            royalti: existingYg?.royalti || mItem.royalti,
            jml: grp.jml,
            promo: grp.promo,
            hargaJual: grp.hargaJual,
            yangKitaBayar: grp.yangKitaBayar,
            jadwalPembayaranRoyalti: existingVar?.jadwalPembayaranRoyalti,
          };
        }
      );

      const totalYearJml = variants.reduce((s, v) => s + v.jml, 0);
      const totalYearYangKitaBayar = variants.reduce((s, v) => s + v.yangKitaBayar, 0);

      // Mutasi calculation
      const connectedList = existingYg?.connectedMutasiList || [];
      const paidFromList = connectedList.reduce((s, c) => s + c.nominal, 0);
      const hasMutasiList = connectedList.length > 0;

      let effectivePaid = 0;
      if (hasMutasiList) {
        effectivePaid = paidFromList;
      } else if (existingYg?.mutasiCode) {
        effectivePaid =
          existingYg.mutasiBadgeColor === 'teal'
            ? totalYearYangKitaBayar
            : existingYg.yangKitaBayar || 0;
      }

      const isKurangBayar = effectivePaid < totalYearYangKitaBayar;
      const diff = totalYearYangKitaBayar - effectivePaid;

      const allCodes = new Set<string>();
      if (existingYg?.mutasiCodes) existingYg.mutasiCodes.forEach((c) => allCodes.add(c));
      if (existingYg?.mutasiCode) allCodes.add(existingYg.mutasiCode);
      if (connectedList) connectedList.forEach((c) => allCodes.add(c.mutasiCode));
      const codesArr = Array.from(allCodes).filter(Boolean);

      return {
        id: existingYg?.id || `${mItem.id}-yg-${yr}`,
        tahun: yr,
        royalti: existingYg?.royalti || mItem.royalti,
        jml: totalYearJml,
        yangKitaBayar: totalYearYangKitaBayar,
        yangKitaBayarSubtext:
          isKurangBayar && diff > 0 ? `(+${diff.toLocaleString('id-ID')})` : undefined,
        mutasiCode: codesArr[0] || existingYg?.mutasiCode,
        mutasiCodes: codesArr,
        connectedMutasiList: connectedList,
        mutasiBadgeColor: (codesArr.length === 0 || isKurangBayar ? 'red' : 'teal') as 'red' | 'teal',
        jadwalPembayaranRoyalti: existingYg?.jadwalPembayaranRoyalti,
        variants,
      };
    });

    return recalculateModalSalurItem({
      ...mItem,
      yearGroups: updatedYearGroups,
    });
  });

  // Check if any products in paid orders are completely new to modalItems
  const knownTitles = new Set(processedModalItems.map((m) => m.title.toLowerCase().trim()));
  const unhandledLiveItems = allLiveSoldItems.filter(
    (li) => !knownTitles.has(li.title.toLowerCase().trim())
  );

  if (unhandledLiveItems.length > 0) {
    const unhandledByTitle: Record<string, LiveSoldItem[]> = {};
    unhandledLiveItems.forEach((li) => {
      if (!unhandledByTitle[li.title]) unhandledByTitle[li.title] = [];
      unhandledByTitle[li.title].push(li);
    });

    Object.entries(unhandledByTitle).forEach(([title, items]) => {
      const first = items[0];
      const defaultRoyalty = '6%';
      const royaltyRate = 0.06;

      const itemsByYear: Record<string, LiveSoldItem[]> = {};
      items.forEach((it) => {
        if (!itemsByYear[it.year]) itemsByYear[it.year] = [];
        itemsByYear[it.year].push(it);
      });

      const yearGroups: ModalSalurYearGroup[] = Object.entries(itemsByYear).map(
        ([yr, yrItems]) => {
          const liveVariantsGrouped: Record<
            string,
            { promo: string; hargaJual: number; jml: number; yangKitaBayar: number }
          > = {};

          yrItems.forEach((li) => {
            const key = `${li.promo}__${li.price}`;
            if (!liveVariantsGrouped[key]) {
              liveVariantsGrouped[key] = {
                promo: li.promo,
                hargaJual: li.price,
                jml: 0,
                yangKitaBayar: 0,
              };
            }
            liveVariantsGrouped[key].jml += li.quantity;
          });

          const variants: ModalSalurVariant[] = Object.entries(liveVariantsGrouped).map(
            ([_k, grp], idx) => {
              const yangKitaBayar = Math.round(grp.jml * grp.hargaJual * royaltyRate);
              return {
                id: `live-var-${yr}-${idx}`,
                tahun: yr,
                royalti: defaultRoyalty,
                jml: grp.jml,
                promo: grp.promo,
                hargaJual: grp.hargaJual,
                yangKitaBayar,
              };
            }
          );

          const totalJml = variants.reduce((s, v) => s + v.jml, 0);
          const totalYangKitaBayar = variants.reduce((s, v) => s + v.yangKitaBayar, 0);

          return {
            id: `yg-live-${yr}-${first.productId || title}`,
            tahun: yr,
            royalti: defaultRoyalty,
            jml: totalJml,
            yangKitaBayar: totalYangKitaBayar,
            yangKitaBayarSubtext: `(+${totalYangKitaBayar.toLocaleString('id-ID')})`,
            mutasiBadgeColor: 'red',
            variants,
          };
        }
      );

      yearGroups.sort((a, b) => parseInt(a.tahun, 10) - parseInt(b.tahun, 10));

      const totalJml = yearGroups.reduce((s, yg) => s + yg.jml, 0);
      const totalYangKitaBayar = yearGroups.reduce((s, yg) => s + yg.yangKitaBayar, 0);
      const years = yearGroups.map((yg) => yg.tahun);
      const yearRange =
        years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : years[0] || '2021';

      const newItem: ModalSalurItem = recalculateModalSalurItem({
        id: `modal-salur-${first.productId || Date.now()}`,
        productId: first.productId || `prod-${Date.now()}`,
        title: title,
        subtitle: 'Buku Berbayar',
        stok: 100,
        coverKey: first.coverKey || 'lakon-hidup',
        tahun: yearRange,
        royalti: defaultRoyalty,
        jml: totalJml,
        yangKitaBayar: totalYangKitaBayar,
        mutasiSummaryText: 'Belum Ada Mutasi',
        mutasiSummaryBadgeColor: 'red',
        yearGroups,
      });

      processedModalItems.push(newItem);
    });
  }

  return processedModalItems;
}

