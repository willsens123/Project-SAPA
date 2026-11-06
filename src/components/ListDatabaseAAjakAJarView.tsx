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
import { VolunteerAJarItem } from '../types';
import { VOLUNTEER_SKILL_ROLES } from '../volunteerAJarData';
import { AddEditVolunteerSSebarModal } from './AddEditVolunteerSSebarModal';
import { FunnelingActionBar } from './FunnelingActionBar';
import { DateRangePickerPopover } from './DateRangePickerPopover';
import { ModalEditCvLink } from './ModalEditCvLink';

interface ListDatabaseAAjakAJarViewProps {
  items: VolunteerAJarItem[];
  onSaveItem: (item: VolunteerAJarItem) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem?: (item: VolunteerAJarItem) => void;
  onAddClick?: () => void;
  onEditClick?: (item: VolunteerAJarItem) => void;
  onShowToast?: (msg: string) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
  onKirimPM?: (
    targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]
  ) => void;
}

export const ListDatabaseAAjakAJarView: React.FC<ListDatabaseAAjakAJarViewProps> = ({
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

  // Column display state
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [selectedExtraSkills, setSelectedExtraSkills] = useState<string[]>([]);

  // Period state
  const [periodeAktif, setPeriodeAktif] = useState('1 Jan 2021 - 15 Nov 2021');
  const [isEditPeriodeOpen, setIsEditPeriodeOpen] = useState(false);
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VolunteerAJarItem | null>(null);

  // Detail skills modal
  const [viewDetailItem, setViewDetailItem] = useState<VolunteerAJarItem | null>(null);

  // Quick edit CV modal
  const [editCvTargetItem, setEditCvTargetItem] = useState<VolunteerAJarItem | null>(null);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleOpenAdd = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      setEditingItem(null);
      setIsModalOpen(true);
    }
  };

  const handleOpenEdit = (item: VolunteerAJarItem) => {
    if (onEditClick) {
      onEditClick(item);
    } else {
      setEditingItem(item);
      setIsModalOpen(true);
    }
  };

  const handleSaveModal = (saved: VolunteerAJarItem) => {
    onSaveItem(saved);
    setIsModalOpen(false);
    setEditingItem(null);
    onShowToast?.(`Data personil "${saved.nama}" berhasil disimpan`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                List Database A-AJAK A-JAR
              </h1>
              <p className="text-xs text-slate-500">
                Master Database Relawan & Personil A-AJAK A-JAR
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7e] rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Volunteer A-JAR</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode, nama, panggilan..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008d91]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Total: {filteredItems.length} Personil
            </span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-[#008d91] rounded"
                  />
                </th>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Panggilan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Aktif</th>
                <th className="py-3 px-4">No. HP</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data volunteer A-JAR.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                        className="accent-[#008d91] rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.kode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.panggilan || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-[#008d91]">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.isAktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.isAktif ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.noHp || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.email || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-[#008d91] hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <AddEditVolunteerSSebarModal
          isOpen={isModalOpen}
          initialData={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
};
