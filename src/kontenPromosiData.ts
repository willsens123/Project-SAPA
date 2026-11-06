import { KontenPromosiItem, TargetPromotedItem } from './types';
import { SalurOrder } from './salurData';
import { DonasiOrder } from './donasiData';
import { TransaksiAjarItem } from './transaksiAjarData';

export const STORAGE_KEY_KONTEN_PROMOSI = 'yppln_konten_promosi_v1';

export const INITIAL_KONTEN_PROMOSI: KontenPromosiItem[] = [
  {
    id: 'konten-1',
    judul: 'Poster A',
    format: 'Carousel',
    itemSummary: 'Buku Menjadi Buddha, + 1 more item',
    thumbnailUrl: '', // Will render rich poster artwork
    targetItems: [
      {
        id: 'book-3',
        title: 'Menjadi Buddha di Tempat Kerja',
        coverKey: 'menjadi-buddha',
      },
      {
        id: 'book-2',
        title: 'Demi Kepentingan Semua Makhluk',
        coverKey: 'demi-kepentingan',
      },
    ],
    ig: {
      tanggal: '11 Nov 21',
      jam: '11:00',
      like: 700,
      comment: 700,
      share: 700,
      saved: 700,
      reach: 700,
    },
    tiktok: {
      tanggal: '11 Nov 21',
      jam: '11:00',
      like: 700,
      comment: 700,
      share: 700,
      saved: 700,
      reach: 100,
    },
    jarkom: {
      tanggal: '11 Nov 21',
      jam: '11:00',
      reach: 100,
    },
    tanggalDisebar: '11 Nov 2021',
    durasiHariCekTransaksi: 5,
    transaksiCount: 100, // Matches 100 on screenshot
  },
];

export function getKontenPromosiFromStorage(): KontenPromosiItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KONTEN_PROMOSI);
    if (!raw) {
      saveKontenPromosiToStorage(INITIAL_KONTEN_PROMOSI);
      return INITIAL_KONTEN_PROMOSI;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_KONTEN_PROMOSI;
  } catch (err) {
    console.error('Failed to load konten promosi from storage:', err);
    return INITIAL_KONTEN_PROMOSI;
  }
}

export function saveKontenPromosiToStorage(data: KontenPromosiItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_KONTEN_PROMOSI, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save konten promosi to storage:', err);
  }
}

/**
 * Helper to parse various Indonesian date strings like:
 * "11 Nov 2021", "11 Nov 21", "14 Nov 2021", "2021-11-11"
 */
export function parseIndonesianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = dateStr.trim();

  // Try ISO
  if (s.includes('-')) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
  }

  const monthMap: Record<string, number> = {
    jan: 0, januari: 0,
    feb: 1, februari: 1,
    mar: 2, maret: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    agu: 7, agustus: 7, aug: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11,
  };

  const parts = s.split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase();
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;

    const month = monthMap[mStr];
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day, 0, 0, 0, 0);
    }
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export interface MatchingTransactionResult {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  itemTitle: string;
  quantity: number;
  customerName: string;
  totalDana?: string;
  status: string;
  source: 'S-SALUR' | 'D-DONASI' | 'A-AJAR';
}

/**
 * Flexible matcher between transaction item name and targeted promotion item titles
 */
export function isItemNameMatch(transactionItemName?: string, targetItemTitles: string[] = []): boolean {
  if (!transactionItemName || targetItemTitles.length === 0) return false;
  const tNorm = transactionItemName.toLowerCase().trim();

  return targetItemTitles.some((target) => {
    const targetNorm = target.toLowerCase().trim();
    if (!targetNorm) return false;

    // Direct substring in either direction
    if (tNorm.includes(targetNorm) || targetNorm.includes(tNorm)) return true;

    // Word-based match for longer titles
    const words = targetNorm.split(/\s+/).filter(
      (w) => w.length > 3 && !['buku', 'paket', 'item', 'yang', 'dan', 'cover', 'retreat'].includes(w)
    );
    if (words.length >= 2) {
      const matchCount = words.filter((w) => tNorm.includes(w)).length;
      if (matchCount >= 2) return true;
    }
    return false;
  });
}

function parseQuantityFromPrice(qtyPriceStr?: string): number {
  if (!qtyPriceStr) return 1;
  const match = qtyPriceStr.match(/^(\d+)\s*x/i);
  if (match) {
    const q = parseInt(match[1], 10);
    return isNaN(q) || q <= 0 ? 1 : q;
  }
  return 1;
}

/**
 * Checks transactions for items specified in a promotion across:
 * - Transaksi S-SALUR
 * - Transaksi D-DONASI
 * - Transaksi A-AJAR
 * in real time starting from "tanggal" up to "tanggal" + "set waktu" (durasi dalam hari).
 */
export function checkTransaksiRealTime(
  konten: KontenPromosiItem,
  salurOrders: SalurOrder[] = [],
  donasiOrders: DonasiOrder[] = [],
  transaksiAjarList: TransaksiAjarItem[] = []
): {
  totalCount: number;
  matchingList: MatchingTransactionResult[];
  targetItemTitles: string[];
  startDateStr: string;
  endDateStr: string;
  daysDuration: number;
  daysPassed: number;
} {
  const targetItemTitles = (konten.targetItems || [])
    .map((t) => t.title.trim())
    .filter(Boolean);

  // If targetItems is empty, parse from itemSummary
  if (targetItemTitles.length === 0 && konten.itemSummary) {
    const parts = konten.itemSummary
      .split(/[,+]/)
      .map((s) => s.trim())
      .filter((s) => s && !s.toLowerCase().includes('more item'));
    targetItemTitles.push(...parts);
  }

  // Parse start date from tanggalDisebar or social dates
  const rawDateStr =
    konten.tanggalDisebar ||
    konten.ig?.tanggal ||
    konten.tiktok?.tanggal ||
    konten.jarkom?.tanggal ||
    '11 Nov 2021';
  const parsedStart = parseIndonesianDate(rawDateStr) || new Date(2021, 10, 11);
  const startDate = new Date(parsedStart.getFullYear(), parsedStart.getMonth(), parsedStart.getDate(), 0, 0, 0, 0);

  // Set Waktu (in days)
  const durasi = Math.max(1, konten.setWaktuHari ?? konten.durasiHariCekTransaksi ?? 5);

  // End date = startDate + durasi days (end of that day)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + durasi, 23, 59, 59, 999);

  const startFormatted = `${startDate.getDate()} ${startDate.toLocaleString('id-ID', { month: 'short' })} ${startDate.getFullYear()}`;
  const endFormatted = `${endDate.getDate()} ${endDate.toLocaleString('id-ID', { month: 'short' })} ${endDate.getFullYear()}`;

  const matchingList: MatchingTransactionResult[] = [];
  let calculatedQty = 0;

  const isDateInWindow = (orderDateStr?: string): boolean => {
    if (!orderDateStr) return false;
    const d = parseIndonesianDate(orderDateStr);
    if (!d) return false;
    const time = d.getTime();
    return time >= startDate.getTime() && time <= endDate.getTime();
  };

  // 1. Check Transaksi S-SALUR
  if (salurOrders && salurOrders.length > 0) {
    salurOrders.forEach((order) => {
      if (isDateInWindow(order.date) && order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          if (isItemNameMatch(item.title, targetItemTitles)) {
            const qty = item.quantity || 1;
            calculatedQty += qty;
            matchingList.push({
              orderId: `salur-${order.id}-${item.id || item.productId}`,
              orderNumber: order.orderNumber,
              orderDate: order.date,
              itemTitle: item.title,
              quantity: qty,
              customerName: order.idPembeli || order.customerId || 'Pelanggan S-SALUR',
              totalDana:
                typeof order.totalDana === 'number'
                  ? `Rp${new Intl.NumberFormat('id-ID').format(order.totalDana)}`
                  : order.totalDana,
              status: order.paymentStatus || 'Paid',
              source: 'S-SALUR',
            });
          }
        });
      }
    });
  }

  // 2. Check Transaksi D-DONASI
  if (donasiOrders && donasiOrders.length > 0) {
    donasiOrders.forEach((order) => {
      if (isDateInWindow(order.date)) {
        const allItems = [...(order.items || []), ...(order.extraItems || [])];
        allItems.forEach((dItem) => {
          if (isItemNameMatch(dItem.name, targetItemTitles)) {
            const qty = parseQuantityFromPrice(dItem.qtyPrice);
            calculatedQty += qty;
            matchingList.push({
              orderId: `donasi-${order.id}-${dItem.id}`,
              orderNumber: order.orderNumber,
              orderDate: order.date,
              itemTitle: dItem.name,
              quantity: qty,
              customerName: order.namaDonatur?.name || order.customerId || 'Donatur D-DONASI',
              totalDana: order.totalDana,
              status: order.statusBadges?.[0] || 'Paid',
              source: 'D-DONASI',
            });
          }
        });
      }
    });
  }

  // 3. Check Transaksi A-AJAR
  if (transaksiAjarList && transaksiAjarList.length > 0) {
    transaksiAjarList.forEach((order) => {
      if (isDateInWindow(order.date)) {
        if (isItemNameMatch(order.itemName, targetItemTitles) || isItemNameMatch(order.eventName, targetItemTitles)) {
          const qty = parseQuantityFromPrice(order.qtyPrice);
          calculatedQty += qty;
          matchingList.push({
            orderId: `ajar-${order.id}-main`,
            orderNumber: order.orderNumber,
            orderDate: order.date,
            itemTitle: order.itemName || order.eventName,
            quantity: qty,
            customerName: order.recipients?.[0] || order.customerId || 'Peserta A-AJAR',
            totalDana: order.totalDana,
            status: order.statusBadges?.[0] || 'Paid',
            source: 'A-AJAR',
          });
        }
        if (order.otherProducts && order.otherProducts.length > 0) {
          order.otherProducts.forEach((prod) => {
            if (isItemNameMatch(prod.name, targetItemTitles)) {
              const qty = parseQuantityFromPrice(prod.qtyPrice);
              calculatedQty += qty;
              matchingList.push({
                orderId: `ajar-${order.id}-${prod.id}`,
                orderNumber: order.orderNumber,
                orderDate: order.date,
                itemTitle: prod.name,
                quantity: qty,
                customerName: order.recipients?.[0] || order.customerId || 'Peserta A-AJAR',
                totalDana: prod.qtyPrice,
                status: order.statusBadges?.[0] || 'Paid',
                source: 'A-AJAR',
              });
            }
          });
        }
      }
    });
  }

  const daysPassed = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    totalCount: calculatedQty,
    matchingList,
    targetItemTitles: targetItemTitles.length > 0 ? targetItemTitles : ['Semua Item Terkait'],
    startDateStr: startFormatted,
    endDateStr: endFormatted,
    daysDuration: durasi,
    daysPassed,
  };
}

/**
 * Backward-compatible helper for 5-day check or custom duration
 */
export function checkTransaksiItem5Hari(
  konten: KontenPromosiItem,
  salurOrders: SalurOrder[] = [],
  donasiOrders: DonasiOrder[] = [],
  transaksiAjarList: TransaksiAjarItem[] = []
) {
  return checkTransaksiRealTime(konten, salurOrders, donasiOrders, transaksiAjarList);
}
