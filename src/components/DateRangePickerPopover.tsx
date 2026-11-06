import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Check, X, Sparkles } from 'lucide-react';
import { parseDateString, formatDatePickerValue } from '../utils/datePickerHelper';

interface DateRangePickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onSelectRange: (startFormatted: string, endFormatted: string, startIso?: string, endIso?: string) => void;
  format?: 'id-ID' | 'YYYY-MM-DD';
  className?: string;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const DateRangePickerPopover: React.FC<DateRangePickerPopoverProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onSelectRange,
  format = 'id-ID',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial dates
  const initialStartDate = useMemo(() => parseDateString(startDate), [startDate]);
  const initialEndDate = useMemo(() => parseDateString(endDate), [endDate]);

  // Selected dates in picker
  const [selectedStart, setSelectedStart] = useState<Date | null>(initialStartDate);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(initialEndDate);

  // Current calendar view month & year
  const [viewYear, setViewYear] = useState<number>(() => {
    return initialStartDate ? initialStartDate.getFullYear() : 2021;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return initialStartDate ? initialStartDate.getMonth() : 10; // Default Nov
  });

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Sync when opening or props change
  useEffect(() => {
    if (isOpen) {
      const s = parseDateString(startDate);
      const e = parseDateString(endDate);
      setSelectedStart(s);
      setSelectedEnd(e);
      if (s) {
        setViewYear(s.getFullYear());
        setViewMonth(s.getMonth());
      } else if (e) {
        setViewYear(e.getFullYear());
        setViewMonth(e.getMonth());
      }
    }
  }, [isOpen, startDate, endDate]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar days calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateBetween = (target: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const t = target.getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return t > s && t < e;
  };

  const formatToIndoStr = (d: Date): string => {
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const toISODate = (d: Date | null): string => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatResult = (d: Date | null): string => {
    if (!d) return '';
    if (format === 'YYYY-MM-DD') {
      return toISODate(d);
    }
    return formatToIndoStr(d);
  };

  const emitRangeChange = (start: Date | null, end: Date | null) => {
    if (!start) return;
    const startRes = formatResult(start);
    const endRes = end ? formatResult(end) : '';
    onSelectRange(startRes, endRes, toISODate(start), toISODate(end));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewYear, viewMonth, day);

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start a new selection
      setSelectedStart(clickedDate);
      setSelectedEnd(null);
      // Auto-fill start date immediately into the inputs
      emitRangeChange(clickedDate, null);
    } else if (selectedStart && !selectedEnd) {
      // Pick end date
      let newStart = selectedStart;
      let newEnd = clickedDate;
      if (clickedDate.getTime() < selectedStart.getTime()) {
        newStart = clickedDate;
        newEnd = selectedStart;
      }
      setSelectedStart(newStart);
      setSelectedEnd(newEnd);
      // Auto-fill both dates!
      emitRangeChange(newStart, newEnd);
    }
  };

  // Quick Preset Helper
  const applyPreset = (daysDiff: number, isMonthBased = false, monthsDiff = 0) => {
    const base = selectedStart || parseDateString(startDate) || new Date(2021, 10, 15);
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    const end = new Date(start);

    if (isMonthBased && monthsDiff !== 0) {
      end.setMonth(end.getMonth() + monthsDiff);
    } else {
      end.setDate(end.getDate() + daysDiff);
    }

    setSelectedStart(start);
    setSelectedEnd(end);
    emitRangeChange(start, end);
  };

  const handleNativeStartChange = (val: string) => {
    if (!val) return;
    const parts = val.split('-').map(Number);
    if (parts.length === 3) {
      const newStart = new Date(parts[0], parts[1] - 1, parts[2]);
      setSelectedStart(newStart);
      setViewYear(newStart.getFullYear());
      setViewMonth(newStart.getMonth());
      emitRangeChange(newStart, selectedEnd);
    }
  };

  const handleNativeEndChange = (val: string) => {
    if (!val) return;
    const parts = val.split('-').map(Number);
    if (parts.length === 3) {
      const newEnd = new Date(parts[0], parts[1] - 1, parts[2]);
      setSelectedEnd(newEnd);
      emitRangeChange(selectedStart, newEnd);
    }
  };

  const handleApply = () => {
    if (selectedStart && selectedEnd) {
      emitRangeChange(selectedStart, selectedEnd);
    } else if (selectedStart && !selectedEnd) {
      emitRangeChange(selectedStart, selectedStart);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/5"
        onClick={onClose}
      />

      {/* Popover Container */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className={`absolute z-50 top-full mt-2 left-0 sm:left-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 w-[340px] sm:w-[380px] font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Header Title & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Calendar className="w-4 h-4 text-[#008d91]" />
            <span>Pilih Rentang Tanggal</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Start Date & End Date Inputs row */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Dari Tanggal (Awal)
            </label>
            <input
              type="date"
              value={toISODate(selectedStart)}
              onChange={(e) => handleNativeStartChange(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 focus:bg-white focus:border-[#008d91] outline-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Sampai Tanggal (Akhir)
            </label>
            <input
              type="date"
              value={toISODate(selectedEnd)}
              onChange={(e) => handleNativeEndChange(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50/50 focus:bg-white focus:border-[#008d91] outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Range Presets */}
        <div className="flex flex-wrap gap-1.5 mb-3 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => applyPreset(0)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => applyPreset(7)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            +7 Hari
          </button>
          <button
            type="button"
            onClick={() => applyPreset(14)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            +14 Hari
          </button>
          <button
            type="button"
            onClick={() => applyPreset(30)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            +30 Hari
          </button>
          <button
            type="button"
            onClick={() => applyPreset(0, true, 1)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            +1 Bulan
          </button>
          <button
            type="button"
            onClick={() => applyPreset(0, true, 3)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            +3 Bulan
          </button>
          <button
            type="button"
            onClick={() => applyPreset(0, true, 12)}
            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            +1 Tahun
          </button>
        </div>

        {/* Month Navigation Header */}
        <div className="flex items-center justify-between py-1.5 px-1 mb-2 bg-slate-50/70 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAY_NAMES.map((name) => (
            <div key={name} className="text-[11px] font-bold text-slate-400 py-1">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Previous month empty days */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`prev-${i}`}
              className="text-[11px] text-slate-300 py-1.5 cursor-default select-none"
            >
              {daysInPrevMonth - firstDayOfMonth + i + 1}
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const currentDayDate = new Date(viewYear, viewMonth, dayNum);

            const isStart = isSameDay(currentDayDate, selectedStart);
            const isEnd = isSameDay(currentDayDate, selectedEnd);
            const isBetween = isDateBetween(currentDayDate, selectedStart, selectedEnd);

            const isHoverBetween =
              selectedStart &&
              !selectedEnd &&
              hoverDate &&
              isDateBetween(
                currentDayDate,
                selectedStart.getTime() < hoverDate.getTime() ? selectedStart : hoverDate,
                selectedStart.getTime() < hoverDate.getTime() ? hoverDate : selectedStart
              );

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                onMouseEnter={() => setHoverDate(currentDayDate)}
                onMouseLeave={() => setHoverDate(null)}
                className={`text-xs py-1.5 rounded-lg transition-colors cursor-pointer relative select-none ${
                  isStart || isEnd
                    ? 'bg-[#008d91] text-white font-bold shadow-xs'
                    : isBetween || isHoverBetween
                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Selected Range Display & Apply Action */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 truncate">
            {selectedStart && selectedEnd ? (
              <span className="font-semibold text-slate-700">
                {formatToIndoStr(selectedStart)} - {formatToIndoStr(selectedEnd)}
              </span>
            ) : selectedStart ? (
              <span>Pilih tanggal akhir...</span>
            ) : (
              <span>Klik tanggal awal & akhir</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
