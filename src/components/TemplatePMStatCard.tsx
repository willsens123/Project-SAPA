import React, { useState, useEffect } from 'react';
import {
  MessageSquareText,
  MessageCircle,
  FileText,
  Send,
  Mail,
  Sparkles,
  BookOpen,
  Layers,
  Bot,
  Bookmark,
  Award,
  LucideIcon,
} from 'lucide-react';

export interface TemplatePMLogoConfig {
  mode: 'menu' | 'letter' | 'icon' | 'customImage';
  iconType?: string;
  letter?: string;
  logoUrl?: string;
  bgColor?: string;
}

export const TEMPLATE_PM_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  messagesquare: { label: 'Menu Template PM', icon: MessageSquareText },
  messagecircle: { label: 'Chat Pesan', icon: MessageCircle },
  filetext: { label: 'Dokumen Teks', icon: FileText },
  send: { label: 'Kirim Pesan', icon: Send },
  mail: { label: 'Surat', icon: Mail },
  sparkles: { label: 'Otomasi', icon: Sparkles },
  book: { label: 'Buku', icon: BookOpen },
  layers: { label: 'Koleksi', icon: Layers },
  bot: { label: 'Robot / Auto', icon: Bot },
  bookmark: { label: 'Bookmark', icon: Bookmark },
  award: { label: 'Resmi', icon: Award },
};

const STORAGE_KEY_LOGO = 'yppln_template_pm_stat_card_logo_v1';

export function getTemplatePMLogoFromStorage(): TemplatePMLogoConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOGO);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Error reading Template PM logo config:', err);
  }
  // Default matching user screenshot: dark slate container with "P" letter, or Template PM menu icon
  return {
    mode: 'letter',
    letter: 'P',
    iconType: 'messagesquare',
    bgColor: '#2c323f',
  };
}

export function saveTemplatePMLogoToStorage(config: TemplatePMLogoConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGO, JSON.stringify(config));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('template_pm_logo_changed'));
    }
  } catch (err) {
    console.warn('Error saving Template PM logo config:', err);
  }
}

interface TemplatePMStatCardProps {
  activeCount: number;
  onLogoClick?: () => void;
  className?: string;
}

export const TemplatePMStatCard: React.FC<TemplatePMStatCardProps> = ({
  activeCount,
  onLogoClick,
  className = '',
}) => {
  const [config, setConfig] = useState<TemplatePMLogoConfig>(() => getTemplatePMLogoFromStorage());

  useEffect(() => {
    const handleSync = () => {
      setConfig(getTemplatePMLogoFromStorage());
    };
    window.addEventListener('template_pm_logo_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('template_pm_logo_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const bgColor = config.bgColor || '#2c323f';

  // Determine rendered logo node
  let logoNode: React.ReactNode = null;

  if (config.mode === 'customImage' && config.logoUrl) {
    logoNode = (
      <img
        src={config.logoUrl}
        alt="Logo Template PM"
        className="w-full h-full object-cover"
      />
    );
  } else if (config.mode === 'letter') {
    logoNode = (
      <span className="font-bold text-lg select-none tracking-normal">
        {config.letter || 'P'}
      </span>
    );
  } else if (config.mode === 'menu') {
    logoNode = <MessageSquareText className="w-5 h-5 stroke-[2]" />;
  } else {
    // Mode 'icon'
    const iconKey = config.iconType || 'messagesquare';
    const IconComp = TEMPLATE_PM_ICONS[iconKey]?.icon || MessageSquareText;
    logoNode = <IconComp className="w-5 h-5 stroke-[2]" />;
  }

  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl px-5 py-3.5 flex items-center justify-between w-full sm:w-64 shadow-2xs ${className}`}
    >
      <div className="flex flex-col">
        <span className="text-xs text-slate-400 font-medium tracking-tight">
          Template PM
        </span>
        <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">
          {activeCount} buah
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
        title={onLogoClick ? 'Klik untuk ubah logo Template PM' : 'Template PM'}
      >
        {logoNode}
      </button>
    </div>
  );
};
