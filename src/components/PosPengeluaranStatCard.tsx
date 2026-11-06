import React from 'react';
import {
  CreditCard,
  Receipt,
  Wallet,
  Landmark,
  Building2,
  ShoppingCart,
  DollarSign,
  ArrowUpCircle,
  Layers,
  LucideIcon,
} from 'lucide-react';
import {
  PosPengeluaranGroup,
  PosPengeluaranCardLogoConfig,
  getPosPengeluaranFromStorage,
  getPosPengeluaranCardLogoFromStorage,
} from '../posPengeluaranData';

interface PosPengeluaranStatCardProps {
  count?: number;
  cardLogoConfig?: PosPengeluaranCardLogoConfig;
  groups?: PosPengeluaranGroup[];
  onLogoClick?: () => void;
  className?: string;
}

export const POS_PENGELUARAN_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  receipt: { label: 'Kwitansi / Struk', icon: Receipt },
  card: { label: 'Kartu', icon: CreditCard },
  wallet: { label: 'Dompet', icon: Wallet },
  landmark: { label: 'Bank / Kas', icon: Landmark },
  building: { label: 'Gedung / Kantor', icon: Building2 },
  'shopping-cart': { label: 'Keranjang', icon: ShoppingCart },
  dollar: { label: 'Keuangan', icon: DollarSign },
  expense: { label: 'Uang Keluar', icon: ArrowUpCircle },
  layers: { label: 'Alokasi', icon: Layers },
};

export const PosPengeluaranStatCard: React.FC<PosPengeluaranStatCardProps> = ({
  count,
  cardLogoConfig,
  groups,
  onLogoClick,
  className = '',
}) => {
  const effectiveCount =
    count !== undefined ? count : getPosPengeluaranFromStorage().length;
  const effectiveGroups =
    groups && groups.length > 0 ? groups : getPosPengeluaranFromStorage();
  const effectiveConfig =
    cardLogoConfig || getPosPengeluaranCardLogoFromStorage();

  let bgColor = '#2D3748';
  let logoNode: React.ReactNode = null;

  const mode = effectiveConfig?.mode || 'posPengeluaran';

  if (mode === 'posPengeluaran') {
    const matchedGroup =
      (effectiveConfig?.posPengeluaranId &&
        effectiveGroups.find((g) => g.id === effectiveConfig.posPengeluaranId)) ||
      effectiveGroups[0];

    if (matchedGroup) {
      bgColor = matchedGroup.iconBg || '#2D3748';
      if (matchedGroup.logoUrl) {
        logoNode = (
          <img
            src={matchedGroup.logoUrl}
            alt={matchedGroup.namaPosPengeluaran}
            className="w-full h-full object-cover"
          />
        );
      } else {
        logoNode = (
          <span className="font-bold text-lg select-none">
            {matchedGroup.iconLetter || matchedGroup.namaPosPengeluaran.charAt(0).toUpperCase() || 'P'}
          </span>
        );
      }
    } else {
      bgColor = effectiveConfig?.bgColor || '#2D3748';
      logoNode = <Receipt className="w-5 h-5 stroke-[2]" />;
    }
  } else if (mode === 'customImage' && effectiveConfig?.logoUrl) {
    bgColor = effectiveConfig.bgColor || '#2D3748';
    logoNode = (
      <img
        src={effectiveConfig.logoUrl}
        alt="Logo Pos Pengeluaran"
        className="w-full h-full object-cover"
      />
    );
  } else {
    bgColor = effectiveConfig?.bgColor || '#2D3748';
    const IconComponent =
      (effectiveConfig?.iconType && POS_PENGELUARAN_ICONS[effectiveConfig.iconType]?.icon) ||
      Receipt;
    logoNode = <IconComponent className="w-5 h-5 stroke-[2]" />;
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 px-4 py-3 flex items-center justify-between min-w-[210px] w-fit ${className}`}
    >
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Total Pos Pengeluaran
        </p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">
          {effectiveCount}
        </p>
      </div>

      <button
        type="button"
        onClick={onLogoClick}
        title="Klik untuk ubah logo Pos Pengeluaran"
        aria-label="Ubah logo Pos Pengeluaran"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs cursor-pointer hover:opacity-90 active:scale-95 transition-all ml-4"
        style={{ backgroundColor: bgColor }}
      >
        {logoNode}
      </button>
    </div>
  );
};
