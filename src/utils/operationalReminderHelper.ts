import { ComplaintItem, ListPMDetailRow, ListPMItem, ListPMRecipient } from '../types';
import { IdentitasItem } from '../identitasData';
import { SalurProduct } from '../salurData';
import { getStoredStokSalurItems } from '../stokSalurData';
import { getEffectiveStatusBisaPM, getPipelineStage } from '../listPMData';
import { formatIsoDateIndo, parseFinancialDateToIso } from './financialDateFilter';
import { diffDaysBetweenIso, SEED_REFERENCE_DATE_ISO, toLocalIsoDate } from './projectDeadlineUtils';

export interface ComplaintReminderItem {
  id: string;
  complaint: ComplaintItem;
  status: 'Open' | 'Diproses';
  matchedIdentitas?: IdentitasItem;
  phone?: string;
  isBlacklisted: boolean;
  priorityRank: number;
}

export interface PMDueReminderItem {
  id: string;
  plan: ListPMItem;
  row?: ListPMDetailRow;
  recipient?: ListPMRecipient;
  proyekSapa: string;
  proyekKode: string;
  targetNama: string;
  targetCodeId?: string;
  identitasId?: string;
  nomorHp?: string;
  matchedIdentitas?: IdentitasItem;
  isBlacklisted: boolean;
  deadlineRaw: string;
  deadlineDisplay: string;
  deadlineIso?: string;
  diffDays?: number;
  isOverdue: boolean;
  isDueToday: boolean;
  progressPercent: number;
  pendingCountInPlan: number;
  totalCountInPlan: number;
  templateContent?: string;
}

export interface LowStockReminderItem {
  id: string;
  title: string;
  code: string;
  stock: number;
  gudangInfo?: string;
  source: 'product' | 'container';
  isOutOfStock: boolean;
}

export interface OperationalReminderDigest {
  complaintAlerts: ComplaintReminderItem[];
  pmDueAlerts: PMDueReminderItem[];
  lowStockAlerts: LowStockReminderItem[];
  openComplaintCount: number;
  processingComplaintCount: number;
  overduePMCount: number;
  outOfStockCount: number;
  totalUrgentCount: number;
}

function normalizeStr(val?: string): string {
  return (val || '').trim().toLowerCase();
}

function isIdentitasBlacklisted(item?: IdentitasItem): boolean {
  if (!item) return false;
  return normalizeStr(item.status) === 'blacklist';
}

function findMatchingIdentitas(
  identitasList: IdentitasItem[],
  params: { identitasId?: string; codeId?: string; nama?: string; phone?: string }
): IdentitasItem | undefined {
  if (!identitasList || identitasList.length === 0) return undefined;

  if (params.identitasId) {
    const byId = identitasList.find((it) => it.id === params.identitasId);
    if (byId) return byId;
  }

  const cleanCode = normalizeStr(params.codeId);
  if (cleanCode) {
    const byCode = identitasList.find(
      (it) =>
        normalizeStr(it.codeId) === cleanCode ||
        normalizeStr(it.nomorIdentitas) === cleanCode
    );
    if (byCode) return byCode;
  }

  const cleanPhone = (params.phone || '').replace(/\D/g, '');
  if (cleanPhone.length >= 8) {
    const byPhone = identitasList.find((it) => {
      const hp = (it.nomorHandPhone || '').replace(/\D/g, '');
      return hp && (hp === cleanPhone || hp.endsWith(cleanPhone.slice(-8)));
    });
    if (byPhone) return byPhone;
  }

  const cleanNama = normalizeStr(params.nama).replace(/^\d+\s+/, '');
  if (cleanNama) {
    const byNama = identitasList.find((it) => {
      const full = normalizeStr(it.namaLengkap);
      const nick = normalizeStr(it.namaPanggilan);
      return full === cleanNama || (nick && nick === cleanNama);
    });
    if (byNama) return byNama;
  }

  return undefined;
}

function evaluateDeadlineUrgency(dateStr?: string, realTodayIso?: string): {
  deadlineIso?: string;
  deadlineDisplay: string;
  diffDays?: number;
  isOverdue: boolean;
  isDueToday: boolean;
} {
  if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '-') {
    return {
      deadlineDisplay: 'Siap dikirim',
      isOverdue: false,
      isDueToday: false,
    };
  }

  const iso = parseFinancialDateToIso(dateStr);
  if (!iso) {
    return {
      deadlineDisplay: dateStr,
      isOverdue: false,
      isDueToday: false,
    };
  }

  const todayIso = realTodayIso || toLocalIsoDate(new Date());
  const refIso = iso.startsWith('2021-') ? SEED_REFERENCE_DATE_ISO : todayIso;
  const diffDays = diffDaysBetweenIso(iso, refIso);

  return {
    deadlineIso: iso,
    deadlineDisplay: formatIsoDateIndo(iso),
    diffDays,
    isOverdue: diffDays < 0,
    isDueToday: diffDays === 0,
  };
}

export function buildOperationalReminderDigest(params: {
  complaints: ComplaintItem[];
  listPMList: ListPMItem[];
  salurItems: SalurProduct[];
  identitasList?: IdentitasItem[];
  stockThreshold?: number;
}): OperationalReminderDigest {
  const {
    complaints = [],
    listPMList = [],
    salurItems = [],
    identitasList = [],
    stockThreshold = 10,
  } = params;

  const realTodayIso = toLocalIsoDate(new Date());

  // 1. Komplain Open / Diproses
  const complaintAlerts: ComplaintReminderItem[] = complaints
    .filter((c) => c.status !== 'Selesai')
    .map((complaint) => {
      const status: 'Open' | 'Diproses' =
        complaint.status === 'Diproses' ? 'Diproses' : 'Open';
      const matchedIdentitas = findMatchingIdentitas(identitasList, {
        identitasId: complaint.identitasId,
        codeId: complaint.kodeDonatur,
        nama: complaint.nama,
      });
      return {
        id: complaint.id,
        complaint,
        status,
        matchedIdentitas,
        phone: matchedIdentitas?.nomorHandPhone || undefined,
        isBlacklisted: isIdentitasBlacklisted(matchedIdentitas),
        priorityRank: status === 'Open' ? 0 : 1,
      };
    })
    .sort((a, b) => {
      if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
      const isoA = parseFinancialDateToIso(a.complaint.tanggal) || '';
      const isoB = parseFinancialDateToIso(b.complaint.tanggal) || '';
      return isoB.localeCompare(isoA);
    });

  const openComplaintCount = complaintAlerts.filter((c) => c.status === 'Open').length;
  const processingComplaintCount = complaintAlerts.filter(
    (c) => c.status === 'Diproses'
  ).length;

  // 2. List PM Jatuh Tempo & Pending
  const pmDueAlerts: PMDueReminderItem[] = [];

  listPMList.forEach((plan) => {
    const stage = getPipelineStage(plan);
    if (stage === 'selesai' || stage === 'upcoming') return;

    const effStatus = getEffectiveStatusBisaPM(plan);
    const isActionablePlan =
      stage === 'sudah' ||
      stage === 'in_progress' ||
      effStatus === 'sudah' ||
      (plan.deadline && plan.deadline !== '-');

    if (!isActionablePlan) return;

    const rows = Array.isArray(plan.detailRows) ? plan.detailRows : [];
    const pendingRows = rows.filter((r) => r.status === 'pending');

    if (pendingRows.length > 0) {
      pendingRows.forEach((row) => {
        const deadlineRaw =
          row.deadline && row.deadline !== '-'
            ? row.deadline
            : plan.deadline && plan.deadline !== '-'
            ? plan.deadline
            : plan.tanggalMulaiPM || plan.tanggalMulaiDihubungi || '-';
        const urgency = evaluateDeadlineUrgency(deadlineRaw, realTodayIso);

        // Keep overdue, due today, due within 14 days, or active ready-to-PM items
        const withinWindow =
          urgency.diffDays === undefined || urgency.diffDays <= 14 || effStatus === 'sudah';
        if (!withinWindow) return;

        const matchedIdentitas = findMatchingIdentitas(identitasList, {
          identitasId: row.identitasId,
          codeId: row.codeId,
          nama: row.nama,
          phone: row.nomorHp,
        });

        pmDueAlerts.push({
          id: `${plan.id}::${row.id}`,
          plan,
          row,
          proyekSapa: row.proyekSapa || plan.proyekSapa,
          proyekKode: row.proyekKode || plan.proyekKode,
          targetNama: row.nama,
          targetCodeId: row.codeId || matchedIdentitas?.codeId,
          identitasId: row.identitasId || matchedIdentitas?.id,
          nomorHp: row.nomorHp || matchedIdentitas?.nomorHandPhone,
          matchedIdentitas,
          isBlacklisted: isIdentitasBlacklisted(matchedIdentitas),
          deadlineRaw,
          deadlineDisplay: urgency.deadlineDisplay,
          deadlineIso: urgency.deadlineIso,
          diffDays: urgency.diffDays,
          isOverdue: urgency.isOverdue,
          isDueToday: urgency.isDueToday,
          progressPercent: plan.progressPercent || 0,
          pendingCountInPlan: pendingRows.length,
          totalCountInPlan: rows.length,
          templateContent: row.templateContent || plan.templatePesan,
        });
      });
      return;
    }

    const recipients = Array.isArray(plan.recipients) ? plan.recipients : [];
    const pendingRecs = recipients.filter((r) => !r.isSent);
    if (pendingRecs.length > 0) {
      pendingRecs.forEach((rec) => {
        const deadlineRaw =
          plan.deadline && plan.deadline !== '-'
            ? plan.deadline
            : plan.tanggalMulaiPM || plan.tanggalMulaiDihubungi || '-';
        const urgency = evaluateDeadlineUrgency(deadlineRaw, realTodayIso);
        const matchedIdentitas = findMatchingIdentitas(identitasList, {
          identitasId: rec.identitasId,
          codeId: rec.codeId,
          nama: rec.nama,
          phone: rec.nomorHp,
        });

        pmDueAlerts.push({
          id: `${plan.id}::rec-${rec.id}`,
          plan,
          recipient: rec,
          proyekSapa: plan.proyekSapa,
          proyekKode: plan.proyekKode,
          targetNama: rec.nama,
          targetCodeId: rec.codeId || matchedIdentitas?.codeId,
          identitasId: rec.identitasId || matchedIdentitas?.id,
          nomorHp: rec.nomorHp || matchedIdentitas?.nomorHandPhone,
          matchedIdentitas,
          isBlacklisted: isIdentitasBlacklisted(matchedIdentitas),
          deadlineRaw,
          deadlineDisplay: urgency.deadlineDisplay,
          deadlineIso: urgency.deadlineIso,
          diffDays: urgency.diffDays,
          isOverdue: urgency.isOverdue,
          isDueToday: urgency.isDueToday,
          progressPercent: plan.progressPercent || 0,
          pendingCountInPlan: pendingRecs.length,
          totalCountInPlan: recipients.length,
          templateContent: plan.templatePesan,
        });
      });
      return;
    }

    // Fallback for single-target or plan-level pending without rows
    if ((plan.progressPercent || 0) < 100 && rows.length === 0) {
      const deadlineRaw =
        plan.deadline && plan.deadline !== '-'
          ? plan.deadline
          : plan.tanggalMulaiPM || plan.tanggalMulaiDihubungi || '-';
      const urgency = evaluateDeadlineUrgency(deadlineRaw, realTodayIso);
      const targetNama =
        plan.singleTarget?.nama || plan.targetSourceName || plan.proyekSapa;
      const matchedIdentitas = findMatchingIdentitas(identitasList, {
        identitasId: plan.singleTarget?.identitasId,
        codeId: plan.singleTarget?.codeId,
        nama: plan.singleTarget?.nama,
        phone: plan.singleTarget?.nomorHp,
      });

      pmDueAlerts.push({
        id: `${plan.id}::plan`,
        plan,
        proyekSapa: plan.proyekSapa,
        proyekKode: plan.proyekKode,
        targetNama,
        targetCodeId: plan.singleTarget?.codeId || matchedIdentitas?.codeId,
        identitasId: plan.singleTarget?.identitasId || matchedIdentitas?.id,
        nomorHp: plan.singleTarget?.nomorHp || matchedIdentitas?.nomorHandPhone,
        matchedIdentitas,
        isBlacklisted: isIdentitasBlacklisted(matchedIdentitas),
        deadlineRaw,
        deadlineDisplay: urgency.deadlineDisplay,
        deadlineIso: urgency.deadlineIso,
        diffDays: urgency.diffDays,
        isOverdue: urgency.isOverdue,
        isDueToday: urgency.isDueToday,
        progressPercent: plan.progressPercent || 0,
        pendingCountInPlan: plan.targetCount || 1,
        totalCountInPlan: plan.targetCount || 1,
        templateContent: plan.templatePesan,
      });
    }
  });

  pmDueAlerts.sort((a, b) => {
    const da = a.diffDays ?? 999;
    const db = b.diffDays ?? 999;
    if (da !== db) return da - db;
    return a.proyekSapa.localeCompare(b.proyekSapa);
  });

  const overduePMCount = pmDueAlerts.filter((p) => p.isOverdue || p.isDueToday).length;

  // 3. Stok S-SALUR Menipis / Habis
  const lowStockAlerts: LowStockReminderItem[] = [];

  salurItems.forEach((prod) => {
    const stockVal = Number(prod.stock ?? 0);
    if (stockVal <= stockThreshold) {
      lowStockAlerts.push({
        id: `prod-${prod.id}`,
        title: prod.title,
        code: prod.code || prod.id,
        stock: stockVal,
        gudangInfo: prod.subJenis || prod.category || 'Katalog Utama S-SALUR',
        source: 'product',
        isOutOfStock: stockVal <= 0,
      });
    }
  });

  try {
    const stokContainers = getStoredStokSalurItems();
    const seenProductTitles = new Set(lowStockAlerts.map((a) => a.title.toLowerCase()));

    stokContainers.forEach((stokItem) => {
      (stokItem.containers || []).forEach((cont) => {
        const cStok = Number(cont.stok ?? 0);
        if (cStok <= Math.min(stockThreshold, 10)) {
          lowStockAlerts.push({
            id: `cont-${stokItem.id}-${cont.id}`,
            title: stokItem.namaItem,
            code: cont.namaContainer,
            stock: cStok,
            gudangInfo: `${cont.lokasiGudang} · ${cont.jenisLokasi}`,
            source: 'container',
            isOutOfStock: cStok <= 0,
          });
        }
      });

      const totalStok = Number(stokItem.stok ?? 0);
      if (
        totalStok <= stockThreshold &&
        !seenProductTitles.has(stokItem.namaItem.toLowerCase())
      ) {
        lowStockAlerts.push({
          id: `stok-${stokItem.id}`,
          title: stokItem.namaItem,
          code: stokItem.productId,
          stock: totalStok,
          gudangInfo: `${stokItem.jumlahLokasi} Lokasi Gudang`,
          source: 'product',
          isOutOfStock: totalStok <= 0,
        });
      }
    });
  } catch {
    // Safe fallback if local stok container cache is unavailable
  }

  lowStockAlerts.sort((a, b) => a.stock - b.stock);
  const outOfStockCount = lowStockAlerts.filter((item) => item.isOutOfStock).length;

  const totalUrgentCount =
    complaintAlerts.length + pmDueAlerts.length + lowStockAlerts.length;

  return {
    complaintAlerts,
    pmDueAlerts,
    lowStockAlerts,
    openComplaintCount,
    processingComplaintCount,
    overduePMCount,
    outOfStockCount,
    totalUrgentCount,
  };
}

export function formatReminderNowTimestamp(): string {
  return new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Marks a specific List PM detail row or recipient as sent, recalculates progressPercent,
 * and transitions statusBisaPM to 'sudah_dihubungi' when all recipients reach 100%.
 */
export function markListPMReminderSent(
  plan: ListPMItem,
  target: {
    rowId?: string;
    recipientId?: string;
    identitasId?: string;
    codeId?: string;
    nama?: string;
  }
): ListPMItem {
  const sentAt = formatReminderNowTimestamp();

  let nextDetailRows = plan.detailRows ? [...plan.detailRows] : undefined;
  let nextRecipients = plan.recipients ? [...plan.recipients] : undefined;

  if (nextDetailRows && nextDetailRows.length > 0) {
    nextDetailRows = nextDetailRows.map((r) => {
      const matchesRowId = target.rowId && r.id === target.rowId;
      const matchesIdent =
        (target.identitasId && r.identitasId === target.identitasId) ||
        (target.codeId && r.codeId && normalizeStr(r.codeId) === normalizeStr(target.codeId)) ||
        (target.nama && normalizeStr(r.nama) === normalizeStr(target.nama));

      if (matchesRowId || (!target.rowId && matchesIdent)) {
        return {
          ...r,
          status: 'done_teal' as const,
          sentAt: r.sentAt || sentAt,
        };
      }
      return r;
    });
  }

  if (nextRecipients && nextRecipients.length > 0) {
    nextRecipients = nextRecipients.map((rec) => {
      const matchesRecId = target.recipientId && rec.id === target.recipientId;
      const matchesIdent =
        (target.identitasId && rec.identitasId === target.identitasId) ||
        (target.codeId &&
          rec.codeId &&
          normalizeStr(rec.codeId) === normalizeStr(target.codeId)) ||
        (target.nama && normalizeStr(rec.nama) === normalizeStr(target.nama));

      if (matchesRecId || (!target.recipientId && matchesIdent)) {
        return {
          ...rec,
          isSent: true,
          sentAt: rec.sentAt || sentAt,
        };
      }
      return rec;
    });
  }

  let nextProgress = plan.progressPercent || 0;
  if (nextDetailRows && nextDetailRows.length > 0) {
    const doneCount = nextDetailRows.filter(
      (r) => r.status === 'done_teal' || r.status === 'done_gray'
    ).length;
    nextProgress = Math.round((doneCount / nextDetailRows.length) * 100);
  } else if (nextRecipients && nextRecipients.length > 0) {
    const doneCount = nextRecipients.filter((r) => r.isSent).length;
    nextProgress = Math.round((doneCount / nextRecipients.length) * 100);
  } else {
    nextProgress = 100;
  }

  return {
    ...plan,
    detailRows: nextDetailRows,
    recipients: nextRecipients,
    progressPercent: nextProgress,
    statusBisaPM: nextProgress >= 100 ? 'sudah_dihubungi' : plan.statusBisaPM || 'sudah',
  };
}
