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
  ShoppingCart,
  Play,
  Image as ImageIcon,
} from 'lucide-react';
import { TemplatePMItem, ListPMItem } from '../types';
import { SalurOrder } from '../salurData';
import { calculateTemplatePMRate } from '../templatePMData';
import { TemplatePMStatCard } from './TemplatePMStatCard';
import { UbahLogoTemplatePMModal } from './UbahLogoTemplatePMModal';

interface TemplatePMViewProps {
  items: TemplatePMItem[];
  listPMItems?: ListPMItem[];
  salurOrders?: SalurOrder[];
  onSaveItem: (item: TemplatePMItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleAktif?: (id: string) => void;
  onShowToast?: (message: string) => void;
  onAddNew?: () => void;
  onEditItem?: (item: TemplatePMItem) => void;
}

export const TemplatePMView: React.FC<TemplatePMViewProps> = ({
  items,
  listPMItems = [],
  salurOrders = [],
  onSaveItem,
  onDeleteItem,
  onToggleAktif,
  onShowToast = (_msg: string) => {},
  onAddNew,
  onEditItem,
}) => {
  // Toolbar toggles
  const [hideSensitive, setHideSensitive] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'tidak'>('all');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Real-time active Template PM count
  // "bentuk ini untuk menunjukan secara real ada berapa Template PM yang aktif.
  // Tulisan atas adalah 'Template PM', dan bawah adalah jumlahnya."
  const activeTemplatePMCount = useMemo(() => {
    return items.filter((item) => item.aktif).length;
  }, [items]);

  // Expanded rows state: initially row 'tpm-3' is expanded matching the screenshot
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    () => new Set(['tpm-3'])
  );

  // Popover menu per row
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Add / Edit Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TemplatePMItem | null>(null);
  const [formData, setFormData] = useState<{
    namaTemplate: string;
    subTitle: string;
    kegiatan: string;
    itemTerkait: string;
    avatarInitial: string;
    avatarBg: string;
    aktif: boolean;
    isiPesan: string;
    hasImage: boolean;
  }>({
    namaTemplate: '',
    subTitle: 'Template',
    kegiatan: '',
    itemTerkait: '',
    avatarInitial: 'A',
    avatarBg: 'bg-[#008d91]',
    aktif: true,
    isiPesan: '',
    hasImage: false,
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

  // Toggle row expand
  const toggleExpand = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.namaTemplate.toLowerCase().includes(q);
        const matchKegiatan = item.kegiatan.toLowerCase().includes(q);
        const matchContent = item.isiPesan.toLowerCase().includes(q);
        if (!matchTitle && !matchKegiatan && !matchContent) return false;
      }

      // Status filter
      if (statusFilter === 'aktif' && !item.aktif) return false;
      if (statusFilter === 'tidak' && item.aktif) return false;

      return true;
    });
  }, [items, searchQuery, statusFilter]);

  // Open modal for Create or Edit
  const openFormModal = (item?: TemplatePMItem) => {
    if (item) {
      if (onEditItem) {
        setActiveMenuId(null);
        onEditItem(item);
        return;
      }
      setEditingItem(item);
      setFormData({
        namaTemplate: item.namaTemplate,
        subTitle: item.subTitle || 'Template',
        kegiatan: item.kegiatan,
        itemTerkait: item.itemTerkait || '',
        avatarInitial: item.avatarInitial || item.namaTemplate[0]?.toUpperCase() || 'T',
        avatarBg: item.avatarBg || 'bg-[#008d91]',
        aktif: item.aktif,
        isiPesan: item.isiPesan,
        hasImage: Boolean(item.hasImage),
      });
    } else {
      if (onAddNew) {
        onAddNew();
        return;
      }
      setEditingItem(null);
      setFormData({
        namaTemplate: '',
        subTitle: 'Template',
        kegiatan: '',
        itemTerkait: '',
        avatarInitial: 'A',
        avatarBg: 'bg-[#008d91]',
        aktif: true,
        isiPesan:
          'Namo Buddhaya {Nama},\n\nTerima kasih telah berpartisipasi dalam program kami. Semoga kebajikan ini membawa kebahagiaan bagi Anda dan keluarga. 🙏',
        hasImage: false,
      });
    }
    setActiveMenuId(null);
    setFormModalOpen(true);
  };

  // Submit form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaTemplate.trim()) {
      onShowToast('Nama Template PM wajib diisi');
      return;
    }
    if (!formData.kegiatan.trim()) {
      onShowToast('Nama Kegiatan / Proyek SAPA wajib diisi');
      return;
    }

    const initial = formData.avatarInitial.trim()
      ? formData.avatarInitial.trim()[0].toUpperCase()
      : formData.namaTemplate.trim()[0].toUpperCase();

    if (editingItem) {
      const updated: TemplatePMItem = {
        ...editingItem,
        namaTemplate: formData.namaTemplate,
        subTitle: formData.subTitle || 'Template',
        kegiatan: formData.kegiatan,
        itemTerkait: formData.itemTerkait,
        avatarInitial: initial,
        avatarBg: formData.avatarBg,
        aktif: formData.aktif,
        isiPesan: formData.isiPesan,
        hasImage: formData.hasImage,
      };
      onSaveItem(updated);
      onShowToast(`Template PM "${updated.namaTemplate}" berhasil diperbarui`);
    } else {
      const newItem: TemplatePMItem = {
        id: `tpm-${Date.now()}`,
        namaTemplate: formData.namaTemplate,
        subTitle: formData.subTitle || 'Template',
        kegiatan: formData.kegiatan,
        itemTerkait: formData.itemTerkait,
        avatarInitial: initial,
        avatarBg: formData.avatarBg,
        aktif: formData.aktif,
        isiPesan: formData.isiPesan,
        hasImage: formData.hasImage,
        baseSentCount: 0,
      };
      onSaveItem(newItem);
      onShowToast(`Template PM "${newItem.namaTemplate}" berhasil ditambahkan`);
    }

    setFormModalOpen(false);
  };

  // Copy message text to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('Isi pesan berhasil disalin ke clipboard');
    setActiveMenuId(null);
  };

  // Helper to render message with red highlighted placeholders [Nama Acara], [Nama Organisasi], etc.
  const renderFormattedMessage = (text: string) => {
    // Regex splits by placeholders like [Text] or {Text}
    const parts = text.split(/(\[[^\]]+\]|\{[^\}]+\})/g);
    return (
      <div className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
        {parts.map((part, idx) => {
          if (
            (part.startsWith('[') && part.endsWith(']')) ||
            (part.startsWith('{') && part.endsWith('}'))
          ) {
            return (
              <span key={idx} className="text-[#e05244] font-medium">
                {part}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top bar: Left Stat Card ("Pos Pemasukan 2 buah") and Right Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Left Stat Card: Template PM (shows real active count and custom logo) */}
          <TemplatePMStatCard
            activeCount={activeTemplatePMCount}
            onLogoClick={() => setIsLogoModalOpen(true)}
          />

          {/* Right Action Toolbar matching screenshot */}
          <div className="flex items-center justify-end gap-3 self-end sm:self-center">
            {/* Privacy Toggle Button */}
            <button
              type="button"
              onClick={() => setHideSensitive(!hideSensitive)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              title={hideSensitive ? 'Tampilkan Data' : 'Sembunyikan Data'}
            >
              {hideSensitive ? <Eye className="w-5 h-5 stroke-[1.8]" /> : <EyeOff className="w-5 h-5 stroke-[1.8]" />}
            </button>

            {/* Search Toggle Button */}
            {searchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Template PM / Kegiatan..."
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
                  searchQuery ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
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
                  statusFilter !== 'all' ? 'text-[#008d91] bg-teal-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title="Filter Status"
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Status Aktif
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'all' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Semua Status</span>
                    {statusFilter === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('aktif');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'aktif' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Hanya Aktif (Yes)</span>
                    {statusFilter === 'aktif' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('tidak');
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                      statusFilter === 'tidak' ? 'text-[#008d91] bg-teal-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tidak Aktif (No)</span>
                    {statusFilter === 'tidak' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* + Add Button */}
            <button
              type="button"
              onClick={() => openFormModal()}
              className="bg-[#008d91] hover:bg-[#05828e] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[700px]">
            {/* Table Header matching screenshot */}
            <thead>
              <tr className="border-b border-slate-100 text-slate-700 text-sm font-semibold">
                <th className="py-4 px-4 sm:px-6 w-[34%]">
                  <span className="ml-6">Template PM</span>
                </th>
                <th className="py-4 px-4 sm:px-6 w-[26%]">Proyek SAPA</th>
                <th className="py-4 px-4 sm:px-6 w-[20%]">
                  <div className="flex flex-col">
                    <span>Pesan Terkirim</span>
                    <span className="text-xs text-slate-400 font-normal">(%Rate)</span>
                  </div>
                </th>
                <th className="py-4 px-4 sm:px-6 w-[14%]">Aktif/Tidak?</th>
                <th className="py-4 px-3 w-[6%] text-center"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada Template PM yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedRowIds.has(item.id);
                  const rateResult = calculateTemplatePMRate(
                    item,
                    listPMItems,
                    salurOrders
                  );

                  return (
                    <React.Fragment key={item.id}>
                      {/* Main Table Row */}
                      <tr className="hover:bg-slate-50/70 transition-colors group">
                        {/* Col 1: Expand Button + Avatar + Title & Subtitle */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            {/* Teal triangle expand toggle */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(item.id)}
                              className="text-[#008d91] hover:text-[#007478] p-1 transition-transform cursor-pointer shrink-0"
                              title={isExpanded ? 'Tutup Detail' : 'Buka Detail'}
                            >
                              <Play
                                className={`w-3 h-3 fill-[#008d91] text-[#008d91] transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : 'rotate-0'
                                }`}
                              />
                            </button>

                            {/* Square Avatar */}
                            <div
                              className={`w-10 h-10 rounded-xl ${item.avatarBg} text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {item.avatarInitial}
                            </div>

                            {/* Title & Subtitle */}
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 text-sm sm:text-base leading-snug">
                                {item.namaTemplate}
                              </span>
                              <span className="text-xs text-slate-400 font-normal">
                                {item.subTitle || 'Template'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Col 2: Proyek SAPA (Kegiatan: [Value]) */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-normal">
                              Kegiatan:
                            </span>
                            <span className="font-bold text-slate-800 text-sm leading-snug">
                              {item.kegiatan}
                            </span>
                          </div>
                        </td>

                        {/* Col 3: Pesan Terkirim (%Rate) */}
                        <td className="py-4 px-4 sm:px-6">
                          <span className="bg-[#008d91] text-white text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center justify-center shadow-2xs select-none">
                            {rateResult.displayText}
                          </span>
                        </td>

                        {/* Col 4: Aktif / Tidak? */}
                        <td className="py-4 px-4 sm:px-6">
                          {item.aktif ? (
                            <span className="bg-[#008d91] text-white text-xs font-semibold px-5 py-1.5 rounded-full inline-flex items-center justify-center shadow-2xs select-none">
                              Yes
                            </span>
                          ) : (
                            <span className="bg-[#e05244] text-white text-xs font-semibold px-5 py-1.5 rounded-full inline-flex items-center justify-center shadow-2xs select-none">
                              No
                            </span>
                          )}
                        </td>

                        {/* Col 5: Action 3-dots */}
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

                          {/* Row Context Menu */}
                          {activeMenuId === item.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-4 top-12 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => openFormModal(item)}
                                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Template</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyText(item.isiPesan)}
                                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Salin Teks Pesan</span>
                              </button>

                              {onToggleAktif && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleAktif(item.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{item.aktif ? 'Set Tidak Aktif' : 'Set Aktif'}</span>
                                </button>
                              )}

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteItem(item.id);
                                  setActiveMenuId(null);
                                  onShowToast(`Template "${item.namaTemplate}" dihapus`);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Hapus Template</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Content Sub-Row matching screenshot (Row 3 expanded design) */}
                      {isExpanded && (
                        <tr className="bg-[#fcfdfe]">
                          <td colSpan={5} className="px-6 py-5 border-b border-slate-100">
                            <div className="pl-6 space-y-4">
                              {/* Blue Image Icon Container matching screenshot */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14 rounded-2xl bg-[#1d82f5] flex items-center justify-center text-white shadow-2xs overflow-hidden border border-slate-100">
                                    {item.imageUrl ? (
                                      <img src={item.imageUrl} alt={item.namaTemplate} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-7 h-7 stroke-[1.8]" />
                                    )}
                                  </div>
                                  {item.imageOverlayFields && item.imageOverlayFields.length > 0 && (
                                    <div>
                                      <span className="text-xs font-bold text-slate-800 block">
                                        Template Gambar dengan {item.imageOverlayFields.length} Field Custom
                                      </span>
                                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                        {item.imageOverlayFields.map((f) => (
                                          <span
                                            key={f.id}
                                            className="text-[10px] font-mono bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-semibold border border-red-100"
                                          >
                                            {f.tag}: {f.value}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(activeMenuId === `sub-${item.id}` ? null : `sub-${item.id}`)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Formatted Template Message with red placeholders */}
                              <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-2xs">
                                {renderFormattedMessage(item.isiPesan)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah / Edit Template PM */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {editingItem ? 'Edit Template PM' : 'Tambah Template PM'}
              </h3>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Nama Template PM */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Template PM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ajakan Save Nomor"
                  value={formData.namaTemplate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      namaTemplate: e.target.value,
                      avatarInitial: formData.avatarInitial || e.target.value[0]?.toUpperCase() || 'T',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                />
              </div>

              {/* Kegiatan / Proyek SAPA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kegiatan / Proyek SAPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Save Nomor HP, Penyaluran, Media Partner"
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                />
              </div>

              {/* Item Terkait (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Item Terkait (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Buku Jalan Menuju Kemahatahuan"
                  value={formData.itemTerkait}
                  onChange={(e) => setFormData({ ...formData, itemTerkait: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                />
              </div>

              {/* Avatar Initial & Background Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Inisial Avatar
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.avatarInitial}
                    onChange={(e) => setFormData({ ...formData, avatarInitial: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Warna Avatar
                  </label>
                  <select
                    value={formData.avatarBg}
                    onChange={(e) => setFormData({ ...formData, avatarBg: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                  >
                    <option value="bg-[#008d91]">Teal (#008d91)</option>
                    <option value="bg-[#d94819]">Coral Orange (#d94819)</option>
                    <option value="bg-[#a88241]">Gold/Tan (#a88241)</option>
                    <option value="bg-[#2295d8]">Blue (#2295d8)</option>
                    <option value="bg-[#d9659b]">Pink (#d9659b)</option>
                  </select>
                </div>
              </div>

              {/* Status Aktif / Tidak */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Aktif / Tidak?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, aktif: true })}
                    className={`px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      formData.aktif
                        ? 'bg-[#008d91] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Yes (Aktif)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, aktif: false })}
                    className={`px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      !formData.aktif
                        ? 'bg-[#e05244] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    No (Tidak Aktif)
                  </button>
                </div>
              </div>

              {/* Isi Pesan Template PM */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Isi Pesan Template PM <span className="text-red-500">*</span>
                </label>
                <div className="text-[11px] text-slate-400 mb-2">
                  Tips: Gunakan <span className="text-[#e05244] font-semibold">[Nama Acara]</span>,{' '}
                  <span className="text-[#e05244] font-semibold">[Nama Organisasi]</span>, atau{' '}
                  <span className="text-[#e05244] font-semibold">{'{Nama}'}</span> untuk teks dinamis.
                </div>
                <textarea
                  required
                  rows={6}
                  placeholder="Tuliskan format pesan PM..."
                  value={formData.isiPesan}
                  onChange={(e) => setFormData({ ...formData, isiPesan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91]"
                />
              </div>

              {/* Lampiran Gambar */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasImage"
                  checked={formData.hasImage}
                  onChange={(e) => setFormData({ ...formData, hasImage: e.target.checked })}
                  className="w-4 h-4 rounded text-[#008d91] focus:ring-[#008d91]"
                />
                <label htmlFor="hasImage" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Tampilkan icon / lampiran poster promosi
                </label>
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ubah Logo Template PM */}
      <UbahLogoTemplatePMModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSuccess={() => onShowToast('Logo Template PM berhasil diperbarui')}
      />
    </div>
  );
};
