import React, { useState } from 'react';
import { EyeOff, Search, SlidersHorizontal, Plus, MoreVertical, X, Edit2, Trash2, ShoppingCart } from 'lucide-react';
import { JenisItemSalurItem } from '../types';

interface JenisItemSalurTableProps {
  items: JenisItemSalurItem[];
  onAddClick: () => void;
  onEditItem: (item: JenisItemSalurItem) => void;
  onDeleteItem: (id: string) => void;
}

export const JenisItemSalurTable: React.FC<JenisItemSalurTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
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

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.namaJenis.toLowerCase().includes(q) ||
      it.kode.toLowerCase().includes(q) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full">
      {/* Top Toolbar: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3.5 mb-5">
          {/* Toggle Search Bar */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jenis item atau kode..."
                autoFocus
                className="text-xs sm:text-sm text-slate-700 outline-none w-44 sm:w-64"
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
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors cursor-pointer"
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
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}

          <button
            type="button"
            title="Filter lanjutan"
            aria-label="Filter lanjutan"
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Add Button matching Image 1 */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

      {/* Main Table Container matching exact Image 1 design */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs sm:text-sm font-semibold">
                <th className="py-4 px-6">Jenis Item</th>
                <th className="py-4 px-6">Kode</th>
                <th className="py-4 px-6 text-center w-24"></th>
                <th className="py-4 px-6 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data Jenis Item. Klik "+ Add" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Column 1: Rounded icon + Title (e.g. Buku) + Subtitle (Jenis Item) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xs shrink-0 select-none"
                            style={{ backgroundColor: item.iconBg || '#008d91' }}
                          >
                            {item.iconLetter || item.namaJenis.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-base sm:text-lg tracking-tight">
                              {item.namaJenis}
                            </span>
                            <span className="text-xs text-slate-400 font-normal mt-0.5">
                              Jenis Item
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Kode */}
                      <td className="py-4 px-6 text-slate-700 font-medium text-sm sm:text-base">
                        {item.kode}
                      </td>

                      {/* Column 3: Dash '-' */}
                      <td className="py-4 px-6 text-center text-slate-400 text-base font-normal">
                        -
                      </td>

                      {/* Column 4: 3-dots action menu */}
                      <td className="py-4 px-6 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Menu Aksi"
                          aria-label="Menu Aksi"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-6 top-12 z-30 w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditItem(item);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteItem(item.id);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
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
    </div>
  );
};
