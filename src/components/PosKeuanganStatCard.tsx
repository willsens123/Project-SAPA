import React from 'react';
import {
  Wallet,
  Coins,
  Landmark,
  Building2,
  PiggyBank,
  CreditCard,
  Receipt,
  ShoppingCart,
  DollarSign,
  ArrowDownCircle,
  LucideIcon,
} from 'lucide-react';
import {
  PosKeuanganItem,
  PosKeuanganCardLogoConfig,
  getPosKeuanganFromStorage,
  getPosKeuanganCardLogoFromStorage,
} from '../posKeuanganData';

interface PosKeuanganStatCardProps {
  count?: number;
  cardLogoConfig?: PosKeuanganCardLogoConfig;
  items?: PosKeuanganItem[];
  onLogoClick?: () => void;
  className?: string;
}

export const POS_KEUANGAN_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  wallet: { label: 'Dompet', icon: Wallet },
  coins: { label: 'Koin', icon: Coins },
  landmark: { label: 'Bank / Lembaga', icon: Landmark },
  building: { label: 'Gedung', icon: Building2 },
  piggy: { label: 'Tabungan', icon: PiggyBank },
  card: { label: 'Kartu', icon: CreditCard },
  receipt: { label: 'Kwitansi', icon: Receipt },
  'shopping-cart': { label: 'Keranjang', icon: ShoppingCart },
  dollar: { label: 'Uang', icon: DollarSign },
  income: { label: 'Kas Masuk', icon: ArrowDownCircle },
};

export const PosKeuanganStatCard: React.FC<PosKeuanganStatCardProps> = ({
  count,
  cardLogoConfig,
  items,
  onLogoClick,
  className = '',
}) => {
  const effectiveCount =
    count !== undefined ? count : getPosKeuanganFromStorage().length;
  const effectiveItems =
    items && items.length > 0 ? items : getPosKeuanganFromStorage();
  const effectiveConfig =
    cardLogoConfig || getPosKeuanganCardLogoFromStorage();

  let bgColor = '#2D3748';
  let logoNode: React.ReactNode = null;

  const mode = effectiveConfig?.mode || 'posKeuangan';

  if (mode === 'posKeuangan') {
    // Mirror the selected Pos Keuangan, or the first displayed one
    const matchedItem =
      (effectiveConfig?.posKeuanganId &&
        effectiveItems.find((it) => it.id === effectiveConfig.posKeuanganId)) ||
      effectiveItems[0];

    if (matchedItem) {
      bgColor = matchedItem.iconBg || '#2D3748';
      if (matchedItem.logoUrl) {
        logoNode = (
          <img
            src={matchedItem.logoUrl}
            alt={matchedItem.namaPos}
            className="w-full h-full object-cover"
          />
        );
      } else {
        logoNode = (
          <span className="font-bold text-lg select-none">
            {matchedItem.iconLetter || matchedItem.namaPos.charAt(0).toUpperCase() || 'P'}
          </span>
        );
      }
    } else {
      bgColor = effectiveConfig?.bgColor || '#2D3748';
      logoNode = <Wallet className="w-5 h-5 stroke-[2]" />;
    }
  } else if (mode === 'customImage' && effectiveConfig?.logoUrl) {
    bgColor = effectiveConfig.bgColor || '#008d91';
    logoNode = (
      <img
        src={effectiveConfig.logoUrl}
        alt="Logo Pos Keuangan"
        className="w-full h-full object-cover"
      />
    );
  } else {
    // Mode 'icon'
    bgColor = effectiveConfig?.bgColor || '#008d91';
    const iconKey = effectiveConfig?.iconType || 'wallet';
    const IconComponent = POS_KEUANGAN_ICONS[iconKey]?.icon || Wallet;
    logoNode = <IconComponent className="w-5 h-5 stroke-[2]" />;
  }

  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl px-5 py-3.5 flex items-center justify-between w-full sm:w-64 shadow-2xs ${className}`}
    >
      <div className="flex flex-col">
        <span className="text-xs text-slate-400 font-medium tracking-tight">
          Pos Keuangan
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
        title={onLogoClick ? 'Klik untuk ubah logo Pos Keuangan' : 'Pos Keuangan'}
      >
        {logoNode}
      </button>
    </div>
  );
};
