import React, { useState } from 'react';
import {
  MessageCircle,
  Bot,
  ShoppingBag,
  Store,
  Phone,
  Instagram,
  FileText,
  UserCheck,
  Globe,
  Music,
  Check,
} from 'lucide-react';

export interface ViaLogoProps {
  viaName: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Renders the accurate logo for a channel / via transaksi S-SALUR.
 * Matches user's reference image styling:
 * - WhatsApp: Green circular icon with chat bubble (#25D366)
 * - Tokopedia: Green robot / owl face icon (#3DDC84 / #03AC0E)
 * - Shopee / Marketplace: Light teal circle with shopping bag icon (#008d91)
 * - Website Store / Web: Solid teal rounded square with storefront icon (#008d91)
 * - Call Center: Teal circle with phone icon (#008d91)
 * - Instagram: Gradient badge with camera
 * - Facebook: Blue circle with 'f'
 * - Others: Distinct styled branded badges
 */
export const ViaChannelLogo: React.FC<ViaLogoProps> = ({
  viaName,
  className = '',
  size = 'md',
}) => {
  const norm = viaName.toLowerCase().trim();
  const dimClass = size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-[11px]';

  // 1. WhatsApp / WA
  if (norm.includes('whatsapp') || norm.includes('wa')) {
    return (
      <div
        className={`${dimClass} rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xs shrink-0 ${className}`}
        title={`WhatsApp - ${viaName}`}
      >
        <MessageCircle className={size === 'sm' ? 'w-2.5 h-2.5 fill-current' : 'w-3.5 h-3.5 fill-current'} />
      </div>
    );
  }

  // 2. Tokopedia / Toped / Android
  if (norm.includes('tokopedia') || norm.includes('toped') || norm.includes('android')) {
    return (
      <div
        className={`${dimClass} flex items-center justify-center text-[#3DDC84] shrink-0 ${className}`}
        title={`Tokopedia - ${viaName}`}
      >
        <Bot className={size === 'sm' ? 'w-3.5 h-3.5 stroke-[2.2]' : 'w-4 h-4 stroke-[2.2]'} />
      </div>
    );
  }

  // 3. Shopee / Shoppee / Marketplace / Amazon
  if (
    norm.includes('shopee') ||
    norm.includes('shoppee') ||
    norm.includes('marketplace') ||
    norm.includes('market place') ||
    norm.includes('amazon')
  ) {
    return (
      <div
        className={`${dimClass} rounded-full bg-[#008d91]/15 text-[#008d91] flex items-center justify-center font-bold shrink-0 ${className}`}
        title={`Shopee / Marketplace - ${viaName}`}
      >
        <ShoppingBag className={size === 'sm' ? 'w-2.5 h-2.5 stroke-[2.5]' : 'w-3 h-3 stroke-[2.5]'} />
      </div>
    );
  }

  // 4. Website Store / Web / Website / Store / E-shop
  if (
    norm.includes('website') ||
    norm.includes('web') ||
    norm.includes('store') ||
    norm.includes('eshop') ||
    norm.includes('e-shop')
  ) {
    return (
      <div
        className={`${dimClass} rounded bg-[#008d91] text-white flex items-center justify-center font-bold shrink-0 ${className}`}
        title={`Website Store - ${viaName}`}
      >
        <Store className={size === 'sm' ? 'w-2.5 h-2.5 stroke-[2]' : 'w-3 h-3 stroke-[2]'} />
      </div>
    );
  }

  // 5. Call Center / CC / Phone
  if (norm.includes('call center') || norm === 'cc' || norm.includes('callcenter')) {
    return (
      <div
        className={`${dimClass} rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-2xs shrink-0 ${className}`}
        title={`Call Center - ${viaName}`}
      >
        <Phone className={size === 'sm' ? 'w-2.5 h-2.5 fill-current' : 'w-3 h-3 fill-current'} />
      </div>
    );
  }

  // 6. Instagram / IG
  if (norm.includes('instagram') || norm === 'ig') {
    return (
      <div
        className={`${dimClass} rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-2xs shrink-0 ${className}`}
        title={`Instagram - ${viaName}`}
      >
        <Instagram className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      </div>
    );
  }

  // 7. Facebook / FB
  if (norm.includes('facebook') || norm === 'fb') {
    return (
      <div
        className={`${dimClass} rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-2xs shrink-0 font-bold ${className}`}
        title={`Facebook - ${viaName}`}
      >
        f
      </div>
    );
  }

  // 8. TikTok
  if (norm.includes('tiktok')) {
    return (
      <div
        className={`${dimClass} rounded-full bg-black text-white flex items-center justify-center shadow-2xs shrink-0 ${className}`}
        title={`TikTok - ${viaName}`}
      >
        <Music className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      </div>
    );
  }

  // 9. Stand / Stand Online
  if (norm.includes('stand')) {
    return (
      <div
        className={`${dimClass} rounded-md bg-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0 ${className}`}
        title={`Stand - ${viaName}`}
      >
        <Store className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      </div>
    );
  }

  // 10. Kezya / Agen Purna
  if (norm.includes('kezya') || norm.includes('agen')) {
    return (
      <div
        className={`${dimClass} rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0 ${className}`}
        title={`Agen Purna - ${viaName}`}
      >
        <UserCheck className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      </div>
    );
  }

  // 11. Form / Form Buku
  if (norm.includes('form')) {
    return (
      <div
        className={`${dimClass} rounded-md bg-sky-500 text-white flex items-center justify-center shadow-2xs shrink-0 ${className}`}
        title={`Form - ${viaName}`}
      >
        <FileText className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      </div>
    );
  }

  // Fallback for custom / other via
  return (
    <div
      className={`${dimClass} rounded-full bg-[#008d91]/20 text-[#008d91] font-bold flex items-center justify-center shrink-0 uppercase ${className}`}
      title={viaName}
    >
      {viaName.charAt(0) || <Globe className="w-2.5 h-2.5" />}
    </div>
  );
};

export interface PromoCodeViaBadgeProps {
  viaName: string;
  kodePromo: string;
  onCopy?: (code: string, via: string) => void;
  size?: 'sm' | 'md';
}

/**
 * Interactive Logo beside "Kode Promo".
 * - Shows the logo of the via that has this promo code.
 * - On hover: Displays the promo code in a tooltip.
 * - On click: Copies the code to clipboard and provides visual feedback.
 */
export const PromoCodeViaBadge: React.FC<PromoCodeViaBadgeProps> = ({
  viaName,
  kodePromo,
  onCopy,
  size = 'md',
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!kodePromo) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(kodePromo).catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = kodePromo;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = kodePromo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (_) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = kodePromo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
    setIsCopied(true);
    onCopy?.(kodePromo, viaName);
    setTimeout(() => {
      setIsCopied(false);
    }, 1800);
  };

  return (
    <div
      className="relative inline-flex items-center group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={`${viaName}: ${kodePromo} (Klik untuk salin kode)`}
    >
      <div className="transition-transform group-hover:scale-115 active:scale-95 duration-150">
        <ViaChannelLogo viaName={viaName} size={size} />
      </div>

      {/* Floating Hover Tooltip matching clean UI */}
      {isHovered && (
        <div className="absolute right-0 bottom-full mb-1.5 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Tersalin!</span>
              </>
            ) : (
              <>
                <span className="text-slate-300 font-normal">{viaName}:</span>
                <span className="font-bold text-teal-300 font-mono tracking-wide">{kodePromo}</span>
                <span className="text-[9px] text-slate-400 font-light">• Klik salin</span>
              </>
            )}
          </div>
          {/* Subtle tooltip arrow */}
          <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 mx-auto -mt-0.5" />
        </div>
      )}
    </div>
  );
};
