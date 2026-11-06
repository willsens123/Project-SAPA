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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  PosPemasukanGroup,
  PosPemasukanAllocation,
  PosPemasukanCardLogoConfig,
  getPosPemasukanCardLogoFromStorage,
  savePosPemasukanCardLogoToStorage,
} from '../posPemasukanData';
import { PosPemasukanStatCard } from './PosPemasukanStatCard';
import { UbahLogoPosPemasukanModal } from './UbahLogoPosPemasukanModal';

interface PosPemasukanTableProps {
  groups: PosPemasukanGroup[];
  cardLogoConfig?: PosPemasukanCardLogoConfig;
  onUpdateCardLogo?: (config: PosPemasukanCardLogoConfig) => void;
  onAddClick: () => void;
  onEditGroup: (group: PosPemasukanGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditAllocation?: (group: PosPemasukanGroup, alloc: PosPemasukanAllocation) => void;
  onDeleteAllocation?: (groupId: string, allocId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const PosPemasukanTable: React.FC<PosPemasukanTableProps> = ({
  groups,
  cardLogoConfig,
  onUpdateCardLogo,
  onAddClick,
  onEditGroup,
  onDeleteGroup,
  onDeleteAllocation,
  onShowToast = (_msg: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [localCardLogo, setLocalCardLogo] = useState<PosPemasukanCardLogoConfig>(() =>
    getPosPemasukanCardLogoFromStorage()
  );
  const [isChangeLogoModalOpen, setIsChangeLogoModalOpen] = useState(false);

  const effectiveCardLogo = cardLogoConfig || localCardLogo;

  const handleSaveCardLogo = (newCfg: PosPemasukanCardLogoConfig) => {
    setLocalCardLogo(newCfg);
    savePosPemasukanCardLogoToStorage(newCfg);
    if (onUpdateCardLogo) {
      onUpdateCardLogo(newCfg);
    }
    onShowToast('Logo Pos Pemasukan berhasil diperbarui');
  };

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredGroups = groups.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchParent =
      g.namaPosPemasukan.toLowerCase().includes(q) ||
      (g.subTitle && g.subTitle.toLowerCase().includes(q));
    const matchChild = g.allocations.some(
      (a) =>
        a.namaPosKeuangan.toLowerCase().includes(q) ||
        (a.subTitle && a.subTitle.toLowerCase().includes(q)) ||
        (a.keterangan && a.keterangan.toLowerCase().includes(q))
    );
    return matchParent || matchChild;
  });

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Outer Container matching image layout */}
      <div className="bg-[#f8fafc]/60 sm:bg-white rounded-3xl sm:border sm:border-slate-100 sm:shadow-2xs p-4 sm:p-8">
        {/* Top bar: Left stat card and Right action toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Left Stat Card: Pos Pemasukan (menunjukkan secara real ada berapa Pos Pemasukan & logo dapat diubah) */}
          <PosPemasukanStatCard
            count={groups.length}
            cardLogoConfig={effectiveCardLogo}
            groups={groups}
            onLogoClick={() => setIsChangeLogoModalOpen(true)}
          />

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
                  placeholder="Cari pos pemasukan..."
                  autoFocus
                  className="text-xs sm:text-sm text-slate-700 outline-hidden w-44 sm:w-60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-600 ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Cari Pos Pemasukan"
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
              onClick={() => onShowToast('Filter Pos Pemasukan')}
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
          {/* Header Title: "Pos Pemasukan" centered above divider line */}
          <div className="text-center font-bold text-slate-700 text-sm sm:text-[15px] pb-4 border-b border-slate-200">
            Pos Pemasukan
          </div>

          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada data Pos Pemasukan. Klik "+ Add" untuk menambahkan pos pemasukan baru.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredGroups.map((group) => {
                const isCollapsed = collapsedGroupIds.has(group.id);

                return (
                  <div key={group.id} className="py-6 first:pt-4 last:pb-2">
                    {/* Parent Row: Teal Arrow + Badge + Name + Subtitle + Action */}
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                        {/* Teal Triangle Expand/Collapse button */}
                        <button
                          type="button"
                          onClick={() => toggleCollapse(group.id)}
                          className="text-[#008d91] hover:text-[#007275] p-1 rounded transition-transform cursor-pointer shrink-0"
                          title={isCollapsed ? 'Tampilkan Pos Keuangan' : 'Sembunyikan Pos Keuangan'}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={`w-4 h-4 fill-current transition-transform duration-200 ${
                              isCollapsed ? '-rotate-90' : 'rotate-0'
                            }`}
                          >
                            <path d="M12 17L4 9h16z" />
                          </svg>
                        </button>

                        {/* Parent Badge */}
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xs shrink-0 select-none overflow-hidden"
                          style={{ backgroundColor: group.iconBg || '#2D3748' }}
                        >
                          {group.logoUrl ? (
                            <img
                              src={group.logoUrl}
                              alt={group.namaPosPemasukan}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            group.iconLetter || group.namaPosPemasukan.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Title & Subtitle */}
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm sm:text-[15px] leading-snug">
                            {group.namaPosPemasukan}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5">
                            {group.subTitle || 'Pos Pemasukan'}
                          </span>
                        </div>
                      </div>

                      {/* Parent edit / delete menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === `parent-${group.id}` ? null : `parent-${group.id}`);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Menu Pos Pemasukan"
                        >
                          <MoreVertical className="w-5 h-5 stroke-[2]" />
                        </button>

                        {activeMenuId === `parent-${group.id}` && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-9 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditGroup(group);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Kelompok</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteGroup(group.id);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Hapus Pos Pemasukan</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Child Allocations (indented underneath, exactly matching screenshot) */}
                    {!isCollapsed && group.allocations && group.allocations.length > 0 && (
                      <div className="mt-4 space-y-3.5 pl-6 sm:pl-8">
                        {group.allocations.map((alloc) => (
                          <div
                            key={alloc.id}
                            className="flex items-center justify-between py-1 hover:bg-slate-50/50 rounded-xl px-2 transition-colors group/item"
                          >
                            {/* Left: Child Badge + Pos Keuangan Name & Subtitle */}
                            <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0 pr-4">
                              <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xs shrink-0 select-none"
                                style={{ backgroundColor: alloc.iconBg || '#2D3748' }}
                              >
                                {alloc.iconLetter || alloc.namaPosKeuangan.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-800 text-sm sm:text-[14.5px] leading-snug truncate">
                                  {alloc.namaPosKeuangan}
                                </span>
                                <span className="text-xs text-slate-400 mt-0.5">
                                  {alloc.subTitle || 'Pos YPPLN'}
                                </span>
                              </div>
                            </div>

                            {/* Middle 1: Persentase (e.g. 20%, 30%, 100%) */}
                            <div className="w-20 text-left sm:text-center text-slate-700 text-sm sm:text-[14.5px] font-medium shrink-0">
                              {alloc.persentase}%
                            </div>

                            {/* Middle 2: Keterangan ("-") */}
                            <div className="w-16 sm:w-24 text-center text-slate-400 text-sm sm:text-[14.5px] shrink-0">
                              {alloc.keterangan || '-'}
                            </div>

                            {/* Right: Red Three-Dots Action Menu */}
                            <div className="w-8 text-right relative shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === alloc.id ? null : alloc.id);
                                }}
                                className="text-[#e05d44] hover:text-[#c94b33] p-1.5 rounded-lg hover:bg-rose-50/60 transition-colors cursor-pointer"
                                title="Aksi Pos Keuangan"
                              >
                                <MoreVertical className="w-5 h-5 stroke-[2]" />
                              </button>

                              {/* Dropdown Menu for Child Allocation */}
                              {activeMenuId === alloc.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-9 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onEditGroup(group);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Ubah Alokasi</span>
                                  </button>
                                  {onDeleteAllocation && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        onDeleteAllocation(group.id, alloc.id);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                      <span>Hapus Baris</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Ubah Logo Pos Pemasukan */}
      <UbahLogoPosPemasukanModal
        isOpen={isChangeLogoModalOpen}
        onClose={() => setIsChangeLogoModalOpen(false)}
        groups={groups}
        currentConfig={effectiveCardLogo}
        onSave={handleSaveCardLogo}
      />
    </div>
  );
};
