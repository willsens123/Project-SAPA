import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Search,
  SlidersHorizontal,
  EyeOff,
  Eye,
  User,
  MoreVertical,
  Check,
  Calendar,
  ChevronDown,
  Trash2,
  Clock,
  CheckCircle2,
  MessageSquare,
  FolderPlus,
  FolderInput,
  FileText,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import { SalurProduct } from '../salurData';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { INITIAL_JOB_ADVANCE_MASTER } from '../jobAdvanceMasterData';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { DateRangePickerPopover } from './DateRangePickerPopover';
import { ModalEditCvLink } from './ModalEditCvLink';
import {
  AAjakHelperRow,
  isHelperActive,
  loadAAjakItemSalurRecord,
  saveAAjakItemSalurRecord,
} from '../aajakItemSalurData';

interface ModalLihatListAAjakItemSalurProps {
  isOpen: boolean;
  onClose: () => void;
  item: SalurProduct | null;
  identitasList?: IdentitasItem[];
  onShowToast?: (msg: string) => void;
  onKirimPM?: (targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
}

export const ModalLihatListAAjakItemSalur: React.FC<ModalLihatListAAjakItemSalurProps> = ({
  isOpen,
  onClose,
  item,
  identitasList = INITIAL_IDENTITAS,
  onShowToast = (_msg: string) => {},
  onKirimPM,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
}) => {
  // Helpers list for this item
  const [helpers, setHelpers] = useState<AAjakHelperRow[]>([]);
  const [recordTanggalMulaiBekerja, setRecordTanggalMulaiBekerja] = useState<string>('');
  const [selectedHelperIds, setSelectedHelperIds] = useState<string[]>([]);

  // Top toolbar states matching image.png
  const [isEyeActive, setIsEyeActive] = useState<boolean>(true);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  // Row action menu
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);

  // Add / Edit helper modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingHelper, setEditingHelper] = useState<AAjakHelperRow | null>(null);

  // Quick edit CV modal state
  const [editCvTargetHelper, setEditCvTargetHelper] = useState<AAjakHelperRow | null>(null);

  // Add / Edit form fields
  const [formIdentitasId, setFormIdentitasId] = useState<string>('');
  const [formJobAdvance, setFormJobAdvance] = useState<string>('');
  const [formTanggalMulai, setFormTanggalMulai] = useState<string>('18 Jan 2021');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formTanggalSelesai, setFormTanggalSelesai] = useState<string>('');
  const [formCvUrl, setFormCvUrl] = useState<string>('');
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState<boolean>(false);
  const [formIdentitasSearch, setFormIdentitasSearch] = useState<string>('');
  const [formJobSearch, setFormJobSearch] = useState<string>('');
  const [isIdentitasDropdownOpen, setIsIdentitasDropdownOpen] = useState<boolean>(false);
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState<boolean>(false);

  // Load record when modal opens or item changes
  const refreshHelpers = () => {
    if (!item) return;
    const record = loadAAjakItemSalurRecord(item.id, item.title);
    setRecordTanggalMulaiBekerja(record.tanggalMulaiBekerja || '18 Jan 2021');
    setHelpers(record.helpers || []);
  };

  useEffect(() => {
    if (isOpen && item) {
      refreshHelpers();
      setActiveRowMenuId(null);
      setIsSearchActive(false);
      setSearchQuery('');
      setFilterStatus('all');
      setIsFilterDropdownOpen(false);
    }
  }, [isOpen, item?.id]);

  // Master identitas map
  const identitasMap = useMemo(() => {
    const map = new Map<string, IdentitasItem>();
    identitasList.forEach((it) => map.set(it.id, it));
    return map;
  }, [identitasList]);

  // Active count & Total count calculation
  // "Aktif adalah jika pekerjaan masih dikerjakan (belum selese/belum ada tanggal selesai)"
  const activeCount = useMemo(() => {
    return helpers.filter((h) => isHelperActive(h)).length;
  }, [helpers]);

  const totalCount = helpers.length;

  // Filtered helpers for display
  const displayedHelpers = useMemo(() => {
    return helpers.filter((h) => {
      // Status filter
      const active = isHelperActive(h);
      if (filterStatus === 'active' && !active) return false;
      if (filterStatus === 'completed' && active) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const person = identitasMap.get(h.identitasId);
        const nameMatch = person?.namaLengkap.toLowerCase().includes(q) || false;
        const codeMatch = person?.codeId?.toLowerCase().includes(q) || false;
        const nickMatch = person?.namaPanggilan?.toLowerCase().includes(q) || false;
        const jobMatch = h.jobAdvance.toLowerCase().includes(q);
        const dateMatch =
          (h.tanggalMulai && h.tanggalMulai.toLowerCase().includes(q)) ||
          (h.tanggalSelesai && h.tanggalSelesai.toLowerCase().includes(q));

        if (!nameMatch && !codeMatch && !nickMatch && !jobMatch && !dateMatch) {
          return false;
        }
      }

      return true;
    });
  }, [helpers, filterStatus, searchQuery, identitasMap]);

  // Open Add Helper
  const handleOpenAdd = () => {
    setEditingHelper(null);
    setFormIdentitasId('');
    setFormJobAdvance('Layout');
    setFormTanggalMulai('18 Jan 2021');
    setFormIsActive(true);
    setFormTanggalSelesai('');
    setFormCvUrl('');
    setFormIdentitasSearch('');
    setFormJobSearch('');
    setIsIdentitasDropdownOpen(false);
    setIsJobDropdownOpen(false);
    setIsEditModalOpen(true);
  };

  // Open Edit Helper
  const handleOpenEdit = (h: AAjakHelperRow) => {
    setEditingHelper(h);
    setFormIdentitasId(h.identitasId);
    setFormJobAdvance(h.jobAdvance);
    setFormTanggalMulai(h.tanggalMulai || '18 Jan 2021');
    const active = isHelperActive(h);
    setFormIsActive(active);
    setFormTanggalSelesai(active ? '' : h.tanggalSelesai || '18 Jan 2021');
    setFormCvUrl(h.cvUrl || identitasMap.get(h.identitasId)?.cvUrl || '');
    setFormIdentitasSearch('');
    setFormJobSearch('');
    setIsIdentitasDropdownOpen(false);
    setIsJobDropdownOpen(false);
    setIsEditModalOpen(true);
    setActiveRowMenuId(null);
  };

  // Save helper (Add or Update)
  const handleSaveHelper = () => {
    if (!item) return;
    if (!formIdentitasId) {
      onShowToast('Silakan pilih personil A-AJAK terlebih dahulu');
      return;
    }

    const finalTanggalSelesai = formIsActive ? '' : (formTanggalSelesai.trim() || '18 Jan 2021');

    let updatedHelpers: AAjakHelperRow[];
    if (editingHelper) {
      updatedHelpers = helpers.map((h) =>
        h.id === editingHelper.id
          ? {
              ...h,
              identitasId: formIdentitasId,
              jobAdvance: formJobAdvance.trim() || 'Penulis Artikel',
              tanggalMulai: formTanggalMulai.trim() || '18 Jan 2021',
              tanggalSelesai: finalTanggalSelesai,
              cvUrl: formCvUrl.trim(),
            }
          : h
      );
    } else {
      const newHelper: AAjakHelperRow = {
        id: `helper-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        identitasId: formIdentitasId,
        jobAdvance: formJobAdvance.trim() || 'Penulis Artikel',
        tanggalMulai: formTanggalMulai.trim() || '18 Jan 2021',
        tanggalSelesai: finalTanggalSelesai,
        cvUrl: formCvUrl.trim(),
      };
      updatedHelpers = [...helpers, newHelper];
    }

    setHelpers(updatedHelpers);
    saveAAjakItemSalurRecord({
      itemId: item.id,
      itemTitle: item.title,
      tanggalMulaiBekerja: recordTanggalMulaiBekerja || '18 Jan 2021',
      helpers: updatedHelpers,
    });

    onShowToast(
      editingHelper ? 'Data personil A-AJAK diperbarui' : 'Personil A-AJAK baru berhasil ditambahkan'
    );
    setIsEditModalOpen(false);
  };

  // Quick update CV link for a helper
  const handleSaveCvUrl = (helperId: string, newUrl: string) => {
    if (!item) return;
    const target = helpers.find((h) => h.id === helperId);
    const targetPerson = target ? identitasMap.get(target.identitasId) : null;
    const personName = targetPerson?.namaLengkap || 'Personil';

    const updatedHelpers = helpers.map((h) =>
      h.id === helperId ? { ...h, cvUrl: newUrl } : h
    );
    setHelpers(updatedHelpers);
    saveAAjakItemSalurRecord({
      itemId: item.id,
      itemTitle: item.title,
      tanggalMulaiBekerja: recordTanggalMulaiBekerja || '18 Jan 2021',
      helpers: updatedHelpers,
    });

    onShowToast(
      newUrl
        ? `Link CV untuk ${personName} berhasil disimpan!`
        : `Link CV untuk ${personName} berhasil dihapus.`
    );
  };

  // Quick toggle Active/Selesai
  const handleToggleActive = (h: AAjakHelperRow) => {
    if (!item) return;
    const currentlyActive = isHelperActive(h);
    const newTanggalSelesai = currentlyActive
      ? '18 Jan 2021'
      : '';

    const updated = helpers.map((row) =>
      row.id === h.id ? { ...row, tanggalSelesai: newTanggalSelesai } : row
    );

    setHelpers(updated);
    saveAAjakItemSalurRecord({
      itemId: item.id,
      itemTitle: item.title,
      tanggalMulaiBekerja: recordTanggalMulaiBekerja || '18 Jan 2021',
      helpers: updated,
    });

    onShowToast(
      currentlyActive
        ? 'Pekerjaan ditandai Selesai'
        : 'Pekerjaan ditandai Aktif (masih dikerjakan)'
    );
    setActiveRowMenuId(null);
  };

  // Delete helper
  const handleDeleteHelper = (h: AAjakHelperRow) => {
    if (!item) return;
    const person = identitasMap.get(h.identitasId);
    const name = person?.namaLengkap || 'Personil';

    const updated = helpers.filter((row) => row.id !== h.id);
    setHelpers(updated);
    saveAAjakItemSalurRecord({
      itemId: item.id,
      itemTitle: item.title,
      tanggalMulaiBekerja: recordTanggalMulaiBekerja || '18 Jan 2021',
      helpers: updated,
    });
    onShowToast(`${name} dihapus dari daftar A-AJAK item ini`);
    setActiveRowMenuId(null);
  };

  const isAllSelected =
    displayedHelpers.length > 0 &&
    selectedHelperIds.length === displayedHelpers.length;

  const handleToggleSelect = (id: string) => {
    setSelectedHelperIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedHelperIds([]);
    } else {
      setSelectedHelperIds(displayedHelpers.map((h) => h.id));
    }
  };

  const handleKirimPM = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedHelperIds;
    if (idsToUse.length === 0) return;
    const targetHelpers = helpers.filter((h) => idsToUse.includes(h.id));
    const targets = targetHelpers.map((h) => {
      const p = identitasMap.get(h.identitasId);
      return {
        id: h.identitasId,
        identitasId: h.identitasId,
        nama: p?.namaLengkap || 'Personil',
        nomorHp: p?.nomorHandPhone || '-',
        codeId: p?.codeId || '',
      };
    });
    if (onKirimPM) {
      onClose();
      onKirimPM(targets);
    }
  };

  const getSelectedTargetItems = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedHelperIds;
    const targetHelpers = helpers.filter((h) => idsToUse.includes(h.id));
    return targetHelpers.map((h) => {
      const p = identitasMap.get(h.identitasId);
      return {
        id: h.identitasId,
        identitasId: h.identitasId,
        nama: p?.namaLengkap || 'Personil',
        nomorHp: p?.nomorHandPhone || '-',
        codeId: p?.codeId || '',
      };
    });
  };

  const handleBulkCreateGroupFunneling = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    const ids = targets.map((t) => t.identitasId).filter(Boolean);
    if (onCreateGroupFunneling) {
      onClose();
      onCreateGroupFunneling(ids);
    }
  };

  const handleBulkTambahKeGroupExisting = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    if (onTambahKeGroupFunnelingExisting) {
      onClose();
      onTambahKeGroupFunnelingExisting(targets);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl border border-slate-100 p-6 sm:p-10 relative flex flex-col gap-6 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Top Header Controls matching image.png */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Top Left Two Cards matching image.png */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Card 1: Item S-SALUR */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-4 sm:px-5 py-3 flex items-center justify-between min-w-[200px] sm:w-64">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[11px] text-slate-400 font-normal tracking-wide">
                  Item S-SALUR
                </span>
                <span
                  className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 truncate"
                  title={item.title}
                >
                  {item.title}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <User className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Card 2: A-AJAK */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-4 sm:px-5 py-3 flex items-center justify-between min-w-[200px] sm:w-64">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[11px] text-slate-400 font-normal tracking-wide">
                  A-AJAK
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                  {totalCount} orang{' '}
                  <span className="text-[#008d91] font-semibold">({activeCount} Aktif)</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <User className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>

          {/* Top Right Toolbar matching image.png (Eye, Search, Sliders, + Add, X Close) */}
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => {
                setIsEyeActive(!isEyeActive);
                onShowToast(isEyeActive ? 'Tampilan ringkas' : 'Tampilan lengkap');
              }}
              title={isEyeActive ? 'Sembunyikan detail' : 'Tampilkan semua detail'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isEyeActive
                  ? 'text-slate-400 hover:text-slate-600'
                  : 'text-[#008d91] bg-teal-50'
              }`}
            >
              {isEyeActive ? (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <Eye className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchActive(!isSearchActive)}
              title="Cari personil atau tugas"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSearchActive
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Filter Sliders Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                title="Filter status pekerjaan"
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  filterStatus !== 'all' || isFilterDropdownOpen
                    ? 'text-[#008d91] bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Filter Dropdown Popover */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 top-11 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 text-xs animate-in fade-in duration-100">
                  <div className="font-semibold text-slate-700 px-2 py-1 mb-1 border-b border-slate-100">
                    Filter Status
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('all');
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                      filterStatus === 'all'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>Semua ({totalCount})</span>
                    {filterStatus === 'all' && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('active');
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                      filterStatus === 'active'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>Aktif ({activeCount})</span>
                    {filterStatus === 'active' && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('completed');
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                      filterStatus === 'completed'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>Selesai ({totalCount - activeCount})</span>
                    {filterStatus === 'completed' && (
                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons when selected */}
            {selectedHelperIds.length > 0 && (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => handleBulkCreateGroupFunneling()}
                  className="bg-[#008d91] hover:bg-[#007b7e] text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Create Group Funneling"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Group Funneling ({selectedHelperIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkTambahKeGroupExisting()}
                  className="bg-white border border-[#008d91] text-[#008d91] hover:bg-teal-50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Tambah ke Existing"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Tambah ke Existing</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleKirimPM()}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
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
              className="bg-[#008d91] hover:bg-[#007b7e] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup Pop-up"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Search Input Bar if toggled */}
        {isSearchActive && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-in fade-in duration-100">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama, ID, panggilan, atau job advance personil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Main Table matching image.png */}
        <div className="w-full overflow-x-auto custom-scrollbar mt-2">
          <table className="w-full border-collapse min-w-[760px]">
            {/* Table Header */}
            <thead>
              <tr className="text-slate-700 text-sm sm:text-base font-semibold">
                {/* Select column */}
                <th className="py-3 pl-4 pr-1 text-center w-12">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isAllSelected
                        ? 'bg-[#008d91] border-[#008d91] text-white'
                        : selectedHelperIds.length > 0
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                        : 'border-slate-300 bg-white hover:border-[#008d91]'
                    }`}
                    title="Pilih Semua"
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {!isAllSelected && selectedHelperIds.length > 0 && (
                      <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                    )}
                  </button>
                </th>

                {/* A-AJAK column */}
                <th className="py-3 px-4 text-left font-semibold w-[36%]">
                  <div className="pl-14 sm:pl-16">A-AJAK</div>
                </th>

                {/* Tanggal Mulai column (centered 2 lines matching image.png) */}
                <th className="py-3 px-4 text-center font-semibold leading-tight w-[18%]">
                  <div>Tanggal</div>
                  <div>Mulai</div>
                </th>

                {/* Tanggal Selesai column (centered 2 lines matching image.png) */}
                <th className="py-3 px-4 text-center font-semibold leading-tight w-[18%]">
                  <div>Tanggal</div>
                  <div>Selesai</div>
                </th>

                {/* Job Advance column */}
                <th className="py-3 px-4 text-center sm:text-left font-semibold w-[20%]">
                  Job Advance
                </th>

                {/* CV column */}
                <th className="py-3 px-4 text-center font-semibold leading-tight whitespace-nowrap w-[14%]">
                  <div>Link</div>
                  <div>CV</div>
                </th>

                {/* 3-dots actions column */}
                <th className="py-3 px-2 text-center w-10"></th>
              </tr>
              {/* Subtle line underneath header as shown in image.png */}
              <tr>
                <td colSpan={7} className="p-0">
                  <div className="border-b border-slate-200 w-full mb-3"></div>
                </td>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {displayedHelpers.map((helper) => {
                const person = identitasMap.get(helper.identitasId);
                const active = isHelperActive(helper);
                const isMenuOpen = activeRowMenuId === helper.id;
                const isSelected = selectedHelperIds.includes(helper.id);

                // Avatar styling matching image.png:
                // Agustino Ong -> Teal/Green "A"
                // Cindy Budiman -> Yellow "C"
                // Silvia Fukada -> Slate "S"
                // Bhadra Ksanti -> Dark Teal "B"
                const initial =
                  person?.avatarInitial ||
                  person?.namaLengkap?.charAt(0)?.toUpperCase() ||
                  'A';

                const avatarBgColor =
                  person?.avatarBg ||
                  (initial === 'C'
                    ? 'bg-[#eab308]'
                    : initial === 'S'
                    ? 'bg-[#64748b]'
                    : initial === 'B'
                    ? 'bg-[#0f766e]'
                    : 'bg-[#14b8a6]');

                return (
                  <tr
                    key={helper.id}
                    className={`hover:bg-slate-50/70 transition-colors group/row ${
                      isSelected ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    {/* Select Checkbox Column */}
                    <td className="py-4 sm:py-5 pl-4 pr-1 text-center align-middle w-12">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(helper.id);
                        }}
                        className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#008d91] border-[#008d91] text-white'
                            : 'border-slate-300 bg-white hover:border-[#008d91]'
                        }`}
                        title={isSelected ? 'Batal pilih' : 'Pilih personil ini'}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Person: Avatar + Name + Subtitle */}
                    <td className="py-4 sm:py-5 px-4 align-middle">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Circular Avatar */}
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${avatarBgColor} text-white flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-xs select-none`}
                        >
                          {initial}
                        </div>

                        {/* Name & Subtitle */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                            {person?.codeId ? `${person.codeId} ` : ''}
                            {person?.namaLengkap || 'Identitas Tidak Dikenal'}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                            {person?.namaPanggilan || '-'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tanggal Mulai: Teal pill badge */}
                    <td className="py-4 sm:py-5 px-4 text-center align-middle">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-[#008d91] text-white text-xs sm:text-sm font-medium whitespace-nowrap shadow-2xs">
                        {helper.tanggalMulai || recordTanggalMulaiBekerja || '18 Jan 2021'}
                      </span>
                    </td>

                    {/* Tanggal Selesai: Teal pill badge OR '-' if Aktif */}
                    <td className="py-4 sm:py-5 px-4 text-center align-middle">
                      {active ? (
                        <span
                          className="text-slate-600 text-base font-medium select-none"
                          title="Aktif (Pekerjaan masih dikerjakan / belum ada tanggal selesai)"
                        >
                          -
                        </span>
                      ) : (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#008d91] text-white text-xs sm:text-sm font-medium whitespace-nowrap shadow-2xs">
                          {helper.tanggalSelesai}
                        </span>
                      )}
                    </td>

                    {/* Job Advance */}
                    <td className="py-4 sm:py-5 px-4 text-center sm:text-left text-sm sm:text-base text-slate-700 font-normal align-middle">
                      {helper.jobAdvance || 'Penulis Artikel'}
                    </td>

                    {/* CV Column */}
                    <td className="py-4 sm:py-5 px-4 text-center align-middle whitespace-nowrap">
                      {helper.cvUrl || person?.cvUrl ? (
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={helper.cvUrl || person?.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-[#008d91] font-semibold text-xs border border-teal-200/80 transition-all shadow-2xs group/cv cursor-pointer"
                            title={`Buka Link CV: ${helper.cvUrl || person?.cvUrl}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Lihat CV</span>
                            <ExternalLink className="w-3 h-3 text-[#008d91]/70 group-hover/cv:text-[#008d91]" />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditCvTargetHelper(helper);
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
                            setEditCvTargetHelper(helper);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 hover:border-[#008d91] text-slate-400 hover:text-[#008d91] text-xs font-medium hover:bg-teal-50/50 transition-all cursor-pointer shadow-2xs"
                          title="Tambah Link CV untuk personil ini"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Link CV</span>
                        </button>
                      )}
                    </td>

                    {/* Actions 3 dots */}
                    <td className="py-4 sm:py-5 px-2 text-center align-middle relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveRowMenuId(isMenuOpen ? null : helper.id)
                        }
                        title="Opsi personil"
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-12 z-30 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs text-left animate-in fade-in duration-100">
                          {/* Create Group Funneling */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowMenuId(null);
                              handleBulkCreateGroupFunneling([helper.id]);
                            }}
                            className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                          >
                            <FolderPlus className="w-4 h-4 text-[#008d91]" />
                            <span>Create Group Funneling</span>
                          </button>

                          {/* Tambah ke Existing */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowMenuId(null);
                              handleBulkTambahKeGroupExisting([helper.id]);
                            }}
                            className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                          >
                            <FolderInput className="w-4 h-4 text-[#008d91]" />
                            <span>Tambah ke Existing</span>
                          </button>

                          {/* Kirim PM */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowMenuId(null);
                              handleKirimPM([helper.id]);
                            }}
                            className="w-full px-3.5 py-2 text-[#008d91] hover:bg-teal-50 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-[#008d91]" />
                            <span>Kirim PM ke Personil Ini</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          {/* Ubah / Tambah Link CV */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRowMenuId(null);
                              setEditCvTargetHelper(helper);
                            }}
                            className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                          >
                            <FileText className="w-4 h-4 text-[#008d91]" />
                            <span>{helper.cvUrl ? 'Ubah Link CV' : 'Tambah Link CV'}</span>
                          </button>

                          {/* Toggle Active / Selesai */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(helper)}
                            className="w-full px-3.5 py-2 text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                          >
                            {active ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                                <span>Tandai Selesai</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span>Tandai Masih Aktif</span>
                              </>
                            )}
                          </button>

                          {/* Edit helper */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(helper)}
                            className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <span>Ubah Data / Job Advance</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          {/* Delete helper */}
                          <button
                            type="button"
                            onClick={() => handleDeleteHelper(helper)}
                            className="w-full px-3.5 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus dari List</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Empty state if no helpers match */}
              {displayedHelpers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm">
                      {searchQuery
                        ? 'Tidak ada personil yang sesuai dengan pencarian'
                        : 'Belum ada data personil A-AJAK untuk item ini'}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="mt-3 text-xs font-semibold text-[#008d91] hover:underline"
                    >
                      + Tambah Personil Sekarang
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Action Bar when helpers are selected */}
        {selectedHelperIds.length > 0 && (
          <div className="sticky bottom-0 z-40 bg-slate-900/90 text-white backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl flex items-center justify-between gap-3.5 animate-in fade-in slide-in-from-bottom-3 mt-4">
            <span className="text-xs sm:text-sm font-medium">
              {selectedHelperIds.length} personil A-AJAK dipilih
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkCreateGroupFunneling()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#008d91] hover:bg-[#00787c] text-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-xs"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Group</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkTambahKeGroupExisting()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-xs"
              >
                <FolderInput className="w-3.5 h-3.5" />
                <span>+ Group Existing</span>
              </button>
              <button
                type="button"
                onClick={() => handleKirimPM()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#008d91] hover:bg-[#00787c] text-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim PM</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedHelperIds([])}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Batal pilih"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sub-modal: Add / Edit Helper */}
      {isEditModalOpen && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col gap-5 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingHelper ? 'Ubah Data Personil A-AJAK' : 'Tambah Personil A-AJAK'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs sm:text-sm">
              {/* Field 1: Person Selection */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="font-semibold text-slate-700">Pilih Identitas A-AJAK</label>
                <div
                  onClick={() => setIsIdentitasDropdownOpen(!isIdentitasDropdownOpen)}
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-[#008d91]"
                >
                  <span className="truncate text-slate-800">
                    {formIdentitasId
                      ? `${identitasMap.get(formIdentitasId)?.codeId || ''} ${
                          identitasMap.get(formIdentitasId)?.namaLengkap || ''
                        } (${identitasMap.get(formIdentitasId)?.namaPanggilan || '-'})`
                      : 'Pilih personil...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {isIdentitasDropdownOpen && (
                  <div className="absolute left-0 right-0 top-16 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-2">
                    <input
                      type="text"
                      placeholder="Cari nama atau ID..."
                      value={formIdentitasSearch}
                      onChange={(e) => setFormIdentitasSearch(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl mb-2 text-xs outline-none focus:border-[#008d91]"
                      autoFocus
                    />
                    {identitasList
                      .filter((p) => {
                        if (!formIdentitasSearch.trim()) return true;
                        const q = formIdentitasSearch.toLowerCase();
                        return (
                          p.namaLengkap.toLowerCase().includes(q) ||
                          (p.namaPanggilan && p.namaPanggilan.toLowerCase().includes(q)) ||
                          (p.codeId && p.codeId.toLowerCase().includes(q))
                        );
                      })
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setFormIdentitasId(p.id);
                            setIsIdentitasDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                            formIdentitasId === p.id
                              ? 'bg-teal-50 text-[#008d91] font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>
                            {p.codeId ? `${p.codeId} ` : ''}
                            {p.namaLengkap} ({p.namaPanggilan || '-'})
                          </span>
                          {formIdentitasId === p.id && (
                            <Check className="w-3.5 h-3.5 text-[#008d91]" />
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Field 2: Job Advance */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="font-semibold text-slate-700">Job Advance</label>
                <div
                  onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-[#008d91]"
                >
                  <input
                    type="text"
                    value={formJobAdvance}
                    onChange={(e) => setFormJobAdvance(e.target.value)}
                    placeholder="Pilih atau ketik tugas..."
                    className="w-full bg-transparent outline-none text-slate-800"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>

                {isJobDropdownOpen && (
                  <div className="absolute left-0 right-0 top-16 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2">
                    {['Layout', 'Design Cover', 'Penulis Artikel', 'Penyunting', 'Proofreader', 'Penerjemah'].map(
                      (job) => (
                        <button
                          key={job}
                          type="button"
                          onClick={() => {
                            setFormJobAdvance(job);
                            setIsJobDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                            formJobAdvance === job
                              ? 'bg-teal-50 text-[#008d91] font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{job}</span>
                          {formJobAdvance === job && (
                            <Check className="w-3.5 h-3.5 text-[#008d91]" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Field 3: Tanggal Mulai */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="font-semibold text-slate-700">Tanggal Mulai</label>
                <div
                  onClick={() => setIsDateRangePickerOpen(true)}
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between relative cursor-pointer"
                >
                  <input
                    type="text"
                    value={formTanggalMulai}
                    onChange={(e) => setFormTanggalMulai(e.target.value)}
                    placeholder="Contoh: 18 Jan 2021"
                    className="w-full bg-transparent outline-none text-slate-800 pr-7 cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-[#008d91] shrink-0" />
                </div>
              </div>

              {/* Field 4: Status Aktif (Masih dikerjakan) Checkbox */}
              <div className="flex items-center gap-3 bg-teal-50/60 p-3 rounded-2xl border border-teal-100">
                <input
                  type="checkbox"
                  id="checkbox-aktif"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#008d91] rounded accent-[#008d91] cursor-pointer"
                />
                <label
                  htmlFor="checkbox-aktif"
                  className="text-xs sm:text-sm font-medium text-slate-800 cursor-pointer select-none"
                >
                  Pekerjaan masih dikerjakan (Status Aktif)
                  <span className="block text-[11px] text-slate-500 font-normal">
                    Jika aktif, tanggal selesai akan kosong (-)
                  </span>
                </label>
              </div>

              {/* Field 5: Tanggal Selesai (Only if not active) */}
              {!formIsActive && (
                <div className="flex flex-col gap-1.5 animate-in fade-in relative">
                  <label className="font-semibold text-slate-700">Tanggal Selesai</label>
                  <div
                    onClick={() => setIsDateRangePickerOpen(true)}
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between relative cursor-pointer"
                  >
                    <input
                      type="text"
                      value={formTanggalSelesai}
                      onChange={(e) => setFormTanggalSelesai(e.target.value)}
                      placeholder="Contoh: 20 Jan 2021"
                      className="w-full bg-transparent outline-none text-slate-800 pr-7 cursor-pointer"
                    />
                    <Calendar className="w-4 h-4 text-[#008d91] shrink-0" />
                  </div>
                </div>
              )}

              {/* Field 6: Link CV */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-700">Link Dokumen CV</label>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    value={formCvUrl}
                    onChange={(e) => setFormCvUrl(e.target.value)}
                    placeholder="https://drive.google.com/... (Link Google Drive, LinkedIn, PDF)"
                    className="w-full bg-transparent outline-none text-slate-800 text-xs sm:text-sm"
                  />
                  {formCvUrl && (formCvUrl.startsWith('http://') || formCvUrl.startsWith('https://')) && (
                    <a
                      href={formCvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[#008d91] hover:bg-teal-50 rounded-lg transition-colors shrink-0"
                      title="Uji / Buka link CV"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Tautan ke Google Drive publik, LinkedIn, atau berkas CV PDF.
                </span>
              </div>

              {/* Date Range Popover */}
              <DateRangePickerPopover
                isOpen={isDateRangePickerOpen}
                onClose={() => setIsDateRangePickerOpen(false)}
                startDate={formTanggalMulai}
                endDate={formTanggalSelesai}
                onSelectRange={(start, end) => {
                  setFormTanggalMulai(start);
                  if (!formIsActive) {
                    setFormTanggalSelesai(end || start);
                  }
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveHelper}
                className="px-5 py-2 rounded-xl bg-[#008d91] hover:bg-[#007b7e] text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit CV Modal */}
      <ModalEditCvLink
        isOpen={!!editCvTargetHelper}
        onClose={() => setEditCvTargetHelper(null)}
        personName={
          editCvTargetHelper
            ? identitasMap.get(editCvTargetHelper.identitasId)?.namaLengkap || 'Personil'
            : ''
        }
        personCode={
          editCvTargetHelper
            ? identitasMap.get(editCvTargetHelper.identitasId)?.codeId
            : undefined
        }
        initialUrl={
          editCvTargetHelper
            ? editCvTargetHelper.cvUrl || identitasMap.get(editCvTargetHelper.identitasId)?.cvUrl || ''
            : ''
        }
        onSave={(url) => {
          if (editCvTargetHelper) {
            handleSaveCvUrl(editCvTargetHelper.id, url);
          }
        }}
      />
    </div>
  );
};
