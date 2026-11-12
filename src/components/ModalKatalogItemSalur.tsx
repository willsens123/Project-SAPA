import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Tag,
  BookMarked,
  FileText,
  Calendar,
  Building2,
  User,
  Info,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { SalurProduct } from '../salurData';
import { BookCover } from './BookCover';

interface ModalKatalogItemSalurProps {
  isOpen: boolean;
  onClose: () => void;
  items: SalurProduct[];
  onShowToast?: (msg: string) => void;
}

export const ModalKatalogItemSalur: React.FC<ModalKatalogItemSalurProps> = ({
  isOpen,
  onClose,
  items,
  onShowToast = (_msg: string) => {},
}) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const catalogContentRef = useRef<HTMLDivElement>(null);
  const currentCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[activePageIndex] || items[0];

  // Helper to format currency
  const formatRupiah = (num: number) => {
    if (!num || num === 0) return 'Non-Berbayar / Sukarela';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  // 1. Download as High-Res Image (PNG) via html2canvas
  const handleDownloadImage = async () => {
    const targetElement = viewMode === 'single' ? currentCardRef.current : catalogContentRef.current;
    if (!targetElement) return;

    try {
      setIsProcessing(true);
      onShowToast('Sedang memproses unduhan katalog...');

      // Small delay to allow any pending layout reflow
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(targetElement, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeTitle = (items.length === 1 ? currentItem.title : `Katalog-Koleksi-${items.length}-Item`)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 40);
      link.href = image;
      link.download = `Katalog-YPPLN-${safeTitle}.png`;
      link.click();

      onShowToast('Katalog berhasil diunduh sebagai gambar!');
    } catch (err) {
      console.error('Download katalog image error:', err);
      onShowToast('Gagal mengunduh katalog. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Download / Print to PDF
  const handlePrintPdf = () => {
    window.print();
    onShowToast('Membuka dialog cetak / Simpan PDF...');
  };

  // 3. Copy Image to Clipboard
  const handleCopyImage = async () => {
    const targetElement = viewMode === 'single' ? currentCardRef.current : catalogContentRef.current;
    if (!targetElement) return;

    try {
      setIsProcessing(true);
      onShowToast('Menyiapkan gambar katalog ke clipboard...');

      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          onShowToast('Gagal menyiapkan gambar');
          setIsProcessing(false);
          return;
        }

        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
              }),
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2500);
            onShowToast('Gambar katalog berhasil disalin!');
          } else {
            throw new Error('Clipboard API not available');
          }
        } catch (clipboardErr) {
          console.warn('Clipboard direct copy error, falling back to download:', clipboardErr);
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `Katalog-YPPLN-${currentItem.title.replace(/\s+/g, '_')}.png`;
          link.click();
          onShowToast('Gambar disimpan ke perangkat.');
        } finally {
          setIsProcessing(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy image error:', err);
      onShowToast('Gagal menyalin gambar katalog.');
      setIsProcessing(false);
    }
  };

  // 4. Copy WhatsApp Broadcast Text
  const handleCopyText = () => {
    const textLines: string[] = [];
    textLines.push(`📚 *KATALOG RESMI PENERBITAN LAMRIMNESIA*`);
    textLines.push(`_Yayasan Pelestarian dan Pengembangan Lamrim Nusantara_\n`);

    const targetList = viewMode === 'single' ? [currentItem] : items;

    targetList.forEach((it, idx) => {
      textLines.push(`*${idx + 1}. ${it.title.toUpperCase()}*`);
      if (it.subtitle) textLines.push(`_${it.subtitle}_`);
      textLines.push(`• *Penulis:* ${it.author || it.detailedInfo?.author || 'Tim Penerbit YPPLN'}`);
      textLines.push(`• *Penerbit:* ${it.publisher || it.detailedInfo?.publisher || 'Penerbit Kadam Choeling / YPPLN'}`);
      textLines.push(`• *Harga:* ${formatRupiah(it.price)}`);
      textLines.push(`• *Halaman:* ${it.pageCount || it.detailedInfo?.pages || '-'}`);
      textLines.push(`• *Cover:* ${it.coverType || it.detailedInfo?.cover || 'Soft Cover'}`);
      if (it.detailedInfo?.isbn) textLines.push(`• *ISBN:* ${it.detailedInfo.isbn}`);
      if (it.detailedInfo?.quote) textLines.push(`\n💬 _"${it.detailedInfo.quote}"_`);
      if (it.detailedInfo?.description) {
        textLines.push(`\n📖 *Sinopsis:*`);
        textLines.push(`${it.detailedInfo.description.substring(0, 300)}...`);
      }
      textLines.push(`\n────────────────────\n`);
    });

    textLines.push(`📲 *Informasi & Pemesanan Salur:*`);
    textLines.push(`WhatsApp: +62 812-3456-7890`);
    textLines.push(`Website: www.lamrimnesia.com`);
    textLines.push(`Marketplace: Tokopedia & Shopee (Lamrimnesia)`);
    textLines.push(`_Semoga kebajikan penyebaran Dharma ini membawa kebahagiaan bagi semua makhluk._ 🙏`);

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
    onShowToast('Teks katalog siap siar (WhatsApp) berhasil disalin!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 print:p-0 print:bg-white print:static">
      {/* Modal Container */}
      <div className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-white px-5 sm:px-7 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center border border-teal-100 shadow-2xs">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Katalog Item S-SALUR
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#008d91] border border-teal-200">
                  {items.length} Item Dipilih
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pratinjau brosur resmi, siap unduh dalam resolusi tinggi atau dicetak.
              </p>
            </div>
          </div>

          {/* Action buttons: Download, Print, Copy */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Mode Toggle if multiple items */}
            {items.length > 1 && (
              <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold mr-1">
                <button
                  type="button"
                  onClick={() => setViewMode('single')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'single'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Per Item</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'all'
                      ? 'bg-white text-[#008d91] shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Semua ({items.length})</span>
                </button>
              </div>
            )}

            {/* Copy WhatsApp Text */}
            <button
              type="button"
              onClick={handleCopyText}
              title="Salin teks katalog untuk WhatsApp / Media Sosial"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Salin Teks WA</span>
                </>
              )}
            </button>

            {/* Copy Image */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isProcessing}
              title="Salin gambar katalog ke clipboard"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              {copiedImage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Gambar Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Salin Gambar</span>
                </>
              )}
            </button>

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrintPdf}
              title="Cetak langsung atau simpan sebagai PDF"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cetak / PDF</span>
            </button>

            {/* Download Image Button (Primary Action) */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#008d91] hover:bg-[#05828e] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>{isProcessing ? 'Memproses...' : 'Download Gambar'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Item Navigation Strip (When multiple items & single mode) */}
        {items.length > 1 && viewMode === 'single' && (
          <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200/90 flex items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              {items.map((it, idx) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setActivePageIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activePageIndex === idx
                      ? 'bg-[#008d91] text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <span>{idx + 1}.</span>
                  <span className="truncate max-w-[130px]">{it.title}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 px-1.5">
                {activePageIndex + 1} / {items.length}
              </span>
              <button
                type="button"
                disabled={activePageIndex === items.length - 1}
                onClick={() => setActivePageIndex((prev) => Math.min(items.length - 1, prev + 1))}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Catalog Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar print:p-0 print:overflow-visible">
          <div ref={catalogContentRef} className="space-y-6 print:space-y-0">
            {viewMode === 'single' ? (
              // Single Item Catalog Flyer Card
              <div ref={currentCardRef}>
                <CatalogSingleCard item={currentItem} formatRupiah={formatRupiah} />
              </div>
            ) : (
              // All Items View (Sequential Full-Page Cards for Batch Download/Print)
              items.map((it, idx) => (
                <div key={it.id} className="print:break-after-page">
                  <CatalogSingleCard
                    item={it}
                    itemIndex={idx + 1}
                    totalItems={items.length}
                    formatRupiah={formatRupiah}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer info (Hidden on Print) */}
        <div className="bg-white px-6 py-2.5 border-t border-slate-200/90 text-slate-500 text-[11px] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Format katalog disesuaikan untuk standar publikasi A4 dan media visual digital YPPLN.</span>
          </div>
          <div className="font-medium text-slate-600">
            Lamrim Nusantara Publishing Division
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: CATALOG FLYER / BROCHURE CARD
// ==========================================
interface CatalogSingleCardProps {
  item: SalurProduct;
  itemIndex?: number;
  totalItems?: number;
  formatRupiah: (num: number) => string;
}

const CatalogSingleCard: React.FC<CatalogSingleCardProps> = ({
  item,
  itemIndex,
  totalItems,
  formatRupiah,
}) => {
  const categoriesList =
    item.categories && item.categories.length > 0
      ? item.categories
      : [item.category || 'TJMP'];

  const authorName = item.author || item.detailedInfo?.author || 'Panchen Losang Chokyi Gyaltshen & Panchen Losang Yeshe';
  const publisherName = item.publisher || item.detailedInfo?.publisher || 'Yayasan Pelestarian dan Pengembangan Lamrim Nusantara';
  const fullTitle = item.detailedInfo?.fullTitle || item.title;
  const quoteText = item.detailedInfo?.quote;
  const descriptionText = item.detailedInfo?.description;
  const isbnCode = item.detailedInfo?.isbn || '978-623-6632-06-2';
  const pageInfo = item.pageCount || item.detailedInfo?.pages || '200 hlm';
  const dimensionInfo = item.detailedInfo?.dimensions || '21 x 14.8 cm (A5)';
  const coverType = item.coverType || item.detailedInfo?.cover || 'Soft Cover';
  const releaseYear = item.detailedInfo?.year || '2021';
  const itemCode = item.code || 'BJM - 2021';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden text-slate-800 print:shadow-none print:border-none print:rounded-none max-w-4xl mx-auto">
      {/* Decorative Brand Header */}
      <div className="bg-gradient-to-r from-[#005f63] via-[#008d91] to-[#04a2a7] px-6 sm:px-8 py-5 text-white relative overflow-hidden">
        {/* Subtle patterned overlay circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-32 h-32 rounded-full bg-amber-400/15 blur-lg pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/image_e94e2d75.png"
              alt="Logo Lamrimnesia"
              className="h-10 sm:h-12 w-auto object-contain rounded-md shadow-2xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/25 text-amber-200 border border-amber-300/30">
                  Katalog Literasi Dharma
                </span>
                <span className="text-[11px] text-teal-100 font-medium">
                  Penerbitan Nusantara
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug">
                YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA
              </h1>
              <p className="text-[11px] text-teal-100/90 mt-0.5">
                Divisi S-SALUR & Distribusi Buku Dharma • Program Pelestarian Ajaran
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-200">
              Kode Dokumen
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-amber-300">
              {itemCode}
            </div>
            {itemIndex && totalItems && (
              <div className="text-[10px] text-teal-100 mt-0.5 font-medium">
                Item {itemIndex} dari {totalItems}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Split (Cover & Specs on Left, Overview & Order on Right) */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Book Cover Display & Specs Table (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Book Cover with 3D drop-shadow effect */}
            <div className="relative group mb-5">
              <div className="w-44 h-60 sm:w-52 sm:h-72 rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 bg-slate-100 transition-transform duration-200 flex items-center justify-center">
                <BookCover
                  coverKey={item.coverKey}
                  imageUrl={item.imageUrl}
                  title={item.title}
                  size="lg"
                  className="!w-full !h-full !rounded-2xl"
                />
              </div>
              {/* Glossy subtle reflection bar on the spine */}
              <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/20 via-white/20 to-transparent pointer-events-none rounded-l-2xl" />
            </div>

            {/* Price Badge */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center mb-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Dana Salur / Harga Pengganti Cetak
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#008d91] mt-0.5 font-mono">
                {formatRupiah(item.price)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {item.price > 0
                  ? '100% didonasikan untuk cetak ulang & pelestarian pustaka Dharma'
                  : 'Disediakan secara sukarela tanpa biaya cetak wajib'}
              </div>
            </div>

            {/* Quick Specs Table */}
            <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#008d91]" />
                <span>Spesifikasi Fisik</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-500">ISBN:</span>
                <span className="font-mono font-semibold text-slate-800">{isbnCode}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-500">Jumlah Halaman:</span>
                <span className="font-semibold text-slate-800">{pageInfo}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-500">Dimensi / Ukuran:</span>
                <span className="font-semibold text-slate-800">{dimensionInfo}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-500">Jenis Jilid/Cover:</span>
                <span className="font-semibold text-slate-800">{coverType}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-500">Tahun Penerbitan:</span>
                <span className="font-semibold text-slate-800">{releaseYear}</span>
              </div>

              {item.coaNoAkun && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-600">
                  <span className="text-slate-500">Akun COA Resmi:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {item.coaNoAkun}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title, Author, Quote, Synopsis & How to Order (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category & SubJenis Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {categoriesList.map((cat, cIdx) => (
                  <span
                    key={cIdx}
                    className="px-3 py-1 rounded-full bg-teal-50 text-[#008d91] border border-teal-200/80 text-xs font-semibold"
                  >
                    {cat}
                  </span>
                ))}
                {item.subJenis && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold">
                    {item.subJenis}
                  </span>
                )}
                {item.pemasukanDivisi && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    Divisi: {item.pemasukanDivisi}
                  </span>
                )}
              </div>

              {/* Book Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {fullTitle}
              </h2>
              {item.subtitle && (
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  {item.subtitle}
                </p>
              )}

              {/* Author & Publisher Credits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-[#008d91] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">Penulis / Guru</div>
                    <div className="font-semibold text-slate-800 leading-snug">{authorName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-[#008d91] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">Penerbit</div>
                    <div className="font-semibold text-slate-800 leading-snug">{publisherName}</div>
                  </div>
                </div>
              </div>

              {/* Inspirational Quote if exists */}
              {quoteText && (
                <div className="my-4 p-4 rounded-2xl bg-amber-50/70 border-l-4 border-amber-500 text-slate-700">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <blockquote className="text-xs sm:text-[13px] italic font-serif leading-relaxed text-amber-950">
                      "{quoteText}"
                    </blockquote>
                  </div>
                </div>
              )}

              {/* Synopsis & Detailed Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-[#008d91]" />
                  <span>Sinopsis & Rangkuman Isi Buku</span>
                </h4>
                <div className="text-xs sm:text-[13px] text-slate-600 leading-relaxed space-y-2.5">
                  {descriptionText ? (
                    <p className="whitespace-pre-line text-justify">{descriptionText}</p>
                  ) : (
                    <p className="text-slate-500 leading-relaxed">
                      Buku karya adiluhung ini memuat intisari ajaran kebijaksanaan dan welas asih yang
                      disusun secara berurutan dan terstruktur (*Lamrim*), membimbing pembaca dalam
                      mengembangkan pikiran bajik, kedamaian batin, dan jalan luhur pencerahan.
                      Cocok dibaca oleh para praktisi pemula hingga pembelajar lanjutan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* How to Order / Contact Footer Block */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="bg-gradient-to-br from-teal-50 to-slate-50 border border-teal-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Ingin Memperoleh Buku Ini?
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tersedia pengiriman ke seluruh kota di Indonesia melalui Tim S-SALUR.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-[#008d91] text-xs font-bold shadow-2xs">
                    WhatsApp: 0812-3456-7890
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#008d91] text-white text-xs font-bold shadow-2xs">
                    Tokopedia & Shopee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Card Bottom Footer */}
      <div className="bg-slate-50 px-6 sm:px-8 py-3 border-t border-slate-200/90 text-slate-500 text-[10px] flex flex-wrap items-center justify-between gap-2">
        <div>
          © {new Date().getFullYear()} Yayasan Pelestarian dan Pengembangan Lamrim Nusantara. Hak cipta dilindungi.
        </div>
        <div className="font-mono text-slate-600 font-medium">
          DOKUMEN RESMI DIVISI PENERBITAN & DISTRIBUSI SALUR
        </div>
      </div>
    </div>
  );
};
