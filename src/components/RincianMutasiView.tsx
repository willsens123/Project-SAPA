import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Link2,
  Trash2,
  Edit2,
  ExternalLink,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { MutasiItem, MutasiLinkedTransaction, PengeluaranItem } from '../types';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { ModalHubungkanMutasi } from './ModalHubungkanMutasi';

interface RincianMutasiViewProps {
  mutasiItems: MutasiItem[];
  salurOrders: SalurOrder[];
  transaksiAjarList: TransaksiAjarItem[];
  donasiOrders: DonasiOrder[];
  pengeluaranList: PengeluaranItem[];
  onUpdateMutasiItems: (updated: MutasiItem[]) => void;
  onShowToast: (msg: string) => void;
  onNavigateToView?: (view: string) => void;
}

export const RincianMutasiView: React.FC<RincianMutasiViewProps> = ({
  mutasiItems,
  salurOrders,
  transaksiAjarList,
  donasiOrders,
  pengeluaranList,
  onUpdateMutasiItems,
  onShowToast,
  onNavigateToView,
}) => {
  // Selected bank tab (matching image: Mutasi BCA 888 active by default)
  const [selectedBank, setSelectedBank] = useState<string>('BCA 888');

  // Active banner message index
  const [bannerMsgIndex, setBannerMsgIndex] = useState(0);
  const bannerMessages = [
    'Rekonsiliasi & hubungkan mutasi bank dengan Transaksi S-SALUR, A-AJAR, D-DONASI, dan PENGELUARAN.',
    'Satu mutasi dapat dipecah menjadi pesanan utama dan potongan fee marketplace Tokopedia / Shopee.',
    'Pastikan seluruh mutasi bank telah terhubung untuk menjaga integritas pembukuan kas & bank.',
  ];

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONNECTED' | 'UNCONNECTED'>('ALL');

  // Modal Connect State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedMutasiForConnect, setSelectedMutasiForConnect] = useState<MutasiItem | null>(null);

  // Active Dropdown Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // Format currency with exact decimal precision (e.g. 95,000.00)
  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Filter mutasi by bank and search query
  const filteredMutasi = useMemo(() => {
    return mutasiItems.filter((item) => {
      if (selectedBank !== 'ALL' && item.bankAccount !== selectedBank) {
        return false;
      }

      const hasLinks = item.linkedTransactions && item.linkedTransactions.length > 0;
      if (statusFilter === 'CONNECTED' && !hasLinks) return false;
      if (statusFilter === 'UNCONNECTED' && hasLinks) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchesKet = (item.keteranganBank || '').toLowerCase().includes(q);
      const matchesDate = (item.date || '').toLowerCase().includes(q);
      const matchesAmount = item.amount.toString().includes(q);
      const matchesLinks = (item.linkedTransactions || []).some(
        (l) => l.kode.toLowerCase().includes(q) || (l.keterangan || '').toLowerCase().includes(q)
      );

      return matchesKet || matchesDate || matchesAmount || matchesLinks;
    });
  }, [mutasiItems, selectedBank, statusFilter, searchQuery]);

  // Handle saving new linked transaction to mutasi
  const handleSaveLink = (mutasiId: string, link: MutasiLinkedTransaction) => {
    const updated = mutasiItems.map((m) => {
      if (m.id === mutasiId) {
        return {
          ...m,
          linkedTransactions: [...(m.linkedTransactions || []), link],
        };
      }
      return m;
    });
    onUpdateMutasiItems(updated);
  };

  // Handle removing a linked transaction from mutasi
  const handleDeleteLink = (mutasiId: string, linkId: string, kode: string) => {
    const updated = mutasiItems.map((m) => {
      if (m.id === mutasiId) {
        return {
          ...m,
          linkedTransactions: (m.linkedTransactions || []).filter((l) => l.id !== linkId),
        };
      }
      return m;
    });
    onUpdateMutasiItems(updated);
    setActiveMenuId(null);
    onShowToast(`Koneksi transaksi "${kode}" berhasil dihapus`);
  };

  // Quick stats
  const bankStats = useMemo(() => {
    const currentBankItems = mutasiItems.filter((m) => selectedBank === 'ALL' || m.bankAccount === selectedBank);
    const totalBankAmount = currentBankItems.reduce((acc, m) => acc + (m.type === 'CR' ? m.amount : -m.amount), 0);
    const connectedCount = currentBankItems.filter((m) => m.linkedTransactions && m.linkedTransactions.length > 0).length;
    return {
      totalItems: currentBankItems.length,
      connectedCount,
      totalBankAmount,
    };
  }, [mutasiItems, selectedBank]);

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 animate-in fade-in duration-200">
      {/* ================= TOP SECTION MATCHING EXACT SCREENSHOT ================= */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
        {/* Left: Page Title "Rincian Mutasi" */}
        <div className="shrink-0 self-start lg:self-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Rincian Mutasi
          </h1>
        </div>

        {/* Center: Cartoon Avatar with Teal Speech Bubble and Navigation Arrows */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-2xl justify-center w-full">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={() =>
              setBannerMsgIndex((prev) => (prev > 0 ? prev - 1 : bannerMessages.length - 1))
            }
            title="Pesan Sebelumnya"
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Cartoon Avatar Illustration */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f6c343] border-2 border-slate-800 flex items-center justify-center shadow-md overflow-hidden select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Hair background */}
                <path d="M15 65 C10 30, 30 10, 75 15 C90 35, 85 70, 80 80 Z" fill="#451a03" />
                {/* Head / Face */}
                <circle cx="50" cy="53" r="32" fill="#fed7aa" />
                {/* Headband */}
                <path d="M20 44 Q50 38 80 44 L81 49 Q50 43 19 49 Z" fill="#008d91" />
                <circle cx="50" cy="46" r="3" fill="#ffffff" />
                {/* Anime Eyes */}
                <ellipse cx="38" cy="54" rx="5" ry="6" fill="#1e293b" />
                <circle cx="36" cy="52" r="2" fill="#ffffff" />
                <ellipse cx="62" cy="54" rx="5" ry="6" fill="#1e293b" />
                <circle cx="60" cy="52" r="2" fill="#ffffff" />
                {/* Eyebrows determined */}
                <path d="M32 46 Q40 47 44 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M68 46 Q60 47 56 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Cheeks */}
                <circle cx="30" cy="60" r="3" fill="#fca5a5" opacity="0.8" />
                <circle cx="70" cy="60" r="3" fill="#fca5a5" opacity="0.8" />
                {/* Smile with tongue/fangs */}
                <path d="M42 63 Q50 72 58 63 Z" fill="#b91c1c" />
                <path d="M46 64 L50 67 L54 64 Z" fill="#ffffff" />
                {/* Front Hair Strands */}
                <path d="M22 38 Q35 48 40 42 Q48 50 56 41 Q65 48 78 36" stroke="#451a03" strokeWidth="6" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          {/* Speech Bubble in Teal with Speech Tail */}
          <div className="relative flex-1 bg-[#008d91] text-white rounded-2xl px-4 py-2.5 shadow-sm min-h-[48px] flex items-center">
            {/* Speech bubble tail pointer */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-[#008d91] border-b-[6px] border-b-transparent" />
            <p className="text-xs sm:text-[13px] font-medium leading-relaxed tracking-tight line-clamp-2">
              {bannerMessages[bannerMsgIndex]}
            </p>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() =>
              setBannerMsgIndex((prev) => (prev < bannerMessages.length - 1 ? prev + 1 : 0))
            }
            title="Pesan Selanjutnya"
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Right: Digital Clock & Date Display */}
        <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
          <div className="text-right">
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#008d91] tracking-tight leading-none font-mono">
              09:59
            </span>
            <span className="text-xs font-semibold text-[#008d91] block mt-0.5">
              Senin, 15 November 2021
            </span>
          </div>

          {/* 3-dots Menu Button */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveMenuId(activeMenuId === 'header-menu' ? null : 'header-menu')}
              title="Menu Opsi"
              className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {activeMenuId === 'header-menu' && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    onShowToast('Mengekspor rekonsiliasi mutasi ke format CSV');
                    setActiveMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Rincian CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShowToast('Semua status rekonsiliasi telah disinkronkan');
                    setActiveMenuId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#008d91]" />
                  <span>Refresh Rekonsiliasi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= BANK PILLS TABS & ACTION TOOLBAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Bank Pills matching exact style from user image */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: 'BCA 888', label: 'Mutasi BCA 888' },
            { id: 'BCA 388', label: 'Mutasi BCA 388' },
            { id: 'Mandiri', label: 'Mutasi Mandiri' },
          ].map((bank) => {
            const isActive = selectedBank === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => setSelectedBank(bank.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#008d91] text-white shadow-sm ring-2 ring-[#008d91]/30'
                    : 'bg-[#9ca3af] hover:bg-[#88919e] text-white shadow-2xs'
                }`}
              >
                {bank.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar: Search, Filter & Quick Connect */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode, keterangan, bank..."
              className="text-xs text-slate-700 outline-none w-36 sm:w-56"
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
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#008d91] shadow-2xs cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="CONNECTED">Sudah Terkoneksi</option>
            <option value="UNCONNECTED">Belum Terkoneksi</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE MATCHING EXACT SCREENSHOT ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            {/* Table Header matching screenshot: Date, Keterangan Bank, Branch, Amount, CB/CR, Balance, DB/CR, Kode, Nominal akhir */}
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-700 text-xs sm:text-sm font-semibold bg-slate-50/50">
                <th className="py-4 px-4 font-semibold text-slate-800 w-[80px]">Date</th>
                <th className="py-4 px-4 font-semibold text-slate-800 min-w-[280px]">Keterangan Bank</th>
                <th className="py-4 px-3 font-semibold text-slate-800 text-center w-[70px]">Branch</th>
                <th className="py-4 px-4 font-semibold text-slate-800 text-right w-[120px]">Amount</th>
                <th className="py-4 px-3 font-semibold text-slate-800 text-center w-[70px]">CB/CR</th>
                <th className="py-4 px-4 font-semibold text-slate-800 text-right w-[140px]">Balance</th>
                {/* Right side connected transactions */}
                <th className="py-4 px-3 font-semibold text-slate-800 text-center w-[70px] border-l border-slate-100">DB/CR</th>
                <th className="py-4 px-4 font-semibold text-slate-800 min-w-[260px]">Kode</th>
                <th className="py-4 px-4 font-semibold text-slate-800 text-right w-[140px]">Nominal akhir</th>
                <th className="py-4 px-2 text-right w-[40px]"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMutasi.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 text-sm">
                    Tidak ada data mutasi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredMutasi.map((mutasi) => {
                  const links = mutasi.linkedTransactions || [];
                  const hasLinks = links.length > 0;

                  // Render row with its sub-rows
                  return (
                    <React.Fragment key={mutasi.id}>
                      {hasLinks ? (
                        links.map((link, linkIdx) => {
                          const isFirst = linkIdx === 0;
                          return (
                            <tr
                              key={link.id}
                              className={`hover:bg-slate-50/80 transition-colors group ${
                                linkIdx === links.length - 1 ? 'border-b border-slate-100' : ''
                              }`}
                            >
                              {/* Left side: Bank Mutasi details (Only shown once on first subrow) */}
                              {isFirst ? (
                                <>
                                  <td
                                    rowSpan={links.length}
                                    className="py-4 px-4 text-slate-700 text-xs sm:text-sm font-normal align-top whitespace-nowrap"
                                  >
                                    {mutasi.date}
                                  </td>
                                  <td
                                    rowSpan={links.length}
                                    className="py-4 px-4 text-slate-700 text-xs sm:text-sm font-normal align-top leading-relaxed"
                                  >
                                    <div className="max-w-[320px]">
                                      {mutasi.keteranganBank}
                                    </div>
                                  </td>
                                  <td
                                    rowSpan={links.length}
                                    className="py-4 px-3 text-slate-700 text-xs sm:text-sm font-normal text-center align-top"
                                  >
                                    {mutasi.branch}
                                  </td>
                                  <td
                                    rowSpan={links.length}
                                    className="py-4 px-4 text-slate-800 text-xs sm:text-sm font-normal text-right align-top whitespace-nowrap font-mono"
                                  >
                                    {formatAmount(mutasi.amount)}
                                  </td>
                                  <td
                                    rowSpan={links.length}
                                    className="py-4 px-3 text-slate-700 text-xs sm:text-sm font-normal text-center align-top"
                                  >
                                    {mutasi.type}
                                  </td>
                                  <td
                                    rowSpan={links.length}
                                    className="py-4 px-4 text-slate-700 text-xs sm:text-sm font-normal text-right align-top whitespace-nowrap font-mono"
                                  >
                                    {formatAmount(mutasi.balance)}
                                  </td>
                                </>
                              ) : null}

                              {/* Right side: Linked Transaction / Fee details */}
                              <td className="py-3 px-3 text-xs sm:text-sm font-normal text-center border-l border-slate-100">
                                <span
                                  className={`inline-block font-semibold ${
                                    link.dbCr === 'DB' ? 'text-slate-600' : 'text-slate-700'
                                  }`}
                                >
                                  {link.dbCr}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-700 text-xs sm:text-sm font-normal leading-relaxed">
                                <div className="flex items-center gap-2">
                                  <span className="font-normal">{link.kode}</span>
                                  {link.sourceType && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                                        link.sourceType === 'salur'
                                          ? 'bg-teal-50 text-teal-700'
                                          : link.sourceType === 'ajar'
                                          ? 'bg-purple-50 text-purple-700'
                                          : link.sourceType === 'donasi'
                                          ? 'bg-amber-50 text-amber-700'
                                          : link.sourceType === 'pengeluaran'
                                          ? 'bg-rose-50 text-rose-700'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {link.sourceType}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4 text-slate-800 text-xs sm:text-sm font-normal text-right whitespace-nowrap font-mono">
                                <span className={link.nominalAkhir < 0 ? 'text-slate-700' : 'text-slate-800'}>
                                  {link.nominalAkhir < 0 ? '-' : ''}
                                  {formatAmount(Math.abs(link.nominalAkhir))}
                                </span>
                              </td>

                              {/* Action Menu (3-dots) for each linked item */}
                              <td className="py-3 px-2 text-right relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === link.id ? null : link.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Aksi"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {activeMenuId === link.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedMutasiForConnect(mutasi);
                                        setIsConnectModalOpen(true);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-[#008d91]" />
                                      <span>Tambah Koneksi Lain</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLink(mutasi.id, link.id, link.kode)}
                                      className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Putuskan Hubungan</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        /* When no linked transactions exist yet */
                        <tr className="hover:bg-slate-50/80 transition-colors group">
                          {/* Left Bank Details */}
                          <td className="py-4 px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                            {mutasi.date}
                          </td>
                          <td className="py-4 px-4 text-slate-700 text-xs sm:text-sm font-normal leading-relaxed">
                            <div className="max-w-[320px]">
                              {mutasi.keteranganBank}
                            </div>
                          </td>
                          <td className="py-4 px-3 text-slate-700 text-xs sm:text-sm font-normal text-center">
                            {mutasi.branch}
                          </td>
                          <td className="py-4 px-4 text-slate-800 text-xs sm:text-sm font-normal text-right whitespace-nowrap font-mono">
                            {formatAmount(mutasi.amount)}
                          </td>
                          <td className="py-4 px-3 text-slate-700 text-xs sm:text-sm font-normal text-center">
                            {mutasi.type}
                          </td>
                          <td className="py-4 px-4 text-slate-700 text-xs sm:text-sm font-normal text-right whitespace-nowrap font-mono">
                            {formatAmount(mutasi.balance)}
                          </td>

                          {/* Right Side: Quick Connect action button */}
                          <td className="py-4 px-3 text-xs sm:text-sm text-center text-slate-300 border-l border-slate-100">
                            -
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-sm">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMutasiForConnect(mutasi);
                                setIsConnectModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#008d91] font-semibold text-xs transition-colors cursor-pointer border border-teal-200/80"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Hubungkan Transaksi / Pengeluaran</span>
                            </button>
                          </td>
                          <td className="py-4 px-4 text-xs sm:text-sm text-right text-slate-300 font-mono">
                            -
                          </td>
                          <td className="py-4 px-2 text-right relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === mutasi.id ? null : mutasi.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Aksi"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === mutasi.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMutasiForConnect(mutasi);
                                    setIsConnectModalOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <Link2 className="w-3.5 h-3.5 text-[#008d91]" />
                                  <span>Hubungkan Transaksi</span>
                                </button>
                              </div>
                            )}
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

      {/* ================= MODAL HUBUNGKAN MUTASI ================= */}
      <ModalHubungkanMutasi
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setSelectedMutasiForConnect(null);
        }}
        mutasi={selectedMutasiForConnect}
        salurOrders={salurOrders}
        transaksiAjarList={transaksiAjarList}
        donasiOrders={donasiOrders}
        pengeluaranList={pengeluaranList}
        onSaveLink={handleSaveLink}
        onShowToast={onShowToast}
      />
    </div>
  );
};
