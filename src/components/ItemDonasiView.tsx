import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  EyeOff,
  Eye,
  ShoppingCart,
  Globe,
  MoreVertical,
  X,
  Check,
  Edit2,
  Trash2,
  Play,
  Calendar,
  ExternalLink,
  FileText,
  Sparkles,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Book,
  BookOpen,
  Boxes,
  Gift,
  Award,
  Heart,
  Tag,
  Upload,
} from 'lucide-react';
import {
  ItemDonasiEvent,
  ItemDonasiChild,
  INITIAL_ITEM_DONASI_EVENTS,
} from '../itemDonasiData';
import {
  SubJenisItemDonasiItem,
  INITIAL_SUB_JENIS_DONASI,
  getSubJenisDonasiFromStorage,
  saveSubJenisDonasiToStorage,
} from '../subJenisDonasiData';
import { TemplatePMItem } from '../types';
import { loadTemplatePM } from '../templatePMData';
import { ModalCreateTandaTerimaDonasi } from './ModalCreateTandaTerimaDonasi';

interface ItemDonasiViewProps {
  onShowToast?: (msg: string) => void;
  onAddClick?: () => void;
  templatePMList?: TemplatePMItem[];
  subJenisList?: SubJenisItemDonasiItem[];
  onUpdateSubJenisList?: (items: SubJenisItemDonasiItem[]) => void;
  onNavigateToFormTemplatePM?: (initialData?: Partial<TemplatePMItem>) => void;
  onNavigateToAlokasiSalur?: (evt: ItemDonasiEvent, child?: ItemDonasiChild) => void;
}

export const ItemDonasiView: React.FC<ItemDonasiViewProps> = ({
  onShowToast = (_msg: string) => {},
  onAddClick,
  templatePMList,
  subJenisList,
  onUpdateSubJenisList,
  onNavigateToFormTemplatePM,
  onNavigateToAlokasiSalur,
}) => {
  // Persistence via localStorage
  const [events, setEvents] = useState<ItemDonasiEvent[]>(() => {
    const saved = localStorage.getItem('yppln_item_donasi_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: ItemDonasiEvent) => ({
            ...item,
            proyekSapa: item.proyekSapa || item.subtitle || 'D-DONASI',
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ITEM_DONASI_EVENTS;
  });

  // Sub-Jenis Item D-DONASI state
  const [subJenisItems, setSubJenisItems] = useState<SubJenisItemDonasiItem[]>(() => {
    if (subJenisList && subJenisList.length > 0) return subJenisList;
    return getSubJenisDonasiFromStorage();
  });

  useEffect(() => {
    if (subJenisList && subJenisList.length > 0) {
      setSubJenisItems(subJenisList);
    }
  }, [subJenisList]);

  // Carousel ref and selected sub-jenis filter state
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const [selectedSubJenisFilter, setSelectedSubJenisFilter] = useState<string | null>(null);

  // Modal Ubah Logo Sub-Jenis state
  const [editingLogoSubJenis, setEditingLogoSubJenis] = useState<SubJenisItemDonasiItem | null>(null);
  const [tempIconType, setTempIconType] = useState<string>('book');
  const [tempLogoUrl, setTempLogoUrl] = useState<string>('');
  const [tempIconBg, setTempIconBg] = useState<string>('#008d91');
  const [isChangeLogoModalOpen, setIsChangeLogoModalOpen] = useState(false);

  // Helper matching event to sub-jenis
  const eventBelongsToSubJenis = (evt: ItemDonasiEvent, sj: SubJenisItemDonasiItem): boolean => {
    const sjName = sj.namaSubJenis.toLowerCase().trim();
    if (evt.subJenis && evt.subJenis.toLowerCase().trim() === sjName) return true;
    if (evt.subJenisItem && evt.subJenisItem.toLowerCase().trim() === sjName) return true;
    if (evt.subtitle && evt.subtitle.toLowerCase().includes(sjName)) return true;
    if (evt.proyekSapa && evt.proyekSapa.toLowerCase().includes(sjName)) return true;
    if (evt.name && evt.name.toLowerCase().includes(sjName)) return true;
    if (sj.kode) {
      const codeLower = sj.kode.toLowerCase();
      if (evt.subtitle && evt.subtitle.toLowerCase().includes(codeLower)) return true;
      if (evt.proyekSapa && evt.proyekSapa.toLowerCase().includes(codeLower)) return true;
      if (evt.name && evt.name.toLowerCase().includes(codeLower)) return true;
    }
    if (sjName.includes('dharma patron rutin') && !sjName.includes('non-rutin')) {
      if (evt.subtitle?.toLowerCase().includes('dharma patron rutin') && !evt.subtitle?.toLowerCase().includes('non-rutin')) return true;
      if (evt.name?.toLowerCase().includes('dharma patron rutin') && !evt.name?.toLowerCase().includes('non-rutin')) return true;
    }
    if (sjName.includes('dharma patron non-rutin')) {
      if (evt.subtitle?.toLowerCase().includes('dharma patron non-rutin')) return true;
      if (evt.name?.toLowerCase().includes('dharma patron non-rutin')) return true;
    }
    if (sjName.includes('buku berbayar')) {
      if (evt.subtitle?.toLowerCase().includes('buku berbayar') || evt.name?.toLowerCase().includes('buku berbayar')) return true;
    }
    if (sjName.includes('operasional')) {
      if (evt.subtitle?.toLowerCase().includes('operasional') || evt.name?.toLowerCase().includes('operasional')) return true;
    }
    if (sjName.includes('penerbitan')) {
      if (evt.subtitle?.toLowerCase().includes('penerbitan') || evt.name?.toLowerCase().includes('penerbitan')) return true;
    }
    if (sjName.includes('kathina')) {
      if (evt.subtitle?.toLowerCase().includes('kathina') || evt.name?.toLowerCase().includes('kathina')) return true;
    }
    if (sjName.includes('event')) {
      if (evt.subtitle?.toLowerCase().includes('event') || evt.name?.toLowerCase().includes('event')) return true;
    }
    return false;
  };

  // Real-time calculation of ONGOING items for each sub-jenis
  const subJenisWithCounts = useMemo(() => {
    return subJenisItems.map((sj) => {
      const matchingOngoing = events.filter((evt) => {
        const isOngoing = (evt.status || '').toLowerCase() === 'ongoing';
        return isOngoing && eventBelongsToSubJenis(evt, sj);
      });
      return {
        ...sj,
        ongoingCount: matchingOngoing.length,
      };
    });
  }, [subJenisItems, events]);

  const handleOpenChangeLogoModal = (sj: SubJenisItemDonasiItem) => {
    setEditingLogoSubJenis(sj);
    setTempIconType(sj.iconType || 'book');
    setTempLogoUrl(sj.logoUrl || '');
    setTempIconBg(sj.iconBg || '#008d91');
    setIsChangeLogoModalOpen(true);
  };

  const handleSaveSubJenisLogo = (
    subJenisId: string,
    updates: { iconType?: string; logoUrl?: string; iconBg?: string }
  ) => {
    const updated = subJenisItems.map((s) => (s.id === subJenisId ? { ...s, ...updates } : s));
    setSubJenisItems(updated);
    saveSubJenisDonasiToStorage(updated);
    if (onUpdateSubJenisList) {
      onUpdateSubJenisList(updated);
    }
    onShowToast(`Logo sub-jenis berhasil diperbarui`);
    setIsChangeLogoModalOpen(false);
    setEditingLogoSubJenis(null);
  };

  const renderIconByName = (iconName: string, className = 'w-4 h-4 stroke-[1.8]') => {
    switch (iconName) {
      case 'book':
        return <Book className={className} />;
      case 'globe':
        return <Globe className={className} />;
      case 'book-open':
        return <BookOpen className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'boxes':
        return <Boxes className={className} />;
      case 'gift':
        return <Gift className={className} />;
      case 'calendar':
        return <Calendar className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'heart':
        return <Heart className={className} />;
      case 'tag':
        return <Tag className={className} />;
      case 'shopping-cart':
        return <ShoppingCart className={className} />;
      default:
        return <Globe className={className} />;
    }
  };

  const renderSubJenisIcon = (sj: SubJenisItemDonasiItem) => {
    if (sj.logoUrl) {
      return <img src={sj.logoUrl} alt={sj.namaSubJenis} className="w-full h-full object-cover" />;
    }
    if (sj.iconType) {
      return renderIconByName(sj.iconType);
    }
    const name = sj.namaSubJenis.toLowerCase();
    if (name.includes('rutin') && !name.includes('non-rutin')) return <BookOpen className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('non-rutin')) return <Sparkles className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('buku berbayar')) return <Book className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('operasional')) return <Boxes className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('penerbitan')) return <BookOpen className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('kathina')) return <Gift className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('event')) return <Calendar className="w-4 h-4 stroke-[1.8]" />;
    if (sj.iconLetter) {
      return <span className="font-bold text-xs leading-none">{sj.iconLetter}</span>;
    }
    return <Globe className="w-4 h-4 stroke-[1.8]" />;
  };

  // Template PM list
  const activeTemplatePMList = useMemo(() => {
    if (templatePMList && templatePMList.length > 0) return templatePMList;
    return loadTemplatePM();
  }, [templatePMList]);

  // Modal: Create Tanda Terima
  const [isTandaTerimaModalOpen, setIsTandaTerimaModalOpen] = useState(false);
  const [targetTandaTerimaItem, setTargetTandaTerimaItem] = useState<ItemDonasiEvent | null>(null);
  const [targetTandaTerimaChild, setTargetTandaTerimaChild] = useState<ItemDonasiChild | null>(null);

  const handleOpenCreateTandaTerima = (
    evt: ItemDonasiEvent,
    child?: ItemDonasiChild
  ) => {
    setTargetTandaTerimaItem(evt);
    setTargetTandaTerimaChild(child || null);
    setIsTandaTerimaModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveTandaTerima = (
    itemId: string,
    templateId: string | null,
    templateName?: string
  ) => {
    const updated = events.map((ev) => {
      if (ev.id === itemId) {
        return {
          ...ev,
          tandaTerimaTemplateId: templateId || undefined,
          tandaTerimaTemplateName: templateName || undefined,
        };
      }
      return ev;
    });
    saveEvents(updated);
  };

  const saveEvents = (newEvents: ItemDonasiEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('yppln_item_donasi_events', JSON.stringify(newEvents));
  };

  // Expanded event ids (default: 'item-donasi-1' is expanded as shown in image)
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(
    new Set(['item-donasi-1'])
  );

  // Search & Filter
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Menu popover
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ItemDonasiEvent | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadgeLetter, setFormBadgeLetter] = useState('');
  const [formBadgeColor, setFormBadgeColor] = useState('bg-[#008d91]');
  const [formStatus, setFormStatus] = useState('Ongoing');
  const [formTanggalRange, setFormTanggalRange] = useState('');
  const [formWibTime, setFormWibTime] = useState('00:00 WIB   23.59 WIB');
  const [formLinkText, setFormLinkText] = useState('Poster - Website');
  const [formDisalurkanText, setFormDisalurkanText] = useState('');
  const [formIsPill, setFormIsPill] = useState(true);

  // Toggle row expand
  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormName('');
    setFormSubtitle('');
    setFormBadgeLetter('D');
    setFormBadgeColor('bg-[#008d91]');
    setFormStatus('Ongoing');
    setFormTanggalRange('11 Agu 2021 - 21 Nov 2021');
    setFormWibTime('00:00 WIB   23.59 WIB');
    setFormLinkText('Poster - Website');
    setFormDisalurkanText('');
    setFormIsPill(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (evt: ItemDonasiEvent) => {
    setEditingEvent(evt);
    setFormName(evt.name);
    setFormSubtitle(evt.subtitle);
    setFormBadgeLetter(evt.badgeLetter);
    setFormBadgeColor(evt.badgeColor);
    setFormStatus(evt.status);
    setFormTanggalRange(evt.tanggalRange);
    setFormWibTime(evt.wibTime);
    setFormLinkText(evt.linkText);
    setFormDisalurkanText(evt.disalurkanKepadaText);
    setFormIsPill(evt.isDisalurkanPill ?? true);
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteEvent = (id: string, name: string) => {
    const updated = events.filter((e) => e.id !== id);
    saveEvents(updated);
    onShowToast(`Acara "${name}" berhasil dihapus`);
    setActiveMenuId(null);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama acara wajib diisi');
      return;
    }

    const badgeLetter =
      formBadgeLetter.trim().toUpperCase() ||
      formName.trim().charAt(0).toUpperCase();

    if (editingEvent) {
      const updated = events.map((ev) =>
        ev.id === editingEvent.id
          ? {
              ...ev,
              name: formName.trim(),
              subtitle: formSubtitle.trim(),
              badgeLetter,
              badgeColor: formBadgeColor,
              status: formStatus,
              tanggalRange: formTanggalRange.trim(),
              wibTime: formWibTime.trim(),
              linkText: formLinkText.trim(),
              disalurkanKepadaText: formDisalurkanText.trim(),
              isDisalurkanPill: formIsPill,
            }
          : ev
      );
      saveEvents(updated);
      onShowToast(`Acara "${formName}" berhasil diperbarui`);
    } else {
      const newEvent: ItemDonasiEvent = {
        id: `item-donasi-${Date.now()}`,
        name: formName.trim(),
        subtitle: formSubtitle.trim(),
        badgeLetter,
        badgeColor: formBadgeColor,
        status: formStatus,
        tanggalRange: formTanggalRange.trim() || '11 Agu 2021 - 21 Nov 2021',
        wibTime: formWibTime.trim() || '00:00 WIB   23.59 WIB',
        linkText: formLinkText.trim() || 'Poster - Website',
        disalurkanKepadaText: formDisalurkanText.trim() || 'Pos Donasi',
        isDisalurkanPill: formIsPill,
        children: [],
      };
      saveEvents([newEvent, ...events]);
      onShowToast(`Acara "${formName}" berhasil ditambahkan`);
    }

    setIsAddModalOpen(false);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return events.filter((evt) => {
      const matchSearch =
        !q ||
        evt.name.toLowerCase().includes(q) ||
        evt.subtitle.toLowerCase().includes(q) ||
        evt.disalurkanKepadaText.toLowerCase().includes(q) ||
        (evt.children &&
          evt.children.some(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          ));

      const matchStatus =
        filterStatus === 'all' ||
        evt.status.toLowerCase() === filterStatus.toLowerCase();

      const matchSubJenis =
        !selectedSubJenisFilter ||
        (() => {
          const foundSj = subJenisItems.find((s) => s.namaSubJenis === selectedSubJenisFilter);
          return foundSj ? eventBelongsToSubJenis(evt, foundSj) : true;
        })();

      return matchSearch && matchStatus && matchSubJenis;
    });
  }, [events, searchQuery, filterStatus, selectedSubJenisFilter, subJenisItems]);

  return (
    <div className="w-full pb-16 animate-in fade-in duration-200">
      {/* Top Action Toolbar */}
      <div className="flex items-center justify-end gap-2 mb-4">
        {/* Toggle Eye */}
        <button
          type="button"
          onClick={() => setIsEyeActive(!isEyeActive)}
          title={isEyeActive ? 'Sembunyikan Kolom' : 'Tampilkan Kolom'}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          {isEyeActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        {/* Search button / input */}
        <div className="relative">
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs animate-in slide-in-from-right-2 duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari acara atau paket..."
                autoFocus
                className="w-40 sm:w-60 text-xs text-slate-700 outline-hidden bg-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Sliders */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            title="Filter Status"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              filterStatus !== 'all'
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Filter Status
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('all');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-teal-50 text-[#008d91]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Semua Status</span>
                {filterStatus === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('ongoing');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                  filterStatus === 'ongoing'
                    ? 'bg-teal-50 text-[#008d91]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Ongoing</span>
                {filterStatus === 'ongoing' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('berakhir');
                  setIsFilterDropdownOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                  filterStatus === 'berakhir'
                    ? 'bg-teal-50 text-[#008d91]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Berakhir</span>
                {filterStatus === 'berakhir' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* + Add Button */}
        <button
          type="button"
          onClick={onAddClick ? onAddClick : handleOpenAdd}
          className="bg-[#008d91] hover:bg-[#007b7e] active:scale-98 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Horizontal Stats Cards with Carousel Nav displaying all Sub-Jenis D-DONASI with real-time ongoing counts */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => {
            if (carouselContainerRef.current) {
              carouselContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
            }
            onShowToast('Navigasi kartu sebelumnya');
          }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Carousel Scroll Container displaying ALL sub-jenis */}
        <div
          ref={carouselContainerRef}
          className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar flex-1 scroll-smooth"
        >
          {subJenisWithCounts.map((sj) => {
            const isSelected = selectedSubJenisFilter === sj.namaSubJenis;
            return (
              <div
                key={sj.id}
                onClick={() => {
                  if (selectedSubJenisFilter === sj.namaSubJenis) {
                    setSelectedSubJenisFilter(null);
                    onShowToast('Menampilkan semua sub-jenis D-DONASI');
                  } else {
                    setSelectedSubJenisFilter(sj.namaSubJenis);
                    onShowToast(`Filter: ${sj.namaSubJenis}`);
                  }
                }}
                className={`bg-white rounded-2xl border ${
                  isSelected
                    ? 'border-[#008d91] ring-2 ring-[#008d91]/25'
                    : 'border-slate-100/90 hover:border-slate-200'
                } shadow-2xs px-4 py-3 flex items-center justify-between min-w-[190px] sm:w-60 shrink-0 cursor-pointer transition-all select-none`}
                title={`Klik untuk filter: ${sj.namaSubJenis}`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span
                    className="text-[11px] text-slate-400 font-normal truncate max-w-[135px]"
                    title={sj.namaSubJenis}
                  >
                    {sj.namaSubJenis}
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5">
                    {sj.ongoingCount} Item
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChangeLogoModal(sj);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs hover:scale-105 active:scale-95 transition-transform cursor-pointer overflow-hidden"
                  style={{ backgroundColor: sj.iconBg || '#008d91' }}
                  title={`Ubah logo: ${sj.namaSubJenis}`}
                >
                  {renderSubJenisIcon(sj)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => {
            if (carouselContainerRef.current) {
              carouselContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
            }
            onShowToast('Navigasi kartu berikutnya');
          }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
          title="Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Table / Event List Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6">
        {/* Table Column Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-slate-200 text-slate-700 font-bold text-sm">
          <div className="col-span-5 pl-8">Nama Acara</div>
          <div className="col-span-2 text-center">Tanggal</div>
          <div className="col-span-2 text-center">Pemasukan Divisi</div>
          <div className="col-span-3 text-left">Link dan Disalurkan kepada</div>
        </div>

        {/* Event List */}
        <div className="divide-y divide-slate-100">
          {filteredEvents.map((evt) => {
            const isExpanded = expandedEventIds.has(evt.id);
            const hasChildren = evt.children && evt.children.length > 0;

            return (
              <div key={evt.id} className="py-4 first:pt-4 last:pb-2">
                {/* Main Event Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Column 1: Expand arrow, Badge, Nama Acara */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    {/* Expand/Collapse Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(evt.id)}
                      title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian'}
                      className="text-[#008d91] hover:text-[#00767a] p-1 rounded transition-transform cursor-pointer shrink-0"
                    >
                      <Play
                        className={`w-3.5 h-3.5 fill-[#008d91] transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : 'rotate-0'
                        }`}
                      />
                    </button>

                    {/* Square Badge with initial */}
                    <div
                      className={`w-12 h-12 rounded-2xl ${evt.badgeColor} text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs select-none`}
                    >
                      {evt.badgeLetter}
                    </div>

                    {/* Title, Subtitle, Status */}
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                        {evt.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {evt.subtitle}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${
                            evt.status.toLowerCase() === 'ongoing'
                              ? 'text-[#008d91]'
                              : 'text-slate-400'
                          }`}
                        >
                          {evt.status}
                        </span>
                        {evt.tandaTerimaTemplateId ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCreateTandaTerima(evt)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                            title="Klik untuk melihat atau mengubah Template Tanda Terima"
                          >
                            <FileText className="w-3 h-3 text-emerald-600" />
                            <span className="truncate max-w-[160px]">
                              Tanda Terima: {evt.tandaTerimaTemplateName || 'Template PM'}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenCreateTandaTerima(evt)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#008d91] bg-slate-100 hover:bg-teal-50 border border-slate-200/80 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                            title="Atur Template Tanda Terima untuk Item D-DONASI ini"
                          >
                            <Plus className="w-3 h-3 text-[#008d91]" />
                            <span>Tanda Terima</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Tanggal & WIB */}
                  <div className="md:col-span-2 md:text-center pl-8 md:pl-0">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">
                      {evt.tanggalRange}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {evt.wibTime}
                    </div>
                  </div>

                  {/* Column 3: Pemasukan Divisi */}
                  <div className="md:col-span-2 md:text-center pl-8 md:pl-0">
                    <div className="text-[11px] text-slate-400 md:hidden mb-1">
                      Pemasukan Divisi
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#008d91] border border-teal-200">
                      {evt.pemasukanDivisi || 'FUN'}
                    </span>
                  </div>

                  {/* Column 4: Link & Disalurkan & More Menu */}
                  <div className="md:col-span-3 flex items-center justify-between pl-8 md:pl-0">
                    <div className="space-y-1">
                      <div>
                        <div className="text-[11px] text-slate-400">Link</div>
                        <span className="inline-block bg-[#008d91] text-white text-xs px-3 py-1 rounded-full font-medium mt-0.5">
                          {evt.linkText}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <div className="text-[11px] text-slate-400">
                          Disalurkan kepada
                        </div>
                        {evt.isDisalurkanPill ? (
                          <span className="inline-block bg-[#008d91] text-white text-xs px-3 py-1 rounded-full font-medium mt-0.5">
                            {evt.disalurkanKepadaText}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-800 block mt-0.5">
                            {evt.disalurkanKepadaText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row Menu Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === evt.id ? null : evt.id
                          )
                        }
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenuId === evt.id && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onNavigateToAlokasiSalur) {
                                onNavigateToAlokasiSalur(evt);
                              }
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#008d91] bg-teal-50/70 hover:bg-teal-100/80 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <PackageCheck className="w-4 h-4 text-[#008d91] shrink-0" />
                            <span>Alokasi D-DONASI ke Item S-SALUR</span>
                          </button>
                          <div className="h-px bg-slate-100 my-1" />
                          <button
                            type="button"
                            onClick={() => handleOpenCreateTandaTerima(evt)}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Create Tanda Terima</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(evt)}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Acara</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteEvent(evt.id, evt.name)
                            }
                            className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indented Sub-items / Packages (when expanded) */}
                {isExpanded && hasChildren && (
                  <div className="mt-3 pl-8 sm:pl-11 space-y-3 pt-1 animate-in fade-in duration-150">
                    {evt.children!.map((child) => (
                      <div
                        key={child.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2"
                      >
                        {/* Child Icon, Name, Price, Note */}
                        <div className="md:col-span-5 flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl ${child.badgeColor} text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs select-none`}
                          >
                            {child.badgeLetter}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                              {child.name}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                              {child.price}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 truncate">
                              {child.description}
                            </div>
                          </div>
                        </div>

                        {/* Child Tanggal */}
                        <div className="md:col-span-2 md:text-center pl-14 md:pl-0 text-slate-500 text-xs">
                          {child.tanggal}
                        </div>

                        {/* Child Pemasukan Divisi */}
                        <div className="md:col-span-2 md:text-center pl-14 md:pl-0">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#008d91] border border-teal-100">
                            {evt.pemasukanDivisi || 'FUN'}
                          </span>
                        </div>

                        {/* Child Action */}
                        <div className="md:col-span-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigateToAlokasiSalur) {
                                onNavigateToAlokasiSalur(evt, child);
                              }
                            }}
                            className="text-xs text-[#008d91] hover:bg-teal-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-[#008d91]/30 font-semibold"
                            title="Alokasi D-DONASI ke Item S-SALUR"
                          >
                            <PackageCheck className="w-3.5 h-3.5 text-[#008d91]" />
                            <span className="text-[11px] hidden sm:inline">Alokasi ke S-SALUR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCreateTandaTerima(evt, child)}
                            className="text-xs text-slate-600 hover:text-[#008d91] hover:bg-teal-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
                            title="Create Tanda Terima untuk paket ini"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#008d91]" />
                            <span className="text-[11px] font-medium hidden sm:inline">Tanda Terima</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada data item donasi yang sesuai dengan pencarian/filter.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingEvent ? 'Edit Acara D-DONASI' : 'Tambah Acara D-DONASI'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={handleSaveModal}
              className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Acara <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kathina 2021"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan / Sub-judul
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Contoh: Kathina Dana - MAD"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Huruf Lambang
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formBadgeLetter}
                    onChange={(e) => setFormBadgeLetter(e.target.value)}
                    placeholder="Contoh: K"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden uppercase"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Warna Lambang
                  </label>
                  <select
                    value={formBadgeColor}
                    onChange={(e) => setFormBadgeColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden bg-white"
                  >
                    <option value="bg-[#E05D44]">Merah Koral (Coral)</option>
                    <option value="bg-[#10B981]">Hijau Emerald</option>
                    <option value="bg-[#008d91]">Teal SAPA</option>
                    <option value="bg-[#0F766E]">Dark Teal</option>
                    <option value="bg-[#E29578]">Peach / Tan</option>
                    <option value="bg-[#F59E0B]">Amber</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden bg-white"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Berakhir">Berakhir</option>
                    <option value="Waiting">Waiting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Rentang Tanggal
                  </label>
                  <input
                    type="text"
                    value={formTanggalRange}
                    onChange={(e) => setFormTanggalRange(e.target.value)}
                    placeholder="11 Agu 2021 - 21 Nov 2021"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Waktu Operasional
                </label>
                <input
                  type="text"
                  value={formWibTime}
                  onChange={(e) => setFormWibTime(e.target.value)}
                  placeholder="00:00 WIB   23.59 WIB"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Label Link
                  </label>
                  <input
                    type="text"
                    value={formLinkText}
                    onChange={(e) => setFormLinkText(e.target.value)}
                    placeholder="Poster - Website"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Disalurkan Kepada
                  </label>
                  <input
                    type="text"
                    value={formDisalurkanText}
                    onChange={(e) => setFormDisalurkanText(e.target.value)}
                    placeholder="Contoh: 200 Anggota Sangha"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-is-pill"
                  checked={formIsPill}
                  onChange={(e) => setFormIsPill(e.target.checked)}
                  className="rounded text-[#008d91] focus:ring-[#008d91] cursor-pointer"
                />
                <label
                  htmlFor="chk-is-pill"
                  className="text-xs text-slate-600 font-medium cursor-pointer"
                >
                  Tampilkan "Disalurkan kepada" sebagai badge pill teal
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008d91] text-white font-medium hover:bg-[#007b7e] transition-colors cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Tanda Terima */}
      {isTandaTerimaModalOpen && targetTandaTerimaItem && (
        <ModalCreateTandaTerimaDonasi
          isOpen={isTandaTerimaModalOpen}
          onClose={() => {
            setIsTandaTerimaModalOpen(false);
            setTargetTandaTerimaItem(null);
            setTargetTandaTerimaChild(null);
          }}
          item={targetTandaTerimaItem}
          childItem={targetTandaTerimaChild}
          templatePMList={activeTemplatePMList}
          onSaveTandaTerima={handleSaveTandaTerima}
          onNavigateToFormTemplatePM={onNavigateToFormTemplatePM}
          onShowToast={onShowToast}
        />
      )}

      {/* Modal: Ubah Logo Sub-Jenis Item D-DONASI */}
      {isChangeLogoModalOpen && editingLogoSubJenis && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs overflow-hidden"
                  style={{ backgroundColor: tempIconBg }}
                >
                  {tempLogoUrl ? (
                    <img
                      src={tempLogoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    renderIconByName(tempIconType, 'w-5 h-5')
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Ubah Logo Sub-Jenis
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingLogoSubJenis.namaSubJenis} ({editingLogoSubJenis.kode || 'D-DONASI'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangeLogoModalOpen(false);
                  setEditingLogoSubJenis(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pilih Ikon Preset */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Pilih Ikon Sesuai Sub-Jenis:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { id: 'book', label: 'Buku', icon: Book },
                  { id: 'book-open', label: 'Buku Terbuka', icon: BookOpen },
                  { id: 'sparkles', label: 'Spesial', icon: Sparkles },
                  { id: 'gift', label: 'Hadiah', icon: Gift },
                  { id: 'boxes', label: 'Boxes', icon: Boxes },
                  { id: 'calendar', label: 'Kalender', icon: Calendar },
                  { id: 'award', label: 'Award', icon: Award },
                  { id: 'heart', label: 'Donasi', icon: Heart },
                  { id: 'tag', label: 'Tag', icon: Tag },
                  { id: 'package-check', label: 'Paket', icon: PackageCheck },
                  { id: 'shopping-cart', label: 'Cart', icon: ShoppingCart },
                  { id: 'globe', label: 'Globe', icon: Globe },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isAct = !tempLogoUrl && tempIconType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTempIconType(item.id);
                        setTempLogoUrl('');
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isAct
                          ? 'border-[#008d91] bg-teal-50 text-[#008d91] ring-2 ring-[#008d91]/20 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Logo Image URL or Upload */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Atau Unggah / URL Logo Gambar:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://contoh.com/logo.png"
                  value={tempLogoUrl}
                  onChange={(e) => setTempLogoUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-[#008d91]"
                />
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setTempLogoUrl(ev.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Warna Latar Logo */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Warna Latar Belakang:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  '#008d91',
                  '#ec4899',
                  '#5e35b1',
                  '#c0392b',
                  '#f39c12',
                  '#0284c7',
                  '#10b981',
                  '#1e293b',
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTempIconBg(color)}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      tempIconBg === color
                        ? 'scale-110 ring-2 ring-offset-2 ring-slate-400'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {tempIconBg === color && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsChangeLogoModalOpen(false);
                  setEditingLogoSubJenis(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveSubJenisLogo(editingLogoSubJenis.id, {
                    iconType: tempIconType,
                    logoUrl: tempLogoUrl || undefined,
                    iconBg: tempIconBg,
                  });
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] shadow-xs shadow-[#008d91]/25 transition-all cursor-pointer"
              >
                Simpan Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
