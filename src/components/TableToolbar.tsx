import React, { useState } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  Check,
  CalendarRange,
  RotateCcw,
} from 'lucide-react';
import { ColumnVisibility } from '../types';
import { toLocalIsoDate } from '../utils/projectDeadlineUtils';
import { addDaysToIso } from '../utils/projectPersiapanFilter';
import { formatDateRangeLabel } from '../utils/financialDateFilter';

interface TableToolbarProps {
  onAddClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  columnVisibility: ColumnVisibility;
  onToggleColumn: (col: keyof ColumnVisibility) => void;
  selectedDivisi: string;
  onSelectDivisi: (divisi: string) => void;
  divisiOptions?: string[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  persiapanStartDate: string;
  persiapanEndDate: string;
  onPersiapanStartDateChange: (date: string) => void;
  onPersiapanEndDateChange: (date: string) => void;
  onResetPersiapanRange: () => void;
  filteredCount?: number;
  totalCount?: number;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  onAddClick,
  searchQuery,
  onSearchChange,
  columnVisibility,
  onToggleColumn,
  selectedDivisi,
  onSelectDivisi,
  divisiOptions = ['MAD', 'EVE', 'FUN', 'PNB', 'UMM'],
  selectedStatus,
  onSelectStatus,
  persiapanStartDate,
  persiapanEndDate,
  onPersiapanStartDateChange,
  onPersiapanEndDateChange,
  onResetPersiapanRange,
  filteredCount,
  totalCount,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const columnLabels: { key: keyof ColumnVisibility; label: string }[] = [
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'dateRangePersiapan', label: 'Date Range Persiapan' },
    { key: 'namaKegiatan', label: 'Nama Kegiatan' },
    { key: 'jenisProyek', label: 'Jenis Proyek' },
    { key: 'divisi', label: 'Divisi' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'status', label: 'Status' },
    { key: 'projectedRevenue', label: 'Proyeksi Pendapatan' },
  ];

  const todayIso = toLocalIsoDate();
  const plus30Iso = addDaysToIso(todayIso, 30);

  const isPresetUpcomingActive =
    persiapanStartDate === todayIso && persiapanEndDate === '';
  const isPreset30DaysActive =
    persiapanStartDate === todayIso && persiapanEndDate === plus30Iso;

  const hasDateRangeFilter = Boolean(persiapanStartDate || persiapanEndDate);
  const hasActiveFilter =
    selectedDivisi !== 'ALL' || selectedStatus !== 'ALL' || hasDateRangeFilter;

  const handleToggleUpcomingPreset = () => {
    if (isPresetUpcomingActive) {
      onResetPersiapanRange();
      return;
    }
    onPersiapanStartDateChange(todayIso);
    onPersiapanEndDateChange('');
  };

  const handleToggle30DaysPreset = () => {
    if (isPreset30DaysActive) {
      onResetPersiapanRange();
      return;
    }
    onPersiapanStartDateChange(todayIso);
    onPersiapanEndDateChange(plus30Iso);
  };

  return (
    <div className="w-full flex flex-col gap-2 py-3 px-2 sm:px-4 relative">
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        {/* Filter Rentang Tanggal Persiapan */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 shrink-0">
            <CalendarRange className="w-4 h-4 text-[#05828e] dark:text-teal-400 shrink-0" />
            <span className="text-xs font-semibold whitespace-nowrap">
              Date Range Persiapan
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <input
              id="filter-persiapan-start"
              type="date"
              value={persiapanStartDate}
              onChange={(e) => onPersiapanStartDateChange(e.target.value)}
              aria-label="Tanggal mulai Date Range Persiapan"
              title="Tanggal mulai persiapan"
              className="h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#05828e] tabular-nums cursor-pointer"
            />
            <span className="text-xs text-slate-400 select-none">–</span>
            <input
              id="filter-persiapan-end"
              type="date"
              value={persiapanEndDate}
              onChange={(e) => onPersiapanEndDateChange(e.target.value)}
              aria-label="Tanggal selesai Date Range Persiapan"
              title="Tanggal selesai persiapan"
              className="h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#05828e] tabular-nums cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
            <button
              id="btn-preset-akan-berjalan"
              type="button"
              onClick={handleToggleUpcomingPreset}
              className={`h-7 px-2.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isPresetUpcomingActive
                  ? 'bg-[#05828e] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700'
              }`}
              title={`Tampilkan proyek dengan persiapan mulai ${todayIso} ke depan`}
            >
              Akan Berjalan
            </button>
            <button
              id="btn-preset-30-hari"
              type="button"
              onClick={handleToggle30DaysPreset}
              className={`h-7 px-2.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isPreset30DaysActive
                  ? 'bg-[#05828e] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700'
              }`}
              title={`Tampilkan proyek dengan persiapan ${todayIso} s/d ${plus30Iso}`}
            >
              30 Hari
            </button>
          </div>

          {hasDateRangeFilter && (
            <button
              id="btn-reset-persiapan-filter"
              type="button"
              onClick={onResetPersiapanRange}
              className="h-7 px-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              title="Reset filter Date Range Persiapan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Controls: EyeOff, Search, Sliders, + Add */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Search Input (Expands when clicked) */}
          {showSearchInput ? (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-sm text-sm animate-in fade-in zoom-in-95 duration-150">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                id="input-search-project"
                type="text"
                placeholder="Cari kegiatan, divisi, lokasi..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="outline-none bg-transparent text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm w-36 sm:w-56"
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearchInput(false);
                  onSearchChange('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                title="Tutup Pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* EyeOff icon */
            <div className="relative">
              <button
                id="btn-toggle-columns"
                type="button"
                onClick={() => {
                  setShowColumnMenu(!showColumnMenu);
                  setShowFilterMenu(false);
                }}
                title="Atur Tampilan Kolom"
                aria-label="Atur Tampilan Kolom"
                className="text-[#9ca3af] hover:text-[#4b5563] dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Column Visibility Dropdown */}
              {showColumnMenu && (
                <div
                  id="columns-menu-dropdown"
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-3 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Tampilkan Kolom
                  </div>
                  <div className="space-y-1.5">
                    {columnLabels.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onToggleColumn(key)}
                        className="w-full flex items-center justify-between text-left py-1 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs cursor-pointer"
                      >
                        <span>{label}</span>
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            columnVisibility[key]
                              ? 'bg-[#05828e] border-[#05828e] text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {columnVisibility[key] && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Trigger Button (when not open) */}
          {!showSearchInput && (
            <button
              id="btn-open-search"
              type="button"
              onClick={() => {
                setShowSearchInput(true);
                setShowColumnMenu(false);
                setShowFilterMenu(false);
              }}
              title="Cari Proyek"
              aria-label="Cari Proyek"
              className="text-[#9ca3af] hover:text-[#4b5563] dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}

          {/* Sliders / Filter icon */}
          <div className="relative">
            <button
              id="btn-open-filter"
              type="button"
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowColumnMenu(false);
              }}
              title="Filter Data"
              aria-label="Filter Data"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                hasActiveFilter ? 'text-[#05828e] dark:text-teal-400' : 'text-[#9ca3af] hover:text-[#4b5563] dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
              {hasActiveFilter && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#05828e]" />
              )}
            </button>

            {/* Filter Popup */}
            {showFilterMenu && (
              <div
                id="filter-menu-dropdown"
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-4 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Filter Proyek
                  </span>
                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDivisi('ALL');
                        onSelectStatus('ALL');
                        onResetPersiapanRange();
                      }}
                      className="text-xs text-[#05828e] dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* Divisi Filter */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Divisi</label>
                  <select
                    value={selectedDivisi}
                    onChange={(e) => onSelectDivisi(e.target.value)}
                    className="w-full text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 outline-none focus:border-[#05828e]"
                  >
                    <option value="ALL">Semua Divisi</option>
                    {divisiOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => onSelectStatus(e.target.value)}
                    className="w-full text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 outline-none focus:border-[#05828e]"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Done">Done</option>
                    <option value="Waiting Acc">Waiting Acc</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* + Add Button */}
          <button
            id="btn-add-project"
            type="button"
            onClick={onAddClick}
            className="bg-[#05828e] hover:bg-[#046c76] active:bg-[#035b64] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Quiet Inline Filter Summary when Date Range Persiapan is Active */}
      {hasDateRangeFilter && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1 tabular-nums">
          <span>
            Filter Date Range Persiapan:{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">
              {formatDateRangeLabel(persiapanStartDate, persiapanEndDate)}
            </strong>
          </span>
          {typeof filteredCount === 'number' && typeof totalCount === 'number' && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Menampilkan <strong className="font-semibold text-slate-700 dark:text-slate-200">{filteredCount}</strong> dari{' '}
                {totalCount} proyek
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
