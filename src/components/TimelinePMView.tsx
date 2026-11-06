import React, { useState, useMemo } from 'react';
import {
  Flower2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  Calendar,
  MessageCircle,
  Rocket,
  ShoppingCart,
  User,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  Receipt,
  X,
  Sparkles,
  Users,
  Building2,
  Tag,
  DollarSign,
  Info,
} from 'lucide-react';
import {
  TimelinePMJourney,
  TimelinePMNode,
  TimelinePMBranch,
  TimelinePMSubStep,
  TimelinePMTransaction,
  AppView,
} from '../types';
import {
  loadTimelinePMJourneys,
  saveTimelinePMJourneys,
  INITIAL_TIMELINE_PM_JOURNEYS,
} from '../timelinePMData';
import { INITIAL_IDENTITAS } from '../identitasData';
import { INITIAL_ORGANISASI } from '../organisasiData';
import { INITIAL_FUNNELING_GROUPS } from '../funnelingData';

interface TimelinePMViewProps {
  onNavigateView?: (view: AppView) => void;
  onShowToast?: (msg: string) => void;
}

const MONTHS = [
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
  'Jan',
  'Feb',
];

export const TimelinePMView: React.FC<TimelinePMViewProps> = ({
  onNavigateView,
  onShowToast = (_msg: string) => {},
}) => {
  // Main journeys state
  const [journeys, setJourneys] = useState<TimelinePMJourney[]>(() =>
    loadTimelinePMJourneys()
  );

  // Active month in the timeline slider (default: 'Nov' matching image)
  const [selectedMonth, setSelectedMonth] = useState<string>('Nov');

  // Filter settings: target entity (all, specific group funneling, identitas ID, organisasi ID)
  const [selectedFilterType, setSelectedFilterType] = useState<
    'all' | 'groupFunneling' | 'identitas' | 'organisasi'
  >('all');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');

  // Search query & visibility toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showTransactionBadges, setShowTransactionBadges] = useState(true);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Announcement bubble carousel state
  const announcements = [
    'Monitoring Perjalanan PM Periode November 2021 — 2 Group Terpantau, Transaksi Berhasil Terverifikasi.',
    'Pembaruan Funneling: Peserta Bedah Buku A telah dialirkan ke promosi Buku Hidup Bahagia.',
    'Integrasi Transaksi Real-Time: Pembelian dan Donasi otomatis ditandai pada node perjalanan PM.',
  ];
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  // Modal inspection states
  const [activeTransaction, setActiveTransaction] =
    useState<TimelinePMTransaction | null>(null);
  const [activeNode, setActiveNode] = useState<{
    node: TimelinePMNode;
    journeyName: string;
  } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New journey form state
  const [newTargetType, setNewTargetType] = useState<
    'groupFunneling' | 'identitas' | 'organisasi'
  >('groupFunneling');
  const [newTargetName, setNewTargetName] = useState('Group C');
  const [newAudienceCount, setNewAudienceCount] = useState(150);

  // Save journeys to localStorage
  const handleSaveJourneys = (updated: TimelinePMJourney[]) => {
    setJourneys(updated);
    saveTimelinePMJourneys(updated);
  };

  // Filtered journeys based on selected entity & search query
  const filteredJourneys = useMemo(() => {
    return journeys.filter((j) => {
      // Type & Entity filter
      if (selectedFilterType !== 'all' && j.targetType !== selectedFilterType) {
        return false;
      }
      if (selectedEntityId !== 'all' && j.targetId !== selectedEntityId) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = j.targetName.toLowerCase().includes(q);
        const matchesNodes = j.nodes.some(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.subtitle.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesNodes) return false;
      }

      return true;
    });
  }, [journeys, selectedFilterType, selectedEntityId, searchQuery]);

  // Handler to add new journey
  const handleAddNewJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName.trim()) return;

    const newJourney: TimelinePMJourney = {
      id: `journey-${Date.now()}`,
      targetType: newTargetType,
      targetId: `target-${Date.now()}`,
      targetName: newTargetName.trim(),
      audienceCount: Number(newAudienceCount) || 1,
      audienceLabel: `${Number(newAudienceCount) || 1} orang`,
      avatarCluster: [
        { initial: newTargetName.charAt(0).toUpperCase(), bg: 'bg-[#008d91]' },
        { initial: '+', bg: 'bg-[#94a3b8]' },
      ],
      nodes: [
        {
          id: `node-${Date.now()}-1`,
          type: 'chat',
          icon: 'chat',
          title: 'Chat A',
          subtitle: 'Ajakan A',
          durationAfter: '2 Bulan',
          month: selectedMonth,
        },
        {
          id: `node-${Date.now()}-2`,
          type: 'event',
          icon: 'rocket',
          title: 'Promosi Event',
          subtitle: 'Bedah Buku A',
          durationAfter: '3 Bulan',
          month: selectedMonth,
          midBranchTransaction: {
            id: `branch-tx-${Date.now()}`,
            letter: 'A',
            title: 'Transaksi Penjualan Buku',
            subSteps: [
              {
                id: `sub-tx-${Date.now()}-1`,
                icon: 'cart',
                label: 'Pembelian Buku',
                subtitle: 'Buku Hidup Bahagia',
                isTransaction: true,
                transactionData: {
                  id: `tx-${Date.now()}`,
                  orderNumber: `CC ${Math.floor(100000000 + Math.random() * 900000000)}`,
                  nominal: 'Rp150.000',
                  item: 'Buku Hidup Bahagia (1x)',
                  date: '14 Nov 2021',
                  pembeli: newTargetName,
                  status: 'Paid',
                },
              },
              {
                id: `sub-tx-${Date.now()}-2`,
                icon: 'document',
                label: 'Kuitansi Pembayaran',
                isTransaction: true,
              },
              {
                id: `sub-tx-${Date.now()}-3`,
                icon: 'user',
                label: 'Konfirmasi Donatur',
                isTransaction: true,
              },
            ],
          },
        },
        {
          id: `node-${Date.now()}-3`,
          type: 'buku',
          icon: 'cart',
          title: 'Promosi Buku',
          subtitle: 'Buku Hidup Bahagia',
          durationAfter: '2 Bulan',
          month: selectedMonth,
        },
        {
          id: `node-${Date.now()}-4`,
          type: 'dana',
          icon: 'user',
          title: 'Promosi Dana',
          subtitle: 'Dana Banjir',
          month: selectedMonth,
        },
      ],
    };

    handleSaveJourneys([...journeys, newJourney]);
    setIsAddModalOpen(false);
    onShowToast(`Perjalanan PM untuk "${newTargetName}" berhasil ditambahkan.`);
  };

  // Helper to render node icon
  const renderNodeIcon = (icon: string, className = 'w-5 h-5') => {
    switch (icon) {
      case 'chat':
        return <MessageCircle className={className} />;
      case 'rocket':
        return <Rocket className={className} />;
      case 'cart':
        return <ShoppingCart className={className} />;
      case 'user':
        return <User className={className} />;
      case 'document':
        return <FileText className={className} />;
      default:
        return <MessageCircle className={className} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        {/* Left: Title + Mascot/App Logo + Teal Speech Bubble */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Timeline PM
          </h1>

          {/* Logo / Mascot Switcher Container */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setAnnouncementIndex((prev) =>
                  prev === 0 ? announcements.length - 1 : prev - 1
                )
              }
              title="Pengumuman Sebelumnya"
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Application Lotus/Brand Logo in round container */}
            <div
              title="YPPLN Proyek SAPA"
              className="w-10 h-10 rounded-full bg-amber-400 p-0.5 shadow-xs flex items-center justify-center ring-2 ring-amber-300/60 shrink-0"
            >
              <div className="w-full h-full rounded-full bg-[#008d91] text-white flex items-center justify-center">
                <Flower2 className="w-5 h-5 stroke-[2.3]" />
              </div>
            </div>

            {/* Teal Speech Bubble */}
            <div className="relative bg-[#008d91] text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl max-w-md shadow-xs flex items-center gap-2">
              <div
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 
                border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-[#008d91]"
              />
              <span className="line-clamp-1 leading-snug">
                {announcements[announcementIndex]}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setAnnouncementIndex((prev) => (prev + 1) % announcements.length)
              }
              title="Pengumuman Berikutnya"
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Clock + Date + More Options */}
        <div className="flex items-center gap-4 self-end lg:self-auto">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-light text-slate-700 tracking-tight leading-none">
              09:59
            </div>
            <div className="text-xs font-semibold text-[#008d91] mt-0.5">
              Senin, 15 November 2021
            </div>
          </div>

          <button
            type="button"
            title="Menu Opsi"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. ACTIONS & ENTITY FILTER ROW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 pt-2">
        {/* Quick action buttons matching image: Eye, Search, Sliders, + Add */}
        <div className="flex items-center gap-2">
          {/* Eye Toggle (Tandai / Sembunyikan Detail Transaksi) */}
          <button
            type="button"
            onClick={() => {
              setShowTransactionBadges(!showTransactionBadges);
              onShowToast(
                showTransactionBadges
                  ? 'Penanda transaksi disembunyikan'
                  : 'Penanda transaksi ditampilkan'
              );
            }}
            title={
              showTransactionBadges
                ? 'Sembunyikan Penanda Transaksi'
                : 'Tampilkan Penanda Transaksi'
            }
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              showTransactionBadges
                ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                : 'border-teal-200 bg-teal-50 text-[#008d91]'
            }`}
          >
            {showTransactionBadges ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {/* Search Toggle */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-[#008d91] rounded-xl px-2.5 py-1.5 shadow-xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari PM / Peserta / Event..."
                  className="text-xs outline-hidden w-36 sm:w-48 text-slate-700 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Cari Perjalanan PM"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Sliders */}
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            title="Filter Tipe Entitas"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              selectedFilterType !== 'all'
                ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* + Add Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#008d91] hover:bg-[#05828e] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Entity Selector Pill Card matching image */}
        <div className="relative">
          <div
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="bg-[#008d91] text-white rounded-2xl pl-3.5 pr-1.5 py-1.5 flex items-center gap-3 shadow-xs cursor-pointer hover:bg-[#05828e] transition-colors"
          >
            <div className="text-left">
              <div className="text-[10px] text-teal-100 font-medium tracking-wide">
                Identitas ID/Organisasi ID/G. Funneling
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-tight">
                {selectedFilterType === 'all'
                  ? 'Group A, Group B'
                  : selectedFilterType === 'groupFunneling'
                  ? 'Group Funneling'
                  : selectedFilterType === 'identitas'
                  ? 'Identitas ID'
                  : 'Organisasi ID'}
              </div>
            </div>

            {/* Calendar Icon Button */}
            <div className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shrink-0 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {/* Dropdown Menu for Entity Filter */}
          {isFilterDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 p-3 space-y-2 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-slate-700 px-2 py-1">
                Filter Tampilan Perjalanan PM:
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilterType('all');
                    setSelectedEntityId('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    selectedFilterType === 'all'
                      ? 'bg-teal-50 text-[#008d91]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Semua Group (Group A, Group B)</span>
                  {selectedFilterType === 'all' && (
                    <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilterType('groupFunneling');
                    setSelectedEntityId('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    selectedFilterType === 'groupFunneling'
                      ? 'bg-teal-50 text-[#008d91]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Hanya Group Funneling</span>
                  </span>
                  {selectedFilterType === 'groupFunneling' && (
                    <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilterType('identitas');
                    setSelectedEntityId('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    selectedFilterType === 'identitas'
                      ? 'bg-teal-50 text-[#008d91]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Identitas ID (Perorangan)</span>
                  </span>
                  {selectedFilterType === 'identitas' && (
                    <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilterType('organisasi');
                    setSelectedEntityId('all');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    selectedFilterType === 'organisasi'
                      ? 'bg-teal-50 text-[#008d91]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Organisasi ID (Mitra / Lembaga)</span>
                  </span>
                  {selectedFilterType === 'organisasi' && (
                    <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MONTH SLIDER / TIMELINE TRACK BAR */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 py-3 overflow-x-auto no-scrollbar">
        {/* Previous Month */}
        <button
          type="button"
          onClick={() => {
            const idx = MONTHS.indexOf(selectedMonth);
            if (idx > 0) setSelectedMonth(MONTHS[idx - 1]);
          }}
          disabled={MONTHS.indexOf(selectedMonth) === 0}
          className="w-8 h-8 rounded-full bg-[#008d91] text-white hover:bg-[#05828e] disabled:opacity-40 disabled:hover:bg-[#008d91] flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Circular Month Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {MONTHS.map((m) => {
            const isSelected = selectedMonth === m;
            return (
              <div key={m} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#008d91] text-white shadow-md scale-105 ring-2 ring-teal-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
                {isSelected && (
                  <div className="w-8 h-1 bg-[#008d91] rounded-full mt-1.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Next Month */}
        <button
          type="button"
          onClick={() => {
            const idx = MONTHS.indexOf(selectedMonth);
            if (idx < MONTHS.length - 1) setSelectedMonth(MONTHS[idx + 1]);
          }}
          disabled={MONTHS.indexOf(selectedMonth) === MONTHS.length - 1}
          className="w-8 h-8 rounded-full bg-[#008d91] text-white hover:bg-[#05828e] disabled:opacity-40 disabled:hover:bg-[#008d91] flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. MAIN TIMELINE TRACKS (PER GROUP / ENTITY) */}
      <div className="space-y-12 sm:space-y-16 pt-4">
        {filteredJourneys.map((journey) => (
          <div
            key={journey.id}
            className="flex flex-col xl:flex-row items-start xl:items-center gap-6 xl:gap-10 pb-8 border-b border-slate-100 last:border-none"
          >
            {/* Left Entity Card: Overlapping avatars + Audience count */}
            <div className="flex items-center gap-3 shrink-0 w-52">
              <div className="flex items-center -space-x-2.5">
                {journey.avatarCluster.map((av, idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-9 rounded-full ${av.bg} text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs`}
                  >
                    {av.initial}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  {journey.targetName}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {journey.audienceLabel}
                </div>
              </div>
            </div>

            {/* Right Flowchart Journey Track matching image.png */}
            <div className="flex-1 overflow-x-auto pb-6 pt-2 w-full">
              <div className="min-w-[760px] flex items-start gap-0 relative">
                {/* Node 1: Chat A */}
                <div className="flex flex-col items-center relative z-10 w-28 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveNode({
                        node: journey.nodes[0],
                        journeyName: journey.targetName,
                      })
                    }
                    className="w-12 h-12 rounded-2xl bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {renderNodeIcon(journey.nodes[0]?.icon || 'chat')}
                  </button>
                  <div className="mt-3">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">
                      {journey.nodes[0]?.title || 'Chat A'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {journey.nodes[0]?.subtitle || 'Ajakan A'}
                    </div>
                  </div>
                </div>

                {/* Connector 1: 2 Bulan Line */}
                <div className="flex-1 flex flex-col items-center justify-center pt-3 px-1 relative">
                  <div className="w-full h-1.5 bg-[#008d91] rounded-full" />
                  <div className="absolute top-0 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600 shadow-2xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{journey.nodes[0]?.durationAfter || '2 Bulan'}</span>
                  </div>
                </div>

                {/* Node 2: Promosi Event */}
                <div className="flex flex-col items-center relative z-10 w-32 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveNode({
                        node: journey.nodes[1],
                        journeyName: journey.targetName,
                      })
                    }
                    className="w-12 h-12 rounded-2xl bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {renderNodeIcon(journey.nodes[1]?.icon || 'rocket')}
                  </button>
                  <div className="mt-3">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">
                      {journey.nodes[1]?.title || 'Promosi Event'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {journey.nodes[1]?.subtitle || 'Bedah Buku A'}
                    </div>
                  </div>

                  {/* Branch B: Dashed vertical line + Circle B + Rocket icon */}
                  {journey.nodes[1]?.branch && (
                    <div className="flex flex-col items-center mt-3 relative">
                      <div className="w-0.5 h-16 border-l-2 border-dashed border-[#008d91]" />
                      {/* Ring Circle */}
                      <div className="w-5 h-5 rounded-full border-2 border-[#008d91] bg-white -mt-1" />
                      {/* Circle B */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-10 h-10 rounded-full bg-[#0ea5e9] text-white font-bold text-base flex items-center justify-center shadow-xs">
                          {journey.nodes[1].branch.letter}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#008d91] text-white flex items-center justify-center shadow-xs">
                          <Rocket className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Connector 2: 3 Bulan Line + Mid Branch Transaction (Branch A) */}
                <div className="flex-1 flex flex-col items-center justify-center pt-3 px-1 relative">
                  <div className="w-full h-1.5 bg-[#008d91] rounded-full" />
                  <div className="absolute top-0 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600 shadow-2xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{journey.nodes[1]?.durationAfter || '3 Bulan'}</span>
                  </div>

                  {/* Mid Branch: Vertical Dashed Line leading to Branch A (TRANSAKSI) */}
                  {journey.nodes[1]?.midBranchTransaction && (
                    <div className="flex flex-col items-center mt-3 pt-5 relative">
                      <div className="w-0.5 h-14 border-l-2 border-dashed border-[#008d91]" />
                      {/* Ring Circle */}
                      <div className="w-5 h-5 rounded-full border-2 border-[#008d91] bg-white -mt-1" />

                      {/* Horizontal Track for Branch A (Cart, Doc, User) */}
                      <div className="flex items-center gap-2 mt-2 relative">
                        {/* Circle A */}
                        <div className="w-10 h-10 rounded-full bg-[#1e40af] text-white font-bold text-base flex items-center justify-center shadow-xs">
                          {journey.nodes[1].midBranchTransaction.letter}
                        </div>

                        {/* Substeps: Cart, Doc, User */}
                        {journey.nodes[1].midBranchTransaction.subSteps.map(
                          (sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                if (sub.transactionData) {
                                  setActiveTransaction(sub.transactionData);
                                } else {
                                  onShowToast(`${sub.label || 'Sub-step PM'}`);
                                }
                              }}
                              title={sub.label}
                              className="w-10 h-10 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer relative"
                            >
                              {renderNodeIcon(sub.icon, 'w-5 h-5')}
                            </button>
                          )
                        )}

                        {/* Ending Ring */}
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white" />
                      </div>

                      {/* Prominent Transaction Badge ("Jika ada yang melakukan Transaksi di tandai") */}
                      {showTransactionBadges && (
                        <div
                          onClick={() => {
                            const firstTx =
                              journey.nodes[1]?.midBranchTransaction?.subSteps.find(
                                (s) => s.transactionData
                              )?.transactionData;
                            if (firstTx) setActiveTransaction(firstTx);
                          }}
                          className="mt-2.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold shadow-xs cursor-pointer hover:bg-emerald-100 transition-colors flex items-center gap-1.5 animate-pulse"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>
                            Transaksi Terverifikasi: Rp150.000 (Paid)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Node 3: Promosi Buku */}
                <div className="flex flex-col items-center relative z-10 w-32 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveNode({
                        node: journey.nodes[2],
                        journeyName: journey.targetName,
                      })
                    }
                    className="w-12 h-12 rounded-2xl bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {renderNodeIcon(journey.nodes[2]?.icon || 'cart')}
                  </button>
                  <div className="mt-3">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">
                      {journey.nodes[2]?.title || 'Promosi Buku'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {journey.nodes[2]?.subtitle || 'Buku Hidup Bahagia'}
                    </div>
                  </div>
                </div>

                {/* Connector 3: 2 Bulan Line (Grey/Teal) */}
                <div className="flex-1 flex flex-col items-center justify-center pt-3 px-1 relative">
                  <div className="w-full h-1.5 bg-slate-300 rounded-full" />
                  <div className="absolute top-0 bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600 shadow-2xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{journey.nodes[2]?.durationAfter || '2 Bulan'}</span>
                  </div>
                </div>

                {/* Node 4: Promosi Dana */}
                <div className="flex flex-col items-center relative z-10 w-28 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveNode({
                        node: journey.nodes[3],
                        journeyName: journey.targetName,
                      })
                    }
                    className="w-12 h-12 rounded-2xl bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {renderNodeIcon(journey.nodes[3]?.icon || 'user')}
                  </button>
                  <div className="mt-3">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm">
                      {journey.nodes[3]?.title || 'Promosi Dana'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {journey.nodes[3]?.subtitle || 'Dana Banjir'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredJourneys.length === 0 && (
          <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-slate-700 text-sm">
              Tidak ada perjalanan PM yang cocok
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Coba reset filter atau tambahkan perjalanan PM baru melalui tombol{' '}
              <strong>+ Add</strong> di atas.
            </p>
          </div>
        )}
      </div>

      {/* 5. MODAL: DETAIL TRANSAKSI ("Jika ada yang melakukan Transaksi di tandai") */}
      {activeTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-base">
                    Detail Transaksi PM
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Ditandai dari Perjalanan PM Funneling
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTransaction(null)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Nomor Order:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {activeTransaction.orderNumber || 'CC 123456789'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Item / Produk:</span>
                  <span className="font-bold text-slate-800">
                    {activeTransaction.item || 'Buku Hidup Bahagia'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Pembeli / Donatur:</span>
                  <span className="font-bold text-[#008d91]">
                    {activeTransaction.pembeli || '10001 Lilo'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Tanggal Transaksi:</span>
                  <span className="font-semibold text-slate-700">
                    {activeTransaction.date || '14 Nov 2021'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-600">
                    Total Nominal:
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    {activeTransaction.nominal || 'Rp150.000'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-teal-50 p-3 rounded-xl border border-teal-100">
                <CheckCircle2 className="w-4 h-4 text-[#008d91] shrink-0" />
                <span>
                  Transaksi ini telah terverifikasi dan otomatis memperbarui status
                  di Transaksi S-SALUR / D-DONASI.
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              {onNavigateView && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTransaction(null);
                    onNavigateView('transaksiSalur');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#008d91] hover:bg-teal-50 border border-teal-200 cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Transaksi S-SALUR</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTransaction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: DETAIL NODE / AKTIVITAS PM */}
      {activeNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#f0f9f9] border-b border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008d91] text-white flex items-center justify-center shadow-xs">
                  {renderNodeIcon(activeNode.node.icon, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {activeNode.node.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Entitas: {activeNode.journeyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveNode(null)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-sm">
                  {activeNode.node.subtitle}
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Langkah ini merupakan bagian dari alur pesan personal / broadcast
                  ke audiens target.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bulan Periode:</span>
                  <span className="font-semibold text-slate-800">
                    {activeNode.node.month || selectedMonth} 2021
                  </span>
                </div>
                {activeNode.node.durationAfter && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jarak ke Langkah Berikutnya:</span>
                    <span className="font-semibold text-slate-800">
                      {activeNode.node.durationAfter}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveNode(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: TAMBAH PERJALANAN PM BARU (+ Add) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#008d91] text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  Tambah Perjalanan PM
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewJourney} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipe Target Entitas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTargetType('groupFunneling');
                      setNewTargetName('Group C');
                    }}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border cursor-pointer ${
                      newTargetType === 'groupFunneling'
                        ? 'bg-teal-50 border-[#008d91] text-[#008d91]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    G. Funneling
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTargetType('identitas');
                      setNewTargetName('00019 - Cindy Budiman');
                    }}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border cursor-pointer ${
                      newTargetType === 'identitas'
                        ? 'bg-teal-50 border-[#008d91] text-[#008d91]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Identitas ID
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTargetType('organisasi');
                      setNewTargetName('PT Dharma Makmur');
                    }}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border cursor-pointer ${
                      newTargetType === 'organisasi'
                        ? 'bg-teal-50 border-[#008d91] text-[#008d91]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Organisasi ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Entitas / Target
                </label>
                <input
                  type="text"
                  required
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  placeholder="Contoh: Group C, 00019 - Cindy Budiman..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-hidden focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jumlah Audiens / Anggota
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newAudienceCount}
                  onChange={(e) => setNewAudienceCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-hidden focus:border-[#008d91]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] cursor-pointer shadow-xs"
                >
                  Simpan Perjalanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
