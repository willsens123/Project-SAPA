import React, { useState } from 'react';
import { EyeOff, Search, SlidersHorizontal, Plus, MoreVertical, X, Edit2, Trash2 } from 'lucide-react';
import { JenisViaAjarItem } from '../viaAjarData';

interface JenisViaTransaksiAjarTableProps {
  items: JenisViaAjarItem[];
  onAddClick: () => void;
  onEditItem: (item: JenisViaAjarItem) => void;
  onDeleteItem: (id: string) => void;
}

export const JenisViaTransaksiAjarTable: React.FC<JenisViaTransaksiAjarTableProps> = ({
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
    return it.namaJenisVia.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Action Toolbar matching Image 2: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3.5 mb-5">
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Jenis Via..."
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

        {/* Add Button matching Image 2 */}
        <button
          id="btn-add-jenis-via-ajar"
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Table Container matching exact Image 2 design */}
      <div className="bg-transparent w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold">
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">Jenis Via</th>
                <th className="py-3.5 px-3 sm:px-4 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data Jenis Via Transaksi A-AJAR. Klik "+ Add" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Column 1: Jenis Via */}
                    <td className="py-3.5 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm font-normal">
                      {item.namaJenisVia}
                    </td>

                    {/* Column 2: 3-dots action menu */}
                    <td className="py-3.5 px-3 sm:px-4 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Menu Aksi"
                        aria-label="Menu Aksi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-4 top-10 z-30 w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditItem(item);
                            }}
                            className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
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
                            className="w-full text-left px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
