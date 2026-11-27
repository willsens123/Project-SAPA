import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  ListTodo,
  MessageCircle,
  Package,
  Send,
  ShieldAlert,
  Warehouse,
} from 'lucide-react';
import {
  AppView,
  ComplaintItem,
  DharmaPatronRutinItem,
  ListPMItem,
  OrganisasiItem,
  PatronWhatsappBillingLog,
  ProjectItem,
  RekeningItem,
  TodoTaskItem,
} from '../types';
import { IdentitasItem } from '../identitasData';
import { SalurProduct } from '../salurData';
import { getStoredStokSalurItems } from '../stokSalurData';
import { formatIsoDateIndo, parseFinancialDateToIso } from '../utils/financialDateFilter';
import {
  diffDaysBetweenIso,
  SEED_REFERENCE_DATE_ISO,
  toLocalIsoDate,
} from '../utils/projectDeadlineUtils';
import { getPatronBillingStatus } from '../utils/patronWhatsappHelper';
import { ModalTagihanWhatsappPatron } from './ModalTagihanWhatsappPatron';
import {
  buildOperationalReminderDigest,
  markListPMReminderSent,
} from '../utils/operationalReminderHelper';
import { OperationalNotificationTab } from './OperationalNotificationCenterDrawer';

interface HomeOperationalAlertsProps {
  projects: ProjectItem[];
  todoTasks: Record<string, TodoTaskItem[]>;
  dharmaPatronList: DharmaPatronRutinItem[];
  salurItems: SalurProduct[];
  complaints?: ComplaintItem[];
  listPMItems?: ListPMItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  rekeningList?: RekeningItem[];
  currentAdminName?: string;
  onRecordWhatsappBilling?: (
    patron: DharmaPatronRutinItem,
    entry: PatronWhatsappBillingLog
  ) => void;
  onUpdateComplaint?: (item: ComplaintItem) => void;
  onSaveListPMItem?: (item: ListPMItem) => void;
  onOpenOperationalNotifications?: (initialTab?: OperationalNotificationTab) => void;
  onShowToast?: (msg: string) => void;
  onNavigateView: (view: AppView) => void;
  onOpenProjectTodos?: (project: ProjectItem) => void;
}

interface DueTodoAlertItem {
  id: string;
  projectId: string;
  projectName: string;
  divisi: string;
  project?: ProjectItem;
  taskTitle: string;
  assignee: string;
  deadlineIso: string;
  deadlineDisplay: string;
  diffDays: number;
}

interface LowStockAlertItem {
  id: string;
  title: string;
  code: string;
  stock: number;
  gudangInfo?: string;
  source: 'product' | 'container';
}

const LOW_STOCK_THRESHOLD = 10;

export const HomeOperationalAlerts: React.FC<HomeOperationalAlertsProps> = ({
  projects,
  todoTasks,
  dharmaPatronList,
  salurItems,
  complaints = [],
  listPMItems = [],
  identitasList = [],
  organisasiList = [],
  rekeningList = [],
  currentAdminName,
  onRecordWhatsappBilling,
  onUpdateComplaint,
  onSaveListPMItem,
  onOpenOperationalNotifications,
  onShowToast,
  onNavigateView,
  onOpenProjectTodos,
}) => {
  const [reminderTab, setReminderTab] = useState<'todo' | 'patron' | 'komplain' | 'pm'>('todo');
  const [stockThreshold, setStockThreshold] = useState<number>(LOW_STOCK_THRESHOLD);
  const [stokSyncTick, setStokSyncTick] = useState(0);
  const [whatsappTargetPatrons, setWhatsappTargetPatrons] = useState<DharmaPatronRutinItem[]>([]);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);

  React.useEffect(() => {
    const handleStokUpdated = () => setStokSyncTick((prev) => prev + 1);
    window.addEventListener('stok_salur_updated', handleStokUpdated);
    window.addEventListener('stock_in_out_updated', handleStokUpdated);
    return () => {
      window.removeEventListener('stok_salur_updated', handleStokUpdated);
      window.removeEventListener('stock_in_out_updated', handleStokUpdated);
    };
  }, []);

  const realTodayIso = useMemo(() => toLocalIsoDate(new Date()), []);

  // 1. Overdue & Due-Soon To-Do List Items (scoped to visible projects)
  const dueTodoItems = useMemo<DueTodoAlertItem[]>(() => {
    const projectMap = new Map<string, ProjectItem>(projects.map((p) => [p.id, p]));
    const items: DueTodoAlertItem[] = [];

    Object.entries(todoTasks).forEach(([projectId, taskList]) => {
      const proj = projectMap.get(projectId);
      // Respect project scoping: if projects array is scoped to user's division, skip hidden projects
      if (!proj && projects.length > 0) return;

      const list = Array.isArray(taskList) ? taskList : [];
      list.forEach((task) => {
        const isDone =
          Boolean(task.completed) ||
          task.status === 'completed' ||
          task.statusPengerjaan === 'selesai';
        if (isDone) return;
        if (!task.deadline || !task.deadline.trim()) return;

        const iso = parseFinancialDateToIso(task.deadline);
        if (!iso) return;

        // Evaluate relative to realTodayIso for recent tasks (>= 2023) and SEED_REFERENCE_DATE_ISO for 2021 seed tasks
        const refIso = iso.startsWith('2021-') ? SEED_REFERENCE_DATE_ISO : realTodayIso;
        const diffDays = diffDaysBetweenIso(iso, refIso);

        // Alert window: overdue (<= -1 day) OR due within 7 days (0..7)
        if (diffDays <= 7) {
          items.push({
            id: `${projectId}-${task.id}`,
            projectId,
            projectName: proj?.namaKegiatan || 'Proyek SAPA',
            divisi: task.divisi || proj?.divisi || '-',
            project: proj,
            taskTitle: task.task,
            assignee: task.idKaryawanAssignJob || '-',
            deadlineIso: iso,
            deadlineDisplay: formatIsoDateIndo(iso),
            diffDays,
          });
        }
      });
    });

    items.sort((a, b) => a.diffDays - b.diffDays);
    return items;
  }, [projects, todoTasks, realTodayIso]);

  const overdueTodoCount = useMemo(
    () => dueTodoItems.filter((it) => it.diffDays < 0).length,
    [dueTodoItems]
  );

  // 2. Dharma Patron Outstanding Receivables (Piutang < 0 or bulanPiutang != '-')
  const patronPiutangItems = useMemo(() => {
    return dharmaPatronList
      .filter((item) => {
        const hasNegativeBalance = Number(item.piutang || 0) < 0;
        const hasMonthArrears =
          Boolean(item.bulanPiutang) &&
          item.bulanPiutang!.trim() !== '' &&
          item.bulanPiutang!.trim() !== '-';
        return hasNegativeBalance || hasMonthArrears;
      })
      .sort((a, b) => Number(a.piutang || 0) - Number(b.piutang || 0));
  }, [dharmaPatronList]);

  const totalPiutangNominal = useMemo(() => {
    return patronPiutangItems.reduce((sum, item) => {
      const val = Number(item.piutang || 0);
      return sum + (val < 0 ? Math.abs(val) : Number(item.donasiPerbulan || 0));
    }, 0);
  }, [patronPiutangItems]);

  // 3. Low Stock S-SALUR Items (Product total stock + Warehouse container stock)
  const lowStockItems = useMemo<LowStockAlertItem[]>(() => {
    const alerts: LowStockAlertItem[] = [];

    salurItems.forEach((prod) => {
      const stockVal = Number(prod.stock ?? 0);
      if (stockVal <= stockThreshold) {
        alerts.push({
          id: `prod-${prod.id}`,
          title: prod.title,
          code: prod.code || prod.id,
          stock: stockVal,
          gudangInfo: prod.subJenis || prod.category || 'Katalog Utama S-SALUR',
          source: 'product',
        });
      }
    });

    try {
      const stokContainers = getStoredStokSalurItems();
      const seenProductIds = new Set(alerts.map((a) => a.title.toLowerCase()));
      stokContainers.forEach((stokItem) => {
        (stokItem.containers || []).forEach((cont) => {
          const cStok = Number(cont.stok ?? 0);
          if (cStok <= Math.min(stockThreshold, 10)) {
            alerts.push({
              id: `cont-${stokItem.id}-${cont.id}`,
              title: stokItem.namaItem,
              code: cont.namaContainer,
              stock: cStok,
              gudangInfo: `${cont.lokasiGudang} · ${cont.jenisLokasi}`,
              source: 'container',
            });
          }
        });
        if (
          Number(stokItem.stok ?? 0) <= stockThreshold &&
          !seenProductIds.has(stokItem.namaItem.toLowerCase())
        ) {
          alerts.push({
            id: `stok-${stokItem.id}`,
            title: stokItem.namaItem,
            code: stokItem.productId,
            stock: Number(stokItem.stok ?? 0),
            gudangInfo: `${stokItem.jumlahLokasi} Lokasi Gudang`,
            source: 'product',
          });
        }
      });
    } catch {
      // Safe fallback if local stok container cache is unavailable
    }

    alerts.sort((a, b) => a.stock - b.stock);
    return alerts;
  }, [salurItems, stockThreshold, stokSyncTick]);

  const operationalDigest = useMemo(
    () =>
      buildOperationalReminderDigest({
        complaints,
        listPMList: listPMItems,
        salurItems,
        identitasList,
        stockThreshold,
      }),
    [complaints, listPMItems, salurItems, identitasList, stockThreshold, stokSyncTick]
  );

  const outOfStockCount = useMemo(
    () => lowStockItems.filter((item) => item.stock <= 0).length,
    [lowStockItems]
  );

  return (
    <section
      aria-label="Pengingat Operasional Harian & Peringatan Stok S-SALUR"
      className="grid grid-cols-1 xl:grid-cols-12 gap-5"
    >
      {/* LEFT PANEL: Pengingat Jatuh Tempo To-Do, Komplain Open, List PM & Piutang Patron */}
      <div className="xl:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                {reminderTab === 'todo' ? (
                  <ListTodo className="w-4.5 h-4.5" />
                ) : reminderTab === 'komplain' ? (
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                ) : reminderTab === 'pm' ? (
                  <Clock className="w-4.5 h-4.5" />
                ) : (
                  <CreditCard className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  Pengingat Harian Operasional &amp; Piutang
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5 truncate">
                  {operationalDigest.complaintAlerts.length} Komplain · {operationalDigest.pmDueAlerts.length} PM · {dueTodoItems.length} To-Do · {patronPiutangItems.length} Patron
                </p>
              </div>
            </div>

            {onOpenOperationalNotifications && (
              <button
                type="button"
                onClick={() =>
                  onOpenOperationalNotifications(
                    reminderTab === 'komplain'
                      ? 'komplain'
                      : reminderTab === 'pm'
                      ? 'pm'
                      : 'semua'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-xs font-semibold text-[#05828e] dark:text-teal-400 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Buka Pusat Pengingat</span>
              </button>
            )}
          </div>

          {/* Segmented Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setReminderTab('todo')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 font-mono tabular-nums ${
                reminderTab === 'todo'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              To-Do ({dueTodoItems.length})
            </button>
            <button
              type="button"
              onClick={() => setReminderTab('komplain')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 font-mono tabular-nums ${
                reminderTab === 'komplain'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Komplain Open ({operationalDigest.complaintAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setReminderTab('pm')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 font-mono tabular-nums ${
                reminderTab === 'pm'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              List PM ({operationalDigest.pmDueAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setReminderTab('patron')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 font-mono tabular-nums ${
                reminderTab === 'patron'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Piutang Patron ({patronPiutangItems.length})
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 max-h-[340px] overflow-y-auto">
          {reminderTab === 'komplain' ? (
            operationalDigest.complaintAlerts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Tidak ada komplain Open atau Diproses
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Seluruh keluhan pelanggan sudah ditindaklanjuti dan berstatus Selesai.
                </p>
              </div>
            ) : (
              operationalDigest.complaintAlerts.slice(0, 8).map((item) => {
                const c = item.complaint;
                const isOpen = item.status === 'Open';
                return (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                          {c.nama}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isOpen
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.isBlacklisted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Blacklist</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span className="font-mono tabular-nums">{c.tanggal}</span>
                        <span aria-hidden="true">·</span>
                        <span>{c.jenisKomplain}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[240px]">{c.komplain}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOpen && onUpdateComplaint && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateComplaint({ ...c, status: 'Diproses' });
                            onShowToast?.(`Komplain "${c.nama}" diubah ke Diproses`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Proses
                        </button>
                      )}
                      {onUpdateComplaint && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateComplaint({ ...c, status: 'Selesai' });
                            onShowToast?.(`Komplain "${c.nama}" ditandai Selesai`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046d77] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : reminderTab === 'pm' ? (
            operationalDigest.pmDueAlerts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Tidak ada jadwal List PM yang jatuh tempo atau pending
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Semua broadcast dan pesan personalisasi PM saat ini sudah terkirim.
                </p>
              </div>
            ) : (
              operationalDigest.pmDueAlerts.slice(0, 8).map((pmItem) => {
                const statusText = pmItem.isOverdue
                  ? `Terlambat ${Math.abs(pmItem.diffDays || 0)} hari`
                  : pmItem.isDueToday
                  ? 'Jatuh tempo hari ini'
                  : pmItem.deadlineDisplay;
                return (
                  <div
                    key={pmItem.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
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
                          {statusText}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono tabular-nums">
                        <span className="font-sans font-medium text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                          {pmItem.proyekSapa} ({pmItem.proyekKode})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Progres {pmItem.progressPercent}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSaveListPMItem && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = markListPMReminderSent(pmItem.plan, {
                              rowId: pmItem.row?.id,
                              recipientId: pmItem.recipient?.id,
                              identitasId: pmItem.identitasId,
                              codeId: pmItem.targetCodeId,
                              nama: pmItem.targetNama,
                            });
                            onSaveListPMItem(updated);
                            onShowToast?.(
                              `PM "${pmItem.targetNama}" ditandai terkirim (${updated.progressPercent}%)`
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046d77] text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Send className="w-3 h-3" />
                          <span>Terkirim</span>
                        </button>
                      )}
                      {onOpenOperationalNotifications && (
                        <button
                          type="button"
                          onClick={() => onOpenOperationalNotifications('pm')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          WA
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : reminderTab === 'todo' ? (
            dueTodoItems.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Tidak ada tugas To-Do yang terlambat atau mendekati tenggat
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Semua item To-Do dengan tanggal tenggat berada dalam status aman atau sudah selesai.
                </p>
              </div>
            ) : (
              dueTodoItems.slice(0, 8).map((item) => {
                const isOverdue = item.diffDays < 0;
                const isUrgent = item.diffDays >= 0 && item.diffDays <= 2;
                const statusLabel = isOverdue
                  ? `Terlambat ${Math.abs(item.diffDays)} hari`
                  : item.diffDays === 0
                  ? 'Jatuh tempo hari ini'
                  : `${item.diffDays} hari lagi`;

                return (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-full sm:max-w-xs">
                          {item.taskTitle}
                        </span>
                        <span
                          className={`text-xs font-bold font-mono tabular-nums ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : isUrgent
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-[#05828e] dark:text-teal-400'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono tabular-nums">
                        <span className="font-sans font-medium text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                          {item.projectName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Divisi {item.divisi}</span>
                        <span aria-hidden="true">·</span>
                        <span>PIC {item.assignee}</span>
                        <span aria-hidden="true">·</span>
                        <span>Tenggat {item.deadlineDisplay}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (item.project && onOpenProjectTodos) {
                          onOpenProjectTodos(item.project);
                        } else {
                          onNavigateView('todoList');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#05828e] dark:hover:text-teal-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Buka To-Do
                    </button>
                  </div>
                );
              })
            )
          ) : patronPiutangItems.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Tidak ada tunggakan piutang Dharma Patron
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Seluruh kontribusi rutin Dharma Patron sudah tercatat lunas.
              </p>
            </div>
          ) : (
            patronPiutangItems.slice(0, 8).map((patron) => {
              const amount = Math.abs(Number(patron.piutang || patron.donasiPerbulan || 0));
              const billingStatus = getPatronBillingStatus(patron);
              return (
                <div
                  key={patron.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {patron.namaDonatur}
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                        -Rp{amount.toLocaleString('id-ID')}
                      </span>
                      {billingStatus.isBilledThisMonth && (
                        <span
                          title={`Sudah ditagih ${billingStatus.fullDateLabel} oleh ${billingStatus.lastBilledBy || 'Admin'}`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
                        >
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Sudah Ditagih ({billingStatus.compactDateLabel})</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono tabular-nums">
                      <span>ID {patron.noDonatur}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">
                        Bulan Piutang: {patron.bulanPiutang || 'Aktif'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Rutin Rp{Number(patron.donasiPerbulan || 0).toLocaleString('id-ID')}/bln</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappTargetPatrons([patron]);
                        setIsWhatsappModalOpen(true);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                        billingStatus.isBilledThisMonth
                          ? 'border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title={
                        billingStatus.isBilledThisMonth
                          ? `Terakhir ditagih ${billingStatus.fullDateLabel} oleh ${billingStatus.lastBilledBy || 'Admin'}`
                          : 'Buat pesan tagihan WhatsApp'
                      }
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{billingStatus.isBilledThisMonth ? 'Tagih Lagi' : 'Tagih WA'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateView('listDharmaPatronRutin')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#05828e] dark:hover:text-teal-400 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Tindak Lanjut
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Action */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {reminderTab === 'todo'
              ? `${overdueTodoCount} To-Do terlambat`
              : reminderTab === 'komplain'
              ? `${operationalDigest.openComplaintCount} Open · ${operationalDigest.processingComplaintCount} Diproses`
              : reminderTab === 'pm'
              ? `${operationalDigest.overduePMCount} PM jatuh tempo / mendesak`
              : `Total piutang tercatat: Rp${totalPiutangNominal.toLocaleString('id-ID')}`}
          </span>
          <button
            type="button"
            onClick={() =>
              onNavigateView(
                reminderTab === 'todo'
                  ? 'todoList'
                  : reminderTab === 'komplain'
                  ? 'complaint'
                  : reminderTab === 'pm'
                  ? 'listPM'
                  : 'listDharmaPatronRutin'
              )
            }
            className="font-semibold text-[#05828e] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>
              {reminderTab === 'todo'
                ? 'Kelola Semua To-Do'
                : reminderTab === 'komplain'
                ? 'Buka Menu Komplain'
                : reminderTab === 'pm'
                ? 'Buka List PM'
                : 'Buka List Dharma Patron'}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Peringatan Stok S-SALUR Menipis */}
      <div className="xl:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                outOfStockCount > 0
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : lowStockItems.length > 0
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Package className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                Peringatan Stok S-SALUR Menipis
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                {lowStockItems.length} item ≤ {stockThreshold} pcs · {outOfStockCount} stok habis
              </p>
            </div>
          </div>

          {/* Threshold Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 text-[11px] self-start sm:self-auto shrink-0">
            {[0, 10, 30].map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setStockThreshold(th)}
                className={`px-2.5 py-1 rounded-lg font-semibold font-mono tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                  stockThreshold === th
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {th === 0 ? 'Habis (0)' : `≤ ${th}`}
              </button>
            ))}
          </div>
        </div>

        {/* Low Stock List */}
        <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 max-h-[340px] overflow-y-auto">
          {lowStockItems.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Stok seluruh item &amp; kontainer aman di atas {stockThreshold} pcs
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sesuaikan ambang batas peringatan untuk memantau stok gudang lebih awal.
              </p>
            </div>
          ) : (
            lowStockItems.slice(0, 8).map((item) => {
              const isOut = item.stock <= 0;
              return (
                <div
                  key={item.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isOut ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : (
                        <Warehouse className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="font-mono">{item.code}</span>
                      {item.gudangInfo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[200px]">{item.gudangInfo}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-sm font-extrabold font-mono tabular-nums block ${
                          isOut
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.stock} pcs
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {isOut ? 'Stok Habis' : item.source === 'container' ? 'Kontainer' : 'Katalog'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateView('formStockInOutSalur')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#05828e] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#05828e] dark:hover:text-teal-400 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Restok
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigateView('stokItemSalur')}
            className="font-semibold text-slate-600 dark:text-slate-300 hover:text-[#05828e] dark:hover:text-teal-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cek Gudang &amp; Kontainer
          </button>
          <button
            type="button"
            onClick={() => onNavigateView('stockInOutSalur')}
            className="font-semibold text-[#05828e] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Restok Stock In/Out</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ModalTagihanWhatsappPatron
        isOpen={isWhatsappModalOpen}
        onClose={() => {
          setIsWhatsappModalOpen(false);
          setWhatsappTargetPatrons([]);
        }}
        patrons={whatsappTargetPatrons}
        identitasList={identitasList}
        organisasiList={organisasiList}
        rekeningList={rekeningList}
        currentAdminName={currentAdminName}
        onRecordBilling={onRecordWhatsappBilling}
        onShowToast={onShowToast}
      />
    </section>
  );
};
