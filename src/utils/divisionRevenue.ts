import { SalurOrder, SalurProduct } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { ItemDonasiEvent } from '../itemDonasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { ItemAjarEvent } from '../itemAjarData';

export interface DivisionRevenueBreakdown {
  divisi: string;
  totalRevenue: number;
  fromSalur: number;
  fromDonasi: number;
  fromAjar: number;
  countTransactions: number;
}

/**
 * Calculates all revenues (pendapatan) earned by each division
 * based on the Pemasukan Divisi configured on each Item S-SALUR, Item D-DONASI, and Item A-AJAR.
 */
export function calculateAllDivisionRevenues(
  divisiList: string[],
  salurOrders: SalurOrder[] = [],
  salurProducts: SalurProduct[] = [],
  donasiOrders: DonasiOrder[] = [],
  itemDonasiEvents: ItemDonasiEvent[] = [],
  transaksiAjarList: TransaksiAjarItem[] = [],
  itemAjarEvents: ItemAjarEvent[] = []
): Record<string, DivisionRevenueBreakdown> {
  const result: Record<string, DivisionRevenueBreakdown> = {};

  // Initialize for all known divisions
  (divisiList || []).forEach((div) => {
    const key = div.toUpperCase();
    result[key] = {
      divisi: div,
      totalRevenue: 0,
      fromSalur: 0,
      fromDonasi: 0,
      fromAjar: 0,
      countTransactions: 0,
    };
  });

  // Helper to ensure division key exists
  const ensureDivKey = (divName?: string): string => {
    const key = (divName || 'MAD').toUpperCase().trim();
    if (!result[key]) {
      result[key] = {
        divisi: key,
        totalRevenue: 0,
        fromSalur: 0,
        fromDonasi: 0,
        fromAjar: 0,
        countTransactions: 0,
      };
    }
    return key;
  };

  // 1. Process Transaksi S-SALUR
  // Matches each order item to SalurProduct to find its pemasukanDivisi (defaults to 'MAD')
  salurOrders.forEach((order) => {
    (order.items || []).forEach((it) => {
      const product = salurProducts.find(
        (p) =>
          p.id === it.productId ||
          (p.title && it.title && p.title.toLowerCase().trim() === it.title.toLowerCase().trim())
      );
      const targetDiv = ensureDivKey(product?.pemasukanDivisi || 'MAD');
      const itemSubtotal = (it.price || 0) * (it.quantity || 1);

      result[targetDiv].fromSalur += itemSubtotal;
      result[targetDiv].totalRevenue += itemSubtotal;
      result[targetDiv].countTransactions += 1;
    });
  });

  // 2. Process Transaksi D-DONASI
  // Matches each donation item to ItemDonasiEvent to find its pemasukanDivisi
  donasiOrders.forEach((order) => {
    (order.items || []).forEach((it) => {
      const itName = (it.name || '').toLowerCase();
      const matchedEvent = itemDonasiEvents.find((evt) => {
        if (evt.name && itName.includes(evt.name.toLowerCase())) return true;
        if (evt.children && evt.children.some((c) => c.name.toLowerCase().includes(itName)))
          return true;
        return false;
      });

      // Default fallback: Kathina -> MAD, otherwise -> FUN
      let fallbackDiv = 'FUN';
      if (itName.includes('kathina') || it.category?.toLowerCase().includes('kathina')) {
        fallbackDiv = 'MAD';
      }

      const targetDiv = ensureDivKey(matchedEvent?.pemasukanDivisi || fallbackDiv);
      const numMatch = (it.qtyPrice || '').replace(/[^0-9]/g, '');
      const itemAmount = numMatch ? parseInt(numMatch, 10) : 500000;

      result[targetDiv].fromDonasi += itemAmount;
      result[targetDiv].totalRevenue += itemAmount;
      result[targetDiv].countTransactions += 1;
    });
  });

  // 3. Process Transaksi A-AJAR
  // Matches each Ajar transaction to ItemAjarEvent to find its pemasukanDivisi (defaults to 'EVE')
  transaksiAjarList.forEach((item) => {
    const eventName = (item.eventName || '').toLowerCase();
    const matchedEvent = itemAjarEvents.find((evt) =>
      evt.name ? eventName.includes(evt.name.toLowerCase()) : false
    );

    const targetDiv = ensureDivKey(matchedEvent?.pemasukanDivisi || 'EVE');
    const numMatch = (item.qtyPrice || '').replace(/[^0-9]/g, '');
    let itemAmount = 1200000;
    if (numMatch) {
      const val = parseInt(numMatch, 10);
      itemAmount = val > 100000000 ? 4800000 : val || 1200000;
    }

    result[targetDiv].fromAjar += itemAmount;
    result[targetDiv].totalRevenue += itemAmount;
    result[targetDiv].countTransactions += 1;
  });

  return result;
}
