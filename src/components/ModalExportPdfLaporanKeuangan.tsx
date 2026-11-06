import React, { useState } from 'react';
import {
  FileText,
  X,
  Download,
  Check,
  Layers,
  Landmark,
  Receipt,
  Scale,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  generateFinancialReportPdf,
  FinancialReportPdfData,
  ExportPdfOptions,
} from '../utils/exportFinancialPdf';

interface ModalExportPdfLaporanKeuanganProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: FinancialReportPdfData;
  onShowToast: (msg: string) => void;
  initialPrivacyMasked?: boolean;
}

export const ModalExportPdfLaporanKeuangan: React.FC<ModalExportPdfLaporanKeuanganProps> = ({
  isOpen,
  onClose,
  reportData,
  onShowToast,
  initialPrivacyMasked = false,
}) => {
  const [includeArusKas, setIncludeArusKas] = useState(true);
  const [includePosKeuangan, setIncludePosKeuangan] = useState(true);
  const [includeJurnalUmum, setIncludeJurnalUmum] = useState(true);
  const [journalLimit, setJournalLimit] = useState<number>(60);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(initialPrivacyMasked);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printedBy, setPrintedBy] = useState('Divisi Keuangan & Akuntansi YPPLN');

  if (!isOpen) return null;

  const handleExport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const options: ExportPdfOptions = {
          includeArusKas,
          includePosKeuangan,
          includeJurnalUmum,
          journalLimit,
          filterSource,
          isPrivacyMasked,
        };

        generateFinancialReportPdf(
          {
            ...reportData,
            printedBy,
          },
          options
        );

        onShowToast('Laporan Keuangan PDF berhasil diunduh');
        onClose();
      } catch (err) {
        console.error('Error generating PDF:', err);
        onShowToast('Gagal membuat file PDF. Silakan coba lagi.');
      } finally {
        setIsGenerating(false);
      }
    }, 200);
  };

  const formatRp = (num: number) => {
    if (isPrivacyMasked) return 'Rp ••••••••';
    if (!num) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Ekspor Laporan Keuangan ke PDF
              </h3>
              <p className="text-xs text-teal-200/80 mt-0.5">
                Format standar A4 mencakup Arus Kas, Pos Keuangan & Jurnal Umum
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Executive Preview Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
              Ringkasan Data yang Akan Dicetak
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Total Aktiva</span>
                <span className="font-bold text-slate-800 text-xs">
                  {formatRp(reportData.coaTotals.totalAktiva)}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Surplus Bersih</span>
                <span className="font-bold text-emerald-600 text-xs">
                  {formatRp(reportData.coaTotals.surplusDefisit)}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Total Rekening</span>
                <span className="font-bold text-teal-700 text-xs">
                  {reportData.bankBalances.length} Akun Kas
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Jurnal Umum</span>
                <span className="font-bold text-indigo-700 text-xs">
                  {reportData.journalEntries.length} Entri
                </span>
              </div>
            </div>
          </div>

          {/* Section Selection Checkboxes */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">
              Pilih Komponen Laporan yang Disertakan:
            </label>
            <div className="space-y-2.5">
              {/* Option 1: Arus Kas */}
              <label
                onClick={() => setIncludeArusKas(!includeArusKas)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  includeArusKas
                    ? 'bg-teal-50/60 border-teal-300 text-teal-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      includeArusKas
                        ? 'bg-[#05828e] border-[#05828e] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {includeArusKas && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-800">
                      1. Ringkasan Arus Kas & Persamaan Akuntansi
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Penerimaan donasi, salur, ajar, beban program & operasional, kas bersih
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-teal-600 shrink-0 ml-2" />
              </label>

              {/* Option 2: Pos Keuangan & Saldo Rekening */}
              <label
                onClick={() => setIncludePosKeuangan(!includePosKeuangan)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  includePosKeuangan
                    ? 'bg-teal-50/60 border-teal-300 text-teal-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      includePosKeuangan
                        ? 'bg-[#05828e] border-[#05828e] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {includePosKeuangan && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-800">
                      2. Posisi Pos Keuangan & Saldo Rekening Bank Saat Ini
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Saldo kas BCA, Mandiri, kas tunai, deposito berjangka & kategori dana
                    </span>
                  </div>
                </div>
                <Landmark className="w-4 h-4 text-teal-600 shrink-0 ml-2" />
              </label>

              {/* Option 3: Jurnal Umum */}
              <label
                onClick={() => setIncludeJurnalUmum(!includeJurnalUmum)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  includeJurnalUmum
                    ? 'bg-teal-50/60 border-teal-300 text-teal-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      includeJurnalUmum
                        ? 'bg-[#05828e] border-[#05828e] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {includeJurnalUmum && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-800">
                      3. Jurnal Umum Otomatis & Rekonsiliasi Audit
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Daftar entri jurnal berpasangan dari Mutasi, S-SALUR, D-DONASI, A-AJAR
                    </span>
                  </div>
                </div>
                <Receipt className="w-4 h-4 text-teal-600 shrink-0 ml-2" />
              </label>
            </div>
          </div>

          {/* Jurnal Filtering & Pagination Settings */}
          {includeJurnalUmum && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Pengaturan Jurnal Umum pada PDF:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Filter Sumber Transaksi:
                  </label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#05828e]"
                  >
                    <option value="ALL">Semua Sumber ({reportData.journalEntries.length})</option>
                    <option value="mutasiBank">Mutasi Bank ({reportData.journalSourceStats.mutasiBank.count})</option>
                    <option value="salur">S-SALUR ({reportData.journalSourceStats.salur.count})</option>
                    <option value="donasi">D-DONASI ({reportData.journalSourceStats.donasi.count})</option>
                    <option value="ajar">A-AJAR ({reportData.journalSourceStats.ajar.count})</option>
                    <option value="pengeluaran">Pengeluaran ({reportData.journalSourceStats.pengeluaran.count})</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Batas Entri Jurnal Dicetak:
                  </label>
                  <select
                    value={journalLimit}
                    onChange={(e) => setJournalLimit(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#05828e]"
                  >
                    <option value={30}>30 Entri Terkini (~2-3 Halaman)</option>
                    <option value={60}>60 Entri Terkini (~4-5 Halaman) - Rekomendasi</option>
                    <option value={100}>100 Entri Terkini (~7-8 Halaman)</option>
                    <option value={999}>Cetak Semua Entri ({reportData.journalEntries.length})</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Dicetak Oleh / Penanggung Jawab:
              </label>
              <input
                type="text"
                value={printedBy}
                onChange={(e) => setPrintedBy(e.target.value)}
                placeholder="Nama bagian atau staf..."
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-[#05828e]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Mode Privasi / Masking Nominal:
              </label>
              <button
                type="button"
                onClick={() => setIsPrivacyMasked(!isPrivacyMasked)}
                className={`w-full text-xs border rounded-lg px-3 py-1.5 font-medium flex items-center justify-between cursor-pointer transition-colors ${
                  isPrivacyMasked
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{isPrivacyMasked ? 'Nominal Disamarkan (••••)' : 'Tampilkan Nominal Asli'}</span>
                {isPrivacyMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isGenerating || (!includeArusKas && !includePosKeuangan && !includeJurnalUmum)}
            className="px-5 py-2 text-xs font-bold text-white bg-[#05828e] hover:bg-[#046e78] rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Menyiapkan PDF...' : 'Unduh Laporan PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
