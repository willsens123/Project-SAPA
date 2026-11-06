import React, { useState, useMemo, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  CreditCard,
} from 'lucide-react';
import { RekeningItem } from '../types';

interface RekeningDashboardProps {
  items: RekeningItem[];
  onAddClick: () => void;
  onEditItem: (item: RekeningItem) => void;
  onDeleteItem: (id: string) => void;
}

export const RekeningDashboard: React.FC<RekeningDashboardProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
}) => {
  const [isHideDetail, setIsHideDetail] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.rekening-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedBankFilter !== 'ALL' && !item.nama.toLowerCase().includes(selectedBankFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = item.nama.toLowerCase().includes(q);
        const matchKet = item.keteranganLengkap.toLowerCase().includes(q);
        const matchTipe = item.tipe.toLowerCase().includes(q);
        return matchNama || matchKet || matchTipe;
      }
      return true;
    });
  }, [items, selectedBankFilter, searchQuery]);

  // Masking helper when isHideDetail is active
  const maskKeterangan = (text: string) => {
    if (!isHideDetail) return text;
    // Mask numbers
    return text.replace(/\d{4,}/g, '••••••••');
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Top Toolbar Action Buttons matching image top right */}
      <div className="flex items-center justify-end gap-3 px-1">
        {/* Search Bar input when open */}
        {isSearchOpen && (
          <div className="relative flex items-center animate-in fade-in slide-in-from-right-2 duration-150">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari rekening..."
              className="w-48 sm:w-64 pl-3 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#008d91]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Eye / EyeOff icon button */}
        <button
          type="button"
          id="btn-rekening-toggle-eye"
          onClick={() => setIsHideDetail(!isHideDetail)}
          title={isHideDetail ? 'Tampilkan nomor rekening' : 'Sembunyikan nomor rekening'}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isHideDetail ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isHideDetail ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        {/* Search icon button */}
        <button
          type="button"
          id="btn-rekening-toggle-search"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          title="Cari"
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isSearchOpen || searchQuery ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Sliders / Filter icon button */}
        <div className="relative">
          <button
            type="button"
            id="btn-rekening-toggle-filter"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Filter"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isFilterOpen || selectedBankFilter !== 'ALL'
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Filter Popover */}
          {isFilterOpen && (
            <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-30 w-48 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Filter Bank
              </div>
              <div className="space-y-1">
                {['ALL', 'BCA', 'Mandiri'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setSelectedBankFilter(b);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      selectedBankFilter === b
                        ? 'bg-[#008d91]/10 text-[#008d91] font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {b === 'ALL' ? 'Semua Bank' : b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* + Add Button matching image */}
        <button
          type="button"
          id="btn-rekening-add"
          onClick={onAddClick}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#008d91] hover:bg-[#00787c] text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-2xs transition-all hover:shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main White Card matching image */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
        {/* Inner Header Row */}
        <div className="border-b border-slate-200/80 pb-4 mb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
            Rekening
          </h2>
        </div>

        {/* List of Rekening items matching exact layout */}
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
              Tidak ada data rekening yang ditemukan.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="py-4.5 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 rounded-2xl px-2 sm:px-3 -mx-2 sm:-mx-3 transition-colors"
              >
                {/* Left side: Avatar Box + Nama & Tipe */}
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  {/* Rounded square avatar with letter */}
                  <div
                    style={{ backgroundColor: item.bgColor }}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-2xl sm:text-[26px] text-white shrink-0 shadow-2xs select-none"
                  >
                    {item.avatarLetter || item.nama.charAt(0).toUpperCase()}
                  </div>

                  {/* Nama & Tipe */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                      {item.nama}
                    </h3>
                    <p className="text-xs text-slate-400 font-normal mt-0.5">
                      {item.tipe}
                    </p>
                  </div>
                </div>

                {/* Center / Right text: Keterangan Lengkap */}
                <div className="flex-1 sm:text-left text-slate-600 text-xs sm:text-sm font-normal leading-relaxed pl-16 sm:pl-0 pr-2">
                  {maskKeterangan(item.keteranganLengkap)}
                </div>

                {/* Rightmost: Three vertical dots menu */}
                <div className="relative rekening-menu-container shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === item.id ? null : item.id);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Menu opsi"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === item.id && (
                    <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 w-36 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          onEditItem(item);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          onDeleteItem(item.id);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
