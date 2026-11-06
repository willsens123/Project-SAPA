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
import { IndonesiaMapSvg } from './IndonesiaMapSvg';
import { AppView } from '../types';

interface ReportDivisiMadProps {
  salurOrders?: SalurOrder[];
  salurItems?: SalurProduct[];
  identitasList?: IdentitasItem[];
  donasiOrders?: DonasiOrder[];
  onShowToast?: (msg: string) => void;
  onNavigateView?: (view: AppView) => void;
}

export const ReportDivisiMad: React.FC<ReportDivisiMadProps> = ({
  salurOrders = [],
  salurItems: propsSalurItems,
  identitasList = INITIAL_IDENTITAS,
  donasiOrders = [],
  onShowToast = (_msg: string) => {},
  onNavigateView,
}) => {
  // Master books from props or initial data
  const books: SalurProduct[] = useMemo(() => {
    if (propsSalurItems && propsSalurItems.length > 0) {
      return propsSalurItems;
    }
    return [...INITIAL_BOOKS, ...CROSS_SELLING_BOOKS];
  }, [propsSalurItems]);

  // Active period state matching image ("1 Jan 2021 - 15 Nov 2021")
  const [activePeriod, setActivePeriod] = useState<string>('1 Jan 2021 - 15 Nov 2021');
  const [selectedYear, setSelectedYear] = useState<number>(2021);
  const [chartYear, setChartYear] = useState<number>(2021);

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

  // Real-time calculation of Total Omzet
  const totalOmzetFormatted = useMemo(() => {
    const salurTotal = salurOrders.reduce((acc, order) => {
      const itemsTotal = (order.items || []).reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );
      return acc + (order.total || itemsTotal || 0);
    }, 0);

    if (salurTotal > 0) {
      return `Rp${(1000000000 + salurTotal).toLocaleString('id-ID')}`;
    }
    return 'Rp1.000.000.000';
  }, [salurOrders]);

  // Real-time calculation of Buku Berbayar Tersebar
  const bukuBerbayarTersebarCount = useMemo(() => {
    const totalQty = salurOrders.reduce((acc, ord) => {
      const sumItems = (ord.items || []).reduce((s, it) => {
        if ((it.price || 0) > 0) {
          return s + (it.quantity || 1);
        }
        return s;
      }, 0);
      return acc + sumItems;
    }, 0);

    const base = 100000;
    const total = base + totalQty;
    return `${total.toLocaleString('id-ID')} buah`;
  }, [salurOrders]);

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

  // Omzet Monthly Data (Jan - Des + Total) matching image exactly
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

  // Dharma Patron Rutin Table Data matching image exactly
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

  // S-SALUR MAD (Kecuali Dharma Patron Rutin) Table Data matching image exactly
  const salurProgramsTableData = [
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

  // Transaksi Buku Berbayar (Quantities) matching image exactly
  const bukuBerbayarTableData = [
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
      {/* - Buku Berbayar Tersebar: 100.000 buah                         */}
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

        {/* Card 3: Buku Berbayar Tersebar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block leading-tight">
              Buku Berbayar Tersebar
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-800 mt-1 block">
              {bukuBerbayarTersebarCount}
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

            {/* Clustered Bar Chart for 12 Months matching image */}
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

            {/* Legend */}
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
      {/* 3. ROW 3: DHARMA PATRON RUTIN & S-SALUR MAD                   */}
      {/* - Left: Dharma Patron Rutin (Bulan, Total, Belum di bayar)     */}
      {/* - Right: S-SALUR MAD (Kecuali Patron) (Total, Prog 1, 2, 3)   */}
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

        {/* Card 2: S-SALUR MAD (Kecuali Dharma Patron Rutin) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                S-SALUR MAD (Kecuali Dharma Patron Rutin)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter program MAD')}
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
                  {salurProgramsTableData.map((row) => (
                    <tr key={row.bulan} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 px-2.5 text-left font-medium">{row.bulan}</td>
                      <td className="py-1.5 px-2 text-right font-medium">{row.total}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{row.p1}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{row.p2}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{row.p3}</td>
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
      {/* - Transaksi - Buku B... (Quantities per year)                  */}
      {/* - Chart - Buku Berbayar (+100 buah in 2021)                    */}
      {/* - New Item (Book covers, title, price, tersalur 200 buah)       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Transaksi - Buku B... (Span 3 cols) */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3
                className="font-bold text-slate-800 text-xs sm:text-sm truncate"
                title="Transaksi - Buku Berbayar"
              >
                Transaksi - Buku B...
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onShowToast('Filter tabel transaksi')}
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
                  {bukuBerbayarTableData.map((row) => (
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

        {/* Card 2: Chart - Buku Berbayar (Span 5 cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-1 mb-1">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Transaksi Buku Berbayar
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
                  onClick={() => {
                    setChartYear((y) => Math.max(2018, y - 1));
                    onShowToast(`Tahun ${chartYear - 1}`);
                  }}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChartYear((y) => Math.min(2021, y + 1));
                    onShowToast(`Tahun ${chartYear + 1}`);
                  }}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Subtitle: +100 buah in 2021 */}
            <div className="mb-4">
              <span className="font-bold text-[#008d91] text-sm sm:text-base">
                +100 buah{' '}
              </span>
              <span className="text-slate-600 text-xs font-normal">in {chartYear}</span>
            </div>

            {/* Clustered Bar Chart for 12 months */}
            <div className="h-52 w-full flex items-end justify-between px-1 pb-2 border-b border-slate-100">
              {bukuBerbayarTableData.map((row) => {
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
                  onClick={() => onShowToast('Filter item katalog')}
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

            {/* List of 3 New Books */}
            <div className="space-y-3">
              {[0, 1, 2].map((idx) => {
                const book: SalurProduct = books[idx] || books[0] || {
                  id: 'salur-jalan-menuju',
                  code: 'BK-001',
                  title: 'Jalan Menuju Kemahatahuan',
                  price: 125000,
                  stock: 100,
                  coverKey: 'jalan-menuju',
                  category: 'Buku Dharma',
                  pemasukanDivisi: 'MAD',
                  imageUrl: '',
                };

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onNavigateView) {
                        onNavigateView('itemSalur');
                      } else {
                        onShowToast(`Buku: ${book.title}`);
                      }
                    }}
                    className="flex flex-col gap-1 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Book Thumbnail */}
                      <div className="w-12 h-16 shrink-0 rounded-md overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                        <BookCover
                          coverKey={book.coverKey || 'jalan-menuju'}
                          title={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-[#008d91] transition-colors">
                          {book.title}
                        </h4>
                        <div className="text-[11px] text-[#008d91] font-semibold mt-0.5">
                          {book.price > 0
                            ? `Rp${book.price.toLocaleString('id-ID')}`
                            : 'Gratis'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Stok: {book.stock || 100} pcs
                        </div>
                      </div>

                      {/* Status / Tersalur Badge */}
                      <div className="shrink-0 text-right">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          200 buah
                        </span>
                        <span className="text-[9px] text-slate-400">tersalur</span>
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
      {/* - Title: Chart - Buku Berbayar                                 */}
      {/* - Subtitle: 60 Kota, 30 Provinsi in 2021                       */}
      {/* - Vector Map of Indonesia with teal & yellow highlights        */}
      {/* ============================================================== */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-1 mb-1">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Chart - Buku Berbayar
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

          {/* Subtitle matching image */}
          <div className="mb-4">
            <span className="font-bold text-[#008d91] text-base sm:text-lg">
              60 Kota, 30 Provinsi{' '}
            </span>
            <span className="text-slate-600 text-xs sm:text-sm font-normal">
              in 2021
            </span>
          </div>

          {/* Interactive Vector SVG Map of Indonesia */}
          <IndonesiaMapSvg
            className="mt-2"
            onSelectRegion={(reg) => onShowToast(`Wilayah terpilih: ${reg}`)}
          />
        </div>
      </div>
    </div>
  );
};
