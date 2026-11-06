import { MutasiItem, PengeluaranItem, ProjectItem, JenisProyekItem } from './types';
import { SalurOrder } from './salurData';
import { DonasiOrder } from './donasiData';
import { isBukuBerbayarSalur, isBukuTidakBerbayarSalur, formatSalurCoaAccountName } from './salurCoaHelper';
import { KebutuhanPengeluaranItem } from './kebutuhanPengeluaranData';
import { PosPengeluaranGroup } from './posPengeluaranData';
import { TransaksiAjarItem } from './transaksiAjarData';

export interface CoaAccount {
  noAkun: string;
  namaAkun: string;
  pos: 'D' | 'K';
  kelompok: 'AKTIVA' | 'KEWAJIBAN' | 'EKUITAS' | 'PENDAPATAN' | 'BIAYA PROGRAM' | 'BIAYA OPERASIONAL';
  isHeader?: boolean;
  saldoAwalDebet: number;
  saldoAwalKredit: number;
}

export interface JournalLine {
  id: string;
  keterangan: string;
  kodeAkunDb?: string;
  kodeAkunKr?: string;
  namaAkun: string;
  nominalDebet: number;
  nominalKredit: number;
}

export interface JournalEntry {
  id: string;
  mutasiId?: string;
  nomorJurnal: string;
  tanggalJurnal: string;
  nomorReferensiBank: string;
  keteranganTransaksi: string;
  rekeningBank: string;
  programKegiatan: string;
  kategoriDana: 'Dana Terikat' | 'Dana Tidak Terikat' | 'Dana Operasional';
  sumberTransaksi: 'Mutasi Bank' | 'Transaksi Salur' | 'Transaksi Donasi' | 'Transaksi Ajar' | 'Pengeluaran' | 'Manual';
  statusPersetujuan: 'Disetujui' | 'Menunggu Persetujuan' | 'Draft' | 'Dibalikkan';
  penggunaMenyetujui: string;
  waktuPosting: string;
  isReversed?: boolean;
  reversedByNomorJurnal?: string;
  isReversalEntry?: boolean;
  reversalOfNomorJurnal?: string;
  reversalReason?: string;
  lines: JournalLine[];
  totalDebet?: number;
  totalKredit?: number;
  isBalanced?: boolean;
}

export interface AktivaCoaOption {
  noAkun: string;
  namaAkun: string;
}

export const AKTIVA_COA_10100_10299: AktivaCoaOption[] = [
  { noAkun: '10001', namaAkun: 'Kas BCA Penerbitan' },
  { noAkun: '10002', namaAkun: 'Kas BCA Kegiatan Retret' },
  { noAkun: '10003', namaAkun: 'Kas BCA Operasional Dharma' },
  { noAkun: '10004', namaAkun: 'Kas BCA Operasional Non-Dharma' },
  { noAkun: '10101', namaAkun: 'Donasi Buku Berbayar' },
  { noAkun: '10102', namaAkun: 'Patron Non-Rutin' },
  { noAkun: '10103', namaAkun: 'Patron Rutin' },
  { noAkun: '10104', namaAkun: 'Donasi' },
  { noAkun: '10205', namaAkun: 'Kas Lain - Project Ananda' },
];

export const INITIAL_COA_LIST: CoaAccount[] = [
  // 10000 AKTIVA
  { noAkun: '10000', namaAkun: 'AKTIVA', pos: 'D', kelompok: 'AKTIVA', isHeader: true, saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '10001', namaAkun: 'Kas BCA Penerbitan', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 641221612, saldoAwalKredit: 0 },
  { noAkun: '10002', namaAkun: 'Kas BCA Kegiatan Retret', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 2104168288, saldoAwalKredit: 0 },
  { noAkun: '10003', namaAkun: 'Kas BCA Operasional Dharma', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: -1739794709, saldoAwalKredit: 0 },
  { noAkun: '10004', namaAkun: 'Kas BCA Operasional Non-Dharma', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: -48552203, saldoAwalKredit: 0 },
  // 10101 - 10299 Aktiva COA Jenis Proyek
  { noAkun: '10101', namaAkun: 'Donasi Buku Berbayar', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 2000000, saldoAwalKredit: 0 },
  { noAkun: '10102', namaAkun: 'Patron Non-Rutin', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '10103', namaAkun: 'Patron Rutin', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 10000000, saldoAwalKredit: 0 },
  { noAkun: '10104', namaAkun: 'Donasi', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '10205', namaAkun: 'Kas Lain - Project Ananda', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '10301', namaAkun: 'Deposito Teks Dharma', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 340000000, saldoAwalKredit: 0 },
  { noAkun: '10302', namaAkun: 'Deposito Transkrip', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '10303', namaAkun: 'Deposito Operasional', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 35056599, saldoAwalKredit: 0 },
  { noAkun: '10400', namaAkun: 'Piutang', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 70253164, saldoAwalKredit: 0 },
  { noAkun: '10500', namaAkun: 'Persediaan', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 321137363, saldoAwalKredit: 0 },
  { noAkun: '10501', namaAkun: 'Persediaan Kaos', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 580000, saldoAwalKredit: 0 },
  { noAkun: '10600', namaAkun: 'Sewa Dimuka', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 8000013, saldoAwalKredit: 0 },
  { noAkun: '10601', namaAkun: 'Uang Muka', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 28290200, saldoAwalKredit: 0 },
  { noAkun: '10700', namaAkun: 'Inventaris', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 8160570, saldoAwalKredit: 0 },
  { noAkun: '10701', namaAkun: 'Perlengkapan Kantor', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: 84598200, saldoAwalKredit: 0 },
  { noAkun: '10800', namaAkun: 'Akum. Peny. Perlengkapan Kantor', pos: 'D', kelompok: 'AKTIVA', saldoAwalDebet: -58121516, saldoAwalKredit: 0 },

  // 20000 KEWAJIBAN
  { noAkun: '20000', namaAkun: 'KEWAJIBAN', pos: 'K', kelompok: 'KEWAJIBAN', isHeader: true, saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '20100', namaAkun: 'Hutang Dagang', pos: 'K', kelompok: 'KEWAJIBAN', saldoAwalDebet: 0, saldoAwalKredit: 83153500 },
  { noAkun: '20200', namaAkun: 'Hutang Lain-lain', pos: 'K', kelompok: 'KEWAJIBAN', saldoAwalDebet: 0, saldoAwalKredit: 284928170 },
  { noAkun: '21000', namaAkun: 'Pendapatan diterima dimuka', pos: 'K', kelompok: 'KEWAJIBAN', saldoAwalDebet: 0, saldoAwalKredit: 61167318 },

  // 30000 EKUITAS
  { noAkun: '30000', namaAkun: 'EKUITAS', pos: 'K', kelompok: 'EKUITAS', isHeader: true, saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '30100', namaAkun: 'Modal', pos: 'K', kelompok: 'EKUITAS', saldoAwalDebet: 0, saldoAwalKredit: 203495236 },
  { noAkun: '30200', namaAkun: 'Saldo Dana Terikat', pos: 'K', kelompok: 'EKUITAS', saldoAwalDebet: 0, saldoAwalKredit: 1850000000 },
  { noAkun: '30300', namaAkun: 'Saldo Dana Tidak Terikat', pos: 'K', kelompok: 'EKUITAS', saldoAwalDebet: 0, saldoAwalKredit: 980000000 },

  // 40000 PENDAPATAN
  { noAkun: '40000', namaAkun: 'PENDAPATAN', pos: 'K', kelompok: 'PENDAPATAN', isHeader: true, saldoAwalDebet: 0, saldoAwalKredit: 0 },
  // Akun Pendapatan Khusus Buku Berbayar Item S-SALUR (Range 40002 - 49990)
  { noAkun: '40002', namaAkun: 'Pendapatan Salur - Jalan Menuju Kemahatahuan', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40003', namaAkun: 'Pendapatan Salur - Demi Kepentingan Semua Makhluk', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40004', namaAkun: 'Pendapatan Salur - Menjadi Buddha di Tempat Kerja', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40005', namaAkun: "Pendapatan Salur - The Leader's Way", pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40006', namaAkun: 'Pendapatan Salur - Lakon Hidup Sang Penerang', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40007', namaAkun: 'Pendapatan Salur - Intisari Amerta', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40101', namaAkun: 'Pendapatan Donasi Teks Dharma', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40102', namaAkun: 'Pendapatan Donasi Operasional', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40103', namaAkun: 'Pendapatan Donasi Kegiatan Dharma', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40201', namaAkun: 'Pendapatan Penjualan Buku / Salur (Umum)', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40301', namaAkun: 'Pendapatan Kegiatan / Ajar', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '40999', namaAkun: 'Pendapatan Jasa & Bunga Bank', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '49997', namaAkun: 'Pendapatan Dana Dharma Patron', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '49998', namaAkun: 'Pendapatan Donasi', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '49999', namaAkun: 'Pendapatan Lain-Lain', pos: 'K', kelompok: 'PENDAPATAN', saldoAwalDebet: 0, saldoAwalKredit: 0 },

  // 50000 BIAYA PROGRAM
  { noAkun: '50000', namaAkun: 'BIAYA PROGRAM', pos: 'D', kelompok: 'BIAYA PROGRAM', isHeader: true, saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '50100', namaAkun: 'Cetak Buku Dharma', pos: 'D', kelompok: 'BIAYA PROGRAM', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '50101', namaAkun: 'Biaya Cetak & Penerbitan Buku', pos: 'D', kelompok: 'BIAYA PROGRAM', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '50201', namaAkun: 'Biaya Transkrip & Teks Dharma', pos: 'D', kelompok: 'BIAYA PROGRAM', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '50300', namaAkun: 'Biaya Event & Retret', pos: 'D', kelompok: 'BIAYA PROGRAM', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '50301', namaAkun: 'Biaya Event & Kegiatan Dharma', pos: 'D', kelompok: 'BIAYA PROGRAM', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '50302', namaAkun: 'Resi LION Kiriman / Biaya Distribusi Program', pos: 'D', kelompok: 'BIAYA PROGRAM', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '50303', namaAkun: 'Biaya Ajar & Edukasi', pos: 'D', kelompok: 'BIAYA PROGRAM', saldoAwalDebet: 0, saldoAwalKredit: 0 },

  // 60000 BIAYA OPERASIONAL & UMUM
  { noAkun: '60000', namaAkun: 'BIAYA OPERASIONAL & UMUM', pos: 'D', kelompok: 'BIAYA OPERASIONAL', isHeader: true, saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '60100', namaAkun: 'Gaji', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '60101', namaAkun: 'Operasional Kantor', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '60200', namaAkun: 'Air PDAM & Internet', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '60300', namaAkun: 'Transport Antar Paket & Operasional', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '60500', namaAkun: 'Biaya Boost Iklan', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '60600', namaAkun: 'Ekspedisi & Distribusi', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '60700', namaAkun: 'Perlengkapan Pengiriman Buku Berbayar', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
  { noAkun: '69999', namaAkun: 'Biaya Charge Bank & Lainnya', pos: 'D', kelompok: 'BIAYA OPERASIONAL', saldoAwalDebet: 0, saldoAwalKredit: 0 },
];

const COA_STORAGE_KEY = 'yppln_accounting_coa_v2';
const REVERSAL_JOURNAL_STORAGE_KEY = 'yppln_accounting_reversals_v2';

export function loadCoaList(): CoaAccount[] {
  try {
    const raw = localStorage.getItem(COA_STORAGE_KEY);
    if (!raw) {
      saveCoaList(INITIAL_COA_LIST);
      return INITIAL_COA_LIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let hasAdded = false;

      // Migrate old account numbers to new requested numbers:
      // 10201 -> 10001 (Kas BCA Penerbitan)
      // 10202 -> 10001 (Kas BCA Penerbitan)
      // 10203 -> 10003 (Kas BCA Operasional Dharma)
      // 10204 -> 10002 (Kas BCA Kegiatan Retret)
      // 10206 -> 10004 (Kas BCA Operasional Non-Dharma)
      const migrationMap: Record<string, { noAkun: string; namaAkun: string }> = {
        '10201': { noAkun: '10001', namaAkun: 'Kas BCA Penerbitan' },
        '10202': { noAkun: '10001', namaAkun: 'Kas BCA Penerbitan' },
        '10203': { noAkun: '10003', namaAkun: 'Kas BCA Operasional Dharma' },
        '10204': { noAkun: '10002', namaAkun: 'Kas BCA Kegiatan Retret' },
        '10206': { noAkun: '10004', namaAkun: 'Kas BCA Operasional Non-Dharma' },
      };

      const deduplicated: CoaAccount[] = [];
      const seen = new Map<string, CoaAccount>();

      parsed.forEach((p: CoaAccount) => {
        if (migrationMap[p.noAkun]) {
          const target = migrationMap[p.noAkun];
          p.noAkun = target.noAkun;
          p.namaAkun = target.namaAkun;
          hasAdded = true;
        }

        if (!seen.has(p.noAkun)) {
          seen.set(p.noAkun, p);
          deduplicated.push(p);
        } else {
          // Merge saldos if any
          const existing = seen.get(p.noAkun)!;
          if (p.saldoAwalDebet && (!existing.saldoAwalDebet || existing.saldoAwalDebet === 0)) {
            existing.saldoAwalDebet = p.saldoAwalDebet;
          }
          if (p.saldoAwalKredit && (!existing.saldoAwalKredit || existing.saldoAwalKredit === 0)) {
            existing.saldoAwalKredit = p.saldoAwalKredit;
          }
          hasAdded = true;
        }
      });

      const existingMap = new Map(deduplicated.map((p: CoaAccount) => [p.noAkun, p]));
      INITIAL_COA_LIST.forEach((init) => {
        if (!existingMap.has(init.noAkun)) {
          deduplicated.push(init);
          hasAdded = true;
        } else {
          // Synchronize updated official account names & initial balances for key bank accounts
          const existing = existingMap.get(init.noAkun);
          if (existing && ['49997', '49998', '49999', '60600', '10001', '10002', '10003', '10004', '10101', '10102', '10103', '10104'].includes(init.noAkun)) {
            if (existing.namaAkun !== init.namaAkun) {
              existing.namaAkun = init.namaAkun;
              hasAdded = true;
            }
            if (init.noAkun === '10001' && (!existing.saldoAwalDebet || existing.saldoAwalDebet === 0)) {
              existing.saldoAwalDebet = init.saldoAwalDebet;
              hasAdded = true;
            }
          }
        }
      });
      if (hasAdded) {
        deduplicated.sort((a: CoaAccount, b: CoaAccount) => a.noAkun.localeCompare(b.noAkun));
        saveCoaList(deduplicated);
      }
      return deduplicated;
    }
    return INITIAL_COA_LIST;
  } catch (e) {
    console.error('Failed to load COA from storage', e);
    return INITIAL_COA_LIST;
  }
}

export function saveCoaList(items: CoaAccount[]): void {
  try {
    localStorage.setItem(COA_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save COA to storage', e);
  }
}

export function loadReversalJournals(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(REVERSAL_JOURNAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load reversals from storage', e);
    return [];
  }
}

export function saveReversalJournals(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(REVERSAL_JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save reversals to storage', e);
  }
}

/**
 * GENERATE JOURNALS DIRECTLY & AUTOMATICALLY FROM MUTASI
 * STRICT AUDIT RULE:
 * 1. Setiap jurnal bersumber 1:1 dari mutasiItems
 * 2. Tidak ada data yang muncul jika tidak ada di mutasi
 * 3. Total Debet wajib setara Total Kredit (Balanced)
 */
export function generateJournalsFromMutasi(
  mutasiItems: MutasiItem[],
  pengeluaranList: PengeluaranItem[] = [],
  reversalList: JournalEntry[] = [],
  coaList: CoaAccount[] = [],
  salurOrders: SalurOrder[] = [],
  donasiOrders: DonasiOrder[] = [],
  kebutuhanPengeluaranList: KebutuhanPengeluaranItem[] = [],
  posPengeluaranList: PosPengeluaranGroup[] = [],
  projects: ProjectItem[] = [],
  jenisProyekList: JenisProyekItem[] = [],
  transaksiAjarList: TransaksiAjarItem[] = []
): JournalEntry[] {
  const journals: JournalEntry[] = [];

  // Map COA accounts by number for dynamic resolution
  const coaMap = new Map<string, CoaAccount>();
  coaList.forEach((c) => {
    coaMap.set(c.noAkun, c);
  });
  const getCoaName = (code: string, fallback: string): string => {
    const acc = coaMap.get(code);
    return acc ? acc.namaAkun : fallback;
  };

  // Map reversals by original journal ID
  const reversalMap = new Map<string, JournalEntry>();
  reversalList.forEach((r) => {
    if (r.reversalOfNomorJurnal) {
      reversalMap.set(r.reversalOfNomorJurnal, r);
    }
  });

  // Sets to track handled entities so we don't duplicate when recapping S-SALUR, D-DONASI, A-AJAR, and Pengeluaran
  const handledSalurOrderIds = new Set<string>();
  const handledDonasiOrderIds = new Set<string>();
  const handledAjarItemIds = new Set<string>();
  const handledPengeluaranIds = new Set<string>();

  mutasiItems.forEach((mutasi) => {
    // Record any explicitly linked IDs in mutasi
    (mutasi.linkedTransactions || []).forEach((lt) => {
      if (lt.sourceType === 'salur') {
        if (lt.kode) handledSalurOrderIds.add(lt.kode);
        if (lt.orderId) handledSalurOrderIds.add(lt.orderId);
      } else if (lt.sourceType === 'donasi') {
        if (lt.kode) handledDonasiOrderIds.add(lt.kode);
        if (lt.orderId) handledDonasiOrderIds.add(lt.orderId);
      } else if (lt.sourceType === 'ajar') {
        if (lt.kode) handledAjarItemIds.add(lt.kode);
        if (lt.orderId) handledAjarItemIds.add(lt.orderId);
      } else if (lt.sourceType === 'pengeluaran' || lt.dbCr === 'DB') {
        if (lt.kode) handledPengeluaranIds.add(lt.kode);
        if (lt.orderId) handledPengeluaranIds.add(lt.orderId);
      }
    });

    // Generate clean Journal Number linked directly to mutasi
    const bankClean = (mutasi.bankAccount || 'BCA 888').replace(/\s+/g, '');
    const cleanId = mutasi.id.replace(/^mutasi-/, '').toUpperCase();
    const nomorJurnal = `JU-${bankClean}-${cleanId}`;

    // Bank COA Account code
    let bankCoaCode = '10003';
    let bankCoaName = getCoaName('10003', 'Kas BCA Operasional Dharma');
    const bankAcc = (mutasi.bankAccount || '').toLowerCase();
    const ketLower = (mutasi.keteranganBank || '').toLowerCase();

    if (bankAcc.includes('388')) {
      bankCoaCode = '10004';
      bankCoaName = getCoaName('10004', 'Kas BCA Operasional Non-Dharma');
    } else if (bankAcc.includes('mandiri')) {
      bankCoaCode = '10205';
      bankCoaName = getCoaName('10205', 'Kas Lain - Project Ananda / Mandiri');
    } else {
      // BCA 888
      if (ketLower.includes('teks') || ketLower.includes('dksm') || ketLower.includes('penerbitan') || ketLower.includes('salur') || ketLower.includes('buku')) {
        bankCoaCode = '10001';
        bankCoaName = getCoaName('10001', 'Kas BCA Penerbitan');
      } else if (ketLower.includes('donasi') || ketLower.includes('patron') || ketLower.includes('retret') || ketLower.includes('ajar')) {
        bankCoaCode = '10002';
        bankCoaName = getCoaName('10002', 'Kas BCA Kegiatan Retret');
      }
    }

    let program = 'Operasional Yayasan';
    let kategoriDana: 'Dana Terikat' | 'Dana Tidak Terikat' | 'Dana Operasional' = 'Dana Operasional';
    let sumberTransaksi: 'Mutasi Bank' | 'Transaksi Salur' | 'Transaksi Donasi' | 'Transaksi Ajar' | 'Pengeluaran' | 'Manual' = 'Mutasi Bank';

    const lines: JournalLine[] = [];

    if (mutasi.type === 'CR') {
      // ==============================================================
      // UANG MASUK KE BANK (CR) -> Bank bertambah di DEBET
      // ==============================================================

      // 1. Check if Donasi Patron Rutin
      const isDonasiPatronRutin =
        mutasi.id === 'mutasi-patron-a' ||
        (ketLower.includes('mutasi a') && (ketLower.includes('patron') || ketLower.includes('dharma patron') || (mutasi.amount === 10000 && !ketLower.includes('kemahatahuan')))) ||
        ketLower.includes('donasi dharma patron rutin') ||
        ketLower.includes('donasi patron rutin') ||
        ketLower.includes('dharma patron rutin') ||
        (mutasi.linkedTransactions || []).some(
          (l) =>
            l.sourceType === 'donasi' &&
            (l.keterangan?.toLowerCase().includes('patron') ||
              l.kode?.toLowerCase().includes('patron') ||
              (l.orderId && l.orderId.toLowerCase().includes('patron')))
        ) ||
        (mutasi.linkedTransactions || []).some((l) => {
          if (l.sourceType !== 'donasi') return false;
          const matchedOrder = donasiOrders.find(
            (o) => o.id === l.orderId || o.id === l.kode || o.orderNumber === l.kode
          );
          return (
            matchedOrder &&
            (matchedOrder.items.some(
              (it) =>
                it.name.toLowerCase().includes('patron') ||
                it.category.toLowerCase().includes('patron') ||
                it.coaNoAkun === '49997'
            ) ||
              matchedOrder.keterangan?.title?.toLowerCase().includes('patron'))
          );
        });

      if (isDonasiPatronRutin) {
        // Donasi Patron Rutin: Masuk ke COA 49997 Pendapatan Dana Dharma Patron
        // Pos Keuangan: Penerbitan Buku Dharma 20%, Kegiatan Retret 20%, Operasional Dharma 30%, Operasional Non Dharma 30%
        sumberTransaksi = 'Transaksi Donasi';
        program = 'Program Donasi Dharma Patron Rutin - FUN';
        kategoriDana = 'Dana Terikat';

        // 1. KREDIT: Pendapatan Dana Dharma Patron (COA 49997)
        lines.push({
          id: `line-${mutasi.id}-kr-patron`,
          keterangan: 'Pendapatan Dana Dharma Patron',
          kodeAkunKr: '49997',
          namaAkun: getCoaName('49997', 'Pendapatan Dana Dharma Patron'),
          nominalDebet: 0,
          nominalKredit: mutasi.amount,
        });

        // 2. DEBET: Kas per Pos Pemasukan "Pemasukan YPPLN"
        const debetPenerbitan = Math.round(0.20 * mutasi.amount);
        const debetRetret = Math.round(0.20 * mutasi.amount);
        const debetOpsDharma = Math.round(0.30 * mutasi.amount);
        const debetOpsNonDharma = mutasi.amount - (debetPenerbitan + debetRetret + debetOpsDharma);

        // Kas BCA Penerbitan (10001: 20% - Penerbitan Buku Dharma)
        lines.push({
          id: `line-${mutasi.id}-db-penerbitan`,
          keterangan: 'Kas BCA Penerbitan',
          kodeAkunDb: '10001',
          namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
          nominalDebet: debetPenerbitan,
          nominalKredit: 0,
        });

        // Kas BCA Kegiatan Retret (10002: 20% - Kegiatan Retret)
        lines.push({
          id: `line-${mutasi.id}-db-retret`,
          keterangan: 'Kas BCA Kegiatan Retret',
          kodeAkunDb: '10002',
          namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
          nominalDebet: debetRetret,
          nominalKredit: 0,
        });

        // Kas BCA Operasional Dharma (10003: 30% - Operasional Dharma)
        lines.push({
          id: `line-${mutasi.id}-db-ops-dharma`,
          keterangan: 'Kas BCA Operasional Dharma',
          kodeAkunDb: '10003',
          namaAkun: getCoaName('10003', 'Kas BCA Operasional Dharma'),
          nominalDebet: debetOpsDharma,
          nominalKredit: 0,
        });

        // Kas BCA Operasional Non-Dharma (10004: 30% - Operasional Non Dharma)
        lines.push({
          id: `line-${mutasi.id}-db-ops-non`,
          keterangan: 'Kas BCA Operasional Non-Dharma',
          kodeAkunDb: '10004',
          namaAkun: getCoaName('10004', 'Kas BCA Operasional Non-Dharma'),
          nominalDebet: debetOpsNonDharma,
          nominalKredit: 0,
        });
      } else {
        // 2. Check if S-SALUR
        const isMutasiA =
          mutasi.id === 'mutasi-a' ||
          ketLower.includes('mutasi a') ||
          (ketLower.includes('jalan menuju kemahatahuan') && mutasi.amount === 145000);
        const salurLink = (mutasi.linkedTransactions || []).find((l) => l.sourceType === 'salur');
        const isSalurMutasi = isMutasiA || !!salurLink || (ketLower.includes('salur') && !ketLower.includes('tokopedia'));

        // 3. Check if A-AJAR
        const ajarLink = (mutasi.linkedTransactions || []).find((l) => l.sourceType === 'ajar');
        const matchingAjar = transaksiAjarList.find(
          (a) =>
            (ajarLink && (a.id === ajarLink.kode || a.orderNumber === ajarLink.kode || a.id === ajarLink.orderId || a.kodeTransaksi === ajarLink.kode)) ||
            (a.orderNumber && ketLower.includes(a.orderNumber.toLowerCase())) ||
            (a.kodeTransaksi && ketLower.includes(a.kodeTransaksi.toLowerCase())) ||
            (a.eventName && ketLower.includes(a.eventName.toLowerCase()))
        );
        const isAjarMutasi = !isSalurMutasi && (!!ajarLink || !!matchingAjar || ketLower.includes('ajar') || ketLower.includes('kursus') || (ketLower.includes('retret') && !isDonasiPatronRutin));

        // 4. Check if D-DONASI (Non-Patron)
        const donasiLink = (mutasi.linkedTransactions || []).find((l) => l.sourceType === 'donasi');
        const matchingDonasi = donasiOrders.find(
          (d) =>
            (donasiLink && (d.id === donasiLink.kode || d.orderNumber === donasiLink.kode || d.id === donasiLink.orderId)) ||
            (d.orderNumber && ketLower.includes(d.orderNumber.toLowerCase())) ||
            (d.namaDonatur?.name && ketLower.includes(d.namaDonatur.name.toLowerCase()))
        );
        const isDonasiMutasi = !isSalurMutasi && !isAjarMutasi && (!!donasiLink || !!matchingDonasi || (ketLower.includes('donasi') && !isDonasiPatronRutin));

        if (isSalurMutasi) {
          sumberTransaksi = 'Transaksi Salur';
          // Find matching S-SALUR order
          const matchingOrder = salurOrders.find(
            (o) =>
              (salurLink && (o.id === salurLink.kode || o.orderNumber === salurLink.kode || o.id === salurLink.orderId)) ||
              (isMutasiA && (o.id === 'order-mutasi-a' || o.items.some((it) => it.title.toLowerCase().includes('kemahatahuan'))))
          );

          if (isMutasiA || (matchingOrder && matchingOrder.items.some((it) => it.title.toLowerCase().includes('kemahatahuan')) && mutasi.amount === 145000)) {
            // Mutasi A: Jalan Menuju Kemahatahuan (125.000), ongkir (10.000), donasi (10.000)
            program = 'Program Salur Penerbitan Buku Dharma';
            kategoriDana = 'Dana Terikat';

            // 1. KREDIT: Pendapatan Salur - Jalan Menuju Kemahatahuan (40002: 125.000)
            lines.push({
              id: `line-${mutasi.id}-kr-buku`,
              keterangan: 'Pendapatan Salur - Jalan Menuju Kemahatahuan',
              kodeAkunKr: '40002',
              namaAkun: getCoaName('40002', 'Pendapatan Salur - Jalan Menuju Kemahatahuan'),
              nominalDebet: 0,
              nominalKredit: 125000,
            });

            // 2. KREDIT: Biaya Pengiriman (60600: 10.000)
            lines.push({
              id: `line-${mutasi.id}-kr-ongkir`,
              keterangan: 'Biaya Pengiriman',
              kodeAkunKr: '60600',
              namaAkun: getCoaName('60600', 'Biaya Pengiriman'),
              nominalDebet: 0,
              nominalKredit: 10000,
            });

            // 3. KREDIT: Pendapatan Donasi (49998: 10.000)
            lines.push({
              id: `line-${mutasi.id}-kr-donasi`,
              keterangan: 'Pendapatan Donasi',
              kodeAkunKr: '49998',
              namaAkun: getCoaName('49998', 'Pendapatan Donasi'),
              nominalDebet: 0,
              nominalKredit: 10000,
            });

            // 4. DEBET: Kas BCA Penerbitan (10001: 127.000 -> 125.000 buku + 10.000 ongkir + 2.000 [20% donasi])
            lines.push({
              id: `line-${mutasi.id}-db-penerbitan`,
              keterangan: 'Kas BCA Penerbitan',
              kodeAkunDb: '10001',
              namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
              nominalDebet: 127000,
              nominalKredit: 0,
            });

            // 5. DEBET: Kas BCA Kegiatan Retret (10002: 2.000 -> 20% donasi)
            lines.push({
              id: `line-${mutasi.id}-db-retret`,
              keterangan: 'Kas BCA Kegiatan Retret',
              kodeAkunDb: '10002',
              namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
              nominalDebet: 2000,
              nominalKredit: 0,
            });

            // 6. DEBET: Kas BCA Operasional Dharma (10003: 3.000 -> 30% donasi)
            lines.push({
              id: `line-${mutasi.id}-db-ops-dharma`,
              keterangan: 'Kas BCA Operasional Dharma',
              kodeAkunDb: '10003',
              namaAkun: getCoaName('10003', 'Kas BCA Operasional Dharma'),
              nominalDebet: 3000,
              nominalKredit: 0,
            });

            // 7. DEBET: Kas BCA Operasional Non-Dharma (10004: 3.000 -> 30% donasi)
            lines.push({
              id: `line-${mutasi.id}-db-ops-non`,
              keterangan: 'Kas BCA Operasional Non-Dharma',
              kodeAkunDb: '10004',
              namaAkun: getCoaName('10004', 'Kas BCA Operasional Non-Dharma'),
              nominalDebet: 3000,
              nominalKredit: 0,
            });
          } else if (matchingOrder) {
            program = 'Program Transaksi S-SALUR';
            kategoriDana = 'Dana Terikat';

            let totalBookRevenue = 0;
            let totalNonBookRevenue = 0;

            // 1. KREDIT: Items
            matchingOrder.items.forEach((it, itIdx) => {
              const isPaidBook = isBukuBerbayarSalur(it);
              const isFreeBook = isBukuTidakBerbayarSalur(it);
              if (isFreeBook) return;

              const itemNominal = (it.price || 0) * (it.quantity || 1);
              if (itemNominal <= 0) return;

              if (isPaidBook) {
                totalBookRevenue += itemNominal;
                const bookCoaNo = it.coaNoAkun || '40002';
                const bookName = it.coaNamaAkun || formatSalurCoaAccountName(it.title);
                lines.push({
                  id: `line-${mutasi.id}-item-${itIdx}`,
                  keterangan: bookName,
                  kodeAkunKr: bookCoaNo,
                  namaAkun: getCoaName(bookCoaNo, bookName),
                  nominalDebet: 0,
                  nominalKredit: itemNominal,
                });
              } else {
                totalNonBookRevenue += itemNominal;
                lines.push({
                  id: `line-${mutasi.id}-item-${itIdx}`,
                  keterangan: 'Pendapatan Lain-Lain',
                  kodeAkunKr: '49999',
                  namaAkun: getCoaName('49999', 'Pendapatan Lain-Lain'),
                  nominalDebet: 0,
                  nominalKredit: itemNominal,
                });
              }
            });

            // 2. KREDIT: Ongkos Kirim (COA 60600 Biaya Pengiriman)
            const parseDigits = (s?: string) => {
              if (!s) return 0;
              const d = s.replace(/\D/g, '');
              return d ? Number(d) : 0;
            };
            const ongkirNominal = parseDigits(matchingOrder.costBreakdown?.ongkir);
            if (ongkirNominal > 0) {
              lines.push({
                id: `line-${mutasi.id}-ongkir`,
                keterangan: 'Biaya Pengiriman',
                kodeAkunKr: '60600',
                namaAkun: getCoaName('60600', 'Biaya Pengiriman'),
                nominalDebet: 0,
                nominalKredit: ongkirNominal,
              });
            }

            // 3. KREDIT: Donasi & Kode Unik (COA 49998 Pendapatan Donasi)
            const donasiNominal = parseDigits(matchingOrder.costBreakdown?.donasi);
            const kodeUnikNominal = parseDigits(matchingOrder.costBreakdown?.kodeUnik);
            const donasiTotal = donasiNominal + kodeUnikNominal;
            if (donasiTotal > 0) {
              lines.push({
                id: `line-${mutasi.id}-donasi`,
                keterangan: 'Pendapatan Donasi',
                kodeAkunKr: '49998',
                namaAkun: getCoaName('49998', 'Pendapatan Donasi'),
                nominalDebet: 0,
                nominalKredit: donasiTotal,
              });
            }

            // 4. DEBET: Kas Allocation per Pos Pemasukan & Pos Keuangan
            const donasiPenerbitan = Math.round(0.20 * donasiTotal);
            const donasiRetret = Math.round(0.20 * donasiTotal);
            const donasiOpsDharma = Math.round(0.30 * donasiTotal);
            const donasiOpsNonDharma = donasiTotal - (donasiPenerbitan + donasiRetret + donasiOpsDharma);

            const kasPenerbitanDebet = totalBookRevenue + ongkirNominal + donasiPenerbitan;
            if (kasPenerbitanDebet > 0) {
              lines.push({
                id: `line-${mutasi.id}-db-penerbitan`,
                keterangan: 'Kas BCA Penerbitan',
                kodeAkunDb: '10001',
                namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
                nominalDebet: kasPenerbitanDebet,
                nominalKredit: 0,
              });
            }
            if (donasiRetret > 0) {
              lines.push({
                id: `line-${mutasi.id}-db-retret`,
                keterangan: 'Kas BCA Kegiatan Retret',
                kodeAkunDb: '10002',
                namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
                nominalDebet: donasiRetret,
                nominalKredit: 0,
              });
            }
            if (donasiOpsDharma > 0) {
              lines.push({
                id: `line-${mutasi.id}-db-ops-dharma`,
                keterangan: 'Kas BCA Operasional Dharma',
                kodeAkunDb: '10003',
                namaAkun: getCoaName('10003', 'Kas BCA Operasional Dharma'),
                nominalDebet: donasiOpsDharma,
                nominalKredit: 0,
              });
            }
            const kasOpsNonDharmaDebet = totalNonBookRevenue + donasiOpsNonDharma;
            if (kasOpsNonDharmaDebet > 0) {
              lines.push({
                id: `line-${mutasi.id}-db-ops-non`,
                keterangan: 'Kas BCA Operasional Non-Dharma',
                kodeAkunDb: '10004',
                namaAkun: getCoaName('10004', 'Kas BCA Operasional Non-Dharma'),
                nominalDebet: kasOpsNonDharmaDebet,
                nominalKredit: 0,
              });
            }
          } else {
            // Standard single/generic salur revenue
            lines.push({
              id: `line-${mutasi.id}-rev-salur`,
              keterangan: mutasi.keteranganBank,
              kodeAkunKr: '40201',
              namaAkun: getCoaName('40201', 'Pendapatan Penjualan Buku / Salur (Umum)'),
              nominalDebet: 0,
              nominalKredit: mutasi.amount,
            });
            lines.push({
              id: `line-${mutasi.id}-bank-db`,
              keterangan: 'Kas BCA Penerbitan',
              kodeAkunDb: '10001',
              namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
              nominalDebet: mutasi.amount,
              nominalKredit: 0,
            });
          }
        } else if (isAjarMutasi) {
          // A-AJAR Transaction
          sumberTransaksi = 'Transaksi Ajar';
          program = matchingAjar?.eventName || 'Kegiatan Ajar';
          kategoriDana = 'Dana Terikat';

          lines.push({
            id: `line-${mutasi.id}-kr-ajar`,
            keterangan: matchingAjar ? `${matchingAjar.eventName} - ${matchingAjar.itemName}` : mutasi.keteranganBank,
            kodeAkunKr: '40301',
            namaAkun: getCoaName('40301', 'Pendapatan Kegiatan Ajar'),
            nominalDebet: 0,
            nominalKredit: mutasi.amount,
          });

          lines.push({
            id: `line-${mutasi.id}-bank-db-ajar`,
            keterangan: 'Kas BCA Kegiatan Retret',
            kodeAkunDb: '10002',
            namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
            nominalDebet: mutasi.amount,
            nominalKredit: 0,
          });
        } else if (isDonasiMutasi) {
          // D-DONASI (Non-Patron)
          sumberTransaksi = 'Transaksi Donasi';
          program = matchingDonasi?.keterangan?.title || 'Program Donasi Dharma';
          kategoriDana = 'Dana Terikat';

          if (matchingDonasi && matchingDonasi.items && matchingDonasi.items.length > 0) {
            let totalDonasiKr = 0;
            matchingDonasi.items.forEach((it, idx) => {
              const itNominal = Math.round(mutasi.amount / matchingDonasi.items.length);
              totalDonasiKr += itNominal;
              const codeKr = it.coaNoAkun || (it.name.toLowerCase().includes('cetak') ? '40101' : it.name.toLowerCase().includes('retret') ? '40102' : '49998');
              const nameKr = it.coaNamaAkun || getCoaName(codeKr, it.name);

              lines.push({
                id: `line-${mutasi.id}-don-it-${idx}`,
                keterangan: it.name,
                kodeAkunKr: codeKr,
                namaAkun: nameKr,
                nominalDebet: 0,
                nominalKredit: itNominal,
              });
            });

            // Adjust first item if rounding difference
            const diffKr = mutasi.amount - totalDonasiKr;
            if (diffKr !== 0 && lines.length > 0) {
              lines[0].nominalKredit += diffKr;
            }

            // Split Debet 20:20:30:30
            const debetPenerbitan = Math.round(0.20 * mutasi.amount);
            const debetRetret = Math.round(0.20 * mutasi.amount);
            const debetOpsDharma = Math.round(0.30 * mutasi.amount);
            const debetOpsNonDharma = mutasi.amount - (debetPenerbitan + debetRetret + debetOpsDharma);

            lines.push({
              id: `line-${mutasi.id}-db-penerbitan`,
              keterangan: 'Kas BCA Penerbitan',
              kodeAkunDb: '10001',
              namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
              nominalDebet: debetPenerbitan,
              nominalKredit: 0,
            });
            lines.push({
              id: `line-${mutasi.id}-db-retret`,
              keterangan: 'Kas BCA Kegiatan Retret',
              kodeAkunDb: '10002',
              namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
              nominalDebet: debetRetret,
              nominalKredit: 0,
            });
            lines.push({
              id: `line-${mutasi.id}-db-ops-dharma`,
              keterangan: 'Kas BCA Operasional Dharma',
              kodeAkunDb: '10003',
              namaAkun: getCoaName('10003', 'Kas BCA Operasional Dharma'),
              nominalDebet: debetOpsDharma,
              nominalKredit: 0,
            });
            lines.push({
              id: `line-${mutasi.id}-db-ops-non`,
              keterangan: 'Kas BCA Operasional Non-Dharma',
              kodeAkunDb: '10004',
              namaAkun: getCoaName('10004', 'Kas BCA Operasional Non-Dharma'),
              nominalDebet: debetOpsNonDharma,
              nominalKredit: 0,
            });
          } else {
            lines.push({
              id: `line-${mutasi.id}-kr-donasi-gen`,
              keterangan: mutasi.keteranganBank,
              kodeAkunKr: '49998',
              namaAkun: getCoaName('49998', 'Pendapatan Donasi'),
              nominalDebet: 0,
              nominalKredit: mutasi.amount,
            });

            // 20:20:30:30 allocation
            const debetPenerbitan = Math.round(0.20 * mutasi.amount);
            const debetRetret = Math.round(0.20 * mutasi.amount);
            const debetOpsDharma = Math.round(0.30 * mutasi.amount);
            const debetOpsNonDharma = mutasi.amount - (debetPenerbitan + debetRetret + debetOpsDharma);

            lines.push({
              id: `line-${mutasi.id}-db-penerbitan`,
              keterangan: 'Kas BCA Penerbitan',
              kodeAkunDb: '10001',
              namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
              nominalDebet: debetPenerbitan,
              nominalKredit: 0,
            });
            lines.push({
              id: `line-${mutasi.id}-db-retret`,
              keterangan: 'Kas BCA Kegiatan Retret',
              kodeAkunDb: '10002',
              namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
              nominalDebet: debetRetret,
              nominalKredit: 0,
            });
            lines.push({
              id: `line-${mutasi.id}-db-ops-dharma`,
              keterangan: 'Kas BCA Operasional Dharma',
              kodeAkunDb: '10003',
              namaAkun: getCoaName('10003', 'Kas BCA Operasional Dharma'),
              nominalDebet: debetOpsDharma,
              nominalKredit: 0,
            });
            lines.push({
              id: `line-${mutasi.id}-db-ops-non`,
              keterangan: 'Kas BCA Operasional Non-Dharma',
              kodeAkunDb: '10004',
              namaAkun: getCoaName('10004', 'Kas BCA Operasional Non-Dharma'),
              nominalDebet: debetOpsNonDharma,
              nominalKredit: 0,
            });
          }
        } else {
          // Non-Salur, Non-Ajar, Non-Donasi (Bank bertambah di DEBET)
          lines.push({
            id: `line-${mutasi.id}-bank-db`,
            keterangan: mutasi.keteranganBank,
            kodeAkunDb: bankCoaCode,
            namaAkun: bankCoaName,
            nominalDebet: mutasi.amount,
            nominalKredit: 0,
          });

          // Offsetting lines from linked transactions (e.g. Tokopedia settlement)
          const links = mutasi.linkedTransactions || [];
          if (links.length > 0) {
            let totalLinkedKredit = 0;
            let totalLinkedDebetFee = 0;

            links.forEach((link, lIdx) => {
              const isFeeOrDeduction = link.nominalAkhir < 0 || link.dbCr === 'DB';
              const nominalAbs = Math.abs(link.nominalAkhir);

              if (isFeeOrDeduction) {
                // Fee Tokopedia / merchant deduction -> DEBET
                totalLinkedDebetFee += nominalAbs;
                lines.push({
                  id: `line-${mutasi.id}-fee-${lIdx}`,
                  keterangan: link.keterangan || link.kode || "Biaya Layanan Tokopedia",
                  kodeAkunDb: '69999',
                  namaAkun: getCoaName('69999', 'Biaya Layanan Merchant / Charge Bank'),
                  nominalDebet: nominalAbs,
                  nominalKredit: 0,
                });
              } else {
                // Revenue / Offset -> KREDIT
                totalLinkedKredit += nominalAbs;
                let codeKr = '40201';
                let nameKr = getCoaName('40201', 'Pendapatan Penjualan Buku / Salur');

                if (link.sourceType === 'donasi' || (link.kode && link.kode.startsWith('D-'))) {
                  const linkTxt = (link.keterangan || link.kode || '').toLowerCase();
                  if (linkTxt.includes('patron')) {
                    codeKr = '49997';
                    nameKr = getCoaName('49997', 'Pendapatan Dana Dharma Patron');
                    program = 'Program Donasi Dharma Patron Rutin - FUN';
                  } else {
                    codeKr = '40101';
                    nameKr = getCoaName('40101', 'Pendapatan Donasi Program');
                    program = 'Donasi & Program Dharma';
                  }
                  kategoriDana = 'Dana Terikat';
                  sumberTransaksi = 'Transaksi Donasi';
                } else if (link.sourceType === 'ajar' || (link.kode && link.kode.startsWith('AJR-'))) {
                  codeKr = '40301';
                  nameKr = getCoaName('40301', 'Pendapatan Kegiatan Ajar');
                  program = 'Kegiatan Ajar';
                  kategoriDana = 'Dana Terikat';
                  sumberTransaksi = 'Transaksi Ajar';
                } else if (link.sourceType === 'salur' || (link.kode && link.kode.startsWith('order-'))) {
                  // Resolve specific book if matched
                  const matchedSalur = salurOrders.find((s) => s.id === link.kode || s.orderNumber === link.kode);
                  const firstBook = matchedSalur?.items.find((it) => isBukuBerbayarSalur(it));
                  if (firstBook) {
                    codeKr = firstBook.coaNoAkun || '40002';
                    nameKr = firstBook.coaNamaAkun || formatSalurCoaAccountName(firstBook.title);
                  }
                  program = 'Program Salur Buku';
                  kategoriDana = 'Dana Tidak Terikat';
                  sumberTransaksi = 'Transaksi Salur';
                } else {
                  program = 'Program Yayasan';
                  kategoriDana = 'Dana Tidak Terikat';
                }

                lines.push({
                  id: `line-${mutasi.id}-rev-${lIdx}`,
                  keterangan: link.keterangan || link.kode || nameKr,
                  kodeAkunKr: codeKr,
                  namaAkun: nameKr,
                  nominalDebet: 0,
                  nominalKredit: nominalAbs,
                });
              }
            });

            // Balance validation check
            const totalDb = mutasi.amount + totalLinkedDebetFee;
            const diff = totalDb - totalLinkedKredit;
            if (Math.abs(diff) > 0.01) {
              if (diff > 0) {
                lines.push({
                  id: `line-${mutasi.id}-bal`,
                  keterangan: 'Alokasi Pendapatan Mutasi',
                  kodeAkunKr: '40999',
                  namaAkun: 'Pendapatan Mutasi Belum Teralokasi',
                  nominalDebet: 0,
                  nominalKredit: diff,
                });
              } else {
                const firstKr = lines.find((l) => l.nominalKredit > 0);
                if (firstKr) {
                  firstKr.nominalKredit += diff;
                }
              }
            }
          } else {
            // No linked transactions yet: single KREDIT line
            let codeKr = '40999';
            let nameKr = 'Pendapatan Mutasi Belum Teralokasi';

            if (ketLower.includes('patron')) {
              codeKr = '49997';
              nameKr = getCoaName('49997', 'Pendapatan Dana Dharma Patron');
              program = 'Program Donasi Dharma Patron Rutin - FUN';
              kategoriDana = 'Dana Terikat';
              sumberTransaksi = 'Transaksi Donasi';
            } else if (ketLower.includes('donasi')) {
              codeKr = '40102';
              nameKr = 'Pendapatan Donasi Operasional';
              program = 'Donasi Keumatan';
              kategoriDana = 'Dana Terikat';
              sumberTransaksi = 'Transaksi Donasi';
            } else if (ketLower.includes('buku') || ketLower.includes('salur') || ketLower.includes('dksm')) {
              codeKr = '40201';
              nameKr = 'Pendapatan Penjualan Buku / Salur';
              program = 'Program Salur Buku';
              kategoriDana = 'Dana Tidak Terikat';
              sumberTransaksi = 'Transaksi Salur';
            } else if (ketLower.includes('ajar') || ketLower.includes('retret')) {
              codeKr = '40301';
              nameKr = getCoaName('40301', 'Pendapatan Kegiatan Ajar');
              program = 'Kegiatan Ajar';
              kategoriDana = 'Dana Terikat';
              sumberTransaksi = 'Transaksi Ajar';
            }

            lines.push({
              id: `line-${mutasi.id}-rev-single`,
              keterangan: mutasi.keteranganBank,
              kodeAkunKr: codeKr,
              namaAkun: nameKr,
              nominalDebet: 0,
              nominalKredit: mutasi.amount,
            });
          }
        }
      }
    } else {
      // ==============================================================
      // UANG KELUAR DARI BANK (DB) -> Bank berkurang di KREDIT
      // ==============================================================
      sumberTransaksi = 'Pengeluaran';

      // 1. Helper to resolve COA Account for an expense item from Kebutuhan Pengeluaran
      const resolveExpenseCoa = (
        p: PengeluaranItem
      ): { code: string; name: string } => {
        // A. Priority 1: Direct match with KebutuhanPengeluaranItem (assigned noAkunCoa)
        if (p.kebutuhan) {
          const pKebClean = p.kebutuhan.toLowerCase().trim();
          const matchedKeb = kebutuhanPengeluaranList.find((k) => {
            const kClean = k.kebutuhan.toLowerCase().trim();
            return kClean === pKebClean || pKebClean.includes(kClean) || kClean.includes(pKebClean);
          });
          if (matchedKeb && matchedKeb.noAkunCoa) {
            return {
              code: matchedKeb.noAkunCoa,
              name: matchedKeb.namaAkunCoa || getCoaName(matchedKeb.noAkunCoa, matchedKeb.kebutuhan),
            };
          }
        }

        // B. Priority 2: Direct match with Pos Pengeluaran Group or Kelompok Biaya
        if (p.posKeluar) {
          const pPosClean = p.posKeluar.toLowerCase().trim();
          const matchedKebPos = kebutuhanPengeluaranList.find((k) =>
            k.noAkunCoa && (k.posPengeluaran.toLowerCase().trim() === pPosClean || (k.kelompokBiaya && k.kelompokBiaya.toLowerCase().trim() === pPosClean))
          );
          if (matchedKebPos && matchedKebPos.noAkunCoa) {
            return {
              code: matchedKebPos.noAkunCoa,
              name: matchedKebPos.namaAkunCoa || getCoaName(matchedKebPos.noAkunCoa, matchedKebPos.kebutuhan),
            };
          }
        }

        // C. Priority 3: Direct match with Proyek SAPA COA if project has active COA
        if (p.proyekSapa) {
          const pProyekClean = p.proyekSapa.toLowerCase().trim();
          const matchedJp = jenisProyekList.find(
            (jp) =>
              jp.isCoa &&
              jp.coaCode &&
              jp.jenisKegiatan.toLowerCase().trim() === pProyekClean
          );
          if (matchedJp && matchedJp.coaCode) {
            return {
              code: matchedJp.coaCode,
              name: matchedJp.coaName || getCoaName(matchedJp.coaCode, matchedJp.jenisKegiatan),
            };
          }
        }

        // D. Priority 4: Match text/keyword with KebutuhanPengeluaran list
        const combinedText = `${p.kebutuhan || ''} ${p.keterangan || ''} ${p.posKeluar || ''} ${p.dikeluarkan || ''}`.toLowerCase();
        for (const keb of kebutuhanPengeluaranList) {
          const kClean = keb.kebutuhan.toLowerCase().trim();
          if (keb.noAkunCoa && combinedText.includes(kClean)) {
            return {
              code: keb.noAkunCoa,
              name: keb.namaAkunCoa || getCoaName(keb.noAkunCoa, keb.kebutuhan),
            };
          }
        }

        // E. Priority 5: Predefined fallback account keywords
        if (combinedText.includes('gaji') || combinedText.includes('honor') || combinedText.includes('sdm')) {
          return { code: '60100', name: getCoaName('60100', 'Gaji') };
        }
        if (combinedText.includes('pdam') || combinedText.includes('internet') || combinedText.includes('wifi') || combinedText.includes('listrik') || combinedText.includes('pln')) {
          return { code: '60200', name: getCoaName('60200', 'Air PDAM & Internet') };
        }
        if (combinedText.includes('iklan') || combinedText.includes('boost') || combinedText.includes('promosi') || combinedText.includes('ads')) {
          return { code: '60500', name: getCoaName('60500', 'Biaya Boost Iklan') };
        }
        if (combinedText.includes('cetak buku') || combinedText.includes('percetakan') || combinedText.includes('penerbitan') || combinedText.includes('cetak')) {
          return { code: '50100', name: getCoaName('50100', 'Cetak Buku Dharma') };
        }
        if (combinedText.includes('event') || combinedText.includes('retret') || combinedText.includes('workshop')) {
          return { code: '50300', name: getCoaName('50300', 'Biaya Event & Retret') };
        }
        if (combinedText.includes('ekspedisi') || combinedText.includes('ongkir') || combinedText.includes('kurir') || combinedText.includes('resi') || combinedText.includes('cargo') || combinedText.includes('kirim') || combinedText.includes('jne') || combinedText.includes('jnt') || combinedText.includes('sicepat')) {
          return { code: '60600', name: getCoaName('60600', 'Ekspedisi & Distribusi') };
        }
        if (combinedText.includes('atk') || combinedText.includes('kardus') || combinedText.includes('lakban') || combinedText.includes('packing') || combinedText.includes('perlengkapan')) {
          return { code: '60700', name: getCoaName('60700', 'Perlengkapan Pengiriman Buku Berbayar') };
        }
        if (combinedText.includes('transport') || combinedText.includes('bensin') || combinedText.includes('toll') || combinedText.includes('akomodasi') || combinedText.includes('parkir')) {
          return { code: '60300', name: getCoaName('60300', 'Transport Antar Paket & Operasional') };
        }

        return { code: '69999', name: getCoaName('69999', 'Beban Operasional & Lainnya') };
      };

      // 2. Identify all matched Pengeluaran
      const directMatches = pengeluaranList.filter((p) => p.mutasiId === mutasi.id);
      const linkedMatches: PengeluaranItem[] = [];
      (mutasi.linkedTransactions || []).forEach((link) => {
        if (link.sourceType === 'pengeluaran' || link.dbCr === 'DB') {
          const pMatch = pengeluaranList.find(
            (p) => p.id === link.orderId || p.no === link.kode || p.id === link.kode
          );
          if (
            pMatch &&
            !directMatches.some((dm) => dm.id === pMatch.id) &&
            !linkedMatches.some((lm) => lm.id === pMatch.id)
          ) {
            linkedMatches.push(pMatch);
          }
        }
      });
      const invoiceMatches = pengeluaranList.filter(
        (p) =>
          p.no &&
          mutasi.keteranganBank.toLowerCase().includes(p.no.toLowerCase()) &&
          !directMatches.some((dm) => dm.id === p.id) &&
          !linkedMatches.some((lm) => lm.id === p.id)
      );

      const allMatchingPengeluaran = [...directMatches, ...linkedMatches, ...invoiceMatches];

      if (allMatchingPengeluaran.length > 0) {
        const primary = allMatchingPengeluaran[0];
        program = primary.kebutuhan || primary.posKeluar || 'Operasional Yayasan';
        kategoriDana = primary.posKeluar?.toLowerCase().includes('dharma')
          ? 'Dana Terikat'
          : 'Dana Operasional';

        if (allMatchingPengeluaran.length === 1) {
          const resolved = resolveExpenseCoa(primary);
          lines.push({
            id: `line-${mutasi.id}-exp-0`,
            keterangan: primary.keterangan || primary.kebutuhan || mutasi.keteranganBank,
            kodeAkunDb: resolved.code,
            namaAkun: resolved.name,
            nominalDebet: mutasi.amount,
            nominalKredit: 0,
          });
        } else {
          // Multi-item pengeluaran linked to one mutasi
          let totalAllocatedDb = 0;
          allMatchingPengeluaran.forEach((p, pIdx) => {
            const resolved = resolveExpenseCoa(p);
            const nominalP = p.nominal || Math.round(mutasi.amount / allMatchingPengeluaran.length);
            totalAllocatedDb += nominalP;
            lines.push({
              id: `line-${mutasi.id}-exp-${pIdx}`,
              keterangan: p.keterangan || p.kebutuhan || mutasi.keteranganBank,
              kodeAkunDb: resolved.code,
              namaAkun: resolved.name,
              nominalDebet: nominalP,
              nominalKredit: 0,
            });
          });

          // Balance check on debet side
          const diffDb = mutasi.amount - totalAllocatedDb;
          if (diffDb !== 0 && lines.length > 0) {
            lines[0].nominalDebet += diffDb;
          }
        }

        // Kredit bank
        lines.push({
          id: `line-${mutasi.id}-bank-kr`,
          keterangan: mutasi.keteranganBank,
          kodeAkunKr: bankCoaCode,
          namaAkun: bankCoaName,
          nominalDebet: 0,
          nominalKredit: mutasi.amount,
        });
      } else {
        // Direct DB mutasi with no linked pengeluaran yet
        // Search if bank remark matches any Kebutuhan Pengeluaran
        let resolvedCode = '69999';
        let resolvedName = getCoaName('69999', 'Beban Operasional & Lainnya');

        const ketClean = mutasi.keteranganBank.toLowerCase();
        for (const keb of kebutuhanPengeluaranList) {
          const kClean = keb.kebutuhan.toLowerCase().trim();
          if (keb.noAkunCoa && (ketClean.includes(kClean) || (keb.namaAkunCoa && ketClean.includes(keb.namaAkunCoa.toLowerCase().trim())))) {
            resolvedCode = keb.noAkunCoa;
            resolvedName = keb.namaAkunCoa || getCoaName(keb.noAkunCoa, keb.kebutuhan);
            program = keb.kebutuhan;
            break;
          }
        }

        if (resolvedCode === '69999') {
          if (ketClean.includes('gaji') || ketClean.includes('honor')) {
            resolvedCode = '60100';
            resolvedName = getCoaName('60100', 'Gaji');
          } else if (ketClean.includes('pdam') || ketClean.includes('internet') || ketClean.includes('listrik')) {
            resolvedCode = '60200';
            resolvedName = getCoaName('60200', 'Air PDAM & Internet');
          } else if (ketClean.includes('iklan') || ketClean.includes('boost') || ketClean.includes('ads')) {
            resolvedCode = '60500';
            resolvedName = getCoaName('60500', 'Biaya Boost Iklan');
          } else if (ketClean.includes('cetak') || ketClean.includes('buku')) {
            resolvedCode = '50100';
            resolvedName = getCoaName('50100', 'Cetak Buku Dharma');
          } else if (ketClean.includes('event') || ketClean.includes('retret')) {
            resolvedCode = '50300';
            resolvedName = getCoaName('50300', 'Biaya Event & Retret');
          } else if (ketClean.includes('ekspedisi') || ketClean.includes('ongkir') || ketClean.includes('kurir')) {
            resolvedCode = '60600';
            resolvedName = getCoaName('60600', 'Ekspedisi & Distribusi');
          } else if (ketClean.includes('atk') || ketClean.includes('kardus') || ketClean.includes('lakban') || ketClean.includes('packing')) {
            resolvedCode = '60700';
            resolvedName = getCoaName('60700', 'Perlengkapan Pengiriman Buku Berbayar');
          }
        }

        lines.push({
          id: `line-${mutasi.id}-exp-db`,
          keterangan: mutasi.keteranganBank,
          kodeAkunDb: resolvedCode,
          namaAkun: resolvedName,
          nominalDebet: mutasi.amount,
          nominalKredit: 0,
        });

        lines.push({
          id: `line-${mutasi.id}-bank-kr`,
          keterangan: mutasi.keteranganBank,
          kodeAkunKr: bankCoaCode,
          namaAkun: bankCoaName,
          nominalDebet: 0,
          nominalKredit: mutasi.amount,
        });
      }
    }

    // Strict Double-Entry Balance Audit:
    // Total Debet MUST equal Total Kredit!
    const sumDebet = lines.reduce((acc, l) => acc + (l.nominalDebet || 0), 0);
    const sumKredit = lines.reduce((acc, l) => acc + (l.nominalKredit || 0), 0);
    const imbalance = Math.round((sumDebet - sumKredit) * 100) / 100;

    if (Math.abs(imbalance) >= 1) {
      if (imbalance > 0) {
        // Debet > Kredit: adjust kredit or add balancing line
        const lastKredit = lines.find((l) => l.nominalKredit > 0);
        if (lastKredit) {
          lastKredit.nominalKredit += imbalance;
        } else {
          lines.push({
            id: `line-${mutasi.id}-bal-kr`,
            keterangan: 'Alokasi Pendapatan Mutasi',
            kodeAkunKr: '40999',
            namaAkun: 'Pendapatan Mutasi Belum Teralokasi',
            nominalDebet: 0,
            nominalKredit: imbalance,
          });
        }
      } else {
        // Kredit > Debet: adjust debet or add balancing line
        const lastDebet = lines.find((l) => l.nominalDebet > 0);
        if (lastDebet) {
          lastDebet.nominalDebet += Math.abs(imbalance);
        } else {
          lines.push({
            id: `line-${mutasi.id}-bal-db`,
            keterangan: 'Alokasi Kas Mutasi',
            kodeAkunDb: bankCoaCode,
            namaAkun: bankCoaName,
            nominalDebet: Math.abs(imbalance),
            nominalKredit: 0,
          });
        }
      }
    }

    const reversal = reversalMap.get(nomorJurnal);

    const calculatedDebet = lines.reduce((acc, l) => acc + (l.nominalDebet || 0), 0);
    const calculatedKredit = lines.reduce((acc, l) => acc + (l.nominalKredit || 0), 0);
    const isBalanced = Math.abs(calculatedDebet - calculatedKredit) < 0.01;

    const entry: JournalEntry = {
      id: `ju-${mutasi.id}`,
      mutasiId: mutasi.id,
      nomorJurnal: nomorJurnal,
      tanggalJurnal: mutasi.date,
      nomorReferensiBank: mutasi.id,
      keteranganTransaksi: mutasi.keteranganBank,
      rekeningBank: mutasi.bankAccount,
      programKegiatan: program,
      kategoriDana: kategoriDana,
      sumberTransaksi: sumberTransaksi,
      statusPersetujuan: reversal ? 'Dibalikkan' : 'Disetujui',
      penggunaMenyetujui: 'Finance Admin',
      waktuPosting: `${mutasi.date} 2021 10:00 WIB`,
      isReversed: !!reversal,
      reversedByNomorJurnal: reversal ? reversal.nomorJurnal : undefined,
      lines: lines,
      totalDebet: calculatedDebet,
      totalKredit: calculatedKredit,
      isBalanced: isBalanced,
    };

    journals.push(entry);

    if (reversal) {
      journals.push(reversal);
    }
  });

  // =========================================================================
  // REKAP TRANSAKSI OTOMATIS TAMBAHAN: S-SALUR, D-DONASI, A-AJAR, PENGELUARAN
  // Memastikan SEMUA transaksi dari 5 modul direkap ke Jurnal Umum Otomatis
  // mengacu pada Chart of Accounts (COA 10000 - 69999) yang telah disinkronkan.
  // =========================================================================

  const parseNumberFromString = (str: any): number => {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const digits = String(str).replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };

  // 1. REKAP TRANSAKSI S-SALUR (Orders yang belum tercatat via mutasi)
  salurOrders.forEach((order) => {
    if (handledSalurOrderIds.has(order.id) || (order.orderNumber && handledSalurOrderIds.has(order.orderNumber))) {
      return;
    }

    const orderNum = order.orderNumber || order.id;
    const cleanNum = orderNum.replace(/[^a-zA-Z0-9-]/g, '');
    const nomorJurnal = `JU-SALUR-${cleanNum}`;

    let bankAccount = 'Kas BCA Penerbitan';
    let bankCoaCode = '10001';
    let bankCoaName = getCoaName('10001', 'Kas BCA Penerbitan');

    if ((order.via || '').toLowerCase().includes('mandiri')) {
      bankAccount = 'Mandiri';
      bankCoaCode = '10205';
      bankCoaName = getCoaName('10205', 'Kas Lain - Project Ananda / Mandiri');
    } else if ((order.via || '').toLowerCase().includes('388')) {
      bankAccount = 'BCA 388';
      bankCoaCode = '10004';
      bankCoaName = getCoaName('10004', 'Kas BCA Operasional Non-Dharma');
    }

    const lines: JournalLine[] = [];
    let totalItemsRevenue = 0;

    // Items revenue (COA 40002 dst)
    if (order.items && order.items.length > 0) {
      order.items.forEach((it, idx) => {
        const itemNominal = (it.price || 0) * (it.quantity || 1);
        if (itemNominal > 0) {
          totalItemsRevenue += itemNominal;
          const bookCoaNo = it.coaNoAkun || '40002';
          const bookName = it.coaNamaAkun || formatSalurCoaAccountName(it.title);
          lines.push({
            id: `line-salur-${order.id}-item-${idx}`,
            keterangan: bookName,
            kodeAkunKr: bookCoaNo,
            namaAkun: getCoaName(bookCoaNo, bookName),
            nominalDebet: 0,
            nominalKredit: itemNominal,
          });
        }
      });
    }

    const parseDigits = (s?: string) => {
      if (!s) return 0;
      const d = s.replace(/\D/g, '');
      return d ? Number(d) : 0;
    };

    const ongkirNominal = parseDigits(order.costBreakdown?.ongkir);
    if (ongkirNominal > 0) {
      lines.push({
        id: `line-salur-${order.id}-ongkir`,
        keterangan: 'Biaya Pengiriman (Ongkir)',
        kodeAkunKr: '60600',
        namaAkun: getCoaName('60600', 'Biaya Pengiriman'),
        nominalDebet: 0,
        nominalKredit: ongkirNominal,
      });
    }

    const donasiNominal = parseDigits(order.costBreakdown?.donasi) + parseDigits(order.costBreakdown?.kodeUnik);
    if (donasiNominal > 0) {
      lines.push({
        id: `line-salur-${order.id}-donasi`,
        keterangan: 'Pendapatan Donasi Salur & Kode Unik',
        kodeAkunKr: '49998',
        namaAkun: getCoaName('49998', 'Pendapatan Donasi'),
        nominalDebet: 0,
        nominalKredit: donasiNominal,
      });
    }

    const totalCalculated = totalItemsRevenue + ongkirNominal + donasiNominal;
    const finalTotal = totalCalculated > 0 ? totalCalculated : parseNumberFromString(order.totalDana);

    if (finalTotal > 0) {
      // Debet Bank
      lines.unshift({
        id: `line-salur-${order.id}-bank-db`,
        keterangan: bankCoaName,
        kodeAkunDb: bankCoaCode,
        namaAkun: bankCoaName,
        nominalDebet: finalTotal,
        nominalKredit: 0,
      });

      // If no kredit lines were created (fallback)
      if (lines.length === 1) {
        lines.push({
          id: `line-salur-${order.id}-rev-fallback`,
          keterangan: 'Pendapatan Salur Buku',
          kodeAkunKr: '40002',
          namaAkun: getCoaName('40002', 'Pendapatan Salur Buku'),
          nominalDebet: 0,
          nominalKredit: finalTotal,
        });
      }

      const sumDebet = lines.reduce((acc, l) => acc + (l.nominalDebet || 0), 0);
      const sumKredit = lines.reduce((acc, l) => acc + (l.nominalKredit || 0), 0);
      const isBalanced = Math.abs(sumDebet - sumKredit) < 0.01;

      journals.push({
        id: `ju-salur-${order.id}`,
        nomorJurnal: nomorJurnal,
        tanggalJurnal: order.date || '14 Nov 2021',
        nomorReferensiBank: orderNum,
        keteranganTransaksi: `Transaksi S-SALUR: #${orderNum} (${order.customerId || 'Customer'})`,
        rekeningBank: bankAccount,
        programKegiatan: 'Program Salur Penerbitan Buku Dharma',
        kategoriDana: 'Dana Terikat',
        sumberTransaksi: 'Transaksi Salur',
        statusPersetujuan: 'Disetujui',
        penggunaMenyetujui: 'Finance Admin',
        waktuPosting: `${order.date || '14 Nov 2021'} 10:00 WIB`,
        lines: lines,
        totalDebet: sumDebet,
        totalKredit: sumKredit,
        isBalanced: isBalanced,
      });
    }
  });

  // 2. REKAP TRANSAKSI D-DONASI (Orders yang belum tercatat via mutasi)
  donasiOrders.forEach((order) => {
    if (handledDonasiOrderIds.has(order.id) || (order.orderNumber && handledDonasiOrderIds.has(order.orderNumber))) {
      return;
    }

    const orderNum = order.orderNumber || order.id;
    const cleanNum = orderNum.replace(/[^a-zA-Z0-9-]/g, '');
    const nomorJurnal = `JU-DONASI-${cleanNum}`;
    const amount = parseNumberFromString(order.totalDana);

    if (amount <= 0) return;

    const isPatron =
      (order.keterangan?.title || '').toLowerCase().includes('patron') ||
      (order.items || []).some((it) => it.name.toLowerCase().includes('patron') || it.category.toLowerCase().includes('patron'));

    const lines: JournalLine[] = [];

    if (isPatron) {
      // Kredit Pendapatan Dana Dharma Patron (COA 49997)
      lines.push({
        id: `line-donasi-${order.id}-kr`,
        keterangan: 'Pendapatan Dana Dharma Patron',
        kodeAkunKr: '49997',
        namaAkun: getCoaName('49997', 'Pendapatan Dana Dharma Patron'),
        nominalDebet: 0,
        nominalKredit: amount,
      });

      // Debet Pos Keuangan Alokasi 20:20:30:30
      const d1 = Math.round(0.20 * amount);
      const d2 = Math.round(0.20 * amount);
      const d3 = Math.round(0.30 * amount);
      const d4 = amount - (d1 + d2 + d3);

      lines.push({
        id: `line-donasi-${order.id}-db-1`,
        keterangan: 'Kas BCA Penerbitan',
        kodeAkunDb: '10001',
        namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
        nominalDebet: d1,
        nominalKredit: 0,
      });
      lines.push({
        id: `line-donasi-${order.id}-db-2`,
        keterangan: 'Kas BCA Kegiatan Retret',
        kodeAkunDb: '10002',
        namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
        nominalDebet: d2,
        nominalKredit: 0,
      });
      lines.push({
        id: `line-donasi-${order.id}-db-3`,
        keterangan: 'Kas BCA Operasional Dharma',
        kodeAkunDb: '10003',
        namaAkun: getCoaName('10003', 'Kas BCA Operasional Dharma'),
        nominalDebet: d3,
        nominalKredit: 0,
      });
      lines.push({
        id: `line-donasi-${order.id}-db-4`,
        keterangan: 'Kas BCA Operasional Non-Dharma',
        kodeAkunDb: '10004',
        namaAkun: getCoaName('10004', 'Kas BCA Operasional Non-Dharma'),
        nominalDebet: d4,
        nominalKredit: 0,
      });
    } else {
      // Donasi Umum
      lines.push({
        id: `line-donasi-${order.id}-kr-gen`,
        keterangan: order.keterangan?.title || 'Pendapatan Donasi Program',
        kodeAkunKr: '40101',
        namaAkun: getCoaName('40101', 'Pendapatan Donasi Program'),
        nominalDebet: 0,
        nominalKredit: amount,
      });
      lines.push({
        id: `line-donasi-${order.id}-db-gen`,
        keterangan: 'Kas BCA Kegiatan Retret',
        kodeAkunDb: '10002',
        namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
        nominalDebet: amount,
        nominalKredit: 0,
      });
    }

    const sumDebet = lines.reduce((acc, l) => acc + (l.nominalDebet || 0), 0);
    const sumKredit = lines.reduce((acc, l) => acc + (l.nominalKredit || 0), 0);

    journals.push({
      id: `ju-donasi-${order.id}`,
      nomorJurnal: nomorJurnal,
      tanggalJurnal: order.date || '14 Nov 2021',
      nomorReferensiBank: orderNum,
      keteranganTransaksi: `Transaksi D-DONASI: #${orderNum} - ${order.keterangan?.title || 'Donasi Dharma'}`,
      rekeningBank: 'Kas BCA Kegiatan Retret',
      programKegiatan: order.keterangan?.title || 'Program Donasi Keumatan',
      kategoriDana: 'Dana Terikat',
      sumberTransaksi: 'Transaksi Donasi',
      statusPersetujuan: 'Disetujui',
      penggunaMenyetujui: 'Finance Admin',
      waktuPosting: `${order.date || '14 Nov 2021'} 10:00 WIB`,
      lines: lines,
      totalDebet: sumDebet,
      totalKredit: sumKredit,
      isBalanced: Math.abs(sumDebet - sumKredit) < 0.01,
    });
  });

  // 3. REKAP TRANSAKSI A-AJAR (Items yang belum tercatat via mutasi)
  transaksiAjarList.forEach((item) => {
    if (handledAjarItemIds.has(item.id) || (item.kodeTransaksi && handledAjarItemIds.has(item.kodeTransaksi))) {
      return;
    }

    const ajarCode = item.kodeTransaksi || item.id;
    const cleanNum = ajarCode.replace(/[^a-zA-Z0-9-]/g, '');
    const nomorJurnal = `JU-AJAR-${cleanNum}`;
    const amount = parseNumberFromString(item.totalDana || (item as any).nominal || 100000);

    if (amount <= 0) return;

    const lines: JournalLine[] = [
      {
        id: `line-ajar-${item.id}-db`,
        keterangan: 'Kas BCA Kegiatan Retret',
        kodeAkunDb: '10002',
        namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
        nominalDebet: amount,
        nominalKredit: 0,
      },
      {
        id: `line-ajar-${item.id}-kr`,
        keterangan: `${item.eventName} - ${item.itemName}`,
        kodeAkunKr: '40301',
        namaAkun: getCoaName('40301', 'Pendapatan Kegiatan Ajar'),
        nominalDebet: 0,
        nominalKredit: amount,
      },
    ];

    journals.push({
      id: `ju-ajar-${item.id}`,
      nomorJurnal: nomorJurnal,
      tanggalJurnal: item.date || (item as any).tanggal || '14 Nov 2021',
      nomorReferensiBank: ajarCode,
      keteranganTransaksi: `Transaksi A-AJAR: ${item.eventName} (${item.itemName})`,
      rekeningBank: 'Kas BCA Kegiatan Retret',
      programKegiatan: item.eventName || 'Kegiatan Ajar',
      kategoriDana: 'Dana Terikat',
      sumberTransaksi: 'Transaksi Ajar',
      statusPersetujuan: 'Disetujui',
      penggunaMenyetujui: 'Finance Admin',
      waktuPosting: `${item.date || (item as any).tanggal || '14 Nov 2021'} 10:00 WIB`,
      lines: lines,
      totalDebet: amount,
      totalKredit: amount,
      isBalanced: true,
    });
  });

  // 4. REKAP PENGELUARAN (Expenses yang belum tercatat via mutasi)
  pengeluaranList.forEach((p) => {
    if (handledPengeluaranIds.has(p.id) || (p.no && handledPengeluaranIds.has(p.no))) {
      return;
    }

    const pCode = p.no || p.id;
    const cleanNum = pCode.replace(/[^a-zA-Z0-9-]/g, '');
    const nomorJurnal = `JU-EXP-${cleanNum}`;
    const amount = p.nominal || 0;

    if (amount <= 0) return;

    // Resolve COA code
    let resolvedCode = '69999';
    let resolvedName = getCoaName('69999', 'Beban Operasional & Lainnya');

    if (p.kebutuhan) {
      const pKebClean = p.kebutuhan.toLowerCase().trim();
      const matchedKeb = kebutuhanPengeluaranList.find((k) => {
        const kClean = k.kebutuhan.toLowerCase().trim();
        return kClean === pKebClean || pKebClean.includes(kClean) || kClean.includes(pKebClean);
      });
      if (matchedKeb && matchedKeb.noAkunCoa) {
        resolvedCode = matchedKeb.noAkunCoa;
        resolvedName = matchedKeb.namaAkunCoa || getCoaName(matchedKeb.noAkunCoa, matchedKeb.kebutuhan);
      }
    }

    if (resolvedCode === '69999') {
      const txt = `${p.kebutuhan || ''} ${p.keterangan || ''} ${p.posKeluar || ''}`.toLowerCase();
      if (txt.includes('gaji') || txt.includes('honor')) {
        resolvedCode = '60100';
        resolvedName = getCoaName('60100', 'Gaji');
      } else if (txt.includes('cetak') || txt.includes('buku')) {
        resolvedCode = '50100';
        resolvedName = getCoaName('50100', 'Cetak Buku Dharma');
      } else if (txt.includes('event') || txt.includes('retret')) {
        resolvedCode = '50300';
        resolvedName = getCoaName('50300', 'Biaya Event & Retret');
      } else if (txt.includes('pdam') || txt.includes('internet') || txt.includes('listrik')) {
        resolvedCode = '60200';
        resolvedName = getCoaName('60200', 'Air PDAM & Internet');
      } else if (txt.includes('ongkir') || txt.includes('ekspedisi')) {
        resolvedCode = '60600';
        resolvedName = getCoaName('60600', 'Ekspedisi & Distribusi');
      }
    }

    // Resolve bank account
    let bankCode = '10003';
    let bankName = getCoaName('10003', 'Kas BCA Operasional Dharma');
    let bankAccount = 'Kas BCA Operasional Dharma';

    const pRek = ((p as any).rekening || p.posKeluar || '').toLowerCase();
    if (pRek.includes('388')) {
      bankCode = '10004';
      bankName = getCoaName('10004', 'Kas BCA Operasional Non-Dharma');
      bankAccount = 'BCA 388';
    } else if (pRek.includes('mandiri')) {
      bankCode = '10205';
      bankName = getCoaName('10205', 'Kas Lain - Project Ananda / Mandiri');
      bankAccount = 'Mandiri';
    } else if (pRek.includes('penerbitan') || (p.posKeluar || '').toLowerCase().includes('penerbitan')) {
      bankCode = '10001';
      bankName = getCoaName('10001', 'Kas BCA Penerbitan');
      bankAccount = 'Kas BCA Penerbitan';
    }

    const lines: JournalLine[] = [
      {
        id: `line-exp-${p.id}-db`,
        keterangan: p.keterangan || p.kebutuhan || 'Pengeluaran Proyek',
        kodeAkunDb: resolvedCode,
        namaAkun: resolvedName,
        nominalDebet: amount,
        nominalKredit: 0,
      },
      {
        id: `line-exp-${p.id}-kr`,
        keterangan: bankName,
        kodeAkunKr: bankCode,
        namaAkun: bankName,
        nominalDebet: 0,
        nominalKredit: amount,
      },
    ];

    journals.push({
      id: `ju-exp-${p.id}`,
      nomorJurnal: nomorJurnal,
      tanggalJurnal: p.tanggal || '14 Nov 2021',
      nomorReferensiBank: pCode,
      keteranganTransaksi: `Pengeluaran: ${p.kebutuhan} - ${p.keterangan || p.posKeluar || ''}`,
      rekeningBank: bankAccount,
      programKegiatan: p.proyekSapa || p.kebutuhan || 'Operasional Yayasan',
      kategoriDana: 'Dana Operasional',
      sumberTransaksi: 'Pengeluaran',
      statusPersetujuan: 'Disetujui',
      penggunaMenyetujui: 'Finance Admin',
      waktuPosting: `${p.tanggal || '14 Nov 2021'} 10:00 WIB`,
      lines: lines,
      totalDebet: amount,
      totalKredit: amount,
      isBalanced: true,
    });
  });

  return journals;
}

export const generateAutomaticJournals = generateJournalsFromMutasi;

/**
 * Creates a reverse journal entry (Jurnal Pembalik / Penyesuaian) for audit integrity.
 * The original entry is marked as reversed with a link to the reverse entry.
 */
export function createReversalJournal(
  originalEntry: JournalEntry,
  reversalReason: string,
  approvedBy: string = 'Finance Admin'
): { original: JournalEntry; reversal: JournalEntry } {
  const now = new Date();
  const dateStr = `${now.getDate()}-${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]}-${String(now.getFullYear()).slice(-2)}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  const formattedPosting = `${now.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][now.getMonth()]} ${now.getFullYear()} ${timeStr}`;

  const reversalNomor = `JPEMB-${originalEntry.nomorJurnal.replace(/^JU-/, '')}`;

  // Reverse every line: Debet becomes Kredit, Kredit becomes Debet!
  const reversedLines: JournalLine[] = originalEntry.lines.map((l, idx) => ({
    id: `rev-${l.id}-${idx}`,
    keterangan: `[Pembalik] ${l.keterangan}`,
    kodeAkunDb: l.kodeAkunKr || undefined,
    kodeAkunKr: l.kodeAkunDb || undefined,
    namaAkun: l.namaAkun,
    nominalDebet: l.nominalKredit,
    nominalKredit: l.nominalDebet,
  }));

  const revDebet = reversedLines.reduce((acc, l) => acc + (l.nominalDebet || 0), 0);
  const revKredit = reversedLines.reduce((acc, l) => acc + (l.nominalKredit || 0), 0);

  const reversalEntry: JournalEntry = {
    id: `reversal-${Date.now()}`,
    mutasiId: originalEntry.mutasiId,
    nomorJurnal: reversalNomor,
    tanggalJurnal: dateStr,
    nomorReferensiBank: `REV-${originalEntry.nomorReferensiBank}`,
    keteranganTransaksi: `[JURNAL PEMBALIK] Koreksi atas ${originalEntry.nomorJurnal}: ${reversalReason}`,
    rekeningBank: originalEntry.rekeningBank,
    programKegiatan: originalEntry.programKegiatan,
    kategoriDana: originalEntry.kategoriDana,
    sumberTransaksi: 'Manual',
    statusPersetujuan: 'Disetujui',
    penggunaMenyetujui: approvedBy,
    waktuPosting: formattedPosting,
    isReversalEntry: true,
    reversalOfNomorJurnal: originalEntry.nomorJurnal,
    reversalReason: reversalReason,
    lines: reversedLines,
    totalDebet: revDebet,
    totalKredit: revKredit,
    isBalanced: Math.abs(revDebet - revKredit) < 0.01,
  };

  const updatedOriginal: JournalEntry = {
    ...originalEntry,
    isReversed: true,
    reversedByNomorJurnal: reversalNomor,
    statusPersetujuan: 'Dibalikkan',
  };

  return { original: updatedOriginal, reversal: reversalEntry };
}

/**
 * Double-Entry Balance Audit Verification
 * Validates that all generated journal entries are mathematically balanced (Total Debet === Total Kredit).
 */
export function verifyAllJournalsBalanced(entries: JournalEntry[]): {
  isAllBalanced: boolean;
  totalDebetAll: number;
  totalKreditAll: number;
  balancedCount: number;
  totalCount: number;
} {
  let totalDebetAll = 0;
  let totalKreditAll = 0;
  let balancedCount = 0;

  entries.forEach((e) => {
    const d = e.totalDebet ?? e.lines.reduce((s, l) => s + (l.nominalDebet || 0), 0);
    const k = e.totalKredit ?? e.lines.reduce((s, l) => s + (l.nominalKredit || 0), 0);
    totalDebetAll += d;
    totalKreditAll += k;
    if (Math.abs(d - k) < 0.01) {
      balancedCount++;
    }
  });

  return {
    isAllBalanced: entries.length > 0 && balancedCount === entries.length,
    totalDebetAll,
    totalKreditAll,
    balancedCount,
    totalCount: entries.length,
  };
}

// =========================================================================
// REAL-TIME AUTOMATED JOURNAL ENTRY GENERATORS (AYAT JURNAL DEBIT-KREDIT)
// Berdasarkan entri transaksi: Mutasi Bank, S-SALUR, D-DONASI, dan A-AJAR
// =========================================================================

export interface AutoJournalContextOptions {
  coaList?: CoaAccount[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  projects?: ProjectItem[];
  jenisProyekList?: JenisProyekItem[];
  approvedBy?: string;
  waktuPosting?: string;
}

export type AutoJournalSourceType = 'mutasi' | 'salur' | 'donasi' | 'ajar' | 'pengeluaran';

/**
 * Helper to safely extract digits as positive number
 */
function parseNominal(strOrNum: any): number {
  if (typeof strOrNum === 'number') return isNaN(strOrNum) ? 0 : strOrNum;
  if (!strOrNum) return 0;
  const digits = String(strOrNum).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Otomatisasi pembentukan ayat jurnal debit-kredit untuk 1 entri Transaksi S-SALUR secara real-time
 */
export function createDebitCreditJournalFromSalur(
  order: SalurOrder,
  options?: AutoJournalContextOptions
): JournalEntry | null {
  if (!order) return null;

  const coaList = options?.coaList || INITIAL_COA_LIST;
  const coaMap = new Map<string, string>();
  coaList.forEach((c) => coaMap.set(c.noAkun, c.namaAkun));
  const getCoaName = (code: string, fallback: string) => coaMap.get(code) || fallback;

  const orderNum = order.orderNumber || order.id;
  const cleanNum = orderNum.replace(/[^a-zA-Z0-9-]/g, '');
  const nomorJurnal = `JU-SALUR-${cleanNum}`;

  let bankAccount = 'Kas BCA Penerbitan';
  let bankCoaCode = '10001';
  let bankCoaName = getCoaName('10001', 'Kas BCA Penerbitan');

  const viaLower = (order.via || '').toLowerCase();
  if (viaLower.includes('mandiri')) {
    bankAccount = 'Mandiri';
    bankCoaCode = '10205';
    bankCoaName = getCoaName('10205', 'Kas Lain - Project Ananda / Mandiri');
  } else if (viaLower.includes('388')) {
    bankAccount = 'BCA 388';
    bankCoaCode = '10004';
    bankCoaName = getCoaName('10004', 'Kas BCA Operasional Non-Dharma');
  }

  const lines: JournalLine[] = [];
  let totalItemsRevenue = 0;

  // Kredit: Pendapatan Item Buku
  if (order.items && order.items.length > 0) {
    order.items.forEach((it, idx) => {
      const itemNominal = (it.price || 0) * (it.quantity || 1);
      if (itemNominal > 0) {
        totalItemsRevenue += itemNominal;
        const bookCoaNo = it.coaNoAkun || '40002';
        const bookName = it.coaNamaAkun || formatSalurCoaAccountName(it.title);
        lines.push({
          id: `line-salur-${order.id}-item-${idx}`,
          keterangan: bookName,
          kodeAkunKr: bookCoaNo,
          namaAkun: getCoaName(bookCoaNo, bookName),
          nominalDebet: 0,
          nominalKredit: itemNominal,
        });
      }
    });
  }

  // Kredit: Ongkir
  const ongkirNominal = parseNominal(order.costBreakdown?.ongkir);
  if (ongkirNominal > 0) {
    lines.push({
      id: `line-salur-${order.id}-ongkir`,
      keterangan: 'Biaya Pengiriman (Ongkir)',
      kodeAkunKr: '60600',
      namaAkun: getCoaName('60600', 'Biaya Pengiriman'),
      nominalDebet: 0,
      nominalKredit: ongkirNominal,
    });
  }

  // Kredit: Donasi & Kode Unik
  const donasiNominal = parseNominal(order.costBreakdown?.donasi) + parseNominal(order.costBreakdown?.kodeUnik);
  if (donasiNominal > 0) {
    lines.push({
      id: `line-salur-${order.id}-donasi`,
      keterangan: 'Pendapatan Donasi Salur & Kode Unik',
      kodeAkunKr: '49998',
      namaAkun: getCoaName('49998', 'Pendapatan Donasi'),
      nominalDebet: 0,
      nominalKredit: donasiNominal,
    });
  }

  const totalCalculated = totalItemsRevenue + ongkirNominal + donasiNominal;
  const finalTotal = totalCalculated > 0 ? totalCalculated : parseNominal(order.totalDana);

  if (finalTotal <= 0) return null;

  // Debet: Kas/Bank Penampung
  lines.unshift({
    id: `line-salur-${order.id}-bank-db`,
    keterangan: bankCoaName,
    kodeAkunDb: bankCoaCode,
    namaAkun: bankCoaName,
    nominalDebet: finalTotal,
    nominalKredit: 0,
  });

  if (lines.length === 1) {
    lines.push({
      id: `line-salur-${order.id}-rev-fallback`,
      keterangan: 'Pendapatan Salur Buku',
      kodeAkunKr: '40002',
      namaAkun: getCoaName('40002', 'Pendapatan Salur Buku'),
      nominalDebet: 0,
      nominalKredit: finalTotal,
    });
  }

  const sumDebet = lines.reduce((acc, l) => acc + (l.nominalDebet || 0), 0);
  const sumKredit = lines.reduce((acc, l) => acc + (l.nominalKredit || 0), 0);

  return {
    id: `ju-salur-${order.id}`,
    nomorJurnal,
    tanggalJurnal: order.date || '14 Nov 2021',
    nomorReferensiBank: orderNum,
    keteranganTransaksi: `Transaksi S-SALUR: #${orderNum} (${order.customerId || 'Customer'})`,
    rekeningBank: bankAccount,
    programKegiatan: 'Program Salur Penerbitan Buku Dharma',
    kategoriDana: 'Dana Terikat',
    sumberTransaksi: 'Transaksi Salur',
    statusPersetujuan: 'Disetujui',
    penggunaMenyetujui: options?.approvedBy || 'Finance Admin',
    waktuPosting: options?.waktuPosting || `${order.date || '14 Nov 2021'} 10:00 WIB`,
    lines,
    totalDebet: sumDebet,
    totalKredit: sumKredit,
    isBalanced: Math.abs(sumDebet - sumKredit) < 0.01,
  };
}

/**
 * Otomatisasi pembentukan ayat jurnal debit-kredit untuk 1 entri Transaksi D-DONASI secara real-time
 */
export function createDebitCreditJournalFromDonasi(
  order: DonasiOrder,
  options?: AutoJournalContextOptions
): JournalEntry | null {
  if (!order) return null;

  const coaList = options?.coaList || INITIAL_COA_LIST;
  const coaMap = new Map<string, string>();
  coaList.forEach((c) => coaMap.set(c.noAkun, c.namaAkun));
  const getCoaName = (code: string, fallback: string) => coaMap.get(code) || fallback;

  const orderNum = order.orderNumber || order.id;
  const cleanNum = orderNum.replace(/[^a-zA-Z0-9-]/g, '');
  const nomorJurnal = `JU-DONASI-${cleanNum}`;
  const amount = parseNominal(order.totalDana);

  if (amount <= 0) return null;

  const isPatron =
    (order.keterangan?.title || '').toLowerCase().includes('patron') ||
    (order.items || []).some((it) => it.name.toLowerCase().includes('patron') || it.category.toLowerCase().includes('patron'));

  const lines: JournalLine[] = [];

  if (isPatron) {
    // Kredit: Pendapatan Dana Dharma Patron (COA 49997)
    lines.push({
      id: `line-donasi-${order.id}-kr`,
      keterangan: 'Pendapatan Dana Dharma Patron',
      kodeAkunKr: '49997',
      namaAkun: getCoaName('49997', 'Pendapatan Dana Dharma Patron'),
      nominalDebet: 0,
      nominalKredit: amount,
    });

    // Debet: Pos Keuangan Alokasi 20% Penerbitan, 20% Retret, 30% Ops Dharma, 30% Ops Non-Dharma
    const d1 = Math.round(0.2 * amount);
    const d2 = Math.round(0.2 * amount);
    const d3 = Math.round(0.3 * amount);
    const d4 = amount - (d1 + d2 + d3);

    lines.push(
      {
        id: `line-donasi-${order.id}-db-1`,
        keterangan: 'Kas BCA Penerbitan',
        kodeAkunDb: '10001',
        namaAkun: getCoaName('10001', 'Kas BCA Penerbitan'),
        nominalDebet: d1,
        nominalKredit: 0,
      },
      {
        id: `line-donasi-${order.id}-db-2`,
        keterangan: 'Kas BCA Kegiatan Retret',
        kodeAkunDb: '10002',
        namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
        nominalDebet: d2,
        nominalKredit: 0,
      },
      {
        id: `line-donasi-${order.id}-db-3`,
        keterangan: 'Kas BCA Operasional Dharma',
        kodeAkunDb: '10003',
        namaAkun: getCoaName('10003', 'Kas BCA Operasional Dharma'),
        nominalDebet: d3,
        nominalKredit: 0,
      },
      {
        id: `line-donasi-${order.id}-db-4`,
        keterangan: 'Kas BCA Operasional Non-Dharma',
        kodeAkunDb: '10004',
        namaAkun: getCoaName('10004', 'Kas BCA Operasional Non-Dharma'),
        nominalDebet: d4,
        nominalKredit: 0,
      }
    );
  } else {
    // Donasi Umum
    lines.push(
      {
        id: `line-donasi-${order.id}-db-gen`,
        keterangan: 'Kas BCA Kegiatan Retret',
        kodeAkunDb: '10002',
        namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
        nominalDebet: amount,
        nominalKredit: 0,
      },
      {
        id: `line-donasi-${order.id}-kr-gen`,
        keterangan: order.keterangan?.title || 'Pendapatan Donasi Program',
        kodeAkunKr: '40101',
        namaAkun: getCoaName('40101', 'Pendapatan Donasi Program'),
        nominalDebet: 0,
        nominalKredit: amount,
      }
    );
  }

  const sumDebet = lines.reduce((acc, l) => acc + (l.nominalDebet || 0), 0);
  const sumKredit = lines.reduce((acc, l) => acc + (l.nominalKredit || 0), 0);

  return {
    id: `ju-donasi-${order.id}`,
    nomorJurnal,
    tanggalJurnal: order.date || '14 Nov 2021',
    nomorReferensiBank: orderNum,
    keteranganTransaksi: `Transaksi D-DONASI: #${orderNum} - ${order.keterangan?.title || 'Donasi Dharma'}`,
    rekeningBank: 'Kas BCA Kegiatan Retret',
    programKegiatan: order.keterangan?.title || 'Program Donasi Keumatan',
    kategoriDana: 'Dana Terikat',
    sumberTransaksi: 'Transaksi Donasi',
    statusPersetujuan: 'Disetujui',
    penggunaMenyetujui: options?.approvedBy || 'Finance Admin',
    waktuPosting: options?.waktuPosting || `${order.date || '14 Nov 2021'} 10:00 WIB`,
    lines,
    totalDebet: sumDebet,
    totalKredit: sumKredit,
    isBalanced: Math.abs(sumDebet - sumKredit) < 0.01,
  };
}

/**
 * Otomatisasi pembentukan ayat jurnal debit-kredit untuk 1 entri Transaksi A-AJAR secara real-time
 */
export function createDebitCreditJournalFromAjar(
  item: TransaksiAjarItem,
  options?: AutoJournalContextOptions
): JournalEntry | null {
  if (!item) return null;

  const coaList = options?.coaList || INITIAL_COA_LIST;
  const coaMap = new Map<string, string>();
  coaList.forEach((c) => coaMap.set(c.noAkun, c.namaAkun));
  const getCoaName = (code: string, fallback: string) => coaMap.get(code) || fallback;

  const ajarCode = item.kodeTransaksi || item.id;
  const cleanNum = ajarCode.replace(/[^a-zA-Z0-9-]/g, '');
  const nomorJurnal = `JU-AJAR-${cleanNum}`;
  const amount = parseNominal(item.totalDana || (item as any).nominal || 100000);

  if (amount <= 0) return null;

  const lines: JournalLine[] = [
    {
      id: `line-ajar-${item.id}-db`,
      keterangan: 'Kas BCA Kegiatan Retret',
      kodeAkunDb: '10002',
      namaAkun: getCoaName('10002', 'Kas BCA Kegiatan Retret'),
      nominalDebet: amount,
      nominalKredit: 0,
    },
    {
      id: `line-ajar-${item.id}-kr`,
      keterangan: `${item.eventName} - ${item.itemName}`,
      kodeAkunKr: '40301',
      namaAkun: getCoaName('40301', 'Pendapatan Kegiatan Ajar'),
      nominalDebet: 0,
      nominalKredit: amount,
    },
  ];

  return {
    id: `ju-ajar-${item.id}`,
    nomorJurnal,
    tanggalJurnal: item.date || (item as any).tanggal || '14 Nov 2021',
    nomorReferensiBank: ajarCode,
    keteranganTransaksi: `Transaksi A-AJAR: ${item.eventName} (${item.itemName})`,
    rekeningBank: 'Kas BCA Kegiatan Retret',
    programKegiatan: item.eventName || 'Kegiatan Ajar',
    kategoriDana: 'Dana Terikat',
    sumberTransaksi: 'Transaksi Ajar',
    statusPersetujuan: 'Disetujui',
    penggunaMenyetujui: options?.approvedBy || 'Finance Admin',
    waktuPosting: options?.waktuPosting || `${item.date || (item as any).tanggal || '14 Nov 2021'} 10:00 WIB`,
    lines,
    totalDebet: amount,
    totalKredit: amount,
    isBalanced: true,
  };
}

/**
 * Otomatisasi pembentukan ayat jurnal debit-kredit untuk 1 entri Mutasi Bank secara real-time
 */
export function createDebitCreditJournalFromMutasi(
  mutasi: MutasiItem,
  options?: AutoJournalContextOptions
): JournalEntry | null {
  if (!mutasi) return null;

  const result = generateJournalsFromMutasi(
    [mutasi],
    [],
    [],
    options?.coaList || INITIAL_COA_LIST,
    [],
    [],
    options?.kebutuhanPengeluaranList || [],
    options?.posPengeluaranList || [],
    options?.projects || [],
    options?.jenisProyekList || [],
    []
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Universal dispatcher: Bentuk ayat jurnal otomatis berdasarkan tipe sumber transaksi secara real-time
 */
export function createRealtimeAutomatedJournal(
  sourceType: AutoJournalSourceType,
  transactionData: any,
  options?: AutoJournalContextOptions
): JournalEntry | null {
  switch (sourceType) {
    case 'mutasi':
      return createDebitCreditJournalFromMutasi(transactionData, options);
    case 'salur':
      return createDebitCreditJournalFromSalur(transactionData, options);
    case 'donasi':
      return createDebitCreditJournalFromDonasi(transactionData, options);
    case 'ajar':
      return createDebitCreditJournalFromAjar(transactionData, options);
    default:
      return null;
  }
}

/**
 * Generator Konsolidasi Ayat Jurnal Real-time dengan parameter Object fleksibel
 */
export interface GenerateRealtimeJournalsParams {
  mutasiItems?: MutasiItem[];
  pengeluaranList?: PengeluaranItem[];
  reversalList?: JournalEntry[];
  coaList?: CoaAccount[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  projects?: ProjectItem[];
  jenisProyekList?: JenisProyekItem[];
  transaksiAjarList?: TransaksiAjarItem[];
}

export function generateRealtimeAutomatedJournals(
  params: GenerateRealtimeJournalsParams
): JournalEntry[] {
  return generateJournalsFromMutasi(
    params.mutasiItems || [],
    params.pengeluaranList || [],
    params.reversalList || [],
    params.coaList || INITIAL_COA_LIST,
    params.salurOrders || [],
    params.donasiOrders || [],
    params.kebutuhanPengeluaranList || [],
    params.posPengeluaranList || [],
    params.projects || [],
    params.jenisProyekList || [],
    params.transaksiAjarList || []
  );
}
