import jsPDF from 'jspdf';
import {
  MutasiItem,
  PengeluaranItem,
  ProjectItem,
} from '../types';
import { SalurOrder, SalurProduct } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { ItemDonasiEvent } from '../itemDonasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { ItemAjarEvent } from '../itemAjarData';
import {
  formatDateRangeLabel,
  formatIsoDateIndo,
  isDateInRange,
  parseFinancialDateToIso,
} from './financialDateFilter';

export type ProjectFinancialSource =
  | 'salur'
  | 'donasi'
  | 'ajar'
  | 'mutasi'
  | 'pengeluaran';

export type ProjectFinancialCategory =
  | 'pendapatan_salur'
  | 'pendapatan_donasi'
  | 'pendapatan_ajar'
  | 'pendapatan_mutasi'
  | 'biaya_program'
  | 'biaya_operasional'
  | 'biaya_mutasi';

export interface ProjectFinancialEntry {
  id: string;
  date: string;
  dateIso: string;
  monthKey: string;
  monthLabel: string;
  projectId: string;
  projectName: string;
  source: ProjectFinancialSource;
  kode: string;
  keterangan: string;
  status: string;
  flow: 'IN' | 'OUT';
  isCashRealized: boolean;
  category: ProjectFinancialCategory;
  amount: number;
}

export interface ProjectMonthlyCashflowPoint {
  monthKey: string;
  label: string;
  pemasukan: number;
  pengeluaran: number;
  netCashflow: number;
  saldoKumulatif: number;
}

export interface ProjectFinancialSummary {
  projectId: string;
  projectName: string;
  divisi: string;
  jenisProyek: string;
  status: string;
  tanggal: string;
  lokasi: string;
  isUnassignedBucket?: boolean;
  // Laba Rugi (P&L)
  pendapatanSalur: number;
  pendapatanDonasi: number;
  pendapatanAjar: number;
  pendapatanMutasi: number;
  totalPendapatan: number;
  biayaProgram: number;
  biayaOperasional: number;
  biayaMutasi: number;
  totalBiaya: number;
  labaKotorProgram: number;
  labaRugiBersih: number;
  marginPersen: number;
  // Arus Kas (Direct Cash Flow)
  arusKasMasuk: number;
  arusKasKeluar: number;
  arusKasBersih: number;
  piutangBelumBayar: number;
  transactionCount: number;
  entries: ProjectFinancialEntry[];
  monthlySeries: ProjectMonthlyCashflowPoint[];
}

export interface ProjectFinancialReportTotals {
  totalPendapatan: number;
  totalBiaya: number;
  labaRugiBersih: number;
  marginPersen: number;
  arusKasMasuk: number;
  arusKasKeluar: number;
  arusKasBersih: number;
  piutangBelumBayar: number;
  profitableProjectCount: number;
  deficitProjectCount: number;
}

export interface ProjectFinancialReportResult {
  projectSummaries: ProjectFinancialSummary[];
  unassignedSummary: ProjectFinancialSummary;
  aggregatedMonthlySeries: ProjectMonthlyCashflowPoint[];
  totals: ProjectFinancialReportTotals;
}

export interface ComputeProjectFinancialParams {
  projects: ProjectItem[];
  salurOrders: SalurOrder[];
  salurItems: SalurProduct[];
  donasiOrders: DonasiOrder[];
  itemDonasiEvents: ItemDonasiEvent[];
  transaksiAjarList: TransaksiAjarItem[];
  itemAjarEvents: ItemAjarEvent[];
  mutasiItems: MutasiItem[];
  pengeluaranList: PengeluaranItem[];
  startDate?: string;
  endDate?: string;
  includeUnassignedInTotals?: boolean;
}

const MONTH_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const UNASSIGNED_PROJECT_ID = '__non_proyek_umum__';

export function parseRupiahValue(val?: string | number | null): number {
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : 0;
  }
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9-]/g, '');
  if (!cleaned || cleaned === '-') return 0;
  const num = parseInt(cleaned, 10);
  return Number.isFinite(num) ? Math.abs(num) : 0;
}

function parseQtyPriceString(qtyPrice?: string): number {
  if (!qtyPrice) return 0;
  const xParts = qtyPrice.toLowerCase().split('x');
  if (xParts.length >= 2) {
    const qty = parseInt(xParts[0].replace(/[^0-9]/g, ''), 10) || 1;
    const price = parseInt(xParts.slice(1).join('x').replace(/[^0-9]/g, ''), 10) || 0;
    return qty * price;
  }
  return parseRupiahValue(qtyPrice);
}

function getMonthInfo(dateStr?: string): {
  dateIso: string;
  monthKey: string;
  monthLabel: string;
} {
  const iso = parseFinancialDateToIso(dateStr) || '2021-11-01';
  const parts = iso.split('-');
  const year = parts[0] || '2021';
  const monthIdx = Math.max(0, Math.min(11, (parseInt(parts[1] || '11', 10) || 11) - 1));
  const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
  const monthLabel = `${MONTH_SHORT_ID[monthIdx]} ${year}`;
  return { dateIso: iso, monthKey, monthLabel };
}

function normalizeMatchText(v?: string): string {
  return (v || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function matchProjectFromHints(
  projects: ProjectItem[],
  hints: Array<string | undefined>
): ProjectItem | null {
  const cleanHints = hints.map(normalizeMatchText).filter(Boolean);
  if (cleanHints.length === 0) return null;

  // 1. Exact ID or Exact Name match
  for (const h of cleanHints) {
    const exact = projects.find(
      (p) =>
        normalizeMatchText(p.id) === h ||
        normalizeMatchText(p.namaKegiatan) === h
    );
    if (exact) return exact;
  }

  // 2. Partial match on project name (>= 4 chars)
  for (const h of cleanHints) {
    const partial = projects.find((p) => {
      const pName = normalizeMatchText(p.namaKegiatan);
      if (pName.length < 4) return false;
      return h.includes(pName) || (h.length >= 4 && pName.includes(h));
    });
    if (partial) return partial;
  }

  // 3. Fallback match on jenisProyek (>= 5 chars)
  for (const h of cleanHints) {
    const byType = projects.find((p) => {
      const jType = normalizeMatchText(p.jenisProyek);
      if (jType.length < 5) return false;
      return h.includes(jType);
    });
    if (byType) return byType;
  }

  return null;
}

function classifyExpenseCategory(peng: PengeluaranItem): 'biaya_program' | 'biaya_operasional' {
  const text = `${peng.posKeluar || ''} ${peng.kebutuhan || ''} ${peng.jenis || ''} ${peng.keterangan || ''}`.toLowerCase();
  if (
    text.includes('program') ||
    text.includes('cetak') ||
    text.includes('buku') ||
    text.includes('event') ||
    text.includes('acara') ||
    text.includes('konsumsi') ||
    text.includes('narasumber') ||
    text.includes('publikasi') ||
    text.includes('dekorasi') ||
    text.includes('perlengkapan') ||
    text.includes('penerbitan') ||
    text.includes('retreat') ||
    text.includes('paket')
  ) {
    return 'biaya_program';
  }
  return 'biaya_operasional';
}

function buildMonthlySeriesFromEntries(
  entries: ProjectFinancialEntry[]
): ProjectMonthlyCashflowPoint[] {
  const bucketMap = new Map<
    string,
    { monthKey: string; label: string; pemasukan: number; pengeluaran: number }
  >();

  entries.forEach((entry) => {
    if (!entry.isCashRealized) return;
    const existing = bucketMap.get(entry.monthKey) || {
      monthKey: entry.monthKey,
      label: entry.monthLabel,
      pemasukan: 0,
      pengeluaran: 0,
    };
    if (entry.flow === 'IN') {
      existing.pemasukan += entry.amount;
    } else {
      existing.pengeluaran += entry.amount;
    }
    bucketMap.set(entry.monthKey, existing);
  });

  const sortedKeys = Array.from(bucketMap.keys()).sort();
  let runningBalance = 0;
  return sortedKeys.map((key) => {
    const b = bucketMap.get(key)!;
    const net = b.pemasukan - b.pengeluaran;
    runningBalance += net;
    return {
      monthKey: b.monthKey,
      label: b.label,
      pemasukan: b.pemasukan,
      pengeluaran: b.pengeluaran,
      netCashflow: net,
      saldoKumulatif: runningBalance,
    };
  });
}

function summarizeEntriesForProject(
  base: Omit<
    ProjectFinancialSummary,
    | 'pendapatanSalur'
    | 'pendapatanDonasi'
    | 'pendapatanAjar'
    | 'pendapatanMutasi'
    | 'totalPendapatan'
    | 'biayaProgram'
    | 'biayaOperasional'
    | 'biayaMutasi'
    | 'totalBiaya'
    | 'labaKotorProgram'
    | 'labaRugiBersih'
    | 'marginPersen'
    | 'arusKasMasuk'
    | 'arusKasKeluar'
    | 'arusKasBersih'
    | 'piutangBelumBayar'
    | 'transactionCount'
    | 'entries'
    | 'monthlySeries'
  >,
  entries: ProjectFinancialEntry[]
): ProjectFinancialSummary {
  let pendapatanSalur = 0;
  let pendapatanDonasi = 0;
  let pendapatanAjar = 0;
  let pendapatanMutasi = 0;
  let biayaProgram = 0;
  let biayaOperasional = 0;
  let biayaMutasi = 0;
  let arusKasMasuk = 0;
  let arusKasKeluar = 0;
  let piutangBelumBayar = 0;

  entries.forEach((e) => {
    if (e.flow === 'IN') {
      if (e.category === 'pendapatan_salur') pendapatanSalur += e.amount;
      else if (e.category === 'pendapatan_donasi') pendapatanDonasi += e.amount;
      else if (e.category === 'pendapatan_ajar') pendapatanAjar += e.amount;
      else pendapatanMutasi += e.amount;

      if (e.isCashRealized) {
        arusKasMasuk += e.amount;
      } else {
        piutangBelumBayar += e.amount;
      }
    } else {
      if (e.category === 'biaya_program') biayaProgram += e.amount;
      else if (e.category === 'biaya_operasional') biayaOperasional += e.amount;
      else biayaMutasi += e.amount;

      if (e.isCashRealized) {
        arusKasKeluar += e.amount;
      }
    }
  });

  const totalPendapatan =
    pendapatanSalur + pendapatanDonasi + pendapatanAjar + pendapatanMutasi;
  const totalBiaya = biayaProgram + biayaOperasional + biayaMutasi;
  const labaKotorProgram = totalPendapatan - biayaProgram;
  const labaRugiBersih = totalPendapatan - totalBiaya;
  const marginPersen =
    totalPendapatan > 0
      ? Number(((labaRugiBersih / totalPendapatan) * 100).toFixed(1))
      : 0;
  const arusKasBersih = arusKasMasuk - arusKasKeluar;

  const sortedEntries = [...entries].sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso)
  );

  return {
    ...base,
    pendapatanSalur,
    pendapatanDonasi,
    pendapatanAjar,
    pendapatanMutasi,
    totalPendapatan,
    biayaProgram,
    biayaOperasional,
    biayaMutasi,
    totalBiaya,
    labaKotorProgram,
    labaRugiBersih,
    marginPersen,
    arusKasMasuk,
    arusKasKeluar,
    arusKasBersih,
    piutangBelumBayar,
    transactionCount: sortedEntries.length,
    entries: sortedEntries,
    monthlySeries: buildMonthlySeriesFromEntries(sortedEntries),
  };
}

export function computeProjectFinancialReport(
  params: ComputeProjectFinancialParams
): ProjectFinancialReportResult {
  const {
    projects,
    salurOrders,
    salurItems,
    donasiOrders,
    itemDonasiEvents,
    transaksiAjarList,
    itemAjarEvents,
    mutasiItems,
    pengeluaranList,
    startDate = '',
    endDate = '',
    includeUnassignedInTotals = false,
  } = params;

  const entriesByProjectId = new Map<string, ProjectFinancialEntry[]>();
  projects.forEach((p) => {
    entriesByProjectId.set(p.id, []);
  });
  const unassignedEntries: ProjectFinancialEntry[] = [];

  const pushEntry = (project: ProjectItem | null, entry: Omit<ProjectFinancialEntry, 'projectId' | 'projectName'>) => {
    if (project) {
      const list = entriesByProjectId.get(project.id) || [];
      list.push({
        ...entry,
        projectId: project.id,
        projectName: project.namaKegiatan,
      });
      entriesByProjectId.set(project.id, list);
    } else {
      unassignedEntries.push({
        ...entry,
        projectId: UNASSIGNED_PROJECT_ID,
        projectName: 'Non-Proyek / Operasional Umum',
      });
    }
  };

  // 1. Transaksi S-SALUR
  salurOrders.forEach((order) => {
    if (!isDateInRange(order.date, startDate, endDate)) return;
    if (order.isHadiah) return; // Hadiah non-penjualan tidak dihitung pendapatan tunai

    let amount = parseRupiahValue(order.totalDana);
    if (amount <= 0) {
      const itemsSum = (order.items || []).reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );
      const extraSum =
        parseRupiahValue(order.costBreakdown?.ongkir) +
        parseRupiahValue(order.costBreakdown?.donasi) +
        parseRupiahValue(order.costBreakdown?.kodeUnik);
      amount = itemsSum + extraSum;
    }
    if (amount <= 0) return;

    const itemProjectHints: Array<string | undefined> = [
      order.proyekSapa,
      order.keterangan,
    ];
    (order.items || []).forEach((it) => {
      const prod = salurItems.find(
        (p) =>
          p.id === it.productId ||
          normalizeMatchText(p.title) === normalizeMatchText(it.title)
      );
      if (prod?.proyekSapa) itemProjectHints.push(prod.proyekSapa);
      itemProjectHints.push(it.title);
    });

    const matchedProject = matchProjectFromHints(projects, itemProjectHints);
    const isPaid =
      order.paymentStatus === 'Paid' ||
      (order.statusBadges || []).some((b) => b.toLowerCase().includes('paid')) ||
      Boolean(order.sayPaidData && order.sayPaidData.length > 0);
    const mInfo = getMonthInfo(order.date);

    pushEntry(matchedProject, {
      id: `salur-${order.id}`,
      date: order.date || '-',
      dateIso: mInfo.dateIso,
      monthKey: mInfo.monthKey,
      monthLabel: mInfo.monthLabel,
      source: 'salur',
      kode: order.orderNumber || order.id,
      keterangan: `${order.customerId || 'Customer'} · ${(order.items || []).map((i) => `${i.title} (${i.quantity})`).join(', ') || 'Transaksi S-SALUR'}`,
      status: isPaid ? 'Paid (Lunas)' : 'Belum Bayar',
      flow: 'IN',
      isCashRealized: isPaid,
      category: 'pendapatan_salur',
      amount,
    });
  });

  // 2. Transaksi D-DONASI
  donasiOrders.forEach((order) => {
    if (!isDateInRange(order.date, startDate, endDate)) return;

    let amount = parseRupiahValue(order.totalDana);
    if (amount <= 0) {
      const allItems = [...(order.items || []), ...(order.extraItems || [])];
      amount = allItems.reduce((sum, it) => sum + parseQtyPriceString(it.qtyPrice), 0);
    }
    if (amount <= 0) return;

    const hints: Array<string | undefined> = [
      order.keterangan?.title,
      order.keterangan?.subtitle,
      order.notesText,
    ];
    [...(order.items || []), ...(order.extraItems || [])].forEach((it) => {
      hints.push(it.name, it.category);
      const evt = itemDonasiEvents.find(
        (e) =>
          normalizeMatchText(it.name).includes(normalizeMatchText(e.name)) ||
          (e.children || []).some((c) =>
            normalizeMatchText(it.name).includes(normalizeMatchText(c.name))
          )
      );
      if (evt?.proyekSapa) hints.unshift(evt.proyekSapa);
      if (evt?.name) hints.push(evt.name);
    });

    const matchedProject = matchProjectFromHints(projects, hints);
    const isPaid =
      (order.statusBadges || []).some(
        (b) => b.toLowerCase().includes('paid') || b.toLowerCase().includes('lunas')
      ) || Boolean(order.sayPaidData && order.sayPaidData.length > 0);
    const mInfo = getMonthInfo(order.date);

    pushEntry(matchedProject, {
      id: `donasi-${order.id}`,
      date: order.date || '-',
      dateIso: mInfo.dateIso,
      monthKey: mInfo.monthKey,
      monthLabel: mInfo.monthLabel,
      source: 'donasi',
      kode: order.orderNumber || order.id,
      keterangan: `${order.namaDonatur?.name || order.customerId || 'Donatur'} · ${order.items?.[0]?.name || order.keterangan?.title || 'Donasi'}`,
      status: isPaid ? 'Paid (Lunas)' : 'Belum Bayar',
      flow: 'IN',
      isCashRealized: isPaid,
      category: 'pendapatan_donasi',
      amount,
    });
  });

  // 3. Transaksi A-AJAR
  transaksiAjarList.forEach((tx) => {
    if (!isDateInRange(tx.date, startDate, endDate)) return;

    let amount = parseRupiahValue(tx.totalDana);
    if (amount <= 0) {
      amount = parseQtyPriceString(tx.qtyPrice);
    }
    if (amount <= 0) return;

    const evt = itemAjarEvents.find(
      (e) =>
        normalizeMatchText(tx.eventName).includes(normalizeMatchText(e.name)) ||
        normalizeMatchText(e.name).includes(normalizeMatchText(tx.eventName))
    );
    const matchedProject = matchProjectFromHints(projects, [
      evt?.proyekSapa,
      tx.eventName,
      tx.keterangan,
      evt?.name,
    ]);
    const isPaid =
      (tx.statusBadges || []).some(
        (b) => b.toLowerCase().includes('paid') || b.toLowerCase().includes('lunas')
      ) || Boolean(tx.sayPaidData && tx.sayPaidData.length > 0);
    const mInfo = getMonthInfo(tx.date);

    pushEntry(matchedProject, {
      id: `ajar-${tx.id}`,
      date: tx.date || '-',
      dateIso: mInfo.dateIso,
      monthKey: mInfo.monthKey,
      monthLabel: mInfo.monthLabel,
      source: 'ajar',
      kode: tx.orderNumber || tx.kodeTransaksi || tx.id,
      keterangan: `${tx.customerId || 'Peserta'} · ${tx.eventName || tx.itemName}`,
      status: isPaid ? 'Paid (Lunas)' : 'Belum Bayar',
      flow: 'IN',
      isCashRealized: isPaid,
      category: 'pendapatan_ajar',
      amount,
    });
  });

  // 4. Pengeluaran Kas
  const linkedPengeluaranMutasiIds = new Set<string>();
  pengeluaranList.forEach((peng) => {
    if (peng.mutasiId) linkedPengeluaranMutasiIds.add(peng.mutasiId);
    if (!isDateInRange(peng.tanggal, startDate, endDate)) return;

    const amount = peng.nominal || 0;
    if (amount <= 0) return;

    const matchedProject = matchProjectFromHints(projects, [
      peng.proyekSapa,
      peng.rincianProyekSapa,
      peng.keterangan,
      peng.kebutuhan,
    ]);
    const mInfo = getMonthInfo(peng.tanggal);
    const expCat = classifyExpenseCategory(peng);

    pushEntry(matchedProject, {
      id: `peng-${peng.id}`,
      date: peng.tanggal || '-',
      dateIso: mInfo.dateIso,
      monthKey: mInfo.monthKey,
      monthLabel: mInfo.monthLabel,
      source: 'pengeluaran',
      kode: peng.no || peng.id,
      keterangan: `${peng.kebutuhan || peng.posKeluar} — ${peng.keterangan || peng.dikeluarkan || ''}`.trim(),
      status: peng.mutasiId ? 'Kas Terhubung Mutasi' : 'Pengeluaran Kas',
      flow: 'OUT',
      isCashRealized: true,
      category: expCat,
      amount,
    });
  });

  // 5. Mutasi Bank (hanya sisa nominal yang belum tercakup oleh transaksi/pengeluaran di atas)
  mutasiItems.forEach((mut) => {
    if (!isDateInRange(mut.date, startDate, endDate)) return;

    const totalMutAmt = mut.amount || 0;
    if (totalMutAmt <= 0) return;

    if (mut.type === 'DB' && linkedPengeluaranMutasiIds.has(mut.id)) {
      return; // sudah tercatat di Pengeluaran Kas
    }

    const linkedList = mut.linkedTransactions || [];
    const coveredByTransactions = linkedList.reduce((sum, l) => {
      if (
        l.sourceType === 'salur' ||
        l.sourceType === 'donasi' ||
        l.sourceType === 'ajar' ||
        l.sourceType === 'pengeluaran'
      ) {
        return sum + (l.nominalAkhir || 0);
      }
      return sum;
    }, 0);

    const remainingAmount = Math.max(0, totalMutAmt - coveredByTransactions);
    if (remainingAmount <= 0) return;

    const hints: Array<string | undefined> = [mut.keteranganBank, mut.catatan];
    linkedList.forEach((l) => hints.push(l.keterangan, l.kode));

    const matchedProject = matchProjectFromHints(projects, hints);
    const mInfo = getMonthInfo(mut.date);

    pushEntry(matchedProject, {
      id: `mut-${mut.id}`,
      date: mut.date || '-',
      dateIso: mInfo.dateIso,
      monthKey: mInfo.monthKey,
      monthLabel: mInfo.monthLabel,
      source: 'mutasi',
      kode: `${mut.bankAccount} (${mut.type})`,
      keterangan: mut.keteranganBank || mut.catatan || 'Mutasi Rekening Bank',
      status: mut.type === 'CR' ? 'Mutasi Kredit Langsung' : 'Mutasi Debet Langsung',
      flow: mut.type === 'CR' ? 'IN' : 'OUT',
      isCashRealized: true,
      category: mut.type === 'CR' ? 'pendapatan_mutasi' : 'biaya_mutasi',
      amount: remainingAmount,
    });
  });

  // Summarize per project
  const projectSummaries: ProjectFinancialSummary[] = projects.map((proj) =>
    summarizeEntriesForProject(
      {
        projectId: proj.id,
        projectName: proj.namaKegiatan,
        divisi: proj.divisi || '-',
        jenisProyek: proj.jenisProyek || '-',
        status: proj.status || 'Ongoing',
        tanggal: proj.tanggal || '-',
        lokasi: proj.lokasi || '-',
      },
      entriesByProjectId.get(proj.id) || []
    )
  );

  const unassignedSummary = summarizeEntriesForProject(
    {
      projectId: UNASSIGNED_PROJECT_ID,
      projectName: 'Non-Proyek / Operasional Umum',
      divisi: 'UMM',
      jenisProyek: 'Umum & Rutin',
      status: 'Aktif',
      tanggal: formatDateRangeLabel(startDate, endDate),
      lokasi: '-',
      isUnassignedBucket: true,
    },
    unassignedEntries
  );

  // Portfolio totals
  const sourceList = includeUnassignedInTotals
    ? [...projectSummaries, unassignedSummary]
    : projectSummaries;

  let totalPendapatan = 0;
  let totalBiaya = 0;
  let arusKasMasuk = 0;
  let arusKasKeluar = 0;
  let piutangBelumBayar = 0;
  let profitableProjectCount = 0;
  let deficitProjectCount = 0;
  const allPortfolioEntries: ProjectFinancialEntry[] = [];

  sourceList.forEach((s) => {
    totalPendapatan += s.totalPendapatan;
    totalBiaya += s.totalBiaya;
    arusKasMasuk += s.arusKasMasuk;
    arusKasKeluar += s.arusKasKeluar;
    piutangBelumBayar += s.piutangBelumBayar;
    if (!s.isUnassignedBucket && (s.totalPendapatan > 0 || s.totalBiaya > 0)) {
      if (s.labaRugiBersih >= 0) profitableProjectCount++;
      else deficitProjectCount++;
    }
    allPortfolioEntries.push(...s.entries);
  });

  const labaRugiBersih = totalPendapatan - totalBiaya;
  const marginPersen =
    totalPendapatan > 0
      ? Number(((labaRugiBersih / totalPendapatan) * 100).toFixed(1))
      : 0;

  return {
    projectSummaries,
    unassignedSummary,
    aggregatedMonthlySeries: buildMonthlySeriesFromEntries(allPortfolioEntries),
    totals: {
      totalPendapatan,
      totalBiaya,
      labaRugiBersih,
      marginPersen,
      arusKasMasuk,
      arusKasKeluar,
      arusKasBersih: arusKasMasuk - arusKasKeluar,
      piutangBelumBayar,
      profitableProjectCount,
      deficitProjectCount,
    },
  };
}

export function formatIdrRupiah(val: number): string {
  const abs = Math.abs(Math.round(val || 0));
  const formatted = `Rp ${abs.toLocaleString('id-ID')}`;
  return val < 0 ? `(${formatted})` : formatted;
}

export function exportProjectFinancialCsv(
  summaries: ProjectFinancialSummary[],
  periodLabel: string
): string {
  const esc = (v: unknown) => {
    const str = String(v ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'Proyek SAPA',
    'Divisi',
    'Jenis Proyek',
    'Status',
    'Periode',
    'Pendapatan S-SALUR (Rp)',
    'Pendapatan D-DONASI (Rp)',
    'Pendapatan A-AJAR (Rp)',
    'Mutasi Kredit Proyek (Rp)',
    'Total Pendapatan (Rp)',
    'Biaya Program (Rp)',
    'Biaya Operasional (Rp)',
    'Mutasi Debet Proyek (Rp)',
    'Total Biaya (Rp)',
    'Laba / Rugi Bersih (Rp)',
    'Margin (%)',
    'Arus Kas Masuk (Rp)',
    'Arus Kas Keluar (Rp)',
    'Arus Kas Bersih (Rp)',
    'Piutang Belum Lunas (Rp)',
  ];

  const rows = summaries.map((s) =>
    [
      s.projectName,
      s.divisi,
      s.jenisProyek,
      s.status,
      periodLabel,
      s.pendapatanSalur,
      s.pendapatanDonasi,
      s.pendapatanAjar,
      s.pendapatanMutasi,
      s.totalPendapatan,
      s.biayaProgram,
      s.biayaOperasional,
      s.biayaMutasi,
      s.totalBiaya,
      s.labaRugiBersih,
      s.marginPersen,
      s.arusKasMasuk,
      s.arusKasKeluar,
      s.arusKasBersih,
      s.piutangBelumBayar,
    ]
      .map(esc)
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers.map(esc).join(','), ...rows].join('\n');
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const filename = `Laporan_LabaRugi_ArusKas_Proyek_SAPA_${stamp}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

export function exportProjectFinancialPdf(
  summaries: ProjectFinancialSummary[],
  totals: ProjectFinancialReportTotals,
  periodLabel: string,
  selectedSingleProject?: ProjectFinancialSummary | null
): string {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // Header
  doc.setFillColor(5, 130, 142);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(
    selectedSingleProject
      ? `Laporan Laba Rugi & Arus Kas: ${selectedSingleProject.projectName}`
      : 'Laporan Arus Kas & Laba Rugi Proyek SAPA — YPPLN',
    margin,
    11
  );
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Periode: ${periodLabel}  |  Dicetak: ${formatIsoDateIndo(
      new Date().toISOString().split('T')[0]
    )}`,
    margin,
    18
  );

  y = 32;
  doc.setTextColor(30, 41, 59);

  if (selectedSingleProject) {
    const s = selectedSingleProject;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('I. Ringkasan Laba Rugi Proyek (Profit & Loss)', margin, y);
    y += 6;

    const pnlRows: Array<[string, string, boolean?]> = [
      ['Pendapatan Penjualan S-SALUR', formatIdrRupiah(s.pendapatanSalur)],
      ['Pendapatan Donasi D-DONASI', formatIdrRupiah(s.pendapatanDonasi)],
      ['Pendapatan Pelatihan & Event A-AJAR', formatIdrRupiah(s.pendapatanAjar)],
      ['Pendapatan Mutasi Bank Kredit Proyek', formatIdrRupiah(s.pendapatanMutasi)],
      ['Total Pendapatan Proyek', formatIdrRupiah(s.totalPendapatan), true],
      ['Beban Program & Produksi Langsung', formatIdrRupiah(-s.biayaProgram)],
      ['Beban Operasional & Administrasi', formatIdrRupiah(-s.biayaOperasional)],
      ['Beban Mutasi Bank Debet Proyek', formatIdrRupiah(-s.biayaMutasi)],
      ['Total Beban & Biaya Proyek', formatIdrRupiah(-s.totalBiaya), true],
      [
        `Laba / (Rugi) Bersih Proyek (Margin ${s.marginPersen}%)`,
        formatIdrRupiah(s.labaRugiBersih),
        true,
      ],
    ];

    doc.setFontSize(9);
    pnlRows.forEach(([label, val, bold]) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(label, margin, y);
      doc.text(val, 135, y, { align: 'right' });
      y += 5.5;
    });

    y += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('II. Ringkasan Arus Kas Proyek (Direct Cash Flow)', margin, y);
    y += 6;
    const cfRows: Array<[string, string, boolean?]> = [
      ['Arus Kas Masuk (Transaksi Lunas + Mutasi CR)', formatIdrRupiah(s.arusKasMasuk)],
      ['Arus Kas Keluar (Pengeluaran Kas + Mutasi DB)', formatIdrRupiah(-s.arusKasKeluar)],
      ['Arus Kas Bersih Proyek (Net Cash Flow)', formatIdrRupiah(s.arusKasBersih), true],
      ['Piutang Transaksi Belum Lunas', formatIdrRupiah(s.piutangBelumBayar)],
    ];
    doc.setFontSize(9);
    cfRows.forEach(([label, val, bold]) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(label, margin, y);
      doc.text(val, 135, y, { align: 'right' });
      y += 5.5;
    });
  } else {
    // Portfolio Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total Pendapatan: ${formatIdrRupiah(totals.totalPendapatan)}   |   Total Biaya: ${formatIdrRupiah(
        totals.totalBiaya
      )}   |   Laba/Rugi Bersih: ${formatIdrRupiah(
        totals.labaRugiBersih
      )} (${totals.marginPersen}%)   |   Arus Kas Bersih: ${formatIdrRupiah(totals.arusKasBersih)}`,
      margin,
      y
    );
    y += 8;

    const cols = [
      { label: 'Proyek SAPA', x: margin, align: 'left' as const },
      { label: 'Div', x: 92, align: 'left' as const },
      { label: 'Pendapatan', x: 138, align: 'right' as const },
      { label: 'Total Biaya', x: 175, align: 'right' as const },
      { label: 'Laba / Rugi', x: 214, align: 'right' as const },
      { label: 'Margin', x: 234, align: 'right' as const },
      { label: 'Arus Kas Bersih', x: 280, align: 'right' as const },
    ];

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    cols.forEach((c) => {
      doc.text(c.label, c.x, y, { align: c.align });
    });
    y += 6.5;

    doc.setFont('helvetica', 'normal');
    summaries.forEach((s) => {
      if (y > pageHeight - 16) {
        doc.addPage();
        y = 18;
      }
      const shortName =
        s.projectName.length > 40
          ? `${s.projectName.slice(0, 38)}...`
          : s.projectName;
      doc.text(shortName, cols[0].x, y);
      doc.text(s.divisi, cols[1].x, y);
      doc.text(formatIdrRupiah(s.totalPendapatan), cols[2].x, y, { align: 'right' });
      doc.text(formatIdrRupiah(s.totalBiaya), cols[3].x, y, { align: 'right' });
      doc.text(formatIdrRupiah(s.labaRugiBersih), cols[4].x, y, { align: 'right' });
      doc.text(`${s.marginPersen}%`, cols[5].x, y, { align: 'right' });
      doc.text(formatIdrRupiah(s.arusKasBersih), cols[6].x, y, { align: 'right' });
      y += 5.8;
    });
  }

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const filename = `Laporan_LabaRugi_ArusKas_Proyek_SAPA_${stamp}.pdf`;
  doc.save(filename);
  return filename;
}
