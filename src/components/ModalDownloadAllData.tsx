import React, { useState } from 'react';
import {
  X,
  Download,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  CloudCheck,
  ShieldCheck,
  Layers,
  Calendar,
  Building2,
  Users,
  Wallet,
  BookOpen,
  FolderGit2,
  Receipt,
  HeartHandshake,
  GraduationCap,
} from 'lucide-react';
import {
  AllApplicationData,
  downloadAllDataAsJson,
  downloadAllDataAsCsv,
} from '../utils/exportAllDataHelper';

interface ModalDownloadAllDataProps {
  isOpen: boolean;
  onClose: () => void;
  allData: AllApplicationData;
  onShowToast?: (msg: string) => void;
}

export const ModalDownloadAllData: React.FC<ModalDownloadAllDataProps> = ({
  isOpen,
  onClose,
  allData,
  onShowToast,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'json' | 'csv' | null>(null);

  if (!isOpen) return null;

  const { metadata } = allData;
  const counts = metadata.counts;

  const handleDownloadJson = () => {
    try {
      setDownloadingFormat('json');
      const filename = downloadAllDataAsJson(allData);
      onShowToast?.(`File cadangan JSON "${filename}" berhasil diunduh!`);
      setTimeout(() => setDownloadingFormat(null), 800);
    } catch (e) {
      console.error('Failed to download JSON backup', e);
      setDownloadingFormat(null);
    }
  };

  const handleDownloadCsv = () => {
    try {
      setDownloadingFormat('csv');
      const filename = downloadAllDataAsCsv(allData);
      onShowToast?.(`File arsip CSV "${filename}" berhasil diunduh!`);
      setTimeout(() => setDownloadingFormat(null), 800);
    } catch (e) {
      console.error('Failed to download CSV backup', e);
      setDownloadingFormat(null);
    }
  };

  const modulesList = [
    { label: 'Proyek SAPA', count: counts.projects, icon: FolderGit2, color: 'text-teal-600 bg-teal-50' },
    { label: 'Relawan & Donatur', count: counts.identitas, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Mutasi Rekening Bank', count: counts.mutasiBank, icon: Wallet, color: 'text-amber-600 bg-amber-50' },
    { label: 'Transaksi S-SALUR', count: counts.transaksiSalur, icon: Receipt, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Transaksi D-DONASI', count: counts.transaksiDonasi, icon: HeartHandshake, color: 'text-rose-600 bg-rose-50' },
    { label: 'Transaksi A-AJAR', count: counts.transaksiAjar, icon: GraduationCap, color: 'text-purple-600 bg-purple-50' },
    { label: 'Pengeluaran Kas', count: counts.pengeluaran, icon: Receipt, color: 'text-red-600 bg-red-50' },
    { label: 'Pos Keuangan', count: counts.posKeuangan, icon: Wallet, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Chart of Accounts (COA)', count: counts.coaAccounts, icon: BookOpen, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Organisasi Mitra', count: counts.organisasi, icon: Building2, color: 'text-slate-600 bg-slate-100' },
    { label: 'To-Do Tasks', count: counts.todoTasks, icon: Layers, color: 'text-orange-600 bg-orange-50' },
    { label: 'Karyawan Yayasan', count: counts.karyawan, icon: Users, color: 'text-teal-700 bg-teal-50' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-3xl my-6 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#008993] to-[#05828e] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs shadow-2xs">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Unduh Semua Data (Full Backup)</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                  Arsip Sistem
                </span>
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Ekspor seluruh data operasional, transaksi, relawan, donasi, mutasi bank, dan COA YPPLN
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700">
          {/* Metadata Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#05828e] flex items-center justify-center shrink-0">
                <CloudCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-800">
                  {metadata.appName}
                </div>
                <div className="text-slate-500 mt-0.5">
                  Waktu Snapshot: <span className="font-medium text-slate-700">{metadata.exportedAtFormatted}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto">
              <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-[#05828e] font-bold">
                {metadata.totalRecords.toLocaleString('id-ID')} Total Entri
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200/70 text-slate-700 font-medium">
                12 Modul ERP
              </span>
            </div>
          </div>

          {/* Data Modules Grid Preview */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Rincian Modul yang Termasuk dalam Berkas Cadangan</span>
              <span className="text-[11px] text-teal-600 font-medium lowercase">semua data aktif</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
              {modulesList.map((m, idx) => {
                const IconComponent = m.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-teal-300 transition-colors flex items-center gap-2.5"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-slate-500 truncate">{m.label}</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 tabular-nums">
                        {(m.count || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Download Options Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Pilih Format Unduhan Cadangan
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: JSON Full Backup */}
              <div className="p-4 rounded-xl border-2 border-[#05828e] bg-teal-50/40 hover:bg-teal-50/70 transition-all flex flex-col justify-between space-y-3 relative">
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#05828e] text-white">
                    Rekomendasi
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#05828e] flex items-center justify-center">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">Format JSON (.json)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Struktur data komplit 100% mencakup seluruh objek, array item transaksi, relasi identitas, dan metadata untuk cadangan penuh dan migrasi sistem.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  disabled={downloadingFormat === 'json'}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#008993] hover:bg-[#00747c] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingFormat === 'json' ? 'Mengunduh...' : 'Unduh Cadangan JSON (.json)'}</span>
                </button>
              </div>

              {/* Option 2: Consolidated CSV Archive */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">Format CSV (.csv)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Arsip konsolidasi tabel data yang dipisah per bagian (Proyek, Identitas, Mutasi, Salur, Donasi, Ajar, Pengeluaran, Pos Keuangan, COA) untuk dibuka di Excel / Sheets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  disabled={downloadingFormat === 'csv'}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>{downloadingFormat === 'csv' ? 'Mengunduh...' : 'Unduh Format CSV (.csv)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security & Cloud Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">Keamanan & Penyimpanan Cloud:</span> Data Anda juga otomatis tersinkronisasi ke Google Cloud Firestore. Berkas cadangan ini berguna sebagai arsip mandiri di laptop/komputer untuk keperluan audit berkala atau pemulihan darurat offline.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Format file: UTF-8 Encoding (Kompatibel dengan Excel, LibreOffice, & Cloud)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
