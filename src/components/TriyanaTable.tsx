import React, { useState } from 'react';
import { EyeOff, Search, SlidersHorizontal, Plus, MoreVertical, X, Edit2, Trash2 } from 'lucide-react';
import { TriyanaItem } from '../types';

interface TriyanaTableProps {
  items: TriyanaItem[];
  onAddClick: () => void;
  onEditItem: (item: TriyanaItem) => void;
  onDeleteItem: (id: string) => void;
}

export const TriyanaTable: React.FC<TriyanaTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
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
      it.triyana.toLowerCase().includes(q) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full">
      {/* Top Toolbar matching Image 2 */}
      <div className="flex items-center justify-end gap-3.5 mb-4">
        {/* Toggle Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari triyana..."
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
          className="bg-[#05828e] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#046c76] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[#475569] text-sm font-semibold">
              <th className="py-3.5 px-6 font-bold text-slate-700 w-1/3">Triyana</th>
              <th className="py-3.5 px-6 font-bold text-slate-700">Keterangan</th>
              <th className="py-3.5 px-4 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-400">
                  Tidak ada data Triyana
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group text-slate-700"
                  >
                    {/* Triyana */}
                    <td className="py-3 px-6 font-medium text-slate-800">
                      {item.triyana}
                    </td>

                    {/* Keterangan */}
                    <td className="py-3 px-6 text-slate-600">
                      {item.keterangan || '-'}
                    </td>

                    {/* 3-dots Menu */}
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
                            className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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
