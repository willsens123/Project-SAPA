import React, { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import {
  PosKeuanganItem,
  PosKeuanganCardLogoConfig,
} from '../posKeuanganData';
import { POS_KEUANGAN_ICONS } from './PosKeuanganStatCard';

interface UbahLogoPosKeuanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PosKeuanganItem[];
  currentConfig?: PosKeuanganCardLogoConfig;
  onSave: (config: PosKeuanganCardLogoConfig) => void;
}

const COLOR_PALETTE = [
  '#008d91', // Teal (default brand)
  '#2D3748', // Slate dark
  '#CF5340', // Coral red
  '#B0B5B9', // Silver gray
  '#3182CE', // Blue
  '#805AD5', // Purple
  '#38A169', // Green
  '#DD6B20', // Orange
];

export const UbahLogoPosKeuanganModal: React.FC<UbahLogoPosKeuanganModalProps> = ({
  isOpen,
  onClose,
  items,
  currentConfig,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'posKeuangan' | 'icon' | 'customImage'>('posKeuangan');
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [selectedIconType, setSelectedIconType] = useState<string>('wallet');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('#2D3748');

  useEffect(() => {
    if (isOpen) {
      const mode = currentConfig?.mode || 'posKeuangan';
      setActiveTab(mode);
      setSelectedPosId(
        currentConfig?.posKeuanganId || (items.length > 0 ? items[0].id : '')
      );
      setSelectedIconType(currentConfig?.iconType || 'wallet');
      setLogoUrl(currentConfig?.logoUrl || '');
      setBgColor(currentConfig?.bgColor || '#2D3748');
    }
  }, [isOpen, currentConfig, items]);

  if (!isOpen) return null;

  const selectedItem = items.find((it) => it.id === selectedPosId) || items[0];

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
    const newConfig: PosKeuanganCardLogoConfig = {
      mode: activeTab,
      posKeuanganId: activeTab === 'posKeuangan' ? selectedPosId || (items[0]?.id) : undefined,
      iconType: selectedIconType,
      logoUrl: activeTab === 'customImage' ? logoUrl.trim() : undefined,
      bgColor:
        activeTab === 'posKeuangan' && selectedItem
          ? selectedItem.iconBg || bgColor
          : bgColor,
    };
    onSave(newConfig);
    onClose();
  };

  // Compute preview
  let previewBg = bgColor;
  let previewNode: React.ReactNode = null;

  if (activeTab === 'posKeuangan') {
    if (selectedItem) {
      previewBg = selectedItem.iconBg || '#2D3748';
      if (selectedItem.logoUrl) {
        previewNode = (
          <img
            src={selectedItem.logoUrl}
            alt={selectedItem.namaPos}
            className="w-full h-full object-cover"
          />
        );
      } else {
        previewNode = (
          <span className="font-bold text-xl select-none">
            {selectedItem.iconLetter || selectedItem.namaPos.charAt(0).toUpperCase()}
          </span>
        );
      }
    } else {
      const Icon = POS_KEUANGAN_ICONS[selectedIconType]?.icon;
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
    const Icon = POS_KEUANGAN_ICONS[selectedIconType]?.icon;
    previewNode = Icon ? <Icon className="w-6 h-6 stroke-[2]" /> : null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Ubah Logo Pos Keuangan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuaikan logo pada kartu stat "Pos Keuangan"
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
                Pos Keuangan
              </span>
              <span className="text-lg font-bold text-slate-800 tracking-tight">
                {items.length} buah
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
                onClick={() => setActiveTab('posKeuangan')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                  activeTab === 'posKeuangan'
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

          {/* Tab 1: Sesuai Pos Keuangan yang Ditampilkan */}
          {activeTab === 'posKeuangan' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Pilih Pos Keuangan untuk Ditampilkan:
              </label>
              {items.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada Pos Keuangan. Silakan tambah Pos Keuangan terlebih dahulu.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it) => {
                    const isSelected = selectedPosId === it.id;
                    return (
                      <div
                        key={it.id}
                        onClick={() => {
                          setSelectedPosId(it.id);
                          setBgColor(it.iconBg || '#2D3748');
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#008d91] bg-teal-50/40 ring-1 ring-[#008d91]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0 overflow-hidden"
                          style={{ backgroundColor: it.iconBg || '#2D3748' }}
                        >
                          {it.logoUrl ? (
                            <img
                              src={it.logoUrl}
                              alt={it.namaPos}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            it.iconLetter || it.namaPos.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {it.namaPos}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {it.subTitle || 'Pos YPPLN'}
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
                {Object.entries(POS_KEUANGAN_ICONS).map(([key, iconObj]) => {
                  const Icon = iconObj.icon;
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
                        {iconObj.label}
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

          {/* Warna Latar */}
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
