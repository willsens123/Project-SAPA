import React, { useState } from 'react';
import { EyeOff, Eye, Search, SlidersHorizontal, Plus, MoreVertical, X, Edit2, Trash2, Copy, Filter, Receipt, FileImage, FolderGit2, ArrowUpRight, ClipboardList, CreditCard, Link2 } from 'lucide-react';
import { PengeluaranItem, MutasiItem, ProjectItem } from '../types';
import { BuktiBonModal } from './BuktiBonModal';
import { ModalTambahkanKodeMutasi } from './ModalTambahkanKodeMutasi';

interface PengeluaranTableProps {
  items: PengeluaranItem[];
  onAddClick: () => void;
  onEditItem: (item: PengeluaranItem) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem?: (item: PengeluaranItem) => void;
  onSaveItem?: (item: PengeluaranItem) => void;
  onUpdateItems?: (items: PengeluaranItem[]) => void;
  mutasiList?: MutasiItem[];
  onUpdateMutasiItems?: (items: MutasiItem[]) => void;
  onShowToast?: (message: string) => void;
  onNavigateToMutasi?: () => void;
  projects?: ProjectItem[];
  onNavigateToPosPengeluaran?: () => void;
  onNavigateToKebutuhanPengeluaran?: () => void;
  onNavigateToKumpulanRekening?: () => void;
  onOpenFormPengeluaranForPerson?: (name: string) => void;
}

export const PengeluaranTable: React.FC<PengeluaranTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onDuplicateItem,
  onSaveItem,
  onUpdateItems,
  mutasiList = [],
  onUpdateMutasiItems,
  onShowToast,
  onNavigateToMutasi,
  projects = [],
  onNavigateToProject,
  onNavigateToPosPengeluaran,
  onNavigateToKebutuhanPengeluaran,
  onNavigateToKumpulanRekening,
  onOpenFormPengeluaranForPerson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedPosKeluar, setSelectedPosKeluar] = useState<string>('ALL');
  const [selectedProyekSapa, setSelectedProyekSapa] = useState<string>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Bukti bon modal state
  const [selectedBuktiBonItem, setSelectedBuktiBonItem] = useState<PengeluaranItem | null>(null);
  const [isBuktiBonModalOpen, setIsBuktiBonModalOpen] = useState(false);

  // Modal Tambahkan Kode Mutasi state
  const [isConnectMutasiModalOpen, setIsConnectMutasiModalOpen] = useState(false);
  const [selectedPengeluaranForMutasi, setSelectedPengeluaranForMutasi] = useState<PengeluaranItem | null>(null);

  // Status badge warna bulatan kolom No. sesuai instruksi:
  // 1. Tosca: sudah dikonekan dengan mutasi DAN sudah lunas DAN sudah diunggah bon
  // 2. Merah: sudah diunggah bon TAPI belum dikonekan dengan mutasi
  // 3. Tanpa warna: belum diunggah bon
  const getItemBadgeStatus = (item: PengeluaranItem): 'teal' | 'red' | 'plain' => {
    const hasBon = Boolean(item.buktiBonUrl || item.buktiBonFileName);
    if (!hasBon) {
      return 'plain';
    }

    let totalConnected = 0;
    let isConnectedToMutasi = Boolean(item.mutasiId);

    if (mutasiList && mutasiList.length > 0) {
      mutasiList.forEach((m) => {
        if (m.linkedTransactions) {
          m.linkedTransactions.forEach((l) => {
            if (
              l.orderId === item.id ||
              l.kode === item.no ||
              (item.keterangan && l.kode === item.keterangan)
            ) {
              isConnectedToMutasi = true;
              totalConnected += Math.abs(l.nominalAkhir);
            }
          });
        }
      });
    }

    if (item.mutasiAmount && item.mutasiId) {
      totalConnected = Math.max(totalConnected, item.mutasiAmount);
    }

    // Lunas check: jika totalConnected >= item.nominal atau status bawaan sudah lunas
    const isLunas = isConnectedToMutasi && (totalConnected >= item.nominal - 1 || item.noBadgeColor === 'teal');

    if (isConnectedToMutasi && isLunas) {
      return 'teal';
    }

    return 'red';
  };

  const handleLinkPengeluaranToMutasi = (pengeluaranId: string, mutasi: MutasiItem, nominal: number) => {
    const updated = items.map((it) => {
      if (it.id === pengeluaranId) {
        const hasBon = Boolean(it.buktiBonUrl || it.buktiBonFileName);
        return {
          ...it,
          mutasiId: mutasi.id,
          mutasiKode: `${mutasi.bankAccount} - ${mutasi.date}`,
          mutasiKeterangan: mutasi.keteranganBank,
          mutasiDate: mutasi.date,
          mutasiAmount: nominal,
          noBadgeColor: (hasBon ? 'teal' : 'plain') as 'teal' | 'red' | 'plain',
        };
      }
      return it;
    });

    if (onUpdateItems) {
      onUpdateItems(updated);
    }
    if (onShowToast) {
      onShowToast(`Pengeluaran No. ${selectedPengeluaranForMutasi?.no || ''} berhasil dikonekan ke mutasi DB (${mutasi.bankAccount})`);
    }
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleOutside = () => {
      setActiveMenuId(null);
      setIsFilterOpen(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const uniqueDivisi = ['ALL', ...Array.from(new Set(items.map((it) => it.divisi).filter(Boolean)))];
  const uniquePosKeluar = ['ALL', ...Array.from(new Set(items.map((it) => it.posKeluar).filter(Boolean)))];
  const uniqueProyekSapa = [
    'ALL',
    ...Array.from(
      new Set(
        [
          ...items.map((it) => it.proyekSapa).filter((p): p is string => Boolean(p)),
          ...projects.map((p) => p.namaKegiatan),
        ]
      )
    ),
  ];

  const hasFilterActive =
    selectedDivisi !== 'ALL' || selectedPosKeluar !== 'ALL' || selectedProyekSapa !== 'ALL';

  const filteredItems = items.filter((item) => {
    if (selectedDivisi !== 'ALL' && item.divisi !== selectedDivisi) return false;
    if (selectedPosKeluar !== 'ALL' && item.posKeluar !== selectedPosKeluar) return false;
    if (selectedProyekSapa !== 'ALL' && item.proyekSapa !== selectedProyekSapa) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.tanggal.toLowerCase().includes(q) ||
      item.divisi.toLowerCase().includes(q) ||
      (item.proyekSapa && item.proyekSapa.toLowerCase().includes(q)) ||
      item.posKeluar.toLowerCase().includes(q) ||
      item.kebutuhan.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q) ||
      item.no.toLowerCase().includes(q) ||
      item.dikeluarkan.toLowerCase().includes(q) ||
      item.nominal.toString().includes(q)
    );
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="w-full">
      {/* Top Action Toolbar matching Image: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3.5 mb-6 relative">
        {/* Search Bar */}
        {isSearchOpen ? (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="input-search-pengeluaran"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kebutuhan, keterangan, no, pengeluar..."
              autoFocus
              className="text-xs sm:text-sm text-slate-700 outline-none w-48 sm:w-72"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 ml-1"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            {/* Privacy Mask Toggle */}
            <button
              id="btn-pengeluaran-privacy"
              type="button"
              onClick={() => {
                setIsPrivacyMasked(!isPrivacyMasked);
                if (onShowToast) {
                  onShowToast(isPrivacyMasked ? 'Nominal ditampilkan' : 'Nominal disembunyikan');
                }
              }}
              title={isPrivacyMasked ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
              aria-label={isPrivacyMasked ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
              className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              {isPrivacyMasked ? (
                <Eye className="w-5 h-5 stroke-[1.8] text-[#008d91]" />
              ) : (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>

            {/* Search Icon */}
            <button
              id="btn-pengeluaran-open-search"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari Pengeluaran"
              aria-label="Cari Pengeluaran"
              className="p-1.5 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        )}

        {/* Filter Sliders */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            id="btn-pengeluaran-filter"
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="Filter Pengeluaran"
            aria-label="Filter Pengeluaran"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              hasFilterActive ? 'text-[#008d91]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            {hasFilterActive && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#008d91]" />
            )}
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-40 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#008d91]" />
                  Filter Data
                </span>
                {hasFilterActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDivisi('ALL');
                      setSelectedPosKeluar('ALL');
                      setSelectedProyekSapa('ALL');
                    }}
                    className="text-xs text-[#008d91] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 text-xs mb-1 font-medium">Divisi</label>
                  <select
                    value={selectedDivisi}
                    onChange={(e) => setSelectedDivisi(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 outline-none focus:border-[#008d91] text-xs cursor-pointer"
                  >
                    {uniqueDivisi.map((div) => (
                      <option key={div} value={div}>
                        {div === 'ALL' ? 'Semua Divisi' : div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 text-xs mb-1 font-medium">Proyek SAPA</label>
                  <select
                    value={selectedProyekSapa}
                    onChange={(e) => setSelectedProyekSapa(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 outline-none focus:border-[#008d91] text-xs cursor-pointer"
                  >
                    {uniqueProyekSapa.map((p) => (
                      <option key={p} value={p}>
                        {p === 'ALL' ? 'Semua Proyek SAPA' : p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 text-xs mb-1 font-medium">Pos Keluar</label>
                  <select
                    value={selectedPosKeluar}
                    onChange={(e) => setSelectedPosKeluar(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 outline-none focus:border-[#008d91] text-xs cursor-pointer"
                  >
                    {uniquePosKeluar.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos === 'ALL' ? 'Semua Pos Keluar' : pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          {onNavigateToPosPengeluaran && (
            <button
              type="button"
              onClick={onNavigateToPosPengeluaran}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Kelola Pos Pengeluaran & Alokasi"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#008d91]" />
              <span className="hidden sm:inline">Pos Pengeluaran</span>
            </button>
          )}
          {onNavigateToKebutuhanPengeluaran && (
            <button
              type="button"
              onClick={onNavigateToKebutuhanPengeluaran}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Kelola Kebutuhan Pengeluaran"
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#008d91]" />
              <span className="hidden sm:inline">Kebutuhan Pengeluaran</span>
            </button>
          )}
          {onNavigateToKumpulanRekening && (
            <button
              type="button"
              onClick={onNavigateToKumpulanRekening}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Kelola Kumpulan Rekening"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#008d91]" />
              <span className="hidden sm:inline">Kumpulan Rekening</span>
            </button>
          )}
        </div>

        {/* Add Button matching Image 1: teal pill with + Add */}
        <button
          id="btn-add-pengeluaran"
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Table matching exact UI from image.png */}
      <div className="bg-transparent w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-transparent text-slate-700 text-xs sm:text-sm font-semibold">
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 w-[110px]">Tanggal</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 w-[70px]">Divisi</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 w-[160px]">Proyek SAPA</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 w-[130px]">Pos keluar</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 w-[180px]">Kebutuhan</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800">Keterangan</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 text-right w-[120px]">Nominal</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 text-center w-[60px]">Jenis</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 text-center w-[75px]">No.</th>
                <th className="py-4 px-3 sm:px-4 font-semibold text-slate-800 w-[110px]">Dikeluarkan</th>
                <th className="py-4 px-2 text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400 text-sm">
                    Tidak ada data pengeluaran. Klik "+ Add" untuk menambahkan data baru.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* 1. Tanggal */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                      {item.tanggal}
                    </td>

                    {/* 2. Divisi */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal">
                      {item.divisi}
                    </td>

                    {/* 3. Proyek SAPA */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal">
                      {item.proyekSapa ? (
                        <div className="flex flex-col items-start gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateToProject) {
                                onNavigateToProject(item.proyekSapa!);
                              } else if (onShowToast) {
                                onShowToast(`Proyek SAPA: ${item.proyekSapa}`);
                              }
                            }}
                            title={`Terkoneksi dengan Proyek SAPA: ${item.proyekSapa}. Klik untuk membuka rincian proyek.`}
                            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-[#008d91] border border-teal-200/80 transition-all text-left cursor-pointer max-w-[170px]"
                          >
                            <FolderGit2 className="w-3.5 h-3.5 shrink-0 text-[#008d91] group-hover:scale-110 transition-transform" />
                            <span className="truncate">{item.proyekSapa}</span>
                          </button>
                          {item.rincianProyekSapa && (
                            <div className="text-[11px] text-slate-500 font-normal leading-tight truncate max-w-[170px]" title={item.rincianProyekSapa}>
                              {item.rincianProyekSapa}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-start">
                          <span className="text-slate-300 text-xs">-</span>
                          {item.rincianProyekSapa && (
                            <div className="text-[11px] text-slate-500 font-normal leading-tight truncate max-w-[170px]" title={item.rincianProyekSapa}>
                              {item.rincianProyekSapa}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 4. Pos keluar */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap">
                      {item.posKeluar}
                    </td>

                    {/* 4. Kebutuhan */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal leading-relaxed">
                      {item.kebutuhan}
                    </td>

                    {/* 5. Keterangan */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal leading-relaxed">
                      {item.keterangan}
                    </td>

                    {/* 6. Nominal */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal text-right whitespace-nowrap">
                      {isPrivacyMasked ? (
                        <span className="font-mono text-slate-400 select-none">••••••••</span>
                      ) : (
                        formatCurrency(item.nominal)
                      )}
                    </td>

                    {/* 7. Jenis */}
                    <td className="py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal text-center">
                      {item.jenis}
                    </td>

                    {/* 8. No. (Tosca: bon + lunas + konek mutasi; Merah: bon tapi belum konek mutasi; Polos: belum bon) */}
                    <td className="py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                      {(() => {
                        const badgeColor = getItemBadgeStatus(item);
                        if (badgeColor === 'teal') {
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBuktiBonItem(item);
                                setIsBuktiBonModalOpen(true);
                              }}
                              title="Buletan tosca: Sudah diunggah bon, sudah dikonekan dengan mutasi DB, dan sudah lunas. Klik untuk melihat bon."
                              className="inline-flex items-center justify-center bg-[#008d91] hover:bg-[#007b7f] active:bg-[#006e72] text-white text-xs sm:text-sm font-medium px-3.5 py-1 rounded-full shadow-2xs min-w-[44px] cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                            >
                              {item.no}
                            </button>
                          );
                        }
                        if (badgeColor === 'red') {
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBuktiBonItem(item);
                                setIsBuktiBonModalOpen(true);
                              }}
                              title="Buletan merah: Sudah diunggah bon tapi belum dikonekan dengan mutasi DB. Klik untuk melihat bon."
                              className="inline-flex items-center justify-center bg-[#ef4444] hover:bg-[#dc2626] active:bg-[#b91c1c] text-white text-xs sm:text-sm font-medium px-3.5 py-1 rounded-full shadow-2xs min-w-[44px] cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                            >
                              {item.no}
                            </button>
                          );
                        }
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBuktiBonItem(item);
                              setIsBuktiBonModalOpen(true);
                            }}
                            title="Tanpa buletan: Belum diunggah bon. Klik untuk upload bukti bon."
                            className="text-slate-700 text-xs sm:text-sm font-normal hover:text-[#008d91] hover:underline cursor-pointer px-2 py-0.5 rounded transition-colors"
                          >
                            {item.no}
                          </button>
                        );
                      })()}
                    </td>

                    {/* 9. Dikeluarkan */}
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenFormPengeluaranForPerson && item.dikeluarkan) {
                          onOpenFormPengeluaranForPerson(item.dikeluarkan);
                        }
                      }}
                      title={
                        onOpenFormPengeluaranForPerson && item.dikeluarkan
                          ? `Buka Form Pengeluaran untuk ${item.dikeluarkan}`
                          : undefined
                      }
                      className={`py-4 px-3 sm:px-4 text-slate-700 text-xs sm:text-sm font-normal whitespace-nowrap ${
                        onOpenFormPengeluaranForPerson && item.dikeluarkan
                          ? 'cursor-pointer hover:text-[#008d91] hover:underline'
                          : ''
                      }`}
                    >
                      {item.dikeluarkan}
                    </td>

                    {/* 10. 3-dots action menu */}
                    <td className="py-4 px-2 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Menu Aksi"
                        aria-label="Menu Aksi"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-11 z-30 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setSelectedPengeluaranForMutasi(item);
                              setIsConnectMutasiModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-[#008d91] flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Link2 className="w-3.5 h-3.5 text-[#008d91]" />
                            <span>Tambahkan Kode Mutasi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setSelectedBuktiBonItem(item);
                              setIsBuktiBonModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {item.noBadgeColor && item.noBadgeColor !== 'plain'
                                ? 'Lihat Bukti Bon'
                                : 'Upload Bukti Bon'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditItem(item);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit</span>
                          </button>

                          {onDuplicateItem && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDuplicateItem(item);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Duplikat</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteItem(item.id);
                              if (onShowToast) {
                                onShowToast(`Data pengeluaran No. ${item.no} berhasil dihapus`);
                              }
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Legend Matching User Requirements */}
      <div className="mt-4 p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="font-semibold text-slate-700">Keterangan No:</span>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-[#008d91] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-2xs">
              Buletan Tosca
            </span>
            <span className="text-slate-600">Sudah di-upload gambar bukti bon &amp; sudah di-link ke mutasi</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-[#f04e4e] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-2xs">
              Buletan Merah
            </span>
            <span className="text-slate-600">Sudah di-upload gambar bukti bon tapi belum di-link ke mutasi</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px]">
              Tanpa Buletan
            </span>
            <span className="text-slate-600">Belum di-upload gambar bukti bon</span>
          </div>
        </div>

        <span className="text-slate-400 text-[11px] italic">
          *Klik buletan tosca atau merah untuk melihat pop-up bukti bon
        </span>
      </div>

      {/* Pop up Bukti Bon Modal */}
      <BuktiBonModal
        isOpen={isBuktiBonModalOpen}
        onClose={() => {
          setIsBuktiBonModalOpen(false);
          setSelectedBuktiBonItem(null);
        }}
        item={selectedBuktiBonItem}
        mutasiList={mutasiList}
        onSaveItem={(updated) => {
          setSelectedBuktiBonItem(updated);
          if (onSaveItem) {
            onSaveItem(updated);
          }
        }}
        onShowToast={onShowToast}
        onNavigateToMutasi={onNavigateToMutasi}
      />

      {/* Pop up Modal Tambahkan Kode Mutasi (Pengeluaran: DB only) */}
      {selectedPengeluaranForMutasi && (
        <ModalTambahkanKodeMutasi
          isOpen={isConnectMutasiModalOpen}
          onClose={() => {
            setIsConnectMutasiModalOpen(false);
            setSelectedPengeluaranForMutasi(null);
          }}
          order={{
            id: selectedPengeluaranForMutasi.id,
            orderNumber: selectedPengeluaranForMutasi.no,
            keterangan: selectedPengeluaranForMutasi.keterangan,
            date: selectedPengeluaranForMutasi.tanggal,
            totalDana:
              typeof selectedPengeluaranForMutasi.nominal === 'number'
                ? `Rp ${selectedPengeluaranForMutasi.nominal.toLocaleString('id-ID')}`
                : String(selectedPengeluaranForMutasi.nominal),
          }}
          mode="pengeluaran"
          mutasiItems={mutasiList}
          onUpdateMutasiItems={onUpdateMutasiItems}
          onLinkPengeluaran={handleLinkPengeluaranToMutasi}
          onShowToast={onShowToast || ((msg) => console.log(msg))}
        />
      )}
    </div>
  );
};
