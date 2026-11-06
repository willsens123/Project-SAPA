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
} from 'lucide-react';
import { PengisiAcaraItemAjarItem } from '../pengisiAcaraAjarData';

interface PengisiAcaraItemAjarTableProps {
  items: PengisiAcaraItemAjarItem[];
  onAddClick: () => void;
  onEditItem: (item: PengisiAcaraItemAjarItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const PengisiAcaraItemAjarTable: React.FC<PengisiAcaraItemAjarTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
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

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.namaPengisiAcara.toLowerCase().includes(q) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Top Toolbar matching exact design in uploaded image */}
      <div className="flex items-center justify-end gap-3 mb-6">
        {/* Toggle Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengisi acara..."
              autoFocus
              className="text-xs sm:text-sm text-slate-700 outline-none w-44 sm:w-60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Cari"
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        {/* Eye Off Icon */}
        <button
          type="button"
          title="Sembunyikan Kolom"
          onClick={() => onShowToast('Mode privasi tampilan')}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Filter Sliders Icon */}
        <button
          type="button"
          title="Filter"
          onClick={() => onShowToast('Filter pengisi acara')}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* "+ Add" Button in Teal matching user's image */}
        <button
          id="btn-add-pengisi-acara-ajar"
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007b7e] text-white text-xs sm:text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-800 text-sm font-bold">
                <th className="py-4 px-6 w-1/2">Pengisi Acara</th>
                <th className="py-4 px-6 w-5/12">Keterangan</th>
                <th className="py-4 px-6 w-12 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400 text-sm">
                    {searchQuery
                      ? 'Tidak ada pengisi acara yang sesuai dengan pencarian.'
                      : 'Belum ada data Pengisi Acara Item A-AJAR.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Column 1: Pengisi Acara */}
                    <td className="py-4 px-6 text-slate-700 font-normal">
                      {item.namaPengisiAcara}
                    </td>

                    {/* Column 2: Keterangan */}
                    <td className="py-4 px-6 text-slate-500 font-normal">
                      {item.keterangan || '-'}
                    </td>

                    {/* Column 3: Actions Menu */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Opsi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-6 top-10 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditItem(item);
                            }}
                            className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
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
                            className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
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
