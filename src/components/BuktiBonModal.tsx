import React, { useState, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Link2, 
  Unlink, 
  Search,
  ExternalLink,
  Receipt,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { PengeluaranItem, MutasiItem } from '../types';
import { getPresetReceipt } from '../utils/receiptGenerator';

interface BuktiBonModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PengeluaranItem | null;
  mutasiList?: MutasiItem[];
  onSaveItem: (updatedItem: PengeluaranItem) => void;
  onShowToast?: (message: string) => void;
  onNavigateToMutasi?: () => void;
}

export const BuktiBonModal: React.FC<BuktiBonModalProps> = ({
  isOpen,
  onClose,
  item,
  mutasiList = [],
  onSaveItem,
  onShowToast,
  onNavigateToMutasi,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isLinkingMutasi, setIsLinkingMutasi] = useState<boolean>(false);
  const [mutasiSearchQuery, setMutasiSearchQuery] = useState<string>('');
  const [selectedMutasiId, setSelectedMutasiId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !item) return null;

  // Compute receipt URL: use existing or fallback to realistic preset
  const receiptUrl =
    item.buktiBonUrl ||
    getPresetReceipt(item.no, item.keterangan, item.nominal, item.tanggal, item.dikeluarkan);

  const isLinked = Boolean(item.mutasiId || item.mutasiKode);
  const hasBuktiBon = Boolean(item.buktiBonUrl || item.noBadgeColor !== 'plain');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updatedItem: PengeluaranItem = {
        ...item,
        buktiBonUrl: dataUrl,
        buktiBonFileName: file.name,
        buktiBonUploadedAt: new Date().toISOString(),
        noBadgeColor: isLinked ? 'teal' : 'red',
      };
      onSaveItem(updatedItem);
      if (onShowToast) {
        onShowToast(`Gambar bukti bon No. ${item.no} berhasil diupload`);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Remove receipt handler
  const handleRemoveReceipt = () => {
    const updatedItem: PengeluaranItem = {
      ...item,
      buktiBonUrl: '',
      buktiBonFileName: undefined,
      buktiBonUploadedAt: undefined,
      noBadgeColor: 'plain', // Belum di upload bukti bon -> tidak ada buletan
    };
    onSaveItem(updatedItem);
    if (onShowToast) {
      onShowToast(`Bukti bon No. ${item.no} berhasil dihapus. Status berubah jadi tanpa buletan.`);
    }
    onClose();
  };

  // Link to a specific mutasi item
  const handleLinkMutasi = (mutasi: MutasiItem) => {
    const updatedItem: PengeluaranItem = {
      ...item,
      mutasiId: mutasi.id,
      mutasiKode: `${mutasi.bankAccount} - ${mutasi.date}`,
      mutasiKeterangan: mutasi.keteranganBank,
      mutasiDate: mutasi.date,
      mutasiAmount: mutasi.amount,
      noBadgeColor: 'teal', // Sekarang sudah upload bukti bon DAN sudah link mutasi -> Tosca!
    };
    onSaveItem(updatedItem);
    setIsLinkingMutasi(false);
    if (onShowToast) {
      onShowToast(`Berhasil menghubungkan Pengeluaran No. ${item.no} ke Mutasi! Status kini Buletan Tosca.`);
    }
  };

  // Unlink mutasi
  const handleUnlinkMutasi = () => {
    const updatedItem: PengeluaranItem = {
      ...item,
      mutasiId: undefined,
      mutasiKode: undefined,
      mutasiKeterangan: undefined,
      mutasiDate: undefined,
      mutasiAmount: undefined,
      noBadgeColor: 'red', // Ada bukti bon tapi belum link mutasi -> Merah!
    };
    onSaveItem(updatedItem);
    if (onShowToast) {
      onShowToast(`Koneksi mutasi diputuskan. Status No. ${item.no} kini Buletan Merah (belum link mutasi).`);
    }
  };

  // Find linked mutasi item if present
  const linkedMutasi = mutasiList.find((m) => m.id === item.mutasiId) || (item.mutasiKeterangan ? {
    id: item.mutasiId || 'custom',
    bankAccount: item.mutasiKode?.split(' - ')[0] || 'BCA 888',
    date: item.mutasiDate || item.tanggal,
    keteranganBank: item.mutasiKeterangan,
    branch: '0',
    amount: item.mutasiAmount || item.nominal,
    type: 'CR' as const,
    balance: 0,
  } : null);

  // Filtered mutasi items for search
  const filteredMutasiList = mutasiList.filter((m) => {
    if (!mutasiSearchQuery.trim()) return true;
    const q = mutasiSearchQuery.toLowerCase();
    return (
      m.bankAccount.toLowerCase().includes(q) ||
      m.keteranganBank.toLowerCase().includes(q) ||
      m.date.toLowerCase().includes(q) ||
      m.amount.toString().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs ${
              item.noBadgeColor === 'teal' 
                ? 'bg-[#008d91]' 
                : item.noBadgeColor === 'red' 
                ? 'bg-[#f04e4e]' 
                : 'bg-slate-500'
            }`}>
              {item.no}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Bukti Bon Pengeluaran #{item.no}
                </h3>
                {item.noBadgeColor === 'teal' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#008d91] border border-teal-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008d91]" />
                    Buletan Tosca (Linked Mutasi)
                  </span>
                ) : item.noBadgeColor === 'red' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#f04e4e] border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f04e4e]" />
                    Buletan Merah (Belum Link Mutasi)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Tanpa Buletan (Belum Upload Bon)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {item.keterangan} • <span className="font-semibold text-slate-700">{formatCurrency(item.nominal)}</span> • {item.tanggal} • Dikeluarkan: {item.dikeluarkan}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className={`px-5 sm:px-6 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
          item.noBadgeColor === 'teal'
            ? 'bg-teal-50/70 border-teal-100 text-teal-900'
            : item.noBadgeColor === 'red'
            ? 'bg-rose-50/70 border-rose-100 text-rose-900'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            {item.noBadgeColor === 'teal' ? (
              <CheckCircle2 className="w-4 h-4 text-[#008d91] shrink-0" />
            ) : item.noBadgeColor === 'red' ? (
              <AlertCircle className="w-4 h-4 text-[#f04e4e] shrink-0" />
            ) : (
              <Receipt className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <div>
              {item.noBadgeColor === 'teal' ? (
                <span>
                  <strong>Buletan Tosca:</strong> Gambar bukti bon sudah di-upload dan <span className="underline font-semibold">sudah di-link ke mutasi bank</span>.
                </span>
              ) : item.noBadgeColor === 'red' ? (
                <span>
                  <strong>Buletan Merah:</strong> Gambar bukti bon sudah di-upload, tapi <span className="underline font-semibold text-red-700">belum di-link ke mutasi</span>.
                </span>
              ) : (
                <span>
                  <strong>Tanpa Buletan:</strong> Belum di-upload gambar bukti bon.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.noBadgeColor === 'red' && (
              <button
                type="button"
                onClick={() => setIsLinkingMutasi(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#008d91] hover:bg-[#00767a] text-white rounded-lg font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link ke Mutasi Sekarang</span>
              </button>
            )}

            {item.noBadgeColor === 'teal' && (
              <button
                type="button"
                onClick={handleUnlinkMutasi}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                title="Putuskan sambungan ke mutasi"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Putuskan Mutasi</span>
              </button>
            )}
          </div>
        </div>

        {/* Mutasi Information / Linking Section */}
        {linkedMutasi && item.noBadgeColor === 'teal' && !isLinkingMutasi && (
          <div className="px-5 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-[#008d91]" />
                Terkoneksi ke Mutasi:
              </span>
              <span className="px-2 py-0.5 bg-slate-200/80 rounded-md font-medium text-slate-800">
                {linkedMutasi.bankAccount} ({linkedMutasi.date})
              </span>
              <span className="font-semibold text-emerald-700">
                Rp {linkedMutasi.amount.toLocaleString('id-ID')}
              </span>
              <span className="text-slate-500 italic max-w-sm truncate hidden md:inline" title={linkedMutasi.keteranganBank}>
                "{linkedMutasi.keteranganBank}"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLinkingMutasi(true)}
                className="text-xs text-[#008d91] hover:underline font-medium cursor-pointer"
              >
                Ubah Mutasi
              </button>
              {onNavigateToMutasi && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToMutasi();
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka Menu Mutasi
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Inline Mutasi Selector (when user clicks 'Link ke Mutasi') */}
        {isLinkingMutasi && (
          <div className="px-5 sm:px-6 py-3.5 bg-amber-50/70 border-b border-amber-200/70 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-[#008d91]" />
                Pilih Transaksi Mutasi Bank untuk Dihubungkan ke Pengeluaran No. {item.no}
              </span>
              <button
                type="button"
                onClick={() => setIsLinkingMutasi(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mutasi search bar */}
            <div className="flex items-center gap-2 mb-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={mutasiSearchQuery}
                onChange={(e) => setMutasiSearchQuery(e.target.value)}
                placeholder="Cari transaksi mutasi berdasarkan rekening, nominal, atau keterangan..."
                className="w-full text-xs text-slate-700 outline-none"
              />
              {mutasiSearchQuery && (
                <button type="button" onClick={() => setMutasiSearchQuery('')}>
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            {/* List of Mutasi items */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {filteredMutasiList.length === 0 ? (
                <div className="py-4 text-center text-slate-400 bg-white rounded-xl border border-slate-100">
                  Tidak ditemukan mutasi yang sesuai.
                </div>
              ) : (
                filteredMutasiList.map((m) => {
                  const isCurrent = item.mutasiId === m.id;
                  const isMatchNominal = Math.abs(m.amount - item.nominal) < 1;
                  return (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'border-[#008d91] bg-teal-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                      onClick={() => handleLinkMutasi(m)}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{m.bankAccount}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{m.date}</span>
                          {isMatchNominal && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Nominal Cocok
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">
                              Terkoneksi Sekarang
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate max-w-xl" title={m.keteranganBank}>
                          {m.keteranganBank}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-800">
                          Rp {m.amount.toLocaleString('id-ID')}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-[#008d91] text-white text-[11px] font-medium hover:bg-[#007478]"
                        >
                          Pilih
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Receipt Image Area */}
        <div className="flex-1 bg-slate-900/5 relative overflow-hidden flex items-center justify-center p-4 min-h-[360px] max-h-[550px]">
          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-xl p-1 shadow-md text-slate-700">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Perbesar (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Putar 90 Derajat"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs font-semibold px-2"
              title="Reset Tampilan"
            >
              Reset
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5" />
            <a
              href={receiptUrl}
              download={`bukti-bon-${item.no}.png`}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Unduh Bukti Bon"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>

          {/* Interactive Image Container with Zoom & Rotation */}
          <div 
            className="w-full h-full flex items-center justify-center overflow-auto p-4 transition-transform duration-200 ease-out select-none"
          >
            <div
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
              }}
              className="max-w-[420px] max-h-full flex items-center justify-center"
            >
              <img
                src={receiptUrl}
                alt={`Bukti Bon No. ${item.no}`}
                className="max-h-[460px] object-contain rounded-lg shadow-xl border border-slate-200/80 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Hidden real file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti / Upload Bukti Bon Baru</span>
            </button>

            {item.buktiBonUrl && (
              <button
                type="button"
                onClick={handleRemoveReceipt}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Bon</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
