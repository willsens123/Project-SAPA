import React, { useState, useMemo } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  Filter,
  Sparkles,
  CalendarCheck,
  RotateCcw,
} from 'lucide-react';
import {
  HariKhususItem,
  formatIndonesianDateStr,
  getNamaHariIndonesia,
  KATEGORI_HARI_KHUSUS_OPTIONS,
} from '../hariKhususData';
import { AddEditHariKhususModal } from './AddEditHariKhususModal';

interface HariKhususCalendarTodoListViewProps {
  items: HariKhususItem[];
  onSaveItem: (item: HariKhususItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleLibur: (item: HariKhususItem) => void;
  onNavigateToCalendar: () => void;
  onShowToast?: (msg: string) => void;
}

export const HariKhususCalendarTodoListView: React.FC<HariKhususCalendarTodoListViewProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onToggleLibur,
  onNavigateToCalendar,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [selectedTahun, setSelectedTahun] = useState<string>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HariKhususItem | null>(null);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
      setIsFilterDropdownOpen(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Distinct Years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      const yr = it.tanggal.split('-')[0];
      if (yr) set.add(yr);
    });
    set.add('2021');
    set.add('2022');
    return Array.from(set).sort();
  }, [items]);

  // Filtered and Sorted Items
  const filteredItems = useMemo(() => {
    return items
      .filter((it) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const dayName = getNamaHariIndonesia(it.tanggal).toLowerCase();
          const formattedDate = formatIndonesianDateStr(it.tanggal).toLowerCase();
          const matches =
            it.nama.toLowerCase().includes(q) ||
            it.kategori.toLowerCase().includes(q) ||
            it.tanggal.toLowerCase().includes(q) ||
            dayName.includes(q) ||
            formattedDate.includes(q) ||
            (it.keterangan && it.keterangan.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Kategori filter
        if (selectedKategori !== 'ALL') {
          if (it.kategori !== selectedKategori) return false;
        }

        // Tahun filter
        if (selectedTahun !== 'ALL') {
          if (!it.tanggal.startsWith(selectedTahun)) return false;
        }

        return true;
      })
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [items, searchQuery, selectedKategori, selectedTahun]);

  // Statistics
  const totalCount = items.length;
  const hariBesarCount = items.filter(
    (it) => it.kategori === 'Hari Besar Nasional' || it.isLibur
  ).length;
  const hariPeringatanCount = items.filter(
    (it) => it.kategori === 'Hari Peringatan' && !it.isLibur
  ).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HariKhususItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    onDeleteItem(id);
    if (onShowToast) {
      onShowToast(`Hari Khusus "${nama}" berhasil dihapus.`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Banner / Breadcrumb Connection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50/70 via-white to-rose-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#008d91] text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-800">
                Hari Khusus Calendar To-Do List
              </h1>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Terkoneksi Kalender
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Selain hari Sabtu dan Minggu, tanggal dengan <strong className="text-rose-600 font-semibold">Hari Besar Nasional</strong> pada Calendar To-Do List dibuat merah dan libur.
            </p>
          </div>
        </div>

        {/* Action to Jump directly to Calendar To-Do List */}
        <button
          type="button"
          onClick={onNavigateToCalendar}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-[#008d91] hover:text-[#007b7f] font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap"
        >
          <CalendarDays className="w-4 h-4 text-[#008d91]" />
          <span>Buka Calendar To-Do List</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Hari Khusus</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Terdaftar di sistem</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-700">Hari Besar Nasional (Libur)</div>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">{hariBesarCount}</div>
            <div className="text-[11px] text-rose-600/80 mt-0.5">Ditampilkan Merah & Libur</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <span className="font-bold text-base">🔴</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-amber-700">Hari Peringatan (Non-Libur)</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{hariPeringatanCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Peringatan hari khusus kerja</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Filters Badge Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedKategori('ALL')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              selectedKategori === 'ALL'
                ? 'bg-[#008d91] text-white border-[#008d91]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedKategori('Hari Besar Nasional')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedKategori === 'Hari Besar Nasional'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Hari Besar Nasional (Libur)
          </button>
          <button
            type="button"
            onClick={() => setSelectedKategori('Hari Peringatan')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              selectedKategori === 'Hari Peringatan'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            Hari Peringatan
          </button>
        </div>

        {/* Right Actions: EyeOff, Search, Sliders, Add */}
        <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Hari Khusus..."
                autoFocus
                className="text-xs sm:text-sm text-slate-700 outline-none w-40 sm:w-56"
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

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterDropdownOpen((prev) => !prev);
              }}
              title="Filter lanjutan"
              aria-label="Filter lanjutan"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                selectedTahun !== 'ALL' || selectedKategori !== 'ALL'
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {isFilterDropdownOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-10 z-30 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-xs flex flex-col gap-3 animate-in fade-in zoom-in-95"
              >
                <div className="font-bold text-slate-800 text-sm">Filter Data</div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Filter Tahun:</label>
                  <select
                    value={selectedTahun}
                    onChange={(e) => setSelectedTahun(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                  >
                    <option value="ALL">Semua Tahun</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Tahun {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori:</label>
                  <select
                    value={selectedKategori}
                    onChange={(e) => setSelectedKategori(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {KATEGORI_HARI_KHUSUS_OPTIONS.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKategori('ALL');
                      setSelectedTahun('ALL');
                    }}
                    className="text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Reset Filter
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="bg-[#008d91] text-white px-3 py-1 rounded-lg font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-transparent w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold">
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">Tanggal</th>
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">Nama Hari Khusus</th>
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">Kategori</th>
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">Status Libur</th>
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">Terkoneksi Kalender</th>
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800">Keterangan</th>
                <th className="py-3.5 px-3 sm:px-4 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data Hari Khusus ditemukan. Klik "+ Add" untuk menambahkan hari khusus baru.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const dayName = getNamaHariIndonesia(item.tanggal);
                  const formattedDate = formatIndonesianDateStr(item.tanggal);
                  const isRedHoliday = item.kategori === 'Hari Besar Nasional' || item.isLibur;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Column 1: Tanggal */}
                      <td className="py-3.5 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm font-normal">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isRedHoliday ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {formattedDate}
                          </span>
                          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            {dayName}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Nama Hari Khusus */}
                      <td className="py-3.5 px-3 sm:px-4 text-slate-800 text-xs sm:text-sm font-semibold">
                        <div className="flex items-center gap-1.5">
                          {isRedHoliday && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                          )}
                          <span className={isRedHoliday ? 'text-rose-700' : 'text-slate-800'}>
                            {item.nama}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Kategori */}
                      <td className="py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-normal">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.kategori === 'Hari Besar Nasional'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.kategori === 'Hari Peringatan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : item.kategori === 'Cuti Bersama'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          {item.kategori}
                        </span>
                      </td>

                      {/* Column 4: Status Libur (Checklist dan Tidak) */}
                      <td className="py-3.5 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(item.isLibur)}
                            onChange={() => onToggleLibur(item)}
                            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                          />
                          <span
                            className={`text-xs font-semibold ${
                              item.isLibur ? 'text-rose-600' : 'text-slate-400'
                            }`}
                          >
                            {item.isLibur ? 'Checklist (Libur)' : 'Tidak Libur'}
                          </span>
                        </label>
                      </td>

                      {/* Column 5: Terkoneksi Kalender */}
                      <td className="py-3.5 px-3 sm:px-4 text-xs sm:text-sm">
                        {isRedHoliday ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Merah & Libur
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Hari Peringatan
                          </span>
                        )}
                      </td>

                      {/* Column 6: Keterangan */}
                      <td className="py-3.5 px-3 sm:px-4 text-slate-500 text-xs sm:text-sm font-normal max-w-xs truncate">
                        {item.keterangan || '-'}
                      </td>

                      {/* Column 7: 3-dots action menu */}
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
                                handleOpenEdit(item);
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
                                handleDelete(item.id, item.nama);
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddEditHariKhususModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(savedItem) => {
          onSaveItem(savedItem);
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
      />
    </div>
  );
};
