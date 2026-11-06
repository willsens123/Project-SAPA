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
  ArrowLeftRight,
  ArrowRight,
  Check,
  Tag,
  Boxes,
} from 'lucide-react';
import {
  JenisPerubahanStockSalur,
  getStoredJenisPerubahanSalur,
  addJenisPerubahanSalur,
  updateJenisPerubahanSalur,
  deleteJenisPerubahanSalur,
} from '../stokSalurData';

interface JenisPerubahanStockSalurViewProps {
  onShowToast: (message: string) => void;
  onNavigateToStockInOutSalur?: (selectedJenisPerubahan?: string) => void;
  onNavigateToStokItemSalur?: () => void;
}

export const JenisPerubahanStockSalurView: React.FC<JenisPerubahanStockSalurViewProps> = ({
  onShowToast,
  onNavigateToStockInOutSalur,
  onNavigateToStokItemSalur,
}) => {
  const [records, setRecords] = useState<JenisPerubahanStockSalur[]>(() =>
    getStoredJenisPerubahanSalur()
  );

  // Toolbar state matching image.png
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Menu popup state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<JenisPerubahanStockSalur | null>(null);

  // Form states
  const [formJenisPerubahan, setFormJenisPerubahan] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('-');

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const reloadData = () => {
    setRecords(getStoredJenisPerubahanSalur());
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormJenisPerubahan('');
    setFormKeterangan('-');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: JenisPerubahanStockSalur) => {
    setEditingRecord(rec);
    setFormJenisPerubahan(rec.jenisPerubahan);
    setFormKeterangan(rec.keterangan || '-');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = formJenisPerubahan.trim();
    if (!cleanName) {
      alert('Nama Jenis Perubahan wajib diisi');
      return;
    }

    if (editingRecord) {
      const updated: JenisPerubahanStockSalur = {
        ...editingRecord,
        jenisPerubahan: cleanName,
        keterangan: formKeterangan.trim() || '-',
      };
      updateJenisPerubahanSalur(updated);
      reloadData();
      setIsModalOpen(false);
      onShowToast(`Jenis perubahan "${cleanName}" berhasil diperbarui`);
    } else {
      addJenisPerubahanSalur({
        jenisPerubahan: cleanName,
        keterangan: formKeterangan.trim() || '-',
      });
      reloadData();
      setIsModalOpen(false);
      onShowToast(`Jenis perubahan "${cleanName}" berhasil ditambahkan`);
    }
  };

  const handleDelete = (rec: JenisPerubahanStockSalur) => {
    deleteJenisPerubahanSalur(rec.id);
    reloadData();
    onShowToast(`Jenis perubahan "${rec.jenisPerubahan}" berhasil dihapus`);
  };

  // Filter and search
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.jenisPerubahan.toLowerCase().includes(q) ||
        r.keterangan.toLowerCase().includes(q);

      const matchFilter =
        selectedFilterCategory === 'all' ||
        (selectedFilterCategory === 'with_notes' && r.keterangan !== '-') ||
        (selectedFilterCategory === 'without_notes' && r.keterangan === '-');

      return matchSearch && matchFilter;
    });
  }, [records, searchQuery, selectedFilterCategory]);

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Header Controls: Quick connection buttons on left + Toolbar matching image.png on right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Quick links to Stock In/Out & Stok Item S-SALUR */}
        <div className="flex items-center gap-2">
          {onNavigateToStockInOutSalur && (
            <button
              type="button"
              id="btn-nav-to-stock-io"
              onClick={() => onNavigateToStockInOutSalur()}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer group"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-400 group-hover:text-[#008d91]" />
              <span>Buka Stock In/Out Mutasi</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
          {onNavigateToStokItemSalur && (
            <button
              type="button"
              onClick={onNavigateToStokItemSalur}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5 text-slate-400" />
              <span>Stok Item S-SALUR</span>
            </button>
          )}
          <span className="text-xs text-slate-400 hidden lg:inline-block">
            Master klasifikasi mutasi pergerakan barang S-SALUR
          </span>
        </div>

        {/* Right: EyeOff, Search, Sliders, + Add matching image.png */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Search bar when open */}
          {isSearchOpen && (
            <div className="relative w-48 sm:w-64 animate-in fade-in slide-in-from-right-2 duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari jenis perubahan, keterangan..."
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
            title={isEyeActive ? 'Tampilan ringkas' : 'Tampilkan semua'}
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
              title="Filter Keterangan"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedFilterCategory !== 'all' || isFilterOpen
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-30 animate-in fade-in zoom-in-95">
                <div className="text-xs font-semibold text-slate-700 mb-2">Filter Keterangan</div>
                <div className="flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilterCategory('all');
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedFilterCategory === 'all'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Semua Jenis Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilterCategory('with_notes');
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedFilterCategory === 'with_notes'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Hanya yang Ada Catatan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFilterCategory('without_notes');
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedFilterCategory === 'without_notes'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tanpa Catatan (-)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* + Add Button matching image.png */}
          <button
            type="button"
            id="btn-add-jenis-perubahan"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add
          </button>
        </div>
      </div>

      {/* Main Table Container matching image.png */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Table Header Columns matching image.png */}
          <div className="grid grid-cols-12 gap-4 pb-3.5 border-b border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 select-none">
            <div className="col-span-4 pl-2 text-left">Jenis Perubahan</div>
            <div className="col-span-7 text-left">Keterangan</div>
            <div className="col-span-1 text-right pr-2"></div>
          </div>

          {/* Table Rows matching image.png */}
          <div className="flex flex-col divide-y divide-slate-100 mt-1">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Tidak ada Jenis Perubahan yang cocok dengan pencarian atau filter.
              </div>
            ) : (
              filteredRecords.map((item) => {
                const isMenuOpen = activeMenuId === `menu-${item.id}`;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 items-center py-3.5 px-2 transition-colors hover:bg-slate-50/70 rounded-xl group"
                  >
                    {/* Jenis Perubahan */}
                    <div className="col-span-4 text-xs sm:text-sm text-slate-800 font-normal truncate">
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToStockInOutSalur) {
                            onNavigateToStockInOutSalur(item.jenisPerubahan);
                          }
                        }}
                        className="text-left font-normal text-slate-800 hover:text-[#008d91] transition-colors cursor-pointer block truncate"
                        title={`Klik untuk melihat mutasi ${item.jenisPerubahan} di Stock In/Out`}
                      >
                        {item.jenisPerubahan}
                      </button>
                    </div>

                    {/* Keterangan */}
                    <div className="col-span-7 text-xs sm:text-sm text-slate-700 font-normal truncate">
                      <span title={item.keterangan}>{item.keterangan}</span>
                    </div>

                    {/* Actions Menu */}
                    <div className="col-span-1 text-right pr-2 relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : `menu-${item.id}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Aksi Jenis Perubahan"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                        >
                          {onNavigateToStockInOutSalur && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onNavigateToStockInOutSalur(item.jenisPerubahan);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-teal-50 text-[#008d91] font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5 text-[#008d91]" />
                              Lihat Mutasi di Stock In/Out
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleOpenEdit(item);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            Edit Jenis Perubahan
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
                            Hapus Jenis Perubahan
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

      {/* Modal: Tambah / Edit Jenis Perubahan */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <Tag className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingRecord ? 'Edit Jenis Perubahan' : 'Tambah Jenis Perubahan'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Terkoneksi langsung ke formulir dan filter Stock In/Out S-SALUR
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Perubahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Buku Masuk, Retur, Rusak..."
                  value={formJenisPerubahan}
                  onChange={(e) => setFormJenisPerubahan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan tambahan (default: -)"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
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
                  <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan Jenis Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
