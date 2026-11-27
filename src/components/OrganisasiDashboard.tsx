import React, { useMemo, useState } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  Star,
  FolderPlus,
  FolderInput,
  MessageSquare,
  MessageCircle,
  ArrowUpDown,
} from 'lucide-react';
import { DonasiOrder } from '../donasiData';
import {
  DharmaPatronRutinItem,
  ListPMItem,
  OrganisasiItem,
  WhatsappDispatchLog,
} from '../types';
import { IdentitasItem } from '../identitasData';
import { SalurOrder } from '../salurData';
import {
  ResolvedLastContactedSummary,
  resolveLastContactedForOrganisasi,
} from '../utils/lastContactedHelper';
import { FunnelingActionBar } from './FunnelingActionBar';
import {
  CustomerDirectTargetInput,
  ModalKirimWhatsappOtomatis,
} from './ModalKirimWhatsappOtomatis';
import { ModalRiwayatKontakCustomer } from './ModalRiwayatKontakCustomer';

interface OrganisasiDashboardProps {
  items: OrganisasiItem[];
  identitasList: IdentitasItem[];
  listPMList?: ListPMItem[];
  donasiOrders?: DonasiOrder[];
  salurOrders?: SalurOrder[];
  dharmaPatronList?: DharmaPatronRutinItem[];
  currentActorName?: string;
  onContactDispatchCompleted?: (payload: {
    logEntry: WhatsappDispatchLog;
    listPMItem: ListPMItem | null;
    identitasId?: string;
    organisasiId?: string;
    codeId?: string;
  }) => void;
  onAddNew: () => void;
  onEditItem?: (item: OrganisasiItem) => void;
  onDeleteItem?: (id: string) => void;
  onShowToast?: (msg: string) => void;
  onSelectIdentitas?: (identitasId: string) => void;
  onCreateGroupFunneling?: (identitasIds: string[]) => void;
  onTambahKeGroupFunnelingExisting?: (
    targets: { id: string; nama: string; codeId?: string; identitasId?: string; nomorHp?: string; }[]
  ) => void;
  onKirimPM?: (
    targets: { id: string; nama: string; nomorHp?: string; codeId?: string; identitasId?: string; }[]
  ) => void;
  onToggleStarItem?: (id: string) => void;
}

export const OrganisasiDashboard: React.FC<OrganisasiDashboardProps> = ({
  items,
  identitasList,
  listPMList = [],
  donasiOrders = [],
  salurOrders = [],
  dharmaPatronList = [],
  currentActorName = 'Admin Organisasi',
  onContactDispatchCompleted,
  onAddNew,
  onEditItem,
  onDeleteItem,
  onShowToast = (_msg: string) => {},
  onSelectIdentitas,
  onCreateGroupFunneling,
  onTambahKeGroupFunnelingExisting,
  onKirimPM,
  onToggleStarItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCustFilter, setSelectedCustFilter] = useState<string>('ALL');
  const [selectedMediaPartnerFilter, setSelectedMediaPartnerFilter] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [detailModalItem, setDetailModalItem] = useState<OrganisasiItem | null>(null);
  const [waModalItem, setWaModalItem] = useState<OrganisasiItem | null>(null);
  const [contactHistoryModalItem, setContactHistoryModalItem] = useState<OrganisasiItem | null>(null);
  const [lastContactedSort, setLastContactedSort] = useState<'none' | 'desc' | 'asc'>('none');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Starred Organisasi state
  const [localStarredIds, setLocalStarredIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('starred_organisasi_map');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {};
  });

  const isItemStarred = (item: OrganisasiItem) => {
    if (localStarredIds[item.id] !== undefined) return localStarredIds[item.id];
    return !!item.isStarred;
  };

  const handleToggleStar = (id: string) => {
    const item = items.find((i) => i.id === id);
    const current = item ? isItemStarred(item) : false;
    const nextVal = !current;
    setLocalStarredIds((prev) => {
      const updated = { ...prev, [id]: nextVal };
      try {
        localStorage.setItem('starred_organisasi_map', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    if (onToggleStarItem) {
      onToggleStarItem(id);
    }
    onShowToast(nextVal ? 'Bintang ditambahkan' : 'Bintang dihapus');
  };

  // Helper to resolve PIC Org from Identitas data
  const getPicOrgInfo = (item: OrganisasiItem) => {
    const identitas = identitasList.find(
      (i) => i.id === item.picOrgId || (item.picOrgCode && i.codeId === item.picOrgCode)
    );

    if (identitas) {
      return {
        id: identitas.id,
        initial: identitas.avatarInitial || 'B',
        bg: identitas.avatarBg || 'bg-[#0f766e]',
        code: identitas.codeId || '',
        name: identitas.namaLengkap,
        subtitle: identitas.namaPanggilan || identitas.jenisPanggilan || 'PIC',
        phone: identitas.nomorHandPhone,
        isConnected: true,
      };
    }

    return {
      id: null,
      initial: item.picOrgNama ? item.picOrgNama.charAt(0).toUpperCase() : 'B',
      bg: 'bg-[#0f766e]',
      code: item.picOrgCode || '',
      name: item.picOrgNama || '00800 Bhadra Ksanti',
      subtitle: item.picOrgPanggilan || 'Sucek Shi Xian Jen',
      phone: item.hp || '',
      isConnected: false,
    };
  };

  const lastContactedMap = useMemo(() => {
    const map = new Map<string, ResolvedLastContactedSummary>();
    const sources = {
      listPMList,
      donasiOrders,
      salurOrders,
      dharmaPatronList,
    };
    items.forEach((it) => {
      map.set(it.id, resolveLastContactedForOrganisasi(it, identitasList, sources));
    });
    return map;
  }, [items, identitasList, listPMList, donasiOrders, salurOrders, dharmaPatronList]);

  const vipCount = useMemo(
    () => items.filter((it) => it.status === 'VIP').length,
    [items]
  );
  const blacklistCount = useMemo(
    () => items.filter((it) => it.status === 'Blacklist').length,
    [items]
  );

  // Filter and optionally sort items
  const filteredItems = useMemo(() => {
    const base = items.filter((item) => {
      const picInfo = getPicOrgInfo(item);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.namaOrg.toLowerCase().includes(q) ||
          item.jenisOrg.toLowerCase().includes(q) ||
          (item.subOrg && item.subOrg.toLowerCase().includes(q)) ||
          item.hp.toLowerCase().includes(q) ||
          item.pic.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          picInfo.name.toLowerCase().includes(q) ||
          picInfo.code.toLowerCase().includes(q) ||
          picInfo.subtitle.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) {
        return false;
      }

      if (selectedCustFilter !== 'ALL') {
        const isCustVal = selectedCustFilter === 'YES';
        if (item.isCust !== isCustVal) return false;
      }

      if (selectedMediaPartnerFilter !== 'ALL') {
        const isMediaVal = selectedMediaPartnerFilter === 'YES';
        if (item.mediaPartner !== isMediaVal) return false;
      }

      return true;
    });

    if (lastContactedSort === 'none') return base;
    return [...base].sort((a, b) => {
      const tsA = lastContactedMap.get(a.id)?.latestTimestampMs || 0;
      const tsB = lastContactedMap.get(b.id)?.latestTimestampMs || 0;
      return lastContactedSort === 'desc' ? tsB - tsA : tsA - tsB;
    });
  }, [
    items,
    identitasList,
    searchQuery,
    selectedStatusFilter,
    selectedCustFilter,
    selectedMediaPartnerFilter,
    lastContactedSort,
    lastContactedMap,
  ]);

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  const isAllStarred =
    filteredItems.length > 0 &&
    filteredItems.every((item) => isItemStarred(item));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleStarAll = () => {
    const nextVal = !isAllStarred;
    setLocalStarredIds((prev) => {
      const updated = { ...prev };
      filteredItems.forEach((i) => {
        updated[i.id] = nextVal;
      });
      try {
        localStorage.setItem('starred_organisasi_map', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    onShowToast(nextVal ? 'Semua organisasi diberi bintang' : 'Semua bintang dihapus');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getTargetFromOrg = (item: OrganisasiItem) => {
    const pic = getPicOrgInfo(item);
    return {
      id: pic.id || item.id,
      identitasId: pic.id || item.id,
      nama: item.namaOrg + (pic.name ? ` (${pic.name})` : ''),
      nomorHp: pic.phone || item.hp,
      codeId: pic.code || item.picOrgCode,
    };
  };

  const getSelectedTargetItems = () => {
    return items
      .filter((i) => selectedIds.includes(i.id))
      .map(getTargetFromOrg);
  };

  const handleBulkCreateGroupFunneling = () => {
    const targets = getSelectedTargetItems();
    if (targets.length === 0) {
      onShowToast('Pilih setidaknya satu organisasi');
      return;
    }
    const ids = targets.map((t) => t.identitasId || t.id).filter(Boolean);
    if (onCreateGroupFunneling) {
      onCreateGroupFunneling(ids);
    }
  };

  const handleBulkTambahKeGroupExisting = () => {
    const targets = getSelectedTargetItems();
    if (targets.length === 0) {
      onShowToast('Pilih setidaknya satu organisasi');
      return;
    }
    if (onTambahKeGroupFunnelingExisting) {
      onTambahKeGroupFunnelingExisting(targets);
    }
  };

  const handleBulkKirimPM = () => {
    const targets = getSelectedTargetItems();
    if (targets.length === 0) {
      onShowToast('Pilih setidaknya satu organisasi');
      return;
    }
    if (onKirimPM) {
      onKirimPM(targets);
    }
  };

  const buildOrgWaTarget = (org: OrganisasiItem): CustomerDirectTargetInput => {
    const pic = getPicOrgInfo(org);
    const summary =
      lastContactedMap.get(org.id) ||
      resolveLastContactedForOrganisasi(org, identitasList, {
        listPMList,
        donasiOrders,
        salurOrders,
        dharmaPatronList,
      });
    const bestPhone =
      (org.hp && org.hp.trim() !== '-' ? org.hp.trim() : '') ||
      (pic.phone && pic.phone.trim() !== '-' ? pic.phone.trim() : '');
    return {
      organisasiId: org.id,
      identitasId: pic.id || undefined,
      codeId: pic.code || org.picOrgCode || undefined,
      nama: org.namaOrg,
      panggilan: pic.name && pic.name !== '-' ? `${pic.name} (${org.jenisOrg})` : org.jenisOrg,
      phone: bestPhone,
      status: org.status,
      lastContactedDisplay: summary.hasContactHistory ? summary.displayDate : undefined,
      existingHistory: org.whatsappContactHistory || [],
    };
  };

  return (
    <div className="w-full">
      {/* Top Toolbar: Quick Status Filter + Search, Filter, + Add */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80"
          role="tablist"
          aria-label="Filter status organisasi"
        >
          <button
            type="button"
            onClick={() => setSelectedStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              selectedStatusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatusFilter('VIP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              selectedStatusFilter === 'VIP'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            VIP ({vipCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatusFilter('Blacklist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              selectedStatusFilter === 'Blacklist'
                ? 'bg-rose-600 text-white shadow-2xs'
                : blacklistCount > 0
                ? 'text-rose-700 hover:bg-rose-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blacklist ({blacklistCount})
          </button>
        </div>

        <div className="flex items-center justify-end gap-3.5 ml-auto">
        {/* Toggle Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama org, HP, PIC..."
              autoFocus
              className="text-xs text-slate-700 outline-none w-44 sm:w-64"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-slate-400 hover:text-slate-600 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Cari"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        {/* EyeOff Icon */}
        <button
          type="button"
          onClick={() => onShowToast('Fitur visibilitas kolom organisasi')}
          title="Sembunyikan / Tampilkan"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders / Filter Icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Filter Data"
            className={`transition-colors p-1 cursor-pointer ${
              isFilterOpen ||
              selectedStatusFilter !== 'ALL' ||
              selectedCustFilter !== 'ALL' ||
              selectedMediaPartnerFilter !== 'ALL'
                ? 'text-[#05828e]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-3.5 z-40 animate-in fade-in duration-150 text-left">
              <div className="text-xs font-semibold text-slate-700 mb-2">Filter Status</div>
              <div className="space-y-1 mb-3">
                {['ALL', 'VIP', 'Blacklist', '-'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                      selectedStatusFilter === st
                        ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua Status' : st}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-700 mb-2">Filter Cust?</div>
              <div className="space-y-1 mb-3">
                {[
                  { label: 'Semua', val: 'ALL' },
                  { label: 'Yes (Pelanggan/Donatur)', val: 'YES' },
                  { label: 'No', val: 'NO' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelectedCustFilter(item.val)}
                    className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                      selectedCustFilter === item.val
                        ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-700 mb-2">Filter Media Partner</div>
              <div className="space-y-1 mb-3">
                {[
                  { label: 'Semua', val: 'ALL' },
                  { label: 'Yes', val: 'YES' },
                  { label: '-', val: 'NO' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelectedMediaPartnerFilter(item.val)}
                    className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                      selectedMediaPartnerFilter === item.val
                        ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {(selectedStatusFilter !== 'ALL' ||
                selectedCustFilter !== 'ALL' ||
                selectedMediaPartnerFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatusFilter('ALL');
                    setSelectedCustFilter('ALL');
                    setSelectedMediaPartnerFilter('ALL');
                  }}
                  className="w-full text-center text-xs text-red-600 hover:underline pt-2 border-t border-slate-100"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Toolbar selection action buttons */}
        {selectedIds.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkCreateGroupFunneling}
              className="bg-[#008d91] text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-[#00787c] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Buat Group Funneling baru dengan data organisasi terpilih"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Group Funneling ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={handleBulkTambahKeGroupExisting}
              className="bg-white border border-[#008d91] text-[#008d91] px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-teal-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Tambah ke Group Funneling yang sudah ada"
            >
              <FolderInput className="w-3.5 h-3.5" />
              <span>Tambah ke Existing</span>
            </button>
            {onKirimPM && (
              <button
                type="button"
                onClick={handleBulkKirimPM}
                className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Kirim PM ke data terpilih"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                <span>Kirim PM</span>
              </button>
            )}
          </div>
        )}

        {/* + Add Button */}
        <button
          id="btn-add-organisasi"
          type="button"
          onClick={onAddNew}
          className="bg-[#05828e] text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#046c76] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[13px] font-semibold text-[#475569]">
                {/* Select All Checkbox & Star di sebelah checklist */}
                <th className="py-4 pl-4 pr-2 w-16 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isAllSelected
                          ? 'bg-[#008d91] border-[#008d91] text-white'
                          : selectedIds.length > 0
                          ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                          : 'border-slate-300 bg-white hover:border-[#008d91]'
                      }`}
                      title={isAllSelected ? 'Batal pilih semua' : 'Pilih semua'}
                      aria-label={isAllSelected ? 'Batal pilih semua' : 'Pilih semua'}
                    >
                      {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {!isAllSelected && selectedIds.length > 0 && (
                        <div className="w-2.5 h-0.5 bg-[#008d91] rounded-full" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleStarAll}
                      className="p-1 rounded-md transition-all hover:scale-110 active:scale-95 cursor-pointer text-slate-300 hover:text-amber-400 shrink-0"
                      title={isAllStarred ? 'Hapus semua bintang' : 'Beri bintang semua'}
                      aria-label={isAllStarred ? 'Hapus semua bintang' : 'Beri bintang semua'}
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          isAllStarred
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-none text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  </div>
                </th>
                <th className="py-4 px-4 w-[280px]">Nama Org.</th>
                <th className="py-4 px-4 w-[160px]">Sub Org.</th>
                <th className="py-4 px-4 w-[130px]">HP</th>
                <th className="py-4 px-4 w-[240px]">PIC Org.</th>
                <th className="py-4 px-4 text-center whitespace-nowrap leading-tight">
                  <div>Media</div>
                  <div>Partner?</div>
                </th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Cust?</th>
                <th className="py-4 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() =>
                      setLastContactedSort((prev) =>
                        prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none'
                      )
                    }
                    className="inline-flex items-center gap-1 hover:text-[#05828e] transition-colors cursor-pointer"
                    title="Urutkan berdasarkan kontak terakhir"
                  >
                    <span>Last Contacted?</span>
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 ${
                        lastContactedSort !== 'none' ? 'text-[#05828e]' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </th>
                <th className="py-4 px-4 text-center">PIC YPPLN</th>
                <th className="py-4 px-4 w-[84px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
              {filteredItems.map((item) => {
                const isMenuOpen = activeMenuId === item.id;
                const isSelected = selectedIds.includes(item.id);
                const picInfo = getPicOrgInfo(item);
                const contactSummary =
                  lastContactedMap.get(item.id) ||
                  resolveLastContactedForOrganisasi(item, identitasList, {
                    listPMList,
                    donasiOrders,
                    salurOrders,
                    dharmaPatronList,
                  });

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition-colors group relative ${
                      isSelected ? 'bg-teal-50/20' : ''
                    }`}
                  >
                    {/* Select Checkbox & Star di sebelah checklist */}
                    <td className="py-3.5 pl-4 pr-2 w-16 text-center align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(item.id);
                          }}
                          className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isSelected
                              ? 'bg-[#008d91] border-[#008d91] text-white'
                              : 'border-slate-300 bg-white hover:border-[#008d91]'
                          }`}
                          title={isSelected ? 'Batal pilih' : 'Pilih organisasi'}
                          aria-label={isSelected ? 'Batal pilih' : 'Pilih organisasi'}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(item.id);
                          }}
                          className="p-1 rounded-md transition-all hover:scale-110 active:scale-95 cursor-pointer text-slate-300 hover:text-amber-400 shrink-0"
                          title={isItemStarred(item) ? 'Hapus bintang' : 'Beri bintang'}
                          aria-label={isItemStarred(item) ? 'Hapus bintang' : 'Beri bintang'}
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              isItemStarred(item)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-none text-slate-300 hover:text-amber-400'
                            }`}
                          />
                        </button>
                      </div>
                    </td>

                    {/* Nama Org. Column with Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5">
                        {/* Avatar Initial Circle */}
                        <div
                          className={`w-11 h-11 rounded-full ${
                            item.avatarBg || 'bg-[#10b981]'
                          } text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs`}
                        >
                          {item.avatarInitial || item.namaOrg.charAt(0).toUpperCase()}
                        </div>
                        {/* Nama Organisasi + Subtitle Jenis Organisasi */}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 tracking-tight leading-snug">
                            {item.namaOrg}
                          </div>
                          <div className="text-xs text-slate-400 font-normal leading-tight mt-0.5">
                            {item.jenisOrg}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sub Org. (supports multi-line text) */}
                    <td className="py-3.5 px-4 text-slate-700 font-normal whitespace-pre-line leading-snug">
                      {item.subOrg || ''}
                    </td>

                    {/* HP */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-normal">
                      {item.hp}
                    </td>

                    {/* PIC Org. (Terkoneksi dengan data 'Identitas') */}
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => {
                          if (picInfo.id && onSelectIdentitas) {
                            onSelectIdentitas(picInfo.id);
                          }
                        }}
                        title={
                          picInfo.isConnected
                            ? `Terkoneksi dengan data Identitas: ${picInfo.name} (${picInfo.code})`
                            : 'PIC Organisasi'
                        }
                        className={`flex items-center gap-3 ${
                          picInfo.id && onSelectIdentitas
                            ? 'cursor-pointer hover:opacity-80 transition-opacity'
                            : ''
                        }`}
                      >
                        {/* Avatar Initial Circle of PIC */}
                        <div
                          className={`w-11 h-11 rounded-full ${picInfo.bg} text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs`}
                        >
                          {picInfo.initial}
                        </div>
                        {/* Code + Full Name + Panggilan */}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 tracking-tight leading-snug flex items-center gap-1.5">
                            <span>
                              {picInfo.code ? `${picInfo.code} ` : ''}
                              {picInfo.name}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-normal leading-tight mt-0.5">
                            {picInfo.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Media Partner? (Teal Pill "Yes" or "-") */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.mediaPartner ? (
                        <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#05828e] text-white shadow-xs">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">-</span>
                      )}
                    </td>

                    {/* Status (VIP / Blacklist / -) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          item.status === 'VIP'
                            ? 'text-amber-700'
                            : item.status === 'Blacklist'
                            ? 'text-rose-700'
                            : 'text-slate-500 font-normal'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Cust? Badge (Teal pill "Yes" or Coral red pill "No") */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.isCust ? (
                        <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#05828e] text-white shadow-xs">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#f87171] text-white shadow-xs">
                          No
                        </span>
                      )}
                    </td>

                    {/* Last Contacted? */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setContactHistoryModalItem(item)}
                        className="text-left group/lc cursor-pointer rounded-lg px-2 py-1 -mx-2 hover:bg-teal-50/70 transition-colors"
                        title="Klik untuk melihat riwayat kontak organisasi & kirim WA"
                      >
                        <div className="text-[13px] font-medium text-slate-800 group-hover/lc:text-[#05828e] tabular-nums leading-tight">
                          {contactSummary.displayDate}
                        </div>
                        <div className="text-[11px] leading-tight mt-0.5 text-slate-500">
                          {contactSummary.hasContactHistory ? (
                            <>
                              {contactSummary.relativeLabel && (
                                <span className="font-semibold text-emerald-700">
                                  {contactSummary.relativeLabel}
                                  {' · '}
                                </span>
                              )}
                              <span>{contactSummary.channelLabel}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">Belum dikontak</span>
                          )}
                        </div>
                      </button>
                    </td>

                    {/* PIC YPPLN Badge (Teal pill with name or "-") */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block min-w-[76px] py-1 px-3.5 rounded-full text-xs font-semibold bg-[#05828e] text-white shadow-xs">
                        {item.picYppln || item.pic || '-'}
                      </span>
                    </td>

                    {/* Quick WA + 3 dots action menu */}
                    <td className="py-3.5 px-4 text-right relative whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWaModalItem(item);
                          }}
                          title={`Kirim WhatsApp ke ${item.namaOrg}`}
                          aria-label={`Kirim WhatsApp ke ${item.namaOrg}`}
                          className="p-1.5 rounded-lg text-[#05828e] hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : item.id)
                          }
                          title="Opsi"
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-6 top-10 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in duration-100 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setWaModalItem(item);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-[#05828e] font-semibold hover:bg-teal-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#05828e]" />
                            <span>Kirim WhatsApp Sekarang</span>
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              const target = getTargetFromOrg(item);
                              if (onCreateGroupFunneling && target.identitasId) {
                                onCreateGroupFunneling([target.identitasId]);
                              }
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FolderPlus className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Create Group Funneling</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              const target = getTargetFromOrg(item);
                              if (onTambahKeGroupFunnelingExisting) {
                                onTambahKeGroupFunnelingExisting([target]);
                              }
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FolderInput className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Tambah ke Existing</span>
                          </button>
                          {onKirimPM && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                const target = getTargetFromOrg(item);
                                onKirimPM([target]);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#008d91]" />
                              <span>Kirim PM</span>
                            </button>
                          )}
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onEditItem) onEditItem(item);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Data</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setDetailModalItem(item);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>Detail Info</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (onDeleteItem) onDeleteItem(item.id);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data organisasi yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar when items selected */}
      <FunnelingActionBar
        selectedCount={selectedIds.length}
        itemLabel="organisasi"
        onClearSelection={() => setSelectedIds([])}
        onCreateGroupFunneling={handleBulkCreateGroupFunneling}
        onTambahKeGroupExisting={handleBulkTambahKeGroupExisting}
        onKirimPM={onKirimPM ? handleBulkKirimPM : undefined}
      />

      {/* Detail Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${
                    detailModalItem.avatarBg || 'bg-[#10b981]'
                  } text-white flex items-center justify-center font-bold text-base shadow-xs`}
                >
                  {detailModalItem.avatarInitial ||
                    detailModalItem.namaOrg.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">
                    {detailModalItem.namaOrg}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {detailModalItem.jenisOrg}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Sub Organisasi:</span>
                <span className="font-semibold text-slate-700 whitespace-pre-line text-right">
                  {detailModalItem.subOrg || '-'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Nomor HP / Telp:</span>
                <span className="font-semibold text-slate-700">{detailModalItem.hp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">PIC Organisasi (Terkoneksi Identitas):</span>
                <span className="font-semibold text-slate-700 text-right">
                  {(() => {
                    const pic = getPicOrgInfo(detailModalItem);
                    return `${pic.code ? pic.code + ' ' : ''}${pic.name} (${pic.subtitle})`;
                  })()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Media Partner:</span>
                <span className="font-semibold text-slate-700">
                  {detailModalItem.mediaPartner ? 'Yes' : '-'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-slate-700">{detailModalItem.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Cust? (Donatur / Pelanggan):</span>
                <span className="font-semibold text-slate-700">
                  {detailModalItem.isCust ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">PIC YPPLN:</span>
                <span className="font-semibold text-slate-700">
                  {detailModalItem.picYppln || detailModalItem.pic || '-'}
                </span>
              </div>
              {detailModalItem.kota && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Lokasi:</span>
                  <span className="font-semibold text-slate-700">
                    {detailModalItem.kota}, {detailModalItem.provinsi}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const it = detailModalItem;
                  setDetailModalItem(null);
                  if (onEditItem) onEditItem(it);
                }}
                className="px-4 py-2 bg-[#05828e] text-white text-xs font-semibold rounded-lg hover:bg-[#046c76] transition-colors"
              >
                Edit Data
              </button>
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Riwayat Kontak Organisasi */}
      {contactHistoryModalItem && (
        <ModalRiwayatKontakCustomer
          isOpen={!!contactHistoryModalItem}
          onClose={() => setContactHistoryModalItem(null)}
          customerName={contactHistoryModalItem.namaOrg}
          customerPanggilan={contactHistoryModalItem.jenisOrg}
          customerStatus={contactHistoryModalItem.status}
          phone={
            contactHistoryModalItem.hp && contactHistoryModalItem.hp !== '-'
              ? contactHistoryModalItem.hp
              : getPicOrgInfo(contactHistoryModalItem).phone
          }
          avatarInitial={
            contactHistoryModalItem.avatarInitial ||
            contactHistoryModalItem.namaOrg.charAt(0).toUpperCase()
          }
          avatarBg={contactHistoryModalItem.avatarBg || 'bg-[#10b981]'}
          summary={
            lastContactedMap.get(contactHistoryModalItem.id) ||
            resolveLastContactedForOrganisasi(contactHistoryModalItem, identitasList, {
              listPMList,
              donasiOrders,
              salurOrders,
              dharmaPatronList,
            })
          }
          onSendWhatsappNow={() => setWaModalItem(contactHistoryModalItem)}
        />
      )}

      {/* Modal Kirim WhatsApp Langsung untuk Organisasi */}
      <ModalKirimWhatsappOtomatis
        isOpen={!!waModalItem}
        onClose={() => setWaModalItem(null)}
        kind="customer_direct"
        customerTarget={waModalItem ? buildOrgWaTarget(waModalItem) : null}
        identitasList={identitasList}
        organisasiList={items}
        currentActorName={currentActorName}
        onDispatchCompleted={(payload) => {
          onContactDispatchCompleted?.({
            logEntry: payload.logEntry,
            listPMItem: payload.listPMItem,
            identitasId: payload.identitasId,
            organisasiId: payload.organisasiId || waModalItem?.id,
            codeId: payload.codeId,
          });
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
