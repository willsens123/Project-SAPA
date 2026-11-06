import React, { useState, useRef } from 'react';
import { X, Check, Upload, RotateCcw, Sparkles } from 'lucide-react';
import { AAjakSSalurLogo } from './AAjakSSalurLogo';
import { PersonWithSSebarBoxIcon } from './PersonWithSSebarBoxIcon';

interface ModalUbahLogoAAjakSalurProps {
  isOpen: boolean;
  onClose: () => void;
  currentVariant: 'basket' | 'box' | 'badge';
  customLogoUrl: string | null;
  onSaveLogo: (variant: 'basket' | 'box' | 'badge', customUrl: string | null) => void;
  onShowToast?: (msg: string) => void;
}

export const ModalUbahLogoAAjakSalur: React.FC<ModalUbahLogoAAjakSalurProps> = ({
  isOpen,
  onClose,
  currentVariant,
  customLogoUrl,
  onSaveLogo,
  onShowToast,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<'basket' | 'box' | 'badge'>(currentVariant);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(customLogoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (onShowToast) onShowToast('Ukuran file maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedUrl(result);
        if (onShowToast) onShowToast('Logo kustom berhasil diunggah');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveLogo(selectedVariant, uploadedUrl);
    if (onShowToast) onShowToast('Logo A-AJAK S-SALUR berhasil disimpan!');
    onClose();
  };

  const handleReset = () => {
    setSelectedVariant('basket');
    setUploadedUrl(null);
    if (onShowToast) onShowToast('Logo direset ke Logo Standar A-AJAK S-SALUR');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#008d91]/10 flex items-center justify-center text-[#008d91]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Ubah Logo A-AJAK S-SALUR</h3>
              <p className="text-xs text-slate-500">Pilih atau unggah logo kartu statistik</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active Preview */}
          <div className="flex flex-col items-center justify-center p-5 bg-teal-50/50 border border-teal-100 rounded-2xl">
            <span className="text-xs text-teal-700 font-medium mb-3">Pratinjau Logo Aktif:</span>
            <div className="w-16 h-16 rounded-2xl bg-[#008d91] flex items-center justify-center text-white shadow-md">
              <AAjakSSalurLogo
                className="w-8 h-8 text-white"
                variant={selectedVariant}
                customUrl={uploadedUrl}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2.5">
              {uploadedUrl
                ? 'Logo Kustom (Unggahan)'
                : selectedVariant === 'basket'
                ? 'Logo A-AJAK S-SALUR (Keranjang)'
                : 'Logo A-AJAK S-SALUR (Box)'}
            </span>
          </div>

          {/* Preset Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
              Pilihan Preset Logo
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Preset 1: Keranjang (Default) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedVariant('basket');
                  setUploadedUrl(null);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  !uploadedUrl && selectedVariant === 'basket'
                    ? 'border-[#008d91] bg-teal-50/30 ring-2 ring-[#008d91]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0">
                  <AAjakSSalurLogo className="w-5 h-5 text-white" variant="basket" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 leading-tight">A-AJAK Keranjang</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Logo S-Salur</div>
                </div>
              </button>

              {/* Preset 2: Box Package */}
              <button
                type="button"
                onClick={() => {
                  setSelectedVariant('box');
                  setUploadedUrl(null);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  !uploadedUrl && selectedVariant === 'box'
                    ? 'border-[#008d91] bg-teal-50/30 ring-2 ring-[#008d91]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#008d91] flex items-center justify-center text-white shrink-0">
                  <AAjakSSalurLogo className="w-5 h-5 text-white" variant="box" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 leading-tight">A-AJAK Kotak S</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Box Item Salur</div>
                </div>
              </button>
            </div>
          </div>

          {/* Upload Custom File */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Atau Unggah Logo Kustom
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#008d91] text-xs font-medium text-slate-600 hover:text-[#008d91] bg-slate-50 hover:bg-teal-50/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Gambar dari Perangkat</span>
              </button>
              {uploadedUrl && (
                <button
                  type="button"
                  onClick={() => setUploadedUrl(null)}
                  className="px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 font-medium transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Mendukung format PNG, JPG, SVG maks 2MB.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>
          <div className="flex items-center gap-2">
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
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#007b7f] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
