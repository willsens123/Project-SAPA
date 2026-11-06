import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, Image as ImageIcon } from 'lucide-react';
import {
  PosPengeluaranGroup,
  PosPengeluaranCardLogoConfig,
  getPosPengeluaranFromStorage,
} from '../posPengeluaranData';
import { POS_PENGELUARAN_ICONS } from './PosPengeluaranStatCard';

interface UbahLogoPosPengeluaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PosPengeluaranCardLogoConfig) => void;
  currentConfig?: PosPengeluaranCardLogoConfig;
  groups?: PosPengeluaranGroup[];
}

const PRESET_COLORS = [
  '#2D3748',
  '#CF5340',
  '#B0B5B9',
  '#008d91',
  '#3182CE',
  '#805AD5',
  '#38A169',
  '#DD6B20',
];

export const UbahLogoPosPengeluaranModal: React.FC<UbahLogoPosPengeluaranModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  groups: propGroups,
}) => {
  const groups =
    propGroups && propGroups.length > 0 ? propGroups : getPosPengeluaranFromStorage();

  const [activeTab, setActiveTab] = useState<'posPengeluaran' | 'icon' | 'customImage'>('posPengeluaran');
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('receipt');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('#2D3748');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const mode = currentConfig?.mode || 'posPengeluaran';
      setActiveTab(mode);
      setSelectedPosId(
        currentConfig?.posPengeluaranId || (groups.length > 0 ? groups[0].id : '')
      );
      setSelectedIcon(currentConfig?.iconType || 'receipt');
      setCustomImageUrl(currentConfig?.logoUrl || '');
      setBgColor(currentConfig?.bgColor || '#2D3748');
    }
  }, [isOpen, currentConfig, groups]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (PNG, JPG, SVG, dll).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImageUrl(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    const selectedPos = groups.find((g) => g.id === selectedPosId) || groups[0];

    const config: PosPengeluaranCardLogoConfig = {
      mode: activeTab,
      posPengeluaranId: activeTab === 'posPengeluaran' ? selectedPosId || (groups[0]?.id) : undefined,
      iconType: activeTab === 'icon' ? selectedIcon : undefined,
      logoUrl: activeTab === 'customImage' ? customImageUrl : undefined,
      bgColor:
        activeTab === 'posPengeluaran' && selectedPos
          ? selectedPos.iconBg || '#2D3748'
          : bgColor,
    };

    onSave(config);
    onClose();
  };

  const selectedPos = groups.find((g) => g.id === selectedPosId) || groups[0];
  let previewBg = bgColor;
  let previewContent: React.ReactNode = null;

  if (activeTab === 'posPengeluaran') {
    previewBg = selectedPos?.iconBg || '#2D3748';
    if (selectedPos?.logoUrl) {
      previewContent = (
        <img
          src={selectedPos.logoUrl}
          alt={selectedPos.namaPosPengeluaran}
          className="w-full h-full object-cover"
        />
      );
    } else {
      previewContent = (
        <span className="font-bold text-2xl text-white">
          {selectedPos?.iconLetter || selectedPos?.namaPosPengeluaran?.charAt(0).toUpperCase() || 'P'}
        </span>
      );
    }
  } else if (activeTab === 'customImage') {
    previewBg = bgColor;
    if (customImageUrl) {
      previewContent = (
        <img
          src={customImageUrl}
          alt="Preview Custom"
          className="w-full h-full object-cover"
        />
      );
    } else {
      previewContent = <ImageIcon className="w-8 h-8 text-white/80" />;
    }
  } else {
    previewBg = bgColor;
    const IconComp = POS_PENGELUARAN_ICONS[selectedIcon]?.icon || POS_PENGELUARAN_ICONS.receipt.icon;
    previewContent = <IconComp className="w-8 h-8 text-white" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Ubah Logo Pos Pengeluaran
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Preview Logo
            </p>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md overflow-hidden transition-all"
              style={{ backgroundColor: previewBg }}
            >
              {previewContent}
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('posPengeluaran')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'posPengeluaran'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ikuti Pos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('icon')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'icon'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pilih Ikon
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customImage')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'customImage'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Gambar
            </button>
          </div>

          {activeTab === 'posPengeluaran' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Pos Pengeluaran yang Diikuti:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {groups.map((g) => {
                  const isSelected = selectedPosId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedPosId(g.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#008d91] bg-teal-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                          style={{ backgroundColor: g.iconBg || '#2D3748' }}
                        >
                          {g.logoUrl ? (
                            <img src={g.logoUrl} alt={g.namaPosPengeluaran} className="w-full h-full object-cover" />
                          ) : (
                            g.iconLetter || g.namaPosPengeluaran.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {g.namaPosPengeluaran}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {g.allocations.length} Alokasi
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#008d91]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'icon' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Ikon:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(POS_PENGELUARAN_ICONS).map(([key, item]) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIcon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedIcon(key)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#008d91] bg-teal-50 text-[#008d91]'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <IconComp className="w-5 h-5 mb-1" />
                        <span className="text-[10px] truncate max-w-full">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Warna Background:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBgColor(c)}
                      className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        bgColor === c
                          ? 'border-slate-900 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {bgColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customImage' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Upload Gambar Logo:
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-[#008d91] rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-[#008d91] transition-all cursor-pointer bg-slate-50/50 hover:bg-teal-50/20"
                >
                  <Upload className="w-6 h-6 mb-1.5" />
                  <span className="text-xs font-semibold">Pilih File Gambar</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG max 2MB</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Warna Background:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBgColor(c)}
                      className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        bgColor === c
                          ? 'border-slate-900 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {bgColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Simpan Logo
          </button>
        </div>
      </div>
    </div>
  );
};
