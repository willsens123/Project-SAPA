import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Phone,
  Building2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  History,
  UserCheck,
} from 'lucide-react';
import {
  DharmaPatronRutinItem,
  OrganisasiItem,
  PatronWhatsappBillingLog,
  RekeningItem,
} from '../types';
import { IdentitasItem } from '../identitasData';
import { INITIAL_REKENING_ITEMS } from '../rekeningData';
import {
  WhatsappBillingTone,
  buildWhatsappSendUrl,
  formatBillingTimestamp,
  generatePatronBillingMessage,
  getDefaultPatronBankAccount,
  getPatronBillingStatus,
  getWhatsappToneLabel,
  normalizeWhatsappPhone,
  resolvePatronContactPhone,
} from '../utils/patronWhatsappHelper';

interface ModalTagihanWhatsappPatronProps {
  isOpen: boolean;
  onClose: () => void;
  patrons: DharmaPatronRutinItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  rekeningList?: RekeningItem[];
  currentAdminName?: string;
  onRecordBilling?: (patron: DharmaPatronRutinItem, entry: PatronWhatsappBillingLog) => void;
  onShowToast?: (msg: string) => void;
}

export const ModalTagihanWhatsappPatron: React.FC<ModalTagihanWhatsappPatronProps> = ({
  isOpen,
  onClose,
  patrons,
  identitasList = [],
  organisasiList = [],
  rekeningList = [],
  currentAdminName = 'Admin Keuangan',
  onRecordBilling,
  onShowToast,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tone, setTone] = useState<WhatsappBillingTone>('ramah');
  const [phoneInput, setPhoneInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [selectedRekeningId, setSelectedRekeningId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isMessageEdited, setIsMessageEdited] = useState(false);
  const [copiedJustNow, setCopiedJustNow] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);
  const [sessionHistoryMap, setSessionHistoryMap] = useState<
    Record<string, PatronWhatsappBillingLog[]>
  >({});

  const availableAccounts = useMemo(
    () => (rekeningList.length > 0 ? rekeningList : INITIAL_REKENING_ITEMS),
    [rekeningList]
  );

  const activePatron = patrons[currentIdx] || null;

  const selectedRekening = useMemo(() => {
    return (
      availableAccounts.find((r) => r.id === selectedRekeningId) ||
      getDefaultPatronBankAccount(availableAccounts)
    );
  }, [availableAccounts, selectedRekeningId]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setTone('ramah');
      setCustomNote('');
      setIsMessageEdited(false);
      setCopiedJustNow(false);
      setIsHistoryExpanded(false);
      setCopiedHistoryId(null);
      setSessionHistoryMap({});
      const def = getDefaultPatronBankAccount(availableAccounts);
      if (def) setSelectedRekeningId(def.id);
    }
  }, [isOpen, patrons, availableAccounts]);

  useEffect(() => {
    if (!isOpen || !activePatron) return;
    const resolved = resolvePatronContactPhone(activePatron, identitasList, organisasiList);
    setPhoneInput(resolved);
    setIsMessageEdited(false);
    setCopiedJustNow(false);
  }, [isOpen, activePatron, identitasList, organisasiList]);

  useEffect(() => {
    if (!isOpen || !activePatron || isMessageEdited) return;
    const generated = generatePatronBillingMessage({
      patron: activePatron,
      tone,
      rekening: selectedRekening,
      customNote,
    });
    setMessageText(generated);
  }, [isOpen, activePatron, tone, selectedRekening, customNote, isMessageEdited]);

  const mergedActivePatron = useMemo(() => {
    if (!activePatron) return null;
    const sessionEntries = sessionHistoryMap[activePatron.id] || [];
    if (sessionEntries.length === 0) return activePatron;
    const existing = activePatron.whatsappBillingHistory || [];
    const seenIds = new Set(sessionEntries.map((e) => e.id));
    const combined = [...sessionEntries, ...existing.filter((e) => !seenIds.has(e.id))];
    const latest = combined[0];
    return {
      ...activePatron,
      lastWhatsappBilledAt: latest?.billedAt || activePatron.lastWhatsappBilledAt,
      lastWhatsappBilledBy: latest?.billedBy || activePatron.lastWhatsappBilledBy,
      lastWhatsappBilledPhone: latest?.phone || activePatron.lastWhatsappBilledPhone,
      lastWhatsappBilledAmount: latest?.nominalTagihan ?? activePatron.lastWhatsappBilledAmount,
      lastWhatsappBilledBulan: latest?.bulanPiutang || activePatron.lastWhatsappBilledBulan,
      whatsappBillingHistory: combined,
    };
  }, [activePatron, sessionHistoryMap]);

  const queueBilledCount = useMemo(() => {
    return patrons.filter((p) => {
      const sessionEntries = sessionHistoryMap[p.id] || [];
      return sessionEntries.length > 0 || getPatronBillingStatus(p).isBilledThisMonth;
    }).length;
  }, [patrons, sessionHistoryMap]);

  if (!isOpen || !activePatron || !mergedActivePatron) return null;

  const billingStatus = getPatronBillingStatus(mergedActivePatron);
  const normalizedPhone = normalizeWhatsappPhone(phoneInput);
  const waUrl = buildWhatsappSendUrl(phoneInput, messageText);
  const piutangAbs = Math.abs(Number(activePatron.piutang || 0));
  const totalTagihan = piutangAbs > 0 ? piutangAbs : Number(activePatron.donasiPerbulan || 0);
  const periodeTagihan =
    activePatron.bulanPiutang && activePatron.bulanPiutang !== '-'
      ? activePatron.bulanPiutang
      : 'Bulan Berjalan';

  const copyTextToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      return true;
    } catch {
      return false;
    }
  };

  const createAndPersistBillingLog = (channel: 'whatsapp_open' | 'manual_mark') => {
    const entry: PatronWhatsappBillingLog = {
      id: `wa-bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      billedAt: new Date().toISOString(),
      billedBy: currentAdminName || 'Admin Keuangan',
      phone: phoneInput.trim() || '-',
      nominalTagihan: totalTagihan,
      bulanPiutang: periodeTagihan,
      tone,
      rekeningLabel: selectedRekening
        ? `${selectedRekening.nama} (${selectedRekening.nomorRekening || '-'})`
        : undefined,
      messagePreview: messageText,
      channel,
    };

    setSessionHistoryMap((prev) => ({
      ...prev,
      [activePatron.id]: [entry, ...(prev[activePatron.id] || [])],
    }));

    onRecordBilling?.(activePatron, entry);
  };

  const handleOpenWaAndCopy = async () => {
    await copyTextToClipboard(messageText);
    setCopiedJustNow(true);
    window.setTimeout(() => setCopiedJustNow(false), 2200);
    createAndPersistBillingLog('whatsapp_open');
    if (onShowToast) {
      onShowToast(
        normalizedPhone
          ? `Pesan untuk ${activePatron.namaDonatur} disalin, WhatsApp dibuka & status "Sudah Ditagih" tersimpan`
          : `Pesan disalin, WhatsApp dibuka & status "Sudah Ditagih" untuk ${activePatron.namaDonatur} tersimpan`
      );
    }
  };

  const handleCopyOnly = async () => {
    const ok = await copyTextToClipboard(messageText);
    if (ok) {
      setCopiedJustNow(true);
      window.setTimeout(() => setCopiedJustNow(false), 2200);
    }
    if (onShowToast) {
      onShowToast(
        ok
          ? `Pesan tagihan WhatsApp untuk ${activePatron.namaDonatur} disalin ke clipboard`
          : 'Gagal menyalin pesan ke clipboard'
      );
    }
  };

  const handleManualMarkBilled = () => {
    createAndPersistBillingLog('manual_mark');
    onShowToast?.(
      `${activePatron.namaDonatur} ditandai "Sudah Ditagih" ke dalam riwayat penagihan`
    );
  };

  const handleResetTemplate = () => {
    setIsMessageEdited(false);
    setMessageText(
      generatePatronBillingMessage({
        patron: activePatron,
        tone,
        rekening: selectedRekening,
        customNote,
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-[1px] animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                Generator Pesan Tagihan WhatsApp Dharma Patron
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Buka WhatsApp untuk salin pesan otomatis sekaligus mencatat status Sudah Ditagih.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Patron Queue Stepper */}
        {patrons.length > 1 && (
          <div className="px-5 py-2.5 bg-teal-50/70 dark:bg-teal-950/30 border-b border-teal-100 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#05828e] dark:text-teal-300 font-mono tabular-nums">
                Donatur {currentIdx + 1} dari {patrons.length} dipilih
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                ({queueBilledCount}/{patrons.length} ditagih bulan ini)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={currentIdx === patrons.length - 1}
                onClick={() => setCurrentIdx((i) => Math.min(patrons.length - 1, i + 1))}
                className="px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Patron Info Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#05828e] dark:text-teal-400">
                    {activePatron.noDonatur || '-'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {activePatron.namaDonatur}
                  </span>
                  {activePatron.panggilan && activePatron.panggilan !== '-' && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({activePatron.panggilan})
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>
                    Periode Piutang:{' '}
                    <strong className={piutangAbs > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                      {activePatron.bulanPiutang && activePatron.bulanPiutang !== '-'
                        ? activePatron.bulanPiutang
                        : 'Lunas / Bulan Berjalan'}
                    </strong>
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">
                    Komitmen: Rp{Number(activePatron.donasiPerbulan || 0).toLocaleString('id-ID')}/bln
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nominal Tagihan
                </span>
                <span className="text-base font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                  Rp{totalTagihan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Live Billing Status Strip */}
            <div
              className={`pt-2.5 border-t border-slate-200/80 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-2 text-xs ${
                billingStatus.hasBeenBilled
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {billingStatus.hasBeenBilled ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold">
                    {billingStatus.isBilledThisMonth ? 'Sudah Ditagih' : 'Pernah Ditagih'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 truncate">
                    · {billingStatus.fullDateLabel} oleh{' '}
                    <strong className="font-semibold">{billingStatus.lastBilledBy || 'Admin'}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Belum ada riwayat penagihan WhatsApp tercatat</span>
                </div>
              )}

              {billingStatus.historyCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsHistoryExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#05828e] dark:text-teal-400 hover:underline cursor-pointer shrink-0"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Riwayat ({billingStatus.historyCount})</span>
                  {isHistoryExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Expandable Billing History Drawer */}
          {isHistoryExpanded && billingStatus.history.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in duration-150">
              <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#05828e]" />
                  <span>Riwayat Tagihan WhatsApp ({billingStatus.history.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Terbaru di atas</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                {billingStatus.history.map((log) => (
                  <div
                    key={log.id}
                    className="px-3.5 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono tabular-nums">
                          {formatBillingTimestamp(log.billedAt)}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                          {log.channel === 'whatsapp_open' ? 'Buka WA' : 'Tandai Manual'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Gaya: {getWhatsappToneLabel(log.tone)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
                        <span>Admin: {log.billedBy}</span>
                        <span>·</span>
                        <span className="font-mono">HP: {log.phone || '-'}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
                          Rp{Number(log.nominalTagihan || 0).toLocaleString('id-ID')} ({log.bulanPiutang})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyTextToClipboard(log.messagePreview);
                        if (ok) {
                          setCopiedHistoryId(log.id);
                          window.setTimeout(() => setCopiedHistoryId(null), 1800);
                          onShowToast?.('Pesan dari riwayat disalin ke clipboard');
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shrink-0 self-start sm:self-center"
                    >
                      {copiedHistoryId === log.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Ulang</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls: Phone, Rekening */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp Donatur
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-[#05828e]"
                />
              </div>
              {!normalizedPhone && (
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Nomor HP belum terisi — WhatsApp tetap terbuka untuk pilih kontak manual.</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rekening Tujuan Transfer
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedRekening?.id || ''}
                  onChange={(e) => setSelectedRekeningId(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#05828e] cursor-pointer"
                >
                  {availableAccounts.map((rek) => (
                    <option key={rek.id} value={rek.id}>
                      {rek.nama} ({rek.nomorRekening || '-'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tone & Custom Note */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gaya Bahasa Pesan
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                {(
                  [
                    { id: 'ramah', label: 'Ramah' },
                    { id: 'pengingat', label: 'Terstruktur' },
                    { id: 'tegas', label: 'Formal' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTone(opt.id);
                      setIsMessageEdited(false);
                    }}
                    className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      tone === opt.id
                        ? 'bg-white dark:bg-slate-700 text-[#05828e] dark:text-teal-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => {
                  setCustomNote(e.target.value);
                  setIsMessageEdited(false);
                }}
                placeholder="Misal: Bisa dicicil atau konfirmasi ke PIC..."
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#05828e]"
              />
            </div>
          </div>

          {/* Live Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pratinjau Pesan WhatsApp (Dapat Diedit)
              </label>
              {isMessageEdited && (
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#05828e] dark:text-teal-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ke Template</span>
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setIsMessageEdited(true);
              }}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/60 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 outline-none focus:border-[#05828e] resize-y"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {onRecordBilling && (
              <button
                type="button"
                onClick={handleManualMarkBilled}
                title="Simpan riwayat penagihan manual tanpa membuka WhatsApp"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Tandai Sudah Ditagih</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyOnly}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {copiedJustNow ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Pesan</span>
                </>
              )}
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenWaAndCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Buka WhatsApp &amp; Salin Pesan</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

