import React from 'react';
import {
  Coins,
  Wallet,
  Landmark,
  Building2,
  ShoppingCart,
  PiggyBank,
  DollarSign,
  ArrowDownCircle,
  Layers,
  Receipt,
  LucideIcon,
} from 'lucide-react';
import {
  PosPemasukanGroup,
  PosPemasukanCardLogoConfig,
  getPosPemasukanFromStorage,
  getPosPemasukanCardLogoFromStorage,
} from '../posPemasukanData';

interface PosPemasukanStatCardProps {
  count?: number;
  cardLogoConfig?: PosPemasukanCardLogoConfig;
  groups?: PosPemasukanGroup[];
  onLogoClick?: () => void;
  className?: string;
}

export const POS_PEMASUKAN_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  coins: { label: 'Koin', icon: Coins },
  wallet: { label: 'Dompet', icon: Wallet },
  landmark: { label: 'Bank / Lembaga', icon: Landmark },
  building: { label: 'Gedung', icon: Building2 },
  'shopping-cart': { label: 'Keranjang', icon: ShoppingCart },
  piggy: { label: 'Tabungan', icon: PiggyBank },
  dollar: { label: 'Keuangan', icon: DollarSign },
  income: { label: 'Uang Masuk', icon: ArrowDownCircle },
  layers: { label: 'Alokasi', icon: Layers },
  receipt: { label: 'Kwitansi', icon: Receipt },
};

export const PosPemasukanStatCard: React.FC<PosPemasukanStatCardProps> = ({
  count,
  cardLogoConfig,
  groups,
  onLogoClick,
  className = '',
}) => {
  const effectiveCount =
    count !== undefined ? count : getPosPemasukanFromStorage().length;
  const effectiveGroups =
    groups && groups.length > 0 ? groups : getPosPemasukanFromStorage();
  const effectiveConfig =
    cardLogoConfig || getPosPemasukanCardLogoFromStorage();

  // Determine displayed logo and background color
  let bgColor = '#008d91';
  let logoNode: React.ReactNode = null;

  const mode = effectiveConfig?.mode || 'posPemasukan';

  if (mode === 'posPemasukan') {
    // Mirror the selected Pos Pemasukan, or the first displayed one
    const matchedGroup =
      (effectiveConfig?.posPemasukanId &&
        effectiveGroups.find((g) => g.id === effectiveConfig.posPemasukanId)) ||
      effectiveGroups[0];

    if (matchedGroup) {
      bgColor = matchedGroup.iconBg || '#2D3748';
      if (matchedGroup.logoUrl) {
        logoNode = (
          <img
            src={matchedGroup.logoUrl}
            alt={matchedGroup.namaPosPemasukan}
            className="w-full h-full object-cover"
          />
        );
      } else {
        logoNode = (
          <span className="font-bold text-lg select-none">
            {matchedGroup.iconLetter || matchedGroup.namaPosPemasukan.charAt(0).toUpperCase() || 'P'}
          </span>
        );
      }
    } else {
      // Fallback if no groups exist
      bgColor = effectiveConfig?.bgColor || '#008d91';
      logoNode = <Coins className="w-5 h-5 stroke-[2]" />;
    }
  } else if (mode === 'customImage' && effectiveConfig?.logoUrl) {
    bgColor = effectiveConfig.bgColor || '#008d91';
    logoNode = (
      <img
        src={effectiveConfig.logoUrl}
        alt="Logo Pos Pemasukan"
        className="w-full h-full object-cover"
      />
    );
  } else {
    // Mode 'icon' or fallback
    bgColor = effectiveConfig?.bgColor || '#008d91';
    const iconKey = effectiveConfig?.iconType || 'coins';
    const IconComponent = POS_PEMASUKAN_ICONS[iconKey]?.icon || Coins;
    logoNode = <IconComponent className="w-5 h-5 stroke-[2]" />;
  }

  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl px-5 py-3.5 flex items-center justify-between w-full sm:w-64 shadow-2xs ${className}`}
    >
      <div className="flex flex-col">
        <span className="text-xs text-slate-400 font-medium tracking-tight">
          Pos Pemasukan
        </span>
        <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">
          {effectiveCount} buah
        </span>
      </div>
      <button
        type="button"
        onClick={onLogoClick}
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 select-none overflow-hidden transition-all ${
          onLogoClick
            ? 'cursor-pointer hover:scale-105 active:scale-95 hover:ring-2 hover:ring-[#008d91]/30'
            : ''
        }`}
        style={{ backgroundColor: bgColor }}
        title={onLogoClick ? 'Klik untuk ubah logo Pos Pemasukan' : 'Pos Pemasukan'}
      >
        {logoNode}
      </button>
    </div>
  );
};
