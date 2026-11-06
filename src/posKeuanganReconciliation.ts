import { PosKeuanganItem } from './posKeuanganData';
import { PosPemasukanGroup } from './posPemasukanData';
import { PosPemasukanSubJenisMapping } from './posPemasukanSubJenisData';
import { MutasiItem, PengeluaranItem } from './types';
import { SalurOrder } from './salurData';
import { TransaksiAjarItem } from './transaksiAjarData';
import { DonasiOrder } from './donasiData';

export interface PosKeuanganDetailRekap {
  posId: string;
  namaPos: string;
  saldoAwal: number;
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  countMasuk: number;
  countKeluar: number;
}

/**
 * Reconcile / calculate Saldo on Pos Keuangan based on:
 * 1. Mutasi (Bank inflows & outflows)
 * 2. Pos Pemasukan (allocation percentages to Pos Keuangan)
 * 3. Pos Pemasukan per Sub-Jenis Item (mapping from transaction sub-jenis to Pos Pemasukan)
 * 4. Pengeluaran (operational and project expenses debited to Pos Keuangan)
 */
export function reconcilePosKeuanganList(
  posKeuanganList: PosKeuanganItem[],
  mutasiItems: MutasiItem[],
  posPemasukanList: PosPemasukanGroup[],
  posPemasukanSubJenisList: PosPemasukanSubJenisMapping[],
  pengeluaranList: PengeluaranItem[] = [],
  salurOrders: SalurOrder[] = [],
  transaksiAjarList: TransaksiAjarItem[] = [],
  donasiOrders: DonasiOrder[] = []
): PosKeuanganItem[] {
  if (!posKeuanganList || posKeuanganList.length === 0) return [];

  // Map to hold reconciliation accumulators for each Pos Keuangan
  const accumulators = new Map<
    string,
    {
      item: PosKeuanganItem;
      saldoAwal: number;
      totalMasuk: number;
      totalKeluar: number;
      countMasuk: number;
      countKeluar: number;
    }
  >();

  posKeuanganList.forEach((pos) => {
    // If saldo was 3.000.000.000 (old mock placeholder) and saldoAwal was not explicitly set, default to 0
    // so real mutasi aggregation is clearly visible. If user explicitly configured saldoAwal, respect it.
    let baseSaldoAwal = 0;
    if (pos.saldoAwal !== undefined) {
      baseSaldoAwal = pos.saldoAwal;
    } else if (pos.saldo !== undefined && pos.saldo !== 3000000000) {
      baseSaldoAwal = pos.saldo;
    }

    accumulators.set(pos.id, {
      item: { ...pos },
      saldoAwal: baseSaldoAwal,
      totalMasuk: 0,
      totalKeluar: 0,
      countMasuk: 0,
      countKeluar: 0,
    });
  });

  // Helper to find target Pos Keuangan by ID or name
  const findPosKeuangan = (idOrName?: string) => {
    if (!idOrName) return accumulators.get('pos-3') || Array.from(accumulators.values())[0];

    // Check direct ID match
    if (accumulators.has(idOrName)) {
      return accumulators.get(idOrName);
    }

    const search = idOrName.toLowerCase().trim();
    for (const [id, acc] of accumulators.entries()) {
      const posName = acc.item.namaPos.toLowerCase();
      if (posName === search) return acc;
    }

    for (const [id, acc] of accumulators.entries()) {
      const posName = acc.item.namaPos.toLowerCase();
      // Match Penerbitan Buku Dharma
      if ((search.includes('penerbitan') || search.includes('teks dharma') || search.includes('teks') || search.includes('buku dharma') || search.includes('royalti')) && posName.includes('penerbitan')) return acc;
      // Match Kegiatan Retret
      if ((search.includes('retret') || search.includes('kegiatan dharma') || search.includes('kegiatan')) && posName.includes('retret')) return acc;
      // Match Operasional Non-Dharma
      if ((search.includes('non-dharma') || search.includes('ops non-dharma')) && posName.includes('non-dharma')) return acc;
      // Match Operasional Dharma
      if (
        (search.includes('ops dharma') || search.includes('operasional dharma') || search === 'ops' || search.includes('operasional')) &&
        posName.includes('operasional dharma') &&
        !posName.includes('non-dharma')
      ) {
        return acc;
      }
    }

    // Default to Operasional Dharma or first available pos
    return accumulators.get('pos-3') || Array.from(accumulators.values())[0];
  };

  // Helper to resolve Sub-Jenis Item from a transaction reference
  const resolveSubJenisName = (
    sourceType?: string,
    kode?: string,
    keterangan?: string,
    keteranganBank?: string
  ): string => {
    const text = `${kode || ''} ${keterangan || ''} ${keteranganBank || ''}`.toLowerCase();

    // 1. Check for specific module or explicit keywords
    if (sourceType === 'salur' || text.includes('salur') || text.includes('tokopedia') || text.includes('shopee') || text.includes('buku') || text.includes('dksm') || text.includes('dhammapada')) {
      if (text.includes('kaos') || text.includes('t-shirt')) return 'T-Shirt';
      if (text.includes('note') || text.includes('notebook')) return 'Note Book';
      if (text.includes('non-yppln') || text.includes('non yppln')) return 'Buku Non-YPPLN';
      return 'Buku Berbayar';
    }

    if (sourceType === 'donasi' || text.includes('donasi') || text.includes('patron') || text.includes('infak')) {
      if (text.includes('penerbitan') || text.includes('kitab suci')) return 'Donasi Penerbitan Buku';
      if (text.includes('operasional') || text.includes('bencana') || text.includes('sosial')) return 'Donasi Operasional';
      if (text.includes('non-rutin') || text.includes('non rutin')) return 'Dharma Patron Non-Rutin';
      return 'Dharma Patron Rutin';
    }

    if (sourceType === 'ajar' || text.includes('ajar') || text.includes('kursus') || text.includes('meditasi') || text.includes('kelas')) {
      if (text.includes('lam-talk') || text.includes('lam talk')) return 'Lam-Talk';
      return 'ILR';
    }

    // General keyword analysis from bank statement
    if (text.includes('kaos') || text.includes('t-shirt')) return 'T-Shirt';
    if (text.includes('note')) return 'Note Book';
    if (text.includes('patron') || text.includes('agustino') || text.includes('silvia') || text.includes('attha')) return 'Dharma Patron Rutin';
    if (text.includes('infak') || text.includes('kitab suci')) return 'Donasi Penerbitan Buku';
    if (text.includes('operasional') || text.includes('bencana')) return 'Donasi Operasional';
    if (text.includes('lisa') || text.includes('meditasi')) return 'ILR';

    return 'Buku Berbayar';
  };

  // Helper to allocate an inflow amount through Pos Pemasukan -> Pos Keuangan
  const allocateInflow = (amount: number, subJenisName: string) => {
    if (amount <= 0) return;

    // 1. Find Sub-Jenis Mapping -> Target Pos Pemasukan
    const mapping = posPemasukanSubJenisList.find(
      (m) => m.namaSubJenis.toLowerCase().trim() === subJenisName.toLowerCase().trim()
    );

    const targetPosPemasukanName = mapping?.namaPosPemasukan || 'Pemasukan YPPLN';
    const targetPosPemasukanId = mapping?.posPemasukanId;

    // 2. Find Pos Pemasukan Group
    let group = posPemasukanList.find((g) => {
      if (targetPosPemasukanId && g.id === targetPosPemasukanId) return true;
      return g.namaPosPemasukan.toLowerCase().trim() === targetPosPemasukanName.toLowerCase().trim();
    });

    if (!group && posPemasukanList.length > 0) {
      group = posPemasukanList[0]; // Fallback to primary group (Pemasukan YPPLN)
    }

    if (!group || !group.allocations || group.allocations.length === 0) {
      // Direct fallback to first Pos Keuangan
      const fallbackTarget = accumulators.get('pos-1') || Array.from(accumulators.values())[0];
      if (fallbackTarget) {
        fallbackTarget.totalMasuk += amount;
        fallbackTarget.countMasuk += 1;
      }
      return;
    }

    // 3. Allocate among Pos Keuangan using configured percentages
    const totalPercentage = group.allocations.reduce((sum, a) => sum + (a.persentase || 0), 0) || 100;

    group.allocations.forEach((alloc) => {
      const targetPosAcc = findPosKeuangan(alloc.posKeuanganId || alloc.namaPosKeuangan);
      if (targetPosAcc) {
        const share = (amount * (alloc.persentase || 0)) / totalPercentage;
        targetPosAcc.totalMasuk += share;
        targetPosAcc.countMasuk += 1;
      }
    });
  };

  // Track matched transaction IDs to avoid double counting if linked to mutasi
  const handledPengeluaranIds = new Set<string>();
  const handledSalurIds = new Set<string>();
  const handledAjarIds = new Set<string>();
  const handledDonasiIds = new Set<string>();

  // Helper to parse numeric rupiah amounts safely
  const parseRupiahNumber = (val: any): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  // 1. Process Mutasi Items
  (mutasiItems || []).forEach((mutasi) => {
    const isCredit = mutasi.type === 'CR';

    if (isCredit) {
      // Inflow
      const links = (mutasi.linkedTransactions || []).filter((l) => l.dbCr === 'CR' || l.nominalAkhir > 0);

      if (links.length > 0) {
        // Allocated per link
        links.forEach((link) => {
          const nominal = Math.abs(link.nominalAkhir);
          if (link.sourceType === 'salur') {
            if (link.sourceId) handledSalurIds.add(link.sourceId);
            if (link.kode) handledSalurIds.add(link.kode);
          } else if (link.sourceType === 'ajar') {
            if (link.sourceId) handledAjarIds.add(link.sourceId);
            if (link.kode) handledAjarIds.add(link.kode);
          } else if (link.sourceType === 'donasi') {
            if (link.sourceId) handledDonasiIds.add(link.sourceId);
            if (link.kode) handledDonasiIds.add(link.kode);
          }

          const subJenis = resolveSubJenisName(link.sourceType, link.kode, link.keterangan, mutasi.keteranganBank);
          allocateInflow(nominal, subJenis);
        });

        // Also process any fee / DB links on this credit mutasi (e.g. Tokopedia fee)
        const feeLinks = (mutasi.linkedTransactions || []).filter((l) => l.dbCr === 'DB' || l.nominalAkhir < 0);
        feeLinks.forEach((link) => {
          const feeAmount = Math.abs(link.nominalAkhir);
          const feeTarget = findPosKeuangan('Operasional Dharma');
          if (feeTarget) {
            feeTarget.totalKeluar += feeAmount;
            feeTarget.countKeluar += 1;
          }
        });
      } else {
        // Direct mutasi credit
        const subJenis = resolveSubJenisName(undefined, undefined, undefined, mutasi.keteranganBank);
        allocateInflow(mutasi.amount, subJenis);
      }
    } else {
      // Outflow (Mutasi DB)
      const links = (mutasi.linkedTransactions || []).filter((l) => l.dbCr === 'DB' || l.nominalAkhir < 0);

      if (links.length > 0) {
        links.forEach((link) => {
          const nominal = Math.abs(link.nominalAkhir);
          // Check if link connects to a pengeluaran
          if (link.sourceId) handledPengeluaranIds.add(link.sourceId);
          if (link.kode) handledPengeluaranIds.add(link.kode);

          let targetPosName = 'Operasional Dharma';
          const txt = `${link.kode} ${link.keterangan || ''}`.toLowerCase();
          if (txt.includes('royalti') || txt.includes('penerbitan') || txt.includes('cetak')) {
            targetPosName = 'Penerbitan Buku Dharma';
          } else if (txt.includes('retret')) {
            targetPosName = 'Kegiatan Retret';
          }

          const target = findPosKeuangan(targetPosName);
          if (target) {
            target.totalKeluar += nominal;
            target.countKeluar += 1;
          }
        });
      } else {
        // Unlinked Mutasi DB
        // Check if there is an exact matching item in pengeluaranList
        const matchedExpense = pengeluaranList.find((p) => {
          if (p.mutasiId && p.mutasiId === mutasi.id) return true;
          if (Math.abs(p.nominal - mutasi.amount) < 1 && (p.mutasiDate === mutasi.date || p.tanggal?.includes(mutasi.date.split('/')[0]))) {
            return true;
          }
          return false;
        });

        if (matchedExpense) {
          handledPengeluaranIds.add(matchedExpense.id);
          const target = findPosKeuangan(matchedExpense.posKeluar);
          if (target) {
            target.totalKeluar += mutasi.amount;
            target.countKeluar += 1;
          }
        } else {
          // Identify expense category from bank statement description
          const txt = (mutasi.keteranganBank || '').toLowerCase();
          let targetPos = 'Operasional Dharma';
          if (txt.includes('royalti') || txt.includes('penerbitan')) {
            targetPos = 'Penerbitan Buku Dharma';
          } else if (txt.includes('retret')) {
            targetPos = 'Kegiatan Retret';
          } else if (txt.includes('non-dharma') || txt.includes('non dharma')) {
            targetPos = 'Operasional Non-Dharma';
          }

          const target = findPosKeuangan(targetPos);
          if (target) {
            target.totalKeluar += mutasi.amount;
            target.countKeluar += 1;
          }
        }
      }
    }
  });

  // 2. Process S-SALUR Orders that have not been accounted for via Mutasi
  (salurOrders || []).forEach((order) => {
    const isHandled =
      handledSalurIds.has(order.id) ||
      (order.orderNumber && handledSalurIds.has(order.orderNumber)) ||
      Array.from(handledSalurIds).some(
        (h) => (order.orderNumber && h.includes(order.orderNumber)) || (order.id && h.includes(order.id))
      );

    if (isHandled) return;

    const nominal = parseRupiahNumber(order.totalDana);
    if (nominal <= 0) return;

    let subJenis = 'Buku Berbayar';
    const itemTitles = (order.items || []).map((i) => (i.title || '').toLowerCase()).join(' ');
    if (itemTitles.includes('t-shirt') || itemTitles.includes('kaos')) {
      subJenis = 'T-Shirt';
    } else if (itemTitles.includes('note') || itemTitles.includes('notebook')) {
      subJenis = 'Note Book';
    } else if (itemTitles.includes('non-yppln') || itemTitles.includes('non yppln')) {
      subJenis = 'Buku Non-YPPLN';
    }

    allocateInflow(nominal, subJenis);
  });

  // 3. Process A-AJAR Transactions that have not been accounted for via Mutasi
  (transaksiAjarList || []).forEach((item) => {
    const isHandled =
      handledAjarIds.has(item.id) ||
      (item.orderNumber && handledAjarIds.has(item.orderNumber)) ||
      Array.from(handledAjarIds).some(
        (h) => (item.orderNumber && h.includes(item.orderNumber)) || (item.id && h.includes(item.id))
      );

    if (isHandled) return;

    const nominal = parseRupiahNumber(item.totalDana);
    if (nominal <= 0) return;

    let subJenis = 'ILR';
    const txt = `${item.eventName || ''} ${item.itemName || ''} ${item.keterangan || ''}`.toLowerCase();
    if (txt.includes('lam-talk') || txt.includes('lam talk')) {
      subJenis = 'Lam-Talk';
    }

    allocateInflow(nominal, subJenis);
  });

  // 4. Process D-DONASI Orders that have not been accounted for via Mutasi
  (donasiOrders || []).forEach((order) => {
    const isHandled =
      handledDonasiIds.has(order.id) ||
      (order.orderNumber && handledDonasiIds.has(order.orderNumber)) ||
      Array.from(handledDonasiIds).some(
        (h) => (order.orderNumber && h.includes(order.orderNumber)) || (order.id && h.includes(order.id))
      );

    if (isHandled) return;

    const nominal = parseRupiahNumber(order.totalDana);
    if (nominal <= 0) return;

    let subJenis = 'Dharma Patron Rutin';
    const txt = `${order.keterangan?.title || ''} ${order.keterangan?.subtitle || ''} ${order.notesText || ''} ${(order.items || []).map((i) => (i.name || '') + ' ' + (i.category || '')).join(' ')}`.toLowerCase();
    if (txt.includes('penerbitan') || txt.includes('kitab suci')) {
      subJenis = 'Donasi Penerbitan Buku';
    } else if (txt.includes('operasional') || txt.includes('bencana') || txt.includes('sosial')) {
      subJenis = 'Donasi Operasional';
    } else if (txt.includes('non-rutin') || txt.includes('non rutin')) {
      subJenis = 'Dharma Patron Non-Rutin';
    }

    allocateInflow(nominal, subJenis);
  });

  // 5. Process Pengeluaran items that have not been deducted yet through Mutasi
  (pengeluaranList || []).forEach((exp) => {
    if (handledPengeluaranIds.has(exp.id) || (exp.no && handledPengeluaranIds.has(exp.no))) return;
    const isHandled = Array.from(handledPengeluaranIds).some(
      (h) => (exp.id && h.includes(exp.id)) || (exp.no && h.includes(exp.no))
    );
    if (isHandled) return;

    const target = findPosKeuangan(exp.posKeluar);
    if (target) {
      target.totalKeluar += exp.nominal || 0;
      target.countKeluar += 1;
    }
  });

  // 3. Assemble and return reconciled PosKeuangan items
  return posKeuanganList.map((original) => {
    const acc = accumulators.get(original.id);
    if (!acc) return original;

    const finalSaldo = Math.round((acc.saldoAwal + acc.totalMasuk - acc.totalKeluar) * 100) / 100;

    return {
      ...original,
      saldo: finalSaldo,
      saldoAwal: acc.saldoAwal,
      totalMasuk: Math.round(acc.totalMasuk * 100) / 100,
      totalKeluar: Math.round(acc.totalKeluar * 100) / 100,
    };
  });
}
