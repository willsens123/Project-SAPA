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
  Copy,
  KeyRound,
  Mail,
  ShieldCheck,
  Calendar,
  UserCheck,
  UserMinus,
  ArrowRight,
} from 'lucide-react';
import { KaryawanItem } from '../types';

interface KaryawanViewProps {
  items: KaryawanItem[];
  onSaveItem: (item: KaryawanItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (message: string) => void;
}

const AVATAR_COLOR_OPTIONS = [
  { label: 'Teal Green', value: 'bg-[#14b8a6]', hex: '#14b8a6' },
  { label: 'Warm Yellow', value: 'bg-[#eab308]', hex: '#eab308' },
  { label: 'Slate Gray', value: 'bg-[#64748b]', hex: '#64748b' },
  { label: 'Cyan Blue', value: 'bg-[#008d91]', hex: '#008d91' },
  { label: 'Royal Blue', value: 'bg-[#2563eb]', hex: '#2563eb' },
  { label: 'Coral Orange', value: 'bg-[#ea580c]', hex: '#ea580c' },
  { label: 'Purple', value: 'bg-[#9333ea]', hex: '#9333ea' },
];

const DEFAULT_DIVISI_OPTIONS = ['UMM', 'FUN', 'PNB', 'PRO', 'MED', 'OPS'];

export const KaryawanView: React.FC<KaryawanViewProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onShowToast = (_msg: string) => {},
}) => {
  // Tabs: "Aktif" dan "Tidak Aktif"
  const [activeTab, setActiveTab] = useState<'aktif' | 'tidak_aktif'>('aktif');

  // Privacy toggle (masks / reveals emails & passwords)
  const [hideSensitive, setHideSensitive] = useState(false);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');

  // Row context menu popover
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modal: Atur Tanggal Bergabung
  const [tanggalBergabungModalItem, setTanggalBergabungModalItem] = useState<KaryawanItem | null>(null);
  const [tanggalBergabungInput, setTanggalBergabungInput] = useState<string>('');

  // Modal: Atur Tanggal Berhenti
  const [tanggalBerhentiModalItem, setTanggalBerhentiModalItem] = useState<KaryawanItem | null>(null);
  const [tanggalBerhentiInput, setTanggalBerhentiInput] = useState<string>('');

  // Add / Edit Modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KaryawanItem | null>(null);
  const [showFormPassword, setShowFormPassword] = useState(false);

  const [formData, setFormData] = useState<{
    kodeKaryawan: string;
    namaLengkap: string;
    namaPanggilan: string;
    divisi: string;
    emailLogin: string;
    password: string;
    avatarBg: string;
    avatarInitial: string;
    aktif: boolean;
    tanggalBergabung: string;
    tanggalBerhenti: string;
  }>({
    kodeKaryawan: '',
    namaLengkap: '',
    namaPanggilan: '',
    divisi: 'UMM',
    emailLogin: '',
    password: '',
    avatarBg: 'bg-[#14b8a6]',
    avatarInitial: '',
    aktif: true,
    tanggalBergabung: '',
    tanggalBerhenti: '',
  });

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

  // Counts for tabs
  const countAktif = useMemo(() => {
    return items.filter((it) => it.aktif !== false && !it.tanggalBerhenti).length;
  }, [items]);

  const countTidakAktif = useMemo(() => {
    return items.filter((it) => it.aktif === false || !!it.tanggalBerhenti).length;
  }, [items]);

  // Unique divisions present
  const availableDivisions = useMemo(() => {
    const set = new Set<string>(DEFAULT_DIVISI_OPTIONS);
    items.forEach((it) => {
      if (it.divisi) set.add(it.divisi.toUpperCase());
    });
    return Array.from(set);
  }, [items]);

  // Filtered items (Tab, Search, Divisi)
  // "Semua yang berhenti menjadi Karyawan akan masuk ke Tidak Aktif."
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      const isItemAktif = item.aktif !== false && !item.tanggalBerhenti;
      if (activeTab === 'aktif' && !isItemAktif) return false;
      if (activeTab === 'tidak_aktif' && isItemAktif) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.namaLengkap.toLowerCase().includes(q);
        const matchKode = item.kodeKaryawan.toLowerCase().includes(q);
        const matchPanggilan = (item.namaPanggilan || '').toLowerCase().includes(q);
        const matchDivisi = item.divisi.toLowerCase().includes(q);
        const matchEmail = item.emailLogin.toLowerCase().includes(q);
        const matchJoined = (item.tanggalBergabung || '').toLowerCase().includes(q);
        const matchStopped = (item.tanggalBerhenti || '').toLowerCase().includes(q);
        if (
          !matchName &&
          !matchKode &&
          !matchPanggilan &&
          !matchDivisi &&
          !matchEmail &&
          !matchJoined &&
          !matchStopped
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

      return true;
    });
  }, [items, activeTab, searchQuery, selectedDivisi]);

  // Quick Action: Open Tanggal Bergabung modal
  const handleOpenTanggalBergabung = (item: KaryawanItem) => {
    setTanggalBergabungModalItem(item);
    setTanggalBergabungInput(item.tanggalBergabung || '');
    setActiveMenuId(null);
  };

  // Quick Action: Save Tanggal Bergabung
  const handleSaveTanggalBergabung = () => {
    if (!tanggalBergabungModalItem) return;
    const val = tanggalBergabungInput.trim();
    if (!val) {
      onShowToast('Tanggal bergabung tidak boleh kosong');
      return;
    }
    const updated: KaryawanItem = {
      ...tanggalBergabungModalItem,
      tanggalBergabung: val,
    };
    onSaveItem(updated);
    onShowToast(`Tanggal bergabung "${updated.namaLengkap}" berhasil disimpan: ${val}`);
    setTanggalBergabungModalItem(null);
  };

  // Quick Action: Open Tanggal Berhenti modal
  const handleOpenTanggalBerhenti = (item: KaryawanItem) => {
    setTanggalBerhentiModalItem(item);
    setTanggalBerhentiInput(item.tanggalBerhenti || '');
    setActiveMenuId(null);
  };

  // Quick Action: Save Tanggal Berhenti
  // "Semua yang berhenti menjadi Karyawan akan masuk ke Tidak Aktif."
  const handleSaveTanggalBerhenti = () => {
    if (!tanggalBerhentiModalItem) return;
    const val = tanggalBerhentiInput.trim();
    if (!val) {
      onShowToast('Tanggal berhenti tidak boleh kosong');
      return;
    }
    const updated: KaryawanItem = {
      ...tanggalBerhentiModalItem,
      tanggalBerhenti: val,
      aktif: false, // Otomatis masuk ke Tidak Aktif
    };
    onSaveItem(updated);
    onShowToast(
      `Karyawan "${updated.namaLengkap}" telah dicatat berhenti pada tanggal ${val} dan dipindahkan ke tab Tidak Aktif`
    );
    setTanggalBerhentiModalItem(null);
  };

  // Quick Action: Reactivate Karyawan (Hapus Tanggal Berhenti & Kembalikan ke Aktif)
  const handleReactivateKaryawan = () => {
    if (!tanggalBerhentiModalItem) return;
    const updated: KaryawanItem = {
      ...tanggalBerhentiModalItem,
      tanggalBerhenti: undefined,
      aktif: true, // Kembali ke Aktif
    };
    onSaveItem(updated);
    onShowToast(
      `Karyawan "${updated.namaLengkap}" telah diaktifkan kembali dan masuk ke tab Aktif`
    );
    setTanggalBerhentiModalItem(null);
  };

  // Open modal Add / Edit
  const openFormModal = (item?: KaryawanItem) => {
    setShowFormPassword(false);
    if (item) {
      setEditingItem(item);
      setFormData({
        kodeKaryawan: item.kodeKaryawan,
        namaLengkap: item.namaLengkap,
        namaPanggilan: item.namaPanggilan || '',
        divisi: item.divisi,
        emailLogin: item.emailLogin,
        password: item.password,
        avatarBg: item.avatarBg || 'bg-[#14b8a6]',
        avatarInitial: item.avatarInitial || item.namaLengkap[0]?.toUpperCase() || 'K',
        aktif: item.aktif ?? true,
        tanggalBergabung: item.tanggalBergabung || '',
        tanggalBerhenti: item.tanggalBerhenti || '',
      });
    } else {
      setEditingItem(null);
      // Auto-suggest sequential kode karyawan
      const highestNum = items.reduce((max, it) => {
        const num = parseInt(it.kodeKaryawan.replace(/\D/g, ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 31);
      const nextCode = String(highestNum + 1).padStart(5, '0');

      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const defaultDate = `${dd}/${mm}/${yyyy}`;

      setFormData({
        kodeKaryawan: nextCode,
        namaLengkap: '',
        namaPanggilan: '',
        divisi: 'UMM',
        emailLogin: '',
        password: 'password123',
        avatarBg: 'bg-[#14b8a6]',
        avatarInitial: '',
        aktif: true,
        tanggalBergabung: defaultDate,
        tanggalBerhenti: '',
      });
    }
    setActiveMenuId(null);
    setFormModalOpen(true);
  };

  // Submit form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap.trim()) {
      onShowToast('Nama Lengkap karyawan wajib diisi');
      return;
    }
    if (!formData.emailLogin.trim()) {
      onShowToast('Email Login wajib diisi');
      return;
    }
    if (!formData.password.trim()) {
      onShowToast('Password wajib diisi');
      return;
    }

    const initial = formData.avatarInitial.trim()
      ? formData.avatarInitial.trim()[0].toUpperCase()
      : formData.namaLengkap.trim()[0]?.toUpperCase() || 'K';

    const hasBerhenti = !!formData.tanggalBerhenti.trim();
    const effectiveAktif = hasBerhenti ? false : formData.aktif;

    if (editingItem) {
      const updated: KaryawanItem = {
        ...editingItem,
        kodeKaryawan: formData.kodeKaryawan.trim(),
        namaLengkap: formData.namaLengkap.trim(),
        namaPanggilan: formData.namaPanggilan.trim(),
        divisi: formData.divisi.trim().toUpperCase(),
        emailLogin: formData.emailLogin.trim(),
        password: formData.password.trim(),
        avatarBg: formData.avatarBg,
        avatarInitial: initial,
        aktif: effectiveAktif,
        tanggalBergabung: formData.tanggalBergabung.trim() || undefined,
        tanggalBerhenti: formData.tanggalBerhenti.trim() || undefined,
      };
      onSaveItem(updated);
      onShowToast(`Data karyawan "${updated.namaLengkap}" berhasil diperbarui`);
    } else {
      const newItem: KaryawanItem = {
        id: `karyawan-${Date.now()}`,
        kodeKaryawan: formData.kodeKaryawan.trim(),
        namaLengkap: formData.namaLengkap.trim(),
        namaPanggilan: formData.namaPanggilan.trim(),
        divisi: formData.divisi.trim().toUpperCase(),
        emailLogin: formData.emailLogin.trim(),
        password: formData.password.trim(),
        avatarBg: formData.avatarBg,
        avatarInitial: initial,
        aktif: effectiveAktif,
        tanggalBergabung: formData.tanggalBergabung.trim() || undefined,
        tanggalBerhenti: formData.tanggalBerhenti.trim() || undefined,
      };
      onSaveItem(newItem);
      onShowToast(`Karyawan baru "${newItem.namaLengkap}" berhasil ditambahkan`);
    }

    setFormModalOpen(false);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} berhasil disalin ke clipboard`);
    setActiveMenuId(null);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top Header: Tabs "Aktif" & "Tidak Aktif" + Toolbar Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Tabs: "Aktif" & "Tidak Aktif" */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('aktif')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'aktif'
                  ? 'bg-[#008d91] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Aktif</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab === 'aktif'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {countAktif}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tidak_aktif')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'tidak_aktif'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserMinus className="w-4 h-4" />
              <span>Tidak Aktif</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab === 'tidak_aktif'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {countTidakAktif}
              </span>
            </button>
          </div>

          {/* Toolbar Right Side */}
          <div className="flex items-center justify-end gap-3">
            {/* Privacy Toggle Button */}
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

            {/* Search Toggle Button */}
            {searchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Karyawan / Divisi / Email / Tanggal..."
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

            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  selectedDivisi !== 'ALL'
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Filter Divisi"
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Filter Divisi
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDivisi('ALL');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      selectedDivisi === 'ALL'
                        ? 'text-[#008d91] bg-teal-50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Semua Divisi</span>
                    {selectedDivisi === 'ALL' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {availableDivisions.map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => {
                        setSelectedDivisi(div);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                        selectedDivisi === div
                          ? 'text-[#008d91] bg-teal-50'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Divisi {div}</span>
                      {selectedDivisi === div && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* + Add Button matching screenshot */}
            <button
              type="button"
              onClick={() => openFormModal()}
              className="bg-[#008d91] hover:bg-[#007b7f] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[760px]">
            {/* Table Header: Dynamically adapts according to Tab "Aktif" or "Tidak Aktif" */}
            <thead>
              <tr className="border-b border-slate-100 text-slate-700 text-sm sm:text-[15px] font-semibold">
                <th className="py-4 px-4 sm:px-6 w-[30%]">Nama</th>
                <th className="py-4 px-4 sm:px-6 w-[15%]">Divisi</th>
                {activeTab === 'aktif' ? (
                  /* Pada Aktif tambahkan kolom tanggal bergabung */
                  <th className="py-4 px-4 sm:px-6 w-[20%]">Tanggal Bergabung</th>
                ) : (
                  /* Pada Tidak Aktif tambahkan kolom Tanggal Bergabung - Tanggal Berhenti */
                  <th className="py-4 px-4 sm:px-6 w-[25%]">
                    Tanggal Bergabung - Tanggal Berhenti
                  </th>
                )}
                <th className="py-4 px-4 sm:px-6 w-[18%]">Email Login</th>
                <th className="py-4 px-4 sm:px-6 w-[13%]">Email Login</th>
                <th className="py-4 px-3 w-[4%] text-center"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {activeTab === 'aktif'
                      ? 'Tidak ada data Karyawan Aktif yang ditemukan.'
                      : 'Tidak ada data Karyawan Tidak Aktif yang ditemukan.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const displayedPassword = '••••••••••';

                  // Masked email when privacy mode is on
                  const displayedEmail = hideSensitive
                    ? item.emailLogin.replace(/(.{2})(.*)(?=@)/, (_match, p1, p2) => p1 + '*'.repeat(p2.length))
                    : item.emailLogin;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Col 1: Avatar + Name (ID + Full Name) & Subtitle (Panggilan) */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-4">
                          {/* Circle Avatar matching image */}
                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${
                              item.avatarBg || 'bg-[#14b8a6]'
                            } text-white font-medium text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            {item.avatarInitial || item.namaLengkap[0]?.toUpperCase() || 'K'}
                          </div>

                          {/* Full Name & Nickname */}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                              {item.kodeKaryawan ? `${item.kodeKaryawan} ` : ''}
                              {item.namaLengkap}
                            </span>
                            {item.namaPanggilan && (
                              <span className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
                                {item.namaPanggilan}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 2: Divisi */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className="text-slate-700 font-normal text-sm sm:text-base">
                          {item.divisi}
                        </span>
                      </td>

                      {/* Col 3: Tanggal Bergabung (Tab Aktif) OR Tanggal Bergabung - Tanggal Berhenti (Tab Tidak Aktif) */}
                      {activeTab === 'aktif' ? (
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="w-4 h-4 text-[#008d91] shrink-0" />
                            <span className="font-medium text-sm sm:text-base">
                              {item.tanggalBergabung || '-'}
                            </span>
                          </div>
                        </td>
                      ) : (
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex flex-col gap-1.5 py-1">
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shrink-0">
                                Masuk:
                              </span>
                              <span className="font-medium text-slate-700">
                                {item.tanggalBergabung || '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shrink-0">
                                Berhenti:
                              </span>
                              <span className="font-semibold text-rose-700">
                                {item.tanggalBerhenti || 'Belum diisi'}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Col 4: Email Login */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className="text-slate-700 font-normal text-sm sm:text-base select-all">
                          {displayedEmail}
                        </span>
                      </td>

                      {/* Col 5: Status Keamanan Password (selalu disamarkan) */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-mono text-slate-500 tracking-wider text-sm sm:text-base">
                          {displayedPassword}
                        </span>
                      </td>

                      {/* Col 6: Actions (3 dots) */}
                      <td className="py-4 px-3 text-center relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu with "Tanggal bergabung" & "Tanggal Berhenti" */}
                        {activeMenuId === item.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-4 top-12 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                          >
                            <button
                              type="button"
                              onClick={() => openFormModal(item)}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Data Karyawan</span>
                            </button>

                            {/* Pilihan: Tanggal Bergabung */}
                            <button
                              type="button"
                              onClick={() => handleOpenTanggalBergabung(item)}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Tanggal Bergabung</span>
                            </button>

                            {/* Pilihan: Tanggal Berhenti */}
                            <button
                              type="button"
                              onClick={() => handleOpenTanggalBerhenti(item)}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                              <span>Tanggal Berhenti</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => handleCopy(item.emailLogin, 'Email Login')}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Salin Email</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => {
                                onDeleteItem(item.id);
                                setActiveMenuId(null);
                                onShowToast(`Karyawan "${item.namaLengkap}" berhasil dihapus`);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Hapus Karyawan</span>
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

      {/* Modal: Tambah / Edit Karyawan */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingItem ? 'Edit Data Karyawan' : 'Tambah Karyawan & Akses Login'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Preview Avatar & ID */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div
                  className={`w-14 h-14 rounded-full ${formData.avatarBg} text-white font-medium text-2xl flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {formData.avatarInitial ||
                    formData.namaLengkap[0]?.toUpperCase() ||
                    'K'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400">
                    Preview Tampilan
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {formData.kodeKaryawan ? `${formData.kodeKaryawan} ` : ''}
                    {formData.namaLengkap || 'Nama Karyawan'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formData.namaPanggilan || 'Panggilan'} • Divisi {formData.divisi}
                  </span>
                </div>
              </div>

              {/* Kode Karyawan & Nama Lengkap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kode ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="00031"
                    value={formData.kodeKaryawan}
                    onChange={(e) =>
                      setFormData({ ...formData, kodeKaryawan: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Agustino Ong"
                    value={formData.namaLengkap}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        namaLengkap: e.target.value,
                        avatarInitial:
                          formData.avatarInitial ||
                          e.target.value[0]?.toUpperCase() ||
                          '',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Nama Panggilan & Divisi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ko Agus"
                    value={formData.namaPanggilan}
                    onChange={(e) =>
                      setFormData({ ...formData, namaPanggilan: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.divisi}
                    onChange={(e) =>
                      setFormData({ ...formData, divisi: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  >
                    {availableDivisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal Bergabung & Tanggal Berhenti */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#008d91]" />
                    <span>Tanggal Bergabung</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 01/01/2021"
                    value={formData.tanggalBergabung}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalBergabung: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                    <span>Tanggal Berhenti (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 30/12/2023"
                    value={formData.tanggalBerhenti}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggalBerhenti: e.target.value,
                        aktif: e.target.value.trim() ? false : formData.aktif,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Jika diisi, status otomatis menjadi Tidak Aktif.
                  </p>
                </div>
              </div>

              {/* Email Login */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Login <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="agustino@gmail.com"
                    value={formData.emailLogin}
                    onChange={(e) =>
                      setFormData({ ...formData, emailLogin: e.target.value })
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Password Login */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Login <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password untuk login"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showFormPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Password ini digunakan untuk autentikasi karyawan masuk ke dalam sistem.
                </p>
              </div>

              {/* Avatar Initial & Color Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Huruf Inisial Avatar
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.avatarInitial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avatarInitial: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Auto (A, C, S)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Warna Avatar
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {AVATAR_COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarBg: c.value })}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          formData.avatarBg === c.value
                            ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      >
                        {formData.avatarBg === c.value && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7f] shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Atur Tanggal Bergabung (dari Titik Tiga) */}
      {tanggalBergabungModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 font-['Plus_Jakarta_Sans',sans-serif]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-[#008d91]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Atur Tanggal Bergabung
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tanggalBergabungModalItem.kodeKaryawan ? `${tanggalBergabungModalItem.kodeKaryawan} - ` : ''}
                    {tanggalBergabungModalItem.namaLengkap}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTanggalBergabungModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Bergabung (Mulai Bekerja)
                </label>
                <input
                  type="text"
                  value={tanggalBergabungInput}
                  onChange={(e) => setTanggalBergabungInput(e.target.value)}
                  placeholder="Contoh: 01/01/2021 atau 1 Jan 2021"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#008d91] focus:outline-hidden"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Format bebas (contoh: DD/MM/YYYY atau 1 Jan 2021).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTanggalBergabungModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTanggalBergabung}
                className="px-5 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7f] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Simpan Tanggal Bergabung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Atur Tanggal Berhenti (dari Titik Tiga) */}
      {tanggalBerhentiModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 font-['Plus_Jakarta_Sans',sans-serif]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <UserMinus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Atur Tanggal Berhenti
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tanggalBerhentiModalItem.kodeKaryawan ? `${tanggalBerhentiModalItem.kodeKaryawan} - ` : ''}
                    {tanggalBerhentiModalItem.namaLengkap}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTanggalBerhentiModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-800 leading-relaxed">
                Semua yang berhenti menjadi Karyawan akan otomatis dipindahkan ke tab <strong>"Tidak Aktif"</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Berhenti Karyawan
                </label>
                <input
                  type="text"
                  value={tanggalBerhentiInput}
                  onChange={(e) => setTanggalBerhentiInput(e.target.value)}
                  placeholder="Contoh: 30/12/2021 atau 15 Okt 2023"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  autoFocus
                />
              </div>

              {/* Jika sudah ada tanggal berhenti, beri opsi untuk aktifkan kembali */}
              {tanggalBerhentiModalItem.tanggalBerhenti && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleReactivateKaryawan}
                    className="w-full py-2 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Hapus Tanggal Berhenti (Aktifkan Kembali)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTanggalBerhentiModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTanggalBerhenti}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Simpan Tanggal Berhenti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
