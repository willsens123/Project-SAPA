import { CentralAuditLogEntry, AuditModule } from '../types';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { INITIAL_CHANGE_LOGS } from '../identitasData';

export const CENTRAL_AUDIT_LOGS_STORAGE_KEY = 'central_audit_logs_v1';
export const AUDIT_LOG_EVENT_NAME = 'app:audit-log';

/**
 * Format timestamp in clean Indonesian format
 */
export function formatAuditTimestamp(date: Date = new Date()): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Initial baseline seed audit logs representing crucial past transactions
 */
export const INITIAL_CENTRAL_AUDIT_LOGS: CentralAuditLogEntry[] = [
  // 1. S-SALUR Crucial Events
  {
    id: 'audit-salur-1',
    timestamp: 'Senin, 15 Nov 2021 10:45',
    isoTimestamp: '2021-11-15T10:45:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 211114001',
    recordTitle: 'Agustino Ong (Jalan Menuju Kemahatahuan)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran',
    oldValue: 'Belum Bayar',
    newValue: 'Paid (Lunas)',
    alasan: 'Verifikasi mutasi rekening BCA 888 Rp145.000',
    author: 'Finance Admin',
  },
  {
    id: 'audit-salur-2',
    timestamp: 'Senin, 15 Nov 2021 11:15',
    isoTimestamp: '2021-11-15T11:15:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 211114001',
    recordTitle: 'Agustino Ong',
    actionType: 'Pengiriman',
    field: 'Nomor Resi / Ekspedisi',
    oldValue: 'Belum dikirim (-)',
    newValue: 'TIKI ONS 001234988 (Sudah Dikirim)',
    alasan: 'Paket diserahkan ke kurir TIKI',
    author: 'Koordinator Salur',
  },
  {
    id: 'audit-salur-3',
    timestamp: 'Minggu, 14 Nov 2021 15:30',
    isoTimestamp: '2021-11-14T15:30:00.000Z',
    module: 'S-SALUR',
    recordId: 'POS 211114002',
    recordTitle: 'Cindy Budiman (Buku Menjadi Buddha)',
    actionType: 'Tambah',
    field: 'Transaksi Pesanan',
    oldValue: '-',
    newValue: '2 Buku Menjadi Buddha (Rp200.000)',
    alasan: 'Input pesanan via POS Kasir Stand Waisak',
    author: 'Kasir Salur',
  },

  // 2. D-DONASI Crucial Events
  {
    id: 'audit-donasi-1',
    timestamp: 'Senin, 15 Nov 2021 09:10',
    isoTimestamp: '2021-11-15T09:10:00.000Z',
    module: 'DONASI',
    recordId: 'DP 211115001',
    recordTitle: 'Agustino Ong (Dharma Patron Rutin)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran Donasi',
    oldValue: 'Belum Bayar',
    newValue: 'Paid (Rp100.000)',
    alasan: 'Konfirmasi transfer autodebet BCA 888',
    author: 'Call Center Donasi',
  },
  {
    id: 'audit-donasi-2',
    timestamp: 'Minggu, 14 Nov 2021 14:00',
    isoTimestamp: '2021-11-14T14:00:00.000Z',
    module: 'DONASI',
    recordId: 'DN 211114008',
    recordTitle: 'Bhadra Ksanti (Dana Retret Meditasi Lamrim)',
    actionType: 'Tambah',
    field: 'Donasi Program Terikat',
    oldValue: '-',
    newValue: 'Dana Retret Rp1.500.000',
    alasan: 'Penerimaan donasi sponsorship peserta retret',
    author: 'Fundraising Coordinator',
  },
  {
    id: 'audit-donasi-3',
    timestamp: 'Jumat, 12 Nov 2021 16:20',
    isoTimestamp: '2021-11-12T16:20:00.000Z',
    module: 'DONASI',
    recordId: 'DN 211112003',
    recordTitle: 'Siti Rahmawati',
    actionType: 'Ubah',
    field: 'Pelimpahan Jasa Donatur',
    oldValue: 'Leluhur Keluarga',
    newValue: 'Alm. Bapak H. Rahmad & Keluarga',
    alasan: 'Koreksi penulisan nama pelimpahan jasa sesuai permohonan donatur',
    author: 'Admin Sekretariat',
  },

  // 3. A-AJAR Crucial Events
  {
    id: 'audit-ajar-1',
    timestamp: 'Senin, 15 Nov 2021 08:30',
    isoTimestamp: '2021-11-15T08:30:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2111-001',
    recordTitle: 'Lilo (Kelas Lamrim Dasar Angkatan 12)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran Kursus',
    oldValue: 'Pending (Belum Lunas)',
    newValue: 'Lunas (Rp150.000)',
    alasan: 'Konfirmasi pembayaran via QRIS Mandiri',
    author: 'Admin Edukasi',
  },
  {
    id: 'audit-ajar-2',
    timestamp: 'Sabtu, 13 Nov 2021 13:45',
    isoTimestamp: '2021-11-13T13:45:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2111-002',
    recordTitle: 'Sucek Shi Xian Jen (Pelatihan Penerjemah Sastra)',
    actionType: 'Tambah',
    field: 'Pendaftaran Peserta Ajar',
    oldValue: '-',
    newValue: 'Peserta Reguler (Bebas Biaya Relawan)',
    alasan: 'Pemberian beasiswa relawan penerjemah naskah',
    author: 'Divisi Ajar',
  },

  // 4. IDENTITAS Baseline Events (Mapped from INITIAL_CHANGE_LOGS)
  ...INITIAL_CHANGE_LOGS.map((log) => ({
    id: `audit-identitas-${log.id}`,
    timestamp: log.timestamp,
    module: 'IDENTITAS' as AuditModule,
    recordId: log.codeId || log.identitasId,
    recordTitle: log.namaLengkap,
    actionType: log.actionType,
    field: log.field,
    oldValue: log.oldValue,
    newValue: log.newValue,
    alasan: log.alasan,
    author: 'Admin Identitas',
  })),
];

/**
 * Load central audit logs from localStorage or fallback to initial preset logs
 */
export function loadCentralAuditLogs(): CentralAuditLogEntry[] {
  try {
    const saved = localStorage.getItem(CENTRAL_AUDIT_LOGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load central audit logs from localStorage', e);
  }
  return INITIAL_CENTRAL_AUDIT_LOGS;
}

/**
 * Save central audit logs to localStorage
 */
export function saveCentralAuditLogs(logs: CentralAuditLogEntry[]): void {
  try {
    localStorage.setItem(CENTRAL_AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save central audit logs to localStorage', e);
  }
}

export type AuditEventPayload = Omit<CentralAuditLogEntry, 'id' | 'timestamp' | 'isoTimestamp'> & {
  id?: string;
  timestamp?: string;
  isoTimestamp?: string;
};

/**
 * Dispatches an audit event to all registered listeners across the app
 */
export function dispatchAuditEvent(payload: AuditEventPayload): CentralAuditLogEntry {
  const now = new Date();
  const entry: CentralAuditLogEntry = {
    id: payload.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: payload.timestamp || formatAuditTimestamp(now),
    isoTimestamp: payload.isoTimestamp || now.toISOString(),
    module: payload.module,
    recordId: payload.recordId || '-',
    recordTitle: payload.recordTitle || 'Record',
    actionType: payload.actionType || 'Ubah',
    field: payload.field || 'General',
    oldValue: payload.oldValue || '-',
    newValue: payload.newValue || '-',
    alasan: payload.alasan || 'Pencatatan otomatis oleh sistem',
    author: payload.author || 'Admin / Sistem',
    badgeColor: payload.badgeColor,
    metadata: payload.metadata,
  };

  // Dispatch custom window event
  try {
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(AUDIT_LOG_EVENT_NAME, {
        detail: entry,
      });
      window.dispatchEvent(customEvent);
    }
  } catch (e) {
    console.error('Failed to dispatch audit event', e);
  }

  // Also auto-append to localStorage for resilience
  try {
    const current = loadCentralAuditLogs();
    const updated = [entry, ...current.filter((c) => c.id !== entry.id)];
    saveCentralAuditLogs(updated);
  } catch (e) {
    console.error('Failed to auto-save audit event to storage', e);
  }

  return entry;
}

/**
 * Subscribes to audit events dispatched throughout the app
 */
export function subscribeAuditEvent(
  handler: (entry: CentralAuditLogEntry) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<CentralAuditLogEntry>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener(AUDIT_LOG_EVENT_NAME, listener);
  return () => {
    window.removeEventListener(AUDIT_LOG_EVENT_NAME, listener);
  };
}

/**
 * Automated deep-diff detector for S-SALUR orders
 */
export function auditDiffSalurOrders(
  oldOrders: SalurOrder[],
  newOrders: SalurOrder[],
  author: string = 'Admin Salur'
): CentralAuditLogEntry[] {
  const generated: CentralAuditLogEntry[] = [];
  const oldMap = new Map(oldOrders.map((o) => [o.id || o.orderNumber, o]));
  const newMap = new Map(newOrders.map((o) => [o.id || o.orderNumber, o]));

  // Check new orders
  newOrders.forEach((newOrd) => {
    const key = newOrd.id || newOrd.orderNumber;
    const oldOrd = oldMap.get(key);

    if (!oldOrd) {
      // New order created
      const title = `${newOrd.customerId || 'Customer'} - ${newOrd.items?.[0]?.title || 'Order'}`;
      const ev = dispatchAuditEvent({
        module: 'S-SALUR',
        recordId: newOrd.orderNumber || newOrd.id,
        recordTitle: title,
        actionType: 'Tambah',
        field: 'Transaksi Pesanan Baru',
        oldValue: '-',
        newValue: `${newOrd.items?.length || 0} item (${newOrd.totalDana || 'Rp0'})`,
        alasan: 'Input transaksi pesanan baru S-SALUR',
        author,
      });
      generated.push(ev);
    } else {
      // Check crucial field modifications
      const title = `${newOrd.customerId || oldOrd.customerId || 'Customer'}`;

      // 1. Payment status changed
      if (oldOrd.paymentStatus !== newOrd.paymentStatus) {
        const ev = dispatchAuditEvent({
          module: 'S-SALUR',
          recordId: newOrd.orderNumber,
          recordTitle: title,
          actionType: 'Status Bayar',
          field: 'Status Pembayaran',
          oldValue: oldOrd.paymentStatus || 'Belum Bayar',
          newValue: newOrd.paymentStatus || 'Paid',
          alasan: `Perubahan status bayar pesanan #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }

      // 2. Shipping status or tracking resi changed
      const oldResi = oldOrd.ekspedisi?.noResi || '-';
      const newResi = newOrd.ekspedisi?.noResi || '-';
      if (oldOrd.shippingStatus !== newOrd.shippingStatus || oldResi !== newResi) {
        const ev = dispatchAuditEvent({
          module: 'S-SALUR',
          recordId: newOrd.orderNumber,
          recordTitle: title,
          actionType: 'Pengiriman',
          field: 'Status & Resi Pengiriman',
          oldValue: `${oldOrd.shippingStatus || 'Belum dikirim'} (${oldResi})`,
          newValue: `${newOrd.shippingStatus || 'Sudah Dikirim'} (${newResi})`,
          alasan: `Update logistik pengiriman #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }

      // 3. Dana or items changed
      if (oldOrd.totalDana !== newOrd.totalDana && oldOrd.totalDana && newOrd.totalDana) {
        const ev = dispatchAuditEvent({
          module: 'S-SALUR',
          recordId: newOrd.orderNumber,
          recordTitle: title,
          actionType: 'Ubah',
          field: 'Total Nominal Pesanan',
          oldValue: oldOrd.totalDana,
          newValue: newOrd.totalDana,
          alasan: `Penyesuaian nilai transaksi pesanan #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }
    }
  });

  // Check deleted orders
  oldOrders.forEach((oldOrd) => {
    const key = oldOrd.id || oldOrd.orderNumber;
    if (!newMap.has(key)) {
      const ev = dispatchAuditEvent({
        module: 'S-SALUR',
        recordId: oldOrd.orderNumber || oldOrd.id,
        recordTitle: `${oldOrd.customerId || 'Customer'}`,
        actionType: 'Hapus',
        field: 'Transaksi Pesanan',
        oldValue: `Order #${oldOrd.orderNumber} (${oldOrd.totalDana || 'Rp0'})`,
        newValue: '(Dihapus / Dibatalkan)',
        alasan: 'Penghapusan data transaksi pesanan S-SALUR',
        author,
      });
      generated.push(ev);
    }
  });

  return generated;
}

/**
 * Automated deep-diff detector for D-DONASI orders
 */
export function auditDiffDonasiOrders(
  oldOrders: DonasiOrder[],
  newOrders: DonasiOrder[],
  author: string = 'Admin Donasi'
): CentralAuditLogEntry[] {
  const generated: CentralAuditLogEntry[] = [];
  const oldMap = new Map(oldOrders.map((o) => [o.id || o.orderNumber, o]));
  const newMap = new Map(newOrders.map((o) => [o.id || o.orderNumber, o]));

  newOrders.forEach((newOrd) => {
    const key = newOrd.id || newOrd.orderNumber;
    const oldOrd = oldMap.get(key);
    const donorName = newOrd.namaDonatur?.name || newOrd.customerId || 'Donatur';

    if (!oldOrd) {
      const itemDesc = newOrd.items?.[0]?.name || newOrd.keterangan?.title || 'Donasi';
      const ev = dispatchAuditEvent({
        module: 'DONASI',
        recordId: newOrd.orderNumber || newOrd.id,
        recordTitle: `${donorName} (${itemDesc})`,
        actionType: 'Tambah',
        field: 'Pencatatan Donasi Baru',
        oldValue: '-',
        newValue: `${newOrd.items?.[0]?.qtyPrice || 'Donasi Terdaftar'}`,
        alasan: 'Pencatatan transaksi donasi baru ke sistem',
        author,
      });
      generated.push(ev);
    } else {
      // Check status bayar
      const oldStatus = oldOrd.statusBadges?.[0] || 'Paid';
      const newStatus = newOrd.statusBadges?.[0] || 'Paid';
      if (oldStatus !== newStatus) {
        const ev = dispatchAuditEvent({
          module: 'DONASI',
          recordId: newOrd.orderNumber || newOrd.id,
          recordTitle: donorName,
          actionType: 'Status Bayar',
          field: 'Status Pembayaran Donasi',
          oldValue: oldStatus,
          newValue: newStatus,
          alasan: `Perubahan status penerimaan donasi #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }

      // Check item / nominal
      const oldPrice = oldOrd.items?.[0]?.qtyPrice;
      const newPrice = newOrd.items?.[0]?.qtyPrice;
      if (oldPrice && newPrice && oldPrice !== newPrice) {
        const ev = dispatchAuditEvent({
          module: 'DONASI',
          recordId: newOrd.orderNumber || newOrd.id,
          recordTitle: donorName,
          actionType: 'Ubah',
          field: 'Nominal Donasi',
          oldValue: oldPrice,
          newValue: newPrice,
          alasan: `Penyesuaian nilai donasi #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }
    }
  });

  oldOrders.forEach((oldOrd) => {
    const key = oldOrd.id || oldOrd.orderNumber;
    if (!newMap.has(key)) {
      const donorName = oldOrd.namaDonatur?.name || oldOrd.customerId || 'Donatur';
      const ev = dispatchAuditEvent({
        module: 'DONASI',
        recordId: oldOrd.orderNumber || oldOrd.id,
        recordTitle: donorName,
        actionType: 'Hapus',
        field: 'Transaksi Donasi',
        oldValue: `Donasi #${oldOrd.orderNumber}`,
        newValue: '(Dihapus)',
        alasan: 'Penghapusan transaksi donasi',
        author,
      });
      generated.push(ev);
    }
  });

  return generated;
}

/**
 * Automated deep-diff detector for A-AJAR transactions
 */
export function auditDiffTransaksiAjar(
  oldItems: TransaksiAjarItem[],
  newItems: TransaksiAjarItem[],
  author: string = 'Admin Ajar'
): CentralAuditLogEntry[] {
  const generated: CentralAuditLogEntry[] = [];
  const oldMap = new Map(oldItems.map((a) => [a.id || a.orderNumber, a]));
  const newMap = new Map(newItems.map((a) => [a.id || a.orderNumber, a]));

  newItems.forEach((newIt) => {
    const key = newIt.id || newIt.orderNumber;
    const oldIt = oldMap.get(key);
    const participant = newIt.customerId || newIt.recipients?.[0] || 'Peserta';
    const txId = newIt.orderNumber || newIt.kodeTransaksi || newIt.id;

    if (!oldIt) {
      const ev = dispatchAuditEvent({
        module: 'AJAR',
        recordId: txId,
        recordTitle: `${participant} (${newIt.eventName || 'A-AJAR'})`,
        actionType: 'Tambah',
        field: 'Pendaftaran Peserta Baru',
        oldValue: '-',
        newValue: `${newIt.itemName || 'Program Ajar'} (${newIt.totalDana || 'Rp0'})`,
        alasan: 'Pendaftaran dan input transaksi A-AJAR baru',
        author,
      });
      generated.push(ev);
    } else {
      // Check status bayar
      const oldStatus = oldIt.statusBadges?.[0] || 'Paid';
      const newStatus = newIt.statusBadges?.[0] || 'Paid';
      if (oldStatus !== newStatus) {
        const ev = dispatchAuditEvent({
          module: 'AJAR',
          recordId: txId,
          recordTitle: participant,
          actionType: 'Status Bayar',
          field: 'Status Pembayaran Kursus',
          oldValue: oldStatus,
          newValue: newStatus,
          alasan: `Perubahan status bayar transaksi A-AJAR #${txId}`,
          author,
        });
        generated.push(ev);
      }

      // Check totalDana
      if (oldIt.totalDana !== newIt.totalDana && oldIt.totalDana && newIt.totalDana) {
        const ev = dispatchAuditEvent({
          module: 'AJAR',
          recordId: txId,
          recordTitle: participant,
          actionType: 'Ubah',
          field: 'Total Dana / Biaya A-AJAR',
          oldValue: String(oldIt.totalDana),
          newValue: String(newIt.totalDana),
          alasan: `Penyesuaian biaya transaksi #${txId}`,
          author,
        });
        generated.push(ev);
      }

      // Check eventName
      if (oldIt.eventName !== newIt.eventName && newIt.eventName) {
        const ev = dispatchAuditEvent({
          module: 'AJAR',
          recordId: txId,
          recordTitle: participant,
          actionType: 'Ubah',
          field: 'Program / Acara Ajar',
          oldValue: oldIt.eventName || '-',
          newValue: newIt.eventName,
          alasan: `Pindah kelas/program acara #${txId}`,
          author,
        });
        generated.push(ev);
      }
    }
  });

  oldItems.forEach((oldIt) => {
    const key = oldIt.id || oldIt.orderNumber;
    if (!newMap.has(key)) {
      const participant = oldIt.customerId || oldIt.recipients?.[0] || 'Peserta';
      const txId = oldIt.orderNumber || oldIt.kodeTransaksi || oldIt.id;
      const ev = dispatchAuditEvent({
        module: 'AJAR',
        recordId: txId,
        recordTitle: participant,
        actionType: 'Hapus',
        field: 'Transaksi Ajar',
        oldValue: `Transaksi #${txId}`,
        newValue: '(Dihapus)',
        alasan: 'Penghapusan transaksi A-AJAR',
        author,
      });
      generated.push(ev);
    }
  });

  return generated;
}
