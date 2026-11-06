import React, { useState, useEffect } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Truck,
  Building2,
  User,
} from 'lucide-react';
import { AgenResiItem } from '../agenResiData';
import { OrganisasiItem } from '../types';
import { IdentitasItem } from '../identitasData';
import { ModalAddEditAgenResi } from './ModalAddEditAgenResi';

interface AgenResiDashboardProps {
  items: AgenResiItem[];
  organisasiList: OrganisasiItem[];
  identitasList: IdentitasItem[];
  onUpdateItems: (updated: AgenResiItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const AgenResiDashboard: React.FC<AgenResiDashboardProps> = ({
  items,
  organisasiList,
  identitasList,
  onUpdateItems,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgenResiItem | null>(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-agen-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AgenResiItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, name: string) => {
    onUpdateItems(items.filter((it) => it.id !== id));
    onShowToast(`Agen resi "${name}" berhasil dihapus`);
    setActiveMenuId(null);
  };

  const handleSaveModal = (savedItem: AgenResiItem) => {
    const exists = items.some((it) => it.id === savedItem.id);
    let updated: AgenResiItem[];
    if (exists) {
      updated = items.map((it) => (it.id === savedItem.id ? savedItem : it));
      onShowToast(`Agen resi "${savedItem.namaAgen}" berhasil diperbarui`);
    } else {
      updated = [savedItem, ...items];
      onShowToast(`Agen resi baru "${savedItem.namaAgen}" berhasil ditambahkan`);
    }
    onUpdateItems(updated);
  };

  // Filter items based on search
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    // Check organization info
    const org = organisasiList.find(
      (o) => o.id === item.organisasiId || o.namaOrg === item.organisasiId
    );
    const matchOrg =
      (org?.namaOrg || '').toLowerCase().includes(q) ||
      (org?.jenisOrg || '').toLowerCase().includes(q);

    // Check PIC info
    const pic = identitasList.find(
      (i) => i.id === item.picIdentitasId || i.codeId === item.picIdentitasId || i.namaLengkap === item.picIdentitasId
    );
    const matchPic =
      (pic?.namaLengkap || '').toLowerCase().includes(q) ||
      (pic?.codeId || '').toLowerCase().includes(q) ||
      (pic?.namaPanggilan || '').toLowerCase().includes(q);

    return (
      item.namaAgen.toLowerCase().includes(q) ||
      item.isiEkspedisi.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q) ||
      matchOrg ||
      matchPic
    );
  });

  return (
    <div className="w-full flex flex-col gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Action Toolbar matching Image */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 px-1">
        {/* Left Search input (when toggled) or summary */}
        <div className="flex-1 w-full sm:w-auto">
          {isSearchOpen && (
            <div className="relative max-w-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-agen-resi-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari agen resi, organisasi, PIC..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Toolbar Icons & + Add Button */}
        <div className="flex items-center gap-3">
          {/* Eye Off Icon */}
          <button
            id="btn-toolbar-eyeoff-agen-resi"
            type="button"
            title="Sembunyikan Kolom"
            onClick={() => onShowToast('Mode privasi tampilan diaktifkan')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Search Toggle Icon */}
          <button
            id="btn-toolbar-search-agen-resi"
            type="button"
            title="Cari"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSearchOpen ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Sliders / Filter Icon */}
          <button
            id="btn-toolbar-sliders-agen-resi"
            type="button"
            title="Filter & Pengaturan"
            onClick={() => onShowToast('Menampilkan filter agen resi')}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* + Add Button */}
          <button
            id="btn-add-agen-resi"
            type="button"
            onClick={handleOpenAdd}
            title="Tambah Agen Resi"
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Table Card matching Image */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700">
                <th className="py-4 px-6 sm:px-8 whitespace-nowrap">Nama Agen</th>
                <th className="py-4 px-6 sm:px-8 whitespace-nowrap">Organisasi ID</th>
                <th className="py-4 px-6 sm:px-8 whitespace-nowrap">PIC</th>
                <th className="py-4 px-6 sm:px-8 whitespace-nowrap">Isi Ekspedisi</th>
                <th className="py-4 px-6 sm:px-8 whitespace-nowrap">Keterangan</th>
                <th className="py-4 px-4 w-12 text-center"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 stroke-[1.5] mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Belum ada data Agen Resi</p>
                    <p className="text-xs mt-1">Klik tombol "+ Add" di atas untuk menambahkan agen resi baru</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  // Resolve connected Organisasi
                  const org = organisasiList.find(
                    (o) => o.id === item.organisasiId || o.namaOrg === item.organisasiId
                  );
                  const orgInitial = org?.avatarInitial || org?.namaOrg?.charAt(0) || 'A';
                  const orgBg = org?.avatarBg || 'bg-[#10b981]';
                  const orgName = org?.namaOrg || item.organisasiId;
                  const orgSub = org?.jenisOrg || 'Organisasi';

                  // Resolve connected Identitas
                  const pic = identitasList.find(
                    (i) => i.id === item.picIdentitasId || i.codeId === item.picIdentitasId || i.namaLengkap === item.picIdentitasId
                  );
                  const picInitial = pic?.avatarInitial || pic?.namaLengkap?.charAt(0) || 'C';
                  const picBg = pic?.avatarBg || 'bg-[#eab308]';
                  const picCode = pic?.codeId ? `${pic.codeId} ` : '';
                  const picName = pic ? `${picCode}${pic.namaLengkap}` : item.picIdentitasId;
                  const picSub = pic?.namaPanggilan || pic?.nomorHandPhone || '-';

                  const isMenuOpen = activeMenuId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. Nama Agen */}
                      <td className="py-4 px-6 sm:px-8 font-normal text-slate-800 whitespace-nowrap">
                        {item.namaAgen}
                      </td>

                      {/* 2. Organisasi ID (Connected with Organisasi) */}
                      <td className="py-4 px-6 sm:px-8 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0 shadow-xs ${orgBg}`}
                          >
                            {orgInitial}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 text-sm leading-tight">
                              {orgName}
                            </span>
                            <span className="text-xs text-slate-500 font-normal mt-0.5">
                              {orgSub}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. PIC (Connected with Identitas) */}
                      <td className="py-4 px-6 sm:px-8 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0 shadow-xs ${picBg}`}
                          >
                            {picInitial}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 text-sm leading-tight">
                              {picName}
                            </span>
                            <span className="text-xs text-slate-500 font-normal mt-0.5">
                              {picSub}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Isi Ekspedisi */}
                      <td className="py-4 px-6 sm:px-8 font-normal text-slate-700 whitespace-nowrap">
                        {item.isiEkspedisi}
                      </td>

                      {/* 5. Keterangan */}
                      <td className="py-4 px-6 sm:px-8 font-normal text-slate-600 whitespace-nowrap">
                        {item.keterangan || '-'}
                      </td>

                      {/* 6. Actions Menu */}
                      <td className="py-4 px-4 text-center relative" data-agen-menu>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                          className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="Opsi"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popover */}
                        {isMenuOpen && (
                          <div className="absolute right-4 top-11 z-30 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100 text-left">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer w-full"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.namaAgen)}
                              className="px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer w-full"
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

      {/* Modal Add / Edit Agen Resi */}
      <ModalAddEditAgenResi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem}
        organisasiList={organisasiList}
        identitasList={identitasList}
      />
    </div>
  );
};
