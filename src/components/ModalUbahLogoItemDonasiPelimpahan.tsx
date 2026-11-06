import React, { useState } from 'react';
import {
  X,
  Check,
  ShoppingCart,
  Globe,
  BookOpen,
  Pill,
  Sparkles,
  Package,
  Gift,
  Heart,
  Award,
  FileText,
  CheckCircle,
  Users,
  Sun,
  Shield,
  Layers,
  Image as ImageIcon,
  LucideIcon,
} from 'lucide-react';
import { CarouselStatCard } from '../reportPelimpahanJasaData';

export const PELIMPAHAN_LOGO_ICONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'cart', label: 'Keranjang Belanja', icon: ShoppingCart },
  { id: 'globe', label: 'Globe / Web', icon: Globe },
  { id: 'book', label: 'Buku Dharma', icon: BookOpen },
  { id: 'pill', label: 'Vitamin / Obat', icon: Pill },
  { id: 'sparkles', label: 'Jubah / Berkah', icon: Sparkles },
  { id: 'package', label: 'Paket Terundang', icon: Package },
  { id: 'gift', label: 'Hadiah / Souvenir', icon: Gift },
  { id: 'heart', label: 'Kebajikan / Donasi', icon: Heart },
  { id: 'award', label: 'Pemberkahan Resmi', icon: Award },
  { id: 'file', label: 'Dokumen / Laporan', icon: FileText },
  { id: 'check', label: 'Selesai / Terverifikasi', icon: CheckCircle },
  { id: 'users', label: 'Umat / Komunitas', icon: Users },
  { id: 'sun', label: 'Penerangan / Pelita', icon: Sun },
  { id: 'shield', label: 'Perlindungan', icon: Shield },
  { id: 'layers', label: 'Kategori / Kumpulan', icon: Layers },
];

export const PELIMPAHAN_BG_COLORS = [
  { id: 'tosca', value: '#008d91', label: 'Tosca Utama' },
  { id: 'dark-teal', value: '#0F766E', label: 'Teal Gelap' },
  { id: 'coral', value: '#E05D44', label: 'Coral Kathina' },
  { id: 'amber', value: '#F59E0B', label: 'Amber Patron' },
  { id: 'slate', value: '#334155', label: 'Slate Gelap' },
  { id: 'indigo', value: '#4F46E5', label: 'Indigo Modern' },
  { id: 'rose', value: '#E11D48', label: 'Rose Cerah' },
  { id: 'emerald', value: '#059669', label: 'Emerald Hijau' },
];

interface ModalUbahLogoItemDonasiPelimpahanProps {
  isOpen: boolean;
  card: CarouselStatCard | null;
  onClose: () => void;
  onSave: (updatedCard: CarouselStatCard) => void;
}

export const ModalUbahLogoItemDonasiPelimpahan: React.FC<ModalUbahLogoItemDonasiPelimpahanProps> = ({
  isOpen,
  card,
  onClose,
  onSave,
}) => {
  if (!isOpen || !card) return null;

  const [selectedIcon, setSelectedIcon] = useState<string>(card.iconType || 'globe');
  const [selectedBg, setSelectedBg] = useState<string>(card.iconBg || '#008d91');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(card.logoUrl || '');
  const [title, setTitle] = useState<string>(card.title);
  const [satuan, setSatuan] = useState<string>(card.satuan || 'buah');
  const [downloadedCount, setDownloadedCount] = useState<number>(card.jumlahDownloaded);
  const [belumDownloadCount, setBelumDownloadCount] = useState<number>(card.jumlahBelumDownload);
  const [activeTab, setActiveTab] = useState<'icon' | 'data'>('icon');

  const handleSave = () => {
    onSave({
      ...card,
      title: title.trim() || card.title,
      iconType: selectedIcon,
      iconBg: selectedBg,
      logoUrl: customLogoUrl.trim() || undefined,
      satuan: satuan.trim() || 'buah',
      jumlahDownloaded: Math.max(0, downloadedCount),
      jumlahBelumDownload: Math.max(0, belumDownloadCount),
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentIconObj = PELIMPAHAN_LOGO_ICONS.find((i) => i.id === selectedIcon);
  const IconComp = currentIconObj ? currentIconObj.icon : Globe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Ubah Logo & Data Item
            </h3>
            <p className="text-xs text-slate-400">
              {card.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Live Preview Tampilan Kartu
          </span>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-2.5 flex items-center justify-between min-w-[210px] w-full max-w-xs">
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-slate-400 font-normal truncate max-w-[140px]">
                {title || 'Nama Item'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold text-slate-800">
                  {downloadedCount.toLocaleString('id-ID')} {satuan}
                </span>
                {belumDownloadCount > 0 && (
                  <span className="text-xs font-semibold text-[#008d91]">
                    + {belumDownloadCount.toLocaleString('id-ID')} {satuan}
                  </span>
                )}
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ml-3 shadow-2xs overflow-hidden"
              style={{ backgroundColor: selectedBg }}
            >
              {customLogoUrl ? (
                <img
                  src={customLogoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <IconComp className="w-4 h-4 stroke-[2]" />
              )}
            </div>
          </div>
          {belumDownloadCount === 0 && (
            <span className="text-[11px] text-emerald-600 font-medium">
              ✓ Semua nama sudah di-download (tanda "+" disembunyikan otomatis)
            </span>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('icon')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'icon'
                ? 'border-[#008d91] text-[#008d91]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Pilihan Logo & Warna
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'data'
                ? 'border-[#008d91] text-[#008d91]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Data & Jumlah Real
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {activeTab === 'icon' ? (
            <>
              {/* Logo Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Ikon Resmi Item D-DONASI
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PELIMPAHAN_LOGO_ICONS.map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = selectedIcon === item.id && !customLogoUrl;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(item.id);
                          setCustomLogoUrl('');
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#008d91] bg-teal-50/70 text-[#008d91] font-semibold ring-2 ring-[#008d91]/20'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title={item.label}
                      >
                        <ItemIcon className="w-4 h-4 stroke-[2]" />
                        <span className="text-[10px] truncate max-w-full text-center">
                          {item.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Warna Latar Logo
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PELIMPAHAN_BG_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedBg(c.value)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        selectedBg === c.value
                          ? 'ring-2 ring-offset-2 ring-slate-400 scale-105'
                          : 'hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {selectedBg === c.value && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image / Upload */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Atau Gunakan Logo Gambar / Foto
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="Masukkan URL logo gambar..."
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#008d91]"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium cursor-pointer transition-colors shrink-0 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomLogoUrl('')}
                    className="text-[11px] text-red-500 hover:underline mt-1 cursor-pointer block"
                  >
                    Hapus gambar kustom (kembali ke ikon)
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Nama Item D-DONASI */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Item D-DONASI (Tulisan Atas)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Paket yang terundang"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Satuan Item */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  placeholder="paket / buku / buah / nama"
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Jumlah yang sudah di-download */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah yang Sudah Di-download
                </label>
                <input
                  type="number"
                  min="0"
                  value={downloadedCount}
                  onChange={(e) => setDownloadedCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Jumlah yang belum di-download */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Jumlah yang Belum Di-download
                  </label>
                  <span className="text-[11px] text-slate-400">
                    (Jika 0, tanda "+" otomatis dihilangkan)
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={belumDownloadCount}
                  onChange={(e) => setBelumDownloadCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#008d91]"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setBelumDownloadCount(0)}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
                  >
                    Set 0 (Sudah Di-download Semua)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBelumDownloadCount(150)}
                    className="text-[11px] px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#008d91] rounded-lg cursor-pointer transition-colors"
                  >
                    + 150 {satuan}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
