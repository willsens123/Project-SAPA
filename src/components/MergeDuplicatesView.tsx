import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowLeftRight,
  SlidersHorizontal,
  Search,
  GitMerge,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
  Pencil,
  FileDown,
  FileText,
} from 'lucide-react';
import { IdentitasItem } from '../identitasData';
import { DuplicatePair, MergeSessionRecord } from '../types';
import { generateMergeSummaryPdf } from '../utils/exportMergeSummaryPdf';

interface MergeDuplicatesViewProps {
  pairs: DuplicatePair[];
  totalIdentitasCount?: number;
  totalDuplicateRecordsCount: number;
  similarityThreshold?: number;
  dismissedCount?: number;
  sessionRecords?: MergeSessionRecord[];
  sessionStartedAt?: string;
  adminName?: string;
  adminEmail?: string;
  canMerge?: boolean;
  canUndoMerge?: boolean;
  onUndoMerge?: (mergeRecordId: string) => void;
  onChangeThreshold?: (nextThreshold: number) => void;
  onResetDismissedPairs?: () => void;
  onResetSession?: () => void;
  onShowToast?: (msg: string) => void;
  onBack: () => void;
  onMergePair: (
    pair: DuplicatePair,
    customMergedItem?: IdentitasItem,
    primaryItemId?: string
  ) => void;
  onMergeAll: (targetPairs?: DuplicatePair[]) => void;
  onDismissPair: (pairId: string) => void;
  onEditItem: (item: IdentitasItem) => void;
}

type FilterMode = 'all' | 'fuzzy' | 'exact';

type MergeableFieldKey =
  | 'namaLengkap'
  | 'namaPanggilan'
  | 'nomorHandPhone'
  | 'email'
  | 'kota'
  | 'organisasi'
  | 'status'
  | 'custDuration'
  | 'pekerjaan'
  | 'pic';

interface MergeFieldConfig {
  key: MergeableFieldKey;
  label: string;
  allowCombine?: boolean;
}

const MERGEABLE_FIELDS: MergeFieldConfig[] = [
  { key: 'namaLengkap', label: 'Nama Lengkap' },
  { key: 'namaPanggilan', label: 'Nama Panggilan' },
  { key: 'nomorHandPhone', label: 'Nomor HandPhone' },
  { key: 'email', label: 'Email' },
  { key: 'kota', label: 'Kota / Wilayah' },
  { key: 'organisasi', label: 'Organisasi', allowCombine: true },
  { key: 'status', label: 'Status' },
  { key: 'custDuration', label: 'Durasi Pelanggan' },
  { key: 'pekerjaan', label: 'Pekerjaan' },
  { key: 'pic', label: 'PIC' },
];

const THRESHOLD_OPTIONS = [
  { value: 80, label: '> 80% (Rekomendasi)' },
  { value: 85, label: '>= 85%' },
  { value: 90, label: '>= 90%' },
  { value: 95, label: '>= 95%' },
];

const isFilled = (val?: string): boolean => {
  const v = (val || '').trim();
  return v.length > 0 && v !== '-';
};

const combineOrgValues = (v1?: string, v2?: string): string => {
  const parts1 = (v1 || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s !== '-');
  const parts2 = (v2 || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s !== '-');
  const merged = Array.from(new Set([...parts1, ...parts2]));
  return merged.length > 0 ? merged.join(', ') : '-';
};

export const MergeDuplicatesView: React.FC<MergeDuplicatesViewProps> = ({
  pairs,
  totalIdentitasCount = 0,
  totalDuplicateRecordsCount,
  similarityThreshold = 80,
  dismissedCount = 0,
  sessionRecords = [],
  sessionStartedAt = new Date().toISOString(),
  adminName = 'Admin Identitas YPPLN',
  adminEmail = '-',
  canMerge = true,
  canUndoMerge = true,
  onUndoMerge,
  onChangeThreshold,
  onResetDismissedPairs,
  onResetSession,
  onShowToast,
  onBack,
  onMergePair,
  onMergeAll,
  onDismissPair,
  onEditItem,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [swappedPairs, setSwappedPairs] = useState<Record<string, boolean>>({});
  const [resolvingPair, setResolvingPair] = useState<DuplicatePair | null>(null);
  const [confirmMergeAllOpen, setConfirmMergeAllOpen] = useState(false);
  const [pendingRollbackRecord, setPendingRollbackRecord] = useState<MergeSessionRecord | null>(
    null
  );
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Field choices in Smart Merge Resolver: 'primary' | 'secondary' | 'combine'
  const [fieldChoices, setFieldChoices] = useState<
    Record<MergeableFieldKey, 'primary' | 'secondary' | 'combine'>
  >({
    namaLengkap: 'primary',
    namaPanggilan: 'primary',
    nomorHandPhone: 'primary',
    email: 'primary',
    kota: 'primary',
    organisasi: 'combine',
    status: 'primary',
    custDuration: 'primary',
    pekerjaan: 'primary',
    pic: 'primary',
  });
  const [resolverUseSecondPrimary, setResolverUseSecondPrimary] = useState(false);

  const exactCount = useMemo(
    () => pairs.filter((p) => (p.matchType ?? 'exact') === 'exact').length,
    [pairs]
  );

  const fuzzyCount = useMemo(
    () => pairs.filter((p) => p.matchType === 'fuzzy').length,
    [pairs]
  );

  const sessionStats = useMemo(() => {
    return sessionRecords.reduce(
      (acc, r) => {
        if (r.isRolledBack) {
          acc.rolledBackCount += 1;
        }
        acc.profilesMerged += 1;
        acc.fieldsEnriched += r.transferredData.fieldsEnriched;
        acc.addressesMoved += r.transferredData.addressesMoved;
        acc.projectsUpdated += r.transferredData.projectsUpdated;
        acc.salurOrdersUpdated += r.transferredData.salurOrdersUpdated;
        acc.donasiOrdersUpdated += r.transferredData.donasiOrdersUpdated ?? 0;
        acc.dharmaPatronUpdated += r.transferredData.dharmaPatronUpdated ?? 0;
        acc.ajarOrdersUpdated += r.transferredData.ajarOrdersUpdated ?? 0;
        acc.totalDataMoved += r.transferredData.totalDataPointsMoved;
        if (r.matchType === 'fuzzy') acc.fuzzyMerged += 1;
        else acc.exactMerged += 1;
        return acc;
      },
      {
        profilesMerged: 0,
        rolledBackCount: 0,
        fieldsEnriched: 0,
        addressesMoved: 0,
        projectsUpdated: 0,
        salurOrdersUpdated: 0,
        donasiOrdersUpdated: 0,
        dharmaPatronUpdated: 0,
        ajarOrdersUpdated: 0,
        totalDataMoved: 0,
        fuzzyMerged: 0,
        exactMerged: 0,
      }
    );
  }, [sessionRecords]);

  const handleDownloadMergePdf = () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const fileName = generateMergeSummaryPdf({
        records: sessionRecords,
        sessionStartedAt,
        similarityThreshold,
        adminName,
        adminEmail,
        remainingDuplicatesCount: pairs.length,
      });
      if (onShowToast) {
        onShowToast(`Dokumen PDF resmi "${fileName}" berhasil diunduh`);
      }
    } catch (err) {
      console.error('Failed to generate merge summary PDF:', err);
      if (onShowToast) {
        onShowToast('Gagal membuat dokumen PDF ringkasan merge. Silakan coba lagi.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const filteredPairs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pairs.filter((p) => {
      const mType = p.matchType ?? 'exact';
      if (filterMode === 'exact' && mType !== 'exact') return false;
      if (filterMode === 'fuzzy' && mType !== 'fuzzy') return false;

      if (!q) return true;
      const haystack = [
        p.item1.codeId,
        p.item1.namaLengkap,
        p.item1.namaPanggilan,
        p.item1.nomorHandPhone,
        p.item1.email,
        p.item1.kota,
        p.item2.codeId,
        p.item2.namaLengkap,
        p.item2.namaPanggilan,
        p.item2.nomorHandPhone,
        p.item2.email,
        p.item2.kota,
        p.reason,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [pairs, filterMode, searchQuery]);

  const toggleSwapPrimary = (pairId: string) => {
    setSwappedPairs((prev) => ({
      ...prev,
      [pairId]: !prev[pairId],
    }));
  };

  const openResolver = (pair: DuplicatePair) => {
    const isSwapped = Boolean(swappedPairs[pair.id]);
    const primary = isSwapped ? pair.item2 : pair.item1;
    const secondary = isSwapped ? pair.item1 : pair.item2;

    const initialChoices: Record<MergeableFieldKey, 'primary' | 'secondary' | 'combine'> = {
      namaLengkap: isFilled(primary.namaLengkap) ? 'primary' : 'secondary',
      namaPanggilan: isFilled(primary.namaPanggilan) ? 'primary' : 'secondary',
      nomorHandPhone: isFilled(primary.nomorHandPhone) ? 'primary' : 'secondary',
      email: isFilled(primary.email) ? 'primary' : 'secondary',
      kota: isFilled(primary.kota) ? 'primary' : 'secondary',
      organisasi:
        isFilled(primary.organisasi) &&
        isFilled(secondary.organisasi) &&
        primary.organisasi !== secondary.organisasi
          ? 'combine'
          : isFilled(primary.organisasi)
          ? 'primary'
          : 'secondary',
      status: isFilled(primary.status) ? 'primary' : 'secondary',
      custDuration: isFilled(primary.custDuration) ? 'primary' : 'secondary',
      pekerjaan: isFilled(primary.pekerjaan) ? 'primary' : 'secondary',
      pic: isFilled(primary.pic) ? 'primary' : 'secondary',
    };

    setResolverUseSecondPrimary(isSwapped);
    setFieldChoices(initialChoices);
    setResolvingPair(pair);
  };

  const resolvedPreviewItem = useMemo((): IdentitasItem | null => {
    if (!resolvingPair) return null;
    const primary = resolverUseSecondPrimary ? resolvingPair.item2 : resolvingPair.item1;
    const secondary = resolverUseSecondPrimary ? resolvingPair.item1 : resolvingPair.item2;

    const pickValue = (key: MergeableFieldKey): string => {
      const choice = fieldChoices[key];
      const pVal = (primary[key] as string) || '';
      const sVal = (secondary[key] as string) || '';
      if (key === 'organisasi' && choice === 'combine') {
        return combineOrgValues(pVal, sVal);
      }
      if (choice === 'secondary') {
        return isFilled(sVal) ? sVal : pVal;
      }
      return isFilled(pVal) ? pVal : sVal;
    };

    const nextName = pickValue('namaLengkap') || primary.namaLengkap;
    return {
      ...secondary,
      ...primary,
      id: primary.id,
      namaLengkap: nextName,
      namaPanggilan: pickValue('namaPanggilan'),
      nomorHandPhone: pickValue('nomorHandPhone'),
      email: pickValue('email'),
      kota: pickValue('kota'),
      organisasi: pickValue('organisasi'),
      status: pickValue('status') || '-',
      custDuration: pickValue('custDuration') || '-',
      pekerjaan: pickValue('pekerjaan'),
      pic: pickValue('pic'),
      avatarInitial: nextName.trim().charAt(0).toUpperCase() || primary.avatarInitial,
      alamatList: [
        ...(primary.alamatList || []),
        ...(secondary.alamatList || []).filter(
          (sa) => !(primary.alamatList || []).some((pa) => pa.alamat === sa.alamat)
        ),
      ],
    };
  }, [resolvingPair, resolverUseSecondPrimary, fieldChoices]);

  const handleConfirmResolverMerge = () => {
    if (!resolvingPair || !resolvedPreviewItem) return;
    const primaryId = resolverUseSecondPrimary ? resolvingPair.item2.id : resolvingPair.item1.id;
    onMergePair(resolvingPair, resolvedPreviewItem, primaryId);
    setResolvingPair(null);
  };

  const handleTriggerMergeAll = () => {
    if (filteredPairs.length === 0) return;
    const hasFuzzy = filteredPairs.some((p) => p.matchType === 'fuzzy');
    if (hasFuzzy) {
      setConfirmMergeAllOpen(true);
    } else {
      onMergeAll(filteredPairs);
    }
  };

  const getScoreAccentClass = (score: number) => {
    if (score >= 100) return 'bg-emerald-600';
    if (score >= 90) return 'bg-[#05828e]';
    return 'bg-amber-500';
  };

  const getScoreTextClass = (score: number) => {
    if (score >= 100) return 'text-emerald-700 dark:text-emerald-400';
    if (score >= 90) return 'text-[#05828e] dark:text-teal-400';
    return 'text-amber-700 dark:text-amber-400';
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header Navigation & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Kembali ke Identitas"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Smart Merge &amp; Duplicate Resolver
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>
                {totalIdentitasCount > 0 ? `${totalIdentitasCount} profil dipindai` : 'Pemindaian aktif'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Ambang batas {similarityThreshold === 80 ? '>80%' : `>=${similarityThreshold}%`}
              </span>
              <span aria-hidden="true">·</span>
              <span>Fuzzy Matching: Levenshtein, Jaro-Winkler &amp; Token-Set</span>
            </div>
          </div>
        </div>

        {dismissedCount > 0 && onResetDismissedPairs && (
          <button
            type="button"
            onClick={onResetDismissedPairs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pulihkan {dismissedCount} Diabaikan</span>
          </button>
        )}
      </div>

      {/* KPI Metric Strip — Clean Single-Elevation Hairline Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Profil Terlibat
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
            {totalDuplicateRecordsCount}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1.5">
              buah
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Smart Match (Fuzzy)
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-mono tabular-nums mt-1">
            {fuzzyCount}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1.5">
              pasangan
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Duplikat Eksak (100%)
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums mt-1">
            {exactCount}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1.5">
              pasangan
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Sensitivitas Kemiripan
          </div>
          <div className="text-2xl font-bold text-[#05828e] dark:text-teal-400 font-mono tabular-nums mt-1">
            {similarityThreshold === 80 ? '>80%' : `>=${similarityThreshold}%`}
          </div>
        </div>
      </div>

      {/* Ringkasan Hasil Merge (Sesi Aktif) + Unduh PDF Resmi Admin */}
      <div
        id="panel-ringkasan-hasil-merge"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <FileText className="w-4 h-4 text-[#05828e]" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Ringkasan Hasil Merge
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Admin: {adminName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Mulai sesi{' '}
                {new Date(sessionStartedAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {sessionStats.profilesMerged} profil digabungkan
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {sessionRecords.length > 0 && (
              <button
                type="button"
                onClick={() => setIsSummaryExpanded((prev) => !prev)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {isSummaryExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Sembunyikan Rincian</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Lihat Rincian ({sessionRecords.length})</span>
                  </>
                )}
              </button>
            )}

            {sessionRecords.length > 0 && onResetSession && (
              <button
                type="button"
                onClick={onResetSession}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Mulai ulang penghitung ringkasan sesi merge"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sesi</span>
              </button>
            )}

            <button
              id="btn-download-merge-summary-pdf"
              type="button"
              onClick={handleDownloadMergePdf}
              disabled={isGeneratingPdf}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#05828e] dark:hover:bg-[#046c76] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
              title="Unduh berita acara & ringkasan hasil merge sebagai dokumen resmi PDF admin"
            >
              <FileDown className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Menyiapkan PDF...' : 'Unduh PDF Resmi'}</span>
            </button>
          </div>
        </div>

        {/* Session Aggregated Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Profil Berhasil Digabung
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
              {sessionStats.profilesMerged}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                profil
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-1">
              {sessionStats.exactMerged} Eksak · {sessionStats.fuzzyMerged} Fuzzy
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total Data Dipindahkan
            </div>
            <div className="text-xl font-bold text-[#05828e] dark:text-teal-400 font-mono tabular-nums mt-1">
              {sessionStats.totalDataMoved}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                item
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Atribut, alamat &amp; relasi modul
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Atribut &amp; Alamat
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
              {sessionStats.fieldsEnriched + sessionStats.addressesMoved}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                data
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-1">
              {sessionStats.fieldsEnriched} Field · {sessionStats.addressesMoved} Alamat
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Relasi Lintas Modul
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
              {sessionStats.projectsUpdated +
                sessionStats.salurOrdersUpdated +
                sessionStats.donasiOrdersUpdated +
                sessionStats.dharmaPatronUpdated +
                sessionStats.ajarOrdersUpdated}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                referensi
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-1">
              {sessionStats.projectsUpdated} Prj · {sessionStats.salurOrdersUpdated} Slr ·{' '}
              {sessionStats.donasiOrdersUpdated} Don · {sessionStats.dharmaPatronUpdated} DPR ·{' '}
              {sessionStats.ajarOrdersUpdated} Ajr
            </div>
          </div>
        </div>

        {/* Chronological Merged Operations Table */}
        {sessionRecords.length > 0 && isSummaryExpanded && (
          <div className="pt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">Waktu</th>
                  <th className="py-2.5 pr-4 font-semibold">Profil Utama (Dipertahankan)</th>
                  <th className="py-2.5 pr-4 font-semibold">Profil Sekunder (Digabung)</th>
                  <th className="py-2.5 pr-4 font-semibold">Skor &amp; Metode</th>
                  <th className="py-2.5 pr-4 font-semibold">Rincian Data Dipindahkan</th>
                  {onUndoMerge && <th className="py-2.5 font-semibold text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sessionRecords.map((rec) => {
                  const td = rec.transferredData;
                  const summaryParts: string[] = [];
                  if (td.fieldsEnriched > 0) {
                    summaryParts.push(
                      `${td.fieldsEnriched} field (${td.fieldsList.join(', ')})`
                    );
                  }
                  if (td.addressesMoved > 0) {
                    summaryParts.push(`${td.addressesMoved} alamat`);
                  }
                  if (td.projectsUpdated > 0) {
                    summaryParts.push(`${td.projectsUpdated} proyek`);
                  }
                  if (td.salurOrdersUpdated > 0) {
                    summaryParts.push(`${td.salurOrdersUpdated} salur`);
                  }
                  if ((td.donasiOrdersUpdated ?? 0) > 0) {
                    summaryParts.push(`${td.donasiOrdersUpdated} donasi`);
                  }
                  if ((td.dharmaPatronUpdated ?? 0) > 0) {
                    summaryParts.push(`${td.dharmaPatronUpdated} patron`);
                  }
                  if ((td.ajarOrdersUpdated ?? 0) > 0) {
                    summaryParts.push(`${td.ajarOrdersUpdated} ajar`);
                  }

                  const methodLabel =
                    rec.method === 'curated'
                      ? 'Tinjau Field'
                      : rec.method === 'batch'
                      ? 'Batch'
                      : 'Cepat';

                  const canRollbackRow =
                    canUndoMerge &&
                    Boolean(onUndoMerge) &&
                    !rec.isRolledBack &&
                    Boolean(rec.rollbackSnapshot);

                  return (
                    <tr
                      key={rec.id}
                      className={
                        rec.isRolledBack
                          ? 'text-slate-400 dark:text-slate-500 bg-slate-50/60 dark:bg-slate-900/50'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    >
                      <td className="py-3 pr-4 font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(rec.mergedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                        <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 font-normal mr-1.5">
                          {rec.primaryCodeId}
                        </span>
                        <span className={rec.isRolledBack ? 'line-through opacity-75' : ''}>
                          {rec.primaryName}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                        <span className="font-mono tabular-nums text-slate-400 mr-1.5">
                          {rec.secondaryCodeId}
                        </span>
                        <span className={rec.isRolledBack ? 'line-through opacity-75' : ''}>
                          {rec.secondaryName}
                        </span>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap font-mono tabular-nums">
                        {rec.similarityScore}%{' '}
                        <span className="font-sans text-slate-500 dark:text-slate-400">
                          · {rec.matchType === 'fuzzy' ? 'Fuzzy' : 'Eksak'} · {methodLabel}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                        {summaryParts.length > 0 ? (
                          <span className="font-mono tabular-nums">
                            {td.totalDataPointsMoved} item{' '}
                            <span className="font-sans text-slate-500 dark:text-slate-400">
                              ({summaryParts.join(' · ')})
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            Konsolidasi identitas tanpa penambahan field baru
                          </span>
                        )}
                      </td>
                      {onUndoMerge && (
                        <td className="py-3 text-right whitespace-nowrap">
                          {rec.isRolledBack ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                              <RotateCcw className="w-3 h-3" />
                              <span>Dibatalkan</span>
                            </span>
                          ) : canRollbackRow ? (
                            <button
                              type="button"
                              onClick={() => setPendingRollbackRecord(rec)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Batalkan penggabungan & pulihkan kedua profil beserta transaksi"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Rollback</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Smart Merge Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7">
        {/* Toolbar: Mode Tabs, Threshold Selector, Search & Merge All */}
        <div className="flex flex-col gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mr-2 font-mono tabular-nums">
                Merge Duplicates ({filteredPairs.length})
              </h3>

              {/* Interactive Segmented Filter Tabs */}
              <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Semua ({pairs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('fuzzy')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterMode === 'fuzzy'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Smart Match ({fuzzyCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('exact')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterMode === 'exact'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Eksak 100% ({exactCount})
                </button>
              </div>
            </div>

            {filteredPairs.length > 0 && canMerge && (
              <button
                id="btn-merge-all"
                type="button"
                onClick={handleTriggerMergeAll}
                className="min-h-[40px] px-5 py-2.5 bg-[#05828e] hover:bg-[#046c76] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shrink-0"
              >
                <GitMerge className="w-4 h-4" />
                <span>Merge All ({filteredPairs.length})</span>
              </button>
            )}
          </div>

          {/* Search & Threshold Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, kode ID, email, atau nomor HP..."
                className="w-full min-h-[40px] pl-10 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30 focus:border-[#05828e]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {onChangeThreshold && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Ambang Kemiripan:</span>
                </span>
                <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {THRESHOLD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChangeThreshold(opt.value)}
                      className={`px-3 py-1.5 text-xs font-mono tabular-nums rounded-lg transition-colors cursor-pointer ${
                        similarityThreshold === opt.value
                          ? 'bg-white dark:bg-slate-900 text-[#05828e] dark:text-teal-400 font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List of Duplicate Comparison Pairs */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {filteredPairs.map((pair) => {
            const isSwapped = Boolean(swappedPairs[pair.id]);
            const primary = isSwapped ? pair.item2 : pair.item1;
            const secondary = isSwapped ? pair.item1 : pair.item2;
            const score = pair.similarityScore ?? 100;
            const isFuzzy = pair.matchType === 'fuzzy';
            const topFieldScores = (pair.fieldScores || []).slice(0, 4);

            return (
              <div key={pair.id} className="py-7 first:pt-6 last:pb-2 space-y-5">
                {/* Quiet Metadata & Slim Progress Track */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span
                        className={`text-sm font-bold font-mono tabular-nums ${getScoreTextClass(
                          score
                        )}`}
                      >
                        {score}% Kemiripan
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {isFuzzy ? 'Smart Match (Fuzzy)' : 'Duplikat Eksak'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500 dark:text-slate-400">{pair.reason}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSwapPrimary(pair.id)}
                      className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Tukar data mana yang menjadi profil utama (dipertahankan)"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#05828e]" />
                      <span>Tukar Profil Utama</span>
                    </button>
                  </div>

                  {/* Slim proportional similarity bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getScoreAccentClass(
                        score
                      )}`}
                      style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    />
                  </div>
                </div>

                {/* Side-by-side Profiles Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                  {/* Primary Profile (Kept) */}
                  <div className="p-4 sm:p-5 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/50 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#05828e] dark:text-teal-400">
                        Profil Utama (Dipertahankan)
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        Kode: {primary.codeId || '-'}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${primary.avatarBg} text-white flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0`}
                      >
                        {primary.avatarInitial}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                          {primary.namaLengkap}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          Panggilan: {primary.namaPanggilan || '-'}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                          HP: {primary.nomorHandPhone || '-'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          Email: {primary.email || '-'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span>{primary.kota || '-'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{primary.organisasi || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Profile (Merged & Removed) */}
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Profil Sekunder (Digabungkan &amp; Dihapus)
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        Kode: {secondary.codeId || '-'}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${secondary.avatarBg} text-white flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0`}
                      >
                        {secondary.avatarInitial}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                          {secondary.namaLengkap}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          Panggilan: {secondary.namaPanggilan || '-'}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                          HP: {secondary.nomorHandPhone || '-'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          Email: {secondary.email || '-'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span>{secondary.kota || '-'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{secondary.organisasi || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fuzzy Field Breakdown & Actions Footer */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                  {/* Quiet Unboxed Per-Field Algorithm Breakdown */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {topFieldScores.length > 0 ? (
                      <>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Rincian Skor:
                        </span>
                        {topFieldScores.map((fs, idx) => (
                          <React.Fragment key={fs.field}>
                            {idx > 0 && <span aria-hidden="true">·</span>}
                            <span className="font-mono tabular-nums">
                              {fs.label} {fs.score}% ({fs.algorithm})
                            </span>
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      <span>{pair.reason}</span>
                    )}
                  </div>

                  {/* Action Buttons (all >= 40px touch target) */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onDismissPair(pair.id)}
                      className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Abaikan
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditItem(primary)}
                      className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {canMerge && (
                      <>
                        <button
                          type="button"
                          onClick={() => openResolver(pair)}
                          className="min-h-[40px] px-4 py-2 rounded-xl border border-[#05828e] text-xs sm:text-sm font-semibold text-[#05828e] dark:text-teal-400 dark:border-teal-500/60 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors cursor-pointer"
                        >
                          Tinjau Field
                        </button>
                        <button
                          type="button"
                          onClick={() => onMergePair(pair, undefined, primary.id)}
                          className="min-h-[40px] px-5 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <GitMerge className="w-4 h-4" />
                          <span>Smart Merge</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPairs.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {pairs.length === 0
                  ? 'Semua Data Identitas Sudah Bersih'
                  : 'Tidak Ada Pasangan yang Cocok dengan Filter'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {pairs.length === 0
                  ? `Tidak ada data identitas yang terdeteksi duplikat atau memiliki kemiripan fuzzy ${
                      similarityThreshold === 80 ? 'lebih dari 80%' : `minimal ${similarityThreshold}%`
                    } saat ini.`
                  : 'Coba ubah kata kunci pencarian, kategori filter, atau turunkan ambang batas kemiripan ke >80%.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {pairs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('all');
                      setSearchQuery('');
                    }}
                    className="min-h-[40px] px-5 py-2 bg-[#05828e] hover:bg-[#046c76] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  type="button"
                  onClick={onBack}
                  className="min-h-[40px] px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Kembali ke Tabel Identitas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Smart Merge Field Resolver Modal */}
      {resolvingPair && resolvedPreviewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="smart-merge-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h3
                  id="smart-merge-modal-title"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  Tinjau &amp; Pilih Nilai Field Smart Merge
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-mono tabular-nums font-semibold text-[#05828e] dark:text-teal-400">
                    {resolvingPair.similarityScore ?? 100}% Kemiripan
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{resolvingPair.reason}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolvingPair(null)}
                className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Primary swap bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                  <div className="font-semibold">
                    Profil Utama:{' '}
                    <span className="text-[#05828e] dark:text-teal-400">
                      {(resolverUseSecondPrimary ? resolvingPair.item2 : resolvingPair.item1).codeId ||
                        '-'}{' '}
                      {(resolverUseSecondPrimary ? resolvingPair.item2 : resolvingPair.item1).namaLengkap}
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Riwayat proyek dan transaksi salur dari profil sekunder otomatis dialihkan ke profil ini.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResolverUseSecondPrimary((prev) => !prev)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#05828e]" />
                  <span>Tukar Profil Utama</span>
                </button>
              </div>

              {/* Field-by-field chooser */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Pilih nilai terbaik untuk setiap atribut identitas
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {MERGEABLE_FIELDS.map((fieldCfg) => {
                    const primary = resolverUseSecondPrimary
                      ? resolvingPair.item2
                      : resolvingPair.item1;
                    const secondary = resolverUseSecondPrimary
                      ? resolvingPair.item1
                      : resolvingPair.item2;
                    const pVal = (primary[fieldCfg.key] as string) || '-';
                    const sVal = (secondary[fieldCfg.key] as string) || '-';
                    const currentChoice = fieldChoices[fieldCfg.key];
                    const isIdentical = pVal.trim() === sVal.trim();

                    return (
                      <div
                        key={fieldCfg.key}
                        className="p-3.5 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                      >
                        <div className="md:col-span-3">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {fieldCfg.label}
                          </div>
                          {isIdentical && (
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              Nilai identik
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-9 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFieldChoices((prev) => ({
                                ...prev,
                                [fieldCfg.key]: 'primary',
                              }))
                            }
                            className={`flex-1 min-w-[160px] text-left px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                              currentChoice === 'primary'
                                ? 'border-[#05828e] bg-teal-50/70 dark:bg-teal-950/30 text-slate-900 dark:text-slate-100 font-medium'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">
                              <span className="text-slate-400 mr-1">Utama:</span>
                              {pVal}
                            </span>
                            {currentChoice === 'primary' && (
                              <Check className="w-3.5 h-3.5 text-[#05828e] shrink-0" />
                            )}
                          </button>

                          {!isIdentical && (
                            <button
                              type="button"
                              onClick={() =>
                                setFieldChoices((prev) => ({
                                  ...prev,
                                  [fieldCfg.key]: 'secondary',
                                }))
                              }
                              className={`flex-1 min-w-[160px] text-left px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                currentChoice === 'secondary'
                                  ? 'border-[#05828e] bg-teal-50/70 dark:bg-teal-950/30 text-slate-900 dark:text-slate-100 font-medium'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate">
                                <span className="text-slate-400 mr-1">Sekunder:</span>
                                {sVal}
                              </span>
                              {currentChoice === 'secondary' && (
                                <Check className="w-3.5 h-3.5 text-[#05828e] shrink-0" />
                              )}
                            </button>
                          )}

                          {fieldCfg.allowCombine && !isIdentical && isFilled(pVal) && isFilled(sVal) && (
                            <button
                              type="button"
                              onClick={() =>
                                setFieldChoices((prev) => ({
                                  ...prev,
                                  [fieldCfg.key]: 'combine',
                                }))
                              }
                              className={`px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                                currentChoice === 'combine'
                                  ? 'border-[#05828e] bg-teal-50/70 dark:bg-teal-950/30 text-slate-900 dark:text-slate-100 font-medium'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>Gabungkan</span>
                              {currentChoice === 'combine' && (
                                <Check className="w-3.5 h-3.5 text-[#05828e]" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Final Profile Preview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Pratinjau Hasil Akhir Profil Terpadu
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {resolvedPreviewItem.codeId || '-'} · {resolvedPreviewItem.namaLengkap}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2 font-mono tabular-nums">
                  <span>{resolvedPreviewItem.nomorHandPhone || '-'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{resolvedPreviewItem.email || '-'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans">{resolvedPreviewItem.kota || '-'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans">{resolvedPreviewItem.organisasi || '-'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/60 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setResolvingPair(null)}
                className="min-h-[40px] px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResolverMerge}
                className="min-h-[40px] px-6 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <GitMerge className="w-4 h-4" />
                <span>Simpan &amp; Gabung Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Batch Merge Modal when Fuzzy Matches are included */}
      {confirmMergeAllOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-merge-all-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3
                  id="confirm-merge-all-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-100"
                >
                  Konfirmasi Penggabungan Massal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Daftar ini mencakup pasangan{' '}
                  <span className="font-semibold">Smart Match (Fuzzy)</span> dengan kemiripan di bawah 100%. Lanjutkan menggabungkan{' '}
                  <span className="font-mono tabular-nums font-semibold">
                    {filteredPairs.length}
                  </span>{' '}
                  pasangan sekaligus ke masing-masing profil utama?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmMergeAllOpen(false)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tinjau Manual
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmMergeAllOpen(false);
                  onMergeAll(filteredPairs);
                }}
                className="min-h-[40px] px-5 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Ya, Gabungkan Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Rollback / Undo Merge Modal */}
      {pendingRollbackRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-rollback-merge-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3
                  id="confirm-rollback-merge-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-100"
                >
                  Konfirmasi Rollback Merge Profil
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Batalkan penggabungan{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {pendingRollbackRecord.secondaryCodeId} {pendingRollbackRecord.secondaryName}
                  </span>{' '}
                  ke{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {pendingRollbackRecord.primaryCodeId} {pendingRollbackRecord.primaryName}
                  </span>
                  ? Kedua profil beserta seluruh transaksi Proyek, Salur, Donasi, Patron, dan A-AJAR akan dikembalikan seperti sebelum merge.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPendingRollbackRecord(null)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = pendingRollbackRecord.id;
                  setPendingRollbackRecord(null);
                  onUndoMerge?.(targetId);
                }}
                className="min-h-[40px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Pulihkan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
