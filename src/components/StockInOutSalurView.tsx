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
  ArrowRight,
  ArrowLeftRight,
  Check,
  Printer,
} from 'lucide-react';
import {
  StockInOutSalurRecord,
  getStoredStockInOutSalur,
  addStockInOutSalur,
  updateStockInOutSalur,
  deleteStockInOutSalur,
  getStoredLokasiStokSalur,
  getStoredStokSalurItems,
  getStoredGudangSalurData,
  getStoredJenisPerubahanSalur,
} from '../stokSalurData';

interface StockInOutSalurViewProps {
  onShowToast: (message: string) => void;
  onNavigateToStokItemSalur?: (selectedGudang?: string) => void;
  onNavigateToLokasiStokSalur?: () => void;
  onNavigateToJenisPerubahanSalur?: () => void;
  onNavigateToNamaPercetakan?: () => void;
  onNavigateToFormStockInOutSalur?: () => void;
  initialJenisPerubahanFilter?: string;
}

export const StockInOutSalurView: React.FC<StockInOutSalurViewProps> = ({
  onShowToast,
  onNavigateToStokItemSalur,
  onNavigateToLokasiStokSalur,
  onNavigateToJenisPerubahanSalur,
  onNavigateToNamaPercetakan,
  onNavigateToFormStockInOutSalur,
  initialJenisPerubahanFilter,
}) => {
  const [records, setRecords] = useState<StockInOutSalurRecord[]>(() =>
    getStoredStockInOutSalur()
  );

  // Toolbar states matching image.png
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPerubahanFilter, setSelectedPerubahanFilter] = useState<string>(
    initialJenisPerubahanFilter || 'all'
  );

  // Menu popup state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states (Add & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockInOutSalurRecord | null>(null);

  // Form states
  const [formTanggal, setFormTanggal] = useState('1 Jan 2021');
  const [formSumberContainer, setFormSumberContainer] = useState('Rak');
  const [formSumberLokasi, setFormSumberLokasi] = useState('Kantor Bandung');
  const [formNamaItem, setFormNamaItem] = useState('Demi Kepentingan Semua Makhluk');
  const [formJumlah, setFormJumlah] = useState('5');
  const [formTujuanContainer, setFormTujuanContainer] = useState('Container A');
  const [formTujuanLokasi, setFormTujuanLokasi] = useState('Rumah Tsa-tsa');
  const [formJenisPerubahan, setFormJenisPerubahan] = useState('Pindah Stock');
  const [formApplySync, setFormApplySync] = useState(true);

  // Master options for form dropdowns
  const masterItems = useMemo(() => getStoredStokSalurItems(), [records]);
  const masterLocations = useMemo(() => getStoredLokasiStokSalur(), []);
  const masterGudangs = useMemo(() => getStoredGudangSalurData(), [records]);
  const masterJenisPerubahan = useMemo(() => getStoredJenisPerubahanSalur(), []);

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Listen to background updates (e.g. from Transaksi S-SALUR sync and Stok Item S-SALUR)
  React.useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener('stock_in_out_updated', handleUpdate);
    window.addEventListener('stok_salur_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('stock_in_out_updated', handleUpdate);
      window.removeEventListener('stok_salur_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const reloadData = () => {
    setRecords(getStoredStockInOutSalur());
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormTanggal('1 Jan 2021');
    setFormSumberContainer('Rak');
    setFormSumberLokasi('Kantor Bandung');
    setFormNamaItem(masterItems[0]?.namaItem || "Go Lotsawa's The Blue Annals");
    setFormJumlah('10');
    setFormTujuanContainer('Container A');
    setFormTujuanLokasi('Rumah Tsa-tsa');
    setFormJenisPerubahan('Pindah Stock');
    setFormApplySync(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: StockInOutSalurRecord) => {
    setEditingRecord(rec);
    setFormTanggal(rec.tanggal);
    setFormSumberContainer(rec.sumberContainer);
    setFormSumberLokasi(rec.sumberLokasi);
    setFormNamaItem(rec.namaItem);
    setFormJumlah(String(rec.jumlah));
    setFormTujuanContainer(rec.tujuanContainer);
    setFormTujuanLokasi(rec.tujuanLokasi);
    setFormJenisPerubahan(rec.jenisPerubahan);
    setFormApplySync(false);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNamaItem.trim()) {
      alert('Nama item wajib diisi');
      return;
    }

    const qty = Number(formJumlah) || 1;

    if (editingRecord) {
      const updated: StockInOutSalurRecord = {
        ...editingRecord,
        tanggal: formTanggal.trim() || '1 Jan 2021',
        sumberContainer: formSumberContainer.trim() || '-',
        sumberLokasi: formSumberLokasi.trim() || '-',
        namaItem: formNamaItem.trim(),
        jumlah: qty,
        tujuanContainer: formTujuanContainer.trim() || '-',
        tujuanLokasi: formTujuanLokasi.trim() || '-',
        jenisPerubahan: formJenisPerubahan.trim() || 'Pindah Stock',
      };
      updateStockInOutSalur(updated);
      reloadData();
      setIsModalOpen(false);
      onShowToast(`Data Stock In/Out berhasil diperbarui`);
    } else {
      const newRec = addStockInOutSalur(
        {
          tanggal: formTanggal.trim() || '1 Jan 2021',
          sumberContainer: formSumberContainer.trim() || '-',
          sumberLokasi: formSumberLokasi.trim() || '-',
          namaItem: formNamaItem.trim(),
          jumlah: qty,
          tujuanContainer: formTujuanContainer.trim() || '-',
          tujuanLokasi: formTujuanLokasi.trim() || '-',
          jenisPerubahan: formJenisPerubahan.trim() || 'Pindah Stock',
        },
        formApplySync
      );
      reloadData();
      setIsModalOpen(false);
      onShowToast(
        formApplySync
          ? `Mutasi ${newRec.jenisPerubahan} tercatat & stok diperbarui di Stok Item S-SALUR`
          : `Mutasi ${newRec.jenisPerubahan} berhasil ditambahkan`
      );
    }
  };

  const handleDelete = (rec: StockInOutSalurRecord) => {
    deleteStockInOutSalur(rec.id);
    reloadData();
    onShowToast('Catatan mutasi berhasil dihapus');
  };

  // Filter and search
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.namaItem.toLowerCase().includes(q) ||
        r.tanggal.toLowerCase().includes(q) ||
        r.sumberContainer.toLowerCase().includes(q) ||
        r.sumberLokasi.toLowerCase().includes(q) ||
        r.tujuanContainer.toLowerCase().includes(q) ||
        r.tujuanLokasi.toLowerCase().includes(q) ||
        r.jenisPerubahan.toLowerCase().includes(q);

      const matchFilter =
        selectedPerubahanFilter === 'all' ||
        r.jenisPerubahan.toLowerCase() === selectedPerubahanFilter.toLowerCase();

      return matchSearch && matchFilter;
    });
  }, [records, searchQuery, selectedPerubahanFilter]);

  // Unique list of Jenis Perubahan for filter
  const uniqueJenisPerubahan = useMemo(() => {
    const set = new Set<string>();
    masterJenisPerubahan.forEach((jp) => {
      if (jp.jenisPerubahan) set.add(jp.jenisPerubahan);
    });
    records.forEach((r) => {
      if (r.jenisPerubahan) set.add(r.jenisPerubahan);
    });
    return Array.from(set);
  }, [records, masterJenisPerubahan]);

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Header Controls: Connection links on left + Toolbar matching image.png on right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Quick links to Stok Item S-SALUR & Lokasi & Jenis Perubahan */}
        <div className="flex items-center gap-2">
          {onNavigateToStokItemSalur && (
            <button
              type="button"
              id="btn-nav-to-stok-salur"
              onClick={() => onNavigateToStokItemSalur()}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer group"
            >
              <Boxes className="w-4 h-4 text-slate-400 group-hover:text-[#008d91]" />
              <span>Buka Stok Item S-SALUR</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
          {onNavigateToLokasiStokSalur && (
            <button
              type="button"
              onClick={onNavigateToLokasiStokSalur}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Lokasi Stok</span>
            </button>
          )}
          {onNavigateToJenisPerubahanSalur && (
            <button
              type="button"
              id="btn-nav-to-jenis-perubahan"
              onClick={onNavigateToJenisPerubahanSalur}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Jenis Perubahan</span>
            </button>
          )}
          {onNavigateToNamaPercetakan && (
            <button
              type="button"
              id="btn-nav-to-nama-percetakan"
              onClick={onNavigateToNamaPercetakan}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Percetakan</span>
            </button>
          )}
          <span className="text-xs text-slate-400 hidden lg:inline-block">
            Mencatat riwayat mutasi perpindahan rak, stock, dan penjualan
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
                placeholder="Cari item, container, lokasi..."
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
              onShowToast(isEyeActive ? 'Tampilan disederhanakan' : 'Tampilkan seluruh kolom detail');
            }}
            title={isEyeActive ? 'Tampilan ringkas' : 'Tampilkan semua detail'}
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
              title="Filter Jenis Perubahan"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedPerubahanFilter !== 'all' || isFilterOpen
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-30 animate-in fade-in zoom-in-95">
                <div className="text-xs font-semibold text-slate-700 mb-2">Filter Jenis Perubahan</div>
                <div className="flex flex-col gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPerubahanFilter('all');
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedPerubahanFilter === 'all'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Semua Jenis Perubahan
                  </button>
                  {uniqueJenisPerubahan.map((jp) => (
                    <button
                      key={jp}
                      type="button"
                      onClick={() => {
                        setSelectedPerubahanFilter(jp);
                        setIsFilterOpen(false);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedPerubahanFilter === jp
                          ? 'bg-teal-50 text-[#008d91] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {jp}
                    </button>
                  ))}
                  {onNavigateToJenisPerubahanSalur && (
                    <>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsFilterOpen(false);
                          onNavigateToJenisPerubahanSalur();
                        }}
                        className="text-left px-2.5 py-1.5 rounded-lg text-[#008d91] hover:bg-teal-50 font-medium transition-colors cursor-pointer"
                      >
                        Kelola Jenis Perubahan...
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* + Add Button matching image.png */}
          <button
            type="button"
            id="btn-add-stock-io"
            onClick={() => {
              if (onNavigateToFormStockInOutSalur) {
                onNavigateToFormStockInOutSalur();
              } else {
                handleOpenAdd();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add
          </button>
        </div>
      </div>

      {/* Main Table Container matching image.png */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[980px]">
          {/* Table Header Columns matching image.png */}
          <div className="grid grid-cols-12 gap-3 pb-3.5 border-b border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 select-none">
            <div className="col-span-1 pl-1">Tanggal</div>
            <div className="col-span-1 text-left">Sumber Container</div>
            <div className="col-span-2 text-left">Sumber Lokasi</div>
            <div className="col-span-3 text-left">Nama Item</div>
            <div className="col-span-1 text-center">Jumlah</div>
            <div className="col-span-1 text-left">Tujuan Container</div>
            <div className="col-span-1 text-left">Tujuan Lokasi</div>
            <div className="col-span-1 text-left">Jenis Perubahan</div>
            <div className="col-span-1 text-right pr-2"></div>
          </div>

          {/* Table Rows matching image.png */}
          <div className="flex flex-col divide-y divide-slate-100 mt-1">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Tidak ada data Stock In/Out yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              filteredRecords.map((item) => {
                const isMenuOpen = activeMenuId === `menu-${item.id}`;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 items-center py-3.5 px-1 transition-colors hover:bg-slate-50/70 rounded-xl group"
                  >
                    {/* Tanggal */}
                    <div className="col-span-1 text-xs sm:text-sm text-slate-600 font-normal truncate pl-1">
                      {item.tanggal}
                    </div>

                    {/* Sumber Container */}
                    <div className="col-span-1 text-xs sm:text-sm text-slate-700 font-medium truncate">
                      {item.sumberContainer}
                    </div>

                    {/* Sumber Lokasi */}
                    <div className="col-span-2 text-xs sm:text-sm text-slate-700 font-normal truncate">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.sumberLokasi !== '-' && onNavigateToStokItemSalur) {
                            onNavigateToStokItemSalur(item.sumberLokasi);
                          }
                        }}
                        className={`text-left truncate block cursor-pointer ${
                          item.sumberLokasi !== '-'
                            ? 'hover:text-[#008d91] hover:underline'
                            : 'text-slate-400'
                        }`}
                        title={item.sumberLokasi !== '-' ? `Buka stok di ${item.sumberLokasi}` : undefined}
                      >
                        {item.sumberLokasi}
                      </button>
                    </div>

                    {/* Nama Item */}
                    <div className="col-span-3 text-xs sm:text-sm font-normal text-slate-800 truncate pr-2">
                      <span title={item.namaItem}>{item.namaItem}</span>
                    </div>

                    {/* Jumlah */}
                    <div className="col-span-1 text-xs sm:text-sm text-slate-800 font-normal text-center">
                      {item.jumlah}
                    </div>

                    {/* Tujuan Container */}
                    <div className="col-span-1 text-xs sm:text-sm text-slate-700 font-normal truncate">
                      {item.tujuanContainer}
                    </div>

                    {/* Tujuan Lokasi */}
                    <div className="col-span-1 text-xs sm:text-sm text-slate-700 font-normal truncate">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.tujuanLokasi !== '-' && onNavigateToStokItemSalur) {
                            onNavigateToStokItemSalur(item.tujuanLokasi);
                          }
                        }}
                        className={`text-left truncate block cursor-pointer ${
                          item.tujuanLokasi !== '-'
                            ? 'hover:text-[#008d91] hover:underline'
                            : 'text-slate-400'
                        }`}
                        title={item.tujuanLokasi !== '-' ? `Buka stok di ${item.tujuanLokasi}` : undefined}
                      >
                        {item.tujuanLokasi}
                      </button>
                    </div>

                    {/* Jenis Perubahan */}
                    <div className="col-span-1 text-xs sm:text-sm text-slate-700 font-normal truncate">
                      {item.jenisPerubahan}
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
                        title="Aksi Mutasi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
                        >
                          {onNavigateToStokItemSalur && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                const targetLoc =
                                  item.tujuanLokasi !== '-'
                                    ? item.tujuanLokasi
                                    : item.sumberLokasi !== '-'
                                    ? item.sumberLokasi
                                    : undefined;
                                onNavigateToStokItemSalur(targetLoc);
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
                              handleOpenEdit(item);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            Edit Mutasi
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
                            Hapus Mutasi
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

      {/* Modal: Tambah / Edit Stock In/Out */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <ArrowLeftRight className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingRecord ? 'Edit Stock In/Out' : 'Tambah Stock In/Out'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Terkoneksi langsung dengan alokasi Stok Item S-SALUR
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
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto flex flex-col gap-4">
              {/* Row 1: Tanggal & Jenis Perubahan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1 Jan 2021"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Perubahan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formJenisPerubahan}
                    onChange={(e) => setFormJenisPerubahan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white cursor-pointer"
                  >
                    {masterJenisPerubahan.map((jp) => (
                      <option key={jp.id} value={jp.jenisPerubahan}>
                        {jp.jenisPerubahan}
                      </option>
                    ))}
                    {!masterJenisPerubahan.some((jp) => jp.jenisPerubahan === formJenisPerubahan) && (
                      <option value={formJenisPerubahan}>{formJenisPerubahan}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 2: Nama Item & Jumlah */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formNamaItem}
                    onChange={(e) => setFormNamaItem(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white cursor-pointer"
                  >
                    {masterItems.map((it) => (
                      <option key={it.id} value={it.namaItem}>
                        {it.namaItem}
                      </option>
                    ))}
                    <option value="Go Lotsawa's The Blue Annals">Go Lotsawa's The Blue Annals</option>
                    <option value="Jalan Menuju Kemahatahuan">Jalan Menuju Kemahatahuan</option>
                    <option value="Demi Kepentingan Semua Makhluk">Demi Kepentingan Semua Makhluk</option>
                    <option value="Menjadi Buddha di Tempat Kerja">Menjadi Buddha di Tempat Kerja</option>
                    <option value="Harta, Tahta, dan Wanitia dalam Gandhawyuha">
                      Harta, Tahta, dan Wanitia dalam Gandhawyuha
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white"
                  />
                </div>
              </div>

              {/* Divider: Sumber vs Tujuan */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sumber (Dari Mana)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Sumber Lokasi
                    </label>
                    <select
                      value={formSumberLokasi}
                      onChange={(e) => setFormSumberLokasi(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                    >
                      <option value="-">- (Tidak ada / Barang Masuk)</option>
                      {masterLocations.map((l) => (
                        <option key={l.id} value={l.lokasi}>
                          {l.lokasi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Sumber Container
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rak, BGL - 001, BJM - 001"
                      value={formSumberContainer}
                      onChange={(e) => setFormSumberContainer(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100 flex flex-col gap-3">
                <span className="text-xs font-bold text-[#008d91] uppercase tracking-wider">
                  Tujuan (Ke Mana)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tujuan Lokasi
                    </label>
                    <select
                      value={formTujuanLokasi}
                      onChange={(e) => setFormTujuanLokasi(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                    >
                      <option value="-">- (Keluar / Penjualan)</option>
                      {masterLocations.map((l) => (
                        <option key={l.id} value={l.lokasi}>
                          {l.lokasi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tujuan Container
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Container A, Container B, Rak"
                      value={formTujuanContainer}
                      onChange={(e) => setFormTujuanContainer(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>
              </div>

              {!editingRecord && (
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formApplySync}
                    onChange={(e) => setFormApplySync(e.target.checked)}
                    className="w-4 h-4 text-[#008d91] rounded-md focus:ring-0 cursor-pointer"
                  />
                  <span>
                    Sinkronkan dan perbarui kuantitas stok di <strong>Stok Item S-SALUR</strong>
                  </span>
                </label>
              )}

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
                  <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan Mutasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
