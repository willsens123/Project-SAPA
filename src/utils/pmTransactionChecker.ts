import { ListPMDetailRow } from '../types';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';

export interface MatchedTransactionInfo {
  source: 'Transaksi S-SALUR' | 'Transaksi A-AJAR' | 'Transaksi D-DONASI';
  orderId: string;
  orderNumber: string;
  txDate: string;
  matchedItem: string;
  matchedCustomer: string;
  daysAfterPM: number;
}

/**
 * Parses flexible Indonesian and standard date formats
 */
export function parseDateFlexible(dateStr?: string | Date): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }
  const s = String(dateStr).trim();
  if (!s) return null;

  // Try standard ISO parsing
  if (s.includes('T')) {
    const isoDate = new Date(s);
    if (!isNaN(isoDate.getTime())) return isoDate;
  }

  const monthMap: Record<string, number> = {
    jan: 0, januari: 0, january: 0,
    feb: 1, februari: 1, february: 1,
    mar: 2, maret: 2, march: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5, june: 5,
    jul: 6, juli: 6, july: 6,
    agu: 7, agt: 7, agustus: 7, aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11, december: 11,
  };

  const normalized = s.replace(/[,/\-_]/g, ' ');
  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase();
    let year = parseInt(parts[2], 10);
    if (!isNaN(year) && year < 100) year += 2000;

    const month = monthMap[mStr];
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      let hours = 0;
      let minutes = 0;
      if (parts[3] && parts[3].includes(':')) {
        const timeParts = parts[3].split(':');
        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;
      }
      return new Date(year, month, day, hours, minutes, 0, 0);
    }
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Checks if a transaction date is within 7 days after the PM send date
 * Window: from start of PM send day up to 7 full days after
 */
export function isWithin7DaysAfter(
  sentAtStr?: string,
  txDateStr?: string
): { isMatch: boolean; daysAfter: number } {
  if (!sentAtStr || !txDateStr) return { isMatch: false, daysAfter: -1 };
  const sentDate = parseDateFlexible(sentAtStr);
  const txDate = parseDateFlexible(txDateStr);
  if (!sentDate || !txDate) return { isMatch: false, daysAfter: -1 };

  const startOfDay = new Date(
    sentDate.getFullYear(),
    sentDate.getMonth(),
    sentDate.getDate(),
    0,
    0,
    0,
    0
  ).getTime();

  const endOfDay7 = startOfDay + 7 * 24 * 60 * 60 * 1000 + (24 * 60 * 60 * 1000 - 1);
  const txTime = new Date(
    txDate.getFullYear(),
    txDate.getMonth(),
    txDate.getDate(),
    12,
    0,
    0,
    0
  ).getTime();

  const isMatch = txTime >= startOfDay && txTime <= endOfDay7;
  const daysAfter = Math.max(0, Math.floor((txTime - startOfDay) / (24 * 60 * 60 * 1000)));

  return { isMatch, daysAfter };
}

/**
 * Checks whether the recipient row has an associated Item
 */
export function rowHasContactItem(row: { itemTitle?: string }): boolean {
  if (!row.itemTitle) return false;
  const trimmed = row.itemTitle.trim();
  if (
    !trimmed ||
    trimmed === '-' ||
    trimmed === '—' ||
    trimmed.toLowerCase() === 'none' ||
    trimmed.toLowerCase() === 'tidak ada' ||
    trimmed.toLowerCase() === 'tanpa item'
  ) {
    return false;
  }
  return true;
}

/**
 * Normalizes text for comparison (alphanumeric only, lowercase)
 */
function cleanText(str?: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if transaction buyer matches row recipient ID Pembeli
 */
export function matchesCustomer(
  buyerCandidate: string | undefined,
  row: { codeId?: string; nama?: string; identitasId?: string; nomorHp?: string }
): boolean {
  if (!buyerCandidate) return false;
  const cand = cleanText(buyerCandidate);

  // 1. Check codeId (e.g. "00031", "10001")
  if (row.codeId && row.codeId.trim()) {
    const code = cleanText(row.codeId);
    if (cand.includes(code)) return true;
    const stripped = code.replace(/^0+/, '');
    if (stripped && stripped.length >= 2 && cand.includes(stripped)) {
      // Ensure it's a word or prefix boundary
      const candWords = cand.split(' ');
      if (candWords.some((w) => w === stripped || w.includes(stripped))) {
        return true;
      }
    }
  }

  // 2. Check nama
  if (row.nama && row.nama.trim()) {
    const nama = cleanText(row.nama);
    if (cand.includes(nama) || nama.includes(cand)) return true;
    const namaWords = nama.split(' ').filter((w) => w.length >= 3);
    if (namaWords.length > 0 && namaWords.some((w) => cand.includes(w))) {
      return true;
    }
  }

  // 3. Check nomorHp
  if (row.nomorHp) {
    const cleanRowPhone = row.nomorHp.replace(/\D/g, '').slice(-8);
    const cleanCandPhone = buyerCandidate.replace(/\D/g, '');
    if (cleanRowPhone.length >= 8 && cleanCandPhone.includes(cleanRowPhone)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if item in transaction matches the PM row's item
 */
export function matchesItemName(
  txItemName: string | undefined,
  targetTitle: string | undefined
): boolean {
  if (!txItemName || !targetTitle) return false;
  const nTx = cleanText(txItemName);
  const nTarget = cleanText(targetTitle);
  if (!nTx || !nTarget) return false;

  // Exact or substring match
  if (nTx.includes(nTarget) || nTarget.includes(nTx)) return true;

  // Significant word overlap
  const targetWords = nTarget.split(' ').filter((w) => w.length > 3);
  if (targetWords.length >= 2 && targetWords.every((w) => nTx.includes(w))) {
    return true;
  }

  return false;
}

/**
 * Finds a matching transaction in Transaksi S-SALUR, Transaksi A-AJAR, or Transaksi D-DONASI
 * within 7 days after the PM was sent.
 */
export function findMatchingTransaction(
  row: ListPMDetailRow,
  salurOrders: SalurOrder[] = [],
  transaksiAjarList: TransaksiAjarItem[] = [],
  donasiOrders: DonasiOrder[] = []
): MatchedTransactionInfo | null {
  // If row has no item, cannot match item-based transaction
  if (!rowHasContactItem(row)) {
    return null;
  }

  const sentAt = row.sentAt || row.deadline || '14 Nov 2021';

  // 1. Check Transaksi S-SALUR
  for (const order of salurOrders) {
    const { isMatch, daysAfter } = isWithin7DaysAfter(sentAt, order.date);
    if (!isMatch) continue;

    const buyerText = `${order.idPembeli || ''} ${order.customerId || ''} ${order.customerCode || ''} ${order.alamat?.recipientName || ''} ${order.alamat?.phone || ''}`;
    if (!matchesCustomer(buyerText, row)) continue;

    const matchingOrderItem = (order.items || []).find((it) =>
      matchesItemName(it.title, row.itemTitle)
    );
    if (matchingOrderItem) {
      return {
        source: 'Transaksi S-SALUR',
        orderId: order.id,
        orderNumber: order.orderNumber,
        txDate: order.date,
        matchedItem: matchingOrderItem.title,
        matchedCustomer: order.idPembeli || order.customerId,
        daysAfterPM: daysAfter,
      };
    }
  }

  // 2. Check Transaksi A-AJAR
  for (const tx of transaksiAjarList) {
    const { isMatch, daysAfter } = isWithin7DaysAfter(sentAt, tx.date);
    if (!isMatch) continue;

    const buyerText = `${tx.customerId || ''} ${(tx.recipients || []).join(' ')} ${(tx.otherRecipients || []).join(' ')}`;
    if (!matchesCustomer(buyerText, row)) continue;

    // Check main item
    if (matchesItemName(tx.itemName, row.itemTitle)) {
      return {
        source: 'Transaksi A-AJAR',
        orderId: tx.id,
        orderNumber: tx.orderNumber,
        txDate: tx.date,
        matchedItem: tx.itemName,
        matchedCustomer: tx.customerId,
        daysAfterPM: daysAfter,
      };
    }

    // Check sub products
    const matchingSub = (tx.otherProducts || []).find((p) =>
      matchesItemName(p.name, row.itemTitle)
    );
    if (matchingSub) {
      return {
        source: 'Transaksi A-AJAR',
        orderId: tx.id,
        orderNumber: tx.orderNumber,
        txDate: tx.date,
        matchedItem: matchingSub.name,
        matchedCustomer: tx.customerId,
        daysAfterPM: daysAfter,
      };
    }
  }

  // 3. Check Transaksi D-DONASI
  for (const donasi of donasiOrders) {
    const { isMatch, daysAfter } = isWithin7DaysAfter(sentAt, donasi.date);
    if (!isMatch) continue;

    const buyerText = `${donasi.customerId || ''} ${donasi.namaDonatur?.name || ''}`;
    if (!matchesCustomer(buyerText, row)) continue;

    // Check primary items
    const matchItem = (donasi.items || []).find((it) =>
      matchesItemName(it.name, row.itemTitle)
    );
    if (matchItem) {
      return {
        source: 'Transaksi D-DONASI',
        orderId: donasi.id,
        orderNumber: donasi.orderNumber,
        txDate: donasi.date,
        matchedItem: matchItem.name,
        matchedCustomer: donasi.customerId,
        daysAfterPM: daysAfter,
      };
    }

    // Check extra items
    const matchExtra = (donasi.extraItems || []).find((it) =>
      matchesItemName(it.name, row.itemTitle)
    );
    if (matchExtra) {
      return {
        source: 'Transaksi D-DONASI',
        orderId: donasi.id,
        orderNumber: donasi.orderNumber,
        txDate: donasi.date,
        matchedItem: matchExtra.name,
        matchedCustomer: donasi.customerId,
        daysAfterPM: daysAfter,
      };
    }
  }

  return null;
}

/**
 * Evaluates row status according to the user specification:
 * 1. Jika sudah dikirim, maka buat status "done" abu-abu pada pop up "Kirim Chat/Kelola PM".
 * 2. Jika dihubungi menggunakan Item, maka jika ada "ID Pembeli" dan "item" pada
 *    "Transaksi S-SALUR" atau "Transaksi A-AJAR" atau "Transaksi D-DONASI" dalam waktu 7 hari
 *    setelah dikirim PM: maka akan terhitung PM berhasil, dan buat jadi "done" warna tosca.
 * 3. Jika tidak ada item, maka bisa edit manual "done" warna tosca pada pop up "Kirim Chat/Kelola PM".
 */
export function evaluateRowStatus(
  row: ListPMDetailRow,
  salurOrders: SalurOrder[] = [],
  transaksiAjarList: TransaksiAjarItem[] = [],
  donasiOrders: DonasiOrder[] = []
): {
  status: 'done_teal' | 'menolak' | 'done_gray' | 'pending';
  matchedTransaction?: MatchedTransactionInfo;
} {
  // If explicitly 'menolak', preserve
  if (row.status === 'menolak') {
    return { status: 'menolak' };
  }

  // If pending and never sent, keep pending
  if (row.status === 'pending' && !row.sentAt) {
    return { status: 'pending' };
  }

  // If contacted using Item:
  if (rowHasContactItem(row)) {
    // If user has not manually set it, or to evaluate auto-success:
    const matched = findMatchingTransaction(row, salurOrders, transaksiAjarList, donasiOrders);
    if (matched) {
      // Transaction matched within 7 days after PM -> PM berhasil -> done tosca
      return { status: 'done_teal', matchedTransaction: matched };
    }

    // If no matching transaction found:
    // If it was manually set to done_teal, respect manual override
    if (row.isManualStatus && row.status === 'done_teal') {
      return { status: 'done_teal' };
    }

    // Otherwise, since it was sent, it is done abu-abu
    return { status: 'done_gray' };
  }

  // If NO Item:
  // "Jika tidak ada item, maka bisa edit manual 'done' warna tosca pada pop up 'Kirim Chat/Kelola PM'."
  // Keep whatever status was chosen (done_teal if edited manual, else done_gray if sent, or pending)
  if (row.status === 'done_teal') {
    return { status: 'done_teal' };
  }

  if (row.status === 'pending' && !row.sentAt) {
    return { status: 'pending' };
  }

  return { status: 'done_gray' };
}
