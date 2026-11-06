import React, { useState } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import {
  PosKeuanganItem,
  PosKeuanganCardLogoConfig,
  getPosKeuanganCardLogoFromStorage,
  savePosKeuanganCardLogoToStorage,
} from '../posKeuanganData';
import { PosKeuanganStatCard } from './PosKeuanganStatCard';
import { UbahLogoPosKeuanganModal } from './UbahLogoPosKeuanganModal';

interface PosKeuanganTableProps {
  items: PosKeuanganItem[];
  cardLogoConfig?: PosKeuanganCardLogoConfig;
  onUpdateCardLogo?: (config: PosKeuanganCardLogoConfig) => void;
  onAddClick: () => void;
  onEditItem: (item: PosKeuanganItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

export const PosKeuanganTable: React.FC<PosKeuanganTableProps> = ({
  items,
  cardLogoConfig,
  onUpdateCardLogo,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onShowToast = (_msg: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [localCardLogo, setLocalCardLogo] = useState<PosKeuanganCardLogoConfig>(() =>
    getPosKeuanganCardLogoFromStorage()
  );
  const [isChangeLogoModalOpen, setIsChangeLogoModalOpen] = useState(false);

  const effectiveCardLogo = cardLogoConfig || localCardLogo;

  const handleSaveCardLogo = (newCfg: PosKeuanganCardLogoConfig) => {
    setLocalCardLogo(newCfg);
    savePosKeuanganCardLogoToStorage(newCfg);
    if (onUpdateCardLogo) {
      onUpdateCardLogo(newCfg);
    }
    onShowToast('Logo Pos Keuangan berhasil diperbarui');
  };

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const formatCurrency = (val: number): string => {
    return `Rp${val.toLocaleString('id-ID')}`;
  };

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.namaPos.toLowerCase().includes(q) ||
      (it.subTitle && it.subTitle.toLowerCase().includes(q)) ||
      (it.coaNoAkun && it.coaNoAkun.toLowerCase().includes(q)) ||
      (it.coaNamaAkun && it.coaNamaAkun.toLowerCase().includes(q)) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Outer Card Container matching screenshot */}
      <div className="bg-[#f8fafc]/60 sm:bg-white rounded-3xl sm:border sm:border-slate-100 sm:shadow-2xs p-4 sm:p-8">
        {/* Top bar: Left stat card and Right action toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Left Stat Card: Pos Keuangan (menunjukkan secara real ada berapa Pos Keuangan & logo dapat diubah) */}
          <PosKeuanganStatCard
            count={items.length}
            cardLogoConfig={effectiveCardLogo}
            items={items}
            onLogoClick={() => setIsChangeLogoModalOpen(true)}
          />

          {/* Right Action Toolbar matching exact image */}
          <div className="flex items-center justify-end gap-3 self-end sm:self-center">
            {/* Toggle Search Bar */}
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pos keuangan..."
                  autoFocus
                  className="text-xs sm:text-sm text-slate-700 outline-hidden w-44 sm:w-60"
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
                title="Cari Pos Keuangan"
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}

            {/* Eye Off Icon */}
            <button
              type="button"
              title="Mode Privasi"
              onClick={() => onShowToast('Mode privasi tampilan')}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Sliders / Filter Icon */}
            <button
              type="button"
              title="Filter Pos Keuangan"
              onClick={() => onShowToast('Filter Pos Keuangan')}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* + Add Button matching Image */}
            <button
              type="button"
              onClick={onAddClick}
              className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007b7e] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Main Table Container Card matching Image */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden max-w-5xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 text-sm sm:text-base font-bold">
                  <th className="py-5 px-6 sm:px-8 font-bold w-[34%] text-slate-700">
                    Pos Keuangan
                  </th>
                  <th className="py-5 px-6 font-bold w-[28%] text-slate-700">
                    COA
                  </th>
                  <th className="py-5 px-6 font-bold w-[20%] text-slate-700">
                    Saldo
                  </th>
                  <th className="py-5 px-6 font-bold w-[12%] text-slate-700">
                    Keterangan
                  </th>
                  <th className="py-5 px-6 text-right w-[6%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      Tidak ada data Pos Keuangan. Klik "+ Add" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Column 1: Pos Keuangan (Badge + Nama + Subtitle) */}
                      <td className="py-4 px-6 sm:px-8">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xs shrink-0 select-none overflow-hidden"
                            style={{ backgroundColor: item.iconBg || '#2D3748' }}
                          >
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt={item.namaPos}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              item.iconLetter || item.namaPos.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm sm:text-[15px] leading-snug">
                              {item.namaPos}
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5">
                              {item.subTitle || 'Pos YPPLN'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: COA */}
                      <td className="py-4 px-6">
                        {item.coaNoAkun ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#008d91] font-mono font-bold text-xs border border-teal-200/90 w-fit shadow-2xs">
                              {item.coaNoAkun}
                            </span>
                            <span
                              className="text-slate-800 text-xs sm:text-[13px] font-medium leading-tight truncate max-w-[240px]"
                              title={item.coaNamaAkun}
                            >
                              {item.coaNamaAkun || '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs sm:text-sm italic">-</span>
                        )}
                      </td>

                      {/* Column 3: Saldo */}
                      <td className="py-4 px-6">
                        <span className="text-slate-700 text-sm sm:text-[14.5px] font-medium">
                          {formatCurrency(item.saldo)}
                        </span>
                      </td>

                      {/* Column 4: Keterangan */}
                      <td className="py-4 px-6">
                        <span className="text-slate-400 text-sm sm:text-[14.5px]">
                          {item.keterangan || '-'}
                        </span>
                      </td>

                      {/* Column 4: 3-dots actions menu */}
                      <td className="py-4 px-6 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className="text-[#e05d44] hover:text-[#c94b33] p-1.5 rounded-lg hover:bg-rose-50/60 transition-colors cursor-pointer"
                          title="Aksi Lainnya"
                        >
                          <MoreVertical className="w-5 h-5 stroke-[2]" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-6 top-12 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditItem(item);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteItem(item.id);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
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
      </div>

      {/* Modal Ubah Logo Pos Keuangan */}
      <UbahLogoPosKeuanganModal
        isOpen={isChangeLogoModalOpen}
        onClose={() => setIsChangeLogoModalOpen(false)}
        items={items}
        currentConfig={effectiveCardLogo}
        onSave={handleSaveCardLogo}
      />
    </div>
  );
};
