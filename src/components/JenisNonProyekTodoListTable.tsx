import React, { useState, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  RotateCcw,
} from 'lucide-react';
import { JenisNonProyekItem } from '../types';
import { AddEditJenisNonProyekModal } from './AddEditJenisNonProyekModal';

interface JenisNonProyekTodoListTableProps {
  items: JenisNonProyekItem[];
  onSaveItem: (item: JenisNonProyekItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const JenisNonProyekTodoListTable: React.FC<JenisNonProyekTodoListTableProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showKeterangan, setShowKeterangan] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);

  // Filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JenisNonProyekItem | null>(null);

  // Close menus on click outside
  React.useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
      setIsFilterOpen(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q))
      );
    });

    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.nama.localeCompare(a.nama));
    }

    return result;
  }, [items, searchQuery, sortOrder]);

  // Carousel navigation
  const handlePrevCarousel = () => {
    if (items.length <= 1) return;
    setActiveCarouselIdx((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
  };

  const handleNextCarousel = () => {
    if (items.length <= 1) return;
    setActiveCarouselIdx((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
  };

  const activeCarouselItem = items[activeCarouselIdx] || items[0] || null;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: JenisNonProyekItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    onDeleteItem(id);
    if (onShowToast) {
      onShowToast(`Jenis Non-Proyek "${nama}" berhasil dihapus`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6 px-4 sm:px-8 bg-white min-h-screen">
      {/* 1. Top Header Bar: Title, Carousel Navigation, Clock & 3-Dots matching image.png */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        {/* Left: Heading & Carousel Navigation */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight select-none">
            <div>Jenis Non-Proyek To-do</div>
            <div>List</div>
          </div>

          {/* Carousel navigation pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevCarousel}
              className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Boy cartoon character avatar */}
            <div className="w-9 h-9 rounded-full bg-[#fbc02d] border border-amber-300 shadow-xs flex items-center justify-center overflow-hidden shrink-0 select-none">
              <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none">
                <circle cx="18" cy="18" r="17" fill="#fbc02d" />
                <path
                  d="M7 16C6 11 11 6 18 6C24 6 29 10 29 16C30 18 30 20 28 21C26 22 24 22 23 20C21 16 19 14 16 14C13 14 11 16 10 19C9 21 8 20 7 16Z"
                  fill="#5c3818"
                />
                <path
                  d="M10 18C10 23.5 13.5 27 18 27C22.5 27 26 23.5 26 18C26 17 25 15 24 15C20 15 16 15 12 15C11 15 10 17 10 18Z"
                  fill="#fed7aa"
                />
                <path d="M9 16C12 14 24 14 27 16" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                <circle cx="14" cy="19" r="1.5" fill="#1e293b" />
                <circle cx="22" cy="19" r="1.5" fill="#1e293b" />
                <path
                  d="M14 23C16 25 20 25 22 23"
                  stroke="#1e293b"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="white"
                />
              </svg>
            </div>

            {/* Teal speech bubble / capsule bar */}
            <div className="relative bg-[#008d91] text-white text-xs font-semibold px-4 py-1.5 rounded-2xl flex items-center min-w-[200px] sm:min-w-[280px] h-8 shadow-xs select-none">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-[#008d91] absolute -left-[6px] top-1/2 -translate-y-1/2"></div>
              <span className="truncate">
                {activeCarouselItem ? `Kategori: ${activeCarouselItem.nama}` : 'Master Jenis Non-Proyek To-do List'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextCarousel}
              className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Digital clock & 3-dots */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-right select-none">
            <div className="text-2xl font-medium text-[#008d91] tracking-tight leading-none">
              09:59
            </div>
            <div className="text-[11px] font-medium text-[#008d91] mt-0.5">
              Senin, 15 November 2021
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Opsi Menu"
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* 2. Toolbar matching image.png (EyeOff, Search, Filter, + Add) */}
      <div className="flex items-center justify-end gap-2.5 py-4 px-1">
        {/* Toggle Keterangan Column */}
        <button
          type="button"
          onClick={() => setShowKeterangan(!showKeterangan)}
          title={showKeterangan ? 'Sembunyikan Kolom Keterangan' : 'Tampilkan Kolom Keterangan'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            showKeterangan ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {showKeterangan ? <Eye className="w-5 h-5 stroke-[1.8]" /> : <EyeOff className="w-5 h-5 stroke-[1.8]" />}
        </button>

        {/* Search Toggle & Input */}
        {showSearchInput ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs text-sm animate-in fade-in zoom-in-95 duration-100">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jenis non-proyek..."
              autoFocus
              className="outline-none text-slate-700 text-xs sm:text-sm w-36 sm:w-52 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => {
                setShowSearchInput(false);
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSearchInput(true)}
            title="Pencarian"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        {/* Filter Sliders Button with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterOpen(!isFilterOpen);
            }}
            title="Filter & Urutan"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isFilterOpen || sortOrder !== 'default'
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {isFilterOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Urutkan Berdasarkan
              </div>
              <button
                type="button"
                onClick={() => {
                  setSortOrder('default');
                  setIsFilterOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  sortOrder === 'default' ? 'text-[#008d91] font-semibold' : 'text-slate-700'
                }`}
              >
                <span>Standar</span>
                {sortOrder === 'default' && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOrder('asc');
                  setIsFilterOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  sortOrder === 'asc' ? 'text-[#008d91] font-semibold' : 'text-slate-700'
                }`}
              >
                <span>Nama (A - Z)</span>
                {sortOrder === 'asc' && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOrder('desc');
                  setIsFilterOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  sortOrder === 'desc' ? 'text-[#008d91] font-semibold' : 'text-slate-700'
                }`}
              >
                <span>Nama (Z - A)</span>
                {sortOrder === 'desc' && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
              </button>
            </div>
          )}
        </div>

        {/* + Add Button matching image.png */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-[#008d91] hover:bg-[#007b7e] active:bg-[#00696b] text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer select-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add</span>
        </button>
      </div>

      {/* 3. Table matching image.png */}
      <div className="w-full mt-2 overflow-x-auto">
        <div className="min-w-[620px]">
          {/* Table Header */}
          <div className="flex items-center pb-3 border-b border-slate-300 text-[15px] font-bold text-slate-700">
            <div className="w-72 sm:w-80 pl-2 shrink-0">Jenis Non-Proyek</div>
            <div className="w-44 sm:w-52 pl-3 shrink-0">Warna Kartu</div>
            {showKeterangan && <div className="flex-1 pl-4 min-w-[160px]">Keterangan</div>}
            <div className="w-10 shrink-0"></div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-slate-100 text-sm sm:text-base text-slate-700">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                {searchQuery ? 'Tidak ada jenis non-proyek yang sesuai pencarian' : 'Belum ada data jenis non-proyek'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center py-4 hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Kolom 1: Jenis Non-Proyek */}
                  <div className="w-72 sm:w-80 pl-2 font-normal text-slate-700 shrink-0">
                    {item.nama}
                  </div>

                  {/* Kolom 2: Warna Kartu (Solid color circle matching image.png) */}
                  <div className="w-44 sm:w-52 pl-3 shrink-0 flex items-center">
                    <span
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-2xs inline-block transition-transform group-hover:scale-105"
                      style={{ backgroundColor: item.warnaKartu || '#9fa8da' }}
                      title={`Kode Warna: ${item.warnaKartu || '#9fa8da'}`}
                    />
                  </div>

                  {/* Kolom 3: Keterangan (Opsional) */}
                  {showKeterangan && (
                    <div className="flex-1 pl-4 text-xs sm:text-sm text-slate-500 min-w-[160px]">
                      {item.keterangan || '-'}
                    </div>
                  )}

                  {/* Kolom 4: Actions (3 Vertical Dots) */}
                  <div className="w-10 relative flex justify-end pr-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
                      title="Menu Aksi"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Dropdown Menu */}
                    {activeMenuId === item.id && (
                      <div
                        className="absolute right-0 top-7 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            handleOpenEditModal(item);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            handleDelete(item.id, item.nama);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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
      </div>

      {/* Add / Edit Modal */}
      <AddEditJenisNonProyekModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveItem}
        editingItem={editingItem}
      />
    </div>
  );
};
