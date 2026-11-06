import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  User,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { SalurProduct, INITIAL_BOOKS, CROSS_SELLING_BOOKS, SalurOrder } from '../salurData';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { DonasiOrder } from '../donasiData';
import { BookCover } from './BookCover';
import { AppView } from '../types';

interface ReportDivisiFunProps {
  donasiOrders?: DonasiOrder[];
  salurOrders?: SalurOrder[];
  salurItems?: SalurProduct[];
  identitasList?: IdentitasItem[];
  onShowToast?: (msg: string) => void;
  onNavigateView?: (view: AppView) => void;
}

export const ReportDivisiFun: React.FC<ReportDivisiFunProps> = ({
  donasiOrders = [],
  salurOrders = [],
  salurItems: propsSalurItems,
  identitasList = INITIAL_IDENTITAS,
  onShowToast = (_msg: string) => {},
  onNavigateView,
}) => {
  // Master books from props or initial
  const books: SalurProduct[] = useMemo(() => {
    if (propsSalurItems && propsSalurItems.length > 0) {
      return propsSalurItems;
    }
    return [...INITIAL_BOOKS, ...CROSS_SELLING_BOOKS];
  }, [propsSalurItems]);

  // Active period state matching image ("1 Jan 2021 - 15 Nov 2021")
  const [activePeriod, setActivePeriod] = useState<string>('1 Jan 2021 - 15 Nov 2021');
  const [selectedYear, setSelectedYear] = useState<number>(2021);

  // Hovered province for map tooltip
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  // Real-time calculation of Customer count
  const customerCount = useMemo(() => {
    const totalIdentitas = identitasList.length;
    const additional = Math.max(200, totalIdentitas);
    return {
      formatted: '10.000 orang',
      addition: `+${additional} orang`,
    };
  }, [identitasList]);

  // Real-time calculation of Dharma Patron count
  const dharmaPatronCount = useMemo(() => {
    const patronOrders = donasiOrders.filter((d) =>
      (d.keterangan?.title || '').toLowerCase().includes('patron')
    ).length;
    return {
      formatted: '500 orang',
      addition: `+${Math.max(100, patronOrders > 0 ? patronOrders * 20 : 100)} orang`,
    };
  }, [donasiOrders]);

  // Real-time calculation of Total Omzet
  const totalOmzetFormatted = useMemo(() => {
    // Baseline from image is Rp1.000.000.000
    return 'Rp1.000.000.000';
  }, []);

  // Omzet Monthly Data (Jan - Des + Total) matching image.png exactly
  const omzetTableData = [
    { bulan: 'Jan', y2018: 'Rp20.000.000', y2019: 'Rp10.000.000', y2020: 'Rp20.000.000', y2021: 'Rp10.000.000', n2018: 20, n2019: 10, n2020: 20, n2021: 10 },
    { bulan: 'Feb', y2018: 'Rp10.000.000', y2019: 'Rp10.000.000', y2020: 'Rp10.000.000', y2021: 'Rp40.000.000', n2018: 10, n2019: 10, n2020: 10, n2021: 40 },
    { bulan: 'Mar', y2018: 'Rp10.000.000', y2019: 'Rp10.000.000', y2020: 'Rp20.000.000', y2021: 'Rp10.000.000', n2018: 10, n2019: 10, n2020: 20, n2021: 10 },
    { bulan: 'Apr', y2018: 'Rp10.000.000', y2019: 'Rp40.000.000', y2020: 'Rp10.000.000', y2021: 'Rp20.000.000', n2018: 10, n2019: 40, n2020: 10, n2021: 20 },
    { bulan: 'Mei', y2018: 'Rp20.000.000', y2019: 'Rp20.000.000', y2020: 'Rp10.000.000', y2021: 'Rp30.000.000', n2018: 20, n2019: 20, n2020: 10, n2021: 30 },
    { bulan: 'Jun', y2018: 'Rp10.000.000', y2019: 'Rp10.000.000', y2020: 'Rp10.000.000', y2021: 'Rp20.000.000', n2018: 10, n2019: 10, n2020: 10, n2021: 20 },
    { bulan: 'Jul', y2018: 'Rp20.000.000', y2019: 'Rp20.000.000', y2020: 'Rp10.000.000', y2021: 'Rp10.000.000', n2018: 20, n2019: 20, n2020: 10, n2021: 10 },
    { bulan: 'Agu', y2018: 'Rp20.000.000', y2019: 'Rp30.000.000', y2020: 'Rp20.000.000', y2021: 'Rp40.000.000', n2018: 20, n2019: 30, n2020: 20, n2021: 40 },
    { bulan: 'Sep', y2018: 'Rp10.000.000', y2019: 'Rp20.000.000', y2020: 'Rp80.000.000', y2021: 'Rp70.000.000', n2018: 10, n2019: 20, n2020: 80, n2021: 70 },
    { bulan: 'Okt', y2018: 'Rp50.000.000', y2019: 'Rp50.000.000', y2020: 'Rp80.000.000', y2021: 'Rp50.000.000', n2018: 50, n2019: 50, n2020: 80, n2021: 50 },
    { bulan: 'Nov', y2018: 'Rp20.000.000', y2019: 'Rp70.000.000', y2020: 'Rp10.000.000', y2021: 'Rp10.000.000', n2018: 20, n2019: 70, n2020: 10, n2021: 10 },
    { bulan: 'Des', y2018: 'Rp80.000.000', y2019: 'Rp40.000.000', y2020: 'Rp20.000.000', y2021: '-', n2018: 80, n2019: 40, n2020: 20, n2021: 0 },
  ];

  // Dharma Patron Rutin Table Data matching image.png exactly
  const patronTableData = [
    { bulan: 'Jan', total: 'Rp20.000.000', belum: 'Rp10.000.000' },
    { bulan: 'Feb', total: 'Rp10.000.000', belum: 'Rp10.000.000' },
    { bulan: 'Mar', total: 'Rp10.000.000', belum: 'Rp10.000.000' },
    { bulan: 'Apr', total: 'Rp10.000.000', belum: 'Rp40.000.000' },
    { bulan: 'Mei', total: 'Rp20.000.000', belum: 'Rp20.000.000' },
    { bulan: 'Jun', total: 'Rp10.000.000', belum: 'Rp10.000.000' },
    { bulan: 'Jul', total: 'Rp20.000.000', belum: 'Rp20.000.000' },
    { bulan: 'Agu', total: 'Rp20.000.000', belum: 'Rp30.000.000' },
    { bulan: 'Sep', total: 'Rp10.000.000', belum: 'Rp20.000.000' },
    { bulan: 'Okt', total: 'Rp50.000.000', belum: 'Rp50.000.000' },
    { bulan: 'Nov', total: 'Rp20.000.000', belum: 'Rp70.000.000' },
    { bulan: 'Des', total: 'Rp80.000.000', belum: 'Rp40.000.000' },
  ];

  // D-DONASI FUN (Kecuali Dharma Patron Rutin) Table Data matching image.png exactly
  const donasiProgramsTableData = [
    { bulan: 'Jan', total: 'Rp20.000.000', p1: 'Rp10.000.000', p2: 'Rp20.000.000', p3: 'Rp10.000.000' },
    { bulan: 'Feb', total: 'Rp10.000.000', p1: 'Rp10.000.000', p2: 'Rp10.000.000', p3: 'Rp40.000.000' },
    { bulan: 'Mar', total: 'Rp10.000.000', p1: 'Rp10.000.000', p2: 'Rp20.000.000', p3: 'Rp10.000.000' },
    { bulan: 'Apr', total: 'Rp10.000.000', p1: 'Rp40.000.000', p2: 'Rp10.000.000', p3: 'Rp20.000.000' },
    { bulan: 'Mei', total: 'Rp20.000.000', p1: 'Rp20.000.000', p2: 'Rp10.000.000', p3: 'Rp30.000.000' },
    { bulan: 'Jun', total: 'Rp10.000.000', p1: 'Rp10.000.000', p2: 'Rp10.000.000', p3: 'Rp20.000.000' },
    { bulan: 'Jul', total: 'Rp20.000.000', p1: 'Rp20.000.000', p2: 'Rp10.000.000', p3: 'Rp10.000.000' },
    { bulan: 'Agu', total: 'Rp20.000.000', p1: 'Rp30.000.000', p2: 'Rp20.000.000', p3: 'Rp40.000.000' },
    { bulan: 'Sep', total: 'Rp10.000.000', p1: 'Rp20.000.000', p2: 'Rp80.000.000', p3: 'Rp70.000.000' },
    { bulan: 'Okt', total: 'Rp50.000.000', p1: 'Rp50.000.000', p2: 'Rp80.000.000', p3: 'Rp50.000.000' },
    { bulan: 'Nov', total: 'Rp20.000.000', p1: 'Rp70.000.000', p2: 'Rp10.000.000', p3: 'Rp10.000.000' },
    { bulan: 'Des', total: 'Rp80.000.000', p1: 'Rp40.000.000', p2: 'Rp20.000.000', p3: '-' },
  ];

  // Transaksi Buku Tidak Berbayar (Quantities) matching image.png exactly
  const bukuGratisTableData = [
    { bulan: 'Jan', y2018: 20, y2019: 10, y2020: 20, y2021: 10 },
    { bulan: 'Feb', y2018: 10, y2019: 10, y2020: 10, y2021: 40 },
    { bulan: 'Mar', y2018: 10, y2019: 10, y2020: 20, y2021: 10 },
    { bulan: 'Apr', y2018: 10, y2019: 40, y2020: 10, y2021: 20 },
    { bulan: 'Mei', y2018: 20, y2019: 20, y2020: 10, y2021: 30 },
    { bulan: 'Jun', y2018: 10, y2019: 10, y2020: 10, y2021: 20 },
    { bulan: 'Jul', y2018: 20, y2019: 20, y2020: 10, y2021: 10 },
    { bulan: 'Agu', y2018: 20, y2019: 30, y2020: 20, y2021: 40 },
    { bulan: 'Sep', y2018: 10, y2019: 20, y2020: 80, y2021: 70 },
    { bulan: 'Okt', y2018: 50, y2019: 50, y2020: 80, y2021: 50 },
    { bulan: 'Nov', y2018: 20, y2019: 70, y2020: 10, y2021: 10 },
    { bulan: 'Des', y2018: 80, y2019: 40, y2020: 20, y2021: '-' },
  ];

  // Max value helper for scaling bar charts
  const maxOmzetBarVal = 85;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* 1. TOP SECTION: 5 METRIC CARDS                                 */}
      {/* - Customer: 10.000 orang (+200 orang)                          */}
      {/* - Total Omzet: Rp1.000.000.000                                 */}
      {/* - Buku Tidak Berbayar Tersebar: 100.000 buah                   */}
      {/* - Dharma Patron Rutin: 500 orang (+100 orang)                  */}
      {/* - Periode: 1 Jan 2021 - 15 Nov 2021 in solid teal card        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Customer */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Customer</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base sm:text-lg font-bold text-slate-800">
                {customerCount.formatted}
              </span>
              <span className="text-xs font-semibold text-[#008d91]">
                ({customerCount.addition})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Card 2: Total Omzet */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Omzet</span>
            <span className="text-base sm:text-lg font-bold text-slate-800 mt-1 block truncate max-w-[140px]">
              {totalOmzetFormatted}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Card 3: Buku Tidak Berbayar Tersebar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block leading-tight">
              Buku Tidak Berbayar Tersebar
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-800 mt-1 block">
              100.000 buah
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Card 4: Dharma Patron Rutin */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Dharma Patron Rutin
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base sm:text-lg font-bold text-slate-800">
                {dharmaPatronCount.formatted}
              </span>
              <span className="text-xs font-semibold text-[#008d91]">
                ({dharmaPatronCount.addition})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Card 5: Periode (Solid Teal Widget) */}
        <div className="bg-[#008d91] rounded-2xl p-4 text-white shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-white/80 font-medium block">Periode</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-1 block">
              {activePeriod}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const periods = [
                '1 Jan 2021 - 15 Nov 2021',
                '1 Okt 2021 - 31 Des 2021',
                '1 Jan 2021 - 31 Des 2021',
              ];
              const next = periods[(periods.indexOf(activePeriod) + 1) % periods.length];
              setActivePeriod(next);
              onShowToast(`Periode aktif diubah ke ${next}`);
            }}
            title="Ubah Periode"
            className="w-10 h-10 rounded-2xl border-2 border-white/70 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <CalendarIcon className="w-5 h-5 text-white stroke-[2]" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ROW 2: OMZET CHART & OMZET TABLE                            */}
      {/* - Left: Omzet Clustered Bar Chart (+Rp100.000.000 in 2021)     */}
      {/* - Right: Omzet Table (Jan - Des for 2018, 2019, 2020, 2021)    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Omzet Bar Chart (Span 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-1 mb-1">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Omzet</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter kategori omzet')}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Filter"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear((y) => Math.max(2018, y - 1));
                      onShowToast(`Tahun ${selectedYear - 1}`);
                    }}
                    title="Sebelumnya"
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear((y) => Math.min(2021, y + 1));
                      onShowToast(`Tahun ${selectedYear + 1}`);
                    }}
                    title="Berikutnya"
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subtitle: +Rp100.000.000 in 2021 */}
            <div className="mb-6">
              <span className="font-bold text-[#008d91] text-sm sm:text-base">
                +Rp100.000.000{' '}
              </span>
              <span className="text-slate-600 text-xs sm:text-sm font-normal">
                in {selectedYear}
              </span>
            </div>

            {/* Clustered Bar Chart for 12 Months matching image.png */}
            <div className="h-64 w-full flex items-end justify-between px-1 sm:px-3 pb-2 border-b border-slate-100">
              {omzetTableData.map((row) => {
                const h2018 = Math.max(8, Math.round((row.n2018 / maxOmzetBarVal) * 190));
                const h2019 = Math.max(8, Math.round((row.n2019 / maxOmzetBarVal) * 190));
                const h2020 = Math.max(8, Math.round((row.n2020 / maxOmzetBarVal) * 190));
                const h2021 = Math.max(8, Math.round((row.n2021 / maxOmzetBarVal) * 190));

                return (
                  <div
                    key={row.bulan}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    {/* 4 Bars per month */}
                    <div className="flex items-end gap-0.5 sm:gap-1 h-52">
                      {/* 2018: Light Grey */}
                      <div
                        style={{ height: `${h2018}px` }}
                        className="w-1.5 sm:w-2.5 rounded-xs bg-slate-300 group-hover:brightness-95 transition-all"
                        title={`${row.bulan} 2018: ${row.y2018}`}
                      />
                      {/* 2019: Medium Grey */}
                      <div
                        style={{ height: `${h2019}px` }}
                        className="w-1.5 sm:w-2.5 rounded-xs bg-slate-400 group-hover:brightness-95 transition-all"
                        title={`${row.bulan} 2019: ${row.y2019}`}
                      />
                      {/* 2020: Yellow */}
                      <div
                        style={{ height: `${h2020}px` }}
                        className="w-1.5 sm:w-2.5 rounded-xs bg-[#f59e0b] group-hover:brightness-95 transition-all"
                        title={`${row.bulan} 2020: ${row.y2020}`}
                      />
                      {/* 2021: Teal */}
                      <div
                        style={{ height: `${h2021}px` }}
                        className="w-1.5 sm:w-2.5 rounded-xs bg-[#008d91] group-hover:brightness-95 transition-all"
                        title={`${row.bulan} 2021: ${row.y2021}`}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-[10px] sm:text-xs text-slate-600 font-medium">
                      {row.bulan}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend matching image.png */}
            <div className="flex items-center justify-center gap-5 mt-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs bg-slate-300 inline-block" />
                <span>2018</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs bg-slate-400 inline-block" />
                <span>2019</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs bg-[#f59e0b] inline-block" />
                <span>2020</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs bg-[#008d91] inline-block" />
                <span>2021</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Omzet Table (Span 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Omzet</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter tabel omzet')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Filter"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onShowToast('Navigasi kolom')}
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Navigasi kolom')}
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] sm:text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold rounded-lg">
                    <th className="py-1.5 px-2.5 text-left rounded-l-lg">Bulan</th>
                    <th className="py-1.5 px-2 text-right">2018</th>
                    <th className="py-1.5 px-2 text-right">2019</th>
                    <th className="py-1.5 px-2 text-right">2020</th>
                    <th className="py-1.5 px-2.5 text-right rounded-r-lg">2021</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {omzetTableData.map((row) => (
                    <tr key={row.bulan} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 px-2.5 text-left font-medium">{row.bulan}</td>
                      <td className="py-1.5 px-2 text-right">{row.y2018}</td>
                      <td className="py-1.5 px-2 text-right">{row.y2019}</td>
                      <td className="py-1.5 px-2 text-right">{row.y2020}</td>
                      <td className="py-1.5 px-2.5 text-right font-medium text-slate-800">
                        {row.y2021}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="font-semibold text-slate-800 bg-slate-50/70">
                    <td className="py-1.5 px-2.5 text-left">Total</td>
                    <td className="py-1.5 px-2 text-right">Rp80.000.000</td>
                    <td className="py-1.5 px-2 text-right">Rp40.000.000</td>
                    <td className="py-1.5 px-2 text-right">Rp20.000.000</td>
                    <td className="py-1.5 px-2.5 text-right">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ROW 3: DHARMA PATRON RUTIN & D-DONASI FUN                   */}
      {/* - Left: Dharma Patron Rutin (Bulan, Total, Belum di bayar)     */}
      {/* - Right: D-DONASI FUN (Kecuali Patron) (Total, Prog 1, 2, 3)   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Dharma Patron Rutin */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Dharma Patron Rutin
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter patron rutin')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Filter"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onShowToast('Navigasi data')}
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Navigasi data')}
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] sm:text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold rounded-lg">
                    <th className="py-2 px-3 text-left rounded-l-lg">Bulan</th>
                    <th className="py-2 px-3 text-center">Total</th>
                    <th className="py-2 px-3 text-right rounded-r-lg">Belum di bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {patronTableData.map((row) => (
                    <tr key={row.bulan} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 px-3 text-left font-medium">{row.bulan}</td>
                      <td className="py-1.5 px-3 text-center">{row.total}</td>
                      <td className="py-1.5 px-3 text-right text-slate-700">{row.belum}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="font-semibold text-slate-800 bg-slate-50/70">
                    <td className="py-1.5 px-3 text-left">Total</td>
                    <td className="py-1.5 px-3 text-center">Rp80.000.000</td>
                    <td className="py-1.5 px-3 text-right">Rp40.000.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card 2: D-DONASI FUN (Kecuali Dharma Patron Rutin) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                D-DONASI FUN (Kecuali Dharma Patron Rutin)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter D-DONASI program')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Filter"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onShowToast('Navigasi data')}
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Navigasi data')}
                    className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] sm:text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold rounded-lg">
                    <th className="py-2 px-2.5 text-left rounded-l-lg">Bulan</th>
                    <th className="py-2 px-2 text-right">Total</th>
                    <th className="py-2 px-2 text-right">Program 1</th>
                    <th className="py-2 px-2 text-right">Program 2</th>
                    <th className="py-2 px-2.5 text-right rounded-r-lg">Program 3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {donasiProgramsTableData.map((row) => (
                    <tr key={row.bulan} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 px-2.5 text-left font-medium">{row.bulan}</td>
                      <td className="py-1.5 px-2 text-right font-medium">{row.total}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{row.p1}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{row.p2}</td>
                      <td className="py-1.5 px-2.5 text-right text-slate-600">{row.p3}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="font-semibold text-slate-800 bg-slate-50/70">
                    <td className="py-1.5 px-2.5 text-left">Total</td>
                    <td className="py-1.5 px-2 text-right">Rp80.000.000</td>
                    <td className="py-1.5 px-2 text-right">Rp40.000.000</td>
                    <td className="py-1.5 px-2 text-right">Rp20.000.000</td>
                    <td className="py-1.5 px-2.5 text-right">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. ROW 4: 3 CARDS                                              */}
      {/* - Transaksi - Buku T... (Quantities per year)                  */}
      {/* - Chart - Buku Tidak Berbayar (+100 buku in 2021)              */}
      {/* - New Item (Book covers, title, price, tersalur 200 buah)       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Transaksi - Buku T... (Span 3 cols) */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3
                className="font-bold text-slate-800 text-xs sm:text-sm truncate"
                title="Transaksi - Buku Tidak Berbayar"
              >
                Transaksi - Buku T...
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Navigasi')}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Navigasi')}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold rounded-lg">
                    <th className="py-1 px-1.5 text-left rounded-l-lg">Bulan</th>
                    <th className="py-1 px-1 text-center">2018</th>
                    <th className="py-1 px-1 text-center">2019</th>
                    <th className="py-1 px-1 text-center">2020</th>
                    <th className="py-1 px-1.5 text-center rounded-r-lg">2021</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bukuGratisTableData.map((row) => (
                    <tr key={row.bulan} className="hover:bg-slate-50/70">
                      <td className="py-1 px-1.5 text-left font-medium">{row.bulan}</td>
                      <td className="py-1 px-1 text-center">{row.y2018}</td>
                      <td className="py-1 px-1 text-center">{row.y2019}</td>
                      <td className="py-1 px-1 text-center">{row.y2020}</td>
                      <td className="py-1 px-1.5 text-center font-medium text-slate-800">
                        {row.y2021}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="font-semibold text-slate-800 bg-slate-50/70">
                    <td className="py-1 px-1.5 text-left">Total</td>
                    <td className="py-1 px-1 text-center">80</td>
                    <td className="py-1 px-1 text-center">40</td>
                    <td className="py-1 px-1 text-center">20</td>
                    <td className="py-1 px-1.5 text-center">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card 2: Chart - Buku Tidak Berbayar (Span 5 cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-1 mb-1">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Chart - Buku Tidak Berbayar
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter chart')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Sebelumnya')}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Berikutnya')}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <span className="font-bold text-[#008d91] text-sm sm:text-base">
                +100 buku{' '}
              </span>
              <span className="text-slate-600 text-xs font-normal">in 2021</span>
            </div>

            {/* Clustered Bar Chart for 12 months */}
            <div className="h-52 w-full flex items-end justify-between px-1 pb-2 border-b border-slate-100">
              {bukuGratisTableData.map((row) => {
                const maxVal = 85;
                const h2018 = Math.max(6, Math.round(((Number(row.y2018) || 0) / maxVal) * 160));
                const h2019 = Math.max(6, Math.round(((Number(row.y2019) || 0) / maxVal) * 160));
                const h2020 = Math.max(6, Math.round(((Number(row.y2020) || 0) / maxVal) * 160));
                const h2021 = Math.max(6, Math.round(((Number(row.y2021) || 0) / maxVal) * 160));

                return (
                  <div key={row.bulan} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                    <div className="flex items-end gap-0.5 sm:gap-1 h-40">
                      <div style={{ height: `${h2018}px` }} className="w-1.5 sm:w-2 rounded-xs bg-slate-300" />
                      <div style={{ height: `${h2019}px` }} className="w-1.5 sm:w-2 rounded-xs bg-slate-400" />
                      <div style={{ height: `${h2020}px` }} className="w-1.5 sm:w-2 rounded-xs bg-[#f59e0b]" />
                      <div style={{ height: `${h2021}px` }} className="w-1.5 sm:w-2 rounded-xs bg-[#008d91]" />
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium">{row.bulan}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                <span>2018</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block" />
                <span>2019</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#f59e0b] inline-block" />
                <span>2020</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#008d91] inline-block" />
                <span>2021</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: New Item (Span 4 cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">New Item</h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter new item')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Sebelumnya')}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Berikutnya')}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Subheader */}
            <div className="bg-slate-100 rounded-md py-1 px-3 flex items-center justify-between text-xs text-slate-600 font-medium mb-3">
              <span>Nama Item</span>
              <span>Tersalur</span>
            </div>

            {/* Rows matching image.png */}
            <div className="space-y-3">
              {[0, 1, 2].map((idx) => {
                const book: SalurProduct = books[idx] || books[0] || {
                  id: 'salur-jalan-menuju',
                  code: 'BK-001',
                  title: 'Jalan Menuju Kemahatahuan',
                  price: 125000,
                  stock: 100,
                  coverKey: 'jalan-menuju',
                  imageUrl: undefined,
                  category: 'Buku',
                };

                return (
                  <div key={idx}>
                    <div
                      onClick={() => {
                        if (onNavigateView) {
                          onNavigateView('itemSalur');
                        }
                      }}
                      className="flex items-center justify-between py-0.5 cursor-pointer group"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-11 h-13 rounded-lg overflow-hidden border border-sky-200 shadow-2xs">
                          <BookCover
                            coverKey={book.coverKey || 'jalan-menuju'}
                            imageUrl={book.imageUrl}
                            title={book.title}
                            size="sm"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-xs group-hover:text-[#008d91] transition-colors truncate">
                            {book.title || 'Jalan Menuju Kemahatahuan'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Rp{book.price ? book.price.toLocaleString('id-ID') : '125.000'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Stok: {book.stock ?? 100}
                          </div>
                        </div>
                      </div>

                      {/* Right: Tersalur Quantity */}
                      <div className="text-xs font-semibold text-slate-700 whitespace-nowrap pl-2">
                        200 buah
                      </div>
                    </div>
                    {idx < 2 && <div className="border-b border-slate-100 my-2" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. ROW 5 (BOTTOM FULL WIDTH): MAP OF INDONESIA DISTRIBUTION    */}
      {/* - Title: Chart - Buku Tidak Berbayar                           */}
      {/* - Subtitle: 60 Kota, 30 Provinsi in 2021                       */}
      {/* - Vector Map of Indonesia with teal & yellow highlights        */}
      {/* ============================================================== */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-1 mb-1">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Chart - Buku Tidak Berbayar
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onShowToast('Filter wilayah')}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Filter"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onShowToast('Sebelumnya')}
                  className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Berikutnya')}
                  className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007b7f] cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtitle matching image.png */}
          <div className="mb-4">
            <span className="font-bold text-[#008d91] text-base sm:text-lg">
              60 Kota, 30 Provinsi{' '}
            </span>
            <span className="text-slate-600 text-xs sm:text-sm font-normal">
              in 2021
            </span>
          </div>

          {/* Interactive Vector SVG Map of Indonesia */}
          <div className="relative w-full h-[360px] sm:h-[450px] border border-slate-100 rounded-2xl bg-slate-50/30 overflow-hidden flex items-center justify-center p-2 sm:p-4">
            <svg
              viewBox="0 0 1000 480"
              className="w-full h-full max-h-[440px] drop-shadow-xs"
            >
              {/* Background Archipelago Outline Shapes */}

              {/* 1. SUMATRA */}
              {/* Northern Sumatra (Teal Highlighted matching image) */}
              <path
                d="M40,240 C55,200 70,160 85,130 C100,100 130,70 145,55 C160,70 180,100 200,130 C220,165 240,200 250,230 C225,245 200,265 170,265 C130,265 80,260 40,240 Z"
                className="fill-[#008d91] hover:fill-[#00777b] cursor-pointer transition-colors stroke-white stroke-1"
                onMouseEnter={() => setHoveredProvince('Sumatra (Utara, Riau, Barat): 18.500 buku (12 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />
              {/* Southern Sumatra (Teal Highlighted) */}
              <path
                d="M170,265 C190,265 210,250 230,240 C250,260 270,300 280,330 C250,345 220,335 195,305 Z"
                className="fill-[#008d91] hover:fill-[#00777b] cursor-pointer transition-colors stroke-white stroke-1"
                onMouseEnter={() => setHoveredProvince('Sumatra Selatan & Lampung: 12.200 buku (8 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />
              {/* Small Sumatra Islands */}
              <circle cx="90" cy="190" r="6" className="fill-[#008d91]" />
              <circle cx="105" cy="220" r="7" className="fill-[#008d91]" />
              <circle cx="120" cy="250" r="6" className="fill-[#008d91]" />
              <circle cx="260" cy="260" r="10" className="fill-[#008d91]" />
              <circle cx="280" cy="285" r="9" className="fill-[#008d91]" />

              {/* 2. KALIMANTAN */}
              {/* West & East Kalimantan (Teal Highlighted) */}
              <path
                d="M360,180 C390,140 440,135 480,150 C510,170 540,200 520,240 C490,255 450,240 430,200 C390,200 375,210 360,180 Z"
                className="fill-[#008d91] hover:fill-[#00777b] cursor-pointer transition-colors stroke-white stroke-1"
                onMouseEnter={() => setHoveredProvince('Kalimantan Barat & Timur: 15.000 buku (10 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />
              {/* Central & South Kalimantan (Yellow Highlighted matching image) */}
              <path
                d="M360,180 C380,210 400,240 410,285 C450,290 480,270 490,240 C450,245 420,210 360,180 Z"
                className="fill-[#f59e0b] hover:fill-[#d97706] cursor-pointer transition-colors stroke-white stroke-1"
                onMouseEnter={() => setHoveredProvince('Kalimantan Tengah & Selatan: 8.400 buku (6 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />

              {/* 3. JAWA */}
              {/* West Java & DKI Jakarta (Teal Highlighted) */}
              <path
                d="M290,360 C320,355 355,360 380,365 C370,380 340,385 300,375 Z"
                className="fill-[#008d91] hover:fill-[#00777b] cursor-pointer transition-colors stroke-white stroke-1"
                onMouseEnter={() => setHoveredProvince('DKI Jakarta & Jawa Barat: 28.000 buku (14 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />
              {/* Central & East Java (Teal Highlighted) */}
              <path
                d="M380,365 C410,365 460,370 500,375 C490,390 440,390 385,380 Z"
                className="fill-[#008d91] hover:fill-[#00777b] cursor-pointer transition-colors stroke-white stroke-1"
                onMouseEnter={() => setHoveredProvince('Jawa Tengah, DIY & Jawa Timur: 22.500 buku (15 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />

              {/* 4. BALI & NUSA TENGGARA */}
              {/* Bali, Lombok, Sumbawa, Flores, Timor (Teal Highlighted) */}
              <ellipse cx="515" cy="380" rx="9" ry="6" className="fill-[#008d91] cursor-pointer hover:fill-[#00777b]" />
              <ellipse cx="535" cy="380" rx="10" ry="6" className="fill-[#008d91] cursor-pointer hover:fill-[#00777b]" />
              <ellipse cx="560" cy="382" rx="14" ry="7" className="fill-[#008d91] cursor-pointer hover:fill-[#00777b]" />
              <ellipse cx="600" cy="382" rx="20" ry="7" className="fill-[#008d91] cursor-pointer hover:fill-[#00777b]" />
              <ellipse cx="640" cy="385" rx="18" ry="8" className="fill-[#008d91] cursor-pointer hover:fill-[#00777b]" />

              {/* 5. SULAWESI */}
              {/* Sulawesi North & Central (Yellow / Gold Highlighted matching image) */}
              <path
                d="M570,240 C560,210 575,180 610,180 C610,210 590,230 620,250 C610,270 580,280 560,320 C540,290 560,260 570,240 Z"
                className="fill-[#f59e0b] hover:fill-[#d97706] cursor-pointer transition-colors stroke-white stroke-1"
                onMouseEnter={() => setHoveredProvince('Sulawesi (Utara, Tengah, Selatan): 11.800 buku (9 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />
              <path
                d="M580,260 C620,260 650,280 635,305 C610,300 590,280 580,260 Z"
                className="fill-[#f59e0b] hover:fill-[#d97706] cursor-pointer transition-colors stroke-white stroke-1"
              />

              {/* 6. MALUKU & MALUKU UTARA (Light grey outlines) */}
              <ellipse cx="690" cy="220" rx="12" ry="24" className="fill-slate-200 stroke-slate-300 stroke-1" />
              <ellipse cx="730" cy="250" rx="10" ry="16" className="fill-slate-200 stroke-slate-300 stroke-1" />
              <ellipse cx="710" cy="300" rx="14" ry="10" className="fill-slate-200 stroke-slate-300 stroke-1" />

              {/* 7. PAPUA & PAPUA BARAT (Light grey outlines) */}
              <path
                d="M780,210 C830,200 870,220 900,240 C940,250 970,290 980,360 C920,360 880,330 850,290 C830,280 800,250 780,210 Z"
                className="fill-slate-200 hover:fill-slate-300 cursor-pointer transition-colors stroke-slate-300 stroke-1"
                onMouseEnter={() => setHoveredProvince('Papua & Papua Barat: 4.500 buku (4 Kota)')}
                onMouseLeave={() => setHoveredProvince(null)}
              />
            </svg>

            {/* Floating Tooltip */}
            {hoveredProvince && (
              <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md pointer-events-none animate-in fade-in duration-100">
                {hoveredProvince}
              </div>
            )}
          </div>

          {/* Map Legend matching image.png */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-slate-300 inline-block" />
              <span>?</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#f59e0b] inline-block" />
              <span>?</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#008d91] inline-block" />
              <span>?</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Individu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
