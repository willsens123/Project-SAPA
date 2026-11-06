import React, { useState } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  ChevronDown,
  X,
  User,
  Trash2,
  Edit2,
  ExternalLink,
  AlertCircle,
  Check,
  Star,
  FolderPlus,
  FolderInput,
  MessageSquare,
  Receipt,
} from 'lucide-react';
import { IdentitasItem } from '../identitasData';
import { FunnelingActionBar } from './FunnelingActionBar';

interface IdentitasDashboardProps {
  items: IdentitasItem[];
  onAddNew: () => void;
  onEditItem?: (item: IdentitasItem) => void;
  onDeleteItem?: (id: string) => void;
  onOpenFormPengeluaran?: (item: IdentitasItem) => void;
  onShowToast?: (msg: string) => void;
  duplicateCount?: number;
  onOpenMergeDuplicates?: () => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
  onKirimPM?: (
    targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]
  ) => void;
  onToggleStarItem?: (id: string) => void;
}

export const IdentitasDashboard: React.FC<IdentitasDashboardProps> = ({
  items,
  onAddNew,
  onEditItem,
  onDeleteItem,
  onOpenFormPengeluaran,
  onShowToast = (_msg: string) => {},
  duplicateCount = 0,
  onOpenMergeDuplicates,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
  onKirimPM,
  onToggleStarItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Starred Identitas state
  const [localStarredIds, setLocalStarredIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('starred_identitas_map');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {};
  });

  const isItemStarred = (item: IdentitasItem) => {
    if (localStarredIds[item.id] !== undefined) return localStarredIds[item.id];
    return !!item.isStarred;
  };

  const handleToggleStar = (id: string) => {
    const item = items.find((i) => i.id === id);
    const current = item ? isItemStarred(item) : false;
    const nextVal = !current;
    setLocalStarredIds((prev) => {
      const updated = { ...prev, [id]: nextVal };
      try {
        localStorage.setItem('starred_identitas_map', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    if (onToggleStarItem) {
      onToggleStarItem(id);
    }
    onShowToast(nextVal ? 'Bintang ditambahkan' : 'Bintang dihapus');
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.namaLengkap.toLowerCase().includes(q) ||
        item.namaPanggilan.toLowerCase().includes(q) ||
        (item.codeId && item.codeId.toLowerCase().includes(q)) ||
        item.organisasi.toLowerCase().includes(q) ||
        item.nomorHandPhone.includes(q) ||
        item.pic.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) {
      return false;
    }

    if (selectedRoleFilter !== 'ALL' && item.bhanteLay !== selectedRoleFilter) {
      return false;
    }

    return true;
  });

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  const isAllStarred =
    filteredItems.length > 0 &&
    filteredItems.every((item) => isItemStarred(item));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleStarAll = () => {
    const nextVal = !isAllStarred;
    setLocalStarredIds((prev) => {
      const updated = { ...prev };
      filteredItems.forEach((i) => {
        updated[i.id] = nextVal;
      });
      try {
        localStorage.setItem('starred_identitas_map', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    onShowToast(nextVal ? 'Semua identitas diberi bintang' : 'Semua bintang dihapus');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getSelectedTargetItems = () => {
    return items
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => ({
        id: i.id,
        identitasId: i.id,
        nama: i.namaLengkap,
        nomorHp: i.nomorHandPhone,
        codeId: i.codeId,
      }));
  };

  const handleBulkCreateGroupFunneling = () => {
    if (selectedIds.length === 0) {
      onShowToast('Pilih setidaknya satu data identitas');
      return;
    }
    if (onCreateGroupFunneling) {
      onCreateGroupFunneling(selectedIds);
    }
  };

  const handleBulkTambahKeGroupExisting = () => {
    const targets = getSelectedTargetItems();
    if (targets.length === 0) {
      onShowToast('Pilih setidaknya satu data identitas');
      return;
    }
    if (onTambahKeGroupFunnelingExisting) {
      onTambahKeGroupFunnelingExisting(targets);
    }
  };

  const handleBulkKirimPM = () => {
    const targets = getSelectedTargetItems();
    if (targets.length === 0) {
      onShowToast('Pilih setidaknya satu data identitas');
      return;
    }
    if (onKirimPM) {
      onKirimPM(targets);
    }
  };

  return (
    <div className="w-full">
      {/* Top Toolbar matching Image 1: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3.5 mb-5">
        {/* Toggle Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, ID, HP..."
              autoFocus
              className="text-xs text-slate-700 outline-none w-44 sm:w-64"
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
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        {/* EyeOff Icon */}
        <button
          type="button"
          onClick={() => onShowToast('Fitur visibilitas kolom')}
          title="Sembunyikan / Tampilkan"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders / Filter Icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Filter Data"
            className={`transition-colors p-1 cursor-pointer ${
              isFilterOpen || selectedStatusFilter !== 'ALL' || selectedRoleFilter !== 'ALL'
                ? 'text-[#05828e]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-3.5 z-40 animate-in fade-in duration-150">
              <div className="text-xs font-semibold text-slate-700 mb-2">Filter Status</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['ALL', 'VIP', 'Blacklist', '-'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                      selectedStatusFilter === st
                        ? 'bg-[#05828e] text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua' : st}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-700 mb-2">Filter Peran</div>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'Lay', 'Bhante'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRoleFilter(role)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                      selectedRoleFilter === role
                        ? 'bg-[#05828e] text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role === 'ALL' ? 'Semua' : role}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alert Exclamation Button when duplicates are detected */}
        {duplicateCount > 0 && (
          <button
            id="btn-merge-duplicates-alert"
            type="button"
            onClick={onOpenMergeDuplicates}
            title={`Ditemukan ${duplicateCount} data identitas yang mirip/duplikat. Klik untuk membuka dashboard Merge Duplicates.`}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-xs cursor-pointer animate-in fade-in"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
              !
            </div>
            <span className="font-semibold text-amber-800 hidden sm:inline">
              {duplicateCount} Duplikat
            </span>
          </button>
        )}

        {/* Toolbar selection action buttons */}
        {selectedIds.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkCreateGroupFunneling}
              className="bg-[#008d91] text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-[#00787c] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Buat Group Funneling baru dengan data identitas terpilih"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Group Funneling ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={handleBulkTambahKeGroupExisting}
              className="bg-white border border-[#008d91] text-[#008d91] px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-teal-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Tambah ke Group Funneling yang sudah ada"
            >
              <FolderInput className="w-3.5 h-3.5" />
              <span>Tambah ke Existing</span>
            </button>
            {onKirimPM && (
              <button
                type="button"
                onClick={handleBulkKirimPM}
                className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Kirim PM ke data terpilih"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                <span>Kirim PM</span>
              </button>
            )}
          </div>
        )}

        {/* + Add Button */}
        <button
          id="btn-add-identitas"
          type="button"
          onClick={onAddNew}
          className="bg-[#05828e] text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#046c76] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[13px] font-semibold text-[#475569]">
                {/* Select All Checkbox & Star di sebelah checklist */}
                <th className="py-4 pl-4 pr-2 w-16 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isAllSelected
                          ? 'bg-[#008d91] border-[#008d91] text-white'
                          : selectedIds.length > 0
                          ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                          : 'border-slate-300 bg-white hover:border-[#008d91]'
                      }`}
                      title={isAllSelected ? 'Batal pilih semua' : 'Pilih semua'}
                      aria-label={isAllSelected ? 'Batal pilih semua' : 'Pilih semua'}
                    >
                      {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {!isAllSelected && selectedIds.length > 0 && (
                        <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleStarAll}
                      className="p-1 rounded-md transition-all hover:scale-110 active:scale-95 cursor-pointer text-slate-300 hover:text-amber-400 shrink-0"
                      title={isAllStarred ? 'Hapus semua bintang' : 'Beri bintang semua'}
                      aria-label={isAllStarred ? 'Hapus semua bintang' : 'Beri bintang semua'}
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          isAllStarred
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-none text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  </div>
                </th>
                <th className="py-4 px-4 w-[280px]">Nama</th>
                <th className="py-4 px-4 w-[60px]"></th>
                <th className="py-4 px-4 w-[130px]"></th>
                <th className="py-4 px-4">Bhante/Lay?</th>
                <th className="py-4 px-4">Organisasi</th>
                <th className="py-4 px-4">HP</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Cust?</th>
                <th className="py-4 px-4 whitespace-nowrap">Last Contacted?</th>
                <th className="py-4 px-4 text-center">PIC</th>
                <th className="py-4 px-4 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
              {filteredItems.map((item, idx) => {
                const isMenuOpen = activeMenuId === item.id;
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={`${item.id}-${idx}`}
                    className={`hover:bg-slate-50/70 transition-colors group relative ${
                      isSelected ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    {/* Select Checkbox & Star di sebelah checklist */}
                    <td className="py-3.5 pl-4 pr-2 w-16 text-center align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id);
                          }}
                          className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isSelected
                              ? 'bg-[#008d91] border-[#008d91] text-white'
                              : 'border-slate-300 bg-white hover:border-[#008d91]'
                          }`}
                          title={isSelected ? 'Batal pilih' : 'Pilih identitas'}
                          aria-label={isSelected ? 'Batal pilih' : 'Pilih identitas'}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(item.id);
                          }}
                          className="p-1 rounded-md transition-all hover:scale-110 active:scale-95 cursor-pointer text-slate-300 hover:text-amber-400 shrink-0"
                          title={isItemStarred(item) ? 'Hapus bintang' : 'Beri bintang'}
                          aria-label={isItemStarred(item) ? 'Hapus bintang' : 'Beri bintang'}
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              isItemStarred(item)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-none text-slate-300 hover:text-amber-400'
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Nama Column with Avatar */}
                    <td
                      onClick={() => {
                        if (onOpenFormPengeluaran) {
                          onOpenFormPengeluaran(item);
                        }
                      }}
                      title="Tekan untuk membuka Form Pengeluaran untuk identitas ini"
                      className="py-3.5 px-4 cursor-pointer hover:bg-teal-50/40 transition-colors group/name select-none"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Avatar Initial Circle */}
                        <div
                          className={`w-11 h-11 rounded-full ${item.avatarBg} text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs group-hover/name:scale-105 transition-transform`}
                        >
                          {item.avatarInitial}
                        </div>
                        {/* ID + Nama Lengkap + Nama Panggilan */}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 tracking-tight leading-snug group-hover/name:text-[#008d91] transition-colors">
                            {item.codeId ? `${item.codeId} ` : ''}
                            {item.namaLengkap}
                          </div>
                          <div className="text-xs text-slate-400 font-normal leading-tight mt-0.5">
                            {item.namaPanggilan}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Gender (L / P) */}
                    <td className="py-3.5 px-4 font-normal text-slate-700">
                      {item.jenisKelamin}
                    </td>

                    {/* Tanggal Lahir */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.tanggalLahir}
                    </td>

                    {/* Bhante/Lay? */}
                    <td className="py-3.5 px-4 text-slate-700 font-normal">
                      {item.bhanteLay}
                    </td>

                    {/* Organisasi */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.organisasi}
                    </td>

                    {/* HP */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-normal">
                      {item.nomorHandPhone}
                    </td>

                    {/* Status (VIP / Blacklist / -) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          item.status === 'VIP'
                            ? 'text-slate-800'
                            : item.status === 'Blacklist'
                            ? 'text-slate-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Cust? Badge (Teal pill or Coral/Red pill) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.custDuration === '-' ? (
                        <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#f87171] text-white">
                          -
                        </span>
                      ) : (
                        <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#05828e] text-white">
                          {item.custDuration}
                        </span>
                      )}
                    </td>

                    {/* Last Contacted? */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {item.lastContacted}
                    </td>

                    {/* PIC Button / Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.pic === '-' ? (
                        <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#05828e] text-white">
                          -
                        </span>
                      ) : (
                        <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#05828e] text-white">
                          {item.pic}
                        </span>
                      )}
                    </td>

                    {/* 3 dots action menu */}
                    <td className="py-3.5 px-4 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(isMenuOpen ? null : item.id)
                        }
                        title="Opsi"
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-6 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in duration-100 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onCreateGroupFunneling) {
                                onCreateGroupFunneling([item.id]);
                              }
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FolderPlus className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Create Group Funneling</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onTambahKeGroupFunnelingExisting) {
                                onTambahKeGroupFunnelingExisting([
                                  {
                                    id: item.id,
                                    identitasId: item.id,
                                    nama: item.namaLengkap,
                                    nomorHp: item.nomorHandPhone,
                                    codeId: item.codeId,
                                  },
                                ]);
                              }
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <FolderInput className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Tambah ke Existing</span>
                          </button>
                          {onKirimPM && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onKirimPM([
                                  {
                                    id: item.id,
                                    identitasId: item.id,
                                    nama: item.namaLengkap,
                                    nomorHp: item.nomorHandPhone,
                                    codeId: item.codeId,
                                  },
                                ]);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Kirim PM</span>
                            </button>
                          )}
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onOpenFormPengeluaran) {
                                onOpenFormPengeluaran(item);
                              }
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Receipt className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Form Pengeluaran</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onEditItem) onEditItem(item);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Identitas</span>
                          </button>
                          {onDeleteItem && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteItem(item.id);
                                onShowToast('Identitas berhasil dihapus');
                              }}
                              className="w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Tidak ada data identitas yang sesuai
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar when items selected */}
      <FunnelingActionBar
        selectedCount={selectedIds.length}
        itemLabel="identitas"
        onClearSelection={() => setSelectedIds([])}
        onCreateGroupFunneling={handleBulkCreateGroupFunneling}
        onTambahKeGroupExisting={handleBulkTambahKeGroupExisting}
        onKirimPM={onKirimPM ? handleBulkKirimPM : undefined}
      />
    </div>
  );
};
