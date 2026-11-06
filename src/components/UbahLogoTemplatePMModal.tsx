import React, { useState, useEffect } from 'react';
import { X, Upload, Check, MessageSquareText } from 'lucide-react';
import {
  TemplatePMLogoConfig,
  TEMPLATE_PM_ICONS,
  getTemplatePMLogoFromStorage,
  saveTemplatePMLogoToStorage,
} from './TemplatePMStatCard';

interface UbahLogoTemplatePMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COLOR_PALETTE = [
  '#2c323f', // Dark slate (default from user screenshot)
  '#008d91', // Teal brand
  '#CF5340', // Coral
  '#3182CE', // Blue
  '#805AD5', // Purple
  '#38A169', // Green
  '#DD6B20', // Orange
  '#1E293B', // Deep navy
];

export const UbahLogoTemplatePMModal: React.FC<UbahLogoTemplatePMModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'letter' | 'icon' | 'customImage'>('menu');
  const [selectedLetter, setSelectedLetter] = useState<string>('P');
  const [selectedIconType, setSelectedIconType] = useState<string>('messagesquare');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('#2c323f');

  useEffect(() => {
    if (isOpen) {
      const current = getTemplatePMLogoFromStorage();
      setActiveTab(current.mode || 'letter');
      setSelectedLetter(current.letter || 'P');
      setSelectedIconType(current.iconType || 'messagesquare');
      setLogoUrl(current.logoUrl || '');
      setBgColor(current.bgColor || '#2c323f');
    }
  }, [isOpen]);

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
    const newConfig: TemplatePMLogoConfig = {
      mode: activeTab,
      letter: activeTab === 'letter' ? selectedLetter : undefined,
      iconType: activeTab === 'icon' ? selectedIconType : 'messagesquare',
      logoUrl: activeTab === 'customImage' ? logoUrl.trim() : undefined,
      bgColor,
    };
    saveTemplatePMLogoToStorage(newConfig);
    if (onSuccess) onSuccess();
    onClose();
  };

  // Preview Node
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
      <span className="font-bold text-lg select-none">
        {selectedLetter || 'P'}
      </span>
    );
  } else if (activeTab === 'menu') {
    previewNode = <MessageSquareText className="w-5 h-5 stroke-[2]" />;
  } else {
    const IconComp = TEMPLATE_PM_ICONS[selectedIconType]?.icon || MessageSquareText;
    previewNode = <IconComp className="w-5 h-5 stroke-[2]" />;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Ubah Logo Template PM
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kustomisasi logo dan tampilan kartu Template PM
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Preview Tampilan
            </span>
            <span className="text-xs text-slate-600 mt-0.5">
              Template PM
            </span>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs select-none overflow-hidden transition-all"
            style={{ backgroundColor: bgColor }}
          >
            {previewNode}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-5 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'menu'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Menu Logo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('letter')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'letter'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Huruf
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('icon')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'icon'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Ikon
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customImage')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'customImage'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Upload
          </button>
        </div>

        {/* Tab 1: Menu Logo */}
        {activeTab === 'menu' && (
          <div className="space-y-3 mb-5">
            <label className="block text-xs font-semibold text-slate-700">
              Logo Menu Template PM
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: bgColor }}
                >
                  <MessageSquareText className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Ikon Resmi Template PM
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sesuai menu navigasi Template PM
                  </div>
                </div>
              </div>
              <Check className="w-4 h-4 text-[#008d91]" />
            </div>
          </div>
        )}

        {/* Tab 2: Huruf Inisial */}
        {activeTab === 'letter' && (
          <div className="space-y-3 mb-5">
            <label className="block text-xs font-semibold text-slate-700">
              Pilih / Ketik Huruf Inisial
            </label>
            <div className="flex items-center gap-2 mb-2">
              {['P', 'T', 'PM', 'M', 'S'].map((lettr) => (
                <button
                  key={lettr}
                  type="button"
                  onClick={() => setSelectedLetter(lettr)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
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
              maxLength={3}
              value={selectedLetter}
              onChange={(e) => setSelectedLetter(e.target.value.toUpperCase())}
              placeholder="Ketik huruf..."
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-[#008d91]"
            />
          </div>
        )}

        {/* Tab 3: Ikon */}
        {activeTab === 'icon' && (
          <div className="space-y-3 mb-5">
            <label className="block text-xs font-semibold text-slate-700">
              Pilih Ikon Lucide
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(TEMPLATE_PM_ICONS).map(([key, item]) => {
                const IconComp = item.icon;
                const isSelected = selectedIconType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedIconType(key)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#008d91] bg-teal-50 text-[#008d91] ring-2 ring-[#008d91]/20'
                        : 'border-slate-100 hover:border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <IconComp className="w-5 h-5 mb-1" />
                    <span className="text-[10px] truncate max-w-full text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Upload Custom Image */}
        {activeTab === 'customImage' && (
          <div className="space-y-3 mb-5">
            <label className="block text-xs font-semibold text-slate-700">
              Upload Gambar Logo
            </label>
            <label className="border-2 border-dashed border-slate-200 hover:border-[#008d91] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Pilih file logo
              </span>
              <span className="text-[10px] text-slate-400">
                PNG, JPG, SVG, WebP (maks. 2MB)
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
                Gambar berhasil dipilih
              </div>
            )}
          </div>
        )}

        {/* Warna Latar Belakang */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Warna Background
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setBgColor(color)}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white ${
                  bgColor.toLowerCase() === color.toLowerCase()
                    ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                    : 'hover:scale-105'
                }`}
                title={color}
              >
                {bgColor.toLowerCase() === color.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
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
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Simpan Logo
          </button>
        </div>
      </div>
    </div>
  );
};
