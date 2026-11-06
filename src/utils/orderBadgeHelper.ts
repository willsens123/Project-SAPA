import { MutasiItem, SayPaidRecord } from '../types';

export interface OrderBadgeResult {
  badge1: {
    text: string;
    bgClass: string;
    title: string;
  };
  badge2: {
    text: string;
    bgClass: string;
    title: string;
  };
}

export interface OrderForBadgeCalculation {
  id: string;
  orderNumber?: string;
  totalDana?: string;
  sayPaidData?: SayPaidRecord[];
}

/**
 * Helper to calculate the two top-right Paid badges for:
 * - Transaksi S-SALUR
 * - Transaksi A-AJAR
 * - Transaksi D-DONASI
 *
 * Rules:
 * 1. "Paid" Kiri:
 *    - jika sudah Say Paid -> "Paid" dengan highlight warna hijau
 *    - jika belum -> "-" dengan highlight warna merah
 * 2. "Paid" Kanan:
 *    - jika belum dikonekan -> "-" dengan highlight warna merah
 *    - jika sudah dikonekan tapi jumlah mutasi kurang -> kekurangan pembayaran dengan highlight merah
 *    - jika sudah dikonekan tapi jumlah mutasi lebih -> kelebihan pembayaran dengan highlight kuning
 *    - jika sudah dikonekan dan jumlah mutasi sama dengan transaksi -> "Paid" dengan highlight warna hijau
 */
export function calculateOrderBadges(
  order: OrderForBadgeCalculation,
  mutasiItems: MutasiItem[] = []
): OrderBadgeResult {
  const rawTotal =
    order.totalDana !== undefined && order.totalDana !== null ? String(order.totalDana) : '';
  const targetAmount = parseFloat(rawTotal.replace(/[^\d]/g, '')) || 0;

  // Aturan User: Jika Transaksi S-SALUR, Transaksi A-AJAR, Transaksi D-DONASI adalah 0,
  // maka langsung buat dia kode mutasi lunas dan say paid.
  if (targetAmount === 0) {
    return {
      badge1: {
        text: 'Paid',
        bgClass: 'bg-[#008d91] text-white hover:bg-[#00787c]',
        title: 'Say Paid: Paid (Transaksi Rp 0 / Gratis)',
      },
      badge2: {
        text: 'Paid',
        bgClass: 'bg-[#008d91] text-white hover:bg-[#00787c]',
        title: 'Kode Mutasi: Paid / Lunas (Transaksi Rp 0 / Gratis)',
      },
    };
  }

  // 1. Paid Kiri: Say Paid
  const hasSayPaid = Boolean(
    order.sayPaidData &&
    order.sayPaidData.length > 0 &&
    order.sayPaidData.some(
      (r) =>
        (r.nominal !== '' && r.nominal !== 0 && r.nominal !== undefined && r.nominal !== null) ||
        Boolean(r.rekening && r.rekening.trim()) ||
        Boolean(r.tanggalPembayaran && r.tanggalPembayaran.trim()) ||
        Boolean(r.buktiFotoUrls && r.buktiFotoUrls.length > 0)
    )
  );

  const badge1 = hasSayPaid
    ? {
        text: 'Paid',
        bgClass: 'bg-[#008d91] text-white hover:bg-[#00787c]',
        title: 'Say Paid: Paid (Klik untuk melihat / kelola Say Paid)',
      }
    : {
        text: '-',
        bgClass: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
        title: 'Say Paid: Belum di-input (Klik untuk input Say Paid)',
      };

  // 2. Paid Kanan: Koneksi Kode Mutasi
  let connectedAmount = 0;
  let connectedCount = 0;

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

  const isConnected = connectedCount > 0;
  const diff = connectedAmount - targetAmount;

  let badge2: { text: string; bgClass: string; title: string };

  if (!isConnected) {
    badge2 = {
      text: '-',
      bgClass: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
      title: 'Kode Mutasi: Belum terkoneksi (Klik untuk hubungkan)',
    };
  } else if (Math.abs(diff) < 1) {
    badge2 = {
      text: 'Paid',
      bgClass: 'bg-[#008d91] text-white hover:bg-[#00787c]',
      title: `Kode Mutasi: Paid (Nominal pas Rp ${targetAmount.toLocaleString('id-ID')})`,
    };
  } else if (diff < 0) {
    const kurang = Math.abs(diff);
    badge2 = {
      text: `-Rp ${kurang.toLocaleString('id-ID')}`,
      bgClass: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
      title: `Nominal mutasi kurang Rp ${kurang.toLocaleString('id-ID')} dari total transaksi`,
    };
  } else {
    const lebih = diff;
    badge2 = {
      text: `+Rp ${lebih.toLocaleString('id-ID')}`,
      bgClass: 'bg-[#eab308] text-slate-900 font-bold hover:bg-[#ca8a04]',
      title: `Nominal mutasi melebihi Rp ${lebih.toLocaleString('id-ID')} dari total transaksi`,
    };
  }

  return { badge1, badge2 };
}
