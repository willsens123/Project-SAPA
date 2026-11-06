import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  SlidersHorizontal,
  LayoutGrid,
  Menu as MenuIcon,
  HelpCircle,
} from 'lucide-react';
import { MenuArrangementConfig } from '../menuConfigData';

export interface NavItemMeta {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isLotus?: boolean;
  isSSalur?: boolean;
  badge?: number;
}

interface EditMenuArrangementModalProps {
  isOpen: boolean;
  onClose: () => void;
  allNavItems: NavItemMeta[];
  currentConfig: MenuArrangementConfig;
  onSave: (newConfig: MenuArrangementConfig) => void;
  onReset: () => void;
}

export const EditMenuArrangementModal: React.FC<EditMenuArrangementModalProps> = ({
  isOpen,
  onClose,
  allNavItems,
  currentConfig,
  onSave,
  onReset,
}) => {
  const [mainIds, setMainIds] = useState<string[]>([]);
  const [moreIds, setMoreIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Map of all items for fast lookup
  const itemsMap = useMemo(() => {
    const map = new Map<string, NavItemMeta>();
    allNavItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [allNavItems]);

  // Sync state when modal opens or currentConfig changes
  useEffect(() => {
    if (isOpen) {
      setMainIds([...currentConfig.mainMenuIds]);
      setMoreIds([...currentConfig.moreMenuIds]);
      setSearchQuery('');
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  // Move an item from Main Menu to More Menu
  const moveToMore = (id: string) => {
    setMainIds((prev) => prev.filter((item) => item !== id));
    setMoreIds((prev) => [...prev, id]);
  };

  // Move an item from More Menu to Main Menu
  const moveToMain = (id: string) => {
    setMoreIds((prev) => prev.filter((item) => item !== id));
    setMainIds((prev) => [...prev, id]);
  };

  // Move up within Main Menu
  const moveUpMain = (index: number) => {
    if (index <= 0) return;
    setMainIds((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  // Move down within Main Menu
  const moveDownMain = (index: number) => {
    if (index >= mainIds.length - 1) return;
    setMainIds((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // Move up within More Menu
  const moveUpMore = (index: number) => {
    if (index <= 0) return;
    setMoreIds((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  // Move down within More Menu
  const moveDownMore = (index: number) => {
    if (index >= moreIds.length - 1) return;
    setMoreIds((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleSave = () => {
    onSave({
      mainMenuIds: mainIds,
      moreMenuIds: moreIds,
    });
    onClose();
  };

  const handleResetToDefault = () => {
    onReset();
    onClose();
  };

  // Filter items based on search query
  const q = searchQuery.toLowerCase().trim();
  const filteredMainItems = mainIds
    .map((id, index) => ({ item: itemsMap.get(id), originalIndex: index }))
    .filter(({ item }) => {
      if (!item) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      );
    });

  const filteredMoreItems = moreIds
    .map((id, index) => ({ item: itemsMap.get(id), originalIndex: index }))
    .filter(({ item }) => {
      if (!item) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      );
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#05828e] text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Atur Susunan Menu & More Menu
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Susun menu yang langsung tampil di Menu utama dan menu yang masuk ke More Menu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Guidance Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#05828e]/20 focus:border-[#05828e] transition-all bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Guidance Info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-1.5 w-full sm:w-auto">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Gunakan tombol <strong>➡️</strong> atau <strong>⬅️</strong> untuk pindah, dan tombol <strong>⬆️ ⬇️</strong> untuk urutan.
            </span>
          </div>
        </div>

        {/* Dual Column Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
            {/* Column 1: Menu Utama */}
            <div className="flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-3.5 sm:p-4 bg-teal-50/70 border-b border-teal-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#05828e] text-white flex items-center justify-center">
                    <MenuIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Menu Utama
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Langsung ditampilkan di Sidebar
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#05828e] text-white shadow-2xs">
                  {mainIds.length} Menu
                </span>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto max-h-[460px] p-2 space-y-1.5 divide-y divide-slate-100">
                {filteredMainItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    {searchQuery
                      ? 'Tidak ada menu yang cocok dengan pencarian.'
                      : 'Belum ada menu di Menu Utama. Pindahkan dari More Menu.'}
                  </div>
                ) : (
                  filteredMainItems.map(({ item, originalIndex }) => {
                    if (!item) return null;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                      >
                        {/* Left: Index & Info */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 text-center text-[11px] font-bold text-slate-400">
                            {originalIndex + 1}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#05828e] flex items-center justify-center shrink-0 border border-teal-100/60">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-[13px] font-semibold text-slate-800 truncate">
                              {item.title}
                            </div>
                            <div className="text-[10.5px] text-slate-400 truncate">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => moveUpMain(originalIndex)}
                            disabled={originalIndex === 0}
                            title="Pindah ke Atas"
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => moveDownMain(originalIndex)}
                            disabled={originalIndex === mainIds.length - 1}
                            title="Pindah ke Bawah"
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Move to More Menu */}
                          <button
                            type="button"
                            onClick={() => moveToMore(item.id)}
                            title="Pindahkan ke More Menu"
                            className="ml-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>More</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: More Menu */}
            <div className="flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-3.5 sm:p-4 bg-amber-50/70 border-b border-amber-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      More Menu
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Disembunyikan di dalam menu bar "More Menu"
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-600 text-white shadow-2xs">
                  {moreIds.length} Menu
                </span>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto max-h-[460px] p-2 space-y-1.5 divide-y divide-slate-100">
                {filteredMoreItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    {searchQuery
                      ? 'Tidak ada menu yang cocok dengan pencarian.'
                      : 'Semua menu telah dipindahkan ke Menu Utama.'}
                  </div>
                ) : (
                  filteredMoreItems.map(({ item, originalIndex }) => {
                    if (!item) return null;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                      >
                        {/* Left: Index & Info */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 text-center text-[11px] font-bold text-slate-400">
                            {originalIndex + 1}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-[13px] font-semibold text-slate-800 truncate">
                              {item.title}
                            </div>
                            <div className="text-[10.5px] text-slate-400 truncate">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Move to Main Menu */}
                          <button
                            type="button"
                            onClick={() => moveToMain(item.id)}
                            title="Pindahkan ke Menu Utama"
                            className="mr-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-teal-50 text-[#05828e] hover:bg-teal-100 border border-teal-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Utama</span>
                          </button>
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => moveUpMore(originalIndex)}
                            disabled={originalIndex === 0}
                            title="Pindah ke Atas"
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => moveDownMore(originalIndex)}
                            disabled={originalIndex === moreIds.length - 1}
                            title="Pindah ke Bawah"
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset ke Standar</span>
          </button>

          <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#05828e] hover:bg-[#046c76] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Susunan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
