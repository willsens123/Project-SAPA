import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Share2,
  Check,
  ShieldCheck,
  QrCode,
  FileText,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Receipt,
  Heart,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DonasiOrder } from '../donasiData';
import { angkaKeTerbilang, formatRupiah } from '../utils/terbilang';
import { generateQrDataUrl } from '../utils/qrCodeHelper';
import { dispatchAuditEvent } from '../utils/auditEventBus';

interface ModalKwitansiDonasiProps {
  isOpen: boolean;
  order: DonasiOrder | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ModalKwitansiDonasi: React.FC<ModalKwitansiDonasiProps> = ({
  isOpen,
  order,
  onClose,
  onShowToast,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Customization options
  const [includePelimpahanJasa, setIncludePelimpahanJasa] = useState(true);
  const [includeStamp, setIncludeStamp] = useState(true);
  const [bendaharaName, setBendaharaName] = useState('Bendahara Umum YPPLN');
  const [kwitansiNumber, setKwitansiNumber] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Auto-generate serial receipt number from order
  useEffect(() => {
    if (order) {
      const cleanNum = order.orderNumber.replace(/[^0-9]/g, '').slice(-6) || '000001';
      const year = new Date().getFullYear();
      setKwitansiNumber(`KWT-DN/${year}/${cleanNum}`);
    }
  }, [order?.orderNumber]);

  // Numeric total calculation
  const numericTotal = useMemo(() => {
    if (!order) return 0;
    const clean = order.totalDana.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  }, [order?.totalDana]);

  // Indonesian formal words for amount
  const terbilangText = useMemo(() => {
    return angkaKeTerbilang(numericTotal);
  }, [numericTotal]);

  // Generate QR Code verification data
  useEffect(() => {
    if (!order) return;
    const verificationPayload = JSON.stringify({
      dokumen: 'KWITANSI DONASI RESMI YPPLN',
      nomorKwitansi: kwitansiNumber || order.orderNumber,
      orderId: order.orderNumber,
      donatur: order.namaDonatur.name,
      tanggal: order.date,
      nominal: order.totalDana,
      status: 'TERVERIFIKASI ASLI (SAPA ERP)',
      yayasan: 'Yayasan Pelestarian dan Pengembangan Lamrim Nusantara',
      timestampVerifikasi: new Date().toISOString(),
    });

    generateQrDataUrl(verificationPayload).then((url) => {
      setQrDataUrl(url);
    });
  }, [order, kwitansiNumber]);

  if (!isOpen || !order) return null;

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2.5, // High-resolution print quality
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`E-Kwitansi_Donasi_${order.orderNumber}.pdf`);

      // Record audit event
      dispatchAuditEvent({
        module: 'DONASI',
        recordId: order.orderNumber,
        recordTitle: `${order.namaDonatur.name} (${order.totalDana})`,
        actionType: 'E-Kwitansi',
        field: 'Penerbitan E-Kwitansi Resmi',
        oldValue: 'Draft',
        newValue: kwitansiNumber,
        alasan: 'Download file PDF e-kwitansi tanda terima donasi',
        author: 'Admin Keuangan',
      });

      onShowToast(`E-Kwitansi ${kwitansiNumber} berhasil diunduh sebagai PDF`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      onShowToast('Gagal membuat file PDF. Silakan gunakan tombol Cetak.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Browser Print
  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=900,height=650');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kwitansi Donasi ${kwitansiNumber}</title>
            <style>
              @page { size: A5 landscape; margin: 10mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 10px; color: #1e293b; }
              * { box-sizing: border-box; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body onload="window.print(); window.close();">
            <div style="width: 100%; max-width: 800px; margin: 0 auto;">
              ${printContents}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Handle WhatsApp Share
  const handleShareWhatsApp = () => {
    const lines = [
      `*TANDA TERIMA DONASI RESMI*`,
      `*YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA*`,
      `---------------------------------------`,
      `No. Kwitansi : ${kwitansiNumber}`,
      `Tanggal      : ${order.date}`,
      `Nama Donatur : ${order.namaDonatur.name} (${order.customerId})`,
      `Jumlah Dana  : *${order.totalDana}*`,
      `Terbilang    : _${terbilangText}_`,
      `Program/Item : ${order.items.map((i) => `${i.name} (${i.qtyPrice})`).join(', ')}`,
      order.pelimpahanJasa?.name ? `Pelimpahan Jasa : ${order.pelimpahanJasa.allNames?.join(', ') || order.pelimpahanJasa.name}` : '',
      `Status       : *LUNAS (PAID)*`,
      `---------------------------------------`,
      `_Anumodana atas kebajikan dan kemurahan hati Anda. Semoga berkah kebajikan ini melimpah bagi semua makhluk._ 🙏`,
    ].filter(Boolean);

    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${message}`, '_blank');
    onShowToast('Pesan WhatsApp tanda terima siap dikirim');
  };

  // Handle Copy text
  const handleCopyText = () => {
    const text = `TANDA TERIMA DONASI RESMI\nNo: ${kwitansiNumber}\nDonatur: ${order.namaDonatur.name}\nNominal: ${order.totalDana}\nTerbilang: ${terbilangText}\nStatus: Lunas (Paid)\nTanggal: ${order.date}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    onShowToast('Rincian kwitansi disalin ke clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#05828e] text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  E-Kwitansi Tanda Terima Donasi Resmi
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified Paid
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Penerbitan kwitansi digital resmi ber-QR Code untuk arsip dan konfirmasi donatur.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar Settings */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeStamp}
                onChange={(e) => setIncludeStamp(e.target.checked)}
                className="rounded text-[#05828e] focus:ring-[#05828e]"
              />
              <span>Stempel Resmi Digital</span>
            </label>

            {order.pelimpahanJasa?.name && (
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={includePelimpahanJasa}
                  onChange={(e) => setIncludePelimpahanJasa(e.target.checked)}
                  className="rounded text-[#05828e] focus:ring-[#05828e]"
                />
                <span>Tampilkan Pelimpahan Jasa</span>
              </label>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">No. Seri:</span>
              <input
                type="text"
                value={kwitansiNumber}
                onChange={(e) => setKwitansiNumber(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-xs font-semibold text-slate-800 w-44"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format Resmi Non-Profit YPPLN (A5 Landscape)</span>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-100 flex items-center justify-center">
          {/* A5 Landscape Receipt Canvas */}
          <div
            ref={receiptRef}
            className="w-full max-w-[780px] bg-white rounded-xl shadow-md border-2 border-slate-300/80 p-6 sm:p-7 relative font-['Plus_Jakarta_Sans',sans-serif] text-slate-800"
            style={{ minHeight: '440px' }}
          >
            {/* Watermark subtle background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
              <div className="w-80 h-80 rounded-full border-[20px] border-slate-900 flex items-center justify-center text-7xl font-bold font-serif">
                YPPLN
              </div>
            </div>

            {/* Header Kop Surat */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/image_e94e2d75.png"
                  alt="Logo Lamrimnesia"
                  className="h-11 sm:h-12 w-auto object-contain shrink-0 rounded-lg shadow-2xs"
                />
                <div>
                  <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
                    YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA
                  </h1>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    SK Kemenkumham RI No. AHU-0012345.AH.01.04.Tahun 2018 · NPWP: 85.123.456.7-012.000
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Sistem Otomasi Administrasi & Pelayanan Pelimpahan Dana (Proyek SAPA · Lamrimnesia)
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Kwitansi Donasi
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                  {kwitansiNumber}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {order.date}
                </div>
              </div>
            </div>

            {/* Receipt Title & Status Stamp */}
            <div className="flex items-center justify-between py-2.5">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#05828e]">
                  Tanda Terima Donasi Resmi
                </h2>
                <div className="text-[11px] text-slate-400 font-mono">
                  Ref Transaksi: #{order.orderNumber}
                </div>
              </div>

              {/* Paid Status Stamp */}
              <div className="border-2 border-emerald-600 text-emerald-700 px-3 py-1 rounded-md rotate-[-2deg] font-extrabold text-xs uppercase tracking-widest shadow-2xs">
                ✓ LUNAS / PAID
              </div>
            </div>

            {/* Main Form Rows */}
            <div className="space-y-2.5 text-xs pt-1">
              {/* Row 1: Telah Diterima Dari */}
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-100 items-baseline">
                <div className="col-span-3 text-slate-500 font-medium">Telah Diterima Dari:</div>
                <div className="col-span-9 font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{order.namaDonatur.name}</span>
                  <span className="font-mono text-[11px] text-slate-400 font-normal">
                    (ID: {order.customerId})
                  </span>
                </div>
              </div>

              {/* Row 2: Uang Sejumlah (Terbilang) */}
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-100 items-baseline">
                <div className="col-span-3 text-slate-500 font-medium">Uang Sejumlah:</div>
                <div className="col-span-9 font-semibold text-slate-800 bg-amber-50/70 px-2.5 py-1.5 rounded-lg border border-amber-200/60 italic">
                  "{terbilangText}"
                </div>
              </div>

              {/* Row 3: Untuk Keperluan Donasi */}
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-100 items-baseline">
                <div className="col-span-3 text-slate-500 font-medium">Untuk Pembayaran:</div>
                <div className="col-span-9 space-y-1 text-slate-800">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        {it.name} <span className="text-slate-400 font-normal">({it.category})</span>
                      </span>
                      <span className="font-mono text-slate-600">{it.qtyPrice}</span>
                    </div>
                  ))}
                  {order.extraItems && order.extraItems.map((ex, idx) => (
                    <div key={`extra-${idx}`} className="flex items-center justify-between text-slate-600">
                      <span>{ex.name}</span>
                      <span className="font-mono">{ex.qtyPrice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Pelimpahan Jasa (Optional) */}
              {includePelimpahanJasa && order.pelimpahanJasa?.name && (
                <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-100 items-baseline">
                  <div className="col-span-3 text-slate-500 font-medium">Pelimpahan Jasa:</div>
                  <div className="col-span-9 text-slate-700 italic flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 fill-current" />
                    <span>
                      {order.pelimpahanJasa.allNames?.join(', ') || order.pelimpahanJasa.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Nominal Total, QR Code, Signatures */}
            <div className="mt-4 pt-3 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left Box: Big Amount & QR Verification */}
              <div className="flex items-center gap-3.5">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-center shadow-xs">
                  <div className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">
                    Jumlah Dana
                  </div>
                  <div className="font-mono font-bold text-base sm:text-lg tabular-nums">
                    {order.totalDana}
                  </div>
                </div>

                {qrDataUrl && (
                  <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                    <img
                      src={qrDataUrl}
                      alt="QR Verifikasi"
                      className="w-14 h-14 object-contain"
                    />
                    <div className="text-[9px] text-slate-400 max-w-[100px] leading-tight">
                      <span className="font-bold text-slate-700 block">QR Verifikasi</span>
                      Pindai untuk cek validitas SAPA ERP
                    </div>
                  </div>
                )}
              </div>

              {/* Right Box: Signatures & Stamp */}
              <div className="relative text-right text-xs pr-2">
                <div className="text-slate-500 text-[11px]">
                  Jakarta, {order.date}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Yayasan Pelestarian dan Pengembangan Lamrim Nusantara
                </div>

                {/* Stempel Digital Overlay */}
                {includeStamp && (
                  <div className="absolute right-6 top-3 w-20 h-20 rounded-full border-2 border-emerald-600/70 text-emerald-700/80 flex flex-col items-center justify-center p-1 text-[8px] font-bold text-center leading-tight rotate-[-12deg] pointer-events-none select-none">
                    <div className="text-[7px]">YAYASAN LAMRIM</div>
                    <div className="text-[9px] font-extrabold my-0.5">DITERIMA</div>
                    <div className="text-[7px]">LUNAS / PAID</div>
                  </div>
                )}

                {/* Signature Line */}
                <div className="mt-9 pt-1 border-t border-slate-400 inline-block min-w-[150px] text-center font-bold text-slate-900">
                  {bendaharaName}
                  <div className="text-[10px] font-normal text-slate-500">Bagian Keuangan & Donasi</div>
                </div>
              </div>
            </div>

            {/* Quiet Footer Note */}
            <div className="mt-3 text-center text-[9px] text-slate-400">
              Dokumen ini diterbitkan secara sah oleh Proyek SAPA YPPLN dan merupakan bukti tanda terima donasi resmi.
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedText ? 'Disalin' : 'Salin Rincian'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kirim via WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Cetak Kwitansi</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-1.5 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Membuat PDF...' : 'Unduh PDF (A5)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
