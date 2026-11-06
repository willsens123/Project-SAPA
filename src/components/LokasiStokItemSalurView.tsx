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
  Boxes,
  MapPin,
  Check,
  ArrowRight,
} from 'lucide-react';
import {
  LokasiStokItemSalur,
  getStoredLokasiStokSalur,
  addLokasiStokSalur,
  updateLokasiStokSalur,
  deleteLokasiStokSalur,
  getStoredGudangSalurData,
} from '../stokSalurData';

interface LokasiStokItemSalurViewProps {
  onShowToast: (message: string) => void;
  onNavigateToStokItemSalur?: (selectedGudang?: string) => void;
}

export const LokasiStokItemSalurView: React.FC<LokasiStokItemSalurViewProps> = ({
  onShowToast,
  onNavigateToStokItemSalur,
}) => {
  const [locations, setLocations] = useState<LokasiStokItemSalur[]>(() =>
    getStoredLokasiStokSalur()
  );

  // Toolbar states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJenisFilter, setSelectedJenisFilter] = useState<string>('all');

  // Menu popup state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states (Add & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LokasiStokItemSalur | null>(null);

  const [formLokasi, setFormLokasi] = useState('');
  const [formJenisLokasi, setFormJenisLokasi] = useState('Gudang YPPLN');
  const [formKeterangan, setFormKeterangan] = useState('-');

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Reload data from storage
  const reloadData = () => {
    setLocations(getStoredLokasiStokSalur());
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormLokasi('');
    setFormJenisLokasi('Gudang YPPLN');
    setFormKeterangan('-');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: LokasiStokItemSalur) => {
    setEditingItem(item);
    setFormLokasi(item.lokasi);
    setFormJenisLokasi(item.jenisLokasi);
    setFormKeterangan(item.keterangan || '-');
    setIsModalOpen(true);
  };

  // Handle save (Add or Edit)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLokasi.trim()) {
      alert('Nama Lokasi wajib diisi');
      return;
    }

    if (editingItem) {
      // Update
      const updated: LokasiStokItemSalur = {
        ...editingItem,
        lokasi: formLokasi.trim(),
        jenisLokasi: formJenisLokasi.trim() || 'Gudang YPPLN',
        keterangan: formKeterangan.trim() || '-',
      };
      updateLokasiStokSalur(updated, editingItem.lokasi);
      reloadData();
      setIsModalOpen(false);
      onShowToast(`Lokasi "${updated.lokasi}" berhasil diperbarui dan disinkronkan`);
    } else {
      // Add
      const newLok = addLokasiStokSalur({
        lokasi: formLokasi.trim(),
        jenisLokasi: formJenisLokasi.trim() || 'Gudang YPPLN',
        keterangan: formKeterangan.trim() || '-',
      });
      reloadData();
      setIsModalOpen(false);
      onShowToast(`Lokasi "${newLok.lokasi}" berhasil ditambahkan ke Stok Item S-SALUR`);
    }
  };

  // Handle delete
  const handleDelete = (item: LokasiStokItemSalur) => {
    deleteLokasiStokSalur(item.id, item.lokasi);
    reloadData();
    onShowToast(`Lokasi "${item.lokasi}" berhasil dihapus`);
  };

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.lokasi.toLowerCase().includes(q) ||
        item.jenisLokasi.toLowerCase().includes(q) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q));

      const matchFilter =
        selectedJenisFilter === 'all' ||
        item.jenisLokasi.toLowerCase() === selectedJenisFilter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [locations, searchQuery, selectedJenisFilter]);

  // Unique list of Jenis Lokasi for the filter dropdown
  const uniqueJenisLokasi = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((l) => {
      if (l.jenisLokasi) set.add(l.jenisLokasi);
    });
    return Array.from(set);
  }, [locations]);

  // Count stock items/containers in this warehouse for the badge/context
  const warehouseStats = useMemo(() => {
    const gudangs = getStoredGudangSalurData();
    const map = new Map<string, { totalContainers: number; totalItems: number }>();
    gudangs.forEach((g) => {
      map.set(g.namaLokasi.toLowerCase(), {
        totalContainers: g.containers.length,
        totalItems: g.containers.reduce((acc, c) => acc + c.items.length, 0),
      });
    });
    return map;
  }, [locations]);

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Bar: Connection link with Stok Item S-SALUR on left + Toolbar on right matching image.png */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Section: Back to Stok Item S-SALUR button & Quick Info */}
        <div className="flex items-center gap-2">
          {onNavigateToStokItemSalur && (
            <button
              type="button"
              id="btn-back-to-stok-salur"
              onClick={() => onNavigateToStokItemSalur()}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer group"
            >
              <Boxes className="w-4 h-4 text-slate-400 group-hover:text-[#008d91]" />
              <span>Buka Stok Item S-SALUR</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
          <span className="text-xs text-slate-400 hidden md:inline-block">
            Terkoneksi dengan alokasi gudang & container S-SALUR
          </span>
        </div>

        {/* Right Toolbar: EyeOff/Eye, Search, Sliders, + Add matching image.png */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Search bar when open */}
          {isSearchOpen && (
            <div className="relative w-48 sm:w-64 animate-in fade-in slide-in-from-right-2 duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari lokasi atau jenis lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Eye Toggle Icon */}
          <button
            type="button"
            onClick={() => {
              setIsEyeActive(!isEyeActive);
              onShowToast(isEyeActive ? 'Tampilan disederhanakan' : 'Tampilkan seluruh detail');
            }}
            title={isEyeActive ? 'Sembunyikan kolom tambahan' : 'Tampilkan semua kolom'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              !isEyeActive ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isEyeActive ? (
              <EyeOff className="w-4.5 h-4.5 stroke-[1.8]" />
            ) : (
              <Eye className="w-4.5 h-4.5 stroke-[1.8]" />
            )}
          </button>

          {/* Search Icon */}
          {!isSearchOpen && (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>
          )}

          {/* Filter / Sliders Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Jenis Lokasi"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedJenisFilter !== 'all' || isFilterOpen
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-30 animate-in fade-in zoom-in-95">
                <div className="text-xs font-semibold text-slate-700 mb-2">Filter Jenis Lokasi</div>
                <div className="flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJenisFilter('all');
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedJenisFilter === 'all'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Semua Jenis
                  </button>
                  {uniqueJenisLokasi.map((jenis) => (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => {
                        setSelectedJenisFilter(jenis);
                        setIsFilterOpen(false);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedJenisFilter === jenis
                          ? 'bg-teal-50 text-[#008d91] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {jenis}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* + Add Button matching image.png */}
          <button
            type="button"
            id="btn-add-lokasi-salur"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add
          </button>
        </div>
      </div>

      {/* Main Table Container: Clean White Card matching image.png */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Table Header Row */}
          <div className="grid grid-cols-12 gap-4 pb-3.5 border-b border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 select-none">
            <div className="col-span-5 sm:col-span-4 pl-2">Lokasi</div>
            <div className="col-span-4 sm:col-span-4 pl-2">Jenis Lokasi</div>
            <div className="col-span-2 sm:col-span-3 text-center sm:text-left pl-2">Keterangan</div>
            <div className="col-span-1 sm:col-span-1 text-right pr-2"></div>
          </div>

          {/* Table Body Rows matching exact rows from image.png */}
          <div className="flex flex-col divide-y divide-slate-100 mt-1">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Tidak ada data lokasi yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              filteredLocations.map((item) => {
                const isMenuOpen = activeMenuId === `menu-${item.id}`;
                const stats = warehouseStats.get(item.lokasi.toLowerCase());

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 items-center py-4 px-2 transition-colors hover:bg-slate-50/70 rounded-xl group"
                  >
                    {/* Column 1: Lokasi */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateToStokItemSalur) {
                              onNavigateToStokItemSalur(item.lokasi);
                            }
                          }}
                          className="font-semibold text-slate-800 hover:text-[#008d91] text-xs sm:text-sm tracking-tight text-left truncate block cursor-pointer transition-colors"
                          title={`Lihat alokasi stok untuk ${item.lokasi}`}
                        >
                          {item.lokasi}
                        </button>
                        {stats && stats.totalContainers > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {stats.totalContainers} container di Stok Item S-SALUR
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Jenis Lokasi */}
                    <div className="col-span-4 sm:col-span-4 text-xs sm:text-sm text-slate-700 font-normal truncate pl-2">
                      {item.jenisLokasi}
                    </div>

                    {/* Column 3: Keterangan */}
                    <div className="col-span-2 sm:col-span-3 text-xs sm:text-sm text-slate-500 pl-2">
                      {item.keterangan || '-'}
                    </div>

                    {/* Column 4: 3-dots action menu */}
                    <div className="col-span-1 sm:col-span-1 text-right pr-1 relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : `menu-${item.id}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Aksi Lokasi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                        >
                          {onNavigateToStokItemSalur && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onNavigateToStokItemSalur(item.lokasi);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-[#008d91] font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Boxes className="w-3.5 h-3.5 text-[#008d91]" />
                              Lihat Stok di Gudang
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleOpenEditModal(item);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            Edit Lokasi
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleDelete(item);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Hapus Lokasi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Tambah / Edit Lokasi */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingItem ? 'Edit Lokasi Stok' : 'Tambah Lokasi Stok'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tersambung langsung dengan Stok Item S-SALUR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 flex flex-col gap-4">
              {/* Lokasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kantor Bandung, Rumah Tsa-tsa"
                  value={formLokasi}
                  onChange={(e) => setFormLokasi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                />
              </div>

              {/* Jenis Lokasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenis Lokasi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['Gudang YPPLN', 'Kegiatan', 'Agen Purna'].map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setFormJenisLokasi(j)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                        formJenisLokasi === j
                          ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Atau ketik jenis lokasi lainnya..."
                  value={formJenisLokasi}
                  onChange={(e) => setFormJenisLokasi(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Keterangan
                </label>
                <input
                  type="text"
                  placeholder="-"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#008d91] hover:bg-[#007b7e] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Lokasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
