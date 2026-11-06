import React, { useState, useMemo, useEffect } from 'react';
import {
  Kanban,
  ListFilter,
  Search,
  Plus,
  MoveRight,
  MoveLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  Layers,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  CheckSquare,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  BookmarkCheck,
  PackageCheck,
  Send,
  MoreVertical,
  FileEdit,
  AlertTriangle,
  Eye,
  Check,
  RotateCcw,
  UserPlus,
  Users,
  GitFork,
  Flag,
  CalendarDays,
} from 'lucide-react';
import {
  OngoingItemSalurCard,
  OngoingStage,
  OngoingPekerjaanAjak,
  OngoingChecklistItem,
  OngoingKendala,
  KANBAN_COLUMNS,
  getOngoingItemSalurFromStorage,
  saveOngoingItemSalurToStorage,
} from '../ongoingItemSalurData';
import { ProjectItem, TodoTaskItem, KaryawanItem } from '../types';
import { PapanTrelloView } from './PapanTrelloView';

interface OngoingCreateItemSalurViewProps {
  projectsList?: ProjectItem[];
  projectTodos?: Record<string, TodoTaskItem[]>;
  selectedDivisi?: string;
  onSelectDivisi?: (divisi: string) => void;
  divisiOptions?: string[];
  onOpenFormTodoList?: (project?: ProjectItem) => void;
  onNavigateToKegiatan?: () => void;
  onNavigateToTimeline?: () => void;
  timelineTasks?: any[];
  onShowToast?: (msg: string) => void;
  onNavigateToItemSalur?: () => void;
  forcedTab?: 'kanban' | 'list' | 'tracker';
  onTabChange?: (tab: 'kanban' | 'list' | 'tracker') => void;
  onUpdateTasks?: (projectId: string, tasks: TodoTaskItem[]) => void;
  karyawanList?: KaryawanItem[];
}

export const OngoingCreateItemSalurView: React.FC<OngoingCreateItemSalurViewProps> = ({
  projectsList = [],
  projectTodos = {},
  selectedDivisi = 'PNB',
  onSelectDivisi,
  divisiOptions,
  onOpenFormTodoList,
  onNavigateToKegiatan,
  onNavigateToTimeline,
  timelineTasks,
  onShowToast = (_msg: string) => {},
  onNavigateToItemSalur,
  forcedTab,
  onTabChange,
  onUpdateTasks,
  karyawanList,
}) => {
  // Load stored cards
  const [cards, setCards] = useState<OngoingItemSalurCard[]>(() => {
    return getOngoingItemSalurFromStorage();
  });

  // Current active Divisi filter state, synced with props
  const [currentDivisi, setCurrentDivisi] = useState<string>(selectedDivisi || 'PNB');

  useEffect(() => {
    if (selectedDivisi) {
      setCurrentDivisi(selectedDivisi);
    }
  }, [selectedDivisi]);

  const handleDivisiChange = (div: string) => {
    setCurrentDivisi(div);
    if (onSelectDivisi) {
      onSelectDivisi(div);
    }
  };

  // Available Divisi options
  const availableDivisiList = useMemo(() => {
    if (divisiOptions && divisiOptions.length > 0) return divisiOptions;
    return ['ALL', 'PNB', 'MAD', 'EVE', 'FUN', 'IT', 'OPERASIONAL', 'UMM', 'PRO', 'MED', 'OPS'];
  }, [divisiOptions]);

  // Active view: 'kanban' | 'list' | 'tracker'
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'tracker'>(() => {
    return forcedTab || 'kanban';
  });

  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
    }
  }, [forcedTab]);

  const handleTabClick = (tab: 'kanban' | 'list' | 'tracker') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Filters
  const [selectedProyekFilter, setSelectedProyekFilter] = useState<string>('ALL');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCardForDetail, setSelectedCardForDetail] = useState<OngoingItemSalurCard | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'info' | 'ajak' | 'checklist' | 'kendala' | 'todos'>('ajak');

  // Card Three-Dots Action Menu
  const [openMenuCardId, setOpenMenuCardId] = useState<string | null>(null);

  // Edit Form To-Do List Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<OngoingItemSalurCard | null>(null);
  const [editNamaItem, setEditNamaItem] = useState('');
  const [editSubNamaItem, setEditSubNamaItem] = useState('');
  const [editKodeItem, setEditKodeItem] = useState('');
  const [editJenisItem, setEditJenisItem] = useState('Buku');
  const [editProyekSapa, setEditProyekSapa] = useState('');
  const [editPrioritas, setEditPrioritas] = useState<'Tinggi' | 'Sedang' | 'Rendah'>('Sedang');
  const [editStage, setEditStage] = useState<OngoingStage>('backlog');
  const [editPicUtama, setEditPicUtama] = useState('');
  const [editTargetTerbit, setEditTargetTerbit] = useState('');
  const [editEstimasiHalaman, setEditEstimasiHalaman] = useState<number | ''>('');
  const [editTargetEksemplar, setEditTargetEksemplar] = useState<number | ''>('');
  const [editLinkNaskah, setEditLinkNaskah] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editTanggalMulaiAjak, setEditTanggalMulaiAjak] = useState('');
  const [editDependsOnCardId, setEditDependsOnCardId] = useState('');
  const [editDivisi, setEditDivisi] = useState<string>('PNB');

  // Tulis Kendala Modal State
  const [isKendalaModalOpen, setIsKendalaModalOpen] = useState(false);
  const [kendalaCard, setKendalaCard] = useState<OngoingItemSalurCard | null>(null);
  const [kendalaJudul, setKendalaJudul] = useState('');
  const [kendalaDeskripsi, setKendalaDeskripsi] = useState('');
  const [kendalaKategori, setKendalaKategori] = useState<'Naskah' | 'Desain & Layout' | 'Percetakan & ISBN' | 'Anggaran / Administrasi' | 'Lainnya'>('Naskah');
  const [kendalaStatus, setKendalaStatus] = useState<'Open' | 'Sedang Ditangani' | 'Selesai'>('Open');
  const [kendalaPelapor, setKendalaPelapor] = useState('');
  const [kendalaSolusi, setKendalaSolusi] = useState('');

  // Tambahkan A-AJAK Modal State (Tambah PIC To-do List & waktu mulai pengerjaan A-AJAK)
  const [isAddAjakModalOpen, setIsAddAjakModalOpen] = useState(false);
  const [ajakModalCard, setAjakModalCard] = useState<OngoingItemSalurCard | null>(null);
  const [ajakPicTodoList, setAjakPicTodoList] = useState('');
  const [ajakCustomPic, setAjakCustomPic] = useState('');
  const [ajakStartDate, setAjakStartDate] = useState('');
  const [ajakNamaPekerjaan, setAjakNamaPekerjaan] = useState('');
  const [ajakKategori, setAjakKategori] = useState<'Naskah' | 'Desain' | 'Legal/ISBN' | 'Produksi' | 'Distribusi'>('Naskah');
  const [ajakTargetSelesai, setAjakTargetSelesai] = useState('');
  const [ajakStatus, setAjakStatus] = useState<'Belum Mulai' | 'Sedang Berjalan' | 'Menunggu Review' | 'Selesai'>('Sedang Berjalan');
  const [ajakKeterangan, setAjakKeterangan] = useState('');

  // Atur Muncul di Not Started Modal State (Syarat To-Do List Masuk Selesai)
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [triggerModalCard, setTriggerModalCard] = useState<OngoingItemSalurCard | null>(null);
  const [triggerDependsOnCardId, setTriggerDependsOnCardId] = useState('');

  // Selesaikan Proyek SAPA Pop Up State (Selesai/Batal dan Keterangan)
  const [isSelesaikanProyekModalOpen, setIsSelesaikanProyekModalOpen] = useState(false);
  const [resolvingProyekCard, setResolvingProyekCard] = useState<OngoingItemSalurCard | null>(null);
  const [resolvingProyekStatus, setResolvingProyekStatus] = useState<'Selesai' | 'Batal'>('Selesai');
  const [resolvingProyekKeterangan, setResolvingProyekKeterangan] = useState('');

  // New Card Form State
  const [newNamaItem, setNewNamaItem] = useState('');
  const [newSubNamaItem, setNewSubNamaItem] = useState('');
  const [newKodeItem, setNewKodeItem] = useState('');
  const [newJenisItem, setNewJenisItem] = useState('Buku');
  const [newProyekSapa, setNewProyekSapa] = useState('');
  const [newPrioritas, setNewPrioritas] = useState<'Tinggi' | 'Sedang' | 'Rendah'>('Sedang');
  const [newStage, setNewStage] = useState<OngoingStage>('backlog');
  const [newPicUtama, setNewPicUtama] = useState('Silvia Fukada');
  const [newTargetTerbit, setNewTargetTerbit] = useState('');
  const [newEstimasiHalaman, setNewEstimasiHalaman] = useState<number | ''>('');
  const [newTargetEksemplar, setNewTargetEksemplar] = useState<number | ''>('');
  const [newLinkNaskah, setNewLinkNaskah] = useState('');
  const [newCatatan, setNewCatatan] = useState('');
  const [newTanggalMulaiAjak, setNewTanggalMulaiAjak] = useState('');
  const [newDependsOnCardId, setNewDependsOnCardId] = useState('');
  const [newDivisi, setNewDivisi] = useState<string>(currentDivisi !== 'ALL' ? currentDivisi : 'PNB');

  useEffect(() => {
    if (currentDivisi !== 'ALL') {
      setNewDivisi(currentDivisi);
    }
  }, [currentDivisi]);

  // Temporary list of Pekerjaan A-AJAK in Add Form
  const [newPekerjaanAjakList, setNewPekerjaanAjakList] = useState<OngoingPekerjaanAjak[]>([
    {
      id: 'init-1',
      namaPekerjaan: 'Penulisan & Penerjemahan Naskah',
      kategori: 'Naskah',
      pic: 'Tim Penulis PNB',
      status: 'Sedang Berjalan',
      targetSelesai: '',
    },
    {
      id: 'init-2',
      namaPekerjaan: 'Editing & Penyelarasan Istilah Dharma',
      kategori: 'Naskah',
      pic: 'Silvia Fukada',
      status: 'Belum Mulai',
      targetSelesai: '',
    },
    {
      id: 'init-3',
      namaPekerjaan: 'Desain Tata Letak (Layout) & Cover',
      kategori: 'Desain',
      pic: 'Desainer PNB',
      status: 'Belum Mulai',
      targetSelesai: '',
    },
    {
      id: 'init-4',
      namaPekerjaan: 'Proofreading Akhir & Cetak Dummy',
      kategori: 'Produksi',
      pic: 'Percetakan PNB',
      status: 'Belum Mulai',
      targetSelesai: '',
    },
    {
      id: 'init-5',
      namaPekerjaan: 'Pendaftaran ISBN & Barcode',
      kategori: 'Legal/ISBN',
      pic: 'Admin PNB',
      status: 'Belum Mulai',
      targetSelesai: '',
    },
  ]);

  // Persist helper
  const updateAndSaveCards = (updated: OngoingItemSalurCard[]) => {
    setCards(updated);
    saveOngoingItemSalurToStorage(updated);
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}
  };

  // Compile list of Proyek SAPA for current Divisi (or ALL)
  const availableProjects = useMemo(() => {
    const listFromProps = projectsList
      .filter((p) => {
        if (currentDivisi === 'ALL') return true;
        return (p.divisi || '').toUpperCase() === currentDivisi.toUpperCase();
      })
      .map((p) => ({
        id: p.id,
        nama: p.namaKegiatan,
        status: p.status,
        tanggal: p.tanggal,
        divisi: p.divisi || 'PNB',
      }));

    // Default sample projects if none found for PNB
    const defaults = [
      { id: 'proj-pnb-1', nama: 'Seri Meditasi Lamrim Pemula', status: 'Ongoing', tanggal: 'Des 2021', divisi: 'PNB' },
      { id: 'proj-pnb-2', nama: 'Buku Doa & Puja Harian Buddhis', status: 'Ongoing', tanggal: 'Nov - Des 2021', divisi: 'PNB' },
      { id: 'proj-pnb-3', nama: 'Penerbitan Komik Jataka Bergambar Vol. 3', status: 'Waiting Acc', tanggal: 'Nov 2021', divisi: 'PNB' },
      { id: 'proj-pnb-4', nama: 'Penerbitan Buku Dharma Master Dagpo 2021', status: 'Ongoing', tanggal: 'Jan 2022', divisi: 'PNB' },
    ];

    const map = new Map<string, { id: string; nama: string; status: string; tanggal: string; divisi?: string }>();
    if (currentDivisi === 'PNB' || currentDivisi === 'ALL') {
      defaults.forEach((d) => map.set(d.nama.toLowerCase().trim(), d));
    }
    listFromProps.forEach((p) => map.set(p.nama.toLowerCase().trim(), p));

    // Also include any project names present in existing cards matching current divisi
    cards.forEach((c) => {
      const cardDivisi = (c.divisi || 'PNB').toUpperCase();
      if (currentDivisi !== 'ALL' && cardDivisi !== currentDivisi.toUpperCase()) return;
      const key = c.proyekSapaName.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, {
          id: c.proyekSapaId || `proj-${Date.now()}`,
          nama: c.proyekSapaName,
          status: 'Ongoing',
          tanggal: c.targetTerbit || '-',
          divisi: c.divisi || 'PNB',
        });
      }
    });

    return Array.from(map.values());
  }, [projectsList, cards, currentDivisi]);

  const pnbProjects = availableProjects; // Backward compatibility alias

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      // Divisi Filter
      if (currentDivisi !== 'ALL') {
        const cardDivisi = (c.divisi || 'PNB').toUpperCase();
        if (cardDivisi !== currentDivisi.toUpperCase()) {
          return false;
        }
      }
      if (selectedProyekFilter !== 'ALL') {
        if (c.proyekSapaName.toLowerCase().trim() !== selectedProyekFilter.toLowerCase().trim()) {
          return false;
        }
      }
      if (selectedStageFilter !== 'ALL') {
        if (c.stage !== selectedStageFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.namaItem.toLowerCase().includes(q);
        const matchCode = c.kodeItem?.toLowerCase().includes(q) || false;
        const matchSub = c.subNamaItem?.toLowerCase().includes(q) || false;
        const matchProyek = c.proyekSapaName.toLowerCase().includes(q);
        const matchPic = c.picUtama.toLowerCase().includes(q);
        const matchAjak = c.pekerjaanAjak.some((a) => a.namaPekerjaan.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchSub && !matchProyek && !matchPic && !matchAjak) {
          return false;
        }
      }
      return true;
    });
  }, [cards, currentDivisi, selectedProyekFilter, selectedStageFilter, searchQuery]);

  // Project KPI & Tracking Summary
  const projectTrackingSummary = useMemo(() => {
    const totalItems = filteredCards.length;
    const backlogCount = filteredCards.filter((c) => c.stage === 'backlog').length;
    const notStartedCount = filteredCards.filter((c) => c.stage === 'not_started').length;
    const inProgressCount = filteredCards.filter((c) => c.stage === 'in_progress').length;
    const doneCount = filteredCards.filter((c) => c.stage === 'done').length;

    // Total Pekerjaan A-AJAK across all filtered cards
    let totalAjak = 0;
    let completedAjak = 0;
    filteredCards.forEach((c) => {
      c.pekerjaanAjak.forEach((a) => {
        totalAjak += 1;
        if (a.status === 'Selesai') completedAjak += 1;
      });
    });

    const completionRate = totalAjak > 0 ? Math.round((completedAjak / totalAjak) * 100) : 0;

    return {
      totalItems,
      backlogCount,
      notStartedCount,
      inProgressCount,
      doneCount,
      totalAjak,
      completedAjak,
      completionRate,
    };
  }, [filteredCards]);

  // Stage advance/retreat handlers (Kolom: Backlog, Not Started, Sedang Dikerjakan & Review, Selesai)
  const STAGE_ORDER: OngoingStage[] = ['backlog', 'not_started', 'in_progress', 'done'];

  // Centralized stage transition with completion record, dependency trigger & Proyek SAPA resolution popup
  const applyStageTransition = (cardId: string, nextStage: OngoingStage) => {
    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard) return;

    const nowFormatted = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':');

    let unlockedDependentCards: string[] = [];

    const updated = cards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          stage: nextStage,
          selesaiAt: nextStage === 'done' ? (c.selesaiAt || nowFormatted) : c.selesaiAt,
          updatedAt: new Date().toISOString(),
        };
      }
      // Otomatis muncul di Not Started jika to-do list prasyarat masuk ke "Selesai"
      if (nextStage === 'done' && c.dependsOnCardId === cardId && (c.stage === 'backlog' as OngoingStage)) {
        unlockedDependentCards.push(c.namaItem);
        return {
          ...c,
          stage: 'not_started' as OngoingStage,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    updateAndSaveCards(updated);

    const stageTitle = KANBAN_COLUMNS.find((k) => k.id === nextStage)?.title || nextStage;
    onShowToast(`Kartu dipindahkan ke "${stageTitle}"`);

    if (unlockedDependentCards.length > 0) {
      setTimeout(() => {
        onShowToast(`To-Do List lanjutan otomatis aktif di "Not Started": ${unlockedDependentCards.join(', ')}`);
      }, 700);
    }

    if (selectedCardForDetail?.id === cardId) {
      setSelectedCardForDetail((prev) =>
        prev
          ? {
              ...prev,
              stage: nextStage,
              selesaiAt: nextStage === 'done' ? (prev.selesaiAt || nowFormatted) : prev.selesaiAt,
            }
          : null
      );
    }

    // Jika kartunya masuk ke "Selesai", record waktu selesai dan tampilkan pop up selesaikan Proyek SAPA
    if (nextStage === 'done') {
      const cardForPopup = {
        ...targetCard,
        stage: 'done' as OngoingStage,
        selesaiAt: targetCard.selesaiAt || nowFormatted,
      };
      setTimeout(() => {
        handleOpenSelesaikanProyekModal(cardForPopup);
      }, 350);
    }
  };

  const handleMoveStage = (cardId: string, direction: 'prev' | 'next') => {
    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard) return;

    const currentIndex = STAGE_ORDER.indexOf(targetCard.stage);
    let nextIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) nextIndex = currentIndex - 1;
    if (direction === 'next' && currentIndex < STAGE_ORDER.length - 1) nextIndex = currentIndex + 1;

    if (nextIndex === currentIndex) return;
    applyStageTransition(cardId, STAGE_ORDER[nextIndex]);
  };

  const handleSetStageDirectly = (cardId: string, targetStage: OngoingStage) => {
    applyStageTransition(cardId, targetStage);
  };

  // Delete Card
  const handleDeleteCard = (cardId: string, cardName: string) => {
    if (window.confirm(`Yakin ingin menghapus ongoing item "${cardName}"?`)) {
      const updated = cards.filter((c) => c.id !== cardId);
      updateAndSaveCards(updated);
      onShowToast(`Ongoing item "${cardName}" berhasil dihapus`);
      if (selectedCardForDetail?.id === cardId) {
        setSelectedCardForDetail(null);
      }
    }
  };

  // Add Card Submit
  const handleCreateNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamaItem.trim()) {
      onShowToast('Mohon isi Nama Item Buku / Materi');
      return;
    }

    const assignedProyek = newProyekSapa.trim() || pnbProjects[0]?.nama || 'Penerbitan Buku Dharma PNB';
    const foundProyek = pnbProjects.find((p) => p.nama.toLowerCase() === assignedProyek.toLowerCase());
    const matchedPrereqCard = cards.find((c) => c.id === newDependsOnCardId);

    const newCard: OngoingItemSalurCard = {
      id: `ongoing-${Date.now()}`,
      kodeItem: newKodeItem.trim() || `B-0${cards.length + 41}`,
      namaItem: newNamaItem.trim(),
      subNamaItem: newSubNamaItem.trim() || undefined,
      jenisItem: newJenisItem,
      proyekSapaId: foundProyek ? foundProyek.id : `proj-${Date.now()}`,
      proyekSapaName: assignedProyek,
      divisi: newDivisi || (currentDivisi !== 'ALL' ? currentDivisi : 'PNB'),
      stage: newStage,
      prioritas: newPrioritas,
      picUtama: newPicUtama.trim() || 'Silvia Fukada',
      targetTerbit: newTargetTerbit.trim() || 'Desember 2021',
      estimasiHalaman: newEstimasiHalaman ? Number(newEstimasiHalaman) : undefined,
      targetEksemplar: newTargetEksemplar ? Number(newTargetEksemplar) : undefined,
      linkNaskah: newLinkNaskah.trim() || undefined,
      catatan: newCatatan.trim() || undefined,
      tanggalMulaiAjak: newTanggalMulaiAjak.trim() || undefined,
      dependsOnCardId: newDependsOnCardId.trim() || undefined,
      dependsOnCardTitle: matchedPrereqCard
        ? `${matchedPrereqCard.kodeItem ? matchedPrereqCard.kodeItem + ' - ' : ''}${matchedPrereqCard.namaItem}`
        : undefined,
      pekerjaanAjak: newPekerjaanAjakList.filter((a) => a.namaPekerjaan.trim()),
      checklists: [
        { id: `chk-${Date.now()}-1`, title: 'Pemeriksaan kelengkapan naskah', completed: false },
        { id: `chk-${Date.now()}-2`, title: 'ACC pengajuan ISBN Perpusnas', completed: false },
        { id: `chk-${Date.now()}-3`, title: 'Dummy cetak pertama disetujui', completed: false },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newCard, ...cards];
    updateAndSaveCards(updated);
    onShowToast(`Ongoing Item "${newCard.namaItem}" berhasil ditambahkan`);

    // Reset Form
    setNewNamaItem('');
    setNewSubNamaItem('');
    setNewKodeItem('');
    setNewLinkNaskah('');
    setNewCatatan('');
    setNewEstimasiHalaman('');
    setNewTargetEksemplar('');
    setNewStage('backlog');
    setNewTanggalMulaiAjak('');
    setNewDependsOnCardId('');
    setIsAddModalOpen(false);
  };

  // Edit Form To-Do List Handlers
  const handleOpenEditTodoListModal = (card: OngoingItemSalurCard) => {
    setEditingCard(card);
    setEditNamaItem(card.namaItem || '');
    setEditSubNamaItem(card.subNamaItem || '');
    setEditKodeItem(card.kodeItem || '');
    setEditJenisItem(card.jenisItem || 'Buku');
    setEditProyekSapa(card.proyekSapaName || '');
    setEditPrioritas(card.prioritas || 'Sedang');
    setEditStage(card.stage || 'backlog');
    setEditPicUtama(card.picUtama || '');
    setEditTargetTerbit(card.targetTerbit || '');
    setEditEstimasiHalaman(card.estimasiHalaman ?? '');
    setEditTargetEksemplar(card.targetEksemplar ?? '');
    setEditLinkNaskah(card.linkNaskah || '');
    setEditCatatan(card.catatan || '');
    setEditTanggalMulaiAjak(card.tanggalMulaiAjak || '');
    setEditDependsOnCardId(card.dependsOnCardId || '');
    setEditDivisi(card.divisi || (currentDivisi !== 'ALL' ? currentDivisi : 'PNB'));
    setIsEditModalOpen(true);
  };

  const handleSaveEditTodoList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    if (!editNamaItem.trim()) {
      onShowToast('Nama Item / To-Do List wajib diisi');
      return;
    }

    const matchedProject = pnbProjects.find((p) => p.nama === editProyekSapa);
    const matchedPrereqCard = cards.find((c) => c.id === editDependsOnCardId);

    const nowFormatted = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':');

    const isNewlyCompleted = editStage === 'done' && editingCard.stage !== 'done';
    const finalSelesaiAt = editStage === 'done' ? (editingCard.selesaiAt || nowFormatted) : editingCard.selesaiAt;

    const updatedCard: OngoingItemSalurCard = {
      ...editingCard,
      namaItem: editNamaItem.trim(),
      subNamaItem: editSubNamaItem.trim() || undefined,
      kodeItem: editKodeItem.trim() || undefined,
      jenisItem: editJenisItem || 'Buku',
      proyekSapaId: matchedProject ? matchedProject.id : editingCard.proyekSapaId,
      proyekSapaName: editProyekSapa.trim() || editingCard.proyekSapaName,
      divisi: editDivisi || editingCard.divisi || 'PNB',
      prioritas: editPrioritas,
      stage: editStage,
      picUtama: editPicUtama.trim() || editingCard.picUtama || 'Tim PNB',
      targetTerbit: editTargetTerbit.trim() || editingCard.targetTerbit,
      estimasiHalaman: editEstimasiHalaman !== '' ? Number(editEstimasiHalaman) : undefined,
      targetEksemplar: editTargetEksemplar !== '' ? Number(editTargetEksemplar) : undefined,
      linkNaskah: editLinkNaskah.trim() || undefined,
      catatan: editCatatan.trim() || undefined,
      tanggalMulaiAjak: editTanggalMulaiAjak.trim() || undefined,
      dependsOnCardId: editDependsOnCardId.trim() || undefined,
      dependsOnCardTitle: matchedPrereqCard
        ? `${matchedPrereqCard.kodeItem ? matchedPrereqCard.kodeItem + ' - ' : ''}${matchedPrereqCard.namaItem}`
        : undefined,
      selesaiAt: finalSelesaiAt,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    let nextCards = cards.map((c) => (c.id === editingCard.id ? updatedCard : c));

    // If card entered 'done', unlock dependent cards
    if (isNewlyCompleted) {
      let unlockedNames: string[] = [];
      nextCards = nextCards.map((c) => {
        if (c.dependsOnCardId === editingCard.id && (c.stage === 'backlog' as OngoingStage)) {
          unlockedNames.push(c.namaItem);
          return {
            ...c,
            stage: 'not_started' as OngoingStage,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      if (unlockedNames.length > 0) {
        setTimeout(() => {
          onShowToast(`To-Do List lanjutan otomatis aktif di "Not Started": ${unlockedNames.join(', ')}`);
        }, 600);
      }
    }

    updateAndSaveCards(nextCards);

    if (selectedCardForDetail?.id === editingCard.id) {
      setSelectedCardForDetail(updatedCard);
    }

    setIsEditModalOpen(false);
    setEditingCard(null);
    onShowToast(`Form To-Do List "${updatedCard.namaItem}" berhasil diperbarui`);

    if (isNewlyCompleted) {
      setTimeout(() => {
        handleOpenSelesaikanProyekModal(updatedCard);
      }, 350);
    }
  };

  // Tambahkan A-AJAK Handlers (Tambah PIC To-do List dari Form To-Do List & kapan A-AJAK mulai)
  const handleOpenAddAjakModal = (card: OngoingItemSalurCard) => {
    const current = cards.find((c) => c.id === card.id) || card;
    setAjakModalCard(current);
    setAjakPicTodoList(current.picUtama || 'Silvia Fukada');
    setAjakCustomPic('');
    setAjakStartDate(current.tanggalMulaiAjak || new Date().toISOString().split('T')[0]);
    setAjakNamaPekerjaan('');
    setAjakKategori('Naskah');
    setAjakTargetSelesai('');
    setAjakStatus('Sedang Berjalan');
    setAjakKeterangan('');
    setIsAddAjakModalOpen(true);
  };

  const handleSaveAddAjak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ajakModalCard) return;

    const finalPic = (ajakCustomPic.trim() || ajakPicTodoList.trim() || ajakModalCard.picUtama || 'Tim PNB');

    let nextAjakList = [...ajakModalCard.pekerjaanAjak];
    if (ajakNamaPekerjaan.trim()) {
      const newJob: OngoingPekerjaanAjak = {
        id: `ajak-${Date.now()}`,
        namaPekerjaan: ajakNamaPekerjaan.trim(),
        kategori: ajakKategori,
        pic: finalPic,
        status: ajakStatus,
        targetSelesai: ajakTargetSelesai.trim() || undefined,
        keterangan: ajakKeterangan.trim() || undefined,
      };
      nextAjakList.push(newJob);
    }

    const updatedCard: OngoingItemSalurCard = {
      ...ajakModalCard,
      picUtama: finalPic,
      tanggalMulaiAjak: ajakStartDate.trim() || ajakModalCard.tanggalMulaiAjak,
      pekerjaanAjak: nextAjakList,
      updatedAt: new Date().toISOString(),
    };

    const nextCards = cards.map((c) => (c.id === ajakModalCard.id ? updatedCard : c));
    updateAndSaveCards(nextCards);

    if (selectedCardForDetail?.id === ajakModalCard.id) {
      setSelectedCardForDetail(updatedCard);
    }

    setIsAddAjakModalOpen(false);
    setAjakModalCard(null);
    onShowToast(`A-AJAK & PIC To-Do List "${updatedCard.namaItem}" berhasil disimpan`);
  };

  // Atur Muncul di Not Started (Trigger dependency rule)
  const handleOpenTriggerModal = (card: OngoingItemSalurCard) => {
    const current = cards.find((c) => c.id === card.id) || card;
    setTriggerModalCard(current);
    setTriggerDependsOnCardId(current.dependsOnCardId || '');
    setIsTriggerModalOpen(true);
  };

  const handleSaveTriggerModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerModalCard) return;

    const prereqCard = cards.find((c) => c.id === triggerDependsOnCardId);

    const updatedCard: OngoingItemSalurCard = {
      ...triggerModalCard,
      dependsOnCardId: triggerDependsOnCardId.trim() || undefined,
      dependsOnCardTitle: prereqCard
        ? `${prereqCard.kodeItem ? prereqCard.kodeItem + ' - ' : ''}${prereqCard.namaItem}`
        : undefined,
      updatedAt: new Date().toISOString(),
    };

    const nextCards = cards.map((c) => (c.id === triggerModalCard.id ? updatedCard : c));
    updateAndSaveCards(nextCards);

    if (selectedCardForDetail?.id === triggerModalCard.id) {
      setSelectedCardForDetail(updatedCard);
    }

    setIsTriggerModalOpen(false);
    setTriggerModalCard(null);
    onShowToast(`Pengaturan muncul di Not Started berhasil disimpan!`);
  };

  // Selesaikan Proyek SAPA Handlers (Pop up: selesai/batal dan keterangan)
  const handleOpenSelesaikanProyekModal = (card: OngoingItemSalurCard) => {
    const current = cards.find((c) => c.id === card.id) || card;
    setResolvingProyekCard(current);
    setResolvingProyekStatus(current.proyekSapaStatus === 'Batal' ? 'Batal' : 'Selesai');
    setResolvingProyekKeterangan(current.proyekSapaKeterangan || '');
    setIsSelesaikanProyekModalOpen(true);
  };

  const handleSaveSelesaikanProyek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingProyekCard) return;

    const resolvedTime = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace('.', ':');

    const updatedCard: OngoingItemSalurCard = {
      ...resolvingProyekCard,
      proyekSapaStatus: resolvingProyekStatus,
      proyekSapaKeterangan: resolvingProyekKeterangan.trim() || undefined,
      proyekSapaResolvedAt: resolvedTime,
      updatedAt: new Date().toISOString(),
    };

    // Update all cards under the same Proyek SAPA so the project status is aligned
    const nextCards = cards.map((c) => {
      if (c.id === resolvingProyekCard.id) return updatedCard;
      if (
        c.proyekSapaName &&
        resolvingProyekCard.proyekSapaName &&
        c.proyekSapaName.toLowerCase().trim() === resolvingProyekCard.proyekSapaName.toLowerCase().trim()
      ) {
        return {
          ...c,
          proyekSapaStatus: resolvingProyekStatus,
          proyekSapaKeterangan: resolvingProyekKeterangan.trim() || c.proyekSapaKeterangan,
          proyekSapaResolvedAt: resolvedTime,
        };
      }
      return c;
    });

    updateAndSaveCards(nextCards);

    if (selectedCardForDetail?.id === resolvingProyekCard.id) {
      setSelectedCardForDetail(updatedCard);
    }

    setIsSelesaikanProyekModalOpen(false);
    setResolvingProyekCard(null);
    onShowToast(`Status Proyek SAPA "${resolvingProyekCard.proyekSapaName}": ${resolvingProyekStatus} berhasil disimpan!`);
  };

  // Tulis Kendala Handlers
  const handleOpenKendalaModal = (card: OngoingItemSalurCard) => {
    const currentCard = cards.find((c) => c.id === card.id) || card;
    setKendalaCard(currentCard);
    setKendalaJudul('');
    setKendalaDeskripsi('');
    setKendalaKategori('Naskah');
    setKendalaStatus('Open');
    setKendalaPelapor(currentCard.picUtama || 'Tim PNB');
    setKendalaSolusi('');
    setIsKendalaModalOpen(true);
  };

  const handleAddKendala = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kendalaCard) return;

    if (!kendalaJudul.trim()) {
      onShowToast('Judul kendala wajib diisi');
      return;
    }

    const todayStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    const newKendalaItem: OngoingKendala = {
      id: `kdl-${Date.now()}`,
      tanggal: todayStr,
      judul: kendalaJudul.trim(),
      deskripsi: kendalaDeskripsi.trim(),
      kategori: kendalaKategori,
      status: kendalaStatus,
      pelapor: kendalaPelapor.trim() || kendalaCard.picUtama || 'Tim PNB',
      solusi: kendalaSolusi.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const currentKendalaList = kendalaCard.kendala || [];
    const updatedKendalaList = [newKendalaItem, ...currentKendalaList];

    const updatedCard: OngoingItemSalurCard = {
      ...kendalaCard,
      kendala: updatedKendalaList,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const nextCards = cards.map((c) => (c.id === kendalaCard.id ? updatedCard : c));
    updateAndSaveCards(nextCards);
    setKendalaCard(updatedCard);

    if (selectedCardForDetail?.id === kendalaCard.id) {
      setSelectedCardForDetail(updatedCard);
    }

    setKendalaJudul('');
    setKendalaDeskripsi('');
    setKendalaSolusi('');
    onShowToast(`Kendala berhasil dicatat`);
  };

  const handleToggleKendalaStatus = (kendalaId: string, nextStatus: 'Open' | 'Sedang Ditangani' | 'Selesai') => {
    if (!kendalaCard) return;
    const currentKendalaList = kendalaCard.kendala || [];
    const updatedKendalaList = currentKendalaList.map((k) =>
      k.id === kendalaId ? { ...k, status: nextStatus } : k
    );

    const updatedCard: OngoingItemSalurCard = {
      ...kendalaCard,
      kendala: updatedKendalaList,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const nextCards = cards.map((c) => (c.id === kendalaCard.id ? updatedCard : c));
    updateAndSaveCards(nextCards);
    setKendalaCard(updatedCard);

    if (selectedCardForDetail?.id === kendalaCard.id) {
      setSelectedCardForDetail(updatedCard);
    }

    onShowToast(`Status kendala diubah: ${nextStatus}`);
  };

  const handleDeleteKendala = (kendalaId: string) => {
    if (!kendalaCard) return;
    const currentKendalaList = kendalaCard.kendala || [];
    const updatedKendalaList = currentKendalaList.filter((k) => k.id !== kendalaId);

    const updatedCard: OngoingItemSalurCard = {
      ...kendalaCard,
      kendala: updatedKendalaList,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const nextCards = cards.map((c) => (c.id === kendalaCard.id ? updatedCard : c));
    updateAndSaveCards(nextCards);
    setKendalaCard(updatedCard);

    if (selectedCardForDetail?.id === kendalaCard.id) {
      setSelectedCardForDetail(updatedCard);
    }

    onShowToast('Kendala berhasil dihapus');
  };

  // Preset Template Helper
  const handleApplyPresetAjak = () => {
    setNewPekerjaanAjakList([
      {
        id: `ajak-${Date.now()}-1`,
        namaPekerjaan: 'Penulisan Naskah Asli & Riset Materi',
        kategori: 'Naskah',
        pic: 'Tim Penulis PNB',
        status: 'Sedang Berjalan',
        targetSelesai: 'Minggu ke-2',
      },
      {
        id: `ajak-${Date.now()}-2`,
        namaPekerjaan: 'Penerjemahan & Alih Aksara',
        kategori: 'Naskah',
        pic: 'Bhikshu Bhadra',
        status: 'Sedang Berjalan',
        targetSelesai: 'Minggu ke-4',
      },
      {
        id: `ajak-${Date.now()}-3`,
        namaPekerjaan: 'Editing Tata Bahasa & Glosarium Istilah',
        kategori: 'Naskah',
        pic: 'Silvia Fukada',
        status: 'Belum Mulai',
        targetSelesai: 'Minggu ke-6',
      },
      {
        id: `ajak-${Date.now()}-4`,
        namaPekerjaan: 'Layout Interior InDesign & Desain Cover',
        kategori: 'Desain',
        pic: 'Desainer PNB',
        status: 'Belum Mulai',
        targetSelesai: 'Minggu ke-8',
      },
      {
        id: `ajak-${Date.now()}-5`,
        namaPekerjaan: 'Proofreading Naskah & Review Dewan Sangha',
        kategori: 'Naskah',
        pic: 'Ven. Thitaviro',
        status: 'Belum Mulai',
        targetSelesai: 'Minggu ke-9',
      },
      {
        id: `ajak-${Date.now()}-6`,
        namaPekerjaan: 'Registrasi ISBN & Barcode Perpustakaan Nasional',
        kategori: 'Legal/ISBN',
        pic: 'Admin PNB',
        status: 'Belum Mulai',
        targetSelesai: 'Minggu ke-10',
      },
      {
        id: `ajak-${Date.now()}-7`,
        namaPekerjaan: 'Cetak Dummy, Color Proof & Quality Control Percetakan',
        kategori: 'Produksi',
        pic: 'Percetakan Mitra PNB',
        status: 'Belum Mulai',
        targetSelesai: 'Minggu ke-11',
      },
    ]);
    onShowToast('Alur pekerjaan A-AJAK standar buku berhasil dimuat');
  };

  // Detail Modal Handlers for A-AJAK Jobs
  const handleToggleAjakStatus = (cardId: string, ajakId: string) => {
    const updated = cards.map((c) => {
      if (c.id !== cardId) return c;
      const nextAjak = c.pekerjaanAjak.map((a) => {
        if (a.id !== ajakId) return a;
        let newStatus: OngoingPekerjaanAjak['status'] = 'Belum Mulai';
        if (a.status === 'Belum Mulai') newStatus = 'Sedang Berjalan';
        else if (a.status === 'Sedang Berjalan') newStatus = 'Menunggu Review';
        else if (a.status === 'Menunggu Review') newStatus = 'Selesai';
        else if (a.status === 'Selesai') newStatus = 'Belum Mulai';
        return { ...a, status: newStatus };
      });
      return { ...c, pekerjaanAjak: nextAjak };
    });
    updateAndSaveCards(updated);

    const changedCard = updated.find((c) => c.id === cardId);
    if (changedCard) setSelectedCardForDetail(changedCard);
    onShowToast('Status pekerjaan A-AJAK diperbarui');
  };

  const handleToggleChecklist = (cardId: string, checklistId: string) => {
    const updated = cards.map((c) => {
      if (c.id !== cardId) return c;
      const nextChecklists = c.checklists.map((chk) =>
        chk.id === checklistId ? { ...chk, completed: !chk.completed } : chk
      );
      return { ...c, checklists: nextChecklists };
    });
    updateAndSaveCards(updated);

    const changedCard = updated.find((c) => c.id === cardId);
    if (changedCard) setSelectedCardForDetail(changedCard);
  };

  const handleAddAjakToCard = (cardId: string, namaPekerjaan: string, pic: string, kategori: OngoingPekerjaanAjak['kategori']) => {
    if (!namaPekerjaan.trim()) return;
    const newAjak: OngoingPekerjaanAjak = {
      id: `ajak-${Date.now()}`,
      namaPekerjaan: namaPekerjaan.trim(),
      kategori,
      pic: pic.trim() || 'Tim PNB',
      status: 'Sedang Berjalan',
    };

    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, pekerjaanAjak: [...c.pekerjaanAjak, newAjak] } : c
    );
    updateAndSaveCards(updated);

    const changedCard = updated.find((c) => c.id === cardId);
    if (changedCard) setSelectedCardForDetail(changedCard);
    onShowToast(`Pekerjaan A-AJAK "${namaPekerjaan}" ditambahkan`);
  };

  const handleAddChecklistToCard = (cardId: string, title: string) => {
    if (!title.trim()) return;
    const newChecklist: OngoingChecklistItem = {
      id: `chk-${Date.now()}`,
      title: title.trim(),
      completed: false,
    };

    const updated = cards.map((c) =>
      c.id === cardId ? { ...c, checklists: [...c.checklists, newChecklist] } : c
    );
    updateAndSaveCards(updated);

    const changedCard = updated.find((c) => c.id === cardId);
    if (changedCard) setSelectedCardForDetail(changedCard);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#008d91]/10 text-[#008d91] flex items-center justify-center font-bold">
              <Kanban className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Ongoing Create Item S-SALUR
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#008d91] border border-teal-200">
                  {currentDivisi === 'ALL' ? 'Semua Divisi' : `Divisi ${currentDivisi}`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Papan kerja Trello & pelacakan pekerjaan A-AJAK untuk Proyek SAPA {currentDivisi === 'ALL' ? 'Semua Divisi' : `Divisi ${currentDivisi}`}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher, Cross-Tab Links & + Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Cross-Tab Navigation */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {onNavigateToKegiatan && (
              <button
                type="button"
                onClick={onNavigateToKegiatan}
                title="Buka Kalender Kegiatan"
                className="bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-[#008d91] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#008d91]" />
                <span className="hidden sm:inline">Kalender Kegiatan</span>
              </button>
            )}

            {onNavigateToTimeline && (
              <button
                type="button"
                onClick={onNavigateToTimeline}
                title="Buka Kegiatan vs Timeline"
                className="bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-[#008d91] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#008d91]" />
                <span className="hidden sm:inline">Kegiatan vs Timeline</span>
              </button>
            )}

            {onOpenFormTodoList && (
              <button
                type="button"
                onClick={() => onOpenFormTodoList(projectsList[0] || undefined)}
                title="Buka Form To-Do List"
                className="bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-[#008d91] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#008d91]" />
                <span className="hidden sm:inline">Form To-Do List</span>
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabClick('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-white text-[#008d91] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Papan Trello</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabClick('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-[#008d91] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Tabel / List</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabClick('tracker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-white text-[#008d91] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Tracker Proyek SAPA</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#008d91] hover:bg-[#007b7f] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Item / A-AJAK</span>
          </button>
        </div>
      </div>

      {/* 2. Divisi & Proyek SAPA Selector & Quick Progress Metrics */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Divisi */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Divisi:
              </span>
              <div className="relative">
                <select
                  value={currentDivisi}
                  onChange={(e) => handleDivisiChange(e.target.value)}
                  className="appearance-none bg-teal-50/80 border border-teal-200 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm font-bold text-[#008d91] outline-none focus:border-[#008d91] cursor-pointer shadow-2xs"
                >
                  {availableDivisiList.map((div) => (
                    <option key={div} value={div}>
                      {div === 'ALL' ? 'Semua Divisi (ALL)' : `Divisi ${div}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#008d91] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Proyek SAPA Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Proyek SAPA:
              </span>
              <div className="relative">
                <select
                  value={selectedProyekFilter}
                  onChange={(e) => setSelectedProyekFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-[#008d91] cursor-pointer min-w-[200px]"
                >
                  <option value="ALL">
                    Semua Proyek SAPA {currentDivisi !== 'ALL' ? `(${currentDivisi})` : '(Semua Divisi)'}
                  </option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama} ({p.status})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Stage filter */}
            <div className="relative">
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-[#008d91] cursor-pointer"
              >
                <option value="ALL">Semua Tahapan</option>
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari item buku, A-AJAK, PIC..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#008d91] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Project Progress Summary Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-[#008d91]" />
              <span>{projectTrackingSummary.totalItems} Item Ongoing</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              Backlog: <span className="font-bold text-slate-700">{projectTrackingSummary.backlogCount}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              Not Started: <span className="font-bold text-amber-600">{projectTrackingSummary.notStartedCount}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              Dikerjakan & Review: <span className="font-bold text-sky-600">{projectTrackingSummary.inProgressCount}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              Selesai: <span className="font-bold text-emerald-600">{projectTrackingSummary.doneCount}</span>
            </div>
          </div>

          {/* Overall A-AJAK Job Progress Gauge */}
          <div className="flex items-center gap-3 sm:max-w-xs w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Progress A-AJAK:
            </span>
            <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden flex-1">
              <div
                className="bg-[#008d91] h-full rounded-full transition-all duration-300"
                style={{ width: `${projectTrackingSummary.completionRate}%` }}
              />
            </div>
            <span className="text-xs font-black text-[#008d91] whitespace-nowrap">
              {projectTrackingSummary.completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN VIEW: Papan Trello (Kanban) */}
      {activeTab === 'kanban' && (
        <PapanTrelloView
          projectsList={projectsList}
          projectTodos={projectTodos}
          selectedDivisi={currentDivisi}
          onSelectDivisi={(div) => handleDivisiChange(div)}
          divisiOptions={availableDivisiList}
          onOpenFormTodoList={onOpenFormTodoList}
          onShowToast={onShowToast}
          onUpdateTasks={onUpdateTasks}
          karyawanList={karyawanList}
        />
      )}

      {/* Legacy Kanban */}
      {false && activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[1000px]">
            {KANBAN_COLUMNS.map((column) => {
              const columnCards = filteredCards.filter((c) => c.stage === column.id);

              return (
                <div
                  key={column.id}
                  className={`rounded-2xl border ${column.colorClass} flex flex-col min-h-[580px] p-3 shadow-2xs`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-xs sm:text-sm text-slate-800">
                          {column.title}
                        </h2>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${column.badgeBg}`}
                        >
                          {columnCards.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{column.subtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      title="Tambah kartu baru"
                      className="p-1 rounded-lg text-slate-400 hover:text-[#008d91] hover:bg-white/80 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card List in Column */}
                  <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                    {columnCards.length === 0 ? (
                      <div className="h-40 border-2 border-dashed border-slate-200/70 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                        <span className="text-xs text-slate-400 font-medium">
                          Belum ada item
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-2 text-[11px] font-semibold text-[#008d91] hover:underline cursor-pointer"
                        >
                          + Tambah Item
                        </button>
                      </div>
                    ) : (
                      columnCards.map((card) => {
                        const picInitial = card.picUtama?.trim()
                          ? card.picUtama.trim().charAt(0).toUpperCase()
                          : 'S';
                        const prereqCard = card.dependsOnCardId
                          ? cards.find((c) => c.id === card.dependsOnCardId)
                          : null;
                        const isPrereqDone = prereqCard ? prereqCard.stage === 'done' : false;

                        return (
                          <div
                            key={card.id}
                            onClick={() => {
                              setSelectedCardForDetail(card);
                              setDetailActiveTab('ajak');
                            }}
                            className="bg-white rounded-[22px] p-4 sm:p-5 border border-slate-300 shadow-2xs hover:shadow-md transition-all cursor-pointer group hover:border-slate-400 flex flex-col justify-between gap-3 min-h-[120px]"
                          >
                            {/* Top Text & Heading */}
                            <div>
                              {/* Row 1: Divisi - Tanggal - Nama Proyek SAPA & Titik Tiga (Opsi Menu) */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0 pt-0.5">
                                  <span className="px-1.5 py-0.5 rounded-md bg-teal-50 text-[#008d91] border border-teal-200 text-[10px] font-bold shrink-0">
                                    {card.divisi || 'PNB'}
                                  </span>
                                  <p
                                    className="text-xs sm:text-[13px] font-normal text-slate-500 tracking-tight truncate min-w-0"
                                    title={`${card.targetTerbit || '20 Mei 2022'} - ${card.proyekSapaName || 'Nama Proyek SAPA'}`}
                                  >
                                    {card.targetTerbit || '20 Mei 2022'} - {card.proyekSapaName || 'Nama Proyek SAPA'}
                                  </p>
                                </div>

                                {/* Titik Tiga (More Options Menu) on the right */}
                                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenMenuCardId(openMenuCardId === card.id ? null : card.id)
                                    }
                                    className="w-7 h-7 -mr-1 -mt-0.5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Opsi Menu Kartu"
                                    aria-label="Opsi Menu Kartu"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {/* Dropdown Menu */}
                                  {openMenuCardId === card.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-30 cursor-default"
                                        onClick={() => setOpenMenuCardId(null)}
                                      />
                                      <div
                                        className="absolute right-0 top-full mt-1 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="py-1">
                                          {/* Opsi 1: Edit Form To-Do List */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenMenuCardId(null);
                                              handleOpenEditTodoListModal(card);
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-teal-50/70 hover:text-[#008d91] transition-colors cursor-pointer group/opt"
                                          >
                                            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008d91] flex items-center justify-center shrink-0 group-hover/opt:bg-[#008d91] group-hover/opt:text-white transition-colors">
                                              <FileEdit className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                              <span className="font-bold text-slate-800 group-hover/opt:text-[#008d91] block">
                                                Edit Form To-Do List
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-normal block">
                                                Ubah formulir & rincian item
                                              </span>
                                            </div>
                                          </button>

                                          {/* Opsi 2: Tulis Kendala */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenMenuCardId(null);
                                              handleOpenKendalaModal(card);
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-amber-50/70 hover:text-amber-800 transition-colors cursor-pointer group/opt"
                                          >
                                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover/opt:bg-amber-500 group-hover/opt:text-white transition-colors">
                                              <AlertTriangle className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-800 group-hover/opt:text-amber-800 block">
                                                  Tulis Kendala
                                                </span>
                                                {card.kendala &&
                                                  card.kendala.filter((k) => k.status !== 'Selesai').length > 0 && (
                                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                                  )}
                                              </div>
                                              <span className="text-[10px] text-slate-400 font-normal block">
                                                {card.kendala && card.kendala.length > 0
                                                  ? `${card.kendala.length} kendala dicatat`
                                                  : 'Catat hambatan atau blocker'}
                                              </span>
                                            </div>
                                          </button>

                                          {/* Opsi 3: Tambahkan A-AJAK */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenMenuCardId(null);
                                              handleOpenAddAjakModal(card);
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-sky-50/70 hover:text-sky-800 transition-colors cursor-pointer group/opt"
                                          >
                                            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover/opt:bg-sky-600 group-hover/opt:text-white transition-colors">
                                              <UserPlus className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                              <span className="font-bold text-slate-800 group-hover/opt:text-sky-800 block">
                                                Tambahkan A-AJAK
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-normal block">
                                                PIC & waktu mulai pengerjaan
                                              </span>
                                            </div>
                                          </button>

                                          {/* Opsi 4: Atur Muncul di Not Started */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenMenuCardId(null);
                                              handleOpenTriggerModal(card);
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-purple-50/70 hover:text-purple-800 transition-colors cursor-pointer group/opt"
                                          >
                                            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover/opt:bg-purple-600 group-hover/opt:text-white transition-colors">
                                              <GitFork className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                              <span className="font-bold text-slate-800 group-hover/opt:text-purple-800 block">
                                                Atur Muncul di Not Started
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-normal block">
                                                Syarat setelah to-do list selesai
                                              </span>
                                            </div>
                                          </button>

                                          {/* Opsi 5: Selesaikan Proyek SAPA */}
                                          {card.stage === 'done' && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setOpenMenuCardId(null);
                                                handleOpenSelesaikanProyekModal(card);
                                              }}
                                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-emerald-50/70 hover:text-emerald-800 transition-colors cursor-pointer group/opt"
                                            >
                                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover/opt:bg-emerald-600 group-hover/opt:text-white transition-colors">
                                                <Flag className="w-3.5 h-3.5" />
                                              </div>
                                              <div>
                                                <span className="font-bold text-slate-800 group-hover/opt:text-emerald-800 block">
                                                  Selesaikan Proyek SAPA
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-normal block">
                                                  {card.proyekSapaStatus
                                                    ? `Status: ${card.proyekSapaStatus}`
                                                    : 'Tandai selesai / batal'}
                                                </span>
                                              </div>
                                            </button>
                                          )}
                                        </div>

                                        <div className="py-1">
                                          {onNavigateToKegiatan && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setOpenMenuCardId(null);
                                                onNavigateToKegiatan();
                                              }}
                                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-teal-50/70 hover:text-[#008d91] transition-colors cursor-pointer text-slate-700"
                                            >
                                              <CalendarDays className="w-3.5 h-3.5 text-[#008d91]" />
                                              <span>Lihat di Kalender Kegiatan</span>
                                            </button>
                                          )}

                                          {onNavigateToTimeline && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setOpenMenuCardId(null);
                                                onNavigateToTimeline();
                                              }}
                                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-teal-50/70 hover:text-[#008d91] transition-colors cursor-pointer text-slate-700"
                                            >
                                              <Clock className="w-3.5 h-3.5 text-[#008d91]" />
                                              <span>Lihat di Kegiatan vs Timeline</span>
                                            </button>
                                          )}

                                          {onOpenFormTodoList && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setOpenMenuCardId(null);
                                                const matchedProj = projectsList.find(
                                                  (p) => p.nama === card.proyekSapaName || p.id === card.proyekSapaId
                                                );
                                                onOpenFormTodoList(matchedProj);
                                              }}
                                              className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-teal-50/70 hover:text-[#008d91] transition-colors cursor-pointer text-slate-700"
                                            >
                                              <CheckSquare className="w-3.5 h-3.5 text-[#008d91]" />
                                              <span>Buka Form To-Do List</span>
                                            </button>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenMenuCardId(null);
                                              setSelectedCardForDetail(card);
                                              setDetailActiveTab('todos');
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Lihat Rincian & To-Do Terkait</span>
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Row 2: To-Do List Proyek SAPA / Nama Item */}
                              <h3 className="mt-1 font-bold text-slate-800 text-base sm:text-[17px] leading-snug line-clamp-2 group-hover:text-[#008d91] transition-colors">
                                {card.namaItem || 'To-Do List Proyek SAPA'}
                              </h3>

                              {/* Tanggal Mulai A-AJAK & Dependency Info */}
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                                {card.tanggalMulaiAjak && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 font-medium">
                                    <Clock className="w-3 h-3 text-sky-500" />
                                    Mulai A-AJAK: {card.tanggalMulaiAjak}
                                  </span>
                                )}

                                {card.dependsOnCardId && (
                                  <span
                                    title={
                                      prereqCard
                                        ? `Muncul setelah: ${prereqCard.namaItem} (Status: ${prereqCard.stage === 'done' ? 'Selesai' : 'Belum Selesai'})`
                                        : 'Menunggu To-Do List lain selesai'
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium ${
                                      isPrereqDone
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}
                                  >
                                    <GitFork className="w-3 h-3" />
                                    {isPrereqDone ? 'Prasyarat Selesai' : `Tunggu: ${prereqCard?.namaItem ? prereqCard.namaItem.slice(0, 18) + '...' : 'To-Do Selesai'}`}
                                  </span>
                                )}
                              </div>

                              {/* Selesai Record & Selesaikan Proyek SAPA button for Done Column */}
                              {card.stage === 'done' && (
                                <div className="mt-2 pt-2 border-t border-slate-100/80 flex flex-col gap-1.5">
                                  {card.selesaiAt && (
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Selesai: {card.selesaiAt}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between gap-1.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenSelesaikanProyekModal(card);
                                      }}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition-colors cursor-pointer"
                                    >
                                      <Flag className="w-3 h-3 text-emerald-600" />
                                      <span>
                                        {card.proyekSapaStatus
                                          ? `Proyek SAPA: ${card.proyekSapaStatus}`
                                          : 'Selesaikan Proyek SAPA'}
                                      </span>
                                    </button>

                                    {card.proyekSapaKeterangan && (
                                      <span
                                        title={card.proyekSapaKeterangan}
                                        className="text-[10px] text-slate-400 truncate max-w-[110px]"
                                      >
                                        {card.proyekSapaKeterangan}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Row 3: Circular Avatar S, Kendala Badge, & subtle hover quick stage arrows */}
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-2">
                                <div
                                  title={card.picUtama ? `PIC: ${card.picUtama}` : 'SAPA'}
                                  className="w-8 h-8 rounded-full bg-[#657677] text-white font-medium text-sm flex items-center justify-center shrink-0 shadow-2xs select-none"
                                >
                                  {picInitial}
                                </div>

                                {card.kendala &&
                                  card.kendala.filter((k) => k.status !== 'Selesai').length > 0 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenKendalaModal(card);
                                      }}
                                      title="Terdapat kendala aktif. Klik untuk melihat atau mencatat kendala."
                                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                                    >
                                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                                      <span>
                                        {card.kendala.filter((k) => k.status !== 'Selesai').length} Kendala
                                      </span>
                                    </button>
                                  )}
                              </div>

                              {/* Subtle quick stage move controls (visible on hover) */}
                              <div
                                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {card.stage !== 'backlog' && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveStage(card.id, 'prev')}
                                    title="Pindahkan ke kolom sebelumnya"
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <MoveLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {card.stage !== 'done' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveStage(card.id, 'next')}
                                    title="Pindahkan ke kolom berikutnya"
                                    className="p-1 text-slate-400 hover:text-[#008d91] hover:bg-teal-50 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <MoveRight className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span
                                    title="Sudah Selesai"
                                    className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TABLE / LIST VIEW */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold bg-slate-50/50">
                <th className="py-3.5 px-4">Kode & Item Buku</th>
                <th className="py-3.5 px-4">Proyek SAPA (PNB)</th>
                <th className="py-3.5 px-4 text-center">Tahapan / Stage</th>
                <th className="py-3.5 px-4">Progress A-AJAK</th>
                <th className="py-3.5 px-4 text-center">Prioritas</th>
                <th className="py-3.5 px-4">PIC Tim PNB</th>
                <th className="py-3.5 px-4">Target Terbit</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada item yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const totalAjak = card.pekerjaanAjak.length;
                  const doneAjak = card.pekerjaanAjak.filter((a) => a.status === 'Selesai').length;
                  const percent = totalAjak > 0 ? Math.round((doneAjak / totalAjak) * 100) : 0;
                  const currentStageDef = KANBAN_COLUMNS.find((k) => k.id === card.stage);

                  return (
                    <tr
                      key={card.id}
                      onClick={() => {
                        setSelectedCardForDetail(card);
                        setDetailActiveTab('ajak');
                      }}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 font-mono text-[11px]">
                            {card.kodeItem || '-'}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#008d91] transition-colors block">
                              {card.namaItem}
                            </span>
                            {card.subNamaItem && (
                              <span className="text-[11px] text-slate-400 font-normal">
                                {card.subNamaItem}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">
                          {card.proyekSapaName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            currentStageDef?.badgeBg || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {currentStageDef?.title}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              {doneAjak}/{totalAjak} tugas
                            </span>
                            <span className="font-bold text-[#008d91]">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#008d91] h-full rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            card.prioritas === 'Tinggi'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : card.prioritas === 'Sedang'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {card.prioritas}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                        {card.picUtama}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {card.targetTerbit}
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenKendalaModal(card)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-amber-50 cursor-pointer"
                            title="Tulis / Lihat Kendala"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAddAjakModal(card)}
                            className="p-1.5 text-slate-400 hover:text-sky-700 rounded-lg hover:bg-sky-50 cursor-pointer"
                            title="Tambahkan A-AJAK (PIC & Waktu Mulai)"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenTriggerModal(card)}
                            className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg hover:bg-purple-50 cursor-pointer"
                            title="Atur Muncul di Not Started"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditTodoListModal(card)}
                            className="p-1.5 text-slate-400 hover:text-[#008d91] rounded-lg hover:bg-teal-50 cursor-pointer"
                            title="Edit Form To-Do List"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                          {card.stage === 'done' && (
                            <button
                              type="button"
                              onClick={() => handleOpenSelesaikanProyekModal(card)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 cursor-pointer"
                              title="Selesaikan Proyek SAPA"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCardForDetail(card);
                              setDetailActiveTab('ajak');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Rincian Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id, card.namaItem)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. TRACKER PROYEK SAPA VIEW (Summary per Proyek SAPA) */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {availableProjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">
                Tidak ada Proyek SAPA untuk {currentDivisi === 'ALL' ? 'Semua Divisi' : `Divisi ${currentDivisi}`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pilih divisi lain atau tambahkan proyek baru.
              </p>
              {currentDivisi !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => handleDivisiChange('ALL')}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#008d91] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Tampilkan Semua Divisi
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {availableProjects.map((project) => {
                const projectCards = cards.filter(
                  (c) => c.proyekSapaName.toLowerCase().trim() === project.nama.toLowerCase().trim()
                );

                const matchedOriginalProject = projectsList.find(
                  (p) =>
                    p.id === project.id ||
                    p.namaKegiatan.toLowerCase().trim() === project.nama.toLowerCase().trim()
                );

                const relatedTodos = project.id && projectTodos[project.id]
                  ? projectTodos[project.id]
                  : matchedOriginalProject && projectTodos[matchedOriginalProject.id]
                  ? projectTodos[matchedOriginalProject.id]
                  : [];

                let totalAjakProject = 0;
                let doneAjakProject = 0;
                projectCards.forEach((c) => {
                  c.pekerjaanAjak.forEach((a) => {
                    totalAjakProject += 1;
                    if (a.status === 'Selesai') doneAjakProject += 1;
                  });
                });

                const overallRate =
                  totalAjakProject > 0 ? Math.round((doneAjakProject / totalAjakProject) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4 hover:border-[#008d91]/40 transition-colors"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#008d91] border border-teal-200">
                            Divisi {project.divisi || currentDivisi}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              project.status.toLowerCase().includes('ongoing')
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg mt-1.5 leading-snug">
                          {project.nama}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Jadwal / Periode: {project.tanggal}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProyekFilter(project.nama);
                            setActiveTab('kanban');
                          }}
                          className="text-xs font-semibold text-[#008d91] hover:underline flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1.5 rounded-xl border border-teal-200 shadow-2xs"
                        >
                          <span>Buka Trello</span>
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Overall Progress Gauge */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600">Total Progres A-AJAK:</span>
                        <span className="font-black text-[#008d91] text-sm">{overallRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#008d91] h-full rounded-full transition-all"
                          style={{ width: `${overallRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>
                          {doneAjakProject} dari {totalAjakProject} tugas selesai
                        </span>
                        <span>{projectCards.length} Item buku dalam proses</span>
                      </div>
                    </div>

                    {/* To-Do List Integration Summary */}
                    {relatedTodos.length > 0 && (
                      <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-[#008d91] shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 block">
                              To-Do List Terintegrasi
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {relatedTodos.filter((t) => t.completed).length} dari {relatedTodos.length} task selesai
                            </span>
                          </div>
                        </div>

                        {onOpenFormTodoList && (
                          <button
                            type="button"
                            onClick={() => onOpenFormTodoList(matchedOriginalProject)}
                            className="text-[11px] font-bold text-[#008d91] hover:underline cursor-pointer"
                          >
                            Buka Form &rarr;
                          </button>
                        )}
                      </div>
                    )}

                    {/* Quick Cross-Tab Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
                      {onOpenFormTodoList && (
                        <button
                          type="button"
                          onClick={() => onOpenFormTodoList(matchedOriginalProject)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckSquare className="w-3 h-3 text-[#008d91]" />
                          <span>Form To-Do List</span>
                        </button>
                      )}
                      {onNavigateToKegiatan && (
                        <button
                          type="button"
                          onClick={onNavigateToKegiatan}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CalendarDays className="w-3 h-3 text-[#008d91]" />
                          <span>Kalender Kegiatan</span>
                        </button>
                      )}
                      {onNavigateToTimeline && (
                        <button
                          type="button"
                          onClick={onNavigateToTimeline}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3 h-3 text-[#008d91]" />
                          <span>Timeline Mingguan</span>
                        </button>
                      )}
                    </div>

                    {/* Mini Item List for This Project */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Item Buku & Materi yang Sedang Dibuat:
                      </span>
                      {projectCards.length === 0 ? (
                        <div className="p-3 bg-slate-50/50 rounded-xl text-center text-xs text-slate-400">
                          Belum ada item ongoing untuk proyek ini
                        </div>
                      ) : (
                        projectCards.map((card) => {
                          const stageDef = KANBAN_COLUMNS.find((k) => k.id === card.stage);
                          return (
                            <div
                              key={card.id}
                              onClick={() => {
                                setSelectedCardForDetail(card);
                                setDetailActiveTab('ajak');
                              }}
                              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-[#008d91]/40 hover:bg-slate-50/50 transition-all cursor-pointer text-xs"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="font-bold text-slate-800 truncate">
                                  {card.namaItem}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  PIC: {card.picUtama} · Target: {card.targetTerbit}
                                </div>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                                  stageDef?.badgeBg || 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {stageDef?.title}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL DETAIL & EDIT PEKERJAAN A-AJAK */}
      {selectedCardForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/40">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#008d91] border border-teal-200">
                    {selectedCardForDetail.proyekSapaName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      KANBAN_COLUMNS.find((k) => k.id === selectedCardForDetail.stage)?.badgeBg
                    }`}
                  >
                    Tahapan: {KANBAN_COLUMNS.find((k) => k.id === selectedCardForDetail.stage)?.title}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1.5 leading-snug">
                  {selectedCardForDetail.namaItem}
                </h2>
                {selectedCardForDetail.subNamaItem && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedCardForDetail.subNamaItem}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedCardForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Stage Controls Header Bar */}
            <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-xs overflow-x-auto gap-2">
              <span className="text-slate-500 font-semibold whitespace-nowrap">
                Pindahkan Tahapan:
              </span>
              <div className="flex items-center gap-1.5">
                {KANBAN_COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleSetStageDirectly(selectedCardForDetail.id, col.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCardForDetail.stage === col.id
                        ? 'bg-[#008d91] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                    }`}
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDetailActiveTab('ajak')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'ajak'
                    ? 'border-[#008d91] text-[#008d91]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Pekerjaan A-AJAK ({selectedCardForDetail.pekerjaanAjak.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailActiveTab('checklist')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'checklist'
                    ? 'border-[#008d91] text-[#008d91]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Checklist To-Do ({selectedCardForDetail.checklists.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailActiveTab('info')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'info'
                    ? 'border-[#008d91] text-[#008d91]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Info Item & Naskah</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailActiveTab('kendala')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'kendala'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Kendala ({selectedCardForDetail.kendala?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailActiveTab('todos')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'todos'
                    ? 'border-[#008d91] text-[#008d91]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>To-Do List & Integrasi</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* TAB 1: PEKERJAAN A-AJAK */}
              {detailActiveTab === 'ajak' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Daftar Pekerjaan A-AJAK Divisi PNB
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Klik status pekerjaan untuk mengganti alur pengerjaan
                      </p>
                    </div>

                    <span className="text-xs font-bold text-[#008d91] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {selectedCardForDetail.pekerjaanAjak.filter((a) => a.status === 'Selesai').length} /{' '}
                      {selectedCardForDetail.pekerjaanAjak.length} Selesai
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedCardForDetail.pekerjaanAjak.map((ajak, idx) => (
                      <div
                        key={ajak.id}
                        className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 text-xs sm:text-sm">
                              {ajak.namaPekerjaan}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-semibold text-slate-600">
                                Kategori: {ajak.kategori}
                              </span>
                              <span>·</span>
                              <span className="text-slate-600">PIC: {ajak.pic}</span>
                              {ajak.targetSelesai && (
                                <>
                                  <span>·</span>
                                  <span>Target: {ajak.targetSelesai}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleAjakStatus(selectedCardForDetail.id, ajak.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto ${
                            ajak.status === 'Selesai'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : ajak.status === 'Sedang Berjalan'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : ajak.status === 'Menunggu Review'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {ajak.status} ↻
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New A-AJAK Job Input Row */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.currentTarget;
                      const inputJob = (target.elements.namedItem('jobTitle') as HTMLInputElement).value;
                      const inputPic = (target.elements.namedItem('jobPic') as HTMLInputElement).value;
                      const inputKat = (target.elements.namedItem('jobCategory') as HTMLSelectElement).value as any;
                      handleAddAjakToCard(selectedCardForDetail.id, inputJob, inputPic, inputKat);
                      target.reset();
                    }}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 mt-4"
                  >
                    <span className="text-xs font-bold text-slate-700 block">
                      + Tambah Pekerjaan A-AJAK Baru:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        name="jobTitle"
                        type="text"
                        placeholder="Nama pekerjaan (misal: Pengecekan Font, Cetak Dummy...)"
                        required
                        className="sm:col-span-6 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                      />
                      <input
                        name="jobPic"
                        type="text"
                        placeholder="PIC (e.g. Silvia Fukada)"
                        defaultValue={selectedCardForDetail.picUtama}
                        className="sm:col-span-3 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                      />
                      <select
                        name="jobCategory"
                        defaultValue="Naskah"
                        className="sm:col-span-3 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                      >
                        <option value="Naskah">Naskah</option>
                        <option value="Desain">Desain</option>
                        <option value="Legal/ISBN">Legal/ISBN</option>
                        <option value="Produksi">Produksi</option>
                        <option value="Distribusi">Distribusi</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#008d91] hover:bg-[#007b7f] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Simpan Pekerjaan A-AJAK
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: CHECKLIST */}
              {detailActiveTab === 'checklist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Checklist To-Do Penerbitan</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Centang setiap item yang sudah diselesaikan oleh tim PNB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedCardForDetail.checklists.map((chk) => (
                      <div
                        key={chk.id}
                        onClick={() => handleToggleChecklist(selectedCardForDetail.id, chk.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          chk.completed
                            ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                            : 'bg-white border-slate-100 hover:border-slate-200 text-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#008d91] cursor-pointer"
                        />
                        <span
                          className={`text-xs sm:text-sm font-medium flex-1 ${
                            chk.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {chk.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Checklist Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.currentTarget;
                      const input = (target.elements.namedItem('checkTitle') as HTMLInputElement).value;
                      handleAddChecklistToCard(selectedCardForDetail.id, input);
                      target.reset();
                    }}
                    className="flex items-center gap-2 pt-2"
                  >
                    <input
                      name="checkTitle"
                      type="text"
                      placeholder="Tambah item checklist baru..."
                      required
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#008d91] hover:bg-[#007b7f] text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Tambah
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: INFO ITEM */}
              {detailActiveTab === 'info' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-medium block">Kode Item:</span>
                      <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                        {selectedCardForDetail.kodeItem || '-'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-medium block">PIC Utama:</span>
                      <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                        {selectedCardForDetail.picUtama}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-medium block">Target Terbit:</span>
                      <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                        {selectedCardForDetail.targetTerbit}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-medium block">Estimasi Oplah:</span>
                      <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                        {selectedCardForDetail.targetEksemplar
                          ? `${selectedCardForDetail.targetEksemplar.toLocaleString('id-ID')} Eksemplar`
                          : '-'}
                      </span>
                    </div>

                    {selectedCardForDetail.tanggalMulaiAjak && (
                      <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                        <span className="text-sky-600 font-medium block">Mulai Pengerjaan A-AJAK:</span>
                        <span className="text-sky-950 font-bold text-sm mt-0.5 block">
                          {selectedCardForDetail.tanggalMulaiAjak}
                        </span>
                      </div>
                    )}

                    {selectedCardForDetail.selesaiAt && (
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="text-emerald-600 font-medium block">Waktu Selesai To-Do List:</span>
                        <span className="text-emerald-950 font-bold text-sm mt-0.5 block">
                          {selectedCardForDetail.selesaiAt}
                        </span>
                      </div>
                    )}

                    {selectedCardForDetail.proyekSapaStatus && (
                      <div className="col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Status Akhir Proyek SAPA:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${selectedCardForDetail.proyekSapaStatus === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {selectedCardForDetail.proyekSapaStatus}
                          </span>
                        </div>
                        {selectedCardForDetail.proyekSapaKeterangan && (
                          <p className="mt-1 text-slate-700 text-xs">
                            Keterangan: {selectedCardForDetail.proyekSapaKeterangan}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedCardForDetail.linkNaskah && (
                    <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-sky-600" />
                        <span className="text-sky-900 font-semibold truncate max-w-sm">
                          {selectedCardForDetail.linkNaskah}
                        </span>
                      </div>
                      <a
                        href={selectedCardForDetail.linkNaskah}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-sky-700 hover:underline shrink-0"
                      >
                        Buka Draft Naskah
                      </a>
                    </div>
                  )}

                  {selectedCardForDetail.catatan && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-medium block mb-1">Catatan PNB:</span>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedCardForDetail.catatan}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTodoListModal(selectedCardForDetail)}
                      className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-[#008d91] rounded-xl text-xs font-bold border border-teal-200 cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Edit Form To-Do List</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: KENDALA & HAMBATAN */}
              {detailActiveTab === 'kendala' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Kendala & Hambatan Pengerjaan
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Daftar kendala yang dilaporkan pada item ini
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenKendalaModal(selectedCardForDetail)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tulis Kendala Baru</span>
                    </button>
                  </div>

                  {(!selectedCardForDetail.kendala || selectedCardForDetail.kendala.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Belum Ada Kendala</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pengerjaan item ini berlangsung lancar tanpa kendala terbuka.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenKendalaModal(selectedCardForDetail)}
                        className="mt-3 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + Tulis Kendala Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCardForDetail.kendala.map((k) => (
                        <div
                          key={k.id}
                          className={`p-3.5 rounded-2xl border ${
                            k.status === 'Selesai'
                              ? 'bg-emerald-50/30 border-emerald-200/60'
                              : k.status === 'Sedang Ditangani'
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-rose-50/30 border-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  k.status === 'Selesai'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : k.status === 'Sedang Ditangani'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {k.status}
                              </span>
                              {k.kategori && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {k.kategori}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{k.tanggal}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenKendalaModal(selectedCardForDetail)}
                              className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                            >
                              Kelola Kendala →
                            </button>
                          </div>

                          <h5 className="font-bold text-slate-800 text-xs sm:text-sm">
                            {k.judul}
                          </h5>
                          <p className="text-slate-600 mt-1 leading-relaxed whitespace-pre-line text-xs">
                            {k.deskripsi}
                          </p>

                          {k.solusi && (
                            <div className="mt-2 p-2 rounded-xl bg-white/80 border border-slate-200/60 text-xs">
                              <span className="font-bold text-slate-700 block text-[11px]">
                                Solusi:
                              </span>
                              <p className="text-slate-600 mt-0.5 text-[11px]">
                                {k.solusi}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: TO-DO LIST & INTEGRASI */}
              {detailActiveTab === 'todos' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        To-Do List Terkait: {selectedCardForDetail.proyekSapaName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tugas dari Form To-Do List yang terintegrasi dengan Proyek SAPA & Kalender
                      </p>
                    </div>

                    {onOpenFormTodoList && (
                      <button
                        type="button"
                        onClick={() => {
                          const matchedProj = projectsList.find(
                            (p) =>
                              p.nama === selectedCardForDetail.proyekSapaName ||
                              p.id === selectedCardForDetail.proyekSapaId
                          );
                          onOpenFormTodoList(matchedProj);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#008d91] text-white text-xs font-bold cursor-pointer hover:bg-[#007b7f] transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Buka Form To-Do List</span>
                      </button>
                    )}
                  </div>

                  {/* Cross-tab shortcut badges */}
                  <div className="flex items-center gap-2 flex-wrap p-3 rounded-2xl bg-teal-50/60 border border-teal-100">
                    <span className="text-[11px] font-bold text-slate-600">Integrasi Cepat:</span>
                    {onNavigateToKegiatan && (
                      <button
                        type="button"
                        onClick={onNavigateToKegiatan}
                        className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-[#008d91] font-semibold text-xs hover:bg-teal-50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CalendarDays className="w-3 h-3 text-[#008d91]" />
                        <span>Kalender Kegiatan</span>
                      </button>
                    )}
                    {onNavigateToTimeline && (
                      <button
                        type="button"
                        onClick={onNavigateToTimeline}
                        className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-[#008d91] font-semibold text-xs hover:bg-teal-50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-[#008d91]" />
                        <span>Kegiatan vs Timeline</span>
                      </button>
                    )}
                  </div>

                  {/* List of Tasks from projectTodos */}
                  {(() => {
                    const matchedProj = projectsList.find(
                      (p) =>
                        p.nama === selectedCardForDetail.proyekSapaName ||
                        p.id === selectedCardForDetail.proyekSapaId
                    );
                    const taskList =
                      selectedCardForDetail.proyekSapaId &&
                      projectTodos[selectedCardForDetail.proyekSapaId]
                        ? projectTodos[selectedCardForDetail.proyekSapaId]
                        : matchedProj && projectTodos[matchedProj.id]
                        ? projectTodos[matchedProj.id]
                        : [];

                    if (taskList.length === 0) {
                      return (
                        <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-slate-500 font-semibold">
                            Belum ada task to-do list untuk proyek "{selectedCardForDetail.proyekSapaName}".
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Buka Form To-Do List untuk menambahkan tugas atau sub-task.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {taskList.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              task.completed
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 text-white text-[10px] ${
                                    task.completed ? 'bg-emerald-500' : 'bg-slate-200 text-slate-400'
                                  }`}
                                >
                                  {task.completed && <Check className="w-3 h-3" />}
                                </span>
                                <div>
                                  <h5
                                    className={`font-bold text-xs sm:text-sm ${
                                      task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                                    }`}
                                  >
                                    {task.title}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                                    <span>Deadline: {task.deadline || '-'}</span>
                                    {task.assignedEmployeeName && (
                                      <span>· PIC: {task.assignedEmployeeName}</span>
                                    )}
                                    {task.subTasks && task.subTasks.length > 0 && (
                                      <span>
                                        · {task.subTasks.filter((st) => st.completed).length}/
                                        {task.subTasks.length} Sub-task
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  task.completed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {task.completed ? 'Selesai' : 'Aktif'}
                              </span>
                            </div>

                            {/* Sub-tasks if any */}
                            {task.subTasks && task.subTasks.length > 0 && (
                              <div className="mt-2.5 pl-6 space-y-1.5 pt-2 border-t border-slate-100">
                                {task.subTasks.map((st) => (
                                  <div
                                    key={st.id}
                                    className="flex items-center justify-between text-[11px] text-slate-600"
                                  >
                                    <span className={st.completed ? 'line-through text-slate-400' : ''}>
                                      • {st.title}
                                    </span>
                                    <span
                                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                        st.completed
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      {st.completed ? 'Selesai' : 'Belum'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCard(selectedCardForDetail.id, selectedCardForDetail.namaItem)
                  }
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hapus Kartu
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenKendalaModal(selectedCardForDetail)}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tulis Kendala</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddAjakModal(selectedCardForDetail)}
                  className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-sky-600" />
                  <span>Tambahkan A-AJAK</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEditTodoListModal(selectedCardForDetail)}
                  className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-[#008d91] border border-teal-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Edit Form To-Do List</span>
                </button>
                {selectedCardForDetail.stage === 'done' && (
                  <button
                    type="button"
                    onClick={() => handleOpenSelesaikanProyekModal(selectedCardForDetail)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {selectedCardForDetail.proyekSapaStatus
                        ? `Proyek SAPA: ${selectedCardForDetail.proyekSapaStatus}`
                        : 'Selesaikan Proyek SAPA'}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedCardForDetail.stage === 'done' && onNavigateToItemSalur && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCardForDetail(null);
                      onNavigateToItemSalur();
                      onShowToast(`Mengarahkan ke Katalog Item S-SALUR`);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Lihat di Katalog S-SALUR</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCardForDetail(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL TAMBAH ONGOING ITEM / A-AJAK BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Tambah Ongoing Create Item S-SALUR
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set pekerjaan A-AJAK untuk item buku / materi pada Proyek SAPA Divisi PNB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCard} className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Proyek SAPA PNB */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Proyek SAPA (Divisi PNB) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newProyekSapa}
                  onChange={(e) => setNewProyekSapa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#008d91]"
                >
                  <option value="">-- Pilih Proyek SAPA Divisi PNB --</option>
                  {pnbProjects.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Item & Kode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Item Buku / Materi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newNamaItem}
                    onChange={(e) => setNewNamaItem(e.target.value)}
                    placeholder="Contoh: Buku Panduan Meditasi Vipassana"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kode Item</label>
                  <input
                    type="text"
                    value={newKodeItem}
                    onChange={(e) => setNewKodeItem(e.target.value)}
                    placeholder="Contoh: B-046"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Sub-Nama Item */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sub-Judul / Keterangan Seri
                </label>
                <input
                  type="text"
                  value={newSubNamaItem}
                  onChange={(e) => setNewSubNamaItem(e.target.value)}
                  placeholder="Contoh: Edisi Pembelajaran Mandiri untuk Pemula"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                />
              </div>

              {/* PIC, Prioritas, Tahapan, Target Terbit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PIC Tim PNB</label>
                  <input
                    type="text"
                    value={newPicUtama}
                    onChange={(e) => setNewPicUtama(e.target.value)}
                    placeholder="Silvia Fukada"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahapan / Kolom</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as OngoingStage)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Prioritas</label>
                  <select
                    value={newPrioritas}
                    onChange={(e) => setNewPrioritas(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  >
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Terbit</label>
                  <input
                    type="text"
                    value={newTargetTerbit}
                    onChange={(e) => setNewTargetTerbit(e.target.value)}
                    placeholder="Contoh: 25 Des 2021"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Link Naskah & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Link Draft Naskah (Docs / Drive)
                  </label>
                  <input
                    type="url"
                    value={newLinkNaskah}
                    onChange={(e) => setNewLinkNaskah(e.target.value)}
                    placeholder="https://docs.google.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Oplah / Eksemplar
                  </label>
                  <input
                    type="number"
                    value={newTargetEksemplar}
                    onChange={(e) =>
                      setNewTargetEksemplar(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="1000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Tanggal Mulai A-AJAK & Syarat Muncul di Not Started */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    A-AJAK Mulai Mengerjakan Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={newTanggalMulaiAjak}
                    onChange={(e) => setNewTanggalMulaiAjak(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mulai Muncul di Not Started Setelah To-Do List Selesai
                  </label>
                  <select
                    value={newDependsOnCardId}
                    onChange={(e) => setNewDependsOnCardId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  >
                    <option value="">-- Langsung Muncul Normal (Tanpa Prasyarat) --</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.kodeItem ? `${c.kodeItem} - ` : ''}{c.namaItem} ({c.stage === 'done' ? 'Selesai' : 'Sedang Proses'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Presets Button for A-AJAK */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Pekerjaan A-AJAK ({newPekerjaanAjakList.length} tugas)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Alur pekerjaan penerbitan divisi PNB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyPresetAjak}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#008d91] hover:bg-teal-100 text-[11px] font-bold border border-teal-200 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Gunakan Alur Standar</span>
                </button>
              </div>

              {/* List of A-AJAK in form */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {newPekerjaanAjakList.map((a, idx) => (
                  <div
                    key={a.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-700 font-medium truncate max-w-xs">
                      {idx + 1}. {a.namaPekerjaan}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      PIC: {a.pic}
                    </span>
                  </div>
                ))}
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7f] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Item ke Trello
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL EDIT FORM TO-DO LIST */}
      {isEditModalOpen && editingCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#008d91] flex items-center justify-center shrink-0">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Edit Form To-Do List
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Perbarui data To-Do List & Proyek SAPA untuk item ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCard(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditTodoList} className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Proyek SAPA PNB */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Proyek SAPA (Divisi PNB) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editProyekSapa}
                  onChange={(e) => setEditProyekSapa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#008d91]"
                >
                  <option value="">-- Pilih Proyek SAPA Divisi PNB --</option>
                  {pnbProjects.map((p) => (
                    <option key={p.id} value={p.nama}>
                      {p.nama}
                    </option>
                  ))}
                  {editProyekSapa && !pnbProjects.some((p) => p.nama === editProyekSapa) && (
                    <option value={editProyekSapa}>{editProyekSapa}</option>
                  )}
                </select>
              </div>

              {/* Nama Item & Kode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Item / Judul To-Do List <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editNamaItem}
                    onChange={(e) => setEditNamaItem(e.target.value)}
                    placeholder="Contoh: Buku Renungan Harian Dharma"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kode Item</label>
                  <input
                    type="text"
                    value={editKodeItem}
                    onChange={(e) => setEditKodeItem(e.target.value)}
                    placeholder="Contoh: B-046"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Sub-Nama Item */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sub-Judul / Keterangan Seri
                </label>
                <input
                  type="text"
                  value={editSubNamaItem}
                  onChange={(e) => setEditSubNamaItem(e.target.value)}
                  placeholder="Contoh: Petikan Sutra & Komentar untuk Latihan Sehari-hari"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                />
              </div>

              {/* PIC, Tahapan, Prioritas, Target Terbit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PIC Tim PNB</label>
                  <input
                    type="text"
                    value={editPicUtama}
                    onChange={(e) => setEditPicUtama(e.target.value)}
                    placeholder="Silvia Fukada"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahapan / Kolom</label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as OngoingStage)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Prioritas</label>
                  <select
                    value={editPrioritas}
                    onChange={(e) => setEditPrioritas(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  >
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Terbit</label>
                  <input
                    type="text"
                    value={editTargetTerbit}
                    onChange={(e) => setEditTargetTerbit(e.target.value)}
                    placeholder="Contoh: 20 Mei 2022"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Estimasi Halaman & Target Eksemplar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estimasi Tebal Halaman
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editEstimasiHalaman}
                    onChange={(e) =>
                      setEditEstimasiHalaman(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="Contoh: 180"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Oplah (Eksemplar)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editTargetEksemplar}
                    onChange={(e) =>
                      setEditTargetEksemplar(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="Contoh: 3000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Link Naskah */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Link Naskah / Dokumen Kerja
                </label>
                <input
                  type="text"
                  value={editLinkNaskah}
                  onChange={(e) => setEditLinkNaskah(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Form To-Do List
                </label>
                <textarea
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  rows={2}
                  placeholder="Catatan pengerjaan, instruksi editor, catatan percetakan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91] resize-none"
                />
              </div>

              {/* Tanggal Mulai A-AJAK & Syarat Muncul di Not Started */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    A-AJAK Mulai Mengerjakan Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={editTanggalMulaiAjak}
                    onChange={(e) => setEditTanggalMulaiAjak(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mulai Muncul di Not Started Setelah To-Do List Selesai
                  </label>
                  <select
                    value={editDependsOnCardId}
                    onChange={(e) => setEditDependsOnCardId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  >
                    <option value="">-- Langsung Muncul Normal (Tanpa Prasyarat) --</option>
                    {cards
                      .filter((c) => c.id !== editingCard.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.kodeItem ? `${c.kodeItem} - ` : ''}{c.namaItem} ({c.stage === 'done' ? 'Selesai' : 'Sedang Proses'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCard(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7f] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL TULIS KENDALA */}
      {isKendalaModalOpen && kendalaCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-amber-50/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {kendalaCard.proyekSapaName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {kendalaCard.kendala?.length || 0} Total Kendala
                    </span>
                    {kendalaCard.kendala &&
                      kendalaCard.kendala.filter((k) => k.status !== 'Selesai').length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {kendalaCard.kendala.filter((k) => k.status !== 'Selesai').length} Aktif
                        </span>
                      )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1">
                    Tulis & Catat Kendala
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Item: <span className="font-semibold text-slate-700">{kendalaCard.namaItem}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsKendalaModalOpen(false);
                  setKendalaCard(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
              {/* Form Tulis Kendala Baru */}
              <div className="p-4 sm:p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Form Tulis Kendala Baru</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Catat hambatan pengerjaan
                  </span>
                </div>

                <form onSubmit={handleAddKendala} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Judul Kendala / Hambatan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={kendalaJudul}
                      onChange={(e) => setKendalaJudul(e.target.value)}
                      placeholder="Contoh: Keterlambatan proofreading istilah Sanskrit bab 4..."
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                      <select
                        value={kendalaKategori}
                        onChange={(e) => setKendalaKategori(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                      >
                        <option value="Naskah">Naskah & Konten</option>
                        <option value="Desain & Layout">Desain & Layout</option>
                        <option value="Percetakan & ISBN">Percetakan & ISBN</option>
                        <option value="Anggaran / Administrasi">Anggaran / Administrasi</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status Awal</label>
                      <select
                        value={kendalaStatus}
                        onChange={(e) => setKendalaStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                      >
                        <option value="Open">Open (Belum Selesai)</option>
                        <option value="Sedang Ditangani">Sedang Ditangani</option>
                        <option value="Selesai">Selesai / Teratasi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        PIC / Pelapor
                      </label>
                      <input
                        type="text"
                        value={kendalaPelapor}
                        onChange={(e) => setKendalaPelapor(e.target.value)}
                        placeholder="Silvia Fukada"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Deskripsi Kendala <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={kendalaDeskripsi}
                      onChange={(e) => setKendalaDeskripsi(e.target.value)}
                      rows={2}
                      placeholder="Jelaskan kendala, akar masalah, atau bagian pekerjaan yang terhambat..."
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Rencana Tindakan / Solusi
                    </label>
                    <textarea
                      value={kendalaSolusi}
                      onChange={(e) => setKendalaSolusi(e.target.value)}
                      rows={2}
                      placeholder="Langkah penyelesaian, PIC tindak lanjut, atau target penyelesaian kendala..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Simpan Kendala</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Daftar Kendala Tercatat */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span>Kendala Tercatat</span>
                    <span className="text-xs font-bold text-slate-400">
                      ({kendalaCard.kendala?.length || 0})
                    </span>
                  </h4>
                </div>

                {(!kendalaCard.kendala || kendalaCard.kendala.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Belum Ada Kendala</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Item ini belum memiliki kendala yang dilaporkan. Gunakan formulir di atas untuk mencatat kendala.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {kendalaCard.kendala.map((k) => {
                      const isDone = k.status === 'Selesai';
                      const isInProgress = k.status === 'Sedang Ditangani';

                      return (
                        <div
                          key={k.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isDone
                              ? 'bg-emerald-50/30 border-emerald-200/60'
                              : isInProgress
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-rose-50/30 border-rose-200'
                          }`}
                        >
                          {/* Row 1: Badges & Date & Delete */}
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isInProgress
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {k.status}
                              </span>

                              {k.kategori && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {k.kategori}
                                </span>
                              )}

                              <span className="text-[10px] text-slate-400">{k.tanggal}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Status switch buttons */}
                              {!isDone ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleKendalaStatus(k.id, 'Selesai')}
                                  title="Tandai Selesai"
                                  className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Tandai Selesai</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleKendalaStatus(k.id, 'Open')}
                                  title="Buka Kembali Kendala"
                                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Buka Kembali</span>
                                </button>
                              )}

                              {!isInProgress && !isDone && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleKendalaStatus(k.id, 'Sedang Ditangani')}
                                  title="Tandai Sedang Ditangani"
                                  className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Tangani
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteKendala(k.id)}
                                title="Hapus Kendala"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Judul & Deskripsi */}
                          <h5 className="font-bold text-slate-800 text-xs sm:text-sm">
                            {k.judul}
                          </h5>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                            {k.deskripsi}
                          </p>

                          {/* Solusi */}
                          {k.solusi && (
                            <div className="mt-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-xs">
                              <span className="font-bold text-slate-700 block text-[11px]">
                                Solusi / Tindak Lanjut:
                              </span>
                              <p className="text-slate-600 mt-0.5 whitespace-pre-line text-[11px]">
                                {k.solusi}
                              </p>
                            </div>
                          )}

                          {/* Pelapor */}
                          {k.pelapor && (
                            <div className="mt-2 text-[10px] text-slate-400 font-medium">
                              Pelapor: <span className="text-slate-600">{k.pelapor}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsKendalaModalOpen(false);
                  setKendalaCard(null);
                }}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL TAMBAHKAN A-AJAK (Atur PIC To-Do List & Waktu Mulai Pengerjaan) */}
      {isAddAjakModalOpen && ajakModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Tambahkan A-AJAK
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    Atur PIC To-Do List & waktu mulai pengerjaan untuk: {ajakModalCard.namaItem}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddAjakModalOpen(false);
                  setAjakModalCard(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAddAjak} className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Bagian 1: PIC To-Do List & Jadwal Mulai */}
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
                <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>PIC To-Do List & Jadwal Mulai A-AJAK</span>
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    PIC To-Do List (Dari Form To-Do List) <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={ajakPicTodoList}
                      onChange={(e) => {
                        setAjakPicTodoList(e.target.value);
                        if (e.target.value !== '__custom__') setAjakCustomPic('');
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#008d91]"
                    >
                      {[
                        'Silvia Fukada',
                        'Budi Santoso',
                        'Bhikshu Bhadra',
                        'Rian Ilustrator',
                        'Hendra Layout',
                        'Ven. Thitaviro',
                        'Admin PNB',
                        'Tim Telaah PNB',
                        'Tim Penulis PNB',
                        'Percetakan Gramasurya',
                        'Percetakan Mahameru',
                        'Logistik PNB',
                      ]
                        .concat(
                          cards
                            .map((c) => c.picUtama)
                            .filter(
                              (p) =>
                                p &&
                                ![
                                  'Silvia Fukada',
                                  'Budi Santoso',
                                  'Bhikshu Bhadra',
                                  'Rian Ilustrator',
                                  'Hendra Layout',
                                  'Ven. Thitaviro',
                                  'Admin PNB',
                                  'Tim Telaah PNB',
                                  'Tim Penulis PNB',
                                  'Percetakan Gramasurya',
                                  'Percetakan Mahameru',
                                  'Logistik PNB',
                                ].includes(p)
                            )
                        )
                        .map((pic) => (
                          <option key={pic} value={pic}>
                            {pic}
                          </option>
                        ))}
                      <option value="__custom__">+ Input Nama PIC Lainnya...</option>
                    </select>

                    {ajakPicTodoList === '__custom__' && (
                      <input
                        type="text"
                        value={ajakCustomPic}
                        onChange={(e) => setAjakCustomPic(e.target.value)}
                        placeholder="Ketik nama PIC To-Do List baru..."
                        required
                        className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    A-AJAK Mulai Mengerjakan To-Do List Dari Kapan: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={ajakStartDate}
                    onChange={(e) => setAjakStartDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tanggal resmi tim A-AJAK mulai memproses dan mengerjakan item To-Do List ini.
                  </p>
                </div>
              </div>

              {/* Bagian 2: Tambah Tugas A-AJAK Baru */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#008d91]" />
                    <span>Tambah Pekerjaan A-AJAK Spesifik (Opsional)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Kosongkan jika hanya ingin update PIC/waktu</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Pekerjaan A-AJAK</label>
                  <input
                    type="text"
                    value={ajakNamaPekerjaan}
                    onChange={(e) => setAjakNamaPekerjaan(e.target.value)}
                    placeholder="Contoh: Layouting Bab 1-4, Koreksi Aksara, Cetak Dummy..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                    <select
                      value={ajakKategori}
                      onChange={(e) => setAjakKategori(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                    >
                      <option value="Naskah">Naskah</option>
                      <option value="Desain">Desain</option>
                      <option value="Legal/ISBN">Legal/ISBN</option>
                      <option value="Produksi">Produksi</option>
                      <option value="Distribusi">Distribusi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Selesai</label>
                    <input
                      type="date"
                      value={ajakTargetSelesai}
                      onChange={(e) => setAjakTargetSelesai(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Status Awal</label>
                    <select
                      value={ajakStatus}
                      onChange={(e) => setAjakStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                    >
                      <option value="Belum Mulai">Belum Mulai</option>
                      <option value="Sedang Berjalan">Sedang Berjalan</option>
                      <option value="Menunggu Review">Menunggu Review</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Pekerjaan</label>
                  <input
                    type="text"
                    value={ajakKeterangan}
                    onChange={(e) => setAjakKeterangan(e.target.value)}
                    placeholder="Instruksi tambahan bagi tim yang ditugaskan..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              {/* Bagian 3: Daftar Pekerjaan A-AJAK Terdaftar */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Pekerjaan A-AJAK Terdaftar ({ajakModalCard.pekerjaanAjak.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Telah tersimpan pada kartu ini</span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {ajakModalCard.pekerjaanAjak.map((aj, idx) => (
                    <div
                      key={aj.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 block truncate">
                          {idx + 1}. {aj.namaPekerjaan}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PIC: {aj.pic} · {aj.kategori} · Target: {aj.targetSelesai || '-'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          aj.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : aj.status === 'Sedang Berjalan'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {aj.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAjakModalOpen(false);
                    setAjakModalCard(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7f] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Pengaturan A-AJAK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. MODAL ATUR MUNCUL DI NOT STARTED (Ketergantungan Prasyarat) */}
      {isTriggerModalOpen && triggerModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Atur Muncul di Not Started
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    Syarat otomatis untuk: {triggerModalCard.namaItem}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTriggerModalOpen(false);
                  setTriggerModalCard(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTriggerModal} className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                <p className="font-semibold">
                  Kartu to-do list ini baru mulai muncul di kolom <span className="font-bold underline">Not Started</span> setelah to-do list tertentu yang Anda tentukan masuk ke kolom <span className="font-bold underline">Selesai</span>.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilih To-Do List Prasyarat (Harus Selesai Lebih Dulu)
                </label>
                <select
                  value={triggerDependsOnCardId}
                  onChange={(e) => setTriggerDependsOnCardId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#008d91]"
                >
                  <option value="">-- Tidak Ada Prasyarat (Langsung Muncul Normal) --</option>
                  {cards
                    .filter((c) => c.id !== triggerModalCard.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.kodeItem ? `${c.kodeItem} - ` : ''}{c.namaItem} (Tahap: {c.stage === 'done' ? 'Selesai' : c.stage})
                      </option>
                    ))}
                </select>
              </div>

              {/* Info kartu prasyarat yang dipilih */}
              {triggerDependsOnCardId && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Status Prasyarat Terpilih:</span>
                  {(() => {
                    const sel = cards.find((c) => c.id === triggerDependsOnCardId);
                    if (!sel) return <span className="text-slate-400">Kartu tidak ditemukan</span>;
                    const isDone = sel.stage === 'done';
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{sel.namaItem}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isDone ? 'Sudah Selesai' : 'Belum Selesai'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {isDone
                            ? 'Prasyarat telah selesai! Kartu ini sudah memenuhi syarat dan siap berada di Not Started.'
                            : 'Saat kartu tersebut dipindahkan ke kolom "Selesai", kartu ini akan otomatis dipromosikan ke kolom "Not Started".'}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsTriggerModalOpen(false);
                    setTriggerModalCard(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Aturan Prasyarat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. POP UP SELESAIKAN PROYEK SAPA (Selesai/Batal dan Keterangan) */}
      {isSelesaikanProyekModalOpen && resolvingProyekCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Selesaikan Proyek SAPA
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    Proyek: {resolvingProyekCard.proyekSapaName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSelesaikanProyekModalOpen(false);
                  setResolvingProyekCard(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSelesaikanProyek} className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950">
                <p className="font-semibold">
                  To-Do List <span className="font-bold underline">"{resolvingProyekCard.namaItem}"</span> telah masuk ke kolom <strong>Selesai</strong>.
                </p>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Tentukan apakah Proyek SAPA ini ditandai sebagai <strong>Selesai</strong> atau <strong>Batal</strong> beserta keterangannya.
                </p>
              </div>

              {/* Pilihan: Selesai / Batal */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Status Proyek SAPA <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResolvingProyekStatus('Selesai')}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      resolvingProyekStatus === 'Selesai'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        resolvingProyekStatus === 'Selesai'
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {resolvingProyekStatus === 'Selesai' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block">Selesai</span>
                      <span className="text-[10px] text-slate-400 block">Proyek berhasil tuntas</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolvingProyekStatus('Batal')}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      resolvingProyekStatus === 'Batal'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        resolvingProyekStatus === 'Batal'
                          ? 'border-rose-600 bg-rose-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {resolvingProyekStatus === 'Batal' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs block">Batal</span>
                      <span className="text-[10px] text-slate-400 block">Proyek tidak dilanjutkan</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Keterangan Proyek SAPA <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={resolvingProyekKeterangan}
                  onChange={(e) => setResolvingProyekKeterangan(e.target.value)}
                  rows={3}
                  required
                  placeholder="Tuliskan keterangan mengenai penyelesaian atau alasan pembatalan Proyek SAPA ini..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91] resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSelesaikanProyekModalOpen(false);
                    setResolvingProyekCard(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Lewati / Nanti Saja
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Status Proyek SAPA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
