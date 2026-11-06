import React, { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import {
  PosPemasukanGroup,
  PosPemasukanCardLogoConfig,
} from '../posPemasukanData';
import { POS_PEMASUKAN_ICONS } from './PosPemasukanStatCard';

interface UbahLogoPosPemasukanModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: PosPemasukanGroup[];
  currentConfig?: PosPemasukanCardLogoConfig;
  onSave: (config: PosPemasukanCardLogoConfig) => void;
}

const COLOR_PALETTE = [
  '#008d91', // Teal (default brand)
  '#2D3748', // Slate dark
  '#CF5340', // Coral
  '#B0B5B9', // Silver gray
  '#3182CE', // Blue
  '#805AD5', // Purple
  '#38A169', // Green
  '#DD6B20', // Orange
];

export const UbahLogoPosPemasukanModal: React.FC<UbahLogoPosPemasukanModalProps> = ({
  isOpen,
  onClose,
  groups,
  currentConfig,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'posPemasukan' | 'icon' | 'customImage'>('posPemasukan');
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [selectedIconType, setSelectedIconType] = useState<string>('coins');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('#008d91');

  useEffect(() => {
    if (isOpen) {
      const mode = currentConfig?.mode || 'posPemasukan';
      setActiveTab(mode);
      setSelectedPosId(
        currentConfig?.posPemasukanId || (groups.length > 0 ? groups[0].id : '')
      );
      setSelectedIconType(currentConfig?.iconType || 'coins');
      setLogoUrl(currentConfig?.logoUrl || '');
      setBgColor(currentConfig?.bgColor || '#008d91');
    }
  }, [isOpen, currentConfig, groups]);

  if (!isOpen) return null;

  // Selected pos pemasukan item
  const selectedPos = groups.find((g) => g.id === selectedPosId) || groups[0];

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
    const newConfig: PosPemasukanCardLogoConfig = {
      mode: activeTab,
      posPemasukanId: activeTab === 'posPemasukan' ? selectedPosId || (groups[0]?.id) : undefined,
      iconType: selectedIconType,
      logoUrl: activeTab === 'customImage' ? logoUrl.trim() : undefined,
      bgColor:
        activeTab === 'posPemasukan' && selectedPos
          ? selectedPos.iconBg || bgColor
          : bgColor,
    };
    onSave(newConfig);
    onClose();
  };

  // Preview logo computation
  let previewBg = bgColor;
  let previewNode: React.ReactNode = null;

  if (activeTab === 'posPemasukan') {
    if (selectedPos) {
      previewBg = selectedPos.iconBg || '#2D3748';
      if (selectedPos.logoUrl) {
        previewNode = (
          <img
            src={selectedPos.logoUrl}
            alt={selectedPos.namaPosPemasukan}
            className="w-full h-full object-cover"
          />
        );
      } else {
        previewNode = (
          <span className="font-bold text-xl select-none">
            {selectedPos.iconLetter || selectedPos.namaPosPemasukan.charAt(0).toUpperCase()}
          </span>
        );
      }
    } else {
      const Icon = POS_PEMASUKAN_ICONS[selectedIconType]?.icon;
      previewNode = Icon ? <Icon className="w-6 h-6 stroke-[2]" /> : null;
    }
  } else if (activeTab === 'customImage' && logoUrl) {
    previewNode = (
      <img
        src={logoUrl}
        alt="Preview"
        className="w-full h-full object-cover"
      />
    );
  } else {
    const Icon = POS_PEMASUKAN_ICONS[selectedIconType]?.icon;
    previewNode = Icon ? <Icon className="w-6 h-6 stroke-[2]" /> : null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Ubah Logo Pos Pemasukan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuaikan logo pada kartu stat "Pos Pemasukan"
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Card Preview Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Pratinjau Kartu:</span>
              <span className="text-xs text-slate-500 font-medium tracking-tight mt-1">
                Pos Pemasukan
              </span>
              <span className="text-lg font-bold text-slate-800 tracking-tight">
                {groups.length} buah
              </span>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 overflow-hidden"
              style={{ backgroundColor: previewBg }}
            >
              {previewNode}
            </div>
          </div>

          {/* Source Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Sumber Logo
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('posPemasukan')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'posPemasukan'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sesuai Pos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('icon')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'icon'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pilih Ikon
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('customImage')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'customImage'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gambar / URL
              </button>
            </div>
          </div>

          {/* Tab 1: Sesuai Pos Pemasukan yang Ditampilkan */}
          {activeTab === 'posPemasukan' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Pilih Pos Pemasukan untuk Ditampilkan:
              </label>
              {groups.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada Pos Pemasukan. Silakan tambah Pos Pemasukan terlebih dahulu.
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => {
                    const isSelected = selectedPosId === group.id;
                    return (
                      <div
                        key={group.id}
                        onClick={() => {
                          setSelectedPosId(group.id);
                          setBgColor(group.iconBg || '#2D3748');
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#008d91] bg-teal-50/40 ring-1 ring-[#008d91]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0 overflow-hidden"
                          style={{ backgroundColor: group.iconBg || '#2D3748' }}
                        >
                          {group.logoUrl ? (
                            <img
                              src={group.logoUrl}
                              alt={group.namaPosPemasukan}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            group.iconLetter || group.namaPosPemasukan.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {group.namaPosPemasukan}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {group.subTitle || 'Pos Pemasukan'} ({group.allocations.length} alokasi)
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Pilih Ikon Standar */}
          {activeTab === 'icon' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Pilih Ikon:
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {Object.entries(POS_PEMASUKAN_ICONS).map(([key, item]) => {
                  const Icon = item.icon;
                  const isSelected = selectedIconType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedIconType(key)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#008d91] bg-teal-50 text-[#008d91] ring-1 ring-[#008d91]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[1.8] mb-1" />
                      <span className="text-[10px] font-medium text-center truncate w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Gambar / URL */}
          {activeTab === 'customImage' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  URL Gambar Logo
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://contoh.com/logo-pos.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Atau Unggah Berkas Gambar
                </label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-[#008d91] hover:bg-teal-50/30 rounded-xl p-3.5 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">
                    Pilih gambar dari komputer...
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Warna Latar (Available for icon & custom image, or custom override) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Warna Latar Logo
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBgColor(color)}
                  className="w-7 h-7 rounded-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-2xs"
                  style={{ backgroundColor: color }}
                >
                  {bgColor.toLowerCase() === color.toLowerCase() && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#008d91] hover:bg-[#007b7e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Simpan Logo
          </button>
        </div>
      </div>
    </div>
  );
};
