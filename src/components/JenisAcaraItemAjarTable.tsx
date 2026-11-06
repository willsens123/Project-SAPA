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
import { JenisAcaraItemAjarItem } from '../jenisAcaraAjarData';

interface JenisAcaraItemAjarTableProps {
  items: JenisAcaraItemAjarItem[];
  onAddClick: () => void;
  onEditItem: (item: JenisAcaraItemAjarItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const JenisAcaraItemAjarTable: React.FC<JenisAcaraItemAjarTableProps> = ({
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
      it.namaJenisAcara.toLowerCase().includes(q) ||
      it.kode.toLowerCase().includes(q) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Top Toolbar matching exact design */}
      <div className="flex items-center justify-end gap-3 mb-6">
        {/* Toggle Search Bar */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jenis acara atau kode..."
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

          {/* Sliders / Filter Icon */}
          <button
            type="button"
            title="Filter lanjutan"
            onClick={() => onShowToast('Filter Jenis Acara')}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button matching Image */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007b7e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
      </div>

      {/* Main Table Container matching exact Image 2 design */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-600 text-xs sm:text-sm font-semibold">
                <th className="py-4 px-6 font-semibold">Jenis Acara</th>
                <th className="py-4 px-6 font-semibold">Kode</th>
                <th className="py-4 px-6 font-semibold text-center w-24"></th>
                <th className="py-4 px-6 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data Jenis Acara Item A-AJAR. Klik "+ Add" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Column 1: Jenis Acara (Badge with letter + Name + Subtitle) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xs shrink-0 select-none"
                          style={{ backgroundColor: item.iconBg || '#5A6D7C' }}
                        >
                          {item.iconLetter || item.namaJenisAcara.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm sm:text-[15px] leading-snug">
                            {item.namaJenisAcara}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5">
                            {item.keterangan || 'Jenis Acara'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Kode */}
                    <td className="py-4 px-6">
                      <span className="text-slate-600 text-sm font-medium">
                        {item.kode}
                      </span>
                    </td>

                    {/* Column 3: - */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-slate-400 text-sm font-medium">
                        {item.pos || '-'}
                      </span>
                    </td>

                    {/* Column 4: More Actions Menu with coral/orange 3-dots */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="text-[#e05d44] hover:text-[#c94b33] p-1.5 rounded-lg hover:bg-rose-50/60 transition-colors cursor-pointer"
                        title="Aksi Lainnya"
                      >
                        <MoreVertical className="w-5 h-5 stroke-[2]" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-6 top-12 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditItem(item);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
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
                            className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
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
