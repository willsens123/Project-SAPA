import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  X,
  Sparkles,
  Check,
  MessageSquare,
  FolderPlus,
  FolderInput,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  VolunteerAAjakAllItem,
  loadVolunteerAAjakAll,
  saveVolunteerAAjakAll,
} from '../volunteerAAjakAllData';
import { FunnelingActionBar } from './FunnelingActionBar';
import { ModalEditCvLink } from './ModalEditCvLink';

interface ListDatabaseAAjakAllViewProps {
  onShowToast?: (msg: string) => void;
  onKirimPM?: (targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
}

export const ListDatabaseAAjakAllView: React.FC<ListDatabaseAAjakAllViewProps> = ({
  onShowToast,
  onKirimPM,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
}) => {
  const [items, setItems] = useState<VolunteerAAjakAllItem[]>(() => loadVolunteerAAjakAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEyeOff, setIsEyeOff] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [peringkatFilter, setPeringkatFilter] = useState<'all' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze'>('all');
  const [tahunFilter, setTahunFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Period state matching image.png
  const [periodeAktif, setPeriodeAktif] = useState('1 Jan 2021 - 15 Nov 2021');
  const [isEditPeriodeOpen, setIsEditPeriodeOpen] = useState(false);
  const [tempPeriodeInput, setTempPeriodeInput] = useState(periodeAktif);

  // Dropdown menu state for row actions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VolunteerAAjakAllItem | null>(null);
  const [editCvTargetItem, setEditCvTargetItem] = useState<VolunteerAAjakAllItem | null>(null);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    panggilan: '',
    terakhirAktif: '2021',
    peringkat: 'Platinum',
    karyaText: '',
    kategori: 'Penerjemah',
    avatarBg: '#14b8a6',
    cvUrl: '',
  });

  // Custom Stat cards
  const [statCards, setStatCards] = useState([
    { id: 'stat-1', label: 'Penerjemah', count: '600 orang', active: '100 Aktif' },
    { id: 'stat-2', label: 'Gambar', count: '300 orang', active: '200 Aktif' },
  ]);
  const [isAddStatOpen, setIsAddStatOpen] = useState(false);
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatCount, setNewStatCount] = useState('');
  const [newStatActive, setNewStatActive] = useState('');

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleOpenAdd = () => {
    const nextNum = items.length + 1;
    const nextKode = String(nextNum).padStart(5, '0');
    setEditingItem(null);
    setFormData({
      kode: nextKode,
      nama: '',
      panggilan: '',
      terakhirAktif: '2021',
      peringkat: 'Platinum',
      karyaText: '',
      kategori: 'Penerjemah',
      avatarBg: '#14b8a6',
      cvUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: VolunteerAAjakAllItem) => {
    setEditingItem(item);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      panggilan: item.panggilan,
      terakhirAktif: item.terakhirAktif,
      peringkat: item.peringkat,
      karyaText: item.karya.join('\n'),
      kategori: item.kategori || 'Penerjemah',
      avatarBg: item.avatarBg || '#14b8a6',
      cvUrl: item.cvUrl || '',
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveCvUrl = (itemId: string, newUrl: string) => {
    const updated = items.map((it) =>
      it.id === itemId ? { ...it, cvUrl: newUrl } : it
    );
    setItems(updated);
    saveVolunteerAAjakAll(updated);
    const target = items.find((it) => it.id === itemId);
    const name = target?.nama || 'Volunteer';
    if (onShowToast) {
      onShowToast(
        newUrl
          ? `Link CV untuk ${name} berhasil disimpan!`
          : `Link CV untuk ${name} berhasil dihapus.`
      );
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      if (onShowToast) onShowToast('Nama volunteer tidak boleh kosong');
      return;
    }

    const karyaArr = formData.karyaText
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const letter = (formData.nama.trim()[0] || 'V').toUpperCase();

    if (editingItem) {
      const updated: VolunteerAAjakAllItem[] = items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              kode: formData.kode,
              nama: formData.nama,
              panggilan: formData.panggilan,
              avatarLetter: letter,
              avatarBg: formData.avatarBg,
              terakhirAktif: formData.terakhirAktif,
              peringkat: formData.peringkat,
              karya: karyaArr.length > 0 ? karyaArr : ['Kontributor A-AJAK'],
              kategori: formData.kategori,
              cvUrl: formData.cvUrl.trim(),
            }
          : it
      );
      setItems(updated);
      saveVolunteerAAjakAll(updated);
      if (onShowToast) onShowToast(`Data "${formData.nama}" berhasil diperbarui`);
    } else {
      const newItem: VolunteerAAjakAllItem = {
        id: `aajak-all-${Date.now()}`,
        kode: formData.kode || '00099',
        nama: formData.nama,
        panggilan: formData.panggilan,
        avatarLetter: letter,
        avatarBg: formData.avatarBg,
        terakhirAktif: formData.terakhirAktif,
        peringkat: formData.peringkat,
        karya: karyaArr.length > 0 ? karyaArr : ['Kontributor A-AJAK'],
        kategori: formData.kategori,
        isAktif: true,
        cvUrl: formData.cvUrl.trim(),
      };
      const updated = [newItem, ...items];
      setItems(updated);
      saveVolunteerAAjakAll(updated);
      if (onShowToast) onShowToast(`Volunteer "${formData.nama}" berhasil ditambahkan`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, nama: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveVolunteerAAjakAll(updated);
    setActiveMenuId(null);
    if (onShowToast) onShowToast(`Volunteer "${nama}" berhasil dihapus`);
  };

  const handleDuplicate = (item: VolunteerAAjakAllItem) => {
    setActiveMenuId(null);
    const copy: VolunteerAAjakAllItem = {
      ...item,
      id: `aajak-all-${Date.now()}`,
      kode: String(items.length + 1).padStart(5, '0'),
      nama: `${item.nama} (Salinan)`,
      panggilan: item.panggilan,
      karya: [...item.karya],
    };
    const updated = [copy, ...items];
    setItems(updated);
    saveVolunteerAAjakAll(updated);
    if (onShowToast) onShowToast(`Data "${item.nama}" berhasil diduplikasi`);
  };

  // Filtered items
  const filteredItems = items.filter((it) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = it.nama.toLowerCase().includes(q);
      const matchKode = it.kode.toLowerCase().includes(q);
      const matchPanggilan = (it.panggilan || '').toLowerCase().includes(q);
      const matchKarya = it.karya.some((k) => k.toLowerCase().includes(q));
      if (!matchNama && !matchKode && !matchPanggilan && !matchKarya) return false;
    }
    if (peringkatFilter !== 'all' && it.peringkat !== peringkatFilter) return false;
    if (tahunFilter !== 'all' && it.terakhirAktif !== tahunFilter) return false;
    return true;
  });

  // Get distinct years for filter
  const distinctYears = Array.from(new Set(items.map((it) => it.terakhirAktif))).sort().reverse();

  // Helper for pill badge color of Terakhir Aktif
  const getTahunBadgeClass = (year: string) => {
    if (year === '2021') return 'bg-[#008d91] text-white';
    if (year === '2019' || year === '2020') return 'bg-[#f59e0b] text-white';
    if (year === '2015') return 'bg-[#ef4444] text-white';
    return 'bg-[#008d91] text-white';
  };

  // Helper for pill badge color of Peringkat
  const getPeringkatBadgeClass = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'platinum':
        return 'bg-[#008d91] text-white';
      case 'silver':
        return 'bg-[#f59e0b] text-white';
      case 'gold':
        return 'bg-[#0f766e] text-white';
      case 'bronze':
        return 'bg-[#ef4444] text-white';
      default:
        return 'bg-[#008d91] text-white';
    }
  };

  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id));
    }
  };

  const handleKirimPM = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedIds;
    if (idsToUse.length === 0) return;
    const selectedVolunteerItems = items.filter((item) => idsToUse.includes(item.id));
    if (onKirimPM) {
      onKirimPM(
        selectedVolunteerItems.map((item) => ({
          id: item.id,
          identitasId: item.identitasId || item.id,
          nama: item.nama,
          codeId: item.kode,
        }))
      );
    }
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

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Outer Card Container matching image.png */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100">
        {/* Top Control Bar: Action Buttons on the right matching image.png */}
        <div className="flex items-center justify-end gap-2.5 mb-6">
          {/* Eye visibility toggle */}
          <button
            type="button"
            onClick={() => {
              setIsEyeOff(!isEyeOff);
              if (onShowToast) {
                onShowToast(isEyeOff ? 'Mode tampilan penuh diaktifkan' : 'Mode tampilan ringkas diaktifkan');
              }
            }}
            title={isEyeOff ? 'Tampilkan detail' : 'Sembunyikan detail'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isEyeOff ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Search Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Cari Volunteer"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isSearchOpen || searchQuery
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            {isSearchOpen && (
              <div className="absolute right-0 top-10 z-30 bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 w-64 animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode, nama, karya..."
                  autoFocus
                  className="w-full text-xs text-slate-700 focus:outline-hidden bg-transparent"
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
              </div>
            )}
          </div>

          {/* Filter Sliders Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Data"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isFilterOpen || peringkatFilter !== 'all' || tahunFilter !== 'all'
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 top-10 z-30 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 w-72 animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Filter Volunteer</h4>
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
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Peringkat</label>
                    <select
                      value={peringkatFilter}
                      onChange={(e) => setPeringkatFilter(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-[#008d91] focus:outline-hidden"
                    >
                      <option value="all">Semua Peringkat</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Bronze">Bronze</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Terakhir Aktif</label>
                    <select
                      value={tahunFilter}
                      onChange={(e) => setTahunFilter(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-[#008d91] focus:outline-hidden"
                    >
                      <option value="all">Semua Tahun</option>
                      {distinctYears.map((yr) => (
                        <option key={yr} value={yr}>
                          Tahun {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(peringkatFilter !== 'all' || tahunFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPeringkatFilter('all');
                        setTahunFilter('all');
                      }}
                      className="text-xs text-[#008d91] font-semibold hover:underline w-full text-center pt-1"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

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
              <button
                type="button"
                onClick={() => handleKirimPM()}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Kirim PM"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                <span>Kirim PM</span>
              </button>
            </div>
          )}

          {/* + Add Button matching image.png */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#008d91] hover:bg-[#007679] text-white px-5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Second Row: Stat Cards on Left + Periode Aktif on Right matching image.png */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Left Stat Cards */}
          <div className="flex flex-wrap items-center gap-3">
            {statCards.map((st) => (
              <div
                key={st.id}
                className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center justify-between gap-4 min-w-[190px]"
              >
                <div>
                  <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">{st.label}</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {st.count}{' '}
                    <span className="text-[#008d91] font-semibold">({st.active})</span>
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <User className="w-4 h-4 fill-white" />
                </div>
              </div>
            ))}

            {/* Plus button inside rounded card */}
            <button
              type="button"
              onClick={() => {
                setNewStatLabel('');
                setNewStatCount('');
                setNewStatActive('');
                setIsAddStatOpen(true);
              }}
              title="Tambah Kategori Stat"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-[#008d91] hover:bg-slate-50 hover:border-[#008d91] transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Right: Periode Aktif Pill Card matching image.png */}
          <div className="bg-[#008d91] text-white rounded-2xl px-5 py-2.5 flex items-center justify-between gap-4 shadow-2xs shrink-0 self-start lg:self-auto">
            <div>
              <p className="text-[10px] text-teal-100 font-medium leading-tight">Periode Aktif</p>
              <p className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">
                {periodeAktif}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTempPeriodeInput(periodeAktif);
                setIsEditPeriodeOpen(true);
              }}
              title="Ubah Periode Aktif"
              className="w-8 h-8 rounded-xl border border-teal-400/40 flex items-center justify-center text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Main Table matching image.png */}
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 w-12 pl-4 text-center">
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
                    title="Pilih Semua"
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {!isAllSelected && selectedIds.length > 0 && (
                      <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                    )}
                  </button>
                </th>
                <th className="pb-4 font-bold text-slate-700 text-xs sm:text-sm tracking-wide text-left pl-2 w-[28%]">
                  A-AJAK
                </th>
                <th className="pb-4 font-bold text-slate-700 text-xs sm:text-sm tracking-wide text-center w-[15%]">
                  Terakhir Aktif
                </th>
                <th className="pb-4 font-bold text-slate-700 text-xs sm:text-sm tracking-wide text-center w-[15%]">
                  Peringkat
                </th>
                <th className="pb-4 font-bold text-slate-700 text-xs sm:text-sm tracking-wide text-center sm:text-left sm:pl-6 w-[23%]">
                  Karya
                </th>
                <th className="pb-4 font-bold text-slate-700 text-xs sm:text-sm tracking-wide text-center whitespace-nowrap w-[14%]">
                  CV
                </th>
                <th className="pb-4 w-[5%]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data volunteer A-AJAK yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/60 transition-colors group ${
                      selectedIds.includes(item.id) ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    {/* Select Checkbox Column */}
                    <td className="py-5 pl-4 pr-1 w-12 text-center align-middle">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(item.id);
                        }}
                        className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                          selectedIds.includes(item.id)
                            ? 'bg-[#008d91] border-[#008d91] text-white'
                            : 'border-slate-300 bg-white hover:border-[#008d91]'
                        }`}
                        title={selectedIds.includes(item.id) ? 'Batal pilih' : 'Pilih data ini'}
                      >
                        {selectedIds.includes(item.id) && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </button>
                    </td>

                    {/* Col 1: A-AJAK (Avatar + Kode + Nama + Panggilan) */}
                    <td className="py-5 pr-4 pl-2">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-13 h-13 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-2xs select-none"
                          style={{ backgroundColor: item.avatarBg || '#14b8a6' }}
                        >
                          {item.avatarLetter || item.nama[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                            {item.kode} {item.nama}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-tight mt-1 truncate">
                            {item.panggilan}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Terakhir Aktif (Centered Pill Badge) */}
                    <td className="py-5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-6 sm:px-7 py-1 rounded-full text-xs font-semibold shadow-2xs min-w-[76px] ${getTahunBadgeClass(
                          item.terakhirAktif
                        )}`}
                      >
                        {item.terakhirAktif}
                      </span>
                    </td>

                    {/* Col 3: Peringkat (Centered Pill Badge) */}
                    <td className="py-5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-5 sm:px-6 py-1 rounded-full text-xs font-semibold shadow-2xs min-w-[86px] ${getPeringkatBadgeClass(
                          item.peringkat
                        )}`}
                      >
                        {item.peringkat}
                      </span>
                    </td>

                    {/* Col 4: Karya (Text list) */}
                    <td className="py-5 px-4 sm:pl-6">
                      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {item.karya && item.karya.length > 0 ? (
                          item.karya.map((k, idx) => (
                            <div key={idx} className="truncate max-w-md">
                              {k}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </div>
                    </td>

                    {/* Col 5: CV */}
                    <td className="py-5 px-3 text-center align-middle whitespace-nowrap">
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

                    {/* Col 5: Actions (Three dots menu) */}
                    <td className="py-5 text-right pr-2 relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
                        title="Aksi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-14 z-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 w-48 text-left animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleBulkCreateGroupFunneling([item.id]);
                            }}
                            className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
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
                            className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <FolderInput className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Tambah ke Existing</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleKirimPM([item.id]);
                            }}
                            className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Kirim PM</span>
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Duplikat</span>
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="w-full px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
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
        onKirimPM={() => handleKirimPM()}
      />

      {/* Modal: Tambah / Edit Volunteer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingItem ? 'Edit Volunteer A-AJAK' : 'Tambah Volunteer A-AJAK'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Database A-AJAK All - Profil & Karya Volunteer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kode ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    placeholder="Contoh: 00031"
                    required
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Panggilan / Alias
                  </label>
                  <input
                    type="text"
                    value={formData.panggilan}
                    onChange={(e) => setFormData({ ...formData, panggilan: e.target.value })}
                    placeholder="Contoh: Ko Agus"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Agustino Ong"
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Terakhir Aktif
                  </label>
                  <input
                    type="text"
                    value={formData.terakhirAktif}
                    onChange={(e) => setFormData({ ...formData, terakhirAktif: e.target.value })}
                    placeholder="Contoh: 2021"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Peringkat
                  </label>
                  <select
                    value={formData.peringkat}
                    onChange={(e) => setFormData({ ...formData, peringkat: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91] bg-white"
                  >
                    <option value="Platinum">Platinum (Teal)</option>
                    <option value="Gold">Gold (Dark Teal)</option>
                    <option value="Silver">Silver (Amber)</option>
                    <option value="Bronze">Bronze (Red)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Warna Avatar
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.avatarBg}
                      onChange={(e) => setFormData({ ...formData, avatarBg: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                    />
                    <span className="text-xs text-slate-500 font-mono">{formData.avatarBg}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kategori Utama
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91] bg-white"
                  >
                    <option value="Penerjemah">Penerjemah</option>
                    <option value="Gambar">Gambar & Desain</option>
                    <option value="Acara">Acara & Event</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Karya / Kontribusi (Satu per baris)
                </label>
                <textarea
                  rows={3}
                  value={formData.karyaText}
                  onChange={(e) => setFormData({ ...formData, karyaText: e.target.value })}
                  placeholder="Contoh:&#10;Layout - Menjadi Buddha,&#10;Design Cover - Mengembalikan Budaya Belajar."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91] leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#008d91] hover:bg-[#007679] text-white shadow-2xs transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ubah Periode Aktif */}
      {isEditPeriodeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Ubah Periode Aktif</h3>
            <p className="text-xs text-slate-500 mb-4">
              Atur rentang tanggal periode aktif database A-AJAK All.
            </p>
            <input
              type="text"
              value={tempPeriodeInput}
              onChange={(e) => setTempPeriodeInput(e.target.value)}
              placeholder="Contoh: 1 Jan 2021 - 15 Nov 2021"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91] mb-5"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditPeriodeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempPeriodeInput.trim()) {
                    setPeriodeAktif(tempPeriodeInput.trim());
                    setIsEditPeriodeOpen(false);
                    if (onShowToast) onShowToast('Periode aktif berhasil diperbarui');
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#008d91] hover:bg-[#007679] text-white"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Stat Card Kategori */}
      {isAddStatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Stat Kategori</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tambahkan kartu ringkasan kategori volunteer baru di bagian atas.
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={newStatLabel}
                  onChange={(e) => setNewStatLabel(e.target.value)}
                  placeholder="Contoh: Penulis"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Total Orang</label>
                <input
                  type="text"
                  value={newStatCount}
                  onChange={(e) => setNewStatCount(e.target.value)}
                  placeholder="Contoh: 150 orang"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jumlah Aktif</label>
                <input
                  type="text"
                  value={newStatActive}
                  onChange={(e) => setNewStatActive(e.target.value)}
                  placeholder="Contoh: 80 Aktif"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008d91]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStatOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newStatLabel.trim()) {
                    setStatCards([
                      ...statCards,
                      {
                        id: `stat-${Date.now()}`,
                        label: newStatLabel.trim(),
                        count: newStatCount.trim() || '50 orang',
                        active: newStatActive.trim() || '25 Aktif',
                      },
                    ]);
                    setIsAddStatOpen(false);
                    if (onShowToast) onShowToast(`Stat "${newStatLabel}" berhasil ditambahkan`);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#008d91] hover:bg-[#007679] text-white"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
