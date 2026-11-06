import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Globe,
  MoreVertical,
  X,
  Check,
  Trash2,
  Edit2,
  Users,
  MessageSquare,
  FolderPlus,
  FolderInput,
  Heart,
  Star,
  BookOpen,
  Gift,
  Smile,
  Briefcase,
  PhoneCall,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { FunnelingActionBar } from './FunnelingActionBar';
import {
  FunnelingGroupCard,
  FunnelingMemberItem,
  loadFunnelingMembers,
  saveFunnelingMembers,
  loadFunnelingGroups,
  saveFunnelingGroups,
  loadJenisGroupFunneling,
  JenisGroupFunnelingItem,
} from '../funnelingData';
import { IdentitasItem } from '../identitasData';

const AVAILABLE_ICONS = [
  { id: 'cart', label: 'Toko / Donasi', icon: ShoppingCart },
  { id: 'globe', label: 'Global / Web', icon: Globe },
  { id: 'users', label: 'Komunitas / Relawan', icon: Users },
  { id: 'heart', label: 'Sosial / Peduli', icon: Heart },
  { id: 'star', label: 'Patron / Bintang', icon: Star },
  { id: 'book', label: 'Edukasi / Ajar', icon: BookOpen },
  { id: 'gift', label: 'Hadiah / Salur', icon: Gift },
  { id: 'smile', label: 'Penerima Manfaat', icon: Smile },
  { id: 'briefcase', label: 'Program / Tim', icon: Briefcase },
  { id: 'phone', label: 'Kontak / Call', icon: PhoneCall },
  { id: 'shield', label: 'Verifikasi', icon: ShieldCheck },
  { id: 'award', label: 'Penghargaan', icon: Award },
];

const renderGroupIcon = (iconName?: string, className = 'w-5 h-5 stroke-[2]') => {
  switch (iconName?.toLowerCase()) {
    case 'cart':
    case 'shoppingcart':
      return <ShoppingCart className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'book':
    case 'bookopen':
      return <BookOpen className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'smile':
      return <Smile className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'phone':
    case 'phonecall':
      return <PhoneCall className={className} />;
    case 'shield':
    case 'shieldcheck':
      return <ShieldCheck className={className} />;
    case 'award':
      return <Award className={className} />;
    default:
      return <Globe className={className} />;
  }
};

interface ListGroupFunnelingViewProps {
  identitasList?: IdentitasItem[];
  jenisGroupList?: JenisGroupFunnelingItem[];
  onShowToast?: (msg: string) => void;
  onNavigateToIdentitas?: (identitasId?: string) => void;
  onNavigateToFormListGroupFunneling?: () => void;
  onKirimPM?: (targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
}

export const ListGroupFunnelingView: React.FC<ListGroupFunnelingViewProps> = ({
  identitasList = [],
  jenisGroupList,
  onShowToast = (_msg: string) => {},
  onNavigateToIdentitas,
  onNavigateToFormListGroupFunneling,
  onKirimPM,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
}) => {
  // Members state
  const [members, setMembers] = useState<FunnelingMemberItem[]>(() => loadFunnelingMembers());
  // Groups state
  const [groups, setGroups] = useState<FunnelingGroupCard[]>(() => loadFunnelingGroups());
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Real-time synchronization
  useEffect(() => {
    const handleSync = () => {
      setGroups(loadFunnelingGroups());
      setMembers(loadFunnelingMembers());
    };
    handleSync();
    window.addEventListener('funneling_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('funneling_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Master jenis groups
  const masterJenisList = useMemo(() => {
    return jenisGroupList && jenisGroupList.length > 0
      ? jenisGroupList
      : loadJenisGroupFunneling();
  }, [jenisGroupList]);

  // Active jenis groups
  const activeJenisGroups = useMemo(() => {
    return masterJenisList.filter((j) => j.aktif !== false);
  }, [masterJenisList]);

  // Inactive jenis group names (lowercase for filtering)
  const inactiveJenisNames = useMemo(() => {
    return masterJenisList
      .filter((j) => j.aktif === false)
      .map((j) => j.namaJenisGroup.toLowerCase().trim());
  }, [masterJenisList]);

  // Dynamic Tabs: All + active jenis groups
  const tabsList = useMemo(() => {
    return ['All', ...activeJenisGroups.map((j) => j.namaJenisGroup)];
  }, [activeJenisGroups]);

  // Active tab: 'All' or active group name
  const [activeTab, setActiveTab] = useState<string>('All');

  // If activeTab is no longer active, reset to 'All'
  React.useEffect(() => {
    if (activeTab !== 'All' && !tabsList.includes(activeTab)) {
      setActiveTab('All');
    }
  }, [tabsList, activeTab]);

  // Check whether a specific group is active
  const isGroupActive = (grp: FunnelingGroupCard): boolean => {
    if (grp.aktif === false) return false;
    const grpJenis = (grp.jenisGroup || (grp.name.toLowerCase().includes('donasi') || grp.name.toLowerCase() === 'group a' || grp.name.toLowerCase() === 'group b' ? 'Funneling Donasi' : '')).toLowerCase().trim();
    if (grpJenis && inactiveJenisNames.includes(grpJenis)) {
      return false; // Inactive
    }
    const foundJenis = masterJenisList.find(
      (j) => j.namaJenisGroup.toLowerCase().trim() === grpJenis
    );
    if (foundJenis && foundJenis.aktif === false) {
      return false;
    }
    return true;
  };

  // All active groups in the system
  const allActiveGroups = useMemo(() => {
    return groups.filter(isGroupActive);
  }, [groups, inactiveJenisNames, masterJenisList]);

  // Group columns to display in table according to activeTab
  // "Semua nama Group Funneling masuk ke sana kecuali jika sudah tidak aktif."
  // "Tab di atas 'All', 'Funneling Donasi', dll adalah untuk memfilter Nama Group Funneling apa saja yang muncul (sesuai Jenis Group Funneling)."
  const tableGroupColumns = useMemo(() => {
    if (activeTab === 'All') {
      return allActiveGroups;
    }

    const tabLower = activeTab.toLowerCase().trim();
    return allActiveGroups.filter((grp) => {
      const grpJenis = (grp.jenisGroup || (grp.name.toLowerCase().includes('donasi') || grp.name.toLowerCase() === 'group a' || grp.name.toLowerCase() === 'group b' ? 'Funneling Donasi' : '')).toLowerCase().trim();
      if (grpJenis === tabLower) return true;
      if (
        (tabLower.includes('donasi') || tabLower === 'group donasi' || tabLower === 'funneling donasi') &&
        (grpJenis.includes('donasi') || grpJenis === 'group donasi' || grpJenis === 'funneling donasi')
      ) {
        return true;
      }
      return false;
    });
  }, [allActiveGroups, activeTab]);

  // Hidden group IDs state (persisted to localStorage)
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yppln_hidden_funneling_group_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isRestoreDropdownOpen, setIsRestoreDropdownOpen] = useState(false);
  const [iconPickerGroupId, setIconPickerGroupId] = useState<string | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setIconPickerGroupId(null);
      setIsRestoreDropdownOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Real-time calculation of ID Identitas per Nama Group Funneling
  // "bentuk ini untuk menunjukan secara real ada berapa ID Identitas per Nama Group Funneling.
  // Tulisan atas adalah Nama Group Funneling, dan bawah adalah jumlahnya."
  const getGroupRealCount = (grp: FunnelingGroupCard): number => {
    const ids = new Set<string>();
    if (grp.identitasIds && Array.isArray(grp.identitasIds)) {
      grp.identitasIds.forEach((id) => {
        if (id && id.trim()) ids.add(id.trim());
      });
    }
    members.forEach((m) => {
      if (isMemberInGroup(m, grp)) {
        const idVal = m.identitasId || m.codeId || m.id;
        if (idVal) ids.add(idVal);
      }
    });
    if (ids.size > 0) return ids.size;
    return grp.count ?? 0;
  };

  // Visible groups for carousel cards & table columns (excluding hidden groups)
  const visibleGroups = useMemo(() => {
    return tableGroupColumns.filter((grp) => !hiddenGroupIds.includes(grp.id));
  }, [tableGroupColumns, hiddenGroupIds]);

  // Hidden groups belonging to currently active table columns
  const currentHiddenGroups = useMemo(() => {
    return tableGroupColumns.filter((grp) => hiddenGroupIds.includes(grp.id));
  }, [tableGroupColumns, hiddenGroupIds]);

  const handleHideGroup = (groupId: string, groupName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenGroupIds((prev) => {
      if (prev.includes(groupId)) return prev;
      const next = [...prev, groupId];
      try {
        localStorage.setItem('yppln_hidden_funneling_group_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
    onShowToast(`Group "${groupName}" disembunyikan`);
  };

  const handleRestoreGroup = (groupId: string) => {
    const grp = groups.find((g) => g.id === groupId);
    setHiddenGroupIds((prev) => {
      const next = prev.filter((id) => id !== groupId);
      try {
        localStorage.setItem('yppln_hidden_funneling_group_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (grp) {
      onShowToast(`Group "${grp.name}" berhasil ditampilkan kembali`);
    }
  };

  const handleRestoreAllGroups = () => {
    setHiddenGroupIds([]);
    try {
      localStorage.removeItem('yppln_hidden_funneling_group_ids');
    } catch {}
    setIsRestoreDropdownOpen(false);
    onShowToast('Semua group berhasil ditampilkan kembali');
  };

  const handleChangeGroupIcon = (groupId: string, newIcon: string) => {
    const updated = groups.map((g) => (g.id === groupId ? { ...g, icon: newIcon } : g));
    setGroups(updated);
    saveFunnelingGroups(updated);
    setIconPickerGroupId(null);
    onShowToast('Logo group berhasil diubah');
  };

  const handlePrevCarousel = () => {
    if (carouselContainerRef.current) {
      carouselContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleNextCarousel = () => {
    if (carouselContainerRef.current) {
      carouselContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Check if member is joined in a group
  const isMemberInGroup = (member: FunnelingMemberItem, grp: FunnelingGroupCard): boolean => {
    // 1. Check member.groupNames
    if (member.groupNames && Array.isArray(member.groupNames)) {
      if (member.groupNames.some((gn) => gn.toLowerCase().trim() === grp.name.toLowerCase().trim())) {
        return true;
      }
    }
    // 2. Backward compatibility for Group A and Group B
    if (grp.name.toLowerCase().trim() === 'group a' && member.groupA) return true;
    if (grp.name.toLowerCase().trim() === 'group b' && member.groupB) return true;

    // 3. Check group's identitasIds
    if (grp.identitasIds && Array.isArray(grp.identitasIds)) {
      if (member.identitasId && grp.identitasIds.includes(member.identitasId)) return true;
      if (member.codeId && grp.identitasIds.includes(member.codeId)) return true;
      if (member.id && grp.identitasIds.includes(member.id)) return true;
    }
    return false;
  };

  // Active members: Exclude members whose jenis group is inactive
  const activeMembers = useMemo(() => {
    return members.filter((m) => {
      const mJenis = (m.jenisGroup || (m.category === 'Funneling Donasi' ? 'Funneling Donasi' : '')).toLowerCase().trim();
      if (mJenis && inactiveJenisNames.includes(mJenis)) {
        return false; // Data tidak akan muncul pada List Group Funneling
      }
      return true;
    });
  }, [members, inactiveJenisNames]);

  // Toolbar toggles
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>('all');

  // Row action menu dropdown
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FunnelingMemberItem | null>(null);
  const [formIdentitasId, setFormIdentitasId] = useState<string>('');
  const [formCodeId, setFormCodeId] = useState<string>('');
  const [formNama, setFormNama] = useState<string>('');
  const [formNamaPanggilan, setFormNamaPanggilan] = useState<string>('');
  const [formGroupNames, setFormGroupNames] = useState<string[]>([]);
  const [formCategory, setFormCategory] = useState<string>('All');

  // Filtered members list
  const filteredMembers = useMemo(() => {
    let result = activeMembers;

    // Filter by tab
    if (activeTab !== 'All') {
      const targetTabLower = activeTab.toLowerCase().trim();
      result = result.filter((m) => {
        const cat = (m.category || '').toLowerCase().trim();
        const jg = (m.jenisGroup || '').toLowerCase().trim();
        const isInAnyGroupInTab = tableGroupColumns.some((grp) => isMemberInGroup(m, grp));
        return (
          cat === 'all' ||
          !cat ||
          cat === targetTabLower ||
          jg === targetTabLower ||
          (targetTabLower.includes('donasi') && (cat.includes('donasi') || jg.includes('donasi'))) ||
          isInAnyGroupInTab
        );
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.nama.toLowerCase().includes(q) ||
          m.codeId.toLowerCase().includes(q) ||
          m.namaPanggilan.toLowerCase().includes(q)
      );
    }

    // Filter by group membership
    if (filterGroup !== 'all') {
      if (filterGroup === 'both' || filterGroup === 'allInTab') {
        result = result.filter((m) => tableGroupColumns.every((grp) => isMemberInGroup(m, grp)));
      } else {
        const targetGrp = allActiveGroups.find(
          (g) => g.name.toLowerCase() === filterGroup.toLowerCase() || g.id === filterGroup
        );
        if (targetGrp) {
          result = result.filter((m) => isMemberInGroup(m, targetGrp));
        } else if (filterGroup === 'groupA') {
          const grpA = allActiveGroups.find((g) => g.name.toLowerCase() === 'group a');
          result = result.filter((m) => (grpA ? isMemberInGroup(m, grpA) : m.groupA));
        } else if (filterGroup === 'groupB') {
          const grpB = allActiveGroups.find((g) => g.name.toLowerCase() === 'group b');
          result = result.filter((m) => (grpB ? isMemberInGroup(m, grpB) : m.groupB));
        }
      }
    }

    return result;
  }, [activeMembers, activeTab, searchQuery, filterGroup, tableGroupColumns, allActiveGroups]);

  const isAllSelected =
    filteredMembers.length > 0 &&
    selectedMemberIds.length === filteredMembers.length;

  const handleToggleSelect = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map((m) => m.id));
    }
  };

  const getSelectedTargetItems = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedMemberIds;
    const targetMembers = members.filter((m) => idsToUse.includes(m.id));
    return targetMembers.map((m) => {
      const identitas = identitasList.find((i) => i.id === m.identitasId);
      return {
        id: m.identitasId || m.id,
        identitasId: m.identitasId,
        nama: m.nama,
        nomorHp: identitas?.nomorHandPhone || '-',
        codeId: m.codeId,
      };
    });
  };

  const handleBulkCreateGroupFunneling = (overrideIds?: string[]) => {
    const targets = getSelectedTargetItems(overrideIds);
    if (targets.length === 0) return;
    const ids = targets.map((t) => t.identitasId).filter(Boolean) as string[];
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

  const handleKirimPM = (overrideIds?: string[]) => {
    const idsToUse = overrideIds || selectedMemberIds;
    if (idsToUse.length === 0) return;
    const targets = getSelectedTargetItems(idsToUse);
    if (onKirimPM) {
      onKirimPM(targets);
    }
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingMember(null);
    if (identitasList.length > 0) {
      const first = identitasList[0];
      setFormIdentitasId(first.id);
      setFormCodeId(first.codeId || '00001');
      setFormNama(first.namaLengkap);
      setFormNamaPanggilan(first.namaPanggilan || '');
    } else {
      setFormIdentitasId('');
      setFormCodeId('00099');
      setFormNama('');
      setFormNamaPanggilan('');
    }
    setFormGroupNames(tableGroupColumns.length > 0 ? [tableGroupColumns[0].name] : ['Group A']);
    setFormCategory(activeTab === 'All' ? 'Funneling Donasi' : activeTab);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (member: FunnelingMemberItem) => {
    setEditingMember(member);
    setFormIdentitasId(member.identitasId || '');
    setFormCodeId(member.codeId);
    setFormNama(member.nama);
    setFormNamaPanggilan(member.namaPanggilan);
    const groupsOfMember: string[] = member.groupNames ? [...member.groupNames] : [];
    if (member.groupA && !groupsOfMember.includes('Group A')) groupsOfMember.push('Group A');
    if (member.groupB && !groupsOfMember.includes('Group B')) groupsOfMember.push('Group B');
    setFormGroupNames(groupsOfMember);
    setFormCategory(member.category);
    setOpenMenuRowId(null);
    setIsModalOpen(true);
  };

  // Select identitas in modal
  const handleSelectIdentitasInModal = (idVal: string) => {
    setFormIdentitasId(idVal);
    const found = identitasList.find((i) => i.id === idVal);
    if (found) {
      setFormCodeId(found.codeId || '');
      setFormNama(found.namaLengkap);
      setFormNamaPanggilan(found.namaPanggilan || '');
    }
  };

  // Save member
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      onShowToast('Nama harus diisi');
      return;
    }

    // Determine avatar
    let avatarInitial = formNama.trim().charAt(0).toUpperCase();
    let avatarBg = 'bg-[#14b8a6]';
    const foundId = identitasList.find((i) => i.id === formIdentitasId);
    if (foundId) {
      avatarInitial = foundId.avatarInitial || avatarInitial;
      avatarBg = foundId.avatarBg || avatarBg;
    }

    const isA = formGroupNames.includes('Group A');
    const isB = formGroupNames.includes('Group B');

    let updatedList: FunnelingMemberItem[];
    if (editingMember) {
      updatedList = members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              identitasId: formIdentitasId || m.identitasId,
              codeId: formCodeId || m.codeId,
              nama: formNama.trim(),
              namaPanggilan: formNamaPanggilan.trim(),
              groupNames: formGroupNames,
              groupA: isA,
              groupB: isB,
              category: formCategory,
              avatarInitial,
              avatarBg,
            }
          : m
      );
      onShowToast(`Berhasil memperbarui data ${formNama}`);
    } else {
      const newItem: FunnelingMemberItem = {
        id: `fn-${Date.now()}`,
        identitasId: formIdentitasId,
        codeId: formCodeId || '00000',
        nama: formNama.trim(),
        namaPanggilan: formNamaPanggilan.trim(),
        avatarInitial,
        avatarBg,
        groupNames: formGroupNames,
        groupA: isA,
        groupB: isB,
        category: formCategory,
      };
      updatedList = [newItem, ...members];
      onShowToast(`Berhasil menambahkan ${formNama} ke List Group Funneling`);
    }

    setMembers(updatedList);
    saveFunnelingMembers(updatedList);
    setIsModalOpen(false);
  };

  // Delete member
  const handleDeleteMember = (id: string, name: string) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    saveFunnelingMembers(updated);
    setOpenMenuRowId(null);
    onShowToast(`Berhasil menghapus ${name} dari list`);
  };

  // Toggle group status for a member
  const handleToggleMemberGroup = (memberId: string, grp: FunnelingGroupCard) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        const existingNames = m.groupNames ? [...m.groupNames] : [];
        if (m.groupA && !existingNames.includes('Group A')) existingNames.push('Group A');
        if (m.groupB && !existingNames.includes('Group B')) existingNames.push('Group B');

        const currentlyIn = isMemberInGroup(m, grp);
        let newNames: string[];
        if (currentlyIn) {
          newNames = existingNames.filter(
            (gn) => gn.toLowerCase().trim() !== grp.name.toLowerCase().trim()
          );
        } else {
          newNames = [...existingNames, grp.name];
        }

        const isGroupA = grp.name.toLowerCase().trim() === 'group a';
        const isGroupB = grp.name.toLowerCase().trim() === 'group b';

        return {
          ...m,
          groupNames: newNames,
          groupA: isGroupA ? !currentlyIn : m.groupA,
          groupB: isGroupB ? !currentlyIn : m.groupB,
        };
      }
      return m;
    });
    setMembers(updated);
    saveFunnelingMembers(updated);
    setOpenMenuRowId(null);
    onShowToast(`Status ${grp.name} berhasil diubah`);
  };

  return (
    <div id="list-group-funneling-page" className="w-full max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Filter Tabs & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1 mb-6 px-1">
        {/* Left Category Tabs matching image */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {tabsList.map((tab) => (
            <button
              key={tab}
              id={`tab-funneling-${tab.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs shrink-0 ${
                activeTab === tab
                  ? 'bg-[#008d91] text-white hover:bg-[#05828e]'
                  : 'bg-[#b0b7bd] text-white hover:bg-[#a0a8af]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Action Icons matching image: EyeOff, Search, SlidersHorizontal, + Add */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Eye / EyeOff icon */}
          <button
            id="btn-funneling-eye"
            type="button"
            onClick={() => {
              setShowSubtitles(!showSubtitles);
              onShowToast(showSubtitles ? 'Info panggilan disembunyikan' : 'Info panggilan ditampilkan');
            }}
            title={showSubtitles ? 'Sembunyikan Nama Panggilan' : 'Tampilkan Nama Panggilan'}
            aria-label={showSubtitles ? 'Sembunyikan Nama Panggilan' : 'Tampilkan Nama Panggilan'}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            {showSubtitles ? <EyeOff className="w-5 h-5 stroke-[1.8]" /> : <Eye className="w-5 h-5 stroke-[1.8]" />}
          </button>

          {/* Search icon */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  id="input-funneling-search"
                  type="text"
                  placeholder="Cari nama / ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="text-xs outline-none w-36 sm:w-44 text-slate-700 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-funneling-search"
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Cari"
                aria-label="Cari"
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}
          </div>

          {/* SlidersHorizontal filter icon */}
          <button
            id="btn-funneling-filter"
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            title="Filter Group"
            aria-label="Filter Group"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              filterGroup !== 'all'
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Bulk Action buttons when selected */}
          {selectedMemberIds.length > 0 && (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <button
                type="button"
                onClick={() => handleBulkCreateGroupFunneling()}
                className="bg-[#008d91] hover:bg-[#007679] text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Create Group Funneling"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Create Group Funneling ({selectedMemberIds.length})</span>
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

          {/* + Add Button */}
          <button
            id="btn-funneling-add"
            type="button"
            onClick={() => {
              if (onNavigateToFormListGroupFunneling) {
                onNavigateToFormListGroupFunneling();
              } else {
                handleOpenAddModal();
              }
            }}
            className="cursor-pointer bg-[#008d91] hover:bg-[#05828e] text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Group Metric Cards Carousel matching user screenshots */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 my-5 relative">
        {/* Left Arrow Button (shown if multiple groups exist) */}
        {visibleGroups.length > 2 && (
          <button
            id="btn-funneling-carousel-prev"
            type="button"
            onClick={handlePrevCarousel}
            title="Geser Group Sebelumnya"
            aria-label="Geser Group Sebelumnya"
            className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}

        {/* Group Cards Container */}
        <div
          ref={carouselContainerRef}
          className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none flex-1 scroll-smooth"
        >
          {visibleGroups.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 px-2">
              Tidak ada group funneling yang aktif
            </div>
          ) : (
            visibleGroups.map((grp) => (
              <div
                key={grp.id}
                id={`card-funneling-${grp.id}`}
                className="bg-white rounded-2xl px-5 py-3.5 border border-slate-100 shadow-xs flex items-center justify-between min-w-[210px] w-60 shrink-0 transition-transform hover:-translate-y-0.5 duration-150 relative group"
              >
                {/* Red Circular Hide (X) Button matching Image 2 */}
                <button
                  type="button"
                  onClick={(e) => handleHideGroup(grp.id, grp.name, e)}
                  title={`Sembunyikan ${grp.name}`}
                  aria-label={`Sembunyikan ${grp.name}`}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs cursor-pointer transition-transform hover:scale-110 z-10"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>

                {/* Left: Group Name (top) & Real Count (bottom) */}
                <div className="flex flex-col min-w-0 pr-2">
                  <span
                    className="text-[11px] font-medium text-slate-400 tracking-wide truncate max-w-[130px]"
                    title={grp.name}
                  >
                    {grp.name}
                  </span>
                  <span className="text-[15px] font-bold text-slate-800 mt-0.5">
                    {getGroupRealCount(grp)} orang
                  </span>
                </div>

                {/* Right: Changeable Group Logo matching Image 1 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIconPickerGroupId(iconPickerGroupId === grp.id ? null : grp.id);
                    }}
                    title="Klik untuk ubah logo group"
                    className="w-10 h-10 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shrink-0 shadow-2xs transition-colors cursor-pointer group-hover:scale-105"
                  >
                    {renderGroupIcon(grp.icon)}
                  </button>

                  {/* Icon Selector Popover */}
                  {iconPickerGroupId === grp.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-12 z-30 bg-white rounded-2xl p-3 shadow-xl border border-slate-100 w-56 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-[11px] font-bold text-slate-700">
                          Pilih Logo Group
                        </span>
                        <button
                          type="button"
                          onClick={() => setIconPickerGroupId(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {AVAILABLE_ICONS.map((item) => {
                          const IconComp = item.icon;
                          const isSelected = (grp.icon || 'globe').toLowerCase() === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleChangeGroupIcon(grp.id, item.id)}
                              title={item.label}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#008d91] text-white ring-2 ring-[#008d91]/30'
                                  : 'bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-[#008d91]'
                              }`}
                            >
                              <IconComp className="w-5 h-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Section: (+) Restore Button & (>) Right Arrow Button matching Image 3 */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          {/* Plus (+) Button to restore hidden groups (Image 3) */}
          {currentHiddenGroups.length > 0 && (
            <div className="relative">
              <button
                id="btn-funneling-restore-hidden"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRestoreDropdownOpen(!isRestoreDropdownOpen);
                }}
                title="Tampilkan kembali group yang disembunyikan"
                aria-label="Tampilkan kembali group yang disembunyikan"
                className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              {/* Restore Popover Dropdown */}
              {isRestoreDropdownOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 z-30 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 w-64 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Group Disembunyikan ({currentHiddenGroups.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRestoreDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {currentHiddenGroups.map((hg) => (
                      <div
                        key={hg.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-[#008d91] text-white flex items-center justify-center shrink-0">
                            {renderGroupIcon(hg.icon, 'w-3.5 h-3.5')}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-700 font-medium truncate">
                              {hg.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {getGroupRealCount(hg)} orang
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestoreGroup(hg.id)}
                          className="text-[11px] font-semibold text-[#008d91] hover:underline px-2 py-1 rounded-lg hover:bg-teal-50 shrink-0 cursor-pointer"
                        >
                          + Tampilkan
                        </button>
                      </div>
                    ))}
                  </div>

                  {currentHiddenGroups.length > 1 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                      <button
                        type="button"
                        onClick={handleRestoreAllGroups}
                        className="text-xs font-semibold text-[#008d91] hover:underline cursor-pointer"
                      >
                        Tampilkan Semua ({currentHiddenGroups.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Arrow Button (shown if multiple groups exist) */}
          {visibleGroups.length > 2 && (
            <button
              id="btn-funneling-carousel-next"
              type="button"
              onClick={handleNextCarousel}
              title="Geser Group Selanjutnya"
              aria-label="Geser Group Selanjutnya"
              className="w-6 h-6 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card matching image */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100/90 shadow-xs mt-6 relative">
        {/* Top-right card action icon (SlidersHorizontal) matching image */}
        <div className="flex justify-end mb-2">
          <button
            id="btn-funneling-table-filter"
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            title="Pengaturan Filter Kolom"
            aria-label="Pengaturan Filter Kolom"
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Table Header matching image */}
        <div className="flex items-center text-slate-700 font-bold text-base border-b border-slate-200/80 pb-4 mb-4">
          <div className="w-[45%] sm:w-[35%] pl-2 sm:pl-3 text-left flex items-center gap-3 shrink-0">
            <button
              id="btn-select-all"
              type="button"
              onClick={handleSelectAll}
              className="w-5 h-5 flex items-center justify-center cursor-pointer shrink-0 transition-transform hover:scale-105"
              title="Pilih Semua"
            >
              {isAllSelected ? (
                <img
                  src="/assets/aistudio/image_d9f24bf9.png"
                  alt="Checklist"
                  className="w-5 h-5 object-contain"
                />
              ) : selectedMemberIds.length > 0 ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#008d91] bg-teal-50 flex items-center justify-center">
                  <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white hover:border-[#008d91] transition-colors" />
              )}
            </button>
            <span>Nama</span>
          </div>

          {visibleGroups.length === 0 ? (
            <div className="flex-1 text-center text-slate-400 font-normal text-sm">
              Belum ada Group Funneling
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-around">
              {visibleGroups.map((grp) => (
                <div key={grp.id} className="flex-1 text-center truncate px-2">
                  {grp.name}
                </div>
              ))}
            </div>
          )}

          <div className="w-10 sm:w-14 shrink-0 text-right pr-2">
            {/* Empty for action alignment */}
          </div>
        </div>

        {/* Table Rows */}
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Tidak ada data yang cocok dengan kriteria filter / pencarian.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                id={`row-funneling-${member.id}`}
                className={`flex items-center py-4 sm:py-5 hover:bg-slate-50/50 transition-colors rounded-2xl px-2 ${
                  selectedMemberIds.includes(member.id) ? 'bg-teal-50/20' : ''
                }`}
              >
                {/* Nama column with checkbox, avatar and subtitle */}
                <div className="w-[45%] sm:w-[35%] flex items-center gap-2.5 sm:gap-3.5 min-w-0 pl-1 sm:pl-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelect(member.id);
                    }}
                    className="w-5 h-5 flex items-center justify-center cursor-pointer shrink-0 transition-transform hover:scale-105"
                    title={selectedMemberIds.includes(member.id) ? 'Batal pilih' : 'Pilih member ini'}
                  >
                    {selectedMemberIds.includes(member.id) ? (
                      <img
                        src="/assets/aistudio/image_d9f24bf9.png"
                        alt="Checklist"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white hover:border-[#008d91] transition-colors" />
                    )}
                  </button>

                  {/* Large circle avatar */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${member.avatarBg} text-white flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-2xs`}
                  >
                    {member.avatarInitial}
                  </div>

                  {/* Name and subtitle */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-800 font-bold text-[15px] sm:text-[16px] truncate leading-tight">
                      {member.codeId} {member.nama}
                    </span>
                    {showSubtitles && member.namaPanggilan && (
                      <span className="text-slate-500 text-xs sm:text-sm mt-1 truncate">
                        {member.namaPanggilan}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Group Columns: displays checklist icon or "-" */}
                {visibleGroups.length === 0 ? (
                  <div className="flex-1 text-center text-slate-400 text-sm">
                    -
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-around">
                    {visibleGroups.map((grp) => {
                      const inGrp = isMemberInGroup(member, grp);
                      return (
                        <div key={grp.id} className="flex-1 text-center px-2 flex items-center justify-center">
                          {inGrp ? (
                            <button
                              type="button"
                              onClick={() => handleToggleMemberGroup(member.id, grp)}
                              title={`${member.nama} terdaftar di ${grp.name} (Klik untuk ubah status)`}
                              className="inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-95 p-0.5"
                            >
                              <img
                                src="/assets/aistudio/image_d9f24bf9.png"
                                alt="Checklist"
                                className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow-2xs"
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleMemberGroup(member.id, grp)}
                              title={`Klik untuk menambahkan ${member.nama} ke ${grp.name}`}
                              className="text-slate-300 hover:text-[#008d91] font-medium text-base sm:text-lg w-7 h-7 inline-flex items-center justify-center rounded-full hover:bg-teal-50/60 transition-colors cursor-pointer"
                            >
                              -
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Column: Three vertical dots ⋮ */}
                <div className="w-10 sm:w-14 shrink-0 text-right pr-2 relative">
                  <button
                    id={`btn-menu-${member.id}`}
                    type="button"
                    onClick={() =>
                      setOpenMenuRowId(openMenuRowId === member.id ? null : member.id)
                    }
                    title="Menu Aksi"
                    aria-label="Menu Aksi"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuRowId === member.id && (
                    <div
                      id={`dropdown-${member.id}`}
                      className="absolute right-0 top-9 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-30 text-left animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuRowId(null);
                          handleBulkCreateGroupFunneling([member.id]);
                        }}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5 text-[#008d91]" />
                        <span>Create Group Funneling</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuRowId(null);
                          handleBulkTambahKeGroupExisting([member.id]);
                        }}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <FolderInput className="w-3.5 h-3.5 text-[#008d91]" />
                        <span>Tambah ke Existing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuRowId(null);
                          handleKirimPM([member.id]);
                        }}
                        className="w-full px-4 py-2 text-xs text-[#008d91] hover:bg-teal-50 flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                        <span>Kirim PM ke Member Ini</span>
                      </button>

                      <hr className="my-1.5 border-slate-100" />

                      {tableGroupColumns.map((grp) => {
                        const inGrp = isMemberInGroup(member, grp);
                        return (
                          <button
                            key={grp.id}
                            type="button"
                            onClick={() => handleToggleMemberGroup(member.id, grp)}
                            className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate pr-2">Status {grp.name}</span>
                            <span className="font-bold text-[#008d91] shrink-0">
                              {inGrp ? 'Aktif (V)' : 'Non-aktif (-)'}
                            </span>
                          </button>
                        );
                      })}

                      <hr className="my-1.5 border-slate-100" />

                      {onNavigateToIdentitas && member.identitasId && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuRowId(null);
                            onNavigateToIdentitas(member.identitasId);
                          }}
                          className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Lihat Identitas Lengkap</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(member)}
                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit Anggota</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id, member.nama)}
                        className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Hapus dari List</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Funneling Floating Action Bar */}
        <FunnelingActionBar
          selectedCount={selectedMemberIds.length}
          itemLabel="member"
          onClearSelection={() => setSelectedMemberIds([])}
          onCreateGroupFunneling={() => handleBulkCreateGroupFunneling()}
          onTambahKeGroupExisting={() => handleBulkTambahKeGroupExisting()}
          onKirimPM={onKirimPM ? () => handleKirimPM() : undefined}
        />
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#008d91]" />
                Filter Keanggotaan Group
              </h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="groupFilter"
                  checked={filterGroup === 'all'}
                  onChange={() => setFilterGroup('all')}
                  className="accent-[#008d91]"
                />
                <span className="text-xs text-slate-700 font-medium">Semua Anggota</span>
              </label>

              {visibleGroups.map((grp) => (
                <label
                  key={grp.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="groupFilter"
                    checked={filterGroup.toLowerCase() === grp.name.toLowerCase()}
                    onChange={() => setFilterGroup(grp.name)}
                    className="accent-[#008d91]"
                  />
                  <span className="text-xs text-slate-700 font-medium truncate">
                    Hanya Anggota {grp.name} (V)
                  </span>
                </label>
              ))}

              {visibleGroups.length > 1 && (
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="groupFilter"
                    checked={filterGroup === 'both'}
                    onChange={() => setFilterGroup('both')}
                    className="accent-[#008d91]"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Anggota di Semua Group di Tab Ini
                  </span>
                </label>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterGroup('all');
                  setIsFilterModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <h3 className="font-bold text-slate-800 text-base">
                {editingMember ? 'Edit Anggota Funneling' : 'Tambah Anggota Funneling'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* Select from existing Identitas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih dari Master Identitas
                </label>
                <select
                  value={formIdentitasId}
                  onChange={(e) => handleSelectIdentitasInModal(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#008d91] text-slate-700"
                >
                  <option value="">-- Input Manual / Bebas --</option>
                  {identitasList.map((id) => (
                    <option key={id.id} value={id.id}>
                      {id.codeId || '00000'} - {id.namaLengkap} ({id.namaPanggilan || '-'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Code ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Code ID
                </label>
                <input
                  type="text"
                  value={formCodeId}
                  onChange={(e) => setFormCodeId(e.target.value)}
                  placeholder="e.g. 00031"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#008d91] text-slate-700"
                />
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="e.g. Agustino Ong"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#008d91] text-slate-700"
                />
              </div>

              {/* Nama Panggilan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Panggilan (Subtitle)
                </label>
                <input
                  type="text"
                  value={formNamaPanggilan}
                  onChange={(e) => setFormNamaPanggilan(e.target.value)}
                  placeholder="e.g. Ko Agus"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#008d91] text-slate-700"
                />
              </div>

              {/* Group Checkboxes */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Status Keanggotaan Group
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {allActiveGroups.map((grp) => {
                    const isChecked = formGroupNames.includes(grp.name);
                    return (
                      <label
                        key={grp.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-[#008d91] bg-teal-50/50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800 truncate pr-1">
                          {grp.name}
                        </span>
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {isChecked ? (
                            <img
                              src="/assets/aistudio/image_d9f24bf9.png"
                              alt="Checklist"
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormGroupNames((prev) => [...prev, grp.name]);
                            } else {
                              setFormGroupNames((prev) => prev.filter((n) => n !== grp.name));
                            }
                          }}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Tab
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as 'All' | 'Funneling Donasi')}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#008d91] text-slate-700"
                >
                  <option value="All">All</option>
                  <option value="Funneling Donasi">Funneling Donasi</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs cursor-pointer"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
