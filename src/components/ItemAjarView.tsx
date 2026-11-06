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
  Users,
  ChevronLeft,
  ChevronRight,
  Book,
  BookOpen,
  Sparkles,
  Boxes,
  Gift,
  Award,
  Heart,
  Tag,
  Upload,
  Video,
  GraduationCap,
  Layers,
  Package,
} from 'lucide-react';
import {
  ItemAjarEvent,
  ItemAjarChild,
  INITIAL_ITEM_AJAR_EVENTS,
} from '../itemAjarData';
import {
  SubJenisItemAjarItem,
  getSubJenisAjarFromStorage,
  saveSubJenisAjarToStorage,
} from '../subJenisAjarData';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { ModalStrukturKepanitiaanAjar } from './ModalStrukturKepanitiaanAjar';
import { ProjectItem } from '../types';
import { INITIAL_PROJECTS } from '../data';

interface ItemAjarViewProps {
  onShowToast?: (msg: string) => void;
  onAddClick?: () => void;
  identitasList?: IdentitasItem[];
  subJenisList?: SubJenisItemAjarItem[];
  onUpdateSubJenisList?: (items: SubJenisItemAjarItem[]) => void;
  projects?: ProjectItem[];
}

export const ItemAjarView: React.FC<ItemAjarViewProps> = ({
  onShowToast = (_msg: string) => {},
  onAddClick,
  identitasList = INITIAL_IDENTITAS,
  subJenisList,
  onUpdateSubJenisList,
  projects: projectsProp,
}) => {
  // Active Tab: 'variable' | 'paket'
  const [activeTab, setActiveTab] = useState<'variable' | 'paket'>('variable');

  // Effective projects from props or localStorage (Proyek SAPA data)
  const effectiveProjects = useMemo<ProjectItem[]>(() => {
    if (projectsProp && projectsProp.length > 0) return projectsProp;
    try {
      const saved = localStorage.getItem('proyek_sapa_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROJECTS;
  }, [projectsProp]);

  // Helper resolving event status from Proyek SAPA: "Ongoing" | "Coming Soon" | "Selesai"
  const getEffectiveStatusFromProyekSapa = (
    evt: ItemAjarEvent,
    proyekList: ProjectItem[]
  ): 'Ongoing' | 'Coming Soon' | 'Selesai' => {
    if (proyekList && proyekList.length > 0) {
      const sapaKey = (evt.proyekSapa || '').toLowerCase().trim();
      const evtSubtitle = (evt.subtitle || '').toLowerCase().trim();
      const evtName = (evt.name || '').toLowerCase().trim();

      const matched = proyekList.find((p) => {
        const pName = (p.namaKegiatan || '').toLowerCase().trim();
        if (!pName) return false;
        if (sapaKey && (pName === sapaKey || pName.includes(sapaKey) || sapaKey.includes(pName))) return true;
        if (evtSubtitle && (pName === evtSubtitle || pName.includes(evtSubtitle) || evtSubtitle.includes(pName))) return true;
        if (evtName && (pName === evtName || pName.includes(evtName) || evtName.includes(pName))) return true;
        return false;
      });

      if (matched) {
        const st = (matched.status || '').toLowerCase().trim();
        if (st === 'ongoing') return 'Ongoing';
        if (st === 'waiting acc' || st === 'coming soon' || st.includes('waiting')) return 'Coming Soon';
        if (st === 'done' || st === 'selesai' || st.includes('done')) return 'Selesai';
      }
    }

    const fallback = (evt.status || '').toLowerCase().trim();
    if (fallback === 'ongoing') return 'Ongoing';
    if (fallback === 'waiting acc' || fallback === 'coming soon') return 'Coming Soon';
    if (fallback === 'done' || fallback === 'berakhir' || fallback === 'selesai') return 'Selesai';
    return 'Ongoing';
  };

  // Persistence via localStorage with fallback merge
  const [events, setEvents] = useState<ItemAjarEvent[]>(() => {
    const saved = localStorage.getItem('yppln_item_ajar_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map((p: ItemAjarEvent) => {
            const init = INITIAL_ITEM_AJAR_EVENTS.find((i) => i.id === p.id || i.name === p.name);
            if (!init) return p;
            return {
              ...init,
              ...p,
              keteranganVariable: p.keteranganVariable || init.keteranganVariable,
              children: (p.children && p.children.length > 0) ? p.children : init.children,
              variables: (p.variables && p.variables.length > 0) ? p.variables : init.variables,
            };
          });
          const existingIds = new Set(merged.map((p: ItemAjarEvent) => p.id || p.name));
          const missing = INITIAL_ITEM_AJAR_EVENTS.filter(
            (init) => !existingIds.has(init.id) && !existingIds.has(init.name)
          );
          if (missing.length > 0) {
            return [...missing, ...merged];
          }
          return merged;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ITEM_AJAR_EVENTS;
  });

  const saveEvents = (newEvents: ItemAjarEvent[]) => {
    setEvents(newEvents);
    try {
      localStorage.setItem('yppln_item_ajar_events', JSON.stringify(newEvents));
    } catch (e) {
      console.error(e);
    }
  };

  // Sub-Jenis Item A-AJAR state
  const [subJenisItems, setSubJenisItems] = useState<SubJenisItemAjarItem[]>(() => {
    if (subJenisList && subJenisList.length > 0) return subJenisList;
    return getSubJenisAjarFromStorage();
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
  const [editingLogoSubJenis, setEditingLogoSubJenis] = useState<SubJenisItemAjarItem | null>(null);
  const [tempIconType, setTempIconType] = useState<string>('globe');
  const [tempLogoUrl, setTempLogoUrl] = useState<string>('');
  const [tempIconBg, setTempIconBg] = useState<string>('#008d91');
  const [isChangeLogoModalOpen, setIsChangeLogoModalOpen] = useState(false);

  // Helper matching event to sub-jenis
  const eventBelongsToSubJenis = (evt: ItemAjarEvent, sj: SubJenisItemAjarItem): boolean => {
    const sjName = sj.namaSubJenis.toLowerCase().trim();
    if (evt.subJenis && evt.subJenis.toLowerCase().trim() === sjName) return true;
    if (evt.subJenisItem && evt.subJenisItem.toLowerCase().trim() === sjName) return true;
    if (evt.subtitle && evt.subtitle.toLowerCase().includes(sjName)) return true;
    if (evt.name && evt.name.toLowerCase().includes(sjName)) return true;
    if (sj.kode) {
      const codeLower = sj.kode.toLowerCase();
      if (evt.subtitle && evt.subtitle.toLowerCase().includes(codeLower)) return true;
      if (evt.name && evt.name.toLowerCase().includes(codeLower)) return true;
    }
    if (sjName.includes('south east asia') || sj.kode === 'SEALF') {
      if (evt.name?.toLowerCase().includes('south east asia') || evt.name?.toLowerCase().includes('sealf')) return true;
      if (evt.subtitle?.toLowerCase().includes('south east asia') || evt.subtitle?.toLowerCase().includes('sealf')) return true;
    }
    if (sjName.includes('retreat') || sj.kode === 'ILR') {
      if (evt.name?.toLowerCase().includes('retreat') || evt.name?.toLowerCase().includes('ilr')) return true;
      if (evt.subtitle?.toLowerCase().includes('retreat') || evt.subtitle?.toLowerCase().includes('ilr')) return true;
    }
    if (sjName.includes('dharma book') || sj.kode === 'NDBF') {
      if (evt.name?.toLowerCase().includes('dharma book') || evt.name?.toLowerCase().includes('ndbf')) return true;
      if (evt.subtitle?.toLowerCase().includes('dharma book') || evt.subtitle?.toLowerCase().includes('ndbf')) return true;
    }
    if (sjName.includes('lam-talk') || sj.kode === 'LAMTALK') {
      if (evt.name?.toLowerCase().includes('lam-talk') || evt.name?.toLowerCase().includes('talk') || evt.name?.toLowerCase().includes('lamtalk')) return true;
      if (evt.subtitle?.toLowerCase().includes('lam-talk') || evt.subtitle?.toLowerCase().includes('lamtalk')) return true;
    }
    if (sjName.includes('nonton') || sj.kode === 'NOBARBEKU') {
      if (evt.name?.toLowerCase().includes('nonton') || evt.name?.toLowerCase().includes('nobar') || evt.name?.toLowerCase().includes('bedah buku')) return true;
      if (evt.subtitle?.toLowerCase().includes('nonton') || evt.subtitle?.toLowerCase().includes('nobar') || evt.subtitle?.toLowerCase().includes('bedah buku')) return true;
    }
    return false;
  };

  // Real-time calculation of ONGOING items for each sub-jenis based on Proyek SAPA status
  const subJenisWithCounts = useMemo(() => {
    return subJenisItems.map((sj) => {
      const matchingOngoing = events.filter((evt) => {
        const isOngoing = getEffectiveStatusFromProyekSapa(evt, effectiveProjects) === 'Ongoing';
        return isOngoing && eventBelongsToSubJenis(evt, sj);
      });
      return {
        ...sj,
        ongoingCount: matchingOngoing.length,
      };
    });
  }, [subJenisItems, events, effectiveProjects]);

  const handleOpenChangeLogoModal = (sj: SubJenisItemAjarItem) => {
    setEditingLogoSubJenis(sj);
    setTempIconType(sj.iconType || 'globe');
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
    saveSubJenisAjarToStorage(updated);
    if (onUpdateSubJenisList) {
      onUpdateSubJenisList(updated);
    }
    onShowToast(`Logo sub-jenis berhasil diperbarui`);
    setIsChangeLogoModalOpen(false);
    setEditingLogoSubJenis(null);
  };

  const renderIconByName = (iconName: string, className = 'w-4 h-4 stroke-[1.8]') => {
    switch (iconName) {
      case 'globe':
        return <Globe className={className} />;
      case 'book-open':
        return <BookOpen className={className} />;
      case 'book':
        return <Book className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'video':
        return <Video className={className} />;
      case 'users':
        return <Users className={className} />;
      case 'graduation-cap':
        return <GraduationCap className={className} />;
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

  const renderSubJenisIcon = (sj: SubJenisItemAjarItem) => {
    if (sj.logoUrl) {
      return <img src={sj.logoUrl} alt={sj.namaSubJenis} className="w-full h-full object-cover" />;
    }
    if (sj.iconType) {
      return renderIconByName(sj.iconType);
    }
    const name = sj.namaSubJenis.toLowerCase();
    if (name.includes('south east asia') || sj.kode === 'SEALF') return <Globe className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('retreat') || sj.kode === 'ILR') return <Users className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('book festival') || sj.kode === 'NDBF') return <BookOpen className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('lam-talk') || sj.kode === 'LAMTALK') return <Sparkles className="w-4 h-4 stroke-[1.8]" />;
    if (name.includes('nonton') || sj.kode === 'NOBARBEKU') return <Video className="w-4 h-4 stroke-[1.8]" />;
    if (sj.iconLetter) {
      return <span className="font-bold text-xs leading-none">{sj.iconLetter}</span>;
    }
    return <Globe className="w-4 h-4 stroke-[1.8]" />;
  };

  // Expanded event ids for Tab "Variable"
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(
    new Set(['item-ajar-0', 'item-ajar-1'])
  );

  // Expanded event ids for Tab "Paket" (ILR 2018 and ILR 2017 are expanded matching user screenshot)
  const [expandedPaketEventIds, setExpandedPaketEventIds] = useState<Set<string>>(
    new Set(['item-ajar-ilr-2018', 'item-ajar-ilr-2017'])
  );

  // Search & Filter
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Menu popover
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Struktur Kepanitiaan Modal state
  const [isKepanitiaanModalOpen, setIsKepanitiaanModalOpen] = useState(false);
  const [selectedEventForKepanitiaan, setSelectedEventForKepanitiaan] =
    useState<ItemAjarEvent | null>(null);

  // Add / Edit Modal state for Event
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ItemAjarEvent | null>(null);

  // Form states for Add / Edit Event
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

  // Add / Edit Modal state for Paket
  const [isAddPaketModalOpen, setIsAddPaketModalOpen] = useState(false);
  const [editingPaketParentId, setEditingPaketParentId] = useState<string | null>(null);
  const [editingPaketId, setEditingPaketId] = useState<string | null>(null);
  const [paketFormEventId, setPaketFormEventId] = useState<string>('');
  const [paketFormName, setPaketFormName] = useState('');
  const [paketFormDescription, setPaketFormDescription] = useState('Konsumsi dan Akomodasi');
  const [paketFormPrice, setPaketFormPrice] = useState('Rp430.000');
  const [paketFormKeterangan, setPaketFormKeterangan] = useState('');

  // Toggle row expand for Variable tab
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

  // Toggle row expand for Paket tab
  const toggleExpandPaket = (id: string) => {
    setExpandedPaketEventIds((prev) => {
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
    if (activeTab === 'paket') {
      // Open add paket modal
      setEditingPaketParentId(null);
      setEditingPaketId(null);
      setPaketFormEventId(events[0]?.id || '');
      setPaketFormName('');
      setPaketFormDescription('Konsumsi dan Akomodasi');
      setPaketFormPrice('Rp500.000');
      setPaketFormKeterangan('');
      setIsAddPaketModalOpen(true);
      return;
    }

    if (onAddClick) {
      onAddClick();
      return;
    }
    setEditingEvent(null);
    setFormName('');
    setFormSubtitle('');
    setFormBadgeLetter('A');
    setFormBadgeColor('bg-[#008d91]');
    setFormStatus('Ongoing');
    setFormTanggalRange('01 Jan 2022 - 31 Des 2022');
    setFormWibTime('00:00 WIB   23.59 WIB');
    setFormLinkText('Poster - Website');
    setFormDisalurkanText('');
    setFormIsPill(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (evt: ItemAjarEvent) => {
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
    onShowToast(`Item "${name}" berhasil dihapus`);
    setActiveMenuId(null);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama item wajib diisi');
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
              subtitle: formSubtitle.trim() || 'Program Pengajaran A-AJAR',
              badgeLetter,
              badgeColor: formBadgeColor,
              status: formStatus,
              tanggalRange: formTanggalRange.trim() || '01 Jan 2022 - 31 Des 2022',
              wibTime: formWibTime.trim() || '00:00 WIB   23.59 WIB',
              linkText: formLinkText.trim() || 'Poster - Website',
              disalurkanKepadaText: formDisalurkanText.trim(),
              isDisalurkanPill: formIsPill,
            }
          : ev
      );
      saveEvents(updated);
      onShowToast(`Item "${formName}" berhasil diperbarui`);
    } else {
      const newEvt: ItemAjarEvent = {
        id: `item-ajar-${Date.now()}`,
        badgeLetter,
        badgeColor: formBadgeColor,
        name: formName.trim(),
        subtitle: formSubtitle.trim() || 'Program Pengajaran A-AJAR',
        status: formStatus,
        tanggalRange: formTanggalRange.trim() || '01 Jan 2022 - 31 Des 2022',
        wibTime: formWibTime.trim() || '00:00 WIB   23.59 WIB',
        linkText: formLinkText.trim() || 'Poster - Website',
        disalurkanKepadaText: formDisalurkanText.trim(),
        isDisalurkanPill: formIsPill,
        children: [],
      };
      saveEvents([newEvt, ...events]);
      onShowToast(`Item "${formName}" berhasil ditambahkan`);
    }

    setIsAddModalOpen(false);
  };

  // Add / Edit Variable modal for Variable tab
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [selectedParentForChild, setSelectedParentForChild] = useState<string | null>(null);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState('');
  const [childPrice, setChildPrice] = useState('Gratis');
  const [childDescription, setChildDescription] = useState('');
  const [childBadgeLetter, setChildBadgeLetter] = useState('V');
  const [childKeteranganVariable, setChildKeteranganVariable] = useState('');

  const handleOpenAddChild = (parentId: string) => {
    setSelectedParentForChild(parentId);
    setEditingChildId(null);
    setChildName('');
    setChildPrice('Gratis');
    setChildDescription('');
    setChildBadgeLetter('V');
    setChildKeteranganVariable('');
    setIsAddChildModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenEditChild = (parentId: string, child: ItemAjarChild) => {
    setSelectedParentForChild(parentId);
    setEditingChildId(child.id);
    setChildName(child.name);
    setChildPrice(child.price);
    setChildDescription(child.description);
    setChildBadgeLetter(child.badgeLetter || 'V');
    setChildKeteranganVariable(child.keteranganVariable || '');
    setIsAddChildModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentForChild || !childName.trim()) return;

    if (editingChildId) {
      // Editing existing child variable
      const updated = events.map((ev) => {
        if (ev.id === selectedParentForChild) {
          const newChildren = (ev.children || []).map((c) =>
            c.id === editingChildId
              ? {
                  ...c,
                  name: childName.trim(),
                  price: childPrice.trim() || 'Gratis',
                  description: childDescription.trim() || '-',
                  badgeLetter: childBadgeLetter.trim().toUpperCase() || 'V',
                  keteranganVariable: childKeteranganVariable.trim() || '-',
                }
              : c
          );
          return { ...ev, children: newChildren };
        }
        return ev;
      });
      saveEvents(updated);
      onShowToast(`Variable "${childName}" berhasil diperbarui`);
    } else {
      // Adding new child variable
      const newChild: ItemAjarChild = {
        id: `child-var-${Date.now()}`,
        badgeLetter: childBadgeLetter.trim().toUpperCase() || 'V',
        badgeColor: 'bg-[#263544]',
        name: childName.trim(),
        price: childPrice.trim() || 'Gratis',
        description: childDescription.trim() || '-',
        tanggal: '-',
        keteranganVariable: childKeteranganVariable.trim() || '-',
      };

      const updated = events.map((ev) => {
        if (ev.id === selectedParentForChild) {
          return {
            ...ev,
            children: [...(ev.children || []), newChild],
          };
        }
        return ev;
      });

      saveEvents(updated);
      setExpandedEventIds((prev) => new Set([...prev, selectedParentForChild]));
      onShowToast(`Variable "${childName}" berhasil ditambahkan`);
    }

    setIsAddChildModalOpen(false);
  };

  const handleDeleteChild = (parentId: string, childId: string, childNameText: string) => {
    const updated = events.map((ev) => {
      if (ev.id === parentId) {
        return {
          ...ev,
          children: (ev.children || []).filter((c) => c.id !== childId),
        };
      }
      return ev;
    });
    saveEvents(updated);
    onShowToast(`Variable "${childNameText}" dihapus`);
  };

  // Add / Edit Paket handlers
  const handleOpenAddPaketForEvent = (parentId: string) => {
    setEditingPaketParentId(parentId);
    setEditingPaketId(null);
    setPaketFormEventId(parentId);
    setPaketFormName('');
    setPaketFormDescription('Konsumsi dan Akomodasi');
    setPaketFormPrice('Rp500.000');
    setPaketFormKeterangan('');
    setIsAddPaketModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenEditPaket = (parentId: string, paket: ItemAjarChild) => {
    setEditingPaketParentId(parentId);
    setEditingPaketId(paket.id);
    setPaketFormEventId(parentId);
    setPaketFormName(paket.name);
    setPaketFormDescription(paket.description);
    setPaketFormPrice(paket.price);
    setPaketFormKeterangan(paket.keteranganPaket || '');
    setIsAddPaketModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeletePaket = (parentId: string, paketId: string, paketName: string) => {
    const updated = events.map((ev) => {
      if (ev.id === parentId) {
        return {
          ...ev,
          children: (ev.children || []).filter((c) => c.id !== paketId),
        };
      }
      return ev;
    });
    saveEvents(updated);
    onShowToast(`Paket "${paketName}" berhasil dihapus`);
    setActiveMenuId(null);
  };

  const handleSavePaketModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paketFormEventId || !paketFormName.trim()) {
      alert('Nama Paket dan Event wajib dipilih');
      return;
    }

    if (editingPaketParentId && editingPaketId) {
      // Edit existing paket
      const updated = events.map((ev) => {
        if (ev.id === editingPaketParentId) {
          const newChildren = (ev.children || []).map((c) =>
            c.id === editingPaketId
              ? {
                  ...c,
                  name: paketFormName.trim(),
                  description: paketFormDescription.trim() || 'Konsumsi dan Akomodasi',
                  price: paketFormPrice.trim() || 'Rp0',
                  keteranganPaket: paketFormKeterangan.trim() || '-',
                }
              : c
          );
          return { ...ev, children: newChildren };
        }
        return ev;
      });
      saveEvents(updated);
      onShowToast(`Paket "${paketFormName}" berhasil diperbarui`);
    } else {
      // Add new paket
      const newPaket: ItemAjarChild = {
        id: `child-paket-${Date.now()}`,
        badgeLetter: 'P',
        badgeColor: 'bg-[#263544]',
        name: paketFormName.trim(),
        description: paketFormDescription.trim() || 'Konsumsi dan Akomodasi',
        price: paketFormPrice.trim() || 'Rp0',
        tanggal: '-',
        keteranganPaket: paketFormKeterangan.trim() || '-',
      };

      const updated = events.map((ev) => {
        if (ev.id === paketFormEventId) {
          return {
            ...ev,
            children: [...(ev.children || []), newPaket],
          };
        }
        return ev;
      });
      saveEvents(updated);
      setExpandedPaketEventIds((prev) => new Set([...prev, paketFormEventId]));
      onShowToast(`Paket "${paketFormName}" berhasil ditambahkan`);
    }

    setIsAddPaketModalOpen(false);
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        evt.name.toLowerCase().includes(q) ||
        evt.subtitle.toLowerCase().includes(q) ||
        (evt.keteranganVariable && evt.keteranganVariable.toLowerCase().includes(q)) ||
        (evt.children &&
          evt.children.some(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q) ||
              (c.keteranganPaket && c.keteranganPaket.toLowerCase().includes(q)) ||
              (c.keteranganVariable && c.keteranganVariable.toLowerCase().includes(q))
          ));

      const effectiveStatus = getEffectiveStatusFromProyekSapa(evt, effectiveProjects);
      const matchStatus =
        filterStatus === 'all' ||
        effectiveStatus.toLowerCase() === filterStatus.toLowerCase() ||
        (filterStatus === 'berakhir' && (effectiveStatus.toLowerCase() === 'selesai' || effectiveStatus.toLowerCase() === 'berakhir')) ||
        (filterStatus === 'selesai' && (effectiveStatus.toLowerCase() === 'selesai' || effectiveStatus.toLowerCase() === 'berakhir'));

      const matchSubJenis =
        !selectedSubJenisFilter ||
        (() => {
          const foundSj = subJenisItems.find((s) => s.namaSubJenis === selectedSubJenisFilter);
          return foundSj ? eventBelongsToSubJenis(evt, foundSj) : true;
        })();

      return matchSearch && matchStatus && matchSubJenis;
    });
  }, [events, searchQuery, filterStatus, selectedSubJenisFilter, subJenisItems, effectiveProjects]);

  return (
    <div className="w-full pb-16 animate-in fade-in duration-200">
      {/* Top Action Toolbar with Two Tabs: Variable and Paket */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Two Tabs: Variable and Paket */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-item-ajar-variable"
            onClick={() => {
              setActiveTab('variable');
              onShowToast('Beralih ke tab Variable');
            }}
            className={`px-6 sm:px-7 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              activeTab === 'variable'
                ? 'bg-[#008d91] text-white'
                : 'bg-[#9ca3af] text-white hover:bg-slate-400'
            }`}
          >
            Variable
          </button>
          <button
            type="button"
            id="tab-item-ajar-paket"
            onClick={() => {
              setActiveTab('paket');
              onShowToast('Beralih ke tab Paket');
            }}
            className={`px-6 sm:px-7 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              activeTab === 'paket'
                ? 'bg-[#008d91] text-white'
                : 'bg-[#9ca3af] text-white hover:bg-slate-400'
            }`}
          >
            Paket
          </button>
        </div>

        {/* Right side controls: Toggle Eye, Search, Filter, + Add Button */}
        <div className="flex items-center justify-end gap-2">
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
                  placeholder="Cari event, variable, atau paket..."
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

          {/* Sliders / Filter button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              title="Filter Status"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                    filterStatus === 'all'
                      ? 'font-bold text-[#008d91] bg-teal-50'
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
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                    filterStatus === 'ongoing'
                      ? 'font-bold text-[#008d91] bg-teal-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Ongoing</span>
                  {filterStatus === 'ongoing' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('coming soon');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                    filterStatus === 'coming soon'
                      ? 'font-bold text-[#008d91] bg-teal-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Coming Soon</span>
                  {filterStatus === 'coming soon' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('selesai');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${
                    filterStatus === 'selesai' || filterStatus === 'berakhir'
                      ? 'font-bold text-[#008d91] bg-teal-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Selesai</span>
                  {(filterStatus === 'selesai' || filterStatus === 'berakhir') && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* + Add Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#008d91] hover:bg-[#00797d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'paket' ? 'Tambah Paket' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Stats Cards with Carousel Nav displaying all Sub-Jenis A-AJAR with real-time ongoing counts (shown on both Variable and Paket tabs) */}
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
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth flex-1 min-w-0"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {subJenisWithCounts.map((sj) => {
            const isSelected = selectedSubJenisFilter === sj.namaSubJenis;
            return (
              <div
                key={sj.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedSubJenisFilter(null);
                    onShowToast('Filter sub-jenis dinonaktifkan (tampilkan semua)');
                  } else {
                    setSelectedSubJenisFilter(sj.namaSubJenis);
                    onShowToast(`Filter sub-jenis: ${sj.namaSubJenis}`);
                  }
                }}
                style={{ scrollSnapAlign: 'start' }}
                className={`min-w-[210px] sm:min-w-[230px] p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-3 shrink-0 ${
                  isSelected
                    ? 'border-[#008d91] bg-teal-50/70 shadow-sm ring-2 ring-[#008d91]/20'
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-2xs'
                }`}
              >
                {/* Icon container with click-to-edit logo feature */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChangeLogoModal(sj);
                  }}
                  title="Klik untuk ubah logo sub-jenis ini"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 overflow-hidden relative group cursor-pointer shadow-xs transition-transform hover:scale-105"
                  style={{ backgroundColor: sj.iconBg || '#008d91' }}
                >
                  {renderSubJenisIcon(sj)}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Text container */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate leading-tight">
                    {sj.namaSubJenis}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-base sm:text-lg font-bold text-slate-800 leading-none">
                      {sj.ongoingCount}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                      Ongoing
                    </span>
                  </div>
                </div>
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

      {/* ======================================================== */}
      {/* TAB 1: VARIABLE (Matching exact table design of uploaded image) */}
      {/* ======================================================== */}
      {activeTab === 'variable' && (
        <div className="animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-xs border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[38%]">
                      Nama Item & Variable
                    </th>
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[24%]">
                      Tanggal
                    </th>
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[24%]">
                      Keterangan Variable
                    </th>
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[10%]">
                      Link
                    </th>
                    <th className="pb-4 pt-1 w-[4%] text-right">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((evt) => {
                    const isExpanded = expandedEventIds.has(evt.id);
                    const effectiveStatus = getEffectiveStatusFromProyekSapa(evt, effectiveProjects);

                    // Filter variables for this event (non-paket children or generated from evt.variables)
                    const variableChildren = (evt.children || []).filter(
                      (c) =>
                        c.badgeLetter !== 'P' &&
                        !c.name.toLowerCase().startsWith('paket ') &&
                        !c.id.includes('child-paket') &&
                        !c.id.includes('child-ilr18-1') &&
                        !c.id.includes('child-ilr18-2') &&
                        !c.id.includes('child-ilr18-3') &&
                        !c.id.includes('child-ilr18-4') &&
                        !c.id.includes('child-ilr17-1') &&
                        !c.id.includes('child-ilr17-2') &&
                        !c.id.includes('child-ilr17-3') &&
                        !c.id.includes('child-ilr17-4')
                    );

                    // Fallback to evt.variables if no explicit variable children exist
                    const displayVars =
                      variableChildren.length > 0
                        ? variableChildren
                        : (evt.variables || []).map((vName, idx) => ({
                            id: `var-fallback-${evt.id}-${idx}`,
                            badgeLetter: 'V',
                            badgeColor: 'bg-[#263544]',
                            name: vName,
                            price: 'Gratis',
                            description: 'Materi Pengajaran & Kurikulum A-AJAR',
                            tanggal: '-',
                            keteranganVariable: '-',
                          }));

                    const hasVariables = displayVars.length > 0;

                    return (
                      <React.Fragment key={evt.id}>
                        {/* Parent Event Row */}
                        <tr className="hover:bg-slate-50/60 transition-colors group">
                          {/* Col 1: Nama Item & Variable */}
                          <td className="py-5 pr-4 align-top">
                            <div className="flex items-start gap-3.5">
                              {/* Triangle/Play Expand toggle button */}
                              <button
                                type="button"
                                onClick={() => toggleExpand(evt.id)}
                                title={isExpanded ? 'Tutup Variable' : 'Buka Variable'}
                                className="mt-4 text-[#008d91] hover:text-[#007073] transition-transform duration-200 cursor-pointer p-0.5 shrink-0"
                              >
                                <Play
                                  className={`w-3.5 h-3.5 fill-[#008d91] text-[#008d91] transition-transform duration-200 ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>

                              {/* Event Badge Letter (Large rounded square box like image) */}
                              <div
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${
                                  evt.badgeColor ||
                                  (evt.badgeLetter === 'S' ? 'bg-[#64748b]' : 'bg-[#0284c7]')
                                } flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shrink-0 shadow-xs`}
                              >
                                {evt.badgeLetter}
                              </div>

                              {/* Title, Subtitle, Status */}
                              <div className="flex flex-col min-w-0 pt-0.5">
                                <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                  {evt.name}
                                </span>
                                <span className="text-xs text-slate-500 font-normal mt-0.5">
                                  {evt.subtitle}
                                </span>
                                <span
                                  className={`text-xs mt-0.5 font-medium ${
                                    effectiveStatus === 'Ongoing'
                                      ? 'text-[#008d91]'
                                      : effectiveStatus === 'Coming Soon'
                                      ? 'text-amber-500'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {effectiveStatus}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Tanggal */}
                          <td className="py-5 pr-4 align-top">
                            <div className="flex flex-col gap-1 items-start pt-1">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {evt.tanggalRange}
                              </span>
                              <div className="flex items-center gap-6 text-[11px] text-slate-500 font-normal">
                                <span>00:00 WIB</span>
                                <span>23.59 WIB</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 3: Keterangan Variable */}
                          <td className="py-5 pr-4 align-top pt-5">
                            <span className="text-slate-500 text-sm font-normal">
                              {evt.keteranganVariable ||
                                evt.description ||
                                (evt.variables && evt.variables.length > 0
                                  ? evt.variables.join(', ')
                                  : '-')}
                            </span>
                          </td>

                          {/* Col 4: Link */}
                          <td className="py-5 pr-2 align-top">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-[11px] text-slate-500 font-normal">
                                Link
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onShowToast(`Membuka poster & website ${evt.name}`)
                                }
                                className="px-3.5 py-1 text-xs font-medium rounded-full bg-[#008d91] hover:bg-[#00797d] text-white transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                              >
                                {evt.linkText || 'Poster - Website'}
                              </button>
                            </div>
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-5 pl-2 text-right align-top pt-5 relative">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(
                                    activeMenuId === `var-evt-${evt.id}`
                                      ? null
                                      : `var-evt-${evt.id}`
                                  )
                                }
                                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4 stroke-[2]" />
                              </button>

                              {activeMenuId === `var-evt-${evt.id}` && (
                                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setSelectedEventForKepanitiaan(evt);
                                      setIsKepanitiaanModalOpen(true);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <Users className="w-4 h-4 text-[#008d91] shrink-0" />
                                    <span>Struktur Kepanitiaan A-AJAK Item A-AJAR</span>
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddChild(evt.id)}
                                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                                    <span>Tambah Variable ke Item Ini</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(evt)}
                                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>Edit Item</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEvent(evt.id, evt.name)}
                                    className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>Hapus Item</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Child Rows (Variables) when parent is expanded */}
                        {isExpanded && (
                          <>
                            {hasVariables ? (
                              displayVars.map((v) => (
                                <tr
                                  key={v.id}
                                  className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                                >
                                  {/* Col 1: Indented Variable */}
                                  <td className="py-4 pr-4 pl-8 sm:pl-12 align-top">
                                    <div className="flex items-start gap-3.5">
                                      {/* Dark Navy Square 'V' Icon */}
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#263544] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs">
                                        {v.badgeLetter || 'V'}
                                      </div>

                                      {/* Title, Subtitle, Price */}
                                      <div className="flex flex-col min-w-0 pt-0.5">
                                        <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                          {v.name}
                                        </span>
                                        <span className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
                                          {v.description}
                                        </span>
                                        <span className="text-xs sm:text-sm font-normal text-slate-900 mt-0.5">
                                          {v.price}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Col 2: Tanggal */}
                                  <td className="py-4 pr-4 align-top pt-5">
                                    <span className="text-slate-500 text-sm font-normal">
                                      {v.tanggal || '-'}
                                    </span>
                                  </td>

                                  {/* Col 3: Keterangan Variable */}
                                  <td className="py-4 pr-4 align-top pt-4">
                                    {v.keteranganVariable && v.keteranganVariable !== '-' ? (
                                      <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug max-w-md block">
                                        {v.keteranganVariable}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-sm font-normal">
                                        -
                                      </span>
                                    )}
                                  </td>

                                  {/* Col 4: Link (empty for child row) */}
                                  <td className="py-4 pr-2 align-top">
                                    &nbsp;
                                  </td>

                                  {/* Col 5: Actions */}
                                  <td className="py-4 pl-2 text-right align-top pt-5 relative">
                                    <div className="relative inline-block text-left">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveMenuId(
                                            activeMenuId === `var-${v.id}`
                                              ? null
                                              : `var-${v.id}`
                                          )
                                        }
                                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                                      >
                                        <MoreVertical className="w-4 h-4 stroke-[2]" />
                                      </button>

                                      {activeMenuId === `var-${v.id}` && (
                                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleOpenEditChild(evt.id, v)
                                            }
                                            className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Edit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span>Edit Variable</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteChild(
                                                evt.id,
                                                v.id,
                                                v.name
                                              )
                                            }
                                            className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            <span>Hapus</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr className="bg-slate-50/30">
                                <td
                                  colSpan={5}
                                  className="py-6 pl-12 text-slate-400 text-xs italic"
                                >
                                  Belum ada variable yang terdaftar untuk item ini.
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PAKET (Exact replica of user's uploaded screenshot) */}
      {/* ======================================================== */}
      {activeTab === 'paket' && (
        <div className="animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-xs border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[38%]">
                      Nama Item & Paket
                    </th>
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[24%]">
                      Tanggal
                    </th>
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[24%]">
                      Keterangan Paket
                    </th>
                    <th className="pb-4 pt-1 font-semibold text-xs sm:text-sm text-slate-800 w-[10%]">
                      Link
                    </th>
                    <th className="pb-4 pt-1 w-[4%] text-right">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((evt) => {
                    const isExpanded = expandedPaketEventIds.has(evt.id);
                    const effectiveStatus = getEffectiveStatusFromProyekSapa(evt, effectiveProjects);
                    // Filter pakets for this event
                    const pakets = (evt.children || []).filter(
                      (c) =>
                        c.badgeLetter === 'P' ||
                        c.name.toLowerCase().includes('paket') ||
                        c.id.includes('paket') ||
                        c.id.includes('ilr')
                    );
                    const hasPakets = pakets.length > 0;

                    return (
                      <React.Fragment key={evt.id}>
                        {/* Parent Event Row */}
                        <tr className="hover:bg-slate-50/60 transition-colors group">
                          {/* Col 1: Nama Item & Paket */}
                          <td className="py-5 pr-4 align-top">
                            <div className="flex items-start gap-3.5">
                              {/* Triangle/Play Expand toggle button */}
                              <button
                                type="button"
                                onClick={() => toggleExpandPaket(evt.id)}
                                title={isExpanded ? 'Tutup Paket' : 'Buka Paket'}
                                className="mt-4 text-[#008d91] hover:text-[#007073] transition-transform duration-200 cursor-pointer p-0.5 shrink-0"
                              >
                                <Play
                                  className={`w-3.5 h-3.5 fill-[#008d91] text-[#008d91] transition-transform duration-200 ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>

                              {/* Event Badge Letter (Large rounded square box like image) */}
                              <div
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${
                                  evt.badgeColor ||
                                  (evt.badgeLetter === 'S' ? 'bg-[#64748b]' : 'bg-[#0284c7]')
                                } flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shrink-0 shadow-xs`}
                              >
                                {evt.badgeLetter}
                              </div>

                              {/* Title, Subtitle, Status */}
                              <div className="flex flex-col min-w-0 pt-0.5">
                                <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                  {evt.name}
                                </span>
                                <span className="text-xs text-slate-500 font-normal mt-0.5">
                                  {evt.subtitle}
                                </span>
                                <span
                                  className={`text-xs mt-0.5 font-medium ${
                                    effectiveStatus === 'Ongoing'
                                      ? 'text-[#008d91]'
                                      : effectiveStatus === 'Coming Soon'
                                      ? 'text-amber-500'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {effectiveStatus}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Tanggal */}
                          <td className="py-5 pr-4 align-top">
                            <div className="flex flex-col gap-1 items-start pt-1">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {evt.tanggalRange}
                              </span>
                              <div className="flex items-center gap-6 text-[11px] text-slate-500 font-normal">
                                <span>00:00 WIB</span>
                                <span>23.59 WIB</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 3: Keterangan Paket */}
                          <td className="py-5 pr-4 align-top pt-5">
                            <span className="text-slate-500 text-sm font-normal">
                              {evt.keteranganPaket || '-'}
                            </span>
                          </td>

                          {/* Col 4: Link */}
                          <td className="py-5 pr-2 align-top">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-[11px] text-slate-500 font-normal">
                                Link
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onShowToast(`Membuka poster & website ${evt.name}`)
                                }
                                className="px-3.5 py-1 text-xs font-medium rounded-full bg-[#008d91] hover:bg-[#00797d] text-white transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                              >
                                {evt.linkText || 'Poster - Website'}
                              </button>
                            </div>
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-5 pl-2 text-right align-top pt-5 relative">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(
                                    activeMenuId === `paket-evt-${evt.id}`
                                      ? null
                                      : `paket-evt-${evt.id}`
                                  )
                                }
                                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4 stroke-[2]" />
                              </button>

                              {activeMenuId === `paket-evt-${evt.id}` && (
                                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddPaketForEvent(evt.id)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-[#008d91] shrink-0" />
                                    <span>Tambah Paket ke Item Ini</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setSelectedEventForKepanitiaan(evt);
                                      setIsKepanitiaanModalOpen(true);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                                    <span>Struktur Kepanitiaan</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(evt)}
                                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>Edit Item</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Child Rows (Pakets) when parent is expanded */}
                        {isExpanded && (
                          <>
                            {hasPakets ? (
                              pakets.map((pkt) => (
                                <tr
                                  key={pkt.id}
                                  className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                                >
                                  {/* Col 1: Indented Paket */}
                                  <td className="py-4 pr-4 pl-8 sm:pl-12 align-top">
                                    <div className="flex items-start gap-3.5">
                                      {/* Dark Navy Square 'P' Icon */}
                                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#263544] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-xs">
                                        {pkt.badgeLetter || 'P'}
                                      </div>

                                      {/* Title, Subtitle, Price */}
                                      <div className="flex flex-col min-w-0 pt-0.5">
                                        <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                          {pkt.name}
                                        </span>
                                        <span className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
                                          {pkt.description}
                                        </span>
                                        <span className="text-xs sm:text-sm font-normal text-slate-900 mt-0.5">
                                          {pkt.price}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Col 2: Tanggal */}
                                  <td className="py-4 pr-4 align-top pt-5">
                                    <span className="text-slate-500 text-sm font-normal">
                                      {pkt.tanggal || '-'}
                                    </span>
                                  </td>

                                  {/* Col 3: Keterangan Paket */}
                                  <td className="py-4 pr-4 align-top pt-4">
                                    {pkt.keteranganPaket && pkt.keteranganPaket !== '-' ? (
                                      <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug max-w-md block">
                                        {pkt.keteranganPaket}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-sm font-normal">
                                        -
                                      </span>
                                    )}
                                  </td>

                                  {/* Col 4: Link (empty for paket row) */}
                                  <td className="py-4 pr-2 align-top">
                                    &nbsp;
                                  </td>

                                  {/* Col 5: Actions */}
                                  <td className="py-4 pl-2 text-right align-top pt-5 relative">
                                    <div className="relative inline-block text-left">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveMenuId(
                                            activeMenuId === `pkt-${pkt.id}`
                                              ? null
                                              : `pkt-${pkt.id}`
                                          )
                                        }
                                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                                      >
                                        <MoreVertical className="w-4 h-4 stroke-[2]" />
                                      </button>

                                      {activeMenuId === `pkt-${pkt.id}` && (
                                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleOpenEditPaket(evt.id, pkt)
                                            }
                                            className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Edit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span>Edit Paket</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeletePaket(
                                                evt.id,
                                                pkt.id,
                                                pkt.name
                                              )
                                            }
                                            className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                            <span>Hapus Paket</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="py-4 pl-12 text-xs text-slate-400 italic"
                                >
                                  Belum ada Paket untuk item ini
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Tambah / Edit Paket A-AJAR */}
      {/* ======================================================== */}
      {isAddPaketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {editingPaketId ? 'Edit Paket A-AJAR' : 'Tambah Paket A-AJAR'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddPaketModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaketModal} className="mt-4 space-y-4">
              {/* Event selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item A-AJAR (Event)
                </label>
                <select
                  value={paketFormEventId}
                  onChange={(e) => setPaketFormEventId(e.target.value)}
                  disabled={Boolean(editingPaketParentId)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] bg-white disabled:bg-slate-50"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Paket */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Paket
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paket Reguler Newbie"
                  value={paketFormName}
                  onChange={(e) => setPaketFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Deskripsi / Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Fasilitas
                </label>
                <input
                  type="text"
                  placeholder="e.g. Konsumsi & Penginapan sederhana"
                  value={paketFormDescription}
                  onChange={(e) => setPaketFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Harga */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rp850.000"
                  value={paketFormPrice}
                  onChange={(e) => setPaketFormPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Keterangan Paket */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Paket
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Khususkan untuk peserta yang tidak pernah mengikuti acara ILR"
                  value={paketFormKeterangan}
                  onChange={(e) => setPaketFormKeterangan(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPaketModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#008d91] hover:bg-[#00797d] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Tambah / Edit Event Item A-AJAR */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {editingEvent ? 'Edit Item A-AJAR' : 'Tambah Item A-AJAR'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Item A-AJAR
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indonesia Lamrim Retreat 2022"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-Judul / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  placeholder="e.g. Program Retreat Pengajaran A-AJAR"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Huruf Icon / Badge
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="e.g. I, S, P"
                    value={formBadgeLetter}
                    onChange={(e) => setFormBadgeLetter(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] bg-white"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Berakhir">Berakhir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rentang Tanggal
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 Nov 2021 - 20 Nov 2021"
                  value={formTanggalRange}
                  onChange={(e) => setFormTanggalRange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Waktu WIB
                </label>
                <input
                  type="text"
                  placeholder="00:00 WIB   23.59 WIB"
                  value={formWibTime}
                  onChange={(e) => setFormWibTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Link / Poster
                </label>
                <input
                  type="text"
                  placeholder="e.g. Poster - Website"
                  value={formLinkText}
                  onChange={(e) => setFormLinkText(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disalurkan Kepada
                </label>
                <input
                  type="text"
                  placeholder="e.g. 250 Peserta Retreat"
                  value={formDisalurkanText}
                  onChange={(e) => setFormDisalurkanText(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#008d91] hover:bg-[#00797d] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Tambah / Edit Variable (Variable Tab) */}
      {/* ======================================================== */}
      {isAddChildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {editingChildId ? 'Edit Variable' : 'Tambah Variable'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddChildModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChild} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Variable
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sesi 1: Pengantar Meditasi"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Materi PDF & Rekaman Audio"
                  value={childDescription}
                  onChange={(e) => setChildDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Variable
                </label>
                <input
                  type="text"
                  placeholder="e.g. Akses online via Zoom & rekaman audio"
                  value={childKeteranganVariable}
                  onChange={(e) => setChildKeteranganVariable(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga / Nominal
                  </label>
                  <input
                    type="text"
                    placeholder="Gratis / Rp500.000"
                    value={childPrice}
                    onChange={(e) => setChildPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge Letter
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={childBadgeLetter}
                    onChange={(e) => setChildBadgeLetter(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91] uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddChildModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#008d91] hover:bg-[#00797d] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingChildId ? 'Simpan Perubahan' : 'Simpan Variable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Struktur Kepanitiaan A-AJAK Item A-AJAR */}
      {/* ======================================================== */}
      <ModalStrukturKepanitiaanAjar
        isOpen={isKepanitiaanModalOpen}
        onClose={() => {
          setIsKepanitiaanModalOpen(false);
          setSelectedEventForKepanitiaan(null);
        }}
        eventItem={selectedEventForKepanitiaan}
        identitasList={identitasList}
        onShowToast={onShowToast}
      />

      {/* ======================================================== */}
      {/* MODAL: Ubah Logo / Icon Sub-Jenis Item A-AJAR */}
      {/* ======================================================== */}
      {isChangeLogoModalOpen && editingLogoSubJenis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Ubah Logo Sub-Jenis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingLogoSubJenis.namaSubJenis}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeLogoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Preset Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    'globe',
                    'book-open',
                    'book',
                    'sparkles',
                    'video',
                    'users',
                    'graduation-cap',
                    'calendar',
                    'award',
                    'heart',
                    'tag',
                    'shopping-cart',
                  ].map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => {
                        setTempIconType(ico);
                        setTempLogoUrl('');
                      }}
                      className={`h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        tempIconType === ico && !tempLogoUrl
                          ? 'border-[#008d91] bg-teal-50 text-[#008d91] ring-2 ring-[#008d91]/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {renderIconByName(ico)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atau URL Gambar / Logo Kustom
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={tempLogoUrl}
                  onChange={(e) => setTempLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Warna Latar Icon
                </label>
                <div className="flex items-center gap-2">
                  {[
                    '#008d91',
                    '#0284c7',
                    '#7c3aed',
                    '#dc2626',
                    '#f39c12',
                    '#059669',
                    '#263544',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTempIconBg(color)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        tempIconBg === color ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangeLogoModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSubJenisLogo(editingLogoSubJenis.id, {
                      iconType: tempIconType,
                      logoUrl: tempLogoUrl,
                      iconBg: tempIconBg,
                    })
                  }
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#00797d] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Terapkan Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
