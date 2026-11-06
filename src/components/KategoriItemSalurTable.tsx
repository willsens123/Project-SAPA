import React, { useState } from 'react';
import { EyeOff, Search, SlidersHorizontal, Plus, MoreVertical, X, Edit2, Trash2, Tag } from 'lucide-react';
import { KategoriItemSalurItem, JenisKategoriItemSalurItem } from '../types';

interface KategoriItemSalurTableProps {
  items: KategoriItemSalurItem[];
  jenisKategoriList?: JenisKategoriItemSalurItem[];
  onAddClick: () => void;
  onEditItem: (item: KategoriItemSalurItem) => void;
  onDeleteItem: (id: string) => void;
}

export const KategoriItemSalurTable: React.FC<KategoriItemSalurTableProps> = ({
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
      it.namaKategori.toLowerCase().includes(q) ||
      it.namaJenisKategori.toLowerCase().includes(q) ||
      (it.kode && it.kode.toLowerCase().includes(q)) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        {/* Left Stat Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3.5 flex items-center justify-between w-full sm:w-64 shadow-2xs">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium tracking-tight">Total Kategori</span>
            <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">
              {items.length} kategori
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#008d91] flex items-center justify-center text-white shadow-xs shrink-0">
            <Tag className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {/* Right Toolbar: EyeOff, Search, Sliders, + Add */}
        <div className="flex items-center justify-end gap-3.5 self-end sm:self-center">
          {/* Toggle Search Bar */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kategori atau jenis..."
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

          {/* Add Button */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs sm:text-sm font-semibold">
                <th className="py-4 px-6">Kategori Item</th>
                <th className="py-4 px-6">Jenis Kategori</th>
                <th className="py-4 px-6">Kode</th>
                <th className="py-4 px-6 text-center w-28">Primary?</th>
                <th className="py-4 px-6 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data Kategori Item. Klik "+ Add" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Column 1: Kategori Item */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm sm:text-base tracking-tight">
                          {item.namaKategori}
                        </span>
                        {item.keterangan && (
                          <span className="text-xs text-slate-400 mt-0.5">
                            {item.keterangan}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 2: Jenis Kategori */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {item.namaJenisKategori}
                      </span>
                    </td>

                    {/* Column 3: Kode */}
                    <td className="py-4 px-6 text-slate-700 font-medium text-sm">
                      {item.kode || '-'}
                    </td>

                    {/* Column 4: Primary? */}
                    <td className="py-4 px-6 text-center">
                      {item.isPrimary ? (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#008d91] text-white text-[11px] font-semibold">
                          Primary
                        </span>
                      ) : (
                        <span className="text-slate-400 text-base font-normal">
                          -
                        </span>
                      )}
                    </td>

                    {/* Column 5: 3-dots action menu */}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
