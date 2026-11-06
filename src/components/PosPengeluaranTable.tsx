import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import {
  PosPengeluaranGroup,
  PosPengeluaranAllocation,
  PosPengeluaranCardLogoConfig,
  getPosPengeluaranCardLogoFromStorage,
  savePosPengeluaranCardLogoToStorage,
} from '../posPengeluaranData';
import { PosPengeluaranStatCard } from './PosPengeluaranStatCard';
import { UbahLogoPosPengeluaranModal } from './UbahLogoPosPengeluaranModal';

interface PosPengeluaranTableProps {
  groups: PosPengeluaranGroup[];
  cardLogoConfig?: PosPengeluaranCardLogoConfig;
  onUpdateCardLogo?: (config: PosPengeluaranCardLogoConfig) => void;
  onAddClick: () => void;
  onEditGroup: (group: PosPengeluaranGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditAllocation?: (group: PosPengeluaranGroup, alloc: PosPengeluaranAllocation) => void;
  onDeleteAllocation?: (groupId: string, allocId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const PosPengeluaranTable: React.FC<PosPengeluaranTableProps> = ({
  groups,
  cardLogoConfig,
  onUpdateCardLogo,
  onAddClick,
  onEditGroup,
  onDeleteGroup,
  onShowToast = (_msg: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [localCardLogo, setLocalCardLogo] = useState<PosPengeluaranCardLogoConfig>(() =>
    getPosPengeluaranCardLogoFromStorage()
  );
  const [isChangeLogoModalOpen, setIsChangeLogoModalOpen] = useState(false);

  const effectiveCardLogo = cardLogoConfig || localCardLogo;

  const handleSaveCardLogo = (newCfg: PosPengeluaranCardLogoConfig) => {
    setLocalCardLogo(newCfg);
    savePosPengeluaranCardLogoToStorage(newCfg);
    if (onUpdateCardLogo) {
      onUpdateCardLogo(newCfg);
    }
    onShowToast('Logo Pos Pengeluaran berhasil diperbarui');
  };

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
      g.namaPosPengeluaran.toLowerCase().includes(q) ||
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
    <div className="w-full space-y-4">
      {/* Top Stat Card */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PosPengeluaranStatCard
          count={groups.length}
          groups={groups}
          cardLogoConfig={effectiveCardLogo}
          onLogoClick={() => setIsChangeLogoModalOpen(true)}
        />

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Pos Pengeluaran..."
                className="w-56 sm:w-72 h-10 pl-9 pr-8 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91] shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs cursor-pointer"
              title="Cari"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs cursor-pointer"
            title="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onAddClick}
            className="h-10 px-4 bg-[#008d91] hover:bg-[#007b7e] active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center"></th>
                <th className="py-3 px-4">Nama Pos Pengeluaran</th>
                <th className="py-3 px-4 w-32 text-center">Persentase</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Belum ada data Pos Pengeluaran. Klik tombol <strong>+ Add</strong> untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const isCollapsed = collapsedGroupIds.has(group.id);
                  const totalPercent = group.allocations.reduce(
                    (sum, a) => sum + (Number(a.persentase) || 0),
                    0
                  );

                  return (
                    <React.Fragment key={group.id}>
                      {/* Parent Row (Pos Pengeluaran Group) */}
                      <tr className="hover:bg-slate-50/80 transition-colors font-medium text-slate-800 bg-slate-50/30">
                        {/* Collapse toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleCollapse(group.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer transition-colors"
                            title={isCollapsed ? 'Buka alokasi' : 'Tutup alokasi'}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Nama Pos Pengeluaran */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow-xs"
                              style={{ backgroundColor: group.iconBg || '#2D3748' }}
                            >
                              {group.logoUrl ? (
                                <img
                                  src={group.logoUrl}
                                  alt={group.namaPosPengeluaran}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                group.iconLetter ||
                                group.namaPosPengeluaran.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">
                                {group.namaPosPengeluaran}
                              </p>
                              <p className="text-[11px] text-slate-400 font-normal">
                                {group.subTitle || 'Pos Pengeluaran'} &bull; {group.allocations.length} Alokasi
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Persentase Total */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block font-bold px-2 py-0.5 rounded-full text-xs ${
                              totalPercent === 100
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {totalPercent}%
                          </span>
                        </td>

                        {/* Keterangan */}
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          -
                        </td>

                        {/* Action Menu */}
                        <td className="py-3 px-4 text-center relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === group.id ? null : group.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === group.id && (
                            <div
                              className="absolute right-4 top-10 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onEditGroup(group);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteGroup(group.id);
                                }}
                                className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Child Rows: Allocations to Pos Keuangan */}
                      {!isCollapsed &&
                        group.allocations.map((alloc) => (
                          <tr
                            key={alloc.id}
                            className="hover:bg-slate-50/50 transition-colors text-xs text-slate-600 bg-white"
                          >
                            <td></td>
                            <td className="py-2.5 px-4 pl-12">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                                  style={{ backgroundColor: alloc.iconBg || '#B0B5B9' }}
                                >
                                  {alloc.iconLetter || alloc.namaPosKeuangan.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-800">
                                    {alloc.namaPosKeuangan}
                                  </span>
                                  {alloc.subTitle && (
                                    <span className="text-[10px] text-slate-400 ml-1.5">
                                      ({alloc.subTitle})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-center font-bold text-[#008d91]">
                              {alloc.persentase}%
                            </td>
                            <td className="py-2.5 px-4 text-slate-400">
                              {alloc.keterangan || '-'}
                            </td>
                            <td></td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ubah Logo Modal */}
      <UbahLogoPosPengeluaranModal
        isOpen={isChangeLogoModalOpen}
        onClose={() => setIsChangeLogoModalOpen(false)}
        onSave={handleSaveCardLogo}
        currentConfig={effectiveCardLogo}
        groups={groups}
      />
    </div>
  );
};
