import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  UserCheck,
  Users,
  CalendarDays,
  CalendarCheck,
  CalendarOff,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings2,
} from 'lucide-react';
import { KaryawanItem } from '../types';
import { CutiKaryawanItem } from '../cutiKaryawanData';
import { HariKhususItem, isHariBesarNasional } from '../hariKhususData';
import {
  calculateEmployeeYearlySummary,
  getDailyAttendanceCell,
  isWeekend,
  isDateNationalHoliday,
  toDateStr,
  loadCustomHoursMap,
  saveCustomHoursMap,
  loadPreviousLeaveBalances,
  savePreviousLeaveBalances,
} from '../rekapAbsensiData';
import { AddEditCutiKaryawanModal } from './AddEditCutiKaryawanModal';

interface RekapAbsensiKaryawanViewProps {
  karyawanList: KaryawanItem[];
  cutiList: CutiKaryawanItem[];
  hariKhususList: HariKhususItem[];
  onSaveCutiItem: (item: CutiKaryawanItem) => void;
  onNavigateToCuti?: () => void;
  onNavigateToKaryawan?: () => void;
  onShowToast?: (msg: string) => void;
}

const MONTH_NAMES_INDONESIA = [
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

const DAY_NAMES_INDONESIA = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const RekapAbsensiKaryawanView: React.FC<RekapAbsensiKaryawanViewProps> = ({
  karyawanList,
  cutiList,
  hariKhususList,
  onSaveCutiItem,
  onNavigateToCuti,
  onNavigateToKaryawan,
  onShowToast = (_msg: string) => {},
}) => {
  // Current view year & month (Default November 2021 matching screenshot)
  const [selectedYear, setSelectedYear] = useState<number>(2021);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // 10 = November (0-indexed)

  // Column visibility matching requirement: "Cuti Tahun 2021", "Cuti Digunakan 2021", "Rekap Fasilitas" dapat di hide.
  const [showCutiTahun, setShowCutiTahun] = useState<boolean>(true);
  const [showCutiDigunakan, setShowCutiDigunakan] = useState<boolean>(true);
  const [showRekapFasilitas, setShowRekapFasilitas] = useState<boolean>(true);
  const [columnMenuOpen, setColumnMenuOpen] = useState<boolean>(false);
  const columnMenuRef = useRef<HTMLDivElement | null>(null);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Divisi
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const filterRef = useRef<HTMLDivElement | null>(null);

  // Year selector dropdown
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const yearMenuRef = useRef<HTMLDivElement | null>(null);

  // Custom daily work hours map
  const [customHoursMap, setCustomHoursMap] = useState<Record<string, number>>(() =>
    loadCustomHoursMap()
  );

  // Add leave modal
  const [addLeaveModalOpen, setAddLeaveModalOpen] = useState(false);

  // Edit balance modal
  const [editBalanceModalOpen, setEditBalanceModalOpen] = useState(false);
  const [selectedEmployeeForBalance, setSelectedEmployeeForBalance] =
    useState<KaryawanItem | null>(null);
  const [prevBalanceInput, setPrevBalanceInput] = useState<number>(0);

  // Close popovers on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(e.target as Node)
      ) {
        setColumnMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (yearMenuRef.current && !yearMenuRef.current.contains(e.target as Node)) {
        setYearMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Compute days in currently selected month (e.g. 30 days for Nov 2021)
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Array of days [1, 2, ..., daysInMonth]
  const daysList = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Available divisions from employees
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    karyawanList.forEach((k) => {
      if (k.divisi) set.add(k.divisi.toUpperCase());
    });
    return Array.from(set);
  }, [karyawanList]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return karyawanList.filter((k) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = k.namaLengkap.toLowerCase().includes(q);
        const matchKode = k.kodeKaryawan.toLowerCase().includes(q);
        const matchPanggilan = (k.namaPanggilan || '').toLowerCase().includes(q);
        const matchDivisi = k.divisi.toLowerCase().includes(q);
        if (!matchName && !matchKode && !matchPanggilan && !matchDivisi) {
          return false;
        }
      }
      if (selectedDivisi !== 'ALL') {
        if (k.divisi.toUpperCase() !== selectedDivisi) return false;
      }
      return true;
    });
  }, [karyawanList, searchQuery, selectedDivisi]);

  // Quick navigation for month carousel
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Save updated previous leave balance
  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForBalance) return;
    const currentMap = loadPreviousLeaveBalances();
    currentMap[selectedEmployeeForBalance.id] = prevBalanceInput;
    savePreviousLeaveBalances(currentMap);
    setEditBalanceModalOpen(false);
    onShowToast(
      `Sisa cuti tahun lalu untuk "${selectedEmployeeForBalance.namaLengkap}" berhasil diset ke ${prevBalanceInput} hari`
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top Action Toolbar matching screenshot */}
        <div className="flex items-center justify-end gap-3 mb-4">
          {/* Eye Button: Column Visibility Toggle */}
          <div className="relative" ref={columnMenuRef}>
            <button
              type="button"
              onClick={() => setColumnMenuOpen(!columnMenuOpen)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                !showCutiTahun || !showCutiDigunakan || !showRekapFasilitas
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Sembunyikan / Tampilkan Kolom Cuti & Fasilitas"
            >
              {!showCutiTahun && !showCutiDigunakan && !showRekapFasilitas ? (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <Eye className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            {columnMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tampilkan / Sembunyikan Kolom
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showCutiTahun}
                      onChange={(e) => setShowCutiTahun(e.target.checked)}
                      className="rounded text-[#008d91] focus:ring-[#008d91]"
                    />
                    <span>Cuti Tahun {selectedYear}</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showCutiDigunakan}
                      onChange={(e) => setShowCutiDigunakan(e.target.checked)}
                      className="rounded text-[#008d91] focus:ring-[#008d91]"
                    />
                    <span>Cuti Digunakan {selectedYear}</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showRekapFasilitas}
                      onChange={(e) => setShowRekapFasilitas(e.target.checked)}
                      className="rounded text-[#008d91] focus:ring-[#008d91]"
                    />
                    <span>Rekap Fasilitas</span>
                  </label>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCutiTahun(true);
                      setShowCutiDigunakan(true);
                      setShowRekapFasilitas(true);
                    }}
                    className="text-[11px] font-semibold text-[#008d91] hover:underline cursor-pointer"
                  >
                    Tampilkan Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCutiTahun(false);
                      setShowCutiDigunakan(false);
                      setShowRekapFasilitas(false);
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Sembunyikan Semua
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Toggle */}
          {searchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID, nama karyawan..."
                autoFocus
                className="text-xs sm:text-sm text-slate-700 outline-none w-44 sm:w-60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                searchQuery
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Pencarian Karyawan"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}

          {/* Filter Toggle */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                selectedDivisi !== 'ALL'
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Filter Divisi"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Filter Divisi
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDivisi('ALL');
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                    selectedDivisi === 'ALL'
                      ? 'text-[#008d91] bg-teal-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Semua Divisi</span>
                  {selectedDivisi === 'ALL' && <Check className="w-3.5 h-3.5" />}
                </button>
                {availableDivisions.map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setSelectedDivisi(div);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      selectedDivisi === div
                        ? 'text-[#008d91] bg-teal-50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Divisi {div}</span>
                    {selectedDivisi === div && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* + Add Button */}
          <button
            type="button"
            onClick={() => setAddLeaveModalOpen(true)}
            className="px-4 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs shadow-[#008d91]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Month Selector Carousel matching screenshot */}
        <div className="flex items-center justify-between gap-4 mb-6 select-none overflow-x-auto pb-1">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prev button */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007a7e] transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Month Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {MONTH_NAMES_INDONESIA.map((name, idx) => {
                const isSelected = selectedMonth === idx;
                return (
                  <div key={name} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedMonth(idx)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#008d91] text-white shadow-xs'
                          : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                      }`}
                    >
                      {name}
                    </button>
                    {isSelected && (
                      <span className="w-7 h-0.5 bg-[#008d91] mt-1 rounded-full animate-in fade-in" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#007a7e] transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Year selector button on the right */}
          <div className="relative shrink-0" ref={yearMenuRef}>
            <button
              type="button"
              onClick={() => setYearMenuOpen(!yearMenuOpen)}
              className="px-6 py-1.5 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-full text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{selectedYear}</span>
            </button>

            {yearMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setSelectedYear(yr);
                      setYearMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      selectedYear === yr
                        ? 'text-[#008d91] bg-teal-50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{yr}</span>
                    {selectedYear === yr && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Attendance & Leave Table matching screenshot */}
        <div className="w-full overflow-x-auto border-t border-slate-100">
          <table className="w-full border-collapse text-left select-none min-w-[1200px]">
            <thead>
              {/* Header Row 1: Day Names */}
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-700">
                {/* Employee / summary columns header spacer */}
                <th className="py-3 px-4 min-w-[200px] bg-white sticky left-0 z-10" />
                <th className="py-3 px-3 min-w-[100px] text-center" />
                {showCutiTahun && (
                  <th className="py-3 px-3 min-w-[110px] text-center" />
                )}
                {showCutiDigunakan && (
                  <th className="py-3 px-3 min-w-[130px] text-center" />
                )}
                {showRekapFasilitas && (
                  <th className="py-3 px-4 min-w-[140px] text-left" />
                )}

                {/* Day Names columns */}
                {daysList.map((dayNum) => {
                  const d = new Date(selectedYear, selectedMonth, dayNum);
                  const dayName = DAY_NAMES_INDONESIA[d.getDay()];
                  const weekend = isWeekend(selectedYear, selectedMonth, dayNum);
                  const dateStr = toDateStr(selectedYear, selectedMonth, dayNum);
                  const holiday = isDateNationalHoliday(dateStr, hariKhususList);

                  // Tanggal dan hari yang memiliki Hari Besar Nasional berwarna merah (bersama Sabtu & Minggu)
                  const isRedDay = weekend || holiday.isHoliday;

                  return (
                    <th
                      key={`dayname-${dayNum}`}
                      className={`py-3 px-2 text-center min-w-[44px] text-xs font-semibold ${
                        isRedDay ? 'text-red-500 font-bold' : 'text-slate-700'
                      }`}
                      title={
                        holiday.isHoliday
                          ? holiday.name
                          : dayName
                      }
                    >
                      {dayName}
                    </th>
                  );
                })}
              </tr>

              {/* Header Row 2: Column Titles & Day Numbers */}
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-700">
                <th className="py-3 px-4 bg-white sticky left-0 z-10 font-bold text-slate-800">
                  {/* Empty or title */}
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap">
                  Cuti Tersisa
                </th>
                {showCutiTahun && (
                  <th className="py-3 px-3 text-center whitespace-nowrap">
                    Cuti Tahun {selectedYear}
                  </th>
                )}
                {showCutiDigunakan && (
                  <th className="py-3 px-3 text-center whitespace-nowrap">
                    Cuti Digunakan {selectedYear}
                  </th>
                )}
                {showRekapFasilitas && (
                  <th className="py-3 px-4 text-left whitespace-nowrap">
                    Rekap Fasilitas
                  </th>
                )}

                {/* Day Numbers (1, 2, ..., N) */}
                {daysList.map((dayNum) => {
                  const weekend = isWeekend(selectedYear, selectedMonth, dayNum);
                  const dateStr = toDateStr(selectedYear, selectedMonth, dayNum);
                  const holiday = isDateNationalHoliday(dateStr, hariKhususList);
                  // Tanggal dan hari yang memiliki Hari Besar Nasional berwarna merah (bersama Sabtu & Minggu)
                  const isRed = weekend || holiday.isHoliday;

                  return (
                    <th
                      key={`daynum-${dayNum}`}
                      className={`py-3 px-2 text-center text-xs font-semibold cursor-default ${
                        isRed ? 'text-red-500 font-bold' : 'text-slate-800'
                      }`}
                      title={
                        holiday.isHoliday
                          ? holiday.name
                          : `${dayNum} ${MONTH_NAMES_INDONESIA[selectedMonth]} ${selectedYear}`
                      }
                    >
                      {dayNum}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      5 +
                      (showCutiTahun ? 0 : -1) +
                      (showCutiDigunakan ? 0 : -1) +
                      (showRekapFasilitas ? 0 : -1) +
                      daysList.length
                    }
                    className="py-12 text-center text-slate-400"
                  >
                    Tidak ada karyawan yang sesuai filter atau pencarian
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const summary = calculateEmployeeYearlySummary(
                    emp,
                    selectedYear,
                    cutiList,
                    hariKhususList
                  );

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Employee Info Column (Avatar + Kode + Nama + Panggilan) */}
                      <td className="py-4 px-4 whitespace-nowrap bg-white group-hover:bg-slate-50/70 sticky left-0 z-10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${
                              emp.avatarBg || 'bg-[#14b8a6]'
                            } text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                          >
                            {emp.avatarInitial ||
                              emp.namaLengkap[0]?.toUpperCase() ||
                              'K'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs sm:text-sm">
                              {emp.kodeKaryawan} {emp.namaLengkap}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {emp.namaPanggilan || '-'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cuti Tersisa */}
                      <td className="py-4 px-3 text-center whitespace-nowrap font-bold text-slate-800 text-xs sm:text-sm">
                        {summary.cutiTersisa}
                      </td>

                      {/* Cuti Tahun [YYYY] */}
                      {showCutiTahun && (
                        <td className="py-4 px-3 text-center whitespace-nowrap font-semibold text-slate-700 text-xs sm:text-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployeeForBalance(emp);
                              setPrevBalanceInput(summary.sisaTahunLalu);
                              setEditBalanceModalOpen(true);
                            }}
                            className="hover:text-[#008d91] hover:underline cursor-pointer"
                            title="Klik untuk setting sisa cuti tahun lalu"
                          >
                            {summary.cutiTahun}
                          </button>
                        </td>
                      )}

                      {/* Cuti Digunakan [YYYY] */}
                      {showCutiDigunakan && (
                        <td className="py-4 px-3 text-center whitespace-nowrap font-semibold text-slate-700 text-xs sm:text-sm">
                          {summary.cutiDigunakan}
                        </td>
                      )}

                      {/* Rekap Fasilitas */}
                      {showRekapFasilitas && (
                        <td className="py-4 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap align-top">
                          <div className="space-y-0.5 text-[11px] leading-tight text-slate-700">
                            <div>Ijin Duka: {summary.rekapFasilitas.ijinDuka}</div>
                            <div>Ijin Sakit: {summary.rekapFasilitas.ijinSakit}</div>
                            <div>Ijin Menikah: {summary.rekapFasilitas.ijinMenikah}</div>
                            <div>
                              Ijin Melahirkan: {summary.rekapFasilitas.ijinMelahirkan}
                            </div>
                            <div>
                              Ijin Spiritual: {summary.rekapFasilitas.ijinSpiritual}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Daily Attendance Columns */}
                      {daysList.map((dayNum) => {
                        const cell = getDailyAttendanceCell(
                          emp,
                          selectedYear,
                          selectedMonth,
                          dayNum,
                          cutiList,
                          hariKhususList,
                          customHoursMap
                        );

                        return (
                          <td
                            key={`cell-${emp.id}-${dayNum}`}
                            className={`py-4 px-1 text-center whitespace-nowrap text-xs font-semibold ${
                              cell.isRed
                                ? 'text-red-500 font-bold'
                                : 'text-slate-800'
                            }`}
                            title={
                              cell.holidayName
                                ? `${cell.holidayName} (Libur Nasional)`
                                : cell.leaveType
                                ? `${emp.namaLengkap} - ${cell.leaveType}`
                                : `${dayNum} ${MONTH_NAMES_INDONESIA[selectedMonth]}: ${cell.text} jam`
                            }
                          >
                            {cell.text}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Information */}
      <div className="pt-4 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            Menampilkan <span className="font-bold text-slate-600">{filteredEmployees.length}</span>{' '}
            karyawan pada periode{' '}
            <span className="font-bold text-slate-700">
              {MONTH_NAMES_INDONESIA[selectedMonth]} {selectedYear}
            </span>
          </div>
          {onNavigateToCuti && (
            <button
              type="button"
              onClick={onNavigateToCuti}
              className="text-[#008d91] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Form Cuti Karyawan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>0 = Cuti Full / Libur</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span>4 (Merah) = Cuti Setengah Hari</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span>8 = Jam Kerja Normal</span>
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      <AddEditCutiKaryawanModal
        isOpen={addLeaveModalOpen}
        onClose={() => setAddLeaveModalOpen(false)}
        onSave={(newCuti) => {
          onSaveCutiItem(newCuti);
          onShowToast(`Pengajuan cuti untuk ${newCuti.namaKaryawan} berhasil ditambahkan`);
        }}
        karyawanList={karyawanList}
      />

      {/* Edit Previous Year Balance Modal */}
      {editBalanceModalOpen && selectedEmployeeForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                Setting Sisa Cuti Tahun Lalu
              </h3>
              <button
                type="button"
                onClick={() => setEditBalanceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveBalance} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Karyawan:</span>
                <span className="text-sm font-bold text-slate-800">
                  [{selectedEmployeeForBalance.kodeKaryawan}]{' '}
                  {selectedEmployeeForBalance.namaLengkap}
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sisa Cuti Tahun Sebelumnya:
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={prevBalanceInput}
                  onChange={(e) =>
                    setPrevBalanceInput(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#008d91]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Cuti Tahun {selectedYear} akan dihitung: {prevBalanceInput} + 12 ={' '}
                  <span className="font-bold text-[#008d91]">
                    {prevBalanceInput + 12} Hari
                  </span>
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBalanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#008d91] hover:bg-[#007a7e] text-white cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
