import React, { useState, useEffect } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { JenisPerubahanDharmaPatronItem } from '../types';
import { AddEditJenisPerubahanDPRModal } from './AddEditJenisPerubahanDPRModal';

interface JenisPerubahanDharmaPatronTableProps {
  items: JenisPerubahanDharmaPatronItem[];
  onSaveItem: (item: JenisPerubahanDharmaPatronItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const JenisPerubahanDharmaPatronTable: React.FC<JenisPerubahanDharmaPatronTableProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isEyeOff, setIsEyeOff] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JenisPerubahanDharmaPatronItem | null>(null);

  // Row dropdown action menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    return it.nama.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: JenisPerubahanDharmaPatronItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, nama: string) => {
    onDeleteItem(id);
    setActiveMenuId(null);
    if (onShowToast) {
      onShowToast(`Jenis perubahan "${nama}" berhasil dihapus`);
    }
  };

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Top Action Toolbar matching image.png exactly */}
      <div className="flex items-center justify-end gap-3 mb-8 sm:mb-12">
        {/* Toggle Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="input-search-jenis-perubahan"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jenis perubahan..."
              autoFocus
              className="text-xs sm:text-sm text-slate-700 outline-none w-44 sm:w-60"
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
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            {/* EyeOff Icon button matching image.png */}
            <button
              id="btn-eye-toggle-jenis-perubahan"
              type="button"
              onClick={() => {
                setIsEyeOff(!isEyeOff);
                if (onShowToast) {
                  onShowToast(isEyeOff ? 'Mode tampilan penuh aktif' : 'Mode tampilan disederhanakan');
                }
              }}
              className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title={isEyeOff ? 'Tampilkan' : 'Sembunyikan'}
            >
              {isEyeOff ? (
                <Eye className="w-5 h-5 stroke-[1.8] text-[#008d91]" />
              ) : (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            {/* Search Icon button matching image.png */}
            <button
              id="btn-search-jenis-perubahan"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Cari Jenis Perubahan"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* SlidersHorizontal (Filter) Icon button matching image.png */}
            <button
              id="btn-filter-jenis-perubahan"
              type="button"
              onClick={() => {
                setIsFilterActive(!isFilterActive);
                if (onShowToast) {
                  onShowToast(isFilterActive ? 'Filter dinonaktifkan' : 'Filter aktif');
                }
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isFilterActive ? 'text-[#008d91]' : 'hover:text-slate-600'
              }`}
              title="Filter"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        )}

        {/* + Add Button matching image.png */}
        <button
          id="btn-add-jenis-perubahan"
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Table Section matching image.png exactly */}
      <div className="w-full max-w-xl">
        {/* Table Header: "Jenis Perubahan" with underline */}
        <div className="pb-3 border-b border-slate-300">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            Jenis Perubahan
          </h2>
        </div>

        {/* Table Rows matching image.png */}
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Tidak ada data jenis perubahan
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 group hover:bg-slate-50/70 px-2 rounded-xl transition-colors relative"
              >
                <span className="text-sm sm:text-base text-slate-700 font-normal">
                  {item.nama}
                </span>

                {/* Vertical Three Dots ⋮ Menu */}
                <div className="relative">
                  <button
                    id={`btn-menu-${item.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === item.id ? null : item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Menu Opsi"
                  >
                    <MoreVertical className="w-4 h-4 stroke-[2]" />
                  </button>

                  {/* Dropdown Options */}
                  {activeMenuId === item.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 z-30 w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.nama)}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddEditJenisPerubahanDPRModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(savedItem) => {
          onSaveItem(savedItem);
          if (onShowToast) {
            onShowToast(
              editingItem
                ? `Jenis perubahan "${savedItem.nama}" berhasil diperbarui`
                : `Jenis perubahan "${savedItem.nama}" berhasil ditambahkan`
            );
          }
        }}
      />
    </div>
  );
};
