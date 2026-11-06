import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Check,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Filter,
  CalendarOff,
} from 'lucide-react';
import {
  CutiKaryawanItem,
  JenisCuti,
  CutiStatus,
  JENIS_CUTI_OPTIONS,
  CUTI_STATUS_OPTIONS,
  formatIndoDate,
} from '../cutiKaryawanData';
import { KaryawanItem } from '../types';
import { AddEditCutiKaryawanModal } from './AddEditCutiKaryawanModal';

interface FormCutiKaryawanViewProps {
  items: CutiKaryawanItem[];
  karyawanList: KaryawanItem[];
  onSaveItem: (item: CutiKaryawanItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: CutiStatus) => void;
  onNavigateToKaryawan?: () => void;
  onShowToast?: (message: string) => void;
}

export const FormCutiKaryawanView: React.FC<FormCutiKaryawanViewProps> = ({
  items,
  karyawanList,
  onSaveItem,
  onDeleteItem,
  onUpdateStatus,
  onNavigateToKaryawan,
  onShowToast = (_msg: string) => {},
}) => {
  // Privacy toggle
  const [hideSensitive, setHideSensitive] = useState(false);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedJenisCuti, setSelectedJenisCuti] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Popover menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CutiKaryawanItem | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Divisions available
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.divisi) set.add(it.divisi.toUpperCase());
    });
    karyawanList.forEach((k) => {
      if (k.divisi) set.add(k.divisi.toUpperCase());
    });
    return Array.from(set);
  }, [items, karyawanList]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = item.namaKaryawan.toLowerCase().includes(q);
        const matchKode = item.kodeKaryawan.toLowerCase().includes(q);
        const matchPanggilan = (item.namaPanggilan || '').toLowerCase().includes(q);
        const matchDivisi = item.divisi.toLowerCase().includes(q);
        const matchJenis = item.jenisCuti.toLowerCase().includes(q);
        const matchKet = item.keterangan.toLowerCase().includes(q);
        const matchNomor = item.nomorPengajuan.toLowerCase().includes(q);
        if (
          !matchNama &&
          !matchKode &&
          !matchPanggilan &&
          !matchDivisi &&
          !matchJenis &&
          !matchKet &&
          !matchNomor
        ) {
          return false;
        }
      }

      // Filter Divisi
      if (selectedDivisi !== 'ALL') {
        if (item.divisi.toUpperCase() !== selectedDivisi) {
          return false;
        }
      }

      // Filter Jenis Cuti
      if (selectedJenisCuti !== 'ALL') {
        if (item.jenisCuti !== selectedJenisCuti) {
          return false;
        }
      }

      // Filter Status
      if (selectedStatus !== 'ALL') {
        if (item.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedDivisi, selectedJenisCuti, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const disetujui = items.filter((i) => i.status === 'Disetujui').length;
    const menunggu = items.filter((i) => i.status === 'Menunggu Acc').length;
    const totalHari = items
      .filter((i) => i.status === 'Disetujui')
      .reduce((acc, curr) => acc + (curr.durasiHari || 0), 0);
    return { total, disetujui, menunggu, totalHari };
  }, [items]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setActiveMenuId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CutiKaryawanItem) => {
    setEditingItem(item);
    setActiveMenuId(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    onDeleteItem(id);
    onShowToast(`Data cuti "${nama}" berhasil dihapus`);
    setActiveMenuId(null);
  };

  const handleToggleStatus = (item: CutiKaryawanItem) => {
    const nextStatus: CutiStatus =
      item.status === 'Disetujui' ? 'Menunggu Acc' : 'Disetujui';
    if (onUpdateStatus) {
      onUpdateStatus(item.id, nextStatus);
    } else {
      const updated: CutiKaryawanItem = {
        ...item,
        status: nextStatus,
        disetujuiOleh: nextStatus === 'Disetujui' ? 'Ko Agus (UMM)' : undefined,
      };
      onSaveItem(updated);
    }
    onShowToast(`Status cuti ${item.namaKaryawan} diubah menjadi: ${nextStatus}`);
    setActiveMenuId(null);
  };

  // Helper for badge
  const getJenisBadge = (jenis: JenisCuti) => {
    const conf = JENIS_CUTI_OPTIONS.find((j) => j.value === jenis);
    if (!conf) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
          {jenis}
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${conf.dotColor}`} />
        <span>{conf.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status: CutiStatus) => {
    const conf = CUTI_STATUS_OPTIONS.find((s) => s.value === status);
    if (!conf) {
      return (
        <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
    }
    return (
      <span
        className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder}`}
      >
        {conf.label}
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Pengajuan
              </span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800">
              {stats.total}
            </div>
            <span className="text-[11px] text-slate-400">Permohonan Cuti</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/60 to-emerald-50/40 border border-teal-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#008d91] uppercase tracking-wider">
                Cuti Disetujui
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-teal-800">
              {stats.disetujui}
            </div>
            <span className="text-[11px] text-teal-600">Disetujui HR / Manager</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-amber-100/40 border border-amber-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                Menunggu Acc
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-800">
              {stats.menunggu}
            </div>
            <span className="text-[11px] text-amber-600">Perlu Konfirmasi</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/40 border border-indigo-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Hari Cuti Terpakai
              </span>
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-800">
              {stats.totalHari}
            </div>
            <span className="text-[11px] text-indigo-500">Hari Kerja Kumulatif</span>
          </div>
        </div>

        {/* Toolbar Header matching other views */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#008d91] flex items-center justify-center border border-teal-100 shadow-xs">
              <CalendarOff className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                  Form cuti Karyawan
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#008d91] border border-teal-200">
                  {filteredItems.length} Data
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengajuan cuti karyawan terkoneksi dengan Master Karyawan YPPLN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            {/* Link to Master Karyawan button */}
            {onNavigateToKaryawan && (
              <button
                type="button"
                onClick={onNavigateToKaryawan}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Master Karyawan"
              >
                <Users className="w-3.5 h-3.5 text-[#008d91]" />
                <span className="hidden md:inline">Lihat Master Karyawan</span>
              </button>
            )}

            {/* Privacy Toggle */}
            <button
              type="button"
              onClick={() => setHideSensitive(!hideSensitive)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              title={hideSensitive ? 'Tampilkan Data' : 'Sembunyikan Data'}
            >
              {hideSensitive ? (
                <Eye className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            {/* Search Toggle */}
            {searchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari karyawan, jenis cuti, atau alasan..."
                  autoFocus
                  className="text-xs sm:text-sm text-slate-700 outline-none w-44 sm:w-60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  searchQuery
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Pencarian"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}

            {/* Filter Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  selectedDivisi !== 'ALL' ||
                  selectedJenisCuti !== 'ALL' ||
                  selectedStatus !== 'ALL'
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Filter Data Cuti"
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-30 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Filter Cuti
                    </span>
                    {(selectedDivisi !== 'ALL' ||
                      selectedJenisCuti !== 'ALL' ||
                      selectedStatus !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDivisi('ALL');
                          setSelectedJenisCuti('ALL');
                          setSelectedStatus('ALL');
                        }}
                        className="text-[11px] text-[#008d91] hover:underline font-semibold cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Filter Status */}
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Status:
                    </span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none"
                    >
                      <option value="ALL">Semua Status</option>
                      {CUTI_STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Jenis Cuti */}
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Jenis Cuti:
                    </span>
                    <select
                      value={selectedJenisCuti}
                      onChange={(e) => setSelectedJenisCuti(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none"
                    >
                      <option value="ALL">Semua Jenis Cuti</option>
                      {JENIS_CUTI_OPTIONS.map((j) => (
                        <option key={j.value} value={j.value}>
                          {j.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Divisi */}
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Divisi:
                    </span>
                    <select
                      value={selectedDivisi}
                      onChange={(e) => setSelectedDivisi(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none"
                    >
                      <option value="ALL">Semua Divisi</option>
                      {availableDivisions.map((d) => (
                        <option key={d} value={d}>
                          Divisi {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs shadow-[#008d91]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Cuti</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Pengajuan</th>
                <th className="py-3.5 px-4">Karyawan (ID Terkoneksi)</th>
                <th className="py-3.5 px-4">Jenis Cuti</th>
                <th className="py-3.5 px-4">Tanggal Cuti (Dari s/d)</th>
                <th className="py-3.5 px-4 text-center">Durasi</th>
                <th className="py-3.5 px-4">Keterangan / Keperluan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarOff className="w-10 h-10 text-slate-300 stroke-[1.5] mb-2" />
                      <p className="font-semibold text-slate-500">
                        Tidak ada data cuti yang ditemukan
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba sesuaikan pencarian atau filter, atau tambahkan pengajuan cuti baru.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="mt-3 px-4 py-1.5 text-xs font-bold text-[#008d91] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
                      >
                        + Tambah Pengajuan Cuti
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Nomor Pengajuan */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-bold text-slate-600">
                      {item.nomorPengajuan}
                    </td>

                    {/* Karyawan (ID Terkoneksi) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${
                            item.avatarBg || 'bg-[#14b8a6]'
                          } text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                        >
                          {item.avatarInitial ||
                            item.namaKaryawan[0]?.toUpperCase() ||
                            'K'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {item.namaKaryawan}
                            </span>
                            {item.namaPanggilan && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                ({item.namaPanggilan})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono font-semibold text-[#008d91]">
                              ID: {item.kodeKaryawan}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-500">
                              Divisi {item.divisi}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Jenis Cuti */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getJenisBadge(item.jenisCuti)}
                    </td>

                    {/* Tanggal Cuti: Dari tanggal berapa sampai berapa */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{formatIndoDate(item.tanggalMulai)}</span>
                          <span className="text-slate-400">s/d</span>
                          <span>{formatIndoDate(item.tanggalSelesai)}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Diajukan: {formatIndoDate(item.tanggalPengajuan)}
                        </span>
                      </div>
                    </td>

                    {/* Durasi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {item.durasiHari}{' '}
                        {item.durasiHari === 0.5 ? 'Hari (Setengah)' : 'Hari'}
                      </span>
                    </td>

                    {/* Keterangan */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {hideSensitive
                          ? '••••••••••••••••••••••••'
                          : item.keterangan || '-'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === item.id ? null : item.id
                            );
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-left"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>
                                {item.status === 'Disetujui'
                                  ? 'Set Menunggu Acc'
                                  : 'Acc / Setujui Cuti'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              <span>Edit Data</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item.id, item.namaKaryawan)
                              }
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Hapus Cuti</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div>
          Menampilkan <span className="font-bold text-slate-600">{filteredItems.length}</span> dari{' '}
          <span className="font-bold text-slate-600">{items.length}</span> total pengajuan cuti
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Disetujui</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Menunggu Acc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Ditolak</span>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Cuti */}
      <AddEditCutiKaryawanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(saved) => {
          onSaveItem(saved);
          onShowToast(
            `Data cuti untuk "${saved.namaKaryawan}" berhasil ${
              editingItem ? 'diperbarui' : 'ditambahkan'
            }`
          );
        }}
        editingItem={editingItem}
        karyawanList={karyawanList}
      />
    </div>
  );
};
