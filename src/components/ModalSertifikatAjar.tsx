import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  Share2,
  Copy,
  Check,
  Award,
  ShieldCheck,
  QrCode,
  GraduationCap,
  Users,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { generateQrDataUrl } from '../utils/qrCodeHelper';
import { dispatchAuditEvent } from '../utils/auditEventBus';

interface ModalSertifikatAjarProps {
  isOpen: boolean;
  item: TransaksiAjarItem | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ModalSertifikatAjar: React.FC<ModalSertifikatAjarProps> = ({
  isOpen,
  item,
  onClose,
  onShowToast,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  // Selected recipient index (if multiple recipients in 1 order)
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState<number>(0);
  const [certNumber, setCertNumber] = useState<string>('');
  const [predicate, setPredicate] = useState<string>('Kelulusan Dengan Predikat Sangat Baik');
  const [includeSeal, setIncludeSeal] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Recipient list extraction
  const recipientsList = useMemo(() => {
    if (!item) return [];
    const list: string[] = [];
    if (item.recipients && item.recipients.length > 0) {
      item.recipients.forEach((r) => list.push(r.replace(/^\d+\s*/, '').trim()));
    }
    if (item.otherRecipients && item.otherRecipients.length > 0) {
      item.otherRecipients.forEach((r) => list.push(r.replace(/^\d+\s*/, '').trim()));
    }
    if (list.length === 0 && item.customerId) {
      list.push(item.customerId.replace(/^\d+\s*/, '').trim());
    }
    return list.length > 0 ? list : ['Peserta Dharma'];
  }, [item]);

  const activeRecipient = recipientsList[selectedRecipientIndex] || recipientsList[0] || 'Peserta Dharma';

  // Auto-generate certificate number
  useEffect(() => {
    if (item) {
      const cleanNum = item.orderNumber.replace(/[^0-9]/g, '').slice(-5) || '00101';
      const year = new Date().getFullYear();
      setCertNumber(`CERT-AJAR/${year}/${cleanNum}-${selectedRecipientIndex + 1}`);
    }
  }, [item?.orderNumber, selectedRecipientIndex]);

  // Generate QR Code verification data
  useEffect(() => {
    if (!item) return;
    const payload = JSON.stringify({
      dokumen: 'SERTIFIKAT KELULUSAN RESMI A-AJAR',
      nomorSertifikat: certNumber,
      peserta: activeRecipient,
      program: item.eventName || item.itemName,
      tanggal: item.date,
      predikat: predicate,
      status: 'TERVERIFIKASI ASLI (SAPA A-AJAR)',
      lembaga: 'Yayasan Pelestarian dan Pengembangan Lamrim Nusantara',
      timestamp: new Date().toISOString(),
    });

    generateQrDataUrl(payload).then((url) => {
      setQrDataUrl(url);
    });
  }, [item, certNumber, activeRecipient, predicate]);

  if (!isOpen || !item) return null;

  // Handle Download PDF (Landscape A4)
  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`E-Sertifikat_${activeRecipient.replace(/\s+/g, '_')}_${item.orderNumber}.pdf`);

      // Dispatch audit event
      dispatchAuditEvent({
        module: 'AJAR',
        recordId: item.orderNumber,
        recordTitle: `${activeRecipient} (${item.eventName || item.itemName})`,
        actionType: 'E-Sertifikat',
        field: 'Penerbitan E-Sertifikat Kelulusan',
        oldValue: 'Draft',
        newValue: certNumber,
        alasan: 'Download file PDF e-sertifikat kelulusan peserta A-AJAR',
        author: 'Admin Edukasi',
      });

      onShowToast(`E-Sertifikat untuk ${activeRecipient} berhasil diunduh sebagai PDF`);
    } catch (err) {
      console.error('Failed to generate certificate PDF', err);
      onShowToast('Gagal membuat file PDF sertifikat. Silakan gunakan tombol Cetak.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Browser Print
  const handlePrint = () => {
    if (!certRef.current) return;
    const printContents = certRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=1000,height=750');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sertifikat ${activeRecipient} - ${certNumber}</title>
            <style>
              @page { size: A4 landscape; margin: 8mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 15px; color: #0f172a; }
              * { box-sizing: border-box; }
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body onload="window.print(); window.close();">
            <div style="width: 100%; max-width: 950px; margin: 0 auto;">
              ${printContents}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Handle Share WhatsApp
  const handleShareWhatsApp = () => {
    const lines = [
      `*SELAMAT ATAS KELULUSAN PROGRAM A-AJAR!* 🎓`,
      `*YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA*`,
      `---------------------------------------`,
      `No. Sertifikat : ${certNumber}`,
      `Nama Peserta   : *${activeRecipient}*`,
      `Program/Kelas  : *${item.eventName || item.itemName}*`,
      `Predikat       : _${predicate}_`,
      `Tanggal Terbit : ${item.date}`,
      `---------------------------------------`,
      `_Semoga ilmu dan berkah pemahaman Dharma yang dipelajari membawa manfaat luhur bagi diri sendiri dan semua makhluk._ 🙏`,
    ];

    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${message}`, '_blank');
    onShowToast('Pesan WhatsApp sertifikat siap dikirim');
  };

  // Copy details
  const handleCopy = () => {
    const text = `E-SERTIFIKAT KELULUSAN A-AJAR\nNo: ${certNumber}\nPeserta: ${activeRecipient}\nProgram: ${item.eventName || item.itemName}\nPredikat: ${predicate}\nTanggal: ${item.date}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onShowToast('Rincian sertifikat disalin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  E-Sertifikat Kelulusan & Apresiasi A-AJAR
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Resmi Terverifikasi
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Penerbitan sertifikat digital resmi ber-QR Code untuk kelulusan peserta kursus/retret Dharma.
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

        {/* Toolbar Settings */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Recipient Picker if multiple */}
            {recipientsList.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Pilih Peserta:</span>
                <select
                  value={selectedRecipientIndex}
                  onChange={(e) => setSelectedRecipientIndex(parseInt(e.target.value, 10))}
                  className="px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-800 text-xs"
                >
                  {recipientsList.map((r, idx) => (
                    <option key={idx} value={idx}>
                      #{idx + 1} - {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Predikat:</span>
              <select
                value={predicate}
                onChange={(e) => setPredicate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
              >
                <option value="Kelulusan Dengan Predikat Sangat Baik">Sangat Baik (Meritorious)</option>
                <option value="Kelulusan Dengan Predikat Baik">Baik</option>
                <option value="Partisipasi Penuh & Kontribusi Aktif">Partisipasi Penuh</option>
                <option value="Dengan Predikat Pujian (Cum Laude)">Dengan Pujian (Cum Laude)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeSeal}
                onChange={(e) => setIncludeSeal(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-600"
              />
              <span>Stempel Emas Resmi</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Format Resmi A4 Landscape</span>
          </div>
        </div>

        {/* Certificate Preview Viewport */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-100 flex items-center justify-center">
          {/* Certificate Canvas */}
          <div
            ref={certRef}
            className="w-full max-w-[860px] bg-white rounded-xl shadow-lg border-[10px] border-slate-900 p-8 sm:p-10 relative font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 overflow-hidden"
            style={{ minHeight: '520px' }}
          >
            {/* Inner Golden Border */}
            <div className="absolute inset-3 border-2 border-amber-600/60 pointer-events-none rounded-sm">
              <div className="absolute inset-1 border border-amber-500/30 rounded-xs" />
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-4 left-4 text-amber-600 text-lg select-none">❖</div>
            <div className="absolute top-4 right-4 text-amber-600 text-lg select-none">❖</div>
            <div className="absolute bottom-4 left-4 text-amber-600 text-lg select-none">❖</div>
            <div className="absolute bottom-4 right-4 text-amber-600 text-lg select-none">❖</div>

            {/* Watermark Logo */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
              <div className="text-9xl font-serif">☸</div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center text-center justify-between h-full space-y-4">
              {/* Institution Header */}
              <div className="space-y-1.5 flex flex-col items-center">
                <img
                  src="/assets/aistudio/image_e94e2d75.png"
                  alt="Logo Lamrimnesia"
                  className="h-10 sm:h-12 w-auto object-contain rounded-lg shadow-2xs mb-0.5"
                />
                <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-amber-700">
                  Yayasan Pelestarian dan Pengembangan Lamrim Nusantara
                </div>
                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  PUSAT EDUKASI & KELAS DHARMA A-AJAR
                </div>
                <div className="w-24 h-0.5 bg-amber-600/70 mx-auto my-1" />
              </div>

              {/* Certificate Main Title */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-slate-900 font-serif">
                  SERTIFIKAT KELULUSAN
                </h1>
                <div className="text-xs tracking-widest text-slate-400 font-mono">
                  {certNumber}
                </div>
              </div>

              {/* Presented To */}
              <div className="space-y-1 max-w-xl">
                <div className="text-xs italic text-slate-500 font-serif">
                  Diberikan dengan penuh rasa hormat dan sukacita kepada:
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-serif underline decoration-amber-500/60 decoration-2 underline-offset-8 py-1">
                  {activeRecipient}
                </div>
              </div>

              {/* Completion Statement */}
              <div className="space-y-1.5 max-w-2xl px-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Atas dedikasi, kehadiran penuh, dan keberhasilan menyelesaikan seluruh kurikulum pembelajaran Dharma pada program:
                </p>
                <div className="text-base sm:text-lg font-bold text-slate-900 py-1">
                  "{item.eventName || item.itemName}"
                </div>
                <div className="inline-block px-3 py-1 bg-amber-50 rounded-full border border-amber-300 text-xs font-semibold text-amber-900">
                  {predicate}
                </div>
              </div>

              {/* Bottom Signatures & Seal */}
              <div className="w-full pt-4 border-t border-slate-200/80 flex items-end justify-between px-4 sm:px-8 mt-2">
                {/* Left Signee: Facilitator */}
                <div className="text-center min-w-[150px]">
                  <div className="h-10 flex items-center justify-center italic text-xs font-serif text-slate-400">
                    (Tanda Tangan Digital)
                  </div>
                  <div className="pt-1 border-t border-slate-800 font-bold text-xs text-slate-900">
                    Bhadra Ksanti
                  </div>
                  <div className="text-[10px] text-slate-500">Fasilitator Utama A-AJAR</div>
                </div>

                {/* Center: QR Code Verification & Stempel */}
                <div className="flex flex-col items-center relative">
                  {includeSeal && (
                    <div className="w-16 h-16 rounded-full border-2 border-amber-600/80 text-amber-700 flex flex-col items-center justify-center p-1 text-[7px] font-bold text-center leading-tight mb-1 shadow-2xs rotate-[-5deg]">
                      <div className="text-[6px]">A-AJAR YPPLN</div>
                      <div className="text-[8px] font-black my-0.5">RESMI</div>
                      <div className="text-[6px]">TERVALIDASI</div>
                    </div>
                  )}

                  {qrDataUrl && (
                    <div className="flex items-center gap-1.5">
                      <img src={qrDataUrl} alt="QR Verifikasi" className="w-11 h-11 object-contain" />
                      <div className="text-[8px] text-slate-400 text-left font-mono">
                        <div>Verifikasi Resmi</div>
                        <div>SAPA-YPPLN</div>
                      </div>
                    </div>
                  )}
                  <div className="text-[9px] text-slate-400 mt-1">
                    Jakarta, {item.date}
                  </div>
                </div>

                {/* Right Signee: Director */}
                <div className="text-center min-w-[150px]">
                  <div className="h-10 flex items-center justify-center italic text-xs font-serif text-slate-400">
                    (Tanda Tangan Digital)
                  </div>
                  <div className="pt-1 border-t border-slate-800 font-bold text-xs text-slate-900">
                    Agustino Ong
                  </div>
                  <div className="text-[10px] text-slate-500">Direktur Edukasi Yayasan</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink ? 'Disalin' : 'Salin Detail'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kirim Ucapan via WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Cetak Sertifikat</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Membuat PDF...' : 'Unduh PDF (A4 Landscape)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
