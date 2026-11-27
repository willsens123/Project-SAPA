import { DonasiOrder } from '../donasiData';
import { IdentitasItem } from '../identitasData';
import { CustomerSalurReportItem } from '../reportCustomerSalurData';
import { ResiItem } from '../resiData';
import { SalurOrder } from '../salurData';
import { DharmaPatronRutinItem, ListPMItem, OrganisasiItem } from '../types';
import { normalizeWhatsappPhone } from './patronWhatsappHelper';

export interface ContactTimelineEvent {
  id: string;
  timestampMs: number;
  displayDate: string;
  isoOrRaw: string;
  channel:
    | 'customer_direct'
    | 'kwitansi_donasi'
    | 'resi_salur'
    | 'tagihan_patron'
    | 'list_pm'
    | 'legacy';
  channelLabel: string;
  phone?: string;
  actor?: string;
  detail?: string;
  messagePreview?: string;
}

export interface ResolvedLastContactedSummary {
  hasContactHistory: boolean;
  latestTimestampMs: number;
  displayDate: string;
  relativeLabel: string;
  channelLabel: string;
  actor?: string;
  phone?: string;
  detailSummary?: string;
  isLiveChannel: boolean;
  events: ContactTimelineEvent[];
}

export interface CrossModuleContactSources {
  listPMList?: ListPMItem[];
  donasiOrders?: DonasiOrder[];
  salurOrders?: SalurOrder[];
  dharmaPatronList?: DharmaPatronRutinItem[];
  resiItems?: ResiItem[];
}

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mar: 2,
  maret: 2,
  apr: 3,
  april: 3,
  mei: 4,
  may: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  agu: 7,
  agt: 7,
  agustus: 7,
  aug: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  oct: 9,
  nov: 10,
  november: 10,
  des: 11,
  desember: 11,
  dec: 11,
};

const SHORT_MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function parseFlexibleTimestampMs(raw?: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '-' || trimmed === 'Belum dikontak') return 0;

  const low = trimmed.toLowerCase();
  if (low === 'baru saja') return Date.now();
  if (low === 'hari ini') {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0).getTime();
  }

  // ISO format first
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) return parsed;
  }

  // Indonesian format: "14 Nov 2021", "26 Nov 2026 14:30", "26 Nov 2026, 14.30", "16 Nov 2021 • 09:00"
  const idMatch = low.match(
    /(\d{1,2})\s+([a-z]+)\s+(\d{4})(?:[,.\s•·-]+(\d{1,2})[:.](\d{2}))?/
  );
  if (idMatch) {
    const day = parseInt(idMatch[1], 10);
    const mName = idMatch[2];
    const month =
      MONTH_INDEX[mName] ?? MONTH_INDEX[mName.slice(0, 3)] ?? -1;
    const year = parseInt(idMatch[3], 10);
    if (month >= 0 && year >= 1990) {
      const hour = idMatch[4] ? parseInt(idMatch[4], 10) : 12;
      const min = idMatch[5] ? parseInt(idMatch[5], 10) : 0;
      return new Date(year, month, day, hour, min).getTime();
    }
  }

  // Short Indonesian format without year: "16 Nov"
  const shortMatch = low.match(/^(\d{1,2})\s+([a-z]{3,9})$/);
  if (shortMatch) {
    const day = parseInt(shortMatch[1], 10);
    const month =
      MONTH_INDEX[shortMatch[2]] ?? MONTH_INDEX[shortMatch[2].slice(0, 3)] ?? -1;
    if (month >= 0) {
      return new Date(new Date().getFullYear(), month, day, 12, 0).getTime();
    }
  }

  const fallback = Date.parse(trimmed);
  return Number.isNaN(fallback) ? 0 : fallback;
}

export function formatContactDisplayDate(tsMs: number, fallbackRaw?: string): string {
  if (!tsMs || tsMs <= 0) return fallbackRaw?.trim() || '-';
  const d = new Date(tsMs);
  if (Number.isNaN(d.getTime())) return fallbackRaw?.trim() || '-';
  const day = d.getDate().toString().padStart(2, '0');
  const month = SHORT_MONTHS_ID[d.getMonth()];
  const year = d.getFullYear();

  // If raw string explicitly had no time (e.g. "14 Nov 2021") and hour===12 && min===0, show date only cleanly
  const hasExplicitTime =
    fallbackRaw &&
    (/\d{1,2}[:.]\d{2}/.test(fallbackRaw) || /^\d{4}-\d{2}-\d{2}T/.test(fallbackRaw));
  if (!hasExplicitTime && d.getHours() === 12 && d.getMinutes() === 0) {
    return `${day} ${month} ${year}`;
  }
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} · ${hh}:${mm}`;
}

export function formatRelativeContactAge(tsMs: number, nowMs: number = Date.now()): string {
  if (!tsMs || tsMs <= 0) return '';
  const diffMs = nowMs - tsMs;
  if (diffMs < 0) return '';
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 2) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    const d = new Date(tsMs);
    const now = new Date(nowMs);
    if (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      return `${diffHours} jam lalu`;
    }
    return 'Kemarin';
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays <= 14) return `${diffDays} hari lalu`;
  return '';
}

function normText(v?: string): string {
  return (v || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function extractCodePrefix(raw?: string): { codeId?: string; namePart?: string } {
  if (!raw || !raw.trim()) return {};
  const trimmed = raw.trim();
  const match = trimmed.match(/^([A-Za-z0-9-]+)\s+(.+)$/);
  if (match && /\d/.test(match[1])) {
    return { codeId: match[1].trim(), namePart: match[2].trim() };
  }
  return { namePart: trimmed };
}

interface PersonMatchKey {
  identitasId?: string;
  codeId?: string;
  nama?: string;
  phoneNorm?: string;
}

function doesCandidateMatchPerson(
  person: PersonMatchKey,
  candidates: {
    identitasId?: string;
    codeId?: string;
    nama?: string;
    phone?: string;
    rawTokens?: Array<string | undefined>;
  }
): boolean {
  if (
    person.identitasId &&
    candidates.identitasId &&
    normText(person.identitasId) === normText(candidates.identitasId)
  ) {
    return true;
  }

  if (
    person.codeId &&
    candidates.codeId &&
    normText(person.codeId) === normText(candidates.codeId)
  ) {
    return true;
  }

  const personPhone = person.phoneNorm;
  const candPhone = normalizeWhatsappPhone(candidates.phone);
  if (personPhone && candPhone && personPhone === candPhone) {
    return true;
  }

  const personName = normText(person.nama);
  if (personName && personName !== '-' && personName !== 'no name') {
    if (candidates.nama && normText(candidates.nama) === personName) {
      return true;
    }
  }

  if (candidates.rawTokens) {
    for (const raw of candidates.rawTokens) {
      if (!raw || !raw.trim() || raw.trim() === '-') continue;
      const rawNorm = normText(raw);
      if (person.identitasId && rawNorm === normText(person.identitasId)) return true;
      if (person.codeId && rawNorm === normText(person.codeId)) return true;
      if (personName && personName !== '-' && personName !== 'no name' && rawNorm === personName) {
        return true;
      }
      const parsed = extractCodePrefix(raw);
      if (person.codeId && parsed.codeId && normText(parsed.codeId) === normText(person.codeId)) {
        return true;
      }
      if (
        personName &&
        personName !== '-' &&
        personName !== 'no name' &&
        parsed.namePart &&
        normText(parsed.namePart) === personName
      ) {
        return true;
      }
    }
  }

  return false;
}

function collectContactEventsForPerson(
  person: PersonMatchKey,
  identitas?: IdentitasItem | null,
  sources: CrossModuleContactSources = {}
): ContactTimelineEvent[] {
  const events: ContactTimelineEvent[] = [];

  // 1. From IdentitasItem directly
  if (identitas) {
    if (Array.isArray(identitas.whatsappContactHistory)) {
      identitas.whatsappContactHistory.forEach((log) => {
        const tsMs = parseFlexibleTimestampMs(log.sentAt);
        if (tsMs > 0) {
          const chLabel =
            log.kind === 'kwitansi_donasi'
              ? 'WA Kwitansi'
              : log.kind === 'resi_salur'
              ? 'WA Resi'
              : 'WA Customer';
          events.push({
            id: log.id,
            timestampMs: tsMs,
            displayDate: formatContactDisplayDate(tsMs, log.sentAt),
            isoOrRaw: log.sentAt,
            channel: log.kind,
            channelLabel: chLabel,
            phone: log.phone,
            actor: log.sentBy,
            detail: log.topicLabel || log.referenceNumber,
            messagePreview: log.messagePreview,
          });
        }
      });
    }

    if (identitas.lastContactedAt) {
      const tsMs = parseFlexibleTimestampMs(identitas.lastContactedAt);
      if (tsMs > 0) {
        events.push({
          id: `ident-at-${identitas.id}`,
          timestampMs: tsMs,
          displayDate: formatContactDisplayDate(tsMs, identitas.lastContactedAt),
          isoOrRaw: identitas.lastContactedAt,
          channel: 'customer_direct',
          channelLabel: identitas.lastContactedChannel || 'WA Customer',
          phone: identitas.nomorHandPhone,
          actor: identitas.lastContactedBy,
          detail: identitas.lastContactedNote || 'Kontak terakhir tersimpan',
        });
      }
    }

    if (identitas.lastContacted && identitas.lastContacted.trim() !== '-') {
      const tsMs = parseFlexibleTimestampMs(identitas.lastContacted);
      events.push({
        id: `ident-legacy-${identitas.id}`,
        timestampMs: tsMs,
        displayDate:
          tsMs > 0
            ? formatContactDisplayDate(tsMs, identitas.lastContacted)
            : identitas.lastContacted.trim(),
        isoOrRaw: identitas.lastContacted,
        channel: identitas.lastContactedChannel ? 'customer_direct' : 'legacy',
        channelLabel: identitas.lastContactedChannel || 'Riwayat Identitas',
        phone: identitas.nomorHandPhone,
        actor: identitas.lastContactedBy,
        detail: identitas.lastContactedNote || 'Catatan kontak identitas',
      });
    }
  }

  // 2. From List PM (recipients & detailRows that were sent)
  (sources.listPMList || []).forEach((pm) => {
    (pm.detailRows || []).forEach((row) => {
      const isDone = row.status === 'done_teal' || row.status === 'done_gray';
      if (!isDone || !row.sentAt || row.sentAt.trim() === '-') return;
      const matches = doesCandidateMatchPerson(person, {
        identitasId: row.identitasId,
        codeId: row.codeId,
        nama: row.nama,
        phone: row.nomorHp,
      });
      if (!matches) return;
      const tsMs = parseFlexibleTimestampMs(row.sentAt);
      if (tsMs <= 0) return;
      const lowerProyek = (row.proyekSapa || pm.proyekSapa || '').toLowerCase();
      const ch = lowerProyek.includes('kwitansi')
        ? 'kwitansi_donasi'
        : lowerProyek.includes('resi')
        ? 'resi_salur'
        : 'list_pm';
      const chLabel =
        ch === 'kwitansi_donasi'
          ? 'WA Kwitansi'
          : ch === 'resi_salur'
          ? 'WA Resi'
          : row.templateName?.includes('WA Customer')
          ? 'WA Customer'
          : `List PM · ${row.proyekSapa || pm.proyekSapa}`;
      events.push({
        id: `pm-row-${pm.id}-${row.id}`,
        timestampMs: tsMs,
        displayDate: formatContactDisplayDate(tsMs, row.sentAt),
        isoOrRaw: row.sentAt,
        channel: ch,
        channelLabel: chLabel,
        phone: row.nomorHp,
        actor: pm.dihubungiOleh,
        detail: row.itemTitle || row.proyekSapa || pm.proyekSapa,
        messagePreview: row.templateContent,
      });
    });

    (pm.recipients || []).forEach((rec) => {
      if (!rec.isSent || !rec.sentAt || rec.sentAt.trim() === '-') return;
      const matches = doesCandidateMatchPerson(person, {
        identitasId: rec.identitasId,
        codeId: rec.codeId,
        nama: rec.nama,
        phone: rec.nomorHp,
      });
      if (!matches) return;
      const tsMs = parseFlexibleTimestampMs(rec.sentAt);
      if (tsMs <= 0) return;
      events.push({
        id: `pm-rec-${pm.id}-${rec.id}`,
        timestampMs: tsMs,
        displayDate: formatContactDisplayDate(tsMs, rec.sentAt),
        isoOrRaw: rec.sentAt,
        channel: 'list_pm',
        channelLabel: `List PM · ${pm.proyekSapa}`,
        phone: rec.nomorHp,
        actor: pm.dihubungiOleh,
        detail: pm.itemTitle || pm.proyekSapa,
        messagePreview: pm.templatePesan,
      });
    });
  });

  // 3. From D-DONASI orders
  (sources.donasiOrders || []).forEach((ord) => {
    const matches = doesCandidateMatchPerson(person, {
      nama: ord.namaDonatur?.name,
      phone: ord.lastWhatsappSentPhone,
      rawTokens: [ord.customerId, ord.namaDonatur?.name],
    });
    if (!matches) return;

    if (Array.isArray(ord.whatsappSendHistory)) {
      ord.whatsappSendHistory.forEach((log) => {
        const tsMs = parseFlexibleTimestampMs(log.sentAt);
        if (tsMs > 0) {
          events.push({
            id: `donasi-${ord.id}-${log.id}`,
            timestampMs: tsMs,
            displayDate: formatContactDisplayDate(tsMs, log.sentAt),
            isoOrRaw: log.sentAt,
            channel: 'kwitansi_donasi',
            channelLabel: 'WA Kwitansi',
            phone: log.phone,
            actor: log.sentBy,
            detail: `${log.referenceNumber} (${ord.totalDana})`,
            messagePreview: log.messagePreview,
          });
        }
      });
    } else if (ord.lastWhatsappSentAt) {
      const tsMs = parseFlexibleTimestampMs(ord.lastWhatsappSentAt);
      if (tsMs > 0) {
        events.push({
          id: `donasi-last-${ord.id}`,
          timestampMs: tsMs,
          displayDate: formatContactDisplayDate(tsMs, ord.lastWhatsappSentAt),
          isoOrRaw: ord.lastWhatsappSentAt,
          channel: 'kwitansi_donasi',
          channelLabel: 'WA Kwitansi',
          phone: ord.lastWhatsappSentPhone,
          detail: `${ord.lastWhatsappKwitansiNumber || ord.orderNumber} (${ord.totalDana})`,
        });
      }
    }
  });

  // 4. From S-SALUR orders
  (sources.salurOrders || []).forEach((ord) => {
    const matches = doesCandidateMatchPerson(person, {
      nama: ord.alamat?.recipientName,
      phone: ord.lastWhatsappResiSentPhone || ord.alamat?.phone,
      rawTokens: [
        ord.idPenerima,
        ord.customerCode,
        ord.idPembeli,
        ord.customerId,
        ord.alamat?.recipientName,
      ],
    });
    if (!matches) return;

    if (Array.isArray(ord.whatsappResiHistory)) {
      ord.whatsappResiHistory.forEach((log) => {
        const tsMs = parseFlexibleTimestampMs(log.sentAt);
        if (tsMs > 0) {
          events.push({
            id: `salur-${ord.id}-${log.id}`,
            timestampMs: tsMs,
            displayDate: formatContactDisplayDate(tsMs, log.sentAt),
            isoOrRaw: log.sentAt,
            channel: 'resi_salur',
            channelLabel: 'WA Resi',
            phone: log.phone,
            actor: log.sentBy,
            detail: `${ord.orderNumber}${log.referenceNumber && log.referenceNumber !== '-' ? ` · Resi ${log.referenceNumber}` : ''}`,
            messagePreview: log.messagePreview,
          });
        }
      });
    } else if (ord.lastWhatsappResiSentAt) {
      const tsMs = parseFlexibleTimestampMs(ord.lastWhatsappResiSentAt);
      if (tsMs > 0) {
        events.push({
          id: `salur-last-${ord.id}`,
          timestampMs: tsMs,
          displayDate: formatContactDisplayDate(tsMs, ord.lastWhatsappResiSentAt),
          isoOrRaw: ord.lastWhatsappResiSentAt,
          channel: 'resi_salur',
          channelLabel: 'WA Resi',
          phone: ord.lastWhatsappResiSentPhone || ord.alamat?.phone,
          detail: `${ord.orderNumber} · Resi ${ord.ekspedisi?.noResi || '-'}`,
        });
      }
    }
  });

  // 5. From Dharma Patron Rutin
  (sources.dharmaPatronList || []).forEach((p) => {
    const matches = doesCandidateMatchPerson(person, {
      identitasId: p.identitasId,
      codeId: p.noDonatur,
      nama: p.namaDonatur,
      phone: p.lastWhatsappBilledPhone || p.nomorHp,
      rawTokens: [p.identitasId, p.noDonatur, p.namaDonatur],
    });
    if (!matches) return;

    if (Array.isArray(p.whatsappBillingHistory)) {
      p.whatsappBillingHistory.forEach((log) => {
        const tsMs = parseFlexibleTimestampMs(log.billedAt);
        if (tsMs > 0) {
          events.push({
            id: `patron-${p.id}-${log.id}`,
            timestampMs: tsMs,
            displayDate: formatContactDisplayDate(tsMs, log.billedAt),
            isoOrRaw: log.billedAt,
            channel: 'tagihan_patron',
            channelLabel: 'WA Tagihan Patron',
            phone: log.phone,
            actor: log.billedBy,
            detail: `Tagihan ${log.bulanPiutang} · Rp${Number(log.nominalTagihan || 0).toLocaleString('id-ID')}`,
            messagePreview: log.messagePreview,
          });
        }
      });
    } else if (p.lastWhatsappBilledAt) {
      const tsMs = parseFlexibleTimestampMs(p.lastWhatsappBilledAt);
      if (tsMs > 0) {
        events.push({
          id: `patron-last-${p.id}`,
          timestampMs: tsMs,
          displayDate: formatContactDisplayDate(tsMs, p.lastWhatsappBilledAt),
          isoOrRaw: p.lastWhatsappBilledAt,
          channel: 'tagihan_patron',
          channelLabel: 'WA Tagihan Patron',
          phone: p.lastWhatsappBilledPhone || p.nomorHp,
          actor: p.lastWhatsappBilledBy,
          detail: `Tagihan ${p.lastWhatsappBilledBulan || p.bulanPiutang}`,
        });
      }
    }
  });

  // Deduplicate events that share very similar minute + channel + detail
  const deduped: ContactTimelineEvent[] = [];
  const seenKeys = new Set<string>();
  events
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .forEach((ev) => {
      const minuteBucket = Math.floor(ev.timestampMs / 60000);
      const key = `${minuteBucket}:${ev.channel}:${normText(ev.detail)}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      deduped.push(ev);
    });

  return deduped;
}

export function resolveLastContactedForIdentitas(
  identity: IdentitasItem,
  sources: CrossModuleContactSources = {}
): ResolvedLastContactedSummary {
  const rawPhone =
    identity.nomorHandPhone && identity.nomorHandPhone !== '-'
      ? identity.nomorHandPhone
      : identity.alamatList?.find((a) => a.nomorHp && a.nomorHp !== '-')?.nomorHp;

  const events = collectContactEventsForPerson(
    {
      identitasId: identity.id,
      codeId: identity.codeId,
      nama: identity.namaLengkap,
      phoneNorm: normalizeWhatsappPhone(rawPhone),
    },
    identity,
    sources
  );

  const nonLegacy = events.filter((e) => e.channel !== 'legacy');
  const top = nonLegacy[0] || events[0];

  if (!top) {
    return {
      hasContactHistory: false,
      latestTimestampMs: 0,
      displayDate: '-',
      relativeLabel: '',
      channelLabel: 'Belum dikontak',
      isLiveChannel: false,
      events: [],
    };
  }

  return {
    hasContactHistory: true,
    latestTimestampMs: top.timestampMs,
    displayDate: top.displayDate,
    relativeLabel: formatRelativeContactAge(top.timestampMs),
    channelLabel: top.channelLabel,
    actor: top.actor,
    phone: top.phone || rawPhone,
    detailSummary: top.detail,
    isLiveChannel: top.channel !== 'legacy',
    events,
  };
}

export function findIdentitasForReportCustomer(
  cust: Pick<CustomerSalurReportItem, 'customerCode' | 'namaLengkap' | 'panggilan'>,
  identitasList: IdentitasItem[] = []
): IdentitasItem | undefined {
  if (!identitasList || identitasList.length === 0) return undefined;
  const codeNorm = normText(cust.customerCode);
  const nameNorm = normText(cust.namaLengkap);

  return (
    identitasList.find(
      (id) =>
        (codeNorm && id.codeId && normText(id.codeId) === codeNorm) ||
        (nameNorm && normText(id.namaLengkap) === nameNorm)
    ) || undefined
  );
}

export function resolveLastContactedForReportCustomer(
  cust: Pick<CustomerSalurReportItem, 'customerCode' | 'namaLengkap' | 'panggilan'>,
  identitasList: IdentitasItem[] = [],
  sources: CrossModuleContactSources = {}
): {
  identitasMatch?: IdentitasItem;
  summary: ResolvedLastContactedSummary;
} {
  const identitasMatch = findIdentitasForReportCustomer(cust, identitasList);
  const rawPhone =
    identitasMatch?.nomorHandPhone && identitasMatch.nomorHandPhone !== '-'
      ? identitasMatch.nomorHandPhone
      : identitasMatch?.alamatList?.find((a) => a.nomorHp && a.nomorHp !== '-')?.nomorHp;

  const events = collectContactEventsForPerson(
    {
      identitasId: identitasMatch?.id,
      codeId: identitasMatch?.codeId || cust.customerCode,
      nama: identitasMatch?.namaLengkap || cust.namaLengkap,
      phoneNorm: normalizeWhatsappPhone(rawPhone),
    },
    identitasMatch || null,
    sources
  );

  const nonLegacy = events.filter((e) => e.channel !== 'legacy');
  const top = nonLegacy[0] || events[0];

  if (!top) {
    return {
      identitasMatch,
      summary: {
        hasContactHistory: false,
        latestTimestampMs: 0,
        displayDate: '-',
        relativeLabel: '',
        channelLabel: 'Belum dikontak',
        isLiveChannel: false,
        events: [],
      },
    };
  }

  return {
    identitasMatch,
    summary: {
      hasContactHistory: true,
      latestTimestampMs: top.timestampMs,
      displayDate: top.displayDate,
      relativeLabel: formatRelativeContactAge(top.timestampMs),
      channelLabel: top.channelLabel,
      actor: top.actor,
      phone: top.phone || rawPhone,
      detailSummary: top.detail,
      isLiveChannel: top.channel !== 'legacy',
      events,
    },
  };
}

export function resolveLastContactedForOrganisasi(
  org: OrganisasiItem,
  identitasList: IdentitasItem[] = [],
  sources: CrossModuleContactSources = {}
): ResolvedLastContactedSummary {
  const picIdentitas =
    identitasList.find(
      (i) =>
        (org.picOrgId && i.id === org.picOrgId) ||
        (org.picOrgCode && i.codeId && normText(i.codeId) === normText(org.picOrgCode))
    ) || null;

  const orgRawPhone =
    (org.hp && org.hp.trim() !== '-' ? org.hp.trim() : '') ||
    (org.picOrgHp && org.picOrgHp.trim() !== '-' ? org.picOrgHp.trim() : '') ||
    (picIdentitas?.nomorHandPhone && picIdentitas.nomorHandPhone !== '-'
      ? picIdentitas.nomorHandPhone.trim()
      : '');

  const events: ContactTimelineEvent[] = [];

  // 1. Organisasi direct WA history & timestamps
  if (Array.isArray(org.whatsappContactHistory)) {
    org.whatsappContactHistory.forEach((log) => {
      const tsMs = parseFlexibleTimestampMs(log.sentAt);
      if (tsMs > 0) {
        events.push({
          id: log.id,
          timestampMs: tsMs,
          displayDate: formatContactDisplayDate(tsMs, log.sentAt),
          isoOrRaw: log.sentAt,
          channel: log.kind,
          channelLabel: 'WA Organisasi',
          phone: log.phone,
          actor: log.sentBy,
          detail: log.topicLabel || log.referenceNumber,
          messagePreview: log.messagePreview,
        });
      }
    });
  }

  if (org.lastContactedAt) {
    const tsMs = parseFlexibleTimestampMs(org.lastContactedAt);
    if (tsMs > 0) {
      events.push({
        id: `org-at-${org.id}`,
        timestampMs: tsMs,
        displayDate: formatContactDisplayDate(tsMs, org.lastContactedAt),
        isoOrRaw: org.lastContactedAt,
        channel: 'customer_direct',
        channelLabel: org.lastContactedChannel || 'WA Organisasi',
        phone: orgRawPhone || undefined,
        actor: org.lastContactedBy,
        detail: org.lastContactedNote || 'Kontak organisasi tersimpan',
      });
    }
  }

  if (org.lastContacted && org.lastContacted.trim() !== '-') {
    const tsMs = parseFlexibleTimestampMs(org.lastContacted);
    events.push({
      id: `org-legacy-${org.id}`,
      timestampMs: tsMs,
      displayDate:
        tsMs > 0 ? formatContactDisplayDate(tsMs, org.lastContacted) : org.lastContacted.trim(),
      isoOrRaw: org.lastContacted,
      channel: org.lastContactedChannel ? 'customer_direct' : 'legacy',
      channelLabel: org.lastContactedChannel || 'Riwayat Organisasi',
      phone: orgRawPhone || undefined,
      actor: org.lastContactedBy,
      detail: org.lastContactedNote || 'Catatan kontak organisasi',
    });
  }

  // 2. Cross-module matches for Organisasi (matching org id/name/phone)
  const crossEvents = collectContactEventsForPerson(
    {
      identitasId: org.id,
      nama: org.namaOrg,
      phoneNorm: normalizeWhatsappPhone(org.hp && org.hp !== '-' ? org.hp : ''),
    },
    null,
    sources
  );
  events.push(...crossEvents);

  // Deduplicate & sort newest-first
  const deduped: ContactTimelineEvent[] = [];
  const seenKeys = new Set<string>();
  events
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .forEach((ev) => {
      const minuteBucket = Math.floor(ev.timestampMs / 60000);
      const key = `${minuteBucket}:${ev.channel}:${normText(ev.detail)}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      deduped.push(ev);
    });

  const nonLegacy = deduped.filter((e) => e.channel !== 'legacy');
  const top = nonLegacy[0] || deduped[0];

  if (!top) {
    return {
      hasContactHistory: false,
      latestTimestampMs: 0,
      displayDate: '-',
      relativeLabel: '',
      channelLabel: 'Belum dikontak',
      isLiveChannel: false,
      phone: orgRawPhone || undefined,
      events: [],
    };
  }

  return {
    hasContactHistory: true,
    latestTimestampMs: top.timestampMs,
    displayDate: top.displayDate,
    relativeLabel: formatRelativeContactAge(top.timestampMs),
    channelLabel: top.channelLabel,
    actor: top.actor,
    phone: top.phone || orgRawPhone || undefined,
    detailSummary: top.detail,
    isLiveChannel: top.channel !== 'legacy',
    events: deduped,
  };
}
