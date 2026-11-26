import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  Phone,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  History,
  ChevronDown,
  ChevronUp,
  Receipt,
  Truck,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';
import { DonasiOrder } from '../donasiData';
import { IdentitasItem } from '../identitasData';
import { ResiItem } from '../resiData';
import { SalurOrder } from '../salurData';
import { ListPMItem, OrganisasiItem, WhatsappDispatchLog } from '../types';
import { dispatchAuditEvent } from '../utils/auditEventBus';
import {
  CustomerDirectTopic,
  WhatsappAutomationKind,
  WhatsappAutomationTone,
  buildListPMLogEntryForWhatsapp,
  buildWhatsappSendUrl,
  copyTextToClipboard,
  createWhatsappDispatchLog,
  formatBillingTimestamp,
  formatKwitansiNumberFromOrder,
  generateCustomerDirectWhatsappMessage,
  generateKwitansiDonasiWhatsappMessage,
  generateResiSalurWhatsappMessage,
  getCustomerDirectTopicLabel,
  normalizeWhatsappPhone,
  resolveDonasiContactInfo,
  resolveIdentitasContactInfo,
  resolveResiContactInfo,
  resolveSalurContactInfo,
} from '../utils/whatsappReceiptResiHelper';

export interface CustomerDirectTargetInput {
  identitasId?: string;
  codeId?: string;
  nama: string;
  panggilan?: string;
  phone?: string;
  lastContactedDisplay?: string;
  existingHistory?: WhatsappDispatchLog[];
}

interface ModalKirimWhatsappOtomatisProps {
  isOpen: boolean;
  onClose: () => void;
  kind: WhatsappAutomationKind;
  donasiOrder?: DonasiOrder | null;
  salurOrder?: SalurOrder | null;
  resiItem?: ResiItem | null;
  identitasItem?: IdentitasItem | null;
  customerTarget?: CustomerDirectTargetInput | null;
  kwitansiNumberOverride?: string;
  includePelimpahanJasa?: boolean;
  salurOrders?: SalurOrder[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  currentActorName?: string;
  onDispatchCompleted?: (payload: {
    logEntry: WhatsappDispatchLog;
    listPMItem: ListPMItem | null;
    donasiOrderId?: string;
    salurOrderId?: string;
    resiItemId?: string;
    identitasId?: string;
    codeId?: string;
  }) => void;
  onShowToast?: (msg: string) => void;
}

export const ModalKirimWhatsappOtomatis: React.FC<ModalKirimWhatsappOtomatisProps> = ({
  isOpen,
  onClose,
  kind,
  donasiOrder,
  salurOrder,
  resiItem,
  identitasItem,
  customerTarget,
  kwitansiNumberOverride,
  includePelimpahanJasa = true,
  salurOrders = [],
  identitasList = [],
  organisasiList = [],
  currentActorName = 'Admin YPPLN',
  onDispatchCompleted,
  onShowToast,
}) => {
  const [tone, setTone] = useState<WhatsappAutomationTone>('ramah');
  const [customerTopic, setCustomerTopic] = useState<CustomerDirectTopic>('sapaan');
  const [phoneInput, setPhoneInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isMessageEdited, setIsMessageEdited] = useState(false);
  const [logToListPM, setLogToListPM] = useState(true);
  const [copiedJustNow, setCopiedJustNow] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<WhatsappDispatchLog[]>([]);

  // Resolve active entity context
  const resolvedContext = useMemo(() => {
    if (kind === 'customer_direct' && (identitasItem || customerTarget)) {
      const contact = resolveIdentitasContactInfo(identitasItem, customerTarget || undefined);
      const topicLabel = getCustomerDirectTopicLabel(customerTopic);
      const lastLabel =
        identitasItem?.lastContactedAt ||
        customerTarget?.lastContactedDisplay ||
        (identitasItem?.lastContacted && identitasItem.lastContacted !== '-'
          ? identitasItem.lastContacted
          : undefined);
      return {
        contact,
        referenceNumber: topicLabel,
        orderCode: contact.codeId || contact.identitasId || 'CUSTOMER',
        ekspedisi: undefined,
        subtitle: `${contact.codeId ? `${contact.codeId} · ` : ''}${contact.nama}`,
        itemStockOrDetail: topicLabel,
        proyekKode: 'SAPA',
        existingHistory:
          identitasItem?.whatsappContactHistory || customerTarget?.existingHistory || [],
        lastSentAt: lastLabel,
        linkedSalurOrder: undefined,
      };
    }

    if (kind === 'kwitansi_donasi' && donasiOrder) {
      const contact = resolveDonasiContactInfo(donasiOrder, identitasList, organisasiList);
      const kwitansiNo = kwitansiNumberOverride?.trim() || formatKwitansiNumberFromOrder(donasiOrder);
      const firstCategory = donasiOrder.items?.[0]?.category || '';
      const proyekKode = firstCategory.includes('MAD') ? 'MAD' : 'FUN';
      return {
        contact,
        referenceNumber: kwitansiNo,
        orderCode: donasiOrder.orderNumber,
        ekspedisi: undefined,
        subtitle: `${donasiOrder.orderNumber} · ${donasiOrder.date}`,
        itemStockOrDetail: donasiOrder.totalDana,
        proyekKode,
        existingHistory: donasiOrder.whatsappSendHistory || [],
        lastSentAt: donasiOrder.lastWhatsappSentAt,
        linkedSalurOrder: undefined,
      };
    }

    if (kind === 'resi_salur' && resiItem && !salurOrder) {
      const { contact, linkedOrder } = resolveResiContactInfo(
        resiItem,
        salurOrders,
        identitasList,
        organisasiList
      );
      return {
        contact,
        referenceNumber: resiItem.resi,
        orderCode: linkedOrder?.orderNumber || resiItem.kode || '-',
        ekspedisi: resiItem.ekspedisi,
        subtitle: `Ekspedisi ${resiItem.ekspedisi} · ${linkedOrder?.orderNumber || resiItem.kode || resiItem.tanggal}`,
        itemStockOrDetail: `${resiItem.ekspedisi} · ${resiItem.resi}`,
        proyekKode: 'MAD',
        existingHistory: resiItem.whatsappSendHistory || linkedOrder?.whatsappResiHistory || [],
        lastSentAt: resiItem.lastWhatsappSentAt || linkedOrder?.lastWhatsappResiSentAt,
        linkedSalurOrder: linkedOrder,
      };
    }

    if (kind === 'resi_salur' && salurOrder) {
      const contact = resolveSalurContactInfo(salurOrder, identitasList, organisasiList);
      const noResi = salurOrder.ekspedisi?.noResi && salurOrder.ekspedisi.noResi !== '-'
        ? salurOrder.ekspedisi.noResi
        : '-';
      const ekspedisi = salurOrder.ekspedisi?.name || 'Ekspedisi';
      return {
        contact,
        referenceNumber: noResi,
        orderCode: salurOrder.orderNumber,
        ekspedisi,
        subtitle: `Ekspedisi ${ekspedisi} · ${salurOrder.orderNumber}`,
        itemStockOrDetail: `${ekspedisi} · ${noResi}`,
        proyekKode: 'MAD',
        existingHistory: salurOrder.whatsappResiHistory || [],
        lastSentAt: salurOrder.lastWhatsappResiSentAt,
        linkedSalurOrder: salurOrder,
      };
    }

    return null;
  }, [
    kind,
    donasiOrder,
    salurOrder,
    resiItem,
    identitasItem,
    customerTarget,
    customerTopic,
    kwitansiNumberOverride,
    salurOrders,
    identitasList,
    organisasiList,
  ]);

  useEffect(() => {
    if (isOpen && resolvedContext) {
      setTone('ramah');
      setCustomerTopic('sapaan');
      setCustomNote('');
      setPhoneInput(resolvedContext.contact.phone || '');
      setIsMessageEdited(false);
      setLogToListPM(true);
      setCopiedJustNow(false);
      setIsHistoryExpanded(false);
      setSessionLogs([]);
    }
  }, [
    isOpen,
    donasiOrder?.id,
    salurOrder?.id,
    resiItem?.id,
    identitasItem?.id,
    customerTarget?.codeId,
    customerTarget?.nama,
    kind,
  ]);

  useEffect(() => {
    if (!isOpen || !resolvedContext || isMessageEdited) return;
    if (kind === 'customer_direct') {
      setMessageText(
        generateCustomerDirectWhatsappMessage({
          nama: resolvedContext.contact.nama,
          panggilan: resolvedContext.contact.panggilan,
          codeId: resolvedContext.contact.codeId,
          topic: customerTopic,
          tone,
          customNote,
        })
      );
    } else if (kind === 'kwitansi_donasi' && donasiOrder) {
      setMessageText(
        generateKwitansiDonasiWhatsappMessage({
          order: donasiOrder,
          kwitansiNumber: resolvedContext.referenceNumber,
          recipientPanggilan: resolvedContext.contact.panggilan,
          includePelimpahanJasa,
          tone,
          customNote,
        })
      );
    } else if (kind === 'resi_salur') {
      setMessageText(
        generateResiSalurWhatsappMessage({
          order: resolvedContext.linkedSalurOrder || salurOrder || undefined,
          resiItem: resiItem || undefined,
          noResi: resolvedContext.referenceNumber === '-' ? '' : resolvedContext.referenceNumber,
          ekspedisi: resolvedContext.ekspedisi,
          recipientPanggilan: resolvedContext.contact.panggilan,
          tone,
          customNote,
        })
      );
    }
  }, [
    isOpen,
    kind,
    donasiOrder,
    salurOrder,
    resiItem,
    customerTopic,
    resolvedContext,
    includePelimpahanJasa,
    tone,
    customNote,
    isMessageEdited,
  ]);

  if (!isOpen || !resolvedContext) return null;

  const normalizedPhone = normalizeWhatsappPhone(phoneInput);
  const waUrl = buildWhatsappSendUrl(phoneInput, messageText);
  const combinedHistory = [...sessionLogs, ...resolvedContext.existingHistory];
  const latestSentAt = sessionLogs[0]?.sentAt || resolvedContext.lastSentAt;
  const targetListPMName =
    kind === 'kwitansi_donasi'
      ? 'Kirim Kwitansi Donasi'
      : kind === 'customer_direct'
      ? 'Follow Up Customer'
      : 'Kirim Resi';

  const persistDispatch = (channel: 'whatsapp_open' | 'manual_mark') => {
    const topicLabel =
      kind === 'customer_direct' ? getCustomerDirectTopicLabel(customerTopic) : undefined;
    const logEntry = createWhatsappDispatchLog({
      kind,
      phone: phoneInput,
      recipientName: resolvedContext.contact.nama,
      referenceNumber: resolvedContext.referenceNumber,
      identitasId: resolvedContext.contact.identitasId,
      topicLabel,
      ekspedisi: resolvedContext.ekspedisi,
      tone,
      messagePreview: messageText,
      channel,
      loggedToListPM: logToListPM,
      sentBy: currentActorName,
    });

    const listPMItem = logToListPM
      ? buildListPMLogEntryForWhatsapp({
          kind,
          contact: resolvedContext.contact,
          phone: phoneInput,
          referenceNumber: resolvedContext.referenceNumber,
          subtitle: resolvedContext.subtitle,
          itemStockOrDetail: resolvedContext.itemStockOrDetail,
          proyekKode: resolvedContext.proyekKode,
          messageText,
          actorName: currentActorName,
        })
      : null;

    setSessionLogs((prev) => [logEntry, ...prev]);

    dispatchAuditEvent({
      module:
        kind === 'kwitansi_donasi'
          ? 'DONASI'
          : kind === 'customer_direct'
          ? 'IDENTITAS'
          : 'S-SALUR',
      recordId: resolvedContext.orderCode,
      recordTitle: `${resolvedContext.contact.nama} (${resolvedContext.referenceNumber})`,
      actionType: 'Kirim WA',
      field:
        kind === 'kwitansi_donasi'
          ? 'Kwitansi Donasi WhatsApp'
          : kind === 'customer_direct'
          ? 'Kontak Langsung Customer'
          : 'Nomor Resi WhatsApp',
      oldValue: resolvedContext.lastSentAt || '-',
      newValue: `${phoneInput.trim() || 'WA Link'}${logToListPM ? ` · Tercatat di List PM (${targetListPMName})` : ''}`,
      alasan:
        channel === 'whatsapp_open'
          ? 'Kirim otomatis via WhatsApp dan sinkronisasi riwayat List PM & Last Contacted'
          : 'Ditandai terkirim secara manual dan dicatat ke List PM & Last Contacted',
      author: currentActorName,
    });

    onDispatchCompleted?.({
      logEntry,
      listPMItem,
      donasiOrderId: donasiOrder?.id,
      salurOrderId: resolvedContext.linkedSalurOrder?.id || salurOrder?.id,
      resiItemId: resiItem?.id,
      identitasId: resolvedContext.contact.identitasId,
      codeId: resolvedContext.contact.codeId,
    });
  };

  const handleCopyOnly = async () => {
    await copyTextToClipboard(messageText);
    setCopiedJustNow(true);
    window.setTimeout(() => setCopiedJustNow(false), 2000);
    onShowToast?.('Pesan WhatsApp berhasil disalin ke clipboard');
  };

  const handleSendViaWhatsapp = async () => {
    await copyTextToClipboard(messageText);
    setCopiedJustNow(true);
    window.setTimeout(() => setCopiedJustNow(false), 2200);
    persistDispatch('whatsapp_open');
    onShowToast?.(
      logToListPM
        ? `Pesan disalin, WhatsApp dibuka & Last Contacted diperbarui`
        : 'Pesan disalin, WhatsApp dibuka & Last Contacted diperbarui'
    );
  };

  const handleManualMarkSent = () => {
    persistDispatch('manual_mark');
    onShowToast?.(
      logToListPM
        ? `Ditandai terkirim, masuk List PM & Last Contacted diperbarui`
        : 'Status kontak & Last Contacted diperbarui'
    );
  };

  const handleResetTemplate = () => {
    setIsMessageEdited(false);
    setCustomNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#05828e] text-white flex items-center justify-center shrink-0">
              {kind === 'kwitansi_donasi' ? (
                <Receipt className="w-4 h-4" />
              ) : kind === 'customer_direct' ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {kind === 'kwitansi_donasi'
                  ? 'Kirim Kwitansi Donasi via WhatsApp'
                  : kind === 'customer_direct'
                  ? 'Kirim WhatsApp ke Customer'
                  : 'Kirim Nomor Resi S-SALUR via WhatsApp'}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {resolvedContext.contact.nama}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{resolvedContext.referenceNumber}</span>
                {latestSentAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      Kontak terakhir {formatBillingTimestamp(latestSentAt, true)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup modal WhatsApp"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Document Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {resolvedContext.orderCode}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{resolvedContext.itemStockOrDetail}</span>
            </div>
            {resolvedContext.contact.codeId && (
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                ID: {resolvedContext.contact.codeId}
              </span>
            )}
          </div>

          {/* Topic Selector when contacting directly from Customer / Identitas */}
          {kind === 'customer_direct' && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Tujuan / Topik Kontak Customer
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'sapaan', label: 'Sapaan & Follow Up' },
                    { id: 'konfirmasi_pesanan', label: 'Konfirmasi Pesanan' },
                    { id: 'terima_kasih', label: 'Terima Kasih' },
                    { id: 'bebas', label: 'Pesan Bebas' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setCustomerTopic(opt.id);
                      setIsMessageEdited(false);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer text-center ${
                      customerTopic === opt.id
                        ? 'bg-[#05828e] border-[#05828e] text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recipient Phone & Tone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
            <div className="sm:col-span-7 space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Nomor WhatsApp Penerima
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[#05828e]/30 focus:border-[#05828e]"
                />
              </div>
              {normalizedPhone ? (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-mono tabular-nums">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Tujuan langsung: wa.me/{normalizedPhone}</span>
                </p>
              ) : (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Nomor HP belum terdeteksi; isi manual atau buka WA untuk pilih kontak</span>
                </p>
              )}
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-200">
                Gaya Bahasa Pesan
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setTone('ramah');
                    setIsMessageEdited(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    tone === 'ramah'
                      ? 'bg-white dark:bg-slate-700 text-[#05828e] dark:text-teal-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Ramah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTone('formal');
                    setIsMessageEdited(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    tone === 'formal'
                      ? 'bg-white dark:bg-slate-700 text-[#05828e] dark:text-teal-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Formal
                </button>
              </div>
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-200">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => {
                setCustomNote(e.target.value);
                setIsMessageEdited(false);
              }}
              placeholder={
                kind === 'kwitansi_donasi'
                  ? 'Contoh: E-Kwitansi PDF juga kami lampirkan terpisah'
                  : kind === 'customer_direct'
                  ? 'Contoh: Ada program buku Dharma terbaru bulan ini'
                  : 'Contoh: Paket dikirim menggunakan kemasan ekstra aman'
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#05828e]/30 focus:border-[#05828e]"
            />
          </div>

          {/* Message Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#05828e]" />
                <span>Pratinjau & Edit Pesan WhatsApp</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {messageText.length} karakter
                </span>
                {isMessageEdited && (
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="text-[11px] font-semibold text-[#05828e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Template</span>
                  </button>
                )}
              </div>
            </div>
            <textarea
              rows={9}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setIsMessageEdited(true);
              }}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#05828e]/30 focus:border-[#05828e]"
            />
          </div>

          {/* Auto-log to List PM Toggle */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 cursor-pointer">
            <input
              type="checkbox"
              checked={logToListPM}
              onChange={(e) => setLogToListPM(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#05828e] focus:ring-[#05828e]"
            />
            <div className="leading-snug">
              <div className="font-semibold text-slate-800 dark:text-slate-100">
                Catat otomatis ke riwayat List PM (Status: Terkirim)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Entri pengiriman akan masuk ke proyek{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {targetListPMName}
                </span>{' '}
                pada modul List PM lengkap dengan nomor HP, template isi pesan, dan waktu kirim.
              </div>
            </div>
          </label>

          {/* Collapsible History */}
          {combinedHistory.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#05828e] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Riwayat Pengiriman WhatsApp ({combinedHistory.length})</span>
                </span>
                {isHistoryExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isHistoryExpanded && (
                <div className="mt-2.5 space-y-2 max-h-40 overflow-y-auto pr-1">
                  {combinedHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-[11px]"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {h.referenceNumber} · {h.phone}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {formatBillingTimestamp(h.sentAt)} · oleh {h.sentBy}
                          {h.loggedToListPM ? ' · Masuk List PM' : ''}
                        </div>
                      </div>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
                        {h.channel === 'whatsapp_open' ? 'WA Dibuka' : 'Manual'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyOnly}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedJustNow ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{copiedJustNow ? 'Tersalin' : 'Salin Pesan'}</span>
            </button>

            <button
              type="button"
              onClick={handleManualMarkSent}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-[#05828e]" />
              <span>Tandai Terkirim & Catat PM</span>
            </button>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSendViaWhatsapp}
            className="px-4 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Kirim WhatsApp & Catat PM</span>
            <ExternalLink className="w-3 h-3 opacity-85" />
          </a>
        </div>
      </div>
    </div>
  );
};
