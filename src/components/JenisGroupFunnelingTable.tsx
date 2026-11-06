import React, { useState } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { JenisGroupFunnelingItem } from '../funnelingData';

interface JenisGroupFunnelingTableProps {
  items: JenisGroupFunnelingItem[];
  onAddClick: () => void;
  onEditItem: (item: JenisGroupFunnelingItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleAktif: (id: string) => void;
  onToggleUniqueId: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const JenisGroupFunnelingTable: React.FC<JenisGroupFunnelingTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onToggleAktif,
  onToggleUniqueId,
  onShowToast = (_msg: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showKeterangan, setShowKeterangan] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'aktif' | 'tidak_aktif' | 'unique_yes' | 'unique_no'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
      setIsFilterDropdownOpen(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const filteredItems = items.filter((it) => {
    // Filter mode
    if (filterMode === 'aktif' && !it.aktif) return false;
    if (filterMode === 'tidak_aktif' && it.aktif) return false;
    if (filterMode === 'unique_yes' && !it.uniqueId) return false;
    if (filterMode === 'unique_no' && it.uniqueId) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.namaJenisGroup.toLowerCase().includes(q) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Action Toolbar matching design language: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3.5 mb-5 px-1">
        {/* Toggle Keterangan Column */}
        <button
          type="button"
          onClick={() => {
            setShowKeterangan(!showKeterangan);
            onShowToast(showKeterangan ? 'Kolom keterangan disembunyikan' : 'Kolom keterangan ditampilkan');
          }}
          title={showKeterangan ? 'Sembunyikan Kolom Keterangan' : 'Tampilkan Kolom Keterangan'}
          aria-label={showKeterangan ? 'Sembunyikan Kolom Keterangan' : 'Tampilkan Kolom Keterangan'}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors cursor-pointer"
        >
          {showKeterangan ? (
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          ) : (
            <Eye className="w-5 h-5 stroke-[1.8]" />
          )}
        </button>

        {/* Search */}
        <div className="relative flex items-center">
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Jenis Group..."
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
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              aria-label="Cari"
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}
        </div>

        {/* SlidersHorizontal / Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterDropdownOpen(!isFilterDropdownOpen);
            }}
            title="Filter Status"
            aria-label="Filter Status"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              filterMode !== 'all'
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Filter Dropdown */}
          {isFilterDropdownOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-11 z-30 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Filter Status
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('all');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Semua Data</span>
                {filterMode === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('aktif');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                  filterMode === 'aktif'
                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Hanya Aktif</span>
                {filterMode === 'aktif' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('tidak_aktif');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                  filterMode === 'tidak_aktif'
                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Hanya Tidak Aktif</span>
                {filterMode === 'tidak_aktif' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('unique_yes');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                  filterMode === 'unique_yes'
                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Unique ID: Yes</span>
                {filterMode === 'unique_yes' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('unique_no');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                  filterMode === 'unique_no'
                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Unique ID: No</span>
                {filterMode === 'unique_no' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          id="btn-add-jenis-group-funneling"
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Table Container matching existing master tables */}
      <div className="bg-transparent w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold">
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">
                  Jenis Group Funneling
                </th>
                <th className="py-3.5 px-3 sm:px-4 text-center font-semibold text-slate-800 w-32">
                  Aktif/Tidak
                </th>
                <th className="py-3.5 px-3 sm:px-4 text-center font-semibold text-slate-800 w-32">
                  Unique ID?
                </th>
                {showKeterangan && (
                  <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">
                    Keterangan
                  </th>
                )}
                <th className="py-3.5 px-3 sm:px-4 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={showKeterangan ? 5 : 4}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    Tidak ada data Jenis Group Funneling. Klik "+ Add" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Column 1: Nama Jenis Group */}
                    <td className="py-3.5 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm font-semibold">
                      {item.namaJenisGroup}
                    </td>

                    {/* Column 2: Aktif / Tidak (interactive toggle pill badge) */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          onToggleAktif(item.id);
                          onShowToast(
                            item.aktif
                              ? `Jenis "${item.namaJenisGroup}" dinonaktifkan (data tidak muncul di List Group Funneling)`
                              : `Jenis "${item.namaJenisGroup}" diaktifkan`
                          );
                        }}
                        title="Klik untuk ubah status aktif/tidak"
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-all shadow-2xs ${
                          item.aktif
                            ? 'bg-[#008d91] hover:bg-[#05828e] text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                        }`}
                      >
                        <span>{item.aktif ? 'Aktif' : 'Tidak Aktif'}</span>
                      </button>
                    </td>

                    {/* Column 3: Unique ID? (interactive toggle pill badge) */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          onToggleUniqueId(item.id);
                          onShowToast(
                            item.uniqueId
                              ? `Unique ID untuk "${item.namaJenisGroup}" dimatikan`
                              : `Unique ID untuk "${item.namaJenisGroup}" diaktifkan (Identitas ID hanya boleh 1x)`
                          );
                        }}
                        title="Klik untuk ubah status Unique ID"
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-1 rounded-full cursor-pointer transition-all shadow-2xs ${
                          item.uniqueId
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                        }`}
                      >
                        <span>{item.uniqueId ? 'Yes' : 'No'}</span>
                      </button>
                    </td>

                    {/* Column 4: Keterangan (optional) */}
                    {showKeterangan && (
                      <td className="py-3.5 px-3 sm:px-4 text-slate-600 text-xs sm:text-sm font-normal">
                        {item.keterangan || '-'}
                      </td>
                    )}

                    {/* Column 5: 3-dots action menu */}
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
