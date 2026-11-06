import React, { useState } from 'react';
import { EyeOff, Search, SlidersHorizontal, Plus, MoreVertical, X, Edit2, Trash2 } from 'lucide-react';
import { DivisiItem } from '../types';
import { DivisionRevenueBreakdown } from '../utils/divisionRevenue';

interface DivisiTableProps {
  items: DivisiItem[];
  onAddClick: () => void;
  onEditItem: (item: DivisiItem) => void;
  onDeleteItem: (id: string) => void;
  connectedCounts?: Record<string, { projects: number; timelineTasks: number; employees: number; pengeluaran: number }>;
  divisionRevenues?: Record<string, DivisionRevenueBreakdown>;
}

export const DivisiTable: React.FC<DivisiTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
  connectedCounts = {},
  divisionRevenues = {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close 3-dots dropdown when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.namaDivisi.toLowerCase().includes(q) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full">
      {/* Top Toolbar matching user screenshot */}
      <div className="flex items-center justify-end gap-3.5 mb-4">
        {/* Toggle Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari divisi..."
              autoFocus
              className="text-xs text-slate-700 outline-none w-44 sm:w-64"
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
            title="Sembunyikan kolom"
            aria-label="Sembunyikan kolom"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        {!isSearchOpen && (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Cari"
            aria-label="Cari"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        <button
          type="button"
          title="Filter"
          aria-label="Filter"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          type="button"
          onClick={onAddClick}
          className="bg-[#008d91] hover:bg-[#007b7f] text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Table Container matching user screenshot */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[#475569] text-sm font-semibold">
              <th className="py-3.5 px-6 font-bold text-slate-700 w-1/4 sm:w-1/5">Divisi</th>
              <th className="py-3.5 px-6 font-bold text-slate-700">Keterangan</th>
              <th className="py-3.5 px-6 font-bold text-slate-700 text-right">Pendapatan Divisi</th>
              <th className="py-3.5 px-4 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  Tidak ada data Divisi
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const counts = connectedCounts[item.namaDivisi.toUpperCase()];
                const totalConnected = counts
                  ? counts.projects + counts.timelineTasks + counts.employees + counts.pengeluaran
                  : 0;
                const rev = divisionRevenues[item.namaDivisi.toUpperCase()];
                const totalRev = rev ? rev.totalRevenue : 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group text-slate-700"
                  >
                    {/* Divisi Column */}
                    <td className="py-3 px-6 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{item.namaDivisi}</span>
                        {totalConnected > 0 && (
                          <span
                            title={`Terkoneksi dengan: ${counts?.projects || 0} Proyek, ${counts?.timelineTasks || 0} Timeline Task, ${counts?.employees || 0} Karyawan, ${counts?.pengeluaran || 0} Pengeluaran`}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-50 text-[#008d91] opacity-75 group-hover:opacity-100 transition-opacity"
                          >
                            {totalConnected} data
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Keterangan Column */}
                    <td className="py-3 px-6 text-slate-600">
                      {item.keterangan || '-'}
                    </td>

                    {/* Pendapatan Divisi Column */}
                    <td className="py-3 px-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold text-sm ${totalRev > 0 ? 'text-[#008d91]' : 'text-slate-700'}`}>
                          Rp {totalRev.toLocaleString('id-ID')}
                        </span>
                        {totalRev > 0 ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            {rev!.fromSalur > 0 && (
                              <span title="Pemasukan dari Item S-SALUR" className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                                S: Rp{(rev!.fromSalur / 1000000).toFixed(1)}jt
                              </span>
                            )}
                            {rev!.fromDonasi > 0 && (
                              <span title="Pemasukan dari Item D-DONASI" className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                                D: Rp{(rev!.fromDonasi / 1000000).toFixed(1)}jt
                              </span>
                            )}
                            {rev!.fromAjar > 0 && (
                              <span title="Pemasukan dari Item A-AJAR" className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                                A: Rp{(rev!.fromAjar / 1000000).toFixed(1)}jt
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Belum ada pemasukan</span>
                        )}
                      </div>
                    </td>

                    {/* 3-dots Menu Column */}
                    <td className="py-3 px-4 text-center relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-6 top-8 z-50 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 animate-in fade-in duration-100"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditItem(item);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteItem(item.id);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
