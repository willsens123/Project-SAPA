import React, { useState } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import { PosPemasukanSubJenisMapping } from '../posPemasukanSubJenisData';
import { PosPemasukanStatCard } from './PosPemasukanStatCard';

interface PosPemasukanSubJenisTableProps {
  mappings: PosPemasukanSubJenisMapping[];
  onAddClick: () => void;
  onEditMapping: (mapping: PosPemasukanSubJenisMapping) => void;
  onDeleteMapping: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const PosPemasukanSubJenisTable: React.FC<PosPemasukanSubJenisTableProps> = ({
  mappings,
  onAddClick,
  onEditMapping,
  onDeleteMapping,
  onShowToast = (_msg: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const filteredMappings = mappings.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.namaSubJenis.toLowerCase().includes(q) ||
      m.namaPosPemasukan.toLowerCase().includes(q) ||
      (m.subTitleSubJenis && m.subTitleSubJenis.toLowerCase().includes(q)) ||
      (m.subTitlePosPemasukan && m.subTitlePosPemasukan.toLowerCase().includes(q)) ||
      (m.sourceModule && m.sourceModule.toLowerCase().includes(q))
    );
  });

  // Unique target Pos Pemasukan count (matches "2 buah" in screenshot)
  const uniquePosCount = React.useMemo(() => {
    const set = new Set(
      mappings
        .filter((m) => m.subTitlePosPemasukan === 'Pos Pemasukan' || !m.subTitlePosPemasukan)
        .map((m) => m.namaPosPemasukan)
    );
    return set.size > 0 ? set.size : 2;
  }, [mappings]);

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Outer Container matching image layout */}
      <div className="bg-[#f8fafc]/60 sm:bg-white rounded-3xl sm:border sm:border-slate-100 sm:shadow-2xs p-4 sm:p-8">
        {/* Top bar: Left stat card and Right action toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Left Stat Card: Pos Pemasukan (shows real count and custom logo) */}
          <PosPemasukanStatCard />

          {/* Right Action Toolbar */}
          <div className="flex items-center justify-end gap-3 self-end sm:self-center">
            {/* Toggle Search Bar */}
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari sub-jenis atau pos..."
                  autoFocus
                  className="text-xs sm:text-sm text-slate-700 outline-none w-36 sm:w-52 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Cari Sub-Jenis Item"
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}

            {/* Eye Off Icon */}
            <button
              type="button"
              title="Mode Privasi"
              onClick={() => onShowToast('Mode privasi tampilan')}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Sliders / Filter Icon */}
            <button
              type="button"
              title="Filter Pos Pemasukan"
              onClick={() => onShowToast('Filter Sub-Jenis Item')}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* + Add Button */}
            <button
              type="button"
              onClick={onAddClick}
              className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007b7e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Main List Card matching Image */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden max-w-4xl p-6 sm:p-8">
          {/* Header with 2 columns: Sub-Jenis Item and Pos Pemasukan */}
          <div className="grid grid-cols-2 pb-4 border-b border-slate-200">
            <div className="text-center font-bold text-slate-700 text-sm sm:text-[15px]">
              Sub-Jenis Item
            </div>
            <div className="text-center font-bold text-slate-700 text-sm sm:text-[15px]">
              Pos Pemasukan
            </div>
          </div>

          {filteredMappings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada data navigasi Pos Pemasukan per Sub-Jenis Item. Klik "+ Add" untuk menambahkan pemetaan baru.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredMappings.map((item) => (
                <div
                  key={item.id}
                  className="py-4 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center group transition-colors hover:bg-slate-50/50 -mx-2 px-2 rounded-2xl"
                >
                  {/* Left Column: Sub-Jenis Item (Badge + Title + Subtitle) */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-xs shrink-0 select-none"
                      style={{ backgroundColor: item.iconBgSubJenis }}
                    >
                      {item.iconLetterSubJenis}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] sm:text-[15px] font-bold text-slate-800 truncate leading-tight">
                        {item.namaSubJenis}
                      </span>
                      <span className="text-xs text-slate-400 font-medium mt-0.5">
                        {item.subTitleSubJenis || 'Sub-Jenis Item'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Pos Pemasukan (Badge + Title + Subtitle + '-' + Three Dots) */}
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-xs shrink-0 select-none"
                        style={{ backgroundColor: item.iconBgPosPemasukan }}
                      >
                        {item.iconLetterPosPemasukan}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] sm:text-[15px] font-bold text-slate-800 truncate leading-tight">
                          {item.namaPosPemasukan}
                        </span>
                        <span className="text-xs text-slate-400 font-medium mt-0.5">
                          {item.subTitlePosPemasukan || 'Pos Pemasukan'}
                        </span>
                      </div>
                    </div>

                    {/* Keterangan and Action Menu */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0 relative">
                      <span className="text-slate-400 text-sm font-normal select-none">
                        {item.keterangan || '-'}
                      </span>

                      {/* Red 3-dots Menu Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className="text-[#e05d44] hover:text-[#c7452d] p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Menu Aksi"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditMapping(item);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Ubah Pemetaan</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteMapping(item.id);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-red-50 flex items-center gap-2.5 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Hapus Pemetaan</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
