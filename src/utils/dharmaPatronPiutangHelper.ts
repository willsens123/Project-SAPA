import { DharmaPatronRutinItem, MutasiItem } from '../types';
import { DonasiOrder } from '../donasiData';

export interface PatronRealtimeReport {
  piutang: number;
  bulanPiutang: string;
  unpaidMonths: string[];
  paidMonths: string[];
  matchingLunasOrders: DonasiOrder[];
  totalLunasNominal: number;
}

const INDO_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTH_ALIASES: Record<string, string> = {
  jan: 'Januari',
  januari: 'Januari',
  january: 'Januari',
  feb: 'Februari',
  februari: 'Februari',
  february: 'Februari',
  mar: 'Maret',
  maret: 'Maret',
  march: 'Maret',
  apr: 'April',
  april: 'April',
  mei: 'Mei',
  may: 'Mei',
  jun: 'Juni',
  juni: 'Juni',
  june: 'Juni',
  jul: 'Juli',
  juli: 'Juli',
  july: 'Juli',
  agu: 'Agustus',
  agt: 'Agustus',
  agustus: 'Agustus',
  aug: 'Agustus',
  august: 'Agustus',
  sep: 'September',
  september: 'September',
  okt: 'Oktober',
  oktober: 'Oktober',
  oct: 'Oktober',
  october: 'Oktober',
  nov: 'November',
  november: 'November',
  des: 'Desember',
  desember: 'Desember',
  dec: 'Desember',
  december: 'Desember',
};

/**
 * Normalizes any month string to standard Indonesian month name
 */
export function normalizeMonthName(str?: string): string | null {
  if (!str) return null;
  const cleaned = str.trim().toLowerCase();
  return MONTH_ALIASES[cleaned] || null;
}

/**
 * Extracts month names from text, handling ranges like "Oktober - November" or lists "Oktober, November"
 */
export function extractMonthsFromText(text?: string): string[] {
  if (!text) return [];
  const words = text.toLowerCase().split(/[\s,/\-_–—+&]+/);
  const found: string[] = [];

  for (const w of words) {
    const matched = normalizeMonthName(w);
    if (matched && !found.includes(matched)) {
      found.push(matched);
    }
  }

  // Handle range logic if two months found like "Oktober - November"
  if (found.length === 2 && text.includes('-')) {
    const idx1 = INDO_MONTHS.indexOf(found[0]);
    const idx2 = INDO_MONTHS.indexOf(found[1]);
    if (idx1 !== -1 && idx2 !== -1 && idx1 <= idx2) {
      const range: string[] = [];
      for (let i = idx1; i <= idx2; i++) {
        range.push(INDO_MONTHS[i]);
      }
      return range;
    }
  }

  return found;
}

/**
 * Extracts month from a date string (e.g. "14 Nov 2021", "2021-11-14", "14/11/2021" -> "November")
 */
export function getMonthFromDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // Try ISO date YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/]\d{1,2}/);
  if (isoMatch) {
    const monthNum = parseInt(isoMatch[2], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return INDO_MONTHS[monthNum - 1];
    }
  }

  // Try DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^\d{1,2}[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const monthNum = parseInt(dmyMatch[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return INDO_MONTHS[monthNum - 1];
    }
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const m = normalizeMonthName(parts[1]);
    if (m) return m;
  }
  // Try finding any month keyword
  const monthsInStr = extractMonthsFromText(trimmed);
  return monthsInStr[0] || null;
}

/**
 * Checks if a Transaksi D-DONASI order is "Lunas" (Paid).
 * Rules:
 * 1. Has 'Paid' in statusBadges (case-insensitive)
 * 2. Has Say Paid records with payment details
 * 3. Connected to Mutasi without shortfall
 * 4. Total amount is 0
 */
/**
 * Checks if a Transaksi D-DONASI order is BOTH:
 * 1. Sudah Lunas (fully paid, no deficiency)
 * 2. Terkoneksi dengan Mutasi (connected to bank mutation)
 *
 * Sesuai aturan:
 * "Summary pada 'List Dharma Patron Rutin' hanya merekap transaksi yang sudah lunas yang terkoneksi dengan mutasi."
 */
export function isDonasiOrderLunasDanKonekMutasi(
  order: DonasiOrder,
  mutasiItems: MutasiItem[] = []
): boolean {
  const rawTotal = order.totalDana ? String(order.totalDana).replace(/[^\d]/g, '') : '0';
  const targetAmount = parseFloat(rawTotal) || 0;
  if (targetAmount === 0) return true;

  // 1. Cek langsung dari linkedTransactions pada mutasiItems
  let connectedAmount = 0;
  let connectedCount = 0;

  if (mutasiItems && mutasiItems.length > 0) {
    mutasiItems.forEach((m) => {
      m.linkedTransactions?.forEach((l) => {
        const isMatch = l.orderId
          ? l.orderId === order.id
          : Boolean(order.orderNumber && l.kode === order.orderNumber);

        if (isMatch) {
          connectedCount++;
          if (l.dbCr === 'CR') {
            connectedAmount += Math.abs(l.nominalAkhir);
          } else if (l.dbCr === 'DB') {
            connectedAmount -= Math.abs(l.nominalAkhir);
          } else {
            connectedAmount += l.nominalAkhir;
          }
        }
      });
    });

    const diff = connectedAmount - targetAmount;
    // Terkoneksi mutasi dan nominal mutasi mencukupi (lunas)
    if (connectedCount > 0 && (diff >= -0.01 || Math.abs(diff) < 1)) {
      return true;
    }
  }

  // 2. Cek statusBadges dari order
  // Pada arsitektur aplikasi:
  // - statusBadges[0] = Say Paid
  // - statusBadges[1] = Koneksi Kode Mutasi
  // Jika statusBadges[1] adalah 'Paid' dan statusBadges[0] adalah 'Paid'
  if (
    order.statusBadges &&
    order.statusBadges.length >= 2 &&
    order.statusBadges[1]?.trim().toLowerCase() === 'paid' &&
    order.statusBadges[0]?.trim().toLowerCase() === 'paid'
  ) {
    return true;
  }

  return false;
}

export function isDonasiOrderLunas(
  order: DonasiOrder,
  mutasiItems: MutasiItem[] = []
): boolean {
  return isDonasiOrderLunasDanKonekMutasi(order, mutasiItems);
}

/**
 * Checks whether a DonasiOrder belongs to a DharmaPatronRutinItem.
 */
export function isOrderMatchingPatron(
  order: DonasiOrder,
  patron: DharmaPatronRutinItem
): boolean {
  const patronNo = (patron.noDonatur || '').toLowerCase().trim();
  const patronIdent = (patron.identitasId || '').toLowerCase().trim();
  const patronName = (patron.namaDonatur || '').toLowerCase().trim();
  const patronShort = (patron.namaPendek || patron.panggilan || '').toLowerCase().trim();

  const customerId = (order.customerId || '').toLowerCase().trim();
  const donaturName = (order.namaDonatur?.name || '').toLowerCase().trim();

  // Match by customer ID or No Donatur / Identitas ID
  if (patronNo && customerId.includes(patronNo)) return true;
  if (patronIdent && customerId.includes(patronIdent)) return true;

  // Match by customer / donatur name
  if (patronName && (customerId.includes(patronName) || donaturName.includes(patronName))) {
    return true;
  }
  if (patronName && donaturName === patronName) return true;
  if (patronShort && patronShort.length > 2 && (donaturName.includes(patronShort) || customerId.includes(patronShort))) {
    return true;
  }

  return false;
}

/**
 * Extracts the months covered and nominal for Patron donation from an order.
 */
export function extractPatronDonationDetails(
  order: DonasiOrder,
  patronDonasiPerbulan: number
): { monthsCovered: string[]; nominal: number } {
  const allItems = [...(order.items || []), ...(order.extraItems || [])];
  const patronItems = allItems.filter(
    (it) =>
      it.name.toLowerCase().includes('patron') ||
      (it.category && it.category.toLowerCase().includes('patron'))
  );

  let totalPatronNominal = 0;
  let totalQty = 0;

  if (patronItems.length > 0) {
    patronItems.forEach((it) => {
      // Parse qty from "1 x Rp100.000" or similar
      const qtyMatch = it.qtyPrice ? it.qtyPrice.match(/^(\d+)\s*x/i) : null;
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      totalQty += qty;

      const numOnly = it.qtyPrice ? it.qtyPrice.replace(/[^\d]/g, '') : '';
      const unitNominal = parseInt(numOnly, 10) || patronDonasiPerbulan;
      totalPatronNominal += unitNominal * (qtyMatch ? 1 : qty);
    });
  } else if (
    order.keterangan?.title?.toLowerCase().includes('patron') ||
    order.keterangan?.subtitle?.toLowerCase().includes('patron')
  ) {
    const rawTotal = order.totalDana ? String(order.totalDana).replace(/[^\d]/g, '') : '0';
    totalPatronNominal = parseInt(rawTotal, 10) || patronDonasiPerbulan;
    totalQty = Math.max(1, Math.round(totalPatronNominal / (patronDonasiPerbulan || 100000)));
  } else {
    // If no specific patron item found in an order that matches customer, skip
    return { monthsCovered: [], nominal: 0 };
  }

  // Determine which months are covered by this order
  const explicitMonths: string[] = [];

  // Check subtitle
  const subtitleMonths = extractMonthsFromText(order.keterangan?.subtitle);
  subtitleMonths.forEach((m) => {
    if (!explicitMonths.includes(m)) explicitMonths.push(m);
  });

  // Check title
  const titleMonths = extractMonthsFromText(order.keterangan?.title);
  titleMonths.forEach((m) => {
    if (!explicitMonths.includes(m)) explicitMonths.push(m);
  });

  // Check order date
  const dateMonth = getMonthFromDate(order.date);
  if (dateMonth && !explicitMonths.includes(dateMonth)) {
    explicitMonths.push(dateMonth);
  }

  return {
    monthsCovered: explicitMonths,
    nominal: totalPatronNominal,
  };
}

export interface PatronPiutangValidationResult {
  isValid: boolean;
  joinDate: string;
  startMonthName: string;
  currentMonthName: string;
  currentYear: number;
  expectedMonths: string[];
  paidMonths: string[];
  diputihkanMonths: string[];
  unpaidMonths: string[];
  piutang: number;
  bulanPiutang: string;
  donasiPerbulan: number;
  totalExpectedMonths: number;
  totalPaidMonths: number;
  totalDiputihkanMonths: number;
  totalUnpaidMonths: number;
  statusKeterangan: string;
  matchingLunasOrders: DonasiOrder[];
  totalLunasNominal: number;
}

/**
 * Validasi dan perhitungan otomatis piutang Dharma Patron Rutin:
 * - Menghitung bulan komitmen dari bulan tanggal bergabung hingga bulan berjalan.
 * - Memperhitungkan transaksi D-DONASI lunas yang terkoneksi mutasi.
 * - Memperhitungkan bulan yang diputihkan dari menu Edit Donasi/Rutin.
 */
export function validateAndCalculatePatronPiutang(
  patron: DharmaPatronRutinItem,
  donasiOrders: DonasiOrder[],
  mutasiItems: MutasiItem[] = [],
  customCurrentMonthIdx: number = 10, // November (index 10)
  customCurrentYear: number = 2021
): PatronPiutangValidationResult {
  const donasiPerbulan = patron.donasiPerbulan || 100000;

  // 1. Establish all expected months starting from tanggalBergabung up to reporting month (November 2021)
  const joinDate = patron.tanggalBergabung || patron.bulanMulaiDonasi || '15 Jan 2021';
  const joinMonthName = getMonthFromDate(joinDate);
  let joinMonthIdx = joinMonthName ? INDO_MONTHS.indexOf(joinMonthName) : 0;
  if (joinMonthIdx === -1) joinMonthIdx = 0;

  const joinYearMatch = joinDate.match(/\b(19\d\d|20\d\d)\b/);
  const joinYear = joinYearMatch ? parseInt(joinYearMatch[1], 10) : customCurrentYear;

  const reportingYear = customCurrentYear;
  let reportingEndMonthIdx = customCurrentMonthIdx; // November

  // If stopped (Tidak Aktif) and has tanggalBerhenti, cap at that month
  if (patron.statusAktif === 'Tidak Aktif' && patron.tanggalBerhenti) {
    const stopMonthName = getMonthFromDate(patron.tanggalBerhenti);
    if (stopMonthName) {
      const stopMonthIdx = INDO_MONTHS.indexOf(stopMonthName);
      if (stopMonthIdx !== -1) {
        reportingEndMonthIdx = Math.min(reportingEndMonthIdx, stopMonthIdx);
      }
    }
  }

  // Determine starting month in reporting year
  let startMonthIdx = 0;
  if (joinYear === reportingYear) {
    startMonthIdx = joinMonthIdx;
  } else if (joinYear > reportingYear) {
    startMonthIdx = reportingEndMonthIdx + 1; // Future member, no expected months yet
  } else {
    // Joined before reporting year (e.g. 2019 or 2020) -> active for all months in reporting year
    startMonthIdx = 0;
  }

  const expectedMonths: string[] = [];
  for (let m = startMonthIdx; m <= reportingEndMonthIdx; m++) {
    expectedMonths.push(INDO_MONTHS[m]);
  }

  // 2. Filter all matching LUNAS orders from Transaksi D-DONASI yang terkoneksi mutasi
  const matchingLunasOrders: DonasiOrder[] = [];
  const paidMonthsSet = new Set<string>();
  let totalPaidNominal = 0;

  donasiOrders.forEach((order) => {
    if (!isOrderMatchingPatron(order, patron)) return;
    if (!isDonasiOrderLunasDanKonekMutasi(order, mutasiItems)) return;

    const details = extractPatronDonationDetails(order, donasiPerbulan);
    if (details.nominal > 0 || details.monthsCovered.length > 0) {
      matchingLunasOrders.push(order);
      totalPaidNominal += details.nominal;
      details.monthsCovered.forEach((m) => paidMonthsSet.add(m));
    }
  });

  const paidMonthsList = Array.from(paidMonthsSet);

  // 3. Extract bulan yang diputihkan dari "Edit Donasi/Rutin"
  const diputihkanMonthsSet = new Set<string>();

  // A. From explicit bulanDiputihkan array
  if (patron.bulanDiputihkan && patron.bulanDiputihkan.length > 0) {
    patron.bulanDiputihkan.forEach((m) => {
      const extracted = extractMonthsFromText(m);
      if (extracted.length > 0) {
        extracted.forEach((em) => diputihkanMonthsSet.add(em));
      } else {
        diputihkanMonthsSet.add(m);
      }
    });
  }

  // B. From jenisPerubahanDonasi === "Pemutihan"
  const isPemutihanActive = Boolean(
    patron.jenisPerubahanDonasi &&
      patron.jenisPerubahanDonasi.trim().toLowerCase().includes('pemutihan')
  );

  if (isPemutihanActive) {
    const pemutihanSource = patron.bulanMulaiPerubahanDonasi || '';
    const extractedPemutihan = extractMonthsFromText(pemutihanSource);

    if (extractedPemutihan.length > 0) {
      extractedPemutihan.forEach((m) => diputihkanMonthsSet.add(m));
    } else {
      // If Pemutihan is chosen without a specific month, all expected months are diputihkan
      expectedMonths.forEach((m) => diputihkanMonthsSet.add(m));
    }
  }

  const diputihkanMonthsList = Array.from(diputihkanMonthsSet);

  // 4. Reconcile expected months against:
  // - Transaksi D-DONASI lunas (paidMonthsSet)
  // - Bulan yang diputihkan dari "Edit Donasi/Rutin" (diputihkanMonthsSet)
  const remainingUnpaidMonths = expectedMonths.filter(
    (m) => !paidMonthsSet.has(m) && !diputihkanMonthsSet.has(m)
  );

  // 5. Calculate final Piutang nominal and Bulan Piutang string
  let finalPiutang = 0;
  let finalBulanPiutang = '-';

  if (remainingUnpaidMonths.length > 0) {
    finalPiutang = -(remainingUnpaidMonths.length * donasiPerbulan);

    if (remainingUnpaidMonths.length === 1) {
      finalBulanPiutang = remainingUnpaidMonths[0];
    } else if (remainingUnpaidMonths.length === 2) {
      finalBulanPiutang = remainingUnpaidMonths.join(', ');
    } else {
      // Check if contiguous range, e.g. Maret s/d November
      const firstIdx = INDO_MONTHS.indexOf(remainingUnpaidMonths[0]);
      const lastIdx = INDO_MONTHS.indexOf(remainingUnpaidMonths[remainingUnpaidMonths.length - 1]);
      const isContiguous =
        firstIdx !== -1 &&
        lastIdx !== -1 &&
        lastIdx - firstIdx + 1 === remainingUnpaidMonths.length;

      if (isContiguous) {
        finalBulanPiutang = `${remainingUnpaidMonths[0]} - ${remainingUnpaidMonths[remainingUnpaidMonths.length - 1]}`;
      } else {
        finalBulanPiutang = remainingUnpaidMonths.join(', ');
      }
    }
  } else {
    finalPiutang = 0;
    finalBulanPiutang = '-';
  }

  const totalExpected = expectedMonths.length;
  const totalPaid = paidMonthsList.filter((m) => expectedMonths.includes(m)).length;
  const totalDiputihkan = diputihkanMonthsList.filter((m) => expectedMonths.includes(m)).length;
  const totalUnpaid = remainingUnpaidMonths.length;

  let statusKeterangan = 'Lunas';
  if (totalUnpaid > 0) {
    statusKeterangan = `Menunggak ${totalUnpaid} bulan (${finalBulanPiutang}) sebesar Rp${Math.abs(finalPiutang).toLocaleString('id-ID')}`;
  } else if (totalDiputihkan > 0 && totalPaid === 0) {
    statusKeterangan = `Diputihkan seluruhnya (${totalDiputihkan} bulan)`;
  } else {
    statusKeterangan = `Lunas (${totalPaid} bulan terbayar)`;
  }

  return {
    isValid: true,
    joinDate,
    startMonthName: INDO_MONTHS[startMonthIdx] || 'Januari',
    currentMonthName: INDO_MONTHS[reportingEndMonthIdx] || 'November',
    currentYear: reportingYear,
    expectedMonths,
    paidMonths: paidMonthsList,
    diputihkanMonths: diputihkanMonthsList,
    unpaidMonths: remainingUnpaidMonths,
    piutang: finalPiutang,
    bulanPiutang: finalBulanPiutang,
    donasiPerbulan,
    totalExpectedMonths: totalExpected,
    totalPaidMonths: totalPaid,
    totalDiputihkanMonths: totalDiputihkan,
    totalUnpaidMonths: totalUnpaid,
    statusKeterangan,
    matchingLunasOrders,
    totalLunasNominal: totalPaidNominal,
  };
}

/**
 * Real-time calculation of Piutang and Bulan Piutang for a single Dharma Patron Rutin item,
 * sourced live from LUNAS orders in Transaksi D-DONASI.
 */
export function calculateRealtimePatronReport(
  patron: DharmaPatronRutinItem,
  donasiOrders: DonasiOrder[],
  mutasiItems: MutasiItem[] = []
): PatronRealtimeReport {
  const result = validateAndCalculatePatronPiutang(patron, donasiOrders, mutasiItems);
  return {
    piutang: result.piutang,
    bulanPiutang: result.bulanPiutang,
    unpaidMonths: result.unpaidMonths,
    paidMonths: result.paidMonths,
    matchingLunasOrders: result.matchingLunasOrders,
    totalLunasNominal: result.totalLunasNominal,
  };
}

/**
 * Returns a new array of DharmaPatronRutinItem with dynamically updated
 * piutang and bulanPiutang based on real-time Lunas Transaksi D-DONASI orders.
 */
export function getDharmaPatronWithRealtimePiutang(
  patrons: DharmaPatronRutinItem[],
  donasiOrders: DonasiOrder[],
  mutasiItems: MutasiItem[] = []
): DharmaPatronRutinItem[] {
  return patrons.map((patron) => {
    const report = calculateRealtimePatronReport(patron, donasiOrders, mutasiItems);
    return {
      ...patron,
      piutang: report.piutang,
      bulanPiutang: report.bulanPiutang,
    };
  });
}

export interface PatronProportionItem {
  patronId: string;
  namaDonatur: string;
  donasiPerbulan: number;
  totalExpectedNominal: number;
  totalPaidNominal: number;
  totalPiutangNominal: number;
  totalDiputihkanNominal: number;
  totalExpectedMonths: number;
  totalPaidMonths: number;
  totalUnpaidMonths: number;
  totalDiputihkanMonths: number;
  paidPercentage: number;
  piutangPercentage: number;
  diputihkanPercentage: number;
  isFullyPaid: boolean;
  statusKeterangan: string;
}

export interface PatronProportionAggregate {
  totalExpectedNominal: number;
  totalPaidNominal: number;
  totalPiutangNominal: number;
  totalDiputihkanNominal: number;
  paidPercentage: number;
  piutangPercentage: number;
  diputihkanPercentage: number;
  totalPatrons: number;
  lunasCount: number;
  piutangCount: number;
  diputihkanCount: number;
  totalExpectedMonths: number;
  totalPaidMonths: number;
  totalUnpaidMonths: number;
  totalDiputihkanMonths: number;
}

export interface PatronProportionsResult {
  aggregate: PatronProportionAggregate;
  map: Map<string, PatronProportionItem>;
}

/**
 * Computes high-performance precomputed proportions of paid donasi vs piutang (unpaid)
 * and diputihkan for all patrons, enabling O(1) row rendering and instant summary filtering.
 */
export function getPatronProportionsMap(
  patrons: DharmaPatronRutinItem[],
  donasiOrders: DonasiOrder[],
  mutasiItems: MutasiItem[] = []
): PatronProportionsResult {
  const map = new Map<string, PatronProportionItem>();

  let totalExpectedNominal = 0;
  let totalPaidNominal = 0;
  let totalPiutangNominal = 0;
  let totalDiputihkanNominal = 0;

  let totalExpectedMonths = 0;
  let totalPaidMonths = 0;
  let totalUnpaidMonths = 0;
  let totalDiputihkanMonths = 0;

  let lunasCount = 0;
  let piutangCount = 0;
  let diputihkanCount = 0;

  for (const patron of patrons) {
    const res = validateAndCalculatePatronPiutang(patron, donasiOrders, mutasiItems);
    const donasiPerbulan = res.donasiPerbulan || 0;
    const expMonths = res.totalExpectedMonths || 0;
    const pMonths = res.totalPaidMonths || 0;
    const unpMonths = res.totalUnpaidMonths || 0;
    const dipMonths = res.totalDiputihkanMonths || 0;

    const expNominal = expMonths * donasiPerbulan;
    const paidNom = res.totalLunasNominal > 0 ? res.totalLunasNominal : pMonths * donasiPerbulan;
    const piutangNom = Math.abs(res.piutang) || (unpMonths * donasiPerbulan);
    const dipNominal = dipMonths * donasiPerbulan;

    const baseDenom = expNominal > 0 ? expNominal : (paidNom + piutangNom + dipNominal);
    let paidPct = 0;
    let piutangPct = 0;
    let dipPct = 0;

    if (baseDenom > 0) {
      paidPct = Math.min(100, Math.round((paidNom / baseDenom) * 100));
      piutangPct = Math.min(100, Math.round((piutangNom / baseDenom) * 100));
      dipPct = Math.min(100, Math.max(0, 100 - paidPct - piutangPct));
    } else if (paidNom > 0) {
      paidPct = 100;
    }

    const isFullyPaid = unpMonths === 0 && (pMonths > 0 || expMonths === 0);

    const item: PatronProportionItem = {
      patronId: patron.id,
      namaDonatur: patron.namaDonatur,
      donasiPerbulan,
      totalExpectedNominal: expNominal,
      totalPaidNominal: paidNom,
      totalPiutangNominal: piutangNom,
      totalDiputihkanNominal: dipNominal,
      totalExpectedMonths: expMonths,
      totalPaidMonths: pMonths,
      totalUnpaidMonths: unpMonths,
      totalDiputihkanMonths: dipMonths,
      paidPercentage: paidPct,
      piutangPercentage: piutangPct,
      diputihkanPercentage: dipPct,
      isFullyPaid,
      statusKeterangan: res.statusKeterangan,
    };

    map.set(patron.id, item);

    totalExpectedNominal += expNominal;
    totalPaidNominal += paidNom;
    totalPiutangNominal += piutangNom;
    totalDiputihkanNominal += dipNominal;

    totalExpectedMonths += expMonths;
    totalPaidMonths += pMonths;
    totalUnpaidMonths += unpMonths;
    totalDiputihkanMonths += dipMonths;

    if (isFullyPaid) lunasCount++;
    if (unpMonths > 0) piutangCount++;
    if (dipMonths > 0) diputihkanCount++;
  }

  const aggDenom =
    totalExpectedNominal > 0 ? totalExpectedNominal : (totalPaidNominal + totalPiutangNominal + totalDiputihkanNominal);
  let overallPaid = 0;
  let overallPiutang = 0;
  let overallDiputihkan = 0;

  if (aggDenom > 0) {
    overallPaid = Math.min(100, Math.round((totalPaidNominal / aggDenom) * 100));
    overallPiutang = Math.min(100, Math.round((totalPiutangNominal / aggDenom) * 100));
    overallDiputihkan = Math.min(100, Math.max(0, 100 - overallPaid - overallPiutang));
  }

  const aggregate: PatronProportionAggregate = {
    totalExpectedNominal,
    totalPaidNominal,
    totalPiutangNominal,
    totalDiputihkanNominal,
    paidPercentage: overallPaid,
    piutangPercentage: overallPiutang,
    diputihkanPercentage: overallDiputihkan,
    totalPatrons: patrons.length,
    lunasCount,
    piutangCount,
    diputihkanCount,
    totalExpectedMonths,
    totalPaidMonths,
    totalUnpaidMonths,
    totalDiputihkanMonths,
  };

  return {
    aggregate,
    map,
  };
}
