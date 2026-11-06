import React, { useState, useEffect, useMemo } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  MessageCircle,
  Bot,
  ShoppingBag,
  Store,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  ArrowUpDown,
} from 'lucide-react';
import { PromoSalurItem } from '../types';
import { loadPromoSalur, savePromoSalur } from '../promoSalurData';
import { AddEditPromoSalurModal } from './AddEditPromoSalurModal';
import { ViaChannelLogo, PromoCodeViaBadge } from './ViaChannelLogo';

interface ListPromoSalurDashboardProps {
  onShowToast: (msg: string) => void;
  onNavigateToForm?: (promoToEdit?: PromoSalurItem | null) => void;
}

export const ListPromoSalurDashboard: React.FC<ListPromoSalurDashboardProps> = ({
  onShowToast,
  onNavigateToForm,
}) => {
  const [promos, setPromos] = useState<PromoSalurItem[]>(() => loadPromoSalur());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Promo' | 'Semua' | 'Ongoing' | 'Coming Soon' | 'Berakhir'>('Promo');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoSalurItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedPromoIds, setSelectedPromoIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'date'>('default');

  useEffect(() => {
    setPromos(loadPromoSalur());
  }, []);

  const handleSavePromo = (item: PromoSalurItem) => {
    const exists = promos.some((p) => p.id === item.id);
    let updated: PromoSalurItem[];
    if (exists) {
      updated = promos.map((p) => (p.id === item.id ? item : p));
      onShowToast(`Promo "${item.namaPromo}" berhasil diperbarui`);
    } else {
      updated = [item, ...promos];
      onShowToast(`Promo baru "${item.namaPromo}" berhasil ditambahkan`);
    }
    setPromos(updated);
    savePromoSalur(updated);
  };

  const handleDeletePromo = (id: string) => {
    const target = promos.find((p) => p.id === id);
    const updated = promos.filter((p) => p.id !== id);
    setPromos(updated);
    savePromoSalur(updated);
    setOpenMenuId(null);
    onShowToast(`Promo "${target?.namaPromo || 'Item'}" berhasil dihapus`);
  };

  const filteredPromos = useMemo(() => {
    let list = promos.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.namaPromo.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q);

      if (activeTab === 'Promo' || activeTab === 'Semua') {
        return matchSearch;
      }
      return matchSearch && item.status === activeTab;
    });

    if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.namaPromo.localeCompare(b.namaPromo));
    } else if (sortBy === 'date') {
      list = [...list].sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai));
    }

    return list;
  }, [promos, searchQuery, activeTab, sortBy]);

  const handleBatchStatusChange = (newStatus: 'Ongoing' | 'Coming Soon' | 'Berakhir') => {
    if (selectedPromoIds.length === 0) return;
    const updated = promos.map((p) =>
      selectedPromoIds.includes(p.id) ? { ...p, status: newStatus } : p
    );
    setPromos(updated);
    savePromoSalur(updated);
    setSelectedPromoIds([]);
    setIsBatchModalOpen(false);
    onShowToast(`${selectedPromoIds.length} promo berhasil diubah ke status "${newStatus}"`);
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-12">
      {/* Top Action Bar (Above main card) matching image.png */}
      <div className="flex items-center justify-end gap-3 px-2 sm:px-4">
        {/* Eye Off Icon */}
        <button
          type="button"
          title="Sembunyikan Kolom / Mode Privasi"
          onClick={() => onShowToast('Mode privasi tampilan diaktifkan')}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Search Toggle Icon */}
        <button
          type="button"
          title="Fokus Pencarian"
          onClick={() => {
            const el = document.getElementById('search-promo-salur');
            el?.focus();
          }}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders / Filter Icon */}
        <button
          type="button"
          title="Filter & Pengaturan"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isFilterOpen
              ? 'bg-[#008d91]/10 text-[#008d91]'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          id="btn-add-promo-salur"
          type="button"
          onClick={() => {
            if (onNavigateToForm) {
              onNavigateToForm(null);
            } else {
              setEditingPromo(null);
              setIsAddModalOpen(true);
            }
          }}
          title="Tambah Promo S-SALUR"
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Filter Dropdown Popover */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg p-4 mx-2 sm:mx-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
            {(['Semua', 'Ongoing', 'Coming Soon', 'Berakhir'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveTab(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === st
                    ? 'bg-[#008d91] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Urutkan:</span>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'name' ? 'default' : 'name')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                sortBy === 'name'
                  ? 'bg-[#008d91] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Nama</span>
            </button>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'date' ? 'default' : 'date')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                sortBy === 'date'
                  ? 'bg-[#008d91] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Tanggal</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Card: List Promo S-SALUR container matching image.png */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col p-4 sm:p-6 mx-2 sm:mx-4">
        {/* Header inside Card: Tabs & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          {/* Tab Promo */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('Promo')}
              className="text-sm sm:text-base font-bold text-slate-800 relative pb-1 transition-colors"
            >
              Promo
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 rounded-full" />
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Atur Sekaligus */}
            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="px-5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              Atur Sekaligus
            </button>

            {/* Tambah Promo */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateToForm) {
                  onNavigateToForm(null);
                } else {
                  setEditingPromo(null);
                  setIsAddModalOpen(true);
                }
              }}
              className="px-5 py-2 rounded-xl border border-[#008d91] text-xs sm:text-sm font-medium text-[#008d91] hover:bg-[#008d91]/5 transition-colors shadow-2xs cursor-pointer"
            >
              Tambah Promo
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-slate-100 my-2" />

        {/* Search Input & Filter & Urutkan row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
          {/* Search Here Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-promo-salur"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#008d91] transition-colors"
            />
          </div>

          {/* Filter & Urutkan Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-normal text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter & Urutkan</span>
          </button>
        </div>

        {/* Column Header Titles */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2.5 text-xs text-slate-400 font-normal border-b border-slate-100 mb-3">
          <div className="col-span-4">Nama Promo</div>
          <div className="col-span-3">Tanggal Berlaku</div>
          <div className="col-span-2 text-center">% / Kuota</div>
          <div className="col-span-1 text-center">Keterangan</div>
          <div className="col-span-2 text-right">Channel Promo / Kode</div>
        </div>

        {/* Promo Items List */}
        <div className="flex flex-col gap-4 mt-1">
          {filteredPromos.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Tidak ada promo yang ditemukan
            </div>
          ) : (
            filteredPromos.map((item) => {
              const isOngoing = item.status === 'Ongoing';
              const isComingSoon = item.status === 'Coming Soon';
              const isBerakhir = item.status === 'Berakhir';

              // Dynamic channels from Form List Promo S-SALUR
              const channelsToDisplay: string[] = (() => {
                if (item.channelEntries && item.channelEntries.length > 0) {
                  const list = item.channelEntries
                    .map((c) => c.viaName.trim())
                    .filter((v, idx, arr) => v && arr.indexOf(v) === idx);
                  if (list.length > 0) return list;
                }
                if (item.channels && item.channels.length > 0) {
                  return item.channels
                    .map((c) => c.trim())
                    .filter((v, idx, arr) => v && arr.indexOf(v) === idx);
                }
                return [];
              })();

              // Via that have promo codes
              const promoCodesWithVia: { viaName: string; kode: string }[] = (() => {
                const result: { viaName: string; kode: string }[] = [];
                if (item.channelEntries && item.channelEntries.length > 0) {
                  item.channelEntries.forEach((c) => {
                    if (c.kodePromo && c.kodePromo.trim()) {
                      result.push({ viaName: c.viaName || 'Promo', kode: c.kodePromo.trim() });
                    }
                  });
                }
                if (result.length === 0 && item.kodePromo && item.kodePromo.length > 0) {
                  item.kodePromo.forEach((kp, idx) => {
                    if (kp && kp.trim()) {
                      const associatedVia = item.channels?.[idx] || item.channels?.[0] || 'Shopee';
                      result.push({ viaName: associatedVia, kode: kp.trim() });
                    }
                  });
                }
                return result;
              })();

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs hover:shadow-xs hover:border-slate-200 transition-all p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative"
                >
                  {/* Left Column: Avatar Square P + Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-[280px] lg:w-4/12">
                    {/* Big Square P Badge matching image.png */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#283849] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0 shadow-2xs select-none">
                      P
                    </div>

                    <div className="flex flex-col">
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                        {item.namaPromo}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                        {item.subtitle}
                      </p>
                      <span
                        className={`text-xs font-semibold mt-1.5 inline-block ${
                          isOngoing
                            ? 'text-[#008d91]'
                            : isComingSoon
                            ? 'text-slate-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Middle Column 1: Tanggal Berlaku */}
                  <div className="flex flex-col lg:w-3/12">
                    <div className="text-xs lg:hidden text-slate-400 mb-0.5">
                      Tanggal Berlaku:
                    </div>
                    <div className="font-bold text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                      {item.tanggalMulai} - {item.tanggalSelesai}
                    </div>
                    <div className="text-slate-500 text-xs mt-1 flex items-center gap-6 whitespace-nowrap font-normal">
                      <span>{item.jamMulai}</span>
                      <span>{item.jamSelesai}</span>
                    </div>
                  </div>

                  {/* Middle Column 2: % / Kuota */}
                  <div className="flex lg:flex-col lg:items-center lg:justify-center lg:w-2/12">
                    <div className="text-xs lg:hidden text-slate-400 mr-2">
                      Kuota:
                    </div>
                    <span className="text-slate-700 text-sm sm:text-base font-normal">
                      {item.persentaseKuota}
                    </span>
                  </div>

                  {/* Middle Column 3: Keterangan */}
                  <div className="flex lg:flex-col lg:items-center lg:justify-center lg:w-1/12">
                    <div className="text-xs lg:hidden text-slate-400 mr-2">
                      Keterangan:
                    </div>
                    <span className="text-slate-400 text-sm">
                      {item.keterangan || '-'}
                    </span>
                  </div>

                  {/* Right Column: Channel Promo & Kode Promo & Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-2 lg:w-2/12 shrink-0">
                    {/* Top Row: Channel Promo label & icons + 3 dots */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-normal">
                          Channel Promo
                        </span>
                        <div className="flex items-center gap-1 ml-1">
                          {channelsToDisplay.length === 0 ? (
                            <span className="text-[11px] text-slate-400 font-normal">-</span>
                          ) : (
                            channelsToDisplay.map((chName, idx) => (
                              <ViaChannelLogo key={idx} viaName={chName} size="md" />
                            ))
                          )}
                        </div>
                      </div>

                      {/* Three dots vertical action menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === item.id ? null : item.id)
                          }
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Opsi Promo"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToForm) {
                                  onNavigateToForm(item);
                                } else {
                                  setEditingPromo(item);
                                  setIsAddModalOpen(true);
                                }
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Promo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePromo(item.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Hapus Promo</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Kode Promo label & badges */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-normal">
                        Kode Promo
                      </span>
                      <div className="flex items-center gap-1.5 ml-1">
                        {promoCodesWithVia.length === 0 ? (
                          <span className="text-[11px] text-slate-400 font-normal">-</span>
                        ) : (
                          promoCodesWithVia.map((entry, idx) => (
                            <PromoCodeViaBadge
                              key={idx}
                              viaName={entry.viaName}
                              kodePromo={entry.kode}
                              size="md"
                              onCopy={(code, via) => {
                                onShowToast(`Kode promo "${code}" (${via}) berhasil disalin!`);
                              }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add / Edit Promo Modal */}
      <AddEditPromoSalurModal
        isOpen={isAddModalOpen}
        editingItem={editingPromo}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPromo(null);
        }}
        onSave={handleSavePromo}
      />

      {/* Atur Sekaligus Batch Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              Atur Sekaligus Promo S-SALUR
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih beberapa promo dan perbarui statusnya secara bersamaan:
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto mb-4 border border-slate-100 rounded-xl p-2">
              {promos.map((p) => {
                const isChecked = selectedPromoIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedPromoIds((prev) =>
                          isChecked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                        );
                      }}
                      className="rounded text-[#008d91] focus:ring-[#008d91]"
                    />
                    <span className="font-semibold text-slate-700">{p.namaPromo}</span>
                    <span className="text-slate-400 ml-auto">({p.status})</span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                Ubah Status Terpilih ke:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={selectedPromoIds.length === 0}
                  onClick={() => handleBatchStatusChange('Ongoing')}
                  className="px-3 py-2 text-xs font-medium bg-[#008d91] text-white rounded-xl hover:bg-[#05828e] disabled:opacity-40"
                >
                  Ongoing
                </button>
                <button
                  type="button"
                  disabled={selectedPromoIds.length === 0}
                  onClick={() => handleBatchStatusChange('Coming Soon')}
                  className="px-3 py-2 text-xs font-medium bg-slate-700 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40"
                >
                  Coming Soon
                </button>
                <button
                  type="button"
                  disabled={selectedPromoIds.length === 0}
                  onClick={() => handleBatchStatusChange('Berakhir')}
                  className="px-3 py-2 text-xs font-medium bg-slate-400 text-white rounded-xl hover:bg-slate-500 disabled:opacity-40"
                >
                  Berakhir
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setIsBatchModalOpen(false);
                  setSelectedPromoIds([]);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
