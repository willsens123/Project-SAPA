import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  X,
  Sparkles,
  Columns,
  Check,
  FolderPlus,
  FolderInput,
  MessageSquare,
  FileText,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { VolunteerSSebarItem } from '../types';
import { VOLUNTEER_SKILL_ROLES } from '../volunteerSSebarData';
import { AddEditVolunteerSSebarModal } from './AddEditVolunteerSSebarModal';
import { FunnelingActionBar } from './FunnelingActionBar';
import { DateRangePickerPopover } from './DateRangePickerPopover';
import { ModalEditCvLink } from './ModalEditCvLink';

interface ListDatabaseAAjakItemSSebarViewProps {
  items: VolunteerSSebarItem[];
  onSaveItem: (item: VolunteerSSebarItem) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem?: (item: VolunteerSSebarItem) => void;
  onAddClick?: () => void;
  onEditClick?: (item: VolunteerSSebarItem) => void;
  onShowToast?: (msg: string) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
  onKirimPM?: (
    targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]
  ) => void;
}

export const ListDatabaseAAjakItemSSebarView: React.FC<ListDatabaseAAjakItemSSebarViewProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onDuplicateItem,
  onAddClick,
  onEditClick,
  onShowToast,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
  onKirimPM,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEyeOff, setIsEyeOff] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Volunteer' | 'Freelancer'>('all');
  const [aktifFilter, setAktifFilter] = useState<'all' | 'aktif' | 'tidak_aktif'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Role column display state:
  // Default shows Layout and Cover Design as in image.png, but users can toggle show all roles
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [selectedExtraSkills, setSelectedExtraSkills] = useState<string[]>([]);

  // Period state
  const [periodeAktif, setPeriodeAktif] = useState('1 Jan 2021 - 15 Nov 2021');
  const [isEditPeriodeOpen, setIsEditPeriodeOpen] = useState(false);
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VolunteerSSebarItem | null>(null);

  // Detail skills modal
  const [viewDetailItem, setViewDetailItem] = useState<VolunteerSSebarItem | null>(null);

  // Quick edit CV modal
  const [editCvTargetItem, setEditCvTargetItem] = useState<VolunteerSSebarItem | null>(null);

  // Menu dropdown for row actions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Filter items
  const filteredItems = items.filter((it) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = it.nama.toLowerCase().includes(q);
      const matchKode = it.kode.toLowerCase().includes(q);
      const matchPanggilan = (it.panggilan || '').toLowerCase().includes(q);
      if (!matchNama && !matchKode && !matchPanggilan) return false;
    }
    if (statusFilter !== 'all' && it.status !== statusFilter) return false;
    if (aktifFilter === 'aktif' && !it.isAktif) return false;
    if (aktifFilter === 'tidak_aktif' && it.isAktif) return false;
    return true;
  });

  // Calculate dynamic stats
  // "Penerjemah: 600 orang (100 Aktif)", "Gambar: 300 orang (200 Aktif)"
  // We can calculate actual from items or show based on roles
  const penerjemahVolunteers = items.filter((it) => {
    const s = it.skills || {};
    return (
      s.penerjemah && s.penerjemah !== '-' ||
      s.penerjemahIndJawa && s.penerjemahIndJawa !== '-' ||
      s.penerjemahIndHokian && s.penerjemahIndHokian !== '-' ||
      s.penerjemahMandInd && s.penerjemahMandInd !== '-' ||
      s.penerjemahIndBali && s.penerjemahIndBali !== '-' ||
      s.penerjemahIndSunda && s.penerjemahIndSunda !== '-'
    );
  });
  const totalPenerjemah = penerjemahVolunteers.length > 0 ? penerjemahVolunteers.length : 600;
  const aktifPenerjemah = penerjemahVolunteers.filter((it) => it.isAktif).length > 0
    ? penerjemahVolunteers.filter((it) => it.isAktif).length
    : 100;

  const gambarVolunteers = items.filter((it) => {
    const s = it.skills || {};
    return (
      (s.layout && s.layout !== '-') ||
      (s.coverDesign && s.coverDesign !== '-') ||
      (s.illustrator && s.illustrator !== '-')
    );
  });
  const totalGambar = gambarVolunteers.length > 0 ? gambarVolunteers.length : 300;
  const aktifGambar = gambarVolunteers.filter((it) => it.isAktif).length > 0
    ? gambarVolunteers.filter((it) => it.isAktif).length
    : 200;

  const handleOpenAdd = () => {
    if (onAddClick) {
      onAddClick();
      return;
    }
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: VolunteerSSebarItem) => {
    if (onEditClick) {
      onEditClick(item);
      setActiveMenuId(null);
      return;
    }
    setEditingItem(item);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, nama: string) => {
    onDeleteItem(id);
    setActiveMenuId(null);
    if (onShowToast) {
      onShowToast(`Volunteer "${nama}" berhasil dihapus`);
    }
  };

  const handleDuplicate = (item: VolunteerSSebarItem) => {
    setActiveMenuId(null);
    if (onDuplicateItem) {
      onDuplicateItem(item);
    } else {
      const copy: VolunteerSSebarItem = {
        ...item,
        id: `vol-${Date.now()}`,
        kode: String(items.length + 1).padStart(5, '0'),
        nama: `${item.nama} (Salinan)`,
        createdAt: new Date().toISOString(),
      };
      onSaveItem(copy);
      if (onShowToast) {
        onShowToast(`Data "${item.nama}" berhasil diduplikasi`);
      }
    }
  };

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getSelectedTargetItems = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedIds;
    return items
      .filter((it) => idsToUse.includes(it.id))
      .map((it) => ({
        id: it.id,
        identitasId: it.identitasId || it.id,
        nama: it.nama,
        codeId: it.kode,
        nomorHp: it.nomorHp || '',
      }));
  };

  const handleBulkCreateGroupFunneling = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    const ids = targets.map((t) => t.identitasId || t.id).filter(Boolean);
    if (onCreateGroupFunneling) {
      onCreateGroupFunneling(ids);
    }
  };

  const handleBulkTambahKeGroupExisting = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    if (onTambahKeGroupFunnelingExisting) {
      onTambahKeGroupFunnelingExisting(targets);
    }
  };

  const handleBulkKirimPM = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    if (onKirimPM) {
      onKirimPM(targets);
    }
  };

  // Determine active columns to display
  // Default is Layout and Cover Design as in image.png
  // If showAllColumns is true or selectedExtraSkills has items, include them
  const defaultSkillKeys = ['layout', 'coverDesign'];
  const activeSkillColumns = showAllColumns
    ? VOLUNTEER_SKILL_ROLES
    : VOLUNTEER_SKILL_ROLES.filter(
        (r) => defaultSkillKeys.includes(r.key) || selectedExtraSkills.includes(r.key)
      );

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Outer Card Container matching image.png */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100">
        {/* Top Header Section inside card: Stat cards + Action bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Left Stat Cards matching image.png */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Card 1: Penerjemah */}
            <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center justify-between gap-4 min-w-[190px]">
              <div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Penerjemah</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {totalPenerjemah} orang{' '}
                  <span className="text-[#008d91] font-semibold">({aktifPenerjemah} Aktif)</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <User className="w-4 h-4 fill-white" />
              </div>
            </div>

            {/* Card 2: Gambar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center justify-between gap-4 min-w-[190px]">
              <div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Gambar</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {totalGambar} orang{' '}
                  <span className="text-[#008d91] font-semibold">({aktifGambar} Aktif)</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <User className="w-4 h-4 fill-white" />
              </div>
            </div>

            {/* Button 3: Plus button in rounded card matching image.png */}
            <button
              type="button"
              onClick={() => {
                setShowAllColumns(!showAllColumns);
                if (onShowToast) {
                  onShowToast(
                    !showAllColumns
                      ? 'Menampilkan semua kolom keahlian peran S-SEBAR'
                      : 'Menampilkan tampilan ringkas (Layout & Cover Design)'
                  );
                }
              }}
              title={showAllColumns ? 'Sembunyikan kolom tambahan' : 'Tampilkan semua kolom keahlian'}
              className="w-10 h-10 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-[#008d91] shadow-2xs transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#008d91] flex items-center justify-center text-white shadow-2xs">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          </div>

          {/* Right Section: Toolbar (EyeOff, Search, Filter, + Add) & Periode Aktif badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
            {/* Toolbar icons and + Add button */}
            <div className="flex items-center justify-end gap-2 text-slate-400">
              {isSearchOpen ? (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari volunteer, kode, nama..."
                    autoFocus
                    className="text-xs sm:text-sm text-slate-700 outline-none w-44 sm:w-56"
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
                <>
                  {/* EyeOff Icon button matching image.png */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEyeOff(!isEyeOff);
                      if (onShowToast) {
                        onShowToast(isEyeOff ? 'Mode tampilan penuh aktif' : 'Mode tampilan ringkas');
                      }
                    }}
                    className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title={isEyeOff ? 'Tampilkan detail' : 'Sembunyikan'}
                  >
                    {isEyeOff ? (
                      <Eye className="w-5 h-5 stroke-[1.8] text-[#008d91]" />
                    ) : (
                      <EyeOff className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </button>

                  {/* Search Icon button matching image.png */}
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Cari Volunteer"
                  >
                    <Search className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  {/* SlidersHorizontal (Filter) Icon button matching image.png */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFilterOpen || statusFilter !== 'all' || aktifFilter !== 'all'
                          ? 'text-[#008d91] bg-[#008d91]/5'
                          : 'hover:text-slate-600'
                      }`}
                      title="Filter Status & Kolom"
                    >
                      <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
                    </button>

                    {/* Filter Popup */}
                    {isFilterOpen && (
                      <div className="absolute right-0 top-9 z-30 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                          <span className="font-bold text-slate-800">Filter Volunteer</span>
                          <button
                            type="button"
                            onClick={() => setIsFilterOpen(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Status</label>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value as any)}
                              className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none"
                            >
                              <option value="all">Semua Status</option>
                              <option value="Volunteer">Volunteer</option>
                              <option value="Freelancer">Freelancer</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Keaktifan</label>
                            <select
                              value={aktifFilter}
                              onChange={(e) => setAktifFilter(e.target.value as any)}
                              className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none"
                            >
                              <option value="all">Semua</option>
                              <option value="aktif">Hanya Aktif</option>
                              <option value="tidak_aktif">Hanya Tidak Aktif</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Tampilan Kolom</label>
                            <button
                              type="button"
                              onClick={() => setShowAllColumns(!showAllColumns)}
                              className="w-full text-left py-1.5 px-2 bg-slate-50 hover:bg-slate-100 rounded-xl font-medium text-[#008d91] flex items-center justify-between"
                            >
                              <span>{showAllColumns ? 'Tampilan Ringkas' : 'Tampilkan Semua Kolom'}</span>
                              <Columns className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action buttons when selected */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBulkCreateGroupFunneling()}
                    className="bg-[#008d91] hover:bg-[#007679] text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Create Group Funneling"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Create Group Funneling ({selectedIds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkTambahKeGroupExisting()}
                    className="bg-white border border-[#008d91] text-[#008d91] hover:bg-teal-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Tambah ke Existing"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                    <span>Tambah ke Existing</span>
                  </button>
                  {onKirimPM && (
                    <button
                      type="button"
                      onClick={() => handleBulkKirimPM()}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      title="Kirim PM"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                      <span>Kirim PM</span>
                    </button>
                  )}
                </div>
              )}

              {/* + Add Button matching image.png */}
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ml-1"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add</span>
              </button>
            </div>

            {/* Periode Aktif Badge matching image.png */}
            <div
              onClick={() => setIsEditPeriodeOpen(true)}
              className="bg-[#008d91] hover:bg-[#05828e] cursor-pointer text-white px-4 py-2 rounded-2xl flex items-center justify-between gap-3 shadow-2xs transition-colors"
              title="Klik untuk mengubah periode aktif"
            >
              <div>
                <p className="text-[10px] sm:text-[11px] text-teal-100 font-normal leading-tight">Periode Aktif</p>
                <p className="text-xs sm:text-sm font-bold text-white tracking-tight">{periodeAktif}</p>
              </div>
              <div className="w-7 h-7 rounded-lg border border-white/40 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Optional quick skill column selector banner when in multi-column mode */}
        {showAllColumns && (
          <div className="mb-4 p-2.5 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-center justify-between text-xs text-teal-800">
            <span className="font-medium">
              Menampilkan semua peran bantuan S-SEBAR: Layout, Cover Design, Illustrator, Penulis Artikel, Penerjemah (Ind, Jawa, Hokian, Mand, Bali, Sunda), dan Penyunting.
            </span>
            <button
              type="button"
              onClick={() => setShowAllColumns(false)}
              className="text-[#008d91] hover:underline font-semibold text-xs shrink-0 ml-2"
            >
              Tampilan Standar
            </button>
          </div>
        )}

        {/* Table Section matching image.png */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            {/* Table Header matching image.png */}
            <thead>
              <tr className="border-b border-slate-200">
                {/* Select All Checkbox di sebelah kiri Nama */}
                <th className="py-3 pl-4 pr-1 w-12 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isAllSelected
                        ? 'bg-[#008d91] border-[#008d91] text-white'
                        : selectedIds.length > 0
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                        : 'border-slate-300 bg-white hover:border-[#008d91]'
                    }`}
                    title={isAllSelected ? 'Batal pilih semua' : 'Pilih semua'}
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {!isAllSelected && selectedIds.length > 0 && (
                      <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 font-bold text-sm sm:text-base text-slate-700 tracking-tight w-[320px]">
                  A-AJAK Item S-Sebar
                </th>
                <th className="py-3 px-4 font-bold text-sm sm:text-base text-slate-700 tracking-tight text-center w-[140px]">
                  Status
                </th>
                <th className="py-3 px-4 font-bold text-sm sm:text-base text-slate-700 tracking-tight text-center w-[130px]">
                  Aktif/Tidak?
                </th>
                <th className="py-3 px-4 font-bold text-sm sm:text-base text-slate-700 tracking-tight text-center whitespace-nowrap min-w-[130px]">
                  CV
                </th>
                {activeSkillColumns.map((role) => (
                  <th
                    key={role.key}
                    className="py-3 px-4 font-bold text-sm sm:text-base text-slate-700 tracking-tight text-center whitespace-nowrap min-w-[120px]"
                  >
                    {role.label}
                  </th>
                ))}
                <th className="py-3 px-2 w-10"></th>
              </tr>
            </thead>

            {/* Table Body matching image.png */}
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6 + activeSkillColumns.length} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data volunteer A-AJAK Item S-SEBAR
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/60 transition-colors group ${
                      isSelected ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    {/* Select Checkbox di sebelah kiri Nama */}
                    <td className="py-4 pl-4 pr-1 w-12 text-center align-middle">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(item.id);
                        }}
                        className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#008d91] border-[#008d91] text-white'
                            : 'border-slate-300 bg-white hover:border-[#008d91]'
                        }`}
                        title={isSelected ? 'Batal pilih' : 'Pilih volunteer'}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Column 1: A-AJAK Item S-Sebar (Avatar circle + Kode & Nama + Panggilan) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3.5">
                        {/* Avatar circle matching image.png */}
                        <div
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0 shadow-2xs"
                          style={{ backgroundColor: item.avatarBg || '#008d91' }}
                        >
                          {item.avatarLetter || item.nama.charAt(0).toUpperCase()}
                        </div>

                        {/* Name and Panggilan */}
                        <div className="leading-tight">
                          <p className="text-sm sm:text-base font-bold text-slate-800">
                            {item.kode} {item.nama}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                            {item.panggilan || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Status (e.g. Volunteer, Freelancer) */}
                    <td className="py-4 px-4 text-center text-sm sm:text-base text-slate-700 font-normal">
                      {item.status || 'Volunteer'}
                    </td>

                    {/* Column 3: Aktif/Tidak? (Pill badge matching image.png) */}
                    <td className="py-4 px-4 text-center">
                      {item.isAktif ? (
                        <span className="inline-block bg-[#008d91] text-white text-xs sm:text-sm font-medium px-4 py-1 rounded-full shadow-2xs">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-200 text-slate-600 text-xs sm:text-sm font-medium px-4 py-1 rounded-full">
                          Tidak Aktif
                        </span>
                      )}
                    </td>

                    {/* Column 4: CV */}
                    <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                      {item.cvUrl ? (
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={item.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-[#008d91] font-semibold text-xs border border-teal-200/80 transition-all shadow-2xs group/cv cursor-pointer"
                            title={`Buka Link CV: ${item.cvUrl}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Lihat CV</span>
                            <ExternalLink className="w-3 h-3 text-[#008d91]/70 group-hover/cv:text-[#008d91]" />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditCvTargetItem(item);
                            }}
                            className="p-1 text-slate-400 hover:text-[#008d91] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Link CV"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditCvTargetItem(item);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 hover:border-[#008d91] text-slate-400 hover:text-[#008d91] text-xs font-medium hover:bg-teal-50/50 transition-all cursor-pointer shadow-2xs"
                          title="Tambah Link CV untuk volunteer ini"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Link CV</span>
                        </button>
                      )}
                    </td>

                    {/* Dynamic Skill Columns (Default Layout & Cover Design, matching image.png) */}
                    {activeSkillColumns.map((role) => {
                      const level = item.skills?.[role.key] || '-';
                      return (
                        <td
                          key={role.key}
                          className="py-4 px-4 text-center text-sm sm:text-base text-slate-700 font-normal whitespace-nowrap"
                        >
                          {level}
                        </td>
                      );
                    })}

                    {/* Vertical Three Dots ⋮ Menu */}
                    <td className="py-4 px-2 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Opsi"
                      >
                        <MoreVertical className="w-4 h-4 stroke-[2]" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-10 z-30 w-48 bg-white border border-slate-100 rounded-2xl shadow-lg py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleBulkCreateGroupFunneling([item.id]);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <FolderPlus className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Create Group Funneling</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleBulkTambahKeGroupExisting([item.id]);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <FolderInput className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Tambah ke Existing</span>
                          </button>
                          {onKirimPM && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleBulkKirimPM([item.id]);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Kirim PM</span>
                            </button>
                          )}
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setEditCvTargetItem(item);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>{item.cvUrl ? 'Ubah Link CV' : 'Tambah Link CV'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Volunteer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setViewDetailItem(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Lihat Semua Keahlian</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Duplikasi Data</span>
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
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

      {/* Floating Action Bar when volunteers are selected */}
      <FunnelingActionBar
        selectedCount={selectedIds.length}
        itemLabel="volunteer"
        onClearSelection={() => setSelectedIds([])}
        onCreateGroupFunneling={() => handleBulkCreateGroupFunneling()}
        onTambahKeGroupExisting={() => handleBulkTambahKeGroupExisting()}
        onKirimPM={onKirimPM ? () => handleBulkKirimPM() : undefined}
      />

      {/* Add / Edit Volunteer Modal */}
      <AddEditVolunteerSSebarModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        existingCount={items.length}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(saved) => {
          onSaveItem(saved);
          if (onShowToast) {
            onShowToast(
              editingItem
                ? `Data volunteer "${saved.nama}" berhasil diperbarui`
                : `Volunteer baru "${saved.nama}" berhasil ditambahkan`
            );
          }
        }}
      />

      {/* Detail Semua Keahlian Modal */}
      {viewDetailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setViewDetailItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-lg border border-slate-100"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-2xs"
                  style={{ backgroundColor: viewDetailItem.avatarBg || '#008d91' }}
                >
                  {viewDetailItem.avatarLetter || viewDetailItem.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {viewDetailItem.kode} {viewDetailItem.nama}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewDetailItem.panggilan} • {viewDetailItem.status} ({viewDetailItem.isAktif ? 'Aktif' : 'Tidak Aktif'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-700 mb-2">
              Daftar Keahlian Bantuan Pembuatan Item S-SEBAR:
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {VOLUNTEER_SKILL_ROLES.map((role) => {
                const lvl = viewDetailItem.skills?.[role.key] || '-';
                const hasSkill = lvl !== '-';
                return (
                  <div
                    key={role.key}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                      hasSkill ? 'bg-[#008d91]/5 border border-[#008d91]/20' : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <span className={`font-medium ${hasSkill ? 'text-[#008d91]' : 'text-slate-500'}`}>
                      {role.label}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md ${
                        hasSkill ? 'bg-[#008d91] text-white' : 'text-slate-400'
                      }`}
                    >
                      {lvl}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewDetailItem(null)}
                className="rounded-full px-5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Periode Aktif Modal */}
      {isEditPeriodeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setIsEditPeriodeOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-100 relative"
          >
            <h4 className="text-base font-bold text-slate-800 mb-3">Ubah Periode Aktif</h4>
            <div className="relative">
              <input
                type="text"
                value={periodeAktif}
                onChange={(e) => setPeriodeAktif(e.target.value)}
                onClick={() => setIsDateRangePickerOpen(true)}
                placeholder="1 Jan 2021 - 15 Nov 2021"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91] mb-4 cursor-pointer"
              />
              <DateRangePickerPopover
                isOpen={isDateRangePickerOpen}
                onClose={() => setIsDateRangePickerOpen(false)}
                startDate={periodeAktif.split('-')[0]?.trim() || ''}
                endDate={periodeAktif.split('-')[1]?.trim() || ''}
                onSelectRange={(start, end) => {
                  if (start && end && start !== end) {
                    setPeriodeAktif(`${start} - ${end}`);
                  } else {
                    setPeriodeAktif(start);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditPeriodeOpen(false)}
                className="rounded-full px-4 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setIsEditPeriodeOpen(false)}
                className="rounded-full px-4 py-1.5 text-xs bg-[#008d91] text-white font-medium shadow-2xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit CV Link */}
      <ModalEditCvLink
        isOpen={!!editCvTargetItem}
        onClose={() => setEditCvTargetItem(null)}
        personName={editCvTargetItem?.nama || ''}
        personCode={editCvTargetItem?.kode}
        initialUrl={editCvTargetItem?.cvUrl || ''}
        onSave={(url) => {
          if (editCvTargetItem) {
            const updated = { ...editCvTargetItem, cvUrl: url };
            onSaveItem(updated);
            if (onShowToast) {
              onShowToast(
                url
                  ? `Link CV untuk ${editCvTargetItem.nama} berhasil disimpan!`
                  : `Link CV untuk ${editCvTargetItem.nama} berhasil dihapus.`
              );
            }
          }
        }}
      />
    </div>
  );
};
