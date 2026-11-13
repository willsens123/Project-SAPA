import React, { useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ArrowUpRight,
  Landmark,
} from 'lucide-react';
import {
  MutasiItem,
  PengeluaranItem,
  ProjectItem,
  JenisProyekItem,
  AppView,
} from '../types';
import { PosKeuanganItem } from '../posKeuanganData';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import {
  CoaAccount,
  loadCoaList,
  loadReversalJournals,
  generateJournalsFromMutasi,
} from '../accountingData';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';
import { PosPengeluaranGroup } from '../posPengeluaranData';

interface HomeFinancialSummaryCardsProps {
  posKeuanganList?: PosKeuanganItem[];
  mutasiItems?: MutasiItem[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  pengeluaranList?: PengeluaranItem[];
  coaList?: CoaAccount[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  projects?: ProjectItem[];
  jenisProyekList?: JenisProyekItem[];
  onNavigateView: (view: AppView) => void;
}

const MONTH_NAMES_ID = [
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

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  januari: 0,
  january: 0,
  feb: 1,
  februari: 1,
  february: 1,
  mar: 2,
  maret: 2,
  march: 2,
  apr: 3,
  april: 3,
  mei: 4,
  may: 4,
  jun: 5,
  juni: 5,
  june: 5,
  jul: 6,
  juli: 6,
  july: 6,
  agu: 7,
  agt: 7,
  agustus: 7,
  aug: 7,
  august: 7,
  sep: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  des: 11,
  desember: 11,
  dec: 11,
  december: 11,
};

function parseTransactionMonthYear(dateStr?: string): { year: number; month: number } | null {
  if (!dateStr) return null;
  const s = dateStr.trim().toLowerCase();

  // ISO format: YYYY-MM-DD or YYYY-MM
  const isoMatch = s.match(/^(\d{4})-(\d{1,2})/);
  if (isoMatch) {
    const m = parseInt(isoMatch[2], 10) - 1;
    if (m >= 0 && m <= 11) {
      return { year: parseInt(isoMatch[1], 10), month: m };
    }
  }

  // Slash format: DD/MM/YYYY, DD/MM/YY, or D/Nov, DD/Jan/21
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length >= 2) {
      const mAlpha = parts[1].replace(/[^a-z]/g, '');
      const mAlphaIdx =
        MONTH_MAP[mAlpha] ?? MONTH_MAP[mAlpha.slice(0, 3)];
      if (mAlphaIdx !== undefined) {
        let yr = 2021;
        if (parts[2]) {
          const yNum = parseInt(parts[2].replace(/[^0-9]/g, ''), 10);
          if (!isNaN(yNum) && yNum > 0) {
            yr = yNum < 100 ? 2000 + yNum : yNum;
          }
        }
        return { year: yr, month: mAlphaIdx };
      }

      const mNum = parseInt(parts[1].replace(/[^0-9]/g, ''), 10) - 1;
      if (!isNaN(mNum) && mNum >= 0 && mNum <= 11) {
        let yr = new Date().getFullYear();
        if (parts[2]) {
          const yNum = parseInt(parts[2].replace(/[^0-9]/g, ''), 10);
          if (!isNaN(yNum) && yNum > 0) {
            yr = yNum < 100 ? 2000 + yNum : yNum;
          }
        }
        return { year: yr, month: mNum };
      }
    }
  }

  // Word format: "14 Nov 2021", "24 Nov2021", "12 November 2026"
  const yrMatch = s.match(/(?:^|\D)(20\d{2})(?:\D|$)/);
  const parsedYr = yrMatch ? parseInt(yrMatch[1], 10) : 2021;
  const wordParts = s.split(/[\s\-0-9]+/).filter(Boolean);
  for (const w of wordParts) {
    const clean = w.replace(/[^a-z]/g, '');
    if (clean.length >= 3) {
      const mIdx = MONTH_MAP[clean] ?? MONTH_MAP[clean.slice(0, 3)];
      if (mIdx !== undefined) {
        return { year: parsedYr, month: mIdx };
      }
    }
  }

  return null;
}

function parseNominal(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function formatRupiahFull(val: number, masked = false): string {
  if (masked) return 'Rp •••••••••';
  if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
  const rounded = Math.round(val);
  if (rounded < 0) {
    return `-Rp ${Math.abs(rounded).toLocaleString('id-ID')}`;
  }
  return `Rp ${rounded.toLocaleString('id-ID')}`;
}

function formatCompactRupiah(val: number, masked = false): string {
  if (masked) return '••••';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2).replace('.', ',')} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${Math.round(abs / 1_000).toLocaleString('id-ID')} Rb`;
  }
  return `${sign}Rp ${Math.round(abs).toLocaleString('id-ID')}`;
}

interface MonthlyFinancialBucket {
  key: string;
  year: number;
  month: number;
  label: string;
  pendapatan: number;
  pengeluaran: number;
  salurPendapatan: number;
  donasiPendapatan: number;
  ajarPendapatan: number;
  lainPendapatan: number;
  programPengeluaran: number;
  operasionalPengeluaran: number;
  countMasuk: number;
  countKeluar: number;
}

export const HomeFinancialSummaryCards: React.FC<HomeFinancialSummaryCardsProps> = ({
  posKeuanganList = [],
  mutasiItems = [],
  salurOrders = [],
  donasiOrders = [],
  transaksiAjarList = [],
  pengeluaranList = [],
  coaList,
  kebutuhanPengeluaranList = [],
  posPengeluaranList = [],
  projects = [],
  jenisProyekList = [],
  onNavigateView,
}) => {
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);

  // 1. Total Aset (sinkron langsung dengan COA AKTIVA + Jurnal Mutasi & Transaksi)
  const assetSummary = useMemo(() => {
    const activeCoaList = coaList && coaList.length > 0 ? coaList : loadCoaList();
    const reversals = loadReversalJournals();
    const journals = generateJournalsFromMutasi(
      mutasiItems,
      pengeluaranList,
      reversals,
      activeCoaList,
      salurOrders,
      donasiOrders,
      kebutuhanPengeluaranList,
      posPengeluaranList,
      projects,
      jenisProyekList,
      transaksiAjarList
    );

    const debetMap: Record<string, number> = {};
    const kreditMap: Record<string, number> = {};

    journals.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.kodeAkunDb) {
          debetMap[line.kodeAkunDb] = (debetMap[line.kodeAkunDb] || 0) + (line.nominalDebet || 0);
        }
        if (line.kodeAkunKr) {
          kreditMap[line.kodeAkunKr] = (kreditMap[line.kodeAkunKr] || 0) + (line.nominalKredit || 0);
        }
      });
    });

    let totalAktiva = 0;
    let totalKasBank = 0;
    let aktivaAccountCount = 0;

    activeCoaList.forEach((acc) => {
      if (acc.isHeader || acc.kelompok !== 'AKTIVA') return;
      aktivaAccountCount += 1;
      const addDebet = debetMap[acc.noAkun] || 0;
      const addKredit = kreditMap[acc.noAkun] || 0;
      const balance =
        acc.pos === 'D'
          ? (acc.saldoAwalDebet || 0) + addDebet - addKredit
          : (acc.saldoAwalKredit || 0) + addKredit - addDebet;

      totalAktiva += balance;
      if (acc.noAkun.startsWith('100') || acc.noAkun.startsWith('101') || acc.noAkun.startsWith('103')) {
        totalKasBank += balance;
      }
    });

    const totalSaldoPos = posKeuanganList.reduce((sum, p) => sum + (p.saldo || 0), 0);

    return {
      totalAset: totalAktiva,
      totalKasBank,
      totalSaldoPos,
      aktivaAccountCount,
      posCount: posKeuanganList.length,
    };
  }, [
    coaList,
    mutasiItems,
    pengeluaranList,
    salurOrders,
    donasiOrders,
    kebutuhanPengeluaranList,
    posPengeluaranList,
    projects,
    jenisProyekList,
    transaksiAjarList,
    posKeuanganList,
  ]);

  // 2. Agregasi Pendapatan & Pengeluaran per Bulan dari semua sumber transaksi (tanpa double-counting)
  const { monthlyBuckets, defaultSelectedKey, isShowingExactCurrentMonth } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const bucketMap: Record<string, MonthlyFinancialBucket> = {};

    const getBucket = (yr: number, m: number): MonthlyFinancialBucket => {
      const key = `${yr}-${String(m + 1).padStart(2, '0')}`;
      if (!bucketMap[key]) {
        bucketMap[key] = {
          key,
          year: yr,
          month: m,
          label: `${MONTH_NAMES_ID[m]} ${yr}`,
          pendapatan: 0,
          pengeluaran: 0,
          salurPendapatan: 0,
          donasiPendapatan: 0,
          ajarPendapatan: 0,
          lainPendapatan: 0,
          programPengeluaran: 0,
          operasionalPengeluaran: 0,
          countMasuk: 0,
          countKeluar: 0,
        };
      }
      return bucketMap[key];
    };

    const handledSalurIds = new Set<string>();
    const handledDonasiIds = new Set<string>();
    const handledAjarIds = new Set<string>();
    const handledPengeluaranIds = new Set<string>();
    const coveredDbMutasiIds = new Set<string>();

    // A. Mutasi Bank (Sumber Arus Kas Utama)
    mutasiItems.forEach((mItem) => {
      const parsed = parseTransactionMonthYear(mItem.date);
      const yr = parsed?.year ?? 2021;
      const m = parsed?.month ?? 10;
      const bucket = getBucket(yr, m);
      const amt = mItem.amount || 0;

      if (mItem.type === 'CR') {
        const links = (mItem.linkedTransactions || []).filter(
          (l) => l.dbCr === 'CR' || l.nominalAkhir > 0
        );
        const feeLinks = (mItem.linkedTransactions || []).filter(
          (l) => l.dbCr === 'DB' || l.nominalAkhir < 0
        );

        bucket.pendapatan += amt;
        bucket.countMasuk += 1;

        if (links.length > 0) {
          links.forEach((l) => {
            if (l.sourceType === 'salur') {
              if (l.sourceId) handledSalurIds.add(l.sourceId);
              if (l.orderId) handledSalurIds.add(l.orderId);
              if (l.kode) handledSalurIds.add(l.kode);
            } else if (l.sourceType === 'donasi') {
              if (l.sourceId) handledDonasiIds.add(l.sourceId);
              if (l.orderId) handledDonasiIds.add(l.orderId);
              if (l.kode) handledDonasiIds.add(l.kode);
            } else if (l.sourceType === 'ajar') {
              if (l.sourceId) handledAjarIds.add(l.sourceId);
              if (l.orderId) handledAjarIds.add(l.orderId);
              if (l.kode) handledAjarIds.add(l.kode);
            }
          });
        }

        const ket = (mItem.keteranganBank || '').toLowerCase();
        const hasSalurLink = links.some((l) => l.sourceType === 'salur');
        const hasDonasiLink = links.some((l) => l.sourceType === 'donasi');
        const hasAjarLink = links.some((l) => l.sourceType === 'ajar');

        if (hasSalurLink || ket.includes('salur') || ket.includes('buku') || ket.includes('jalan menuju')) {
          bucket.salurPendapatan += amt;
        } else if (hasDonasiLink || ket.includes('donasi') || ket.includes('patron') || ket.includes('dharma')) {
          bucket.donasiPendapatan += amt;
        } else if (hasAjarLink || ket.includes('ajar') || ket.includes('retret') || ket.includes('kursus')) {
          bucket.ajarPendapatan += amt;
        } else {
          bucket.lainPendapatan += amt;
        }

        feeLinks.forEach((fl) => {
          const feeAmt = Math.abs(fl.nominalAkhir || 0);
          if (feeAmt > 0) {
            bucket.pengeluaran += feeAmt;
            bucket.operasionalPengeluaran += feeAmt;
            bucket.countKeluar += 1;
          }
        });
      } else if (mItem.type === 'DB') {
        coveredDbMutasiIds.add(mItem.id);
        bucket.pengeluaran += amt;
        bucket.countKeluar += 1;

        (mItem.linkedTransactions || []).forEach((l) => {
          if (l.sourceId) handledPengeluaranIds.add(l.sourceId);
          if (l.kode) handledPengeluaranIds.add(l.kode);
        });

        const ket = (mItem.keteranganBank || '').toLowerCase();
        if (
          ket.includes('penerbitan') ||
          ket.includes('cetak') ||
          ket.includes('event') ||
          ket.includes('royalti') ||
          ket.includes('retret')
        ) {
          bucket.programPengeluaran += amt;
        } else {
          bucket.operasionalPengeluaran += amt;
        }
      }
    });

    // B. Pengeluaran yang belum tercakup Mutasi DB
    pengeluaranList.forEach((peng) => {
      if (peng.mutasiId && coveredDbMutasiIds.has(peng.mutasiId)) return;
      if (handledPengeluaranIds.has(peng.id) || (peng.no && handledPengeluaranIds.has(peng.no))) return;

      const parsed = parseTransactionMonthYear(peng.tanggal);
      const yr = parsed?.year ?? currentYear;
      const m = parsed?.month ?? currentMonth;
      const bucket = getBucket(yr, m);
      const amt = peng.nominal || 0;
      if (amt <= 0) return;

      bucket.pengeluaran += amt;
      bucket.countKeluar += 1;

      const pos = (peng.posKeluar || '').toLowerCase();
      const keb = (peng.kebutuhan || '').toLowerCase();
      if (
        pos.includes('program') ||
        pos.includes('penerbitan') ||
        pos.includes('retret') ||
        keb.includes('cetak') ||
        keb.includes('buku')
      ) {
        bucket.programPengeluaran += amt;
      } else {
        bucket.operasionalPengeluaran += amt;
      }
    });

    // C. S-SALUR Orders yang belum tercatat di Mutasi CR
    salurOrders.forEach((so) => {
      const isHandled =
        handledSalurIds.has(so.id) ||
        (so.orderNumber && handledSalurIds.has(so.orderNumber));
      if (isHandled) return;

      const parsed = parseTransactionMonthYear(so.date);
      const yr = parsed?.year ?? currentYear;
      const m = parsed?.month ?? currentMonth;
      const bucket = getBucket(yr, m);

      const itemsSum = (so.items || []).reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );
      const total = itemsSum > 0 ? itemsSum : parseNominal(so.totalDana);
      if (total <= 0) return;

      bucket.pendapatan += total;
      bucket.salurPendapatan += total;
      bucket.countMasuk += 1;
    });

    // D. D-DONASI Orders yang belum tercatat di Mutasi CR
    donasiOrders.forEach((d) => {
      const isHandled =
        handledDonasiIds.has(d.id) ||
        (d.orderNumber && handledDonasiIds.has(d.orderNumber));
      if (isHandled) return;

      const parsed = parseTransactionMonthYear(d.date);
      const yr = parsed?.year ?? currentYear;
      const m = parsed?.month ?? currentMonth;
      const bucket = getBucket(yr, m);

      const total = parseNominal(d.totalDana);
      if (total <= 0) return;

      bucket.pendapatan += total;
      bucket.donasiPendapatan += total;
      bucket.countMasuk += 1;
    });

    // E. A-AJAR Transactions yang belum tercatat di Mutasi CR
    transaksiAjarList.forEach((aj) => {
      const isHandled =
        handledAjarIds.has(aj.id) ||
        (aj.orderNumber && handledAjarIds.has(aj.orderNumber));
      if (isHandled) return;

      const parsed = parseTransactionMonthYear(aj.date);
      const yr = parsed?.year ?? currentYear;
      const m = parsed?.month ?? currentMonth;
      const bucket = getBucket(yr, m);

      const total = parseNominal(aj.totalDana);
      if (total <= 0) return;

      bucket.pendapatan += total;
      bucket.ajarPendapatan += total;
      bucket.countMasuk += 1;
    });

    const sortedBuckets = Object.values(bucketMap).sort((a, b) =>
      b.key.localeCompare(a.key)
    );

    const exactCurrent = bucketMap[currentMonthKey];
    const hasCurrentMonthActivity =
      !!exactCurrent && (exactCurrent.pendapatan > 0 || exactCurrent.pengeluaran > 0);

    // Pilih bulan kalender saat ini jika ada transaksi; jika belum ada transaksi pada bulan kalender berjalan,
    // gunakan bulan terbaru yang memiliki data (prioritaskan bulan kalender yang sama pada dataset jika ada).
    const sameMonthFallback = sortedBuckets.find(
      (b) => b.month === currentMonth && (b.pendapatan > 0 || b.pengeluaran > 0)
    );
    const latestActiveBucket = sortedBuckets.find(
      (b) => b.pendapatan > 0 || b.pengeluaran > 0
    );

    const resolvedDefaultKey = hasCurrentMonthActivity
      ? currentMonthKey
      : sameMonthFallback?.key || latestActiveBucket?.key || currentMonthKey;

    // Pastikan bulan berjalan selalu ada di daftar opsi jika belum ada transaksi
    if (!bucketMap[currentMonthKey]) {
      sortedBuckets.unshift({
        key: currentMonthKey,
        year: currentYear,
        month: currentMonth,
        label: `${MONTH_NAMES_ID[currentMonth]} ${currentYear}`,
        pendapatan: 0,
        pengeluaran: 0,
        salurPendapatan: 0,
        donasiPendapatan: 0,
        ajarPendapatan: 0,
        lainPendapatan: 0,
        programPengeluaran: 0,
        operasionalPengeluaran: 0,
        countMasuk: 0,
        countKeluar: 0,
      });
    }

    return {
      monthlyBuckets: sortedBuckets,
      defaultSelectedKey: resolvedDefaultKey,
      isShowingExactCurrentMonth: hasCurrentMonthActivity,
    };
  }, [mutasiItems, pengeluaranList, salurOrders, donasiOrders, transaksiAjarList]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const activeMonthKey = selectedMonthKey || defaultSelectedKey;

  const activeBucket = useMemo(() => {
    return (
      monthlyBuckets.find((b) => b.key === activeMonthKey) ||
      monthlyBuckets[0] || {
        key: activeMonthKey,
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        label: `${MONTH_NAMES_ID[new Date().getMonth()]} ${new Date().getFullYear()}`,
        pendapatan: 0,
        pengeluaran: 0,
        salurPendapatan: 0,
        donasiPendapatan: 0,
        ajarPendapatan: 0,
        lainPendapatan: 0,
        programPengeluaran: 0,
        operasionalPengeluaran: 0,
        countMasuk: 0,
        countKeluar: 0,
      }
    );
  }, [monthlyBuckets, activeMonthKey]);

  const netCashflow = activeBucket.pendapatan - activeBucket.pengeluaran;

  return (
    <section aria-label="Ringkasan Keuangan" className="space-y-3">
      {/* Section Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            Ringkasan Keuangan Yayasan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periode aktif: <span className="font-semibold text-slate-700">{activeBucket.label}</span>
            {!isShowingExactCurrentMonth && activeBucket.key === defaultSelectedKey && (
              <>
                {' '}
                <span aria-hidden="true">·</span> Data transaksi terkini
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            id="home-financial-month-select"
            aria-label="Pilih periode bulan ringkasan keuangan"
            value={activeBucket.key}
            onChange={(e) => setSelectedMonthKey(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#008d91] cursor-pointer shadow-2xs"
          >
            {monthlyBuckets.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsPrivacyMasked((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            title={isPrivacyMasked ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
          >
            {isPrivacyMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPrivacyMasked ? 'Tampilkan' : 'Samarkan'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView('laporanKeuangan')}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#008d91] hover:bg-[#00777a] text-white rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
          >
            <span>Laporan Keuangan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Aset */}
        <div
          onClick={() => onNavigateView('laporanKeuangan')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigateView('laporanKeuangan');
            }
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#008d91]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Total Aset Yayasan
              </span>
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight mt-1 tabular-nums">
                {formatRupiahFull(assetSummary.totalAset, isPrivacyMasked)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-500">
            <span className="tabular-nums">
              Kas &amp; Deposito: <strong className="text-slate-700">{formatCompactRupiah(assetSummary.totalKasBank, isPrivacyMasked)}</strong>
            </span>
            <span className="text-slate-400">
              {assetSummary.aktivaAccountCount} akun aktiva · {assetSummary.posCount} pos
            </span>
          </div>
        </div>

        {/* Card 2: Total Pendapatan Bulan Ini */}
        <div
          onClick={() => onNavigateView('mutasi')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigateView('mutasi');
            }
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Total Pendapatan ({activeBucket.label})
              </span>
              <div className="text-2xl sm:text-[26px] font-extrabold text-emerald-700 tracking-tight mt-1 tabular-nums">
                {formatRupiahFull(activeBucket.pendapatan, isPrivacyMasked)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-500">
            <span className="tabular-nums truncate">
              Salur <strong className="text-slate-700">{formatCompactRupiah(activeBucket.salurPendapatan, isPrivacyMasked)}</strong>
              {' · '}
              Donasi <strong className="text-slate-700">{formatCompactRupiah(activeBucket.donasiPendapatan, isPrivacyMasked)}</strong>
              {' · '}
              Ajar <strong className="text-slate-700">{formatCompactRupiah(activeBucket.ajarPendapatan, isPrivacyMasked)}</strong>
            </span>
            <span className="text-emerald-700 font-semibold shrink-0 tabular-nums">
              {activeBucket.countMasuk} masuk
            </span>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran Bulan Ini */}
        <div
          onClick={() => onNavigateView('pengeluaran')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigateView('pengeluaran');
            }
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Total Pengeluaran ({activeBucket.label})
              </span>
              <div className="text-2xl sm:text-[26px] font-extrabold text-rose-700 tracking-tight mt-1 tabular-nums">
                {formatRupiahFull(activeBucket.pengeluaran, isPrivacyMasked)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-slate-500">
            <span className="tabular-nums truncate">
              Program <strong className="text-slate-700">{formatCompactRupiah(activeBucket.programPengeluaran, isPrivacyMasked)}</strong>
              {' · '}
              Ops <strong className="text-slate-700">{formatCompactRupiah(activeBucket.operasionalPengeluaran, isPrivacyMasked)}</strong>
            </span>
            <span
              className={`font-semibold shrink-0 tabular-nums flex items-center gap-1 ${
                netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              <Wallet className="w-3 h-3" />
              <span>
                Net {netCashflow >= 0 ? '+' : ''}
                {formatCompactRupiah(netCashflow, isPrivacyMasked)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
