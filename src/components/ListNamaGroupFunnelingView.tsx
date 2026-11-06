import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Trash2,
  Users,
  ExternalLink,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import {
  FunnelingGroupCard,
  FunnelingMemberItem,
  JenisGroupFunnelingItem,
  loadFunnelingGroups,
  saveFunnelingGroups,
  loadFunnelingMembers,
  loadJenisGroupFunneling,
  countIdentitasInGroup,
} from '../funnelingData';

interface ListNamaGroupFunnelingViewProps {
  jenisGroupList?: JenisGroupFunnelingItem[];
  onNavigateToFormListGroupFunneling: () => void;
  onNavigateToListGroupFunneling?: () => void;
  onShowToast?: (msg: string) => void;
}

export const ListNamaGroupFunnelingView: React.FC<ListNamaGroupFunnelingViewProps> = ({
  jenisGroupList: propJenisGroupList,
  onNavigateToFormListGroupFunneling,
  onNavigateToListGroupFunneling,
  onShowToast = (_msg: string) => {},
}) => {
  const [groups, setGroups] = useState<FunnelingGroupCard[]>(() => loadFunnelingGroups());
  const [members, setMembers] = useState<FunnelingMemberItem[]>(() => loadFunnelingMembers());
  const [activeJenisList, setActiveJenisList] = useState<JenisGroupFunnelingItem[]>(() =>
    propJenisGroupList && propJenisGroupList.length > 0
      ? propJenisGroupList
      : loadJenisGroupFunneling()
  );

  // Sync prop changes
  useEffect(() => {
    if (propJenisGroupList && propJenisGroupList.length > 0) {
      setActiveJenisList(propJenisGroupList);
    }
  }, [propJenisGroupList]);

  // Sync groups & members on mount or focus
  useEffect(() => {
    setGroups(loadFunnelingGroups());
    setMembers(loadFunnelingMembers());
  }, []);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'tidak'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check whether group's corresponding Jenis Group is active
  const isGroupAktif = (groupJenis?: string): boolean => {
    if (!groupJenis) return true;
    const found = activeJenisList.find(
      (j) => j.namaJenisGroup.toLowerCase().trim() === groupJenis.toLowerCase().trim()
    );
    if (found) {
      return Boolean(found.aktif);
    }
    return true;
  };

  // Real-time count of Identitas IDs joined in this group
  const getJumlahIdYangBergabung = (group: FunnelingGroupCard): number => {
    return countIdentitasInGroup(group, members);
  };

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter((grp) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        grp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (grp.jenisGroup || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      const aktif = isGroupAktif(grp.jenisGroup);
      if (statusFilter === 'aktif' && !aktif) return false;
      if (statusFilter === 'tidak' && aktif) return false;

      return true;
    });
  }, [groups, searchQuery, statusFilter, activeJenisList, members]);

  // Handle Delete Group
  const handleDeleteGroup = (groupId: string, groupName: string) => {
    const updated = groups.filter((g) => g.id !== groupId);
    setGroups(updated);
    saveFunnelingGroups(updated);
    setActiveMenuId(null);
    onShowToast(`Group "${groupName}" berhasil dihapus`);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-7">
      {/* Top Toolbar: EyeOff, Search, Sliders, and + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          {showSearchInput ? (
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama group / jenis group..."
                className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] w-64 sm:w-80 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">
              Menampilkan {filteredGroups.length} group funneling
            </div>
          )}
        </div>

        {/* Action icons right aligned */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onShowToast('Mode sembunyikan kolom / filter tampilan')}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            title="Sembunyikan / Tampilkan"
          >
            <EyeOff className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowSearchInput(!showSearchInput)}
            className={`p-1.5 transition-colors ${
              showSearchInput || searchQuery
                ? 'text-[#008d91] font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Pencarian"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-1.5 transition-colors ${
                statusFilter !== 'all'
                  ? 'text-[#008d91] font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Filter Status"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Filter Aktif / Tidak
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                    statusFilter === 'all'
                      ? 'bg-teal-50 text-[#008d91] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Semua</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('aktif');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                    statusFilter === 'aktif'
                      ? 'bg-teal-50 text-[#008d91] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Hanya Aktif (Yes)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('tidak');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                    statusFilter === 'tidak'
                      ? 'bg-teal-50 text-[#008d91] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Hanya Tidak Aktif (No)</span>
                </button>
              </div>
            )}
          </div>

          {/* + Add Button */}
          <button
            type="button"
            onClick={onNavigateToFormListGroupFunneling}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#008d91] hover:bg-[#007b7f] text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 items-center text-slate-700 font-semibold text-sm sm:text-base border-b border-slate-200/80 pb-4 mb-3">
            <div className="col-span-3 text-left pl-2">Nama Group Funneling</div>
            <div className="col-span-3 text-left">Jenis Group Jarkom</div>
            <div className="col-span-3 text-center">Aktif/Tidak</div>
            <div className="col-span-2 text-center">Jumlah ID yang bergabung</div>
            <div className="col-span-1 text-right pr-2"></div>
          </div>

          {/* Table Rows */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Tidak ada data group funneling yang sesuai.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredGroups.map((group) => {
                const aktif = isGroupAktif(group.jenisGroup);
                const jumlahId = getJumlahIdYangBergabung(group);
                const isMenuOpen = activeMenuId === group.id;

                return (
                  <div
                    key={group.id}
                    className="grid grid-cols-12 items-center py-4 sm:py-5 hover:bg-slate-50/60 rounded-xl transition-colors text-sm sm:text-base"
                  >
                    {/* Nama Group Funneling */}
                    <div className="col-span-3 text-left pl-2 text-slate-700 font-normal">
                      {group.name}
                    </div>

                    {/* Jenis Group Jarkom */}
                    <div className="col-span-3 text-left text-slate-600 font-normal">
                      {group.jenisGroup || '-'}
                    </div>

                    {/* Aktif/Tidak Pill: Yes (Teal) / No (Coral Red) */}
                    <div className="col-span-3 flex items-center justify-center">
                      {aktif ? (
                        <span className="inline-flex items-center justify-center bg-[#008d91] text-white text-sm font-medium px-7 py-2 rounded-full min-w-[84px] shadow-sm">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center bg-[#f87171] text-white text-sm font-medium px-7 py-2 rounded-full min-w-[84px] shadow-sm">
                          No
                        </span>
                      )}
                    </div>

                    {/* Jumlah ID yang bergabung Pill: Teal */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="inline-flex items-center justify-center bg-[#008d91] text-white text-sm font-medium px-7 py-2 rounded-full min-w-[84px] shadow-sm">
                        {jumlahId}
                      </span>
                    </div>

                    {/* Three Vertical Dots Action Menu */}
                    <div className="col-span-1 flex items-center justify-end pr-2 relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : group.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Opsi"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-2 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-150"
                        >
                          {onNavigateToListGroupFunneling && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onNavigateToListGroupFunneling();
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>Buka di List Group Funneling</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onNavigateToFormListGroupFunneling();
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Tambah Anggota ke Group</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                            className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Hapus Group</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
