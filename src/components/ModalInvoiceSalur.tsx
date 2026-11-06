import React, { useRef, useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Send,
  Check,
  Upload,
  RefreshCw,
  Eye,
  MessageCircle,
  Mail,
  Share2,
  FileText,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { SalurOrder } from '../salurData';

interface ModalInvoiceSalurProps {
  isOpen: boolean;
  order: SalurOrder | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const STORAGE_CUSTOM_TEMPLATE = 'yppln_custom_invoice_template_bg';

export const ModalInvoiceSalur: React.FC<ModalInvoiceSalurProps> = ({
  isOpen,
  order,
  onClose,
  onShowToast,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [isSendMenuOpen, setIsSendMenuOpen] = useState<boolean>(false);

  // Custom template background support
  const [customTemplateBg, setCustomTemplateBg] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_CUSTOM_TEMPLATE);
    } catch {
      return null;
    }
  });

  const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCustomTemplateBg(base64);
        try {
          localStorage.setItem(STORAGE_CUSTOM_TEMPLATE, base64);
        } catch {
          // ignore quota limits
        }
        onShowToast('Template gambar invoice berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetTemplate = () => {
    setCustomTemplateBg(null);
    try {
      localStorage.removeItem(STORAGE_CUSTOM_TEMPLATE);
    } catch {
      // ignore
    }
    onShowToast('Menggunakan template bawaan Lamrimnesia Store');
  };

  // Calculations for items & pricing
  const { items, subtotal, ongkir, total, formattedDate, invoiceNumber } = useMemo(() => {
    if (!order) {
      return {
        items: [],
        subtotal: 0,
        ongkir: 10000,
        total: 10000,
        formattedDate: '11.02.2030',
        invoiceNumber: '01234',
      };
    }

    const orderItems = order.items && order.items.length > 0
      ? order.items
      : [
          {
            id: 'item-1',
            productId: 'p-1',
            title: 'Jalan Menuju Kemahatahuan',
            price: 125000,
            quantity: 1,
          },
          {
            id: 'item-2',
            productId: 'p-2',
            title: 'Demi Kepentingan Semua Makhluk',
            price: 89000,
            quantity: 1,
          },
        ];

    const calcSubtotal = orderItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);

    // Parse ongkir if present
    let calcOngkir = 10000;
    if (order.costBreakdown?.ongkir) {
      const match = order.costBreakdown.ongkir.replace(/[^0-9]/g, '');
      if (match) calcOngkir = parseInt(match, 10);
    }

    const calcTotal = calcSubtotal + calcOngkir;

    // Date formatting (e.g. 14 Nov 2021 -> 14.11.2021 or 11.02.2030)
    let dStr = order.date || '14.11.2021';
    try {
      const parts = order.date?.split(' ') || [];
      if (parts.length === 3) {
        const monthMap: Record<string, string> = {
          jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', jun: '06',
          jul: '07', agu: '08', sep: '09', okt: '10', nov: '11', des: '12',
          january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
          july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
        };
        const day = parts[0].padStart(2, '0');
        const month = monthMap[parts[1].toLowerCase()] || '11';
        const year = parts[2];
        dStr = `${day}.${month}.${year}`;
      }
    } catch {
      dStr = order.date || '14.11.2021';
    }

    return {
      items: orderItems,
      subtotal: calcSubtotal,
      ongkir: calcOngkir,
      total: calcTotal,
      formattedDate: dStr,
      invoiceNumber: order.orderNumber?.replace(/[^0-9]/g, '').slice(-5) || order.orderNumber || '01234',
    };
  }, [order]);

  // Recipient info
  const recipientName = order?.alamat?.recipientName || order?.idPembeli?.split(' ')[1] || 'Jonathan Patterson';
  const recipientSubtitle = order?.customerId?.includes('ORG') ? 'Organisasi Partner' : 'Liceria & Co.';
  const recipientAddress = order?.alamat?.street || '123 Anywhere St., Any City';
  const recipientCity = order?.alamat?.cityProvince || 'Bandung, Jawa Barat';

  // 1. Download Handler
  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsProcessing(true);
      onShowToast('Sedang memproses unduhan invoice...');
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Invoice-${order?.orderNumber || invoiceNumber}.png`;
      link.click();
      onShowToast(`Invoice ${order?.orderNumber || invoiceNumber} berhasil diunduh!`);
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('Gagal mengunduh invoice. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Copy Image Handler
  const handleCopyImage = async () => {
    if (!invoiceRef.current) return;
    try {
      setIsProcessing(true);
      onShowToast('Sedang menyalin gambar invoice...');
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          onShowToast('Gagal membuat gambar untuk disalin');
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
            setCopiedState(true);
            setTimeout(() => setCopiedState(false), 2500);
            onShowToast('Gambar invoice berhasil disalin ke clipboard!');
          } else {
            throw new Error('Clipboard API not available');
          }
        } catch (clipboardErr) {
          console.warn('Direct clipboard image copy failed, providing fallback:', clipboardErr);
          // Fallback: download the image
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `Invoice-${order?.orderNumber || invoiceNumber}.png`;
          link.click();
          onShowToast('Gambar disimpan ke perangkat (akses clipboard dibatasi).');
        } finally {
          setIsProcessing(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy image error:', err);
      onShowToast('Gagal menyalin gambar.');
      setIsProcessing(false);
    }
  };

  // 3. Send Handler (WhatsApp or Direct Notification)
  const handleSendViaWhatsApp = () => {
    const rawPhone = order?.alamat?.phone?.replace(/[^0-9]/g, '') || '';
    const phone = rawPhone.startsWith('0') ? `62${rawPhone.slice(1)}` : rawPhone;

    const messageText = encodeURIComponent(
      `Halo ${recipientName},\n\nBerikut terlampir rincian Invoice dari Lamrimnesia Store:\n` +
      `No. Invoice: ${order?.orderNumber || invoiceNumber}\n` +
      `Tanggal: ${formattedDate}\n` +
      `Total Pembayaran: Rp${total.toLocaleString('id-ID')}\n\n` +
      `Pembayaran dapat ditransfer ke rekening:\n` +
      `BCA 0077119888 a.n. Yayasan Pelestarian dan Pengembangan Lamrim Nusantara\n\n` +
      `Terima kasih!\nPathway to Everlasting Happiness.`
    );

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${messageText}`, '_blank');
      onShowToast(`Membuka WhatsApp untuk mengirim invoice ke ${order?.alamat?.phone}`);
    } else {
      navigator.clipboard?.writeText?.(decodeURIComponent(messageText));
      onShowToast('Teks invoice berhasil disalin ke clipboard!');
    }
    setIsSendMenuOpen(false);
  };

  const handleSendGeneric = () => {
    onShowToast(`Invoice berhasil dikirim ke ${order?.alamat?.phone || recipientName}!`);
    setIsSendMenuOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col my-auto max-h-[96vh] overflow-hidden">
        {/* Top Header Controls Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#008d91]" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Lihat Invoice S-SALUR
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-[#008d91] font-semibold border border-teal-200 hidden sm:inline-block">
              {order?.orderNumber || invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input to upload custom template */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadTemplate}
            />

            {/* Template options */}
            {customTemplateBg ? (
              <button
                type="button"
                onClick={handleResetTemplate}
                title="Gunakan Template Bawaan"
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset Template</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload gambar template invoice kustom"
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Ganti Template</span>
              </button>
            )}

            {/* Close Button */}
            <button
              id="btn-close-invoice-modal"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Preview Scroll Container */}
        <div className="overflow-y-auto p-3 sm:p-6 bg-slate-100/70 flex items-center justify-center">
          {/* THE INVOICE CONTAINER - Formatted to exactly match Contoh Gambar Invoice.png */}
          <div
            ref={invoiceRef}
            id="invoice-printable-container"
            className="w-full max-w-[620px] bg-white shadow-xl relative overflow-hidden flex flex-col font-sans select-none"
            style={{
              aspectRatio: '1 / 1.414', // A4 aspect ratio
              minHeight: '840px',
            }}
          >
            {/* If custom template background is uploaded, render it as background */}
            {customTemplateBg && (
              <div
                className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${customTemplateBg})` }}
              />
            )}

            {/* Default Vector Graphics Template (Matching Template Gambar Invoice.png) */}
            {!customTemplateBg && (
              <>
                {/* Top Dark Teal Banner with Curves & Accent */}
                <div className="relative w-full h-24 bg-[#0d3b38] z-0 overflow-hidden flex items-center justify-between px-6">
                  {/* Top Bright Teal Accent Strip */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#008d91]" />

                  {/* Left: Lamrimnesia store logo & Yayasan info */}
                  <div className="flex items-center gap-4 z-10">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif italic font-extrabold text-xl text-[#f7c948] tracking-wide">
                          Lamrimnesia
                        </span>
                        <span className="text-xs font-bold text-[#00a896] uppercase tracking-wider">
                          store
                        </span>
                      </div>
                      {/* Underline book outline motif in teal */}
                      <div className="h-0.5 w-24 bg-[#00a896] rounded-full -mt-0.5 mb-1" />
                    </div>

                    <div className="hidden sm:flex flex-col text-[8.5px] leading-tight text-white/90 font-medium">
                      <span>YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA</span>
                      <span>+62 85 2112 2014 1</span>
                      <span className="text-white/70">Jl. Bijaksana iii No. 7, Pasteur, Sukajadi, Bandung 40161</span>
                    </div>
                  </div>

                  {/* Right: Curved Decorative Cutout matching template */}
                  <div className="absolute -top-6 -right-6 w-36 h-28 bg-white rounded-3xl border-4 border-[#008d91]/30 rotate-12 pointer-events-none" />
                </div>

                {/* White Cutout arch curve between header and body */}
                <div className="relative w-full h-4 bg-[#0d3b38] -mt-1 z-0">
                  <div className="w-full h-full bg-white rounded-t-3xl" />
                </div>
              </>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 px-8 sm:px-10 pt-4 pb-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Store Centered Heading */}
                <div className="text-center pt-1 pb-6">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#1e293b] uppercase">
                    LAMRIMNESIA STORE
                  </h1>
                  <p className="text-xs sm:text-sm font-medium italic text-slate-500 tracking-wider mt-0.5">
                    Pathway to Everlasting Happiness
                  </p>
                </div>

                {/* Header Information: KEPADA vs NO. INVOICE / TANGGAL */}
                <div className="grid grid-cols-12 gap-4 text-xs pt-2 pb-6 items-start">
                  {/* Left Column: KEPADA */}
                  <div className="col-span-7 flex flex-col gap-0.5">
                    <span className="font-extrabold text-slate-900 tracking-wider text-[11px]">
                      KEPADA:
                    </span>
                    <span className="font-medium text-slate-800 text-xs mt-0.5">
                      {recipientName}
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      {recipientSubtitle}
                    </span>
                    <span className="text-slate-500 text-[11px] max-w-[260px] leading-relaxed">
                      {recipientAddress}, {recipientCity}
                    </span>
                  </div>

                  {/* Right Column: NO. INVOICE & TANGGAL */}
                  <div className="col-span-5 flex flex-col gap-1 text-right sm:text-left sm:pl-4">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="font-extrabold text-slate-900 tracking-wider text-[11px] w-24 shrink-0">
                        NO. <span className="italic font-bold">INVOICE:</span>
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {invoiceNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="font-extrabold text-slate-900 tracking-wider text-[11px] w-24 shrink-0">
                        TANGGAL:
                      </span>
                      <span className="font-medium text-slate-800 text-xs">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TABLE INVOICE MATCHING CONTOH GAMBAR INVOICE */}
                <div className="w-full mt-2">
                  {/* Header Bar: Solid Golden Yellow / Amber (#f59e0b) */}
                  <div className="bg-[#f59e0b] text-[#1e293b] font-bold text-[11px] tracking-wider uppercase px-4 py-2 flex items-center justify-between">
                    <div className="w-[44%] text-left">DESCRIPTION</div>
                    <div className="w-[20%] text-right pr-2">UNIT PRICE</div>
                    <div className="w-[12%] text-center">QTY</div>
                    <div className="w-[24%] text-right">TOTAL</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col divide-y divide-slate-100 text-xs py-1">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="px-4 py-2.5 flex items-center justify-between text-slate-700 hover:bg-slate-50/50"
                      >
                        <div className="w-[44%] font-normal text-slate-800 leading-tight">
                          {it.title}
                        </div>
                        <div className="w-[20%] text-right pr-2 font-mono text-slate-600">
                          Rp{it.price.toLocaleString('id-ID')}
                        </div>
                        <div className="w-[12%] text-center text-slate-600">
                          {it.quantity}
                        </div>
                        <div className="w-[24%] text-right font-mono text-slate-800">
                          Rp{(it.price * it.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal Row */}
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between text-xs border-t border-slate-200">
                    <span className="font-bold text-slate-900 tracking-wider text-[11px]">
                      SUBTOTAL
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      Rp{subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Ongkos Kirim Row */}
                  <div className="px-4 py-1.5 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-normal text-slate-600 ml-auto mr-8">
                      Ongkos Kirim
                    </span>
                    <span className="font-mono text-slate-700">
                      Rp{ongkir.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Total Row: Solid Golden Yellow / Amber Bar (#f59e0b) */}
                  <div className="bg-[#f59e0b] text-[#1e293b] font-bold text-xs tracking-wider px-4 py-2 flex items-center justify-between mt-2">
                    <span className="tracking-widest uppercase text-[11px]">TOTAL</span>
                    <span className="font-bold font-mono text-sm">
                      Rp{total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM FOOTER SECTION MATCHING TEMPLATE */}
              <div className="pt-8 pb-4 flex items-end justify-between relative">
                {/* Left: Bank Details */}
                <div className="flex flex-col text-[11px] leading-relaxed text-slate-700 max-w-[280px]">
                  <span className="font-bold text-slate-900 tracking-wider uppercase text-xs mb-1">
                    BANK DETAILS
                  </span>
                  <span>Dana dapat disalurkan ke:</span>
                  <span className="font-semibold text-slate-800">BCA no. 0077119888 a.n.</span>
                  <span>Yayasan Pelestarian dan</span>
                  <span>Pengembangan Lamrim Nusantara.</span>
                </div>

                {/* Right: Thank you, Lamrimnesia cursive & Chibi children reading illustration */}
                <div className="flex flex-col items-end text-right relative pr-1">
                  <span className="font-bold text-[11px] text-slate-900 tracking-widest uppercase mb-0.5">
                    THANK YOU,
                  </span>
                  <span
                    className="text-2xl font-serif italic text-[#f59e0b] font-bold tracking-wide -mt-1 mr-2"
                    style={{ fontFamily: 'Georgia, "Brush Script MT", cursive, serif' }}
                  >
                    Lamrimnesia
                  </span>

                  {/* Adorable Chibi characters illustration with books and sparkle */}
                  <div className="w-24 h-16 relative mt-1 select-none pointer-events-none">
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      {/* Sparkle */}
                      <polygon points="12,18 14,14 18,12 14,10 12,6 10,10 6,12 10,14" fill="#f59e0b" />
                      {/* Character 1 (Top child with book) */}
                      <circle cx="65" cy="22" r="14" fill="#334155" />
                      <circle cx="65" cy="25" r="11" fill="#fed7aa" />
                      {/* eyes */}
                      <ellipse cx="61" cy="25" rx="1.5" ry="2" fill="#1e293b" />
                      <ellipse cx="69" cy="25" rx="1.5" ry="2" fill="#1e293b" />
                      {/* blush */}
                      <ellipse cx="58" cy="28" rx="2" ry="1" fill="#fca5a5" opacity="0.6" />
                      <ellipse cx="72" cy="28" rx="2" ry="1" fill="#fca5a5" opacity="0.6" />
                      {/* Book 1 */}
                      <path d="M54 32 L65 30 L76 32 L74 42 L65 40 L56 42 Z" fill="#008d91" />
                      <path d="M56 34 L65 32 L74 34" stroke="#ffffff" strokeWidth="1" fill="none" />

                      {/* Character 2 (Bottom child) */}
                      <circle cx="50" cy="42" r="13" fill="#78350f" />
                      <circle cx="50" cy="44" r="10.5" fill="#ffedd5" />
                      {/* eyes */}
                      <circle cx="47" cy="44" r="1.5" fill="#1e293b" />
                      <circle cx="53" cy="44" r="1.5" fill="#1e293b" />
                      {/* smile */}
                      <path d="M48 48 Q50 50 52 48" stroke="#1e293b" strokeWidth="1" fill="none" />
                      {/* Book 2 */}
                      <path d="M40 50 L50 48 L60 50 L58 58 L50 56 L42 58 Z" fill="#f59e0b" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Teal Banner Footer */}
            {!customTemplateBg && (
              <div className="relative w-full h-5 bg-[#0d3b38] z-0 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#008d91]" />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION TOOLBAR MATCHING EXACT USER REQUIREMENTS:
            "Akan ada pilihan 'download', 'copy image', dan 'Kirim'" */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-white shrink-0">
          <div className="text-xs text-slate-500">
            Total Invoice: <span className="font-bold text-slate-800 font-mono">Rp{total.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 1. DOWNLOAD BUTTON */}
            <button
              id="btn-download-invoice"
              type="button"
              disabled={isProcessing}
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>{isProcessing ? 'Memproses...' : 'Download'}</span>
            </button>

            {/* 2. COPY IMAGE BUTTON */}
            <button
              id="btn-copy-invoice-image"
              type="button"
              disabled={isProcessing}
              onClick={handleCopyImage}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {copiedState ? (
                <>
                  <Check className="w-4 h-4 text-teal-600" />
                  <span className="text-teal-700 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {/* 3. KIRIM BUTTON (with Dropdown / WhatsApp action) */}
            <div className="relative">
              <button
                id="btn-kirim-invoice"
                type="button"
                onClick={() => setIsSendMenuOpen(!isSendMenuOpen)}
                className="px-5 py-2 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
                <span>Kirim</span>
              </button>

              {isSendMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={handleSendViaWhatsApp}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Kirim via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendGeneric}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#008d91]" />
                    <span>Tandai Terkirim</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
