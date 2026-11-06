import React, { useState } from 'react';
import { EyeOff, Search, SlidersHorizontal, Plus, X, Check } from 'lucide-react';
import { ColumnVisibility } from '../types';

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
  ];

  const hasActiveFilter = selectedDivisi !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="w-full flex items-center justify-end gap-3 py-3 px-2 sm:px-4 relative">
      {/* Search Input (Expands when clicked) */}
      {showSearchInput ? (
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm text-sm animate-in fade-in zoom-in-95 duration-150">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="input-search-project"
            type="text"
            placeholder="Cari kegiatan, divisi, lokasi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
            className="outline-none text-slate-700 placeholder-slate-400 text-xs sm:text-sm w-36 sm:w-56"
          />
          <button
            type="button"
            onClick={() => {
              setShowSearchInput(false);
              onSearchChange('');
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5"
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
            className="text-[#9ca3af] hover:text-[#4b5563] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Column Visibility Dropdown */}
          {showColumnMenu && (
            <div
              id="columns-menu-dropdown"
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 p-3 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
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
                    className="w-full flex items-center justify-between text-left py-1 px-2 rounded hover:bg-slate-50 text-slate-700 text-xs"
                  >
                    <span>{label}</span>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        columnVisibility[key]
                          ? 'bg-[#05828e] border-[#05828e] text-white'
                          : 'border-slate-300'
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
          className="text-[#9ca3af] hover:text-[#4b5563] p-1.5 rounded-lg transition-colors cursor-pointer"
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
            hasActiveFilter ? 'text-[#05828e]' : 'text-[#9ca3af] hover:text-[#4b5563]'
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
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Filter Proyek
              </span>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectDivisi('ALL');
                    onSelectStatus('ALL');
                  }}
                  className="text-xs text-[#05828e] hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Divisi Filter */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Divisi</label>
              <select
                value={selectedDivisi}
                onChange={(e) => onSelectDivisi(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none focus:border-[#05828e]"
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => onSelectStatus(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none focus:border-[#05828e]"
              >
                <option value="ALL">Semua Status</option>
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
        className="bg-[#05828e] hover:bg-[#046c76] active:bg-[#035b64] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        <span>Add</span>
      </button>
    </div>
  );
};
