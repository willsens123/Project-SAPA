import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Check,
  Globe,
  ShoppingCart,
  BookOpen,
  Package,
  Heart,
  Sparkles,
  Gift,
  Star,
  Smile,
  Award,
  Layers,
  LucideIcon,
} from 'lucide-react';

export interface ItemDonasiCardLogoConfig {
  icon?: string;
  iconBg?: string;
  logoUrl?: string;
  letter?: string;
}

export const ITEM_DONASI_PELIMPAHAN_ICONS: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  globe: { label: 'Globe', icon: Globe },
  cart: { label: 'Keranjang', icon: ShoppingCart },
  book: { label: 'Buku', icon: BookOpen },
  package: { label: 'Paket', icon: Package },
  heart: { label: 'Donasi', icon: Heart },
  sparkles: { label: 'Kebaikan', icon: Sparkles },
  gift: { label: 'Hadiah', icon: Gift },
  star: { label: 'Patron', icon: Star },
  smile: { label: 'Penerima', icon: Smile },
  award: { label: 'Resmi', icon: Award },
  layers: { label: 'Alokasi', icon: Layers },
};

interface UbahLogoItemDonasiPelimpahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardName: string;
  currentConfig?: ItemDonasiCardLogoConfig;
  onSave: (config: ItemDonasiCardLogoConfig) => void;
}

const COLOR_PALETTE = [
  '#008d91', // Teal (default)
  '#2c323f', // Dark slate
  '#E05D44', // Coral / Red
  '#F59E0B', // Amber / Gold
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#EC4899', // Pink
];

export const UbahLogoItemDonasiPelimpahanModal: React.FC<
  UbahLogoItemDonasiPelimpahanModalProps
> = ({ isOpen, onClose, cardName, currentConfig, onSave }) => {
  const [activeTab, setActiveTab] = useState<'icon' | 'letter' | 'customImage'>('icon');
  const [selectedIcon, setSelectedIcon] = useState<string>('globe');
  const [selectedLetter, setSelectedLetter] = useState<string>('B');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [iconBg, setIconBg] = useState<string>('#008d91');

  useEffect(() => {
    if (isOpen) {
      if (currentConfig?.logoUrl) {
        setActiveTab('customImage');
        setLogoUrl(currentConfig.logoUrl);
      } else if (currentConfig?.letter) {
        setActiveTab('letter');
        setSelectedLetter(currentConfig.letter);
      } else {
        setActiveTab('icon');
        setSelectedIcon(currentConfig?.icon || 'globe');
      }
      setIconBg(currentConfig?.iconBg || '#008d91');
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLogoUrl(uploadEvent.target.result as string);
          setActiveTab('customImage');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const newConfig: ItemDonasiCardLogoConfig = {
      icon: activeTab === 'icon' ? selectedIcon : undefined,
      letter: activeTab === 'letter' ? selectedLetter : undefined,
      logoUrl: activeTab === 'customImage' ? logoUrl.trim() : undefined,
      iconBg,
    };
    onSave(newConfig);
    onClose();
  };

  // Preview node
  let previewNode: React.ReactNode = null;
  if (activeTab === 'customImage' && logoUrl) {
    previewNode = (
      <img
        src={logoUrl}
        alt="Preview Logo"
        className="w-full h-full object-cover"
      />
    );
  } else if (activeTab === 'letter') {
    previewNode = (
      <span className="font-bold text-sm select-none">
        {selectedLetter || 'B'}
      </span>
    );
  } else {
    const IconComp = ITEM_DONASI_PELIMPAHAN_ICONS[selectedIcon]?.icon || Globe;
    previewNode = <IconComp className="w-3.5 h-3.5 stroke-[1.8]" />;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Ubah Logo Item D-DONASI
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]" title={cardName}>
              {cardName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Preview Logo
            </span>
            <span className="text-xs font-semibold text-slate-700 truncate mt-0.5">
              {cardName}
            </span>
          </div>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-2xs select-none overflow-hidden transition-all shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            {previewNode}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-4 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('icon')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'icon'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Ikon
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('letter')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'letter'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Huruf
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customImage')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'customImage'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Upload
          </button>
        </div>

        {/* Tab 1: Ikon */}
        {activeTab === 'icon' && (
          <div className="space-y-2 mb-4">
            <label className="block text-[11px] font-semibold text-slate-700">
              Pilih Ikon
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
              {Object.entries(ITEM_DONASI_PELIMPAHAN_ICONS).map(([key, item]) => {
                const IconComp = item.icon;
                const isSelected = selectedIcon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedIcon(key)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91] ring-2 ring-[#008d91]/20'
                        : 'border-slate-100 hover:border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <IconComp className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] truncate max-w-full text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Huruf */}
        {activeTab === 'letter' && (
          <div className="space-y-2 mb-4">
            <label className="block text-[11px] font-semibold text-slate-700">
              Pilih / Ketik Huruf Inisial
            </label>
            <div className="flex items-center gap-1.5 mb-2">
              {['B', 'P', 'K', 'V', 'D', 'A'].map((lettr) => (
                <button
                  key={lettr}
                  type="button"
                  onClick={() => setSelectedLetter(lettr)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    selectedLetter === lettr
                      ? 'bg-[#008d91] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lettr}
                </button>
              ))}
            </div>
            <input
              type="text"
              maxLength={2}
              value={selectedLetter}
              onChange={(e) => setSelectedLetter(e.target.value.toUpperCase())}
              placeholder="Huruf..."
              className="w-full text-xs border border-slate-200 rounded-xl p-2 outline-none focus:border-[#008d91]"
            />
          </div>
        )}

        {/* Tab 3: Upload Custom Image */}
        {activeTab === 'customImage' && (
          <div className="space-y-2 mb-4">
            <label className="block text-[11px] font-semibold text-slate-700">
              Upload Gambar Logo
            </label>
            <label className="border-2 border-dashed border-slate-200 hover:border-[#008d91] rounded-2xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Pilih file logo
              </span>
              <span className="text-[10px] text-slate-400">
                PNG, JPG, SVG (maks. 2MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {logoUrl && (
              <div className="text-[11px] text-[#008d91] font-medium truncate">
                Gambar dipilih
              </div>
            )}
          </div>
        )}

        {/* Warna Latar Belakang */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
            Warna Background
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setIconBg(color)}
                style={{ backgroundColor: color }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white ${
                  iconBg.toLowerCase() === color.toLowerCase()
                    ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                    : 'hover:scale-105'
                }`}
                title={color}
              >
                {iconBg.toLowerCase() === color.toLowerCase() && (
                  <Check className="w-3 h-3 stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Simpan Logo
          </button>
        </div>
      </div>
    </div>
  );
};
