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
  Printer,
  Phone,
  MapPin,
  User,
  ArrowRight,
  PackagePlus,
  Building,
  Check,
} from 'lucide-react';
import {
  PercetakanSalurItem,
  getStoredPercetakanSalur,
  addPercetakanSalur,
  updatePercetakanSalur,
  deletePercetakanSalur,
} from '../percetakanSalurData';

interface NamaPercetakanStockSalurViewProps {
  onShowToast: (message: string) => void;
  onNavigateToFormStockInOutSalur?: (selectedPercetakan?: string) => void;
}

export const NamaPercetakanStockSalurView: React.FC<NamaPercetakanStockSalurViewProps> = ({
  onShowToast,
  onNavigateToFormStockInOutSalur,
}) => {
  const [records, setRecords] = useState<PercetakanSalurItem[]>(() =>
    getStoredPercetakanSalur()
  );

  // Toolbar state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRegion, setFilterRegion] = useState<string>('all');

  // Menu popup state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PercetakanSalurItem | null>(null);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formKontak, setFormKontak] = useState('');
  const [formTelepon, setFormTelepon] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('-');

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const reloadData = () => {
    setRecords(getStoredPercetakanSalur());
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormNama('');
    setFormKontak('');
    setFormTelepon('');
    setFormAlamat('');
    setFormKeterangan('-');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: PercetakanSalurItem) => {
    setEditingRecord(rec);
    setFormNama(rec.namaPercetakan);
    setFormKontak(rec.kontak || '');
    setFormTelepon(rec.telepon || '');
    setFormAlamat(rec.alamat || '');
    setFormKeterangan(rec.keterangan || '-');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNama = formNama.trim();
    if (!cleanNama) {
      alert('Nama Percetakan wajib diisi');
      return;
    }

    if (editingRecord) {
      const updated: PercetakanSalurItem = {
        ...editingRecord,
        namaPercetakan: cleanNama,
        kontak: formKontak.trim() || '-',
        telepon: formTelepon.trim() || '-',
        alamat: formAlamat.trim() || '-',
        keterangan: formKeterangan.trim() || '-',
      };
      updatePercetakanSalur(updated);
      reloadData();
      onShowToast(`Percetakan "${cleanNama}" berhasil diperbarui`);
    } else {
      const created = addPercetakanSalur({
        namaPercetakan: cleanNama,
        kontak: formKontak.trim() || '-',
        telepon: formTelepon.trim() || '-',
        alamat: formAlamat.trim() || '-',
        keterangan: formKeterangan.trim() || '-',
        createdAt: '15 Nov 2021',
      });
      reloadData();
      onShowToast(`Percetakan "${created.namaPercetakan}" berhasil ditambahkan`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (rec: PercetakanSalurItem) => {
    deletePercetakanSalur(rec.id);
    reloadData();
    onShowToast(`Percetakan "${rec.namaPercetakan}" dihapus`);
  };

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Region filter
      if (filterRegion !== 'all') {
        const addr = (r.alamat || '').toLowerCase();
        if (!addr.includes(filterRegion.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          r.namaPercetakan.toLowerCase().includes(q) ||
          (r.kontak && r.kontak.toLowerCase().includes(q)) ||
          (r.telepon && r.telepon.toLowerCase().includes(q)) ||
          (r.alamat && r.alamat.toLowerCase().includes(q)) ||
          (r.keterangan && r.keterangan.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [records, searchQuery, filterRegion]);

  return (
    <div className="w-full text-slate-800 animate-in fade-in duration-200">
      {/* Top Header / Stat Card + Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Left Stat Card */}
        <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center shrink-0 border border-teal-100">
            <Printer className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              Nama Percetakan Stok Item S-SALUR
            </div>
            <div className="text-xl font-bold text-slate-800">
              {records.length}{' '}
              <span className="text-xs font-normal text-slate-500">
                Mitra Percetakan Terdaftar
              </span>
            </div>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center justify-end gap-3 self-end sm:self-center">
          {/* Search Input when open */}
          {isSearchOpen && (
            <div className="relative w-48 sm:w-64 animate-in fade-in slide-in-from-right-2 duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari percetakan, kontak, alamat..."
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

          {/* Eye Toggle */}
          <button
            type="button"
            onClick={() => setIsEyeActive(!isEyeActive)}
            title={isEyeActive ? 'Tampilan Lengkap' : 'Tampilan Ringkas'}
            className={`p-2 rounded-xl transition-colors cursor-pointer border ${
              isEyeActive
                ? 'bg-teal-50 border-teal-200 text-[#008d91]'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {isEyeActive ? (
              <Eye className="w-4.5 h-4.5 stroke-[1.8]" />
            ) : (
              <EyeOff className="w-4.5 h-4.5 stroke-[1.8]" />
            )}
          </button>

          {/* Search Icon */}
          {!isSearchOpen && (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari Percetakan"
              className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>
          )}

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Wilayah"
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                filterRegion !== 'all'
                  ? 'bg-teal-50 border-teal-200 text-[#008d91]'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-30 animate-in fade-in zoom-in-95">
                <div className="text-xs font-semibold text-slate-500 px-2 py-1 mb-1">
                  Filter Kota / Wilayah
                </div>
                {[
                  { id: 'all', label: 'Semua Wilayah' },
                  { id: 'jakarta', label: 'Jakarta' },
                  { id: 'bandung', label: 'Bandung' },
                  { id: 'yogyakarta', label: 'Yogyakarta' },
                  { id: 'surabaya', label: 'Surabaya' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFilterRegion(item.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      filterRegion === item.id
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {filterRegion === item.id && (
                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigate to Form Stock In/Out */}
          {onNavigateToFormStockInOutSalur && (
            <button
              type="button"
              onClick={() => onNavigateToFormStockInOutSalur()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#008d91] text-[#008d91] hover:bg-teal-50 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
              title="Buka Form Stock In/Out (Buku Baru Cetak)"
            >
              <PackagePlus className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden sm:inline">Form Stock In/Out</span>
            </button>
          )}

          {/* Add Percetakan Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 min-w-[200px]">Nama Percetakan</th>
                {isEyeActive && (
                  <>
                    <th className="py-3.5 px-4 min-w-[150px]">Kontak / PIC</th>
                    <th className="py-3.5 px-4 min-w-[140px]">No. Telepon / HP</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Alamat</th>
                  </>
                )}
                <th className="py-3.5 px-4 min-w-[180px]">Keterangan</th>
                <th className="py-3.5 px-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={isEyeActive ? 7 : 4}
                    className="py-12 text-center text-slate-400"
                  >
                    Tidak ada data percetakan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item, index) => {
                  const isMenuOpen = activeMenuId === `menu-${item.id}`;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                        {index + 1}
                      </td>

                      {/* Nama Percetakan */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008d91] flex items-center justify-center shrink-0 border border-teal-100">
                            <Printer className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {item.namaPercetakan}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Terdaftar: {item.createdAt || '15 Nov 2021'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kontak / PIC */}
                      {isEyeActive && (
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.kontak || '-'}</span>
                          </div>
                        </td>
                      )}

                      {/* No. Telepon */}
                      {isEyeActive && (
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.telepon || '-'}</span>
                          </div>
                        </td>
                      )}

                      {/* Alamat */}
                      {isEyeActive && (
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{item.alamat || '-'}</span>
                          </div>
                        </td>
                      )}

                      {/* Keterangan */}
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="line-clamp-2">{item.keterangan || '-'}</span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(
                                isMenuOpen ? null : `menu-${item.id}`
                              );
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Menu Aksi"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Popover Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                            >
                              {/* Direct shortcut to Form Stock In/Out Buku Baru Cetak */}
                              {onNavigateToFormStockInOutSalur && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onNavigateToFormStockInOutSalur(
                                      item.namaPercetakan
                                    );
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#008d91] hover:bg-teal-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <PackagePlus className="w-3.5 h-3.5 stroke-[2.2]" />
                                  <span>Input Stok (Cetak Baru)</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleOpenEdit(item);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Percetakan</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleDelete(item);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Hapus Percetakan</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <strong>{filteredRecords.length}</strong> dari{' '}
            <strong>{records.length}</strong> data percetakan
          </div>
          {onNavigateToFormStockInOutSalur && (
            <button
              type="button"
              onClick={() => onNavigateToFormStockInOutSalur()}
              className="text-[#008d91] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Form Stock In/Out S-SALUR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Percetakan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#008d91] text-white flex items-center justify-center">
                  <Printer className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingRecord ? 'Edit Nama Percetakan' : 'Tambah Nama Percetakan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveModal} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Percetakan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Percetakan Surya Gemilang"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kontak / PIC
                  </label>
                  <input
                    type="text"
                    placeholder="Nama penanggung jawab"
                    value={formKontak}
                    onChange={(e) => setFormKontak(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor Telepon / HP
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7890"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Alamat kantor / pabrik percetakan"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan spesialisasi cetak, bahan, dll"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] transition-colors resize-none"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7e] shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Percetakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
