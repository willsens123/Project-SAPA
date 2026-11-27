import { DonasiOrder } from '../donasiData';
import { FunnelingGroupCard, FunnelingMemberItem } from '../funnelingData';
import { IdentitasItem } from '../identitasData';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import {
  ComplaintItem,
  DharmaPatronRutinItem,
  ListPMItem,
  OrganisasiItem,
} from '../types';
import {
  formatContactDisplayDate,
  parseFlexibleTimestampMs,
  ResolvedLastContactedSummary,
  resolveLastContactedForIdentitas,
} from './lastContactedHelper';
import { normalizeWhatsappPhone } from './patronWhatsappHelper';

function normText(v?: string | null): string {
  return (v || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function extractCodePrefix(raw?: string): { codeId?: string; namePart?: string } {
  if (!raw || !raw.trim()) return {};
  const trimmed = raw.trim();
  const dashMatch = trimmed.match(/^([A-Za-z0-9-]+)\s+-\s+(.+)$/);
  if (dashMatch && /\d/.test(dashMatch[1])) {
    return { codeId: dashMatch[1].trim(), namePart: dashMatch[2].trim() };
  }
  const spaceMatch = trimmed.match(/^([A-Za-z0-9-]+)\s+(.+)$/);
  if (spaceMatch && /\d/.test(spaceMatch[1])) {
    return { codeId: spaceMatch[1].trim(), namePart: spaceMatch[2].trim() };
  }
  return { namePart: trimmed };
}

export function parseRupiahAmount(raw?: string | number): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (!raw) return 0;
  const cleaned = String(raw).replace(/[^\d-]/g, '');
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatRupiahAmount(amount: number): string {
  return `Rp${Math.round(amount || 0).toLocaleString('id-ID')}`;
}

interface PersonMatchKey {
  identitasId?: string;
  codeId?: string;
  nama?: string;
  phonesNorm: string[];
}

function buildPersonMatchKey(identity: IdentitasItem): PersonMatchKey {
  const phones: string[] = [];
  if (identity.nomorHandPhone && identity.nomorHandPhone !== '-') {
    const p = normalizeWhatsappPhone(identity.nomorHandPhone);
    if (p) phones.push(p);
  }
  (identity.alamatList || []).forEach((al) => {
    if (al.nomorHp && al.nomorHp !== '-') {
      const p = normalizeWhatsappPhone(al.nomorHp);
      if (p && !phones.includes(p)) phones.push(p);
    }
  });
  return {
    identitasId: identity.id,
    codeId: identity.codeId,
    nama: identity.namaLengkap,
    phonesNorm: phones,
  };
}

function matchesPerson(
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
  if (candidates.phone) {
    const candPhone = normalizeWhatsappPhone(candidates.phone);
    if (candPhone && person.phonesNorm.includes(candPhone)) {
      return true;
    }
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

export type CrossModuleTimelineCategory = 'pm' | 'komplain' | 'transaksi' | 'wa';

export interface CrossModuleProfileTimelineItem {
  id: string;
  category: CrossModuleTimelineCategory;
  timestampMs: number;
  displayDate: string;
  title: string;
  subtitle: string;
  moduleLabel: string;
  statusLabel: string;
  statusTone: 'teal' | 'amber' | 'rose' | 'slate';
  amountFormatted?: string;
  actor?: string;
  detail?: string;
}

export interface IdentitasCrossModuleSummary {
  grandTotalNominal: number;
  totalTransaksiCount: number;
  donasi: {
    count: number;
    totalNominal: number;
    paidNominal: number;
    unpaidNominal: number;
    items: DonasiOrder[];
  };
  salur: {
    count: number;
    totalQty: number;
    totalNominal: number;
    paidNominal: number;
    unpaidNominal: number;
    hadiahCount: number;
    items: SalurOrder[];
  };
  ajar: {
    count: number;
    totalNominal: number;
    items: TransaksiAjarItem[];
  };
  patron: {
    activeCount: number;
    pausedCount: number;
    totalBulanan: number;
    items: DharmaPatronRutinItem[];
  };
  pm: {
    totalEntries: number;
    sentCount: number;
    scheduledCount: number;
    matchedPlans: ListPMItem[];
  };
  komplain: {
    totalCount: number;
    openCount: number;
    diprosesCount: number;
    selesaiCount: number;
    items: ComplaintItem[];
  };
  linkedOrganisasi: OrganisasiItem[];
  lastContacted: ResolvedLastContactedSummary;
  timeline: CrossModuleProfileTimelineItem[];
}

export interface CrossModuleSummarySources {
  donasiOrders?: DonasiOrder[];
  salurOrders?: SalurOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  dharmaPatronList?: DharmaPatronRutinItem[];
  listPMList?: ListPMItem[];
  complaints?: ComplaintItem[];
  organisasiList?: OrganisasiItem[];
}

export function buildIdentitasCrossModuleSummary(
  identity: IdentitasItem,
  sources: CrossModuleSummarySources = {}
): IdentitasCrossModuleSummary {
  const person = buildPersonMatchKey(identity);
  const timeline: CrossModuleProfileTimelineItem[] = [];

  // 1. D-DONASI
  const matchedDonasi = (sources.donasiOrders || []).filter((ord) =>
    matchesPerson(person, {
      nama: ord.namaDonatur?.name,
      phone: ord.lastWhatsappSentPhone,
      rawTokens: [ord.customerId, ord.namaDonatur?.name],
    })
  );
  let donasiTotal = 0;
  let donasiPaid = 0;
  let donasiUnpaid = 0;
  matchedDonasi.forEach((ord) => {
    const amt = parseRupiahAmount(ord.totalDana);
    const isUnpaid = (ord.statusBadges || []).some((b) =>
      /belum|unpaid|pending/i.test(b)
    );
    donasiTotal += amt;
    if (isUnpaid) donasiUnpaid += amt;
    else donasiPaid += amt;

    const tsMs = parseFlexibleTimestampMs(ord.date);
    const itemNames = [...(ord.items || []), ...(ord.extraItems || [])]
      .map((i) => i.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(', ');
    timeline.push({
      id: `tx-donasi-${ord.id}`,
      category: 'transaksi',
      timestampMs: tsMs,
      displayDate: tsMs > 0 ? formatContactDisplayDate(tsMs, ord.date) : ord.date || '-',
      title: `${ord.orderNumber}${itemNames ? ` · ${itemNames}` : ''}`,
      subtitle: `${ord.via || 'Direct'} · Donatur: ${ord.namaDonatur?.name || identity.namaLengkap}`,
      moduleLabel: 'D-DONASI',
      statusLabel: isUnpaid ? 'Belum Lunas' : 'Paid',
      statusTone: isUnpaid ? 'amber' : 'teal',
      amountFormatted: amt > 0 ? formatRupiahAmount(amt) : ord.totalDana,
      detail: ord.keterangan?.title
        ? `${ord.keterangan.title}${ord.keterangan.subtitle ? ` (${ord.keterangan.subtitle})` : ''}`
        : undefined,
    });
  });

  // 2. S-SALUR
  const matchedSalur = (sources.salurOrders || []).filter((ord) =>
    matchesPerson(person, {
      nama: ord.alamat?.recipientName,
      phone: ord.lastWhatsappResiSentPhone || ord.alamat?.phone,
      rawTokens: [
        ord.idPembeli,
        ord.customerId,
        ord.idPenerima,
        ord.customerCode,
        ord.alamat?.recipientName,
      ],
    })
  );
  let salurTotal = 0;
  let salurPaid = 0;
  let salurUnpaid = 0;
  let salurQty = 0;
  let salurHadiahCount = 0;
  matchedSalur.forEach((ord) => {
    const itemsSum = (ord.items || []).reduce(
      (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
      0
    );
    const qtySum = (ord.items || []).reduce((s, it) => s + (Number(it.quantity) || 1), 0);
    const parsedTotal = parseRupiahAmount(ord.totalDana);
    const amt = ord.isHadiah ? 0 : parsedTotal > 0 ? parsedTotal : itemsSum;
    salurQty += qtySum;
    if (ord.isHadiah) {
      salurHadiahCount += 1;
    } else {
      salurTotal += amt;
      if (ord.paymentStatus === 'Paid') salurPaid += amt;
      else salurUnpaid += amt;
    }

    const tsMs = parseFlexibleTimestampMs(ord.date);
    const bookTitles = (ord.items || [])
      .map((i) => `${i.title} (${i.quantity}x)`)
      .slice(0, 2)
      .join(', ');
    timeline.push({
      id: `tx-salur-${ord.id}`,
      category: 'transaksi',
      timestampMs: tsMs,
      displayDate: tsMs > 0 ? formatContactDisplayDate(tsMs, ord.date) : ord.date || '-',
      title: `${ord.orderNumber}${bookTitles ? ` · ${bookTitles}` : ''}`,
      subtitle: `${ord.via || 'Direct'} · ${ord.ekspedisi?.name || 'Pengiriman'}${ord.ekspedisi?.noResi && ord.ekspedisi.noResi !== '-' ? ` · Resi ${ord.ekspedisi.noResi}` : ''}`,
      moduleLabel: ord.isHadiah ? 'S-SALUR (Hadiah)' : 'S-SALUR',
      statusLabel: ord.isHadiah
        ? 'Hadiah'
        : `${ord.paymentStatus} · ${ord.shippingStatus}`,
      statusTone: ord.isHadiah
        ? 'slate'
        : ord.paymentStatus === 'Paid'
        ? 'teal'
        : 'amber',
      amountFormatted: ord.isHadiah ? 'Hadiah (Rp0)' : formatRupiahAmount(amt),
      detail: ord.keterangan || ord.proyekSapa,
    });
  });

  // 3. A-AJAR
  const matchedAjar = (sources.transaksiAjarList || []).filter((ord) =>
    matchesPerson(person, {
      rawTokens: [
        ord.customerId,
        ...(ord.recipients || []),
        ...(ord.otherRecipients || []),
      ],
    })
  );
  let ajarTotal = 0;
  matchedAjar.forEach((ord) => {
    const amt = parseRupiahAmount(ord.totalDana);
    const isUnpaid = (ord.statusBadges || []).some((b) =>
      /belum|unpaid|pending/i.test(b)
    );
    ajarTotal += amt;
    const tsMs = parseFlexibleTimestampMs(ord.date);
    timeline.push({
      id: `tx-ajar-${ord.id}`,
      category: 'transaksi',
      timestampMs: tsMs,
      displayDate: tsMs > 0 ? formatContactDisplayDate(tsMs, ord.date) : ord.date || '-',
      title: `${ord.orderNumber} · ${ord.eventName}`,
      subtitle: `${ord.itemName} (${ord.qtyPrice})`,
      moduleLabel: 'A-AJAR',
      statusLabel: isUnpaid ? 'Belum Lunas' : 'Paid',
      statusTone: isUnpaid ? 'amber' : 'teal',
      amountFormatted: amt > 0 ? formatRupiahAmount(amt) : ord.totalDana,
      detail: ord.keterangan,
    });
  });

  // 4. Dharma Patron Rutin
  const matchedPatron = (sources.dharmaPatronList || []).filter((p) =>
    matchesPerson(person, {
      identitasId: p.identitasId,
      codeId: p.noDonatur,
      nama: p.namaDonatur,
      phone: p.lastWhatsappBilledPhone || p.nomorHp,
      rawTokens: [p.identitasId, p.noDonatur, p.namaDonatur],
    })
  );
  const patronActive = matchedPatron.filter((p) => (p.statusAktif ?? 'Aktif') === 'Aktif');
  const patronPaused = matchedPatron.filter((p) => p.statusAktif === 'Tidak Aktif');
  const patronBulanan = patronActive.reduce((s, p) => s + (Number(p.donasiPerbulan) || 0), 0);

  // 5. List PM
  const matchedPmPlans: ListPMItem[] = [];
  let pmTotalEntries = 0;
  let pmSentCount = 0;
  let pmScheduledCount = 0;
  const seenPmIds = new Set<string>();

  (sources.listPMList || []).forEach((pm) => {
    let planMatched = false;

    const matchingRows = (pm.detailRows || []).filter((row) =>
      matchesPerson(person, {
        identitasId: row.identitasId,
        codeId: row.codeId,
        nama: row.nama,
        phone: row.nomorHp,
      })
    );

    matchingRows.forEach((row) => {
      planMatched = true;
      pmTotalEntries += 1;
      const isDone = row.status === 'done_teal' || row.status === 'done_gray';
      if (isDone) pmSentCount += 1;
      else pmScheduledCount += 1;

      const rawDate =
        (row.sentAt && row.sentAt !== '-' ? row.sentAt : '') ||
        pm.tanggalMulaiPM ||
        pm.tanggalMulaiDihubungi ||
        (pm.deadline && pm.deadline !== '-' ? pm.deadline : '') ||
        pm.createdAt ||
        '';
      const tsMs = parseFlexibleTimestampMs(rawDate);
      timeline.push({
        id: `pm-row-${pm.id}-${row.id}`,
        category: 'pm',
        timestampMs: tsMs,
        displayDate: tsMs > 0 ? formatContactDisplayDate(tsMs, rawDate) : rawDate || '-',
        title: `${row.proyekSapa || pm.proyekSapa}${row.itemTitle ? ` · ${row.itemTitle}` : pm.itemTitle ? ` · ${pm.itemTitle}` : ''}`,
        subtitle: row.templateName || pm.templatePesan?.slice(0, 90) || 'Pesan Menyapa',
        moduleLabel: `List PM (${pm.tabType === 'rutin' ? 'Rutin' : 'Non-Rutin'})`,
        statusLabel: isDone ? 'Sudah Dikirim' : 'Terjadwal / Belum Dikirim',
        statusTone: isDone ? 'teal' : 'amber',
        actor: pm.dihubungiOleh,
        detail: row.templateContent || pm.templatePesan,
      });
    });

    if (matchingRows.length === 0) {
      const matchingRecs = (pm.recipients || []).filter((rec) =>
        matchesPerson(person, {
          identitasId: rec.identitasId,
          codeId: rec.codeId,
          nama: rec.nama,
          phone: rec.nomorHp,
        })
      );

      matchingRecs.forEach((rec) => {
        planMatched = true;
        pmTotalEntries += 1;
        if (rec.isSent) pmSentCount += 1;
        else pmScheduledCount += 1;

        const rawDate =
          (rec.sentAt && rec.sentAt !== '-' ? rec.sentAt : '') ||
          pm.tanggalMulaiPM ||
          pm.tanggalMulaiDihubungi ||
          (pm.deadline && pm.deadline !== '-' ? pm.deadline : '') ||
          pm.createdAt ||
          '';
        const tsMs = parseFlexibleTimestampMs(rawDate);
        timeline.push({
          id: `pm-rec-${pm.id}-${rec.id}`,
          category: 'pm',
          timestampMs: tsMs,
          displayDate: tsMs > 0 ? formatContactDisplayDate(tsMs, rawDate) : rawDate || '-',
          title: `${pm.proyekSapa}${pm.itemTitle ? ` · ${pm.itemTitle}` : ''}`,
          subtitle: pm.templatePesan?.slice(0, 90) || 'Pesan Menyapa',
          moduleLabel: `List PM (${pm.tabType === 'rutin' ? 'Rutin' : 'Non-Rutin'})`,
          statusLabel: rec.isSent ? 'Sudah Dikirim' : 'Terjadwal / Belum Dikirim',
          statusTone: rec.isSent ? 'teal' : 'amber',
          actor: pm.dihubungiOleh,
          detail: pm.templatePesan,
        });
      });

      if (matchingRecs.length === 0 && pm.singleTarget) {
        const singleMatch = matchesPerson(person, {
          identitasId: pm.singleTarget.identitasId,
          codeId: pm.singleTarget.codeId,
          nama: pm.singleTarget.nama,
          phone: pm.singleTarget.nomorHp,
        });
        if (singleMatch) {
          planMatched = true;
          pmTotalEntries += 1;
          const isDone = pm.progressPercent >= 100 || pm.statusBisaPM === 'sudah_dihubungi';
          if (isDone) pmSentCount += 1;
          else pmScheduledCount += 1;

          const rawDate =
            pm.tanggalMulaiPM ||
            pm.tanggalMulaiDihubungi ||
            (pm.deadline && pm.deadline !== '-' ? pm.deadline : '') ||
            pm.createdAt ||
            '';
          const tsMs = parseFlexibleTimestampMs(rawDate);
          timeline.push({
            id: `pm-single-${pm.id}`,
            category: 'pm',
            timestampMs: tsMs,
            displayDate: tsMs > 0 ? formatContactDisplayDate(tsMs, rawDate) : rawDate || '-',
            title: `${pm.proyekSapa}${pm.itemTitle ? ` · ${pm.itemTitle}` : ''}`,
            subtitle: pm.templatePesan?.slice(0, 90) || 'Pesan Menyapa',
            moduleLabel: `List PM (${pm.tabType === 'rutin' ? 'Rutin' : 'Non-Rutin'})`,
            statusLabel: isDone ? 'Sudah Dikirim' : 'Terjadwal / Belum Dikirim',
            statusTone: isDone ? 'teal' : 'amber',
            actor: pm.dihubungiOleh,
            detail: pm.templatePesan,
          });
        }
      }
    }

    if (planMatched && !seenPmIds.has(pm.id)) {
      seenPmIds.add(pm.id);
      matchedPmPlans.push(pm);
    }
  });

  // 6. Complaints
  const matchedComplaints = (sources.complaints || []).filter((c) =>
    matchesPerson(person, {
      identitasId: c.identitasId,
      codeId: c.kodeDonatur,
      nama: c.nama,
      rawTokens: [c.subNama],
    })
  );
  let openCount = 0;
  let diprosesCount = 0;
  let selesaiCount = 0;
  matchedComplaints.forEach((c) => {
    const st = c.status || 'Open';
    if (st === 'Selesai') selesaiCount += 1;
    else if (st === 'Diproses') diprosesCount += 1;
    else openCount += 1;

    const tsMs = parseFlexibleTimestampMs(c.tanggal);
    timeline.push({
      id: `complaint-${c.id}`,
      category: 'komplain',
      timestampMs: tsMs,
      displayDate: tsMs > 0 ? formatContactDisplayDate(tsMs, c.tanggal) : c.tanggal || '-',
      title: `Komplain: ${c.jenisKomplain}`,
      subtitle: c.komplain,
      moduleLabel: 'Komplain Pelanggan',
      statusLabel: st,
      statusTone: st === 'Selesai' ? 'teal' : st === 'Diproses' ? 'amber' : 'rose',
      detail: c.komplain,
    });
  });

  // 7. WA Direct Contact Events (non-PM duplicates excluded cleanly or tagged WA)
  const lastContacted = resolveLastContactedForIdentitas(identity, {
    listPMList: sources.listPMList,
    donasiOrders: sources.donasiOrders,
    salurOrders: sources.salurOrders,
    dharmaPatronList: sources.dharmaPatronList,
  });

  lastContacted.events.forEach((ev) => {
    if (ev.channel === 'list_pm') return; // already captured in PM timeline items above
    timeline.push({
      id: `wa-ev-${ev.id}`,
      category: 'wa',
      timestampMs: ev.timestampMs,
      displayDate: ev.displayDate,
      title: ev.channelLabel,
      subtitle: ev.detail || ev.phone || 'Riwayat kontak WhatsApp',
      moduleLabel: 'Kontak WhatsApp',
      statusLabel: ev.channel === 'legacy' ? 'Catatan Historis' : 'Terkirim',
      statusTone: ev.channel === 'legacy' ? 'slate' : 'teal',
      actor: ev.actor,
      detail: ev.messagePreview,
    } as CrossModuleProfileTimelineItem);
  });

  // 8. Linked Organisasi
  const orgTextNorm = normText(identity.organisasi);
  const linkedOrganisasi = (sources.organisasiList || []).filter((org) => {
    if (org.picOrgId && identity.id && normText(org.picOrgId) === normText(identity.id)) return true;
    if (org.picOrgCode && identity.codeId && normText(org.picOrgCode) === normText(identity.codeId)) return true;
    if (org.picOrgNama && normText(org.picOrgNama) === normText(identity.namaLengkap)) return true;
    if (org.pic && normText(org.pic) === normText(identity.namaLengkap)) return true;
    if (orgTextNorm && orgTextNorm !== '-' && normText(org.namaOrg) === orgTextNorm) return true;
    return false;
  });

  // Sort timeline newest-first
  timeline.sort((a, b) => b.timestampMs - a.timestampMs);

  return {
    grandTotalNominal: donasiTotal + salurTotal + ajarTotal,
    totalTransaksiCount: matchedDonasi.length + matchedSalur.length + matchedAjar.length,
    donasi: {
      count: matchedDonasi.length,
      totalNominal: donasiTotal,
      paidNominal: donasiPaid,
      unpaidNominal: donasiUnpaid,
      items: matchedDonasi,
    },
    salur: {
      count: matchedSalur.length,
      totalQty: salurQty,
      totalNominal: salurTotal,
      paidNominal: salurPaid,
      unpaidNominal: salurUnpaid,
      hadiahCount: salurHadiahCount,
      items: matchedSalur,
    },
    ajar: {
      count: matchedAjar.length,
      totalNominal: ajarTotal,
      items: matchedAjar,
    },
    patron: {
      activeCount: patronActive.length,
      pausedCount: patronPaused.length,
      totalBulanan: patronBulanan,
      items: matchedPatron,
    },
    pm: {
      totalEntries: pmTotalEntries,
      sentCount: pmSentCount,
      scheduledCount: pmScheduledCount,
      matchedPlans: matchedPmPlans,
    },
    komplain: {
      totalCount: matchedComplaints.length,
      openCount,
      diprosesCount,
      selesaiCount,
      items: matchedComplaints,
    },
    linkedOrganisasi,
    lastContacted,
    timeline,
  };
}

export interface BlacklistMatchEntry {
  id: string;
  entityType: 'Identitas' | 'Organisasi';
  code?: string;
  name: string;
  roleLabel?: string;
  pic?: string;
  keterangan?: string;
}

export function findBlacklistMatchesForTokens(
  tokens: Array<{ roleLabel?: string; values: Array<string | undefined | null> }>,
  identitasList: IdentitasItem[] = [],
  organisasiList: OrganisasiItem[] = []
): BlacklistMatchEntry[] {
  const results: BlacklistMatchEntry[] = [];
  const seen = new Set<string>();

  const blacklistIdentitas = identitasList.filter((i) => i.status === 'Blacklist');
  const blacklistOrganisasi = organisasiList.filter((o) => o.status === 'Blacklist');

  tokens.forEach(({ roleLabel, values }) => {
    const cleanValues = values.filter((v): v is string => Boolean(v && v.trim() && v.trim() !== '-' && normText(v) !== 'no name'));
    if (cleanValues.length === 0) return;

    blacklistIdentitas.forEach((idItem) => {
      const person = buildPersonMatchKey(idItem);
      const matched = cleanValues.some((val) => {
        const parsed = extractCodePrefix(val);
        return matchesPerson(person, {
          identitasId: val,
          codeId: parsed.codeId || val,
          nama: parsed.namePart || val,
          rawTokens: [val],
        });
      });
      if (matched) {
        const dedupKey = `identitas:${idItem.id}:${roleLabel || ''}`;
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          results.push({
            id: idItem.id,
            entityType: 'Identitas',
            code: idItem.codeId,
            name: idItem.namaLengkap,
            roleLabel,
            pic: idItem.pic && idItem.pic !== '-' ? idItem.pic : undefined,
            keterangan: idItem.keterangan && idItem.keterangan !== '-' ? idItem.keterangan : undefined,
          });
        }
      }
    });

    blacklistOrganisasi.forEach((org) => {
      const matched = cleanValues.some((val) => {
        const vNorm = normText(val);
        const parsed = extractCodePrefix(val);
        return (
          vNorm === normText(org.id) ||
          vNorm === normText(org.namaOrg) ||
          (org.picOrgCode && (vNorm === normText(org.picOrgCode) || normText(parsed.codeId) === normText(org.picOrgCode))) ||
          (parsed.namePart && normText(parsed.namePart) === normText(org.namaOrg))
        );
      });
      if (matched) {
        const dedupKey = `organisasi:${org.id}:${roleLabel || ''}`;
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          results.push({
            id: org.id,
            entityType: 'Organisasi',
            code: org.picOrgCode,
            name: org.namaOrg,
            roleLabel,
            pic: org.picOrgNama && org.picOrgNama !== '-' ? org.picOrgNama : org.pic,
            keterangan: org.catatan && org.catatan !== '-' ? org.catatan : undefined,
          });
        }
      }
    });
  });

  return results;
}

export function findBlacklistMembersInFunnelingGroup(
  group: FunnelingGroupCard | undefined,
  members: FunnelingMemberItem[] = [],
  identitasList: IdentitasItem[] = []
): BlacklistMatchEntry[] {
  if (!group) return [];
  const blacklistIdentitas = identitasList.filter((i) => i.status === 'Blacklist');
  if (blacklistIdentitas.length === 0) return [];

  const candidateIds = new Set<string>(
    (group.identitasIds || []).map((id) => normText(id)).filter(Boolean)
  );
  const candidateNames = new Set<string>();

  members.forEach((m) => {
    const inGroup =
      (m.groupNames && m.groupNames.includes(group.name)) ||
      (group.name === 'Group A' && m.groupA) ||
      (group.name === 'Group B' && m.groupB);
    if (inGroup) {
      if (m.identitasId) candidateIds.add(normText(m.identitasId));
      if (m.codeId) candidateIds.add(normText(m.codeId));
      if (m.id) candidateIds.add(normText(m.id));
      if (m.nama) candidateNames.add(normText(m.nama));
    }
  });

  return blacklistIdentitas
    .filter(
      (i) =>
        candidateIds.has(normText(i.id)) ||
        (i.codeId && candidateIds.has(normText(i.codeId))) ||
        (i.namaLengkap && candidateNames.has(normText(i.namaLengkap)))
    )
    .map((i) => ({
      id: i.id,
      entityType: 'Identitas' as const,
      code: i.codeId,
      name: i.namaLengkap,
      roleLabel: `Anggota ${group.name}`,
      pic: i.pic && i.pic !== '-' ? i.pic : undefined,
      keterangan: i.keterangan && i.keterangan !== '-' ? i.keterangan : undefined,
    }));
}
