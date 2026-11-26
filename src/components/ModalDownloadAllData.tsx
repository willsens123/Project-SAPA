import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  CloudCheck,
  ShieldCheck,
  Layers,
  Building2,
  Users,
  Wallet,
  BookOpen,
  FolderGit2,
  Receipt,
  HeartHandshake,
  GraduationCap,
  AlertTriangle,
  RefreshCw,
  GitMerge,
  Replace,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';
import {
  AllApplicationData,
  downloadAllDataAsJson,
  downloadAllDataAsCsv,
} from '../utils/exportAllDataHelper';
import {
  BackupModuleKey,
  ParsedBackupPreviewResult,
  RestoreBackupExecutionResult,
  RestoreBackupRequest,
  RestoreMode,
  parseBackupJsonAndPreview,
} from '../utils/restoreBackupHelper';

interface ModalDownloadAllDataProps {
  isOpen: boolean;
  onClose: () => void;
  allData: AllApplicationData;
  onShowToast?: (msg: string) => void;
  onRestoreBackup?: (
    req: RestoreBackupRequest
  ) => Promise<RestoreBackupExecutionResult> | RestoreBackupExecutionResult;
  canRestoreAccounts?: boolean;
}

export const ModalDownloadAllData: React.FC<ModalDownloadAllDataProps> = ({
  isOpen,
  onClose,
  allData,
  onShowToast,
  onRestoreBackup,
  canRestoreAccounts = false,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'restore'>('export');
  const [downloadingFormat, setDownloadingFormat] = useState<'json' | 'csv' | null>(null);

  // Restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewResult, setPreviewResult] = useState<ParsedBackupPreviewResult | null>(null);
  const [selectedModules, setSelectedModules] = useState<Set<BackupModuleKey>>(new Set());
  const [restoreMode, setRestoreMode] = useState<RestoreMode>('merge');
  const [confirmOverwriteChecked, setConfirmOverwriteChecked] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [executionResult, setExecutionResult] = useState<RestoreBackupExecutionResult | null>(null);

  const selectedModuleList = useMemo(() => Array.from(selectedModules), [selectedModules]);

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

  const resetRestoreState = () => {
    setPreviewResult(null);
    setSelectedModules(new Set());
    setConfirmOverwriteChecked(false);
    setExecutionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processSelectedFile = async (file: File) => {
    setExecutionResult(null);
    setConfirmOverwriteChecked(false);
    try {
      const text = await file.text();
      const parsedPreview = parseBackupJsonAndPreview(text, file.name, allData);
      setPreviewResult(parsedPreview);
      if (parsedPreview.valid) {
        const defaultSelected = new Set<BackupModuleKey>();
        parsedPreview.modules.forEach((m) => {
          if (m.backupCount > 0 && (!m.isSensitiveAccount || canRestoreAccounts)) {
            defaultSelected.add(m.key);
          }
        });
        setSelectedModules(defaultSelected);
      } else {
        setSelectedModules(new Set());
      }
    } catch {
      setPreviewResult({
        valid: false,
        error: 'Gagal membaca berkas dari perangkat Anda.',
        fileName: file.name,
        metadata: {
          appName: '-',
          version: '-',
          exportedAtFormatted: '-',
          exportedBy: '-',
          totalBackupRecords: 0,
        },
        modules: [],
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const toggleModule = (key: BackupModuleKey, isSensitive?: boolean) => {
    if (isSensitive && !canRestoreAccounts) return;
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSelectAllModules = () => {
    if (!previewResult?.valid) return;
    const next = new Set<BackupModuleKey>();
    previewResult.modules.forEach((m) => {
      if (!m.isSensitiveAccount || canRestoreAccounts) {
        next.add(m.key);
      }
    });
    setSelectedModules(next);
  };

  const handleSelectNonEmptyModules = () => {
    if (!previewResult?.valid) return;
    const next = new Set<BackupModuleKey>();
    previewResult.modules.forEach((m) => {
      if (m.backupCount > 0 && (!m.isSensitiveAccount || canRestoreAccounts)) {
        next.add(m.key);
      }
    });
    setSelectedModules(next);
  };

  const handleClearSelection = () => {
    setSelectedModules(new Set());
  };

  const handleExecuteRestore = async () => {
    if (!onRestoreBackup || !previewResult?.valid || !previewResult.parsedData) return;
    if (selectedModuleList.length === 0) {
      onShowToast?.('Pilih minimal 1 modul untuk dipulihkan.');
      return;
    }
    if (restoreMode === 'overwrite' && !confirmOverwriteChecked) {
      onShowToast?.('Centang konfirmasi penimpaan data terlebih dahulu.');
      return;
    }

    setIsRestoring(true);
    try {
      const res = await onRestoreBackup({
        fileName: previewResult.fileName,
        mode: restoreMode,
        selectedModules: selectedModuleList,
        parsedData: previewResult.parsedData,
      });
      setExecutionResult(res);
      if (res.success) {
        onShowToast?.(
          `Pemulihan selesai (${res.restoredModuleCount} modul). Snapshot lama disimpan ke "${res.autoBackupFilename}".`
        );
      } else if (res.error) {
        onShowToast?.(`Gagal memulihkan data: ${res.error}`);
      }
    } catch (err) {
      console.error('Restore failed:', err);
      setExecutionResult({
        success: false,
        autoBackupFilename: '',
        restoredModuleCount: 0,
        totalRestoredRecords: 0,
        cloudSynced: false,
        mode: restoreMode,
        restoredLabels: [],
        error: 'Terjadi kesalahan saat menerapkan pemulihan data.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const modulesList = [
    { label: 'Proyek SAPA', count: counts.projects, icon: FolderGit2, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60' },
    { label: 'Relawan & Donatur', count: counts.identitas, icon: Users, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
    { label: 'Mutasi Rekening Bank', count: counts.mutasiBank, icon: Wallet, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
    { label: 'Transaksi S-SALUR', count: counts.transaksiSalur, icon: Receipt, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' },
    { label: 'Transaksi D-DONASI', count: counts.transaksiDonasi, icon: HeartHandshake, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' },
    { label: 'Transaksi A-AJAR', count: counts.transaksiAjar, icon: GraduationCap, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60' },
    { label: 'Pengeluaran Kas', count: counts.pengeluaran, icon: Receipt, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60' },
    { label: 'Pos Keuangan', count: counts.posKeuangan, icon: Wallet, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' },
    { label: 'Chart of Accounts (COA)', count: counts.coaAccounts, icon: BookOpen, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60' },
    { label: 'Organisasi Mitra', count: counts.organisasi, icon: Building2, color: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800' },
    { label: 'To-Do Tasks', count: counts.todoTasks, icon: Layers, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60' },
    { label: 'Karyawan Yayasan', count: counts.karyawan, icon: Users, color: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60' },
  ];

  const categoriesOrder: Array<
    'Proyek & Tugas' | 'Relawan & HR' | 'Keuangan & Akuntansi' | 'S-SALUR & Gudang' | 'Layanan & PM'
  > = ['Proyek & Tugas', 'Relawan & HR', 'Keuangan & Akuntansi', 'S-SALUR & Gudang', 'Layanan & PM'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 w-full max-w-4xl my-6 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 max-h-[92vh]"
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
                <span>Backup & Restore Data ERP</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                  JSON / CSV + Cloud Sync
                </span>
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Cadangkan seluruh data sistem atau pulihkan file backup JSON dengan pratinjau modul & auto-backup pengaman
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

        {/* Mode Switch Tabs */}
        <div className="px-5 sm:px-6 pt-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            id="tab-backup-export"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'border-[#008993] text-[#008993] dark:text-teal-300 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan (Backup)</span>
          </button>

          {onRestoreBackup && (
            <button
              type="button"
              id="tab-backup-restore"
              onClick={() => setActiveTab('restore')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'restore'
                  ? 'border-[#008993] text-[#008993] dark:text-teal-300 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Pulihkan Data JSON (Restore)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300">
          {activeTab === 'export' ? (
            <>
              {/* Metadata Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-[#05828e] dark:text-teal-300 flex items-center justify-center shrink-0">
                    <CloudCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {metadata.appName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Waktu Snapshot:{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {metadata.exportedAtFormatted}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-[#05828e] dark:text-teal-300 font-bold">
                    {metadata.totalRecords.toLocaleString('id-ID')} Total Entri
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                    Semua Modul ERP
                  </span>
                </div>
              </div>

              {/* Data Modules Grid Preview */}
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Rincian Modul yang Termasuk dalam Berkas Cadangan</span>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium lowercase">
                    termasuk stok & gudang s-salur
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                  {modulesList.map((m, idx) => {
                    const IconComponent = m.icon;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-teal-300 dark:hover:border-teal-600 transition-colors flex items-center gap-2.5"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {m.label}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                            {(m.count || 0).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Download Options Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Pilih Format Unduhan Cadangan
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl border-2 border-[#05828e] dark:border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 hover:bg-teal-50/70 dark:hover:bg-teal-950/50 transition-all flex flex-col justify-between space-y-3 relative">
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#05828e] text-white">
                        Rekomendasi
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-[#05828e] dark:text-teal-300 flex items-center justify-center">
                          <FileJson className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Format JSON (.json)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Struktur data komplit 100% mencakup seluruh modul, stok gudang, relasi identitas, dan metadata. Dapat dipulihkan kembali lewat tab Restore JSON.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      disabled={downloadingFormat === 'json'}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#008993] hover:bg-[#00747c] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {downloadingFormat === 'json' ? 'Mengunduh...' : 'Unduh Cadangan JSON (.json)'}
                      </span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50/60 dark:hover:bg-slate-800 transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Format CSV (.csv)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Arsip konsolidasi tabel data yang dipisah per bagian untuk dibuka di Excel atau Google Sheets.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      disabled={downloadingFormat === 'csv'}
                      className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {downloadingFormat === 'csv' ? 'Mengunduh...' : 'Unduh Format CSV (.csv)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Security & Cloud Note */}
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Keamanan & Penyimpanan Cloud:</span> Data Anda otomatis tersinkronisasi ke Google Cloud Firestore. Berkas cadangan JSON ini dapat diunggah ulang di tab{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('restore')}
                    className="underline font-semibold cursor-pointer"
                  >
                    Pulihkan Data JSON
                  </button>{' '}
                  kapan saja.
                </div>
              </div>
            </>
          ) : (
            /* TAB: RESTORE JSON */
            <div className="space-y-4">
              {/* Step 1: Upload / Dropzone */}
              {!previewResult && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDropFile}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-[#008993] bg-teal-50/60 dark:bg-teal-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-[#008993] hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#008993] dark:text-teal-300 flex items-center justify-center">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Pilih atau Tarik File Backup JSON (.json) ke Sini
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sistem akan menampilkan pratinjau lengkap isi file sebelum mengubah data apa pun.
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-[#008993] text-white text-xs font-semibold">
                    Pilih Berkas JSON
                  </span>
                </div>
              )}

              {/* Validation Error */}
              {previewResult && !previewResult.valid && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">File "{previewResult.fileName}" tidak dapat dipulihkan</div>
                      <p className="mt-0.5">{previewResult.error}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetRestoreState}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700 text-xs font-semibold text-rose-700 dark:text-rose-200 cursor-pointer shrink-0"
                  >
                    Pilih File Lain
                  </button>
                </div>
              )}

              {/* Execution Result Banner */}
              {executionResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                    executionResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  }`}
                >
                  {executionResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    {executionResult.success ? (
                      <>
                        <div className="font-bold text-sm">
                          Pemulihan Berhasil ({executionResult.mode === 'merge' ? 'Mode Merge' : 'Mode Timpa'})
                        </div>
                        <p>
                          <strong>{executionResult.restoredModuleCount} modul</strong> ({executionResult.totalRestoredRecords.toLocaleString('id-ID')} entri) telah diterapkan dan{' '}
                          <strong>{executionResult.cloudSynced ? 'disinkronkan ke Cloud Firestore' : 'disimpan secara lokal'}</strong>.
                        </p>
                        {executionResult.autoBackupFilename && (
                          <p className="text-[11px] opacity-90">
                            Auto-backup kondisi sebelum pemulihan telah diunduh otomatis: <code className="font-semibold">{executionResult.autoBackupFilename}</code>
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-bold">Pemulihan Gagal</div>
                        <p>{executionResult.error}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Valid Preview + Module Checkboxes + Mode Selection */}
              {previewResult?.valid && (
                <>
                  {/* File Metadata Header */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-[#008993] dark:text-teal-300 flex items-center justify-center shrink-0">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div className="text-xs min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {previewResult.fileName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>Snapshot: <strong className="text-slate-700 dark:text-slate-200">{previewResult.metadata.exportedAtFormatted}</strong></span>
                          <span>Oleh: <strong className="text-slate-700 dark:text-slate-200">{previewResult.metadata.exportedBy}</strong></span>
                          <span>Total: <strong className="text-[#008993] dark:text-teal-300">{previewResult.metadata.totalBackupRecords.toLocaleString('id-ID')} entri</strong></span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetRestoreState}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      Ganti File
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      1. Pilih Cara Pemulihan Data
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRestoreMode('merge');
                          setConfirmOverwriteChecked(false);
                        }}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          restoreMode === 'merge'
                            ? 'border-[#008993] bg-teal-50/50 dark:bg-teal-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-[#008993] dark:text-teal-300 flex items-center justify-center shrink-0">
                          <GitMerge className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                              Merge / Gabungkan (Aman)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#008993] text-white">
                              Rekomendasi
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            Menambah data baru dan memperbarui entri dengan ID sama tanpa menghapus data lain yang sudah ada.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRestoreMode('overwrite')}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          restoreMode === 'overwrite'
                            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                          <Replace className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                            Timpa Modul Terpilih (Overwrite)
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            Mengganti penuh seluruh isi modul yang dicentang sesuai file backup. Modul lain tetap utuh.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Module Selection Preview */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        2. Pratinjau & Pilih Modul ({selectedModuleList.length} / {previewResult.modules.length} terpilih)
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={handleSelectNonEmptyModules}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#008993] dark:text-teal-300 font-semibold hover:bg-teal-100 cursor-pointer"
                        >
                          Yang Berisi Data
                        </button>
                        <button
                          type="button"
                          onClick={handleSelectAllModules}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 cursor-pointer"
                        >
                          Pilih Semua
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-200 cursor-pointer"
                        >
                          Kosongkan
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200/80 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                      {categoriesOrder.map((cat) => {
                        const catModules = previewResult.modules.filter((m) => m.category === cat);
                        if (catModules.length === 0) return null;
                        return (
                          <div key={cat} className="p-3 space-y-2">
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {cat}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {catModules.map((mod) => {
                                const isChecked = selectedModules.has(mod.key);
                                const isLocked = Boolean(mod.isSensitiveAccount && !canRestoreAccounts);
                                return (
                                  <button
                                    key={mod.key}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => toggleModule(mod.key, mod.isSensitiveAccount)}
                                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                                      isLocked
                                        ? 'border-slate-200/60 bg-slate-50 dark:bg-slate-800/30 opacity-60 cursor-not-allowed'
                                        : isChecked
                                        ? 'border-[#008993] bg-teal-50/40 dark:bg-teal-950/30 cursor-pointer'
                                        : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300 cursor-pointer'
                                    }`}
                                  >
                                    <div className="mt-0.5 text-[#008993] dark:text-teal-400 shrink-0">
                                      {isLocked ? (
                                        <Lock className="w-4 h-4 text-slate-400" />
                                      ) : isChecked ? (
                                        <CheckSquare className="w-4 h-4" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                          {mod.label}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span>Saat ini: {mod.currentCount}</span>
                                        <span>•</span>
                                        <span>Backup: {mod.backupCount}</span>
                                        {restoreMode === 'merge' ? (
                                          <span className="text-[#008993] dark:text-teal-300 font-semibold">
                                            (+{mod.newInMergeCount} baru, {mod.updatedInMergeCount} update)
                                          </span>
                                        ) : (
                                          <span className="text-amber-700 dark:text-amber-300 font-semibold">
                                            (Timpa → {mod.backupCount})
                                          </span>
                                        )}
                                      </div>
                                      {isLocked && (
                                        <div className="text-[10px] text-rose-600 mt-0.5">
                                          Butuh izin Kelola Akun & Role untuk memulihkan akun karyawan.
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Auto-Backup + Cloud Sync Safety Banner */}
                  <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 rounded-xl flex items-start gap-2.5 text-xs text-teal-900 dark:text-teal-100">
                    <ShieldCheck className="w-4 h-4 text-[#008993] dark:text-teal-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-semibold">Auto-Backup & Cloud Sync Aktif:</span> Sebelum memulihkan, sistem otomatis mengunduh cadangan kondisi data saat ini (<code>YPPLN_AutoBackup_Sebelum_Restore_...json</code>) lalu langsung menyinkronkan data hasil pemulihan ke Cloud Firestore.
                    </div>
                  </div>

                  {/* Extra confirmation when overwrite */}
                  {restoreMode === 'overwrite' && (
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmOverwriteChecked}
                        onChange={(e) => setConfirmOverwriteChecked(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 rounded"
                      />
                      <span className="font-semibold">
                        Saya mengerti bahwa data pada {selectedModuleList.length} modul terpilih akan ditimpa oleh isi file backup (auto-backup kondisi sekarang tetap diunduh lebih dulu).
                      </span>
                    </label>
                  )}

                  {/* Execute Button */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={resetRestoreState}
                      disabled={isRestoring}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Batal File
                    </button>
                    <button
                      type="button"
                      id="btn-execute-restore-backup"
                      onClick={() => void handleExecuteRestore()}
                      disabled={
                        isRestoring ||
                        selectedModuleList.length === 0 ||
                        (restoreMode === 'overwrite' && !confirmOverwriteChecked)
                      }
                      className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        restoreMode === 'overwrite'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-[#008993] hover:bg-[#00747c]'
                      }`}
                    >
                      {isRestoring ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Membuat Auto-Backup & Memulihkan...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>
                            Auto-Backup & Pulihkan ({selectedModuleList.length} Modul)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Format file: UTF-8 JSON / CSV (Kompatibel Excel & Google Cloud Firestore)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
