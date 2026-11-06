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
import { TransaksiAjarItem } from '../transaksiAjarData';

interface ModalInvoiceAjarProps {
  isOpen: boolean;
  item: TransaksiAjarItem | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const STORAGE_CUSTOM_TEMPLATE = 'yppln_custom_invoice_ajar_template_bg';

export const ModalInvoiceAjar: React.FC<ModalInvoiceAjarProps> = ({
  isOpen,
  item,
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

    if (!file.type.startsWith('image/')) {
      onShowToast('Mohon pilih file gambar (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomTemplateBg(base64);
      try {
        localStorage.setItem(STORAGE_CUSTOM_TEMPLATE, base64);
        onShowToast('Template background invoice A-AJAR berhasil diperbarui');
      } catch (err) {
        console.error('Storage quota exceeded:', err);
        onShowToast('Gagal menyimpan ke penyimpanan lokal (ukuran file terlalu besar)');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetTemplate = () => {
    setCustomTemplateBg(null);
    try {
      localStorage.removeItem(STORAGE_CUSTOM_TEMPLATE);
      onShowToast('Template background invoice A-AJAR direset ke default');
    } catch {
      // ignore
    }
  };

  // Calculations for items & pricing
  const { invoiceItems, totalNum, formattedDate, invoiceNumber } = useMemo(() => {
    if (!item) {
      return {
        invoiceItems: [],
        totalNum: 0,
        formattedDate: '14.11.2021',
        invoiceNumber: '01234',
      };
    }

    const rows: { name: string; qtyPrice: string; nominal: number }[] = [];
    
    // Parse primary item price
    const match = item.qtyPrice.match(/(\d+)\s*x\s*Rp([\d.,]+)/i);
    const qty = match ? parseInt(match[1], 10) : 1;
    const price = match ? parseInt(match[2].replace(/[.,]/g, ''), 10) : 1200000;
    rows.push({
      name: item.itemName,
      qtyPrice: item.qtyPrice,
      nominal: qty * price,
    });

    if (item.otherProducts) {
      item.otherProducts.forEach((p) => {
        const subMatch = p.qtyPrice.match(/(\d+)\s*x\s*Rp([\d.,]+)/i);
        const subQty = subMatch ? parseInt(subMatch[1], 10) : 1;
        const subPrice = subMatch ? parseInt(subMatch[2].replace(/[.,]/g, ''), 10) : 500000;
        rows.push({
          name: p.name,
          qtyPrice: p.qtyPrice,
          nominal: subQty * subPrice,
        });
      });
    }

    // Parse total
    const totMatch = item.totalDana.replace(/[^0-9]/g, '');
    const calcTotal = totMatch ? parseInt(totMatch, 10) : rows.reduce((s, r) => s + r.nominal, 0);

    return {
      invoiceItems: rows,
      totalNum: calcTotal,
      formattedDate: item.date || '14.11.2021',
      invoiceNumber: item.orderNumber?.replace(/[^0-9]/g, '').slice(-5) || item.orderNumber || '01234',
    };
  }, [item]);

  const recipientName = item?.customerId || 'Peserta A-AJAR';
  const eventTitle = item?.eventName || 'A-AJAR Event';

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
      link.download = `Invoice-A-AJAR-${item?.orderNumber || invoiceNumber}.png`;
      link.click();
      onShowToast(`Invoice ${item?.orderNumber || invoiceNumber} berhasil diunduh!`);
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('Gagal mengunduh invoice. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Copy Link / Info Handler
  const handleCopy = () => {
    const summaryText = `*INVOICE TRANSAKSI A-AJAR*\nNo. Invoice: #${invoiceNumber}\nOrder: ${item?.orderNumber}\nAcara: ${eventTitle}\nPeserta: ${recipientName}\nTotal Dana: ${item?.totalDana}\nStatus: Lunas\n\nTerima kasih atas partisipasi Anda!`;
    navigator.clipboard.writeText(summaryText);
    setCopiedState(true);
    onShowToast('Rincian invoice berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedState(false), 2500);
  };

  // 3. Send Handlers
  const handleSendWhatsApp = () => {
    setIsSendMenuOpen(false);
    const text = encodeURIComponent(
      `Halo Kak ${recipientName}, berikut kami kirimkan rincian invoice partisipasi ${eventTitle} (No. #${invoiceNumber}) sebesar ${item?.totalDana}. Terima kasih banyak!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    onShowToast('Membuka WhatsApp untuk mengirim invoice...');
  };

  const handleSendEmail = () => {
    setIsSendMenuOpen(false);
    const subject = encodeURIComponent(`Invoice Partisipasi A-AJAR #${invoiceNumber} - ${eventTitle}`);
    const body = encodeURIComponent(
      `Halo ${recipientName},\n\nBerikut rincian invoice partisipasi Anda:\nNomor: #${invoiceNumber}\nAcara: ${eventTitle}\nTotal Dana: ${item?.totalDana}\n\nTerima kasih!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    onShowToast('Membuka email client untuk mengirim invoice...');
  };

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#008d91] flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Invoice Transaksi A-AJAR
              </h2>
              <p className="text-xs text-slate-500">
                {item.orderNumber} • {eventTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Template upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadTemplate}
              accept="image/*"
              className="hidden"
            />
            {customTemplateBg ? (
              <button
                type="button"
                onClick={handleResetTemplate}
                title="Reset template background"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload template background kustom"
                className="p-2 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Kustom Background</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Canvas Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 flex justify-center">
          <div
            ref={invoiceRef}
            className="w-full max-w-[620px] bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
            style={{
              minHeight: '680px',
              backgroundImage: customTemplateBg ? `url(${customTemplateBg})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top Brand & Title */}
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
                    INVOICE
                  </h1>
                  <span className="text-xs font-semibold text-[#008d91] uppercase tracking-wider mt-0.5 inline-block">
                    A-AJAR • Program Pembelajaran
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Nomor Invoice</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-slate-800">
                    #{invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{formattedDate}</div>
                </div>
              </div>

              {/* Details & Event Header */}
              <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Ditagihkan Kepada:</span>
                  <div className="font-bold text-slate-800 text-sm">{recipientName}</div>
                  <div className="text-slate-600 mt-0.5">{item.keterangan || 'Peserta Terdaftar'}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium block mb-1">Nama Acara / Kegiatan:</span>
                  <div className="font-bold text-slate-800 text-sm text-[#008d91]">{eventTitle}</div>
                  <div className="text-slate-500 mt-0.5">Order: {item.orderNumber}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="pt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-2">Item / Paket</th>
                      <th className="py-2 text-center">Rincian</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-semibold text-slate-800">{it.name}</td>
                        <td className="py-3 text-center text-slate-600">{it.qtyPrice}</td>
                        <td className="py-3 text-right font-bold text-slate-800 font-mono">
                          Rp{it.nominal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    {item.donasiExtra && (
                      <tr>
                        <td className="py-3 font-medium text-[#008d91]">Tambahan Donasi</td>
                        <td className="py-3 text-center text-slate-400">-</td>
                        <td className="py-3 text-right font-bold text-[#008d91] font-mono">
                          {item.donasiExtra.replace(/[^0-9]/g, '') ? `Rp${parseInt(item.donasiExtra.replace(/[^0-9]/g, ''), 10).toLocaleString('id-ID')}` : item.donasiExtra}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Dana Bottom Box */}
            <div className="pt-6 border-t border-slate-100 mt-8">
              <div className="bg-[#e9ecef] rounded-xl py-3 px-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total Dana</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {item.totalDana || `Rp${totalNum.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>Status: Terbayar (Lunas)</span>
                <span>Terima kasih atas partisipasi Anda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            {copiedState ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Salin Rincian</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5 relative">
            {/* Send Menu Dropdown */}
            {isSendMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Kirim WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Kirim Email</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSendMenuOpen(!isSendMenuOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-500" />
              <span>Kirim Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#007074] shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Memproses...' : 'Unduh Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
