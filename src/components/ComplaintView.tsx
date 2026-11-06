import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  FileText,
  ShoppingCart,
  X,
  Check,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ComplaintItem } from '../types';
import { JENIS_KOMPLAIN_OPTIONS } from '../complaintData';
import { IdentitasItem } from '../identitasData';

interface ComplaintViewProps {
  complaints: ComplaintItem[];
  onAddComplaint: (item: ComplaintItem) => void;
  onUpdateComplaint: (item: ComplaintItem) => void;
  onDeleteComplaint: (id: string) => void;
  identitasList?: IdentitasItem[];
  onShowToast?: (message: string) => void;
  onAddClick?: () => void;
  onEditClick?: (item: ComplaintItem) => void;
}

export const ComplaintView: React.FC<ComplaintViewProps> = ({
  complaints,
  onAddComplaint,
  onUpdateComplaint,
  onDeleteComplaint,
  identitasList = [],
  onShowToast,
  onAddClick,
  onEditClick,
}) => {
  // Tabs: Semua, Open, Diproses, Selesai matching Transaksi S-SALUR design
  const [activeTab, setActiveTab] = useState<'Semua' | 'Open' | 'Diproses' | 'Selesai'>('Semua');

  // Top toolbar & privacy states
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJenisFilter, setSelectedJenisFilter] = useState<string>('ALL');

  // Modal states for fallback Add/Edit modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<ComplaintItem | null>(null);

  // Form states for Add/Edit modal
  const [formTanggal, setFormTanggal] = useState('15 Nov 2021');
  const [formKodeDonatur, setFormKodeDonatur] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formSubNama, setFormSubNama] = useState('');
  const [formJenisKomplain, setFormJenisKomplain] = useState('Medsos');
  const [formKomplain, setFormKomplain] = useState('XXX');
  const [formStatus, setFormStatus] = useState<'Open' | 'Diproses' | 'Selesai'>('Open');
  const [formError, setFormError] = useState('');

  // Row action menu dropdown
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filtered complaints based on Tab, Jenis Filter, and Search Query
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Tab filter
      if (activeTab !== 'Semua' && item.status !== activeTab) {
        return false;
      }
      // Jenis Filter
      if (selectedJenisFilter !== 'ALL' && item.jenisKomplain !== selectedJenisFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = item.nama.toLowerCase().includes(q);
        const matchSub = (item.subNama || '').toLowerCase().includes(q);
        const matchJenis = item.jenisKomplain.toLowerCase().includes(q);
        const matchKomplain = item.komplain.toLowerCase().includes(q);
        const matchTanggal = item.tanggal.toLowerCase().includes(q);
        const matchKode = (item.kodeDonatur || '').toLowerCase().includes(q);
        if (!matchNama && !matchSub && !matchJenis && !matchKomplain && !matchTanggal && !matchKode) {
          return false;
        }
      }
      return true;
    });
  }, [complaints, activeTab, selectedJenisFilter, searchQuery]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setEditingComplaint(null);
    setFormTanggal('15 Nov 2021');
    setFormKodeDonatur('');
    setFormNama('');
    setFormSubNama('');
    setFormJenisKomplain('Medsos');
    setFormKomplain('XXX');
    setFormStatus('Open');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (item: ComplaintItem) => {
    setEditingComplaint(item);
    setFormTanggal(item.tanggal);
    setFormKodeDonatur(item.kodeDonatur || '');
    setFormNama(item.nama);
    setFormSubNama(item.subNama || '');
    setFormJenisKomplain(item.jenisKomplain);
    setFormKomplain(item.komplain);
    setFormStatus(item.status || 'Open');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Handle select identitas from dropdown auto-filler
  const handleSelectIdentitas = (idItem: IdentitasItem) => {
    setFormKodeDonatur(idItem.codeId || idItem.id);
    const fullName = `${idItem.codeId || idItem.id} ${idItem.namaLengkap}`;
    setFormNama(fullName);
    setFormSubNama(idItem.namaPanggilan || idItem.namaLengkap.split(' ')[0]);
  };

  // Submit form modal
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama / Donatur wajib diisi');
      return;
    }
    if (!formKomplain.trim()) {
      setFormError('Isi komplain wajib diisi');
      return;
    }

    const firstChar = (formNama.trim().replace(/^[\d\s]+/, '') || formNama.trim())
      .charAt(0)
      .toUpperCase();

    const palette = ['#008d91', '#05828e', '#0f766e', '#14b8a6', '#eab308', '#64748b', '#8b5cf6'];
    const chosenBg =
      editingComplaint?.avatarBg ||
      palette[Math.floor(Math.random() * palette.length)];

    if (editingComplaint) {
      const updated: ComplaintItem = {
        ...editingComplaint,
        tanggal: formTanggal.trim() || '15 Nov 2021',
        nama: formNama.trim(),
        kodeDonatur: formKodeDonatur.trim() || undefined,
        subNama: formSubNama.trim() || undefined,
        avatarLetter: firstChar || 'A',
        avatarBg: chosenBg,
        jenisKomplain: formJenisKomplain,
        komplain: formKomplain.trim(),
        status: formStatus,
      };
      onUpdateComplaint(updated);
      onShowToast?.('Komplain berhasil diperbarui');
    } else {
      const newItem: ComplaintItem = {
        id: `complaint-${Date.now()}`,
        tanggal: formTanggal.trim() || '15 Nov 2021',
        nama: formNama.trim(),
        kodeDonatur: formKodeDonatur.trim() || undefined,
        subNama: formSubNama.trim() || undefined,
        avatarLetter: firstChar || 'A',
        avatarBg: chosenBg,
        jenisKomplain: formJenisKomplain,
        komplain: formKomplain.trim(),
        status: formStatus,
      };
      onAddComplaint(newItem);
      onShowToast?.('Komplain baru berhasil ditambahkan');
    }

    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: 'Open' | 'Diproses' | 'Selesai') => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            Selesai
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 stroke-[2.5]" />
            Diproses
          </span>
        );
      case 'Open':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#008d91] border border-teal-200">
            <AlertCircle className="w-3 h-3 stroke-[2.5]" />
            Open
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Action Bar matching Transaksi S-SALUR and Identitas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Filter Tabs matching Transaksi S-SALUR: Semua, Open, Diproses, Selesai */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {(['Semua', 'Open', 'Diproses', 'Selesai'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                id={`tab-complaint-${tab.toLowerCase()}`}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm md:text-base font-semibold transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#008d91] text-white'
                    : 'bg-[#a8a8a8] hover:bg-[#999999] text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Icons & + Add Button matching Transaksi S-SALUR and Identitas */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* EyeOff Toggle */}
          <button
            type="button"
            title={isPrivacyMasked ? 'Tampilkan Data' : 'Sembunyikan Kolom'}
            onClick={() => {
              setIsPrivacyMasked(!isPrivacyMasked);
              onShowToast?.(!isPrivacyMasked ? 'Mode privasi diaktifkan' : 'Mode privasi dinonaktifkan');
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isPrivacyMasked ? (
              <Eye className="w-5 h-5 stroke-[1.8]" />
            ) : (
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>

          {/* Search Toggle Icon */}
          <button
            type="button"
            title="Cari"
            onClick={() => {
              const el = document.getElementById('search-daftar-komplain');
              el?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Sliders / Filter Popover */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              title="Filter Jenis Komplain"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isFilterOpen || selectedJenisFilter !== 'ALL'
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-3.5 z-40 animate-in fade-in duration-150"
              >
                <div className="text-xs font-semibold text-slate-700 mb-2">Filter Jenis Komplain</div>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJenisFilter('ALL');
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                      selectedJenisFilter === 'ALL'
                        ? 'bg-[#008d91] text-white font-medium'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Semua ({complaints.length})
                  </button>
                  {JENIS_KOMPLAIN_OPTIONS.map((opt) => {
                    const count = complaints.filter((c) => c.jenisKomplain === opt).length;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedJenisFilter(opt);
                          setIsFilterOpen(false);
                        }}
                        className={`text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                          selectedJenisFilter === opt
                            ? 'bg-[#008d91] text-white font-medium'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt}</span>
                        <span className="text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* + Add Button matching Transaksi S-SALUR and Identitas */}
          <button
            id="btn-add-complaint"
            type="button"
            onClick={() => {
              if (onAddClick) {
                onAddClick();
              } else {
                handleOpenAddModal();
              }
            }}
            title="Tambah Komplain"
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Card: Container matching Transaksi S-SALUR and Identitas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col p-4 sm:p-6">
        {/* Title */}
        <h2 className="text-sm sm:text-[15px] font-semibold text-slate-700 mb-3">
          Daftar Komplain
        </h2>

        {/* Stat Cards Row matching screenshot */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
          {/* Left Stat Card: Jumlah Komplain */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between w-full sm:w-[260px] shadow-2xs">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block mb-0.5">
                Jumlah Komplain
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 block">
                {filteredComplaints.length} buah
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Right Stat Card: Periode */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between w-full sm:w-[320px] shadow-2xs">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block mb-0.5">
                Periode
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                1 Jan 2021 - 15 Nov 2021
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShoppingCart className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Sub-header row: Search Input matching Transaksi S-SALUR "Search here..." */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-daftar-komplain"
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-800">{filteredComplaints.length}</span> dari {complaints.length} data
          </div>
        </div>

        {/* Complaint Table matching Transaksi S-SALUR and Identitas */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[13px] font-semibold text-[#475569]">
                <th className="py-4 px-4 whitespace-nowrap w-[15%]">Tanggal</th>
                <th className="py-4 px-4 whitespace-nowrap w-[30%]">Nama</th>
                <th className="py-4 px-4 whitespace-nowrap text-center w-[18%]">
                  Jenis Komplain
                </th>
                <th className="py-4 px-4 whitespace-nowrap text-center w-[20%]">
                  Komplain
                </th>
                <th className="py-4 px-4 whitespace-nowrap text-center w-[12%]">
                  Status
                </th>
                <th className="py-4 px-3 text-right w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data komplain yang cocok
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* 1. Tanggal */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs sm:text-sm text-slate-800 font-medium">
                      {item.tanggal}
                    </td>

                    {/* 2. Nama with Avatar */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-2xs select-none"
                          style={{ backgroundColor: item.avatarBg || '#008d91' }}
                        >
                          {item.avatarLetter || item.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {isPrivacyMasked ? '••••••••' : item.nama}
                          </span>
                          {item.subNama && (
                            <span className="text-xs text-slate-400 font-medium truncate">
                              {isPrivacyMasked ? '••••' : item.subNama}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Jenis Komplain */}
                    <td className="py-4 px-4 text-center text-xs sm:text-sm text-slate-700 font-medium">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs">
                        {item.jenisKomplain}
                      </span>
                    </td>

                    {/* 4. Komplain */}
                    <td className="py-4 px-4 text-center text-xs sm:text-sm text-slate-700 font-medium max-w-[260px] truncate">
                      {item.komplain}
                    </td>

                    {/* 5. Status Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(item.status || 'Open')}
                    </td>

                    {/* 6. Action 3-dots */}
                    <td className="py-4 px-3 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Menu Aksi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-11 z-30 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150 text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onEditClick) {
                                onEditClick(item);
                              } else {
                                handleOpenEditModal(item);
                              }
                            }}
                            className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Edit Komplain</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              const nextStatus: 'Open' | 'Diproses' | 'Selesai' =
                                item.status === 'Open'
                                  ? 'Diproses'
                                  : item.status === 'Diproses'
                                  ? 'Selesai'
                                  : 'Open';
                              onUpdateComplaint({ ...item, status: nextStatus });
                              onShowToast?.(`Status komplain diubah ke "${nextStatus}"`);
                            }}
                            className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {item.status === 'Open'
                                ? 'Set Status Diproses'
                                : item.status === 'Diproses'
                                ? 'Tandai Selesai'
                                : 'Buka Kembali (Open)'}
                            </span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (window.confirm(`Yakin ingin menghapus komplain "${item.nama}"?`)) {
                                onDeleteComplaint(item.id);
                                onShowToast?.('Komplain berhasil dihapus');
                              }
                            }}
                            className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Komplain</span>
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

      {/* Fallback Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingComplaint ? 'Edit Komplain' : 'Tambah Komplain Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Identitas / Donatur
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: 10001 Agustino Ong"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="text"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Komplain
                  </label>
                  <select
                    value={formJenisKomplain}
                    onChange={(e) => setFormJenisKomplain(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#008d91]"
                  >
                    {JENIS_KOMPLAIN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Komplain
                </label>
                <textarea
                  rows={3}
                  value={formKomplain}
                  onChange={(e) => setFormKomplain(e.target.value)}
                  placeholder="Isi keluhan / catatan komplain..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  {(['Open', 'Diproses', 'Selesai'] as const).map((st) => (
                    <label
                      key={st}
                      className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status-modal"
                        checked={formStatus === st}
                        onChange={() => setFormStatus(st)}
                        className="text-[#008d91] focus:ring-[#008d91]"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl transition-colors shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
