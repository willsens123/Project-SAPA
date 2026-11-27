import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  MessageCircle,
  Package,
  Search,
  Send,
  ShieldAlert,
  Warehouse,
  X,
} from 'lucide-react';
import {
  AppView,
  ComplaintItem,
  ListPMItem,
  OrganisasiItem,
  WhatsappDispatchLog,
} from '../types';
import { IdentitasItem } from '../identitasData';
import { SalurProduct } from '../salurData';
import { dispatchAuditEvent } from '../utils/auditEventBus';
import {
  ComplaintReminderItem,
  LowStockReminderItem,
  OperationalReminderDigest,
  PMDueReminderItem,
  markListPMReminderSent,
} from '../utils/operationalReminderHelper';
import {
  CustomerDirectTargetInput,
  ModalKirimWhatsappOtomatis,
} from './ModalKirimWhatsappOtomatis';

export type OperationalNotificationTab = 'semua' | 'komplain' | 'pm' | 'stok';

interface OperationalNotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  digest: OperationalReminderDigest;
  stockThreshold: number;
  onChangeStockThreshold: (nextThreshold: number) => void;
  initialTab?: OperationalNotificationTab;
  identitasList: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  currentActorName?: string;
  onUpdateComplaint: (item: ComplaintItem) => void;
  onSaveListPMItem: (item: ListPMItem) => void;
  onCustomerWhatsappDispatchCompleted?: (payload: {
    logEntry: WhatsappDispatchLog;
    listPMItem: ListPMItem | null;
    identitasId?: string;
    organisasiId?: string;
    codeId?: string;
  }) => void;
  onNavigateView: (view: AppView) => void;
  onShowToast?: (msg: string) => void;
}

export const OperationalNotificationCenterDrawer: React.FC<
  OperationalNotificationCenterDrawerProps
> = ({
  isOpen,
  onClose,
  digest,
  stockThreshold,
  onChangeStockThreshold,
  initialTab = 'semua',
  identitasList,
  organisasiList = [],
  currentActorName = 'Admin YPPLN',
  onUpdateComplaint,
  onSaveListPMItem,
  onCustomerWhatsappDispatchCompleted,
  onNavigateView,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<OperationalNotificationTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waIdentitas, setWaIdentitas] = useState<IdentitasItem | null>(null);
  const [waTarget, setWaTarget] = useState<CustomerDirectTargetInput | null>(null);
  const [activePMFollowup, setActivePMFollowup] = useState<PMDueReminderItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !waModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, waModalOpen, onClose]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredComplaints = useMemo(() => {
    if (!normalizedSearch) return digest.complaintAlerts;
    return digest.complaintAlerts.filter((item) => {
      const c = item.complaint;
      return (
        c.nama.toLowerCase().includes(normalizedSearch) ||
        (c.kodeDonatur || '').toLowerCase().includes(normalizedSearch) ||
        c.jenisKomplain.toLowerCase().includes(normalizedSearch) ||
        c.komplain.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [digest.complaintAlerts, normalizedSearch]);

  const filteredPMs = useMemo(() => {
    if (!normalizedSearch) return digest.pmDueAlerts;
    return digest.pmDueAlerts.filter((item) => {
      return (
        item.proyekSapa.toLowerCase().includes(normalizedSearch) ||
        item.proyekKode.toLowerCase().includes(normalizedSearch) ||
        item.targetNama.toLowerCase().includes(normalizedSearch) ||
        (item.targetCodeId || '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [digest.pmDueAlerts, normalizedSearch]);

  const filteredLowStock = useMemo(() => {
    if (!normalizedSearch) return digest.lowStockAlerts;
    return digest.lowStockAlerts.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.code.toLowerCase().includes(normalizedSearch) ||
        (item.gudangInfo || '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [digest.lowStockAlerts, normalizedSearch]);

  if (!isOpen) return null;

  const handleAdvanceComplaintStatus = (
    item: ComplaintReminderItem,
    nextStatus: 'Diproses' | 'Selesai'
  ) => {
    const prevStatus = item.status;
    onUpdateComplaint({
      ...item.complaint,
      status: nextStatus,
    });
    dispatchAuditEvent({
      module: 'IDENTITAS',
      recordId: item.complaint.kodeDonatur || item.complaint.id,
      recordTitle: `Komplain: ${item.complaint.nama}`,
      actionType: 'Ubah',
      field: 'Status Komplain',
      oldValue: prevStatus,
      newValue: nextStatus,
      alasan: `Tindak lanjut langsung dari Pusat Pengingat Operasional oleh ${currentActorName}`,
      author: currentActorName,
    });
    onShowToast?.(
      `Komplain "${item.complaint.nama}" diperbarui menjadi ${nextStatus}`
    );
  };

  const handleOpenComplaintWA = (item: ComplaintReminderItem) => {
    setActivePMFollowup(null);
    if (item.matchedIdentitas) {
      setWaIdentitas(item.matchedIdentitas);
      setWaTarget(null);
    } else {
      setWaIdentitas(null);
      setWaTarget({
        identitasId: item.complaint.identitasId,
        codeId: item.complaint.kodeDonatur,
        nama: item.complaint.nama.replace(/^\d+\s+/, ''),
        panggilan: item.complaint.subNama,
        phone: item.phone || '',
      });
    }
    setWaModalOpen(true);
  };

  const handleOpenPMWA = (pmItem: PMDueReminderItem) => {
    setActivePMFollowup(pmItem);
    if (pmItem.matchedIdentitas) {
      setWaIdentitas(pmItem.matchedIdentitas);
      setWaTarget({
        identitasId: pmItem.matchedIdentitas.id,
        codeId: pmItem.matchedIdentitas.codeId,
        nama: pmItem.matchedIdentitas.namaLengkap,
        panggilan: pmItem.matchedIdentitas.namaPanggilan,
        phone: pmItem.nomorHp || pmItem.matchedIdentitas.nomorHandPhone,
        status: pmItem.matchedIdentitas.status,
      });
    } else {
      setWaIdentitas(null);
      setWaTarget({
        identitasId: pmItem.identitasId,
        codeId: pmItem.targetCodeId,
        nama: pmItem.targetNama,
        phone: pmItem.nomorHp || '',
      });
    }
    setWaModalOpen(true);
  };

  const handleMarkPMRowDone = (pmItem: PMDueReminderItem) => {
    const updatedPlan = markListPMReminderSent(pmItem.plan, {
      rowId: pmItem.row?.id,
      recipientId: pmItem.recipient?.id,
      identitasId: pmItem.identitasId,
      codeId: pmItem.targetCodeId,
      nama: pmItem.targetNama,
    });
    onSaveListPMItem(updatedPlan);
    dispatchAuditEvent({
      module: 'PROYEK',
      recordId: pmItem.plan.id,
      recordTitle: `List PM: ${pmItem.proyekSapa} · ${pmItem.targetNama}`,
      actionType: 'Kirim WA',
      field: 'Progress List PM',
      oldValue: `${pmItem.progressPercent}%`,
      newValue: `${updatedPlan.progressPercent}%`,
      alasan: `Ditandai terkirim langsung dari Pusat Pengingat Operasional oleh ${currentActorName}`,
      author: currentActorName,
    });
    onShowToast?.(
      `PM "${pmItem.targetNama}" (${pmItem.proyekSapa}) ditandai terkirim (${updatedPlan.progressPercent}%)`
    );
  };

  const showComplaints = activeTab === 'semua' || activeTab === 'komplain';
  const showPMs = activeTab === 'semua' || activeTab === 'pm';
  const showLowStock = activeTab === 'semua' || activeTab === 'stok';

  const visibleCount =
    (showComplaints ? filteredComplaints.length : 0) +
    (showPMs ? filteredPMs.length : 0) +
    (showLowStock ? filteredLowStock.length : 0);

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex justify-end bg-slate-950/50 backdrop-blur-[1px] animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Pusat Notifikasi dan Pengingat Harian Operasional"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <aside className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-400 flex items-center justify-center shrink-0">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Pusat Notifikasi &amp; Pengingat Harian
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span>{digest.complaintAlerts.length} Komplain Aktif</span>
                  <span aria-hidden="true">·</span>
                  <span>{digest.pmDueAlerts.length} PM Jatuh Tempo</span>
                  <span aria-hidden="true">·</span>
                  <span>{digest.lowStockAlerts.length} Stok Menipis</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Panel Pengingat"
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls: Segmented Tabs + Search + Stock Threshold */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2.5 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl overflow-x-auto">
              {(
                [
                  { id: 'semua', label: 'Semua', count: digest.totalUrgentCount },
                  {
                    id: 'komplain',
                    label: 'Komplain Open',
                    count: digest.complaintAlerts.length,
                  },
                  {
                    id: 'pm',
                    label: 'PM Jatuh Tempo',
                    count: digest.pmDueAlerts.length,
                  },
                  {
                    id: 'stok',
                    label: 'Stok Menipis',
                    count: digest.lowStockAlerts.length,
                  },
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer font-mono tabular-nums ${
                      active
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama donatur, proyek PM, kode, atau item S-SALUR..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {(activeTab === 'semua' || activeTab === 'stok') && (
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg text-[11px] shrink-0 self-start sm:self-auto">
                  {[0, 10, 20].map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => onChangeStockThreshold(th)}
                      className={`px-2 py-1 rounded-md font-semibold font-mono tabular-nums transition-colors whitespace-nowrap cursor-pointer ${
                        stockThreshold === th
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {th === 0 ? 'Habis (0)' : `Stok ≤ ${th}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {visibleCount === 0 && (
              <div className="py-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {normalizedSearch
                    ? 'Tidak ada pengingat yang cocok dengan pencarian'
                    : 'Semua tindak lanjut operasional pada filter ini sudah beres'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {normalizedSearch
                    ? 'Coba ubah kata kunci pencarian atau pindah ke tab kategori lain.'
                    : 'Komplain aktif, jadwal List PM jatuh tempo, dan stok gudang dalam kondisi terkendali.'}
                </p>
              </div>
            )}

            {/* SECTION 1: KOMPLAIN OPEN / DIPROSES */}
            {showComplaints && filteredComplaints.length > 0 && (
              <section aria-label="Komplain Open dan Diproses">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Komplain Perlu Tindak Lanjut
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      ({filteredComplaints.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateView('complaint');
                    }}
                    className="text-xs font-semibold text-[#05828e] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>Buka Menu Komplain</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredComplaints.map((item) => {
                    const c = item.complaint;
                    const isOpenStatus = item.status === 'Open';
                    return (
                      <div key={item.id} className="py-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {c.nama}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  isOpenStatus
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                Status: {item.status}
                              </span>
                              {item.isBlacklisted && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                  <span>Blacklist</span>
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono tabular-nums">
                              <span>{c.tanggal}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-sans">{c.jenisKomplain}</span>
                              {c.kodeDonatur && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>ID {c.kodeDonatur}</span>
                                </>
                              )}
                              {item.phone && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{item.phone}</span>
                                </>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                              {c.komplain}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {isOpenStatus && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceComplaintStatus(item, 'Diproses')}
                              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Tandai Diproses
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleAdvanceComplaintStatus(item, 'Selesai')}
                            className="px-3 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046d77] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tandai Selesai</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenComplaintWA(item)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Hubungi WA</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION 2: LIST PM JATUH TEMPO / PENDING */}
            {showPMs && filteredPMs.length > 0 && (
              <section aria-label="List PM Jatuh Tempo dan Belum Terkirim">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      List PM Jatuh Tempo &amp; Pending
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      ({filteredPMs.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateView('listPM');
                    }}
                    className="text-xs font-semibold text-[#05828e] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>Buka Menu List PM</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPMs.slice(0, 30).map((pmItem) => {
                    const urgencyText = pmItem.isOverdue
                      ? `Terlambat ${Math.abs(pmItem.diffDays || 0)} hari`
                      : pmItem.isDueToday
                      ? 'Jatuh tempo hari ini'
                      : pmItem.diffDays !== undefined && pmItem.diffDays <= 7
                      ? `${pmItem.diffDays} hari lagi`
                      : pmItem.deadlineDisplay;

                    return (
                      <div key={pmItem.id} className="py-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {pmItem.targetNama}
                              </span>
                              <span
                                className={`text-xs font-bold font-mono tabular-nums ${
                                  pmItem.isOverdue
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : pmItem.isDueToday
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-[#05828e] dark:text-teal-400'
                                }`}
                              >
                                {urgencyText}
                              </span>
                              {pmItem.isBlacklisted && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                  <span>Blacklist</span>
                                </span>
                              )}
                            </div>

                            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono tabular-nums">
                              <span className="font-sans font-medium text-slate-700 dark:text-slate-300">
                                {pmItem.proyekSapa} ({pmItem.proyekKode})
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>Tenggat {pmItem.deadlineDisplay}</span>
                              {pmItem.nomorHp && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{pmItem.nomorHp}</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span>Progres {pmItem.progressPercent}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPMWA(pmItem)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkPMRowDone(pmItem)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#05828e] dark:hover:text-teal-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Tandai Terkirim</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION 3: STOK S-SALUR MENIPIS / HABIS */}
            {showLowStock && filteredLowStock.length > 0 && (
              <section aria-label="Stok S-SALUR Menipis dan Habis">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Stok Item S-SALUR Menipis / Habis
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      ({filteredLowStock.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateView('stockInOutSalur');
                    }}
                    className="text-xs font-semibold text-[#05828e] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>Stock In/Out</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLowStock.map((item: LowStockReminderItem) => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {item.isOutOfStock ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          ) : (
                            <Warehouse className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </span>
                          <span
                            className={`text-xs font-extrabold font-mono tabular-nums shrink-0 ${
                              item.isOutOfStock
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {item.stock} pcs ({item.isOutOfStock ? 'Habis' : 'Menipis'})
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="font-mono">{item.code}</span>
                          {item.gudangInfo && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{item.gudangInfo}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateView('formStockInOutSalur');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046d77] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Catat Restok
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateView('stokItemSalur');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#05828e] dark:hover:text-teal-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Cek Gudang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Footer Quick Links */}
          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {digest.openComplaintCount} Open · {digest.overduePMCount} PM Mendesak ·{' '}
              {digest.outOfStockCount} Stok Habis
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateView('reportPenjualanValuasiSalur');
                }}
                className="font-semibold text-[#05828e] dark:text-teal-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                Valuasi Stok S-SALUR
              </button>
            </div>
          </div>
        </aside>
      </div>

      <ModalKirimWhatsappOtomatis
        isOpen={waModalOpen}
        onClose={() => {
          setWaModalOpen(false);
          setActivePMFollowup(null);
        }}
        kind="customer_direct"
        identitasItem={waIdentitas}
        customerTarget={waTarget}
        identitasList={identitasList}
        organisasiList={organisasiList}
        currentActorName={currentActorName}
        onDispatchCompleted={(payload) => {
          onCustomerWhatsappDispatchCompleted?.(payload);
          if (activePMFollowup) {
            const updatedPlan = markListPMReminderSent(activePMFollowup.plan, {
              rowId: activePMFollowup.row?.id,
              recipientId: activePMFollowup.recipient?.id,
              identitasId: activePMFollowup.identitasId,
              codeId: activePMFollowup.targetCodeId,
              nama: activePMFollowup.targetNama,
            });
            onSaveListPMItem(updatedPlan);
            setActivePMFollowup(null);
          }
        }}
        onShowToast={onShowToast}
      />
    </>
  );
};
