import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PieChart as PieIcon,
  Percent,
  Wallet,
  CalendarCheck2,
} from 'lucide-react';
import {
  PatronProportionAggregate,
  PatronProportionItem,
} from '../utils/dharmaPatronPiutangHelper';

export interface DharmaPatronProportionChartProps {
  aggregate: PatronProportionAggregate;
  isPrivacyMasked?: boolean;
  selectedFilter: 'ALL' | 'LUNAS' | 'PIUTANG' | 'DIPUTIHKAN';
  onFilterChange: (filter: 'ALL' | 'LUNAS' | 'PIUTANG' | 'DIPUTIHKAN') => void;
}

const formatRupiah = (val: number, masked?: boolean): string => {
  if (masked) return '••••••••';
  if (val === 0) return 'Rp0';
  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const formatted = new Intl.NumberFormat('id-ID').format(absVal);
  return isNeg ? `-Rp${formatted}` : `Rp${formatted}`;
};

export const DharmaPatronProportionChart: React.FC<DharmaPatronProportionChartProps> = ({
  aggregate,
  isPrivacyMasked = false,
  selectedFilter,
  onFilterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    totalExpectedNominal,
    totalPaidNominal,
    totalPiutangNominal,
    totalDiputihkanNominal,
    paidPercentage,
    piutangPercentage,
    diputihkanPercentage,
    totalPatrons,
    lunasCount,
    piutangCount,
    diputihkanCount,
    totalExpectedMonths,
    totalPaidMonths,
    totalUnpaidMonths,
  } = aggregate;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 transition-all duration-200">
      {/* Header bar */}
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-r from-teal-50/70 via-white to-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#008d91]/10 text-[#008d91] flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                Proporsi Keuangan Dharma Patron: Lunas vs Piutang
              </h3>
              <span className="text-[11px] font-semibold bg-[#008d91] text-white px-2 py-0.5 rounded-full">
                Real-time
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis proporsi pembayaran donasi lunas terhadap tunggakan piutang dari Transaksi D-DONASI
            </p>
          </div>
        </div>

        {/* Filter Quick Buttons & Accordion Toggle */}
        <div className="flex items-center flex-wrap gap-1.5 self-start md:self-auto">
          <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/70 text-xs">
            <button
              type="button"
              onClick={() => onFilterChange('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'ALL'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Semua</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                {totalPatrons}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('LUNAS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'LUNAS'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>Lunas</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  selectedFilter === 'LUNAS'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {lunasCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('PIUTANG')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'PIUTANG'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span>Piutang</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  selectedFilter === 'PIUTANG' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {piutangCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('DIPUTIHKAN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'DIPUTIHKAN'
                  ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>Diputihkan</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  selectedFilter === 'DIPUTIHKAN'
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {diputihkanCount}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Sembunyikan Ringkasan' : 'Tampilkan Ringkasan'}
            aria-label={isExpanded ? 'Sembunyikan Ringkasan' : 'Tampilkan Ringkasan'}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Key Metric 4-Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Total Target Kumulatif */}
            <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-600 text-xs mb-1">
                <span className="font-semibold text-slate-700">Target Kumulatif</span>
                <Wallet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-800 font-mono tracking-tight">
                {formatRupiah(totalExpectedNominal, isPrivacyMasked)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{totalExpectedMonths} bulan tagihan</span>
                <span className="font-medium text-slate-600">{totalPatrons} donatur</span>
              </div>
            </div>

            {/* 2. Total Lunas */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
                <span className="font-semibold text-emerald-900">Total Donasi Lunas</span>
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  <Percent className="w-3 h-3 stroke-[2.5]" />
                  <span>{paidPercentage}%</span>
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-700 font-mono tracking-tight">
                {formatRupiah(totalPaidNominal, isPrivacyMasked)}
              </div>
              <div className="text-[11px] text-emerald-600/90 mt-1 flex items-center justify-between">
                <span>{totalPaidMonths} bulan terbayar</span>
                <span className="font-semibold">{lunasCount} donatur lunas</span>
              </div>
            </div>

            {/* 3. Total Piutang (Menunggak) */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-800 text-xs mb-1">
                <span className="font-semibold text-rose-900">Total Piutang Berjalan</span>
                <div className="flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  <Percent className="w-3 h-3 stroke-[2.5]" />
                  <span>{piutangPercentage}%</span>
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-rose-600 font-mono tracking-tight">
                {formatRupiah(totalPiutangNominal, isPrivacyMasked)}
              </div>
              <div className="text-[11px] text-rose-600/90 mt-1 flex items-center justify-between">
                <span>{totalUnpaidMonths} bulan menunggak</span>
                <span className="font-semibold">{piutangCount} donatur nunggak</span>
              </div>
            </div>

            {/* 4. Total Diputihkan */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-800 text-xs mb-1">
                <span className="font-semibold text-purple-900">Total Diputihkan</span>
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  <Percent className="w-3 h-3 stroke-[2.5]" />
                  <span>{diputihkanPercentage}%</span>
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold text-purple-700 font-mono tracking-tight">
                {formatRupiah(totalDiputihkanNominal, isPrivacyMasked)}
              </div>
              <div className="text-[11px] text-purple-600/90 mt-1 flex items-center justify-between">
                <span>Pembebasan donasi</span>
                <span className="font-semibold">{diputihkanCount} donatur</span>
              </div>
            </div>
          </div>

          {/* Interactive Visual Segmented Proportion Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
            <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-[#008d91]" />
                Distribusi Rasio Keuangan Patron Rutin
              </span>
              <span className="text-slate-500 text-[11px]">
                Lunas: <b className="text-emerald-700">{paidPercentage}%</b> | Piutang:{' '}
                <b className="text-rose-600">{piutangPercentage}%</b> | Diputihkan:{' '}
                <b className="text-purple-600">{diputihkanPercentage}%</b>
              </span>
            </div>

            {/* Visual stacked bar */}
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
              {paidPercentage > 0 && (
                <div
                  style={{ width: `${paidPercentage}%` }}
                  className="h-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 relative group cursor-pointer"
                  title={`Lunas: ${paidPercentage}% (${formatRupiah(totalPaidNominal, isPrivacyMasked)})`}
                  onClick={() => onFilterChange('LUNAS')}
                />
              )}
              {piutangPercentage > 0 && (
                <div
                  style={{ width: `${piutangPercentage}%` }}
                  className="h-full bg-rose-500 hover:bg-rose-600 transition-all duration-300 relative group cursor-pointer"
                  title={`Piutang: ${piutangPercentage}% (${formatRupiah(totalPiutangNominal, isPrivacyMasked)})`}
                  onClick={() => onFilterChange('PIUTANG')}
                />
              )}
              {diputihkanPercentage > 0 && (
                <div
                  style={{ width: `${diputihkanPercentage}%` }}
                  className="h-full bg-purple-400 hover:bg-purple-500 transition-all duration-300 relative group cursor-pointer"
                  title={`Diputihkan: ${diputihkanPercentage}% (${formatRupiah(totalDiputihkanNominal, isPrivacyMasked)})`}
                  onClick={() => onFilterChange('DIPUTIHKAN')}
                />
              )}
              {paidPercentage === 0 && piutangPercentage === 0 && diputihkanPercentage === 0 && (
                <div className="w-full h-full bg-slate-300" />
              )}
            </div>

            {/* Legend indicators */}
            <div className="flex items-center flex-wrap gap-4 mt-2.5 text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => onFilterChange('LUNAS')}
                className="flex items-center gap-1.5 hover:text-emerald-800 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  Lunas: <b>{formatRupiah(totalPaidNominal, isPrivacyMasked)}</b> ({paidPercentage}%)
                </span>
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('PIUTANG')}
                className="flex items-center gap-1.5 hover:text-rose-800 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>
                  Piutang: <b>{formatRupiah(totalPiutangNominal, isPrivacyMasked)}</b> ({piutangPercentage}%)
                </span>
              </button>
              <button
                type="button"
                onClick={() => onFilterChange('DIPUTIHKAN')}
                className="flex items-center gap-1.5 hover:text-purple-800 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                <span>
                  Diputihkan: <b>{formatRupiah(totalDiputihkanNominal, isPrivacyMasked)}</b> ({diputihkanPercentage}%)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export interface PatronTableRowProgressBarProps {
  proportion: PatronProportionItem;
  isPrivacyMasked?: boolean;
}

/**
 * Compact in-row progress bar and ratio indicator for individual Dharma Patron rows
 */
export const PatronTableRowProgressBar: React.FC<PatronTableRowProgressBarProps> = ({
  proportion,
  isPrivacyMasked = false,
}) => {
  const {
    paidPercentage,
    piutangPercentage,
    diputihkanPercentage,
    isFullyPaid,
    totalPaidNominal,
    totalPiutangNominal,
    totalExpectedNominal,
    totalUnpaidMonths,
  } = proportion;

  const tooltipText = isPrivacyMasked
    ? `Lunas: ${paidPercentage}% | Piutang: ${piutangPercentage}%`
    : `Lunas: ${formatRupiah(totalPaidNominal)} (${paidPercentage}%) | Piutang: ${formatRupiah(
        totalPiutangNominal
      )} (${piutangPercentage}%) | Target: ${formatRupiah(totalExpectedNominal)}`;

  return (
    <div className="flex flex-col gap-1 min-w-[130px] max-w-[180px]" title={tooltipText}>
      {/* Visual multi-segmented bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/60 shadow-2xs">
        {paidPercentage > 0 && (
          <div
            style={{ width: `${paidPercentage}%` }}
            className="h-full bg-emerald-500 transition-all duration-200"
          />
        )}
        {piutangPercentage > 0 && (
          <div
            style={{ width: `${piutangPercentage}%` }}
            className="h-full bg-rose-500 transition-all duration-200"
          />
        )}
        {diputihkanPercentage > 0 && (
          <div
            style={{ width: `${diputihkanPercentage}%` }}
            className="h-full bg-purple-400 transition-all duration-200"
          />
        )}
        {paidPercentage === 0 && piutangPercentage === 0 && diputihkanPercentage === 0 && (
          <div className="w-full h-full bg-slate-200" />
        )}
      </div>

      {/* Text label */}
      <div className="flex items-center justify-between text-[11px] leading-tight">
        {isFullyPaid ? (
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            100% Lunas
          </span>
        ) : totalUnpaidMonths > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-rose-600">
              {piutangPercentage}% nunggak
            </span>
            <span className="text-[10px] text-slate-400">•</span>
            <span className="text-slate-500">
              {paidPercentage}% lunas
            </span>
          </div>
        ) : (
          <span className="text-slate-500 font-medium">
            {paidPercentage}% ({proportion.statusKeterangan || 'Lunas'})
          </span>
        )}
      </div>
    </div>
  );
};
